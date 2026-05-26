"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Player, PlayersData } from "@/types/player";
import { loadPlayersData, getCategoryColorLight } from "@/lib/data";
import { PlayerCharts } from "@/components/PlayerCharts";

export default function PlayerProfilePage() {
  const params = useParams();
  const router = useRouter();
  const [data, setData] = useState<PlayersData | null>(null);
  const [player, setPlayer] = useState<Player | null>(null);

  useEffect(() => {
    loadPlayersData().then((d) => {
      setData(d);
      const id = parseInt(params.id as string);
      const found = d.players.find((p) => p.id === id);
      if (found) setPlayer(found);
    });
  }, [params.id]);

  if (!data || !player) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  const latestTest = player.tests[0];
  const history = player.history;

  return (
    <div className="px-4 pt-4 pb-8">
      {/* Back Button */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-1.5 text-sm text-slate-500 active:text-slate-900 mb-4"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
        </svg>
        Volver
      </button>

      {/* Header */}
      <div className="flex items-center gap-4 mb-5">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-lg shrink-0">
          {player.name.split(" ").map((w) => w[0]).slice(0, 2).join("")}
        </div>
        <div className="min-w-0">
          <h1 className="text-lg font-bold text-slate-900 leading-tight">{player.name}</h1>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            {player.category && (
              <span className={`text-[11px] px-2.5 py-0.5 rounded-full border font-medium ${getCategoryColorLight(player.category)}`}>
                {player.category}
              </span>
            )}
            {player.position && (
              <span className="text-xs text-slate-400">{player.position}</span>
            )}
            {player.age && (
              <span className="text-xs text-slate-400">{player.age} años</span>
            )}
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      {latestTest && (
        <div className="mb-5">
          <p className="text-[11px] text-slate-400 uppercase tracking-wider font-medium mb-2">
            Ultimo test &middot; {latestTest.date}
          </p>
          <div className="grid grid-cols-2 gap-2.5">
            {latestTest.yoyo?.meters && (
              <div className="bg-blue-50 rounded-2xl p-3.5">
                <p className="text-[11px] text-blue-500 font-semibold uppercase tracking-wider">Yo-Yo</p>
                <p className="text-xl font-bold text-blue-700 mt-0.5">
                  {latestTest.yoyo.meters}<span className="text-sm font-normal ml-0.5">m</span>
                </p>
                {latestTest.yoyo.level && (
                  <p className="text-[11px] text-blue-400">Nivel {latestTest.yoyo.level}</p>
                )}
              </div>
            )}
            {latestTest.cmj?.height && (
              <div className="bg-emerald-50 rounded-2xl p-3.5">
                <p className="text-[11px] text-emerald-500 font-semibold uppercase tracking-wider">CMJ</p>
                <p className="text-xl font-bold text-emerald-700 mt-0.5">
                  {latestTest.cmj.height}<span className="text-sm font-normal ml-0.5">cm</span>
                </p>
              </div>
            )}
            {latestTest.strength?.peso && (
              <div className="bg-purple-50 rounded-2xl p-3.5">
                <p className="text-[11px] text-purple-500 font-semibold uppercase tracking-wider">Peso</p>
                <p className="text-xl font-bold text-purple-700 mt-0.5">
                  {latestTest.strength.peso}<span className="text-sm font-normal ml-0.5">kg</span>
                </p>
              </div>
            )}
            {latestTest.strength?.sentadilla && (
              <div className="bg-amber-50 rounded-2xl p-3.5">
                <p className="text-[11px] text-amber-500 font-semibold uppercase tracking-wider">Sentadilla</p>
                <p className="text-xl font-bold text-amber-700 mt-0.5">
                  {latestTest.strength.sentadilla}<span className="text-sm font-normal ml-0.5">kg</span>
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Flexibility */}
      {latestTest && Object.keys(latestTest.flexibility || {}).length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 mb-3">
          <h3 className="text-sm font-semibold text-slate-800 mb-2.5">Flexibilidad</h3>
          <div className="grid grid-cols-3 gap-2">
            {Object.entries(latestTest.flexibility).map(([key, val]) => (
              <div key={key} className="bg-slate-50 rounded-xl p-2 text-center">
                <p className="text-[10px] text-slate-400 capitalize">{key}</p>
                <p className="text-sm font-semibold text-slate-700">{val}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Strength */}
      {latestTest?.strength && Object.keys(latestTest.strength).filter((k) => k !== "peso").length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 mb-3">
          <h3 className="text-sm font-semibold text-slate-800 mb-2.5">Fuerza 4MR</h3>
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(latestTest.strength)
              .filter(([k]) => k !== "peso")
              .map(([key, val]) => (
                <div key={key} className="bg-slate-50 rounded-xl p-3 text-center">
                  <p className="text-[10px] text-slate-400 capitalize">{key.replace(/_/g, " ")}</p>
                  <p className="text-base font-bold text-slate-700">
                    {val}<span className="text-xs font-normal ml-0.5">kg</span>
                  </p>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Charts */}
      {history && <PlayerCharts history={history} />}

      {/* Injuries */}
      {history && history.injuries.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 mt-3">
          <h3 className="text-sm font-semibold text-slate-800 mb-2.5 flex items-center gap-1.5">
            <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 24 24">
              <path fillRule="evenodd" d="M9.401 3.003c1.155-2 4.043-2 5.197 0l7.355 12.748c1.154 2-.29 4.5-2.599 4.5H4.645c-2.309 0-3.752-2.5-2.598-4.5L9.4 3.003ZM12 8.25a.75.75 0 0 1 .75.75v3.75a.75.75 0 0 1-1.5 0V9a.75.75 0 0 1 .75-.75Zm0 8.25a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Z" clipRule="evenodd" />
            </svg>
            Lesiones
          </h3>
          <div className="space-y-2">
            {history.injuries.map((injury, i) => (
              <div key={i} className="bg-red-50 rounded-xl px-3 py-2.5 text-xs">
                <span className="font-semibold text-red-700">{injury.year} {injury.month}</span>
                <span className="text-red-600 ml-2">{injury.description}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {!latestTest && !history && (
        <div className="text-center py-12">
          <svg className="w-12 h-12 mx-auto text-slate-300 mb-3" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m6.75 12H9.75m3 0H9.75m0 0a3 3 0 0 1-3-3V7.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
          </svg>
          <p className="text-slate-500 text-sm">Sin datos registrados</p>
          <Link
            href="/cargar"
            className="inline-block mt-3 px-5 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-medium active:bg-blue-700"
          >
            Cargar datos
          </Link>
        </div>
      )}

      {player.name_variants.length > 1 && (
        <p className="text-[11px] text-slate-300 mt-4 text-center">
          Variantes: {player.name_variants.join(", ")}
        </p>
      )}
    </div>
  );
}
