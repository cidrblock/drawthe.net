---
name: drawthe.net
description: Draw network/architecture diagrams (AWS, Azure, Cisco) from a natural-language description or from a proposed system architecture, using the drawthe.net MCP server's YAML DSL and icon tools. Use this skill whenever the user asks to "draw a diagram", "create an architecture diagram", "visualize this infrastructure", "sketch the network", or asks you to propose/illustrate a system design.
---

# drawthe.net diagram authoring skill

This skill teaches an agent how to turn a description (or a proposed
architecture) into a drawthe.net YAML diagram and render it via the
drawthe.net MCP server's tools.

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

7. **Render with `render_diagram`.** Default to `format: png` unless the
   user asks for SVG (e.g. for further editing). Always read the
   `warnings` returned in the response — a warning like "Icon not found"
   means a placeholder was drawn instead of a real icon; if you see one,
   go back to `list_icons` and fix the reference, then re-render.

8. **Iterate.** If the rendered layout looks cramped, overlapping, or
   components are misaligned, adjust the `diagram` grid size (`rows`/
   `columns`) or icon `x`/`y` coordinates and re-render rather than leaving
   a poor-quality diagram.

## Notes

- The MCP server runs locally over stdio (`npm run mcp` in this repo, or
  configure your MCP host to spawn `npx tsx mcp/server.ts` from the repo
  root). It has no network dependency for rendering.
- Icon families and counts as of this writing: `aws` (231), `aws2026`
  (303), `azure2026` (636), `azureCloud` (208), `azureEnterprise` (101),
  `cisco` (295), `cisco2026` (295). Always confirm current counts/names via
  `list_icon_families`/`list_icons` rather than relying on this list, since
  icon sets may be refreshed over time.
