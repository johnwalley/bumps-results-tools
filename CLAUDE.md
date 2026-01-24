# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Tools for manipulating bumps rowing results data (Cambridge Bumps, Oxford Summer Eights, Torpids, Town Bumps). Produces data and charts for cambridgebumps.com. Related repositories: [bumps-results](https://github.com/johnwalley/bumps-results), [d3-bumps-chart](https://github.com/johnwalley/d3-bumps-chart), [react-bumps-chart](https://github.com/johnwalley/react-bumps-chart).

## Commands

```bash
# Development server (Vite + React UI)
npm run dev

# Build
npm run build

# Run tests (Bun)
bun test

# Run a single test file
bun test src/bumps.test.ts
```

## Architecture

### Core Library (`src/`)

- **bumps.ts** - Main parser and processor. Key functions:
  - `readEvent(text)` - Parses TG format text into an `Event` object
  - `readFile(path)` - Reads and parses a TG format file (uses Bun.file)
  - `processResults(event)` - Computes crew movements, blades, gains from result codes
  - `stepOn(event)` - Generates next year's starting positions from current results
  - `writeString(event)` - Serializes an Event back to TG format

- **types.ts** - Zod schemas and TypeScript types for `Event` and `Crew`

- **abbreviations.ts** - Club abbreviation mappings for each event set (Cambridge colleges in `ccol`, Oxford colleges in `ocol`, Town clubs in `cra`)

- **stats.ts** - Statistical analysis using Arquero (headships, crews entered per year)

### UI (`src/ui/`)

React application (via Vite) for visualizing and editing bumps results. Uses `react-bumps-chart` for rendering and Tailwind for styling.

### Results Data

- **results/tg_format/** - Source results in TG format (text files)
- **results/rssbc/** - Historical results in JSON format
- **public/results/** - Results served by the UI

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
