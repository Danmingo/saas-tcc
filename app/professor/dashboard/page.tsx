export default function DashboardProfessorPage() {
  return (
    <main className="min-h-screen bg-[#F5F7FA] px-4 py-6 sm:px-6 sm:py-8 lg:px-10">
      <header className="border-b border-[#172033]/10 pb-6">
        <p className="text-sm font-medium text-[#6366F1]">
          Área do professor
        </p>

        <h1 className="mt-1 text-3xl font-bold text-[#172033]">
          Dashboard
        </h1>

        <p className="mt-2 text-sm text-[#172033]/60">
          Acompanhe os indicadores das suas turmas e orientações.
        </p>
      </header>

      <section className="mt-8 rounded-xl border border-[#172033]/10 bg-white p-4 sm:rounded-2xl sm:p-6">
        <p className="text-sm text-[#172033]/60">
          Os indicadores do professor serão adicionados nesta página.
        </p>
      </section>
    </main>
  );
}