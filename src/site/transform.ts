import { ApiConfig, ApiData, ApiWord } from "../apiTypes";
import { DEFAULT_DOCS } from "../lang/docs";
import { DEFAULT_GENERATION, GenerationInstance } from "../lang/generation";
import { configOrEmpty, DEFAULT_KEY_VALUE } from "../providers/config";
import { entrySort, prefixSplit } from "../providers/dictionary";
import { uri } from "../util";
import { DerivedFields, FullEntry, LangConfigData, LanguageConfig } from "./types";

type ApiDictionary = Pick<ApiData, "words" | "meanings" | "sections">;

export function createTransformConfig(
  languageConfig: (config: ApiConfig) => LanguageConfig,
): (config: ApiConfig) => LangConfigData {
  return (config) => {
    const generation = new GenerationInstance(configOrEmpty(config.generation, DEFAULT_GENERATION));
    const abbreviations = configOrEmpty(config.abbr, DEFAULT_KEY_VALUE);
    const parts = configOrEmpty(config.parts, DEFAULT_KEY_VALUE);
    const docs = configOrEmpty(config.docs, DEFAULT_DOCS).content;
    const lang = languageConfig(config);
    const ipa = (sentence: string) => lang.soundChange.soundChangeSentence(sentence);

    return { ...lang, generation, abbreviations, parts, docs, ipa, config };
  };
}

export function createTransformDictionary(
  deriveFields: (lang: LangConfigData, word: ApiWord) => DerivedFields,
): (lang: LangConfigData, d: ApiDictionary) => FullEntry[] {
  return (lang, d) => {
    const mMeanings = d.meanings.map((meaning) => {
      const [prefix, eng] = prefixSplit(meaning.eng);
      const sections = meaning.sections.map((s) => d.sections.find((j) => j.hash === s)!);
      return { ...meaning, eng, prefix, sections };
    });
    const mWords = d.words
      .map((word) => {
        const sections = word.sections.map((s) => d.sections.find((j) => j.hash === s)!);
        const meanings = word.meanings.map((s) => mMeanings.find((j) => j.hash === s)!);
        return { ...word, ...deriveFields(lang, word), sections, meanings };
      })
      .sort(entrySort);
    return mWords.map((word, idx) => {
      const matching = mWords.filter((j) => j.sol === word.sol);
      const link = matching.length === 1 ? uri`/w/${word.sol}` : uri`/w/${word.sol}/${matching.indexOf(word) + 1}`;
      return { ...word, link, index: idx + 1 };
    });
  };
}
