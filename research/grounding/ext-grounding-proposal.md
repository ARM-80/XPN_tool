# EXT_GROUNDING_PROPOSAL_0.1 — Candidate External Referents for X / N / P / D / κ

**Status:** Proposed at the time of writing. Branch 5 was later opened by `branch-5-ruling.md`.
**Source:** Google Drive document `1ryDEsRkQCjc81J9Iz991rv2TxTnkM3wx`.
**Purpose:** Give XPN a check it cannot pass by construction. For each candidate, the mapping and the prediction are fixed before the external ground truth is consulted.

## Candidate 1 — Cellular automata

| XPN symbol | Referent |
|---|---|
| X | Cell state, or the local neighborhood |
| D | The update rule |
| N | The condition required for a target property under the rule |
| κ | An invariant tracked across generations |

**Prediction:** From a rule's local table, D/κ predicts which of Wolfram's four classes the rule belongs to, before the rule is run to convergence.

**Falsification:** Accuracy at or below the chance baseline on a preregistered sample.

## Candidate 2 — Error-correcting codes

| XPN symbol | Referent |
|---|---|
| X | Codeword |
| N | The required parity or check condition |
| P | The code's validity criterion |
| κ | An invariant preserved under the transformation (distance, weight) |

**Prediction:** The N/P structure predicts which single-bit flips are detectable and which are correctable, matching the Hamming bound.

**Falsification:** Any mismatch with the standard result on a preregistered set of codes.

## Candidate 3 — Crystallographic point groups

| XPN symbol | Referent |
|---|---|
| X | Unit-cell arrangement |
| Transformation group | Point-group operations |
| κ | The symmetry class preserved under the group |

**Prediction:** The transformation machinery classifies which operations a known crystal admits.

**Falsification:** Misclassification against the published point-group table.

## Candidate 4 — Ising model

| XPN symbol | Referent |
|---|---|
| X | Spin configuration |
| D | Metropolis or Glauber update |
| κ | A quantity tracked across temperature |

**Prediction:** κ changes qualitatively at or near the known critical temperature.

**Falsification:** No detectable qualitative change near that temperature. The ruling later fixes the detection method as a discontinuity in the value of κ, not only in its fluctuation size. Ising stays quarantined from κ‴.
