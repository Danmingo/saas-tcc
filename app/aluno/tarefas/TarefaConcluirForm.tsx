"use client";

import { useActionState } from "react";
import { concluirTarefa, type TarefaState } from "./actions";

export default function TarefaConcluirForm({ id }: { id: string }) {
  const [estado, action, pendente] = useActionState<TarefaState, FormData>(concluirTarefa.bind(null, id), {});
  return <form action={action} aria-busy={pendente}>{estado.erro && <p role="alert" className="mb-3 text-sm text-red-600">{estado.erro}</p>}<button type="submit" disabled={pendente} className="rounded-xl bg-[#6366F1] px-4 py-2 text-sm font-semibold text-white hover:bg-[#4F52D9] disabled:opacity-60">{pendente ? "Concluindo..." : "Marcar como concluída"}</button></form>;
}