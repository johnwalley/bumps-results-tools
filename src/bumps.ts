import { z } from "zod";
import * as abbreviations from "./abbreviations";
import {
  EventSchema,
  type Crew,
  type Event,
  type ProcessedEvent,
} from "./types";
import { range } from "./utils";

function addCrew(
  crewState: {
    pat?: RegExp;
    [club: string]: RegExp | number | undefined;
  },
  crews: Event["crews"],
  str: string,
  abbrev: Record<string, { name: string; colours?: string[] }>,
  roman = true,
): string | null {
  const crew: Crew = {
    blades: false,
    club: "",
    end: null,
    gain: null,
    highlight: false,
    num_name: "",
    number: 0,
    start: "",
    withdrawn: false,
    club_end: null,
  };

  if (!crewState.pat) {
    crewState.pat = /^(.*?)(\([^\)]*\))?[ ]*([0-9]*)(\*)?$/;
  }

  let m = str.match(crewState.pat);

  if (m === null) {
    return `Can't understand crew name ${str}`;
  }

  let club = m[1].trim();
  let extra = m[2];
  let number = m[3];
  let escape = m[4];

  if (club in abbrev) {
    club = abbrev[club]["name"];
  }

  let num;

  if (number === "") {
    num = 1;
  } else {
    num = Number(number);
  }

  if (!(club in crewState)) {
    crewState[club] = 1;
  }

  // A crew listed twice or a skipped number is almost always a typo in the
  // club code. Crews that really did race out of order are marked with `*`.
  if (num !== crewState[club] && escape !== "*" && club.length > 0) {
    return `Club ${club} crews out of order at "${str}" (found ${num}, expecting ${crewState[club]}); add * to the crew if this is intended`;
  }

  crewState[club] = num + 1;

  let name = club;

  if (extra) {
    name += " " + extra;
  }

  let numName;

  if (num > 1) {
    if (roman && num < abbreviations.roman.length) {
      name += " " + abbreviations.roman[num - 1];
    } else {
      name += ` ${num}`;
    }

    numName = name;
  } else {
    if (roman) {
      numName = `${name} I`;
    } else {
      numName = `${name} 1`;
    }
  }

  crew["start"] = name;
  crew["num_name"] = numName;
  crew["club"] = club;
  crew["number"] = num;
  crew["end"] = null;

  crews.push(crew);

  return null;
}

function swapCrews(
  move: (number | null)[],
  back: (number | null)[],
  posA: number,
  posB: number,
): string | null {
  let origA = back[posA];

  if (origA === null) {
    origA = posA;

    if (move[origA] !== null) {
      return `Crew ${origA + 1} not expected to have a result`;
    }

    move[origA] = 0;
  }

  let origB = back[posB];

  if (origB === null) {
    origB = posB;

    if (move[origB] !== null) {
      return `Crew ${origB + 1} not expected to have a result`;
    }

    move[origB] = 0;
  }

  move[origA]! -= posB - posA;
  move[origB]! += posB - posA;

  back[posA] = origB;
  back[posB] = origA;

  return null;
}

function processBump(
  move: (number | null)[],
  back: (number | null)[],
  crewNum: number,
  up: number,
  divHead: number,
): string | null {
  if (crewNum - up < divHead) {
    return `Crew ${
      crewNum + 1
    } bumps up above the top of the division at position ${divHead + 1}`;
  }

  if (move[crewNum - up] !== null) {
    return `Crew ${crewNum + 1} is bumping a crew at position ${
      crewNum - up + 1
    } that has already got a result`;
  }

  return swapCrews(move, back, crewNum, crewNum - up);
}

function processChain(
  move: (number | null)[],
  back: (number | null)[],
  crewNum: number,
  num: number,
): string | null {
  for (let i = 0; i < num; i++) {
    const error = swapCrews(move, back, crewNum, crewNum + 1);

    if (error !== null) {
      return error;
    }

    crewNum += 1;
  }

  return null;
}

/** A parsed or processed event plus any problems found along the way. */
export type WithErrors<T> = { event: T; errors: string[] };

