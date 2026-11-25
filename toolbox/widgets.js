/* ===== Interactive widgets ===== */
const W = {}, WS = {};
const L2 = (cs, en) => S.lang === 'cs' ? cs : en;
const st = (k, init) => WS[k] || (WS[k] = init());
const num = v => { const x = parseFloat(String(v).replace(',', '.')); return isFinite(x) ? x : 0; };
const nums = txt => String(txt).split(/[\s;]+/).map(x => parseFloat(x.replace(',', '.'))).filter(x => isFinite(x));
const mean = a => a.reduce((s, x) => s + x, 0) / a.length;
const sdev = a => { if (a.length < 2) return 0; const m = mean(a); return Math.sqrt(a.reduce((s, x) => s + (x - m) ** 2, 0) / (a.length - 1)); };
const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
const COL = { blue: '#0099DE', navy: '#003778', light: '#8FD3F3', orange: '#E8730C', red: '#D7263D', green: '#2E9E5B', yellow: '#FFD25C', grey: '#8AA0B4', teal: '#00A6A6', purple: '#7B5EA7' };
const PAL = [COL.blue, COL.orange, COL.green, COL.purple, COL.teal, COL.red, COL.yellow, COL.grey];

function rng(seed) { let s = seed >>> 0; return () => { s = (Math.imul(s, 1664525) + 1013904223) >>> 0; return s / 4294967296; }; }
function gauss(r) { let a = 0; while (!a) a = r(); return Math.sqrt(-2 * Math.log(a)) * Math.cos(2 * Math.PI * r()); }
function erfc(x) { const z = Math.abs(x), t = 1 / (1 + 0.5 * z); const r = t * Math.exp(-z * z - 1.26551223 + t * (1.00002368 + t * (0.37409196 + t * (0.09678418 + t * (-0.18628806 + t * (0.27886807 + t * (-1.13520398 + t * (1.48851587 + t * (-0.82215223 + t * 0.17087277))))))))); return x >= 0 ? r : 2 - r; }
const ncdf = z => 0.5 * erfc(-z / Math.SQRT2);
const npdf = z => Math.exp(-z * z / 2) / Math.sqrt(2 * Math.PI);
function ninv(p) {
  if (p <= 0) return -Infinity; if (p >= 1) return Infinity;
  const a = [-39.69683028665376, 220.9460984245205, -275.9285104469687, 138.357751867269, -30.66479806614716, 2.506628277459239],
    b = [-54.47609879822406, 161.5858368580409, -155.6989798598866, 66.80131188771972, -13.28068155288572],
    c = [-0.007784894002430293, -0.3223964580411365, -2.400758277161838, -2.549732539343734, 4.374664141464968, 2.938163982698783],
    d = [0.007784695709041462, 0.3224671290700398, 2.445134137142996, 3.754408661907416], pl = 0.02425;
  let q, r;
  if (p < pl) { q = Math.sqrt(-2 * Math.log(p)); return (((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) / ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1); }
  if (p <= 1 - pl) { q = p - 0.5; r = q * q; return (((((a[0] * r + a[1]) * r + a[2]) * r + a[3]) * r + a[4]) * r + a[5]) * q / (((((b[0] * r + b[1]) * r + b[2]) * r + b[3]) * r + b[4]) * r + 1); }
  q = Math.sqrt(-2 * Math.log(1 - p)); return -(((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) / ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1);
}
function gammaln(x) { const c = [76.18009172947146, -86.50532032941677, 24.01409824083091, -1.231739572450155, 0.1208650973866179e-2, -0.5395239384953e-5]; let y = x, tmp = x + 5.5; tmp -= (x + 0.5) * Math.log(tmp); let ser = 1.000000000190015; for (let j = 0; j < 6; j++) ser += c[j] / ++y; return -tmp + Math.log(2.5066282746310005 * ser / x); }
function betacf(a, b, x) {
  const FP = 1e-300; let qab = a + b, qap = a + 1, qam = a - 1, c = 1, d = 1 - qab * x / qap; if (Math.abs(d) < FP) d = FP; d = 1 / d; let h = d;
  for (let m = 1; m <= 300; m++) {
    const m2 = 2 * m; let aa = m * (b - m) * x / ((qam + m2) * (a + m2));
    d = 1 + aa * d; if (Math.abs(d) < FP) d = FP; c = 1 + aa / c; if (Math.abs(c) < FP) c = FP; d = 1 / d; h *= d * c;
    aa = -(a + m) * (qab + m) * x / ((a + m2) * (qap + m2));
    d = 1 + aa * d; if (Math.abs(d) < FP) d = FP; c = 1 + aa / c; if (Math.abs(c) < FP) c = FP; d = 1 / d; const del = d * c; h *= del;
    if (Math.abs(del - 1) < 3e-14) break;
  }
  return h;
}
function betai(a, b, x) { if (x <= 0) return 0; if (x >= 1) return 1; const bt = Math.exp(gammaln(a + b) - gammaln(a) - gammaln(b) + a * Math.log(x) + b * Math.log(1 - x)); return x < (a + 1) / (a + b + 2) ? bt * betacf(a, b, x) / a : 1 - bt * betacf(b, a, 1 - x) / b; }
const tTwoSided = (t, df) => betai(df / 2, 0.5, df / (df + t * t));

/* chart helpers */
function niceStep(x) { if (!(x > 0)) return 1; const p = Math.pow(10, Math.floor(Math.log10(x))), f = x / p; return (f < 1.5 ? 1 : f < 3 ? 2 : f < 7 ? 5 : 10) * p; }
function ticks(a, b, n = 5) {
  if (!(b > a)) { a -= 1; b += 1; }
  const s = niceStep((b - a) / n), out = [];
  for (let v = Math.floor(a / s + 1e-9) * s; v <= Math.ceil(b / s - 1e-9) * s + s / 2; v += s) out.push(+v.toFixed(10));
  return { t: out, d: s >= 1 ? 0 : Math.min(4, Math.ceil(-Math.log10(s) - 1e-9)) };
}
const svgOpen = (w, h, label = '') => `<svg class="ch" viewBox="0 0 ${w} ${h}" role="img" aria-label="${esc(label)}">`;
function gridY(tk, sy, x0, x1, side = 'l', suffix = '') {
  return `<g class="grid">${tk.t.map(v => `<line x1="${x0}" x2="${x1}" y1="${sy(v)}" y2="${sy(v)}"/>`).join('')}</g>` +
    tk.t.map(v => `<text x="${side === 'l' ? x0 - 6 : x1 + 6}" y="${sy(v) + 4}" text-anchor="${side === 'l' ? 'end' : 'start'}">${fmt(v, tk.d)}${suffix}</text>`).join('');
}
const trunc = (s, n) => (s = String(s)).length > n ? s.slice(0, n - 1) + '…' : s;
function kpi(label, val, cls = '') { return `<div class="kpi ${cls}"><small>${label}</small><b>${val}</b></div>`; }
function bind(el, s, out, rowsKey = 'rows') {
  $$('[data-f]', el).forEach(inp => inp.addEventListener('input', () => {
    const v = inp.hasAttribute('data-n') ? num(inp.value) : inp.value;
    if (inp.dataset.r != null) s[rowsKey][+inp.dataset.r][inp.dataset.f] = v; else s[inp.dataset.f] = v;
    out();
  }));
}
const numIn = (f, v, extra = '') => `<input data-f="${f}" data-n inputmode="decimal" value="${esc(v)}" ${extra}>`;
const head = (h, hint) => `<h3>${h}</h3><p class="hint">${hint}</p>`;
function rowsTable(s, cols, opts = {}) {
  return `<div class="tscroll"><table class="ed"><thead><tr>${cols.map(c => `<th style="${c.w ? 'width:' + c.w : ''}">${c.h}</th>`).join('')}<th></th></tr></thead><tbody>
  ${s.rows.map((r, i) => `<tr>${cols.map(c => `<td class="${c.calc ? 'num' : ''}">${c.calc ? c.calc(r, i) : c.sel ? `<select data-f="${c.f}" data-r="${i}"${c.n ? ' data-n' : ''}>${c.sel.map(o => `<option value="${o[0]}" ${String(r[c.f]) === String(o[0]) ? 'selected' : ''}>${o[1]}</option>`).join('')}</select>` : `<input data-f="${c.f}" data-r="${i}" ${c.n ? 'data-n inputmode="decimal"' : ''} value="${esc(c.n ? r[c.f] : tr(r[c.f]))}">`}</td>`).join('')}
  <td><button class="x" data-del="${i}" title="×">×</button></td></tr>`).join('')}</tbody></table></div>
  <div class="btns"><button class="btn sm ghost" data-add>${u('add')}</button>${opts.reset ? `<button class="btn sm ghost" data-reset>${u('reset')}</button>` : ''}</div>`;
}
function bindRows(el, s, draw, blank, reset) {
  $$('[data-del]', el).forEach(b => b.onclick = () => { s.rows.splice(+b.dataset.del, 1); draw(); });
  const a = $('[data-add]', el); if (a) a.onclick = () => { s.rows.push(blank()); draw(); };
  const r = $('[data-reset]', el); if (r && reset) r.onclick = () => { reset(); draw(); };
}

/* ---------- 1. Check sheet ---------- */
const CS_DEF = () => ({ cats: [
  { n: { cs: 'Poškozená hrana', en: 'Damaged edge' }, v: [18, 22, 15, 20, 19] },
  { n: { cs: 'Bubliny v kartonu', en: 'Paper blisters' }, v: [12, 15, 10, 14, 13] },
  { n: { cs: 'Odchylka rozměru', en: 'Dimension deviation' }, v: [6, 4, 7, 5, 5] },
  { n: { cs: 'Znečištění povrchu', en: 'Surface contamination' }, v: [3, 4, 2, 5, 3] },
  { n: { cs: 'Delaminace', en: 'Delamination' }, v: [2, 1, 3, 2, 1] },
  { n: { cs: 'Ostatní', en: 'Other' }, v: [1, 2, 1, 1, 2] }] });
W.checksheet = el => {
  const s = st('checksheet', CS_DEF);
  const days = S.lang === 'cs' ? ['Po', 'Út', 'St', 'Čt', 'Pá'] : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
  const tally = n => '<s>||||</s> '.repeat(Math.floor(n / 5)) + '|'.repeat(n % 5);
  const draw = () => {
    const tot = s.cats.map(c => c.v.reduce((a, b) => a + b, 0)), grand = tot.reduce((a, b) => a + b, 0) || 1, mx = Math.max(1, ...tot);
    el.innerHTML = `<div class="wg">${head(L2('Kontrolní list vad – týden', 'Defect check sheet – one week'), L2('Klikejte na + / − a zaznamenávejte výskyt vad. Pak data jedním klikem přeneste do Paretova diagramu.', 'Click + / − to tally defects. Then send the data to a Pareto chart in one click.'))}
    <div class="tscroll"><table class="ed cs"><thead><tr><th>${L2('Vada', 'Defect')}</th>${days.map(d => `<th style="text-align:center">${d}</th>`).join('')}<th>${L2('Celkem', 'Total')}</th><th></th></tr></thead><tbody>
    ${s.cats.map((c, i) => `<tr><td style="min-width:150px"><input data-cn="${i}" value="${esc(tr(c.n))}"></td>${c.v.map((v, j) => `<td class="cell"><div class="cellb"><button data-m="${i},${j}">−</button><b title="${v}">${v}</b><button data-p="${i},${j}">+</button></div></td>`).join('')}
      <td style="min-width:150px"><b>${tot[i]}</b> <small style="color:var(--muted)">(${fmt(tot[i] / grand * 100, 0)} %)</small><div style="height:6px;background:var(--line);border-radius:4px;margin-top:3px"><div style="height:6px;border-radius:4px;background:${COL.blue};width:${tot[i] / mx * 100}%"></div></div></td>
      <td><button class="x" data-del="${i}">×</button></td></tr>`).join('')}
    <tr><td><b>${L2('Celkem', 'Total')}</b></td>${days.map((d, j) => `<td style="text-align:center"><b>${s.cats.reduce((a, c) => a + c.v[j], 0)}</b></td>`).join('')}<td><b>${tot.reduce((a, b) => a + b, 0)}</b></td><td></td></tr>
    </tbody></table></div>
    <p class="tally" style="margin:12px 0 0;font-size:13px">${esc(tr(s.cats[0]?.n || ''))}: ${tally(Math.min(tot[0] || 0, 60))}</p>
    <div class="btns"><button class="btn sm ghost" data-addc>${u('add')}</button><button class="btn sm ghost" data-reset>${u('reset')}</button><button class="btn sm ghost" data-zero>${u('clear')}</button><button class="btn sm" data-topareto>${L2('Přenést do Paretova diagramu →', 'Send to Pareto chart →')}</button></div></div>`;
    $$('[data-p]', el).forEach(b => b.onclick = () => { const [i, j] = b.dataset.p.split(','); s.cats[i].v[j]++; draw(); });
    $$('[data-m]', el).forEach(b => b.onclick = () => { const [i, j] = b.dataset.m.split(','); s.cats[i].v[j] = Math.max(0, s.cats[i].v[j] - 1); draw(); });
    $$('[data-cn]', el).forEach(inp => inp.oninput = () => { s.cats[+inp.dataset.cn].n = inp.value; });
    $$('[data-del]', el).forEach(b => b.onclick = () => { s.cats.splice(+b.dataset.del, 1); draw(); });
    $('[data-addc]', el).onclick = () => { s.cats.push({ n: L2('Nová vada', 'New defect'), v: [0, 0, 0, 0, 0] }); draw(); };
    $('[data-reset]', el).onclick = () => { WS.checksheet = CS_DEF(); W.checksheet(el); };
    $('[data-zero]', el).onclick = () => { s.cats.forEach(c => c.v = [0, 0, 0, 0, 0]); draw(); };
    $('[data-topareto]', el).onclick = () => { WS.pareto = { rows: s.cats.map((c, i) => ({ n: c.n, v: tot[i] })) }; location.hash = '#/tool/pareto/try'; };
  };
  draw();
};

/* ---------- 2. Pareto ---------- */
W.pareto = el => {
  const def = () => ({ rows: CS_DEF().cats.map(c => ({ n: c.n, v: c.v.reduce((a, b) => a + b, 0) })) });
  const s = st('pareto', def);
  const draw = () => {
    el.innerHTML = `<div class="wg">${head(L2('Paretova analýza', 'Pareto analysis'), L2('Upravte kategorie a četnosti – graf se automaticky seřadí a vyznačí „podstatné málo“ do 80 %.', 'Edit categories and counts – the chart sorts itself and highlights the “vital few” up to 80 %.'))}
    <div class="wgrid"><div>${rowsTable(s, [{ h: L2('Kategorie', 'Category'), f: 'n' }, { h: L2('Počet', 'Count'), f: 'v', n: 1, w: '90px' }], { reset: 1 })}</div><div class="out"></div></div></div>`;
    bind(el, s, out); bindRows(el, s, draw, () => ({ n: '', v: 0 }), () => { WS.pareto = def(); Object.assign(s, WS.pareto); });
    out();
  };
  const out = () => {
    const rows = s.rows.filter(r => r.v > 0).map(r => ({ n: tr(r.n) || '?', v: r.v })).sort((a, b) => b.v - a.v);
    const o = $('.out', el);
    if (!rows.length) { o.innerHTML = `<div class="empty">${L2('Zadejte data.', 'Enter data.')}</div>`; return; }
    const tot = rows.reduce((a, r) => a + r.v, 0); let cum = 0;
    rows.forEach(r => { r.before = cum / tot * 100; cum += r.v; r.cum = cum / tot * 100; });
    const w = 640, h = 340, m = { l: 46, r: 46, t: 16, b: 86 }, pw = w - m.l - m.r, ph = h - m.t - m.b, bw = pw / rows.length;
    const tk = ticks(0, tot, 5), ymax = tot;
    const sy = v => m.t + ph * (1 - v / ymax), sp = p => m.t + ph * (1 - p / 100);
    const tkL = { t: tk.t.filter(v => v <= tot), d: tk.d };
    let g = svgOpen(w, h, 'Pareto') + gridY(tkL, sy, m.l, w - m.r);
    [0, 20, 40, 60, 80, 100].forEach(p => g += `<text x="${w - m.r + 6}" y="${sp(p) + 4}">${p} %</text>`);
    g += `<line x1="${m.l}" x2="${w - m.r}" y1="${sp(80)}" y2="${sp(80)}" stroke="${COL.red}" stroke-dasharray="5 4" stroke-width="1.5"/><text x="${m.l + 4}" y="${sp(80) - 5}" style="fill:${COL.red};font-weight:700">80 %</text>`;
    const vital = rows.filter(r => r.before < 80).length;
    rows.forEach((r, i) => {
      const x = m.l + i * bw + bw * 0.12, bh = ph * r.v / ymax;
      g += `<rect x="${x}" y="${sy(r.v)}" width="${bw * 0.76}" height="${bh}" rx="3" fill="${i < vital ? COL.blue : COL.light}"><title>${esc(r.n)}: ${r.v}</title></rect>`;
      g += bh > 22 ? `<text x="${x + bw * 0.38}" y="${sy(r.v) + 16}" text-anchor="middle" style="fill:#fff;font-weight:700">${r.v}</text>` : `<text x="${x + bw * 0.38}" y="${sy(r.v) - 5}" text-anchor="middle" class="lbl">${r.v}</text>`;
      g += `<text transform="translate(${x + bw * 0.38},${h - m.b + 14}) rotate(-35)" text-anchor="end">${esc(trunc(r.n, 20))}</text>`;
    });
    const pts = rows.map((r, i) => [m.l + i * bw + bw / 2, sp(r.cum)]);
    g += `<polyline points="${[[m.l, sp(0)], ...pts].map(p => p.join(',')).join(' ')}" fill="none" stroke="${COL.orange}" stroke-width="2.5"/>`;
    pts.forEach((p, i) => g += `<circle cx="${p[0]}" cy="${p[1]}" r="4" fill="${COL.orange}"/><text x="${p[0]}" y="${p[1] - 8}" text-anchor="middle" style="fill:${COL.orange};font-weight:700">${fmt(rows[i].cum, 0)}%</text>`);
    g += `<line class="axis" x1="${m.l}" x2="${w - m.r}" y1="${h - m.b}" y2="${h - m.b}"/></svg>`;
    const share = rows[vital - 1].cum;
    o.innerHTML = `<div class="kpis">${kpi(L2('Celkem', 'Total'), tot)}${kpi(L2('Kategorií', 'Categories'), rows.length)}${kpi(L2('Podstatné málo', 'Vital few'), vital, 'good')}${kpi(L2('Jejich podíl', 'Their share'), fmt(share, 0) + ' %', 'good')}</div>${g}
    <div class="legend"><span><i style="background:${COL.blue}"></i>${L2('Podstatné málo', 'Vital few')}</span><span><i style="background:${COL.light}"></i>${L2('Užitečné mnoho', 'Useful many')}</span><span><i style="background:${COL.orange}"></i>${L2('Kumulativní %', 'Cumulative %')}</span></div>
    <div class="insight">${L2(`<b>${vital} z ${rows.length}</b> kategorií (${fmt(vital / rows.length * 100, 0)} %) způsobuje <b>${fmt(share, 0)} %</b> všech vad. Začněte kategorií „${esc(rows[0].n)}“.`, `<b>${vital} of ${rows.length}</b> categories (${fmt(vital / rows.length * 100, 0)} %) cause <b>${fmt(share, 0)} %</b> of all defects. Start with “${esc(rows[0].n)}”.`)}</div>`;
  };
  draw();
};

/* ---------- 3. Fishbone ---------- */
const FB_DEF = () => ({ effect: { cs: 'Bubliny v kartonu', en: 'Paper blisters' }, cats: [
  { n: { cs: 'Člověk', en: 'Man' }, c: { cs: 'Nové obsazení směny\nNedodržení receptury', en: 'New shift crew\nRecipe not followed' } },
  { n: { cs: 'Metoda', en: 'Method' }, c: { cs: 'Příliš vysoká rychlost linky\nChybí standard nastavení', en: 'Line speed too high\nNo setting standard' } },
  { n: { cs: 'Měření', en: 'Measurement' }, c: { cs: 'Nekalibrovaný vlhkoměr\nVzorkování 1× za směnu', en: 'Uncalibrated moisture meter\nSampling once per shift' } },
  { n: { cs: 'Stroj', en: 'Machine' }, c: { cs: 'Kolísá teplota sušárny\nOpotřebené válce\nNerovnoměrné nanášení', en: 'Dryer temperature fluctuates\nWorn rollers\nUneven slurry spread' } },
  { n: { cs: 'Materiál', en: 'Material' }, c: { cs: 'Vlhkost kartonu\nDávka pěnidla\nKvalita sádrovce', en: 'Paper moisture\nFoaming agent dosage\nGypsum quality' } },
  { n: { cs: 'Prostředí', en: 'Environment' }, c: { cs: 'Vysoká vlhkost v hale\nSezónní teploty', en: 'High humidity in hall\nSeasonal temperatures' } }] });
W.fishbone = el => {
  const s = st('fishbone', FB_DEF);
  const draw = () => {
    el.innerHTML = `<div class="wg">${head(L2('Ishikawův diagram (6M)', 'Ishikawa diagram (6M)'), L2('Napište problém a příčiny – jednu na řádek. Diagram se kreslí živě.', 'Type the problem and causes – one per line. The diagram draws live.'))}
    <label class="fld"><span>${L2('Problém (následek)', 'Problem (effect)')}</span><input data-fe value="${esc(tr(s.effect))}"></label>
    <div class="out" style="margin:8px 0 16px"></div>
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(170px,1fr));gap:10px">${s.cats.map((c, i) => `<label class="fld"><span>${esc(tr(c.n))}</span><textarea data-fc="${i}" style="min-height:96px;font-family:inherit">${esc(tr(c.c))}</textarea></label>`).join('')}</div>
    <div class="btns"><button class="btn sm ghost" data-reset>${u('reset')}</button><button class="btn sm ghost" data-clear>${u('clear')}</button></div></div>`;
    $('[data-fe]', el).oninput = e => { s.effect = e.target.value; out(); };
    $$('[data-fc]', el).forEach(t => t.oninput = () => { s.cats[+t.dataset.fc].c = t.value; out(); });
    $('[data-reset]', el).onclick = () => { WS.fishbone = FB_DEF(); W.fishbone(el); };
    $('[data-clear]', el).onclick = () => { s.effect = ''; s.cats.forEach(c => c.c = ''); draw(); };
    out();
  };
  const out = () => {
    const w = 960, h = 470, y0 = 235, xHead = 770;
    let g = svgOpen(w, h, 'Ishikawa') + `<line x1="30" y1="${y0}" x2="${xHead}" y2="${y0}" class="s-ink" stroke-width="4"/>`;
    g += `<path d="M${xHead} ${y0 - 70} L${w - 10} ${y0 - 40} L${w - 10} ${y0 + 40} L${xHead} ${y0 + 70} Z" fill="${COL.blue}"/>`;
    const words = (tr(s.effect) || '?').split(/\s+/); const lines = []; let cur = '';
    words.forEach(wd => { if ((cur + ' ' + wd).trim().length > 16) { lines.push(cur); cur = wd; } else cur = (cur + ' ' + wd).trim(); }); lines.push(cur);
    lines.slice(0, 4).forEach((l, i) => g += `<text x="${(xHead + w - 10) / 2}" y="${y0 + 5 + (i - (Math.min(lines.length, 4) - 1) / 2) * 18}" text-anchor="middle" style="fill:#fff;font-weight:700;font-size:15px">${esc(l)}</text>`);
    const baseX = [250, 490, 730];
    s.cats.forEach((c, i) => {
      const top = i < 3, bx = baseX[i % 3], ex = bx - 160, ey = top ? 52 : h - 52;
      g += `<line x1="${ex}" y1="${ey}" x2="${bx}" y2="${y0}" stroke="${COL.navy}" stroke-width="3" class="s-ink"/>`;
      g += `<rect x="${ex - 62}" y="${top ? ey - 36 : ey + 6}" width="124" height="30" rx="6" fill="${COL.navy}"/><text x="${ex}" y="${top ? ey - 16 : ey + 26}" text-anchor="middle" style="fill:#fff;font-weight:700;font-size:13px">${esc(tr(c.n))}</text>`;
      const causes = String(tr(c.c)).split('\n').map(x => x.trim()).filter(Boolean).slice(0, 6), n = causes.length;
      causes.forEach((cz, j) => {
        const t = (j + 1) / (n + 1), px = ex + (bx - ex) * t, py = ey + (y0 - ey) * t;
        g += `<line x1="${px - 130}" y1="${py}" x2="${px}" y2="${py}" stroke="${COL.blue}" stroke-width="1.5"/><circle cx="${px}" cy="${py}" r="3" fill="${COL.blue}"/>`;
        g += `<text x="${px - 8}" y="${py - 4}" text-anchor="end" class="t-ink" style="font-size:11.5px">${esc(trunc(cz, 26))}</text>`;
      });
    });
    $('.out', el).innerHTML = g + '</svg>';
  };
  draw();
};

/* ---------- 4. Histogram & capability ---------- */
const CAP_DEF = () => { const r = rng(7); return { data: Array.from({ length: 100 }, () => (12.32 + 0.12 * gauss(r)).toFixed(2)).join(' '), lsl: 12, usl: 13, target: 12.5, bins: 0 }; };
W.capability = el => {
  const s = st('capability', CAP_DEF);
  const draw = () => {
    el.innerHTML = `<div class="wg">${head(L2('Histogram a způsobilost procesu', 'Histogram & process capability'), L2('Vložte naměřené hodnoty (oddělené mezerou nebo novým řádkem) a toleranční meze. Příklad: tloušťka desky 12,5 ± 0,5 mm.', 'Paste measurements (separated by spaces or new lines) and specification limits. Example: board thickness 12.5 ± 0.5 mm.'))}
    <div class="wgrid"><div>
      <label class="fld"><span>${L2('Data', 'Data')}</span><textarea data-f="data">${esc(s.data)}</textarea></label>
      <div class="row3"><label class="fld"><span>LSL</span>${numIn('lsl', s.lsl)}</label><label class="fld"><span>${L2('Cíl', 'Target')}</span>${numIn('target', s.target)}</label><label class="fld"><span>USL</span>${numIn('usl', s.usl)}</label></div>
      <label class="fld"><span>${L2('Počet tříd', 'Bins')}: <b id="bn"></b></span><input type="range" min="0" max="30" data-f="bins" data-n value="${s.bins}"></label>
      <div class="btns"><button class="btn sm ghost" data-gen>${L2('Nová náhodná data', 'New random data')}</button><button class="btn sm ghost" data-bi>${L2('Dvouvrcholová data', 'Bimodal data')}</button><button class="btn sm ghost" data-reset>${u('reset')}</button></div>
    </div><div class="out"></div></div></div>`;
    bind(el, s, out);
    $('[data-reset]', el).onclick = () => { WS.capability = CAP_DEF(); W.capability(el); };
    $('[data-gen]', el).onclick = () => { const r = rng(Date.now()), m = 12.3 + r() * 0.4, sd = 0.06 + r() * 0.12; s.data = Array.from({ length: 100 }, () => (m + sd * gauss(r)).toFixed(2)).join(' '); draw(); };
    $('[data-bi]', el).onclick = () => { const r = rng(Date.now()); s.data = Array.from({ length: 120 }, (_, i) => ((i % 2 ? 12.3 : 12.65) + 0.07 * gauss(r)).toFixed(2)).join(' '); draw(); };
    out();
  };
  const out = () => {
    const a = nums(s.data), o = $('.out', el);
    if (a.length < 5) { o.innerHTML = `<div class="empty">${L2('Zadejte alespoň 5 hodnot.', 'Enter at least 5 values.')}</div>`; return; }
    const n = a.length, m = mean(a), so = sdev(a);
    let mr = 0; for (let i = 1; i < n; i++) mr += Math.abs(a[i] - a[i - 1]); mr /= (n - 1); const sw = mr / 1.128;
    const L = s.lsl, U = s.usl, hasSpec = U > L;
    const cp = (U - L) / (6 * sw), cpk = Math.min(U - m, m - L) / (3 * sw), pp = (U - L) / (6 * so), ppk = Math.min(U - m, m - L) / (3 * so);
    const ppm = (ncdf((L - m) / so) + 1 - ncdf((U - m) / so)) * 1e6, obs = a.filter(x => x < L || x > U).length;
    const k = s.bins > 0 ? s.bins : clamp(Math.round(Math.sqrt(n)), 5, 25); $('#bn').textContent = s.bins > 0 ? k : 'auto (' + k + ')';
    const mn = Math.min(...a), mx = Math.max(...a), bw = (mx - mn) / k || 1, cnt = Array(k).fill(0);
    a.forEach(x => cnt[Math.min(k - 1, Math.floor((x - mn) / bw))]++);
    let lo = Math.min(mn, hasSpec ? L : mn, m - 3.5 * so), hi = Math.max(mx, hasSpec ? U : mx, m + 3.5 * so); const pad = (hi - lo) * 0.04; lo -= pad; hi += pad;
    const w = 640, h = 300, mg = { l: 40, r: 14, t: 26, b: 34 }, pw = w - mg.l - mg.r, ph = h - mg.t - mg.b;
    const peak = Math.max(...cnt, n * bw * npdf(0) / so), tk = ticks(0, peak, 4), ymax = tk.t[tk.t.length - 1];
    const sx = v => mg.l + (v - lo) / (hi - lo) * pw, sy = v => mg.t + ph * (1 - v / ymax);
    let g = svgOpen(w, h, 'Histogram') + gridY(tk, sy, mg.l, w - mg.r);
    cnt.forEach((c, i) => { const x0 = mn + i * bw, x1 = x0 + bw, out = hasSpec && (x1 <= L || x0 >= U); g += `<rect x="${sx(x0) + 0.5}" y="${sy(c)}" width="${Math.max(0, sx(x1) - sx(x0) - 1)}" height="${ph * c / ymax}" fill="${out ? COL.red : COL.blue}" opacity=".85"><title>${fmt(x0, 3)}–${fmt(x1, 3)}: ${c}</title></rect>`; });
    const pts = []; for (let i = 0; i <= 120; i++) { const x = lo + (hi - lo) * i / 120; pts.push(`${sx(x)},${sy(n * bw * npdf((x - m) / so) / so)}`); }
    g += `<polyline points="${pts.join(' ')}" fill="none" stroke="${COL.orange}" stroke-width="2.5"/>`;
    const vline = (x, c, lab, dash) => `<line x1="${sx(x)}" x2="${sx(x)}" y1="${mg.t - 6}" y2="${h - mg.b}" stroke="${c}" stroke-width="2" ${dash ? 'stroke-dasharray="6 4"' : ''}/><text x="${sx(x)}" y="${mg.t - 10}" text-anchor="middle" style="fill:${c};font-weight:700">${lab}</text>`;
    if (hasSpec) { g += vline(L, COL.red, 'LSL', 1) + vline(U, COL.red, 'USL', 1); if (s.target > L && s.target < U) g += vline(s.target, COL.green, 'T', 1); }
    g += vline(m, COL.grey, 'x̄', 0);
    const xt = ticks(lo, hi, 6); xt.t.filter(v => v >= lo && v <= hi).forEach(v => g += `<text x="${sx(v)}" y="${h - mg.b + 16}" text-anchor="middle">${fmt(v, xt.d)}</text>`);
    g += `<line class="axis" x1="${mg.l}" x2="${w - mg.r}" y1="${h - mg.b}" y2="${h - mg.b}"/></svg>`;
    const cls = v => v >= 1.33 ? 'good' : v >= 1 ? 'warn' : 'bad';
    let msg, mc;
    if (!hasSpec) { msg = L2('Zadejte LSL < USL pro výpočet způsobilosti.', 'Enter LSL < USL to compute capability.'); mc = ''; }
    else if (cpk >= 1.33) { msg = L2(`Proces je <b>způsobilý</b> (Cpk ${fmt(cpk)} ≥ 1,33). Očekávaný podíl mimo toleranci ≈ ${fmt(ppm, 1)} ppm.`, `The process is <b>capable</b> (Cpk ${fmt(cpk)} ≥ 1.33). Expected out-of-spec ≈ ${fmt(ppm, 1)} ppm.`); mc = 'good'; }
    else if (cp >= 1.33 && cpk < 1.33) { msg = L2(`Rozptyl je dobrý (Cp ${fmt(cp)}), ale proces <b>není centrovaný</b> – posuňte střed o ${fmt((L + U) / 2 - m, 3)} směrem k cíli.`, `Spread is fine (Cp ${fmt(cp)}) but the process is <b>off-centre</b> – shift the mean by ${fmt((L + U) / 2 - m, 3)} towards target.`); mc = 'bad'; }
    else { msg = L2(`Proces <b>není způsobilý</b> – je třeba snížit variabilitu. Očekáváno ≈ ${fmt(ppm, 0)} ppm mimo toleranci.`, `The process is <b>not capable</b> – variation must be reduced. Expected ≈ ${fmt(ppm, 0)} ppm out of spec.`); mc = 'bad'; }
    o.innerHTML = `<div class="kpis">${kpi('n', n)}${kpi('x̄', fmt(m, 3))}${kpi('σ ' + L2('celk.', 'overall'), fmt(so, 4))}${kpi('σ ' + L2('uvnitř', 'within'), fmt(sw, 4))}
      ${hasSpec ? kpi('Cp', fmt(cp), cls(cp)) + kpi('Cpk', fmt(cpk), cls(cpk)) + kpi('Pp', fmt(pp), cls(pp)) + kpi('Ppk', fmt(ppk), cls(ppk)) + kpi(L2('Mimo tol. (pozor.)', 'Out of spec (obs.)'), obs) : ''}</div>${g}
      <div class="legend"><span><i style="background:${COL.blue}"></i>${L2('Četnost', 'Frequency')}</span><span><i style="background:${COL.orange}"></i>${L2('Normální rozdělení', 'Normal curve')}</span><span><i style="background:${COL.red}"></i>${L2('Toleranční meze', 'Spec limits')}</span></div>
      <div class="insight ${mc}"><div>${msg}<br><small style="color:var(--muted)">${L2('Cp/Cpk používají σ uvnitř (z klouzavého rozpětí), Pp/Ppk celkovou σ.', 'Cp/Cpk use within σ (from moving range), Pp/Ppk use overall σ.')}</small></div></div>`;
  };
  draw();
};

/* ---------- 5. Scatter ---------- */
const SC_DEF = () => { const r = rng(11); return { xl: L2('Teplota sušárny [°C]', 'Dryer temperature [°C]'), yl: L2('Zbytková vlhkost [%]', 'Residual moisture [%]'), data: Array.from({ length: 30 }, () => { const x = 160 + r() * 40; return `${x.toFixed(1)} ${(1.25 - 0.02 * (x - 160) + 0.07 * gauss(r)).toFixed(2)}`; }).join('\n') }; };
W.scatter = el => {
  const s = st('scatter', SC_DEF);
  const draw = () => {
    el.innerHTML = `<div class="wg">${head(L2('Bodový diagram a regrese', 'Scatter diagram & regression'), L2('Každý řádek = jedna dvojice „X Y“. Spočítá se korelace r, R² a regresní přímka.', 'Each line = one “X Y” pair. Correlation r, R² and the regression line are computed.'))}
    <div class="wgrid"><div>
      <label class="fld"><span>${L2('Popis osy X', 'X-axis label')}</span><input data-f="xl" value="${esc(s.xl)}"></label>
      <label class="fld"><span>${L2('Popis osy Y', 'Y-axis label')}</span><input data-f="yl" value="${esc(s.yl)}"></label>
      <label class="fld"><span>X Y</span><textarea data-f="data" style="min-height:200px">${esc(s.data)}</textarea></label>
      <div class="btns"><button class="btn sm ghost" data-reset>${u('reset')}</button><button class="btn sm ghost" data-none>${L2('Data bez vztahu', 'Unrelated data')}</button></div>
    </div><div class="out"></div></div></div>`;
    bind(el, s, out);
    $('[data-reset]', el).onclick = () => { WS.scatter = SC_DEF(); W.scatter(el); };
    $('[data-none]', el).onclick = () => { const r = rng(Date.now()); s.data = Array.from({ length: 30 }, () => `${(160 + r() * 40).toFixed(1)} ${(0.8 + 0.25 * gauss(r)).toFixed(2)}`).join('\n'); draw(); };
    out();
  };
  const out = () => {
    const P = String(s.data).split('\n').map(l => nums(l)).filter(p => p.length >= 2).map(p => [p[0], p[1]]), o = $('.out', el);
    if (P.length < 3) { o.innerHTML = `<div class="empty">${L2('Zadejte alespoň 3 dvojice.', 'Enter at least 3 pairs.')}</div>`; return; }
    const xs = P.map(p => p[0]), ys = P.map(p => p[1]), mx = mean(xs), my = mean(ys);
    let sxy = 0, sxx = 0, syy = 0; P.forEach(([x, y]) => { sxy += (x - mx) * (y - my); sxx += (x - mx) ** 2; syy += (y - my) ** 2; });
    const b = sxy / sxx, a0 = my - b * mx, r = sxy / Math.sqrt(sxx * syy), n = P.length;
    const tstat = r * Math.sqrt((n - 2) / (1 - r * r)), p = n > 2 ? tTwoSided(Math.abs(tstat), n - 2) : 1;
    const w = 640, h = 340, mg = { l: 52, r: 16, t: 16, b: 46 }, pw = w - mg.l - mg.r, ph = h - mg.t - mg.b;
    const tx = ticks(Math.min(...xs), Math.max(...xs), 6), ty = ticks(Math.min(...ys), Math.max(...ys), 5);
    const x0 = tx.t[0], x1 = tx.t[tx.t.length - 1], y0 = ty.t[0], y1 = ty.t[ty.t.length - 1];
    const sx = v => mg.l + (v - x0) / (x1 - x0) * pw, sy = v => mg.t + ph * (1 - (v - y0) / (y1 - y0));
    let g = svgOpen(w, h, 'Scatter') + gridY(ty, sy, mg.l, w - mg.r);
    tx.t.forEach(v => g += `<text x="${sx(v)}" y="${h - mg.b + 16}" text-anchor="middle">${fmt(v, tx.d)}</text>`);
    g += `<text x="${mg.l + pw / 2}" y="${h - 6}" text-anchor="middle" class="lbl">${esc(s.xl)}</text><text transform="translate(12,${mg.t + ph / 2}) rotate(-90)" text-anchor="middle" class="lbl">${esc(s.yl)}</text>`;
    g += `<line x1="${sx(x0)}" y1="${sy(a0 + b * x0)}" x2="${sx(x1)}" y2="${sy(a0 + b * x1)}" stroke="${COL.orange}" stroke-width="2.5" clip-path="url(#scc)"/><clipPath id="scc"><rect x="${mg.l}" y="${mg.t}" width="${pw}" height="${ph}"/></clipPath>`;
    P.forEach(([x, y]) => g += `<circle cx="${sx(x)}" cy="${sy(y)}" r="5" fill="${COL.blue}" fill-opacity=".75" stroke="#fff" stroke-width="1"><title>${x}; ${y}</title></circle>`);
    g += `<line class="axis" x1="${mg.l}" x2="${w - mg.r}" y1="${h - mg.b}" y2="${h - mg.b}"/></svg>`;
    const ar = Math.abs(r), strength = ar > 0.7 ? L2('silný', 'strong') : ar > 0.3 ? L2('střední', 'moderate') : L2('slabý / žádný', 'weak / none');
    const dir = r > 0 ? L2('pozitivní', 'positive') : L2('negativní', 'negative');
    o.innerHTML = `<div class="kpis">${kpi('n', n)}${kpi('r', fmt(r, 3), ar > 0.7 ? 'good' : ar > 0.3 ? 'warn' : 'bad')}${kpi('R²', fmt(r * r * 100, 1) + ' %')}${kpi(L2('p-hodnota', 'p-value'), p < 0.001 ? '< 0,001'.replace(',', S.lang === 'cs' ? ',' : '.') : fmt(p, 3))}</div>${g}
    <div class="insight ${ar > 0.7 ? 'good' : ''}"><div>${L2(`Vztah je <b>${strength}</b> a ${dir}. Rovnice: <b>Y = ${fmt(a0, 3)} ${b < 0 ? '−' : '+'} ${fmt(Math.abs(b), 4)}·X</b>. Model vysvětluje ${fmt(r * r * 100, 0)} % variability Y. Pamatujte: korelace neprokazuje příčinu – ověřte ji experimentem (DOE).`, `The relationship is <b>${strength}</b> and ${dir}. Equation: <b>Y = ${fmt(a0, 3)} ${b < 0 ? '−' : '+'} ${fmt(Math.abs(b), 4)}·X</b>. The model explains ${fmt(r * r * 100, 0)} % of Y variation. Remember: correlation is not causation – confirm it with an experiment (DOE).`)}</div></div>`;
  };
  draw();
};

/* ---------- 6. Control chart I-MR ---------- */
const CC_DEF = () => { const r = rng(5); const a = Array.from({ length: 30 }, (_, i) => 9.8 + (i >= 20 ? 0.085 : 0) + 0.04 * gauss(r)); a[8] += 0.2; return { data: a.map(x => x.toFixed(3)).join(' '), add: '' }; };
W.control = el => {
  const s = st('control', CC_DEF);
  const draw = () => {
    el.innerHTML = `<div class="wg">${head(L2('Regulační diagram I-MR', 'I-MR control chart'), L2('Individuální hodnoty a klouzavé rozpětí. Body porušující pravidla se zvýrazní červeně. Příklad: plošná hmotnost desky [kg/m²].', 'Individuals and moving range. Points violating the rules turn red. Example: board weight [kg/m²].'))}
    <div class="wgrid"><div>
      <label class="fld"><span>${L2('Data v časovém pořadí', 'Data in time order')}</span><textarea data-f="data" style="min-height:160px">${esc(s.data)}</textarea></label>
      <label class="fld"><span>${L2('Přidat nové měření', 'Add a new measurement')}</span><div style="display:flex;gap:8px"><input class="in" id="ccadd" inputmode="decimal" placeholder="9,85"><button class="btn sm" id="ccgo">+</button></div></label>
      <div class="btns"><button class="btn sm ghost" data-reset>${u('reset')}</button><button class="btn sm ghost" data-stable>${L2('Stabilní proces', 'Stable process')}</button></div>
      <div class="box" style="box-shadow:none;background:var(--bg);margin-top:14px;padding:14px;font-size:13.5px"><b>${L2('Pravidla (Western Electric / Nelson)', 'Rules (Western Electric / Nelson)')}</b><ol style="margin:6px 0 0;padding-left:18px">
        <li>${L2('1 bod mimo ±3σ', '1 point beyond ±3σ')}</li><li>${L2('9 bodů v řadě na jedné straně CL', '9 points in a row on one side of CL')}</li><li>${L2('6 bodů v řadě stoupá / klesá', '6 points in a row increasing / decreasing')}</li><li>${L2('2 ze 3 bodů za ±2σ na stejné straně', '2 of 3 points beyond ±2σ on the same side')}</li></ol></div>
    </div><div class="out"></div></div></div>`;
    bind(el, s, out);
    const add = () => { const v = num($('#ccadd', el).value); if ($('#ccadd', el).value.trim()) { s.data = String(s.data).trim() + ' ' + v; draw(); $('#ccadd', el).focus(); } };
    $('#ccgo', el).onclick = add; $('#ccadd', el).onkeydown = e => { if (e.key === 'Enter') add(); };
    $('[data-reset]', el).onclick = () => { WS.control = CC_DEF(); W.control(el); };
    $('[data-stable]', el).onclick = () => { const r = rng(Date.now()); s.data = Array.from({ length: 30 }, () => (9.8 + 0.04 * gauss(r)).toFixed(3)).join(' '); draw(); };
    out();
  };
  const out = () => {
    const a = nums(s.data), n = a.length, o = $('.out', el);
    if (n < 5) { o.innerHTML = `<div class="empty">${L2('Zadejte alespoň 5 hodnot.', 'Enter at least 5 values.')}</div>`; return; }
    const cl = mean(a), mr = a.slice(1).map((x, i) => Math.abs(x - a[i])), mrb = mean(mr), sg = mrb / 1.128;
    const ucl = cl + 3 * sg, lcl = cl - 3 * sg, mucl = 3.267 * mrb;
    const viol = a.map(() => new Set());
    a.forEach((x, i) => { if (x > ucl || x < lcl) viol[i].add(1); });
    for (let i = 8; i < n; i++) { const w9 = a.slice(i - 8, i + 1); if (w9.every(x => x > cl) || w9.every(x => x < cl)) viol[i].add(2); }
    for (let i = 5; i < n; i++) { const w6 = a.slice(i - 5, i + 1); let up = true, dn = true; for (let j = 1; j < 6; j++) { if (!(w6[j] > w6[j - 1])) up = false; if (!(w6[j] < w6[j - 1])) dn = false; } if (up || dn) viol[i].add(3); }
    for (let i = 2; i < n; i++) { const w3 = a.slice(i - 2, i + 1); if (w3.filter(x => x > cl + 2 * sg).length >= 2 && a[i] > cl + 2 * sg) viol[i].add(4); if (w3.filter(x => x < cl - 2 * sg).length >= 2 && a[i] < cl - 2 * sg) viol[i].add(4); }
    const chart = (vals, c, u0, l0, h, lab, isI, offset) => {
      const w = 640, mg = { l: 54, r: 60, t: 14, b: 24 }, pw = w - mg.l - mg.r, ph = h - mg.t - mg.b;
      const lo = Math.min(...vals, l0 ?? Infinity), hi = Math.max(...vals, u0), tk = ticks(lo, hi, 4), y0 = Math.min(tk.t[0], lo), y1 = Math.max(tk.t[tk.t.length - 1], hi);
      const sx = i => mg.l + (i + offset) / Math.max(1, n - 1) * pw, sy = v => mg.t + ph * (1 - (v - y0) / (y1 - y0));
      let g = svgOpen(w, h, lab) + gridY({ t: tk.t.filter(v => v >= y0 && v <= y1), d: tk.d + 1 }, sy, mg.l, w - mg.r);
      if (isI) { [[cl + sg, cl - sg], [cl + 2 * sg, cl - 2 * sg]].forEach(([p, q], k) => g += `<rect x="${mg.l}" y="${sy(p)}" width="${pw}" height="${sy(q) - sy(p)}" fill="${COL.green}" opacity="${k ? 0.05 : 0.07}"/>`); }
      const hl = (v, col, t, dash) => `<line x1="${mg.l}" x2="${w - mg.r}" y1="${sy(v)}" y2="${sy(v)}" stroke="${col}" stroke-width="1.6" ${dash ? 'stroke-dasharray="6 4"' : ''}/><text x="${w - mg.r + 4}" y="${sy(v) + 4}" style="fill:${col};font-weight:700">${t} ${fmt(v, 3)}</text>`;
      g += hl(u0, COL.red, 'UCL', 1) + hl(c, COL.green, 'CL', 0); if (l0 != null) g += hl(l0, COL.red, 'LCL', 1);
      g += `<polyline points="${vals.map((v, i) => `${sx(i)},${sy(v)}`).join(' ')}" fill="none" stroke="${COL.blue}" stroke-width="1.8"/>`;
      vals.forEach((v, i) => { const bad = isI ? viol[i].size : v > u0; g += `<circle cx="${sx(i)}" cy="${sy(v)}" r="${bad ? 5.5 : 3.5}" fill="${bad ? COL.red : COL.blue}"><title>#${i + 1 + offset}: ${v}${bad && isI ? ' – ' + L2('pravidlo', 'rule') + ' ' + [...viol[i]].join(', ') : ''}</title></circle>`; });
      const step = Math.ceil(n / 15); for (let i = 0; i < n; i += step) g += `<text x="${mg.l + i / Math.max(1, n - 1) * pw}" y="${h - 6}" text-anchor="middle">${i + 1}</text>`;
      return g + `<text x="6" y="${mg.t + 10}" class="lbl">${lab}</text></svg>`;
    };
    const vi = a.map((v, i) => [i, viol[i]]).filter(([, v]) => v.size);
    const ruleTxt = { 1: L2('mimo ±3σ', 'beyond ±3σ'), 2: L2('9 bodů na jedné straně', '9 points on one side'), 3: L2('6 bodů trend', '6-point trend'), 4: L2('2 ze 3 za 2σ', '2 of 3 beyond 2σ') };
    o.innerHTML = `<div class="kpis">${kpi('n', n)}${kpi('CL (x̄)', fmt(cl, 3))}${kpi('UCL', fmt(ucl, 3))}${kpi('LCL', fmt(lcl, 3))}${kpi('MR̄', fmt(mrb, 4))}${kpi(L2('Signály', 'Signals'), vi.length, vi.length ? 'bad' : 'good')}</div>
      ${chart(a, cl, ucl, lcl, 260, 'I', true, 0)}<div style="height:6px"></div>${chart(mr, mrb, mucl, null, 150, 'MR', false, 1)}
      <div class="insight ${vi.length ? 'bad' : 'good'}"><div>${vi.length ? L2('Proces <b>není ve statisticky zvládnutém stavu</b> – hledejte zvláštní příčiny: ', 'The process is <b>out of statistical control</b> – look for special causes: ') + vi.slice(0, 8).map(([i, v]) => `#${i + 1} (${[...v].map(k => ruleTxt[k]).join(', ')})`).join('; ') + (vi.length > 8 ? '…' : '') : L2('Proces je <b>stabilní</b> – vykazuje pouze náhodnou variabilitu. Do procesu nezasahujte.', 'The process is <b>stable</b> – only common-cause variation. Do not tamper.')}</div></div>`;
  };
  draw();
};

/* ---------- 7. Stratification ---------- */
const STR_DEF = () => ({ m: [[8, 9, 10], [10, 12, 38], [9, 8, 11]], mode: 'none' });
W.strat = el => {
  const s = st('strat', STR_DEF);
  const lines = [L2('Linka A', 'Line A'), L2('Linka B', 'Line B'), L2('Linka C', 'Line C')], shifts = [L2('Ranní', 'Morning'), L2('Odpolední', 'Afternoon'), L2('Noční', 'Night')];
  const draw = () => {
    el.innerHTML = `<div class="wg">${head(L2('Stratifikace vad hran', 'Stratifying edge defects'), L2('Stejná data – různé pohledy. Přepínejte vrstvy a sledujte, jak se objeví skutečný zdroj problému.', 'Same data – different views. Switch layers and watch the real source of the problem emerge.'))}
    <div class="wgrid"><div>
      <table class="ed"><thead><tr><th></th>${shifts.map(x => `<th>${x}</th>`).join('')}</tr></thead><tbody>${lines.map((l, i) => `<tr><td><b>${l}</b></td>${shifts.map((_, j) => `<td><input data-sm="${i},${j}" inputmode="numeric" value="${s.m[i][j]}"></td>`).join('')}</tr>`).join('')}</tbody></table>
      <p style="font-size:13px;font-weight:700;color:var(--muted);margin:16px 0 6px">${L2('Stratifikovat podle', 'Stratify by')}</p>
      <div class="chips">${[['none', L2('Nic (souhrn)', 'Nothing (total)')], ['line', L2('Linka', 'Line')], ['shift', L2('Směna', 'Shift')], ['both', L2('Linka × směna', 'Line × shift')]].map(([k, t]) => `<button class="chip ${s.mode === k ? 'on' : ''}" data-mode="${k}">${t}</button>`).join('')}</div>
      <div class="btns"><button class="btn sm ghost" data-reset>${u('reset')}</button></div>
    </div><div class="out"></div></div></div>`;
    $$('[data-sm]', el).forEach(inp => inp.oninput = () => { const [i, j] = inp.dataset.sm.split(','); s.m[i][j] = Math.max(0, Math.round(num(inp.value))); out(); });
    $$('[data-mode]', el).forEach(b => b.onclick = () => { s.mode = b.dataset.mode; draw(); });
    $('[data-reset]', el).onclick = () => { WS.strat = STR_DEF(); W.strat(el); };
    out();
  };
  const out = () => {
    const M = s.m, tot = M.flat().reduce((a, b) => a + b, 0) || 1;
    let groups;
    if (s.mode === 'none') groups = [{ n: L2('Všechny vady hran', 'All edge defects'), bars: [{ v: tot, c: COL.blue }] }];
    else if (s.mode === 'line') groups = lines.map((l, i) => ({ n: l, bars: [{ v: M[i].reduce((a, b) => a + b, 0), c: PAL[i] }] }));
    else if (s.mode === 'shift') groups = shifts.map((x, j) => ({ n: x, bars: [{ v: M.reduce((a, r) => a + r[j], 0), c: PAL[j + 3] }] }));
    else groups = lines.map((l, i) => ({ n: l, bars: shifts.map((x, j) => ({ v: M[i][j], c: PAL[j + 3], t: x })) }));
    const max = Math.max(...groups.flatMap(g => g.bars.map(b => b.v)), 1), tk = ticks(0, max, 4), ymax = tk.t[tk.t.length - 1];
    const w = 640, h = 300, mg = { l: 40, r: 10, t: 20, b: 34 }, pw = w - mg.l - mg.r, ph = h - mg.t - mg.b, gw = pw / groups.length;
    const sy = v => mg.t + ph * (1 - v / ymax);
    let g = svgOpen(w, h, 'Stratification') + gridY(tk, sy, mg.l, w - mg.r);
    groups.forEach((gr, i) => {
      const bw = Math.min(90, gw * 0.7 / gr.bars.length), x0 = mg.l + i * gw + (gw - bw * gr.bars.length) / 2;
      gr.bars.forEach((b, j) => { g += `<rect x="${x0 + j * bw + 2}" y="${sy(b.v)}" width="${bw - 4}" height="${ph * b.v / ymax}" rx="3" fill="${b.c}"><title>${b.t ? b.t + ': ' : ''}${b.v}</title></rect><text x="${x0 + j * bw + bw / 2}" y="${sy(b.v) - 5}" text-anchor="middle" class="lbl">${b.v}</text>`; });
      g += `<text x="${mg.l + i * gw + gw / 2}" y="${h - 10}" text-anchor="middle" class="lbl">${gr.n}</text>`;
    });
    g += `<line class="axis" x1="${mg.l}" x2="${w - mg.r}" y1="${h - mg.b}" y2="${h - mg.b}"/></svg>`;
    let mi = 0, mj = 0; M.forEach((r, i) => r.forEach((v, j) => { if (v > M[mi][mj]) { mi = i; mj = j; } }));
    const msg = s.mode === 'none' ? L2('Souhrnné číslo neříká, kde problém vzniká. Zkuste stratifikovat podle linky a směny.', 'The total does not say where the problem comes from. Try stratifying by line and shift.')
      : s.mode === 'both' ? L2(`<b>${lines[mi]} – ${shifts[mj].toLowerCase()} směna</b> tvoří ${fmt(M[mi][mj] / tot * 100, 0)} % všech vad (1 z 9 kombinací). Tady začněte hledat příčinu.`, `<b>${lines[mi]} – ${shifts[mj].toLowerCase()} shift</b> accounts for ${fmt(M[mi][mj] / tot * 100, 0)} % of all defects (1 of 9 combinations). Start the root-cause search here.`)
      : L2('Rozdíly se začínají ukazovat. Zkombinujte oba faktory.', 'Differences start to show. Combine both factors.');
    $('.out', el).innerHTML = g + (s.mode === 'both' ? `<div class="legend">${shifts.map((x, j) => `<span><i style="background:${PAL[j + 3]}"></i>${x}</span>`).join('')}</div>` : '') + `<div class="insight ${s.mode === 'both' ? 'good' : ''}"><div>${msg}</div></div>`;
  };
  draw();
};

/* ---------- 5S audit ---------- */
const Q5 = [
  { s: { cs: 'Separovat', en: 'Sort' }, j: 'Seiri', q: [{ cs: 'Na pracovišti nejsou nepotřebné předměty', en: 'No unneeded items in the workplace' }, { cs: 'Červené štítky jsou vyhodnocovány', en: 'Red tags are reviewed' }, { cs: 'Uličky a podlaha jsou volné', en: 'Aisles and floor are clear' }] },
  { s: { cs: 'Systematizovat', en: 'Set in order' }, j: 'Seiton', q: [{ cs: 'Vše má označené místo', en: 'Everything has a labelled place' }, { cs: 'Nářadí je na stínové tabuli', en: 'Tools are on a shadow board' }, { cs: 'Značení podlah je kompletní', en: 'Floor markings are complete' }] },
  { s: { cs: 'Stále čistit', en: 'Shine' }, j: 'Seiso', q: [{ cs: 'Stroje a podlaha jsou čisté', en: 'Machines and floor are clean' }, { cs: 'Plán čištění existuje a je plněn', en: 'A cleaning plan exists and is followed' }, { cs: 'Zdroje znečištění jsou odstraňovány', en: 'Contamination sources are eliminated' }] },
  { s: { cs: 'Standardizovat', en: 'Standardise' }, j: 'Seiketsu', q: [{ cs: 'Fotostandardy jsou vyvěšené a aktuální', en: 'Photo standards are posted and current' }, { cs: 'Vizuální řízení ukazuje abnormality', en: 'Visual management shows abnormalities' }, { cs: 'Pravidla platí pro všechny směny', en: 'Rules apply to all shifts' }] },
  { s: { cs: 'Sebedisciplína', en: 'Sustain' }, j: 'Shitsuke', q: [{ cs: 'Audity probíhají pravidelně', en: 'Audits take place regularly' }, { cs: 'Nálezy z auditů jsou uzavírány', en: 'Audit findings are closed' }, { cs: 'Vedoucí se 5S aktivně účastní', en: 'Leaders actively take part in 5S' }] }];
W.fives = el => {
  const s = st('fives', () => ({ v: [[3, 2, 3], [2, 1, 2], [2, 2, 1], [1, 2, 1], [1, 0, 1]] }));
  const draw = () => {
    el.innerHTML = `<div class="wg">${head(L2('Audit 5S', '5S audit'), L2('Ohodnoťte každou otázku 0 (vůbec) až 4 (vzorově). Radar ukáže silné a slabé stránky.', 'Rate each item 0 (not at all) to 4 (exemplary). The radar shows strengths and gaps.'))}
    <div class="wgrid"><div>${Q5.map((p, i) => `<div style="margin-bottom:10px"><b style="color:var(--blue)">${i + 1}S · ${tr(p.s)}</b> <small style="color:var(--muted)">${p.j}</small>
      ${p.q.map((q, j) => `<div class="q5"><span>${tr(q)}</span><span class="dots">${[0, 1, 2, 3, 4].map(k => `<button class="${s.v[i][j] === k ? 'on' : ''}" data-q="${i},${j},${k}">${k}</button>`).join('')}</span></div>`).join('')}</div>`).join('')}</div>
    <div class="out"></div></div></div>`;
    $$('[data-q]', el).forEach(b => b.onclick = () => { const [i, j, k] = b.dataset.q.split(',').map(Number); s.v[i][j] = k; draw(); });
    const sc = s.v.map(r => r.reduce((a, b) => a + b, 0) / 12 * 100), total = sc.reduce((a, b) => a + b, 0) / 5;
    const w = 420, h = 400, cx = 210, cy = 200, R = 140, ang = i => -Math.PI / 2 + i * 2 * Math.PI / 5, pt = (i, r) => [cx + Math.cos(ang(i)) * r, cy + Math.sin(ang(i)) * r];
    let g = svgOpen(w, h, '5S radar');
    [25, 50, 75, 100].forEach(p => g += `<polygon points="${[0, 1, 2, 3, 4].map(i => pt(i, R * p / 100).join(',')).join(' ')}" fill="none" class="s-line" stroke-width="1"/><text x="${cx + 4}" y="${cy - R * p / 100 + 12}">${p}</text>`);
    [0, 1, 2, 3, 4].forEach(i => { const [x, y] = pt(i, R), [lx, ly] = pt(i, R + 26); g += `<line x1="${cx}" y1="${cy}" x2="${x}" y2="${y}" class="s-line"/><text x="${lx}" y="${ly + 4}" text-anchor="middle" class="lbl">${i + 1}S ${tr(Q5[i].s)}</text>`; });
    g += `<polygon points="${sc.map((v, i) => pt(i, R * v / 100).join(',')).join(' ')}" fill="${COL.blue}" fill-opacity=".3" stroke="${COL.blue}" stroke-width="2.5"/>`;
    sc.forEach((v, i) => { const [x, y] = pt(i, R * v / 100); g += `<circle cx="${x}" cy="${y}" r="4.5" fill="${COL.blue}"/>`; });
    g += '</svg>';
    const weak = sc.indexOf(Math.min(...sc)), lvl = total >= 80 ? L2('Vzorové pracoviště', 'Exemplary workplace') : total >= 60 ? L2('Dobrá úroveň', 'Good level') : total >= 40 ? L2('Základy zavedeny', 'Basics in place') : L2('Začátek cesty', 'Starting out');
    $('.out', el).innerHTML = `<div class="kpis">${kpi(L2('Celkové skóre', 'Total score'), fmt(total, 0) + ' %', total >= 60 ? 'good' : total >= 40 ? 'warn' : 'bad')}${kpi(L2('Úroveň', 'Level'), `<span style="font-size:16px">${lvl}</span>`)}</div><div style="max-width:420px;margin:0 auto">${g}</div>
      <div class="insight"><div>${L2(`Nejslabší pilíř: <b>${weak + 1}S ${tr(Q5[weak].s)}</b> (${fmt(sc[weak], 0)} %). Pamatujte – 5S se staví odspodu: bez Separovat a Systematizovat nemá smysl standardizovat.`, `Weakest pillar: <b>${weak + 1}S ${tr(Q5[weak].s)}</b> (${fmt(sc[weak], 0)} %). Remember – 5S builds bottom-up: standardising makes no sense before Sort and Set in order.`)}</div></div>`;
  };
  draw();
};

/* ---------- 8 wastes ---------- */
const WASTES = [
  ['T', { cs: 'Transport', en: 'Transport' }, { cs: 'Zbytečné přemisťování materiálu.', en: 'Unnecessary movement of material.' }, { cs: 'Palety převáženy 3× mezi sklady.', en: 'Pallets moved 3× between stores.' }],
  ['I', { cs: 'Zásoby', en: 'Inventory' }, { cs: 'Více materiálu, než je potřeba.', en: 'More material than needed.' }, { cs: 'Týdenní zásoba kartonu u linky.', en: 'A week of paper stock at the line.' }],
  ['M', { cs: 'Pohyb', en: 'Motion' }, { cs: 'Zbytečné pohyby lidí – chůze, ohýbání, hledání.', en: 'Unneeded movement of people – walking, bending, searching.' }, { cs: 'Hledání nářadí při přestavbě.', en: 'Searching for tools at changeover.' }],
  ['W', { cs: 'Čekání', en: 'Waiting' }, { cs: 'Lidé nebo materiál čekají.', en: 'People or material waiting.' }, { cs: 'Operátor čeká na uvolnění kvalitou.', en: 'Operator waits for QC release.' }],
  ['O', { cs: 'Nadvýroba', en: 'Overproduction' }, { cs: 'Výroba víc, dříve nebo rychleji, než zákazník chce.', en: 'Making more, earlier or faster than the customer needs.' }, { cs: 'Výroba do skladu „pro jistotu“.', en: 'Producing to stock “just in case”.' }],
  ['O', { cs: 'Zbytečné zpracování', en: 'Overprocessing' }, { cs: 'Práce navíc, kterou zákazník neocení.', en: 'Extra work the customer does not value.' }, { cs: 'Dvojí kontrola téhož parametru.', en: 'Checking the same parameter twice.' }],
  ['D', { cs: 'Vady', en: 'Defects' }, { cs: 'Zmetky, opravy, reklamace.', en: 'Scrap, rework, complaints.' }, { cs: 'Desky s poškozenou hranou.', en: 'Boards with damaged edges.' }],
  ['S', { cs: 'Nevyužité dovednosti', en: 'Unused skills' }, { cs: 'Nevyužité znalosti a nápady lidí.', en: 'Unused knowledge and ideas of people.' }, { cs: 'Zlepšovací návrhy bez reakce.', en: 'Improvement ideas never answered.' }]];
W.muda = el => {
  const s = st('muda', () => ({ c: [3, 2, 5, 4, 1, 1, 2, 1] }));
  const draw = () => {
    const tot = s.c.reduce((a, b) => a + b, 0), mx = s.c.indexOf(Math.max(...s.c));
    el.innerHTML = `<div class="wg">${head(L2('Waste walk – lov na plýtvání', 'Waste walk – hunting for waste'), L2('Projděte pracoviště a zaznamenejte každé pozorované plýtvání do správné kategorie TIMWOODS.', 'Walk the workplace and record every observed waste in the right TIMWOODS category.'))}
    <div class="waste">${WASTES.map((x, i) => `<div class="wc" style="border-color:${PAL[i % PAL.length]}"><span class="L" style="color:${PAL[i % PAL.length]}">${x[0]}</span><h4>${tr(x[1])}</h4><p>${tr(x[2])}</p><p class="ex">${L2('Např.', 'E.g.')} ${tr(x[3])}</p>
      <div class="cnt"><button data-dm="${i}">−</button><b>${s.c[i]}</b><button data-dp="${i}">+</button><div style="flex:1;height:8px;background:var(--line);border-radius:5px"><div style="height:8px;border-radius:5px;background:${PAL[i % PAL.length]};width:${tot ? s.c[i] / Math.max(...s.c) * 100 : 0}%"></div></div></div></div>`).join('')}</div>
    <div class="insight"><div>${L2(`Zaznamenáno <b>${tot}</b> pozorování. Nejčastější: <b>${tr(WASTES[mx][1])}</b>. Ptejte se „proč“ toto plýtvání vzniká – a pamatujte, že nadvýroba často způsobuje ostatní druhy.`, `<b>${tot}</b> observations recorded. Most frequent: <b>${tr(WASTES[mx][1])}</b>. Ask “why” this waste occurs – and remember overproduction often drives the others.`)}</div></div>
    <div class="btns"><button class="btn sm ghost" data-zero>${u('clear')}</button></div></div>`;
    $$('[data-dp]', el).forEach(b => b.onclick = () => { s.c[+b.dataset.dp]++; draw(); });
    $$('[data-dm]', el).forEach(b => b.onclick = () => { s.c[+b.dataset.dm] = Math.max(0, s.c[+b.dataset.dm] - 1); draw(); });
    $('[data-zero]', el).onclick = () => { s.c = s.c.map(() => 0); draw(); };
  };
  draw();
};

/* ---------- VSM ---------- */
const VSM_DEF = () => ({ rows: [
  { n: { cs: 'Příjem sádrovce', en: 'Gypsum receipt' }, w: 48, p: 15 },
  { n: { cs: 'Mletí a kalcinace', en: 'Grinding & calcining' }, w: 8, p: 6 },
  { n: { cs: 'Míchání a formování', en: 'Mixing & forming' }, w: 0.5, p: 2 },
  { n: { cs: 'Sušení', en: 'Drying' }, w: 0, p: 45 },
  { n: { cs: 'Řezání a balení', en: 'Cutting & packing' }, w: 1, p: 4 },
  { n: { cs: 'Expedice', en: 'Shipping' }, w: 72, p: 10 }] });
W.vsm = el => {
  const s = st('vsm', VSM_DEF);
  const draw = () => {
    el.innerHTML = `<div class="wg">${head(L2('Časová osa mapy toku hodnot', 'Value stream timeline'), L2('Zadejte kroky, čekání před krokem (zásoby) v hodinách a čas zpracování v minutách. Spočítá se průběžná doba a PCE.', 'Enter steps, waiting before each step (inventory) in hours and processing time in minutes. Lead time and PCE are calculated.'))}
    ${rowsTable(s, [{ h: L2('Krok procesu', 'Process step'), f: 'n' }, { h: L2('Čekání [h]', 'Wait [h]'), f: 'w', n: 1, w: '110px' }, { h: L2('Zpracování [min]', 'Process [min]'), f: 'p', n: 1, w: '130px' }], { reset: 1 })}
    <div class="out" style="margin-top:18px"></div></div>`;
    bind(el, s, out); bindRows(el, s, draw, () => ({ n: '', w: 0, p: 1 }), () => { s.rows = VSM_DEF().rows; });
    out();
  };
  const out = () => {
    const R = s.rows, va = R.reduce((a, r) => a + r.p, 0), wait = R.reduce((a, r) => a + r.w * 60, 0), lt = va + wait, pce = lt ? va / lt * 100 : 0;
    const fT = m => m >= 1440 ? fmt(m / 1440, 1) + ' ' + L2('d', 'd') : m >= 60 ? fmt(m / 60, 1) + ' h' : fmt(m, 0) + ' min';
    const n = R.length, w = 900, h = 220, x0 = 20, sw = (w - 40) / Math.max(1, n);
    let g = svgOpen(w, h, 'VSM timeline');
    R.forEach((r, i) => {
      const x = x0 + i * sw;
      g += `<polygon points="${x + sw * 0.18},70 ${x + sw * 0.3},48 ${x + sw * 0.42},70" fill="${COL.yellow}" stroke="${COL.orange}"/><text x="${x + sw * 0.3}" y="66" text-anchor="middle" style="fill:#003778;font-weight:700;font-size:12px">I</text>`;
      g += `<rect x="${x + sw * 0.5}" y="20" width="${sw * 0.46}" height="56" rx="6" fill="${COL.blue}"/><text x="${x + sw * 0.73}" y="44" text-anchor="middle" style="fill:#fff;font-weight:700;font-size:11px">${esc(trunc(tr(r.n), 14))}</text><text x="${x + sw * 0.73}" y="62" text-anchor="middle" style="fill:#fff;font-size:11px">C/T ${fmt(r.p, 0)}′</text>`;
      g += `<polyline points="${x},110 ${x + sw * 0.5},110 ${x + sw * 0.5},160 ${x + sw},160 ${x + sw},110" fill="none" class="s-ink" stroke-width="2"/>`;
      g += `<text x="${x + sw * 0.25}" y="102" text-anchor="middle" style="fill:${COL.red};font-weight:700">${fT(r.w * 60)}</text><text x="${x + sw * 0.75}" y="178" text-anchor="middle" style="fill:${COL.green};font-weight:700">${fT(r.p)}</text>`;
    });
    g += `<text x="${x0}" y="210" class="lbl">${L2('Čekání ↑ · Přidaná hodnota ↓', 'Waiting ↑ · Value-added ↓')}</text></svg>`;
    $('.out', el).innerHTML = `<div class="kpis">${kpi(L2('Průběžná doba', 'Lead time'), fT(lt))}${kpi(L2('Čas přidávající hodnotu', 'Value-added time'), fT(va), 'good')}${kpi(L2('Čekání', 'Waiting'), fT(wait), 'bad')}${kpi('PCE', fmt(pce, pce < 1 ? 2 : 1) + ' %', pce > 25 ? 'good' : pce > 5 ? 'warn' : 'bad')}</div><div class="tscroll">${g}</div>
      <div class="insight"><div>${L2(`Z celkové průběžné doby přidává hodnotu jen <b>${fmt(pce, 2)} %</b>. Největší potenciál je ve zkrácení čekání a zásob – ne ve zrychlování strojů.`, `Only <b>${fmt(pce, 2)} %</b> of the lead time adds value. The biggest potential lies in reducing waiting and inventory – not in speeding up machines.`)}</div></div>`;
  };
  draw();
};

/* ---------- Kanban ---------- */
W.kanban = el => {
  const s = st('kanban', () => ({ D: 900, L: 2, sf: 20, C: 100 }));
  const draw = () => {
    el.innerHTML = `<div class="wg">${head(L2('Výpočet počtu kanbanových karet', 'Kanban card calculator'), 'N = D × L × (1 + α) / C')}
    <div class="wgrid"><div>
      <label class="fld"><span>${L2('Denní spotřeba D [ks/den]', 'Daily demand D [pcs/day]')}</span>${numIn('D', s.D)}</label>
      <label class="fld"><span>${L2('Doba doplnění L [dny]', 'Replenishment lead time L [days]')}</span>${numIn('L', s.L)}</label>
      <label class="fld"><span>${L2('Pojistná zásoba α [%]', 'Safety factor α [%]')}</span>${numIn('sf', s.sf)}</label>
      <label class="fld"><span>${L2('Kusů v kontejneru C', 'Pieces per container C')}</span>${numIn('C', s.C)}</label>
    </div><div class="out"></div></div></div>`;
    bind(el, s, out); out();
  };
  const out = () => {
    const raw = s.C > 0 ? s.D * s.L * (1 + s.sf / 100) / s.C : 0, N = Math.ceil(raw - 1e-9), inv = N * s.C, days = s.D ? inv / s.D : 0;
    $('.out', el).innerHTML = `<div class="kpis">${kpi(L2('Počet karet', 'Cards'), N, 'good')}${kpi(L2('Max. zásoba', 'Max. inventory'), fmt(inv, 0) + ' ' + L2('ks', 'pcs'))}${kpi(L2('Pokrytí', 'Coverage'), fmt(days, 1) + ' ' + L2('dne', 'days'))}</div>
      <div class="kb">${Array.from({ length: Math.min(N, 80) }, (_, i) => `<i>${i + 1}</i>`).join('')}${N > 80 ? '<b style="align-self:center">…</b>' : ''}</div>
      <div class="insight"><div>${L2(`Výpočet: ${fmt(s.D, 0)} × ${fmt(s.L, 1)} × ${fmt(1 + s.sf / 100, 2)} / ${fmt(s.C, 0)} = ${fmt(raw, 2)} → zaokrouhleno nahoru na <b>${N}</b>. Postupně snižujte α a odhalujte skryté problémy.`, `Calculation: ${fmt(s.D, 0)} × ${fmt(s.L, 1)} × ${fmt(1 + s.sf / 100, 2)} / ${fmt(s.C, 0)} = ${fmt(raw, 2)} → rounded up to <b>${N}</b>. Gradually reduce α to expose hidden problems.`)}</div></div>`;
  };
  draw();
};

/* ---------- SMED ---------- */
const SMED_DEF = () => ({ red: 25, rows: [
  { n: { cs: 'Hledání a donesení nástrojů', en: 'Searching and fetching tools' }, t: 8, k: 'E' },
  { n: { cs: 'Příprava výkresu a materiálu', en: 'Preparing drawing and material' }, t: 6, k: 'E' },
  { n: { cs: 'Demontáž dorazů', en: 'Removing stops' }, t: 7, k: 'I' },
  { n: { cs: 'Výměna nože', en: 'Blade change' }, t: 10, k: 'I' },
  { n: { cs: 'Seřízení a zkušební řez', en: 'Adjustment and test cut' }, t: 12, k: 'I' },
  { n: { cs: 'Úklid a odnesení nářadí', en: 'Cleaning up and returning tools' }, t: 5, k: 'E' },
  { n: { cs: 'Čekání na uvolnění kvalitou', en: 'Waiting for quality release' }, t: 4, k: 'X' }] });
W.smed = el => {
  const s = st('smed', SMED_DEF);
  const K = [['I', L2('Interní (stroj stojí)', 'Internal (machine stopped)')], ['E', L2('Externí (za chodu)', 'External (while running)')], ['X', L2('Eliminovat', 'Eliminate')]];
  const KC = { I: COL.red, E: COL.green, X: COL.grey };
  const draw = () => {
    el.innerHTML = `<div class="wg">${head(L2('SMED – analýza přestavby', 'SMED – changeover analysis'), L2('Dnes se všechny činnosti dělají, když stroj stojí. Klasifikujte je a sledujte, jak se zkrátí přestavba.', 'Today every activity happens while the machine is stopped. Classify them and watch the changeover shrink.'))}
    ${rowsTable(s, [{ h: L2('Činnost', 'Activity'), f: 'n' }, { h: 'min', f: 't', n: 1, w: '80px' }, { h: L2('Nová klasifikace', 'New classification'), f: 'k', sel: K, w: '210px' }], { reset: 1 })}
    <label class="fld" style="max-width:420px;margin-top:12px"><span>${L2('Zjednodušení interních činností (rychloupínky, dorazy)', 'Streamlining internal work (quick clamps, fixed stops)')}: <b id="redv">${s.red} %</b></span><input type="range" min="0" max="60" data-f="red" data-n value="${s.red}"></label>
    <div class="out"></div></div>`;
    bind(el, s, out); bindRows(el, s, draw, () => ({ n: '', t: 1, k: 'I' }), () => { Object.assign(s, SMED_DEF()); });
    out();
  };
  const out = () => {
    $('#redv', el).textContent = s.red + ' %';
    const before = s.rows.reduce((a, r) => a + r.t, 0), intl = s.rows.filter(r => r.k === 'I').reduce((a, r) => a + r.t, 0), after = intl * (1 - s.red / 100), saving = before ? (1 - after / before) * 100 : 0;
    const w = 640, h = 150, mg = 110, pw = w - mg - 20, sc = v => before ? v / before * pw : 0;
    let g = svgOpen(w, h, 'SMED'), x = mg;
    g += `<text x="${mg - 8}" y="44" text-anchor="end" class="lbl">${L2('Před', 'Before')}</text><text x="${mg - 8}" y="104" text-anchor="end" class="lbl">${L2('Po', 'After')}</text>`;
    s.rows.forEach(r => { g += `<rect x="${x}" y="24" width="${Math.max(0, sc(r.t) - 1)}" height="32" fill="${KC[r.k]}" opacity=".85"><title>${esc(tr(r.n))}: ${r.t} min</title></rect>`; x += sc(r.t); });
    g += `<text x="${x + 4}" y="45">${fmt(before, 0)}′</text>`;
    g += `<rect x="${mg}" y="84" width="${sc(after)}" height="32" fill="${COL.red}"/><text x="${mg + sc(after) + 4}" y="105">${fmt(after, 1)}′</text></svg>`;
    $('.out', el).innerHTML = `<div class="kpis">${kpi(L2('Přestavba dnes', 'Changeover today'), fmt(before, 0) + ' min', 'bad')}${kpi(L2('Po SMED', 'After SMED'), fmt(after, 1) + ' min', 'good')}${kpi(L2('Úspora', 'Saving'), fmt(saving, 0) + ' %', 'good')}</div>${g}
      <div class="legend">${K.map(([k, t]) => `<span><i style="background:${KC[k]}"></i>${t}</span>`).join('')}</div>
      <div class="insight"><div>${L2(`Převedením externích činností a odstraněním plýtvání zkrátíte přestavbu z ${fmt(before, 0)} na ${fmt(after, 1)} min. Při 3 přestavbách denně to je ${fmt((before - after) * 3 * 250 / 60, 0)} hodin kapacity ročně.`, `By moving external work out and removing waste, the changeover drops from ${fmt(before, 0)} to ${fmt(after, 1)} min. With 3 changeovers per day that is ${fmt((before - after) * 3 * 250 / 60, 0)} hours of capacity per year.`)}</div></div>`;
  };
  draw();
};

/* ---------- OEE ---------- */
W.oee = el => {
  const s = st('oee', () => ({ plan: 450, down: 54, ict: 2, total: 10930, good: 10602 }));
  const draw = () => {
    el.innerHTML = `<div class="wg">${head(L2('Kalkulačka OEE', 'OEE calculator'), L2('OEE = Dostupnost × Výkon × Kvalita. Zadejte údaje za jednu směnu.', 'OEE = Availability × Performance × Quality. Enter data for one shift.'))}
    <div class="wgrid"><div>
      <label class="fld"><span>${L2('Plánovaný čas výroby [min]', 'Planned production time [min]')}</span>${numIn('plan', s.plan)}</label>
      <label class="fld"><span>${L2('Prostoje (poruchy, přestavby) [min]', 'Downtime (breakdowns, changeovers) [min]')}</span>${numIn('down', s.down)}</label>
      <label class="fld"><span>${L2('Ideální čas cyklu [s/ks]', 'Ideal cycle time [s/pc]')}</span>${numIn('ict', s.ict)}</label>
      <div class="row2"><label class="fld"><span>${L2('Vyrobeno celkem [ks]', 'Total count [pcs]')}</span>${numIn('total', s.total)}</label><label class="fld"><span>${L2('Dobré kusy [ks]', 'Good count [pcs]')}</span>${numIn('good', s.good)}</label></div>
    </div><div class="out"></div></div></div>`;
    bind(el, s, out); out();
  };
  const out = () => {
    const run = Math.max(0, s.plan - s.down), A = s.plan ? run / s.plan : 0, P = run ? Math.min(1.5, s.ict * s.total / (run * 60)) : 0, Q = s.total ? Math.min(1, s.good / s.total) : 0, O = A * P * Q;
    const cl = v => v >= 0.85 ? 'good' : v >= 0.6 ? 'warn' : 'bad';
    const R = 70, C = 2 * Math.PI * R;
    const donut = `<svg class="ch" viewBox="0 0 200 200" style="max-width:220px;margin:0 auto"><circle cx="100" cy="100" r="${R}" fill="none" class="s-line" stroke-width="20"/><circle cx="100" cy="100" r="${R}" fill="none" stroke="${O >= .85 ? COL.green : O >= .6 ? COL.blue : COL.red}" stroke-width="20" stroke-dasharray="${C * clamp(O, 0, 1)} ${C}" transform="rotate(-90 100 100)" stroke-linecap="round"/>
      <text x="100" y="104" text-anchor="middle" class="lbl" style="font-size:34px;font-family:var(--head)">${fmt(O * 100, 1)}%</text><text x="100" y="128" text-anchor="middle">OEE</text></svg>`;
    const bar = (l, v, c) => `<div style="margin:8px 0"><div style="display:flex;justify-content:space-between;font-size:14px;font-weight:700"><span>${l}</span><span>${fmt(v * 100, 1)} %</span></div><div style="height:12px;background:var(--line);border-radius:6px;overflow:hidden"><div style="height:12px;width:${clamp(v, 0, 1) * 100}%;background:${c}"></div></div></div>`;
    const loss = [['A', 1 - A, L2('Dostupnost (prostoje)', 'Availability (downtime)')], ['P', 1 - P, L2('Výkon (pomalý chod, mikroprostoje)', 'Performance (slow running, minor stops)')], ['Q', 1 - Q, L2('Kvalita (zmetky)', 'Quality (scrap)')]].sort((a, b) => b[1] - a[1])[0];
    const steps = [[L2('Plánovaný čas', 'Planned time'), s.plan], [L2('Provozní čas', 'Run time'), run], [L2('Čistý provozní čas', 'Net run time'), run * P], [L2('Produktivní čas', 'Fully productive'), run * P * Q]];
    $('.out', el).innerHTML = `<div style="display:grid;grid-template-columns:220px 1fr;gap:18px;align-items:center" class="oeeg">${donut}<div>${bar(L2('Dostupnost', 'Availability'), A, COL.blue)}${bar(L2('Výkon', 'Performance'), P, COL.orange)}${bar(L2('Kvalita', 'Quality'), Q, COL.green)}
      <p style="font-size:13px;color:var(--muted);margin:8px 0 0">${L2('Světová třída: A 90 % · P 95 % · Q 99,9 % → OEE 85 %', 'World class: A 90 % · P 95 % · Q 99.9 % → OEE 85 %')}</p></div></div>
      <div style="margin-top:14px">${steps.map(([l, v]) => `<div style="display:grid;grid-template-columns:150px 1fr 70px;gap:8px;align-items:center;font-size:13px;margin:4px 0"><span>${l}</span><div style="height:16px;background:var(--line);border-radius:4px"><div style="height:16px;border-radius:4px;background:${COL.navy};opacity:.8;width:${s.plan ? clamp(v / s.plan, 0, 1) * 100 : 0}%"></div></div><b style="text-align:right">${fmt(v, 0)} min</b></div>`).join('')}</div>
      <div class="insight ${cl(O)}"><div>${L2(`OEE = ${fmt(A * 100, 1)} % × ${fmt(P * 100, 1)} % × ${fmt(Q * 100, 1)} % = <b>${fmt(O * 100, 1)} %</b>. Největší ztráta: <b>${loss[2]}</b> (${fmt(loss[1] * 100, 1)} %).`, `OEE = ${fmt(A * 100, 1)} % × ${fmt(P * 100, 1)} % × ${fmt(Q * 100, 1)} % = <b>${fmt(O * 100, 1)} %</b>. Biggest loss: <b>${loss[2]}</b> (${fmt(loss[1] * 100, 1)} %).`)}${P > 1 ? '<br>' + L2('⚠ Výkon > 100 % – zkontrolujte ideální čas cyklu.', '⚠ Performance > 100 % – check the ideal cycle time.') : ''}</div></div>`;
  };
  draw();
};

/* ---------- Takt & Yamazumi ---------- */
const TAKT_DEF = () => ({ shift: 480, brk: 30, shifts: 2, demand: 1800, rows: [
  { n: { cs: 'Odběr z linky', en: 'Take-off' }, t: 18 }, { n: { cs: 'Stohování', en: 'Stacking' }, t: 27 }, { n: { cs: 'Páskování', en: 'Strapping' }, t: 24 },
  { n: { cs: 'Fóliování', en: 'Wrapping' }, t: 29 }, { n: { cs: 'Paletizace', en: 'Palletising' }, t: 34 }, { n: { cs: 'Etiketace', en: 'Labelling' }, t: 15 }] });
W.takt = el => {
  const s = st('takt', TAKT_DEF);
  const draw = () => {
    el.innerHTML = `<div class="wg">${head(L2('Takt time a Yamazumi graf', 'Takt time & Yamazumi chart'), L2('Takt = čistý dostupný čas / poptávka. Porovnejte s časy cyklu pracovišť balicí linky.', 'Takt = net available time / demand. Compare with the station cycle times of the packing line.'))}
    <div class="wgrid"><div>
      <div class="row2"><label class="fld"><span>${L2('Délka směny [min]', 'Shift length [min]')}</span>${numIn('shift', s.shift)}</label><label class="fld"><span>${L2('Přestávky [min]', 'Breaks [min]')}</span>${numIn('brk', s.brk)}</label></div>
      <div class="row2"><label class="fld"><span>${L2('Počet směn', 'Shifts')}</span>${numIn('shifts', s.shifts)}</label><label class="fld"><span>${L2('Poptávka [ks/den]', 'Demand [pcs/day]')}</span>${numIn('demand', s.demand)}</label></div>
      ${rowsTable(s, [{ h: L2('Pracoviště', 'Station'), f: 'n' }, { h: 'C/T [s]', f: 't', n: 1, w: '80px' }], { reset: 1 })}
    </div><div class="out"></div></div></div>`;
    bind(el, s, out); bindRows(el, s, draw, () => ({ n: '', t: 20 }), () => { Object.assign(s, TAKT_DEF()); });
    out();
  };
  const out = () => {
    const avail = Math.max(0, s.shift - s.brk) * s.shifts * 60, takt = s.demand > 0 ? avail / s.demand : 0, R = s.rows, o = $('.out', el);
    if (!R.length || !takt) { o.innerHTML = `<div class="empty">–</div>`; return; }
    const sum = R.reduce((a, r) => a + r.t, 0), mx = Math.max(...R.map(r => r.t)), bi = R.findIndex(r => r.t === mx), ops = Math.ceil(sum / takt - 1e-9), eff = sum / (R.length * mx) * 100;
    const w = 640, h = 300, mg = { l: 40, r: 70, t: 14, b: 40 }, pw = w - mg.l - mg.r, ph = h - mg.t - mg.b, tk = ticks(0, Math.max(mx, takt) * 1.1, 5), ymax = tk.t[tk.t.length - 1], bw = pw / R.length;
    const sy = v => mg.t + ph * (1 - v / ymax);
    let g = svgOpen(w, h, 'Yamazumi') + gridY(tk, sy, mg.l, w - mg.r);
    R.forEach((r, i) => { const c = r.t > takt ? COL.red : r.t > takt * 0.95 ? COL.orange : COL.blue; g += `<rect x="${mg.l + i * bw + bw * 0.15}" y="${sy(r.t)}" width="${bw * 0.7}" height="${ph * r.t / ymax}" rx="3" fill="${c}"/><text x="${mg.l + i * bw + bw / 2}" y="${sy(r.t) - 5}" text-anchor="middle" class="lbl">${fmt(r.t, 0)}</text><text x="${mg.l + i * bw + bw / 2}" y="${h - mg.b + 16}" text-anchor="middle">${esc(trunc(tr(r.n), 12))}</text>`; });
    g += `<line x1="${mg.l}" x2="${w - mg.r}" y1="${sy(takt)}" y2="${sy(takt)}" stroke="${COL.red}" stroke-width="2.5" stroke-dasharray="8 4"/><text x="${w - mg.r + 4}" y="${sy(takt) + 4}" style="fill:${COL.red};font-weight:700">Takt ${fmt(takt, 1)} s</text>`;
    g += `<line class="axis" x1="${mg.l}" x2="${w - mg.r}" y1="${h - mg.b}" y2="${h - mg.b}"/></svg>`;
    o.innerHTML = `<div class="kpis">${kpi('Takt time', fmt(takt, 1) + ' s', 'good')}${kpi(L2('Úzké místo', 'Bottleneck'), `<span style="font-size:17px">${esc(tr(R[bi].n))}</span>`, mx > takt ? 'bad' : 'warn')}${kpi(L2('Min. operátorů', 'Min. operators'), ops)}${kpi(L2('Vyváženost', 'Balance eff.'), fmt(eff, 0) + ' %', eff > 85 ? 'good' : 'warn')}</div>${g}
      <div class="insight ${mx > takt ? 'bad' : 'good'}"><div>${mx > takt ? L2(`Pracoviště <b>${esc(tr(R[bi].n))}</b> (${fmt(mx, 0)} s) je pomalejší než takt ${fmt(takt, 1)} s – linka nestihne poptávku. Přesuňte část práce na pracoviště s rezervou nebo odstraňte plýtvání.`, `Station <b>${esc(tr(R[bi].n))}</b> (${fmt(mx, 0)} s) is slower than takt ${fmt(takt, 1)} s – the line cannot meet demand. Move work to stations with slack or remove waste.`) : L2('Všechna pracoviště jsou pod taktem – linka stíhá poptávku.', 'All stations are below takt – the line meets demand.')}</div></div>`;
  };
  draw();
};

/* ---------- Sigma / DPMO ---------- */
W.sigma = el => {
  const s = st('sigma', () => ({ units: 50000, opp: 5, def: 420 }));
  const draw = () => {
    el.innerHTML = `<div class="wg">${head(L2('Kalkulačka sigma úrovně', 'Sigma level calculator'), L2('Dlouhodobá data s konvenčním posunem 1,5σ.', 'Long-term data with the conventional 1.5σ shift.'))}
    <div class="wgrid"><div>
      <label class="fld"><span>${L2('Počet jednotek', 'Units')}</span>${numIn('units', s.units)}</label>
      <label class="fld"><span>${L2('Příležitostí k vadě na jednotku', 'Opportunities per unit')}</span>${numIn('opp', s.opp)}</label>
      <label class="fld"><span>${L2('Počet vad', 'Defects')}</span>${numIn('def', s.def)}</label>
      <table class="ed" style="margin-top:10px"><thead><tr><th>σ</th><th>DPMO</th><th>${L2('Výtěžnost', 'Yield')}</th></tr></thead><tbody>${[[2, 308538, '69,1'], [3, 66807, '93,3'], [4, 6210, '99,38'], [5, 233, '99,977'], [6, 3.4, '99,99966']].map(r => `<tr><td><b>${r[0]}σ</b></td><td>${fmt(r[1], r[1] < 10 ? 1 : 0)}</td><td>${S.lang === 'cs' ? r[2] : r[2].replace(',', '.')} %</td></tr>`).join('')}</tbody></table>
    </div><div class="out"></div></div></div>`;
    bind(el, s, out); out();
  };
  const out = () => {
    const opps = s.units * s.opp, dpo = opps ? s.def / opps : 0, dpmo = dpo * 1e6, y = 1 - dpo, sig = dpo > 0 ? ninv(1 - dpo) + 1.5 : 6.5, dpu = s.units ? s.def / s.units : 0;
    const w = 640, h = 110, x0 = 30, x1 = 610, sx = v => x0 + (clamp(v, 0, 6.5)) / 6.5 * (x1 - x0);
    let g = svgOpen(w, h, 'Sigma scale');
    g += `<defs><linearGradient id="sgg"><stop offset="0" stop-color="${COL.red}"/><stop offset=".5" stop-color="${COL.yellow}"/><stop offset="1" stop-color="${COL.green}"/></linearGradient></defs><rect x="${x0}" y="40" width="${x1 - x0}" height="18" rx="9" fill="url(#sgg)"/>`;
    [0, 1, 2, 3, 4, 5, 6].forEach(v => g += `<text x="${sx(v)}" y="78" text-anchor="middle" class="lbl">${v}σ</text>`);
    g += `<path d="M${sx(sig)} 36 l-9 -14 h18 z" fill="${COL.navy}" class="f-ink"/><text x="${sx(sig)}" y="16" text-anchor="middle" class="lbl" style="font-size:14px">${fmt(sig, 2)}σ</text></svg>`;
    $('.out', el).innerHTML = `<div class="kpis">${kpi('DPU', fmt(dpu, 4))}${kpi('DPO', fmt(dpo, 6))}${kpi('DPMO', fmt(dpmo, 0), sig >= 4 ? 'good' : sig >= 3 ? 'warn' : 'bad')}${kpi(L2('Výtěžnost', 'Yield'), fmt(y * 100, 3) + ' %')}${kpi(L2('Sigma úroveň', 'Sigma level'), fmt(sig, 2) + 'σ', sig >= 4 ? 'good' : sig >= 3 ? 'warn' : 'bad')}</div>${g}
    <div class="insight"><div>${L2(`Při ${fmt(dpmo, 0)} DPMO je proces na úrovni <b>${fmt(sig, 2)}σ</b>. Pro dosažení 6σ by bylo nutné snížit vady ${dpmo > 3.4 ? fmt(dpmo / 3.4, 0) + '×' : '— cíl je splněn'}.`, `At ${fmt(dpmo, 0)} DPMO the process runs at <b>${fmt(sig, 2)}σ</b>. Reaching 6σ would need ${dpmo > 3.4 ? fmt(dpmo / 3.4, 0) + '× fewer defects' : '— target already met'}.`)}</div></div>`;
  };
  draw();
};

/* ---------- FMEA ---------- */
const FMEA_DEF = () => ({ rows: [
  { m: { cs: 'Otřepená hrana při řezu', en: 'Ragged edge when cutting' }, e: { cs: 'Reklamace, obtížná montáž', en: 'Complaint, hard installation' }, s: 6, o: 5, d: 4 },
  { m: { cs: 'Nedostatečně vysušená deska', en: 'Under-dried board' }, e: { cs: 'Plíseň, deformace u zákazníka', en: 'Mould, deformation at customer' }, s: 8, o: 3, d: 6 },
  { m: { cs: 'Chybná etiketa na paletě', en: 'Wrong pallet label' }, e: { cs: 'Záměna produktu', en: 'Product mix-up' }, s: 7, o: 2, d: 3 },
  { m: { cs: 'Prasklý roh při stohování', en: 'Cracked corner when stacking' }, e: { cs: 'Zmetek, reklamace', en: 'Scrap, complaint' }, s: 5, o: 6, d: 5 },
  { m: { cs: 'Nesprávná protipožární příměs', en: 'Wrong fire-retardant additive' }, e: { cs: 'Nesplnění požární odolnosti', en: 'Fire rating not met' }, s: 10, o: 2, d: 7 }] });
W.fmea = el => {
  const s = st('fmea', FMEA_DEF);
  const opts = Array.from({ length: 10 }, (_, i) => [i + 1, i + 1]);
  const draw = () => {
    el.innerHTML = `<div class="wg">${head(L2('Procesní FMEA', 'Process FMEA'), L2('S = závažnost, O = výskyt, D = odhalitelnost (1 = nejlepší, 10 = nejhorší). RPN = S × O × D.', 'S = severity, O = occurrence, D = detection (1 = best, 10 = worst). RPN = S × O × D.'))}
    ${rowsTable(s, [{ h: L2('Způsob selhání', 'Failure mode'), f: 'm' }, { h: L2('Následek', 'Effect'), f: 'e' }, { h: 'S', f: 's', sel: opts, n: 1, w: '64px' }, { h: 'O', f: 'o', sel: opts, n: 1, w: '64px' }, { h: 'D', f: 'd', sel: opts, n: 1, w: '64px' }, { h: 'RPN', calc: (r, i) => `<span id="rpn${i}"></span>`, w: '70px' }], { reset: 1 })}
    <div class="out" style="margin-top:16px"></div></div>`;
    bind(el, s, out); bindRows(el, s, draw, () => ({ m: '', e: '', s: 5, o: 5, d: 5 }), () => { s.rows = FMEA_DEF().rows; });
    out();
  };
  const out = () => {
    const col = (r, sv) => sv >= 9 || r >= 200 ? COL.red : r >= 100 ? COL.orange : COL.green;
    s.rows.forEach((r, i) => { const v = r.s * r.o * r.d, e = $('#rpn' + i, el); if (e) e.innerHTML = `<span class="pill" style="background:${col(v, r.s)}">${v}</span>`; });
    const R = s.rows.map(r => ({ n: tr(r.m) || '?', v: r.s * r.o * r.d, s: r.s })).sort((a, b) => b.v - a.v);
    if (!R.length) { $('.out', el).innerHTML = ''; return; }
    const w = 640, bh = 30, h = R.length * bh + 30, mg = 210, pw = w - mg - 50, mx = Math.max(...R.map(r => r.v), 1);
    let g = svgOpen(w, h, 'RPN');
    R.forEach((r, i) => { const y = 10 + i * bh; g += `<text x="${mg - 8}" y="${y + 18}" text-anchor="end" class="lbl">${esc(trunc(r.n, 30))}</text><rect x="${mg}" y="${y + 4}" width="${r.v / mx * pw}" height="${bh - 10}" rx="3" fill="${col(r.v, r.s)}"/><text x="${mg + r.v / mx * pw + 6}" y="${y + 18}" class="lbl">${r.v}${r.s >= 9 ? ' ⚠' : ''}</text>`; });
    const crit = R.filter(r => r.s >= 9);
    $('.out', el).innerHTML = g + '</svg>' + `<div class="insight ${crit.length ? 'bad' : ''}"><div>${L2(`Nejvyšší RPN: <b>${esc(R[0].n)}</b> (${R[0].v}).`, `Highest RPN: <b>${esc(R[0].n)}</b> (${R[0].v}).`)} ${crit.length ? L2(`Pozor: ${crit.map(c => '„' + esc(c.n) + '“').join(', ')} má závažnost ≥ 9 – řešte vždy, bez ohledu na RPN.`, `Note: ${crit.map(c => '“' + esc(c.n) + '”').join(', ')} has severity ≥ 9 – always act, regardless of RPN.`) : ''}</div></div>`;
  };
  draw();
};

/* ---------- Hypothesis test ---------- */
const HY_DEF = () => { const r = rng(21); return { a: Array.from({ length: 12 }, () => (520 + 18 * gauss(r)).toFixed(0)).join(' '), b: Array.from({ length: 12 }, () => (545 + 20 * gauss(r)).toFixed(0)).join(' '), alpha: 0.05 }; };
W.hypo = el => {
  const s = st('hypo', HY_DEF);
  const draw = () => {
    el.innerHTML = `<div class="wg">${head(L2('Dvouvýběrový t-test (Welch)', 'Two-sample t-test (Welch)'), L2('H₀: průměry jsou stejné. Příklad: pevnost v ohybu [N] desek se sádrovcem od dodavatele A a B.', 'H₀: the means are equal. Example: flexural strength [N] of boards with gypsum from supplier A and B.'))}
    <div class="wgrid"><div>
      <label class="fld"><span>${L2('Vzorek A', 'Sample A')}</span><textarea data-f="a" style="min-height:90px">${esc(s.a)}</textarea></label>
      <label class="fld"><span>${L2('Vzorek B', 'Sample B')}</span><textarea data-f="b" style="min-height:90px">${esc(s.b)}</textarea></label>
      <label class="fld"><span>${L2('Hladina významnosti α', 'Significance level α')}</span><select data-f="alpha" data-n>${[0.01, 0.05, 0.1].map(v => `<option value="${v}" ${s.alpha == v ? 'selected' : ''}>${fmt(v, 2)}</option>`).join('')}</select></label>
      <div class="btns"><button class="btn sm ghost" data-reset>${u('reset')}</button><button class="btn sm ghost" data-same>${L2('Stejné procesy', 'Same processes')}</button></div>
    </div><div class="out"></div></div></div>`;
    bind(el, s, out);
    $('[data-reset]', el).onclick = () => { WS.hypo = HY_DEF(); W.hypo(el); };
    $('[data-same]', el).onclick = () => { const r = rng(Date.now()); s.a = Array.from({ length: 12 }, () => (530 + 18 * gauss(r)).toFixed(0)).join(' '); s.b = Array.from({ length: 12 }, () => (530 + 18 * gauss(r)).toFixed(0)).join(' '); draw(); };
    out();
  };
  const out = () => {
    const A = nums(s.a), B = nums(s.b), o = $('.out', el);
    if (A.length < 2 || B.length < 2) { o.innerHTML = `<div class="empty">${L2('Každý vzorek potřebuje alespoň 2 hodnoty.', 'Each sample needs at least 2 values.')}</div>`; return; }
    const ma = mean(A), mb = mean(B), sa = sdev(A), sb = sdev(B), va = sa * sa / A.length, vb = sb * sb / B.length;
    const t = (ma - mb) / Math.sqrt(va + vb), df = (va + vb) ** 2 / (va * va / (A.length - 1) + vb * vb / (B.length - 1)), p = tTwoSided(Math.abs(t), df), sig = p < s.alpha;
    const all = A.concat(B), tk = ticks(Math.min(...all), Math.max(...all), 6), lo = tk.t[0], hi = tk.t[tk.t.length - 1];
    const w = 640, h = 170, mg = { l: 40, r: 20 }, sx = v => mg.l + (v - lo) / (hi - lo) * (w - mg.l - mg.r);
    let g = svgOpen(w, h, 'Dot plot');
    tk.t.forEach(v => g += `<line x1="${sx(v)}" x2="${sx(v)}" y1="10" y2="${h - 30}" class="s-line"/><text x="${sx(v)}" y="${h - 12}" text-anchor="middle">${fmt(v, tk.d)}</text>`);
    [[A, ma, sa, 45, COL.blue, 'A'], [B, mb, sb, 100, COL.orange, 'B']].forEach(([X, m, sd, y, c, l]) => {
      g += `<text x="10" y="${y + 5}" class="lbl">${l}</text><line x1="${sx(m - sd)}" x2="${sx(m + sd)}" y1="${y}" y2="${y}" stroke="${c}" stroke-width="3" opacity=".45"/>`;
      X.forEach((v, i) => g += `<circle cx="${sx(v)}" cy="${y + ((i % 3) - 1) * 7}" r="4.5" fill="${c}" fill-opacity=".7"/>`);
      g += `<line x1="${sx(m)}" x2="${sx(m)}" y1="${y - 18}" y2="${y + 18}" stroke="${c}" stroke-width="3"/>`;
    });
    g += '</svg>';
    o.innerHTML = `<div class="kpis">${kpi('x̄ A', fmt(ma, 1))}${kpi('x̄ B', fmt(mb, 1))}${kpi('s A / s B', fmt(sa, 1) + ' / ' + fmt(sb, 1))}${kpi('t', fmt(t, 2))}${kpi('df', fmt(df, 1))}${kpi(L2('p-hodnota', 'p-value'), p < 0.0001 ? '< 0,0001'.replace(',', S.lang === 'cs' ? ',' : '.') : fmt(p, 4), sig ? 'good' : 'warn')}</div>${g}
    <div class="legend"><span>${L2('Svislá čára = průměr, pruh = ±1 směrodatná odchylka', 'Vertical line = mean, band = ±1 standard deviation')}</span></div>
    <div class="insight ${sig ? 'good' : ''}"><div>${sig ? L2(`p = ${fmt(p, 4)} < α = ${fmt(s.alpha, 2)} → <b>zamítáme H₀</b>. Rozdíl průměrů ${fmt(Math.abs(ma - mb), 1)} je statisticky významný. Zvažte i praktickou významnost.`, `p = ${fmt(p, 4)} < α = ${fmt(s.alpha, 2)} → <b>reject H₀</b>. The mean difference of ${fmt(Math.abs(ma - mb), 1)} is statistically significant. Consider practical significance too.`) : L2(`p = ${fmt(p, 4)} ≥ α = ${fmt(s.alpha, 2)} → <b>nelze zamítnout H₀</b>. Data neprokazují rozdíl (to ale neznamená, že rozdíl neexistuje – možná je málo dat).`, `p = ${fmt(p, 4)} ≥ α = ${fmt(s.alpha, 2)} → <b>fail to reject H₀</b>. The data show no significant difference (that does not prove equality – maybe too little data).`)}</div></div>`;
  };
  draw();
};

/* ---------- MSA ---------- */
W.msa = el => {
  const s = st('msa', () => ({ ev: 0.018, av: 0.010, pv: 0.11, tol: 1 }));
  const draw = () => {
    el.innerHTML = `<div class="wg">${head(L2('Vyhodnocení Gage R&R', 'Gage R&R evaluation'), L2('Zadejte směrodatné odchylky složek variability (např. z ANOVA nebo metody průměrů a rozpětí).', 'Enter standard deviations of the variance components (e.g. from ANOVA or the average & range method).'))}
    <div class="wgrid"><div>
      <label class="fld"><span>${L2('Opakovatelnost EV (σ měřidla)', 'Repeatability EV (σ equipment)')}</span>${numIn('ev', s.ev)}</label>
      <label class="fld"><span>${L2('Reprodukovatelnost AV (σ operátorů)', 'Reproducibility AV (σ appraisers)')}</span>${numIn('av', s.av)}</label>
      <label class="fld"><span>${L2('Variabilita dílů PV (σ)', 'Part variation PV (σ)')}</span>${numIn('pv', s.pv)}</label>
      <label class="fld"><span>${L2('Šířka tolerance (USL − LSL)', 'Tolerance width (USL − LSL)')}</span>${numIn('tol', s.tol)}</label>
    </div><div class="out"></div></div></div>`;
    bind(el, s, out); out();
  };
  const out = () => {
    const grr = Math.hypot(s.ev, s.av), tv = Math.hypot(grr, s.pv), pg = tv ? grr / tv * 100 : 0, pt = s.tol ? 6 * grr / s.tol * 100 : 0, ndc = grr ? Math.floor(1.41 * s.pv / grr) : 0;
    const cl = v => v < 10 ? 'good' : v <= 30 ? 'warn' : 'bad';
    const comp = [[L2('Opakovatelnost', 'Repeatability'), s.ev ** 2, COL.red], [L2('Reprodukovatelnost', 'Reproducibility'), s.av ** 2, COL.orange], [L2('Díly', 'Parts'), s.pv ** 2, COL.blue]], tot = comp.reduce((a, c) => a + c[1], 0) || 1;
    const verdict = pg < 10 ? L2('Měřicí systém je <b>přijatelný</b>.', 'The measurement system is <b>acceptable</b>.') : pg <= 30 ? L2('Měřicí systém je <b>podmíněně přijatelný</b> – záleží na důležitosti a ceně měření.', 'The measurement system is <b>conditionally acceptable</b> – depends on importance and cost.') : L2('Měřicí systém je <b>nepřijatelný</b> – nejdříve zlepšete měření, pak sbírejte data.', 'The measurement system is <b>unacceptable</b> – fix the measurement first, then collect data.');
    const main = s.ev > s.av ? L2('Převažuje opakovatelnost → problém je v měřidle (upnutí, rozlišení, údržba).', 'Repeatability dominates → the gauge is the issue (fixture, resolution, maintenance).') : L2('Převažuje reprodukovatelnost → problém je v operátorech (metoda, školení, standard).', 'Reproducibility dominates → the appraisers are the issue (method, training, standard).');
    $('.out', el).innerHTML = `<div class="kpis">${kpi('σ GRR', fmt(grr, 4))}${kpi('%GRR (' + L2('k TV', 'of TV') + ')', fmt(pg, 1) + ' %', cl(pg))}${kpi('%' + L2('Tolerance', 'Tolerance'), fmt(pt, 1) + ' %', cl(pt))}${kpi('ndc', ndc, ndc >= 5 ? 'good' : 'bad')}</div>
      <p style="font-size:13px;font-weight:700;color:var(--muted);margin:0 0 6px">${L2('Příspěvek k rozptylu (% contribution)', 'Variance contribution (% contribution)')}</p>
      <div style="display:flex;height:34px;border-radius:8px;overflow:hidden">${comp.map(c => `<div title="${c[0]}" style="width:${c[1] / tot * 100}%;background:${c[2]};color:#fff;font-size:12px;font-weight:700;display:flex;align-items:center;justify-content:center;overflow:hidden;white-space:nowrap">${c[1] / tot > 0.08 ? fmt(c[1] / tot * 100, 0) + '%' : ''}</div>`).join('')}</div>
      <div class="legend">${comp.map(c => `<span><i style="background:${c[2]}"></i>${c[0]}</span>`).join('')}</div>
      <div class="insight ${cl(pg) === 'bad' ? 'bad' : cl(pg) === 'good' ? 'good' : ''}"><div>${verdict} ${main}<br><small style="color:var(--muted)">${L2('Kritéria AIAG: %GRR < 10 % OK, 10–30 % podmíněně, > 30 % nevyhovuje; ndc ≥ 5.', 'AIAG criteria: %GRR < 10 % OK, 10–30 % conditional, > 30 % unacceptable; ndc ≥ 5.')}</small></div></div>`;
  };
  draw();
};

/* ---------- SIPOC ---------- */
const SIPOC_DEF = () => ({ v: {
  cs: ['Lom (sádrovec)\nPapírna\nDodavatel aditiv\nEnergetika', 'Sádrovec\nKarton\nVoda\nAditiva, škrob\nZemní plyn', 'Mletí a kalcinace\nMíchání sádrové kaše\nFormování pásu\nTuhnutí a řezání\nSušení\nBalení a expedice', 'Sádrokartonové desky\nPalety s etiketou\nProtokol kvality\nDodací list', 'Stavebniny\nMontážní firmy\nVelkoobchody\nKoncový zákazník'],
  en: ['Quarry (gypsum)\nPaper mill\nAdditive supplier\nUtility', 'Gypsum\nPaper\nWater\nAdditives, starch\nNatural gas', 'Grinding & calcining\nMixing slurry\nForming the board\nSetting & cutting\nDrying\nPacking & shipping', 'Plasterboards\nLabelled pallets\nQuality report\nDelivery note', 'Builders’ merchants\nDrylining contractors\nWholesalers\nEnd customer'] } });
W.sipoc = el => {
  const s = st('sipoc', SIPOC_DEF);
  const cols = [['S', 'Suppliers', L2('Dodavatelé', 'Suppliers')], ['I', 'Inputs', L2('Vstupy', 'Inputs')], ['P', 'Process', L2('Proces', 'Process')], ['O', 'Outputs', L2('Výstupy', 'Outputs')], ['C', 'Customers', L2('Zákazníci', 'Customers')]];
  const vals = () => Array.isArray(s.v) ? s.v : s.v[S.lang];
  const draw = () => {
    el.innerHTML = `<div class="wg">${head('SIPOC', L2('Upravte sloupce – jeden prvek na řádek. Proces má mít 4–7 kroků.', 'Edit the columns – one item per line. The process should have 4–7 steps.'))}
    <div class="sipoc">${cols.map((c, i) => `<div class="col ${c[0] === 'P' ? 'p' : ''}"><h4><b>${c[0]}</b>${c[2]}</h4><textarea data-si="${i}">${esc(vals()[i])}</textarea></div>`).join('')}</div>
    <div class="btns"><button class="btn sm ghost" data-copy>${u('copy')}</button><button class="btn sm ghost" data-reset>${u('reset')}</button><button class="btn sm ghost" data-clear>${u('clear')}</button></div></div>`;
    $$('[data-si]', el).forEach(t => t.oninput = () => { if (!Array.isArray(s.v)) s.v = vals().slice(); s.v[+t.dataset.si] = t.value; });
    $('[data-reset]', el).onclick = () => { WS.sipoc = SIPOC_DEF(); W.sipoc(el); };
    $('[data-clear]', el).onclick = () => { s.v = ['', '', '', '', '']; draw(); };
    $('[data-copy]', el).onclick = e => { const txt = cols.map((c, i) => `${c[0]} – ${c[2]}:\n` + vals()[i].split('\n').map(x => ' • ' + x).join('\n')).join('\n\n'); copyText(txt, e.target); };
  };
  draw();
};
function copyText(txt, btn) {
  const done = () => { const o = btn.textContent; btn.textContent = u('copied'); setTimeout(() => btn.textContent = o, 1500); };
  try { navigator.clipboard.writeText(txt).then(done, () => { fallbackCopy(txt); done(); }); } catch (e) { fallbackCopy(txt); done(); }
}
function fallbackCopy(txt) { const t = document.createElement('textarea'); t.value = txt; document.body.appendChild(t); t.select(); try { document.execCommand('copy'); } catch (e) {} t.remove(); }

/* ---------- 5 Why ---------- */
const WHY_DEF = () => ({ p: { cs: 'Linka 2 stála 3 hodiny kvůli poruše hlavního pohonu', en: 'Line 2 stopped for 3 hours due to main drive failure' },
  w: { cs: ['Motor se přehřál a vypnula ho ochrana', 'Ložisko motoru bylo suché a zadřené', 'Ložisko nebylo namazáno 9 měsíců', 'Mazání tohoto ložiska není v plánu údržby', 'Plán údržby nebyl aktualizován po výměně motoru za nový typ'],
       en: ['The motor overheated and protection tripped', 'The motor bearing was dry and seized', 'The bearing had not been lubricated for 9 months', 'Lubricating this bearing is not in the maintenance plan', 'The maintenance plan was not updated after the motor was replaced with a new type'] },
  a: { cs: 'Zavést povinnou revizi plánu údržby při každé výměně zařízení (MOC checklist); doplnit mazací body do TPM standardu.', en: 'Make maintenance-plan review mandatory for every equipment change (MOC checklist); add lubrication points to the TPM standard.' } });
W.fivewhy = el => {
  const s = st('fivewhy', WHY_DEF);
  const fix = () => { ['p', 'a'].forEach(k => { if (typeof s[k] === 'object') s[k] = tr(s[k]); }); if (!Array.isArray(s.w)) s.w = tr(s.w).slice(); };
  const draw = () => {
    const p = tr(s.p), wl = Array.isArray(s.w) ? s.w : tr(s.w), a = tr(s.a);
    const last = wl.reduce((k, x, i) => String(x).trim() ? i : k, -1);
    el.innerHTML = `<div class="wg">${head(L2('5x Proč', '5 Whys'), L2('Začněte konkrétním popisem problému a ptejte se „Proč?“. Poslední odpověď je kořenová příčina.', 'Start with a specific problem statement and keep asking “Why?”. The last answer is the root cause.'))}
    <label class="fld"><span>${L2('Problém', 'Problem')}</span><input data-wp value="${esc(p)}" style="font-weight:700"></label>
    <div class="why">${wl.map((x, i) => `<div class="arr"></div><div class="wi"><label>${i + 1}. ${L2('Proč?', 'Why?')}</label><div style="display:flex;gap:6px"><input class="in ${i === last ? 'root' : ''}" data-w="${i}" value="${esc(x)}"><button class="x" data-wd="${i}">×</button></div></div>`).join('')}</div>
    <div class="btns">${wl.length < 8 ? `<button class="btn sm ghost" data-wa>+ ${L2('Další Proč', 'Another why')}</button>` : ''}<button class="btn sm ghost" data-reset>${u('reset')}</button><button class="btn sm ghost" data-copy>${u('copy')}</button></div>
    <label class="fld" style="margin-top:14px"><span>${L2('Opatření proti kořenové příčině', 'Countermeasure for the root cause')}</span><textarea data-wa2 style="font-family:inherit;min-height:70px">${esc(a)}</textarea></label>
    <div class="insight" id="whyck"></div></div>`;
    const check = () => {
      const W2 = (Array.isArray(s.w) ? s.w : tr(s.w)).filter(x => String(x).trim());
      $('#whyck', el).innerHTML = W2.length ? `<div><b>${L2('Kontrola zpětně („…a proto…“)', 'Reverse check (“…therefore…”)')}:</b><br>${W2.slice().reverse().map(esc).join(` <b style="color:var(--blue)">→ ${L2('a proto', 'therefore')} →</b> `)} <b style="color:var(--blue)">→</b> ${esc(tr(s.p))}</div>` : '';
    };
    $('[data-wp]', el).oninput = e => { fix(); s.p = e.target.value; check(); };
    $$('[data-w]', el).forEach(i => i.oninput = () => { fix(); s.w[+i.dataset.w] = i.value; check(); const l = s.w.reduce((k, x, j) => String(x).trim() ? j : k, -1); $$('[data-w]', el).forEach((x, j) => x.classList.toggle('root', j === l)); });
    $$('[data-wd]', el).forEach(b => b.onclick = () => { fix(); s.w.splice(+b.dataset.wd, 1); draw(); });
    const wa = $('[data-wa]', el); if (wa) wa.onclick = () => { fix(); s.w.push(''); draw(); $$('[data-w]', el).pop().focus(); };
    $('[data-wa2]', el).oninput = e => { fix(); s.a = e.target.value; };
    $('[data-reset]', el).onclick = () => { WS.fivewhy = WHY_DEF(); W.fivewhy(el); };
    $('[data-copy]', el).onclick = e => { const W2 = Array.isArray(s.w) ? s.w : tr(s.w); copyText(`${L2('Problém', 'Problem')}: ${tr(s.p)}\n` + W2.map((x, i) => `${i + 1}. ${L2('Proč', 'Why')}: ${x}`).join('\n') + `\n${L2('Opatření', 'Countermeasure')}: ${tr(s.a)}`, e.target); };
    check();
  };
  draw();
};

/* ---------- Heijunka ---------- */
const HJ_DEF = () => ({ rows: [{ n: 'A', d: { cs: 'Standardní deska', en: 'Standard board' }, q: 6 }, { n: 'F', d: { cs: 'Protipožární', en: 'Fire-rated' }, q: 3 }, { n: 'H', d: { cs: 'Impregnovaná', en: 'Moisture-resistant' }, q: 2 }, { n: 'S', d: { cs: 'Akustická', en: 'Acoustic' }, q: 1 }] });
W.heijunka = el => {
  const s = st('heijunka', HJ_DEF);
  const draw = () => {
    el.innerHTML = `<div class="wg">${head(L2('Generátor vyrovnané sekvence', 'Levelled sequence generator'), L2('Zadejte poptávku po produktech v dávkách za den. Porovnejte dávkovou výrobu s heijunkou.', 'Enter product demand in batches per day. Compare batch production with heijunka.'))}
    ${rowsTable(s, [{ h: L2('Kód', 'Code'), f: 'n', w: '70px' }, { h: L2('Produkt', 'Product'), f: 'd' }, { h: L2('Dávek/den', 'Batches/day'), f: 'q', n: 1, w: '110px' }], { reset: 1 })}
    <div class="out" style="margin-top:12px"></div></div>`;
    bind(el, s, out); bindRows(el, s, draw, () => ({ n: String.fromCharCode(65 + s.rows.length), d: '', q: 1 }), () => { s.rows = HJ_DEF().rows; });
    out();
  };
  const out = () => {
    const R = s.rows.map((r, i) => ({ n: (tr(r.n) || '?').slice(0, 2), q: Math.max(0, Math.round(r.q)), c: PAL[i % PAL.length] })).filter(r => r.q > 0);
    const T = R.reduce((a, r) => a + r.q, 0);
    if (!T || T > 120) { $('.out', el).innerHTML = `<div class="empty">${L2('Zadejte 1–120 dávek.', 'Enter 1–120 batches.')}</div>`; return; }
    const batch = R.flatMap(r => Array(r.q).fill(r)), done = R.map(() => 0), lev = [];
    for (let k = 1; k <= T; k++) { let bi = -1, bv = -Infinity; R.forEach((r, i) => { const v = k * r.q / T - done[i]; if (v > bv + 1e-9) { bv = v; bi = i; } }); done[bi]++; lev.push(R[bi]); }
    const seq = a => `<div class="seq">${a.map(r => `<i style="background:${r.c}">${esc(r.n)}</i>`).join('')}</div>`;
    const changes = a => a.reduce((c, r, i) => c + (i && a[i - 1] !== r ? 1 : 0), 0);
    $('.out', el).innerHTML = `<div class="seqlbl">${L2('Dávková výroba', 'Batch production')} – ${changes(batch)} ${L2('přestaveb', 'changeovers')}</div>${seq(batch)}
      <div class="seqlbl">Heijunka – ${changes(lev)} ${L2('přestaveb', 'changeovers')}</div>${seq(lev)}
      <div class="insight"><div>${L2('Vyrovnaná sekvence umožní dodat každý produkt každý den a snížit zásoby hotových výrobků – ale vyžaduje více přestaveb. Proto je SMED předpokladem heijunky.', 'The levelled sequence lets you deliver every product every day and cut finished-goods stock – but it needs more changeovers. That is why SMED is a prerequisite for heijunka.')}</div></div>`;
  };
  draw();
};

/* ---------- PDCA wheel ---------- */
W.pdca = el => {
  const s = st('pdca', () => ({ k: 0 }));
  const P = [
    ['P', 'Plan', COL.blue, { cs: 'Plánuj', en: 'Plan' }, { cs: ['Jaký je problém a cíl?', 'Jaká je kořenová příčina?', 'Jaké opatření vyzkoušíme a jak změříme úspěch?'], en: ['What is the problem and target?', 'What is the root cause?', 'Which countermeasure will we test and how will we measure success?'] }],
    ['D', 'Do', COL.orange, { cs: 'Dělej', en: 'Do' }, { cs: ['Realizuj opatření v malém měřítku (pilot)', 'Zaznamenávej data a pozorování', 'Dokumentuj odchylky od plánu'], en: ['Implement on a small scale (pilot)', 'Record data and observations', 'Document deviations from the plan'] }],
    ['C', 'Check', COL.green, { cs: 'Kontroluj', en: 'Check' }, { cs: ['Splnili jsme cíl?', 'Porovnej data před a po', 'Co jsme se naučili? Objevily se vedlejší účinky?'], en: ['Did we hit the target?', 'Compare before and after data', 'What did we learn? Any side effects?'] }],
    ['A', 'Act', COL.purple, { cs: 'Jednej', en: 'Act' }, { cs: ['Úspěch → standardizuj a rozšiř (yokoten)', 'Neúspěch → nový cyklus s novou hypotézou', 'Sdílej poznatky'], en: ['Success → standardise and spread (yokoten)', 'Failure → new cycle with a new hypothesis', 'Share the learning'] }]];
  const draw = () => {
    const cx = 160, cy = 160, R = 140, r0 = 50;
    const arc = i => { const a0 = -Math.PI / 2 + i * Math.PI / 2, a1 = a0 + Math.PI / 2, p = (a, r) => [cx + Math.cos(a) * r, cy + Math.sin(a) * r]; const [x0, y0] = p(a0, R), [x1, y1] = p(a1, R), [x2, y2] = p(a1, r0), [x3, y3] = p(a0, r0); return `M${x0} ${y0} A${R} ${R} 0 0 1 ${x1} ${y1} L${x2} ${y2} A${r0} ${r0} 0 0 0 ${x3} ${y3} Z`; };
    let g = `<svg class="ch" viewBox="0 0 320 320" style="max-width:320px;margin:0 auto">`;
    P.forEach((p, i) => { const a = -Math.PI / 2 + (i + 0.5) * Math.PI / 2, tx = cx + Math.cos(a) * 96, ty = cy + Math.sin(a) * 96; g += `<path d="${arc(i)}" fill="${p[2]}" opacity="${s.k === i ? 1 : 0.55}" stroke="#fff" stroke-width="4" style="cursor:pointer" data-pk="${i}"/><text x="${tx}" y="${ty + 2}" text-anchor="middle" style="fill:#fff;font-size:34px;font-family:var(--head);pointer-events:none">${p[0]}</text><text x="${tx}" y="${ty + 22}" text-anchor="middle" style="fill:#fff;font-size:12px;font-weight:700;pointer-events:none">${p[1]}</text>`; });
    g += `<circle cx="${cx}" cy="${cy}" r="${r0 - 4}" class="f-card"/><text x="${cx}" y="${cy + 5}" text-anchor="middle" class="lbl" style="font-size:13px">PDCA</text></svg>`;
    const p = P[s.k];
    el.innerHTML = `<div class="wg">${head(L2('Interaktivní Demingův cyklus', 'Interactive Deming cycle'), L2('Klikněte na fázi cyklu.', 'Click a phase of the cycle.'))}
    <div class="wgrid"><div>${g}</div><div><div class="box" style="box-shadow:none;background:var(--bg);border-left:6px solid ${p[2]}"><h3 style="color:${p[2]};font-size:26px">${p[0]} · ${tr(p[3])}</h3><ul class="chk">${tr(p[4]).map(x => `<li>${esc(x)}</li>`).join('')}</ul></div>
    <div class="btns"><button class="btn sm ghost" data-pn>${L2('Další fáze', 'Next phase')} →</button></div>
    <div class="insight"><div>${L2('Každé otočení kola posune proces výš. Standard (klín) zabrání sklouznutí zpět – proto po úspěšném Act vždy aktualizujte standard.', 'Each turn of the wheel lifts the process higher. The standard (wedge) stops it rolling back – so after a successful Act always update the standard.')}</div></div></div></div></div>`;
    $$('[data-pk]', el).forEach(x => x.onclick = () => { s.k = +x.dataset.pk; draw(); });
    $('[data-pn]', el).onclick = () => { s.k = (s.k + 1) % 4; draw(); };
  };
  draw();
};

/* ---------- DMAIC mini ---------- */
W.dmaic = el => {
  const s = st('dmaicw', () => ({ k: 'D' }));
  const draw = () => {
    const d = DMAIC[s.k];
    el.innerHTML = `<div class="wg">${head(L2('Projděte fáze DMAIC', 'Step through DMAIC'), L2('Klikněte na fázi. Kompletní přehled najdete v Roadmapě DMAIC.', 'Click a phase. See the DMAIC Roadmap for the full overview.'))}
    <div style="display:grid;grid-template-columns:repeat(5,1fr);gap:6px;margin-bottom:16px">${'DMAIC'.split('').map((p, i) => `<button data-dk="${p}" style="border:0;border-radius:10px;padding:14px 4px;cursor:pointer;color:#fff;background:${['#0099DE', '#0088C8', '#0070AA', '#00538F', '#003778'][i]};opacity:${s.k === p ? 1 : 0.45};font-family:var(--head);font-size:28px;line-height:1">${p}<small style="display:block;font-family:var(--font);font-size:11px;margin-top:4px">${PHASES[p][S.lang + 'l']}</small></button>`).join('')}</div>
    <div class="learn"><div class="box" style="box-shadow:none;background:var(--bg)"><h3>${u('goal')}</h3><p style="font-weight:700">${esc(tr(d.goal))}</p><h3 style="margin-top:14px">${u('keyq')}</h3><ul class="chk">${tr(d.q).map(x => `<li>${esc(x)}</li>`).join('')}</ul></div>
    <div class="box" style="box-shadow:none;background:var(--bg)"><h3>${u('outs')}</h3><ul class="chk tip">${tr(d.out).map(x => `<li>${esc(x)}</li>`).join('')}</ul><h3 style="margin-top:14px">${u('tools')}</h3>${miniLinks(TOOLS.filter(t => t.ph.includes(s.k) && t.id !== 'dmaic').map(t => t.id))}</div></div>
    <div class="btns"><a class="btn sm" href="#/dmaic">${u('road_h')} →</a></div></div>`;
    $$('[data-dk]', el).forEach(b => b.onclick = () => { s.k = b.dataset.dk; draw(); });
  };
  draw();
};

/* ---------- A3 ---------- */
W.a3 = el => {
  const s = st('a3', () => ({ title: '', owner: '', v: ['', '', '', '', '', '', ''] }));
  const B = [[L2('1. Pozadí', '1. Background'), L2('Proč je téma důležité? Vazba na cíle firmy…', 'Why does it matter? Link to business goals…')], [L2('2. Současný stav', '2. Current state'), L2('Fakta, data, grafy, kde je problém…', 'Facts, data, charts, where the problem is…')], [L2('3. Cíl', '3. Target'), L2('Co, o kolik, do kdy…', 'What, how much, by when…')], [L2('4. Analýza příčin', '4. Root cause analysis'), L2('Ishikawa, 5x Proč, ověření daty…', 'Fishbone, 5 Whys, verified with data…')], [L2('5. Protiopatření', '5. Countermeasures'), L2('Opatření proti každé kořenové příčině…', 'Action against each root cause…')], [L2('6. Akční plán', '6. Action plan'), L2('Kdo – co – kdy – stav…', 'Who – what – when – status…')], [L2('7. Ověření a další kroky', '7. Follow-up'), L2('Výsledky, standardizace, yokoten…', 'Results, standardisation, yokoten…')]];
  const box = i => `<div class="c"><h4>${B[i][0]}</h4><textarea data-a3="${i}" placeholder="${esc(B[i][1])}">${esc(s.v[i])}</textarea></div>`;
  el.innerHTML = `<div class="wg">${head(L2('Šablona A3', 'A3 template'), L2('Vyplňte a vytiskněte (Tisk / PDF). Levá strana = Plan, pravá = Do-Check-Act.', 'Fill it in and print (Print / PDF). Left side = Plan, right side = Do-Check-Act.'))}
  <div class="row2" style="margin-bottom:10px"><label class="fld"><span>${L2('Téma', 'Theme')}</span><input data-a3t value="${esc(s.title)}"></label><label class="fld"><span>${L2('Vlastník / mentor / datum', 'Owner / mentor / date')}</span><input data-a3o value="${esc(s.owner)}"></label></div>
  <div class="a3"><div class="col">${[0, 1, 2, 3].map(box).join('')}</div><div class="col">${[4, 5, 6].map(box).join('')}</div></div>
  <div class="btns"><button class="btn sm" onclick="window.print()">${u('print')}</button><button class="btn sm ghost" data-clear>${u('clear')}</button></div></div>`;
  $$('[data-a3]', el).forEach(t => t.oninput = () => s.v[+t.dataset.a3] = t.value);
  $('[data-a3t]', el).oninput = e => s.title = e.target.value;
  $('[data-a3o]', el).oninput = e => s.owner = e.target.value;
  $('[data-clear]', el).onclick = () => { WS.a3 = null; W.a3(el); };
};

/* ---------- 8D ---------- */
W.eightd = el => {
  const s = st('eightd', () => ({ c: Array(9).fill(false) }));
  const t = toolById('eightd');
  const draw = () => {
    const n = s.c.filter(Boolean).length;
    el.innerHTML = `<div class="wg">${head(L2('8D kontrolní seznam', '8D checklist'), L2('Odškrtávejte splněné disciplíny při řešení reklamace.', 'Tick off the disciplines as you work through a complaint.'))}
    <div class="qbar"><i style="width:${n / 9 * 100}%;background:${COL.green}"></i></div>
    <div class="d8">${tr(t.steps).map((x, i) => { const [code, ...rest] = x.split(' '); return `<label class="${s.c[i] ? 'ck' : ''}"><input type="checkbox" data-d8="${i}" ${s.c[i] ? 'checked' : ''}><b>${code}</b><span>${esc(rest.join(' '))}</span></label>`; }).join('')}</div>
    <div class="insight ${n === 9 ? 'good' : ''}"><div>${n === 9 ? L2('Všech 8 disciplín splněno – nezapomeňte ocenit tým!', 'All 8 disciplines completed – don’t forget to recognise the team!') : L2(`Splněno ${n} z 9 kroků. Tip: D3 (zadržovací opatření) by mělo proběhnout do 24 hodin.`, `${n} of 9 steps done. Tip: D3 (containment) should happen within 24 hours.`)}</div></div></div>`;
    $$('[data-d8]', el).forEach(c => c.onchange = () => { s.c[+c.dataset.d8] = c.checked; draw(); });
  };
  draw();
};
