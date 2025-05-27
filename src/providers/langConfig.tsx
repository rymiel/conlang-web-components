import { createContext } from "react";

export interface LangData {
  ipa: (sentence: string) => string;
  script: (sentence: string) => string;
}

export const Lang = createContext<LangData | null>(null);
