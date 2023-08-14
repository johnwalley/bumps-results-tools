import { Event, Gender, Set } from "./types";
import {
  ROMAN,
  abbrevCamCollege,
  abbrevCamTown,
  abbrevOxCollege,
} from "./constants";
import { calculateResults, calculateTorpidsResults } from "./util";
import { padEnd, padStart } from "lodash";

export function read_ad(text: string) {
  const input = text.split("\n");

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
          : normalizeOxfordName(crewName),
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
          currentMove[day][currentPos[day].indexOf(count)],
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
        initialPositions[currentPos[event.days].indexOf(count)],
      );
      count++;
    }
  }

  event =
    event.set === Set.TORPIDS
      ? calculateTorpidsResults(event)
      : calculateResults(event);

  return event;
}

export function write_ad(event: Event) {
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
          4,
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

function normalizeTownName(name: string) {
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
