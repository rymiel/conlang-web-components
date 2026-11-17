import { Button, NonIdealState } from "@blueprintjs/core";
import { useState } from "react";
import { Link } from "react-router-dom";

import { useAction } from "../site/action";
import { useData, useSite } from "../site/context";
import { ValidationFailure } from "../site/types";
import { useValidate } from "../site/validation";
import { uri } from "../util";

export default function ValidationPage() {
  const { config: lang } = useData();
  const { useValidationCandidates } = useSite();
  const candidates = useValidationCandidates();
  const validate = useValidate();
  const [fail, setFail] = useState<readonly ValidationFailure[] | null>(null);
  const [isLoading, run] = useAction();

  let footer;

  if (fail !== null && fail.length === 0) {
    footer = <NonIdealState icon="tick-circle" title="All words passed validation" />;
  } else if (fail !== null) {
    footer = <ul>
      {fail.map(([c, reason], i) => <li key={i}>
        <Link to={uri`/reverse/${c.sol}`}>{c.label}</Link>: {reason}
      </li>)}
    </ul>;
  }

  return <div className="page-content">
    <Button
      intent="success"
      text={`Run validation (${candidates.length} entries)`}
      fill
      loading={isLoading}
      onClick={() => {
        setFail(null);
        run(async () => {
          setFail(await validate(candidates, lang.soundChange));
        });
      }}
    />
    {footer}
  </div>;
}
