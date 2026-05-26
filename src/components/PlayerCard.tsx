"use client";

import Link from "next/link";
import { Player } from "@/types/player";
import { getCategoryColorLight } from "@/lib/data";

interface PlayerCardProps {
  player: Player;
}

export function PlayerCard({ player }: PlayerCardProps) {
  const latestYoyo = player.tests.find((t) => t.yoyo?.meters)?.yoyo;
  const latestCmj = player.tests.find((t) => t.cmj?.height)?.cmj;
  const hasHistory = player.history !== null;

  return (
    <Link href={`/jugadoras/${player.id}`}>
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 active:scale-[0.98] transition-transform">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-full bg-gradient-to-br from-red-600 to-neutral-900 flex items-center justify-center text-white font-semibold text-sm shrink-0">
            {player.name.split(" ").map((w) => w[0]).slice(0, 2).join("")}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-slate-900 text-sm truncate">
                {player.name}
              </h3>
              {hasHistory && (
                <svg className="w-4 h-4 text-red-500 shrink-0" fill="currentColor" viewBox="0 0 24 24">
                  <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12Zm13.36-1.814a.75.75 0 1 0-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 0 0-1.06 1.06l2.25 2.25a.75.75 0 0 0 1.14-.094l3.75-5.25Z" clipRule="evenodd" />
                </svg>
              )}
            </div>
            <p className="text-xs text-slate-400 truncate">
              {player.position || "Sin posicion"}
              {player.category && <span> &middot; {player.category}</span>}
            </p>
          </div>
          <div className="flex gap-2 shrink-0">
            {latestYoyo && (
              <div className="text-right">
                <p className="text-xs font-bold text-slate-800">{latestYoyo.meters}m</p>
                <p className="text-[10px] text-slate-400">Yo-Yo</p>
              </div>
            )}
            {latestCmj && (
              <div className="text-right">
                <p className="text-xs font-bold text-slate-800">{latestCmj.height}cm</p>
                <p className="text-[10px] text-slate-400">CMJ</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
