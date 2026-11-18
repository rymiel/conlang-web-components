import { IconName, Intent } from "@blueprintjs/core";
import { FC, ReactElement, ReactNode } from "react";
import { Params, RouteObject } from "react-router-dom";

import { ApiClient } from "../api";
import { ApiConfig, ApiData, ApiMeaning, ApiSection, ApiWord } from "../apiTypes";
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

export interface LangData {
  readonly entries: readonly FullEntry[];
  readonly config: LangConfigData;
  readonly refresh: () => Promise<void>;
}

export interface LangConfigData extends LangConfigFields {
  config: ApiConfig;
  soundChange: SoundChangeInstance;
  generation: GenerationInstance;
  abbreviations: KeyValue;
  parts: KeyValue;
  docs: string;
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
  readonly lookup: (query: string) => ReverseResult;
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
  readonly label: string;
  readonly value: string;
  readonly link?: string;
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

export type MenuLink = readonly [slug: string, name: string];

export interface RouteHandle {
  readonly title: string | ((params: Params) => string | undefined);
}

export interface SiteDefinition {
  readonly language: string;
  readonly tag: string;
  readonly api: ApiClient;
  readonly languageConfig: (config: ApiConfig) => LanguageConfig;
  readonly deriveFields: (lang: LangConfigData, word: ApiWord) => DerivedFields;
  readonly menuLinks: readonly MenuLink[];
  readonly privateMenuLinks: readonly MenuLink[];
  readonly routes?: readonly RouteObject[];
  readonly statsSections: readonly FC[];
  readonly generatedFields?: (entry: FullEntry) => readonly GeneratedField[];
  readonly extraEditFields?: readonly EditField[];
  readonly entryStatus?: (entry: FullEntry) => readonly EntryStatus[];
  readonly EntryContent?: FC<{ entry: FullEntry }>;
  readonly draftClass?: (sol: string, extra: string) => string | null;
  readonly useNewWordExtra?: (sol: string, extra: string) => NewWordExtra;
  readonly useReverseLookup?: (entries: readonly FullEntry[]) => ReverseLookup;
  readonly validationValue?: (word: string) => string;
  readonly useValidationCandidates?: () => readonly ValidationCandidate[];
  readonly validateLocal?: (candidates: readonly ValidationCandidate[]) => ValidationFailure[];
}

export interface Site extends Required<Omit<SiteDefinition, "languageConfig" | "deriveFields">> {
  readonly transformConfig: (config: ApiConfig) => LangConfigData;
  readonly transformDictionary: (lang: LangConfigData, data: ApiData) => FullEntry[];
}
