import { createContext } from "react";

import { DictionaryData, LangConfigData } from "./types";

export const Dictionary = createContext<DictionaryData>({
  entries: null,
  refresh: () => {
    throw new Error("No dictionary context provided");
  },
});

export const LangConfig = createContext<LangConfigData | null>(null);
