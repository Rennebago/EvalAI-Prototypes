// ---------- Data (from Figma node 3492:11768) ----------
const KPIS = [
  { label: "Call Behavior", title: "Avg. Scoring", now: "63.75%", nowTone: "accent", prev: "57.33%", prevTone: "warning" },
  { label: "Avg.", title: "Connect-to-Close", now: "78%", nowTone: "positive", prev: "67%", prevTone: "warning" },
  { label: "Overall", title: "Close Rate", now: "82%", nowTone: "positive", prev: "78%", prevTone: "accent" },
  { label: "Avg.", title: "Call handle time", now: "82%", nowTone: "positive", prev: "78%", prevTone: "accent" },
  { label: "Avg.", title: "ACE scoring", now: "5.3%", nowTone: "positive", prev: "3.2%", prevTone: "warning" },
];

// Call Behavior rows 1-8 come from the design; every other row is generated (see stepsFor).
const STEPS_BASE = [
  { step: "Opening", floor: 82.5, avg: 82.5, c2c: 54.17, connects: 234, top: "Ryan Atwood", bottom: "Julie Cooper", trend: 4.17 },
  { step: "Validation", floor: 54.17, avg: 74.17, c2c: 54.17, connects: 234, top: "Seth Cohen", bottom: "Sandy Cohen", trend: 7.32 },
  { step: "Relatability", floor: 82.5, avg: 97.5, c2c: 54.17, connects: 234, top: "Marissa Cooper", bottom: "Kirsten Cohen", trend: -2.22 },
  { step: "Patience", floor: 94.17, avg: 82.5, c2c: 54.17, connects: 234, top: "Lucas Scott", bottom: "Dan Scott", trend: -4.17 },
  { step: "Call Flow", floor: 62.5, avg: 54.17, c2c: 54.17, connects: 234, top: "Summer Roberts", bottom: "Luke Ward", trend: -5.11 },
  { step: "Visual Aids", floor: 94.17, avg: 35.11, c2c: 54.17, connects: 234, top: "Nathan Scott", bottom: "Keith Scott", trend: 7.88 },
  { step: "Simplifying", floor: 82.5, avg: 54.17, c2c: 54.17, connects: 234, top: "Brooke Davis", bottom: "Rachel Gatina", trend: -9.33 },
  { step: "Expectations", floor: 84.17, avg: 15.71, c2c: 54.17, connects: 234, top: "Peyton Sawyer", bottom: "Mouth McFadden", trend: 4.17 },
];

// Source: EvalAI/Playbooks.md. Call Behavior and Program Summary categories double as call steps;
// Sales has 5 categories, each with call steps (shown as "Category: Step").
const PLAYBOOK_DEFS = {
  "Call Behavior": {
    categories: ["Opening", "Validation", "Relatability", "Patience", "Call Flow", "Visual Aids", "Simplifying", "Expectations", "Objection Handling", "Goal Alignment", "Customization", "Benefits", "Urgency", "Fees", "Credibility", "Competitors", "Follow through", "Loan Reframe"],
  },
  "FDR/ADR Sales": {
    groups: {
      Connect: ["Intro", "Role", "Agenda"],
      Learn: ["Suggest Sales Demo", "Discuss the past", "Identify the Hardship", "Assess financial standing", "Credit review"],
      Options: ["Min. payments", "Consolidation Loan", "Credit Counseling", "Bankruptcy", "Debt relief"],
      Sell: ["Provide Personalized Solution", "How it works", "Overcoming objections", "Tie Back to Debt Settlement Benefits", "Discuss Income (Full CFA)", "Discuss Expenses (Full CFA)"],
      Expectations: ["Set expectations"],
    },
  },
  "Program Summary": {
    categories: ["Client verification", "Great news", "Launch PSC Email", "Client settlement roadmap", "Account numbers", "UW Coordinate", "PSC recording", "POR enrollment process", "3-day hold (CA only)", "Transfer to Welcome call"],
  },
};
const cats = () => {
  const d = PLAYBOOK_DEFS[state.playbook];
  return d.categories || Object.keys(d.groups);
};
const stepLabels = () => {
  const d = PLAYBOOK_DEFS[state.playbook];
  if (!d.groups) return d.categories;
  return Object.entries(d.groups).flatMap(([g, items]) => (items.length === 1 ? items : items.map((i) => `${g}: ${i}`)));
};
const LEVEL = { Poor: 1, Fair: 2, Good: 3, Excellent: 4 };
const LEVEL_NAME = ["Incomplete", "Poor", "Fair", "Good", "Excellent"];
const CODE = { X: "Excellent", G: "Good", F: "Fair", P: "Poor" };
const decode = (s) => [...s].map((c) => CODE[c]);
const STAGE_COLORS = ["#3300ff", "#8a6ae2", "#5c8feb", "#048155", "#e0a100", "#cf264e", "#0aa5a5", "#754515"];
const UM_NAME = "Keeley";

// Team is mock data so the "Filter by Team" control has something to act on.
// First 9 agents and their metrics come from Figma node 4825:42946; the other 6 fill out "15 Results".
// Columns: name, team, avg score, close rate, connect-to-close, ACE, handle time (min), stage ratings
// (X = Excellent, G = Good, F = Fair, P = Poor).
const AGENTS = [
  ["Ryan Atwood", "Team A", 87.25, 76.23, 86.77, 5.6, 32, "XXPFGPGF"],
  ["Seth Cohen", "Team A", 87.25, 72.1, 84.5, 6.2, 28, "FPXGPFXG"],
  ["Marissa Cooper", "Team B", 72.1, 81.5, 79.3, 4.8, 35, "GXPFFPGF"],
  ["Summer Roberts", "Team B", 81.5, 68.75, 91.0, 7.1, 30, "XXPFFGPG"],
  ["Sandy Cohen", "Team C", 54.3, 91.0, 72.1, 3.9, 41, "FXPGGPGP"],
  ["Kirsten Cohen", "Team C", 68.75, 54.3, 87.25, 5.3, 27, "GPFFGGGG"],
  ["Julie Cooper", "Team A", 91.0, 79.6, 68.75, 8.0, 33, "XFPXGPGF"],
  ["Caleb Nichol", "Team B", 49.8, 87.25, 54.3, 4.1, 38, "XXPFFGPG"],
  ["Taylor Townsend", "Team C", 75.6, 49.8, 81.5, 6.7, 29, "FXPGPPGF"],
  ["Dan Scott", "Team A", 58.9, 64.2, 70.4, 4.4, 36, "FGPFGFPG"],
  ["Lucas Scott", "Team B", 79.4, 71.8, 83.2, 6.0, 31, "GXFGGPGF"],
  ["Brooke Davis", "Team C", 83.2, 78.9, 76.5, 6.5, 30, "XGGFXFGG"],
  ["Peyton Sawyer", "Team A", 66.1, 59.4, 62.8, 4.9, 39, "FFPPGFFG"],
  ["Nathan Scott", "Team B", 93.5, 88.3, 90.1, 8.4, 26, "XXGXGGXG"],
  ["Haley James", "Team C", 71.7, 74.6, 77.0, 5.8, 34, "GFGFGPGF"],
].map(makeAgent);

// Agents that appear in Top/Bottom Agent cells but not in the agent table. They only resolve via ALL_AGENTS.
const EXTRA_AGENTS = [
  ["Luke Ward", "Team A", 62.4, 58.1, 66.3, 4.6, 37, "FPFGPFPG"],
  ["Keith Scott", "Team B", 77.2, 70.5, 80.9, 5.9, 32, "GGFXGFGG"],
  ["Rachel Gatina", "Team C", 69.8, 66.7, 74.2, 5.1, 35, "FGGFGPGF"],
  ["Mouth McFadden", "Team A", 64.3, 61.9, 69.4, 4.7, 38, "PFFGFFPG"],
].map(makeAgent);
const ALL_AGENTS = [...AGENTS, ...EXTRA_AGENTS];

// Sales Manager view (Figma node 2137:2170). The first 9 team rows, scores and ratings are drawn in the design;
// the other 7 teams and the close/connect/ACE/handle numbers are generated to fill out the table.
const TEAMS = [
  ["Amsbaugh", 87.25, 76.23, 86.77, 5.6, 32, "XXPFGPGF"],
  ["CClark", 87.25, 72.1, 84.5, 6.2, 28, "FPXGPFXG"],
  ["Clarke", 72.1, 81.5, 79.3, 4.8, 35, "GXPFFPGF"],
  ["Clough", 81.5, 68.75, 91.0, 7.1, 30, "XXPFFGPG"],
  ["Cottrell", 54.3, 91.0, 72.1, 3.9, 41, "FXPGGPGP"],
  ["De La Cerda", 68.75, 54.3, 87.25, 5.3, 27, "GPFFPGGG"],
  ["Flynn", 91.0, 79.6, 68.75, 8.0, 33, "XFPXGPGF"],
  ["Galan", 49.8, 87.25, 54.3, 4.1, 38, "XXPFFGPG"],
  ["Hood", 75.6, 49.8, 81.5, 6.7, 29, "FXPGPPGF"],
  ["Hopewell", 58.9, 64.2, 70.4, 4.4, 36, "FGPFGFPG"],
  ["Jaami", 79.4, 71.8, 83.2, 6.0, 31, "GXFGGPGF"],
  ["Koski", 83.2, 78.9, 76.5, 6.5, 30, "XGGFXFGG"],
  ["Lewis", 66.1, 59.4, 62.8, 4.9, 39, "FFPPGFFG"],
  ["Lichnerowicz", 93.5, 88.3, 90.1, 8.4, 26, "XXGXGGXG"],
  ["NEO", 71.7, 74.6, 77.0, 5.8, 34, "GFGFGPGF"],
  ["Pereida", 62.4, 58.1, 66.3, 4.6, 37, "FPFGPFPG"],
].map(([name, score, close, c2c, ace, handle, r]) => ({ name, team: name, score, close, c2c, ace, handle, r: decode(r), slug: "team-" + slugify(name) }));

// Top/Bottom Team per Call Behavior step, as drawn in the design.
const SM_PAIRS = [
  ["Amsbaugh", "CClark"], ["Clarke", "Clough"], ["Cottrell", "De La Cerda"], ["Flynn", "Galan"],
  ["Hood", "Hopewell"], ["Jaami", "Koski"], ["Lewis", "Lichnerowicz"], ["NEO", "Pereida"],
];

function makeAgent([name, team, score, close, c2c, ace, handle, r]) {
  const [first, ...rest] = name.split(" ");
  const last = rest.join(" ");
  return {
    name,
    team,
    score,
    close,
    c2c,
    ace,
    handle,
    r: decode(r),
    slug: slugify(name),
    initials: first[0] + last[0],
    email: `${first[0]}.${last.replace(/\s/g, "")}@achieve.com`.toLowerCase(),
  };
}

// Column widths are % of the 1331px table in Figma.
const STAGE_VIEW = "Call Stage Performance";
const METRICS_VIEW = "Performance Metrics";

const AGENT_VIEWS = {
  [STAGE_VIEW]: {
    title: "Agent Performance by Call Flow",
    note: (pb) => `Filtered by ${pb} Playbook`,
    cols: () => [
      { key: "name", label: "Agent name", px: 130, kind: "link" },
      { key: "score", label: "Avg. Scoring", px: 163, num: true, sortable: true, fmt: score2, tone: agentTone },
      ...cats().map((s, i) => ({ key: "r" + i, label: s, px: 130, sortable: true, rating: i })),
    ],
  },
  [METRICS_VIEW]: {
    title: "Agent Performance",
    note: (pb) => `Filtered by ${pb} Playbook > Call Flow Trends`,
    cols: () => [
      { key: "name", label: "Agent name", kind: "link", w: 16.67 },
      { key: "score", label: "Avg. Scoring", w: 16.67, num: true, sortable: true, bold: true, fmt: score2, tone: agentTone },
      { key: "close", label: "Close Rate", w: 16.67, num: true, sortable: true, fmt: score2 },
      { key: "c2c", label: "Connect-to-Close Rate", w: 16.67, num: true, sortable: true, fmt: score2 },
      { key: "ace", label: "Avg. ACE", w: 16.67, num: true, sortable: true, fmt: (v) => v.toFixed(1) + "%" },
      { key: "handle", label: "Avg. Handle Time", w: 16.65, num: true, sortable: true, fmt: (v) => v + " min" },
    ],
  },
};

// Recent Calls table on the Agent Overview (Figma node 4060:46751).
const callCols = () => [
  { key: "brand", label: "Source", px: 64, kind: "brand" },
  { key: "date", label: "Call Date", px: 125, sortable: true, kind: "date" },
  { key: "duration", label: "Duration", px: 98 },
  { key: "lead", label: "Lead ID", px: 98, kind: "lead" },
  { key: "score", label: "Avg. Scoring", px: 163, num: true, sortable: true, bold: true, fmt: score2, tone: tone },
  ...cats().map((s, i) => ({ key: "r" + i, label: s, px: 112, sortable: true, rating: i })),
  { key: "details", label: "Call Details", px: 139, kind: "details" },
];

// Ratings for the first 10 calls, exactly as drawn in the design (X/G/F/P as above) with the avg. score.
// The third value picks the call source: true = FDR, false = Achieve.
const DESIGN_CALLS = [
  [87.25, "XXPFGPGF", true],
  [87.25, "XPPGPFGF", false],
  [92.1, "FXPFGGPF", true],
  [88.4, "PFPPGFPG", false],
  [91.75, "XXPFGPGF", false],
  [89.05, "XFFPGGFP", false],
  [90.3, "FFPFFGPG", true],
  [87.8, "XXPGFPGF", true],
  [92.45, "FFPFFGPG", false],
  [88.9, "PPPFGPGF", true],
];

// ---------- State ----------
const state = {
  role: "UM",
  viewTeam: null,
  query: "",
  playbook: "Call Behavior",
  team: "All teams",
  smTeam: "All teams",
  date: "This week",
  view: STAGE_VIEW,
  page: 1,
  pageSize: 10,
  steps: { key: null, dir: "asc" },
  agents: { key: null, dir: "asc" },
};

const agentPage = {
  agent: null,
  query: "",
  weeks: 6,
  hidden: new Set(),
  ptHidden: new Set(),
  sort: { key: null, dir: "asc" },
};

// Call Performance Overview page state. `open` is null until defaults are computed for the playbook.
const ov = { agent: null, query: "", stage: "All", grade: "All", open: null };

const STEP_COLS = [
  { key: "step", label: "Call Step", w: 22, sortable: true },
  { key: "floor", label: "Floor Avg. Scoring", w: 12, sortable: true, num: true, hl: true, fmt: pct, tone: tone },
  { key: "avg", label: "Avg. Scoring", w: 10, sortable: true, num: true, fmt: pct, tone: tone },
  { key: "c2c", label: "Connect-to-Close", w: 11, sortable: true, num: true, fmt: pct },
  { key: "connects", label: "Total Connects", w: 10, sortable: true, num: true },
  { key: "top", label: "Top Agent", w: 12, kind: "agent" },
  { key: "bottom", label: "Bottom Agent", w: 12, kind: "agent" },
  { key: "trend", label: "Trend", w: 11, num: true, kind: "trend", sortable: true },
];

