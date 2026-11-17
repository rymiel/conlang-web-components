import { Button, ControlGroup, Divider, InputGroup, NonIdealState, Tag } from "@blueprintjs/core";
import { Fragment, memo, ReactNode, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { useData, useSite } from "../site/context";
import { ReverseResult } from "../site/types";
import { uri } from "../util";

const ReverseContent = memo(function ReverseContent({
  lookup,
  query,
}: {
  lookup: (query: string) => ReverseResult;
  query: string;
}) {
  const { items } = lookup(query);

  if (items.length === 0) {
    return <ul>
      <li>
        <i>{query}</i>:{" "}
        <Tag intent="danger" size="large" icon="cross-circle">
          Invalid word
        </Tag>
      </li>
    </ul>;
  } else {
    return <ul>{items.map((i, j) => <li key={j}>{i}</li>)}</ul>;
  }
});

export default function ReversePage() {
  const { entries } = useData();
  const { query } = useParams();
  const navigate = useNavigate();
  const [search, setSearch] = useState(query ?? "");
  const { useReverseLookup } = useSite();
  const { formsCount, controls, lookup } = useReverseLookup(entries);

  let content: ReactNode;

  if (query === undefined) {
    content = <NonIdealState icon="search" />;
  } else {
    // TODO: try to fuse words? not sure if possible to make efficient
    content = query.split(/[ -]/).map((i, j) => <Fragment key={j}>
      {j > 0 && <Divider />}
      <ReverseContent lookup={lookup} query={i} />
    </Fragment>);
  }

  return <div className="page-content">
    <form
      onSubmit={(e) => {
        navigate(uri`/reverse/${search}`);
        e.preventDefault();
      }}
    >
      <ControlGroup fill>
        <InputGroup
          placeholder={`Reverse search (${formsCount})`}
          onValueChange={(s) => setSearch(s)}
          value={search}
          size="large"
          fill
          rightElement={controls}
        />
        <Button icon="arrow-right" intent="primary" type="submit" />
      </ControlGroup>
    </form>
    {content}
  </div>;
}
