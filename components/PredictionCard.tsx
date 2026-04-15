"use client";

import { Prediction } from "@/lib/types";
import { format, parseISO } from "date-fns";

interface Props {
  prediction: Prediction;
}

const directionConfig = {
  UP: {
    label: "Bullish",
    icon: "↑",
    bg: "bg-green-50",
    border: "border-green-100",
    text: "text-green-700",
    badge: "bg-green-100 text-green-800",
    bar: "bg-green-500",
  },
  DOWN: {
    label: "Bearish",
    icon: "↓",
    bg: "bg-red-50",
    border: "border-red-100",
    text: "text-red-700",
    badge: "bg-red-100 text-red-800",
    bar: "bg-red-500",
  },
  FLAT: {
    label: "Neutral",
    icon: "→",
    bg: "bg-zinc-50",
    border: "border-zinc-100",
    text: "text-zinc-600",
    badge: "bg-zinc-100 text-zinc-700",
    bar: "bg-zinc-400",
  },
};

export default function PredictionCard({ prediction }: Props) {
  const cfg = directionConfig[prediction.direction];

  return (
    <div className={`rounded-2xl border ${cfg.border} ${cfg.bg} p-8`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <p className="text-xs font-medium text-zinc-400 uppercase tracking-widest mb-2">
            Tomorrow's Prediction
          </p>
          <div className="flex items-center gap-3">
            <span className={`text-5xl font-light ${cfg.text}`}>
              {cfg.icon}
            </span>
            <div>
              <h2 className={`text-3xl font-semibold ${cfg.text}`}>
                {cfg.label}
              </h2>
              <p className="text-sm text-zinc-500 mt-0.5">{prediction.target}</p>
            </div>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs text-zinc-400 mb-1">Confidence</p>
          <p className={`text-4xl font-light ${cfg.text}`}>
            {prediction.confidence}
            <span className="text-xl">%</span>
          </p>
        </div>
      </div>

      {/* Confidence bar */}
      <div className="w-full h-1 bg-zinc-200 rounded-full mb-6">
        <div
          className={`h-full rounded-full ${cfg.bar} transition-all duration-700`}
          style={{ width: `${prediction.confidence}%` }}
        />
      </div>

      {/* Summary */}
      <p className="text-zinc-700 text-base leading-relaxed mb-6 font-medium">
        {prediction.summary}
      </p>

      {/* Reasons */}
      <div className="mb-5">
        <p className="text-xs font-medium text-zinc-400 uppercase tracking-widest mb-3">
          Key Drivers
        </p>
        <ul className="space-y-2">
          {prediction.reasons.map((r, i) => (
            <li key={i} className="flex items-start gap-2.5 text-sm text-zinc-600">
              <span className={`mt-1 w-1.5 h-1.5 rounded-full flex-shrink-0 ${cfg.bar}`} />
              {r}
            </li>
          ))}
        </ul>
      </div>

      {/* Risks */}
      <div>
        <p className="text-xs font-medium text-zinc-400 uppercase tracking-widest mb-3">
          Watch Out For
        </p>
        <ul className="space-y-2">
          {prediction.risks.map((r, i) => (
            <li key={i} className="flex items-start gap-2.5 text-sm text-zinc-500">
              <span className="mt-1 w-1.5 h-1.5 rounded-full flex-shrink-0 bg-amber-400" />
              {r}
            </li>
          ))}
        </ul>
      </div>

      {/* Footer */}
      <p className="text-xs text-zinc-300 mt-6 pt-6 border-t border-zinc-200">
        Generated {format(parseISO(prediction.generatedAt), "dd MMM yyyy, h:mm a")} · Powered by Claude
      </p>
    </div>
  );
}
