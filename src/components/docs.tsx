import { Classes } from "@blueprintjs/core";

import { RichText } from "./richText";

export function DocsView({ text, className = "" }: { text: string; className?: string }) {
  return <div className={`${Classes.RUNNING_TEXT} ${className}`}>
    <RichText text={text} />
  </div>;
}
