import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import pkg from "./package.json";
import typescript from "@rollup/plugin-typescript";

export default [
  // browser-friendly UMD build
  {
    input: "src/index.ts",
    output: {
      name: "bumpsResultsTools",
      file: pkg.browser,
      format: "umd",
    },
    plugins: [resolve(), typescript(), commonjs()],
  },
  {
    input: "src/index.ts",
    external: ["lodash", "d3"],
    output: [
      { file: pkg.main, format: "cjs" },
      { file: pkg.module, format: "es" },
    ],
    plugins: [typescript()],
  },
];
