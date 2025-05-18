import { createContext } from "react";

interface SharedEntry {
  hash: string;
  sol: string;
  link: string;
}

export interface SharedDictionaryData {
  entries: SharedEntry[] | null;
}

export const SharedDictionary = createContext<SharedDictionaryData>({
  entries: null,
});
