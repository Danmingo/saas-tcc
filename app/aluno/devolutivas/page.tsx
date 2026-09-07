import { ErroEnvios, ListaDevolutivas, TelaEnvios } from "@/app/components/EnviosUI";
import { contextoAluno, listarDevolutivas, listarVersoesAluno } from "@/lib/envios";

export default async function Page() {
  let devolutivas: Awaited<ReturnType<typeof listarDevolutivas>> = [];
  let erro = "";
  try {
    const context = await contextoAluno();
    const { versoes } = await listarVersoesAluno();
    devolutivas = await listarDevolutivas(context, versoes);
  } catch (error) {
    erro = error instanceof Error ? error.message : "Não foi possível carregar as devolutivas.";
  }
  return <TelaEnvios titulo="Devolutivas" descricao="Visualize os comentários e as correções enviadas pelo professor.">{erro ? <ErroEnvios mensagem={erro} /> : !devolutivas?.length ? <p className="mt-8 rounded-2xl border border-[#172033]/10 bg-white p-6 text-sm text-[#172033]/60 shadow-sm">Ainda não há devolutivas.</p> : <ListaDevolutivas devolutivas={devolutivas} />}</TelaEnvios>;
}
