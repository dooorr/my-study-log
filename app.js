const STORAGE_KEY = "kaoyan_study_logs_v1";
const CUSTOM_CATS_KEY = "kaoyan_custom_categories_v1";
const SUBTASKS_KEY = "kaoyan_subtasks_library_v1";
const TAB_KEY = "kaoyan_active_tab_v1";
const SUBJECT_KEY = "kaoyan_timer_subject_v1";

const STUDY_CATS = [
  { label: "数分", group: "study", primary: true },
  { label: "高代", group: "study", primary: true },
  { label: "英语", group: "study", primary: false },
  { label: "政治", group: "study", primary: false },
];

const LIFE_CATS = [
  { label: "睡觉", group: "life", lifeKind: "sleep" },
  { label: "玩手机", group: "life", lifeKind: "phone" },
];

const LEGACY_SUBJECT_MAP = {
  数学: "数分",
  专业课: "数分",
  英语: "英语",
  政治: "政治",
  其他: "其他",
};

/** @type {string[]} */
let customCategories = [];

/** @type {Record<string, string[]>} */
let subtasksLibrary = {};

/** @type {{ id: string, date: string, subject: string, subtask: string, minutes: number, note: string, source: string }[]} */
let logs = [];

let timerSeconds = 0;
let timerTick = null;
let timerRunning = false;
let timerSubject = "数分";

function getBuiltinLabels() {
  return [...STUDY_CATS, ...LIFE_CATS].map((c) => c.label);
}

function getAllCategories() {
  const builtins = [...STUDY_CATS, ...LIFE_CATS];
  const customs = customCategories.map((label) => ({
    label,
    group: "custom",
    primary: false,
  }));
  return [...builtins, ...customs];
}

function getAllLabels() {
  return getAllCategories().map((c) => c.label);
}

function getCategoryMeta(label) {
  return getAllCategories().find((c) => c.label === label);
}

function loadCustomCategories() {
  try {
    const raw = localStorage.getItem(CUSTOM_CATS_KEY);
    customCategories = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(customCategories)) customCategories = [];
    customCategories = customCategories.filter((s) => typeof s === "string" && s.trim());
  } catch {
    customCategories = [];
  }
}

function saveCustomCategories() {
  localStorage.setItem(CUSTOM_CATS_KEY, JSON.stringify(customCategories));
}

function loadSubtasksLibrary() {
  try {
    const raw = localStorage.getItem(SUBTASKS_KEY);
    subtasksLibrary = raw ? JSON.parse(raw) : {};
    if (typeof subtasksLibrary !== "object" || Array.isArray(subtasksLibrary)) subtasksLibrary = {};
  } catch {
    subtasksLibrary = {};
  }
}

function saveSubtasksLibrary() {
  localStorage.setItem(SUBTASKS_KEY, JSON.stringify(subtasksLibrary));
}

function getSubtasksFor(subject) {
  return subtasksLibrary[subject] || [];
}

function formatEntryTitle(subject, subtask) {
  const st = (subtask || "").trim();
  return st ? `${subject} · ${st}` : subject;
}

function rememberSubtask(subject, subtask) {
  const st = (subtask || "").trim().slice(0, 30);
  if (!st) return;
  const list = getSubtasksFor(subject);
  if (!list.includes(st)) {
    subtasksLibrary[subject] = [st, ...list].slice(0, 20);
    saveSubtasksLibrary();
    renderSubtaskChips();
    updateSubtaskDatalists();
    renderSubtaskPresetList();
  }
}

function migrateLogs() {
  let migrated = false;
  const known = new Set(getAllLabels());
  for (const log of logs) {
    if (log.subtask === undefined) {
      log.subtask = "";
      migrated = true;
    }
    const mapped = LEGACY_SUBJECT_MAP[log.subject];
    if (mapped && mapped !== log.subject) {
      log.subject = mapped;
      migrated = true;
    }
    if (!known.has(log.subject) && log.subject !== "其他") {
      if (!customCategories.includes(log.subject)) {
        customCategories.push(log.subject);
        migrated = true;
      }
    }
    if (log.subtask) rememberSubtask(log.subject, log.subtask);
  }
  if (migrated) saveCustomCategories();
  return migrated;
}

