import type { ReactNode } from "react";
import AlunoSidebar from "./components/AlunoSidebar";

type AlunoLayoutProps = {
  children: ReactNode;
};

export default function AlunoLayout({
  children,
}: AlunoLayoutProps) {
  return (
    <div className="min-h-screen bg-[#F5F7FA] lg:flex">
      <AlunoSidebar />

      <div className="min-w-0 flex-1">
        <div className="mx-auto w-full max-w-7xl">
        {children}
        </div>
      </div>
    </div>
  );
}
