import { ApiConfig } from "../apiTypes";
import { SoundChangeInstance } from "../lang/soundChange";

export type KeyValue = {
  readonly [K in string]?: string;
};

export const DEFAULT_KEY_VALUE: KeyValue = {};

export interface LangConfig {
  config: ApiConfig;
  ipa: (sentence: string) => string;
  script: (sentence: string) => string;
  abbreviations: KeyValue;
  parts: KeyValue;
  soundChange: SoundChangeInstance;
}

export function configOrEmpty<T extends object>(config: unknown, def: T): T {
  return { ...def, ...((config ?? {}) as Partial<T>) };
}
