#!/usr/bin/env node
const utils = require("../src");
const fs = require("fs");
const path = require("path");
const chalk = require("chalk");

const events = [];
const results = [];

const resultsInputDir = "./results/ad_format/";
const outputFilename = "results.json";

fs.readdir(resultsInputDir, function (err, files) {
  if (err) throw err;
  let numFiles = 0;

  files.forEach(function (file) {
    console.log(`Reading ${chalk.red(file)}`);
    const contents = fs.readFileSync(path.join(resultsInputDir, file), "utf8");
    const event = utils.read_ad(contents);
    numFiles++;
    events.push(event);
  });

  const genders = ["Men", "Women"];
  const sets = [
    "Town Bumps",
    "Lent Bumps",
    "May Bumps",
    "Torpids",
    "Summer Eights",
  ];

  const smalls = ["Town", "Lents", "Mays", "Torpids", "Eights"];

  genders.forEach((gender) => {
    sets.forEach((set, i) => {
      const transformedEvents = events
        .filter((e) => e.gender.toLowerCase() === gender.toLowerCase())
        .filter((e) => e.set === set)
        .sort((a, b) => a.year - b.year)
        .map(utils.transformData);

      const joinedEvents = utils.joinEvents(transformedEvents, set, gender);

      joinedEvents.set = set;
      joinedEvents.gender = gender;
      joinedEvents.small = smalls[i];

      results.push(joinedEvents);
    });
  });

  fs.writeFile(`./${outputFilename}`, JSON.stringify(results), function (err) {
    if (err) {
      console.log(
        `There was an error while writing file to ${chalk.red(
          "./" + outputFilename,
        )}`,
      );
    }

    console.log(
      `Successfully wrote file to ${chalk.green("./" + outputFilename)}`,
    );
  });

  console.log(`Found ${chalk.yellow(numFiles)} files`);
});
