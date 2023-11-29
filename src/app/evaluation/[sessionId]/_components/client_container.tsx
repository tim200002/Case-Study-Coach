"use client";
import { useState } from "react";

import {
  type EvaluationComponent,
  type ConversationComponent,
  Case,
} from "~/server/db/schema";

import Chat from "./chat";
import EvaluationComponentDisplay from "./evaluation_component_display";
import { CaseInfo } from "./case_info";

export default function ClientContainer(props: {
  sectionConversationDict: Record<string, ConversationComponent[]>;
  sectionEvaluationDict: Record<string, EvaluationComponent>;
  sectionNamesDict: Record<string, string>;
  caseInfo: Case;
  sessionId: number;
}) {
  const {
    sectionConversationDict,
    sectionEvaluationDict,
    sectionNamesDict,
    caseInfo,
    sessionId,
  } = props;

  // Assert that neitner sectionConversationDict or sectionEvaluationDict is undefined
  if (!sectionConversationDict || !sectionEvaluationDict) {
    throw new Error(
      "sectionConversationDict or sectionEvaluationDict is undefined",
    );
  }

  const sections = Object.keys(sectionConversationDict);

  const [selectedSection, setSelectedSection] = useState<string>("0");
  const [conversation, setConversation] = useState<ConversationComponent[]>(
    sectionConversationDict[selectedSection]!,
  );
  const [evaluation, setEvaluation] = useState<EvaluationComponent>(
    sectionEvaluationDict[selectedSection]!,
  );

  const handleClick = (sectionId: string) => {
    setSelectedSection(sectionId);
    setConversation(sectionConversationDict[sectionId]!);
    setEvaluation(sectionEvaluationDict[sectionId]!);
  };

  return (
    <>
      <h1 className="my-4 text-center text-4xl font-bold">Case Evaluation</h1>
      <div className="mx-5 flex max-h-screen grow flex-row overflow-auto">
        <div className=" flex w-1/3 flex-col items-stretch">
          <CaseInfo case={caseInfo} />
          {sections.map((sectionId) => (
            <div
              key={sectionId}
              className={`m-2 rounded-lg p-4 transition-colors duration-300 ease-in-out
                    ${
                      selectedSection === sectionId
                        ? "bg-blue-500 text-white"
                        : "bg-white hover:bg-blue-200"
                    }
                    cursor-pointer text-xl shadow-sm hover:shadow-md `} // Added hover effects and shadows for interactivity
              onClick={() => handleClick(sectionId)}
            >
              {sectionNamesDict[sectionId]}
            </div>
          ))}
        </div>
        <Chat conversation={conversation} />
        <div className="flex w-1/3 flex-col items-end ">
          <EvaluationComponentDisplay evaluationComponent={evaluation} />
        </div>
      </div>
    </>
  );
}
