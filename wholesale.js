// ---------- Wholesale ----------
// Figma nodes: 4106:13345 (entry dashboard), 4106:14405 (partner overview), 4106:16429 (agent overview),
// 4106:20703 (call details), 4106:21230 (call details transcript). Loaded after app.js and reuses its helpers.
// Symple's agents and calls, and Haley James's calls, are drawn in the design; everything else is generated.

const WS_PARTNERS = [
  ["Iconic", 15, 85],
  ["Absolute Debt Relief", 31, 69],
  ["Liberty1 (Clear Vision)", 31, 69],
  ["EasyFi", 38, 47],
  ["Financial Catalyst", 43, 47],
  ["Advantage First", 45, 55],
  ["Complete Debt Relief", 48, 52],
  ["Done with Debt", 52, 48],
  ["Rescue 1 financial", 57, 43],
  ["Symple", 92, 8],
  ["United Financial Network", 88, 12],
  ["Debtmerica", 78, 22],
].map(([name, pass, fail]) => ({
  name,
  pass,
  fail,
  slug: slugify(name).replace(/-$/, ""),
  domain: name.toLowerCase().replace(/\(.*\)/, "").replace(/[^a-z0-9]/g, "") + ".com",
}));

// Compliance categories. `cites` are quotes from the transcript (`line` is the TRANSCRIPT index) with the AI reason;
// a failed category in a call shows these. Descriptions also feed the hover tooltips.
const WS_CATS = [
  {
    name: "Misrepresentation",
    chips: ["Misrepresentation"],
    pass: 31,
    desc: `Agent must not promise or guarantee specific outcomes, including but not limited to the percentage of debt reduction or the maximum time required to resolve debts. This prohibition also applies to potential actions by lenders (e.g., interest forbearance, legal action, referral to collection agencies). If there is evidence that the client believes they have received any assurances of specific outcomes, agent must act to clear up the misunderstanding. Note that agents are not prohibited from using words such as "guarantee". Instead, this prohibition applies to guarantees of specific outcomes or amounts. It should be interpreted in the context of regulations such as UDAAP. Statements such as, "We guarantee that we will reduce your debt" are acceptable because we can support them with solid evidence and they don't promise specific timelines or amounts.`,
    cites: [
      { line: 1, quote: "it'd be 584 a month for 53 months", reason: `The agent promises a specific outcome by stating a fixed program length of 53 months. This violates the prohibition on guaranteeing the maximum time required to resolve debts.` },
      { line: 5, quote: "every single account will be negotiated and new terms will be, everything will be reduced...within 3-6mo", reason: "The agent promises a specific outcome by stating that all accounts will be negotiated and reduced within a specific timeframe of three to six months." },
      { line: 12, quote: "I'm like 99% sure. This is getting approved.", reason: `The agent promises a specific outcome by stating he is "99% sure" the program will be approved, which sets a firm expectation of approval.` },
    ],
  },
  {
    name: "Credit Impact/Disclosure",
    chips: ["Credit impact", "Disclosure"],
    pass: 52,
    desc: "Agent must not mislead client into believing the company or program possesses an untrue external affiliation, accreditation, or special status (e.g., claiming government backing, unique creditor endorsement, or nonprofit status). Agent must act to clear up any misunderstandings expressed by client.",
    cites: [
      { line: 1, quote: "This is government regulated. So they put money aside for this already to help.", reason: `The agent misleads the client by claiming the program is "government regulated," which suggests an untrue external affiliation or special status.` },
      { line: 10, quote: "they put money aside for this and they participated in this tens of thousands of times with our team.", reason: `The agent implies a special status and creditor endorsement by claiming creditors "put money aside for this," which is a misleading claim.` },
    ],
  },
  {
    name: "Downplaying Program Summary Recording",
    chips: ["Downplaying"],
    pass: 88,
    desc: "Agents must present the Program Summary Call Recording as a critical step and clearly communicate its relevance. Instructing clients to disregard the recording, not pay attention, or suggest that any portion does not apply to them is strictly prohibited",
    cites: [
      { line: 6, quote: "You can skip through that recording, it's mostly just legal language.", reason: "The agent tells the client to skip through the Program Summary recording, which downplays its importance and is strictly prohibited." },
      { line: 8, quote: "Don't worry about that part of the recording, it doesn't really apply to you.", reason: "The agent suggests that part of the recording does not apply to the client, which is strictly prohibited." },
    ],
  },
  {
    name: "Legal Action",
    chips: ["Legal action"],
    pass: 76,
    desc: "Agent must not mislead client into believing that the debt resolution program shields them from creditor collection efforts. If there is evidence that the client believes otherwise, agent must act to clear up the misunderstanding.",
    cites: [
      { line: 3, quote: "Once you enroll, none of your creditors can take legal action against you.", reason: "The agent misleads the client into believing the program shields them from creditor collection efforts and legal action." },
      { line: 12, quote: "None of my clients have ever been sued by a creditor.", reason: "The agent implies the program prevents lawsuits, which misrepresents the program's protection from creditor collection efforts." },
    ],
  },
  {
    // Added from the Wholesale Complaint Process notes (Regulatory Review examples). Not in the original design.
    name: "Charge-Up/Loan Language",
    chips: ["Charge-up", "Loan language"],
    pass: 64,
    desc: `Agent must not tell or suggest that the client should run up credit cards, take on new charges or new debt, or "maximize the profit" before or during the program. Agent must not describe the debt resolution program as a loan, a consolidation loan or any other form of credit, or compare its payments to loan payments. If there is evidence that the client believes the program is a loan or that they may keep using their accounts, agent must act to clear up the misunderstanding.`,
    cites: [
      { line: 6, quote: "Go ahead and use your cards for whatever you need now, it won't matter once you're enrolled.", reason: "The agent encourages the client to keep charging their cards, which is prohibited because it increases the debt being enrolled." },
      { line: 10, quote: "Think of it like a loan where you make one payment and we take care of the rest.", reason: "The agent describes the program as a loan, which misstates what it is and is prohibited." },
    ],
  },
];
const WS_CAT = Object.fromEntries(WS_CATS.map((c) => [c.name, c]));

