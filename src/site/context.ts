import { createContext, useContext } from "react";

import { DictionaryData, LangConfigData, Site } from "./types";

export const Dictionary = createContext<DictionaryData>({
  entries: null,
  refresh: () => {
    throw new Error("No dictionary context provided");
  },
});

export const LangConfig = createContext<LangConfigData | null>(null);

export const SiteContext = createContext<Site | null>(null);

export function useSite(): Site {
  const site = useContext(SiteContext);
  if (site === null) {
    throw new Error("No site context provided");
  }
  return site;
}
