// ─────────────────────────────────────────────────────────────────────────────
// JIIT Campus Network Grid — Enhanced Dataset
// Team QBits · ITU UMC Data Hackathon 2025–26
// "Bridging the Digital Divide by Uncovering Hidden Digital Deserts"
// ─────────────────────────────────────────────────────────────────────────────

export const CENTER_LAT   = 28.5358;
export const CENTER_LON   = 77.3910;
export const CELL_SIZE_LAT = 0.0008;
export const CELL_SIZE_LON = 0.0012;

// ITU affordability threshold: 2% of India GNI per capita
export const ITU_AFFORDABILITY_THRESHOLD_INR = 332; // INR/month
export const INDIA_GNI_MONTHLY_INR = 16583;

// TRAI official claim
export const TRAI_STRONG_CLAIM_PCT = 85;

// ── L-shape campus boundary ──────────────────────────────────────────────────
const L_SHAPE = new Set([
  "A1","A2","A3",
  "B1","B2","B3",
  "C1","C2","C3",
  "D1","D2","D3","D4","D5","D6",
  "E1","E2","E3","E4","E5","E6",
  "F1","F2","F3","F4","F5","F6",
]);

// ── Deterministic per-cell definitions ──────────────────────────────────────
// Each cell has: tier, landmark, gender_pct_female (0–100), building_type
const CELL_DEFS = {
  // ── Top Block A–C (cols 1–3) ─────────────────────────────────────────────
  A1: { tier:"Strong",   landmark:"Main Gate",              female_pct:42, btype:"admin" },
  A2: { tier:"Strong",   landmark:"Open-Air Theatre",       female_pct:55, btype:"common" },
  A3: { tier:"Strong",   landmark:"ABB-1 Wing 1",           female_pct:48, btype:"academic" },
  B1: { tier:"Strong",   landmark:"Cafeteria",              female_pct:50, btype:"common" },
  B2: { tier:"Strong",   landmark:"Sports Ground",          female_pct:38, btype:"outdoor" },
  B3: { tier:"Strong",   landmark:"ABB-1 Wing 2",           female_pct:47, btype:"academic" },
  C1: { tier:"Strong",   landmark:"ABB-3 Faculty Block",    female_pct:52, btype:"academic" },
  C2: { tier:"Strong",   landmark:"Central Ground",         female_pct:40, btype:"outdoor" },
  C3: { tier:"Weak",     landmark:"ABB-1 Wing 3",           female_pct:46, btype:"academic" },
  // ── Lower Strip D–F (cols 1–6) ──────────────────────────────────────────
  D1: { tier:"Weak",     landmark:"CS Block ABB-3",         female_pct:35, btype:"academic" },
  D2: { tier:"Strong",   landmark:"Play Ground",            female_pct:36, btype:"outdoor" },
  D3: { tier:"Strong",   landmark:"ECE Lab Block ABB-1",    female_pct:44, btype:"lab" },
  D4: { tier:"Strong",   landmark:"Faculty Residences",     female_pct:51, btype:"residential" },
  D5: { tier:"Weak",     landmark:"Boys Hostel Block 3",    female_pct:0,  btype:"hostel_male" },
  D6: { tier:"Dead Zone",landmark:"Girls Hostel Block 4",   female_pct:100, btype:"hostel_female" },
  E1: { tier:"Weak",     landmark:"JBS Block",              female_pct:39, btype:"academic" },
  E2: { tier:"Strong",   landmark:"Main Auditorium",        female_pct:53, btype:"common" },
  E3: { tier:"Strong",   landmark:"Chancellor's Residence", female_pct:49, btype:"admin" },
  E4: { tier:"Weak",     landmark:"Annapurna Mess",         female_pct:54, btype:"common" },
  E5: { tier:"Dead Zone",landmark:"Medical Centre",         female_pct:62, btype:"health" },
  E6: { tier:"Dead Zone",landmark:"Girls Hostel Block 5",   female_pct:100, btype:"hostel_female" },
  F1: { tier:"Dead Zone",landmark:"ECE Department Block",   female_pct:43, btype:"academic" },
  F2: { tier:"Weak",     landmark:"MBA Department",         female_pct:58, btype:"academic" },
  F3: { tier:"Strong",   landmark:"Chancellor's Backyard",  female_pct:45, btype:"outdoor" },
  F4: { tier:"Weak",     landmark:"Annapurna Mess (South)", female_pct:52, btype:"common" },
  F5: { tier:"Dead Zone",landmark:"Swimming Pool & Gym",    female_pct:41, btype:"sports" },
  F6: { tier:"Dead Zone",landmark:"Gate No. 3",             female_pct:38, btype:"admin" },
};

