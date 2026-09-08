import { carregarContextoTess } from "../context";
export async function obterProjetoTess(projetoId: string) { return carregarContextoTess("projeto", projetoId); }