// ---------- Wholesale ----------
// Figma nodes: 4106:13345 (entry dashboard), 4106:14405 (partner overview), 4106:16429 (agent overview),
// 4106:20703 (call details), 4106:21230 (call details transcript). Loaded after app.js and reuses its helpers.
// 13 partners come from the "EvalAI Oct 2026 - QA Dashboard" sheet (2,042 calls): call totals, pass rates, relationship managers and
// per-category results. For those partners, agents, their pass rates, top/bottom agents and recent calls (with the AI fail reasons)
// come from the partner sheets via wholesale-data.js (WS_REAL, built by EvalAI/wholesale/extract.js); if that file is empty they are
// generated to add up to the totals instead. The earlier partners that are not in the sheet (Symple, Penni, Iconic, ...) are kept with
// their earlier sample numbers. Symple's agents and calls, and Haley James's calls, are drawn in the design; the rest is generated.
// Categories, descriptions and example statements follow the Wholesale scoring sheets (Eval AI Scoring Phase 1, Discrepancy,
// Call to train model) and the Wholesale Scoring Breakdown.

const WS_FILE_CATS = ["Misrepresentation", "Legal Action", "Credit Impact/Disclosure", "Downplaying Program Summary Recording"];
const wsPct = (n, d) => Math.round((n / d) * 1000) / 10;
// Partner, relationship manager, total calls, calls passed, then [passed, failed] per category (WS_FILE_CATS order).
const WS_SHEET_PARTNERS = [
  ["Puridy", "Joey", 108, 103, [[108, 0], [107, 1], [108, 0], [104, 4]]],
  ["DM", "Geoff", 28, 25, [[26, 2], [28, 0], [27, 1], [28, 0]]],
  ["Rescue 1 financial", "Joey", 1008, 779, [[907, 101], [968, 40], [857, 151], [927, 81]]],
  ["Done with Debt", "Joey", 146, 109, [[131, 15], [140, 6], [131, 15], [133, 13]]],
  ["Liberty1 (Clear Vision)", "Geoff", 57, 41, [[52, 5], [55, 2], [51, 6], [47, 10]]],
  ["United Financial Network", "Eric", 258, 171, [[243, 15], [240, 18], [209, 49], [217, 41]]],
  ["Legacy", "Joey", 101, 64, [[85, 16], [96, 5], [81, 20], [83, 18]]],
  ["DR Professionals", "Roxana", 19, 9, [[10, 9], [19, 0], [12, 7], [17, 2]]],
  ["Empower", "Joey", 102, 46, [[84, 18], [97, 5], [67, 35], [80, 22]]],
  ["Debt Relief Advocates", "Geoff", 29, 13, [[19, 10], [28, 1], [22, 7], [27, 2]]],
  ["American One Financial", "Eric", 96, 41, [[75, 21], [77, 19], [59, 37], [88, 8]]],
  ["Financial Catalyst", "Roxana", 26, 7, [[19, 7], [20, 6], [17, 9], [15, 11]]],
  ["Easy Finance", "Eric", 64, 16, [[45, 19], [52, 12], [34, 30], [52, 12]]],
]
  .map(([name, rm, total, passed, cats]) => ({
    name,
    rm,
    total,
    passed,
    failed: total - passed,
    catCounts: cats.map(([ok, bad]) => ({ passed: ok, failed: bad })),
    pass: wsPct(passed, total),
    fail: wsPct(total - passed, total),
    catPass: Object.fromEntries(WS_FILE_CATS.map((c, i) => [c, wsPct(cats[i][0], cats[i][0] + cats[i][1])])),
    slug: slugify(name).replace(/-$/, ""),
    domain: name.toLowerCase().replace(/\(.*\)/, "").replace(/[^a-z0-9]/g, "") + ".com",
  }));

// Category pass rates the earlier sample data was built on (Symple's are drawn).
const WS_BASE_CAT_PASS = { Misrepresentation: 31, "Credit Impact/Disclosure": 52, "Downplaying Program Summary Recording": 88, "Legal Action": 76 };

// Earlier partners that are not in the sheet: name, pass, fail. They have no relationship manager. Symple's totals are drawn; the
// others' call totals and category rates are generated.
const WS_EXTRA_PARTNERS = [
  ["Iconic", 15, 85],
  ["Absolute Debt Relief", 31, 69],
  ["Advantage First", 45, 55],
  ["Complete Debt Relief", 48, 52],
  ["Penni", 61, 39],
  ["Symple", 92, 8],
  ["Debtmerica", 78, 22],
].map(([name, pass, fail]) => {
  const slug = slugify(name).replace(/-$/, "");
  const symple = name === "Symple";
  const rand = rng(hash(slug + "ws-kpi"));
  const total = symple ? 344 : 150 + Math.floor(rand() * 600);
  const failed = symple ? 154 : Math.round((total * fail) / 100);
  const catRand = rng(hash(slug + "ws-cat-pass"));
  return {
    name,
    rm: "",
    total,
    passed: total - failed,
    failed,
    // Shown next to the call counts on the dashboard, so they follow those counts.
    pass: wsPct(total - failed, total),
    fail: wsPct(failed, total),
    // Symple's Total Failures card is drawn as 36% and 48.2%.
    kpi: symple ? { calls: 344, fails: 154, failPct: 36, pass: 48.2 } : null,
    catPass: Object.fromEntries(
      Object.entries(WS_BASE_CAT_PASS).map(([c, base]) => [c, symple ? base : Math.max(8, Math.min(96, Math.round(base + (pass - 60) / 2 + (catRand() - 0.5) * 24)))])
    ),
    slug,
    domain: name.toLowerCase().replace(/\(.*\)/, "").replace(/[^a-z0-9]/g, "") + ".com",
  };
});

const WS_PARTNERS = [...WS_SHEET_PARTNERS, ...WS_EXTRA_PARTNERS].sort((a, b) => b.pass - a.pass);

// Compliance categories. `cites` are quotes from the transcript (`line` is the TRANSCRIPT index) with the AI reason;
// a failed category in a call shows these. Descriptions also feed the hover tooltips.
const WS_CATS = [
  {
    name: "Misrepresentation",
    chips: ["Misrepresentation"],
    pass: 81.8,
    desc: `Agents must not misrepresent program features or lead clients to believe untrue claims. For example, agents must not falsely claim government (Federal or State) approvals or sponsorship. Additionally, agents must not guarantee specific settlement times, amounts, or percentages without clearly stating that these figures are estimates.`,
    cites: [
      { line: 1, quote: "You no longer have to pay $7,100 a year in interest, and you will be guaranteed a savings.", reason: "The agent reiterated a definitive guarantee of savings instead of using estimated or probabilistic language." },
      { line: 5, quote: "After the first three months, One main will have their first settlement. We reach out to you and you sign off.", reason: "The agent explicitly guaranteed an exact settlement timeframe without stating that it is an estimate." },
      { line: 12, quote: "Oh, no, 100%. It's a guarantee that all of them are going to be settled and everything will be paid off, 100%.", reason: "The agent makes an absolute guarantee of debt settlement." },
    ],
  },
  {
    name: "Credit Impact/Disclosure",
    chips: ["Credit impact", "Disclosure"],
    pass: 77.3,
    desc: "Debt resolution may negatively impact a client's credit score for an extended period. Agents must never state or imply that enrolling in the debt settlement program will improve the client's credit score.",
    cites: [
      { line: 1, quote: "Your credit score is finally going to take a turn for the better.", reason: "The agent made a definitive promise that the client's credit score will recover and take a turn for the better." },
      { line: 10, quote: "So, yeah, this will rebound itself right back to where it was once all of these accounts are paid.", reason: "The agent promised that the client's credit score will definitively rebound right back to where it was, violating credit impact rules." },
    ],
  },
  {
    name: "Downplaying Program Summary Recording",
    chips: ["Downplaying"],
    pass: 86.0,
    desc: "Agents must present the Program Summary Call Recording as a critical step and clearly communicate its relevance. Instructing clients to disregard the recording, not pay attention, or suggest that any portion does not apply to them is strictly prohibited",
    cites: [
      { line: 6, quote: "I will advise, not everything on the recording applies to you. Everyone's situation is a little bit different.", reason: "The agent explicitly downplayed the Program Summary Call Recording by instructing the client that not everything on the recording applies to them." },
      { line: 8, quote: "Not all of these points apply to you. I don't want you to get deterred or scared off here.", reason: "The agent explicitly stated that not all disclosure points apply to the client, downplaying the mandatory disclosure recording." },
    ],
  },
  {
    name: "Legal Action",
    chips: ["Legal action"],
    pass: 92.7,
    desc: `Agents must never state or imply that clients will not face creditor lawsuits, including making claims that they have never seen it happen. For example, agents cannot state "You won't get sued" or "I've never seen anyone get sued".`,
    cites: [
      { line: 3, quote: "No, that's not going to happen. A lot of the things that they say is just for compliance purposes.", reason: "The agent explicitly denies that creditor legal action will occur when directly questioned by the client." },
      { line: 12, quote: "None of my clients have ever been sued by a creditor.", reason: "The agent implies the program prevents lawsuits, which misrepresents the program's protection from creditor collection efforts." },
    ],
  },
];
const WS_CAT = Object.fromEntries(WS_CATS.map((c) => [c.name, c]));

