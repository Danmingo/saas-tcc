import Link from "next/link";
import { formatarData } from "@/app/professor/projetos/form-config";
import { ErroEnvios, StatusVersao, TelaEnvios } from "@/app/components/EnviosUI";
import { carregarDashboardProfessor } from "@/lib/dashboards";
import TessHoje from "@/app/components/tess/TessHoje";

export default async function DashboardProfessorPage() {
  let dados;
  let erro = "";
  try { dados = await carregarDashboardProfessor(); } catch (error) { erro = error instanceof Error ? error.message : "Não foi possível carregar o dashboard."; }
  if (erro) return <TelaEnvios titulo="Dashboard" descricao="Acompanhe o que está acontecendo nas suas turmas." professor><ErroEnvios mensagem={erro} /></TelaEnvios>;
  if (!dados) return null;
  const entregas = dados.entregas.filter((entrega) => entrega.status === "ativa").slice(0, 5);
  const enviosPendentes = dados.envios.filter((envio) => envio.status === "enviada" || envio.status === "em_analise");
  return <TelaEnvios titulo="Dashboard" descricao="Acompanhe o que está acontecendo nas suas turmas." professor>
    <TessHoje dados={{ tipo: "professor", turmas: dados.turmas.length, projetos: dados.projetos.length, alunos: dados.alunos, versoes: enviosPendentes.length, entregas: entregas.length }} />
    <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{[["Turmas", dados.turmas.length], ["Projetos", dados.projetos.length], ["Alunos acompanhados", dados.alunos], ["Aguardando revisão", enviosPendentes.length]].map(([label, value]) => <section key={label} className="rounded-2xl border border-[#172033]/10 bg-white p-5 shadow-sm"><p className="text-sm text-[#172033]/60">{label}</p><p className="mt-2 text-3xl font-bold text-[#172033]">{value}</p></section>)}</div>
    <section className="mt-8 grid gap-6 lg:grid-cols-2"><div className="rounded-2xl border border-[#172033]/10 bg-white p-5 shadow-sm"><h2 className="text-lg font-bold text-[#172033]">Próximas entregas</h2>{!entregas.length ? <p className="mt-4 text-sm text-[#172033]/60">Nenhuma entrega ativa cadastrada.</p> : <ul className="mt-4 space-y-3">{entregas.map((entrega) => <li key={entrega.id} className="rounded-xl bg-[#F5F7FA] p-4"><p className="font-semibold text-[#172033]">{entrega.titulo}</p><p className="mt-1 text-sm text-[#172033]/60">{entrega.turma} · Prazo: {formatarData(entrega.prazo, true)}</p></li>)}</ul>}</div><div className="rounded-2xl border border-[#172033]/10 bg-white p-5 shadow-sm"><h2 className="text-lg font-bold text-[#172033]">Envios recentes</h2>{!dados.envios.length ? <p className="mt-4 text-sm text-[#172033]/60">Nenhum envio encontrado.</p> : <ul className="mt-4 space-y-3">{dados.envios.slice(0, 5).map((envio) => <li key={envio.id} className="rounded-xl bg-[#F5F7FA] p-4"><p className="font-semibold text-[#172033]">{envio.integrantes}</p><p className="mt-1 text-sm text-[#172033]/60">{envio.turma} · {envio.entrega} · Versão {envio.numero}</p><div className="mt-2 flex items-center justify-between gap-3"><StatusVersao status={envio.status} /><Link href={`/professor/entregas/${encodeURIComponent(envio.id)}`} className="text-sm font-semibold text-[#6366F1] hover:underline">Revisar</Link></div></li>)}</ul>}</div></section>
    {dados.devolutivas.length > 0 && <section className="mt-8 rounded-2xl border border-[#172033]/10 bg-white p-5 shadow-sm"><h2 className="text-lg font-bold text-[#172033]">Atividade recente</h2><p className="mt-3 text-sm text-[#172033]/60">Última devolutiva: {dados.devolutivas[0].versao.integrantes} · {formatarData(dados.devolutivas[0].data, true)}</p><Link href="/professor/devolutivas" className="mt-3 inline-block text-sm font-semibold text-[#6366F1]">Ver devolutivas</Link></section>}
  </TelaEnvios>;
}
