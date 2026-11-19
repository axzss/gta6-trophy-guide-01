// Leonida Platinum — offline GTA VI trophy guide & tracker.
// Loads only app/data/trophies.json (a file inside app/). No network requests at runtime:
// source links are plain <a> anchors the reader may follow; the app itself never fetches them.
const STORE_KEY = 'gta6-trophy-guide-01-progress-v1';
const DEMO_EARNED = [2, 3, 8, 16, 20, 21, 28, 31, 33, 35, 46, 53, 54];

const SOURCES = {
  exophase: { name: 'Exophase — GTA VI trophy list (official names, descriptions, grades)', url: 'https://www.exophase.com/game/grand-theft-auto-vi-psn/trophies/' },
  psnprofiles: { name: 'PSNProfiles — Grand Theft Auto VI trophies (grades and PSN counts)', url: 'https://psnprofiles.com/trophies/43531-grand-theft-auto-vi' },
  powerpyx: { name: 'PowerPyx — GTA 6 Trophy Guide & Roadmap (methods, roadmap, missable)', url: 'https://www.powerpyx.com/gta-6-grand-theft-auto-vi-trophy-guide-roadmap/' },
  outputlag: { name: 'OutputLag — GTA 6 Trophy List (counts, corroboration)', url: 'https://outputlag.com/guides/gta-6-trophy-list/' },
  keengamer: { name: 'KeenGamer — GTA 6 Trophy Guide & Platinum Roadmap', url: 'https://www.keengamer.com/articles/guides/gta-6-trophy-guide-platinum-roadmap-all-55-trophies/' },
  wikigtavi: { name: 'WikiGTAVI — GTA 6 Trophies & Achievements (hidden-trophy breakdown)', url: 'https://www.wikigtavi.com/achievements' },
};

const ROADMAP_PHASES = [
  { title: 'Phase 1 — Finish the story', hours: '60–80 hours · Chapters 1–5', items: [
    'Play the main missions in order. All 12 chapter and mission trophies pop automatically — none can be missed.',
    'Chapter 1, morning after “Down to Earth”: talk to Lucia in the kitchen, follow her to the balcony, choose Accept and meditate. This is the one possibly-missable trophy (Positive Mental Attitude).',
    'Keep a manual save at the start and end of every chapter — 15 manual slots, no mission replay.',
    'As you go: scan new vehicles with WAiNK, study animals with the binoculars, and take optional missions as they appear. All of it counts toward 100% later.',
  ] },
  { title: 'Phase 2 — The 100% checklist', hours: 'About 100 hours · after the credits', items: [
    'Open Progress > Stats > 100% Completion. It is roughly 60% of true completion — forgiving, but the all-or-nothing rows are the long pole.',
    'Clear the all-or-nothing rows: all robberies, all 39 gang operations, all 8 bank vaults, all 42 Shooting Range golds, all 42 drone time trials, all 15 Target Decks.',
    'Grind the big counts: 100 optional missions, 200 of 277 vehicles, 100 of 255 animals, 300 stunts, any 70 of 80 challenges, 15 of 18 meditations.',
    'This phase earns the gold A Long Road — the hardest trophy on the list.',
  ] },
  { title: 'Phase 3 — Strangers & cleanup', hours: 'About 10 hours · free roam', items: [
    'Complete 8 Strangers & Freaks strands — Kirk, Kyle, Yago and Pilot Pete are confirmed to count; named-character lines do not.',
    'Clean up the remaining miscellaneous trophies: garages, vehicle registration, money, Combat Focus, the secret one-offs.',
    'Four trophies had no confirmed method at launch (In The Beginning…, Bad Luck I Guess, The Truth Is Out There, Ten Pin). Check their guides — and the cited sources — for updates before grinding them.',
    'When the 54th trophy pops, the Platinum (Vice Got a Price!) unlocks by itself.',
  ] },
];

const KIND_LABELS = { story: 'Story', activities: 'Activities', collectibles: 'Collectibles', combat: 'Combat & robbery', exploration: 'Exploration', misc: 'Miscellaneous' };
const GRADE_LABELS = { platinum: 'Platinum', gold: 'Gold', silver: 'Silver', bronze: 'Bronze' };

