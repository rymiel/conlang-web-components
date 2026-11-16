import { ReactNode, useContext } from "react";
import { Link } from "react-router-dom";

import { LangConfig, useSite } from "../site/context";
import { uri } from "../util";

export type InterlinearLines = readonly [source: string, gloss: string, translation: string];

const ABBR_SEP = /([-.()<> ])/;
const WORD_SEP = /([\u201c\u201d() \-,?!.])/;

export function Abbr({ children }: { children: string }): ReactNode {
  const config = useContext(LangConfig);
  const parts = children.split(ABBR_SEP);

  return parts.map((i, j) => {
    const abbr = config?.abbreviations[i];
    if (abbr === undefined) {
      return i;
    } else {
      return <abbr key={j} title={abbr} className="il">
        {i}
      </abbr>;
    }
  });
}

export interface ILWord {
  value: string;
  text: string;
  index: number;
  bold: boolean;
  ws: boolean;
}
const splitIntoWords = (s: string): ILWord[] =>
  s
    .split(WORD_SEP)
    .map((i, j) => ({ value: i, text: i.replaceAll("_", " "), index: j, bold: false, ws: WORD_SEP.test(i) }));
const elem = (w: ILWord): ReactNode => (w.bold ? <b key={w.index}>{w.text}</b> : w.text);
const links = (w: ILWord): ReactNode =>
  w.ws ? (
    elem(w)
  ) : (
    <Link key={w.index} to={uri`/reverse/${w.text}`}>
      {elem(w)}
    </Link>
  );

const highlightAsterisk = (w: ILWord[]): ILWord[] =>
  w.map((i) => (i.text.startsWith("*") ? { ...i, text: i.text.slice(1), bold: true } : i));

export function parseInterlinear(input: string): InterlinearLines {
  const lines = input.split("\n", 3);
  if (lines.length === 3) {
    return lines as unknown as InterlinearLines;
  } else {
    throw new Error(`Interlinear data does not have 3 lines: ${lines.toString()}`);
  }
}

export function coalesceInterlinearData(lines: InterlinearLines): Readonly<{
  srcParts: string[];
  engParts: string[];
  srcWords: ILWord[];
  engWords: ILWord[];
  srcText: string;
  engText: string;
}> {
  const [source, gloss, translation] = lines;
  const textSource = source.replaceAll("-", "").replaceAll("=", "-").replaceAll("<", "").replaceAll(">", "");

  const srcParts = source.replaceAll("*", "").replaceAll("=", "-").split(" ");
  const engParts = gloss.split(" ");
  const srcWords = highlightAsterisk(splitIntoWords(textSource));
  const engWords = highlightAsterisk(splitIntoWords(translation));
  const srcText = textSource.replaceAll("*", "").replaceAll("_", " ");
  const engText = translation.replaceAll("*", "");

  return { srcParts, engParts, srcWords, engWords, srcText, engText } as const;
}

// TODO: css

export function InterlinearGloss({
  data,
  link = false,
  indent = false,
  script = false,
  extra,
}: {
  data: InterlinearLines;
  link?: boolean;
  indent?: boolean;
  script?: boolean;
  extra?: ReactNode;
}) {
  const config = useContext(LangConfig);
  const { tag } = useSite();

  const { srcParts, srcWords, srcText, engParts, engWords } = coalesceInterlinearData(data);

  const numParts = Math.max(srcParts.length, engParts.length);
  const parts = [];

  const src = srcWords.map(link ? links : elem);
  const eng = engWords.map(elem);

  for (let i = 0; i < numParts; i++) {
    const eSrc = srcParts[i];
    const eEng = engParts[i];

    parts.push(
      <div className="box" key={i}>
        {eSrc && <p className="original">{eSrc}</p>}
        {eEng && <p>
          <Abbr>{eEng}</Abbr>
        </p>}
      </div>,
    );
  }

  const body = <>
    {...parts}
    <p className="bottom">{config ? config.ipa(srcText) : "/.../"}</p>
    <p className="bottom">{eng}</p>
  </>;

  return <div className="interlinear">
    <p className="original">
      {src}
      {extra}
    </p>
    {script && <p className="original fit-width" lang={tag}>
      {config ? config.script(srcText) : "<...>"}
    </p>}
    {indent ? (
      <dl>
        <dd>{body}</dd>
      </dl>
    ) : (
      body
    )}
  </div>;
}
