import { Link } from "react-router-dom";
import reactStringReplace from "react-string-replace";

import { useDictionary } from "../providers/data";

const LINK_WRAPPER = /(\[[^\]]+\])/g;
const SIMPLE_LINK = /\[([A-Za-z0-9_-]+)\]/;
const COMPLEX_LINK = /\[([A-Za-z0-9_-]+)\(([^)]+)\)\]/;
const NON_LINK = /\[\(([^)]+)\)\]/;

export function RichText({ text, on }: { text: string; on?: string }) {
  const { entries } = useDictionary();
  const highlighted = reactStringReplace(text, LINK_WRAPPER, (m) => {
    let id;
    let label = null;
    const c = COMPLEX_LINK.exec(m);
    const s = SIMPLE_LINK.exec(m);
    if (c !== null) {
      id = c[1];
      label = c[2];
    } else if (s != null) {
      id = s[1];
    } else {
      const n = NON_LINK.exec(m);
      if (n != null) {
        return <i>{n[1]}</i>;
      }
      return m;
    }

    const entry = entries?.find((i) => i.hash === id);
    if (entry === undefined) {
      return <a className="missing">{m}</a>;
    }

    if (id === on) {
      return <b>
        <i>{label ?? entry.sol}</i>
      </b>;
    }

    return <Link to={entry.link}>
      <i>{label ?? entry.sol}</i>
    </Link>;
  });

  return <p>{...highlighted}</p>;
}
