import { Context, ReactNode, useContext, useState } from "react";

import { ApiClient } from "../api";
import { ApiProvider } from "./api";
import { Dictionary, DictionaryData } from "./dictionary";
import { Lang, LangData } from "./langConfig";
import { Title } from "./title";

export type ErrorHandler = (error: unknown) => void;

export function ConlangProvider<D extends DictionaryData, L extends LangData>({
  children,
  dictionary,
  lang,
  api,
  error,
}: {
  children: ReactNode;
  dictionary: Context<D>;
  lang: Context<L | null>;
  api: ApiClient;
  error: ErrorHandler;
}) {
  const dictionaryValue = useContext(dictionary);
  const langValue = useContext(lang);
  const [title, setTitle] = useState<string | null>(null);

  return <ApiProvider api={api} error={error}>
    <Lang.Provider value={langValue}>
      <Dictionary.Provider value={dictionaryValue}>
        <Title.Provider value={{ title, setTitle }}>{children}</Title.Provider>
      </Dictionary.Provider>
    </Lang.Provider>
  </ApiProvider>;
}
