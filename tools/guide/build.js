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
  'kashyyyk:c8': [/\bsaw\b/i, /\bvel\b/i, /\bkleya\b/i, /\bluthen\b/i, /cassian/i, /kyle( katarn)?\b|\bKK\b/i, /\bdrogan\b/i], 'kashyyyk:c6': [/tarf+ul|\bchewbacca\b|\bchewie\b|chewpio|zaalbar|\bCWC\b/i],
  'zeffo:c8': [/\bJKCK\b|cal kestis|\bcal\b/i, /jedi master luke|\bJML\b/i],
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
  'zeffo:c3': 'Captain Rex is essential here (a test with Kix instead lost in wave 1). Only do this once Saw on Kashyyyk is done with the Vel team; otherwise Captain Rex is already used.',
  'zeffo:c2': 'Do this one FIRST in Zeffo, and use a Galactic Legend (Rey or Ahsoka Tano). Very few units are valid here, and without a GL you will struggle.',
  'tatooine:c4': 'Low priority: everyone already has Reva. Put your effort into the Dark Side missions instead, using Inquisitor teams with Marrok and his omicron.',
};
// Manual team lists that replace the guide's for a mission (guild-confirmed picks).
const OVERRIDES = {
  'zeffo:c2': [
    { lead: 'Rey', with: 'Commander Ahsoka Tano, Ben Solo, Cere Junda, Jedi Training Rey', how: 'Target purge troopers',
      notes: 'CAT is mandatory. swgohrote.com rates this about 70% on full auto, higher if you target purge troopers.' },
    { lead: 'Ahsoka Tano (GL)', with: 'Cere Junda, Padawan Sabine, Fulcrum, Commander Ahsoka Tano', how: 'Target purge trooper in wave 1',
      notes: 'swgohrote.com rates this about 75% on auto. Without CAT it usually only gets 1/2.' },
  ],
  'zeffo:c3': [
    { lead: 'Rex', with: 'Captain Rex, Echo, ARC Trooper, Fives', how: 'Clear the target reticule at the start; in wave 2 put it on the Consular (her counterattacks hurt)',
      notes: 'Auto. swgohrote.com rates this about 75%.' },
    { lead: 'Cody', with: 'Captain Rex, Rex, Echo, Fives', how: '',
      notes: 'Full auto. Most-voted community team on swgohrote.com (not yet rated). Needs Cody at Relic 7+.' },
  ],
  'mustafar:c6': [{ lead: 'Leviathan', with: 'Sith Bomber, MK6 Interceptor, Sith Fighter, TIE Advanced, Scimitar', how: '', notes: '' }],
  'dathomir:c3': [{ lead: 'Lord Vader', with: 'Appo (omicron), CX-2, Disguised Clone Trooper, Scorch', how: '',
    notes: "Dark side clone troopers. Auto, don't use Piett." }],
  'tatooine:c1': [{ lead: 'Executor', with: "Start: Hound's Tooth, Razor Crest, Xanadu Blood. Reinforcements: IG-2000 (first), Slave I, +2 any (e.g. Ebon Hawk, Lando's Millennium Falcon)",
    how: 'Target TIE Advanced first, then TIE Bomber, then TIE Fighter Pilot',
    notes: 'Bring in IG-2000 as the first reinforcement. The last two reinforcements rarely matter; you usually win before you need them.' }],
  'kashyyyk:c8': [
    { lead: 'Saw Gerrera', with: 'Kyle Katarn (omicron), Captain Rex, Luthen, Drogan', how: 'Clear the target reticule at the start',
      notes: 'Use this until Vel has her omicron. It uses Captain Rex, so skip Zeffo Clones.' },
    { lead: 'Saw Gerrera', with: 'Vel (omicron), Kleya, Luthen, Cassian Andor (Undercover)', how: '',
      notes: 'Switch to this once Vel has her omicron (all Relic 7+). It frees Captain Rex for Zeffo Clones.' },
  ],
  'kashyyyk:c6': [{ lead: 'Tarfful', with: 'Yoda and Chewie, Chewbacca, Chewpio, Clone Wars Chewie', how: '',
    notes: '2/2 on auto (guild tested). Much easier with Yoda and Chewie. You want decent mods on CWC.' }],
};
// Guild edits to the guide's list for a mission: drop teams by leader, and move a leader to the top.
const SEE_HAVEN = { lead: 'Sith Eternal Emperor', with: 'Malak, The Stranger, Darth Revan, Bane', how: '',
  notes: 'swgohrote.com rates this about 90% on auto. Needs all platoons. Use The Stranger instead of Dooku to make it consistent. Use this when Lord Vader is needed for platoons.' };
