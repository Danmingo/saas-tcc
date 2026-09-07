"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getAlunoContext } from "@/lib/aluno";

export type ProjetoAlunoFormState = {
  erro?: string;
  valores?: { titulo: string; tema: string; descricao: string };
};

type ResultadoAtualizacao = {
  motivo?: "atualizado" | "nao_autenticado" | "papel_invalido" | "sem_acesso" | "titulo_obrigatorio" | "projeto_inexistente";
};

const limites = { titulo: 200, tema: 300, descricao: 5000 } as const;

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