interface Meaning {
  eng: string;
}

interface SortableEntry {
  extra: string;
  tag: string | undefined;
  meanings: Meaning[];
}

export interface Entry {
  hash: string;
  sol: string;
  link: string;
  extra: string;
  meanings: Meaning[];
}

export interface DictionaryData<E = Entry> {
  entries: E[] | null;
  refresh: () => void;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const compare = (a: string, b: string): number => (((a as any) > b) as any) - (((a as any) < b) as any);

const removePrefix = (eng: string): string => {
  if (eng.startsWith("(")) {
    const split = eng.split(")", 2);
    return (split[1] ?? split[0]).trim();
  } else {
    return eng;
  }
};

export const entrySort = (a: SortableEntry, b: SortableEntry): number => {
  if (a.tag === undefined && b.tag !== undefined) return -1;
  if (a.tag !== undefined && b.tag === undefined) return 1;
  let f = compare(a.extra, b.extra);
  if (f !== 0) return f;
  for (let i = 0; i < a.meanings.length && i < b.meanings.length; i++) {
    f = compare(removePrefix(a.meanings[i]?.eng ?? ""), removePrefix(b.meanings[i]?.eng ?? ""));
    if (f !== 0) return f;
  }
  return a.meanings.length - b.meanings.length;
};