const params = new URLSearchParams(location.search);
const demoMode = params.get('demo') === '1';
let trophies = [];
let earned = new Set();
let selectedId = 28;
let currentView = 'checklist';

function loadStoredProgress() {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw);
    const ids = Array.isArray(parsed) ? parsed : parsed.earned;
    return new Set((ids || []).filter((n) => Number.isInteger(n) && n >= 1 && n <= 55));
  } catch { return new Set(); }
}
function saveProgress() {
  if (demoMode) return;
  localStorage.setItem(STORE_KEY, JSON.stringify({ app: 'gta6-trophy-guide-01', earned: [...earned].sort((a, b) => a - b) }));
}
function trophyById(id) { return trophies.find((t) => t.id === id); }
function isSpoilerHidden(t) {
  return document.getElementById('spoiler').checked && t.kind === 'story' && !earned.has(t.id);
}
function gradeBadge(t) {
  const s = document.createElement('span');
  s.className = 'badge ' + t.grade;
  s.textContent = GRADE_LABELS[t.grade];
  return s;
}
function tag(text, cls) {
  const s = document.createElement('span');
  s.className = 'tag' + (cls ? ' ' + cls : '');
  s.textContent = text;
  return s;
}

function applyUrlParams() {
  const view = params.get('view');
  if (view && ['checklist', 'roadmap', 'missables', 'tracker'].includes(view)) currentView = view;
  const tid = Number(params.get('trophy'));
  if (tid >= 1 && tid <= 55) selectedId = tid;
  const set = (id, value) => { const el = document.getElementById(id); if (el && value !== null) el.value = value; };
  set('grade', params.get('grade'));
  set('kind', params.get('kind'));
  set('status', params.get('status'));
  set('q', params.get('q'));
  if (params.get('missable') === '1') document.getElementById('missableOnly').checked = true;
  if (params.get('spoiler') === 'off') document.getElementById('spoiler').checked = false;
  if (params.get('spoiler') === 'on') document.getElementById('spoiler').checked = true;
}

function updateProgressRing() {
  const pct = Math.round((earned.size / trophies.length) * 100);
  document.getElementById('pctBig').textContent = pct + '%';
  document.getElementById('countBig').textContent = earned.size + ' / ' + trophies.length;
  document.getElementById('ringFg').style.strokeDashoffset = String(326.7 * (1 - earned.size / trophies.length));
  const counts = {};
  for (const t of trophies) counts[t.grade] = (counts[t.grade] || 0) + (earned.has(t.id) ? 1 : 0);
  const totals = {};
  for (const t of trophies) totals[t.grade] = (totals[t.grade] || 0) + 1;
  const box = document.getElementById('gradeCounts');
  box.replaceChildren();
  for (const g of ['platinum', 'gold', 'silver', 'bronze']) {
    const s = document.createElement('span');
    s.className = 'gc';
    s.innerHTML = '';
    const b = document.createElement('b');
    b.textContent = (counts[g] || 0) + '/' + totals[g];
    s.append(b, document.createTextNode(' ' + GRADE_LABELS[g]));
    box.append(s);
  }
  const miss = trophyById(28);
  document.getElementById('missablePill').textContent = miss && earned.has(28) ? 'done' : '1';
}

function filteredTrophies() {
  const q = document.getElementById('q').value.trim().toLowerCase();
  const grade = document.getElementById('grade').value;
  const kind = document.getElementById('kind').value;
  const status = document.getElementById('status').value;
  const missOnly = document.getElementById('missableOnly').checked;
  return trophies.filter((t) => {
    if (grade !== 'all' && t.grade !== grade) return false;
    if (kind !== 'all' && t.kind !== kind) return false;
    if (status === 'earned' && !earned.has(t.id)) return false;
    if (status === 'unearned' && earned.has(t.id)) return false;
    if (missOnly && !t.missable) return false;
    if (q && !(t.name + ' ' + t.description + ' ' + t.guide + ' ' + KIND_LABELS[t.kind]).toLowerCase().includes(q)) return false;
    return true;
  });
}

