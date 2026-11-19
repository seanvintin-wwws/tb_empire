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
    triplezero: 'TRIPLEZERO', doctoraphra: 'DOCTORAPHRA', dark_trooper_moff_gideon: 'MOFFGIDEONS3'
  };
  var SKIP = { noone: 1, unknown: 1, qi: 1, rolo: 1, '': 1 };
  var slug = function (n) { return String(n).toLowerCase().replace(/ /g, '_').replace(/"/g, '_'); };
  var norm = function (n) { return String(n).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]/g, ''); };
  var esc = function (s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
  var RC = Vue.observable({ ally: '', name: '', units: null, bySlug: null, byNorm: null, loading: false, err: '', planets: {} });

  // ---------- roster ----------
  function load(ally) {
    ally = String(ally || '').replace(/\D/g, '');
    if (ally.length !== 9) { RC.err = 'An ally code has 9 digits.'; return; }
    RC.loading = true; RC.err = '';
    fetch('https://swgoh.gg/api/player/' + ally + '/').then(function (r) {
      if (!r.ok) throw new Error(r.status === 404 ? 'No player with that ally code on swgoh.gg.' : 'swgoh.gg answered ' + r.status + '. Try again in a minute.');
      return r.json();
    }).then(function (j) {
      var units = {}, bySlug = {}, byNorm = {};
      (j.units || []).forEach(function (u) {
        var d = u.data || u, ship = d.combat_type === 2;
        units[d.base_id] = { name: d.name, ship: ship, stars: d.rarity, gear: d.gear_level, relic: !ship && d.gear_level === 13 ? Math.max(0, (d.relic_tier || 0) - 2) : 0 };
        bySlug[slug(d.name)] = d.base_id; byNorm[norm(d.name)] = d.base_id;
      });
      RC.units = units; RC.bySlug = bySlug; RC.byNorm = byNorm; RC.ally = ally; RC.name = (j.data && j.data.name) || ally;
      try { localStorage.setItem(KEY, ally); } catch (e) {}
      if (isMain()) loadPlanets();
    }).catch(function (e) { RC.err = e.message || 'Could not reach swgoh.gg.'; }).then(function () { RC.loading = false; });
  }
  function unitFor(s) {
    if (SKIP[s]) return { skip: true };
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
    var short = [], counted = 0;
    (toons || []).forEach(function (s) {
      var u = unitFor(s);
      if (u && u.skip) return;
      counted++;
      if (!u) short.push({ s: s, why: 'not unlocked' });
      else if (u.ship) { if (u.stars < 7) short.push({ s: s, n: u.name, why: u.stars + '★, needs 7★' }); }
      else if (rel && u.relic < rel) short.push({ s: s, n: u.name, why: (u.gear === 13 ? 'R' + u.relic : 'G' + u.gear) + ', needs R' + rel });
    });
    return counted ? { ok: !short.length, short: short } : null;
  }
  function missionCheck(m, squads, reqs) {
    if (!RC.units || !m || m.type === 'platoon' || m.type === 'deploy' || !(m.preferredSquads || []).length) return null;
    var rel = minRelic(m, reqs), res = [];
    m.preferredSquads.forEach(function (i) {
      var sq = squads && squads[i]; if (!sq) return;
      var c = squadCheck(sq.toons, rel);
      if (c) res.push({ name: sq.name, ok: c.ok, short: c.short });
    });
    if (!res.length) return null;
    res.sort(function (a, b) { return a.short.length - b.short.length; });
    return { rel: rel, ready: res.some(function (r) { return r.ok; }), res: res };
  }

  // ---------- main map: count ready missions per planet, from each planet's own data ----------
  function isMain() { return /\/main\.html$|\/html\/?$/.test(location.pathname); }
  function planetData(link) {
    return fetch('../js/' + link.replace(/\.html$/, '.js')).then(function (r) { return r.text(); }).then(function (txt) {
      var opts = null, Fake = function () {};
      Fake.component = function (n, o) { opts = o; }; Fake.directive = Fake.mixin = function () {};
      new Function('Vue', 'window', txt)(Fake, { matchMedia: function () { return { matches: false }; } });
      return opts && typeof opts.data === 'function' ? opts.data() : null;
    });
  }
  function loadPlanets() {
    var links = {};
    (window.ROTE_PLANET_LINKS || []).forEach(function (l) { links[l] = 1; });
    Object.keys(links).forEach(function (link) {
      planetData(link).then(function (d) {
        if (!d) return;
        var ready = 0, total = 0;
        (d.missions || []).forEach(function (m) { var c = missionCheck(m, d.squads, d.reqs); if (c) { total++; if (c.ready) ready++; } });
        Vue.set(RC.planets, link, { ready: ready, total: total });
      }).catch(function () {});
    });
  }

  // ---------- hooks used by the page templates ----------
  Vue.mixin({
    created: function () { if (this.missions && isMain()) window.ROTE_PLANET_LINKS = this.missions.map(function (m) { return m.planetlink; }).filter(Boolean); },
    methods: {
      rcClass: function (m) {
        if (!RC.units || !m) return '';
        if (m.planetlink) { var p = RC.planets[m.planetlink]; return !p || !p.total ? '' : p.ready === p.total ? 'rc-ready' : p.ready ? 'rc-some' : 'rc-no'; }
        var c = missionCheck(m, this.squads, this.reqs);
        return c ? (c.ready ? 'rc-ready' : 'rc-no') : '';
      },
      rcNote: function (m) {
        if (!RC.units || !m) return '';
        var who = '<b>' + esc(RC.name) + '</b>';
        if (m.planetlink) {
          var p = RC.planets[m.planetlink];
          return p && p.total ? '<p class="h4">Your roster</p><p>' + who + ': ready for <b>' + p.ready + ' of ' + p.total + '</b> combat missions here (a suggested team at the relic level asked). Open the planet for details.</p>' : '';
        }
        var c = missionCheck(m, this.squads, this.reqs);
        if (!c) return '';
        var lines = c.res.slice(0, 3).map(function (r) {
          return r.ok ? '<li><span class="rc-yes">✓</span> ' + esc(r.name) + '</li>'
            : '<li><span class="rc-x">✕</span> ' + esc(r.name) + ': ' + r.short.slice(0, 3).map(function (x) { return esc(x.n || x.s.replace(/_/g, ' ')) + ' (' + esc(x.why) + ')'; }).join(', ') + (r.short.length > 3 ? ', +' + (r.short.length - 3) + ' more' : '') + '</li>';
        }).join('');
        return '<p class="h4">Your roster</p><p>' + who + (c.ready ? ' <span class="rc-yes">has a suggested team ready</span>' : ' <span class="rc-x">isn\'t ready yet</span>') + (c.rel ? ' (Relic ' + c.rel + '+)' : '') + '</p><ul class="rc-list">' + lines + '</ul>';
      }
    }
  });

  // ---------- ally code box and styles ----------
  function ui() {
    var css = document.createElement('style');
    css.textContent = 'img.mission.rc-ready{filter:drop-shadow(0 0 7px #3fb950) drop-shadow(0 0 3px #3fb950)}img.mission.rc-some{filter:drop-shadow(0 0 7px #d29922) drop-shadow(0 0 3px #d29922)}img.mission.rc-no{filter:drop-shadow(0 0 6px #f85149) grayscale(.5)}'
      + '#rc-box{position:fixed;top:8px;right:8px;z-index:50;background:rgba(10,14,24,.88);border:1px solid #33406a;border-radius:10px;padding:8px 10px;color:#dbe3f4;font:13px system-ui,sans-serif;text-align:left;max-width:300px}'
      + '#rc-box input{width:110px;background:#0d1322;color:#fff;border:1px solid #33406a;border-radius:6px;padding:3px 6px}#rc-box button{margin-left:4px;border-radius:6px;border:1px solid #1f6feb;background:#1f6feb;color:#fff;padding:3px 8px}#rc-box button.rc-clear{background:transparent;color:#8f9ab5;border-color:#33406a}'
      + '#rc-box .rc-msg{margin-top:5px;font-size:12px;color:#8f9ab5}.rc-yes{color:#3fb950;font-weight:700}.rc-x{color:#f85149;font-weight:700}.rc-list{text-align:left;padding-left:18px;margin:0}.rc-note p{margin:2px 0}';
    document.head.appendChild(css);
    var box = document.createElement('div');
    box.id = 'rc-box';
    box.innerHTML = '<label>Your ally code <input id="rc-ally" inputmode="numeric" placeholder="123-456-789"></label><button id="rc-go">Check</button><button class="rc-clear" id="rc-clear" title="Forget the ally code">✕</button><div class="rc-msg" id="rc-msg"></div>';
    document.body.appendChild(box);
    var inp = box.querySelector('#rc-ally'), msg = box.querySelector('#rc-msg');
    box.querySelector('#rc-go').onclick = function () { load(inp.value); };
    inp.onkeydown = function (e) { if (e.key === 'Enter') load(inp.value); };
    box.querySelector('#rc-clear').onclick = function () { try { localStorage.removeItem(KEY); } catch (e) {} RC.units = null; RC.name = ''; RC.planets = {}; inp.value = ''; };
    new Vue({ data: { RC: RC }, watch: { RC: { deep: true, immediate: true, handler: function () {
      msg.innerHTML = RC.loading ? 'Reading swgoh.gg…' : RC.err ? '<span class="rc-x">' + esc(RC.err) + '</span>'
        : RC.units ? esc(RC.name) + ': <span class="rc-yes">green</span> = a suggested team is ready, <span class="rc-x">red</span> = not yet' + (isMain() ? ', amber = some.' : '. Tap a mission for details.') : '';
    } } } });
    var saved = ''; try { saved = localStorage.getItem(KEY) || ''; } catch (e) {}
    if (saved) { inp.value = saved.replace(/(\d{3})(\d{3})(\d{3})/, '$1-$2-$3'); load(saved); }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', ui); else ui();
})();
