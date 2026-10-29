// ---------- Guided walkthrough ----------
// A self-running, captioned tour of the prototype (Retail, SetOps, Wholesale) meant to be screen-recorded.
// Start it from the "Play walkthrough" menu (Retail, SetOps, Wholesale or all) or by opening index.html?tour=retail|setops|wholesale
// (index.html?tour plays everything). Controls: Space = pause / play,
// Left / Right = previous / next step, Esc = close. Loaded after app.js and reuses its globals (sr, srGo, viewLead, ...).
// Steps marked `idea` describe stitching ideas that are not built yet.
(() => {
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const q = (s) => document.querySelector(s);
  const cardOf = (sel) => () => {
    const el = q(sel);
    return el && el.closest(".card");
  };

  // The customer used for every Retail demo step: a generated customer with three or more calls.
  let demo = null;
  const demoCustomer = () => {
    if (!demo) {
      const all = [...SR_CUSTOMERS.values()];
      demo = all.find((c) => /^C/.test(c.cid) && c.calls.length >= 3) || all[0];
    }
    return demo;
  };

  const go = async (hash) => {
    if ((location.hash || "#/") === hash) return;
    location.hash = hash;
    await sleep(200);
  };

  const refreshDropdowns = () => dropdownPainters.forEach((p) => p());

  function resetSearch() {
    sr.sections = new Set();
    sr.secOpen = false;
    srClearAll();
    Object.assign(sr, { view: SR_VIEWS[0], hl: false, page: 1, sort: { key: "date", dir: "desc" } });
    srSetPanel(false);
    refreshDropdowns();
  }

  async function toDashboard() {
    await go("#/");
    if (state.role !== "UM") setRole("UM");
  }

  async function toSM() {
    await go("#/");
    if (state.role !== "SM") setRole("SM");
    await sleep(100);
  }

  async function toLead() {
    await go("#/calls");
    sr.hl = false;
    sr.view = SR_VIEWS[0];
    viewLead(demoCustomer().leadNo);
    refreshDropdowns();
    await sleep(150);
  }

  async function toCall() {
    const calls = demoCustomer().calls;
    const last = calls[calls.length - 1];
    sr.view = SR_VIEWS[0];
    sr.hl = false;
    await go(`#/agent/${last.agentSlug}/call/${last.lead}`);
    await sleep(100);
  }

  async function typePhone(stale, instant) {
    const input = q('#sg-fields input[data-sf="phone"]');
    const text = demoCustomer().phone;
    input.value = "";
    for (const ch of text) {
      if (stale()) return;
      input.value += ch;
      input.dispatchEvent(new Event("input", { bubbles: true }));
      if (!instant) await sleep(70);
    }
  }

  async function wsTab(id, tab) {
    const btn = q(`${id} button[data-tab="${tab}"]`);
    if (btn && btn.getAttribute("aria-pressed") !== "true") btn.click();
    await sleep(100);
  }

  const ALL_STEPS = [
    {
      area: "Retail",
      title: "Simple search beside the filters",
      text: "One search bar finds calls by lead ID, agent, FDR ID, date, phone, address, email or name. The type of value is detected automatically. The filter button at the far right opens Advanced filters.",      target: "#gs",
      run: async () => {
        await toDashboard();
        resetSearch();
      },
    },
    {
      area: "Retail",
      title: "Advanced filters: tick what to filter by",
      text: "The filter button opens a panel that slides in from the right and scrolls. Tick a category and its options appear right beneath it. By field takes phone, address, Lead ID, FDR ID, email or name. Commas allow several values; Any matches any value, All needs a match in every field filled in. Update results applies your choices; Cancel closes without applying.",
      target: "#sr-panel",
      hold: 1500,
      run: async (stale) => {
        await toDashboard();
        sr.sections = new Set();
        srClearAll();
        srSetPanel(true);
        await sleep(600);
        srSecSet("fields", true);
        await typePhone(stale);
      },
    },
    {
      area: "Retail",
      title: "More filter sections",
      text: "Call date (From and To), time of day, call type (Initial or Follow-up), DPR outcome, lead source, opportunity type, ABI bucket, UTM and behavior tags. Call duration and eligible debt take a range.",
      target: "#sr-panel",
      run: async (stale) => {
        await toDashboard();
        srSetPanel(true);
        ["date", "outcome", "tags"].forEach((k) => srSecSet(k, true));
        if (!q('#sg-fields input[data-sf="phone"]').value && !sr.tokens.length) await typePhone(stale, true);
      },
    },
    {
      area: "Retail",
      title: "One phone number, every call",
      text: "Searching by phone returns all of that customer's calls, even when different agents took them. Results show who, when, how long, lead source, opportunity type and behavior tags.",
      target: cardOf("#sr-table"),
      run: async (stale) => {
        await toDashboard();
        srClearAll();
        srSetPanel(true);
        await typePhone(stale, true);
        srGo();
        await sleep(250);
      },
    },
    {
      area: "Retail",
      title: "Performance Metrics view",
      text: "The view menu switches between Call Details, Call Stage Performance and Performance Metrics. Metrics adds handle time, LPA, CoPA, payout and eligible debt, with the top and bottom 10% highlighted.",
      target: cardOf("#sr-table"),
      run: async (stale) => {
        await toDashboard();
        srClearAll();
        srSetPanel(true);
        await typePhone(stale, true);
        srGo();
        Object.assign(sr, { view: METRICS_VIEW, hl: true, page: 1, sort: { key: "date", dir: "asc" } });
        renderSearch();
        refreshDropdowns();
        await sleep(150);
      },
    },
    {
      area: "Retail",
      title: "One lead, one view",
      text: "Clicking a Lead ID or a touchpoint count opens that lead. The header shows the lead, customer and phone (ANI). The summary shows the FDR ID and Salesforce ID that link the calls, how many touchpoints over how many days, the score change and the latest outcome.",
      target: "#sr-lead",
      run: toLead,
    },
    {
      area: "Retail",
      title: "Every touchpoint, scored",
      text: "Newest touchpoint first. Each shows when it happened, which agent took it, the call ID and type, a score for each playbook, the call average with a bar of step ratings, and the outcome.",
      target: "#sr-j-list",
      run: toLead,
    },
    {
      area: "Retail",
      title: "Dig into coaching detail as needed",
      text: "Open a touchpoint to see the areas to coach: each Poor or Fair step with an AI coaching tip and a UM note. The edit button adds your own note to send to the agent. Handle time, LPA, CoPA, payout, eligible debt and behavior tags sit above. One button opens the full call scoring and transcript.",
      target: ".tl-item.open .tl-card",
      run: toLead,
    },
    {
      area: "Retail",
      title: "Review calls back to back",
      text: "Call Details shows which touchpoint you are on. The arrows step to the previous or next call for the lead without going back to the list. The Lead ID link returns to the journey.",
      target: "#cd-tp",
      run: async () => {
        await toLead();
        await toCall();
      },
    },
    {
      area: "Retail",
      title: "Next idea: tags on each touchpoint",
      text: "Show behavior tags on the collapsed row, and split call types further (intro call, pitch, follow-up) so coaching can see which behaviors repeat across a customer's calls.",
      target: "#sr-j-list",
      idea: true,
      run: toLead,
    },
    {
      area: "Retail",
      title: "Team Performance (SM view)",
      text: "The SM view ranks teams by call score, close rate, connect-to-close, ACE and handle time. Team names open that team's overview.",
      target: cardOf("#agents-table"),
      run: toSM,
    },
    {
      area: "Retail",
      title: "Next idea: tag breakdown and payout roll-up",
      text: "Add a behavior-tag breakdown per agent and team so tags drive coaching, plus payout totals by agent, team and lead source.",
      target: cardOf("#agents-table"),
      idea: true,
      run: toSM,
    },
    {
      area: "SetOps",
      title: "SetOps dashboard",
      text: "Workgroups, creditors, call stages and agents in one view, with filters for workgroup, creditor, tag, stage, performance level and date.",
      target: "#sod-kpis",
      run: async () => {
        await go("#/setops");
        await sleep(100);
      },
    },
    {
      area: "SetOps",
      title: "Agent Performance: your team's matrix",
      text: "Every agent in your hierarchy by call stage, with the team average underneath. A supervisor sees their own team; a manager also sees each agent's supervisor. Select a rating to see the calls behind it.",
      target: cardOf("#sod-agents"),
      run: async () => {
        await go("#/setops");
        await sleep(100);
      },
    },
    {
      area: "SetOps",
      title: "Creditors",
      text: "Creditor performance with key metrics, a performance table and a breakdown by call stage.",
      target: cardOf("#socr-table"),
      run: async () => go("#/setops/creditors"),
    },
    {
      area: "Wholesale",
      title: "Wholesale dashboard",
      text: "Partner pass rates, category performance, top and bottom partners, and fail rates by compliance category.",
      target: cardOf("#wsd-partners"),
      run: async () => go("#/wholesale"),
    },
    {
      area: "Wholesale",
      title: "Partner overview: compact call status",
      text: "Recent Calls shows pass or fail as an icon only. Hover the icon for the text, which keeps the table compact.",
      target: cardOf("#wp-calls"),
      run: async () => go("#/wholesale/partner/symple"),
    },
    {
      area: "Wholesale",
      title: "New: Agent Analysis",
      text: "Agents ranked by coaching priority across partners, with filters for partner and priority.",
      target: cardOf("#wan-a-table"),
      run: async () => {
        await go("#/wholesale/analysis");
        await wsTab("#wan-tabs", "analysis");
      },
    },
    {
      area: "Wholesale",
      title: "Top failing agents by category",
      text: "Pick a category to see who failed the most calls in it, and the coaching focus for each agent.",
      target: cardOf("#wan-top-table"),
      run: async () => {
        await go("#/wholesale/analysis");
        await wsTab("#wan-tabs", "analysis");
      },
    },
    {
      area: "Wholesale",
      title: "Statement Audit",
      text: "The second view lists the individual statements behind each failure, filterable by result and category.",
      target: cardOf("#wan-s-table"),
      run: async () => {
        await go("#/wholesale/analysis");
        await wsTab("#wan-tabs", "audit");
      },
    },
    {
      area: "Wholesale",
      title: "Complaints tracker",
      text: "Complaints by tier, status and partner, with a monthly view by partner and a detail page for each complaint.",
      target: cardOf("#wcl-table"),
      run: async () => go("#/wholesale/complaints"),
    },
    {
      area: "Retail",
      title: "Stitching: what is next",
      text: "Built: lookup by any identifier, one lead journey with per-touchpoint scoring and coaching detail, and the metrics view. Ideas: tags per touchpoint, finer call types, tag breakdown, payout roll-up. Open question: overlap with SCai.",
      target: null,
      idea: true,
      run: async () => {
        await toDashboard();
        resetSearch();
      },
    },
  ];

  // The steps of the walkthrough being played. Each step's `area` decides which walkthrough it belongs to.
  let STEPS = ALL_STEPS;
  const WALKTHROUGHS = [
    { key: "retail", label: "Retail", area: "Retail" },
    { key: "setops", label: "SetOps", area: "SetOps" },
    { key: "wholesale", label: "Wholesale", area: "Wholesale" },
    { key: "all", label: "All three lines", area: null },
  ];
  const stepsFor = (w) => (w.area ? ALL_STEPS.filter((s) => s.area === w.area) : ALL_STEPS);

  // ---------- UI ----------
  const chevron = `<svg width="16" height="16" aria-hidden="true"><use href="#i-chevron"/></svg>`;
  const playIcon = (id) => `<svg width="16" height="16" aria-hidden="true"><use href="#${id}"/></svg>`;

  const launcher = document.createElement("div");
  launcher.className = "tour-launcher";
  launcher.innerHTML = `
    <div class="tour-menu" id="tour-menu" role="menu" aria-label="Choose a walkthrough" hidden>
      ${WALKTHROUGHS.map((w) => `<button type="button" role="menuitem" data-w="${w.key}"><span>${w.label}</span><small>${stepsFor(w).length} steps</small></button>`).join("")}
    </div>
    <button class="tour-launch" id="tour-launch" type="button" aria-haspopup="menu" aria-expanded="false" aria-controls="tour-menu">Play walkthrough${chevron}</button>`;

  const ring = document.createElement("div");
  ring.className = "tour-ring";
  ring.hidden = true;

  const cardEl = document.createElement("section");
  cardEl.className = "tour-card";
  cardEl.setAttribute("role", "dialog");
  cardEl.setAttribute("aria-label", "Walkthrough");
  cardEl.hidden = true;
  cardEl.innerHTML = `
    <div class="tour-meta"><span class="tour-chip" id="tour-area"></span><span class="tour-idea" id="tour-idea" hidden>Next idea, not built</span><span class="tour-count" id="tour-count"></span></div>
    <h2 id="tour-title"></h2>
    <p id="tour-text" aria-live="polite"></p>
    <div class="tour-bar"><i id="tour-fill"></i></div>
    <div class="tour-actions">
      <button class="tour-btn" id="tour-prev" type="button" aria-label="Previous step"><span class="tour-prev">${chevron}</span>Back</button>
      <button class="tour-btn tour-primary" id="tour-play" type="button"></button>
      <button class="tour-btn" id="tour-next" type="button" aria-label="Next step">Next<span class="tour-next">${chevron}</span></button>
      <button class="tour-btn tour-close" id="tour-close" type="button" aria-label="Close walkthrough">Close</button>
    </div>`;

  document.body.append(launcher, ring, cardEl);

  const el = (id) => document.getElementById(id);
  let index = 0;
  let runId = 0;
  let timer = null;
  let playing = false;
  let active = false;

  const holdFor = (s) => Math.min(11000, 4500 + s.text.length * 30 + (s.hold || 0));

  function paintPlay() {
    const b = el("tour-play");
    b.innerHTML = `${playIcon(playing ? "i-pause" : "i-play")}${playing ? "Pause" : "Play"}`;
    b.setAttribute("aria-label", playing ? "Pause walkthrough" : "Play walkthrough");
  }

  function paintCard(s) {
    el("tour-area").textContent = s.area;
    el("tour-idea").hidden = !s.idea;
    el("tour-count").textContent = `${index + 1} / ${STEPS.length}`;
    el("tour-title").textContent = s.title;
    el("tour-text").textContent = s.text;
    el("tour-fill").style.width = `${((index + 1) / STEPS.length) * 100}%`;
    el("tour-prev").disabled = index === 0;
    el("tour-next").disabled = index === STEPS.length - 1;
    paintPlay();
  }

  const targetEl = (s) => {
    const t = typeof s.target === "function" ? s.target() : s.target ? q(s.target) : null;
    if (!t) return null;
    const r = t.getBoundingClientRect();
    return r.width > 0 && r.height > 0 ? t : null;
  };

  const overlaps = (a, b) => a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top;

  // Positions the ring over the step's target, and moves the caption to the left side if it would cover the target.
  function update() {
    if (!active) return;
    const t = targetEl(STEPS[index]);
    ring.hidden = !t;
    cardEl.classList.remove("left");
    if (!t) return;
    const r = t.getBoundingClientRect();
    const pad = 4;
    const top = Math.max(r.top - pad, 8);
    const left = Math.max(r.left - pad, 8);
    const bottom = Math.min(r.bottom + pad, window.innerHeight - 8);
    const right = Math.min(r.right + pad, window.innerWidth - 8);
    Object.assign(ring.style, { top: `${top}px`, left: `${left}px`, width: `${Math.max(0, right - left)}px`, height: `${Math.max(0, bottom - top)}px` });
    const c = cardEl.getBoundingClientRect();
    if (overlaps({ left, right, top, bottom }, c)) cardEl.classList.add("left");
  }

  function reveal(t) {
    const r = t.getBoundingClientRect();
    if (r.top < 96 || r.bottom > window.innerHeight - 24 || r.height > window.innerHeight - 200) {
      window.scrollTo({ top: Math.max(0, r.top + window.scrollY - 96), behavior: "smooth" });
    }
  }

  function schedule(id, ms) {
    clearTimeout(timer);
    timer = setTimeout(() => {
      if (id !== runId || !playing) return;
      if (index < STEPS.length - 1) show(index + 1);
      else {
        playing = false;
        paintPlay();
      }
    }, ms);
  }

  async function show(n) {
    const id = ++runId;
    clearTimeout(timer);
    index = Math.max(0, Math.min(STEPS.length - 1, n));
    const s = STEPS[index];
    paintCard(s);
    ring.hidden = true;
    const stale = () => id !== runId || !active;
    if (s.run) await s.run(stale);
    if (stale()) return;
    await sleep(250);
    if (stale()) return;
    const t = targetEl(s);
    if (t) reveal(t);
    update();
    if (playing) schedule(id, holdFor(s));
  }

  const launchBtn = el("tour-launch");
  const menu = el("tour-menu");
  function setMenu(open) {
    menu.hidden = !open;
    launchBtn.setAttribute("aria-expanded", String(open));
  }

  async function start(w = WALKTHROUGHS[3]) {
    if (active) return;
    setMenu(false);
    STEPS = stepsFor(w);
    active = true;
    playing = true;
    document.body.classList.add("tour-on");
    cardEl.hidden = false;
    show(0);
  }

  async function close() {
    active = false;
    playing = false;
    runId += 1;
    clearTimeout(timer);
    document.body.classList.remove("tour-on");
    cardEl.hidden = true;
    ring.hidden = true;
    resetSearch();
    await toDashboard();
    window.scrollTo(0, 0);
  }

  function toggle() {
    playing = !playing;
    paintPlay();
    if (playing) schedule(runId, 2500);
    else clearTimeout(timer);
  }

  launchBtn.addEventListener("click", () => setMenu(menu.hidden));
  menu.addEventListener("click", (e) => {
    const b = e.target.closest("button[data-w]");
    if (b) start(WALKTHROUGHS.find((w) => w.key === b.dataset.w));
  });
  document.addEventListener("click", (e) => {
    if (!menu.hidden && !launcher.contains(e.target)) setMenu(false);
  });
  el("tour-close").addEventListener("click", close);
  el("tour-play").addEventListener("click", toggle);
  el("tour-prev").addEventListener("click", () => show(index - 1));
  el("tour-next").addEventListener("click", () => show(index + 1));
  window.addEventListener("scroll", update, { passive: true });
  window.addEventListener("resize", update);
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !menu.hidden) {
      setMenu(false);
      launchBtn.focus();
      return;
    }
    if (!active || e.target.closest("input, textarea")) return;
    if (e.key === "Escape") close();
    else if (e.key === "ArrowRight") show(index + 1);
    else if (e.key === "ArrowLeft") show(index - 1);
    else if (e.key === " " && !e.target.closest("button")) {
      e.preventDefault();
      toggle();
    }
  });

  const params = new URLSearchParams(location.search);
  if (params.has("tour")) {
    const w = WALKTHROUGHS.find((x) => x.key === params.get("tour").toLowerCase()) || WALKTHROUGHS[3];
    setTimeout(() => start(w), 600);
  }
})();
