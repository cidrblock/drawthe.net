---
name: drawthe.net
description: Draw network/architecture diagrams (AWS, Azure, Cisco) from a natural-language description or from a proposed system architecture, using the drawthe.net MCP server's YAML DSL and icon tools. Use this skill whenever the user asks to "draw a diagram", "create an architecture diagram", "visualize this infrastructure", "sketch the network", or asks you to propose/illustrate a system design.
---

# drawthe.net diagram authoring skill

This skill teaches an agent how to turn a description (or a proposed
architecture) into a drawthe.net YAML diagram and render it via the
drawthe.net MCP server's tools. The result should be a build blueprint:
someone reading it should understand what to provision, how traffic and
data move, what is required versus optional, and what to configure next.

### ARCHITECTURE DIAGRAM DESIGN SYSTEM & AESTHETIC DIRECTIVES

When authoring system architecture diagrams in YAML, adhere strictly to these architectural visual design principles:

#### 1. Architectural Layout & Directional Flow
* **Determine the Primary Axis:**
  * **Top-to-Bottom (Layered Systems):** Use for Tiered/Client-Server architectures (Presentation → Processing/Logic → Storage → External Infrastructure).
  * **Left-to-Right (Data & Workflow Pipelines):** Use for event-driven systems, ETL pipelines, integration flows, or user journey sequences.
* **Dedicated Cross-Cutting Rows/Columns:** Place auxiliary or cross-cutting services (e.g., Logging, Authentication, Telemetry, Storage) on a dedicated side column or bottom row rather than interspersing them within the core flow.
* **Spatial Breathability:** Always leave 1–2 empty grid steps between connected components to provide space for connection lines without crossing icons or text.

#### 2. Restrained Color System & Contrast
* **Canvas:** Use the established white canvas (`white`) unless the user requests another treatment.
* **Default Elements:** Use dark readable text and lines (`black` for labels and `#334155` for connections/borders). Do not use the historical orange renderer defaults for blueprint styling.
* **Containers:** Use light-gray or very lightly tinted fills with a consistent border, such as `#F1F5F9` with `#94A3B8`. Container color should establish hierarchy without competing with the topology.
* **Icons:** Preserve native vendor icon artwork. Do not impose a diagram-wide accent palette or override icon fills/strokes unless the selected icon has been previewed and the override is intentional.

#### 3. Domain Grouping & Boundaries
* **Container Enclosure:** Wrap related components in named groups (e.g., Services, Data Domain, External System, Core Boundary).
* **Line Style Rules:**
  * **Solid Lines:** Direct synchronous calls, primary system processes, or hard structural boundaries.
  * **Dashed Lines (`strokeDashArray: [4, 4]`):** Asynchronous events, metadata/telemetry flows, or logical/trust boundaries.
* **Group Headers:** Choose one placement for all group names, commonly `bottomMiddle` for north-to-south flows, and keep it consistent unless a collision is unavoidable.

#### 4. Typography & Label Symmetry
* **Unified Alignment:** Standardize `textLocation` across the entire diagram. Use the selected group/icon placement consistently; the established blueprint default is `bottomMiddle`. Never mix alignments within the same diagram unless a documented collision makes it unavoidable.
* **Readable Display Names:** Always use explicit, concise display text with the `text:` attribute (e.g., `text: "Auth Service"`) instead of raw technical identifiers (e.g., `auth_svc_node_01`).

#### 5. Connection Line Discipline
* Align connected components along straight grid lines to eliminate diagonal line clutter.
* Group multi-destination fan-outs neatly through shared alignment rather than overlapping multiple connection lines across the canvas.

## Prerequisites

The drawthe.net MCP server must be connected and expose these tools:

- `get_dsl_reference` — returns the full YAML DSL syntax reference.
- `list_icon_families` — lists available icon families and icon counts.
- `list_icons` — lists/searches icon names within a family.
- `get_icon` / `get_icon_svg` — preview a specific icon (PNG/SVG) to confirm it looks right before using it.
- `render_diagram` — renders a YAML diagram to PNG or SVG.

## Procedure

1. **Read the DSL reference first.** Call `get_dsl_reference` before
   writing any YAML if you have not already seen it in this conversation.
   Do not guess at the syntax — the `diagram`, `title`, `icons`, `notes`,
   `groups`, and `connections` sections each have specific required and
   optional fields.

