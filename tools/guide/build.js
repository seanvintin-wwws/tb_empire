// Builds js/guide_data.js from guide_raw.json, keyed "planet:missionName" as used in the old tool.
const fs = require('fs');
const raw = JSON.parse(fs.readFileSync(__dirname + '/guide_raw.json', 'utf8'));
const old = JSON.parse(fs.readFileSync(__dirname + '/old.json', 'utf8'));

// guide mission title -> list of old-tool missions (planet:class name)
const MAP = {
  'P1 DS Left (Nute)': ['mustafar:c3'], 'P1 DS Bot (Wat)': ['mustafar:c1'], 'P1 DS Top (Geo)': ['mustafar:c5'],
  'P1 DS LV': ['mustafar:c2'], 'P1 DS Fleet': ['mustafar:c6'],
  'P1 Mixed Qira': ['corellia:c5'], 'P1 Mixed Combat': ['corellia:c3'], 'P1 Mixed Jabba': ['corellia:c1'],
  'P1 Mixed Aphra': ['corellia:c2'], 'P1 Mixed Fleet': ['corellia:c6'],
  'P1 LS Combat': ['coruscant:c3', 'coruscant:c5'], 'P1 LS Mace/Kit': ['coruscant:c1'], 'P1 LS Jedi': ['coruscant:c2'], 'P1 LS Fleet': ['coruscant:c6'],
  'P2 DS → (Nexu)': ['geonosis:c1'], 'P2 DS ↓ (Acklay)': ['geonosis:c2'], 'P2 DS ← (Reek)': ['geonosis:c3'],
  'P2 DS Fleet': ['geonosis:c6'], 'P2 DS Geos': ['geonosis:c5'],
  'P2 Mixed Hondo': ['felucia:c5'], 'P2 Mixed Y Lando': ['felucia:c2'], 'P2 Mixed Jabba': ['felucia:c1'],
  'P2 Mixed Combat': ['felucia:c3'], 'P2 Mixed Fleet': ['felucia:c6'],
  'P2 LS Left (CH)': ['bracca:c1'], 'P2 LS Right (2S)': ['bracca:c3'], 'P2 LS Zeffo': ['bracca:c4'],
  'P2 LS Jedi': ['bracca:c2'], 'P2 LS Fleet': ['bracca:c6'],
  'P3 DS Combat': ['dathomir:c2', 'dathomir:c6'], 'P3 DS Empire': ['dathomir:c3'], 'P3 DS Dr Aphra': ['dathomir:c1'], 'P3 DS Merrin': ['dathomir:c8'],
  'P3 Mixed BK': ['tatooine:c5'], 'P3 Mixed Reva': ['tatooine:c4'], 'P3 Mixed Combat': ['tatooine:c6'],
  'P3 Mixed Fennec': ['tatooine:c3'], 'P3 Mixed Jabba': ['tatooine:c2'], 'P3 Mixed Fleet': ['tatooine:c1'],
  'P3 LS Saw': ['kashyyyk:c8'], 'P3 LS Left': ['kashyyyk:c3'], 'P3 LS Right (Mara)': ['kashyyyk:c2'],
  'P3 LS Wookies': ['kashyyyk:c6'], 'P3 LS Fleet': ['kashyyyk:c1'],
  'P4 DS Inquisitors': ['haven:c3'], 'P4 DS Mid/Bot/Rt': ['haven:c1', 'haven:c2', 'haven:c6'], 'P4 DS Top Left': ['haven:c4'],
  'P4 Mixed Qira/L3': ['kessel:c3'], 'P4 Mixed Combat': ['kessel:c2', 'kessel:c6'], 'P4 Mixed Jabba': ['kessel:c4'], 'P4 Mixed Fleet': ['kessel:c1'],
  'P4 LS Combat': ['lothal:c2'], 'P4 LS Jedi': ['lothal:c1'], 'P4 LS Fleet': ['lothal:c6'], 'P4 LS Phoenix': ['lothal:c3'],
  'P5 DS Left': ['malachor:c1'], 'P5 DS Top Mid': ['malachor:c2'], 'P5 DS Right': ['malachor:c6'], 'P5 DS Inqs': ['malachor:c4'],
  'P5 Mixed Top Right': ['vandor:c2'], 'P5 Mixed Bottom Left': ['vandor:c4'], 'P5 Mixed Jabba': ['vandor:c6'],
  'P5 Mixed Fleet': ['vandor:c1'], 'P5 Mixed Young Han': ['vandor:c3'],
  'P5 LS Top Left': ['kafrene:c3'], 'P5 LS Top Mid': ['kafrene:c6'], 'P5 LS Bottom': ['kafrene:c4'],
  'P5 LS Ships': ['kafrene:c1'], 'P5 LS Cassian': ['kafrene:c2'],
  'P6 DS Generic Left': ['deathstar:c3', 'deathstar:c4'], 'P6 DS Iden': ['deathstar:c6'], 'P6 DS Darth Vader': ['deathstar:c2'], 'P6 DS Fleets': ['deathstar:c1'],
  'P6 Mixed Top Mid (Wampa)': ['hoth:c2'], 'P6 Mixed Bottom Left': ['hoth:c3'], 'P6 Mixed Jabba': ['hoth:c6'], 'P6 Mixed Fleet': ['hoth:c1'],
  'P6 LS Generic': ['scarif:c3', 'scarif:c4'], 'P6 LS Baze': ['scarif:c6'], 'P6 LS Cassian': ['scarif:c2'], 'P6 LS Ships': ['scarif:c1'],
  'Zeffo Jedi': ['zeffo:c8'], 'Zeffo Clones': ['zeffo:c3'], 'Zeffo UFU': ['zeffo:c2'], 'Zeffo Combat': ['zeffo:c6'], 'Zeffo Fleet': ['zeffo:c1'],
  'Mandalore DTMG': ['mandalore:c6'], 'Mandalore Fleet': ['mandalore:c1'], 'Mandalore Bo Katan': ['mandalore:c3'], 'Mandalore Combat': ['mandalore:c2'],
};

