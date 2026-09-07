"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import type { Entrega } from "@/lib/entregas";
import { criarEntrega, atualizarEntrega } from "./actions";
import { prazoParaFormulario, type EntregaFormState } from "./form-config";

const inputClass = "mt-1.5 w-full rounded-xl border border-[#172033]/15 bg-white px-3.5 py-2.5 text-sm text-[#172033] outline-none focus:border-[#6366F1] focus:ring-2 focus:ring-[#6366F1]/25";

export default function EntregaForm({ projetoId, entrega }: { projetoId: string; entrega?: Entrega }) {
  const [campos, setCampos] = useState({
    titulo: entrega?.titulo ?? "", descricao: entrega?.descricao ?? "",
    prazo: prazoParaFormulario(entrega?.prazo ?? null),
    ordem: String(entrega?.ordem ?? 1), status: entrega?.status ?? "ativa",
  });
  const acao = entrega ? atualizarEntrega.bind(null, projetoId, entrega.id) : criarEntrega.bind(null, projetoId);
  const [estado, formAction, enviando] = useActionState<EntregaFormState, FormData>(acao, {});
  return (
    <form action={formAction} aria-busy={enviando} className="mt-8 max-w-3xl rounded-2xl border border-[#172033]/10 bg-white p-4 shadow-sm sm:p-6">
      <fieldset disabled={enviando} className="space-y-5">
        <legend className="sr-only">Dados da entrega</legend>
        <div>
          <label htmlFor="titulo" className="block text-sm font-medium">Título</label>
          <input id="titulo" name="titulo" required maxLength={200} value={campos.titulo}
            onChange={(e) => setCampos({ ...campos, titulo: e.target.value })} className={inputClass} />
        </div>
        <div>
          <label htmlFor="descricao" className="block text-sm font-medium">Descrição <span className="text-[#172033]/50">(opcional)</span></label>
          <textarea id="descricao" name="descricao" rows={4} maxLength={5000} value={campos.descricao}
            onChange={(e) => setCampos({ ...campos, descricao: e.target.value })} className={inputClass} />
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="prazo" className="block text-sm font-medium">Prazo <span className="text-[#172033]/50">(opcional)</span></label>
            <input id="prazo" name="prazo" type="datetime-local" step="1" value={campos.prazo} aria-describedby="prazo-fuso"
              onChange={(e) => setCampos({ ...campos, prazo: e.target.value })} className={inputClass} />
            <p id="prazo-fuso" className="mt-2 text-xs text-[#172033]/60">Dia e horário limite em Brasília (UTC−3).</p>
          </div>
          <div>
            <label htmlFor="ordem" className="block text-sm font-medium">Ordem</label>
            <input id="ordem" name="ordem" type="number" required min={0} max={2147483647} step={1} value={campos.ordem}
              onChange={(e) => setCampos({ ...campos, ordem: e.target.value })} className={inputClass} />
          </div>
        </div>
        {entrega ? (
          <div>
            <label htmlFor="status" className="block text-sm font-medium">Status</label>
            <select id="status" name="status" value={campos.status}
              onChange={(e) => setCampos({ ...campos, status: e.target.value as "ativa" | "encerrada" })} className={inputClass}>
              <option value="ativa">Ativa</option>
              <option value="encerrada">Encerrada</option>
            </select>
          </div>
        ) : <p className="text-sm text-[#172033]/60">A entrega será criada como ativa.</p>}
      </fieldset>
      {estado.erro && <p role="alert" className="mt-5 text-sm leading-6 text-red-600">{estado.erro}</p>}
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <button type="submit" disabled={enviando} className="rounded-xl bg-[#6366F1] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#4F52D9] disabled:opacity-60">
          {enviando ? "Salvando..." : entrega ? "Salvar alterações" : "Criar entrega"}
        </button>
        <Link href={"/professor/projetos/" + encodeURIComponent(projetoId) + "#cronograma"}
          className="rounded-xl border border-[#172033]/15 px-5 py-2.5 text-center text-sm font-semibold hover:bg-[#F5F7FA]">Cancelar</Link>
      </div>
    </form>
  );
}