// Scorecards from the Wholesale Scoring Breakdown. A call is scored against one of them.
const WS_SCORECARDS = ["Sales Initial", "Sales Initial ARP", "Sales Initial 2.0", "FDR Program Summary", "FDR Program Summary ARP"];

// "Agent said ..." reasons per category, used for generated calls. Most are agent statements from the scoring sheets.
const WS_SAID = {
  Misrepresentation: [
    'Agent said "You will be guaranteed a savings"',
    'Agent said "After the first three months, your main account will have its first settlement"',
    'Agent said "100%. It\'s a guarantee that all of them are going to be settled"',
    'Agent said "This is government regulated, so there is no downside"',
  ],
  "Credit Impact/Disclosure": [
    'Agent said "Your credit score is finally going to take a turn for the better"',
    'Agent said "This will rebound itself right back to where it was once all of these accounts are paid"',
    `Agent said "Your credit's actually going to go up, you're going to skyrocket"`,
    'Agent said "We will start seeing scores go up at about the three- to six-month mark"',
  ],
  "Downplaying Program Summary Recording": [
    `Agent said "Not everything on the recording applies to you"`,
    `Agent said "You can skip through the recording, it's mostly legal language"`,
    `Agent said "Don't worry about that part of the recording"`,
  ],
  "Legal Action": [
    'Agent said "No, that\'s not going to happen. A lot of the things that they say is just for compliance purposes"',
    'Agent said "None of my clients have ever been sued by a creditor"',
    'Agent said "Once you enroll, creditors can no longer take legal action"',
  ],
};

// Symple agents as drawn: name, pass %, fail %, total calls, bottom category.
const WS_SYMPLE_AGENTS = [
  ["Dawson Leery", 85, 15, 3, "Misrepresentation"],
  ["Joey Potter", 38, 72, 4, "Credit Impact/Disclosure"],
  ["Pacey Witter", 31, 69, 3, "Downplaying Program Summary Recording"],
  ["Jen Lindley", 15, 85, 2, "Misrepresentation"],
  ["Andie McPhee", 52, 48, 5, "Credit Impact/Disclosure"],
  ["Jack McPhee", 43, 47, 4, "Downplaying Program Summary Recording"],
  ["Grams Jensen", 48, 52, 4, "Misrepresentation"],
];
// Agents that appear in Symple's Recent Calls and Top/Bottom Agent cells but not in the drawn agent rows.
const WS_SYMPLE_EXTRA = ["Lucas Scott", "Brooke Davis", "Peyton Sawyer", "Haley James", "Dan Scott", "Keith Scott", "Karen Roe", "Mouth McFadden", "Rachel Gatina", "Nathan Scott"];
// Symple Category Performance as drawn: top agent, bottom agent (WS_CATS order).
const WS_SYMPLE_CATS = [
  ["Peyton Sawyer", "Brooke Davis"],
  ["Pacey Witter", "Haley James"],
  ["Joey Potter", "Dawson Leery"],
  ["Lucas Scott", "Nathan Scott"],
];
// Haley James's Performance by Category as drawn: pass, fail (WS_CATS order).
const WS_HALEY_CATS = [[31, 78], [43, 78], [88, 12], [86, 14]];
const wsIsHaley = (a) => a.slug === "symple-haley-james";

// Recent Calls rows as drawn. `back` is how many days before the latest call date.
const WS_SYMPLE_CALLS = [
  { pass: true, back: 0, duration: "00:08:42", agent: "Lucas Scott", cats: ["Misrepresentation", "Credit Impact/Disclosure"], reason: "", failPct: 54 },
  { pass: false, back: 5, duration: "00:06:55", agent: "Brooke Davis", cats: ["Legal Action"], reason: 'Agent said "This is a much better option than filing for bankruptcy"', failPct: 46 },
  { pass: false, back: 7, duration: "00:15:03", agent: "Peyton Sawyer", cats: ["Misrepresentation"], reason: 'Agent said "Your credit score will recover within 12 months of enrollment"', failPct: 83 },
  { pass: true, back: 10, duration: "00:09:28", agent: "Haley James", cats: ["Downplaying Program Summary Recording", "Credit Impact/Disclosure"], reason: "", failPct: 37 },
  { pass: false, back: 12, duration: "00:11:44", agent: "Dan Scott", cats: ["Legal Action"], reason: `Agent said "You'll see a real improvement in your credit within 6 months"`, failPct: 63 },
  { pass: false, back: 14, duration: "00:07:31", agent: "Keith Scott", cats: ["Misrepresentation"], reason: 'Agent said "We can settle your debt for 40 cents on the dollar"', failPct: 79 },
  { pass: false, back: 17, duration: "00:14:09", agent: "Karen Roe", cats: ["Legal Action"], reason: 'Agent said "We work directly with the credit bureaus on your behalf"', failPct: 68 },
  { pass: false, back: 20, duration: "00:10:22", agent: "Mouth McFadden", cats: ["Downplaying Program Summary Recording"], reason: "", failPct: 91 },
  { pass: false, back: 23, duration: "00:13:56", agent: "Rachel Gatina", cats: ["Misrepresentation", "Legal Action"], reason: `Agent said "This offer expires at the end of today's call"`, failPct: 76 },
];
const WS_HALEY_CALLS = [
  { pass: true, back: 0, duration: "00:08:42", cats: ["Misrepresentation", "Credit Impact/Disclosure"], reason: `Agent said "This offer expires at the end of today's call"`, failPct: 78 },
  { pass: false, back: 1, duration: "00:12:17", cats: ["Misrepresentation"], reason: 'Agent said "None of my clients have ever been sued by a creditor"', failPct: 66 },
  { pass: false, back: 2, duration: "00:06:55", cats: ["Misrepresentation"], reason: 'Agent said "This is a much better option than filing for bankruptcy"', failPct: 74 },
  { pass: false, back: 4, duration: "00:15:03", cats: ["Credit Impact/Disclosure", "Downplaying Program Summary Recording"], reason: `Agent said "You'll see a real improvement in your credit within 6 months"`, failPct: 82 },
  { pass: true, back: 5, duration: "00:09:28", cats: ["Misrepresentation"], reason: "", failPct: 88 },
  { pass: false, back: 7, duration: "00:07:38", cats: ["Misrepresentation"], reason: 'Agent said "We can settle your debt for 40 cents on the dollar"', failPct: 69 },
];

// Generated agent names.
const WS_NAMES = [
  "Ryan Atwood", "Seth Cohen", "Marissa Cooper", "Summer Roberts", "Sandy Cohen", "Kirsten Cohen", "Julie Cooper", "Caleb Nichol",
  "Taylor Townsend", "Luke Ward", "Dawson Leery", "Joey Potter", "Pacey Witter", "Jen Lindley", "Andie McPhee", "Jack McPhee",
  "Lucas Scott", "Brooke Davis", "Peyton Sawyer", "Haley James", "Dan Scott", "Keith Scott", "Rachel Gatina", "Nathan Scott",
];

// ---------- State ----------
const WS_NO_SORT = () => ({ key: null, dir: "asc" });
// The date filter opens on Last 30 days.
const wsState = {
  date: "Last 30 days",
  dash: { query: "" },
  partner: { p: null, query: "", agent: "All agents", a: { page: 1, size: 10 }, c: { page: 1, size: 10, sort: WS_NO_SORT() } },
  agent: { a: null, query: "", cats: WS_NO_SORT(), c: { page: 1, size: 10, sort: WS_NO_SORT() } },
  call: { call: null, from: null, tab: "categories", sort: "Score: Ascending", query: "", open: null, jump: null, pos: 0, playing: false, timer: null },
};

// The sheet's numbers are shown on Last 30 days. Other ranges only scale the dashboard numbers and labels; the tables show the same data.
const WS_DATES = ["Last 30 days", "Last quarter"];
const WS_SCALE = { "Last 30 days": 1, "Last quarter": 3 };
const WS_PASS_DELTA = { "Last 30 days": 0, "Last quarter": -0.6 };

const WS_AGENTS = new Map();
const WS_CALLS = new Map();
let wsReady = false;

