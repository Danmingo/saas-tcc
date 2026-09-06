"use server";

import { randomInt } from "node:crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getProfessorContext, type Turma } from "@/lib/turmas";
import { CAMPOS_TURMA, type TurmaFormState, type ValoresTurma } from "./form-config";

export type ExclusaoTurmaState = {
  erro?: string;
};

function lerValoresTurma(formData: FormData) {
  const valores: ValoresTurma = { nome: "", curso: "", etapa: "", periodo: "", tipo_curso: "" };
  const errosCampos: NonNullable<TurmaFormState["errosCampos"]> = {};

  for (const campo of CAMPOS_TURMA) {
    const valor = formData.get(campo.nome);

    if (valor !== null && typeof valor !== "string") {
      errosCampos[campo.nome] = "Informe um texto válido.";
      continue;
    }

    valores[campo.nome] = (valor ?? "").trim();

    if (campo.obrigatorio && !valores[campo.nome]) {
      errosCampos[campo.nome] = "Informe o nome da turma.";
    } else if (valores[campo.nome].length > campo.maxLength) {
      errosCampos[campo.nome] = `Use no máximo ${campo.maxLength} caracteres.`;
    } else if (valores[campo.nome].includes("\0")) {
      errosCampos[campo.nome] = "Informe um texto válido.";
    }
  }

  return { valores, errosCampos };
}

export async function criarTurma(
  _estadoAnterior: TurmaFormState,
  formData: FormData,
): Promise<TurmaFormState> {
  // Toda chamada da ação valida novamente a sessão e o papel no servidor.
  const { supabase, professor } = await getProfessorContext();
  const { valores, errosCampos } = lerValoresTurma(formData);

  if (Object.keys(errosCampos).length) {
    return { erro: "Revise os campos indicados.", errosCampos, valores };
  }

  let turmaId: Turma["id"] | undefined;

  try {
    const alfabeto = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

    for (let tentativa = 0; tentativa < 3; tentativa++) {
      const codigoConvite = Array.from(
        { length: 8 },
        () => alfabeto[randomInt(alfabeto.length)],
      ).join("");

      const { data, error } = await supabase
        .from("turmas")
        .insert({
          nome: valores.nome,
          curso: valores.curso || null,
          etapa: valores.etapa || null,
          periodo: valores.periodo || null,
          tipo_curso: valores.tipo_curso || null,
          professor_id: professor.id,
          codigo_convite: codigoConvite,
        })
        .select("id")
        .single<Pick<Turma, "id">>();

      // A restrição UNIQUE do banco resolve colisões entre requisições simultâneas.
      if (error?.code === "23505") continue;
      if (error || !data) {
        return { erro: "Não foi possível criar a turma. Tente novamente.", valores };
      }

      turmaId = data.id;
      break;
    }
  } catch {
    return { erro: "Não foi possível confirmar o cadastro. Consulte a lista antes de tentar novamente.", valores };
  }

  if (turmaId === undefined) {
    return { erro: "Não foi possível gerar um código de convite único. Tente novamente.", valores };
  }

  revalidatePath("/professor/turmas");
  redirect(`/professor/turmas/${encodeURIComponent(String(turmaId))}?criada=1`);
}

export async function atualizarTurma(
  id: string,
  _estadoAnterior: TurmaFormState,
  formData: FormData,
): Promise<TurmaFormState> {
  const { supabase, professor } = await getProfessorContext();
  const { valores, errosCampos } = lerValoresTurma(formData);

  if (!/^[a-zA-Z0-9_-]{1,128}$/.test(id)) {
    return { erro: "Não foi possível localizar a turma.", valores };
  }

  if (Object.keys(errosCampos).length) {
    return { erro: "Revise os campos indicados.", errosCampos, valores };
  }

  try {
    const { data, error } = await supabase
      .from("turmas")
      .update({
        nome: valores.nome,
        curso: valores.curso || null,
        etapa: valores.etapa || null,
        periodo: valores.periodo || null,
        tipo_curso: valores.tipo_curso || null,
      })
      .eq("id", id)
      .eq("professor_id", professor.id)
      .select("id")
      .maybeSingle<Pick<Turma, "id">>();

    if (error || !data) {
      return { erro: "Não foi possível atualizar a turma. Tente novamente.", valores };
    }
  } catch {
    return { erro: "Não foi possível confirmar a atualização. Tente novamente.", valores };
  }

  revalidatePath("/professor/turmas");
  revalidatePath(`/professor/turmas/${encodeURIComponent(id)}`);
  redirect(`/professor/turmas/${encodeURIComponent(id)}?atualizada=1`);
}

export async function excluirTurma(
  id: string,
  _estadoAnterior: ExclusaoTurmaState,
  _formData: FormData,
): Promise<ExclusaoTurmaState> {
  void _estadoAnterior;
  void _formData;
  const { supabase, professor } = await getProfessorContext();

  if (!/^[a-zA-Z0-9_-]{1,128}$/.test(id)) {
    return { erro: "Não foi possível localizar a turma." };
  }

  try {
    const { data, error } = await supabase
      .from("turmas")
      .delete()
      .eq("id", id)
      .eq("professor_id", professor.id)
      .select("id")
      .maybeSingle<Pick<Turma, "id">>();

    if (error || !data) {
      return { erro: "Não foi possível excluir a turma. Verifique se ela ainda existe e tente novamente." };
    }
  } catch {
    return { erro: "Não foi possível confirmar a exclusão. Tente novamente." };
  }

  revalidatePath("/professor/turmas");
  redirect("/professor/turmas");
}
