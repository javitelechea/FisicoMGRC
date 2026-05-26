import { PlayersData, Player } from "@/types/player";
import Fuse from "fuse.js";

let cachedData: PlayersData | null = null;
let fuseIndex: Fuse<Player> | null = null;

export async function loadPlayersData(): Promise<PlayersData> {
  if (cachedData) return cachedData;

  const res = await fetch("/data/players.json");
  cachedData = await res.json();
  return cachedData!;
}

export function getFuseIndex(players: Player[]): Fuse<Player> {
  if (fuseIndex) return fuseIndex;

  fuseIndex = new Fuse(players, {
    keys: [
      { name: "name", weight: 2 },
      { name: "name_variants", weight: 1.5 },
      { name: "position", weight: 0.5 },
    ],
    threshold: 0.4,
    distance: 100,
    includeScore: true,
  });

  return fuseIndex;
}

export function searchPlayers(
  players: Player[],
  query: string
): Player[] {
  if (!query.trim()) return players;
  const fuse = getFuseIndex(players);
  return fuse.search(query).map((r) => r.item);
}

export function getPlayersByCategory(
  players: Player[],
  category: string
): Player[] {
  return players.filter((p) => p.category === category);
}

export function getPlayerById(
  players: Player[],
  id: number
): Player | undefined {
  return players.find((p) => p.id === id);
}

const DIVISION_ORDER = ["5ta", "6ta", "7ma", "Sub14"];
const SUB_ORDER = ["A", "B", "C", "D"];

export function sortedCategories(categories: Record<string, string[]>): string[] {
  return Object.keys(categories).sort((a, b) => {
    const divA = DIVISION_ORDER.findIndex((d) => a.startsWith(d));
    const divB = DIVISION_ORDER.findIndex((d) => b.startsWith(d));
    if (divA !== divB) return (divA === -1 ? 99 : divA) - (divB === -1 ? 99 : divB);
    const subA = SUB_ORDER.findIndex((s) => a.includes(s));
    const subB = SUB_ORDER.findIndex((s) => b.includes(s));
    return (subA === -1 ? 99 : subA) - (subB === -1 ? 99 : subB);
  });
}

export function getCategoryColor(category: string): string {
  if (category.startsWith("5ta")) return "bg-blue-500";
  if (category.startsWith("6ta")) return "bg-emerald-500";
  if (category.startsWith("7ma")) return "bg-purple-500";
  if (category.startsWith("Sub14")) return "bg-amber-500";
  return "bg-slate-500";
}

export function getCategoryColorLight(category: string): string {
  if (category.startsWith("5ta")) return "bg-blue-50 text-blue-700 border-blue-200";
  if (category.startsWith("6ta")) return "bg-emerald-50 text-emerald-700 border-emerald-200";
  if (category.startsWith("7ma")) return "bg-purple-50 text-purple-700 border-purple-200";
  if (category.startsWith("Sub14")) return "bg-amber-50 text-amber-700 border-amber-200";
  return "bg-slate-50 text-slate-700 border-slate-200";
}
