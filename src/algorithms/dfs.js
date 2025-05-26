// src/algorithms/dfs.js
export const runDFSAlgorithm = async (
  initialGrid,
  startPoint,
  endPoint,
  setGrid,
  setNodesExplored,
  getNeighbors,
  getAnimDelay // Renamed
) => {
  const newGrid = initialGrid.map((row) =>
    row.map((cell) => ({
      ...cell,
      isVisited: false,
      isPath: false,
      distance: Infinity, // Though DFS doesn't use distance, keep for consistency
      parent: null,
    }))
  );

  const stack = [startPoint];
  const visited = new Set(); // Tracks nodes whose processing has started
  let exploredCount = 0;
  let finalPath = null;

  // DFS needs to store parent on the newGrid to reconstruct path
  // newGrid[startPoint.y][startPoint.x].parent = null; // Already handled by map

  while (stack.length > 0) {
    const current = stack.pop();
    const key = `${current.x},${current.y}`;

    // If already visited (fully processed), skip.
    // For DFS, visited means popped and processed.
    // We add to visited set when we are about to process its neighbors.
    if (visited.has(key)) continue;

    visited.add(key);
    exploredCount++;
    setNodesExplored(exploredCount);

    if (current.y < newGrid.length && current.x < newGrid[0].length) {
      // Mark as visited for visualization
      if (!newGrid[current.y][current.x].isPath) {
        // Don't overwrite path color
        newGrid[current.y][current.x].isVisited = true;
      }
    }

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
      break;
    }

    // Animate the current cell being explored (visited)
    await new Promise((r) => setTimeout(r, getAnimDelay()));
    setGrid([...newGrid]); // Update grid to show current cell as visited

    // Get neighbors
    const neighbors = getNeighbors(current, newGrid); // Pass newGrid if getNeighbors checks walls on it

    // Process neighbors in reverse to get typical DFS behavior (explore one branch fully)
    // or specific order if desired for visualization. Original was .reverse()
    for (const neighbor of neighbors.reverse()) {
      const neighborKey = `${neighbor.x},${neighbor.y}`;
      if (!visited.has(neighborKey)) {
        // Check if neighbor is valid cell before accessing newGrid
        if (neighbor.y < newGrid.length && neighbor.x < newGrid[0].length) {
          newGrid[neighbor.y][neighbor.x].parent = current;
        }
        stack.push(neighbor);
      }
    }
  }
  return finalPath ? finalPath.length : 0;
};
