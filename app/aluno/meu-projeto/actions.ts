"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getAlunoContext } from "@/lib/aluno";
import { normalizarPalavrasChave } from "@/lib/contexto-academico";

export type ContextoAcademicoFormState = {
  erro?: string;
  sucesso?: boolean;
};

export async function atualizarContextoAcademicoProjetoAluno(
  projetoUuid: string,
  _estadoAnterior: ContextoAcademicoFormState,
  formData: FormData,
): Promise<ContextoAcademicoFormState> {
  const { supabase, aluno } = await getAlunoContext();
  if (typeof projetoUuid !== "string" || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(projetoUuid)) {
    return { erro: "Projeto não encontrado ou sem acesso." };
  }

  const grandeArea = textoForm(formData, "grande_area");
  const curso = textoForm(formData, "curso");
  const subarea = textoForm(formData, "subarea");
  const linhaPesquisa = textoForm(formData, "linha_pesquisa");
  const tipoTrabalho = textoForm(formData, "tipo_trabalho");
  const palavrasTexto = textoForm(formData, "palavras_chave");
  if (grandeArea === null || curso === null || subarea === null || linhaPesquisa === null || tipoTrabalho === null || palavrasTexto === null) {
    return { erro: "Informe valores válidos nos campos do contexto acadêmico." };
  }
  if (!grandeArea) return { erro: "Informe a grande área." };
  if (!curso) return { erro: "Informe o curso." };
  const palavrasChave = normalizarPalavrasChave(palavrasTexto);
  if (palavrasChave.length > 12) return { erro: "Informe no máximo 12 palavras-chave." };

  try {
    // Qualquer integrante pode editar; a identidade vem somente da sessão.
    const { data: vinculo, error: vinculoError } = await supabase.from("projeto_alunos")
      .select("projeto_id").eq("projeto_id", projetoUuid).eq("aluno_id", aluno.id)
      .maybeSingle<{ projeto_id: string }>();
    if (vinculoError) return { erro: "Não foi possível verificar sua participação no projeto. Tente novamente." };
    if (!vinculo) return { erro: "Projeto não encontrado ou sem acesso." };

    const { data, error } = await supabase.rpc("atualizar_contexto_academico_projeto_aluno", {
      projeto_uuid: projetoUuid,
      grande_area_texto: grandeArea,
      curso_texto: curso,
      subarea_texto: subarea || null,
      linha_pesquisa_texto: linhaPesquisa || null,
      tipo_trabalho_texto: tipoTrabalho || null,
      palavras_chave_texto: palavrasChave,
    });
    if (error) return { erro: "Não foi possível salvar o contexto acadêmico. Tente novamente." };

    const resultado = (Array.isArray(data) ? data[0] : data) as { motivo?: string } | null;
    switch (resultado?.motivo) {
      case "atualizado": break;
      case "grande_area_obrigatoria": return { erro: "Informe a grande área." };
      case "curso_obrigatorio": return { erro: "Informe o curso." };
      case "muitas_palavras_chave": return { erro: "Informe no máximo 12 palavras-chave." };
      case "palavra_chave_muito_longa": return { erro: "Uma palavra-chave está muito longa. Reduza seu tamanho e tente novamente." };
      case "campo_muito_longo": return { erro: "Um dos campos está muito longo. Reduza o texto e tente novamente." };
      case "sem_acesso":
      case "projeto_inexistente": return { erro: "Projeto não encontrado ou sem acesso." };
      case "nao_autenticado":
      case "papel_invalido": return { erro: "Não foi possível validar seu acesso. Entre novamente como aluno." };
      default: return { erro: "Não foi possível confirmar a atualização do contexto acadêmico. Tente novamente." };
    }
  } catch {
    return { erro: "Não foi possível confirmar a atualização do contexto acadêmico. Tente novamente." };
  }

  revalidatePath("/aluno/meu-projeto");
  revalidatePath(`/professor/projetos/${projetoUuid}`);
  return { sucesso: true };
}

export type ProjetoAlunoFormState = {
  erro?: string;
  valores?: { titulo: string; tema: string; descricao: string };
};

type ResultadoAtualizacao = {
  motivo?: "atualizado" | "nao_autenticado" | "papel_invalido" | "sem_acesso" | "titulo_obrigatorio" | "projeto_inexistente";
};

type ResultadoCriacao = {
  motivo?: "criado" | "nao_autenticado" | "papel_invalido" | "titulo_obrigatorio" | "sem_acesso_turma" | "integrante_invalido" | "integrante_ja_tem_projeto";
  projeto_id?: string;
};

const limites = { titulo: 200, tema: 300, descricao: 5000 } as const;

function textoForm(formData: FormData, nome: string) {
  const valor = formData.get(nome);
  if (valor !== null && typeof valor !== "string") return null;
  return (valor ?? "").trim();
}

function uuidValido(valor: string) {
  return /^[0-9a-fA-F-]{36}$/.test(valor);
}

