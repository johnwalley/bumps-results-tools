import { describe, expect, test } from "bun:test";
import { processResults, readEvent } from "./bumps";
import { detectAnomalies } from "./anomalies";

import type { Crew, ProcessedEvent } from "./types";

function tg(year: string, div: string, results: string[], days: number) {
  return [
    "Set,May Bumps",
    "Short,Mays",
    "Gender,Men",
    `Year,${year}`,
    `Days,${days}`,
    "",
    `Division,${div}`,
    "",
    "Results",
    ...results,
    "",
  ].join("\n");
}

function process(text: string): ProcessedEvent {
  const event = readEvent(text);
  return processResults(event!, false)!;
}

/**
 * Build a minimal single-division ProcessedEvent directly from a move matrix
 * and per-crew gains. Used for scenarios that are awkward to express as a TG
 * string. `move[day][startPosition]` is the place change of the crew occupying
 * that start-of-day position.
 */
function makeEvent(
  names: string[],
  move: number[][],
  gains: number[],
): ProcessedEvent {
  const crews: Crew[] = names.map((start, i) => ({
    blades: false,
    club_end: null,
    club: start,
    end: null,
    gain: gains[i],
    highlight: false,
    num_name: start,
    number: 1,
    start,
    withdrawn: false,
  }));

  return {
    set: "May Bumps",
    short: "Mays",
    gender: "Men",
    year: "0000",
    days: move.length,
    distance: 0,
    flags: [],
    pace: [],
    results: [],
    crews,
    crews_withdrawn: 0,
    full_set: true,
    div_size: move.map(() => [names.length]),
    move,
    back: move.map(() => names.map(() => null)),
    completed: move.map(() => [true]),
    skip: move.map(() => names.map(() => false)),
  } as ProcessedEvent;
}

describe("detectAnomalies", () => {
  test("flags two crews bumping each other on consecutive days", () => {
    // 4 crews, 3 days: positions 1 and 2 swap every day — a sustained sawtooth.
    // A single one-off reversal is legitimate and is deliberately not flagged.
    const event = process(tg("2000", "Xa,Yb,Zc,Wd", ["rur", "rur", "rur"], 3));
    const anomalies = detectAnomalies(event);

    const swaps = anomalies.filter((a) => a.kind === "oscillation");
    expect(swaps).toHaveLength(1);
    expect(swaps[0].day).toBe(1);
    expect(swaps[0].crews.sort()).toEqual(["Yb", "Zc"]);
    expect(swaps[0].severity).toBeGreaterThanOrEqual(70);
  });

  test("does not flag a single one-off reversal", () => {
    // 4 crews, 2 days: swap once and back — common and legitimate.
    const event = process(tg("2005", "Xa,Yb,Zc,Wd", ["rur", "rur"], 2));
    const swaps = detectAnomalies(event).filter((a) => a.kind === "oscillation");
    expect(swaps).toEqual([]);
  });

  test("flags a spoons-trending crew bumping a blades-trending crew", () => {
    // C climbs overall (+2) but is bumped by D on day 1; D descends overall (-2).
    const move = [
      [0, 0, -1, 1, 0, 0],
      [0, 0, -1, 1, 0, 0],
      [0, -1, 1, -1, 1, 0],
      [-1, 1, 0, 0, -1, 1],
    ];
    const gains = [-1, -1, 2, -2, 1, 1];
    const event = makeEvent(["A", "B", "C", "D", "E", "F"], move, gains);
    const anomalies = detectAnomalies(event);

    const perf = anomalies.filter((a) => a.kind === "performance");
    expect(perf.length).toBeGreaterThanOrEqual(1);
    const dayOne = perf.find((a) => a.day === 1)!;
    expect(dayOne).toBeDefined();
    // D (overall -2) bumps C (overall +2)
    expect(dayOne.crews).toContain("D");
    expect(dayOne.crews).toContain("C");
    expect(dayOne.severity).toBeGreaterThan(40);
  });

  test("flags a large overbump", () => {
    // Bottom crew of 6 overbumps 4 places on day 1.
    const event = process(tg("2004", "Xa,Yb,Zc,Wd,Ve,Uf", ["o4r"], 1));
    const anomalies = detectAnomalies(event);

    const big = anomalies.filter((a) => a.kind === "large-overbump");
    expect(big).toHaveLength(1);
    expect(big[0].day).toBe(1);
  });

  test("reports nothing for a clean event of rowovers", () => {
    const event = process(
      tg("2001", "Xa,Yb,Zc,Wd,Ve,Uf", ["rrrrrr", "rrrrrr", "rrrrrr", "rrrrrr"], 4),
    );
    expect(detectAnomalies(event)).toEqual([]);
  });

  test("does not flag a steady blades climb as anomalous", () => {
    // Wd climbs a place on each of two days (blades), bumping a different crew
    // each day — a legitimate climb, not an oscillation.
    const event = process(tg("2002", "Xa,Yb,Zc,Wd", ["urr", "rur"], 2));
    expect(detectAnomalies(event)).toEqual([]);
  });
});
