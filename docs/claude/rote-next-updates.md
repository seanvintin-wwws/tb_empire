# ROTE map: state and next updates

## Live on main (25 Nov 2026, PR #32 merged, main 3c2ca93)
- PR #20: roster check uses the Nov 2026 guide teams, omicrons, mission rules, own-lineup amber, open-planet phase plan.
- PR #21: ground teams need 5 units (Sean confirmed in game); exceptions Vader solo, Lord Vader solo, Bracca Cere + Cal, Tatooine Mandalore unlock (3).
- PR #22: full in-game names everywhere (no FCI / Tie Dorito / HMF); "Millennium" spelling.
- PR #23: Hoth Aphra (hoth:c4) guild-tested team: Doctor Aphra + IG-90, BT-1, 0-0-0, IG-88.
- PR #24: phase plan fills Territory Point missions (combat, fleet) first; special missions get leftover units. **Sean's rule: maximise points and stars; specials give no points, only tokens, so never prioritise them.**
- PR #32 (25 Nov):
  - Geonosis Acklay (geonosis:c2): Great Mothers is the **priority** team (Sean's: Great Mothers + Morgan Elsbeth, Night Trooper, Death Trooper (Peridea), Nightsister Zombie). New `prio` flag in `EDITS`; the planner gives it +2, so it goes there whenever no mission is lost.
  - Geonosis Geonosians (geonosis:c5): new `WARN` list in `tools/guide/build.js`, shown as a big red box at the top of the mission panel on every planet page. Text: "REMODDING NEEDED for this mission. Remod your Geonosians before you attempt it." Sean failed his first attempt.
  - Kashyyyk Tarfful (kashyyyk:c6): "Tarfful + 4 any Light Side Wookiees" is a guild-tested guide team, so it shows **green** with Tarfful + any four R7 Wookiees. The builder now skips the amber own-lineup copy when the guide already lists that lead with any faction units.
  - Hand edits that a rebuild would have lost (Hoth Aphra team, Geonosis c3 Emperor Palpatine text) moved into `tools/guide/build.js`.

- 25 Nov: Haven c1/c2/c6 have a second Sith Eternal Emperor team with Yoda (Dark Side Vision) (TB omicron) in The Stranger's place. Sean has Yoda DSV at R8 with the omicron; his Stranger is R7, below these missions' R8. Not guild tested on Haven yet: if it wins 2/2, mark it guild tested.

- 27 Nov: Lothal Phoenix (lothal:c3) note now has a manual wave 1 / wave 2 plan (Death Troopers first, then Stormtroopers, Grand Admiral Thrawn last and kept stunned; Kanan Jarrus taunts for Thrawn's big attack). No written guide for this mission exists online; the plan is adapted from Thrawn legendary event guides (EA forums). Sean lost wave 2 even after remodding. If the plan wins, say so in the note; if not, record what went wrong. `.guide-note` now keeps line breaks (`white-space: pre-line` in css/fit.css).

- 27 Nov: Kessel fleet (kessel:c1, Ghost required, enemy Executor fleet): Sean says Profundity is unreliable here. Yellow note now gives an untested lineup from player write-ups (gaming-fans.com P4 Kessel walkthrough, a YouTube full-auto clip, EA forum Profundity tips): start Rebel Y-wing, Ghost, Han's Millennium Falcon; reinforce Rogue One, Cassian's U-wing, Outrider, Phantom II. If it wins, mark it guild tested; if not, record what went wrong.

## To do at the next ROTE (try on live planets as they open)
1. "Done this TB" tick per special mission (one attempt per TB, win or lose).
2. Death Star fleet: note that Imperial TIE Fighter must be in the starting three.
3. Add Phase 6 teams from `rote-phase6-teams.md` (verified on screen first; Copilot's are marked "not checked").
4. Add Discord finds from `rote-discord-findings.md` (Mandalore BKM, Zeffo/Kashyyyk fleets, Lothal Phoenix, Tatooine Krayt; Trench, Bad Batch for Zeffo clones, Talzin, Vel omicron).
5. Mission-panel warnings (now possible with `WARN`): JML ult soft-lock on Coruscant, Tarpals omicron on Zeffo, Bracca Jedi needs Coruscant platoons, Cere armour 70–74% for the Zeffo unlock.
6. Hide the amber "your own lineup" line when a guide team is already ready.
7. DONE 26 Nov 2026: Sean's Saw team (Saw Gerrera + Kyle Katarn (omicron), Vel Sartha (omicron), Kleya Marki, Luthen Rael) won on full auto. Added first on kashyyyk:c8 as guild-tested.
8. Open questions for other AI tools (prompt in `rote-phase6-teams.md`).
9. Re-check Sean's roster after adding.
