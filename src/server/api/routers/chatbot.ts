import { z } from "zod";
import { createTRPCRouter, privateProcedure } from "~/server/api/trpc";
import { db } from "~/server/db";
import { eq } from "drizzle-orm";
import {
  caseSessions,
  cases,
  conversationComponents,
} from "~/server/db/schema";
import { TRPCError } from "@trpc/server";
import { Parser } from "~/chatbot/statemachine/parser";
import { Statemachine } from "~/chatbot/statemachine/statemachine";

export const chatbotRouter = createTRPCRouter({
  createNewSession: privateProcedure
    .input(z.object({ caseId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.userId;
      const { caseId } = input;

      // load raw case information
      const theCase = await db.query.cases.findFirst({
        where: eq(cases.id, caseId),
      });

      if (!theCase) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      const parsedStructure = Parser.parseCaseTemplateToProperStateStructure(
        theCase.caseContent,
      );

      console.log("Structure Parsing successful");

      const res = await db.insert(caseSessions).values({
        caseId,
        userId,
        liveStructure: parsedStructure,
      });

      const caseSession = await db.query.caseSessions.findFirst({
        where: eq(caseSessions.id, parseInt(res.insertId)),
      });

      if (!caseSession) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      }

      console.log("Case Session creation successful");
      const stateMachine = new Statemachine(theCase, caseSession);
      console.log("Statemachine creation successful");
      await stateMachine.startCase();

      return caseSession.id;
    }),

  getSession: privateProcedure
    .input(z.object({ sessionId: z.number() }))
    .query(async ({ ctx, input }) => {
      const { sessionId } = input;
      const userId = ctx.userId;

      // get session
      const currentSession = await db.query.caseSessions.findFirst({
        where: (caseSessions, { eq }) =>
          eq(caseSessions.userId, userId) && eq(caseSessions.id, sessionId),
        with: {
          conversationComponents: {
            orderBy: (component, { desc }) => [desc(component.createdAt)],
            where: (component, { inArray }) =>
              inArray(component.type, ["CANDIDATE", "INTERVIEWER"]),
          },
        },
      });

      if (!currentSession) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      return currentSession;
    }),

  addResponse: privateProcedure
    .input(z.object({ sessionId: z.number(), content: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { sessionId, content } = input;
      const userId = ctx.userId;

      // get session
      const currentSession = await db.query.caseSessions.findFirst({
        where: (caseSessions, { eq }) =>
          eq(caseSessions.userId, userId) && eq(caseSessions.id, sessionId),
        with: {
          case: true,
        },
      });

      if (!currentSession) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      const chatbot = new Statemachine(currentSession.case, currentSession);

      chatbot.addMessage(content, "CANDIDATE", false);

      // let run chatbot
      console.log("Chatbot do your thing!");
      const isCaseCompleted = false;

      // if case is completed update session
      if (isCaseCompleted) {
        await db.update(caseSessions).set({
          state: "FINISHED",
        });
      }

      // get full conversation histroy back
      const conversationHistory =
        await db.query.conversationComponents.findMany({
          where: eq(conversationComponents.caseSessionId, sessionId),
          orderBy: (component, { desc }) => [desc(component.createdAt)],
        });

      return {
        conversationHistory,
        isCaseCompleted,
      };
    }),
});
