import "react-bumps-chart/dist/index.css";
import "./App.css";

import { processResults, readEvent, stepOn, writeString } from "../bumps";
import { ComponentProps, useEffect, useMemo, useState } from "react";

import { BumpsChart } from "react-bumps-chart";
import { Event } from "../types";
import { resultFiles } from "./results";

type BumpsChartData = ComponentProps<typeof BumpsChart>["data"];

const DEFAULT_RESULT = "torpids2025_men";

const resultGroups = Object.groupBy(
  resultFiles,
  (file) => `${file.set} ${file.gender}`,
);

function App() {
  const [selected, setSelected] = useState(DEFAULT_RESULT);
  const [state, setState] = useState("");

  useEffect(() => {
    let cancelled = false;

    resultFiles
      .find((file) => file.id === selected)
      ?.load()
      .then((text) => {
        if (!cancelled) {
          setState(text);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [selected]);

  const { data, errors } = useMemo(() => {
    try {
      const parsed = readEvent(state);

      if (!parsed.event) {
        return { data: null, errors: parsed.errors };
      }

      const processed = processResults(parsed.event, false);

      return {
        data: processed.event ?? null,
        errors: [...parsed.errors, ...processed.errors],
      };
    } catch (e) {
      return { data: null, errors: [String(e)] };
    }
  }, [state]);

  const handleNextYear = () => {
    if (!data) {
      return;
    }

    const nextYear = writeString(stepOn(data as Event));

    setState(nextYear);
  };

  return (
    <div className="bg-white dark:bg-gray-800">
      <div className="flex flex-row h-screen">
        <div className="flex-1 overflow-auto flex flex-col">
          <div>
            <select
              value={selected}
              onChange={(e) => setSelected(e.target.value)}
            >
              {Object.entries(resultGroups).map(([group, files]) => (
                <optgroup key={group} label={group}>
                  {files!.map((file) => (
                    <option key={file.id} value={file.id}>
                      {`${group} ${file.year}`}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
            <button
              type="button"
              className="rounded bg-sky-600 px-2 py-1 text-xs font-semibold text-white shadow-sm hover:bg-sky-500 focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-sky-600"
              onClick={handleNextYear}
            >
              Generate next years starting positions
            </button>
          </div>
          {errors.length > 0 && (
            <ul className="m-2 rounded border border-red-300 bg-red-50 px-3 py-2 font-mono text-sm text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-200">
              {errors.map((error, i) => (
                <li key={i} className="whitespace-pre-wrap">
                  {error}
                </li>
              ))}
            </ul>
          )}
          <div className="flex-1">
            <textarea
              className="h-full w-full resize-none bg-transparent px-3 py-1.5 text-base font-mono text-gray-900 dark:text-white"
              name="tg_format"
              spellCheck="false"
              value={state}
              onChange={(e) => setState(e.target.value)}
            />
          </div>
        </div>
        <div className="flex-1 h-screen max-w-[480px] overflow-auto">
          {data?.div_size && <BumpsChart data={data as BumpsChartData} />}
        </div>
      </div>
    </div>
  );
}

export default App;
