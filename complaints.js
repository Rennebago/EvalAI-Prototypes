// ---------- Wholesale complaints (possible MVP+) ----------
// Based on the "EvalAI / Wholesale Complaint Process" notes (Oct 15, 2026): Regulatory Review, Customer Service and
// Wholesale / Partner Relations. Loaded after wholesale.js and reuses its helpers. All complaints are generated.
// From the notes: CFPB aims for 30 days and BBB can allow as few as 8. The other due dates are assumptions.

const WC_ASOF = new Date(2026, 9, 21); // prototype "today"
const wcAgo = (n) => new Date(2026, 9, 21 - n);
const wcFmt = (d) => `${String(d.getMonth() + 1).padStart(2, "0")}/${String(d.getDate()).padStart(2, "0")}/${String(d.getFullYear()).slice(2)}`;
const wcDays = (a, b) => Math.round((b - a) / 86400000);
const wcMonth = (d) => d.toLocaleDateString("en-US", { month: "long", year: "numeric" });
const wcMoney = (n) => `$${n.toLocaleString("en-US")}`;

// Level 1 to 4 as described by Regulatory Review. Customer Service describes the levels slightly differently.
const WC_TIERS = [
  { n: 1, name: "Regulatory", chip: "Poor" },
  { n: 2, name: "Executive", chip: "Fair" },
  { n: 3, name: "Business", chip: "Excellent" },
  { n: 4, name: "Customer Service", chip: "Incomplete" },
];

const WC_SOURCES = [
  { tier: 1, name: "CFPB", days: 30, w: 2, rule: "CFPB: aim to resolve within 30 days. It can run longer at the reviewer's discretion." },
  { tier: 1, name: "FDAC", days: 30, w: 2, rule: "Regulatory: response due to the agency. Due date assumed at 30 days." },
  { tier: 1, name: "Dept. of State", days: 30, w: 1, rule: "Regulatory: response due to the agency. Due date assumed at 30 days." },
  { tier: 2, name: "Executive escalation", days: 10, w: 1, rule: "Directed at an executive. Due date assumed at 10 days." },
  { tier: 3, name: "BBB", days: 8, w: 5, rule: "BBB: follows the BBB timeline. Some give only 8 days to respond." },
  { tier: 4, name: "Customer Service", days: 14, w: 7, rule: "Customer Service: reach the client within 2 days, follow up every 2 business days, close after 3 unanswered attempts. Resolution date assumed at 14 days." },
];

const WC_TOPICS = [
  { name: "Credit impact not disclosed", cat: "Credit Impact/Disclosure", claim: "Client says they were never told that enrolling would hurt their credit and has since seen their score drop." },
  { name: "Program described as a loan", cat: "Misrepresentation", claim: "Client believed the program was a loan and did not understand that they would stop paying their creditors." },
  { name: "Told to run up cards", cat: "Misrepresentation", claim: `Client says the agent told them to keep charging their cards to "maximize the profit" before enrolling.` },
  { name: "Outcome or timeline promised", cat: "Misrepresentation", claim: "Client says they were promised every account would be settled within a fixed time for a fixed monthly payment." },
  { name: "Told they would not be sued", cat: "Legal Action", claim: `Client was contacted about a lawsuit after enrolling and says the agent told them "you won't be sued".` },
  { name: "Program Summary recording downplayed", cat: "Downplaying Program Summary Recording", claim: "Client says the agent told them to skip the Program Summary recording and they did not know about the program fees." },
];

// A call-needed complaint goes through every step. When the call is already in EvalAI the two call steps are skipped.
const WC_STEPS = ["Received", "Call requested", "Call received", "Reviewed", "Coaching sent", "Closed"];
const WC_STATUS = { Received: "New", "Call requested": "Awaiting partner call", "Call received": "Call received", Reviewed: "Reviewed", "Coaching sent": "Coaching sent", Closed: "Closed" };
const WC_CHIP = { New: "Incomplete", "Awaiting partner call": "Fair", "Call received": "Excellent", Reviewed: "Excellent", "Coaching sent": "Excellent", Closed: "Good" };
const WC_LOG = {
  Received: "Complaint received",
  "Call requested": "Call requested from partner",
  "Call received": "Call received from partner",
  Reviewed: "Call reviewed",
  "Coaching sent": "Coaching sent to partner",
  Closed: "Complaint closed",
};
const WC_RESOLUTIONS = ["Responded - no further action", "Monetary resolution", "Corrective action agreed with partner"];
const WC_MONETARY = "Monetary resolution";

