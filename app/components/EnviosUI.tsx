import Link from "next/link";
import type { ReactNode } from "react";
import ProfessorGreeting from "@/app/professor/components/ProfessorGreeting";
import { formatarData } from "@/app/professor/projetos/form-config";
import { STATUS_VERSAO, TIPOS_DEVOLUTIVA } from "@/lib/arquivos";

export type VersaoVista = {
  id: string; projetoId: string; turmaId: string; entregaId: string; numero: number;
  nomeArquivo: string; data: string; autor: string; status: string;
  turma: string; entrega: string; integrantes: string; titulo: string; tema: string | null;
};
export type DevolutivaVista = {
  id: string; versao: VersaoVista; professor: string; comentario: string; tipo: string; data: string;
};
export const cardClass = "mt-6 rounded-2xl border border-[#172033]/10 bg-white p-4 text-[#172033] shadow-sm sm:p-6";
export const botaoClass = "rounded-xl bg-[#6366F1] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#4F52D9] disabled:opacity-60";
export const campoClass = "mt-2 w-full rounded-xl border border-[#172033]/15 bg-white px-3 py-2.5 text-sm text-[#172033] focus:border-[#6366F1]";
export function TelaEnvios({ titulo, descricao, professor = false, children }: {
  titulo: string; descricao: string; professor?: boolean; children: ReactNode;
}) {
  return <main className="min-h-screen bg-[#F5F7FA] px-4 py-6 text-[#172033] sm:px-6 sm:py-8 lg:px-10">
    <header className="border-b border-[#172033]/10 pb-6">
      {professor ? <ProfessorGreeting /> : <p className="text-sm font-medium text-[#6366F1]">Área do aluno</p>}
      <h1 className="mt-1 text-3xl font-bold">{titulo}</h1>
      <p className="mt-2 text-sm text-[#172033]/60">{descricao}</p>
    </header>{children}
  </main>;
}
export function ErroEnvios({ mensagem }: { mensagem: string }) {
  return <p role="alert" className={cardClass + " text-sm text-red-600"}>{mensagem}</p>;
}
export function StatusVersao({ status }: { status: string }) {
  return <span className={"inline-block rounded-lg px-2.5 py-1 text-xs font-semibold " + (status === "aprovada" ? "bg-green-50 text-green-700" : status === "correcao_solicitada" ? "bg-amber-50 text-amber-800" : "bg-[#6366F1]/10 text-[#6366F1]")}>
    {STATUS_VERSAO.find(([valor]) => valor === status)?.[1] ?? status}
  </span>;
}
export function DadosVersao({ versao, professor = false }: { versao: VersaoVista; professor?: boolean }) {
  return <>
    <h2 className="break-words text-lg font-bold">{professor ? versao.integrantes : versao.entrega}</h2>
    <p className="mt-1 break-words text-sm text-[#172033]/60">{versao.titulo}</p>
    <p className="mt-2 text-sm text-[#172033]/70">{versao.turma} · {versao.entrega}</p>
    <p className="mt-3 break-words text-sm font-medium">Versão {versao.numero} · {versao.nomeArquivo}</p>
    <p className="mt-1 text-sm text-[#172033]/60">Enviada em {formatarData(versao.data, true)} (Brasília) por {versao.autor}</p>
    <div className="mt-3"><StatusVersao status={versao.status} /></div>
  </>;
}
export function ArquivoLink({ versaoId }: { versaoId: string }) {
  // Link simples: URL assinada é criada apenas no clique, nunca no prefetch.
  return <a href={"/api/versoes/" + encodeURIComponent(versaoId) + "/arquivo"} target="_blank" rel="noopener noreferrer"
    className="text-sm font-semibold text-[#6366F1] hover:underline">Baixar arquivo</a>;
}
export function ListaVersoes({ versoes, professor = false }: { versoes: VersaoVista[]; professor?: boolean }) {
  if (!versoes.length) return <p className={cardClass + " text-sm"}>Nenhuma versão enviada.</p>;
  return <div>{versoes.map((v) => <article key={v.id} className={cardClass}>
    <DadosVersao versao={v} professor={professor} />
    <div className="mt-4 flex flex-wrap gap-5"><ArquivoLink versaoId={v.id} />
      {professor && <Link href={"/professor/entregas/" + encodeURIComponent(v.id)} className="text-sm font-semibold text-[#6366F1] hover:underline">Revisar versão</Link>}
    </div>
  </article>)}</div>;
}
export function ListaDevolutivas({ devolutivas, professor = false }: { devolutivas: DevolutivaVista[]; professor?: boolean }) {
  if (!devolutivas.length) return <p className={cardClass + " text-sm"}>Ainda não há devolutivas.</p>;
  return <div>{devolutivas.map((d) => <article key={d.id} className={cardClass}>
    {professor && <h2 className="break-words font-bold">{d.versao.integrantes}</h2>}
    <p className="text-sm font-semibold">{d.versao.entrega} · Versão {d.versao.numero}</p>
    <p className="mt-1 break-words text-sm text-[#172033]/60">{d.versao.titulo}</p>
    <p className="mt-3 text-sm font-semibold text-[#6366F1]">{TIPOS_DEVOLUTIVA.find(([tipo]) => tipo === d.tipo)?.[1] ?? d.tipo}</p>
    <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-6">{d.comentario}</p>
    <p className="mt-3 text-xs text-[#172033]/60">{d.professor} · {formatarData(d.data, true)} (Brasília)</p>
    {professor && <Link href={"/professor/entregas/" + encodeURIComponent(d.versao.id)} className="mt-3 inline-block text-sm font-semibold text-[#6366F1]">Abrir versão</Link>}
  </article>)}</div>;
}
