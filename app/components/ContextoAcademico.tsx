import { camposContextoAcademico, type ContextoAcademicoProjeto } from "@/lib/contexto-academico";

export default function ContextoAcademico({ contexto }: { contexto: ContextoAcademicoProjeto }) {
  const vazio = camposContextoAcademico.every(({ nome }) => !contexto[nome]) && !contexto.palavras_chave.length;

  if (vazio) return <p className="mt-3 text-sm text-[#172033]/60">Contexto acadêmico ainda não informado.</p>;

  return (
    <dl className="mt-4 grid gap-5 sm:grid-cols-2">
      {camposContextoAcademico.map(({ nome, label }) => (
        <div key={nome}>
          <dt className="text-sm text-[#172033]/60">{label}</dt>
          <dd className="mt-1 break-words text-sm text-[#172033]">{contexto[nome] || "Não informado"}</dd>
        </div>
      ))}
      <div className="sm:col-span-2">
        <dt className="text-sm text-[#172033]/60">Palavras-chave</dt>
        <dd className="mt-1 break-words text-sm text-[#172033]">{contexto.palavras_chave.join(", ") || "Nenhuma palavra-chave informada"}</dd>
      </div>
    </dl>
  );
}
