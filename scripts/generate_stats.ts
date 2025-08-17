import { desc, from } from "arquero";
import chalk from "chalk";
import fs from "fs";
import { processResults, readFile, writeWeb } from "../src/bumps";
import { getStats } from "../src/stats";
import { type Event } from "../src/types";
import * as prettier from "prettier";

if (!fs.existsSync("./output")) {
  fs.mkdirSync("./output");
}

if (!fs.existsSync("./output/stats")) {
  fs.mkdirSync("./output/stats");
}

const events: Event[] = [];

fs.readdir("./results/tg_format/", async function (err, files) {
  if (err) throw err;
  let numFiles = 0;

  for (const file of files) {
    const event = await readFile("./results/tg_format/" + file);

    if (event) {
      numFiles++;
      events.push(event);
    }
  }

  console.log(`Found ${chalk.blue(`${numFiles}`)} files`);

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

      const e = events
        .filter((event) => event.gender === gender && event.short === small)
        .toSorted((a, b) => parseInt(a.year) - parseInt(b.year));

      for (const event of e) {
        processResults(event);
      }

      const finalStats = getFinalStats(e);

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
});

function getFinalStats(
  e: {
    set:
      | "Summer Eights"
      | "Lent Bumps"
      | "May Bumps"
      | "Torpids"
      | "Town Bumps";
    crews: {
      number: number;
      blades: boolean;
      club_end: string | null;
      club: string;
      end: string | null;
      gain: number | null;
      highlight: boolean;
      num_name: string;
      start: string;
      withdrawn: boolean;
    }[];
    days: number;
    distance: number;
    div_size: number[][] | null;
    flags: string[];
    gender: "Men" | "Women";
    pace: unknown[];
    results: string[];
    short: "Torpids" | "Eights" | "Lents" | "Mays" | "Town";
    year: string;
    back?: (number | null)[][] | undefined;
    completed?: boolean[][] | undefined;
    crews_withdrawn?: number | undefined;
    full_set?: boolean | undefined;
    move?: (number | null)[][] | undefined;
    skip?: unknown[][] | undefined;
  }[],
) {
  const stats = getStats(e, true);

  const rHeadships = {};
  const rCrewsEntered = {};
  const rHeadDays = {};
  const rHeadLong = {};
  const rBladesAwarded = {};

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
      Object.entries<{ total: number; labels: Array<{ year: string }> }>(
        rHeadships,
      ).map(([club, res]) => ({
        club: club,
        headships: res.total,
        lastYear: res.labels[res.labels.length - 1].year,
      })),
    )
      .orderby(desc("headships"), desc("lastYear"))
      .objects(),
    crewsEntered: from(
      Object.entries<number>(rCrewsEntered).map(([club, res]) => ({
        club: club,
        count: res,
      })),
    )
      .orderby(desc("count"))
      .objects(),
    headDays: from(
      Object.entries<{ total: number; days: number }>(rHeadDays).map(
        ([club, res]) => ({
          club: club,
          days: res.days,
        }),
      ),
    )
      .orderby(desc("days"))
      .objects(),
    headLong: from(
      Object.entries<{
        total: number;
        longest: number;
        start: number;
        end: number;
      }>(rHeadLong).map(([club, res]) => ({
        club: club,
        days: res.longest,
        span:
          res.start !== res.end ? `${res.start} - ${res.end}` : `${res.start}`,
      })),
    )
      .orderby(desc("days"))
      .objects(),
    bladesAwarded: from(
      Object.entries<number>(rBladesAwarded).map(([club, res]) => ({
        club: club,
        count: res,
      })),
    )
      .orderby(desc("count"))
      .objects(),
  };

  return finalStats;
}