function renderChecklist() {
  const list = document.getElementById('trophyList');
  const rows = filteredTrophies();
  list.replaceChildren();
  document.getElementById('emptyMsg').hidden = rows.length > 0;
  document.getElementById('showing').textContent = 'Showing ' + rows.length + ' of 55 trophies · ' + earned.size + ' earned · click a row to open its guide';
  for (const t of rows) {
    const li = document.createElement('li');
    if (t.id === selectedId) li.classList.add('selected');
    if (earned.has(t.id)) li.classList.add('earned');
    const box = document.createElement('input');
    box.type = 'checkbox';
    box.checked = earned.has(t.id);
    box.setAttribute('aria-label', 'Mark ' + t.name + ' earned');
    box.addEventListener('change', () => {
      if (demoMode) { earned = new Set(earned); }
      if (box.checked) earned.add(t.id); else earned.delete(t.id);
      saveProgress();
      renderAll();
    });
    box.addEventListener('click', (e) => e.stopPropagation());
    const mid = document.createElement('div');
    if (isSpoilerHidden(t)) {
      const n = document.createElement('div');
      n.className = 'tName masked';
      n.textContent = 'Hidden story trophy — earn it to reveal';
      const d = document.createElement('div');
      d.className = 'tDesc masked';
      d.textContent = 'Spoilers on: the name and description stay hidden until this trophy is earned.';
      mid.append(n, d);
    } else {
      const n = document.createElement('div');
      n.className = 'tName';
      n.textContent = t.name;
      const d = document.createElement('div');
      d.className = 'tDesc';
      d.textContent = t.description;
      mid.append(n, d);
    }
    const tags = document.createElement('div');
    tags.className = 'tTags';
    tags.append(tag(KIND_LABELS[t.kind]));
    if (t.hidden) tags.append(tag('Hidden on PSN', 'hiddenTag'));
    if (t.missable) tags.append(tag('⚠ Possibly missable', 'miss'));
    mid.append(tags);
    const right = document.createElement('div');
    right.className = 'tEarned' + (earned.has(t.id) ? '' : ' no');
    right.textContent = earned.has(t.id) ? '✓ Earned' : 'Not earned';
    li.append(box, gradeBadge(t), mid, right);
    li.addEventListener('click', () => { selectedId = t.id; renderAll(); });
    list.append(li);
  }
}

