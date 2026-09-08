"use server";

import { revalidatePath } from "next/cache";
import { contextoProfessor, criarPendenciaProfessor, mensagemPendencia, reabrirPendenciaProfessor } from "@/lib/pendencias";

export type PendenciaState = { erro?: string; sucesso?: string };
function texto(form: FormData, nome: string) { const valor = form.get(nome); return typeof valor === "string" ? valor.trim() : null; }

export async function criarPendencia(projetoId: string, _estado: PendenciaState, form: FormData): Promise<PendenciaState> {
  void _estado;
  try { await criarPendenciaProfessor(await contextoProfessor(), { projetoId, descricao: texto(form, "descricao") ?? "", prioridade: texto(form, "prioridade") ?? "", prazo: texto(form, "prazo") || null, responsavelId: texto(form, "responsavel_id") || null }); revalidatePath(`/professor/projetos/${encodeURIComponent(projetoId)}`); return { sucesso: "Pendência criada." }; }
  catch (error) { return { erro: mensagemPendencia(error) }; }
}

export async function reabrirPendencia(projetoId: string, pendenciaId: string, _estado: PendenciaState): Promise<PendenciaState> {
  void _estado;
  try { await reabrirPendenciaProfessor(await contextoProfessor(), projetoId, pendenciaId); revalidatePath(`/professor/projetos/${encodeURIComponent(projetoId)}`); return { sucesso: "Pendência reaberta." }; }
  catch (error) { return { erro: mensagemPendencia(error) }; }
}