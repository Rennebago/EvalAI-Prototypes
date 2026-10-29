// ---------- SetOps ----------
// Figma nodes: 3283:5658 (entry dashboard), 2470:25844 (agent view, outbound), 2470:26722 (agent view, inbound),
// 2893:8350 (call details, results) and 2885:7672 (call details, transcript). Loaded after app.js and wholesale.js
// and reuses their helpers. The seven agents in the dashboard table and Sara Chen's outbound calls are drawn in the
// design; everything else is generated.

const SO_LEVEL = { "Not required": 0, Poor: 1, Fair: 2, Good: 3, Excellent: 4 };
const SO_NAMES = ["Not required", "Poor", "Fair", "Good", "Excellent"];
const SO_CODE = { E: "Excellent", G: "Good", F: "Fair", P: "Poor", N: "Not required" };
const SO_COLOR = { "Not required": "#c0cbd8", Incomplete: "#5c708a", Poor: "#cf264e", Fair: "#e39b0d", Good: "#048155", Excellent: "#3300ff" };
const SO_GRADE_ORDER = ["Not required", "Incomplete", "Poor", "Fair", "Good", "Excellent"];

// Call stages. `dash` is the label in the dashboard stage table, `col` the agent-table column, `page` the label on the
// agent view, `chip` the short name in call chips and `res` the heading in call results. `good`, `weak` and `nr` are
// the result text for a call; `qg` and `qw` the agent quote that goes with it. Only stages with `nr` can be not required.
const SO_STAGES = [
  {
    dash: "Opening & Disclosures",
    col: "Opening & Disclosures",
    page: "Opening & Disclosures",
    chip: "Opening & Disclosures",
    res: "Opening & Disclosures",
    good: "The agent introduces herself and her company, and provides the call recording disclosure. She also asks for a callback number, which is a good practice for inbound calls.",
    qg: "Good morning, Mrs. Burris. This is Shai Brown with Freedom Debt Relief. I am reaching out, attempting to settle an account. Are you available now?",
    weak: "The agent introduced the company but skipped the call recording disclosure and did not ask for a callback number.",
    qw: "Hi, this is Freedom Debt Relief, calling about an account.",
  },
  {
    dash: "Account Verification",
    col: "Account Verification",
    page: "Account Verification",
    chip: "Account Verification",
    res: "Account Verification",
    good: "The agent asks for the client's name and last four of social, and then the last four of the account number, which are all required for verification.",
    qg: "Can I get the client's name and the last four of their social?",
    weak: "The agent verified the client's name but did not confirm the last four of the account number before discussing the account.",
    qw: "Okay, I've got the account pulled up here.",
  },
  {
    dash: "ATC",
    col: "ATC",
    page: "Authorization to Communicate on File (ATC)",
    chip: "ATC",
    res: "ATC",
    good: "The agent confirmed the authorization to communicate on file before sharing account details.",
    qg: "I can see the authorization on file, thank you.",
    weak: "The agent shared account details without first confirming the authorization to communicate.",
    qw: "The balance on that account is $9,412.",
    nr: "The creditor did not ask for ATC/POA, so this step is not required.",
  },
  {
    dash: "Account Information & Client Hardship",
    col: "Account Info & Client Hardship",
    page: "Account Information and Client Hardship",
    chip: "Hardship Docs",
    res: "Account Info & Client Hardship",
    good: "The agent confirms the account balance with the creditor. The client's hardship reason was not prompted.",
    qg: "Can you confirm the balance on that account for me?",
    weak: "The agent did not confirm the balance or ask about the client's hardship before moving on.",
    qw: "Alright, let's move on to the next account.",
  },
  {
    dash: "Initial Offer & Outcome",
    col: "Initial Offer & Outcomes",
    page: "Initial Offer and Outcome",
    chip: "Initial Offer",
    res: "Initial Offer & Outcome",
    good: "The agent presented the initial offer clearly and explained how it was calculated.",
    qg: "Based on the balance, we are able to offer 45 percent of the total.",
    weak: "The agent presented an offer without explaining how it was calculated or confirming the client's budget.",
    qw: "We can do 60 percent, take it or leave it.",
    nr: "The account was not ready for settlement, so negotiations did not occur.",
  },
  {
    dash: "Counter Offer & Outcome",
    col: "Counter Offer and Outcome",
    page: "Counter Offer and Outcome",
    chip: "Counter Offer",
    res: "Counter Offer & Outcome",
    good: "The agent handled the counter offer professionally and documented the creditor's response.",
    qg: "I understand. Let me note your counter and see if we can meet in the middle.",
    weak: "The agent accepted the counter offer without checking it against the approved range.",
    qw: "Sure, that works for us.",
    nr: "Since negotiations did not occur, no counter offer was made and no settlement outcome was reached.",
  },
  {
    dash: "Payment Arrangement",
    col: "Payment Arrangement",
    page: "Payment Arrangement",
    chip: "Payment Arrangement",
    res: "Payment Arrangement",
    good: "The agent confirmed the payment amount, date and method, and read back the arrangement.",
    qg: "So that is $1,200 on the 15th by ACH. Does that work for the client?",
    weak: "The agent did not read back the payment date and method before ending the discussion.",
    qw: "We'll set that up and send you the details.",
    nr: "Since no offer was approved, no payment arrangement details were discussed.",
  },
  {
    dash: "Closing",
    col: "Closing",
    page: "Closing",
    chip: "Closing",
    res: "Closing",
    good: "The agent confirms there are no further accounts, offers a thank you, and ends the call professionally.",
    qg: "Is there anything else I can help you with today? Thank you, have a great day.",
    weak: "The agent ended the call without confirming whether there were additional accounts.",
    qw: "Alright, bye.",
  },
];
const SO_CHIPS = SO_STAGES.map((s) => s.chip);

const SO_WGS = [
  { name: "SetPrep", score: 82, calls: 124, top: ["Opening & Disclosures"], bottom: ["Hardship Docs"] },
  { name: "ARP", score: 92, calls: 89, top: ["Account Verification"], bottom: ["Closing", "ATC"] },
  { name: "DWA", score: 76, calls: 93, top: ["Opening & Disclosures"], bottom: ["ATC"] },
];

// Performance by Call Stage on the dashboard as drawn: rating, top workgroup, bottom workgroup.
const SO_STAGE_ROWS = [
  ["Poor", "SetPrep", "ARP"],
  ["Good", "SetPrep", "DWA"],
  ["Not required", "SetPrep", "DWA"],
  ["Fair", "DWA", "ARP"],
  ["Fair", "ARP", "SetPrep"],
  ["Good", "SetPrep", "ARP"],
  ["Fair", "SetPrep", "DWA"],
  ["Fair", "DWA", "SetPrep"],
];

const SO_TAGS = [
  "Follow up calls",
  "Settlement Approval",
  "Not Connected",
  "Inbound call Creditor callback",
  "Multiple Account call",
  "Settlement Offer SNIP",
  "Non-Settlement Calls",
  "Authorized required call",
  "Settlement Pending Creditor Approval",
];

// Agents as drawn: name, workgroup, calls, avg. score, stage ratings (E/G/F/P/N, same order as SO_STAGES).
const SO_AGENT_ROWS = [
  ["Roman Torres", "SetPrep", 14, 84, "EGFPNEGF"],
  ["Sara Chen", "SetPrep", 22, 92, "FEGPFEGF"],
  ["Alex Johnson", "SetPrep", 32, 74, "GPEFGFEP"],
  ["Mina Kim", "ARP", 16, 68, "GEPGNEGP"],
  ["Liquid Blue", "ARP", 43, 55, "EFGEPGFE"],
  ["Cyndi Chan", "DWA", 27, 38, "EGFEGPFG"],
  ["Jordan Davis", "DWA", 24, 41, "FGEFGFEG"],
];
const SO_EXTRA_AGENTS = [
  ["Priya Nair", "ARP"],
  ["Marcus Bell", "DWA"],
  ["Dana Whitfield", "SetPrep"],
  ["Tomas Ortega", "ARP"],
  ["Alicia Kim", "DWA"],
  ["Grant Lowell", "SetPrep"],
  ["Nina Petrov", "ARP"],
  ["Owen Daniels", "DWA"],
];

// Reporting hierarchy (prototype data). `reportsTo` links users into a tree and every agent has exactly one supervisor
// (`sup`). A user can see the agents of their own team plus every team below them (direct and indirect reports).
// Tara -> Lee is the indirect chain: Tara sees Lee's agents, Lee does not see Tara's. Joy has no agents yet.
const SO_USERS = [
  { id: "simone", name: "Simone Hart", role: "Manager", reportsTo: null },
  { id: "tara", name: "Tara Okafor", role: "Supervisor", reportsTo: "simone" },
  { id: "lee", name: "Lee Park", role: "Supervisor", reportsTo: "tara" },
  { id: "marco", name: "Marco Reyes", role: "Supervisor", reportsTo: "simone" },
  { id: "joy", name: "Joy Adeyemi", role: "Supervisor", reportsTo: "simone" },
];
const SO_SUP_OF = {
  "Roman Torres": "tara",
  "Sara Chen": "tara",
  "Priya Nair": "tara",
  "Dana Whitfield": "tara",
  "Alex Johnson": "lee",
  "Mina Kim": "lee",
  "Tomas Ortega": "lee",
  "Owen Daniels": "lee",
  "Liquid Blue": "marco",
  "Cyndi Chan": "marco",
  "Jordan Davis": "marco",
  "Marcus Bell": "marco",
  "Alicia Kim": "marco",
  "Grant Lowell": "marco",
  "Nina Petrov": "marco",
};

const soClamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
const soMakeAgent = (name, wg, calls, score, r) => ({
  name,
  wg,
  sup: SO_SUP_OF[name],
  calls,
  score,
  r,
  lv: r.map((g) => SO_LEVEL[g]),
  slug: slugify(name),
  initials: name.split(" ").map((p) => p[0]).join("").slice(0, 2),
});
const SO_AGENTS = [
  ...SO_AGENT_ROWS.map(([name, wg, calls, score, r]) => soMakeAgent(name, wg, calls, score, [...r].map((c) => SO_CODE[c]))),
  ...SO_EXTRA_AGENTS.map(([name, wg]) => {
    const rand = rng(hash(name + "so-agent"));
    const score = Math.round(40 + rand() * 55);
    const r = SO_STAGES.map((s, i) => (s.nr && rand() < 0.15 ? "Not required" : genRating(rand, score)));
    return soMakeAgent(name, wg, 10 + Math.floor(rand() * 35), score, r);
  }),
];
const SO_BY_SLUG = new Map(SO_AGENTS.map((a) => [a.slug, a]));

// Date ranges only scale numbers and labels; the tables show the same sample data for every range.
const SO_RANGES = {
  "This week": { f: 0.23, cur: "this week", prev: "vs last week", d: -2 },
  "This month": { f: 1, cur: "this month", prev: "vs last month", d: 0 },
  "Last month": { f: 0.62, cur: "last month", prev: "vs prior month", d: -3 },
  "This quarter": { f: 3, cur: "this quarter", prev: "vs last quarter", d: 2 },
};
// Every Call Direction filter offers the same three choices: All, Inbound and Outbound.
const SO_DIR_F = { All: 1, Inbound: 0.4, Outbound: 0.6 };
const SO_TAG_ALL = "Filter by Call Tag";
const SO_STAGE_ALL = "Filter by Call Stage";
const SO_LEVEL_ALL = "Filter by Performance Level";
const SO_LEVEL_OPTS = ["Excellent", "Good", "Fair", "Poor", "Not required"];
const SO_AGENT_ALL = "All agents";
const SO_DIR_BOTH = "All";
const SO_DIR_OPTS = Object.keys(SO_DIR_F);
const SO_DIR_PREFIX = { prefix: "Direction: " };

const SO_NO_SORT = () => ({ key: null, dir: "asc" });
const soState = {
  user: SO_USERS[0],
  dash: { date: "This month", wg: "All", tag: SO_TAG_ALL, stage: SO_STAGE_ALL, level: SO_LEVEL_ALL, dir: SO_DIR_BOTH, query: "", wgSort: SO_NO_SORT(), stSort: SO_NO_SORT(), a: { page: 1, size: 10, sort: SO_NO_SORT() } },
  // Matrix filters are multi-select: a list of chosen values, where an empty list means "all".
  matrix: { query: "", wg: [], sup: [], stage: [], level: [], dir: "Outbound", sort: SO_NO_SORT() },
  // Call Records list: every filter is also in the URL (see soCallsHash), so any slice can be deep-linked.
  calls: { agent: null, wg: "All", stage: SO_STAGE_ALL, level: SO_LEVEL_ALL, tag: SO_TAG_ALL, dir: SO_DIR_BOTH, page: 1, size: 10, sort: SO_NO_SORT(), back: { href: "#/setops", label: "Dashboard" } },
  agent: { a: null, dir: "Outbound", date: "This week", tag: SO_TAG_ALL, stage: SO_STAGE_ALL, st: SO_NO_SORT(), c: { page: 1, size: 10, sort: SO_NO_SORT() } },
  call: { call: null, tab: "results", open: null, pos: 0, playing: false, timer: null },
};

// ---------- Helpers ----------
const soLetter = (s) => (s >= 90 ? "A" : s >= 80 ? "B" : s >= 60 ? "C" : s >= 50 ? "D" : "F");
const SO_LETTER_CHIP = { A: "Excellent", B: "Good", C: "Fair", D: "Fair", F: "Poor" };
const soGrade = (s) => `<span class="chip chip-${SO_LETTER_CHIP[soLetter(s)]}">${soLetter(s)}</span>`;
const soScore = (s) => `<span class="so-score">${soGrade(s)}<span>${s}%</span></span>`;
const soChip = (g) => `<span class="chip chip-${g === "Not required" ? "Incomplete" : g}">${g}</span>`;
const soTagChip = (t) => `<span class="chip chip-so">${esc(t)}</span>`;
const soAgentLink = (a, label) => `<a class="agent-link" href="#/setops/agent/${a.slug}">${esc(label || a.name)}</a>`;
const soN = (n) => Math.round(n).toLocaleString("en-US");
const soTime = (m) => `${Math.floor(m / 60) % 12 || 12}:${String(m % 60).padStart(2, "0")} ${m < 720 ? "am" : "pm"}`;
const soPhone = (id) => `+1844${String(hash(id + "phone") % 10000000).padStart(7, "0")}`;
const soKpi = (title, rows) => `<article class="card">
    <div><div class="kpi-title">${esc(title)}</div></div>
    <div class="kpi-metric">${rows.map((r) => `<div>${r}</div>`).join("")}</div>
  </article>`;
const soPager = (prefix, st, all) => wsPage(prefix, st, all);

// ---------- Roster scope (role-based permissions) ----------
// Ids of the user and everyone below them in the hierarchy.
function soTeamIds(user) {
  const ids = new Set([user.id]);
  let grew = true;
  while (grew) {
    grew = false;
    SO_USERS.forEach((u) => {
      if (u.reportsTo && ids.has(u.reportsTo) && !ids.has(u.id)) {
        ids.add(u.id);
        grew = true;
      }
    });
  }
  return ids;
}
// Every SetOps view reads agents through this, so the dashboard, matrix, agent view and exports share one roster.
function soScopeAgents(user = soState.user) {
  const ids = soTeamIds(user);
  return SO_AGENTS.filter((a) => ids.has(a.sup));
}
const soCanView = (a) => soScopeAgents().includes(a);
const soIsFullScope = () => soScopeAgents().length === SO_AGENTS.length;
const soSum = (list) => list.reduce((s, x) => s + x, 0);
const soAvg = (list) => soSum(list) / list.length;
// Mean rating level of a stage across agents; null when no agent was rated (all "Not required").
function soStageMean(agents, i) {
  const lv = agents.map((a) => a.lv[i]).filter((l) => l > 0);
  return lv.length ? soAvg(lv) : null;
}

// Workgroup rows for the current scope. A full-scope manager gets the rows as drawn; everyone else gets rows derived
// from the agents they can see.
function soScopeWgs() {
  const agents = soScopeAgents();
  if (soIsFullScope()) return SO_WGS;
  return SO_WGS.filter((w) => agents.some((a) => a.wg === w.name)).map((w) => {
    const mine = agents.filter((a) => a.wg === w.name);
    const means = SO_STAGES.map((s, i) => ({ chip: s.chip, m: soStageMean(mine, i) })).filter((x) => x.m !== null).sort((x, y) => y.m - x.m);
    return { name: w.name, score: Math.round(soAvg(mine.map((a) => a.score))), calls: soSum(mine.map((a) => a.calls)), top: means.length ? [means[0].chip] : [], bottom: means.length ? [means[means.length - 1].chip] : [] };
  });
}

// Performance by Call Stage rows (rating, top workgroup, bottom workgroup) for the current scope.
function soStageRows() {
  const agents = soScopeAgents();
  if (soIsFullScope()) return SO_STAGE_ROWS;
  const wgs = [...new Set(agents.map((a) => a.wg))];
  return SO_STAGES.map((s, i) => {
    const m = soStageMean(agents, i);
    const by = wgs.map((w) => ({ w, m: soStageMean(agents.filter((a) => a.wg === w), i) })).filter((x) => x.m !== null).sort((x, y) => y.m - x.m);
    return [m === null ? "Not required" : SO_NAMES[soClamp(Math.round(m), 1, 4)], by.length ? by[0].w : "–", by.length ? by[by.length - 1].w : "–"];
  });
}

const soUserOf = (id) => SO_USERS.find((u) => u.id === id);

// ---------- Filters and drill-down ----------
// Does a rating list match the Call Stage and Performance Level filters? Level alone means "any stage at that level".
const soRatesMatch = (ratings, stage, level) =>
  (stage === SO_STAGE_ALL && level === SO_LEVEL_ALL) || SO_STAGES.some((s, i) => (stage === SO_STAGE_ALL || s.chip === stage) && (level === SO_LEVEL_ALL || ratings[i] === level));
const soLevelOf = (m) => (m === null ? "Not required" : SO_NAMES[soClamp(Math.round(m), 1, 4)]);

const SO_CALLS_DEFAULT = { agent: null, wg: "All", stage: SO_STAGE_ALL, level: SO_LEVEL_ALL, tag: SO_TAG_ALL, dir: SO_DIR_BOTH };
function soCallsHash(f = soState.calls) {
  const p = new URLSearchParams();
  if (f.agent) p.set("agent", f.agent);
  if (f.wg !== "All") p.set("wg", f.wg);
  if (f.stage !== SO_STAGE_ALL) p.set("stage", f.stage);
  if (f.level !== SO_LEVEL_ALL) p.set("level", f.level);
  if (f.tag !== SO_TAG_ALL) p.set("tag", f.tag);
  if (f.dir !== SO_DIR_BOTH) p.set("dir", f.dir);
  const q = p.toString();
  return "#/setops/calls" + (q ? "?" + q : "");
}
// Reads the filters from a Call Records hash; unknown values fall back to "all" so a bad link never breaks the page.
function soParseCalls(hash) {
  const p = new URLSearchParams(hash.split("?")[1] || "");
  const pick = (key, ok, fallback) => (ok(p.get(key)) ? p.get(key) : fallback);
  return {
    agent: pick("agent", (v) => SO_BY_SLUG.has(v), null),
    wg: pick("wg", (v) => SO_WGS.some((w) => w.name === v), "All"),
    stage: pick("stage", (v) => SO_CHIPS.includes(v), SO_STAGE_ALL),
    level: pick("level", (v) => SO_LEVEL_OPTS.includes(v), SO_LEVEL_ALL),
    tag: pick("tag", (v) => SO_TAGS.includes(v), SO_TAG_ALL),
    dir: pick("dir", (v) => v in SO_DIR_F, SO_DIR_BOTH),
  };
}
const soDrill = (p) => soCallsHash({ ...SO_CALLS_DEFAULT, ...p });
// Link from an aggregate (chip, count, name) to the Call Records behind it.
const soDrillLink = (p, html, title) => `<a class="so-drill" href="${esc(soDrill(p))}" title="${esc(title)}">${html}</a>`;
// Drill-down from the dashboard keeps the dashboard's own filters unless the slice overrides them.
const soDashDrill = (p, html, title) => {
  const d = soState.dash;
  return soDrillLink({ wg: d.wg, stage: d.stage, level: d.level, tag: d.tag, dir: d.dir, ...p }, html, title);
};

