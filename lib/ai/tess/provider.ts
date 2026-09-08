import "server-only";

import { gerarTextoGemini } from "@/lib/ai/gemini";
import { validarSaida } from "./guards/output";
import { promptBase } from "./prompts/base";
import { PROMPT_ALUNO } from "./prompts/aluno";
import { PROMPT_PROFESSOR } from "./prompts/professor";
import type { TessContext, TessMessage } from "./types";

export async function gerarRespostaTess(contexto: TessContext, historico: TessMessage[], pergunta: string) {
  const instrucoes = contexto.role === "aluno" ? PROMPT_ALUNO : PROMPT_PROFESSOR;
  const resposta = await gerarTextoGemini(instrucoes, promptBase(contexto, historico, pergunta));
  const texto = validarSaida(resposta);
  if (!texto) throw new Error("A Tess não conseguiu produzir uma resposta válida para este contexto.");
  return texto;
}
