"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getAlunoContext } from "@/lib/aluno";

export type EntrarTurmaState = {
  erro?: string;
  codigo?: string;
};

type ResultadoEntradaTurma = {
  motivo?: "nao_autenticado" | "papel_invalido" | "codigo_invalido" | "ja_participa" | "vinculado";
  turma_nome?: string;
};

export async function entrarNaTurma(
  _estadoAnterior: EntrarTurmaState,
  formData: FormData,
): Promise<EntrarTurmaState> {
  const { supabase } = await getAlunoContext();
  const valor = formData.get("codigo_convite");

  if (valor !== null && typeof valor !== "string") {
    return { erro: "Informe um código de convite válido." };
  }

  const codigo = (valor ?? "").trim().toUpperCase();

  if (!codigo || codigo.length > 128 || codigo.includes("\0")) {
    return { erro: "Informe um código de convite válido.", codigo };
  }

  try {
    const { data, error } = await supabase.rpc("entrar_turma_por_codigo", { codigo });

    if (error) {
      return { erro: "Não foi possível entrar na turma. Tente novamente.", codigo };
    }

    const resultado = data as ResultadoEntradaTurma | null;

    switch (resultado?.motivo) {
      case "vinculado":
        revalidatePath("/aluno/inicio");
        redirect("/aluno/inicio?entrou=1");
      case "ja_participa":
        return {
          erro: resultado.turma_nome
            ? `Você já participa da turma ${resultado.turma_nome}.`
            : "Você já participa desta turma.",
          codigo,
        };
      case "codigo_invalido":
        return { erro: "Código de convite não encontrado. Confira o código e tente novamente.", codigo };
      case "nao_autenticado":
      case "papel_invalido":
        return { erro: "Não foi possível validar seu acesso. Tente novamente.", codigo };
      default:
        return { erro: "Não foi possível entrar na turma. Tente novamente.", codigo };
    }
  } catch {
    return { erro: "Não foi possível confirmar sua entrada na turma. Tente novamente.", codigo };
  }

  revalidatePath("/aluno/inicio");
  redirect("/aluno/inicio?entrou=1");
}