import { getProfessorContext } from "@/lib/turmas";
import { listarDevolutivas, listarVersoesAluno, listarVersoesProfessor } from "@/lib/envios";
import { listarPendenciasAluno, listarPendenciasProfessor } from "@/lib/pendencias";
import { detalhesProjeto } from "@/lib/projetos";
import type { TessContext, TessContextType, TessRole } from "./types";
import { validarContextoTess } from "./permissions";

export async function carregarContextoTess(contextType: TessContextType, contextId: string | null): Promise<TessContext> {
  const base = await (contextType === "situacao" || contextType === "projeto" || contextType === "pendencia" || contextType === "devolutiva" || contextType === "versao" ? carregarPorSessao(contextType, contextId) : carregarPorSessao("situacao", null));
  return base;
}

async function carregarPorSessao(contextType: TessContextType, contextId: string | null): Promise<TessContext> {
  const supabase = await (async () => { const { createSupabaseServerClient } = await import("@/lib/supabase/server"); return createSupabaseServerClient(); })();
  const auth = await supabase.auth.getUser();
  if (auth.error || !auth.data.user) throw new Error("Sessão não encontrada.");
  const perfil = await supabase.from("usuarios").select("nome,papel").eq("id", auth.data.user.id).single<{ nome: string | null; papel: TessRole }>();
  if (perfil.error || !perfil.data || (perfil.data.papel !== "aluno" && perfil.data.papel !== "professor")) throw new Error("Perfil não autorizado.");
  if (!await validarContextoTess(supabase, perfil.data.papel, contextType, contextId, auth.data.user.id)) throw new Error("Contexto não encontrado ou sem acesso.");
  if (perfil.data.papel === "professor") return contextoProfessor(contextType, contextId, perfil.data.nome || "Professor");
  return contextoAluno(contextType, contextId, perfil.data.nome || "Aluno");
}

async function contextoAluno(contextType: TessContextType, contextId: string | null, nome: string): Promise<TessContext> {
  const [projetos, pendencias, envios] = await Promise.all([import("@/lib/projeto-aluno").then((mod) => mod.listarProjetosAluno()), listarPendenciasAluno(), listarVersoesAluno()]);
  const projeto = contextId && contextType === "projeto" ? projetos.find((item) => item.id === contextId) : projetos[0];
  const devolutivas = await listarDevolutivas(await import("@/lib/envios").then((mod) => mod.contextoAluno()), envios.versoes);
  const projetoVersoes = projeto ? envios.versoes.filter((item) => item.projetoId === projeto.id) : [];
  return { role: "aluno", userName: nome, contextType, contextId, projectId: projeto?.id ?? null, label: projeto ? `${projeto.turma.nome} · ${projeto.titulo}` : "Situação acadêmica do aluno", project: projeto ? { title: projeto.titulo, theme: projeto.tema, description: projeto.descricao, academic: { grande_area: projeto.grande_area, curso: projeto.curso, subarea: projeto.subarea, linha_pesquisa: projeto.linha_pesquisa, tipo_trabalho: projeto.tipo_trabalho, palavras_chave: projeto.palavras_chave }, members: projeto.integrantes.map((item) => item.nome || "Integrante sem nome") } : null, details: { projetos: projetos.map((item) => item.titulo), pendencias_abertas: pendencias.filter((item) => item.status === "pendente").map((item) => item.descricao), devolutivas_recentes: devolutivas.slice(0, 3).map((item) => item.comentario), entregas_proximas: projeto?.entregas.filter((item) => item.status === "ativa").slice(0, 5).map((item) => item.titulo) ?? [], ultima_versao: projetoVersoes[0]?.nomeArquivo ?? null } };
}

async function contextoProfessor(contextType: TessContextType, contextId: string | null, nome: string): Promise<TessContext> {
  const professor = await getProfessorContext();
  const projetoId = contextType === "projeto" ? contextId : contextType === "versao" && contextId ? await projetoDaVersao(professor.supabase, contextId) : contextType === "devolutiva" && contextId ? await projetoDaDevolutiva(professor.supabase, contextId) : null;
  const projeto = projetoId ? await detalhesProjeto(professor, projetoId) : null;
  const projetos = await import("@/lib/projetos").then((mod) => mod.listarProjetos(professor));
  const versoes = await listarVersoesProfessor();
  const contextoPendencias = await import("@/lib/pendencias").then((mod) => mod.contextoProfessor());
  const pendencias = projeto ? await listarPendenciasProfessor(contextoPendencias, projeto.id) : (await Promise.all(projetos.map((item) => listarPendenciasProfessor(contextoPendencias, item.id)))).flat();
  const versao = contextType === "versao" && contextId ? versoes.versoes.find((item) => item.id === contextId) : null;
  const devolutiva = contextType === "devolutiva" && contextId ? (await listarDevolutivas({ supabase: professor.supabase, perfil: professor.professor }, versoes.versoes)).find((item) => item.id === contextId) : null;
  const turmaIds = [...new Set(projetos.map((item) => item.turma_id))];
  const entregas = turmaIds.length ? await professor.supabase.from("entregas").select("titulo,prazo,status").in("turma_id", turmaIds).eq("status", "ativa").order("prazo", { ascending: true, nullsFirst: false }).limit(5).returns<Array<{ titulo: string; prazo: string | null; status: string }>>() : { data: [], error: null };
  const detalhes = { turmas: new Set(projetos.map((item) => item.turma_id)).size, projetos: projetos.length, versoes_aguardando_revisao: versoes.versoes.filter((item) => item.status === "enviada" || item.status === "em_analise").length, pendencias_abertas: pendencias.filter((item) => item.status === "pendente").map((item) => item.descricao), entregas_proximas: entregas.data ?? [], criterio_prioridade: "versões aguardando revisão, pendências abertas e prazo mais próximo", versao_atual: versao ? { numero: versao.numero, arquivo: versao.nomeArquivo, status: versao.status, tema: versao.tema } : null, devolutiva_atual: devolutiva?.comentario ?? null };
  return { role: "professor", userName: nome, contextType, contextId, projectId: projeto?.id ?? null, label: projeto ? projeto.integrantes.map((item) => item.nome || "Integrante sem nome").join(" + ") || projeto.titulo : "Situação das orientações", project: projeto ? { title: projeto.titulo, theme: projeto.tema, description: projeto.descricao, academic: { grande_area: projeto.grande_area, curso: projeto.curso, subarea: projeto.subarea, linha_pesquisa: projeto.linha_pesquisa, tipo_trabalho: projeto.tipo_trabalho, palavras_chave: projeto.palavras_chave }, members: projeto.integrantes.map((item) => item.nome || "Integrante sem nome") } : null, details: detalhes };
}

async function projetoDaVersao(supabase: Awaited<ReturnType<typeof import("@/lib/supabase/server").createSupabaseServerClient>>, id: string) { const { data } = await supabase.from("versoes").select("projeto_id").eq("id", id).maybeSingle<{ projeto_id: string }>(); return data?.projeto_id ?? null; }
async function projetoDaDevolutiva(supabase: Awaited<ReturnType<typeof import("@/lib/supabase/server").createSupabaseServerClient>>, id: string) { const { data } = await supabase.from("devolutivas").select("versao_id").eq("id", id).maybeSingle<{ versao_id: string }>(); return data?.versao_id ? projetoDaVersao(supabase, data.versao_id) : null; }