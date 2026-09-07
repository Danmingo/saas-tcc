import { ErroEnvios, ListaVersoes, TelaEnvios } from "@/app/components/EnviosUI";
import { listarVersoesProfessor } from "@/lib/envios";

export default async function Page() {
  let versoes: Awaited<ReturnType<typeof listarVersoesProfessor>>["versoes"] = [];
  let erro = "";
  try {
    versoes = (await listarVersoesProfessor()).versoes;
  } catch (error) {
    erro = error instanceof Error ? error.message : "Não foi possível carregar os envios.";
  }
  return <TelaEnvios titulo="Envios" descricao="Acompanhe as versões enviadas pelos alunos das suas turmas." professor>{erro ? <ErroEnvios mensagem={erro} /> : !versoes?.length ? <p className="mt-8 rounded-2xl border border-[#172033]/10 bg-white p-6 text-sm text-[#172033]/60 shadow-sm">Nenhum envio encontrado.</p> : <ListaVersoes versoes={versoes} professor />}</TelaEnvios>;
}
