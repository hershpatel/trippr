import OpenAI from "openai";
import Instructor from "@instructor-ai/instructor";
import z from "node_modules/zod/lib";
import { type ExtractedInstagramReel } from "./model/instagram_reel";
const client = new OpenAI({
  apiKey: process.env.DEEPSEEK_API_KEY,
  baseURL: "https://api.deepseek.com/v1",
});

const instructor = Instructor({
  client,
  mode: "JSON_SCHEMA",
});

export default instructor;

export const TagsSchema = z.object({
  tags: z.array(z.string()).describe("A list of geographical / location-based tags that describe the content of the reel. The tags should only be geographical (e.g. city, country, continent). If it is not clear what the tag is, set is_relevant to false. The hash tags may be a good indicator of the tag, but it may not be the only indicator."),
  explanation: z.string().describe("A short explanation of why the tags were chosen. The explanation should be no more than 75 words."),
  is_relevant: z.boolean().default(true).describe("Whether the content is relevant to travel and tourism. If the content is not relevant to travel and tourism, the value should be false."),
});
export type Tags = z.infer<typeof TagsSchema>;

export async function getTags(reel: ExtractedInstagramReel): Promise<Tags> {
  const message = `
    You are a helpful assistant that describes tags from an Instagram content.
    The tags are a list of keywords that describe the content of the reel.
    The explanation is a short explanation of why the tags were chosen.

    Here is the Instagram content to analyze:
    Caption: ${reel.caption}
    Existing hashtags: ${reel.hashtags.join(', ')}
    `
  const response = await instructor.chat.completions.create({
    model: "deepseek-chat",
    messages: [
      { role: "user", content: message },
    ],
    response_model: {
      name: "tags",
      schema: TagsSchema,
    },
    stream: false,
  });
  
  return response;
}
