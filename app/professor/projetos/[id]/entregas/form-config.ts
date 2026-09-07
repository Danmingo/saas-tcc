export type EntregaFormState = { erro?: string };
export class EntregaValidacaoErro extends Error {}

export function prazoParaFormulario(prazo: string | null) {
  if (!prazo) return "";
  const data = new Date(prazo);
  if (!Number.isFinite(data.getTime())) return "";
  return new Date(data.getTime() - 3 * 60 * 60 * 1000).toISOString().slice(0, 19);
}

export function validarEntrega(form: FormData, editando: boolean) {
  function texto(nome: string) {
    const valor = form.get(nome);
    if (valor !== null && typeof valor !== "string") throw new EntregaValidacaoErro("Informe campos válidos.");
    const result = (valor ?? "").trim();
    if (result.includes("\0")) throw new EntregaValidacaoErro("Informe um texto válido.");
    return result;
  }
  const titulo = texto("titulo");
  const descricao = texto("descricao");
  const ordemTexto = texto("ordem");
  const prazoTexto = texto("prazo");
  const status = editando ? texto("status") : "ativa";
  if (!titulo || titulo.length > 200) throw new EntregaValidacaoErro("Informe um título com até 200 caracteres.");
  if (descricao.length > 5000) throw new EntregaValidacaoErro("A descrição deve ter até 5000 caracteres.");
  const ordem = Number(ordemTexto);
  if (!/^\d+$/.test(ordemTexto) || !Number.isSafeInteger(ordem) || ordem > 2147483647) {
    throw new EntregaValidacaoErro("Informe uma ordem inteira entre 0 e 2147483647.");
  }
  if (status !== "ativa" && status !== "encerrada") throw new EntregaValidacaoErro("Selecione um status válido.");
  let prazo: string | null = null;
  if (prazoTexto) {
    if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2})?$/.test(prazoTexto)) {
      throw new EntregaValidacaoErro("Informe um dia e horário válidos para o prazo.");
    }
    const normalizado = prazoTexto.length === 16 ? prazoTexto + ":00" : prazoTexto;
    const data = new Date(normalizado + "-03:00");
    if (!Number.isFinite(data.getTime()) || prazoParaFormulario(data.toISOString()) !== normalizado) {
      throw new EntregaValidacaoErro("Informe um dia e horário válidos para o prazo.");
    }
    prazo = data.toISOString();
  }
  return { titulo, descricao: descricao || null, prazo, ordem, status };
}