// ---------- Helpers ----------
function pct(v) {
  return v.toFixed(2) + "%";
}
function tone(v) {
  if (v >= 90) return "accent";
  if (v >= 70) return "positive";
  if (v >= 50) return "warning";
  return "negative";
}
function agentTone(v) {
  if (v >= 90) return "accent";
  if (v >= 70) return "positive";
  if (v >= 50) return "warning";
  return "negative";
}
function score2(v) {
  return v.toFixed(2) + "%";
}
function slugify(n) {
  return n.toLowerCase().replace(/[^a-z0-9]+/g, "-");
}
function hash(s) {
  let h = 2166136261;
  for (const c of s) h = Math.imul(h ^ c.charCodeAt(0), 16777619);
  return h >>> 0;
}
// Small seeded PRNG so each agent's mock data is stable between visits.
function rng(seed) {
  let t = seed >>> 0;
  return () => {
    t += 0x6d2b79f5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}
function esc(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
}
function icon(id, size = 16, height = size) {
  return `<svg width="${size}" height="${height}" aria-hidden="true"><use href="#${id}"/></svg>`;
}
function sortValue(row, key) {
  return /^r\d+$/.test(key) ? LEVEL[row.r[+key.slice(1)]] : row[key];
}

const catColor = (i) => (i < STAGE_COLORS.length ? STAGE_COLORS[i] : `hsl(${Math.round((i * 137.5) % 360)} 55% 42%)`);

function genRating(rand, score) {
  const v = rand() + (score - 60) / 60;
  return v > 1 ? "Excellent" : v > 0.65 ? "Good" : v > 0.3 ? "Fair" : "Poor";
}

// Agent with score and category ratings for the selected playbook. Call Behavior keeps the design data
// for the first 8 categories; everything else is generated deterministically.
const pbCache = new Map();
function playbookScoreFor(a, pb) {
  if (pb === "Call Behavior") return a.score;
  return Math.round(Math.min(98, Math.max(35, a.score + (rng(hash(a.slug + "|" + pb))() - 0.5) * 24)) * 100) / 100;
}
function forPlaybook(a) {
  const key = a.slug + "|" + state.playbook;
  if (pbCache.has(key)) return pbCache.get(key);
  const rand = rng(hash(key + "ratings"));
  const n = cats().length;
  const base = state.playbook === "Call Behavior";
  const score = playbookScoreFor(a, state.playbook);
  const r = base ? [...a.r, ...Array.from({ length: n - a.r.length }, () => genRating(rand, score))] : Array.from({ length: n }, () => genRating(rand, score));
  const v = { ...a, score, r };
  pbCache.set(key, v);
  return v;
}

const stepCache = new Map();

// Mock roster for a team opened from the SM view: a stable subset of the agents.
const teamAgentCache = new Map();
function teamAgents(t) {
  if (!teamAgentCache.has(t.slug)) {
    const rand = rng(hash(t.slug + "agents"));
    const n = 4 + Math.floor(rand() * 3);
    teamAgentCache.set(
      t.slug,
      AGENTS.map((a) => [rand(), a]).sort((x, y) => x[0] - y[0]).slice(0, n).map((x) => x[1])
    );
  }
  return teamAgentCache.get(t.slug);
}

function stepsFor() {
  const pb = state.playbook;
  const sm = state.role === "SM";
  const vt = !sm && state.viewTeam;
  const cacheKey = pb + "|" + state.role + "|" + (vt ? vt.slug : "");
  if (stepCache.has(cacheKey)) return stepCache.get(cacheKey);
  const names = (sm ? TEAMS : vt ? teamAgents(vt) : AGENTS).map((a) => a.name);
  // Top/Bottom Agent for a team come from that team's roster, not the whole department.
  const teamPair = (label) => {
    const rand = rng(hash(pb + label + vt.slug));
    const top = Math.floor(rand() * names.length);
    return [names[top], names[(top + 1 + Math.floor(rand() * (names.length - 1))) % names.length]];
  };
  const rows = stepLabels().map((label, i) => {
    if (pb === "Call Behavior" && STEPS_BASE[i]) {
      if (sm) return { ...STEPS_BASE[i], top: SM_PAIRS[i][0], bottom: SM_PAIRS[i][1] };
      if (vt) {
        const [top, bottom] = teamPair(label);
        return { ...STEPS_BASE[i], top, bottom };
      }
      return STEPS_BASE[i];
    }
    const rand = rng(hash(pb + label + (sm ? "|sm" : vt ? "|" + vt.slug : "")));
    const top = Math.floor(rand() * names.length);
    const bottom = (top + 1 + Math.floor(rand() * (names.length - 1))) % names.length;
    const val = () => Math.round((15 + rand() * 83) * 100) / 100;
    return { step: label, floor: val(), avg: val(), c2c: 54.17, connects: 234, top: names[top], bottom: names[bottom], trend: Math.round((rand() * 20 - 10) * 100) / 100 };
  });
  // The design repeats one Connect-to-Close and Total Connects value on every row; vary them so the table reads as real data.
  const vary = rng(hash(cacheKey + "vary"));
  rows.forEach((r, i) => {
    rows[i] = { ...r, c2c: Math.round((38 + vary() * 50) * 100) / 100, connects: 120 + Math.floor(vary() * 260) };
  });
  stepCache.set(cacheKey, rows);
  return rows;
}

function sortRows(rows, { key, dir }, valueOf) {
  if (!key) return rows;
  const m = dir === "asc" ? 1 : -1;
  return [...rows].sort((a, b) => {
    const x = valueOf(a, key);
    const y = valueOf(b, key);
    return (typeof x === "string" ? x.localeCompare(y) : x - y) * m;
  });
}

// ---------- Rendering ----------
function kpiHtml(list) {
  return list
    .map(
      (k) => `
    <article class="card">
      <div>
        ${k.label ? `<div class="kpi-label">${esc(k.label)}</div>` : ""}
        <div class="kpi-title">${esc(k.title)}</div>
      </div>
      <div class="kpi-metric">
        <div><b class="tone-${k.nowTone}">${esc(k.now)}</b><span>this week</span></div>
        <div><b class="tone-${k.prevTone}">${esc(k.prev)}</b><span>vs last week</span></div>
      </div>
    </article>`
    )
    .join("");
}

function renderKpis() {
  const t = state.role === "UM" && state.viewTeam;
  document.getElementById("kpis").innerHTML = kpiHtml(t ? agentKpis(t) : KPIS);
}

function headHtml(cols, sort) {
  const colgroup = cols.every((c) => c.w || c.px) ? `<colgroup>${cols.map((c) => `<col style="width:${c.px ? c.px + "px" : c.w + "%"}">`).join("")}</colgroup>` : "";
  const ths = cols
    .map((c) => {
      const cls = c.num ? "num" : "";
      if (!c.sortable) return `<th class="${cls}"><span class="th-plain">${esc(c.label)}</span></th>`;
      const active = sort.key === c.key;
      const dir = active ? ` data-dir="${sort.dir}"` : "";
      const ariaSort = active ? (sort.dir === "asc" ? "ascending" : "descending") : "none";
      return `<th class="${cls}" aria-sort="${ariaSort}">
        <button class="th-btn" type="button" data-key="${c.key}"${dir}><span class="label" title="${esc(c.label)}">${esc(c.label)}</span><span class="sort">${icon("i-sort")}</span></button>
      </th>`;
    })
    .join("");
  return `${colgroup}<thead><tr>${ths}</tr></thead>`;
}

// Playbooks have different category counts, so px-wide tables get a matching min-width (the wrapper scrolls).
function fillTable(id, cols, sort, body, emptyMsg) {
  const t = document.getElementById(id);
  t.style.minWidth = cols.every((c) => c.px) ? cols.reduce((s, c) => s + c.px, 0) + "px" : "";
  t.innerHTML = headHtml(cols, sort) + `<tbody>${body || `<tr><td class="empty" colspan="${cols.length}">${emptyMsg}</td></tr>`}</tbody>`;
}

const fmtDate = (ms) => new Date(ms).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

function cellHtml(c, r) {
  if (c.render) return `<td class="${[c.num ? "num" : "", c.cls || ""].join(" ").trim()}">${c.render(r)}</td>`;
  const v = r[c.key];
  if (c.rating !== undefined) {
    const rt = r.r[c.rating];
    return `<td><span class="chip chip-${rt}">${rt}</span></td>`;
  }
  switch (c.kind) {
    case "link":
      return `<td title="${esc(v)}"><a class="agent-link" href="#/agent/${r.slug}">${esc(v)}</a></td>`;
    case "agent":
      return `<td title="${esc(v)}"><a class="agent-link" href="#/agent/${slugify(v)}">${esc(v)}</a></td>`;
    case "team":
      return `<td title="${esc(v)}"><a class="agent-link" href="#/team/${slugify(r.name)}">${esc(v)}</a></td>`;
    case "teamref":
      return `<td title="${esc(v)}"><a class="agent-link" href="#/team/${slugify(v)}">${esc(v)}</a></td>`;
    case "brand":
      return `<td><span class="brand brand-${v === "FDR" ? "fdr" : "achieve"}" role="img" aria-label="${v} call" title="${v}">${v === "FDR" ? icon("i-logo-fdr", 34, 16) : icon("i-logo-achieve", 16)}</span></td>`;
    case "date":
      return `<td>${fmtDate(v)}</td>`;
    case "lead":
      return `<td><button class="link-btn" type="button" data-act="lead">#${esc(v)}</button></td>`;
    case "details":
      return `<td><button class="text-btn" type="button" data-act="details">View call details</button></td>`;
    case "trend": {
      const up = v >= 0;
      return `<td class="num trend"><div class="cell tone-${up ? "positive" : "negative"}">${icon(up ? "i-trend-up" : "i-trend-down")}<span>${up ? "+" : ""}${v.toFixed(2)}%</span></div></td>`;
    }
  }
  const t = c.tone ? ` tone-${c.tone(v)}` : "";
  const cls = [c.num ? "num" : "", c.hl ? "hl" : "", c.bold ? "bold" : "", t].join(" ").trim();
  return `<td class="${cls}"${typeof v === "string" ? ` title="${esc(v)}"` : ""}>${esc(c.fmt ? c.fmt(v) : v)}</td>`;
}

function renderSteps() {
  const q = state.query.toLowerCase();
  const cols = stepCols();
  let rows = stepsFor().filter((r) => !q || [r.step, r.top, r.bottom].some((s) => s.toLowerCase().includes(q)));
  rows = sortRows(rows, state.steps, (r, k) => r[k]);

  const body = rows.map((r) => `<tr>${cols.map((c) => cellHtml(c, r)).join("")}</tr>`).join("");

  fillTable("steps-table", cols, state.steps, body, "No call steps match your search.");
}

function visibleAgents() {
  const q = state.query.toLowerCase();
  const sm = state.role === "SM";
  const vt = !sm && state.viewTeam;
  const inTeam = (a) => (vt ? true : sm ? state.smTeam === "All teams" || a.name === state.smTeam : state.team === "All teams" || a.team === state.team);
  return (sm ? TEAMS : vt ? teamAgents(vt) : AGENTS).filter((a) => inTeam(a) && (!q || a.name.toLowerCase().includes(q))).map(forPlaybook);
}

// In the SM view the first column is a team; its name links to that team's overview.
const teamCols = (cols) => (state.role === "SM" ? cols.map((c) => (c.key === "name" ? { ...c, label: "Team name", kind: "team" } : c)) : cols);
const stepCols = () =>
  state.role === "SM"
    ? STEP_COLS.map((c) => (c.key === "top" || c.key === "bottom" ? { ...c, kind: "teamref", label: c.key === "top" ? "Top Team" : "Bottom Team" } : c))
    : STEP_COLS;

function renderAgents() {
  const view = AGENT_VIEWS[state.view];
  const sm = state.role === "SM";
  const all = sortRows(visibleAgents(), state.agents, sortValue);
  const pages = Math.max(1, Math.ceil(all.length / state.pageSize));
  state.page = Math.min(state.page, pages);
  const rows = all.slice((state.page - 1) * state.pageSize, state.page * state.pageSize);

  document.getElementById("agents-title").textContent = sm ? "Team Performance" : view.title;
  document.getElementById("agents-note").textContent = view.note(state.playbook);

  const cols = teamCols(view.cols());
  const body = rows.map((a) => `<tr>${cols.map((c) => cellHtml(c, a)).join("")}</tr>`).join("");
  fillTable("agents-table", cols, state.agents, body, sm ? "No teams match your filters." : "No agents match your filters.");

  document.getElementById("pager-text").textContent = `Showing ${rows.length} of ${all.length} Results`;
  document.getElementById("pg-prev").disabled = state.page <= 1;
  document.getElementById("pg-next").disabled = state.page >= pages;
}

function renderNotes() {
  document.querySelectorAll(".filter-note").forEach((el) => {
    el.textContent = `Filtered by ${state.playbook} Playbook`;
  });
}

function renderAll() {
  renderNotes();
  renderSteps();
  renderAgents();
  if (agentPage.agent) renderAgentPage();
  if (ov.agent) renderOverview();
  if (callPage.call) renderCall();
  renderSearch();
}

// ---------- Interactions ----------
function bindSort(tableId, getSort, render) {
  document.getElementById(tableId).addEventListener("click", (e) => {
    const btn = e.target.closest(".th-btn");
    if (!btn) return;
    const sort = getSort();
    const key = btn.dataset.key;
    sort.dir = sort.key === key && sort.dir === "asc" ? "desc" : "asc";
    sort.key = key;
    render();
  });
}

const dropdownPainters = [];

// options: strings. get/set read and write the backing state; prefix and lead are display-only.
function setupDropdown(id, options, get, set, { prefix = "", lead = "i-chevron" } = {}) {
  const root = document.getElementById(id);
  const btn = root.querySelector(".dd-trigger");
  const menu = root.querySelector(".dd-menu");

  const paint = () => {
    btn.innerHTML = `<span>${esc(prefix + get())}</span>${icon(lead, 24)}`;
    menu.innerHTML = (typeof options === "function" ? options() : options)
      .map((o) => `<button class="dd-option" type="button" role="option" aria-selected="${o === get()}" data-v="${esc(o)}">${esc(o)}</button>`)
      .join("");
  };
  dropdownPainters.push(paint);

  btn.addEventListener("click", (e) => {
    e.stopPropagation();
    const open = root.dataset.open === "true";
    closeMenus();
    root.setAttribute("data-open", String(!open));
  });
  menu.addEventListener("click", (e) => {
    const opt = e.target.closest(".dd-option");
    if (!opt) return;
    set(opt.dataset.v);
    closeMenus();
    dropdownPainters.forEach((p) => p());
  });
  paint();
}

function closeMenus() {
  document.querySelectorAll(".dd").forEach((d) => d.setAttribute("data-open", "false"));
}

function toast(msg) {
  const el = document.getElementById("toast");
  el.textContent = msg;
  el.classList.add("show");
  clearTimeout(toast.t);
  toast.t = setTimeout(() => el.classList.remove("show"), 2000);
}

function saveCsv(lines, filename) {
  const csv = lines.map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(",")).join("\n");
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
  const a = Object.assign(document.createElement("a"), { href: url, download: filename });
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function downloadCsv() {
  const view = AGENT_VIEWS[state.view];
  const rows = sortRows(visibleAgents(), state.agents, sortValue);
  const cellValue = (c, a) => (c.rating !== undefined ? a.r[c.rating] : c.fmt ? c.fmt(a[c.key]) : a[c.key]);
  const cols = teamCols(view.cols());
  saveCsv([cols.map((c) => c.label), ...rows.map((a) => cols.map((c) => cellValue(c, a)))], state.role === "SM" ? "team-performance.csv" : "agent-performance.csv");
  toast(`Exported ${rows.length} ${state.role === "SM" ? "teams" : "agents"}`);
}

// ---------- Agent Overview ----------
const callCache = new Map();

// Mock calls. Ryan Atwood's ratings and scores are the ones drawn in the Figma design.
function callsFor(agent) {
  const cacheKey = agent.slug + "|" + state.playbook;
  if (callCache.has(cacheKey)) return callCache.get(cacheKey);
  const rand = rng(hash(cacheKey + "calls"));
  const today = new Date();
  const midnight = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
  const calls = Array.from({ length: 10 }, (_, i) => {
    let score;
    let ratings;
    let isFdr;
    if (agent.slug === "ryan-atwood" && state.playbook === "Call Behavior") {
      [score, ratings, isFdr] = DESIGN_CALLS[i];
      ratings = decode(ratings);
      while (ratings.length < agent.r.length) ratings.push(genRating(rand, score));
    } else {
      score = Math.round(Math.min(98, Math.max(40, agent.score + (rand() - 0.5) * 12)) * 100) / 100;
      ratings = agent.r.map((name) => LEVEL_NAME[Math.min(4, Math.max(1, LEVEL[name] + [-1, 0, 0, 1][Math.floor(rand() * 4)]))]);
      isFdr = rand() > 0.5;
    }
    const mm = String(8 + Math.floor(rand() * 26)).padStart(2, "0");
    const ss = String(Math.floor(rand() * 60)).padStart(2, "0");
    return {
      brand: isFdr ? "FDR" : "Achieve",
      date: midnight - (i * 2 + Math.floor(rand() * 2)) * 86400000,
      duration: `00:${mm}:${ss}`,
      lead: String(100000 + Math.floor(rand() * 899999)),
      score,
      r: ratings,
    };
  });
  callCache.set(cacheKey, calls);
  return calls;
}

function agentKpis(a) {
  const rand = rng(hash(a.slug + "kpi"));
  const item = (label, title, now, fmt, spread, lowerIsBetter) => {
    const prev = Math.max(0, now - (rand() * 2 - 0.7) * spread);
    const better = lowerIsBetter ? now <= prev : now >= prev;
    return { label, title, now: fmt(now), nowTone: better ? "positive" : "negative", prev: fmt(prev), prevTone: "warning" };
  };
  return [
    item("Call Behavior", "Avg. Scoring", a.score, score2, 8),
    item("Avg.", "Connect-to-Close", a.c2c, score2, 8),
    item("Overall", "Close Rate", a.close, score2, 8),
    item("Avg.", "Call handle time", a.handle, (v) => Math.round(v) + " min", 6, true),
    item("Avg.", "ACE scoring", a.ace, (v) => v.toFixed(1) + "%", 1.5),
  ];
}

// Monday-to-Sunday week ranges ending with the current week.
function weekRanges(n) {
  const t = new Date();
  const monday = new Date(t.getFullYear(), t.getMonth(), t.getDate() - ((t.getDay() + 6) % 7));
  const md = (d) => `${String(d.getMonth() + 1).padStart(2, "0")}/${String(d.getDate()).padStart(2, "0")}`;
  return Array.from({ length: n }, (_, k) => {
    const start = new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() - 7 * (n - 1 - k));
    const end = new Date(start.getFullYear(), start.getMonth(), start.getDate() + 6);
    return { start, end, label: `${md(start)} - ${md(end)}` };
  });
}

