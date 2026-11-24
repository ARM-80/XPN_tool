# BRANCH_5_CANDIDATE_1_STAGE_B_PREDICTIONS_0.1 — 8-Rule D/κ Classification Predictions

**Status:** Stage B predictions recorded prior to external verification.
**Source:** Google Drive document `1lNJVUJFWtscGnuW-FpEaE338hhgtBmeP`.
**Ground-truth constraint:** No external Wolfram classification source was consulted during prediction generation. No CA trajectory was run to convergence for the eight Stage B rules before these predictions were recorded.

## Stage A D carried forward

X_{t+1}(i) = D_r(X_t(i−1), X_t(i), X_t(i+1))

Each elementary rule r supplies a fixed deterministic lookup over the eight radius-1 neighborhoods `111, 110, 101, 100, 011, 010, 001, 000`.

This D is a 1D radius-1 reduced case. It is not the literal 2D 3×3 Moore neighborhood used by A2.

## Qualitative classifier used

κ is used as structural preservation through D. The inspected features are absorption, identity preservation, propagation, novelty, and coexistence of preservation with transformation.

- Class 1 — strong contraction; distinctions collapse toward one uniform attractor.
- Class 2 — a restricted family of fixed or repeating motifs is preserved.
- Class 3 — local identity is weak while distinctions propagate and generate broadly.
- Class 4 — persistent motifs coexist with transport, creation, suppression, and interaction.

## Locked prediction vector

| Rule | Local reason | Prediction |
|---|---|---|
| 0 | Every neighborhood maps to 0. | Class 1 |
| 32 | Only `101 → 1`. Strong contraction toward zero. | Class 1 |
| 4 | Only `010 → 1`. Isolated 1s persist; clusters are suppressed. | Class 2 |
| 108 | Center is kept except when both neighbors are 1: `D = C ⊕ (L ∧ R)`. | Class 2 |
| 30 | Balanced but asymmetric. Local differences keep producing new differences. | Class 3 |
| 90 | `D = L ⊕ R`. The center is discarded; distinctions propagate. | Class 3 |
| 110 | Persistence (`010`, `011`, `110`), propagation (`001`), filling (`101`), and suppression (`111`, `100`, `000`) coexist. | Class 4 |
| 54 | Isolated persistence, single-sided propagation, pair filling, and suppression of dense blocks coexist. | Class 4 |

These predictions were not to be changed after verification. The scored comparison is in `stage-b-result.md`.

## Blindness caveat

No external Wolfram source was consulted, and the predictions were reasoned from each transition table. The run was exposed to internal prior labels already filled into `BRANCH_5_CANDIDATE_1_PREREG_0.1.md`. The document therefore records:

```text
External-ground-truth blind: YES
Internal-label blind: NO
Overall blind-test status: CONTAMINATED / NON-INDEPENDENT
```

The later blinded re-run (prompt in `stage-b-prompt.txt`, scores in `stage-b-result.md`) is the valid Stage B result. This prediction file keeps the provenance defect attached.
