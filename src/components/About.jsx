const TEAM = [
  { name:"Apoorv Adarsh",   role:"Lead Developer",     focus:"RF Data Simulation · Map Integration · ETL Pipeline", initials:"AA", color:"#06b6d4" },
  { name:"Aditya Jain",  role:"Data Analyst",       focus:"HDDI Modelling · Sensitivity Analysis · Dashboard Design", initials:"KS", color:"#8b5cf6" },
  { name:"Tarun Bansal",  role:"Systems Architect",  focus:"Grid Framework · Coverage Tier Logic · Delhi NCR Scaling", initials:"PP", color:"#f59e0b" },
];

const LAYERS = [
  {
    num:"01", color:"#06b6d4", icon:"📡",
    title:"Ground-Truth Measurement Engine",
    desc:"Campus Network Grid Monitoring System — 27-cell GPS-tagged walk-test using PlutoSDR (ADALM-PLUTO) + Quectel RM520N-GL 5G modem across 3 temporal sessions (off-peak, 8–10 AM peak, 6–9 PM peak). Collects RSRP, SINR, download/upload speed, latency per cell.",
  },
  {
    num:"02", color:"#a78bfa", icon:"🔍",
    title:"Hidden Digital Desert Index (HDDI)",
    desc:"Novel composite metric: HDDI = 0.40×IQR + 0.35×TDF + 0.25×App Score. Indoor Quality Ratio + Temporal Degradation Factor + Application Suitability Score. Validated via sensitivity analysis across 4 weighting schemes. Cells scoring >0.65 classified as Hidden Digital Deserts.",
  },
  {
    num:"03", color:"#22c55e", icon:"🗺",
    title:"Policy Targeting Platform",
    desc:"Interactive dashboard + district-level HDDI proxy choropleth for Delhi NCR using Tarang Sanchar, TRAI QoS reports, Ookla Open Data, and OpenStreetMap. Identifies ~720,000 students in hidden digital deserts. 4 policy recommendations with Social ROI estimates.",
  },
];

const UMC_DIMS = [
  { dim:"Connection Quality",    metric:"RSRP, SINR per cell",          finding:"22% dead zones; avg strong: −73 dBm; avg dead: −113 dBm" },
  { dim:"Availability for Use",  metric:"Peak-hour degradation factor",  finding:"Avg 58% speed drop in weak zones at 8–10 AM academic peak" },
  { dim:"Affordability",         metric:"Mobile spend vs. ITU 2% GNI",   finding:"Dual-SIM workaround users spend 3.6–6.7% of household income" },
  { dim:"Devices",               metric:"Application suitability score",  finding:"6 cells fail all 3 thresholds (edu/health/work) during peak" },
  { dim:"Digital Skills",        metric:"Survey: task completion barriers","finding":"Students report connectivity blocks academic tasks 3+ times/month" },
  { dim:"Safety & Security",     metric:"TRAI claim vs. measured reality", finding:"TRAI: 85–100% strong; Actual: 52% strong, 22% dead — 33–48 pp gap" },
];

function Avatar({ initials, color }) {
  return (
    <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-xl font-bold tracking-wider"
      style={{ background:color+"18", border:`2px solid ${color}55`, color, fontFamily:"'Space Mono', monospace" }}>
      {initials}
    </div>
  );
}

