import fs from "fs";
import { processResults, readFile } from "../src/bumps";
import { roman } from "../src/abbreviations";
import { type Event } from "../src/types";

const setMap: Record<string, string> = {
  eights: "e",
  torpids: "t",
  mays: "m",
  lents: "l",
  town: "town",
};

const genderMap: Record<string, string> = {
  men: "m",
  women: "w",
};

function renderName(crew: Event["crews"][number], isTown: boolean): string {
  return isTown && crew.number === 1 ? `${crew.start} 1` : crew.start;
}

function writeAd(event: Event): string {
  if (!event.div_size || !event.move) {
    throw new Error(`Event ${event.short} ${event.year} has no processed results`);
  }

  const startingDivs = event.div_size[0];
  const nDivs = startingDivs.length;
  const nCrews = event.crews.length;
  const genderStr = event.gender === "Men" ? "Men's" : "Women's";
  const isTown = event.short === "Town";

  let out = `${event.short.toUpperCase()} ${event.year}\n`;
  out += ` ${event.days}  ${nDivs}  ${nCrews}   = NDay, NDiv, NCrew\n`;

  let crewIndex = 0;
  for (let d = 0; d < nDivs; d++) {
    const size = startingDivs[d];
    out += ` ${size}  ${genderStr} Div ${roman[d]}\n`;

    for (let p = 0; p < size; p++) {
      const crew = event.crews[crewIndex];
      let line = renderName(crew, isTown).padEnd(25);
      let pos = crewIndex;
      for (let day = 0; day < event.days; day++) {
        const m = event.move[day][pos] ?? 0;
        line += String(m).padStart(4);
        pos -= m;
      }
      out += line + "\n";
      crewIndex++;
    }
  }

  return out;
}

if (!fs.existsSync("./results/ad_format/")) {
  fs.mkdirSync("./results/ad_format/");
}

const files = fs.readdirSync("./results/tg_format/").sort();
let numConverted = 0;
let numSkipped = 0;

for (const file of files) {
  const setMatch = /^[a-z]+/.exec(file);
  const yearMatch = /[0-9]+/.exec(file);
  const allWords = file.match(/[a-z]+/g);

  if (!setMatch || !yearMatch || !allWords || allWords.length < 2) {
    console.warn(`Skipping ${file}: unrecognised filename`);
    numSkipped++;
    continue;
  }

  const set = setMap[setMatch[0]];
  const gender = genderMap[allWords[1]];
  const year = yearMatch[0];

  if (!set || !gender) {
    console.warn(`Skipping ${file}: unknown set/gender`);
    numSkipped++;
    continue;
  }

  const event = await readFile("./results/tg_format/" + file);

  if (!event || event.crews.length === 0) {
    console.warn(`Skipping ${file}: parse failed or no crews`);
    numSkipped++;
    continue;
  }

  processResults(event);

  const newFile = `${set}${year}${gender}.txt`;

  try {
    const ad = writeAd(event);
    fs.writeFileSync("./results/ad_format/" + newFile, ad);
    numConverted++;
  } catch (err) {
    console.error(`Failed to convert ${file}:`, err);
    numSkipped++;
  }
}

console.log(`Converted ${numConverted} files, skipped ${numSkipped}`);
