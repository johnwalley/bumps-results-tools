# Bumps Results Tools

Tools for manipulating bumps results data.

Canonicial results data can be found at the [bumps-results](https://github.com/johnwalley/bumps-results) repository.

Use these tools to convert between formats and generate data suitable for use by [d3-bumps-chart](https://github.com/johnwalley/d3-bumps-chart). These tools are used to produce the data and charts found at [Cambridge Bumps](https://www.cambridgebumps.com).

## 📈 Using the UI

1. **Build the tools.**

   ```shell
   npm build
   ```

2. **Generate results file.**

   ```shell
   npm run results
   ```

3. **Copy results file to ui directory.**

   Next, move into your new site’s directory and start it up:

   ```shell
   cp ./generated.json ./ui
   ```

4. **Run a webserver!**

   For example

   ```shell
   npx http-server
   ```