function soPaintUser() {
  const u = soState.user;
  const n = soScopeAgents().length;
  document.getElementById("sod-h1").textContent = `Welcome back, ${u.name.split(" ")[0]}`;
  document.getElementById("sod-sub").textContent = `Overview at ${u.role === "Manager" ? "your teams" : "your team"} call scoring and outcomes • ${n} agent${n === 1 ? "" : "s"} in your hierarchy`;
}

// ---------- Dashboard ----------
function soDashFactor() {
  const d = soState.dash;
  const tagF = d.tag === SO_TAG_ALL ? 1 : 0.15 + (hash(d.tag) % 30) / 100;
  return SO_RANGES[d.date].f * SO_DIR_F[d.dir] * tagF;
}

// Agents in scope whose ratings (for the dashboard's direction) match the Call Stage and Performance Level filters.
// The workgroup and search filters are applied on top of this by the tables.
function soDashPool() {
  const d = soState.dash;
  return soScopeAgents()
    .map((a) => {
      const r = d.dir === "Inbound" ? soAgentRatings(a, "Inbound") : a.r;
      return { ...a, r, lv: r.map((g) => SO_LEVEL[g]) };
    })
    .filter((a) => soRatesMatch(a.r, d.stage, d.level));
}

function soDashKpis() {
  const d = soState.dash;
  const r = SO_RANGES[d.date];
  const pool = soDashPool();
  const kpis = document.getElementById("sod-kpis");
  if (!pool.length) {
    kpis.innerHTML = soKpi("Calls Evaluated", ["<b>–</b>", "<b>–</b>"]) + soKpi("Avg. Scoring", ["<b>–</b>", "<b>–</b>"]);
    return;
  }
  // Totals and scores follow the filtered pool: the drawn numbers apply to the full, unfiltered roster.
  const f = soDashFactor() * (soSum(pool.map((a) => a.calls)) / soSum(SO_AGENTS.map((a) => a.calls)));
  const drawn = soIsFullScope() && pool.length === SO_AGENTS.length;
  const cur = soClamp((drawn ? 92 : Math.round(soAvg(pool.map((a) => a.score)))) + r.d, 0, 100);
  const prev = drawn ? 54 : soClamp(cur - 6 + (hash(soState.user.id + "so-prev") % 9), 0, 100);
  const total = (n) => soDashDrill({}, `<b>${soN(n)}</b>`, "View these calls");
  kpis.innerHTML =
    soKpi("Calls Evaluated", [`${total(8445 * f)}<span>${r.cur}</span>`, `<b>${soN(5246 * f)}</b><span>${r.prev}</span>`]) +
    soKpi("Avg. Scoring", [`${soGrade(cur)}<b>${cur}%</b><span>${r.cur}</span>`, `${soGrade(prev)}<b>${prev}%</b><span>${r.prev}</span>`]);
}

const soStageChip = (cls, wg) => (n) => soDashDrill({ wg, stage: n }, `<span class="chip chip-${cls} chip-so-stage">${esc(n)}</span>`, `View ${wg} calls for ${n}`);
const SO_WG_COLS = [
  { key: "name", label: "Workgroup", w: 18, sortable: true, render: (r) => soDashDrill({ wg: r.name }, esc(r.name), `View ${r.name} calls`) },
  { key: "score", label: "Avg. Scoring", w: 18, sortable: true, render: (r) => soScore(r.score) },
  { key: "calls", label: "Calls", w: 10, render: (r) => soDashDrill({ wg: r.name }, r.calls, `View ${r.name} calls`) },
  { key: "top", label: "Avg. Top Call Stage", w: 27, cls: "so-wrap", render: (r) => r.top.map(soStageChip("Good", r.name)).join("") },
  { key: "bottom", label: "Avg. Bottom Call Stage", w: 27, cls: "so-wrap", render: (r) => r.bottom.map(soStageChip("Poor", r.name)).join("") },
];

const soWgLink = (n) => `<button class="link-btn" type="button" data-wg="${esc(n)}" title="Filter the dashboard to ${esc(n)}">${esc(n)}</button>`;
const SO_STAGE_COLS = [
  { key: "name", label: "Call Stage", w: 37, sortable: true, render: (r) => soDashDrill({ stage: r.chip }, esc(r.name), `View calls for ${r.chip}`) },
  { key: "lvl", label: "Avg. Scoring", w: 18, sortable: true, render: (r) => soDashDrill({ stage: r.chip, level: r.rating }, soChip(r.rating), `View ${r.rating} calls for ${r.chip}`) },
  { key: "top", label: "Top Workgroup", w: 22, render: (r) => (r.top === "–" ? r.top : soWgLink(r.top)) },
  { key: "bottom", label: "Bottom Workgroup", w: 23, render: (r) => (r.bottom === "–" ? r.bottom : soWgLink(r.bottom)) },
];

const SO_AGENT_COLS = [
  { key: "name", label: "Agent", px: 157, sortable: true, render: (r) => soAgentLink(r) },
  { key: "wg", label: "Workgroup", px: 113, sortable: true },
  { key: "calls", label: "Calls", px: 70, sortable: true, render: (r) => soDashDrill({ agent: r.slug }, r.calls, `View ${r.name}'s calls`) },
  { key: "score", label: "Avg. Scoring", px: 130, sortable: true, render: (r) => soGrade(r.score) },
  ...SO_STAGES.map((s, i) => ({ key: "s" + i, label: s.col, px: 127, sortable: true, render: (r) => soDashDrill({ agent: r.slug, stage: s.chip, level: r.r[i] }, soChip(r.r[i]), `View ${r.name}'s ${r.r[i]} calls for ${s.chip}`) })),
];

const soDashValue = (r, k) => (/^s\d$/.test(k) ? r.lv[+k[1]] : r[k]);

function soDashAgents() {
  const d = soState.dash;
  const q = d.query.toLowerCase();
  const f = soDashFactor() / SO_RANGES["This month"].f;
  const rows = soDashPool().filter((a) => (d.wg === "All" || a.wg === d.wg) && (!q || a.name.toLowerCase().includes(q) || a.wg.toLowerCase().includes(q))).map((a) => ({ ...a, calls: Math.max(1, Math.round(a.calls * f)) }));
  return sortRows(rows, d.a.sort, soDashValue);
}

function renderSoDash() {
  const d = soState.dash;
  const q = d.query.toLowerCase();
  soPaintUser();
  soDashKpis();
  const noRoster = "No agents are assigned to you yet.";
  const empty = soScopeAgents().length === 0;

  const f = soDashFactor();
  const poolWgs = new Set(soDashPool().map((a) => a.wg));
  const wgs = soScopeWgs().filter((w) => poolWgs.has(w.name) && (d.wg === "All" || w.name === d.wg) && (!q || w.name.toLowerCase().includes(q))).map((w) => ({ ...w, calls: Math.max(1, Math.round(w.calls * f)) }));
  fillTable("sod-wg", SO_WG_COLS, d.wgSort, wsRows(SO_WG_COLS, sortRows(wgs, d.wgSort, (r, k) => r[k])), empty ? noRoster : "No workgroups match your filters.");

  const rows = soStageRows();
  const stages = SO_STAGES.map((s, i) => ({ name: s.dash, chip: s.chip, rating: rows[i][0], lvl: SO_LEVEL[rows[i][0]], top: rows[i][1], bottom: rows[i][2] })).filter((s) => (d.stage === SO_STAGE_ALL || s.chip === d.stage) && (d.level === SO_LEVEL_ALL || s.rating === d.level));
  fillTable("sod-stages", SO_STAGE_COLS, d.stSort, wsRows(SO_STAGE_COLS, sortRows(stages, d.stSort, (r, k) => r[k])), empty ? noRoster : "No call stages match your filters.");

  fillTable("sod-agents", SO_AGENT_COLS, d.a.sort, wsRows(SO_AGENT_COLS, soPager("sod-a", d.a, soDashAgents())), empty ? noRoster : "No agents match your filters.");
}

// ---------- Agent view ----------
function soAgentRatings(a, dir) {
  if (dir === "Outbound") return a.r;
  // All directions: the mean of the outbound and inbound rating per stage.
  if (dir === SO_DIR_BOTH) {
    const inbound = soAgentRatings(a, "Inbound");
    return a.r.map((g, k) => (g === "Not required" ? g : SO_NAMES[soClamp(Math.round((SO_LEVEL[g] + SO_LEVEL[inbound[k]]) / 2), 1, 4)]));
  }
  const rand = rng(hash(a.slug + "so-inbound"));
  return a.r.map((g) => (g === "Not required" ? g : SO_NAMES[soClamp(SO_LEVEL[g] + [-1, 0, 0, 1][Math.floor(rand() * 4)], 1, 4)]));
}

// Last week's rating per stage, shown as the Trend chip.
function soPrevRatings(a, dir) {
  const rand = rng(hash(a.slug + dir + "so-prev"));
  return soAgentRatings(a, dir).map((g) => (g === "Not required" ? g : SO_NAMES[soClamp(SO_LEVEL[g] + [-2, -1, -1, 1, 1, 2][Math.floor(rand() * 6)], 1, 4)]));
}

