export type GSubMap = readonly (readonly [string | RegExp, string])[];
export function gsub(str: string, map: GSubMap): string {
  map.forEach(([k, v]) => {
    str = str.replaceAll(k, v);
  });
  return str;
}

export type SubMap = readonly (readonly [string, string])[];
export function sub(str: string, map: SubMap): string {
  for (const c of str) {
    const r = map.find(([k, _]) => k === c);
    if (r !== undefined) {
      return str.replace(c, r[1]);
    }
  }

  return str;
}

export function zip<K extends string, V>(ks: readonly K[], vs: readonly V[]): Record<K, V> {
  if (ks.length !== vs.length)
    throw new Error(`Mismatched zip array lengths: ${ks.length} vs ${vs.length} (${ks}) (${vs})`);
  return Object.fromEntries(ks.map((k, i) => [k, vs[i]])) as Record<K, V>;
}

export const uri = (strings: readonly string[], ...values: readonly unknown[]) =>
  String.raw({ raw: strings }, ...values.map((i) => encodeURIComponent(String(i))));
