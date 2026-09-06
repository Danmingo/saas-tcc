import type { ReactNode } from "react";
import ProfessorSidebar from "./components/ProfessorSidebar";
import { ProfessorGreetingProvider } from "./components/ProfessorGreeting";
import { requireRole } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type ProfessorLayoutProps = {
  children: ReactNode;
};

export default async function ProfessorLayout({
  children,
}: ProfessorLayoutProps) {
  const supabase = await createSupabaseServerClient();
  const professor = await requireRole(supabase, "professor");
  let primeiroNome = "";

  try {
    const { data: usuario, error } = await supabase
      .from("usuarios")
      .select("nome")
      .eq("id", professor.id)
      .maybeSingle();

    if (!error && typeof usuario?.nome === "string") {
      primeiroNome = usuario.nome.trim().split(/\s+/)[0] ?? "";
    }
  } catch {
    // A saudação usa o fallback sem interromper o acesso já autorizado.
  }

  return (
    <div className="min-h-screen bg-[#F5F7FA] lg:flex">
      <ProfessorSidebar />

      <div className="min-w-0 flex-1">
        <div className="mx-auto w-full max-w-7xl">
          <ProfessorGreetingProvider primeiroNome={primeiroNome}>
            {children}
          </ProfessorGreetingProvider>
        </div>
      </div>
    </div>
  );
}
