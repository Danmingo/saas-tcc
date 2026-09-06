import "server-only";

import { requireRole } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type TurmaAluno = {
  id: string | number;
  nome: string;
  curso: string | null;
  etapa: string | null;
  periodo: string | null;
  tipo_curso: string | null;
};

export async function getAlunoContext() {
  const supabase = await createSupabaseServerClient();
  const aluno = await requireRole(supabase, "aluno");

  return { supabase, aluno };
}

export async function listarTurmasAluno() {
  const { supabase, aluno } = await getAlunoContext();
  const { data, error } = await supabase
    .from("turma_alunos")
    .select("turma_id, turmas(id, nome, curso, etapa, periodo, tipo_curso)")
    .eq("aluno_id", aluno.id)
    .order("criado_em", { ascending: false })
    .returns<Array<{ turma_id: string | number; turmas: TurmaAluno | TurmaAluno[] | null }>>();

  if (error) throw new Error("Não foi possível carregar suas turmas.");

  return (data ?? []).flatMap((vinculo) => {
    if (!vinculo.turmas) return [];
    return Array.isArray(vinculo.turmas) ? vinculo.turmas : [vinculo.turmas];
  });
}