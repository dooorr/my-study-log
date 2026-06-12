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
const LOG_ORDER_KEY = "kaoyan_log_order_v1";
const COUNTDOWN_KEY = "kaoyan_countdown_v1";
const SUBJECT_GOALS_KEY = "kaoyan_subject_goals_v1";
const STUDY_PHASES_KEY = "kaoyan_study_phases_v1";
const MAX_STUDY_PHASES = 4;

const DEFAULT_COUNTDOWN = {
  label: "考研初试",
  date: "2026-12-21",
  enabled: true,
};

/** @type {Record<string, number>} 科目 -> 目标总时长（小时） */
const DEFAULT_SUBJECT_GOALS = {
  数分: 400,
  高代: 400,
  英语: 150,
  政治: 100,
};

/** @type {{ id: string, name: string, startDate: string, endDate: string }[]} */
const DEFAULT_STUDY_PHASES = [
  { id: "phase-base", name: "基础阶段", startDate: "2025-09-01", endDate: "2026-02-28" },
  { id: "phase-strong", name: "强化阶段", startDate: "2026-03-01", endDate: "2026-08-31" },
  { id: "phase-sprint", name: "冲刺阶段", startDate: "2026-09-01", endDate: "2026-12-21" },
];

const DEFAULT_DAILY_GOAL_HOURS = 8;

const PIE_COLORS = {
  数分: "#0d6e6e",
  高代: "#14a3a3",
  英语: "#94a3b8",
  政治: "#78716c",
  学习: "#0d6e6e",
  睡觉: "#6366f1",
  玩手机: "#d97706",
  吃饭: "#c9a87c",
  取快递: "#8fa8b8",
  打电话: "#b8a0b0",
  其他: "#a8a29e",
};

const TIMELINE_DAY_START = 0;
const TIMELINE_DAY_END = 24;
const TODAY_VIEW_KEY = "kaoyan_today_view_v1";
const STATS_VIEW_KEY = "kaoyan_stats_view_v1";
const MORE_VIEW_KEY = "kaoyan_more_view_v1";

const SUBJECT_EMOJI = {
  数分: "📐",
  高代: "🔢",
  英语: "📖",
  政治: "📰",
  睡觉: "😴",
  玩手机: "📱",
  吃饭: "🍱",
  取快递: "📦",
  打电话: "📞",
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
  { label: "吃饭", group: "life", lifeKind: "meal" },
  { label: "取快递", group: "life", lifeKind: "errand" },
  { label: "打电话", group: "life", lifeKind: "call" },
];

const LEGACY_SUBJECT_MAP = {
  数学: "数分",
  专业课: "数分",
  英语: "英语",
  政治: "政治",
  其他: "其他",
};

/** @type {{ label: string, group: "study" | "life" }[]} */
let customCategories = [];

/** @type {Record<string, string[]>} 日期 -> 记录 id 顺序（仅影响列表展示） */
let dayLogOrder = {};

/** @type {{ label: string, date: string, enabled: boolean }} */
let countdown = { ...DEFAULT_COUNTDOWN };

/** @type {Record<string, number>} */
let subjectGoals = { ...DEFAULT_SUBJECT_GOALS };

/** @type {{ id: string, name: string, startDate: string, endDate: string }[]} */
let studyPhases = [];

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
let timelineViewDate = "";
let editingLogId = "";
let timerStartedAt = 0;
let pomodoroWorkStartAt = 0;

function getBuiltinLabels() {
  return [...STUDY_CATS, ...LIFE_CATS].map((c) => c.label);
}

function normalizeCustomCategory(raw) {
  if (typeof raw === "string") {
    const label = raw.trim().slice(0, 12);
    if (!label) return null;
    return { label, group: "life" };
  }
  if (raw && typeof raw === "object") {
    const label =
      typeof raw.label === "string"
        ? raw.label.trim().slice(0, 12)
        : typeof raw.name === "string"
          ? raw.name.trim().slice(0, 12)
          : "";
    if (!label) return null;
    return { label, group: raw.group === "study" ? "study" : "life" };
  }
  return null;
}

function normalizeCustomCategoriesList(arr) {
  if (!Array.isArray(arr)) return [];
  const out = [];
  const seen = new Set();
  for (const raw of arr) {
    const item = normalizeCustomCategory(raw);
    if (!item || seen.has(item.label) || getBuiltinLabels().includes(item.label)) continue;
    seen.add(item.label);
    out.push(item);
  }
  return out;
}

function customAsChipMeta(c) {
  return {
    label: c.label,
    group: c.group,
    primary: false,
    lifeKind: c.group === "life" ? "other" : undefined,
    custom: true,
  };
}

function getSelectedCatGroup(containerId, fallback = "life") {
  const wrap = document.getElementById(containerId);
  if (!wrap) return fallback;
  const active = wrap.querySelector("[data-cat-group].active");
  const group = active?.getAttribute("data-cat-group");
  return group === "study" ? "study" : "life";
}

function getAllCategories() {
  const builtins = [...STUDY_CATS, ...LIFE_CATS];
  const customs = customCategories.map((c) => customAsChipMeta(c));
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
    customCategories = normalizeCustomCategoriesList(raw ? JSON.parse(raw) : []);
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
  if (/快递|取件/.test(label)) return "📦";
  if (/电话|通话/.test(label)) return "📞";
  if (/运|跑|健身|锻炼/.test(label)) return "🏃";
  if (/吃|饭|餐/.test(label)) return "🍱";
  return "✨";
}

function formatEntryDisplay(subject, subtask) {
  return `${subjectEmoji(subject)} ${formatEntryTitle(subject, subtask)}`;
}

function formatEntryParts(subject, subtask) {
  return {
    emoji: subjectEmoji(subject),
    title: formatEntryTitle(subject, subtask),
  };
}

function renderLogItemHtml(log, { draggable = true, showActions = true } = {}) {
  const parts = formatEntryParts(log.subject, log.subtask);
  const sourceLabel =
    log.source === "timer"
      ? "计时"
      : log.source === "pomodoro"
        ? "番茄"
        : log.source === "sleep"
          ? "睡眠"
          : "手动";
  const drag = draggable
    ? `<span class="drag-handle" draggable="true" aria-label="拖动排序" title="拖动排序">⋮⋮</span>`
    : "";
  const note = log.note ? `<p class="log-item-note">${escapeHtml(log.note)}</p>` : "";
  const foot = showActions
    ? `<div class="log-item-foot">
        <span class="log-meta log-source">${sourceLabel}</span>
        <div class="log-item-actions">
          <button type="button" class="btn ghost sm" data-note="${log.id}">备注</button>
          <button type="button" class="btn ghost sm" data-del="${log.id}">删</button>
        </div>
      </div>`
    : "";

  return `<li class="log-item" data-id="${escapeHtml(log.id)}">
    ${drag}
    <div class="log-item-body">
      <div class="log-item-top">
        <span class="log-tag ${tagClassFor(log.subject)}">
          <span class="log-tag-emoji" aria-hidden="true">${parts.emoji}</span>
          <span class="log-tag-text">${escapeHtml(parts.title)}</span>
        </span>
        <strong class="log-duration">${formatMinutes(log.minutes)}</strong>
      </div>
      ${note}
      ${foot}
    </div>
  </li>`;
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
      if (!customCategories.some((c) => c.label === log.subject)) {
        customCategories.push({ label: log.subject, group: "life" });
        migrated = true;
      }
    }
    if (log.subtask) rememberSubtask(log.subject, log.subtask);
    if (log.startAt === undefined) {
      log.startAt = "";
      migrated = true;
    }
    if (log.endAt === undefined) {
      log.endAt = "";
      migrated = true;
    }
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

function loadLogOrder() {
  try {
    const raw = localStorage.getItem(LOG_ORDER_KEY);
    dayLogOrder = raw ? JSON.parse(raw) : {};
    if (typeof dayLogOrder !== "object" || Array.isArray(dayLogOrder)) dayLogOrder = {};
  } catch {
    dayLogOrder = {};
  }
}

function saveLogOrder() {
  localStorage.setItem(LOG_ORDER_KEY, JSON.stringify(dayLogOrder));
}

function appendLogOrder(date, id) {
  if (!date || !id) return;
  const order = dayLogOrder[date] ? [...dayLogOrder[date]] : [];
  if (!order.includes(id)) order.push(id);
  dayLogOrder[date] = order;
  saveLogOrder();
}

function removeLogOrderId(id) {
  for (const date of Object.keys(dayLogOrder)) {
    dayLogOrder[date] = dayLogOrder[date].filter((x) => x !== id);
    if (!dayLogOrder[date].length) delete dayLogOrder[date];
  }
  saveLogOrder();
}

function setDayLogOrder(date, ids) {
  dayLogOrder[date] = ids;
  saveLogOrder();
}

