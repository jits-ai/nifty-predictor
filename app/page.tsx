import { fetchNifty } from "@/lib/fetchNifty";
import { fetchNews } from "@/lib/fetchNews";
import { fetchPrediction } from "@/lib/fetchPrediction";
import { Prediction, NewsArticle } from "@/lib/types";
import NiftyChart from "@/components/NiftyChart";
import { format, addDays, parseISO } from "date-fns";
import { formatDistanceToNow } from "date-fns";

const THEME = {
  UP: {
    panelBg: "bg-[#0a1f14]",
    arrow: "↑", arrowColor: "text-emerald-400",
    label: "BULLISH", labelColor: "text-emerald-400",
    dateColor: "text-white", subColor: "text-zinc-300",
    mutedColor: "text-zinc-500",
    barTrack: "bg-zinc-700", barFill: "bg-emerald-500",
    dotColor: "bg-emerald-400", riskDot: "bg-amber-400",
    divider: "border-zinc-800",
    badge: "bg-emerald-900/60 text-emerald-300 border border-emerald-800",
    tagline: "Markets are smiling. Bulls are in charge.",
  },
  DOWN: {
    panelBg: "bg-[#150a0a]",
    arrow: "↓", arrowColor: "text-red-400",
    label: "BEARISH", labelColor: "text-red-400",
    dateColor: "text-white", subColor: "text-zinc-300",
    mutedColor: "text-zinc-500",
    barTrack: "bg-zinc-700", barFill: "bg-red-500",
    dotColor: "bg-red-400", riskDot: "bg-orange-400",
    divider: "border-zinc-800",
    badge: "bg-red-900/50 text-red-300 border border-red-900",
    tagline: "Brace for impact. The bears are here.",
  },
  FLAT: {
    panelBg: "bg-[#0f0f14]",
    arrow: "→", arrowColor: "text-zinc-400",
    label: "NEUTRAL", labelColor: "text-zinc-300",
    dateColor: "text-white", subColor: "text-zinc-400",
    mutedColor: "text-zinc-600",
    barTrack: "bg-zinc-700", barFill: "bg-zinc-500",
    dotColor: "bg-zinc-400", riskDot: "bg-amber-400",
    divider: "border-zinc-800",
    badge: "bg-zinc-800 text-zinc-300 border border-zinc-700",
    tagline: "Markets catching their breath. No strong conviction.",
  },
};

// Flag emoji helper for news source country hints
function getFlag(article: NewsArticle): string {
  if (article.category === "india") return "🇮🇳";
  return "🌐";
}

