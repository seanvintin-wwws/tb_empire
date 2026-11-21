// Collector for the "likely next round" study. Runs in a swgoh.gg tab. Stores compact 3v3 GAC histories
// in memory (window.__study.data), not localStorage. Throttled, sequential.
(() => {
  if (window.__study && window.__study.running) return 'already running';
  const ST = (window.__study = window.__study || { running: false, done: [], queue: [], seen: {}, log: [], errors: 0 }); ST.data = ST.data || {};
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  const GAP = 1300;
  let last = 0;
  const getDoc = async url => {
    const wait = last + GAP - Date.now(); if (wait > 0) await sleep(wait);
    last = Date.now();
    for (let a = 0; a < 3; a++) {
      const r = await fetch(url, { credentials: 'include' });
      if (r.status === 429) { await sleep(15000 * (a + 1)); continue; }
      if (!r.ok) return null;
      return new DOMParser().parseFromString(await r.text(), 'text/html');
    }
    return null;
  };
  const parseRound = (doc, owner) => {
    const heads = [...doc.querySelectorAll('main *')].filter(e => !e.children.length && /'s attacks \/ .*'s defenses/.test(e.textContent));
    const head = heads.length === 2 ? heads[1] : heads.find(e => e.textContent.includes(owner + "'s defenses"));
    const out = [];
    for (const card of doc.querySelectorAll('.gac-counters-battle-summary')) {
      const st = {};
      card.querySelectorAll('.gac-counters-battle-summary__stat').forEach(s => {
        const l = s.querySelector('.gac-counters-battle-summary__stat-label'), v = s.querySelector('.gac-counters-battle-summary__stat-value');
        if (!l || !v) return;
        const k = l.textContent.trim();
        if (k === 'Zone') { const ps = [...v.querySelectorAll('path')]; st.zone = ps.findIndex(p => /is-active/.test(p.getAttribute('class') || '')); }
        else st[k.toLowerCase()] = v.textContent.trim();
      });
      const ids = sel => [...card.querySelectorAll(sel + ' [data-unit-def-tooltip-app]')].map(e => e.getAttribute('data-unit-def-tooltip-app'));
      const att = ids('.gac-counters-battle-summary__side--attacker'), def = ids('.gac-counters-battle-summary__side--defense');
      if (!att.length || !def.length) continue;
      const dc = sel => { const el = card.querySelector(sel + ' [data-player-datacron-tooltip-app]'); if (!el) return 0; try { const j = JSON.parse(el.getAttribute('data-player-datacron-tooltip-app')); return ((j.derived || {}).tier || 0) + (j.focused ? 100 : 0) + (j.set_id || 0) * 1000; } catch (e) { return 0; } };
      const isDef = !!head && !!(head.compareDocumentPosition(card) & Node.DOCUMENT_POSITION_FOLLOWING);
      // [side D/A, def squad, att squad, zone, outcome W/L/D/R, defender datacron, attacker datacron]
      out.push([isDef ? 'D' : 'A', def.join(','), att.join(','), st.zone ?? -1, (st.outcome || '?')[0], dc('.gac-counters-battle-summary__side--defense'), dc('.gac-counters-battle-summary__side--attacker')]);
    }
    const foes = [...new Set([...doc.querySelectorAll('a[href^="/p/"]')].map(a => (a.getAttribute('href').match(/^\/p\/(\d{9})\/$/) || [])[1]).filter(Boolean))];
    return { b: out, foes };
  };
  const player = async ally => {
    const doc = await getDoc(`/p/${ally}/gac-history/`);
    if (!doc) return null;
    const owner = (doc.title.match(/^(.*?)'s GAC History/) || [, ally])[1];
    const links = []; let season = null, fmt = null;
    doc.querySelectorAll('main *').forEach(el => {
      const sm = el.textContent.replace(/\s+/g, ' ').trim().match(/^Season (\d+) \((\dv\d)\)$/);
      if (sm) { season = +sm[1]; fmt = sm[2]; }
      if (el.tagName === 'A') { const h = el.getAttribute('href') || ''; const lm = h.match(/gac-history\/O(\d+)\/(\d)\/$/); if (lm && !links.find(x => x.h === h)) links.push({ h, season, fmt, ep: +lm[1], rn: +lm[2] }); }
    });
    const same = links.filter(x => x.fmt === '3v3');
    const seasons = [...new Set(same.map(x => x.season))].slice(0, 6);
    const rounds = [];
    for (const r of same.filter(x => seasons.includes(x.season))) {
      const d = await getDoc(r.h); if (!d) { ST.errors++; continue; }
      const p = parseRound(d, owner);
      p.foes.filter(f => f !== ally).forEach(f => { if (!ST.seen[f]) { ST.seen[f] = 1; ST.queue.push(f); } });
      rounds.push({ ep: r.ep, rn: r.rn, season: r.season, b: p.b });
      ST.status = `${owner}: ${rounds.length}/${same.filter(x => seasons.includes(x.season)).length}`;
    }
    return { ally, name: owner, rounds };
  };
  ST.run = async (seeds, target) => {
    ST.running = true;
    seeds.forEach(s => { if (!ST.seen[s]) { ST.seen[s] = 1; ST.queue.push(s); } });
    while (ST.queue.length && ST.done.length < target && ST.running) {
      const a = ST.queue.shift();
      if (ST.data[a]) { if (!ST.done.includes(a)) ST.done.push(a); continue; }
      try {
        const p = await player(a);
        if (p && p.rounds.length >= 8) { ST.data[a] = p; ST.done.push(a); ST.log.push(`${p.name} ${p.rounds.length}`); }
        else ST.log.push(`skip ${a} ${p ? p.rounds.length : 'x'}`);
      } catch (e) { ST.errors++; ST.log.push('err ' + a + ' ' + e.message); }
    }
    ST.running = false; ST.status = 'finished';
  };
  ST.run([], 45);
  return 'started';
})();
