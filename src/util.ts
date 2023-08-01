import * as d3 from "d3";

import { Event, Gender, InternalEvent, Set } from "./types";
import { abbrevCamCollege, abbrevCamTown, abbrevOxCollege } from "./constants";
import { findKey, uniq } from "lodash";

export function abbreviate(event: Event): Event {
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

function abbreviateCrew(crew: string, set: Set): string {
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

export function expandCrew(crew: string, set: Set): string {
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

export function crewColor(name: string): string {
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

function isBlades(positions: number[]): boolean {
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
): boolean {
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

export function joinEvents(
  events: InternalEvent[],
  set: Set,
  gender: Gender
) {
  const years: number[] = [];
  const data: unknown[] = [];
  const divisions: {
    year: number;
    divisions: { start: number; size: number }[];
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

export function transformData(event: Event) {
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

export function calculateYearRange(
  current: { end: number; start: number } | null | undefined,
  data: { end: number; start: number },
  desiredWidth: number
): {
  start: number;
  end: number;
} {
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

export function calculateResults(event: Event): Event {
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

export function calculateTorpidsResults(event: Event): Event {
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
