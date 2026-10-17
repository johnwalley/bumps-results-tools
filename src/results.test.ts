import fs from "node:fs";
import { expect, test } from "vitest";
import { processResults, readFile } from "./bumps";

const TG_DIR = "./results/tg_format/";

test.each(fs.readdirSync(TG_DIR).sort())(
  "%s parses and processes without errors",
  async (file) => {
    const parsed = await readFile(TG_DIR + file);
    expect(parsed.errors).toEqual([]);

    const processed = processResults(parsed.event!);
    expect(processed.errors).toEqual([]);
  },
);
