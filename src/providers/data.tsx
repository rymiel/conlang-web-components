import { PropsWithChildren, useCallback, useContext, useEffect, useRef, useState } from "react";

import { ApiConfig, ApiData } from "../apiTypes";
import { Dictionary, LangConfig } from "../site/context";
import { DictionaryData, FullEntry, LangConfigData } from "../site/types";
import { useApi, useErrorHandler } from "./api";

export interface DataProviderProps {
  transformConfig: (data: ApiConfig) => LangConfigData;
  transformDictionary: (config: LangConfigData, data: ApiData) => FullEntry[];
}

export function DataProvider({ children, transformConfig, transformDictionary }: PropsWithChildren<DataProviderProps>) {
  const [entries, setEntries] = useState<FullEntry[] | null>(null);
  const [config, setConfig] = useState<LangConfigData | null>(null);
  const etag = useRef(localStorage.getItem("etag") ?? "undefined");
  const api = useApi();
  const error = useErrorHandler();

  const refresh = useCallback(async () => {
    try {
      const data = await api.lang<ApiData>("/data");
      const config = transformConfig(data.config ?? {});
      const entries = transformDictionary(config, data);
      setEntries(entries);
      setConfig(config);

      try {
        const newEtag = data.etag ?? "undefined";
        if (newEtag != etag.current) {
          console.log(`Broadcasting new data etag: ${etag.current} -> ${newEtag}`);
          etag.current = newEtag;
          localStorage.setItem("etag", newEtag);
        }
      } catch (err) {
        if (err instanceof DOMException) {
          error(new Error(`Failed to sync: ${err.name}: ${err.message}`));
        } else {
          throw err;
        }
      }
    } catch (err) {
      error(err);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    const handle = (e: StorageEvent) => {
      if (e.key === "etag" && e.newValue !== etag.current) {
        console.log(`Synced new data etag: ${etag.current} -> ${e.newValue}`);
        refresh();
      }
    };
    addEventListener("storage", handle);
    return () => removeEventListener("storage", handle);
  }, [refresh]);

  return <Dictionary.Provider value={{ entries, refresh }}>
    <LangConfig.Provider value={config}>{children}</LangConfig.Provider>
  </Dictionary.Provider>;
}

export function useDictionary(): DictionaryData {
  return useContext(Dictionary);
}

export function useConfig(): LangConfigData | null {
  return useContext(LangConfig);
}
