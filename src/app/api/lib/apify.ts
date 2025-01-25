import { ApifyClient } from "apify-client";
import { type ExtractedInstagramReel } from "./model/instagram_reel";

const client = new ApifyClient({
  token: process.env.APIFY_API_KEY,
});

interface ApifyInstagramPost {
  url: string;
  inputUrl: string;
  videoUrl: string;
  caption: string;
  hashtags: string[];
  ownerUsername: string;
}

export async function scrapeInstgramUrl(url: string): Promise<ExtractedInstagramReel[]> {
  const result = await client.actor("apify/instagram-scraper").call({
    addParentData: false,
    directUrls: [url],
    enhanceUserSearchWithFacebookPage: false,
    isUserReelFeedURL: false,
    isUserTaggedFeedURL: false,
    resultsLimit: 200,
    resultsType: 'posts',
    searchLimit: 1,
    searchType: 'hashtag',
  });
  const { items } = await client.dataset(result.defaultDatasetId).listItems();

  console.log('Results from url', url);
  console.log(items);

  return (items as unknown as ApifyInstagramPost[]).map((item) => ({
    url: item.url,
    inputUrl: item.inputUrl,
    videoUrl: item.videoUrl,
    caption: item.caption,
    hashtags: item.hashtags,
    ownerUsername: item.ownerUsername,
  }));
}
