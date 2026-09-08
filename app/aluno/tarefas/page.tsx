import { listarPendenciasAluno, mensagemPendencia, type Pendencia } from "@/lib/pendencias";
import TarefaConcluirForm from "./TarefaConcluirForm";
import TessQuickActions from "@/app/components/tess/TessQuickActions";

function data(valor: string | null, hora = false) {
  if (!valor) return "Sem prazo";
  return new Intl.DateTimeFormat("pt-BR", hora ? { dateStyle: "short", timeStyle: "short" } : { dateStyle: "short" }).format(new Date(valor));
}

function prioridade(valor: string) {
  return ({ baixa: "Baixa", media: "Média", alta: "Alta" } as Record<string, string>)[valor] ?? valor;
}

function Cartao({ tarefa }: { tarefa: Pendencia }) {
  return <article className="rounded-xl border border-[#172033]/10 bg-white p-5 shadow-sm">
    <div className="flex flex-wrap items-start justify-between gap-3"><h3 className="font-semibold">{tarefa.descricao}</h3><span className="rounded-lg bg-[#6366F1]/10 px-2.5 py-1 text-xs font-semibold text-[#6366F1]">{prioridade(tarefa.prioridade)}</span></div>
    <dl className="mt-4 grid gap-3 text-sm text-[#172033]/70 sm:grid-cols-2"><div><dt className="text-xs text-[#172033]/50">Projeto / turma</dt><dd className="mt-1 font-medium text-[#172033]">{tarefa.projeto?.titulo} / {tarefa.projeto?.turma_nome}</dd></div><div><dt className="text-xs text-[#172033]/50">Responsável</dt><dd className="mt-1 font-medium text-[#172033]">{tarefa.responsavel || "Projeto / grupo"}</dd></div><div><dt className="text-xs text-[#172033]/50">Prazo</dt><dd className="mt-1">{data(tarefa.prazo)}</dd></div><div><dt className="text-xs text-[#172033]/50">Criada em</dt><dd className="mt-1">{data(tarefa.criado_em, true)}</dd></div></dl>
    <div className="mt-5 border-t border-[#172033]/10 pt-4"><TessQuickActions role="aluno" contextType="pendencia" contextId={tarefa.id} label="✨ Trabalhar com a Tess" />{tarefa.status === "pendente" && <div className="mt-4"><TarefaConcluirForm id={tarefa.id} /></div>}</div>{tarefa.status !== "pendente" && <p className="mt-4 text-sm font-medium text-[#15803D]">Concluída em {data(tarefa.resolvida_em, true)}</p>}
  </article>;
}

function Grupo({ titulo, tarefas }: { titulo: string; tarefas: Pendencia[] }) {
  return <section className="mt-8"><h2 className="text-xl font-bold text-[#172033]">{titulo}</h2>{tarefas.length ? <div className="mt-4 grid gap-4 lg:grid-cols-2">{tarefas.map((tarefa) => <Cartao key={tarefa.id} tarefa={tarefa} />)}</div> : <p className="mt-3 rounded-xl border border-dashed border-[#172033]/20 p-5 text-sm text-[#172033]/60">Nenhuma pendência nesta seção.</p>}</section>;
}

export default async function Page() {
  let tarefas: Pendencia[];
  try { tarefas = await listarPendenciasAluno(); } catch (error) { return <main className="min-h-screen bg-[#F5F7FA] px-4 py-6 sm:px-6 sm:py-8 lg:px-10"><p role="alert" className="rounded-xl border border-red-200 bg-white p-5 text-sm text-red-600">{mensagemPendencia(error)}</p></main>; }
  const pendentes = tarefas.filter((item) => item.status === "pendente");
  const concluidas = tarefas.filter((item) => item.status !== "pendente");
  return <main className="min-h-screen bg-[#F5F7FA] px-4 py-6 sm:px-6 sm:py-8 lg:px-10"><header className="border-b border-[#172033]/10 pb-6"><p className="text-sm font-medium text-[#6366F1]">Área do aluno</p><h1 className="mt-1 text-3xl font-bold text-[#172033]">Tarefas</h1><p className="mt-2 text-sm text-[#172033]/60">Acompanhe as atividades pendentes e concluídas.</p></header>{!tarefas.length && <section className="mt-8 rounded-xl border border-[#172033]/10 bg-white p-6 shadow-sm"><h2 className="text-lg font-bold">Nenhuma pendência</h2><p className="mt-2 text-sm text-[#172033]/60">Quando houver uma tarefa de orientação para seu projeto, ela aparecerá aqui.</p></section>}{!!tarefas.length && <><Grupo titulo="Pendentes" tarefas={pendentes} /><Grupo titulo="Concluídas" tarefas={concluidas} /></>}</main>;
}
