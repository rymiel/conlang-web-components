import {
  Button,
  CheckboxCard,
  Code,
  Divider,
  FormGroup,
  H3,
  HTMLTable,
  Popover,
  Tag,
  TextArea,
} from "@blueprintjs/core";
import { FormEvent, Fragment, ReactNode, useEffect, useRef, useState } from "react";
import reactStringReplace from "react-string-replace";

import { Change, SoundChangeInstance, SoundChangeSteps } from "../lang/soundChange";
import { useApi, useErrorHandler, useSuccessHandler } from "../providers/api";
import { useDictionary } from "../providers/data";
import { Entry } from "../providers/dictionary";

function tags(s: string | null): ReactNode {
  if (s === null) return null;
  if (s === "")
    return <Tag intent="danger" minimal>
      ∅
    </Tag>;
  return reactStringReplace(s, /(\{\w\})/, (m, i) => <Tag key={i} intent="primary" minimal>
    {m.slice(1, -1)}
  </Tag>);
}

function SoundChange({ change }: { change: Change }) {
  const [from, to, left, right] = change.map(tags);
  if (left === null && right === null) {
    return <>
      <Code>{from}</Code> → <Code>{to}</Code>
    </>;
  } else {
    return <>
      <Code>{from}</Code> → <Code>{to}</Code> / {left && <Code>{left}</Code>} _ {right && <Code>{right}</Code>}
    </>;
  }
}

function soundChangeToString([from, to, left, right]: Change): string {
  from = from === "" ? "∅" : from;
  to = to === "" ? "∅" : to;
  if (left === null && right === null) {
    return `${from} -> ${to}`;
  } else {
    left = left === null ? "" : ` ${left}`;
    right = right === null ? "" : ` ${right}`;
    return `${from} -> ${to} /${left} _${right}`;
  }
}

function soundChangeFromString(s: string): Change {
  const [action, context] = s.split("/").map((i) => i.trim()) as [string, string?];
  const [from, to] = action
    .split("->")
    .map((i) => i.trim())
    .map((i) => (i === "∅" ? "" : i));
  let left = null;
  let right = null;
  if (context !== undefined) {
    [left, right] = context
      .split("_")
      .map((i) => i.trim())
      .map((i) => (i === "" ? null : i));
  }
  return [from, to, left, right];
}

interface StepListProps extends SoundChangeSteps {
  changes: readonly Change[];
  title?: string;
  flip?: boolean;
}
function StepList({ steps, indices, changes, title, flip }: StepListProps) {
  return <div className="sound-change-steps">
    {title && <H3 className="header">{title}</H3>}
    {steps.map((v, i) => {
      const sound = <span>{v}</span>;
      const index = <em>{i < indices.length && <>{indices[i] + 1}.</>}</em>;
      const change = <span>{i < indices.length && <SoundChange change={changes[indices[i]]} />}</span>;
      return flip ? (
        <Fragment key={i}>
          {index}
          {change}
          {sound}
        </Fragment>
      ) : (
        <Fragment key={i}>
          {sound}
          {index}
          {change}
        </Fragment>
      );
    })}
  </div>;
}

function ChangesLink({ count }: { count: number }) {
  return <a>
    <span>—</span>
    <span>
      {count} change{count === 1 ? "" : "s"}
    </span>
    <span>→</span>
  </a>;
}

function StepListChanges(props: StepListProps) {
  return props.steps.length > 1 ? (
    <Popover
      interactionKind="click"
      position="top-right"
      popoverClassName="sound-change-list"
      className="arrow"
      content={<StepList {...props} />}
    >
      <ChangesLink count={props.indices.length} />
    </Popover>
  ) : (
    <i>no changes</i>
  );
}

function StepListDiff({ from, to }: { from: StepListProps; to: StepListProps }) {
  return <Popover
    interactionKind="click"
    position="top-right"
    popoverClassName="sound-change-list"
    className="arrow"
    content={
      <div className="sound-change-diff">
        <StepList {...from} title="Old" flip />
        <Divider />
        <StepList {...to} title="New" />
      </div>
    }
  >
    <>
      <p>
        <ChangesLink count={from.indices.length} />
      </p>
      <p>
        <ChangesLink count={to.indices.length} />
      </p>
    </>
  </Popover>;
}

type MakeLocalSoundChange = (changes: readonly Change[]) => SoundChangeInstance;

