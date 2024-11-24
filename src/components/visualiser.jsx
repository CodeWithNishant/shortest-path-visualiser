import React, { useState, useRef, useEffect } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Button } from "./ui/button";
import { Slider } from "./ui/slider";

const GRID_ROWS = 80;
const GRID_COLS = 160;
const CELL_SIZE = 6;

const PathVisualizer = () => {
  const [algorithm, setAlgorithm] = useState("astar");
  const [speed, setSpeed] = useState([50]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPoint, setStartPoint] = useState(null);
  const [endPoint, setEndPoint] = useState(null);
  const [grid, setGrid] = useState([]);
  const [isRunning, setIsRunning] = useState(false);
  const canvasRef = useRef(null);
  const animationRef = useRef(null);

  // Initialize empty grid
  useEffect(() => {
    const initialGrid = Array(GRID_ROWS)
      .fill()
      .map(() =>
        Array(GRID_COLS)
          .fill()
          .map(() => ({
            isWall: false,
            isVisited: false,
            isPath: false,
            distance: Infinity,
            parent: null,
          }))
      );
    setGrid(initialGrid);
  }, []);

  // Draw grid on canvas
  const drawGrid = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw cells
    grid.forEach((row, i) => {
      row.forEach((cell, j) => {
        ctx.beginPath();
        ctx.rect(j * CELL_SIZE, i * CELL_SIZE, CELL_SIZE, CELL_SIZE);

        if (cell.isWall) {
          ctx.fillStyle = "#333";
        } else if (cell.isPath) {
          ctx.fillStyle = "#ffeb3b";
        } else if (cell.isVisited) {
          ctx.fillStyle = "#64b5f6";
        } else {
          ctx.fillStyle = "#fff";
        }

        ctx.fill();
        ctx.strokeStyle = "#ccc";
        ctx.stroke();
      });
    });

    // Draw start and end points
    if (startPoint) {
      ctx.beginPath();
      ctx.fillStyle = "#4caf50";
      ctx.arc(
        startPoint.x * CELL_SIZE + CELL_SIZE / 2,
        startPoint.y * CELL_SIZE + CELL_SIZE / 2,
        CELL_SIZE / 3,
        0,
        2 * Math.PI
      );
      ctx.fill();
    }

    if (endPoint) {
      ctx.beginPath();
      ctx.fillStyle = "#f44336";
      ctx.arc(
        endPoint.x * CELL_SIZE + CELL_SIZE / 2,
        endPoint.y * CELL_SIZE + CELL_SIZE / 2,
        CELL_SIZE / 3,
        0,
        2 * Math.PI
      );
      ctx.fill();
    }
  };

  useEffect(() => {
    drawGrid();
  }, [grid, startPoint, endPoint]);

  // Handle canvas click events
  const handleCanvasClick = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const x = Math.floor((e.clientX - rect.left) / CELL_SIZE);
    const y = Math.floor((e.clientY - rect.top) / CELL_SIZE);

    if (!startPoint) {
      setStartPoint({ x, y });
    } else if (!endPoint) {
      setEndPoint({ x, y });
    } else {
      const newGrid = [...grid];
      newGrid[y][x].isWall = !newGrid[y][x].isWall;
      setGrid(newGrid);
    }
  };

  // Generate random map
  const generateRandomMap = () => {
    const newGrid = grid.map((row) =>
      row.map((cell) => ({
        ...cell,
        isWall: Math.random() < 0.3,
        isVisited: false,
        isPath: false,
      }))
    );
    setGrid(newGrid);
    setStartPoint(null);
    setEndPoint(null);
  };

  // Manhattan distance heuristic for A*
  const heuristic = (node, goal) => {
    return Math.abs(node.x - goal.x) + Math.abs(node.y - goal.y);
  };

  // Get valid neighbors
  const getNeighbors = (node) => {
    const neighbors = [];
    const directions = [
      [0, 1],
      [1, 0],
      [0, -1],
      [-1, 0],
    ];

    for (const [dx, dy] of directions) {
      const newX = node.x + dx;
      const newY = node.y + dy;

      if (
        newX >= 0 &&
        newX < GRID_COLS &&
        newY >= 0 &&
        newY < GRID_ROWS &&
        !grid[newY][newX].isWall
      ) {
        neighbors.push({ x: newX, y: newY });
      }
    }

    return neighbors;
  };

  // Run pathfinding algorithm
  const runAlgorithm = async () => {
    if (!startPoint || !endPoint || isRunning) return;
    setIsRunning(true);

    const visitedNodes = [];
    const newGrid = grid.map((row) =>
      row.map((cell) => ({
        ...cell,
        isVisited: false,
        isPath: false,
        distance: Infinity,
        parent: null,
      }))
    );

    if (algorithm === "astar") {
      // A* implementation
      const openSet = [{ ...startPoint, f: 0, g: 0 }];
      const closedSet = new Set();

      while (openSet.length > 0) {
        openSet.sort((a, b) => a.f - b.f);
        const current = openSet.shift();

        if (current.x === endPoint.x && current.y === endPoint.y) {
          // Reconstruct path
          let curr = current;
          const path = [];
          while (curr) {
            path.unshift({ x: curr.x, y: curr.y });
            curr = newGrid[curr.y][curr.x].parent;
          }

          // Animate path
          for (const node of path) {
            await new Promise((r) => setTimeout(r, 100 - speed[0]));
            newGrid[node.y][node.x].isPath = true;
            setGrid([...newGrid]);
          }
          break;
        }

        closedSet.add(`${current.x},${current.y}`);
        visitedNodes.push(current);

        for (const neighbor of getNeighbors(current)) {
          if (closedSet.has(`${neighbor.x},${neighbor.y}`)) continue;

          const g = current.g + 1;
          const h = heuristic(neighbor, endPoint);
          const f = g + h;

          const existingNode = openSet.find(
            (n) => n.x === neighbor.x && n.y === neighbor.y
          );

          if (!existingNode || g < existingNode.g) {
            newGrid[neighbor.y][neighbor.x].parent = current;
            if (!existingNode) {
              openSet.push({ ...neighbor, f, g, h });
            } else {
              existingNode.f = f;
              existingNode.g = g;
            }
          }
        }

        await new Promise((r) => setTimeout(r, 100 - speed[0]));
        if (!newGrid[current.y][current.x].isPath) {
          newGrid[current.y][current.x].isVisited = true;
        }
        setGrid([...newGrid]);
      }
    } else {
      // Dijkstra implementation
      const queue = [{ ...startPoint, distance: 0 }];
      const visited = new Set();
      newGrid[startPoint.y][startPoint.x].distance = 0;

      while (queue.length > 0) {
        queue.sort((a, b) => a.distance - b.distance);
        const current = queue.shift();

        if (visited.has(`${current.x},${current.y}`)) continue;
        visited.add(`${current.x},${current.y}`);
        visitedNodes.push(current);

        if (current.x === endPoint.x && current.y === endPoint.y) {
          // Reconstruct path
          let curr = current;
          const path = [];
          while (curr) {
            path.unshift({ x: curr.x, y: curr.y });
            curr = newGrid[curr.y][curr.x].parent;
          }

          // Animate path
          for (const node of path) {
            await new Promise((r) => setTimeout(r, 100 - speed[0]));
            newGrid[node.y][node.x].isPath = true;
            setGrid([...newGrid]);
          }
          break;
        }

        for (const neighbor of getNeighbors(current)) {
          const newDist = current.distance + 1;

          if (newDist < newGrid[neighbor.y][neighbor.x].distance) {
            newGrid[neighbor.y][neighbor.x].distance = newDist;
            newGrid[neighbor.y][neighbor.x].parent = current;
            queue.push({ ...neighbor, distance: newDist });
          }
        }

        await new Promise((r) => setTimeout(r, 100 - speed[0]));
        if (!newGrid[current.y][current.x].isPath) {
          newGrid[current.y][current.x].isVisited = true;
        }
        setGrid([...newGrid]);
      }
    }

    setIsRunning(false);
  };

  return (
    <div className="p-4 max-w-5xl mx-auto">
      <div className="flex gap-4 mb-4 items-center">
        <Select value={algorithm} onValueChange={setAlgorithm}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Select Algorithm" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="astar">A* Algorithm</SelectItem>
            <SelectItem value="dijkstra">Dijkstra's Algorithm</SelectItem>
          </SelectContent>
        </Select>

        <Button
          onClick={generateRandomMap}
          disabled={isRunning}
          variant="outline"
        >
          Generate Random Map
        </Button>

        <Button
          onClick={runAlgorithm}
          disabled={!startPoint || !endPoint || isRunning}
        >
          Run Algorithm
        </Button>
      </div>

      <div className="border rounded p-4 bg-gray-50">
        <canvas
          ref={canvasRef}
          width={GRID_COLS * CELL_SIZE}
          height={GRID_ROWS * CELL_SIZE}
          onClick={handleCanvasClick}
          className="border bg-white cursor-pointer"
        />
      </div>

      <div className="mt-4">
        <p className="mb-2">Animation Speed</p>
        <Slider
          value={speed}
          onValueChange={setSpeed}
          max={100}
          step={1}
          className="w-64"
        />
      </div>

      <div className="mt-4 text-sm text-gray-600">
        <p>Instructions:</p>
        <p>1. Click to place start point (green)</p>
        <p>2. Click to place end point (red)</p>
        <p>3. Click to toggle walls</p>
        <p>4. Select algorithm and click Run</p>
      </div>
    </div>
  );
};

export default PathVisualizer;
