import Link from "next/link";
import { notFound } from "next/navigation";
import ProfessorGreeting from "@/app/professor/components/ProfessorGreeting";
import { getProfessorContext } from "@/lib/turmas";
import { projetoDoProfessor, ProjetoErro, mensagemProjetoErro } from "@/lib/projetos";
import EntregaForm from "../EntregaForm";

export default async function NovaEntregaPage({ params }: {
  params: Promise<{ id: string; }>;
}) {
  const context = await getProfessorContext();
  const { id } = await params;
  let projeto;
  
  try {
    projeto = await projetoDoProfessor(context, id);
    
  } catch (error) {
    if (error instanceof ProjetoErro && error.status === 404) notFound();
    return (
      <main className="min-h-screen bg-[#F5F7FA] px-4 py-8 text-[#172033] sm:px-6 lg:px-10">
        <div role="alert" className="max-w-3xl rounded-2xl border border-[#172033]/10 bg-white p-6">
          <h1 className="text-xl font-bold">Não foi possível carregar o projeto</h1>
          <p className="mt-3 text-sm text-red-600">{mensagemProjetoErro(error)}</p>
          <Link href="/professor/projetos" className="mt-4 inline-block text-sm font-semibold text-[#6366F1]">Voltar para projetos</Link>
        </div>
      </main>
    );
  }
  return (
    <main className="min-h-screen bg-[#F5F7FA] px-4 py-6 text-[#172033] sm:px-6 sm:py-8 lg:px-10">
      <header className="border-b border-[#172033]/10 pb-6">
        <ProfessorGreeting />
        <h1 className="mt-1 font-[family-name:var(--font-manrope)] text-3xl font-bold">Nova entrega</h1>
        <p className="mt-2 break-words text-sm text-[#172033]/60">{projeto.titulo}</p>
      </header>
      <EntregaForm projetoId={projeto.id} />
    </main>
  );
}
