# Mirror-Transformation Algebra

Version: 0.1.0  
Status: Established for the arrangement engine; interpretation unassigned  
Scope: Binary square grids of size 1×1, 2×2, and 3×3

## 1. Purpose

This note formalizes the relationship between the earlier paired-axis notation
(X_1,X_2,Y_1,Y_2) and the rotation/reflection engine implemented by XPN Tool.

It establishes a geometric and algebraic bridge only. It does not assign physical,
causal, κ, X, P, N, Need, decay, repulsion, or recursive meaning to an arrangement.

## 2. Arrangement domain

For a supported size (nin{1,2,3}), define the arrangement space

[
mathcal G_n={0,1}^{n	imes n}.
]

An arrangement (Ginmathcal G_n) has entries (g_{r,c}), where

[
r,cin I_n={0,1,ldots,n-1}.
]

The midpoint index is

[
k_n=rac{n-1}{2}.
]

Define the paired horizontal-position classes

[
X_1={(r,c):c<k_n},
qquad
X_2={(r,c):c>k_n},
]

and the paired vertical-position classes

[
Y_1={(r,c):r<k_n},
qquad
Y_2={(r,c):r>k_n}.
]

Thus (X_1/X_2) mean left/right and (Y_1/Y_2) mean top/bottom in the displayed
matrix. For odd (n), the center column and center row lie on the mirror axes and
are fixed sets rather than members of either opposed class. For even (n), each
axis lies between cells.

These labels describe positions. They do not assign values or ontological roles.

## 3. Eight square transformations

Let (H=T(G)), with entries (h_{r,c}). The engine implements:

| Mathematical symbol | Code name | Definition |
|---|---|---|
| (e) | identity | (h_{r,c}=g_{r,c}) |
| (r) | `rotate90` | (h_{r,c}=g_{n-1-c,r}) |
| (r^2) | `rotate180` | (h_{r,c}=g_{n-1-r,n-1-c}) |
| (r^3) | `rotate270` | (h_{r,c}=g_{c,n-1-r}) |
| (m_Y) | `reflectLeftRight` | (h_{r,c}=g_{r,n-1-c}) |
| (m_X) | `reflectTopBottom` | (h_{r,c}=g_{n-1-r,c}) |
| (m_D) | `reflectMainDiagonal` | (h_{r,c}=g_{c,r}) |
| (m_A) | `reflectAntiDiagonal` | (h_{r,c}=g_{n-1-c,n-1-r}) |

The subscript on (m_X) or (m_Y) names the fixed axis:

- (m_Y) mirrors across the vertical (Y)-axis and therefore performs a
  left/right flip.
- (m_X) mirrors across the horizontal (X)-axis and therefore performs a
  top/bottom flip.

This removes the common ambiguity between “flip the X values” and “reflect across
the X-axis.”

## 4. Paired-axis action

The axial mirrors act on the paired position classes as follows:

[
m_Y:X_1leftrightarrow X_2,
qquad
m_Y:Y_imapsto Y_i,
]

[
m_X:Y_1leftrightarrow Y_2,
qquad
m_X:X_imapsto X_i.
]

Cells on an odd grid's fixed axis remain on that axis. Their occupancy value is
carried through unchanged.

The operation therefore changes orientation or relational placement. It does not
create, destroy, promote, or reinterpret the cell value.

## 5. Group structure

Use function composition

[
ab=acirc b,
]

so (b) is applied first. Let

[
r=	exttt{rotate90},
qquad
s=m_Y=	exttt{reflectLeftRight}.
]

The implemented transformations satisfy the presentation

[
D_4=langle r,smid r^4=e, s^2=e, srs=r^{-1}angle.
]

The code's eight named transformations can be generated from (r) and (s):

[
egin{aligned}
e&=e,\
R_{90}&=r,\
R_{180}&=r^2,\
R_{270}&=r^3,\
M_{LR}&=s,\
M_{TB}&=r^2s=sr^2,\
M_D&=sr,\
M_A&=rs.
end{aligned}
]

The complete group is noncommutative. In general,

[
rs
e sr.
]

### 5.1 Axial mirror subgroup

The two axial mirrors generate the four-element subgroup

[
H_{mathrm{axis}}={e,r^2,m_X,m_Y}.
]

Its defining relations are

[
m_X^2=m_Y^2=e,
]

[
m_Xm_Y=m_Ym_X=r^2.
]

Therefore

[
H_{mathrm{axis}}cong C_2	imes C_2cong V_4,
]

the Klein four-group.

Its multiplication table is:

| (circ) | (e) | (r^2) | (m_Y) | (m_X) |
|---|---:|---:|---:|---:|
| (e) | (e) | (r^2) | (m_Y) | (m_X) |
| (r^2) | (r^2) | (e) | (m_X) | (m_Y) |
| (m_Y) | (m_Y) | (m_X) | (e) | (r^2) |
| (m_X) | (m_X) | (m_Y) | (r^2) | (e) |

