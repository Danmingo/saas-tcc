import "server-only";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getAuthenticatedProfile } from "@/lib/auth";
import { carregarContextoTess } from "./context";
import { validarEntrada } from "./guards/input";
import { classificarIntencao, respostaForaDoEscopo } from "./scope";
import { gerarRespostaTess } from "./provider";
import type { TessContextType, TessConversation, TessMessage, TessReply } from "./types";

function erroRls(message: string, operacao: string) { return new Error(`Não foi possível ${operacao} na Tess: ${message}`); }

export async function listarConversasTess(): Promise<TessConversation[]> {
  const supabase = await createSupabaseServerClient(); const perfil = await getAuthenticatedProfile(supabase); if (!perfil) throw new Error("Sessão não encontrada.");
  const { data, error } = await supabase.from("tess_conversas").select("id,titulo,contexto_tipo,contexto_id,criado_em,atualizado_em").eq("usuario_id", perfil.id).order("atualizado_em", { ascending: false }).returns<TessConversation[]>();
  if (error) throw erroRls(error.message, "carregar conversas"); return data ?? [];
}

export async function carregarConversaTess(id: string): Promise<{ conversa: TessConversation; mensagens: TessMessage[] } | null> {
  const supabase = await createSupabaseServerClient(); const perfil = await getAuthenticatedProfile(supabase); if (!perfil) throw new Error("Sessão não encontrada.");
  const conversa = await supabase.from("tess_conversas").select("id,titulo,contexto_tipo,contexto_id,criado_em,atualizado_em").eq("id", id).eq("usuario_id", perfil.id).maybeSingle<TessConversation>();
  if (conversa.error) throw erroRls(conversa.error.message, "carregar conversa"); if (!conversa.data) return null;
  const mensagens = await supabase.from("tess_mensagens").select("id,papel,conteudo,intencao,criado_em").eq("conversa_id", id).order("criado_em", { ascending: true }).limit(50).returns<Array<{ id: string; papel: "usuario" | "assistente"; conteudo: string; intencao: string | null; criado_em: string }>>();
  if (mensagens.error) throw erroRls(mensagens.error.message, "carregar mensagens");
  return { conversa: conversa.data, mensagens: (mensagens.data ?? []).map((item) => ({ id: item.id, role: item.papel, content: item.conteudo, intent: item.intencao as TessMessage["intent"], createdAt: item.criado_em })) };
}

export async function criarConversaTess(contextType: TessContextType, contextId: string | null) {
  const supabase = await createSupabaseServerClient(); const perfil = await getAuthenticatedProfile(supabase); if (!perfil) throw new Error("Sessão não encontrada.");
  const contexto = await carregarContextoTess(contextType, contextId);
  const contextoTipo = contextType === "situacao" || contextType === null ? "geral" : contextType;
  const contextoId = contextoTipo === "geral" ? null : contextoTipo === "projeto" ? contexto.projectId : contextId;
  const resultado = await supabase.from("tess_conversas").insert({ usuario_id: perfil.id, projeto_id: contexto.projectId, titulo: "Nova conversa", contexto_tipo: contextoTipo, contexto_id: contextoId }).select("id,titulo,contexto_tipo,contexto_id,criado_em,atualizado_em").single<TessConversation>();
  if (resultado.error || !resultado.data) throw erroRls(resultado.error?.message ?? "registro não retornado", "criar conversa"); return resultado.data;
}

export async function enviarMensagemTess(conversaId: string, perguntaBruta: string): Promise<TessReply> {
  const pergunta = validarEntrada(perguntaBruta); const supabase = await createSupabaseServerClient(); const perfil = await getAuthenticatedProfile(supabase); if (!perfil) throw new Error("Sessão não encontrada.");
  const conversa = await supabase.from("tess_conversas").select("id,contexto_tipo,contexto_id").eq("id", conversaId).eq("usuario_id", perfil.id).maybeSingle<{ id: string; contexto_tipo: TessContextType; contexto_id: string | null }>();
  if (conversa.error || !conversa.data) throw new Error("Conversa não encontrada ou sem acesso.");
  const intent = classificarIntencao(pergunta); const historico = await carregarConversaTess(conversaId); if (!historico) throw new Error("Conversa não encontrada ou sem acesso.");
  const insertUser = await supabase.from("tess_mensagens").insert({ conversa_id: conversaId, papel: "usuario", conteudo: pergunta, intencao: intent, metadados: {} });
  if (insertUser.error) throw erroRls(insertUser.error.message, "salvar pergunta");
  const contexto = await carregarContextoTess(conversa.data.contexto_tipo, conversa.data.contexto_id);
  const content = intent === "fora_do_escopo" ? respostaForaDoEscopo() : await gerarRespostaTess(contexto, historico.mensagens.slice(-8), pergunta);
  const insertModel = await supabase.from("tess_mensagens").insert({ conversa_id: conversaId, papel: "assistente", conteudo: content, intencao: intent, metadados: { blocked: intent === "fora_do_escopo" } });
  if (insertModel.error) throw erroRls(insertModel.error.message, "salvar resposta");
  await supabase.from("tess_conversas").update({ atualizado_em: new Date().toISOString(), titulo: historico.conversa.titulo === "Nova conversa" ? pergunta.slice(0, 60) : historico.conversa.titulo }).eq("id", conversaId).eq("usuario_id", perfil.id);
  return { content, intent, blocked: intent === "fora_do_escopo" };
}