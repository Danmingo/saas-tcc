import { listarProjetosAluno, type ProjetoAluno } from "@/lib/projeto-aluno";
import { formatarData, labelStatus } from "@/app/professor/projetos/form-config";
import ProjetoAlunoForm from "./ProjetoAlunoForm";

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
            </li>
          ))}</ol>
        )}
      </div>
      <ProjetoAlunoForm projeto={projeto} />
    </section>
  );
}

type MeuProjetoPageProps = {
  searchParams: Promise<{ atualizado?: string | string[] }>;
};

export default async function Page({ searchParams }: MeuProjetoPageProps) {
  const projetos = await listarProjetosAluno();
  const parametros = await searchParams;

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

      {!projetos.length ? (
        <section className="mt-8 rounded-xl border border-[#172033]/10 bg-white p-6 shadow-sm sm:rounded-2xl">
          <h2 className="text-lg font-bold text-[#172033]">Nenhum projeto vinculado</h2>
          <p className="mt-2 text-sm leading-6 text-[#172033]/60">Você ainda não está vinculado a um projeto. Entre em uma turma e aguarde o professor organizar seu projeto.</p>
        </section>
      ) : projetos.map((projeto) => <DetalhesProjetoAluno key={projeto.id} projeto={projeto} />)}
    </main>
  );
}
