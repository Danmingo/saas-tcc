import { carregarContextoTess } from "../context";
export async function obterDevolutivaTess(devolutivaId: string) { return carregarContextoTess("devolutiva", devolutivaId); }