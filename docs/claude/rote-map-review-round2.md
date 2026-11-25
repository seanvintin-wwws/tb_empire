# ROTE map: outside AI review, round 2 (20 Nov 2026)

Reviewers: Copilot, Gemini, Perplexity, Grok, ChatGPT. Prompt and a single 24 KB pack (roster-check.js + Malachor/Zeffo missions vs guide) were used because most models had attachment limits. Every claim below was checked against the code (main @ 0a2652e) and game rules before being accepted.

## Status
**Live: PR #20 (branch `rote-guide-check`) merged 20 Nov, main @ 6d302f7.** Checked on the live Kashyyyk page.
- New files: `js/rote-units.js` (unit name|side|faction codes from swgoh.gg, extracted in Chrome because swgoh.gg blocks CORS for /api/characters/ and the sandbox can't reach swgoh.gg), `js/rote-teams.js` (generated), `tools/rote/build_teams.js` (generator). Pages load rote-units.js and rote-teams.js before roster-check.js.
- Kashyyyk c6 (Wookiees): the guide team needs Yoda & Chewie R7 (Sean's is R6). Faction-only missions got "own lineup" (guide lead + any qualifying units at the relic asked = amber). **Superseded 25 Nov (PR #32): Tarfful + any 4 R7 Wookiees is a guild-tested guide team, green.**
- Mandalore c6 stays red: DTMG required, R6 vs R8 (as of 20 Nov).
- Scan of all 98 missions on FireFight (old → new): 67 G→G, 10 R→G, 4 unchecked→G, 2 R→A (Kashyyyk c6, Mandalore c3), 1 G→A (Lothal c1), 14 R→R, all genuine relic shortfalls.
- Live test method used then: on a Pages page, fetch the branch HTML from raw.githubusercontent, inline rote-units/rote-teams/roster-check, add `<base href=".../tb_empire/html/">`, load as a `srcdoc` iframe (document.write on the same page fails: `let app` already declared; the 404 page blocks fetch). Pages localStorage is shared with Sean's real use: clear `rote:open` after testing, never remove `rote:allyCode`.
- swgoh.gg player API: `omicron_abilities` lists applied omicron ability IDs (`leaderskill_X` = leader omicron).

## Build list (done in PR #20)
1. Check the Nov 2026 guide teams (guide_data.js), not the old built-in preferredSquads. Free text → unit IDs with an abbreviation list, "+2 Sith"-type slots filled from spare qualifying units, mission-required units auto-added, each team checked against the requirement (named units, side, faction, max units). Old teams only as fallback. Malachor c4: 8B/5B/7S + any 2 DS R9. Kafrene c4 Rebels split into CLS and ROLO.
2. Omicrons: "lead omi" needs the leader omicron; "(omi)" needs any omicron on that unit.
3. Either Cal only where the requirement says "Any Cal Kestis" (Bracca c4).
4. Phase planner: "Planets open now" ticks (Zeffo and Mandalore out until ticked), guide teams preferred over own lineups, exact solving per group of missions sharing units, failed planet shown as "data unavailable". (Specials-first was later reversed: points missions first, PR #24.)
5. Platoon wording only.
6. Missions labelled combat / special / fleet.
7. Wrong-length ally code clears old results.
8. Tidy: Chirrut Îmwe text; Malachor c4 mission id.

## Rejected claims
- Ships need relic levels (Perplexity): no, ROTE ships need 7 stars, already checked.
- Only the capital ship needs 7 stars (Grok): no, all ships.
- minRelic needs a "+" (Perplexity): the regex doesn't require one.
- Missions cost deployment GP (Perplexity): units used in missions auto-deploy to that territory; GP still counts there.
- Gemini's guesses about Sean's Malachor reds and "remove Bad Batch from Zeffo c3": unsourced.
- "Calculation details" panel (Copilot): more reading for Sean; skipped.

## Confirmed fine
- PHASES groupings (Copilot, ChatGPT).
- Malachor unit names resolve correctly (Perplexity).