function sortLogsForDate(date, items) {
  const order = dayLogOrder[date];
  if (order?.length) {
    const map = new Map(items.map((l) => [l.id, l]));
    const sorted = [];
    for (const id of order) {
      if (map.has(id)) {
        sorted.push(map.get(id));
        map.delete(id);
      }
    }
    for (const l of map.values()) sorted.push(l);
    return sorted;
  }
  return [...items].sort((a, b) => {
    const diff = logSortTime(b) - logSortTime(a);
    if (diff !== 0) return diff;
    return b.id.localeCompare(a.id);
  });
}

function logSortTime(log) {
  const range = getLogTimeRange(log);
  if (range) return range.end.getTime();
  const ts = parseInt(String(log.id).split("-")[0], 10);
  return Number.isNaN(ts) ? 0 : ts;
}

function normalizeStudyPhase(raw) {
  if (!raw || typeof raw !== "object") return null;
  const name = typeof raw.name === "string" ? raw.name.trim().slice(0, 16) : "";
  const startDate = /^\d{4}-\d{2}-\d{2}$/.test(raw.startDate) ? raw.startDate : "";
  const endDate = /^\d{4}-\d{2}-\d{2}$/.test(raw.endDate) ? raw.endDate : "";
  if (!name || !startDate || !endDate || startDate > endDate) return null;
  return {
    id: typeof raw.id === "string" && raw.id ? raw.id : uid(),
    name,
    startDate,
    endDate,
  };
}

function loadStudyPhases() {
  try {
    const raw = localStorage.getItem(STUDY_PHASES_KEY);
    if (!raw) {
      studyPhases = DEFAULT_STUDY_PHASES.map((p) => ({ ...p }));
      return;
    }
    const data = JSON.parse(raw);
    if (!Array.isArray(data)) {
      studyPhases = DEFAULT_STUDY_PHASES.map((p) => ({ ...p }));
      return;
    }
    studyPhases = data.map(normalizeStudyPhase).filter(Boolean).slice(0, MAX_STUDY_PHASES);
    if (!studyPhases.length) studyPhases = DEFAULT_STUDY_PHASES.map((p) => ({ ...p }));
  } catch {
    studyPhases = DEFAULT_STUDY_PHASES.map((p) => ({ ...p }));
  }
  sortStudyPhases();
}

function saveStudyPhases() {
  localStorage.setItem(STUDY_PHASES_KEY, JSON.stringify(studyPhases));
}

function sortStudyPhases() {
  studyPhases.sort((a, b) => a.startDate.localeCompare(b.startDate) || a.endDate.localeCompare(b.endDate));
}

function minutesInDateRange(startDate, endDate, filterFn) {
  return logs
    .filter((l) => l.date >= startDate && l.date <= endDate && (!filterFn || filterFn(l)))
    .reduce((s, l) => s + l.minutes, 0);
}

function getPhaseStudyStats(phase) {
  const bySubject = {};
  for (const cat of STUDY_CATS) {
    bySubject[cat.label] = minutesInDateRange(phase.startDate, phase.endDate, (l) => l.subject === cat.label);
  }
  const totalStudy = minutesInDateRange(phase.startDate, phase.endDate, (l) => isStudyLabel(l.subject));
  const studyDates = new Set(
    logs.filter((l) => l.date >= phase.startDate && l.date <= phase.endDate && isStudyLabel(l.subject)).map((l) => l.date)
  );
  return { totalStudy, bySubject, studyDays: studyDates.size };
}

function getCurrentStudyPhase() {
  const today = todayStr();
  return studyPhases.find((p) => today >= p.startDate && today <= p.endDate);
}

function formatPhaseRange(phase) {
  return `${phase.startDate.replace(/-/g, ".")} – ${phase.endDate.replace(/-/g, ".")}`;
}

function renderPhaseSubjectBars(bySubject, maxHint) {
  const rows = STUDY_CATS.map((c) => ({ label: c.label, minutes: bySubject[c.label] || 0, primary: c.primary }));
  const max = Math.max(maxHint || 0, ...rows.map((r) => r.minutes), 1);
  return rows
    .map((r) => {
      const pct = Math.round((r.minutes / max) * 100);
      const cls = r.primary ? "row primary-subject" : "row";
      return `<div class="${cls}">
        <span>${subjectEmoji(r.label)} ${r.label}</span>
        <div class="track"><div class="fill" style="width:${pct}%"></div></div>
        <span>${formatHours(r.minutes)}</span>
      </div>`;
    })
    .join("");
}

function renderPhaseStats() {
  const listEl = document.getElementById("phaseStatsList");
  const dashBanner = document.getElementById("dashPhaseBanner");
  const current = getCurrentStudyPhase();

  if (dashBanner) {
    if (current) {
      const stats = getPhaseStudyStats(current);
      dashBanner.hidden = false;
      const titleEl = document.getElementById("dashPhaseTitle");
      const numsEl = document.getElementById("dashPhaseNums");
      const hintEl = document.getElementById("dashPhaseHint");
      if (titleEl) titleEl.textContent = `📆 ${current.name}`;
      if (numsEl) numsEl.textContent = formatHours(stats.totalStudy);
      if (hintEl) {
        const shufen = formatHours(stats.bySubject["数分"] || 0);
        const gaodai = formatHours(stats.bySubject["高代"] || 0);
        hintEl.textContent = `${formatPhaseRange(current)} · 数分 ${shufen} · 高代 ${gaodai}`;
      }
    } else {
      dashBanner.hidden = true;
    }
  }

  if (!listEl) return;
  if (!studyPhases.length) {
    listEl.innerHTML = `<p class="empty">还没有阶段，请到「更多 → 复习阶段」添加。</p>`;
    return;
  }

  const today = todayStr();
  let prevTotal = 0;
  listEl.innerHTML = studyPhases
    .map((phase, index) => {
      const stats = getPhaseStudyStats(phase);
      const isCurrent = today >= phase.startDate && today <= phase.endDate;
      const isPast = today > phase.endDate;
      const delta = index > 0 ? stats.totalStudy - prevTotal : null;
      prevTotal = stats.totalStudy;

      let compare = "";
      if (delta !== null) {
        if (delta > 0) compare = `比上一阶段多 ${formatHours(delta)}`;
        else if (delta < 0) compare = `比上一阶段少 ${formatHours(-delta)}`;
        else compare = "与上一阶段相同";
      }

      return `<div class="phase-stat-card${isCurrent ? " phase-current" : ""}${isPast ? " phase-past" : ""}">
        <div class="phase-stat-head">
          <div>
            <strong>${escapeHtml(phase.name)}</strong>
            ${isCurrent ? '<span class="phase-tag">当前</span>' : ""}
          </div>
          <span class="phase-range">${escapeHtml(formatPhaseRange(phase))}</span>
        </div>
        <p class="phase-stat-summary">
          总学习 <strong>${formatHours(stats.totalStudy)}</strong>
          · ${stats.studyDays} 个学习日
          ${compare ? ` · ${compare}` : ""}
        </p>
        <div class="subject-bars phase-bars">${renderPhaseSubjectBars(stats.bySubject)}</div>
      </div>`;
    })
    .join("");
}

function renderPhaseEditList() {
  const list = document.getElementById("phaseEditList");
  if (!list) return;
  if (!studyPhases.length) {
    list.innerHTML = `<li class="empty-inline">暂无阶段，下面添加一个</li>`;
    return;
  }
  list.innerHTML = studyPhases
    .map(
      (p) => `<li class="phase-edit-item">
        <div class="phase-edit-main">
          <strong>${escapeHtml(p.name)}</strong>
          <span class="muted">${escapeHtml(formatPhaseRange(p))}</span>
        </div>
        <button type="button" class="btn ghost sm" data-del-phase="${escapeHtml(p.id)}">删</button>
      </li>`
    )
    .join("");

  list.querySelectorAll("[data-del-phase]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = btn.getAttribute("data-del-phase");
      studyPhases = studyPhases.filter((p) => p.id !== id);
      saveStudyPhases();
      renderPhaseEditList();
      renderPhaseStats();
    });
  });
}

function initStudyPhases() {
  loadStudyPhases();
  renderPhaseEditList();

  const form = document.getElementById("phaseAddForm");
  if (!form) return;

  const startInput = document.getElementById("phaseStartInput");
  const endInput = document.getElementById("phaseEndInput");
  if (startInput && !startInput.value) startInput.value = todayStr();
  if (endInput && !endInput.value) {
    const d = new Date();
    d.setMonth(d.getMonth() + 3);
    endInput.value = d.toISOString().slice(0, 10);
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    if (studyPhases.length >= MAX_STUDY_PHASES) {
      alert(`最多 ${MAX_STUDY_PHASES} 个阶段`);
      return;
    }
    const name = document.getElementById("phaseNameInput").value.trim();
    const startDate = startInput?.value;
    const endDate = endInput?.value;
    const phase = normalizeStudyPhase({ id: uid(), name, startDate, endDate });
    if (!phase) {
      alert("请检查名称和日期（结束不能早于开始）");
      return;
    }
    studyPhases.push(phase);
    sortStudyPhases();
    saveStudyPhases();
    document.getElementById("phaseNameInput").value = "";
    renderPhaseEditList();
    renderPhaseStats();
    showToast("📆 阶段已添加");
  });
}

