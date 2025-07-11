import {
  Button,
  ControlGroup,
  Divider,
  FormGroup,
  HTMLSelect,
  InputGroup,
  Intent,
  NumericInput,
  Section,
  SectionCard,
  TagInput,
} from "@blueprintjs/core";
import { JsonEditor, monoDarkTheme } from "json-edit-react";
import { useEffect, useState } from "react";

import { ApiConfig } from "../apiTypes";
import { arrayIsEqualWeight, GenerationConfig, Weighted, WeightedChoices, WeightedGroups } from "../lang/generation";
import { useApi, useErrorHandler } from "../providers/api";
import { KeyValue } from "../providers/config";

interface EditorProps<T> {
  data: T;
  setData: (data: T) => void; // Dispatch<SetStateAction<T>>;
}

interface TopLevelEditor extends EditorProps<unknown> {
  editorKey: string;
}

function DefaultEditor({ data, setData }: EditorProps<unknown>) {
  return <JsonEditor data={data} setData={setData} enableClipboard={false} theme={monoDarkTheme} />;
}

function StringListEditor({ data, setData }: EditorProps<readonly string[]>) {
  return <TagInput
    addOnBlur={true}
    autoResize={true}
    values={data}
    fill={false}
    onChange={(values) => setData(values.filter((s) => typeof s === "string"))}
  />;
}

const weightOne = (s: string): readonly [string, number] => [s, 1];

function normalizeWeighted(w: Weighted): WeightedChoices {
  if (typeof w === "string") {
    return [...w].map(weightOne);
  } else if (arrayIsEqualWeight(w)) {
    return w.map(weightOne);
  } else {
    return w;
  }
}

function WeightedEditor({ data, setData }: EditorProps<Weighted>) {
  const weighted = normalizeWeighted(data);

  return <>
    {weighted.map(([value, weight], index) => <ControlGroup vertical key={index} className="weighted-editor">
      <InputGroup
        value={value}
        onValueChange={(v) => setData(weighted.map((x, i) => (i === index ? ([v, weight] as const) : x)))}
      />
      <NumericInput
        value={weight}
        onValueChange={(w) => {
          if (weight > 0 && w < 0) w = 0; // Don't allow going to negatives without crossing zero first
          if (w >= 0) setData(weighted.map((x, i) => (i === index ? ([value, w] as const) : x)));
          else setData(weighted.filter((_, i) => i !== index));
        }}
        intent={weight === 0 ? Intent.DANGER : Intent.NONE}
        minorStepSize={null}
      />
    </ControlGroup>)}
    <Button icon="plus" intent={Intent.SUCCESS} onClick={() => setData([...weighted, ["", 1] as const])} />
  </>;
}

function WeightedGroupsEditor({ data, setData }: EditorProps<WeightedGroups>) {
  const [name, setName] = useState("");

  return <div className="weighted-groups-editor">
    {Object.entries(data).map(([k, v]) => <Section title={k} key={k} collapsible compact>
      <SectionCard>
        <WeightedEditor
          data={v}
          setData={(w) => {
            if (w.length === 0) {
              const { [k]: _, ...rest } = data;
              setData(rest);
            } else {
              setData({ ...data, [k]: w });
            }
          }}
        />
      </SectionCard>
    </Section>)}
    <Section title="New" icon="plus" collapsible compact collapseProps={{ defaultIsOpen: false }}>
      <SectionCard>
        <ControlGroup vertical>
          <InputGroup value={name} onValueChange={setName} />
          <Button
            text="Create group"
            intent={Intent.SUCCESS}
            onClick={() => {
              setData({ ...data, [name]: [["", 1]] as const });
              setName("");
            }}
          />
        </ControlGroup>
      </SectionCard>
    </Section>
  </div>;
}

function isEmptyObject(object: unknown): boolean {
  if (typeof object !== "object") return false;
  for (const _ in object) {
    return false;
  }
  return true;
}

const GENERATION_EMPTY: GenerationConfig = {
  structure: [],
  parts: {},
  groups: {},
};

