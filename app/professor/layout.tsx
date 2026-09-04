import type { ReactNode } from "react";
import ProfessorSidebar from "./components/ProfessorSidebar";

type ProfessorLayoutProps = {
  children: ReactNode;
};

export default function ProfessorLayout({
  children,
}: ProfessorLayoutProps) {
  return (
    <div className="min-h-screen bg-[#F5F7FA] lg:flex">
      <ProfessorSidebar />

      <div className="min-w-0 flex-1">
        {children}
      </div>
    </div>
  );
}