function loadSubjectGoals() {
  try {
    const raw = localStorage.getItem(SUBJECT_GOALS_KEY);
    if (!raw) {
      subjectGoals = { ...DEFAULT_SUBJECT_GOALS };
      return;
    }
    const data = JSON.parse(raw);
    if (typeof data !== "object" || Array.isArray(data)) {
      subjectGoals = { ...DEFAULT_SUBJECT_GOALS };
      return;
    }
    subjectGoals = {};
    for (const cat of STUDY_CATS) {
      const h = Number(data[cat.label]);
      subjectGoals[cat.label] = h > 0 ? Math.min(2000, h) : 0;
    }
  } catch {
    subjectGoals = { ...DEFAULT_SUBJECT_GOALS };
  }
}

function saveSubjectGoals() {
  localStorage.setItem(SUBJECT_GOALS_KEY, JSON.stringify(subjectGoals));
}

function totalMinutesForSubject(label) {
  return logs.filter((l) => l.subject === label).reduce((s, l) => s + l.minutes, 0);
}

function activeSubjectGoals() {
  return STUDY_CATS
    .map((c) => c.label)
    .filter((label) => subjectGoals[label] > 0)
    .map((label) => ({
      label,
      goalHours: subjectGoals[label],
      goalMinutes: Math.round(subjectGoals[label] * 60),
      doneMinutes: totalMinutesForSubject(label),
    }));
}

function progressRowHtml({ label, goalHours, goalMinutes, doneMinutes }, compact) {
  const pct = goalMinutes > 0 ? Math.min(100, Math.round((doneMinutes / goalMinutes) * 100)) : 0;
  const color = PIE_COLORS[label] || PIE_COLORS.其他;
  const emoji = subjectEmoji(label);
  const doneH = formatHours(doneMinutes);
  const goalH = formatHours(goalMinutes);
  return `<div class="subject-progress-row${pct >= 100 ? " subject-done" : ""}">
    <div class="subject-progress-row-head">
      <span class="subject-progress-name">${emoji} ${escapeHtml(label)}</span>
      <span class="subject-progress-nums">${doneH} / ${goalH} · ${pct}%</span>
    </div>
    <div class="goal-track subject-track" role="progressbar" aria-valuenow="${pct}" aria-valuemin="0" aria-valuemax="100" aria-label="${escapeHtml(label)} 复习进度">
      <div class="goal-fill subject-fill${pct >= 100 ? " complete" : ""}" style="width:${pct}%;background:linear-gradient(90deg, ${color}, ${color})"></div>
    </div>
    ${compact ? "" : `<p class="subject-progress-sub">${pct >= 100 ? "🎉 该科目标已达成" : `还差 ${formatHours(goalMinutes - doneMinutes)}`}</p>`}
  </div>`;
}

function renderSubjectProgress() {
  const rows = activeSubjectGoals();
  const banner = document.getElementById("subjectProgressBanner");
  const overallNums = document.getElementById("overallProgressNums");
  const overallFill = document.getElementById("overallProgressFill");
  const list = document.getElementById("subjectProgressList");
  const empty = document.getElementById("subjectProgressEmpty");
  const statsEl = document.getElementById("statsSubjectProgress");

  const totalGoalMin = rows.reduce((s, r) => s + r.goalMinutes, 0);
  const totalDoneMin = rows.reduce((s, r) => s + r.doneMinutes, 0);
  const overallPct = totalGoalMin > 0 ? Math.min(100, Math.round((totalDoneMin / totalGoalMin) * 100)) : 0;

  if (banner) {
    if (!rows.length) {
      banner.hidden = true;
    } else {
      banner.hidden = false;
      if (overallNums) overallNums.textContent = `${formatHours(totalDoneMin)} / ${formatHours(totalGoalMin)}`;
      if (overallFill) {
        overallFill.style.width = `${overallPct}%`;
        overallFill.classList.toggle("complete", totalDoneMin >= totalGoalMin);
      }
      if (list) list.innerHTML = rows.map((r) => progressRowHtml(r, true)).join("");
      if (empty) empty.hidden = true;
    }
  }

  if (statsEl) {
    if (!rows.length) {
      statsEl.innerHTML = `<p class="empty">尚未设置科目目标，请到「更多 → 科目进度目标」填写。</p>`;
    } else {
      statsEl.innerHTML = `<div class="stats-overall-block">
        <div class="subject-progress-row-head">
          <span class="subject-progress-name">📚 全科合计</span>
          <span class="subject-progress-nums">${formatHours(totalDoneMin)} / ${formatHours(totalGoalMin)} · ${overallPct}%</span>
        </div>
        <div class="goal-track overall-track">
          <div class="goal-fill${totalDoneMin >= totalGoalMin ? " complete" : ""}" style="width:${overallPct}%"></div>
        </div>
      </div>
      ${rows.map((r) => progressRowHtml(r, false)).join("")}`;
    }
  }
}

function renderSubjectGoalsForm() {
  const form = document.getElementById("subjectGoalsForm");
  if (!form) return;
  form.innerHTML = STUDY_CATS.map(
    (c) => `<label>
      ${subjectEmoji(c.label)} ${c.label}（小时）
      <input type="number" name="goal-${c.label}" min="0" max="2000" step="10" value="${subjectGoals[c.label] || 0}" />
    </label>`
  ).join("") + `<button type="submit" class="btn primary full">保存科目目标</button>`;
}

function initSubjectGoalsForm() {
  loadSubjectGoals();
  renderSubjectGoalsForm();
  const form = document.getElementById("subjectGoalsForm");
  if (!form) return;
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    for (const cat of STUDY_CATS) {
      const input = form.querySelector(`[name="goal-${cat.label}"]`);
      const h = input ? Number(input.value) : 0;
      subjectGoals[cat.label] = h > 0 ? Math.min(2000, h) : 0;
    }
    saveSubjectGoals();
    renderSubjectGoalsForm();
    renderSubjectProgress();
    showToast("📊 科目进度目标已保存");
  });
}

function loadCountdown() {
  try {
    const raw = localStorage.getItem(COUNTDOWN_KEY);
    const data = raw ? JSON.parse(raw) : null;
    if (data && typeof data === "object") {
      countdown = {
        label: typeof data.label === "string" && data.label.trim() ? data.label.trim().slice(0, 20) : DEFAULT_COUNTDOWN.label,
        date: /^\d{4}-\d{2}-\d{2}$/.test(data.date) ? data.date : DEFAULT_COUNTDOWN.date,
        enabled: Boolean(data.enabled),
      };
    }
  } catch {
    countdown = { ...DEFAULT_COUNTDOWN };
  }
}

function saveCountdown() {
  localStorage.setItem(COUNTDOWN_KEY, JSON.stringify(countdown));
}

function daysFromTodayTo(dateStr) {
  const today = new Date(`${todayStr()}T12:00:00`);
  const target = new Date(`${dateStr}T12:00:00`);
  return Math.round((target - today) / 86400000);
}

function formatCountdownDateLabel(dateStr) {
  const [y, m, d] = dateStr.split("-");
  return `${y}年${Number(m)}月${Number(d)}日`;
}

function renderCountdown() {
  const banner = document.getElementById("countdownBanner");
  const labelEl = document.getElementById("countdownLabel");
  const daysEl = document.getElementById("countdownDays");
  const unitEl = document.getElementById("countdownUnit");
  const subEl = document.getElementById("countdownSub");
  const numsEl = document.getElementById("countdownNums");
  if (!banner || !countdown.enabled || !countdown.date) {
    if (banner) banner.hidden = true;
    return;
  }

  const diff = daysFromTodayTo(countdown.date);
  banner.hidden = false;
  banner.classList.toggle("countdown-today", diff === 0);
  banner.classList.toggle("countdown-past", diff < 0);
  banner.classList.toggle("countdown-urgent", diff > 0 && diff <= 30);

  if (labelEl) labelEl.textContent = `📅 距离${countdown.label}`;
  if (subEl) subEl.textContent = formatCountdownDateLabel(countdown.date);

  if (diff > 0) {
    if (daysEl) daysEl.textContent = String(diff);
    if (unitEl) unitEl.textContent = "天";
    if (numsEl) numsEl.hidden = false;
  } else if (diff === 0) {
    if (daysEl) daysEl.textContent = "今天";
    if (unitEl) unitEl.textContent = "";
    if (numsEl) numsEl.hidden = false;
  } else {
    if (numsEl) numsEl.hidden = true;
    if (subEl) subEl.textContent = `${formatCountdownDateLabel(countdown.date)} · 已过 ${-diff} 天`;
  }
}

