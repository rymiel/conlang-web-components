import { useSite } from "../site/context";

export default function StatsPage() {
  const { statsSections } = useSite();
  return <div className="page-content stats-page">{statsSections.map((Section, i) => <Section key={i} />)}</div>;
}