export default function Content({
  entries,
  soundChange,
  makeLocal,
}: {
  entries: readonly Entry[];
  soundChange: SoundChangeInstance;
  makeLocal: MakeLocalSoundChange;
}) {
  const [changes, setChanges] = useState(soundChange.config.changes);
  const [localInstance, setLocalInstance] = useState<SoundChangeInstance | null>(null);
  const [ignoreNoChanges, setIgnoreNoChanges] = useState(false);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [rulesWidth, setRulesWidth] = useState(0);
  const { refresh } = useDictionary();
  const api = useApi();
  const error = useErrorHandler();
  const success = useSuccessHandler();

  const rulesRef = useRef<HTMLDivElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    if (textareaRef.current && rulesWidth !== 0) {
      textareaRef.current.style.minWidth = `${rulesWidth + 20}px`;
    }
  }, [rulesWidth]);

  const clearInstance = () => {
    setLocalInstance(null);
    setEditing(false);
    setChanges(soundChange.config.changes);
    setRulesWidth(0);
  };

  const startEditing = () => {
    setEditing(true);
    setRulesWidth(rulesRef.current?.clientWidth ?? 0);
  };

  const finishEditing = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setEditing(false);
    setRulesWidth(0);
    const data = new FormData(e.currentTarget);
    const rules = data.get("rules") as string;
    const before = changes.map(soundChangeToString).join("\n");
    if (before === rules) return;
    const newChanges = rules.split("\n").map(soundChangeFromString);
    setLocalInstance(makeLocal(newChanges));
    setChanges(newChanges);
  };

  const saveConfig = () => {
    const newConfig = { ...soundChange.config, changes: changes };
    setLoading(true);
    api
      .lang<string>(`/config/sound_change`, "POST", JSON.stringify(newConfig))
      .then(() => {
        success("Sound changes saved!");
        setLocalInstance(null);
        refresh();
      })
      .catch((err) => {
        error(err);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return <div className="sound-change">
    <div className="rules" ref={rulesRef}>
      {localInstance !== null && <>
        <Button text="Forget changes" icon="trash" intent="danger" fill onClick={clearInstance} />
        <Button text="Save config" icon="cloud-upload" intent="primary" fill onClick={saveConfig} loading={loading} />
      </>}
      {editing ? (
        <form onSubmit={finishEditing}>
          <Button text="Save changes" icon="tick" intent="success" type="submit" fill />
          <TextArea
            name="rules"
            fill
            rows={changes.length + 4}
            defaultValue={changes.map(soundChangeToString).join("\n")}
            inputRef={textareaRef}
          />
        </form>
      ) : (
        <>
          <Button text="Edit rules" icon="edit" fill onClick={startEditing} />
          {changes.map((c, i) => <span key={i}>
            {i + 1}. <SoundChange change={c} />
            <br />
          </span>)}
        </>
      )}
    </div>
    <div className="changes">
      {localInstance === null ? (
        <FormGroup>
          <CheckboxCard compact onChange={(e) => setIgnoreNoChanges(e.currentTarget.checked)}>
            Ignore <i>no changes</i>
          </CheckboxCard>
        </FormGroup>
      ) : (
        <H3>Viewing differences</H3>
      )}
      <HTMLTable compact striped>
        <thead>
          <tr>
            <th>Word</th>
            <th>Changes</th>
            <th>Result</th>
          </tr>
        </thead>
        <tbody>
          {localInstance === null
            ? entries.map((e) => {
                const steps = soundChange.soundChangeStepsIndexed(e.sol);
                if (ignoreNoChanges && steps.steps.length <= 1) return undefined;
                return <tr key={e.hash}>
                  <td>{e.sol}</td>
                  <td className="center">
                    <StepListChanges {...steps} changes={changes} />
                  </td>
                  <td>{soundChange.soundChange(e.sol)}</td>
                </tr>;
              })
            : entries.map((e) => {
                const oldSteps = soundChange.soundChangeStepsIndexed(e.sol);
                const newSteps = localInstance.soundChangeStepsIndexed(e.sol);
                if (oldSteps.steps.toString() === newSteps.steps.toString()) return undefined;
                return <tr key={e.hash}>
                  <td>{e.sol}</td>
                  <td>
                    <StepListDiff
                      from={{ ...oldSteps, changes: soundChange.config.changes }}
                      to={{ ...newSteps, changes }}
                    />
                  </td>
                  <td>
                    <p>{soundChange.soundChange(e.sol)}</p>
                    <p>{localInstance.soundChange(e.sol)}</p>
                  </td>
                </tr>;
              })}
        </tbody>
      </HTMLTable>
    </div>
  </div>;
}
