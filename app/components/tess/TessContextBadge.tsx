import type { TessContext } from "@/lib/ai/tess/types";

export default function TessContextBadge({ contexto }: { contexto: TessContext }) {
  return <div className="rounded-xl border border-[#6366F1]/20 bg-[#6366F1]/5 px-4 py-3"><p className="text-xs font-semibold uppercase tracking-wide text-[#6366F1]">Contexto atual</p><p className="mt-1 text-sm font-medium text-[#172033]">{contexto.label}</p>{contexto.project && <p className="mt-1 text-xs text-[#172033]/60">{contexto.project.members.length ? contexto.project.members.join(" + ") : contexto.project.title}</p>}</div>;
}