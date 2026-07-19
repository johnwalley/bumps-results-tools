import { range } from "./utils";

import type { ProcessedEvent } from "./types";

/**
 * Anomaly detection for bumps results.
 *
 * These detectors look for results that are *structurally valid* (and so pass
 * the integrity checks in `processResults`/`checkResults`) but *behaviourally
 * implausible*, which usually indicates a transcription error in the source TG
 * file. All detectors read the already-computed `move`/`back`/`gain` data from
 * `processResults` — nothing here re-parses the TG format.
 */

export type AnomalyKind = "oscillation" | "performance" | "large-overbump";

export interface Anomaly {
  kind: AnomalyKind;
  /** 0–100, used for ranking. Higher = more suspicious. */
  severity: number;
  /** 1-indexed day of racing the anomaly relates to. */
  day: number;
  /** 1-indexed division, or null if it spans/can't be attributed to one. */
  division: number | null;
  /** Crew start names (`Crew.start`) involved. */
  crews: string[];
  /** Human-readable explanation. */
  message: string;
}

// --- Tunable thresholds -----------------------------------------------------

/** A crew trending down by at least this many places is "heading for spoons". */
const SPOONS_GAIN = -2;
/** A crew trending up by at least this many places is "heading for blades". */
const BLADES_GAIN = 2;
/** Overbumps of at least this magnitude get a standalone review flag. */
const LARGE_OVERBUMP = 4;
/**
 * Minimum *reversals* before a pair swap is suspicious. A single reversal
 * (A bumps B one day, B bumps A the next) is common and legitimate in real
 * racing; a sustained sawtooth over three or more days is not.
 */
const MIN_PAIR_REVERSALS = 2;
/**
 * Minimum consecutive alternating racing days for a single-crew oscillation
 * flag. Requires a full up/down/up/down run, which is rare.
 */
const MIN_ALTERNATIONS = 4;

const clamp = (n: number, lo = 0, hi = 100) => Math.max(lo, Math.min(hi, n));

// --- Core derivations -------------------------------------------------------

interface BumpEvent {
  day: number; // 0-indexed
  division: number | null; // 0-indexed
  bumper: number; // original crew index
  bumpee: number; // original crew index
  magnitude: number; // places the bumper moved up
}

/**
 * For each crew, replay its path through the days (mirrors the gain loop in
 * `processResults`). Returns, per original crew index, the position it occupies
 * at the start of each day plus its per-day move. Crews that did not complete
 * (null move / withdrawn) are returned with `complete: false`.
 */
function getTrajectories(event: ProcessedEvent) {
  return range(0, event.crews.length).map((crew) => {
    const startPos: number[] = []; // start-of-day position per day
    const moves: number[] = []; // move per day
    let nc = crew;
    let complete = true;

    for (const day of range(0, event.days)) {
      const m = event.move[day][nc];
      if (m === null) {
        complete = false;
        break;
      }
      startPos.push(nc);
      moves.push(m);
      nc = nc - m;
    }

    return { crew, startPos, moves, complete, skip: event.skip };
  });
}

/**
 * Which division (0-indexed) a start-of-day position falls in on a given day.
 */
function divisionOfPosition(event: ProcessedEvent, day: number, pos: number) {
  let cumulative = 0;
  const sizes = event.div_size[day];
  for (const d of range(0, sizes.length)) {
    cumulative += sizes[d];
    if (pos < cumulative) {
      return d;
    }
  }
  return null;
}

/**
 * Reconstruct every bump (and overbump) as `{ bumper, bumpee, magnitude }`.
 *
 * The bumper is any crew that moved up (`move > 0`) from start-of-day position
 * `p`; the crew it caught is the one that started this day at position `p - k`
 * (which drops one place as the bumper slots in above it). This generalises a
 * single bump (`u`, k=1) and an overbump (`o`k). Virtual results (`skip`) are
 * ignored — nobody physically rowed.
 */
function getBumpEvents(event: ProcessedEvent): BumpEvent[] {
  const trajectories = getTrajectories(event);
  const bumps: BumpEvent[] = [];

  for (const day of range(0, event.days)) {
    // Map start-of-day position -> original crew for this day.
    const crewAtPos = new Map<number, number>();
    for (const t of trajectories) {
      if (t.startPos.length > day) {
        crewAtPos.set(t.startPos[day], t.crew);
      }
    }

    for (const t of trajectories) {
      if (t.startPos.length <= day) continue;
      const k = t.moves[day];
      const p = t.startPos[day];
      if (k <= 0) continue; // only crews moving up are bumpers
      if (event.skip[day][p]) continue; // virtual

      const bumpee = crewAtPos.get(p - k);
      if (bumpee === undefined) continue;
      if (event.skip[day][p - k]) continue;

      bumps.push({
        day,
        division: divisionOfPosition(event, day, p),
        bumper: t.crew,
        bumpee,
        magnitude: k,
      });
    }
  }

  return bumps;
}

const crewName = (event: ProcessedEvent, crew: number) =>
  event.crews[crew]?.start ?? `#${crew + 1}`;

// --- Detectors --------------------------------------------------------------

/**
 * Two crews bumping each other on consecutive days (a transcription
 * "sawtooth"), plus single crews whose movement alternates up/down/up.
 */
