export const STATUS_PROJETO = [
  { valor: "rascunho", label: "Rascunho" },
  { valor: "em_andamento", label: "Em andamento" },
  { valor: "aguardando_revisao", label: "Aguardando revisão" },
  { valor: "correcao_solicitada", label: "Correção solicitada" },
  { valor: "concluido", label: "Concluído" },
  { valor: "arquivado", label: "Arquivado" },
] as const;

export type StatusProjeto = typeof STATUS_PROJETO[number]["valor"];
export type ProjetoValores = {
  turma_id: string;
  titulo: string;
  tema: string;
  descricao: string;
  status: string;
  data_inicio: string;
  prazo_final: string;
  alunos: string[];
};
export type ProjetoFormState = {
  erro?: string;
  valores?: ProjetoValores;
  projetoPendenteId?: string;
};

export const CAMPOS_PROJETO = [
  { nome: "titulo", label: "Título", maxLength: 200, obrigatorio: true },
  { nome: "tema", label: "Tema", maxLength: 300, obrigatorio: false },
  { nome: "descricao", label: "Descrição", maxLength: 5000, obrigatorio: false },
] as const;

export function idValido(id: unknown): id is string {
  return typeof id === "string" && /^[a-zA-Z0-9_-]{1,128}$/.test(id);
}

export function lerProjetoForm(form: FormData, editando: boolean) {
  const valores: ProjetoValores = {
    turma_id: "", titulo: "Projeto sem título", tema: "", descricao: "",
    status: "rascunho", data_inicio: "", prazo_final: "", alunos: [],
  };
  let erro = "";
  for (const nome of ["turma_id", "data_inicio", "prazo_final"] as const) {
    const valor = form.get(nome);
    if (valor !== null && typeof valor !== "string") {
      erro = "Informe valores válidos nos campos do projeto.";
    } else {
      valores[nome] = (valor ?? "").trim();
      if (valores[nome].includes("\0")) erro = "Informe um texto válido.";
    }
  }
  if (editando) {
    const status = form.get("status");
    valores.status = typeof status === "string" ? status : "";
    if (!STATUS_PROJETO.some((item) => item.valor === valores.status)) erro = "Selecione um status válido.";
  }
  if (!idValido(valores.turma_id)) erro = "Selecione uma turma.";
  for (const nome of ["data_inicio", "prazo_final"] as const) {
    const valor = valores[nome];
    if (valor) {
      const data = new Date(valor + "T00:00:00Z");
      if (!/^\d{4}-\d{2}-\d{2}$/.test(valor) || !Number.isFinite(data.getTime()) ||
          data.toISOString().slice(0, 10) !== valor) erro = "Informe datas válidas.";
    }
  }
  if (valores.data_inicio && valores.prazo_final && valores.prazo_final < valores.data_inicio) {
    erro = "O prazo final não pode ser anterior à data de início.";
  }
  const alunos = form.getAll("aluno_id");
  if (!alunos.length || alunos.length > 100 || alunos.some((id) => !idValido(id))) {
    erro = "Selecione de 1 a 100 alunos da turma.";
  } else {
    valores.alunos = [...new Set(alunos as string[])];
  }
  return { valores, erro };
}

export function labelStatus(status: string) {
  return STATUS_PROJETO.find((item) => item.valor === status)?.label ?? status;
}

export function formatarData(valor: string | null, comHora = false) {
  if (!valor) return "Não informada";
  const data = new Date(valor.length === 10 ? valor + "T12:00:00Z" : valor);
  if (!Number.isFinite(data.getTime())) return "Não informada";
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short", ...(comHora ? { timeStyle: "short" as const } : {}), timeZone: "America/Sao_Paulo",
  }).format(data);
}
