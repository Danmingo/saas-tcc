import Link from "next/link";
import { formatarData } from "@/app/professor/projetos/form-config";
import { ErroEnvios, TelaEnvios } from "@/app/components/EnviosUI";
import { listarNotificacoesUsuario, marcarNotificacaoComoLida, marcarTodasComoLidas } from "@/lib/notificacoes";

export default async function NotificacoesAlunoPage() {
  let notificacoes = [] as Awaited<ReturnType<typeof listarNotificacoesUsuario>>;
  let erro = "";
  try { notificacoes = await listarNotificacoesUsuario("aluno"); } catch (error) { erro = error instanceof Error ? error.message : "Não foi possível carregar suas notificações."; }
  const pendentes = notificacoes.some((notificacao) => !notificacao.lida);

  return <TelaEnvios titulo="Notificações" descricao="Consulte prazos, avisos e atualizações importantes.">
    {erro ? <ErroEnvios mensagem={erro} /> : <>
      {pendentes && <form action={marcarTodasComoLidas.bind(null, "aluno")} className="mt-6"><button type="submit" className="rounded-xl bg-[#6366F1] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#4F52D9]">Marcar todas como lidas</button></form>}
      {!notificacoes.length ? <p className="mt-8 rounded-2xl border border-[#172033]/10 bg-white p-6 text-sm text-[#172033]/60 shadow-sm">Você não tem notificações no momento.</p> : <div className="mt-8 space-y-3">{notificacoes.map((notificacao) => <article key={notificacao.id} className={`rounded-2xl border bg-white p-5 shadow-sm ${notificacao.lida ? "border-[#172033]/10" : "border-[#6366F1]/30 bg-[#6366F1]/5"}`}><div className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-xs font-semibold uppercase tracking-wide text-[#6366F1]">{notificacao.tipo}</p><p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-[#172033]">{notificacao.mensagem}</p></div>{!notificacao.lida && <span className="rounded-lg bg-[#6366F1]/10 px-2.5 py-1 text-xs font-semibold text-[#6366F1]">Não lida</span>}</div><div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-[#172033]/60"><span>{formatarData(notificacao.criado_em, true)} (Brasília)</span>{notificacao.link && <Link href={notificacao.link} className="font-semibold text-[#6366F1] hover:underline">Abrir</Link>}{!notificacao.lida && <form action={marcarNotificacaoComoLida.bind(null, notificacao.id, "aluno")}><button type="submit" className="font-semibold text-[#6366F1] hover:underline">Marcar como lida</button></form>}</div></article>)}</div>}
    </>}
  </TelaEnvios>;
}
