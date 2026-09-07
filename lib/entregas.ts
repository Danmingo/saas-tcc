import "server-only";

import { idValido } from "@/app/professor/projetos/form-config";
import { validarEntrega } from "@/app/professor/turmas/[id]/entregas/form-config";
import { erroOperacao, ProjetoErro, type ProfessorContext } from "@/lib/projetos";
import { turmaDoProfessor } from "@/lib/projetos";

export type Entrega = {
  id: string; turma_id: string; titulo: string; descricao: string | null;
  prazo: string | null; ordem: number; status: "ativa" | "encerrada";
  criado_por: string; criado_em: string; atualizado_em: string | null;
};
const CAMPOS = "id,turma_id,titulo,descricao,prazo,ordem,status,criado_por,criado_em,atualizado_em";

export async function listarEntregas(context: ProfessorContext, turmaId: string) {
  const turma = await turmaDoProfessor(context, turmaId);
  const { data, error } = await context.supabase.from("entregas").select(CAMPOS)
    .eq("turma_id", turma.id)
    .order("ordem", { ascending: true })
    .order("prazo", { ascending: true, nullsFirst: false })
    .order("criado_em", { ascending: true })
    .order("id", { ascending: true }).returns<Entrega[]>();
  erroOperacao(error, "SELECT em public.entregas");
  return data ?? [];
}

export async function buscarEntrega(context: ProfessorContext, turmaId: string, entregaId: string) {
  const turma = await turmaDoProfessor(context, turmaId);
  if (!idValido(entregaId)) throw new ProjetoErro("Entrega não encontrada ou sem acesso.", 404);
  const { data, error } = await context.supabase.from("entregas").select(CAMPOS)
    .eq("id", entregaId).eq("turma_id", turma.id).maybeSingle<Entrega>();
  if (error?.code === "22P02") throw new ProjetoErro("Entrega não encontrada ou sem acesso.", 404);
  erroOperacao(error, "SELECT em public.entregas");
  if (!data) throw new ProjetoErro("Entrega não encontrada ou sem acesso.", 404);
  return data;
}

export async function criarEntregaValidada(context: ProfessorContext, turmaId: string, form: FormData) {
  const turma = await turmaDoProfessor(context, turmaId);
  const campos = validarEntrega(form, false);
  const { data, error } = await context.supabase.from("entregas")
    .insert({ ...campos, turma_id: turma.id, criado_por: context.professor.id, status: "ativa" })
    .select("id").single<{ id: string }>();
  erroOperacao(error, "INSERT em public.entregas");
  if (!data) throw new ProjetoErro("A criação da entrega não foi confirmada. Consulte o cronograma antes de tentar novamente.");
}

export async function atualizarEntregaValidada(
  context: ProfessorContext, turmaId: string, entregaId: string, form: FormData,
) {
  const entrega = await buscarEntrega(context, turmaId, entregaId);
  const campos = validarEntrega(form, true);
  const { data, error } = await context.supabase.from("entregas")
    .update({ ...campos, atualizado_em: new Date().toISOString() })
    .eq("id", entrega.id).eq("turma_id", entrega.turma_id)
    .select("id").maybeSingle<{ id: string }>();
  erroOperacao(error, "UPDATE em public.entregas");
  if (!data) throw new ProjetoErro("UPDATE em public.entregas não confirmou a alteração. A entrega pode ter sido removida ou a operação bloqueada pela policy.");
}
