"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import LogoutButton from "@/app/components/LogoutButton";

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
    <aside className="w-full shrink-0 bg-[#1E3A5F] px-4 py-4 text-white lg:min-h-screen lg:w-64 lg:px-6 lg:py-6">
      <div className="-mx-2 flex h-12 items-center">
        <Image
          src="/thesistrack-logos/logo_horizontal_negative.png"
          alt="ThesisTrack"
          width={1162}
          height={188}
          sizes="224px"
          className="h-auto w-56 max-w-full"
        />
      </div>

      <nav className="mt-5 lg:mt-10">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-white/50">
          Área do professor
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
