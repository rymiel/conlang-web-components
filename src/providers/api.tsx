import { createContext, PropsWithChildren, useContext, useEffect, useState } from "react";

import { ApiClient } from "../api";
import { ErrorHandler, SuccessHandler } from "./conlang";

export const ApiVersion = createContext<string | null>(null);

interface ApiData {
  client: ApiClient;
  error: ErrorHandler;
  success: SuccessHandler
  tag: string;
  language: string;
}
const Api = createContext<ApiData | null>(null);

export function ApiProvider({ children, client, error, success, tag, language }: PropsWithChildren<ApiData>) {
  const [version, setVersion] = useState<string | null>(null);
  useEffect(() => {
    client
      .version()
      .then((text) => setVersion(text))
      .catch((err) => error(err));
  }, []);

  return <Api.Provider value={{ client, error, success, tag, language }}>
    <ApiVersion.Provider value={version}>{children}</ApiVersion.Provider>
  </Api.Provider>;
}

// TODO: clean all this up
export function useApi(): ApiClient {
  const api = useContext(Api);
  if (api === null) {
    throw new Error("No API initialized");
  }
  return api.client;
}

export function useErrorHandler(): ErrorHandler {
  const api = useContext(Api);
  if (api === null) {
    throw new Error("No API initialized");
  }
  return api.error;
}

export function useSuccessHandler(): SuccessHandler {
  const api = useContext(Api);
  if (api === null) {
    throw new Error("No API initialized");
  }
  return api.success;
}

export function useLanguageTag(): string {
  const api = useContext(Api);
  if (api === null) {
    throw new Error("No API initialized");
  }
  return api.tag;
}

export function useLanguageName(): string {
  const api = useContext(Api);
  if (api === null) {
    throw new Error("No API initialized");
  }
  return api.language;
}
