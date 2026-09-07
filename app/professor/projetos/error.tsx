"use client";

export default function ErroProjetos({ retry }: { retry: () => void }) {
  return (
    <main className="min-h-screen bg-[#F5F7FA] px-4 py-6 text-[#172033] sm:px-6 sm:py-8 lg:px-10">
      <section role="alert" className="rounded-xl border border-[#172033]/10 bg-white p-6 shadow-sm">
        <h1 className="font-[family-name:var(--font-manrope)] text-2xl font-bold">Não foi possível carregar os projetos</h1>
        <p className="mt-2 text-sm text-[#172033]/60">Tente novamente em alguns instantes.</p>
        <button type="button" onClick={() => retry()} className="mt-5 rounded-xl bg-[#6366F1] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#4F52D9]">Tentar novamente</button>
      </section>
    </main>
  );
}
