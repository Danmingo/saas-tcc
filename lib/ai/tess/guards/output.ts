const PROIBIDOS = [
  /nota\s+(final|acad[eê]mica)|atribuir\s+nota/i,
  /aprov(ad|o|ar)|reprov(ad|o|ar)\s+(o|a)?\s*(tcc|trabalho|projeto)?/i,
  /public(ar|ação)|publiquei|devolutiva\s+publicada/i,
  /doi\s*:\s*10\.|10\.\d{4,9}\//i,
];

export function validarSaida(texto: string) {
  if (!texto.trim() || PROIBIDOS.some((regra) => regra.test(texto))) return null;
  return texto.trim();
}