import * as d3 from "d3";
import { uniq } from "lodash";
import { GENDER, ROMAN, SET } from "./constants";
import { RawEvent } from "./types";
import { calculateDivisionBreaks } from "./util";

function normalizeOxfordName(name: string) {
  const parts = name.split(/\s/);
  let newName = name;

  ROMAN.forEach((num, index) => {
    if (parts[parts.length - 1] === num) {
      newName = parts.slice(0, parts.length - 1).join(" ") + " " + (index + 1);
    }
  });

  return newName;
}

function normalizeTownName(name: string) {
  return name;
}

function processBump(
  move: number[][],
  divNum: number,
  crew: number,
  up: number
) {
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

function processResults(event: RawEvent) {
  let res: any = [];

  if (event.results.length > 0) {
    res = event.results.match(/r|t|u|o[0-9]*|e-?[0-9]*/g);
  }

  let dayNum = 0;
  let divNum = 0;
  let crew = 0;
  let move = null;

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
      crew = move![divNum - 1].length;
      if (divNum < event.divisions.length) {
        crew++; // Sandwich crew
      }
    }

    event.completed[dayNum - 1][divNum - 1] = true;

    if (res[i] === "r") {
      // rowover
      crew--;
    } else if (res[i] === "u") {
      // bump up
      if (!processBump(move!, divNum, crew, 1)) {
        return;
      }

      crew -= 2;
    } else if (res[i].indexOf("o") === 0) {
      // overbump
      const up = parseInt(res[i].substring(1), 10);
      if (!processBump(move!, divNum, crew, up)) {
        return;
      }

      crew--;
    } else if (res[i].indexOf("e") === 0) {
      // TODO: Support two digit numbers
      // exact move
      const up = parseInt(res[i].substring(1), 10);

      if (crew > move![divNum - 1].length) {
        // sandwich crew, need to find where it started
        for (let p = 0; p < move![divNum].length; p++) {
          if (p - move![divNum][p] == 0) {
            move![divNum][p] += up;
            break;
          }
        }
      } else {
        move![divNum - 1][crew - 1] = up;
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

function calculateDivision(
  position: number,
  numDivisions: number,
  divisionBreaks: number[]
) {
  for (let divNum = 0; divNum < numDivisions; divNum++) {
    if (position < divisionBreaks[divNum]) {
      return divNum;
    }
  }

  return -1;
}

function calculatePositionInDivision(
  position: number,
  numDivisions: number,
  divisionSizes: number[]
) {
  for (let divNum = 0; divNum < numDivisions; divNum++) {
    if (position < divisionSizes[divNum]) {
      break;
    } else {
      position -= divisionSizes[divNum];
    }
  }

  return position;
}

function calculateResults(event: RawEvent) {
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
              // Not swapping places with crew seven above
              results += "e7";
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

function calculateTorpidsResults(event: RawEvent) {
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

function addcrew(div: string[], crew: string) {
  if (crew.length === 0) {
    return;
  }

  div.push(crew);
}

function calculateMoves(
  event: RawEvent,
  crewsFirstDay: {
    Club: string;
    Crew: string;
    Division: number;
    "Start position": number;
  }[],
  crewsAllDays: { Position: number }[],
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

export function read_flat(data: string) {
  const parsedData: any = d3.csvParse(data);
  const year = uniq(parsedData.map((d: any) => d.Year)) as string[];
  const gender = uniq(parsedData.map((d: any) => d.Sex)) as string[];
  const events = [];

  for (let yearNum = 0; yearNum < year.length; yearNum++) {
    for (let genderNum = 0; genderNum < gender.length; genderNum++) {
      let event: RawEvent = {
        set: "Set",
        small: "Short",
        gender: "Gender",
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
      event.gender = gender[genderNum];
      event.year = +year[yearNum];

      const crewsFirstDay = parsedData.filter(
        (d: any) =>
          +d.Year === event.year && d.Sex === event.gender && d.Day === "1"
      );
      crewsFirstDay.sort(
        (a: any, b: any) => +a["Start position"] - +b["Start position"]
      );

      const crewsAllDays = parsedData.filter(
        (d: any) => +d.Year === event.year && d.Sex === event.gender
      );
      crewsAllDays.sort((a: any, b: any) => {
        const equality = +a["Start position"] - +b["Start position"];
        if (equality === 0) {
          return +a.Day - +b.Day;
        }
        return equality;
      });

      event.days = uniq(crewsAllDays.map((c: any) => c.Day)).length;

      const numDivisions = uniq(
        crewsFirstDay.map((c: any) => c.Division)
      ).length;
      const divisionSizes = new Array(numDivisions);

      for (let division = 0; division < numDivisions; division++) {
        divisionSizes[division] = crewsFirstDay.filter(
          (c: any) => +c.Division === division + 1
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

      event = calculateMoves(event, crewsFirstDay, crewsAllDays, divisionSizes);
      event = calculateResults(event);
      events.push(event);
    }
  }

  return events;
}

export function read_tg(input: string) {
  const splitInput = input.split("\n");

  let event: RawEvent = {
    set: "ERROR",
    small: "ERROR",
    gender: "ERROR",
    result: "",
    year: 1970,
    days: 4,
    divisions: [],
    results: "",
    move: [],
    finish: [],
    completed: [],
  };

  const eventResults: string[] = [];

  let curdiv: string[] = [];
  let inresults = 0;
  let indivision = 0;

  for (let i = 0; i < splitInput.length; i++) {
    const m = splitInput[i].split(",");
    if (m[0] === "Set") {
      if (m.length > 1) {
        event.set = m[1];
      }
    } else if (m[0] === "Short") {
      event.small = m[1];
    } else if (m[0] === "Gender") {
      event.gender = m[1];
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

export function read_ad(input: string) {
  const splitInput = input.split("\n");

  let event: RawEvent = {
    set: "ERROR",
    small: "ERROR",
    gender: "ERROR",
    result: "",
    year: 1970,
    days: 1,
    divisions: [],
    results: "",
    move: [],
    finish: [],
    completed: [],
  };

  const info = splitInput[0].split(/\s+/);

  switch (info[0]) {
    case "EIGHTS":
      event.set = SET.EIGHTS;
      event.small = "Eights";
      break;
    case "TORPIDS":
      event.set = SET.TORPIDS;
      event.small = "Torpids";
      break;
    case "MAYS":
      event.set = SET.MAYS;
      event.small = "Mays";
      break;
    case "LENTS":
      event.set = SET.LENTS;
      event.small = "Lents";
      break;
    case "TOWN":
      event.set = SET.TOWN;
      event.small = "Town";
      break;
  }

  event.year = +info[1];
  const info2 = splitInput[1].trim().split(/\s+/);

  const reNoRacing = /NO RACING/i;

  if (reNoRacing.test(splitInput[1])) {
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

  if (reWomen.test(splitInput[2])) {
    event.gender = GENDER.WOMEN;
  } else if (reMen.test(splitInput[2])) {
    event.gender = GENDER.MEN;
  }

  for (let line = 2; line < numDivisions + numCrews + 2; line++) {
    if (splitInput[line][0] === " ") {
      currentDivision = [];
      event.divisions.push(currentDivision);
    } else {
      const crewName = splitInput[line].substring(0, 25).trim();
      const moves = splitInput[line]
        .substring(25)
        .replace(/([^\d- ]|-\D)/g, "")
        .trim()
        .split(/\s+/g);

      for (let day = 0; day < event.days; day++) {
        currentMove[day].push(+moves[day]);
      }

      currentDivision.push(
        event.set === SET.TOWN
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

  const initialPositions: string[] = [];
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
