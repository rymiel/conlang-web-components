import { createContext, PropsWithChildren, useContext, useEffect, useState } from "react";

import { ApiClient } from "../api";
import { ErrorHandler } from "./shared";

export const ApiVersion = createContext<string | null>(null);

interface ApiData {
  client: ApiClient;
  error: ErrorHandler;
}
const Api = createContext<ApiData | null>(null);

export function ApiProvider({ children, api, error }: PropsWithChildren<{ api: ApiClient; error: ErrorHandler }>) {
  const [version, setVersion] = useState<string | null>(null);
  useEffect(() => {
    api
      .version()
      .then((text) => setVersion(text))
      .catch((err) => error(err));
  }, []);

  return <Api.Provider value={{ client: api, error }}>
    <ApiVersion.Provider value={version}>{children}</ApiVersion.Provider>
  </Api.Provider>;
}

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