// Each team sees the tiers it works. Regulatory Review wants only what it has to review; Compliance wants the whole view.
const WC_ROLES = {
  "Partner Relations": [1, 2, 3, 4],
  Compliance: [1, 2, 3, 4],
  "Regulatory Review": [1],
  "Customer Service": [2, 3, 4],
};
const WC_ROLE_NOTE = {
  "Partner Relations": "Follow each complaint through partner calls, coaching and resolution.",
  Compliance: "The whole view: every tier, with the call findings behind each complaint.",
  "Regulatory Review": "Tier 1 regulatory complaints only, with the moments that matter for the review.",
  "Customer Service": "Tier 2 to 4 complaints. Open the call yourself instead of waiting on a summary.",
};

// The notes name Symple, Penni and Rescue One as the partners with the most complaints.
const WC_WEIGHTS = { Symple: 5, Penni: 4, "Rescue 1 financial": 4, Iconic: 2, "Absolute Debt Relief": 2, "United Financial Network": 3, Empower: 2 };
const WC_OWNERS = ["Rachel Green", "Monica Geller", "Chandler Bing"];
const WC_FIRST = ["Maria", "James", "Linda", "Robert", "Patricia", "Michael", "Barbara", "David", "Susan", "Carlos"];
const WC_LAST = ["Alvarez", "Brooks", "Chen", "Dawson", "Ellis", "Foster", "Garcia", "Hughes", "Ibarra", "Jensen"];

const WC_ALL = [];
const WC_MAP = new Map();
const WC_BY_CALL = new Map();
let wcReady = false;

const wcState = {
  role: "Partner Relations",
  tier: "All tiers",
  status: "All statuses",
  partner: "All partners",
  query: "",
  sort: { key: "due", dir: "asc" },
  page: 1,
  size: 10,
  month: "All months",
  mSort: { key: null, dir: "asc" },
  detail: { c: null, from: null },
};

// ---------- Data ----------
function wcInit() {
  if (wcReady) return;
  wcReady = true;
  wsInit();
  const partners = WS_PARTNERS.flatMap((p) => Array(WC_WEIGHTS[p.name] || 1).fill(p));
  const sources = WC_SOURCES.flatMap((s) => Array(s.w).fill(s));
  for (let i = 0; i < 30; i++) {
    const rand = rng(hash("wc-" + i));
    const pick = (list) => list[Math.floor(rand() * list.length)];
    const p = pick(partners);
    // A complaint needs a failed call with a known category (the coaching draft quotes it).
    const failed = wsPartnerCalls(p).filter((x) => !x.pass && x.cats.length && WS_CAT[x.cats[0]]);
    if (!failed.length) continue;
    const fresh = failed.filter((x) => !WC_BY_CALL.has(x.id));
    const call = pick(fresh.length ? fresh : failed);
    const cat = call.cats[0];
    const src = pick(sources);
    const daysAgo = 1 + Math.floor(rand() * 70);
    const inEvalAI = rand() < 0.45;
    const steps = inEvalAI ? WC_STEPS.filter((s) => !s.startsWith("Call ")) : WC_STEPS;
    const done = daysAgo > 40 && rand() < 0.75 ? steps.length : 1 + Math.floor(rand() * steps.length);
    const owner = pick(WC_OWNERS);
    const log = steps.slice(0, done).map((step, k) => ({
      step,
      date: wcAgo(daysAgo - Math.round((daysAgo * k) / done)),
      who: k === 0 ? (src.tier === 1 ? "Regulatory Review" : "Customer Service") : owner,
    }));
    const refund = rand() < 0.35 ? 100 * (4 + Math.floor(rand() * 30)) : 0;
    const c = {
      id: `WC-${1040 + i}`,
      slug: `wc-${1040 + i}`,
      num: 1040 + i,
      tier: src.tier,
      src,
      partner: p,
      agent: call.agent,
      call,
      cat,
      topic: pick(WC_TOPICS.filter((t) => t.cat === cat).concat(WC_TOPICS.some((t) => t.cat === cat) ? [] : WC_TOPICS)),
      inEvalAI,
      steps,
      done,
      log,
      events: [],
      received: wcAgo(daysAgo),
      due: wcAgo(daysAgo - src.days),
      owner,
      appId: `SUIP-${40000 + Math.floor(rand() * 59999)}`,
      client: `${pick(WC_FIRST)} ${pick(WC_LAST)[0]}.`,
      prior: Math.floor(rand() * 3),
      refund,
      resolution: null,
      coaching: null,
      coachDraft: null,
    };
    if (done === steps.length) c.resolution = refund ? WC_MONETARY : WC_RESOLUTIONS[rand() < 0.5 ? 0 : 2];
    if (done > steps.indexOf("Coaching sent")) {
      const sent = log[steps.indexOf("Coaching sent")].date;
      const reply = new Date(sent.getFullYear(), sent.getMonth(), sent.getDate() + 1 + Math.floor(rand() * 8));
      c.coaching = { date: sent, text: wcCoachDraft(c), response: rand() < 0.6 && reply <= WC_ASOF ? reply : null };
    }
    WC_ALL.push(c);
    WC_MAP.set(c.slug, c);
    if (!WC_BY_CALL.has(call.id)) WC_BY_CALL.set(call.id, c);
  }
}

