export type ContextoAcademicoProjeto = {
  grande_area: string | null;
  curso: string | null;
  subarea: string | null;
  linha_pesquisa: string | null;
  tipo_trabalho: string | null;
  palavras_chave: string[];
};

export const camposContextoAcademico = [
  { nome: "grande_area", label: "Grande área", obrigatorio: true },
  { nome: "curso", label: "Curso", obrigatorio: true },
  { nome: "subarea", label: "Subárea", obrigatorio: false },
  { nome: "linha_pesquisa", label: "Linha de pesquisa", obrigatorio: false },
  { nome: "tipo_trabalho", label: "Tipo de trabalho", obrigatorio: false },
] as const;

export function normalizarPalavrasChave(texto: string): string[] {
  return texto.split(",").map((palavra) => palavra.trim()).filter(Boolean);
}
