"use client";

import ProfessorGreeting from "@/app/professor/components/ProfessorGreeting";

import Link from "next/link";
import { useActionState } from "react";
import { criarTurma } from "../actions";
import { CAMPOS_TURMA, type TurmaFormState } from "../form-config";

const estadoInicial: TurmaFormState = {};

export default function NovaTurmaProfessorPage() {
  const [estado, formAction, enviando] = useActionState(criarTurma, estadoInicial);

  return (
    <main className="min-h-screen bg-[#F5F7FA] px-4 py-6 text-[#172033] sm:px-6 sm:py-8 lg:px-10">
      <header className="border-b border-[#172033]/10 pb-6">
        <ProfessorGreeting />
        <h1 className="mt-1 font-[family-name:var(--font-manrope)] text-3xl font-bold">Nova turma</h1>
      </header>

      <form
        action={formAction}
        aria-busy={enviando}
        className="mt-8 max-w-2xl rounded-xl border border-[#172033]/10 bg-white p-4 shadow-sm sm:rounded-2xl sm:p-6"
      >
        <fieldset disabled={enviando} className="space-y-5">
          <legend className="sr-only">Dados da turma</legend>
          {CAMPOS_TURMA.map((campo) => (
            <div key={campo.nome}>
              <label htmlFor={campo.nome} className="block text-sm font-medium">
                {campo.label}
                {!campo.obrigatorio && <span className="font-normal text-[#172033]/50"> (opcional)</span>}
              </label>
              <input
                id={campo.nome}
                name={campo.nome}
                type="text"
                required={campo.obrigatorio}
                maxLength={campo.maxLength}
                defaultValue={estado.valores?.[campo.nome] ?? ""}
                list={campo.sugestoes ? `${campo.nome}-sugestoes` : undefined}
                aria-invalid={Boolean(estado.errosCampos?.[campo.nome])}
                aria-describedby={estado.errosCampos?.[campo.nome] ? `${campo.nome}-erro` : undefined}
                className="mt-1.5 w-full rounded-xl border border-[#172033]/15 bg-white px-3.5 py-2.5 text-sm outline-none transition-shadow focus:border-[#6366F1] focus:ring-2 focus:ring-[#6366F1]/25 disabled:opacity-60"
              />
              {campo.sugestoes && (
                <datalist id={`${campo.nome}-sugestoes`}>
                  {campo.sugestoes.map((sugestao) => <option key={sugestao} value={sugestao} />)}
                </datalist>
              )}
              {estado.errosCampos?.[campo.nome] && (
                <p id={`${campo.nome}-erro`} className="mt-1.5 text-sm text-red-600">
                  {estado.errosCampos[campo.nome]}
                </p>
              )}
            </div>
          ))}
        </fieldset>

        {estado.erro && <p role="alert" className="mt-5 text-sm text-red-600">{estado.erro}</p>}

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <button
            type="submit"
            disabled={enviando}
            className="rounded-xl bg-[#6366F1] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#4F52D9] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6366F1] disabled:opacity-60"
          >
            {enviando ? "Criando turma..." : "Criar turma"}
          </button>
          <Link
            href="/professor/turmas"
            className="rounded-xl border border-[#172033]/15 bg-white px-5 py-2.5 text-center text-sm font-semibold transition-colors hover:bg-[#F5F7FA] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6366F1]"
          >
            Cancelar
          </Link>
        </div>
      </form>
    </main>
  );
}
