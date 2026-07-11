import { ReactNode, useContext } from "react";
import { Link } from "react-router-dom";

import { useLanguageTag } from "../providers/api";
import { useConfig } from "../providers/data";
import { uri } from "../util";
import { User } from "../providers/user";
import { Icon } from "@blueprintjs/core";

/** @deprecated */
export interface OldInterlinearData {
  sol: string;
  solSep: string;
  engSep: string;
  eng: string;
}

export type InterlinearLines = readonly [source: string, gloss: string, translation: string];

export type AnyInterlinear = OldInterlinearData | InterlinearLines | string;

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

export function disambiguiateInterlinear(input: AnyInterlinear): OldInterlinearData | InterlinearLines {
  if (typeof input === "string") {
    if (input.startsWith("{")) {
      return JSON.parse(input) as OldInterlinearData;
    } else {
      const lines = input.split("\n", 3);
      if (lines.length === 3) {
        return lines as unknown as InterlinearLines;
      } else {
        throw new Error(`Interlinear data does not have 3 lines: ${lines.toString()}`);
      }
    }
  } else {
    return input;
  }
}

export function coalesceInterlinearData(input: AnyInterlinear): Readonly<{
  srcParts: string[];
  engParts: string[];
  srcWords: ILWord[];
  engWords: ILWord[];
  srcText: string;
  engText: string;
  deprecated: boolean;
}> {
  const data = disambiguiateInterlinear(input);

  // https://github.com/microsoft/TypeScript/issues/53395
  if ("eng" in data) {
    const srcParts = data.solSep.split(" ");
    const engParts = data.engSep.split(" ");
    const srcWords = highlightAsterisk(splitIntoWords(data.sol));
    const engWords = highlightAsterisk(splitIntoWords(data.eng));
    const srcText = data.sol.replaceAll("*", "");
    const engText = data.eng.replaceAll("*", "");

    return { srcParts, engParts, srcWords, engWords, srcText, engText, deprecated: true } as const;
  } else {
    const [source, gloss, translation] = data;

    const srcParts = source.replaceAll("*", "").replaceAll("=", "-").split(" ");
    const engParts = gloss.split(" ");
    const srcWords = highlightAsterisk(splitIntoWords(source.replaceAll("-", "").replaceAll("=", "-")));
    const engWords = highlightAsterisk(splitIntoWords(translation));
    const srcText = source.replaceAll("-", "").replaceAll("=", "-").replaceAll("*", "").replaceAll("_", " ");
    const engText = translation.replaceAll("*", "");

    return { srcParts, engParts, srcWords, engWords, srcText, engText, deprecated: false } as const;
  }
}

// TODO: css

export function InterlinearGloss(props: {
  data: InterlinearLines | string;
  link?: boolean;
  indent?: boolean;
  script?: boolean;
  extra?: ReactNode;
}): JSX.Element;
/** @deprecated */
export function InterlinearGloss(props: {
  data: OldInterlinearData;
  asterisk?: boolean;
  link?: boolean;
  indent?: boolean;
  script?: boolean;
  extra?: ReactNode;
}): JSX.Element;
export function InterlinearGloss({
  data,
  link = false,
  indent = false,
  script = false,
  extra,
}: {
  data: AnyInterlinear;
  /** @deprecated */ asterisk?: boolean;
  link?: boolean;
  indent?: boolean;
  script?: boolean;
  extra?: ReactNode;
}) {
  const config = useConfig();
  const tag = useLanguageTag();
  // TODO: temporary
  const { user } = useContext(User);

  const { srcParts, srcWords, srcText, engParts, engWords, deprecated } = coalesceInterlinearData(data);

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
      {user && deprecated && <Icon intent="danger" icon="warning-sign" size={20} />}
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
