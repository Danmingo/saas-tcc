"use server";

import { revalidatePath } from "next/cache";
import { getProfessorContext } from "@/lib/turmas";
import { buscarVersao, verificarOperacao } from "@/lib/envios";
import type { ResultadoEnvio } from "@/lib/arquivos";

export type StatusVersaoState = { erro?: string; sucesso?: string };
export type DevolutivaState = { erro?: string; sucesso?: string };

export async function alterarStatus(versaoId: string, estado: StatusVersaoState, formData: FormData): Promise<ResultadoEnvio> {
  return atualizarStatusVersao(versaoId, estado, formData);
}

export async function publicarDevolutiva(versaoId: string, estado: DevolutivaState, formData: FormData): Promise<ResultadoEnvio> {
  return criarDevolutiva(versaoId, estado, formData);
}

export async function atualizarStatusVersao(
  versaoId: string,
  _estado: StatusVersaoState,
  formData: FormData,
): Promise<StatusVersaoState> {
  const context = await getProfessorContext();
  const versao = await buscarVersao({ supabase: context.supabase, perfil: context.professor }, versaoId);
  if (!versao) return { erro: "Versão não encontrada ou sem acesso." };
  const status = formData.get("status");
  const permitidos = ["enviada", "em_analise", "revisada", "correcao_solicitada", "aprovada"];
  if (typeof status !== "string" || !permitidos.includes(status)) return { erro: "Selecione um status válido." };
  const { data, error } = await context.supabase.rpc("atualizar_status_versao_professor", {
    versao_uuid: versaoId,
    status_texto: status,
  });
  verificarOperacao(error, "public.versoes", "RPC atualizar_status_versao_professor");
  if (data && typeof data === "object" && "motivo" in data && (data as { motivo?: string }).motivo !== "atualizado") {
    return { erro: "Não foi possível atualizar o status da versão." };
  }
  revalidatePath("/professor/entregas");
  revalidatePath(`/professor/entregas/${encodeURIComponent(versaoId)}`);
  return { sucesso: "Status atualizado." };
}

export async function criarDevolutiva(
  versaoId: string,
  _estado: DevolutivaState,
  formData: FormData,
): Promise<DevolutivaState> {
  const context = await getProfessorContext();
  const versao = await buscarVersao({ supabase: context.supabase, perfil: context.professor }, versaoId);
  if (!versao) return { erro: "Versão não encontrada ou sem acesso." };
  const comentario = formData.get("comentario");
  const tipo = formData.get("tipo");
  const tipos = ["comentario", "correcao", "aprovacao"];
  if (typeof comentario !== "string" || !comentario.trim() || comentario.trim().length > 5000) {
    return { erro: "Informe um comentário obrigatório com até 5000 caracteres." };
  }
  if (typeof tipo !== "string" || !tipos.includes(tipo)) return { erro: "Selecione um tipo válido." };
  const { error } = await context.supabase.from("devolutivas").insert({
    versao_id: versaoId,
    professor_id: context.professor.id,
    comentario: comentario.trim(),
    tipo,
  });
  verificarOperacao(error, "public.devolutivas", "INSERT");
  revalidatePath(`/professor/entregas/${encodeURIComponent(versaoId)}`);
  revalidatePath("/aluno/devolutivas");
  return { sucesso: "Devolutiva registrada." };
}