const SLKR_HAVEN = { lead: 'Supreme Leader Kylo Ren', with: 'Dark Side Rey, Kylo Ren (Unmasked), Hux, Sith Trooper', how: 'Manual play needed',
  notes: "Guild tested: only 1/2 (clears wave 1, about 219k points). swgohrote.com says manual play and full platoons are needed. Wait until all 6 operations (platoons) are done before attempting: that disables the enemy's Hope buff, which otherwise gives them up to 100% Turn Meter and 3 Morale at the start. Only use it if you're short a team, for the partial points." };
const INQ_HAVEN = { lead: 'Third Sister (Reva)', with: 'Grand Inquisitor, Seventh Sister, Ninth Sister, Marrok (omicron)', how: '',
  notes: "Full auto, 2/2 (guild tested). Marrok's omicron is what makes it work. Third Sister and Marrok are also needed for the Inquisitor special mission, and each unit can only be used once per phase, so pick one." };
const EDITS = {
  'haven:c1': { add: [[0, INQ_HAVEN], [2, SEE_HAVEN], [99, SLKR_HAVEN]] }, 'haven:c2': { add: [[0, INQ_HAVEN], [2, SEE_HAVEN], [99, SLKR_HAVEN]] }, 'haven:c6': { add: [[0, INQ_HAVEN], [2, SEE_HAVEN], [99, SLKR_HAVEN]] },
  'mustafar:c1': { drop: [/dark trooper moff gideon/i, /emperor palpatine/i], top: /pirate king hondo/i },
  'lothal:c1': { top: /^jedi master mace windu/i, note: [[/^jedi master mace windu/i, 'Use this first: super easy full auto, and it saves your GLs (Jedi Master Luke, Jedi Master Kenobi) for elsewhere']] },
  'lothal:c2': { top: /^ahsoka tano/i, note: [[/^ahsoka tano/i, 'Use this first: by this point most teams are used, and Ahsoka carries any leftover units']] },
  'vandor:c4': { add: [[0, { lead: 'Leia Organa', with: 'Admiral Raddus, R2-D2, Captain Drogan, R5-D4', how: '',
    notes: 'Easy win (guild tested). Use this here and save Pirate King Hondo for the Dark Side planet.' }]] },
  'lothal:c6': { top: /^home one/i, note: [
    [/^home one/i, 'Use this one here: Profundity is needed for the Kessel fleet mission in the same phase (if you have no Executor for Kessel).'],
    [/^negotiator/i, 'Better saved for the Zeffo fleet mission.'],
    [/^profundity/i, 'Better saved for the Kessel fleet mission (same phase) if you have no Executor.']] },
  'zeffo:c8': { drop: [/.*/], add: [
    [0, { lead: 'Jedi Knight Cal Kestis', with: 'Jedi Master Luke Skywalker, Leia (Jedi Training), Jedi Knight Luke Skywalker, Grand Master Yoda', how: '',
      notes: 'Easy full auto (guild tested). Cal Kestis lead omicron is mandatory; Whirlwind Slam helps. Keep Ezra (Exile) for the Ahsoka team on Lothal.' }],
    [1, { lead: 'Jedi Knight Cal Kestis', with: 'Jedi Master Luke Skywalker, Grand Master Yoda, Jedi Knight Luke Skywalker, Shaak Ti', how: '',
      notes: 'auto, lead omi mandatory, probably want Whirlwind Slam as well' }]] },
  'dathomir:c2': { drop: [/dark trooper moff gideon/i, /grand moff tarkin/i], fill: [[/pirate king hondo/i, 'SM-33, Captain Silvo, Vane (omicron), Brutus']] },
  'dathomir:c6': { drop: [/dark trooper moff gideon/i, /grand moff tarkin/i], fill: [[/pirate king hondo/i, 'SM-33, Captain Silvo, Vane (omicron), Brutus']] },
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
        r.with = r.with.replace(/\b(captain )?drogan\b/i, 'Admiral Raddus');
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
for (const [k, e] of Object.entries(EDITS)) {
  let rows = (out[k] || []).filter(r => !(e.drop || []).some(re => re.test(r.lead)));
  for (const [re, team] of (e.fill || [])) rows = rows.map(r => re.test(r.lead) ? { ...r, with: team } : r);
  for (const [re, txt] of (e.note || [])) rows = rows.map(r => re.test(r.lead) ? { ...r, notes: (r.notes ? r.notes + '. ' : '') + txt } : r);
  if (e.top) rows = [...rows.filter(r => e.top.test(r.lead)), ...rows.filter(r => !e.top.test(r.lead))];
  for (const [i, row] of (e.add || [])) rows.splice(i, 0, row);
  out[k] = rows;
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
