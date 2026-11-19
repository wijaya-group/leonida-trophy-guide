// Leonida Trophy Guide: full 55-trophy checklist + platinum roadmap.
// Progress is stored in localStorage; export/import moves it as JSON.
// Spoilers are hidden by default: 28 story/hidden trophies stay masked.
const KEY = 'gta6-trophy-checklist';
const ROADMAP_KEY = 'gta6-roadmap-checklist';
const params = new URLSearchParams(location.search);

// A Long Road: the in-game 100% tracker counts 35 tasks, built from the
// official trophy requirements. Counts follow the tracker in the game.
const ROADMAP = [
  { cat: 'Story', items: ['Complete Chapter 1', 'Complete Chapter 2', 'Complete Chapter 3', 'Complete Chapter 4', 'Complete the final mission'] },
  { cat: 'Strangers', items: ['Stranger strand #1', 'Stranger strand #2', 'Stranger strand #3', 'Stranger strand #4', 'Stranger strand #5', 'Stranger strand #6', 'Stranger strand #7', 'Stranger strand #8'] },
  { cat: 'Activities', items: ['Try all 9 activity types', 'Complete 250 stunts', 'Gold all 42 Shooting Range challenges', 'Win drone races at all 14 locations', 'Win 20 different races', 'Beat Cal in a fishing challenge', 'Complete an arcade game', 'Play a bowling game', 'Meditate at all 18 spots'] },
  { cat: 'Collectibles', items: ['Complete 3 collectible card sets', 'WAiNK It at 100 locations', 'Discover 100 vehicles', 'Buy all 8 garage properties', 'Register 10 vehicles (Scooter Bros)'] },
  { cat: 'Exploration', items: ['Explore all 52 areas of Leonida', 'Hunt a unique animal for Bret'] },
  { cat: 'Combat', items: ['Complete 50 challenges', 'Rob 5 bank vaults and escape', 'Rob an illegal operation of each of the 9 gangs', 'Rob an armored truck and escape', 'Rob a jewelry store without being detected', 'Down 5 enemies in one Combat Focus'] },
];
const ROADMAP_TOTAL = ROADMAP.reduce((n, g) => n + g.items.length, 0); // 35

const $ = (id) => document.getElementById(id);

// Live UTC clock in the hero: full date + time, ticking every second.
// Always UTC (getUTC*), never the browser's local time.
const DAYS = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
const MONTHS = ['JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE', 'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER'];
const pad = (n) => String(n).padStart(2, '0');
function tickClock() {
  const now = new Date();
  const dateEl = $('utc-date');
  const timeEl = $('utc-time');
  if (!dateEl || !timeEl) return;
  dateEl.textContent = `${DAYS[now.getUTCDay()]}, ${now.getUTCDate()} ${MONTHS[now.getUTCMonth()]} ${now.getUTCFullYear()}`;
  timeEl.textContent = `${pad(now.getUTCHours())}:${pad(now.getUTCMinutes())}:${pad(now.getUTCSeconds())}`;
}
tickClock();
setInterval(tickClock, 1000);

const doc = await (await fetch('data/trophies.json')).json();
const byName = new Map(doc.trophies.map((t) => [t.name, t.id]));

// Load earned set (ids). Migrate the starter's name-based saves if present.
let stored = [];
try { stored = JSON.parse(localStorage.getItem(KEY) ?? '[]'); } catch { stored = []; }
let earned = new Set(stored.map((v) => (typeof v === 'number' ? v : byName.get(v))).filter((v) => v != null));

// Demo mode (?demo=1): show a lively half-finished checklist for screenshots,
// in memory only — nothing is written to localStorage.
const demo = params.get('demo') === '1';
if (demo) earned = new Set([2, 3, 8, 15, 16, 19, 21, 28, 35, 42, 46, 53]);

let roadmapDone = new Set();
try { roadmapDone = new Set(JSON.parse(localStorage.getItem(ROADMAP_KEY) ?? '[]')); } catch { roadmapDone = new Set(); }
if (demo) roadmapDone = new Set([0, 1, 2, 5, 6, 13, 14, 22, 23, 30]);

function save() {
  if (demo) return;
  localStorage.setItem(KEY, JSON.stringify([...earned]));
  localStorage.setItem(ROADMAP_KEY, JSON.stringify([...roadmapDone]));
}

// URL params drive the starter's shots (grade / kind / spoilers / search / scroll).
const gradeEl = $('grade'), kindEl = $('kind'), statusEl = $('status'),
  searchEl = $('search'), missableEl = $('missable-only'), spoilersEl = $('spoilers');
if (params.get('grade')) gradeEl.value = params.get('grade');
if (params.get('kind')) kindEl.value = params.get('kind');
if (params.get('status')) statusEl.value = params.get('status');
if (params.get('q')) searchEl.value = params.get('q');
if (params.get('missable') === '1') missableEl.checked = true;
spoilersEl.checked = params.get('spoilers') !== 'hide' && params.get('spoilers') === 'show';
if (params.get('spoilers') === 'show') spoilersEl.checked = true;

function renderRoadmap() {
  const list = $('roadmap-list');
  list.replaceChildren();
  let idx = 0;
  for (const group of ROADMAP) {
    for (const item of group.items) {
      const i = idx++;
      const li = document.createElement('li');
      if (roadmapDone.has(i)) li.classList.add('done');
      const box = document.createElement('input');
      box.type = 'checkbox';
      box.checked = roadmapDone.has(i);
      box.setAttribute('aria-label', item);
      box.addEventListener('change', () => {
        if (box.checked) roadmapDone.add(i); else roadmapDone.delete(i);
        save();
        renderRoadmap();
      });
      const cat = document.createElement('span');
      cat.className = 'cat';
      cat.textContent = group.cat;
      const text = document.createElement('span');
      text.textContent = item;
      li.append(box, cat, text);
      list.append(li);
    }
  }
  $('roadmap-count').textContent = `— ${roadmapDone.size} of ${ROADMAP_TOTAL} done`;
}

