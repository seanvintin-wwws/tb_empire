# "Likely next round" study (21 Nov 2026)

**Question:** how likely is each defence an opponent has set before to be on their defence next round?

**Data:** 3v3 GAC histories of 45 Kyber players, snowballed from Pyxroy, jobobhi and FireFight through their
opponents' pages (`collect.js`, run in a swgoh.gg tab, ~1 request per 1.3 s). That's 1,419 rounds. 937 rounds had
4+ earlier rounds and at least 30% of the board observed, giving 19,082 (round, leader) rows. Meta: HotUtils Kyber 3v3
(19 Nov). Note: the meta snapshot is current, not as of each past round, so its contribution is slightly optimistic.

**Method (`model.js`):**
- Candidates are leaders the player has set on defence before.
- Target: the leader was seen on their defence that round. Histories only show defences that were attacked, so a
  "not set" from a round where few of their squads were seen counts only partly (weight = share of the board seen).
- Logistic regression, one set of weights for everyone, scored by **leaving each player out** (fit on the other 44).
- Scored on well-observed rounds (80%+ of the board seen).

**Grid (decay per round w, shrink kappa, older-season weight qs):** best w 0.5, kappa 0.5, qs 0.5.

**Adding signals one at a time (Brier, lower is better):**

| Model | Brier | Log loss | Top-15 recall | Top-17 recall |
| --- | --- | --- | --- | --- |
| Decay-weighted share only | 0.0766 | 0.275 | 97.9% | 99.0% |
| + set last round | 0.0754 | 0.271 | 97.4% | 98.9% |
| + how much their defence changes | 0.0754 | 0.271 | 97.4% | 98.9% |
| + used on attack recently | 0.0719 | 0.261 | 97.8% | 99.0% |
| + datacron they ran on it last time | 0.0721 | 0.262 | 97.7% | 98.9% |
| + meta popularity | 0.0701 | 0.255 | 97.7% | 99.0% |
| + meta hold % | 0.0702 | 0.255 | 97.7% | 99.0% |
| + set last round x new season | 0.0695 | 0.252 | 97.8% | 99.0% |
| + share as a plain number too | 0.0671 | 0.246 | 97.9% | 99.1% |

**Kept:** share (log-odds and plain), used on attack, meta popularity, set last round x new season:
Brier 0.0667, top-15 recall 98.0%. Coefficients: intercept −5.311, log-odds share −0.352, share 8.326,
attack −2.867, popularity 1.621, last round x new season −1.05.

**Dropped (no gain once the others were in):** an extra "set last round" flag (decay of 0.5 per round already makes
last round count most), steadiness, datacron last time, meta hold %.

**Calibration:** the raw model was under-confident in the middle (said 45%, came true 64%). A monotone calibration
table from the held-out predictions fixes it: Brier 0.060 after. The table was fitted on the same held-out predictions
it's scored on, so that last figure is a little optimistic.

**Baselines (same rows):**

| Baseline | Brier | Top-15 recall |
| --- | --- | --- |
| Old Scout+ (share of rounds over two seasons) | 0.196 | 87.9% |
| Repeat last round exactly | 0.189 | 97.9% |
| New model, calibrated | 0.060 | 98.0% |

So most of the gain in *which* teams come up is simply recency (repeating last round is almost as good at ranking).
The model's gain is that its percentages mean something, which matters because the package check weights by them.
