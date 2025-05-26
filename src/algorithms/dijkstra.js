// src/algorithms/dijkstra.js
export const runDijkstraAlgorithm = async (
  currentGrid, // The grid state from PathVisualizer
  startPoint,
  endPoint,
  setGrid,
  setNodesExplored,
  getNeighbors,
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
    }))
  );

  // Initialize start node properties in newGrid
  if (startPoint.y < newGrid.length && startPoint.x < newGrid[0].length) {
    newGrid[startPoint.y][startPoint.x].distance = 0;
  }

  const queue = [{ ...startPoint, distance: 0 }]; // Priority queue (simulated with sort)
  const visitedSet = new Set(); // Tracks "x,y" strings of nodes for which shortest path is finalized
  let exploredCount = 0;
  let finalPath = null;

  while (queue.length > 0) {
    queue.sort((a, b) => a.distance - b.distance); // Simulate priority queue
    const current = queue.shift();
    const currentKey = `${current.x},${current.y}`;

    if (visitedSet.has(currentKey)) {
      continue; // Already found shortest path to this node
    }
    visitedSet.add(currentKey);

    // Mark as visited for visualization
    if (
      current.y < newGrid.length &&
      current.x < newGrid[0].length &&
      !newGrid[current.y][current.x].isPath
    ) {
      newGrid[current.y][current.x].isVisited = true;
    }
    exploredCount++;
    setNodesExplored(exploredCount);

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
        setGrid([...newGrid]);
      }
      break; // Path found
    }

    const neighbors = getNeighbors(current, newGrid); // Pass newGrid for wall checks

    for (const neighbor of neighbors) {
      const neighborKey = `${neighbor.x},${neighbor.y}`;
      if (visitedSet.has(neighborKey)) {
        continue; // Skip if already finalized
      }

      // Cost to neighbor through current node (assuming edge weight is 1)
      const newDist = newGrid[current.y][current.x].distance + 1;

      if (
        neighbor.y < newGrid.length &&
        neighbor.x < newGrid[0].length &&
        newDist < newGrid[neighbor.y][neighbor.x].distance
      ) {
        newGrid[neighbor.y][neighbor.x].distance = newDist;
        newGrid[neighbor.y][neighbor.x].parent = current;

        // Add to queue or update if already there
        // For simplicity with array sort, just add and let sort handle priority
        const existingInQueue = queue.find(
          (n) => n.x === neighbor.x && n.y === neighbor.y
        );
        if (existingInQueue) {
          existingInQueue.distance = newDist;
        } else {
          queue.push({ ...neighbor, distance: newDist });
        }
      }
    }

    await new Promise((r) => setTimeout(r, getAnimDelay()));
    setGrid([...newGrid]); // Update grid state for visualization
  }
  setNodesExplored(exploredCount); // Final update
  return finalPath ? finalPath.length : 0;
};