// Level (1-4) per stage per week; the final week is the agent's current rating.
function stageLevels(a, n) {
  const rand = rng(hash(a.slug + state.playbook + "trend"));
  return a.r.map((name) => {
    const arr = new Array(n);
    arr[n - 1] = LEVEL[name];
    for (let i = n - 2; i >= 0; i--) arr[i] = Math.min(4, Math.max(1, arr[i + 1] + [-1, 0, 0, 1][Math.floor(rand() * 4)]));
    return arr;
  });
}

function smoothPath(pts) {
  let d = `M${pts[0][0]},${pts[0][1]}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] || pts[i];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2] || p2;
    d += ` C${p1[0] + (p2[0] - p0[0]) / 6},${p1[1] + (p2[1] - p0[1]) / 6} ${p2[0] - (p3[0] - p1[0]) / 6},${p2[1] - (p3[1] - p1[1]) / 6} ${p2[0]},${p2[1]}`;
  }
  return d;
}

function renderLegend() {
  document.getElementById("legend").innerHTML = cats().map(
    (s, i) =>
      `<button class="legend-item" type="button" data-i="${i}" aria-pressed="${!agentPage.hidden.has(i)}"><span class="dot" style="background:${catColor(i)}"></span>${esc(s)}</button>`
  ).join("");
}

// Shared line chart. Series values are 0-1 (bottom to top); `tip(i)` returns the tooltip text for week i.
function drawChart({ plot, yAxis, xAxis, weeks, labels, series, label, empty }) {
  const H = 300;
  const W = Math.max(plot.clientWidth, 320);
  const n = weeks.length;
  const X = (i) => (i * W) / (n - 1);
  const Y = (v) => H - v * H;

  yAxis.innerHTML = labels.map((l, k) => `<span style="top:${k * 75}px">${l}</span>`).join("");
  xAxis.innerHTML = weeks
    .map((w, i) => {
      const shift = i === 0 ? "0" : i === n - 1 ? "-100%" : "-50%";
      const align = i === 0 ? "left" : i === n - 1 ? "right" : "center";
      return `<span style="left:${X(i)}px;transform:translateX(${shift});text-align:${align}">Week of<br>${w.label}</span>`;
    })
    .join("");

  let svg = `<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(label)}">`;
  for (let k = 0; k <= 4; k++) svg += `<line x1="0" x2="${W}" y1="${k * 75}" y2="${k * 75}" stroke="#e7ecf3"/>`;
  weeks.forEach((_, i) => (svg += `<line x1="${X(i)}" x2="${X(i)}" y1="0" y2="${H}" stroke="#e7ecf3"/>`));
  series.forEach((s) => {
    const pts = s.vals.map((v, i) => [X(i), Y(v)]);
    svg += `<path d="${smoothPath(pts)}" fill="none" stroke="${s.color}" stroke-width="2"/>`;
    pts.forEach(([x, y]) => (svg += `<circle cx="${x}" cy="${y}" r="4" fill="${s.color}" stroke="#fff" stroke-width="1.5"/>`));
  });
  svg += `<line class="guide" y1="0" y2="${H}" stroke="#5c708a" stroke-dasharray="4 4" style="display:none"/>`;
  svg += `<rect class="hit" x="-12" y="-12" width="${W + 24}" height="${H + 24}" fill="transparent"/></svg>`;
  plot.innerHTML = svg + `<div class="chart-tip"></div>`;

  const guide = plot.querySelector(".guide");
  const tip = plot.querySelector(".chart-tip");
  const hit = plot.querySelector(".hit");
  hit.addEventListener("mousemove", (e) => {
    const x = e.clientX - plot.getBoundingClientRect().left;
    const i = Math.min(n - 1, Math.max(0, Math.round((x / W) * (n - 1))));
    guide.setAttribute("x1", X(i));
    guide.setAttribute("x2", X(i));
    guide.style.display = "block";
    tip.innerHTML =
      `<b>Week of ${weeks[i].label}</b>` +
      (series.length ? series.map((s) => `<div><i style="background:${s.color}"></i>${esc(s.name)}: ${s.tip(i)}</div>`).join("") : empty);
    tip.style.display = "block";
    const w = tip.offsetWidth;
    tip.style.left = `${X(i) + 12 + w > W ? X(i) - w - 12 : X(i) + 12}px`;
  });
  hit.addEventListener("mouseleave", () => {
    guide.style.display = "none";
    tip.style.display = "none";
  });
}

const fmtLong = (d) => d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

function renderChart() {
  const a = forPlaybook(agentPage.agent);
  const categories = cats();
  const weeks = weekRanges(agentPage.weeks);
  const levels = stageLevels(a, agentPage.weeks);
  const n = weeks.length;
  // A tiny per-stage offset keeps identical lines from hiding each other.
  const series = categories
    .map((name, s) => ({
      name,
      color: catColor(s),
      vals: levels[s].map((v) => (v + (s - categories.length / 2) * (0.2 / categories.length)) / 4),
      tip: (i) => LEVEL_NAME[levels[s][i]],
      s,
    }))
    .filter((x) => !agentPage.hidden.has(x.s));

  drawChart({
    plot: document.getElementById("plot"),
    yAxis: document.getElementById("y-axis"),
    xAxis: document.getElementById("x-axis"),
    weeks,
    labels: ["Exc.", "Good", "Fair", "Poor", "Inc."],
    series,
    label: "Call flow trends by stage",
    empty: "No stages selected",
  });
  document.getElementById("chart-note").textContent = `Filtered by ${state.playbook} Playbook • Between ${fmtLong(weeks[0].start)} to ${fmtLong(weeks[n - 1].end)}`;
}

// Playbook Trends (Figma node 4585:32642): one line per playbook, scores 0-100%.
const PLAYBOOK_TREND = {
  "Call Behavior": { name: "Call Behavior", color: "#3300ff" },
  "FDR/ADR Sales": { name: "FDR/ADR Sales Playbook", color: "#c2471e" },
  "Program Summary": { name: "Program Summary", color: "#19b1e2" },
};

function playbookWeekly(a, pb, n) {
  const rand = rng(hash(a.slug + pb + "trend"));
  const arr = new Array(n);
  arr[n - 1] = playbookScoreFor(a, pb);
  for (let i = n - 2; i >= 0; i--) arr[i] = Math.min(98, Math.max(20, arr[i + 1] + (rand() - 0.5) * 14));
  return arr;
}

function renderPlaybookLegend() {
  document.getElementById("pt-legend").innerHTML = Object.entries(PLAYBOOK_TREND)
    .map(
      ([pb, p]) =>
        `<button class="legend-item" type="button" data-pb="${esc(pb)}" aria-pressed="${!agentPage.ptHidden.has(pb)}"><span class="dot" style="background:${p.color}"></span>${esc(p.name)}</button>`
    )
    .join("");
}

function renderPlaybookChart() {
  const a = agentPage.agent;
  const weeks = weekRanges(agentPage.weeks);
  const n = weeks.length;
  const series = Object.entries(PLAYBOOK_TREND)
    .filter(([pb]) => !agentPage.ptHidden.has(pb))
    .map(([pb, p]) => {
      const vals = playbookWeekly(a, pb, n);
      return { name: p.name, color: p.color, vals: vals.map((v) => v / 100), tip: (i) => score2(vals[i]) };
    });

  drawChart({
    plot: document.getElementById("pt-plot"),
    yAxis: document.getElementById("pt-y"),
    xAxis: document.getElementById("pt-x"),
    weeks,
    labels: ["100%", "75%", "50%", "25%", "0%"],
    series,
    label: "Playbook trends over time",
    empty: "No playbooks selected",
  });
  document.getElementById("pt-note").textContent = `All playbook trends over time • Between ${fmtLong(weeks[0].start)} to ${fmtLong(weeks[n - 1].end)}`;
}

function visibleCalls() {
  const q = agentPage.query.toLowerCase();
  const rows = callsFor(forPlaybook(agentPage.agent)).filter((c) => !q || `#${c.lead}`.includes(q) || fmtDate(c.date).toLowerCase().includes(q));
  return sortRows(rows, agentPage.sort, sortValue);
}

function renderCalls() {
  const rows = visibleCalls();
  const cols = callCols();
  const body = rows.map((c) => `<tr data-lead="${c.lead}">${cols.map((col) => cellHtml(col, c)).join("")}</tr>`).join("");
  fillTable("calls-table", cols, agentPage.sort, body, "No calls match your search.");
  document.getElementById("calls-note").textContent = `Filtered by ${state.playbook} Playbook`;
}

function renderAgentPage() {
  document.getElementById("ag-kpis").innerHTML = kpiHtml(agentKpis(forPlaybook(agentPage.agent)));
  renderPlaybookChart();
  renderChart();
  renderCalls();
}

function openAgent(a) {
  if (agentPage.agent !== a) {
    Object.assign(agentPage, { agent: a, query: "", hidden: new Set(), ptHidden: new Set(), sort: { key: null, dir: "asc" } });
    document.getElementById("ag-search").value = "";
    document.getElementById("ag-avatar").textContent = a.initials;
    document.getElementById("ag-name").textContent = a.name;
    document.getElementById("ag-email").textContent = a.email;
    document.getElementById("ag-um").textContent = UM_NAME;
    renderLegend();
    renderPlaybookLegend();
  }
  document.title = `EvalAI - Sales - ${a.name}`;
  renderAgentPage();
}

// ---------- Call Performance Overview (Figma node 3647:37441) ----------
// Category averages for Call Behavior as drawn in the design.
const OV_AVG = {
  Opening: 88, Validation: 67, Relatability: 42, Patience: 65, "Call Flow": 77, "Visual Aids": 92, Simplifying: 89, Expectations: 80,
  "Objection Handling": 62, "Goal Alignment": 80, Customization: 85, Benefits: 72, Urgency: 68, Fees: 91, Credibility: 77,
  Competitors: 63, "Follow Through": 88, "Loan Reframe": 74,
};
const GRADES = ["Excellent", "Good", "Fair", "Poor"];
const gradeOf = (v) => (v >= 90 ? "Excellent" : v >= 75 ? "Good" : v >= 60 ? "Fair" : "Poor");
const mmss = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

const ovRow = (id, date, grade, client, said, reply, total) => ({ id, date, grade, client, quotes: { client: said, agent: reply }, total });

// Citation rows exactly as drawn. Only these three categories are expanded tables in the design.
const DESIGN_OV = {
  Validation: [
    ovRow("2235", "8/4/26", "Good", "Lucas Scott", "“It’s been so hard to get my head above water.”", "“Ah yeah, that’s no good.”", 55),
    ovRow("1245", "8/4/26", "Fair", "Nathan Scott", "“I recently had a medical emergency so that threw me off my game.”", "“Oh that sucks.”", 45),
    ovRow("4432", "7/3/26", "Poor", "Haley James", "“It’s been so hard to get my head above water.”", "“Ah yeah, that’s no good.”", 58),
  ],
  Relatability: [
    ovRow("2235", "8/4/26", "Poor", "Lucas Scott", "“I’ve been losing sleep every night worrying about how I’m going to pay my bills.”", "“Okay, so let’s just pull up your account real quick.”", 55),
    ovRow("1245", "8/4/26", "Poor", "Nathan Scott", "“I had to choose between buying groceries and making my minimum payment this month.”", "“Right, so your current balance is $14,200. Have you considered a balance transfer?”", 45),
    ovRow("4432", "7/3/26", "Fair", "Haley James", "“My husband lost his job and we’re barely holding on. I don’t know what to do anymore.”", "“Understood. I’m going to go ahead and read you the terms of the program.”", 58),
    ovRow("3322", "7/3/26", "Poor", "Keith Scott", "“I feel so ashamed—I’ve never been in this kind of financial trouble before.”", "“Yeah, a lot of people call in about that. Anyway, what’s your account number?”", 58),
  ],
  "Objection Handling": [
    ovRow("2235", "8/4/26", "Fair", "Lucas Scott", "“I don’t know if I can really afford that.”", "“I hear you.”", 55),
    ovRow("4432", "7/3/26", "Poor", "Haley James", "“I didn’t even know debt consolidation was an option for me.”", "“A lot of people don’t realize they qualify. Let me explain how it works.”", 58),
  ],
};

// Quote pool for categories the design doesn't show rows for.
const OV_CLIENTS = ["Lucas Scott", "Nathan Scott", "Haley James", "Keith Scott", "Brooke Davis", "Peyton Sawyer"];
const OV_PAIRS = [
  ["“It’s been so hard to get my head above water.”", "“Ah yeah, that’s no good.”"],
  ["“I recently had a medical emergency so that threw me off my game.”", "“Oh that sucks.”"],
  ["“I don’t know if I can really afford that.”", "“I hear you.”"],
  ["“I didn’t even know debt consolidation was an option for me.”", "“A lot of people don’t realize they qualify. Let me explain how it works.”"],
  ["“My husband lost his job and we’re barely holding on.”", "“Understood. I’m going to go ahead and read you the terms of the program.”"],
];

const ovCache = new Map();
function overviewFor(agent) {
  const key = agent.slug + "|" + state.playbook;
  if (ovCache.has(key)) return ovCache.get(key);
  const rand = rng(hash(key + "overview"));
  const base = state.playbook === "Call Behavior";
  const exact = base && agent.slug === "ryan-atwood";
  const sections = cats().map((name, i) => {
    const seed = base && OV_AVG[name] !== undefined ? OV_AVG[name] : 45 + Math.floor(rand() * 50);
    const avg = exact ? seed : Math.min(98, Math.max(25, Math.round(seed + (rand() - 0.5) * 20)));
    const grade = gradeOf(avg);
    // Every section is a citations table. Rows are drawn in the design for three categories; the rest are generated.
    const rows =
      base && DESIGN_OV[name]
        ? DESIGN_OV[name]
        : Array.from({ length: 2 + Math.floor(rand() * 3) }, () => {
            const [said, reply] = OV_PAIRS[Math.floor(rand() * OV_PAIRS.length)];
            const g = GRADES[Math.min(3, Math.max(0, GRADES.indexOf(grade) + [-1, 0, 0, 1][Math.floor(rand() * 4)]))];
            const date = `${1 + Math.floor(rand() * 8)}/${1 + Math.floor(rand() * 28)}/26`;
            return ovRow(String(1000 + Math.floor(rand() * 8999)), date, g, OV_CLIENTS[Math.floor(rand() * OV_CLIENTS.length)], said, reply, 30 + Math.floor(rand() * 40));
          });
    // Sections the design shows expanded start open; the rest start collapsed.
    const open = base ? Boolean(DESIGN_OV[name]) : i % 3 === 1;
    // The design's Objection Handling table has no Score column.
    return { name, avg, grade, open, rows, hasScore: !(base && name === "Objection Handling") };
  });
  ovCache.set(key, sections);
  return sections;
}

