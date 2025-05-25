export type WeightedChoices = readonly (readonly [string, number])[];
export type Weighted = string | readonly string[] | WeightedChoices;
export type WeightedGroups = Readonly<Record<string, Weighted>>;

function equalChoiceRandom(s: string | readonly string[]): string {
  return s[Math.floor(s.length * Math.random())];
}

export function arrayIsEqualWeight(w: Weighted): w is readonly string[] {
  return w.length === 0 || typeof w[0] === "string";
}

function weightedRandom(choices: Weighted): string {
  if (typeof choices === "string" || arrayIsEqualWeight(choices)) {
    return equalChoiceRandom(choices);
  }

  let i;
  const weights = [choices[0][1]];

  for (i = 1; i < choices.length; i++) {
    weights[i] = choices[i][1] + weights[i - 1];
  }

  const random = Math.random() * weights[weights.length - 1];

  for (i = 0; i < weights.length; i++) {
    if (weights[i] > random) {
      break;
    }
  }

  return choices[i][0];
}

export interface GenerationConfig {
  structure: readonly string[];
  parts: WeightedGroups;
  groups: WeightedGroups;
}

function resolve(w: Weighted, g: WeightedGroups): string {
  const choice = weightedRandom(w);
  return choice.startsWith("\\")
    ? choice.substring(1)
    : [...choice].map((c) => (g[c] === undefined ? c : resolve(g[c], g))).join("");
}

export class GenerationInstance {
  readonly #config: GenerationConfig;

  constructor(config: GenerationConfig) {
    this.#config = config;
  }

  // TODO: special syllables at boundaries?

  #makeSyllable(): string {
    return this.#config.structure.map((part) => resolve(this.#config.parts[part], this.#config.groups)).join("");
  }

  public generateWord(syllables = 1): string {
    let word = "";
    for (let i = 0; i < syllables; i++) {
      word += this.#makeSyllable();
    }

    return word;
  }
}
