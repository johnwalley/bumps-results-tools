import chalk from "https://deno.land/x/chalk_deno@v4.1.1-deno/source/index.js"
import { join } from "https://deno.land/std/path/mod.ts";
import { joinEvents, read_ad, transformData } from "../dist/bumps-results-tools.js";

const events = [];
const results = [];

const resultsInputDir = "./results/ad_format/";
const outputFilename = "results.json";

let numFiles = 0;


for (const file of Deno.readDirSync("./results/ad_format/")) {
  console.log(`Reading ${chalk.blue(file.name)}`);
  const contents = Deno.readTextFileSync(join(resultsInputDir, file.name));
  const event = read_ad(contents);
  numFiles++;
  events.push(event);
}

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
      .map(transformData);

    const joinedEvents = joinEvents(transformedEvents, set, gender);

    joinedEvents.set = set;
    joinedEvents.gender = gender;
    joinedEvents.small = smalls[i];

    results.push(joinedEvents);
  });
});

Deno.writeTextFileSync(`./${outputFilename}`, JSON.stringify(results));

console.log(
  `Successfully wrote file to ${chalk.green("./" + outputFilename)}`
);

console.log(`Found ${chalk.yellow(numFiles)} files`);