function loadLogs() {
  loadCustomCategories();
  loadSubtasksLibrary();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    logs = raw ? JSON.parse(raw) : [];
    if (migrateLogs()) saveLogs();
  } catch {
    logs = [];
  }
}

function saveLogs() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(logs));
}

function todayStr() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function formatMinutes(m) {
  const h = Math.floor(m / 60);
  const min = m % 60;
  if (h && min) return `${h}h${min}m`;
  if (h) return `${h}h`;
  return `${min}m`;
}

function formatHours(m) {
  return `${(m / 60).toFixed(1)}h`;
}

function uid() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function isMobileLayout() {
  return window.matchMedia("(max-width: 720px)").matches;
}

function isStudyLabel(label) {
  return STUDY_CATS.some((c) => c.label === label);
}

function isLifeLabel(label) {
  return LIFE_CATS.some((c) => c.label === label);
}

function tagClassFor(label) {
  const meta = getCategoryMeta(label);
  if (!meta) return "tag tag-custom";
  if (meta.group === "study") return meta.primary ? "tag" : "tag tag-later";
  if (meta.group === "life") return `tag tag-life tag-life-${meta.lifeKind || "other"}`;
  return "tag tag-custom";
}

function minutesOnDate(date, filterFn) {
  return logs
    .filter((l) => l.date === date && (!filterFn || filterFn(l)))
    .reduce((s, l) => s + l.minutes, 0);
}

function getTimerSubtaskValue() {
  return (document.getElementById("timerSubtask")?.value || "").trim();
}

function updateTimerHint() {
  const st = getTimerSubtaskValue();
  document.getElementById("timerHint").textContent = `当前：${formatEntryTitle(timerSubject, st)}`;
}

function setTimerSubject(label) {
  if (!getAllLabels().includes(label)) return;
  timerSubject = label;
  localStorage.setItem(SUBJECT_KEY, label);
  const sel = document.getElementById("timerSubject");
  if (sel) sel.value = label;
  document.querySelectorAll("#timerChips .chip").forEach((chip) => {
    chip.classList.toggle("active", chip.dataset.subject === label);
  });
  renderSubtaskChips();
  updateSubtaskDatalists();
  updateTimerHint();
}

function renderSubtaskChips() {
  const wrap = document.getElementById("subtaskChips");
  if (!wrap) return;
  const items = getSubtasksFor(timerSubject);
  if (!items.length) {
    wrap.innerHTML = "";
    return;
  }
  wrap.innerHTML = items
    .map(
      (st) =>
        `<button type="button" class="chip chip-subtask" data-subtask="${escapeHtml(st)}">${escapeHtml(st)}</button>`
    )
    .join("");
  wrap.querySelectorAll("[data-subtask]").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.getElementById("timerSubtask").value = btn.getAttribute("data-subtask");
      updateTimerHint();
    });
  });
}

function updateSubtaskDatalists() {
  const timerList = document.getElementById("timerSubtaskList");
  const manualSubject = document.getElementById("manualSubject")?.value || timerSubject;
  const manualList = document.getElementById("manualSubtaskList");
  const timerItems = getSubtasksFor(timerSubject);
  const manualItems = getSubtasksFor(manualSubject);
  if (timerList) timerList.innerHTML = timerItems.map((s) => `<option value="${escapeHtml(s)}">`).join("");
  if (manualList) manualList.innerHTML = manualItems.map((s) => `<option value="${escapeHtml(s)}">`).join("");
}

