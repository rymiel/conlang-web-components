import { useCallback } from "react";

import { ApiClient } from "../api";
import { SoundChangeInstance } from "../lang/soundChange";
import { useApi, useErrorHandler } from "../providers/api";
import { ErrorHandler } from "../providers/conlang";
import { useSite } from "./context";
import { ValidationCandidate, ValidationFailure } from "./types";

export type Validate = (
  candidates: readonly ValidationCandidate[],
  soundChange: SoundChangeInstance,
) => Promise<ValidationFailure[]>;

async function validateRemote(
  api: ApiClient,
  candidates: readonly ValidationCandidate[],
  soundChange: SoundChangeInstance,
  error: ErrorHandler,
): Promise<ValidationFailure[]> {
  const fail: ValidationFailure[] = [];
  const lookup = candidates.map((c) => [c.sol, soundChange.ipaWithoutSoundChange(c.sol)] as const);
  try {
    const failIdx = await api.lang<number[]>("/validate", "POST", JSON.stringify(lookup));
    failIdx.forEach((f) => {
      const c = candidates[f];
      if (c.sol.includes("-")) {
        return; // Skip all affixes for now
      }
      fail.push([c, "invalid word"]);
    });
  } catch (e) {
    error(e);
  }
  return fail;
}

export function useValidate(): Validate {
  const api = useApi();
  const error = useErrorHandler();
  const { validateLocal } = useSite();

  return useCallback(
    async (candidates, soundChange) => [
      ...validateLocal(candidates),
      ...(await validateRemote(api, candidates, soundChange, error)),
    ],
    [api, error, validateLocal],
  );
}
