import Link from "next/link";

export default function ProjetoAviso({ mensagem }: { mensagem: string }) {
  return (
    <main className="min-h-screen bg-[#F5F7FA] px-4 py-6 text-[#172033] sm:px-6 sm:py-8 lg:px-10">
      <section role="alert" className="rounded-xl border border-[#172033]/10 bg-white p-6 shadow-sm sm:rounded-2xl">
        <h1 className="font-[family-name:var(--font-manrope)] text-2xl font-bold">Não foi possível carregar o projeto</h1>
        <p className="mt-3 text-sm leading-6 text-[#172033]/70">{mensagem}</p>
        <Link href="/professor/projetos" className="mt-5 inline-block text-sm font-semibold text-[#6366F1] hover:underline">
          Voltar para projetos
        </Link>
      </section>
    </main>
  );
}