function fillSubjectSelects() {
  const groups = [
    { title: "学习", items: STUDY_CATS },
    { title: "生活", items: LIFE_CATS },
    { title: "自定义", items: customCategories.map((label) => ({ label, group: "custom" })) },
  ];
  const html = groups
    .filter((g) => g.items.length)
    .map(
      (g) =>
        `<optgroup label="${g.title}">${g.items.map((c) => `<option value="${c.label}">${c.label}</option>`).join("")}</optgroup>`
    )
    .join("");

  for (const id of ["timerSubject", "manualSubject"]) {
    document.getElementById(id).innerHTML = html;
  }
  const saved = localStorage.getItem(SUBJECT_KEY);
  setTimerSubject(getAllLabels().includes(saved) ? saved : "数分");
}

function chipHtml(c) {
  const classes = ["chip"];
  let tag = "";
  if (c.group === "study") {
    classes.push(c.primary ? "primary" : "later");
    tag = c.primary ? "主攻" : "后期";
  } else if (c.group === "life") {
    classes.push("life");
    tag = c.lifeKind === "sleep" ? "休息" : c.lifeKind === "phone" ? "记录" : "";
  } else {
    classes.push("custom");
    tag = "自定义";
  }
  return `<button type="button" class="${classes.join(" ")}" data-subject="${c.label}">
    ${c.label}${tag ? `<span class="chip-tag">${tag}</span>` : ""}
  </button>`;
}

function renderTimerChips() {
  const wrap = document.getElementById("timerChips");
  const parts = [
    `<div class="chip-group"><span class="chip-group-label">学习</span><div class="chip-row">${STUDY_CATS.map(chipHtml).join("")}</div></div>`,
    `<div class="chip-group"><span class="chip-group-label">生活</span><div class="chip-row">${LIFE_CATS.map(chipHtml).join("")}</div></div>`,
  ];
  if (customCategories.length) {
    parts.push(
      `<div class="chip-group"><span class="chip-group-label">自定义</span><div class="chip-row">${customCategories.map((label) => chipHtml({ label, group: "custom" })).join("")}</div></div>`
    );
  }
  wrap.innerHTML = parts.join("");

  wrap.querySelectorAll(".chip").forEach((chip) => {
    chip.addEventListener("click", () => setTimerSubject(chip.dataset.subject));
  });
  setTimerSubject(timerSubject);
}

function renderCustomList() {
  const list = document.getElementById("customCatList");
  if (!list) return;
  if (!customCategories.length) {
    list.innerHTML = `<li class="empty-inline">还没有自定义项，下面添加一个吧</li>`;
    return;
  }
  list.innerHTML = customCategories
    .map(
      (name) => `<li class="custom-cat-item">
        <span>${escapeHtml(name)}</span>
        <button type="button" class="btn ghost sm" data-rm-cat="${escapeHtml(name)}">删</button>
      </li>`
    )
    .join("");

  list.querySelectorAll("[data-rm-cat]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const name = btn.getAttribute("data-rm-cat");
      if (!confirm(`删除自定义「${name}」？已有记录不会删，只是下拉里没了`)) return;
      customCategories = customCategories.filter((c) => c !== name);
      saveCustomCategories();
      fillSubjectSelects();
      renderTimerChips();
      renderCustomList();
      renderAll();
    });
  });
}

function addCustomCategory(name) {
  const label = name.trim().slice(0, 12);
  if (!label) return false;
  if (getAllLabels().includes(label)) {
    alert("这个名字已经有了");
    return false;
  }
  customCategories.push(label);
  saveCustomCategories();
  fillSubjectSelects();
  fillPresetSubjectSelect();
  renderTimerChips();
  renderCustomList();
  return true;
}

function initMobileNav() {
  const tabs = document.querySelectorAll(".bottom-nav .nav-btn");
  const panels = document.querySelectorAll("[data-panel]");

  function applyTab(tab) {
    const name = tab || localStorage.getItem(TAB_KEY) || "timer";
    if (isMobileLayout()) {
      panels.forEach((panel) => {
        panel.classList.toggle("panel-active", panel.dataset.panel === name);
      });
      tabs.forEach((btn) => {
        btn.classList.toggle("active", btn.dataset.tab === name);
      });
      localStorage.setItem(TAB_KEY, name);
    } else {
      panels.forEach((panel) => panel.classList.add("panel-active"));
    }
  }

  tabs.forEach((btn) => {
    btn.addEventListener("click", () => applyTab(btn.dataset.tab));
  });

  window.addEventListener("resize", () => applyTab(localStorage.getItem(TAB_KEY) || "timer"));
  applyTab(localStorage.getItem(TAB_KEY) || "timer");
}