function wcCoachDraft(c) {
  const cites = WS_CAT[c.cat].cites.map((ct) => `- ${hms(TX_TIMES[ct.line])} "${ct.quote}"`).join("\n");
  return `${c.agent.name} (${c.partner.name}) - ${c.cat}, complaint ${c.id}\n\nMoments to coach on:\n${cites}\n\nPlease review these with the agent and reply with the corrective action taken.`;
}

// ---------- Derived values ----------
const wcClosed = (c) => c.done === c.steps.length;
const wcStatus = (c) => WC_STATUS[c.steps[c.done - 1]];
const wcDueIn = (c) => wcDays(WC_ASOF, c.due);
const wcOverdue = (c) => !wcClosed(c) && wcDueIn(c) < 0;
const wcCallReady = (c) => c.inEvalAI || c.done > c.steps.indexOf("Call received");
const wcClosedOn = (c) => c.log[c.log.length - 1].date;

function wcCallInfo(c) {
  if (c.inEvalAI) return { text: "In EvalAI", tone: "positive" };
  const i = c.steps.indexOf("Call requested");
  if (c.done <= i) return { text: "Not requested", tone: "" };
  if (c.done === i + 1) {
    const wait = wcDays(c.log[i].date, WC_ASOF);
    return { text: `Awaiting partner (${wait}d)`, tone: "warning", awaiting: true, wait };
  }
  return { text: "Received", tone: "positive" };
}

const wcChipHtml = (cls, text) => `<span class="chip chip-${cls}">${esc(text)}</span>`;
const wcTierChip = (c) => wcChipHtml(WC_TIERS[c.tier - 1].chip, `Tier ${c.tier} - ${WC_TIERS[c.tier - 1].name}`);
const wcStatusChip = (c) => wcChipHtml(WC_CHIP[wcStatus(c)], wcStatus(c));
const wcLink = (c) => `<a class="agent-link" href="#/wholesale/complaint/${c.slug}">${esc(c.id)}</a>`;
const wcPartnerLink = (p) => `<a class="agent-link" href="#/wholesale/partner/${p.slug}">${esc(p.name)}</a>`;

function wcDueHtml(c) {
  if (wcClosed(c)) return `<span>Closed ${wcFmt(wcClosedOn(c))}</span>`;
  const n = wcDueIn(c);
  if (n < 0) return `<span class="tone-negative">${-n}d overdue</span>`;
  return `<span class="${n <= 3 ? "tone-warning" : ""}">${wcFmt(c.due)} (${n}d)</span>`;
}

function wcDueLong(c) {
  if (wcClosed(c)) return wcFmt(c.due);
  const n = wcDueIn(c);
  return n < 0 ? `${wcFmt(c.due)} <span class="tone-negative">(${-n}d overdue)</span>` : `${wcFmt(c.due)} (${n}d left)`;
}

function wcSortVal(c, k) {
  switch (k) {
    case "id":
      return c.num;
    case "received":
      return c.received.getTime();
    case "tier":
      return c.tier;
    case "source":
      return c.src.name;
    case "partner":
      return c.partner.name;
    case "agent":
      return c.agent.name;
    case "cat":
      return c.cat;
    case "status":
      return c.done / c.steps.length;
    case "due":
      return wcClosed(c) ? Number.MAX_SAFE_INTEGER : c.due.getTime();
    default:
      return c[k] ?? "";
  }
}

