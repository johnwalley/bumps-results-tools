import chalk from "https://deno.land/x/chalk_deno@v4.1.1-deno/source/index.js"
import { abbreviate, read_ad, write_tg } from "../dist/bumps-results-tools.js";

let numFiles = 0;

for (const file of Deno.readDirSync("./results/ad_format/")) {
  const contents = Deno.readTextFileSync("./results/ad_format/" + file.name);
  console.log("Reading " + chalk.blue(file.name));

  try {
    const event = read_ad(contents);
    numFiles++;

    const set = file.name[0] === "e" ? "eights" : "torpids";
    const year = file.name.slice(1, 5);
    const gender = file.name[5] === "w" ? "women" : "men";
    const newFile = set + year + "_" + gender + ".txt";

    Deno.writeTextFileSync(
      "./results/tg_format/" + newFile,
      write_tg(abbreviate(event)),

    );

    console.log(
      "Successfully converted " + file.name + " to produce " + newFile
    );

  } catch (error) {
    console.error(error);
  }
}

console.log(`Found ${numFiles} files`);
