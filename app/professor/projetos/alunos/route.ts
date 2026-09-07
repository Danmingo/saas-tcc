import { getProfessorContext } from "@/lib/turmas";
import { alunosDaTurma, mensagemProjetoErro, ProjetoErro } from "@/lib/projetos";

export async function GET(request: Request) {
  const context = await getProfessorContext();
  const turmaId = new URL(request.url).searchParams.get("turma_id") ?? "";
  try {
    const alunos = await alunosDaTurma(context, turmaId);
    return Response.json({ alunos }, { headers: { "Cache-Control": "private, no-store" } });
  } catch (error) {
    return Response.json({ erro: mensagemProjetoErro(error) }, {
      status: error instanceof ProjetoErro ? error.status : 500,
      headers: { "Cache-Control": "private, no-store" },
    });
  }
}
