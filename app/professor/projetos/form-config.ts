export const STATUS_PROJETO = [
  { valor: "rascunho", label: "Rascunho" },
  { valor: "em_andamento", label: "Em andamento" },
  { valor: "aguardando_revisao", label: "Aguardando revisão" },
  { valor: "correcao_solicitada", label: "Correção solicitada" },
  { valor: "concluido", label: "Concluído" },
  { valor: "arquivado", label: "Arquivado" },
] as const;

export type StatusProjeto = typeof STATUS_PROJETO[number]["valor"];

export function idValido(id: unknown): id is string {
  return typeof id === "string" && /^[a-zA-Z0-9_-]{1,128}$/.test(id);
}

export function labelStatus(status: string) {
  return STATUS_PROJETO.find((item) => item.valor === status)?.label ?? status;
}

export function formatarData(valor: string | null, comHora = false) {
  if (!valor) return "Não informada";
  const data = new Date(valor.length === 10 ? valor + "T12:00:00Z" : valor);
  if (!Number.isFinite(data.getTime())) return "Não informada";
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short", ...(comHora ? { timeStyle: "short" as const } : {}), timeZone: "America/Sao_Paulo",
  }).format(data);
}
