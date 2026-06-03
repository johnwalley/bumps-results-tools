import { processResults, readFile } from "../src/bumps";

const event = await readFile();

const processed = event === null ? event : (processResults(event) ?? event);

await Bun.write(Bun.stdout, JSON.stringify(processed));
