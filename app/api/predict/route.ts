import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { Prediction, NiftyResponse, NewsArticle } from "@/lib/types";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const { nifty, news }: { nifty: NiftyResponse; news: NewsArticle[] } =
      await req.json();

    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json(
        { error: "ANTHROPIC_API_KEY not configured" },
        { status: 500 }
      );
    }

    const recentHistory = nifty.history.slice(-10);
    const historyText = recentHistory
      .map((d) => `${d.date}: Close ${d.close}, Change from prev day`)
      .join("\n");

    const newsText = news
      .map(
        (a) =>
          `[${a.category.toUpperCase()}] ${a.source}: ${a.title}\n${a.description}`
      )
      .join("\n\n");

    const prompt = `You are a financial analyst specializing in Indian equity markets. Analyze the following data and predict what Nifty 50 will do TOMORROW.

## Nifty 50 Recent Performance (last 10 days)
${historyText}

Today's Close: ${nifty.current.close}
Today's Change: ${nifty.changePoints > 0 ? "+" : ""}${nifty.changePoints} points (${nifty.changePercent > 0 ? "+" : ""}${nifty.changePercent}%)
Today's Range: ${nifty.current.low} - ${nifty.current.high}

## Today's Key News
${newsText || "No news available"}

## Your Task
Based on the market data and news, predict tomorrow's Nifty 50 movement.

Respond ONLY with a valid JSON object in this exact format:
{
  "direction": "UP" | "DOWN" | "FLAT",
  "confidence": <number 1-100>,
  "target": "<predicted range e.g. '24,200 - 24,400'>",
  "summary": "<one punchy sentence prediction>",
  "reasons": ["<reason 1>", "<reason 2>", "<reason 3>"],
  "risks": ["<risk 1>", "<risk 2>"]
}

Be honest about uncertainty. FLAT means within ±0.3%. Confidence above 75 should be rare.`;

    const message = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 600,
      messages: [{ role: "user", content: prompt }],
    });

    const text =
      message.content[0].type === "text" ? message.content[0].text : "";
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("No JSON in Claude response");

    const parsed = JSON.parse(jsonMatch[0]);
    const prediction: Prediction = {
      ...parsed,
      generatedAt: new Date().toISOString(),
    };

    return NextResponse.json(prediction);
  } catch (err) {
    console.error("Prediction error:", err);
    return NextResponse.json(
      { error: "Failed to generate prediction" },
      { status: 500 }
    );
  }
}
