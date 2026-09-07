import ProfessorGreeting from "@/app/professor/components/ProfessorGreeting";

import Link from "next/link";
import { notFound } from "next/navigation";
import TurmaAcoes from "../components/TurmaAcoes";
import Cronograma from "./entregas/Cronograma";
import { buscarTurma, getProfessorContext } from "@/lib/turmas";

type TurmaPageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ criada?: string | string[]; atualizada?: string | string[]; entrega?: string | string[] }>;
};

export default async function DetalhesTurmaPage({ params, searchParams }: TurmaPageProps) {
  const { id } = await params;
  const [turma, context] = await Promise.all([buscarTurma(id), getProfessorContext()]);

  if (!turma) notFound();

  const { criada, atualizada, entrega } = await searchParams;
  const detalhes = [
    { label: "Curso", valor: turma.curso },
    { label: "Etapa/componente", valor: turma.etapa },
    { label: "Período", valor: turma.periodo },
    { label: "Tipo de curso", valor: turma.tipo_curso },
  ];

  return (
    <main className="min-h-screen bg-[#F5F7FA] px-4 py-6 text-[#172033] sm:px-6 sm:py-8 lg:px-10">
      <header className="border-b border-[#172033]/10 pb-6">
        <ProfessorGreeting />
        <h1 className="mt-1 break-words font-[family-name:var(--font-manrope)] text-3xl font-bold">{turma.nome}</h1>
        <Link href="/professor/turmas" className="mt-4 inline-block text-sm font-semibold text-[#6366F1] hover:underline">
          Voltar para turmas
        </Link>
      </header>

      {criada === "1" && (
        <p role="status" className="mt-6 rounded-xl border border-[#22C55E]/20 bg-[#22C55E]/10 p-4 text-sm text-[#15803D]">
          Turma criada com sucesso.
        </p>
      )}

      {atualizada === "1" && (
        <p role="status" className="mt-6 rounded-xl border border-[#22C55E]/20 bg-[#22C55E]/10 p-4 text-sm text-[#15803D]">
          Turma atualizada com sucesso.
        </p>
      )}

      <section aria-label="Dados da turma" className="mt-8 max-w-2xl rounded-xl border border-[#172033]/10 bg-white p-4 shadow-sm sm:rounded-2xl sm:p-6">
        <dl className="grid gap-6 sm:grid-cols-2">
          {detalhes.map((detalhe) => (
            <div key={detalhe.label}>
              <dt className="text-sm text-[#172033]/60">{detalhe.label}</dt>
              <dd className="mt-1 break-words text-sm font-medium">{detalhe.valor || "Não informado"}</dd>
            </div>
          ))}
          <div className="border-t border-[#172033]/10 pt-6 sm:col-span-2">
            <dt className="text-sm text-[#172033]/60">Código de convite</dt>
            <dd className="mt-2 select-all break-all font-[family-name:var(--font-manrope)] text-2xl font-bold tracking-wider text-[#6366F1]">
              {turma.codigo_convite}
            </dd>
          </div>
        </dl>
      </section>

      <TurmaAcoes turmaId={String(turma.id)} />

      <Cronograma context={context} turmaId={String(turma.id)} feedback={typeof entrega === "string" ? entrega : undefined} />
    </main>
  );
}
