"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const menuItems = [
  {
    nome: "Início",
    href: "/professor/inicio",
  },
  {
    nome: "Dashboard",
    href: "/professor/dashboard",
  },
  {
    nome: "Turmas",
    href: "/professor/turmas",
  },
  {
    nome: "Projetos",
    href: "/professor/projetos",
  },
  {
    nome: "Entregas",
    href: "/professor/entregas",
  },
  {
    nome: "Devolutivas",
    href: "/professor/devolutivas",
  },
  {
    nome: "Notificações",
    href: "/professor/notificacoes",
  },
];

export default function ProfessorSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-full bg-[#1E3A5F] px-6 py-6 text-white lg:min-h-screen lg:w-64">
      <div className="flex items-center gap-3">
        <TrackMark />

        <span className="text-lg font-bold">
          ThesisTrack
        </span>
      </div>

      <nav className="mt-10">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-white/50">
          Área do professor
        </p>

        <ul className="space-y-2">
          {menuItems.map((item) => {
            const estaAtivo = pathname === item.href;

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`block rounded-lg px-4 py-3 text-sm transition-colors ${
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