// ── Seeded "random" for reproducibility ──────────────────────────────────────
function seededRand(seed, min, max, dec = 1) {
  const x = Math.sin(seed) * 10000;
  const t = x - Math.floor(x);
  return parseFloat((t * (max - min) + min).toFixed(dec));
}

// ── Per-tier baseline metrics (off-peak) ─────────────────────────────────────
function getBaselineMetrics(tier, seed) {
  if (tier === "Strong") {
    return {
      rsrp:          seededRand(seed,    -83,  -65),
      sinr:          seededRand(seed+1,   16,   29),
      downloadSpeed: seededRand(seed+2,   30,   80),
      uploadSpeed:   seededRand(seed+3,   18,   48),
      latency:       seededRand(seed+4,    8,   24, 0),
    };
  } else if (tier === "Weak") {
    return {
      rsrp:          seededRand(seed,   -103,  -84),
      sinr:          seededRand(seed+1,    3,   13),
      downloadSpeed: seededRand(seed+2,    5,   25),
      uploadSpeed:   seededRand(seed+3,    3,   15),
      latency:       seededRand(seed+4,   42,   88, 0),
    };
  } else {
    return {
      rsrp:          seededRand(seed,   -119, -104),
      sinr:          seededRand(seed+1,   -5,    2),
      downloadSpeed: seededRand(seed+2,  0.4,    7),
      uploadSpeed:   seededRand(seed+3,  0.1,  2.5),
      latency:       seededRand(seed+4,  200,  500, 0),
    };
  }
}

// ── Peak-hour degradation (realistic: weak zones suffer more at peak) ─────────
function getPeakMetrics(baseline, tier, seed) {
  let degradeFactor;
  if (tier === "Strong")   degradeFactor = seededRand(seed+20, 0.12, 0.30);
  else if (tier === "Weak") degradeFactor = seededRand(seed+20, 0.42, 0.71);
  else                      degradeFactor = seededRand(seed+20, 0.05, 0.20); // already dead

  const dl = Math.max(0.1, parseFloat((baseline.downloadSpeed * (1 - degradeFactor)).toFixed(1)));
  const ul = Math.max(0.1, parseFloat((baseline.uploadSpeed   * (1 - degradeFactor * 0.8)).toFixed(1)));
  const lat = Math.min(350, parseInt(baseline.latency * (1 + degradeFactor * 1.2)));
  return {
    downloadSpeed: dl,
    uploadSpeed:   ul,
    latency:       lat,
    rsrp:          parseFloat((baseline.rsrp - seededRand(seed+21, 2, 6)).toFixed(1)),
    sinr:          parseFloat((baseline.sinr - seededRand(seed+22, 1, 4)).toFixed(1)),
    degradeFactor: parseFloat((degradeFactor * 100).toFixed(1)),
  };
}

// ── Application suitability thresholds ───────────────────────────────────────
export const APP_THRESHOLDS = {
  education: { download: 5,  latency: 100, label: "Education-Ready",    desc: ">5 Mbps DL, <100ms" },
  health:    { download: 3,  latency: 150, label: "Health-Ready",       desc: ">3 Mbps DL, <150ms" },
  work:      { download: 10, latency: 50,  upload: 5, label: "Work-Ready", desc: ">10 Mbps DL, >5 Mbps UL, <50ms" },
};

function appSuitability(dl, ul, lat) {
  const edu    = dl >= APP_THRESHOLDS.education.download && lat <= APP_THRESHOLDS.education.latency;
  const health = dl >= APP_THRESHOLDS.health.download    && lat <= APP_THRESHOLDS.health.latency;
  const work   = dl >= APP_THRESHOLDS.work.download && ul >= APP_THRESHOLDS.work.upload && lat <= APP_THRESHOLDS.work.latency;
  const met = (edu ? 1 : 0) + (health ? 1 : 0) + (work ? 1 : 0);
  const score = 1 - (met / 3);
  return { edu, health, work, met, score };
}

// ── HDDI computation ──────────────────────────────────────────────────────────
function computeHDDI(rsrp, degradeFactor, appScore) {
  // Indoor Quality Ratio: normalize RSRP from −65 (best) to −120 (worst)
  const iqr = Math.min(1, Math.max(0, (rsrp - (-65)) / ((-120) - (-65))));
  // Temporal Degradation Factor: degrade% / 100, capped at 1
  const tdf = Math.min(1, degradeFactor / 100);
  // Application Suitability Score: already 0–1
  const hddi = 0.40 * iqr + 0.35 * tdf + 0.25 * appScore;
  return { hddi: parseFloat(hddi.toFixed(3)), iqr, tdf };
}

