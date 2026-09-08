const MAX_PERGUNTA = 4000;

export function validarEntrada(pergunta: unknown) {
  if (typeof pergunta !== "string") throw new Error("Pergunta inválida.");
  const valor = pergunta.trim();
  if (!valor) throw new Error("Escreva uma pergunta para a Tess.");
  if (valor.length > MAX_PERGUNTA) throw new Error("A pergunta deve ter até 4000 caracteres.");
  return valor;
}