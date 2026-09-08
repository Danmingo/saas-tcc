import { listarProjetosAluno, listarTurmasAluno, type ProjetoAluno, type TurmaProjetoAluno } from "@/lib/projeto-aluno";
import { formatarData, labelStatus } from "@/app/professor/projetos/form-config";
import ProjetoAlunoForm from "./ProjetoAlunoForm";
import Link from "next/link";
import CriarProjetoForm from "./CriarProjetoForm";
import ContextoAcademico from "@/app/components/ContextoAcademico";
import ContextoAcademicoForm from "./ContextoAcademicoForm";

function DetalhesProjetoAluno({ projeto }: { projeto: ProjetoAluno }) {
  return (
    <section className="mt-8 rounded-xl border border-[#172033]/10 bg-white p-4 shadow-sm sm:rounded-2xl sm:p-6">
      <h2 className="text-xl font-bold text-[#172033]">{projeto.titulo === "Projeto sem título" ? "Título ainda não definido pelo aluno" : projeto.titulo}</h2>
      <dl className="mt-6 grid gap-5 sm:grid-cols-2">
        <div><dt className="text-sm text-[#172033]/60">Turma</dt><dd className="mt-1 text-sm font-medium">{projeto.turma.nome}</dd></div>
        <div><dt className="text-sm text-[#172033]/60">Status</dt><dd className="mt-1 text-sm font-medium">{labelStatus(projeto.status)}</dd></div>
        <div className="sm:col-span-2"><dt className="text-sm text-[#172033]/60">Tema</dt><dd className="mt-1 break-words text-sm">{projeto.tema || "Tema ainda não informado"}</dd></div>
        <div className="sm:col-span-2"><dt className="text-sm text-[#172033]/60">Descrição</dt><dd className="mt-1 whitespace-pre-wrap break-words text-sm leading-6">{projeto.descricao || "Descrição ainda não informada"}</dd></div>
        <div><dt className="text-sm text-[#172033]/60">Data de início</dt><dd className="mt-1 text-sm">{formatarData(projeto.data_inicio)}</dd></div>
        <div><dt className="text-sm text-[#172033]/60">Prazo final</dt><dd className="mt-1 text-sm">{formatarData(projeto.prazo_final)}</dd></div>
      </dl>
      <div className="mt-6 border-t border-[#172033]/10 pt-6">
        <h3 className="text-lg font-bold text-[#172033]">Integrantes</h3>
        <ul className="mt-3 space-y-2 text-sm">{projeto.integrantes.map((integrante) => <li key={integrante.id}>{integrante.nome || "Aluno sem nome cadastrado"}</li>)}</ul>
      </div>
      <div className="mt-6 border-t border-[#172033]/10 pt-6">
        <h3 className="text-lg font-bold text-[#172033]">Cronograma / Entregas</h3>
        {!projeto.entregas.length ? <p className="mt-3 text-sm text-[#172033]/60">Nenhuma entrega cadastrada.</p> : (
          <ol className="mt-4 space-y-3">{projeto.entregas.map((entrega) => (
            <li key={entrega.id} className="rounded-xl border border-[#172033]/10 bg-[#F5F7FA] p-4">
              <div className="flex flex-wrap items-start justify-between gap-3"><h4 className="font-semibold">{entrega.titulo}</h4><span className="text-xs font-semibold text-[#172033]/60">{entrega.status === "ativa" ? "Ativa" : "Encerrada"}</span></div>
              {entrega.descricao && <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-[#172033]/70">{entrega.descricao}</p>}
              <p className="mt-2 text-sm text-[#172033]/60">Prazo: {formatarData(entrega.prazo, true)} (Brasília)</p>
              <Link href={"/aluno/versoes#entrega-" + projeto.id + "-" + entrega.id} className="mt-3 inline-block text-sm font-semibold text-[#6366F1]">
                {entrega.status === "ativa" ? "Enviar arquivo / Ver versões" : "Ver versões"}
              </Link>
            </li>
          ))}</ol>
        )}
      </div>
      <ProjetoAlunoForm projeto={projeto} />
      <section aria-labelledby={`contexto-titulo-${projeto.id}`} className="mt-6 border-t border-[#172033]/10 pt-6">
        <h3 id={`contexto-titulo-${projeto.id}`} className="text-lg font-bold text-[#172033]">Contexto acadêmico</h3>
        <p className="mt-2 text-sm text-[#172033]/60">Estas informações pertencem ao projeto e são compartilhadas por todos os integrantes.</p>
        <ContextoAcademico contexto={projeto} />
        <ContextoAcademicoForm projeto={projeto} />
      </section>
    </section>
  );
}

type MeuProjetoPageProps = {
  searchParams: Promise<{ atualizado?: string | string[]; criado?: string | string[] }>;
};

function CriacaoProjeto({ turmas }: { turmas: TurmaProjetoAluno[] }) {
  if (!turmas.length) return <p className="mt-3 text-sm text-[#172033]/60">Você ainda não entrou em nenhuma turma. Entre em uma turma para criar seu projeto.</p>;
  return <CriarProjetoForm turmas={turmas} />;
}

export default async function Page({ searchParams }: MeuProjetoPageProps) {
  const [projetos, turmas] = await Promise.all([listarProjetosAluno(), listarTurmasAluno()]);
  const parametros = await searchParams;
  const turmasComProjeto = new Set(projetos.map((projeto) => projeto.turma_id));
  const turmasDisponiveis = turmas.filter((turma) => !turmasComProjeto.has(turma.id));

  return (
    <main className="min-h-screen bg-[#F5F7FA] px-4 py-6 sm:px-6 sm:py-8 lg:px-10">
      <header className="border-b border-[#172033]/10 pb-6">
        <p className="text-sm font-medium text-[#6366F1]">
          Área do aluno
        </p>

        <h1 className="mt-1 text-3xl font-bold text-[#172033]">
          Meu projeto
        </h1>

        <p className="mt-2 text-sm text-[#172033]/60">
          Consulte as informações gerais e os integrantes do seu projeto.
        </p>
      </header>

      {parametros.atualizado === "1" && (
        <p role="status" className="mt-6 rounded-xl border border-[#22C55E]/20 bg-[#22C55E]/10 p-4 text-sm text-[#15803D]">
          Informações do projeto atualizadas com sucesso.
        </p>
      )}

      {parametros.criado === "1" && (
        <p role="status" className="mt-6 rounded-xl border border-[#22C55E]/20 bg-[#22C55E]/10 p-4 text-sm text-[#15803D]">
          Projeto criado com sucesso.
        </p>
      )}

      {!projetos.length ? (
        <section className="mt-8">
          <h2 className="text-xl font-bold text-[#172033]">Crie seu projeto</h2>
          <p className="mt-2 text-sm text-[#172033]/60">Escolha uma turma da qual você participa e defina o conteúdo acadêmico do seu TCC.</p>
          <CriacaoProjeto turmas={turmasDisponiveis} />
        </section>
      ) : (
        <>
          {projetos.map((projeto) => <DetalhesProjetoAluno key={projeto.id} projeto={projeto} />)}
          {turmasDisponiveis.length > 0 && <section className="mt-8"><h2 className="text-xl font-bold text-[#172033]">Outro projeto</h2><p className="mt-2 text-sm text-[#172033]/60">Você ainda pode criar um projeto em outra turma da qual participa.</p><CriacaoProjeto turmas={turmasDisponiveis} /></section>}
        </>
      )}
    </main>
  );
}
