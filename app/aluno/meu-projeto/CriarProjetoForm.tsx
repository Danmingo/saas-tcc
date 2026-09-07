"use client";

import { useActionState, useState } from "react";
import type { TurmaProjetoAluno } from "@/lib/projeto-aluno";
import { criarProjetoAluno, type ProjetoAlunoFormState } from "./actions";

const estadoInicial: ProjetoAlunoFormState = {};
const inputClass = "mt-1.5 w-full rounded-xl border border-[#172033]/15 bg-white px-3.5 py-2.5 text-sm text-[#172033] outline-none placeholder:text-[#172033]/35 focus:border-[#6366F1] focus:ring-2 focus:ring-[#6366F1]/25 disabled:opacity-60";

export default function CriarProjetoForm({ turmas }: { turmas: TurmaProjetoAluno[] }) {
  const [turmaId, setTurmaId] = useState(turmas[0]?.id ?? "");
  const [estado, formAction, enviando] = useActionState(criarProjetoAluno, estadoInicial);
  const turma = turmas.find((item) => item.id === turmaId);

  return (
    <form action={formAction} aria-busy={enviando} className="mt-5 max-w-3xl rounded-xl border border-[#172033]/10 bg-white p-4 shadow-sm sm:rounded-2xl sm:p-6">
      <fieldset disabled={enviando} className="space-y-5">
        <legend className="font-[family-name:var(--font-manrope)] text-lg font-bold text-[#172033]">Criar projeto</legend>
        <div>
          <label htmlFor="turma_uuid" className="block text-sm font-medium text-[#172033]">Turma</label>
          <select id="turma_uuid" name="turma_uuid" required value={turmaId} onChange={(event) => setTurmaId(event.target.value)} className={inputClass}>
            {turmas.map((item) => <option key={item.id} value={item.id}>{item.nome}</option>)}
          </select>
        </div>
        <div><label htmlFor="titulo" className="block text-sm font-medium text-[#172033]">Título</label><input id="titulo" name="titulo" required maxLength={200} placeholder="Informe o título do projeto" className={inputClass} /></div>
        <div><label htmlFor="tema" className="block text-sm font-medium text-[#172033]">Tema <span className="font-normal text-[#172033]/60">(opcional)</span></label><input id="tema" name="tema" maxLength={300} placeholder="Informe o tema do projeto" className={inputClass} /></div>
        <div><label htmlFor="descricao" className="block text-sm font-medium text-[#172033]">Descrição <span className="font-normal text-[#172033]/60">(opcional)</span></label><textarea id="descricao" name="descricao" rows={5} maxLength={5000} placeholder="Descreva o projeto" className={inputClass} /></div>
        <fieldset className="rounded-xl border border-[#172033]/10 p-4">
          <legend className="px-1 text-sm font-semibold text-[#172033]">Integrantes</legend>
          <p className="mb-3 text-sm text-[#172033]/60">Você já fará parte do projeto. Selecione colegas da mesma turma para formar um grupo ou deixe sem marcar para um projeto solo.</p>
          {!turma?.colegas.length ? <p className="text-sm text-[#172033]/60">Nenhum colega disponível nesta turma.</p> : <div className="space-y-3">{turma.colegas.map((colega) => <label key={colega.id} className="flex items-center gap-3 text-sm text-[#172033]"><input type="checkbox" name="integrante_id" value={colega.id} className="h-4 w-4 accent-[#6366F1]" />{colega.nome || "Aluno sem nome cadastrado"}</label>)}</div>}
        </fieldset>
      </fieldset>
      {estado.erro && <p role="alert" className="mt-5 text-sm leading-6 text-red-600">{estado.erro}</p>}
      <button type="submit" disabled={enviando || !turmaId} className="mt-8 rounded-xl bg-[#6366F1] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#4F52D9] disabled:opacity-60">{enviando ? "Criando projeto..." : "Criar projeto"}</button>
    </form>
  );
}