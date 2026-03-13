export function phraseConvert<T>(phrase: string, convertWord: (word: string) => T): T[] {
  return phrase
    .replaceAll(/\s+/g, " ") // squeeze
    .replace(/^-|-$/, "") // affix hyphen
    .split(/[_ ]/)
    .map(convertWord);
}

export function sentenceConvert(sentence: string, convertWord: (word: string) => string): string {
  return sentence
    .split(/[,.?!]+/g)
    .map((phrase) => phraseConvert(phrase, convertWord).join(" "))
    .join(" | "); // minor prosodic break
}
