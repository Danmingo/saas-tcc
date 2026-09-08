"use server";

import { redirect } from "next/navigation";
import { getAuthenticatedProfile } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { criarConversaTess, enviarMensagemTess } from "@/lib/ai/tess/service";
import type { TessContextType } from "@/lib/ai/tess/types";

export type TessActionState = { erro?: string; resposta?: { content: string; intent: string; blocked: boolean } };

export async function novaConversaTess(contextType: TessContextType, contextId: string | null, _state: TessActionState, _form: FormData): Promise<TessActionState> {
  void _state;
  void _form;
  let conversa;
  try {
    conversa = await criarConversaTess(contextType, contextId);
  } catch (error) {
    return { erro: error instanceof Error ? error.message : "Não foi possível iniciar a conversa." };
  }
  const supabase = await createSupabaseServerClient();
  const perfil = await getAuthenticatedProfile(supabase);
  if (!perfil) return { erro: "Sessão não encontrada." };
  redirect(`/${perfil.papel}/tess?conversa=${encodeURIComponent(conversa.id)}`);
}

export async function enviarMensagemTessAction(conversaId: string, _state: TessActionState, form: FormData): Promise<TessActionState> {
  try {
    const pergunta = form.get("pergunta");
    if (typeof pergunta !== "string") return { erro: "Escreva uma pergunta para a Tess." };
    const resposta = await enviarMensagemTess(conversaId, pergunta);
    return { resposta };
  } catch (error) {
    return { erro: error instanceof Error ? error.message : "Não foi possível consultar a Tess." };
  }
}