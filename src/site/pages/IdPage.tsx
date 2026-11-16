import { NonIdealState, Spinner, SpinnerSize } from "@blueprintjs/core";
import { useContext } from "react";
import { Navigate, useParams } from "react-router-dom";

import { Dictionary } from "../context";

export default function IdPage() {
  const { entries } = useContext(Dictionary);
  const { hash } = useParams() as { hash: string };

  if (entries) {
    const entry = entries.find((e) => e.hash === hash);
    return <Navigate to={entry ? entry.link : "/404"} replace />;
  }

  return <NonIdealState icon={<Spinner size={SpinnerSize.LARGE} />} />;
}
