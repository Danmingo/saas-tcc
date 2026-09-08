import type { TessIntent } from "./types";
import { TESS_OUT_OF_SCOPE } from "./policy";

const regras: Array<[TessIntent, RegExp]> = [
  ["situacao_usuario", /\b(agora|atenção|atencao|priorizar|próximo|proxima|devo fazer|situação|situacao|quantas versões|pendências abertas)\b/i],
  ["devolutiva", /\b(devolutiva|feedback|comentário do professor|correção solicitada)\b/i],
  ["pendencia", /\b(pendência|pendencia|tarefa|to-do|afazer|resolver)\b/i],
  ["versao", /\b(versão|versao|arquivo enviado|envio|comparar com anterior)\b/i],
  ["metodologia", /\b(metodologia|método|metodo|amostra|coleta|análise|analise)\b/i],
  ["escrita_academica", /\b(escrever|redação|redacao|parágrafo|paragrafo|introdução|introducao|revisar texto)\b/i],
  ["abnt", /\b(abnt|referência bibliográfica|referencia bibliografica|citação|citacao|formatação|formatacao)\b/i],
  ["referencias", /\b(referência|referencia|artigo|doi|autor|bibliografia|fonte científica|fonte cientifica)\b/i],
  ["planejamento", /\b(plano|planejamento|cronograma|prazo|organizar|etapas)\b/i],
  ["projeto", /\b(projeto|tema|tcc|problema|objetivo|hipertensão|hipertensao)\b/i],
];

export function classificarIntencao(pergunta: string): TessIntent {
  if (!pergunta.trim()) return "fora_do_escopo";
  return regras.find(([, regra]) => regra.test(pergunta))?.[0] ?? "fora_do_escopo";
}

export function respostaForaDoEscopo() { return TESS_OUT_OF_SCOPE; }