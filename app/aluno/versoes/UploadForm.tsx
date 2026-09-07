"use client";

import { useRef, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { enviarArquivo, validarArquivo } from "@/lib/arquivos";
import { prepararEnvio, registrarVersao } from "./actions";

export default function UploadForm({ projetoId, entregaId, ativa }: { projetoId: string; entregaId: string; ativa: boolean }) {
  const [enviando, setEnviando] = useState(false);
  const [etapa, setEtapa] = useState("");
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");
  const trava = useRef(false);
  const router = useRouter();
  if (!ativa) return <p className="mt-3 text-sm text-[#172033]/60">Entrega encerrada. Não é possível enviar arquivos.</p>;
  async function enviar(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (trava.current) return;
    const form = event.currentTarget;
    const file = new FormData(form).get("arquivo");
    setErro(""); setSucesso("");
    if (!(file instanceof File)) { setErro("Selecione um arquivo."); return; }
    const invalido = validarArquivo(file);
    if (invalido) { setErro(invalido); return; }
    trava.current = true; setEnviando(true);
    try {
      const resultado = await enviarArquivo({
        supabase: createSupabaseBrowserClient(), file, projetoId, entregaId,
        preparar: () => prepararEnvio(projetoId, entregaId),
        registrar: (path, nome) => registrarVersao(projetoId, entregaId, path, nome),
        progresso: setEtapa,
      });
      if (resultado.erro) setErro(resultado.erro);
      if (resultado.sucesso) { setSucesso(resultado.sucesso); form.reset(); }
      router.refresh();
    } catch {
      setErro("Não foi possível concluir o envio. Verifique a conexão e consulte o histórico antes de tentar novamente.");
    } finally { trava.current = false; setEnviando(false); setEtapa(""); }
  }
  return (
    <form onSubmit={enviar} aria-busy={enviando} className="mt-4 text-[#172033]">
      <fieldset disabled={enviando}>
        <label className="block text-sm font-medium">Arquivo PDF ou DOCX (até 20 MB)
          <input name="arquivo" type="file" required accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            className="mt-2 block w-full rounded-xl border border-[#172033]/15 bg-white p-2.5 text-sm text-[#172033] file:mr-3 file:rounded-lg file:border-0 file:bg-[#6366F1]/10 file:px-3 file:py-2 file:text-[#6366F1]" />
        </label>
        <button type="submit" className="mt-3 rounded-xl bg-[#6366F1] px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60" disabled={enviando}>
          {enviando ? "Enviando..." : "Enviar arquivo"}
        </button>
      </fieldset>
      {etapa && <p role="status" className="mt-3 text-sm text-[#172033]/70">{etapa}</p>}
      {erro && <p role="alert" className="mt-3 text-sm text-red-600">{erro}</p>}
      {sucesso && <p role="status" className="mt-3 text-sm text-green-700">{sucesso}</p>}
    </form>
  );
}
