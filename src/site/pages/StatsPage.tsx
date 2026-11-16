import { useTitle } from "../../providers/title";
import { useSite } from "../context";

export default function StatsPage() {
  const { statsSections } = useSite();
  useTitle("Stats");
  return <div className="inter stats-page">{statsSections.map((Section, i) => <Section key={i} />)}</div>;
}
