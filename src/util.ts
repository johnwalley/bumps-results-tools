import { findKey, uniq, padEnd, padStart } from "lodash";
import * as d3 from "d3";
import { Event, Gender, Set } from "./types";

import {
  ROMAN,
  abbrevCamCollege,
  abbrevCamTown,
  abbrevOxCollege,
} from "./constants";

export type InternalEvent = {
  crews: {
    name: string;
    values: {
      day: number;
      pos: number;
    }[];
    valuesSplit: unknown[];
  }[];
  divisions: {
    start: number;
    size: number;
  }[];
  year: number;
};

function abbreviate(event: Event) {
  for (let div = 0; div < event.divisions.length; div++) {
    for (let pos = 0; pos < event.divisions[div].length; pos++) {
      event.divisions[div][pos] = abbreviateCrew(
        event.divisions[div][pos],
        event.set
      );
    }
  }

  for (let div = 0; div < event.finish.length; div++) {
    for (let pos = 0; pos < event.finish[div].length; pos++) {
      event.finish[div][pos] = abbreviateCrew(
        event.finish[div][pos],
        event.set
      );
    }
  }

  return event;
}

function abbreviateCrew(crew: string, set: Set) {
  const name = crew.replace(/[0-9]+$/, "").trim();
  const num = +crew.substring(name.length);
  let abbrev;

  switch (set) {
    case Set.LENTS:
    case Set.MAYS:
      abbrev = abbrevCamCollege;
      break;
    case Set.TORPIDS:
    case Set.EIGHTS:
      abbrev = abbrevOxCollege;
      break;
    case Set.TOWN:
      abbrev = abbrevCamTown;
      break;
    default:
      throw "Unrecognised set: " + set;
  }

  const key = findKey(abbrev, (club: string) => club === name);

  if (key !== undefined && set !== Set.TOWN) {
    return key + (num > 1 ? num : "");
  } else {
    return crew;
  }
}

function expandCrew(crew: string, set: Set) {
  const name = crew.replace(/[0-9]+$/, "").trim();
  const num = +crew.substring(name.length);
  let abbrev: Record<string, string>;

  switch (set) {
    case Set.LENTS:
    case Set.MAYS:
      abbrev = abbrevCamCollege;
      break;
    case Set.TORPIDS:
    case Set.EIGHTS:
      abbrev = abbrevOxCollege;
      break;
    case Set.TOWN:
      abbrev = abbrevCamTown;
      break;
    default:
      throw "Unrecognised set: " + set;
  }

  if (abbrev.hasOwnProperty(name)) {
    return abbrev[name] + (num > 1 ? num : "");
  } else {
    return crew;
  }
}

function renderName(name: string, set: Set) {
  // College crews are stored as an abbrevation and we replace the number with Roman numerals
  const sh = name.replace(/[0-9]+$/, "").trim();
  let abbrev: Record<string, string>;
  let type;

  switch (set) {
    case Set.LENTS:
    case Set.MAYS:
      abbrev = abbrevCamCollege;
      type = "college";
      break;
    case Set.TORPIDS:
    case Set.EIGHTS:
      abbrev = abbrevOxCollege;
      type = "college";
      break;
    case Set.TOWN:
      abbrev = abbrevCamTown;
      type = "town";
      break;
    default:
      return name;
  }

  if (abbrev.hasOwnProperty(sh)) {
    const num = name.substring(sh.length);
    name = abbrev[sh];

    if (type === "college" && num.length > 0) {
      name = name + " " + ROMAN[+num - 1];
    } else if (type === "town" && num.length > 0 && +num > 1) {
      name = name + " " + +num;
    }

    return name;
  } else {
    // First boats should not have a number rendered
    if (type === "college") {
      const num = name.substring(sh.length);

      if (num.length > 0) {
        name = sh.trim() + (+num > 1 ? " " + ROMAN[+num - 1] : "");
      }

      return name;
    }
  }

  return name;
}

function normalizeOxfordName(name: string) {
  const parts = name.split(/\s/);
  let newName = name;

  ROMAN.forEach((num: string, index: number) => {
    if (parts[parts.length - 1] === num) {
      newName = parts.slice(0, parts.length - 1).join(" ") + " " + (index + 1);
    }
  });

  return newName;
}

function normalizeTownName(name: string) {
  return name;
}

