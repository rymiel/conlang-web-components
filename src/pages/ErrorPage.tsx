import { NonIdealState } from "@blueprintjs/core";
import { isRouteErrorResponse, useRouteError } from "react-router-dom";

import { useTitle } from "../providers/title";

export default function ErrorPage() {
  useTitle(null);
  const error = useRouteError();
  console.error(error);

  let errorTitle: string;
  let errorSubtitle: string;

  if (isRouteErrorResponse(error)) {
    // error is type `ErrorResponse`
    errorTitle = error.statusText;
    errorSubtitle = error.data;
  } else if (error instanceof Error) {
    errorTitle = "Error";
    errorSubtitle = error.message;
  } else if (typeof error === "string") {
    errorTitle = "Error";
    errorSubtitle = error;
  } else {
    errorTitle = "Unknown Error";
    errorSubtitle = "(this should never happen)";
  }

  return <NonIdealState icon="error" title={errorTitle} description={errorSubtitle} />;
}
