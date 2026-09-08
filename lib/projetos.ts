import "server-only";

import { getProfessorContext } from "@/lib/turmas";
import { idValido } from "@/app/professor/projetos/form-config";
import type { ContextoAcademicoProjeto } from "@/lib/contexto-academico";

export type ProfessorContext = Awaited<ReturnType<typeof getProfessorContext>>;
export type TurmaProjeto = { id: string; nome: string };
export type AlunoProjeto = { id: string; nome: string | null };
export type VinculoProjeto = { id: string; projeto_id: string; aluno_id: string };
export type Projeto = ContextoAcademicoProjeto & {
  id: string; turma_id: string; titulo: string; tema: string | null; descricao: string | null;
  status: string; data_inicio: string | null; prazo_final: string | null;
  criado_em: string; atualizado_em: string | null;
};
export type ProjetoDetalhes = Projeto & { turma: TurmaProjeto; integrantes: AlunoProjeto[] };

const CAMPOS = "id,turma_id,titulo,tema,descricao,status,data_inicio,prazo_final,criado_em,atualizado_em,grande_area,curso,subarea,linha_pesquisa,tipo_trabalho,palavras_chave";

export class ProjetoErro extends Error {
  constructor(message: string, public status = 400) {
    super(message);
    this.name = "ProjetoErro";
  }
}

export function erroOperacao(error: { code?: string } | null, operacao: string) {
  if (!error) return;
  if (error.code === "42501" || error.code === "PGRST301" || error.code === "PGRST302") {
    throw new ProjetoErro(
      "Operação bloqueada: " + operacao + ". Verifique as permissões e a policy dessa operação para o professor autenticado.",
      403,
    );
  }
  throw new ProjetoErro("Não foi possível executar " + operacao + ". Tente novamente.", 503);
}

export function mensagemProjetoErro(error: unknown) {
  return error instanceof ProjetoErro ? error.message : "Não foi possível concluir a operação. Recarregue a página e tente novamente.";
}

export async function turmasDoProfessor({ supabase, professor }: ProfessorContext) {
  const { data, error } = await supabase.from("turmas").select("id,nome")
    .eq("professor_id", professor.id).order("nome").returns<TurmaProjeto[]>();
  erroOperacao(error, "SELECT em public.turmas");
  return data ?? [];
}

export async function turmaDoProfessor(context: ProfessorContext, id: string) {
  if (!idValido(id)) throw new ProjetoErro("Turma não encontrada ou sem acesso.", 404);
  const { data, error } = await context.supabase.from("turmas").select("id,nome")
    .eq("id", id).eq("professor_id", context.professor.id).maybeSingle<TurmaProjeto>();
  erroOperacao(error, "SELECT em public.turmas");
  if (!data) throw new ProjetoErro("Turma não encontrada ou sem acesso.", 404);
  return data;
}

export async function alunosDaTurma(context: ProfessorContext, turmaId: string) {
  await turmaDoProfessor(context, turmaId);
  const { data: vinculos, error } = await context.supabase.from("turma_alunos")
    .select("aluno_id").eq("turma_id", turmaId).returns<{ aluno_id: string }[]>();
  erroOperacao(error, "SELECT em public.turma_alunos");
  const ids = [...new Set((vinculos ?? []).map((item) => item.aluno_id))];
  if (!ids.length) return [];
  const { data, error: perfisError } = await context.supabase.from("usuarios")
    .select("id,nome").in("id", ids).eq("papel", "aluno").order("nome").returns<AlunoProjeto[]>();
  erroOperacao(perfisError, "SELECT em public.usuarios");
  if ((data ?? []).length !== ids.length) {
    throw new ProjetoErro("Nem todos os perfis dos alunos estão disponíveis. Verifique o vínculo e a permissão SELECT em public.usuarios.", 403);
  }
  return data ?? [];
}

export async function listarProjetos(context: ProfessorContext) {
  const turmas = await turmasDoProfessor(context);
  if (!turmas.length) return [];
  const { data, error } = await context.supabase.from("projetos").select(CAMPOS)
    .in("turma_id", turmas.map((turma) => turma.id)).order("criado_em", { ascending: false })
    .returns<Projeto[]>();
  erroOperacao(error, "SELECT em public.projetos");
  return (data ?? []).map((projeto) => ({
    ...projeto, turma: turmas.find((turma) => turma.id === projeto.turma_id)!,
  }));
}

export async function projetoDoProfessor(context: ProfessorContext, id: string) {
  if (!idValido(id)) throw new ProjetoErro("Projeto não encontrado ou sem acesso.", 404);
  const turmas = await turmasDoProfessor(context);
  if (!turmas.length) throw new ProjetoErro("Projeto não encontrado ou sem acesso.", 404);
  const { data, error } = await context.supabase.from("projetos").select(CAMPOS).eq("id", id)
    .in("turma_id", turmas.map((turma) => turma.id)).maybeSingle<Projeto>();
  if (error?.code === "22P02") throw new ProjetoErro("Projeto não encontrado ou sem acesso.", 404);
  erroOperacao(error, "SELECT em public.projetos");
  if (!data) throw new ProjetoErro("Projeto não encontrado ou sem acesso.", 404);
  return { ...data, turma: turmas.find((turma) => turma.id === data.turma_id)! };
}

export async function vinculosDoProjeto(context: ProfessorContext, projetoId: string) {
  // Chamado somente após projetoDoProfessor ou após criar um projeto da própria turma.
  const { data, error } = await context.supabase.from("projeto_alunos")
    .select("id,projeto_id,aluno_id").eq("projeto_id", projetoId).returns<VinculoProjeto[]>();
  erroOperacao(error, "SELECT em public.projeto_alunos");
  return data ?? [];
}

export async function detalhesProjeto(context: ProfessorContext, id: string): Promise<ProjetoDetalhes> {
  const projeto = await projetoDoProfessor(context, id);
  const vinculos = await vinculosDoProjeto(context, projeto.id);
  if (!vinculos.length) return { ...projeto, integrantes: [] };
  const ids = [...new Set(vinculos.map((item) => item.aluno_id))];
  const { data, error } = await context.supabase.from("usuarios").select("id,nome").in("id", ids)
    .returns<AlunoProjeto[]>();
  erroOperacao(error, "SELECT em public.usuarios");
  if ((data ?? []).length !== ids.length) {
    throw new ProjetoErro("Não foi possível consultar todos os integrantes. Verifique a permissão SELECT em public.usuarios.", 403);
  }
  return { ...projeto, integrantes: data ?? [] };
}
