import { ReactNode, useContext } from "react";
import { Link } from "react-router-dom";

import { Lang } from "../providers/langConfig";
import { uri } from "../util";

export interface InterlinearData {
  sol: string;
  solSep: string;
  engSep: string;
  eng: string;
}

const ABBREVIATIONS: Record<string, string> = {
  "1SG": "first person singular",
  "2SG": "second person singular",
  "3SG": "third person singular",
  "1PL": "first person plural",
  "2PL": "second person plural",
  "3PL": "third person plural",
  "1": "first person",
  "2": "second person",
  "3": "third person",
  SG: "singular",
  PL: "plural",

  PST: "past",
  PRS: "present",

  NOM: "nominative",
  ACC: "accusative",
  GEN: "genitive",
  DIR: "direct",
  OBL: "oblique",
  VOC: "vocative",

  IMP: "imperative",
  INF: "infinitive",
  GER: "gerund",

  NEG: "negative",
  ADV: "adverb",
  COP: "copula",
  POSS: "possessive",

  TAG: "tag question",
  Q: "polar question",

  M: "masculine",
  F: "feminine",
  N: "neuter",

  ECHO: "echo (marks that the subject of the sentence hasn't changed)",
  NAME: "onomatonym (naming word)",
};
const ABBR_SEP = /([-.() ])/;
const WORD_SEP = /([\u201c\u201d() -])/;

export function Abbr({ children }: { children: string }): ReactNode {
  const parts = children.split(ABBR_SEP);

  return parts.map((i, j) => {
    const abbr = ABBREVIATIONS[i] as string | undefined;
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
  const lang = useContext(Lang);
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
    <p className="bottom">{lang ? lang.ipa(solClean) : "/.../"}</p>
    <p className="bottom">{eng}</p>
  </>;

  return <div className="interlinear">
    <p className="original">
      {sol}
      {extra}
    </p>
    {script && <p className="original sol fit-width">{lang ? lang.script(solClean) : "<...>"}</p>}
    {indent ? (
      <dl>
        <dd>{body}</dd>
      </dl>
    ) : (
      body
    )}
  </div>;
}
