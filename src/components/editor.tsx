import { Button, Callout, CompoundTag, Drawer } from "@blueprintjs/core";
import { createContext, PropsWithChildren, useCallback, useContext, useState } from "react";
import { useNavigate } from "react-router-dom";

import { ApiBase } from "../apiTypes";
import { Entry } from "../providers/dictionary";

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
