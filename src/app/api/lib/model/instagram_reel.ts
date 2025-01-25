import { z } from "zod";

export const extractedInstagramReelSchema = z.object({
  url: z.string().url(),
  inputUrl: z.string().url(),
  videoUrl: z.string().url(),
  caption: z.string(),
  hashtags: z.array(z.string()),
  ownerUsername: z.string(),
});

export type ExtractedInstagramReel = z.infer<typeof extractedInstagramReelSchema>;
