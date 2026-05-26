"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import Link from "next/link";
import { PlayersData, Player } from "@/types/player";
import { loadPlayersData, sortedCategories, getCategoryColor } from "@/lib/data";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, LabelList,
} from "recharts";

function calcAvg(players: Player[]): { yoyo: number; cmj: number; n: number } {
  const withYoyo = players
    .map((p) => p.tests.find((t) => t.yoyo?.meters)?.yoyo.meters)
    .filter((v): v is number => v != null && v > 0);
  const withCmj = players
    .map((p) => p.tests.find((t) => t.cmj?.height)?.cmj.height)
    .filter((v): v is number => v != null && v > 0);

  return {
    yoyo: withYoyo.length > 0 ? Math.round(withYoyo.reduce((a, b) => a + b, 0) / withYoyo.length) : 0,
    cmj: withCmj.length > 0 ? parseFloat((withCmj.reduce((a, b) => a + b, 0) / withCmj.length).toFixed(1)) : 0,
    n: withYoyo.length,
  };
}

interface AvgCardProps {
  label: string;
  yoyo: number;
  cmj: number;
  n: number;
  color: string;
  accent: string;
}

function AvgCard({ label, yoyo, cmj, n, color, accent }: AvgCardProps) {
  return (
    <div className={`rounded-2xl p-4 ${color}`}>
      <p className={`text-[11px] font-semibold uppercase tracking-wider ${accent}`}>{label}</p>
      <div className="flex items-end gap-3 mt-1.5">
        <div>
          <p className="text-2xl font-bold text-slate-900">
            {yoyo > 0 ? yoyo : "-"}<span className="text-sm font-normal text-slate-500 ml-0.5">{yoyo > 0 ? "m" : ""}</span>
          </p>
          <p className="text-[10px] text-slate-400">Yo-Yo prom.</p>
        </div>
        {cmj > 0 && (
          <div>
            <p className="text-lg font-bold text-slate-700">
              {cmj}<span className="text-xs font-normal text-slate-400 ml-0.5">cm</span>
            </p>
            <p className="text-[10px] text-slate-400">CMJ prom.</p>
          </div>
        )}
      </div>
      <p className="text-[10px] text-slate-400 mt-1">{n} jugadoras testeadas</p>
    </div>
  );
}

type ChartView = "division" | "sub" | "equipos";

const EQUIPO_COLORS: Record<string, string> = {
  "5ta A": "#1d4ed8", "5ta B": "#3b82f6", "5ta C": "#60a5fa", "5ta D": "#93c5fd",
  "6ta A": "#047857", "6ta B": "#10b981", "6ta C": "#34d399", "6ta D": "#6ee7b7",
  "7ma A": "#7c3aed", "7ma B": "#8b5cf6", "7ma C": "#a78bfa", "7ma D": "#c4b5fd",
};

