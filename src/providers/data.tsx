import { PropsWithChildren, startTransition, useCallback, useEffect, useState } from "react";

import { ApiData } from "../apiTypes";
import { DataContext, LoadedData, useSite } from "../site/context";
import { showError } from "../site/toast";
import { Site } from "../site/types";

type Loader = Pick<Site, "api" | "transformConfig" | "transformDictionary">;

function broadcastEtag(newEtag: string) {
  try {
    const oldEtag = localStorage.getItem("etag") ?? "undefined";
    if (newEtag != oldEtag) {
      console.log(`Broadcasting new data etag: ${oldEtag} -> ${newEtag}`);
      localStorage.setItem("etag", newEtag);
    }
  } catch (err) {
    if (err instanceof DOMException) {
      showError(new Error(`Failed to sync: ${err.name}: ${err.message}`));
    } else {
      throw err;
    }
  }
}

async function loadData({ api, transformConfig, transformDictionary }: Loader): Promise<LoadedData> {
  const data = await api.lang<ApiData>("/data");
  const config = transformConfig(data.config ?? {});
  const entries = transformDictionary(config, data);
  broadcastEtag(data.etag ?? "undefined");
  return { entries, config };
}

export function DataProvider({ children }: PropsWithChildren) {
  const { api, transformConfig, transformDictionary } = useSite();
  const [data, setData] = useState(() => loadData({ api, transformConfig, transformDictionary }));

  const refresh = useCallback(async () => {
    const next = loadData({ api, transformConfig, transformDictionary });
    try {
      await next;
    } catch (err) {
      showError(err);
      return;
    }
    startTransition(() => setData(next));
  }, [api, transformConfig, transformDictionary]);

  useEffect(() => {
    const handle = (e: StorageEvent) => {
      if (e.key === "etag") {
        console.log(`Synced new data etag: ${e.oldValue} -> ${e.newValue}`);
        refresh();
      }
    };
    addEventListener("storage", handle);
    return () => removeEventListener("storage", handle);
  }, [refresh]);

  return <DataContext value={{ data, refresh }}>{children}</DataContext>;
}
