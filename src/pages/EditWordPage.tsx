import {
  Button,
  Checkbox,
  Classes,
  Code,
  ControlGroup,
  Divider,
  InputGroup,
  NonIdealState,
  PopoverNext as Popover,
  Tag,
  TextArea,
} from "@blueprintjs/core";
import { PropsWithChildren, ReactElement, useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import { ApiBase, ApiSection } from "../apiTypes";
import {
  BaseData,
  EditWordPageContent,
  InfoSection,
  InfoTag,
  SectionEditor,
  TranslationSectionEditor,
  useEditContext,
} from "../components/editor";
import PendingFieldset from "../components/PendingFieldset";
import { RichText } from "../components/richText";
import { WordSelect } from "../components/wordSelect";
import { useAction } from "../site/action";
import { useData, useSite } from "../site/context";
import { SectionTitle, SIMPLE_SECTIONS } from "../site/sections";
import { FullEntry, FullMeaning, FullSection } from "../site/types";

function EntryData({ v }: { v: FullEntry }) {
  const edit = useEditContext();
  const { refresh } = useData();
  const { tag, api, generatedFields } = useSite();
  const [deleting, runDelete] = useAction();

  const doDelete = () =>
    runDelete(async () => {
      await api.lang(`/word/${v.hash}`, "DELETE");
      await refresh();
      edit.closeDrawer();
    });

  const doEdit = () => edit.openDrawer(<EntryEditor existing={v} />);

  return <PendingFieldset pending={deleting}>
    <BaseData v={v} />
    <InfoTag left="sol" right={v.sol} onClick={doEdit} />
    <InfoTag left="extra" right={v.extra} onClick={doEdit} />
    <InfoTag left="tag" right={v.tag} onClick={doEdit} />
    <InfoTag left="ex" right={v.ex} onClick={doEdit} />
    <InfoTag left="gloss" right={v.gloss} onClick={doEdit} />
    {generatedFields(v).map(([left, right]) => <InfoTag key={left} left={left} right={right} generated />)}
    <InfoTag left="disp" right={v.disp} generated />
    <InfoTag left="ipa" right={v.ipa} generated />
    {v.phon !== undefined && <InfoTag left="phon" right={v.phon} generated />}
    {v.script !== undefined && <InfoTag left="script" right={<span lang={tag}>{v.script}</span>} generated />}
    {v.class !== undefined && <InfoTag left="class" right={v.class} generated />}
    <InfoSection title="meanings">
      {v.meanings.map((m, mi) => <InfoSection title={`[${mi}]`} key={m.hash}>
        <MeaningData v={m} />
      </InfoSection>)}
      <Divider />
      <Button
        intent="warning"
        text="Add new meaning"
        icon="add"
        onClick={() => edit.openDrawer(<MeaningEditor to={v.hash} />)}
      />
    </InfoSection>
    <SectionableData v={v} />
    <Button intent="danger" icon="trash" text="Delete entry" onClick={doDelete} loading={deleting} />
  </PendingFieldset>;
}

function MeaningData({ v }: { v: FullMeaning }) {
  const edit = useEditContext();
  return <>
    <BaseData v={v} />
    <InfoTag left="prefix" right={v.prefix} onClick={() => edit.openDrawer(<MeaningEditor existing={v} />)} />
    <InfoTag left="eng" right={v.eng} onClick={() => edit.openDrawer(<MeaningEditor existing={v} />)} />
    <SectionableData v={v} />
  </>;
}

function SectionData({ v }: { v: FullSection }) {
  const edit = useEditContext();
  const sectionDataEditorButton = useCallback((): readonly [ReactElement, () => void] => {
    const open = edit.openDrawer;
    const simple = SIMPLE_SECTIONS.find(([title]) => v.title === title);
    if (v.title === SectionTitle.TRANSLATION) {
      const handler = () => open(<TranslationSectionEditor as={v.hash} existing={v.content} />);
      const element = <Button intent="warning" text="Edit translation section" icon="arrow-right" onClick={handler} />;
      return [element, handler];
    } else if (simple !== undefined) {
      const [title, name] = simple;
      const handler = () => open(<TextSectionEditor as={v.hash} content={v.content} title={title} />);
      const element = <Button
        intent="warning"
        text={`Edit ${name.toLowerCase()} section`}
        icon="arrow-right"
        key={title}
        onClick={handler}
      />;
      return [element, handler];
    } else {
      const handler = () => {};
      const element = <Tag size="large" intent="danger">
        Unknown section {v.title}.
      </Tag>;
      return [element, handler];
    }
  }, [edit.openDrawer, v.content, v.hash, v.title]);
  const [button, handler] = sectionDataEditorButton();
  useEffect(() => {
    if (edit.active === v.hash && !edit.drawerOpen) {
      handler();
    }
  }, [edit.active, v.hash, handler, edit.drawerOpen]);
  return <>
    <BaseData v={v} />
    <InfoTag left="title" right={v.title} fixed />
    <InfoTag left="content" right={v.content} fixed />
    {button}
  </>;
}

interface Sectionable extends ApiBase {
  sections: ApiSection[];
}
function SectionableData({ v }: { v: Sectionable }) {
  const edit = useEditContext();
  return <>
    <InfoSection title="sections">
      {v.sections.map((s, si) => <InfoSection title={`[${si}]`} key={s.hash}>
        <SectionData v={s} />
      </InfoSection>)}
      <Divider />
      <Popover
        popoverClassName={Classes.POPOVER_CONTENT_SIZING}
        content={
          <div>
            <ControlGroup vertical>
              <Button
                intent="warning"
                text="Translation section"
                onClick={() => edit.openDrawer(<TranslationSectionEditor to={v.hash} />)}
              />
              {SIMPLE_SECTIONS.map(([title, name]) => <Button
                intent="warning"
                text={`${name} section`}
                key={title}
                onClick={() => edit.openDrawer(<TextSectionEditor to={v.hash} title={title} />)}
              />)}
            </ControlGroup>
          </div>
        }
        renderTarget={({ isOpen, ...targetProps }) => <Button
          intent="warning"
          text="Create section"
          icon="add"
          {...targetProps}
        />}
      />
    </InfoSection>
  </>;
}

function TelephoneGameHelper({ children, onSelect }: PropsWithChildren<{ onSelect: (s: string) => void }>) {
  const [rein, setRein] = useState(false);
  const [langName, setLangName] = useState("");
  const [word, setWord] = useState("");
  const [author, setAuthor] = useState("");
  const [link, setLink] = useState("");

  const linkRe = /^.*reddit\.com\/r\/conlangs\/comments\/(\w+)\/biweekly_telephone_game_v3_(\d+)\/(\w+).*$/;
  const linkSub = link.replace(linkRe, "https://old.reddit.com/r/conlangs/comments/$1/-/$3/?context=10000");
  const match = link.match(linkRe);
  const n = match?.[2];

  const authorLink = `https://old.reddit.com/u/${author}`;
  const base = `${langName} "${word}" by [/u/${author}](${authorLink}), via [Telephone Game #${n}](${linkSub})`;
  const template = rein
    ? `Originally from ${base}. Reinterpreted as a native word.`
    : `From ${base}. Taken as a loanword`;

  return <Popover
    interactionKind="click"
    popoverClassName={`${Classes.POPOVER_CONTENT_SIZING} telephone-popover`}
    placement="bottom"
    content={
      <div>
        <RichText text={template} />
        <InputGroup value={langName} onValueChange={setLangName} placeholder="Language name" />
        <InputGroup value={word} onValueChange={setWord} placeholder="Word" />
        <InputGroup value={author} onValueChange={setAuthor} placeholder="Author" />
        <InputGroup value={link} onValueChange={setLink} placeholder="Link" />
        <Checkbox label="Reinterpret as native" checked={rein} onChange={(e) => setRein(e.currentTarget.checked)} />
        <Button className={Classes.POPOVER_DISMISS} intent="success" text="Apply" onClick={() => onSelect(template)} />
      </div>
    }
    renderTarget={({ isOpen, ...targetProps }) => <div {...targetProps}>{children}</div>}
  />;
}

function TextSectionEditor({
  to,
  as,
  title,
  content: existingContent,
}: {
  to?: string;
  as?: string;
  title: SectionTitle;
  content?: string;
}) {
  const edit = useEditContext();
  const [content, setContent] = useState(existingContent ?? "");

  const data = () => ({ title, content });
  const form = <ControlGroup fill>
    <TextArea
      onChange={(e) => setContent(e.currentTarget.value)}
      value={content}
      placeholder={`Content for ${title}`}
      fill
      rows={4}
    />
  </ControlGroup>;
  const buttons = <>
    <WordSelect onSelect={(t) => setContent((c) => `${c}[${t.hash}] (“${t.meanings[0]?.eng}”)`)} />
    <TelephoneGameHelper onSelect={(t) => setContent((c) => c + t)}>
      <Button icon="book" intent="primary" />
    </TelephoneGameHelper>
  </>;
  const preview = <RichText text={content} on={edit.page} />;

  return <SectionEditor name={`${title} text`} {...{ to, as, form, preview, data, buttons }} />;
}

function EntryEditor({ existing }: { existing: FullEntry }) {
  const edit = useEditContext();
  const { refresh } = useData();
  const { api, language, extraEditFields } = useSite();
  const [sol, setSol] = useState(existing.sol);
  const [extra, setExtra] = useState(existing.extra);
  const [isObsolete, setObsolete] = useState(existing.tag === "obsolete");
  const [gloss, setGloss] = useState(existing.gloss);
  const [fields, setFields] = useState(() => extraEditFields.map(([key]) => existing[key]));
  const as = existing.hash;
  const [submitting, runSubmit] = useAction();

  const submit = () => {
    const data = {
      sol,
      extra,
      tag: isObsolete ? "obsolete" : existing.tag === "obsolete" ? undefined : existing.tag,
      ex: existing.ex,
      gloss: gloss === "" ? undefined : gloss,
      ...Object.fromEntries(extraEditFields.map(([key], i) => [key, fields[i] === "" ? undefined : fields[i]])),
    };
    runSubmit(async () => {
      await api.lang("/word", "POST", { as }, data);
      await refresh();
      edit.closeDrawer();
    });
  };

  return <div className="page-content">
    <PendingFieldset pending={submitting}>
      <p>
        Editing entry <Code>{as}</Code>.
      </p>
      <InputGroup onValueChange={setSol} defaultValue={sol} placeholder={language} />
      <InputGroup onValueChange={setExtra} defaultValue={extra} placeholder="Extra" />
      <InputGroup onValueChange={setGloss} defaultValue={gloss} placeholder="Gloss" />
      {extraEditFields.map(([key, placeholder], i) => <InputGroup
        key={key}
        onValueChange={(value) => setFields((f) => f.map((old, j) => (j === i ? value : old)))}
        defaultValue={fields[i]}
        placeholder={placeholder}
      />)}
      <Checkbox onChange={(e) => setObsolete(e.currentTarget.checked)} defaultChecked={isObsolete} label="Obsolete" />
      <Button fill intent="success" text="Submit" onClick={submit} loading={submitting} />
    </PendingFieldset>
  </div>;
}

function MeaningEditor({ to, existing }: { to?: string; existing?: FullMeaning }) {
  const edit = useEditContext();
  const { refresh } = useData();
  const { api } = useSite();
  const [rest, setRest] = useState(existing?.eng ?? "");
  const [prefix, setPrefix] = useState(existing?.prefix ?? "");
  const [submitting, runSubmit] = useAction();
  const [deleting, runDelete] = useAction();
  const as = existing?.hash;

  if (to === undefined && as === undefined) {
    throw new Error("One of `as` or `to` must be provided");
  }

  const doSubmit = () => {
    const eng = prefix === undefined || prefix === "" ? rest : `(${prefix}) ${rest}`;
    runSubmit(async () => {
      await api.lang("/meaning", "POST", { to, as }, { eng });
      await refresh();
      edit.closeDrawer();
    });
  };

  const doDelete = () => {
    if (as === undefined) {
      throw new Error("Cannot delete nonexistent section");
    }
    runDelete(async () => {
      await api.lang(`/meaning/${as}`, "DELETE");
      await refresh();
      edit.closeDrawer();
    });
  };

  return <div className="page-content editor-sidebar">
    <PendingFieldset pending={submitting || deleting}>
      {to && <p>
        Adding new meaning to <Code>{to}</Code>.
      </p>}
      {as && <p>
        Editing meaning <Code>{as}</Code>.
      </p>}
      <InputGroup onValueChange={setPrefix} defaultValue={prefix} placeholder="Prefix" />
      <InputGroup onValueChange={setRest} defaultValue={rest} placeholder="English" />
      <Button fill intent="success" text="Submit" onClick={doSubmit} loading={submitting} />
      {as && <Button
        fill
        className="editor-sidebar-delete"
        intent="danger"
        icon="trash"
        text="Delete entry"
        onClick={doDelete}
        loading={deleting}
      />}
    </PendingFieldset>
  </div>;
}

export default function EditWordPage() {
  const { entries } = useData();
  const { hash, edit } = useParams() as { hash: string; edit?: string };

  const entry = entries.find((e) => e.hash === hash);

  if (!entry) {
    return <NonIdealState icon="error" title="Unknown word" description={hash} />; // TODO
  }

  return <div className="page-content">
    <EditWordPageContent entry={entry} active={edit}>
      <EntryData v={entry} />
    </EditWordPageContent>
  </div>;
}