// ---------- Helpers ----------
const wsTone = (v) => (v >= 70 ? "positive" : v >= 50 ? "warning" : "negative");
const wsClamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
const wsShort = (name) => {
  const [first, ...rest] = name.split(" ");
  return rest.length ? `${first} ${rest.join(" ")[0]}.` : first;
};
const wsN = (n) => Math.round(n * WS_SCALE[wsState.date]).toLocaleString("en-US");
const wsDate = (daysBack) => {
  const t = new Date();
  const d = new Date(t.getFullYear(), t.getMonth(), t.getDate() - daysBack);
  return `${String(d.getMonth() + 1).padStart(2, "0")}/${String(d.getDate()).padStart(2, "0")}/${String(d.getFullYear()).slice(2)}`;
};
// Sheet dates and durations (10/13/2026, 0:42:48) in the format used here (10/13/26, 00:42:48).
const wsRealDate = (s) => s.replace(/\/\d{2}(\d{2})$/, "/$1");
const wsRealDur = (s) => s.replace(/^(\d):/, "0$1:");

function wsRangeText() {
  const f = (d) => `${String(d.getMonth() + 1).padStart(2, "0")}/${String(d.getDate()).padStart(2, "0")}`;
  const today = new Date();
  const y = today.getFullYear();
  if (wsState.date === "Last 30 days") return `${f(new Date(y, today.getMonth(), today.getDate() - 30))} - ${f(today)}`;
  if (wsState.date === "Last quarter") {
    const q = Math.floor(today.getMonth() / 3);
    return `${f(new Date(y, (q - 1) * 3, 1))} - ${f(new Date(y, q * 3, 0))}`;
  }
  return `${f(new Date(y, today.getMonth(), 1))} - ${f(today)}`;
}

// ---------- Data ----------
function wsMakeAgent(p, [name, pass, fail, calls, bottom = ""]) {
  const [first, ...rest] = name.split(" ");
  return { name, slug: `${p.slug}-${slugify(name)}`, partner: p, email: `${first[0]}.${rest.join("")}@${p.domain}`.toLowerCase(), pass, fail, calls, bottom };
}

// Sheet data for a partner (see wholesale-data.js), or null while that file is empty.
const wsReal = (p) => (typeof WS_REAL === "undefined" ? null : WS_REAL[p.name] || null);

// Agents as listed in the partner's sheet: real emails, pass rates, call counts and bottom categories. `failCats` counts the failed
// categories of the agent's calls in the sheet; it drives their category rates so that they match the failures shown.
function wsRealRoster(p, real) {
  return real.agents.map(([email, pass, fail, calls, bottoms]) => {
    const local = email.split("@")[0];
    const name = local.split(/[._]/).filter(Boolean).map((s) => s[0].toUpperCase() + s.slice(1)).join(" ");
    const failed = real.calls.filter((c) => c[2] === email && c[7] === "Failed");
    const failCats = {};
    failed.forEach((c) => c[3].forEach((k) => (failCats[k] = (failCats[k] || 0) + 1)));
    const bottomsKnown = bottoms.filter((b) => WS_CAT[b]);
    return { name, slug: `${p.slug}-${slugify(local)}`.replace(/-$/, ""), partner: p, email, pass, fail, calls, bottom: bottomsKnown[0] || "", bottoms: bottomsKnown, failCats, failedCalls: failed.length, real: true };
  });
}

// Splits `total` calls across `n` agents; every agent gets at least one.
function wsSplit(rand, total, n) {
  const w = Array.from({ length: n }, () => 0.5 + rand());
  const sum = w.reduce((s, x) => s + x, 0);
  const out = w.map((x) => Math.max(1, Math.floor((total * x) / sum)));
  let diff = total - out.reduce((s, x) => s + x, 0);
  for (let i = 0; diff !== 0; i = (i + 1) % n) {
    if (diff > 0) {
      out[i] += 1;
      diff -= 1;
    } else if (out[i] > 1) {
      out[i] -= 1;
      diff += 1;
    }
  }
  return out;
}

// Each partner's agents share its call total, and their pass rates average out to the partner's pass rate.
function wsRoster(p) {
  if (p.agents) return p.agents;
  const rand = rng(hash(p.slug + "ws-roster"));
  const real = wsReal(p);
  if (real) p.agents = wsRealRoster(p, real);
  else if (p.name === "Symple") {
    p.agents = [
      ...WS_SYMPLE_AGENTS,
      ...WS_SYMPLE_EXTRA.map((n) => {
        const pass = Math.round(35 + rand() * 55);
        return [n, pass, 100 - pass, 2 + Math.floor(rand() * 4)];
      }),
    ].map((r) => wsMakeAgent(p, r));
  } else {
    const n = wsClamp(Math.round(p.total / 12), 3, 14);
    const names = WS_NAMES.map((x) => [rand(), x]).sort((a, b) => a[0] - b[0]).slice(0, n).map((x) => x[1]);
    const calls = wsSplit(rand, p.total, n);
    const raw = names.map(() => p.pass + (rand() - 0.5) * 50);
    const shift = p.pass - raw.reduce((s, v, i) => s + v * calls[i], 0) / p.total;
    p.agents = names.map((nm, i) => {
      const pass = wsClamp(Math.round(raw[i] + shift), 3, 100);
      return wsMakeAgent(p, [nm, pass, 100 - pass, calls[i]]);
    });
  }
  // Unless drawn, an agent's bottom category is the one they pass least often.
  p.agents.forEach((a) => {
    if (!a.bottom) a.bottom = wsAgentCats(a).reduce((m, c) => (c.pass < m.pass ? c : m)).name;
  });
  return p.agents;
}

// Category rows for a partner: pass rates from the sheet, top and bottom agent from the generated roster.
function wsPartnerCats(p) {
  if (p.cats) return p.cats;
  const roster = wsRoster(p);
  const real = wsReal(p);
  if (real) {
    // Top and bottom agents are the lists in the sheet (several agents can tie). If every agent ties there is no top or bottom.
    const byEmail = new Map(roster.map((a) => [a.email, a]));
    const pick = (emails) => emails.map((e) => byEmail.get(e)).filter(Boolean);
    p.cats = WS_CATS.map((c) => {
      const pass = p.catPass[c.name];
      const row = real.cats.find((r) => r[0] === c.name);
      let top = row ? pick(row[3]) : [];
      let bottom = row ? pick(row[4]) : [];
      if (top.length >= roster.length) top = bottom = [];
      return { name: c.name, pass, fail: Math.round((100 - pass) * 10) / 10, top, bottom };
    });
    return p.cats;
  }
  p.cats = WS_CATS.map((c, i) => {
    const pass = p.catPass[c.name];
    const fail = Math.round((100 - pass) * 10) / 10;
    if (p.name === "Symple") {
      const [top, bottom] = WS_SYMPLE_CATS[i];
      return { name: c.name, pass, fail, top: roster.find((a) => a.name === top), bottom: roster.find((a) => a.name === bottom) };
    }
    const ranked = roster.map((a) => ({ a, v: wsAgentCats(a).find((x) => x.name === c.name).pass })).sort((x, y) => y.v - x.v);
    return { name: c.name, pass, fail, top: ranked[0].a, bottom: ranked[ranked.length - 1].a };
  });
  return p.cats;
}

// An agent's category pass rates follow their partner's, moved up or down with the agent's own pass rate.
function wsAgentCats(a) {
  if (a.cats) return a.cats;
  if (a.real) {
    // An agent's failures are spread over the categories of their failed calls in the sheet; with none listed, over their bottom category.
    a.cats = WS_CATS.map((c) => {
      let fail = 0;
      if (a.fail > 0) {
        if (a.failedCalls) fail = a.failCats[c.name] ? Math.max(1, Math.round((a.fail * a.failCats[c.name]) / a.failedCalls)) : 0;
        else if (c.name === a.bottom) fail = a.fail;
      }
      return { name: c.name, pass: 100 - fail, fail };
    });
    return a.cats;
  }
  const rand = rng(hash(a.slug + "ws-cats"));
  const p = a.partner;
  a.cats = WS_CATS.map((c, i) => {
    if (wsIsHaley(a)) return { name: c.name, pass: WS_HALEY_CATS[i][0], fail: WS_HALEY_CATS[i][1] };
    // Symple's agents are drawn on their own rates, not on the partner's average.
    const pass =
      p.name === "Symple"
        ? wsClamp(Math.round(a.pass + (WS_BASE_CAT_PASS[c.name] - 55) / 3 + (rand() - 0.5) * 40), 5, 97)
        : wsClamp(Math.round(p.catPass[c.name] + (a.pass - p.pass) + (rand() - 0.5) * 20), 3, 100);
    return { name: c.name, pass, fail: 100 - pass };
  });
  return a.cats;
}

// KPI inputs: partner totals come from the sheet (Symple's are drawn); an agent's follow their share of it.
const wsPartnerBase = (p) => p.kpi || { calls: p.total, fails: p.failed, failPct: p.fail, pass: p.pass };
const wsAgentBase = (a) => (wsIsHaley(a) ? { calls: 344, fails: 154, failPct: 36, pass: 48.2 } : { calls: a.calls, fails: Math.round((a.calls * a.fail) / 100), failPct: a.fail, pass: a.pass });

