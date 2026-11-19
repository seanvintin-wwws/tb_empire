// Regression tests for GAC Scout+. Run: node --test tools/gac-scout/test/
// The script is loaded in a Node sandbox with globalThis.__gacScoutTest set, so it builds no overlay and exposes its
// internals. Each test builds a small, hand-made scout state for one known case.
const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs'), path = require('path'), vm = require('vm');
const SRC = fs.readFileSync(process.env.GAC_SRC || path.join(__dirname, '..', 'scout_plus.js'), 'utf8');

function load() {
  const T = {}, ls = new Map();
  const ctx = {
    __gacScoutTest: T, console,
    location: { hostname: 'swgoh.gg', pathname: '/' },
    localStorage: { getItem: k => (ls.has(k) ? ls.get(k) : null), setItem: (k, v) => ls.set(k, String(v)), removeItem: k => ls.delete(k) },
    setTimeout, clearTimeout,
  };
  vm.runInNewContext(SRC, ctx);
  assert.ok(T.plan, 'test hooks were not exposed');
  return T;
}
const plain = x => JSON.parse(JSON.stringify(x));
const unit = (id, o = {}) => ({ id, ship: false, gear: 13, relic: 7, stars: 7, power: 30000, zetas: 0, omis: 0, omi: [], gl: false, score: 20, spd: 0, ...o });
function mkS(T, { mine = [], theirs = [] } = {}) {
  const S = {
    me: { ally: '111111111', name: 'Me', units: {}, dcs: [], league: 'Kyber', division: 3 },
    opp: { ally: '222222222', name: 'Opp', units: {}, dcs: [] },
    myHist: { battles: [], rounds: [], seasons: [], fmt: '3v3' }, oppHist: { battles: [], rounds: [], seasons: [], fmt: '3v3' },
    G: {}, HU: null, INS: null, metaSG: {}, filter: 'own', rank: 'odds', keepGL: true, defSq: [], locked: new Set(), fleet: new Set(),
    all: [], H: {}, defs: [], unseen: [], atts: [], fleetSeen: {}, myFleetByCap: {}, myDefByLead: {}, span: 6, defaultBan: 60,
  };
  mine.forEach(u => (S.me.units[u.id] = u));
  theirs.forEach(u => (S.opp.units[u.id] = u));
  T.setNames(Object.fromEntries([...mine, ...theirs].map(u => [u.id, u.id])));
  T.setSets({ 1: { n: 'Test set', active: true, exp: 0 } });
  T.setS(S);
  return S;
}
const setDefence = (S, squads) => { S.defSq = squads.map(q => [...q]); S.locked = new Set(squads.flat()); };
const ins = (n, h, dBand = 3) => ({ n, h, scope: 'div', b: {}, dBand });

test('lead order counts: General Syndulla-led squad is not merged with the GL Ahsoka-led one', () => {
  const T = load();
  const S = mkS(T, { mine: [unit('SYNDULLA'), unit('EZRAEXILE'), unit('GLAHSOKA', { gl: true })] });
  setDefence(S, [['SYNDULLA', 'EZRAEXILE', 'GLAHSOKA']]);
  S.metaSG = T.metaMap([[18300, 0.23, 55, ['SYNDULLA', 'EZRAEXILE', 'GLAHSOKA']], [20000, 0.20, 55, ['GLAHSOKA', 'EZRAEXILE', 'SYNDULLA']]]);
  const cands = T.defenceCandidates(S);
  const mineC = cands.find(c => c.onDef);
  assert.strictEqual(mineC.sg.h, 0.23);
  assert.strictEqual(mineC.sgAlt[0].h, 0.20);
  const other = cands.find(c => c.squad[0] === 'GLAHSOKA');
  assert.ok(other && !other.onDef, 'the Ahsoka-led order is its own candidate, not "on your defence"');
  assert.strictEqual(other.sg.h, 0.20);
});

