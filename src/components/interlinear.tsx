import { ReactNode, useContext } from "react";
import { Link } from "react-router-dom";

import { useLanguageTag } from "../providers/api";
import { useConfig } from "../providers/data";
import { uri } from "../util";

export interface InterlinearData {
  sol: string;
  solSep: string;
  engSep: string;
  eng: string;
}

const ABBR_SEP = /([-.() ])/;
const WORD_SEP = /([\u201c\u201d() -])/;

export function Abbr({ children }: { children: string }): ReactNode {
  const config = useConfig();
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

interface ILWord {
  value: string;
  text: string;
  index: number;
  bold: boolean;
}
const splitIntoWords = (s: string): ILWord[] =>
  s.split(WORD_SEP).map((i, j) => ({ value: i, text: i.replaceAll("_", " "), index: j, bold: false }));
const elem = (w: ILWord): ReactNode => (w.bold ? <b key={w.index}>{w.text}</b> : w.text);
const links = (w: ILWord): ReactNode =>
  WORD_SEP.test(w.value) ? (
    elem(w)
  ) : (
    <Link key={w.index} to={uri`/reverse/${w.text}`}>
      {elem(w)}
    </Link>
  );

const highlightAsterisk = (w: ILWord[]): ILWord[] =>
  w.map((i) => (i.text.startsWith("*") ? { ...i, text: i.text.slice(1), bold: true } : i));

// TODO: css

export function InterlinearGloss({
  data,
  asterisk = false,
  link = false,
  indent = false,
  script = false,
  extra,
}: {
  data: InterlinearData;
  asterisk?: boolean;
  link?: boolean;
  indent?: boolean;
  script?: boolean;
  extra?: ReactNode;
}) {
  const config = useConfig();
  const tag = useLanguageTag();

  const solParts = data.solSep.split(" ");
  const engParts = data.engSep.split(" ");
  const numParts = Math.max(solParts.length, engParts.length);
  const parts = [];

  let solWords = splitIntoWords(data.sol);
  let engWords = splitIntoWords(data.eng);
  if (asterisk) {
    solWords = highlightAsterisk(solWords);
    engWords = highlightAsterisk(engWords);
  }
  const sol = solWords.map(link ? links : elem);
  const eng = engWords.map(elem);
  const solClean = data.sol.replaceAll("*", "");

  for (let i = 0; i < numParts; i++) {
    const eSol = solParts[i];
    const eEng = engParts[i];

    parts.push(
      <div className="box" key={i}>
        {eSol && <p className="original">{eSol}</p>}
        {eEng && <p>
          <Abbr>{eEng}</Abbr>
        </p>}
      </div>,
    );
  }

  const body = <>
    {...parts}
    <p className="bottom">{config ? config.ipa(solClean) : "/.../"}</p>
    <p className="bottom">{eng}</p>
  </>;

  return <div className="interlinear">
    <p className="original">
      {sol}
      {extra}
    </p>
    {script && <p className="original fit-width" lang={tag}>
      {config ? config.script(solClean) : "<...>"}
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
