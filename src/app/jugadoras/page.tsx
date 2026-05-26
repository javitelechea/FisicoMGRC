"use client";

import { useEffect, useState, useMemo } from "react";
import { PlayersData } from "@/types/player";
import { loadPlayersData, searchPlayers, sortedCategories } from "@/lib/data";
import { PlayerCard } from "@/components/PlayerCard";

export default function JugadorasPage() {
  const [data, setData] = useState<PlayersData | null>(null);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  useEffect(() => {
    loadPlayersData().then(setData);
  }, []);

  const filteredPlayers = useMemo(() => {
    if (!data) return [];
    let players = data.players;

    if (selectedCategory !== "all") {
      if (selectedCategory === "sin-categoria") {
        players = players.filter((p) => !p.category);
      } else {
        players = players.filter((p) => p.category === selectedCategory);
      }
    }

    if (search.trim()) {
      players = searchPlayers(players, search);
    }

    return players;
  }, [data, search, selectedCategory]);

  if (!data) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  const categories = sortedCategories(data.categories);

  return (
    <div className="px-4 pt-6 pb-4">
      <h1 className="text-xl font-bold text-slate-900 mb-1">Jugadoras</h1>
      <p className="text-xs text-slate-400 mb-4">
        {filteredPlayers.length} resultado{filteredPlayers.length !== 1 ? "s" : ""}
      </p>

      {/* Search */}
      <div className="relative mb-3">
        <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
        </svg>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar jugadora..."
          className="w-full pl-10 pr-10 py-3 bg-white border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
        />
        {search && (
          <button
            onClick={() => setSearch("")}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 w-5 h-5 bg-slate-200 rounded-full flex items-center justify-center"
          >
            <svg className="w-3 h-3 text-slate-500" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Category Pills */}
      <div className="flex gap-2 overflow-x-auto pb-3 mb-3 -mx-4 px-4 no-scrollbar">
        <button
          onClick={() => setSelectedCategory("all")}
          className={`shrink-0 px-4 py-1.5 rounded-full text-xs font-medium transition-colors ${
            selectedCategory === "all"
              ? "bg-blue-600 text-white"
              : "bg-white text-slate-600 border border-slate-200"
          }`}
        >
          Todas
        </button>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`shrink-0 px-4 py-1.5 rounded-full text-xs font-medium transition-colors ${
              selectedCategory === cat
                ? "bg-blue-600 text-white"
                : "bg-white text-slate-600 border border-slate-200"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Player List */}
      <div className="space-y-2">
        {filteredPlayers.map((player) => (
          <PlayerCard key={player.id} player={player} />
        ))}
      </div>

      {filteredPlayers.length === 0 && (
        <div className="text-center py-16">
          <svg className="w-12 h-12 mx-auto text-slate-300 mb-3" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
          </svg>
          <p className="text-slate-500 text-sm">No se encontraron jugadoras</p>
          <p className="text-slate-400 text-xs mt-1">Intenta con otro nombre</p>
        </div>
      )}
    </div>
  );
}
