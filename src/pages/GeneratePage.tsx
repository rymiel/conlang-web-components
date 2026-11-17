import { Button, ControlGroup, Divider, NumericInput, Tag } from "@blueprintjs/core";
import { useEffect, useState } from "react";

import { GenerationInstance } from "../lang/generation";
import { SoundChangeInstance } from "../lang/soundChange";
import { useData } from "../site/context";
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
  const { config: lang } = useData();

  return <div className="page-content">
    <Content soundChange={lang.soundChange} generation={lang.generation} />
  </div>;
}
