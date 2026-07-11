import {
  Button,
  ButtonGroup,
  Callout,
  Code,
  CompoundTag,
  ControlGroup,
  Divider,
  Drawer,
  InputGroup,
} from "@blueprintjs/core";
import { createContext, PropsWithChildren, ReactNode, useCallback, useContext, useState } from "react";
import { useNavigate } from "react-router-dom";

import { ApiBase, ApiSection } from "../apiTypes";
import { useApi, useSuccessHandler } from "../providers/api";
import { SuccessHandler } from "../providers/conlang";
import { useDictionary } from "../providers/data";
import { Entry } from "../providers/dictionary";
import { uri } from "../util";
import GlossSelect from "./GlossSelect";
import {
  AnyInterlinear,
  coalesceInterlinearData,
  disambiguiateInterlinear,
  ILWord,
  InterlinearGloss,
  InterlinearLines,
  OldInterlinearData,
} from "./interlinear";

export function InfoTag({
  left,
  right,
  onClick,
  fixed = false,
  generated = false,
}: {
  left: string;
  right: React.ReactNode;
  onClick?: () => void;
  fixed?: boolean;
  generated?: boolean;
}) {
  const editable = !fixed && !generated;
  return <>
    <CompoundTag
      leftContent={left}
      className="info-tag"
      intent={fixed ? "danger" : generated ? "success" : "primary"}
      icon={fixed ? "anchor" : generated ? "generate" : "draw"}
      interactive={editable}
      onClick={onClick}
      rightIcon={editable ? "edit" : undefined}
      large
    >
      {right === null ? <i>(null)</i> : right === undefined ? <i>(undefined)</i> : right}
    </CompoundTag>
    <br />
  </>;
}

export function InfoSection({
  title,
  children,
  fixed = false,
  generated = false,
}: {
  title: string;
  children: React.ReactNode;
  fixed?: boolean;
  generated?: boolean;
}) {
  return <Callout
    title={title}
    className="edit-section"
    intent={fixed ? "danger" : generated ? "success" : "primary"}
    icon={fixed ? "anchor" : generated ? "generate" : "draw"}
    compact
  >
    {children}
  </Callout>;
}

export function BaseData({ v }: { v: ApiBase }) {
  return <>
    <InfoTag left="hash" right={v.hash} fixed />
    <InfoTag left="created at" right={v.created_at} fixed />
    <InfoTag left="updated at" right={v.updated_at} fixed />
  </>;
}

interface EditContextData {
  openDrawer: (element: React.ReactNode) => void;
  closeDrawer: () => void;
  drawerOpen: boolean;
  page: string;
  active: string | undefined;
}

const EditContext = createContext<EditContextData | null>(null);

export function useEditContext(): EditContextData {
  const context = useContext(EditContext);
  if (context === null) {
    throw new Error("No edit context provided");
  }
  return context;
}

export function EditWordPageContent({
  children,
  entry,
  active,
}: PropsWithChildren<{ entry: Pick<Entry, "hash" | "link">; active: string | undefined }>) {
  const [isOpen, setOpen] = useState(false);
  const [element, setElement] = useState<React.ReactNode>(null);
  const navigate = useNavigate();

  const openDrawer = useCallback((element: React.ReactNode) => {
    setElement(element);
    setOpen(true);
  }, []);

  const closeDrawer = useCallback(() => {
    navigate(`/edit/${entry.hash}`);
    setOpen(false);
  }, [entry.hash, navigate]);

  const back = useCallback(() => {
    navigate(entry.link);
  }, [entry.link, navigate]);

  return <EditContext.Provider value={{ openDrawer, closeDrawer, drawerOpen: isOpen, page: entry.hash, active }}>
    <Button text="Back" icon="arrow-left" onClick={back} /> <br />
    {children}
    <Drawer isOpen={isOpen} onClose={closeDrawer}>
      {element}
    </Drawer>
  </EditContext.Provider>;
}

type SectionEditorProps = {
  to?: string;
  as?: string;
  name: string;
  form: ReactNode;
  preview: ReactNode;
  buttons?: ReactNode;
  data: () => Omit<ApiSection, keyof ApiBase>;
};
export function SectionEditor({ to, as, name, form, preview, buttons, data }: SectionEditorProps) {
  const edit = useEditContext();
  const dict = useDictionary();
  const api = useApi();

  if (to === undefined && as === undefined) {
    throw new Error("One of `as` or `to` must be provided");
  }

  const doSubmit = () => {
    api.lang("/section", "POST", { to, as }, data()).then(() => {
      dict.refresh();
      edit.closeDrawer();
    });
  };

  const doDelete = () => {
    if (as === undefined) {
      throw new Error("Cannot delete nonexistent section");
    }
    api.lang(`/section/${as}`, "DELETE").then(() => {
      dict.refresh();
      edit.closeDrawer();
    });
  };

  return <div className="inter sidebar">
    {to && <p>
      Adding new {name} section to <Code>{to}</Code>.
    </p>}
    {as && <p>
      Editing {name} section <Code>{as}</Code>.
    </p>}
    {form}
    <ButtonGroup fill>
      {buttons}
      <Button fill intent="success" text="Submit" onClick={doSubmit} />
    </ButtonGroup>
    <Divider />
    {preview}
    {as && <Button fill className="bottom" intent="danger" icon="trash" text="Delete entry" onClick={doDelete} />}
  </div>;
}