function filteredOverview() {
  const q = ov.query.toLowerCase();
  const rowMatch = (r) => !q || [r.id, r.client, r.quotes.client, r.quotes.agent].some((t) => t.toLowerCase().includes(q));
  const gradeMatch = (g) => ov.grade === "All" || g === ov.grade;
  return overviewFor(ov.agent)
    .filter((s) => ov.stage === "All" || s.name === ov.stage)
    .map((s) => ({ ...s, rows: s.rows.filter((r) => gradeMatch(r.grade) && rowMatch(r)) }))
    .filter((s) => s.rows.length > 0);
}

function clipHtml(total) {
  return `<div class="clip" data-cur="0" data-total="${total}">
    <button class="clip-btn" type="button" aria-label="Play clip">${icon("i-play")}</button>
    <div class="clip-bar"><div class="clip-track"><i class="clip-fill"></i></div><div class="clip-times"><span class="cur">0:00</span><span>${mmss(total)}</span></div></div>
  </div>`;
}

const OV_COLS = [["Call ID", 69], ["Date", 95], ["Score", 95], ["Client", 132], ["Citation", 0], ["Clip", 150]];

function tableHtml(s) {
  const cols = OV_COLS.filter(([label]) => s.hasScore || label !== "Score");
  const rows = s.rows
    .map(
      (r) => `<tr>
      <td>${esc(r.id)}</td><td>${esc(r.date)}</td>${s.hasScore ? `<td><span class="chip chip-${r.grade}">${r.grade}</span></td>` : ""}<td>${esc(r.client)}</td>
      <td class="cit"><div><span class="who">Client:</span>${esc(r.quotes.client)}</div><div><span class="who who-agent">Agent:</span>${esc(r.quotes.agent)}</div></td>
      <td>${clipHtml(r.total)}</td></tr>`
    )
    .join("");
  return `<div class="ov-table-wrap"><table class="ov-table">
    <colgroup>${cols.map(([, w]) => `<col${w ? ` style="width:${w}px"` : ""}>`).join("")}</colgroup>
    <thead><tr>${cols.map(([label]) => `<th>${label}</th>`).join("")}</tr></thead><tbody>${rows}</tbody></table></div>`;
}

function stageHtml(s) {
  const open = ov.open.has(s.name);
  const id = "stage-" + slugify(s.name);
  return `<section class="stage">
    <button class="stage-head" type="button" data-name="${esc(s.name)}" aria-expanded="${open}" aria-controls="${id}">
      <span class="stage-title">${esc(s.name)}</span>
      <span class="stage-avg"><b class="tone-${tone(s.avg)}">${s.avg}%</b><span>avg.</span></span>
      <span class="chev">${icon("i-chevron")}</span>
    </button>
    <div class="stage-body" id="${id}"${open ? "" : " hidden"}>${tableHtml(s)}</div>
  </section>`;
}

function paintExpand(list) {
  const all = list.length > 0 && list.every((s) => ov.open.has(s.name));
  const btn = document.getElementById("ov-expand");
  btn.setAttribute("aria-pressed", String(all));
  btn.innerHTML = `${all ? "Collapse All" : "Expand All"}${icon("i-chevron")}`;
  btn.disabled = list.length === 0;
}

function renderOverview() {
  if (!ov.agent) return;
  stopClip();
  if (!ov.open) ov.open = new Set(overviewFor(ov.agent).filter((s) => s.open).map((s) => s.name));
  const list = filteredOverview();
  const count = list.reduce((n, s) => n + s.rows.length, 0);
  document.getElementById("ov-title").textContent = `${state.playbook} Playbook: Call Performance Overview`;
  document.getElementById("ov-count").textContent = `${ov.stage === "All" ? "All Stages" : ov.stage} • ${count} Results`;
  document.getElementById("ov-stages").innerHTML = list.length ? list.map(stageHtml).join("") : `<p class="ov-empty">No results match your filters.</p>`;
  paintExpand(list);
}

// One clip plays at a time; the timer advances the elapsed time once a second.
const player = { el: null, timer: null };
function paintClip(el) {
  const cur = Number(el.dataset.cur);
  const playing = player.el === el;
  el.querySelector(".cur").textContent = mmss(cur);
  el.querySelector(".clip-fill").style.width = `${(cur / Number(el.dataset.total)) * 100}%`;
  const btn = el.querySelector(".clip-btn");
  btn.innerHTML = icon(playing ? "i-pause" : "i-play");
  btn.setAttribute("aria-label", playing ? "Pause clip" : "Play clip");
}
function stopClip() {
  clearInterval(player.timer);
  const prev = player.el;
  player.el = null;
  if (prev && prev.isConnected) paintClip(prev);
  return prev;
}
function toggleClip(el) {
  const prev = stopClip();
  if (prev === el) return;
  if (Number(el.dataset.cur) >= Number(el.dataset.total)) el.dataset.cur = 0;
  player.el = el;
  paintClip(el);
  player.timer = setInterval(() => {
    el.dataset.cur = Number(el.dataset.cur) + 1;
    if (Number(el.dataset.cur) >= Number(el.dataset.total)) stopClip();
    paintClip(el);
  }, 1000);
}

function openOverview(a) {
  if (ov.agent !== a) {
    Object.assign(ov, { agent: a, query: "", stage: "All", grade: "All", open: null });
    document.getElementById("ov-search").value = "";
    document.getElementById("ov-avatar").textContent = a.initials;
    document.getElementById("ov-name").textContent = a.name;
    document.getElementById("ov-email").textContent = a.email;
    document.getElementById("ov-um").textContent = UM_NAME;
    document.getElementById("ov-back").href = `#/agent/${a.slug}`;
    document.getElementById("ov-back-name").textContent = a.name;
    dropdownPainters.forEach((p) => p());
  }
  document.title = `EvalAI - Sales - ${a.name} - Call Performance Overview`;
  renderOverview();
}

function downloadOverview() {
  const rows = [];
  filteredOverview().forEach((s) => {
    s.rows.forEach((r) => rows.push([s.name, s.avg + "%", r.id, r.date, s.hasScore ? r.grade : "", r.client, r.quotes.client, r.quotes.agent]));
  });
  saveCsv([["Stage", "Avg.", "Call ID", "Date", "Score", "Client", "Client citation", "Agent citation"], ...rows], `${ov.agent.slug}-call-performance-overview.csv`);
  toast(`Exported ${rows.length} citations`);
}

// ---------- Call Details (Figma 3612:12499 results, 4043:26759 transcript, 3610:12114 / 12221 / 12296 insights) ----------
const CLIENTS = ["Benny Jet", "Laura Hale", "Pedro Ruiz", "Joan Burris", "Dana Whitfield", "Marcus Bell"];
const GRADE_ORDER = ["Incomplete", "Poor", "Fair", "Good", "Excellent"];
const GRADE_COLOR = { Incomplete: "#5c708a", Poor: "#cf264e", Fair: "#e39b0d", Good: "#048155", Excellent: "#3300ff" };

// [speaker, text]; entries 1 and 10 are the highlighted (AI-cited) ones in the design.
const TRANSCRIPT = [
  ["client", "Okay."],
  ["agent", "okay perfect so then we actually can help you with those bigger debts uh the business debts so that's good um when how long ago did you get that quantum lending uh business loan line of credit there and about how much do you owe on it right now"],
  ["client", "If I'm mistaken, we ended up had to change names also. And we – I think there was a limit of – I'm not sure how long it was, but we reached that limit, and then we just continued with – they cut us off and gave us a new account under the new name."],
  ["agent", "Mm-hmm."],
  ["client", "And then we found out that, man, the bill's getting too high to pay with interest. And that we have to, you know, no more loaning because we were just using it for parts and gas and we don't have many other ways to pay it down."],
  ["agent", "Yeah, yeah. I hear you. Right now, the debt that you have with that quantum lending line of credit plus the Elon Financial that you sent me that I added in here, $3,980."],
  ["agent", "The quantum lending is $30,075. And then on top of that, your other debt with the Texas Dow."],
  ["client", "No, that's the remaining balance. We only owe how many?"],
  ["agent", "13"],
  ["client", "That's the remaining that we can borrow on. But, man, the more you get, the higher the rate. And, man, right now, we want to pay these bills. We just need a little breathing room. Right, right."],
  ["agent", "We will. We will pay these bills."],
  ["client", "She's saying something about a debt forgiveness. I don't know what that means. I know it sounds good, but... Yeah, let me go over."],
  ["agent", "Let me put... $13,124.72. Okay. There we go."],
];
const TX_TIMES = [5, 18, 41, 52, 60, 88, 112, 131, 140, 152, 171, 190, 204];
const CITES = [1, 5, 10, 12];

const STAGE_TEXT = {
  Opening: "The agent introduces herself and her company, and provides the call recording disclosure. She also asks for a callback number, which is a good practice for inbound calls.",
  Validation: "The agent asks for the client's name and last four of social, and then the last four of the account number, which are all required for verification.",
};
const GRADE_SUMMARY = {
  Excellent: "The agent completed this step clearly and in the expected order.",
  Good: "The agent completed this step with only minor gaps.",
  Fair: "The agent covered part of this step but skipped key elements.",
  Poor: "The agent did not complete this step as required.",
  Incomplete: "The creditor did not ask for ATC/POA, so this step is not required.",
};
const GRADE_REASON = {
  Excellent: "The agent met every criterion for this step and tied it back to the client's situation.",
  Good: "The agent met the criteria for this step, referencing the client's situation directly.",
  Fair: "The agent partially met the criteria but did not confirm the client's understanding.",
  Poor: "The agent moved on without addressing the client's statement, missing the step's requirements.",
  Incomplete: "This step was not applicable to the call, so it was not scored.",
};

// Customer insights mock data. A null entry renders as "N/A" (as drawn for Competitors).
const INSIGHTS = {
  Goals: [
    {
      summary: "The client's primary goals are to simplify their debt payments by making a single payment instead of many, and to cover or resolve all of their outstanding debt, which they estimate around $18,000.",
      slices: [["Pressure to relieve monthly bills", 62, "#3300ff"], ["Debt Freedom", 38, "#94bbfe"]],
      quote: "“You you cannot that's the reason I put them on on my on my profile 18,000 to cover it all that money too.”",
      reason: "The client mentions \"18,000 to cover it all that money too,\" indicating a desire to resolve a significant total amount of debt.",
    },
    {
      summary: "The client wants to lower the monthly burden on their household and avoid further late fees while they recover from a recent loss of income.",
      slices: [["Lower monthly payment", 55, "#3300ff"], ["Avoid late fees", 25, "#94bbfe"], ["Rebuild credit", 20, "#d5e4ff"]],
      quote: "“We just need a little breathing room. Right, right.”",
      reason: "The client says they need \"breathing room,\" indicating the goal of reducing near-term payment pressure.",
    },
  ],
  Concerns: [
    {
      summary: "The client expressed a concern about the operational process of the debt relief program, specifically whether they would be responsible for contacting individual creditors or if the company would handle it.",
      slices: [["Affordability", 29, "#fb98b2"], ["Credit Impact", 71, "#cf264e"]],
      quote: "“So call call with that. In case you qualify, do you guys pay my my debts? Or I have to call every every single Bender in PEI?”",
      reason: "The client is asking for clarification on the process of how their debts will be handled, specifically whether they or the company will contact creditors.",
    },
    {
      summary: "The client is worried about how long the program takes and whether it will affect a pending loan application.",
      slices: [["Timeline", 55, "#fb98b2"], ["Credit Impact", 45, "#cf264e"]],
      quote: "“I know it sounds good, but... Yeah, let me go over.”",
      reason: "The client hedges on the debt forgiveness offer, signalling uncertainty about the consequences.",
    },
  ],
  Intent: [
    { summary: "The client initiated the inquiry, confirmed their debt amount, expressed a clear desire to consolidate payments, and asked clarifying questions about the program's mechanics. They also confirmed receipt of the email, indicating readiness to review the presentation." },
    { summary: "The client called to compare options for reducing their monthly payments. They shared balances for two accounts and asked what happens to their credit if they enroll." },
  ],
  Competitors: [
    null,
    {
      summary: "The client mentioned a competing debt settlement company that quoted a lower monthly payment, and asked how this program's fees compare.",
      slices: [["National Debt Relief", 60, "#3300ff"], ["Other provider", 40, "#94bbfe"]],
      quote: "“Right now, the other company said they could get me down to about three hundred a month.”",
      reason: "The client references a competing quote and compares monthly payments, showing active comparison shopping.",
    },
  ],
};
const INSIGHT_TABS = Object.keys(INSIGHTS);

const callPage = { agent: null, call: null, pb: "", tab: "results", from: "agent", query: "", grade: "All", open: null, insTab: "Goals", insOpen: true, jump: null, pos: 0, playing: false, timer: null };

const secs = (t) => t.split(":").reduce((s, v) => s * 60 + Number(v), 0);
const hms = (s) => [Math.floor(s / 3600), Math.floor(s / 60) % 60, s % 60].map((v) => String(v).padStart(2, "0")).join(":");
const clock = (s) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
const speakerName = (who) => (who === "agent" ? `Agent ${callPage.agent.name.split(" ").slice(-1)[0]}:` : `${callPage.client.split(" ")[0]}:`);

function callStages(call) {
  const names = cats();
  const rand = rng(hash(call.lead + state.playbook + "stages"));
  const useCall = callPage.pb === state.playbook && call.r.length === names.length;
  return names.map((name, i) => {
    const generated = genRating(rand, call.score);
    const incomplete = rand() < 0.12;
    const grade = incomplete ? "Incomplete" : useCall ? call.r[i] : generated;
    const cite = CITES[i % CITES.length];
    return { name, grade, cite, summary: STAGE_TEXT[name] && grade !== "Incomplete" ? STAGE_TEXT[name] : GRADE_SUMMARY[grade], reason: GRADE_REASON[grade], id: String(20000 + Math.floor(rand() * 9999)) };
  });
}

function donut(slices) {
  const R = 77.5;
  const C = 2 * Math.PI * R;
  const total = slices.reduce((s, x) => s + x[1], 0);
  let off = 0;
  const arcs = slices
    .map(([, v, col]) => {
      const len = (v / total) * C;
      const el = `<circle cx="90" cy="90" r="${R}" fill="none" stroke="${col}" stroke-width="25" stroke-dasharray="${len} ${C - len}" stroke-dashoffset="${-off}" transform="rotate(-90 90 90)"/>`;
      off += len;
      return el;
    })
    .join("");
  return `<svg width="180" height="180" viewBox="0 0 180 180" role="img" aria-label="${esc(slices.map((s) => `${s[0]} ${s[1]}%`).join(", "))}"><circle cx="90" cy="90" r="${R}" fill="none" stroke="#e7ecf3" stroke-width="25"/>${arcs}</svg>`;
}

function renderCallSummary() {
  const rand = rng(hash(callPage.call.lead + "summary"));
  const intent = ["High", "High", "Medium", "Low"][Math.floor(rand() * 4)];
  const rate = (55 + rand() * 40).toFixed(2);
  const chip = { High: "Good", Medium: "Fair", Low: "Poor" }[intent];
  document.getElementById("cd-summary").innerHTML = `
    <h2>Call Summary</h2>
    <div class="cd-tags">
      <span class="cd-tag"><span class="k">Intent:</span><span class="chip chip-${chip}">${intent}</span></span>
      <span class="cd-tag"><span class="k">Completion Rate:</span><b>${rate}%</b></span>
    </div>
    <p>This was a sales call following up on an online inquiry for debt relief. The client confirmed their debt amount and expressed a desire to simplify their payments. The agent provided an overview of their services and sent an email with a visual presentation for further explanation.</p>
    <h3>Key Actions:</h3>
    <ul><li>Agent confirmed client's unsecured debt of $15,248 across 7 accounts.</li><li>Agent sent an email with a visual presentation to the client.</li></ul>
    <h3>Outcomes/Next Steps:</h3>
    <ul><li>Client received the email.</li><li>The next step would be for the client to review the presentation and discuss options further.</li></ul>`;
}

