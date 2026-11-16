export type KeyValue = {
  readonly [K in string]?: string;
};

export const DEFAULT_KEY_VALUE: KeyValue = {};

export function configOrEmpty<T extends object>(config: unknown, def: T): T {
  return { ...def, ...((config ?? {}) as Partial<T>) };
}
