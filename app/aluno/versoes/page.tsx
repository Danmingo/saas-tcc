import { TelaEnvios, ErroEnvios } from "@/app/components/EnviosUI";
import { listarVersoesAluno } from "@/lib/envios";
import VersaoAlunoCard from "./VersaoAlunoCard";

export default async function Page() {
  let dados;
  try {
    dados = await listarVersoesAluno();
  } catch (error) {
    return <TelaEnvios titulo="Versões" descricao="Envie documentos e consulte o histórico das versões do seu TCC."><ErroEnvios mensagem={error instanceof Error ? error.message : "Não foi possível carregar as versões."} /></TelaEnvios>;
  }
  const projetoIds = new Set(dados.versoes.map((versao) => versao.projetoId));
  const projetos = dados.catalogo.projetos.filter((projeto) => projetoIds.has(projeto.id) || dados.catalogo.entregas.some((entrega) => projeto.turma_id === entrega.turma_id));
  const projetosComEnvios = projetos.length ? projetos : dados.catalogo.projetos;

  return (
    <TelaEnvios titulo="Versões" descricao="Envie documentos e consulte o histórico das versões do seu TCC.">
      {!projetosComEnvios.length ? <p className="mt-8 rounded-2xl border border-[#172033]/10 bg-white p-6 text-sm text-[#172033]/60 shadow-sm">Você ainda não está vinculado a um projeto.</p> : projetosComEnvios.map((projeto) => <VersaoAlunoCard key={projeto.id} projeto={projeto} entregas={dados.catalogo.entregas.filter((entrega) => entrega.turma_id === projeto.turma_id)} versoes={dados.versoes.filter((versao) => versao.projetoId === projeto.id)} />)}
    </TelaEnvios>
  );
}
