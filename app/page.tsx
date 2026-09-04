"use client";

import { useState, type FormEventHandler } from "react";
import { Manrope, Inter } from "next/font/google";
import { useRouter } from "next/navigation";

const manrope = Manrope({
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  variable: "--font-manrope",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-inter",
});

type Role = "professor" | "aluno";

const JOURNEY_STAGES: { label: string; done: boolean }[] = [
  { label: "Introdução", done: true },
  { label: "Metodologia", done: true },
  { label: "Resultados", done: false },
  { label: "Defesa", done: false },
];

export default function LoginPage() {
  const router = useRouter();
  const [role, setRole] = useState<Role>("professor");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [manterConectado, setManterConectado] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [mostrarSenha, setMostrarSenha] = useState(false);

async function handleSubmit(e: FormEvent<HTMLFormElement>) {
  e.preventDefault();
  setSubmitting(true);

  await new Promise((resolve) => setTimeout(resolve, 700));

  if (role === "professor") {
    router.push("/professor/inicio");
    return;
  }

  router.push("/aluno/inicio");
}

  return (
    <div
      className={`${manrope.variable} ${inter.variable} min-h-screen w-full font-[var(--font-inter)] text-[#172033] lg:flex`}
    >
      {/* Painel de marca */}
      <div className="relative flex flex-col justify-between overflow-hidden bg-[#172033] px-8 py-10 text-white lg:w-[42%] lg:px-14 lg:py-16">
        <div>
          <div className="flex items-center gap-2.5">
            <TrackMark />
            <span className="font-[var(--font-manrope)] text-xl font-bold tracking-tight">
             
            </span>
          </div>

          <p className="mt-10 max-w-xs font-[var(--font-manrope)] text-2xl font-semibold leading-snug lg:mt-16 lg:text-[28px]">
            Acompanhe cada TCC do início à aprovação.
          </p>
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-white/70">
            Menos tempo organizando arquivos e cobranças. Mais clareza para
            orientar, revisar e acompanhar a evolução.
          </p>
        </div>

        {/* Trilha acadêmica — elemento central da identidade visual */}
        <div className="mt-16 hidden lg:block">
          <ol className="relative flex flex-col gap-7 pl-1">
            {JOURNEY_STAGES.map((stage, i) => (
              <li key={stage.label} className="flex items-center gap-4">
                <span className="relative flex h-3 w-3 shrink-0 items-center justify-center">
                  {i !== JOURNEY_STAGES.length - 1 && (
                    <span
                      className={`absolute top-3 left-1/2 h-7 w-px -translate-x-1/2 ${
                        stage.done ? "bg-[#22C55E]/50" : "bg-white/15"
                      }`}
                    />
                  )}
                  <span
                    className={`h-3 w-3 rounded-full border-2 ${
                      stage.done
                        ? "border-[#22C55E] bg-[#22C55E]"
                        : "border-white/30 bg-transparent"
                    }`}
                  />
                </span>
                <span
                  className={`text-sm ${
                    stage.done ? "text-white/90" : "text-white/45"
                  }`}
                >
                  {stage.label}
                </span>
              </li>
            ))}
          </ol>
        </div>

        <p className="mt-10 text-xs text-white/40 lg:mt-0">
          Feito para orientadores e instituições de ensino.
        </p>
      </div>

      {/* Painel de acesso */}
      <div className="flex flex-1 items-center justify-center bg-[#F5F7FA] px-6 py-12 lg:px-16">
        <form onSubmit={handleSubmit} className="w-full max-w-[400px]">
          <h1 className="font-[var(--font-manrope)] text-[26px] font-bold text-[#172033]">
            Entrar
          </h1>
          <p className="mt-1.5 text-sm text-[#172033]/60">
            Acesse seus TCCs, tarefas e feedbacks.
          </p>

          {/* Alternância de papel */}
          <div className="mt-7 inline-flex rounded-lg border border-[#172033]/10 bg-white p-1">
            {(["professor", "aluno"] as Role[]).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRole(r)}
                aria-pressed={role === r}
                className={`rounded-md px-4 py-1.5 text-sm font-medium transition-colors ${
                  role === r
                    ? "bg-[#6366F1] text-white"
                    : "text-[#172033]/55 hover:text-[#172033]"
                }`}
              >
                {r === "professor" ? "Professor" : "Aluno"}
              </button>
            ))}
          </div>

          <div className="mt-7 flex flex-col gap-5">
            <label className="block">
              <span className="text-sm font-medium text-[#172033]">
                E-mail institucional
              </span>
              <input
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nome@instituicao.edu.br"
                className="mt-1.5 w-full rounded-lg border border-[#172033]/15 bg-white px-3.5 py-2.5 text-sm text-[#172033] placeholder:text-[#172033]/35 outline-none transition-shadow focus:border-[#6366F1] focus:ring-2 focus:ring-[#6366F1]/25"
              />
            </label>

            <label className="block">
              <span className="text-sm font-medium text-[#172033]">
                Senha
              </span>
              <input
                type={mostrarSenha ? "text" : "password"}
                required
                autoComplete="current-password"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                placeholder="••••••••"
                className="mt-1.5 w-full rounded-lg border border-[#172033]/15 bg-white px-3.5 py-2.5 text-sm text-[#172033] placeholder:text-[#172033]/35 outline-none transition-shadow focus:border-[#6366F1] focus:ring-2 focus:ring-[#6366F1]/25"
              />
              <button
                type="button"
                onClick={() => setMostrarSenha((prev) => !prev)}
                className="ml-2 text-sm font-medium text-[#6366F1] hover:underline">
                {mostrarSenha ? "Ocultar" : "Ver"}
              </button>
            </label>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 text-[#172033]/70">
                <input
                  type="checkbox"
                  checked={manterConectado}
                  onChange={(e) => setManterConectado(e.target.checked)}
                  className="h-4 w-4 rounded border-[#172033]/25 text-[#6366F1] focus:ring-[#6366F1]/25"
                />
                Manter conectado
              </label>
              <a
                href="/recuperar-senha"
                className="font-medium text-[#6366F1] hover:underline"
              >
                Esqueci minha senha
              </a>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="mt-1 w-full rounded-lg bg-[#6366F1] py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#4f52d9] disabled:opacity-60"
            >
              {submitting ? "Entrando..." : "Entrar"}
            </button>
          </div>

          <p className="mt-7 text-center text-sm text-[#172033]/55">
            {role === "professor"
              ? "Ainda não tem acesso? Fale com sua coordenação."
              : "Seu acesso é criado quando o professor te convida para o projeto."}
          </p>
        </form>
      </div>
    </div>
  );
}

/** Símbolo reduzido da marca: documento + letra T + trilha de progresso */
function TrackMark() {
  return (
    <svg
      width="28"
      height="28"
      viewBox="0 0 28 28"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <rect width="28" height="28" rx="7" fill="#6366F1" />
      <path
        d="M8 9H20M14 9V19"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <circle cx="20" cy="19" r="2" fill="#22C55E" />
    </svg>
  );

}