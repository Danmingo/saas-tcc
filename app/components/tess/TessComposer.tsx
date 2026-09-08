"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { enviarMensagemTessAction, type TessActionState } from "./actions";

const initialState: TessActionState = {};

export default function TessComposer({ conversaId }: { conversaId: string }) {
  const [estado, action, enviando] = useActionState(enviarMensagemTessAction.bind(null, conversaId), initialState);
  const router = useRouter();
  useEffect(() => { if (estado.resposta) router.refresh(); }, [estado.resposta, router]);
  return <form action={action} className="border-t border-[#172033]/10 bg-white p-4"><label htmlFor="pergunta-tess" className="sr-only">Pergunte à Tess</label><textarea id="pergunta-tess" name="pergunta" required maxLength={4000} rows={3} placeholder="Pergunte sobre seu TCC..." className="w-full resize-none rounded-xl border border-[#172033]/15 px-3.5 py-3 text-sm outline-none focus:border-[#6366F1] focus:ring-2 focus:ring-[#6366F1]/20" /><div className="mt-3 flex items-center justify-between gap-3"><p className="text-xs text-[#172033]/50">A Tess orienta; a decisão acadêmica continua com você.</p><button type="submit" disabled={enviando} className="rounded-xl bg-[#6366F1] px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60">{enviando ? "Pensando..." : "Enviar"}</button></div>{estado.erro && <p role="alert" className="mt-3 text-sm text-red-600">{estado.erro}</p>}</form>;
}