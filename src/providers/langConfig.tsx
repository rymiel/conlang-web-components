import { createContext } from "react";

export interface LangData {
  ipa: (sentence: string) => string;
  script: (sentence: string) => string;
}

export const Lang = createContext<LangData>({
  ipa: () => {
    throw new Error("No SharedLangConfig context provided");
  },
  script: () => {
    throw new Error("No SharedLangConfig context provided");
  },
});
