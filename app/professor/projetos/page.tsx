import ProfessorGreeting from "@/app/professor/components/ProfessorGreeting";

export default function Page() {
  return (
    <main className="min-h-screen bg-[#F5F7FA] px-4 py-6 sm:px-6 sm:py-8 lg:px-10">
      <header className="border-b border-[#172033]/10 pb-6">
        <ProfessorGreeting />

        <h1 className="mt-1 text-3xl font-bold text-[#172033]">
          Projetos
        </h1>

        <p className="mt-2 text-sm text-[#172033]/60">
          Acompanhe os projetos de TCC sob sua orientação.
        </p>
      </header>

      <section className="mt-8 rounded-xl border border-[#172033]/10 bg-white p-4 shadow-sm sm:rounded-2xl sm:p-6">
        <h2 className="text-lg font-bold text-[#172033]">
          Página em construção
        </h2>

        <p className="mt-2 text-sm leading-6 text-[#172033]/60">
          Esta área já faz parte da navegação do protótipo e receberá suas
          funcionalidades nas próximas etapas.
        </p>
      </section>
    </main>
  );
}
