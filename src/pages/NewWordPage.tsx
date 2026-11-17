import { Button, ControlGroup, HTMLSelect, InputGroup } from "@blueprintjs/core";
import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import { ApiMeaning, ApiWord } from "../apiTypes";
import PendingFieldset from "../components/PendingFieldset";
import { useAction } from "../site/action";
import { useData, useSite } from "../site/context";
import { partName } from "../site/display";
import { LangConfigData } from "../site/types";
import { uri } from "../util";

function Editor({ lang }: { lang: LangConfigData }) {
  const { refresh } = useData();
  const { api, language, draftClass, useNewWordExtra } = useSite();
  const [query, _] = useSearchParams();
  const navigate = useNavigate();
  const [sol, setSol] = useState(query.get("sol") ?? "");
  const [extra, setExtra] = useState(query.get("extra") ?? "");
  const [eng, setEng] = useState(query.get("eng") ?? "");
  const [gloss, setGloss] = useState(query.get("gloss") ?? "");
  const { fields, content, data: extraData } = useNewWordExtra(sol, extra);
  const [submitting, runSubmit] = useAction();

  const submit = () =>
    runSubmit(async () => {
      const data = { sol, extra, gloss: gloss === "" ? undefined : gloss, ...extraData };
      const w = await api.lang<ApiWord>("/word", "POST", {}, data);
      for (const meaning of eng.split(";")) {
        await api.lang<ApiMeaning>("/meaning", "POST", { to: w.hash }, { eng: meaning.trim() });
      }
      await refresh();
      navigate(uri`/edit/${w.hash}`);
    });

  return <div className="page-content">
    <PendingFieldset pending={submitting}>
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
        <Button fill intent="success" text="Submit" onClick={submit} loading={submitting} />
      </ControlGroup>
      {content}
    </PendingFieldset>
  </div>;
}

export default function NewWordPage() {
  const { config: lang } = useData();

  return <div className="page-content">
    <Editor lang={lang} />
  </div>;
}
