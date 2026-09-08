import type { SupabaseClient } from "@supabase/supabase-js";
import type { TessContextType, TessRole } from "./types";

export async function validarContextoTess(supabase: SupabaseClient, role: TessRole, contextType: TessContextType, contextId: string | null, userId: string) {
  if (!contextType || !contextId || contextType === "situacao") return true;
  if (contextType === "projeto" || contextType === "pendencia") {
    const projetoId = contextType === "projeto" ? contextId : await projetoDaPendencia(supabase, contextId);
    if (!projetoId) return false;
    if (role === "aluno") {
      const { data, error } = await supabase.from("projeto_alunos").select("projeto_id").eq("projeto_id", projetoId).eq("aluno_id", userId).maybeSingle();
      return !error && Boolean(data);
    }
    const { data: projeto } = await supabase.from("projetos").select("turma_id").eq("id", projetoId).maybeSingle<{ turma_id: string }>();
    if (!projeto) return false;
    const { data } = await supabase.from("turmas").select("id").eq("id", projeto.turma_id).eq("professor_id", userId).maybeSingle();
    return Boolean(data);
  }
  if (contextType === "versao" || contextType === "devolutiva") {
    const coluna = contextType === "versao" ? "id" : "id";
    const tabela = contextType === "versao" ? "versoes" : "devolutivas";
    const { data } = await supabase.from(tabela).select(contextType === "versao" ? "projeto_id" : "versao_id").eq(coluna, contextId).maybeSingle<Record<string, string>>();
    const versaoId = contextType === "versao" ? null : data?.versao_id;
    const projetoId = contextType === "versao" ? data?.projeto_id : versaoId ? await projetoDaVersao(supabase, versaoId) : null;
    if (!projetoId) return false;
    return validarContextoTess(supabase, role, "projeto", projetoId, userId);
  }
  return false;
}

async function projetoDaPendencia(supabase: SupabaseClient, id: string) { const { data } = await supabase.from("pendencias").select("projeto_id").eq("id", id).maybeSingle<{ projeto_id: string }>(); return data?.projeto_id ?? null; }
async function projetoDaVersao(supabase: SupabaseClient, id: string) { const { data } = await supabase.from("versoes").select("projeto_id").eq("id", id).maybeSingle<{ projeto_id: string }>(); return data?.projeto_id ?? null; }