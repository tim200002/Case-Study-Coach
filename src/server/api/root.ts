import { caseRouter } from "~/server/api/routers/case";
import { createTRPCRouter } from "~/server/api/trpc";
import { chatbotRouter } from "./routers/chatbot";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  case: caseRouter,
  chatbot: chatbotRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
