import { z } from "zod";

import { openai } from "@ai-sdk/openai";
import { generateObject } from "ai";

import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";

export const aiRouter = createTRPCRouter({
  analyse: publicProcedure
    .input(
      z.object({
        files: z.array(
          z.object({
            name: z.string(),
            base64: z.string(),
          }),
        ),
        temperature: z.number().optional(),
      }),
    )
    .mutation(async ({ input }) => {
      const fileBuffersWithMeta = await Promise.all(
        input.files.map((serializedFile) => {
          const base64 = serializedFile.base64.split(",")[1] ?? "";
          return {
            name: serializedFile.name,
            buffer: Buffer.from(base64, "base64"),
          };
        }),
      );

      // do ai stuff
      const result = await generateObject({
        model: openai("gpt-4o-mini"),
        system:
          "Analyze and judge the instagram profile shown in the following screenshots. Include at the end of your response a score between 0 and 100 where 0 is not good and 100 is perfect. Be brutally honest in your response. Also, categorize the profile into a niche micro-genre as well. Phrase it like you are talking to the instagram profile owner. This whole thing should be more like an informal light-hearted roast, not a formal review or critique. Be crude, be funny, and don't be afraid totease. Include some nice things, don't be overly mean. Do not mention captions. Give about 3 paragraphs in the full roast. If they don't include the follower and following count, don't mention it in the full review or make fun of them for not including it. Make the grade higher than it should be to be nice, and make the micro-genre creative.",
        messages: [
          {
            role: "user",
            content: fileBuffersWithMeta.map((buffer) => ({
              type: "image" as const,
              image: buffer.buffer,
            })),
          },
        ],
        temperature: input.temperature,
        schema: z.object({
          letterGrade: z.string(),
          overallScoreOutOf100: z.number(),
          followerToFollowingLetterGrade: z.string(),
          microGenre: z.string(),
          fullAnalysisText: z.string(),
          genreEmoji: z.string(),
        }),
      });

      return result.object;
    }),
});
