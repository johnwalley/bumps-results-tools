import * as abbreviations from "./abbreviations";

import { EventSchema, type Crew, type Event } from "./types";

import type { BunFile } from "bun";
import { range } from "./utils";
import { z } from "zod";

function addCrew(
  crewState: any,
  crews: Event["crews"],
  str: string,
  abbrev: Record<string, { name: string }>,
  roman = true,
) {
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

  if (!("pat" in crewState)) {
    crewState["pat"] = /^(.*?)(\([^\)]*\))?[ ]*([0-9]*)(\*)?$/;
  }

  let m = str.match(crewState["pat"]);

  if (m === null) {
    console.log(`Can't understand crew name ${str}`);
    return false;
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

  if (num !== crewState[club] && escape !== "*" && club.length > 0) {
    // TODO: Sometimes it's legitimate to have a crew out of order, e.g. Town Bumps 1868,
    /*     console.log(
      `Club ${club} crews out of order (found ${num}, expecting ${crewState[club]})`,
    );

    return false; */
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

  return true;
}

function swapCrews(
  move: (number | null)[],
  back: (number | null)[],
  posA: number,
  posB: number,
) {
  let origA = back[posA];

  if (origA === null) {
    origA = posA;

    if (move[origA] !== null) {
      console.log(`Crew ${origA + 1} not expected to have a result`);
      return false;
    }

    move[origA] = 0;
  }

  let origB = back[posB];

  if (origB === null) {
    origB = posB;

    if (move[origB] !== null) {
      console.log(`Crew ${origB + 1} not expecting to have a result`);
      return false;
    }

    move[origB] = 0;
  }

  move[origA]! -= posB - posA;
  move[origB]! += posB - posA;

  back[posA] = origB;
  back[posB] = origA;

  return true;
}

function processBump(
  move: (number | null)[],
  back: (number | null)[],
  crewNum: number,
  up: number,
  divHead: number,
) {
  if (crewNum - up < divHead) {
    console.log(
      `Crew ${
        crewNum + 1
      }  bumps up above the top of the division at position ${divHead + 1}`,
    );

    return false;
  }

  if (move[crewNum - up] !== null) {
    console.log(
      `Crew ${crewNum + 1} is bumping a crew at position ${
        crewNum - up + 1
      } that has already got a result`,
    );

    return false;
  }

  return swapCrews(move, back, crewNum, crewNum - up);
}

function processChain(
  move: (number | null)[],
  back: (number | null)[],
  crewNum: number,
  num: number,
) {
  for (const i in range(0, num)) {
    if (!swapCrews(move, back, crewNum, crewNum + 1)) {
      return false;
    }

    crewNum += 1;
  }

  return true;
}

export async function readFile(path?: string): Promise<Event | null> {
  let abbrev: any = {};
  const crewState = {};
  const time = /([0-9]*):([0-9][0-9](\.[0-9]+)*)/;

  let file: BunFile;

  if (path) {
    file = Bun.file(path);
  } else {
    file = Bun.stdin;
  }

  const input = (await file.text()).split(/\r?\n/);

  const ret: any = {
    set: "Set name",
    short: "Short name",
    gender: "Gender",
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
      ret["set"] = p[1];

      if (ret["set"] in abbreviations.sets) {
        abbrev = (abbreviations.sets as any)[ret["set"]];
      }
    } else if (p[0] === "Short") {
      ret["short"] = p[1];
    } else if (p[0] === "Gender") {
      ret["gender"] = p[1];
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
          if (
            !addCrew(
              crewState,
              ret["crews"],
              i,
              abbrev,
              ret["short"] !== "Town",
            )
          ) {
            console.log(ret.short, ret.year);
            return null;
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

  if (!ret.crews) {
    ret.crews = [];
    console.log(ret.crews.length);
  }

  try {
    return EventSchema.parse(ret);
  } catch (err) {
    if (err instanceof z.ZodError) {
      console.log(err.issues);
    }

    return null;
  }
}

export function processResults(event: Event, debug = false) {
  if (event["div_size"] === null || event["crews"].length === 0) {
    return;
  }

  event["move"] = [];
  event["back"] = [];
  event["completed"] = [];
  event["skip"] = [];

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

  const m = all.match(pat);

  if (m === null) {
    return;
  }

  let dayNum = 0;
  let divNum = event["div_size"][dayNum].length - 1;
  let crewNum = event["crews"].length - 1;
  let divHead = crewNum - event["div_size"][dayNum][divNum] + 1;
  event["crews_withdrawn"] = 0;
  let penalty = 0;
  let move = null;

  for (const c of m) {
    move = event["move"][dayNum];
    let back = event["back"][dayNum];

    if (debug) {
      console.log(
        `New command:${c} (day:${dayNum} div:${divNum} crew:${crewNum} divHead:${divHead})`,
      );
    }

    if (c[0] === "d" && crewNum === -1 && dayNum < event["days"] - 1) {
      let sizes: any[] = c
        .replace("(", " ")
        .replace(")", " ")
        .replace(/\./g, " ")
        .trim()
        .split(" ")
        .slice(1);

      sizes = sizes.map((x) => Number(x));

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
          console.log(
            "Run out of days of racing with more results still to go",
          );
          return;
        }

        if (debug) {
          console.log(`Moving to day ${dayNum}`);
        }

        if (!checkResults(event, move, back, 0, debug)) {
          return;
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
      if (!processBump(move, back, crewNum, 1, divHead)) {
        return;
      }

      crewNum = crewNum - 2;

      if (debug) {
        console.log(`Bumped up, moving to crew ${crewNum}`);
      }
    } else if (c.startsWith("o")) {
      const up = Number(c.slice(1));

      if (!processBump(move, back, crewNum, up, divHead)) {
        return;
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
        console.log(back, back[crewNum]);
        console.log(
          `Result ${c} applied to crew that can't be found in position ${crewNum}`,
        );

        return;
      }

      move[p]! += up;
      back[crewNum - up] = p;

      if (penalty !== 0) {
        if (debug) {
          console.log(`Applying penalty ${penalty} to crew ${crewNum - up}`);
        }

        if (!processChain(move, back, crewNum - up, penalty)) {
          return;
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
        console.log(
          `Washing machine size ${size} get above head of division ${divHead}`,
        );

        return;
      }

      if (debug) {
        console.log(`Washing machine, crew ${crewNum}, size ${size}`);
      }

      if (!processChain(move, back, crewNum - size, size)) {
        return;
      }

      crewNum = crewNum - (size + 1);
    } else if (c === "x") {
      if (debug) {
        console.log(`Crew ${crewNum} withdrawn, moving to crew ${crewNum - 1}`);
      }

      event["crews_withdrawn"] += 1;

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
    return;
  }

  /*   if (!checkResults(event, move, back, divHead, debug)) {
    return;
  } */

  event["full_set"] = false;

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

    // TODO: Check this logic
    if (nc === 0 && !("skip_headship" in event["flags"])) {
      blades = true;
    }

    if (!event["crews"][crewNum]["withdrawn"]) {
      event["crews"][crewNum]["gain"] = gain;
      event["crews"][crewNum]["blades"] = blades;
      event["crews"][nc]["end"] = event["crews"][crewNum]["start"];
      event["crews"][nc]["club_end"] = event["crews"][crewNum]["club"];
    }
  }
}

function checkResults(
  event: Event,
  move: (number | null)[],
  back: (number | null)[],
  head: number,
  debug: boolean,
) {
  const results: (number | null)[] = [];
  let ret = true;

  for (const i of range(0, event["crews"].length)) {
    const b = back[i];

    if (
      b === null &&
      i < event["crews"].length - event["crews_withdrawn"]! &&
      i >= head
    ) {
      console.log(`Error: no crew finishes in position ${i + 1}`);
      ret = false;
    } else if (
      b !== null &&
      (i < head || i >= event["crews"].length - event["crews_withdrawn"]!)
    ) {
      console.log(
        `Error: a crew finished in position ${i + 1} where none was expected`,
      );
    } else {
      if (b !== null && results.includes(b)) {
        console.log(
          `Error: got two crews starting from position ${
            b + 1
          }, second ending position ${i + 1}`,
        );

        ret = false;
      }

      results.push(back[i]);
    }
  }

  return ret;
}

function writeWeb(sets: Event[]) {
  const series: any = {};

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

      if (!(year in series[s["short"]]["split"])) {
        series[s["short"]]["split"].push(year);
      }
    }

    if (!(year in series[s["short"]][s["gender"]])) {
      series[s["short"]][s["gender"]].push(year);
    }

    if (!(year in series[s["short"]]["all"])) {
      series[s["short"]]["all"].push(year);
    }
  }

  return series;
}
