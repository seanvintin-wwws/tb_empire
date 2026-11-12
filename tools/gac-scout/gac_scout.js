/* GAC Scout for swgoh.gg
   How to use: open any of your opponent's pages on swgoh.gg (profile, GAC, etc.) in Chrome,
   press F12 (or Ctrl+Shift+J) to open the Console, paste this whole file, press Enter.
   The first time, it asks for your ally code (saved in your browser) so it can show your relic levels.
   It reads every round of their GAC history (about 1 minute) and replaces the page
   with a scouting report: their defences (and what beats them), their attacks
   (and what beats those), and when they attack.                                  */
(async () => {
  let MY_ALLY = localStorage.getItem('gacScoutAlly') || '';
  if (!MY_ALLY) { MY_ALLY = (prompt('GAC Scout: enter YOUR ally code (9 digits) to show your relic levels next to counters. Leave blank to skip.') || '').replace(/\D/g, ''); if (MY_ALLY) localStorage.setItem('gacScoutAlly', MY_ALLY); }
  const SEASONS = 8;               // how many recent seasons to read
  const ONLY_FORMAT = 'auto';      // 'auto' = same format as their latest season, or '3v3' / '5v5' / 'all'

  const ally = (location.pathname.match(/\/p\/(\d+)\//) || [])[1];
  if (!ally || !/swgoh\.gg$/.test(location.hostname)) { alert('Open your opponent\'s page on swgoh.gg first (their profile or GAC tab).'); return; }
  const status = m => { document.title = m; console.log('[GAC Scout] ' + m); };
  const getDoc = async u => new DOMParser().parseFromString(await (await fetch(u, { credentials: 'include' })).text(), 'text/html');
  const getJson = async u => { const r = await fetch(u); return r.ok ? r.json() : null; };

  status('Loading unit names…');
  const units = [...((await getJson('/api/characters/')) || []), ...((await getJson('/api/ships/')) || [])];
  const NAME = Object.fromEntries(units.map(u => [u.base_id, u.name]));
  const nm = id => NAME[id] || id;

  // ---- season list + round links -------------------------------------------------
  const hist = await getDoc(`/p/${ally}/gac-history/`);
  const oppName = (hist.title.match(/^(.*?)'s GAC History/) || [, 'Opponent'])[1];
  const rounds = []; let season = null, fmt = null;
  hist.querySelectorAll('main *').forEach(e => {
    { const m = e.textContent.replace(/\s+/g, ' ').trim().match(/^Season (\d+) \((\dv\d)\)$/); if (m) { season = +m[1]; fmt = m[2]; } }
    if (e.tagName === 'A') { const h = e.getAttribute('href') || ''; if (/gac-history\/O\d+\/\d\/$/.test(h) && !rounds.find(r => r.h === h)) rounds.push({ h, season, fmt }); }
  });
  const seasonsSeen = [...new Set(rounds.map(r => r.season))].slice(0, SEASONS);
  const latestFmt = rounds.length ? rounds[0].fmt : '3v3';
  const want = ONLY_FORMAT === 'auto' ? latestFmt : ONLY_FORMAT;
  const todo = rounds.filter(r => seasonsSeen.includes(r.season) && (want === 'all' || r.fmt === want));

  // ---- read every round ------------------------------------------------------------
  const battles = [];
  for (let i = 0; i < todo.length; i++) {
    const r = todo[i]; status(`Reading round ${i + 1}/${todo.length}…`);
    try {
      const d = await getDoc(r.h);
      const txt = d.querySelector('main').textContent.replace(/\s+/g, ' ');
      const vs = txt.match(/Round \d Round \d Round \d (.+?) vs (.+?) \d/);
      const defHead = [...d.querySelectorAll('main *')].find(e => !e.children.length && new RegExp(`'s attacks / .*${oppName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}'s defenses`).test(e.textContent));
      for (const card of d.querySelectorAll('.gac-counters-battle-summary')) {
        const s = {};
        card.querySelectorAll('.gac-counters-battle-summary__stat').forEach(st => {
          const l = st.querySelector('.gac-counters-battle-summary__stat-label'), v = st.querySelector('.gac-counters-battle-summary__stat-value');
          if (!l || !v) return; const k = l.textContent.trim();
          if (k === 'Date') { const t = v.querySelector('time'); s.date = t ? t.getAttribute('datetime') : ''; }
          else if (k === 'Zone') s.zone = [...v.querySelectorAll('path')].findIndex(p => /is-active/.test(p.getAttribute('class') || ''));
          else s[k.toLowerCase()] = v.textContent.trim();
        });
        const ids = sel => [...card.querySelectorAll(sel + ' [data-unit-def-tooltip-app]')].map(e => e.getAttribute('data-unit-def-tooltip-app'));
        const isDef = defHead ? !!(defHead.compareDocumentPosition(card) & Node.DOCUMENT_POSITION_FOLLOWING) : false;
        battles.push({ round: r.h, season: r.season, fmt: r.fmt, foe: vs ? vs[2] : '', side: isDef ? 'DEF' : 'ATT', ...s,
          att: ids('.gac-counters-battle-summary__side--attacker'), def: ids('.gac-counters-battle-summary__side--defense') });
      }
    } catch (e) { console.warn('round failed', r.h, e); }
  }

  // ---- my roster (optional) -----------------------------------------------------------
  let MINE = {}, THEIRS = {};
  const relic = u => { const d = u.data; return d.combat_type === 2 ? d.rarity + '★' : d.gear_level >= 13 ? 'R' + Math.max(0, d.relic_tier - 2) : 'G' + d.gear_level; };
  const op = await getJson(`/api/player/${ally}/`); if (op) op.units.forEach(u => THEIRS[u.data.base_id] = relic(u));
  if (MY_ALLY) { const me = await getJson(`/api/player/${MY_ALLY}/`); if (me) me.units.forEach(u => MINE[u.data.base_id] = relic(u)); }

  // ---- analysis -------------------------------------------------------------------------
  const lead = a => a[0] || '?';
  const team = a => a.map(nm).join(' + ');
  const tally = (o, k) => (o[k] = (o[k] || 0) + 1);
  const top = (o, n = 5) => Object.entries(o).sort((a, b) => b[1] - a[1]).slice(0, n);
  const D = {}, A = {};
  battles.forEach(b => {
    if (b.side === 'DEF' && b.def.length) {
      const o = D[lead(b.def)] || (D[lead(b.def)] = { n: 0, held: 0, teams: {}, beat: {}, heldVs: {}, zones: {} });
      o.n++; tally(o.teams, team(b.def)); tally(o.zones, b.zone);
      if (b.outcome === 'Loss') { o.held++; tally(o.heldVs, lead(b.att)); } else tally(o.beat, lead(b.att));
    }
    if (b.side === 'ATT' && b.att.length) {
      const o = A[lead(b.att)] || (A[lead(b.att)] = { n: 0, win: 0, teams: {}, beat: {}, lost: {} });
      o.n++; tally(o.teams, team(b.att));
      if (b.outcome === 'Win') tally(o.beat, lead(b.def)); else { tally(o.lost, lead(b.def)); }
      if (b.outcome === 'Win') o.win++;
    }
  });
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const when = t => new Date(t).toLocaleString(undefined, { weekday: 'short', hour: '2-digit', minute: '2-digit' });
  const byRound = {}; battles.filter(b => b.side === 'ATT' && b.date).forEach(b => (byRound[b.round] = byRound[b.round] || { foe: b.foe, season: b.season, t: [] }).t.push(b.date));
  const hours = {}; Object.values(byRound).forEach(r => { r.t.sort(); tally(hours, new Date(r.t[0]).getHours()); });

  // ---- render ---------------------------------------------------------------------------
  const esc = s => String(s).replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));
  const tag = id => `${esc(nm(id))}${MY_ALLY ? ` <span class=mine>${MINE[id] || '—'}</span>` : ''}`;
  const list = o => top(o).map(([k, v]) => `${tag(k)} ×${v}`).join('<br>') || '—';
  const pct = (a, b) => b ? Math.round(100 * a / b) + '%' : '';
  const defRows = Object.entries(D).sort((a, b) => b[1].n - a[1].n).map(([k, o]) => `<tr><td><b>${esc(nm(k))}</b> <span class=their>${THEIRS[k] || ''}</span><div class=sub>${top(o.teams, 2).map(([t, v]) => esc(t) + ' ×' + v).join('<br>')}</div></td><td>${o.held}/${o.n} <span class=sub>(${pct(o.held, o.n)})</span></td><td>${list(o.beat)}</td><td>${list(o.heldVs)}</td><td class=sub>${top(o.zones, 2).map(([z, v]) => 'Z' + z + ' ×' + v).join(', ')}</td></tr>`).join('');
  const attRows = Object.entries(A).sort((a, b) => b[1].n - a[1].n).map(([k, o]) => `<tr><td><b>${esc(nm(k))}</b> <span class=their>${THEIRS[k] || ''}</span><div class=sub>${top(o.teams, 2).map(([t, v]) => esc(t) + ' ×' + v).join('<br>')}</div></td><td>${o.win}/${o.n} <span class=sub>(${pct(o.win, o.n)})</span></td><td>${list(o.lost)}</td><td>${list(o.beat)}</td></tr>`).join('');
  const timeRows = Object.values(byRound).map(r => `<tr><td>S${r.season} vs ${esc(r.foe)}</td><td>${when(r.t[0])}</td><td>${when(r.t[r.t.length - 1])}</td><td>${r.t.length}</td></tr>`).join('');
  document.title = `GAC scout: ${oppName}`;
  document.body.innerHTML = `<style>
    body{background:#111;color:#ddd;font:14px/1.4 system-ui,sans-serif;margin:20px}
    h1{font-size:22px}h2{margin-top:28px;border-bottom:1px solid #444}
    table{border-collapse:collapse;width:100%}td,th{border-bottom:1px solid #333;padding:6px;vertical-align:top;text-align:left}
    th{color:#9cf}.sub{color:#999;font-size:12px}.mine{color:#7f7;font-size:12px}.their{color:#f99;font-size:12px}</style>
    <h1>GAC scout: ${esc(oppName)} (${ally})</h1>
    <p class=sub>${battles.length} battles from ${Object.keys(byRound).length || todo.length} rounds, seasons ${seasonsSeen.filter(s => todo.some(r => r.season === s)).join(', ')} (${want}). Outcome counts are per attempt. <span class=their>Red</span> = their relic, ${MY_ALLY ? '<span class=mine>green</span> = yours. ' : ''}Times in ${esc(tz)}. <a href="#" style="color:#9cf" onclick="localStorage.removeItem('gacScoutAlly');alert('Cleared. Click GAC Scout again to enter a new ally code.');return false">Change my ally code</a></p>
    <h2>Their defences: what beats them</h2>
    <table><tr><th>Defence</th><th>Held</th><th>Beaten by</th><th>Held against</th><th>Zone</th></tr>${defRows}</table>
    <h2>Their attacks: what stops them</h2>
    <table><tr><th>Attack team</th><th>Wins</th><th>Lost to (defend with these)</th><th>Beat</th></tr>${attRows}</table>
    <h2>When they attack</h2>
    <p>First attack of each round, by hour (${esc(tz)}): ${Object.entries(hours).sort((a, b) => a[0] - b[0]).map(([h, v]) => `${String(h).padStart(2, '0')}:00 ×${v}`).join(', ')}</p>
    <table><tr><th>Round</th><th>First attack</th><th>Last attack</th><th>Attacks</th></tr>${timeRows}</table>`;
  status(`GAC scout: ${oppName}`);
})();
