import Link from "next/link";
import { listarEntregas, type Entrega } from "@/lib/entregas";
import { mensagemProjetoErro, type ProfessorContext } from "@/lib/projetos";
import { formatarData } from "@/app/professor/projetos/form-config";

export default async function Cronograma({ context, turmaId, feedback }: {
  context: ProfessorContext; turmaId: string; feedback?: string;
}) {
  let entregas: Entrega[] = [];
  let erro = "";
  try {
    entregas = await listarEntregas(context, turmaId);
  } catch (error) {
    erro = mensagemProjetoErro(error);
  }
  const base = "/professor/turmas/" + encodeURIComponent(turmaId) + "/entregas";
  return (
    <section id="cronograma" aria-labelledby="cronograma-titulo" className="mt-8 max-w-3xl rounded-2xl border border-[#172033]/10 bg-white p-4 shadow-sm sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 id="cronograma-titulo" className="font-[family-name:var(--font-manrope)] text-lg font-bold">Cronograma / Entregas</h2>
        <Link href={base + "/nova"} className="rounded-xl bg-[#6366F1] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#4F52D9]">Nova entrega</Link>
      </div>
      {(feedback === "criada" || feedback === "atualizada") && (
        <p role="status" className="mt-4 rounded-xl bg-[#22C55E]/10 p-3 text-sm text-[#15803D]">
          {feedback === "criada" ? "Entrega criada com sucesso." : "Entrega atualizada com sucesso."}
        </p>
      )}
      {erro ? <p role="alert" className="mt-4 text-sm text-red-600">{erro}</p> : !entregas.length ? (
        <p className="mt-4 text-sm text-[#172033]/60">Nenhuma entrega cadastrada. Crie a primeira entrega para organizar o cronograma desta turma.</p>
      ) : (
        <ol className="mt-5 space-y-4">
          {entregas.map((entrega) => (
            <li key={entrega.id} className={"rounded-xl border p-4 " + (entrega.status === "ativa" ? "border-[#6366F1]/20 bg-[#6366F1]/5" : "border-[#172033]/10 bg-[#F5F7FA]")}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <h3 className="min-w-0 break-words font-semibold">{entrega.titulo}</h3>
                <span className={"rounded-lg px-2.5 py-1 text-xs font-semibold " + (entrega.status === "ativa" ? "bg-[#6366F1]/10 text-[#6366F1]" : "bg-[#172033]/10 text-[#172033]/70")}>
                  {entrega.status === "ativa" ? "Ativa" : "Encerrada"}
                </span>
              </div>
              {entrega.descricao && <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-6 text-[#172033]/70">{entrega.descricao}</p>}
              <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-[#172033]/60">
                <span>Ordem: {entrega.ordem}</span>
                <span>Prazo: {entrega.prazo ? formatarData(entrega.prazo, true) + " (Brasília)" : "Não informado"}</span>
                <Link href={base + "/" + encodeURIComponent(entrega.id) + "/editar"} className="font-semibold text-[#6366F1] hover:underline">Editar entrega<span className="sr-only">: {entrega.titulo}</span></Link>
              </div>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}