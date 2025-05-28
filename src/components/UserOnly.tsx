import { NonIdealState } from "@blueprintjs/core";
import { PropsWithChildren, useContext } from "react";

import { User } from "../providers/user";

export default function UserOnly({ children }: PropsWithChildren) {
  const { user } = useContext(User);

  if (!user) {
    return <NonIdealState icon="error" title="You cannot access this page" />;
  }

  return children;
}