function calcStreak() {
  const studyDates = [...new Set(logs.filter((l) => isStudyLabel(l.subject)).map((l) => l.date))].sort().reverse();
  if (!studyDates.length) return 0;

  let streak = 0;
  let cursor = todayStr();
  const dateSet = new Set(studyDates);

  if (!dateSet.has(cursor)) {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    cursor = yesterday.toISOString().slice(0, 10);
    if (!dateSet.has(cursor)) return 0;
  }

  while (dateSet.has(cursor)) {
    streak += 1;
    const d = new Date(cursor + "T12:00:00");
    d.setDate(d.getDate() - 1);
    cursor = d.toISOString().slice(0, 10);
  }
  return streak;
}

function lastNDays(n) {
  const out = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    out.push(d.toISOString().slice(0, 10));
  }
  return out;
}

function renderWeekChart() {
  const days = lastNDays(7);
  const studyMins = (date) => minutesOnDate(date, (l) => isStudyLabel(l.subject));
  const max = Math.max(...days.map(studyMins), 1);
  const weekMins = days.reduce((s, d) => s + studyMins(d), 0);
  document.getElementById("weekTotal").textContent = `本周学习 ${formatHours(weekMins)}`;

  const labels = ["日", "一", "二", "三", "四", "五", "六"];
  document.getElementById("weekChart").innerHTML = days
    .map((date) => {
      const m = studyMins(date);
      const h = Math.round((m / max) * 110);
      const wd = labels[new Date(date + "T12:00:00").getDay()];
      const isToday = date === todayStr();
      return `<div class="bar-col">
        <span class="hrs">${m ? formatHours(m) : "—"}</span>
        <div class="bar" style="height:${h}px;opacity:${isToday ? 1 : 0.85}"></div>
        <span class="day">${isToday ? "今" : wd}</span>
      </div>`;
    })
    .join("");
}

function renderSubjectBars() {
  const since = new Date();
  since.setDate(since.getDate() - 29);
  const sinceStr = since.toISOString().slice(0, 10);
  const recent = logs.filter((l) => l.date >= sinceStr);

  const totals = Object.fromEntries(getAllLabels().map((s) => [s, 0]));
  for (const l of recent) {
    totals[l.subject] = (totals[l.subject] || 0) + l.minutes;
  }

  const studyRows = STUDY_CATS.map((c) => ({ ...c, minutes: totals[c.label] || 0 }));
  const lifeRows = LIFE_CATS.map((c) => ({ ...c, minutes: totals[c.label] || 0 }));
  const customRows = customCategories.map((label) => ({
    label,
    group: "custom",
    minutes: totals[label] || 0,
  }));

  const renderRows = (rows, primaryClass) => {
    const max = Math.max(...rows.map((r) => r.minutes), 1);
    return rows
      .map((r) => {
        const pct = Math.round((r.minutes / max) * 100);
        const cls = r.primary ? "row primary-subject" : r.group === "life" ? "row life-subject" : "row";
        return `<div class="${cls}">
          <span>${r.label}</span>
          <div class="track"><div class="fill" style="width:${pct}%"></div></div>
          <span>${formatHours(r.minutes)}</span>
        </div>`;
      })
      .join("");
  };

  let html = `<p class="stats-section-title">学习</p>${renderRows(studyRows)}`;
  html += `<p class="stats-section-title">生活</p>${renderRows(lifeRows)}`;
  if (customRows.length) {
    html += `<p class="stats-section-title">自定义</p>${renderRows(customRows)}`;
  }
  document.getElementById("subjectBars").innerHTML = html;
}

