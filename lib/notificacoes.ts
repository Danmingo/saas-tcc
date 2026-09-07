"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type Notificacao = {
  id: string;
  usuario_id: string;
  tipo: string;
  mensagem: string;
  link: string | null;
  lida: boolean;
  criado_em: string;
};

async function contextoNotificacoes(papel: "aluno" | "professor") {
  const supabase = await createSupabaseServerClient();
  const usuario = await requireRole(supabase, papel);
  return { supabase, usuario };
}

export async function listarNotificacoesUsuario(papel: "aluno" | "professor" = "aluno") {
  const supabase = await createSupabaseServerClient();
  const usuario = await requireRole(supabase, papel);
  const { data, error } = await supabase
    .from("notificacoes")
    .select("id,usuario_id,tipo,mensagem,link,lida,criado_em")
    .eq("usuario_id", usuario.id)
    .order("criado_em", { ascending: false })
    .returns<Notificacao[]>();

  if (error) throw new Error("Não foi possível carregar suas notificações.");
  return data ?? [];
}

export async function marcarNotificacaoComoLida(id: string, papel: "aluno" | "professor" = "aluno") {
  const { supabase, usuario } = await contextoNotificacoes(papel);
  const { error } = await supabase
    .from("notificacoes")
    .update({ lida: true })
    .eq("id", id)
    .eq("usuario_id", usuario.id);

  if (error) throw new Error("Não foi possível marcar a notificação como lida.");
  revalidatePath("/aluno/notificacoes");
  revalidatePath("/professor/notificacoes");
}

export async function marcarTodasComoLidas(papel: "aluno" | "professor" = "aluno") {
  const supabase = await createSupabaseServerClient();
  const usuario = await requireRole(supabase, papel);
  const { error } = await supabase
    .from("notificacoes")
    .update({ lida: true })
    .eq("usuario_id", usuario.id)
    .eq("lida", false);

  if (error) throw new Error("Não foi possível marcar todas as notificações como lidas.");
  revalidatePath("/aluno/notificacoes");
  revalidatePath("/professor/notificacoes");
}
