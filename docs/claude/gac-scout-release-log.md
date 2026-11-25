# GAC Scout+ release log (newest first)

Read with gac-knowledge.md. Where they differ, this log is newer. **Live on main: v3.8.3** (PR #31, 21 Nov 2026).

## Season 85 round 2 vs Pyxroy — defence (21 Nov 2026)
- Scout+ v3.7.7 suggested Veers → Dash Rendar / L3-37 / Vandor Chewbacca. Bad call: Dash lower on HotUtils (14% vs 16%), not on swgoh.gg squads, Insight whole-league vs Veers' Div 3 figure, and the package check said 1.9 → 1.7 expected holds. Fixed in v3.7.8.
- Sean's actual in-game defence vs Pyxroy: North = Boba Scion / Asajj DD / Zam; Snowtrooper Cmdr / DT Peridea / Night Trooper; DJJ / Ronin / Yoda DSV; Palpatine / Mara / Vader DE; General Syndulla / Ezra Exile / GL Ahsoka. South = Aphra / BT-1 / IG-90; Baylan / Shin / Marrok; Kelleran / Jocasta / Temple Guard; Rex / ARC / Captain Rex; GL Rey / Ben / Cal. Trap = Stormtrooper Luke / Han / Princess Leia; Stranger / Starkiller / HF Maul; Qui-Gon / JKA / Ki-Adi; Jabba / Boushh / Krrsantan; Cassian (U) / Kleya / Luthen. Maz kept off defence for their Darth Jar Jar; Great Mothers and Veers off defence (GM free for their Boss Nass).
- Datacron advice given: Lvl 3s were on GL Rey, General Syndulla and Snowtrooper teams while Lvl 9 #21, #6, #9 sat spare; suggested moving those in and #10 onto Stormtrooper Luke so Lvl 3s #8, #13, #16, #26 stay free for attack.
- With v3.8.0, Pyxroy's likely defences changed: Darth Jar Jar 40% → 97%, Baylan and Major Partagaz 20% → ~87%, Lord Vader 93% → 72%.

## Season 85 round 3 vs Grand Magus — result (20 Nov 2026)
Full clear, **2,038 to 0**. One loss: Leia / Drogan / R2 into GL Ahsoka / Ezra (Exile) / Sabine (killed only Sabine; their team was 73 speed faster). Submitted the loss (keeps Sabine dead), then Sith Eternal Emperor / Bane won; Rotta then took Queen Amidala. Lessons:
- Sean beat Qui-Gon Jinn / JKA / Ki-Adi with **Dark Trooper Moff Gideon / Captain Enoch / Scout Trooper** (easy). He prefers keeping the Inquisitors (Third Sister / GI / Seventh) for elsewhere.
- Satele / **Bastila** / JKR beats The Stranger / HF Maul / Starkiller far more than the Jolee version (swgoh.gg S85: 70% of 25.4K vs 54% of 5,290).
- Thrawn / Scorch / Tarkin (their trap) is under swgoh.gg's counters cutoff; Malgus / Malak / Darth Revan was used.
- **Sean's Great Mothers team was on defence** although Scout+'s saved list still showed Veers. Ask which swaps he actually made before using a team in attack.
- Their in-game zones: South = GL Ahsoka, Baylan, GL Rey, Amidala, Qui-Gon; North = Kelleran, Tuskens, Grievous/B2/STAP, Stranger, Barriss; Trap = Palpatine/Mara/Vader DE, Saw/Luthen/Kleya, Third Sister/GI/Seventh, Thrawn/Scorch/Tarkin, Cassian (U)/Cinta/Vel.

## Releases
- **v3.8.2–3.8.3 — PR #31 (branch `planner`), merged 21 Nov.** Attack planner picks counters for all their likely defences together (branch and bound, greedy start). 3.8.3: tries 7 counters for defences with likely ≥ 0.5 or ticked, 4 for the rest; export has `planSearch` (finished or limit reached, nodes, counters tried). Live on Pyxroy: finished in 208k nodes; Baylan → SLKR 98%, Ahsoka → Sith Eternal Emperor 82% (unit ID SITHPALPATINE), Hondo → GL Leia 98%, Lord Vader → Cere 76%. Perplexity review: kept wider search and search status; skipped banners-by-default (option exists), reserves/retries, locks/plan diff/filters, ILP.
- **v3.8.1 — PR #30 (branch `scout-likely`), merged.** "Likely next round" = one logistic model fitted on 45 Kyber players' 3v3 histories (1,419 rounds), leave-one-player-out tested; study in `tools/gac-scout/likely-study/` (RESULTS.md). Kept: recency-weighted share, recent attack use (−), HotUtils popularity (+), last round × new season (−), plus a calibration table. Dropped as no gain: last-round flag, board steadiness, datacron last time, meta hold %. Held out: Brier 0.060 vs 0.196; top-15 recall 98% vs 88%. Copilot and Perplexity both said don't tune per opponent. Sean: only add what's actually useful. Navigating the study tab lost the collected data; re-run `collect.js` to redo the study.
- **v3.7.9 — PR #29, merged 21 Nov.** Roster compare has a **Relic 10** row above Relic 9+.
- **v3.7.8 — PR #28, merged 21 Nov.** Swap rules: (1) `metaBeats`: a replacement must hold ≥ on every source the placed squad has (swgoh.gg squads, HotUtils, Insight); a missing source fails, and Insight from a different pool fails. (2) `packageSim` vetoes swaps that lower expected holds; dropped swaps go to `R.dropped`, listed only in the export's "Warnings and gaps" and `decisionBrief.swapsDropped`; a freed datacron loaned to a dropped squad is restored.
- **v3.7.7 — merged 20 Nov.** Fleets removed from the "Their actual defence" tick list; the attack plan adds their usual fleets itself (`usualFleets()`).
- **v3.7.6 — merged 20 Nov.** Tick list no longer capped at 18; every recorded defence is listed. Ticks are stored per **leader**.
- **v3.7.5 — PR #16.** Each suggested swap has **✓ Done** (replaces the outgoing squad on the saved defence, same position and zone; Undo link) and **✕ Not doing** (hides that pair for this event, `store.swapNo`; "Show again" clears).
- **v3.7.4 — PR #16.** Decision brief lists placed squads North → South → Trap, then "Suggested addition" above ADD rows.
- **v3.7.3 — PR #16.** Decision brief opens in **Short** view by default. Exports and `gacScoutPlus:report` always use Full.
- **v3.7.2 — PR #16.** Final line-up, Datacrons and Other teams start folded. Round by round tab removed from the screen; still in exports and the saved report. Sean: "I'll be using the export and referring to Claude for advice."
- **v3.7.1 — PR #15.** Zones renamed **North / South / Trap** (+ Fleet).
- **v3.7 — PR #14.** See gac-knowledge.md. HotUtils workflow runs daily by itself.

## Session notes
- Live test: load `raw.githubusercontent.com/seanvintin-wwws/tb_empire/<sha>/js/gac-scout-plus.js` into a swgoh.gg tab; Scout+ renders in a shadow root; the latest report is in `localStorage['gacScoutPlus:report']` (JSON with `md`). Testing on another profile overwrites that report, so re-run the current opponent afterwards.
- `gh pr create` fails (GraphQL blocked): open PRs with `gh api repos/seanvintin-wwws/tb_empire/pulls -f head=... -f base=main`.
- Don't push to a PR branch after it's merged; open a new PR.

## Open questions (not yet checked)
- In the Grand Magus plan, Scout+ put #18 (Lvl 9 Art of Command, Thrawn character tier) on Tarkin / DCT / Scorch and left #7 (Lvl 9, **Grand Moff Tarkin** character tier) spare. Check whether `bestDc` ranks a character-tier match on an attack squad's units first.
- The saved defence goes stale between rounds. Possible feature: a quicker way to sync it with what's set in game.
- Scout+ doesn't flag a defence squad whose suggested Lvl 9 datacron is spare while it runs on a Lvl 3.
- Teams never seen on their defence get no "likely" figure. Refit the likely model when the meta shifts a lot (e.g. once a season).
