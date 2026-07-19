import { processResults, readFile } from "../src/bumps";
import { detectAnomalies, type Anomaly } from "../src/anomalies";

import chalk from "chalk";
import fs from "fs";

/**
 * Scan TG-format result files for behaviourally implausible results (likely
 * transcription errors) and print a severity-ranked report.
 *
 *   bun run detect:anomalies                       # scan all results/tg_format
 *   bun run detect:anomalies path/to/file.txt      # scan a single file
 *   bun run detect:anomalies --min-severity 70     # only show severe anomalies
 *   bun run detect:anomalies --json                # machine-readable output
 */

const TG_DIR = "./results/tg_format/";

const args = process.argv.slice(2);
// Default hides the long tail of common-but-legitimate events; pass
// `--min-severity 0` to see everything.
let minSeverity = 50;
let asJson = false;
const paths: string[] = [];

for (let i = 0; i < args.length; i++) {
  const arg = args[i];
  if (arg === "--json") {
    asJson = true;
  } else if (arg === "--min-severity") {
    minSeverity = Number(args[++i] ?? 0);
  } else if (arg.startsWith("--min-severity=")) {
    minSeverity = Number(arg.split("=")[1]);
  } else {
    paths.push(arg);
  }
}

const files =
  paths.length > 0
    ? paths
    : fs
        .readdirSync(TG_DIR)
        .filter((f) => f.endsWith(".txt"))
        .sort()
        .map((f) => TG_DIR + f);

interface FileReport {
  file: string;
  label: string;
  anomalies: Anomaly[];
}

const reports: FileReport[] = [];
let skipped = 0;

for (const file of files) {
  const event = await readFile(file);
  if (!event || event.crews.length === 0) {
    console.warn(chalk.gray(`Skipping ${file}: parse failed or no crews`));
    skipped++;
    continue;
  }

  const processed = processResults(event);
  if (!processed) {
    console.warn(chalk.gray(`Skipping ${file}: could not process results`));
    skipped++;
    continue;
  }

  const anomalies = detectAnomalies(processed).filter(
    (a) => a.severity >= minSeverity,
  );

  if (anomalies.length > 0) {
    reports.push({
      file,
      label: `${event.set} ${event.year} ${event.gender}`,
      anomalies,
    });
  }
}

if (asJson) {
  console.log(JSON.stringify(reports, null, 2));
  process.exit(0);
}

const severityColour = (s: number) =>
  s >= 70 ? chalk.red : s >= 50 ? chalk.yellow : chalk.gray;

const kindColour: Record<Anomaly["kind"], (s: string) => string> = {
  oscillation: chalk.magenta,
  performance: chalk.cyan,
  "large-overbump": chalk.blue,
};

const totals: Record<string, number> = {};
let totalAnomalies = 0;

for (const report of reports) {
  console.log("");
  console.log(chalk.bold.underline(`${report.label}  ${chalk.gray(report.file)}`));

  for (const a of report.anomalies) {
    totalAnomalies++;
    totals[a.kind] = (totals[a.kind] ?? 0) + 1;

    const sev = severityColour(a.severity)(`[${String(a.severity).padStart(3)}]`);
    const where =
      a.division === null ? `day ${a.day}` : `day ${a.day} div ${a.division}`;
    const kind = kindColour[a.kind](a.kind);
    console.log(`  ${sev} ${where} ${kind} — ${a.message}`);
  }
}

console.log("");
console.log(chalk.bold("Summary"));
console.log(
  `  Scanned ${chalk.blue(`${files.length}`)} file(s), skipped ${chalk.gray(
    `${skipped}`,
  )}`,
);
console.log(
  `  ${chalk.blue(`${totalAnomalies}`)} anomaly(ies) across ${chalk.blue(
    `${reports.length}`,
  )} file(s)`,
);
for (const [kind, count] of Object.entries(totals).sort((a, b) => b[1] - a[1])) {
  console.log(`    ${kindColour[kind as Anomaly["kind"]](kind)}: ${count}`);
}
