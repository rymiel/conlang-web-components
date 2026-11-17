import { Button, H2, H3, H4, Icon, IconSize, NonIdealState, Tag } from "@blueprintjs/core";
import { Fragment, ReactElement, useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";

import { coalesceInterlinearData, InterlinearGloss, parseInterlinear } from "../components/interlinear";
import { RichText } from "../components/richText";
import UserOnly from "../components/UserOnly";
import { useData, useSite } from "../site/context";
import { partName, shortPartName, StatusTags } from "../site/display";
import { SectionTitle, SIMPLE_SECTIONS } from "../site/sections";
import { useExamples } from "../site/translations";
import { FullEntry, FullSection } from "../site/types";
import { uri } from "../util";

function SectionContent({ entry, section, on }: { entry: FullEntry; section: FullSection; on: string }) {
  const simple = SIMPLE_SECTIONS.find(([title]) => section.title === title);
  if (section.title === SectionTitle.TRANSLATION) {
    const extra = <UserOnly>
      <span className="edit-link">
        [ <Link to={uri`/edit/${entry.hash}/${section.hash}`}>edit</Link> ]
      </span>
    </UserOnly>;
    return <InterlinearGloss data={parseInterlinear(section.content)} link indent extra={extra} />;
  } else if (simple !== undefined) {
    const [, name, iconProps] = simple;
    return <>
      <H4>
        {name} <Icon {...iconProps} size={IconSize.LARGE} />
      </H4>
      <RichText text={section.content} on={on} />
    </>;
  } else {
    return <Tag size="large" intent="danger">
      Unknown section {section.title}.
    </Tag>;
  }
}

function WordPageHeader({ entry }: { entry: FullEntry }) {
  const { tag } = useSite();
  return <>
    <H2>{entry.disp}</H2>
    {entry.script !== undefined && <p className="word-pronunciation" lang={tag}>
      {entry.script}
    </p>}
    {entry.phon !== undefined && <span className="word-pronunciation">{entry.phon}</span>}
    <span className="word-pronunciation">{entry.ipa}</span>
  </>;
}

function Meaning({ prefix, eng }: { prefix?: string; eng: string }) {
  return <p>
    {prefix && <i>({prefix}) </i>}
    {eng}
  </p>;
}

// TODO: move to its own page?
function useTranslationUsages(entry: FullEntry, entries: readonly FullEntry[]): ReactElement[] {
  const { useReverseLookup } = useSite();
  const { lookup } = useReverseLookup(entries);
  const examples = useExamples(entries);
  const translations = examples.flatMap((e) => e.sections.map((s, i) => [e, s, i + 1] as const));
  const relevant = translations.filter(([_, s]) => {
    const { srcParts } = coalesceInterlinearData(parseInterlinear(s.content));
    // TODO: use srcWords instead for multi-word matches?
    return srcParts.some((w) => lookup(w).entries.includes(entry));
  });
  return relevant.map(([e, s, i]) => <Link to={uri`/translations/${s.hash}`} key={s.hash}>
    {e.entry.disp} {e.nth}. {i}.
  </Link>);
}

function useEtymologyUsages(entry: FullEntry, entries: readonly FullEntry[]): ReactElement[] {
  const etymologies = entries.flatMap((e) =>
    e.sections.filter((s) => s.title === SectionTitle.ETYMOLOGY).map((s) => [e, s] as const),
  );
  const relevant = etymologies.filter(([_, s]) => s.content.includes(entry.hash));
  return relevant.map(([e, s]) => <Link to={e.link} key={s.hash}>
    {e.disp} etym.
  </Link>);
}

function LookupInfo({ entry, entries }: { entry: FullEntry; entries: readonly FullEntry[] }) {
  const translationUsages = useTranslationUsages(entry, entries);
  const etymologyUsages = useEtymologyUsages(entry, entries);
  const total = translationUsages.length + etymologyUsages.length;
  return <>
    <span>
      {total} usage{total === 1 ? "" : "s"} found:
    </span>
    {translationUsages.map((i, j) => <Fragment key={j}> {i};</Fragment>)}
    {etymologyUsages.map((i, j) => <Fragment key={j}> {i};</Fragment>)}
  </>;
}

function LookupButton({ entry }: { entry: FullEntry }) {
  const { entries } = useData();
  const [run, setRun] = useState(false);
  return run === false ? (
    <Button text="Find usages" intent="primary" onClick={() => setRun(true)} />
  ) : (
    <LookupInfo entry={entry} entries={entries} />
  );
}

function WordPageContent({ entry, highlighted = false }: { entry: FullEntry; highlighted?: boolean }) {
  const { config: lang } = useData();
  const { EntryContent } = useSite();
  const ref = useRef<HTMLHeadingElement | null>(null);

  useEffect(() => {
    if (highlighted) {
      ref.current?.scrollIntoView();
    }
  }, [highlighted]);

  const partHeader = partName(lang.parts, entry.extra, entry.class);

  return <>
    <H3 className="word-meaning" ref={ref}>
      {highlighted ? <mark>{partHeader}</mark> : partHeader}
      <UserOnly>
        <span className="edit-link">
          [ <Link to={uri`/edit/${entry.hash}`}>edit</Link> ]
        </span>
      </UserOnly>
    </H3>

    <StatusTags entry={entry} />
    {entry.tag && <Tag size="large" intent="danger">
      {entry.tag}
    </Tag>}
    <ol>
      {entry.meanings.map((m) => <li key={m.hash}>
        <Meaning prefix={m.prefix} eng={m.eng} />
        {m.sections.length > 0 && <dl>
          {m.sections.map((s) => <dd key={s.hash}>
            <SectionContent entry={entry} section={s} on={entry.hash} />
          </dd>)}
        </dl>}
      </li>)}
    </ol>
    {entry.sections.map((s) => <SectionContent key={s.hash} entry={entry} section={s} on={entry.hash} />)}
    <EntryContent entry={entry} />
    <UserOnly>
      <LookupButton entry={entry} />
    </UserOnly>
  </>;
}

export default function WordPage() {
  const { entries, config: lang } = useData();
  const { word, num } = useParams() as { word: string; num?: string };

  const matching = entries.filter((e) => e.sol === word);

  if (matching.length === 0) {
    return <NonIdealState icon="error" title="Unknown word" description={word} />; // TODO
  }

  const parts = matching.map((i) => shortPartName(lang.parts, i.extra));
  return <div className="page-content word-page">
    <nav className="word-page-toc">
      <ol>
        {parts.map((i, j) => <li key={j}>
          <Link to={uri`/w/${word}/${j + 1}`}>{i}</Link>
        </li>)}
      </ol>
    </nav>
    <div className="content">
      <WordPageHeader entry={matching[0]} /> {/* TODO: Be smarter about this? */}
      {matching.map((m, i) => <WordPageContent key={m.hash} entry={m} highlighted={String(i + 1) == num} />)}
    </div>
  </div>;
}
