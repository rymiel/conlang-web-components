import { Tag } from "@blueprintjs/core";
import { useContext, useMemo } from "react";
import { Link } from "react-router-dom";

import { Dictionary } from "./context";
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

function useDirectReverseLookup(entries: readonly FullEntry[] | null): ReverseLookup {
  const lookup = useMemo(() => {
    if (entries === null) return null;
    return (query: string): ReverseResult => {
      const found = entries.filter((e) => e.sol === query);
      return { items: found.map((entry) => <Terminal key={entry.hash} entry={entry} />), entries: found };
    };
  }, [entries]);

  return { formsCount: entries === null ? "..." : `${entries.length} lemmas`, lookup };
}

function useEntryValidationCandidates(): readonly ValidationCandidate[] | null {
  const { entries } = useContext(Dictionary);
  if (entries === null) return null;
  return entries.map((e) => ({ key: e.hash, sol: e.sol, label: `"${e.sol}"`, entry: e }));
}

function useNoNewWordExtra(_sol: string, _extra: string): NewWordExtra {
  return { data: {} };
}

export function defineSite({ languageConfig, defaultParts, deriveFields, ...site }: SiteDefinition): Site {
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
    transformConfig: createTransformConfig(languageConfig, defaultParts),
    transformDictionary: createTransformDictionary(deriveFields),
  };
}
