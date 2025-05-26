// src/components/Controls.jsx
import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Button } from "./ui/button";

const Controls = ({
  algorithm,
  setAlgorithm,
  generateCityMap,
  runAlgorithm,
  resetBoard,
  showComparison,
  setShowComparison,
  isRunning,
  startPoint,
  endPoint,
}) => {
  return (
    <div className="bg-white p-4 sm:p-6 rounded-xl shadow-lg">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 items-center">
        <Select
          value={algorithm}
          onValueChange={setAlgorithm}
          disabled={isRunning}
        >
          <SelectTrigger className="w-full h-10">
            <SelectValue placeholder="Algorithm" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="astar">A* Search</SelectItem>
            <SelectItem value="dijkstra">Dijkstra's</SelectItem>
            <SelectItem value="bfs">BFS</SelectItem>
            <SelectItem value="dfs">DFS</SelectItem>
          </SelectContent>
        </Select>

        <Button
          onClick={generateCityMap}
          disabled={isRunning}
          variant="outline"
          className="w-full h-10"
        >
          Generate City
        </Button>

        <Button
          onClick={runAlgorithm}
          disabled={!startPoint || !endPoint || isRunning}
          className="w-full h-10 bg-blue-600 hover:bg-blue-700 text-white col-span-1 sm:col-span-2 md:col-span-1"
        >
          {isRunning ? "Running..." : "Run Algorithm"}
        </Button>

        <Button
          onClick={resetBoard}
          disabled={isRunning}
          variant="outline"
          className="w-full h-10"
        >
          Reset Board
        </Button>

        <Button
          onClick={() => setShowComparison(!showComparison)}
          variant="outline"
          disabled={isRunning}
          className="w-full h-10"
        >
          {showComparison ? "Hide Stats" : "Show Stats"}
        </Button>
      </div>
    </div>
  );
};

export default Controls;
