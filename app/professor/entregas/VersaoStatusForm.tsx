"use client";

import { useActionState } from "react";
import { atualizarStatusVersao, type StatusVersaoState } from "./actions";

const estadoInicial: StatusVersaoState = {};

export default function VersaoStatusForm({ versaoId, status }: { versaoId: string; status: string }) {
  const [estado, formAction, enviando] = useActionState(atualizarStatusVersao.bind(null, versaoId), estadoInicial);
  return <form action={formAction} aria-busy={enviando} className="mt-5 flex flex-wrap items-end gap-3"><div><label htmlFor="status" className="block text-sm font-medium text-[#172033]">Status</label><select id="status" name="status" defaultValue={status} disabled={enviando} className="mt-1.5 rounded-xl border border-[#172033]/15 bg-white px-3.5 py-2.5 text-sm text-[#172033] focus:border-[#6366F1]"><option value="enviada">Enviada</option><option value="em_analise">Em análise</option><option value="revisada">Revisada</option><option value="correcao_solicitada">Correção solicitada</option><option value="aprovada">Aprovada</option></select></div><button type="submit" disabled={enviando} className="rounded-xl bg-[#6366F1] px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60">{enviando ? "Salvando..." : "Atualizar status"}</button>{estado.erro && <p role="alert" className="basis-full text-sm text-red-600">{estado.erro}</p>}{estado.sucesso && <p role="status" className="basis-full text-sm text-green-700">{estado.sucesso}</p>}</form>;
}