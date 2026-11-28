# CLAUDE.md — read this first in every session on this repo

This repo is Sean's. It holds two tools for Star Wars: Galaxy of Heroes (SWGOH):
- **ROTE map**: interactive Rise of the Empire territory battle map with a roster check and phase planner. Live: https://seanvintin-wwws.github.io/tb_empire/
- **GAC Scout+**: a bookmarklet that scouts Grand Arena (GAC) opponents on swgoh.gg. Live install page: https://seanvintin-wwws.github.io/tb_empire/gac-scout.html

This repo is **public**. Don't put anything private in it.

Longer notes are in `docs/claude/`. Read the one that matches the job before starting:
- `docs/claude/gac-knowledge.md`: how Scout+ works, GAC advice rules, links, past rounds
- `docs/claude/gac-scout-release-log.md`: Scout+ releases (newer than gac-knowledge where they differ), open questions
- `docs/claude/rote-next-updates.md`: ROTE map to-do list
- `docs/claude/rote-discord-findings.md`, `docs/claude/rote-phase6-teams.md`: ROTE teams not yet in the map
- `docs/claude/rote-map-review-round2.md`: ROTE checker design, rejected ideas, live-test method
- `docs/claude/rote-score-log.md`: Sean's territory battle score over time

When something new is decided or learned, update the matching `docs/claude/` file (or this file) in the same pull request.

## Who Sean is
- In game: **FireFight**, ally code **456752632**, about 16M GP, Kyber league (3v3 and 5v5 GAC). His division changes, so look it up (see GAC advice below). Guild: **ANZGC**; he shares tools with guildmates on Discord.
- Not a web developer. Explain hosting, Git and deployment in plain words, no jargon.
- Direct and concise. Wants results, not a running commentary. Australian, timezone Australia/Sydney.

## How to work with Sean (he has had to repeat these, so follow them exactly)
1. **Do the whole release yourself**: branch, commit, push, open the pull request, merge it, wait for GitHub Pages, check the live site. Don't hand him manual steps. He said (20 Nov 2026) Claude may merge its own tested pull requests; that overrides any older note saying he merges.
2. If something blocks you (no push access, a blocked command), say exactly what is blocked in one or two sentences and what he must click to unblock it: the exact page, box and button and where it is on screen. Vague steps make him angry.
3. Test before saying something works: on the live site or a real swgoh.gg profile, in Chrome if available.
4. Keep answers short. One line per change is enough.
5. Ask him only when what he wants is genuinely unclear, two reasonable options give different results, access is missing on every route, or the action is outside this repo. If something fails, work out why and try a safe alternative first.
6. **"Tested" means**: build passes, tests pass, `git diff` checked, the changed behaviour tried (real swgoh.gg profile for Scout+, the planet page for the map), and no console errors. Don't call anything live until the live page is checked.
7. At the end, report in a few lines: what changed, pull request, deploy result, what was checked live, anything left.

**Never**: force-push or rewrite history, touch secrets or repo settings, act on any other repo (especially genskaar/tb_empire), push anything to his game account, press HotUtils "Apply".