export default async function Home() {
  let nifty = null;
  let news = { articles: [] as NewsArticle[] };
  let prediction: Prediction | null = null;

  try { nifty = await fetchNifty(); } catch {}
  try { news = await fetchNews(); } catch {}
  if (nifty) { try { prediction = await fetchPrediction(nifty, news); } catch {} }

  const isUp = nifty && nifty.changePercent >= 0;

  // Merge india + global, sort by date desc, take top 3
  const topArticles = [...news.articles]
    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
    .slice(0, 3);

  const dir = prediction?.direction ?? "FLAT";
  const t = THEME[dir];

  const todayDate    = format(new Date(), "dd MMMM yyyy");
  const todayFull    = format(new Date(), "EEEE, dd MMMM yyyy");
  const tomorrowDate = format(addDays(new Date(), 1), "dd MMMM yyyy");
  const tomorrowDay  = format(addDays(new Date(), 1), "EEEE");

  return (
    <main className="min-h-screen md:h-screen flex flex-col bg-white md:overflow-hidden">

      {/* ── Header ──────────────────────────────────────────────────── */}
      <header className="flex-none flex items-center justify-between px-6 py-3 border-b border-zinc-100 bg-white z-10">
        <div className="flex items-center gap-2">
          <span className="text-base font-bold text-zinc-900 tracking-tight">Nifty 50 Predictor</span>
          <span className="text-xs text-zinc-500 bg-zinc-100 px-2 py-0.5 rounded-full font-medium">Beta</span>
        </div>
        <p className="text-sm text-zinc-500">{todayFull}</p>
      </header>

      {/* ── Body: 50/50 split ───────────────────────────────────────── */}
      <div className="flex-1 flex flex-col md:flex-row md:overflow-hidden">

        {/* ══ LEFT: Prediction panel (dark) ═══════════════════════════ */}
        <div className={`w-full md:w-1/2 flex flex-col px-8 py-8 overflow-y-auto ${t.panelBg}`}>
          {prediction ? (
            <>
              {/* TOMORROW label + date */}
              <div className="flex-none mb-6">
                <p className={`text-xs uppercase tracking-widest mb-2 ${t.mutedColor}`}>Tomorrow</p>
                <p className={`text-4xl font-bold leading-tight ${t.dateColor}`}>{tomorrowDate}</p>
                <p className={`text-base mt-1 ${t.mutedColor}`}>{tomorrowDay}</p>
              </div>

              {/* Big arrow */}
              <p className={`text-[120px] leading-none font-thin mb-2 ${t.arrowColor}`}>
                {t.arrow}
              </p>

              {/* Direction label + confidence side by side */}
              <div className="flex items-end justify-between mb-3">
                <p className={`text-5xl font-extrabold tracking-tight ${t.labelColor}`}>
                  {t.label}
                </p>
                <div className="text-right">
                  <p className={`text-xs uppercase tracking-widest mb-1 ${t.mutedColor}`}>Prediction confidence</p>
                  <p className={`text-4xl font-light tabular-nums ${t.labelColor}`}>
                    {prediction.confidence}<span className="text-2xl">%</span>
                  </p>
                </div>
              </div>

              {/* Confidence bar */}
              <div className={`w-full h-1 rounded-full mb-5 ${t.barTrack}`}>
                <div className={`h-full rounded-full ${t.barFill}`} style={{ width: `${prediction.confidence}%` }} />
              </div>

              {/* Tagline */}
              <p className={`text-base italic mb-6 ${t.subColor}`}>{t.tagline}</p>

              {/* Target range badge */}
              <div className={`inline-flex self-start rounded-full px-4 py-2 mb-6 text-base font-semibold ${t.badge}`}>
                Target: {prediction.target}
              </div>

              {/* Summary quote */}
              <p className={`text-lg leading-relaxed mb-8 ${t.subColor}`}>
                &ldquo;{prediction.summary}&rdquo;
              </p>

              {/* WHY section */}
              <div className={`border-t ${t.divider} pt-6 mb-6`}>
                <p className={`text-xs font-semibold uppercase tracking-widest mb-4 ${t.mutedColor}`}>Why</p>
                <ul className="space-y-3">
                  {prediction.reasons.map((r, i) => (
                    <li key={i} className={`flex items-start gap-3 text-base leading-snug ${t.subColor}`}>
                      <span className={`mt-2 w-1.5 h-1.5 rounded-full flex-shrink-0 ${t.dotColor}`} />
                      {r}
                    </li>
                  ))}
                </ul>
              </div>

              {/* WATCH OUT FOR section */}
              <div className={`border-t ${t.divider} pt-6`}>
                <p className={`text-xs font-semibold uppercase tracking-widest mb-4 ${t.mutedColor}`}>Watch Out For</p>
                <ul className="space-y-3">
                  {prediction.risks.map((r, i) => (
                    <li key={i} className={`flex items-start gap-3 text-base leading-snug ${t.subColor}`}>
                      <span className={`mt-2 w-1.5 h-1.5 rounded-full flex-shrink-0 ${t.riskDot}`} />
                      {r}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Footer */}
              <p className={`text-xs mt-10 pt-5 border-t ${t.divider} ${t.mutedColor}`}>
                Powered by Groq · generated at {format(new Date(prediction.generatedAt), "h:mm a")} · Not financial advice
              </p>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-center gap-4">
              <p className="text-6xl font-thin text-zinc-600">?</p>
              <p className="text-lg font-medium text-zinc-400">No prediction available</p>
              <p className="text-base text-zinc-600">
                Add a <code className="bg-zinc-800 px-2 py-0.5 rounded text-zinc-300">GROQ_API_KEY</code> to enable AI predictions.
              </p>
            </div>
          )}
        </div>

        {/* ══ RIGHT: Today's market data + chart + news ════════════════ */}
        <div className="w-full md:w-1/2 flex flex-col px-8 py-8 overflow-y-auto bg-white border-t md:border-t-0 md:border-l border-zinc-100">

          {/* TODAY label + date */}
          <div className="flex-none mb-6">
            <p className="text-xs uppercase tracking-widest text-zinc-400 mb-2">Today</p>
            <p className="text-4xl font-bold text-zinc-900 leading-tight">{todayDate}</p>
          </div>

          {nifty ? (
            <>
              {/* Nifty close price */}
              <div className="flex-none mb-6">
                <p className="text-6xl font-extralight text-zinc-900 tracking-tight leading-none tabular-nums">
                  {nifty.current.close.toLocaleString("en-IN")}
                </p>
                <p className={`text-xl mt-3 font-semibold ${isUp ? "text-emerald-600" : "text-red-500"}`}>
                  {isUp ? "+" : ""}{nifty.changePoints.toLocaleString("en-IN")} pts
                  <span className="text-base font-normal ml-2 opacity-75">
                    ({isUp ? "+" : ""}{nifty.changePercent}%)
                  </span>
                </p>
                <div className="flex gap-5 mt-2 text-sm text-zinc-400">
                  <span>High <span className="text-zinc-600 font-medium">{nifty.current.high.toLocaleString("en-IN")}</span></span>
                  <span>Low <span className="text-zinc-600 font-medium">{nifty.current.low.toLocaleString("en-IN")}</span></span>
                </div>
              </div>

              {/* Divider */}
              <hr className="border-zinc-100 mb-5" />

              {/* Chart */}
              <div className="flex-none mb-6">
                <p className="text-xs uppercase tracking-widest text-zinc-400 mb-3">3-month performance</p>
                <NiftyChart history={nifty.history} changePercent={nifty.changePercent} />
              </div>
            </>
          ) : (
            <div className="flex-none mb-6">
              <p className="text-base text-zinc-400">Market data unavailable.</p>
            </div>
          )}

          {/* Divider */}
          <hr className="border-zinc-100 mb-5" />

          {/* TODAY'S SIGNALS — top 3 news inline */}
          <div className="flex-1">
            <p className="text-xs uppercase tracking-widest text-zinc-400 mb-4">Today&apos;s Signals</p>

            {topArticles.length > 0 ? (
              <ul className="space-y-5">
                {topArticles.map((article, i) => (
                  <li key={i}>
                    <a
                      href={article.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group block"
                    >
                      <p className="text-base font-medium text-zinc-700 group-hover:text-zinc-900 line-clamp-2 leading-snug mb-1">
                        {getFlag(article)} {article.title}
                      </p>
                      <p className="text-sm text-zinc-400">
                        {article.source}
                        <span className="mx-1.5 text-zinc-300">·</span>
                        {formatDistanceToNow(parseISO(article.publishedAt), { addSuffix: true })}
                      </p>
                    </a>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-base text-zinc-400 italic">No signals found for today.</p>
            )}
          </div>

          {/* Footer disclaimer */}
          <p className="text-xs text-zinc-300 mt-8 pt-5 border-t border-zinc-100">
            Market data is indicative only. Not financial advice.
          </p>
        </div>

      </div>
    </main>
  );
}