2. **Identify the components in the description.** Break the request down
   into concrete entities (servers, load balancers, databases, gateways,
   VPCs/VNets, users, external services, etc.) and the connections between
   them. If the user proposes an architecture rather than describing an
   existing one, design a sensible one first (reasonable tiers, redundancy,
   networking boundaries), then diagram it.

    State the architecture assumption in the title or a note when the
    request is ambiguous. For example, RHDH on ROSA is materially different
    from RHDH on EKS or RHDH on EC2.

    Design the blueprint before choosing icons. Organize it into these layers
    where they apply:
    - prerequisites and network foundation: account, region, VPC, AZs,
       public/private subnets, routing, security groups, IAM, and certificates;
    - request path: users, DNS, edge/load balancer, ingress, and application;
    - platform: cluster, namespaces, operators, ingress controller, and
       workload replicas;
    - dependencies: identity, database, secrets, object storage, registries,
       source control, and observability;
    - build notes: required configuration, optional choices, and an ordered
       implementation sequence.

    Do not draw every plausible service. Include a component only when it
    answers a deployment question, and mark it as required, optional, or
    external in its label or notes.

3. **Choose the right icon family based on vendor keywords in the
   request** — there is no fixed default family. Inspect the request for
   vendor/platform signals:
   - AWS services/terms → `aws2026` (preferred, current) or `aws` (legacy).
   - Azure services/terms → `azure2026` (preferred), or `azureCloud` /
     `azureEnterprise` (legacy).
   - Cisco/network hardware terms → `cisco2026` (preferred) or `cisco` (legacy).
   - Generic/vendor-neutral request → pick whichever family has the closest
     conceptually matching icon; prefer the modern `*2026` families.
   Call `list_icon_families` if you're unsure what's available.

4. **Never invent an icon name.** For every component, call `list_icons`
   with the family and a keyword query (e.g. `query: "load_balanc"`) to find
   the real icon name before writing an `icon:` reference in YAML. Use
   `get_icon` or `get_icon_svg` to visually confirm an ambiguous match
   before committing to it.

5. **Always prefer a meaningful, accurate icon over a generic
   placeholder.** If an exact icon for a component doesn't exist in the
   chosen family, search for the closest conceptually similar icon (e.g. a
   generic "server" or "compute" icon for an unlisted service type) rather
   than defaulting to a plain box or an unrelated icon. Only fall back to a
   generic shape (e.g. via `notes`) if truly no reasonable icon exists in
   any relevant family.

