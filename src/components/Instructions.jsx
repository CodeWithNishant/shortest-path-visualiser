// src/components/Instructions.jsx
import React from "react";

const Instructions = () => {
  return (
    <div className="bg-white p-4 sm:p-6 rounded-xl shadow-lg text-sm text-slate-700">
      <h3 className="text-md sm:text-lg font-semibold text-slate-800 mb-3">
        How to Use:
      </h3>
      <ul className="list-decimal list-outside space-y-1.5 pl-5 marker:text-blue-600">
        <li>
          Click on the grid to place the{" "}
          <strong className="text-green-600">Start Point</strong> (green).
        </li>
        <li>
          Click again to place the{" "}
          <strong className="text-red-600">End Point</strong> (red).
        </li>
        <li>
          Subsequent clicks will toggle{" "}
          <strong className="text-slate-700">Walls</strong> (dark gray).
        </li>
        <li>Alternatively, use "Generate City" for a pre-made map.</li>
        <li>Select an algorithm from the dropdown.</li>
        <li>Click "Run Algorithm" to visualize the pathfinding process.</li>
        <li>Use "Reset Board" to clear points, walls, and path.</li>
      </ul>

      <h3 className="text-md sm:text-lg font-semibold text-slate-800 mt-5 mb-3">
        Algorithm Notes:
      </h3>
      <ul className="list-disc list-outside space-y-1.5 pl-5 marker:text-blue-600">
        <li>
          <strong>A* (A-Star):</strong> Uses heuristics (Manhattan distance) to
          efficiently find the shortest path. Often explores fewer nodes than
          Dijkstra's.
        </li>
        <li>
          <strong>Dijkstra's:</strong> Explores outwards, guaranteeing the
          shortest path in graphs with non-negative edge weights. Typically
          explores more nodes than A*.
        </li>
        <li>
          <strong>BFS (Breadth-First Search):</strong> Explores layer by layer.
          Guarantees the shortest path in terms of number of steps (unweighted
          graphs).
        </li>
        <li>
          <strong>DFS (Depth-First Search):</strong> Explores as far as possible
          along each branch before backtracking. Does not guarantee the shortest
          path.
        </li>
      </ul>
    </div>
  );
};

export default Instructions;