export function readEvent(text: string): WithErrors<Event | null> {
  const errors: string[] = [];

  let abbrev: {
    [key: string]: { name: string; colours?: string[] };
  } = {};

  const crewState: {
    pat?: RegExp;
    [club: string]: RegExp | number | undefined;
  } = {};

  const time = /([0-9]*):([0-9][0-9](\.[0-9]+)*)/;

  const input = text.split(/\r?\n/);

  const ret: Event = {
    set: "May Bumps",
    short: "Mays",
    gender: "Women",
    year: "Year",
    days: 4,
    distance: 2_500,
    flags: [],
    crews: [],
    div_size: null,
    results: [],
    pace: [],
  };

  let results = false;

  for (let line of input) {
    line = line.trim();

    if (line === "") {
      continue;
    }

    let p = line.split(",");

    if (p[0] === "Set") {
      ret["set"] = p[1] as Event["set"];

      if (ret["set"] in abbreviations.sets) {
        abbrev = abbreviations.sets[ret["set"]];
      }
    } else if (p[0] === "Short") {
      ret["short"] = p[1] as Event["short"];
    } else if (p[0] === "Gender") {
      ret["gender"] = p[1] as Event["gender"];
    } else if (p[0] === "Year") {
      ret["year"] = p[1];
    } else if (p[0] === "Days") {
      ret["days"] = Number(p[1]);
    } else if (p[0] === "Flags") {
      ret["flags"].push(...p.slice(1));
    } else if (p[0] === "Division") {
      if (!ret["div_size"]) {
        ret["div_size"] = [];

        for (let i = 0; i < ret["days"]; i++) {
          ret["div_size"].push([]);
        }
      }

      for (const d of ret["div_size"]) {
        d.push(p.length - 1);
      }

      if (p.length > 1) {
        for (const i of p.slice(1)) {
          const error = addCrew(
            crewState,
            ret["crews"],
            i,
            abbrev,
            ret["short"] !== "Town",
          );

          if (error !== null) {
            errors.push(error);
            return { event: null, errors };
          }
        }
      }
    } else if (p[0] === "Results") {
      results = true;

      p.shift();
    }

    if (results) {
      for (let i of p) {
        i = i.trim();

        if (!i.startsWith("#")) {
          ret["results"].push(i);
        }
      }
    }
  }

  const parsed = EventSchema.safeParse(ret);

  if (!parsed.success) {
    errors.push(z.prettifyError(parsed.error));
    return { event: null, errors };
  }

  return { event: parsed.data, errors };
}

export async function readFile(
  path?: string,
): Promise<WithErrors<Event | null>> {
  // Node-only; imported lazily so the browser bundle never touches them.
  const [fs, consumers] = await Promise.all([
    import("node:fs/promises"),
    import("node:stream/consumers"),
  ]);

  const text = path
    ? await fs.readFile(path, "utf8")
    : await consumers.text(process.stdin);

  return readEvent(text);
}

/**
 * Applies the result codes to an event. On error, processing stops and the
 * partially processed event is returned alongside the errors.
 */