function crewColor(name: string) {
  const camCollegeColor: Record<string, string> = {
    A: "#0000ff",
    AR: "#ffff00",
    Ca: "#afe9c6",
    CC: "#800000",
    CH: "#ffff00",
    Cl: "#ffff00",
    Cr: "#000080",
    CT: "##ffff00",
    Cu: "#ff55dd",
    D: "#d400aa",
    Dw: "#000080",
    E: "#eeaaff",
    F: "#808080",
    G: "#005500",
    H: "#000000",
    HH: "#0096ff",
    HHL: "#0044aa",
    J: "#8b0000",
    K: "#5a2ca0",
    L: "#ff0000",
    LC: "#0044aa",
    M: "#672178",
    ME: "#000000",
    N: "#010040",
    NH: "#000000",
    Pb: "#afe9dd",
    Ph: "#003380",
    Q: "#008001",
    QM: "#808080",
    R: "#007fff",
    S: "#f9cc00",
    SC: "#9d0064",
    SE: "#0300fd",
    SS: "#000080",
    T: "#000080",
    TC: "#000000",
    TH: "#000000",
    VS: "#000000",
    W: "#5599ff",
  };

  const oxCollegeColor: Record<string, string> = {
    Oriel: "#372e63",
  };

  const townColor: Record<string, string> = {
    City: "#f44336",
    Champs: "#f57400",
    "Rob Roy": "#8b0000",
    Cantabs: "#00008b",
    99: "#5197ff",
    Chesterton: "#ffff00",
    Simoco: "#ffff00",
    Pye: "#ffff00",
    "St Neots": "#b9dcff",
    "X-Press": "#000000",
    "Camb Blue": "#000000",
    "Free Press": "#000000",
    "St Radegund": "#ffff00",
    "Camb Veterans": "#91b9a4",
    "Isle of Ely": "#9ed5b8",
    "Max Entropy": "#f44336",
    "St Ives": "#e90000",
    Sharks: "#e90000",
  };

  const sh = name.replace(/[0-9]/, "");

  if (camCollegeColor.hasOwnProperty(sh)) {
    return camCollegeColor[sh];
  }

  const club = name.substring(0, name.length - 2).trim();

  if (townColor.hasOwnProperty(club)) {
    return townColor[club];
  } else if (oxCollegeColor.hasOwnProperty(club)) {
    return oxCollegeColor[club];
  }

  return "#f44336";
}

function isBlades(positions: number[]) {
  for (let i = 0; i < positions.length - 1; i++) {
    if (positions[i + 1] - positions[i] >= 0 && positions[i + 1] !== 1) {
      return false;
    }
  }

  return true;
}

function isSpoons(
  positions: number[],
  bottomPosition = Number.MAX_SAFE_INTEGER
) {
  for (let i = 0; i < positions.length - 1; i++) {
    if (
      positions[i + 1] - positions[i] <= 0 &&
      positions[i + 1] !== bottomPosition
    ) {
      return false;
    }
  }

  return true;
}

function joinEvents(events: InternalEvent[], set: unknown, gender: unknown) {
  const years: number[] = [];
  const data: unknown[] = [];
  const divisions: {
    year: unknown;
    divisions: unknown[];
    startDay: number;
    numDays: number;
  }[] = [];
  let crewNames: string[] = [];
  let day = 0;

  events.forEach((event) => {
    const numDays = d3.max([
      ...event.crews.map((crew) => crew.values.length),
      5,
    ]) as number;
    crewNames = crewNames.concat(event.crews.map((crew) => crew.name));
    years.push(event.year);
    divisions.push({
      year: event.year,
      divisions: event.divisions.map((d) => ({
        start: d.start,
        size: d.size,
      })),
      startDay: day,
      numDays: numDays - 1,
    });

    day += numDays;
  });

  const startYear = d3.min(years);
  const endYear = d3.max(years);
  const uniqueCrewNames: string[] = uniq(crewNames);
  const maxCrews = d3.max(events.map((e) => e.crews.length));

  uniqueCrewNames.forEach((crewName) => {
    const newCrew: InternalEvent["crews"][number] = {
      name: crewName,
      values: [],
      valuesSplit: [],
    };

    day = 0;

    events.forEach((event) => {
      const match = event.crews.filter((c) => c.name === crewName);
      const numDays =
        (d3.max([
          ...event.crews.map((crew) => crew.values.length),
          5,
        ]) as number) - 1;

      if (match.length > 0) {
        const values = match[0].values.map((v) => ({
          day: v.day + day,
          pos: v.pos,
        }));

        for (let i = values.length; i <= numDays; i++) {
          values.push({ day: i + day, pos: -1 });
        }

        newCrew.values = newCrew.values.concat(values);

        const positions = match[0].values.map((v) => v.pos);

        const blades = isBlades(positions);
        const spoons = isSpoons(positions, event.crews.length);

        const valuesSplit = {
          name: crewName,
          day: day,
          blades: blades,
          spoons: spoons,
          values: values,
        };
        newCrew.valuesSplit.push(valuesSplit);
      } else {
        const emptyValues = [];
        for (let i = 0; i <= numDays; i++) {
          emptyValues.push({ day: i + day, pos: -1 });
        }

        newCrew.values = newCrew.values.concat(emptyValues);
      }

      day += numDays + 1;
    });

    data.push(newCrew);
  });

  return {
    set: set,
    gender: gender,
    crews: data,
    startYear: startYear,
    endYear: endYear,
    maxCrews: maxCrews,
    divisions: divisions,
  };
}

