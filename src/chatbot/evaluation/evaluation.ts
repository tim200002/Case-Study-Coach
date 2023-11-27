import { TRPCError } from "@trpc/server";
import { db } from "~/server/db";
import { Parser } from "../statemachine/parser";
import { parseArrayFromJson } from "../utils/parseArray";
import { or } from "drizzle-orm";
import { CaseComponent } from "../statemachine/case_component";
import { prependTag } from "../utils/formatters";
import { VertexAIWrapper } from "../llm/language_model";
import { evaluations } from "~/server/db/schema";
import { evaluationComponents } from "~/server/db/schema";

async function evaluateCase(sessionId: number) {
  const session = await db.query.caseSessions.findFirst({
    where: (caseSessions, { eq }) => eq(caseSessions.id, sessionId),
  });

  if (!session) {
    throw new TRPCError({ code: "NOT_FOUND" });
  }

  const sectionEvaluations = [];

  const caseParsed = Parser.parseCaseStateFromJsonFlat(session.liveStructure);
  /*const caseHistory = parseArrayFromJson<string>(session.order);
  // sequentially do the evaluation of all sections
  for (const sectionId of caseHistory) {
    const sectionReference = caseParsed[sectionId]; // This is the reference section with solution and stuff
    if (!sectionReference) {
      throw new TRPCError({ code: "NOT_FOUND" });
    }
    sectionEvaluations.push(
      //await evaluateSection(sessionId, sectionId, sectionReference),
      "caseHistory,",
    );
  }*/
  console.log("case parsed");

  // Overall evaluation of the case
  const feedback = "You did great overall";
  const overall_score = 8;
  const state = "CREATING_EVALUATION";

  // Create an evaluation object
  await db.insert(evaluations).values([
    {
      caseSessionId: session.id,
      overallScore: overall_score,
      overallFeedback: feedback,
      state: state,
    },
  ]);

  const evaluation = await db.query.evaluations.findFirst({
    where: (evaluations, { eq }) => eq(evaluations.caseSessionId, session.id),
  });

  console.log("fuck");

  // Create evaluation components
  /*for await (const sectionEvaluation of sectionEvaluations) {
    await db.insert(evaluationComponents).values([
      {
        evaluationId: evaluation!.id,
        sectionId: "0",
        score: 10,
        feedback: "feedback",
      },
    ]);
  }*/

  // Update the state of the evaluation and calculate the overall score

  // return some evaluationObject
  return evaluation!.id;
}

async function evaluateSection(
  sessionId: number,
  sectionId: string,
  sectionReference: CaseComponent,
) {
  // retrieve only components that are of type Interviewer or Candidate
  /*const conversationComponentsRetrieved =
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
    .join("\n\n");*/

  /*const llm = new VertexAIWrapper();

  const evaluationPrompt =
    "Please evaluate how the candidate performed on the following section:\n\n" +
    conversationString;

  const evaluationScorePrompt =
    "Please evalate how the candidate performed on the following section. Only output a number between 0 and 10 with 10 being the highest. Do not output anything else.\n\n" +
    conversationString;

  const feedback = await llm.predict(evaluationPrompt);
  const score = await llm.predict(evaluationScorePrompt); //TODO: Check if score is a number between 0 and 10*/

  // return some evaluationObject
  return {
    sectionId: sectionId,
    score: 5,
    feedback: "Feedback",
  };
}

export { evaluateCase };

// Two functions

// Generate evaluation
// - One big function for creating the evaluation

// Subfunctions

// Evaluate component function

// Evaluate

// Call LLM With Wrapper and wrapper should be parsed function
