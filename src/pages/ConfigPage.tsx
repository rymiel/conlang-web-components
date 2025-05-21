import { Button, ControlGroup, HTMLSelect } from "@blueprintjs/core";
import { JsonEditor, monoDarkTheme } from "json-edit-react";
import { useEffect, useState } from "react";

import { ApiConfig } from "../apiTypes";
import { useApi } from "../providers/api";

// TODO: css fix
// .jer-editor-container textarea,
// .jer-editor-container input {
//   background-color: whitesmoke;
// }

interface EditorProps {
  editorKey: string;
  content: unknown;
  setContent: (content: unknown) => void;
}

function DefaultEditor({ content, setContent }: EditorProps) {
  return <JsonEditor data={content} setData={setContent} enableClipboard={false} theme={monoDarkTheme} />;
}

function Editor(props: EditorProps) {
  switch (props.editorKey) {
    default:
      return <DefaultEditor {...props} />;
  }
}

export default function Content({ config, refresh }: { config: ApiConfig; refresh: () => void }) {
  const [key, setKey] = useState("");
  const [content, setContent] = useState<unknown>({});
  const api = useApi();

  useEffect(() => {
    if (key in config) {
      setContent(config[key]);
    } else {
      setContent({});
    }
  }, [config, key]);

  const submit = () => {
    api.lang<string>(`/config/${key}`, "POST", JSON.stringify(content)).then(() => {
      refresh();
    });
  };

  return <div>
    <ControlGroup vertical className="fit-width fill-height">
      <HTMLSelect
        onChange={(e) => {
          setKey(e.currentTarget.value);
        }}
        defaultValue=""
        fill
      >
        <option value="">Key</option>
        <option value="generation">generation</option>
        <option value="sound_change">sound_change</option>
        <option value="syllable">syllable</option>
      </HTMLSelect>
      {key !== "" && <>
        <Button intent="primary" text="Submit" onClick={submit} />
        <Editor editorKey={key} content={content} setContent={setContent} />
      </>}
    </ControlGroup>
  </div>;
}
