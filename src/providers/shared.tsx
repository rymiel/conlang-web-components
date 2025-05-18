import { Context, ReactNode, useContext } from "react";

import { Dictionary, DictionaryData } from "./dictionary";
import { Lang, LangData } from "./langConfig";

export function SharedProvider<D extends DictionaryData, L extends LangData>({
  children,
  dictionary,
  langConfig,
}: {
  children: ReactNode;
  dictionary: Context<D>;
  langConfig: Context<L>;
}) {
  const dictionaryValue = useContext(dictionary);
  const langConfigValue = useContext(langConfig);

  return <Lang.Provider value={langConfigValue}>
    <Dictionary.Provider value={dictionaryValue}>{children}</Dictionary.Provider>
  </Lang.Provider>;
}
