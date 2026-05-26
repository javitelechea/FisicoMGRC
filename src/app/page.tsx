"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { PlayersData, Player } from "@/types/player";
import { loadPlayersData, sortedCategories, getCategoryColor } from "@/lib/data";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, LabelList, ReferenceLine,
} from "recharts";

interface PrimeraData {
  byPosition: Record<string, { avg_yoyo: number; count: number }>;
  general: { avg_yoyo: number; count: number };
}

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

type ChartView = "division" | "sub" | "equipos" | "posicion";

function normalizePosition(pos: string | null): string | null {
  if (!pos) return null;
  const p = pos.toUpperCase().trim();
  if (p.startsWith("ARQ")) return "Arquera";
  if (p.startsWith("DEF") || p === "DEFENDORA LATERAL") return "Defensora";
  if (p.startsWith("VOL") || p === "VOL./DEL") return "Volante";
  if (p.startsWith("DEL") || p === "DL" || p === "DELANTERA") return "Delantera";
  return null;
}

const EQUIPO_COLORS: Record<string, string> = {
  "5ta A": "#dc2626", "5ta B": "#ef4444", "5ta C": "#f87171", "5ta D": "#fca5a5",
  "6ta A": "#111111", "6ta B": "#374151", "6ta C": "#6b7280", "6ta D": "#9ca3af",
  "7ma A": "#991b1b", "7ma B": "#b91c1c", "7ma C": "#dc2626", "7ma D": "#ef4444",
};

