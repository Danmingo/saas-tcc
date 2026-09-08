"use client";

import { useActionState, useState } from "react";
import { camposContextoAcademico, normalizarPalavrasChave, type ContextoAcademicoProjeto } from "@/lib/contexto-academico";
import { atualizarContextoAcademicoProjetoAluno, type ContextoAcademicoFormState } from "./actions";

type ProjetoContexto = ContextoAcademicoProjeto & { id: string };
const grandesAreas = ["Ciências da Saúde", "Ciências Exatas e da Terra", "Engenharias", "Ciências Humanas", "Ciências Sociais Aplicadas", "Ciências Biológicas", "Ciências Agrárias", "Linguística, Letras e Artes", "Multidisciplinar", "Outra"];
const tiposTrabalho = ["TCC", "Artigo científico", "Monografia", "Projeto", "Outro"];
const inputClass = "mt-1.5 w-full rounded-xl border border-[#172033]/15 bg-white px-3.5 py-2.5 text-sm text-[#172033] outline-none placeholder:text-[#172033]/35 focus:border-[#6366F1] focus:ring-2 focus:ring-[#6366F1]/25 disabled:opacity-60";

function EditorContexto({ projeto, onCancelar, onSalvo }: {
  projeto: ProjetoContexto;
  onCancelar: () => void;
  onSalvo: () => void;
}) {
  const [valores, setValores] = useState({
    grande_area: projeto.grande_area ?? "", curso: projeto.curso ?? "",
    subarea: projeto.subarea ?? "", linha_pesquisa: projeto.linha_pesquisa ?? "",
    tipo_trabalho: projeto.tipo_trabalho ?? "", palavras_chave: projeto.palavras_chave.join(", "),
  });
  const [estado, formAction, enviando] = useActionState(async (anterior: ContextoAcademicoFormState, dados: FormData) => {
    const resultado = await atualizarContextoAcademicoProjetoAluno(projeto.id, anterior, dados);
    if (resultado.sucesso) onSalvo();
    return resultado;
  }, {});
  const prefixo = `contexto-${projeto.id}`;
  const quantidade = normalizarPalavrasChave(valores.palavras_chave).length;

  return (
    <form action={formAction} aria-busy={enviando} className="mt-6">
      <fieldset disabled={enviando} className="grid gap-5 sm:grid-cols-2">
        <legend className="mb-4 text-base font-semibold text-[#172033]">Editar contexto acadêmico</legend>
        {camposContextoAcademico.map(({ nome, label, obrigatorio }) => (
          <div key={nome}>
            <label htmlFor={`${prefixo}-${nome}`} className="block text-sm font-medium text-[#172033]">{label} <span className="font-normal text-[#172033]/60">({obrigatorio ? "obrigatório" : "opcional"})</span></label>
            <input id={`${prefixo}-${nome}`} name={nome} required={obrigatorio}
              list={nome === "grande_area" || nome === "tipo_trabalho" ? `${prefixo}-${nome}-sugestoes` : undefined}
              aria-describedby={nome === "grande_area" || nome === "tipo_trabalho" ? `${prefixo}-sugestoes-ajuda` : undefined}
              value={valores[nome]} onChange={(event) => setValores({ ...valores, [nome]: event.target.value })} className={inputClass} />
          </div>
        ))}
        <datalist id={`${prefixo}-grande_area-sugestoes`}>{grandesAreas.map((area) => <option key={area} value={area} />)}</datalist>
        <datalist id={`${prefixo}-tipo_trabalho-sugestoes`}>{tiposTrabalho.map((tipo) => <option key={tipo} value={tipo} />)}</datalist>
        <p id={`${prefixo}-sugestoes-ajuda`} className="text-sm text-[#172033]/60 sm:col-span-2">Grande área e tipo de trabalho aceitam as sugestões ou outro texto de sua escolha.</p>
        <div className="sm:col-span-2">
          <label htmlFor={`${prefixo}-palavras_chave`} className="block text-sm font-medium text-[#172033]">Palavras-chave <span className="font-normal text-[#172033]/60">(opcional)</span></label>
          <input id={`${prefixo}-palavras_chave`} name="palavras_chave" value={valores.palavras_chave}
            onChange={(event) => setValores({ ...valores, palavras_chave: event.target.value })}
            aria-describedby={`${prefixo}-palavras-ajuda`} aria-invalid={quantidade > 12}
            placeholder="hipertensão, adesão, atenção farmacêutica" className={inputClass} />
          <p id={`${prefixo}-palavras-ajuda`} aria-live="polite" className={`mt-2 text-sm ${quantidade > 12 ? "text-red-600" : "text-[#172033]/60"}`}>
            Separe por vírgulas. {quantidade}/12 palavras-chave.{quantidade > 12 && " Remova palavras-chave para continuar."}
          </p>
        </div>
      </fieldset>
      {estado.erro && <p role="alert" className="mt-5 text-sm leading-6 text-red-600">{estado.erro}</p>}
      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <button type="submit" disabled={enviando || quantidade > 12} className="rounded-xl bg-[#6366F1] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#4F52D9] disabled:opacity-60">{enviando ? "Salvando..." : "Salvar contexto acadêmico"}</button>
        <button type="button" disabled={enviando} onClick={onCancelar} className="rounded-xl border border-[#172033]/15 px-5 py-2.5 text-sm font-semibold text-[#172033] hover:bg-[#F5F7FA] disabled:opacity-60">Cancelar</button>
      </div>
    </form>
  );
}

export default function ContextoAcademicoForm({ projeto }: { projeto: ProjetoContexto }) {
  const [editando, setEditando] = useState(false);
  const [salvo, setSalvo] = useState(false);
  return (
    <>
      {salvo && <p role="status" className="mt-4 text-sm text-[#15803D]">Contexto acadêmico atualizado com sucesso.</p>}
      {editando ? <EditorContexto projeto={projeto} onCancelar={() => setEditando(false)} onSalvo={() => { setEditando(false); setSalvo(true); }} /> : (
        <button type="button" onClick={() => { setSalvo(false); setEditando(true); }} className="mt-6 rounded-xl bg-[#6366F1] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#4F52D9]">Editar contexto acadêmico</button>
      )}
    </>
  );
}