// Totals and scores for the KPI cards, at the "This week" range.
function soAgentBase(a, dir) {
  if (dir === SO_DIR_BOTH) {
    const o = soAgentBase(a, "Outbound");
    const i = soAgentBase(a, "Inbound");
    const mix = (x, y, wx, wy) => Math.round((x * wx + y * wy) / (wx + wy));
    return { cur: o.cur + i.cur, prev: o.prev + i.prev, score: mix(o.score, i.score, o.cur, i.cur), prevScore: mix(o.prevScore, i.prevScore, o.prev, i.prev) };
  }
  if (a.name === "Sara Chen") return dir === "Outbound" ? { cur: 484, prev: 334, score: a.score, prevScore: 54 } : { cur: 32, prev: 44, score: 88, prevScore: 54 };
  const rand = rng(hash(a.slug + dir + "so-kpi"));
  const cur = dir === "Outbound" ? 120 + Math.floor(rand() * 420) : 14 + Math.floor(rand() * 50);
  const score = dir === "Outbound" ? a.score : soClamp(Math.round(a.score + (rand() - 0.5) * 16), 20, 98);
  return { cur, prev: Math.round(cur * (0.6 + rand() * 0.8)), score, prevScore: soClamp(Math.round(score + (rand() - 0.55) * 32), 15, 98) };
}

function soAgentKpis() {
  const st = soState.agent;
  const r = SO_RANGES[st.date];
  const f = r.f / SO_RANGES["This week"].f;
  const b = soAgentBase(st.a, st.dir);
  const cur = soClamp(b.score + r.d + 2, 0, 100);
  document.getElementById("soa-kpis").innerHTML =
    soKpi(st.dir === SO_DIR_BOTH ? "Total Calls" : `Total ${st.dir} Calls`, [`<b class="so-big">${soN(b.cur * f)}</b>`, `<b>${soN(b.prev * f)}</b><span>${r.prev}</span>`]) +
    soKpi("Avg. Scoring", [`${soGrade(cur)}<b>${cur}%</b><span>${r.cur}</span>`, `${soGrade(b.prevScore)}<b>${b.prevScore}%</b><span>${r.prev}</span>`]);
}

const soAgentStageCols = (prevText) => [
  { key: "name", label: "Call Stage", w: 76, render: (r) => soDrillLink({ agent: soState.agent.a.slug, stage: r.chip, dir: soState.agent.dir }, esc(r.name), `View ${soState.agent.dir === SO_DIR_BOTH ? "" : soState.agent.dir.toLowerCase() + " "}calls for ${r.chip}`) },
  { key: "lvl", label: "Rating", w: 12, sortable: true, render: (r) => soDrillLink({ agent: soState.agent.a.slug, stage: r.chip, level: r.rating, dir: soState.agent.dir }, soChip(r.rating), `View ${r.rating} calls for ${r.chip}`) },
  { key: "last", label: "Trend", w: 12, render: (r) => `<span class="so-trend">${soChip(r.last)}<span>${esc(prevText)}</span></span>` },
];

const SO_CALL_COLS = [
  { key: "date", label: "Call Date", w: 9, sortable: true, render: (r) => fmtDate(r.date) },
  { key: "score", label: "Call Scoring", w: 19, sortable: true, render: (r) => soScore(r.score) },
  { key: "top", label: "Avg. Top Call Stage", w: 22, cls: "so-wrap", render: (r) => r.top.map(soTagChip).join("") },
  { key: "bottom", label: "Avg. Bottom Call Stage", w: 22, cls: "so-wrap", render: (r) => r.bottom.map(soTagChip).join("") },
  { key: "tags", label: "Call Tags", w: 18, cls: "so-wrap", render: (r) => r.tags.map(soTagChip).join("") },
  { key: "details", label: "Call Details", w: 10, render: (r) => `<a class="text-btn" href="#/setops/call/${r.id}">View call details</a>` },
];

// With All directions, the Recent Calls table gains a Direction column (widths stay at 100%).
const SO_CALL_COLS_ALL = (() => {
  const by = Object.fromEntries(SO_CALL_COLS.map((c) => [c.key, c]));
  return [{ ...by.date, w: 9 }, { key: "dir", label: "Direction", w: 9, sortable: true }, { ...by.score, w: 15 }, { ...by.top, w: 19 }, { ...by.bottom, w: 19 }, { ...by.tags, w: 18 }, { ...by.details, w: 11 }];
})();
const soAgentCallCols = () => (soState.agent.dir === SO_DIR_BOTH ? SO_CALL_COLS_ALL : SO_CALL_COLS);

function soAgentCalls() {
  const st = soState.agent;
  const rows = soCalls(st.a, st.dir).filter((c) => (st.tag === SO_TAG_ALL || c.tags.includes(st.tag)) && (st.stage === SO_STAGE_ALL || c.top.includes(st.stage) || c.bottom.includes(st.stage)));
  return sortRows(rows, st.c.sort, (r, k) => r[k]);
}

function renderSoAgent() {
  const st = soState.agent;
  const a = st.a;
  if (!a) return;
  soAgentKpis();

  const cur = soAgentRatings(a, st.dir);
  const prev = soPrevRatings(a, st.dir);
  const stages = SO_STAGES.map((s, i) => ({ name: s.page, chip: s.chip, rating: cur[i], lvl: SO_LEVEL[cur[i]], last: prev[i] })).filter((s) => st.stage === SO_STAGE_ALL || s.chip === st.stage);
  const stageCols = soAgentStageCols(SO_RANGES[st.date].prev);
  fillTable("soa-stages", stageCols, st.st, wsRows(stageCols, sortRows(stages, st.st, (r, k) => r[k])), "No call stages match your filters.");

  const callCols = soAgentCallCols();
  fillTable("soa-calls", callCols, st.c.sort, wsRows(callCols, soPager("soa-c", st.c, soAgentCalls()), (r) => ` data-id="${r.id}"`), "No calls match your filters.");
}

function soOpenAgent(a, cameFrom) {
  const st = soState.agent;
  if (st.a !== a) {
    // Opened from the dashboard: use the direction chosen there (both directions default to Outbound).
    const dir = soState.dash.dir;
    Object.assign(st, { a, dir: dir === "Inbound" ? "Inbound" : "Outbound", tag: SO_TAG_ALL, stage: SO_STAGE_ALL, st: SO_NO_SORT(), c: { page: 1, size: st.c.size, sort: SO_NO_SORT() } });
    document.getElementById("soa-avatar").textContent = a.initials;
    document.getElementById("soa-name").textContent = a.name;
    dropdownPainters.forEach((f) => f());
  }
  document.title = `EvalAI - SetOps - ${a.name}`;
  renderSoAgent();
}

// ---------- Calls ----------
const SO_CALLS = new Map();
const SO_CALL_LISTS = new Map();

// Sara Chen's outbound Recent Calls as drawn: day, score, top, bottom, tags. (The third call is A 82% in the design;
// 93% keeps the letter grade consistent with the other rows.)
const SO_SARA_CALLS = [
  [18, 64, ["Opening & Disclosures"], ["ATC"], ["Follow up calls", "Settlement Approval"]],
  [18, 82, ["Opening & Disclosures"], ["Hardship Docs"], ["Not Connected"]],
  [18, 93, ["Account Verification", "Payment Arrangement"], ["Counter Offer"], ["Inbound call Creditor callback", "Multiple Account call"], "Lucas Scott"],
  [17, 32, ["Initial Offer"], ["Payment Arrangement"], ["Settlement Offer SNIP", "Non-Settlement Calls", "Authorized required call"]],
  [17, 62, ["Opening & Disclosures"], ["ATC", "Payment Arrangement"], ["Follow up calls"]],
  [17, 53, ["Counter Offer"], ["Initial Offer"], ["Settlement Pending Creditor Approval", "Not Connected"]],
];

function soNewCall(a, dir, rand, [day, score, top, bottom, tags, client]) {
  let n = 100000 + (hash(`${a.slug}|${dir}|${day}|${score}|${SO_CALLS.size}`) % 899999);
  while (SO_CALLS.has(String(n))) n += 1;
  const id = String(n);
  const first = SR_FIRST[Math.floor(rand() * SR_FIRST.length)];
  const last = SR_LAST[Math.floor(rand() * SR_LAST.length)];
  const mm = 8 + Math.floor(rand() * 33);
  const ss = Math.floor(rand() * 60);
  const call = {
    id,
    agent: a,
    dir,
    date: new Date(2026, 5, day).getTime(),
    score,
    top,
    bottom,
    tags,
    client: client || `${first} ${last}`,
    duration: `${String(mm).padStart(2, "0")}:${String(ss).padStart(2, "0")}`,
    start: 8 * 60 + Math.floor(rand() * 9 * 60),
    completion: 60 + Math.floor(rand() * 39),
  };
  SO_CALLS.set(id, call);
  return call;
}

function soCalls(a, dir) {
  if (dir === SO_DIR_BOTH) return [...soCalls(a, "Outbound"), ...soCalls(a, "Inbound")].sort((x, y) => y.date - x.date);
  const key = a.slug + "|" + dir;
  if (SO_CALL_LISTS.has(key)) return SO_CALL_LISTS.get(key);
  const rand = rng(hash(key + "so-calls"));
  const list = [];
  let day = 18;
  if (a.name === "Sara Chen" && dir === "Outbound") {
    SO_SARA_CALLS.forEach((s) => list.push(soNewCall(a, dir, rand, s)));
    day = 16;
  }
  while (list.length < 15) {
    const score = Math.round(soClamp(a.score + (rand() - 0.5) * 50, 20, 98));
    const order = SO_CHIPS.map((c) => [rand(), c]).sort((x, y) => x[0] - y[0]).map((x) => x[1]);
    const top = order.slice(0, 1 + (rand() < 0.4 ? 1 : 0));
    const bottom = order.slice(2, 3 + (rand() < 0.35 ? 1 : 0));
    const tags = SO_TAGS.map((t) => [rand(), t]).sort((x, y) => x[0] - y[0]).slice(0, 1 + Math.floor(rand() * 3)).map((x) => x[1]);
    list.push(soNewCall(a, dir, rand, [day, score, top, bottom, tags]));
    if (rand() < 0.65) day = Math.max(1, day - 1);
  }
  SO_CALL_LISTS.set(key, list);
  return list;
}

let soReady = false;
function soInit() {
  if (soReady) return;
  soReady = true;
  SO_AGENTS.forEach((a) => ["Outbound", "Inbound"].forEach((d) => soCalls(a, d)));
}

