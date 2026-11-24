# BRANCH_5_RULING_0.1 — N5C Decisions on External Grounding Sequencing

**Status:** Locked.
**Source:** Google Drive document `1t_XnBGQs-m869_ryBWuGXd0HGG9LK95Y`.
**Supersedes:** Resolves the four open items listed at the end of EXT_GROUNDING_PROPOSAL_0.1.
**Does not modify:** Any axiom, branch status, or κ result. Branch 3 remains open with its two unresolved preregistration gaps (P-coverage, D-specification). κ‴ remains parked.

## Ruling 1 — Sequencing relative to Branch 3

**Decision:** Branch 5 opens now. Candidate 1 (Cellular Automata) runs first, ahead of Branch 3's resolution — deliberately, as a tool to help resolve Branch 3's open D-specification gap by forcing a concrete, testable instance of D to be written down.

Branch 3 is not closed by this. Its two gaps (P-coverage under A4′; D not specified in the corpus) remain open and are tracked independently. If the CA test yields a workable D, it is proposed back into Branch 3 for evaluation there — it does not automatically resolve Branch 3 by import.

## Ruling 2 — Priority order for remaining candidates

**Decision:** CA → Codes → Crystallography → Ising, as originally proposed. Order is set by ascending new-machinery cost: each candidate is sequenced to require the least additional untested apparatus before its own mapping can be checked, deferring the most expensive and highest-consequence test (Ising) until the cheaper ones have either succeeded or failed cleanly.

Crystallography is flagged with a known confound risk: the current D4 transformation set may be smaller than the full symmetry-operation set real point groups require (e.g. 3D rotations, inversion centers). A failure at this stage must first be checked against this confound before being read as a mapping failure.

## Ruling 3 — Preregistered thresholds

**CA (Candidate 1):** Success is defined as classification accuracy on Wolfram's four behavior classes that exceeds the chance baseline (25% for 4-way classification) by a statistically significant margin, evaluated via a binomial test against a preregistered rule sample (all 256 elementary CA rules, or a defined random sample of Life-like outer-totalistic rules — sample to be fixed before running). This is a real-but-achievable bar: it tests whether the mapping carries genuine signal, not whether it is already a refined classifier.

**Ising (Candidate 4):** Success is defined as a detectable discontinuity in κ's value (not merely its fluctuation size) at or near the known critical temperature, via a preregistered detection method (e.g. derivative spike in κ vs. T). This is the simpler of two legitimate definitions considered; the fluctuation-based definition (κ's variance diverging near T_c) is noted as a more physically precise but harder-to-preregister alternative, available for a follow-up test if the value-based version behaves ambiguously.

Codes and Crystallography do not require a numeric threshold — their falsification conditions are exact-match/mismatch against known mathematical results (Hamming bound; published point-group tables) and remain as specified in EXT_GROUNDING_PROPOSAL_0.1.

## Ruling 4 — Relationship between Ising and κ‴

**Decision:** Ising (Candidate 4) is quarantined from κ‴. Running the Ising test, even though it tests κ directly, does not constitute opening κ‴ and does not import any Ising result into κ‴ standing. κ‴ remains parked until Branch 3 completes, per existing standing decision. Ising results, if any, sit in Branch 5 pending a separate, explicit decision to relate them to κ‴ after κ‴ is formally reopened.

Additionally: Ising is confirmed last in the Branch 5 run order (Ruling 2) — it runs only after CA, Codes, and Crystallography have each concluded with a result (pass or fail), not concurrently with them.

**Net effect:** Branch 5 is open. CA work may begin. Codes, Crystallography, and Ising are queued in that order and remain unopened until the prior candidate in the sequence has concluded.
