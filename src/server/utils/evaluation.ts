export function getSpeechSpeedScore(scores: number[]) {
  const score = exponentiallyWeightedMovingAverage(scores, 0.9);

  const scoreNormalized = Math.min(score / 15, 10);
  return scoreNormalized;
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
