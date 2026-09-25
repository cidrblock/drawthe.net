/** Condensed drawthe.net YAML DSL reference for agent consumption. See README.md for the full docs. */
export const DSL_REFERENCE = String.raw`# drawthe.net YAML DSL

A diagram is a YAML document with these top-level sections (all optional):

- diagram: the page/grid the diagram is drawn on
- title: a title bar rendered above the diagram
- icons: a map of key -> icon entity, placed on the grid
- notes: a map of key -> note entity (text/markdown boxes), placed on the grid
- groups: a map of key -> group entity, drawing a box around a set of icons
- connections: a list of lines drawn between icons/notes/groups

## diagram
- fill: background color (default "orange")
- aspectRatio: e.g. "16:9" (default "1:1")
- rows, columns: grid size (default 10x10) - all icon/note x/y coordinates are grid cells, not pixels
- gridLines: boolean, show grid lines (default true) - set false for a clean look
- groupPadding: 0-1, space around grouped icons (default .33)

## title
- text, subText, author, company, date, version
- color, stroke, fill: colors
- type: "box" (default) or "bar"
- heightPercentage: 0 to hide the title entirely

## icons (map of key -> entity)
Each icon needs a unique key (used as the label unless "text" is set).
- x, y: grid coordinates. Can be relative to the *previous* icon in the map: "+1", "-1". Omit to inherit the previous icon's value.
- w, h: size in grid cells (default 1x1)
- iconFamily: which icon set to pull from - call the list_icon_families tool to see options
- icon: the icon key within that family - call list_icons to find a real one; never invent a name
- iconFill, iconStroke, iconStrokeWidth: recolor the icon (only if the icon family's license permits alteration - see README's "Icon licensing" section)
- preserveWhite: true to keep white icon parts unchanged when recoloring
- text: label override (defaults to the icon's key)
- textLocation: e.g. "bottomMiddle" (default), "topLeft", "leftMiddle", "center", etc.
- color, fill, stroke: label/box colors
- url: makes the label a clickable link
- If an icon fails to load (bad family/name), the renderer draws a dashed red "?" placeholder and returns a warning instead of failing the whole diagram - treat any such warning as something to fix before finishing.

## notes (map of key -> entity)
Text/markdown boxes. Same x/y/w/h/colors as icons, plus:
- text: plain text or markdown (supports headers, tables, code blocks)
- xAlign: "left"|"center"|"right", yAlign: "top"|"center"|"bottom"

## groups (map of key -> entity)
Draws a box around a set of icons (or nested groups).
- name: label for the group
- members: list of icon/group keys to enclose
- padding: optional inner padding as a fraction of the grid gap (default diagram.groupPadding)
- paddingTop, paddingRight, paddingBottom, paddingLeft: optional side-specific padding overriding padding
- margin: optional outer margin (same gap units) reserved by the parent group and kept inside the canvas
- marginTop, marginRight, marginBottom, marginLeft: optional side-specific margins overriding margin
- fontSize: optional label size in px; the label sits in the padding on its textLocation side, which grows to fit it, and the font shrinks if the label is longer than that side
- nested groups are laid out children-first; the renderer warns when visible sibling groups overlap
- textLocation: label position (default "topLeft")
- fill, stroke, color

## connections (list)
Lines between two icons/notes/groups.
- endpoints: [from, to] - each may have an optional ":label" suffix, e.g. "lb:443"
- curve: "curveLinear" (default, straight/angled), "curveStepBefore", "curveStepAfter", "curveStep"
- label: optional label placed on the connection path; defaults to the middle
- labelPosition: "start", "middle" (default), or "end"
- labelFontSize: optional font size in pixels for connection labels
- labels: optional list of {text, position, fontSize} labels for multiple annotations on one path
- color, stroke, strokeDashArray, strokeWidth

## YAML anchors for shared defaults
Use YAML anchors/merge keys to avoid repeating style attributes:

iconDefaults: &iconDefaults
  color: black
  fill: white
  stroke: black
  iconFamily: aws2026
icons:
  web1: {<<: *iconDefaults, icon: amazon_ec2, x: 1, y: 1}
  web2: {<<: *iconDefaults, icon: amazon_ec2, x: "+1"}

## Minimal example

diagram:
  fill: white
  rows: 5
  columns: 5
title:
  text: Example
  type: bar
icons:
  lb: {iconFamily: aws2026, icon: elastic_load_balancing, x: 2, y: 3}
  web1: {iconFamily: aws2026, icon: amazon_ec2, x: 1, y: 1}
  web2: {iconFamily: aws2026, icon: amazon_ec2, x: "+1"}
groups:
  webtier: {name: "Web Tier", members: [web1, web2]}
connections:
  - {endpoints: [lb, web1]}
  - {endpoints: [lb, web2]}
`;

