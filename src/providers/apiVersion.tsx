import { createContext, PropsWithChildren, useEffect, useState } from "react";

import { ApiClient } from "../api";

export const ApiVersion = createContext<string | null>(null);

export function ApiVersionProvider({ children, api }: PropsWithChildren<{ api: ApiClient }>) {
  const [version, setVersion] = useState<string | null>(null);
  useEffect(() => {
    api
      .version()
      .then((text) => setVersion(text))
      .catch((err) => console.error(err));
  }, []);

  return <ApiVersion.Provider value={version}>{children}</ApiVersion.Provider>;
}
