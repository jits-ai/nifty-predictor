import { NextResponse } from "next/server";
import { NewsArticle, NewsResponse } from "@/lib/types";

function parseRSS(xml: string, category: "india" | "global"): NewsArticle[] {
  const items: NewsArticle[] = [];
  const itemRegex = /<item>([\s\S]*?)<\/item>/g;
  let match;

  while ((match = itemRegex.exec(xml)) !== null) {
    const block = match[1];

    const title = decodeEntities(extract(block, "title"));
    const link = extract(block, "link") || extract(block, "guid");
    const pubDate = extract(block, "pubDate");
    // Google News RSS descriptions are just HTML repeating the title — skip them
    const sourceName = decodeEntities(extract(block, "source")) || inferSource(title);

    // Google News titles are "Headline - Source", strip the source from title
    const cleanTitle = sourceName
      ? title.replace(new RegExp(`\\s*[-–]\\s*${escapeRegex(sourceName)}\\s*$`), "").trim()
      : title;

    if (!cleanTitle || cleanTitle === "[Removed]") continue;

    items.push({
      title: cleanTitle,
      description: "",
      source: sourceName,
      publishedAt: pubDate ? new Date(pubDate).toISOString() : new Date().toISOString(),
      url: link,
      category,
    });
  }

  return items.slice(0, 6);
}

function extract(block: string, tag: string): string {
  const m = block.match(new RegExp(`<${tag}[^>]*>(?:<!\\[CDATA\\[)?([\\s\\S]*?)(?:\\]\\]>)?<\\/${tag}>`, "i"));
  return m ? m[1].trim() : "";
}

function decodeEntities(str: string): string {
  return str
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'");
}

function stripHtml(str: string): string {
  return str.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function inferSource(title: string): string {
  const m = title.match(/[-–]\s*([^-–]+)$/);
  return m ? m[1].trim() : "";
}

async function fetchRSS(url: string, category: "india" | "global"): Promise<NewsArticle[]> {
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; NewsBot/1.0)" },
      next: { revalidate: 1800 },
    });
    if (!res.ok) return [];
    const xml = await res.text();
    return parseRSS(xml, category);
  } catch {
    return [];
  }
}

export async function GET() {
  const [indiaArticles, globalArticles] = await Promise.all([
    fetchRSS(
      "https://news.google.com/rss/search?q=india+stock+market+nifty+RBI+economy+rupee&hl=en-IN&gl=IN&ceid=IN:en",
      "india"
    ),
    fetchRSS(
      "https://news.google.com/rss/search?q=global+markets+oil+price+fed+rates+geopolitics+war+ceasefire+china+trade&hl=en&gl=US&ceid=US:en",
      "global"
    ),
  ]);

  const response: NewsResponse = {
    articles: [...indiaArticles, ...globalArticles],
  };

  return NextResponse.json(response);
}
