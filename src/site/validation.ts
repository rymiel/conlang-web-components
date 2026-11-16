import { useCallback } from "react";

import { ApiClient } from "../api";
import { SoundChangeInstance } from "../lang/soundChange";
import { useSite } from "./context";
import { showError } from "./toast";
import { ValidationCandidate, ValidationFailure } from "./types";

export type Validate = (
  candidates: readonly ValidationCandidate[],
  soundChange: SoundChangeInstance,
) => Promise<ValidationFailure[]>;

async function validateRemote(
  api: ApiClient,
  candidates: readonly ValidationCandidate[],
  soundChange: SoundChangeInstance,
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
    showError(e);
  }
  return fail;
}

export function useValidate(): Validate {
  const { api, validateLocal } = useSite();

  return useCallback(
    async (candidates, soundChange) => [
      ...validateLocal(candidates),
      ...(await validateRemote(api, candidates, soundChange)),
    ],
    [api, validateLocal],
  );
}