export default function Dashboard() {
  const [data, setData] = useState<PlayersData | null>(null);
  const [primera, setPrimera] = useState<PrimeraData | null>(null);
  const [chartView, setChartView] = useState<ChartView>("division");
  const [destFilter, setDestFilter] = useState<string>("club");

  useEffect(() => {
    loadPlayersData().then(setData);
    fetch("/data/primera.json").then((r) => r.json()).then(setPrimera);
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

    const byPosition: Record<string, ReturnType<typeof calcAvg>> = {};
    ["Arquera", "Defensora", "Volante", "Delantera"].forEach((pos) => {
      byPosition[pos] = calcAvg(allPlayers.filter((p) => normalizePosition(p.position) === pos));
    });

    return { total, byDivision, bySub, byCategory, byPosition, categories };
  }, [data]);

  if (!data || !stats) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="px-4 pt-6 pb-4">
      {/* Header */}
      <div className="flex items-center gap-3 mb-5">
        <Image src="/logo.png" alt="MGRC" width={36} height={36} className="rounded-lg" />
        <div>
          <h1 className="text-xl font-bold text-slate-900">FiscoMGRC</h1>
          <p className="text-xs text-slate-400">Temporada 2026</p>
        </div>
      </div>

      {/* ===== GRAFICO PROMEDIOS CON TOGGLE ===== */}
      {(() => {
        const primeraEntry = primera ? {
          name: "1ra A",
          fullName: "Primera A",
          yoyo: primera.general.avg_yoyo,
          cmj: 0,
          n: primera.general.count,
          fill: "#facc15",
        } : null;
        const p1 = primeraEntry ? [primeraEntry] : [];
        const divisionData = [
          ...p1,
          { name: "5ta", yoyo: stats.byDivision["5ta"].yoyo, cmj: stats.byDivision["5ta"].cmj, n: stats.byDivision["5ta"].n, fill: "#dc2626" },
          { name: "6ta", yoyo: stats.byDivision["6ta"].yoyo, cmj: stats.byDivision["6ta"].cmj, n: stats.byDivision["6ta"].n, fill: "#111111" },
          { name: "7ma", yoyo: stats.byDivision["7ma"].yoyo, cmj: stats.byDivision["7ma"].cmj, n: stats.byDivision["7ma"].n, fill: "#991b1b" },
        ];
        const subData = [
          ...p1,
          { name: "Todas A", yoyo: stats.bySub["A"].yoyo, cmj: stats.bySub["A"].cmj, n: stats.bySub["A"].n, fill: "#dc2626" },
          { name: "Todas B", yoyo: stats.bySub["B"].yoyo, cmj: stats.bySub["B"].cmj, n: stats.bySub["B"].n, fill: "#111111" },
          { name: "Todas C", yoyo: stats.bySub["C"].yoyo, cmj: stats.bySub["C"].cmj, n: stats.bySub["C"].n, fill: "#ef4444" },
          { name: "Todas D", yoyo: stats.bySub["D"].yoyo, cmj: stats.bySub["D"].cmj, n: stats.bySub["D"].n, fill: "#374151" },
        ];
        const equipoOrder = ["5ta A","5ta B","5ta C","5ta D","6ta A","6ta B","6ta C","6ta D","7ma A","7ma B","7ma C","7ma D"];
        const equiposData = [
          ...(primeraEntry ? [primeraEntry] : []),
          ...equipoOrder
            .filter((cat) => stats.byCategory[cat])
            .map((cat) => ({
              name: cat.replace("ta ", "").replace("ma ", ""),
              fullName: cat,
              yoyo: stats.byCategory[cat].yoyo,
              cmj: stats.byCategory[cat].cmj,
              n: stats.byCategory[cat].n,
              fill: EQUIPO_COLORS[cat] || "#94a3b8",
            })),
        ];
        const posiciones = ["Arquera", "Defensora", "Volante", "Delantera"] as const;
        const posicionData = posiciones.map((pos) => ({
          name: pos,
          yoyo: stats.byPosition[pos].yoyo,
          cmj: stats.byPosition[pos].cmj,
          objetivo: primera?.byPosition[pos]?.avg_yoyo || 0,
          n: stats.byPosition[pos].n,
          fill: pos === "Arquera" ? "#dc2626" : pos === "Defensora" ? "#111111" : pos === "Volante" ? "#ef4444" : "#374151",
        }));
        const divSubEquipoData = [...divisionData, ...subData, ...equiposData].map((d) => ({ ...d, objetivo: 0 }));
        const allChartData = {
          division: divisionData.map((d) => ({ ...d, objetivo: 0 })),
          sub: subData.map((d) => ({ ...d, objetivo: 0 })),
          equipos: equiposData.map((d) => ({ ...d, objetivo: 0 })),
          posicion: posicionData,
        };
        const chartData = allChartData[chartView];

        return (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
            <p className="text-sm font-bold text-slate-800 mb-3">Promedio Yo-Yo (metros)</p>
            <ResponsiveContainer width="100%" height={chartView === "equipos" ? 250 : 210}>
              <BarChart data={chartData} barSize={chartView === "equipos" ? 18 : chartView === "division" ? 36 : 30}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: chartView === "equipos" ? 9 : 11, fontWeight: 600 }} axisLine={false} tickLine={false} angle={chartView === "equipos" ? -35 : 0} textAnchor={chartView === "equipos" ? "end" : "middle"} height={chartView === "equipos" ? 40 : 20} />
                <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} width={35} />
                <Tooltip
                  contentStyle={{ fontSize: 12, borderRadius: 12, border: "1px solid #e2e8f0" }}
                  formatter={(value, name) => {
                    if (name === "yoyo" || name === "Juveniles") return [`${value}m`, "Juveniles"];
                    if (name === "objetivo" || name === "Obj. Primera") return [`${value}m`, "Obj. Primera A"];
                    return [`${value}cm`, "CMJ"];
                  }}
                  labelFormatter={(label) => {
                    const item = chartData.find((d) => d.name === label);
                    const displayName = (item as any)?.fullName || label;
                    return `${displayName} (${item?.n} jug.)`;
                  }}
                />
                <Bar dataKey="yoyo" radius={[8, 8, 0, 0]} name="Juveniles">
                  {chartData.map((entry, i) => (
                    <Cell key={i} fill={entry.fill} />
                  ))}
                  <LabelList dataKey="yoyo" position="top" fontSize={11} fontWeight={700} formatter={(v: any) => `${v}m`} />
                </Bar>
                {chartView === "posicion" && (
                  <Bar dataKey="objetivo" radius={[8, 8, 0, 0]} fill="#facc15" name="Primera A">
                    <LabelList dataKey="objetivo" position="top" fontSize={9} fontWeight={600} fill="#a16207" formatter={(v: any) => v > 0 ? `${v}m` : ""} />
                  </Bar>
                )}
              </BarChart>
            </ResponsiveContainer>
            <div className="flex gap-2 mt-3">
              {([
                { key: "division" as ChartView, label: "5ta 6ta 7ma" },
                { key: "sub" as ChartView, label: "A B C D" },
                { key: "equipos" as ChartView, label: "Equipos" },
                { key: "posicion" as ChartView, label: "Posición" },
              ]).map((btn) => (
                <button
                  key={btn.key}
                  onClick={() => setChartView(btn.key)}
                  className={`flex-1 py-2 rounded-xl text-xs font-semibold transition-colors ${
                    chartView === btn.key
                      ? "bg-red-600 text-white"
                      : "bg-neutral-100 text-neutral-500 active:bg-neutral-200"
                  }`}
                >
                  {btn.label}
                </button>
              ))}
            </div>
          </div>
        );
      })()}

      {/* ===== DESTACADAS ===== */}
      {(() => {
        const THRESHOLD_CLUB = 1.3;
        const THRESHOLD_CAT = 1.15;

        const allDestacadas = data.players
          .filter((p) => p.category && stats.byCategory[p.category])
          .map((p) => {
            const avg = stats.byCategory[p.category!];
            const playerYoyo = p.tests.find((t) => t.yoyo?.meters)?.yoyo.meters || 0;
            if (avg.yoyo <= 0 || playerYoyo <= 0) return null;
            const ratio = playerYoyo / avg.yoyo;
            return {
              player: p,
              yoyo: playerYoyo,
              avgYoyo: avg.yoyo,
              pct: Math.round((ratio - 1) * 100),
              ratio,
            };
          })
          .filter((d): d is NonNullable<typeof d> => d !== null);

        let filtered: typeof allDestacadas;
        if (destFilter === "club") {
          filtered = allDestacadas
            .filter((d) => {
              if (d.ratio < THRESHOLD_CLUB) return false;
              const div = d.player.division;
              const divAvg = div && stats.byDivision[div] ? stats.byDivision[div].yoyo : 0;
              return divAvg <= 0 || d.yoyo >= divAvg;
            });
        } else {
          filtered = allDestacadas
            .filter((d) => d.player.division === destFilter && d.ratio >= THRESHOLD_CAT);
        }

        const destacadas = filtered
          .sort((a, b) => b.pct - a.pct)
          .slice(0, 10);

        const maxPct = destacadas[0]?.pct || 1;

        return (
          <>
            <h2 className="text-sm font-bold text-neutral-800 mt-6 mb-3 uppercase tracking-wider flex items-center gap-1.5">
              <svg className="w-4 h-4 text-red-600" fill="currentColor" viewBox="0 0 24 24">
                <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.006 5.404.434c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.434 2.082-5.005Z" clipRule="evenodd" />
              </svg>
              Destacadas
            </h2>

            <div className="flex gap-2 mb-3">
              {["club", "5ta", "6ta", "7ma"].map((key) => (
                <button
                  key={key}
                  onClick={() => setDestFilter(key)}
                  className={`flex-1 py-2 rounded-xl text-xs font-semibold transition-colors ${
                    destFilter === key
                      ? "bg-red-600 text-white"
                      : "bg-neutral-100 text-neutral-500 active:bg-neutral-200"
                  }`}
                >
                  {key === "club" ? "Club" : key}
                </button>
              ))}
            </div>

            {destacadas.length > 0 ? (
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 space-y-3">
                {destacadas.map((d, i) => (
                  <Link key={d.player.id} href={`/jugadoras/${d.player.id}`}>
                    <div className="active:scale-[0.98] transition-transform">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                          <span className="text-xs font-bold text-neutral-400 w-4 shrink-0">{i + 1}</span>
                          <p className="text-xs font-semibold text-neutral-800 truncate">{d.player.name}</p>
                          <span className="text-[10px] text-neutral-400 shrink-0">{d.player.category}</span>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-xs font-bold text-neutral-700">{d.yoyo}m</span>
                          <span className="text-[10px] font-bold text-red-600">+{d.pct}%</span>
                        </div>
                      </div>
                      <div className="w-full bg-neutral-100 rounded-full h-2.5">
                        <div
                          className="h-2.5 rounded-full bg-gradient-to-r from-red-500 to-red-600 transition-all duration-500"
                          style={{ width: `${Math.max((d.pct / maxPct) * 100, 10)}%` }}
                        />
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 text-center">
                <p className="text-sm text-neutral-400">Sin destacadas en {destFilter === "club" ? "el club" : `la ${destFilter}`}</p>
              </div>
            )}
          </>
        );
      })()}

    
    </div>
  );
}
