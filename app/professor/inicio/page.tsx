export default function InicioProfessorPage() {
  return (
    <main className="min-h-screen bg-[#F5F7FA] px-6 py-8 lg:px-10">
      <header className="flex flex-col gap-4 border-b border-[#172033]/10 pb-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-medium text-[#6366F1]">
            Área do professor
          </p>

          <h1 className="mt-1 text-3xl font-bold text-[#172033]">
            Olá, professor
          </h1>

          <p className="mt-2 text-sm text-[#172033]/60">
            Confira as principais atividades das suas orientações.
          </p>
        </div>

        <button
          type="button"
          className="rounded-lg bg-[#6366F1] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#4F52D9]"
        >
          Criar turma
        </button>
      </header>

      <section className="mt-8 rounded-2xl border border-[#172033]/10 bg-white p-6">
        <p className="text-sm font-semibold text-[#6366F1]">
          Próxima ação
        </p>

        <h2 className="mt-2 text-xl font-bold text-[#172033]">
          Você possui entregas aguardando revisão
        </h2>

        <p className="mt-2 max-w-2xl text-sm leading-6 text-[#172033]/60">
          Acesse a área de entregas para visualizar os documentos enviados
          pelos alunos e registrar suas devolutivas.
        </p>

        <button
          type="button"
          className="mt-5 rounded-lg border border-[#6366F1] px-4 py-2 text-sm font-semibold text-[#6366F1] transition-colors hover:bg-[#6366F1]/5"
        >
          Ver entregas
        </button>
      </section>
    </main>
  );
}