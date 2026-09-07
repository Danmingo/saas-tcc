import "server-only";

import type { ProjetoValores } from "@/app/professor/projetos/form-config";
import {
  alunosDaTurma, erroOperacao, mensagemProjetoErro, projetoDoProfessor,
  ProjetoErro, turmaDoProfessor, vinculosDoProjeto, type ProfessorContext, type VinculoProjeto,
} from "@/lib/projetos";

export class ProjetoGravacaoErro extends ProjetoErro {
  constructor(message: string, public projetoPendenteId?: string) {
    super(message);
  }
}

async function validarIntegrantes(context: ProfessorContext, turmaId: string, ids: string[]) {
  const alunos = await alunosDaTurma(context, turmaId);
  const permitidos = new Set(alunos.map((aluno) => aluno.id));
  if (!ids.length || ids.some((id) => !permitidos.has(id))) {
    throw new ProjetoErro("Selecione somente alunos já vinculados à turma escolhida.");
  }
}

function camposAdministrativos(valores: ProjetoValores) {
  return {
    data_inicio: valores.data_inicio || null,
    prazo_final: valores.prazo_final || null,
  };
}

function camposConteudoInicial() {
  return {
    titulo: "Projeto sem título",
    tema: null,
    descricao: null,
  };
}

async function adicionarIntegrantes(context: ProfessorContext, projetoId: string, ids: string[]) {
  if (!ids.length) return;
  const { data, error } = await context.supabase.from("projeto_alunos")
    .insert(ids.map((aluno_id) => ({ projeto_id: projetoId, aluno_id })))
    .select("id,aluno_id").returns<{ id: string; aluno_id: string }[]>();
  erroOperacao(error, "INSERT em public.projeto_alunos");
  if (data?.length !== ids.length) {
    throw new ProjetoErro("INSERT em public.projeto_alunos não confirmou todos os vínculos. Verifique as permissões INSERT e SELECT.");
  }
}

async function desfazerCadastro(context: ProfessorContext, projetoId: string, turmaId: string) {
  // Limita a compensação ao projeto recém-criado e revalida a propriedade.
  const projeto = await projetoDoProfessor(context, projetoId);
  if (projeto.turma_id !== turmaId) throw new ProjetoErro("Não foi possível confirmar a propriedade do cadastro.");
  const { error: vinculosError } = await context.supabase.from("projeto_alunos")
    .delete().eq("projeto_id", projeto.id);
  erroOperacao(vinculosError, "DELETE em public.projeto_alunos (recuperação do cadastro)");
  const { data, error } = await context.supabase.from("projetos").delete()
    .eq("id", projeto.id).eq("turma_id", turmaId).select("id").maybeSingle<{ id: string }>();
  erroOperacao(error, "DELETE em public.projetos (recuperação do cadastro)");
  if (!data) throw new ProjetoErro("DELETE em public.projetos não confirmou a recuperação. Verifique a policy de exclusão.");
}

export async function criarProjetoValidado(context: ProfessorContext, valores: ProjetoValores) {
  const turma = await turmaDoProfessor(context, valores.turma_id);
  await validarIntegrantes(context, turma.id, valores.alunos);
  const { data, error } = await context.supabase.from("projetos")
    .insert({ ...camposConteudoInicial(), ...camposAdministrativos(valores), turma_id: turma.id, status: "rascunho" })
    .select("id").single<{ id: string }>();
  erroOperacao(error, "INSERT em public.projetos");
  if (!data) throw new ProjetoErro("O cadastro não foi confirmado. Consulte a lista antes de tentar novamente.");
  try {
    await adicionarIntegrantes(context, data.id, valores.alunos);
  } catch (vinculoError) {
    let recuperacaoError: unknown;
    try {
      await desfazerCadastro(context, data.id, turma.id);
    } catch (error) {
      recuperacaoError = error;
    }
    if (recuperacaoError) {
      throw new ProjetoGravacaoErro(
        mensagemProjetoErro(vinculoError) + " O projeto foi criado, mas a recuperação falhou: " +
        mensagemProjetoErro(recuperacaoError) + " Abra o projeto para revisar antes de tentar outro cadastro.",
        data.id,
      );
    }
    throw new ProjetoGravacaoErro(mensagemProjetoErro(vinculoError) + " O cadastro incompleto foi desfeito.");
  }
  return data.id;
}

async function removerIntegrantes(context: ProfessorContext, projetoId: string, vinculos: VinculoProjeto[]) {
  if (!vinculos.length) return;
  const { data, error } = await context.supabase.from("projeto_alunos").delete()
    .eq("projeto_id", projetoId).in("id", vinculos.map((item) => item.id))
    .select("id").returns<{ id: string }[]>();
  erroOperacao(error, "DELETE em public.projeto_alunos");
  if (data?.length !== vinculos.length) {
    throw new ProjetoErro("DELETE em public.projeto_alunos não confirmou todas as remoções. Recarregue e verifique a policy de exclusão.");
  }
}

export async function atualizarProjetoValidado(
  context: ProfessorContext, projetoId: string, valores: ProjetoValores, versao: string,
) {
  const projeto = await projetoDoProfessor(context, projetoId);
  if (valores.turma_id !== projeto.turma_id) throw new ProjetoErro("Não é permitido trocar a turma do projeto.");
  if (versao !== (projeto.atualizado_em ?? "")) {
    throw new ProjetoErro("Este projeto foi atualizado em outra sessão. Recarregue antes de salvar.");
  }
  await validarIntegrantes(context, projeto.turma_id, valores.alunos);
  const anteriores = await vinculosDoProjeto(context, projeto.id);
  const existentes = new Set(anteriores.map((item) => item.aluno_id));
  const selecionados = new Set(valores.alunos);
  const adicionar = valores.alunos.filter((id) => !existentes.has(id));
  const remover = anteriores.filter((item) => !selecionados.has(item.aluno_id));

  let query = context.supabase.from("projetos")
    .update({ ...camposAdministrativos(valores), status: valores.status, atualizado_em: new Date().toISOString() })
    .eq("id", projeto.id).eq("turma_id", projeto.turma_id);
  query = projeto.atualizado_em ? query.eq("atualizado_em", projeto.atualizado_em) : query.is("atualizado_em", null);
  const { data, error } = await query.select("id,atualizado_em")
    .maybeSingle<{ id: string; atualizado_em: string | null }>();
  erroOperacao(error, "UPDATE em public.projetos");
  if (!data) throw new ProjetoErro("A atualização não foi confirmada. O projeto pode ter mudado ou a policy UPDATE pode ter bloqueado a operação.");

  try {
    // Adiciona antes de remover, para não esvaziar um grupo ao substituir integrantes.
    await adicionarIntegrantes(context, projeto.id, adicionar);
    if (remover.length) {
      const atual = await projetoDoProfessor(context, projeto.id);
      if (atual.atualizado_em !== data.atualizado_em) {
        throw new ProjetoErro("Outra sessão atualizou o projeto durante o salvamento.");
      }
      await removerIntegrantes(context, projeto.id, remover);
    }
  } catch (error) {
    throw new ProjetoGravacaoErro(
      "Os dados do projeto foram salvos, mas os integrantes podem estar parcialmente atualizados. " +
      mensagemProjetoErro(error) + " Reabra a edição para conferir o grupo antes de salvar novamente.",
      projeto.id,
    );
  }
  return projeto.id;
}
