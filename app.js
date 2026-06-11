const STORAGE_KEY = "kaoyan_study_logs_v1";
const CUSTOM_CATS_KEY = "kaoyan_custom_categories_v1";
const SUBTASKS_KEY = "kaoyan_subtasks_library_v1";
const TAB_KEY = "kaoyan_active_tab_v1";
const SUBJECT_KEY = "kaoyan_timer_subject_v1";
const PIE_RANGE_KEY = "kaoyan_pie_range_v1";
const DAILY_GOAL_KEY = "kaoyan_daily_goal_v1";
const TIMER_MODE_KEY = "kaoyan_timer_mode_v1";
const POMODORO_WORK_KEY = "kaoyan_pomodoro_work_v1";
const POMODORO_BREAK_KEY = "kaoyan_pomodoro_break_v1";
const THEME_KEY = "kaoyan_theme_v1";

const DEFAULT_DAILY_GOAL_HOURS = 8;

const PIE_COLORS = {
  数分: "#0d6e6e",
  高代: "#14a3a3",
  英语: "#94a3b8",
  政治: "#78716c",
  学习: "#0d6e6e",
  睡觉: "#6366f1",
  玩手机: "#d97706",
  其他: "#a8a29e",
};

const SUBJECT_EMOJI = {
  数分: "📐",
  高代: "🔢",
  英语: "📖",
  政治: "📰",
  睡觉: "😴",
  玩手机: "📱",
};

const ENCOURAGE = {
  morning: [
    "☀️ 早上好，先开一数分吧",
    "🌅 一日之计在于晨",
    "📐 数分一道题，手感就来了",
  ],
  afternoon: [
    "📚 下午适合啃高代",
    "💪 午睡醒了，继续冲",
    "🎯 再专注一小时",
  ],
  evening: [
    "🌙 晚上复盘黄金时间",
    "✨ 今天最后再收一点",
    "📖 睡前记几个单词也好",
  ],
  night: [
    "😴 别熬太晚，明天再战",
    "🌃 该收工了，休息也是备考",
  ],
  goalNear: [
    "🔥 就差一点，冲完收工",
    "⚡ 临门一脚，稳住",
  ],
  goalDone: [
    "🎉 今日目标达成！",
    "🏆 收工！明天继续数分高代",
    "✨ 你今天很卖力",
  ],
  streak: [
    "🔥 连续打卡，势头正好",
    "📈 别断档，习惯在养成",
  ],
  empty: [
    "🌱 点「开始」开启今天第一笔",
    "⏱ 还没动？先计时 25 分钟",
    "📐 数分 4.2 在等你",
  ],
  afterLog: [
    "✅ 记下了，继续保持",
    "👍 又完成一段，不错",
    "💪 专注的一小步",
    "🎯 进度 +1",
  ],
};

let pieRangeDays = 30;
/** @type {number} 每日学习目标（分钟） */
let dailyGoalMinutes = DEFAULT_DAILY_GOAL_HOURS * 60;

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
let timerMode = "normal";
let pomodoroPhase = "idle";
let pomodoroWorkMin = 25;
let pomodoroBreakMin = 5;
let pomodoroPhaseTotal = 0;
let goalWasComplete = false;
let calendarYear = new Date().getFullYear();
let calendarMonth = new Date().getMonth();
let selectedCalDate = "";

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

function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function subjectEmoji(label) {
  if (SUBJECT_EMOJI[label]) return SUBJECT_EMOJI[label];
  if (/睡|眠/.test(label)) return "😴";
  if (/手机|玩|刷/.test(label)) return "📱";
  if (/运|跑|健身|锻炼/.test(label)) return "🏃";
  if (/吃|饭|餐/.test(label)) return "🍱";
  return "✨";
}

function formatEntryDisplay(subject, subtask) {
  return `${subjectEmoji(subject)} ${formatEntryTitle(subject, subtask)}`;
}