function renderInsights() {
  const c = callPage;
  const pool = INSIGHTS[c.insTab];
  const d = pool[hash(c.call.lead + c.insTab) % pool.length];
  const tabs = INSIGHT_TABS.map((t) => `<button type="button" data-ins="${t}" aria-pressed="${t === c.insTab}">${t}</button>`).join("");
  let body;
  if (!d) {
    body = `<section class="ins-block"><h3 class="muted">${c.insTab} Summary</h3><p>N/A</p></section>`;
  } else {
    body = `<section class="ins-block"><h3>${c.insTab} Summary</h3><p>${esc(d.summary)}</p></section>`;
    if (d.slices) {
      body += `<div class="ins-chart">${donut(d.slices)}</div>
        <ul class="ins-legend">${d.slices.map(([n, , col]) => `<li><i style="background:${col}"></i>${esc(n)}</li>`).join("")}</ul>`;
    }
    if (d.quote) {
      body += `<section class="ins-cite">
        <button class="ins-cite-head" type="button" data-cite aria-expanded="${c.insOpen}"><span>Citation</span><span class="chev">${icon("i-chevron")}</span></button>
        <div${c.insOpen ? "" : " hidden"}><p>${esc(d.quote)}</p><div class="reason">${icon("i-sparkle")}<span>AI Reason: ${esc(d.reason)}</span></div></div>
      </section>`;
    }
  }
  document.getElementById("cd-insights").innerHTML = `<h2>Customer Insights</h2><div class="seg seg-full" role="group" aria-label="Insight type">${tabs}</div>${body}`;
}

function resultsHtml(stages) {
  const c = callPage;
  const q = c.query.toLowerCase();
  const counts = GRADE_ORDER.map((g) => stages.filter((s) => s.grade === g).length);
  const bar = GRADE_ORDER.map((g, i) => (counts[i] ? `<i style="flex:${counts[i]};background:${GRADE_COLOR[g]}" title="${g}: ${counts[i]}"></i>` : "")).join("");
  const legend = GRADE_ORDER.map((g) => `<span><i style="background:${GRADE_COLOR[g]}"></i>${g}</span>`).join("");
  const list = stages.filter((s) => (c.grade === "All" || s.grade === c.grade) && (!q || [s.name, s.summary].some((t) => t.toLowerCase().includes(q))));
  const all = list.length > 0 && list.every((s) => c.open.has(s.name));
  const items = list
    .map((s) => {
      const open = c.open.has(s.name);
      const id = "rs-" + slugify(s.name);
      const failing = s.grade === "Poor" || s.grade === "Fair";
      const t = hms(TX_TIMES[s.cite]);
      return `<section class="stage rstage">
        <button class="stage-head" type="button" data-name="${esc(s.name)}" aria-expanded="${open}" aria-controls="${id}">
          <span class="stage-title">${esc(s.name)}</span><span class="chip chip-${s.grade}">${s.grade}</span><span class="chev">${icon("i-chevron")}</span>
        </button>
        <div class="stage-body" id="${id}"${open ? "" : " hidden"}>
          <div class="rcols">
            <div class="rsum"><b>Summary:</b><p>${esc(s.summary)}</p><span class="id">ID: ${esc(s.id)}</span></div>
            <div class="rfail">
              <b>${failing ? "Failure reasons" : "Citation"}</b>
              <p><span class="time">${t}</span>${esc(TRANSCRIPT[s.cite][1].slice(0, 150))}${TRANSCRIPT[s.cite][1].length > 150 ? "…" : ""}</p>
              <div class="reason">${icon("i-sparkle")}<span>AI Reason: ${esc(s.reason)}</span></div>
              <button class="btn-secondary" type="button" data-jump="${s.cite}">Jump to moment</button>
            </div>
          </div>
        </div>
      </section>`;
    })
    .join("");
  return `<div class="step-results">
      <h3>Step Results</h3>
      <div class="step-bar">${bar}</div>
      <div class="step-legend">${legend}</div>
    </div>
    <button class="text-btn expand-btn" type="button" data-expand aria-pressed="${all}">${all ? "Collapse All" : "Expand All"}${icon("i-chevron")}</button>
    <div class="stages">${items || `<p class="ov-empty">No steps match your filters.</p>`}</div>`;
}

function transcriptHtml(stages) {
  const c = callPage;
  const q = c.query.toLowerCase();
  const rows = TRANSCRIPT.map(([who, text], i) => {
    const tags = stages.filter((s) => s.cite === i);
    return { who, text, i, tags };
  }).filter((r) => (c.grade === "All" || r.tags.some((t) => t.grade === c.grade)) && (!q || r.text.toLowerCase().includes(q)));
  const items = rows
    .map(({ who, text, i, tags }) => {
      const shown = tags.slice(0, 2).map((t) => `<span class="chip chip-${t.grade}">${esc(t.name)}</span>`).join("");
      const more = tags.length > 2 ? `<span class="chip chip-more">+${tags.length - 2}</span>` : "";
      return `<article class="tx tx-${who}${tags.length ? " tx-hl" : ""}${c.jump === i ? " tx-jump" : ""}" id="tx-${i}" data-i="${i}">
        <div class="tx-top"><b>${esc(speakerName(who))}</b><span class="tx-time">${hms(TX_TIMES[i])}</span></div>
        ${tags.length ? `<div class="tx-tags">${shown}${more}</div>` : ""}
        <p>${esc(text)}</p>
      </article>`;
    })
    .join("");
  return `<div class="tx-list">${items || `<p class="ov-empty">No transcript lines match your filters.</p>`}</div>`;
}

function renderCallBody() {
  const c = callPage;
  if (!c.call) return;
  const stages = callStages(c.call);
  if (!c.open) c.open = new Set(stages.filter((s) => s.grade !== "Good").map((s) => s.name));
  document.getElementById("cd-pb-title").textContent = c.tab === "timeline" ? "Customer Timeline" : `${state.playbook} Playbook`;
  document.getElementById("cd-meta").innerHTML = `<span><b>Agent:</b> ${esc(c.agent.name)}</span><span><b>Call Duration:</b> ${esc(c.call.duration)}</span>`;
  document.querySelectorAll("#cd-tabs button").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.tab === c.tab)));
  const results = document.getElementById("cd-results");
  const tx = document.getElementById("cd-transcript");
  const tl = document.getElementById("cd-timeline");
  results.hidden = c.tab !== "results";
  tx.hidden = c.tab !== "transcript";
  tl.hidden = c.tab !== "timeline";
  document.getElementById("dd-cd-grade").hidden = c.tab === "timeline";
  document.getElementById("cd-player").hidden = c.tab === "timeline";
  if (c.tab === "results") results.innerHTML = resultsHtml(stages);
  else if (c.tab === "timeline") tl.innerHTML = timelineHtml();
  else {
    tx.innerHTML = transcriptHtml(stages);
    markCurrent();
    if (c.jump !== null) {
      const el = document.getElementById("tx-" + c.jump);
      if (el) el.scrollIntoView({ block: "center" });
    }
  }
}

function renderCall() {
  if (!callPage.call) return;
  renderCallSummary();
  renderInsights();
  renderCallBody();
  paintPlayer();
}

function paintPlayer() {
  const c = callPage;
  if (!c.call) return;
  const total = secs(c.call.duration);
  document.getElementById("cd-fill").style.width = `${(c.pos / total) * 100}%`;
  document.getElementById("cd-time").textContent = `${clock(c.pos)} / ${clock(total)}`;
  const btn = document.getElementById("cd-play");
  btn.innerHTML = icon(c.playing ? "i-pause" : "i-play", 18);
  btn.setAttribute("aria-label", c.playing ? "Pause call" : "Play call");
}

// Marks the transcript line being "played" at the current position.
function markCurrent() {
  if (callPage.tab !== "transcript") return;
  let cur = -1;
  TX_TIMES.forEach((t, i) => {
    if (t <= callPage.pos && callPage.playing) cur = i;
  });
  document.querySelectorAll("#cd-transcript .tx").forEach((el) => el.classList.toggle("tx-cur", Number(el.dataset.i) === cur));
}

function stopCall() {
  clearInterval(callPage.timer);
  callPage.playing = false;
  paintPlayer();
}
function toggleCall() {
  const c = callPage;
  if (c.playing) return stopCall();
  const total = secs(c.call.duration);
  if (c.pos >= total) c.pos = 0;
  c.playing = true;
  paintPlayer();
  c.timer = setInterval(() => {
    c.pos += 1;
    if (c.pos >= secs(c.call.duration)) stopCall();
    paintPlayer();
    markCurrent();
  }, 1000);
}

function openCall(agent, lead) {
  const calls = callsFor(forPlaybook(agent));
  const rec = SR_BY_ID.get(lead);
  const inAgent = calls.find((c) => c.lead === lead);
  // Calls from the search dataset (and their timeline touchpoints) are built from the record; agent-page calls keep their own data.
  const useRec = Boolean(rec) && !(rec.synth && inAgent);
  const call = useRec ? callFromRecord(rec) : inAgent || calls[0];
  const c = callPage;
  if (c.call !== call || c.agent !== agent) {
    stopCall();
    Object.assign(c, { agent, call, pb: state.playbook, tab: "results", query: "", grade: "All", open: null, insTab: "Goals", insOpen: true, jump: null, pos: 0 });
    const contact = mockContact(call.lead);
    c.client = useRec ? rec.customer : contact.client;
    c.phone = useRec ? rec.phone : contact.phone;
    c.leadNo = customerForCall(agent, call, c.client, c.phone).leadNo;
    document.getElementById("cd-search").value = "";
    document.getElementById("cd-client").textContent = c.client;
    document.getElementById("cd-brand").innerHTML = call.brand === "FDR" ? icon("i-logo-fdr", 34, 16) : icon("i-logo-achieve", 16);
    document.getElementById("cd-brand").className = `brand brand-${call.brand === "FDR" ? "fdr" : "achieve"}`;
    document.getElementById("cd-brand").title = call.brand;
    document.getElementById("cd-lead").textContent = "#" + c.leadNo;
    document.getElementById("cd-phone").textContent = c.phone;
    dropdownPainters.forEach((p) => p());
  }
  if (pendingTab.value) {
    c.tab = pendingTab.value;
    pendingTab.value = null;
  }
  const fromSearch = c.from === "search";
  document.getElementById("cd-back").href = fromSearch ? "#/calls" : `#/agent/${agent.slug}`;
  document.getElementById("cd-back-name").textContent = fromSearch ? "Call Results" : agent.name;
  document.title = `EvalAI - Sales - Call Details #${call.lead}`;
  renderCall();
}

function downloadCall() {
  const rows = TRANSCRIPT.map(([who, text], i) => [speakerName(who).replace(/:$/, ""), hms(TX_TIMES[i]), text]);
  saveCsv([["Speaker", "Time", "Text"], ...rows], `call-${callPage.call.lead}-transcript.csv`);
  toast(`Exported ${rows.length} lines`);
}

// ---------- Call Results: mock search data + multi-call stitching (MVP+ one pager, P1 Retail Sales) ----------
// Every field here is mock data. Customers own 1-4 calls; calls are linked by phone (ANI), FDR ID and Salesforce Lead ID.
const SR_FIRST = ["Benny", "Laura", "Pedro", "Joan", "Dana", "Marcus", "Priya", "Tomas", "Alicia", "Grant", "Nina", "Owen", "Rosa", "Victor", "Mei", "Caleb", "Hana", "Derek", "Sofia", "Isaac"];
const SR_LAST = ["Jet", "Hale", "Ruiz", "Burris", "Whitfield", "Bell", "Nair", "Ortega", "Kim", "Lowell", "Petrov", "Daniels", "Mendez", "Okafor", "Tan", "Brandt", "Sato", "Fields", "Rinaldi", "Cole"];
const SR_STREETS = ["Maple Ave", "Oak St", "Cedar Ln", "Sunset Blvd", "Lakeview Dr", "Pine St", "Highland Rd", "Willow Way", "River Rd", "Elm St"];
const SR_CITIES = [["Phoenix", "AZ"], ["Tampa", "FL"], ["Dallas", "TX"], ["Denver", "CO"], ["Columbus", "OH"], ["Charlotte", "NC"], ["Sacramento", "CA"], ["Las Vegas", "NV"]];
const SR_SOURCES = ["API", "Lending Tree", "Direct Mail", "Web Form", "Referral"];
const SR_OPPS = ["Debt Settlement", "Consolidation Loan", "Credit Counseling", "Bankruptcy Referral"];
const SR_ABI = ["ABI 1", "ABI 2", "ABI 3", "ABI 4", "ABI 5"];
const SR_UTMS = ["google / cpc / debt-relief", "facebook / paid-social / hardship", "email / nurture / q3", "direct / none / none", "partner / lendingtree / api"];
const SR_OUTCOMES = ["Enrolled", "Pending docs", "Callback scheduled", "Declined", "No decision"];
const SR_FINAL = ["Enrolled", "Enrolled", "Pending docs", "Callback scheduled", "Declined", "No decision"];
const SR_INTERIM = ["Callback scheduled", "Pending docs", "No decision"];
const SR_TAGS = ["Fee exception offered", "Term exception offered", "Omitted eligible debt", "Competitor mentioned", "Hardship disclosed", "Callback requested", "Cost objection", "Rapport built"];
const SR_TOD = ["Morning (8am-12pm)", "Afternoon (12-4pm)", "Evening (4-8pm)"];
const todOf = (ms) => {
  const h = new Date(ms).getHours();
  return h < 12 ? SR_TOD[0] : h < 16 ? SR_TOD[1] : SR_TOD[2];
};
const dayStart = (ms) => {
  const d = new Date(ms);
  return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
};
const fmtDateTime = (ms) => `${fmtDate(ms)} · ${new Date(ms).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}`;

const SR_BY_ID = new Map();
const SR_LEADNOS = new Set();
const SR_CUSTOMERS = new Map();
const SR_CALLS = [];

// Builds one customer and their calls (oldest first). `anchor` pins the newest call to a call that already exists elsewhere
// in the prototype (agent-page calls), so its timeline can be synthesized around it.
function srBuildCustomer(rand, cid, { n, name, phone, anchor }) {
  const num = (lo, hi) => lo + Math.floor(rand() * (hi - lo + 1));
  const pick = (a) => a[Math.floor(rand() * a.length)];
  const [first, ...rest] = name ? name.split(" ") : [pick(SR_FIRST), pick(SR_LAST)];
  const last = rest.join(" ") || "Client";
  const [city, st] = pick(SR_CITIES);
  const digits = phone ? phone.replace(/\D/g, "") : `${num(201, 989)}${num(200, 989)}${num(1000, 9999)}`;
  const eligibleDebt = num(20, 100);
  // Lead number is shared by every call for this customer; each call keeps its own call ID (`lead` on the record).
  let leadNo = anchor ? anchor.lead : "";
  while (!leadNo || SR_BY_ID.has(leadNo) || SR_LEADNOS.has(leadNo)) leadNo = String(num(100000, 999999));
  SR_LEADNOS.add(leadNo);
  const base = {
    cid,
    leadNo,
    customer: `${first} ${last}`,
    phone: `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`,
    phoneDigits: digits,
    email: `${first}.${last}${num(1, 99)}@example.com`.toLowerCase().replace(/\s/g, ""),
    address: `${num(100, 9899)} ${pick(SR_STREETS)}, ${city}, ${st}`,
    fdrId: `FDR-${num(40000, 99999)}`,
    sfLead: "00Q" + Math.floor(rand() * 36 ** 8).toString(36).toUpperCase().padStart(8, "0"),
    leadSource: pick(SR_SOURCES),
    opp: pick(SR_OPPS),
    abi: pick(SR_ABI),
    utm: pick(SR_UTMS),
    eligibleDebt,
    brand: anchor ? anchor.brand : rand() > 0.5 ? "FDR" : "Achieve",
    touch: n,
  };
  const calls = [];
  let t = anchor ? anchor.date : dayStart(Date.now()) - num(0, 30) * 86400000 + num(8 * 60, 19 * 60) * 60000;
  let prevAgent = null;
  for (let k = n - 1; k >= 0; k--) {
    const isAnchor = Boolean(anchor) && k === n - 1;
    if (k < n - 1) t = dayStart(t) - num(1, 6) * 86400000 + num(8 * 60, 19 * 60) * 60000;
    const agent = isAnchor ? anchor.agent : prevAgent && rand() < 0.6 ? prevAgent : pick(ALL_AGENTS);
    prevAgent = agent;
    let lead = isAnchor ? anchor.lead : "";
    while (!isAnchor && (!lead || SR_BY_ID.has(lead) || SR_LEADNOS.has(lead))) lead = String(num(100000, 999999));
    const durSec = isAnchor ? anchor.durSec : k === 0 ? num(420, 1900) : rand() < 0.35 ? num(60, 180) : num(180, 1100);
    const outcome = k === n - 1 ? pick(SR_FINAL) : pick(SR_INTERIM);
    const h = hash(agent.slug);
    const rec = {
      ...base,
      lead,
      genesys: "GEN-" + num(10000000, 99999999),
      date: t,
      durSec,
      duration: hms(durSec),
      agent: agent.name,
      agentSlug: agent.slug,
      agentEmail: agent.email,
      score: isAnchor ? anchor.score : Math.round((40 + rand() * 57) * 100) / 100,
      type: k === 0 ? "Initial" : "Follow-up",
      outcome,
      tags: SR_TAGS.filter(() => rand() < 0.22).slice(0, 3),
      handle: Math.round(durSec / 60 + 2 + rand() * 5),
      lpa: 18 + (h % 25),
      copa: 10 + ((h >>> 8) % 15),
      payout: outcome === "Enrolled" ? num(150, 400) + eligibleDebt * 4 : 0,
      synth: isAnchor,
    };
    SR_BY_ID.set(lead, rec);
    calls.push(rec);
  }
  return { cid, ...base, calls: calls.reverse() };
}

