"use client";

import { useActionState } from "react";
import { entrarNaTurma, type EntrarTurmaState } from "./actions";

const estadoInicial: EntrarTurmaState = {};

export default function EntrarTurmaForm() {
  const [estado, formAction, enviando] = useActionState(entrarNaTurma, estadoInicial);

  return (
    <form action={formAction} aria-busy={enviando} className="mt-5">
      <label htmlFor="codigo-convite" className="block text-sm font-medium text-[#172033]">
        Código de convite
      </label>

      <div className="mt-1.5 flex flex-col gap-3 sm:flex-row">
        <input
          id="codigo-convite"
          name="codigo_convite"
          type="text"
          required
          maxLength={128}
          autoComplete="off"
          defaultValue={estado.codigo ?? ""}
          aria-invalid={Boolean(estado.erro)}
          aria-describedby={estado.erro ? "codigo-convite-erro" : undefined}
          placeholder="Ex.: ABCD2345"
          className="min-w-0 flex-1 rounded-xl border border-[#172033]/15 bg-white px-3.5 py-2.5 text-sm uppercase outline-none transition-shadow placeholder:normal-case focus:border-[#6366F1] focus:ring-2 focus:ring-[#6366F1]/25 disabled:opacity-60"
          disabled={enviando}
        />
        <button
          type="submit"
          disabled={enviando}
          className="rounded-xl bg-[#6366F1] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#4F52D9] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6366F1] disabled:opacity-60"
        >
          {enviando ? "Entrando..." : "Entrar na turma"}
        </button>
      </div>

      {estado.erro && (
        <p id="codigo-convite-erro" role="alert" className="mt-2 text-sm text-red-600">
          {estado.erro}
        </p>
      )}
    </form>
  );
}