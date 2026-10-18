import { beforeAll, describe, expect, test } from "vitest";
import {
  processResults,
  readEvent,
  readFile,
  stepOn,
  writeString,
} from "./bumps";

import type { Event } from "./types";

describe("mays 2024 men", () => {
  let event: Event;

  beforeAll(async () => {
    const parsed = await readFile("./results/tg_format/mays2024_men.txt");
    const processed = processResults(parsed.event!, false);

    expect(parsed.errors).toEqual([]);
    expect(processed.errors).toEqual([]);

    event = processed.event!;
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
        event.crews.map((c) => [c.num_name, c.gain]),
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

describe("error reporting", () => {
  const event = (results: string, days = 1) =>
    readEvent(`Set,May Bumps
Short,Mays
Gender,Men
Year,2024
Days,${days}

Division,Ca,L,M

Results
${results}
`).event!;

  test("valid results have no errors", () => {
    const { errors } = processResults(event("ur"));
    expect(errors).toEqual([]);
  });

  test("unrecognised result codes", () => {
    const { errors } = processResults(event("uqr"));
    expect(errors).toEqual(["Unrecognised result codes: q"]);
  });

  test("bump above the head of the division", () => {
    const { errors } = processResults(event("o3"));
    expect(errors).toEqual([
      "Day 1, division 1: Crew 3 bumps up above the top of the division at position 1",
    ]);
  });

  test("more results than days of racing", () => {
    const { errors } = processResults(event("ur rrr"));
    expect(errors).toEqual([
      "Run out of days of racing with more results still to go",
    ]);
  });

  test("invalid event metadata", () => {
    const { event, errors } = readEvent("Set,Henley\nDivision,A,B\n");
    expect(event).toBeNull();
    expect(errors).toHaveLength(1);
  });

  describe("crew order", () => {
    const parse = (division: string) =>
      readEvent(`Set,May Bumps
Short,Mays
Gender,Men
Year,2024
Days,1

Division,${division}
`);

    test("a club's crews in order", () => {
      expect(parse("Ca,L,Ca2,L2,Ca3").errors).toEqual([]);
    });

    test("the same crew twice", () => {
      const { event, errors } = parse("Cl,Ca,Cl2,Cl");
      expect(event).toBeNull();
      expect(errors).toEqual([
        'Club Clare crews out of order at "Cl" (found 1, expecting 3); add * to the crew if this is intended',
      ]);
    });

    test("a skipped crew number", () => {
      const { errors } = parse("L,L2,L3,L5");
      expect(errors).toEqual([
        'Club LMBC crews out of order at "L5" (found 5, expecting 4); add * to the crew if this is intended',
      ]);
    });

    test("* allows a crew out of order", () => {
      const { event, errors } = parse("Ca,Ca3*,Ca2*");
      expect(errors).toEqual([]);
      expect(event!.crews.map((c) => c.num_name)).toEqual([
        "Caius I",
        "Caius III",
        "Caius II",
      ]);
    });
  });
});

describe("stepOn", () => {
  test("drops withdrawn crews", async () => {
    const parsed = await readFile("./results/tg_format/eights1828_men.txt");
    const event = processResults(parsed.event!).event!;
    const nextYear = stepOn(event);

    expect(event.crews_withdrawn).toBe(1);
    expect(nextYear.crews).toHaveLength(event.crews.length - 1);
    expect(nextYear.crews.every((c) => c !== null)).toBe(true);
    expect(writeString(nextYear)).toContain("Year,1829");
  });

  test("falls back to <year>.next for non-numeric years", () => {
    const event = readEvent(`Set,May Bumps
Short,Mays
Gender,Men
Year,Unknown
Days,1

Division,Ca,L

Results
r
`).event!;

    expect(stepOn(processResults(event).event!).year).toBe("Unknown.next");
  });
});
