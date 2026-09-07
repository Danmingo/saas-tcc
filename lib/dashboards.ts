import "server-only";

import { getAlunoContext } from "@/lib/aluno";
import { listarProjetosAluno, listarTurmasAluno, type ProjetoAluno } from "@/lib/projeto-aluno";
import { getProfessorContext } from "@/lib/turmas";
import { listarProjetos } from "@/lib/projetos";
import { listarDevolutivas, listarVersoesAluno, listarVersoesProfessor } from "@/lib/envios";

export type EntregaDashboard = {
  id: string;
  turmaId: string;
  titulo: string;
  turma: string;
  prazo: string | null;
  status: "ativa" | "encerrada";
};

export async function carregarDashboardProfessor() {
  const context = await getProfessorContext();
  const turmas = await context.supabase.from("turmas").select("id,nome")
    .eq("professor_id", context.professor.id).returns<{ id: string; nome: string }[]>();
  if (turmas.error) throw new Error("Não foi possível carregar suas turmas.");

  const turmaIds = (turmas.data ?? []).map((turma) => turma.id);
  const [projetos, alunos, entregasResult, envios] = await Promise.all([
    listarProjetos(context),
    turmaIds.length
      ? context.supabase.from("turma_alunos").select("aluno_id").in("turma_id", turmaIds)
      : Promise.resolve({ data: [], error: null }),
    turmaIds.length
      ? context.supabase.from("entregas").select("id,turma_id,titulo,prazo,status")
        .in("turma_id", turmaIds).order("prazo", { ascending: true, nullsFirst: false })
        .returns<{ id: string; turma_id: string; titulo: string; prazo: string | null; status: "ativa" | "encerrada" }[]>()
      : Promise.resolve({ data: [], error: null }),
    listarVersoesProfessor(),
  ]);
  if (alunos.error || entregasResult.error) throw new Error("Não foi possível carregar os dados das turmas.");

  const turmasMap = new Map((turmas.data ?? []).map((turma) => [turma.id, turma.nome]));
  const entregas: EntregaDashboard[] = (entregasResult.data ?? []).map((entrega) => ({
    id: entrega.id,
    turmaId: entrega.turma_id,
    titulo: entrega.titulo,
    turma: turmasMap.get(entrega.turma_id) ?? "Turma",
    prazo: entrega.prazo,
    status: entrega.status,
  }));
  const devolutivas = await listarDevolutivas({ supabase: context.supabase, perfil: context.professor }, envios.versoes);

  return {
    turmas: turmas.data ?? [],
    projetos,
    alunos: new Set((alunos.data ?? []).map((aluno) => aluno.aluno_id)).size,
    entregas,
    envios: envios.versoes,
    devolutivas,
  };
}

export type AcaoAluno = "criar_projeto" | "enviar_arquivo" | "ver_devolutiva" | "aguardar_revisao" | "entrega_encerrada" | "nenhuma";

export type DashboardAluno = {
  projetos: ProjetoAluno[];
  projeto: ProjetoAluno | null;
  ultimaVersao: Awaited<ReturnType<typeof listarVersoesAluno>>["versoes"][number] | null;
  ultimaDevolutiva: Awaited<ReturnType<typeof listarDevolutivas>>[number] | null;
  proximaEntrega: ProjetoAluno["entregas"][number] | null;
  acao: AcaoAluno;
};

export async function carregarDashboardAluno(): Promise<DashboardAluno> {
  const [projetos, turmas, envios] = await Promise.all([
    listarProjetosAluno(),
    listarTurmasAluno(),
    listarVersoesAluno(),
  ]);
  const projeto = projetos[0] ?? null;
  if (!projeto) {
    return { projetos, projeto: null, ultimaVersao: null, ultimaDevolutiva: null, proximaEntrega: null, acao: turmas.length ? "criar_projeto" : "nenhuma" };
  }

  const contexto = await getAlunoContext();
  const devolutivas = await listarDevolutivas({ supabase: contexto.supabase, perfil: contexto.aluno }, envios.versoes);
  const versoesDoProjeto = envios.versoes.filter((versao) => versao.projetoId === projeto.id);
  const ultimaVersao = versoesDoProjeto[0] ?? null;
  const devolutivasDoProjeto = devolutivas.filter((devolutiva) => devolutiva.versao.projetoId === projeto.id);
  const ultimaDevolutiva = devolutivasDoProjeto[0] ?? null;
  const proximaEntrega = projeto.entregas
    .filter((entrega) => entrega.status === "ativa")
    .sort((a, b) => (a.prazo ?? "9999").localeCompare(b.prazo ?? "9999"))[0] ?? null;

  let acao: AcaoAluno = "nenhuma";
  if (ultimaDevolutiva) acao = "ver_devolutiva";
  else if (ultimaVersao?.status === "enviada" || ultimaVersao?.status === "em_analise") acao = "aguardar_revisao";
  else if (proximaEntrega?.status === "ativa" && !versoesDoProjeto.some((versao) => versao.entregaId === proximaEntrega.id)) acao = "enviar_arquivo";
  else if (projeto.entregas.length && !proximaEntrega) acao = "entrega_encerrada";

  return { projetos, projeto, ultimaVersao, ultimaDevolutiva, proximaEntrega, acao };
}
