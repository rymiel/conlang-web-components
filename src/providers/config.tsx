import { ApiConfig } from "../apiTypes";

export interface LangConfig {
  config: ApiConfig;
  ipa: (sentence: string) => string;
  script: (sentence: string) => string;
}
