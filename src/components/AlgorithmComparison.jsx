// src/components/AlgorithmComparison.jsx
import React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "./ui/card";
import { calculateEfficiencyScore } from "../utils/analyticsUtils";

const AlgorithmComparison = ({ algorithmHistory }) => {
  if (!algorithmHistory || algorithmHistory.length === 0) {
    return null;
  }

  const getAlgorithmName = (algoKey) => {
    switch (algoKey) {
      case "astar":
        return "A* Search";
      case "dijkstra":
        return "Dijkstra's";
      case "bfs":
        return "BFS";
      case "dfs":
        return "DFS";
      default:
        return algoKey;
    }
  };

  return (
    <Card className="shadow-xl bg-white">
      <CardHeader className="px-4 py-3 sm:px-6 sm:py-4 border-b border-slate-200">
        <CardTitle className="text-lg sm:text-xl font-semibold text-slate-700">
          Algorithm Performance
        </CardTitle>
        <CardDescription className="text-sm text-slate-500">
          Comparison of recent runs.
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th
                  scope="col"
                  className="px-3 py-2 sm:px-4 sm:py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider"
                >
                  Algorithm
                </th>
                <th
                  scope="col"
                  className="px-3 py-2 sm:px-4 sm:py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider"
                >
                  Nodes
                </th>
                <th
                  scope="col"
                  className="px-3 py-2 sm:px-4 sm:py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider"
                >
                  Path
                </th>
                <th
                  scope="col"
                  className="px-3 py-2 sm:px-4 sm:py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider"
                >
                  Time (s)
                </th>
                <th
                  scope="col"
                  className="px-3 py-2 sm:px-4 sm:py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider"
                >
                  Efficiency
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {algorithmHistory.map((run, index) => (
                <tr
                  key={index}
                  className={
                    index % 2 === 0
                      ? "bg-white"
                      : "bg-slate-50/50 hover:bg-slate-100/70"
                  }
                >
                  <td className="px-3 py-3 sm:px-4 sm:py-3.5 whitespace-nowrap text-sm font-medium text-slate-800">
                    {getAlgorithmName(run.algorithm)}
                  </td>
                  <td className="px-3 py-3 sm:px-4 sm:py-3.5 whitespace-nowrap text-sm text-slate-600">
                    {run.nodesExplored}
                  </td>
                  <td className="px-3 py-3 sm:px-4 sm:py-3.5 whitespace-nowrap text-sm text-slate-600">
                    {run.pathLength}
                  </td>
                  <td className="px-3 py-3 sm:px-4 sm:py-3.5 whitespace-nowrap text-sm text-slate-600">
                    {run.executionTime.toFixed(2)}
                  </td>
                  <td className="px-3 py-3 sm:px-4 sm:py-3.5 whitespace-nowrap text-sm text-slate-600">
                    {calculateEfficiencyScore(
                      run.nodesExplored,
                      run.pathLength
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {algorithmHistory.length > 0 && (
          <div className="px-4 py-3 sm:px-6 border-t border-slate-200 text-xs text-slate-500">
            Efficiency Score: Nodes Explored / Path Length (lower is better).
            Table shows last {algorithmHistory.length} runs.
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AlgorithmComparison;