function detectOscillation(
  event: ProcessedEvent,
  bumps: BumpEvent[],
): Anomaly[] {
  const anomalies: Anomaly[] = [];

  // Pair swaps: A bumps B on day d, B bumps A on day d+1 (and onward).
  const byDay: Array<Set<string>> = range(0, event.days).map(() => new Set());
  const pairKey = (a: number, b: number) => `${a}->${b}`;
  for (const b of bumps) {
    byDay[b.day].add(pairKey(b.bumper, b.bumpee));
  }

  for (const b of bumps) {
    const d = b.day;
    if (d + 1 >= event.days) continue;
    // Did the bumpee bump the bumper back the next day?
    if (!byDay[d + 1].has(pairKey(b.bumpee, b.bumper))) continue;
    // Only start counting at the first day of a sawtooth: if the previous day
    // already swapped this pair, day d is a continuation of an earlier run.
    if (d > 0 && byDay[d - 1].has(pairKey(b.bumpee, b.bumper))) continue;

    // Count how many further consecutive days the swap continues.
    let runs = 1;
    let cur = { from: b.bumpee, to: b.bumper, day: d + 1 };
    while (
      cur.day + 1 < event.days &&
      byDay[cur.day + 1].has(pairKey(cur.to, cur.from))
    ) {
      runs += 1;
      cur = { from: cur.to, to: cur.from, day: cur.day + 1 };
    }

    if (runs < MIN_PAIR_REVERSALS) continue;

    anomalies.push({
      kind: "oscillation",
      severity: clamp(35 + runs * 20),
      day: d + 1,
      division: b.division === null ? null : b.division + 1,
      crews: [crewName(event, b.bumper), crewName(event, b.bumpee)],
      message: `${crewName(event, b.bumper)} and ${crewName(
        event,
        b.bumpee,
      )} bump each other on ${runs + 1} consecutive days (from day ${d + 1})`,
    });
  }

  // Single-crew alternation: move sign flips every racing day for a run.
  const trajectories = getTrajectories(event);
  for (const t of trajectories) {
    if (t.moves.length < MIN_ALTERNATIONS) continue;
    let alternations = 1;
    let best = 1;
    for (const i of range(1, t.moves.length)) {
      const prev = t.moves[i - 1];
      const cur = t.moves[i];
      if (prev !== 0 && cur !== 0 && Math.sign(prev) !== Math.sign(cur)) {
        alternations += 1;
        best = Math.max(best, alternations);
      } else {
        alternations = 1;
      }
    }
    if (best >= MIN_ALTERNATIONS) {
      anomalies.push({
        kind: "oscillation",
        severity: clamp(55 + (best - MIN_ALTERNATIONS) * 15),
        day: 1,
        division: null,
        crews: [crewName(event, t.crew)],
        message: `${crewName(
          event,
          t.crew,
        )} moves up/down on alternating days (${t.moves.join(", ")})`,
      });
    }
  }

  return anomalies;
}

/**
 * A crew trending toward spoons overbumping a crew trending toward blades — a
 * weak crew should not out-row a strong one, so this usually means a result was
 * entered in the wrong place or direction.
 */
function detectPerformanceInconsistency(
  event: ProcessedEvent,
  bumps: BumpEvent[],
): Anomaly[] {
  const anomalies: Anomaly[] = [];

  for (const b of bumps) {
    const bumperGain = event.crews[b.bumper]?.gain;
    const bumpeeGain = event.crews[b.bumpee]?.gain;
    if (bumperGain == null || bumpeeGain == null) continue;
    if (bumperGain > SPOONS_GAIN || bumpeeGain < BLADES_GAIN) continue;

    const severity = clamp(
      40 + (bumpeeGain - bumperGain) * 3 + b.magnitude * 5,
    );

    anomalies.push({
      kind: "performance",
      severity,
      day: b.day + 1,
      division: b.division === null ? null : b.division + 1,
      crews: [crewName(event, b.bumper), crewName(event, b.bumpee)],
      message: `${crewName(event, b.bumper)} (overall ${bumperGain}, heading ${
        bumperGain <= SPOONS_GAIN ? "for spoons" : "down"
      }) ${b.magnitude > 1 ? `over-bumps ${b.magnitude} places` : "bumps"} ${crewName(
        event,
        b.bumpee,
      )} (overall +${bumpeeGain}, heading for blades)`,
    });
  }

  return anomalies;
}

/** Implausibly large single-day overbumps — recall-oriented review flag. */
function detectLargeOverbumps(
  event: ProcessedEvent,
  bumps: BumpEvent[],
): Anomaly[] {
  return bumps
    .filter((b) => b.magnitude >= LARGE_OVERBUMP)
    .map((b) => ({
      kind: "large-overbump" as const,
      severity: clamp(30 + (b.magnitude - LARGE_OVERBUMP) * 10, 0, 60),
      day: b.day + 1,
      division: b.division === null ? null : b.division + 1,
      crews: [crewName(event, b.bumper), crewName(event, b.bumpee)],
      message: `${crewName(event, b.bumper)} over-bumps ${
        b.magnitude
      } places over ${crewName(event, b.bumpee)}`,
    }));
}

// --- Public API -------------------------------------------------------------

/**
 * Run all detectors over a processed event and return anomalies ranked by
 * severity (most suspicious first), de-duplicated within each kind.
 */
export function detectAnomalies(event: ProcessedEvent): Anomaly[] {
  if (!event.move || !event.skip || !event.div_size) {
    return [];
  }

  const bumps = getBumpEvents(event);

  const all = [
    ...detectOscillation(event, bumps),
    ...detectPerformanceInconsistency(event, bumps),
    ...detectLargeOverbumps(event, bumps),
  ];

  // De-duplicate overlapping flags on the same (kind, day, crews); keep the
  // highest severity.
  const best = new Map<string, Anomaly>();
  for (const a of all) {
    const key = `${a.kind}:${a.day}:${[...a.crews].sort().join("|")}`;
    const existing = best.get(key);
    if (!existing || a.severity > existing.severity) {
      best.set(key, a);
    }
  }

  return [...best.values()].sort((a, b) => b.severity - a.severity);
}
