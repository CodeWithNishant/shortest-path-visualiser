// src/algorithms/bfs.js
export const runBFSAlgorithm = async (
  initialGrid,
  startPoint,
  endPoint,
  setGrid,
  setNodesExplored,
  getNeighbors,
  getAnimDelay // Renamed to avoid conflict if imported directly
) => {
  const newGrid = initialGrid.map((row) =>
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
  if (startPoint.y < newGrid.length && startPoint.x < newGrid[0].length) {
    newGrid[startPoint.y][startPoint.x].distance = 0;
  }

  let exploredCount = 0;
  let finalPath = null;

  while (queue.length > 0) {
    const current = queue.shift();
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
          curr = null; // Should not happen if grid is consistent
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

    const neighbors = getNeighbors(current, newGrid); // Pass newGrid here if getNeighbors checks walls on it

    for (const neighbor of neighbors) {
      const key = `${neighbor.x},${neighbor.y}`;
      if (!visited.has(key)) {
        visited.add(key);
        if (neighbor.y < newGrid.length && neighbor.x < newGrid[0].length) {
          newGrid[neighbor.y][neighbor.x].parent = current;
          newGrid[neighbor.y][neighbor.x].distance = current.distance + 1;
        }
        queue.push({ ...neighbor, distance: current.distance + 1 });
      }
    }

    await new Promise((r) => setTimeout(r, getAnimDelay()));
    if (
      current.y < newGrid.length &&
      current.x < newGrid[0].length &&
      !newGrid[current.y][current.x].isPath
    ) {
      newGrid[current.y][current.x].isVisited = true;
    }
    setGrid([...newGrid]);
  }

  return finalPath ? finalPath.length : 0;
};
