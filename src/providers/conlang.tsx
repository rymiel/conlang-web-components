import { PropsWithChildren, useState } from "react";

import { ApiClient } from "../api";
import { ApiProvider } from "./api";
import { DataProvider, DataProviderProps } from "./data";
import { Title } from "./title";
import { UserProvider } from "./user";

export type ErrorHandler = (error: unknown) => void;
export type SuccessHandler = (message: string) => void;

interface ConlangProviderProps extends PropsWithChildren<DataProviderProps> {
  api: ApiClient;
  error: ErrorHandler;
  success: SuccessHandler;
  tag: string;
  language: string;
}

export function ConlangProvider({
  children,
  api,
  error,
  success,
  tag,
  language,
  transformConfig,
  transformDictionary,
}: ConlangProviderProps) {
  const [title, setTitle] = useState<string | null>(null);

  return <ApiProvider client={api} error={error} success={success} tag={tag} language={language}>
    <UserProvider>
      <DataProvider transformConfig={transformConfig} transformDictionary={transformDictionary}>
        <Title.Provider value={{ title, setTitle }}>{children}</Title.Provider>
      </DataProvider>
    </UserProvider>
  </ApiProvider>;
}
