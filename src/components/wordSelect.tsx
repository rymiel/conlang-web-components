import { Button, MenuItem } from "@blueprintjs/core";
import { ItemPredicate, ItemRenderer, Select } from "@blueprintjs/select";

import { useDictionary } from "../providers/data";
import { Entry } from "../providers/dictionary";

// TODO: perf

const filterDiacritics = (str: string) => str.normalize("NFD").replace(/\p{Diacritic}/gu, "");

export function entryHasMatch(query: string, entry: Entry, { exact = false }: { exact?: boolean } = {}): boolean {
  if (!exact && query === "") return true;
  const normalizedEng = entry.meanings.map((i) => i.eng.toLowerCase());
  const normalizedQuery = filterDiacritics(query.toLowerCase());

  if (exact) {
    return filterDiacritics(entry.sol) === normalizedQuery || normalizedEng.includes(normalizedQuery);
  } else {
    return `${filterDiacritics(entry.sol)} ${normalizedEng.join("; ")}`.indexOf(normalizedQuery) >= 0;
  }
}

const filterEntry: ItemPredicate<Entry> = (query: string, entry: Entry, _index, exactMatch) => {
  return entryHasMatch(query, entry, { exact: exactMatch });
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
    text={`${entry.sol}: ${eng}`}
  />;
};

// TODO: Callback type might be problematic, but this seems like a component that wouldn't be that bad to just pass
//       the dictionary manually.

export function WordSelect({ onSelect }: { onSelect: (entry: Entry) => void }) {
  const { entries } = useDictionary();
  return <Select<Entry>
    items={entries || []}
    itemPredicate={filterEntry}
    itemRenderer={renderEntry}
    noResults={<MenuItem disabled={true} text="No results." roleStructure="listoption" />}
    onItemSelect={onSelect}
    disabled={entries === null}
  >
    <Button icon="add" intent="primary" fill className="fill-height" disabled={entries === null} />
  </Select>;
}
