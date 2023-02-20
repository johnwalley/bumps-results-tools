import chalk from "https://deno.land/x/chalk_deno@v4.1.1-deno/source/index.js"

import { read_tg, write_tg } from "../dist/bumps-results-tools.js";

for (const file of Deno.readDirSync("./results/tg_format/")) {
  const contents = Deno.readTextFileSync("./results/tg_format/" + file.name);

  const actual = write_tg(read_tg(contents));

  Deno.writeTextFileSync("./results/tg_format/" + file.name, actual);
  console.log("Successfully normalized " + chalk.blue(file.name));
};
