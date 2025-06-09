import { Context, createContext, PropsWithChildren, useCallback, useContext, useEffect, useRef, useState } from "react";

import { ApiConfig, ApiData } from "../apiTypes";
import { useApi, useErrorHandler } from "./api";
import { LangConfig } from "./config";
import { DictionaryData, Entry } from "./dictionary";

interface DataSetupProps {
  dictionary: () => DictionaryData;
  config: () => LangConfig | null;
}

const DataSetup = createContext<DataSetupProps | null>(null);

// TODO: use dictionary data directly instead of entry?
export interface DataProviderProps<C extends LangConfig, E extends Entry> {
  config: Context<C | null>;
  dictionary: Context<DictionaryData<E>>;
  transformConfig: (data: ApiConfig) => C;
  transformDictionary: (config: C, data: ApiData) => E[];
}

export function DataProvider<C extends LangConfig, E extends Entry>({
  children,
  dictionary: dictionaryCtx,
  config: configCtx,
  transformConfig,
  transformDictionary,
}: PropsWithChildren<DataProviderProps<C, E>>) {
  const [entries, setEntries] = useState<E[] | null>(null);
  const [config, setConfig] = useState<C | null>(null);
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

  return <dictionaryCtx.Provider value={{ entries, refresh }}>
    <configCtx.Provider value={config}>
      <DataSetup.Provider
        value={{
          dictionary: () => useContext(dictionaryCtx),
          config: () => useContext(configCtx),
        }}
      >
        {children}
      </DataSetup.Provider>
    </configCtx.Provider>
  </dictionaryCtx.Provider>;
}

export function useDictionary(): DictionaryData {
  const setup = useContext(DataSetup);
  if (setup === null) {
    throw new Error("No DataSetup");
  }
  return setup.dictionary();
}

export function useConfig(): LangConfig | null {
  const setup = useContext(DataSetup);
  if (setup === null) {
    throw new Error("No DataSetup");
  }
  return setup.config();
}
