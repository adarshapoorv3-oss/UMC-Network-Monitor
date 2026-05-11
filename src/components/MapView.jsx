import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import {
  GRID_DATA, CENTER_LAT, CENTER_LON, CELL_SIZE_LAT, CELL_SIZE_LON,
  APP_THRESHOLDS,
} from "../data/gridData";

const IMAGE_BOUNDS = [
  [CENTER_LAT - 3 * CELL_SIZE_LAT, CENTER_LON - 3 * CELL_SIZE_LON],
  [CENTER_LAT + 3 * CELL_SIZE_LAT, CENTER_LON + 3 * CELL_SIZE_LON],
];

function getLShapePolygon() {
  const pt = (ri, ci) => [
    CENTER_LAT + (2.5 - ri) * CELL_SIZE_LAT,
    CENTER_LON + (ci - 2.5) * CELL_SIZE_LON,
  ];
  return [
    pt(-0.5, -0.5),
    pt(-0.5,  2.5),
    pt( 2.5,  2.5),
    pt( 2.5,  5.5),
    pt( 5.5,  5.5),
    pt( 5.5, -0.5),
    pt(-0.5, -0.5),
  ];
}

const MAP_MODES = [
  { id:"coverage",  label:"Coverage",      icon:"📡" },
  { id:"hddi",      label:"HDDI",          icon:"🔍" },
  { id:"gender",    label:"Gender",        icon:"👩" },
  { id:"peak",      label:"Peak Hour",     icon:"⏱" },
];

function getCellColor(cell, mode) {
  if (mode === "coverage") return cell.color;
  if (mode === "hddi")     return cell.hddiColor;
  if (mode === "gender") {
    const pct = cell.female_pct;
    if (pct >= 70) return "#a855f7";
    if (pct >= 50) return "#8b5cf6";
    if (pct >= 35) return "#6d28d9";
    return "#4c1d95";
  }
  if (mode === "peak") {
    if (cell.peakApp.met === 0)  return "#ef4444";
    if (cell.peakApp.met === 1)  return "#f59e0b";
    if (cell.peakApp.met === 2)  return "#22d3ee";
    return "#22c55e";
  }
  return cell.color;
}

