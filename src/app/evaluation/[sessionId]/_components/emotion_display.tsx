import { type Evaluation } from "~/server/db/schema";

export default function EmotionDisplay(props: { evaluation: Evaluation }) {
  const evaluation = props.evaluation;

  console.log("HELLLO");

  return (
    <div>
      <h1>Joy: {evaluation.joyScore}</h1>
      <h1>Anger: {evaluation.angerScore}</h1>
      <h1>Sorrow: {evaluation.sorrowScore}</h1>
      <h1>Surprise: {evaluation.surpriseScore}</h1>
    </div>
  );
}
