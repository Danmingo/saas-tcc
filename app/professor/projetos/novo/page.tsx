import ProfessorGreeting from "@/app/professor/components/ProfessorGreeting";
import { getProfessorContext } from "@/lib/turmas";
import { mensagemProjetoErro, turmasDoProfessor } from "@/lib/projetos";
import ProjetoForm from "../ProjetoForm";
import ProjetoAviso from "../ProjetoAviso";
import Link from "next/link";

export default async function NovoProjetoPage() {
  const context = await getProfessorContext();
  let turmas;
  try {
    turmas = await turmasDoProfessor(context);
  } catch (error) {
    return <ProjetoAviso mensagem={mensagemProjetoErro(error)} />;
  }
  return (
    <main className="min-h-screen bg-[#F5F7FA] px-4 py-6 text-[#172033] sm:px-6 sm:py-8 lg:px-10">
      <header className="border-b border-[#172033]/10 pb-6">
        <ProfessorGreeting />
        <h1 className="mt-1 font-[family-name:var(--font-manrope)] text-3xl font-bold">Novo projeto</h1>
        <p className="mt-2 text-sm text-[#172033]/60">Defina o TCC e selecione os integrantes da turma.</p>
      </header>
      {turmas.length ? <ProjetoForm turmas={turmas} /> : (
        <section className="mt-8 rounded-xl border border-[#172033]/10 bg-white p-6 shadow-sm">
          <p className="text-sm">Você precisa cadastrar uma turma antes de criar um projeto.</p>
          <Link href="/professor/turmas/nova" className="mt-4 inline-block text-sm font-semibold text-[#6366F1]">Criar turma</Link>
        </section>
      )}
    </main>
  );
}
