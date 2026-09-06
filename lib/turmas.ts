import "server-only";

import { requireRole } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type Turma = {
  id: string | number;
  nome: string;
  codigo_convite: string;
  curso: string | null;
  etapa: string | null;
  periodo: string | null;
  tipo_curso: string | null;
};

const CAMPOS_TURMA = "id, nome, codigo_convite, curso, etapa, periodo, tipo_curso";

export async function getProfessorContext() {
  const supabase = await createSupabaseServerClient();
  const professor = await requireRole(supabase, "professor");

  return { supabase, professor };
}

export async function listarTurmas() {
  const { supabase, professor } = await getProfessorContext();
  const { data, error } = await supabase
    .from("turmas")
    .select(CAMPOS_TURMA)
    .eq("professor_id", professor.id)
    .order("criado_em", { ascending: false })
    .returns<Turma[]>();

  if (error) throw new Error("Não foi possível carregar as turmas.");

  return data ?? [];
}

export async function buscarTurma(id: string) {
  const { supabase, professor } = await getProfessorContext();

  // O ID da URL identifica o recurso, mas nunca determina quem pode acessá-lo.
  if (!/^[a-zA-Z0-9_-]{1,128}$/.test(id)) return null;

  const { data, error } = await supabase
    .from("turmas")
    .select(CAMPOS_TURMA)
    .eq("id", id)
    .eq("professor_id", professor.id)
    .maybeSingle<Turma>();

  // Não diferencia um ID inválido ou acesso negado de uma turma inexistente.
  if (error?.code === "22P02" || error?.code === "42501") return null;
  if (error) throw new Error("Não foi possível carregar a turma.");

  return data;
}
