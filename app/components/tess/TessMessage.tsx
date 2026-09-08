import type { TessMessage as TessMessageType } from "@/lib/ai/tess/types";

export default function TessMessage({ mensagem }: { mensagem: TessMessageType }) {
  const usuario = mensagem.role === "usuario";
  return <div className={`flex ${usuario ? "justify-end" : "justify-start"}`}><div className={`max-w-[90%] whitespace-pre-wrap rounded-2xl px-4 py-3 text-sm leading-6 ${usuario ? "bg-[#6366F1] text-white" : "border border-[#172033]/10 bg-white text-[#172033]"}`}><p className="mb-1 text-xs font-semibold opacity-60">{usuario ? "Você" : "Tess"}</p>{mensagem.content}</div></div>;
}