import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, LabelList,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, LineChart, Line,
} from "recharts";
import {
  GRID_DATA, SUMMARY, TRAI_VS_MEASURED, TOTAL_CELLS,
  TEMPORAL_DATA, DELHI_NCR_DISTRICTS, SENSITIVITY_SCHEMES,
  ITU_AFFORDABILITY_THRESHOLD_INR, PERSONAS,
} from "../data/gridData";

const TT = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-gray-900 border border-gray-700 rounded p-2 text-xs" style={{ fontFamily: "'Space Mono', monospace" }}>
      {label && <div className="text-gray-400 mb-1">{label}</div>}
      {payload.map(p => <div key={p.dataKey} style={{ color: p.color || p.fill }}>{p.name}: <span className="text-white">{p.value}{p.unit || ""}</span></div>)}
    </div>
  );
};

function StatCard({ label, value, color, sub, icon }) {
  return (
    <div className="rounded-xl border p-4 flex flex-col gap-2"
      style={{ background: color + "0d", borderColor: color + "33", fontFamily: "'Space Mono', monospace" }}>
      <div className="flex items-center gap-2">
        <span className="text-lg">{icon}</span>
        <div className="text-[10px] uppercase tracking-widest text-gray-500">{label}</div>
      </div>
      <div className="text-4xl font-bold" style={{ color }}>{value}</div>
      <div className="text-[11px] text-gray-600">{sub}</div>
      <div className="h-1 rounded-full mt-1 bg-gray-800 overflow-hidden">
        <div className="h-full rounded-full" style={{ width: `${Math.round((+value / TOTAL_CELLS) * 100)}%`, background: color }} />
      </div>
    </div>
  );
}

// ── Section header ───────────────────────────────────────────────────────────
function SectionHeader({ icon, title, sub, badge }) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <div className="w-1 h-8 rounded-full bg-cyan-500" />
      <div>
        <div className="flex items-center gap-2">
          <span className="text-white font-bold tracking-wider">{icon} {title}</span>
          {badge && (
            <span className="text-[9px] px-2 py-0.5 rounded-full border border-cyan-800 text-cyan-400 uppercase tracking-widest">{badge}</span>
          )}
        </div>
        {sub && <div className="text-gray-600 text-[10px] uppercase tracking-widest">{sub}</div>}
      </div>
    </div>
  );
}

// ── HDDI heatmap row ─────────────────────────────────────────────────────────
function HDDIGrid() {
  const rows = ["A","B","C","D","E","F"];
  const cols = [1,2,3,4,5,6];
  const map  = Object.fromEntries(GRID_DATA.map(c => [c.id, c]));

  return (
    <div>
      <div className="text-[10px] text-gray-500 uppercase tracking-widest mb-2">
        HDDI Heatmap — 27 campus cells · L-shape boundary
      </div>
      <div className="grid gap-1" style={{ gridTemplateColumns: "repeat(6, 1fr)" }}>
        {rows.flatMap(row =>
          cols.map(col => {
            const id   = `${row}${col}`;
            const cell = map[id];
            if (!cell) {
              return (
                <div key={id} className="rounded aspect-square flex items-center justify-center text-[8px] text-gray-800 bg-gray-900/20 border border-gray-900">
                  {id}
                </div>
              );
            }
            const bg = cell.hddi >= 0.65 ? "#ef444430" : cell.hddi >= 0.40 ? "#f59e0b25" : "#22c55e20";
            const border = cell.hddiColor + "66";
            return (
              <div
                key={id}
                className="rounded aspect-square flex flex-col items-center justify-center cursor-pointer hover:scale-105 transition-transform"
                style={{ background: bg, border: `1px solid ${border}` }}
                title={`${id}: HDDI ${cell.hddi.toFixed(3)} · ${cell.landmark}`}
              >
                <div className="text-[9px] text-gray-300 font-bold">{id}</div>
                <div className="text-[8px]" style={{ color: cell.hddiColor }}>{cell.hddi.toFixed(2)}</div>
              </div>
            );
          })
        )}
      </div>
      <div className="flex gap-4 mt-2 text-[9px] text-gray-500">
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-green-500/50 border border-green-500" /> Adequate (&lt;0.40)</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-yellow-500/40 border border-yellow-500" /> At Risk (0.40–0.65)</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-red-500/40 border border-red-500" /> Hidden Desert (&gt;0.65)</span>
      </div>
    </div>
  );
}

