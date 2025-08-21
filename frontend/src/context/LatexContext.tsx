// context/LatexContext.tsx
"use client";

import { createContext, useContext, useState, ReactNode } from "react";

interface LatexContextType {
  latex: string;
  setLatex: (latex: string) => void;
}

const LatexContext = createContext<LatexContextType | undefined>(undefined);

export function LatexProvider({ children }: { children: ReactNode }) {
  const [latex, setLatex] = useState<string>(""); // default empty string

  return (
    <LatexContext.Provider value={{ latex, setLatex }}>
      {children}
    </LatexContext.Provider>
  );
}

export function useLatex() {
  const ctx = useContext(LatexContext);
  if (!ctx) throw new Error("useLatex must be used inside LatexProvider");
  return ctx;
}
