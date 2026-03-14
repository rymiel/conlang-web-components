import { HTMLTable, InputGroup } from "@blueprintjs/core";
import { FC, ReactNode, useCallback, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import { useLanguageName } from "../providers/api";
import { useConfig } from "../providers/data";
import { Entry, Meaning } from "../providers/dictionary";
import { AnchorButton } from "./button";
import UserOnly from "./UserOnly";
import { entryHasMatch } from "./wordSelect";

const DICTIONARY_ROW_KEYS = ["index", "eng", "trans", "extra", "ipa"] as const;
export type DictionaryRowValues = {
  readonly [K in (typeof DICTIONARY_ROW_KEYS)[number]]: ReactNode;
};
interface DictionaryRowProps extends DictionaryRowValues {
  entry: Entry;
}

export type RowRenderer<T = Entry> = (entry: T) => Partial<DictionaryRowValues>;

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

export function ExtraCell({ extra }: { extra: string }) {
  const config = useConfig();
  const abbr = config?.parts?.[extra];

  if (abbr) {
    return <abbr title={abbr}>{extra}</abbr>;
  } else {
    return <span>{extra}</span>;
  }
}

function defaultRowValues(e: Entry): DictionaryRowValues {
  return {
    index: <span>{e.index}</span>,
    eng: <span>
      <Meanings meanings={e.meanings} />
    </span>,
    trans: <i>{e.disp ?? e.sol}</i>,
    extra: <ExtraCell extra={e.extra} />,
    ipa: <span>{e.ipa}</span>,
  };
}

function DictionaryRow({ entry, index, eng, trans, extra, ipa }: DictionaryRowProps) {
  return <tr>
    <td>
      <Link to={entry.link} className="link-fill">
        {index}
      </Link>
    </td>
    <td>
      <Link to={entry.link} className="link-fill">
        {eng}
      </Link>
    </td>
    <td>
      <Link to={entry.link} className="link-fill">
        {trans}
      </Link>
    </td>
    <td>
      <Link to={entry.link} className="link-fill">
        {extra}
      </Link>
    </td>
    <td className="pronunciation">
      <Link to={entry.link} className="link-fill">
        {ipa}
      </Link>
    </td>
  </tr>;
}

interface DictionaryListProps<T> {
  entries: readonly T[];
  row: RowRenderer<T>;
}
export function DictionaryList<T extends Entry = Entry>({ entries, row }: DictionaryListProps<T>) {
  const [search, setSearch] = useState("");
  const language = useLanguageName();

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
    <div className="around-dictionary" ref={handleSearchContainer}>
      <InputGroup type="search" placeholder="Search" onValueChange={setSearch} value={search} size="large" />
    </div>

    <HTMLTable className="dictionary" compact striped interactive>
      <thead>
        <tr>
          <th>#</th>
          <th>English</th>
          <th>{language}</th>
          <th>Extra</th>
          <th className="pronunciation">Pronunciation</th>
        </tr>
      </thead>
      <tbody>{rows.map(([e, r]) => (entryHasMatch(search, e) ? r : undefined))}</tbody>
    </HTMLTable>

    <UserOnly>
      <div className="around-dictionary" ref={handleAddButton}>
        <AnchorButton to="/new" intent="success" icon="plus" fill>
          Add new entry
        </AnchorButton>
      </div>
    </UserOnly>
  </>;
}
