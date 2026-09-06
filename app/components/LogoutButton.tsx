"use client";

import { useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export default function LogoutButton() {
  const [saindo, setSaindo] = useState(false);
  const [erro, setErro] = useState("");

  async function handleLogout() {
    setSaindo(true);
    setErro("");

    try {
      const supabase = createSupabaseBrowserClient();
      const { error } = await supabase.auth.signOut({ scope: "local" });

      if (error) throw error;

      // Descarta também o cache de navegação das páginas autenticadas.
      window.location.replace("/");
    } catch {
      setErro("Não foi possível sair. Tente novamente.");
      setSaindo(false);
    }
  }

  return (
    <div className="mt-6 border-t border-white/10 pt-4">
      <button
        type="button"
        onClick={handleLogout}
        disabled={saindo}
        className="w-full rounded-lg px-3 py-2.5 text-left text-sm text-white/70 transition-colors hover:bg-white/10 hover:text-white disabled:opacity-60 lg:px-4 lg:py-3"
      >
        {saindo ? "Saindo..." : "Sair"}
      </button>
      {erro && (
        <p role="alert" className="mt-2 text-sm text-red-200">{erro}</p>
      )}
    </div>
  );
}