function interlinearToObsidian(data: AnyInterlinear): string {
  let { engText, srcText, engParts, srcParts } = coalesceInterlinearData(data);
  if (engText.at(0) === "“" && engText.at(-1) === "”") engText = engText.slice(1, -1);
  return [
    "```gloss",
    `\\ex ${srcText}`,
    `\\gla ${srcParts.join(" ")}`,
    `\\glb ${engParts.join(" ")}`,
    `\\ft ${engText}`,
    "```",
  ].join("\n");
}

function italicize(w: ILWord[], bold: string, norm: string): string {
  return w
    .map((i) => (i.ws ? i.text : i.bold ? `${bold}${i.text}${bold}` : `${norm}${i.text}${norm}`))
    .join("")
    .replaceAll(/(?<!\*)\* \*(?!\*)/g, " ");
}

function interlinearToReddit(data: AnyInterlinear): string {
  const { engWords, srcWords, engParts, srcParts } = coalesceInterlinearData(data);
  const boxes: number[] = [];
  for (let i = 0; i < Math.max(srcParts.length, engParts.length); i++) {
    const s = srcParts[i] ?? "";
    const e = engParts[i] ?? "";
    boxes[i] = Math.max(s.length, e.length);
  }
  return [
    italicize(srcWords, "***", "*"),
    "",
    "    " + srcParts.map((s, i) => s.padEnd(boxes[i])).join(" "),
    "    " + engParts.map((s, i) => s.padEnd(boxes[i])).join(" "),
    "",
    italicize(engWords, "**", ""),
  ].join("\n");
}

async function copyToClipboard(content: string, success: SuccessHandler): Promise<void> {
  await navigator.clipboard.writeText(content);
  success("Copied to clipboard");
}

export function OldTranslationSectionEditor({
  to,
  as,
  existing,
}: {
  to?: string;
  as?: string;
  existing?: OldInterlinearData;
}) {
  const edit = useEditContext();
  const navigate = useNavigate();
  const api = useApi();
  const dict = useDictionary();
  const [sol, setSol] = useState(existing?.sol ?? "");
  const [solSep, setSolSep] = useState(existing?.solSep ?? "");
  const [engSep, setEngSep] = useState(existing?.engSep ?? "");
  const [eng, setEng] = useState(existing?.eng ?? "“”");
  const data: OldInterlinearData = { sol, solSep, engSep, eng };

  const createData = () => ({
    title: "translation",
    content: JSON.stringify(data),
  });
  const doMigrate = () => {
    api
      .lang("/section", "POST", { to, as }, { title: "translation", content: `${sol} | ${solSep}\n${engSep}\n${eng}` })
      .then(() => dict.refresh())
      .then(() => {
        edit.closeDrawer();
        navigate(uri`/edit/${edit.page}/${to ?? as ?? ""}`);
      });
  };
  const form = <>
    <InputGroup onValueChange={setSol} value={sol} placeholder="Sentence" />
    <InputGroup onValueChange={setSolSep} value={solSep} placeholder="Interlinearised sentence" />
    <InputGroup onValueChange={setEngSep} value={engSep} placeholder="Interlinearised translation" />
    <InputGroup onValueChange={setEng} value={eng} placeholder="Translation" />
  </>;
  const preview = <>
    <Button fill icon="exchange" text="Migrate" onClick={doMigrate} />
    <InterlinearGloss data={data} asterisk />
  </>;

  return <SectionEditor to={to} as={as} name="translation" form={form} preview={preview} data={createData} />;
}

export function NewTranslationSectionEditor({
  to,
  as,
  existing,
}: {
  to?: string;
  as?: string;
  existing?: InterlinearLines;
}) {
  const success = useSuccessHandler();
  const edit = useEditContext();
  const [source, setSource] = useState(existing?.[0] ?? "");
  const [gloss, setGloss] = useState(existing?.[1] ?? "");
  const [translation, setTranslation] = useState(existing?.[2] ?? "“”");
  const lines: InterlinearLines = [source, gloss, translation];

  const createData = () => ({
    title: "translation",
    content: lines.join("\n"),
  });
  const form = <>
    <ControlGroup fill>
      <InputGroup onValueChange={setSource} value={source} placeholder="Source" fill />
      <GlossSelect {...{ setSource, setGloss }} active={edit.page} />
    </ControlGroup>
    <InputGroup onValueChange={setGloss} value={gloss} placeholder="Gloss" />
    <InputGroup onValueChange={setTranslation} value={translation} placeholder="Translation" />
  </>;
  const copyObsidian = () => copyToClipboard(interlinearToObsidian(lines), success);
  const copyReddit = () => copyToClipboard(interlinearToReddit(lines), success);
  const preview = <>
    <Button fill icon="export" text="Export as Obsidian" onClick={copyObsidian} />
    <Button fill icon="export" text="Export as Reddit" onClick={copyReddit} />
    <InterlinearGloss data={lines} />
  </>;

  return <SectionEditor to={to} as={as} name="translation" form={form} preview={preview} data={createData} />;
}

export function TranslationSectionEditor({ to, as, existing }: { to?: string; as?: string; existing?: string }) {
  if (existing === undefined) {
    return <NewTranslationSectionEditor to={to} as={as} />;
  } else {
    const data = disambiguiateInterlinear(existing);
    if ("sol" in data) {
      return <OldTranslationSectionEditor to={to} as={as} existing={data} />;
    } else {
      return <NewTranslationSectionEditor to={to} as={as} existing={data} />;
    }
  }
}
