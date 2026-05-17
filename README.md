# Bumps Results Tools

![](https://github.com/johnwalley/bumps-results-tools/workflows/Node%20CI/badge.svg)

Tools for manipulating bumps results data.

Canonicial results data can be found at the [bumps-results](https://github.com/johnwalley/bumps-results) repository.

Use these tools to convert between formats and generate data suitable for use by [d3-bumps-chart](https://github.com/johnwalley/d3-bumps-chart) and [react-bumps-chart](https://github.com/johnwalley/react-bumps-chart). These tools are used to produce the data and charts found at [Cambridge Bumps](https://www.cambridgebumps.com).

## 📈 Using the UI

Start the Vite dev server:

```shell
bun run dev
```

To produce a production build:

```shell
bun run build
```

Then preview the built app with:

```shell
bun run preview
```

## 🗂️ Regenerating results and stats

The website's data is produced from the TG-format sources under
`results/tg_format/`. To regenerate both result and statistics JSON, run:

```shell
bun run generate
```

Or run them individually:

```shell
bun run generate:results   # writes output/results/<event>/<gender>/
bun run generate:stats     # writes output/stats/<event>/<gender>/stats.json
```
