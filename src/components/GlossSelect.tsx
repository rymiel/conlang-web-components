import { WordSelect } from "./wordSelect";

function normalizeEng(eng: string): string {
  if (eng.startsWith("to ")) {
    eng = eng.slice("to ".length);
  }
  eng = eng.replaceAll(" ", "_");
  return eng;
}

type Setter<T> = React.Dispatch<React.SetStateAction<T>>;

// TODO: rename params (with InterlinearData)
// TODO: support prefixes?
export default function GlossSelect({
  setSol,
  setSolSep,
  setEngSep,
}: {
  setSol: Setter<string>;
  setSolSep: Setter<string>;
  setEngSep: Setter<string>;
}) {
  return <WordSelect
    onSelect={(t) => {
      const suffix = t.sol.startsWith("-");
      const separator = suffix ? "" : " ";
      const append = (a: string, b: string) => `${a.trimEnd()}${separator}${b}`.trimStart();

      const clean = suffix ? t.sol.slice(1) : t.sol;
      const hyphenated = t.sol.replaceAll(" ", "_");
      let eng = t.gloss ?? normalizeEng(t.meanings[0]?.eng ?? "?");
      if (suffix) eng = `-${eng}`;

      setSol((c) => append(c, clean));
      setSolSep((c) => append(c, hyphenated));
      setEngSep((c) => append(c, eng));
    }}
  />;
}
