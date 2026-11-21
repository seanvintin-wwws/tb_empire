// "Likely next round" study: features, logistic fit, leave-one-opponent-out evaluation, baselines.
// Pure functions; runs in node (tests) or in a swgoh.gg tab (real data in window.__study.data).
var STUDY = (() => {
  const FLEET_ZONE = 2; // swgoh.gg zone 2 = fleet
  const sig = z => 1 / (1 + Math.exp(-z));
  const lg = p => Math.log(p / (1 - p));
  const clip = (p, e = 0.01) => Math.min(1 - e, Math.max(e, p));

  // one opponent -> rounds newest first: { set:Set(leaders on defence, seen attacked), att:Set(their attack leaders),
  // dc:Set(leaders that ran a Lvl 9+/focused datacron on defence), season, rn, squads:{lead:'A,B,C'} }
  function prep(p) {
    const rs = p.rounds.map(r => {
      const set = new Set(), att = new Set(), dc = new Set(), squads = {};
      r.b.forEach(([side, def, attS, zone, , ddc]) => {
        if (zone === FLEET_ZONE) return;
        if (side === 'D') { const L = def.split(',')[0]; set.add(L); squads[L] = def; const t = ddc % 100, f = (ddc % 1000) >= 100; if (t >= 9 || f) dc.add(L); }
        else att.add(attS.split(',')[0]);
      });
      return { ep: r.ep, rn: r.rn, season: r.season, set, att, dc, squads };
    }).filter(r => r.set.size || r.att.size);
    rs.sort((a, b) => b.ep - a.ep || b.rn - a.rn);
    const K = Math.max(1, ...rs.map(r => r.set.size));
    rs.forEach(r => (r.cov = Math.min(1, r.set.size / K)));
    return { ally: p.ally, name: p.name, rs, K };
  }

  // board volatility over earlier rounds: 1 - mean Jaccard of consecutive observed boards (only well-observed pairs)
  function habit(P) {
    const js = [];
    for (let i = 0; i + 1 < P.length && js.length < 8; i++) {
      const a = P[i], b = P[i + 1]; if (a.cov < 0.6 || b.cov < 0.6) continue;
      const inter = [...a.set].filter(x => b.set.has(x)).length, uni = new Set([...a.set, ...b.set]).size;
      js.push(uni ? inter / uni : 0);
    }
    return js.length ? js.reduce((s, x) => s + x, 0) / js.length : 0.5;
  }

  // features for leader L given earlier rounds P (newest first) and the round being predicted (tgt: season, rn)
  function feats(L, P, tgt, meta, H, prm) {
    let x = 0, n = 0, k = 1, dcLast = 0, gotDc = false, attW = 0, an = 0;
    P.forEach(r => {
      const on = r.set.has(L), q = tgt.season != null && r.season !== tgt.season ? prm.qs : 1; // older seasons count less
      x += k * q * (on ? 1 : 0); n += k * q * (on ? 1 : r.cov); // a "no" from a round where few of their squads were attacked counts only partly
      if (on && !gotDc) { gotDc = true; dcLast = r.dc.has(L) ? 1 : 0; }
      attW += k * (r.att.has(L) ? 1 : 0); an += k;
      k *= prm.w;
    });
    const rec = (x + prm.kappa * prm.base) / (n + prm.kappa);
    const last = P[0] && P[0].set.has(L) ? 1 : 0;
    const newSeason = P[0] && tgt.season !== P[0].season ? 1 : 0;
    const m = meta[L] || { pop: 0, hold: 0 };
    const last2 = P.slice(0, 2).some(r => r.set.has(L)) ? 1 : 0;
    return [lg(clip(rec)), last, last * H, an ? attW / an : 0, dcLast, m.pop, m.hold, last * newSeason, rec, last2];
  }
  const NAMES = ['logit(recent share, shrunk)', 'set last round', 'set last round x steadiness', 'used on attack recently', 'ran a Lvl 9+/focused datacron on it last time', 'meta popularity', 'meta hold %', 'set last round x new season', 'recent share (linear)', 'set in either of last 2 rounds'];

  // rows: every leader they have set before, for each round with 4+ earlier rounds; negatives weighted by coverage
  function rows(players, meta, prm, minPrior = 4) {
    const out = [];
    players.forEach((pl, pi) => {
      pl.rs.forEach((t, ti) => {
        const P = pl.rs.slice(ti + 1);
        if (P.length < minPrior || t.cov < 0.3) return;
        const cands = new Set(P.flatMap(r => [...r.set]));
        const H = habit(P);
        cands.forEach(L => {
          const y = t.set.has(L) ? 1 : 0;
          out.push({ pi, ti, L, y, w: y ? 1 : t.cov, cov: t.cov, f: feats(L, P, t, meta, H, prm), last: P[0].set.has(L) ? 1 : 0, share: shareOld(L, P), K: pl.K });
        });
      });
    });
    return out;
  }
  // the old Scout+ figure: share of rounds in their two latest seasons (all rounds if fewer than 6)
  function shareOld(L, P) {
    const ss = [...new Set(P.map(r => r.season))].slice(0, 2);
    let span = P.filter(r => ss.includes(r.season)); if (span.length < 6) span = P;
    return span.filter(r => r.set.has(L)).length / (span.length || 1);
  }

  // weighted L2 logistic regression by Newton steps (few features, so this is quick)
  function fit(R, l2 = 1) {
    const d = R[0].f.length + 1; let b = new Array(d).fill(0);
    for (let it = 0; it < 25; it++) {
      const g = new Array(d).fill(0), Hm = Array.from({ length: d }, () => new Array(d).fill(0));
      R.forEach(r => {
        const xv = [1, ...r.f], p = sig(xv.reduce((s, v, i) => s + v * b[i], 0)), e = r.w * (p - r.y), h = r.w * p * (1 - p);
        for (let i = 0; i < d; i++) { g[i] += e * xv[i]; for (let j = 0; j < d; j++) Hm[i][j] += h * xv[i] * xv[j]; }
      });
      for (let i = 1; i < d; i++) { g[i] += l2 * b[i]; Hm[i][i] += l2; }
      const step = solve(Hm, g); b = b.map((v, i) => v - step[i]);
      if (Math.max(...step.map(Math.abs)) < 1e-6) break;
    }
    return b;
  }
  function solve(A, y) { const n = y.length, M = A.map((r, i) => [...r, y[i]]); for (let c = 0; c < n; c++) { let p = c; for (let r = c + 1; r < n; r++) if (Math.abs(M[r][c]) > Math.abs(M[p][c])) p = r; [M[c], M[p]] = [M[p], M[c]]; const v = M[c][c] || 1e-12; for (let r = 0; r < n; r++) if (r !== c) { const f = M[r][c] / v; for (let k = c; k <= n; k++) M[r][k] -= f * M[c][k]; } } return M.map((r, i) => r[n] / (r[i] || 1e-12)); }
  const pred = (b, f) => sig([1, ...f].reduce((s, v, i) => s + v * b[i], 0));

  // scores: weighted Brier and log loss on well-observed rounds, top-K recall per round, calibration bins
  function score(R, pOf) {
    let bs = 0, ll = 0, w = 0; const bins = Array.from({ length: 10 }, () => ({ p: 0, y: 0, w: 0 }));
    R.forEach(r => { if (r.cov < 0.8) return; const p = clip(pOf(r)); bs += r.w * (p - r.y) ** 2; ll -= r.w * (r.y * Math.log(p) + (1 - r.y) * Math.log(1 - p)); w += r.w; const b = bins[Math.min(9, Math.floor(p * 10))]; b.p += r.w * p; b.y += r.w * r.y; b.w += r.w; });
    const byRound = {}; R.forEach(r => (byRound[r.pi + '|' + r.ti] = byRound[r.pi + '|' + r.ti] || []).push(r));
    let hit = 0, hit2 = 0, tot = 0;
    Object.values(byRound).forEach(rr => { const K = rr[0].K, srt = rr.slice().sort((a, b) => pOf(b) - pOf(a)); const top = new Set(srt.slice(0, K)), top2 = new Set(srt.slice(0, K + 2)); rr.forEach(r => { if (r.y) { tot++; if (top.has(r)) hit++; if (top2.has(r)) hit2++; } }); });
    return { brier: bs / w, logloss: ll / w, recallTopK: hit / tot, recallK2: hit2 / tot, calib: bins.filter(b => b.w > 20).map(b => [+(b.p / b.w).toFixed(2), +(b.y / b.w).toFixed(2), Math.round(b.w)]) };
  }

  // leave-one-opponent-out: fit on everyone else, predict the held-out opponent
  function looScore(players, meta, prm, l2, mask, R0) {
    const R = (R0 || rows(players, meta, prm)).map(r => (mask ? { ...r, f: r.f.map((v, i) => (mask.includes(i) ? v : 0)) } : r)), P = {};
    players.forEach((_, pi) => { const tr = R.filter(r => r.pi !== pi); if (!tr.length) return; const b = fit(tr, l2); R.filter(r => r.pi === pi).forEach(r => (P[r.pi + '|' + r.ti + '|' + r.L] = pred(b, r.f))); });
    return { R, s: score(R, r => P[r.pi + '|' + r.ti + '|' + r.L] ?? 0.5) };
  }

  function run(raw, meta, opts = {}) {
    const players = raw.map(prep).filter(p => p.rs.length >= 8);
    const base = (() => { const R = rows(players, meta, { w: 1, kappa: 0, qs: 1, base: 0.5 }); const s = R.reduce((a, r) => a + r.w * r.y, 0), w = R.reduce((a, r) => a + r.w, 0); return s / w; })();
    const grid = [];
    for (const w of opts.ws || [0.5, 0.65, 0.8, 0.9]) for (const kappa of opts.kappas || [0.5, 2, 5]) for (const qs of opts.qss || [0.5, 1]) grid.push({ w, kappa, qs, base });
    const res = grid.map(prm => ({ prm, ...looScore(players, meta, prm, 1) })).sort((a, b) => a.s.logloss - b.s.logloss);
    const best = res[0], R = best.R;
    const coef = fit(R, 1);
    const ab = (name, mask) => { const x = looScore(players, meta, best.prm, 1, mask, best.R).s; return [name, +x.brier.toFixed(4), +x.logloss.toFixed(4), +x.recallTopK.toFixed(3), +x.recallK2.toFixed(3)]; };
    const ablation = [ab('decay only', [0]), ab('+ set last round', [0, 1]), ab('+ steadiness', [0, 1, 2]), ab('+ attack use', [0, 1, 2, 3]), ab('+ datacron last time', [0, 1, 2, 3, 4]), ab('+ meta popularity', [0, 1, 2, 3, 4, 5]), ab('+ meta hold %', [0, 1, 2, 3, 4, 5, 6]), ab('+ new season', [0, 1, 2, 3, 4, 5, 6, 7]), ab('+ linear share', [0, 1, 2, 3, 4, 5, 6, 7, 8]), ab('+ last 2 rounds', null), ab('lean: share, last, attack, popularity, linear share', [0, 1, 3, 5, 8]), ab('lean + last 2', [0, 1, 3, 5, 8, 9])];
    const baselines = {
      repeatLastRound: score(R, r => (r.last ? 0.85 : 0.15)),
      oldShare: score(R, r => r.share),
      decayedShareOnly: score(R, r => sig(r.f[0])),
    };
    return { players: players.length, rows: R.length, base: +base.toFixed(3), ablation, best: { w: best.prm.w, kappa: best.prm.kappa, qs: best.prm.qs, ...best.s }, grid: res.map(x => [x.prm.w, x.prm.kappa, x.prm.qs, +x.s.logloss.toFixed(4), +x.s.recallTopK.toFixed(3)]), coef: coef.map(v => +v.toFixed(3)), names: ['intercept', ...NAMES], baselines };
  }

  // meta per leader from HotUtils rows [battles, hold, banners, units]: popularity = log battles scaled 0..1, hold = battle-weighted hold
  function metaFrom(rows) {
    const L = {};
    rows.forEach(([n, h, , u]) => { const k = u[0]; const o = (L[k] = L[k] || { n: 0, hn: 0 }); o.n += n; o.hn += n * h; });
    const mx = Math.log1p(Math.max(1, ...Object.values(L).map(o => o.n)));
    const tn = Object.values(L).reduce((a, o) => a + o.n, 0), mh = Object.values(L).reduce((a, o) => a + o.hn, 0) / (tn || 1);
    // hold smoothed toward the league average with 50 battles' weight, so a small sample can't look great
    const out = {}; Object.entries(L).forEach(([k, o]) => (out[k] = { pop: Math.log1p(o.n) / mx, hold: (o.hn + 50 * mh) / (o.n + 50) })); return out;
  }
  return { prep, habit, feats, rows, fit, pred, score, run, metaFrom, NAMES, shareOld };
})();
if (typeof module !== 'undefined') module.exports = STUDY;