function transformData(event: Event) {
  if (event.days !== event.completed.length) {
    throw new RangeError(
      `Expected ${event.days} but found ${event.completed.length} completed days`
    );
  }

  let starty = 1;
  const crews = [];
  const divisions = [];
  for (let div = 0; div < event.divisions.length; div++) {
    divisions.push({ start: starty, size: event.divisions[div].length });

    for (let crew = 0; crew < event.divisions[div].length; crew++) {
      const position = [];
      let xpos = 0;
      let ypos = starty;

      position.push({ day: xpos, pos: ypos });

      let c = crew;
      let d = div;
      for (let m = 0; m < event.days; m++) {
        if (event.completed[m][d] === false) {
          break;
        }

        const up = event.move[m][d][c];
        xpos += 1;
        ypos -= up;
        position.push({ day: xpos, pos: ypos });

        c -= up;
        while (c < 0) {
          d--;
          c += event.divisions[d].length;
        }
        while (c >= event.divisions[d].length) {
          c -= event.divisions[d].length;
          d++;
        }
      }

      crews.push({ name: event.finish[d][c], values: position });
      starty += 1;
    }
  }

  return { year: event.year, crews: crews, divisions: divisions };
}

function calculateYearRange(
  current: { end: number; start: number } | null | undefined,
  data: { end: number; start: number },
  desiredWidth: number
) {
  let start;
  let end;

  if (current === null || current === undefined) {
    current = data;
  }

  if (current.end > data.end) {
    end = data.end;

    if (end - desiredWidth < data.start) {
      start = data.start;
    } else {
      start = end - desiredWidth;
    }
  } else {
    if (current.end < data.start) {
      if (data.start + desiredWidth > data.end) {
        end = data.end;
        start = data.start;
      } else {
        end = data.start + desiredWidth;
        start = data.start;
      }
    } else {
      end = current.end;

      if (end - desiredWidth < data.start) {
        start = data.start;

        if (start + desiredWidth > current.end) {
          end = Math.min(start + desiredWidth, data.end);
        }
      } else {
        start = end - desiredWidth;
      }
    }
  }

  return { start, end };
}

function calculateDivision(
  position: number,
  numDivisions: number,
  divisionBreaks: number[]
): number {
  for (let divNum = 0; divNum < numDivisions; divNum++) {
    if (position < divisionBreaks[divNum]) {
      return divNum;
    }
  }

  throw new Error("No division found");
}

function calculatePositionInDivision(
  position: number,
  numDivisions: number,
  divisionSizes: number[]
): number {
  for (let divNum = 0; divNum < numDivisions; divNum++) {
    if (position < divisionSizes[divNum]) {
      break;
    } else {
      position -= divisionSizes[divNum];
    }
  }

  return position;
}

function calculateDivisionBreaks(divisions: unknown[][]): number[] {
  const divisionSizes = divisions.map((d) => d.length);

  const divisionBreaks = divisionSizes.reduce((r: number[], a) => {
    if (r.length > 0) {
      a += r[r.length - 1];
    }

    r.push(a);
    return r;
  }, []);

  return divisionBreaks;
}

