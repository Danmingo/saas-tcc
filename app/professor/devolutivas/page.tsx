import { ErroEnvios, ListaDevolutivas, TelaEnvios } from "@/app/components/EnviosUI";
import { contextoProfessor, listarDevolutivas, listarVersoesProfessor } from "@/lib/envios";

export default async function Page() {
  let devolutivas: Awaited<ReturnType<typeof listarDevolutivas>> = [];
  let erro = "";

  try {
    const context = await contextoProfessor();
    const { versoes } = await listarVersoesProfessor();
    devolutivas = await listarDevolutivas(context, versoes);
  } catch (error) {
    erro = error instanceof Error ? error.message : "Não foi possível carregar as devolutivas.";
  }

  return (
    <TelaEnvios titulo="Devolutivas" descricao="Acompanhe os feedbacks enviados aos alunos." professor>
      {erro ? (
        <ErroEnvios mensagem={erro} />
      ) : devolutivas.length === 0 ? (
        <p className="mt-8 rounded-2xl border border-[#172033]/10 bg-white p-6 text-sm text-[#172033]/60 shadow-sm">
          Nenhuma devolutiva publicada ainda.
        </p>
      ) : (
        <ListaDevolutivas devolutivas={devolutivas} professor />
      )}
    </TelaEnvios>
  );
}
