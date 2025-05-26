// src/utils/animationUtils.js
export const getAnimationDelay = (speedValue, isPath = false) => {
  // speedValue is expected to be speed[0] from the state
  const baseDelay = isPath ? 5 : 20;
  return Math.max(5, baseDelay - (speedValue / 100) * baseDelay);
};