function renderDetail() {
  const t = trophyById(selectedId) || trophies[0];
  const box = document.getElementById('detail');
  box.replaceChildren();
  const hidden = isSpoilerHidden(t);
  const head = document.createElement('div');
  head.className = 'metaRow';
  head.append(gradeBadge(t), tag(KIND_LABELS[t.kind]));
  if (t.hidden) head.append(tag('Hidden on PSN', 'hiddenTag'));
  if (t.missable) head.append(tag('⚠ Possibly missable', 'miss'));
  if (earned.has(t.id)) head.append(tag('✓ Earned', ''));
  box.append(head);
  const h = document.createElement('h2');
  h.textContent = hidden ? 'Hidden story trophy' : t.name;
  box.append(h);
  const off = document.createElement('p');
  off.className = 'official';
  off.textContent = hidden
    ? 'Spoilers on: this story trophy stays hidden until you earn it. Turn “Hide spoilers” off to reveal it.'
    : 'Official description: “' + t.description + '” — as PlayStation publishes it.';
  box.append(off);
  const guideH = document.createElement('h4');
  guideH.textContent = 'Guide';
  const guide = document.createElement('p');
  guide.textContent = hidden ? 'Earn this trophy in the story, or turn spoilers off to read the guide.' : t.guide;
  box.append(guideH, guide);
  if (!hidden) {
    const srcH = document.createElement('h4');
    srcH.textContent = 'Sources — where each fact comes from';
    const ul = document.createElement('ul');
    ul.className = 'srcList';
    for (const key of t.sources || ['exophase', 'psnprofiles']) {
      const s = SOURCES[key];
      if (!s) continue;
      const li = document.createElement('li');
      const a = document.createElement('a');
      a.className = 'src';
      a.href = s.url;
      a.textContent = s.name;
      li.append(a);
      ul.append(li);
    }
    const own = document.createElement('li');
    own.textContent = 'Guide text: written for this entry, in our own words — cited, never copied.';
    ul.append(own);
    box.append(srcH, ul);
    const stepsH = document.createElement('h4');
    stepsH.textContent = 'Steps';
    const ol = document.createElement('ol');
    for (const s of t.steps || []) {
      const li = document.createElement('li');
      li.textContent = s;
      ol.append(li);
    }
    box.append(stepsH, ol);
    if (t.tip) {
      const tip = document.createElement('div');
      tip.className = 'tipBox';
      const b = document.createElement('strong');
      b.textContent = 'Tip: ';
      tip.append(b, document.createTextNode(t.tip));
      box.append(tip);
    }
    if (t.missable) {
      const m = document.createElement('div');
      m.className = 'missBox';
      const b = document.createElement('strong');
      b.textContent = 'Possibly missable — ';
      m.append(b, document.createTextNode('the Chapter 1 balcony meditation disappears once Chapter 1 ends. Do it in Chapter 1; whether it is required is still unconfirmed, so doing it is the safe choice.'));
      box.append(m);
    }
  }
  const actions = document.createElement('div');
  actions.className = 'actions';
  const toggle = document.createElement('button');
  toggle.type = 'button';
  toggle.textContent = earned.has(t.id) ? '✓ Earned — click to unmark' : 'Mark as earned';
  toggle.addEventListener('click', () => {
    if (earned.has(t.id)) earned.delete(t.id); else earned.add(t.id);
    saveProgress();
    renderAll();
  });
  const prev = document.createElement('button');
  prev.type = 'button';
  prev.className = 'navBtn';
  prev.textContent = '← Previous trophy';
  prev.addEventListener('click', () => { selectedId = t.id > 1 ? t.id - 1 : 55; renderAll(); });
  const next = document.createElement('button');
  next.type = 'button';
  next.className = 'navBtn';
  next.textContent = 'Next trophy →';
  next.addEventListener('click', () => { selectedId = t.id < 55 ? t.id + 1 : 1; renderAll(); });
  actions.append(toggle, prev, next);
  box.append(actions);
}

function renderRoadmap() {
  const wrap = document.getElementById('phases');
  wrap.replaceChildren();
  for (const p of ROADMAP_PHASES) {
    const d = document.createElement('div');
    d.className = 'phase';
    const h = document.createElement('h3');
    h.textContent = p.title;
    const hrs = document.createElement('div');
    hrs.className = 'hours';
    hrs.textContent = p.hours;
    const ul = document.createElement('ul');
    for (const item of p.items) {
      const li = document.createElement('li');
      li.textContent = item;
      ul.append(li);
    }
    d.append(h, hrs, ul);
    wrap.append(d);
  }
}

function missableReason(t) {
  if (t.missable) return 'The Chapter 1 balcony meditation is gone once Chapter 1 ends.';
  if (t.kind === 'story') return 'Automatic story trophy — cannot be missed.';
  if ([44, 49, 50, 51].includes(t.id)) return 'No confirmed method yet at launch; free roam stays open, so nothing is lost by waiting.';
  return 'Available in post-story free roam.';
}
function renderMissables() {
  const m = trophyById(28);
  const card = document.getElementById('missableCard');
  card.replaceChildren();
  const h = document.createElement('h3');
  h.textContent = '⚠ Positive Mental Attitude — meditate at every spot across Leonida';
  const p1 = document.createElement('p');
  p1.textContent = 'The only trophy that may be missable. During Chapter 1, on the morning after the mission Down to Earth, Lucia talks about meditating in the kitchen at Jason’s house and walks out to the balcony. Follow her, choose Accept, and she teaches you to meditate. That offer disappears for good once Chapter 1 ends. Whether it is actually required is still unconfirmed — it raises the counter by +1 but is not marked as a Meditation Spot like the other 18 — but PowerPyx’s author earned the trophy after doing it, so doing it is the safe choice.';
  const p2 = document.createElement('p');
  p2.textContent = 'Status in this tracker: ' + (earned.has(28) ? 'earned — you are safe.' : 'not earned yet — do the Chapter 1 meditation before the chapter ends.');
  const a = document.createElement('a');
  a.className = 'src';
  a.href = SOURCES.powerpyx.url;
  a.textContent = 'PowerPyx — GTA 6 Trophy Guide & Roadmap';
  const p3 = document.createElement('p');
  p3.append(document.createTextNode('Source: '), a);
  card.append(h, p1, p2, p3);
  const body = document.querySelector('#missableTable tbody');
  body.replaceChildren();
  for (const t of trophies) {
    const tr = document.createElement('tr');
    const name = document.createElement('td');
    name.textContent = t.name;
    const grade = document.createElement('td');
    grade.textContent = GRADE_LABELS[t.grade];
    const miss = document.createElement('td');
    miss.textContent = t.missable ? 'YES — possibly' : 'No';
    if (t.missable) miss.style.color = 'var(--warn)';
    const why = document.createElement('td');
    why.textContent = missableReason(t);
    tr.append(name, grade, miss, why);
    body.append(tr);
  }
}

