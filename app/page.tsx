import { fetchNifty } from "@/lib/fetchNifty";
import { fetchNews } from "@/lib/fetchNews";
import { fetchPrediction } from "@/lib/fetchPrediction";
import { Prediction, NewsArticle } from "@/lib/types";
import NiftyChart from "@/components/NiftyChart";
import NewsPanel from "@/components/NewsPanel";
import { format, addDays } from "date-fns";

const THEME = {
  UP: {
    panelBg:    "bg-gradient-to-br from-emerald-400 via-green-500 to-teal-600",
    arrow:      "↑",
    arrowColor: "text-white/70",
    label:      "BULLISH",
    labelColor: "text-white",
    dateColor:  "text-white",
    subColor:   "text-emerald-100",
    mutedColor: "text-emerald-200/80",
    barTrack:   "bg-white/20",
    barFill:    "bg-white",
    dotColor:   "bg-white",
    riskDot:    "bg-yellow-300",
    divider:    "border-white/20",
    badge:      "bg-white/15 text-white",
    tagline:    "Markets are smiling. Bulls are in charge.",
  },
  DOWN: {
    panelBg:    "bg-gradient-to-br from-zinc-950 via-red-950 to-zinc-900",
    arrow:      "↓",
    arrowColor: "text-red-400",
    label:      "BEARISH",
    labelColor: "text-red-400",
    dateColor:  "text-zinc-100",
    subColor:   "text-zinc-300",
    mutedColor: "text-zinc-500",
    barTrack:   "bg-zinc-700",
    barFill:    "bg-red-500",
    dotColor:   "bg-red-500",
    riskDot:    "bg-orange-400",
    divider:    "border-zinc-700",
    badge:      "bg-red-900/50 text-red-300",
    tagline:    "Brace for impact. The bears are here.",
  },
  FLAT: {
    panelBg:    "bg-gradient-to-br from-slate-100 to-zinc-200",
    arrow:      "→",
    arrowColor: "text-zinc-400",
    label:      "NEUTRAL",
    labelColor: "text-zinc-600",
    dateColor:  "text-zinc-700",
    subColor:   "text-zinc-500",
    mutedColor: "text-zinc-400",
    barTrack:   "bg-zinc-300",
    barFill:    "bg-zinc-500",
    dotColor:   "bg-zinc-500",
    riskDot:    "bg-amber-400",
    divider:    "border-zinc-300",
    badge:      "bg-zinc-300 text-zinc-600",
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

  const todayLabel    = format(new Date(), "dd MMMM yyyy");
  const tomorrowLabel = format(addDays(new Date(), 1), "dd MMMM yyyy");
  const dayOfWeek     = format(new Date(), "EEEE");
  const tomorrowDay   = format(addDays(new Date(), 1), "EEEE");

  return (
    <main className="min-h-screen md:h-screen flex flex-col bg-white md:overflow-hidden">

      {/* ── Header ──────────────────────────────────────────────────────── */}
      <header className="flex-none flex items-center justify-between px-5 md:px-8 py-3 border-b border-zinc-100">
        <div className="flex items-center gap-2 md:gap-3">
          <span className="text-sm font-semibold text-zinc-900 tracking-tight">Nifty 50</span>
          <span className="text-zinc-200 hidden md:inline">·</span>
          <span className="text-xs text-zinc-400 hidden md:inline">Tomorrow&apos;s market outlook</span>
        </div>
        <p className="text-xs text-zinc-400">{dayOfWeek}, {todayLabel}</p>
      </header>

      {/* ── Body ────────────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col md:flex-row md:overflow-hidden">

        {/* ── Col 1: Today's market ────────────────────────────────────── */}
        <div className="md:w-[26%] flex-none flex flex-col px-5 md:px-6 py-5 border-b md:border-b-0 md:border-r border-zinc-100">

          {/* Prominent date */}
          <div className="mb-4">
            <p className="text-[10px] font-semibold text-zinc-300 uppercase tracking-widest">Today</p>
            <p className="text-2xl md:text-3xl font-bold text-zinc-900 leading-tight">{todayLabel}</p>
          </div>

          {nifty ? (
            <>
              <div className="flex items-start justify-between mb-4 flex-none">
                <div>
                  <p className="text-[11px] text-zinc-400 mb-0.5">Closing price</p>
                  <p className="text-4xl md:text-5xl font-extralight text-zinc-900 tracking-tight leading-none tabular-nums">
                    {nifty.current.close.toLocaleString("en-IN")}
                  </p>
                  <p className={`text-base mt-2 font-semibold ${isUp ? "text-emerald-600" : "text-red-500"}`}>
                    {isUp ? "+" : ""}{nifty.changePoints.toLocaleString("en-IN")} pts
                    <span className="font-normal text-sm ml-1.5 opacity-80">
                      ({isUp ? "+" : ""}{nifty.changePercent}%)
                    </span>
                  </p>
                  <div className="flex gap-4 mt-2 text-xs text-zinc-400">
                    <span><span className="text-zinc-300">H </span>{nifty.current.high.toLocaleString("en-IN")}</span>
                    <span><span className="text-zinc-300">L </span>{nifty.current.low.toLocaleString("en-IN")}</span>
                  </div>
                </div>
              </div>

              <div className="flex-none">
                <p className="text-[10px] text-zinc-300 mb-2 uppercase tracking-wider">3-month chart</p>
                <NiftyChart history={nifty.history} changePercent={nifty.changePercent} />
              </div>
            </>
          ) : (
            <p className="text-sm text-zinc-400 italic">Market data unavailable.</p>
          )}
        </div>

        {/* ── Col 2: Today's news ──────────────────────────────────────── */}
        <div className="md:w-[37%] flex-none flex flex-col px-5 md:px-6 py-5 border-b md:border-b-0 md:border-r border-zinc-100 md:overflow-hidden">
          <div className="flex-none mb-4">
            <p className="text-[10px] font-semibold text-zinc-300 uppercase tracking-widest">What Happened Today</p>
            <p className="text-xl md:text-2xl font-bold text-zinc-900 leading-tight">{todayLabel}</p>
            <p className="text-xs text-zinc-400 mt-1">News shaping tomorrow&apos;s market.</p>
          </div>

          <div className="md:flex-1 md:overflow-y-auto md:min-h-0">
            {allArticles.length > 0
              ? <NewsPanel articles={allArticles} />
              : <p className="text-sm text-zinc-400 italic py-4">No fresh news found for today.</p>
            }
          </div>
        </div>

        {/* ── Col 3: Prediction — DRAMATIC ────────────────────────────── */}
        <div className={`md:flex-1 flex flex-col px-5 md:px-7 py-6 md:overflow-y-auto ${t.panelBg}`}>
          {prediction ? (
            <>
              {/* Prominent tomorrow date */}
              <div className="mb-3">
                <p className={`text-[10px] font-semibold uppercase tracking-widest ${t.mutedColor}`}>Tomorrow</p>
                <p className={`text-2xl md:text-3xl font-bold leading-tight ${t.dateColor}`}>{tomorrowLabel}</p>
                <p className={`text-xs mt-0.5 italic ${t.mutedColor}`}>{tomorrowDay}</p>
              </div>

              {/* Big directional arrow */}
              <p className={`text-7xl md:text-8xl leading-none font-thin mb-1 ${t.arrowColor}`}>
                {t.arrow}
              </p>

              {/* Label + confidence */}
              <div className="flex items-end justify-between mb-1">
                <p className={`text-3xl md:text-4xl font-bold tracking-tight ${t.labelColor}`}>{t.label}</p>
                <div className="text-right">
                  <p className={`text-[10px] uppercase tracking-widest mb-0.5 ${t.mutedColor}`}>Prediction confidence</p>
                  <p className={`text-3xl md:text-4xl font-extralight tabular-nums ${t.labelColor}`}>
                    {prediction.confidence}<span className="text-xl">%</span>
                  </p>
                </div>
              </div>

              <p className={`text-sm mb-3 italic ${t.subColor}`}>{t.tagline}</p>

              {/* Confidence bar */}
              <div className={`w-full h-0.5 rounded-full mb-4 ${t.barTrack}`}>
                <div className={`h-full rounded-full ${t.barFill}`} style={{ width: `${prediction.confidence}%` }} />
              </div>

              {/* Target + summary */}
              <div className={`rounded-xl px-4 py-3 mb-4 ${t.badge}`}>
                <p className="text-[10px] uppercase tracking-widest mb-0.5 opacity-70">Target range</p>
                <p className="text-base font-semibold">{prediction.target}</p>
              </div>

              <p className={`text-sm leading-relaxed mb-5 font-medium ${t.subColor}`}>
                &ldquo;{prediction.summary}&rdquo;
              </p>

              {/* Why */}
              <div className={`border-t ${t.divider} pt-4 mb-4`}>
                <p className={`text-[10px] font-semibold uppercase tracking-widest mb-3 ${t.mutedColor}`}>Why</p>
                <ul className="space-y-2">
                  {prediction.reasons.map((r, i) => (
                    <li key={i} className={`flex items-start gap-2.5 text-xs leading-snug ${t.subColor}`}>
                      <span className={`mt-1.5 w-1 h-1 rounded-full flex-shrink-0 ${t.dotColor}`} />
                      {r}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Risks */}
              <div className={`border-t ${t.divider} pt-4`}>
                <p className={`text-[10px] font-semibold uppercase tracking-widest mb-3 ${t.mutedColor}`}>Watch out for</p>
                <ul className="space-y-2">
                  {prediction.risks.map((r, i) => (
                    <li key={i} className={`flex items-start gap-2.5 text-xs leading-snug ${t.subColor}`}>
                      <span className={`mt-1.5 w-1 h-1 rounded-full flex-shrink-0 ${t.riskDot}`} />
                      {r}
                    </li>
                  ))}
                </ul>
              </div>

              <p className={`text-[10px] mt-6 pt-4 border-t ${t.divider} ${t.mutedColor}`}>
                Powered by Groq · {format(new Date(prediction.generatedAt), "h:mm a")} · Not financial advice
              </p>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full min-h-[200px] text-center gap-3 opacity-50">
              <p className="text-5xl font-thin text-zinc-400">?</p>
              <p className="text-sm font-medium text-zinc-500">No prediction available</p>
              <p className="text-xs text-zinc-400">Add a <code className="bg-zinc-100 px-1 rounded">GROQ_API_KEY</code> to .env.local</p>
            </div>
          )}
        </div>

      </div>
    </main>
  );
}