function wsNewCall(p, agent, s) {
  let n = 100000 + (hash(`${p.slug}|${agent.slug}|${s.date}|${s.duration}|${WS_CALLS.size}`) % 899999);
  while (WS_CALLS.has(String(n))) n += 1;
  const call = { id: String(n), partner: p, agent, agentShort: wsShort(agent.name), catKey: s.cats.join(", "), scorecard: WS_SCORECARDS[hash(String(n) + "ws-card") % WS_SCORECARDS.length], ...s };
  WS_CALLS.set(call.id, call);
  return call;
}

// A passed call has no failed categories. `forceFail` makes the first call a failure so that every partner has one to review.
function wsGenCalls(rand, p, agents, n, startDay, passRate, forceFail = false) {
  return Array.from({ length: n }, (_, i) => {
    const agent = agents[Math.floor(rand() * agents.length)];
    const first = Math.floor(rand() * WS_CATS.length);
    const second = rand() < 0.3 ? WS_CATS[(first + 1 + Math.floor(rand() * 3)) % WS_CATS.length].name : null;
    const pass = !(forceFail && i === 0) && rand() < passRate / 100;
    const cats = pass ? [] : [WS_CATS[first].name, ...(second ? [second] : [])];
    const mm = String(6 + Math.floor(rand() * 12)).padStart(2, "0");
    const ss = String(Math.floor(rand() * 60)).padStart(2, "0");
    const said = pass ? [] : WS_SAID[cats[0]];
    return wsNewCall(p, agent, {
      pass,
      date: wsDate(startDay + i * 2 + Math.floor(rand() * 2)),
      duration: `00:${mm}:${ss}`,
      cats,
      reason: pass ? "" : said[Math.floor(rand() * said.length)],
      failPct: Math.round(30 + rand() * 65),
    });
  });
}

function wsPartnerCalls(p) {
  if (p.calls) return p.calls;
  const rand = rng(hash(p.slug + "ws-calls"));
  const roster = wsRoster(p);
  const real = wsReal(p);
  if (real) {
    const byEmail = new Map(roster.map((a) => [a.email, a]));
    p.calls = real.calls
      .filter((c) => byEmail.has(c[2]))
      .map(([date, duration, agent, cats, reason, failPct, uuid, status]) =>
        wsNewCall(p, byEmail.get(agent), { pass: status === "Passed", date: wsRealDate(date), duration: wsRealDur(duration), cats, reason, failPct, uuid })
      );
    return p.calls;
  }
  if (p.name === "Symple") {
    p.calls = WS_SYMPLE_CALLS.map(({ agent, back, ...s }) => wsNewCall(p, roster.find((a) => a.name === agent), { ...s, date: wsDate(back) }));
    p.calls.push(...wsGenCalls(rand, p, roster, 6, 26, 48));
  } else p.calls = wsGenCalls(rand, p, roster, 12 + Math.floor(rand() * 6), 0, p.pass, true);
  return p.calls;
}

function wsAgentCalls(a) {
  if (a.calls_) return a.calls_;
  const rand = rng(hash(a.slug + "ws-calls"));
  if (a.real) {
    // The sheet lists a partner's most recent calls only, so an agent with none there gets a few generated ones that match their pass rate.
    a.calls_ = wsPartnerCalls(a.partner).filter((c) => c.agent === a);
    if (!a.calls_.length) a.calls_ = wsGenCalls(rand, a.partner, [a], Math.min(a.calls, 4), 0, a.pass);
    return a.calls_;
  }
  if (wsIsHaley(a)) {
    a.calls_ = WS_HALEY_CALLS.map(({ back, ...s }) => wsNewCall(a.partner, a, { ...s, date: wsDate(back) }));
    a.calls_.push(...wsGenCalls(rand, a.partner, [a], 9, 8, a.pass));
  } else a.calls_ = wsGenCalls(rand, a.partner, [a], Math.min(a.calls, 6 + Math.floor(rand() * 9)), 0, a.pass);
  return a.calls_;
}

function wsInit() {
  if (wsReady) return;
  wsReady = true;
  WS_PARTNERS.forEach((p) => {
    wsRoster(p).forEach((a) => WS_AGENTS.set(a.slug, a));
    wsPartnerCalls(p);
  });
  WS_AGENTS.forEach((a) => wsAgentCalls(a));
}

// ---------- Table columns ----------
const wsRate = (key) => (r) => `<span class="tone-${wsTone(r.pass)}">${r[key]}%</span>`;
// Dashboard tables show one decimal, as in the QA Dashboard sheet.
const wsRate1 = (key) => (r) => `<span class="tone-${wsTone(r.pass)}">${r[key].toFixed(1)}%</span>`;
const wsCount = (key) => (r) => r[key].toLocaleString("en-US");

// Risk bands for the dashboard categories, by average fail rate. Above 15% is over the risk limit.
const WS_RISK_LIMIT = 15;
const WS_RISK_BANDS = [
  { min: 20, risk: "CRITICAL RISK", priority: "P1 - Immediate Remediation" },
  { min: 15, risk: "HIGH RISK", priority: "P2 - High Priority" },
  { min: 10, risk: "MODERATE", priority: "P3 - Monitor" },
  { min: 0, risk: "LOW RISK", priority: "P4 - Stable" },
];
const wsDashCatRow = (c) => {
  const fail = Math.round((100 - c.pass) * 10) / 10;
  const band = WS_RISK_BANDS.find((b) => fail >= b.min);
  return { name: c.name, pass: c.pass, fail, risk: band.risk, priority: band.priority, gap: fail > WS_RISK_LIMIT ? "Exceeds Risk Limit" : "Within Tolerance" };
};
const wsCatCell = (r) => `<span class="ws-cat" data-tip="${esc(WS_CAT[r.name].desc)}">${esc(r.name)}</span>`;
const wsChip = (n) => `<span class="chip chip-info" data-tip="${esc(WS_CAT[n].desc)}">${esc(n)}</span>`;
const wsAgentLink = (a, label) => (a ? `<a class="agent-link" href="#/wholesale/agent/${a.slug}">${esc(label || a.name)}</a>` : "–");
// One agent, or several that tie: the first is linked, the rest are named in a tooltip. Agents are identified by email, as in the sheets.
const wsAgentsCell = (v) => {
  const list = Array.isArray(v) ? v : v ? [v] : [];
  if (!list.length) return "–";
  const more = list.length > 1 ? `<span class="ws-more" data-tip="${esc(list.map((a) => a.email).join(", "))}">+${list.length - 1}</span>` : "";
  return wsAgentLink(list[0], list[0].email) + more;
};
// Bottom categories of an agent: up to two, none for a sheet agent without failures.
const wsBottomCell = (r) => (r.real && r.fail === 0 ? "–" : (r.bottoms || [r.bottom]).slice(0, 2).map(wsChip).join("") || "–");
const wsReason = (r) => (r.reason ? esc(r.reason) : "–") + (r.reason && r.cats.length > 1 ? `<a class="chip chip-info chip-view" href="#/wholesale/call/${r.id}">View</a>` : "");