function cardFor(t) {
  const showSpoilers = spoilersEl.checked;
  const isEarned = earned.has(t.id);
  const masked = t.hidden && !showSpoilers && !isEarned;
  const card = document.createElement('article');
  card.className = 'card' + (isEarned ? ' earned' : '') + (masked ? ' masked' : '');
  if (masked) {
    card.innerHTML = `<div class="lock">🔒</div>
      <p><strong>Hidden trophy</strong><br>Story / hidden — turn on “Show spoilers” to reveal it.</p>
      <span class="grade ${t.grade}">${t.grade}</span>`;
    return card;
  }
  const top = document.createElement('div');
  top.className = 'card-top';
  const box = document.createElement('input');
  box.type = 'checkbox';
  box.checked = isEarned;
  box.setAttribute('aria-label', `Earned: ${t.name}`);
  box.addEventListener('change', () => {
    if (box.checked) earned.add(t.id); else earned.delete(t.id);
    save();
    render();
  });
  const grade = document.createElement('span');
  grade.className = `grade ${t.grade}`;
  grade.textContent = t.grade;
  const kind = document.createElement('span');
  kind.className = 'kind-tag';
  kind.textContent = t.kind;
  top.append(box, grade, kind);
  const name = document.createElement('h3');
  name.textContent = t.name;
  const desc = document.createElement('p');
  desc.className = 'desc';
  desc.textContent = t.description;
  const guide = document.createElement('p');
  guide.className = 'guide';
  guide.textContent = t.guide;
  card.append(top, name, desc, guide);
  if (t.missable) {
    const warn = document.createElement('p');
    warn.className = 'warn';
    warn.innerHTML = '<b>⚠ Potentially missable.</b> ';
    warn.append(document.createTextNode(t.missable));
    card.append(warn);
  }
  if (t.warning) {
    const warn = document.createElement('p');
    warn.className = 'warn';
    warn.innerHTML = '<b>⚠ Time-sensitive.</b> ';
    warn.append(document.createTextNode(t.warning));
    card.append(warn);
  }
  const src = document.createElement('p');
  src.className = 'source';
  src.textContent = `Source: ${t.source}`;
  card.append(src);
  return card;
}

function render() {
  const q = searchEl.value.trim().toLowerCase();
  const cards = $('cards');
  cards.replaceChildren();
  let shown = 0;
  for (const t of doc.trophies) {
    if (gradeEl.value !== 'all' && t.grade !== gradeEl.value) continue;
    if (kindEl.value !== 'all' && t.kind !== kindEl.value) continue;
    if (statusEl.value === 'earned' && !earned.has(t.id)) continue;
    if (statusEl.value === 'missing' && earned.has(t.id)) continue;
    if (missableEl.checked && !t.missable && !t.warning) continue;
    if (q && !(t.name + ' ' + t.description + ' ' + t.guide).toLowerCase().includes(q)) continue;
    cards.append(cardFor(t));
    shown++;
  }
  $('empty').hidden = shown > 0;
  $('list-count').textContent = `— showing ${shown} of ${doc.trophies.length}`;
  const pct = Math.round((earned.size / doc.trophies.length) * 100);
  $('progress-fill').style.width = `${pct}%`;
  $('progress-text').textContent = `${earned.size} of ${doc.trophies.length} earned · ${pct}%` +
    (earned.size === doc.trophies.length ? ' — Platinum!' : '');
  $('spoiler-note').hidden = spoilersEl.checked;
}

$('export').addEventListener('click', () => {
  const payload = {
    game: 'Grand Theft Auto VI', platform: 'PS5',
    exported_at: new Date().toISOString(),
    earned: [...earned].sort((a, b) => a - b),
    roadmap: [...roadmapDone].sort((a, b) => a - b),
  };
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' }));
  a.download = 'gta6-trophy-progress.json';
  a.click();
});
$('import').addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  try {
    const data = JSON.parse(await file.text());
    const ids = Array.isArray(data) ? data : (data.earned ?? []);
    const valid = new Set(doc.trophies.map((t) => t.id));
    earned = new Set(ids.map((v) => (typeof v === 'number' ? v : byName.get(v))).filter((v) => valid.has(v)));
    if (Array.isArray(data.roadmap)) roadmapDone = new Set(data.roadmap.filter((i) => i >= 0 && i < ROADMAP_TOTAL));
    save();
    render();
    renderRoadmap();
  } catch {
    alert('That file is not a valid trophy progress export.');
  }
  e.target.value = '';
});
$('reset').addEventListener('click', () => {
  if (!confirm('Reset all trophy and roadmap progress?')) return;
  earned = new Set();
  roadmapDone = new Set();
  save();
  render();
  renderRoadmap();
});
for (const el of [gradeEl, kindEl, statusEl, searchEl, missableEl, spoilersEl]) {
  el.addEventListener(el.tagName === 'SELECT' || el.type === 'search' ? 'input' : 'change', render);
}

renderRoadmap();
render();

// Screenshot support: the starter's shots.json uses ?grade= and ?scroll=.
if (params.get('scroll')) window.scrollTo(0, Number(params.get('scroll')));
window.__shotReady = true;
