import { HTMLTable, InputGroup } from "@blueprintjs/core";
import { FC, ReactNode, useCallback, useContext, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import { Meaning } from "../providers/dictionary";
import { LangConfig, useSite } from "../site/context";
import { FullEntry } from "../site/types";
import { AnchorButton } from "./button";
import UserOnly from "./UserOnly";
import { entryHasMatch } from "./wordSelect";

const DICTIONARY_ROW_KEYS = ["index", "eng", "trans", "extra", "ipa"] as const;
export type DictionaryRowValues = {
  readonly [K in (typeof DICTIONARY_ROW_KEYS)[number]]: ReactNode;
};
interface DictionaryRowProps extends DictionaryRowValues {
  entry: FullEntry;
}

export type RowRenderer = (entry: FullEntry) => Partial<DictionaryRowValues>;

export function Meanings({ meanings }: { meanings: Meaning[] }) {
  let toBe = false;
  return meanings.map((m, mi) => {
    let eng = m.eng;
    if (eng.startsWith("to be ")) {
      if (toBe) {
        eng = eng.slice(6);
      } else {
        toBe = true;
      }
    }
    return (mi === 0 ? "" : "; ") + eng;
  });
}

export function ExtraCell({ entry }: { entry: FullEntry }) {
  const config = useContext(LangConfig);
  const name = config?.parts[entry.extra];
  const text = entry.class ? `${entry.extra}-${entry.class}` : entry.extra;

  if (name) {
    return <abbr title={name.replace("%", entry.class ?? "")}>{text}</abbr>;
  } else {
    return <span>{text}</span>;
  }
}

function defaultRowValues(e: FullEntry): DictionaryRowValues {
  return {
    index: <span>{e.index}</span>,
    eng: <span>
      <Meanings meanings={e.meanings} />
    </span>,
    trans: <i>{e.disp}</i>,
    extra: <ExtraCell entry={e} />,
    ipa: <span>{e.ipa}</span>,
  };
}

function DictionaryRow({ entry, index, eng, trans, extra, ipa }: DictionaryRowProps) {
  return <tr>
    <td>
      <Link to={entry.link} className="dictionary-row-link">
        {index}
      </Link>
    </td>
    <td>
      <Link to={entry.link} className="dictionary-row-link">
        {eng}
      </Link>
    </td>
    <td>
      <Link to={entry.link} className="dictionary-row-link">
        {trans}
      </Link>
    </td>
    <td>
      <Link to={entry.link} className="dictionary-row-link">
        {extra}
      </Link>
    </td>
    <td className="dictionary-pronunciation">
      <Link to={entry.link} className="dictionary-row-link">
        {ipa}
      </Link>
    </td>
  </tr>;
}

interface DictionaryListProps {
  entries: readonly FullEntry[];
  row: RowRenderer;
}
export function DictionaryList({ entries, row }: DictionaryListProps) {
  const [search, setSearch] = useState("");
  const { language } = useSite();

  const rows = useMemo(() => {
    return entries.map(
      (e) => [e, <DictionaryRow key={e.hash} entry={e} {...{ ...defaultRowValues(e), ...row(e) }} />] as const,
    );
  }, [entries]);

  const handleSearchContainer = useCallback((ref: HTMLDivElement | null) => {
    if (ref === null) return;
    ref.style.top = document.querySelector("header")?.getBoundingClientRect().height + "px";
  }, []);

  const handleAddButton = useCallback((ref: HTMLDivElement | null) => {
    if (ref === null) return;
    ref.style.bottom = document.querySelector("footer")?.getBoundingClientRect().height + "px";
  }, []);

  return <>
    <div className="dictionary-sticky" ref={handleSearchContainer}>
      <InputGroup type="search" placeholder="Search" onValueChange={setSearch} value={search} size="large" />
    </div>

    <HTMLTable className="dictionary-table" compact striped interactive>
      <thead>
        <tr>
          <th>#</th>
          <th>English</th>
          <th>{language}</th>
          <th>Extra</th>
          <th className="dictionary-pronunciation">Pronunciation</th>
        </tr>
      </thead>
      <tbody>{rows.map(([e, r]) => (entryHasMatch(search, e) ? r : undefined))}</tbody>
    </HTMLTable>

    <UserOnly>
      <div className="dictionary-sticky" ref={handleAddButton}>
        <AnchorButton to="/new" intent="success" icon="plus" fill>
          Add new entry
        </AnchorButton>
      </div>
    </UserOnly>
  </>;
}