// "Agent said ..." reasons per category, used for generated calls.
const WS_SAID = {
  Misrepresentation: [
    'Agent said "We can settle your debt for 40 cents on the dollar"',
    'Agent said "Your credit score will recover within 12 months of enrollment"',
    `Agent said "This offer expires at the end of today's call"`,
    `Agent said "I'm 99% sure this is getting approved"`,
  ],
  "Credit Impact/Disclosure": [
    `Agent said "You'll see a real improvement in your credit within 6 months"`,
    'Agent said "We work directly with the credit bureaus on your behalf"',
    'Agent said "This is government regulated, so there is no downside"',
  ],
  "Downplaying Program Summary Recording": [
    `Agent said "You can skip through the recording, it's mostly legal language"`,
    `Agent said "Don't worry about that part of the recording"`,
  ],
  "Legal Action": [
    'Agent said "This is a much better option than filing for bankruptcy"',
    'Agent said "None of my clients have ever been sued by a creditor"',
    'Agent said "Once you enroll, creditors can no longer take legal action"',
  ],
  "Charge-Up/Loan Language": [
    'Agent said "Go ahead and keep using your cards, it won\'t matter once you enroll"',
    'Agent said "Think of it like a loan with one monthly payment"',
    'Agent said "Charge what you need now to maximize the profit for yourself"',
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
const WS_NAMES = [
  "Ryan Atwood", "Seth Cohen", "Marissa Cooper", "Summer Roberts", "Sandy Cohen", "Kirsten Cohen", "Julie Cooper", "Caleb Nichol",
  "Taylor Townsend", "Luke Ward", "Dawson Leery", "Joey Potter", "Pacey Witter", "Jen Lindley", "Andie McPhee", "Jack McPhee",
  "Lucas Scott", "Brooke Davis", "Peyton Sawyer", "Haley James", "Dan Scott", "Keith Scott", "Rachel Gatina", "Nathan Scott",
];
// Symple Category Performance as drawn: pass, fail, top agent, bottom agent.
const WS_SYMPLE_CATS = [
  [31, 69, "Peyton Sawyer", "Brooke Davis"],
  [52, 48, "Pacey Witter", "Haley James"],
  [88, 12, "Joey Potter", "Dawson Leery"],
  [76, 24, "Lucas Scott", "Nathan Scott"],
  [64, 36, "Jack McPhee", "Karen Roe"],
];
// Haley James's Performance by Category as drawn: pass, fail.
const WS_HALEY_CATS = [[31, 78], [43, 78], [88, 12], [86, 14], [72, 28]];

// Recent Calls rows as drawn.
const WS_SYMPLE_CALLS = [
  { pass: true, date: "07/15/26", duration: "00:08:42", agent: "Lucas Scott", cats: ["Misrepresentation", "Credit Impact/Disclosure"], reason: "", failPct: 54 },
  { pass: false, date: "07/10/26", duration: "00:06:55", agent: "Brooke Davis", cats: ["Legal Action"], reason: 'Agent said "This is a much better option than filing for bankruptcy"', failPct: 46 },
  { pass: false, date: "07/08/26", duration: "00:15:03", agent: "Peyton Sawyer", cats: ["Misrepresentation"], reason: 'Agent said "Your credit score will recover within 12 months of enrollment"', failPct: 83 },
  { pass: true, date: "07/05/26", duration: "00:09:28", agent: "Haley James", cats: ["Downplaying Program Summary Recording", "Credit Impact/Disclosure"], reason: "", failPct: 37 },
  { pass: false, date: "07/03/26", duration: "00:11:44", agent: "Dan Scott", cats: ["Legal Action"], reason: `Agent said "You'll see a real improvement in your credit within 6 months"`, failPct: 63 },
  { pass: false, date: "07/01/26", duration: "00:07:31", agent: "Keith Scott", cats: ["Misrepresentation"], reason: 'Agent said "We can settle your debt for 40 cents on the dollar"', failPct: 79 },
  { pass: false, date: "06/28/26", duration: "00:14:09", agent: "Karen Roe", cats: ["Legal Action"], reason: 'Agent said "We work directly with the credit bureaus on your behalf"', failPct: 68 },
  { pass: false, date: "06/25/26", duration: "00:10:22", agent: "Mouth McFadden", cats: ["Downplaying Program Summary Recording"], reason: "", failPct: 91 },
  { pass: false, date: "06/22/26", duration: "00:13:56", agent: "Rachel Gatina", cats: ["Misrepresentation", "Legal Action"], reason: `Agent said "This offer expires at the end of today's call"`, failPct: 76 },
];
const WS_HALEY_CALLS = [
  { pass: true, date: "07/15/26", duration: "00:08:42", cats: ["Misrepresentation", "Credit Impact/Disclosure"], reason: `Agent said "This offer expires at the end of today's call"`, failPct: 78 },
  { pass: false, date: "07/14/26", duration: "00:12:17", cats: ["Misrepresentation"], reason: 'Agent said "None of my clients have ever been sued by a creditor"', failPct: 66 },
  { pass: false, date: "07/13/26", duration: "00:06:55", cats: ["Misrepresentation"], reason: 'Agent said "This is a much better option than filing for bankruptcy"', failPct: 74 },
  { pass: false, date: "07/11/26", duration: "00:15:03", cats: ["Credit Impact/Disclosure", "Downplaying Program Summary Recording"], reason: `Agent said "You'll see a real improvement in your credit within 6 months"`, failPct: 82 },
  { pass: true, date: "07/10/26", duration: "00:09:28", cats: ["Misrepresentation"], reason: "", failPct: 88 },
  { pass: false, date: "07/08/26", duration: "00:07:38", cats: ["Misrepresentation"], reason: 'Agent said "We can settle your debt for 40 cents on the dollar"', failPct: 69 },
];

// ---------- State ----------
const WS_NO_SORT = () => ({ key: null, dir: "asc" });
const wsState = {
  date: "This week",
  dash: { query: "" },
  partner: { p: null, query: "", agent: "All agents", a: { page: 1, size: 10 }, c: { page: 1, size: 10, sort: WS_NO_SORT() } },
  agent: { a: null, query: "", cats: WS_NO_SORT(), c: { page: 1, size: 10, sort: WS_NO_SORT() } },
  call: { call: null, from: null, tab: "categories", sort: "Score: Ascending", query: "", open: null, jump: null, pos: 0, playing: false, timer: null },
};

// The date range only scales the KPI numbers and labels; the tables show the same sample calls for every range.
const WS_SCALE = { "This week": 1, "Last week": 0.93, "Last 30 days": 4.2, "This quarter": 12.4 };
const WS_PASS_DELTA = { "This week": 0, "Last week": -1.4, "Last 30 days": 0.8, "This quarter": -0.6 };

const WS_AGENTS = new Map();
const WS_CALLS = new Map();
let wsReady = false;

// ---------- Helpers ----------
const wsTone = (v) => (v >= 70 ? "positive" : v >= 50 ? "warning" : "negative");
const wsClamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
const wsShort = (name) => {
  const [first, ...rest] = name.split(" ");
  return `${first} ${rest.join(" ")[0]}.`;
};
const wsN = (n) => Math.round(n * WS_SCALE[wsState.date]).toLocaleString("en-US");
const wsDate = (daysBack) => {
  const d = new Date(2026, 6, 15 - daysBack);
  return `${String(d.getMonth() + 1).padStart(2, "0")}/${String(d.getDate()).padStart(2, "0")}/${String(d.getFullYear()).slice(2)}`;
};

function wsRangeText() {
  const t = new Date();
  const day = new Date(t.getFullYear(), t.getMonth(), t.getDate());
  const mon = new Date(day.getFullYear(), day.getMonth(), day.getDate() - ((day.getDay() + 6) % 7));
  let a = mon;
  let b = day;
  if (wsState.date === "Last week") {
    a = new Date(mon.getFullYear(), mon.getMonth(), mon.getDate() - 7);
    b = new Date(mon.getFullYear(), mon.getMonth(), mon.getDate() - 1);
  } else if (wsState.date === "Last 30 days") a = new Date(day.getFullYear(), day.getMonth(), day.getDate() - 30);
  else if (wsState.date === "This quarter") a = new Date(day.getFullYear(), Math.floor(day.getMonth() / 3) * 3, 1);
  const f = (d) => `${String(d.getMonth() + 1).padStart(2, "0")}/${String(d.getDate()).padStart(2, "0")}`;
  return `${f(a)} - ${f(b)}`;
}

// ---------- Data ----------
function wsMakeAgent(p, [name, pass, fail, calls, bottom]) {
  const [first, ...rest] = name.split(" ");
  return { name, slug: `${p.slug}-${slugify(name)}`, partner: p, email: `${first[0]}.${rest.join("")}@${p.domain}`.toLowerCase(), pass, fail, calls, bottom };
}

function wsRoster(p) {
  if (p.agents) return p.agents;
  const rand = rng(hash(p.slug + "ws-roster"));
  const bottom = () => WS_CATS[Math.floor(rand() * WS_CATS.length)].name;
  let rows;
  if (p.name === "Symple") {
    rows = [
      ...WS_SYMPLE_AGENTS,
      ...WS_SYMPLE_EXTRA.map((n) => {
        const pass = Math.round(35 + rand() * 55);
        return [n, pass, 100 - pass, 2 + Math.floor(rand() * 4), bottom()];
      }),
    ];
  } else {
    const n = 9 + Math.floor(rand() * 6);
    const names = WS_NAMES.map((x) => [rand(), x]).sort((a, b) => a[0] - b[0]).slice(0, n).map((x) => x[1]);
    rows = names.map((nm) => {
      const pass = wsClamp(Math.round(p.pass + (rand() - 0.5) * 50), 8, 95);
      return [nm, pass, 100 - pass, 2 + Math.floor(rand() * 5), bottom()];
    });
  }
  p.agents = rows.map((r) => wsMakeAgent(p, r));
  return p.agents;
}

function wsPartnerCats(p) {
  if (p.cats) return p.cats;
  const roster = wsRoster(p);
  const rand = rng(hash(p.slug + "ws-cats"));
  p.cats = WS_CATS.map((c, i) => {
    if (p.name === "Symple") {
      const [pass, fail, top, bottom] = WS_SYMPLE_CATS[i];
      return { name: c.name, pass, fail, top: roster.find((a) => a.name === top), bottom: roster.find((a) => a.name === bottom) };
    }
    const pass = wsClamp(Math.round(c.pass + (p.pass - 60) / 2 + (rand() - 0.5) * 24), 8, 96);
    const ti = Math.floor(rand() * roster.length);
    const bi = (ti + 1 + Math.floor(rand() * (roster.length - 1))) % roster.length;
    return { name: c.name, pass, fail: 100 - pass, top: roster[ti], bottom: roster[bi] };
  });
  return p.cats;
}

const wsIsHaley = (a) => a.slug === "symple-haley-james";

function wsAgentCats(a) {
  if (a.cats) return a.cats;
  const rand = rng(hash(a.slug + "ws-cats"));
  a.cats = WS_CATS.map((c, i) => {
    if (wsIsHaley(a)) return { name: c.name, pass: WS_HALEY_CATS[i][0], fail: WS_HALEY_CATS[i][1] };
    const pass = wsClamp(Math.round(a.pass + (c.pass - 55) / 3 + (rand() - 0.5) * 40), 5, 97);
    return { name: c.name, pass, fail: 100 - pass };
  });
  return a.cats;
}

// KPI inputs: Symple and Haley James are drawn; the rest follow their pass/fail rates.
function wsPartnerBase(p) {
  if (p.name === "Symple") return { calls: 344, fails: 154, failPct: 36, pass: 48.2 };
  const rand = rng(hash(p.slug + "ws-kpi"));
  const calls = 150 + Math.floor(rand() * 600);
  return { calls, fails: Math.round((calls * p.fail) / 100), failPct: p.fail, pass: Math.round((p.pass + rand() * 0.9) * 10) / 10 };
}
function wsAgentBase(a) {
  if (wsIsHaley(a)) return { calls: 344, fails: 154, failPct: 36, pass: 48.2 };
  const rand = rng(hash(a.slug + "ws-kpi"));
  const calls = 40 + Math.floor(rand() * 260);
  return { calls, fails: Math.round((calls * a.fail) / 100), failPct: a.fail, pass: Math.round((a.pass + rand() * 0.9) * 10) / 10 };
}

function wsNewCall(p, agent, s) {
  let n = 100000 + (hash(`${p.slug}|${agent.slug}|${s.date}|${s.duration}|${WS_CALLS.size}`) % 899999);
  while (WS_CALLS.has(String(n))) n += 1;
  const call = { id: String(n), partner: p, agent, agentShort: wsShort(agent.name), catKey: s.cats.join(", "), ...s };
  WS_CALLS.set(call.id, call);
  return call;
}

function wsGenCalls(rand, p, agents, n, startDay) {
  return Array.from({ length: n }, (_, i) => {
    const agent = agents[Math.floor(rand() * agents.length)];
    const first = Math.floor(rand() * WS_CATS.length);
    const cats = [WS_CATS[first].name];
    if (rand() < 0.3) cats.push(WS_CATS[(first + 1 + Math.floor(rand() * 3)) % WS_CATS.length].name);
    const pass = rand() < 0.3;
    const said = WS_SAID[cats[0]];
    const mm = String(6 + Math.floor(rand() * 12)).padStart(2, "0");
    const ss = String(Math.floor(rand() * 60)).padStart(2, "0");
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
  const roster = wsRoster(p);
  const rand = rng(hash(p.slug + "ws-calls"));
  p.calls = [];
  if (p.name === "Symple") {
    WS_SYMPLE_CALLS.forEach(({ agent, ...s }) => p.calls.push(wsNewCall(p, roster.find((a) => a.name === agent), s)));
    p.calls.push(...wsGenCalls(rand, p, roster, 6, 24));
  } else p.calls.push(...wsGenCalls(rand, p, roster, 12 + Math.floor(rand() * 6), 0));
  return p.calls;
}

function wsAgentCalls(a) {
  if (a.calls_) return a.calls_;
  const rand = rng(hash(a.slug + "ws-calls"));
  a.calls_ = [];
  if (wsIsHaley(a)) {
    WS_HALEY_CALLS.forEach((s) => a.calls_.push(wsNewCall(a.partner, a, s)));
    a.calls_.push(...wsGenCalls(rand, a.partner, [a], 9, 8));
  } else a.calls_.push(...wsGenCalls(rand, a.partner, [a], 6 + Math.floor(rand() * 9), 0));
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
const wsCatCell = (r) => `<span class="ws-cat" data-tip="${esc(WS_CAT[r.name].desc)}">${esc(r.name)}</span>`;
const wsChip = (n) => `<span class="chip chip-info" data-tip="${esc(WS_CAT[n].desc)}">${esc(n)}</span>`;
const wsAgentLink = (a, label) => (a ? `<a class="agent-link" href="#/wholesale/agent/${a.slug}">${esc(label || a.name)}</a>` : "–");
const wsReason = (r) => (r.reason ? esc(r.reason) : "–") + (r.reason && r.cats.length > 1 ? `<a class="chip chip-info chip-view" href="#/wholesale/call/${r.id}">View</a>` : "");

const WS_COLS = {
  partners: [
    { key: "name", label: "Partner", w: 34, render: (r) => `<a class="agent-link" href="#/wholesale/partner/${r.slug}">${esc(r.name)}</a>` },
    { key: "pass", label: "Avg. Pass Rate", w: 33, num: true, render: wsRate("pass") },
    { key: "fail", label: "Avg. Fail Rate", w: 33, num: true, render: wsRate("fail") },
  ],
  dashCats: [
    { key: "name", label: "Category", w: 42, render: wsCatCell },
    { key: "pass", label: "Avg. Pass Rate", w: 29, num: true, render: wsRate("pass") },
    { key: "fail", label: "Avg. Fail Rate", w: 29, num: true, render: wsRate("fail") },
  ],
  agents: [
    { key: "name", label: "Agent", w: 16, render: (r) => wsAgentLink(r) },
    { key: "pass", label: "Avg. Pass Rate", w: 22, num: true, render: wsRate("pass") },
    { key: "fail", label: "Avg. Fail Rate", w: 22, num: true, render: wsRate("fail") },
    { key: "calls", label: "Ttl. Calls", w: 9, num: true },
    { key: "bottom", label: "Bottom Categories", w: 31, cls: "wrap", render: (r) => wsChip(r.bottom) },
  ],
  partnerCats: [
    { key: "name", label: "Category", w: 32, render: wsCatCell },
    { key: "pass", label: "Avg. Pass Rate", w: 17, num: true, render: wsRate("pass") },
    { key: "fail", label: "Avg. Fail Rate", w: 17, num: true, render: wsRate("fail") },
    { key: "top", label: "Top Agent", w: 17, render: (r) => wsAgentLink(r.top) },
    { key: "bottom", label: "Bottom Agent", w: 17, render: (r) => wsAgentLink(r.bottom) },
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
    label: "",
    px: 40,
    render: (r) => `<span class="ws-status ${r.pass ? "pass" : "fail"}" role="img" aria-label="${r.pass ? "Passed" : "Failed"}">${icon(r.pass ? "i-check-circle" : "i-x-circle", 20)}</span>`,
  },
  { key: "date", label: "Upload Date", px: 100 },
  { key: "duration", label: "Call Duration", px: 110 },
  ...(withAgent ? [{ key: "agentShort", label: "Agent", px: 110, sortable: true, render: (r) => wsAgentLink(r.agent, r.agentShort) }] : []),
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

function wsDashKpis() {
  const pass = wsPassText(78.2);
  return wsKpiHtml([
    { title: "Total Calls", rows: [`<b>${wsN(2445)}</b>`, `<b class="tone-positive">${wsN(345)}</b><span>passed</span><span>from dates: ${wsRangeText()}</span>`] },
    { title: "Total Failures", rows: [`<b class="tone-negative">36%</b><span>failures</span>`, `<b>${wsN(144)}</b><span>count</span>`] },
    { title: "Avg. Pass Rate", rows: [`<b class="tone-${wsTone(+pass)}">${pass}%</b>`] },
    wcDashKpi(),
  ]);
}

function wsEntityKpis(b) {
  const pass = wsPassText(b.pass);
  return wsKpiHtml([
    { title: "Total Calls", rows: [`<b>${wsN(b.calls)}</b>`, `<span>from dates: ${wsRangeText()}</span>`] },
    { title: "Total Failures", rows: [`<b class="tone-negative">${wsN(b.fails)}</b><span>failures</span>`, `<b class="tone-negative">${b.failPct}%</b><span>avg.</span>`] },
    { title: "Avg. Pass Rate", rows: [`<b class="tone-${wsTone(+pass)}">${pass}%</b>`] },
  ]);
}

// ---------- Dashboard ----------
function renderWsDash() {
  const q = wsState.dash.query.toLowerCase();
  document.getElementById("wsd-kpis").innerHTML = wsDashKpis();
  const partners = WS_PARTNERS.filter((p) => !q || p.name.toLowerCase().includes(q));
  fillTable("wsd-partners", WS_COLS.partners, WS_NO_SORT(), wsRows(WS_COLS.partners, partners), "No partners match your search.");
  const cats = WS_CATS.map((c) => ({ name: c.name, pass: c.pass, fail: 100 - c.pass }));
  fillTable("wsd-cats", WS_COLS.dashCats, WS_NO_SORT(), wsRows(WS_COLS.dashCats, cats), "");
}

// ---------- Partner overview ----------
function wsPartnerCallRows() {
  const st = wsState.partner;
  const q = st.query.toLowerCase();
  const all = wsPartnerCalls(st.p).filter((c) => (st.agent === "All agents" || c.agent.name === st.agent) && (!q || [c.agent.name, c.catKey, c.reason].some((s) => s.toLowerCase().includes(q))));
  return sortRows(all, st.c.sort, (r, k) => r[k]);
}

function renderWsPartner() {
  const st = wsState.partner;
  const p = st.p;
  if (!p) return;
  const q = st.query.toLowerCase();
  document.getElementById("wp-kpis").innerHTML = wsEntityKpis(wsPartnerBase(p));

  const agents = wsRoster(p).filter((a) => (st.agent === "All agents" || a.name === st.agent) && (!q || a.name.toLowerCase().includes(q) || a.bottom.toLowerCase().includes(q)));
  fillTable("wp-agents", WS_COLS.agents, WS_NO_SORT(), wsRows(WS_COLS.agents, wsPage("wp-a", st.a, agents)), "No agents match your filters.");

  fillTable("wp-cats", WS_COLS.partnerCats, WS_NO_SORT(), wsRows(WS_COLS.partnerCats, wsPartnerCats(p)), "");
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
  document.getElementById("wc-meta").innerHTML = `<span><b>Agent:</b> ${esc(c.agent.email)}</span><span><b>Call Duration:</b> ${esc(c.duration)}</span><span><b>Upload Date:</b> ${esc(c.date)}</span>`;
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
  ["dash", "partner", "agent", "call", "complaints", "complaint"].forEach((v) => (document.getElementById("page-ws" + v).hidden = v !== view));
  if (view !== "call") wsStopCall();
}

function wsRoute(view, slug, cameFrom) {
  wsInit();
  if (view === "dash") {
    document.title = "EvalAI - Wholesale";
    return renderWsDash();
  }
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
    [["Upload Date", "Call Duration", "Agent", "Result", "Failed Categories", "Fail Reason", "Agent Fail %"], ...rows.map((r) => [r.date, r.duration, r.agent.email, r.pass ? "Pass" : "Fail", r.cats.join("; "), r.reason, r.failPct + "%"])],
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
["dd-wsd-date", "dd-wp-date", "dd-wa-date"].forEach((id) => setupDropdown(id, DATES, () => wsState.date, wsDateChange, { lead: "i-calendar" }));

setupDropdown("dd-wp-agent", () => ["All agents", ...(wsState.partner.p ? wsRoster(wsState.partner.p).map((a) => a.name) : [])], () => wsState.partner.agent, (v) => {
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
  saveCsv([["Partner", "Avg. Pass Rate", "Avg. Fail Rate"], ...rows.map((p) => [p.name, p.pass + "%", p.fail + "%"])], "partner-performance.csv");
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
