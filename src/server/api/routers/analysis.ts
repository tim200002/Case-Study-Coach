import { ImageAnnotatorClient } from "@google-cloud/vision";
import { z } from "zod";
import { createTRPCRouter, privateProcedure } from "~/server/api/trpc";

export const analysisRouter = createTRPCRouter({
  analyzeScreenshot: privateProcedure
    .input(z.object({ screenshot: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { screenshot } = input;
      console.log("Called analyze Screenshots");

      const client = new ImageAnnotatorClient({
        keyFilename: "./google_key.json",
      });
      try {
        const buffer = Buffer.from(screenshot, "base64");
        const [result] = await client.faceDetection(buffer);
        const faces = result.faceAnnotations;
        if (!faces) {
          console.log("No faces detected");
          return;
        }

        for (const face of faces) {
          // Get the anger likelihood and format it
          const likelihood = face.angerLikelihood;
          if (!likelihood) {
            console.log("No faces detected");
            return;
          }
          // const angerLikelihood = likelihoodName[likelihood];
          const text = `Anger Likelihood: ${likelihood}`;

          // Draw the text on the image
          console.log("Detectet setniment: " + text);
          return likelihood;
        }
      } catch (error) {
        console.error("Error detecting faces:", error);
      }
    }),
});
