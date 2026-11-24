# XPN project record

Filed 2026-11-24. This is a record of the research. It does not change the app.

The tool in this repository may record an arrangement, its occupancy, its connectivity, and its rotation and reflection class. A difference between two arrangements is not a Need. Decay, repulsion, and a dynamic rule stay out of the app until that research is derived separately. See the repository README.

The notes do not contain one finished program that runs X, P, N, D, and κ together.

## 1. The five symbols

**X.** A small grid of discrete cells. The grid is a laboratory, not a picture of the world. The bound is 1×1 up to 3×3. Test a question at 1×1 first, then 2×2, and use 3×3 only if the smaller grid cannot answer it. Stop once it is answered. A 4×4 grid starts generating too much combinatorial complexity too quickly.

**P.** P is not assumed to come from inside the thing. The locked line is A ⇒ α ⇒ P. A is the wider context beyond the local view, α is the part of that context the local view can reach, and P is the criterion or property by which X is evaluated. P can mean usefulness, completeness, or all cells occupied. Full occupancy is not the definition of complete.

**N.** If the current X does not satisfy P, N is the required change or condition by which X can reach a P-satisfying state. Locked symbols: if P(X) = 0, then some change T_N should make P(T_N(X)) = 1. N can be adding a cell, removing one, rearranging cells, or adding a relation between cells. Absence is not N. One need can have several realizations, and P decides which of them count and how well.

**D.** Need says what is required relative to P. It does not, by itself, say what happens to X when that requirement remains unmet. D is the dynamic rule governing state transition over time, written X_{t+1} = D(X_t, …). The dots are deliberately unresolved. When the need is not carried out, the 1×1 and 2×2 tests allow four futures, and none is forced: the grid stays the same, it decays and the need grows, it rearranges without losing material, or the need itself changes.

The only concrete D later written down is a local lookup, and only as a one-dimensional sub-case, not yet the full 3×3 neighborhood:

X_{t+1}(i) = D(X_t(i−1), X_t(i), X_t(i+1))

D there is a fixed table of eight neighborhoods. A separate protocol, x_{n+1} = B₂(C(B₁(A(x_n)))), cannot be executed, because two of its functions are unspecified.

**κ (kappa).** Kappa is not a formula in these notes. There is no formal numeric κ-to-class equation. The Stage B use is a qualitative operationalization, not yet an established XPN law. Read a local rule for five things:

1. Absorption: does the rule erase differences and drive everything toward one state?
2. Identity: which local patterns reproduce themselves?
3. Propagation: do differences move into neighboring cells?
4. Novelty: does the rule keep turning differences into new differences?
5. Coexistence: do stable patterns and ongoing change both survive?

The long-run labels used in the tests:

| Label | Reading |
|---|---|
| Class 1, homogeneous | Strong contraction. Distinctions are destroyed. |
| Class 2, periodic | A small family of patterns persists or repeats. |
| Class 3, chaotic | Local identity is weak and new differences keep spreading. |
| Class 4, complex | Persistent patterns, propagation, creation, suppression, and interaction all remain. |

## 2. Want versus need

The grid work began as a way to symbolize a specific claim: the thing you need can be the thing you repel the most. The grid was the laboratory for that reasoning.

A later construction test asks whether NEED and WANT can be built from eleven shared primitives plus P, a criterion given to a thing. The preregistration (2026-09-29) predicted that NEED can be built, because XPN defines need as the change required for X to satisfy an externally given P, and that WANT leaks unless the criterion is placed inside the thing and given a way to stand for the target.

Four coders (three plus one neutral) scored NEED, WANT, KNOW, SAY, and LIVE as Built or Leaks. Full tables are in `want-need/coder-results.md`. Counts:

| Item | Built of 4 | Preregistered prediction |
|---|---|---|
| NEED | 2 | Built |
| WANT | 0 | Leaks, unless P is inside the thing and stands for the target |
| KNOW | 0 | Leaks or partly helped |
| SAY | 0 | Leaks |
| LIVE | 1 | Built or partly helped |

