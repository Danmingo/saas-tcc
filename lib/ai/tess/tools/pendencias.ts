import { carregarContextoTess } from "../context";
export async function obterPendenciaTess(pendenciaId: string) { return carregarContextoTess("pendencia", pendenciaId); }