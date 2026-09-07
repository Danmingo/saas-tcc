import Link from "next/link";
import ProfessorGreeting from "@/app/professor/components/ProfessorGreeting";
import { getProfessorContext } from "@/lib/turmas";
import { listarProjetos, mensagemProjetoErro } from "@/lib/projetos";
import { formatarData, labelStatus } from "./form-config";
import ProjetoAviso from "./ProjetoAviso";

export default async function Page() {
  const context = await getProfessorContext();
  let projetos;
  try {
    projetos = await listarProjetos(context);
  } catch (error) {
    return <ProjetoAviso mensagem={mensagemProjetoErro(error)} />;
  }
  return (
    <main className="min-h-screen bg-[#F5F7FA] px-4 py-6 sm:px-6 sm:py-8 lg:px-10">
      <header className="border-b border-[#172033]/10 pb-6">
        <div>
          <ProfessorGreeting />
          <h1 className="mt-1 text-3xl font-bold text-[#172033]">Projetos dos alunos</h1>
          <p className="mt-2 text-sm text-[#172033]/60">Acompanhe os projetos criados pelos alunos das suas turmas.</p>
        </div>
      </header>
      {projetos.length === 0 ? (
        <section className="mt-8 rounded-2xl border border-[#172033]/10 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-[#172033]">Nenhum projeto cadastrado</h2>
          <p className="mt-2 text-sm leading-6 text-[#172033]/60">Os alunos ainda não criaram projetos nas suas turmas.</p>
        </section>
      ) : (
        <section aria-label="Projetos das suas turmas" className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {projetos.map((projeto) => (
            <article key={projeto.id} className="flex flex-col rounded-2xl border border-[#172033]/10 bg-white p-6 shadow-sm">
              <span className="self-start rounded-lg bg-[#6366F1]/10 px-3 py-1 text-xs font-semibold text-[#6366F1]">{labelStatus(projeto.status)}</span>
              <h2 className="mt-4 break-words text-lg font-bold text-[#172033]">
                <Link href={"/professor/projetos/" + encodeURIComponent(projeto.id)} className="hover:text-[#6366F1]">{projeto.titulo}</Link>
              </h2>
              <p className="mt-2 text-sm text-[#172033]/60">{projeto.turma.nome}</p>
              <p className="mb-5 mt-3 text-sm text-[#172033]/60">Prazo final: {formatarData(projeto.prazo_final)}</p>
              <Link href={"/professor/projetos/" + encodeURIComponent(projeto.id)} className="mt-auto text-sm font-semibold text-[#6366F1]">Ver detalhes →</Link>
            </article>
          ))}
        </section>
      )}
    </main>
  );
}