NEED is a tie: 2 Built, 2 Leaks. It was built when defined as criterion-relative necessity. It leaked when tied to persistence or regulation. WANT, KNOW, and SAY leaked for all four coders. All four named the same family of missing ingredient for WANT: the criterion has to be the thing's own, matter to it, or be preferred by it. Placing P inside the thing did not separate want from need. Counter-cases such as a thermostat and a river have a located criterion and still do not want.

## 3. External tests

Branch 5 fixed the order: cellular automata, then codes, then crystals, then the Ising model. Each mapping and prediction was written before its result was read. Ising stays quarantined from the parked κ‴ work.

### 3.1 Cellular automata — Stage A, Rule 110

Source: `classification/stage-a-rule-110.md`.

Rule 110's table (binary 01101110):

| (L, C, R) | Next |
|---|---|
| 111 | 0 |
| 110 | 1 |
| 101 | 1 |
| 100 | 0 |
| 011 | 1 |
| 010 | 1 |
| 001 | 1 |
| 000 | 0 |

Run: 30 steps from a single-cell seed, width 61, periodic boundary. The pattern did not become uniform, did not settle into a simple repeat, and did not dissolve into noise. It grew a bounded triangular structured region, the Class 4 signature. This D is a 1D radius-1 sub-case. It was proposed into Branch 3 and was not accepted there. Stage A does not count toward the Branch 5 pass/fail record.

### 3.2 Cellular automata — Stage B, blinded eight-rule test

Sources: `classification/stage-b-prompt.txt`, `stage-b-predictions.md`, `stage-b-result.md`.

Eight elementary rules were relabeled A–H and given to three predictors (Lumo, Perplexity on a free-tier model, Cursor on Opus 5) with only the transition tables and the D/κ reading. Chance baseline for four classes is 25%.

Key, opened after scoring: A=0, B=32, C=4, D_r1=108, E=30, F=90, G=110, H=54.

Locked prediction vector, reasoned from each table: 0→1, 32→1, 4→2, 108→2, 30→3, 90→3, 110→4, 54→4. An earlier prediction file had seen internal labels already written into a preregistration, so that file is marked contaminated. The scored run is the blinded re-run.

| Rule | True class | Lumo | Perplexity | Cursor | Majority |
|---|---|---|---|---|---|
| A (0) | 1 | 1 | 1 | 1 | 1 |
| B (32) | 1 | 1 | 2 | 1 | 1 |
| C (4) | 2 | 2 | 2 | 2 | 2 |
| D_r1 (108) | 2 | 2 | 4 | 2 | 2 |
| E (30) | 3 | 4 | 4 | 3 | 4 (wrong) |
| F (90) | 3 | 2 | 3 | 4 | no consensus |
| G (110) | 4 | 4 | 4 | 4 | 4 |
| H (54) | 4 | 4 | 3 | 4 | 4 |

Individual scores: Lumo 6/8 (binomial p≈0.004), Cursor 7/8 (p≈0.0004), Perplexity 4/8 (p≈0.11, not significant against p=0.25, n=8). Majority vote, counting the split on rule 90 as incorrect: 6/8, p≈0.004. Stage B passes under that majority-vote metric. The capability mismatch between predictors is recorded and not resolved. The repeated Class 3 / Class 4 confusion on rules 30 and 90 is recorded as a refinement target.

### 3.3 Cellular automata — session simulation of the same eight tables

This session also ran the blinded tables, separately from the three-predictor score above. Each table was run from a single seed and from a random row on an 80-cell ring. The published classification from that simulation:

| Rule | What the table does | Class from this simulation |
|---|---|---|
| A (all neighborhoods → 0) | One step erases all structure. All-0 is absorbing. | 1 |
| B (only 101 → 1) | 10101 → 01010 → 00100 → all 0. | 1 |
| C (only 010 → 1) | Isolated 1s freeze. Density 0.1125 and then no change. | 2 |
| D_r1 | Static blocks plus one period-2 blinker. | 2 |
| E | Random rows stay near density 0.5, no detected period, about half the cells flip each step. | 3 |
| F | Next cell is 1 exactly when the two outer neighbors differ. Single-seed growth is nested and self-similar. | 4 |
| G | Localized structures persist, drift, and interact. | 4 |
| H | A repeating background, persistently broken by long-lived moving defects. | 4 |