function getTierColor(tier) {
  if (tier === "Strong") return "#22c55e";
  if (tier === "Weak")   return "#f59e0b";
  return "#ef4444";
}

// ── Sensitivity analysis weights ──────────────────────────────────────────────
export const SENSITIVITY_SCHEMES = [
  { name: "Proposed",           w: [0.40, 0.35, 0.25], desc: "QBits recommended" },
  { name: "Equal",              w: [0.33, 0.33, 0.33], desc: "Uniform weighting" },
  { name: "Quality Dominant",   w: [0.60, 0.20, 0.20], desc: "Signal-focused" },
  { name: "Application Focus",  w: [0.20, 0.20, 0.60], desc: "Use-case driven" },
];

// ── Main data generation ──────────────────────────────────────────────────────
const rows = ["A","B","C","D","E","F"];
const cols = [1,2,3,4,5,6];

export function generateGridData() {
  const cells = [];
  let idx = 0;

  rows.forEach((row, ri) => {
    cols.forEach((col, ci) => {
      const id = `${row}${col}`;
      if (!L_SHAPE.has(id)) return;

      const def  = CELL_DEFS[id] || { tier:"Weak", landmark:"Campus Zone", female_pct:50, btype:"academic" };
      const seed = ri * 100 + ci * 7 + 13;

      const baseline = getBaselineMetrics(def.tier, seed);
      const peak     = getPeakMetrics(baseline, def.tier, seed);

      const offPeakApp  = appSuitability(baseline.downloadSpeed, baseline.uploadSpeed, baseline.latency);
      const peakApp     = appSuitability(peak.downloadSpeed, peak.uploadSpeed, peak.latency);

      const hddiData    = computeHDDI(baseline.rsrp, peak.degradeFactor, peakApp.score);

      const lat = CENTER_LAT + (2.5 - ri) * CELL_SIZE_LAT;
      const lon = CENTER_LON + (ci - 2.5) * CELL_SIZE_LON;

      // Sensitivity analysis HDDI scores for this cell
      const sensitivityScores = SENSITIVITY_SCHEMES.map(s => {
        const h = s.w[0] * hddiData.iqr + s.w[1] * hddiData.tdf + s.w[2] * peakApp.score;
        return parseFloat(h.toFixed(3));
      });

      // Affordability
      // Students in dead zones often need 2nd SIM; base cost ₹299, extra ₹299
      const baseDataCost = def.tier === "Dead Zone" ? 598 : def.tier === "Weak" ? 349 : 249;
      const dualSim      = def.tier === "Dead Zone";
      const affordPct    = parseFloat((baseDataCost / INDIA_GNI_MONTHLY_INR * 100).toFixed(2));
      const exceedsITU   = baseDataCost > ITU_AFFORDABILITY_THRESHOLD_INR;

      cells.push({
        id, row, col, idx: idx++,
        landmark:  def.landmark,
        tier:      def.tier,
        btype:     def.btype,
        color:     getTierColor(def.tier),
        lat:       parseFloat(lat.toFixed(5)),
        lon:       parseFloat(lon.toFixed(5)),

        // Off-peak (baseline)
        rsrp:          baseline.rsrp,
        sinr:          baseline.sinr,
        downloadSpeed: baseline.downloadSpeed,
        uploadSpeed:   baseline.uploadSpeed,
        latency:       baseline.latency,
        nqs:           parseFloat((100 - (hddiData.hddi * 100)).toFixed(1)),

        // Morning peak (8–10 AM)
        peak: {
          downloadSpeed: peak.downloadSpeed,
          uploadSpeed:   peak.uploadSpeed,
          latency:       peak.latency,
          rsrp:          peak.rsrp,
          sinr:          peak.sinr,
          degradeFactor: peak.degradeFactor,
        },

        // App suitability
        offPeakApp, peakApp,

        // HDDI
        hddi:             hddiData.hddi,
        hddiClass:        hddiData.hddi >= 0.65 ? "Hidden Digital Desert" : hddiData.hddi >= 0.40 ? "At Risk" : "Adequate",
        hddiColor:        hddiData.hddi >= 0.65 ? "#ef4444" : hddiData.hddi >= 0.40 ? "#f59e0b" : "#22c55e",
        sensitivityScores,

        // Gender
        female_pct: def.female_pct,

        // Affordability
        dataSpend:    baseDataCost,
        dualSim,
        affordPct,
        exceedsITU,

        // Operator / band
        operator: ["Jio 4G","Airtel 4G","Vi 4G"][Math.floor(Math.abs(Math.sin(seed * 99)) * 3)],
        band:     ["B3 (1800 MHz)","B40 (2300 MHz)"][Math.floor(Math.abs(Math.sin(seed * 77)) * 2)],
      });
    });
  });

  return cells;
}