// Stage results for a call: top stages grade well, bottom stages grade poorly, the rest mostly follow the agent's rating
// for that stage (so a matrix cell or dashboard slice always has calls behind it) with some variation.
const SO_STAGE_CACHE = new Map();
function soCallStages(call) {
  if (SO_STAGE_CACHE.has(call.id)) return SO_STAGE_CACHE.get(call.id);
  const rand = rng(hash(call.id + "so-stages"));
  const base = soAgentRatings(call.agent, call.dir);
  const stages = SO_STAGES.map((s, i) => {
    let g;
    if (call.top.includes(s.chip)) g = rand() < 0.5 ? "Excellent" : "Good";
    else if (call.bottom.includes(s.chip)) g = rand() < 0.5 ? "Poor" : "Fair";
    else if (base[i] === "Not required" || (s.nr && rand() < 0.12)) g = "Not required";
    else g = rand() < 0.7 ? base[i] : genRating(rand, call.score);
    const bucket = g === "Not required" ? "nr" : SO_LEVEL[g] >= 3 ? "good" : "weak";
    const text = bucket === "nr" ? s.nr : bucket === "good" ? s.good : s.weak;
    const quote = bucket === "good" ? s.qg : bucket === "weak" ? s.qw : "";
    return { name: s.res, chip: s.chip, grade: g, text, quote };
  });
  SO_STAGE_CACHE.set(call.id, stages);
  return stages;
}

const SO_DESIGN_SUMMARY =
  "The agent performed well in the initial stages of the call, providing a clear introduction and disclosure, and effectively verifying the account information. For the first account, the agent correctly identified that it was not ready for settlement, which appropriately led to 'Not Required' grades for subsequent negotiation steps. For the second account, the creditor stated it had already been taken care of, again leading to 'Not Required' for negotiation-related steps. The closing was professional. The agent handled the call efficiently and followed proper procedures for accounts not yet eligible for settlement.";

function soSummary(call, stages) {
  if (call.client === "Lucas Scott") return SO_DESIGN_SUMMARY;
  const list = (g) => stages.filter(g).map((s) => s.chip);
  const good = list((s) => SO_LEVEL[s.grade] >= 3);
  const weak = list((s) => s.grade === "Fair" || s.grade === "Poor");
  const nr = list((s) => s.grade === "Not required");
  const join = (a) => a.slice(0, 3).join(", ");
  const tone = call.score >= 80 ? "well" : call.score >= 60 ? "adequately" : "poorly";
  return [
    `The agent handled this ${call.dir.toLowerCase()} call ${tone} overall.`,
    good.length ? `The strongest steps were ${join(good)}.` : "",
    weak.length ? `The agent fell short on ${join(weak)}, where required steps were missed or incomplete.` : "All required steps were completed.",
    nr.length ? `${nr.length} step${nr.length === 1 ? " was" : "s were"} marked 'Not Required' because the account was not eligible for that part of the conversation.` : "",
    call.score >= 60 ? "The call closed professionally." : "Coaching is recommended before the next review.",
  ]
    .filter(Boolean)
    .join(" ");
}

// ---------- Call details ----------
function soResultsHtml(stages) {
  const st = soState.call;
  return stages
    .map((s) => {
      const open = st.open.has(s.name);
      const id = "soc-" + slugify(s.name);
      return `<section class="stage rstage so-stage">
        <button class="stage-head" type="button" data-name="${esc(s.name)}" aria-expanded="${open}" aria-controls="${id}">
          <span class="stage-title">${esc(s.name)}</span>${soChip(s.grade)}<span class="chev">${icon("i-chevron")}</span>
        </button>
        <div class="stage-body" id="${id}"${open ? "" : " hidden"}>
          <p>${esc(s.text)}${s.quote ? ` <span class="so-who">Agent:</span> “${esc(s.quote)}”` : ""}</p>
        </div>
      </section>`;
    })
    .join("");
}

function soTranscriptHtml(call) {
  const phone = soPhone(call.id);
  return `<div class="tx-list">${SO_TX.map(
    ([who, t, text], i) => `<article class="tx tx-${who === "a" ? "agent" : "client"}" id="sotx-${i}" data-i="${i}" data-t="${secs(t)}">
      <div class="tx-top"><b>${who === "a" ? `Agent ${esc(call.agent.name)}` : `Client ${phone}`}</b><span class="tx-time">${t}</span></div>
      <p>${esc(text)}</p>
    </article>`
  ).join("")}</div>`;
}

function renderSoCall() {
  const st = soState.call;
  const c = st.call;
  if (!c) return;
  const stages = soCallStages(c);
  if (!st.open) st.open = new Set(stages.map((s) => s.name));
  document.getElementById("soc-title").textContent = `${c.client} • Call Details`;

  const [dm, ds] = c.duration.split(":").map(Number);
  const end = c.start + dm + Math.round(ds / 60);
  document.getElementById("soc-overview").innerHTML = `<h2>Call Overview</h2>
    <div class="so-kv"><span class="k">Overall Grade</span>${soGrade(c.score)}<b>${c.score}%</b></div>
    <div class="so-kv"><span class="k">Completion Rate:</span><b>${c.completion}%</b></div>
    <div class="so-kv"><span class="k">Call Start Time:</span><b>${soTime(c.start)}</b></div>
    <div class="so-kv"><span class="k">Call End Time:</span><b>${soTime(end)}</b></div>`;

  const counts = SO_GRADE_ORDER.map((g) => stages.filter((s) => s.grade === g).length);
  const bar = SO_GRADE_ORDER.map((g, i) => (counts[i] ? `<i style="flex:${counts[i]};background:${SO_COLOR[g]}" title="${g}: ${counts[i]}"></i>` : "")).join("");
  const legend = SO_GRADE_ORDER.map((g) => `<span><i style="background:${SO_COLOR[g]}"></i>${g === "Not required" ? "Not Required" : g}</span>`).join("");
  document.getElementById("soc-steps").innerHTML = `<div class="step-results"><h3>Step Results</h3><div class="step-bar">${bar}</div><div class="step-legend">${legend}</div></div>`;
  document.getElementById("soc-summary").innerHTML = `<h2>Call Summary</h2><p>${esc(soSummary(c, stages))}</p>`;

  document.getElementById("soc-meta").innerHTML = `<span><b>Call Duration:</b> ${esc(c.duration)}</span>`;
  document.querySelectorAll("#soc-tabs button").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.tab === st.tab)));
  const results = document.getElementById("soc-results");
  const tx = document.getElementById("soc-transcript");
  results.hidden = st.tab !== "results";
  tx.hidden = st.tab !== "transcript";
  if (st.tab === "results") results.innerHTML = soResultsHtml(stages);
  else {
    tx.innerHTML = soTranscriptHtml(c);
    soMarkCurrent();
  }
  soPaintPlayer();
}

function soOpenCall(c, cameFrom) {
  const st = soState.call;
  if (st.call !== c) {
    soStopCall();
    Object.assign(st, { call: c, tab: "results", open: null, pos: 0 });
  }
  const back = document.getElementById("soc-back");
  // Coming from Call Records, go back to that list with its filters intact.
  const fromList = cameFrom.startsWith("#/setops/calls");
  back.href = fromList ? soCallsHash() : `#/setops/agent/${c.agent.slug}`;
  document.getElementById("soc-back-name").textContent = fromList ? "Call Records" : c.agent.name;
  // Keep the agent view on the direction of the call the user came from.
  if (soState.agent.a !== c.agent) soOpenAgent(c.agent, cameFrom);
  soState.agent.dir = c.dir;
  dropdownPainters.forEach((f) => f());
  document.title = `EvalAI - SetOps - Call Details #${c.id}`;
  renderSoCall();
}

// ---------- Player (same behavior as the retail call player) ----------
function soPaintPlayer() {
  const st = soState.call;
  if (!st.call) return;
  const total = secs(st.call.duration);
  document.getElementById("soc-fill").style.width = `${(st.pos / total) * 100}%`;
  document.getElementById("soc-time").textContent = `${clock(st.pos)} / ${clock(total)}`;
  const btn = document.getElementById("soc-play");
  btn.innerHTML = icon(st.playing ? "i-pause" : "i-play", 18);
  btn.setAttribute("aria-label", st.playing ? "Pause call" : "Play call");
}

function soMarkCurrent() {
  const st = soState.call;
  if (st.tab !== "transcript") return;
  let cur = -1;
  SO_TX.forEach(([, t], i) => {
    if (secs(t) <= st.pos && st.playing) cur = i;
  });
  document.querySelectorAll("#soc-transcript .tx").forEach((el) => el.classList.toggle("tx-cur", Number(el.dataset.i) === cur));
}

function soStopCall() {
  const st = soState.call;
  clearInterval(st.timer);
  st.playing = false;
  soPaintPlayer();
}

function soToggleCall() {
  const st = soState.call;
  if (st.playing) return soStopCall();
  if (st.pos >= secs(st.call.duration)) st.pos = 0;
  st.playing = true;
  soPaintPlayer();
  st.timer = setInterval(() => {
    st.pos += 1;
    if (st.pos >= secs(st.call.duration)) soStopCall();
    soPaintPlayer();
    soMarkCurrent();
  }, 1000);
}

// ---------- Agent Matrix ----------
// Agents in the user's scope against every call stage. `withLevel` false skips the Performance Level filter (legend counts).
// Every multi-select filter is a list where empty means "all"; an agent shows when any selected stage has any selected level.
const soIn = (sel, v) => !sel.length || sel.includes(v);
function soMatrixAgents(withLevel = true) {
  const m = soState.matrix;
  const q = m.query.toLowerCase();
  return soScopeAgents()
    .filter((a) => soIn(m.wg, a.wg) && soIn(m.sup, soUserOf(a.sup).name) && (!q || a.name.toLowerCase().includes(q)))
    .map((a) => {
      const r = soAgentRatings(a, m.dir);
      return { ...a, r, lv: r.map((g) => SO_LEVEL[g]), score: soAgentBase(a, m.dir).score, supName: soUserOf(a.sup).name };
    })
    .filter((a) => SO_STAGES.some((s, i) => soIn(m.stage, s.chip) && (!withLevel || soIn(m.level, a.r[i]))));
}
const soMatrixStages = () => SO_STAGES.map((s, i) => ({ s, i })).filter(({ s }) => soIn(soState.matrix.stage, s.chip));

