import ProfessorGreeting from "@/app/professor/components/ProfessorGreeting";

import Link from "next/link";
import { notFound } from "next/navigation";
import EditarTurmaForm from "./EditarTurmaForm";
import { buscarTurma } from "@/lib/turmas";

type EditarTurmaPageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditarTurmaPage({ params }: EditarTurmaPageProps) {
  const { id } = await params;
  const turma = await buscarTurma(id);

  if (!turma) notFound();

  return (
    <main className="min-h-screen bg-[#F5F7FA] px-4 py-6 text-[#172033] sm:px-6 sm:py-8 lg:px-10">
      <header className="border-b border-[#172033]/10 pb-6">
        <ProfessorGreeting />
        <h1 className="mt-1 font-[family-name:var(--font-manrope)] text-3xl font-bold">Editar turma</h1>
        <Link href={`/professor/turmas/${encodeURIComponent(String(turma.id))}`} className="mt-4 inline-block text-sm font-semibold text-[#6366F1] hover:underline">
          Voltar para detalhes
        </Link>
      </header>

      <EditarTurmaForm turmaId={String(turma.id)} turma={turma} />
    </main>
  );
}