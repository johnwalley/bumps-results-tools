import chalk from "https://deno.land/x/chalk_deno@v4.1.1-deno/source/index.js"
import { abbreviate, read_tg, write_ad } from "../dist/bumps-results-tools.js";

const setMap: { [key: string]: string } = {
  eights: "e",
  torpids: "t",
  mays: "m",
  lents: "l",
  town: "town",
};

const genderMap: { [key: string]: string } = {
  men: "m",
  women: "w",
};

let numFiles = 0;


for (const file of Deno.readDirSync("./results/tg_format/")) {
  const contents = Deno.readTextFileSync("./results/tg_format/" + file.name);
  console.log("Reading " + chalk.blue(file.name));

  try {
    const event = read_tg(contents);
    numFiles++;

    const set = setMap[/^[a-z]+/g.exec(file.name)![0]];
    const year = /[0-9]+/g.exec(file.name)![0];
    const gender = genderMap[file.name.match(/[a-z]+/g)![1]];

    const newFile = set + year + gender + ".txt";

    Deno.writeTextFileSync(
      "./results/ad_format/" + newFile,
      write_ad(abbreviate(event))
    );

    console.log(
      "Successfully converted " + chalk.blue(file.name) + " to produce " + chalk.blue(newFile)
    );
  } catch (error) {
    console.error(error);
  }
}

console.log(`Found ${numFiles} files`);