// A rating cell links to the calls behind it. With a Performance Level filter set, other levels are dimmed.
function soMatrixCell(r, i) {
  const m = soState.matrix;
  const g = r.r[i];
  const dim = !soIn(m.level, g);
  const href = soDrill({ agent: r.slug, stage: SO_STAGES[i].chip, level: g, dir: m.dir });
  return `<a class="so-cell${dim ? " so-dim" : ""}" href="${esc(href)}" title="${esc(`${r.name} • ${SO_STAGES[i].chip}: ${g}. View calls`)}">${soChip(g)}</a>`;
}

const soMatrixCols = () => [
  { key: "name", label: "Agent", px: 170, sortable: true, render: (r) => soAgentLink(r) },
  { key: "supName", label: "Supervisor", px: 130, sortable: true },
  { key: "wg", label: "Workgroup", px: 100, sortable: true },
  { key: "score", label: "Avg. Scoring", px: 120, sortable: true, render: (r) => soScore(r.score) },
  ...soMatrixStages().map(({ s, i }) => ({ key: "s" + i, label: s.chip, px: 125, sortable: true, render: (r) => soMatrixCell(r, i) })),
];

// Footer: each stage's average rating across the agents shown ("Not required" ratings are left out of the mean).
function soMatrixFoot(agents) {
  if (!agents.length) return "";
  const cells = soMatrixStages().map(({ i }) => `<td>${soChip(soLevelOf(soStageMean(agents, i)))}</td>`).join("");
  return `<tfoot><tr><td>Average (${agents.length} agent${agents.length === 1 ? "" : "s"})</td><td></td><td></td><td>${soScore(Math.round(soAvg(agents.map((a) => a.score))))}</td>${cells}</tr></tfoot>`;
}

function renderSoMatrix() {
  const m = soState.matrix;
  const scope = soScopeAgents();
  const sups = new Set(scope.map((a) => a.sup));
  document.getElementById("dd-som-sup").hidden = sups.size < 2;
  const supNames = [...sups].map((id) => soUserOf(id).name);
  m.sup = m.sup.filter((n) => supNames.includes(n));

  const stages = soMatrixStages();
  const rows = sortRows(soMatrixAgents(), m.sort, soDashValue);
  const cols = soMatrixCols();
  fillTable("som-grid", cols, m.sort, wsRows(cols, rows), scope.length ? "No agents match your filters." : "No agents are assigned to you yet.");
  document.getElementById("som-grid").insertAdjacentHTML("beforeend", soMatrixFoot(rows));
  document.getElementById("som-sub").textContent = `Showing ${rows.length} of ${scope.length} agent${scope.length === 1 ? "" : "s"} in your hierarchy across ${stages.length} call stage${stages.length === 1 ? "" : "s"}. Select a rating to see the calls behind it.`;

  // The legend doubles as the Performance Level filter (select several) and counts the cells at each level.
  const counts = Object.fromEntries(SO_LEVEL_OPTS.map((g) => [g, 0]));
  soMatrixAgents(false).forEach((a) => stages.forEach(({ i }) => (counts[a.r[i]] += 1)));
  document.getElementById("som-legend").innerHTML = SO_LEVEL_OPTS.map(
    (g) => `<button class="so-slice" type="button" data-level="${g}" aria-pressed="${m.level.includes(g)}"><i style="background:${SO_COLOR[g]}"></i>${g}<b>${counts[g]}</b></button>`
  ).join("");
}

// ---------- Call Records (drill-down list) ----------
// Calls in the user's scope that match every filter except Performance Level. `st` holds each call's results for the
// selected Call Stage (all stages when none is selected).
function soListBase() {
  const f = soState.calls;
  const dirs = f.dir === SO_DIR_BOTH ? ["Outbound", "Inbound"] : [f.dir];
  const out = [];
  soScopeAgents()
    .filter((a) => (!f.agent || a.slug === f.agent) && (f.wg === "All" || a.wg === f.wg))
    .forEach((a) =>
      dirs.forEach((d) =>
        soCalls(a, d).forEach((c) => {
          if (f.tag !== SO_TAG_ALL && !c.tags.includes(f.tag)) return;
          out.push({ ...c, agentName: a.name, wg: a.wg, st: soCallStages(c).filter((s) => f.stage === SO_STAGE_ALL || s.chip === f.stage) });
        })
      )
    );
  return out;
}

// Adds the Performance Level filter; `hits` are the stage results that matched, shown in the table.
function soListRows(base) {
  const f = soState.calls;
  return base
    .filter((r) => f.level === SO_LEVEL_ALL || r.st.some((s) => s.grade === f.level))
    .map((r) => ({ ...r, hits: f.level === SO_LEVEL_ALL ? r.st : r.st.filter((s) => s.grade === f.level) }));
}

const SO_LIST_COLS = [
  { key: "date", label: "Call Date", px: 110, sortable: true, render: (r) => fmtDate(r.date) },
  { key: "agentName", label: "Agent", px: 150, sortable: true, render: (r) => soAgentLink(r.agent) },
  { key: "wg", label: "Workgroup", px: 100, sortable: true },
  { key: "dir", label: "Direction", px: 100, sortable: true },
  { key: "score", label: "Call Scoring", px: 130, sortable: true, render: (r) => soScore(r.score) },
  {
    key: "hits",
    label: "Stage Ratings",
    px: 330,
    cls: "so-wrap",
    render: (r) => {
      const f = soState.calls;
      if (f.stage === SO_STAGE_ALL && f.level === SO_LEVEL_ALL) return `<span class="so-muted">All ${r.hits.length} stages</span>`;
      return r.hits.map((h) => `<span class="so-hit">${esc(h.chip)}${soChip(h.grade)}</span>`).join("");
    },
  },
  { key: "tags", label: "Call Tags", px: 240, cls: "so-wrap", render: (r) => r.tags.map(soTagChip).join("") },
  { key: "details", label: "Call Details", px: 140, render: (r) => `<a class="text-btn" href="#/setops/call/${r.id}">View call details</a>` },
];

function soListKpis(base, rows) {
  const f = soState.calls;
  const total = soSum(soScopeAgents().map((a) => soCalls(a, "Outbound").length + soCalls(a, "Inbound").length));
  const agents = new Set(rows.map((r) => r.agent.slug)).size;
  const avg = rows.length ? Math.round(soAvg(rows.map((r) => r.score))) : null;
  const counts = Object.fromEntries(SO_LEVEL_OPTS.map((g) => [g, 0]));
  base.forEach((r) => r.st.forEach((s) => (counts[s.grade] += 1)));
  const results = soSum(Object.values(counts));

  const bar = SO_LEVEL_OPTS.filter((g) => counts[g])
    .map((g) => `<button class="so-seg${f.level !== SO_LEVEL_ALL && f.level !== g ? " so-dim" : ""}" type="button" data-level="${g}" style="flex:${counts[g]};background:${SO_COLOR[g]}" title="${g}: ${counts[g]}" aria-label="${g}: ${counts[g]}"></button>`)
    .join("");
  const legend = SO_LEVEL_OPTS.map((g) => `<button class="so-slice" type="button" data-level="${g}" aria-pressed="${f.level === g}"><i style="background:${SO_COLOR[g]}"></i>${g}<b>${counts[g]}</b></button>`).join("");
  document.getElementById("sol-kpis").innerHTML =
    soKpi("Calls Matching", [`<b class="so-big">${soN(rows.length)}</b><span>of ${soN(total)} calls</span>`, `<b>${agents}</b><span>agent${agents === 1 ? "" : "s"}</span>`]) +
    soKpi("Avg. Call Scoring", [avg === null ? "<b>–</b>" : `${soGrade(avg)}<b>${avg}%</b>`]) +
    `<article class="card so-dist-card">
      <div><div class="kpi-title">Performance Levels</div></div>
      <div class="so-dist" role="group" aria-label="Performance level breakdown">${bar || '<span class="so-muted">No ratings</span>'}</div>
      <div class="so-legend">${legend}</div>
      <div class="kpi-metric"><div><span>${esc(f.stage === SO_STAGE_ALL ? "All call stages" : f.stage)} • ${soN(results)} rating${results === 1 ? "" : "s"}</span></div></div>
    </article>`;
}

function renderSoList() {
  const f = soState.calls;
  const base = soListBase();
  const rows = soListRows(base);
  soListKpis(base, rows);

  const parts = [f.agent && SO_BY_SLUG.get(f.agent).name, f.wg !== "All" && f.wg, f.stage !== SO_STAGE_ALL && f.stage, f.level !== SO_LEVEL_ALL && f.level, f.tag !== SO_TAG_ALL && f.tag, f.dir !== SO_DIR_BOTH && f.dir].filter(Boolean);
  document.getElementById("sol-sub").textContent = parts.length ? parts.join(" • ") : "All calls in your hierarchy";
  const back = document.getElementById("sol-back");
  back.href = f.back.href;
  document.getElementById("sol-back-name").textContent = f.back.label;

  const sorted = sortRows(rows, f.sort, (r, k) => r[k]);
  fillTable("sol-table", SO_LIST_COLS, f.sort, wsRows(SO_LIST_COLS, soPager("sol", f, sorted), (r) => ` data-id="${r.id}"`), soScopeAgents().length ? "No calls match your filters." : "No agents are assigned to you yet.");
}

// Reads the filters from the URL. Returns false when the link points at an agent outside the user's roster.
function soOpenCalls(cameFrom) {
  const f = soParseCalls(location.hash);
  if (f.agent && !soCanView(SO_BY_SLUG.get(f.agent))) return false;
  const c = soState.calls;
  Object.assign(c, f, { page: 1, sort: { key: "date", dir: "desc" } });
  // Remember where the drill-down started; returning from a call keeps the earlier origin.
  if (cameFrom.startsWith("#/setops/matrix")) c.back = { href: "#/setops/matrix", label: "Agent Matrix" };
  else if (cameFrom.startsWith("#/setops/agent/") && SO_BY_SLUG.has(cameFrom.split("/")[3])) c.back = { href: cameFrom, label: SO_BY_SLUG.get(cameFrom.split("/")[3]).name };
  else if (cameFrom === "#/setops" || cameFrom === "") c.back = { href: "#/setops", label: "Dashboard" };
  document.title = "EvalAI - SetOps - Call Records";
  dropdownPainters.forEach((p) => p());
  renderSoList();
  return true;
}