export function processResults(
  input: Event,
  debug = false,
): WithErrors<ProcessedEvent | undefined> {
  // Work on a private copy so the caller's event is never mutated.
  const event = structuredClone(input);
  const errors: string[] = [];

  if (event["div_size"] === null || event["crews"].length === 0) {
    errors.push("Event has no divisions or crews");
    return { event: undefined, errors };
  }

  event["move"] = [];
  event["back"] = [];
  event["completed"] = [];
  event["skip"] = [];
  event["crews_withdrawn"] = 0;
  event["full_set"] = false;

  for (const d of range(0, event["days"])) {
    event["move"].push(new Array(event["crews"].length).fill(null));
    event["back"].push(new Array(event["crews"].length).fill(null));
    event["skip"].push(new Array(event["crews"].length).fill(false));
    event["completed"].push(new Array(event["div_size"][0].length).fill(false));
  }

  let all = "";

  for (const r of event["results"]) {
    all = all + r;
  }

  const pat = /r|t|u|o[0-9]+|e-?[0-9]+|v-?[0-9]+|w[0-9]+|x|d\([^\)]*\)|p/g;

  const unknown = all.replace(pat, "").replace(/\s/g, "");

  if (unknown !== "") {
    errors.push(`Unrecognised result codes: ${unknown}`);
  }

  const m = all.match(pat);

  if (m === null) {
    return { event: event as ProcessedEvent, errors };
  }

  let dayNum = 0;
  let divNum = event["div_size"][dayNum].length - 1;
  let crewNum = event["crews"].length - 1;
  let divHead = crewNum - event["div_size"][dayNum][divNum] + 1;
  let penalty = 0;
  let move = null;

  // Stop processing, recording where in the results the problem occurred.
  const fail = (error: string) => {
    errors.push(`Day ${dayNum + 1}, division ${divNum + 1}: ${error}`);
    return { event: event as ProcessedEvent, errors };
  };

  for (const c of m) {
    move = event["move"][dayNum];
    let back = event["back"][dayNum];

    if (debug) {
      console.log(
        `New command:${c} (day:${dayNum} div:${divNum} crew:${crewNum} divHead:${divHead})`,
      );
    }

    // Only allow division size changes between full days of racing, and not before the first day
    if (c[0] === "d" && crewNum === -1 && dayNum < event["days"] - 1) {
      const sizes = c
        .replace("(", " ")
        .replace(")", " ")
        .replace(/\./g, " ")
        .trim()
        .split(" ")
        .slice(1)
        .map((x) => Number(x));

      if (debug) {
        console.log(`Div size change: ${sizes}`);
      }

      if (sizes.length === event["div_size"][0].length) {
        let num = 0;

        for (const s of sizes) {
          num += s;
        }

        if (num === event["crews"].length - event["crews_withdrawn"]) {
          for (const day of range(dayNum + 1, event["days"], 1)) {
            event["div_size"][day] = sizes;
          }
        }
      }

      continue;
    }

    while (crewNum >= divHead && move[crewNum] !== null) {
      if (debug) {
        console.log(`Skipping crew:${crewNum}, got ${move[crewNum]}`);
      }

      crewNum = crewNum - 1;
    }

    if (crewNum < divHead) {
      if (divNum === 0) {
        dayNum += 1;

        if (dayNum === event["days"]) {
          errors.push(
            "Run out of days of racing with more results still to go",
          );
          return { event: event as ProcessedEvent, errors };
        }

        if (debug) {
          console.log(`Moving to day ${dayNum}`);
        }

        const checkErrors = checkResults(event, back, 0);

        if (checkErrors.length > 0) {
          // dayNum has already advanced, so it is the 1-based previous day.
          errors.push(...checkErrors.map((e) => `Day ${dayNum}: ${e}`));
          return { event: event as ProcessedEvent, errors };
        }

        move = event["move"][dayNum];
        back = event["back"][dayNum];
        divNum = event["div_size"][dayNum].length - 1;
        crewNum = event["crews"].length - 1 - event["crews_withdrawn"];
        divHead = crewNum - event["div_size"][dayNum][divNum] + 1;
      } else {
        divNum -= 1;
        crewNum += 1;
        divHead -= event["div_size"][dayNum][divNum];
      }

      if (debug) {
        console.log(`Moving to division ${divNum}`);
      }
    }

    if (debug) {
      console.log(
        `Processing command:${c} (day:${dayNum} div:${divNum} crew:${crewNum} divHead:${divHead}) pos:${
          crewNum - divHead + 1
        }`,
      );
    }

    if (c === "r") {
      if (back[crewNum] === null) {
        back[crewNum] = crewNum;
        move[crewNum] = 0;
      }

      crewNum = crewNum - 1;

      if (debug) {
        console.log(`Rowover, moving to crew ${crewNum}`);
      }
    } else if (c === "u") {
      const error = processBump(move, back, crewNum, 1, divHead);

      if (error !== null) {
        return fail(error);
      }

      crewNum = crewNum - 2;

      if (debug) {
        console.log(`Bumped up, moving to crew ${crewNum}`);
      }
    } else if (c.startsWith("o")) {
      const up = Number(c.slice(1));

      const error = processBump(move, back, crewNum, up, divHead);

      if (error !== null) {
        return fail(error);
      }

      crewNum = crewNum - 1;

      if (debug) {
        console.log(`Overbumped ${up}, moving to crew ${crewNum}`);
      }
    } else if (c.startsWith("e") || c.startsWith("v")) {
      const up = Number(c.slice(1));

      let p = null;

      if (move[crewNum] === null) {
        p = crewNum;
        move[crewNum] = 0;
      } else {
        p = back[crewNum];
      }

      if (p === null) {
        return fail(
          `Result ${c} applied to crew that can't be found in position ${crewNum + 1}`,
        );
      }

      move[p]! += up;
      back[crewNum - up] = p;

      if (penalty !== 0) {
        if (debug) {
          console.log(`Applying penalty ${penalty} to crew ${crewNum - up}`);
        }

        const error = processChain(move, back, crewNum - up, penalty);

        if (error !== null) {
          return fail(error);
        }

        penalty = 0;
      }

      crewNum = crewNum - 1;

      if (debug) {
        console.log(
          `Exact move ${up} to crew ${p}, was ${move[p]! - up} now ${
            move[p]
          }, moving to crew ${crewNum}`,
        );
      }

      if (c.startsWith("v")) {
        if (debug) {
          console.log(`Virtual result, crew ${p} didn't race`);
        }

        event["skip"][dayNum][p] = true;
      }
    } else if (c.startsWith("w")) {
      const size = Number(c.slice(1));

      if (crewNum - size < divHead) {
        return fail(
          `Washing machine of size ${size} goes above the head of the division at position ${divHead + 1}`,
        );
      }

      if (debug) {
        console.log(`Washing machine, crew ${crewNum}, size ${size}`);
      }

      const error = processChain(move, back, crewNum - size, size);

      if (error !== null) {
        return fail(error);
      }

      crewNum = crewNum - (size + 1);
    } else if (c === "x") {
      if (debug) {
        console.log(`Crew ${crewNum} withdrawn, moving to crew ${crewNum - 1}`);
      }

      event["crews_withdrawn"] += 1;

      // Work out original crew number
      let cn = crewNum;
      let dn = dayNum - 1;

      while (dn >= 0) {
        cn = event["back"][dn][cn]!;
        dn -= 1;
      }

      event["crews"][cn]["withdrawn"] = true;
      crewNum -= 1;
      event["div_size"][dayNum][divNum] -= 1;

      for (const day of range(dayNum + 1, event["days"])) {
        event["div_size"][day][divNum] = event["div_size"][dayNum][divNum];
      }
    } else if (c === "t") {
      for (const i of range(divHead, crewNum + 1)) {
        if (move[i] === null) {
          move[i] = 0;
        }

        if (back[i] === null) {
          back[i] = i;
        }
      }

      if (debug) {
        console.log(
          `Skipping division, setting crew from ${crewNum} to divHead - 1 ${
            divHead - 1
          }`,
        );
      }

      crewNum = divHead - 1;
      continue;
    } else if (c === "p") {
      penalty += 1;

      if (debug) {
        console.log(
          `Storing ${penalty} penalty bump to apply to crew ${crewNum}`,
        );
      }
    }

    // If we've seen at least one result, mark the division as completed
    if (debug) {
      console.log(`Marking day ${dayNum} division ${divNum} has completed`);
    }

    event["completed"][dayNum][divNum] = true;
  }

  if (
    move === null &&
    all === "" &&
    event["pace"].length === event["crews"].length &&
    event["div_size"][dayNum].length === 1
  ) {
    // TODO: Generate results by pace
  }

  if (move === null) {
    return { event: event as ProcessedEvent, errors };
  }

  /*   if (checkResults(event, back, divHead).length > 0) {
    return;
  } */

  if (dayNum === event["days"] - 1 && crewNum === -1) {
    if (debug) {
      console.log("Completed all divisions & days");
    }

    event["full_set"] = true;
  }

  for (const crewNum of range(0, event["crews"].length)) {
    let nc = crewNum;
    let gain = 0;
    let blades = true;
    let finished = true;

    for (const day of range(0, event["days"])) {
      let m = event["move"][day][nc];

      if (m === null) {
        event["crews"][crewNum]["gain"] = null;
        finished = false;
        break;
      }

      gain = gain + m;

      if (m <= 0 || event["skip"][day][nc]) {
        blades = false;
      } else {
        let found = false;

        for (const swap of range(nc - 1, -1, -1)) {
          if (
            !event["skip"][day][swap] &&
            event["move"][day][swap] !== null &&
            swap - event["move"][day][swap]! > nc - m
          ) {
            found = true;
            break;
          }
        }

        if (!found) {
          blades = false;
        }
      }

      nc = nc - m;
    }

    // Winning the Headship earns Blades unconditionally. Events flagged
    // skip_headship aren't the last of their year, so they don't decide it.
    if (nc === 0 && !event["flags"].includes("skip_headship")) {
      blades = true;
    }

    if (!event["crews"][crewNum]["withdrawn"]) {
      event["crews"][crewNum]["gain"] = gain;
      event["crews"][crewNum]["blades"] = blades;
      event["crews"][nc]["end"] = event["crews"][crewNum]["start"];
      event["crews"][nc]["club_end"] = event["crews"][crewNum]["club"];
    }
  }

  return { event: event as ProcessedEvent, errors };
}