function calculateResults(event: Event): Event {
  let results = "";
  const move = event.move;
  const completed = event.completed;
  const numDivisions = event.divisions.length;

  for (let dayNum = 0; dayNum < event.days; dayNum++) {
    let sandwichSuccess = 0;

    for (let divNum = numDivisions - 1; divNum >= 0; divNum--) {
      completed[dayNum][divNum] = true;

      const m = move[dayNum][divNum].slice();

      if (divNum < numDivisions - 1) {
        m.push(sandwichSuccess);
      }

      let crew = m.length - 1;

      while (crew >= 0) {
        switch (m[crew]) {
          case 0:
            results += "r";
            break;
          case 1:
            if (crew === 0) {
              // Sandwich boat in next division
              results += "r";
            } else {
              if (m[crew - 1] !== -1) {
                // Not swapping places with crew above
                results += "e1";
              } else {
                // Swap places
                results += "u";
                crew -= 1;
              }
            }
            break;
          case 2:
            if (crew === 1) {
              // Sandwich boat in next division
              if (m[crew - 1] !== -1) {
                results += "e1";
              } else {
                results += "u";
                crew -= 1;
              }
            } else if (crew === 0) {
              // Top of division
              results += "r";
            } else {
              results += "e2";
            }
            break;
          case 3:
            if (m[crew - 3] !== -3) {
              if (crew === 0) {
                // Top of division
                results += "r";
              } else if (crew === 1) {
                // Sandwich boat in next division
                results += "u";
                crew -= 1;
              } else if (crew === 2) {
                // Sandwich boat in next division
                results += "e2";
              } else {
                // Not swapping places with crew three above
                results += "e3";
              }
            } else {
              // Overbump
              results += "o3";
            }
            break;
          case 4:
            if (crew === 1) {
              // Sandwich boat in next division
              results += "u";
              crew -= 1;
            } else if (crew === 3) {
              // Sandwich boat in next division
              results += "o3";
            } else {
              // Simple move
              results += "e4";
            }
            break;
          case 5:
            if (m[crew - 5] !== -5) {
              if (crew === 0) {
                // Top of division
                results += "r";
              } else if (crew === 1) {
                // Sandwich boat in next division
                results += "u";
                crew -= 1;
              } else if (crew === 2) {
                // Sandwich boat in next division
                results += "e2";
              } else {
                // Not swapping places with crew three above
                results += "e5";
              }
            } else {
              // Overbump
              results += "o5";
            }
            break;
          case 6:
            if (crew === 1) {
              // Sandwich boat in next division
              results += "u";
              crew -= 1;
            } else if (crew === 3) {
              // Sandwich boat in next division
              results += "o3";
            } else if (crew === 5) {
              // Sandwich boat in next division
              results += "o5";
            } else {
              // Simple move
              results += "e6";
            }
            break;
          case 7:
            if (m[crew - 7] !== -7) {
              if (crew === 0) {
                // Top of division
                results += "r";
              } else if (crew === 1) {
                // Sandwich boat in next division
                results += "u";
                crew -= 1;
              } else if (crew === 2) {
                // Sandwich boat in next division
                results += "e2";
              } else {
                // Not swapping places with crew three above
                results += "e7";
              }
            } else {
              // Triple overbump
              results += "o7";
            }
            break;
          case 8:
            if (crew === 1) {
              // Sandwich boat in next division
              results += "u";
              crew -= 1;
            } else if (crew === 3) {
              // Sandwich boat in next division
              results += "o3";
            } else if (crew === 5) {
              // Sandwich boat in next division
              results += "o5";
            } else if (crew === 7) {
              // Sandwich boat in next division
              results += "o7";
            } else {
              // Simple move
              results += "e8";
            }
            break;
          case 9:
            if (crew === 1) {
              // Sandwich boat in next division
              results += "u";
              crew -= 1;
            } else if (m[crew - 9] !== -9) {
              // Not swapping places with crew nine above
              results += "e9";
            } else {
              // Quadruple overbump
              results += "o9";
            }
            break;
          case 10:
            if (crew === 1) {
              // Sandwich boat in next division
              results += "u";
              crew -= 1;
            } else if (crew === 3) {
              // Sandwich boat in next division
              results += "o3";
            } else if (crew === 5) {
              // Sandwich boat in next division
              results += "o5";
            } else if (crew === 7) {
              // Sandwich boat in next division
              results += "o7";
            } else if (crew === 9) {
              // Sandwich boat in next division
              results += "o9";
            } else {
              // Simple move
              results += "e10";
            }
            break;
          case -1:
            // Should not get here if it's a simple position swap
            results += "e-1";
            break;
          case -2:
            results += "e-2";
            break;
          case -3:
            if (m[crew + 3] > 3 && crew === 0) {
              // Overbumped by crew which went on to be a successful sandwich boat
            } else if (crew + 3 === m.length) {
              // Overbumped by crew which was a successful sandwich boat
            } else if (m[crew + 3] !== 3) {
              // Not swapping places with crew three below
              results += "e-3";
            }
            break;
          case -4:
            results += "e-4";
            break;
          case -5:
            if (m[crew + 5] > 5 && crew === 0) {
              // Double overbumped by crew which went on to be a successful sandwich boat
            } else if (crew + 5 === m.length) {
              // Double overbumped by crew which was a successful sandwich boat
            } else if (m[crew + 5] !== 5) {
              // Not swapping places with crew five below
              results += "e-5";
            }
            break;
          case -6:
            results += "e-6";
            break;
          case -7:
            if (m[crew + 7] > 7 && crew === 0) {
              // Overbumped by crew which went on to be a successful sandwich boat
            } else if (crew + 7 === m.length) {
              // Overbumped by crew which was a successful sandwich boat
            } else if (m[crew + 7] !== 7) {
              // Not swapping places with crew seven below
              results += "e-7";
            }
            break;
          case -8:
            results += "e-8";
            break;
          case -9:
            if (m[crew + 9] > 9 && crew === 0) {
              // Overbumped by crew which went on to be a successful sandwich boat
            } else if (crew + 9 === m.length) {
              // Overbumped by crew which was a successful sandwich boat
            } else if (m[crew + 9] !== 9) {
              // Not swapping places with crew nine below
              results += "e-9";
            }
            break;
          case -10:
            results += "e-10";
            break;
          case -11:
            results += "e-11";
            break;
          case -12:
            results += "e-12";
            break;
        }

        crew -= 1;
      }

      sandwichSuccess = 0;
      crew = 0;
      while (crew < m.length) {
        if (m[crew] > crew) {
          // Sandwich boat
          sandwichSuccess = m[crew] - crew;
          break;
        }
        crew += 1;
      }

      if (divNum > 0) {
        results += " ";
      }
    }

    if (dayNum < event.days - 1) {
      results += "\n";
    }
  }

  event.results = results;

  return event;
}