const WS_COLS = {
  partners: [
    { key: "name", label: "Partner Name", w: 25, render: (r) => `<a class="agent-link" href="#/wholesale/partner/${r.slug}">${esc(r.name)}</a>` },
    { key: "total", label: "Total Calls", w: 15, num: true, render: wsCount("total") },
    { key: "passed", label: "Calls Passed", w: 15, num: true, render: wsCount("passed") },
    { key: "failed", label: "Calls Failed", w: 15, num: true, render: wsCount("failed") },
    { key: "pass", label: "Pass Rate", w: 15, num: true, render: wsRate1("pass") },
    { key: "fail", label: "Fail Rate", w: 15, num: true, render: wsRate1("fail") },
  ],
  dashCats: [
    { key: "name", label: "Compliance Category", w: 22, cls: "wrap", render: (r) => (r.sum ? esc(r.name) : wsCatCell(r)) },
    { key: "pass", label: "Avg. Pass Rate", w: 13, num: true, render: (r) => (r.sum ? `${r.pass.toFixed(1)}%` : wsRate1("pass")(r)) },
    { key: "fail", label: "Avg. Fail Rate", w: 13, num: true, render: (r) => (r.sum ? `${r.fail.toFixed(1)}%` : wsRate1("fail")(r)) },
    { key: "risk", label: "Risk Assessment", w: 16, render: (r) => esc(r.risk) },
    { key: "priority", label: "Priority", w: 21, cls: "wrap", render: (r) => esc(r.priority) },
    { key: "gap", label: "Benchmark Gap", w: 15, cls: "wrap", render: (r) => esc(r.gap) },
  ],
  top: [
    { key: "name", label: "Partner", w: 44, render: (r) => (r.sum ? esc(r.name) : wsPartnerLink(r)) },
    { key: "pass", label: "Pass Rate", w: 28, num: true, render: (r) => `<span class="tone-positive">${r.pass.toFixed(1)}%</span>` },
    { key: "total", label: "Calls", w: 28, num: true, render: wsCount("total") },
  ],
  bottom: [
    { key: "name", label: "Partner", w: 44, render: (r) => (r.sum ? esc(r.name) : wsPartnerLink(r)) },
    { key: "fail", label: "Fail Rate", w: 28, num: true, render: (r) => `<span class="tone-negative">${r.fail.toFixed(1)}%</span>` },
    { key: "total", label: "Calls", w: 28, num: true, render: wsCount("total") },
  ],
  agents: [
    { key: "name", label: "Agent", w: 26, render: (r) => wsAgentLink(r, r.email) },
    { key: "pass", label: "Avg. Pass Rate", w: 15, num: true, render: wsRate("pass") },
    { key: "fail", label: "Avg. Fail Rate", w: 15, num: true, render: wsRate("fail") },
    { key: "calls", label: "Total Calls", w: 10, num: true },
    { key: "bottom", label: "Bottom Categories", w: 34, cls: "wrap", render: wsBottomCell },
  ],
  partnerCats: [
    { key: "name", label: "Category", w: 24, render: wsCatCell },
    { key: "passed", label: "Calls Passed", w: 10, num: true, render: wsCount("passed") },
    { key: "failed", label: "Calls Failed", w: 10, num: true, render: wsCount("failed") },
    { key: "pass", label: "Avg. Pass Rate", w: 12, num: true, render: wsRate("pass") },
    { key: "fail", label: "Avg. Fail Rate", w: 12, num: true, render: wsRate("fail") },
    { key: "top", label: "Top Agent", w: 16, render: (r) => wsAgentsCell(r.top) },
    { key: "bottom", label: "Bottom Agent", w: 16, render: (r) => wsAgentsCell(r.bottom) },
  ],
  agentCats: [
    { key: "name", label: "Category", w: 34, sortable: true, render: wsCatCell },
    { key: "pass", label: "Avg. Pass Rate", w: 33, num: true, sortable: true, render: wsRate("pass") },
    { key: "fail", label: "Avg. Fail Rate", w: 33, num: true, sortable: true, render: wsRate("fail") },
  ],
};

const wsCallCols = (withAgent) => [
  {
    key: "pass",
    label: "Status",
    px: 64,
    render: (r) => `<span class="ws-status ${r.pass ? "pass" : "fail"}" data-tip="${r.pass ? "Passed" : "Failed"}" role="img" aria-label="${r.pass ? "Passed" : "Failed"}">${icon(r.pass ? "i-check-circle" : "i-x-circle", 20)}</span>`,
  },
  { key: "date", label: "Upload Date", px: 100 },
  { key: "duration", label: "Call Duration", px: 110 },
  ...(withAgent ? [{ key: "agentShort", label: "Agent", px: 200, sortable: true, render: (r) => wsAgentLink(r.agent, r.agent.email) }] : []),
  { key: "catKey", label: "Failed Categories", px: 290, sortable: true, cls: "wrap", render: (r) => r.cats.map(wsChip).join("") },
  { key: "reason", label: "Fail Reason", px: 330, cls: "wrap", render: wsReason },
  { key: "failPct", label: "Agent Fail %", px: 120, num: true, sortable: true, render: (r) => `<span class="tone-${wsTone(r.failPct)}">${r.failPct}%</span>` },
  { key: "details", label: "Call Details", px: 140, render: (r) => `<a class="text-btn" href="#/wholesale/call/${r.id}">View call details</a>` },
];

const wsRows = (cols, rows, attr = () => "") => rows.map((r) => `<tr${attr(r)}>${cols.map((c) => cellHtml(c, r)).join("")}</tr>`).join("");
const wsCallAttr = (r) => ` data-id="${r.id}"`;

// Slices `all` to the current page, paints the pager and returns the visible rows.
function wsPage(prefix, st, all) {
  const pages = Math.max(1, Math.ceil(all.length / st.size));
  st.page = Math.min(st.page, pages);
  const rows = all.slice((st.page - 1) * st.size, st.page * st.size);
  document.getElementById(prefix + "-text").textContent = `Showing ${rows.length} of ${all.length} Results`;
  document.getElementById(prefix + "-prev").disabled = st.page <= 1;
  document.getElementById(prefix + "-next").disabled = st.page >= pages;
  return rows;
}

// ---------- KPIs ----------
const wsKpiHtml = (list) =>
  list
    .map(
      (k) => `<article class="card">
      <div><div class="kpi-title">${esc(k.title)}</div></div>
      <div class="kpi-metric">${k.rows.map((r) => `<div>${r}</div>`).join("")}</div>
    </article>`
    )
    .join("");

const wsPassText = (pass) => (pass + WS_PASS_DELTA[wsState.date]).toFixed(1);

const WS_TOTAL = { calls: 2042, passed: 1424 };

// Dashboard KPIs: the QA Dashboard sheet's top metrics, in the standard cards.
function wsDashKpis() {
  const pass = (WS_TOTAL.passed / WS_TOTAL.calls) * 100 + WS_PASS_DELTA[wsState.date];
  const total = Math.round(WS_TOTAL.calls * WS_SCALE[wsState.date]);
  const passed = Math.round((total * pass) / 100);
  const fails = total - passed;
  const n = (v) => v.toLocaleString("en-US");
  return wsKpiHtml([
    { title: "Total Calls Reviewed", rows: [`<b>${n(total)}</b><span>${WS_SHEET_PARTNERS.length} Partners</span>`, `<span>from dates: ${wsRangeText()}</span>`] },
    { title: "Calls Passed", rows: [`<b class="tone-positive">${n(passed)}</b><span>Compliance Cleared</span>`] },
    { title: "Calls Failed", rows: [`<b class="tone-negative">${n(fails)}</b><span>Non-Compliant Identified</span>`] },
    { title: "Overall Pass Rate", rows: [`<b class="tone-${wsTone(pass)}">${pass.toFixed(1)}%</b><span>Target: ≥ 75.0%</span>`] },
    { title: "Overall Fail Rate", rows: [`<b class="tone-negative">${(100 - pass).toFixed(1)}%</b><span>Target: ≤ 25.0%</span>`] },
    wcDashKpi(),
  ]);
}

function wsEntityKpis(b) {
  const pass = wsPassText(b.pass);
  return wsKpiHtml([
    { title: "Total Calls", rows: [`<b>${wsN(b.calls)}</b>`, `<span>from dates: ${wsRangeText()}</span>`] },
    { title: "Calls Passed", rows: [`<b class="tone-positive">${wsN(b.calls - b.fails)}</b><span>Compliance Cleared</span>`] },
    { title: "Total Failures", rows: [`<b class="tone-negative">${wsN(b.fails)}</b><span>Non-Compliant Identified</span>`] },
    { title: "Avg. Pass Rate", rows: [`<b class="tone-${wsTone(+pass)}">${pass}%</b><span>Target: ≥ 75.0%</span>`] },
    { title: "Avg. Fail Rate", rows: [`<b class="tone-negative">${b.failPct}%</b><span>Target: ≤ 25.0%</span>`] },
  ]);
}

// ---------- Dashboard ----------
function renderWsDash() {
  const q = wsState.dash.query.toLowerCase();
  document.getElementById("wsd-kpis").innerHTML = wsDashKpis();
  const partners = WS_PARTNERS.filter((p) => !q || p.name.toLowerCase().includes(q));
  fillTable("wsd-partners", WS_COLS.partners, WS_NO_SORT(), wsRows(WS_COLS.partners, partners), "No partners match your search.");
  const cats = WS_CATS.map(wsDashCatRow).sort((a, b) => b.fail - a.fail);
  const avg = Math.round((cats.reduce((s, c) => s + c.pass, 0) / cats.length) * 10) / 10;
  const sum = { sum: true, name: "Category Average", pass: avg, fail: Math.round((100 - avg) * 10) / 10, risk: "BASELINE", priority: "Governance Standard", gap: `Threshold: ≤ ${WS_RISK_LIMIT.toFixed(1)}%` };
  fillTable("wsd-cats", WS_COLS.dashCats, WS_NO_SORT(), wsRows(WS_COLS.dashCats, [...cats, sum], (r) => (r.sum ? ' class="ws-sum"' : "")), "");
  const [a, b] = cats;
  document.getElementById("wsd-cats-note").innerHTML = `<b>KEY COMPLIANCE TAKEAWAY:</b> ${esc(a.name)} (${Math.round(a.fail)}% fail rate) and ${esc(b.name)} (${Math.round(b.fail)}% fail rate) are the highest compliance exposures across the partner network, requiring prioritized script re-training.`;
  renderWsDashExtras();
}

