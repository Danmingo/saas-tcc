"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import LogoutButton from "@/app/components/LogoutButton";

const menuItems = [
  { nome: "Início", href: "/aluno/inicio" },
  { nome: "Dashboard", href: "/aluno/dashboard" },
  { nome: "Meu projeto", href: "/aluno/meu-projeto" },
  { nome: "Tarefas", href: "/aluno/tarefas" },
  { nome: "Tess", href: "/aluno/tess" },
  { nome: "Versões", href: "/aluno/versoes" },
  { nome: "Devolutivas", href: "/aluno/devolutivas" },
  { nome: "Notificações", href: "/aluno/notificacoes" },
];

export default function AlunoSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-full shrink-0 bg-[#1E3A5F] px-4 py-4 text-white lg:min-h-screen lg:w-64 lg:px-6 lg:py-6">
      <div className="flex items-center gap-3">
        <TrackMark />

        <span className="text-lg font-bold">
          ThesisTrack
        </span>
      </div>

      <nav className="mt-5 lg:mt-10">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-white/50">
          Área do aluno
        </p>

        <ul className="flex gap-2 overflow-x-auto pb-1 lg:flex-col lg:space-y-2 lg:overflow-visible lg:pb-0">
          {menuItems.map((item) => {
            const estaAtivo = pathname === item.href;

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`block whitespace-nowrap rounded-lg px-3 py-2.5 text-sm transition-colors lg:px-4 lg:py-3 ${
                    estaAtivo
                      ? "bg-[#6366F1] text-white"
                      : "text-white/70 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  {item.nome}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      <LogoutButton />
    </aside>
  );
}

function TrackMark() {
  return (
    <svg
      width="32"
      height="32"
      viewBox="0 0 28 28"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <rect
        width="28"
        height="28"
        rx="7"
        fill="#6366F1"
      />

      <path
        d="M8 9H20M14 9V19"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
      />

      <circle
        cx="20"
        cy="19"
        r="2"
        fill="#22C55E"
      />
    </svg>
  );
}
