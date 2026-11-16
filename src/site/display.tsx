import { AnchorButton, Icon, Tag } from "@blueprintjs/core";

import { useLanguageTag } from "../providers/api";
import { KeyValue } from "../providers/config";
import { useSite } from "./context";
import { FullEntry } from "./types";

export function partName(parts: KeyValue, extra: string, cls: string | null | undefined): string {
  return (parts[extra] ?? extra).replace("%", cls ?? "?");
}

export function shortPartName(parts: KeyValue, extra: string): string {
  return (parts[extra] ?? extra).replace(/ \(.*\)$/, "");
}

export function ScriptCell({ entry }: { entry: FullEntry }) {
  const tag = useLanguageTag();
  return <span className="dual">
    <i>{entry.disp}</i>
    <span lang={tag}>{entry.script}</span>
  </span>;
}

export function StatusIcons({ entry }: { entry: FullEntry }) {
  const { entryStatus } = useSite();
  return entryStatus(entry).map((s) => <Icon key={s.title} icon={s.icon} intent={s.intent} title={s.title} />);
}

export function StatusTags({ entry }: { entry: FullEntry }) {
  const { entryStatus } = useSite();
  return entryStatus(entry).map((s) =>
    s.href !== undefined ? (
      <AnchorButton key={s.label} href={s.href} text={s.label} intent="primary" />
    ) : (
      <Tag key={s.label} size="large" intent={s.intent}>
        {s.label}
      </Tag>
    ),
  );
}
