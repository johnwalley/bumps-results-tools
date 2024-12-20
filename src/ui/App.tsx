import "react-bumps-chart/dist/style.css";
import "./App.css";

import { BumpsChart } from "react-bumps-chart";
import { Event } from "../types";
import data from "../../output/results/town/men/results.json";
import { useState } from "react";

function App() {
  return (
    <div>
      <div>
        <BumpsChart data={data[0] as any} />
      </div>
    </div>
  );
}

export default App;