// ---------- Routing hooks (called from route() in app.js) ----------
function soShow(view) {
  ["dash", "matrix", "calls", "agent", "call"].forEach((v) => (document.getElementById("page-so" + v).hidden = v !== view));
  if (view !== "call") soStopCall();
}

function soRoute(view, slug, cameFrom) {
  soInit();
  if (view === "dash") {
    document.title = "EvalAI - SetOps";
    return renderSoDash();
  }
  if (view === "matrix") {
    document.title = "EvalAI - SetOps - Agent Matrix";
    return renderSoMatrix();
  }
  // Deep links are checked against the roster too, so hiding rows is not the only protection.
  const deny = () => {
    toast("You don't have access to that agent");
    location.hash = "#/setops";
  };
  if (view === "calls") return soOpenCalls(cameFrom) || deny();
  if (view === "agent") {
    const a = SO_BY_SLUG.get(slug);
    if (a && !soCanView(a)) return deny();
    return a ? soOpenAgent(a, cameFrom) : (location.hash = "#/setops");
  }
  const c = SO_CALLS.get(slug);
  if (c && !soCanView(c.agent)) return deny();
  return c ? soOpenCall(c, cameFrom) : (location.hash = "#/setops");
}

// ---------- Init ----------
// Multi-select dropdown: `get()` returns the chosen values (empty = all) and `set(list)` stores a new list in option order.
// The menu stays open while choosing; a click outside closes it like the other dropdowns.
function setupMultiDropdown(id, options, get, set, { title }) {
  const root = document.getElementById(id);
  const btn = root.querySelector(".dd-trigger");
  const menu = root.querySelector(".dd-menu");
  const opts = () => (typeof options === "function" ? options() : options);
  root.classList.add("dd-multi");
  menu.setAttribute("aria-multiselectable", "true");

  const paint = () => {
    const sel = get();
    const label = !sel.length ? "All" : sel.length === 1 ? sel[0] : `${sel.length} selected`;
    btn.innerHTML = `<span>${esc(`${title}: ${label}`)}</span>${icon("i-chevron", 24)}`;
    menu.innerHTML =
      (sel.length ? '<button class="dd-option dd-clear" type="button" data-clear="1">Clear selection</button>' : "") +
      opts().map((o) => `<button class="dd-option" type="button" role="option" aria-selected="${sel.includes(o)}" data-v="${esc(o)}"><span class="dd-check">${sel.includes(o) ? icon("i-check", 14) : ""}</span>${esc(o)}</button>`).join("");
  };
  dropdownPainters.push(paint);

  btn.addEventListener("click", (e) => {
    e.stopPropagation();
    const open = root.dataset.open === "true";
    closeMenus();
    root.setAttribute("data-open", String(!open));
  });
  menu.addEventListener("click", (e) => {
    e.stopPropagation();
    const opt = e.target.closest(".dd-option");
    if (!opt) return;
    const sel = get();
    if (opt.dataset.clear) set([]);
    else set(opts().filter((o) => (o === opt.dataset.v ? !sel.includes(o) : sel.includes(o))));
    dropdownPainters.forEach((p) => p());
  });
  paint();
}
const SO_DATES = Object.keys(SO_RANGES);
const soDashChange = () => {
  soState.dash.a.page = 1;
  renderSoDash();
};
const soUserLabel = (u) => `${u.name} (${u.role})`;
// Prototype-only: stands in for the signed-in user so each role's scope can be checked.
setupDropdown("dd-so-user", SO_USERS.map(soUserLabel), () => soUserLabel(soState.user), (v) => {
  soState.user = SO_USERS.find((u) => soUserLabel(u) === v);
  Object.assign(soState.dash, { wg: "All", query: "" });
  Object.assign(soState.matrix, { wg: [], sup: [], query: "" });
  soState.dash.a.page = 1;
  document.getElementById("sod-search").value = "";
  document.getElementById("som-search").value = "";
  route();
}, { prefix: "View as: " });
setupDropdown("dd-sod-wg", () => ["All", ...soScopeWgs().map((w) => w.name)], () => soState.dash.wg, (v) => {
  soState.dash.wg = v;
  soDashChange();
}, { prefix: "Workgroup: " });
setupDropdown("dd-sod-tag", [SO_TAG_ALL, ...SO_TAGS], () => soState.dash.tag, (v) => {
  soState.dash.tag = v;
  soDashChange();
});
setupDropdown("dd-sod-stage", [SO_STAGE_ALL, ...SO_CHIPS], () => soState.dash.stage, (v) => {
  soState.dash.stage = v;
  soDashChange();
});
setupDropdown("dd-sod-level", [SO_LEVEL_ALL, ...SO_LEVEL_OPTS], () => soState.dash.level, (v) => {
  soState.dash.level = v;
  soDashChange();
});
setupDropdown("dd-sod-dir", SO_DIR_OPTS, () => soState.dash.dir, (v) => {
  soState.dash.dir = v;
  soDashChange();
}, SO_DIR_PREFIX);
setupDropdown("dd-sod-date", SO_DATES, () => soState.dash.date, (v) => {
  soState.dash.date = v;
  soDashChange();
}, { lead: "i-calendar" });
setupDropdown("dd-sod-a-size", ["5", "10", "15"], () => String(soState.dash.a.size), (v) => {
  soState.dash.a.size = Number(v);
  soState.dash.a.page = 1;
  renderSoDash();
}, { prefix: "View " });

const soAgentChange = () => {
  soState.agent.c.page = 1;
  renderSoAgent();
};
setupDropdown("dd-soa-tag", [SO_TAG_ALL, ...SO_TAGS], () => soState.agent.tag, (v) => {
  soState.agent.tag = v;
  soAgentChange();
});
setupDropdown("dd-soa-stage", [SO_STAGE_ALL, ...SO_CHIPS], () => soState.agent.stage, (v) => {
  soState.agent.stage = v;
  soAgentChange();
});
setupDropdown("dd-soa-dir", SO_DIR_OPTS, () => soState.agent.dir, (v) => {
  soState.agent.dir = v;
  soAgentChange();
}, SO_DIR_PREFIX);
setupDropdown("dd-soa-date", SO_DATES, () => soState.agent.date, (v) => {
  soState.agent.date = v;
  renderSoAgent();
}, { lead: "i-calendar" });
setupDropdown("dd-soa-c-size", ["5", "10", "15"], () => String(soState.agent.c.size), (v) => {
  soState.agent.c.size = Number(v);
  soState.agent.c.page = 1;
  renderSoAgent();
}, { prefix: "View " });

bindSort("sod-wg", () => soState.dash.wgSort, renderSoDash);
bindSort("sod-stages", () => soState.dash.stSort, renderSoDash);
bindSort("sod-agents", () => soState.dash.a.sort, () => {
  renderSoDash();
});
bindSort("soa-stages", () => soState.agent.st, renderSoAgent);
bindSort("soa-calls", () => soState.agent.c.sort, renderSoAgent);

// Agent Matrix (multi-select filters)
setupMultiDropdown("dd-som-wg", () => soScopeWgs().map((w) => w.name), () => soState.matrix.wg, (v) => {
  soState.matrix.wg = v;
  renderSoMatrix();
}, { title: "Workgroup" });
setupMultiDropdown("dd-som-sup", () => [...new Set(soScopeAgents().map((a) => a.sup))].map((id) => soUserOf(id).name), () => soState.matrix.sup, (v) => {
  soState.matrix.sup = v;
  renderSoMatrix();
}, { title: "Supervisor" });
setupMultiDropdown("dd-som-stage", SO_CHIPS, () => soState.matrix.stage, (v) => {
  soState.matrix.stage = v;
  renderSoMatrix();
}, { title: "Call Stage" });
setupMultiDropdown("dd-som-level", SO_LEVEL_OPTS, () => soState.matrix.level, (v) => {
  soState.matrix.level = v;
  renderSoMatrix();
}, { title: "Performance Level" });
setupDropdown("dd-som-dir", SO_DIR_OPTS, () => soState.matrix.dir, (v) => {
  soState.matrix.dir = v;
  renderSoMatrix();
}, SO_DIR_PREFIX);
bindSort("som-grid", () => soState.matrix.sort, renderSoMatrix);
document.getElementById("som-search").addEventListener("input", (e) => {
  soState.matrix.query = e.target.value.trim();
  renderSoMatrix();
});
document.getElementById("som-legend").addEventListener("click", (e) => {
  const b = e.target.closest("button[data-level]");
  if (!b) return;
  const m = soState.matrix;
  m.level = m.level.includes(b.dataset.level) ? m.level.filter((l) => l !== b.dataset.level) : SO_LEVEL_OPTS.filter((l) => l === b.dataset.level || m.level.includes(l));
  dropdownPainters.forEach((p) => p());
  renderSoMatrix();
});
document.getElementById("som-download").addEventListener("click", () => {
  const stages = soMatrixStages();
  const rows = sortRows(soMatrixAgents(), soState.matrix.sort, soDashValue);
  saveCsv(
    [["Agent", "Supervisor", "Workgroup", "Avg. Scoring", ...stages.map(({ s }) => s.col)], ...rows.map((r) => [r.name, r.supName, r.wg, `${soLetter(r.score)} ${r.score}%`, ...stages.map(({ i }) => r.r[i])])],
    `agent-matrix-${soState.matrix.dir.toLowerCase()}.csv`
  );
  toast(`Exported ${rows.length} agents`);
});

