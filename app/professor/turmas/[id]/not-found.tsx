import Link from "next/link";

export default function TurmaNaoEncontrada() {
  return (
    <main className="min-h-screen bg-[#F5F7FA] px-4 py-6 text-[#172033] sm:px-6 sm:py-8 lg:px-10">
      <section className="rounded-xl border border-[#172033]/10 bg-white p-6 shadow-sm sm:rounded-2xl">
        <h1 className="font-[family-name:var(--font-manrope)] text-2xl font-bold">Turma não encontrada</h1>
        <p className="mt-2 text-sm text-[#172033]/60">Esta turma não existe ou você não tem permissão para acessá-la.</p>
        <Link href="/professor/turmas" className="mt-6 inline-block rounded-xl bg-[#6366F1] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#4F52D9]">
          Voltar para turmas
        </Link>
      </section>
    </main>
  );
}
