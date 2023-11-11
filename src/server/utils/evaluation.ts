export function getSpeechSpeedScore(scores: number[]) {
  const score = exponentiallyWeightedMovingAverage(scores, 0.9);

  // Ideal speed is 150 wpm
  const idealSpeed = 150;
  // Lower and upper bounds
  const lowerBound = 90; // Too slow threshold
  const upperBound = 200; // Too fast threshold

  let normalizedScore;

  if (score <= lowerBound) {
    normalizedScore = -5; // Too slow
  } else if (score >= upperBound) {
    normalizedScore = 5; // Too fast
  } else {
    // Linear interpolation between the bounds
    if (score < idealSpeed) {
      // Calculate score for the range from lowerBound to idealSpeed
      normalizedScore =
        -5 * (1 - (score - lowerBound) / (idealSpeed - lowerBound));
    } else {
      // Calculate score for the range from idealSpeed to upperBound
      normalizedScore = (5 * (score - idealSpeed)) / (upperBound - idealSpeed);
    }
  }

  return Math.round(normalizedScore);
}

export function getClarityScore(scores: number[]) {
  console.log("Clarity scores: ", scores);
  const score = exponentiallyWeightedMovingAverage(scores, 0.9);

  console.log("Clarity score: ", score);
  const scoreNormalized = Math.round(score * 10);
  return scoreNormalized;
}

function exponentiallyWeightedMovingAverage(scores: number[], alpha: number) {
  let weightedSum = 0;
  let weight = 1;
  for (const score of scores) {
    weightedSum += score * weight;
    weight *= alpha;
  }
  return weightedSum;
}
