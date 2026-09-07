import "server-only";

import { getAlunoContext } from "@/lib/aluno";

export type TurmaProjetoAluno = {
  id: string;
  nome: string;
  colegas: { id: string; nome: string | null }[];
};

export type EntregaAluno = {
  id: string;
  titulo: string;
  descricao: string | null;
  prazo: string | null;
  ordem: number;
  status: "ativa" | "encerrada";
};

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

type VinculoTurma = { turma_id: string; aluno_id: string };
type VinculoProjeto = { projeto_id: string; aluno_id: string };
type ProjetoRegistro = Omit<ProjetoAluno, "turma" | "integrantes" | "entregas">;
type TurmaRegistro = { id: string; nome: string };
type PerfilAluno = { id: string; nome: string | null };

export async function listarTurmasAluno(): Promise<TurmaProjetoAluno[]> {
  const { supabase, aluno } = await getAlunoContext();
  const { data: meusVinculos, error: meusVinculosError } = await supabase
    .from("turma_alunos")
    .select("turma_id,aluno_id")
    .eq("aluno_id", aluno.id)
    .returns<VinculoTurma[]>();

  if (meusVinculosError) throw new Error("Não foi possível carregar suas turmas.");

  const turmaIds = [...new Set((meusVinculos ?? []).map((vinculo) => vinculo.turma_id))];
  if (!turmaIds.length) return [];

  const [{ data: turmas, error: turmasError }, { data: vinculos, error: vinculosError }] = await Promise.all([
    supabase.from("turmas").select("id,nome").in("id", turmaIds).returns<TurmaRegistro[]>(),
    supabase.from("turma_alunos").select("turma_id,aluno_id").in("turma_id", turmaIds).returns<VinculoTurma[]>(),
  ]);

  if (turmasError || vinculosError) throw new Error("Não foi possível carregar os colegas das turmas.");

  const alunoIds = [...new Set((vinculos ?? []).map((vinculo) => vinculo.aluno_id))];
  const { data: perfis, error: perfisError } = alunoIds.length
    ? await supabase.from("usuarios").select("id,nome").in("id", alunoIds).eq("papel", "aluno").returns<PerfilAluno[]>()
    : { data: [], error: null };

  if (perfisError) throw new Error("Não foi possível carregar os colegas das turmas.");

  const perfisMap = new Map((perfis ?? []).map((perfil) => [perfil.id, perfil]));
  const turmasMap = new Map((turmas ?? []).map((turma) => [turma.id, turma]));

  return turmaIds.flatMap((turmaId) => {
    const turma = turmasMap.get(turmaId);
    if (!turma) return [];
    const colegas = (vinculos ?? [])
      .filter((vinculo) => vinculo.turma_id === turmaId && vinculo.aluno_id !== aluno.id)
      .map((vinculo) => perfisMap.get(vinculo.aluno_id))
      .filter((perfil): perfil is PerfilAluno => Boolean(perfil));
    return [{ ...turma, colegas }];
  });
}

export async function listarProjetosAluno(): Promise<ProjetoAluno[]> {
  const { supabase, aluno } = await getAlunoContext();
  const { data: meusVinculos, error: meusVinculosError } = await supabase
    .from("projeto_alunos")
    .select("projeto_id,aluno_id")
    .eq("aluno_id", aluno.id)
    .returns<VinculoProjeto[]>();

  if (meusVinculosError) throw new Error("Não foi possível carregar seus projetos.");

  const projetoIds = [...new Set((meusVinculos ?? []).map((vinculo) => vinculo.projeto_id))];
  if (!projetoIds.length) return [];

  const [{ data: projetos, error: projetosError }, { data: todosVinculos, error: todosVinculosError }] = await Promise.all([
    supabase.from("projetos")
      .select("id,turma_id,titulo,tema,descricao,status,data_inicio,prazo_final,criado_em,atualizado_em")
      .in("id", projetoIds)
      .returns<ProjetoRegistro[]>(),
    supabase.from("projeto_alunos")
      .select("projeto_id,aluno_id")
      .in("projeto_id", projetoIds)
      .returns<VinculoProjeto[]>(),
  ]);

  if (projetosError || todosVinculosError) throw new Error("Não foi possível carregar os dados dos projetos.");

  const projetoRegistros = projetos ?? [];
  const turmaIds = [...new Set(projetoRegistros.map((projeto) => projeto.turma_id))];
  const alunoIds = [...new Set((todosVinculos ?? []).map((vinculo) => vinculo.aluno_id))];
  const [turmasResult, alunosResult] = await Promise.all([
    supabase.from("turmas").select("id,nome").in("id", turmaIds).returns<TurmaRegistro[]>(),
    alunoIds.length
      ? supabase.from("usuarios").select("id,nome").in("id", alunoIds).eq("papel", "aluno").returns<PerfilAluno[]>()
      : Promise.resolve({ data: [], error: null }),
  ]);

  if (turmasResult.error || alunosResult.error) throw new Error("Não foi possível carregar os participantes dos projetos.");

  const entregaResult = await supabase.from("entregas")
    .select("id,turma_id,titulo,descricao,prazo,ordem,status")
    .in("turma_id", turmaIds)
    .order("ordem", { ascending: true })
    .order("prazo", { ascending: true, nullsFirst: false })
    .returns<(EntregaAluno & { turma_id: string })[]>();

  if (entregaResult.error) throw new Error("Não foi possível carregar o cronograma das turmas.");

  const turmas = new Map((turmasResult.data ?? []).map((turma) => [turma.id, turma]));
  const alunos = new Map((alunosResult.data ?? []).map((perfil) => [perfil.id, perfil]));
  const entregas = new Map<string, EntregaAluno[]>();
  for (const entrega of entregaResult.data ?? []) {
    const lista = entregas.get(entrega.turma_id) ?? [];
    lista.push(entrega);
    entregas.set(entrega.turma_id, lista);
  }

  return projetoRegistros.flatMap((projeto) => {
    const turma = turmas.get(projeto.turma_id);
    if (!turma) return [];
    const integrantes = (todosVinculos ?? [])
      .filter((vinculo) => vinculo.projeto_id === projeto.id)
      .map((vinculo) => alunos.get(vinculo.aluno_id))
      .filter((perfil): perfil is PerfilAluno => Boolean(perfil));
    return [{ ...projeto, turma, integrantes, entregas: entregas.get(projeto.turma_id) ?? [] }];
  });
}
