import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import { getAlunoContext } from "@/lib/aluno";
import { getProfessorContext } from "@/lib/turmas";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth";
import { BUCKET_ARQUIVOS, pathValido, uuidValido, nomeSeguro, STATUS_VERSAO, TIPOS_DEVOLUTIVA } from "@/lib/arquivos";

export type PerfilEnvios = { id: string; papel: "aluno" | "professor" };
export type EnviosContext = { supabase: SupabaseClient; perfil: PerfilEnvios };
export class EnvioErro extends Error {
  constructor(message: string, public status = 400) { super(message); }
}
export function mensagemEnvio(error: unknown) {
  return error instanceof EnvioErro ? error.message : "Não foi possível concluir a operação. Tente novamente.";
}
export function verificarOperacao(error: { message: string; code?: string } | null, alvo: string, operacao: string) {
  if (!error) return;
  if (error.code === "42501" || /row.level security|permission denied|unauthorized/i.test(error.message)) {
    throw new EnvioErro(alvo + " — " + operacao + ": " + error.message +
      ". Policy provável: " + operacao + " para o usuário autenticado e seus projetos.", 403);
  }
  throw new EnvioErro("Não foi possível executar " + operacao + " em " + alvo + ".", 503);
}
export async function contextoAluno(): Promise<EnviosContext> {
  const { supabase, aluno } = await getAlunoContext();
  return { supabase, perfil: aluno };
}
export async function contextoProfessor(): Promise<EnviosContext> {
  const { supabase, professor } = await getProfessorContext();
  return { supabase, perfil: professor };
}
function exigirPapel(context: EnviosContext, papel: PerfilEnvios["papel"]) {
  if (context.perfil.papel !== papel) throw new EnvioErro("Você não tem acesso a esta operação.", 403);
}
function validarId(id: unknown) {
  if (!uuidValido(id)) throw new EnvioErro("Recurso não encontrado ou sem acesso.", 404);
}
export type ProjetoEnvio = { id: string; turma_id: string; titulo: string; tema: string | null };
export type TurmaEnvio = { id: string; nome: string; professor_id: string };
export type EntregaEnvio = { id: string; turma_id: string; titulo: string; descricao: string | null; prazo: string | null; ordem: number; status: string };
export type PessoaEnvio = { id: string; nome: string | null };
export async function projetoAutorizado(context: EnviosContext, projetoId: string): Promise<ProjetoEnvio> {
  validarId(projetoId);
  if (context.perfil.papel === "aluno") {
    const { data, error } = await context.supabase.from("projeto_alunos").select("projeto_id")
      .eq("projeto_id", projetoId).eq("aluno_id", context.perfil.id).maybeSingle();
    verificarOperacao(error, "public.projeto_alunos", "SELECT");
    if (!data) throw new EnvioErro("Projeto não encontrado ou sem acesso.", 404);
  }
  const { data: projeto, error } = await context.supabase.from("projetos").select("id,turma_id,titulo,tema")
    .eq("id", projetoId).maybeSingle<ProjetoEnvio>();
  verificarOperacao(error, "public.projetos", "SELECT");
  if (!projeto) throw new EnvioErro("Projeto não encontrado ou sem acesso.", 404);
  if (context.perfil.papel === "professor") {
    const { data: turma, error: turmaError } = await context.supabase.from("turmas").select("id")
      .eq("id", projeto.turma_id).eq("professor_id", context.perfil.id).maybeSingle();
    verificarOperacao(turmaError, "public.turmas", "SELECT");
    if (!turma) throw new EnvioErro("Projeto não encontrado ou sem acesso.", 404);
  }
  return projeto;
}
export async function validarEnvio(context: EnviosContext, projetoId: string, entregaId: string) {
  exigirPapel(context, "aluno");
  const projeto = await projetoAutorizado(context, projetoId);
  validarId(entregaId);
  const { data, error } = await context.supabase.from("entregas").select("id,turma_id,status")
    .eq("id", entregaId).eq("turma_id", projeto.turma_id).maybeSingle();
  verificarOperacao(error, "public.entregas", "SELECT");
  if (!data || data.status !== "ativa") throw new EnvioErro("Entrega encerrada ou indisponível para este projeto.", 403);
  return projeto;
}

export async function projetosPermitidos(context: EnviosContext): Promise<ProjetoEnvio[]> {
  let ids: string[];
  if (context.perfil.papel === "professor") {
    const { data, error } = await context.supabase.from("turmas").select("id").eq("professor_id", context.perfil.id);
    verificarOperacao(error, "public.turmas", "SELECT");
    ids = (data ?? []).map((t) => t.id);
  } else {
    const { data, error } = await context.supabase.from("projeto_alunos").select("projeto_id").eq("aluno_id", context.perfil.id);
    verificarOperacao(error, "public.projeto_alunos", "SELECT");
    ids = (data ?? []).map((v) => v.projeto_id);
  }
  if (!ids.length) return [];
  const { data, error } = await context.supabase.from("projetos").select("id,turma_id,titulo,tema")
    .in(context.perfil.papel === "professor" ? "turma_id" : "id", [...new Set(ids)])
    .order("criado_em", { ascending: false }).returns<ProjetoEnvio[]>();
  verificarOperacao(error, "public.projetos", "SELECT");
  return data ?? [];
}

export async function catalogoEnvios(context: EnviosContext) {
  const projetos = await projetosPermitidos(context);
  if (!projetos.length) return { projetos, turmas: [] as TurmaEnvio[], entregas: [] as EntregaEnvio[], integrantes: new Map<string, string>() };
  const projetoIds = projetos.map((p) => p.id);
  const turmaIds = [...new Set(projetos.map((p) => p.turma_id))];
  const [turmas, entregas, vinculos] = await Promise.all([
    context.supabase.from("turmas").select("id,nome,professor_id").in("id", turmaIds).order("nome").returns<TurmaEnvio[]>(),
    context.supabase.from("entregas").select("id,turma_id,titulo,descricao,prazo,ordem,status").in("turma_id", turmaIds)
      .order("ordem").order("prazo", { nullsFirst: false }).order("criado_em").returns<EntregaEnvio[]>(),
    context.supabase.from("projeto_alunos").select("projeto_id,aluno_id").in("projeto_id", projetoIds)
      .returns<{ projeto_id: string; aluno_id: string }[]>(),
  ]);
  verificarOperacao(turmas.error, "public.turmas", "SELECT");
  verificarOperacao(entregas.error, "public.entregas", "SELECT");
  verificarOperacao(vinculos.error, "public.projeto_alunos", "SELECT");
  const pessoas = await nomesUsuarios(context, (vinculos.data ?? []).map((v) => v.aluno_id));
  const integrantes = new Map(projetos.map((p) => [p.id, (vinculos.data ?? []).filter((v) => v.projeto_id === p.id)
    .map((v) => pessoas.get(v.aluno_id) || "Integrante sem nome disponível").join(" + ") || "Integrantes não disponíveis"]));
  return { projetos, turmas: turmas.data ?? [], entregas: entregas.data ?? [], integrantes };
}
async function nomesUsuarios(context: EnviosContext, ids: string[]) {
  if (!ids.length) return new Map<string, string>();
  const { data, error } = await context.supabase.from("usuarios").select("id,nome").in("id", [...new Set(ids)]).returns<PessoaEnvio[]>();
  verificarOperacao(error, "public.usuarios", "SELECT");
  return new Map((data ?? []).map((p) => [p.id, p.nome ?? ""]));
}

