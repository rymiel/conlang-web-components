import { createContext } from "react";

export interface SharedLangConfigData {
  ipa: (sentence: string) => string;
  script: (sentence: string) => string;
}

export const SharedLangConfig = createContext<SharedLangConfigData>({
  ipa: () => {
    throw new Error("No SharedLangConfig context provided");
  },
  script: () => {
    throw new Error("No SharedLangConfig context provided");
  },
});