function initCountdownForm() {
  loadCountdown();
  const labelInput = document.getElementById("countdownLabelInput");
  const dateInput = document.getElementById("countdownDateInput");
  const enabledInput = document.getElementById("countdownEnabled");
  const form = document.getElementById("countdownForm");
  if (!form || !labelInput || !dateInput || !enabledInput) return;

  labelInput.value = countdown.label;
  dateInput.value = countdown.date;
  enabledInput.checked = countdown.enabled;

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const label = labelInput.value.trim().slice(0, 20);
    const date = dateInput.value;
    if (!label || !date) return;
    countdown = {
      label,
      date,
      enabled: enabledInput.checked,
    };
    saveCountdown();
    renderCountdown();
    showToast("📅 倒数日已保存");
  });
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
  return getCategoryMeta(label)?.group === "study";
}

function isLifeLabel(label) {
  return getCategoryMeta(label)?.group === "life";
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

function getTimerNoteValue() {
  return (document.getElementById("timerNote")?.value || "").trim();
}

function clearTimerNote() {
  const el = document.getElementById("timerNote");
  if (el) el.value = "";
}

/** @param {string} fallback @param {string} [userNote] */
function buildTimerNote(fallback, userNote) {
  return userNote || fallback;
}

function logExtraNote(log) {
  if (!log.note) return "";
  if (log.subject === "睡觉") {
    const parts = log.note.split("·");
    return parts.length > 1 ? parts.slice(1).join("·").trim() : "";
  }
  return log.note;
}

function editLogNote(id) {
  openLogEditor(id);
}

function openLogEditor(id) {
  const log = logs.find((l) => l.id === id);
  if (!log) return;
  editingLogId = id;
  const modal = document.getElementById("logEditModal");
  const title = document.getElementById("logEditTitle");
  const meta = document.getElementById("logEditMeta");
  const minEl = document.getElementById("logEditMinutes");
  const noteEl = document.getElementById("logEditNote");
  const hint = document.getElementById("logEditHint");
  if (!modal || !minEl || !noteEl) return;

  const range = getLogTimeRange(log);
  const timeStr = range
    ? `${formatClockTime(range.start)}–${formatClockTime(range.end)}`
    : "未标注时段";

  if (title) title.textContent = formatEntryDisplay(log.subject, log.subtask);
  if (meta) meta.textContent = `${log.date} · ${timeStr} · ${formatMinutes(log.minutes)}`;
  minEl.value = String(log.minutes);
  noteEl.value = log.note || "";
  if (hint) {
    hint.textContent =
      log.subject === "睡觉"
        ? "睡眠时段来自入睡/起床时间；可改时长和备注。"
        : log.startAt
          ? "保存后会按原开始时间重算结束时间。"
          : "这条记录没有开始时间，只改时长和备注。";
  }
  modal.hidden = false;
  modal.setAttribute("aria-hidden", "false");
  noteEl.focus();
}

function closeLogEditor() {
  const modal = document.getElementById("logEditModal");
  if (!modal) return;
  modal.hidden = true;
  modal.setAttribute("aria-hidden", "true");
  editingLogId = "";
}

function saveLogEditor() {
  const log = logs.find((l) => l.id === editingLogId);
  if (!log) return closeLogEditor();
  const minEl = document.getElementById("logEditMinutes");
  const noteEl = document.getElementById("logEditNote");
  const minutes = Math.min(720, Math.max(1, Math.round(Number(minEl?.value) || log.minutes)));
  const noteText = (noteEl?.value || "").trim().slice(0, 120);

  log.minutes = minutes;
  log.note = noteText;

  if (log.startAt) {
    const start = new Date(log.startAt);
    if (!Number.isNaN(start.getTime())) {
      const end = new Date(start.getTime() + minutes * 60000);
      log.endAt = end.toISOString();
    }
  }

  saveLogs();
  closeLogEditor();
  renderAll();
  showToast("✓ 已保存");
}

function deleteLogEditor() {
  const id = editingLogId;
  if (!id) return;
  if (!confirm("确定删除这条记录？")) return;
  logs = logs.filter((l) => l.id !== id);
  removeLogOrderId(id);
  saveLogs();
  closeLogEditor();
  renderAll();
  showToast("已删除");
}

function bindTimelineBlocks() {
  document.querySelectorAll(".tl-block[data-log-id]").forEach((el) => {
    el.addEventListener("click", () => openLogEditor(el.dataset.logId));
    el.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        openLogEditor(el.dataset.logId);
      }
    });
  });
  document.querySelectorAll(".tl-untimed-item[data-log-id]").forEach((el) => {
    el.addEventListener("click", () => openLogEditor(el.dataset.logId));
  });
}

function initLogEditModal() {
  document.getElementById("logEditSave")?.addEventListener("click", saveLogEditor);
  document.getElementById("logEditCancel")?.addEventListener("click", closeLogEditor);
  document.getElementById("logEditDelete")?.addEventListener("click", deleteLogEditor);
  document.getElementById("logEditBackdrop")?.addEventListener("click", closeLogEditor);
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
    {
      title: "学习",
      items: [...STUDY_CATS, ...customCategories.filter((c) => c.group === "study").map((c) => ({ label: c.label }))],
    },
    {
      title: "生活",
      items: [...LIFE_CATS, ...customCategories.filter((c) => c.group === "life").map((c) => ({ label: c.label }))],
    },
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
    tag = c.custom ? "自定义" : c.primary ? "主攻" : "后期";
  } else if (c.group === "life") {
    classes.push("life");
    tag = c.custom
      ? "自定义"
      : c.lifeKind === "sleep"
        ? "休息"
        : c.lifeKind === "phone"
          ? "记录"
          : c.lifeKind === "meal" || c.lifeKind === "errand" || c.lifeKind === "call"
            ? "日常"
            : "";
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
  const studyItems = [...STUDY_CATS, ...customCategories.filter((c) => c.group === "study").map(customAsChipMeta)];
  const lifeItems = [...LIFE_CATS, ...customCategories.filter((c) => c.group === "life").map(customAsChipMeta)];
  const parts = [
    `<div class="chip-group"><span class="chip-group-label">📖 学习</span><div class="chip-row">${studyItems.map(chipHtml).join("")}</div></div>`,
    `<div class="chip-group"><span class="chip-group-label">🏠 生活</span><div class="chip-row">${lifeItems.map(chipHtml).join("")}</div></div>`,
    `<div class="chip-group chip-group-custom-add"><button type="button" class="chip custom-add-chip" id="openTimerCustomBtn">➕ 自定义类别</button></div>`,
  ];
  wrap.innerHTML = parts.join("");

  wrap.querySelectorAll(".chip[data-subject]").forEach((chip) => {
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
      (c) => `<li class="custom-cat-item">
        <span>${escapeHtml(c.label)} <span class="custom-cat-type">${c.group === "study" ? "学习" : "生活"}</span></span>
        <button type="button" class="btn ghost sm" data-rm-cat="${escapeHtml(c.label)}">删</button>
      </li>`
    )
    .join("");

  list.querySelectorAll("[data-rm-cat]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const name = btn.getAttribute("data-rm-cat");
      if (!confirm(`删除自定义「${name}」？已有记录不会删，只是下拉里没了`)) return;
      customCategories = customCategories.filter((c) => c.label !== name);
      saveCustomCategories();
      fillSubjectSelects();
      renderTimerChips();
      renderCustomList();
      renderAll();
    });
  });
}

function addCustomCategory(name, group = "life") {
  const label = name.trim().slice(0, 12);
  if (!label) return false;
  if (getAllLabels().includes(label)) {
    alert("这个名字已经有了");
    return false;
  }
  customCategories.push({ label, group: group === "study" ? "study" : "life" });
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
    let name = tab || localStorage.getItem(TAB_KEY) || "home";
    if (name === "timeline") {
      name = "today";
      setTodayView("timeline", false);
    }
    if (isMobileLayout()) {
      panels.forEach((panel) => {
        panel.classList.toggle("panel-active", panel.dataset.panel === name);
      });
      tabs.forEach((btn) => {
        btn.classList.toggle("active", btn.dataset.tab === name);
      });
      localStorage.setItem(TAB_KEY, name);
      if (name === "today") renderDayTimeline();
      if (name === "stats") setStatsView(localStorage.getItem(STATS_VIEW_KEY) || "rank", false);
      if (name === "more") setMoreView(localStorage.getItem(MORE_VIEW_KEY) || "app", false);
    } else {
      panels.forEach((panel) => panel.classList.add("panel-active"));
    }
  }

  function navigateToTab(tab, scrollId, todayView, statsView, moreView) {
    applyTab(tab);
    if (todayView) setTodayView(todayView);
    if (statsView) setStatsView(statsView);
    else if (tab === "stats" && scrollId === "leaderboardSection") setStatsView("rank");
    if (moreView) setMoreView(moreView);
    else if (tab === "more" && scrollId === "phaseSettingsSection") setMoreView("phase");
    if (scrollId && !isMobileLayout()) {
      setTimeout(() => {
        const el = document.getElementById(scrollId);
        if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 80);
    }
  }

  tabs.forEach((btn) => {
    btn.addEventListener("click", () => applyTab(btn.dataset.tab));
  });

  document.getElementById("headerMoreBtn")?.addEventListener("click", () => applyTab("more"));

  document.querySelectorAll("[data-goto]").forEach((btn) => {
    btn.addEventListener("click", () =>
      navigateToTab(
        btn.dataset.goto,
        btn.dataset.scroll || "",
        btn.dataset.todayView || "",
        btn.dataset.statsView || "",
        btn.dataset.moreView || ""
      )
    );
  });

  window.addEventListener("resize", () => applyTab(localStorage.getItem(TAB_KEY) || "home"));
  applyTab(localStorage.getItem(TAB_KEY) || "home");
}

