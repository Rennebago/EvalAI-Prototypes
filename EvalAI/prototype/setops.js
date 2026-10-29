// ---------- SetOps ----------
// Figma nodes: 3283:5658 (entry dashboard), 2470:25844 (agent view, outbound), 2470:26722 (agent view, inbound),
// 2893:8350 (call details, results) and 2885:7672 (call details, transcript). Loaded after app.js and wholesale.js
// and reuses their helpers. The seven agents in the dashboard table and Sara Chen's outbound calls are drawn in the
// design; everything else is generated.

// Rating scale from the SetOps rubric: Not required (-1), Incomplete (0), Poor (1), Fair (2), Good (3), Excellent (4).
const SO_LEVEL = { "Not required": -1, Incomplete: 0, Poor: 1, Fair: 2, Good: 3, Excellent: 4 };
const SO_NAMES = ["Incomplete", "Poor", "Fair", "Good", "Excellent"]; // indexed by level 0-4
const SO_CODE = { E: "Excellent", G: "Good", F: "Fair", P: "Poor", N: "Not required" };
const SO_COLOR = { "Not required": "#c0cbd8", Incomplete: "#5c708a", Poor: "#cf264e", Fair: "#e39b0d", Good: "#048155", Excellent: "#3300ff" };
const SO_GRADE_ORDER = ["Not required", "Incomplete", "Poor", "Fair", "Good", "Excellent"];

// Call stages (rubric: "SetOps Ground Truth for EvalAI"). `dash` is the label in the dashboard stage table, `col` the
// agent-table column, `page` the label on the agent view, `chip` the short name in call chips and `res` the heading in
// call results. `rub` is the rubric description for each rating (outbound); `rubIn` overrides it where the inbound rubric
// differs. `qg` and `qw` are the agent quote shown with a strong (Good or better) or weak rating.
const SO_STAGES = [
  {
    dash: "Opening & Disclosures",
    col: "Opening & Disclosures",
    page: "Opening & Disclosures",
    chip: "Opening & Disclosures",
    res: "Opening & Disclosures",
    rub: {
      "Not required": "The agent was never connected to a live representative, or this is not the first account on a multiple account call, so no opening or disclosure was required.",
      Incomplete: "The agent fails to introduce themselves or their company, and fails to provide the required call recording disclosure.",
      Poor: "The agent provides a partial introduction (e.g., name only) or gives the disclosure but fails to properly introduce themselves.",
      Fair: "The agent introduces themselves and their company, and provides the call recording disclosure, meeting the minimum requirements.",
      Good: "The agent provides a full introduction and disclosure in a professional and clear tone, and states the purpose of the call.",
      Excellent: "The agent completes all requirements of 'Good' and uses a warm and courteous greeting (e.g., \"Good morning\"), building rapport from the start of the call.",
    },
    rubIn: {
      "Not required": "This is not the first account on a multiple account call, so the opening and disclosure were already given.",
      Good: "The agent provides a full introduction and disclosure in a professional and clear tone, and asks for the purpose of the call.",
    },
    qg: "Good morning, Mrs. Burris. This is Shai Brown with Freedom Debt Relief. I am reaching out, attempting to settle an account. Are you available now?",
    qw: "Hi, this is Freedom Debt Relief, calling about an account.",

  },
  {
    dash: "Account Verification",
    col: "Account Verification",
    page: "Account Verification",
    chip: "Account Verification",
    res: "Account Verification",
    rub: {
      "Not required": "The agent was never connected to a live representative, so the account could not be verified.",
      Incomplete: "The agent fails to provide any of the necessary information to locate the client's account.",
      Poor: "The agent provides only one of the required verification points (name, account #, or SSN), causing delays.",
      Fair: "The agent provides some, but not all, of the required information, requiring the representative to prompt for the missing details.",
      Good: "The agent clearly and accurately provides all required information (client name, account number, last four of SSN), allowing the representative to locate the account efficiently.",
      Excellent: "The agent completes all requirements of 'Good' and proactively confirms the representative has located the correct account before proceeding, ensuring accuracy.",
    },
    rubIn: {
      "Not required": "The creditor called for a reason not related to a client, so account verification was not required.",
      Incomplete: "The agent fails to ask for any of the necessary information to locate the client's account, or provides the client's SSN.",
      Poor: "The agent asks for only one of the required verification points (name, account #, or SSN). The agent may provide the address and last 4 of the account first without issue.",
      Fair: "The agent asks for some, but not all, of the required verification points (name, account #, or SSN). The agent may provide the address and last 4 of the account first without issue.",
      Good: "The agent clearly and accurately asks for all required information (client name, account number, last four of SSN), allowing the account to be located accurately.",
      Excellent: "The agent completes all requirements of 'Good' and proactively confirms they have located the correct account before proceeding, ensuring accuracy.",
    },
    qg: "Can I get the client's name and the last four of their social?",
    qw: "Okay, I've got the account pulled up here.",
  },
  {
    dash: "ATC",
    col: "ATC",
    page: "Authorization to Communicate on File (ATC)",
    chip: "ATC",
    res: "ATC",
    rub: {
      "Not required": "The creditor did not ask for ATC/POA, or stated that authorization is already on file, so the agent did not need to resend it.",
      Incomplete: "The ATC was not on file, and the agent continued or ended the call without confirming the method or timeline for processing, a major compliance lapse.",
      Poor: "The ATC was not on file, and the agent confirmed only one of the required details (the method for sending it or the processing timeline). Next steps remain vague.",
      Fair: "The ATC was not on file, and the agent confirmed both the method for sending the document and the processing timeline. All compliance requirements were met.",
      Good: "The agent confirmed the method and timeline for the ATC, and also sought to get it processed during the call to expedite processing.",
      Excellent: "The agent completed everything required for 'Good' with exceptional clarity, and confirmed the next steps back to the creditor so there was no ambiguity about the path forward.",
    },
    qg: "So, I will fax the document immediately, and you confirm we should see processing complete within 24 hours?",
    qw: "The balance on that account is $9,412.",
  },
  {
    dash: "Account Information, Client Hardship",
    col: "Account Info & Client Hardship",
    page: "Account Information and Client Hardship",
    chip: "Account Info & Hardship",
    res: "Account Info & Client Hardship",
    rub: {
      "Not required": "The creditor could not locate the client or account, or the account was sent to another creditor, so the agent was unable to verify information.",
      Incomplete: "The agent fails to request account information, like the balance, and does not present the client's hardship when asked.",
      Poor: "The agent fails to either ask for account information, like the balance, or present the client's hardship when asked, but not both.",
      Fair: "The agent confirms the account information but is unprepared to provide a hardship reason when prompted, causing delays in the call.",
      Good: "The agent confirms the current account balance and provides the client's hardship reason if prompted.",
      Excellent: "The agent completes all requirements of 'Good' and presents the hardship in a way that is used as leverage in negotiations.",
    },
    qg: "Can you confirm the balance on that account for me?",
    qw: "Alright, let's move on to the next account.",
  },
  {
    dash: "Initial Offer & Negotiation",
    col: "Initial Offer & Negotiation",
    page: "Initial Offer and Negotiation",
    chip: "Initial Offer",
    res: "Initial Offer & Negotiation",
    rub: {
      "Not required": "The account or client could not be located, or the account is not yet eligible for settlement, so negotiations did not occur.",
      Incomplete: "The agent does not present a settlement offer when eligible, and does not attempt to hold firm or counter the creditor's initial offer.",
      Poor: "The agent makes an initial offer but does not negotiate when the creditor pushes back, or accepts the creditor's first offer without trying for better terms.",
      Fair: "The agent makes an initial offer but is not firm, or makes only a weak attempt to counter the creditor's initial offer.",
      Good: "The agent makes an initial offer and is firm if countered or, when the creditor makes the first offer, makes a decisive counter or negotiates to a better offer.",
      Excellent: "A definitive outcome is reached: the agent's initial offer is approved or, if challenged, the agent confidently holds firm to secure the best possible outcome for the client.",
    },
    qg: "Based on the balance, we are able to offer $4,200 to settle this account.",
    qw: "We can do $6,000, take it or leave it.",
  },
  {
    dash: "Counter Offer & Outcome",
    col: "Counter Offer and Outcome",
    page: "Counter Offer and Outcome",
    chip: "Counter Offer",
    res: "Counter Offer & Outcome",
    rub: {
      "Not required": "Negotiations did not occur (the account was not located or not eligible), so no counter offer was made and no settlement outcome was reached.",
      Incomplete: "No outcome is reached, and neither the agent nor the creditor makes a counter offer to the first presented offer.",
      Poor: "If countered, the agent fails to acknowledge or accurately record the terms, and either no outcome is reached or the agent accepts the counter offer without pushback.",
      Fair: "If countered, the agent acknowledges the counter offer but fails to confirm all specific details, and an outcome for the settlement is reached.",
      Good: "If countered, the agent clearly acknowledges the counter offer, repeats the specific terms back to ensure accuracy, and an outcome for the settlement is reached.",
      Excellent: "The agent completes all requirements of 'Good' and asks the representative for a clear timeframe for the SIF/offer letter to be sent or processed.",
    },
    rubIn: {
      Poor: "A counter offer is presented, but the agent fails to acknowledge or accurately record its terms, and either no outcome is reached or the agent accepts the counter offer without pushback.",
      Excellent: "The agent completes all requirements of 'Good' and manages expectations by giving the representative a clear timeframe for follow-up.",
    },
    qg: "I understand. Let me note your counter and see if we can meet in the middle.",
    qw: "Sure, that works for us.",
  },
  {
    dash: "Payment Arrangement",
    col: "Payment Arrangement",
    page: "Payment Arrangement",
    chip: "Payment Arrangement",
    res: "Payment Arrangement",
    rub: {
      "Not required": "No settlement discussion occurred, or the account could not reach agreed terms on the call, so no payment arrangement was required.",
      Incomplete: "An offer is approved, but no payment schedule details are discussed or confirmed.",
      Poor: "A payment arrangement is mentioned, but the agent fails to confirm the specific details like amounts, dates, or number of payments.",
      Fair: "The agent confirms most, but not all, of the required payment schedule details, leaving some ambiguity.",
      Good: "After an approved offer, the agent clearly outlines the number of payments, their specific amounts and the start date, and asks when the SIF/settlement/offer letter should be received.",
      Excellent: "The agent completes all requirements of 'Good' and confirms the payment method and frequency, ensuring perfect clarity for all parties.",
    },
    rubIn: {
      "Not required": "The creditor could not provide verification details so this step was not reached, or the account is not eligible to settle.",
    },
    qg: "So that is $1,200 on the 15th by ACH, and when should we expect the SIF letter?",
    qw: "We'll set that up and send you the details.",
  },
  {
    dash: "Closing",
    col: "Closing",
    page: "Closing",
    chip: "Closing",
    res: "Closing",
    rub: {
      "Not required": "The call disconnected before the agent could close, the call never connected to a live representative, or this is not the final account on a multiple account call.",
      Incomplete: "The agent ends the call abruptly with no closing statement.",
      Poor: "The agent ends the call without thanking the representative or confirming the call's business is concluded.",
      Fair: "The agent confirms the call's business is concluded or thanks the representative, but not both.",
      Good: "The agent confirms the call's business is concluded, thanks the representative for their time, and ends the call professionally.",
      Excellent: "The agent completes all requirements of 'Good' and adds a forward-looking or rapport-building statement (e.g., \"If I have more, I'll call back\").",
    },
    rubIn: {
      "Not required": "The call disconnected before this stage, or this is not the final account on a multiple account call.",
      Fair: "The agent confirms there are no more accounts to discuss but fails to thank the representative for their assistance.",
      Good: "The agent confirms there are no further accounts, offers a sincere thank you for the representative's time, and ends the call professionally.",
    },
    qg: "Is there anything else I can help you with today? Thank you, have a great day.",
    qw: "Alright, bye.",
  },
];
const SO_CHIPS = SO_STAGES.map((s) => s.chip);
// Stages that agent-level ratings can leave out (ATC and the negotiation steps).
const SO_CAN_SKIP = [2, 4, 5, 6];

