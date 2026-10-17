import chalk from "chalk";
import fs from "fs";
import { processResults, readFile } from "../src/bumps";
import { type Event, type ProcessedEvent } from "../src/types";

const TG_DIR = "./results/tg_format/";

export type LoadedEvent = { event: Event; processed: ProcessedEvent };

/**
 * Reads and processes every TG file. If any file has errors they are all
 * reported and the process exits non-zero, so nothing is generated from bad
 * data.
 */
export async function loadEvents(): Promise<LoadedEvent[]> {
  const files = fs.readdirSync(TG_DIR).sort();
  const loaded: LoadedEvent[] = [];
  let failed = 0;

  for (const file of files) {
    const parsed = await readFile(TG_DIR + file);
    const processed = parsed.event ? processResults(parsed.event) : undefined;
    const errors = [...parsed.errors, ...(processed?.errors ?? [])];

    if (errors.length > 0 || !parsed.event || !processed?.event) {
      failed++;
      console.error(chalk.red(`${file}:`));

      for (const error of errors) {
        console.error(`  ${error}`);
      }

      continue;
    }

    loaded.push({ event: parsed.event, processed: processed.event });
  }

  if (failed > 0) {
    console.error(chalk.red(`${failed} file(s) have errors; nothing written`));
    process.exit(1);
  }

  console.log(`Found ${chalk.blue(`${loaded.length}`)} files`);

  return loaded;
}
