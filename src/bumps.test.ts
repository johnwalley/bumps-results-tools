import { beforeAll, describe, expect, test } from "bun:test";
import { processResults, readFile, stepOn, writeString } from "./bumps";

import type { Event } from "./types";

describe("mays 2024 men", () => {
  let event: Event;

  beforeAll(async () => {
    const parsed = await readFile("./results/tg_format/mays2024_men.txt");
    event = parsed!;
    processResults(event, false);
  });

  describe("processResults", () => {
    test("parses event metadata", () => {
      expect(event.set).toBe("May Bumps");
      expect(event.short).toBe("Mays");
      expect(event.gender).toBe("Men");
      expect(event.year).toBe("2024");
      expect(event.days).toBe(4);
    });

    test("processes all crews", () => {
      expect(event.crews).toHaveLength(77);
    });

    test("head of the river", () => {
      const head = event.crews[0];
      expect(head.club).toBe("Caius");
      expect(head.gain).toBe(-2);
      expect(head.blades).toBe(false);
    });

    test("identifies crews that got blades", () => {
      const bladesCrews = event.crews
        .filter((c) => c.blades)
        .map((c) => c.num_name);

      expect(bladesCrews).toEqual([
        "LMBC I",
        "Hughes Hall I",
        "Fitzwilliam I",
        "Churchill I",
        "Clare Hall I",
        "Peterhouse II",
        "Fitzwilliam II",
        "Lucy Cavendish I",
        "St Catharine's III",
        "Lucy Cavendish II",
      ]);
    });

    test("tracks gains correctly for selected crews", () => {
      const gainsByName = Object.fromEntries(
        event.crews.map((c) => [c.num_name, c.gain])
      );

      expect(gainsByName["LMBC I"]).toBe(1);
      expect(gainsByName["Jesus I"]).toBe(3);
      expect(gainsByName["Queens' I"]).toBe(-4);
      expect(gainsByName["Pembroke II"]).toBe(0);
      expect(gainsByName["Trinity Hall II"]).toBe(-6);
      expect(gainsByName["St Catharine's III"]).toBe(6);
    });

    test("no crews withdrawn", () => {
      expect(event.crews_withdrawn).toBe(0);
      expect(event.crews.every((c) => !c.withdrawn)).toBe(true);
    });

    test("division sizes", () => {
      expect(event.div_size).toEqual([
        [17, 17, 17, 17, 9],
        [17, 17, 17, 17, 9],
        [17, 17, 17, 17, 9],
        [17, 17, 17, 17, 9],
      ]);
    });

    test("full event snapshot", () => {
      expect(event).toMatchSnapshot();
    });
  });

  describe("stepOn", () => {
    let nextYear: Event;

    beforeAll(() => {
      nextYear = stepOn(event);
    });

    test("increments year", () => {
      expect(nextYear.year).toBe("2025");
    });

    test("preserves event metadata", () => {
      expect(nextYear.set).toBe("May Bumps");
      expect(nextYear.short).toBe("Mays");
      expect(nextYear.gender).toBe("Men");
      expect(nextYear.days).toBe(4);
    });

    test("preserves crew count", () => {
      expect(nextYear.crews).toHaveLength(77);
    });

    test("reorders crews by end-of-year position", () => {
      expect(nextYear.crews[0].num_name).toBe("LMBC I");
      expect(nextYear.crews[1].num_name).toBe("Magdalene I");
      expect(nextYear.crews[2].num_name).toBe("Caius I");
    });

    test("resets results and computed fields", () => {
      expect(nextYear.results).toEqual([]);
      expect(nextYear.move).toEqual([]);
      expect(nextYear.completed).toEqual([]);
      expect(nextYear.skip).toEqual([]);
      expect(nextYear.full_set).toBe(false);
      expect(nextYear.crews.every((c) => c.end === null)).toBe(true);
      expect(nextYear.crews.every((c) => c.gain === null)).toBe(true);
      expect(nextYear.crews.every((c) => c.blades === false)).toBe(true);
    });

    test("full stepOn snapshot", () => {
      expect(nextYear).toMatchSnapshot();
    });
  });

  test("writeString round-trips to expected format", () => {
    const expected = `Set,May Bumps
Short,Mays
Gender,Men
Year,2024

Division,Ca,L,M,K,E,Pb,J,Ph,D,Cl,Q,SC,L2,S,T,R,Ca2
Division,HH,TH,F,Cr,CC,W,G,Cu,E2,D2,H,Pb2,T2,J2,SE,SC2,Cl2
Division,SS,Dw,M2,Q2,E3,TH2,CH,Cu2,Ph2,R2,S2,Cr2,F2,J3,L3,K2,Ca3
Division,CC2,HH2,LC,T3,W2,Pb3,G2,M3,SS2,Cl3,Dw2,Cu3,J4,E4,L4,SC3,F3
Division,M4,LC2,L5,D3,Ph3,L6,S3,J5,SS3

Results
rrurrru uuro3uurruur rurruuuuuur uuururuurur uuuurrrurrru
ruurur ruo3urururuu uuuurruuuu rurrrurrruuru rurruurrrurrrr
urrruu uurrurururru rurruo3uuurrr rrururrrrruurr uuuururrurrr
urruru ruuuurruuur rruuurruuurr rrrruuurrruru ruuuruurrrur
`;

    expect(writeString(event)).toEqual(expected);
  });
});
