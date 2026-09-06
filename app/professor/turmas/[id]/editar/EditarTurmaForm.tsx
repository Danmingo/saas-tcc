"use client";

import { useActionState } from "react";
import { atualizarTurma } from "../../actions";
import { CAMPOS_TURMA, type TurmaFormState } from "../../form-config";
import type { Turma } from "@/lib/turmas";

const estadoInicial: TurmaFormState = {};

export default function EditarTurmaForm({ turmaId, turma }: { turmaId: string; turma: Turma }) {
  const [estado, formAction, enviando] = useActionState(
    atualizarTurma.bind(null, turmaId),
    estadoInicial,
  );

  return (
    <form
      action={formAction}
      aria-busy={enviando}
      className="mt-8 max-w-2xl rounded-xl border border-[#172033]/10 bg-white p-4 shadow-sm sm:rounded-2xl sm:p-6"
    >
      <fieldset disabled={enviando} className="space-y-5">
        <legend className="sr-only">Dados da turma</legend>
        {CAMPOS_TURMA.map((campo) => {
          const valorOriginal = turma[campo.nome] ?? "";

          return (
            <div key={campo.nome}>
              <label htmlFor={`editar-${campo.nome}`} className="block text-sm font-medium">
                {campo.label}
                {!campo.obrigatorio && <span className="font-normal text-[#172033]/50"> (opcional)</span>}
              </label>
              <input
                id={`editar-${campo.nome}`}
                name={campo.nome}
                type="text"
                required={campo.obrigatorio}
                maxLength={campo.maxLength}
                defaultValue={estado.valores?.[campo.nome] ?? valorOriginal}
                list={campo.sugestoes ? `editar-${campo.nome}-sugestoes` : undefined}
                aria-invalid={Boolean(estado.errosCampos?.[campo.nome])}
                aria-describedby={estado.errosCampos?.[campo.nome] ? `editar-${campo.nome}-erro` : undefined}
                className="mt-1.5 w-full rounded-xl border border-[#172033]/15 bg-white px-3.5 py-2.5 text-sm outline-none transition-shadow focus:border-[#6366F1] focus:ring-2 focus:ring-[#6366F1]/25 disabled:opacity-60"
              />
              {campo.sugestoes && (
                <datalist id={`editar-${campo.nome}-sugestoes`}>
                  {campo.sugestoes.map((sugestao) => <option key={sugestao} value={sugestao} />)}
                </datalist>
              )}
              {estado.errosCampos?.[campo.nome] && (
                <p id={`editar-${campo.nome}-erro`} className="mt-1.5 text-sm text-red-600">
                  {estado.errosCampos[campo.nome]}
                </p>
              )}
            </div>
          );
        })}
      </fieldset>

      {estado.erro && <p role="alert" className="mt-5 text-sm text-red-600">{estado.erro}</p>}

      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <button
          type="submit"
          disabled={enviando}
          className="rounded-xl bg-[#6366F1] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#4F52D9] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6366F1] disabled:opacity-60"
        >
          {enviando ? "Salvando alterações..." : "Salvar alterações"}
        </button>
        <a
          href={`/professor/turmas/${encodeURIComponent(turmaId)}`}
          className="rounded-xl border border-[#172033]/15 bg-white px-5 py-2.5 text-center text-sm font-semibold transition-colors hover:bg-[#F5F7FA] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6366F1]"
        >
          Cancelar
        </a>
      </div>
    </form>
  );
}