const srRand = rng(20261020);
for (let i = 0; i < 48; i++) {
  const cust = srBuildCustomer(srRand, "C" + i, { n: [1, 2, 2, 3, 3, 4][Math.floor(srRand() * 6)] });
  SR_CUSTOMERS.set(cust.cid, cust);
  SR_CALLS.push(...cust.calls);
}

const srRatingCache = new Map();
function srRatings(rec) {
  const key = rec.lead + "|" + state.playbook;
  if (!srRatingCache.has(key)) {
    const rand = rng(hash(key + "sr"));
    srRatingCache.set(key, cats().map(() => genRating(rand, rec.score)));
  }
  return srRatingCache.get(key);
}
const srCallCache = new Map();
function callFromRecord(rec) {
  const key = rec.lead + "|" + state.playbook;
  if (!srCallCache.has(key)) srCallCache.set(key, { brand: rec.brand, date: rec.date, duration: rec.duration, lead: rec.lead, score: rec.score, r: srRatings(rec) });
  return srCallCache.get(key);
}

// Customer (and lead) behind a call. Calls that only exist on an agent page get a synthesized customer on first use.
function customerForCall(agent, call, client, phone) {
  let rec = SR_BY_ID.get(call.lead);
  if (!rec) {
    const rand = rng(hash(call.lead + "timeline"));
    const anchor = { agent, lead: call.lead, date: call.date + (8 * 60 + (hash(call.lead) % 600)) * 60000, durSec: secs(call.duration), score: call.score, brand: call.brand };
    const cust = srBuildCustomer(rand, "S" + call.lead, { n: 2 + Math.floor(rand() * 3), name: client, phone, anchor });
    SR_CUSTOMERS.set(cust.cid, cust);
    SR_CALLS.push(...cust.calls);
    rec = SR_BY_ID.get(call.lead);
  }
  return SR_CUSTOMERS.get(rec.cid);
}
const timelineCustomer = () => customerForCall(callPage.agent, callPage.call, callPage.client, callPage.phone);

function mockContact(lead) {
  const rand = rng(hash(lead + "client"));
  return {
    client: CLIENTS[Math.floor(rand() * CLIENTS.length)],
    phone: `(${200 + Math.floor(rand() * 790)}) ${200 + Math.floor(rand() * 790)}-${1000 + Math.floor(rand() * 8999)}`,
  };
}

// Shows every call for a lead number on the Call Results page, oldest first.
function viewLead(leadNo) {
  srClearFilters();
  Object.assign(sr, { tokens: [{ raw: "#" + leadNo, type: "lead" }], match: "any", view: SR_VIEWS[0], page: 1, sort: { key: "date", dir: "asc" }, panel: false });
  document.getElementById("sr-input").value = "";
  document.querySelectorAll("#sg-fields input[data-sf]").forEach((i) => (i.value = ""));
  dropdownPainters.forEach((p) => p());
  if (location.hash === "#/calls") {
    renderSearch();
    window.scrollTo(0, 0);
  } else location.hash = "#/calls";
}

const pendingTab = { value: null };
const OUTCOME_CHIP = { Enrolled: "Good", "Pending docs": "Fair", "Callback scheduled": "Excellent", Declined: "Poor" };
const outcomeChip = (o) => `<span class="chip chip-${OUTCOME_CHIP[o] || "Incomplete"}">${esc(o)}</span>`;

function timelineHtml() {
  const cust = timelineCustomer();
  const calls = cust.calls;
  const first = calls[0];
  const last = calls[calls.length - 1];
  const days = Math.round((dayStart(last.date) - dayStart(first.date)) / 86400000);
  const delta = last.score - first.score;
  const ids = [["Phone (ANI)", cust.phone], ["FDR ID", cust.fdrId], ["Salesforce Lead ID", cust.sfLead]];
  const items = calls
    .map((t, i) => {
      const gap = i ? Math.round((dayStart(t.date) - dayStart(calls[i - 1].date)) / 86400000) : 0;
      const gapText = !i ? "First contact" : gap === 0 ? "Same day" : `${gap} day${gap === 1 ? "" : "s"} later`;
      const current = t.lead === callPage.call.lead;
      return `<li class="tl-item${current ? " cur" : ""}"${current ? ' aria-current="true"' : ""}>
        <span class="tl-dot">${i + 1}</span>
        <div class="tl-card">
          <div class="tl-cell"><b>Touchpoint ${i + 1}</b><span class="sub">${fmtDateTime(t.date)}</span><span class="sub">${gapText}</span></div>
          <div class="tl-cell"><b>${esc(t.agent)}</b><span class="sub">${esc(t.agentEmail)}</span></div>
          <div class="tl-cell"><span class="chip chip-${t.type === "Initial" ? "Excellent" : "Incomplete"}">${t.type}</span><span class="sub" title="Genesys Interaction ${esc(t.genesys)}">Call #${t.lead}</span></div>
          <div class="tl-cell"><b class="tone-${tone(t.score)}">${score2(t.score)}</b><span class="sub">Call score</span></div>
          <div class="tl-cell">${outcomeChip(t.outcome)}<span class="sub">DPR outcome</span></div>
          <div class="tl-cell tl-act">${current ? `<span class="tl-now">Viewing</span>` : `<a class="text-btn" href="#/agent/${t.agentSlug}/call/${t.lead}">View call</a>`}</div>
        </div>
      </li>`;
    })
    .join("");
  return `<div class="tl-top">
      <div class="tl-stat"><span>Touchpoints</span><b>${calls.length}</b></div>
      <div class="tl-stat"><span>Time span</span><b>${days} day${days === 1 ? "" : "s"}</b></div>
      <div class="tl-stat"><span>Score change</span><b class="tone-${delta >= 0 ? "positive" : "negative"}">${delta >= 0 ? "+" : ""}${delta.toFixed(2)} pts</b></div>
      <div class="tl-stat"><span>Latest outcome</span>${outcomeChip(last.outcome)}</div>
      <button class="btn-secondary tl-all" type="button" data-leadcalls>View all ${calls.length} calls for lead #${esc(cust.leadNo)}</button>
    </div>
    <div class="tl-ids"><span class="tl-linked">Linked by</span>${ids.map(([k, v]) => `<span class="tl-id">${icon("i-check", 14)}<span class="k">${k}</span>${esc(v)}</span>`).join("")}</div>
    <ol class="tl" aria-label="Customer touchpoints in chronological order">${items}</ol>`;
}

// ---------- Call Results page ----------
const SR_FIELDS = [
  { type: "phone", label: "Phone (ANI)", ph: "(480) 555-0142" },
  { type: "address", label: "Address", ph: "123 Main St" },
  { type: "lead", label: "Lead ID", ph: "#482113" },
  { type: "fdr", label: "FDR ID", ph: "FDR-48213" },
  { type: "email", label: "Email", ph: "jane@example.com" },
  { type: "customer", label: "Customer name", ph: "Jane Smith" },
];
const SR_TYPE_LABEL = { phone: "Phone", lead: "Lead ID", fdr: "FDR ID", email: "Email", address: "Address", customer: "Name", text: "Keyword" };
const SR_GROUPS = [
  { key: "date", label: "Call date", single: true, options: ["Last 7 days", "Last 30 days"] },
  { key: "tod", label: "Time of day", options: SR_TOD },
  { key: "type", label: "Call type", options: ["Initial", "Follow-up"] },
  { key: "outcome", label: "DPR outcome", options: SR_OUTCOMES },
  { key: "leadSource", label: "Lead source type", options: SR_SOURCES },
  { key: "opp", label: "Opportunity type", options: SR_OPPS },
  { key: "abi", label: "ABI bucket", options: SR_ABI },
  { key: "utm", label: "UTM", options: SR_UTMS },
  { key: "tags", label: "Behavior tags", options: SR_TAGS },
];
const SR_VIEWS = ["Call Details", STAGE_VIEW, METRICS_VIEW];

const sr = { tokens: [], match: "any", sel: {}, dur: ["", ""], debt: ["", ""], view: SR_VIEWS[0], hl: false, panel: false, page: 1, pageSize: 10, sort: { key: "date", dir: "desc" } };

function srDetect(raw) {
  const s = raw.trim();
  if (s.includes("@")) return "email";
  if (/^fdr/i.test(s)) return "fdr";
  if (/^#?\d{4,6}$/.test(s)) return "lead";
  if (/^[\d\s().+-]+$/.test(s) && s.replace(/\D/g, "").length >= 7) return "phone";
  if (/\d/.test(s) && /[a-z]/i.test(s) && /\s/.test(s)) return "address";
  return "text";
}
const srMakeToken = (raw, type) => ({ raw, type: type || srDetect(raw) });
const srSplit = (v) => v.split(/[,;\n]+/).map((s) => s.trim()).filter(Boolean);
// Values typed in the bar (type auto-detected) and in the per-field inputs (type fixed by the field) that are not yet committed.
const srPending = () => [
  ...srSplit(document.getElementById("sr-input").value).map((v) => srMakeToken(v)),
  ...[...document.querySelectorAll("#sg-fields input[data-sf]")].flatMap((i) => srSplit(i.value).map((v) => srMakeToken(v, i.dataset.sf))),
];
const srAllTokens = () => [...sr.tokens, ...srPending()];
const alnum = (s) => s.toLowerCase().replace(/[^a-z0-9]/g, "");

function srMatchToken({ raw, type }, r) {
  const q = raw.toLowerCase();
  const d = raw.replace(/\D/g, "");
  switch (type) {
    case "phone": {
      const n = d.length === 11 && d[0] === "1" ? d.slice(1) : d;
      return n.length > 0 && r.phoneDigits.includes(n);
    }
    case "lead":
      return d.length > 0 && (r.leadNo.includes(d) || r.lead.includes(d));
    case "fdr":
      return alnum(raw).length > 0 && alnum(r.fdrId).includes(alnum(raw));
    case "email":
      return r.email.includes(q);
    case "address":
      return r.address.toLowerCase().includes(q);
    case "customer":
      return r.customer.toLowerCase().includes(q);
    default:
      return [r.customer, r.address, r.email, r.agent].some((t) => t.toLowerCase().includes(q));
  }
}

function srGroupMatch(key, s, r, now) {
  switch (key) {
    case "date":
      return r.date >= now - (s.has("Last 7 days") ? 7 : 30) * 86400000;
    case "tod":
      return s.has(todOf(r.date));
    case "tags":
      return r.tags.some((t) => s.has(t));
    default:
      return s.has(r[key]);
  }
}

function srFiltered() {
  const toks = srAllTokens();
  const now = Date.now();
  const inRange = (v, [lo, hi]) => (lo === "" || v >= Number(lo)) && (hi === "" || v <= Number(hi));
  return SR_CALLS.filter((r) => {
    if (toks.length) {
      // Several values of one field always match any; "all" then requires every field that has values to match.
      if (sr.match === "all") {
        const types = new Set(toks.map((t) => t.type));
        for (const type of types) if (!toks.some((t) => t.type === type && srMatchToken(t, r))) return false;
      } else if (!toks.some((t) => srMatchToken(t, r))) return false;
    }
    for (const g of SR_GROUPS) {
      const s = sr.sel[g.key];
      if (s && s.size && !srGroupMatch(g.key, s, r, now)) return false;
    }
    return inRange(r.durSec / 60, sr.dur) && inRange(r.eligibleDebt, sr.debt);
  }).map((r) => ({ ...r, r: srRatings(r) }));
}

const tagsCell = (r) => {
  if (!r.tags.length) return `<span class="sr-none">—</span>`;
  const more = r.tags.length > 2 ? `<span class="chip chip-more" title="${esc(r.tags.join(", "))}">+${r.tags.length - 2}</span>` : "";
  return r.tags.slice(0, 2).map((t) => `<span class="chip chip-tag">${esc(t)}</span>`).join("") + more;
};
const agentCell = (r) => `<a class="agent-link" href="#/agent/${r.agentSlug}">${esc(r.agent)}</a>`;
const SR_LEAD = [
  { key: "brand", label: "Source", px: 64, kind: "brand" },
  { key: "date", label: "Call Date", px: 190, sortable: true, render: (r) => fmtDateTime(r.date) },
  { key: "leadNo", label: "Lead ID", px: 98, sortable: true, render: (r) => `<button class="link-btn" type="button" data-act="lead" title="View all calls for this lead">#${esc(r.leadNo)}</button>` },
];
const SR_END = [{ key: "details", label: "Call Details", px: 139, kind: "details" }];
const SR_SCORE = { key: "score", label: "Avg. Scoring", px: 130, num: true, sortable: true, bold: true, fmt: score2, tone: tone, hl: true };
const SR_AGENT = { key: "agent", label: "Agent", px: 150, sortable: true, render: agentCell };

function srCols() {
  if (sr.view === STAGE_VIEW) return [...SR_LEAD, SR_AGENT, { ...SR_SCORE, px: 163 }, ...cats().map((s, i) => ({ key: "r" + i, label: s, px: 112, sortable: true, rating: i })), ...SR_END];
  if (sr.view === METRICS_VIEW) {
    return [
      ...SR_LEAD,
      SR_AGENT,
      SR_SCORE,
      { key: "handle", label: "Handle Time", px: 120, num: true, sortable: true, fmt: (v) => v + " min", hl: true, lowBetter: true },
      { key: "lpa", label: "Agent LPA", px: 110, num: true, sortable: true, fmt: String, hl: true },
      { key: "copa", label: "CoPA (per 8 hrs)", px: 140, num: true, sortable: true, fmt: String, hl: true },
      { key: "payout", label: "Payout", px: 100, num: true, sortable: true, fmt: (v) => (v ? "$" + v.toLocaleString("en-US") : "—"), hl: true, skipZero: true },
      { key: "eligibleDebt", label: "Eligible Debt", px: 120, num: true, sortable: true, fmt: (v) => v + "%", hl: true },
      ...SR_END,
    ];
  }
  return [
    ...SR_LEAD,
    { key: "customer", label: "Customer", px: 150, sortable: true, render: (r) => esc(r.customer) },
    { key: "lead", label: "Call ID", px: 90, sortable: true, render: (r) => "#" + esc(r.lead) },
    { key: "phone", label: "Phone (ANI)", px: 130, render: (r) => esc(r.phone) },
    SR_AGENT,
    { key: "durSec", label: "Duration", px: 100, sortable: true, render: (r) => r.duration },
    { key: "leadSource", label: "Lead Source", px: 120, sortable: true, render: (r) => esc(r.leadSource) },
    { key: "opp", label: "Opportunity Type", px: 170, sortable: true, render: (r) => esc(r.opp) },
    { key: "abi", label: "ABI", px: 80, sortable: true, render: (r) => esc(r.abi) },
    { key: "eligibleDebt", label: "Eligible Debt", px: 120, num: true, sortable: true, fmt: (v) => v + "%", hl: true },
    { key: "tags", label: "Behavior Tags", px: 330, render: tagsCell },
    { key: "touch", label: "Touchpoints", px: 120, num: true, sortable: true, render: (r) => `<button class="link-btn" type="button" data-act="timeline">${r.touch} call${r.touch === 1 ? "" : "s"}</button>` },
    ...SR_END,
  ];
}

// Marks the top and bottom 10% of each highlighted numeric column across the whole result set.
function srHighlights(rows, cols) {
  const out = {};
  const k = Math.max(1, Math.round(rows.length * 0.1));
  cols
    .filter((c) => c.hl)
    .forEach((c) => {
      const vals = rows.filter((r) => !(c.skipZero && !r[c.key])).map((r) => [r.lead, r[c.key]]).sort((a, b) => a[1] - b[1]);
      if (vals.length < 3) return;
      const lows = vals.slice(0, k);
      const highs = vals.slice(-k);
      if (lows[lows.length - 1][1] === highs[0][1]) return;
      const [good, bad] = c.lowBetter ? [lows, highs] : [highs, lows];
      out[c.key] = { top: new Set(good.map((x) => x[0])), bot: new Set(bad.map((x) => x[0])) };
    });
  return out;
}

function srCell(c, r, hl) {
  const html = c.render ? `<td class="${c.num ? "num" : ""}">${c.render(r)}</td>` : cellHtml(c, r);
  const h = hl && hl[c.key];
  const x = h ? (h.top.has(r.lead) ? "cell-top" : h.bot.has(r.lead) ? "cell-bot" : "") : "";
  return x ? html.replace(/^<td(?: class="([^"]*)")?/, (_, cls) => `<td class="${cls ? cls + " " : ""}${x}"`) : html;
}

function srRangeText(label, [lo, hi], unit) {
  if (lo !== "" && hi !== "") return `${label}: ${lo}–${hi}${unit}`;
  return lo !== "" ? `${label}: ≥ ${lo}${unit}` : `${label}: ≤ ${hi}${unit}`;
}

// Paints the Smart Search in the top bar (tokens, expanded panel, live match count). `all` is the current result set.
function srPaint(all = srFiltered()) {
  const tokHtml = sr.tokens.map(
    (t, i) => `<span class="sr-tok"><b>${SR_TYPE_LABEL[t.type]}</b>${esc(t.raw)}<button type="button" data-rm="${i}" aria-label="Remove ${esc(t.raw)}">×</button></span>`
  );
  document.getElementById("sr-toks").innerHTML = tokHtml.join("");
  const input = document.getElementById("sr-input");
  input.placeholder = sr.tokens.length ? "Add another value" : "Smart Search: phone, address, FDR ID, Lead ID, email or name";
  document.querySelectorAll("#sg-match button").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.match === sr.match)));

  document.getElementById("sr-groups").innerHTML = SR_GROUPS.map(
    (g) => `<div class="sr-group"><h3>${g.label}</h3><div class="sr-opts">${g.options
      .map((o) => `<button class="sr-opt" type="button" data-g="${g.key}" data-v="${esc(o)}" aria-pressed="${Boolean(sr.sel[g.key] && sr.sel[g.key].has(o))}">${esc(o)}</button>`)
      .join("")}</div></div>`
  ).join("");

  const chips = [];
  SR_GROUPS.forEach((g) => (sr.sel[g.key] ? [...sr.sel[g.key]] : []).forEach((v) => chips.push(`<span class="sr-tok"><b>${g.label}</b>${esc(v)}<button type="button" data-g="${g.key}" data-v="${esc(v)}" aria-label="Remove ${esc(v)}">×</button></span>`)));
  if (sr.dur.some((v) => v !== "")) chips.push(`<span class="sr-tok">${srRangeText("Duration", sr.dur, " min")}<button type="button" data-range="dur" aria-label="Remove duration filter">×</button></span>`);
  if (sr.debt.some((v) => v !== "")) chips.push(`<span class="sr-tok">${srRangeText("Eligible debt", sr.debt, "%")}<button type="button" data-range="debt" aria-label="Remove eligible debt filter">×</button></span>`);
  // The results page repeats the active values and filters so they can be removed without opening the panel.
  const active = document.getElementById("sr-active");
  active.hidden = chips.length + tokHtml.length === 0;
  active.innerHTML = tokHtml.join("") + chips.join("") + `<button class="text-btn" type="button" data-clear>Clear all</button>`;
  const badge = document.getElementById("sr-badge");
  badge.hidden = chips.length === 0;
  badge.textContent = chips.length;
  srSetPanel(sr.panel);
  const customers = new Set(all.map((r) => r.cid)).size;
  document.getElementById("sg-count").innerHTML = `<b>${all.length}</b> call${all.length === 1 ? "" : "s"} from ${customers} customer${customers === 1 ? "" : "s"} match`;
  document.getElementById("sg-x").hidden = !(chips.length || srAllTokens().length);
}

