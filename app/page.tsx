import { fetchNifty } from "@/lib/fetchNifty";
import { fetchNews } from "@/lib/fetchNews";
import { fetchPrediction } from "@/lib/fetchPrediction";
import { Prediction, NewsArticle } from "@/lib/types";
import NiftyChart from "@/components/NiftyChart";
import NewsPanel from "@/components/NewsPanel";
import { format, addDays } from "date-fns";

// Softer, readable themes — no more eye-burning bright green
const THEME = {
  UP: {
    panelBg:    "bg-[#0a1f14]",          // deep forest green — readable, premium
    arrow:      "↑",
    arrowColor: "text-emerald-400",
    label:      "BULLISH",
    labelColor: "text-emerald-400",
    dateColor:  "text-white",
    subColor:   "text-zinc-300",
    mutedColor: "text-zinc-500",
    barTrack:   "bg-zinc-700",
    barFill:    "bg-emerald-500",
    dotColor:   "bg-emerald-400",
    riskDot:    "bg-amber-400",
    divider:    "border-zinc-700",
    badge:      "bg-emerald-900/60 text-emerald-300",
    tagline:    "Markets are smiling. Bulls are in charge.",
  },
  DOWN: {
    panelBg:    "bg-[#150a0a]",          // deep blood red-black
    arrow:      "↓",
    arrowColor: "text-red-400",
    label:      "BEARISH",
    labelColor: "text-red-400",
    dateColor:  "text-white",
    subColor:   "text-zinc-300",
    mutedColor: "text-zinc-500",
    barTrack:   "bg-zinc-700",
    barFill:    "bg-red-500",
    dotColor:   "bg-red-400",
    riskDot:    "bg-orange-400",
    divider:    "border-zinc-700",
    badge:      "bg-red-900/50 text-red-300",
    tagline:    "Brace for impact. The bears are here.",
  },
  FLAT: {
    panelBg:    "bg-[#111118]",          // near-black neutral
    arrow:      "→",
    arrowColor: "text-zinc-400",
    label:      "NEUTRAL",
    labelColor: "text-zinc-300",
    dateColor:  "text-white",
    subColor:   "text-zinc-400",
    mutedColor: "text-zinc-600",
    barTrack:   "bg-zinc-700",
    barFill:    "bg-zinc-500",
    dotColor:   "bg-zinc-400",
    riskDot:    "bg-amber-400",
    divider:    "border-zinc-700",
    badge:      "bg-zinc-800 text-zinc-300",
    tagline:    "Markets catching their breath. No strong conviction.",
  },
};

