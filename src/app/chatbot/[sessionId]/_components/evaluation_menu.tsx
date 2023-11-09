"use client";

import { useContext } from "react";
import { EvaluationStoreContext } from "../content";
import { useStore } from "zustand";

export const EvaluationSlider = (props: { value: number | null }) => {
  // Linearly interpolate between start and end based on t (0 <= t <= 1)
  const lerp = (start: number, end: number, t: number) => {
    return start + t * (end - start);
  };

  // This should look like deactivate
  if (props.value === null)
    return <div className="relative h-5 rounded-full bg-gray-200" />;

  // Calculate the red and green components based on the value
  const red = Math.floor(lerp(255, 0, props.value / 10));
  const green = Math.floor(lerp(0, 255, props.value / 10));

  return (
    <div className="relative h-5 rounded-full bg-gray-200">
      <div
        style={{
          width: `${props.value * 10}%`,
          backgroundColor: `rgb(${red}, ${green}, 0)`,
        }}
        className="absolute h-5 rounded-full"
      ></div>
    </div>
  );
};

export const EvaluationComponent = () => {
  const evaluationStoreContext = useContext(EvaluationStoreContext);
  if (!evaluationStoreContext) throw new Error("Evaluation store not found");

  const evaluationStore = useStore(evaluationStoreContext);

  return (
    <div className="m-2 flex w-96 flex-col items-start space-y-4 rounded-md bg-white p-6 shadow-md">
      <h1 className="mb-4 text-xl font-bold">Live Evaluation</h1>

      <div className="w-full">
        <label className="mb-2 block text-sm font-bold text-gray-700">
          Clarity:
        </label>
        <EvaluationSlider value={evaluationStore.clarity} />
      </div>

      <div className="w-full">
        <label className="mb-2 block text-sm font-bold text-gray-700">
          Speed:
        </label>
        <EvaluationSlider value={evaluationStore.speechSpeed} />
      </div>

      <div className="w-full">
        <label className="mb-2 block text-sm font-bold text-gray-700">
          Engagement:
        </label>
        {/* <EvaluationSlider value={evaluationStore.engagement} /> */}
      </div>
    </div>
  );
};
