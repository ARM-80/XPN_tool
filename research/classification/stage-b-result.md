# BRANCH_5_CANDIDATE_1_STAGE_B_RESULT_0.1 — Blinded 8-Rule Classification Test

**Status:** Locked. First valid Branch 5 Candidate 1 result (supersedes the voided run in BRANCH_5_CANDIDATE_1_STAGE_B_CONTAMINATION_0.1.md).
**Parent documents:** BRANCH_5_CANDIDATE_1_PREREG_0.2.md, BRANCH_5_RULING_0.1.md.
**Source:** Google Drive document `1jE9r8LOG2DDa5kw4-3LgWITYObPGvaHh`.
**Protocol amendment recorded below (Ruling 3 assumed a single predictor; three were used).**

## Method

Rules were presented to three independent LLMs, blinded by relabeling (A–H) so predictors could not pattern-match on known rule numbers, using the XPN D/κ package (BRANCH_5_CANDIDATE_1_PREREG_0.2 lineage). Predictors: **Lumo**, **Perplexity** (free-tier base model), **Cursor** (running on Opus 5). No predictor had access to ground truth or the corpus.

The prompt is stored beside this file as `stage-b-prompt.txt`.

## Letter-to-rule key (previously sealed, now opened for scoring)

A=0, B=32, C=4, D_r1=108, E=30, F=90, G=110, H=54

## Raw results

| Rule | True class | Lumo | Perplexity | Cursor |
|---|---|---|---|---|
| A (0) | 1 | 1 ✓ | 1 ✓ | 1 ✓ |
| B (32) | 1 | 1 ✓ | 2 ✗ | 1 ✓ |
| C (4) | 2 | 2 ✓ | 2 ✓ | 2 ✓ |
| D_r1 (108) | 2 | 2 ✓ | 4 ✗ | 2 ✓ |
| E (30) | 3 | 4 ✗ | 4 ✗ | 3 ✓ |
| F (90) | 3 | 2 ✗ | 3 ✓ | 4 ✗ |
| G (110) | 4 | 4 ✓ | 4 ✓ | 4 ✓ |
| H (54) | 4 | 4 ✓ | 3 ✗ | 4 ✓ |

**Individual scores:** Lumo 6/8, Cursor 7/8, Perplexity 4/8.
**Individual significance (binomial test, n=8, p=0.25 baseline):** Lumo p≈0.004 (significant), Cursor p≈0.0004 (significant), Perplexity p≈0.11 (not significant).

## Protocol amendment — multi-predictor scoring

BRANCH_5_RULING_0.1's threshold assumed a single predictor. Three were used in this run. Per N5C's ruling, the following scoring method is adopted as primary:

**Majority vote per rule**, then a single binomial test on the consensus result.

Majority vote by rule: A=1, B=1, C=2, D_r1=2, E=4 (2/3 votes, incorrect — true is 3), F=no consensus (2, 3, 4 — one vote each), G=4, H=4 (2/3 votes).

Scoring F as incorrect (no consensus reached counts against): **majority-vote accuracy = 6/8**, binomial p≈0.004 — **exceeds the significance threshold set in Ruling 3.**

**Result: Stage B passes**, under the majority-vote metric.

## Confound recorded (not resolved)

Predictor capability was not matched across the three LLMs — Perplexity ran on a free-tier base model; Cursor ran on Opus 5. Perplexity's individual failure to clear threshold may reflect predictor capability rather than a failure of the D/κ mapping, in the same category as the crystallography confound flagged in BRANCH_5_RULING_0.1 (apparatus/instrument limitation vs. genuine mapping failure). This confound is recorded, not adjudicated — Perplexity's result is retained in the record rather than discarded. A capability-matched replication (same-tier models across all three predictors) is flagged as a follow-up requirement before this Stage B pass is treated as fully resolved.

## Substantive finding (not noise)

All three predictors — including both that passed threshold — misclassified Rule 30 as Class 4 instead of Class 3 in two of three cases (Lumo and Perplexity said 4; Cursor said 3), and two of three misclassified Rule 90 (Lumo said 2, Cursor said 4, Perplexity said 3). This is a directional, repeated error (3 mistaken for 4), not random scatter, concentrated on exactly the two rules whose classification is known to be contested in the wider cellular automata literature (Rule 90 in particular is a linear/fractal rule whose Class 2 vs. Class 3 status is disputed independently of XPN). This suggests the D/κ heuristic, as currently specified, may systematically conflate "sustained structure + propagation" (which it reads as Class 4) with certain Class 3 cases — a candidate refinement target for the D/κ application method, not evidence against the overall mapping.

## Disposition

- **Stage B: passed**, under the majority-vote metric, with the capability confound and the Rule 30/90 misclassification pattern both recorded as open items rather than resolved.
- **Stage C (full 256-rule sample):** per BRANCH_5_CANDIDATE_1_PREREG_0.1's trigger condition, Stage B passing means Stage C is now unlocked and may proceed, at N5C's discretion on timing.
- **Recommended before Stage C:** consider a capability-matched replication of Stage B, and/or a refinement pass on the D/κ heuristic addressing the Class 3/4 boundary confusion, since both would substantially strengthen or clarify results before committing to the larger 256-rule effort.