function barRow(label, done, total) {
  const wrap = document.createElement('div');
  wrap.className = 'barRow';
  const lbl = document.createElement('div');
  lbl.className = 'lbl';
  const a = document.createElement('span');
  a.textContent = label;
  const b = document.createElement('span');
  b.textContent = done + ' / ' + total;
  lbl.append(a, b);
  const bar = document.createElement('div');
  bar.className = 'bar';
  const fill = document.createElement('i');
  fill.style.width = (total ? Math.round((done / total) * 100) : 0) + '%';
  bar.append(fill);
  wrap.append(lbl, bar);
  return wrap;
}
function renderTracker() {
  const grid = document.getElementById('statGrid');
  grid.replaceChildren();
  const mk = (title, body) => {
    const d = document.createElement('div');
    d.className = 'stat';
    const b = document.createElement('b');
    b.textContent = title;
    const s = document.createElement('span');
    s.textContent = body;
    d.append(b, s);
    return d;
  };
  const storyDone = trophies.filter((t) => t.kind === 'story' && earned.has(t.id)).length;
  const card1 = mk(earned.size + ' / 55', 'trophies earned — ' + Math.round((earned.size / 55) * 100) + '% to the Platinum');
  for (const g of ['platinum', 'gold', 'silver', 'bronze']) {
    card1.append(barRow(GRADE_LABELS[g], trophies.filter((t) => t.grade === g && earned.has(t.id)).length, trophies.filter((t) => t.grade === g).length));
  }
  const card2 = mk(storyDone + ' / 12', 'story trophies earned');
  for (const k of ['activities', 'collectibles', 'combat', 'exploration', 'misc']) {
    card2.append(barRow(KIND_LABELS[k], trophies.filter((t) => t.kind === k && earned.has(t.id)).length, trophies.filter((t) => t.kind === k).length));
  }
  const card3 = mk(earned.has(28) ? 'Safe' : 'At risk', 'the one possibly-missable trophy: Positive Mental Attitude');
  const card4 = mk((55 - earned.size) + ' left', 'unearned trophies — see “Next up” for the roadmap order');
  grid.append(card1, card2, card3, card4);
  document.getElementById('saveState').textContent = demoMode
    ? 'Demo progress shown for screenshots — tick a trophy to start your own saved progress.'
    : 'Saved in this browser (localStorage) under “gta6-trophy-guide-01-progress-v1”. ' + earned.size + ' trophies stored.';
  const order = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 28, 14, 15, 17, 18, 19, 30, 31, 32, 35, 40, 42, 25, 22, 23, 24, 26, 27, 29, 33, 34, 36, 37, 38, 39, 41, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 16, 20, 21, 1];
  const next = document.getElementById('nextUp');
  next.replaceChildren();
  for (const id of order) {
    if (next.children.length >= 5) break;
    if (earned.has(id)) continue;
    const t = trophyById(id);
    const li = document.createElement('li');
    const b = document.createElement('strong');
    b.textContent = t.name + ' ';
    li.append(b, document.createTextNode('(' + GRADE_LABELS[t.grade] + ' · ' + KIND_LABELS[t.kind] + ')'));
    next.append(li);
  }
  if (next.children.length === 0) {
    const li = document.createElement('li');
    li.textContent = 'All 55 earned — the Platinum is yours.';
    next.append(li);
  }
  const preview = document.getElementById('spoilerPreview');
  preview.replaceChildren();
  for (const t of trophies.filter((x) => x.kind === 'story').slice(0, 4)) {
    const li = document.createElement('li');
    li.append(gradeBadge(t));
    const mid = document.createElement('div');
    const n = document.createElement('div');
    n.className = 'tName masked';
    n.textContent = 'Hidden story trophy — earn it to reveal';
    const d = document.createElement('div');
    d.className = 'tDesc masked';
    d.textContent = 'Spoilers on: name and description hidden until earned.';
    mid.append(n, d);
    li.append(mid);
    preview.append(li);
  }
}