const SO_WGS = [
  { name: "SetPrep", score: 82, calls: 124, top: ["Opening & Disclosures"], bottom: ["Account Info & Hardship"] },
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

// Creditors on the calls. Names come from the ground truth call sheets; "Unidentified" is what the sheets use when the
// creditor is not named on the call. Each call is assigned one creditor from its id (prototype data), see soCreditorOf.
const SO_CREDITORS = ["Bank of America", "BMO Bank", "Capital One", "Carson Smithfield", "Discover", "Green Sky", "Mariner Finance", "Navy Federal Credit Union", "Net Financial", "Opportune", "Regional Finance", "Unidentified"];
// Unidentified is listed three times so it shows up as often as it does in the sheets.
const SO_CRED_POOL = [...SO_CREDITORS, "Unidentified", "Unidentified"];
const soCreditorOf = (id) => SO_CRED_POOL[hash(id + "so-creditor") % SO_CRED_POOL.length];

// Call tags, as named in the ground truth sheets (Call Tag A-D).
const SO_TAGS = [
  "Follow up calls",
  "Settlement Approval",
  "Not Connected",
  "Inbound call Creditor callback",
  "Multiple Account call",
  "Settlement Offer SNIP",
  "Non-Settlement Call",
  "Authorization required call",
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
    const r = SO_STAGES.map((s, i) => (SO_CAN_SKIP.includes(i) && rand() < 0.15 ? "Not required" : genRating(rand, score)));
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
const SO_CRED_ALL = "Filter by Creditor";
const SO_STAGE_ALL = "Filter by Call Stage";
const SO_LEVEL_ALL = "Filter by Performance Level";
const SO_LEVEL_OPTS = ["Excellent", "Good", "Fair", "Poor", "Incomplete", "Not required"];
const SO_AGENT_ALL = "All agents";
const SO_DIR_BOTH = "All";
const SO_DIR_OPTS = Object.keys(SO_DIR_F);
const SO_DIR_PREFIX = { prefix: "Direction: " };

const SO_NO_SORT = () => ({ key: null, dir: "asc" });
const soState = {
  user: SO_USERS[0],
  dash: { date: "This month", wg: "All", creditor: SO_CRED_ALL, tag: SO_TAG_ALL, stage: SO_STAGE_ALL, level: SO_LEVEL_ALL, dir: SO_DIR_BOTH, query: "", wgSort: SO_NO_SORT(), stSort: SO_NO_SORT(), crSort: SO_NO_SORT(), a: { page: 1, size: 10, sort: SO_NO_SORT() } },
  // Matrix filters are multi-select: a list of chosen values, where an empty list means "all".
  matrix: { query: "", wg: [], sup: [], stage: [], level: [], dir: "Outbound", sort: SO_NO_SORT() },
  // Call Records list: every filter is also in the URL (see soCallsHash), so any slice can be deep-linked.
  calls: { agent: null, wg: "All", creditor: SO_CRED_ALL, stage: SO_STAGE_ALL, level: SO_LEVEL_ALL, tag: SO_TAG_ALL, dir: SO_DIR_BOTH, page: 1, size: 10, sort: SO_NO_SORT(), back: { href: "#/setops", label: "Dashboard" } },
  // Creditors overview: workgroup, call tag and direction narrow the calls; the date range only scales the numbers.
  cred: { date: "This month", wg: "All", tag: SO_TAG_ALL, dir: SO_DIR_BOTH, query: "", sort: SO_NO_SORT(), mSort: SO_NO_SORT() },
  agent: { a: null, dir: "Outbound", date: "This week", tag: SO_TAG_ALL, stage: SO_STAGE_ALL, hidden: new Set(), cr: SO_NO_SORT(), c: { page: 1, size: 10, sort: SO_NO_SORT() } },
  call: { call: null, tab: "results", open: null, acct: 0, pos: 0, playing: false, timer: null },
};

// ---------- Helpers ----------
const soLetter = (s) => (s >= 90 ? "A" : s >= 80 ? "B" : s >= 60 ? "C" : s >= 50 ? "D" : "F");
const SO_LETTER_CHIP = { A: "Excellent", B: "Good", C: "Fair", D: "Fair", F: "Poor" };
const soGrade = (s) => `<span class="chip chip-${SO_LETTER_CHIP[soLetter(s)]}">${soLetter(s)}</span>`;
const soScore = (s) => `<span class="so-score">${soGrade(s)}<span>${s}%</span></span>`;
const soChip = (g) => `<span class="chip chip-${g === "Not required" ? "NotRequired" : g}">${g}</span>`;
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
// Mean rating level of a stage across agents; null when no agent was rated (all "Not required"). Incomplete counts as 0.
function soStageMean(agents, i) {
  const lv = agents.map((a) => a.lv[i]).filter((l) => l >= 0);
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
    return [m === null ? "Not required" : SO_NAMES[soClamp(Math.round(m), 0, 4)], by.length ? by[0].w : "–", by.length ? by[by.length - 1].w : "–"];
  });
}

const soUserOf = (id) => SO_USERS.find((u) => u.id === id);

// ---------- Filters and drill-down ----------
// Does a rating list match the Call Stage and Performance Level filters? Level alone means "any stage at that level".
const soRatesMatch = (ratings, stage, level) =>
  (stage === SO_STAGE_ALL && level === SO_LEVEL_ALL) || SO_STAGES.some((s, i) => (stage === SO_STAGE_ALL || s.chip === stage) && (level === SO_LEVEL_ALL || ratings[i] === level));
const soLevelOf = (m) => (m === null ? "Not required" : SO_NAMES[soClamp(Math.round(m), 0, 4)]);

