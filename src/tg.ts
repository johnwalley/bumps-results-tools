import { Event, Gender, Set } from "./types";
import { calculateResults, calculateTorpidsResults } from "./util";

export function read_tg(text: string): Event {
  const input = text.split("\n");

  const eventResults: string[] = [];

  let event: Event = {
    set: Set.EIGHTS,
    small: "ERROR",
    gender: Gender.MEN,
    result: "",
    year: 1970,
    days: 4,
    divisions: [],
    results: "",
    move: [],
    finish: [],
    completed: [],
  };

  let curdiv: string[] = [];
  let inresults = 0;
  let indivision = 0;

  for (let i = 0; i < input.length; i++) {
    const m = input[i].split(",");
    if (m[0] === "Set") {
      if (m.length > 1) {
        event.set = m[1] as Set;
      }
    } else if (m[0] === "Short") {
      event.small = m[1];
    } else if (m[0] === "Gender") {
      event.gender = m[1] as Gender;
    } else if (m[0] === "Year") {
      const year = parseInt(m[1], 10);
      if (!isNaN(year)) {
        event.year = year;
      }
    } else if (m[0] === "Days") {
      event.days = parseInt(m[1], 10);
    } else if (m[0] === "Division") {
      indivision = 1;

      if (curdiv.length > 0) {
        event.divisions.push(curdiv);
        curdiv = [];
      }
      for (let j = 1; j < m.length; j++) {
        addcrew(curdiv, m[j]);
      }
    } else if (m[0] === "Results") {
      inresults = 1;

      if (curdiv.length > 0) {
        event.divisions.push(curdiv);
        curdiv = [];
      }

      for (let j = 1; j < m.length; j++) {
        if (m[j].indexOf("#") !== 0) {
          Array.prototype.push.apply(eventResults, m[j].split(" "));
        }
      }
    } else {
      for (let j = 0; j < m.length; j++) {
        if (inresults === 1 && m[j].indexOf("#") !== 0) {
          Array.prototype.push.apply(eventResults, m[j].split(" "));
        } else if (indivision === 1) {
          addcrew(curdiv, m[j]);
        }
      }
    }
  }

  const results: string[][] = [];

  for (let i = 0; i < event.days; i++) {
    results.push([]);
  }

  eventResults
    .filter((r) => r !== "")
    .map((r, i) =>
      results[Math.floor(i / event.divisions.length)].push(r.trim()),
    );

  event.results = results
    .filter((r) => r.length > 0)
    .map((r) => r.join(" "))
    .join("\n");

  if (curdiv.length > 0) {
    event.divisions.push(curdiv);
  }

  for (let i = 0; i < event.days; i++) {
    const mday = new Array(event.divisions.length);
    const cday = [];

    for (let d = 0; d < event.divisions.length; d++) {
      const mdd = new Array(event.divisions[d].length);
      for (let c = 0; c < event.divisions[d].length; c++) {
        mdd[c] = 0;
      }

      mday[d] = mdd;
      cday.push(false);
    }

    event.move.push(mday);
    event.completed.push(cday);
  }

  processResults(event);

  event =
    event.set === "Torpids"
      ? calculateTorpidsResults(event)
      : calculateResults(event);

  return event;
}

export function write_tg(event: Event) {
  let ret = `Set,${event.set}
Short,${event.small}
Gender,${event.gender}
Year,${event.year}
`;

  if (event.days !== 4) {
    ret += `Days,${event.days}
`;
  }

  if (event.divisions.length > 0) {
    ret += `
`;
  }

  for (let div = 0; div < event.divisions.length; div++) {
    ret += "Division";
    for (let c = 0; c < event.divisions[div].length; c++) {
      const name = event.divisions[div][c];
      ret += `,${name}`;
    }
    ret += `
`;
  }

  if (event.results.length > 0) {
    ret += `
Results
${event.results}
`;
  }

  return ret;
}

