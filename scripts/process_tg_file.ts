import { processResults, readFile } from "../src/bumps";

const event = await readFile();

const processed = event === null ? event : (processResults(event) ?? event);

process.stdout.write(JSON.stringify(processed));
