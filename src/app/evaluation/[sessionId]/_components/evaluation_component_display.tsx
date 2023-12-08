"use client";

import { text } from "stream/consumers";
import { type EvaluationComponent } from "~/server/db/schema";

export default function EvaluationComponentDisplay(props: {
  evaluationComponent: EvaluationComponent;
}) {
  const evaluationComponent = props.evaluationComponent;

  if (!evaluationComponent) {
    throw Error("No Evaluation Component");
  }

  const analysisScore = evaluationComponent.score === -1;

  console.log(evaluationComponent.feedback);

  const feedbackSegments = parseFeedback(
    removeColonsAndDashes(evaluationComponent.feedback),
  );

  return (
    <div className="mx-auto my-8 max-w-sm rounded bg-white p-6 shadow-lg">
      {!analysisScore && (
        <div className="mb-4 text-center text-5xl font-bold text-black">
          {evaluationComponent.score} / 10
        </div>
      )}
      <div
        className="mx-2 overflow-y-scroll text-base text-gray-700"
        style={{ height: "500px" }}
      >
        {feedbackSegments.map((segment, index) => {
          if (segment.isDoubleLineBreak) {
            return (
              <div key={index}>
                <br />
              </div>
            );
          } else if (segment.bold) {
            return (
              <div key={index}>
                <b>{segment.text}</b>
                <br />
              </div>
            );
          } else {
            return <span key={index}>{segment.text}</span>;
          }
        })}
      </div>
    </div>
  );
}

function removeColonsAndDashes(feedback: string): string {
  return feedback.replace(/(?<!\*)\*(?!\*)|[:\-]/g, "");
}

interface TextSegment {
  text: string;
  bold: boolean;
  isDoubleLineBreak: boolean;
}

function parseFeedback(feedback: string): TextSegment[] {
  const regex = /(\*\*(.*?)\*\*)|(\s\s)/gs;
  let lastIndex = 0;
  const segments: TextSegment[] = [];

  feedback.replace(
    regex,
    (match, boldText, innerText: string, doubleSpace, offset: number) => {
      // Add text before the match as a regular segment
      if (offset > lastIndex) {
        segments.push({
          text: feedback.substring(lastIndex, offset),
          bold: false,
          isDoubleLineBreak: false,
        });
      }

      if (doubleSpace) {
        // Add double line break
        segments.push({ text: "", bold: false, isDoubleLineBreak: true });
      } else if (boldText) {
        // Add bold text
        segments.push({
          text: innerText,
          bold: true,
          isDoubleLineBreak: false,
        });
      }
      lastIndex = offset + match.length;
      return match; // Return value is not used
    },
  );

  // Remaining text after the last match
  if (lastIndex < feedback.length) {
    segments.push({
      text: feedback.substring(lastIndex),
      bold: false,
      isDoubleLineBreak: false,
    });
  }

  if (segments.length === 0) {
    return segments;
  }

  const segments_parsed: TextSegment[] = [];

  for (let i = 0; i < segments.length; i++) {
    segments_parsed.push(segments[i]!);
    if (
      i + 1 < segments.length &&
      segments[i]!.bold &&
      segments[i + 1]!.isDoubleLineBreak
    ) {
      i++;
    }
  }

  return segments_parsed;
}
