# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Tools for manipulating bumps rowing results data (Cambridge Bumps, Oxford Summer Eights, Torpids, Town Bumps). Produces data and charts for cambridgebumps.com. Related repositories: [bumps-results](https://github.com/johnwalley/bumps-results), [d3-bumps-chart](https://github.com/johnwalley/d3-bumps-chart), [react-bumps-chart](https://github.com/johnwalley/react-bumps-chart).

The repo is a Node (24+) + TypeScript project using pnpm. Scripts run via `tsx`; tests use Vitest. The UI is a Vite + React 19 + Tailwind 4 app under `src/ui/`. Builds use `tsgo` (`@typescript/native-preview`) for type-checking and Vite 8 for bundling.

## Commands

```bash
# Development server (Vite + React UI)
pnpm run dev

# Type-check (src + scripts) + production build
pnpm run build

# Type-check only (src via tsconfig.json, scripts via tsconfig.scripts.json)
pnpm run typecheck

# Format / check formatting (CI runs format:check)
pnpm run format
pnpm run format:check

# Preview the production build
pnpm run preview

# Regenerate per-event results + per-club stats JSON for the website
pnpm run generate            # both
pnpm run generate:results    # event-level results only → output/results/
pnpm run generate:stats      # per-club statistics only → output/stats/

# Run tests
pnpm test

# Run a single test file
pnpm vitest run src/bumps.test.ts
```

## Architecture

### Core Library (`src/`)

- **bumps.ts** - Parser, processor, and serializer. Key functions:
  - `readEvent(text)` - Parses TG format text into `{ event: Event | null, errors }`
  - `readFile(path?)` - Reads a TG format file via `node:fs` (or stdin when `path` is omitted) and returns the same shape as `readEvent`. Node builtins are imported lazily inside the function because `bumps.ts` is also bundled into the browser UI — keep it that way
  - `processResults(event, debug?)` - Computes crew movements, blades, gains from result codes. Returns `{ event, errors }`; on error it stops and returns the partially processed event. Unrecognised result codes are errors. Problems are returned, never logged — `console.log` is only for `debug` tracing
  - `stepOn(event)` - Generates next year's starting positions from current results
  - `writeString(event)` - Serializes an `Event` back to TG format
  - `writeWeb(events)` - Builds the per-set/per-gender year manifest consumed by the UI

- **types.ts** - Zod schemas and TypeScript types for `Event`, `Crew`, and `Statistics`

- **abbreviations.ts** - Club abbreviation mappings per event set: Cambridge colleges (`ccol`), Oxford colleges (`ocol`), Town clubs (`cra`), plus `sets` (short → long name) and a `roman` numeral table

- **club-mappings.ts** - Display-name mappings (`clubMapping`, `clubMappingFull`) for normalising historical club names

- **stats.ts** - `getStats(events, combine?)` aggregates per-club statistics (headships, crews entered, blades, highest positions) across an array of `Event`s. Pure JS; downstream ranking/sorting is done with Arquero in `scripts/generate_stats.ts`

- **math.ts** - Histogram + summary statistics helpers (`mean`, `variance`, `standardDeviation`, histogram variants)

- **utils.ts** - Small helpers (`range`, etc.) shared by core and scripts

- **bumps.test.ts** - Vitest suite for the core library

- **results.test.ts** - Parses and processes every file in `results/tg_format/` and fails on any error, so a typo in new results data breaks CI

### UI (`src/ui/`)

React app rendered through Vite. `App.tsx` is a split-pane editor:

- Left: a `<select>` listing every TG file (grouped by set and gender) and a `<textarea>` for live editing of TG-format text
- Right: a `BumpsChart` from `react-bumps-chart` that re-renders as the textarea changes
- A "Generate next years starting positions" button runs `stepOn` + `writeString` to seed next year's TG text from the currently loaded event

`src/ui/results.ts` imports TG files straight from `results/tg_format/` via `import.meta.glob` (lazy, one chunk per file), so the UI always matches the canonical data — don't reintroduce copies under `public/`. Styling is Tailwind 4 via `@tailwindcss/vite`.

### Scripts (`scripts/`)

- **load_events.ts** - Shared loader for the generate scripts: reads and processes every TG file, and if any file has errors prints them all and exits non-zero before anything is written
- **generate_results.ts** - Reads every file in `results/tg_format/`, runs `processResults`, writes `output/results/results.json` (year manifest) and `output/results/<set>/<gender>/results.json` (per-set processed events)
- **generate_stats.ts** - Same input, runs `getStats` and Arquero-based ranking, writes `output/stats/<set>/<gender>/stats.json` (headships, crewsEntered, headDays, headLong, bladesAwarded). Output is Prettier-formatted JSON
- **process_tg_file.ts** - Filter: reads TG from stdin (or a path), runs `processResults`, writes JSON to stdout and errors to stderr (exit 1 on error)
- **convert_rssbc_to_tg.ts** - Converts the historical RSSBC JSON (under `results/rssbc/`) to TG format
- **download_rssbc_results.ts** - Fetches RSSBC API data into `results/rssbc/`
- **convert_tg_to_ad.ts**, **convert_ad_to_tg.js**, **normalize_ad.js**, **normalize.js** - Legacy converters for the Anu Dudhia (`ad`) format
- **data/** - Cached RSSBC raw text dumps used by the converters

### Results Data

- **results/tg_format/** - Canonical source results in TG format (text files, ~1050 files spanning Eights, Lents, Mays, Torpids, Town from the 1800s onward)
- **results/rssbc/**, **results/dudhia/**, **results/dudhia_per_crew/**, **results/ad_format/**, **results/mcshane/** - Historical / alternate-format source data used by the conversion scripts in `scripts/`
- **output/** - Generated by `pnpm run generate`; not checked in as source of truth. Contains `output/results/{set}/{gender}/results.json` and `output/stats/{set}/{gender}/stats.json` for consumption by the cambridgebumps.com site

## TG Format

The text-based input format for results:

```
Set,May Bumps
Short,Mays
Gender,Men
Year,2024

Division,Ca,L,M,K,E,Pb,J,...
Division,HH,TH,F,Cr,...

Results
rrurrru uuro3uurruur...
```

Result codes (processed bottom-up, starting from sandwich boat):

- `r` - rowover (no change)
- `u` - bump up
- `o3` - overbump by 3 places
- `e-2` - exact move down 2 places
- `t` - skip division
- `x` - crew withdrawn
- `w3` - washing machine of 3 crews