function checkResults(
  event: Event,
  back: (number | null)[],
  head: number,
): string[] {
  const results: (number | null)[] = [];
  const errors: string[] = [];

  for (const i of range(0, event["crews"].length)) {
    const b = back[i];

    if (
      b === null &&
      i < event["crews"].length - event["crews_withdrawn"]! &&
      i >= head
    ) {
      errors.push(`No crew finishes in position ${i + 1}`);
    } else if (
      b !== null &&
      (i < head || i >= event["crews"].length - event["crews_withdrawn"]!)
    ) {
      errors.push(
        `A crew finished in position ${i + 1} where none was expected`,
      );
    } else {
      if (b !== null && results.includes(b)) {
        errors.push(
          `Got two crews starting from position ${
            b + 1
          }, second ending position ${i + 1}`,
        );
      }

      results.push(back[i]);
    }
  }

  return errors;
}

export function writeWeb(sets: Event[]) {
  const series: Record<
    string,
    Partial<Record<"all" | "split" | "Men" | "Women", string[]>>
  > = {};

  for (const s of sets) {
    if (!(s["short"] in series)) {
      series[s["short"]] = { all: [], split: [] };
    }

    if (!(s["gender"] in series[s["short"]])) {
      series[s["short"]][s["gender"]] = [];
    }

    let year = s["year"];
    let p = year.split(" ");

    if (p.length > 1) {
      year = p[0];

      if (!series[s["short"]]["split"]!.includes(year)) {
        series[s["short"]]["split"]!.push(year);
      }
    }

    if (!series[s["short"]][s["gender"]]!.includes(year)) {
      series[s["short"]][s["gender"]]!.push(year);
    }

    if (!series[s["short"]]["all"]!.includes(year)) {
      series[s["short"]]["all"]!.push(year);
    }
  }

  return series;
}

