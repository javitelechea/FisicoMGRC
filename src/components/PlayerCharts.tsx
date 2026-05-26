"use client";

import { PlayerHistory, HistoryEntry } from "@/types/player";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
} from "recharts";

interface PlayerChartsProps {
  history: PlayerHistory;
}

const MONTHS_ORDER = ["Feb.", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Sept", "Oct.", "Nov."];

function shortMonth(m: string): string {
  const map: Record<string, string> = {
    "Feb.": "Feb", Marzo: "Mar", Abril: "Abr", Mayo: "May",
    Junio: "Jun", Julio: "Jul", Agosto: "Ago", Sept: "Sep",
    "Oct.": "Oct", "Nov.": "Nov",
  };
  return map[m] || m;
}

function buildMonthlyData(
  entries: HistoryEntry[],
  valueKey: "value" | "percentage" = "value"
): { month: string; [key: string]: number | string }[] {
  const byYearMonth: Record<string, Record<string, number>> = {};
  entries.forEach((e) => {
    const year = e.year || "2026";
    if (!byYearMonth[year]) byYearMonth[year] = {};
    const val = e[valueKey];
    if (val !== undefined && val !== null) {
      byYearMonth[year][e.month] = val as number;
    }
  });

  const data: { month: string; [key: string]: number | string }[] = [];
  MONTHS_ORDER.forEach((month) => {
    const point: { month: string; [key: string]: number | string } = { month: shortMonth(month) };
    let hasValue = false;
    Object.keys(byYearMonth).forEach((year) => {
      if (byYearMonth[year][month] !== undefined) {
        point[year] = byYearMonth[year][month];
        hasValue = true;
      }
    });
    if (hasValue) data.push(point);
  });
  return data;
}

const YEAR_COLORS: Record<string, string> = {
  "2024": "#94a3b8",
  "2025": "#3b82f6",
  "2026": "#10b981",
};

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 mb-3">
      <h3 className="text-sm font-semibold text-slate-800 mb-3">{title}</h3>
      {children}
    </div>
  );
}

export function PlayerCharts({ history }: PlayerChartsProps) {
  const yoyoMeters = history.yoyo.filter((e) => e.metric === "Metros");
  const cmjData = history.cmj;
  const attendanceData = history.attendance;

  const strengthByExercise: Record<string, HistoryEntry[]> = {};
  history.strength.forEach((e) => {
    const ex = e.exercise || "Desconocido";
    if (!strengthByExercise[ex]) strengthByExercise[ex] = [];
    strengthByExercise[ex].push(e);
  });

  const biometricsByMetric: Record<string, HistoryEntry[]> = {};
  history.biometrics.forEach((e) => {
    const metric = e.metric || "Desconocido";
    if (!biometricsByMetric[metric]) biometricsByMetric[metric] = [];
    biometricsByMetric[metric].push(e);
  });

  const years = new Set<string>();
  [...history.yoyo, ...history.cmj, ...history.strength, ...history.attendance, ...history.biometrics]
    .forEach((e) => { if (e.year) years.add(e.year); });
  const yearsList = Array.from(years).sort();

  const hasAnyData =
    yoyoMeters.length > 0 || cmjData.length > 0 || attendanceData.length > 0 ||
    Object.keys(strengthByExercise).length > 0 || Object.keys(biometricsByMetric).length > 0;

  if (!hasAnyData) return null;

  return (
    <div className="mt-3">
      <p className="text-[11px] text-slate-400 uppercase tracking-wider font-medium mb-2">
        Evolucion historica
      </p>

      {yoyoMeters.length > 0 && (
        <ChartCard title="Yo-Yo IR N1 (metros)">
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={buildMonthlyData(yoyoMeters)}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} width={35} />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 12 }} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              {yearsList.map((year) => (
                <Line key={year} type="monotone" dataKey={year} stroke={YEAR_COLORS[year] || "#6366f1"} strokeWidth={2} dot={{ r: 3 }} connectNulls name={year} />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
      )}

      {cmjData.length > 0 && (
        <ChartCard title="CMJ - Altura (cm)">
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={buildMonthlyData(cmjData)}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} width={35} />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 12 }} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              {yearsList.map((year) => (
                <Bar key={year} dataKey={year} fill={YEAR_COLORS[year] || "#6366f1"} radius={[4, 4, 0, 0]} name={year} />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      )}

      {Object.keys(strengthByExercise).length > 0 && (
        <ChartCard title="Fuerza">
          <div className="space-y-4">
            {Object.entries(strengthByExercise).map(([exercise, entries]) => {
              const chartData = buildMonthlyData(entries);
              if (chartData.length === 0) return null;
              return (
                <div key={exercise}>
                  <p className="text-xs text-slate-500 mb-1 font-medium">{exercise}</p>
                  <ResponsiveContainer width="100%" height={160}>
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                      <YAxis tick={{ fontSize: 10 }} width={30} />
                      <Tooltip contentStyle={{ fontSize: 12, borderRadius: 12 }} />
                      {yearsList.map((year) => (
                        <Line key={year} type="monotone" dataKey={year} stroke={YEAR_COLORS[year] || "#6366f1"} strokeWidth={2} dot={{ r: 3 }} connectNulls />
                      ))}
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              );
            })}
          </div>
        </ChartCard>
      )}

      {attendanceData.length > 0 && (
        <ChartCard title="Presentismo (%)">
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={buildMonthlyData(attendanceData, "percentage")}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} width={35} domain={[0, 100]} />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 12 }} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              {yearsList.map((year) => (
                <Line key={year} type="monotone" dataKey={year} stroke={YEAR_COLORS[year] || "#6366f1"} strokeWidth={2} dot={{ r: 3 }} connectNulls name={year} />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
      )}

      {Object.keys(biometricsByMetric).length > 0 && (
        <ChartCard title="Biometricas">
          <div className="space-y-2">
            {Object.entries(biometricsByMetric).map(([metric, entries]) => (
              <div key={metric} className="bg-slate-50 rounded-xl p-3">
                <p className="text-xs font-medium text-slate-600 mb-1">{metric}</p>
                {entries.map((e, i) => (
                  <div key={i} className="flex justify-between text-xs py-0.5">
                    <span className="text-slate-400">{e.year} {e.month}</span>
                    <span className="font-medium text-slate-700">{e.value}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </ChartCard>
      )}
    </div>
  );
}
