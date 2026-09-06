"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { excluirTurma, type ExclusaoTurmaState } from "../actions";

const estadoInicial: ExclusaoTurmaState = {};

export default function TurmaAcoes({ turmaId }: { turmaId: string }) {
  const [confirmando, setConfirmando] = useState(false);
  const [estado, formAction, excluindo] = useActionState(
    excluirTurma.bind(null, turmaId),
    estadoInicial,
  );

  return (
    <section aria-label="Ações da turma" className="mt-6 flex max-w-2xl flex-col gap-3 sm:flex-row sm:items-start">
      <Link
        href={`/professor/turmas/${encodeURIComponent(turmaId)}/editar`}
        className="rounded-xl bg-[#6366F1] px-5 py-2.5 text-center text-sm font-semibold text-white transition-colors hover:bg-[#4F52D9] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6366F1]"
      >
        Editar turma
      </Link>

      {!confirmando ? (
        <button
          type="button"
          onClick={() => setConfirmando(true)}
          className="rounded-xl border border-[#DC2626]/30 px-5 py-2.5 text-sm font-semibold text-[#B91C1C] transition-colors hover:bg-[#FEF2F2] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#DC2626]"
        >
          Excluir turma
        </button>
      ) : (
        <form action={formAction} aria-busy={excluindo} className="flex flex-col gap-3 rounded-xl border border-[#DC2626]/20 bg-[#FEF2F2] p-4 sm:flex-row sm:items-center">
          <p className="text-sm text-[#991B1B]">Tem certeza que deseja excluir esta turma?</p>
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={excluindo}
              className="rounded-lg bg-[#DC2626] px-4 py-2 text-sm font-semibold text-white hover:bg-[#B91C1C] disabled:opacity-60"
            >
              {excluindo ? "Excluindo..." : "Confirmar exclusão"}
            </button>
            <button
              type="button"
              disabled={excluindo}
              onClick={() => setConfirmando(false)}
              className="rounded-lg border border-[#172033]/15 bg-white px-4 py-2 text-sm font-semibold hover:bg-[#F5F7FA] disabled:opacity-60"
            >
              Cancelar
            </button>
          </div>
        </form>
      )}

      {estado.erro && <p role="alert" className="text-sm text-red-600 sm:pt-2">{estado.erro}</p>}
    </section>
  );
}