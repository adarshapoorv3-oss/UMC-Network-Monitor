import { APP_THRESHOLDS, ITU_AFFORDABILITY_THRESHOLD_INR } from "../data/gridData";

function Gauge({ value, color }) {
  return (
    <div className="mt-1.5 h-1.5 bg-gray-800 rounded-full overflow-hidden">
      <div
        className="h-full rounded-full transition-all"
        style={{ width: `${Math.min(100, value)}%`, background: `linear-gradient(90deg, ${color}88, ${color})` }}
      />
    </div>
  );
}

function AppBadge({ met, label, desc }) {
  const color = met ? "#22c55e" : "#ef4444";
  return (
    <div className="flex items-center justify-between py-1">
      <div>
        <span className="text-[10px] text-gray-400">{label}</span>
        <div className="text-[9px] text-gray-600">{desc}</div>
      </div>
      <span
        className="text-[9px] px-2 py-0.5 rounded font-bold tracking-wider"
        style={{ background: color + "22", color, border: `1px solid ${color}44` }}
      >
        {met ? "✓ READY" : "✗ FAIL"}
      </span>
    </div>
  );
}

export default function CellDetailPanel({ cell, onClose }) {
  if (!cell) return null;

  const nqsColor   = cell.nqs >= 72 ? "#22c55e" : cell.nqs >= 35 ? "#f59e0b" : "#ef4444";
  const hddiColor  = cell.hddiColor;
  const hddiPct    = (cell.hddi * 100).toFixed(1);

  return (
    <div
      className="flex flex-col h-full bg-gray-950 border-l border-gray-800 overflow-y-auto"
      style={{ fontFamily: "'Space Mono', monospace" }}
    >
      {/* ── Header ── */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800 sticky top-0 bg-gray-950 z-10">
        <div className="flex items-center gap-3">
          <span className="w-4 h-4 rounded-sm" style={{ background: cell.color }} />
          <span className="text-white font-bold text-sm tracking-widest">CELL {cell.id}</span>
        </div>
        <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors text-lg leading-none">✕</button>
      </div>

      {/* ── Landmark + tier ── */}
      <div className="px-4 pt-3 pb-2">
        <div className="text-[10px] text-gray-500 uppercase tracking-widest mb-0.5">Location</div>
        <div className="text-cyan-400 text-sm">{cell.landmark}</div>
        <div className="mt-1.5 flex gap-2 flex-wrap">
          <span
            className="text-xs px-2 py-0.5 rounded font-bold tracking-wider"
            style={{ background: cell.color + "22", color: cell.color, border: `1px solid ${cell.color}55` }}
          >
            {cell.tier.toUpperCase()}
          </span>
          <span
            className="text-[10px] px-2 py-0.5 rounded font-bold tracking-wider"
            style={{ background: cell.hddiColor + "22", color: cell.hddiColor, border: `1px solid ${cell.hddiColor}44` }}
          >
            {cell.hddiClass.toUpperCase()}
          </span>
        </div>
      </div>

      <div className="border-t border-gray-800 mx-4" />

      {/* ── HDDI Score ── */}
      <div className="px-4 py-3">
        <div className="text-[10px] text-gray-500 uppercase tracking-widest mb-1">
          Hidden Digital Desert Index
        </div>
        <div className="flex items-end gap-2">
          <span className="text-3xl font-bold" style={{ color: hddiColor }}>{cell.hddi.toFixed(3)}</span>
          <span className="text-gray-600 text-xs mb-1">/ 1.000 {cell.hddi >= 0.65 ? "⚠" : ""}</span>
        </div>
        <div className="mt-1 h-2 bg-gray-800 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full"
            style={{ width: `${hddiPct}%`, background: `linear-gradient(90deg, ${hddiColor}88, ${hddiColor})` }}
          />
        </div>
        <div className="flex justify-between text-[9px] text-gray-700 mt-0.5">
          <span>0 — No desert</span>
          <span>0.65 — Desert threshold</span>
          <span>1.0 — Blackout</span>
        </div>
        <div className="mt-2 grid grid-cols-3 gap-1 text-center">
          {[
            { label:"Quality", val:(cell.hddi * 0.4 / 0.4).toFixed(2), note:"IQR" },
            { label:"Temporal", val:cell.peak.degradeFactor + "%", note:"Peak drop" },
            { label:"App Suit.", val:(cell.peakApp.met) + "/3 met", note:"Peak hrs" },
          ].map(({label,val,note}) => (
            <div key={label} className="bg-gray-900 rounded p-1.5">
              <div className="text-[9px] text-gray-500">{label}</div>
              <div className="text-white text-[10px] font-bold">{val}</div>
              <div className="text-[9px] text-gray-700">{note}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="border-t border-gray-800 mx-4" />

      {/* ── NQS ── */}
      <div className="px-4 py-3">
        <div className="text-[10px] text-gray-500 uppercase tracking-widest mb-1">NQS Score (Off-Peak)</div>
        <div className="flex items-end gap-2">
          <span className="text-3xl font-bold" style={{ color: nqsColor }}>{Math.round(cell.nqs)}</span>
          <span className="text-gray-600 text-sm mb-1">/ 100</span>
        </div>
        <Gauge value={cell.nqs} color={nqsColor} />
      </div>

      <div className="border-t border-gray-800 mx-4" />

      {/* ── Signal metrics ── */}
      <div className="px-4 py-3">
        <div className="text-[10px] text-gray-500 uppercase tracking-widest mb-2">Signal Metrics</div>
        <div className="space-y-2 text-xs">
          {[
            { label:"RSRP",        val:`${cell.rsrp} dBm`,          note:"Reference Signal Received Power" },
            { label:"SINR",        val:`${cell.sinr} dB`,           note:"Signal-to-Interference+Noise Ratio" },
            { label:"DL Speed",    val:`${cell.downloadSpeed} Mbps`, note:"Off-peak downlink throughput" },
            { label:"UL Speed",    val:`${cell.uploadSpeed} Mbps`,   note:"Off-peak uplink throughput" },
            { label:"Latency",     val:`${cell.latency} ms`,         note:"Off-peak round-trip ping" },
          ].map(({label,val,note}) => (
            <div key={label}>
              <div className="flex justify-between"><span className="text-gray-500">{label}</span><span className="text-white">{val}</span></div>
              <div className="text-gray-700 text-[9px]">{note}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="border-t border-gray-800 mx-4" />

      {/* ── Temporal / Peak Hour ── */}
      <div className="px-4 py-3">
        <div className="text-[10px] text-gray-500 uppercase tracking-widest mb-2 flex items-center gap-2">
          Peak Hour (8–10 AM)
          <span className="text-red-400 text-[9px] font-bold">▼ {cell.peak.degradeFactor}% drop</span>
        </div>
        <div className="space-y-1.5 text-xs">
          {[
            { label:"DL Speed", off: cell.downloadSpeed, peak: cell.peak.downloadSpeed, unit:"Mbps" },
            { label:"UL Speed", off: cell.uploadSpeed,   peak: cell.peak.uploadSpeed,   unit:"Mbps" },
            { label:"Latency",  off: cell.latency,       peak: cell.peak.latency,       unit:"ms", inverse:true },
          ].map(({label,off,peak,unit,inverse}) => {
            const worse = inverse ? peak > off : peak < off;
            return (
              <div key={label} className="flex items-center justify-between gap-2">
                <span className="text-gray-500 w-16">{label}</span>
                <span className="text-gray-400 text-[10px]">{off}{unit}</span>
                <span className="text-gray-600 text-[9px]">→</span>
                <span className={`text-[10px] font-bold ${worse ? "text-red-400" : "text-green-400"}`}>{peak}{unit}</span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="border-t border-gray-800 mx-4" />

      {/* ── Application Suitability (Peak) ── */}
      <div className="px-4 py-3">
        <div className="text-[10px] text-gray-500 uppercase tracking-widest mb-1.5">Application Suitability (Peak Hours)</div>
        <AppBadge met={cell.peakApp.edu}    label={APP_THRESHOLDS.education.label} desc={APP_THRESHOLDS.education.desc} />
        <AppBadge met={cell.peakApp.health} label={APP_THRESHOLDS.health.label}    desc={APP_THRESHOLDS.health.desc} />
        <AppBadge met={cell.peakApp.work}   label={APP_THRESHOLDS.work.label}      desc={APP_THRESHOLDS.work.desc} />
        {cell.peakApp.met === 0 && (
          <div className="mt-2 text-[9px] text-red-400 border border-red-900 rounded px-2 py-1 bg-red-950/20">
            ⚠ This cell fails ALL application thresholds during academic peak hours
          </div>
        )}
      </div>

      <div className="border-t border-gray-800 mx-4" />

      {/* ── Gender + Affordability ── */}
      <div className="px-4 py-3">
        <div className="text-[10px] text-gray-500 uppercase tracking-widest mb-2">Gender & Affordability</div>
        <div className="space-y-1.5 text-xs">
          <div className="flex justify-between">
            <span className="text-gray-500">Female occupancy</span>
            <span className="text-purple-400 font-bold">{cell.female_pct}%</span>
          </div>
          <Gauge value={cell.female_pct} color="#8b5cf6" />
          <div className="flex justify-between mt-2">
            <span className="text-gray-500">Avg data spend</span>
            <span className={cell.exceedsITU ? "text-red-400 font-bold" : "text-gray-300"}>
              ₹{cell.dataSpend}/mo
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">As % of GNI</span>
            <span className={cell.exceedsITU ? "text-red-400 font-bold" : "text-green-400"}>
              {cell.affordPct}% {cell.exceedsITU ? "⚠" : ""}
            </span>
          </div>
          {cell.exceedsITU && (
            <div className="text-[9px] text-red-400 border border-red-900 rounded px-2 py-1 bg-red-950/20 mt-1">
              Exceeds ITU 2% affordability threshold (₹{ITU_AFFORDABILITY_THRESHOLD_INR}/mo)
              {cell.dualSim && " · Dual-SIM workaround active"}
            </div>
          )}
        </div>
      </div>

      <div className="border-t border-gray-800 mx-4" />

      {/* ── Network info ── */}
      <div className="px-4 py-3 space-y-1.5 text-xs">
        <div className="flex justify-between"><span className="text-gray-500">Operator</span><span className="text-white">{cell.operator}</span></div>
        <div className="flex justify-between"><span className="text-gray-500">Band</span><span className="text-white">{cell.band}</span></div>
        <div className="flex justify-between"><span className="text-gray-500">Lat / Lon</span><span className="text-white">{cell.lat}, {cell.lon}</span></div>
      </div>

      <div className="px-4 py-2 border-t border-gray-800 mt-auto">
        <div className="text-gray-700 text-[9px] tracking-widest uppercase">JIIT NOC · QBits · ITU UMC Hackathon 2025–26</div>
      </div>
    </div>
  );
}
