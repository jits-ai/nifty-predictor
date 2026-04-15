"use client";

import { NewsArticle } from "@/lib/types";
import { formatDistanceToNow, parseISO } from "date-fns";

interface Props {
  articles: NewsArticle[];
}

function ArticleCard({ article }: { article: NewsArticle }) {
  return (
    <a
      href={article.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group block py-4 border-b border-zinc-100 last:border-0"
    >
      <div className="flex items-center gap-2 mb-1.5">
        <span className="text-[10px] font-semibold uppercase tracking-widest text-zinc-300">
          {article.source}
        </span>
        <span className="text-zinc-200">·</span>
        <span className="text-[10px] text-zinc-300">
          {formatDistanceToNow(parseISO(article.publishedAt), { addSuffix: true })}
        </span>
      </div>
      <p className="text-sm font-medium text-zinc-700 group-hover:text-zinc-900 leading-snug mb-1 transition-colors">
        {article.title}
      </p>
      {article.description && (
        <p className="text-xs text-zinc-400 leading-relaxed line-clamp-2">
          {article.description}
        </p>
      )}
    </a>
  );
}

export default function NewsSection({ articles }: Props) {
  const india = articles.filter((a) => a.category === "india");
  const global = articles.filter((a) => a.category === "global");

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-2">
      {/* India */}
      <div>
        <p className="text-xs font-semibold text-zinc-400 uppercase tracking-widest mb-2 flex items-center gap-2">
          <span>🇮🇳</span> India
        </p>
        {india.length > 0 ? (
          india.map((a, i) => <ArticleCard key={i} article={a} />)
        ) : (
          <p className="text-xs text-zinc-400 italic py-4">No India news found.</p>
        )}
      </div>

      {/* Global */}
      <div>
        <p className="text-xs font-semibold text-zinc-400 uppercase tracking-widest mb-2 flex items-center gap-2">
          <span>🌍</span> Global
        </p>
        {global.length > 0 ? (
          global.map((a, i) => <ArticleCard key={i} article={a} />)
        ) : (
          <p className="text-xs text-zinc-400 italic py-4">No global news found.</p>
        )}
      </div>
    </div>
  );
}
