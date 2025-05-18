import { Context, ReactNode, useContext, useState } from "react";

import { Dictionary, DictionaryData } from "./dictionary";
import { Lang, LangData } from "./langConfig";
import { Title } from "./title";

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
  const [title, setTitle] = useState<string | null>(null);

  return <Lang.Provider value={langValue}>
    <Dictionary.Provider value={dictionaryValue}>
      <Title.Provider value={{ title, setTitle }}>{children}</Title.Provider>
    </Dictionary.Provider>
  </Lang.Provider>;
}