6. **Write the YAML diagram** using the DSL: define `diagram` (grid size,
   background), optionally `title`, then `icons` (with `x`/`y` grid
   coordinates, using relative positions like `x: "+1"` where convenient),
   `groups` to box related components together, and `connections` between
   icon keys. Use YAML anchors for repeated styling if helpful.

    Start from the light, readable style below unless the user explicitly
    requests a different visual treatment:

      diagram:
         fill: "white"
       gridLines: false
       groupPadding: 0.4
    title:
       color: "black"
       fill: "white"
       logoFill: "none"
       stroke: "black"
       type: "box"
       heightPercentage: 6
    group: &group
       - { color: "black", stroke: "#94a3b8", fill: "#f1f5f9" }
    connection: &connection
       color: "#334155"
       stroke: "#334155"

   Use `groups` as a list of objects, not a map. Layer groups must be
   visibly distinct from a white canvas. For a hierarchy, use a restrained
   sequence of light fills so the layers can be scanned without competing
   with the topology, for example: foundation `#eaf2f8`, request/data flow
   `#eef6ee`, platform `#fff7e6`, and workloads/dependencies `#f1f5f9`.
   Keep the border treatment consistent across all groups. Use
   Choose one `textLocation` for every group heading before laying out the
   diagram, and use it consistently across the hierarchy. `bottomMiddle` is
   often a good choice for north-to-south flows because headings sit outside
   the incoming edge of each layer. Label placement must be consistent
   unless consistency is impossible because the label is blocked. If a
   connection, icon, or note crosses or obscures a heading, first fix the
   layout by moving the affected component, changing spacing, or rerouting
   the connection. Only when those fixes cannot remove the collision may one
   heading use another position, and that exception must be documented.
   Do not set `iconFill`, `iconStroke`,
    or `preserveWhite` globally without previewing the selected family first;
    those overrides can erase or wash out native vendor icon artwork.

    Never rely on renderer defaults for presentation output: the historical
    defaults use orange and are intended for backward compatibility. Always
    specify a background, title colors, group styling, and connection colors.
   For blueprint icons, set `color: "black"`, `fill: "white"`, and a dark
   `stroke` explicitly so labels remain readable around vendor artwork.

   Every icon must have an explicit human-readable `text` label. Never
   expect the viewer to infer a service from an icon or filename. Keep icon
   labels short (normally one to three words), such as `RHDH`, `ROSA`,
   `PostgreSQL`, and `Route 53`; put `(required)`, `(optional)`, or
   `(external)` in notes or a legend rather than shrinking a long label until
   it becomes unreadable. Use notes for configuration detail rather than
   packing prose into icon labels.

   Use connections to show meaningful flows, not merely membership. Add
   notes that explain numbered flows such as `1. DNS resolves the public
   hostname`, `2. ingress terminates TLS`, and `3. RHDH accesses PostgreSQL
   and secrets`. Avoid a dense web of lines from one central icon to every
   service; group dependencies and use notes to explain shared access.

   For layered network, platform, or application diagrams, orient the
   dominant data or request flow north-to-south: producers, users, or
   external/WAN edge at the top; routing, security, or core next; access,
   platform, or processing tiers below that; and databases, storage, or
   downstream consumers at the bottom. If the system's dominant flow is
   different, state the assumption and preserve one clear direction rather
   than mixing vertical and horizontal reading orders. Reuse the same x
   coordinates across tiers wherever devices form a logical column or pair.
   Inspect every group heading against the rendered connection paths and
   icons. Do not leave a label underneath a line or behind an icon. Prefer
   repairing the layout while preserving the chosen label position; use a
   different position only when the collision cannot otherwise be removed.

   Within each layer, calculate and use an intentional spacing rhythm for
   sibling icons. Equal-role nodes should use equal x intervals unless a
   documented architectural grouping requires otherwise. Do not move one
   icon to solve a collision and leave the remaining layer on an accidental
   set of unequal gaps; rebalance the entire layer and update its connections.

   For nontrivial diagrams, perform at least three render-review passes:
   render the initial layout, inspect the actual SVG and PNG/SVG preview,
   correct spacing/labels/connections, and render again. Repeat until the
   topology, hierarchy, label placement, and whitespace are stable. Do not
   deliver a diagram based only on YAML inspection or a single successful
   render command.

7. **Render with `render_diagram`.** Default to `format: png` unless the
   user asks for SVG (e.g. for further editing). Always read the
   `warnings` returned in the response — a warning like "Icon not found"
   means a placeholder was drawn instead of a real icon; if you see one,
   go back to `list_icons` and fix the reference, then re-render.

8. **Run the blueprint quality gate.** Before presenting the result, verify
   that the image answers these questions:
   - What deployment target and assumptions are shown?
   - What must be provisioned first?
   - How does a user reach the application?
   - Where do authentication, persistence, secrets, and images come from?
   - Which components are required, optional, or external?
   - What should the reader configure next?

   Reject and revise any diagram with unlabeled icons, unexplained vendor
   artwork, ambiguous flows, decorative components, or a layout that cannot
   be read at normal viewing size.

9. **Iterate.** If the rendered layout looks cramped, overlapping, or
   components are misaligned, adjust the `diagram` grid size (`rows`/
   `columns`) or icon `x`/`y` coordinates and re-render rather than leaving
   a poor-quality diagram. Check the actual image preview, not just the
   tool response: the canvas must be light and opaque, labels must be
   readable, groups must not overlap unrelated groups, and connection lines
   must not dominate the diagram. Increase the grid size before shrinking
   labels or packing more components into one cell.

11. **Always deliver the source YAML.** After the diagram passes the quality
   gate, save the complete YAML as a new `.yaml` document and provide that
   document to the user alongside the rendered image. Never provide only a
   screenshot or an inline abbreviated snippet; the YAML is the editable
   blueprint the user will build from and revise later.

## Notes

- The MCP server runs locally over stdio (`npm run mcp` in this repo, or
  configure your MCP host to spawn `npx tsx mcp/server.ts` from the repo
  root). It has no network dependency for rendering.
- Icon families and counts as of this writing: `aws` (231), `aws2026`
  (303), `azure2026` (636), `azureCloud` (208), `azureEnterprise` (101),
  `cisco` (295), `cisco2026` (295). Always confirm current counts/names via
  `list_icon_families`/`list_icons` rather than relying on this list, since
  icon sets may be refreshed over time.
