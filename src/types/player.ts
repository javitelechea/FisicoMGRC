export interface YoyoTest {
  level?: number;
  meters?: number;
}

export interface CmjTest {
  height?: number;
}

export interface FlexibilityTest {
  isquiotibial?: string;
  psoas?: string;
  aductor?: string;
  cuadriceps?: string;
  gluteos?: string;
  gemelos?: string;
}

export interface StrengthTest {
  peso?: number;
  press_pecho?: number;
  dorsal_remo?: number;
  sentadilla?: number;
  hamstring?: number;
  pivot_press?: number;
}

export interface TestEntry {
  date: string;
  source: string;
  yoyo: YoyoTest;
  cmj: CmjTest;
  flexibility: FlexibilityTest;
  strength: StrengthTest;
}

export interface HistoryEntry {
  year?: string;
  division?: string;
  metric?: string;
  exercise?: string;
  month: string;
  value?: number;
  percentage?: number;
  description?: string;
}

export interface PlayerHistory {
  name: string;
  biometrics: HistoryEntry[];
  yoyo: HistoryEntry[];
  cmj: HistoryEntry[];
  strength: HistoryEntry[];
  attendance: HistoryEntry[];
  injuries: HistoryEntry[];
}

export interface Player {
  id: number;
  name: string;
  category: string | null;
  division: string | null;
  sub: string | null;
  age: number | null;
  position: string | null;
  tests: TestEntry[];
  history: PlayerHistory | null;
  name_variants: string[];
}

export interface PlayersData {
  generated_at: string;
  total_players: number;
  categories: Record<string, string[]>;
  players: Player[];
}
