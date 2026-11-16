import { WordSelect } from "./wordSelect";

function normalizeEng(eng: string): string {
  if (eng.startsWith("to ")) {
    eng = eng.slice("to ".length);
  }
  eng = eng.replaceAll(" ", "_");
  return eng;
}

type Setter<T> = React.Dispatch<React.SetStateAction<T>>;

// TODO: support prefixes?

export default function GlossSelect({
  active,
  setSource,
  setGloss,
}: {
  active?: string;
  setSource: Setter<string>;
  setGloss: Setter<string>;
}) {
  return <WordSelect
    onSelect={(t) => {
      const suffix = t.sol.startsWith("-");
      const separator = suffix ? "" : " ";
      const append = (a: string, b: string) => `${a.trimEnd()}${separator}${b}`.trimStart();

      let src = t.sol.replaceAll(" ", "_");
      let eng = t.gloss ?? normalizeEng(t.meanings[0]?.eng ?? "?");
      if (suffix) eng = `-${eng}`;
      if (t.hash === active) src = `*${src}`;

      setSource((c) => append(c, src));
      setGloss((c) => append(c, eng));
    }}
  />;
}
