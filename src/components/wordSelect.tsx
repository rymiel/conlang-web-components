import { Button, MenuItem } from "@blueprintjs/core";
import { ItemPredicate, ItemRenderer, Select } from "@blueprintjs/select";

import { useData } from "../site/context";
import { FullEntry } from "../site/types";
import { Abbr } from "./interlinear";

// TODO: perf

const filterDiacritics = (str: string) => str.normalize("NFD").replace(/\p{Diacritic}/gu, "");

export function entryHasMatch(query: string, entry: FullEntry): boolean {
  if (query === "") return true;
  const normalizedEng = entry.meanings.map((i) => `(${i.prefix?.toLowerCase() ?? ""}) ${i.eng.toLowerCase()}`);
  const normalizedGloss = entry.gloss?.toLowerCase();
  const normalizedQuery = filterDiacritics(query.toLowerCase());

  return `${filterDiacritics(entry.sol)} ${normalizedGloss} ${normalizedEng.join("; ")}`.indexOf(normalizedQuery) >= 0;
}

const filterEntry: ItemPredicate<FullEntry> = (query: string, entry: FullEntry, _index, _exactMatch) => {
  return entryHasMatch(query, entry);
};

const renderEntry: ItemRenderer<FullEntry> = (entry, { handleClick, handleFocus, modifiers }) => {
  if (!modifiers.matchesPredicate) {
    return null;
  }
  let eng = entry.meanings[0]?.eng;
  if (entry.meanings.length > 1) {
    eng += "; ...";
  }
  return <MenuItem
    active={modifiers.active}
    disabled={modifiers.disabled}
    key={entry.hash}
    label={entry.extra}
    onClick={handleClick}
    onFocus={handleFocus}
    roleStructure="listoption"
    text={
      <>
        {entry.disp}:
        {entry.gloss && <>
          {" "}
          (<Abbr>{entry.gloss}</Abbr>)
        </>}{" "}
        {eng}
      </>
    }
  />;
};

export function WordSelect({ onSelect }: { onSelect: (entry: FullEntry) => void }) {
  const { entries } = useData();
  return <Select<FullEntry>
    // https://github.com/palantir/blueprint/pull/6999
    items={(entries || []) as FullEntry[]}
    itemPredicate={filterEntry}
    itemRenderer={renderEntry}
    noResults={<MenuItem disabled={true} text="No results." roleStructure="listoption" />}
    onItemSelect={onSelect}
  >
    <Button icon="add" intent="primary" fill className="fill-height" />
  </Select>;
}
