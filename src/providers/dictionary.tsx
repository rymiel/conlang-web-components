import { Context, createContext, ReactNode, useContext } from "react";

interface SharedEntry {
  hash: string;
  sol: string;
  link: string;
}

interface SharedDictionaryData {
  entries: SharedEntry[] | null;
}

export const SharedDictionary = createContext<SharedDictionaryData>({
  entries: null,
});

export function SharedDictionaryProvider<T extends SharedDictionaryData>({
  children,
  sourceContext,
}: {
  children: ReactNode;
  sourceContext: Context<T>;
}) {
  const sourceValue = useContext(sourceContext);

  return <SharedDictionary.Provider value={sourceValue}>{children}</SharedDictionary.Provider>;
}