function setTodayView(view, save = true) {
  const name = view || "log";
  document.querySelectorAll(".today-subnav-btn").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.todayView === name);
  });
  document.querySelectorAll(".today-view").forEach((el) => {
    el.classList.toggle("active", el.dataset.todayView === name);
  });
  if (save) localStorage.setItem(TODAY_VIEW_KEY, name);
  if (name === "timeline") renderDayTimeline();
}

function setStatsView(view, save = true) {
  const name = view || "rank";
  document.querySelectorAll(".stats-subnav-btn").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.statsView === name);
  });
  document.querySelectorAll(".stats-pane").forEach((el) => {
    el.classList.toggle("active", el.dataset.statsView === name);
  });
  if (save) localStorage.setItem(STATS_VIEW_KEY, name);
}

function setMoreView(view, save = true) {
  const name = view || "app";
  document.querySelectorAll(".more-subnav-btn").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.moreView === name);
  });
  document.querySelectorAll(".more-pane").forEach((el) => {
    el.classList.toggle("active", el.dataset.moreView === name);
  });
  if (save) localStorage.setItem(MORE_VIEW_KEY, name);
}

function initTodaySubnav() {
  document.querySelectorAll(".today-subnav-btn").forEach((btn) => {
    btn.addEventListener("click", () => setTodayView(btn.dataset.todayView));
  });
  setTodayView(localStorage.getItem(TODAY_VIEW_KEY) || "log", false);
}

function initStatsSubnav() {
  document.querySelectorAll(".stats-subnav-btn").forEach((btn) => {
    btn.addEventListener("click", () => setStatsView(btn.dataset.statsView));
  });
  setStatsView(localStorage.getItem(STATS_VIEW_KEY) || "rank", false);
}

function initMoreSubnav() {
  document.querySelectorAll(".more-subnav-btn").forEach((btn) => {
    btn.addEventListener("click", () => setMoreView(btn.dataset.moreView));
  });
  setMoreView(localStorage.getItem(MORE_VIEW_KEY) || "app", false);
}

function studyMinutesByDate() {
  const map = {};
  for (const l of logs) {
    if (!isStudyLabel(l.subject)) continue;
    map[l.date] = (map[l.date] || 0) + l.minutes;
  }
  return map;
}

function sumStudyInDayRange(startOffset, days) {
  let total = 0;
  for (let i = startOffset; i < startOffset + days; i++) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const ds = d.toISOString().slice(0, 10);
    total += minutesOnDate(ds, (l) => isStudyLabel(l.subject));
  }
  return total;
}

function getTodayRankInfo() {
  const today = todayStr();
  const todayMin = minutesOnDate(today, (l) => isStudyLabel(l.subject));
  if (!todayMin) return null;
  const byDate = studyMinutesByDate();
  const sorted = Object.entries(byDate)
    .filter(([, m]) => m > 0)
    .sort((a, b) => b[1] - a[1]);
  const rank = sorted.findIndex(([date]) => date === today) + 1;
  const best = sorted[0]?.[1] || 0;
  return {
    rank: rank || sorted.length,
    total: sorted.length,
    todayMin,
    best,
    isRecord: todayMin >= best,
  };
}

function formatShortDate(dateStr) {
  const [y, m, d] = dateStr.split("-");
  const today = todayStr();
  if (dateStr === today) return "今天";
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  if (dateStr === yesterday.toISOString().slice(0, 10)) return "昨天";
  return `${y}-${m}-${d}`;
}

function leaderboardMedal(rank) {
  if (rank === 1) return "🥇";
  if (rank === 2) return "🥈";
  if (rank === 3) return "🥉";
  return `#${rank}`;
}

function leaderboardRowHtml(rank, date, minutes, highlight) {
  return `<div class="leaderboard-row${highlight ? " is-today" : ""}">
    <span class="lb-rank">${leaderboardMedal(rank)}</span>
    <span class="lb-date">${escapeHtml(formatShortDate(date))}</span>
    <span class="lb-hours">${formatHours(minutes)}</span>
  </div>`;
}

function renderDashboard() {
  const study = minutesOnDate(todayStr(), (l) => isStudyLabel(l.subject));
  const streak = calcStreak();
  const dashStudy = document.getElementById("dashTodayStudy");
  const dashStreak = document.getElementById("dashStreak");
  if (dashStudy) dashStudy.textContent = formatHours(study);
  if (dashStreak) dashStreak.textContent = streak >= 2 ? `🔥 ${streak} 天` : `${streak} 天`;

  const rankInfo = getTodayRankInfo();
  const rankWrap = document.getElementById("dashRankWrap");
  const rankEl = document.getElementById("dashTodayRank");
  if (rankInfo && study > 0) {
    if (rankWrap) rankWrap.hidden = false;
    if (rankEl) {
      rankEl.textContent = rankInfo.isRecord ? "新纪录!" : `#${rankInfo.rank}`;
    }
  } else if (rankWrap) {
    rankWrap.hidden = true;
  }
}

function renderSelfLeaderboard() {
  const byDate = studyMinutesByDate();
  const rows = Object.entries(byDate)
    .filter(([, m]) => m > 0)
    .sort((a, b) => b[1] - a[1]);
  const today = todayStr();

  const dashEl = document.getElementById("dashLeaderboard");
  if (dashEl) {
    if (!rows.length) {
      dashEl.innerHTML = `<p class="empty">还没有学习记录，点「专注计时」开始吧</p>`;
    } else {
      const preview = rows.slice(0, 5);
      dashEl.innerHTML = preview
        .map(([date, min], i) => leaderboardRowHtml(i + 1, date, min, date === today))
        .join("");
    }
  }

  const fullEl = document.getElementById("selfLeaderboardFull");
  if (fullEl) {
    if (!rows.length) {
      fullEl.innerHTML = `<p class="empty">暂无排行数据</p>`;
    } else {
      fullEl.innerHTML = rows
        .map(([date, min], i) => leaderboardRowHtml(i + 1, date, min, date === today))
        .join("");
    }
  }

  const weekEl = document.getElementById("weekCompare");
  if (weekEl) {
    const thisWeek = sumStudyInDayRange(0, 7);
    const lastWeek = sumStudyInDayRange(7, 7);
    const diff = thisWeek - lastWeek;
    const diffLabel =
      diff > 0 ? `↑ 多 ${formatHours(diff)}` : diff < 0 ? `↓ 少 ${formatHours(-diff)}` : "持平";
    const diffClass = diff > 0 ? "up" : diff < 0 ? "down" : "flat";
    weekEl.innerHTML = `<div class="week-compare-grid">
      <div class="week-compare-item"><span>近 7 天</span><strong>${formatHours(thisWeek)}</strong></div>
      <div class="week-compare-item"><span>上一周期</span><strong>${formatHours(lastWeek)}</strong></div>
      <div class="week-compare-item"><span>对比</span><strong class="week-diff ${diffClass}">${diffLabel}</strong></div>
    </div>`;
  }

  const recEl = document.getElementById("selfRecords");
  if (recEl) {
    if (!rows.length) {
      recEl.innerHTML = "";
    } else {
      const best = rows[0];
      const studyDays = rows.length;
      const totalAll = rows.reduce((s, [, m]) => s + m, 0);
      const rankInfo = getTodayRankInfo();
      recEl.innerHTML = `<div class="self-records-grid">
        <div class="record-pill"><span>单日最高</span><strong>${formatHours(best[1])}</strong><small>${escapeHtml(formatShortDate(best[0]))}</small></div>
        <div class="record-pill"><span>有学习的天</span><strong>${studyDays} 天</strong><small>累计 ${formatHours(totalAll)}</small></div>
        <div class="record-pill"><span>今日排名</span><strong>${rankInfo ? (rankInfo.isRecord ? "第 1 🎉" : `第 ${rankInfo.rank} 名`) : "—"}</strong><small>共 ${rows.length} 个学习日</small></div>
      </div>`;
    }
  }
}

