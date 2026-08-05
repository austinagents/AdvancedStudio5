# Product Templates 2

## Runtime contract

- Total duration: 8 seconds.
- Active geometry: 0–6 seconds.
- Exact product hold: 6–8 seconds.
- At 6.0 seconds all geometry influence must equal zero.
- Final product uses the proven exact-product material.

## Architecture contract

Templates 57–66 are NOT variants of one deformation engine.

Each template owns its geometry architecture.

### 57 — Articulated Strips

Product is structurally divided into longitudinal product-derived strips.
Strips exist as independent geometry and articulate in 3D before physically
returning to their exact product coordinates.

### 58 — Section Stack

Product is divided into transverse sections.
Sections become actual separated depth geometry, reorder spatially, then
collapse into the exact product.

### 59 — Faceted Assembly

Product surface becomes connected polygonal/faceted geometry.
Facets articulate around shared structural relationships and resolve into
the continuous product surface.

### 60 — Contour Architecture

Silhouette-derived contour sections become physical nested geometry.
Contours separate through depth and scale, interact, then reconstruct the
product boundary-to-center.

### 61 — Hinged Panels

Product-derived panels become articulated rigid sections with actual hinge
axes. The transformation is panel articulation, not a vertex-wave effect.

### 62 — Depth Layers

Product artwork/silhouette is represented by real separated depth layers.
Layers occupy different Z planes and mechanically converge to Z=0.

### 63 — Structural Fragmentation

Product surface is partitioned into deterministic connected fragments.
Fragments have individual transforms and reconstruct into exact coordinates.

### 64 — Extruded Sections

Product-derived sections become actual shallow extruded geometry with depth,
side faces, and front product sampling before depth collapses to the product.

### 65 — Ribbon Construction

Product is represented by continuous structural ribbons generated from the
product surface. Ribbons travel through 3D and flatten into the exact surface.

### 66 — Mechanical Reconstruction

Product is partitioned into larger structural assemblies with explicit
translation/rotation relationships. Assemblies mechanically lock into the
final product.

## Prohibited direction

Do not implement these as ten GLSL formulas on the same PlaneGeometry.

Do not use:

- generic sine-wave deformation as the concept
- camera movement as the concept
- simple scale/rotation of the entire product
- arbitrary noise displacement
- generic ripple effects
- generic warp fields
- layout tricks
- a hidden ExactProduct reveal replacing unresolved geometry
- ProductFormationEngine tile reconstruction
- one shared engine with ten variant strings

The geometry system itself must distinguish each template.
