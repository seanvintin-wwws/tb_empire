/* Roster check for the Rise of the Empire map.
 * Enter an ally code and the map marks which missions that player can field a team for, reading their units, relics
 * and omicrons live from swgoh.gg. Teams come from js/rote-teams.js (built by tools/rote/build_teams.js from the
 * Nov 2026 swgohrote.com guide, or the map's own teams where the guide has none), and each is checked against the
 * mission's rules (relic, side, faction, required units). On a planet page each mission glows green (ready) or red
 * (not yet) and its panel says which team is ready or what's short. On the main map each planet says how many of its
 * missions are ready. The phase plan picks one ready team per mission so that no unit is used twice.
 * Load after vue.min.js, js/rote-units.js and js/rote-teams.js, before the page's own script.
 * Nothing is sent anywhere but swgoh.gg; the ally code and open planets are remembered in this browser only.
 */
(function () {
  if (typeof Vue === 'undefined') return;
  var KEY = 'rote:allyCode', OPENKEY = 'rote:open';
  var TEAMS = window.ROTE_TEAMS || {};
  // ---------- unit catalogue (names, side, factions) ----------
  var CATS = window.ROTE_CATS || [], CAT = {};
  String(window.ROTE_UNITS || '').split('\n').forEach(function (l) {
    var p = l.split('|'); if (p.length < 3) return;
    CAT[p[0]] = { name: p[1], a: p[2], cats: (p[3] || '').split('').map(function (c) { return CATS[parseInt(c, 36)]; }) };
  });
  var uname = function (id) { return (RC.units && RC.units[id] && RC.units[id].name) || (CAT[id] && CAT[id].name) || id; };
  var ago = function (t) { var ms = Date.now() - Date.parse(t); if (!(ms >= 0)) return String(t).slice(0, 10); var h = Math.round(ms / 36e5); return h < 1 ? 'under an hour ago' : h < 48 ? h + ' h ago' : Math.round(h / 24) + ' days ago'; };
  var esc = function (s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
  var openSaved = {}; try { openSaved = JSON.parse(localStorage.getItem(OPENKEY) || '{}') || {}; } catch (e) {}
  var RC = Vue.observable({ ally: '', name: '', updated: '', units: null, loading: false, err: '', planets: {}, plans: {}, failed: {}, open: openSaved });

  // ---------- roster ----------
  function clearRoster() { RC.units = null; RC.name = ''; RC.planets = {}; RC.plans = {}; RC.failed = {}; RC.updated = ''; }
  function load(ally) {
    ally = String(ally || '').replace(/\D/g, '');
    if (load.ctl) { load.ctl.abort(); load.ctl = null; }
    clearRoster(); RC.loading = false;
    if (ally.length !== 9) { RC.err = 'An ally code has 9 digits.'; return; }
    var ctl = load.ctl = typeof AbortController === 'function' ? new AbortController() : {};
    var timer = setTimeout(function () { if (ctl.abort) ctl.abort(); }, 10000);
    RC.loading = true; RC.err = '';
    fetch('https://swgoh.gg/api/player/' + ally + '/', ctl.signal ? { signal: ctl.signal } : {}).then(function (r) {
      if (!r.ok) throw new Error(r.status === 404 ? 'No player with that ally code on swgoh.gg.' : 'swgoh.gg answered ' + r.status + '. Roster not checked; try again in a minute.');
      return r.json();
    }).then(function (j) {
      if (load.ctl !== ctl) return; // a newer lookup has started
      if (!j || !Array.isArray(j.units) || !j.units.length || !(j.units[0].data || j.units[0]).base_id) throw new Error('swgoh.gg sent a roster in a format this map doesn\'t recognise. Roster not checked.');
      var units = {};
      j.units.forEach(function (u) {
        var d = u.data || u, ship = d.combat_type === 2, omi = d.omicron_abilities || [];
        units[d.base_id] = { id: d.base_id, name: d.name, ship: ship, stars: d.rarity, gear: d.gear_level,
          relic: !ship && d.gear_level === 13 ? Math.max(0, (d.relic_tier || 0) - 2) : 0,
          omi: omi.length, leadOmi: omi.some(function (a) { return /^leaderskill/i.test(a); }) };
      });
      RC.units = units; RC.ally = ally; RC.name = (j.data && j.data.name) || ally;
      RC.updated = (j.data && (j.data.last_updated || j.data.updated)) || '';
      try { localStorage.setItem(KEY, ally); } catch (e) {}
      loadPlanets();
    }).catch(function (e) {
      if (load.ctl !== ctl) return;
      RC.err = e && e.name === 'AbortError' ? 'swgoh.gg didn\'t answer within 10 seconds. Roster not checked; try again.' : (e && e.message) || 'Couldn\'t reach swgoh.gg. Roster not checked.';
    }).then(function () { clearTimeout(timer); if (load.ctl === ctl) RC.loading = false; });
  }

  // ---------- missions ----------
  // does a unit meet the mission's rules (side, faction, ships vs characters)?
  function fits(id, T) {
    var c = CAT[id]; if (!c) return !!(RC.units[id] && RC.units[id].ship === T.ships);
    var u = RC.units[id]; if (u && u.ship !== T.ships) return false;
    if (T.align && !(c.a === T.align || (!T.strict && c.a === 'N'))) return false;
    if (T.strict && c.a !== T.strict) return false;
    if (T.cat && c.cats.indexOf(T.cat) < 0) return false;
    return true;
  }
  function levelOk(u, T) { return u.ship ? u.stars >= 7 : !T.rel || u.relic >= T.rel; }
  function levelTxt(u, T) { return u.ship ? u.stars + '★, needs 7★' : (u.gear === 13 ? 'R' + u.relic : 'G' + u.gear) + ', needs R' + T.rel; }
  // one team: every listed unit owned at the level asked (and with its omicron where the guide says so),
  // plus enough other qualifying units for its "any" slots
  function teamCheck(t, T) {
    var short = [], ids = [];
    t.slots.forEach(function (s) {
      var alts = s[0], omi = s[1] || 0, best = null, bestWhy = null;
      alts.forEach(function (id) {
        var u = RC.units[id], why = null;
        if (!u) why = 'not unlocked';
        else if (!levelOk(u, T)) why = levelTxt(u, T);
        else if (omi === 2 && !u.leadOmi) why = 'needs the leader omicron';
        else if (omi === 1 && !u.omi) why = 'needs its omicron';
        if (!why && !best) best = id;
        if (why && (!bestWhy || (u && !bestWhy.u))) bestWhy = { id: id, why: why, u: !!u };
      });
      if (best) ids.push(best); else short.push({ n: alts.map(uname).join(' or '), why: bestWhy ? bestWhy.why : 'not unlocked' });
    });
    var flexNeed = (t.flex || []).reduce(function (a, f) { return a + f.n; }, 0), flexIds = [];
    if (flexNeed) {
      (t.flex || []).forEach(function (f) {
        var pool = Object.keys(RC.units).filter(function (id) {
          var u = RC.units[id]; return ids.indexOf(id) < 0 && flexIds.indexOf(id) < 0 && fits(id, T) && levelOk(u, T) && (!f.cat || (CAT[id] && CAT[id].cats.indexOf(f.cat) >= 0));
        });
        if (pool.length < f.n) short.push({ n: f.n + ' more ' + (f.cat ? f.cat + ' ' : '') + 'unit' + (f.n === 1 ? '' : 's'), why: 'you have ' + pool.length + ' that qualif' + (pool.length === 1 ? 'ies' : 'y') });
        else flexIds = flexIds.concat(pool.slice(0, f.n));
      });
    }
    return { name: t.label, ok: !short.length, own: !!t.own, short: short, ids: ids, flex: t.flex || [], flexIds: flexIds };
  }
  function missionCheck(m, planet) {
    if (!RC.units || !m || m.type === 'platoon' || m.type === 'deploy') return null;
    var T = TEAMS[planet + ':' + m.name]; if (!T || !T.teams.length) return null;
    var res = T.teams.filter(function (t) { return !t.bad; }).map(function (t) { return teamCheck(t, T); });
    if (!res.length) return null;
    res.sort(function (a, b) { return (b.ok && !b.own) - (a.ok && !a.own) || (b.ok - a.ok) || a.own - b.own || a.short.length - b.short.length; });
    var ready = res.some(function (r) { return r.ok && !r.own; });
    return { rel: T.rel, kind: T.kind, src: T.src, ready: ready, own: !ready && res.some(function (r) { return r.ok && r.own; }), res: res, T: T };
  }
  var KIND = { combat: 'combat', special: 'special', fleet: 'fleet' };
  function mlabel(m, kind) { var x = String(m.name || '').match(/^[a-z](\d+)$/i); return (KIND[kind] || 'mission') + ' ' + (x ? x[1] : m.name); }

  // ---------- main map: count ready missions per planet, from each planet's own data ----------
  function isMain() { return !!(window.ROTE_PLANET_LINKS && window.ROTE_PLANET_LINKS.length); }
  function planetData(link) {
    return fetch('../js/' + link.replace(/\.html$/, '.js')).then(function (r) { if (!r.ok) throw new Error(r.status); return r.text(); }).then(function (txt) {
      var opts = null, Fake = function () {};
      Fake.component = function (n, o) { opts = o; }; Fake.directive = Fake.mixin = function () {};
      new Function('Vue', 'window', txt)(Fake, { matchMedia: function () { return { matches: false }; } });
      return opts && typeof opts.data === 'function' ? opts.data() : null;
    });
  }

  // ---------- phase plan: a unit can only fight once per phase, across every planet that's open ----------
  var PHASES = [['mustafar', 'corellia', 'coruscant'], ['geonosis', 'felucia', 'bracca'], ['dathomir', 'tatooine', 'kashyyyk', 'zeffo'],
    ['haven', 'kessel', 'lothal', 'mandalore'], ['malachor', 'vandor', 'kafrene'], ['deathstar', 'hoth', 'scarif']];
  var BONUS = { zeffo: 1, mandalore: 1 };
  var ALL = [].concat.apply([], PHASES);
  var PNAME = { deathstar: 'Death Star', haven: 'Haven', kafrene: 'Ring of Kafrene' };
  function pname(l) { l = String(l).replace(/\.html$/, ''); return PNAME[l] || l.charAt(0).toUpperCase() + l.slice(1); }
  function phaseOf(b) { b = String(b).replace(/\.html$/, ''); for (var i = 0; i < PHASES.length; i++) if (PHASES[i].indexOf(b) >= 0) return i; return -1; }
  function openList() { return ALL.filter(function (b) { return RC.open[b]; }); }
  // the planets planned together with planet b: the ticked "open now" planets if b is one of them, otherwise b's phase
  // (bonus planets only when ticked)
  function groupOf(b) {
    b = String(b).replace(/\.html$/, '');
    var open = openList();
    if (open.indexOf(b) >= 0) return { key: 'open', planets: open };
    var pi = phaseOf(b); if (pi < 0) return null;
    return { key: 'p' + pi, phase: pi, planets: PHASES[pi].filter(function (x) { return open.indexOf(x) < 0 && (!BONUS[x] || x === b && RC.open[x]); }) };
  }
  // exact search for one group of missions that share units: most special missions first, then most missions
  function solve(items) {
    items = items.slice().sort(function (a, b) { return a.opts.length - b.opts.length; });
    var best = { s: -1, pick: [] }, used = {}, pick = [], budget = 400000, cut = false;
    // special missions count most; a guide team counts slightly more than a lineup of your own
    var w = items.map(function (it) { return it.kind === 'special' ? 10000 : 10; });
    var rest = []; for (var i = items.length - 1, acc = 0; i >= 0; i--) { acc += w[i]; rest[i] = acc; } rest[items.length] = 0;
    (function go(i, s) {
      if (--budget < 0) { cut = true; return; }
      if (s + rest[i] <= best.s) return;
      if (i === items.length) { best = { s: s, pick: pick.slice() }; return; }
      items[i].opts.forEach(function (o) {
        if (o.ids.some(function (id) { return used[id]; })) return;
        o.ids.forEach(function (id) { used[id] = 1; }); pick[i] = o;
        go(i + 1, s + w[i] - (o.own ? 1 : 0));
        o.ids.forEach(function (id) { delete used[id]; }); pick[i] = null;
      });
      pick[i] = null; go(i + 1, s);
    })(0, 0);
    return { cut: cut, rows: items.map(function (it, i) { return { planet: it.planet, mission: it.mission, kind: it.kind, ready: it.opts.length > 0, team: best.pick[i] ? best.pick[i].name : '', pick: best.pick[i] || null }; }) };
  }
  function plan(items) {
    // split into groups of missions whose teams share units; each group is solved on its own
    var n = items.length, parent = items.map(function (x, i) { return i; }), owner = {};
    var find = function (i) { while (parent[i] !== i) i = parent[i] = parent[parent[i]]; return i; };
    items.forEach(function (it, i) { it.opts.forEach(function (o) { o.ids.forEach(function (id) { if (owner[id] == null) owner[id] = i; else parent[find(i)] = find(owner[id]); }); }); });
    var groups = {}; for (var i = 0; i < n; i++) (groups[find(i)] = groups[find(i)] || []).push(items[i]);
    var rows = [], cut = false;
    Object.keys(groups).forEach(function (g) { var r = solve(groups[g]); cut = cut || r.cut; rows = rows.concat(r.rows); });
    // "any unit" slots: give each chosen team spare units nobody else in the plan uses (fewest choices first)
    var used = {}; rows.forEach(function (r) { if (r.pick) r.pick.ids.forEach(function (id) { used[id] = 1; }); });
    rows.filter(function (r) { return r.pick && r.pick.flex.length; }).forEach(function (r) {
      var T = r.pick.T, short = 0;
      r.pick.flex.forEach(function (f) {
        var pool = Object.keys(RC.units).filter(function (id) { return !used[id] && fits(id, T) && levelOk(RC.units[id], T) && (!f.cat || (CAT[id] && CAT[id].cats.indexOf(f.cat) >= 0)); });
        pool.slice(0, f.n).forEach(function (id) { used[id] = 1; }); if (pool.length < f.n) short += f.n - pool.length;
      });
      if (short) { r.flexShort = short; r.team = ''; }
    });
    return { rows: rows, cut: cut };
  }
  function planAll() {
    var done = {};
    ALL.forEach(function (b) {
      var g = groupOf(b); if (!g || done[g.key] || !g.planets.length) return; done[g.key] = 1;
      var items = [], missing = g.planets.filter(function (p) { return RC.failed[p]; });
      // a group is planned only once every planet in it has loaded or failed (pages load just the planets they need)
      if (g.planets.some(function (p) { return !DATA[p + '.html'] && !RC.failed[p]; })) return;
      g.planets.forEach(function (p) {
        var d = DATA[p + '.html']; if (!d) return;
        (d.missions || []).forEach(function (m) {
          var c = missionCheck(m, p); if (!c) return;
          items.push({ planet: p, mission: mlabel(m, c.kind), kind: c.kind,
            opts: c.res.filter(function (r) { return r.ok; }).map(function (r) { return { name: (r.own ? 'your own lineup: ' : '') + r.name, own: r.own, ids: r.ids, flex: r.flex, T: c.T }; }) });
        });
      });
      if (!items.length) return;
      var r = plan(items);
      Vue.set(RC.plans, g.key, { planets: g.planets, missing: missing, cut: r.cut, rows: r.rows,
        filled: r.rows.filter(function (x) { return x.team; }).length, total: r.rows.length });
    });
  }
  function planFor(b) { var g = groupOf(b); return g ? RC.plans[g.key] : null; }
  function planNote(link) {
    var b = String(link).replace(/\.html$/, ''), p = planFor(b);
    if (BONUS[b] && !RC.open[b]) return '<p class="h4">Phase plan</p><p class="rc-sub">' + esc(pname(b)) + ' is a bonus planet, so it isn\'t in the phase plan until you tick it as open.</p>' + openBox(b);
    if (!p) return '';
    var g = groupOf(b), title = g.key === 'open' ? 'Plan for the planets open now' : 'Phase ' + (g.phase + 1) + ' plan';
    var clash = p.rows.filter(function (x) { return x.ready && !x.team; });
    var mine = p.rows.filter(function (x) { return x.planet === b; }).sort(function (a, c) { return a.mission < c.mission ? -1 : 1; });
    return '<p class="h4">' + title + '</p><p>' + esc(p.planets.map(pname).join(', ')) + ': without reusing a unit you can fill <b>' + p.filled + ' of ' + p.total + '</b> missions'
      + (clash.length ? ' (<span class="rc-some-t">' + clash.length + ' more ready on their own, but their units are needed elsewhere</span>: ' + clash.map(function (x) { return esc(pname(x.planet) + ' ' + x.mission); }).join(', ') + ')' : '') + '.'
      + (p.missing.length ? ' <span class="rc-x">' + esc(p.missing.map(pname).join(', ')) + ': data unavailable, not planned.</span>' : '')
      + (p.cut ? ' <span class="rc-some-t">Best plan found, not proven best (too many combinations).</span>' : '') + '</p>'
      + '<ul class="rc-list">' + mine.map(function (x) { return '<li>' + esc(x.mission) + ': ' + (x.team ? '<span class="rc-yes">' + esc(x.team) + '</span>' : x.flexShort ? '<span class="rc-some-t">not enough spare units for its open slots</span>' : x.ready ? '<span class="rc-some-t">units needed elsewhere</span>' : '<span class="rc-x">no ready team</span>') + '</li>'; }).join('') + '</ul>'
      + openBox(b) + '<p class="rc-sub">Special missions are filled first. Units you place in operations (platoons) can\'t fight on that planet and aren\'t counted here.</p>';
  }
  // tick boxes: which planets are open right now (each path moves on separately, and bonus planets need unlocking)
  function openBox(b) {
    var pi = phaseOf(b), near = ALL.filter(function (x) { var q = phaseOf(x); return Math.abs(q - pi) <= 1 || RC.open[x]; });
    return '<details class="rc-open"><summary>Planets open now' + (openList().length ? ': ' + esc(openList().map(pname).join(', ')) : ' (not set: planning by phase)') + '</summary><p class="rc-sub">Tick the planets your guild can fight on today. They\'re planned together. Zeffo and Mandalore are left out until ticked.</p>'
      + near.map(function (x) { return '<label class="rc-tick"><input type="checkbox" data-rc-open="' + x + '"' + (RC.open[x] ? ' checked' : '') + '> ' + esc(pname(x)) + '</label>'; }).join('') + '</details>';
  }
  document.addEventListener('change', function (e) {
    var b = e.target && e.target.getAttribute && e.target.getAttribute('data-rc-open'); if (!b) return;
    var o = {}; Object.keys(RC.open).forEach(function (k) { if (RC.open[k]) o[k] = true; }); if (e.target.checked) o[b] = true; else delete o[b];
    RC.open = o; try { localStorage.setItem(OPENKEY, JSON.stringify(o)); } catch (x) {}
    RC.plans = {}; if (RC.units) loadPlanets();
  });

  var DATA = {};
  function loadPlanets() {
    var links = {};
    var here = String(window.GUIDE_PLANET || '');
    var list = isMain() ? window.ROTE_PLANET_LINKS : ALL.filter(function (b) { var g = groupOf(here); return g && g.planets.indexOf(b) >= 0 || b === here; }).map(function (b) { return b + '.html'; });
    list.forEach(function (l) { links[l] = 1; });
    var pending = Object.keys(links).length;
    var doneOne = function () { if (--pending === 0) planAll(); };
    Object.keys(links).forEach(function (link) {
      var b = link.replace(/\.html$/, '');
      (DATA[link] ? Promise.resolve(DATA[link]) : planetData(link)).then(function (d) {
        if (!d) throw new Error('no data');
        DATA[link] = d;
        var ready = 0, own = 0, total = 0, kinds = {};
        (d.missions || []).forEach(function (m) { var c = missionCheck(m, b); if (c) { total++; if (c.ready) ready++; else if (c.own) own++; kinds[c.kind] = (kinds[c.kind] || 0) + 1; } });
        Vue.set(RC.planets, link, { ready: ready, own: own, total: total, kinds: kinds });
      }).catch(function () { Vue.set(RC.failed, b, true); }).then(doneOne);
    });
  }
  function kindsTxt(k) { return ['combat', 'special', 'fleet'].filter(function (x) { return k && k[x]; }).map(function (x) { return k[x] + ' ' + x; }).join(', '); }

  // ---------- hooks used by the page templates ----------
  Vue.mixin({
    // the pages define a phone check (mq) but never ran it, so phones got the desktop hover behaviour
    mounted: function () { if (typeof this.mq === 'function' && this.isMobile === false) this.mq(); },
    created: function () { if (this.missions) { var l = this.missions.map(function (m) { return m.planetlink; }).filter(Boolean); if (l.length) { window.ROTE_PLANET_LINKS = l; if (RC.units) loadPlanets(); } } },
    methods: {
      rcClass: function (m) {
        if (!RC.units || !m) return '';
        if (m.planetlink) { var p = RC.planets[m.planetlink]; return !p || !p.total ? '' : p.ready === p.total ? 'rc-ready' : p.ready || p.own ? 'rc-some' : 'rc-no'; }
        var c = missionCheck(m, String(window.GUIDE_PLANET || ''));
        return c ? (c.ready ? 'rc-ready' : c.own ? 'rc-some' : 'rc-no') : '';
      },
      rcNote: function (m) {
        if (!RC.units || !m) return '';
        var who = '<b>' + esc(RC.name) + '</b>';
        if (m.planetlink) {
          var p = RC.planets[m.planetlink], b = m.planetlink.replace(/\.html$/, '');
          if (RC.failed[b]) return '<p class="h4">Your roster</p><p class="rc-x">This planet\'s data couldn\'t be loaded. Try reloading the page.</p>';
          return p && p.total ? '<p class="h4">Your roster</p><p>' + who + ': ready for <b>' + p.ready + ' of ' + p.total + '</b> missions here (' + esc(kindsTxt(p.kinds)) + ')' + (p.own ? '; ' + p.own + ' more with a lineup of your own' : '') + '. Open the planet for details.</p>' + planNote(m.planetlink) : '';
        }
        var here = String(window.GUIDE_PLANET || ''), c = missionCheck(m, here);
        if (!c) return '';
        var lines = c.res.filter(function (r) { return !r.own || r.ok; }).slice(0, 4).map(function (r) {
          if (r.own) return '<li><span class="rc-some-t">◐</span> Your own lineup: ' + esc(r.name) + ', e.g. ' + esc(r.ids.concat(r.flexIds.slice(0, 4)).map(uname).join(', ')) + '. Meets the mission\'s rules, but isn\'t a guide team.</li>';
          return r.ok ? '<li><span class="rc-yes">✓</span> ' + esc(r.name) + '</li>'
            : '<li><span class="rc-x">✕</span> ' + esc(r.name) + ': ' + r.short.slice(0, 3).map(function (x) { return esc(x.n) + ' (' + esc(x.why) + ')'; }).join(', ') + (r.short.length > 3 ? ', +' + (r.short.length - 3) + ' more' : '') + '</li>';
        }).join('') + (c.res.length > 4 ? '<li class="rc-sub">+' + (c.res.length - 4) + ' more teams</li>' : '');
        var pl = '', pp = planFor(here);
        if (pp) { var row = pp.rows.filter(function (x) { return x.planet === here && x.mission === mlabel(m, c.kind); })[0];
          var g = groupOf(here), gname = g.key === 'open' ? 'Plan for the planets open now' : 'Phase ' + (g.phase + 1) + ' plan';
          if (row && row.team) pl = '<p>' + gname + ' (no unit used twice): use <span class="rc-yes">' + esc(row.team) + '</span>. ' + pp.filled + ' of ' + pp.total + ' missions filled.</p>';
          else if (row && row.ready) pl = '<p><span class="rc-some-t">Clash:</span> your ready teams here use units the plan needs for other missions. ' + pp.filled + ' of ' + pp.total + ' missions can be filled.</p>';
          pl += openBox(here); }
        else if (BONUS[here] && !RC.open[here]) pl = '<p class="rc-sub">' + esc(pname(here)) + ' is a bonus planet, so it isn\'t in the phase plan until you tick it as open.</p>' + openBox(here);
        var src = c.src === 'guide' ? 'Checked against the Recommended teams below (with omicrons where they say so) and the mission\'s rules.'
          : c.src === 'manual' ? 'Checked against the mission\'s own rules.' : 'The guide has no teams for this mission, so the map\'s own team list is checked.';
        return '<p class="h4">Your roster</p><p class="rc-sub">' + src + '</p><p>' + who + (c.ready ? ' <span class="rc-yes">has a ready team</span>' : c.own ? ' <span class="rc-some-t">can field a legal team of their own, but not a guide team</span>' : ' <span class="rc-x">doesn\'t have a ready team yet</span>')
          + ' (' + esc(KIND[c.kind] || 'mission') + (c.kind === 'fleet' ? ', 7★ ships' : c.rel ? ', Relic ' + c.rel + '+' : '') + ')</p><ul class="rc-list">' + lines + '</ul>' + pl;
      }
    }
  });

  // ---------- ally code box and styles ----------
  function ui() {
    var css = document.createElement('style');
    css.textContent = 'img.mission.rc-ready{filter:drop-shadow(0 0 7px #3fb950) drop-shadow(0 0 3px #3fb950)}img.mission.rc-some{filter:drop-shadow(0 0 7px #d29922) drop-shadow(0 0 3px #d29922)}img.mission.rc-no{filter:drop-shadow(0 0 6px #f85149) grayscale(.5)}'
      + '#rc-box{position:fixed;bottom:10px;right:10px;z-index:50;background:rgba(10,14,24,.88);border:1px solid #33406a;border-radius:10px;padding:8px 10px;color:#dbe3f4;font:13px system-ui,sans-serif;text-align:left;max-width:300px}'
      + '#rc-box input{width:110px;background:#0d1322;color:#fff;border:1px solid #33406a;border-radius:6px;padding:3px 6px}#rc-box button{margin-left:4px;border-radius:6px;border:1px solid #1f6feb;background:#1f6feb;color:#fff;padding:3px 8px}#rc-box button.rc-clear{background:transparent;color:#8f9ab5;border-color:#33406a}'
      + '#rc-box .rc-msg{margin-top:5px;font-size:12px;color:#8f9ab5}.rc-yes{color:#3fb950;font-weight:700}.rc-some-t{color:#d29922;font-weight:700}.rc-x{color:#f85149;font-weight:700}.rc-list{text-align:left;padding-left:18px;margin:0}.rc-note p{margin:2px 0}[v-cloak]{display:none}.description img[style*="512px"]{max-width:100%;height:auto!important}.rc-sub{font-size:11px;color:#8f9ab5}'
      + '.rc-open{margin:4px 0;font-size:13px}.rc-open summary{cursor:pointer;color:#8cc8ff}.rc-tick{display:inline-block;margin:2px 10px 2px 0;white-space:nowrap}.rc-tick input{vertical-align:middle}@media (max-width:600px){img.mission{padding:12px;margin:-12px;box-sizing:content-box}.rc-tick{margin:6px 12px 6px 0}}';
    document.head.appendChild(css);
    var box = document.createElement('div');
    box.id = 'rc-box';
    box.innerHTML = '<label>Your ally code <input id="rc-ally" inputmode="numeric" placeholder="123-456-789"></label><button id="rc-go">Check</button><button class="rc-clear" id="rc-clear" title="Forget the ally code">✕</button><div class="rc-msg" id="rc-msg"></div>';
    document.body.appendChild(box);
    var inp = box.querySelector('#rc-ally'), msg = box.querySelector('#rc-msg');
    box.querySelector('#rc-go').onclick = function () { load(inp.value); };
    inp.onkeydown = function (e) { if (e.key === 'Enter') load(inp.value); };
    box.querySelector('#rc-clear').onclick = function () { try { localStorage.removeItem(KEY); } catch (e) {} if (load.ctl && load.ctl.abort) load.ctl.abort(); load.ctl = null; clearRoster(); RC.err = ''; RC.loading = false; inp.value = ''; };
    new Vue({ data: { RC: RC }, watch: { RC: { deep: true, immediate: true, handler: function () {
      msg.innerHTML = RC.loading ? 'Reading swgoh.gg…' : RC.err ? '<span class="rc-x">' + esc(RC.err) + '</span>'
        : RC.units ? esc(RC.name) + (RC.updated ? ' <span title="swgoh.gg roster sync">(swgoh.gg updated ' + esc(ago(RC.updated)) + ')</span>' : '') + ': <span class="rc-yes">green</span> = you have a recommended team at the level asked (not a promise it auto-wins), ' + '<span class="rc-some-t">amber</span> = ' + (isMain() ? 'some missions, ' : 'a legal lineup of your own but not a guide team, ') + '<span class="rc-x">red</span> = not yet.' : '';
    } } } });
    var saved = ''; try { saved = localStorage.getItem(KEY) || ''; } catch (e) {}
    if (saved) { inp.value = saved.replace(/(\d{3})(\d{3})(\d{3})/, '$1-$2-$3'); load(saved); }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', ui); else ui();
})();
