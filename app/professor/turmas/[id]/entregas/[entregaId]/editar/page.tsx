import Link from "next/link";
import { notFound } from "next/navigation";
import ProfessorGreeting from "@/app/professor/components/ProfessorGreeting";
import { buscarTurma } from "@/lib/turmas";
import { buscarEntrega, type Entrega } from "@/lib/entregas";
import { getProfessorContext } from "@/lib/turmas";
import EntregaForm from "../../EntregaForm";

export default async function EditarEntregaPage({ params }: { params: Promise<{ id: string; entregaId: string }> }) {
  const { id, entregaId } = await params;
  const turma = await buscarTurma(id);
  if (!turma) notFound();
  const context = await getProfessorContext();
  let entrega: Entrega;
  try {
    entrega = await buscarEntrega(context, String(turma.id), entregaId);
  } catch {
    notFound();
  }
  return (
    <main className="min-h-screen bg-[#F5F7FA] px-4 py-6 text-[#172033] sm:px-6 sm:py-8 lg:px-10">
      <header className="border-b border-[#172033]/10 pb-6"><ProfessorGreeting /><h1 className="mt-1 font-[family-name:var(--font-manrope)] text-3xl font-bold">Editar entrega</h1><p className="mt-2 break-words text-sm text-[#172033]/60">Turma: {turma.nome}</p><Link href={`/professor/turmas/${encodeURIComponent(String(turma.id))}#cronograma`} className="mt-4 inline-block text-sm font-semibold text-[#6366F1] hover:underline">Voltar para a turma</Link></header>
      <EntregaForm turmaId={String(turma.id)} entrega={entrega} />
    </main>
  );
}