test('rated without a datacron never shows the with-datacron Insight figure (Rey / Ben / Cal 29% vs 15%)', () => {
  const T = load();
  const S = mkS(T, { mine: [unit('REY'), unit('BEN'), unit('CAL')] });
  T.ALIGN.REY = 'Light Side';
  S.me.dcs = [{ id: 'd1', s: 1, lv: 3, f: false, ab: [{ i: 3, type: 2, id: '', name: 'Light Side' }] }];
  const key = T.ldKey(['REY', 'BEN', 'CAL']);
  S.metaSG = T.metaMap([[5000, 0.15, 55, ['REY', 'BEN', 'CAL']]]);
  S.HU = { league: 'KYBER', season: 85, ctr: {}, mine: {}, meta: T.metaMap([[3000, 0.15, 55, ['REY', 'BEN', 'CAL']]]) };
  S.INS = { league: 'KYBER', dn: 3, ctr: {}, cand: { [key]: { dc: ins(400, 0.29) } } }; // the no-datacron read failed
  const c = T.defenceCandidates(S).find(x => T.ldKey(x.squad) === key);
  assert.ok(c.dc, 'a fitting datacron was found');
  assert.ok(c.no && c.no.fallback, 'the without-datacron rating is marked as a fallback');
  assert.notStrictEqual(c.no.meta.src, 'ins');
  assert.strictEqual(T.insEff(c), null, 'no Insight figure is claimed for the without-datacron rating');
  assert.ok(T.effS(c) < 0.2, `rated ${T.effS(c)}, should be about 15%, not 29%`);
});

test('a freed datacron is not loaned when its thin with-datacron figure is worse (Snowtrooper 16% -> 5%)', () => {
  // Veers' squad has datacron d1. The Snowtroopers were rated with d2, but the attack plan takes d2, so they come in
  // rated without one (16%). When Veers goes out, d1 is freed; its with-datacron figure is 5% of 165, so it must not be loaned.
  const T = load();
  const mineIds = ['VEERS', 'DARKTROOPER', 'STORMCONCEPT', 'SNOW', 'DTP', 'NIGHT', 'K1', 'K2', 'K3'];
  const S = mkS(T, { mine: mineIds.map(id => unit(id)), theirs: ['O1', 'O2', 'O3'].map(id => unit(id)) });
  mineIds.forEach(u => (T.ALIGN[u] = 'Dark Side'));
  const cron = id => ({ id, s: 1, lv: 3, f: false, ab: [{ i: 3, type: 2, id: '', name: 'Dark Side' }] });
  S.me.dcs = [cron('d1'), cron('d2')];
  setDefence(S, [['VEERS', 'DARKTROOPER', 'STORMCONCEPT']]);
  const kV = T.ldKey(['VEERS', 'DARKTROOPER', 'STORMCONCEPT']), kS = T.ldKey(['SNOW', 'DTP', 'NIGHT']), kO = T.ldKey(['O1', 'O2', 'O3']);
  S.defs = [{ lead: 'O1', squad: ['O1', 'O2', 'O3'], likely: 1, recent: true, n: 5, held: 1, holdRate: 0.2, rounds: new Set(), zone: null, ships: false, theirLv: 20 }];
  S.metaSG = T.metaMap([[1000, 0.16, 55, ['SNOW', 'DTP', 'NIGHT']]]);
  S.INS = { league: 'KYBER', dn: 3, cand: { [kV]: { dc: ins(800, 0.10) }, [kS]: { dc: ins(165, 0.05), no: ins(900, 0.16, 0) } },
    ctr: { [kO]: { scope: 'div', dBand: 0, b: { none: [], low: [[100, 0.8, 55, ['K1', 'K2', 'K3']]], high: [] } } } };
  S.defCands = T.defenceCandidates(S);
  T.plan(S);
  assert.strictEqual(S.plan[0].dcX && S.plan[0].dcX.dc.id, 'd2', 'the attack plan uses d2');
  const R = S.review;
  assert.strictEqual(R.swaps.length, 1, 'Veers is swapped for the Snowtroopers');
  const inC = R.swaps[0].in;
  assert.strictEqual(T.ldKey(inC.squad), kS);
  assert.notStrictEqual(inC.useDc, true, 'the freed datacron is not loaned');
  assert.ok(Math.abs(T.effS(inC) - 0.16) < 0.01, `rated ${T.effS(inC)}`);
});