function renderSubtaskBars() {
  const el = document.getElementById("subtaskBars");
  if (!el) return;
  const since = new Date();
  since.setDate(since.getDate() - 29);
  const sinceStr = since.toISOString().slice(0, 10);
  const recent = logs.filter((l) => l.date >= sinceStr && isStudyLabel(l.subject) && (l.subtask || "").trim());

  if (!recent.length) {
    el.innerHTML = `<p class="empty">还没有带子任务的学习记录。计时或补录时填「4.2」这类即可。</p>`;
    return;
  }

  const totals = {};
  for (const l of recent) {
    const key = formatEntryTitle(l.subject, l.subtask);
    totals[key] = (totals[key] || 0) + l.minutes;
  }
  const rows = Object.entries(totals).sort((a, b) => b[1] - a[1]).slice(0, 12);
  const max = Math.max(...rows.map((r) => r[1]), 1);

  el.innerHTML = rows
    .map(([label, minutes]) => {
      const pct = Math.round((minutes / max) * 100);
      return `<div class="row subtask-row">
        <span class="subtask-label-col">${escapeHtml(label)}</span>
        <div class="track"><div class="fill" style="width:${pct}%"></div></div>
        <span>${formatHours(minutes)}</span>
      </div>`;
    })
    .join("");
}

function renderSubtaskPresetList() {
  const list = document.getElementById("subtaskPresetList");
  if (!list) return;
  const entries = [];
  for (const [subject, items] of Object.entries(subtasksLibrary)) {
    for (const st of items) entries.push({ subject, st });
  }
  if (!entries.length) {
    list.innerHTML = `<li class="empty-inline">暂无预设，上面添加或记一次会自动保存</li>`;
    return;
  }
  list.innerHTML = entries
    .map(
      ({ subject, st }) => `<li class="custom-cat-item">
        <span>${escapeHtml(formatEntryTitle(subject, st))}</span>
        <button type="button" class="btn ghost sm" data-rm-preset="${escapeHtml(subject)}|||${escapeHtml(st)}">删</button>
      </li>`
    )
    .join("");

  list.querySelectorAll("[data-rm-preset]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const [subject, st] = btn.getAttribute("data-rm-preset").split("|||");
      subtasksLibrary[subject] = getSubtasksFor(subject).filter((x) => x !== st);
      if (!subtasksLibrary[subject].length) delete subtasksLibrary[subject];
      saveSubtasksLibrary();
      renderSubtaskChips();
      updateSubtaskDatalists();
      renderSubtaskPresetList();
    });
  });
}

function fillPresetSubjectSelect() {
  const sel = document.getElementById("presetSubject");
  if (!sel) return;
  const studyAndCustom = [...STUDY_CATS, ...customCategories.map((label) => ({ label }))];
  sel.innerHTML = studyAndCustom.map((c) => `<option value="${c.label}">${c.label}</option>`).join("");
}

function renderTodaySummary() {
  const today = todayStr();
  const study = minutesOnDate(today, (l) => isStudyLabel(l.subject));
  const sleep = minutesOnDate(today, (l) => l.subject === "睡觉");
  const phone = minutesOnDate(today, (l) => l.subject === "玩手机");

  document.getElementById("todayStudy").textContent = formatHours(study);
  document.getElementById("todaySleep").textContent = sleep ? formatHours(sleep) : "—";
  document.getElementById("todayPhone").textContent = phone ? formatHours(phone) : "—";
  document.getElementById("todayTotal").textContent = formatHours(study);
}

