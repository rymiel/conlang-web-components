import { Tag } from "@blueprintjs/core";
import { useMemo } from "react";
import { Link } from "react-router-dom";

import { useData } from "./context";
import { createTransformConfig, createTransformDictionary } from "./transform";
import {
  FullEntry,
  NewWordExtra,
  ReverseLookup,
  ReverseResult,
  Site,
  SiteDefinition,
  ValidationCandidate,
} from "./types";

function Terminal({ entry }: { entry: FullEntry }) {
  const meaning = entry.meanings.map((m) => m.eng).join("; ");
  const tag = entry.tag === undefined ? undefined : <Tag intent="danger">{entry.tag}</Tag>;
  return <>
    <Link to={entry.link}>
      <i>{entry.disp}</i>
    </Link>
    : {tag} ({entry.extra}) "{meaning}"
  </>;
}

function useDirectReverseLookup(entries: readonly FullEntry[]): ReverseLookup {
  const lookup = useMemo(
    () =>
      (query: string): ReverseResult => {
        const found = entries.filter((e) => e.sol === query);
        return { items: found.map((entry) => <Terminal key={entry.hash} entry={entry} />), entries: found };
      },
    [entries],
  );

  return { formsCount: `${entries.length} lemmas`, lookup };
}

function useEntryValidationCandidates(): readonly ValidationCandidate[] {
  const { entries } = useData();
  return entries.map((e) => ({ key: e.hash, sol: e.sol, label: `"${e.sol}"`, entry: e }));
}

function useNoNewWordExtra(_sol: string, _extra: string): NewWordExtra {
  return { data: {} };
}

export function defineSite({ languageConfig, deriveFields, ...site }: SiteDefinition): Site {
  return {
    routes: [],
    generatedFields: () => [],
    extraEditFields: [],
    entryStatus: () => [],
    EntryContent: () => null,
    draftClass: () => null,
    useNewWordExtra: useNoNewWordExtra,
    useReverseLookup: useDirectReverseLookup,
    useValidationCandidates: useEntryValidationCandidates,
    validateLocal: () => [],
    ...site,
    transformConfig: createTransformConfig(languageConfig),
    transformDictionary: createTransformDictionary(deriveFields),
  };
}
