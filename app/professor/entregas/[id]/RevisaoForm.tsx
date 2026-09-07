"use client";

import { useActionState } from "react";
import { STATUS_VERSAO, TIPOS_DEVOLUTIVA, type ResultadoEnvio } from "@/lib/arquivos";
import { alterarStatus, publicarDevolutiva } from "../actions";

const input = "mt-2 w-full rounded-xl border border-[#172033]/15 bg-white px-3 py-2.5 text-sm text-[#172033]";
const button = "mt-4 rounded-xl bg-[#6366F1] px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60";

export default function RevisaoForm({ versaoId, status }: { versaoId: string; status: string }) {
  const [estadoStatus, statusAction, salvando] = useActionState<ResultadoEnvio, FormData>(alterarStatus.bind(null, versaoId), {});
  const [estadoComentario, comentarioAction, publicando] = useActionState<ResultadoEnvio, FormData>(publicarDevolutiva.bind(null, versaoId), {});
  return <div className="mt-6 grid gap-6 text-[#172033] lg:grid-cols-2">
    <form action={statusAction} aria-busy={salvando} className="rounded-2xl border border-[#172033]/10 bg-white p-6">
      <h2 className="text-lg font-bold">Status da versão</h2>
      <fieldset disabled={salvando}>
        <label className="mt-3 block text-sm">Status
          <select name="status" defaultValue={status} key={status} className={input}>
            {STATUS_VERSAO.map(([v, label]) => <option key={v} value={v}>{label}</option>)}
          </select>
        </label>
        <button className={button} disabled={salvando}>{salvando ? "Salvando..." : "Atualizar status"}</button>
      </fieldset>
      {estadoStatus.erro && <p role="alert" className="mt-3 text-sm text-red-600">{estadoStatus.erro}</p>}
      {estadoStatus.sucesso && <p role="status" className="mt-3 text-sm text-green-700">{estadoStatus.sucesso}</p>}
    </form>
    <form action={comentarioAction} aria-busy={publicando} className="rounded-2xl border border-[#172033]/10 bg-white p-6">
      <h2 className="text-lg font-bold">Publicar devolutiva</h2>
      <fieldset disabled={publicando}>
        <label className="mt-3 block text-sm">Tipo
          <select name="tipo" className={input}>
            {TIPOS_DEVOLUTIVA.map(([v, label]) => <option key={v} value={v}>{label}</option>)}
          </select>
        </label>
        <label className="mt-3 block text-sm">Comentário
          <textarea name="comentario" required maxLength={10000} rows={5} className={input} />
        </label>
        <p className="mt-2 text-xs text-[#172033]/60">A devolutiva fica visível aos integrantes do projeto. O status da versão é atualizado na ação ao lado.</p>
        <button className={button} disabled={publicando}>{publicando ? "Publicando..." : "Publicar devolutiva"}</button>
      </fieldset>
      {estadoComentario.erro && <p role="alert" className="mt-3 text-sm text-red-600">{estadoComentario.erro}</p>}
      {estadoComentario.sucesso && <p role="status" className="mt-3 text-sm text-green-700">{estadoComentario.sucesso}</p>}
    </form>
  </div>;
}