// ---------- Tracker ----------
const WC_COLS = [
  { key: "id", label: "Complaint", px: 100, sortable: true, render: wcLink },
  { key: "received", label: "Received", px: 90, sortable: true, render: (r) => wcFmt(r.received) },
  { key: "tier", label: "Tier", px: 190, sortable: true, render: wcTierChip },
  { key: "source", label: "Source", px: 150, sortable: true, render: (r) => esc(r.src.name) },
  { key: "partner", label: "Partner", px: 170, sortable: true, render: (r) => wcPartnerLink(r.partner) },
  { key: "agent", label: "Agent", px: 130, sortable: true, render: (r) => wsAgentLink(r.agent) },
  { key: "appId", label: "App ID", px: 110, render: (r) => esc(r.appId) },
  { key: "cat", label: "Category", px: 170, sortable: true, cls: "wrap", render: (r) => wsChip(r.cat) },
  {
    key: "call",
    label: "Call",
    px: 170,
    render: (r) => {
      const i = wcCallInfo(r);
      return `<span class="${i.tone ? "tone-" + i.tone : ""}">${esc(i.text)}</span>`;
    },
  },
  { key: "status", label: "Status", px: 170, sortable: true, cls: "wrap", render: wcStatusChip },
  { key: "due", label: "Due", px: 130, sortable: true, render: wcDueHtml },
  { key: "owner", label: "Owner", px: 120, render: (r) => esc(r.owner) },
];

const wcScoped = () => WC_ALL.filter((c) => WC_ROLES[wcState.role].includes(c.tier));

function wcStatusMatch(c, s) {
  if (s === "All statuses") return true;
  if (s === "Past due") return wcOverdue(c);
  return wcStatus(c) === s;
}

function wcFiltered() {
  const st = wcState;
  const q = st.query.toLowerCase();
  const tier = st.tier === "All tiers" ? 0 : Number(st.tier.match(/\d/)[0]);
  return wcScoped().filter(
    (c) =>
      (!tier || c.tier === tier) &&
      (st.partner === "All partners" || c.partner.name === st.partner) &&
      wcStatusMatch(c, st.status) &&
      (!q || [c.id, c.partner.name, c.agent.name, c.appId, c.src.name, c.cat, c.topic.name, c.client].some((s) => s.toLowerCase().includes(q)))
  );
}

function wcListKpis() {
  const all = wcScoped();
  const open = all.filter((c) => !wcClosed(c));
  const overdue = open.filter(wcOverdue).length;
  const waiting = open.map(wcCallInfo).filter((i) => i.awaiting);
  const wait = waiting.length ? Math.round(waiting.reduce((s, i) => s + i.wait, 0) / waiting.length) : 0;
  const closed = all.filter(wcClosed);
  const avgClose = closed.length ? Math.round(closed.reduce((s, c) => s + wcDays(c.received, wcClosedOn(c)), 0) / closed.length) : 0;
  const top = Math.min(...WC_ROLES[wcState.role]);
  const topAll = all.filter((c) => c.tier === top);
  const monthName = WC_ASOF.toLocaleDateString("en-US", { month: "long" });
  return wsKpiHtml([
    { title: "Open Complaints", rows: [`<b>${open.length}</b><span>open</span>`, `<b class="${overdue ? "tone-negative" : ""}">${overdue}</b><span>past due</span>`] },
    { title: "Awaiting Partner Calls", rows: [`<b class="${waiting.length ? "tone-warning" : ""}">${waiting.length}</b><span>requested</span>`, `<b>${wait}d</b><span>avg. wait</span>`] },
    { title: "Resolved", rows: [`<b class="tone-positive">${closed.length}</b><span>closed</span>`, `<b>${avgClose}d</b><span>avg. to close</span>`] },
    {
      title: `Tier ${top} - ${WC_TIERS[top - 1].name}`,
      rows: [`<b>${topAll.filter((c) => !wcClosed(c)).length}</b><span>open</span>`, `<b>${topAll.filter((c) => wcMonth(c.received) === wcMonth(WC_ASOF)).length}</b><span>received in ${monthName}</span>`],
    },
  ]);
}

function renderWcList() {
  wcInit();
  const st = wcState;
  document.getElementById("wcl-sub").textContent = WC_ROLE_NOTE[st.role];
  document.getElementById("wcl-kpis").innerHTML = wcListKpis();
  const all = sortRows(wcFiltered(), st.sort, wcSortVal);
  fillTable("wcl-table", WC_COLS, st.sort, wsRows(WC_COLS, wsPage("wcl", st, all), (r) => ` data-id="${r.slug}"`), "No complaints match your filters.");
  renderWcMonthly();
}