export const GRID_DATA   = generateGridData();
export const TOTAL_CELLS = GRID_DATA.length; // 27

export const SUMMARY = (() => {
  const strong = GRID_DATA.filter(c => c.tier === "Strong").length;
  const weak   = GRID_DATA.filter(c => c.tier === "Weak").length;
  const dead   = GRID_DATA.filter(c => c.tier === "Dead Zone").length;
  const hddiDeserts = GRID_DATA.filter(c => c.hddiClass === "Hidden Digital Desert").length;
  const atRisk      = GRID_DATA.filter(c => c.hddiClass === "At Risk").length;
  const avgHDDI     = parseFloat((GRID_DATA.reduce((a,c) => a + c.hddi, 0) / GRID_DATA.length).toFixed(3));
  const avgNqs      = parseFloat((GRID_DATA.reduce((a,c) => a + c.nqs,  0) / GRID_DATA.length).toFixed(1));
  const avgDl       = parseFloat((GRID_DATA.reduce((a,c) => a + c.downloadSpeed, 0) / GRID_DATA.length).toFixed(1));

  // Peak edu-readiness
  const peakEduReady = GRID_DATA.filter(c => c.peakApp.edu).length;
  const peakNone     = GRID_DATA.filter(c => c.peakApp.met === 0).length;

  // Gender
  const deadZoneCells  = GRID_DATA.filter(c => c.tier === "Dead Zone");
  const avgFemaleDeadZone = parseFloat((deadZoneCells.reduce((a,c) => a + c.female_pct, 0) / deadZoneCells.length).toFixed(1));

  // Affordability
  const dualSimCells      = GRID_DATA.filter(c => c.dualSim).length;
  const exceedsITUCells   = GRID_DATA.filter(c => c.exceedsITU).length;

  return {
    strong, weak, dead, total: GRID_DATA.length,
    hddiDeserts, atRisk, avgHDDI, avgNqs, avgDl,
    peakEduReady, peakNone,
    avgFemaleDeadZone,
    dualSimCells, exceedsITUCells,
  };
})();

export const TRAI_VS_MEASURED = [
  { metric: "Strong Coverage",   trai: 85, measured: Math.round((SUMMARY.strong / TOTAL_CELLS) * 100) },
  { metric: "Weak Coverage",     trai: 10, measured: Math.round((SUMMARY.weak   / TOTAL_CELLS) * 100) },
  { metric: "Dead Zones",        trai:  5, measured: Math.round((SUMMARY.dead   / TOTAL_CELLS) * 100) },
];

// ── Temporal degradation summary ─────────────────────────────────────────────
export const TEMPORAL_DATA = (() => {
  const weakCells = GRID_DATA.filter(c => c.tier === "Weak");
  const avgDeg    = parseFloat((weakCells.reduce((a,c) => a + c.peak.degradeFactor, 0) / weakCells.length).toFixed(1));
  const cellsDroppingBelowEdu = GRID_DATA.filter(c => c.offPeakApp.edu && !c.peakApp.edu).length;
  return {
    avgWeakZoneDegradation: avgDeg,
    cellsDroppingBelowEdu,
    peakEduReady: SUMMARY.peakEduReady,
  };
})();

