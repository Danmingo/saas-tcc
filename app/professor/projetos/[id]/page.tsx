import Link from "next/link";
import { notFound } from "next/navigation";
import ProfessorGreeting from "@/app/professor/components/ProfessorGreeting";
import { getProfessorContext } from "@/lib/turmas";
import { detalhesProjeto, mensagemProjetoErro, ProjetoErro } from "@/lib/projetos";
import { formatarData, labelStatus } from "../form-config";
import ProjetoAviso from "../ProjetoAviso";

export default async function DetalhesProjetoPage({ params, searchParams }: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ criado?: string; atualizado?: string }>;
}) {
  const context = await getProfessorContext();
  const { id } = await params;
  let projeto;
  try {
    projeto = await detalhesProjeto(context, id);
  } catch (error) {
    if (error instanceof ProjetoErro && error.status === 404) notFound();
    return <ProjetoAviso mensagem={mensagemProjetoErro(error)} />;
  }
  const feedback = await searchParams;
  return (
    <main className="min-h-screen bg-[#F5F7FA] px-4 py-6 text-[#172033] sm:px-6 sm:py-8 lg:px-10">
      <header className="flex flex-col gap-4 border-b border-[#172033]/10 pb-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <ProfessorGreeting />
          <h1 className="mt-1 break-words font-[family-name:var(--font-manrope)] text-3xl font-bold">{projeto.titulo === "Projeto sem título" ? "Título ainda não definido pelo aluno" : projeto.titulo}</h1>
          <Link href="/professor/projetos" className="mt-3 inline-block text-sm font-semibold text-[#6366F1] hover:underline">Voltar para projetos</Link>
        </div>
      </header>
      {(feedback.criado === "1" || feedback.atualizado === "1") && (
        <p role="status" className="mt-6 rounded-xl border border-[#22C55E]/20 bg-[#22C55E]/10 p-4 text-sm text-[#15803D]">
          {feedback.criado === "1" ? "Projeto criado com sucesso." : "Projeto atualizado com sucesso."}
        </p>
      )}
      <section aria-label="Dados do projeto" className="mt-8 max-w-3xl rounded-xl border border-[#172033]/10 bg-white p-4 shadow-sm sm:rounded-2xl sm:p-6">
        <dl className="grid gap-6 sm:grid-cols-2">
          <div><dt className="text-sm text-[#172033]/60">Turma</dt><dd className="mt-1 break-words text-sm font-medium">{projeto.turma.nome}</dd></div>
          <div><dt className="text-sm text-[#172033]/60">Status</dt><dd className="mt-1 text-sm font-medium">{labelStatus(projeto.status)}</dd></div>
          <div className="sm:col-span-2"><dt className="text-sm text-[#172033]/60">Tema</dt><dd className="mt-1 break-words text-sm">{projeto.tema || "Tema ainda não informado"}</dd></div>
          <div className="sm:col-span-2"><dt className="text-sm text-[#172033]/60">Descrição</dt><dd className="mt-1 whitespace-pre-wrap break-words text-sm leading-6">{projeto.descricao || "Descrição ainda não informada"}</dd></div>
          <div><dt className="text-sm text-[#172033]/60">Data de início</dt><dd className="mt-1 text-sm">{formatarData(projeto.data_inicio)}</dd></div>
          <div><dt className="text-sm text-[#172033]/60">Prazo final</dt><dd className="mt-1 text-sm">{formatarData(projeto.prazo_final)}</dd></div>
          <div><dt className="text-sm text-[#172033]/60">Criado em</dt><dd className="mt-1 text-sm">{formatarData(projeto.criado_em, true)}</dd></div>
        </dl>
        <div className="mt-6 border-t border-[#172033]/10 pt-6">
          <h2 className="font-[family-name:var(--font-manrope)] text-lg font-bold">Integrantes</h2>
          {projeto.integrantes.length ? (
            <ul className="mt-3 space-y-2 text-sm">{projeto.integrantes.map((aluno) => <li key={aluno.id}>{aluno.nome || "Aluno sem nome cadastrado"}</li>)}</ul>
          ) : <p className="mt-3 text-sm text-[#172033]/60">Nenhum integrante disponível.</p>}
        </div>
      </section>
    </main>
  );
}