// ---------- Monthly view by partner ----------
const WC_M_COLS = [
  { key: "name", label: "Partner", w: 28, sortable: true, render: (r) => (r.slug ? wcPartnerLink(r) : "<b>All partners</b>") },
  { key: "total", label: "Complaints", w: 12, num: true, sortable: true },
  { key: "t1", label: "Tier 1", w: 12, num: true, sortable: true },
  { key: "open", label: "Open", w: 12, num: true, sortable: true },
  { key: "overdue", label: "Past Due", w: 12, num: true, sortable: true, render: (r) => `<span class="${r.overdue ? "tone-negative" : ""}">${r.overdue}</span>` },
  { key: "coached", label: "Coaching Sent", w: 12, num: true, sortable: true },
  { key: "refunds", label: "Refunds Recouped", w: 12, num: true, sortable: true, render: (r) => (r.refunds ? wcMoney(r.refunds) : "-") },
];

function wcMonthRow(name, slug, list) {
  return {
    name,
    slug,
    total: list.length,
    t1: list.filter((c) => c.tier === 1).length,
    open: list.filter((c) => !wcClosed(c)).length,
    overdue: list.filter(wcOverdue).length,
    coached: list.filter((c) => c.done > c.steps.indexOf("Coaching sent")).length,
    refunds: list.filter((c) => c.resolution === WC_MONETARY).reduce((s, c) => s + c.refund, 0),
  };
}

function renderWcMonthly() {
  const m = wcState.month;
  const list = wcScoped().filter((c) => m === "All months" || wcMonth(c.received) === m);
  const rows = WS_PARTNERS.map((p) => wcMonthRow(p.name, p.slug, list.filter((c) => c.partner === p))).filter((r) => r.total);
  const body = sortRows(rows, wcState.mSort, (r, k) => r[k]);
  if (body.length) body.push(wcMonthRow("All partners", "", list));
  fillTable("wcm-table", WC_M_COLS, wcState.mSort, wsRows(WC_M_COLS, body), "No complaints in this month.");
}

// ---------- Partner overview card and dashboard KPI ----------
const WC_P_COLS = [
  { key: "id", label: "Complaint", w: 14, render: wcLink },
  { key: "received", label: "Received", w: 12, render: (r) => wcFmt(r.received) },
  { key: "tier", label: "Tier", w: 22, cls: "wrap", render: wcTierChip },
  { key: "cat", label: "Category", w: 22, cls: "wrap", render: (r) => wsChip(r.cat) },
  { key: "status", label: "Status", w: 17, cls: "wrap", render: wcStatusChip },
  { key: "due", label: "Due", w: 13, render: wcDueHtml },
];

function wcRenderPartner(p) {
  wcInit();
  const list = WC_ALL.filter((c) => c.partner === p).sort((a, b) => b.received - a.received);
  const open = list.filter((c) => !wcClosed(c)).length;
  document.getElementById("wp-complaints-sub").textContent = list.length ? `${list.length} total, ${open} open` : "";
  fillTable("wp-complaints", WC_P_COLS, WS_NO_SORT(), wsRows(WC_P_COLS, list), "No complaints for this partner.");
}

function wcDashKpi() {
  wcInit();
  const open = WC_ALL.filter((c) => !wcClosed(c));
  const overdue = open.filter(wcOverdue).length;
  return {
    title: "Open Complaints",
    rows: [`<b class="tone-negative">${open.length}</b><span>open</span>`, `<b class="${overdue ? "tone-negative" : ""}">${overdue}</b><span>past due</span>`, `<a class="text-btn" href="#/wholesale/complaints">View complaints</a>`],
  };
}

// ---------- Complaint detail ----------
const WC_NEXT = {
  "Call requested": { btn: "Request call from partner", act: "request" },
  "Call received": { btn: "Mark call received", act: "received" },
  Reviewed: { btn: "Mark reviewed", act: "reviewed" },
  "Coaching sent": { btn: "Send coaching to partner", act: "coach" },
  Closed: { btn: "Close complaint", act: "close" },
};
const WC_TOAST = { request: "Call requested from partner", received: "Call received. It is now available below", reviewed: "Marked reviewed", coach: "Coaching sent to partner", close: "Complaint closed", reopen: "Complaint reopened" };

function wcAdvance(c) {
  c.log.push({ step: c.steps[c.done], date: WC_ASOF, who: c.owner });
  c.done += 1;
}

