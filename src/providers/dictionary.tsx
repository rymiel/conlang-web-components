import { createContext } from "react";

interface Entry {
  hash: string;
  sol: string;
  link: string;
}

export interface DictionaryData {
  entries: Entry[] | null;
}

export const Dictionary = createContext<DictionaryData>({
  entries: null,
});
