import { useTitle } from "../providers/title";
import { useSite } from "../site/context";

export default function StatsPage() {
  const { statsSections } = useSite();
  useTitle("Stats");
  return <div className="page-content stats-page">{statsSections.map((Section, i) => <Section key={i} />)}</div>;
}
