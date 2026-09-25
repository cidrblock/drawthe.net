#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { DSL_REFERENCE } from "./dsl-reference";
import { getIconPng, getIconSvg, listIconFamilies, listIcons, renderYaml } from "./engine";

const server = new McpServer({ name: "drawthe.net", version: "1.0.0" });

server.registerTool(
  "render_diagram",
  {
    title: "Render a drawthe.net diagram",
    description:
      "Renders a drawthe.net YAML diagram description into an image. Use list_icon_families/list_icons/get_icon " +
      "first to find real icon names - never invent one. Read the warnings in the response: a diagram can " +
      "render successfully but still contain a placeholder for any icon that couldn't be found.",
    inputSchema: {
      yaml: z.string().describe("The full drawthe.net YAML diagram document. Call get_dsl_reference for the syntax."),
      format: z.enum(["png", "svg"]).default("png").describe("Output image format."),
      width: z.number().int().positive().default(1600).describe("Rendered image width in pixels."),
      height: z.number().int().positive().default(1000).describe("Rendered image height in pixels.")
    }
  },
  async ({ yaml, format, width, height }) => {
    try {
      const result = await renderYaml(yaml, { format, width, height });
      const content: (
        | { type: "image"; data: string; mimeType: string }
        | { type: "text"; text: string }
      )[] = [
        result.format === "png"
          ? { type: "image", data: (result.data as Buffer).toString("base64"), mimeType: "image/png" }
          : { type: "text", text: result.data as string }
      ];
      if (result.warnings.length > 0) {
        content.push({ type: "text", text: `Warnings:\n${result.warnings.map((w) => `- ${w}`).join("\n")}` });
      }
      return { content };
    } catch (error) {
      return {
        isError: true,
        content: [{ type: "text", text: error instanceof Error ? error.message : String(error) }]
      };
    }
  }
);

server.registerTool(
  "list_icon_families",
  {
    title: "List icon families",
    description: "Lists every available icon family and how many icons it contains.",
    inputSchema: {}
  },
  async () => {
    const families = listIconFamilies();
    const text = families.map((f) => `${f.family} (${f.iconCount} icons)`).join("\n");
    return { content: [{ type: "text", text }] };
  }
);

server.registerTool(
  "list_icons",
  {
    title: "List icons in a family",
    description:
      "Lists icon keys within a family, optionally filtered by a case-insensitive substring. Call this before " +
      "writing any `icon:` reference - icon names are inconsistent across families and cannot be guessed reliably.",
    inputSchema: {
      family: z.string().describe("Icon family name, from list_icon_families."),
      query: z.string().optional().describe("Optional case-insensitive substring filter, e.g. \"load_balanc\".")
    }
  },
  async ({ family, query }) => {
    try {
      const icons = listIcons(family, query);
      const text = icons.length > 0 ? icons.join("\n") : "No icons matched.";
      return { content: [{ type: "text", text }] };
    } catch (error) {
      return {
        isError: true,
        content: [{ type: "text", text: error instanceof Error ? error.message : String(error) }]
      };
    }
  }
);

server.registerTool(
  "get_icon",
  {
    title: "Preview an icon",
    description: "Returns a rendered preview image of a single icon, so you can see it before choosing to use it.",
    inputSchema: {
      family: z.string().describe("Icon family name."),
      icon: z.string().describe("Icon key within the family, from list_icons.")
    }
  },
  async ({ family, icon }) => {
    try {
      const png = getIconPng(family, icon);
      return { content: [{ type: "image", data: png.toString("base64"), mimeType: "image/png" }] };
    } catch (error) {
      return {
        isError: true,
        content: [{ type: "text", text: error instanceof Error ? error.message : String(error) }]
      };
    }
  }
);

server.registerTool(
  "get_dsl_reference",
  {
    title: "Get the drawthe.net YAML DSL reference",
    description: "Returns the drawthe.net YAML syntax reference: diagram/title/icons/notes/groups/connections.",
    inputSchema: {}
  },
  async () => ({ content: [{ type: "text", text: DSL_REFERENCE }] })
);

// Keep get_icon_svg as a separate tool (raw markup) for text-only agents that can't consume images.
server.registerTool(
  "get_icon_svg",
  {
    title: "Get raw icon SVG markup",
    description: "Returns the raw SVG source for a single icon (for agents without image support).",
    inputSchema: {
      family: z.string().describe("Icon family name."),
      icon: z.string().describe("Icon key within the family, from list_icons.")
    }
  },
  async ({ family, icon }) => {
    try {
      return { content: [{ type: "text", text: getIconSvg(family, icon) }] };
    } catch (error) {
      return {
        isError: true,
        content: [{ type: "text", text: error instanceof Error ? error.message : String(error) }]
      };
    }
  }
);

const transport = new StdioServerTransport();
await server.connect(transport);
