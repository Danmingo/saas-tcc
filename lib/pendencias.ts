import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import { getAlunoContext } from "@/lib/aluno";
import { getProfessorContext } from "@/lib/turmas";

export const PRIORIDADES = ["baixa", "media", "alta"] as const;
export type Prioridade = (typeof PRIORIDADES)[number];

export type Pendencia = {
  id: string; projeto_id: string; devolutiva_id: string | null; responsavel_id: string | null;
  descricao: string; prioridade: string; status: string; prazo: string | null;
  criado_em: string; resolvida_em: string | null;
  projeto?: { id: string; titulo: string; turma_id: string; turma_nome: string };
  responsavel?: string | null;
};

type Projeto = { id: string; turma_id: string; titulo: string };
type Pessoa = { id: string; nome: string | null };
type Contexto = { supabase: SupabaseClient; perfil: { id: string; papel: "aluno" | "professor" } };

export class PendenciaErro extends Error {
  constructor(message: string, public status = 400) { super(message); this.name = "PendenciaErro"; }
}

export function mensagemPendencia(error: unknown) {
  return error instanceof PendenciaErro ? error.message : "Não foi possível concluir a operação. Tente novamente.";
}

function uuidValido(value: unknown): value is string { return typeof value === "string" && /^[0-9a-fA-F-]{36}$/.test(value); }
function exigirUuid(value: unknown, mensagem = "Pendência ou projeto inválido."): asserts value is string { if (!uuidValido(value)) throw new PendenciaErro(mensagem, 404); }
function verificar(error: { code?: string; message?: string } | null, operacao: string) {
  if (!error) return;
  if (error.code === "42501" || /row.level security|permission denied|unauthorized/i.test(error.message ?? "")) {
    throw new PendenciaErro(`Operação bloqueada em public.pendencias — ${operacao}: ${error.message ?? "permissão negada"}. Policy provável: ${operacao} para o usuário autenticado e seus projetos/turmas.`, 403);
  }
  throw new PendenciaErro(`Não foi possível executar ${operacao} em public.pendencias.`, 503);
}

export async function contextoAluno(): Promise<Contexto> { const { supabase, aluno } = await getAlunoContext(); return { supabase, perfil: aluno }; }
export async function contextoProfessor(): Promise<Contexto> { const { supabase, professor } = await getProfessorContext(); return { supabase, perfil: professor }; }

async function projetosDoAluno(contexto: Contexto) {
  const { data, error } = await contexto.supabase.from("projeto_alunos").select("projeto_id").eq("aluno_id", contexto.perfil.id).returns<Array<{ projeto_id: string }>>();
  if (error) throw new PendenciaErro("Não foi possível carregar seus projetos.", 503);
  const ids = [...new Set((data ?? []).map((item) => item.projeto_id))];
  if (!ids.length) return [] as Projeto[];
  const resultado = await contexto.supabase.from("projetos").select("id,turma_id,titulo").in("id", ids).returns<Projeto[]>();
  if (resultado.error) throw new PendenciaErro("Não foi possível carregar seus projetos.", 503);
  return resultado.data ?? [];
}

async function projetoDoProfessor(contexto: Contexto, projetoId: string) {
  exigirUuid(projetoId, "Projeto não encontrado ou sem acesso.");
  const turmas = await contexto.supabase.from("turmas").select("id").eq("professor_id", contexto.perfil.id).returns<Array<{ id: string }>>();
  if (turmas.error) throw new PendenciaErro("Não foi possível validar as turmas do professor.", 503);
  const resultado = await contexto.supabase.from("projetos").select("id,turma_id,titulo").eq("id", projetoId).in("turma_id", (turmas.data ?? []).map((item) => item.id)).maybeSingle<Projeto>();
  if (resultado.error) throw new PendenciaErro("Não foi possível validar o projeto do professor.", 503);
  if (!resultado.data) throw new PendenciaErro("Projeto não encontrado ou sem acesso.", 404);
  return resultado.data;
}

export async function integrantesAutorizadosProjeto(contexto: Contexto, projetoId: string) {
  const projeto = contexto.perfil.papel === "professor" ? await projetoDoProfessor(contexto, projetoId) : (await projetosDoAluno(contexto)).find((item) => item.id === projetoId);
  if (!projeto) throw new PendenciaErro("Projeto não encontrado ou sem acesso.", 404);
  const vinculos = await contexto.supabase.from("projeto_alunos").select("aluno_id").eq("projeto_id", projeto.id).returns<Array<{ aluno_id: string }>>();
  if (vinculos.error) throw new PendenciaErro("Não foi possível carregar os integrantes do projeto.", 503);
  const ids = [...new Set((vinculos.data ?? []).map((item) => item.aluno_id))];
  if (!ids.length) return [] as Pessoa[];
  const pessoas = await contexto.supabase.from("usuarios").select("id,nome").in("id", ids).eq("papel", "aluno").returns<Pessoa[]>();
  if (pessoas.error) throw new PendenciaErro("Não foi possível carregar os nomes dos integrantes.", 503);
  return pessoas.data ?? [];
}

