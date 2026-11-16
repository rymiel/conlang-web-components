export enum SectionTitle {
  TRANSLATION = "translation",
  USAGE = "usage",
  ETYMOLOGY = "etymology",
  INSTEAD = "instead",
  COORDINATE = "coordinate",
}

export const SIMPLE_SECTIONS = [
  [SectionTitle.USAGE, "Usage note", { icon: "info-sign" }],
  [SectionTitle.ETYMOLOGY, "Etymology", { icon: "book" }],
  [SectionTitle.INSTEAD, "Use instead", { icon: "flow-end", intent: "danger" }],
  [SectionTitle.COORDINATE, "Coordinate terms", { icon: "compass" }],
] as const;
