import { NonIdealState } from "@blueprintjs/core";

import { DocsView } from "../components/docs";
import { useData } from "../site/context";

export default function DocsPage() {
  const { config } = useData();

  return <div className="page-content">
    {config.docs === "" ? <NonIdealState icon="manual" title="No docs yet" /> : <DocsView text={config.docs} />}
  </div>;
}