The earlier (X_1/X_2,Y_1/Y_2) mirror algebra is therefore not discarded. It is
the axial (V_4) subgroup inside the fuller (D_4) arrangement algebra.

## 6. Orbits and equivalence classes

The rotation orbit of (G) is

[
operatorname{Orb}_{C_4}(G)
={G,rG,r^2G,r^3G}.
]

The dihedral orbit is

[
operatorname{Orb}_{D_4}(G)
={tG:tin D_4}.
]

Define two equivalence relations:

[
Gsim_{mathrm{rot}}H
iff
Hinoperatorname{Orb}_{C_4}(G),
]

[
Gsim_{D_4}H
iff
Hinoperatorname{Orb}_{D_4}(G).
]

XPN Tool stores a canonical class identifier by selecting the orbit member with
the smallest integer bitmask. This is a deterministic representative of an
equivalence class, not a claim that the other orientations cease to exist.

Accordingly, the tool keeps three distinct scopes:

1. **EXACT** — one arrangement in one orientation.
2. **ROT** — the arrangement modulo rotation.
3. **R+R** — the arrangement modulo rotation and reflection.

## 7. The 3×3 class counts

There are

[
|mathcal G_3|=2^9=512
]

exact binary arrangements.

Burnside's lemma gives the number of rotation classes:

[
rac{1}{4}
left(
2^9+2^3+2^5+2^3
ight)
=
rac{512+8+32+8}{4}
=140.
]

For the full dihedral action, each of the four reflections on a 3×3 grid has six
cell cycles and therefore fixes (2^6=64) binary arrangements. Hence

[
rac{1}{8}
left(
512+8+32+8+4cdot64
ight)
=
rac{816}{8}
=102.
]

These derived counts agree with the exhaustive classifications in the test suite:

[
512longrightarrow140longrightarrow102.
]

## 8. Preserved and changed properties

Every (D_4) transformation preserves:

- grid size;
- occupied-cell count;
- empty-cell count;
- four-neighbour adjacency;
- connected-component count;
- center occupancy;
- corner/edge membership as sets;
- membership in the same dihedral orbit.

A transformation may change:

- exact bitmask;
- displayed orientation;
- which particular corner or edge is occupied;
- handedness under reflection;
- exact arrangement identity while retaining class identity.

This distinction is the operational meaning of “the structure is invariant while
its presentation changes.”

## 9. Evidence and interpretation status

| Statement | Status |
|---|---|
| The eight implemented maps act on (mathcal G_n) as (D_4). | **ESTABLISHED** for the arrangement engine. |
| Axial reflections form a (V_4) subgroup. | **ESTABLISHED** mathematically and verified by tests. |
| (X_1/X_2,Y_1/Y_2) denote opposed grid-position classes. | **WORKING DEFINITION** bridging the earlier notation to the engine. |
| The 3×3 universe has 512 exact, 140 rotation, and 102 dihedral classes. | **ESTABLISHED** by Burnside derivation and exhaustive tests. |
| These transformations model κ, X–P–N dynamics, physical processes, or causality. | **NOT ESTABLISHED / OUT OF SCOPE**. |
| Fibonacci recurrence identifies or predicts these symmetry classes. | **OPEN QUESTION / NOT IMPLEMENTED**. |

## 10. Falsification and regression criteria

The implementation would violate this formalization if any supported arrangement
produced one of the following:

1. a transform result outside (mathcal G_n);
2. a reflection that was not self-inverse;
3. (r^4G
e G);
4. (srsG
e r^{-1}G);
5. nonclosure under composition;
6. an unstable canonical identifier within an orbit;
7. a 3×3 class count other than 512 exact, 140 rotational, or 102 dihedral.

The automated algebra tests evaluate these identities over every supported binary
arrangement.

## 11. Implementation traceability

- `src/core/grid.ts` defines (mathcal G_n), exact IDs, and bitmasks.
- `src/core/transforms.ts` defines the eight (D_4) actions and canonical orbits.
- `src/core/transform-algebra.test.ts` verifies the group presentation and the
  axial subgroup exhaustively.
- `src/core/transforms.test.ts` verifies transform behavior, orbit stability, and
  the 512/140/102 class counts.
- `src/core/classify.ts` records observable invariant properties.
- `src/core/relationships.ts` distinguishes exact, rotation, and dihedral scope.

## 12. Revision history

### 0.1.0

- Formalized the eight implemented transformations as (D_4).
- Located the paired-axis mirror algebra as the (V_4) axial subgroup.
- Defined a precise bridge for (X_1/X_2,Y_1/Y_2).
- Derived the 3×3 class counts with Burnside's lemma.
- Preserved the boundary between geometric observation and X–P–N interpretation.
