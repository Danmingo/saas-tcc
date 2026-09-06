"use client";

import Link from "next/link";

export default function ErroTurmas({ retry }: { retry: () => void }) {
  return (
    <main className="min-h-screen bg-[#F5F7FA] px-4 py-6 text-[#172033] sm:px-6 sm:py-8 lg:px-10">
      <section role="alert" className="rounded-xl border border-[#172033]/10 bg-white p-6 shadow-sm sm:rounded-2xl">
        <h1 className="font-[family-name:var(--font-manrope)] text-2xl font-bold">Não foi possível carregar os dados</h1>
        <p className="mt-2 text-sm text-[#172033]/60">Tente novamente em alguns instantes.</p>
        <div className="mt-6 flex flex-wrap items-center gap-4">
          <button type="button" onClick={() => retry()} className="rounded-xl bg-[#6366F1] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#4F52D9]">
            Tentar novamente
          </button>
          <Link href="/professor/turmas" className="text-sm font-semibold text-[#6366F1] hover:underline">Voltar para turmas</Link>
        </div>
      </section>
    </main>
  );
}