function calculateTorpidsResults(event: Event): Event {
  let results = "";
  const move = event.move;
  const completed = event.completed;
  const numDivisions = event.divisions.length;

  for (let dayNum = 0; dayNum < event.days; dayNum++) {
    let sandwichSuccess = 0;
    for (let divNum = numDivisions - 1; divNum >= 0; divNum--) {
      completed[dayNum][divNum] = true;

      const m = move[dayNum][divNum];

      if (sandwichSuccess) {
        results += "e" + sandwichSuccess;
        sandwichSuccess = 0;
      } else if (divNum < numDivisions - 1) {
        results += "r";
      }

      let crew = m.length - 1;

      while (crew >= 0) {
        if (m[crew] === 0) {
          results += "r";
          crew -= 1;
        } else if (m[crew] > 0 && crew === 0) {
          results += "r";
          crew -= 1;
        } else {
          results += "e" + m[crew];
          crew -= 1;
        }
      }

      if (m[0] > 0) {
        sandwichSuccess = m[0];
      }

      if (divNum > 0) {
        results += " ";
      }
    }

    if (dayNum < event.days - 1) {
      results += "\n";
    }
  }

  event.results = results;

  return event;
}

function addcrew(div: string[], crew: string): void {
  if (crew.length === 0) {
    return;
  }

  div.push(crew);
}

