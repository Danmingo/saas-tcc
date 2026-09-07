"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getProfessorContext } from "@/lib/turmas";
import { mensagemProjetoErro } from "@/lib/projetos";
import { criarEntregaValidada, atualizarEntregaValidada } from "@/lib/entregas";
import { EntregaValidacaoErro, type EntregaFormState } from "./form-config";

export async function criarEntrega(projetoId: string, _state: EntregaFormState, form: FormData): Promise<EntregaFormState> {
  const context = await getProfessorContext();
  try {
    await criarEntregaValidada(context, projetoId, form);
  } catch (error) {
    return { erro: error instanceof EntregaValidacaoErro ? error.message : mensagemProjetoErro(error) };
  }
  const destino = "/professor/projetos/" + encodeURIComponent(projetoId);
  revalidatePath(destino);
  redirect(destino + "?entrega=criada#cronograma");
}

export async function atualizarEntrega(
  projetoId: string, entregaId: string, _state: EntregaFormState, form: FormData,
): Promise<EntregaFormState> {
  const context = await getProfessorContext();
  try {
    await atualizarEntregaValidada(context, projetoId, entregaId, form);
  } catch (error) {
    return { erro: error instanceof EntregaValidacaoErro ? error.message : mensagemProjetoErro(error) };
  }
  const destino = "/professor/projetos/" + encodeURIComponent(projetoId);
  revalidatePath(destino);
  revalidatePath(destino + "/entregas/" + encodeURIComponent(entregaId) + "/editar");
  redirect(destino + "?entrega=atualizada#cronograma");
}
