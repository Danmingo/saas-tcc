"use server";

import { revalidatePath } from "next/cache";
import { contextoAluno, marcarConcluidaAluno, mensagemPendencia } from "@/lib/pendencias";

export type TarefaState = { erro?: string; sucesso?: string };
export async function concluirTarefa(id: string, _estado: TarefaState): Promise<TarefaState> {
  void _estado;
  try { await marcarConcluidaAluno(await contextoAluno(), id); revalidatePath("/aluno/tarefas"); return { sucesso: "Pendência marcada como concluída." }; }
  catch (error) { return { erro: mensagemPendencia(error) }; }
}