import { Intent, OverlayToaster, Position, Toaster } from "@blueprintjs/core";

import { CustomApiError } from "../api";

const toaster = (() => {
  let promise: Promise<Toaster> | null = null;

  return () => {
    if (!promise) {
      promise = OverlayToaster.create({
        position: Position.TOP,
        usePortal: true,
      });
    }
    return promise;
  };
})();

export async function showError(error: unknown): Promise<string> {
  console.error(error);
  const t = await toaster();
  if (error instanceof CustomApiError) {
    return t.show({ intent: Intent.DANGER, message: `${error.status}: ${error.message}` });
  } else if (error instanceof Error) {
    return t.show({ intent: Intent.DANGER, message: error.message });
  } else {
    return t.show({ intent: Intent.DANGER, message: `unknown error ${error}` });
  }
}

export async function showSuccess(message: string): Promise<string> {
  console.info(message);
  const t = await toaster();
  return t.show({ intent: Intent.SUCCESS, message });
}
