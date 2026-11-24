# BRANCH_5_CANDIDATE_1_STAGE_A_RESULT_0.1 — Rule 110 D-Extraction

**Status:** Stage A complete. Result proposed into Branch 3 for evaluation — not yet accepted as Branch 3's D.
**Parent document:** BRANCH_5_CANDIDATE_1_PREREG_0.1.
**Source:** Google Drive document `1z0A3UYLX3e9pWnpdkZ-A1_W0FwhYFyfH`.

## Extracted D

Rule 110's transition table (binary 01101110), in XPN D-notation:

X_{t+1}(i) = D(X_t(i−1), X_t(i), X_t(i+1))

| (L, C, R) | D(L,C,R) |
|---|---|
| 1,1,1 | 0 |
| 1,1,0 | 1 |
| 1,0,1 | 1 |
| 1,0,0 | 0 |
| 0,1,1 | 1 |
| 0,1,0 | 1 |
| 0,0,1 | 1 |
| 0,0,0 | 0 |

D is deterministic, local (radius-1), and fully specified — no free parameters, no invented behavior. This is the first concrete instance of D produced anywhere in the corpus.

## Scope caveat (recorded, not resolved)

This D is defined over a **1D, radius-1 neighborhood** (3 cells: left, center, right). A2's investigation bound is framed around the full **2D 3×3 Moore neighborhood** (a cell plus all 8 surrounding cells). Rule 110 is a smaller, degenerate case of the same general principle — local neighborhood determines next state — but is not a literal instance of the 3×3 grid. This D should not be represented in Branch 3 as fully satisfying A2's scope; it satisfies a reduced 1D sub-case. Extension to a full 2D Moore-neighborhood CA (e.g. a Life-like rule) is a candidate follow-up if a literal 3×3 D is required.

## Validation against known behavior

D was run for 30 steps from a single-cell seed (width 61, periodic boundary). Output pattern:

- No convergence to a uniform state (rules out Class 1).
- No settling into a simple repeating structure (rules out Class 2).
- No dissolution into unstructured noise (rules out Class 3).
- Growth of a bounded, triangular, non-repeating but visibly structured region — the documented signature of **Class 4 (complex)** behavior.

This matches Rule 110's published classification and its known status as (conjectured/proven, per Cook 2004) Turing-complete. The extracted D is therefore validated as behaviorally consistent with its known ground truth before being proposed into Branch 3.

## Disposition

- **Proposed to Branch 3:** This D, with its scope caveat attached, is submitted as a candidate answer to Branch 3's "D is not specified in the corpus" gap. Branch 3 remains open pending N5C's evaluation of whether this D (or a generalization of it) is accepted, and pending resolution of the separate P-coverage gap.
- **Branch 5 status:** Stage A is exploratory and explicitly exempt from the Candidate 1 accuracy threshold (per its preregistration). It does not count toward Branch 5's pass/fail record. Stage B (8-rule preregistered classification sample) is next.