async function enriquecer(contexto: Contexto, pendencias: Pendencia[], projetos: Projeto[]) {
  if (!pendencias.length) return [];
  const turmaIds = [...new Set(projetos.map((item) => item.turma_id))];
  const turmaResult = await contexto.supabase.from("turmas").select("id,nome").in("id", turmaIds).returns<Array<{ id: string; nome: string }>>();
  const idsResponsaveis = [...new Set(pendencias.map((item) => item.responsavel_id).filter((id): id is string => Boolean(id)))];
  const pessoaResult = idsResponsaveis.length ? await contexto.supabase.from("usuarios").select("id,nome").in("id", idsResponsaveis).returns<Pessoa[]>() : { data: [], error: null };
  if (turmaResult.error || pessoaResult.error) throw new PendenciaErro("Não foi possível carregar os detalhes das pendências.", 503);
  const projetosMap = new Map(projetos.map((item) => [item.id, item]));
  const turmasMap = new Map((turmaResult.data ?? []).map((item) => [item.id, item.nome]));
  const pessoasMap = new Map((pessoaResult.data ?? []).map((item) => [item.id, item.nome || "Aluno sem nome"]));
  return pendencias.map((item) => { const projeto = projetosMap.get(item.projeto_id); return { ...item, projeto: projeto ? { ...projeto, turma_nome: turmasMap.get(projeto.turma_id) ?? "Turma não disponível" } : undefined, responsavel: item.responsavel_id ? pessoasMap.get(item.responsavel_id) ?? "Aluno sem nome" : null }; });
}

async function listar(contexto: Contexto, projetos: Projeto[]) {
  if (!projetos.length) return [];
  const resultado = await contexto.supabase.from("pendencias").select("id,projeto_id,devolutiva_id,responsavel_id,descricao,prioridade,status,prazo,criado_em,resolvida_em").in("projeto_id", projetos.map((item) => item.id)).order("status").order("prazo", { nullsFirst: false }).order("criado_em", { ascending: false }).returns<Pendencia[]>();
  verificar(resultado.error, "SELECT");
  return enriquecer(contexto, resultado.data ?? [], projetos);
}

export async function listarPendenciasAluno() { const contexto = await contextoAluno(); return listar(contexto, await projetosDoAluno(contexto)); }
export async function listarPendenciasProfessor(contexto: Contexto, projetoId: string) { const projeto = await projetoDoProfessor(contexto, projetoId); return listar(contexto, [projeto]); }

export async function criarPendenciaProfessor(contexto: Contexto, input: { projetoId: string; descricao: string; prioridade: string; prazo: string | null; responsavelId: string | null }) {
  if (contexto.perfil.papel !== "professor") throw new PendenciaErro("Você não tem acesso a esta operação.", 403);
  const projeto = await projetoDoProfessor(contexto, input.projetoId);
  if (!input.descricao.trim() || input.descricao.trim().length > 5000) throw new PendenciaErro("Informe uma descrição com até 5000 caracteres.");
  if (!(["baixa", "media", "alta"] as const).includes(input.prioridade as Prioridade)) throw new PendenciaErro("Selecione uma prioridade válida.");
  if (input.prazo !== null && !/^\d{4}-\d{2}-\d{2}$/.test(input.prazo)) throw new PendenciaErro("Informe um prazo válido.");
  const integrantes = await integrantesAutorizadosProjeto(contexto, projeto.id);
  if (input.responsavelId !== null && !integrantes.some((item) => item.id === input.responsavelId)) throw new PendenciaErro("O responsável precisa ser integrante do projeto.");
  const resultado = await contexto.supabase.from("pendencias").insert({ projeto_id: projeto.id, descricao: input.descricao.trim(), prioridade: input.prioridade, prazo: input.prazo, responsavel_id: input.responsavelId });
  verificar(resultado.error, "INSERT");
}

export async function marcarConcluidaAluno(contexto: Contexto, pendenciaId: string) {
  if (contexto.perfil.papel !== "aluno") throw new PendenciaErro("Você não tem acesso a esta operação.", 403);
  exigirUuid(pendenciaId, "Pendência não encontrada ou sem acesso.");
  const resultado = await contexto.supabase.rpc("concluir_pendencia_aluno", { pendencia_uuid: pendenciaId });
  if (resultado.error) {
    throw new PendenciaErro(`Não foi possível concluir a pendência pela RPC concluir_pendencia_aluno: ${resultado.error.message}`, 503);
  }
  const motivo = resultado.data && typeof resultado.data === "object" && !Array.isArray(resultado.data) && "motivo" in resultado.data
    ? resultado.data.motivo
    : null;
  const mensagens: Record<string, string> = {
    concluida: "Pendência marcada como concluída.",
    ja_concluida: "Esta pendência já estava concluída.",
    nao_autenticado: "Não foi possível validar sua sessão.",
    papel_invalido: "Apenas alunos podem concluir pendências.",
    pendencia_inexistente: "Pendência não encontrada.",
    sem_acesso: "Você não tem acesso a esta pendência.",
    nao_responsavel: "Você não é o responsável por esta pendência.",
  };
  if (motivo && mensagens[motivo]) {
    if (motivo === "concluida" || motivo === "ja_concluida") return;
    throw new PendenciaErro(mensagens[motivo], motivo === "nao_autenticado" || motivo === "papel_invalido" ? 403 : 404);
  }
  throw new PendenciaErro("Não foi possível concluir a pendência. Tente novamente.", 503);
}

export async function reabrirPendenciaProfessor(contexto: Contexto, projetoId: string, pendenciaId: string) {
  if (contexto.perfil.papel !== "professor") throw new PendenciaErro("Você não tem acesso a esta operação.", 403);
  const projeto = await projetoDoProfessor(contexto, projetoId); exigirUuid(pendenciaId, "Pendência não encontrada ou sem acesso.");
  const resultado = await contexto.supabase.from("pendencias").update({ status: "pendente", resolvida_em: null }).eq("id", pendenciaId).eq("projeto_id", projeto.id);
  verificar(resultado.error, "UPDATE");
}