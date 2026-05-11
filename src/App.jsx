import { useState } from "react";
import MapView from "./components/MapView";
import CellDetailPanel from "./components/CellDetailPanel";
import Dashboard from "./components/Dashboard";
import About from "./components/About";
import { SUMMARY } from "./data/gridData";

const TABS = [
  { id:"map",       label:"⬡ Map View" },
  { id:"dashboard", label:"▦ Dashboard" },
  { id:"about",     label:"◎ About" },
];

export default function App() {
  const [activeTab, setActiveTab]     = useState("map");
  const [selectedCell, setSelectedCell] = useState(null);

  return (
    <div className="flex flex-col h-screen bg-gray-950 text-white overflow-hidden"
      style={{ fontFamily:"'Space Mono', monospace" }}>

      {/* ── Navbar ── */}
      <header className="flex-shrink-0 flex items-center gap-0 px-5 border-b border-gray-800 bg-gray-950"
        style={{ height:"52px" }}>

        {/* Logo */}
        <div className="flex items-center gap-2.5 mr-6">
          <div className="relative w-7 h-7">
            <div className="absolute inset-0 rounded bg-cyan-500/20 border border-cyan-500/40" />
            <div className="absolute inset-0 flex items-center justify-center">
              <svg viewBox="0 0 20 20" className="w-4 h-4">
                <circle cx="10" cy="10" r="3" fill="#06b6d4" />
                <circle cx="10" cy="10" r="7" fill="none" stroke="#06b6d4" strokeWidth="1" strokeDasharray="2 2" opacity="0.5" />
                <circle cx="10" cy="10" r="11" fill="none" stroke="#06b6d4" strokeWidth="0.5" opacity="0.25" />
              </svg>
            </div>
          </div>
          <div>
            <div className="text-white text-[11px] font-bold tracking-widest leading-none">JIIT NOC</div>
            <div className="text-cyan-700 text-[8px] tracking-widest uppercase leading-none mt-0.5">Network Monitor</div>
          </div>
        </div>

        {/* Tabs */}
        <nav className="flex items-stretch gap-1 h-full">
          {TABS.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`px-4 text-[11px] tracking-wider border-b-2 transition-all duration-150 h-full ${
                activeTab === tab.id
                  ? "border-cyan-500 text-cyan-400 bg-cyan-500/5"
                  : "border-transparent text-gray-500 hover:text-gray-300 hover:border-gray-700"
              }`}>
              {tab.label}
            </button>
          ))}
        </nav>

        {/* Right status pills */}
        <div className="ml-auto flex items-center gap-3">
          {/* Coverage status */}
          <div className="flex items-center gap-1.5 text-[10px] text-green-400">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            {SUMMARY.strong} Strong
          </div>
          <div className="flex items-center gap-1.5 text-[10px] text-yellow-400">
            <span className="w-1.5 h-1.5 rounded-full bg-yellow-500" />
            {SUMMARY.weak} Weak
          </div>
          <div className="flex items-center gap-1.5 text-[10px] text-red-400">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
            {SUMMARY.dead} Dead
          </div>

          <div className="h-4 w-px bg-gray-800 mx-1" />

          {/* HDDI summary */}
          <div className="flex items-center gap-1.5 text-[10px] text-red-400">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
            {SUMMARY.hddiDeserts} HDDI Deserts
          </div>
          <div className="flex items-center gap-1.5 text-[10px] text-yellow-400">
            <span className="w-1.5 h-1.5 rounded-full bg-yellow-500" />
            {SUMMARY.atRisk} At Risk
          </div>

          <div className="h-4 w-px bg-gray-800 mx-1" />

          {/* ITU badge */}
          <div className="text-[9px] px-2 py-0.5 rounded-full border border-purple-800 text-purple-400 uppercase tracking-widest">
            ITU UMC 2025–26
          </div>
        </div>
      </header>

      {/* ── Content ── */}
      <main className="flex-1 overflow-hidden">

        {activeTab === "map" && (
          <div className="flex h-full">
            <div className="flex-1 relative">
              <MapView onSelectCell={setSelectedCell} selectedCell={selectedCell} />
            </div>
            {selectedCell && (
              <div className="w-72 flex-shrink-0">
                <CellDetailPanel cell={selectedCell} onClose={() => setSelectedCell(null)} />
              </div>
            )}
          </div>
        )}

        {activeTab === "dashboard" && <Dashboard />}
        {activeTab === "about"     && <About />}
      </main>
    </div>
  );
}
