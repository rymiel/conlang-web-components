import { Dialog, DialogBody, H4, HTMLTable, NonIdealState, Spinner, SpinnerSize } from "@blueprintjs/core";
import { Fragment, useContext, useState } from "react";
import { Link } from "react-router-dom";

import { Dictionary } from "./context";
import { FullEntry, SlotValues, SyllableSlot } from "./types";

export function increment(m: Record<string, number>, k: string): Record<string, number> {
  m[k] = (m[k] ?? 0) + 1;
  return m;
}

export function seedTally(keys: readonly string[]): Record<string, number> {
  const obj: Record<string, number> = {};
  for (const k of keys) {
    obj[k] = 0;
  }
  return obj;
}

export function columns<T>(arr: T[], n: number): T[][] {
  const result: T[][] = [];
  const rows = Math.ceil(arr.length / n);
  for (let row = 0; row < rows; row++) {
    const tuple: T[] = [];
    for (let i = row; i < arr.length; i += rows) {
      tuple.push(arr[i]);
    }
    result.push(tuple);
  }
  return result;
}

export function PartsContent() {
  const { entries } = useContext(Dictionary);

  if (!entries) return <NonIdealState icon={<Spinner size={SpinnerSize.LARGE} />} />;

  const extraTally: Record<string, number> = {};

  for (const e of entries) {
    increment(extraTally, e.extra);
  }

  return <div className="stats-section stats-general">
    <div>
      <H4>Parts</H4>
      <HTMLTable compact striped>
        <tbody>
          {Object.keys(extraTally)
            .sort()
            .map((i) => <tr key={i}>
              <td>{i}</td>
              <td>{extraTally[i]}</td>
            </tr>)}
        </tbody>
        <tfoot>
          <tr>
            <td>Total</td>
            <td>{entries.length}</td>
          </tr>
        </tfoot>
      </HTMLTable>
    </div>
  </div>;
}

type SlotMatch = Partial<SlotValues>;

function slotMatches(values: SlotValues, match: SlotMatch): boolean {
  return Object.entries(match).every(([key, value]) => value === undefined || values[key] === value);
}

interface SyllableContentProps {
  slots: readonly SyllableSlot[];
  syllables: (word: string) => readonly SlotValues[];
  matchName: (match: SlotMatch) => string;
}

function MatchDialog({
  match,
  close,
  syllables,
  matchName,
}: Omit<SyllableContentProps, "slots"> & { match: SlotMatch | null; close: () => void }) {
  const entries = useContext(Dictionary).entries ?? [];

  if (match === null) return null;

  const matching: Set<FullEntry> = new Set();
  for (const entry of entries) {
    for (const syll of syllables(entry.sol)) {
      if (slotMatches(syll, match)) {
        matching.add(entry);
      }
    }
  }
  return <Dialog isOpen={match !== null} onClose={() => close()} title={<>Matches of {matchName(match)}</>}>
    <DialogBody>
      <ol>
        {[...matching].map((e) => <li key={e.hash}>
          <Link to={e.link}>{e.disp}</Link>
        </li>)}
      </ol>
    </DialogBody>
  </Dialog>;
}

export function SyllableContent({ slots, syllables, matchName }: SyllableContentProps) {
  const { entries } = useContext(Dictionary);
  const [match, setMatch] = useState<SlotMatch | null>(null);

  if (!entries) return <NonIdealState icon={<Spinner size={SpinnerSize.LARGE} />} />;

  const tallies = slots.map((slot) => seedTally(slot.values));
  for (const entry of entries) {
    for (const syll of syllables(entry.sol)) {
      slots.forEach((slot, i) => increment(tallies[i], syll[slot.key]));
    }
  }

  return <div className="stats-section stats-general">
    {slots.map((slot, i) => <div key={slot.key}>
      <H4>{slot.name}</H4>

      <HTMLTable compact striped>
        <tbody>
          {columns(
            Object.entries(tallies[i]).sort((a, b) => b[1] - a[1]),
            slot.size,
          ).map((chunk, j) => <tr key={j}>
            {chunk.map(([k, v]) => <Fragment key={k}>
              <td>{k}</td>
              <td>
                <a onClick={() => setMatch({ [slot.key]: k })}>{v}</a>
              </td>
            </Fragment>)}
          </tr>)}
        </tbody>
      </HTMLTable>
    </div>)}
    <MatchDialog match={match} close={() => setMatch(null)} syllables={syllables} matchName={matchName} />
  </div>;
}