test('ticking their actual defence makes the attack plan use exactly those teams', () => {
  const T = load();
  const S = mkS(T, { theirs: ['A1', 'A2', 'A3', 'B1', 'B2', 'B3', 'C1', 'C2', 'C3'].map(id => unit(id)) });
  const d = (lead, sq, likely, extra = {}) => ({ lead, squad: sq, likely, recent: true, n: 4, held: 1, holdRate: 0.25, rounds: new Set(), zone: null, ships: false, theirLv: 20, counters: [], ...extra });
  S.defs = [d('A1', ['A1', 'A2', 'A3'], 0.9), d('B1', ['B1', 'B2', 'B3'], 0.5)];
  S.unseen = [d('C1', ['C1', 'C2', 'C3'], 0, { unseen: true, n: 0 })];
  S.defCands = [];
  T.plan(S);
  assert.deepStrictEqual(plain(S.plan.map(p => p.d.lead)), ['A1', 'B1'], 'without ticks: their history');
  T.setSeen(['B1', 'C1']);
  T.plan(S);
  assert.deepStrictEqual(plain(S.plan.map(p => p.d.lead)), ['B1', 'C1'], 'with ticks: only the ticked teams, unseen ones included');
  T.setSeen([]);
  T.plan(S);
  assert.deepStrictEqual(plain(S.plan.map(p => p.d.lead)), ['A1', 'B1']);
});

test('fill from my last round takes the recent round with the most of your defence recorded, leader first, with zones and fleet', () => {
  const T = load();
  const ids = ['P1', 'P2', 'P3', 'Q1', 'Q2', 'Q3', 'R1', 'R2', 'R3'];
  const S = mkS(T, { mine: [...ids.map(id => unit(id)), unit('CAPSHIP', { ship: true }), unit('SHIPB', { ship: true })] });
  T.SHIP.CAPSHIP = 1; T.SHIP.SHIPB = 1; T.CAP.CAPSHIP = 1;
  const b = (r, def, zone) => ({ side: 'DEF', r, def, zone, zn: 4, att: ['X'], win: true });
  // three events: the oldest has the fullest round, but only the last two events count
  const oldest = '/p/1/gac-history/O500/1/', old = '/p/1/gac-history/O1000/3/', r2 = '/p/1/gac-history/O2000/2/', r3 = '/p/1/gac-history/O2000/3/';
  S.myHist.battles = [b(oldest, ['R1', 'R2', 'R3'], 0), b(oldest, ['P1', 'P2', 'P3'], 0), b(oldest, ['Q1', 'Q2', 'Q3'], 0), b(old, ['R1', 'R2', 'R3'], 0),
    b(r2, ['P1', 'P2', 'P3'], 0), b(r2, ['Q1', 'Q2', 'Q3'], 3), b(r2, ['Q1', 'Q2', 'Q3'], 3), b(r2, ['CAPSHIP', 'SHIPB'], 2),
    b(r3, ['R1', 'R2', 'R3'], 1)]; // their last opponent barely attacked
  S.myHist.rounds = [{ h: r2, season: 85, rn: 2, foe: 'Someone' }];
  const L = T.lastRoundDefence();
  assert.deepStrictEqual(plain(L.squads), [['P1', 'P2', 'P3'], ['Q1', 'Q2', 'Q3']]);
  assert.strictEqual(L.zones[T.ldKey(['P1', 'P2', 'P3'])], 'North');
  assert.strictEqual(L.zones[T.ldKey(['Q1', 'Q2', 'Q3'])], 'Trap');
  assert.deepStrictEqual(plain(L.ships).sort(), ['CAPSHIP', 'SHIPB']);
  assert.strictEqual(L.round.foe, 'Someone');
});

test('speed flag only when their team is clearly faster', () => {
  const T = load();
  const S = mkS(T, { mine: [unit('M1', { spd: 300 }), unit('M2', { spd: 250 })], theirs: [unit('T1', { spd: 345 }), unit('T2', { spd: 320 })] });
  const c = { squad: ['M1', 'M2'] };
  assert.match(T.speedH(c, { squad: ['T1'], ships: false }), /\+45/);
  assert.strictEqual(T.speedH(c, { squad: ['T2'], ships: false }), '');
  assert.strictEqual(T.speedH(c, { squad: ['T1'], ships: true }), '');
  void S;
});

