import { ImageAnnotatorClient } from "@google-cloud/vision";
import { google } from "@google-cloud/vision/build/protos/protos";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { createTRPCRouter, privateProcedure } from "~/server/api/trpc";
import { db } from "~/server/db";
import {
  conversationEvaluationComponents,
  videoAnalysisComponents,
} from "~/server/db/schema";
import {
  getSpeechSpeedScore,
  getClarityScore,
} from "~/server/utils/evaluation";

export const analysisRouter = createTRPCRouter({
  analyzeScreenshot: privateProcedure
    .input(z.object({ screenshot: z.string(), sessionId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const { screenshot, sessionId } = input;
      console.log("Called analyze Screenshots");

      const client = new ImageAnnotatorClient({
        keyFilename: "./google_key.json",
      });
      try {
        const buffer = Buffer.from(screenshot, "base64");
        const [result] = await client.faceDetection(buffer);
        const faces = result.faceAnnotations;
        if (!faces || faces.length === 0) {
          console.log("No faces detected");
          return;
        }

        // Get the face data
        const face = faces[0]!;
        const angerLikelihood = face.angerLikelihood;
        const joyLikelihood = face.joyLikelihood;
        const surpriseLikelihood = face.surpriseLikelihood;
        const sorrowLikelihood = face.sorrowLikelihood;

        // Helper function to convert and validate the likelihood value
        function convertLikelihood(
          likelihood:
            | google.cloud.vision.v1.Likelihood
            | "UNKNOWN"
            | "VERY_UNLIKELY"
            | "UNLIKELY"
            | "POSSIBLE"
            | "LIKELY"
            | "VERY_LIKELY"
            | null
            | undefined,
        ) {
          if (likelihood === null || likelihood === undefined) {
            return "UNKNOWN";
          }
          switch (likelihood) {
            case "VERY_UNLIKELY":
            case "UNLIKELY":
            case "POSSIBLE":
            case "LIKELY":
            case "VERY_LIKELY":
              return likelihood;
            default:
              return "UNKNOWN";
          }
        }

        await db.insert(videoAnalysisComponents).values({
          caseSessionId: sessionId,
          angerLikelihood: convertLikelihood(angerLikelihood),
          joyLikelihood: convertLikelihood(joyLikelihood),
          surpriseLikelihood: convertLikelihood(surpriseLikelihood),
          sorrowLikelihood: convertLikelihood(sorrowLikelihood),
        });
      } catch (error) {
        console.error("Error detecting faces:", error);
      }
    }),
  addConversationEvaluation: privateProcedure
    .input(
      z.object({
        sessionId: z.number(),
        content: z.string(),
        speechClarity: z.number(),
        speechSpeed: z.number(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // add change
      const { sessionId, content, speechClarity, speechSpeed } = input;
      await db.insert(conversationEvaluationComponents).values({
        caseSessionId: sessionId,
        content,
        speechClarity,
        speechSpeed,
      });
    }),

  getCurrentEvaluationScore: privateProcedure
    .input(z.object({ sessionId: z.number() }))
    .query(async ({ ctx, input }) => {
      const limit = 15;
      const results = await db.query.conversationEvaluationComponents.findMany({
        where: eq(
          conversationEvaluationComponents.caseSessionId,
          input.sessionId,
        ),
        orderBy: (component, { desc }) => [desc(component.createdAt)],
        limit: limit,
      });

      // make sure at least 3 evaluations are done, for score to be meaningful
      if (results.length < 3) {
        return null;
      }

      // calculate scores
      const averageSpeedScore = getSpeechSpeedScore(
        results.map((r) => r.speechSpeed),
      );
      const averageClarityScore = getClarityScore(
        results.map((r) => r.speechClarity),
      );

      return {
        speedScore: averageSpeedScore,
        clarityScore: averageClarityScore,
      };
    }),
});
