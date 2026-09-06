import type { ReactNode } from "react";
import { Manrope, Inter } from "next/font/google";

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

export default function TurmasLayout({ children }: { children: ReactNode }) {
  return (
    <div className={`${manrope.variable} ${inter.variable} font-[family-name:var(--font-inter)]`}>
      {children}
    </div>
  );
}
