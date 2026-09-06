"use client";

import { createContext, useContext, type ReactNode } from "react";

const PrimeiroNomeContext = createContext("");

export function ProfessorGreetingProvider({
  primeiroNome,
  children,
}: {
  primeiroNome: string;
  children: ReactNode;
}) {
  return (
    <PrimeiroNomeContext.Provider value={primeiroNome}>
      {children}
    </PrimeiroNomeContext.Provider>
  );
}

export default function ProfessorGreeting() {
  const primeiroNome = useContext(PrimeiroNomeContext);

  return (
    <p className="text-sm font-medium text-[#6366F1]">
      {`Olá, Professor${primeiroNome ? ` ${primeiroNome}` : ""} 😊`}
    </p>
  );
}
