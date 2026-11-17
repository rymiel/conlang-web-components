import { createContext, use, useContext } from "react";

import { FullEntry, LangConfigData, LangData, Site } from "./types";

export interface LoadedData {
  readonly entries: readonly FullEntry[];
  readonly config: LangConfigData;
}

interface DataContextValue {
  readonly data: Promise<LoadedData>;
  readonly refresh: () => Promise<void>;
}

export const DataContext = createContext<DataContextValue | null>(null);

export function useData(): LangData {
  const context = useContext(DataContext);
  if (context === null) {
    throw new Error("No data context provided");
  }
  return { ...use(context.data), refresh: context.refresh };
}

export const SiteContext = createContext<Site | null>(null);

export function useSite(): Site {
  const site = useContext(SiteContext);
  if (site === null) {
    throw new Error("No site context provided");
  }
  return site;
}
