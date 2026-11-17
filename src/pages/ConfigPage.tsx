import {
  Button,
  ControlGroup,
  Divider,
  FormGroup,
  HTMLSelect,
  InputGroup,
  Intent,
  NonIdealState,
  NumericInput,
  Pre,
  Section,
  SectionCard,
  Spinner,
  SpinnerSize,
  Switch,
  TagInput,
} from "@blueprintjs/core";
import { monoDarkTheme } from "@json-edit-react/themes";
import { JsonEditor } from "json-edit-react";
import { useContext, useState } from "react";
import { Link } from "react-router-dom";

import { ApiConfig } from "../apiTypes";
import PendingFieldset from "../components/PendingFieldset";
import {
  arrayIsEqualWeight,
  DEFAULT_GENERATION,
  GenerationConfig,
  Weighted,
  WeightedChoices,
  WeightedGroups,
} from "../lang/generation";
import { DEFAULT_SOUND_CHANGE, SoundChangeConfig } from "../lang/soundChange";
import { configOrEmpty, DEFAULT_KEY_VALUE, KeyValue } from "../providers/config";
import { useAction } from "../site/action";
import { Dictionary, LangConfig, useSite } from "../site/context";
import { showSuccess } from "../site/toast";

interface EditorProps<T> {
  data: T;
  setData: (data: T) => void; // Dispatch<SetStateAction<T>>;
}

function subField<T extends object, K extends keyof T>({ data, setData }: EditorProps<T>, field: K): EditorProps<T[K]> {
  return { data: data[field], setData: (newData) => setData({ ...data, [field]: newData }) };
}

function configEntry<T extends object>({ data, setData }: EditorProps<unknown>, def: T): EditorProps<T> {
  return { data: configOrEmpty(data, def), setData: (newData: T) => setData(newData) };
}

interface TopLevelEditor extends EditorProps<unknown> {
  editorKey: string;
}

function DefaultEditor({ data, setData }: EditorProps<unknown>) {
  return <JsonEditor
    data={data}
    setData={setData}
    showClipboardButton={false}
    collapse={false}
    theme={monoDarkTheme}
  />;
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

function GenerationEditor(props: EditorProps<GenerationConfig>) {
  return <>
    <FormGroup label="Structure">
      <StringListEditor {...subField(props, "structure")} />
    </FormGroup>
    <FormGroup label="Parts">
      <WeightedGroupsEditor {...subField(props, "parts")} />
    </FormGroup>
    <FormGroup label="Groups">
      <WeightedGroupsEditor {...subField(props, "groups")} />
    </FormGroup>
  </>;
}

interface KeyValueEditorProps extends EditorProps<KeyValue> {
  className?: string;
  transform?: (key: string) => string;
}
const identity = (k: string) => k;
function KeyValueEditor({ data, setData, className = "", transform = identity }: KeyValueEditorProps) {
  const [newKey, setNewKey] = useState("");
  const invalid = newKey === "" || newKey in data;
  return <div className={`key-value-editor ${className}`}>
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
        className="key-value-new"
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

function SoundChangeEditor(props: EditorProps<SoundChangeConfig>) {
  return <>
    <p>
      <Link to="/sound_changes">Edit sound changes.</Link>
    </p>
    <FormGroup label="Groups">
      <KeyValueEditor className="sound-change-editor" {...subField(props, "groups")} />
    </FormGroup>
  </>;
}

function Editor(props: TopLevelEditor) {
  switch (props.editorKey) {
    case "generation":
      return <GenerationEditor {...configEntry(props, DEFAULT_GENERATION)} />;
    case "abbr":
      return <KeyValueEditor
        className="abbr-editor"
        transform={(k) => k.toUpperCase()}
        {...configEntry(props, DEFAULT_KEY_VALUE)}
      />;
    case "parts":
      return <KeyValueEditor {...configEntry(props, DEFAULT_KEY_VALUE)} />;
    case "sound_change":
      return <SoundChangeEditor {...configEntry(props, DEFAULT_SOUND_CHANGE)} />;
    default:
      return <DefaultEditor {...props} />;
  }
}

function Content({ config, refresh }: { config: ApiConfig; refresh: () => Promise<void> }) {
  const [key, setKey] = useState("");
  const [data, setData] = useState<unknown>({});
  const [loading, run] = useAction();
  const [errored, setErrored] = useState(false);
  const [inspect, setInspect] = useState(false);
  const { api } = useSite();

  const submit = () =>
    run(async () => {
      try {
        await api.lang<string>(`/config/${key}`, "POST", JSON.stringify(data));
      } catch (err) {
        setErrored(true);
        throw err;
      }
      setErrored(false);
      showSuccess("Config saved!");
      await refresh();
    });

  return <div className="config-page">
    <PendingFieldset pending={loading}>
      <ControlGroup className="fit-width fill-height">
        <HTMLSelect
          onChange={(e) => {
            const value = e.currentTarget.value;
            setData(value in config ? config[value] : {});
            setKey(value);
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
        <Switch label="Inspect mode" onChange={(e) => setInspect(e.currentTarget.checked)} />
        {key !== "" && inspect === false && <Button
          intent={errored ? "danger" : "primary"}
          loading={loading}
          icon={errored ? "cross" : undefined}
          text={errored ? undefined : "Submit"}
          onClick={submit}
        />}
      </ControlGroup>
      <Divider />
      {key !== "" && inspect === false && <Editor editorKey={key} data={data} setData={setData} />}
      {key !== "" && inspect === true && <Pre>{JSON.stringify(data, null, 2)}</Pre>}
    </PendingFieldset>
  </div>;
}

export default function ConfigPage() {
  const { refresh } = useContext(Dictionary);
  const lang = useContext(LangConfig);

  if (lang === null) {
    return <NonIdealState icon={<Spinner size={SpinnerSize.LARGE} />} />;
  } else {
    return <div className="page-content">
      <Content config={lang.config} refresh={refresh} />
    </div>;
  }
}
