import { Navigate, useParams } from "react-router-dom";

import { useData } from "../site/context";

export default function IdPage() {
  const { entries } = useData();
  const { hash } = useParams() as { hash: string };

  const entry = entries.find((e) => e.hash === hash);
  return <Navigate to={entry ? entry.link : "/404"} replace />;
}
