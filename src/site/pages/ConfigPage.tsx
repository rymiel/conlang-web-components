import { NonIdealState, Spinner, SpinnerSize } from "@blueprintjs/core";
import { useContext } from "react";

import Content from "../../pages/ConfigPage";
import { useTitle } from "../../providers/title";
import { Dictionary, LangConfig } from "../context";

export default function ConfigPage() {
  const { refresh } = useContext(Dictionary);
  const lang = useContext(LangConfig);
  useTitle("Config");

  if (lang === null) {
    return <NonIdealState icon={<Spinner size={SpinnerSize.LARGE} />} />;
  } else {
    return <div className="inter">
      <Content config={lang.config} refresh={refresh} />
    </div>;
  }
}