function processResults(event: Event): void {
  const res = event.results.match(/r|t|u|o[0-9]*|e-?[0-9]*/g);

  if (res === null) {
    return;
  }

  let dayNum = 0;
  let divNum = 0;
  let crew = 0;
  let move: number[][] | null = null;

  for (let i = 0; i < res.length; i++) {
    while (
      move != null &&
      crew <= move[divNum - 1].length &&
      crew > 0 &&
      move[divNum - 1][crew - 1] !== 0
    ) {
      crew = crew - 1;
    }

    if (crew === 0) {
      if (res[i] === "t") {
        continue;
      }

      if (divNum <= 1) {
        if (dayNum === event.days) {
          console.error(
            "Run out of days of racing with more results still to go",
          );
          return;
        }
        move = event.move[dayNum];
        dayNum += 1;
        divNum = event.divisions.length + 1;
      }

      divNum--;
      if (move === null) {
        console.error("No move found");
        return;
      }
      crew = move[divNum - 1].length;
      if (divNum < event.divisions.length) {
        crew++; // Sandwich crew
      }
    }

    if (move === null) {
      console.error("No move found");
      return;
    }

    event.completed[dayNum - 1][divNum - 1] = true;

    if (res[i] === "r") {
      // rowover
      crew--;
    } else if (res[i] === "u") {
      // bump up
      if (!processBump(move, divNum, crew, 1)) {
        return;
      }

      crew -= 2;
    } else if (res[i].indexOf("o") === 0) {
      // overbump
      const up = parseInt(res[i].substring(1), 10);
      if (!processBump(move, divNum, crew, up)) {
        return;
      }

      crew--;
    } else if (res[i].indexOf("e") === 0) {
      // TODO: Support two digit numbers
      // exact move
      const up = parseInt(res[i].substring(1), 10);

      if (crew > move[divNum - 1].length) {
        // sandwich crew, need to find where it started
        for (let p = 0; p < move[divNum].length; p++) {
          if (p - move[divNum][p] == 0) {
            move[divNum][p] += up;
            break;
          }
        }
      } else {
        move[divNum - 1][crew - 1] = up;
      }

      crew--;
    } else if (res[i] === "t") {
      crew = 0;
    }
  }

  for (let div = 0; div < event.divisions.length; div++) {
    event.finish.push(new Array(event.divisions[div].length));
  }

  for (let div = 0; div < event.divisions.length; div++) {
    for (let crewPos = 0; crewPos < event.divisions[div].length; crewPos++) {
      let d = div;
      let c = crewPos;
      for (let m = 0; m < event.days; m++) {
        c = c - event.move[m][d][c];

        while (c < 0) {
          d--;
          c += event.move[m][d].length;
        }
        while (c >= event.move[m][d].length) {
          c -= event.move[m][d].length;
          d++;
        }
      }

      event.finish[d][c] = event.divisions[div][crewPos];
    }
  }
}

function processBump(
  move: number[][],
  divNum: number,
  crew: number,
  up: number,
): boolean {
  if (crew - up < 1) {
    console.error(
      "Bumping up above the top of the division: div " +
        divNum +
        ", crew " +
        crew +
        ", up " +
        up,
    );
    return false;
  }

  if (move[divNum - 1][crew - 1 - up] !== 0) {
    console.error("Bumping a crew that has already got a result");
    return false;
  }

  move[divNum - 1][crew - 1 - up] = -up;
  if (crew > move[divNum - 1].length) {
    // sandwich crew, need to find where it started
    for (let p = 0; p < move[divNum].length; p++) {
      if (p - move[divNum][p] == 0) {
        move[divNum][p] += up;
        break;
      }
    }
  } else {
    move[divNum - 1][crew - 1] = up;
  }

  return true;
}

function addcrew(div: string[], crew: string): void {
  if (crew.length === 0) {
    return;
  }

  div.push(crew);
}
