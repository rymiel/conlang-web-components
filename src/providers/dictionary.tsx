import { createContext } from "react";

interface Meaning {
  eng: string;
}

export interface Entry {
  hash: string;
  sol: string;
  link: string;
  extra: string;
  meanings: Meaning[];
}

export interface DictionaryData {
  entries: Entry[] | null;
}

export const Dictionary = createContext<DictionaryData>({
  entries: null,
});