// ---------- Dashboard: cohorts, benchmark charts and category breakdown (QA Dashboard sheet partners) ----------
const wsPartnerLink = (p) => `<a class="agent-link" href="#/wholesale/partner/${p.slug}">${esc(p.name)}</a>`;
const wsCatShort = (n) => (n === "Downplaying Program Summary Recording" ? "Downplaying PSR" : n);
const wsMean = (list, key) => Math.round((list.reduce((s, p) => s + p[key], 0) / list.length) * 10) / 10;
const wsSumAttr = (r) => (r.sum ? ' class="ws-sum"' : "");

// Horizontal bars on a 0..max axis with a gridline every `step`.
function wsBarChart(rows, { max, step, bar, tone, label = 170 }) {
  const n = max / step;
  const ticks = Array.from({ length: n + 1 }, (_, i) => `<span>${(i * step).toFixed(step % 1 ? 1 : 0)}%</span>`).join("");
  const body = rows
    .map(
      (r) => `<div class="ws-bar-row">
      <span class="ws-bar-label" title="${esc(r.title || r.name)}">${esc(r.name)}</span>
      <div class="ws-bar-track"><i style="width:${Math.min(100, (r.value / max) * 100)}%;background:${bar}"></i></div>
      <b class="tone-${tone(r)}">${r.value.toFixed(1)}%</b>
    </div>`
    )
    .join("");
  return `<div class="ws-chart" style="--n:${n};--lab:${label}px">${body}<div class="ws-bar-row ws-axis"><span></span><div>${ticks}</div><span></span></div></div>`;
}

function renderWsDashExtras() {
  const ranked = [...WS_SHEET_PARTNERS].sort((a, b) => b.pass - a.pass);
  const top = ranked.slice(0, 5);
  const bottom = ranked.slice(-5).reverse();
  const cohort = (list, label, key) => [...list, { sum: true, name: label, [key]: wsMean(list, key), total: list.reduce((s, p) => s + p.total, 0) }];
  fillTable("wsd-top", WS_COLS.top, WS_NO_SORT(), wsRows(WS_COLS.top, cohort(top, "Top 5 Cohort Avg", "pass"), wsSumAttr), "");
  fillTable("wsd-bottom", WS_COLS.bottom, WS_NO_SORT(), wsRows(WS_COLS.bottom, cohort(bottom, "Bottom 5 Cohort Avg", "fail"), wsSumAttr), "");

  document.getElementById("wsd-chart-partners").innerHTML = wsBarChart(ranked.map((p) => ({ name: p.name, value: p.pass, pass: p.pass })), {
    max: 100,
    step: 25,
    bar: "var(--content-accent)",
    tone: (r) => wsTone(r.pass),
  });
  const cats = WS_CATS.map(wsDashCatRow).sort((a, b) => b.fail - a.fail);
  document.getElementById("wsd-chart-cats").innerHTML = wsBarChart(cats.map((c) => ({ name: wsCatShort(c.name), title: c.name, value: c.fail })), {
    max: 25,
    step: 5,
    bar: "var(--content-negative)",
    tone: () => "negative",
    label: 150,
  });

  // Breakdown by category: passed, failed and pass rate per category, with totals.
  const rate = (ok, bad) => (ok + bad ? wsPct(ok, ok + bad) : 0);
  const group = (c) => `<td class="num ws-gl">${c.passed.toLocaleString("en-US")}</td><td class="num">${c.failed.toLocaleString("en-US")}</td><td class="num"><span class="tone-${wsTone(rate(c.passed, c.failed))}">${rate(c.passed, c.failed).toFixed(1)}%</span></td>`;
  const totals = WS_FILE_CATS.map((_, i) => ({
    passed: WS_SHEET_PARTNERS.reduce((s, p) => s + p.catCounts[i].passed, 0),
    failed: WS_SHEET_PARTNERS.reduce((s, p) => s + p.catCounts[i].failed, 0),
  }));
  const colgroup = `<colgroup><col style="width:15%"><col style="width:7%">${WS_FILE_CATS.map(() => '<col style="width:6%"><col style="width:6%"><col style="width:6.5%">').join("")}</colgroup>`;
  const head = `<thead>
    <tr><th rowspan="2"><span class="th-plain">Partner</span></th><th rowspan="2"><span class="th-plain">Rel Mgr</span></th>${WS_FILE_CATS.map((c) => `<th class="ws-grp" colspan="3"><span class="th-plain" data-tip="${esc(WS_CAT[c].desc)}">${esc(wsCatShort(c))}</span></th>`).join("")}</tr>
    <tr>${WS_FILE_CATS.map(() => '<th class="num ws-gl"><span class="th-plain">Passed</span></th><th class="num"><span class="th-plain">Failed</span></th><th class="num"><span class="th-plain">Pass Rate</span></th>').join("")}</tr>
  </thead>`;
  const rows = WS_SHEET_PARTNERS.map((p) => `<tr><td>${wsPartnerLink(p)}</td><td>${esc(p.rm || "–")}</td>${p.catCounts.map(group).join("")}</tr>`).join("");
  const sum = `<tr class="ws-sum"><td>Total</td><td></td>${totals.map(group).join("")}</tr>`;
  document.getElementById("wsd-matrix").innerHTML = `${colgroup}${head}<tbody>${rows}${sum}</tbody>`;
}

// ---------- Partner overview ----------
function wsPartnerCallRows() {
  const st = wsState.partner;
  const q = st.query.toLowerCase();
  const all = wsPartnerCalls(st.p).filter((c) => (st.agent === "All agents" || c.agent.email === st.agent) && (!q || [c.agent.email, c.agent.name, c.catKey, c.reason].some((s) => s.toLowerCase().includes(q))));
  return sortRows(all, st.c.sort, (r, k) => r[k]);
}

function renderWsPartner() {
  const st = wsState.partner;
  const p = st.p;
  if (!p) return;
  const q = st.query.toLowerCase();
  document.getElementById("wp-kpis").innerHTML = wsEntityKpis(wsPartnerBase(p));

  const agents = wsRoster(p).filter((a) => (st.agent === "All agents" || a.email === st.agent) && (!q || a.email.toLowerCase().includes(q) || a.name.toLowerCase().includes(q) || a.bottom.toLowerCase().includes(q)));
  fillTable("wp-agents", WS_COLS.agents, WS_NO_SORT(), wsRows(WS_COLS.agents, wsPage("wp-a", st.a, agents)), "No agents match your filters.");

  // Calls passed and failed per category: the sheet's counts for its partners, otherwise worked out from the call total.
  const catRows = wsPartnerCats(p).map((r) => {
    const i = WS_FILE_CATS.indexOf(r.name);
    if (p.catCounts && i >= 0) return { ...r, ...p.catCounts[i] };
    const failed = Math.round((p.total * r.fail) / 100);
    return { ...r, passed: p.total - failed, failed };
  });
  fillTable("wp-cats", WS_COLS.partnerCats, WS_NO_SORT(), wsRows(WS_COLS.partnerCats, catRows), "");
  wcRenderPartner(p);

  const cols = wsCallCols(true);
  fillTable("wp-calls", cols, st.c.sort, wsRows(cols, wsPage("wp-c", st.c, wsPartnerCallRows()), wsCallAttr), "No calls match your filters.");
}

function wsOpenPartner(p) {
  const st = wsState.partner;
  if (st.p !== p) {
    Object.assign(st, { p, query: "", agent: "All agents", a: { page: 1, size: st.a.size }, c: { page: 1, size: st.c.size, sort: WS_NO_SORT() } });
    document.getElementById("wp-search").value = "";
    document.getElementById("wp-name").textContent = p.name;
    document.getElementById("wp-sub").textContent = `Detailed view for partner’s performance${p.rm ? ` • Relationship manager: ${p.rm}` : ""}`;
    dropdownPainters.forEach((f) => f());
  }
  document.title = `EvalAI - Wholesale - ${p.name}`;
  renderWsPartner();
}

// ---------- Agent overview ----------
function wsAgentCallRows() {
  const st = wsState.agent;
  const q = st.query.toLowerCase();
  const all = wsAgentCalls(st.a).filter((c) => !q || [c.catKey, c.reason].some((s) => s.toLowerCase().includes(q)));
  return sortRows(all, st.c.sort, (r, k) => r[k]);
}

function renderWsAgent() {
  const st = wsState.agent;
  const a = st.a;
  if (!a) return;
  document.getElementById("wa-kpis").innerHTML = wsEntityKpis(wsAgentBase(a));
  fillTable("wa-cats", WS_COLS.agentCats, st.cats, wsRows(WS_COLS.agentCats, sortRows(wsAgentCats(a), st.cats, (r, k) => r[k])), "");
  const cols = wsCallCols(false);
  fillTable("wa-calls", cols, st.c.sort, wsRows(cols, wsPage("wa-c", st.c, wsAgentCallRows()), wsCallAttr), "No calls match your search.");
}

