"use client";

import { NewsArticle } from "@/lib/types";
import { formatDistanceToNow, parseISO } from "date-fns";

const SOURCE_DOMAINS: Record<string, string> = {
  "the economic times": "economictimes.indiatimes.com",
  "economic times": "economictimes.indiatimes.com",
  "business standard": "business-standard.com",
  "the hindu": "thehindu.com",
  "hindustan times": "hindustantimes.com",
  "mint": "livemint.com",
  "livemint": "livemint.com",
  "ndtv": "ndtv.com",
  "ndtv profit": "ndtvprofit.com",
  "cnbc tv18": "cnbctv18.com",
  "moneycontrol": "moneycontrol.com",
  "the times of india": "timesofindia.indiatimes.com",
  "times of india": "timesofindia.indiatimes.com",
  "the indian express": "indianexpress.com",
  "indian express": "indianexpress.com",
  "financial express": "financialexpress.com",
  "business today": "businesstoday.in",
  "forbes india": "forbesindia.com",
  "theprint": "theprint.in",
  "the print": "theprint.in",
  "zee business": "zeebiz.com",
  "deccan chronicle": "deccanchronicle.com",
  "msn": "msn.com",
  "thehawk.in": "thehawk.in",
  "reuters": "reuters.com",
  "bloomberg": "bloomberg.com",
  "financial times": "ft.com",
  "the wall street journal": "wsj.com",
  "wall street journal": "wsj.com",
  "cnbc": "cnbc.com",
  "bbc": "bbc.com",
  "the guardian": "theguardian.com",
  "associated press": "apnews.com",
  "jakarta globe": "jakartaglobe.id",
  "kuwait times": "kuwaittimes.com",
};

const AVATAR_COLORS = [
  "bg-blue-100 text-blue-600",
  "bg-violet-100 text-violet-600",
  "bg-amber-100 text-amber-600",
  "bg-emerald-100 text-emerald-600",
  "bg-rose-100 text-rose-600",
  "bg-cyan-100 text-cyan-600",
  "bg-orange-100 text-orange-600",
  "bg-indigo-100 text-indigo-600",
];

function avatarColor(source: string) {
  let h = 0;
  for (let i = 0; i < source.length; i++) h = source.charCodeAt(i) + ((h << 5) - h);
  return AVATAR_COLORS[Math.abs(h) % AVATAR_COLORS.length];
}

function getFaviconDomain(article: NewsArticle): string {
  try {
    const host = new URL(article.url).hostname.replace(/^www\./, "");
    if (!host.includes("google.com")) return host;
  } catch {}
  return SOURCE_DOMAINS[article.source.toLowerCase()] ?? "";
}

function timeAgo(iso: string) {
  try { return formatDistanceToNow(parseISO(iso), { addSuffix: true }); }
  catch { return ""; }
}

function SourceBadge({ article }: { article: NewsArticle }) {
  const domain = getFaviconDomain(article);
  const initial = article.source.charAt(0).toUpperCase();
  const color = avatarColor(article.source);

  if (!domain) {
    return (
      <div className={`flex-none w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold shrink-0 ${color}`}>
        {initial}
      </div>
    );
  }

  return (
    <div className={`flex-none w-9 h-9 rounded-xl overflow-hidden shrink-0 flex items-center justify-center ${color}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={`https://www.google.com/s2/favicons?domain=${domain}&sz=64`}
        alt=""
        className="w-6 h-6 object-contain"
        onError={(e) => {
          // Favicon failed — swap to letter initial
          const parent = e.currentTarget.parentElement!;
          parent.innerHTML = `<span class="text-[11px] font-bold">${initial}</span>`;
        }}
      />
    </div>
  );
}

export default function NewsPanel({ articles }: { articles: NewsArticle[] }) {
  if (!articles.length) return null;

  return (
    <ul className="divide-y divide-zinc-100">
      {articles.map((a, i) => (
        <li key={i}>
          <a
            href={a.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-start gap-4 py-4 px-2 hover:bg-white rounded-xl transition-colors group cursor-pointer"
          >
            <SourceBadge article={a} />

            <div className="min-w-0 flex-1">
              <p className="text-base leading-snug text-zinc-700 group-hover:text-zinc-900 line-clamp-2 transition-colors font-medium">
                {a.title}
              </p>
              <p className="text-sm text-zinc-400 mt-1.5 flex items-center gap-2 flex-wrap">
                <span>{a.category === "india" ? "🇮🇳" : "🌍"}</span>
                <span className="font-medium text-zinc-500">{a.source}</span>
                {a.publishedAt && (
                  <><span className="text-zinc-300">·</span>
                  <span>{timeAgo(a.publishedAt)}</span></>
                )}
              </p>
            </div>
          </a>
        </li>
      ))}
    </ul>
  );
}
