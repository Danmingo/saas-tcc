"use client";

import Link from "next/link";

export default function NovaTurmaProfessorPage() {
  return (
    <main className="min-h-screen bg-[#F5F7FA] px-4 py-6 text-[#172033] sm:px-6 sm:py-8 lg:px-10">
      <header className="border-b border-[#172033]/10 pb-6">
        <p className="text-sm font-medium text-[#6366F1]">
          Área do professor
        </p>

        <h1 className="mt-1 text-3xl font-bold">Nova turma</h1>
      </header>

      <form
        onSubmit={(event) => event.preventDefault()}
        className="mt-8 max-w-2xl rounded-xl border border-[#172033]/10 bg-white p-4 shadow-sm sm:rounded-2xl sm:p-6"
      >
        <div className="space-y-5">
          <div>
            <label htmlFor="nome" className="block text-sm font-medium">
              Nome da turma
            </label>
            <input
              id="nome"
              name="nome"
              type="text"
              className="mt-1.5 w-full rounded-xl border border-[#172033]/15 bg-white px-3.5 py-2.5 text-sm outline-none transition-shadow focus:border-[#6366F1] focus:ring-2 focus:ring-[#6366F1]/25"
            />
          </div>

          <div>
            <label htmlFor="curso" className="block text-sm font-medium">
              Curso
            </label>
            <input
              id="curso"
              name="curso"
              type="text"
              className="mt-1.5 w-full rounded-xl border border-[#172033]/15 bg-white px-3.5 py-2.5 text-sm outline-none transition-shadow focus:border-[#6366F1] focus:ring-2 focus:ring-[#6366F1]/25"
            />
          </div>

          <div>
            <label htmlFor="periodo" className="block text-sm font-medium">
              Período ou semestre
            </label>
            <input
              id="periodo"
              name="periodo"
              type="text"
              className="mt-1.5 w-full rounded-xl border border-[#172033]/15 bg-white px-3.5 py-2.5 text-sm outline-none transition-shadow focus:border-[#6366F1] focus:ring-2 focus:ring-[#6366F1]/25"
            />
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <button
            type="submit"
            className="rounded-xl bg-[#6366F1] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#4F52D9] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6366F1]"
          >
            Criar turma
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
