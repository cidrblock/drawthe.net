# Hugo integration

This shortcode embeds a pre-rendered drawthe.net SVG inline in a Hugo page. Inline SVG stays sharp at any display size and can inherit page CSS. Hugo does not run the drawthe.net renderer itself, so render the YAML to an SVG before running `hugo`.

## Install the shortcode

Copy `layouts/shortcodes/drawthe-net.html` into the Hugo site's `layouts/shortcodes/` directory. Keep each diagram's YAML and generated SVG as resources in a page bundle:

```text
content/
└── posts/
    └── network-topology/
        ├── index.md
        ├── topology.yaml
        └── topology.svg
```

Generate the SVG from the repository root before building the Hugo site:

```sh
npm install
npm run render -- path/to/content/posts/network-topology/topology.yaml path/to/content/posts/network-topology/topology.svg --width=1200 --height=800
hugo
```

Embed the page resource from `index.md`:

```go-html-template
{{< drawthe-net src="topology.svg" alt="Web and API services across two availability zones" caption="Production VPC overview" >}}
```

`src` must name an SVG page resource in the same bundle. `alt` is required and should describe the topology for readers using assistive technology. `caption` is optional. The shortcode inlines trusted SVG markup, so only render and embed YAML that the site author controls; do not use it to display user-submitted diagrams.

## Example

This directory is a minimal Hugo site containing a small page bundle. From the drawthe.net repository root, render its resource with:

```sh
npm run render -- integrations/hugo/content/posts/network-topology/topology.yaml integrations/hugo/content/posts/network-topology/topology.svg --width=1200 --height=800
```

Then run Hugo from `integrations/hugo/`. The shortcode is already in that site's `layouts/shortcodes/` directory.