import { NonIdealState, Spinner, SpinnerSize } from "@blueprintjs/core";
import { useContext } from "react";

import { Change } from "../../lang/soundChange";
import Content from "../../pages/SoundChangePage";
import { useTitle } from "../../providers/title";
import { Dictionary, LangConfig } from "../context";

export default function SoundChangePage() {
  const { entries } = useContext(Dictionary);
  const config = useContext(LangConfig);
  useTitle("Sound changes");

  let content;

  if (entries === null || config === null) {
    content = <NonIdealState icon={<Spinner size={SpinnerSize.LARGE} />} />;
  } else {
    const makeLocal = (changes: readonly Change[]) => config.soundChange.copyWithChanges(changes);
    content = <div className="inter">
      <Content entries={entries} soundChange={config.soundChange} makeLocal={makeLocal} />
    </div>;
  }

  return content;
}
