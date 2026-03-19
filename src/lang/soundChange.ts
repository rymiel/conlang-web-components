import { KeyValue } from "../providers/config";
import { gsub, GSubMap } from "../util";
import { sentenceConvert } from "./word";

export type Flags = {
  readonly [K in string]?: boolean;
};
export type IPATransform = (word: string, flags: Flags) => string;
export type Change = readonly [from: string, to: string, leftContext: string | null, rightContext: string | null];
export interface SoundChangeConfig {
  readonly groups: KeyValue;
  readonly changes: readonly Change[];
}
export const DEFAULT_SOUND_CHANGE: SoundChangeConfig = { groups: {}, changes: [] };

export interface SoundChangeSteps {
  readonly steps: readonly string[];
  readonly indices: readonly number[];
}

function changeToRegex(change: Change, groups: GSubMap): readonly [RegExp, string] {
  const [from, to, left, right] = change;

  let k = from;
  if (left !== null) {
    k = `(?<=${left})${k}`;
  }
  if (right !== null) {
    k = `${k}(?=${right})`;
  }

  return [new RegExp(gsub(k, groups), "g"), to];
}

function recursiveResolve(groups: GSubMap, depth = 20): GSubMap {
  let changed = false;
  while (depth-- > 0) {
    groups = groups.map(([k, v]) => {
      const n = gsub(v, groups);
      if (n !== v) changed = true;
      return [k, n] as const;
    });
    if (!changed) return groups;
    changed = false;
  }
  throw new Error("Sound change groups are too deeply recursive");
}

export class SoundChangeInstance {
  readonly #config: SoundChangeConfig;
  readonly #changes: GSubMap;
  readonly #initialize: IPATransform;
  readonly #finalize: IPATransform;

  constructor(config: SoundChangeConfig, initialize: IPATransform, finalize: IPATransform) {
    this.#config = config;
    this.#initialize = initialize;
    this.#finalize = finalize;
    const groups = recursiveResolve(Object.entries(config.groups).map(([k, v]) => [`{${k}}`, v ?? ""] as const));
    this.#changes = config.changes.map((c) => changeToRegex(c, groups));
    console.log(this.#changes, groups);
  }

  public ipaWithoutSoundChange(word: string, flags: Flags = {}) {
    return this.#initialize(word, flags);
  }

  private singleWordSoundChange(word: string, flags: Flags = {}): string {
    word = this.#initialize(word, flags);
    word = gsub(word, this.#changes);
    word = this.#finalize(word, flags);
    return word;
  }

  public soundChangeStepsIndexed(word: string, flags: Flags = {}): SoundChangeSteps {
    const steps: string[][] = [];
    const indices: number[] = [];
    let words = word.split(" ").map((i) => this.#initialize(i, flags));

    let last = words;
    steps.push(words);

    for (const [i, [find, replace]] of this.#changes.entries()) {
      words = words.map((i) => i.replaceAll(find, replace));
      if (words.join(" ") !== last.join(" ")) {
        steps.push(words);
        indices.push(i);
      }
      last = words;
    }

    if (words.join(" ") !== last.join(" ")) {
      steps.push(words);
    }

    return {
      steps: steps.map((w) => `[${w.map(i => this.#finalize(i, flags)).join(" ")}]`),
      indices,
    };
  }

  public soundChange(word: string, flags: Flags = {}): string {
    const words = word.split(" ").map((i) => this.singleWordSoundChange(i, flags));

    return `[${words.join(" ")}]`;
  }

  public soundChangeSentence(sentence: string, flags: Flags = {}): string {
    const convertWord = (word: string) => this.singleWordSoundChange(word, flags);
    return "[" + sentenceConvert(sentence, convertWord) + "]";
  }

  public get config(): SoundChangeConfig {
    return this.#config;
  }

  public copyWithChanges(changes: readonly Change[]) {
    return new SoundChangeInstance({ ...this.#config, changes }, this.#initialize, this.#finalize);
  }
}
