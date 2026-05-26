"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { PlayersData } from "@/types/player";
import { loadPlayersData, sortedCategories, getCategoryColor } from "@/lib/data";

export default function CategoriasPage() {
  const [data, setData] = useState<PlayersData | null>(null);

  useEffect(() => {
    loadPlayersData().then(setData);
  }, []);

  if (!data) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  const categories = sortedCategories(data.categories);
  const divisions = ["5ta", "6ta", "7ma", "Sub14", "Sin categoría"];

  return (
    <div className="px-4 pt-6 pb-4">
      <h1 className="text-xl font-bold text-slate-900 mb-1">Categorias</h1>
      <p className="text-xs text-slate-400 mb-5">Por division y sub-categoria</p>

      {divisions.map((div) => {
        const divCats = categories.filter((c) =>
          div === "Sin categoría" ? c === "Sin categoría" : c.startsWith(div)
        );
        if (divCats.length === 0) return null;

        return (
          <div key={div} className="mb-5">
            <div className="flex items-center gap-2 mb-2.5">
              <div className={`w-2.5 h-2.5 rounded-full ${getCategoryColor(div)}`} />
              <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wider">
                {div === "Sin categoría" ? "Sin Cat." : div}
              </h2>
            </div>
            <div className="grid grid-cols-2 gap-2.5">
              {divCats.map((cat) => {
                const players = data.players.filter((p) => p.category === cat);
                const avgYoyo =
                  players
                    .filter((p) => p.tests.some((t) => t.yoyo?.meters))
                    .map((p) => p.tests.find((t) => t.yoyo?.meters)!.yoyo.meters!)
                    .reduce((a, b) => a + b, 0) /
                    (players.filter((p) => p.tests.some((t) => t.yoyo?.meters)).length || 1);

                return (
                  <Link key={cat} href={`/categorias/${encodeURIComponent(cat)}`}>
                    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 active:scale-[0.98] transition-transform">
                      <h3 className="font-bold text-base text-slate-900">{cat}</h3>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {players.length} jugadora{players.length !== 1 ? "s" : ""}
                      </p>
                      <div className="mt-2 pt-2 border-t border-slate-50">
                        <p className="text-[10px] text-slate-400">Prom. Yo-Yo</p>
                        <p className="text-sm font-bold text-slate-700">
                          {avgYoyo > 0 ? `${Math.round(avgYoyo)}m` : "-"}
                        </p>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
