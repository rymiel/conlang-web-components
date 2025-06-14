import { ApiConfig } from "../apiTypes";
import { Abbreviations } from "../components/interlinear";

export interface LangConfig {
  config: ApiConfig;
  ipa: (sentence: string) => string;
  script: (sentence: string) => string;
  abbreviations: Abbreviations;
}