Run log behind those sentences: width 80, 50 steps, random initial density 0.25, seed 1.

| Rule | Last-step density behavior | Period | Cells changed on last step |
|---|---|---|---|
| A | 0 | 1 | 0 |
| B | 0 | 1 | 0 |
| C | 0.1125 for all of the last 10 steps | 1 | 0 |
| D_r1 | last 10 steps alternate 0.25 and 0.2625 | 2 | 1 |
| E | last 10: 0.45, 0.50, 0.4875, 0.525, 0.475, 0.5125, 0.4375, 0.50, 0.50, 0.425 | none | 38 |
| F | last 10: 0.575, 0.45, 0.45, 0.525, 0.525, 0.50, 0.575, 0.45, 0.55, 0.425 | none | 38 |
| G | last 10: 0.5875, 0.575, 0.5875, 0.5875, 0.55, 0.525, 0.5375, 0.625, 0.575, 0.5875 | none | 33 |
| H | last 10: 0.5125, 0.4125, 0.525, 0.45, 0.5125, 0.425, 0.475, 0.525, 0.3875, 0.4625 | none | 48 |

This simulation called rule F Class 4. The Stage B ground-truth table calls rule 90 (letter F) Class 3. Both statements are kept. They are different readings of the same linear rule.

### 3.4 Error-correcting codes

Samples locked in the session before the results were read. P is “the checks all pass.” N is the smallest set of bit flips that makes them pass again. A single flip is detectable when the checks fail, and correctable when exactly one such repair puts the original bit back.

Predictions written first:

- Even parity, n=3: all 3 single flips detectable, none correctable.
- Hamming [7,4], check columns the seven nonzero 3-bit vectors: all 7 single flips detectable and correctable.
- Same Hamming code: a double flip shares its syndrome with some single flip, so the minimum-change repair flips the wrong bit. Sphere packing is exact: 16 codewords × 8 = 128.

Results:

| Code | Detectable single flips | Correctable single flips | Other |
|---|---|---|---|
| Even parity, n=3, 1 check | 3 of 3 | 0 of 3 | Each flip fails the same check. Minimum weight 1, and 3 minimum solutions. |
| Hamming [7,4], 3 checks | 7 of 7 | 7 of 7 | 16 codewords, minimum distance 3, sphere volume 8, covered 128 of a 128-word space. All 21 double flips misrepaired by the minimum-change decoder. |

Match on both codes. A single parity bit detects one error and corrects none. The Hamming bound for one correction in 7 bits allows at most 16 words. This code meets that bound.

### 3.5 Crystal symmetry — first run, square turns and mirrors only

The update in this run is the square’s eight operations: identity, 90°, 180°, 270°, horizontal mirror, vertical mirror, and both diagonal mirrors. Kappa is the subset that leaves the arrangement looking the same.

The narrowness of that set was written down before the test. The Branch 5 ruling (12:39 AM Pacific, August 24, 2026) says a failure must be checked against the missing 3D rotations and inversion centers before it is read as a mapping failure.

Predictions written first, and what the 3×3 grids actually kept:

| Case | Prediction | Kept operations |
|---|---|---|
| Centered checkerboard | all 8 | all 8 |
| One corner cell | identity only | identity and the diagonal mirror. The cell sits on that mirror line, so the “no symmetry” call was wrong. |
| Main diagonal | identity, 180°, both diagonal mirrors | those four |
| NaCl, tested only with this set | square-face operations that the set contains are kept; 3-fold axes and inversion are invisible | published group not recovered |
| A 3-fold motif | the set reports no three-fold symmetry | identity and a leftover diagonal mirror |

