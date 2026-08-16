# XPN Tool

A small iPhone-first arrangement-space explorer for the X–P–N research model.

## Current scope

This repository starts with the **arrangement engine**, not with assumptions about `P`, `N`, decay, repulsion, or dynamics.

The first layer supports binary grids of size 1×1, 2×2, and 3×3 and treats rotation/reflection structure as foundational.

## Architecture

```text
src/
  core/
    grid.ts            exact grid representation and IDs
    transforms.ts      rotations, reflections, symmetry orbits
    classify.ts        intrinsic/local arrangement classifications
    relationships.ts   arrangement-to-arrangement links (later)
  App.tsx               thin UI over the core engine
```

The mathematical/core layer must remain independent of React so the research model can change without rewriting the UI.

## Research boundary

For now, the app may classify what is directly observable from the grid:

- exact arrangement
- occupancy
- connectivity/components
- center/corner/edge occupancy
- rotation class
- rotation + reflection (dihedral) class
- symmetry/orbit properties

It must **not** infer that a difference is a Need, nor encode decay, repulsion, or a dynamic rule until those are separately derived in the research.

## Development

```bash
npm install
npm run dev
npm test
npm run build
```

## Near-term milestones

1. Exact 1×1 / 2×2 / 3×3 grid editor.
2. Rotation and reflection transform engine with canonical class IDs.
3. Intrinsic arrangement classifications.
4. Browse/filter the complete arrangement space (up to 512 raw 3×3 states).
5. Add relationship links between arrangements.
6. Add the X–P–N research layer only after the arrangement engine is stable.
