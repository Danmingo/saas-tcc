import { NextResponse } from "next/server";
import { getAuthenticatedProfile } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { BUCKET_ARQUIVOS, pathValido } from "@/lib/arquivos";
import { buscarVersao, type EnviosContext } from "@/lib/envios";

export async function GET(_request: Request, { params }: { params: Promise<{ versaoId: string }> }) {
  const { versaoId } = await params;
  const supabase = await createSupabaseServerClient();
  const perfil = await getAuthenticatedProfile(supabase);
  if (!perfil) return NextResponse.json({ erro: "Não autenticado." }, { status: 401 });

  const contexto: EnviosContext = { supabase, perfil };
  const versao = await buscarVersao(contexto, versaoId);
  if (!versao) return NextResponse.json({ erro: "Arquivo não encontrado ou sem acesso." }, { status: 404 });
  if (!pathValido(versao.arquivoPath, versao.projetoId, versao.entregaId)) {
    return NextResponse.json({ erro: "O arquivo registrado é inválido." }, { status: 404 });
  }

  const { data, error } = await supabase.storage.from(BUCKET_ARQUIVOS).createSignedUrl(versao.arquivoPath, 600);
  if (error || !data?.signedUrl) return NextResponse.json({ erro: "Não foi possível gerar o download seguro." }, { status: 503 });
  return NextResponse.redirect(data.signedUrl);
}
