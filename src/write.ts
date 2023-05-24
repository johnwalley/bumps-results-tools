import { padEnd, padStart } from "lodash";
import {
  abbrevCamCollege,
  abbrevCamTown,
  abbrevOxCollege,
  GENDER,
  ROMAN,
  SET,
} from "./constants";
import { RawEvent } from "./types";
import { calculateDivisionBreaks } from "./util";

function renderName(name: string, set: string) {
  // College crews are stored as an abbrevation and we replace the number with Roman numerals
  const sh = name.replace(/[0-9]+$/, "").trim();
  let abbrev: { [key: string]: string };
  let type;

  switch (set) {
    case SET.LENTS:
    case SET.MAYS:
      abbrev = abbrevCamCollege;
      type = "college";
      break;
    case SET.TORPIDS:
    case SET.EIGHTS:
      abbrev = abbrevOxCollege;
      type = "college";
      break;
    case SET.TOWN:
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

export function write_flat(events: RawEvent[]) {
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

export function write_tg(event: RawEvent) {
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

export function write_ad(event: RawEvent) {
  let setStr;

  switch (event.set) {
    case SET.EIGHTS:
      setStr = "EIGHTS";
      break;
    case SET.TORPIDS:
      setStr = "TORPIDS";
      break;
    case SET.LENTS:
      setStr = "LENTS";
      break;
    case SET.MAYS:
      setStr = "MAYS";
      break;
    case SET.TOWN:
      setStr = "TOWN";
      break;
  }

  const numCrews = event.divisions.reduce(
    (sum: number, div: unknown[]) => (sum += div.length),
    0
  );

  let ret = `${setStr} ${event.year}
 ${event.days}  ${event.divisions.length}  ${numCrews}   = NDay, NDiv, NCrew
`;

  event.divisions.forEach((div: string[], index: number) => {
    let genderStr;
    switch (event.gender) {
      case GENDER.MEN:
        genderStr = "Men's";
        break;
      case GENDER.WOMEN:
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

    div.forEach((crew: string, crewIndex: number) => {
      let position = crewIndex;
      let currentDivision = index;
      divStr += `${padEnd(renderName(crew, event.set), 25)}`;

      for (let day = 0; day < event.days; day++) {
        divStr += padStart(`${event.move[day][currentDivision][position]}`, 4);
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