function renderSearch() {
  const all = sortRows(srFiltered(), sr.sort, sortValue);
  srPaint(all);
  document.getElementById("sr-hl").setAttribute("aria-pressed", String(sr.hl));
  const leadNos = new Set(all.map((r) => r.leadNo));
  const focus = sr.tokens.length === 1 && sr.tokens[0].type === "lead" && leadNos.size === 1;
  const banner = document.getElementById("sr-lead");
  banner.hidden = !focus;
  document.getElementById("sr-card").hidden = !focus && document.getElementById("sr-active").hidden;
  if (focus) {
    const cust = SR_CUSTOMERS.get(all[0].cid);
    const cs = cust.calls;
    const newest = cs[cs.length - 1];
    const span = Math.round((dayStart(newest.date) - dayStart(cs[0].date)) / 86400000);
    banner.innerHTML = `<div class="sr-lead-id"><span>Lead</span><b>#${esc(cust.leadNo)}</b></div>
      <div><span>Customer</span>${esc(cust.customer)}</div>
      <div><span>Phone (ANI)</span>${esc(cust.phone)}</div>
      <div><span>FDR ID</span>${esc(cust.fdrId)}</div>
      <div><span>Salesforce Lead ID</span>${esc(cust.sfLead)}</div>
      <div><span>Calls</span>${cs.length} over ${span} day${span === 1 ? "" : "s"}</div>
      <div><span>Latest outcome</span>${outcomeChip(newest.outcome)}</div>
      <button class="btn-secondary" type="button" data-timeline data-agent="${newest.agentSlug}" data-call="${newest.lead}">View timeline</button>`;
  }
  const pages = Math.max(1, Math.ceil(all.length / sr.pageSize));
  sr.page = Math.min(sr.page, pages);
  const rows = all.slice((sr.page - 1) * sr.pageSize, sr.page * sr.pageSize);
  const cols = srCols();
  const hl = sr.hl ? srHighlights(all, cols) : null;
  const body = rows.map((r) => `<tr data-lead="${r.lead}" data-leadno="${r.leadNo}" data-agent="${r.agentSlug}">${cols.map((c) => srCell(c, r, hl)).join("")}</tr>`).join("");
  fillTable("sr-table", cols, sr.sort, body, "No calls match your search and filters.");

  const customers = new Set(all.map((r) => r.cid)).size;
  document.getElementById("sr-note").textContent = `${all.length} call${all.length === 1 ? "" : "s"} from ${customers} customer${customers === 1 ? "" : "s"} • Filtered by ${state.playbook} Playbook`;
  document.getElementById("sr-pager-text").textContent = `Showing ${rows.length} of ${all.length} Results`;
  document.getElementById("sr-prev").disabled = sr.page <= 1;
  document.getElementById("sr-next").disabled = sr.page >= pages;
}

function srToggle(key, v) {
  const g = SR_GROUPS.find((x) => x.key === key);
  const s = sr.sel[key] || (sr.sel[key] = new Set());
  if (s.has(v)) s.delete(v);
  else {
    if (g.single) s.clear();
    s.add(v);
  }
  sr.page = 1;
  srRefresh();
}

// The Smart Search lives in the top bar on every Retail page; the results table only repaints on its own page.
const srRefresh = () => (location.hash === "#/calls" ? renderSearch() : srPaint());

function srSetPanel(open) {
  sr.panel = open;
  document.getElementById("sr-panel").hidden = !open;
  document.getElementById("sr-filter-btn").setAttribute("aria-expanded", String(open));
  document.getElementById("sr-input").setAttribute("aria-expanded", String(open));
}

function srClearFilters() {
  sr.sel = {};
  sr.dur = ["", ""];
  sr.debt = ["", ""];
  ["sr-dur-min", "sr-dur-max", "sr-debt-min", "sr-debt-max"].forEach((id) => (document.getElementById(id).value = ""));
  sr.page = 1;
  srRefresh();
}

function srClearAll() {
  sr.tokens = [];
  document.getElementById("sr-input").value = "";
  document.querySelectorAll("#sg-fields input[data-sf]").forEach((i) => (i.value = ""));
  srClearFilters();
}

// Runs the search: commits typed values, closes the panel and shows the Call Results page.
function srGo() {
  srCommit();
  srSetPanel(false);
  document.getElementById("sr-input").blur();
  if (location.hash === "#/calls") {
    renderSearch();
    window.scrollTo(0, 0);
  } else location.hash = "#/calls";
}

// Commits the typed values (bar and per-field inputs) as tokens. Returns true if anything was typed.
function srCommit() {
  const pending = srPending();
  pending.forEach((t) => {
    if (!sr.tokens.some((x) => x.type === t.type && x.raw.toLowerCase() === t.raw.toLowerCase())) sr.tokens.push(t);
  });
  document.getElementById("sr-input").value = "";
  document.querySelectorAll("#sg-fields input[data-sf]").forEach((i) => (i.value = ""));
  sr.page = 1;
  return pending.length > 0;
}

function downloadSearch() {
  const cols = srCols().filter((c) => c.kind !== "details");
  const rows = sortRows(srFiltered(), sr.sort, sortValue);
  const value = (c, r) => {
    if (c.rating !== undefined) return r.r[c.rating];
    if (c.key === "date") return fmtDateTime(r.date);
    if (c.key === "lead") return "#" + r.lead;
    if (c.key === "leadNo") return "#" + r.leadNo;
    if (c.key === "touch") return r.touch;
    if (c.key === "durSec") return r.duration;
    const v = r[c.key];
    if (Array.isArray(v)) return v.join("; ");
    return c.fmt ? c.fmt(v) : v;
  };
  saveCsv([cols.map((c) => c.label), ...rows.map((r) => cols.map((c) => value(c, r)))], "call-results.csv");
  toast(`Exported ${rows.length} calls`);
}

