import Link from "next/link";
import type { TessContextType } from "@/lib/ai/tess/types";

export default function TessQuickActions({ role, contextType = "situacao", contextId = null, label = "✨ Perguntar à Tess" }: { role: "aluno" | "professor"; contextType?: TessContextType; contextId?: string | null; label?: string }) {
  const query = new URLSearchParams({ tipo: contextType ?? "situacao" }); if (contextId) query.set("id", contextId);
  return <Link href={`/${role}/tess?${query}`} className="inline-flex items-center rounded-xl border border-[#6366F1]/30 bg-white px-4 py-2.5 text-sm font-semibold text-[#6366F1] hover:bg-[#6366F1]/5">{label}</Link>;
}