function renderTodayList() {
  const today = todayStr();
  const items = logs.filter((l) => l.date === today).sort((a, b) => b.id.localeCompare(a.id));
  const list = document.getElementById("todayList");
  const empty = document.getElementById("todayEmpty");

  renderTodaySummary();

  if (!items.length) {
    list.innerHTML = "";
    empty.style.display = "block";
    return;
  }
  empty.style.display = "none";
  list.innerHTML = items
    .map(
      (l) => `<li class="log-item">
        <div>
          <span class="${tagClassFor(l.subject)}">${escapeHtml(formatEntryTitle(l.subject, l.subtask))}</span>
          <strong>${formatMinutes(l.minutes)}</strong>
          ${l.note ? `<span class="log-meta"> · ${escapeHtml(l.note)}</span>` : ""}
        </div>
        <div>
          <span class="log-meta">${l.source === "timer" ? "计时" : l.source === "sleep" ? "睡眠" : "手动"}</span>
          <button type="button" class="btn ghost sm" data-del="${l.id}">删</button>
        </div>
      </li>`
    )
    .join("");

  list.querySelectorAll("[data-del]").forEach((btn) => {
    btn.addEventListener("click", () => {
      logs = logs.filter((l) => l.id !== btn.getAttribute("data-del"));
      saveLogs();
      renderAll();
    });
  });
}

function escapeHtml(s) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function renderAll() {
  document.getElementById("streakDays").textContent = `${calcStreak()} 天`;
  renderWeekChart();
  renderSubjectBars();
  renderSubtaskBars();
  renderTodayList();
}

function addLog({ date, subject, subtask, minutes, note, source }) {
  if (minutes < 1) return;
  const st = (subtask || "").trim().slice(0, 30);
  logs.push({
    id: uid(),
    date,
    subject,
    subtask: st,
    minutes: Math.round(minutes),
    note: note || "",
    source: source || "manual",
  });
  rememberSubtask(subject, st);
  saveLogs();
  renderAll();
}

function calcSleepMinutes(wakeDate, bedTime, wakeTime) {
  const wake = new Date(`${wakeDate}T${wakeTime}`);
  let bed = new Date(`${wakeDate}T${bedTime}`);
  if (bed >= wake) bed.setDate(bed.getDate() - 1);
  const mins = Math.round((wake - bed) / 60000);
  return mins > 0 && mins <= 16 * 60 ? mins : 0;
}

function formatTimer(sec) {
  const h = String(Math.floor(sec / 3600)).padStart(2, "0");
  const m = String(Math.floor((sec % 3600) / 60)).padStart(2, "0");
  const s = String(sec % 60).padStart(2, "0");
  return `${h}:${m}:${s}`;
}

function setTimerUI() {
  document.getElementById("timerDisplay").textContent = formatTimer(timerSeconds);
  document.getElementById("timerStart").disabled = timerRunning;
  document.getElementById("timerPause").disabled = !timerRunning && timerSeconds === 0;
  document.getElementById("timerStop").disabled = timerSeconds === 0 && !timerRunning;
  document.getElementById("timerPause").textContent = timerRunning ? "暂停" : "继续";
}

function startTimer() {
  if (timerRunning) return;
  timerRunning = true;
  timerSubject = document.getElementById("timerSubject").value;
  setTimerSubject(timerSubject);
  timerTick = setInterval(() => {
    timerSeconds += 1;
    setTimerUI();
  }, 1000);
  setTimerUI();
}

function pauseTimer() {
  if (!timerRunning && timerSeconds > 0) {
    startTimer();
    return;
  }
  if (!timerRunning) return;
  timerRunning = false;
  clearInterval(timerTick);
  timerTick = null;
  setTimerUI();
}

function stopTimer() {
  timerRunning = false;
  clearInterval(timerTick);
  timerTick = null;
  if (timerSeconds >= 30) {
    addLog({
      date: todayStr(),
      subject: timerSubject,
      subtask: getTimerSubtaskValue(),
      minutes: Math.max(1, Math.round(timerSeconds / 60)),
      note: "",
      source: "timer",
    });
  }
  timerSeconds = 0;
  setTimerUI();
}

