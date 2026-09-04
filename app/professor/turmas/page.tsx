const turmas = [
  {
    id: 1,
    nome: "TCC 2026 - Sistemas de Informação",
    alunos: 18,
    projetos: 9,
    status: "Ativa",
  },
  {
    id: 2,
    nome: "TCC 2026 - Engenharia de Software",
    alunos: 12,
    projetos: 6,
    status: "Ativa",
  },
];

export default function TurmasProfessorPage() {
  return (
    <main className="min-h-screen bg-[#F5F7FA] px-6 py-8 lg:px-10">
      <header className="flex flex-col gap-4 border-b border-[#172033]/10 pb-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-medium text-[#6366F1]">
            Área do professor
          </p>

          <h1 className="mt-1 text-3xl font-bold text-[#172033]">
            Turmas
          </h1>

          <p className="mt-2 text-sm text-[#172033]/60">
            Organize as turmas e acompanhe os alunos vinculados.
          </p>
        </div>

        <button
          type="button"
          className="rounded-lg bg-[#6366F1] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#4F52D9]"
        >
          Criar turma
        </button>
      </header>

      <section className="mt-8">
        <div className="grid gap-4 lg:grid-cols-2">
          {turmas.map((turma) => (
            <article
              key={turma.id}
              className="rounded-2xl border border-[#172033]/10 bg-white p-6 shadow-sm"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-lg font-bold text-[#172033]">
                    {turma.nome}
                  </h2>

                  <p className="mt-2 text-sm text-[#172033]/60">
                    {turma.alunos} alunos e {turma.projetos} projetos
                  </p>
                </div>

                <span className="rounded-full bg-[#22C55E]/10 px-3 py-1 text-xs font-semibold text-[#15803D]">
                  {turma.status}
                </span>
              </div>

              <button
                type="button"
                className="mt-6 text-sm font-semibold text-[#6366F1] hover:underline"
              >
                Ver detalhes
              </button>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}