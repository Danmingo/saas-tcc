import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import { getAlunoContext } from "@/lib/aluno";
import { getProfessorContext } from "@/lib/turmas";
import { uuidValido } from "@/lib/arquivos";

export type PerfilEnvios = { id: string; papel: "aluno" | "professor" };
export type EnviosContext = { supabase: SupabaseClient; perfil: PerfilEnvios };
export class EnvioErro extends Error {
  constructor(message: string, public status = 400) { super(message); }
}
export function mensagemEnvio(error: unknown) {
  return error instanceof EnvioErro ? error.message : "Não foi possível concluir a operação. Tente novamente.";
}
export function verificarOperacao(error: { message: string; code?: string } | null, alvo: string, operacao: string) {
  if (!error) return;
  if (error.code === "42501" || /row.level security|permission denied|unauthorized/i.test(error.message)) {
    throw new EnvioErro(alvo + " — " + operacao + ": " + error.message +
      ". Policy provável: " + operacao + " para o usuário autenticado e seus projetos.", 403);
  }
  throw new EnvioErro("Não foi possível executar " + operacao + " em " + alvo + ".", 503);
}
export async function contextoAluno(): Promise<EnviosContext> {
  const { supabase, aluno } = await getAlunoContext();
  return { supabase, perfil: aluno };
}
export async function contextoProfessor(): Promise<EnviosContext> {
  const { supabase, professor } = await getProfessorContext();
  return { supabase, perfil: professor };
}
function exigirPapel(context: EnviosContext, papel: PerfilEnvios["papel"]) {
  if (context.perfil.papel !== papel) throw new EnvioErro("Você não tem acesso a esta operação.", 403);
}
function validarId(id: unknown) {
  if (!uuidValido(id)) throw new EnvioErro("Recurso não encontrado ou sem acesso.", 404);
}
export type ProjetoEnvio = { id: string; turma_id: string; titulo: string; tema: string | null };
export type TurmaEnvio = { id: string; nome: string; professor_id: string };
export type EntregaEnvio = { id: string; turma_id: string; titulo: string; descricao: string | null; prazo: string | null; ordem: number; status: "ativa" | "encerrada" };
export type PessoaEnvio = { id: string; nome: string | null };
export async function projetoAutorizado(context: EnviosContext, projetoId: string): Promise<ProjetoEnvio> {
  validarId(projetoId);
  if (context.perfil.papel === "aluno") {
    const { data, error } = await context.supabase.from("projeto_alunos").select("projeto_id")
      .eq("projeto_id", projetoId).eq("aluno_id", context.perfil.id).maybeSingle();
    verificarOperacao(error, "public.projeto_alunos", "SELECT");
    if (!data) throw new EnvioErro("Projeto não encontrado ou sem acesso.", 404);
  }
  const { data: projeto, error } = await context.supabase.from("projetos").select("id,turma_id,titulo,tema")
    .eq("id", projetoId).maybeSingle<ProjetoEnvio>();
  verificarOperacao(error, "public.projetos", "SELECT");
  if (!projeto) throw new EnvioErro("Projeto não encontrado ou sem acesso.", 404);
  if (context.perfil.papel === "professor") {
    const { data: turma, error: turmaError } = await context.supabase.from("turmas").select("id")
      .eq("id", projeto.turma_id).eq("professor_id", context.perfil.id).maybeSingle();
    verificarOperacao(turmaError, "public.turmas", "SELECT");
    if (!turma) throw new EnvioErro("Projeto não encontrado ou sem acesso.", 404);
  }
  return projeto;
}
export async function validarEnvio(context: EnviosContext, projetoId: string, entregaId: string) {
  exigirPapel(context, "aluno");
  const projeto = await projetoAutorizado(context, projetoId);
  validarId(entregaId);
  const { data, error } = await context.supabase.from("entregas").select("id,turma_id,status")
    .eq("id", entregaId).eq("turma_id", projeto.turma_id).maybeSingle();
  verificarOperacao(error, "public.entregas", "SELECT");
  if (!data || data.status !== "ativa") throw new EnvioErro("Entrega encerrada ou indisponível para este projeto.", 403);
  return projeto;
}