function initManualForm() {
  document.getElementById("manualDate").value = todayStr();
  document.getElementById("manualSubject").addEventListener("change", updateSubtaskDatalists);
  document.getElementById("manualForm").addEventListener("submit", (e) => {
    e.preventDefault();
    addLog({
      date: document.getElementById("manualDate").value,
      subject: document.getElementById("manualSubject").value,
      subtask: document.getElementById("manualSubtask").value.trim(),
      minutes: Number(document.getElementById("manualMinutes").value),
      note: document.getElementById("manualNote").value.trim(),
      source: "manual",
    });
    document.getElementById("manualSubtask").value = "";
    document.getElementById("manualNote").value = "";
  });
}

function initSubtaskPresetForm() {
  fillPresetSubjectSelect();
  document.getElementById("subtaskPresetForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const subject = document.getElementById("presetSubject").value;
    const name = document.getElementById("presetSubtaskName").value.trim();
    if (!name) return;
    rememberSubtask(subject, name);
    document.getElementById("presetSubtaskName").value = "";
    renderSubtaskPresetList();
  });
}

function initTimerSubtaskInput() {
  const input = document.getElementById("timerSubtask");
  if (!input) return;
  input.addEventListener("input", updateTimerHint);
}

function initSleepForm() {
  const wakeDate = document.getElementById("sleepWakeDate");
  wakeDate.value = todayStr();
  document.getElementById("sleepForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const bed = document.getElementById("sleepBedTime").value;
    const wake = document.getElementById("sleepWakeTime").value;
    const date = wakeDate.value;
    const minutes = calcSleepMinutes(date, bed, wake);
    if (!minutes) {
      alert("时间不对，检查一下入睡和起床时间");
      return;
    }
    addLog({
      date,
      subject: "睡觉",
      minutes,
      note: `${bed} → ${wake}`,
      source: "sleep",
    });
  });
}

function initCustomForm() {
  document.getElementById("customCatForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const input = document.getElementById("customCatName");
    if (addCustomCategory(input.value)) {
      input.value = "";
      setTimerSubject(customCategories[customCategories.length - 1]);
    }
  });
}

function initTimer() {
  document.getElementById("timerSubject").addEventListener("change", (e) => {
    setTimerSubject(e.target.value);
  });
  document.getElementById("timerStart").addEventListener("click", startTimer);
  document.getElementById("timerPause").addEventListener("click", pauseTimer);
  document.getElementById("timerStop").addEventListener("click", stopTimer);
  setTimerUI();
}

function initTools() {
  document.getElementById("clearToday").addEventListener("click", () => {
    if (!confirm("确定删除今天的全部记录？")) return;
    logs = logs.filter((l) => l.date !== todayStr());
    saveLogs();
    renderAll();
  });

  document.getElementById("exportBtn").addEventListener("click", () => {
    const payload = { version: 3, logs, customCategories, subtasksLibrary };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `kaoyan-study-backup-${todayStr()}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
  });

  document.getElementById("importFile").addEventListener("change", (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result);
        if (Array.isArray(data)) {
          logs = data;
        } else if (data && Array.isArray(data.logs)) {
          logs = data.logs;
          if (Array.isArray(data.customCategories)) {
            customCategories = data.customCategories;
            saveCustomCategories();
          }
          if (data.subtasksLibrary && typeof data.subtasksLibrary === "object") {
            subtasksLibrary = data.subtasksLibrary;
            saveSubtasksLibrary();
          }
        } else {
          throw new Error("invalid");
        }
        migrateLogs();
        saveLogs();
        fillSubjectSelects();
        fillPresetSubjectSelect();
        renderTimerChips();
        renderCustomList();
        renderSubtaskPresetList();
        updateSubtaskDatalists();
        renderAll();
        alert("导入成功");
      } catch {
        alert("文件格式不对");
      }
      e.target.value = "";
    };
    reader.readAsText(file);
  });
}

loadLogs();
fillSubjectSelects();
fillPresetSubjectSelect();
renderTimerChips();
renderCustomList();
renderSubtaskPresetList();
updateSubtaskDatalists();
initMobileNav();
initManualForm();
initSleepForm();
initCustomForm();
initSubtaskPresetForm();
initTimerSubtaskInput();
initTimer();
initTools();
renderAll();
