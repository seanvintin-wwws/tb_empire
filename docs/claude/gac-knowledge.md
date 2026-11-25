# SWGOH GAC & GAC Scout+ — reference notes

Written 17–19 Nov 2026 (GAC season 85). For releases after v3.7, `gac-scout-release-log.md` is newer and wins where they differ. Current main: Scout+ v3.8.3.

## Rules for GAC answers (Sean's sources, in his order)
**Defence (choosing, keeping, swapping or questioning ANY defence team)**
1. Read his league and division from https://swgoh.gg/api/player/456752632/ first (open in Chrome). Say which division the numbers are for. If it can't be read, ask.
2. Check ALL THREE hold-% sources, for the **exact squad in the exact lead order he runs it** (order matters: General Syndulla / Ezra (Exile) / GL Ahsoka holds 23% vs 20% for GL Ahsoka / Ezra / Syndulla on swgoh.gg, season 85):
   a. **swgoh.gg GAC Insight**, his league + division (Insight code = (6 − division) × 5; Div 3 = 15), with the datacron level he can actually put on it.
   b. **HotUtils squad meta** for his league (feed link below, or Scout+'s HotUtils line).
   c. **swgoh.gg squads page** https://swgoh.gg/gac/squads/?sort=percent
3. Check he owns the datacron the hold % assumes, and that its set is still live (https://swgoh.gg/p/456752632/datacrons/ and https://swgoh.gg/datacrons/).
4. Check how this opponent's actual attack teams do against it.
5. Only suggest swapping a defence out if he won't need it for attack against this opponent.
6. Never question or exclude a team he's set without doing 1–4 for that exact line-up, and check his **real** defence list (screenshots, his word, or his HotUtils GAC overview), not Scout+'s saved list.
7. Flag any hold or counter rate based on fewer than ~20 battles.

**Counters**: default swgoh.gg counters page https://swgoh.gg/gac/counters/<UNIT_ID>/ (not season-filtered). Insight division data can be used alongside. Name the source of each number.

**Kill / target orders**: only from internet guides (matchup guides, videos, Reddit). Never from unit kits. If none found, say so.

**Omicrons**: check the game mode matches (GAC / TB / TW / raid / conquest), using swgoh.gg's ability report / `/api/abilities/` (`omicron_mode` 9 all GAC, 14 GAC 3v3, 15 GAC 5v5) or grandmasterbot.com/omicrons. If unsure whether the opponent has a GAC omicron, assume they do. GAC locks your roster when you press Join, so upgrades after joining only count from the next event.

**GAC Scout+**: when he says it's run and open, read its output first (`gacScoutPlus:report` in localStorage, or the exported .md). Start from the Decision brief. Check its Your defence list isn't stale.

**Never** press HotUtils "Apply" or push anything to the game.

## Design principles for Scout+ (Sean, 19 Nov 2026)
- Goal is less time spent on the game. Cut manual input, make checking simpler. Don't add features that create more to read or do (he declined an accuracy/calibration panel).
- No typing character names; checkbox-style picks only.
- The tool uses data only, not Sean's experience (he declined a guild-notes file in the tool).
- Keep the auto-updating loader bookmark — non-negotiable.
- He won't scroll to the bottom of the brief.

## Links
| What | Link |
|---|---|
| GAC Scout+ install page | https://seanvintin-wwws.github.io/tb_empire/gac-scout.html |
| Repo | https://github.com/seanvintin-wwws/tb_empire (source in `tools/gac-scout/`) |
| Release a branch (never /pull/new/) | https://github.com/seanvintin-wwws/tb_empire/compare/main...<branch> or `gh api repos/seanvintin-wwws/tb_empire/pulls -f head=<branch> -f base=main …` |
| His swgoh.gg profile | https://swgoh.gg/p/456752632/ |
| Profile API (league/division, unit stats: stat 5 = speed) | https://swgoh.gg/api/player/456752632/ |
| His datacrons | https://swgoh.gg/p/456752632/datacrons/ |
| Squad hold % | https://swgoh.gg/gac/squads/?sort=percent |
| Counters (default view) | https://swgoh.gg/gac/counters/<UNIT_ID>/ |
| GAC Insight (sign-in needed) | https://swgoh.gg/gac/insight/battles/ |
| GAC omicron lists | https://swgoh.gg/stats/ability-report/ · https://grandmasterbot.com/omicrons?mode=GAC |
| 3v3 tier list | https://swgoh.gg/tier-list/3v3/ |
| Datacron catalogue / guide | https://swgoh.gg/datacrons/ · https://ahnaldt101.com/swgoh/datacrons |
| HotUtils GAC holonet | https://www.hotutils.com/holonet/gac |
| HotUtils his GAC overview (actual in-game defence) | https://www.hotutils.com/apps/gac?tab=overview |
| HotUtils defence meta feed (Kyber 3v3) | https://players.hotutils.com/api/gac/squad-meta?mode=3v3&side=defense&battleType=character&league=KYBER&division=ALL&hideExpired=1 |

HotUtils: Sean turned on Grand Arena player events (Discord DM reminders, Account Check opponent detection, AI Arena Plan) on 22 Nov 2026.

## How GAC Scout+ works (as of v3.7; later changes in the release log)
**Code, release and tests**
- Source: `tools/gac-scout/scout_plus.js` (~2,000+ lines, one IIFE). `node tools/gac-scout/build.js` writes `js/gac-scout-plus.js` and `gac-scout.html`.
- Loader bookmark only (no full-code backup bookmark since v3.7). How it works is a section on the install page (#how).
- Tests: `node --test tools/gac-scout/test/scout.test.js`. The file loads the script in a Node `vm` with `globalThis.__gacScoutTest` set: no overlay, internals exposed (setS, plan, defenceCandidates, lastRoundDefence, …). `.github/workflows/gac-scout-tests.yml` runs them + the build on every PR. `GAC_SRC=<file>` runs them against another copy.
- Live testing a branch: in a swgoh.gg tab, `fetch('https://raw.githubusercontent.com/seanvintin-wwws/tb_empire/<sha>/js/gac-scout-plus.js')`, put the text in a `<script>` element's textContent and append it. Before testing anything that edits his saved defence (Fill, Clear, zones), back up `localStorage['gacScoutPlus:settings']`, restore it afterwards, and remove the overlay (`document.getElementById('gac-scout-plus').remove()`).

**Tabs**: Decision brief (first), Battle plan, Their defences & counters, Their attacks, When they attack, Roster compare (Round by round is export-only since v3.7.2).

**Summary block**: you vs opponent, battle counts, format note, Insight line (league + division), datacrons counted, HotUtils line ("loaded automatically, updated <date>" from the daily copy; a paste box only if that fails).

**Decision brief**
- Top: out-of-date warning (saved before this event started, or too many characters) with **Fill from my last round**; then a **Full / Short** toggle (Short default since v3.7.3; exports always Full).
- Short view: one line per squad — KEEP / REMOVE / ADD, squad, zone, datacron #N, deciding hold % with source and battles, then Insight · HotUtils · all-leagues (⚠ only when Insight and HotUtils differ by 10+ points) — then swaps, expected holds, short attack plan.
- Full view: 1 keep/remove/add; 2 defence as a package (Hungarian method); 3 final line-up by zone; 4 datacrons; 5 attack plan with Their actual defence box; 6 Warnings and gaps (export and saved report only).

**Inputs (no typing)**
- **Fill from my last round**: replaces the defence list with squads (leader first), zones and fleet from the round in his last two events where the most of his defence was attacked. swgoh.gg only lists rounds once the event is over and only records attacked defences.
- **Their actual defence**: checkboxes for their recorded defences plus unseen strong teams. Once ticked, the attack plan, their datacron allocation and the package use exactly those. Stored in `store.theirSeen[oppAlly]` for the current event (7 days max).

**Other**: speed flag ⚡ on attack-plan counters when their fastest unit is 30+ speed faster (player API `stats['5']`), not in the win %. Roster compare split into Characters and Ships drop-downs. Datacron expiry warnings removed (except "set expired, cron is gone" on an opponent's datacron).

**HotUtils**: `.github/workflows/hotutils.yml` runs daily at 19:23 UTC (and on demand) → `tools/gac-scout/hotutils-fetch.js` reads the feed for 3v3/5v5 × 5 leagues, keeps squads with 100+ battles, writes `data/hotutils/<fmt>-<LEAGUE>.js`, commits only when numbers change, and requests a Pages build. Scout+ loads the file via a `<script>` tag from GitHub Pages, skips it if over 4 days old, and prefers it over a paste unless the paste is newer. With Insight: Insight's division figure drives the score; HotUtils shown beside it and used where Insight has under 50 battles. Counters never come from HotUtils.

**Your defence list**: stored as squads, leader first; warning when stale; everything on it is excluded from the attack plan and suggested defence. Defence file save/load includes squads, fleet and zones.

**Saved data (localStorage on swgoh.gg)**: `gacScoutPlus:settings` (ally code, last opponent, defence squads, fleet, `defZones`, keepGL, rank, `briefShort`, `theirSeen`, `swapNo`); `gacScoutPlus:rounds`; `gacScoutPlus:global` (meta, Insight, pasted HotUtils); `gacScoutPlus:report` (latest full report: `JSON.parse(localStorage.getItem('gacScoutPlus:report')).md`).

**Export**: every tab as Markdown + JSON summary with AI instructions; short version for free tiers.

**Data sources**: player API (units incl. omicrons and stats, datacrons, league/division); `/api/characters/`, `/api/abilities/`; GAC history pages (battle cards with datacron JSON, zones); counters pages; squads page; datacron catalogue; Insight API (`/api/v1/gac/battle/battles/?…&d_lead=X&d_member=A,B`, hold = 1 − percentage; filters `d_has_datacron`, `d_datacron_tier=MIN:MAX`, `d_omicron_skill_key=UNIT:skill`; division code (6 − div) × 5; under 150 battles → whole league; 429 throttling → falls back after six refusals).

**Datacron and omicron model**: band = alignment (3) / faction (6) / named character (9+). Each of his defence squads gets one datacron (never shared, kept out of attacks); the rest go to attacks then the suggested defence. A freed datacron is only loaned to an incoming squad if it doesn't lower its rating. Their defences are assumed to have every GAC omicron; his use only the ones he has. Expired sets excluded.

**Scoring**: counter estimate = Insight/swgoh.gg rate (worth up to 30 battles) + histories, ±4% per relic, capped ±12%. Defence score = 50% meta hold + 50% vs their attackers. Battle plan: see release log v3.8.2–3.8.3.

**Can't see**: mods beyond speed, turn-meter luck, defences nobody attacked, the event in progress, which datacron is actually equipped.

## Development history
- 12 Nov: GAC Scout v1. 15 Nov v2.1: merged Scout+ V2 and the round-by-round report; self-updating loader.
- 16 Nov v2.2–2.7: hardening, datacrons, HotUtils paste, Insight, datacrons and omicrons in the odds.
- 17 Nov v2.8–2.8.2: HotUtils beside Insight, more Insight passes, throttle handling.
- 19 Nov v2.9–3.6.1: export, squads page as third source, Decision brief, package model, zones, freed-datacron fix.
- 19 Nov v3.7 onwards: see release log.

## Decisions on improvement ideas (19 Nov 2026)
- **Blending the three hold sources**: left for now. Revisit only if Sean asks.
- **Accuracy / calibration panel**: no (more to read).
- **Guild notes in the tool**: no — Claude keeps Sean's lessons in these notes instead.
- **Web search to check counters**: not for win rates; web is for kill orders, new units with little data, and "needs X" notes.

## Lessons from past rounds
- **19 Nov vs Grand Magus:** Claude questioned General Syndulla leading Ezra / GL Ahsoka without checking the swgoh.gg squads page; that order holds 23% vs 19–20% for Ahsoka-led versions. Claude also ran a first analysis by hand instead of reading Scout+, and missed Scout+'s stale defence list.
- **Round 2 vs Djon (lost on points):** Maz / Kix / Quiggold beat JKL / Mace / Mara, PKHO and the Thrawn team. Third Sister autoed it easily but had been wrongly excluded. Boss Nass: Darth Jar Jar / Ronin / DS Yoda won easily with the datacron. Partagaz: Thrawn / Piett / Magmatrooper failed badly. Ship counters: Executor → Negotiator, Negotiator → Malevolence, Leviathan → Home One (Profundity backup).
- **Against Darth Jar Jar / The Ronin / Yoda (Dark Side Vision)**: Maz Kanata / Kix / Quiggold, very easy win vs Hercule (17 Nov 2026).
- **Omicron choice (raid + RoTE overlap):** Vel Sartha "One Path One Choice" (TB) unlocks Saw + Vel / Kleya / Luthen / Cassian (Undercover) on Kashyyyk and frees Captain Rex for the Zeffo Clones. The Droid Destruction raid has no raid-mode omicrons.
- **Datacrons decide hold rates.** JKL / Mace / Mara Jade Skywalker holds 19.8% with a datacron but 3.8% without (Div 3).
- **Round 3 vs Hercule:** SLKR / Rey / KRU vs Lord Vader / Appo / Scorch was recommended on 21 Insight battles without a datacron check; it won but was very close.
- **Snowtrooper Commander omicron** ("Warlord's Enforcer", leader, GAC 3v3 only) applied 19 Nov during week 3 — only active from the next 3v3 event.
- His defence changes round to round (Great Mothers / Morgan / Nightsister Spirit was on defence vs Grand Magus 20 Nov but not vs Pyxroy 21 Nov). Confirm his in-game defence before finalising an attack plan.
- "New opponent time" + North/South screenshots = the OPPONENT's visible defence (Trap stays hidden until a front zone falls).
- Shorthand: HFM = Maul (Hate-Fueled), PKHO = Pirate King Hondo Ohnaka, CAT = Commander Ahsoka Tano.

## His character-tier datacrons (19 Nov 2026)
DJJ L15; L9: Mara Jade, Qui-Gon Jinn (QUIGONJINN, not Master Qui-Gon), Jedi Knight Revan, Tarkin, Darth Vader (VADER, not Lord Vader), Barriss, Jocasta Nu, ARC Trooper, Leia (Jedi Training), Partagaz, IG-90, Thrawn, Shin Hati, Maul (MAULS7, not Hate-Fueled), Starkiller, Krrsantan, Boba (Scion), Taron Malicos. Set 34 (The Art of Command: Thrawn, Tarkin, Vader, Barriss, etc.) expires 26 Nov 2026 — check the live list before relying on these.

## Season 85 week 3 bracket (#1399, started 18 Nov)
Him 16.22M GP (most omicrons 113, relic tiers 2454, R5+ 341); weak spots vs bracket: mod speed (mid-pack) and Lvl 9 datacrons (18; Pyxroy 29, AnaDien 28, Dan Dare 27, DarthTibius 26). Others: DarthTibius 15.18M (best speed), Dan Dare 14.94M (most 6-dot mods), KappaTheJabbaSlappa 14.87M (11 GLs), AnaDien 14.51M, Grand Magus 14.50M, Pyxroy 14.45M, Ozelot 14.35M.

## Season 85 round 3 vs Grand Magus (ally 558279969, 14.50M GP, Kyber Div 3)
- Strong attacker: 211/237 attack wins over his last four 3v3 seasons; never lost a fleet battle (Leviathan, Executor, Profundity).
- Stable defence: Baylan, Cassian (Undercover), Palpatine / Mara / Vader DE, GL Ahsoka / Ezra / Sabine, GL Rey / Ben / Cal, Thrawn / Tarkin / Scorch, Grievous, Inquisitor Barriss, Kelleran, Queen Amidala, Qui-Gon / Anakin / Ki-Adi, Saw, Stranger, Third Sister, Tuskens; fleet Malevolence, Home One, Raddus.
- Defences that held against him: Jabba / Boushh / Krrsantan (4 holds in 13), GL Rey with a datacron, Queen Amidala (2/10), Enoch (2/8), Maz / Kix / Quiggold (2/4, thin).
- Sean's front top as set 19 Nov: Boba Scion / Asajj DD / Zam (Lvl 9 Boba); DJJ / Ronin / DS Yoda (Lvl 15 DJJ); Palpatine / Mara / Vader DE (Lvl 9 Mara); General Syndulla / Ezra (Exile) / GL Ahsoka (Lvl 3 Light Side) — Syndulla lead is deliberate (23% on swgoh.gg squads, 18.3K; Insight Div 3 26.3% of 4,657). 19 Nov he swapped Thrawn / Piett / Magmatrooper for Snowtrooper Commander / Death Trooper (Peridea) / Night Trooper.

## Round 3 vs Hercule (ally 417154512, 15.43M GP)
- His defence (16 Nov): Boba / Asajj DD / Zam with datacron; DJJ / Ronin / DS Yoda; Veers / Dark Trooper / Stormtrooper Concept; CT-7567 Rex / ARC Trooper / Captain Rex with Lvl 9 ARC datacron (replaced Gungans: 31.6% vs 3.5%); Thrawn / Piett / Magmatrooper with Lvl 9 Thrawn datacron (replaced Tarkin / DCT / Scorch: 19.7% vs 8.9%); Rey / Ben / Barriss. Fleet: Malevolence, Finalizer, Executrix.
- Fleet attack: Malevolence → Executor; Raddus → Profundity; Negotiator → Leviathan.

## Ideas not built yet
- Attack-side omicron split (needs per-squad Insight calls).
- Manual override for which datacron is on which defence team.
- Tier-list Elo integration (https://swgoh.gg/tier-list/3v3/?side=defense&league=kyber-d1).
- Relic-range filters (`d_unit_relic_range`, `d_lead_relic_tier=MIN:MAX`).
- HotUtils counter data (the feed only carries defence holds).
- Package model: second attempts and teams they haven't shown.
