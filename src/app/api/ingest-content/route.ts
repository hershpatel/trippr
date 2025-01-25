import { NextResponse } from "next/server";
import { z } from "zod";
import { scrapeInstgramUrl } from "../lib/apify";
import { getTags } from "../lib/instructor";

const ingestRequestSchema = z.object({
  url: z.string().url().min(1).refine((url) => url.startsWith("https://"), {
    message: "URL must start with https://",
  }),
});
type IngestRequest = z.infer<typeof ingestRequestSchema>;

const ingestResponseSchema = z.object({
  message: z.string(),
  tags: z.array(z.string()),
  is_relevant: z.boolean(),
});

export async function POST(request: Request) {
  try {
    // Validate API key
    // TODO: move to middleware
    const apiKey = request.headers.get('x-api-key');
    
    if (!apiKey || apiKey !== process.env.TRIPPR_API_KEY) {
      return NextResponse.json(
        { error: "Invalid or missing API key" },
        { status: 401 }
      );
    }

    // Unpack request body
    // TODO: move to middleware
    const body = await request.json().catch(() => null) as IngestRequest | null;
    if (!body) {
      return NextResponse.json(
        { error: "Request body must be valid JSON" },
        { status: 400 }
      );
    }
    const data = ingestRequestSchema.parse(body);
    const url = data.url;

    console.log("Ingesting content from URL:", url);

    // Scrape Instagram URL
    const items = await scrapeInstgramUrl(url);
    if (items.length == 0 || !items[0]) {
      return NextResponse.json(
        { error: "No valid item found" },
        { status: 400 }
      );
    }
    console.log("Items:", items);

    // Tag content
    const tags = await getTags(items[0]);
    console.log("Tags:", tags);

    return NextResponse.json(ingestResponseSchema.parse({
      message: tags.explanation,
      tags: tags.tags,
      is_relevant: tags.is_relevant,
    }), { status: 200 });

  } catch (error) {
    console.error("Error ingesting content:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request data", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
