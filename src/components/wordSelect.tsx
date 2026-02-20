import { Button, MenuItem } from "@blueprintjs/core";
import { ItemPredicate, ItemRenderer, Select } from "@blueprintjs/select";

import { useDictionary } from "../providers/data";
import { Entry } from "../providers/dictionary";
import { Abbr } from "./interlinear";

// TODO: perf

const filterDiacritics = (str: string) => str.normalize("NFD").replace(/\p{Diacritic}/gu, "");

export function entryHasMatch(query: string, entry: Entry): boolean {
  if (query === "") return true;
  const normalizedEng = entry.meanings.map((i) => `(${i.prefix?.toLowerCase() ?? ""}) ${i.eng.toLowerCase()}`);
  const normalizedGloss = entry.gloss?.toLowerCase();
  const normalizedQuery = filterDiacritics(query.toLowerCase());

  return `${filterDiacritics(entry.sol)} ${normalizedGloss} ${normalizedEng.join("; ")}`.indexOf(normalizedQuery) >= 0;
}

const filterEntry: ItemPredicate<Entry> = (query: string, entry: Entry, _index, _exactMatch) => {
  return entryHasMatch(query, entry);
};

const renderEntry: ItemRenderer<Entry> = (entry, { handleClick, handleFocus, modifiers }) => {
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
        {entry.disp ?? entry.sol}:
        {entry.gloss && <>
          {" "}
          (<Abbr>{entry.gloss}</Abbr>)
        </>}{" "}
        {eng}
      </>
    }
  />;
};

// TODO: Callback type might be problematic, but this seems like a component that wouldn't be that bad to just pass
//       the dictionary manually.

export function WordSelect({ onSelect }: { onSelect: (entry: Entry) => void }) {
  const { entries } = useDictionary();
  return <Select<Entry>
    // https://github.com/palantir/blueprint/pull/6999
    items={(entries || []) as Entry[]}
    itemPredicate={filterEntry}
    itemRenderer={renderEntry}
    noResults={<MenuItem disabled={true} text="No results." roleStructure="listoption" />}
    onItemSelect={onSelect}
    disabled={entries === null}
  >
    <Button icon="add" intent="primary" fill className="fill-height" disabled={entries === null} />
  </Select>;
}