function timeOfDayPool() {
  const h = new Date().getHours();
  if (h < 6) return ENCOURAGE.night;
  if (h < 12) return ENCOURAGE.morning;
  if (h < 18) return ENCOURAGE.afternoon;
  if (h < 22) return ENCOURAGE.evening;
  return ENCOURAGE.night;
}

function buildEncouragement() {
  const today = todayStr();
  const study = minutesOnDate(today, (l) => isStudyLabel(l.subject));
  const goal = dailyGoalMinutes;
  const remain = goal - study;
  const streak = calcStreak();
  const hasTodayLogs = logs.some((l) => l.date === today);

  if (study >= goal) return pickRandom(ENCOURAGE.goalDone);
  if (remain > 0 && remain <= 60) return pickRandom(ENCOURAGE.goalNear);
  if (streak >= 3) return `${pickRandom(ENCOURAGE.streak)}（已连续 ${streak} 天）`;
  if (!hasTodayLogs) return pickRandom(ENCOURAGE.empty);
  return pickRandom(timeOfDayPool());
}

function renderEncouragement() {
  const el = document.getElementById("encourageLine");
  if (el) el.textContent = buildEncouragement();
}

function showToast(msg, ms = 2600) {
  const toast = document.getElementById("toast");
  if (!toast || !msg) return;
  toast.textContent = msg;
  toast.classList.add("show");
  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => toast.classList.remove("show"), ms);
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

function loadDailyGoal() {
  const raw = localStorage.getItem(DAILY_GOAL_KEY);
  const hours = raw ? Number(raw) : DEFAULT_DAILY_GOAL_HOURS;
  if (hours >= 1 && hours <= 16) {
    dailyGoalMinutes = Math.round(hours * 60);
  } else {
    dailyGoalMinutes = DEFAULT_DAILY_GOAL_HOURS * 60;
  }
}

function saveDailyGoal(hours) {
  const h = Math.min(16, Math.max(1, hours));
  dailyGoalMinutes = Math.round(h * 60);
  localStorage.setItem(DAILY_GOAL_KEY, String(h));
  renderDailyGoal();
}

function renderDailyGoal() {
  const nums = document.getElementById("goalNums");
  const fill = document.getElementById("goalFill");
  const hint = document.getElementById("goalHint");
  const banner = document.getElementById("dailyGoalBanner");
  if (!nums || !fill || !hint) return;

  const study = minutesOnDate(todayStr(), (l) => isStudyLabel(l.subject));
  const goal = dailyGoalMinutes;
  const pct = goal > 0 ? Math.min(100, Math.round((study / goal) * 100)) : 0;
  const goalH = formatHours(goal);
  const studyH = formatHours(study);

  nums.textContent = `${studyH} / ${goalH}`;
  fill.style.width = `${pct}%`;
  fill.classList.toggle("complete", study >= goal);

  if (banner) banner.classList.toggle("goal-done", study >= goal);

  const remainMin = goal - study;
  if (study >= goal) {
    hint.textContent = pickRandom([
      "🎉 今日目标已达成！",
      "🏆 达标收工，明天继续",
      "✨ 今天任务完成啦",
    ]);
    if (!goalWasComplete && banner) {
      goalWasComplete = true;
      banner.classList.add("goal-celebrate");
      setTimeout(() => banner.classList.remove("goal-celebrate"), 800);
      pulseElement("timerRingWrap");
      showToast("🎉 今日学习目标达成！");
    }
  } else {
    goalWasComplete = false;
    if (remainMin >= 60) {
      const h = formatHours(remainMin);
      hint.textContent =
        remainMin <= 120
          ? `🔥 还差 ${h}，冲一把`
          : pct >= 50
            ? `📚 还差 ${h}，过半了继续`
            : `🌱 还差 ${h}，开计时走起`;
    } else if (remainMin > 0) {
      const m = formatMinutes(remainMin);
      hint.textContent = remainMin <= 30 ? `⚡ 就差 ${m} 了！` : `🎯 还差 ${m}`;
    } else {
      hint.textContent = "⏱ 开始计时吧";
    }
  }
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
  document.getElementById("timerHint").textContent = `当前：${formatEntryDisplay(timerSubject, st)}`;
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
  const emoji = subjectEmoji(c.label);
  return `<button type="button" class="${classes.join(" ")}" data-subject="${c.label}">
    ${emoji} ${c.label}${tag ? `<span class="chip-tag">${tag}</span>` : ""}
  </button>`;
}

