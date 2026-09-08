import "server-only";

import { GoogleGenAI } from "@google/genai";

export const GEMINI_MODEL = "gemini-3.8-flash";

export function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) throw new Error("GEMINI_API_KEY não configurada no servidor.");
  return new GoogleGenAI({ apiKey });
}

export async function gerarTextoGemini(systemPrompt: string, userPrompt: string) {
  const client = getGeminiClient();
  let interaction;
  try {
    interaction = await client.interactions.create({
      model: GEMINI_MODEL,
      system_instruction: systemPrompt,
      input: userPrompt,
      // O histórico continua sendo gerenciado pela Tess.
      store: false,
    });
  } catch (error) {
    const status = typeof error === "object" && error !== null && "status" in error ? error.status : undefined;
    const mensagem = error instanceof Error ? error.message : "";
    if (status === 404 || /model.*(not found|not available|unavailable|not supported|no longer|does not exist)/i.test(mensagem)) {
      throw new Error(`O modelo ${GEMINI_MODEL} está indisponível para esta chave da API.`);
    }
    // Não propagar payloads, cabeçalhos ou mensagens brutas do SDK ao cliente.
    throw new Error(`Não foi possível consultar a API Gemini${typeof status === "number" ? ` (HTTP ${status})` : ""}. Tente novamente mais tarde.`);
  }

  if (interaction.status !== "completed") {
    throw new Error("A API Gemini não concluiu a geração da resposta.");
  }
  const texto = interaction.output_text?.trim();
  if (!texto) throw new Error("A API Gemini retornou uma resposta vazia.");
  return texto;
}
