var utils = require("../src/bumps");
var stats = require("../src/stats");
var fs = require("fs");
var chalk = require("chalk");

if (!fs.existsSync("./output")) {
  fs.mkdirSync("./output");
}

if (!fs.existsSync("./output/stats")) {
  fs.mkdirSync("./output/stats");
}

const events = [];

fs.readdir("./results/tg_format/", async function (err, files) {
  if (err) throw err;
  let numFiles = 0;

  for (const file of files) {
    const event = await utils.readFile("./results/tg_format/" + file);
    numFiles++;
    events.push(event);
  }

  console.log(`Found ${chalk.blue(numFiles)} files`);

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

      const e = events.filter(
        (event) => event.gender === gender && event.short === small,
      );

      for (const event of e) {
        utils.processResults(event);
      }

      const headships = stats.headships(e);

      const crewsEntered = stats.crewsEntered(e);

      const output = {headships, crewsEntered};

      const filename = `./output/stats/${small.toLocaleLowerCase()}/${gender.toLocaleLowerCase()}/stats.json`;

      fs.writeFile(filename, JSON.stringify(output), function () {
        console.log(
          `Wrote file to ${chalk.blue(
            `./output/stats/${chalk.green(
              small.toLocaleLowerCase(),
            )}/${chalk.yellow(gender.toLocaleLowerCase())}/stats.json`,
          )}`,
        );
      });
    }
  }
});
