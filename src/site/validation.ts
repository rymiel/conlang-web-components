import { useCallback } from "react";

import { ApiClient } from "../api";
import { useSite } from "./context";
import { showError } from "./toast";
import { ValidationCandidate, ValidationFailure } from "./types";

export type Validate = (candidates: readonly ValidationCandidate[]) => Promise<ValidationFailure[]>;

async function validateRemote(
  api: ApiClient,
  candidates: readonly ValidationCandidate[],
): Promise<ValidationFailure[]> {
  const lookup = candidates.map((c) => [c.key, c.value] as const);
  try {
    const failIdx = await api.lang<number[]>("/validate", "POST", JSON.stringify(lookup));
    return failIdx.map((f) => [candidates[f], "invalid word"] as const);
  } catch (e) {
    showError(e);
    return [];
  }
}

export function useValidate(): Validate {
  const { api, validateLocal } = useSite();

  return useCallback(
    async (candidates) => [...validateLocal(candidates), ...(await validateRemote(api, candidates))],
    [api, validateLocal],
  );
}
