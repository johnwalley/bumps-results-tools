# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Tools for manipulating bumps rowing results data (Cambridge Bumps, Oxford Summer Eights, Torpids, Town Bumps). Produces data and charts for cambridgebumps.com. Related repositories: [bumps-results](https://github.com/johnwalley/bumps-results), [d3-bumps-chart](https://github.com/johnwalley/d3-bumps-chart), [react-bumps-chart](https://github.com/johnwalley/react-bumps-chart).

The repo is a Bun + TypeScript project. The UI is a Vite + React 19 + Tailwind 4 app under `src/ui/`. Builds use `tsgo` (`@typescript/native-preview`) for type-checking and Vite 8 for bundling.

## Commands

```bash
# Development server (Vite + React UI)
bun run dev

# Type-check + production build
bun run build

# Preview the production build
bun run preview

# Regenerate per-event results + per-club stats JSON for the website
bun run generate            # both
bun run generate:results    # event-level results only → output/results/
bun run generate:stats      # per-club statistics only → output/stats/

# Run tests
bun test

# Run a single test file
bun test src/bumps.test.ts
```

## Architecture

### Core Library (`src/`)

- **bumps.ts** - Parser, processor, and serializer. Key functions:
  - `readEvent(text)` - Parses TG format text into an `Event` object
  - `readFile(path?)` - Reads a TG format file via `Bun.file` (or stdin when `path` is omitted)
  - `processResults(event, debug?)` - Computes crew movements, blades, gains from result codes
  - `stepOn(event)` - Generates next year's starting positions from current results
  - `writeString(event)` - Serializes an `Event` back to TG format
  - `writeWeb(events)` - Builds the per-set/per-gender year manifest consumed by the UI

- **types.ts** - Zod schemas and TypeScript types for `Event`, `Crew`, and `Statistics`

- **abbreviations.ts** - Club abbreviation mappings per event set: Cambridge colleges (`ccol`), Oxford colleges (`ocol`), Town clubs (`cra`), plus `sets` (short → long name) and a `roman` numeral table

- **club-mappings.ts** - Display-name mappings (`clubMapping`, `clubMappingFull`) for normalising historical club names

- **stats.ts** - `getStats(events, combine?)` aggregates per-club statistics (headships, crews entered, blades, highest positions) across an array of `Event`s. Pure JS; downstream ranking/sorting is done with Arquero in `scripts/generate_stats.ts`

- **math.ts** - Histogram + summary statistics helpers (`mean`, `variance`, `standardDeviation`, histogram variants)

- **utils.ts** - Small helpers (`range`, etc.) shared by core and scripts

- **years.json** - Static per-set/per-gender list of years for which TG-format source data exists

- **bumps.test.ts** - Bun test suite for the core library

- **archive/** - Legacy JS helpers kept for reference only; not imported by current code

- **index.ts** - Empty entry point (the package's `module` field points here but nothing is re-exported yet)

### UI (`src/ui/`)

React app rendered through Vite. `App.tsx` is a split-pane editor:
- Left: a `<select>` driven by `src/ui/results/results.json` (the bundled year manifest) and a `<textarea>` for live editing of TG-format text
- Right: a `BumpsChart` from `react-bumps-chart` that re-renders as the textarea changes
- A "Generate next years starting positions" button runs `stepOn` + `writeString` to seed next year's TG text from the currently loaded event

TG files are fetched at runtime from `./results/<event><year>_<gender>.txt`, served out of `public/results/`. Styling is Tailwind 4 via `@tailwindcss/vite`.

### Scripts (`scripts/`)

- **generate_results.ts** - Reads every file in `results/tg_format/`, runs `processResults`, writes `output/results/results.json` (year manifest) and `output/results/<set>/<gender>/results.json` (per-set processed events)
- **generate_stats.ts** - Same input, runs `getStats` and Arquero-based ranking, writes `output/stats/<set>/<gender>/stats.json` (headships, crewsEntered, headDays, headLong, bladesAwarded). Output is Prettier-formatted JSON
- **process_tg_file.ts** - Filter: reads TG from stdin (or a path), runs `processResults`, writes JSON to stdout
- **convert_rssbc_to_tg.ts** - Converts the historical RSSBC JSON (under `results/rssbc/`) to TG format
- **download_rssbc_results.ts** - Fetches RSSBC API data into `results/rssbc/`
- **convert_tg_to_ad.ts**, **convert_ad_to_tg.js**, **normalize_ad.js**, **normalize.js** - Legacy converters for the Anu Dudhia (`ad`) format
- **data/** - Cached RSSBC raw text dumps used by the converters

### Results Data

- **results/tg_format/** - Canonical source results in TG format (text files, ~1050 files spanning Eights, Lents, Mays, Torpids, Town from the 1800s onward)
- **results/rssbc/**, **results/dudhia/**, **results/dudhia_per_crew/**, **results/ad_format/**, **results/mcshane/** - Historical / alternate-format source data used by the conversion scripts in `scripts/`
- **public/results/** - Per-event TG-format files served at runtime by the UI via `fetch("./results/<event><year>_<gender>.txt")`; kept in sync with `results/tg_format/`
- **src/ui/results/results.json** - Bundle-time year manifest imported directly by `App.tsx`
- **output/** - Generated by `bun run generate`; not checked in as source of truth. Contains `output/results/{set}/{gender}/results.json` and `output/stats/{set}/{gender}/stats.json` for consumption by the cambridgebumps.com site

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