// ---------- Routing ----------
let prevHash = "";
function route() {
  const m = location.hash.match(/^#\/agent\/([a-z0-9-]+)(?:\/(overview)|\/call\/(\d+))?$/);
  const agent = m && ALL_AGENTS.find((a) => a.slug === m[1]);
  const isOverview = Boolean(agent && m[2]);
  const isCall = Boolean(agent && m[3]);
  const isSearch = location.hash === "#/calls";
  const wm = location.hash.match(/^#\/wholesale(?:\/(partner|agent|call|complaint)\/([a-z0-9-]+)|\/(complaints))?$/);
  const wv = wm ? wm[1] || wm[3] || "dash" : null;
  const sm = location.hash.match(/^#\/setops(?:\/(agent|call)\/([a-z0-9-]+)|\/(matrix|calls)(?:\?.*)?)?$/);
  const line = wm ? "Wholesale" : sm ? "SetOps" : "Retail";
  const isLine = line !== "Retail";
  const tm = location.hash.match(/^#\/team\/([a-z0-9-]+)$/);
  const team = tm && TEAMS.find((t) => slugify(t.name) === tm[1]);
  const cameFrom = prevHash;
  prevHash = location.hash;
  if (!agent && !isSearch && !isLine) {
    if (team) {
      if (state.viewTeam !== team || state.role !== "UM") resetTeamTables();
      state.role = "UM";
      state.viewTeam = team;
    } else if (state.viewTeam) {
      // Back to the department view when returning from a team; any other way out keeps the UM view.
      if (cameFrom.startsWith("#/team/")) state.role = "SM";
      state.viewTeam = null;
      resetTeamTables();
    }
  }
  if (isCall) {
    if (cameFrom === "#/calls") callPage.from = "search";
    else if (!/\/call\//.test(cameFrom)) callPage.from = "agent";
  }
  document.getElementById("page-team").hidden = Boolean(agent) || isSearch || isLine;
  document.querySelectorAll("#line-toggle button").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.line === line)));
  document.getElementById("logo-badge").textContent = { Retail: "Sales", Wholesale: "Wholesale", SetOps: "SetOps" }[line];
  document.getElementById("nav-dash").href = { Retail: "#/", Wholesale: "#/wholesale", SetOps: "#/setops" }[line];
  document.getElementById("dd-role").hidden = isLine;
  document.getElementById("gs").hidden = isLine;
  srSetPanel(false);
  document.getElementById("dd-so-user").hidden = line !== "SetOps";
  document.getElementById("nav-matrix").hidden = line !== "SetOps";
  document.getElementById("nav-complaints").hidden = line !== "Wholesale";
  document.getElementById("page-search").hidden = !isSearch;
  document.getElementById("page-agent").hidden = !agent || isOverview || isCall;
  document.getElementById("page-overview").hidden = !isOverview;
  document.getElementById("page-call").hidden = !isCall;
  const setCurrent = (id, on) => (on ? document.getElementById(id).setAttribute("aria-current", "page") : document.getElementById(id).removeAttribute("aria-current"));
  const inComplaints = wv === "complaints" || wv === "complaint";
  setCurrent("nav-dash", !isSearch && !(sm && sm[3] === "matrix") && !inComplaints);
  setCurrent("nav-matrix", Boolean(sm && sm[3] === "matrix"));
  setCurrent("nav-complaints", inComplaints);
  stopClip();
  if (!isCall) stopCall();
  wsShow(wv);
  soShow(sm ? sm[1] || sm[3] || "dash" : null);
  if (wm) {
    wsRoute(wv, wm[2], cameFrom);
    window.scrollTo(0, 0);
    return;
  }
  if (sm) {
    soRoute(sm[1] || sm[3] || "dash", sm[2], cameFrom);
    window.scrollTo(0, 0);
    return;
  }
  if (isOverview) {
    openOverview(agent);
  } else if (agent) {
    document.getElementById("ag-back").href = state.viewTeam ? `#/team/${slugify(state.viewTeam.name)}` : "#/";
    openAgent(agent);
    if (isCall) openCall(agent, m[3]);
  } else {
    agentPage.agent = null;
    document.title = isLine ? `EvalAI - ${line}` : isSearch ? "EvalAI - Sales - Call Results" : team ? `EvalAI - Sales - ${team.name}` : "EvalAI - Sales - Team Overview";
    if (isSearch) renderSearch();
    else if (!isLine) paintRole();
  }
  window.scrollTo(0, 0);
}

// ---------- Init ----------
const PLAYBOOKS = Object.keys(PLAYBOOK_DEFS);
const DATES = ["This week", "Last week", "Last 30 days", "This quarter"];

renderKpis();
bindSort("steps-table", () => state.steps, renderSteps);
bindSort("agents-table", () => state.agents, renderAgents);
bindSort("calls-table", () => agentPage.sort, renderCalls);

const setPlaybook = (v) => {
  state.playbook = v;
  // Category columns differ per playbook, so sort keys and hidden chart series no longer apply.
  state.agents = { key: null, dir: "asc" };
  agentPage.sort = { key: null, dir: "asc" };
  agentPage.hidden = new Set();
  if (agentPage.agent) renderLegend();
  ov.stage = "All";
  ov.open = null;
  callPage.open = null;
  callPage.grade = "All";
  callPage.jump = null;
  if (/^r\d+$/.test(sr.sort.key || "")) sr.sort = { key: "date", dir: "desc" };
  renderAll();
};
const setDate = (v) => {
  state.date = v;
};
setupDropdown("dd-playbook", PLAYBOOKS, () => state.playbook, setPlaybook, { prefix: "Select Playbook: " });
setupDropdown("dd-team", () => ["All teams", ...(state.role === "SM" ? TEAMS.map((t) => t.name) : ["Team A", "Team B", "Team C"])], () => (state.role === "SM" ? state.smTeam : state.team), (v) => {
  if (state.role === "SM") state.smTeam = v;
  else state.team = v;
  state.page = 1;
  renderAll();
});
setupDropdown("dd-date", DATES, () => state.date, setDate, { lead: "i-calendar" });
setupDropdown("dd-ag-playbook", PLAYBOOKS, () => state.playbook, setPlaybook, { prefix: "Select Playbook: " });
setupDropdown("dd-ag-date", DATES, () => state.date, setDate, { lead: "i-calendar" });
setupDropdown("dd-ov-playbook", PLAYBOOKS, () => state.playbook, setPlaybook, { prefix: "Select Playbook: " });
setupDropdown("dd-cd-playbook", PLAYBOOKS, () => state.playbook, setPlaybook, { prefix: "Select Playbook: " });
setupDropdown("dd-cd-grade", ["All", ...GRADES, "Incomplete"], () => callPage.grade, (v) => {
  callPage.grade = v;
  renderCallBody();
}, { prefix: "Filter by grade - " });
setupDropdown("dd-ov-stage", () => ["All", ...cats()], () => ov.stage, (v) => {
  ov.stage = v;
  renderOverview();
}, { prefix: "Filter by stage - " });
setupDropdown("dd-ov-grade", ["All", ...GRADES], () => ov.grade, (v) => {
  ov.grade = v;
  renderOverview();
}, { prefix: "Filter by grade - " });
setupDropdown("dd-view", [STAGE_VIEW, METRICS_VIEW], () => state.view, (v) => {
  state.view = v;
  state.agents = { key: null, dir: "asc" };
  state.page = 1;
  renderAgents();
});
setupDropdown("dd-size", ["5", "10", "15"], () => String(state.pageSize), (v) => {
  state.pageSize = Number(v);
  state.page = 1;
  renderAgents();
}, { prefix: "View " });
setupDropdown("dd-range", ["Last 4 weeks", "Last 6 weeks", "Last 8 weeks"], () => `Last ${agentPage.weeks} weeks`, (v) => {
  agentPage.weeks = Number(v.match(/\d+/)[0]);
  renderPlaybookChart();
  renderChart();
});

const ROLE_COPY = {
  UM: { h1: "Welcome back, Keeley", sub: "Overview at your team’s call scoring and outcomes" },
  SM: { h1: "Welcome back, Courtney", sub: "Overview at your teams’ call scoring and outcomes" },
};
function setRole(role) {
  // Switches the view and returns to the dashboard when called from another page.
  const onDash = location.hash === "#/" || location.hash === "";
  if (state.role === role && !state.viewTeam && onDash) return;
  state.role = role;
  state.viewTeam = null;
  resetTeamTables();
  paintRole();
  if (!onDash) location.hash = "#/";
}

// Rows and sortable columns differ between views, so reset paging and sorting.
function resetTeamTables() {
  state.page = 1;
  state.steps = { key: null, dir: "asc" };
  state.agents = { key: null, dir: "asc" };
}

// Paints the team page for the current role, or for the team opened from the SM view.
function paintRole() {
  const t = state.role === "UM" ? state.viewTeam : null;
  document.getElementById("team-h1").textContent = t ? t.name : ROLE_COPY[state.role].h1;
  document.getElementById("team-sub").textContent = t ? "Overview at this team’s call scoring and outcomes" : ROLE_COPY[state.role].sub;
  document.getElementById("team-back").hidden = !t;
  document.getElementById("dd-team").hidden = Boolean(t);
  renderKpis();
  renderSteps();
  renderAgents();
  dropdownPainters.forEach((p) => p());
}
// The dropdown lives in the top bar, so it also works from other Sales pages: it switches the view and returns to the dashboard.
setupDropdown("dd-role", ["UM", "SM"], () => state.role, setRole, { prefix: "View as: " });

document.getElementById("search").addEventListener("input", (e) => {
  state.query = e.target.value.trim();
  state.page = 1;
  renderSteps();
  renderAgents();
});
document.getElementById("pg-prev").addEventListener("click", () => {
  state.page -= 1;
  renderAgents();
});
document.getElementById("pg-next").addEventListener("click", () => {
  state.page += 1;
  renderAgents();
});
document.getElementById("download").addEventListener("click", downloadCsv);

document.getElementById("ag-search").addEventListener("input", (e) => {
  agentPage.query = e.target.value.trim();
  renderCalls();
});
document.getElementById("ag-download").addEventListener("click", () => {
  const rows = visibleCalls();
  saveCsv(
    [["Source", "Call Date", "Duration", "Lead ID", "Avg. Scoring", ...cats()], ...rows.map((c) => [c.brand, fmtDate(c.date), c.duration, "#" + c.lead, score2(c.score), ...c.r])],
    `${agentPage.agent.slug}-recent-calls.csv`
  );
  toast(`Exported ${rows.length} calls`);
});
document.getElementById("legend").addEventListener("click", (e) => {
  const btn = e.target.closest(".legend-item");
  if (!btn) return;
  const i = Number(btn.dataset.i);
  if (!agentPage.hidden.delete(i)) agentPage.hidden.add(i);
  renderLegend();
  renderChart();
});
document.getElementById("pt-legend").addEventListener("click", (e) => {
  const btn = e.target.closest(".legend-item");
  if (!btn) return;
  if (!agentPage.ptHidden.delete(btn.dataset.pb)) agentPage.ptHidden.add(btn.dataset.pb);
  renderPlaybookLegend();
  renderPlaybookChart();
});
document.getElementById("perf-overview").addEventListener("click", () => {
  location.hash = `#/agent/${agentPage.agent.slug}/overview`;
});
document.getElementById("ov-search").addEventListener("input", (e) => {
  ov.query = e.target.value.trim();
  renderOverview();
});
document.getElementById("ov-download").addEventListener("click", downloadOverview);
document.getElementById("ov-expand").addEventListener("click", () => {
  const list = filteredOverview();
  const all = list.every((s) => ov.open.has(s.name));
  list.forEach((s) => (all ? ov.open.delete(s.name) : ov.open.add(s.name)));
  renderOverview();
});
document.getElementById("ov-stages").addEventListener("click", (e) => {
  const clip = e.target.closest(".clip-btn");
  if (clip) return toggleClip(clip.closest(".clip"));
  const head = e.target.closest(".stage-head");
  if (!head) return;
  const name = head.dataset.name;
  const open = !ov.open.has(name);
  if (open) ov.open.add(name);
  else ov.open.delete(name);
  head.setAttribute("aria-expanded", String(open));
  document.getElementById(head.getAttribute("aria-controls")).hidden = !open;
  paintExpand(filteredOverview());
});
document.getElementById("calls-table").addEventListener("click", (e) => {
  const row = e.target.closest("tbody tr[data-lead]");
  if (!row) return;
  if (e.target.closest('[data-act="lead"]')) {
    const a = agentPage.agent;
    const call = callsFor(forPlaybook(a)).find((c) => c.lead === row.dataset.lead);
    const contact = mockContact(call.lead);
    return viewLead(customerForCall(a, call, contact.client, contact.phone).leadNo);
  }
  location.hash = `#/agent/${agentPage.agent.slug}/call/${row.dataset.lead}`;
});

document.getElementById("cd-search").addEventListener("input", (e) => {
  callPage.query = e.target.value.trim();
  renderCallBody();
});
document.getElementById("cd-download").addEventListener("click", downloadCall);
document.getElementById("cd-play").addEventListener("click", toggleCall);
document.getElementById("cd-track").addEventListener("click", (e) => {
  const r = e.currentTarget.getBoundingClientRect();
  callPage.pos = Math.round(((e.clientX - r.left) / r.width) * secs(callPage.call.duration));
  paintPlayer();
  markCurrent();
});
document.getElementById("cd-tabs").addEventListener("click", (e) => {
  const b = e.target.closest("button[data-tab]");
  if (!b || b.dataset.tab === callPage.tab) return;
  callPage.tab = b.dataset.tab;
  callPage.jump = null;
  renderCallBody();
});

// ---------- Call Results page ----------
setupDropdown("dd-sr-playbook", PLAYBOOKS, () => state.playbook, setPlaybook, { prefix: "Select Playbook: " });
setupDropdown("dd-sr-view", SR_VIEWS, () => sr.view, (v) => {
  sr.view = v;
  sr.sort = { key: "date", dir: "desc" };
  sr.page = 1;
  renderSearch();
});
setupDropdown("dd-sr-size", ["10", "25", "50"], () => String(sr.pageSize), (v) => {
  sr.pageSize = Number(v);
  sr.page = 1;
  renderSearch();
}, { prefix: "View " });
bindSort("sr-table", () => sr.sort, renderSearch);

const srInput = document.getElementById("sr-input");
const gs = document.getElementById("gs");
srInput.addEventListener("focus", () => srSetPanel(true));
srInput.addEventListener("input", () => {
  if (/[,;\n]/.test(srInput.value)) srCommit();
  sr.page = 1;
  srRefresh();
});
srInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    srGo();
  } else if (e.key === "Escape") {
    srSetPanel(false);
    srInput.blur();
  } else if (e.key === "Backspace" && !srInput.value && sr.tokens.length) {
    sr.tokens.pop();
    sr.page = 1;
    srRefresh();
  }
});
document.getElementById("sr-box").addEventListener("click", (e) => {
  if (!e.target.closest("button")) srInput.focus();
});
document.getElementById("sr-toks").addEventListener("click", (e) => {
  const b = e.target.closest("button[data-rm]");
  if (!b) return;
  sr.tokens.splice(Number(b.dataset.rm), 1);
  sr.page = 1;
  srRefresh();
});
document.getElementById("sr-filter-btn").addEventListener("click", () => srSetPanel(!sr.panel));
document.getElementById("sg-x").addEventListener("click", () => {
  srClearAll();
  srInput.focus();
});
document.getElementById("sg-clear").addEventListener("click", srClearAll);
document.getElementById("sg-go").addEventListener("click", srGo);
// Per-field inputs: values count live toward the match total, and Enter or a comma turns them into chips.
const sgFields = document.getElementById("sg-fields");
sgFields.addEventListener("input", (e) => {
  if (/[,;]/.test(e.target.value)) srCommit();
  sr.page = 1;
  srRefresh();
});
sgFields.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    srGo();
  } else if (e.key === "Escape") srSetPanel(false);
});
document.getElementById("sg-match").addEventListener("click", (e) => {
  const b = e.target.closest("button[data-match]");
  if (!b) return;
  sr.match = b.dataset.match;
  sr.page = 1;
  srRefresh();
});
// The panel re-renders its buttons on every change, so the click path is read from the event instead of the (detached) target.
document.addEventListener("click", (e) => {
  if (sr.panel && !e.composedPath().includes(gs)) srSetPanel(false);
});
document.getElementById("sr-groups").addEventListener("click", (e) => {
  const b = e.target.closest(".sr-opt");
  if (b) srToggle(b.dataset.g, b.dataset.v);
});
document.getElementById("sr-active").addEventListener("click", (e) => {
  const b = e.target.closest("button");
  if (!b) return;
  if (b.dataset.clear !== undefined) return srClearAll();
  if (b.dataset.rm !== undefined) {
    sr.tokens.splice(Number(b.dataset.rm), 1);
    sr.page = 1;
    return srRefresh();
  }
  if (b.dataset.range) {
    const [a, z] = b.dataset.range === "dur" ? ["sr-dur-min", "sr-dur-max"] : ["sr-debt-min", "sr-debt-max"];
    document.getElementById(a).value = "";
    document.getElementById(z).value = "";
    sr[b.dataset.range] = ["", ""];
    sr.page = 1;
    return srRefresh();
  }
  srToggle(b.dataset.g, b.dataset.v);
});
[["sr-dur-min", "dur", 0], ["sr-dur-max", "dur", 1], ["sr-debt-min", "debt", 0], ["sr-debt-max", "debt", 1]].forEach(([id, key, i]) =>
  document.getElementById(id).addEventListener("input", (e) => {
    sr[key][i] = e.target.value;
    sr.page = 1;
    srRefresh();
  })
);
document.getElementById("sr-hl").addEventListener("click", () => {
  sr.hl = !sr.hl;
  renderSearch();
});
document.getElementById("sr-prev").addEventListener("click", () => {
  sr.page -= 1;
  renderSearch();
});
document.getElementById("sr-next").addEventListener("click", () => {
  sr.page += 1;
  renderSearch();
});
document.getElementById("sr-download").addEventListener("click", downloadSearch);
document.getElementById("sr-table").addEventListener("click", (e) => {
  if (e.target.closest("a, .th-btn")) return;
  const row = e.target.closest("tbody tr[data-lead]");
  if (!row) return;
  if (e.target.closest('[data-act="lead"]')) return viewLead(row.dataset.leadno);
  if (e.target.closest('[data-act="timeline"]')) pendingTab.value = "timeline";
  location.hash = `#/agent/${row.dataset.agent}/call/${row.dataset.lead}`;
});
document.getElementById("sr-lead").addEventListener("click", (e) => {
  const b = e.target.closest("[data-timeline]");
  if (!b) return;
  pendingTab.value = "timeline";
  location.hash = `#/agent/${b.dataset.agent}/call/${b.dataset.call}`;
});
document.getElementById("cd-lead").addEventListener("click", () => viewLead(callPage.leadNo));
document.getElementById("cd-timeline").addEventListener("click", (e) => {
  if (e.target.closest("[data-leadcalls]")) viewLead(callPage.leadNo);
});
document.getElementById("cd-insights").addEventListener("click", (e) => {
  const tab = e.target.closest("button[data-ins]");
  const cite = e.target.closest("[data-cite]");
  if (tab) callPage.insTab = tab.dataset.ins;
  else if (cite) callPage.insOpen = !callPage.insOpen;
  else return;
  renderInsights();
});
document.getElementById("cd-results").addEventListener("click", (e) => {
  const c = callPage;
  const jump = e.target.closest("[data-jump]");
  if (jump) {
    const i = Number(jump.dataset.jump);
    c.tab = "transcript";
    c.jump = i;
    c.pos = TX_TIMES[i];
    renderCallBody();
    paintPlayer();
    return;
  }
  if (e.target.closest("[data-expand]")) {
    const names = callStages(c.call).filter((s) => c.grade === "All" || s.grade === c.grade).map((s) => s.name);
    const all = names.every((n) => c.open.has(n));
    names.forEach((n) => (all ? c.open.delete(n) : c.open.add(n)));
    renderCallBody();
    return;
  }
  const head = e.target.closest(".stage-head");
  if (!head) return;
  const open = !c.open.has(head.dataset.name);
  if (open) c.open.add(head.dataset.name);
  else c.open.delete(head.dataset.name);
  head.setAttribute("aria-expanded", String(open));
  document.getElementById(head.getAttribute("aria-controls")).hidden = !open;
});

// ---------- Top bar ----------
const LINE_HASH = { Wholesale: "#/wholesale", Retail: "#/", SetOps: "#/setops" };
document.getElementById("line-toggle").addEventListener("click", (e) => {
  const b = e.target.closest("button[data-line]");
  if (b) location.hash = LINE_HASH[b.dataset.line];
});
// The Smart Search in the top bar is wired up with the Call Results code above (focus opens the panel, Enter runs it).

document.addEventListener("click", closeMenus);
window.addEventListener("resize", () => {
  if (agentPage.agent && !document.getElementById("page-agent").hidden) {
    renderPlaybookChart();
    renderChart();
  }
});
window.addEventListener("hashchange", route);
renderAll();
// wholesale.js and setops.js load after this file, so the first route waits for the page to finish loading.
document.addEventListener("DOMContentLoaded", route);
