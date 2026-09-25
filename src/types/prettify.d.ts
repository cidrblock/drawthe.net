// google-code-prettify is loaded globally via a <script> tag (public/vendor/prettify);
// it is absent in headless/Node rendering, hence the `typeof` guard before use.
// eslint-disable-next-line no-var
declare var PR: { prettyPrint(): void } | undefined;