export default function MapView({ onSelectCell, selectedCell }) {
  const mapRef          = useRef(null);
  const mapInstanceRef  = useRef(null);
  const [hoveredCell, setHoveredCell] = useState(null);
  const [tooltipPos, setTooltipPos]   = useState({ x:0, y:0 });
  const rectLayersRef   = useRef([]);
  const [mapMode, setMapMode]         = useState("coverage");

  // Update colours on mode change
  useEffect(() => {
    rectLayersRef.current.forEach(({ id, rect }) => {
      const cell = GRID_DATA.find(c => c.id === id);
      if (!cell) return;
      const color = getCellColor(cell, mapMode);
      const isSelected = selectedCell && id === selectedCell.id;
      rect.setStyle({
        color:       color,
        fillColor:   color,
        fillOpacity: isSelected ? 0.70 : 0.40,
        weight:      isSelected ? 3 : 1.5,
      });
    });
  }, [mapMode, selectedCell]);

  // Highlight selected cell
  useEffect(() => {
    rectLayersRef.current.forEach(({ id, rect }) => {
      const cell = GRID_DATA.find(c => c.id === id);
      if (!cell) return;
      const color = getCellColor(cell, mapMode);
      if (selectedCell && id === selectedCell.id) {
        rect.setStyle({ weight:3, fillOpacity:0.70, color, fillColor:color });
      } else {
        rect.setStyle({ weight:1.5, fillOpacity:0.40, color, fillColor:color });
      }
    });
  }, [selectedCell, mapMode]);

  useEffect(() => {
    if (mapInstanceRef.current) return;

    const map = L.map(mapRef.current, {
      center: [CENTER_LAT, CENTER_LON],
      zoom: 17,
      zoomControl: true,
      attributionControl: false,
      minZoom: 15,
      maxZoom: 19,
    });
    mapInstanceRef.current = map;

    const img = new Image();
    img.onload = () => {
      L.imageOverlay("/jiit_campus.jpg", IMAGE_BOUNDS, { opacity:0.85 }).addTo(map);
    };
    img.onerror = () => {
      L.tileLayer(
        "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
        { attribution:"© OpenStreetMap © CARTO" }
      ).addTo(map);
    };
    img.src = "/jiit_campus.jpg";

    // L-shape boundary
    L.polygon(getLShapePolygon(), {
      color:"#ffffff", weight:2, opacity:0.3, fill:false,
      dashArray:"6 4", interactive:false,
    }).addTo(map);

    GRID_DATA.forEach((cell) => {
      const south = cell.lat - CELL_SIZE_LAT / 2;
      const north = cell.lat + CELL_SIZE_LAT / 2;
      const west  = cell.lon - CELL_SIZE_LON / 2;
      const east  = cell.lon + CELL_SIZE_LON / 2;

      const rect = L.rectangle([[south,west],[north,east]], {
        color:       cell.color,
        weight:      1.5,
        fillColor:   cell.color,
        fillOpacity: 0.40,
        opacity:     0.85,
      });

      rect.on("mouseover", (e) => {
        rect.setStyle({ fillOpacity:0.70, weight:2.5 });
        setHoveredCell(cell);
        setTooltipPos({ x:e.originalEvent.clientX, y:e.originalEvent.clientY });
      });
      rect.on("mousemove", (e) => {
        setTooltipPos({ x:e.originalEvent.clientX, y:e.originalEvent.clientY });
      });
      rect.on("mouseout", () => {
        const isSelected = selectedCell && cell.id === selectedCell.id;
        rect.setStyle({ fillOpacity: isSelected ? 0.70 : 0.40, weight: isSelected ? 3 : 1.5 });
        setHoveredCell(null);
      });
      rect.on("click", () => onSelectCell(cell));

      // Cell ID label
      const label = L.divIcon({
        html:`<div style="font-family:'Space Mono',monospace;font-size:9px;color:#fff;text-shadow:0 0 4px #000,0 0 2px #000;font-weight:700;pointer-events:none;line-height:1;">${cell.id}</div>`,
        className:"",
        iconSize:[24,14],
        iconAnchor:[12,7],
      });
      L.marker([cell.lat, cell.lon], { icon:label, interactive:false }).addTo(map);

      rect.addTo(map);
      rectLayersRef.current.push({ id:cell.id, rect });
    });

    return () => { map.remove(); mapInstanceRef.current = null; };
  }, []);

  // Legend config per mode
  const legendItems = {
    coverage: [["#22c55e","Strong (>−80 dBm)"],["#f59e0b","Weak (−80 to −100)"],["#ef4444","Dead Zone (<−100)"]],
    hddi:     [["#22c55e","Adequate (<0.40)"],["#f59e0b","At Risk (0.40–0.65)"],["#ef4444","Hidden Desert (>0.65)"]],
    gender:   [["#a855f7","≥70% Female"],["#8b5cf6","50–70% Female"],["#6d28d9","35–50%"],["#4c1d95","<35%"]],
    peak:     [["#22c55e","3/3 Thresholds Met"],["#22d3ee","2/3 Met"],["#f59e0b","1/3 Met"],["#ef4444","0/3 — All Fail"]],
  };

  return (
    <div className="relative w-full h-full">
      <div ref={mapRef} className="w-full h-full rounded-lg" />

      {/* Mode switcher */}
      <div className="absolute top-3 left-14 z-[1000] flex gap-1" style={{ fontFamily:"'Space Mono', monospace" }}>
        {MAP_MODES.map(m => (
          <button
            key={m.id}
            onClick={() => setMapMode(m.id)}
            className={`px-3 py-1.5 rounded-lg text-[10px] border transition-all ${
              mapMode === m.id
                ? "bg-cyan-500/20 border-cyan-500/60 text-cyan-400"
                : "bg-gray-950/90 border-gray-700 text-gray-400 hover:text-gray-200"
            }`}
          >
            {m.icon} {m.label}
          </button>
        ))}
      </div>

      {/* Hover Tooltip */}
      {hoveredCell && (
        <div className="fixed z-[9999] pointer-events-none" style={{ left:tooltipPos.x + 14, top:tooltipPos.y - 10 }}>
          <div className="bg-gray-950 border border-gray-700 rounded-lg p-3 shadow-2xl min-w-[200px]"
            style={{ fontFamily:"'Space Mono', monospace" }}>
            <div className="flex items-center gap-2 mb-2 border-b border-gray-700 pb-2">
              <span className="w-3 h-3 rounded-sm inline-block" style={{ background:hoveredCell.color }} />
              <span className="text-white font-bold text-xs tracking-widest">{hoveredCell.id}</span>
              <span className="text-gray-400 text-xs">{hoveredCell.tier}</span>
              <span className="ml-auto text-[9px] px-1.5 py-0.5 rounded font-bold"
                style={{ background:hoveredCell.hddiColor+"22", color:hoveredCell.hddiColor }}>
                HDDI {hoveredCell.hddi.toFixed(2)}
              </span>
            </div>
            <div className="text-[10px] text-cyan-400 mb-2">{hoveredCell.landmark}</div>
            <div className="space-y-1 text-xs">
              {[
                { label:"RSRP",         val:`${hoveredCell.rsrp} dBm`,            color:"#9ca3af" },
                { label:"SINR",         val:`${hoveredCell.sinr} dB`,             color:"#9ca3af" },
                { label:"DL Speed",     val:`${hoveredCell.downloadSpeed} Mbps`,   color:"#22c55e" },
                { label:"Peak DL",      val:`${hoveredCell.peak.downloadSpeed} Mbps`, color:"#ef4444" },
                { label:"Latency",      val:`${hoveredCell.latency} ms`,           color:"#f59e0b" },
                { label:"NQS",          val:`${Math.round(hoveredCell.nqs)}/100`,  color:"#ffffff" },
                { label:"Female occ.",  val:`${hoveredCell.female_pct}%`,         color:"#a78bfa" },
              ].map(({ label, val, color }) => (
                <div key={label} className="flex justify-between gap-4">
                  <span className="text-gray-500">{label}</span>
                  <span style={{ color }} className="font-bold">{val}</span>
                </div>
              ))}
            </div>
            {/* App suitability mini-badges */}
            <div className="mt-2 pt-2 border-t border-gray-800 flex gap-1 flex-wrap">
              {[
                { label:"Edu", met:hoveredCell.peakApp.edu },
                { label:"Health", met:hoveredCell.peakApp.health },
                { label:"Work", met:hoveredCell.peakApp.work },
              ].map(({ label, met }) => (
                <span key={label} className="text-[8px] px-1.5 py-0.5 rounded"
                  style={{ background: met ? "#22c55e22" : "#ef444422", color: met ? "#22c55e" : "#ef4444" }}>
                  {met ? "✓" : "✗"} {label}
                </span>
              ))}
              <span className="text-[8px] text-gray-600 ml-1">peak hrs</span>
            </div>
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="absolute bottom-4 left-4 z-[1000] bg-gray-950/90 border border-gray-700 rounded-lg px-3 py-2 text-xs"
        style={{ fontFamily:"'Space Mono', monospace" }}>
        <div className="text-gray-400 text-[10px] tracking-widest mb-1.5 uppercase">
          {MAP_MODES.find(m => m.id === mapMode)?.icon} {MAP_MODES.find(m => m.id === mapMode)?.label}
        </div>
        {(legendItems[mapMode] || []).map(([c, l]) => (
          <div key={l} className="flex items-center gap-2 mb-1">
            <span className="w-3 h-3 rounded-sm" style={{ background:c, opacity:0.8 }} />
            <span className="text-gray-300 text-[10px]">{l}</span>
          </div>
        ))}
        <div className="border-t border-gray-800 mt-2 pt-1.5 text-[10px] text-gray-600">
          27 cells · L-shape · Click for details
        </div>
      </div>

      {/* ITU UMC badge */}
      <div className="absolute bottom-4 right-4 z-[1000] bg-gray-950/90 border border-cyan-900 rounded-lg px-3 py-2 text-[9px]"
        style={{ fontFamily:"'Space Mono', monospace" }}>
        <div className="text-cyan-600 uppercase tracking-widest">ITU UMC Hackathon</div>
        <div className="text-gray-600">Team QBits · 2025–26</div>
      </div>
    </div>
  );
}
