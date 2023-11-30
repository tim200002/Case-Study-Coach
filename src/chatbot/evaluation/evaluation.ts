import { TRPCError } from "@trpc/server";
import { db } from "~/server/db";

import {
  parseArrayFromJson,
  parseCaseStateFromJsonFlat,
} from "../utils/parseArray";

import { or } from "drizzle-orm";
import { type CaseComponent } from "../statemachine/case_component";
import { prependTag } from "../utils/formatters";
import { VertexAIWrapper } from "../llm/language_model";
import { evaluations } from "~/server/db/schema";
import { evaluationComponents } from "~/server/db/schema";
import evaluationTemplateFactory from "./evaluation_templates/evaluation_factory";

type EvaluationComponentObject = {
  sectionId: string;
  score: number;
  feedback: string;
  conversationString: string;
};

async function evaluateCase(sessionId: number) {
  const session = await db.query.caseSessions.findFirst({
    where: (caseSessions, { eq }) => eq(caseSessions.id, sessionId),
  });

  if (!session) {
    throw new TRPCError({ code: "NOT_FOUND" });
  }

  const sectionEvaluations: EvaluationComponentObject[] = [];

  // Convert session.liveStructure to JSON
  const caseParsed = parseCaseStateFromJsonFlat(
    JSON.parse(session.liveStructure as string),
  );

  const caseHistory = parseArrayFromJson<string>(session.order as string);

  // sequentially do the evaluation of all sections
  for (const sectionId of caseHistory) {
    const sectionReference = caseParsed[sectionId]; // This is the reference section with solution and stuff
    if (!sectionReference) {
      throw new TRPCError({ code: "NOT_FOUND" });
    }
    sectionEvaluations.push(
      await evaluateSection(sessionId, sectionId, sectionReference),
    );
  }

  // Calculate overall score and overall feedback
  let overall_score = 0;

  for (const sectionEvaluation of sectionEvaluations) {
    overall_score += sectionEvaluation.score;
  }

  overall_score = Math.round(overall_score / sectionEvaluations.length);

  const feedback = "YET TO BE IMPLEMENTED";
  const state = "CREATING_EVALUATION";

  //! ToDo refactor into additional function. Also it is a the wrong place
  // sentiment analysis
  // fetch video analysis components related to this session
  const sessionVideoAnalysisComponents =
    await db.query.videoAnalysisComponents.findMany({
      where: eq(videoAnalysisComponents.caseSessionId, input.sessionId),
    });

  // check if evaluations exsits and if there are enough video analysis components

  // create analysis with dowa, maybe some score

  // Create an evaluation object
  await db.insert(evaluations).values([
    {
      caseSessionId: session.id,
      overallScore: overall_score,
      overallFeedback: feedback,
      state: state,
      // videoSentimentAnalysis: videoSentimentAnalysis,
    },
  ]);

  const evaluation = await db.query.evaluations.findFirst({
    where: (evaluations, { eq }) => eq(evaluations.caseSessionId, session.id),
  });

  // Create evaluation components
  for await (const sectionEvaluation of sectionEvaluations) {
    await db.insert(evaluationComponents).values([
      {
        evaluationId: evaluation!.id,
        sectionId: sectionEvaluation.sectionId,
        score: sectionEvaluation.score,
        feedback: sectionEvaluation.feedback,
      },
    ]);
  }

  // return some evaluationObject
  return evaluation;
}

async function evaluateSection(
  sessionId: number,
  sectionId: string,
  sectionReference: CaseComponent,
) {
  //retrieve only components that are of type Interviewer or Candidate
  const conversationComponentsRetrieved =
    await db.query.conversationComponents.findMany({
      where: (conversationComponents, { and, eq }) =>
        and(
          eq(conversationComponents.caseSessionId, sessionId),
          eq(conversationComponents.sectionId, sectionId),
          or(
            eq(conversationComponents.type, "CANDIDATE"),
            eq(conversationComponents.type, "INTERVIEWER"),
          ),
        ),
      orderBy: (conversationComponents, { asc }) => [
        asc(conversationComponents.createdAt),
      ],
    });

  const conversationString = conversationComponentsRetrieved
    .map((component) => prependTag(component.content, component.type))
    .join("\n\n");

  const llm = new VertexAIWrapper();

  // Get prompt based on sectionReference
  const evaluationTemplate = evaluationTemplateFactory(sectionReference);

  const evaluationFeedbackPrompt =
    evaluationTemplate.getEvaluationPrompt(conversationString);

  const evaluationScorePrompt =
    evaluationTemplate.getEvaluationScorePrompt(conversationString);

  const feedback = await llm.predict(evaluationFeedbackPrompt);
  const score = parseInt(await llm.predict(evaluationScorePrompt)); //TODO: Check if score is a number between 0 and 10*/

  // return some evaluationObject
  return {
    sectionId,
    score,
    feedback,
    conversationString,
  };
}

export { evaluateCase };
