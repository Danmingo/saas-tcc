"use client";

import { useActionState, useState } from "react";
import type { ProjetoAluno } from "@/lib/projeto-aluno";
import { atualizarConteudoProjetoAluno, type ProjetoAlunoFormState } from "./actions";

const estadoInicial: ProjetoAlunoFormState = {};

export default function ProjetoAlunoForm({ projeto }: { projeto: ProjetoAluno }) {
  const [editando, setEditando] = useState(false);
  const [estado, formAction, enviando] = useActionState(
    atualizarConteudoProjetoAluno.bind(null, projeto.id),
    estadoInicial,
  );
  const valores = estado.valores ?? {
    titulo: projeto.titulo === "Projeto sem título" ? "" : projeto.titulo,
    tema: projeto.tema ?? "",
    descricao: projeto.descricao ?? "",
  };

  if (!editando) {
    return <button type="button" onClick={() => setEditando(true)} className="mt-6 rounded-xl bg-[#6366F1] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#4F52D9]">Editar informações do projeto</button>;
  }

  return (
    <form action={formAction} aria-busy={enviando} className="mt-6 border-t border-[#172033]/10 pt-6">
      <fieldset disabled={enviando} className="space-y-5">
        <legend className="font-[family-name:var(--font-manrope)] text-lg font-bold text-[#172033]">Informações acadêmicas</legend>
        <div><label htmlFor={`projeto-${projeto.id}-titulo`} className="block text-sm font-medium text-[#172033]">Título</label><input id={`projeto-${projeto.id}-titulo`} name="titulo" required maxLength={200} defaultValue={valores.titulo} placeholder="Informe o título do projeto" className="mt-1.5 w-full rounded-xl border border-[#172033]/15 bg-white px-3.5 py-2.5 text-sm text-[#172033] outline-none placeholder:text-[#172033]/35 focus:border-[#6366F1] focus:ring-2 focus:ring-[#6366F1]/25 disabled:opacity-60" /></div>
        <div><label htmlFor={`projeto-${projeto.id}-tema`} className="block text-sm font-medium text-[#172033]">Tema <span className="font-normal text-[#172033]/60">(opcional)</span></label><input id={`projeto-${projeto.id}-tema`} name="tema" maxLength={300} defaultValue={valores.tema} placeholder="Informe o tema do projeto" className="mt-1.5 w-full rounded-xl border border-[#172033]/15 bg-white px-3.5 py-2.5 text-sm text-[#172033] outline-none placeholder:text-[#172033]/35 focus:border-[#6366F1] focus:ring-2 focus:ring-[#6366F1]/25 disabled:opacity-60" /></div>
        <div><label htmlFor={`projeto-${projeto.id}-descricao`} className="block text-sm font-medium text-[#172033]">Descrição <span className="font-normal text-[#172033]/60">(opcional)</span></label><textarea id={`projeto-${projeto.id}-descricao`} name="descricao" rows={5} maxLength={5000} defaultValue={valores.descricao} placeholder="Descreva o projeto" className="mt-1.5 w-full rounded-xl border border-[#172033]/15 bg-white px-3.5 py-2.5 text-sm text-[#172033] outline-none placeholder:text-[#172033]/35 focus:border-[#6366F1] focus:ring-2 focus:ring-[#6366F1]/25 disabled:opacity-60" /></div>
      </fieldset>
      {estado.erro && <p role="alert" className="mt-5 text-sm leading-6 text-red-600">{estado.erro}</p>}
      <div className="mt-6 flex flex-col gap-3 sm:flex-row"><button type="submit" disabled={enviando} className="rounded-xl bg-[#6366F1] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#4F52D9] disabled:opacity-60">{enviando ? "Salvando..." : "Salvar informações"}</button><button type="button" disabled={enviando} onClick={() => setEditando(false)} className="rounded-xl border border-[#172033]/15 px-5 py-2.5 text-sm font-semibold text-[#172033] hover:bg-[#F5F7FA] disabled:opacity-60">Cancelar</button></div>
    </form>
  );
}