function GenerationEditor({ data, setData }: EditorProps<unknown>) {
  const value = isEmptyObject(data) ? GENERATION_EMPTY : (data as GenerationConfig);
  const setValue = (newValue: GenerationConfig) => setData(newValue);
  return <>
    <FormGroup label="Structure">
      <StringListEditor data={value.structure} setData={(structure) => setValue({ ...value, structure })} />
    </FormGroup>
    <FormGroup label="Parts">
      <WeightedGroupsEditor data={value.parts} setData={(parts) => setValue({ ...value, parts })} />
    </FormGroup>
    <FormGroup label="Groups">
      <WeightedGroupsEditor data={value.groups} setData={(groups) => setValue({ ...value, groups })} />
    </FormGroup>
  </>;
}

interface KeyValueEditorProps extends EditorProps<unknown> {
  className?: string;
  transform?: (key: string) => string;
}
const identity = (k: string) => k;
function KeyValueEditor({
  data: rawData,
  setData: setRawData,
  className = "",
  transform = identity,
}: KeyValueEditorProps) {
  const data = rawData as KeyValue;
  const setData = (newValue: KeyValue) => setRawData(newValue);
  const [newKey, setNewKey] = useState("");
  const invalid = newKey === "" || newKey in data;
  return <div className={`kv-editor ${className}`}>
    {Object.entries(data).map(([key, value]) => <ControlGroup key={key}>
      <FormGroup label={key} inline>
        <InputGroup
          value={value}
          intent={value === undefined ? "danger" : "none"}
          onValueChange={(v) => setData({ ...data, [key]: v === "" ? undefined : v })}
        />
      </FormGroup>
    </ControlGroup>)}
    <ControlGroup>
      <InputGroup
        className="new-key"
        value={newKey}
        onValueChange={(v) => setNewKey(transform(v))}
        intent={invalid ? "danger" : "none"}
      />
      <Button
        icon="plus"
        intent={Intent.SUCCESS}
        onClick={() => {
          setData({ ...data, [newKey]: undefined });
          setNewKey("");
        }}
        disabled={invalid}
      />
    </ControlGroup>
  </div>;
}

function Editor(props: TopLevelEditor) {
  switch (props.editorKey) {
    case "generation":
      return <GenerationEditor {...props} />;
    case "abbr":
      return <KeyValueEditor className="abbr-editor" transform={(k) => k.toUpperCase()} {...props} />;
    case "parts":
      return <KeyValueEditor {...props} />;
    default:
      return <DefaultEditor {...props} />;
  }
}

export default function Content({ config, refresh }: { config: ApiConfig; refresh: () => void }) {
  const [key, setKey] = useState("");
  const [data, setData] = useState<unknown>({});
  const [loading, setLoading] = useState(false);
  const [errored, setErrored] = useState(false);
  const api = useApi();
  const error = useErrorHandler();

  useEffect(() => {
    if (key in config) {
      setData(config[key]);
    } else {
      setData({});
    }
  }, [config, key]);

  const submit = () => {
    setLoading(true);
    api
      .lang<string>(`/config/${key}`, "POST", JSON.stringify(data))
      .then(() => {
        setErrored(false);
        refresh();
      })
      .catch((err) => {
        error(err);
        setErrored(true);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return <div>
    <ControlGroup className="fit-width fill-height">
      <HTMLSelect
        onChange={(e) => {
          setData({});
          setKey(e.currentTarget.value);
        }}
        defaultValue=""
      >
        <option value="">Key</option>
        <option value="generation">generation</option>
        <option value="abbr">abbr</option>
        <option value="parts">parts</option>
        <option value="sound_change">sound_change</option>
        <option value="syllable">syllable</option>
      </HTMLSelect>
      {key !== "" && <Button
        intent={errored ? "danger" : "primary"}
        loading={loading}
        icon={errored ? "cross" : undefined}
        text={errored ? undefined : "Submit"}
        onClick={submit}
      />}
    </ControlGroup>
    <Divider />
    {key !== "" && <Editor editorKey={key} data={data} setData={setData} />}
  </div>;
}
