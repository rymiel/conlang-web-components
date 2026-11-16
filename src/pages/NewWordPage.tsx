import { Button, ControlGroup, HTMLSelect, InputGroup, NonIdealState, Spinner, SpinnerSize } from "@blueprintjs/core";
import { useContext, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import { ApiMeaning, ApiWord } from "../apiTypes";
import { useTitle } from "../providers/title";
import { Dictionary, LangConfig, useSite } from "../site/context";
import { partName } from "../site/display";
import { LangConfigData } from "../site/types";
import { uri } from "../util";

function Editor({ lang }: { lang: LangConfigData }) {
  const dict = useContext(Dictionary);
  const { api, language, draftClass, useNewWordExtra } = useSite();
  const [query, _] = useSearchParams();
  const navigate = useNavigate();
  const [sol, setSol] = useState(query.get("sol") ?? "");
  const [extra, setExtra] = useState(query.get("extra") ?? "");
  const [eng, setEng] = useState(query.get("eng") ?? "");
  const [gloss, setGloss] = useState(query.get("gloss") ?? "");
  const { fields, content, data: extraData } = useNewWordExtra(sol, extra);

  const submit = async () => {
    const data = { sol, extra, gloss: gloss === "" ? undefined : gloss, ...extraData };
    const w = await api.lang<ApiWord>("/word", "POST", {}, data);
    for (const meaning of eng.split(";")) {
      await api.lang<ApiMeaning>("/meaning", "POST", { to: w.hash }, { eng: meaning.trim() });
    }
    dict.refresh();
    navigate(uri`/edit/${w.hash}`);
  };

  return <div className="page-content">
    <p>Creating new entry.</p>
    <ControlGroup vertical className="fit-width">
      <InputGroup onValueChange={setSol} placeholder={language} defaultValue={sol} />
      <HTMLSelect
        onChange={(e) => {
          setExtra(e.currentTarget.value);
        }}
        defaultValue={extra}
        fill
      >
        <option value="">Extra</option>
        {Object.keys(lang.parts).map((k) => <option key={k} value={k}>
          {partName(lang.parts, k, draftClass(sol, k))}
        </option>)}
      </HTMLSelect>
      <InputGroup onValueChange={setEng} placeholder="Translation" defaultValue={eng} />
      <InputGroup onValueChange={setGloss} placeholder="Gloss" defaultValue={gloss} />
      {fields}
      <span>{lang.ipa(sol)}</span>
      <Button fill intent="success" text="Submit" onClick={submit} />
    </ControlGroup>
    {content}
  </div>;
}

export default function NewWordPage() {
  const lang = useContext(LangConfig);
  useTitle("New");

  if (lang === null) {
    return <NonIdealState icon={<Spinner size={SpinnerSize.LARGE} />} />;
  } else {
    return <div className="page-content">
      <Editor lang={lang} />
    </div>;
  }
}
