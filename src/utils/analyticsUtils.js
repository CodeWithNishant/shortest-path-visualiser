// src/utils/analyticsUtils.js
export const calculateEfficiencyScore = (nodes, pathLength) => {
  if (pathLength === 0) return "0.00"; // Return string for consistency
  return (nodes / pathLength).toFixed(2);
};
