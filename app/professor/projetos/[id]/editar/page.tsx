import { notFound } from "next/navigation";
import ProfessorGreeting from "@/app/professor/components/ProfessorGreeting";
import { getProfessorContext } from "@/lib/turmas";
import { alunosDaTurma, detalhesProjeto, mensagemProjetoErro, ProjetoErro } from "@/lib/projetos";
import ProjetoForm from "../../ProjetoForm";
import ProjetoAviso from "../../ProjetoAviso";

export default async function EditarProjetoPage({ params }: { params: Promise<{ id: string }> }) {
  const context = await getProfessorContext();
  const { id } = await params;
  let projeto;
  let alunos;
  try {
    projeto = await detalhesProjeto(context, id);
    alunos = await alunosDaTurma(context, projeto.turma_id);
  } catch (error) {
    if (error instanceof ProjetoErro && error.status === 404) notFound();
    return <ProjetoAviso mensagem={mensagemProjetoErro(error)} />;
  }
  return (
    <main className="min-h-screen bg-[#F5F7FA] px-4 py-6 text-[#172033] sm:px-6 sm:py-8 lg:px-10">
      <header className="border-b border-[#172033]/10 pb-6">
        <ProfessorGreeting />
        <h1 className="mt-1 font-[family-name:var(--font-manrope)] text-3xl font-bold">Editar projeto</h1>
        <p className="mt-2 text-sm text-[#172033]/60">Atualize os dados e os integrantes da turma.</p>
      </header>
      <ProjetoForm projeto={projeto} turmas={[projeto.turma]} alunosIniciais={alunos} />
    </main>
  );
}
