import Link from "next/link";
import { notFound } from "next/navigation";
import { ArquivoLink, DadosVersao, ErroEnvios, ListaDevolutivas, TelaEnvios } from "@/app/components/EnviosUI";
import { buscarVersao, contextoProfessor, listarDevolutivas } from "@/lib/envios";
import VersaoStatusForm from "../VersaoStatusForm";
import TessVersionReview from "./TessVersionReview";

export default async function VersaoProfessorPage({ params }: { params: Promise<{ versaoId: string }> }) {
  const { versaoId } = await params;
  const context = await contextoProfessor();
  const versao = await buscarVersao(context, versaoId);
  if (!versao) notFound();
  let devolutivas;
  try {
    devolutivas = await listarDevolutivas(context, [versao]);
  } catch (error) {
    return <TelaEnvios titulo="Revisar versão" descricao="Consulte o envio e registre uma devolutiva." professor><ErroEnvios mensagem={error instanceof Error ? error.message : "Não foi possível carregar as devolutivas."} /></TelaEnvios>;
  }
  return <TelaEnvios titulo="Revisar versão" descricao="Consulte o envio e registre uma devolutiva." professor><section className="mt-8 max-w-3xl rounded-2xl border border-[#172033]/10 bg-white p-4 text-[#172033] shadow-sm sm:p-6"><DadosVersao versao={versao} professor /><div className="mt-4 flex flex-wrap gap-5"><ArquivoLink versaoId={versao.id} /><Link href="/professor/entregas" className="text-sm font-semibold text-[#6366F1] hover:underline">Voltar para envios</Link></div><VersaoStatusForm versaoId={versao.id} status={versao.status} /><TessVersionReview versaoId={versao.id} /><div className="mt-7 border-t border-[#172033]/10 pt-5"><h2 className="text-lg font-bold">Histórico de devolutivas</h2><ListaDevolutivas devolutivas={devolutivas} professor /></div></section></TelaEnvios>;
}