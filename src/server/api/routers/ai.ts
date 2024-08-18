import { z } from "zod";

import { openai } from "@ai-sdk/openai";
import { generateText } from "ai";

import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";

export const aiRouter = createTRPCRouter({
  analyse: publicProcedure
    .input(
      z.array(
        z.object({
          name: z.string(),
          base64: z.string(),
        }),
      ),
    )
    .mutation(async ({ input }) => {
      const fileBuffersWithMeta = await Promise.all(
        input.map((serializedFile) => {
          const base64 = serializedFile.base64.split(",")[1] ?? "";
          return {
            name: serializedFile.name,
            buffer: Buffer.from(base64, "base64"),
          };
        }),
      );

      // do ai stuff
      const result = await generateText({
        model: openai("gpt-4o-mini"),
        system:
          "Analyze and judge the instagram profile shown in the following screenshots. Include at the end of your response a score between 0 and 100 where 0 is not good and 100 is perfect. Be mean, rude, and harsh in your response. Also, categorize the profile into a niche micro-genre as well. Phrase it like you are talking to the instagram profile owner. This whole thing should be more like a roast, not a review or critique. Be crude, be funny, and tease.",
        messages: [
          {
            role: "user",
            content: fileBuffersWithMeta.map((buffer) => ({
              type: "image" as const,
              image: buffer.buffer,
            })),
          },
        ],
      });

      return result.text;
    }),
});
