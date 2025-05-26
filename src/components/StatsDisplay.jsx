// src/components/StatsDisplay.jsx
import React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "./ui/card";

const StatCard = ({ title, value, description, unit }) => (
  <Card className="shadow-md hover:shadow-lg transition-shadow duration-200 bg-white">
    <CardHeader className="pb-2 pt-4 px-4 sm:px-6">
      <CardTitle className="text-base sm:text-lg font-semibold text-slate-700">
        {title}
      </CardTitle>
    </CardHeader>
    <CardContent className="pb-4 pt-0 px-4 sm:px-6">
      <div className="text-2xl sm:text-3xl font-bold text-blue-600">
        {value}
        {unit && <span className="text-lg sm:text-xl ml-1">{unit}</span>}
      </div>
      {description && (
        <CardDescription className="text-xs sm:text-sm text-slate-500 mt-1">
          {description}
        </CardDescription>
      )}
    </CardContent>
  </Card>
);

const StatsDisplay = ({ executionTime, nodesExplored, pathLength }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
      <StatCard
        title="Execution Time"
        value={executionTime.toFixed(2)}
        unit="s"
        description="Pathfinding duration"
      />
      <StatCard
        title="Nodes Explored"
        value={nodesExplored}
        description="Cells visited by algorithm"
      />
      <StatCard
        title="Path Length"
        value={pathLength}
        description="Steps from start to end"
      />
    </div>
  );
};

export default StatsDisplay;