function wsOpenAgent(a) {
  const st = wsState.agent;
  if (st.a !== a) {
    Object.assign(st, { a, query: "", cats: WS_NO_SORT(), c: { page: 1, size: st.c.size, sort: WS_NO_SORT() } });
    document.getElementById("wa-search").value = "";
    document.getElementById("wa-name").textContent = a.email;
    const partner = document.getElementById("wa-partner");
    partner.textContent = a.partner.name;
    partner.href = `#/wholesale/partner/${a.partner.slug}`;
    document.getElementById("wa-back").href = `#/wholesale/partner/${a.partner.slug}`;
    document.getElementById("wa-back-name").textContent = a.partner.name;
    dropdownPainters.forEach((f) => f());
  }
  document.title = `EvalAI - Wholesale - ${a.email}`;
  renderWsAgent();
}

// ---------- Call details ----------
const WS_SORTS = ["Score: Ascending", "Score: Descending", "Category: A-Z"];

const wsStages = (call) => WS_CATS.map((c) => ({ ...c, fail: call.cats.includes(c.name) }));

function wsSortedStages(call) {
  const list = wsStages(call);
  const s = wsState.call.sort;
  if (s === "Category: A-Z") return list.sort((a, b) => a.name.localeCompare(b.name));
  return list.sort((a, b) => (Number(a.fail) - Number(b.fail)) * (s === "Score: Ascending" ? -1 : 1));
}

function wsStagesHtml(call) {
  const st = wsState.call;
  return wsSortedStages(call)
    .map((s) => {
      const open = st.open.has(s.name);
      const id = "wc-" + slugify(s.name);
      const cites = s.fail
        ? s.cites
            .map(
              (ct) => `<div class="ws-cite">
          <div class="ws-quote">
            <span class="ws-time">${hms(TX_TIMES[ct.line])}</span>
            <div>
              <span class="ws-who">Agent:</span>
              <p>“${esc(ct.quote)}”</p>
              <button class="text-btn ws-jump" type="button" data-jump="${ct.line}">${icon("i-play", 16)}Jump to moment</button>
            </div>
          </div>
          <div class="reason ws-reason">${icon("i-sparkle")}<span>${esc(ct.reason)}</span></div>
        </div>`
            )
            .join("")
        : `<p class="ws-none">No violations found in this category.</p>`;
      return `<section class="stage ws-stage">
        <button class="stage-head" type="button" data-name="${esc(s.name)}" aria-expanded="${open}" aria-controls="${id}">
          <span class="stage-title">${esc(s.name)}</span><span class="chip chip-lg chip-${s.fail ? "Fail" : "Pass"}">${s.fail ? "Fail" : "Pass"}</span><span class="chev">${icon("i-chevron")}</span>
        </button>
        <div class="stage-body" id="${id}"${open ? "" : " hidden"}>
          <div class="ws-desc"><b>Description:</b><p>${esc(s.desc)}</p></div>
          <div class="ws-cites"><b>Citations:</b>${cites}</div>
        </div>
      </section>`;
    })
    .join("");
}

function wsTranscriptHtml(call) {
  const st = wsState.call;
  const q = st.query.toLowerCase();
  const flags = new Map();
  wsStages(call)
    .filter((s) => s.fail)
    .forEach((s) => s.cites.forEach((ct) => flags.set(ct.line, [...(flags.get(ct.line) || []), ...s.chips])));
  const items = TRANSCRIPT.map(([who, text], i) => ({ who, text, i, chips: flags.get(i) || [] }))
    .filter((r) => !q || r.text.toLowerCase().includes(q))
    .map(
      ({ who, text, i, chips }) => `<article class="tx tx-${who}${chips.length ? " tx-hl" : ""}${st.jump === i ? " tx-jump" : ""}" id="wtx-${i}" data-i="${i}">
        <div class="tx-top"><b><span class="ws-flag">${chips.length ? icon("i-flag", 18) : ""}</span>${who === "agent" ? "Agent:" : "Client:"}</b><span class="tx-time">${hms(TX_TIMES[i])}</span></div>
        ${chips.length ? `<div class="tx-tags">${chips.map((n) => `<span class="chip chip-Fail">${esc(n)}</span>`).join("")}</div>` : ""}
        <p>${esc(text)}</p>
      </article>`
    )
    .join("");
  return `<div class="tx-list">${items || `<p class="ov-empty">No transcript lines match your search.</p>`}</div>`;
}

function renderWsCall() {
  const st = wsState.call;
  const c = st.call;
  if (!c) return;
  document.getElementById("wc-meta").innerHTML = `<span><b>Agent:</b> ${esc(c.agent.email)}</span><span><b>Call Duration:</b> ${esc(c.duration)}</span><span><b>Upload Date:</b> ${esc(c.date)}</span><span><b>Scorecard:</b> ${esc(c.scorecard)}</span>`;
  document.querySelectorAll("#wc-tabs button").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.tab === st.tab)));
  const cats = document.getElementById("wc-cats");
  const tx = document.getElementById("wc-transcript");
  cats.hidden = st.tab !== "categories";
  tx.hidden = st.tab !== "transcript";
  document.getElementById("dd-wc-sort").hidden = st.tab !== "categories";
  document.getElementById("wc-search-field").hidden = st.tab !== "transcript";
  if (st.tab === "categories") cats.innerHTML = wsStagesHtml(c);
  else {
    tx.innerHTML = wsTranscriptHtml(c);
    wsMarkCurrent();
    if (st.jump !== null) {
      const el = document.getElementById("wtx-" + st.jump);
      if (el) el.scrollIntoView({ block: "center" });
    }
  }
  wsPaintPlayer();
}

