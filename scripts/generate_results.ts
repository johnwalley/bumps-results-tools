import chalk from "https://deno.land/x/chalk_deno@v4.1.1-deno/source/index.js"

import { read_ad } from "../dist/bumps-results-tools.js";

const events = [];
let numFiles = 0;

for (const file of Deno.readDirSync("./results/ad_format/")) {
  console.log("Reading " + chalk.blue("file.name"));
  const contents = Deno.readTextFileSync("./results/ad_format/" + file.name);
  const event = read_ad(contents);
  numFiles++;
  events.push(event);
}

Deno.writeTextFile("./generated.json", JSON.stringify(events));

console.log("Successfully wrote file to " + chalk.blue("./generated.json"));

console.log(`Found ${numFiles} files`);
