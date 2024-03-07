var utils = require("../src");
var statistics = require("../src/stats");
var fs = require("fs");
var chalk = require("chalk");

const events = [];

if (!fs.existsSync("./output")) {
  fs.mkdirSync("./output");
}

if (!fs.existsSync("./output/statistics")) {
  fs.mkdirSync("./output/statistics");
}

fs.readdir("./results/ad_format/", function (err, files) {
  if (err) throw err;

  let numFiles = 0;

  files.forEach(function (file) {
    console.log(`Reading ${chalk.yellow(file)}`);
    const contents = fs.readFileSync("./results/ad_format/" + file, "utf8");
    const event = utils.read_ad(contents);
    numFiles++;
    events.push(event);
  });

  for (const small of ["Eights", "Lents", "Mays", "Torpids", "Town"]) {
    if (!fs.existsSync(`./output/statistics/${small.toLocaleLowerCase()}`)) {
      fs.mkdirSync(`./output/statistics/${small.toLocaleLowerCase()}`);
    }

    for (const gender of ["Men", "Women"]) {
      if (
        !fs.existsSync(
          `./output/statistics/${small.toLocaleLowerCase()}/${gender.toLocaleLowerCase()}`
        )
      ) {
        fs.mkdirSync(
          `./output/statistics/${small.toLocaleLowerCase()}/${gender.toLocaleLowerCase()}`
        );
      }

      const e = events.filter(
        (event) => event.gender === gender && event.small === small
      );

      for (const stat of ["ncrews", "nhead", "movdo", "movup"]) {
        const filename = `./output/statistics/${small.toLocaleLowerCase()}/${gender.toLocaleLowerCase()}/${stat}.json`;

        const output = statistics[stat](e);

        fs.writeFile(filename, JSON.stringify(output), function () {
          console.log(`Successfully wrote file to ${chalk.blue(filename)}`);
        });
      }
    }
  }
});
