import { IconName, Intent } from "@blueprintjs/core";
import { ReactElement, ReactNode } from "react";

import { ApiConfig, ApiMeaning, ApiSection, ApiWord } from "../apiTypes";
import { GenerationInstance } from "../lang/generation";
import { SoundChangeInstance } from "../lang/soundChange";
import { KeyValue } from "../providers/config";

export interface OptionalEntryFields {
  /** Phonemic IPA transcription (broad) / ... / */
  phon?: string;
  script?: string;
  class?: string | null;
}

export interface LangEntryFields extends OptionalEntryFields {}

export interface LangConfigFields {}

export interface FullEntry extends Omit<ApiWord, "meanings" | "sections">, LangEntryFields {
  disp: string;
  /** Phonetic IPA transcription (narrow) [ ... ] */
  ipa: string;
  link: string;
  index: number;

  meanings: FullMeaning[];
  sections: FullSection[];
}

export interface FullMeaning extends Omit<ApiMeaning, "sections"> {
  prefix?: string;
  sections: FullSection[];
}

export interface FullSection extends ApiSection {}

export interface DictionaryData {
  entries: readonly FullEntry[] | null;
  refresh: () => Promise<void>;
}

export interface LangConfigData extends LangConfigFields {
  config: ApiConfig;
  soundChange: SoundChangeInstance;
  generation: GenerationInstance;
  abbreviations: KeyValue;
  parts: KeyValue;
  ipa: (sentence: string) => string;
  script: (sentence: string) => string;
  hasScript: boolean;
}

export type LanguageConfig = Pick<LangConfigData, "soundChange" | "script" | "hasScript"> & LangConfigFields;

export type DerivedFields = Pick<FullEntry, "disp" | "ipa"> & LangEntryFields;

export type GeneratedField = readonly [name: string, value: ReactNode];

export type EditField = readonly [key: "ex", placeholder: string];

export interface ReverseResult {
  readonly items: readonly ReactNode[];
  readonly entries: readonly FullEntry[];
}

export interface ReverseLookup {
  readonly formsCount: string;
  readonly controls?: ReactElement;
  readonly lookup: ((query: string) => ReverseResult) | null;
}

export interface EntryStatus {
  readonly icon: IconName;
  readonly intent: Intent;
  readonly title: string;
  readonly label: string;
  readonly href?: string;
}

export interface NewWordExtra {
  readonly fields?: ReactNode;
  readonly content?: ReactNode;
  readonly data: { readonly ex?: string };
}

export interface ValidationCandidate {
  readonly key: string;
  readonly sol: string;
  readonly label: string;
  readonly entry?: FullEntry;
}

export type ValidationFailure = readonly [candidate: ValidationCandidate, reason: string];

export type SlotValues = Readonly<Record<string, string>>;

export interface SyllableSlot {
  readonly key: string;
  readonly name: string;
  readonly size: number;
  readonly values: readonly string[];
}
