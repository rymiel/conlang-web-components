import { createContext, PropsWithChildren, useContext, useEffect, useState } from "react";

import { ApiClient } from "../api";

export const ApiVersion = createContext<string | null>(null);
export const Api = createContext<ApiClient | null>(null);

export function ApiProvider({ children, api }: PropsWithChildren<{ api: ApiClient }>) {
  const [version, setVersion] = useState<string | null>(null);
  useEffect(() => {
    api
      .version()
      .then((text) => setVersion(text))
      .catch((err) => console.error(err));
  }, []);

  return <Api.Provider value={api}>
    <ApiVersion.Provider value={version}>{children}</ApiVersion.Provider>
  </Api.Provider>;
}

export function useApi(): ApiClient {
  const api = useContext(Api);
  if (api === null) {
    throw new Error("No API initialized");
  }
  return api;
}
