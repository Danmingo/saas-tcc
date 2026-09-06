export type CampoTurma = "nome" | "curso" | "etapa" | "periodo" | "tipo_curso";
export type ValoresTurma = Record<CampoTurma, string>;

export type TurmaFormState = {
  erro?: string;
  errosCampos?: Partial<Record<CampoTurma, string>>;
  valores?: ValoresTurma;
};

type ConfigCampo = {
  nome: CampoTurma;
  label: string;
  obrigatorio?: boolean;
  maxLength: number;
  sugestoes?: readonly string[];
};

export const CAMPOS_TURMA: readonly ConfigCampo[] = [
  { nome: "nome", label: "Nome da turma", obrigatorio: true, maxLength: 160 },
  { nome: "curso", label: "Curso", maxLength: 160 },
  {
    nome: "etapa",
    label: "Etapa/componente",
    maxLength: 80,
    sugestoes: ["TCC 1", "TCC 2", "Projeto Integrador", "Trabalho de Conclusão", "Projeto Final"],
  },
  { nome: "periodo", label: "Período", maxLength: 40 },
  {
    nome: "tipo_curso",
    label: "Tipo de curso",
    maxLength: 80,
    sugestoes: ["Graduação", "Técnico", "Tecnólogo", "Pós-graduação"],
  },
];
