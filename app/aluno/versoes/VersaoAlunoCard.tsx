"use client";

import UploadForm from "./UploadForm";
import { ListaVersoes } from "@/app/components/EnviosUI";
import type { EnvioDetalhe } from "@/lib/envios";

type Projeto = { id: string; turma_id: string; titulo: string; tema: string | null };
type Entrega = { id: string; turma_id: string; titulo: string; descricao: string | null; prazo: string | null; status: "ativa" | "encerrada" };

export default function VersaoAlunoCard({ projeto, entregas, versoes }: {
  projeto: Projeto; entregas: Entrega[]; versoes: EnvioDetalhe[];
}) {
  return (
    <section className="mt-8 rounded-2xl border border-[#172033]/10 bg-white p-4 text-[#172033] shadow-sm sm:p-6">
      <h2 className="break-words text-xl font-bold">{projeto.titulo === "Projeto sem título" ? "Título ainda não definido pelo aluno" : projeto.titulo}</h2>
      <p className="mt-1 break-words text-sm text-[#172033]/60">{projeto.tema || "Tema ainda não informado"}</p>
      <div className="mt-6 space-y-6">
        {entregas.length ? entregas.map((entrega) => {
          const historico = versoes.filter((versao) => versao.entregaId === entrega.id);
          return (
            <article id={`entrega-${projeto.id}-${entrega.id}`} key={entrega.id} className="rounded-xl border border-[#172033]/10 bg-[#F5F7FA] p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <h3 className="break-words font-semibold">{entrega.titulo}</h3>
                <span className={"rounded-lg px-2.5 py-1 text-xs font-semibold " + (entrega.status === "ativa" ? "bg-green-50 text-green-700" : "bg-[#172033]/10 text-[#172033]/70")}>
                  {entrega.status === "ativa" ? "Ativa" : "Encerrada"}
                </span>
              </div>
              {entrega.descricao && <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-6 text-[#172033]/70">{entrega.descricao}</p>}
              {entrega.status === "ativa" && <UploadForm projetoId={projeto.id} entregaId={entrega.id} ativa />}
              {entrega.status === "encerrada" && <p className="mt-3 text-sm text-[#172033]/60">Entrega encerrada. Novos arquivos não podem ser enviados.</p>}
              <div className="mt-5"><h4 className="text-sm font-semibold">Histórico de versões</h4><ListaVersoes versoes={historico} /></div>
            </article>
          );
        }) : <p className="text-sm text-[#172033]/60">Nenhuma entrega cadastrada para esta turma.</p>}
      </div>
    </section>
  );
}