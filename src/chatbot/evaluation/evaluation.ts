import { TRPCError } from "@trpc/server";
import { db } from "~/server/db";
import { Parser } from "../statemachine/parser";
import { parseArrayFromJson } from "../utils/parseArray";
import { or } from "drizzle-orm";
import { CaseComponent } from "../statemachine/case_component";

async function evaluateCase(sessionId: number, userId: string) {
  const session = await db.query.caseSessions.findFirst({
    where: (caseSessions, { eq }) =>
      eq(caseSessions.userId, userId) && eq(caseSessions.id, sessionId),
  });

  if (!session) {
    throw new TRPCError({ code: "NOT_FOUND" });
  }

  const caseParsed = Parser.parseCaseStateFromJsonFlat(session.liveStructure);
  const caseHistory = parseArrayFromJson<string>(session.order);
  // sequentially do the evaluation of all sections
  for (const sectionId of caseHistory) {
    const section = caseParsed[sectionId]; // This is the reference section with solution and stuff
    if (!section) {
      throw new TRPCError({ code: "NOT_FOUND" });
    }
    await evaluateSection(sessionId, sectionId, section);
  }
}

async function evaluateSection(
  sessionId: number,
  sectionId: string,
  sectionReference: CaseComponent,
) {
  // retrieve only components that are of type Interviewer or Candidate
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

  //! Now you can hopefully use the reference solution
}

// Two functions

// Generate evaluation
// - One big function for creating the evaluation

// Subfunctions

// Evaluate component function

// Evaluate

// Call LLM With Wrapper and wrapper should be parsed function
