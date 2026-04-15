export interface NiftyDataPoint {
  date: string;
  close: number;
  open: number;
  high: number;
  low: number;
  volume: number;
}

export interface NiftyResponse {
  current: NiftyDataPoint;
  history: NiftyDataPoint[];
  changePercent: number;
  changePoints: number;
}

export interface NewsArticle {
  title: string;
  description: string;
  source: string;
  publishedAt: string;
  url: string;
  imageUrl?: string;
  category: "india" | "global";
}

export interface NewsResponse {
  articles: NewsArticle[];
}

export interface Prediction {
  direction: "UP" | "DOWN" | "FLAT";
  confidence: number;
  target: string;
  summary: string;
  reasons: string[];
  risks: string[];
  generatedAt: string;
}
