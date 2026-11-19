// Fetches HotUtils' public GAC defence meta (hold % per defence squad, whole league, expired datacrons left out) for
// every league and both formats, and writes one small script per league and format to data/hotutils/, e.g.
// data/hotutils/3v3-KYBER.js. GAC Scout+ loads the one it needs from GitHub Pages, so nobody has to paste it.
// Run daily by .github/workflows/hotutils.yml. Usage: node tools/gac-scout/hotutils-fetch.js
const fs = require('fs'), path = require('path');
const OUT = path.join(__dirname, '..', '..', 'data', 'hotutils');
const LEAGUES = ['KYBER', 'AURODIUM', 'CHROMIUM', 'BRONZIUM', 'CARBONITE'], MODES = ['3v3', '5v5'];
const url = (mode, league) => `https://players.hotutils.com/api/gac/squad-meta?mode=${mode}&side=defense&battleType=character&league=${league}&division=ALL&hideExpired=1`;

// the same checks GAC Scout+ makes on a pasted copy: squads of unit ids, finite numbers, 100+ battles
function trim(j, mode, league) {
  const ids = a => Array.isArray(a) && a.length && a.every(x => typeof x === 'string' && /^[A-Z0-9_]{2,40}$/.test(x));
  if (!j || (j.mode && j.mode !== mode)) throw new Error(`expected ${mode} data`);
  const rows = (Array.isArray(j.rows) ? j.rows : [])
    .filter(r => r && ids(r.units) && Number.isFinite(r.battles) && Number.isFinite(r.holdPct) && r.holdPct >= 0 && r.holdPct <= 100 && r.battles >= 100)
    .map(r => [r.battles | 0, +(r.holdPct / 100).toFixed(4), +(+(r.avgBanners || 0)).toFixed(2), r.units]);
  if (!rows.length) throw new Error('no squads in the feed');
  return { mode, league, season: j.season | 0, asOf: j.asOf || new Date().toISOString(), rows };
}
const script = d => `window.__gacScoutHU=window.__gacScoutHU||{};window.__gacScoutHU[${JSON.stringify(d.mode + '|' + d.league)}]=${JSON.stringify(d)};\n`;

async function main() {
  fs.mkdirSync(OUT, { recursive: true });
  let ok = 0, changed = 0;
  for (const mode of MODES) for (const league of LEAGUES) {
    const file = path.join(OUT, `${mode}-${league}.js`);
    try {
      const r = await fetch(url(mode, league), { headers: { accept: 'application/json', 'user-agent': 'GAC Scout+ (github.com/seanvintin-wwws/tb_empire)' } });
      if (!r.ok) throw new Error('HTTP ' + r.status);
      const d = trim(await r.json(), mode, league);
      const old = fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : '';
      // only rewrite when the numbers changed, so an unchanged feed makes no commit
      const same = old && old.includes(JSON.stringify(d.rows)) && old.includes(`"season":${d.season},`);
      if (!same) { fs.writeFileSync(file, script(d)); changed++; }
      ok++;
      console.log(`${mode} ${league}: ${d.rows.length} squads, season ${d.season}${same ? ' (unchanged)' : ''}`);
    } catch (e) { console.warn(`${mode} ${league}: ${e.message}`); }
    await new Promise(r => setTimeout(r, 1500)); // be gentle with HotUtils
  }
  console.log(`${ok} feeds read, ${changed} files updated`);
  if (!ok) process.exit(1);
}
if (require.main === module) main();
module.exports = { trim, script };
