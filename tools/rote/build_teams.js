// Builds js/rote-teams.js: for every combat / special / fleet mission, the mission's rules (relic, alignment,
// faction, named units, max units) and the teams the roster check tests, as exact unit IDs.
// Teams come from the Nov 2026 guide (js/guide_data.js); where the guide has none, from the map's built-in teams.
// Run: node tools/rote/build_teams.js   (prints anything it couldn't match; fix the tables below and run again)
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..', '..');
const read = f => fs.readFileSync(path.join(ROOT, f), 'utf8');

// ---------- unit catalogue ----------
const W = {};
new Function('window', read('js/rote-units.js'))(W);
const CATS = W.ROTE_CATS;
const U = {}; // id -> {id, name, a, cats:Set, ship, cap}
let ship = false;
W.ROTE_UNITS.split('\n').forEach(l => {
  if (l === '#C') { ship = false; return; } if (l === '#S') { ship = true; return; }
  const [id, name, a, c] = l.split('|');
  U[id] = { id, name, a, ship, cap: ship && c === 'c', cats: new Set(ship ? [] : [...(c || '')].map(ch => CATS[parseInt(ch, 36)])) };
});
const norm = s => String(s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]/g, '');
const slug = n => String(n).toLowerCase().replace(/ /g, '_').replace(/"/g, '_');
const BYNORM = {}, BYSLUG = {};
Object.values(U).forEach(u => { BYNORM[norm(u.name)] = BYNORM[norm(u.name)] || u.id; BYSLUG[slug(u.name)] = u.id; });

// ---------- names used in the guide text -> unit IDs (arrays = any one of them) ----------
const CH = {
  // leads and GLs
  'lord vader': 'LORDVADER', 'darth vader': 'VADER', 'darth vader duels end': 'VADERDUELSEND', 'sith eternal emperor': 'SITHPALPATINE',
  'emperor palpatine': 'EMPERORPALPATINE', 'slkr': 'SUPREMELEADERKYLOREN', 'supreme leader kylo ren': 'SUPREMELEADERKYLOREN',
  'jedi master luke': 'GRANDMASTERLUKE', 'jedi master luke skywalker': 'GRANDMASTERLUKE', 'jml': 'GRANDMASTERLUKE',
  'jedi master kenobi': 'JEDIMASTERKENOBI', 'jmk': 'JEDIMASTERKENOBI', 'leia': 'GLLEIA', 'leia organa': 'GLLEIA', 'rey': 'GLREY',
  'ahsoka tano': 'GLAHSOKATANO', 'ahsoka tano gl': 'GLAHSOKATANO', 'pirate king hondo onaka': 'GLHONDO', 'pirate king hondo ohnaka': 'GLHONDO', 'pkho': 'GLHONDO',
  'jabba': 'JABBATHEHUTT', 'jedi master mace windu': 'JEDIMASTERMACEWINDU', 'mace': 'MACEWINDU', 'mace windu': 'MACEWINDU',
  'jedi knight cal kestis': 'JEDIKNIGHTCAL', 'jkck': 'JEDIKNIGHTCAL', 'executor': 'CAPITALEXECUTOR', 'leviathan': 'CAPITALLEVIATHAN',
  'profundity': 'CAPITALPROFUNDITY', 'negotiator': 'CAPITALNEGOTIATOR', 'home one': 'CAPITALMONCALAMARICRUISER', 'raddus': ['ADMIRALRADDUS', 'CAPITALRADDUS'],
  'aphra': 'DOCTORAPHRA', 'qira': 'QIRA', 'reva': 'THIRDSISTER', 'third sister': 'THIRDSISTER', 'baylan': 'BAYLANSKOLL',
  'bo katan mandalore': 'MANDALORBOKATAN', 'boss nass': 'BOSSNASS', 'cody': 'CC2224', 'rex': 'CT7567', 'general anakin skywalker': 'GENERALSKYWALKER',
  'great mothers': 'GREATMOTHERS', 'maul': 'MAULS7', 'maz kanata': 'MAZKANATA', 'mon mothma': 'MONMOTHMA', 'mother talzin': 'MOTHERTALZIN',
  'omega': 'OMEGAS3', 'satele shan': 'SATELESHAN', 'saw gerrera': 'SAWGERRERA', 'stormtrooper luke': 'STORMTROOPERLUKE', 'tarfful': 'TARFFUL',
  'the stranger': 'STRANGER', 'queen amidala': 'QUEENAMIDALA', 'carth onasi': 'CARTHONASI', 'cere junda': 'CEREJUNDA', 'cobb vanth': 'COBBVANTH',
  'finn': 'FINN', 'grand inquisitor': 'GRANDINQUISITOR', 'grand moff tarkin': 'GRANDMOFFTARKIN', 'kelleran beq': 'KELLERANBEQ',
  'dark trooper moff gideon': 'MOFFGIDEONS3',
  // others
  'gi': 'GRANDINQUISITOR', '7s': 'SEVENTHSISTER', '5b': 'FIFTHBROTHER', '8b': 'EIGHTHBROTHER', 'seventh sister': 'SEVENTHSISTER', 'ninth sister': 'NINTHSISTER',
  'marrok': 'MARROK', 'shin': 'SHINHATI', 'jango': 'JANGOFETT', 'zam': 'ZAMWESELL', 'l3': 'L3_37',
  'wat': 'WATTAMBOR', 'malak': 'DARTHMALAK', 'darth revan': 'DARTHREVAN', 'bane': 'DARTHBANE', 'the stranger ': 'STRANGER',
  'dark rey': 'DARKREY', 'd rey': 'DARKREY', 'drey': 'DARKREY', 'dark side rey': 'DARKREY', 'kru': 'KYLORENUNMASKED', 'kylo ren unmasked': 'KYLORENUNMASKED',
  'kylo ren': 'KYLOREN', 'sith trooper': 'FOSITHTROOPER', 'hux': 'GENERALHUX',
  'appo': 'APPO', 'cx': 'OPERATIVE', 'cx2': 'OPERATIVE', 'dct': 'DISGUISEDCLONETROOPER', 'scorch': 'SCORCH',
  'shoretrooper': 'SHORETROOPER', 'piett': 'ADMIRALPIETT', 'admiral piett': 'ADMIRALPIETT', 'thrawn': 'GRANDADMIRALTHRAWN',
  'gar saxon': 'GARSAXON', 'isc': 'IMPERIALSUPERCOMMANDO', 'imperial super commando': 'IMPERIALSUPERCOMMANDO', 'canderous': 'CANDEROUSORDO',
  'starkiller': 'STARKILLER', 'mara jade': 'MARAJADE', 'old ben': 'OLDBENKENOBI', 'visas': 'VISASMARR', 'malicos': 'TARONMALICOS',
  'hate fueled maul': 'MAULHATEFUELED', 'scavenger rey': 'REY', 'plo koon': 'PLOKOON',
  'scout trooper': 'SCOUTTROOPER_V3', 'captain enoch': 'CAPTAINENOCH', 'enoch': 'CAPTAINENOCH', 'death trooper': ['DEATHTROOPER', 'DEATHTROOPERPERIDEA'], 'moff gideon': 'MOFFGIDEONS1',
  'fennec': 'FENNECSHAND', 'night trooper': 'NIGHTTROOPER', 'nt': 'NIGHTTROOPER', 'death trooper peridea': 'DEATHTROOPERPERIDEA', 'dtp': 'DEATHTROOPERPERIDEA',
  'morgan': 'MORGANELSBETH', 'merrin': 'MERRIN', 'spirit': 'NIGHTSISTERSPIRIT', 'asajj': 'ASAJVENTRESS', 'daka': 'DAKA', 'zombie': 'NIGHTSISTERZOMBIE',
  'boba': ['BOBAFETT', 'BOBAFETTSCION'], 'krrsantan': 'KRRSANTAN', 'skiff lando': 'UNDERCOVERLANDO', 'booush': 'BOUSHH', 'boushh': 'BOUSHH',
  'bt1': 'BT1', '000': 'TRIPLEZERO', 'hk47': 'HK47', 'ig90': 'IG90', 'gg': 'GRIEVOUS',
  'hondo': 'HONDO', 'sm33': 'SM33', 'vane': 'VANE', 'silvo': 'CAPTAINSILVO', 'captain silvo': 'CAPTAINSILVO', 'brutus': 'BRUTUS', 'ithano': 'ITHANO', 'quiggold': 'QUIGGOLD', 'kix': 'KIX',
  'hera': 'HERASYNDULLAS3', 'sabine': ['PADAWANSABINE', 'SABINEWRENS3'], 'padawan sabine': 'PADAWANSABINE', 'huyang': 'HUYANG', 'fulcrum': 'FULCRUMAHSOKA',
  'ezra': ['EZRAEXILE', 'EZRABRIDGERS3'], 'ezra exile': 'EZRAEXILE', 'commander ahsoka tano': 'COMMANDERAHSOKA', 'cat': 'COMMANDERAHSOKA',
  'jtr': 'REYJEDITRAINING', 'jedi training rey': 'REYJEDITRAINING', 'ben': ['BENSOLO', 'OLDBENKENOBI'], 'ben solo': 'BENSOLO', 'bb8': 'BB8', 'c3po': 'C3POLEGENDARY',
  'han': 'HANSOLO', 'chewbacca': 'CHEWBACCALEGENDARY', 'chewpio': 'C3POCHEWBACCA', 'yoda and chewie': 'YODACHEWBACCA', 'yoda chewie': 'YODACHEWBACCA', 'clone wars chewie': 'CLONEWARSCHEWBACCA',
  'princess leia': 'PRINCESSLEIA', 'stormtrooper han': 'STORMTROOPERHAN',
  'captain rex': 'CAPTAINREX', 'capt rex': 'CAPTAINREX', 'echo': 'CT210408', 'fives': 'CT5555', 'arc trooper': 'ARCTROOPER501ST', 'tech': 'BADBATCHTECH',
  'pow': 'PADAWANOBIWAN', 'mqg': 'MASTERQUIGON', 'mqj': 'MASTERQUIGON', 'jka': 'ANAKINKNIGHT', 'cup': 'CORUSCANTUNDERWORLDPOLICE', 'gas': 'GENERALSKYWALKER',
  'gk': 'GENERALKENOBI', 'snips': 'AHSOKATANO', 'ahsoka': 'AHSOKATANO', 'padme': 'PADMEAMIDALA', 'shaak ti': 'SHAAKTI', 'kit': 'KITFISTO',
  'jocasta': 'JOCASTANU', 'jocasta nu': 'JOCASTANU', 'depa': 'DEPABILLABA', 'depa billaba': 'DEPABILLABA', 'aayla': 'AAYLASECURA', 'temple guard': 'VANGUARDTEMPLEGUARD',
  'jedi training leia': 'LEIAJEDITRAINING', 'leia jedi training': 'LEIAJEDITRAINING', 'jedi luke': 'JEDIKNIGHTLUKE', 'jkl': 'JEDIKNIGHTLUKE',
  'jedi knight luke skywalker': 'JEDIKNIGHTLUKE', 'hyoda': 'HERMITYODA', 'grand master yoda': 'GRANDMASTERYODA', 'kyle': 'KYLEKATARN', 'kyle katarn': 'KYLEKATARN',
  'luthen': 'LUTHENRAEL', 'cassian': 'CASSIANANDOR', 'cassian andor undercover': 'CASSIANUNDERCOVER', 'vel': 'VEL', 'kleya': 'KLEYA', 'drogan': 'CAPTAINDROGAN',
  'captain drogan': 'CAPTAINDROGAN', 'r2': 'R2D2_LEGENDARY', 'r2d2': 'R2D2_LEGENDARY', 'admiral raddus': 'ADMIRALRADDUS', 'r5d4': 'R5D4', 'baze': 'BAZEMALBUS',
  'rose': 'ROSETICO', 'poe': 'POE', 'rh finn': 'EPIXFINN', 'rh poe': 'EPIXPOE', 'zorii': 'ZORIIBLISS_V2',
  'paz': 'PAZVIZSLA', 'beskar mando': 'THEMANDALORIANBESKARARMOR', 'ig12grogu': 'IG12', 'regular bo katan': 'BOKATAN',
  'jedi knight revan': 'JEDIKNIGHTREVAN', 'bastila shan': 'BASTILASHAN', 'bastilla shan': 'BASTILASHAN', 'jolee bindo': 'JOLEEBINDO', 'juhani': 'JUHANI',
  'zaalbar': 'ZAALBAR', 'mission': 'MISSIONVAO', '5ort': '50RT', '5or t': '50RT', 'nebit': 'CHIEFNEBIT', 'jawa scavenger': 'JAWASCAVENGER', 'cara dune': 'CARADUNE',
  'crosshair': 'CROSSHAIRS3', 'wrecker': 'WRECKERS3', 'batcher': 'BATCHERS3', 'hunter': 'HUNTERS3',
  'darth vader duel s end': 'VADERDUELSEND'
};
const SH = {
  'ht': 'HOUNDSTOOTH', 'hounds tooth': 'HOUNDSTOOTH', 'rc': 'RAZORCREST', 'razor crest': 'RAZORCREST', 'punishing one': 'PUNISHINGONE', 'xb': 'XANADUBLOOD',
  'xanadu blood': 'XANADUBLOOD', 'slave 1': 'SLAVE1', 'slave one': 'SLAVE1', 'slave i': 'SLAVE1', 'ig2000': 'IG2000', 'ig 2000': 'IG2000',
  'gauntlet': 'GAUNTLETSTARFIGHTER', 'bomber': 'SITHBOMBER', 'sith bomber': 'SITHBOMBER', 'fci': 'FURYCLASSINTERCEPTOR', 'fury class interceptor': 'FURYCLASSINTERCEPTOR',
  'dorito': 'TIEDAGGER', 'tie dorito': 'TIEDAGGER', 'tie dagger': 'TIEDAGGER', 'assassin': 'SITHFIGHTER', 'sith fighter': 'SITHFIGHTER',
  'mk6 interceptor': 'SITHSUPREMACYCLASS', 'scimitar': 'SITHINFILTRATOR', 'tie advanced': 'TIEADVANCED',
  'mf': 'MILLENNIUMFALCON', 'hmf': 'MILLENNIUMFALCON', 'rey mf': 'MILLENNIUMFALCONEP7', 'ravens claw': 'RAVENSCLAW', 'outrider': 'OUTRIDER', 'phantom': 'PHANTOM2',
  'ghost': 'GHOST', 'cassian': 'UWINGROGUEONE', 'rogue 1': 'ROGUEONESHIP', 'rogue one': 'ROGUEONESHIP', 'biggs': 'XWINGRED3', 'wedge': 'XWINGRED2',
  'res bomber': 'MG100STARFORTRESSSF17', 'poes xwing': 'XWINGBLACKONE', 'comeuppance': 'COMEUPPANCE', 'res xwing': 'XWINGRESISTANCE',
  'jka': 'JEDISTARFIGHTERANAKIN', 'marauder': 'MARAUDER', 'plo': 'BLADEOFDORIN', 'ahsoka': 'JEDISTARFIGHTERAHSOKATANO', 'fives': 'UMBARANSTARFIGHTER', 'rex': 'ARC170REX',
  'y wing': 'YWINGREBEL'
};
// groups written as one word in the guide
const GROUP = {
  'ds clones': ['APPO', 'DISGUISEDCLONETROOPER', 'OPERATIVE', 'SCORCH'],
  'bad batch mercenaries': ['CROSSHAIRS3', 'WRECKERS3', 'HUNTERS3', 'BATCHERS3'],
  'other bad batch mercenaries': ['CROSSHAIRS3', 'WRECKERS3', 'HUNTERS3', 'BATCHERS3']
};
// "+2 Sith", "other gungans", "any 3 resistance": category words
const CATWORD = {
  sith: 'Sith', 'first order': 'First Order', rebels: 'Rebel', rebel: 'Rebel', resistance: 'Resistance', jedi: 'Jedi', 'other jedi': 'Jedi',
  gungans: 'Gungan', 'other gungans': 'Gungan', 'team of gungans': 'Gungan', spectre: 'Spectre', 'other spectre': 'Spectre', 'any spectre': 'Spectre',
  mercs: 'Mercenary', ns: 'Nightsister', 'galactic republic': 'Galactic Republic', gr: 'Galactic Republic', 'old republic': 'Old Republic',
  jv: 'Jedi Vanguard', constable: 'Constable', empire: 'Empire', ufus: 'Unaligned Force User', 'leftover sith': 'Sith',
  'whatever other first order you have': 'First Order'
};

// ---------- mission requirements ----------
const REQCAT = { jedi: 'Jedi', geonosian: 'Geonosian', 'light side wookiees': 'Wookiee', wookiees: 'Wookiee', empire: 'Empire', nightsisters: 'Nightsister',
  inquisitorius: 'Inquisitorius', pheonix: 'Phoenix', phoenix: 'Phoenix', mandalorians: 'Mandalorian', 'unaligned force users': 'Unaligned Force User',
  'clone troopers': 'Clone Trooper', 'rebel fighter': 'Rebel Fighter' };
const REQNAME = { 'lando s millenium falcon': 'MILLENNIUMFALCONPRISTINE', 'any cal kestis': ['JEDIKNIGHTCAL', 'CALKESTIS'], 'bo katan mand alor': 'MANDALORBOKATAN',
  'imperial tie fighter': 'TIEFIGHTERIMPERIAL', 'gauntlet starfighter': 'GAUNTLETSTARFIGHTER', 'qi ra': 'QIRA', 'the mandalorian beskar armor': 'THEMANDALORIANBESKARARMOR' };
const problems = [];
function lookupName(t) {
  const k = t.toLowerCase().replace(/[^a-z0-9 ]/g, ' ').replace(/\s+/g, ' ').trim();
  if (REQNAME[k]) return REQNAME[k];
  if (CH[k]) return CH[k];
  return BYNORM[norm(t)] || null;
}
function parseReq(lines, key) {
  const r = { rel: 0, align: null, cat: null, named: [], max: 5, ships: false, group: false };
  lines.forEach(line => {
    const t = String(line);
    const m = t.match(/Relic\s*(\d+)/i); if (m) r.rel = Math.max(r.rel, +m[1]);
    if (/7-Star/i.test(t)) r.ships = true;
    if (/Max Units:\s*(\d+)/i.test(t)) r.max = +t.match(/Max Units:\s*(\d+)/i)[1];
    // split at commas outside brackets: first part is the group, the rest are named units
    const parts = []; let depth = 0, cur = '';
    for (const ch of t) { if (ch === '(') depth++; if (ch === ')') depth--; if (ch === ',' && !depth) { parts.push(cur); cur = ''; } else cur += ch; }
    parts.push(cur);
    parts.forEach((p, i) => {
      const raw = p.replace(/\((Relic|7-Star|Max)[^)]*\)/gi, '').replace(/\+1 Mandalorian.*/i, '').trim();
      let s = p.replace(/\([^)]*\)/g, '').replace(/\+1 Mandalorian.*/i, '').trim();
      if (!s) return;
      if (raw && raw !== s && !/^5x/i.test(raw)) { const id0 = lookupName(raw); if (id0) { r.named.push(Array.isArray(id0) ? id0 : [id0]); return; } }
      if (/ships$/i.test(s)) { r.ships = true; if (/light side/i.test(s)) r.align = 'L'; if (/dark side/i.test(s)) r.align = 'D'; return; }
      if (/^5x\s/i.test(s) || i === 0) {
        const g = s.replace(/^5x\s*/i, '');
        if (/^5x\s/i.test(s)) r.group = true;
        if (/^characters$/i.test(g)) { r.group = true; return; }
        if (/light side or neutral/i.test(g)) { r.align = 'L'; r.group = true; return; }
        if (/dark side or neutral/i.test(g)) { r.align = 'D'; r.group = true; return; }
        const gc = REQCAT[g.toLowerCase()];
        if (gc) { r.cat = gc; r.group = true; if (/light side/i.test(g) || /Light side only/i.test(t)) r.alignStrict = 'L'; return; }
        if (i > 0 || !/^5x/i.test(s)) { /* falls through to a named unit, e.g. "Darth Vader (Relic 9+)" */ } else { problems.push(key + ': requirement group not understood: ' + g); return; }
      }
      const id = lookupName(s);
      if (id) r.named.push(Array.isArray(id) ? id : [id]); else problems.push(key + ': requirement unit not found: ' + s);
    });
    if (/Light side only/i.test(t)) r.alignStrict = 'L';
  });
  // how many units a ground team must have: 5, unless the mission caps it (Max Units) or only names its units
  // (Lord Vader solo, Cere + Cal). The game doesn't let you enter with fewer.
  r.size = r.ships ? 0 : r.max < 5 ? r.max : r.group ? 5 : (r.named.length || 5);
  return r;
}