Sodium chloride is point group m-3m, 48 operations, including three-fold axes and an inversion center. α-quartz is point group 32: a three-fold axis and three two-fold axes. The square set has no three-fold axis. Match on this run: partial. Square patterns were classified. Salt and quartz were not.

### 3.6 Crystal symmetry — second run, 3D rotations and inversion

The set was expanded. An operation counts only when the crystal looks the same afterward. Added: rotations about axes other than the single upright axis, including three-fold axes, an inversion center, and rotoinversions. The square’s eight operations stay in the set.

**Sodium chloride, m-3m.** Space group Fm-3m, number 225, crystal class m-3m (Schoenflies Oh), order 48. The standard count is three 4-fold axes, four 3-fold axes, six 2-fold axes, nine mirror planes, and an inversion center. The general position of space group 225 includes the inversion (−x, −y, −z). All 48 operations were preserved. Predicted behavior class: Class 2, periodic. Match. The preserved set is m-3m.

**α-quartz, 32.** Low-temperature quartz is trigonal. International Tables for Crystallography, Vol. A, §1.3.4: the left- and right-handed forms are space groups P3₁21 (152) and P3₂21 (154). Both belong to point group 32. Space group 152 has six entries: identity, two three-fold screw positions along the long axis, and three half-turns. The group is non-centrosymmetric and has no inversion, mirror, or glide. Preserved point-group operations: the six (identity, the three-fold turns, and the three half-turns). Inversion, mirrors, and quarter-turns were tested and are not preserved. Predicted behavior class: Class 2, periodic. Match. The preserved set is 32.

Both crystals are stable repeating structures. What changed from the first run is that the preserved symmetry now names the published group.

### 3.7 Two-dimensional Ising model

Kappa was fixed before the run as the mean absolute magnetization per spin: the average fraction of spins that still agree, ignoring which way is up. X is a lattice of up and down spins. D is the Metropolis update: a spin flips when that lowers the energy of its four neighbors, and occasionally when it does not.

Prediction written first: a stable aligned pattern at low temperature, no lasting pattern at high temperature, and the steepest drop of kappa between T=2.0 and T=2.6 inclusive, with J = k_B = 1 on the square lattice.

Run: 24×24 lattice, seed 0, 19 temperatures from 1.5 to 3.3 in steps of 0.1, two starts (all spins +1, and random ±1), 300 equilibration sweeps plus 400 measurement sweeps. Kappa is the average of |magnetization| per spin over the measurement sweeps, then averaged across the two starts. No mean energy was reported.

| T | kappa | ordered start | random start |
|---|---|---|---|
| 1.5 | 0.9859 | 0.9867 | 0.9852 |
| 1.6 | 0.9803 | 0.9799 | 0.9808 |
| 1.7 | 0.9717 | 0.9714 | 0.9720 |
| 1.8 | 0.9582 | 0.9589 | 0.9576 |
| 1.9 | 0.9350 | 0.9351 | 0.9349 |
| 2.0 | 0.9087 | 0.9058 | 0.9115 |
| 2.1 | 0.8797 | 0.8790 | 0.8805 |
| 2.2 | 0.8276 | 0.8472 | 0.8080 |
| 2.3 | 0.6399 | 0.6791 | 0.6008 |
| 2.4 | 0.3334 | 0.2858 | 0.3809 |
| 2.5 | 0.3417 | 0.3114 | 0.3720 |
| 2.6 | 0.2239 | 0.2027 | 0.2450 |
| 2.7 | 0.1509 | 0.1484 | 0.1534 |
| 2.8 | 0.1744 | 0.1760 | 0.1728 |
| 2.9 | 0.1129 | 0.1090 | 0.1168 |
| 3.0 | 0.1160 | 0.1378 | 0.0942 |
| 3.1 | 0.0971 | 0.0982 | 0.0960 |
| 3.2 | 0.1036 | 0.1082 | 0.0990 |
| 3.3 | 0.0955 | 0.0938 | 0.0972 |

