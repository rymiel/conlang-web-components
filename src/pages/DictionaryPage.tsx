import { Icon, NonIdealState, Spinner, SpinnerSize, Tag } from "@blueprintjs/core";
import { useContext } from "react";

import { DictionaryList, Meanings, RowRenderer } from "../components/dictionary";
import { useTitle } from "../providers/title";
import { Dictionary } from "../site/context";
import { ScriptCell, StatusIcons } from "../site/display";
import { SectionTitle, SIMPLE_SECTIONS } from "../site/sections";

const rowRender: RowRenderer = (e) => ({
  eng: <span>
    <StatusIcons entry={e} />
    {e.tag && <Tag intent="danger">{e.tag}</Tag>}
    <Meanings meanings={e.meanings} />
    {e.meanings.some((m) => m.sections.some((s) => s.title === SectionTitle.TRANSLATION)) && <Icon
      icon="label"
      title="has a translation"
    />}
    {/* move to conlang-web-components? */}
    {SIMPLE_SECTIONS.map(([title, name, iconProps]) =>
      e.sections.some((s) => s.title === title) ? (
        <Icon {...iconProps} key={title} title={`has ${name.toLowerCase()}`} />
      ) : undefined,
    )}
  </span>,
  ...(e.script !== undefined && { trans: <ScriptCell entry={e} /> }),
});

export default function DictionaryPage() {
  useTitle("Home");
  const { entries } = useContext(Dictionary);

  if (!entries) {
    return <NonIdealState icon={<Spinner size={SpinnerSize.LARGE} />} />;
  }

  return <div className="page-content dictionary-page">
    <DictionaryList entries={entries} row={rowRender} />
  </div>;
}