export async function projetosPermitidos(context: EnviosContext): Promise<ProjetoEnvio[]> {
  let ids: string[];
  if (context.perfil.papel === "professor") {
    const { data, error } = await context.supabase.from("turmas").select("id").eq("professor_id", context.perfil.id);
    verificarOperacao(error, "public.turmas", "SELECT");
    ids = (data ?? []).map((t) => t.id);
  } else {
    const { data, error } = await context.supabase.from("projeto_alunos").select("projeto_id").eq("aluno_id", context.perfil.id);
    verificarOperacao(error, "public.projeto_alunos", "SELECT");
    ids = (data ?? []).map((v) => v.projeto_id);
  }
  if (!ids.length) return [];
  const { data, error } = await context.supabase.from("projetos").select("id,turma_id,titulo,tema")
    .in(context.perfil.papel === "professor" ? "turma_id" : "id", [...new Set(ids)])
    .order("criado_em", { ascending: false }).returns<ProjetoEnvio[]>();
  verificarOperacao(error, "public.projetos", "SELECT");
  return data ?? [];
}

export async function catalogoEnvios(context: EnviosContext) {
  const projetos = await projetosPermitidos(context);
  if (!projetos.length) return { projetos, turmas: [] as TurmaEnvio[], entregas: [] as EntregaEnvio[], integrantes: new Map<string, string>() };
  const projetoIds = projetos.map((p) => p.id);
  const turmaIds = [...new Set(projetos.map((p) => p.turma_id))];
  const [turmas, entregas, vinculos] = await Promise.all([
    context.supabase.from("turmas").select("id,nome,professor_id").in("id", turmaIds).order("nome").returns<TurmaEnvio[]>(),
    context.supabase.from("entregas").select("id,turma_id,titulo,descricao,prazo,ordem,status").in("turma_id", turmaIds)
      .order("ordem").order("prazo", { nullsFirst: false }).order("criado_em").returns<EntregaEnvio[]>(),
    context.supabase.from("projeto_alunos").select("projeto_id,aluno_id").in("projeto_id", projetoIds)
      .returns<{ projeto_id: string; aluno_id: string }[]>(),
  ]);
  verificarOperacao(turmas.error, "public.turmas", "SELECT");
  verificarOperacao(entregas.error, "public.entregas", "SELECT");
  verificarOperacao(vinculos.error, "public.projeto_alunos", "SELECT");
  const pessoas = await nomesUsuarios(context, (vinculos.data ?? []).map((v) => v.aluno_id));
  const integrantes = new Map(projetos.map((p) => [p.id, (vinculos.data ?? []).filter((v) => v.projeto_id === p.id)
    .map((v) => pessoas.get(v.aluno_id) || "Integrante sem nome disponível").join(" + ") || "Integrantes não disponíveis"]));
  return { projetos, turmas: turmas.data ?? [], entregas: entregas.data ?? [], integrantes };
}

export type VersaoEnvio = {
  id: string; projeto_id: string; entrega_id: string; numero_versao: number;
  nome_arquivo: string; arquivo_url: string; enviado_por: string;
  enviado_em: string; status: string;
};
export type DevolutivaEnvio = {
  id: string; versao_id: string; professor_id: string;
  comentario: string; tipo: string; criado_em: string;
};

export type EnvioDetalhe = {
  id: string; projetoId: string; turmaId: string; entregaId: string; numero: number;
  nomeArquivo: string; arquivoPath: string; data: string; autor: string;
  status: string; turma: string; entrega: string; integrantes: string;
  titulo: string; tema: string | null;
};

