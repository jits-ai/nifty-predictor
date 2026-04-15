import { NewsArticle, NewsResponse } from "./types";

const MAX_PER_CATEGORY = 5;

// ── Google News RSS with when:1d forces today-only results ──────────────────
function parseRSS(xml: string, category: "india" | "global"): NewsArticle[] {
  const items: NewsArticle[] = [];
  const itemRegex = /<item>([\s\S]*?)<\/item>/g;
  let match;
  while ((match = itemRegex.exec(xml)) !== null) {
    const block = match[1];
    const title = decodeEntities(extract(block, "title"));
    const link = extract(block, "link") || extract(block, "guid");
    const pubDate = extract(block, "pubDate");
    const publishedAt = pubDate ? new Date(pubDate).toISOString() : new Date().toISOString();
    const sourceName = decodeEntities(extract(block, "source")) || inferSource(title);
    const cleanTitle = sourceName
      ? title.replace(new RegExp(`\\s*[-–]\\s*${escapeRegex(sourceName)}\\s*$`), "").trim()
      : title;
    if (!cleanTitle || cleanTitle === "[Removed]") continue;
    items.push({ title: cleanTitle, description: "", source: sourceName, publishedAt, url: link, category });
  }
  return items.slice(0, MAX_PER_CATEGORY);
}

function extract(block: string, tag: string): string {
  const m = block.match(new RegExp(`<${tag}[^>]*>(?:<!\\[CDATA\\[)?([\\s\\S]*?)(?:\\]\\]>)?<\\/${tag}>`, "i"));
  return m ? m[1].trim() : "";
}
function decodeEntities(s: string) {
  return s.replace(/&amp;/g,"&").replace(/&lt;/g,"<").replace(/&gt;/g,">")
          .replace(/&quot;/g,'"').replace(/&#39;/g,"'").replace(/&apos;/g,"'");
}
function escapeRegex(s: string) { return s.replace(/[.*+?^${}()|[\]\\]/g,"\\$&"); }
function inferSource(t: string) { const m = t.match(/[-–]\s*([^-–]+)$/); return m?m[1].trim():""; }

async function fetchRSS(url: string, category: "india" | "global"): Promise<NewsArticle[]> {
  const res = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0" }, next: { revalidate: 900 } });
  if (!res.ok) return [];
  return parseRSS(await res.text(), category);
}

async function fetchFromGoogleNews(): Promise<NewsResponse> {
  // 'when:1d' forces Google News to return only last 24h results
  const [india, global] = await Promise.all([
    fetchRSS("https://news.google.com/rss/search?q=sensex+nifty+india+market+when:1d&hl=en-IN&gl=IN&ceid=IN:en", "india"),
    fetchRSS("https://news.google.com/rss/search?q=oil+price+fed+rates+geopolitics+global+markets+when:1d&hl=en&gl=US&ceid=US:en", "global"),
  ]);
  return { articles: [...india, ...global] };
}

// ── NewsAPI (real thumbnails, used when key is set) ─────────────────────────
async function fetchFromNewsAPI(apiKey: string): Promise<NewsResponse> {
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const [indiaRes, globalRes] = await Promise.all([
    fetch(`https://newsapi.org/v2/everything?q=nifty+sensex+india+market&sortBy=publishedAt&pageSize=10&language=en&from=${since}`,
      { headers: { Authorization: `Bearer ${apiKey}` }, next: { revalidate: 900 } }),
    fetch(`https://newsapi.org/v2/everything?q=oil+price+fed+rates+geopolitics+global+markets&sortBy=publishedAt&pageSize=10&language=en&from=${since}`,
      { headers: { Authorization: `Bearer ${apiKey}` }, next: { revalidate: 900 } }),
  ]);

  const toArticles = async (res: Response, category: "india" | "global"): Promise<NewsArticle[]> => {
    if (!res.ok) return [];
    const data = await res.json();
    return (data.articles ?? [])
      .filter((a: any) => a.title && a.title !== "[Removed]")
      .slice(0, MAX_PER_CATEGORY)
      .map((a: any) => ({
        title: a.title, description: a.description ?? "", source: a.source?.name ?? "",
        publishedAt: a.publishedAt, url: a.url, imageUrl: a.urlToImage ?? undefined, category,
      }));
  };

  const [india, global] = await Promise.all([toArticles(indiaRes, "india"), toArticles(globalRes, "global")]);
  return { articles: [...india, ...global] };
}

export async function fetchNews(): Promise<NewsResponse> {
  const key = process.env.NEWS_API_KEY;
  if (key && key !== "your_newsapi_key_here") {
    try {
      const result = await fetchFromNewsAPI(key);
      if (result.articles.length > 0) return result;
    } catch {}
  }
  return fetchFromGoogleNews();
}