function wcOpen(c, cameFrom) {
  const st = wcState.detail;
  if (/^#\/wholesale\/partner\//.test(cameFrom)) st.from = cameFrom;
  else if (!/\/call\//.test(cameFrom) && !/\/complaint\//.test(cameFrom)) st.from = null;
  st.c = c;
  const m = st.from && st.from.match(/^#\/wholesale\/partner\/([a-z0-9-]+)$/);
  const p = m && WS_PARTNERS.find((x) => x.slug === m[1]);
  document.getElementById("wcd-back").href = p ? st.from : "#/wholesale/complaints";
  document.getElementById("wcd-back-name").textContent = p ? p.name : "Complaints";
  document.title = `EvalAI - Wholesale - Complaint ${c.id}`;
  renderWcDetail();
}

const wcRow = (k, v) => `<div><dt>${esc(k)}</dt><dd>${v}</dd></div>`;

function wcSummaryHtml(c) {
  return `<div class="section-head"><h2>Complaint Summary</h2></div>
    <dl class="wcd-dl">
      ${wcRow("Source", esc(c.src.name))}
      ${wcRow("Received", wcFmt(c.received))}
      ${wcRow("Due", wcDueLong(c))}
      ${wcRow("Partner", wcPartnerLink(c.partner))}
      ${wcRow("Agent", wsAgentLink(c.agent))}
      ${wcRow("App ID (SUIP)", esc(c.appId))}
      ${wcRow("Client", esc(c.client))}
      ${wcRow("Prior complaints", c.prior ? `${c.prior} on this client` : "None")}
      ${wcRow("Owner", esc(c.owner))}
      ${c.refund ? wcRow("Refund requested", wcMoney(c.refund) + (c.resolution === WC_MONETARY ? " - recouped from partner" : "")) : ""}
    </dl>
    <div class="wcd-claim"><b>${esc(c.topic.name)}</b><p>${esc(c.topic.claim)}</p></div>
    <p class="wcd-note">${esc(c.src.rule)}</p>`;
}

function wcActivityHtml(c) {
  const items = [...c.log.map((l) => ({ date: l.date, text: WC_LOG[l.step], who: l.who })), ...c.events]
    .map((x, i) => ({ ...x, i }))
    .sort((a, b) => b.date - a.date || b.i - a.i);
  return `<div class="section-head"><h2>Activity</h2></div>
    <ol class="wcd-log">${items.map((x) => `<li><span class="wcd-log-date">${wcFmt(x.date)}</span><div><b>${esc(x.text)}</b><span>${esc(x.who)}</span></div></li>`).join("")}</ol>`;
}

function wcProgressHtml(c) {
  const steps = c.steps
    .map((s, i) => {
      const done = i < c.done;
      return `<li class="wcd-step${done ? " done" : i === c.done ? " next" : ""}"><span class="wcd-dot">${done ? icon("i-check", 16) : i + 1}</span><b>${esc(s)}</b><span>${done ? wcFmt(c.log[i].date) : ""}</span></li>`;
    })
    .join("");
  const next = c.steps[c.done];
  let action;
  if (!next) {
    action = `<div class="wcd-action"><p><b>Closed ${wcFmt(wcClosedOn(c))}.</b> ${esc(c.resolution)}.</p><div class="wcd-actions"><button class="btn-secondary" type="button" data-act="reopen">Reopen</button></div></div>`;
  } else {
    const n = WC_NEXT[next];
    const text = {
      "Call requested": `The call is not in EvalAI yet. Request it from ${c.partner.name}.`,
      "Call received": `Waiting on ${c.partner.name}. Requested ${wcFmt(c.log[c.done - 1].date)} (${wcDays(c.log[c.done - 1].date, WC_ASOF)} days ago).`,
      Reviewed: "Review the findings from the call, then mark the review complete.",
      "Coaching sent": "Send the findings and any other coaching the agent needs to the partner.",
      Closed: "Record the resolution to close the complaint.",
    }[next];
    const extra =
      next === "Call received"
        ? `<button class="btn-secondary" type="button" data-act="remind">Send reminder</button>`
        : next === "Closed"
          ? `<select class="wcd-select" id="wcd-resolution" aria-label="Resolution">${WC_RESOLUTIONS.map((r) => `<option>${esc(r)}</option>`).join("")}</select>`
          : "";
    action = `<div class="wcd-action"><p><b>Next:</b> ${esc(text)}</p><div class="wcd-actions">${extra}<button class="wcd-btn" type="button" data-act="${n.act}">${esc(n.btn)}</button></div></div>`;
  }
  return `<div class="section-head"><h2>Progress</h2><p>${c.inEvalAI ? "The call is already in EvalAI, so no partner request is needed." : "The call has to come from the partner before it can be reviewed."}</p></div>
    <ol class="wcd-steps">${steps}</ol>${action}`;
}

function wcCallHtml(c) {
  const call = c.call;
  const ready = wcCallReady(c);
  const info = wcCallInfo(c);
  if (!ready) {
    return `<div class="section-head"><h2>Linked Call</h2></div>
      <p class="ws-none">${info.awaiting ? `Requested from ${esc(c.partner.name)} ${wcDays(c.log[c.steps.indexOf("Call requested")].date, WC_ASOF)} days ago. The call and transcript appear here as soon as it arrives.` : "The call has not been requested yet. Request it from the partner to start the review."}</p>`;
  }
  const others = call.cats.filter((n) => n !== c.cat);
  const cites = WS_CAT[c.cat].cites
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
    .join("");
  return `<div class="section-head split">
      <div><h2>Linked Call</h2><p>Anyone working this complaint can open the recording and transcript here, without waiting on a summary.</p></div>
      <a class="btn-secondary" href="#/wholesale/call/${call.id}">View full call review</a>
    </div>
    <div class="wcd-callmeta"><span><b>Call:</b> #${esc(call.id)}</span><span><b>Agent:</b> ${esc(call.agent.email)}</span><span><b>Upload Date:</b> ${esc(call.date)}</span><span><b>Call Duration:</b> ${esc(call.duration)}</span></div>
    <div class="wcd-focus">
      <h3>Review focus: ${esc(c.cat)}</h3>
      <p class="wcd-note">Only the moments that relate to this complaint.${others.length ? " Other findings on this call: " : ""}${others.map(wsChip).join("")}</p>
      <div class="ws-cites">${cites}</div>
    </div>`;
}

function wcCoachingHtml(c) {
  const head = `<div class="section-head"><h2>Coaching to Partner</h2><p>The findings plus anything else the agent needs coaching on.</p></div>`;
  if (c.coaching) {
    const k = c.coaching;
    const reply = k.response ? `<span class="tone-positive">Partner acknowledged ${wcFmt(k.response)}</span>` : `<span class="${wcDays(k.date, WC_ASOF) > 5 ? "tone-warning" : ""}">No response yet (sent ${wcDays(k.date, WC_ASOF)} days ago)</span>`;
    return `${head}<div class="wcd-sent">${esc(k.text)}</div><p class="wcd-note"><b>Sent ${wcFmt(k.date)} to ${esc(c.partner.name)}.</b> ${reply}</p>`;
  }
  const ready = wcCallReady(c);
  return `${head}<textarea class="wcd-coach" id="wcd-coach" aria-label="Coaching notes"${ready ? "" : " disabled"}>${esc(c.coachDraft ?? (ready ? wcCoachDraft(c) : ""))}</textarea>
    <p class="wcd-note">${ready ? "Drafted from the call findings. Edit it, then send it from Progress." : "Available once the call is received."}</p>`;
}

function renderWcDetail() {
  const c = wcState.detail.c;
  if (!c) return;
  document.getElementById("wcd-title").textContent = `Complaint ${c.id}`;
  document.getElementById("wcd-tags").innerHTML = `<span class="tag"><span class="k">Partner:</span>${wcPartnerLink(c.partner)}</span><span class="tag"><span class="k">Agent:</span>${wsAgentLink(c.agent)}</span><span class="tag">${wcTierChip(c)}</span><span class="tag">${wcStatusChip(c)}</span>`;
  document.getElementById("wcd-summary").innerHTML = wcSummaryHtml(c);
  document.getElementById("wcd-activity").innerHTML = wcActivityHtml(c);
  document.getElementById("wcd-progress").innerHTML = wcProgressHtml(c);
  document.getElementById("wcd-call").innerHTML = wcCallHtml(c);
  document.getElementById("wcd-coaching").innerHTML = wcCoachingHtml(c);
}

// Banner on the call details page when the call is tied to a complaint.
function wcPaintCallBanner(call) {
  wcInit();
  const c = WC_BY_CALL.get(call.id);
  const el = document.getElementById("wc-complaint");
  el.hidden = !c;
  if (c) el.innerHTML = `${icon("i-flag", 16)}<span>This call is linked to complaint <a class="agent-link" href="#/wholesale/complaint/${c.slug}">${esc(c.id)}</a> (${esc(c.src.name)}, ${esc(wcStatus(c))}).</span>`;
}

// ---------- Routing hook (called from wsRoute in wholesale.js) ----------
function wcRoute(view, slug, cameFrom) {
  wcInit();
  if (view === "complaints") {
    document.title = "EvalAI - Wholesale - Complaints";
    return renderWcList();
  }
  const c = WC_MAP.get(slug);
  return c ? wcOpen(c, cameFrom) : (location.hash = "#/wholesale/complaints");
}

// ---------- Downloads ----------
function wcCsv() {
  const rows = sortRows(wcFiltered(), wcState.sort, wcSortVal);
  saveCsv(
    [
      ["Complaint", "Received", "Tier", "Source", "Partner", "Agent", "App ID", "Category", "Call", "Status", "Due", "Owner"],
      ...rows.map((c) => [c.id, wcFmt(c.received), `Tier ${c.tier} - ${WC_TIERS[c.tier - 1].name}`, c.src.name, c.partner.name, c.agent.email, c.appId, c.cat, wcCallInfo(c).text, wcStatus(c), wcClosed(c) ? "Closed" : wcFmt(c.due), c.owner]),
    ],
    "wholesale-complaints.csv"
  );
  toast(`Exported ${rows.length} complaints`);
}

// ---------- Init ----------
const WC_TIER_OPTS = ["All tiers", ...WC_TIERS.map((t) => `Tier ${t.n} - ${t.name}`)];
const WC_STATUS_OPTS = ["All statuses", "Past due", ...Object.values(WC_STATUS)];
const WC_MONTH_OPTS = ["All months", "October 2026", "September 2026", "August 2026"];

setupDropdown("dd-wcl-role", Object.keys(WC_ROLES), () => wcState.role, (v) => {
  Object.assign(wcState, { role: v, tier: "All tiers", page: 1 });
  renderWcList();
}, { prefix: "View as - " });
setupDropdown("dd-wcl-tier", WC_TIER_OPTS, () => wcState.tier, (v) => {
  wcState.tier = v;
  wcState.page = 1;
  renderWcList();
});
setupDropdown("dd-wcl-status", WC_STATUS_OPTS, () => wcState.status, (v) => {
  wcState.status = v;
  wcState.page = 1;
  renderWcList();
});
setupDropdown("dd-wcl-partner", ["All partners", ...WS_PARTNERS.map((p) => p.name)], () => wcState.partner, (v) => {
  wcState.partner = v;
  wcState.page = 1;
  renderWcList();
});
setupDropdown("dd-wcl-size", ["5", "10", "15"], () => String(wcState.size), (v) => {
  wcState.size = Number(v);
  wcState.page = 1;
  renderWcList();
}, { prefix: "View " });
setupDropdown("dd-wcm-month", WC_MONTH_OPTS, () => wcState.month, (v) => {
  wcState.month = v;
  renderWcMonthly();
}, { lead: "i-calendar" });

bindSort("wcl-table", () => wcState.sort, renderWcList);
bindSort("wcm-table", () => wcState.mSort, renderWcMonthly);

document.getElementById("wcl-prev").addEventListener("click", () => {
  wcState.page -= 1;
  renderWcList();
});
document.getElementById("wcl-next").addEventListener("click", () => {
  wcState.page += 1;
  renderWcList();
});
document.getElementById("wcl-search").addEventListener("input", (e) => {
  wcState.query = e.target.value.trim();
  wcState.page = 1;
  renderWcList();
});
document.getElementById("wcl-download").addEventListener("click", wcCsv);

// Rows open the complaint; links, chips and sort buttons keep their own behavior.
document.getElementById("wcl-table").addEventListener("click", (e) => {
  if (e.target.closest("a, button")) return;
  const row = e.target.closest("tbody tr[data-id]");
  if (row) location.hash = `#/wholesale/complaint/${row.dataset.id}`;
});

document.getElementById("wcd-progress").addEventListener("click", (e) => {
  const b = e.target.closest("button[data-act]");
  const c = wcState.detail.c;
  if (!b || !c) return;
  const act = b.dataset.act;
  if (act === "remind") c.events.push({ date: WC_ASOF, text: `Reminder sent to ${c.partner.name}`, who: c.owner });
  else if (act === "reopen") {
    c.done -= 1;
    c.log.pop();
    c.resolution = null;
  } else {
    if (act === "coach") c.coaching = { date: WC_ASOF, text: c.coachDraft ?? wcCoachDraft(c), response: null };
    if (act === "close") c.resolution = document.getElementById("wcd-resolution").value;
    wcAdvance(c);
  }
  toast(WC_TOAST[act] || "Reminder sent to partner");
  renderWcDetail();
});
document.getElementById("wcd-coaching").addEventListener("input", (e) => {
  if (e.target.id === "wcd-coach" && wcState.detail.c) wcState.detail.c.coachDraft = e.target.value;
});
document.getElementById("wcd-call").addEventListener("click", (e) => {
  const jump = e.target.closest("[data-jump]");
  const c = wcState.detail.c;
  if (!jump || !c) return;
  wsState.call.pendingJump = Number(jump.dataset.jump);
  location.hash = `#/wholesale/call/${c.call.id}`;
});
