import "react-bumps-chart/dist/style.css";
import "./App.css";

import { processResults, readEvent, stepOn, writeString } from "../bumps";
import { useMemo, useState } from "react";

import { BumpsChart } from "react-bumps-chart";
import { Event } from "../types";
import results from "../../output/results/results.json";
import txt from "../../results/tg_format/mays1855_men.txt?raw";

function App() {
  const [state, setState] = useState(txt);

  const data = useMemo(() => {
    try {
      const event = readEvent(state);

      processResults(event!, false);

      return event;
    } catch (e) {
      return null;
    }
  }, [state]);

  const handleSelectEvent = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;

    const [event, gender, year] = value.split("/");

    const res = await fetch(
      `./results/${event}${year}_${gender}.txt?raw`.toLocaleLowerCase(),
    );

    const txt = await res.text();
    setState(txt);
  };

  const handleNextYear = () => {
    const nextYear = writeString(stepOn(data as Event));

    setState(nextYear);
  };

  return (
    <div>
      <select onChange={handleSelectEvent}>
        {Object.keys(results).flatMap((short) =>
          ["Men", "Women"].flatMap((gender) =>
            results[short as "Lents"][gender as "Men" | "Women"]
              .filter(
                (year) => !results[short as "Mays"]["split"].includes(year),
              )
              .map((year) => (
                <option
                  key={`${short} ${gender} ${year}`}
                  value={`${short}/${gender}/${year}`}
                >
                  {`${short} ${gender} ${year}`}
                </option>
              )),
          ),
        )}
      </select>
      <button className="text-gray-900" onClick={handleNextYear}>
        Generate next years starting positions
      </button>
      <div className="flex flex-row h-screen">
        <div className="flex-1 overflow-auto max-w-[640px]">
          <textarea
            className="h-full w-full resize-none bg-transparent px-3 py-1.5 text-base font-mono text-gray-900"
            name="tg_format"
            spellCheck="false"
            value={state}
            onChange={(e) => setState(e.target.value)}
          />
        </div>
        <div className="flex-1 h-screen max-w-[240px] overflow-auto">
          {data && <BumpsChart data={data} />}
        </div>
      </div>
    </div>
  );
}

export default App;
