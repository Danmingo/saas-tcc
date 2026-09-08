import { getAuthenticatedProfile } from "@/lib/auth";
import { carregarContextoTess } from "@/lib/ai/tess/context";
import { carregarConversaTess, listarConversasTess } from "@/lib/ai/tess/service";
import TessChat from "@/app/components/tess/TessChat";
import TessStudioErro from "@/app/components/tess/TessStudioErro";

export default async function TessProfessorPage({ searchParams }: { searchParams: Promise<{ conversa?: string; tipo?: string; id?: string }> }) {
  let dados: { conversas: Awaited<ReturnType<typeof listarConversasTess>>; conversa: Awaited<ReturnType<typeof carregarConversaTess>>; contexto: Awaited<ReturnType<typeof carregarContextoTess>> } | null = null;
  let erro = "";
  try {
    const params = await searchParams; const conversaId = params.conversa ?? null; const conversas = await listarConversasTess(); const conversa = conversaId ? await carregarConversaTess(conversaId) : null; const contexto = await carregarContextoTess(conversa?.conversa.contexto_tipo ?? (params.tipo as "situacao" | "projeto" | "pendencia" | "versao" | "devolutiva" | null) ?? "situacao", conversa?.conversa.contexto_id ?? params.id ?? null); const supabase = await (await import("@/lib/supabase/server")).createSupabaseServerClient(); const perfil = await getAuthenticatedProfile(supabase); if (!perfil || perfil.papel !== "professor") return null;
    dados = { conversas, conversa, contexto };
  } catch (error) { erro = error instanceof Error ? error.message : "Tente novamente mais tarde."; }
  if (erro) return <TessStudioErro mensagem={erro} />;
  if (!dados) return null;
  return <TessChat role="professor" conversas={dados.conversas} conversa={dados.conversa?.conversa ?? null} mensagens={dados.conversa?.mensagens ?? []} contexto={dados.contexto} />;
}