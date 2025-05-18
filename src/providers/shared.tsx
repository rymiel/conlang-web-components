import { Context, ReactNode, useContext } from "react";

import { Dictionary, DictionaryData } from "./dictionary";
import { Lang, LangData } from "./langConfig";

export function ConlangProvider<D extends DictionaryData, L extends LangData>({
  children,
  dictionary,
  lang,
}: {
  children: ReactNode;
  dictionary: Context<D>;
  lang: Context<L>;
}) {
  const dictionaryValue = useContext(dictionary);
  const langValue = useContext(lang);

  return <Lang.Provider value={langValue}>
    <Dictionary.Provider value={dictionaryValue}>{children}</Dictionary.Provider>
  </Lang.Provider>;
}
