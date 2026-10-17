import fs from "node:fs";
import { expect, test } from "vitest";
import { processResults, readFile } from "./bumps";

import type { ProcessedEvent } from "./types";

const TG_DIR = "./results/tg_format/";

const signed = (n: number | null) =>
  n === null ? "?" : n > 0 ? `+${n}` : `${n}`;

/**
 * One line per crew in starting order: per-day moves, overall gain and
 * blades/withdrawn flags. Diffs of this pin down exactly which historical
 * results a change to the processor or the data has moved.
 */
function summarise(event: ProcessedEvent): string {
  const lines = [
    `${event.set} ${event.gender} ${event.year}`,
    `full_set: ${event.full_set}`,
    `div_size: ${event.div_size.map((d) => d.join(" ")).join(" | ")}`,
    "",
  ];

  const width = Math.max(...event.crews.map((c) => c.num_name.length));

  event.crews.forEach((crew, start) => {
    const moves: string[] = [];
    let pos = start;

    for (const day of event.move) {
      const m = day[pos] ?? null;
      moves.push(signed(m).padStart(3));

      if (m === null) {
        break;
      }

      pos -= m;
    }

    const flags = [crew.blades && "blades", crew.withdrawn && "withdrawn"]
      .filter(Boolean)
      .join(" ");

    lines.push(
      [
        String(start + 1).padStart(3),
        crew.num_name.padEnd(width),
        moves.join(""),
        `= ${signed(crew.gain).padStart(3)}`,
        flags,
      ]
        .join(" ")
        .trimEnd(),
    );
  });

  return lines.join("\n") + "\n";
}

test.each(fs.readdirSync(TG_DIR).sort())(
  "%s parses and processes to the expected results",
  async (file) => {
    const parsed = await readFile(TG_DIR + file);
    expect(parsed.errors).toEqual([]);

    const processed = processResults(parsed.event!);
    expect(processed.errors).toEqual([]);

    await expect(summarise(processed.event!)).toMatchFileSnapshot(
      `./__snapshots__/results/${file}`,
    );
  },
);
