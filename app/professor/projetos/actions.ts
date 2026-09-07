"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getProfessorContext } from "@/lib/turmas";
import { mensagemProjetoErro } from "@/lib/projetos";
import { criarProjetoValidado, atualizarProjetoValidado, ProjetoGravacaoErro } from "@/lib/projeto-mutations";
import { idValido, lerProjetoForm, type ProjetoFormState } from "./form-config";

function invalidarProjeto(id?: string) {
  revalidatePath("/professor/projetos");
  if (id) {
    revalidatePath("/professor/projetos/" + encodeURIComponent(id));
    revalidatePath("/professor/projetos/" + encodeURIComponent(id) + "/editar");
  }
}

export async function criarProjeto(_estado: ProjetoFormState, form: FormData): Promise<ProjetoFormState> {
  const context = await getProfessorContext();
  const { valores, erro } = lerProjetoForm(form, false);
  if (erro) return { valores, erro };
  let id: string;
  try {
    id = await criarProjetoValidado(context, valores);
  } catch (error) {
    const projetoPendenteId = error instanceof ProjetoGravacaoErro ? error.projetoPendenteId : undefined;
    if (error instanceof ProjetoGravacaoErro) invalidarProjeto(projetoPendenteId);
    return { valores, erro: mensagemProjetoErro(error), projetoPendenteId };
  }
  invalidarProjeto(id);
  redirect("/professor/projetos/" + encodeURIComponent(id) + "?criado=1");
}

export async function atualizarProjeto(id: string, _estado: ProjetoFormState, form: FormData): Promise<ProjetoFormState> {
  const context = await getProfessorContext();
  const { valores, erro } = lerProjetoForm(form, true);
  if (!idValido(id)) return { valores, erro: "Projeto não encontrado ou sem acesso." };
  if (erro) return { valores, erro };
  try {
    const versao = form.get("versao");
    await atualizarProjetoValidado(context, id, valores, typeof versao === "string" ? versao : "");
  } catch (error) {
    const projetoPendenteId = error instanceof ProjetoGravacaoErro ? error.projetoPendenteId : undefined;
    if (error instanceof ProjetoGravacaoErro) invalidarProjeto(id);
    return { valores, erro: mensagemProjetoErro(error), projetoPendenteId };
  }
  invalidarProjeto(id);
  redirect("/professor/projetos/" + encodeURIComponent(id) + "?atualizado=1");
}
