import type { SupabaseClient } from "@supabase/supabase-js";

export const BUCKET_ARQUIVOS = "tcc-arquivos";
export const MAX_ARQUIVO = 20 * 1024 * 1024;
export const TIPOS_ARQUIVO = {
  pdf: "application/pdf",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
} as const;
export const STATUS_VERSAO = [
  ["enviada", "Enviada"], ["em_analise", "Em análise"], ["revisada", "Revisada"],
  ["correcao_solicitada", "Correção solicitada"], ["aprovada", "Aprovada"],
] as const;
export const TIPOS_DEVOLUTIVA = [
  ["comentario", "Comentário"], ["correcao", "Solicitar correção"], ["aprovacao", "Aprovação"],
] as const;
export type ResultadoEnvio = { erro?: string; sucesso?: string };
export function uuidValido(valor: unknown): valor is string {
  return typeof valor === "string" && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(valor);
}
export function validarArquivo(file: Pick<File, "name" | "size" | "type">) {
  const ext = file.name.split(".").pop()?.toLowerCase();
  if (ext !== "pdf" && ext !== "docx") return "Escolha um arquivo PDF ou DOCX.";
  if (file.type !== TIPOS_ARQUIVO[ext]) return "O tipo MIME do arquivo não corresponde a um PDF ou DOCX válido.";
  if (file.size <= 0 || file.size > MAX_ARQUIVO) return "O arquivo deve ter conteúdo e no máximo 20 MB.";
  return "";
}
export function nomeSeguro(nome: string) {
  const ext = nome.split(".").pop()?.toLowerCase() ?? "";
  const base = nome.slice(0, nome.lastIndexOf(".")).normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9_-]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 100) || "arquivo";
  return base + "." + ext;
}
export function pathValido(path: unknown, projetoId: string, entregaId: string) {
  if (!uuidValido(projetoId) || !uuidValido(entregaId) || typeof path !== "string") return false;
  const partes = path.split("/");
  return partes.length === 3 && partes[0] === projetoId && partes[1] === entregaId &&
    uuidValido(partes[2].slice(0, 36)) &&
    /^-[a-zA-Z0-9_-]{1,100}\.(pdf|docx)$/.test(partes[2].slice(36));
}
export function erroStorage(error: { message: string }, operacao: string) {
  // Mensagens do Storage, sem tokens ou URLs assinadas.
  return "Bucket tcc-arquivos — " + operacao + ": " + error.message +
    " Verifique as policies de " + (operacao === "upload" ? "INSERT" : "DELETE de arquivo órfão do próprio aluno") + " em storage.objects.";
}

export async function enviarArquivo({
  supabase, file, projetoId, entregaId, preparar, registrar, progresso,
}: {
  supabase: SupabaseClient; file: File; projetoId: string; entregaId: string;
  preparar: () => Promise<ResultadoEnvio>;
  registrar: (path: string, nome: string) => Promise<ResultadoEnvio>;
  progresso: (texto: string) => void;
}): Promise<ResultadoEnvio> {
  const erro = validarArquivo(file);
  if (erro) return { erro };
  if (!uuidValido(projetoId) || !uuidValido(entregaId)) return { erro: "Projeto ou entrega inválidos." };
  progresso("Validando acesso...");
  const acesso = await preparar();
  if (acesso.erro) return acesso;
  const nome = nomeSeguro(file.name);
  const path = projetoId + "/" + entregaId + "/" + crypto.randomUUID() + "-" + nome;
  progresso("Enviando arquivo...");
  const bucket = supabase.storage.from(BUCKET_ARQUIVOS);
  const { error: uploadError } = await bucket.upload(path, file, { contentType: file.type, upsert: false });
  if (uploadError) return { erro: erroStorage(uploadError, "upload") };
  progresso("Registrando versão...");
  let resultado: ResultadoEnvio;
  try {
    resultado = await registrar(path, nome);
    if (resultado.sucesso) return resultado;
    if (!resultado.erro) resultado = { erro: "O registro da versão não foi confirmado. Consulte o histórico." };
  } catch {
    resultado = { erro: "Não foi possível confirmar o registro da versão. Consulte o histórico antes de reenviar." };
  }
  // Usa apenas o path desta tentativa. A policy impede remover um objeto já registrado.
  progresso("Verificando arquivo após falha...");
  try {
    const { data, error: removeError } = await bucket.remove([path]);
    if (removeError) return { erro: resultado.erro + " " + erroStorage(removeError, "remoção") };
    if (!data?.length) return { erro: resultado.erro + " A remoção do arquivo não foi confirmada; ele pode já estar vinculado a uma versão. Verifique o histórico." };
  } catch {
    return { erro: resultado.erro + " Também não foi possível remover o arquivo recém-enviado do bucket tcc-arquivos. Verifique a conexão e a policy DELETE de arquivos órfãos." };
  }
  return { erro: resultado.erro + " O arquivo recém-enviado foi removido." };
}
