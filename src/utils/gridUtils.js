// src/utils/gridUtils.js
import { GRID_ROWS, GRID_COLS, CELL_SIZE } from "../constants";

export const initializeGrid = () => {
  return Array(GRID_ROWS)
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
};

export const drawGridOnCanvas = (ctx, grid, startPoint, endPoint) => {
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

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

export const getNeighborsUtil = (node, grid) => {
  const neighbors = [];
  const directions = [
    [0, 1],
    [1, 0],
    [0, -1],
    [-1, 0],
  ]; // Right, Down, Left, Up

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

export const generateCityMapGrid = () => {
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

  const mainRoadWidth = 1;
  const blockSizeMin = 10;
  const blockSizeMax = 20;
  const buildingDensity = 0.9;

  for (
    let y = blockSizeMin;
    y < GRID_ROWS;
    y +=
      blockSizeMin + Math.floor(Math.random() * (blockSizeMax - blockSizeMin))
  ) {
    if (y + mainRoadWidth >= GRID_ROWS) continue;
    for (let roadY = 0; roadY < mainRoadWidth; roadY++) {
      for (let x = 0; x < GRID_COLS; x++) {
        if (y + roadY < GRID_ROWS) newGrid[y + roadY][x].isWall = false;
      }
    }
  }

  for (
    let x = blockSizeMin;
    x < GRID_COLS;
    x +=
      blockSizeMin + Math.floor(Math.random() * (blockSizeMax - blockSizeMin))
  ) {
    if (x + mainRoadWidth >= GRID_COLS) continue;
    for (let roadX = 0; roadX < mainRoadWidth; roadX++) {
      for (let y = 0; y < GRID_ROWS; y++) {
        if (x + roadX < GRID_COLS) newGrid[y][x + roadX].isWall = false;
      }
    }
  }

  for (let y = Math.floor(blockSizeMin / 2); y < GRID_ROWS; y += blockSizeMin) {
    if (Math.random() < 0.4) continue;
    for (let x = 0; x < GRID_COLS; x++) newGrid[y][x].isWall = false;
  }

  for (let x = Math.floor(blockSizeMin / 2); x < GRID_COLS; x += blockSizeMin) {
    if (Math.random() < 0.4) continue;
    for (let y = 0; y < GRID_ROWS; y++) newGrid[y][x].isWall = false;
  }

  const numParks = 3 + Math.floor(Math.random() * 3);
  for (let i = 0; i < numParks; i++) {
    const parkX = Math.floor(Math.random() * (GRID_COLS - blockSizeMax));
    const parkY = Math.floor(Math.random() * (GRID_ROWS - blockSizeMax));
    const parkWidth =
      blockSizeMin + Math.floor(Math.random() * (blockSizeMax - blockSizeMin));
    const parkHeight =
      blockSizeMin + Math.floor(Math.random() * (blockSizeMax - blockSizeMin));

    for (let y = parkY; y < parkY + parkHeight && y < GRID_ROWS; y++) {
      for (let x = parkX; x < parkX + parkWidth && x < GRID_COLS; x++) {
        newGrid[y][x].isWall = false;
      }
    }
  }

  for (let y = 0; y < GRID_ROWS; y++) {
    for (let x = 0; x < GRID_COLS; x++) {
      if (!newGrid[y][x].isWall) continue;
      if (Math.random() > buildingDensity) newGrid[y][x].isWall = false;
    }
  }

  const entrances = 5 + Math.floor(Math.random() * 5);
  for (let i = 0; i < entrances; i++) {
    const xPos = Math.floor(Math.random() * GRID_COLS);
    for (let w = 0; w < mainRoadWidth; w++) {
      if (xPos + w < GRID_COLS) {
        newGrid[0][xPos + w].isWall = false;
        newGrid[GRID_ROWS - 1][xPos + w].isWall = false;
      }
    }
    const yPos = Math.floor(Math.random() * GRID_ROWS);
    for (let w = 0; w < mainRoadWidth; w++) {
      if (yPos + w < GRID_ROWS) {
        newGrid[yPos + w][0].isWall = false;
        newGrid[yPos + w][GRID_COLS - 1].isWall = false;
      }
    }
  }
  return newGrid;
};
