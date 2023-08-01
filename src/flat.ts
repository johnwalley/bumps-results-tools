import * as d3 from "d3";

import { Event, Gender, Set } from "./types";

import { calculateResults } from "./util";
import { uniq } from "lodash";

export function read_flat(text: string) {
  const data = d3.csvParse<
    | "Start position"
    | "Club"
    | "Crew"
    | "Day"
    | "Division"
    | "Position"
    | "Sex"
    | "Year"
  >(text);

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
          +d.Year! === event.year && d.Sex === event.gender && d.Day === "1",
      );

      crewsFirstDay.sort(
        (a, b) => +a["Start position"]! - +b["Start position"]!,
      );

      const crewsAllDays = data.filter(
        (d) => +d.Year! === event.year && d.Sex === event.gender,
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
          (c) => +c.Division! === division + 1,
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
        divisionSizes,
      );

      event = calculateResults(event);
      events.push(event);
    }
  }

  return events;
}

export function write_flat(events: Event[]) {
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

          ret += `${event.year},${club},${event.gender},${dayNum + 1
            },${crewNumber},${startPosition},${correctedPosition},${divNum + 1}
`;
        }
      }
    }
  }

  return ret;
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
  divisionSizes: number[],
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
          divisionSizes,
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
          divisionBreaks,
        );

        let positionInDivision = calculatePositionInDivision(
          position,
          numDivisions,
          divisionSizes,
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
            divisionSizes,
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

function calculatePositionInDivision(
  position: number,
  numDivisions: number,
  divisionSizes: number[],
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

function calculateDivision(
  position: number,
  numDivisions: number,
  divisionBreaks: number[],
): number {
  for (let divNum = 0; divNum < numDivisions; divNum++) {
    if (position < divisionBreaks[divNum]) {
      return divNum;
    }
  }

  throw new Error("No division found");
}
