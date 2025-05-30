import { Context, ReactNode, useContext, useState } from "react";

import { ApiClient } from "../api";
import { ApiProvider } from "./api";
import { Dictionary, DictionaryData } from "./dictionary";
import { Lang, LangData } from "./langConfig";
import { Title } from "./title";
import { UserProvider } from "./user";

export type ErrorHandler = (error: unknown) => void;

export function ConlangProvider<D extends DictionaryData, L extends LangData>({
  children,
  dictionary,
  lang,
  api,
  error,
  tag,
}: {
  children: ReactNode;
  dictionary: Context<D>;
  lang: Context<L | null>;
  api: ApiClient;
  error: ErrorHandler;
  tag: string;
}) {
  const dictionaryValue = useContext(dictionary);
  const langValue = useContext(lang);
  const [title, setTitle] = useState<string | null>(null);

  return <ApiProvider client={api} error={error} tag={tag}>
    <UserProvider>
      <Lang.Provider value={langValue}>
        <Dictionary.Provider value={dictionaryValue}>
          <Title.Provider value={{ title, setTitle }}>{children}</Title.Provider>
        </Dictionary.Provider>
      </Lang.Provider>
    </UserProvider>
  </ApiProvider>;
}
