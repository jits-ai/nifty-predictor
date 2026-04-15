"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { NiftyDataPoint } from "@/lib/types";
import { format, parseISO } from "date-fns";

interface Props {
  history: NiftyDataPoint[];
  changePercent: number;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-zinc-100 rounded-xl px-4 py-3 shadow-sm text-sm">
        <p className="text-zinc-400 mb-1">
          {format(parseISO(label), "dd MMM yyyy")}
        </p>
        <p className="font-semibold text-zinc-900 text-base">
          {payload[0].value.toLocaleString("en-IN")}
        </p>
      </div>
    );
  }
  return null;
};

export default function NiftyChart({ history, changePercent }: Props) {
  const isPositive = changePercent >= 0;
  const color = isPositive ? "#16a34a" : "#dc2626";
  const gradientId = isPositive ? "greenGradient" : "redGradient";

  const chartData = history.slice(-60).map((d) => ({
    date: d.date,
    value: d.close,
  }));

  const minVal = Math.min(...chartData.map((d) => d.value));
  const maxVal = Math.max(...chartData.map((d) => d.value));
  const padding = (maxVal - minVal) * 0.15;

  const formatTick = (dateStr: string) => {
    return format(parseISO(dateStr), "MMM");
  };

  // Only show ~4 x-axis labels
  const tickInterval = Math.floor(chartData.length / 4);

  return (
    <ResponsiveContainer width="100%" height="100%" minHeight={180}>
      <AreaChart data={chartData} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={color} stopOpacity={0.12} />
            <stop offset="95%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <XAxis
          dataKey="date"
          tickFormatter={formatTick}
          interval={tickInterval}
          axisLine={false}
          tickLine={false}
          tick={{ fill: "#a1a1aa", fontSize: 12 }}
        />
        <YAxis
          domain={[minVal - padding, maxVal + padding]}
          axisLine={false}
          tickLine={false}
          tick={{ fill: "#a1a1aa", fontSize: 12 }}
          tickFormatter={(v) => v.toLocaleString("en-IN")}
          width={72}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ stroke: "#e4e4e7", strokeWidth: 1 }} />
        <Area
          type="monotone"
          dataKey="value"
          stroke={color}
          strokeWidth={2}
          fill={`url(#${gradientId})`}
          dot={false}
          activeDot={{ r: 4, fill: color, strokeWidth: 0 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