test('roster compare: every unit A to Z, characters and ships in separate drop-downs', () => {
  const T = load();
  const S = mkS(T, { mine: [unit('ZEB'), unit('ADMIRAL'), unit('XWING', { ship: true })], theirs: [unit('BOBA')] });
  T.SHIP.XWING = 1;
  S.me.gp = S.opp.gp = 1; S.me.cgp = S.opp.cgp = 1; S.me.sgp = S.opp.sgp = 1;
  const h = T.viewRoster();
  const ch = h.slice(h.indexOf('<b>Characters</b>'), h.indexOf('<b>Ships</b>'));
  assert.ok(ch.indexOf('>ADMIRAL<') < ch.indexOf('>BOBA<') && ch.indexOf('>BOBA<') < ch.indexOf('>ZEB<'), 'characters A to Z');
  assert.ok(!ch.includes('XWING'), 'ships are not in the characters list');
  assert.ok(h.slice(h.indexOf('<b>Ships</b>')).includes('>XWING<'));
});

test('decision brief: short view, no expiry column, warnings only in the export', () => {
  const T = load();
  const S = mkS(T, { mine: [unit('REY'), unit('BEN'), unit('CAL')] });
  setDefence(S, [['REY', 'BEN', 'CAL']]);
  S.metaSG = T.metaMap([[5000, 0.15, 55, ['REY', 'BEN', 'CAL']]]);
  S.me.dcs = [{ id: 'd1', s: 1, lv: 3, f: false, ab: [] }];
  S.defCands = T.defenceCandidates(S);
  T.plan(S);
  const full = T.viewBrief();
  assert.ok(!/expires/i.test(full), 'no datacron expiry warnings');
  assert.ok(!full.includes('Warnings and gaps'), 'warnings are kept off the screen');
  T.setExporting(true);
  assert.ok(T.viewBrief().includes('Warnings and gaps'), 'but kept in the export');
  T.setExporting(false);
  T.store.briefShort = true;
  const short = T.viewBrief();
  assert.ok(short.includes('HotUtils · all leagues') && short.includes('KEEP'), 'short view has one line per squad');
  assert.ok(!short.includes('Defence as a package'));
});

test('stale defence: flagged when saved before this event started', () => {
  const T = load();
  const S = mkS(T, { mine: [unit('REY'), unit('BEN'), unit('CAL')] });
  setDefence(S, [['REY', 'BEN', 'CAL']]);
  T.store.myDefence = { saved: '2026-11-10T00:00:00Z' };
  T.setEvStart(Date.parse('2026-11-18T00:00:00Z'));
  assert.strictEqual(T.staleDefence().length, 1);
  T.store.myDefence = { saved: '2026-11-19T00:00:00Z' };
  assert.strictEqual(T.staleDefence().length, 0);
  void S;
});

test('HotUtils daily copy: feed rows are checked and trimmed', () => {
  const { trim, script } = require('../hotutils-fetch.js');
  const j = JSON.parse(fs.readFileSync(path.join(__dirname, 'fixtures', 'hotutils-kyber-3v3.json'), 'utf8'));
  const d = trim(j, '3v3', 'KYBER');
  assert.strictEqual(d.season, 85);
  assert.strictEqual(d.rows.length, j.rows.length);
  const [n, h, ban, units] = d.rows[0];
  assert.ok(n >= 100 && h >= 0 && h <= 1 && ban > 0 && units[0] === j.rows[0].units[0]);
  assert.throws(() => trim(j, '5v5', 'KYBER'), /expected 5v5/);
  const W = {};
  vm.runInNewContext(script(d), { window: W });
  assert.strictEqual(W.__gacScoutHU['3v3|KYBER'].rows.length, d.rows.length);
});

test('zones are North / South / Trap, and old saved zone names are renamed', () => {
  const T = {}, ls = new Map([['gacScoutPlus:settings', JSON.stringify({ defZones: { 'A>B,C': 'Front top', 'D>E,F': 'Front bottom', 'G>H,I': 'Back' } })]]);
  vm.runInNewContext(SRC, { __gacScoutTest: T, console, location: { hostname: 'swgoh.gg', pathname: '/' }, setTimeout, clearTimeout,
    localStorage: { getItem: k => (ls.has(k) ? ls.get(k) : null), setItem: (k, v) => ls.set(k, String(v)), removeItem: k => ls.delete(k) } });
  assert.deepStrictEqual(plain(T.store.defZones), { 'A>B,C': 'North', 'D>E,F': 'South', 'G>H,I': 'Trap' });
  assert.ok(!/Front top|Front bottom/.test(SRC.replace(/\/\/.*$/gm, '').replace(/'Front top': 'North', 'Front bottom': 'South'/, '')), 'no old zone names left in the tool');
});