export function stepOn(event: Readonly<Event>) {
  const newEvent: Event = structuredClone(event);

  // Operate entirely on the cloned crews so the caller's event is untouched.
  const crews = newEvent.crews;
  const newlist: (Crew | null)[] = Array(crews.length).fill(null);

  for (const i of range(0, crews.length)) {
    const crew = crews[i];

    if (crew.gain !== null) {
      const ep = i - crew.gain;

      if (newlist[ep] === null) {
        crew.gain = null;
        crew.blades = false;
        crew.highlight = false;
        crew.withdrawn = false;
        crew.end = null;

        newlist[ep] = crew;
      }
    }
  }

  // Renumber once, in original starting order. newlist holds the same crew
  // references, so this also updates the crews in their new positions.
  const clubs: Record<string, number> = {};

  for (const c of crews) {
    if (!(c.club in clubs)) {
      clubs[c.club] = 1;
    }

    c.number = clubs[c.club];
    clubs[c.club] += 1;

    if (c.number < abbreviations.roman.length) {
      c.num_name = `${c.club} ${abbreviations.roman[c.number - 1]}`;
    } else {
      c.num_name = `${c.club} ${c.number}`;
    }

    if (c.number > 1) {
      c.start = c.num_name;
    } else {
      c.start = c.club;
    }
  }

  // Crews without a finishing position (e.g. withdrawn) don't carry over.
  newEvent.crews = newlist.filter((crew): crew is Crew => crew !== null);

  const year = parseInt(event["year"], 10);
  newEvent.year = Number.isNaN(year) ? `${event.year}.next` : String(year + 1);

  newEvent["move"] = [];
  newEvent["completed"] = [];
  newEvent["skip"] = [];
  newEvent["full_set"] = false;

  newEvent["results"] = [];

  return newEvent;
}

export function writeString(event: Event): string {
  let out = "";

  out += `Set,${event["set"]}\n`;
  out += `Short,${event["short"]}\n`;

  out += `Gender,${event["gender"]}\n`;

  out += `Year,${event["year"]}\n`;

  if (event["days"] !== 4) {
    out += `Days,${event["days"]}\n`;
  }

  out += "\n";

  let abbrev: Record<
    string,
    {
      name: string;
    }
  > = {};

  if (event["set"] in abbreviations.sets) {
    abbrev = abbreviations.sets[event["set"]];
  }

  let crew_num = 0;

  if (event["div_size"] === null) {
    return "";
  }

  for (const div_size of event["div_size"][event["div_size"].length - 1]) {
    out += "Division";

    for (const i of range(0, div_size)) {
      const crew = event["crews"][crew_num + i];

      let found = false;

      for (const p in abbrev) {
        if (crew["club"] === abbrev[p]["name"]) {
          let fin = p;

          if (crew["number"] > 1) {
            fin += String(crew["number"]);
          }

          out += `,${fin}`;

          found = true;
          break;
        }
      }

      if (!found) {
        if (crew["number"] === 1) {
          out += `,${crew["club"]}`;
        } else {
          out += `,${crew["club"]} ${crew["number"]}`;
        }
      }
    }

    out += "\n";
    crew_num += div_size;
  }

  out += "\n";
  out += "Results\n";

  if (event["results"].length > 0) {
    for (const i of event["results"]) {
      out += `${i}\n`;
    }
  }

  return out;
}