const SO_CALLS_DEFAULT = { agent: null, wg: "All", creditor: SO_CRED_ALL, stage: SO_STAGE_ALL, level: SO_LEVEL_ALL, tag: SO_TAG_ALL, dir: SO_DIR_BOTH };
function soCallsHash(f = soState.calls) {
  const p = new URLSearchParams();
  if (f.agent) p.set("agent", f.agent);
  if (f.wg !== "All") p.set("wg", f.wg);
  if (f.creditor !== SO_CRED_ALL) p.set("creditor", f.creditor);
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
    creditor: pick("creditor", (v) => SO_CREDITORS.includes(v), SO_CRED_ALL),
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
  return soDrillLink({ wg: d.wg, creditor: d.creditor, stage: d.stage, level: d.level, tag: d.tag, dir: d.dir, ...p }, html, title);
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

// Calls behind a set of dashboard agents for the dashboard's direction and call tag.
function soDashCalls(agents) {
  const d = soState.dash;
  const dirs = d.dir === SO_DIR_BOTH ? ["Outbound", "Inbound"] : [d.dir];
  return agents.flatMap((a) => dirs.flatMap((dir) => soCalls(SO_BY_SLUG.get(a.slug), dir))).filter((c) => d.tag === SO_TAG_ALL || c.tags.includes(d.tag));
}
// Share of `calls` that belong to the selected creditor (1 when no creditor is selected).
function soCredShare(calls) {
  const cr = soState.dash.creditor;
  if (cr === SO_CRED_ALL) return 1;
  return calls.length ? calls.filter((c) => c.creditor === cr).length / calls.length : 0;
}
// Scales the drawn totals to the date range, direction, call tag and the agents that match the filters.
const soDashScale = (pool) => soDashFactor() * (soSum(pool.map((a) => a.calls)) / soSum(SO_AGENTS.map((a) => a.calls)));

function soDashKpis() {
  const d = soState.dash;
  const r = SO_RANGES[d.date];
  const pool = soDashPool();
  const kpis = document.getElementById("sod-kpis");
  const calls = soDashCalls(pool);
  const byCreditor = d.creditor === SO_CRED_ALL ? calls : calls.filter((c) => c.creditor === d.creditor);
  if (!pool.length || !byCreditor.length) {
    kpis.innerHTML = soKpi("Calls Evaluated", ["<b>–</b>", "<b>–</b>"]) + soKpi("Avg. Scoring", ["<b>–</b>", "<b>–</b>"]);
    return;
  }
  // Totals and scores follow the filtered pool: the drawn numbers apply to the full, unfiltered roster.
  const f = soDashScale(pool) * soCredShare(calls);
  const drawn = d.creditor === SO_CRED_ALL && soIsFullScope() && pool.length === SO_AGENTS.length;
  const base = d.creditor === SO_CRED_ALL ? soAvg(pool.map((a) => a.score)) : soAvg(byCreditor.map((c) => c.score));
  const cur = soClamp((drawn ? 92 : Math.round(base)) + r.d, 0, 100);
  const prev = drawn ? 54 : soClamp(cur - 6 + (hash(soState.user.id + d.creditor + "so-prev") % 9), 0, 100);
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

const soCreditorChip = (cls, creditor) => (n) => soDashDrill({ creditor, stage: n }, `<span class="chip chip-${cls} chip-so-stage">${esc(n)}</span>`, `View ${creditor} calls for ${n}`);
const SO_CREDITOR_COLS = [
  { key: "name", label: "Creditor", w: 18, sortable: true, render: (r) => soDashDrill({ creditor: r.name }, esc(r.name), `View ${r.name} calls`) },
  { key: "score", label: "Avg. Scoring", w: 18, sortable: true, render: (r) => soScore(r.score) },
  { key: "calls", label: "Calls", w: 10, sortable: true, render: (r) => soDashDrill({ creditor: r.name }, soN(r.calls), `View ${r.name} calls`) },
  { key: "top", label: "Avg. Top Call Stage", w: 27, cls: "so-wrap", render: (r) => r.top.map(soCreditorChip("Good", r.name)).join("") },
  { key: "bottom", label: "Avg. Bottom Call Stage", w: 27, cls: "so-wrap", render: (r) => r.bottom.map(soCreditorChip("Poor", r.name)).join("") },
];

// The call stage that comes up most often in `list` (ties go to the earlier stage), skipping `skip`.
function soMostCommon(list, skip) {
  const top = SO_CHIPS.filter((c) => c !== skip).map((c) => [c, list.filter((x) => x === c).length]).filter(([, n]) => n > 0).sort((x, y) => y[1] - x[1])[0];
  return top ? top[0] : null;
}

// One row per creditor, built from the calls behind the dashboard. Call totals are scaled like the KPI card, so the rows add
// up to Calls Evaluated (the Workgroup filter narrows the rows, not the scale).
function soCreditorRows() {
  const d = soState.dash;
  const q = d.query.toLowerCase();
  const pool = soDashPool();
  const all = soDashCalls(pool);
  if (!all.length) return [];
  const scale = (8445 * soDashScale(pool)) / all.length;
  const inWg = d.wg === "All" ? all : soDashCalls(pool.filter((a) => a.wg === d.wg));
  return SO_CREDITORS.filter((n) => (d.creditor === SO_CRED_ALL || n === d.creditor) && (!q || n.toLowerCase().includes(q)))
    .map((name) => {
      const calls = inWg.filter((c) => c.creditor === name);
      const top = soMostCommon(calls.flatMap((c) => c.top));
      const bottom = soMostCommon(calls.flatMap((c) => c.bottom), top);
      return { name, n: calls.length, calls: Math.max(1, Math.round(calls.length * scale)), score: calls.length ? Math.round(soAvg(calls.map((c) => c.score))) : 0, top: top ? [top] : [], bottom: bottom ? [bottom] : [] };
    })
    .filter((r) => r.n > 0);
}
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
  const rows = soDashPool()
    .filter((a) => (d.wg === "All" || a.wg === d.wg) && (!q || a.name.toLowerCase().includes(q) || a.wg.toLowerCase().includes(q)))
    .map((a) => ({ ...a, share: soCredShare(soDashCalls([a])) }))
    .filter((a) => a.share > 0)
    .map((a) => ({ ...a, calls: Math.max(1, Math.round(a.calls * f * a.share)) }));
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
  const pool = soDashPool();
  const wgs = soScopeWgs()
    .filter((w) => (d.wg === "All" || w.name === d.wg) && (!q || w.name.toLowerCase().includes(q)))
    .map((w) => ({ ...w, share: soCredShare(soDashCalls(pool.filter((a) => a.wg === w.name))) }))
    .filter((w) => pool.some((a) => a.wg === w.name) && w.share > 0)
    .map((w) => ({ ...w, calls: Math.max(1, Math.round(w.calls * f * w.share)) }));
  fillTable("sod-wg", SO_WG_COLS, d.wgSort, wsRows(SO_WG_COLS, sortRows(wgs, d.wgSort, (r, k) => r[k])), empty ? noRoster : "No workgroups match your filters.");

  fillTable("sod-creditors", SO_CREDITOR_COLS, d.crSort, wsRows(SO_CREDITOR_COLS, sortRows(soCreditorRows(), d.crSort, (r, k) => r[k])), empty ? noRoster : "No creditors match your filters.");

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

// Call Stage Trends: rating level (0 Incomplete to 4 Excellent) per stage for each of the last weeks, ending on the agent's
// current rating. Stages the agent is not rated on ("Not required") have no trend line.
const SO_TREND_WEEKS = 6;
function soStageTrend(a, dir, n) {
  const rand = rng(hash(a.slug + dir + "so-trend"));
  return soAgentRatings(a, dir).map((g) => {
    if (g === "Not required") return null;
    const arr = new Array(n);
    arr[n - 1] = SO_LEVEL[g];
    for (let i = n - 2; i >= 0; i--) arr[i] = soClamp(arr[i + 1] + [-1, 0, 0, 1][Math.floor(rand() * 4)], 0, 4);
    return arr;
  });
}

function soAgentChart() {
  const st = soState.agent;
  const weeks = weekRanges(SO_TREND_WEEKS);
  const n = weeks.length;
  const levels = soStageTrend(st.a, st.dir, n);
  const shown = SO_STAGES.map((s, i) => i).filter((i) => levels[i] && (st.stage === SO_STAGE_ALL || SO_STAGES[i].chip === st.stage));
  document.getElementById("soa-legend").innerHTML = shown
    .map((i) => `<button class="legend-item" type="button" data-i="${i}" aria-pressed="${!st.hidden.has(i)}"><span class="dot" style="background:${catColor(i)}"></span>${esc(SO_STAGES[i].chip)}</button>`)
    .join("");
  // A tiny per-stage offset keeps identical lines from hiding each other.
  const series = shown
    .filter((i) => !st.hidden.has(i))
    .map((i) => ({ name: SO_STAGES[i].chip, color: catColor(i), vals: levels[i].map((v) => (v + (i - SO_STAGES.length / 2) * (0.2 / SO_STAGES.length)) / 4), tip: (w) => SO_NAMES[levels[i][w]] }));
  drawChart({
    plot: document.getElementById("soa-plot"),
    yAxis: document.getElementById("soa-y"),
    xAxis: document.getElementById("soa-x"),
    weeks,
    labels: ["Exc.", "Good", "Fair", "Poor", "Inc."],
    series,
    label: "Call stage trends",
    empty: "No stages selected",
  });
  const skipped = levels.filter((l) => !l).length;
  document.getElementById("soa-chart-note").textContent =
    `${st.dir === SO_DIR_BOTH ? st.dir : st.dir + " calls"} • Between ${fmtLong(weeks[0].start)} to ${fmtLong(weeks[n - 1].end)}` +
    (skipped ? ` • ${skipped} stage${skipped === 1 ? " is" : "s are"} not rated for this agent` : "");
}

// One row per creditor the agent spoke to, built from the agent's calls (the Call Tag and Call Stage filters apply, as in Recent
// Calls). Call totals are scaled to the date range like the KPI card, so unfiltered rows add up to the agent's total calls.
function soAgentCreditors() {
  const st = soState.agent;
  const all = soCalls(st.a, st.dir);
  const scale = (soAgentBase(st.a, st.dir).cur * (SO_RANGES[st.date].f / SO_RANGES["This week"].f)) / all.length;
  const calls = soAgentCalls();
  return SO_CREDITORS.map((name) => {
    const mine = calls.filter((c) => c.creditor === name);
    if (!mine.length) return null;
    const top = soMostCommon(mine.flatMap((c) => c.top));
    const bottom = soMostCommon(mine.flatMap((c) => c.bottom), top);
    return { name, calls: Math.max(1, Math.round(mine.length * scale)), score: Math.round(soAvg(mine.map((c) => c.score))), top: top ? [top] : [], bottom: bottom ? [bottom] : [] };
  })
    .filter(Boolean)
    .sort((x, y) => y.calls - x.calls);
}
const soAgentCredLink = (extra, html, title) => {
  const st = soState.agent;
  return soDrillLink({ agent: st.a.slug, dir: st.dir, tag: st.tag, ...extra }, html, title);
};
const soAgentCredChip = (cls, creditor) => (n) => soAgentCredLink({ creditor, stage: n }, `<span class="chip chip-${cls} chip-so-stage">${esc(n)}</span>`, `View ${creditor} calls for ${n}`);
const SO_AGENT_CRED_COLS = [
  { key: "name", label: "Creditor", w: 28, sortable: true, render: (r) => soAgentCredLink({ creditor: r.name }, esc(r.name), `View ${r.name} calls`) },
  { key: "calls", label: "Calls", w: 12, sortable: true, render: (r) => soAgentCredLink({ creditor: r.name }, soN(r.calls), `View ${r.name} calls`) },
  { key: "score", label: "Avg. Scoring", w: 18, sortable: true, render: (r) => soScore(r.score) },
  { key: "top", label: "Avg. Top Call Stage", w: 21, cls: "so-wrap", render: (r) => r.top.map(soAgentCredChip("Good", r.name)).join("") },
  { key: "bottom", label: "Avg. Bottom Call Stage", w: 21, cls: "so-wrap", render: (r) => r.bottom.map(soAgentCredChip("Poor", r.name)).join("") },
];

// Top and bottom stages are empty when every stage was not required (for example a call that never connected).
const soStageChips = (list) => (list.length ? list.map(soTagChip).join("") : '<span class="so-muted">–</span>');
// Call tags, plus a chip when two related calls were stitched into one scorecard.
const soCallTags = (r) => r.tags.map(soTagChip).join("") + (soStitch(r) ? soTagChip("Stitched call") : "");
const SO_CALL_COLS = [
  { key: "date", label: "Call Date", w: 9, sortable: true, render: (r) => fmtDate(r.date) },
  { key: "score", label: "Call Scoring", w: 19, sortable: true, render: (r) => soScore(r.score) },
  { key: "top", label: "Avg. Top Call Stage", w: 22, cls: "so-wrap", render: (r) => soStageChips(r.top) },
  { key: "bottom", label: "Avg. Bottom Call Stage", w: 22, cls: "so-wrap", render: (r) => soStageChips(r.bottom) },
  { key: "tags", label: "Call Tags", w: 18, cls: "so-wrap", render: soCallTags },
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

  soAgentChart();

  const crRows = soAgentCreditors();
  fillTable("soa-creditors", SO_AGENT_CRED_COLS, st.cr, wsRows(SO_AGENT_CRED_COLS, sortRows(crRows, st.cr, (r, k) => r[k])), "No creditors match your filters.");

  const callCols = soAgentCallCols();
  fillTable("soa-calls", callCols, st.c.sort, wsRows(callCols, soPager("soa-c", st.c, soAgentCalls()), (r) => ` data-id="${r.id}"`), "No calls match your filters.");
}

function soOpenAgent(a, cameFrom) {
  const st = soState.agent;
  if (st.a !== a) {
    // Opened from the dashboard: use the direction chosen there (both directions default to Outbound).
    const dir = soState.dash.dir;
    Object.assign(st, { a, dir: dir === "Inbound" ? "Inbound" : "Outbound", tag: SO_TAG_ALL, stage: SO_STAGE_ALL, hidden: new Set(), cr: SO_NO_SORT(), c: { page: 1, size: st.c.size, sort: SO_NO_SORT() } });
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
  [18, 82, ["Opening & Disclosures"], ["Account Info & Hardship"], ["Not Connected"]],
  [18, 93, ["Account Verification", "Payment Arrangement"], ["Counter Offer"], ["Inbound call Creditor callback", "Multiple Account call"], "Lucas Scott"],
  [17, 32, ["Initial Offer"], ["Payment Arrangement"], ["Settlement Offer SNIP", "Non-Settlement Call", "Authorization required call"]],
  [17, 62, ["Opening & Disclosures"], ["ATC", "Payment Arrangement"], ["Follow up calls"]],
  [17, 53, ["Counter Offer"], ["Initial Offer"], ["Settlement Pending Creditor Approval", "Not Connected"]],
];

// `design` marks the calls drawn in Figma: their top and bottom stages and tags are kept exactly as drawn, so the scenario
// rules below (which stages a call reaches) are not applied to them.
function soNewCall(a, dir, rand, [day, score, top, bottom, tags, client], design = false) {
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
    design,
    client: client || `${first} ${last}`,
    creditor: soCreditorOf(id),
    duration: `${String(mm).padStart(2, "0")}:${String(ss).padStart(2, "0")}`,
    start: 8 * 60 + Math.floor(rand() * 9 * 60),
    completion: 60 + Math.floor(rand() * 39),
  };
  SO_CALLS.set(id, call);
  return call;
}

// ---------- Call scenarios (SetOps rubric: branch moments and "Not required" cases) ----------
// What happened on the call decides which stages it reaches. Stage indexes follow SO_STAGES: 0 Opening, 1 Verification,
// 2 ATC, 3 Account Info, 4 Initial Offer, 5 Counter Offer, 6 Payment, 7 Closing. Stages a scenario skips are "Not required".
//  - notConn: no live representative was reached, so no stage is required.
//  - auth: ATC is not on file and cannot be processed on the call, so the call skips to Closing.
//  - nonSettle: the account is not eligible to settle (or it is a follow-up), so the call skips to Closing.
//  - pending: an offer is made but the creditor has not approved it, so Counter Offer and Payment are skipped.
//  - settle: every stage is reached. ATC is usually already on file, so it is not required.
const SO_SCEN_NR = { notConn: [0, 1, 2, 3, 4, 5, 6, 7], auth: [3, 4, 5, 6], nonSettle: [4, 5, 6], pending: [5, 6], settle: [] };
const SO_SCEN_TAGS = {
  settle: ["Settlement Approval"],
  nonSettle: ["Non-Settlement Call"],
  auth: ["Authorization required call", "Non-Settlement Call"],
  notConn: ["Not Connected"],
  pending: ["Settlement Pending Creditor Approval"],
};
// Share of calls per scenario, from the ground truth sheets. Most inbound calls are creditor callbacks that never reach a settlement.
const SO_SCEN_MIX = {
  Outbound: [["settle", 0.42], ["nonSettle", 0.33], ["auth", 0.1], ["notConn", 0.09], ["pending", 0.06]],
  Inbound: [["nonSettle", 0.65], ["settle", 0.2], ["pending", 0.08], ["auth", 0.07]],
};
const SO_SCEN_NOTE = {
  auth: "The creditor did not have authorization on file and it could not be processed on the call, so the account information and negotiation steps were skipped.",
  nonSettle: "The account was not eligible to settle on this call, so the negotiation steps were skipped.",
  pending: "An offer was presented but the creditor has not approved it yet, so there was no counter offer or payment arrangement.",
};

function soScenario(tags) {
  if (tags.includes("Not Connected")) return "notConn";
  if (tags.includes("Authorization required call")) return "auth";
  if (tags.includes("Settlement Approval")) return "settle";
  if (tags.includes("Settlement Pending Creditor Approval")) return "pending";
  return "nonSettle";
}

// Tags for a generated call: pick a scenario, then add the optional tags that can go with it. `j` is the call's position
// in its list; the first two calls are always settlements so that every stage has calls behind it.
function soPickTags(rand, dir, j) {
  const mix = SO_SCEN_MIX[dir];
  let r = rand();
  let scen = mix[mix.length - 1][0];
  for (const [name, p] of mix) {
    if (r < p) {
      scen = name;
      break;
    }
    r -= p;
  }
  if (j < 2) scen = "settle";
  const tags = [...SO_SCEN_TAGS[scen]];
  const extra = [rand(), rand(), rand(), rand(), rand()];
  if (scen === "settle" && extra[0] < 0.5) tags.push("Settlement Offer SNIP");
  if (scen === "notConn" && extra[1] < 0.4) tags.push("Non-Settlement Call");
  if (scen !== "notConn" && extra[2] < 0.3) tags.push("Follow up calls");
  if (scen !== "notConn" && j >= 2 && extra[3] < 0.25) tags.push("Multiple Account call");
  if (dir === "Inbound" && extra[4] < 0.9) tags.push("Inbound call Creditor callback");
  return SO_TAGS.filter((t) => tags.includes(t));
}

// A multiple account call covers 2-5 accounts. Opening and Closing are scored once (first and last account); every other
// stage is scored per account. The drawn call for Lucas Scott covers two accounts.
const soAccountCount = (call) => (call.client === "Lucas Scott" ? 2 : call.tags.includes("Multiple Account call") ? 2 + (hash(call.id + "so-accounts") % 4) : 1);

// Stages that are not required for one account of a call.
function soNrSet(call, k, n) {
  const nr = new Set();
  if (n > 1) {
    if (k > 0) nr.add(0);
    if (k < n - 1) nr.add(7);
  }
  if (call.design) return nr;
  const r = hash(`${call.id}|${k}|so-nr`);
  let scen = soScenario(call.tags);
  // On a multiple account call each account can go its own way: some settle and others do not.
  if (n > 1 && k > 0 && scen === "settle" && r % 100 < 45) scen = "nonSettle";
  SO_SCEN_NR[scen].forEach((i) => nr.add(i));
  if (scen !== "auth" && !(scen === "settle" && r % 10 === 0)) nr.add(2);
  if (scen === "nonSettle" && (r >>> 8) % 5 === 0) nr.add(3);
  return nr;
}

// The rubric text and agent quote for a rating. Inbound uses its own wording where the inbound rubric differs.
function soStageResult(s, g, dir) {
  const text = (dir === "Inbound" && s.rubIn && s.rubIn[g]) || s.rub[g];
  const quote = g === "Not required" ? "" : SO_LEVEL[g] >= 3 ? s.qg : s.qw;
  return { name: s.res, chip: s.chip, grade: g, text, quote };
}

// Results for one account. Drawn calls grade their top stages well and their bottom stages poorly; every other stage
// mostly follows the agent's rating for that stage, with some variation and the occasional Incomplete.
function soAccountStages(call, k, n) {
  const rand = rng(hash(`${call.id}|${k}|so-stages`));
  const base = soAgentRatings(call.agent, call.dir);
  const nr = soNrSet(call, k, n);
  return SO_STAGES.map((s, i) => {
    const forced = k === 0 && call.force ? call.force[i] : undefined;
    let g;
    if (forced) g = forced;
    else if (nr.has(i)) g = "Not required";
    else if (call.design && call.top.includes(s.chip)) g = rand() < 0.5 ? "Excellent" : "Good";
    else if (call.design && call.bottom.includes(s.chip)) g = rand() < 0.5 ? "Poor" : "Fair";
    else if (base[i] === "Not required") g = genRating(rand, call.score);
    else g = rand() < 0.7 ? base[i] : genRating(rand, call.score);
    if (!forced && g === "Poor" && rand() < 0.2) g = "Incomplete";
    return soStageResult(s, g, call.dir);
  });
}

const SO_ACCT_CACHE = new Map();
const SO_STAGE_CACHE = new Map();
const SO_STITCH_CACHE = new Map();
const soResetCall = (call) => {
  SO_ACCT_CACHE.delete(call.id);
  SO_STAGE_CACHE.delete(call.id);
  SO_STITCH_CACHE.delete(call.id);
};

// Dropped calls (rubric note on Opening & Disclosures): when a call drops and the agent calls back, the two related calls are
// stitched into one scorecard. The second call repeats the opening and some account verification, then picks up at the step
// where the first call dropped, and repeating steps is not scored down. About 1 in 8 single account calls that reached a live
// representative are stitched. Returns null for a call that was not stitched. Times are in seconds, `restart` in minutes of the day.
function soStitch(call) {
  if (SO_STITCH_CACHE.has(call.id)) return SO_STITCH_CACHE.get(call.id);
  let out = null;
  if (!call.design && soAccountCount(call) === 1 && soScenario(call.tags) !== "notConn" && hash(call.id + "so-stitch") % 100 < 12) {
    const stages = soCallStages(call);
    const reached = SO_STAGES.map((s, i) => i).filter((i) => i >= 1 && i <= 6 && stages[i].grade !== "Not required");
    if (reached.length) {
      const total = secs(call.duration);
      const first = Math.round(total * (0.35 + (hash(call.id + "so-split") % 25) / 100));
      const gap = 60 + (hash(call.id + "so-gap") % 300);
      out = {
        dropped: SO_STAGES[reached[hash(call.id + "so-drop") % reached.length]].chip,
        first,
        second: total - first,
        gap,
        at: first / total,
        restart: call.start + Math.round((first + gap) / 60),
      };
    }
  }
  SO_STITCH_CACHE.set(call.id, out);
  return out;
}

// The accounts on a call, each with its own stage results.
function soCallAccounts(call) {
  if (SO_ACCT_CACHE.has(call.id)) return SO_ACCT_CACHE.get(call.id);
  const n = soAccountCount(call);
  const accounts = Array.from({ length: n }, (_, k) => ({
    label: n > 1 ? `Last 4 SSN ${String(hash(`${call.id}|${k}|so-ssn`) % 10000).padStart(4, "0")}` : "",
    stages: soAccountStages(call, k, n),
  }));
  SO_ACCT_CACHE.set(call.id, accounts);
  return accounts;
}

// Call-level result per stage. With several accounts it is the mean of the accounts that were rated.
function soCallStages(call) {
  if (SO_STAGE_CACHE.has(call.id)) return SO_STAGE_CACHE.get(call.id);
  const accounts = soCallAccounts(call);
  const stages =
    accounts.length === 1
      ? accounts[0].stages
      : SO_STAGES.map((s, i) => {
          const lv = accounts.map((a) => SO_LEVEL[a.stages[i].grade]).filter((l) => l >= 0);
          return soStageResult(s, lv.length ? SO_NAMES[soClamp(Math.round(soAvg(lv)), 0, 4)] : "Not required", call.dir);
        });
  SO_STAGE_CACHE.set(call.id, stages);
  return stages;
}

// Top and bottom stage of a generated call: its best and worst rated stages (stages that were not required are left out).
function soTopBottom(stages) {
  const rated = stages.filter((s) => s.grade !== "Not required");
  if (!rated.length) return [[], []];
  const lv = rated.map((s) => SO_LEVEL[s.grade]);
  const max = Math.max(...lv);
  const min = Math.min(...lv);
  const top = rated.filter((s) => SO_LEVEL[s.grade] === max).slice(0, 2).map((s) => s.chip);
  const bottom = max === min ? [] : rated.filter((s) => SO_LEVEL[s.grade] === min).slice(0, 2).map((s) => s.chip);
  return [top, bottom];
}

// Makes sure every rating an agent has in a stage is backed by at least one call, so a matrix cell, agent view row or
// dashboard slice never links to an empty list. A call that fits the stage takes the missing rating.
function soEnsureRatings(a, dir, list) {
  const base = soAgentRatings(a, dir);
  const fits = (i, c) => {
    if (c.design || soAccountCount(c) > 1) return false;
    const scen = soScenario(c.tags);
    if (i === 0 || i === 1 || i === 7) return scen !== "notConn";
    if (i === 2) return scen === "settle" || scen === "auth";
    if (i === 3 || i === 4) return scen === "settle" || scen === "pending";
    return scen === "settle";
  };
  SO_STAGES.forEach((s, i) => {
    const want = base[i];
    if (want === "Not required" || list.some((c) => soCallStages(c)[i].grade === want)) return;
    const c = list.find((x) => fits(i, x));
    if (!c) return;
    c.force = { ...c.force, [i]: want };
    soResetCall(c);
  });
}

function soCalls(a, dir) {
  if (dir === SO_DIR_BOTH) return [...soCalls(a, "Outbound"), ...soCalls(a, "Inbound")].sort((x, y) => y.date - x.date);
  const key = a.slug + "|" + dir;
  if (SO_CALL_LISTS.has(key)) return SO_CALL_LISTS.get(key);
  const rand = rng(hash(key + "so-calls"));
  const list = [];
  let day = 18;
  if (a.name === "Sara Chen" && dir === "Outbound") {
    SO_SARA_CALLS.forEach((s) => list.push(soNewCall(a, dir, rand, s, true)));
    day = 16;
  }
  const generated = [];
  while (list.length < 15) {
    const score = Math.round(soClamp(a.score + (rand() - 0.5) * 50, 20, 98));
    const call = soNewCall(a, dir, rand, [day, score, [], [], soPickTags(rand, dir, generated.length)]);
    generated.push(call);
    list.push(call);
    if (rand() < 0.65) day = Math.max(1, day - 1);
  }
  soEnsureRatings(a, dir, list);
  generated.forEach((c) => {
    [c.top, c.bottom] = soTopBottom(soCallStages(c));
  });
  SO_CALL_LISTS.set(key, list);
  return list;
}

let soReady = false;
function soInit() {
  if (soReady) return;
  soReady = true;
  SO_AGENTS.forEach((a) => ["Outbound", "Inbound"].forEach((d) => soCalls(a, d)));
}

const SO_DESIGN_SUMMARY =
  "The agent performed well in the initial stages of the call, providing a clear introduction and disclosure, and effectively verifying the account information. For the first account, the agent correctly identified that it was not ready for settlement, which appropriately led to 'Not Required' grades for subsequent negotiation steps. For the second account, the creditor stated it had already been taken care of, again leading to 'Not Required' for negotiation-related steps. The closing was professional. The agent handled the call efficiently and followed proper procedures for accounts not yet eligible for settlement.";

// `stages` are the results being shown: one account's results on a multiple account call (account `k` of `n`).
function soSummary(call, stages, n = 1, k = 0) {
  if (call.client === "Lucas Scott") return SO_DESIGN_SUMMARY;
  const scen = call.design ? "" : soScenario(call.tags);
  if (scen === "notConn") return "The agent did not connect to a live representative, so every step is marked 'Not Required'.";
  const list = (g) => stages.filter(g).map((s) => s.chip);
  const good = list((s) => SO_LEVEL[s.grade] >= 3);
  const weak = list((s) => SO_LEVEL[s.grade] >= 0 && SO_LEVEL[s.grade] <= 2);
  const nr = list((s) => s.grade === "Not required");
  const join = (a) => a.slice(0, 3).join(", ");
  const tone = call.score >= 80 ? "well" : call.score >= 60 ? "adequately" : "poorly";
  const note = SO_SCEN_NOTE[scen];
  return [
    n > 1 ? `This multiple account call covered ${n} accounts; the opening and closing are scored once, on the first and last account, and the other steps per account. The agent handled account ${k + 1} ${tone}.` : `The agent handled this ${call.dir.toLowerCase()} call ${tone} overall.`,
    good.length ? `The strongest steps were ${join(good)}.` : "",
    weak.length ? `The agent fell short on ${join(weak)}, where required steps were missed or incomplete.` : "All required steps were completed.",
    note || (nr.length ? `${nr.length} step${nr.length === 1 ? " was" : "s were"} marked 'Not Required' per the rubric.` : ""),
    soStitch(call) ? `The call dropped during ${soStitch(call).dropped}, and the agent called back and picked up where it left off. The two calls were stitched into one scorecard, and the repeated opening and account verification were not scored down.` : "",
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
  const stitch = soStitch(call);
  // A stitched call shows where the first call dropped and the agent called back.
  const cut = stitch ? soClamp(Math.round(SO_TX.length * stitch.at), 1, SO_TX.length - 1) : -1;
  return `<div class="tx-list">${SO_TX.map(
    ([who, t, text], i) => `${i === cut ? `<div class="so-stitch-div" role="separator">Call dropped during ${esc(stitch.dropped)}. The agent called back at ${soTime(stitch.restart)}, ${clock(stitch.gap)} later.</div>` : ""}<article class="tx tx-${who === "a" ? "agent" : "client"}" id="sotx-${i}" data-i="${i}" data-t="${secs(t)}">
      <div class="tx-top"><b>${who === "a" ? `Agent ${esc(call.agent.name)}` : `Client ${phone}`}</b><span class="tx-time">${t}</span></div>
      <p>${esc(text)}</p>
    </article>`
  ).join("")}</div>`;
}

function renderSoCall() {
  const st = soState.call;
  const c = st.call;
  if (!c) return;
  const accounts = soCallAccounts(c);
  if (st.acct >= accounts.length) st.acct = 0;
  const stages = accounts[st.acct].stages;
  if (!st.open) st.open = new Set(stages.map((s) => s.name));
  document.getElementById("soc-title").textContent = `${c.client} • Call Details`;

  const stitch = soStitch(c);
  const [dm, ds] = c.duration.split(":").map(Number);
  const end = stitch ? stitch.restart + Math.round(stitch.second / 60) : c.start + dm + Math.round(ds / 60);
  document.getElementById("soc-overview").innerHTML = `<h2>Call Overview</h2>
    <div class="so-kv"><span class="k">Overall Grade</span>${soGrade(c.score)}<b>${c.score}%</b></div>
    <div class="so-kv"><span class="k">Completion Rate:</span><b>${c.completion}%</b></div>
    <div class="so-kv"><span class="k">Creditor:</span><b>${esc(c.creditor)}</b></div>
    ${accounts.length > 1 ? `<div class="so-kv"><span class="k">Accounts Discussed:</span><b>${accounts.length}</b></div>` : ""}
    <div class="so-kv"><span class="k">Call Start Time:</span><b>${soTime(c.start)}</b></div>
    <div class="so-kv"><span class="k">Call End Time:</span><b>${soTime(end)}</b></div>
    ${stitch ? `<div class="so-kv"><span class="k">Stitched Calls:</span><b>2 calls, dropped during ${esc(stitch.dropped)}</b></div>` : ""}`;

  const counts = SO_GRADE_ORDER.map((g) => stages.filter((s) => s.grade === g).length);
  const bar = SO_GRADE_ORDER.map((g, i) => (counts[i] ? `<i style="flex:${counts[i]};background:${SO_COLOR[g]}" title="${g}: ${counts[i]}"></i>` : "")).join("");
  const legend = SO_GRADE_ORDER.map((g) => `<span><i style="background:${SO_COLOR[g]}"></i>${g === "Not required" ? "Not Required" : g}</span>`).join("");
  document.getElementById("soc-steps").innerHTML = `<div class="step-results"><h3>Step Results${accounts.length > 1 ? ` • Account ${st.acct + 1}` : ""}</h3><div class="step-bar">${bar}</div><div class="step-legend">${legend}</div></div>`;
  document.getElementById("soc-summary").innerHTML = `<h2>Call Summary</h2><p>${esc(soSummary(c, stages, accounts.length, st.acct))}</p>`;

  document.getElementById("soc-meta").innerHTML = `<span><b>Call Duration:</b> ${esc(c.duration)}${stitch ? ` (${clock(stitch.first)} + ${clock(stitch.second)})` : ""}</span>`;
  document.querySelectorAll("#soc-tabs button").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.tab === st.tab)));
  const results = document.getElementById("soc-results");
  const tx = document.getElementById("soc-transcript");
  results.hidden = st.tab !== "results";
  tx.hidden = st.tab !== "transcript";
  if (st.tab === "results") {
    const picker =
      accounts.length > 1
        ? `<div class="so-accts seg" role="group" aria-label="Account">${accounts.map((a, k) => `<button type="button" data-acct="${k}" aria-pressed="${k === st.acct}">Account ${k + 1} • ${esc(a.label)}</button>`).join("")}</div>`
        : "";
    results.innerHTML = picker + soResultsHtml(stages);
  } else {
    tx.innerHTML = soTranscriptHtml(c);
    soMarkCurrent();
  }
  soPaintPlayer();
}