export default async function Home() {
  let nifty = null;
  let news = { articles: [] as NewsArticle[] };
  let prediction: Prediction | null = null;

  try { nifty = await fetchNifty(); } catch {}
  try { news = await fetchNews(); } catch {}
  if (nifty) { try { prediction = await fetchPrediction(nifty, news); } catch {} }

  const isUp = nifty && nifty.changePercent >= 0;
  const allArticles = [...news.articles]
    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
    .slice(0, 5);

  const dir = prediction?.direction ?? "FLAT";
  const t = THEME[dir];

  const todayFull    = format(new Date(), "EEEE, dd MMMM yyyy");
  const todayShort   = format(new Date(), "dd MMMM yyyy");
  const tomorrowFull = format(addDays(new Date(), 1), "EEEE, dd MMMM yyyy");
  const tomorrowShort = format(addDays(new Date(), 1), "dd MMMM yyyy");

  return (
    <main className="min-h-screen md:h-screen flex flex-col bg-white md:overflow-hidden">

      {/* ── Header ──────────────────────────────────────────────── */}
      <header className="flex-none flex items-center justify-between px-6 md:px-8 py-4 border-b border-zinc-100">
        <div className="flex items-center gap-3">
          <span className="text-base font-bold text-zinc-900 tracking-tight">Nifty 50 Predictor</span>
          <span className="hidden md:block text-xs text-zinc-400 bg-zinc-100 px-2 py-0.5 rounded-full">Beta</span>
        </div>
        <p className="text-sm text-zinc-500">{todayFull}</p>
      </header>

      {/* ── Three columns ────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col md:flex-row md:overflow-hidden">

        {/* ══ COL 1: Market ══════════════════════════════════════════ */}
        <div className="md:w-[28%] flex-none flex flex-col px-6 md:px-8 py-6 border-b md:border-b-0 md:border-r border-zinc-100 bg-white">

          {/* Date */}
          <div className="mb-5 flex-none">
            <p className="text-xs font-semibold text-zinc-400 uppercase tracking-widest mb-1">Today</p>
            <p className="text-2xl md:text-3xl font-bold text-zinc-900 leading-tight">{todayShort}</p>
          </div>

          {nifty ? (
            <>
              {/* Price + change */}
              <div className="flex-none mb-6">
                <p className="text-sm text-zinc-400 mb-1">Closing price</p>
                <p className="text-5xl md:text-6xl font-extralight text-zinc-900 tracking-tight leading-none tabular-nums">
                  {nifty.current.close.toLocaleString("en-IN")}
                </p>
                <p className={`text-xl mt-3 font-semibold ${isUp ? "text-emerald-600" : "text-red-500"}`}>
                  {isUp ? "+" : ""}{nifty.changePoints.toLocaleString("en-IN")} pts
                  <span className="text-base font-normal ml-2 opacity-75">
                    ({isUp ? "+" : ""}{nifty.changePercent}%)
                  </span>
                </p>
                <div className="flex gap-5 mt-3 text-sm text-zinc-500">
                  <span><span className="text-zinc-300 mr-1">High</span>{nifty.current.high.toLocaleString("en-IN")}</span>
                  <span><span className="text-zinc-300 mr-1">Low</span>{nifty.current.low.toLocaleString("en-IN")}</span>
                </div>
              </div>

              {/* Chart — fills remaining */}
              <div className="flex-1 min-h-0 flex flex-col">
                <p className="text-xs text-zinc-400 uppercase tracking-wider mb-3 flex-none">3-month performance</p>
                <div className="flex-1 min-h-0" style={{ minHeight: 200 }}>
                  <NiftyChart history={nifty.history} changePercent={nifty.changePercent} />
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <p className="text-base text-zinc-400">Market data unavailable.</p>
            </div>
          )}
        </div>

        {/* ══ COL 2: News ════════════════════════════════════════════ */}
        <div className="md:w-[35%] flex-none flex flex-col px-6 md:px-8 py-6 border-b md:border-b-0 md:border-r border-zinc-100 bg-zinc-50/60">

          {/* Header */}
          <div className="flex-none mb-5">
            <p className="text-xs font-semibold text-zinc-400 uppercase tracking-widest mb-1">What Happened Today</p>
            <p className="text-2xl md:text-3xl font-bold text-zinc-900 leading-tight">{todayShort}</p>
            <p className="text-sm text-zinc-500 mt-1">News shaping tomorrow&apos;s market.</p>
          </div>

          {/* Articles */}
          <div className="flex-1 overflow-y-auto min-h-0">
            {allArticles.length > 0
              ? <NewsPanel articles={allArticles} />
              : <p className="text-base text-zinc-400 italic py-6">No fresh news found for today.</p>
            }
          </div>
        </div>

        {/* ══ COL 3: Prediction ══════════════════════════════════════ */}
        <div className={`flex-1 flex flex-col px-6 md:px-8 py-6 overflow-y-auto ${t.panelBg}`}>
          {prediction ? (
            <>
              {/* Tomorrow date */}
              <div className="flex-none mb-4">
                <p className={`text-xs font-semibold uppercase tracking-widest mb-1 ${t.mutedColor}`}>Tomorrow&apos;s Prediction</p>
                <p className={`text-2xl md:text-3xl font-bold leading-tight ${t.dateColor}`}>{tomorrowShort}</p>
                <p className={`text-sm mt-0.5 ${t.mutedColor}`}>{tomorrowFull}</p>
              </div>

              {/* Arrow */}
              <p className={`text-[80px] md:text-[100px] leading-none font-thin mb-1 ${t.arrowColor}`}>
                {t.arrow}
              </p>

              {/* Direction + confidence */}
              <div className="flex items-end justify-between mb-2">
                <p className={`text-4xl md:text-5xl font-bold tracking-tight ${t.labelColor}`}>
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
              <div className={`w-full h-1 rounded-full mb-4 ${t.barTrack}`}>
                <div className={`h-full rounded-full ${t.barFill}`} style={{ width: `${prediction.confidence}%` }} />
              </div>

              {/* Tagline */}
              <p className={`text-base italic mb-4 ${t.subColor}`}>{t.tagline}</p>

              {/* Target */}
              <div className={`rounded-xl px-4 py-3 mb-5 ${t.badge}`}>
                <p className={`text-xs uppercase tracking-widest mb-1 ${t.mutedColor}`}>Target range tomorrow</p>
                <p className="text-lg font-semibold">{prediction.target}</p>
              </div>

              {/* Summary */}
              <p className={`text-base leading-relaxed mb-6 ${t.subColor}`}>
                &ldquo;{prediction.summary}&rdquo;
              </p>

              {/* Why */}
              <div className={`border-t ${t.divider} pt-5 mb-5`}>
                <p className={`text-xs font-semibold uppercase tracking-widest mb-4 ${t.mutedColor}`}>Why</p>
                <ul className="space-y-3">
                  {prediction.reasons.map((r, i) => (
                    <li key={i} className={`flex items-start gap-3 text-sm leading-snug ${t.subColor}`}>
                      <span className={`mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0 ${t.dotColor}`} />
                      {r}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Risks */}
              <div className={`border-t ${t.divider} pt-5`}>
                <p className={`text-xs font-semibold uppercase tracking-widest mb-4 ${t.mutedColor}`}>Watch out for</p>
                <ul className="space-y-3">
                  {prediction.risks.map((r, i) => (
                    <li key={i} className={`flex items-start gap-3 text-sm leading-snug ${t.subColor}`}>
                      <span className={`mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0 ${t.riskDot}`} />
                      {r}
                    </li>
                  ))}
                </ul>
              </div>

              <p className={`text-xs mt-8 pt-5 border-t ${t.divider} ${t.mutedColor}`}>
                Powered by Groq · Generated at {format(new Date(prediction.generatedAt), "h:mm a")} · Not financial advice
              </p>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full min-h-[300px] text-center gap-4">
              <p className="text-6xl font-thin text-zinc-600">?</p>
              <p className="text-lg font-medium text-zinc-400">No prediction available</p>
              <p className="text-sm text-zinc-600">Add a <code className="bg-zinc-800 px-2 py-0.5 rounded text-zinc-300">GROQ_API_KEY</code> to enable AI predictions.</p>
            </div>
          )}
        </div>

      </div>
    </main>
  );
}
