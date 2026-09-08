import { carregarContextoTess } from "../context";
export async function obterVersaoTess(versaoId: string) { return carregarContextoTess("versao", versaoId); }