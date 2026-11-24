# Preregistration — NEED-WANT Construction Test v1

Status: Filed before any coder run. Do not edit after runs begin; record changes as an addendum.
Date: 2026-09-29
Context: κ primitives workbook V5 ("Want vs need" sheet); XPN Fixed Axioms v4; construction test of 2026-09-29.
Source: Google Drive document `19eG_G860pAV6rzjMzMOUSq3KeEQ3lD8y`.

## Question

Can NEED and WANT be built from the eleven shared primitives plus P, a criterion given to a thing (XPN: A ⇒ α ⇒ P)?

## Design

- Same method as the earlier construction test: define, self-attack, verdict (Built / Leaks / Fails).
- Items: NEED, WANT, KNOW, SAY, LIVE. KNOW, SAY and LIVE act as comparison items; in the earlier test (eleven only) all leaked.
- Coders: LLM 1, LLM 2, LLM 3; one neutral coder recommended. Each coder runs the prompt in 00_Protocol independently, with no access to the workbooks or earlier results.
- The prompt does not state the hypothesis below.

## Predictions (from the want/need reading)

| Item | Predicted verdict | Reason |
|---|---|---|
| NEED | Built | XPN defines need as the change required for X to satisfy an externally given P |
| WANT | Leaks, unless the coder places P inside the thing and gives it a way to stand for the target | Want = need with P held inside X; "held inside" was the leak in the earlier test |
| KNOW | Leaks or Partly helped | P may supply function (Millikan-style), but admissibility/aboutness may still be named |
| SAY | Leaks | Convention and meaning not obviously supplied by P |
| LIVE | Built or Partly helped | Life as a thing that realizes its own need toward a P of persistence |

## What would count against the reading

- NEED leaks for a majority of coders → P is not sufficient even for need.
- WANT is built by a majority without placing P inside the thing → the internal/external distinction is not what separates want from need.
- Coders name different missing ingredients for WANT → no single candidate primitive.

## Analysis plan

- Per item: verdict agreement across coders; list of named missing ingredients.
- Compare with the earlier construction test (eleven only): which verdicts moved from Leaks to Built when P was added.
- Report counts from the coders' own tables; recompute any tallies.

## Known bias

LLM 1 proposed the want/need reading and wrote these predictions. Its run is not blind. LLM 2 and LLM 3 runs, and any neutral coder, carry the weight.