function renderTimerChips() {
  const wrap = document.getElementById("timerChips");
  const parts = [
    `<div class="chip-group"><span class="chip-group-label">📖 学习</span><div class="chip-row">${STUDY_CATS.map(chipHtml).join("")}</div></div>`,
    `<div class="chip-group"><span class="chip-group-label">🏠 生活</span><div class="chip-row">${LIFE_CATS.map(chipHtml).join("")}</div></div>`,
  ];
  if (customCategories.length) {
    parts.push(
      `<div class="chip-group"><span class="chip-group-label">✨ 自定义</span><div class="chip-row">${customCategories.map((label) => chipHtml({ label, group: "custom" })).join("")}</div></div>`
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

function sinceStrForRange(days) {
  const since = new Date();
  since.setDate(since.getDate() - (days - 1));
  return since.toISOString().slice(0, 10);
}

function colorForSubject(label) {
  return PIE_COLORS[label] || "#8b5cf6";
}

function buildPieHtml(title, slices) {
  const data = slices.filter((s) => s.minutes > 0);
  const total = data.reduce((s, x) => s + x.minutes, 0);
  if (!total) {
    return `<div class="pie-card">
      <h3 class="pie-title">${title}</h3>
      <div class="pie-empty">暂无数据</div>
    </div>`;
  }

  let acc = 0;
  const stops = data
    .map((s) => {
      const pct = (s.minutes / total) * 100;
      const start = acc;
      acc += pct;
      return `${s.color} ${start.toFixed(2)}% ${acc.toFixed(2)}%`;
    })
    .join(", ");

  const legend = data
    .map((s) => {
      const pct = Math.round((s.minutes / total) * 100);
      return `<li>
        <span class="pie-dot" style="background:${s.color}"></span>
        <span class="pie-name">${escapeHtml(s.label)}</span>
        <span class="pie-val">${formatHours(s.minutes)} · ${pct}%</span>
      </li>`;
    })
    .join("");

  return `<div class="pie-card">
    <h3 class="pie-title">${title}</h3>
    <div class="pie-body">
      <div class="pie-ring" style="background:conic-gradient(${stops})" role="img" aria-label="${title}"></div>
      <ul class="pie-legend">${legend}</ul>
    </div>
  </div>`;
}

function renderPieCharts() {
  const el = document.getElementById("pieGrid");
  if (!el) return;

  const sinceStr = sinceStrForRange(pieRangeDays);
  const recent = logs.filter((l) => l.date >= sinceStr);
  const rangeLabel = pieRangeDays === 7 ? "近7天" : "近30天";

  const studyTotals = Object.fromEntries(STUDY_CATS.map((c) => [c.label, 0]));
  let studyAll = 0;
  let sleep = 0;
  let phone = 0;
  let other = 0;

  for (const l of recent) {
    if (isStudyLabel(l.subject)) {
      studyTotals[l.subject] = (studyTotals[l.subject] || 0) + l.minutes;
      studyAll += l.minutes;
    } else if (l.subject === "睡觉") sleep += l.minutes;
    else if (l.subject === "玩手机") phone += l.minutes;
    else other += l.minutes;
  }

  const studySlices = STUDY_CATS.map((c) => ({
    label: c.label,
    minutes: studyTotals[c.label] || 0,
    color: colorForSubject(c.label),
  }));

  const overviewSlices = [
    { label: "学习", minutes: studyAll, color: PIE_COLORS.学习 },
    { label: "睡觉", minutes: sleep, color: PIE_COLORS.睡觉 },
    { label: "玩手机", minutes: phone, color: PIE_COLORS.玩手机 },
  ];
  if (other > 0) overviewSlices.push({ label: "其他", minutes: other, color: PIE_COLORS.其他 });

  el.innerHTML =
    buildPieHtml(`${rangeLabel} · 学习科目`, studySlices) +
    buildPieHtml(`${rangeLabel} · 时间结构`, overviewSlices);

  document.querySelectorAll("#pieRangeChips .range-chip").forEach((btn) => {
    btn.classList.toggle("active", Number(btn.dataset.range) === pieRangeDays);
  });
}

function initPieRange() {
  const saved = Number(localStorage.getItem(PIE_RANGE_KEY));
  if (saved === 7 || saved === 30) pieRangeDays = saved;

  document.querySelectorAll("#pieRangeChips .range-chip").forEach((btn) => {
    btn.addEventListener("click", () => {
      pieRangeDays = Number(btn.dataset.range);
      localStorage.setItem(PIE_RANGE_KEY, String(pieRangeDays));
      renderPieCharts();
    });
  });
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
        <span>${escapeHtml(formatEntryDisplay(subject, st))}</span>
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
  renderDailyGoal();
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
    empty.textContent = pickRandom(ENCOURAGE.empty);
    return;
  }
  empty.style.display = "none";
  list.innerHTML = items
    .map(
      (l) => `<li class="log-item">
        <div>
          <span class="${tagClassFor(l.subject)}">${escapeHtml(formatEntryDisplay(l.subject, l.subtask))}</span>
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

function studyLevel(minutes) {
  if (!minutes) return 0;
  if (minutes < 120) return 1;
  if (minutes < 240) return 2;
  return 3;
}

function renderCalDayDetail(date) {
  const el = document.getElementById("calDayDetail");
  if (!el || !date) {
    if (el) el.innerHTML = "";
    return;
  }

  const items = logs.filter((l) => l.date === date).sort((a, b) => b.id.localeCompare(a.id));
  const study = minutesOnDate(date, (l) => isStudyLabel(l.subject));
  const label = date === todayStr() ? "今天" : date;

  if (!items.length) {
    el.innerHTML = `<p class="empty">${label}：无记录</p>`;
    return;
  }

  el.innerHTML = `<p class="cal-detail-head"><strong>${label}</strong> · 学习 ${formatHours(study)}</p>
    <ul class="log-list cal-detail-list">${items
      .map(
        (l) => `<li class="log-item">
          <div>
            <span class="${tagClassFor(l.subject)}">${escapeHtml(formatEntryDisplay(l.subject, l.subtask))}</span>
            <strong>${formatMinutes(l.minutes)}</strong>
          </div>
        </li>`
      )
      .join("")}</ul>`;
}

function renderCalendar() {
  const grid = document.getElementById("calGrid");
  const title = document.getElementById("calTitle");
  if (!grid) return;

  if (!selectedCalDate) selectedCalDate = todayStr();

  if (title) title.textContent = `${calendarYear}年${calendarMonth + 1}月`;

  const first = new Date(calendarYear, calendarMonth, 1);
  const daysInMonth = new Date(calendarYear, calendarMonth + 1, 0).getDate();
  const startPad = (first.getDay() + 6) % 7;
  const today = todayStr();

  let html = "";
  for (let i = 0; i < startPad; i++) html += `<div class="cal-cell cal-pad"></div>`;

  for (let d = 1; d <= daysInMonth; d++) {
    const date = `${calendarYear}-${String(calendarMonth + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    const study = minutesOnDate(date, (l) => isStudyLabel(l.subject));
    const level = studyLevel(study);
    const classes = ["cal-cell", `cal-l${level}`];
    if (date === today) classes.push("cal-today");
    if (date === selectedCalDate) classes.push("selected");
    html += `<button type="button" class="${classes.join(" ")}" data-date="${date}">
      <span class="cal-day-num">${d}</span>
      ${study ? `<span class="cal-hrs">${formatHours(study)}</span>` : ""}
    </button>`;
  }

  grid.innerHTML = html;
  grid.querySelectorAll("[data-date]").forEach((btn) => {
    btn.addEventListener("click", () => {
      selectedCalDate = btn.dataset.date;
      renderCalDayDetail(selectedCalDate);
      renderCalendar();
    });
  });
  renderCalDayDetail(selectedCalDate);
}

function icsEscape(text) {
  return String(text).replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\n/g, "\\n");
}

function formatIcsUtc(dateStr, minutesFromMidnight) {
  const [y, m, d] = dateStr.split("-").map(Number);
  const dt = new Date(y, m - 1, d, 0, minutesFromMidnight, 0);
  return dt.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}

function exportICS() {
  if (!logs.length) {
    alert("还没有记录可导出");
    return;
  }

  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//StudyLog//CN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
  ];

  const byDate = {};
  for (const log of logs) {
    if (!byDate[log.date]) byDate[log.date] = [];
    byDate[log.date].push(log);
  }

  for (const [date, dayLogs] of Object.entries(byDate)) {
    let offsetMin = 480;
    for (const log of dayLogs.sort((a, b) => a.id.localeCompare(b.id))) {
      const startMin = offsetMin;
      const endMin = startMin + log.minutes;
      offsetMin = endMin + 5;
      const title = formatEntryTitle(log.subject, log.subtask);
      const uid = `study-${log.id}@my-study-log`;
      lines.push(
        "BEGIN:VEVENT",
        `UID:${uid}`,
        `DTSTAMP:${formatIcsUtc(todayStr(), 0)}`,
        `DTSTART:${formatIcsUtc(date, startMin)}`,
        `DTEND:${formatIcsUtc(date, endMin)}`,
        `SUMMARY:${icsEscape(`${title} ${formatMinutes(log.minutes)}`)}`,
        log.note ? `DESCRIPTION:${icsEscape(log.note)}` : "DESCRIPTION:学习打卡导出",
        "END:VEVENT"
      );
    }
  }

  lines.push("END:VCALENDAR");
  const blob = new Blob([lines.join("\r\n")], { type: "text/calendar;charset=utf-8" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `study-calendar-${todayStr()}.ics`;
  a.click();
  URL.revokeObjectURL(a.href);
}

function initCalendar() {
  const prev = document.getElementById("calPrev");
  const next = document.getElementById("calNext");
  if (prev) {
    prev.addEventListener("click", () => {
      calendarMonth -= 1;
      if (calendarMonth < 0) {
        calendarMonth = 11;
        calendarYear -= 1;
      }
      renderCalendar();
    });
  }
  if (next) {
    next.addEventListener("click", () => {
      calendarMonth += 1;
      if (calendarMonth > 11) {
        calendarMonth = 0;
        calendarYear += 1;
      }
      renderCalendar();
    });
  }
}

function renderAll() {
  const streak = calcStreak();
  const streakEl = document.getElementById("streakDays");
  if (streakEl) {
    streakEl.textContent = streak >= 2 ? `🔥 ${streak} 天` : `${streak} 天`;
  }
  renderEncouragement();
  renderWeekChart();
  renderPieCharts();
  renderCalendar();
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

function pulseElement(id) {
  const el = document.getElementById(id);
  if (!el) return;
  el.classList.add("pulse-once");
  setTimeout(() => el.classList.remove("pulse-once"), 600);
  try {
    navigator.vibrate?.([80, 40, 80]);
  } catch {
    /* ignore */
  }
}

function celebratePomodoro(msg) {
  const wrap = document.getElementById("timerRingWrap");
  if (wrap) {
    wrap.classList.add("celebrate");
    setTimeout(() => wrap.classList.remove("celebrate"), 700);
  }
  try {
    navigator.vibrate?.([100, 50, 100, 50, 100]);
  } catch {
    /* ignore */
  }
  const badge = document.getElementById("pomodoroBadge");
  if (badge && msg) {
    badge.textContent = msg;
    badge.hidden = false;
    setTimeout(() => {
      if (!timerRunning) badge.hidden = true;
    }, 2800);
  }
}

function loadPomodoroSettings() {
  const work = Number(localStorage.getItem(POMODORO_WORK_KEY));
  const brk = Number(localStorage.getItem(POMODORO_BREAK_KEY));
  if (work >= 5 && work <= 90) pomodoroWorkMin = work;
  if (brk >= 1 && brk <= 30) pomodoroBreakMin = brk;
  const mode = localStorage.getItem(TIMER_MODE_KEY);
  if (mode === "pomodoro" || mode === "normal") timerMode = mode;
}

function savePomodoroSettings(work, breakMin) {
  pomodoroWorkMin = Math.min(90, Math.max(5, Math.round(work)));
  pomodoroBreakMin = Math.min(30, Math.max(1, Math.round(breakMin)));
  localStorage.setItem(POMODORO_WORK_KEY, String(pomodoroWorkMin));
  localStorage.setItem(POMODORO_BREAK_KEY, String(pomodoroBreakMin));
  const hint = document.getElementById("timerModeHint");
  if (hint && timerMode === "pomodoro") {
    hint.textContent = `番茄钟 ${pomodoroWorkMin}+${pomodoroBreakMin} 分，专注结束自动记录`;
  }
}

function clearTimerTick() {
  timerRunning = false;
  if (timerTick) clearInterval(timerTick);
  timerTick = null;
}

function setTimerMode(mode) {
  if (mode === timerMode) return;
  if (timerRunning || timerSeconds > 0) {
    if (!confirm("切换模式会重置当前计时")) return;
    clearTimerTick();
    timerSeconds = 0;
    pomodoroPhase = "idle";
    pomodoroPhaseTotal = 0;
  }
  timerMode = mode;
  localStorage.setItem(TIMER_MODE_KEY, mode);
  document.querySelectorAll(".mode-chip").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.mode === mode);
  });
  const hint = document.getElementById("timerModeHint");
  if (hint) {
    hint.textContent =
      mode === "pomodoro"
        ? `番茄钟 ${pomodoroWorkMin}+${pomodoroBreakMin} 分，专注结束自动记录`
        : "正计时，结束手动记录";
  }
  setTimerUI();
}

function pomodoroElapsedWorkSeconds() {
  if (pomodoroPhase !== "work" || !pomodoroPhaseTotal) return 0;
  return Math.max(0, pomodoroPhaseTotal - timerSeconds);
}

function formatTimer(sec) {
  const h = String(Math.floor(sec / 3600)).padStart(2, "0");
  const m = String(Math.floor((sec % 3600) / 60)).padStart(2, "0");
  const s = String(sec % 60).padStart(2, "0");
  return `${h}:${m}:${s}`;
}

function onPomodoroPhaseEnd() {
  if (pomodoroPhase === "work") {
    addLog({
      date: todayStr(),
      subject: timerSubject,
      subtask: getTimerSubtaskValue(),
      minutes: pomodoroWorkMin,
      note: "番茄钟",
      source: "pomodoro",
    });
    celebratePomodoro("🍅 专注完成 +1 番茄");
    pomodoroPhase = "break";
    pomodoroPhaseTotal = pomodoroBreakMin * 60;
    timerSeconds = pomodoroPhaseTotal;
    setTimerUI();
    return;
  }
  if (pomodoroPhase === "break") {
    celebratePomodoro("☕ 休息结束，可以下一轮了");
    pomodoroPhase = "idle";
    timerSeconds = 0;
    pomodoroPhaseTotal = 0;
    clearTimerTick();
    setTimerUI();
  }
}

function setTimerUI() {
  document.getElementById("timerDisplay").textContent = formatTimer(timerSeconds);

  const canStop =
    timerMode === "normal"
      ? timerSeconds > 0 || timerRunning
      : pomodoroPhase === "work" || timerRunning;

  document.getElementById("timerStart").disabled = timerRunning;
  document.getElementById("timerPause").disabled =
    !timerRunning && (timerMode === "normal" ? timerSeconds === 0 : pomodoroPhase === "idle");
  document.getElementById("timerStop").disabled = !canStop;
  document.getElementById("timerPause").textContent = timerRunning ? "暂停" : "继续";

  const ring = document.getElementById("timerRing");
  const card = document.querySelector(".timer-card");
  if (card) {
    card.classList.toggle("timer-running", timerRunning);
    card.classList.toggle("pomodoro-active", timerMode === "pomodoro" && pomodoroPhase === "work");
    card.classList.toggle("pomodoro-break", pomodoroPhase === "break");
  }

  let ringPct = 0;
  if (timerMode === "pomodoro" && pomodoroPhaseTotal > 0 && pomodoroPhase !== "idle") {
    const elapsed = pomodoroPhaseTotal - timerSeconds;
    ringPct = Math.round((elapsed / pomodoroPhaseTotal) * 100);
    ring?.classList.toggle("ring-break", pomodoroPhase === "break");
  } else if (timerMode === "normal" && timerRunning) {
    ringPct = Math.min(100, Math.round(((timerSeconds % 3600) / 3600) * 100));
    ring?.classList.remove("ring-break");
  } else {
    ring?.classList.remove("ring-break");
  }
  if (ring) ring.style.setProperty("--ring-pct", `${ringPct}%`);

  const badge = document.getElementById("pomodoroBadge");
  if (badge && timerMode === "pomodoro" && timerRunning) {
    badge.hidden = false;
    badge.textContent = pomodoroPhase === "break" ? "☕ 休息中" : "🍅 专注中";
  }
}

function startTimer() {
  if (timerRunning) return;
  timerSubject = document.getElementById("timerSubject").value;
  setTimerSubject(timerSubject);

  if (timerMode === "pomodoro" && pomodoroPhase === "idle") {
    pomodoroPhase = "work";
    pomodoroPhaseTotal = pomodoroWorkMin * 60;
    timerSeconds = pomodoroPhaseTotal;
  }

  timerRunning = true;
  timerTick = setInterval(() => {
    if (timerMode === "pomodoro") {
      timerSeconds -= 1;
      if (timerSeconds <= 0) onPomodoroPhaseEnd();
    } else {
      timerSeconds += 1;
    }
    setTimerUI();
  }, 1000);
  setTimerUI();
}

function pauseTimer() {
  if (!timerRunning && timerSeconds > 0 && pomodoroPhase !== "idle") {
    startTimer();
    return;
  }
  if (!timerRunning && timerMode === "normal" && timerSeconds > 0) {
    startTimer();
    return;
  }
  if (!timerRunning) return;
  clearTimerTick();
  setTimerUI();
}

function stopTimer() {
  clearTimerTick();
  let logged = false;

  if (timerMode === "pomodoro" && pomodoroPhase === "work") {
    const elapsed = pomodoroElapsedWorkSeconds();
    if (elapsed >= 30) {
      addLog({
        date: todayStr(),
        subject: timerSubject,
        subtask: getTimerSubtaskValue(),
        minutes: Math.max(1, Math.round(elapsed / 60)),
        note: "番茄钟（提前结束）",
        source: "pomodoro",
      });
      logged = true;
    }
    pomodoroPhase = "idle";
    pomodoroPhaseTotal = 0;
    timerSeconds = 0;
  } else if (timerMode === "normal") {
    if (timerSeconds >= 30) {
      addLog({
        date: todayStr(),
        subject: timerSubject,
        subtask: getTimerSubtaskValue(),
        minutes: Math.max(1, Math.round(timerSeconds / 60)),
        note: "",
        source: "timer",
      });
      logged = true;
    }
    timerSeconds = 0;
  } else {
    pomodoroPhase = "idle";
    pomodoroPhaseTotal = 0;
    timerSeconds = 0;
  }

  const badge = document.getElementById("pomodoroBadge");
  if (badge) badge.hidden = true;
  setTimerUI();
  if (logged) showToast(pickRandom(ENCOURAGE.afterLog));
}

function initTimerMode() {
  document.querySelectorAll(".mode-chip").forEach((btn) => {
    btn.addEventListener("click", () => setTimerMode(btn.dataset.mode));
  });
  setTimerMode(timerMode);
}

function initPomodoroForm() {
  loadPomodoroSettings();
  const workInput = document.getElementById("pomodoroWorkMin");
  const breakInput = document.getElementById("pomodoroBreakMin");
  if (workInput) workInput.value = String(pomodoroWorkMin);
  if (breakInput) breakInput.value = String(pomodoroBreakMin);

  document.getElementById("pomodoroForm").addEventListener("submit", (e) => {
    e.preventDefault();
    savePomodoroSettings(Number(workInput.value), Number(breakInput.value));
    if (workInput) workInput.value = String(pomodoroWorkMin);
    if (breakInput) breakInput.value = String(pomodoroBreakMin);
  });
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

function initDailyGoalForm() {
  loadDailyGoal();
  const input = document.getElementById("dailyGoalHours");
  if (input) input.value = String(dailyGoalMinutes / 60);

  document.getElementById("dailyGoalForm").addEventListener("submit", (e) => {
    e.preventDefault();
    saveDailyGoal(Number(document.getElementById("dailyGoalHours").value));
    if (input) input.value = String(dailyGoalMinutes / 60);
  });
}

function initTools() {
  document.getElementById("clearToday").addEventListener("click", () => {
    if (!confirm("确定删除今天的全部记录？")) return;
    logs = logs.filter((l) => l.date !== todayStr());
    saveLogs();
    renderAll();
  });

  document.getElementById("exportIcsBtn").addEventListener("click", exportICS);

  document.getElementById("exportBtn").addEventListener("click", () => {
    const payload = {
      version: 3,
      logs,
      customCategories,
      subtasksLibrary,
      dailyGoalHours: dailyGoalMinutes / 60,
      pomodoroWorkMin,
      pomodoroBreakMin,
      timerMode,
    };
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
          if (data.dailyGoalHours && Number(data.dailyGoalHours) >= 1) {
            saveDailyGoal(Number(data.dailyGoalHours));
          }
          if (data.pomodoroWorkMin) savePomodoroSettings(Number(data.pomodoroWorkMin), pomodoroBreakMin);
          if (data.pomodoroBreakMin) savePomodoroSettings(pomodoroWorkMin, Number(data.pomodoroBreakMin));
          if (data.timerMode === "pomodoro" || data.timerMode === "normal") setTimerMode(data.timerMode);
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

function applyTheme(theme) {
  const isDark = theme === "dark";
  document.documentElement.setAttribute("data-theme", isDark ? "dark" : "light");
  localStorage.setItem(THEME_KEY, isDark ? "dark" : "light");
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.content = isDark ? "#1c1917" : "#0d6e6e";
  const btn = document.getElementById("themeToggle");
  if (btn) {
    btn.textContent = isDark ? "☀️" : "🌙";
    btn.setAttribute("aria-label", isDark ? "切换浅色模式" : "切换深色模式");
  }
}

function initTheme() {
  const saved = localStorage.getItem(THEME_KEY);
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const theme = saved === "dark" || saved === "light" ? saved : prefersDark ? "dark" : "light";
  applyTheme(theme);
  const btn = document.getElementById("themeToggle");
  if (btn) {
    btn.addEventListener("click", () => {
      const next = document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark";
      applyTheme(next);
    });
  }
}

loadLogs();
loadDailyGoal();
initTheme();
fillSubjectSelects();
fillPresetSubjectSelect();
renderTimerChips();
renderCustomList();
renderSubtaskPresetList();
updateSubtaskDatalists();
initPieRange();
initCalendar();
initMobileNav();
initManualForm();
initSleepForm();
initCustomForm();
initSubtaskPresetForm();
initTimerSubtaskInput();
initPomodoroForm();
initTimerMode();
initTimer();
initDailyGoalForm();
initTools();
renderAll();
