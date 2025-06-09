import { PropsWithChildren, useState } from "react";

import { ApiClient } from "../api";
import { ApiProvider } from "./api";
import { LangConfig } from "./config";
import { DataProvider, DataProviderProps } from "./data";
import { Entry } from "./dictionary";
import { Title } from "./title";
import { UserProvider } from "./user";

export type ErrorHandler = (error: unknown) => void;

interface ConlangProviderProps<C extends LangConfig, E extends Entry>
  extends PropsWithChildren<DataProviderProps<C, E>> {
  api: ApiClient;
  error: ErrorHandler;
  tag: string;
}

export function ConlangProvider<C extends LangConfig, E extends Entry>({
  children,
  dictionary,
  config,
  api,
  error,
  tag,
  transformConfig,
  transformDictionary,
}: ConlangProviderProps<C, E>) {
  const [title, setTitle] = useState<string | null>(null);

  return <ApiProvider client={api} error={error} tag={tag}>
    <UserProvider>
      <DataProvider
        dictionary={dictionary}
        config={config}
        transformConfig={transformConfig}
        transformDictionary={transformDictionary}
      >
        <Title.Provider value={{ title, setTitle }}>{children}</Title.Provider>
      </DataProvider>
    </UserProvider>
  </ApiProvider>;
}