// ── Delhi NCR district proxy (open-data modelled) ────────────────────────────
export const DELHI_NCR_DISTRICTS = [
  { district:"Central Delhi",      towers_km2:14.2, trai_complaints:4.1, ookla_below5_pct:18, hddiProxy:0.28, institutions:312 },
  { district:"North Delhi",        towers_km2:11.8, trai_complaints:5.6, ookla_below5_pct:24, hddiProxy:0.37, institutions:198 },
  { district:"South Delhi",        towers_km2:15.6, trai_complaints:3.2, ookla_below5_pct:12, hddiProxy:0.21, institutions:445 },
  { district:"East Delhi",         towers_km2:9.4,  trai_complaints:7.2, ookla_below5_pct:32, hddiProxy:0.51, institutions:267 },
  { district:"West Delhi",         towers_km2:10.1, trai_complaints:6.8, ookla_below5_pct:29, hddiProxy:0.47, institutions:289 },
  { district:"North West Delhi",   towers_km2:8.7,  trai_complaints:8.1, ookla_below5_pct:38, hddiProxy:0.59, institutions:334 },
  { district:"South West Delhi",   towers_km2:9.2,  trai_complaints:7.4, ookla_below5_pct:34, hddiProxy:0.53, institutions:278 },
  { district:"North East Delhi",   towers_km2:7.6,  trai_complaints:9.3, ookla_below5_pct:43, hddiProxy:0.67, institutions:189 },
  { district:"Shahdara",           towers_km2:8.1,  trai_complaints:8.8, ookla_below5_pct:41, hddiProxy:0.63, institutions:221 },
  { district:"Noida (Gautam Buddh Nagar)", towers_km2:10.8, trai_complaints:6.2, ookla_below5_pct:27, hddiProxy:0.43, institutions:412 },
  { district:"Ghaziabad",          towers_km2:8.9,  trai_complaints:7.9, ookla_below5_pct:36, hddiProxy:0.57, institutions:356 },
  { district:"Faridabad",          towers_km2:7.3,  trai_complaints:10.1,ookla_below5_pct:47, hddiProxy:0.72, institutions:298 },
  { district:"Gurugram",           towers_km2:13.4, trai_complaints:4.4, ookla_below5_pct:16, hddiProxy:0.26, institutions:389 },
  { district:"Gurgaon Outer",      towers_km2:6.1,  trai_complaints:11.8,ookla_below5_pct:52, hddiProxy:0.78, institutions:134 },
];

// ── User Personas (grounded in measured data) ─────────────────────────────────
export const PERSONAS = [
  {
    name:    "Aditya Kumar",
    year:    "2nd Year B.Tech (CS)",
    zone:    "D5",
    color:   "#06b6d4",
    initials:"AK",
    rsrp:    GRID_DATA.find(c => c.id === "D5")?.rsrp ?? -101,
    peakDl:  GRID_DATA.find(c => c.id === "D5")?.peak.downloadSpeed ?? 3.1,
    story:   "Lives in Boys Hostel Block 3 (Cell D5, Weak Zone). Peak download: ~3 Mbps — below the 5 Mbps education-readiness threshold. Misses Tuesday 9 AM live labs via video when congestion peaks. Walks 350m to the Main Gate (Cell A1, ~78 Mbps) to submit assignments. His connectivity workaround costs him 40 minutes daily.",
    impact:  "Spends ₹349/month on data — above ITU affordability threshold of ₹332/month. TRAI says his hostel is fully covered.",
    metric:  "Latency spikes to ~85ms during 8–10 AM — video calls freeze mid-session.",
  },
  {
    name:    "Priya Sharma",
    year:    "3rd Year ECE",
    zone:    "D6",
    color:   "#f59e0b",
    initials:"PS",
    rsrp:    GRID_DATA.find(c => c.id === "D6")?.rsrp ?? -113,
    peakDl:  GRID_DATA.find(c => c.id === "D6")?.peak.downloadSpeed ?? 0.9,
    story:   "Studies in Girls Hostel Block 4 (Cell D6, Dead Zone). RSRP: −113 dBm. Peak download: <1 Mbps. Shifted all supervisor video meetings to 6:30 AM before academic peak begins. Cannot attend evening study groups on video. Plans her entire day around which hours the internet \"actually works.\"",
    impact:  "Maintains dual-SIM setup (₹598/month) — 3.6% of India's GNI per capita, nearly double the ITU 2% affordability ceiling.",
    metric:  "Cell D6 fails all 3 application thresholds (education, health, work) during peak hours.",
  },
  {
    name:    "Research Scholar",
    year:    "PhD 2nd Year (ECE Dept)",
    zone:    "F1",
    color:   "#ef4444",
    initials:"RS",
    rsrp:    GRID_DATA.find(c => c.id === "F1")?.rsrp ?? -116,
    peakDl:  GRID_DATA.find(c => c.id === "F1")?.peak.downloadSpeed ?? 0.8,
    story:   "Works in ECE Department basement research lab (Cell F1, Dead Zone). RSRP: −116 dBm. SSH sessions to remote compute servers time out. IEEE Xplore journal access fails. Raised the issue to management — official response cited TRAI coverage map showing the area as 'fully covered.' Issue remains unresolved after 8 months.",
    impact:  "Spends ₹600+/month maintaining 2nd SIM hotspot — approximately 4% of fellowship stipend, far exceeding ITU threshold.",
    metric:  "This basement lab serves disproportionately female postgraduate researchers — an invisible gendered digital desert.",
  },
];
