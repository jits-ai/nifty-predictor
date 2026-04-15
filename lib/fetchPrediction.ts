import { NiftyResponse, NewsResponse, Prediction } from "./types";

function buildPrompt(nifty: NiftyResponse, news: NewsResponse): string {
  const history = nifty.history
    .slice(-7)
    .map((d) => `${d.date}: ${d.close}`)
    .join(", ");

  const headlines = news.articles
    .map((a) => `[${a.category === "india" ? "IN" : "GL"}] ${a.title}`)
    .join("\n");

  return `You are a financial analyst. Predict what Nifty 50 will do TOMORROW based on this data.

Nifty 50 last 7 days: ${history}
Today close: ${nifty.current.close}, change: ${nifty.changePoints > 0 ? "+" : ""}${nifty.changePoints} pts (${nifty.changePercent}%)

Today's news:
${headlines}

Reply ONLY with a JSON object, no other text:
{"direction":"UP"|"DOWN"|"FLAT","confidence":<1-100>,"target":"<range like 24200-24400>","summary":"<one sentence>","reasons":["<r1>","<r2>","<r3>"],"risks":["<risk1>","<risk2>"]}`;
}

function parseJson(text: string): Prediction | null {
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) return null;
  return { ...JSON.parse(match[0]), generatedAt: new Date().toISOString() };
}

// Groq — free tier, works on Vercel, uses Llama 3 under the hood
async function fromGroq(prompt: string): Promise<Prediction | null> {
  const key = process.env.GROQ_API_KEY;
  if (!key) return null;

  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify({
      model: "llama-3.1-8b-instant",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.3,
    }),
  });

  if (!res.ok) return null;
  const data = await res.json();
  return parseJson(data.choices?.[0]?.message?.content ?? "");
}

// Ollama — local dev only, no key needed
async function fromOllama(prompt: string): Promise<Prediction | null> {
  const base = process.env.OLLAMA_BASE_URL || "http://localhost:11434";
  const model = process.env.OLLAMA_MODEL || "llama3.2";

  const res = await fetch(`${base}/v1/chat/completions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model,
      messages: [{ role: "user", content: prompt }],
      temperature: 0.3,
      stream: false,
    }),
    signal: AbortSignal.timeout(30000),
  });

  if (!res.ok) return null;
  const data = await res.json();
  return parseJson(data.choices?.[0]?.message?.content ?? "");
}

// Anthropic — for when IT approves it
async function fromAnthropic(prompt: string): Promise<Prediction | null> {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) return null;

  const { default: Anthropic } = await import("@anthropic-ai/sdk");
  const client = new Anthropic({ apiKey: key });
  const message = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 600,
    messages: [{ role: "user", content: prompt }],
  });
  const text = message.content[0].type === "text" ? message.content[0].text : "";
  return parseJson(text);
}

export async function fetchPrediction(
  nifty: NiftyResponse,
  news: NewsResponse
): Promise<Prediction | null> {
  const prompt = buildPrompt(nifty, news);
  // Priority: Groq (free, hosted) → Ollama (local) → Anthropic (IT-approved)
  try { const p = await fromGroq(prompt);     if (p) return p; } catch {}
  try { const p = await fromOllama(prompt);   if (p) return p; } catch {}
  try { const p = await fromAnthropic(prompt); if (p) return p; } catch {}
  return null;
}