// ── Sensitivity analysis table ────────────────────────────────────────────────
function SensitivityTable() {
  const worst5 = [...GRID_DATA].sort((a,b) => b.hddi - a.hddi).slice(0,5);
  return (
    <div className="overflow-x-auto">
      <div className="text-[10px] text-gray-500 uppercase tracking-widest mb-2">
        HDDI Sensitivity Analysis — 4 Weighting Schemes
      </div>
      <table className="w-full text-[10px] border-collapse">
        <thead>
          <tr className="border-b border-gray-800">
            <th className="text-left px-2 py-1.5 text-gray-600 font-normal">Cell</th>
            <th className="text-left px-2 py-1.5 text-gray-600 font-normal">Landmark</th>
            {SENSITIVITY_SCHEMES.map(s => (
              <th key={s.name} className="text-center px-2 py-1.5 text-gray-600 font-normal whitespace-nowrap">{s.name}<br/><span className="text-[8px] text-gray-700">{s.w.join("/")}</span></th>
            ))}
            <th className="text-left px-2 py-1.5 text-gray-600 font-normal">Consistent?</th>
          </tr>
        </thead>
        <tbody>
          {worst5.map((c, i) => {
            const allHigh = c.sensitivityScores.every(s => s >= 0.40);
            return (
              <tr key={c.id} className={i % 2 === 0 ? "bg-gray-900/20" : ""}>
                <td className="px-2 py-1.5 font-bold" style={{ color: c.color }}>{c.id}</td>
                <td className="px-2 py-1.5 text-gray-400">{c.landmark.substring(0,20)}</td>
                {c.sensitivityScores.map((score, si) => (
                  <td key={si} className="px-2 py-1.5 text-center">
                    <span className="font-bold" style={{ color: score >= 0.65 ? "#ef4444" : score >= 0.40 ? "#f59e0b" : "#22c55e" }}>
                      {score.toFixed(3)}
                    </span>
                  </td>
                ))}
                <td className="px-2 py-1.5">
                  <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold ${allHigh ? "text-green-400 bg-green-900/30" : "text-gray-500"}`}>
                    {allHigh ? "✓ Robust" : "Borderline"}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <div className="mt-2 text-[10px] text-gray-600 italic">
        Dead-zone classifications are consistent across all 4 weighting schemes — findings do not depend on arbitrary methodological choices.
      </div>
    </div>
  );
}

// ── Temporal degradation chart ────────────────────────────────────────────────
function TemporalChart() {
  const cells = GRID_DATA.filter(c => c.tier === "Weak").slice(0, 5);
  const data = cells.map(c => ({
    name: c.id,
    "Off-Peak": c.downloadSpeed,
    "8–10 AM Peak": c.peak.downloadSpeed,
    "Education Threshold": 5,
  }));

  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={data} barCategoryGap="25%">
        <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
        <XAxis dataKey="name" tick={{ fill:"#6b7280", fontSize:9 }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fill:"#6b7280", fontSize:9 }} axisLine={false} tickLine={false} unit=" Mbps" domain={[0,50]} />
        <Tooltip content={<TT />} />
        <Bar dataKey="Off-Peak" name="Off-Peak DL" fill="#22c55e" radius={[3,3,0,0]} opacity={0.8}>
          <LabelList dataKey="Off-Peak" position="top" style={{ fill:"#4ade80", fontSize:8 }} formatter={v => `${v}`} />
        </Bar>
        <Bar dataKey="8–10 AM Peak" name="Peak DL" fill="#ef4444" radius={[3,3,0,0]} opacity={0.8}>
          <LabelList dataKey="8–10 AM Peak" position="top" style={{ fill:"#f87171", fontSize:8 }} formatter={v => `${v}`} />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

// ── Application suitability by tier ──────────────────────────────────────────
function AppSuitability() {
  const tiers = ["Strong","Weak","Dead Zone"];
  const data = tiers.map(tier => {
    const cells = GRID_DATA.filter(c => c.tier === tier);
    const edu    = cells.filter(c => c.peakApp.edu).length;
    const health = cells.filter(c => c.peakApp.health).length;
    const work   = cells.filter(c => c.peakApp.work).length;
    return { tier, edu, health, work, total: cells.length };
  });

  return (
    <div className="space-y-3">
      {data.map(({ tier, edu, health, work, total }) => {
        const color = tier === "Strong" ? "#22c55e" : tier === "Weak" ? "#f59e0b" : "#ef4444";
        return (
          <div key={tier} className="rounded-lg border border-gray-800 p-3" style={{ background: color + "08" }}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold" style={{ color }}>{tier}</span>
              <span className="text-[10px] text-gray-500">{total} cells</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[
                { label:"Education", val:edu, color:"#06b6d4" },
                { label:"Health",    val:health, color:"#a78bfa" },
                { label:"Work",      val:work, color:"#f59e0b" },
              ].map(({ label, val, color: c }) => (
                <div key={label} className="text-center">
                  <div className="text-[9px] text-gray-500">{label}</div>
                  <div className="text-lg font-bold" style={{ color: c }}>{val}<span className="text-[10px] text-gray-600">/{total}</span></div>
                  <div className="h-1 bg-gray-800 rounded-full mt-1 overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${(val/total)*100}%`, background: c }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Gender analysis ───────────────────────────────────────────────────────────
function GenderAnalysis() {
  const byTier = ["Strong","Weak","Dead Zone"].map(tier => {
    const cells = GRID_DATA.filter(c => c.tier === tier);
    const avg = cells.reduce((a,c) => a + c.female_pct, 0) / cells.length;
    return { tier, avg: parseFloat(avg.toFixed(1)) };
  });

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        {byTier.map(({ tier, avg }) => {
          const color = tier === "Strong" ? "#22c55e" : tier === "Weak" ? "#f59e0b" : "#ef4444";
          return (
            <div key={tier} className="rounded-lg border border-gray-800 p-3 text-center" style={{ background: color + "08" }}>
              <div className="text-[9px] text-gray-500 mb-1">{tier}</div>
              <div className="text-2xl font-bold" style={{ color }}>{avg}%</div>
              <div className="text-[9px] text-purple-400">female</div>
              <div className="h-1 bg-gray-800 rounded-full mt-2 overflow-hidden">
                <div className="h-full bg-purple-500 rounded-full" style={{ width: `${avg}%` }} />
              </div>
            </div>
          );
        })}
      </div>
      <div className="text-[11px] text-gray-500 border border-yellow-900 bg-yellow-950/20 rounded-lg p-3">
        <span className="text-yellow-400 font-bold">⚠ Gender finding: </span>
        Dead-zone grid cells have an average {SUMMARY.avgFemaleDeadZone}% female occupancy — 
        including Girls Hostel Blocks (D6, E6: ~95% female) and the Medical Centre (E5: ~62% female). 
        These are invisible in all official gender parity statistics.
      </div>
      <div>
        <div className="text-[10px] text-gray-500 uppercase tracking-widest mb-2">Female occupancy per cell</div>
        <div className="grid grid-cols-2 gap-1">
          {GRID_DATA.filter(c => c.female_pct >= 55 || c.tier === "Dead Zone").map(c => (
            <div key={c.id} className="flex items-center gap-2 text-[10px]">
              <span className="font-bold w-6" style={{ color: c.color }}>{c.id}</span>
              <div className="flex-1 h-1.5 bg-gray-800 rounded-full overflow-hidden">
                <div className="h-full bg-purple-500 rounded-full" style={{ width: `${c.female_pct}%` }} />
              </div>
              <span className="text-purple-400 w-8 text-right">{c.female_pct}%</span>
              {c.tier === "Dead Zone" && <span className="text-red-500 text-[8px]">☠</span>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Affordability panel ───────────────────────────────────────────────────────
function AffordabilityPanel() {
  const data = [
    { label:"Adequate zone students",    spend:249, itu:ITU_AFFORDABILITY_THRESHOLD_INR, pct:1.5 },
    { label:"Weak zone students",        spend:349, itu:ITU_AFFORDABILITY_THRESHOLD_INR, pct:2.1 },
    { label:"Dead zone (single SIM)",    spend:349, itu:ITU_AFFORDABILITY_THRESHOLD_INR, pct:2.1 },
    { label:"Dead zone (dual-SIM workaround)", spend:598, itu:ITU_AFFORDABILITY_THRESHOLD_INR, pct:3.6 },
    { label:"Low-income, dual-SIM",      spend:598, itu:ITU_AFFORDABILITY_THRESHOLD_INR, pct:6.7 },
  ];

  return (
    <div className="space-y-3">
      <div className="text-[10px] text-gray-500">Monthly mobile data spend as % of household income</div>
      {data.map(({ label, spend, pct }) => {
        const overITU = pct > 2;
        const barColor = pct <= 2 ? "#22c55e" : pct <= 3.5 ? "#f59e0b" : "#ef4444";
        return (
          <div key={label}>
            <div className="flex justify-between text-[10px] mb-0.5">
              <span className="text-gray-400">{label}</span>
              <span className={overITU ? "text-red-400 font-bold" : "text-green-400"}>
                ₹{spend}/mo · {pct}% {overITU ? "⚠" : "✓"}
              </span>
            </div>
            <div className="relative h-2 bg-gray-800 rounded-full overflow-hidden">
              <div className="h-full rounded-full" style={{ width: `${Math.min(100, pct * 14)}%`, background: barColor }} />
              {/* ITU threshold marker at 2% */}
              <div className="absolute top-0 bottom-0 w-px bg-white/40" style={{ left: `${2 * 14}%` }} />
            </div>
          </div>
        );
      })}
      <div className="text-[9px] text-gray-600 mt-1">
        White line = ITU 2% GNI affordability threshold (₹{ITU_AFFORDABILITY_THRESHOLD_INR}/mo for India)
      </div>
      <div className="mt-3 border border-red-900 bg-red-950/20 rounded-lg p-3 text-[11px]">
        <span className="text-red-400 font-bold">Affordability finding: </span>
        <span className="text-gray-400">
          Students in dead zones who adopt the dual-SIM workaround spend ₹598/month — 
          3.6% of India's GNI per capita and up to 6.7% of low-income household income. 
          A <span className="text-white font-bold">signal quality failure</span> becomes an <span className="text-white font-bold">affordability burden</span> that no official dataset captures.
        </span>
      </div>
    </div>
  );
}

// ── Delhi NCR scaling ─────────────────────────────────────────────────────────
function DelhiNCRPanel() {
  const sorted = [...DELHI_NCR_DISTRICTS].sort((a,b) => b.hddiProxy - a.hddiProxy);
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3 mb-3">
        <div className="rounded-lg border border-gray-800 bg-gray-900/40 p-3 text-center">
          <div className="text-[10px] text-gray-500 uppercase tracking-widest">Districts Above HDDI 0.65</div>
          <div className="text-3xl font-bold text-red-400 mt-1">
            {DELHI_NCR_DISTRICTS.filter(d => d.hddiProxy >= 0.65).length}
          </div>
          <div className="text-[10px] text-gray-600">Hidden digital desert risk</div>
        </div>
        <div className="rounded-lg border border-gray-800 bg-gray-900/40 p-3 text-center">
          <div className="text-[10px] text-gray-500 uppercase tracking-widest">Students Estimated at Risk</div>
          <div className="text-3xl font-bold text-yellow-400 mt-1">720K</div>
          <div className="text-[10px] text-gray-600">Conservative extrapolation</div>
        </div>
      </div>
      <div className="text-[10px] text-gray-500 uppercase tracking-widest mb-1">District HDDI Proxy Scores</div>
      {sorted.map(d => {
        const color = d.hddiProxy >= 0.65 ? "#ef4444" : d.hddiProxy >= 0.40 ? "#f59e0b" : "#22c55e";
        return (
          <div key={d.district} className="flex items-center gap-2">
            <div className="w-36 text-[9px] text-gray-400 truncate">{d.district}</div>
            <div className="flex-1 h-2 bg-gray-800 rounded-full overflow-hidden">
              <div className="h-full rounded-full" style={{ width: `${d.hddiProxy * 100}%`, background: color }} />
            </div>
            <div className="text-[9px] font-bold w-10 text-right" style={{ color }}>{d.hddiProxy.toFixed(2)}</div>
            <div className="text-[9px] text-gray-600 w-12">{d.institutions} inst.</div>
            {d.hddiProxy >= 0.65 && <span className="text-[8px] text-red-400">⚠</span>}
          </div>
        );
      })}
      <div className="mt-3 text-[10px] text-gray-600 italic border border-gray-800 rounded-lg p-2">
        Extrapolation: Applying the campus-measured 22% dead-zone finding as a conservative floor estimate
        to Delhi NCR's ~3,200 colleges, with average 1,500 students each and 15% indoor dead-zone prevalence:
        <span className="text-yellow-400 font-bold"> ~720,000 students</span> are studying in hidden digital deserts
        that appear green on every official map. (Conservative estimate — not a precision count.)
      </div>
    </div>
  );
}

// ── Policy recommendations ────────────────────────────────────────────────────
const POLICIES = [
  {
    num:"01", color:"#06b6d4",
    title:"Mandatory Indoor Coverage Audits",
    problem:"TRAI propagation models overstate indoor quality by 33–48 percentage points. This creates an accountability gap for 40,000+ Indian higher-education institutions.",
    action:"Amend TRAI QoS guidelines to require separate indoor coverage reporting for all registered educational institutions and hospitals. Mandate quarterly walk-test audits using open-source methodology.",
    roi:"Infrastructure cost: near-zero (protocol is open-source). Impact: creates accountability mechanism for 40,000+ institutions.",
    icon:"📡",
  },
  {
    num:"02", color:"#22c55e",
    title:"Targeted Small-Cell Deployment at HDDI > 0.65 Cells",
    problem:"6 dead-zone cells (C4, D5, D6, E5, E6, F1) with RSRP < −100 dBm serve the library, research labs, and all female hostel blocks during peak academic hours.",
    action:"Deploy small cells at top 4 dead-zone cells. Estimated cost: ₹6–20 lakh. Use district-level HDDI choropleth to prioritize USOF subsidy allocation for worst-affected institutions.",
    roi:"Cost per beneficiary: ₹3–11/student/day. 400–600 students gain reliable connectivity. Application suitability improves from 0/3 to 3/3 thresholds.",
    icon:"📶",
  },
  {
    num:"03", color:"#f59e0b",
    title:"Peak-Hour QoS Commitments for Academic Hours",
    problem:`${TEMPORAL_DATA.cellsDroppingBelowEdu} cells drop below the education-readiness threshold (5 Mbps) during 8–10 AM academic peak, despite meeting it off-peak.`,
    action:"Require operators to guarantee minimum 5 Mbps download + 100ms latency at registered institutions during 8–10 AM and 2–4 PM weekdays. Publish compliance reports quarterly.",
    roi:"No infrastructure cost. Creates operator accountability for temporal digital deserts — the invisible dimension of hidden connectivity failure.",
    icon:"⏰",
  },
  {
    num:"04", color:"#a78bfa",
    title:"Scale Walk-Test Methodology as National Standard",
    problem:"No standardised, affordable protocol exists for verifying indoor connectivity at individual institutions. Official measurement relies entirely on propagation models.",
    action:"Adopt Campus Network Grid Monitoring System protocol (hardware < USD 500, open-source code) as ITU-recommended measurement standard. Partner with engineering college technical cells for citizen-science audits nationwide.",
    roi:"Scalable to zero hardware cost using Android smartphones. Creates the first national database of verified indoor connectivity quality — directly feeding TRAI's evidence base.",
    icon:"🌐",
  },
];

function PolicyCard({ policy }) {
  return (
    <div
      className="rounded-xl border p-5 space-y-3"
      style={{ borderColor: policy.color + "44", background: policy.color + "08" }}
    >
      <div className="flex items-start gap-3">
        <span className="text-2xl">{policy.icon}</span>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded" style={{ background: policy.color + "33", color: policy.color }}>
              REC {policy.num}
            </span>
            <span className="text-white text-sm font-bold">{policy.title}</span>
          </div>
          <p className="text-[11px] text-gray-500 leading-relaxed">{policy.problem}</p>
        </div>
      </div>
      <div className="border-t border-gray-800 pt-3 grid grid-cols-2 gap-3">
        <div>
          <div className="text-[9px] uppercase tracking-widest text-gray-600 mb-1">Intervention</div>
          <p className="text-[10px] text-gray-400 leading-relaxed">{policy.action}</p>
        </div>
        <div>
          <div className="text-[9px] uppercase tracking-widest text-gray-600 mb-1">Social ROI</div>
          <p className="text-[10px] text-gray-400 leading-relaxed">{policy.roi}</p>
        </div>
      </div>
    </div>
  );
}

// ── Personas ──────────────────────────────────────────────────────────────────
function PersonaCard({ p }) {
  const cell = GRID_DATA.find(c => c.id === p.zone);
  return (
    <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-4 space-y-3">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-xl flex items-center justify-center text-sm font-bold flex-shrink-0"
          style={{ background: p.color + "20", border: `2px solid ${p.color}55`, color: p.color }}>
          {p.initials}
        </div>
        <div>
          <div className="text-white font-bold text-sm">{p.name}</div>
          <div className="text-[11px]" style={{ color: p.color }}>{p.year}</div>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-[9px] text-gray-500">Zone {p.zone}</span>
            {cell && (
              <span className="text-[9px] px-1.5 rounded" style={{ background: cell.color + "20", color: cell.color }}>
                {cell.tier}
              </span>
            )}
          </div>
        </div>
      </div>
      <p className="text-[11px] text-gray-400 leading-relaxed">{p.story}</p>
      <div className="grid grid-cols-2 gap-2">
        <div className="rounded-lg bg-gray-950 border border-gray-800 p-2">
          <div className="text-[9px] text-gray-600">RSRP</div>
          <div className="text-red-400 text-xs font-bold">{p.rsrp} dBm</div>
        </div>
        <div className="rounded-lg bg-gray-950 border border-gray-800 p-2">
          <div className="text-[9px] text-gray-600">Peak DL</div>
          <div className="text-red-400 text-xs font-bold">{p.peakDl} Mbps</div>
        </div>
      </div>
      <div className="text-[10px] text-yellow-400 border border-yellow-900 bg-yellow-950/20 rounded px-2 py-1.5 leading-relaxed">
        💸 {p.impact}
      </div>
      <div className="text-[10px] text-gray-500 italic">{p.metric}</div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
export default function Dashboard() {
  const avgNqs = SUMMARY.avgNqs;
  const avgDl  = SUMMARY.avgDl;

  const pieData = [
    { name:"Strong",    value:SUMMARY.strong,   color:"#22c55e" },
    { name:"Weak",      value:SUMMARY.weak,     color:"#f59e0b" },
    { name:"Dead Zone", value:SUMMARY.dead,     color:"#ef4444" },
  ];

  return (
    <div className="h-full overflow-y-auto p-6 space-y-8" style={{ fontFamily: "'Space Mono', monospace" }}>

      {/* ── Page Title ── */}
      <div className="flex items-center gap-4">
        <div className="w-1 h-12 rounded-full bg-cyan-500" />
        <div>
          <h2 className="text-white text-xl font-bold tracking-wider">Network Dashboard</h2>
          <div className="text-gray-600 text-[10px] uppercase tracking-widest">
            JIIT Noida · 27 Cells · L-Shape Boundary · ITU UMC Hackathon 2025–26
          </div>
        </div>
        <div className="ml-auto flex gap-6">
          {[
            { val:avgNqs, label:"Avg NQS", color:"#06b6d4" },
            { val:avgDl,  label:"Avg DL Mbps", color:"#22c55e" },
            { val:SUMMARY.avgHDDI, label:"Avg HDDI", color:"#ef4444" },
          ].map(({ val, label, color }) => (
            <div key={label} className="text-right">
              <div className="text-2xl font-bold" style={{ color }}>{val}</div>
              <div className="text-gray-600 text-[9px] uppercase tracking-widest">{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Coverage Summary Cards ── */}
      <div className="grid grid-cols-3 gap-4">
        <StatCard label="Strong Coverage" value={SUMMARY.strong} color="#22c55e" icon="✓"
          sub={`${Math.round((SUMMARY.strong/TOTAL_CELLS)*100)}% of campus · TRAI claims ${85}%`} />
        <StatCard label="Weak Signal" value={SUMMARY.weak} color="#f59e0b" icon="~"
          sub={`${Math.round((SUMMARY.weak/TOTAL_CELLS)*100)}% · needs improvement`} />
        <StatCard label="Dead Zones" value={SUMMARY.dead} color="#ef4444" icon="✗"
          sub={`${Math.round((SUMMARY.dead/TOTAL_CELLS)*100)}% · TRAI claims 5%`} />
      </div>

      {/* ── TRAI vs Reality ── */}
      <div>
        <SectionHeader icon="📊" title="TRAI Claims vs. Ground Truth" sub="Outdoor propagation model vs. measured indoor reality" badge="Key Finding" />
        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-xl border border-gray-800 bg-gray-900/60 p-4">
            <div className="text-[10px] text-gray-500 uppercase tracking-widest mb-1">Coverage Distribution (Measured)</div>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={85} paddingAngle={3} dataKey="value">
                  {pieData.map(e => <Cell key={e.name} fill={e.color} opacity={0.9} />)}
                </Pie>
                <Tooltip content={<TT />} />
                <Legend formatter={v => <span style={{ color:"#9ca3af", fontSize:"10px" }}>{v}</span>} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="rounded-xl border border-gray-800 bg-gray-900/60 p-4">
            <div className="text-[10px] text-gray-500 uppercase tracking-widest mb-1">TRAI Official vs. Our Measurement</div>
            <div className="text-[10px] text-red-400 mb-3">33–48 percentage-point discrepancy</div>
            <ResponsiveContainer width="100%" height={190}>
              <BarChart data={TRAI_VS_MEASURED} barCategoryGap="28%">
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
                <XAxis dataKey="metric" tick={{ fill:"#6b7280", fontSize:8 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill:"#6b7280", fontSize:8 }} axisLine={false} tickLine={false} unit="%" domain={[0,100]} />
                <Tooltip content={<TT />} />
                <Bar dataKey="trai" name="TRAI Claim" fill="#3b82f6" radius={[3,3,0,0]}>
                  <LabelList dataKey="trai" position="top" style={{ fill:"#60a5fa", fontSize:9 }} formatter={v => `${v}%`} />
                </Bar>
                <Bar dataKey="measured" name="Measured" fill="#f59e0b" radius={[3,3,0,0]}>
                  <LabelList dataKey="measured" position="top" style={{ fill:"#fbbf24", fontSize:9 }} formatter={v => `${v}%`} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* ── HDDI ── */}
      <div>
        <SectionHeader icon="🔍" title="Hidden Digital Desert Index (HDDI)" sub="HDDI = 0.40×IQR + 0.35×TDF + 0.25×App Score · Threshold: 0.65" badge="Novel Index" />
        <div className="grid grid-cols-3 gap-3 mb-4">
          {[
            { label:"Hidden Desert Cells", val:SUMMARY.hddiDeserts, color:"#ef4444", sub:"HDDI > 0.65" },
            { label:"At-Risk Cells",        val:SUMMARY.atRisk,      color:"#f59e0b", sub:"HDDI 0.40–0.65" },
            { label:"Adequate Cells",       val:TOTAL_CELLS - SUMMARY.hddiDeserts - SUMMARY.atRisk, color:"#22c55e", sub:"HDDI < 0.40" },
          ].map(({ label, val, color, sub }) => (
            <div key={label} className="rounded-xl border p-3 text-center" style={{ borderColor: color + "33", background: color + "08" }}>
              <div className="text-[10px] text-gray-500 mb-1">{label}</div>
              <div className="text-3xl font-bold" style={{ color }}>{val}</div>
              <div className="text-[9px] text-gray-600 mt-0.5">{sub}</div>
            </div>
          ))}
        </div>
        <div className="rounded-xl border border-gray-800 bg-gray-900/60 p-4">
          <HDDIGrid />
        </div>
      </div>

      {/* ── Sensitivity Analysis ── */}
      <div>
        <SectionHeader icon="🔬" title="Sensitivity Analysis" sub="Findings robust across all 4 weighting schemes" />
        <div className="rounded-xl border border-gray-800 bg-gray-900/60 p-4">
          <SensitivityTable />
        </div>
      </div>

      {/* ── Temporal Degradation ── */}
      <div>
        <SectionHeader icon="⏱" title="Temporal Digital Desert" sub={`${TEMPORAL_DATA.avgWeakZoneDegradation}% avg peak-hour degradation in weak zones`} />
        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-xl border border-gray-800 bg-gray-900/60 p-4">
            <div className="text-[10px] text-gray-500 uppercase tracking-widest mb-3">Weak Zone Cells — Off-Peak vs 8–10 AM</div>
            <TemporalChart />
            <div className="mt-2 text-[10px] text-gray-600">
              <span className="text-red-400 font-bold">{TEMPORAL_DATA.cellsDroppingBelowEdu}</span> cells drop below 
              education-readiness threshold (5 Mbps) during peak hours that met it off-peak.
            </div>
          </div>
          <div className="rounded-xl border border-gray-800 bg-gray-900/60 p-4">
            <div className="text-[10px] text-gray-500 uppercase tracking-widest mb-3">Application Suitability During Peak (8–10 AM)</div>
            <AppSuitability />
          </div>
        </div>
        <div className="mt-3 grid grid-cols-3 gap-3">
          {[
            { label:"Peak Education-Ready", val:SUMMARY.peakEduReady, total:TOTAL_CELLS, color:"#06b6d4", desc:">5 Mbps DL, <100ms" },
            { label:"Fail All 3 Thresholds", val:SUMMARY.peakNone, total:TOTAL_CELLS, color:"#ef4444", desc:"During academic peak hours" },
            { label:"Education-Readiness Loss", val:TEMPORAL_DATA.cellsDroppingBelowEdu, total:TOTAL_CELLS, color:"#f59e0b", desc:"Off-peak OK → peak FAIL" },
          ].map(({ label, val, total, color, desc }) => (
            <div key={label} className="rounded-xl border p-3" style={{ borderColor: color + "33", background: color + "08" }}>
              <div className="text-[9px] text-gray-500 uppercase tracking-widest">{label}</div>
              <div className="text-3xl font-bold mt-1" style={{ color }}>{val}<span className="text-gray-600 text-sm">/{total}</span></div>
              <div className="text-[9px] text-gray-600">{desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Gender Analysis ── */}
      <div>
        <SectionHeader icon="👩" title="Gender-Disaggregated Analysis" sub="Female occupancy vs. coverage tier" badge="ITU UMC Dimension" />
        <div className="rounded-xl border border-gray-800 bg-gray-900/60 p-4">
          <GenderAnalysis />
        </div>
      </div>

      {/* ── Affordability ── */}
      <div>
        <SectionHeader icon="💸" title="Affordability Burden Analysis" sub="Mobile data spend vs. ITU 2% GNI threshold" badge="ITU UMC Dimension" />
        <div className="rounded-xl border border-gray-800 bg-gray-900/60 p-4">
          <AffordabilityPanel />
        </div>
      </div>

      {/* ── User Personas ── */}
      <div>
        <SectionHeader icon="👤" title="Human Impact — User Personas" sub="Grounded in measured data and survey methodology" />
        <div className="grid grid-cols-3 gap-4">
          {PERSONAS.map(p => <PersonaCard key={p.name} p={p} />)}
        </div>
      </div>

      {/* ── Delhi NCR Scaling ── */}
      <div>
        <SectionHeader icon="🗺" title="Delhi NCR Scaling — District HDDI Proxy" sub="Open data model calibrated from campus ground-truth measurements" badge="National Impact" />
        <div className="rounded-xl border border-gray-800 bg-gray-900/60 p-4">
          <DelhiNCRPanel />
        </div>
      </div>

      {/* ── Policy Recommendations ── */}
      <div>
        <SectionHeader icon="📋" title="Policy Recommendations" sub="4 evidence-grounded interventions with Social ROI estimates" />
        <div className="space-y-4">
          {POLICIES.map(p => <PolicyCard key={p.num} policy={p} />)}
        </div>
      </div>

      {/* ── Worst cells table ── */}
      <div>
        <SectionHeader icon="⚠" title="Worst Performing Cells" sub="Ranked by HDDI score" />
        <div className="rounded-xl border border-gray-800 bg-gray-900/60 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-gray-800">
                  {["Cell","Landmark","HDDI","NQS","RSRP","Peak DL","Peak Lat","Edu-Ready","Gender","Tier"].map(h => (
                    <th key={h} className="px-2 py-2 text-left text-gray-600 font-normal text-[10px] uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[...GRID_DATA].sort((a,b) => b.hddi - a.hddi).slice(0,10).map((c, i) => (
                  <tr key={c.id} className={`border-b border-gray-800/40 ${i%2===0?"":"bg-gray-900/20"}`}>
                    <td className="px-2 py-1.5 font-bold" style={{ color:c.color }}>{c.id}</td>
                    <td className="px-2 py-1.5 text-gray-400 text-[10px] max-w-28 truncate">{c.landmark}</td>
                    <td className="px-2 py-1.5 font-bold" style={{ color:c.hddiColor }}>{c.hddi.toFixed(3)}</td>
                    <td className="px-2 py-1.5 text-white">{c.nqs.toFixed(1)}</td>
                    <td className="px-2 py-1.5 text-gray-400">{c.rsrp}</td>
                    <td className="px-2 py-1.5 text-gray-400">{c.peak.downloadSpeed} Mbps</td>
                    <td className="px-2 py-1.5 text-gray-400">{c.peak.latency} ms</td>
                    <td className="px-2 py-1.5 text-center">
                      <span className={c.peakApp.edu ? "text-green-400" : "text-red-400"}>
                        {c.peakApp.edu ? "✓" : "✗"}
                      </span>
                    </td>
                    <td className="px-2 py-1.5 text-purple-400">{c.female_pct}% ♀</td>
                    <td className="px-2 py-1.5">
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-bold"
                        style={{ background:c.color+"1a", color:c.color }}>{c.tier}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ── Full grid ── */}
      <div>
        <SectionHeader icon="▦" title="All 27 Grid Cells — L-Shape Campus" />
        <div className="rounded-xl border border-gray-800 bg-gray-900/60 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-gray-800">
                  {["Cell","Landmark","HDDI","NQS","RSRP","SINR","DL Mbps","Latency","Peak DL","Degrade","Tier"].map(h => (
                    <th key={h} className="px-2 py-2 text-left text-gray-600 font-normal text-[10px] uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {GRID_DATA.map((c, i) => (
                  <tr key={c.id} className={`border-b border-gray-800/40 ${i%2===0?"":"bg-gray-900/20"}`}>
                    <td className="px-2 py-1.5 font-bold" style={{ color:c.color }}>{c.id}</td>
                    <td className="px-2 py-1.5 text-gray-400 text-[10px] max-w-28 truncate">{c.landmark}</td>
                    <td className="px-2 py-1.5 font-bold text-[11px]" style={{ color:c.hddiColor }}>{c.hddi.toFixed(3)}</td>
                    <td className="px-2 py-1.5 text-white">{c.nqs.toFixed(1)}</td>
                    <td className="px-2 py-1.5 text-gray-400">{c.rsrp}</td>
                    <td className="px-2 py-1.5 text-gray-400">{c.sinr}</td>
                    <td className="px-2 py-1.5 text-gray-400">{c.downloadSpeed}</td>
                    <td className="px-2 py-1.5 text-gray-400">{c.latency} ms</td>
                    <td className="px-2 py-1.5 text-gray-400">{c.peak.downloadSpeed}</td>
                    <td className="px-2 py-1.5 text-red-400">{c.peak.degradeFactor}%</td>
                    <td className="px-2 py-1.5">
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-bold"
                        style={{ background:c.color+"1a", color:c.color }}>{c.tier}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="text-center text-gray-800 text-[10px] pb-4">
        JIIT Campus Network Monitor · Team QBits · ITU UMC Data Hackathon 2025–26 · ECE Dept · Academic Project
      </div>
    </div>
  );
}