function processBump(
  move: number[][],
  divNum: number,
  crew: number,
  up: number
): boolean {
  if (crew - up < 1) {
    console.error(
      "Bumping up above the top of the division: div " +
        divNum +
        ", crew " +
        crew +
        ", up " +
        up
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
            "Run out of days of racing with more results still to go"
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

function calculateMoves(
  event: Event,
  crewsFirstDay: {
    Club: string;
    Crew: string;
    Day: string;
    Division: string;
    Position: string;
    Sex: string;
    "Start position": string;
    Year: string;
  }[],
  crewsAllDays: {
    Club: string;
    Crew: string;
    Day: string;
    Division: string;
    Position: string;
    Sex: string;
    "Start position": string;
    Year: string;
  }[],
  divisionSizes: number[]
) {
  const numDivisions = event.divisions.length;
  const divisions = event.divisions;
  const move = event.move;
  const finish = event.finish;

  for (let dayNum = 0; dayNum < event.days; dayNum++) {
    for (let crew = 0; crew < crewsFirstDay.length; crew++) {
      if (dayNum === 0) {
        const division = +crewsFirstDay[crew].Division - 1;

        const position = +crewsFirstDay[crew]["Start position"] - 1;
        const positionInDivision = calculatePositionInDivision(
          position,
          numDivisions,
          divisionSizes
        );

        divisions[division][
          positionInDivision
        ] = `${crewsFirstDay[crew].Club} ${crewsFirstDay[crew].Crew}`;
        move[dayNum][division][positionInDivision] =
          +crewsFirstDay[crew]["Start position"] -
          +crewsAllDays[event.days * crew + dayNum].Position;
      } else {
        let position =
          +crewsAllDays[event.days * crew + dayNum - 1].Position - 1;
        const divisionBreaks = calculateDivisionBreaks(divisions);
        let division = calculateDivision(
          position,
          numDivisions,
          divisionBreaks
        );

        let positionInDivision = calculatePositionInDivision(
          position,
          numDivisions,
          divisionSizes
        );
        move[dayNum][division][positionInDivision] =
          +crewsAllDays[event.days * crew + dayNum - 1].Position -
          +crewsAllDays[event.days * crew + dayNum].Position;

        if (dayNum === event.days - 1) {
          position = +crewsAllDays[event.days * crew + dayNum].Position - 1;
          division = calculateDivision(position, numDivisions, divisionBreaks);

          positionInDivision = calculatePositionInDivision(
            position,
            numDivisions,
            divisionSizes
          );
          finish[division][
            positionInDivision
          ] = `${crewsFirstDay[crew].Club} ${crewsFirstDay[crew].Crew}`;
        }
      }
    }
  }

  return event;
}

function read_flat(_data: string) {
  const data = d3.csvParse<
    | "Start position"
    | "Club"
    | "Crew"
    | "Day"
    | "Division"
    | "Position"
    | "Sex"
    | "Year"
  >(_data);
  const year = uniq(data.map((d) => d.Year));
  const gender = uniq(data.map((d) => d.Sex));
  const events = [];

  for (let yearNum = 0; yearNum < year.length; yearNum++) {
    for (let genderNum = 0; genderNum < gender.length; genderNum++) {
      let event: Event = {
        set: Set.EIGHTS,
        small: "Short",
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

      event.set = "Town Bumps";
      event.gender = gender[genderNum]! as Gender;
      event.year = +year[yearNum]!;

      const crewsFirstDay = data.filter(
        (d) =>
          +d.Year! === event.year && d.Sex === event.gender && d.Day === "1"
      );
      crewsFirstDay.sort(
        (a, b) => +a["Start position"]! - +b["Start position"]!
      );

      const crewsAllDays = data.filter(
        (d) => +d.Year! === event.year && d.Sex === event.gender
      );
      crewsAllDays.sort((a, b) => {
        const equality = +a["Start position"]! - +b["Start position"]!;
        if (equality === 0) {
          return +a.Day! - +b.Day!;
        }
        return equality;
      });

      event.days = uniq(crewsAllDays.map((c) => c.Day)).length;

      const numDivisions = uniq(crewsFirstDay.map((c) => c.Division)).length;
      const divisionSizes = new Array(numDivisions);

      for (let division = 0; division < numDivisions; division++) {
        divisionSizes[division] = crewsFirstDay.filter(
          (c) => +c.Division! === division + 1
        ).length;
      }

      event.divisions = new Array(numDivisions);
      event.finish = new Array(numDivisions);
      event.move = new Array(event.days);
      event.completed = new Array(event.days);

      for (let dayNum = 0; dayNum < event.days; dayNum++) {
        event.move[dayNum] = new Array(numDivisions);
        event.completed[dayNum] = new Array(numDivisions);

        for (let divNum = 0; divNum < numDivisions; divNum++) {
          event.divisions[divNum] = new Array(divisionSizes[divNum]);
          event.finish[divNum] = new Array(divisionSizes[divNum]);
          event.move[dayNum][divNum] = new Array(divisionSizes[divNum]);
          event.completed[dayNum][divNum] = false;
        }
      }

      event = calculateMoves(
        event,
        crewsFirstDay as any,
        crewsAllDays as any,
        divisionSizes
      );

      event = calculateResults(event);
      events.push(event);
    }
  }

  return events;
}

function read_tg(_input: string): Event {
  const input = _input.split("\n");

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
      results[Math.floor(i / event.divisions.length)].push(r.trim())
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

function read_ad(_input: string) {
  const input = _input.split("\n");

  let event: Event = {
    set: Set.EIGHTS,
    small: "ERROR",
    gender: Gender.MEN,
    result: "",
    year: 1970,
    days: 1,
    divisions: [],
    results: "",
    move: [],
    finish: [],
    completed: [],
  };

  const info = input[0].split(/\s+/);

  switch (info[0]) {
    case "EIGHTS":
      event.set = Set.EIGHTS;
      event.small = "Eights";
      break;
    case "TORPIDS":
      event.set = Set.TORPIDS;
      event.small = "Torpids";
      break;
    case "MAYS":
      event.set = Set.MAYS;
      event.small = "Mays";
      break;
    case "LENTS":
      event.set = Set.LENTS;
      event.small = "Lents";
      break;
    case "TOWN":
      event.set = Set.TOWN;
      event.small = "Town";
      break;
  }

  event.year = +info[1];
  const info2 = input[1].trim().split(/\s+/);

  const reNoRacing = /NO RACING/i;

  if (reNoRacing.test(input[1])) {
    event.days = 0;
  } else {
    event.days = +info2[0];
  }

  const numDivisions = +info2[1];
  const numCrews = parseInt(info2[2], 10);
  let currentDivision: string[] = [];
  let currentMove: number[][] = [];
  let currentPos: number[][] = [];

  for (let day = 0; day < event.days + 1; day++) {
    currentMove.push([]);
    currentPos.push([]);
    for (let crew = 0; crew < numCrews; crew++) {
      currentPos[day].push(crew);
    }
  }

  const reMen = /men/i;
  const reWomen = /women/i;

  if (reWomen.test(input[2])) {
    event.gender = Gender.WOMEN;
  } else if (reMen.test(input[2])) {
    event.gender = Gender.MEN;
  }

  for (let line = 2; line < numDivisions + numCrews + 2; line++) {
    if (input[line][0] === " ") {
      currentDivision = [];
      event.divisions.push(currentDivision);
    } else {
      const crewName = input[line].substring(0, 25).trim();
      const moves = input[line]
        .substring(25)
        .replace(/([^\d- ]|-\D)/g, "")
        .trim()
        .split(/\s+/g);

      for (let day = 0; day < event.days; day++) {
        currentMove[day].push(+moves[day]);
      }

      currentDivision.push(
        event.set === Set.TOWN
          ? normalizeTownName(crewName)
          : normalizeOxfordName(crewName)
      );
      currentMove.push();
    }
  }

  for (let day = 1; day < event.days + 1; day++) {
    for (let crew = 0; crew < numCrews; crew++) {
      currentPos[day][crew] =
        currentPos[day - 1][crew] - currentMove[day - 1][crew];
    }
  }

  for (let day = 0; day < event.days; day++) {
    let count = 0;
    event.move.push([]);
    event.completed.push([]);
    for (let div = 0; div < numDivisions; div++) {
      event.move[day].push([]);
      event.completed[day].push(true);
      for (let crew = 0; crew < event.divisions[div].length; crew++) {
        event.move[day][div].push(
          currentMove[day][currentPos[day].indexOf(count)]
        );
        count++;
      }
    }
  }

  const initialPositions = [];
  for (let div = 0; div < numDivisions; div++) {
    for (let crew = 0; crew < event.divisions[div].length; crew++) {
      initialPositions.push(event.divisions[div][crew]);
    }
  }

  let count = 0;
  for (let div = 0; div < numDivisions; div++) {
    event.finish.push([]);
    for (let crew = 0; crew < event.divisions[div].length; crew++) {
      event.finish[div].push(
        initialPositions[currentPos[event.days].indexOf(count)]
      );
      count++;
    }
  }

  event =
    event.set === "Torpids"
      ? calculateTorpidsResults(event)
      : calculateResults(event);

  return event;
}

function write_flat(events: Event[]) {
  let ret = "Year,Club,Sex,Day,Crew,Start position,Position,Division\n";

  for (let eventNum = 0; eventNum < events.length; eventNum++) {
    const event = events[eventNum];

    const divisions = event.divisions.slice();
    divisions.unshift([]);
    const divisionBreaks = calculateDivisionBreaks(divisions);

    for (let divNum = 0; divNum < event.divisions.length; divNum++) {
      const division = event.divisions[divNum];

      for (let crew = 0; crew < division.length; crew++) {
        const c = division[crew].split(" ");
        const crewNumber = c.pop();
        const club = c.join(" ");

        let position = crew;
        let correctedPosition;
        let correctedDivision = divNum;
        let startPosition;

        for (let dayNum = 0; dayNum < event.days; dayNum++) {
          if (dayNum === 0) {
            startPosition = divisionBreaks[divNum] + position + 1;
          }

          position -= event.move[dayNum][correctedDivision][position];

          if (position < 0 && divNum > 0) {
            position += event.divisions[correctedDivision - 1].length;
            correctedDivision -= 1;
          } else if (
            position >= event.divisions[correctedDivision].length &&
            divNum < event.divisions.length
          ) {
            position -= event.divisions[correctedDivision].length;
            correctedDivision += 1;
          }

          correctedPosition = divisionBreaks[correctedDivision] + position + 1;

          ret += `${event.year},${club},${event.gender},${
            dayNum + 1
          },${crewNumber},${startPosition},${correctedPosition},${divNum + 1}
`;
        }
      }
    }
  }

  return ret;
}

function write_tg(event: Event) {
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

function write_ad(event: Event) {
  let setStr;

  switch (event.set) {
    case Set.EIGHTS:
      setStr = "EIGHTS";
      break;
    case Set.TORPIDS:
      setStr = "TORPIDS";
      break;
    case Set.LENTS:
      setStr = "LENTS";
      break;
    case Set.MAYS:
      setStr = "MAYS";
      break;
    case Set.TOWN:
      setStr = "TOWN";
      break;
  }

  const numCrews = event.divisions.reduce((sum, div) => (sum += div.length), 0);

  let ret = `${setStr} ${event.year}
 ${event.days}  ${event.divisions.length}  ${numCrews}   = NDay, NDiv, NCrew
`;

  event.divisions.forEach((div, index) => {
    let genderStr;
    switch (event.gender) {
      case Gender.MEN:
        genderStr = "Men's";
        break;
      case Gender.WOMEN:
        genderStr = "Women's";
        break;
    }

    let currentMove = [];
    let currentPos: number[][] = [];

    for (let day = 0; day < event.days + 1; day++) {
      currentMove.push([]);
      currentPos.push([]);
      for (let crew = 0; crew < numCrews; crew++) {
        currentPos[day].push(crew);
      }
    }

    let divStr = ` ${div.length}  ${genderStr} Div ${ROMAN[index]}\n`;

    div.forEach((crew, crewIndex) => {
      let position = crewIndex;
      let currentDivision = index;
      divStr += `${padEnd(renderName(crew, event.set), 25)}`;

      for (let day = 0; day < event.days; day++) {
        divStr += padStart(
          event.move[day][currentDivision][position].toString(),
          4
        );
        position -= event.move[day][currentDivision][position];

        if (position < 0) {
          currentDivision -= 1;
          position += event.divisions[currentDivision].length;
        }

        if (position >= event.divisions[currentDivision].length) {
          position -= event.divisions[currentDivision].length;
          currentDivision += 1;
        }
      }

      divStr += "\n";
    });

    ret += divStr;
  });

  return ret;
}

module.exports = {
  read_tg: read_tg,
  write_tg: write_tg,
  read_ad: read_ad,
  write_ad: write_ad,
  read_flat: read_flat,
  write_flat: write_flat,
  transformData: transformData,
  joinEvents: joinEvents,
  abbreviate: abbreviate,
  GENDER: Gender,
  SET: Set,
};