const RATE = { A: '✅ 2/2', B: '👍 ~90%', C: '⚠️ ~75%', D: '➖ 1/2' };
const HOW = { t: 'Target at battle start', p: 'Pause & target in wave 2', m: 'Manual play needed' };
const tidy = s => (s || '').replace(/\s+/g, ' ').replace(/\s+,/g, ',').replace(/,\s*$/, '').trim();

// Units a special mission requires. Within the same phase (all planets played together, including
// the bonus planet), teams elsewhere that use these units are dropped, because each unit can only be
// used once per phase. Patterns are matched against the team leader and "with" text, not notes.
const PHASES = [
  ['mustafar', 'corellia', 'coruscant'],
  ['geonosis', 'felucia', 'bracca'],
  ['dathomir', 'tatooine', 'kashyyyk', 'zeffo'],
  ['haven', 'kessel', 'lothal', 'mandalore'],
  ['malachor', 'vandor', 'kafrene'],
  ['deathstar', 'hoth', 'scarif'],
];
const JABBA = /\bjabba\b/i, APHRA = /\baphra\b/i, QIRA = /\bqi'?ra\b/i, YHAN = /young han|\bYHS\b/i;
const RESERVED = {
  'mustafar:c2': [/\blord vader\b|\bLV\b/i],
  'corellia:c1': [JABBA], 'corellia:c2': [APHRA], 'corellia:c5': [QIRA, YHAN],
  'coruscant:c1': [/(?<!master )\bmace\b(?! windu \(jedi master)/i, /\bkit\b|kit fisto/i],
  'felucia:c1': [JABBA], 'felucia:c2': [/young lando|\bY ?Lando\b/i], 'felucia:c5': [/(?<!king )\bhondo\b/i],
  'bracca:c4': [/\bcere\b/i, /\bJKCK\b|cal kestis|\bcal\b/i],
  'dathomir:c1': [APHRA], 'dathomir:c8': [/\bmerrin\b/i],
  'tatooine:c2': [JABBA], 'tatooine:c3': [/\bfennec\b/i],
  'tatooine:c5': [/bo[- ]?katan|\bBKM\b|\bBAM\b|beskar/i],
  'kashyyyk:c8': [/\bsaw\b/i, /kyle( katarn)?\b|\bKK\b/i, /capt(ain)?\.? rex/i, /\bluthen\b/i, /\bdrogan\b/i], 'kashyyyk:c6': [/tarf+ul|\bchewbacca\b|\bchewie\b|chewpio|zaalbar|\bCWC\b/i],
  'zeffo:c8': [/\bJKCK\b|cal kestis|\bcal\b/i],
  'haven:c3': [/third sister|\breva\b/i],
  'kessel:c3': [QIRA, /\bL3(-37)?\b/i], 'kessel:c4': [JABBA],
  'mandalore:c3': [/bo[- ]?katan|\bBKM\b|\bBAM\b/i], 'mandalore:c6': [/dark trooper moff gideon|\bDTMG\b/i],
  'mandalore:c1': [/gauntlet/i],
  'malachor:c4': [/eighth brother|\b8B\b|fifth brother|\b5B\b|seventh sister|\b7S\b/i],
  'vandor:c3': [YHAN, /vandor chew/i], 'vandor:c6': [JABBA],
  'kafrene:c2': [/cassian/i, /\bK-?2(SO)?\b/i],
  'deathstar:c2': [/darth vader(?! duel)/i], 'deathstar:c6': [/\biden\b/i],
  'hoth:c4': [APHRA, /\bBT-?1\b/i, /0-0-0|\b000\b/i], 'hoth:c6': [JABBA],
  'scarif:c2': [/cassian/i, /\bK-?2(SO)?\b/i, /\bpao\b/i], 'scarif:c6': [/\bbaze\b/i, /chirrut/i, /pathfinder|\bSRP\b/i],
};
// Mission notes shown above the team list.
const NOTES = {
  'tatooine:c4': 'Low priority: everyone already has Reva. Put your effort into the Dark Side missions instead, using Inquisitor teams with Marrok and his omicron.',
};
// Manual team lists that replace the guide's for a mission (guild-confirmed picks).
const OVERRIDES = {
  'kashyyyk:c8': [{ lead: 'Saw Gerrera', with: 'Kyle Katarn, Captain Rex, Luthen, Drogan', how: '',
    notes: 'Auto, deselect targeting reticule at the beginning.' }],
  'kashyyyk:c6': [{ lead: 'Tarfful', with: 'Yoda and Chewie, Chewbacca, Chewpio, Clone Wars Chewie', how: '',
    notes: '2/2 on auto (guild tested). Much easier with Yoda and Chewie. You want decent mods on CWC.' }],
};
const phaseOf = p => PHASES.findIndex(g => g.includes(p));
const removed = [];
function clash(key, row) {
  const [p] = key.split(':'); const text = row.lead + ' | ' + row.with;
  for (const [rk, pats] of Object.entries(RESERVED)) {
    if (rk === key || phaseOf(rk.split(':')[0]) !== phaseOf(p)) continue;
    for (const re of pats) if (re.test(text)) return rk + ' ' + re;
  }
  return null;
}

const out = {};
const problems = [];
for (const m of raw) {
  const keys = MAP[m.m];
  if (!keys) { problems.push('unmapped guide mission: ' + m.m); continue; }
  // Only keep teams rated 2/2 on auto (A). Interaction notes (target/pause/manual) are kept.
  const rows = m.t.filter(t => t[1][0] === 'A').map(t => ({
    lead: tidy(t[0]),
    with: tidy(t[2]),
    how: t[1].slice(1).split('').map(c => HOW[c]).filter(Boolean).join('; '),
    notes: tidy(t[3]).replace(/^(auto|full auto|easy auto|easy full auto)$/i, ''),
  }));
  // Drop empty-detail entries when the same leader already has a full team listed.
  for (let i = rows.length - 1; i >= 0; i--) {
    if (!rows[i].with && rows.some((r, j) => j !== i && r.lead === rows[i].lead && r.with)) rows.splice(i, 1);
  }
  // Meta update: Jedi Master Luke leads always run Jedi Training Leia.
  for (const r of rows) {
    if (!/^jedi master luke\b/i.test(r.lead) || /jedi training leia|\bJTL\b/i.test(r.with)) continue;
    const items = (r.with ? r.with.split(',') : []).flatMap(x => x.trim().split(/\s+(?=\+\d)/)).map(x => x.trim()).filter(Boolean);
    if (items.length >= 4) {
      // Make room: drop a "+N" filler first, otherwise the last member not named in the team title.
      let i = items.findIndex(x => /^\+\d/.test(x));
      if (i < 0) { i = items.length - 1; while (i > 0 && r.lead.toUpperCase().replace('MQJ','MQG').includes(items[i].toUpperCase().replace('MQJ','MQG'))) i--; }
      items.splice(i, 1);
    }
    r.with = ['Jedi Training Leia', ...items].join(', ');
  }
  // Drop duplicate teams (same leader and members).
  for (let i = rows.length - 1; i >= 0; i--) {
    if (rows.findIndex(r => r.lead === rows[i].lead && r.with === rows[i].with) !== i) rows.splice(i, 1);
  }
  if (!rows.length) problems.push('no 2/2 team: ' + m.m);
  for (const k of keys) {
    const [p, c] = k.split(':');
    if (!old[p] || !old[p].missions.find(x => x.name === c)) problems.push('missing old mission ' + k);
    // Stand-ins: swap a reserved unit for an alternative instead of dropping the whole team.
    for (const r of rows) {
      if (/\bdrogan\b/i.test(r.with) && clash(k, r) && /drogan/.test(clash(k, r))) {
        r.with = r.with.replace(/\bdrogan\b/i, 'Admiral Raddus');
        r.notes = (r.notes ? r.notes + '. ' : '') + 'Drogan is saved for the Saw mission, so Raddus replaces him';
      }
    }
    out[k] = rows.filter(r => { const c = clash(k, r); if (c) removed.push(k + ': ' + r.lead + ' + ' + r.with + '   <- needed for ' + c); return !c; });
  }
}
// old combat/fleet missions with no guide data
for (const [p, d] of Object.entries(old)) for (const ms of d.missions) {
  if (['platoon', 'deploy'].includes(ms.type)) continue;
  if (!out[p + ':' + ms.name]) { out[p + ':' + ms.name] = []; problems.push('no guide data: ' + p + ':' + ms.name + ' (' + ms.type + ')'); }
}
Object.assign(out, OVERRIDES);
const updated = process.argv[2] || new Date().toISOString().slice(0, 10);
const js = '// Recommended teams per mission, taken from https://swgohrote.com/ (' + updated + ').\n' +
  '// Generated file: key is "planet:mission" matching the mission names in each planet file.\n' +
  'window.GUIDE_UPDATED = ' + JSON.stringify(updated) + ';\n' +
  'window.GUIDE = ' + JSON.stringify(out, null, 1) + ';\n' +
  'window.GUIDE_NOTES = ' + JSON.stringify(NOTES, null, 1) + ';\n';
fs.writeFileSync(__dirname + '/../../js/guide_data.js', js);
console.log(removed.join('\n'));
console.log('missions written:', Object.keys(out).length);
console.log(problems.join('\n'));
