import { processResults, readFile } from "../src/bumps";

const parsed = await readFile(process.argv[2]);
const processed = parsed.event ? processResults(parsed.event) : undefined;
const errors = [...parsed.errors, ...(processed?.errors ?? [])];

for (const error of errors) {
  console.error(error);
}

if (errors.length > 0) {
  process.exitCode = 1;
}

process.stdout.write(JSON.stringify(processed?.event ?? parsed.event ?? null));
