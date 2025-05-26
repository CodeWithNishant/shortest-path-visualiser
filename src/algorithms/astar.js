// src/algorithms/astar.js
export const runAStarAlgorithm = async (
  currentGrid, // The grid state from PathVisualizer
  startPoint,
  endPoint,
  setGrid,
  setNodesExplored,
  getNeighbors,
  heuristicFunc,
  getAnimDelay // Renamed
) => {
  // Reset visual state on a copy of the grid
  const newGrid = currentGrid.map((row) =>
    row.map((cell) => ({
      ...cell,
      isVisited: false,
      isPath: false,
      distance: Infinity,
      parent: null,
      g: Infinity, // A* specific
      f: Infinity, // A* specific
    }))
  );

  const openSet = [
    { ...startPoint, f: 0, g: 0, h: heuristicFunc(startPoint, endPoint) },
  ];
  // Initialize start node properties in newGrid
  if (startPoint.y < newGrid.length && startPoint.x < newGrid[0].length) {
    newGrid[startPoint.y][startPoint.x].g = 0;
    newGrid[startPoint.y][startPoint.x].f = heuristicFunc(startPoint, endPoint);
  }

  const closedSet = new Set(); // Stores "x,y" strings of visited nodes
  let exploredCount = 0;
  let finalPath = null;

  while (openSet.length > 0) {
    openSet.sort((a, b) => a.f - b.f); // Sort by f-score to get the node with the lowest f-score
    const current = openSet.shift();

    if (current.x === endPoint.x && current.y === endPoint.y) {
      let curr = current;
      const path = [];
      while (curr) {
        path.unshift({ x: curr.x, y: curr.y });
        if (curr.y < newGrid.length && curr.x < newGrid[0].length) {
          curr = newGrid[curr.y][curr.x].parent;
        } else {
          curr = null;
        }
      }
      finalPath = path;

      for (const node of path) {
        await new Promise((r) => setTimeout(r, getAnimDelay(true)));
        if (node.y < newGrid.length && node.x < newGrid[0].length) {
          newGrid[node.y][node.x].isPath = true;
        }
        setGrid([...newGrid]); // Update grid state
      }
      break; // Path found
    }

    const currentKey = `${current.x},${current.y}`;
    if (closedSet.has(currentKey)) {
      continue; // Already processed this node
    }
    closedSet.add(currentKey);

    // Mark as visited for visualization (if not part of the final path yet)
    if (
      current.y < newGrid.length &&
      current.x < newGrid[0].length &&
      !newGrid[current.y][current.x].isPath
    ) {
      newGrid[current.y][current.x].isVisited = true;
    }
    exploredCount++;
    setNodesExplored(exploredCount);

    const neighbors = getNeighbors(current, newGrid); // Pass newGrid for wall checks

    for (const neighbor of neighbors) {
      const neighborKey = `${neighbor.x},${neighbor.y}`;
      if (closedSet.has(neighborKey)) {
        continue; // Skip if neighbor is already processed
      }

      const tentativeG = newGrid[current.y][current.x].g + 1; // Cost from start to neighbor through current

      let neighborInOpenSet = openSet.find(
        (n) => n.x === neighbor.x && n.y === neighbor.y
      );

      if (
        !neighborInOpenSet ||
        tentativeG < newGrid[neighbor.y][neighbor.x].g
      ) {
        newGrid[neighbor.y][neighbor.x].parent = current;
        newGrid[neighbor.y][neighbor.x].g = tentativeG;
        newGrid[neighbor.y][neighbor.x].h = heuristicFunc(neighbor, endPoint);
        newGrid[neighbor.y][neighbor.x].f =
          newGrid[neighbor.y][neighbor.x].g + newGrid[neighbor.y][neighbor.x].h;

        if (!neighborInOpenSet) {
          openSet.push({
            ...neighbor,
            g: newGrid[neighbor.y][neighbor.x].g,
            h: newGrid[neighbor.y][neighbor.x].h,
            f: newGrid[neighbor.y][neighbor.x].f,
          });
        } else {
          // Update existing node in openSet if found and path is better
          neighborInOpenSet.g = newGrid[neighbor.y][neighbor.x].g;
          neighborInOpenSet.h = newGrid[neighbor.y][neighbor.x].h;
          neighborInOpenSet.f = newGrid[neighbor.y][neighbor.x].f;
          // Re-sort is handled by sorting at the beginning of the loop
        }
      }
    }

    await new Promise((r) => setTimeout(r, getAnimDelay()));
    setGrid([...newGrid]); // Update grid state for visualization
  }
  setNodesExplored(exploredCount); // Final update for nodes explored
  return finalPath ? finalPath.length : 0;
};
