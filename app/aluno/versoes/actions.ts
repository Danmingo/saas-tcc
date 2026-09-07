"use server";

import { revalidatePath } from "next/cache";
import { getAlunoContext } from "@/lib/aluno";
import { pathValido, type ResultadoEnvio } from "@/lib/arquivos";
import { validarEnvio, verificarOperacao } from "@/lib/envios";

type ResultadoRegistro = { motivo?: string } | null;

export async function prepararEnvio(projetoId: string, entregaId: string): Promise<ResultadoEnvio> {
  try {
    const { supabase, aluno } = await getAlunoContext();
    await validarEnvio({ supabase, perfil: aluno }, projetoId, entregaId);
    return {};
  } catch (error) {
    return { erro: error instanceof Error ? error.message : "Projeto ou entrega não disponíveis." };
  }
}

export async function registrarVersao(
  projetoId: string,
  entregaId: string,
  arquivoPath: string,
  nomeArquivo: string,
): Promise<ResultadoEnvio> {
  try {
    const { supabase, aluno } = await getAlunoContext();
    await validarEnvio({ supabase, perfil: aluno }, projetoId, entregaId);
    if (!pathValido(arquivoPath, projetoId, entregaId)) return { erro: "O caminho do arquivo é inválido." };
    if (!nomeArquivo || nomeArquivo.length > 120) return { erro: "O nome do arquivo é inválido." };

    const { data, error } = await supabase.rpc("registrar_versao_aluno", {
      projeto_uuid: projetoId,
      entrega_uuid: entregaId,
      arquivo_path: arquivoPath,
      nome_arquivo: nomeArquivo,
    });
    verificarOperacao(error, "public.versoes", "RPC registrar_versao_aluno");
    const resultado = data as ResultadoRegistro;
    if (resultado?.motivo && !["registrado", "criado", "vinculado", "sucesso"].includes(resultado.motivo)) {
      return { erro: "Não foi possível registrar a versão. Verifique o projeto e a entrega." };
    }
    revalidatePath("/aluno/versoes");
    revalidatePath("/aluno/meu-projeto");
    return { sucesso: "Versão enviada com sucesso." };
  } catch (error) {
    return { erro: error instanceof Error ? error.message : "Não foi possível registrar a versão." };
  }
}