// Label and link for the page the call was opened from (partner overview, agent overview or complaint).
function wsBack(c) {
  const from = wsState.call.from;
  const m = from && from.match(/^#\/wholesale\/(partner|agent|complaint)\/([a-z0-9-]+)$/);
  if (m && m[1] === "complaint") {
    const cm = WC_MAP.get(m[2]);
    if (cm) return [from, `Complaint ${cm.id}`];
  }
  if (m && m[1] === "partner") {
    const p = WS_PARTNERS.find((x) => x.slug === m[2]);
    if (p) return [from, p.name];
  }
  if (m && m[1] === "agent") {
    const a = WS_AGENTS.get(m[2]);
    if (a) return [from, a.email];
  }
  return [`#/wholesale/agent/${c.agent.slug}`, c.agent.email];
}

function wsOpenCall(c, cameFrom) {
  const st = wsState.call;
  if (/^#\/wholesale\/(partner|agent|complaint)\//.test(cameFrom)) st.from = cameFrom;
  else if (!/\/call\//.test(cameFrom)) st.from = null;
  if (st.call !== c) {
    wsStopCall();
    Object.assign(st, { call: c, tab: "categories", sort: WS_SORTS[0], query: "", open: new Set(c.cats), jump: null, pos: 0 });
    document.getElementById("wc-search").value = "";
    dropdownPainters.forEach((f) => f());
  }
  if (st.pendingJump != null) {
    st.tab = "transcript";
    st.jump = st.pendingJump;
    st.pos = TX_TIMES[st.jump];
    st.pendingJump = null;
  }
  const [href, label] = wsBack(c);
  document.getElementById("wc-back").href = href;
  document.getElementById("wc-back-name").textContent = label;
  document.title = `EvalAI - Wholesale - Call Details #${c.id}`;
  wcPaintCallBanner(c);
  renderWsCall();
}

// ---------- Player (same behavior as the retail call player) ----------
function wsPaintPlayer() {
  const st = wsState.call;
  if (!st.call) return;
  const total = secs(st.call.duration);
  document.getElementById("wc-fill").style.width = `${(st.pos / total) * 100}%`;
  document.getElementById("wc-time").textContent = `${clock(st.pos)} / ${clock(total)}`;
  const btn = document.getElementById("wc-play");
  btn.innerHTML = icon(st.playing ? "i-pause" : "i-play", 18);
  btn.setAttribute("aria-label", st.playing ? "Pause call" : "Play call");
}

function wsMarkCurrent() {
  const st = wsState.call;
  if (st.tab !== "transcript") return;
  let cur = -1;
  TX_TIMES.forEach((t, i) => {
    if (t <= st.pos && st.playing) cur = i;
  });
  document.querySelectorAll("#wc-transcript .tx").forEach((el) => el.classList.toggle("tx-cur", Number(el.dataset.i) === cur));
}

function wsStopCall() {
  const st = wsState.call;
  clearInterval(st.timer);
  st.playing = false;
  wsPaintPlayer();
}

function wsToggleCall() {
  const st = wsState.call;
  if (st.playing) return wsStopCall();
  const total = secs(st.call.duration);
  if (st.pos >= total) st.pos = 0;
  st.playing = true;
  wsPaintPlayer();
  st.timer = setInterval(() => {
    st.pos += 1;
    if (st.pos >= secs(st.call.duration)) wsStopCall();
    wsPaintPlayer();
    wsMarkCurrent();
  }, 1000);
}

// ---------- Routing hooks (called from route() in app.js) ----------
function wsShow(view) {
  ["dash", "partner", "agent", "call", "analysis", "complaints", "complaint"].forEach((v) => (document.getElementById("page-ws" + v).hidden = v !== view));
  if (view !== "call") wsStopCall();
}

function wsRoute(view, slug, cameFrom) {
  wsInit();
  if (view === "dash") {
    document.title = "EvalAI - Wholesale";
    return renderWsDash();
  }
  if (view === "analysis") return waRoute();
  if (view === "complaints" || view === "complaint") return wcRoute(view, slug, cameFrom);
  if (view === "partner") {
    const p = WS_PARTNERS.find((x) => x.slug === slug);
    return p ? wsOpenPartner(p) : (location.hash = "#/wholesale");
  }
  if (view === "agent") {
    const a = WS_AGENTS.get(slug);
    return a ? wsOpenAgent(a) : (location.hash = "#/wholesale");
  }
  const c = WS_CALLS.get(slug);
  return c ? wsOpenCall(c, cameFrom) : (location.hash = "#/wholesale");
}

// ---------- Downloads ----------
function wsCallsCsv(rows, filename) {
  saveCsv(
    [["Upload Date", "Call Duration", "Agent", "Scorecard", "Result", "Failed Categories", "Fail Reason", "Agent Fail %"], ...rows.map((r) => [r.date, r.duration, r.agent.email, r.scorecard, r.pass ? "Pass" : "Fail", r.cats.join("; "), r.reason, r.failPct + "%"])],
    filename
  );
  toast(`Exported ${rows.length} calls`);
}

// ---------- Init ----------
const wsDateChange = (v) => {
  wsState.date = v;
  if (!document.getElementById("page-wsdash").hidden) renderWsDash();
  else if (!document.getElementById("page-wspartner").hidden) renderWsPartner();
  else renderWsAgent();
};
["dd-wsd-date", "dd-wp-date", "dd-wa-date"].forEach((id) => setupDropdown(id, WS_DATES, () => wsState.date, wsDateChange, { lead: "i-calendar" }));

setupDropdown("dd-wp-agent", () => ["All agents", ...(wsState.partner.p ? wsRoster(wsState.partner.p).map((a) => a.email) : [])], () => wsState.partner.agent, (v) => {
  wsState.partner.agent = v;
  wsState.partner.a.page = 1;
  wsState.partner.c.page = 1;
  renderWsPartner();
}, { prefix: "Filter by agent - " });
setupDropdown("dd-wp-a-size", ["5", "10", "15"], () => String(wsState.partner.a.size), (v) => {
  wsState.partner.a.size = Number(v);
  wsState.partner.a.page = 1;
  renderWsPartner();
}, { prefix: "View " });
setupDropdown("dd-wp-c-size", ["5", "10", "15"], () => String(wsState.partner.c.size), (v) => {
  wsState.partner.c.size = Number(v);
  wsState.partner.c.page = 1;
  renderWsPartner();
}, { prefix: "View " });
setupDropdown("dd-wa-c-size", ["5", "10", "15"], () => String(wsState.agent.c.size), (v) => {
  wsState.agent.c.size = Number(v);
  wsState.agent.c.page = 1;
  renderWsAgent();
}, { prefix: "View " });
setupDropdown("dd-wc-sort", WS_SORTS, () => wsState.call.sort, (v) => {
  wsState.call.sort = v;
  renderWsCall();
}, { prefix: "Sort by - " });

bindSort("wp-calls", () => wsState.partner.c.sort, renderWsPartner);
bindSort("wa-cats", () => wsState.agent.cats, renderWsAgent);
bindSort("wa-calls", () => wsState.agent.c.sort, renderWsAgent);

[
  ["wp-a", () => wsState.partner.a, renderWsPartner],
  ["wp-c", () => wsState.partner.c, renderWsPartner],
  ["wa-c", () => wsState.agent.c, renderWsAgent],
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

document.getElementById("wsd-search").addEventListener("input", (e) => {
  wsState.dash.query = e.target.value.trim();
  renderWsDash();
});
document.getElementById("wp-search").addEventListener("input", (e) => {
  wsState.partner.query = e.target.value.trim();
  wsState.partner.a.page = 1;
  wsState.partner.c.page = 1;
  renderWsPartner();
});
document.getElementById("wa-search").addEventListener("input", (e) => {
  wsState.agent.query = e.target.value.trim();
  wsState.agent.c.page = 1;
  renderWsAgent();
});
document.getElementById("wc-search").addEventListener("input", (e) => {
  wsState.call.query = e.target.value.trim();
  renderWsCall();
});

document.getElementById("wsd-download").addEventListener("click", () => {
  const q = wsState.dash.query.toLowerCase();
  const rows = WS_PARTNERS.filter((p) => !q || p.name.toLowerCase().includes(q));
  saveCsv([["Partner Name", "Total Calls", "Calls Passed", "Calls Failed", "Pass Rate", "Fail Rate"], ...rows.map((p) => [p.name, p.total, p.passed, p.failed, p.pass.toFixed(1) + "%", p.fail.toFixed(1) + "%"])], "partner-performance.csv");
  toast(`Exported ${rows.length} partners`);
});
document.getElementById("wp-download").addEventListener("click", () => wsCallsCsv(wsPartnerCallRows(), `${wsState.partner.p.slug}-recent-calls.csv`));
document.getElementById("wa-download").addEventListener("click", () => wsCallsCsv(wsAgentCallRows(), `${wsState.agent.a.slug}-recent-calls.csv`));
document.getElementById("wc-download").addEventListener("click", () => {
  const st = wsState.call;
  const c = st.call;
  if (st.tab === "transcript") {
    const rows = TRANSCRIPT.map(([who, text], i) => [who === "agent" ? "Agent" : "Client", hms(TX_TIMES[i]), text]);
    saveCsv([["Speaker", "Time", "Text"], ...rows], `call-${c.id}-transcript.csv`);
    toast(`Exported ${rows.length} lines`);
    return;
  }
  const rows = wsStages(c).flatMap((s) => (s.fail ? s.cites.map((ct) => [s.name, "Fail", hms(TX_TIMES[ct.line]), ct.quote, ct.reason]) : [[s.name, "Pass", "", "", ""]]));
  saveCsv([["Category", "Result", "Time", "Citation", "Reason"], ...rows], `call-${c.id}-results.csv`);
  toast(`Exported ${rows.length} rows`);
});

// Recent Calls rows open the call; links, chips and sort buttons keep their own behavior.
["wp-calls", "wa-calls"].forEach((id) =>
  document.getElementById(id).addEventListener("click", (e) => {
    if (e.target.closest("a, button")) return;
    const row = e.target.closest("tbody tr[data-id]");
    if (row) location.hash = `#/wholesale/call/${row.dataset.id}`;
  })
);

document.getElementById("wc-tabs").addEventListener("click", (e) => {
  const b = e.target.closest("button[data-tab]");
  if (!b || b.dataset.tab === wsState.call.tab) return;
  wsState.call.tab = b.dataset.tab;
  wsState.call.jump = null;
  renderWsCall();
});
document.getElementById("wc-cats").addEventListener("click", (e) => {
  const st = wsState.call;
  const jump = e.target.closest("[data-jump]");
  if (jump) {
    st.tab = "transcript";
    st.jump = Number(jump.dataset.jump);
    st.pos = TX_TIMES[st.jump];
    renderWsCall();
    return;
  }
  const head = e.target.closest(".stage-head");
  if (!head) return;
  const open = !st.open.has(head.dataset.name);
  if (open) st.open.add(head.dataset.name);
  else st.open.delete(head.dataset.name);
  head.setAttribute("aria-expanded", String(open));
  document.getElementById(head.getAttribute("aria-controls")).hidden = !open;
});
document.getElementById("wc-play").addEventListener("click", wsToggleCall);
document.getElementById("wc-track").addEventListener("click", (e) => {
  const st = wsState.call;
  const r = e.currentTarget.getBoundingClientRect();
  st.pos = Math.round(((e.clientX - r.left) / r.width) * secs(st.call.duration));
  wsPaintPlayer();
  wsMarkCurrent();
});

// Hover tooltip for category names and chips (cells clip overflow, so it is positioned from the viewport).
const wsTip = document.getElementById("ws-tip");
document.addEventListener("mouseover", (e) => {
  const el = e.target.closest("[data-tip]");
  if (!el) return;
  wsTip.textContent = el.dataset.tip;
  wsTip.hidden = false;
  const r = el.getBoundingClientRect();
  const w = wsTip.offsetWidth;
  const h = wsTip.offsetHeight;
  wsTip.style.left = `${wsClamp(r.left + r.width / 2 - w / 2, 8, window.innerWidth - w - 8)}px`;
  wsTip.style.top = `${r.top - h - 8 < 8 ? r.bottom + 8 : r.top - h - 8}px`;
});
document.addEventListener("mouseout", (e) => {
  if (e.target.closest("[data-tip]")) wsTip.hidden = true;
});
