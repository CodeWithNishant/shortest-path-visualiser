// src/PathVisualizer.jsx
import React, { useState, useRef, useEffect } from "react";
import { GRID_ROWS, GRID_COLS, CELL_SIZE } from "./constants";
import {
  initializeGrid,
  drawGridOnCanvas,
  getNeighborsUtil,
  generateCityMapGrid,
} from "./utils/gridUtils";
import { getAnimationDelay as getAnimDelayUtil } from "./utils/animationUtils";

import { manhattanDistance } from "./algorithms/heuristic";
import { runAStarAlgorithm } from "./algorithms/astar";
import { runDijkstraAlgorithm } from "./algorithms/dijkstra";
import { runBFSAlgorithm } from "./algorithms/bfs";
import { runDFSAlgorithm } from "./algorithms/dfs";

import Controls from "./components/Controls";
import StatsDisplay from "./components/StatsDisplay";
import AlgorithmComparison from "./components/AlgorithmComparison";
import Instructions from "./components/Instructions";

const PathVisualizer = () => {
  const [algorithm, setAlgorithm] = useState("astar");
  const [speed, setSpeed] = useState([50]);
  const [startPoint, setStartPoint] = useState(null);
  const [endPoint, setEndPoint] = useState(null);
  const [grid, setGrid] = useState([]);
  const [isRunning, setIsRunning] = useState(false);
  const canvasRef = useRef(null);

  const [nodesExplored, setNodesExplored] = useState(0);
  const [pathLength, setPathLength] = useState(0);
  const [executionTime, setExecutionTime] = useState(0);
  const [algorithmHistory, setAlgorithmHistory] = useState([]);
  const [showComparison, setShowComparison] = useState(false);
  const timerRef = useRef(null);
  const startTimeRef = useRef(null);

  useEffect(() => {
    setGrid(initializeGrid());
  }, []);

  const drawGrid = () => {
    if (!canvasRef.current || grid.length === 0) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    drawGridOnCanvas(ctx, grid, startPoint, endPoint);
  };

  useEffect(() => {
    drawGrid();
  }, [grid, startPoint, endPoint, drawGrid]); // Added drawGrid to dependencies

  const handleCanvasClick = (e) => {
    if (isRunning || !canvasRef.current) return;

    const canvas = canvasRef.current; // Get the canvas element
    const rect = canvas.getBoundingClientRect(); // Gets the displayed size and position

    // Calculate the scale factor between the canvas's drawing surface size and its displayed size
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    // Get the mouse position relative to the canvas element
    const mouseXInDisplay = e.clientX - rect.left;
    const mouseYInDisplay = e.clientY - rect.top;

    // Scale these mouse positions to match the canvas's internal drawing surface coordinates
    const canvasX = mouseXInDisplay * scaleX;
    const canvasY = mouseYInDisplay * scaleY;

    // Now calculate grid cell based on scaled coordinates
    const x = Math.floor(canvasX / CELL_SIZE);
    const y = Math.floor(canvasY / CELL_SIZE);

    if (x < 0 || x >= GRID_COLS || y < 0 || y >= GRID_ROWS) return;

    if (!startPoint) {
      setStartPoint({ x, y });
    } else if (!endPoint && (startPoint.x !== x || startPoint.y !== y)) {
      setEndPoint({ x, y });
    } else {
      if (startPoint && startPoint.x === x && startPoint.y === y) return;
      if (endPoint && endPoint.x === x && endPoint.y === y) return;

      const newGrid = [...grid]; // Create a new array for the grid
      // Ensure the grid and its rows are defined before trying to access them
      if (newGrid[y] && typeof newGrid[y][x] !== "undefined") {
        newGrid[y] = [...newGrid[y]]; // Create a new array for the row
        newGrid[y][x] = { ...newGrid[y][x], isWall: !newGrid[y][x].isWall }; // Create a new object for the cell
        setGrid(newGrid);
      } else {
        console.error("Attempted to access an invalid grid cell:", y, x);
      }
    }
  };

  const generateCityMap = () => {
    if (isRunning) return;
    setGrid(generateCityMapGrid());
    setStartPoint(null);
    setEndPoint(null);
    setNodesExplored(0);
    setPathLength(0);
    setExecutionTime(0);
  };

  const getNeighbors = (node, currentActiveGrid) => {
    return getNeighborsUtil(node, currentActiveGrid);
  };

  const getAnimationDelay = (isPath = false) => {
    return getAnimDelayUtil(speed[0], isPath);
  };

  const startTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    setExecutionTime(0);
    startTimeRef.current = Date.now();
    timerRef.current = setInterval(() => {
      if (startTimeRef.current) {
        // Ensure startTimeRef is still valid
        setExecutionTime((Date.now() - startTimeRef.current) / 1000);
      }
    }, 10);
  };

  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    const finalTime = startTimeRef.current
      ? (Date.now() - startTimeRef.current) / 1000
      : executionTime;
    setExecutionTime(finalTime);
    startTimeRef.current = null; // Reset start time
    return finalTime;
  };

  const runAlgorithm = async () => {
    if (!startPoint || !endPoint || isRunning) return;
    setIsRunning(true);

    const freshGrid = grid.map((row) =>
      row.map((cell) => ({
        ...cell,
        isVisited: false,
        isPath: false,
      }))
    );
    setGrid(freshGrid);

    setNodesExplored(0);
    setPathLength(0);
    startTimer();

    let currentPathLength = 0;
    let finalNodesExplored = 0;

    const updateNodesExplored = (count) => {
      finalNodesExplored = count;
      setNodesExplored(count);
    };

    if (algorithm === "astar") {
      currentPathLength = await runAStarAlgorithm(
        freshGrid,
        startPoint,
        endPoint,
        setGrid,
        updateNodesExplored,
        getNeighbors,
        manhattanDistance,
        getAnimationDelay
      );
    } else if (algorithm === "dijkstra") {
      currentPathLength = await runDijkstraAlgorithm(
        freshGrid,
        startPoint,
        endPoint,
        setGrid,
        updateNodesExplored,
        getNeighbors,
        getAnimationDelay
      );
    } else if (algorithm === "bfs") {
      currentPathLength = await runBFSAlgorithm(
        freshGrid,
        startPoint,
        endPoint,
        setGrid,
        updateNodesExplored,
        getNeighbors,
        getAnimationDelay
      );
    } else if (algorithm === "dfs") {
      currentPathLength = await runDFSAlgorithm(
        freshGrid,
        startPoint,
        endPoint,
        setGrid,
        updateNodesExplored,
        getNeighbors,
        getAnimationDelay
      );
    }

    const finalTime = stopTimer();
    setPathLength(currentPathLength);

    if (currentPathLength > 0) {
      const algorithmRun = {
        algorithm,
        nodesExplored: finalNodesExplored,
        pathLength: currentPathLength,
        executionTime: finalTime,
        timestamp: Date.now(),
      };
      setAlgorithmHistory((prev) => [...prev, algorithmRun].slice(-10)); // Keep last 10 runs
    }
    setIsRunning(false);
  };

  const resetBoard = () => {
    if (isRunning) return;
    const newGrid = grid.map((row) =>
      row.map((cell) => ({
        ...cell,
        isVisited: false,
        isPath: false,
        distance: Infinity,
        parent: null,
      }))
    );
    setGrid(newGrid);
    setStartPoint(null);
    setEndPoint(null);
    setNodesExplored(0);
    setPathLength(0);
    setExecutionTime(0);
    if (timerRef.current) clearInterval(timerRef.current); // Clear timer on reset
    startTimeRef.current = null;
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 py-6 sm:py-8 px-4">
      <header className="mb-6 sm:mb-8 text-center">
        <h1 className="text-3xl sm:text-4xl font-bold text-slate-700">
          Pathfinding Visualizer
        </h1>
        <p className="text-sm text-slate-500">
          Explore and compare different pathfinding algorithms.
        </p>
      </header>

      <div className="max-w-6xl mx-auto space-y-6 sm:space-y-8">
        <Controls
          algorithm={algorithm}
          setAlgorithm={setAlgorithm}
          generateCityMap={generateCityMap}
          runAlgorithm={runAlgorithm}
          resetBoard={resetBoard}
          showComparison={showComparison}
          setShowComparison={setShowComparison}
          isRunning={isRunning}
          startPoint={startPoint}
          endPoint={endPoint}
        />

        <StatsDisplay
          executionTime={executionTime}
          nodesExplored={nodesExplored}
          pathLength={pathLength}
        />

        <div className="bg-white rounded-xl shadow-xl p-3 sm:p-4">
          <canvas
            ref={canvasRef}
            width={GRID_COLS * CELL_SIZE}
            height={GRID_ROWS * CELL_SIZE}
            onClick={handleCanvasClick}
            className="border border-slate-300 bg-white cursor-pointer rounded-lg w-full h-auto"
            style={{ touchAction: "none" }}
          />
        </div>

        {showComparison && algorithmHistory.length > 0 && (
          <AlgorithmComparison algorithmHistory={algorithmHistory} />
        )}

        <Instructions />
      </div>
      <footer className="text-center mt-8 text-xs text-slate-500">
        <p>Crafted for visualization and learning.</p>
      </footer>
    </div>
  );
};

export default PathVisualizer;