function formatClockTime(d) {
  const h = String(d.getHours()).padStart(2, "0");
  const m = String(d.getMinutes()).padStart(2, "0");
  return `${h}:${m}`;
}

function dayBounds(dateStr) {
  const start = new Date(`${dateStr}T00:00:00`);
  const end = new Date(start);
  end.setDate(end.getDate() + 1);
  return { start, end };
}

function formatSegmentTimeRange(start, end, dateStr) {
  const { end: dayEnd } = dayBounds(dateStr);
  const startStr = formatClockTime(start);
  const endStr = end.getTime() >= dayEnd.getTime() ? "24:00" : formatClockTime(end);
  return `${startStr}–${endStr}`;
}

function getLogTimeRange(log) {
  if (log.startAt && log.endAt) {
    const start = new Date(log.startAt);
    const end = new Date(log.endAt);
    if (!Number.isNaN(start.getTime()) && !Number.isNaN(end.getTime()) && end > start) {
      return { start, end };
    }
  }
  if (log.subject === "睡觉" && log.note) {
    const m = log.note.match(/(\d{2}:\d{2})\s*→\s*(\d{2}:\d{2})/);
    if (m) {
      const wake = new Date(`${log.date}T${m[2]}`);
      let bed = new Date(`${log.date}T${m[1]}`);
      if (bed >= wake) bed.setDate(bed.getDate() - 1);
      if (wake > bed) return { start: bed, end: wake };
    }
  }
  return null;
}

function getTimelineSegmentForDate(log, dateStr) {
  const range = getLogTimeRange(log);
  if (!range) {
    if (log.date !== dateStr) return null;
    return { log, untimed: true };
  }

  const { start: dayStart, end: dayEnd } = dayBounds(dateStr);
  if (range.end <= dayStart || range.start >= dayEnd) return null;

  const clipStart = range.start < dayStart ? dayStart : range.start;
  const clipEnd = range.end > dayEnd ? dayEnd : range.end;
  const startMin = (clipStart - dayStart) / 60000;
  const endMin = (clipEnd - dayStart) / 60000;
  if (endMin <= startMin) return null;

  return {
    log,
    start: clipStart,
    end: clipEnd,
    startMin,
    endMin,
    isContinuation: range.start < dayStart,
    continuesNext: range.end > dayEnd,
  };
}

function timelineBlockClass(log) {
  const meta = getCategoryMeta(log.subject);
  if (meta?.group === "study") return meta.primary ? "tl-study" : "tl-study-alt";
  if (meta?.group === "life") return `tl-life-${meta.lifeKind || "other"}`;
  return "tl-custom";
}

function assignTimelineLanes(items) {
  const lanes = [];
  for (const item of items) {
    let lane = 0;
    while (lane < lanes.length) {
      const clash = lanes[lane].some((x) => item.start < x.end && item.end > x.start);
      if (!clash) break;
      lane += 1;
    }
    if (!lanes[lane]) lanes[lane] = [];
    lanes[lane].push(item);
    item.lane = lane;
  }
  return lanes.length;
}

function renderDayTimeline() {
  const lanesEl = document.getElementById("timelineLanes");
  const untimedEl = document.getElementById("timelineUntimed");
  const dateInput = document.getElementById("timelineDate");
  if (!lanesEl) return;

  const date = timelineViewDate || todayStr();
  timelineViewDate = date;
  if (dateInput) dateInput.value = date;

  const dayStartMin = TIMELINE_DAY_START * 60;
  const dayEndMin = TIMELINE_DAY_END * 60;
  const spanMin = dayEndMin - dayStartMin;

  const timed = [];
  const untimed = [];

  for (const log of logs) {
    const seg = getTimelineSegmentForDate(log, date);
    if (!seg) continue;
    if (seg.untimed) {
      untimed.push(log);
      continue;
    }
    timed.push(seg);
  }

  timed.sort((a, b) => a.startMin - b.startMin || a.endMin - b.endMin);
  const laneCount = assignTimelineLanes(timed);
  const laneCols = Math.max(1, laneCount);

  let hoursHtml = "";
  for (let h = TIMELINE_DAY_START; h <= TIMELINE_DAY_END; h += 2) {
    const top = ((h * 60 - dayStartMin) / spanMin) * 100;
    hoursHtml += `<span class="tl-hour" style="top:${top}%">${h}:00</span>`;
  }

  let blocksHtml = "";
  const gapY = 0.42;
  const gapX = 0.55;
  for (const item of timed) {
    const rawTopPct = ((item.startMin - dayStartMin) / spanMin) * 100;
    const rawHeightPct = Math.max(2.2, ((item.endMin - item.startMin) / spanMin) * 100);
    const topPct = rawTopPct + gapY / 2;
    const heightPct = Math.max(1.8, rawHeightPct - gapY);
    const laneW = 100 / laneCols;
    const leftPct = item.lane * laneW + gapX / 2;
    const widthPct = Math.max(7, laneW - gapX);
    const sizeClass =
      heightPct < 3.2 ? " tl-block--tiny" : heightPct < 5.5 ? " tl-block--compact" : " tl-block--long";
    const splitClass =
      (item.isContinuation ? " tl-block--split-top" : "") + (item.continuesNext ? " tl-block--split-bottom" : "");
    const titleBase = formatEntryDisplay(item.log.subject, item.log.subtask);
    const extra = logExtraNote(item.log);
    const title = extra ? `${titleBase} · ${extra}` : titleBase;
    const tip = item.log.note ? `${titleBase} — ${item.log.note}` : titleBase;
    const timeLabel = formatSegmentTimeRange(item.start, item.end, date);
    blocksHtml += `<div class="tl-block ${timelineBlockClass(item.log)}${sizeClass}${splitClass}" data-log-id="${escapeHtml(item.log.id)}" role="button" tabindex="0" aria-label="编辑 ${escapeHtml(title)}" style="top:${topPct}%;height:${heightPct}%;left:${leftPct}%;width:${widthPct}%" title="${escapeHtml(tip)}">
      <span class="tl-block-time">${timeLabel}${item.continuesNext ? " ↓" : item.isContinuation ? " ↑" : ""}</span>
      <span class="tl-block-label">${escapeHtml(title)}</span>
    </div>`;
  }

  lanesEl.innerHTML = `<div class="tl-hours">${hoursHtml}</div>
    <div class="tl-track" data-lanes="${laneCols}">${blocksHtml}</div>`;
  bindTimelineBlocks();

  if (untimedEl) {
    if (!untimed.length) {
      untimedEl.innerHTML = "";
    } else {
      untimedEl.innerHTML = `<p class="muted block mobile-hide-hint">未标注时段 · 点条目可编辑</p>
        <ul class="tl-untimed-list">${untimed
          .map(
            (l) =>
              `<li class="tl-untimed-item" data-log-id="${escapeHtml(l.id)}" role="button" tabindex="0"><span class="${tagClassFor(l.subject)}">${escapeHtml(formatEntryDisplay(l.subject, l.subtask))}</span> · ${formatMinutes(l.minutes)}</li>`
          )
          .join("")}</ul>`;
      bindTimelineBlocks();
    }
  }
}

function shiftTimelineDate(delta) {
  const d = new Date(`${timelineViewDate || todayStr()}T12:00:00`);
  d.setDate(d.getDate() + delta);
  timelineViewDate = d.toISOString().slice(0, 10);
  renderDayTimeline();
}

function initTimeline() {
  timelineViewDate = todayStr();
  const prev = document.getElementById("timelinePrev");
  const next = document.getElementById("timelineNext");
  const dateInput = document.getElementById("timelineDate");
  if (prev) prev.addEventListener("click", () => shiftTimelineDate(-1));
  if (next) next.addEventListener("click", () => shiftTimelineDate(1));
  if (dateInput) {
    dateInput.addEventListener("change", () => {
      timelineViewDate = dateInput.value;
      renderDayTimeline();
    });
  }
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
  for (const c of customCategories.filter((c) => c.group === "study")) {
    studyTotals[c.label] = 0;
  }
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

  const studySliceItems = [
    ...STUDY_CATS,
    ...customCategories.filter((c) => c.group === "study").map((c) => ({ label: c.label })),
  ];
  const studySlices = studySliceItems.map((c) => ({
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

  const studyRows = [
    ...STUDY_CATS.map((c) => ({ ...c, minutes: totals[c.label] || 0 })),
    ...customCategories
      .filter((c) => c.group === "study")
      .map((c) => ({ label: c.label, group: "study", primary: false, minutes: totals[c.label] || 0 })),
  ];
  const lifeRows = [
    ...LIFE_CATS.map((c) => ({ ...c, minutes: totals[c.label] || 0 })),
    ...customCategories
      .filter((c) => c.group === "life")
      .map((c) => ({ label: c.label, group: "life", lifeKind: "other", minutes: totals[c.label] || 0 })),
  ];

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
  const studyAndCustom = [
    ...STUDY_CATS,
    ...customCategories.filter((c) => c.group === "study").map((c) => ({ label: c.label })),
  ];
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
  const items = sortLogsForDate(today, logs.filter((l) => l.date === today));
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
  list.innerHTML = items.map((l) => renderLogItemHtml(l)).join("");

  list.querySelectorAll("[data-del]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = btn.getAttribute("data-del");
      logs = logs.filter((l) => l.id !== id);
      removeLogOrderId(id);
      saveLogs();
      renderAll();
    });
  });
  list.querySelectorAll("[data-note]").forEach((btn) => {
    btn.addEventListener("click", () => editLogNote(btn.getAttribute("data-note")));
  });
  initLogListDrag(list, today);
}

