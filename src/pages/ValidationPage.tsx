import { Button, NonIdealState, Spinner, SpinnerSize } from "@blueprintjs/core";
import { useContext, useState } from "react";
import { Link } from "react-router-dom";

import { LangConfig, useSite } from "../site/context";
import { ValidationFailure } from "../site/types";
import { useValidate } from "../site/validation";
import { uri } from "../util";

export default function ValidationPage() {
  const lang = useContext(LangConfig);
  const { useValidationCandidates } = useSite();
  const candidates = useValidationCandidates();
  const validate = useValidate();
  const [fail, setFail] = useState<readonly ValidationFailure[] | null>(null);
  const [isLoading, setLoading] = useState(false);

  let header;
  let footer;

  if (candidates && lang) {
    header = <Button
      intent="success"
      text={`Run validation (${candidates.length} entries)`}
      fill
      disabled={isLoading}
      loading={isLoading}
      onClick={() => {
        setFail(null);
        setLoading(true);
        validate(candidates, lang.soundChange).then((f) => {
          setFail(f);
          setLoading(false);
        });
      }}
    />;
    if (fail !== null && fail.length === 0) {
      footer = <NonIdealState icon="tick-circle" title="All words passed validation" />;
    } else if (fail !== null) {
      footer = <ul>
        {fail.map(([c, reason], i) => <li key={i}>
          <Link to={uri`/reverse/${c.sol}`}>{c.label}</Link>: {reason}
        </li>)}
      </ul>;
    }
  } else {
    footer = <NonIdealState icon={<Spinner size={SpinnerSize.LARGE} />} />;
  }

  return <div className="page-content">
    {header}
    {footer}
  </div>;
}
