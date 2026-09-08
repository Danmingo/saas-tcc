"use client";

import { useActionState, useState } from "react";
import { criarDevolutiva, type DevolutivaState } from "./actions";

const estadoInicial: DevolutivaState = {};

export default function DevolutivaForm({ versaoId, valorInicial = "" }: { versaoId: string; valorInicial?: string }) {
  const [comentario, setComentario] = useState(valorInicial);
  const [estado, formAction, enviando] = useActionState(criarDevolutiva.bind(null, versaoId), estadoInicial);
  return <form action={formAction} aria-busy={enviando} className="mt-5 border-t border-[#172033]/10 pt-5"><fieldset disabled={enviando} className="space-y-4"><legend className="text-lg font-bold text-[#172033]">Registrar devolutiva</legend><div><label htmlFor="tipo" className="block text-sm font-medium text-[#172033]">Tipo</label><select id="tipo" name="tipo" defaultValue="comentario" className="mt-1.5 w-full rounded-xl border border-[#172033]/15 bg-white px-3.5 py-2.5 text-sm text-[#172033]"><option value="comentario">Comentário</option><option value="correcao">Solicitar correção</option><option value="aprovacao">Aprovação</option></select></div><div><label htmlFor="comentario" className="block text-sm font-medium text-[#172033]">Comentário</label><textarea id="comentario" name="comentario" required maxLength={5000} rows={5} value={comentario} onChange={(event) => setComentario(event.target.value)} placeholder="Escreva a devolutiva" className="mt-1.5 w-full rounded-xl border border-[#172033]/15 bg-white px-3.5 py-2.5 text-sm text-[#172033] placeholder:text-[#172033]/35" /></div></fieldset>{estado.erro && <p role="alert" className="mt-4 text-sm text-red-600">{estado.erro}</p>}{estado.sucesso && <p role="status" className="mt-4 text-sm text-green-700">{estado.sucesso}</p>}<button type="submit" disabled={enviando} className="mt-5 rounded-xl bg-[#6366F1] px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60">{enviando ? "Registrando..." : "Registrar devolutiva"}</button></form>;
}