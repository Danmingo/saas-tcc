"use server";

import { criarConversaTess, enviarMensagemTess } from "@/lib/ai/tess/service";

export type TessVersaoState = { resposta?: string; modo?: "resumo" | "comparacao" | "rascunho"; erro?: string };

export async function analisarVersaoComTess(versaoId: string, _estado: TessVersaoState, form: FormData): Promise<TessVersaoState> {
  void _estado;
  const modo = form.get("modo");
  if (modo !== "resumo" && modo !== "comparacao" && modo !== "rascunho") return { erro: "Ação da Tess inválida." };
  const prompts = { resumo: "Resuma esta versão para orientar a revisão do professor. Não atribua nota e destaque fatos observáveis.", comparacao: "Compare esta versão com a versão anterior disponível no contexto. Se não houver anterior, informe isso. Não atribua nota.", rascunho: "Crie um RASCUNHO SUGERIDO PELA TESS para uma devolutiva do professor, com pontos fortes, pontos a revisar e próximos passos. Não publique e não atribua nota." };
  try { const conversa = await criarConversaTess("versao", versaoId); const resposta = await enviarMensagemTess(conversa.id, prompts[modo]); return { resposta: resposta.content, modo }; }
  catch (error) { return { erro: error instanceof Error ? error.message : "Não foi possível analisar a versão." }; }
}