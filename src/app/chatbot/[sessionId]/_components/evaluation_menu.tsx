"use client";

import { api } from "~/trpc/react";
import Spinner from "~/app/_components/spinner";
import { useSettingsStorage } from "~/store/settings_store";

export const SpeedEvaluationSlider = (props: { value: number | null }) => {
  if (props.value === null) {
    return <div className="relative h-5 rounded-full bg-gray-200" />;
  }

  // Assuming value ranges from -5 (too slow) to +5 (too fast), 0 being optimal
  const normalizedValue = (props.value + 5) * 10; // Convert to a scale of 0 to 100

  return (
    <div className="relative flex h-5 items-center rounded-full bg-gray-200">
      <div className="absolute left-0">Too slow</div>
      <div className="absolute right-0">Too fast</div>
      <div
        style={{ left: `${normalizedValue}%` }}
        className="transition-left absolute h-5 w-5 -translate-x-1/2 transform rounded-full bg-blue-500 duration-500 ease-in-out" // Slider handle
      ></div>
    </div>
  );
};

const EvaluationSlider = (props: { value: number | null }) => {
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
        className="transition-width absolute h-5 rounded-full duration-500 ease-in-out"
      ></div>
    </div>
  );
};

export const EvaluationComponent = (props: { sessionId: number }) => {
  const {
    data: conversationEvaluationScore,
    isLoading: conversationEvaluationLoading,
  } = api.chatbot.getCurrentEvaluationScore.useQuery({
    sessionId: props.sessionId,
  });

  const settingsStore = useSettingsStorage();
  if (settingsStore.inputModality !== "Voice") {
    return null;
  }

  const waitingForEnoughEvaluations = conversationEvaluationScore === null;

  // Skeleton Loader Component
  const EvaluationSkeleton = (props: { message: string }) => {
    return (
      <div className="h-full w-full space-y-4">
        <div className="h-6 w-3/4 animate-pulse rounded-md bg-gray-200"></div>
        <div className="h-6 w-1/2 animate-pulse rounded-md bg-gray-200"></div>
        <div className="h-5 w-full animate-pulse rounded-full bg-gray-200"></div>
        <p className="mt-2 text-sm font-semibold text-gray-500">
          {props.message}
        </p>
      </div>
    );
  };

  return (
    <div className="m-2 flex w-96 flex-col items-start space-y-4 rounded-md bg-white p-6 shadow-md">
      <h1 className="mb-4 text-xl font-bold">Live Evaluation</h1>
      {(() => {
        if (conversationEvaluationLoading) {
          return <EvaluationSkeleton message="Please wait, fetching data..." />;
        }
        if (waitingForEnoughEvaluations) {
          return (
            <EvaluationSkeleton message="Please wait, gathering enough evaluations..." />
          );
        } else {
          return (
            <div>
              <div className="w-full">
                <label className="mb-2 block text-sm font-bold text-gray-700">
                  Clarity:
                </label>
                <EvaluationSlider
                  value={conversationEvaluationScore!.clarityScore}
                />
              </div>

              <div className="w-full">
                <label className="mb-2 block text-sm font-bold text-gray-700">
                  Speed:
                </label>
                <SpeedEvaluationSlider
                  value={conversationEvaluationScore!.speedScore}
                />
              </div>
            </div>
          );
        }
      })()}
    </div>
  );
};