function setView(view) {
  currentView = view;
  for (const b of document.querySelectorAll('#tabs button')) {
    b.classList.toggle('active', b.dataset.view === view);
  }
  for (const v of ['checklist', 'roadmap', 'missables', 'tracker']) {
    document.getElementById('view-' + v).hidden = v !== view;
  }
  const toolbar = document.querySelector('.toolbar');
  const showing = document.getElementById('showing');
  toolbar.style.display = view === 'checklist' ? '' : 'none';
  showing.style.display = view === 'checklist' ? '' : 'none';
  if (view === 'roadmap') renderRoadmap();
  if (view === 'missables') renderMissables();
  if (view === 'tracker') renderTracker();
}

function exportProgress() {
  const data = JSON.stringify({ app: 'gta6-trophy-guide-01', earned: [...earned].sort((a, b) => a - b) }, null, 2);
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([data], { type: 'application/json' }));
  a.download = 'gta6-trophy-progress.json';
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}
async function importProgress(file) {
  if (!file) return;
  try {
    const parsed = JSON.parse(await file.text());
    const ids = Array.isArray(parsed) ? parsed : parsed.earned;
    if (!Array.isArray(ids)) throw new Error('no earned list');
    const next = new Set();
    for (const raw of ids) {
      const n = typeof raw === 'number' ? raw : Number(raw);
      if (Number.isInteger(n) && n >= 1 && n <= 55) next.add(n);
      else if (typeof raw === 'string') {
        const t = trophies.find((x) => x.name === raw);
        if (t) next.add(t.id);
      }
    }
    earned = next;
    saveProgress();
    renderAll();
  } catch {
    document.getElementById('saveState').textContent = 'That file could not be imported — it needs an “earned” list of trophy numbers 1–55.';
  }
}
function resetProgress() {
  earned = new Set();
  saveProgress();
  renderAll();
}

function renderAll() {
  updateProgressRing();
  renderChecklist();
  renderDetail();
  if (currentView === 'roadmap') renderRoadmap();
  if (currentView === 'missables') renderMissables();
  if (currentView === 'tracker') renderTracker();
}

async function loadTrophyData() {
  const res = await fetch('data/trophies.json');
  const doc = await res.json();
  trophies = doc.trophies.slice().sort((a, b) => a.id - b.id);
}

async function bootGuide() {
  await loadTrophyData();
  earned = demoMode ? new Set(DEMO_EARNED) : loadStoredProgress();
  applyUrlParams();
  for (const b of document.querySelectorAll('#tabs button')) {
    b.addEventListener('click', () => setView(b.dataset.view));
  }
  for (const id of ['q', 'grade', 'kind', 'status', 'missableOnly', 'spoiler']) {
    document.getElementById(id).addEventListener(id === 'q' ? 'input' : 'change', () => { renderChecklist(); renderDetail(); });
  }
  document.getElementById('exportBtn').addEventListener('click', exportProgress);
  document.getElementById('exportBtn2').addEventListener('click', exportProgress);
  document.getElementById('importFile').addEventListener('change', (e) => importProgress(e.target.files[0]));
  document.getElementById('importFile2').addEventListener('change', (e) => importProgress(e.target.files[0]));
  document.getElementById('resetBtn').addEventListener('click', resetProgress);
  document.getElementById('resetBtn2').addEventListener('click', resetProgress);
  setView(currentView);
  renderAll();
}

bootGuide();