export async function criarProjetoAluno(
  _estadoAnterior: ProjetoAlunoFormState,
  formData: FormData,
): Promise<ProjetoAlunoFormState> {
  const { supabase, aluno } = await getAlunoContext();
  const turmaUuid = textoForm(formData, "turma_uuid");
  const titulo = textoForm(formData, "titulo");
  const tema = textoForm(formData, "tema");
  const descricao = textoForm(formData, "descricao");
  const integranteIds = [...new Set(formData.getAll("integrante_id"))];

  if (turmaUuid === null || titulo === null || tema === null || descricao === null ||
      integranteIds.some((id) => typeof id !== "string")) {
    return { erro: "Informe valores válidos." };
  }
  if (!uuidValido(turmaUuid)) return { erro: "Selecione uma turma válida." };
  if (!titulo) return { erro: "Informe o título do projeto." };
  if (titulo.length > limites.titulo || tema.length > limites.tema || descricao.length > limites.descricao) {
    return { erro: "Revise o tamanho dos campos informados." };
  }

  const colegas = integranteIds.filter((id): id is string => id !== aluno.id);
  if (colegas.some((id) => !uuidValido(id))) return { erro: "Selecione integrantes válidos." };

  try {
    const { data: vinculo, error: vinculoError } = await supabase
      .from("turma_alunos")
      .select("turma_id")
      .eq("turma_id", turmaUuid)
      .eq("aluno_id", aluno.id)
      .maybeSingle<{ turma_id: string }>();

    if (vinculoError || !vinculo) return { erro: "Você não participa da turma selecionada." };

    const { data, error } = await supabase.rpc("criar_projeto_aluno", {
      turma_uuid: turmaUuid,
      titulo_texto: titulo,
      tema_texto: tema,
      descricao_texto: descricao,
      integrante_ids: colegas,
    });

    if (error) return { erro: "Não foi possível criar o projeto. Tente novamente." };

    const resultado = data as ResultadoCriacao | null;
    switch (resultado?.motivo) {
      case "criado":
        if (resultado.projeto_id) {
          revalidatePath("/aluno/meu-projeto");
          redirect("/aluno/meu-projeto?criado=1");
        }
        return { erro: "O projeto foi criado, mas não foi possível localizar seu identificador." };
      case "titulo_obrigatorio":
        return { erro: "Informe o título do projeto." };
      case "sem_acesso_turma":
        return { erro: "Você não participa da turma selecionada." };
      case "integrante_invalido":
        return { erro: "Selecione somente colegas da turma selecionada." };
      case "integrante_ja_tem_projeto":
        return { erro: "Um dos integrantes já possui um projeto nesta turma." };
      case "nao_autenticado":
      case "papel_invalido":
        return { erro: "Não foi possível validar seu acesso. Tente novamente." };
      default:
        return { erro: "Não foi possível criar o projeto. Tente novamente." };
    }
  } catch {
    return { erro: "Não foi possível confirmar a criação do projeto. Tente novamente." };
  }
}

export async function atualizarConteudoProjetoAluno(
  projetoUuid: string,
  _estadoAnterior: ProjetoAlunoFormState,
  formData: FormData,
): Promise<ProjetoAlunoFormState> {
  const { supabase } = await getAlunoContext();
  const valoresBrutos = {
    titulo: formData.get("titulo"),
    tema: formData.get("tema"),
    descricao: formData.get("descricao"),
  };

  if ((valoresBrutos.titulo !== null && typeof valoresBrutos.titulo !== "string") ||
      (valoresBrutos.tema !== null && typeof valoresBrutos.tema !== "string") ||
      (valoresBrutos.descricao !== null && typeof valoresBrutos.descricao !== "string")) {
    return { erro: "Informe valores válidos.", valores: { titulo: "", tema: "", descricao: "" } };
  }

  const valores = {
    titulo: (valoresBrutos.titulo ?? "").trim(),
    tema: (valoresBrutos.tema ?? "").trim(),
    descricao: (valoresBrutos.descricao ?? "").trim(),
  };

  if (!/^[0-9a-fA-F-]{36}$/.test(projetoUuid)) return { erro: "Projeto não encontrado ou sem acesso.", valores };
  if (!valores.titulo) return { erro: "Informe o título do projeto.", valores };
  if (valores.titulo.length > limites.titulo || valores.tema.length > limites.tema || valores.descricao.length > limites.descricao) {
    return { erro: "Revise o tamanho dos campos informados.", valores };
  }

  try {
    const { data, error } = await supabase.rpc("atualizar_conteudo_projeto_aluno", {
      projeto_uuid: projetoUuid,
      titulo_texto: valores.titulo,
      tema_texto: valores.tema,
      descricao_texto: valores.descricao,
    });

    if (error) return { erro: "Não foi possível salvar as informações do projeto. Tente novamente.", valores };

    const resultado = data as ResultadoAtualizacao | null;
    switch (resultado?.motivo) {
      case "atualizado":
        break;
      case "titulo_obrigatorio":
        return { erro: "Informe o título do projeto.", valores };
      case "sem_acesso":
      case "projeto_inexistente":
        return { erro: "Projeto não encontrado ou sem acesso.", valores };
      case "nao_autenticado":
      case "papel_invalido":
        return { erro: "Não foi possível validar seu acesso. Tente novamente.", valores };
      default:
        return { erro: "Não foi possível salvar as informações do projeto. Tente novamente.", valores };
    }
  } catch {
    return { erro: "Não foi possível confirmar a atualização. Tente novamente.", valores };
  }

  revalidatePath("/aluno/meu-projeto");
  redirect("/aluno/meu-projeto?atualizado=1");
}
