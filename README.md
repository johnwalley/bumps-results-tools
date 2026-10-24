# Bumps Results Tools

> [!IMPORTANT]
> The results tools and data are now in [johnwalley/rowing](https://github.com/johnwalley/rowing/tree/main/packages/bumps-results-tools), alongside the other rowing packages. This repository is archived: make results changes there, where merging still opens the sync PRs for the site and [bumps-results](https://github.com/johnwalley/bumps-results).

![](https://github.com/johnwalley/bumps-results-tools/workflows/Node%20CI/badge.svg)

Tools for manipulating bumps results data.

Canonicial results data can be found at the [bumps-results](https://github.com/johnwalley/bumps-results) repository.

Use these tools to convert between formats and generate data suitable for use by [d3-bumps-chart](https://github.com/johnwalley/d3-bumps-chart) and [react-bumps-chart](https://github.com/johnwalley/react-bumps-chart). These tools are used to produce the data and charts found at [Cambridge Bumps](https://www.cambridgebumps.com).

## 🛠️ Setup

Requires Node 24+ and [pnpm](https://pnpm.io) (`corepack enable` will provide the pinned version).

```shell
pnpm install
```

Run the tests with:

```shell
pnpm test
```

## 📈 Using the UI

Start the Vite dev server:

```shell
pnpm run dev
```

To produce a production build:

```shell
pnpm run build
```

Then preview the built app with:

```shell
pnpm run preview
```

## 🗂️ Regenerating results and stats

The website's data is produced from the TG-format sources under
`results/tg_format/`. To regenerate both result and statistics JSON, run:

```shell
pnpm run generate
```

Or run them individually:

```shell
pnpm run generate:results   # writes output/results/<event>/<gender>/
pnpm run generate:stats     # writes output/stats/<event>/<gender>/stats.json
```

You don't normally need to copy these anywhere by hand: every push to `main`
opens a PR in [cambridgebumps.com](https://github.com/johnwalley/cambridgebumps.com)
with the regenerated data, and one in [bumps-results](https://github.com/johnwalley/bumps-results)
with the TG and AD files (see `.github/workflows/sync-downstream.yml`).
