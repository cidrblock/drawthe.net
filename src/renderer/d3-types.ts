import type { Selection } from "d3";

/**
 * The rendering code manipulates deeply heterogeneous D3 selections (mixed
 * datum/element types across icons, groups, notes, connections). Rather than
 * fighting D3's generics on every call, we use a single loose alias here -
 * the surrounding TS files still gain real type-checking for the diagram DSL
 * itself (see types.ts) and for the new RenderTarget/IconLoader seams.
 */
export type AnySelection = Selection<any, any, any, any>;

/** D3 v4's `d3.entries()` was removed in later majors; this reproduces its `{key, value}` shape. */
export function toEntries<T>(record: Record<string, T>): { key: string; value: T }[] {
  return Object.entries(record).map(([key, value]) => ({ key, value }));
}
