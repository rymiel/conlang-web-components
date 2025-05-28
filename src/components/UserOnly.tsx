import { NonIdealState } from "@blueprintjs/core";
import { PropsWithChildren, useContext } from "react";

import { User } from "../providers/user";

export default function UserOnly({ children, error = false }: PropsWithChildren<{ error?: boolean }>) {
  const { user } = useContext(User);

  if (!user && error) {
    return <NonIdealState icon="error" title="You cannot access this page" />;
  } else if (user !== null) {
    return children;
  }
}
