import Link from "next/link";
import { formatarData } from "@/app/professor/projetos/form-config";
import { ErroEnvios, StatusVersao, TelaEnvios } from "@/app/components/EnviosUI";
import { carregarDashboardAluno } from "@/lib/dashboards";
import { listarPendenciasAluno } from "@/lib/pendencias";
import TessHoje from "@/app/components/tess/TessHoje";

const acaoLabel = { criar_projeto: "Criar projeto", enviar_arquivo: "Enviar arquivo", ver_devolutiva: "Ver devolutiva", aguardar_revisao: "Aguardando revisão", entrega_encerrada: "Entrega encerrada", nenhuma: "Nenhuma ação pendente" } as const;

export default async function DashboardAlunoPage() {
  let dados;
  let erro = "";
  try { dados = await carregarDashboardAluno(); } catch (error) { erro = error instanceof Error ? error.message : "Não foi possível carregar o dashboard."; }
  if (erro) return <TelaEnvios titulo="Dashboard" descricao="Acompanhe o progresso, os prazos e as atividades do seu TCC."><ErroEnvios mensagem={erro} /></TelaEnvios>;
  if (!dados) return null;
  const projeto = dados.projeto;
  const pendencias = projeto ? await listarPendenciasAluno() : [];
  return <TelaEnvios titulo="Dashboard" descricao="Acompanhe o progresso, os prazos e as atividades do seu TCC.">
    {!projeto ? <><TessHoje dados={{ tipo: "aluno", pendencias: 0, devolutivaRecente: false, proximaEntrega: null, ultimaVersao: null }} /><section className="mt-8 rounded-2xl border border-[#172033]/10 bg-white p-6 shadow-sm"><h2 className="text-lg font-bold text-[#172033]">Nenhum projeto atual</h2><p className="mt-2 text-sm leading-6 text-[#172033]/60">Crie ou entre em uma turma para começar seu projeto.</p><Link href="/aluno/meu-projeto" className="mt-5 inline-block rounded-xl bg-[#6366F1] px-5 py-2.5 text-sm font-semibold text-white">Ir para Meu projeto</Link></section></> : <>
      <section className="mt-8 rounded-2xl border border-[#172033]/10 bg-white p-5 shadow-sm"><p className="text-sm text-[#172033]/60">Projeto atual</p><h2 className="mt-1 text-2xl font-bold text-[#172033]">{projeto.titulo === "Projeto sem título" ? "Título ainda não definido pelo aluno" : projeto.titulo}</h2><p className="mt-2 text-sm text-[#172033]/60">Turma: {projeto.turma.nome}</p><Link href="/aluno/meu-projeto" className="mt-4 inline-block text-sm font-semibold text-[#6366F1]">Abrir Meu projeto</Link></section>
      <div className="mt-6 grid gap-4 sm:grid-cols-2"><section className="rounded-2xl border border-[#172033]/10 bg-white p-5 shadow-sm"><p className="text-sm text-[#172033]/60">Próxima entrega</p>{dados.proximaEntrega ? <><h3 className="mt-2 font-semibold text-[#172033]">{dados.proximaEntrega.titulo}</h3><p className="mt-1 text-sm text-[#172033]/60">Prazo: {formatarData(dados.proximaEntrega.prazo, true)} · {dados.proximaEntrega.status === "ativa" ? "Ativa" : "Encerrada"}</p></> : <p className="mt-2 text-sm text-[#172033]/60">Não há entrega ativa cadastrada.</p>}</section><section className="rounded-2xl border border-[#172033]/10 bg-white p-5 shadow-sm"><p className="text-sm text-[#172033]/60">Última versão</p>{dados.ultimaVersao ? <><h3 className="mt-2 font-semibold text-[#172033]">{dados.ultimaVersao.nomeArquivo}</h3><p className="mt-1 text-sm text-[#172033]/60">Versão {dados.ultimaVersao.numero} · {formatarData(dados.ultimaVersao.data, true)}</p><div className="mt-2"><StatusVersao status={dados.ultimaVersao.status} /></div></> : <p className="mt-2 text-sm text-[#172033]/60">Nenhuma versão enviada.</p>}</section></div>
      {dados.ultimaDevolutiva && <section className="mt-6 rounded-2xl border border-[#172033]/10 bg-white p-5 shadow-sm"><p className="text-sm text-[#172033]/60">Última devolutiva</p><p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-[#172033]">{dados.ultimaDevolutiva.comentario}</p><Link href="/aluno/devolutivas" className="mt-3 inline-block text-sm font-semibold text-[#6366F1]">Ver devolutivas</Link></section>}
      <TessHoje dados={{ tipo: "aluno", pendencias: pendencias.filter((item) => item.status === "pendente").length, devolutivaRecente: Boolean(dados.ultimaDevolutiva), proximaEntrega: dados.proximaEntrega?.titulo ?? null, ultimaVersao: dados.ultimaVersao?.nomeArquivo ?? null }} />
      <section className="mt-6 rounded-2xl border border-[#6366F1]/20 bg-[#6366F1]/5 p-5"><p className="text-sm text-[#172033]/60">Próxima ação</p><p className="mt-1 text-lg font-bold text-[#172033]">{acaoLabel[dados.acao]}</p>{dados.acao === "enviar_arquivo" && <Link href="/aluno/versoes" className="mt-3 inline-block text-sm font-semibold text-[#6366F1]">Enviar arquivo</Link>}</section>
    </>}
  </TelaEnvios>;
}