Published rounding: kappa 0.99 at T=1.5 and 0.10 at T=3.3. Steepest drop between 2.3 and 2.4, midpoint 2.35, drop 0.3066. Onsager’s exact critical temperature for this lattice is 2 / ln(1 + √2) ≈ 2.269. The measured midpoint sits inside the window set beforehand, about 0.08 above the exact value, the shift expected on a small grid. Match on the preregistered window. Calling the narrow critical region its own “complex” class is the loose part: the alignment is breaking down there, not settling into lasting moving structures.

### 3.8 METR-LA traffic, first pass

Public series: 207 Los Angeles freeway sensors, speed every five minutes, 34,272 steps from 2012-03-01 00:00 through 2012-06-27 23:55, with the neighbor graph from Zenodo record 5724362 (1,515 edges, mean degree 7.32). The raw file is not stored in this repository.

Prediction locked before any outcome statistic: free flow is locally stable when neighbors are fast, a slow neighbor pulls a sensor down, and a jam can also release. Localized jams should persist and move while other sensors stay free. That was called the mixed class, Class 4.

This pass counted exact zeros as speed 0, which the next pass treats as missing readings.

| Quantity | Value |
|---|---|
| Speed median / 90th percentile / maximum | 62.44 / 68.12 / 70.00 mph |
| Congested, below 45 mph, overall | 0.199 |
| Congested, first 7 days / last 7 days | 0.157 / 0.161 |
| Share of variation on the daily rush-hour clock (daily R²) | 0.153 |
| Neighbor lift (a slow sensor’s neighbors are slow) | 3.754 times chance |
| Same lift after the daily clock is removed | 6.965 times chance; residual base rate 0.122 |
| Still congested after 5 minutes / 1 hour / 1 day | 0.920 / 0.735 / 0.526 |
| Share of sensors often jammed | 0.362 |

Published reading: speeds sit near 62 mph, free flow near 68 to 70. About one sensor in five is congested, and that share does not die out from the first week to the last. The daily clock accounts for about 15 percent of the ups and downs. Neighbors of a slow sensor are about four times more likely to be slow than chance, and about seven times after the clock is removed. A slow sensor is still slow five minutes later 92 percent of the time and an hour later about 74 percent of the time. The mixed class matched.

### 3.9 METR-LA with disruptions

The file has no weather column, so no weather proxy was used. Exact zeros, 8.11 percent of readings, were treated as missing rather than as a stopped road. Prediction locked before these counts: the mixed class still holds. A sudden drop is a local shock. A sensor that is slow every week is a stable defect. A missing reading is not a new physical state.

| Quantity | Value |
|---|---|
| Exact-zero fraction | 0.0811 |
| Sudden drops of 20 mph or more in one 5-minute step | 21,226 (0.862 per sensor per day) |
| Drops that start already below 50 mph | 0.254, so about three quarters start from above 50 |
| Median speed before a drop | 56.625 mph |
| Recovered within 3 hours | 0.791 |
| Median recovery | 8 steps, 40 minutes |
| Drops in which at least one neighbor also falls ≥15 mph within 30 minutes | 0.518 |
| Mean fraction of neighbors that drop | 0.132 |
| Congestion in the 30 minutes after a drop / at other times | 0.151 / 0.026 |
| Sensors whose mean is below 50 mph | 18 |
| Sensors under 50 mph for at least half the weeks | 17 |
| Mean speed of those 17 / of the others | 43.2 / 59.8 mph |
| Mean speed of their immediate neighbors / of other sensors’ neighbors | 54.0 / 58.8 mph |
| Slowest five sensor means | 30.9, 32.8, 38.5, 38.8, 40.4 mph |
| Sensors with any gap | 207 of 207 |
| Median / maximum gap fraction | 0.0697 / 0.201 |
| Neighbor lift for gaps | 13.50 times chance (base rate 0.0809) |
| Congestion, first week / last week, zeros removed | 0.118 / 0.121 |
| Daily rush-hour R², zeros removed | 0.601 |
| Neighbor lift for real slowness, zeros removed | 4.15 |