export default function Dashboard() {
  const [data, setData] = useState<PlayersData | null>(null);
  const [chartView, setChartView] = useState<ChartView>("division");

  useEffect(() => {
    loadPlayersData().then(setData);
  }, []);

  const stats = useMemo(() => {
    if (!data) return null;

    const allPlayers = data.players;
    const total = calcAvg(allPlayers);

    const byDivision: Record<string, ReturnType<typeof calcAvg>> = {};
    ["5ta", "6ta", "7ma"].forEach((div) => {
      byDivision[div] = calcAvg(allPlayers.filter((p) => p.division === div));
    });

    const bySub: Record<string, ReturnType<typeof calcAvg>> = {};
    ["A", "B", "C", "D"].forEach((sub) => {
      bySub[sub] = calcAvg(allPlayers.filter((p) => p.sub === sub));
    });

    const byCategory: Record<string, ReturnType<typeof calcAvg>> = {};
    const categories = sortedCategories(data.categories);
    categories.forEach((cat) => {
      byCategory[cat] = calcAvg(allPlayers.filter((p) => p.category === cat));
    });

    return { total, byDivision, bySub, byCategory, categories };
  }, [data]);

  if (!data || !stats) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="px-4 pt-6 pb-4">
      {/* Header */}
      <div className="flex items-center gap-3 mb-5">
        <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold text-sm">
          MG
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-900">FiscoMGRC</h1>
          <p className="text-xs text-slate-400">Temporada 2026</p>
        </div>
      </div>

      {/* ===== GRAFICO PROMEDIOS CON TOGGLE ===== */}
      {(() => {
        const divisionData = [
          { name: "5ta", yoyo: stats.byDivision["5ta"].yoyo, cmj: stats.byDivision["5ta"].cmj, n: stats.byDivision["5ta"].n, fill: "#2563eb" },
          { name: "6ta", yoyo: stats.byDivision["6ta"].yoyo, cmj: stats.byDivision["6ta"].cmj, n: stats.byDivision["6ta"].n, fill: "#10b981" },
          { name: "7ma", yoyo: stats.byDivision["7ma"].yoyo, cmj: stats.byDivision["7ma"].cmj, n: stats.byDivision["7ma"].n, fill: "#8b5cf6" },
        ];
        const subData = [
          { name: "Todas A", yoyo: stats.bySub["A"].yoyo, cmj: stats.bySub["A"].cmj, n: stats.bySub["A"].n, fill: "#2563eb" },
          { name: "Todas B", yoyo: stats.bySub["B"].yoyo, cmj: stats.bySub["B"].cmj, n: stats.bySub["B"].n, fill: "#10b981" },
          { name: "Todas C", yoyo: stats.bySub["C"].yoyo, cmj: stats.bySub["C"].cmj, n: stats.bySub["C"].n, fill: "#f59e0b" },
          { name: "Todas D", yoyo: stats.bySub["D"].yoyo, cmj: stats.bySub["D"].cmj, n: stats.bySub["D"].n, fill: "#8b5cf6" },
        ];
        const equipoOrder = ["5ta A","5ta B","5ta C","5ta D","6ta A","6ta B","6ta C","6ta D","7ma A","7ma B","7ma C","7ma D"];
        const equiposData = equipoOrder
          .filter((cat) => stats.byCategory[cat])
          .map((cat) => ({
            name: cat.replace("ta ", "").replace("ma ", ""),
            fullName: cat,
            yoyo: stats.byCategory[cat].yoyo,
            cmj: stats.byCategory[cat].cmj,
            n: stats.byCategory[cat].n,
            fill: EQUIPO_COLORS[cat] || "#94a3b8",
          }));
        const chartData = chartView === "division" ? divisionData : chartView === "sub" ? subData : equiposData;

        return (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-bold text-slate-800">Promedio Yo-Yo (metros)</p>
              <button
                onClick={() => setChartView(chartView === "division" ? "sub" : chartView === "sub" ? "equipos" : "division")}
                className="px-3 py-1.5 bg-slate-100 rounded-full text-[11px] font-semibold text-slate-600 active:bg-slate-200 transition-colors"
              >
                {chartView === "division" ? "Ver A/B/C/D" : chartView === "sub" ? "Ver equipos" : "Ver divisiones"}
              </button>
            </div>
            <ResponsiveContainer width="100%" height={chartView === "equipos" ? 250 : 210}>
              <BarChart data={chartData} barSize={chartView === "equipos" ? 18 : chartView === "division" ? 36 : 30}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: chartView === "equipos" ? 9 : 11, fontWeight: 600 }} axisLine={false} tickLine={false} angle={chartView === "equipos" ? -35 : 0} textAnchor={chartView === "equipos" ? "end" : "middle"} height={chartView === "equipos" ? 40 : 20} />
                <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} width={35} />
                <Tooltip
                  contentStyle={{ fontSize: 12, borderRadius: 12, border: "1px solid #e2e8f0" }}
                  formatter={(value, name) => {
                    if (name === "yoyo") return [`${value}m`, "Yo-Yo"];
                    return [`${value}cm`, "CMJ"];
                  }}
                  labelFormatter={(label) => {
                    const item = chartData.find((d) => d.name === label);
                    const displayName = (item as any)?.fullName || label;
                    return `${displayName} (${item?.n} jug.)`;
                  }}
                />
                <Bar dataKey="yoyo" radius={[8, 8, 0, 0]}>
                  {chartData.map((entry, i) => (
                    <Cell key={i} fill={entry.fill} />
                  ))}
                  <LabelList dataKey="yoyo" position="top" fontSize={11} fontWeight={700} formatter={(v) => `${v}m`} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        );
      })()}

      {/* ===== PROMEDIO POR SUB (A, B, C, D) ===== */}
      <h2 className="text-sm font-bold text-slate-700 mt-6 mb-2.5 uppercase tracking-wider">
        Todas las A / B / C / D
      </h2>
      <div className="grid grid-cols-2 gap-2">
        {(["A", "B", "C", "D"] as const).map((sub) => {
          const s = stats.bySub[sub];
          return (
            <div key={sub} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-3.5">
              <p className="text-xs font-bold text-slate-500">Todas las {sub}</p>
              <p className="text-xl font-bold text-slate-900 mt-1">
                {s.yoyo > 0 ? s.yoyo : "-"}<span className="text-xs font-normal text-slate-400 ml-0.5">{s.yoyo > 0 ? "m" : ""}</span>
              </p>
              {s.cmj > 0 && (
                <p className="text-sm font-semibold text-slate-600">
                  {s.cmj}<span className="text-[10px] font-normal text-slate-400 ml-0.5">cm CMJ</span>
                </p>
              )}
              <p className="text-[10px] text-slate-400 mt-0.5">{s.n} testeadas</p>
            </div>
          );
        })}
      </div>

      {/* ===== PROMEDIO POR CATEGORIA ===== */}
      <h2 className="text-sm font-bold text-slate-700 mt-6 mb-2.5 uppercase tracking-wider">
        Por Categoria
      </h2>
      <div className="space-y-2">
        {stats.categories.map((cat) => {
          const s = stats.byCategory[cat];
          const count = data.categories[cat]?.length || 0;

          return (
            <Link key={cat} href={`/categorias/${encodeURIComponent(cat)}`}>
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 active:scale-[0.98] transition-transform">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className={`w-2.5 h-2.5 rounded-full ${getCategoryColor(cat)}`} />
                    <span className="font-semibold text-slate-900 text-sm">{cat}</span>
                    <span className="text-[11px] text-slate-400">{count} jug.</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="text-sm font-bold text-slate-800">
                        {s.yoyo > 0 ? `${s.yoyo}m` : "-"}
                      </p>
                      <p className="text-[10px] text-slate-400">Yo-Yo</p>
                    </div>
                    {s.cmj > 0 && (
                      <div className="text-right">
                        <p className="text-sm font-bold text-slate-700">{s.cmj}cm</p>
                        <p className="text-[10px] text-slate-400">CMJ</p>
                      </div>
                    )}
                    <svg className="w-4 h-4 text-slate-300" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                    </svg>
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