export default function About() {
  return (
    <div className="h-full overflow-y-auto p-8" style={{ fontFamily:"'Space Mono', monospace" }}>
      <div className="max-w-4xl mx-auto space-y-8">

        {/* ── Header ── */}
        <div className="text-center space-y-3 pt-4">
          <div className="inline-flex items-center gap-2 text-[10px] uppercase tracking-widest text-cyan-600 border border-cyan-800 px-3 py-1 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse" />
            ECE Department · JIIT Noida
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">
            Campus Network Grid<br />
            <span className="text-cyan-400">Monitoring System</span>
          </h1>
          <div className="flex justify-center gap-3 flex-wrap mt-2">
            <span className="text-[10px] px-3 py-1 rounded-full border border-purple-800 text-purple-400">
              🏆 ITU UMC Data Hackathon 2025–26
            </span>
            <span className="text-[10px] px-3 py-1 rounded-full border border-green-800 text-green-400">
              Bridging the Digital Divide
            </span>
            <span className="text-[10px] px-3 py-1 rounded-full border border-yellow-800 text-yellow-400">
              Team QBits
            </span>
          </div>
          <p className="text-gray-500 text-sm leading-relaxed max-w-2xl mx-auto mt-3">
            Engineered Innovation Layer — ITU UMC Data Hackathon 2025–2026
            "Bridging the Digital Divide by Uncovering Hidden Digital Deserts."
          </p>
        </div>

        <div className="border-t border-gray-800" />

        {/* ── ITU Mentor confirmation ── */}
        <div className="rounded-2xl border border-purple-900 bg-purple-950/20 p-5">
          <div className="text-[10px] uppercase tracking-widest text-purple-500 mb-2">ITU Hackathon Mentor — Confirmed Integration</div>
          <blockquote className="text-gray-300 text-sm leading-relaxed italic border-l-2 border-purple-600 pl-4">
            "The Campus Network Grid Monitoring System can serve as a strong validation and data-generation layer
            that reinforces the analytical model. This kind of integration — combining macro-level modelling with
            micro-level ground-truthing — can strengthen the overall impact of the submission."
          </blockquote>
          <div className="mt-3 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold"
              style={{ background:"#a78bfa20", border:"1px solid #a78bfa44", color:"#a78bfa" }}>ME</div>
            <div>
              <div className="text-purple-400 text-xs font-bold">Ms. Esperanza Magpantay</div>
              <div className="text-gray-600 text-[10px]">ITU · Hackathon Mentor · Written correspondence, 5 May 2026</div>
            </div>
          </div>
        </div>

        {/* ── Three-Layer Architecture ── */}
        <div>
          <h2 className="text-xs uppercase tracking-widest text-gray-500 mb-4">Three-Layer Integrated Architecture</h2>
          <div className="space-y-3">
            {LAYERS.map(l => (
              <div key={l.num} className="rounded-2xl border p-4 flex gap-4"
                style={{ borderColor:l.color+"44", background:l.color+"0a" }}>
                <div className="flex-shrink-0 text-2xl">{l.icon}</div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[9px] px-1.5 py-0.5 rounded font-bold"
                      style={{ background:l.color+"33", color:l.color }}>Layer {l.num}</span>
                    <span className="text-white font-bold text-sm">{l.title}</span>
                  </div>
                  <p className="text-gray-500 text-[11px] leading-relaxed">{l.desc}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-3 flex items-center gap-2 text-[10px] text-gray-600 px-2">
            <span className="text-cyan-400">[Campus Hardware]</span>
            <span>→ calibrates HDDI thresholds →</span>
            <span className="text-purple-400">[Analytical Model]</span>
            <span>→ scales to NCR →</span>
            <span className="text-green-400">[Policy Platform]</span>
            <span>→ 4 recommendations</span>
          </div>
        </div>

        <div className="border-t border-gray-800" />

        {/* ── ITU UMC Alignment Table ── */}
        <div>
          <h2 className="text-xs uppercase tracking-widest text-gray-500 mb-4">Alignment with ITU UMC Framework</h2>
          <div className="rounded-xl border border-gray-800 overflow-hidden">
            <table className="w-full text-[11px]">
              <thead>
                <tr className="border-b border-gray-800 bg-gray-900/60">
                  {["ITU UMC Dimension","Measurement Metric","Campus Finding"].map(h => (
                    <th key={h} className="px-3 py-2 text-left text-gray-500 font-normal text-[10px] uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {UMC_DIMS.map((r, i) => (
                  <tr key={r.dim} className={`border-b border-gray-800/50 ${i%2===0?"":"bg-gray-900/20"}`}>
                    <td className="px-3 py-2 text-cyan-400 font-bold text-[10px]">{r.dim}</td>
                    <td className="px-3 py-2 text-gray-400">{r.metric}</td>
                    <td className="px-3 py-2 text-gray-300">{r.finding}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="border-t border-gray-800" />

        {/* ── Team ── */}
        <div>
          <h2 className="text-xs uppercase tracking-widest text-gray-500 mb-5 text-center">Project Team</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {TEAM.map(member => (
              <div key={member.name}
                className="rounded-2xl border border-gray-800 bg-gray-900/60 p-5 flex flex-col items-center text-center gap-3 hover:border-gray-700 transition-colors">
                <Avatar initials={member.initials} color={member.color} />
                <div>
                  <div className="text-white font-bold text-sm">{member.name}</div>
                  <div className="text-[11px] mt-0.5" style={{ color:member.color }}>{member.role}</div>
                  <div className="text-gray-600 text-[10px] mt-1.5 leading-relaxed">{member.focus}</div>
                </div>
              </div>
            ))}
          </div>
        </div>


        {/* ── Tech Stack ── */}
        <div>
          <h2 className="text-xs uppercase tracking-widest text-gray-500 mb-4">Technical Stack</h2>
          <div className="grid grid-cols-2 gap-3">
            {[
              ["Frontend",       "React 18 + Vite"],
              ["Styling",        "Tailwind CSS"],
              ["Map Engine",     "Leaflet.js"],
              ["Charts",         "Recharts"],
              ["Grid Size",      "27 cells (L-shape)"],
              ["Coverage",       "JIIT Noida Campus"],
              ["Center",         "28.5358°N, 77.3910°E"],
              ["Data",           "Simulated / RF-modelled"],
              ["Hardware",       "PlutoSDR + Quectel RM520N-GL"],
              ["Sessions",       "Off-peak · 8–10 AM · 6–9 PM"],
              ["Index",          "HDDI (novel composite)"],
              ["Scaling",        "Delhi NCR — 14 districts"],
            ].map(([k,v]) => (
              <div key={k} className="flex justify-between items-center border border-gray-800 rounded-lg px-3 py-2 text-xs">
                <span className="text-gray-600 uppercase tracking-wider text-[10px]">{k}</span>
                <span className="text-cyan-400">{v}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="text-center text-gray-800 text-[10px] pb-4">
         Academic Project 2025–26 · ITU UMC Hackathon Team QBits
        </div>
      </div>
    </div>
  );
}
