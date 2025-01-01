import { processResults, readFile, writeWeb } from "../src/bumps";
import { type Event } from "../src/types";

import chalk from "chalk";
import fs from "fs";

if (!fs.existsSync("./output")) {
  fs.mkdirSync("./output");
}

if (!fs.existsSync("./output/results")) {
  fs.mkdirSync("./output/results");
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

  events.sort(function (a, b) {
    const aYear = parseInt(a.year, 10);
    const bYear = parseInt(b.year, 10);

    return aYear - bYear;
  });

  const results = writeWeb(events);

  fs.writeFile(
    `./output/results/results.json`,
    JSON.stringify(results),
    function () {
      console.log(
        `Wrote file to ${chalk.blue(`./output/results/results.json`)}`,
      );
    },
  );

  for (const small of ["Eights", "Lents", "Mays", "Torpids", "Town"]) {
    if (!fs.existsSync(`./output/results/${small.toLocaleLowerCase()}`)) {
      fs.mkdirSync(`./output/results/${small.toLocaleLowerCase()}`);
    }

    for (const gender of ["Men", "Women"]) {
      if (
        !fs.existsSync(
          `./output/results/${small.toLocaleLowerCase()}/${gender.toLocaleLowerCase()}`,
        )
      ) {
        fs.mkdirSync(
          `./output/results/${small.toLocaleLowerCase()}/${gender.toLocaleLowerCase()}`,
        );
      }

      const e = events.filter(
        (event) => event.gender === gender && event.short === small,
      );

      for (const event of e) {
        processResults(event);
      }

      const filename = `./output/results/${small.toLocaleLowerCase()}/${gender.toLocaleLowerCase()}/results.json`;

      fs.writeFile(filename, JSON.stringify(e), function () {
        console.log(
          `Wrote file to ${chalk.blue(
            `./output/results/${chalk.green(
              small.toLocaleLowerCase(),
            )}/${chalk.yellow(gender.toLocaleLowerCase())}/results.json`,
          )}`,
        );
      });
    }
  }
});
