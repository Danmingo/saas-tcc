import ProfessorGreeting from "@/app/professor/components/ProfessorGreeting";

import Link from "next/link";
import { listarTurmas } from "@/lib/turmas";

export default async function TurmasProfessorPage() {
  const turmas = await listarTurmas();

  return (
    <main className="min-h-screen bg-[#F5F7FA] px-4 py-6 sm:px-6 sm:py-8 lg:px-10">
      <header className="flex flex-col gap-4 border-b border-[#172033]/10 pb-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <ProfessorGreeting />

          <h1 className="mt-1 font-[family-name:var(--font-manrope)] text-3xl font-bold text-[#172033]">
            Turmas
          </h1>

          <p className="mt-2 text-sm text-[#172033]/60">
            Organize as turmas e acompanhe os alunos vinculados.
          </p>
        </div>

        <Link
          href="/professor/turmas/nova"
          className="rounded-lg bg-[#6366F1] px-5 py-2.5 text-center text-sm font-semibold text-white transition-colors hover:bg-[#4F52D9]"
        >
          Criar turma
        </Link>
      </header>

      <section className="mt-8">
        {turmas.length === 0 ? (
          <div className="rounded-xl border border-[#172033]/10 bg-white p-6 shadow-sm sm:rounded-2xl">
            <h2 className="font-[family-name:var(--font-manrope)] text-lg font-bold text-[#172033]">
              Nenhuma turma cadastrada
            </h2>
            <p className="mt-2 text-sm text-[#172033]/60">
              Clique em Criar turma para cadastrar sua primeira turma.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 lg:grid-cols-2">
            {turmas.map((turma) => (
              <article
                key={turma.id}
                className="rounded-xl border border-[#172033]/10 bg-white p-4 shadow-sm sm:rounded-2xl sm:p-6"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <h2 className="break-words font-[family-name:var(--font-manrope)] text-lg font-bold text-[#172033]">
                      {turma.nome}
                    </h2>

                    <p className="mt-2 break-words text-sm text-[#172033]/60">
                      {turma.curso || "Curso não informado"}
                    </p>
                  </div>

                </div>

                <dl className="mt-4 space-y-2 text-sm text-[#172033]">
                  <div>
                    <dt className="inline text-[#172033]/60">Etapa: </dt>
                    <dd className="inline break-words">{turma.etapa || "Não informada"}</dd>
                  </div>
                  <div>
                    <dt className="inline text-[#172033]/60">Período: </dt>
                    <dd className="inline break-words">{turma.periodo || "Não informado"}</dd>
                  </div>
                  <div>
                    <dt className="inline text-[#172033]/60">Tipo de curso: </dt>
                    <dd className="inline break-words">{turma.tipo_curso || "Não informado"}</dd>
                  </div>
                </dl>

                <Link
                  href={`/professor/turmas/${encodeURIComponent(String(turma.id))}`}
                  className="mt-6 inline-block text-sm font-semibold text-[#6366F1] hover:underline"
                >
                  Ver detalhes
                </Link>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
