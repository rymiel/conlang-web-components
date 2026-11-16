import {
  Button,
  ControlGroup,
  Divider,
  NonIdealState,
  NumericInput,
  Spinner,
  SpinnerSize,
  Tag,
} from "@blueprintjs/core";
import { useContext, useEffect, useState } from "react";

import { GenerationInstance } from "../lang/generation";
import { SoundChangeInstance } from "../lang/soundChange";
import { useTitle } from "../providers/title";
import { LangConfig } from "../site/context";
import { useValidate } from "../site/validation";

function Content({ soundChange, generation }: { soundChange: SoundChangeInstance; generation: GenerationInstance }) {
  const validate = useValidate();
  const [current, setCurrent] = useState("");
  const [isValid, setValid] = useState<boolean | undefined>(undefined);
  const [sylls, setSylls] = useState(1);
  const [history, setHistory] = useState<string[]>([]);

  useEffect(() => {
    if (current === "") {
      setValid(undefined);
      const word = generation.generateWord(sylls);
      setCurrent(word);
      setHistory((h) => [word, ...h]);
    }
  }, [current, generation, sylls]);

  useEffect(() => {
    if (current !== "") {
      const candidate = { key: current, sol: current, label: `"${current}"` };
      validate([candidate], soundChange).then((fail) => setValid(fail.length === 0));
    }
  }, [current, soundChange, validate]);

  const generate = () => setCurrent("");
  const changeSylls = (s: number) => {
    setSylls(s);
    generate();
  };

  return <div>
    <ControlGroup vertical className="fit-width">
      <NumericInput onValueChange={changeSylls} value={sylls} min={1} />
      <Button intent="primary" text="Generate" onClick={generate} />
    </ControlGroup>
    <Divider />
    <p>{current !== "" ? current : "..."}</p>
    <p>{current !== "" ? soundChange.soundChange(current, { markStress: false }) : "..."}</p>
    <p>
      {isValid === undefined ? (
        <Tag intent="warning">Checking validity...</Tag>
      ) : isValid ? (
        <Tag intent="success">Valid</Tag>
      ) : (
        <Tag intent="danger">Invalid</Tag>
      )}
    </p>
    <Divider />
    <ul>
      {history.map((i, j) => <li key={j} onClick={() => setCurrent(i)}>
        {i}
      </li>)}
    </ul>
  </div>;
}

export default function GeneratePage() {
  const lang = useContext(LangConfig);
  useTitle("Generate");

  let content;

  if (lang === null) {
    content = <NonIdealState icon={<Spinner size={SpinnerSize.LARGE} />} />;
  } else {
    content = <div className="inter">
      <Content soundChange={lang.soundChange} generation={lang.generation} />
    </div>;
  }

  return content;
}