function soOpenCall(c, cameFrom) {
  const st = soState.call;
  if (st.call !== c) {
    soStopCall();
    Object.assign(st, { call: c, tab: "results", open: null, pos: 0, acct: 0 });
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

// ---------- Creditors overview ----------
const soCredFactor = () => {
  const c = soState.cred;
  const tagF = c.tag === SO_TAG_ALL ? 1 : 0.15 + (hash(c.tag) % 30) / 100;
  return SO_RANGES[c.date].f * SO_DIR_F[c.dir] * tagF;
};
const soCredPool = () => soScopeAgents().filter((a) => soState.cred.wg === "All" || a.wg === soState.cred.wg);
function soCredCalls(pool) {
  const c = soState.cred;
  const dirs = c.dir === SO_DIR_BOTH ? ["Outbound", "Inbound"] : [c.dir];
  return pool.flatMap((a) => dirs.flatMap((d) => soCalls(a, d))).filter((x) => c.tag === SO_TAG_ALL || x.tags.includes(c.tag));
}
// Link from the Creditors overview to the Call Records behind it; keeps the page's own filters.
const soCredDrill = (p, html, title) => {
  const c = soState.cred;
  return soDrillLink({ wg: c.wg, tag: c.tag, dir: c.dir, ...p }, html, title);
};

// One row per creditor, built from the calls in the current scope. `means` is the mean rating level per call stage
// (null when every call was "Not required"); call totals are scaled to the date range like the dashboard.
function soCredRows() {
  const c = soState.cred;
  const q = c.query.toLowerCase();
  const pool = soCredPool();
  const all = soCredCalls(pool);
  const total = 8445 * soCredFactor() * (soSum(pool.map((a) => a.calls)) / soSum(SO_AGENTS.map((a) => a.calls)));
  return SO_CREDITORS.filter((n) => !q || n.toLowerCase().includes(q))
    .map((name) => {
      const calls = all.filter((x) => x.creditor === name);
      if (!calls.length) return null;
      const stages = calls.map(soCallStages);
      const means = SO_STAGES.map((s, i) => {
        const lv = stages.map((st) => SO_LEVEL[st[i].grade]).filter((l) => l >= 0);
        return lv.length ? soAvg(lv) : null;
      });
      const ranked = means.map((m, i) => ({ i, m })).filter((x) => x.m !== null).sort((x, y) => y.m - x.m);
      return {
        name,
        calls: Math.max(1, Math.round((total * calls.length) / all.length)),
        agents: new Set(calls.map((x) => x.agent.slug)).size,
        score: Math.round(soAvg(calls.map((x) => x.score))),
        means,
        ratings: means.map(soLevelOf),
        top: ranked.length ? [SO_CHIPS[ranked[0].i]] : [],
        bottom: ranked.length ? [SO_CHIPS[ranked[ranked.length - 1].i]] : [],
      };
    })
    .filter(Boolean);
}

const soCredStageChip = (cls, creditor) => (n) => soCredDrill({ creditor, stage: n }, `<span class="chip chip-${cls} chip-so-stage">${esc(n)}</span>`, `View ${creditor} calls for ${n}`);
const SO_CRED_COLS = [
  { key: "name", label: "Creditor", w: 20, sortable: true, render: (r) => soCredDrill({ creditor: r.name }, esc(r.name), `View ${r.name} calls`) },
  { key: "score", label: "Avg. Scoring", w: 16, sortable: true, render: (r) => soScore(r.score) },
  { key: "calls", label: "Calls", w: 10, sortable: true, render: (r) => soCredDrill({ creditor: r.name }, soN(r.calls), `View ${r.name} calls`) },
  { key: "agents", label: "Agents", w: 10, sortable: true },
  { key: "top", label: "Avg. Top Call Stage", w: 22, cls: "so-wrap", render: (r) => r.top.map(soCredStageChip("Good", r.name)).join("") },
  { key: "bottom", label: "Avg. Bottom Call Stage", w: 22, cls: "so-wrap", render: (r) => r.bottom.map(soCredStageChip("Poor", r.name)).join("") },
];
const SO_CRED_MATRIX_COLS = [
  { key: "name", label: "Creditor", px: 170, sortable: true, render: (r) => soCredDrill({ creditor: r.name }, esc(r.name), `View ${r.name} calls`) },
  ...SO_STAGES.map((s, i) => ({ key: "s" + i, label: s.chip, px: 125, sortable: true, render: (r) => soCredDrill({ creditor: r.name, stage: s.chip, level: r.ratings[i] }, soChip(r.ratings[i]), `View ${r.name}'s ${r.ratings[i]} calls for ${s.chip}`) })),
];
const soCredValue = (r, k) => (/^s\d$/.test(k) ? r.means[+k[1]] ?? 0 : r[k]);

function soCredKpis(rows) {
  const c = soState.cred;
  const r = SO_RANGES[c.date];
  const el = document.getElementById("socr-kpis");
  if (!rows.length) {
    el.innerHTML = soKpi("Creditors", ["<b>–</b>"]) + soKpi("Calls Evaluated", ["<b>–</b>", "<b>–</b>"]) + soKpi("Avg. Scoring", ["<b>–</b>", "<b>–</b>"]);
    return;
  }
  const calls = soSum(rows.map((x) => x.calls));
  const cur = soClamp(Math.round(soSum(rows.map((x) => x.score * x.calls)) / calls) + r.d, 0, 100);
  const prev = soClamp(cur - 6 + (hash(soState.user.id + c.wg + "so-cred-prev") % 9), 0, 100);
  el.innerHTML =
    soKpi("Creditors", [`<b class="so-big">${rows.length}</b><span>of ${SO_CREDITORS.length} creditors</span>`]) +
    soKpi("Calls Evaluated", [`<b>${soN(calls)}</b><span>${r.cur}</span>`, `<b>${soN(calls * 0.62)}</b><span>${r.prev}</span>`]) +
    soKpi("Avg. Scoring", [`${soGrade(cur)}<b>${cur}%</b><span>${r.cur}</span>`, `${soGrade(prev)}<b>${prev}%</b><span>${r.prev}</span>`]);
}

function renderSoCreditors() {
  const c = soState.cred;
  const rows = soCredRows();
  const empty = soScopeAgents().length === 0 ? "No agents are assigned to you yet." : "No creditors match your filters.";
  soCredKpis(rows);
  fillTable("socr-table", SO_CRED_COLS, c.sort, wsRows(SO_CRED_COLS, sortRows(rows, c.sort, soCredValue)), empty);
  fillTable("socr-matrix", SO_CRED_MATRIX_COLS, c.mSort, wsRows(SO_CRED_MATRIX_COLS, sortRows(rows, c.mSort, soCredValue)), empty);
  const n = soScopeAgents().length;
  document.getElementById("socr-sub").textContent = `Showing ${rows.length} of ${SO_CREDITORS.length} creditors across ${n} agent${n === 1 ? "" : "s"} in your hierarchy. Select a creditor or rating to see the calls behind it.`;
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
          if (f.creditor !== SO_CRED_ALL && c.creditor !== f.creditor) return;
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

// Column widths are percentages so the table always fits the page. A creditor's own page drops the Creditor column.
const SO_LIST_W = { date: 9, agentName: 12, wg: 9, creditor: 11, dir: 8, score: 12, hits: 14, tags: 15, details: 10 };
const SO_LIST_W_CRED = { date: 10, agentName: 13, wg: 10, dir: 9, score: 13, hits: 16, tags: 17, details: 12 };
const SO_LIST_COLS = [
  { key: "date", label: "Call Date", sortable: true, render: (r) => fmtDate(r.date) },
  { key: "agentName", label: "Agent", sortable: true, render: (r) => soAgentLink(r.agent) },
  { key: "wg", label: "Workgroup", sortable: true },
  { key: "creditor", label: "Creditor", sortable: true },
  { key: "dir", label: "Direction", sortable: true },
  { key: "score", label: "Call Scoring", sortable: true, render: (r) => soScore(r.score) },
  {
    key: "hits",
    label: "Stage Ratings",
    cls: "so-wrap",
    render: (r) => {
      const f = soState.calls;
      if (f.stage === SO_STAGE_ALL && f.level === SO_LEVEL_ALL) return `<span class="so-muted">All ${r.hits.length} stages</span>`;
      return r.hits.map((h) => `<span class="so-hit">${esc(h.chip)}${soChip(h.grade)}</span>`).join("");
    },
  },
  { key: "tags", label: "Call Tags", cls: "so-wrap", render: soCallTags },
  { key: "details", label: "Call Details", render: (r) => `<a class="text-btn" href="#/setops/call/${r.id}">View call details</a>` },
];
const soListCols = () => {
  const byCreditor = soState.calls.creditor !== SO_CRED_ALL;
  const w = byCreditor ? SO_LIST_W_CRED : SO_LIST_W;
  return SO_LIST_COLS.filter((c) => w[c.key]).map((c) => ({ ...c, w: w[c.key] }));
};

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
  const dist = `<article class="card so-dist-card">
      <div><div class="kpi-title">Performance Levels</div></div>
      <div class="so-dist" role="group" aria-label="Performance level breakdown">${bar || '<span class="so-muted">No ratings</span>'}</div>
      <div class="so-legend">${legend}</div>
      <div class="kpi-metric"><div><span>${esc(f.stage === SO_STAGE_ALL ? "All call stages" : f.stage)} • ${soN(results)} rating${results === 1 ? "" : "s"}</span></div></div>
    </article>`;
  const avgKpi = soKpi("Avg. Call Scoring", [avg === null ? "<b>–</b>" : `${soGrade(avg)}<b>${avg}%</b>`]);
  // A creditor's page leaves out Calls Matching and shows the Performance Levels card under the Calls heading.
  const own = f.creditor !== SO_CRED_ALL;
  document.getElementById("sol-kpis").innerHTML = own
    ? avgKpi
    : soKpi("Calls Matching", [`<b class="so-big">${soN(rows.length)}</b><span>of ${soN(total)} calls</span>`, `<b>${agents}</b><span>agent${agents === 1 ? "" : "s"}</span>`]) + avgKpi + dist;
  document.getElementById("sol-dist").innerHTML = own ? dist : "";
}

function renderSoList() {
  const f = soState.calls;
  const base = soListBase();
  const rows = soListRows(base);
  soListKpis(base, rows);

  const parts = [f.agent && SO_BY_SLUG.get(f.agent).name, f.wg !== "All" && f.wg, f.stage !== SO_STAGE_ALL && f.stage, f.level !== SO_LEVEL_ALL && f.level, f.tag !== SO_TAG_ALL && f.tag, f.dir !== SO_DIR_BOTH && f.dir].filter(Boolean);
  document.getElementById("sol-title").textContent = f.creditor !== SO_CRED_ALL ? f.creditor : "Call Records";
  document.getElementById("sol-sub").textContent = parts.length ? parts.join(" • ") : "All calls in your hierarchy";
  const back = document.getElementById("sol-back");
  back.href = f.back.href;
  document.getElementById("sol-back-name").textContent = f.back.label;

  const sorted = sortRows(rows, f.sort, (r, k) => r[k]);
  const listCols = soListCols();
  fillTable("sol-table", listCols, f.sort, wsRows(listCols, soPager("sol", f, sorted), (r) => ` data-id="${r.id}"`), soScopeAgents().length ? "No calls match your filters." : "No agents are assigned to you yet.");
}

// Reads the filters from the URL. Returns false when the link points at an agent outside the user's roster.
function soOpenCalls(cameFrom) {
  const f = soParseCalls(location.hash);
  if (f.agent && !soCanView(SO_BY_SLUG.get(f.agent))) return false;
  const c = soState.calls;
  Object.assign(c, f, { page: 1, sort: { key: "date", dir: "desc" } });
  // Remember where the drill-down started; returning from a call keeps the earlier origin.
  if (cameFrom.startsWith("#/setops/matrix")) c.back = { href: "#/setops/matrix", label: "Agent Matrix" };
  else if (cameFrom.startsWith("#/setops/creditors")) c.back = { href: "#/setops/creditors", label: "Creditors" };
  else if (cameFrom.startsWith("#/setops/agent/") && SO_BY_SLUG.has(cameFrom.split("/")[3])) c.back = { href: cameFrom, label: SO_BY_SLUG.get(cameFrom.split("/")[3]).name };
  else if (cameFrom === "#/setops" || cameFrom === "") c.back = { href: "#/setops", label: "Dashboard" };
  document.title = "EvalAI - SetOps - Call Records";
  dropdownPainters.forEach((p) => p());
  renderSoList();
  return true;
}

// ---------- Routing hooks (called from route() in app.js) ----------
function soShow(view) {
  ["dash", "matrix", "creditors", "calls", "agent", "call"].forEach((v) => (document.getElementById("page-so" + v).hidden = v !== view));
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
  if (view === "creditors") {
    document.title = "EvalAI - SetOps - Creditors";
    return renderSoCreditors();
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
  Object.assign(soState.dash, { wg: "All", creditor: SO_CRED_ALL, query: "" });
  Object.assign(soState.matrix, { wg: [], sup: [], query: "" });
  Object.assign(soState.cred, { wg: "All", query: "" });
  soState.dash.a.page = 1;
  document.getElementById("sod-search").value = "";
  document.getElementById("som-search").value = "";
  document.getElementById("socr-search").value = "";
  route();
}, { prefix: "View as: " });
setupDropdown("dd-sod-wg", () => ["All", ...soScopeWgs().map((w) => w.name)], () => soState.dash.wg, (v) => {
  soState.dash.wg = v;
  soDashChange();
}, { prefix: "Workgroup: " });
setupDropdown("dd-sod-creditor", [SO_CRED_ALL, ...SO_CREDITORS], () => soState.dash.creditor, (v) => {
  soState.dash.creditor = v;
  soDashChange();
});
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
bindSort("sod-creditors", () => soState.dash.crSort, renderSoDash);
bindSort("sod-agents", () => soState.dash.a.sort, () => {
  renderSoDash();
});
bindSort("soa-calls", () => soState.agent.c.sort, renderSoAgent);
bindSort("soa-creditors", () => soState.agent.cr, renderSoAgent);
// Call Stage Trends legend: click a stage to show or hide its line.
document.getElementById("soa-legend").addEventListener("click", (e) => {
  const b = e.target.closest("button[data-i]");
  if (!b) return;
  const hidden = soState.agent.hidden;
  const i = Number(b.dataset.i);
  if (hidden.has(i)) hidden.delete(i);
  else hidden.add(i);
  renderSoAgent();
});

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

// Creditors overview
const soCredChange = () => renderSoCreditors();
setupDropdown("dd-socr-wg", () => ["All", ...soScopeWgs().map((w) => w.name)], () => soState.cred.wg, (v) => {
  soState.cred.wg = v;
  soCredChange();
}, { prefix: "Workgroup: " });
setupDropdown("dd-socr-tag", [SO_TAG_ALL, ...SO_TAGS], () => soState.cred.tag, (v) => {
  soState.cred.tag = v;
  soCredChange();
});
setupDropdown("dd-socr-dir", SO_DIR_OPTS, () => soState.cred.dir, (v) => {
  soState.cred.dir = v;
  soCredChange();
}, SO_DIR_PREFIX);
setupDropdown("dd-socr-date", SO_DATES, () => soState.cred.date, (v) => {
  soState.cred.date = v;
  soCredChange();
}, { lead: "i-calendar" });
bindSort("socr-table", () => soState.cred.sort, renderSoCreditors);
bindSort("socr-matrix", () => soState.cred.mSort, renderSoCreditors);
document.getElementById("socr-search").addEventListener("input", (e) => {
  soState.cred.query = e.target.value.trim();
  soCredChange();
});
document.getElementById("socr-download").addEventListener("click", () => {
  const rows = sortRows(soCredRows(), soState.cred.sort, soCredValue);
  saveCsv(
    [["Creditor", "Calls", "Avg. Scoring", "Agents", ...SO_STAGES.map((s) => s.col)], ...rows.map((r) => [r.name, r.calls, `${soLetter(r.score)} ${r.score}%`, r.agents, ...r.ratings])],
    "creditor-performance.csv"
  );
  toast(`Exported ${rows.length} creditors`);
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
setupDropdown("dd-sol-creditor", [SO_CRED_ALL, ...SO_CREDITORS], () => soState.calls.creditor, (v) => {
  soState.calls.creditor = v;
  soListChange();
});
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
// The card sits in the KPI row, or under the Calls heading on a creditor's page.
["sol-kpis", "sol-dist"].forEach((id) =>
  document.getElementById(id).addEventListener("click", (e) => {
    const b = e.target.closest("button[data-level]");
    if (!b) return;
    const f = soState.calls;
    f.level = f.level === b.dataset.level ? SO_LEVEL_ALL : b.dataset.level;
    dropdownPainters.forEach((p) => p());
    soListChange();
  })
);
document.getElementById("sol-table").addEventListener("click", (e) => {
  if (e.target.closest("a")) return;
  const row = e.target.closest("tbody tr[data-id]");
  if (row) location.hash = `#/setops/call/${row.dataset.id}`;
});
document.getElementById("sol-download").addEventListener("click", () => {
  const f = soState.calls;
  const rows = sortRows(soListRows(soListBase()), f.sort, (r, k) => r[k]);
  saveCsv(
    [["Call ID", "Call Date", "Agent", "Workgroup", "Creditor", "Direction", "Call Scoring", "Stage Ratings", "Call Tags"], ...rows.map((r) => [r.id, fmtDate(r.date), r.agentName, r.wg, r.creditor, r.dir, `${soLetter(r.score)} ${r.score}%`, r.hits.map((h) => `${h.chip}: ${h.grade}`).join("; "), r.tags.join("; ")])],
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
  const accts = soCallAccounts(c);
  const rows = accts.flatMap((ac, k) => ac.stages.map((s) => [accts.length > 1 ? `Account ${k + 1} (${ac.label})` : "", s.name, s.grade, s.text + (s.quote ? ` Agent: "${s.quote}"` : "")]));
  saveCsv([["Account", "Call Stage", "Rating", "Summary"], ...rows], `call-${c.id}-results.csv`);
  toast(`Exported ${rows.length} stage results`);
});

document.getElementById("soc-tabs").addEventListener("click", (e) => {
  const b = e.target.closest("button[data-tab]");
  if (!b || b.dataset.tab === soState.call.tab) return;
  soState.call.tab = b.dataset.tab;
  renderSoCall();
});
document.getElementById("soc-results").addEventListener("click", (e) => {
  const acct = e.target.closest("button[data-acct]");
  if (acct) {
    Object.assign(soState.call, { acct: Number(acct.dataset.acct), open: null });
    renderSoCall();
    return;
  }
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
