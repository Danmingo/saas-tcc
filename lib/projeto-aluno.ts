import "server-only";

import { getAlunoContext } from "@/lib/aluno";

export type ProjetoAluno = {
  id: string;
  turma_id: string;
  titulo: string;
  tema: string | null;
  descricao: string | null;
  status: string;
  data_inicio: string | null;
  prazo_final: string | null;
  criado_em: string;
  atualizado_em: string | null;
  turma: { id: string; nome: string };
  integrantes: { id: string; nome: string | null }[];
  entregas: EntregaAluno[];
};

export type EntregaAluno = {
  id: string;
  titulo: string;
  descricao: string | null;
  prazo: string | null;
  ordem: number;
  status: "ativa" | "encerrada";
};

type Vinculo = { projeto_id: string; aluno_id: string };
type ProjetoRegistro = Omit<ProjetoAluno, "turma" | "integrantes" | "entregas">;
type TurmaRegistro = { id: string; nome: string };

export async function listarProjetosAluno(): Promise<ProjetoAluno[]> {
  const { supabase, aluno } = await getAlunoContext();
  const { data: vinculos, error: vinculosError } = await supabase
    .from("projeto_alunos")
    .select("projeto_id,aluno_id")
    .eq("aluno_id", aluno.id)
    .returns<Vinculo[]>();

  if (vinculosError) throw new Error("Não foi possível carregar seus projetos.");

  const projetoIds = [...new Set((vinculos ?? []).map((vinculo) => vinculo.projeto_id))];
  if (!projetoIds.length) return [];

  const [{ data: projetos, error: projetosError }, { data: todosVinculos, error: todosVinculosError }] = await Promise.all([
    supabase.from("projetos")
      .select("id,turma_id,titulo,tema,descricao,status,data_inicio,prazo_final,criado_em,atualizado_em")
      .in("id", projetoIds)
      .returns<ProjetoRegistro[]>(),
    supabase.from("projeto_alunos")
      .select("projeto_id,aluno_id")
      .in("projeto_id", projetoIds)
      .returns<Vinculo[]>(),
  ]);

  if (projetosError || todosVinculosError) throw new Error("Não foi possível carregar os dados dos projetos.");

  const projetoRegistros = projetos ?? [];
  const turmaIds = [...new Set(projetoRegistros.map((projeto) => projeto.turma_id))];
  const alunoIds = [...new Set((todosVinculos ?? []).map((vinculo) => vinculo.aluno_id))];
  const [turmasResult, alunosResult] = await Promise.all([
    supabase.from("turmas").select("id,nome").in("id", turmaIds).returns<TurmaRegistro[]>(),
    alunoIds.length
      ? supabase.from("usuarios").select("id,nome").in("id", alunoIds).eq("papel", "aluno").returns<{ id: string; nome: string | null }[]>()
      : Promise.resolve({ data: [], error: null }),
  ]);

  if (turmasResult.error || alunosResult.error) throw new Error("Não foi possível carregar os participantes dos projetos.");

  const entregaResult = await supabase.from("entregas")
    .select("id,projeto_id,titulo,descricao,prazo,ordem,status")
    .in("projeto_id", projetoIds)
    .order("ordem", { ascending: true })
    .order("prazo", { ascending: true, nullsFirst: false })
    .returns<(EntregaAluno & { projeto_id: string })[]>();

  if (entregaResult.error) throw new Error("Não foi possível carregar o cronograma dos projetos.");

  const turmas = new Map((turmasResult.data ?? []).map((turma) => [turma.id, turma]));
  const alunos = new Map((alunosResult.data ?? []).map((perfil) => [perfil.id, perfil]));
  const entregas = new Map<string, EntregaAluno[]>();
  for (const entrega of entregaResult.data ?? []) {
    const lista = entregas.get(entrega.projeto_id) ?? [];
    lista.push(entrega);
    entregas.set(entrega.projeto_id, lista);
  }

  return projetoRegistros.flatMap((projeto) => {
    const turma = turmas.get(projeto.turma_id);
    if (!turma) return [];
    const integrantes = (todosVinculos ?? [])
      .filter((vinculo) => vinculo.projeto_id === projeto.id)
      .map((vinculo) => alunos.get(vinculo.aluno_id))
      .filter((perfil): perfil is { id: string; nome: string | null } => Boolean(perfil));

    return [{ ...projeto, turma, integrantes, entregas: entregas.get(projeto.id) ?? [] }];
  });
}