function initLogListDrag(list, date) {
  if (!list) return;
  let dragEl = null;
  let touchDrag = null;

  const saveOrderFromDom = () => {
    const ids = [...list.querySelectorAll(".log-item")].map((el) => el.dataset.id).filter(Boolean);
    setDayLogOrder(date, ids);
  };

  list.querySelectorAll(".log-item").forEach((item) => {
    const handle = item.querySelector(".drag-handle");
    if (!handle) return;

    handle.addEventListener("dragstart", (e) => {
      dragEl = item;
      item.classList.add("dragging");
      e.dataTransfer.effectAllowed = "move";
      e.dataTransfer.setData("text/plain", item.dataset.id);
      e.stopPropagation();
    });

    item.addEventListener("dragover", (e) => {
      if (!dragEl || dragEl === item) return;
      e.preventDefault();
      const rect = item.getBoundingClientRect();
      const mid = rect.top + rect.height / 2;
      if (e.clientY < mid) {
        list.insertBefore(dragEl, item);
      } else {
        list.insertBefore(dragEl, item.nextSibling);
      }
    });

    handle.addEventListener("dragend", () => {
      if (dragEl) dragEl.classList.remove("dragging");
      dragEl = null;
      saveOrderFromDom();
    });

    handle.addEventListener("touchstart", (e) => {
      touchDrag = { el: item };
      item.classList.add("dragging");
    }, { passive: true });

    handle.addEventListener("touchmove", (e) => {
      if (!touchDrag) return;
      e.preventDefault();
      const touch = e.touches[0];
      const over = document.elementFromPoint(touch.clientX, touch.clientY)?.closest(".log-item");
      if (!over || over === touchDrag.el || !list.contains(over)) return;
      const rect = over.getBoundingClientRect();
      if (touch.clientY < rect.top + rect.height / 2) {
        list.insertBefore(touchDrag.el, over);
      } else {
        list.insertBefore(touchDrag.el, over.nextSibling);
      }
    }, { passive: false });

    handle.addEventListener("touchend", () => {
      if (!touchDrag) return;
      touchDrag.el.classList.remove("dragging");
      touchDrag = null;
      saveOrderFromDom();
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
    <ul class="log-list cal-detail-list">${items.map((l) => renderLogItemHtml(l, { draggable: false, showActions: false })).join("")}</ul>`;
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
  renderDashboard();
  renderCountdown();
  renderSubjectProgress();
  renderSelfLeaderboard();
  renderPhaseStats();
  renderDayTimeline();
  renderWeekChart();
  renderPieCharts();
  renderCalendar();
  renderSubjectBars();
  renderSubtaskBars();
  renderTodayList();
}

function addLog({ date, subject, subtask, minutes, note, source, startAt, endAt }) {
  if (minutes < 1) return;
  const st = (subtask || "").trim().slice(0, 30);
  const id = uid();
  logs.push({
    id,
    date,
    subject,
    subtask: st,
    minutes: Math.round(minutes),
    note: note || "",
    source: source || "manual",
    startAt: startAt || "",
    endAt: endAt || "",
  });
  appendLogOrder(date, id);
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
    const end = new Date();
    const start = pomodoroWorkStartAt
      ? new Date(pomodoroWorkStartAt)
      : new Date(end.getTime() - pomodoroWorkMin * 60000);
    const userNote = getTimerNoteValue();
    addLog({
      date: todayStr(),
      subject: timerSubject,
      subtask: getTimerSubtaskValue(),
      minutes: pomodoroWorkMin,
      note: buildTimerNote("番茄钟", userNote),
      source: "pomodoro",
      startAt: start.toISOString(),
      endAt: end.toISOString(),
    });
    clearTimerNote();
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
    pomodoroWorkStartAt = Date.now();
  }

  timerStartedAt = Date.now();
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
      const end = new Date();
      const start = pomodoroWorkStartAt
        ? new Date(pomodoroWorkStartAt)
        : new Date(end.getTime() - elapsed * 1000);
      const userNote = getTimerNoteValue();
      addLog({
        date: todayStr(),
        subject: timerSubject,
        subtask: getTimerSubtaskValue(),
        minutes: Math.max(1, Math.round(elapsed / 60)),
        note: userNote
          ? `${userNote}（提前结束）`
          : "番茄钟（提前结束）",
        source: "pomodoro",
        startAt: start.toISOString(),
        endAt: end.toISOString(),
      });
      clearTimerNote();
      logged = true;
    }
    pomodoroPhase = "idle";
    pomodoroPhaseTotal = 0;
    timerSeconds = 0;
  } else if (timerMode === "normal") {
    if (timerSeconds >= 30) {
      const end = new Date();
      const start = timerStartedAt
        ? new Date(timerStartedAt)
        : new Date(end.getTime() - timerSeconds * 1000);
      addLog({
        date: todayStr(),
        subject: timerSubject,
        subtask: getTimerSubtaskValue(),
        minutes: Math.max(1, Math.round(timerSeconds / 60)),
        note: getTimerNoteValue(),
        source: "timer",
        startAt: start.toISOString(),
        endAt: end.toISOString(),
      });
      clearTimerNote();
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
  timerStartedAt = 0;
  pomodoroWorkStartAt = 0;
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

function calcTimeRangeMinutes(date, startTime, endTime) {
  if (!startTime || !endTime) return null;
  const start = new Date(`${date}T${startTime}`);
  let end = new Date(`${date}T${endTime}`);
  if (end <= start) end.setDate(end.getDate() + 1);
  const minutes = Math.round((end - start) / 60000);
  if (minutes < 1 || minutes > 720) return null;
  return { start, end, minutes };
}

function updateManualTimeHint() {
  const hint = document.getElementById("manualTimeHint");
  if (!hint) return;
  const date = document.getElementById("manualDate")?.value;
  const startTime = document.getElementById("manualStartTime")?.value;
  const endTime = document.getElementById("manualEndTime")?.value;
  if (!date || !startTime || !endTime) {
    hint.textContent = "跨夜时结束早于开始会自动算到次日";
    return;
  }
  const range = calcTimeRangeMinutes(date, startTime, endTime);
  hint.textContent = range
    ? `约 ${formatMinutes(range.minutes)}，会出现在时间轴`
    : "时间范围不对，请检查开始和结束";
}

function initManualForm() {
  document.getElementById("manualDate").value = todayStr();
  document.getElementById("manualSubject").addEventListener("change", updateSubtaskDatalists);
  for (const id of ["manualDate", "manualStartTime", "manualEndTime"]) {
    document.getElementById(id)?.addEventListener("input", updateManualTimeHint);
    document.getElementById(id)?.addEventListener("change", updateManualTimeHint);
  }
  document.getElementById("manualForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const date = document.getElementById("manualDate").value;
    const startTime = document.getElementById("manualStartTime").value;
    const endTime = document.getElementById("manualEndTime").value;
    if (!startTime || !endTime) {
      alert("请填写开始和结束时间");
      return;
    }
    const range = calcTimeRangeMinutes(date, startTime, endTime);
    if (!range) {
      alert("时间不对：结束须晚于开始，且单次不超过 12 小时");
      return;
    }
    addLog({
      date,
      subject: document.getElementById("manualSubject").value,
      subtask: document.getElementById("manualSubtask").value.trim(),
      minutes: range.minutes,
      note: document.getElementById("manualNote").value.trim(),
      source: "manual",
      startAt: range.start.toISOString(),
      endAt: range.end.toISOString(),
    });
    document.getElementById("manualSubtask").value = "";
    document.getElementById("manualNote").value = "";
    updateManualTimeHint();
    setTodayView("log");
  });
  updateManualTimeHint();
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
    const wakeDt = new Date(`${date}T${wake}`);
    let bedDt = new Date(`${date}T${bed}`);
    if (bedDt >= wakeDt) bedDt.setDate(bedDt.getDate() - 1);
    const sleepExtra = document.getElementById("sleepNote")?.value.trim() || "";
    const sleepNote = sleepExtra ? `${bed} → ${wake} · ${sleepExtra}` : `${bed} → ${wake}`;
    addLog({
      date,
      subject: "睡觉",
      minutes,
      note: sleepNote,
      source: "sleep",
      startAt: bedDt.toISOString(),
      endAt: wakeDt.toISOString(),
    });
    const sleepNoteEl = document.getElementById("sleepNote");
    if (sleepNoteEl) sleepNoteEl.value = "";
    setTodayView("log");
  });
}

function initCatGroupPick(containerId) {
  const wrap = document.getElementById(containerId);
  if (!wrap) return;
  wrap.querySelectorAll("[data-cat-group]").forEach((btn) => {
    btn.addEventListener("click", () => {
      wrap.querySelectorAll("[data-cat-group]").forEach((b) => b.classList.toggle("active", b === btn));
    });
  });
}

function initCustomForm() {
  initCatGroupPick("customCatGroupPick");
  document.getElementById("customCatForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const input = document.getElementById("customCatName");
    const group = getSelectedCatGroup("customCatGroupPick", "study");
    if (addCustomCategory(input.value, group)) {
      input.value = "";
      setTimerSubject(customCategories[customCategories.length - 1].label);
    }
  });
}

function openCustomCatModal() {
  const modal = document.getElementById("customCatModal");
  if (!modal) return;
  modal.hidden = false;
  modal.setAttribute("aria-hidden", "false");
  const input = document.getElementById("timerCustomName");
  if (input) {
    input.value = "";
    setTimeout(() => input.focus(), 80);
  }
}

function closeCustomCatModal() {
  const modal = document.getElementById("customCatModal");
  if (!modal) return;
  modal.hidden = true;
  modal.setAttribute("aria-hidden", "true");
}

function initTimerCustomForm() {
  initCatGroupPick("timerCatGroupPick");
  const form = document.getElementById("timerCustomForm");
  const chips = document.getElementById("timerChips");
  if (!form) return;

  chips?.addEventListener("click", (e) => {
    if (e.target.closest("#openTimerCustomBtn")) openCustomCatModal();
  });

  document.getElementById("customCatBackdrop")?.addEventListener("click", closeCustomCatModal);
  document.getElementById("customCatCancel")?.addEventListener("click", closeCustomCatModal);

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const input = document.getElementById("timerCustomName");
    const group = getSelectedCatGroup("timerCatGroupPick", "study");
    if (addCustomCategory(input.value, group)) {
      input.value = "";
      setTimerSubject(customCategories[customCategories.length - 1].label);
      closeCustomCatModal();
      showToast(`已添加「${customCategories[customCategories.length - 1].label}」`);
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
    const today = todayStr();
    logs = logs.filter((l) => l.date !== today);
    delete dayLogOrder[today];
    saveLogOrder();
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
      dayLogOrder,
      countdown,
      subjectGoals,
      studyPhases,
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
    importBackupFile(file).finally(() => {
      e.target.value = "";
    });
  });
}

function applyBackupData(data) {
  if (Array.isArray(data)) {
    logs = data;
  } else if (data && Array.isArray(data.logs)) {
    logs = data.logs;
    if (Array.isArray(data.customCategories)) {
      customCategories = normalizeCustomCategoriesList(data.customCategories);
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
    if (data.dayLogOrder && typeof data.dayLogOrder === "object" && !Array.isArray(data.dayLogOrder)) {
      dayLogOrder = data.dayLogOrder;
      saveLogOrder();
    }
    if (data.countdown && typeof data.countdown === "object") {
      countdown = {
        label:
          typeof data.countdown.label === "string" && data.countdown.label.trim()
            ? data.countdown.label.trim().slice(0, 20)
            : DEFAULT_COUNTDOWN.label,
        date: /^\d{4}-\d{2}-\d{2}$/.test(data.countdown.date) ? data.countdown.date : DEFAULT_COUNTDOWN.date,
        enabled: Boolean(data.countdown.enabled),
      };
      saveCountdown();
    }
    if (data.subjectGoals && typeof data.subjectGoals === "object" && !Array.isArray(data.subjectGoals)) {
      subjectGoals = {};
      for (const cat of STUDY_CATS) {
        const h = Number(data.subjectGoals[cat.label]);
        subjectGoals[cat.label] = h > 0 ? Math.min(2000, h) : 0;
      }
      saveSubjectGoals();
    }
    if (Array.isArray(data.studyPhases)) {
      studyPhases = data.studyPhases.map(normalizeStudyPhase).filter(Boolean).slice(0, MAX_STUDY_PHASES);
      sortStudyPhases();
      saveStudyPhases();
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
  renderPhaseEditList();
  renderAll();
}

function importBackupFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result);
        applyBackupData(data);
        showToast("✅ 备份导入成功");
        resolve();
      } catch {
        alert("文件格式不对");
        reject();
      }
    };
    reader.onerror = () => reject();
    reader.readAsText(file);
  });
}

function initFileDrop() {
  const overlay = document.getElementById("dropOverlay");
  if (!overlay) return;

  let depth = 0;

  const isFileDrag = (e) => [...(e.dataTransfer?.types || [])].includes("Files");

  const show = () => {
    overlay.hidden = false;
    overlay.setAttribute("aria-hidden", "false");
  };

  const hide = () => {
    overlay.hidden = true;
    overlay.setAttribute("aria-hidden", "true");
  };

  document.addEventListener("dragenter", (e) => {
    if (!isFileDrag(e)) return;
    e.preventDefault();
    depth += 1;
    show();
  });

  document.addEventListener("dragleave", (e) => {
    if (!isFileDrag(e)) return;
    depth -= 1;
    if (depth <= 0) {
      depth = 0;
      hide();
    }
  });

  document.addEventListener("dragover", (e) => {
    if (!isFileDrag(e)) return;
    e.preventDefault();
  });

  document.addEventListener("drop", (e) => {
    if (!isFileDrag(e)) return;
    e.preventDefault();
    depth = 0;
    hide();
    const file = e.dataTransfer?.files?.[0];
    if (!file) return;
    if (!file.name.endsWith(".json") && file.type !== "application/json") {
      alert("请拖入 JSON 备份文件");
      return;
    }
    importBackupFile(file);
  });
}

function normalizeTheme(theme) {
  return theme === "morandi" ? "bi" : theme;
}

function applyTheme(theme) {
  const t = normalizeTheme(theme);
  const valid = ["light", "dark", "bi", "ocean", "forest"];
  const active = valid.includes(t) ? t : "light";
  document.documentElement.setAttribute("data-theme", active);
  localStorage.setItem(THEME_KEY, active);
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) {
    const colors = {
      dark: "#1c1917",
      bi: "#8b7e9b",
      ocean: "#2a6894",
      forest: "#2a7048",
      light: "#0d6e6e",
    };
    meta.content = colors[active] || colors.light;
  }
  const btn = document.getElementById("themeToggle");
  if (btn) {
    const icons = { dark: "☀️", bi: "🎨", ocean: "🌊", forest: "🌲", light: "🌙" };
    const labels = {
      dark: "切换主题",
      bi: "切换主题",
      ocean: "切换主题",
      forest: "切换主题",
      light: "切换主题",
    };
    btn.textContent = icons[active] || icons.light;
    btn.setAttribute("aria-label", labels[active] || labels.light);
  }
  document.querySelectorAll("[data-skin]").forEach((chip) => {
    chip.classList.toggle("active", chip.dataset.skin === active);
  });
}

function initTheme() {
  const saved = normalizeTheme(localStorage.getItem(THEME_KEY) || "");
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  let theme = "light";
  if (["dark", "bi", "ocean", "forest", "light"].includes(saved)) theme = saved;
  else if (prefersDark) theme = "dark";
  applyTheme(theme);

  const btn = document.getElementById("themeToggle");
  if (btn) {
    btn.addEventListener("click", () => {
      const cur = normalizeTheme(localStorage.getItem(THEME_KEY) || "light");
      const order = ["light", "bi", "ocean", "forest", "dark"];
      const next = order[(order.indexOf(cur) + 1) % order.length];
      applyTheme(next);
    });
  }

  document.querySelectorAll("[data-skin]").forEach((chip) => {
    chip.addEventListener("click", () => applyTheme(chip.dataset.skin));
  });
}

loadLogs();
loadLogOrder();
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
initTimeline();
initLogEditModal();
initTodaySubnav();
initStatsSubnav();
initMoreSubnav();
initMobileNav();
initManualForm();
initSleepForm();
initCustomForm();
initTimerCustomForm();
initSubtaskPresetForm();
initTimerSubtaskInput();
initPomodoroForm();
initTimerMode();
initTimer();
initDailyGoalForm();
initCountdownForm();
initSubjectGoalsForm();
initStudyPhases();
initTools();
initFileDrop();
renderAll();
