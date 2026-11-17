import { PropsWithChildren, useCallback, useEffect, useRef, useState } from "react";

import { ApiData } from "../apiTypes";
import { Dictionary, LangConfig, useSite } from "../site/context";
import { showError } from "../site/toast";
import { FullEntry, LangConfigData } from "../site/types";

export function DataProvider({ children }: PropsWithChildren) {
  const [entries, setEntries] = useState<FullEntry[] | null>(null);
  const [config, setConfig] = useState<LangConfigData | null>(null);
  const etag = useRef(localStorage.getItem("etag") ?? "undefined");
  const { api, transformConfig, transformDictionary } = useSite();

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
          showError(new Error(`Failed to sync: ${err.name}: ${err.message}`));
        } else {
          throw err;
        }
      }
    } catch (err) {
      showError(err);
    }
  }, [api, transformConfig, transformDictionary]);

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

  return <Dictionary value={{ entries, refresh }}>
    <LangConfig value={config}>{children}</LangConfig>
  </Dictionary>;
}
