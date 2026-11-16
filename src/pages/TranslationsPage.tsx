import { NonIdealState, Spinner, SpinnerSize } from "@blueprintjs/core";
import { useContext, useEffect, useRef } from "react";
import { Link, useParams } from "react-router-dom";

import { InterlinearGloss, parseInterlinear } from "../components/interlinear";
import UserOnly from "../components/UserOnly";
import { useTitle } from "../providers/title";
import { Dictionary, LangConfig } from "../site/context";
import { useExamples } from "../site/translations";
import { FullEntry, FullSection } from "../site/types";
import { uri } from "../util";

function Translation({
  entry,
  section,
  highlighted,
}: {
  entry: FullEntry;
  section: FullSection;
  highlighted: boolean;
}) {
  const lang = useContext(LangConfig);
  const ref = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (highlighted) {
      ref.current?.scrollIntoView();
    }
  }, [highlighted]);

  return <dd id={section.hash} className={`translation-entry ${highlighted ? "translation-focused" : ""}`} ref={ref}>
    <InterlinearGloss
      data={parseInterlinear(section.content)}
      link
      indent
      script={lang?.hasScript}
      extra={
        <UserOnly>
          <span className="edit-link">
            [ <Link to={uri`/edit/${entry.hash}/${section.hash}`}>edit</Link> ]
          </span>
        </UserOnly>
      }
    />
  </dd>;
}

function Content({ entries, query }: { entries: readonly FullEntry[]; query: string | undefined }) {
  const examples = useExamples(entries);

  return <>
    <p>This page lists all translations from all words with examples sentences in the dictionary.</p>
    <ul>
      {examples.map(({ entry, nth, sections }) => <li key={`${entry.hash}-${nth}`}>
        <p>
          <Link to={entry.link}>{entry.disp}</Link> ({nth})
        </p>
        <dl>
          {sections.map((section) => <Translation
            key={section.hash}
            entry={entry}
            section={section}
            highlighted={query === section.hash}
          />)}
        </dl>
      </li>)}
    </ul>
  </>;
}

export default function TranslationsPage() {
  const { entries } = useContext(Dictionary);
  const { query } = useParams();
  useTitle("Translations");

  let content = <NonIdealState icon={<Spinner size={SpinnerSize.LARGE} />} />;

  if (entries) {
    content = <div className="page-content">
      <Content entries={entries} query={query} />
    </div>;
  }

  return content;
}
