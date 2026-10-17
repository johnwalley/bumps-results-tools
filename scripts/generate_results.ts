import { writeWeb } from "../src/bumps";
import { loadEvents } from "./load_events";

import chalk from "chalk";
import fs from "fs";

if (!fs.existsSync("./output")) {
  fs.mkdirSync("./output");
}

if (!fs.existsSync("./output/results")) {
  fs.mkdirSync("./output/results");
}

const loaded = await loadEvents();

const events = loaded.map((l) => l.event);

const results = writeWeb(events);

fs.writeFile(
  `./output/results/results.json`,
  JSON.stringify(results),
  function () {
    console.log(`Wrote file to ${chalk.blue(`./output/results/results.json`)}`);
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

    const processed = loaded
      .filter(({ event }) => event.gender === gender && event.short === small)
      .map((l) => l.processed);

    const filename = `./output/results/${small.toLocaleLowerCase()}/${gender.toLocaleLowerCase()}/results.json`;

    fs.writeFile(filename, JSON.stringify(processed), function () {
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
