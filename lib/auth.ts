import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import { redirect } from "next/navigation";

type Papel = "professor" | "aluno";
type PerfilAutenticado = { id: string; papel: Papel };

export async function getAuthenticatedProfile(
  supabase: SupabaseClient,
): Promise<PerfilAutenticado | null> {
  try {
    // Valida a identidade no Auth; não confia no usuário armazenado no cookie.
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) return null;

    const { data: perfil, error: perfilError } = await supabase
      .from("usuarios")
      .select("papel")
      .eq("id", user.id)
      .single();

    if (
      perfilError ||
      !perfil ||
      (perfil.papel !== "professor" && perfil.papel !== "aluno")
    ) {
      return null;
    }

    return { id: user.id, papel: perfil.papel };
  } catch {
    // Falhas de rede ou de perfil nunca concedem acesso às áreas protegidas.
    return null;
  }
}

export async function requireRole(supabase: SupabaseClient, papel: Papel) {
  const perfil = await getAuthenticatedProfile(supabase);

  if (!perfil) redirect("/");
  if (perfil.papel !== papel) redirect(`/${perfil.papel}/inicio`);

  return perfil;
}
