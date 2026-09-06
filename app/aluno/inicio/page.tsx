import EntrarTurmaForm from "./EntrarTurmaForm";
import { listarTurmasAluno } from "@/lib/aluno";

type InicioAlunoPageProps = {
  searchParams: Promise<{ entrou?: string | string[] }>;
};

export default async function InicioAlunoPage({ searchParams }: InicioAlunoPageProps) {
  const [turmas, parametros] = await Promise.all([listarTurmasAluno(), searchParams]);
  const entrou = parametros.entrou === "1";

  return (
    <main className="min-h-screen bg-[#F5F7FA] px-4 py-6 sm:px-6 sm:py-8 lg:px-10">
      <header className="border-b border-[#172033]/10 pb-6">
        <p className="text-sm font-medium text-[#6366F1]">
          Área do aluno
        </p>

        <h1 className="mt-1 text-2xl font-bold text-[#172033] sm:text-3xl">
          Olá, aluno
        </h1>

        <p className="mt-2 text-sm text-[#172033]/60">
          Acompanhe seu projeto, seus prazos e as devolutivas recebidas.
        </p>
      </header>

      <section className="mt-8 rounded-xl border border-[#172033]/10 bg-white p-4 shadow-sm sm:rounded-2xl sm:p-6">
        <p className="text-sm font-semibold text-[#6366F1]">
          Próxima ação
        </p>

        <h2 className="mt-2 text-xl font-bold text-[#172033]">
          Entre em uma turma
        </h2>

        <p className="mt-2 text-sm leading-6 text-[#172033]/60">
          Use o código de convite fornecido pelo professor para acessar seu
          projeto de TCC.
        </p>

        <EntrarTurmaForm />
      </section>

      {entrou && (
        <p role="status" className="mt-6 rounded-xl border border-[#22C55E]/20 bg-[#22C55E]/10 p-4 text-sm text-[#15803D]">
          Você entrou na turma com sucesso.
        </p>
      )}

      <section className="mt-8">
        <h2 className="text-xl font-bold text-[#172033]">Minhas turmas</h2>
        {turmas.length === 0 ? (
          <p className="mt-3 rounded-xl border border-[#172033]/10 bg-white p-4 text-sm text-[#172033]/60 shadow-sm sm:rounded-2xl sm:p-6">
            Você ainda não está vinculado a nenhuma turma.
          </p>
        ) : (
          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            {turmas.map((turma) => (
              <article key={turma.id} className="rounded-xl border border-[#172033]/10 bg-white p-4 shadow-sm sm:rounded-2xl sm:p-6">
                <h3 className="break-words text-lg font-bold text-[#172033]">{turma.nome}</h3>
                <p className="mt-2 break-words text-sm text-[#172033]/60">{turma.curso || "Curso não informado"}</p>
                <dl className="mt-4 space-y-2 text-sm text-[#172033]">
                  <div>
                    <dt className="inline text-[#172033]/60">Etapa: </dt>
                    <dd className="inline break-words">{turma.etapa || "Não informada"}</dd>
                  </div>
                  <div>
                    <dt className="inline text-[#172033]/60">Período: </dt>
                    <dd className="inline break-words">{turma.periodo || "Não informado"}</dd>
                  </div>
                  <div>
                    <dt className="inline text-[#172033]/60">Tipo de curso: </dt>
                    <dd className="inline break-words">{turma.tipo_curso || "Não informado"}</dd>
                  </div>
                </dl>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