function montarVersoes(
  versoes: VersaoEnvio[],
  catalogo: Awaited<ReturnType<typeof catalogoEnvios>>,
  pessoas: Map<string, string>,
) {
  return versoes.flatMap((versao) => {
    const projeto = catalogo.projetos.find((item) => item.id === versao.projeto_id);
    const entrega = catalogo.entregas.find((item) => item.id === versao.entrega_id);
    const turma = catalogo.turmas.find((item) => item.id === projeto?.turma_id);
    if (!projeto || !entrega || !turma) return [];
    return [{
      id: versao.id,
      projetoId: projeto.id,
      turmaId: turma.id,
      entregaId: entrega.id,
      numero: versao.numero_versao,
      nomeArquivo: versao.nome_arquivo,
      arquivoPath: versao.arquivo_url,
      data: versao.enviado_em,
      autor: pessoas.get(versao.enviado_por) || "Aluno sem nome",
      status: versao.status,
      turma: turma.nome,
      entrega: entrega.titulo,
      integrantes: catalogo.integrantes.get(projeto.id) || "Integrantes não disponíveis",
      titulo: projeto.titulo === "Projeto sem título" ? "Título ainda não definido pelo aluno" : projeto.titulo,
      tema: projeto.tema,
    } satisfies EnvioDetalhe];
  }).sort((a, b) => Date.parse(b.data) - Date.parse(a.data));
}

async function versoesDoContexto(context: EnviosContext) {
  const catalogo = await catalogoEnvios(context);
  if (!catalogo.projetos.length) return { versoes: [] as EnvioDetalhe[], catalogo };
  const projetoIds = catalogo.projetos.map((projeto) => projeto.id);
  const { data, error } = await context.supabase.from("versoes")
    .select("id,projeto_id,entrega_id,numero_versao,nome_arquivo,arquivo_url,enviado_por,enviado_em,status")
    .in("projeto_id", projetoIds).order("enviado_em", { ascending: false }).returns<VersaoEnvio[]>();
  verificarOperacao(error, "public.versoes", "SELECT");
  const ids = [...new Set((data ?? []).map((versao) => versao.enviado_por))];
  const pessoas = await nomesUsuarios(context, ids);
  return { versoes: montarVersoes(data ?? [], catalogo, pessoas), catalogo };
}

export async function listarVersoesAluno() {
  const context = await contextoAluno();
  return versoesDoContexto(context);
}

export async function listarVersoesProfessor() {
  const context = await contextoProfessor();
  return versoesDoContexto(context);
}

export async function buscarVersao(context: EnviosContext, versaoId: string) {
  validarId(versaoId);
  const resultado = await versoesDoContexto(context);
  return resultado.versoes.find((versao) => versao.id === versaoId) ?? null;
}

export async function listarDevolutivas(context: EnviosContext, versoes: EnvioDetalhe[]) {
  if (!versoes.length) return [];
  const { data, error } = await context.supabase.from("devolutivas")
    .select("id,versao_id,professor_id,comentario,tipo,criado_em")
    .in("versao_id", versoes.map((versao) => versao.id))
    .order("criado_em", { ascending: false }).returns<DevolutivaEnvio[]>();
  verificarOperacao(error, "public.devolutivas", "SELECT");
  const pessoas = await nomesUsuarios(context, (data ?? []).map((item) => item.professor_id));
  const versoesMap = new Map(versoes.map((versao) => [versao.id, versao]));
  return (data ?? []).flatMap((item) => {
    const versao = versoesMap.get(item.versao_id);
    if (!versao) return [];
    return [{
      id: item.id,
      versao,
      professor: pessoas.get(item.professor_id) || "Professor",
      comentario: item.comentario,
      tipo: item.tipo,
      data: item.criado_em,
    }];
  });
}
async function nomesUsuarios(context: EnviosContext, ids: string[]) {
  if (!ids.length) return new Map<string, string>();
  const { data, error } = await context.supabase.from("usuarios").select("id,nome").in("id", [...new Set(ids)]).returns<PessoaEnvio[]>();
  verificarOperacao(error, "public.usuarios", "SELECT");
  return new Map((data ?? []).map((p) => [p.id, p.nome ?? ""]));
}

