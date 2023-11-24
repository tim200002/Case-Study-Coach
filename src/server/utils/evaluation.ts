import { VertexAIWrapper } from "~/chatbot/llm/language_model";
import { type VideoAnalysisComponent } from "../db/schema";

export function getSpeechSpeedScore(scores: number[]) {
  const score = movingAverage(scores);

  console.log("speed score", score);

  // Ideal speed is 150 wpm
  const idealSpeed = 50;
  // Lower and upper bounds
  const lowerBound = 0; // Too slow threshold
  const upperBound = 100; // Too fast threshold

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
  const score = movingAverage(scores);

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

function movingAverage(scores: number[]) {
  let sum = 0;
  for (const score of scores) {
    sum += score;
  }
  return sum / scores.length;
}

export async function analyzeFacialExpressions(
  expressionHistory: VideoAnalysisComponent[],
) {
  const wrapper = new VertexAIWrapper();
  const convertAnalysisComponentIntoString = (
    component: VideoAnalysisComponent,
  ) => {
    return `Anger: ${component.angerLikelihood} Joy: ${component.joyLikelihood} Surprise: ${component.surpriseLikelihood} Sorrow: ${component.sorrowLikelihood}`;
  };
  const prompt = `We are in the situation of a job interview. With a camera I got pictures of a candidate and analyzed them for their mood over the last few seconds. Your job is to give the candidate actionable reccomendations to improve their performance. These recomendations will be shown to the candidate during the interview. One exaple is "You did not smile for quite some time, try to incorporate more smiling to appear more friendly". Provide exactly one action reccomendation as output to the candidate. The reccomendation should be short and brief

Input (new to old):
${expressionHistory
  .map((e, i) => `${i + 1}: ${convertAnalysisComponentIntoString(e)}`)
  .join("\n")}

Action recommendation:
`;

  return await wrapper.predict(prompt);
}
