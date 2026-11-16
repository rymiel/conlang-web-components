import { SectionTitle } from "./sections";
import { FullEntry, FullSection } from "./types";

export interface Example {
  readonly entry: FullEntry;
  readonly nth: number;
  readonly sections: readonly FullSection[];
}

export function useExamples(entries: readonly FullEntry[]): readonly Example[] {
  return entries.flatMap((e) =>
    e.meanings
      .map((m, mi) => {
        const s = m.sections.filter((s) => s.title === SectionTitle.TRANSLATION);
        if (s.length === 0) return null;
        return { entry: e, nth: mi + 1, sections: s };
      })
      .filter((i) => i !== null),
  );
}
