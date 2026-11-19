/* Roster check for the Rise of the Empire map.
 * Enter an ally code and the map marks which combat missions that player can field one of the suggested teams for,
 * reading their units and relics live from swgoh.gg. On a planet page each mission gets a green (ready) or red
 * (not yet) glow, and its panel says which suggested team is ready or what's short. On the main map each planet
 * says how many of its combat missions are ready.
 * Load after vue.min.js and before the page's own script. Nothing is sent anywhere but swgoh.gg; the ally code is
 * remembered in this browser only.
 */
(function () {
  if (typeof Vue === 'undefined') return;
  var KEY = 'rote:allyCode';
  // map image names that don't match the unit's current in-game name (GLs, renamed units, old spellings)
  var ALIAS = {
    ahsoka_tano: 'AHSOKATANO', rey: 'GLREY', emperor: 'EMPERORPALPATINE', echo: 'BADBATCHECHO', bb_echo: 'BADBATCHECHO',
    beskar_mando: 'THEMANDALORIANBESKARARMOR', boba_soj: 'BOBAFETTSCION', boushh: 'BOUSHH', finn_o: 'FINN',
    geonosian_spy_starfighter: 'GEONOSIANSTARFIGHTER3', gl_jabba: 'JABBATHEHUTT', gl_kenobi: 'JEDIMASTERKENOBI',
    gl_kylo: 'SUPREMELEADERKYLOREN', gl_leia: 'GLLEIA', gl_luke: 'GRANDMASTERLUKE', gl_palp: 'SITHPALPATINE',
    gl_rey: 'GLREY', gl_vader: 'LORDVADER', ig12: 'IG12', jedi_cal: 'JEDIKNIGHTCAL', kyle_katarn_o: 'KYLEKATARN',
    mandalorbokatan: 'MANDALORBOKATAN', mara_jade_teh: 'MARAJADE', nute_gunrey: 'NUTEGUNRAY', paz_visla: 'PAZVIZSLA',
    sith_supremacy_class: 'SITHSUPREMACYCLASS', skiff_lando: 'UNDERCOVERLANDO', tie_interceptor: 'TIEINTERCEPTOR',
    triplezero: 'TRIPLEZERO', doctoraphra: 'DOCTORAPHRA', dark_trooper_moff_gideon: 'MOFFGIDEONS3',
    rolo: 'HOTHLEIA' // Rebel Officer Leia Organa (team lead on many light-side planets)
  };
  var SKIP = { noone: 1, qi: 1, '': 1 }; // empty slots in short teams
  // slots any of several units can fill: the best one owned counts (Zeffo unlock: Cere + either Cal)
  var EITHER = { jedi_cal: ['JEDIKNIGHTCAL', 'CALKESTIS'] };
  var OPEN = { unknown: 1 }; // "any qualifying unit" slots: can't be checked, so the team can't count as fully owned
  var slug = function (n) { return String(n).toLowerCase().replace(/ /g, '_').replace(/"/g, '_'); };
  var norm = function (n) { return String(n).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]/g, ''); };
  var ago = function (t) { var ms = Date.now() - Date.parse(t); if (!(ms >= 0)) return String(t).slice(0, 10); var h = Math.round(ms / 36e5); return h < 1 ? 'under an hour ago' : h < 48 ? h + ' h ago' : Math.round(h / 24) + ' days ago'; };
  var esc = function (s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
  var RC = Vue.observable({ ally: '', name: '', updated: '', units: null, bySlug: null, byNorm: null, loading: false, err: '', planets: {}, plans: {} });

  // ---------- roster ----------
  function load(ally) {
    ally = String(ally || '').replace(/\D/g, '');
    if (ally.length !== 9) { RC.err = 'An ally code has 9 digits.'; return; }
    if (load.ctl) load.ctl.abort();
    var ctl = load.ctl = typeof AbortController === 'function' ? new AbortController() : null;
    var timer = setTimeout(function () { if (ctl) ctl.abort(); }, 10000);
    RC.loading = true; RC.err = ''; RC.units = null; RC.planets = {}; RC.plans = {}; RC.updated = '';
    fetch('https://swgoh.gg/api/player/' + ally + '/', ctl ? { signal: ctl.signal } : {}).then(function (r) {
      if (!r.ok) throw new Error(r.status === 404 ? 'No player with that ally code on swgoh.gg.' : 'swgoh.gg answered ' + r.status + '. Roster not checked; try again in a minute.');
      return r.json();
    }).then(function (j) {
      if (load.ctl !== ctl) return; // a newer lookup has started
      if (!j || !Array.isArray(j.units) || !j.units.length || !(j.units[0].data || j.units[0]).base_id) throw new Error('swgoh.gg sent a roster in a format this map doesn\'t recognise. Roster not checked.');
      var units = {}, bySlug = {}, byNorm = {};
      (j.units || []).forEach(function (u) {
        var d = u.data || u, ship = d.combat_type === 2;
        units[d.base_id] = { id: d.base_id, name: d.name, ship: ship, stars: d.rarity, gear: d.gear_level, relic: !ship && d.gear_level === 13 ? Math.max(0, (d.relic_tier || 0) - 2) : 0 };
        bySlug[slug(d.name)] = d.base_id; byNorm[norm(d.name)] = d.base_id;
      });
      RC.units = units; RC.bySlug = bySlug; RC.byNorm = byNorm; RC.ally = ally; RC.name = (j.data && j.data.name) || ally;
      RC.updated = (j.data && (j.data.last_updated || j.data.updated)) || '';
      try { localStorage.setItem(KEY, ally); } catch (e) {}
      loadPlanets();
    }).catch(function (e) {
      if (load.ctl !== ctl) return;
      RC.err = e && e.name === 'AbortError' ? 'swgoh.gg didn\'t answer within 10 seconds. Roster not checked; try again.' : (e && e.message) || 'Couldn\'t reach swgoh.gg. Roster not checked.';
    }).then(function () { clearTimeout(timer); if (load.ctl === ctl) RC.loading = false; });
  }
  function unitFor(s) {
    if (SKIP[s]) return { skip: true };
    if (EITHER[s]) { var best = null; EITHER[s].forEach(function (id) { var u = RC.units[id]; if (u && (!best || u.relic > best.relic)) best = u; }); return best; }
    var id = ALIAS[s] || RC.bySlug[s] || RC.byNorm[norm(s)];
    return id && RC.units[id] ? RC.units[id] : null;
  }

  // ---------- missions ----------
  // the relic a mission asks for, from its requirement lines ("5x Geonosian (Relic 7+)" -> 7); ships need 7 stars
  function minRelic(m, reqs) {
    var r = 0;
    (m.reqs || []).forEach(function (i) { var t = reqs && reqs[i]; var x = t && String(t).match(/Relic\s*(\d+)/i); if (x) r = Math.max(r, +x[1]); });
    return r;
  }
  // a suggested team: is every unit owned at the level needed? (placeholders are ignored)
  function squadCheck(toons, rel) {
    var short = [], counted = 0, open = 0, ids = [];
    (toons || []).forEach(function (s) {
      if (OPEN[s]) { open++; return; }
      var u = unitFor(s);
      if (u && u.skip) return;
      counted++;
      if (u) ids.push(u.id);
      if (!u) short.push({ s: s, why: 'not unlocked, or name not recognised' });
      else if (u.ship) { if (u.stars < 7) short.push({ s: s, n: u.name, why: u.stars + '★, needs 7★' }); }
      else if (rel && u.relic < rel) short.push({ s: s, n: u.name, why: (u.gear === 13 ? 'R' + u.relic : 'G' + u.gear) + ', needs R' + rel });
    });
    // a team with open slots is at best partly checked: its named units can be owned, the rest isn't known
    return counted ? { ok: !short.length && !open, partial: !short.length && open > 0, open: open, short: short, ids: ids } : null;
  }
  function missionCheck(m, squads, reqs) {
    if (!RC.units || !m || m.type === 'platoon' || m.type === 'deploy' || !(m.preferredSquads || []).length) return null;
    var rel = minRelic(m, reqs), res = [];
    m.preferredSquads.forEach(function (i) {
      var sq = squads && squads[i]; if (!sq) return;
      var c = squadCheck(sq.toons, rel);
      if (c) res.push({ name: sq.name, ok: c.ok, partial: c.partial, open: c.open, short: c.short, ids: c.ids });
    });
    if (!res.length) return null;
    res.sort(function (a, b) { return (b.ok - a.ok) || (b.partial - a.partial) || a.short.length - b.short.length; });
    return { rel: rel, ready: res.some(function (r) { return r.ok; }), partial: res.some(function (r) { return r.partial; }), res: res };
  }

  // ---------- main map: count ready missions per planet, from each planet's own data ----------
  // the main map is the page whose missions link to planets
  function isMain() { return !!(window.ROTE_PLANET_LINKS && window.ROTE_PLANET_LINKS.length); }
  function planetData(link) {
    return fetch('../js/' + link.replace(/\.html$/, '.js')).then(function (r) { return r.text(); }).then(function (txt) {
      var opts = null, Fake = function () {};
      Fake.component = function (n, o) { opts = o; }; Fake.directive = Fake.mixin = function () {};
      new Function('Vue', 'window', txt)(Fake, { matchMedia: function () { return { matches: false }; } });
      return opts && typeof opts.data === 'function' ? opts.data() : null;
    });
  }
  // ---------- phase planner: a unit can only fight once per phase, across every planet in it ----------
  var PHASES = [['mustafar', 'corellia', 'coruscant'], ['geonosis', 'felucia', 'bracca'], ['dathomir', 'tatooine', 'kashyyyk', 'zeffo'],
    ['haven', 'kessel', 'lothal', 'mandalore'], ['malachor', 'vandor', 'kafrene'], ['deathstar', 'hoth', 'scarif']];
  var PNAME = { deathstar: 'Death Star', haven: 'Haven' };
  function pname(l) { l = l.replace(/\.html$/, ''); return PNAME[l] || l.charAt(0).toUpperCase() + l.slice(1); }
  function mlabel(m) { var x = String(m.name || '').match(/^([a-z])(\d+)$/i); return x ? (x[1].toLowerCase() === 's' ? 'special ' : 'combat ') + x[2] : (m.name || 'mission'); }
  function phaseOf(link) { var b = link.replace(/\.html$/, ''); for (var i = 0; i < PHASES.length; i++) if (PHASES[i].indexOf(b) >= 0) return i; return -1; }
  // pick one ready team per mission so no unit is used twice; search for the most missions filled
  function plan(items) {
    items = items.slice().sort(function (a, b) { return a.opts.length - b.opts.length; });
    var best = { n: -1, pick: [] }, used = {}, pick = [], budget = 20000;
    (function go(i, n) {
      if (--budget < 0) return;
      if (n + (items.length - i) <= best.n) return;
      if (i === items.length) { best = { n: n, pick: pick.slice() }; return; }
      items[i].opts.forEach(function (o) {
        if (o.ids.some(function (id) { return used[id]; })) return;
        o.ids.forEach(function (id) { used[id] = 1; }); pick[i] = o;
        go(i + 1, n + 1);
        o.ids.forEach(function (id) { delete used[id]; }); pick[i] = null;
      });
      pick[i] = null; go(i + 1, n);
    })(0, 0);
    return items.map(function (it, i) { return { planet: it.planet, mission: it.mission, ready: it.opts.length > 0, team: best.pick[i] ? best.pick[i].name : '' }; });
  }
  function planPhases() {
    PHASES.forEach(function (ps, pi) {
      var items = [], missing = false;
      ps.forEach(function (b) {
        var d = DATA[b + '.html']; if (!d) { missing = true; return; }
        (d.missions || []).forEach(function (m) {
          var c = missionCheck(m, d.squads, d.reqs); if (!c) return;
          items.push({ planet: b, mission: mlabel(m), opts: c.res.filter(function (r) { return r.ok; }) });
        });
      });
      if (missing || !items.length) return;
      var r = plan(items), filled = r.filter(function (x) { return x.team; }).length, ready = r.filter(function (x) { return x.ready; }).length;
      Vue.set(RC.plans, pi, { filled: filled, ready: ready, total: r.length, rows: r });
    });
  }
  function planNote(link) {
    var pi = phaseOf(link), p = RC.plans[pi]; if (!p) return '';
    var clash = p.rows.filter(function (x) { return x.ready && !x.team; });
    var mine = p.rows.filter(function (x) { return x.planet === link.replace(/\.html$/, ''); }).sort(function (a, b) { return a.mission < b.mission ? -1 : 1; });
    return '<p class="h4">Phase ' + (pi + 1) + ' plan</p><p>Without reusing a unit, you can fill <b>' + p.filled + ' of ' + p.total + '</b> combat missions across the phase'
      + (clash.length ? ' (<span class="rc-some-t">' + clash.length + (clash.length === 1 ? ' more is' : ' more are') + ' ready on its own but needs units used elsewhere</span>: ' + clash.map(function (x) { return esc(pname(x.planet) + ' ' + x.mission); }).join(', ') + ')' : '') + '.</p>'
      + '<ul class="rc-list">' + mine.map(function (x) { return '<li>' + esc(x.mission) + ': ' + (x.team ? '<span class="rc-yes">' + esc(x.team) + '</span>' : x.ready ? '<span class="rc-some-t">units needed elsewhere</span>' : '<span class="rc-x">no ready team</span>') + '</li>'; }).join('') + '</ul>'
      + '<p class="rc-sub">Uses only teams the map lists, fully owned at the relic asked. Platoon units aren\'t counted.</p>';
  }
  var DATA = {};
  function loadPlanets() {
    var links = {};
    var list = isMain() ? window.ROTE_PLANET_LINKS : (PHASES[phaseOf(String(window.GUIDE_PLANET || ''))] || []).map(function (b) { return b + '.html'; });
    list.forEach(function (l) { links[l] = 1; });
    Object.keys(links).forEach(function (link) {
      planetData(link).then(function (d) {
        if (!d) return;
        DATA[link] = d;
        var ready = 0, total = 0;
        (d.missions || []).forEach(function (m) { var c = missionCheck(m, d.squads, d.reqs); if (c) { total++; if (c.ready) ready++; } });
        Vue.set(RC.planets, link, { ready: ready, total: total });
        planPhases();
      }).catch(function () {});
    });
  }

  // ---------- hooks used by the page templates ----------
  Vue.mixin({
    // the pages define a phone check (mq) but never ran it, so phones got the desktop hover behaviour
    mounted: function () { if (typeof this.mq === 'function' && this.isMobile === false) this.mq(); },
    created: function () { if (this.missions) { var l = this.missions.map(function (m) { return m.planetlink; }).filter(Boolean); if (l.length) { window.ROTE_PLANET_LINKS = l; if (RC.units) loadPlanets(); } } },
    methods: {
      rcClass: function (m) {
        if (!RC.units || !m) return '';
        if (m.planetlink) { var p = RC.planets[m.planetlink]; return !p || !p.total ? '' : p.ready === p.total ? 'rc-ready' : p.ready ? 'rc-some' : 'rc-no'; }
        var c = missionCheck(m, this.squads, this.reqs);
        return c ? (c.ready ? 'rc-ready' : c.partial ? 'rc-some' : 'rc-no') : '';
      },
      rcNote: function (m) {
        if (!RC.units || !m) return '';
        var who = '<b>' + esc(RC.name) + '</b>';
        if (m.planetlink) {
          var p = RC.planets[m.planetlink];
          return p && p.total ? '<p class="h4">Your roster</p><p>' + who + ': ready for <b>' + p.ready + ' of ' + p.total + '</b> combat missions here (a suggested team at the relic level asked). Open the planet for details.</p>' + planNote(m.planetlink) : '';
        }
        var c = missionCheck(m, this.squads, this.reqs);
        if (!c) return '';
        var lines = c.res.slice(0, 3).map(function (r) {
          if (r.partial) return '<li><span class="rc-some-t">◐</span> ' + esc(r.name) + ': named units owned; ' + r.open + ' more slot' + (r.open === 1 ? '' : 's') + ' not checked (any unit meeting the requirement)</li>';
          return r.ok ? '<li><span class="rc-yes">✓</span> ' + esc(r.name) + '</li>'
            : '<li><span class="rc-x">✕</span> ' + esc(r.name) + ': ' + r.short.slice(0, 3).map(function (x) { return esc(x.n || x.s.replace(/_/g, ' ')) + ' (' + esc(x.why) + ')'; }).join(', ') + (r.short.length > 3 ? ', +' + (r.short.length - 3) + ' more' : '') + '</li>';
        }).join('');
        var pl = '', pp = window.GUIDE_PLANET && RC.plans[phaseOf(String(window.GUIDE_PLANET))];
        if (pp) { var row = pp.rows.filter(function (x) { return x.planet === window.GUIDE_PLANET && x.mission === mlabel(m); })[0];
          if (row && row.team) pl = '<p>Phase ' + (phaseOf(String(window.GUIDE_PLANET)) + 1) + ' plan (no unit used twice across the phase): use <span class="rc-yes">' + esc(row.team) + '</span>. ' + pp.filled + ' of ' + pp.total + ' phase missions filled.</p>';
          else if (row && row.ready) pl = '<p><span class="rc-some-t">Phase clash:</span> your ready teams here use units the phase plan needs for other missions. ' + pp.filled + ' of ' + pp.total + ' phase missions can be filled.</p>'; }
        return '<p class="h4">Your roster</p><p class="rc-sub">Checked against the map\'s built-in team list. The Recommended teams table below is community text and isn\'t checked.</p><p>' + who + (c.ready ? ' <span class="rc-yes">owns a suggested team</span>' : c.partial ? ' <span class="rc-some-t">owns part of a suggested team</span>' : ' <span class="rc-x">doesn\'t own a suggested team yet</span>') + (c.rel ? ' (Relic ' + c.rel + '+)' : '') + '</p><ul class="rc-list">' + lines + '</ul>' + pl;
      }
    }
  });

  // ---------- ally code box and styles ----------
  function ui() {
    var css = document.createElement('style');
    css.textContent = 'img.mission.rc-ready{filter:drop-shadow(0 0 7px #3fb950) drop-shadow(0 0 3px #3fb950)}img.mission.rc-some{filter:drop-shadow(0 0 7px #d29922) drop-shadow(0 0 3px #d29922)}img.mission.rc-no{filter:drop-shadow(0 0 6px #f85149) grayscale(.5)}'
      + '#rc-box{position:fixed;bottom:10px;right:10px;z-index:50;background:rgba(10,14,24,.88);border:1px solid #33406a;border-radius:10px;padding:8px 10px;color:#dbe3f4;font:13px system-ui,sans-serif;text-align:left;max-width:300px}'
      + '#rc-box input{width:110px;background:#0d1322;color:#fff;border:1px solid #33406a;border-radius:6px;padding:3px 6px}#rc-box button{margin-left:4px;border-radius:6px;border:1px solid #1f6feb;background:#1f6feb;color:#fff;padding:3px 8px}#rc-box button.rc-clear{background:transparent;color:#8f9ab5;border-color:#33406a}'
      + '#rc-box .rc-msg{margin-top:5px;font-size:12px;color:#8f9ab5}.rc-yes{color:#3fb950;font-weight:700}.rc-some-t{color:#d29922;font-weight:700}.rc-x{color:#f85149;font-weight:700}.rc-list{text-align:left;padding-left:18px;margin:0}.rc-note p{margin:2px 0}[v-cloak]{display:none}.description img[style*="512px"]{max-width:100%;height:auto!important}.rc-sub{font-size:11px;color:#8f9ab5}@media (max-width:600px){img.mission{padding:12px;margin:-12px;box-sizing:content-box}}';
    document.head.appendChild(css);
    var box = document.createElement('div');
    box.id = 'rc-box';
    box.innerHTML = '<label>Your ally code <input id="rc-ally" inputmode="numeric" placeholder="123-456-789"></label><button id="rc-go">Check</button><button class="rc-clear" id="rc-clear" title="Forget the ally code">✕</button><div class="rc-msg" id="rc-msg"></div>';
    document.body.appendChild(box);
    var inp = box.querySelector('#rc-ally'), msg = box.querySelector('#rc-msg');
    box.querySelector('#rc-go').onclick = function () { load(inp.value); };
    inp.onkeydown = function (e) { if (e.key === 'Enter') load(inp.value); };
    box.querySelector('#rc-clear').onclick = function () { try { localStorage.removeItem(KEY); } catch (e) {} RC.units = null; RC.name = ''; RC.planets = {}; RC.plans = {}; inp.value = ''; };
    new Vue({ data: { RC: RC }, watch: { RC: { deep: true, immediate: true, handler: function () {
      msg.innerHTML = RC.loading ? 'Reading swgoh.gg…' : RC.err ? '<span class="rc-x">' + esc(RC.err) + '</span>'
        : RC.units ? esc(RC.name) + (RC.updated ? ' <span title="swgoh.gg roster sync">(swgoh.gg updated ' + esc(ago(RC.updated)) + ')</span>' : '') + ': <span class="rc-yes">green</span> = you own a suggested team at the required relic (not a promise it auto-wins), <span class="rc-some-t">amber</span> = ' + (isMain() ? 'some missions' : 'partly') + ', <span class="rc-x">red</span> = not yet.' : '';
    } } } });
    var saved = ''; try { saved = localStorage.getItem(KEY) || ''; } catch (e) {}
    if (saved) { inp.value = saved.replace(/(\d{3})(\d{3})(\d{3})/, '$1-$2-$3'); load(saved); }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', ui); else ui();
})();