## Repo rules
- Commit as Sean: `git -c user.name="Sean" -c user.email="seanvintin-wwws@users.noreply.github.com" commit ...`
- Guildmates contribute through pull requests; only Sean (and Claude sessions he starts) push.
- This repo is a **fork of genskaar/tb_empire. Never open anything against genskaar's repo.** GitHub's `/pull/new/<branch>` link targets genskaar by default (it happened once: genskaar/tb_empire#48, closed).
  - Open pull requests with the REST API (GraphQL, and so `gh pr create`, is blocked in Claude sessions):
    `gh api repos/seanvintin-wwws/tb_empire/pulls -f title='...' -f head='<branch>' -f base=main -f body='...'`
  - In a browser, use only `https://github.com/seanvintin-wwws/tb_empire/compare/main...<branch>` and check the header says seanvintin-wwws / tb_empire.
- Claude sessions push branches, not main. Releases go through a pull request, which Claude merges once tested.
- After merging, GitHub Pages takes about 90 seconds. Check it with `gh api 'repos/seanvintin-wwws/tb_empire/actions/runs?per_page=1'`, then look at the live page.
- Don't push more commits to a pull request branch after it's merged; open a new one.
- After merging, delete the branch.

## ROTE map

### Files
- `index.html` (main map), `html/<planet>.html` (one page per planet), `js/<planet>.js` (planet data: missions, positions, old built-in teams).
- `js/guide_data.js`: recommended teams per mission. **Generated, don't edit by hand.**
- `js/rote-teams.js`: teams as unit IDs with mission rules, used by the roster check. **Generated, don't edit by hand.**
- `js/rote-units.js`: unit catalogue (ID|name|side|faction codes) from swgoh.gg.
- `js/roster-check.js`: roster check (green / amber / red per mission) and the phase planner.
- `tools/guide/guide_raw.json`: the swgohrote.com guide (Nov 2026).
- `tools/guide/build.js`: turns the guide into `js/guide_data.js`. **All guild changes go in here**:
  - `OVERRIDES`: replace a mission's whole team list.
  - `EDITS`: per mission: `drop` teams by leader, `top` (move a leader first), `fill` (replace a team's members), `note` (add a note to a team), `add` (insert a team at a position), `prio` (priority team: the planner puts it on this mission when no other mission is lost).
  - `NOTES`: yellow note above a mission's team list.
  - `WARN`: **big red box at the very top of the mission panel**, for things that cost a failed attempt.
  - `RESERVED`: units needed on another mission in the same phase; teams using them are dropped there.
- `tools/rote/build_teams.js`: turns `js/guide_data.js` + planet files + `js/rote-units.js` into `js/rote-teams.js`. Name lookups are in its `CH` (unit names and shorthand) and `CATWORD` (faction words like "Wookiees", "+2 Sith") tables.

### Rebuild after any change (three separate commands, in this order)
```
node tools/guide/dump_old.js
node tools/guide/build.js "Nov 2026"
node tools/rote/build_teams.js
```
- `dump_old.js` writes `tools/guide/old.json` (git-ignored). It can print an unhandled error from `js/gac-scout-plus.js`; old.json is still written. That error stops a `&&` chain, so run the commands one at a time.
- Always pass `"Nov 2026"` (the guide date shown on the map). Without it, build.js writes today's date instead.
- `build_teams.js` prints anything it couldn't understand and any team that breaks a mission's rules. The only known one is `tatooine:c5 [map] Gungans -> more than 3 units` (pre-existing). Anything else new must be fixed.
- Check with `git diff` that only the missions you meant to change moved.

### Map rules (Sean's)
- **Unit and ship names in full, as in game.** Never shorthand like FCI or Tie Dorito.
- **Points first.** Combat and fleet missions earn Territory Points; special missions only give tokens. The planner fills points missions first and specials with leftover units. Never prioritise specials.
- A unit fights once per phase across all planets. Units placed in operations (platoons) can't fight that phase.
- Ground missions need 5 units. Exceptions: Lord Vader solo, Darth Vader solo, Bracca Cere + Cal, Tatooine Mandalore unlock (3).
- Special missions: one attempt per TB per player, win or lose.
- Mission keys are `planet:cN`, matching the mission names in `js/<planet>.js`. Phases: 1 Mustafar/Corellia/Coruscant; 2 Geonosis/Felucia/Bracca; 3 Dathomir/Tatooine/Kashyyyk/Zeffo (bonus); 4 Haven/Kessel/Lothal/Mandalore (bonus); 5 Malachor/Vandor/Ring of Kafrene; 6 Death Star/Hoth/Scarif.
- Colours: green = a recommended team is ready; amber = only "your own lineup" (a guide lead plus any units of the right faction) is ready; red = not ready.

### Guild-tested results already in the map (keep them)
- Hoth Aphra (`hoth:c4`): Doctor Aphra + IG-90, BT-1, 0-0-0, IG-88. Wins every time.
- Geonosis Acklay (`geonosis:c2`): **priority team** Great Mothers + Morgan Elsbeth, Night Trooper, Death Trooper (Peridea), Nightsister Zombie. Easy full auto.
- Geonosis Geonosians (`geonosis:c5`, 5x Geonosians R7+): red warning "REMODDING NEEDED for this mission. Remod your Geonosians before you attempt it." Sean failed his first attempt.
- Lothal Phoenix (`lothal:c3`): red warning "REMODDING NEEDED for this mission. Remod your Phoenix units before you attempt it." (25 Nov 2026). Guild tested 2/2 (28 Nov 2026): Hera Syndulla, Captain Rex, Ezra Bridger, Kanan Jarrus, Garazeb "Zeb" Orrelios, all R8, remodded, platoons 6/6.
- Mandalore Bo-Katan (`mandalore:c3`): red warning to remod; Sean got 1/2 on full auto unremodded with Padawan Sabine Wren (27 Nov 2026). **Top team, guild tested 2/2 full auto (28 Nov 2026)**: Bo-Katan (Mand'alor) + The Mandalorian and Grogu, The Mandalorian, The Mandalorian (Beskar Armor), IG-12 & Grogu, remodded, platoons 4/6. `build_teams.js` maps "The Mandalorian and Grogu" to GLMANDOGROGU (it used to split on " and ").
- Mandalore combat (`mandalore:c2`): red warning to wait for platoons to fill and remod before the Rotta the Hutt team; Rotta got 1/2 with Gamorrean Guard's omicron, unremodded, platoons 4/6 (28 Nov 2026).
- Kashyyyk Tarfful (`kashyyyk:c6`, 5x Light Side Wookiees R7+): Tarfful + any 4 Relic 7 Light Side Wookiees wins, so it must show **green**. Sean had to say this more than once.
- Also in `tools/guide/build.js`: Zeffo, Kashyyyk Saw, Haven, Lothal, Vandor, Dathomir and Mustafar guild edits, with reasons in their notes.

### Live testing the map
- The live site only shows main. For a branch, test locally (serve the repo folder and open `html/<planet>.html`) or test right after merging on the live site.
- The map's browser storage is shared with Sean's real use: clear `rote:open` after testing, **never remove `rote:allyCode`**.

### To do next ROTE
See `docs/claude/rote-next-updates.md`.

## GAC Scout+

### Files, build, tests
- Edit the readable source `tools/gac-scout/scout_plus.js` (one big IIFE; `const VERSION` near the top; current main is 3.8.3). Bump VERSION for each release.
- Build: `node tools/gac-scout/build.js` writes `js/gac-scout-plus.js` and `gac-scout.html`.
- Tests: `node --test tools/gac-scout/test/scout.test.js`. `.github/workflows/gac-scout-tests.yml` runs them and the build on every pull request that touches `tools/gac-scout/`.
- `.github/workflows/hotutils.yml` runs daily (19:23 UTC) and commits `data/hotutils/*.js` ("HotUtils meta for GAC Scout+" commits). Leave those commits alone.

### Live testing a branch build
- jsdelivr refuses this repo. In a swgoh.gg tab, `fetch('https://raw.githubusercontent.com/seanvintin-wwws/tb_empire/<sha>/js/gac-scout-plus.js')`, put the text in a `<script>` element and append it.
- Scout+ draws inside a shadow root: `document.getElementById('gac-scout-plus').shadowRoot`.
- Before testing anything that changes Sean's saved defence (Fill, Clear, zones), back up `localStorage['gacScoutPlus:settings']`, restore it afterwards, and remove the overlay so the in-memory copy can't save over it.
- Testing on another profile overwrites the saved report (`localStorage['gacScoutPlus:report']`); re-run his current opponent afterwards.

### Design rules (Sean's)
- The goal is **less time spent on the game**: cut manual input, make checking simpler, don't add things to read or do.
- No typing character names. Any input is checkbox-style.
- The tool uses data only, not Sean's match experience. His lessons go in `docs/claude/`, not into the tool.
- **Keep the auto-updating loader bookmark.** Non-negotiable.
- He won't scroll to the bottom of the Decision brief. Warnings live in the export and saved report, not on screen. Anything taken off the screen must stay in the export.
- Zones are **North / South / Trap** (plus Fleet) everywhere, never Front top / Front bottom / Back.

## GAC advice (if Sean asks in this repo)
- **Defence**: pick from meta hold %, never gut feel or tiny samples. Check all three sources for the **exact squad in the exact lead order he runs**:
  1. swgoh.gg GAC Insight for his current league and division. First read `league_name` and `division_number` from https://swgoh.gg/api/player/456752632/ (open it in Chrome; direct fetches from swgoh.gg are often refused). Insight division code = (6 − division) × 5 (Div 1 = 25, Div 2 = 20, Div 3 = 15). Say which division the numbers are for. If it can't be read, ask.
  2. HotUtils squad meta for his league (his GAC overview at hotutils.com/apps/gac?tab=overview shows his actual in-game defence).
  3. https://swgoh.gg/gac/squads/?sort=percent
- Check he owns the datacron a hold % assumes (https://swgoh.gg/p/456752632/datacrons/).
- Only suggest swapping a defence out if he won't need it for attack against this opponent. Confirm his actual in-game defence (his screenshots or HotUtils overview) first; Scout+'s saved list can lag.
- Before excluding a team or unit, check his real defence list. (Third Sister was wrongly excluded once and cost a 100% counter.)
- **Counters**: the default swgoh.gg counters page `https://swgoh.gg/gac/counters/<UNIT_ID>/`, not a season-filtered view. Check every visible opponent squad yourself. Say which source each number came from.
- **Kill orders**: only from internet guides (matchup guides, videos, Reddit). Never work them out from unit kits. If none found, say so.
- **Omicrons**: check the omicron's game mode matches (GAC / TB / TW / raid / conquest). Use swgoh.gg's ability report or grandmasterbot.com/omicrons. If unsure whether an opponent has a GAC omicron, assume they do.
- Flag any counter or hold rate based on fewer than about 20 battles.
- When he says Scout+ has run and is open in Chrome, read its output first (`JSON.parse(localStorage.getItem('gacScoutPlus:report')).md`) instead of redoing the analysis.
- "New opponent time" plus North/South screenshots = the **opponent's** visible defence, not his.
- Unclear portrait: check the meta and his Scout+ export first; only ask if still unclear. Shorthand he uses: HFM = Maul (Hate-Fueled), PKHO = Pirate King Hondo Ohnaka, CAT = Commander Ahsoka Tano.
- Against Darth Jar Jar / The Ronin / Yoda (Dark Side Vision), suggest Maz Kanata / Kix / Quiggold (easy win, 17 Nov 2026).
- **Never press HotUtils "Apply" or push anything to the game.**
- He's happy to be asked to run a question past other AI tools (Copilot unlimited; Perplexity has limited free credit).
