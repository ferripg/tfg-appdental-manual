"use client";

import {
  Bar,
  BarChart,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const eur = (n: number) =>
  n.toLocaleString("ca-ES", { style: "currency", currency: "EUR" });

const COLORS = [
  "#0ea5e9",
  "#22c55e",
  "#f59e0b",
  "#ef4444",
  "#a855f7",
  "#14b8a6",
  "#ec4899",
  "#64748b",
];

export function DespesesPerMesChart({
  data,
}: {
  data: { mes: string; total: number }[];
}) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data}>
        <XAxis dataKey="mes" tickLine={false} axisLine={false} fontSize={12} />
        <YAxis
          tickFormatter={(v) => `${v} €`}
          tickLine={false}
          axisLine={false}
          fontSize={12}
          width={64}
        />
        <Tooltip formatter={(value) => eur(Number(value))} />
        <Bar dataKey="total" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function DespesesPerTipusChart({
  data,
}: {
  data: { nom: string; total: number }[];
}) {
  const dataAmbColor = data.map((d, i) => ({
    ...d,
    fill: COLORS[i % COLORS.length],
  }));

  return (
    <ResponsiveContainer width="100%" height={280}>
      <PieChart>
        <Pie
          data={dataAmbColor}
          dataKey="total"
          nameKey="nom"
          cx="50%"
          cy="50%"
          outerRadius={90}
        />
        <Tooltip formatter={(value) => eur(Number(value))} />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
}
