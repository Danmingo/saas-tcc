export type TessRole = "aluno" | "professor";
export type TessIntent = "projeto" | "metodologia" | "escrita_academica" | "devolutiva" | "pendencia" | "versao" | "referencias" | "abnt" | "planejamento" | "situacao_usuario" | "fora_do_escopo";
export type TessContextType = "geral" | "situacao" | "projeto" | "devolutiva" | "pendencia" | "versao" | null;
export type TessMessageRole = "usuario" | "assistente";

export type TessContext = {
  role: TessRole;
  userName: string;
  contextType: TessContextType;
  contextId: string | null;
  projectId: string | null;
  label: string;
  project: {
    title: string;
    theme: string | null;
    description: string | null;
    academic: Record<string, string | string[] | null>;
    members: string[];
  } | null;
  details: Record<string, unknown>;
};

export type TessMessage = { id?: string; role: TessMessageRole; content: string; intent?: TessIntent | null; createdAt?: string };
export type TessConversation = { id: string; titulo: string; contexto_tipo: TessContextType; contexto_id: string | null; criado_em: string; atualizado_em: string };
export type TessReply = { content: string; intent: TessIntent; blocked: boolean };