import type { ReactNode } from "react";
import AlunoSidebar from "./components/AlunoSidebar";
import { requireRole } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type AlunoLayoutProps = {
  children: ReactNode;
};

export default async function AlunoLayout({
  children,
}: AlunoLayoutProps) {
  const supabase = await createSupabaseServerClient();
  await requireRole(supabase, "aluno");

  return (
    <div className="min-h-screen bg-[#F5F7FA] lg:flex">
      <AlunoSidebar />

      <div className="min-w-0 flex-1">
        <div className="mx-auto w-full max-w-7xl">
        {children}
        </div>
      </div>
    </div>
  );
}
