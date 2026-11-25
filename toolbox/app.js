/* ===== Core, i18n, router, views ===== */
const store = {
  get(k, d) { try { const v = localStorage.getItem('lss.' + k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } },
  set(k, v) { try { localStorage.setItem('lss.' + k, JSON.stringify(v)); } catch (e) {} }
};
const S = {
  lang: store.get('lang', 'cs'),
  done: store.get('done', {}),
  best: store.get('best', null),
  theme: store.get('theme', 'auto'),
  cat: 'all', phase: null, q: '', tab: 'learn'
};
const tr = o => o == null ? '' : typeof o === 'string' ? o : (o[S.lang] ?? o.en);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const fmt = (n, d = 2) => (n == null || !isFinite(n)) ? '–' : Number(n).toLocaleString(S.lang === 'cs' ? 'cs-CZ' : 'en-GB', { minimumFractionDigits: d, maximumFractionDigits: d });
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const toolById = id => TOOLS.find(t => t.id === id);

const UI = {
  cs: {
    nav_tools: 'Nástroje', nav_dmaic: 'DMAIC', nav_house: 'Dům Lean', nav_quiz: 'Kvíz', nav_gloss: 'Slovník',
    kicker: 'Interaktivní vzdělávací toolbox', h1: 'Zlepšujeme procesy.<br>Každý den.',
    lead: 'Nástroje a metody Lean a Six Sigma na jednom místě – srozumitelně vysvětlené, s příklady z výroby a s interaktivními kalkulačkami, které si hned vyzkoušíte.',
    search: 'Hledat nástroj… (např. Pareto, OEE, 5S)', go: 'Hledat',
    st_tools: 'nástrojů a metod', st_inter: 'interaktivních nástrojů', st_quiz: 'otázek v kvízu', progress: 'Váš studijní pokrok', learned: 'naučeno',
    all: 'Vše', phase: 'Fáze DMAIC', toolbox: 'Toolbox', toolbox_p: 'Periodická tabulka zlepšování – klikněte na prvek a začněte se učit.',
    nothing: 'Nic nenalezeno. Zkuste jiný výraz.', interactive: '▶ interaktivní',
    start: 'Kde začít?', start_p: 'Doporučené studijní cesty',
    path1: 'Začněte 7 nástroji kvality', path1p: 'Kontrolní list, Pareto, Ishikawa, histogram, bodový diagram, regulační diagram a stratifikace.',
    path2: 'Projděte roadmapu DMAIC', path2p: 'Která metoda patří do které fáze projektu Six Sigma.',
    path3: 'Postavte dům Lean', path3p: 'Jak do sebe zapadají JIT, Jidoka, standardizace a kaizen.',
    path4: 'Otestujte se', path4p: 'Krátký kvíz – 10 náhodných otázek s vysvětlením.',
    what: 'Co to je', when: 'Kdy použít', steps: 'Postup', tips: 'Tipy a nejčastější chyby', example: 'Příklad z praxe',
    learn: 'Teorie', tryit: 'Vyzkoušej si', mark: 'Označit jako naučené', marked: 'Naučeno', print: 'Tisk / PDF',
    prev: 'Předchozí', next: 'Další', home: 'Toolbox', phases: 'Fáze',
    try_cta: 'Vyzkoušejte si nástroj interaktivně', try_btn: 'Otevřít interaktivní nástroj',
    road_h: 'Roadmapa DMAIC', road_p: 'Pět fází projektu Six Sigma – cíl, klíčové otázky, výstupy a nástroje.',
    goal: 'Cíl fáze', keyq: 'Klíčové otázky', outs: 'Výstupy', tools: 'Nástroje',
    house_h: 'Dům Lean (TPS)', house_p: 'Klasický model Toyota Production System. Klikněte na nástroj.', found: 'Filozofie: respekt k lidem · dlouhodobé myšlení · zákazník na prvním místě',
    quiz_h: 'Kvíz Lean Six Sigma', quiz_p: '10 náhodných otázek. Po každé odpovědi uvidíte vysvětlení.', q_start: 'Spustit kvíz', q_next: 'Další otázka', q_fin: 'Zobrazit výsledek',
    q_res: 'Váš výsledek', q_again: 'Znovu', q_best: 'Nejlepší výsledek', q_of: 'z', q_q: 'Otázka', q_learn: 'Prostudovat nástroj',
    q_r1: 'Výborně! Jste připraveni na gembu.', q_r2: 'Dobrá práce – pár nástrojů ještě zopakujte.', q_r3: 'Začněte teorií – toolbox vám pomůže.',
    gl_h: 'Slovník pojmů', gl_p: 'Nejčastější zkratky a pojmy Lean a Six Sigma.', gl_s: 'Hledat pojem…',
    foot: 'Lean Six Sigma Toolbox · vzdělávací aplikace · funguje offline', theme_auto: 'Motiv: automaticky', theme_light: 'Motiv: světlý', theme_dark: 'Motiv: tmavý',
    add: '+ Přidat řádek', reset: 'Obnovit příklad', clear: 'Vymazat', copy: 'Kopírovat text', copied: 'Zkopírováno ✓'
  },
  en: {
    nav_tools: 'Tools', nav_dmaic: 'DMAIC', nav_house: 'Lean House', nav_quiz: 'Quiz', nav_gloss: 'Glossary',
    kicker: 'Interactive learning toolbox', h1: 'Improving processes.<br>Every day.',
    lead: 'Lean and Six Sigma tools and methods in one place – clearly explained, with shop-floor examples and interactive calculators you can try right away.',
    search: 'Search a tool… (e.g. Pareto, OEE, 5S)', go: 'Search',
    st_tools: 'tools & methods', st_inter: 'interactive tools', st_quiz: 'quiz questions', progress: 'Your learning progress', learned: 'learned',
    all: 'All', phase: 'DMAIC phase', toolbox: 'Toolbox', toolbox_p: 'The periodic table of improvement – click an element to start learning.',
    nothing: 'Nothing found. Try another term.', interactive: '▶ interactive',
    start: 'Where to start?', start_p: 'Recommended learning paths',
    path1: 'Start with the 7 QC tools', path1p: 'Check sheet, Pareto, Ishikawa, histogram, scatter diagram, control chart and stratification.',
    path2: 'Walk the DMAIC roadmap', path2p: 'Which method belongs to which phase of a Six Sigma project.',
    path3: 'Build the Lean house', path3p: 'How JIT, Jidoka, standard work and kaizen fit together.',
    path4: 'Test yourself', path4p: 'A short quiz – 10 random questions with explanations.',
    what: 'What it is', when: 'When to use', steps: 'How to', tips: 'Tips & common pitfalls', example: 'Shop-floor example',
    learn: 'Learn', tryit: 'Try it', mark: 'Mark as learned', marked: 'Learned', print: 'Print / PDF',
    prev: 'Previous', next: 'Next', home: 'Toolbox', phases: 'Phases',
    try_cta: 'Try this tool interactively', try_btn: 'Open the interactive tool',
    road_h: 'DMAIC Roadmap', road_p: 'The five phases of a Six Sigma project – goal, key questions, deliverables and tools.',
    goal: 'Phase goal', keyq: 'Key questions', outs: 'Deliverables', tools: 'Tools',
    house_h: 'The Lean House (TPS)', house_p: 'The classic Toyota Production System model. Click a tool.', found: 'Philosophy: respect for people · long-term thinking · customer first',
    quiz_h: 'Lean Six Sigma Quiz', quiz_p: '10 random questions. You will see an explanation after each answer.', q_start: 'Start quiz', q_next: 'Next question', q_fin: 'Show result',
    q_res: 'Your result', q_again: 'Try again', q_best: 'Best score', q_of: 'of', q_q: 'Question', q_learn: 'Study the tool',
    q_r1: 'Excellent! You are ready for the gemba.', q_r2: 'Good job – review a few tools.', q_r3: 'Start with the theory – the toolbox will help.',
    gl_h: 'Glossary', gl_p: 'The most common Lean and Six Sigma terms and abbreviations.', gl_s: 'Search a term…',
    foot: 'Lean Six Sigma Toolbox · learning app · works offline', theme_auto: 'Theme: auto', theme_light: 'Theme: light', theme_dark: 'Theme: dark',
    add: '+ Add row', reset: 'Reset example', clear: 'Clear', copy: 'Copy text', copied: 'Copied ✓'
  }
};
const u = k => UI[S.lang][k] ?? UI.en[k] ?? k;

/* ---------- Shell ---------- */
function renderShell() {
  document.documentElement.lang = S.lang;
  const r = route();
  const items = [['#/', 'nav_tools', r.v === 'home' || r.v === 'tool'], ['#/dmaic', 'nav_dmaic', r.v === 'dmaic'], ['#/house', 'nav_house', r.v === 'house'], ['#/quiz', 'nav_quiz', r.v === 'quiz'], ['#/glossary', 'nav_gloss', r.v === 'glossary']];
  $('#nav').innerHTML = items.map(([h, k, on]) => `<a href="${h}" class="${on ? 'on' : ''}">${u(k)}</a>`).join('');
  $$('.lang button').forEach(b => b.classList.toggle('on', b.dataset.lang === S.lang));
  $('#foot').textContent = u('foot');
  $('#theme').textContent = u('theme_' + S.theme);
}
function applyTheme() {
  if (S.theme === 'auto') document.documentElement.removeAttribute('data-theme');
  else document.documentElement.setAttribute('data-theme', S.theme);
}

/* ---------- Router ---------- */
function route() {
  const p = (location.hash || '#/').slice(2).split('/');
  if (p[0] === 'tool' && toolById(p[1])) return { v: 'tool', id: p[1], tab: p[2] === 'try' ? 'try' : 'learn' };
  if (['dmaic', 'house', 'quiz', 'glossary'].includes(p[0])) return { v: p[0] };
  if (p[0] === 'cat' && CATS[p[1]]) return { v: 'home', cat: p[1] };
  return { v: 'home' };
}
let lastView = null;
function render(keepScroll) {
  renderShell();
  const r = route();
  const app = $('#app');
  if (r.cat) S.cat = r.cat;
  const views = { home: viewHome, tool: viewTool, dmaic: viewDmaic, house: viewHouse, quiz: viewQuiz, glossary: viewGloss };
  views[r.v](app, r);
  const key = r.v + (r.id || '') + (r.tab || '');
  if (!keepScroll && key !== lastView) { window.scrollTo(0, r.cat ? $('#toolbox').offsetTop - 80 : 0); app.firstElementChild?.classList.add('fade'); }
  lastView = key;
  $('#nav').classList.remove('open');
}

/* ---------- Home ---------- */
function phaseBadges(ph) { return `<span class="phs">${'DMAIC'.split('').map(p => `<i class="${ph.includes(p) ? '' : 'off'}" title="${PHASES[p][S.lang]}">${p}</i>`).join('')}</span>`; }
function tile(t, i) {
  const c = CATS[t.cat].color;
  return `<a class="tile" href="#/tool/${t.id}" style="--c:${c}">
    <span class="no">${i + 1}</span>
    <span class="sym">${esc(t.sym)}</span>
    <h3>${esc(tr(t.name))}</h3>
    <p>${esc(tr(t.short))}</p>
    <span class="ft">${phaseBadges(t.ph)}${S.done[t.id] ? `<span class="done-b">✓ ${u('learned')}</span>` : t.widget ? `<span class="play">${u('interactive')}</span>` : ''}</span>
  </a>`;
}
function filtered() {
  const q = S.q.trim().toLowerCase();
  return TOOLS.map((t, i) => [t, i]).filter(([t]) =>
    (S.cat === 'all' || t.cat === S.cat) && (!S.phase || t.ph.includes(S.phase)) &&
    (!q || [t.name.cs, t.name.en, t.short.cs, t.short.en, t.sym, t.id].join(' ').toLowerCase().includes(q)));
}
function viewHome(app) {
  const nDone = TOOLS.filter(t => S.done[t.id]).length, pct = Math.round(nDone / TOOLS.length * 100);
  const nW = TOOLS.filter(t => t.widget).length;
  app.innerHTML = `<div>
  <section class="hero"><div class="wrap">
    <div>
      <span class="kicker">${u('kicker')}</span>
      <h1>${u('h1')}</h1>
      <p class="lead">${u('lead')}</p>
      <label class="search"><input id="q" type="search" placeholder="${esc(u('search'))}" value="${esc(S.q)}" aria-label="${esc(u('search'))}"><span>${u('go')}</span></label>
    </div>
    <div class="stats">
      <div class="stat"><b>${TOOLS.length}</b><span>${u('st_tools')}</span></div>
      <div class="stat"><b>${nW}</b><span>${u('st_inter')}</span></div>
      <div class="stat"><b>${QUIZ.length}</b><span>${u('st_quiz')}</span></div>
      <div class="stat prog"><span>${u('progress')}: <b style="display:inline;font-size:18px">${nDone}/${TOOLS.length}</b> ${u('learned')} (${pct} %)</span><div class="pb"><i style="width:${pct}%"></i></div></div>
    </div>
  </div></section>
  <section class="blk" id="toolbox"><div class="wrap">
    <div class="sec-h"><div><h2>${u('toolbox')}</h2><p>${u('toolbox_p')}</p></div></div>
    <div class="filters">
      <div class="chips" id="cats">
        <button class="chip ${S.cat === 'all' ? 'on' : ''}" data-cat="all">${u('all')} · ${TOOLS.length}</button>
        ${Object.entries(CATS).map(([k, c]) => `<button class="chip ${S.cat === k ? 'on' : ''}" data-cat="${k}"><span class="dot" style="background:${c.color}"></span>${tr(c.name)} · ${TOOLS.filter(t => t.cat === k).length}</button>`).join('')}
      </div>
      <div class="chips" id="phs" aria-label="${u('phase')}">
        ${'DMAIC'.split('').map(p => `<button class="chip ph ${S.phase === p ? 'on' : ''}" data-ph="${p}" title="${PHASES[p][S.lang + 'l']}">${p}</button>`).join('')}
      </div>
    </div>
    <div id="catdesc"></div>
    <div class="grid" id="grid"></div>
  </div></section>
  <section class="blk" style="padding-top:0"><div class="wrap">
    <div class="sec-h"><div><h2>${u('start')}</h2><p>${u('start_p')}</p></div></div>
    <div class="cards">
      <a class="card link" href="#/cat/q7"><div class="ic" style="background:${CATS.q7.color}">7</div><h3>${u('path1')}</h3><p>${u('path1p')}</p></a>
      <a class="card link" href="#/dmaic"><div class="ic" style="background:${CATS.ss.color}">Dm</div><h3>${u('path2')}</h3><p>${u('path2p')}</p></a>
      <a class="card link" href="#/house"><div class="ic" style="background:${CATS.lean.color}">⌂</div><h3>${u('path3')}</h3><p>${u('path3p')}</p></a>
      <a class="card link" href="#/quiz"><div class="ic" style="background:${CATS.ps.color}">?</div><h3>${u('path4')}</h3><p>${u('path4p')}</p></a>
    </div>
  </div></section></div>`;
  const drawGrid = () => {
    const list = filtered();
    $('#grid').innerHTML = list.length ? list.map(([t, i]) => tile(t, i)).join('') : `<div class="empty">${u('nothing')}</div>`;
    $('#catdesc').innerHTML = S.cat !== 'all' ? `<p style="margin:-8px 0 16px;color:var(--muted)">${esc(tr(CATS[S.cat].desc))}</p>` : '';
  };
  drawGrid();
  $('#q').addEventListener('input', e => { S.q = e.target.value; drawGrid(); });
  $('#q').addEventListener('keydown', e => { if (e.key === 'Enter') $('#toolbox').scrollIntoView({ behavior: 'smooth' }); });
  $$('#cats .chip').forEach(b => b.onclick = () => { S.cat = b.dataset.cat; $$('#cats .chip').forEach(x => x.classList.toggle('on', x === b)); if (location.hash.startsWith('#/cat')) history.replaceState(null, '', '#/'); drawGrid(); });
  $$('#phs .chip').forEach(b => b.onclick = () => { S.phase = S.phase === b.dataset.ph ? null : b.dataset.ph; $$('#phs .chip').forEach(x => x.classList.toggle('on', x.dataset.ph === S.phase)); drawGrid(); });
}

/* ---------- Tool ---------- */
function viewTool(app, r) {
  const t = toolById(r.id), i = TOOLS.indexOf(t), c = CATS[t.cat].color;
  const prev = TOOLS[(i - 1 + TOOLS.length) % TOOLS.length], next = TOOLS[(i + 1) % TOOLS.length];
  const tab = t.widget ? r.tab : 'learn';
  const done = !!S.done[t.id];
  app.innerHTML = `<div class="wrap" style="--c:${c}">
    <div class="crumb"><a href="#/">${u('home')}</a> › <a href="#/cat/${t.cat}">${tr(CATS[t.cat].name)}</a> › ${esc(tr(t.name))}</div>
    <div class="thead">
      <div class="bigsym">${esc(t.sym)}<small>${i + 1} / ${TOOLS.length}</small></div>
      <div>
        <h1>${esc(tr(t.name))}</h1>
        <p>${esc(tr(t.short))}</p>
        <div class="meta"><span class="tag" style="background:${c};color:#fff">${tr(CATS[t.cat].name)}</span>${t.ph.map(p => `<span class="tag">${p} · ${PHASES[p][S.lang + 'l']}</span>`).join('')}</div>
      </div>
      <div class="acts">
        <button class="btn ${done ? 'ok' : 'ghost'}" id="mark">${done ? '✓ ' + u('marked') : u('mark')}</button>
        <button class="btn ghost" onclick="window.print()">${u('print')}</button>
      </div>
    </div>
    ${t.widget ? `<div class="tabs" role="tablist"><button class="${tab === 'learn' ? 'on' : ''}" data-tab="learn">📘 ${u('learn')}</button><button class="${tab === 'try' ? 'on' : ''}" data-tab="try">🛠 ${u('tryit')}</button></div>` : ''}
    <div class="tabpane" id="pane-learn" style="display:${tab === 'learn' ? 'block' : 'none'}">
      <div class="learn">
        <div class="box full"><h3><span class="n">?</span>${u('what')}</h3><p style="font-size:17px">${esc(tr(t.what))}</p></div>
        <div class="box"><h3><span class="n">↻</span>${u('steps')}</h3><ol class="steps">${tr(t.steps).map(s => `<li>${esc(s)}</li>`).join('')}</ol></div>
        <div style="display:flex;flex-direction:column;gap:18px">
          <div class="box"><h3><span class="n">◎</span>${u('when')}</h3><ul class="chk">${tr(t.when).map(s => `<li>${esc(s)}</li>`).join('')}</ul></div>
          <div class="box"><h3><span class="n">★</span>${u('tips')}</h3><ul class="chk tip">${tr(t.tips).map(s => `<li>${esc(s)}</li>`).join('')}</ul></div>
        </div>
        <div class="box example full"><h3><span class="n">▣</span>${u('example')}</h3><p style="font-size:17px">${esc(tr(t.example))}</p></div>
        ${t.widget ? `<div class="box full noprint" style="display:flex;align-items:center;justify-content:space-between;gap:14px;flex-wrap:wrap;border:2px dashed var(--blue);box-shadow:none;background:var(--soft)"><b>🛠 ${u('try_cta')}</b><a class="btn" href="#/tool/${t.id}/try">${u('try_btn')} →</a></div>` : ''}
      </div>
    </div>
    ${t.widget ? `<div class="tabpane" id="pane-try" style="display:${tab === 'try' ? 'block' : 'none'}"><div id="wg"></div></div>` : ''}
    <div class="pn"><a href="#/tool/${prev.id}"><small>← ${u('prev')}</small><b>${esc(tr(prev.name))}</b></a><a class="nx" href="#/tool/${next.id}"><small>${u('next')} →</small><b>${esc(tr(next.name))}</b></a></div>
  </div>`;
  $$('.tabs button').forEach(b => b.onclick = () => { location.hash = '#/tool/' + t.id + (b.dataset.tab === 'try' ? '/try' : ''); });
  $('#mark').onclick = () => { if (S.done[t.id]) delete S.done[t.id]; else S.done[t.id] = 1; store.set('done', S.done); render(true); };
  if (t.widget && tab === 'try') {
    const el = $('#wg');
    if (W[t.widget]) W[t.widget](el, t); else el.innerHTML = '';
  }
}

/* ---------- DMAIC ---------- */
function miniLinks(ids) { return `<div class="mini">${ids.map(id => { const t = toolById(id); return `<a href="#/tool/${id}" style="--c:${CATS[t.cat].color}" title="${esc(tr(t.name))}">${esc(t.sym)} · ${esc(tr(t.name).split(' (')[0])}</a>`; }).join('')}</div>`; }
function viewDmaic(app) {
  app.innerHTML = `<section class="blk"><div class="wrap">
    <div class="sec-h"><div><h2>${u('road_h')}</h2><p>${u('road_p')}</p></div></div>
    <div class="road">${'DMAIC'.split('').map(p => {
      const d = DMAIC[p];
      return `<div class="ph"><div class="hd"><b>${p}</b><span>${PHASES[p].en}${S.lang === 'cs' ? ' · ' + PHASES[p].csl : ''}</span></div>
      <div class="bd"><div><h4>${u('goal')}</h4><p>${esc(tr(d.goal))}</p></div>
      <div><h4>${u('keyq')}</h4><ul>${tr(d.q).map(x => `<li>${esc(x)}</li>`).join('')}</ul></div>
      <div><h4>${u('outs')}</h4><ul>${tr(d.out).map(x => `<li>${esc(x)}</li>`).join('')}</ul></div>
      <div><h4>${u('tools')}</h4>${miniLinks(TOOLS.filter(t => t.ph.includes(p) && t.id !== 'dmaic').map(t => t.id))}</div></div></div>`;
    }).join('')}</div>
  </div></section>`;
}

/* ---------- Lean house ---------- */
function viewHouse(app) {
  const H = HOUSE;
  app.innerHTML = `<section class="blk"><div class="wrap">
    <div class="sec-h"><div><h2>${u('house_h')}</h2><p>${u('house_p')}</p></div></div>
    <div class="house">
      <div class="roof"><h3>${S.lang === 'cs' ? 'Zákazník' : 'Customer'}</h3>${esc(tr(H.roof))}</div>
      <div class="body">
        <div class="pil"><h3>${tr(H.pillarL.t)}</h3><p style="color:var(--muted);font-size:14px">${S.lang === 'cs' ? 'Správný díl, ve správném množství, ve správný čas' : 'The right part, in the right amount, at the right time'}</p>${miniLinks(H.pillarL.items)}</div>
        <div class="pil" style="background:var(--soft)"><h3 style="color:var(--navy)">${tr(H.center.t)}</h3>${miniLinks(H.center.items)}</div>
        <div class="pil"><h3>${tr(H.pillarR.t)}</h3><p style="color:var(--muted);font-size:14px">${S.lang === 'cs' ? 'Kvalita zabudovaná do procesu, zastav při problému' : 'Built-in quality, stop at every abnormality'}</p>${miniLinks(H.pillarR.items)}</div>
      </div>
      <div class="base"><h3>${tr(H.base.t)}</h3>${miniLinks(H.base.items)}</div>
      <div class="found">${u('found')}</div>
    </div>
  </div></section>`;
}

/* ---------- Quiz ---------- */
const QZ = { run: null };
function shuffle(a) { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
function viewQuiz(app) {
  const z = QZ.run;
  let body;
  if (!z) {
    body = `<div class="box" style="text-align:center;padding:40px 22px"><div class="score">?</div><h2 style="margin-top:14px">${u('quiz_h')}</h2><p style="color:var(--muted)">${u('quiz_p')}</p>
      ${S.best != null ? `<p><b>${u('q_best')}: ${S.best}/10</b></p>` : ''}<button class="btn" id="qs" style="margin-top:10px">${u('q_start')}</button></div>`;
  } else if (z.i >= z.qs.length) {
    const sc = z.score, msg = sc >= 8 ? u('q_r1') : sc >= 5 ? u('q_r2') : u('q_r3');
    body = `<div class="box" style="text-align:center;padding:40px 22px"><p style="color:var(--muted);font-weight:700">${u('q_res')}</p><div class="score">${sc}/${z.qs.length}</div><h3 style="margin-top:14px">${msg}</h3>
      <p>${u('q_best')}: <b>${S.best}/10</b></p><button class="btn" id="qs">${u('q_again')}</button></div>`;
  } else {
    const q = z.qs[z.i], opts = tr(q.o);
    body = `<div class="qbar"><i style="width:${(z.i) / z.qs.length * 100}%"></i></div>
      <p style="color:var(--muted);font-weight:700;margin:0 0 6px">${u('q_q')} ${z.i + 1} ${u('q_of')} ${z.qs.length} · ${esc(tr(toolById(q.t).name))}</p>
      <h2 style="font-size:clamp(20px,3vw,28px)">${esc(tr(q.q))}</h2>
      <div id="opts">${z.order.map(k => `<button class="opt ${z.ans != null ? (k === q.a ? 'right' : k === z.ans ? 'wrong' : '') : ''}" data-k="${k}" ${z.ans != null ? 'disabled' : ''}>${esc(opts[k])}</button>`).join('')}</div>
      ${z.ans != null ? `<div class="insight ${z.ans === q.a ? 'good' : 'bad'}"><div>${esc(tr(q.e))} <a href="#/tool/${q.t}">${u('q_learn')} →</a></div></div>
      <div class="btns" style="justify-content:flex-end"><button class="btn" id="qn">${z.i + 1 < z.qs.length ? u('q_next') : u('q_fin')} →</button></div>` : ''}`;
  }
  app.innerHTML = `<section class="blk"><div class="wrap quiz">${body}</div></section>`;
  const qs = $('#qs');
  if (qs) qs.onclick = () => { QZ.run = { qs: shuffle(QUIZ).slice(0, 10), i: 0, score: 0, ans: null, order: shuffle([0, 1, 2, 3]) }; viewQuiz(app); };
  $$('#opts .opt').forEach(b => b.onclick = () => { const k = +b.dataset.k; z.ans = k; if (k === z.qs[z.i].a) z.score++; viewQuiz(app); });
  const qn = $('#qn');
  if (qn) qn.onclick = () => {
    z.i++; z.ans = null; z.order = shuffle([0, 1, 2, 3]);
    if (z.i >= z.qs.length && (S.best == null || z.score > S.best)) { S.best = z.score; store.set('best', S.best); }
    viewQuiz(app); window.scrollTo(0, 0);
  };
}

/* ---------- Glossary ---------- */
function viewGloss(app) {
  app.innerHTML = `<section class="blk"><div class="wrap">
    <div class="sec-h"><div><h2>${u('gl_h')}</h2><p>${u('gl_p')}</p></div><input class="in" id="gs" type="search" placeholder="${esc(u('gl_s'))}" style="max-width:300px"></div>
    <div class="gl" id="gl"></div></div></section>`;
  const draw = q => {
    q = (q || '').toLowerCase();
    $('#gl').innerHTML = GLOSSARY.filter(([k, v]) => !q || (k + ' ' + v.cs + ' ' + v.en).toLowerCase().includes(q))
      .sort((a, b) => a[0].localeCompare(b[0])).map(([k, v]) => `<div><b>${esc(k)}</b><p>${esc(tr(v))}</p></div>`).join('') || `<div class="empty">${u('nothing')}</div>`;
  };
  draw('');
  $('#gs').addEventListener('input', e => draw(e.target.value));
}

/* ---------- Boot ---------- */
$$('.lang button').forEach(b => b.onclick = () => { S.lang = b.dataset.lang; store.set('lang', S.lang); render(true); });
$('#burger').onclick = () => $('#nav').classList.toggle('open');
$('#theme').onclick = () => { S.theme = { auto: 'light', light: 'dark', dark: 'auto' }[S.theme]; store.set('theme', S.theme); applyTheme(); renderShell(); };
window.addEventListener('hashchange', () => render());
applyTheme();
render();
