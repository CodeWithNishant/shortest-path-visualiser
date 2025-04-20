import React, { useState, useRef, useEffect } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

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

  // New state variables for analytics
  const [nodesExplored, setNodesExplored] = useState(0);
  const [pathLength, setPathLength] = useState(0);
  const [executionTime, setExecutionTime] = useState(0);
  const [algorithmHistory, setAlgorithmHistory] = useState([]);
  const [showComparison, setShowComparison] = useState(false);
  const timerRef = useRef(null);
  const startTimeRef = useRef(null);

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

  // BFS implementation
  const runBFS = async (
    grid,
    startPoint,
    endPoint,
    setGrid,
    setNodesExplored
  ) => {
    const newGrid = grid.map((row) =>
      row.map((cell) => ({
        ...cell,
        isVisited: false,
        isPath: false,
        distance: Infinity,
        parent: null,
      }))
    );

    const queue = [{ ...startPoint, distance: 0 }];
    const visited = new Set();
    visited.add(`${startPoint.x},${startPoint.y}`);
    newGrid[startPoint.y][startPoint.x].distance = 0;

    let exploredCount = 0;
    let finalPath = null;

    while (queue.length > 0) {
      const current = queue.shift(); // BFS uses FIFO queue
      exploredCount++;
      setNodesExplored(exploredCount);

      if (current.x === endPoint.x && current.y === endPoint.y) {
        // Reconstruct path
        let curr = current;
        const path = [];
        while (curr) {
          path.unshift({ x: curr.x, y: curr.y });
          curr = newGrid[curr.y][curr.x].parent;
        }

        finalPath = path;

        // Animate path
        for (const node of path) {
          await new Promise((r) => setTimeout(r, getAnimationDelay(true)));
          newGrid[node.y][node.x].isPath = true;
          setGrid([...newGrid]);
        }
        break;
      }

      // Get all valid neighbors
      const neighbors = getNeighbors(current, grid);

      for (const neighbor of neighbors) {
        const key = `${neighbor.x},${neighbor.y}`;
        if (!visited.has(key)) {
          visited.add(key);
          newGrid[neighbor.y][neighbor.x].parent = current;
          newGrid[neighbor.y][neighbor.x].distance = current.distance + 1;
          queue.push({ ...neighbor, distance: current.distance + 1 });
        }
      }

      await new Promise((r) => setTimeout(r, getAnimationDelay()));
      if (!newGrid[current.y][current.x].isPath) {
        newGrid[current.y][current.x].isVisited = true;
      }
      setGrid([...newGrid]);
    }

    return finalPath ? finalPath.length : 0;
  };

  const runDFS = async (
    grid,
    startPoint,
    endPoint,
    setGrid,
    setNodesExplored
  ) => {
    const newGrid = grid.map((row) =>
      row.map((cell) => ({
        ...cell,
        isVisited: false,
        isPath: false,
        distance: Infinity,
        parent: null,
      }))
    );

    const stack = [startPoint]; // DFS uses LIFO stack
    const visited = new Set();
    let exploredCount = 0;
    let finalPath = null;

    while (stack.length > 0) {
      const current = stack.pop(); // Get the last item (LIFO)
      const key = `${current.x},${current.y}`;

      if (visited.has(key)) continue;

      visited.add(key);
      exploredCount++;
      setNodesExplored(exploredCount);

      if (current.x === endPoint.x && current.y === endPoint.y) {
        // Reconstruct path
        let curr = current;
        const path = [];
        while (curr) {
          path.unshift({ x: curr.x, y: curr.y });
          curr = newGrid[curr.y][curr.x].parent;
        }

        finalPath = path;

        // Animate path
        for (const node of path) {
          await new Promise((r) => setTimeout(r, getAnimationDelay(true)));
          newGrid[node.y][node.x].isPath = true;
          setGrid([...newGrid]);
        }
        break;
      }

      // Get all valid neighbors
      const neighbors = getNeighbors(current, grid);

      // DFS explores neighbors in reverse order (to make visualization more intuitive)
      // This ensures we try to go deeper before going wider
      for (const neighbor of neighbors.reverse()) {
        const neighborKey = `${neighbor.x},${neighbor.y}`;
        if (!visited.has(neighborKey)) {
          newGrid[neighbor.y][neighbor.x].parent = current;
          stack.push(neighbor);
        }
      }

      await new Promise((r) => setTimeout(r, getAnimationDelay()));
      if (!newGrid[current.y][current.x].isPath) {
        newGrid[current.y][current.x].isVisited = true;
      }
      setGrid([...newGrid]);
    }

    return finalPath ? finalPath.length : 0;
  };

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

  // Generate city map
  const generateCityMap = () => {
    // Create empty grid first
    const newGrid = Array(GRID_ROWS)
      .fill()
      .map(() =>
        Array(GRID_COLS)
          .fill()
          .map(() => ({
            isWall: true, // Start with everything as walls
            isVisited: false,
            isPath: false,
            distance: Infinity,
            parent: null,
          }))
      );

    // Parameters for city generation
    const mainRoadWidth = 1;
    const blockSizeMin = 10;
    const blockSizeMax = 20;
    const buildingDensity = 0.9; // Probability of a cell being a building inside blocks

    // Create main roads (horizontal)
    for (
      let y = blockSizeMin;
      y < GRID_ROWS;
      y +=
        blockSizeMin + Math.floor(Math.random() * (blockSizeMax - blockSizeMin))
    ) {
      if (y + mainRoadWidth >= GRID_ROWS) continue;

      for (let roadY = 0; roadY < mainRoadWidth; roadY++) {
        for (let x = 0; x < GRID_COLS; x++) {
          if (y + roadY < GRID_ROWS) {
            newGrid[y + roadY][x].isWall = false;
          }
        }
      }
    }

    // Create main roads (vertical)
    for (
      let x = blockSizeMin;
      x < GRID_COLS;
      x +=
        blockSizeMin + Math.floor(Math.random() * (blockSizeMax - blockSizeMin))
    ) {
      if (x + mainRoadWidth >= GRID_COLS) continue;

      for (let roadX = 0; roadX < mainRoadWidth; roadX++) {
        for (let y = 0; y < GRID_ROWS; y++) {
          if (x + roadX < GRID_COLS) {
            newGrid[y][x + roadX].isWall = false;
          }
        }
      }
    }

    // Create some smaller streets within blocks
    for (
      let y = Math.floor(blockSizeMin / 2);
      y < GRID_ROWS;
      y += blockSizeMin
    ) {
      if (Math.random() < 0.4) continue; // Skip some potential streets

      for (let x = 0; x < GRID_COLS; x++) {
        newGrid[y][x].isWall = false;
      }
    }

    for (
      let x = Math.floor(blockSizeMin / 2);
      x < GRID_COLS;
      x += blockSizeMin
    ) {
      if (Math.random() < 0.4) continue; // Skip some potential streets

      for (let y = 0; y < GRID_ROWS; y++) {
        newGrid[y][x].isWall = false;
      }
    }

    // Create some open spaces/parks (random clearing of blocks)
    const numParks = 3 + Math.floor(Math.random() * 3);
    for (let i = 0; i < numParks; i++) {
      const parkX = Math.floor(Math.random() * (GRID_COLS - blockSizeMax));
      const parkY = Math.floor(Math.random() * (GRID_ROWS - blockSizeMax));
      const parkWidth =
        blockSizeMin +
        Math.floor(Math.random() * (blockSizeMax - blockSizeMin));
      const parkHeight =
        blockSizeMin +
        Math.floor(Math.random() * (blockSizeMax - blockSizeMin));

      for (let y = parkY; y < parkY + parkHeight && y < GRID_ROWS; y++) {
        for (let x = parkX; x < parkX + parkWidth && x < GRID_COLS; x++) {
          newGrid[y][x].isWall = false;
        }
      }
    }

    // Add some randomness to buildings inside blocks
    for (let y = 0; y < GRID_ROWS; y++) {
      for (let x = 0; x < GRID_COLS; x++) {
        // If this is already a road, leave it
        if (!newGrid[y][x].isWall) continue;

        // Otherwise, this is potentially a building - add some randomness
        if (Math.random() > buildingDensity) {
          newGrid[y][x].isWall = false; // Create some empty spaces
        }
      }
    }

    // Ensure the edges have some openings
    // Add entrances/exits from the edges
    const entrances = 5 + Math.floor(Math.random() * 5);
    for (let i = 0; i < entrances; i++) {
      // Top and bottom edges
      const xPos = Math.floor(Math.random() * GRID_COLS);
      for (let w = 0; w < mainRoadWidth; w++) {
        if (xPos + w < GRID_COLS) {
          newGrid[0][xPos + w].isWall = false; // Top entrance
          newGrid[GRID_ROWS - 1][xPos + w].isWall = false; // Bottom entrance
        }
      }

      // Left and right edges
      const yPos = Math.floor(Math.random() * GRID_ROWS);
      for (let w = 0; w < mainRoadWidth; w++) {
        if (yPos + w < GRID_ROWS) {
          newGrid[yPos + w][0].isWall = false; // Left entrance
          newGrid[yPos + w][GRID_COLS - 1].isWall = false; // Right entrance
        }
      }
    }

    setGrid(newGrid);
    setStartPoint(null);
    setEndPoint(null);

    // Reset analytics
    setNodesExplored(0);
    setPathLength(0);
    setExecutionTime(0);
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

  // Calculate animation delay based on speed setting
  const getAnimationDelay = (isPath = false) => {
    // Convert speed (0-100) to delay (50-5ms)
    // Higher speed = lower delay
    const baseDelay = isPath ? 5 : 20;
    return Math.max(5, baseDelay - (speed[0] / 100) * baseDelay);
  };

  // Start the timer
  const startTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    setExecutionTime(0);
    startTimeRef.current = Date.now();

    timerRef.current = setInterval(() => {
      setExecutionTime((Date.now() - startTimeRef.current) / 1000);
    }, 10);
  };

  // Stop the timer
  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      const finalTime = (Date.now() - startTimeRef.current) / 1000;
      setExecutionTime(finalTime);
      return finalTime;
    }
    return executionTime;
  };

  // Run pathfinding algorithm
  const runAlgorithm = async () => {
    if (!startPoint || !endPoint || isRunning) return;
    setIsRunning(true);

    // Reset analytics
    setNodesExplored(0);
    setPathLength(0);
    startTimer();

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

    let exploredCount = 0;
    let finalPath = null;
    let pathLen = 0;

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

          finalPath = path;

          // Animate path
          for (const node of path) {
            await new Promise((r) => setTimeout(r, getAnimationDelay(true)));
            newGrid[node.y][node.x].isPath = true;
            setGrid([...newGrid]);
          }
          break;
        }

        closedSet.add(`${current.x},${current.y}`);
        visitedNodes.push(current);
        exploredCount++;
        setNodesExplored(exploredCount);

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

        await new Promise((r) => setTimeout(r, getAnimationDelay()));
        if (!newGrid[current.y][current.x].isPath) {
          newGrid[current.y][current.x].isVisited = true;
        }
        setGrid([...newGrid]);
      }
    } else if (algorithm === "dijkstra") {
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
        exploredCount++;
        setNodesExplored(exploredCount);

        if (current.x === endPoint.x && current.y === endPoint.y) {
          // Reconstruct path
          let curr = current;
          const path = [];
          while (curr) {
            path.unshift({ x: curr.x, y: curr.y });
            curr = newGrid[curr.y][curr.x].parent;
          }

          finalPath = path;

          // Animate path
          for (const node of path) {
            await new Promise((r) => setTimeout(r, getAnimationDelay(true)));
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

        await new Promise((r) => setTimeout(r, getAnimationDelay()));
        if (!newGrid[current.y][current.x].isPath) {
          newGrid[current.y][current.x].isVisited = true;
        }
        setGrid([...newGrid]);
      }
    } else if (algorithm === "bfs") {
      const pathLen = await runBFS(
        grid,
        startPoint,
        endPoint,
        setGrid,
        setNodesExplored
      );
      setPathLength(pathLen);
    } else if (algorithm === "dfs") {
      const pathLen = await runDFS(
        grid,
        startPoint,
        endPoint,
        setGrid,
        setNodesExplored
      );
      setPathLength(pathLen);
    }

    const finalTime = stopTimer();

    if (pathLen > 0) {
      console.log("Yes");
      const algorithmRun = {
        algorithm,
        nodesExplored,
        pathLength: pathLen,
        executionTime: finalTime,
        timestamp: Date.now(),
      };

      setAlgorithmHistory((prev) => [...prev, algorithmRun]);
    } else {
      console.log("no");
    }

    setIsRunning(false);

    // Update path length
    if (finalPath) {
      setPathLength(finalPath.length);

      // Record history for comparison
      const algorithmRun = {
        algorithm,
        nodesExplored: exploredCount,
        pathLength: finalPath.length,
        executionTime: finalTime,
        timestamp: Date.now(),
      };

      setAlgorithmHistory((prev) => [...prev, algorithmRun]);
    }

    setIsRunning(false);
  };

  // Calculate efficiency score (lower is better)
  const calculateEfficiencyScore = (nodes, pathLength) => {
    if (pathLength === 0) return 0;
    return (nodes / pathLength).toFixed(2);
  };

  // Reset the board
  const resetBoard = () => {
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
    setNodesExplored(0);
    setPathLength(0);
    setExecutionTime(0);
    setStartPoint(null);
    setEndPoint(null);
  };

  return (
    <div className="p-4 max-w-5xl mx-auto">
      <div className="flex gap-4 mb-4 items-center flex-wrap">
        <Select value={algorithm} onValueChange={setAlgorithm}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Select Algorithm" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="astar">A* Algorithm</SelectItem>
            <SelectItem value="dijkstra">Dijkstra's Algorithm</SelectItem>
            <SelectItem value="bfs">BFS</SelectItem>
            <SelectItem value="dfs">DFS</SelectItem>
          </SelectContent>
        </Select>

        <Button
          onClick={generateCityMap}
          disabled={isRunning}
          variant="outline"
        >
          Generate City Map
        </Button>

        <Button
          onClick={runAlgorithm}
          disabled={!startPoint || !endPoint || isRunning}
        >
          Run Algorithm
        </Button>

        <Button onClick={resetBoard} disabled={isRunning} variant="outline">
          Reset Board
        </Button>

        <Button
          onClick={() => setShowComparison(!showComparison)}
          variant="outline"
        >
          {showComparison ? "Hide Comparison" : "Show Comparison"}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
        {/* Stats Cards */}
        <Card>
          <CardHeader className="py-2">
            <CardTitle className="text-lg">Execution Time</CardTitle>
          </CardHeader>
          <CardContent className="py-2">
            <div className="text-3xl font-bold">
              {executionTime.toFixed(2)}s
            </div>
            <p className="text-sm text-gray-500">Time taken to find path</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="py-2">
            <CardTitle className="text-lg">Nodes Explored</CardTitle>
          </CardHeader>
          <CardContent className="py-2">
            <div className="text-3xl font-bold">{nodesExplored}</div>
            <p className="text-sm text-gray-500">Number of cells visited</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="py-2">
            <CardTitle className="text-lg">Path Length</CardTitle>
          </CardHeader>
          <CardContent className="py-2">
            <div className="text-3xl font-bold">{pathLength}</div>
            <p className="text-sm text-gray-500">Steps from start to end</p>
          </CardContent>
        </Card>
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

      {/* Algorithm Comparison */}
      {showComparison && algorithmHistory.length > 0 && (
        <Card className="mt-4">
          <CardHeader>
            <CardTitle>Algorithm Comparison</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Algorithm
                    </th>
                    <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Nodes Explored
                    </th>
                    <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Path Length
                    </th>
                    <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Time (s)
                    </th>
                    <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Efficiency Score
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {algorithmHistory.map((run, index) => (
                    <tr key={index}>
                      <td className="px-2 py-4 whitespace-nowrap text-sm">
                        {run.algorithm === "astar" ? "A*" : "Dijkstra"}
                      </td>
                      <td className="px-2 py-4 whitespace-nowrap text-sm">
                        {run.nodesExplored}
                      </td>
                      <td className="px-2 py-4 whitespace-nowrap text-sm">
                        {run.pathLength}
                      </td>
                      <td className="px-2 py-4 whitespace-nowrap text-sm">
                        {run.executionTime.toFixed(2)}
                      </td>
                      <td className="px-2 py-4 whitespace-nowrap text-sm">
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
            <p className="text-xs text-gray-500 mt-2">
              Efficiency Score: Nodes Explored / Path Length (lower is better)
            </p>
          </CardContent>
        </Card>
      )}

      <div className="mt-4 text-sm text-gray-600">
        <p className="font-medium mb-1">Instructions:</p>
        <p>1. Click to place start point (green)</p>
        <p>2. Click to place end point (red)</p>
        <p>3. Click to toggle walls or generate a city map</p>
        <p>4. Select algorithm and click Run</p>
        <p className="mt-2 font-medium">Algorithm Comparison:</p>
        <p>
          • A* uses heuristics to prioritize paths that seem closer to the goal
        </p>
        <p>
          • Dijkstra explores in all directions equally, guaranteeing optimal
          paths
        </p>
        <p>
          • A* typically explores fewer nodes but may not always find the
          shortest path
        </p>
      </div>
    </div>
  );
};

export default PathVisualizer;
