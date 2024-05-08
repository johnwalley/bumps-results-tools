var utils = require("../src");
var fs = require("fs");
var chalk = require("chalk");

if (!fs.existsSync("./output")) {
  fs.mkdirSync("./output");
}

if (!fs.existsSync("./output/results")) {
  fs.mkdirSync("./output/results");
}

const events = [];

fs.readdir("./results/ad_format/", function (err, files) {
  if (err) throw err;
  let numFiles = 0;

  files.forEach(function (file) {
    const contents = fs.readFileSync("./results/ad_format/" + file, "utf8");
    const event = utils.read_ad(contents);
    numFiles++;
    events.push(event);
  });

  console.log(`Found ${chalk.blue(numFiles)} files`);

  for (const small of ["Eights", "Lents", "Mays", "Torpids", "Town"]) {
    if (!fs.existsSync(`./output/results/${small.toLocaleLowerCase()}`)) {
      fs.mkdirSync(`./output/results/${small.toLocaleLowerCase()}`);
    }

    for (const gender of ["Men", "Women"]) {
      if (
        !fs.existsSync(
          `./output/results/${small.toLocaleLowerCase()}/${gender.toLocaleLowerCase()}`
        )
      ) {
        fs.mkdirSync(
          `./output/results/${small.toLocaleLowerCase()}/${gender.toLocaleLowerCase()}`
        );
      }

      const e = events.filter(
        (event) => event.gender === gender && event.small === small
      );

      const filename = `./output/results/${small.toLocaleLowerCase()}/${gender.toLocaleLowerCase()}/results.json`;

      fs.writeFile(filename, JSON.stringify(e), function () {
        console.log(
          `Wrote file to ${chalk.blue(
            `./output/results/${chalk.green(
              small.toLocaleLowerCase()
            )}/${chalk.yellow(gender.toLocaleLowerCase())}/results.json`
          )}`
        );
      });
    }
  }
});