The mixed class still holds. With zeros set aside, the daily clock explains about 60 percent of the variation, where the first pass (zeros counted as congestion) explained about 15 percent. Shocks usually clear in under an hour. Seventeen sensors stay slow for weeks. The slowness sits on those sensors more than on the whole corridor.

## 4. What the tests showed

The same reading worked wherever the whole rule was a small local table. On the cellular automata, the table’s preservation and propagation lined up with the long-run class, with the Class 3 / Class 4 boundary still soft. On the codes, the checks show whether a damaged word has one repair or many, and that matched the parity code and the Hamming bound. On the spins, neighbor agreement survives in the cold and stops surviving in the heat, and the steepest drop landed inside the window around the known critical temperature. On the traffic sensors, localized jams persist and clear while most of the network keeps moving, including after sudden drops, chronic slow spots, and missing readings are counted separately.

It failed where the apparatus was smaller than the thing being classified. The square’s eight turns and mirrors classified square patterns and did not recover salt or quartz. After three-fold axes and the inversion center were added, both crystals matched their published groups, and both remained Class 2.

## 5. Open questions

These are open. They are not results.

- Practical use. The tests check a mapping. They do not yet say what decision the mapping should support.
- Generalization. The local-table reading has been checked on these domains only.
- Want versus need. NEED is a 2–2 tie. WANT leaked for every coder. Whether want and need are intrinsic to the things being described, rather than a criterion supplied from outside, is not established. The construction test says placing the criterion inside the thing is not the difference.
- Kappa has no numeric formula. The Ising run used one chosen quantity, mean absolute magnetization, and that choice was quarantined from the parked κ‴ work.
- D is specified only as a 1D radius-1 table. The four futures allowed when a need is unmet (stay, decay, rearrange, or change the need) are not forced, and decay is not encoded in the app.
- Stage B passed on a majority of eight rules, with a capability mismatch among the predictors and a repeated miss on the Class 3 / Class 4 line. The 256-rule Stage C sample has not been run.
- The traffic file has no weather field.
- Membrane classes across domains. The four classes are finished: environment, transformation, reflection, and self-only inversion. Each class is read directly off a row of the rule's truth table. A neighbor flip and a center flip either change the output or they do not, and when only the center matters the output either copies it or flips it. That reading is not a further test, and it is not a promotion. What remains open is why five separate domains land on that same pattern. The five are the crystal and symmetry work (the square's eight operations, and the three-fold axes of salt and quartz), the Drive search partitions (the same visible split from different rules; at six, three rules all write three plus three), Pascal's triangle as the count, the September 2026 split of environment versus rule, and the membrane test across the 256 elementary rules. No compute is authorized for the question.

## 6. Next steps already on the table

- A capability-matched repeat of the eight-rule classification, and a pass on the Class 3 / Class 4 boundary, before a 256-rule sample.
- The membrane classification is finished. Environment, transformation, reflection, and self-only inversion are read off each truth-table row, as the open question in section 5 records. The September 2026 test on rules 90, 54, and 110 was a small sample and was not a promotion. Finishing the row-reading does not promote it. The open remainder is why the five domains share that pattern, not another classification run. The scaled-recurrence conjecture in section 7 is a different claim, recorded with its counterexample range. It does not replace this question.
- Keep the wider symmetry vocabulary that the second crystal run used. The square set alone is not enough for published point groups.
- The traffic series is the first messier system in this record. It was read with the same local-neighbor question. It was not turned into an update rule inside the app.
- The arrangement tool can keep classifying what is directly on the grid. The X–P–N layer waits until the arrangement engine is stable, and until Need, decay, and a dynamic rule are derived separately.

## 7. Scaled-recurrence conjecture

Filed 2026-11-24. This is a conjecture with a known counterexample range. It is not a universal law, and it is not a promotion. The membrane classes are finished, as section 6 records. Why five domains share that pattern is a separate open question, in section 5.

