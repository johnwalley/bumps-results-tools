import { desc, from } from "arquero";
import chalk from "chalk";
import fs from "fs";
import { writeWeb } from "../src/bumps";
import { getStats } from "../src/stats";
import { type ProcessedEvent } from "../src/types";
import { loadEvents } from "./load_events";
import * as prettier from "prettier";

if (!fs.existsSync("./output")) {
  fs.mkdirSync("./output");
}

if (!fs.existsSync("./output/stats")) {
  fs.mkdirSync("./output/stats");
}

const loaded = await loadEvents();

for (const small of ["Eights", "Lents", "Mays", "Torpids", "Town"]) {
  if (!fs.existsSync(`./output/stats/${small.toLocaleLowerCase()}`)) {
    fs.mkdirSync(`./output/stats/${small.toLocaleLowerCase()}`);
  }

  for (const gender of ["Men", "Women"]) {
    if (
      !fs.existsSync(
        `./output/stats/${small.toLocaleLowerCase()}/${gender.toLocaleLowerCase()}`,
      )
    ) {
      fs.mkdirSync(
        `./output/stats/${small.toLocaleLowerCase()}/${gender.toLocaleLowerCase()}`,
      );
    }

    if (
      !fs.existsSync(
        `./output/stats/${small.toLocaleLowerCase()}/${gender.toLocaleLowerCase()}/year`,
      )
    ) {
      fs.mkdirSync(
        `./output/stats/${small.toLocaleLowerCase()}/${gender.toLocaleLowerCase()}/year`,
      );
    }

    const group = loaded.filter(
      ({ event }) => event.gender === gender && event.short === small,
    );

    const e = group.map((l) => l.event);
    const processed = group.map((l) => l.processed);

    const finalStats = getFinalStats(processed);

    const filename = `./output/stats/${small.toLocaleLowerCase()}/${gender.toLocaleLowerCase()}/stats.json`;

    const formattedJson = await prettier.format(JSON.stringify(finalStats), {
      parser: "json",
    });

    fs.writeFile(filename, formattedJson, function () {
      console.log(
        `Wrote file to ${chalk.cyan(
          `./output/stats/${chalk.yellow(
            small.toLocaleLowerCase(),
          )}/${chalk.magenta(gender.toLocaleLowerCase())}/stats.json`,
        )}`,
      );
    });

    const years = writeWeb(e);

    /*      for (const year of years[small][gender]) {
        try {
          const yearEvents = e
            .filter((event) => event.gender === gender && event.short === small)
            .filter((event) => event.year.startsWith(year));

          const finalStats = getFinalStats(yearEvents);

          const filename = `./output/stats/${small.toLocaleLowerCase()}/${gender.toLocaleLowerCase()}/year/${year}.json`;

          const formattedJson = await prettier.format(
            JSON.stringify(finalStats),
            {
              parser: "json",
            },
          );

          fs.writeFile(filename, formattedJson, function () {
            console.log(
              `Wrote file to ${chalk.cyan(
                `./output/stats/${chalk.yellow(
                  small.toLocaleLowerCase(),
                )}/${chalk.magenta(gender.toLocaleLowerCase())}/year/${year}.json`,
              )}`,
            );
          });
        } catch (e) {
          console.warn(e);
        }
      } */
  }
}

type ClubStats = ReturnType<typeof getStats>["club"][string];

function getFinalStats(e: ProcessedEvent[]) {
  const stats = getStats(e, true);

  const rHeadships: Record<string, ClubStats["headships"][string]> = {};
  const rCrewsEntered: Record<string, number> = {};
  const rHeadDays: Record<string, ClubStats["highest"][number]> = {};
  const rHeadLong: Record<string, ClubStats["highest"][number]> = {};
  const rBladesAwarded: Record<string, number> = {};

  // Generate rankings
  for (const club in stats.club) {
    if ("1" in stats.club[club].headships) {
      rHeadships[club] = stats.club[club].headships["1"];
    }

    if (
      "1" in stats.club[club].highest &&
      stats.club[club].highest["1"].high === 0
    ) {
      rHeadDays[club] = stats.club[club].highest["1"];
    }

    if (
      "1" in stats.club[club].highest &&
      stats.club[club].highest["1"].high === 0
    ) {
      rHeadLong[club] = stats.club[club].highest["1"];
    }

    rCrewsEntered[club] = stats.club[club].count;

    if (stats.club[club].blades.length > 0) {
      rBladesAwarded[club] = stats.club[club].blades.length;
    }
  }

  const finalStats = {
    headships: from(
      Object.entries(rHeadships).map(([club, res]) => ({
        club: club,
        headships: res.total,
        lastYear: res.labels[res.labels.length - 1].year,
      })),
    )
      .orderby(desc("headships"), desc("lastYear"))
      .objects(),
    crewsEntered: from(
      Object.entries(rCrewsEntered).map(([club, res]) => ({
        club: club,
        count: res,
      })),
    )
      .orderby(desc("count"))
      .objects(),
    headDays: from(
      Object.entries(rHeadDays).map(([club, res]) => ({
        club: club,
        days: res.days,
      })),
    )
      .orderby(desc("days"))
      .objects(),
    headLong: from(
      Object.entries(rHeadLong).map(([club, res]) => ({
        club: club,
        days: res.longest,
        span:
          res.start !== res.end ? `${res.start} - ${res.end}` : `${res.start}`,
      })),
    )
      .orderby(desc("days"))
      .objects(),
    bladesAwarded: from(
      Object.entries(rBladesAwarded).map(([club, res]) => ({
        club: club,
        count: res,
      })),
    )
      .orderby(desc("count"))
      .objects(),
  };

  return finalStats;
}
