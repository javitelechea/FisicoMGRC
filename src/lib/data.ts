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
  if (category.startsWith("5ta")) return "bg-red-600";
  if (category.startsWith("6ta")) return "bg-neutral-900";
  if (category.startsWith("7ma")) return "bg-red-800";
  if (category.startsWith("Sub14")) return "bg-neutral-600";
  return "bg-neutral-400";
}

export function displayPosition(pos: string | null): string {
  if (!pos) return "Sin posición";
  const p = pos.toUpperCase().replace(/\./g, "").replace(/\s+/g, " ").trim();

  if (p === "ARQ" || p === "ARQUERA") return "Arquera";

  if (p === "DEF C" || p === "DEF CENTRAL" || p === "DEFCENTRAL" || p === "DEFENSORA CENTRAL")
    return "Defensora Central";
  if (p === "DEF D" || p === "DEF L" || p === "DEF I" || p === "DEFDERECHA" || p === "DEFIZQUIERDA"
    || p === "DEFLATERAL" || p === "DEFENSORA LATERAL" || p === "DEFENDORA LATERAL" || p === "DEFENSORA")
    return "Defensora Lateral";

  if (p === "VOL C" || p === "VOLCENTRAL" || p === "VOLANTE" || p === "VOL")
    return "Volante Central";
  if (p === "VOL D" || p === "VOL I" || p === "VOL L" || p === "VOL LD" || p === "VOL LI"
    || p === "VOLANTEDERECHA" || p === "VOLANTEIZQUIERDO")
    return "Volante Lateral";
  if (p === "VOL/DEL") return "Volante Lateral";

  if (p === "DEL C" || p === "DELCENTRAL" || p === "DELANTERA" || p === "DL")
    return "Delantera";
  if (p === "DEL D" || p === "DEL I" || p === "DEL L" || p === "DELDERECHA" || p === "DELIZQUIERDA")
    return "Delantera";

  return pos;
}

export function getCategoryColorLight(category: string): string {
  if (category.startsWith("5ta")) return "bg-red-50 text-red-700 border-red-200";
  if (category.startsWith("6ta")) return "bg-neutral-100 text-neutral-800 border-neutral-300";
  if (category.startsWith("7ma")) return "bg-red-50 text-red-800 border-red-300";
  if (category.startsWith("Sub14")) return "bg-neutral-50 text-neutral-700 border-neutral-200";
  return "bg-neutral-50 text-neutral-700 border-neutral-200";
}
