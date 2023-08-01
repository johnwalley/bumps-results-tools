import { Event } from "./types";
import { DataFrame } from "data-forge";

function movdo(events: Event[]) {
  const res: Record<string, { crew: string; fall: number; year: number }> = {};

  for (const event of events) {
    const numCrews = event.divisions.reduce(
      (sum, div) => (sum += div.length),
      0
    );

    event.divisions.forEach((div, index) => {
      let currentMove = [];
      let currentPos: number[][] = [];

      for (let day = 0; day < event.days + 1; day++) {
        currentMove.push([]);
        currentPos.push([]);
        for (let crew = 0; crew < numCrews; crew++) {
          currentPos[day].push(crew);
        }
      }

      div.forEach((crew, crewIndex) => {
        let position = crewIndex;
        let currentDivision = index;
        let change = 0;

        for (let day = 0; day < event.days; day++) {
          change += event.move[day][currentDivision][position];
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

        if (res[crew]) {
          if (change <= res[crew].fall) {
            res[crew] = { crew: crew, fall: change, year: event.year };
          }
        } else {
          res[crew] = { crew: crew, fall: change, year: event.year };
        }
      });
    });
  }

  const df = new DataFrame(Object.values(res));

  return df.orderBy((column) => column.fall).toArray();
}

function movup(events: Event[]) {
  const res: Record<string, { crew: string; rise: number; year: number }> = {};

  for (const event of events) {
    const numCrews = event.divisions.reduce(
      (sum, div) => (sum += div.length),
      0
    );

    event.divisions.forEach((div, index) => {
      let currentMove = [];
      let currentPos: number[][] = [];

      for (let day = 0; day < event.days + 1; day++) {
        currentMove.push([]);
        currentPos.push([]);
        for (let crew = 0; crew < numCrews; crew++) {
          currentPos[day].push(crew);
        }
      }

      div.forEach((crew, crewIndex) => {
        let position = crewIndex;
        let currentDivision = index;
        let change = 0;

        for (let day = 0; day < event.days; day++) {
          change += event.move[day][currentDivision][position];
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

        if (res[crew]) {
          if (change >= res[crew].rise) {
            res[crew] = { crew: crew, rise: change, year: event.year };
          }
        } else {
          res[crew] = { crew: crew, rise: change, year: event.year };
        }
      });
    });
  }

  const df = new DataFrame(Object.values(res));

  return df.orderBy((column) => -column.rise).toArray();
}

function ncrews(events: Event[]) {
  const rows = events.map((event) => {
    const clubs = event.divisions
      .flatMap((division) => division)
      .map((crew) => ({
        year: event.year,
        club: crew.replace(/[0-9]+$/, "").trim(),
      }));

    const df = new DataFrame(clubs);

    const summarized = df
      .groupBy((row) => row.club)
      .select((group) => ({
        year: group.last().year,
        count: group.deflate((row) => row.club).count(), // Sum sales per client.
        club: group.last().club,
      }))
      .inflate() // Series -> dataframe.
      .orderBy((column) => -column.year)
      .orderBy((column) => -column.count)
      .toArray(); // Convert to regular JS array.

    return summarized;
  });

  return rows.flatMap((row) => row);
}

function nhead(events: Event[]) {
  const rows = events.map((event) => ({
    year: event.year,
    head: event.finish[0][0],
  }));

  const df = new DataFrame(rows);

  const summarized = df
    .groupBy((row) => row.head)
    .select((group) => ({
      year: group.last().year,
      count: group.deflate((row) => row.head).count(), // Sum sales per client.
      crew: group.last().head,
    }))
    .inflate() // Series -> dataframe.
    .orderBy((column) => -column.year)
    .orderBy((column) => -column.count)
    .toArray(); // Convert to regular JS array.

  return summarized;
}

module.exports = {
  movdo: movdo,
  movup: movup,
  ncrews: ncrews,
  nhead: nhead,
};
