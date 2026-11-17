import { useTransition } from "react";

import { showError } from "./toast";

export function toastErrors<A extends unknown[]>(fn: (...args: A) => Promise<void>): (...args: A) => Promise<void> {
  return async (...args) => {
    try {
      await fn(...args);
    } catch (err) {
      showError(err);
    }
  };
}

export function useAction(): [isPending: boolean, run: (fn: () => Promise<void>) => void] {
  const [isPending, startTransition] = useTransition();
  const run = (fn: () => Promise<void>) => startTransition(toastErrors(fn));
  return [isPending, run];
}
