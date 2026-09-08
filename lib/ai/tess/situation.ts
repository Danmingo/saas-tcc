import { carregarContextoTess } from "./context";

export async function obterSituacaoAluno() { return carregarContextoTess("situacao", null); }
export async function obterSituacaoProfessor() { return carregarContextoTess("situacao", null); }