// src/algorithms/heuristic.js
// Manhattan distance heuristic for A*
export const manhattanDistance = (node, goal) => {
  return Math.abs(node.x - goal.x) + Math.abs(node.y - goal.y);
};
