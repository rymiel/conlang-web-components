import { Context, ReactNode, useContext } from "react";

import { SharedDictionary, SharedDictionaryData } from "./dictionary";
import { SharedLangConfig, SharedLangConfigData } from "./langConfig";

export function SharedProvider<Dictionary extends SharedDictionaryData, LangConfig extends SharedLangConfigData>({
  children,
  dictionary,
  langConfig,
}: {
  children: ReactNode;
  dictionary: Context<Dictionary>;
  langConfig: Context<LangConfig>;
}) {
  const dictionaryValue = useContext(dictionary);
  const langConfigValue = useContext(langConfig);

  return <SharedLangConfig.Provider value={langConfigValue}>
    <SharedDictionary.Provider value={dictionaryValue}>{children}</SharedDictionary.Provider>
  </SharedLangConfig.Provider>;
}
