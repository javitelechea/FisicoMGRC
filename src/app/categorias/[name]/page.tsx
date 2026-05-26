"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { PlayersData } from "@/types/player";
import { loadPlayersData, getCategoryColor, getCategoryColorLight } from "@/lib/data";
import { PlayerCard } from "@/components/PlayerCard";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from "recharts";

export default function CategoryDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [data, setData] = useState<PlayersData | null>(null);
  const [sortBy, setSortBy] = useState<"name" | "yoyo" | "cmj">("yoyo");

  const categoryName = decodeURIComponent(params.name as string);

  useEffect(() => {
    loadPlayersData().then(setData);
  }, []);

  const players = useMemo(() => {
    if (!data) return [];
    let filtered = data.players.filter((p) => p.category === categoryName);

    if (sortBy === "yoyo") {
      filtered.sort((a, b) => {
        const aM = a.tests.find((t) => t.yoyo?.meters)?.yoyo.meters || 0;
        const bM = b.tests.find((t) => t.yoyo?.meters)?.yoyo.meters || 0;
        return bM - aM;
      });
    } else if (sortBy === "cmj") {
      filtered.sort((a, b) => {
        const aH = a.tests.find((t) => t.cmj?.height)?.cmj.height || 0;
        const bH = b.tests.find((t) => t.cmj?.height)?.cmj.height || 0;
        return bH - aH;
      });
    }

    return filtered;
  }, [data, categoryName, sortBy]);

  if (!data) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  const yoyoData = players
    .filter((p) => p.tests.some((t) => t.yoyo?.meters))
    .map((p) => ({
      name: p.name.split(" ").slice(-1)[0],
      fullName: p.name,
      meters: p.tests.find((t) => t.yoyo?.meters)!.yoyo.meters!,
    }))
    .sort((a, b) => b.meters - a.meters);

  return (
    <div className="px-4 pt-4 pb-8">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-1.5 text-sm text-slate-500 active:text-slate-900 mb-4"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
        </svg>
        Volver
      </button>

      <div className="flex items-center gap-2.5 mb-1">
        <div className={`w-3 h-3 rounded-full ${getCategoryColor(categoryName)}`} />
        <h1 className="text-xl font-bold text-slate-900">{categoryName}</h1>
      </div>
      <p className="text-xs text-slate-400 mb-4">{players.length} jugadoras</p>

      {/* Ranking Chart */}
      {yoyoData.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 mb-4">
          <h3 className="text-sm font-semibold text-slate-800 mb-3">Ranking Yo-Yo</h3>
          <ResponsiveContainer width="100%" height={Math.max(200, yoyoData.length * 28)}>
            <BarChart data={yoyoData} layout="vertical" margin={{ left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis type="number" tick={{ fontSize: 10 }} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} width={70} />
              <Tooltip
                formatter={(value) => [`${value}m`, "Metros"]}
                labelFormatter={(label) => {
                  const item = yoyoData.find((d) => d.name === label);
                  return item?.fullName || String(label);
                }}
                contentStyle={{ fontSize: 12, borderRadius: 12 }}
              />
              <Bar dataKey="meters" radius={[0, 4, 4, 0]}>
                {yoyoData.map((_, index) => (
                  <Cell key={index} fill={index < 3 ? "#3b82f6" : index < yoyoData.length * 0.5 ? "#60a5fa" : "#93c5fd"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Sort */}
      <div className="flex gap-2 mb-3">
        {(["yoyo", "cmj", "name"] as const).map((s) => (
          <button
            key={s}
            onClick={() => setSortBy(s)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-colors ${
              sortBy === s
                ? "bg-blue-600 text-white"
                : "bg-white text-slate-500 border border-slate-200"
            }`}
          >
            {s === "name" ? "Nombre" : s === "yoyo" ? "Yo-Yo" : "CMJ"}
          </button>
        ))}
      </div>

      <div className="space-y-2">
        {players.map((player) => (
          <PlayerCard key={player.id} player={player} />
        ))}
      </div>
    </div>
  );
}