// ---------- guide team text -> slots ----------
function cleanTok(t) {
  return t.replace(/\(e\.g\.[^)]*\)/gi, '').replace(/\((first|mandatory)\)/gi, '').replace(/\b(start|reinforcements)\s*:/gi, '')
    .replace(/\bstarting\b|\bin reinforcements\b|\breinforcements\b|\bstart\b/gi, '').trim();
}
function parseTeam(g, key, req) {
  const fleet = req.ships;
  const team = { label: (g.lead || '') + (g.with ? ' + ' + g.with : ''), slots: [], flex: [], fleet };
  let lead = String(g.lead || '').trim();
  let withTxt = String(g.with || '');
  const notes = String(g.notes || '');
  // lead text such as "Aphra (Hondo)", "Mace with Jedi Master Luke", "Omega with Bad Batch Mercenaries"
  let leadOmi = /lead omi/i.test(lead) || /lead omicron is mandatory|lead omi mandatory/i.test(notes);
  let leadExtra = [];
  let m;
  if ((m = lead.match(/^(.*?) with (.*)$/i))) { lead = m[1]; leadExtra = m[2].split(/ and |\//i); }
  const leadOmiTag = /\((omi|omicron)\)|\bomicron$/i.test(lead);
  lead = lead.replace(/\(([^)]*)\)/g, (x, inner) => /^(gl|omi|omicron|lead omi|full auto|no rc|clones|mf|r1 and mf|rogue one|starkiller|spider maul|ig.?90|jmk|ahsoka tano|hondo|rey|slkr|leia|rey\/cat|reva)$/i.test(inner.trim()) ? (/^gl$/i.test(inner.trim()) ? ' gl' : '') : x).trim();
  if (/^aphra|^qira|^third sister/i.test(lead)) lead = lead.replace(/\s*\(.*\)$/, '');
  leadExtra = leadExtra.map(x => x.replace(/omicron|\(omi\)/gi, '').trim()).filter(Boolean)
    .filter(x => { const k = x.toLowerCase().replace(/[^a-z0-9 ]/g, ' ').replace(/\s+/g, ' ').trim(); return !((GROUP[k] || CATWORD[k]) && withTxt.trim()); });
  const add = (tok, omi) => {
    const t = tok.toLowerCase().replace(/[’']/g, ' ').replace(/[^a-z0-9 ]/g, ' ').replace(/\s+/g, ' ').trim();
    if (!t) return true;
    if (GROUP[t]) { GROUP[t].forEach(id => team.slots.push({ ids: [id], omi: 0 })); return true; }
    let id = fleet ? (SH[t] || CH[t]) : CH[t];
    if (!id) id = BYNORM[norm(tok)] || null;
    if (!id) return false;
    team.slots.push({ ids: Array.isArray(id) ? id : [id], omi: omi || 0 });
    return true;
  };
  if (!add(lead, leadOmi ? 2 : leadOmiTag ? 1 : 0)) problems.push(key + ': lead not found: ' + g.lead);
  leadExtra.forEach(x => { if (!add(x, /depa/i.test(x) && /omicron/i.test(g.lead) ? 1 : 0)) problems.push(key + ': unit not found: ' + x + '  [' + team.label + ']'); });
  if (/depa billaba omicron/i.test(g.lead || '')) { const s = team.slots.find(s => s.ids[0] === 'DEPABILLABA'); if (s) s.omi = 1; }
  // body: drop sentences after a full stop that start a remark, and bracketed asides
  withTxt = withTxt.replace(/Yoda and Chewie/gi, 'Yoda & Chewie').replace(/(^|,)\s*and\s+/gi, '$1 ').replace(/\((use|e\.g)[^)]*\)/gi, '').replace(/\. (Millennium|I had)[^]*$/i, '').replace(/really speed this up/i, '');
  if (/^any r9s/i.test(withTxt)) withTxt = 'any 4';
  if (/^any resistance/i.test(withTxt)) withTxt = '+4 resistance';
  if (/^any$/i.test(withTxt.trim())) withTxt = '+4';
  const toks = withTxt.split(/,|\.|;| and (?=[A-Z])|\s(?=\+)/).map(cleanTok).filter(Boolean);
  toks.forEach(raw => {
    let tok = raw.trim();
    let omi = 0;
    if (/\((omi|omicron|o)\)|\bomi\b|omicron/i.test(tok)) { omi = 1; }
    const tarp = /tarpals? omi/i.test(tok);
    tok = tok.replace(/\((omi|omicron|o)\)/gi, '').replace(/\(tarpals? omi\)/i, '').replace(/\bomi\b/i, '').trim();
    if (tarp && /^tarpals?$/i.test(tok)) { team.slots.push({ ids: ['CAPTAINTARPALS'], omi: 1 }); return; }
    if (tarp) team.slots.push({ ids: ['CAPTAINTARPALS'], omi: 1 });
    // flexible slots
    let fm = tok.match(/^(?:\+|any\s*)(\d*)\s*(?:other\s+)?(.*)$/i) || tok.match(/^(\d)\s+other\s+(.*)$/i);
    if (/^any 5th$|^\+any$|^\+$/i.test(tok)) fm = [tok, '1', ''];
    if (fm && (/^[+]|^any|^\d other/i.test(tok))) {
      const n = +fm[1] || 1, w = (fm[2] || '').toLowerCase().trim();
      if (fleet) return; // fleet "+2 any": the listed ships are enough
      const cat = w && w !== 'any' && w !== 'r9s' ? CATWORD[w] : null;
      if (w && w !== 'any' && w !== 'r9s' && !cat) problems.push(key + ': flexible slot not understood: ' + tok);
      team.flex.push({ n, cat: cat || null });
      return;
    }
    const cw = CATWORD[tok.toLowerCase()];
    if (cw) { team.flex.push({ n: Math.max(1, 5 - team.slots.length - team.flex.reduce((a, f) => a + f.n, 0)), cat: cw }); return; }
    if (!add(tok, omi)) problems.push(key + ': unit not found: ' + tok + '  [' + team.label + ']');
  });
  // context fixes: Bad Batch Echo next to Tech/Hunter; Republic Y-wing with the Negotiator
  const has = id => team.slots.some(s => s.ids.includes(id));
  if (has('BADBATCHTECH')) team.slots.forEach(s => { if (s.ids[0] === 'CT210408') s.ids = ['BADBATCHECHO']; });
  if (has('CAPITALNEGOTIATOR')) team.slots.forEach(s => { if (s.ids[0] === 'YWINGREBEL') s.ids = ['YWINGCLONEWARS']; });
  if (has('OMEGAS3') === false && has('BADBATCHTECH')) team.slots.forEach(s => { if (s.ids[0] === 'HUNTERS3') s.ids = ['BADBATCHHUNTER']; if (s.ids[0] === 'WRECKERS3') s.ids = ['BADBATCHWRECKER']; });
  // a Mace Windu lead on missions that don't name Mace is Jedi Master Mace Windu
  if (team.slots[0] && team.slots[0].ids[0] === 'MACEWINDU' && !req.named.some(n => n.includes('MACEWINDU'))) team.slots[0].ids = ['JEDIMASTERMACEWINDU'];
  return team;
}
// map built-in team (slugs) -> slots
const ALIAS = {
  ahsoka_tano: 'AHSOKATANO', rey: 'GLREY', emperor: 'EMPERORPALPATINE', echo: 'BADBATCHECHO', bb_echo: 'BADBATCHECHO',
  beskar_mando: 'THEMANDALORIANBESKARARMOR', boba_soj: 'BOBAFETTSCION', boushh: 'BOUSHH', finn_o: 'FINN',
  geonosian_spy_starfighter: 'GEONOSIANSTARFIGHTER3', gl_jabba: 'JABBATHEHUTT', gl_kenobi: 'JEDIMASTERKENOBI',
  gl_kylo: 'SUPREMELEADERKYLOREN', gl_leia: 'GLLEIA', gl_luke: 'GRANDMASTERLUKE', gl_palp: 'SITHPALPATINE',
  gl_rey: 'GLREY', gl_vader: 'LORDVADER', ig12: 'IG12', jedi_cal: 'JEDIKNIGHTCAL', kyle_katarn_o: 'KYLEKATARN',
  mandalorbokatan: 'MANDALORBOKATAN', mara_jade_teh: 'MARAJADE', nute_gunrey: 'NUTEGUNRAY', paz_visla: 'PAZVIZSLA',
  sith_supremacy_class: 'SITHSUPREMACYCLASS', skiff_lando: 'UNDERCOVERLANDO', tie_interceptor: 'TIEINTERCEPTOR',
  triplezero: 'TRIPLEZERO', doctoraphra: 'DOCTORAPHRA', dark_trooper_moff_gideon: 'MOFFGIDEONS3', rolo: 'HOTHLEIA'
};
const OMI_SLUG = { finn_o: 1, kyle_katarn_o: 1 };
function mapTeam(sq, key, req, m) {
  const team = { label: sq.name, slots: [], flex: [], fleet: req.ships, src: 'map' };
  (sq.toons || []).forEach(s => {
    if (s === 'noone' || s === 'qi' || s === '') return;
    if (s === 'unknown') { team.flex.push({ n: 1, cat: null }); return; }
    let id = ALIAS[s] || BYSLUG[s] || BYNORM[norm(s)];
    if (s === 'jedi_cal' && m.allowEitherCal) id = ['JEDIKNIGHTCAL', 'CALKESTIS'];
    if (!id) { problems.push(key + ': built-in team unit not found: ' + s + ' [' + sq.name + ']'); return; }
    team.slots.push({ ids: Array.isArray(id) ? id : [id], omi: OMI_SLUG[s] || (s === 'jedi_cal' && /^o|omicron/i.test(sq.name) ? 2 : 0) });
  });
  return team;
}
// does a team satisfy the mission's rules? (named units present, every unit of the right side / faction)
function fitsUnit(id, req) {
  const u = U[id]; if (!u) return false;
  if (req.ships !== u.ship) return false;
  if (req.align && !(u.a === req.align || (!req.alignStrict && u.a === 'N'))) return false;
  if (req.alignStrict && u.a !== req.alignStrict) return false;
  if (req.cat && !u.cats.has(req.cat)) return false;
  return true;
}
function tidy(team, req) {
  // keep only the alternatives the mission allows (e.g. "Raddus" is the admiral on a ground mission)
  team.slots.forEach(s => { const n = req.named.find(n => s.ids.some(i => n.includes(i))); if (n) s.ids = n.slice(); });
  team.slots.forEach(s => { const f = s.ids.filter(id => fitsUnit(id, req) || req.named.some(n => n.includes(id))); if (f.length) s.ids = f; });
  // the same unit written twice ("Omega with Bad Batch Mercenaries + Crosshair, …")
  const seen = new Set(); team.slots = team.slots.filter(s => { const k = s.ids.join('/'); if (seen.has(k)) { const o = team.slots.find(x => x.ids.join('/') === k); o.omi = Math.max(o.omi, s.omi); return false; } seen.add(k); return true; });
  // guide teams leave out the unit the mission requires: add it
  req.named.forEach(n => { if (!team.slots.some(s => s.ids.some(i => n.includes(i)))) team.slots.push({ ids: n.slice(), omi: 0, req: 1 }); });
  // fewer units than the mission needs: fill the rest with any unit that meets its rules
  if (!req.ships) { const have = team.slots.length + team.flex.reduce((a, f) => a + f.n, 0); if (have < req.size) team.flex.push({ n: req.size - have, cat: null, fill: 1 }); }
  // more units than the mission allows: drop "any" slots first
  if (!req.ships) { let over = team.slots.length + team.flex.reduce((a, f) => a + f.n, 0) - req.max;
    for (let i = team.flex.length - 1; i >= 0 && over > 0; i--) { const d = Math.min(over, team.flex[i].n); team.flex[i].n -= d; over -= d; }
    team.flex = team.flex.filter(f => f.n > 0); }
}
function teamFits(team, req) {
  tidy(team, req);
  const why = [];
  const ok = id => {
    const u = U[id]; if (!u) return false;
    if (req.ships !== u.ship) return false;
    if (req.align && !(u.a === req.align || (!req.alignStrict && u.a === 'N'))) return false;
    if (req.alignStrict && u.a !== req.alignStrict) return false;
    if (req.cat && !u.cats.has(req.cat)) return false;
    return true;
  };
  team.slots.forEach(s => { if (!s.ids.some(ok)) why.push(s.ids.map(i => U[i] ? U[i].name : i).join('/') + ' doesn\'t meet the requirement'); });
  req.named.forEach(n => { if (!team.slots.some(s => s.ids.some(i => n.includes(i)))) why.push('missing required ' + n.map(i => U[i] ? U[i].name : i).join(' or ')); });
  if (!req.ships && team.slots.length + team.flex.reduce((a, f) => a + f.n, 0) > req.max) why.push('more than ' + req.max + ' units');
  return why;
}

// ---------- planets ----------
const GW = {}; new Function('window', read('js/guide_data.js'))(GW);
const GUIDE = GW.GUIDE;
function planet(file) {
  let o; const F = function () {}; F.component = (n, x) => { o = x; }; F.directive = F.mixin = () => {};
  new Function('Vue', 'window', read('js/' + file))(F, { matchMedia: () => ({ matches: false }) });
  return o.data();
}
// missions whose built-in teams are wrong and the guide has none: written out here
const MANUAL = {
  'malachor:c4': [{ label: 'Inquisitors: Eighth Brother, Fifth Brother, Seventh Sister + 2 Dark Side', slots: [['EIGHTHBROTHER'], ['FIFTHBROTHER'], ['SEVENTHSISTER']], flex: [{ n: 2, cat: null }] }]
};
const OUT = {}, report = [];
const skip = /^(main|roster-check|guide_data|vue|vue\.min|gac-scout-plus|rote-units|rote-teams)\.js$/;
fs.readdirSync(path.join(ROOT, 'js')).filter(f => f.endsWith('.js') && !skip.test(f)).sort().forEach(file => {
  const p = file.replace(/\.js$/, ''); let d;
  try { d = planet(file); } catch (e) { return; }
  if (!d || !d.missions) return;
  (d.missions || []).forEach(m => {
    if (m.type === 'platoon' || m.type === 'deploy') return;
    const key = p + ':' + m.name;
    const req = parseReq((m.reqs || []).map(i => d.reqs[i]), key);
    const kind = req.ships || m.type === 'fleet' ? 'fleet' : /special|reva/.test(m.type) ? 'special' : 'combat';
    let teams = [], src = 'guide';
    if (MANUAL[key]) { teams = MANUAL[key].map(t => ({ label: t.label, slots: t.slots.map(ids => ({ ids, omi: 0 })), flex: t.flex, fleet: false })); src = 'manual'; }
    else if (GUIDE[key] && GUIDE[key].length) teams = GUIDE[key].map(g => parseTeam(g, key, req));
    else { src = 'map'; teams = (m.preferredSquads || []).map(i => d.squads.find(s => s.id === i) || d.squads[i]).filter(Boolean).map(sq => mapTeam(sq, key, req, m)); }
    teams.forEach(t => { t.bad = teamFits(t, req); });
    // missions that only ask for a faction ("5x Light Side Wookiees"): also accept each guide lead with any other
    // qualifying units at the relic asked. Shown amber ("your own lineup"), not as the guide's team.
    if (req.cat && !req.ships) {
      const leads = new Set();
      teams.filter(t => !t.bad.length && t.slots[0]).forEach(t => {
        const lead = t.slots[0]; const k = lead.ids.join('/'); if (leads.has(k)) return; leads.add(k);
        const own = { label: lead.ids.map(i => U[i].name).join(' or ') + ' + any ' + (req.max - 1) + ' other ' + (req.alignStrict === 'L' ? 'Light Side ' : '') + ({ Jedi: 'Jedi', Empire: 'Empire units', Inquisitorius: 'Inquisitorius', Phoenix: 'Phoenix', 'Clone Trooper': 'Clone Troopers' }[req.cat] || req.cat + 's'),
          slots: [{ ids: lead.ids.slice(), omi: lead.omi }], flex: [{ n: req.max - 1, cat: req.cat }], fleet: false, own: true };
        own.bad = teamFits(own, req); if (!own.bad.length) teams.push(own);
      });
    }
    teams.forEach(t => {
      if (t.bad.length) report.push(key + ' [' + src + '] ' + t.label + ' -> ' + t.bad.join('; '));
    });
    OUT[key] = { kind, size: req.size, rel: req.rel, align: req.align, strict: req.alignStrict || null, cat: req.cat, named: req.named, max: req.max, ships: req.ships, src,
      teams: teams.map(t => ({ label: t.label, slots: t.slots.map(s => s.omi ? [s.ids, s.omi] : [s.ids]), flex: t.flex, own: t.own ? 1 : undefined, bad: t.bad.length ? t.bad : undefined })) };
  });
});
const header = '// Generated by tools/rote/build_teams.js from js/guide_data.js, the planet files and js/rote-units.js. Don\'t edit by hand.\n';
fs.writeFileSync(path.join(ROOT, 'js/rote-teams.js'), header + 'window.ROTE_TEAMS = ' + JSON.stringify(OUT) + ';\n');
console.log(Object.keys(OUT).length + ' missions, ' + Object.values(OUT).reduce((a, x) => a + x.teams.length, 0) + ' teams');
console.log('--- not understood (' + problems.length + ')'); problems.forEach(x => console.log('  ' + x));
console.log('--- teams that break the mission rules (' + report.length + ')'); report.forEach(x => console.log('  ' + x));
