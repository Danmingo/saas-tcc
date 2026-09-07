"use client";

import Link from "next/link";
import { useActionState, useEffect, useState } from "react";
import type { AlunoProjeto, ProjetoDetalhes, TurmaProjeto } from "@/lib/projetos";
import { atualizarProjeto, criarProjeto } from "./actions";
import { STATUS_PROJETO, type ProjetoFormState } from "./form-config";

type Props = {
  turmas: TurmaProjeto[];
  projeto?: ProjetoDetalhes;
  alunosIniciais?: AlunoProjeto[];
};
const inputClass = "mt-1.5 w-full rounded-xl border border-[#172033]/15 bg-white px-3.5 py-2.5 text-sm text-[#172033] outline-none focus:border-[#6366F1] focus:ring-2 focus:ring-[#6366F1]/25 disabled:opacity-60";

export default function ProjetoForm({ turmas, projeto, alunosIniciais = [] }: Props) {
  const [turmaId, setTurmaId] = useState(projeto?.turma_id ?? "");
  const [selecionados, setSelecionados] = useState(projeto?.integrantes.map((aluno) => aluno.id) ?? []);
  const [campos, setCampos] = useState({
    status: projeto?.status ?? "rascunho", data_inicio: projeto?.data_inicio ?? "", prazo_final: projeto?.prazo_final ?? "",
  });
  const [consulta, setConsulta] = useState({
    turmaId: projeto?.turma_id ?? "", alunos: alunosIniciais, erro: "",
  });
  const acao = projeto ? atualizarProjeto.bind(null, projeto.id) : criarProjeto;
  const [estado, formAction, enviando] = useActionState<ProjetoFormState, FormData>(acao, {});
  const carregandoAlunos = Boolean(turmaId) && consulta.turmaId !== turmaId;
  const alunos = consulta.turmaId === turmaId ? consulta.alunos : [];
  const erroAlunos = consulta.turmaId === turmaId ? consulta.erro : "";

  useEffect(() => {
    if (!turmaId || consulta.turmaId === turmaId) return;
    const controller = new AbortController();
    async function carregar() {
      try {
        const response = await fetch("/professor/projetos/alunos?turma_id=" + encodeURIComponent(turmaId), {
          signal: controller.signal, cache: "no-store",
        });
        if (response.redirected) throw new Error("Sua sessão precisa ser validada novamente. Recarregue a página.");
        const body = await response.json();
        if (!response.ok) throw new Error(body.erro || "Não foi possível carregar os alunos.");
        if (!controller.signal.aborted) setConsulta({ turmaId, alunos: body.alunos, erro: "" });
      } catch (error) {
        if (!controller.signal.aborted) setConsulta({
          turmaId, alunos: [],
          erro: error instanceof Error ? error.message : "Não foi possível carregar os alunos.",
        });
      }
    }
    void carregar();
    return () => controller.abort();
  }, [turmaId, consulta.turmaId]);

  function selecionar(id: string, marcado: boolean) {
    setSelecionados((atuais) => marcado ? [...atuais, id] : atuais.filter((alunoId) => alunoId !== id));
  }

  const foraDaTurma = !carregandoAlunos && !erroAlunos
    ? (projeto?.integrantes ?? []).filter((aluno) => selecionados.includes(aluno.id) && !alunos.some((item) => item.id === aluno.id))
    : [];

  return (
    <form action={formAction} aria-busy={enviando} className="mt-8 max-w-3xl rounded-xl border border-[#172033]/10 bg-white p-4 shadow-sm sm:rounded-2xl sm:p-6">
      <fieldset disabled={enviando || Boolean(estado.projetoPendenteId)} className="space-y-5">
        <legend className="sr-only">Dados do projeto</legend>
        <div>
          <label htmlFor="turma_id" className="block text-sm font-medium">Turma</label>
          {projeto ? (
            <>
              <input type="hidden" name="turma_id" value={projeto.turma_id} />
              <input type="hidden" name="versao" value={projeto.atualizado_em ?? ""} />
              <p id="turma_id" className="mt-1.5 rounded-xl bg-[#F5F7FA] px-3.5 py-2.5 text-sm">{projeto.turma.nome}</p>
            </>
          ) : (
            <select id="turma_id" name="turma_id" required value={turmaId} className={inputClass}
              onChange={(event) => { setTurmaId(event.target.value); setSelecionados([]); }}>
              <option value="">Selecione uma turma</option>
              {turmas.map((turma) => <option key={turma.id} value={turma.id}>{turma.nome}</option>)}
            </select>
          )}
        </div>

        {projeto && (
          <div>
            <label htmlFor="status" className="block text-sm font-medium">Status</label>
            <select id="status" name="status" value={campos.status} className={inputClass}
              onChange={(event) => setCampos({ ...campos, status: event.target.value })}>
              {STATUS_PROJETO.map((status) => <option key={status.valor} value={status.valor}>{status.label}</option>)}
            </select>
          </div>
        )}

        <div className="grid gap-5 sm:grid-cols-2">
          {(["data_inicio", "prazo_final"] as const).map((nome) => (
            <div key={nome}>
              <label htmlFor={nome} className="block text-sm font-medium">
                {nome === "data_inicio" ? "Data de início" : "Prazo final"} <span className="font-normal text-[#172033]/50">(opcional)</span>
              </label>
              <input id={nome} name={nome} type="date" value={campos[nome]}
                onChange={(event) => setCampos({ ...campos, [nome]: event.target.value })} className={inputClass} />
            </div>
          ))}
        </div>

        <fieldset className="rounded-xl border border-[#172033]/10 p-4">
          <legend className="px-1 text-sm font-semibold">Integrantes</legend>
          <p className="mb-3 text-sm text-[#172033]/60">Selecione um ou mais alunos da turma para um projeto individual, em dupla ou em grupo.</p>
          {!turmaId && <p className="text-sm text-[#172033]/60">Selecione uma turma para consultar os alunos.</p>}
          {carregandoAlunos && <p role="status" className="text-sm text-[#6366F1]">Carregando alunos...</p>}
          {erroAlunos && (
            <div role="alert" className="text-sm text-red-600">
              <p>{erroAlunos}</p>
              <button type="button" className="mt-2 font-semibold underline"
                onClick={() => setConsulta({ turmaId: "", alunos: [], erro: "" })}>Tentar novamente</button>
            </div>
          )}
          {turmaId && !carregandoAlunos && !erroAlunos && !alunos.length && (
            <p className="text-sm text-[#172033]/60">Esta turma ainda não tem alunos disponíveis. Eles precisam entrar na turma por código antes do cadastro do projeto.</p>
          )}
          <div className="space-y-3">
            {alunos.map((aluno) => (
              <label key={aluno.id} className="flex items-center gap-3 text-sm">
                <input type="checkbox" name="aluno_id" value={aluno.id} checked={selecionados.includes(aluno.id)}
                  onChange={(event) => selecionar(aluno.id, event.target.checked)} className="h-4 w-4 accent-[#6366F1]" />
                {aluno.nome || "Aluno sem nome cadastrado"}
              </label>
            ))}
            {foraDaTurma.map((aluno) => (
              <label key={aluno.id} className="flex items-center gap-3 text-sm text-red-600">
                <input type="checkbox" name="aluno_id" value={aluno.id} checked
                  onChange={() => selecionar(aluno.id, false)} className="h-4 w-4 accent-[#6366F1]" />
                {aluno.nome || "Integrante"} — não está mais nesta turma; desmarque para continuar.
              </label>
            ))}
          </div>
        </fieldset>
      </fieldset>

      {estado.erro && <p role="alert" className="mt-5 text-sm leading-6 text-red-600">{estado.erro}</p>}
      {estado.projetoPendenteId && (
        <Link href={"/professor/projetos/" + encodeURIComponent(estado.projetoPendenteId)}
          className="mt-3 inline-block text-sm font-semibold text-[#6366F1] underline">Abrir projeto para revisar</Link>
      )}
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <button type="submit" disabled={enviando || carregandoAlunos || Boolean(erroAlunos) || !selecionados.length || !turmaId || Boolean(estado.projetoPendenteId)}
          className="rounded-xl bg-[#6366F1] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#4F52D9] disabled:opacity-60">
          {enviando ? "Salvando..." : projeto ? "Salvar alterações" : "Criar projeto"}
        </button>
        <Link href={projeto ? "/professor/projetos/" + encodeURIComponent(projeto.id) : "/professor/projetos"}
          className="rounded-xl border border-[#172033]/15 px-5 py-2.5 text-center text-sm font-semibold hover:bg-[#F5F7FA]">Cancelar</Link>
      </div>
    </form>
  );
}
