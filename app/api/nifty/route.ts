import { NextResponse } from "next/server";
import { NiftyDataPoint, NiftyResponse } from "@/lib/types";

export async function GET() {
  try {
    const url =
      "https://query1.finance.yahoo.com/v8/finance/chart/%5ENSEI?interval=1d&range=3mo";

    const res = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
      },
      next: { revalidate: 900 }, // cache 15 min
    });

    if (!res.ok) {
      throw new Error(`Yahoo Finance responded with ${res.status}`);
    }

    const data = await res.json();
    const result = data.chart.result[0];
    const timestamps: number[] = result.timestamp;
    const quotes = result.indicators.quote[0];

    const history: NiftyDataPoint[] = timestamps
      .map((ts: number, i: number) => ({
        date: new Date(ts * 1000).toISOString().split("T")[0],
        close: Math.round(quotes.close[i] ?? 0),
        open: Math.round(quotes.open[i] ?? 0),
        high: Math.round(quotes.high[i] ?? 0),
        low: Math.round(quotes.low[i] ?? 0),
        volume: quotes.volume[i] ?? 0,
      }))
      .filter((d: NiftyDataPoint) => d.close > 0);

    const current = history[history.length - 1];
    const prev = history[history.length - 2];
    const changePoints = current.close - prev.close;
    const changePercent = (changePoints / prev.close) * 100;

    const response: NiftyResponse = {
      current,
      history,
      changePercent: Math.round(changePercent * 100) / 100,
      changePoints: Math.round(changePoints),
    };

    return NextResponse.json(response);
  } catch (err) {
    console.error("Nifty fetch error:", err);
    return NextResponse.json(
      { error: "Failed to fetch Nifty 50 data" },
      { status: 500 }
    );
  }
}