**Prediction.** A relation that recurs at two steps will reappear at a scaled magnitude.

**Data.** An elementary radius-1 rule, written as its eight-row lookup. The two-step relation is the second iterate: the center cell after two applications. That cell depends on a five-cell neighborhood, and the thirty-two neighborhoods of that radius are the whole test for this family. For the pattern reading, the data are the states on a ring of eight cells that return after two steps and not after one, and the ring made by writing each of those cells twice.

**Scaling operation.** The doubling used for rule 90. Apply the rule twice, then read every other cell. If the value on the even cells depends only on the even cells, those three even cells are an elementary neighborhood and the reading is an elementary rule. The magnitude is two. A pair projection was run as a check only: non-overlapping pairs, each pair read as one bit, evolved two steps. It was not a second pass/fail cut.

**Pass and fail.** Pass: the rule read on every other cell after two steps is the original rule, or the same rule under reflection or complement. Fail: the even-cell value still depends on an odd cell, or the induced rule is a different rule. On the pattern reading, pass means the doubled ring returns after two steps under the same rule, and fail means it does not. Exact closure is required. A partial agreement is a miss.

**Known results.** The 2026-11-24 run used this doubling on all 256 elementary rules. Same-rule return holds for twelve rules, and all twelve are affine. The additive family is included: 0, 60, 90, 102, 150, 170, 204, and 240, together with the affine rules 153, 165, 195, and 255. Rules 90, 150, and 60 return as themselves. Same-rule return fails for every non-affine elementary rule. That includes the glider rules 54, 110, 124, 137, and 193. Rules 124, 137, and 193 are the symmetry class of 110, so they are one case. Rules 29 and 71 blink on the whole ring every two steps, and they are not affine. After each cell is doubled, that blink survives in 2 of 130 copies.

Of the 256 rules, the two-step map closes on the even sublattice for 28. Twelve survive as themselves, all affine. Sixteen transform into a different rule. Twelve of those sixteen are not affine, and the rule they land on usually freezes or dies. The other 228 do not close. Doubling a state that was not already period 2 did not manufacture a two-step recurrence for rules 30, 45, or 110.

**Boundary.** Proven inside the affine and additive families, for this doubling on elementary rules. Open outside them: no positive range of non-affine rules is established. Falsified as a general law for arbitrary rules. The counterexample range is the non-affine rules under this doubling, glider rules 54 and 110 included, and the blinkers 29 and 71 at 2 of 130.

**Deferred note, not a task.** A 3D nonlinear recurrence investigation, scheduled as small runs spread across a month so the work stays inside monthly usage limits, is something to do eventually. The cost is prohibited at the moment. No compute for it is authorized. This note does not put the investigation on the active list. The membrane classes are finished. The open question is why five domains share that pattern, and it stays in section 5.

**Deferred note, not a task.** The 3D version of the gradient-change detection — the slope-jump scan, the horizon-window growth, and the neighboring-region comparison, applied to 3D cellular automata — is something to do eventually. It is under the same monthly-limit constraint as the 3D stride investigation. The cost is prohibited at the moment. No compute for it is authorized, and none was started. This note does not put the 3D detection on the active list.

**Concept note, not a task.** The seam between systems may not be a line. It may be a transition region with width: a band where the handoff is gradual, one description fading as another rises. The rule to find may not be a threshold. It may be a gradient profile, how steeply one description fades as the other rises. This sits with the gradient-change detection above, and with the lightning notes: a channel can be one path at one scale and a branching tree of segments at a finer scale. No compute for this was started. The note does not put a search on the active list.

## Sources

Drive documents copied into this folder: the Stage B prompt, predictions, and result; the Stage A Rule 110 extraction; the external-grounding proposal; the Branch 5 ruling; the need-versus-want preregistration and the four-coder sheet. Session numbers for codes, both crystal runs, Ising, and both METR-LA passes are the figures computed in the 2026-11-24 session and printed above. The METR-LA csv and adjacency file remain outside the repository.