// Call Records. Filters are mirrored into the URL without adding history entries or re-running the route.
const soListChange = () => {
  soState.calls.page = 1;
  history.replaceState(null, "", soCallsHash());
  renderSoList();
};
setupDropdown("dd-sol-agent", () => [SO_AGENT_ALL, ...soScopeAgents().map((a) => a.name)], () => (soState.calls.agent ? SO_BY_SLUG.get(soState.calls.agent).name : SO_AGENT_ALL), (v) => {
  soState.calls.agent = v === SO_AGENT_ALL ? null : SO_AGENTS.find((a) => a.name === v).slug;
  soListChange();
});
setupDropdown("dd-sol-wg", () => ["All", ...soScopeWgs().map((w) => w.name)], () => soState.calls.wg, (v) => {
  soState.calls.wg = v;
  soListChange();
}, { prefix: "Workgroup: " });
setupDropdown("dd-sol-stage", [SO_STAGE_ALL, ...SO_CHIPS], () => soState.calls.stage, (v) => {
  soState.calls.stage = v;
  soListChange();
});
setupDropdown("dd-sol-level", [SO_LEVEL_ALL, ...SO_LEVEL_OPTS], () => soState.calls.level, (v) => {
  soState.calls.level = v;
  soListChange();
});
setupDropdown("dd-sol-tag", [SO_TAG_ALL, ...SO_TAGS], () => soState.calls.tag, (v) => {
  soState.calls.tag = v;
  soListChange();
});
setupDropdown("dd-sol-dir", SO_DIR_OPTS, () => soState.calls.dir, (v) => {
  soState.calls.dir = v;
  soListChange();
}, SO_DIR_PREFIX);
setupDropdown("dd-sol-size", ["5", "10", "15"], () => String(soState.calls.size), (v) => {
  soState.calls.size = Number(v);
  soState.calls.page = 1;
  renderSoList();
}, { prefix: "View " });
bindSort("sol-table", () => soState.calls.sort, renderSoList);
// Clicking a slice of the Performance Levels card filters to that level; clicking it again clears the filter.
document.getElementById("sol-kpis").addEventListener("click", (e) => {
  const b = e.target.closest("button[data-level]");
  if (!b) return;
  const f = soState.calls;
  f.level = f.level === b.dataset.level ? SO_LEVEL_ALL : b.dataset.level;
  dropdownPainters.forEach((p) => p());
  soListChange();
});
document.getElementById("sol-table").addEventListener("click", (e) => {
  if (e.target.closest("a")) return;
  const row = e.target.closest("tbody tr[data-id]");
  if (row) location.hash = `#/setops/call/${row.dataset.id}`;
});
document.getElementById("sol-download").addEventListener("click", () => {
  const f = soState.calls;
  const rows = sortRows(soListRows(soListBase()), f.sort, (r, k) => r[k]);
  saveCsv(
    [["Call ID", "Call Date", "Agent", "Workgroup", "Direction", "Call Scoring", "Stage Ratings", "Call Tags"], ...rows.map((r) => [r.id, fmtDate(r.date), r.agentName, r.wg, r.dir, `${soLetter(r.score)} ${r.score}%`, r.hits.map((h) => `${h.chip}: ${h.grade}`).join("; "), r.tags.join("; ")])],
    "call-records.csv"
  );
  toast(`Exported ${rows.length} calls`);
});

[
  ["sod-a", () => soState.dash.a, renderSoDash],
  ["soa-c", () => soState.agent.c, renderSoAgent],
  ["sol", () => soState.calls, renderSoList],
].forEach(([id, get, render]) => {
  document.getElementById(id + "-prev").addEventListener("click", () => {
    get().page -= 1;
    render();
  });
  document.getElementById(id + "-next").addEventListener("click", () => {
    get().page += 1;
    render();
  });
});

document.getElementById("sod-search").addEventListener("input", (e) => {
  soState.dash.query = e.target.value.trim();
  soDashChange();
});
document.getElementById("sod-stages").addEventListener("click", (e) => {
  const b = e.target.closest("button[data-wg]");
  if (!b) return;
  soState.dash.wg = b.dataset.wg;
  dropdownPainters.forEach((p) => p());
  soDashChange();
});

document.getElementById("soa-calls").addEventListener("click", (e) => {
  if (e.target.closest("a")) return;
  const row = e.target.closest("tbody tr[data-id]");
  if (row) location.hash = `#/setops/call/${row.dataset.id}`;
});

document.getElementById("sod-download").addEventListener("click", () => {
  const rows = soDashAgents();
  saveCsv(
    [["Agent", "Workgroup", "Calls", "Avg. Scoring", ...SO_STAGES.map((s) => s.col)], ...rows.map((r) => [r.name, r.wg, r.calls, soLetter(r.score), ...r.r])],
    "agent-performance.csv"
  );
  toast(`Exported ${rows.length} agents`);
});
document.getElementById("soa-download").addEventListener("click", () => {
  const rows = soAgentCalls();
  saveCsv(
    [["Call Date", "Call Scoring", "Avg. Top Call Stage", "Avg. Bottom Call Stage", "Call Tags"], ...rows.map((r) => [fmtDate(r.date), `${soLetter(r.score)} ${r.score}%`, r.top.join("; "), r.bottom.join("; "), r.tags.join("; ")])],
    `${soState.agent.a.slug}-${soState.agent.dir.toLowerCase()}-recent-calls.csv`
  );
  toast(`Exported ${rows.length} calls`);
});
document.getElementById("soc-download").addEventListener("click", () => {
  const st = soState.call;
  const c = st.call;
  if (st.tab === "transcript") {
    const phone = soPhone(c.id);
    const rows = SO_TX.map(([who, t, text]) => [who === "a" ? `Agent ${c.agent.name}` : `Client ${phone}`, t, text]);
    saveCsv([["Speaker", "Time", "Text"], ...rows], `call-${c.id}-transcript.csv`);
    toast(`Exported ${rows.length} lines`);
    return;
  }
  const rows = soCallStages(c).map((s) => [s.name, s.grade, s.text + (s.quote ? ` Agent: "${s.quote}"` : "")]);
  saveCsv([["Call Stage", "Rating", "Summary"], ...rows], `call-${c.id}-results.csv`);
  toast(`Exported ${rows.length} stages`);
});

document.getElementById("soc-tabs").addEventListener("click", (e) => {
  const b = e.target.closest("button[data-tab]");
  if (!b || b.dataset.tab === soState.call.tab) return;
  soState.call.tab = b.dataset.tab;
  renderSoCall();
});
document.getElementById("soc-results").addEventListener("click", (e) => {
  const head = e.target.closest(".stage-head");
  if (!head) return;
  const st = soState.call;
  const open = !st.open.has(head.dataset.name);
  if (open) st.open.add(head.dataset.name);
  else st.open.delete(head.dataset.name);
  head.setAttribute("aria-expanded", String(open));
  document.getElementById(head.getAttribute("aria-controls")).hidden = !open;
});
document.getElementById("soc-transcript").addEventListener("click", (e) => {
  const line = e.target.closest(".tx");
  if (!line) return;
  soState.call.pos = Math.min(Number(line.dataset.t), secs(soState.call.call.duration));
  soPaintPlayer();
  soMarkCurrent();
});
document.getElementById("soc-play").addEventListener("click", soToggleCall);
document.getElementById("soc-track").addEventListener("click", (e) => {
  const r = e.currentTarget.getBoundingClientRect();
  soState.call.pos = Math.round(((e.clientX - r.left) / r.width) * secs(soState.call.call.duration));
  soPaintPlayer();
  soMarkCurrent();
});

// Transcript as drawn: a = agent, c = client, time, text. The same transcript is shown for every call.
const SO_TX = [
  ["a", "00:00:00", "Hello, and thank you for calling Freedom Debt Relief. My name is Allison. Please be advised this call is being monitored and recorded for quality purposes. Just one"],
  ["c", "00:00:08", "Hi,"],
  ["a", "00:00:08", "moment."],
  ["c", "00:00:09", "Allison, this is Joan Carroll."],
  ["a", "00:00:10", "Yeah."],
  ["c", "00:00:12", "And"],
  ["a", "00:00:12", "It was Joan, you"],
  ["c", "00:00:14", "I'm"],
  ["a", "00:00:14", "said?"],
  ["c", "00:00:14", "on a recorded line from Joan,"],
  ["a", "00:00:16", "OK."],
  ["c", "00:00:16", "J-O-A-N. And I'm with Landmark Financial. I'm trying to see if this"],
  ["a", "00:00:22", "Yeah,"],
  ["c", "00:00:22", "customer is still enrolled, if they are ready to negotiate."],
  ["a", "00:00:26", "of course. What's a good callback number for you?"],
  ["c", "00:00:29", "844-882-3986."],
  ["a", "00:00:33", "OK, perfect."],
  ["c", "00:00:40", "Client's"],
  ["a", "00:00:41", "What's going to be the client's name and last four of social?"],
  ["c", "00:00:47", "name is Ryan, R-Y-A-N Fitzpatrick. Last for the social"],
  ["a", "00:00:53", "And"],
  ["c", "00:00:53", "is"],
  ["a", "00:01:02", "then what's going to be the last four of the account number?"],
  ["c", "00:01:12", "3508."],
  ["a", "00:01:16", "And then can you confirm the balance for me on that account?"],
  ["c", "00:01:31", "4607. I have principal balance of $9,412.26. Yes,"],
  ["a", "00:01:42", "In 26 cents, you said? Okay,"],
  ["c", "00:01:45", "ma'am."],
  ["a", "00:01:46", "perfect. I have that account pulled up here. And then it looks like this account is not ready for settlement yet. Once it's ready, then a negotiator will be assigned and contact you."],
  ["c", "00:02:00", "Okay."],
  ["a", "00:02:00", "Yes,"],
  ["c", "00:02:01", "And can you check one more for me?"],
  ["a", "00:02:04", "so just be one moment."],
  ["c", "00:02:05", "That's okay. I have to get into there anyway."],
  ["a", "00:02:11", "And then whenever you're ready, I'm ready for the name and last four of social."],
  ["c", "00:02:24", "Okay. It looks like this one has already been taken care"],
  ["a", "00:02:28", "OK. Anything"],
  ["c", "00:02:29", "of."],
  ["a", "00:02:31", "else I can help you with today?"],
  ["c", "00:02:33", "Just have a great day."],
  ["a", "00:02:35", "Yeah, you too."],
  ["c", "00:02:36", "Thank"],
  ["a", "00:02:37", "Bye."],
  ["c", "00:02:38", "you. Bye."],
];
