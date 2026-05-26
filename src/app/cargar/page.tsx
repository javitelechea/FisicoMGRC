"use client";

import { useEffect, useState, useCallback } from "react";
import { PlayersData, Player, TestEntry } from "@/types/player";
import { loadPlayersData, searchPlayers, sortedCategories } from "@/lib/data";

type Tab = "manual" | "upload";

export default function CargarDatosPage() {
  const [data, setData] = useState<PlayersData | null>(null);
  const [tab, setTab] = useState<Tab>("manual");
  const [search, setSearch] = useState("");
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const [testDate, setTestDate] = useState(new Date().toISOString().split("T")[0]);
  const [yoyoLevel, setYoyoLevel] = useState("");
  const [yoyoMeters, setYoyoMeters] = useState("");
  const [cmjHeight, setCmjHeight] = useState("");
  const [peso, setPeso] = useState("");
  const [pressPecho, setPressPecho] = useState("");
  const [dorsalRemo, setDorsalRemo] = useState("");
  const [sentadilla, setSentadilla] = useState("");
  const [hamstring, setHamstring] = useState("");
  const [pivotPress, setPivotPress] = useState("");

  const [newPlayerName, setNewPlayerName] = useState("");
  const [newPlayerCategory, setNewPlayerCategory] = useState("");
  const [newPlayerPosition, setNewPlayerPosition] = useState("");
  const [newPlayerAge, setNewPlayerAge] = useState("");

  useEffect(() => {
    loadPlayersData().then(setData);
  }, []);

  const searchResults =
    data && search.length >= 2 ? searchPlayers(data.players, search).slice(0, 6) : [];

  const clearForm = () => {
    setYoyoLevel(""); setYoyoMeters(""); setCmjHeight(""); setPeso("");
    setPressPecho(""); setDorsalRemo(""); setSentadilla(""); setHamstring(""); setPivotPress("");
  };

  const handleSaveTest = useCallback(() => {
    if (!selectedPlayer && !newPlayerName) return;

    const newTest: TestEntry = {
      date: testDate,
      source: "manual",
      yoyo: {
        ...(yoyoLevel ? { level: parseFloat(yoyoLevel) } : {}),
        ...(yoyoMeters ? { meters: parseFloat(yoyoMeters) } : {}),
      },
      cmj: { ...(cmjHeight ? { height: parseFloat(cmjHeight) } : {}) },
      flexibility: {},
      strength: {
        ...(peso ? { peso: parseFloat(peso) } : {}),
        ...(pressPecho ? { press_pecho: parseFloat(pressPecho) } : {}),
        ...(dorsalRemo ? { dorsal_remo: parseFloat(dorsalRemo) } : {}),
        ...(sentadilla ? { sentadilla: parseFloat(sentadilla) } : {}),
        ...(hamstring ? { hamstring: parseFloat(hamstring) } : {}),
        ...(pivotPress ? { pivot_press: parseFloat(pivotPress) } : {}),
      },
    };

    if (selectedPlayer) {
      selectedPlayer.tests.unshift(newTest);
      setSuccessMessage(`Test guardado para ${selectedPlayer.name}`);
    } else if (newPlayerName && data) {
      const newPlayer: Player = {
        id: data.players.length + 1,
        name: newPlayerName,
        category: newPlayerCategory || null,
        division: null, sub: null,
        age: newPlayerAge ? parseFloat(newPlayerAge) : null,
        position: newPlayerPosition || null,
        tests: [newTest], history: null,
        name_variants: [newPlayerName],
      };
      data.players.push(newPlayer);
      setSuccessMessage(`${newPlayerName} creada con test`);
    }

    clearForm();
    setTimeout(() => setSuccessMessage(""), 3000);
  }, [selectedPlayer, newPlayerName, newPlayerCategory, newPlayerPosition, newPlayerAge, testDate, yoyoLevel, yoyoMeters, cmjHeight, peso, pressPecho, dorsalRemo, sentadilla, hamstring, pivotPress, data]);

  const handleFileUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSuccessMessage(`"${file.name}" recibido. Ejecuta el script de importacion para procesarlo.`);
    setTimeout(() => setSuccessMessage(""), 6000);
  }, []);

  if (!data) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  const categories = sortedCategories(data.categories);

  return (
    <div className="px-4 pt-6 pb-4">
      <h1 className="text-xl font-bold text-slate-900 mb-1">Cargar Datos</h1>
      <p className="text-xs text-slate-400 mb-4">Nuevos testeos o archivos</p>

      {successMessage && (
        <div className="mb-4 bg-emerald-50 border border-emerald-200 rounded-2xl p-3.5 flex items-center gap-2.5">
          <svg className="w-5 h-5 text-emerald-500 shrink-0" fill="currentColor" viewBox="0 0 24 24">
            <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12Zm13.36-1.814a.75.75 0 1 0-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 0 0-1.06 1.06l2.25 2.25a.75.75 0 0 0 1.14-.094l3.75-5.25Z" clipRule="evenodd" />
          </svg>
          <p className="text-sm text-emerald-700">{successMessage}</p>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 rounded-2xl p-1 mb-5">
        <button
          onClick={() => setTab("manual")}
          className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all ${tab === "manual" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"}`}
        >
          Manual
        </button>
        <button
          onClick={() => setTab("upload")}
          className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all ${tab === "upload" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"}`}
        >
          Subir Archivo
        </button>
      </div>

      {tab === "manual" && (
        <div className="space-y-4">
          {/* Player Search */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
            <p className="text-sm font-semibold text-slate-800 mb-2.5">Jugadora</p>
            <div className="relative">
              <input
                type="text"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setShowDropdown(true); setSelectedPlayer(null); }}
                placeholder="Buscar existente..."
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
              />
              {showDropdown && searchResults.length > 0 && (
                <div className="absolute top-full left-0 right-0 bg-white border border-slate-200 rounded-xl shadow-lg mt-1 z-10 max-h-48 overflow-y-auto">
                  {searchResults.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => { setSelectedPlayer(p); setSearch(p.name); setShowDropdown(false); }}
                      className="w-full text-left px-4 py-3 active:bg-slate-50 flex items-center justify-between text-sm border-b border-slate-50 last:border-0"
                    >
                      <span className="font-medium text-slate-800">{p.name}</span>
                      <span className="text-[11px] text-slate-400">{p.category || "Sin cat."}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {selectedPlayer && (
              <div className="mt-2.5 bg-red-50 rounded-xl p-3 flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-red-600 flex items-center justify-center text-white text-xs font-semibold">
                  {selectedPlayer.name.split(" ").map((w) => w[0]).slice(0, 2).join("")}
                </div>
                <div>
                  <p className="text-sm font-semibold text-red-800">{selectedPlayer.name}</p>
                  <p className="text-[11px] text-red-500">{selectedPlayer.category} {selectedPlayer.position && `- ${selectedPlayer.position}`}</p>
                </div>
              </div>
            )}

            <div className="mt-3 pt-3 border-t border-slate-100">
              <p className="text-[11px] text-slate-400 mb-2 uppercase tracking-wider font-medium">O crear nueva</p>
              <div className="grid grid-cols-2 gap-2">
                <input type="text" value={newPlayerName} onChange={(e) => { setNewPlayerName(e.target.value); setSelectedPlayer(null); }}
                  placeholder="Nombre" className="px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500" />
                <select value={newPlayerCategory} onChange={(e) => setNewPlayerCategory(e.target.value)}
                  className="px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500">
                  <option value="">Categoria</option>
                  {categories.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
                <input type="text" value={newPlayerPosition} onChange={(e) => setNewPlayerPosition(e.target.value)}
                  placeholder="Posicion" className="px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500" />
                <input type="number" value={newPlayerAge} onChange={(e) => setNewPlayerAge(e.target.value)}
                  placeholder="Edad" className="px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500" />
              </div>
            </div>
          </div>

          {/* Test Data */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-semibold text-slate-800">Test</p>
              <input type="date" value={testDate} onChange={(e) => setTestDate(e.target.value)}
                className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-red-500" />
            </div>

            <div className="space-y-3">
              <div>
                <p className="text-xs font-medium text-slate-500 mb-1.5">Yo-Yo IR N1</p>
                <div className="grid grid-cols-2 gap-2">
                  <input type="number" step="0.1" value={yoyoLevel} onChange={(e) => setYoyoLevel(e.target.value)}
                    placeholder="Nivel (14.5)" className="px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500" />
                  <input type="number" value={yoyoMeters} onChange={(e) => setYoyoMeters(e.target.value)}
                    placeholder="Metros (680)" className="px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500" />
                </div>
              </div>

              <div>
                <p className="text-xs font-medium text-slate-500 mb-1.5">CMJ</p>
                <input type="number" step="0.1" value={cmjHeight} onChange={(e) => setCmjHeight(e.target.value)}
                  placeholder="Altura cm (28.5)" className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500" />
              </div>

              <div>
                <p className="text-xs font-medium text-slate-500 mb-1.5">Fuerza 4MR</p>
                <div className="grid grid-cols-2 gap-2">
                  <input type="number" step="0.1" value={peso} onChange={(e) => setPeso(e.target.value)}
                    placeholder="Peso kg" className="px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500" />
                  <input type="number" step="0.1" value={pressPecho} onChange={(e) => setPressPecho(e.target.value)}
                    placeholder="Press Pecho" className="px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500" />
                  <input type="number" step="0.1" value={dorsalRemo} onChange={(e) => setDorsalRemo(e.target.value)}
                    placeholder="Dorsal Remo" className="px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500" />
                  <input type="number" step="0.1" value={sentadilla} onChange={(e) => setSentadilla(e.target.value)}
                    placeholder="Sentadilla" className="px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500" />
                  <input type="number" step="0.1" value={hamstring} onChange={(e) => setHamstring(e.target.value)}
                    placeholder="Hamstring" className="px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500" />
                  <input type="number" step="0.1" value={pivotPress} onChange={(e) => setPivotPress(e.target.value)}
                    placeholder="Pivot Press" className="px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500" />
                </div>
              </div>
            </div>

            <button
              onClick={handleSaveTest}
              disabled={!selectedPlayer && !newPlayerName}
              className="mt-4 w-full py-3 bg-red-600 text-white rounded-2xl text-sm font-semibold active:bg-red-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Guardar Test
            </button>
          </div>
        </div>
      )}

      {tab === "upload" && (
        <div className="space-y-4">
          <label className="block cursor-pointer">
            <div className="bg-white border-2 border-dashed border-slate-300 rounded-2xl p-10 text-center active:border-blue-400 transition-colors">
              <svg className="w-10 h-10 mx-auto text-red-400 mb-3" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
              </svg>
              <p className="text-sm font-semibold text-neutral-700 mb-0.5">Seleccionar archivo</p>
              <p className="text-xs text-neutral-400">.xlsx o .docx</p>
            </div>
            <input type="file" accept=".xlsx,.docx" onChange={handleFileUpload} className="hidden" />
          </label>

          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
            <p className="text-xs font-semibold text-amber-700 mb-1.5">Importacion automatica</p>
            <p className="text-xs text-amber-600 leading-relaxed">
              1. Coloca archivos en <code className="bg-amber-100 px-1 rounded">data_raw/2026/</code>
              <br />2. Ejecuta: <code className="bg-amber-100 px-1 rounded">python3 scripts/extract_data.py</code>
              <br />3. Recarga la app
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
