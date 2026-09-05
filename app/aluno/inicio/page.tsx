export default function InicioAlunoPage() {
  return (
    <main className="min-h-screen bg-[#F5F7FA] px-4 py-6 sm:px-6 sm:py-8 lg:px-10">
      <header className="border-b border-[#172033]/10 pb-6">
        <p className="text-sm font-medium text-[#6366F1]">
          Área do aluno
        </p>

        <h1 className="mt-1 text-2xl font-bold text-[#172033] sm:text-3xl">
          Olá, aluno
        </h1>

        <p className="mt-2 text-sm text-[#172033]/60">
          Acompanhe seu projeto, seus prazos e as devolutivas recebidas.
        </p>
      </header>

      <section className="mt-8 rounded-xl border border-[#172033]/10 bg-white p-4 shadow-sm sm:rounded-2xl sm:p-6">
        <p className="text-sm font-semibold text-[#6366F1]">
          Próxima ação
        </p>

        <h2 className="mt-2 text-xl font-bold text-[#172033]">
          Entre em uma turma
        </h2>

        <p className="mt-2 text-sm leading-6 text-[#172033]/60">
          Use o código de convite fornecido pelo professor para acessar seu
          projeto de TCC.
        </p>

        <button
          type="button"
          className="mt-5 rounded-lg bg-[#6366F1] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#4F52D9]"
        >
          Inserir código
        </button>
      </section>
    </main>
  );
}
