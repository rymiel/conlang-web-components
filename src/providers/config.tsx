import { ApiConfig } from "../apiTypes";

export type KeyValue = {
  readonly [K in string]?: string;
};
export interface LangConfig {
  config: ApiConfig;
  ipa: (sentence: string) => string;
  script: (sentence: string) => string;
  abbreviations: KeyValue;
  parts: KeyValue;
}
