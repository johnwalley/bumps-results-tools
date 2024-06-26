import { processResults, readFile } from "../src/bumps";

const event = await readFile();

if (event !== null) {
  processResults(event);
}

await Bun.write(Bun.stdout, JSON.stringify(event));
