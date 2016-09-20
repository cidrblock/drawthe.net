# SVG to webfont converter for Grunt

[![Powered by You](http://sapegin.github.io/powered-by-you/badge.svg)](http://sapegin.github.io/powered-by-you/)
[![Build Status](https://travis-ci.org/sapegin/grunt-webfont.svg)](https://travis-ci.org/sapegin/grunt-webfont)
[![Downloads on npm](http://img.shields.io/npm/dm/grunt-webfont.svg?style=flat)](https://www.npmjs.com/package/grunt-webfont)

Generate custom icon webfonts from SVG files via Grunt. Inspired by [Font Custom](https://github.com/FontCustom/fontcustom).

This task will make all you need to use font-face icon on your website: font in all needed formats, CSS/Sass/Less/Stylus and HTML demo page.

## Features

* Works on Mac, Windows and Linux.
* Very flexible.
* Supports all web font formats: WOFF, WOFF2, EOT, TTF and SVG.
* Semantic: uses [Unicode private use area](http://bit.ly/ZnkwaT).
* [Cross-browser](http://www.fontspring.com/blog/further-hardening-of-the-bulletproof-syntax/): IE8+.
* BEM or Bootstrap output CSS style.
* CSS preprocessors support.
* Data:uri embedding.
* Ligatures.
* HTML preview.
* Custom templates.


## Installation

This plugin requires Grunt 0.4. Note that `ttfautohint` is optional, but your generated font will not be properly hinted if it’s not installed. And make sure you don’t use `ttfautohint` 0.97 because that version won’t work.

### OS X

```
brew install ttfautohint fontforge --with-python
npm install grunt-webfont --save-dev
```

*You may need to use `sudo` for `brew`, depending on your setup.*

*`fontforge` isn’t required for `node` engine (see below).*

### Linux

```
sudo apt-get install fontforge ttfautohint
npm install grunt-webfont --save-dev
```

*`fontforge` isn’t required for the `node` engine (see [below](#available-engines)).*

### Windows

```
npm install grunt-webfont --save-dev
```

Then [install `ttfautohint`](http://www.freetype.org/ttfautohint/#download) (optional).

Then install `fontforge`.
* Download and install [fontforge](http://fontforge.github.io/en-US/downloads/windows/).
* Add `C:\Program Files (x86)\FontForgeBuilds\bin` to your `PATH` environment variable.

*`fontforge` isn’t required for the `node` engine (see [below](#available-engines)).*

## Available Engines

There are two font rendering engines available. See also `engine` option below.

### fontforge

#### Pros

* All features supported.
* The best results.

#### Cons

* You have to install `fontforge`.
* Really weird bugs sometimes.

### node

#### Pros

* No external dependencies (except optional `ttfautohint`).
* Works on all platforms.

#### Cons

* Doesn’t work [with some SVG files](https://github.com/fontello/svg2ttf/issues/25).
* Ligatures aren’t supported.


## Configuration

Add somewhere in your `Gruntfile.js`:

```javascript
grunt.loadNpmTasks('grunt-webfont');
```

Inside your `Gruntfile.js` file add a section named `webfont`. See Parameters section below for details.


### Parameters

#### src

Type: `string|array`

Glyphs list: SVG. String or array. Wildcards are supported.

#### dest

Type: `string`

Directory for resulting files.

#### destCss

Type: `string` Default: _`dest` value_

Directory for resulting CSS files (if different than font directory). You can also define `destScss`, `destSass`, `destLess` and `destStyl` to specify a directory per stylesheet type.

#### Options

All options should be inside `options` object:

``` javascript
webfont: {
	icons: {
		src: 'icons/*.svg',
		dest: 'build/fonts',
		options: {
			...
		}
	}
}
```

#### font

Type: `string` Default: `icons`

Name of font and base name of font files.

#### fontFilename

Type: `string` Default: Same as `font` option

Filename for generated font files, you can add placeholders for the same data that gets passed to the [template](#template).

For example, to get the hash to be part of the filenames:

```js
options: {
	fontFilename: 'icons-{hash}'
}
```

#### hashes

Type: `boolean` Default: `true`

Append font file names with unique string to flush browser cache when you update your icons.

#### styles

Type: `string|array` Default: `'font,icon'`

List of styles to be added to CSS files: `font` (`font-face` declaration), `icon` (base `.icon` class), `extra` (extra stuff for Bootstrap (only for `syntax` = `'bootstrap'`).

#### types

Type: `string|array` Default: `'eot,woff,ttf'`, available: `'eot,woff2,woff,ttf,svg'`

Font files types to generate.

#### order

Type: `string|array` Default: `'eot,woff,ttf,svg'`

Order of `@font-face`’s `src` values in CSS file. (Only file types defined in `types` option will be generated.)

#### syntax

Type: `string` Default: `bem`

Icon classes syntax. `bem` for double class names: `icon icon_awesome` or `bootstrap` for single class names: `icon-awesome`.

#### template

Type: `string` Default: ``

Custom CSS template path (see `tasks/templates` for some examples). Should be used instead of `syntax`. (You probably need to define `htmlDemoTemplate` option too.)

Template is a pair of CSS and JSON (optional) files with the same name.

For example, your Gruntfile:

```js
options: {
	template: 'my_templates/tmpl.css'
}
```

`my_templates/tmpl.css`:

```css
@font-face {
	font-family:"<%= fontBaseName %>";
	...
}
...
```

`my_templates/tmpl.json`:

```json
{
	"baseClass": "icon",
	"classPrefix": "icon_"
}
```

Some extra data is available for you in templates:

* `hash`: a unique string to flush browser cache. Available even if `hashes` option is `false`.

* `fontRawSrcs`: array of font-face’s src values not merged to a single line:

```
[
	[
		'url("icons.eot")'
	],
	[
		'url("icons.eot?#iefix") format("embedded-opentype")',
		'url("icons.woff") format("woff")',
		'url("icons.ttf") format("truetype")'
	]
]
```


#### templateOptions

Type: `object` Default: `{}`

Extends/overrides CSS template or syntax’s JSON file. Allows custom class names in default css templates.

``` javascript
options: {
	templateOptions: {
		baseClass: 'glyph-icon',
		classPrefix: 'glyph_'
	}
}
```

#### stylesheets

Type: `array` Default: `['css']` or extension of `template`

Stylesheet type. Can be `css`, `sass`, `scss` or `less`. If `sass` or `scss` is used, `_` will prefix the file (so it can be a used as a partial). You can define just `stylesheet` if you are generating just one type.

#### relativeFontPath

Type: `string` Default: `null`

Custom font path. Will be used instead of `destCss` *in* CSS file. Useful with CSS preprocessors.

#### version

Type: `string` Default: `false`

Version number added to `.ttf` version of the font (FontForge Engine only). Also used in the heading of the default demo.html template. Useful to align with the version of other assets that are part of a larger system.

#### htmlDemo

Type: `boolean` Default: `true`

If `true`, an HTML file will be available (by default, in `destCSS` folder) to test the render.

#### htmlDemoTemplate

Type: `string` Default: `null`

Custom demo HTML template path (see `tasks/templates/demo.html` for an example) (requires `htmlDemo` option to be true).

#### htmlDemoFilename

Type: `string` Default: _`fontBaseName` value_

Custom name for the demo HTML file (requires `htmlDemo` option to be true). Useful if you want to name the output something like `index.html` instead of the font name.

#### destHtml

Type: `string` Default: _`destCss` value_

Custom demo HTML demo path (requires `htmlDemo` option to be true).

#### embed

Type: `string|array` Default: `false`

If `true` embeds WOFF (*only WOFF*) file as data:uri.

IF `ttf` or `woff` or `ttf,woff` embeds TTF or/and WOFF file.

If there are more file types in `types` option they will be included as usual `url(font.type)` CSS links.

#### ligatures

Type: `boolean` Default: `false`

If `true` the generated font files and stylesheets will be generated with opentype ligature features. The character sequences to be replaced by the ligatures are determined by the file name (without extension) of the original SVG.

For example, you have a heart icon in `love.svg` file. The HTML `<h1>I <span class="ligature-icons">love</span> you!</h1>` will be rendered as `I ♥ you!`.

#### rename

Type: `function` Default: `path.basename`

You can use this function to change how file names translates to class names (the part after `icon_` or `icon-`). By default it’s a name of a file.

For example you can group your icons into several folders and add folder name to class name:

```js
options: {
	rename: function(name) {
		// .icon_entypo-add, .icon_fontawesome-add, etc.
		return [path.basename(path.dirname(name)), path.basename(name)].join('-');
	}
}
```

#### skip

Type: `boolean` Default: `false`

If `true` task will not be ran. In example, you can skip task on Windows (becase of difficult installation):

```javascript
options: {
	skip: require('os').platform() === 'win32'
}
```

#### engine

Type: `string` Default: `fontforge`

Font rendering engine: `fontforge` or `node`. See comparison in [Available Engines](#available-engines) section above.

#### ie7

Type: `boolean` Default: `false`

Adds IE7 support using a `*zoom: expression()` hack.

#### optimize

Type: `boolean` Default: `true`

If `false` the SVGO optimization will not be used. This is useful in cases where the optimizer will produce faulty web fonts by removing relevant SVG paths or attributes.

#### normalize

Type: `boolean` Default: `false`

When using the fontforge engine, if false, glyphs will be generated with a fixed width equal to fontHeight. In most cases, this will produce an extra blank space for each glyph. If set to true, no extra space will be generated. Each glyph will have a width that matches its boundaries.

#### startCodepoint

Type: `integer` Default: `0xF101`

Starting codepoint used for the generated glyphs. Defaults to the start of the Unicode private use area.

#### codepoints

Type: `object` Default: `null`

Specific codepoints to use for certain glyphs. Any glyphs not specified in the codepoints block will be given incremented as usual from the `startCodepoint`, skipping duplicates.

```javascript
options: {
	codepoints: {
		single: 0xE001
	}
}
```

#### codepointsFile
Type: `string` Default: `null`

Uses and Saves the codepoint mapping by name to this file.

NOTE: will overwrite the set codepoints option.

#### autoHint

Type: `boolean` Default: `true`

Enables font auto hinting using `ttfautohint`.

#### round

Type: `number` Default: `10e12`

Setup SVG path rounding.

#### fontHeight

Type: `number` Default: `512`

The output font height.

#### fontFamilyName

Type: `string` Default: _`font` value_

If you’d like your generated fonts to have a name that’s different than the `font` value, you can specify this as a string. This will allow a unique display name within design authoring tools when installing fonts locally. For example, your font’s name could be `GitHub Octicons` with a filename of `octicons.ttf`.

```javascript
options: {
	fontFamilyName: 'GitHub Octicons',
}
```

#### descent

Type: `number` Default: `64`

The font descent. The descent should be a positive value. The ascent formula is: `ascent = fontHeight - descent`.

#### callback

Type: `function` Default: `null`

Allows for a callback to be called when the task has completed and passes in the filename of the generated font, an array of the various font types created, an array of all the glyphs created and the hash used to flush browser cache.

```javascript
options: {
	callback: function(filename, types, glyphs, hash) {
		// ...
	}
}
```

#### customOutputs

Type: `array` Default: `undefined`

Allows for custom content to be generated and output in the same way as `htmlDemo`.

Each entry in `customOutputs` should be an object with the following parameters:

* `template` - (`string`) the path to the underscore-template you wish to use.
* `dest` - (`string`) the path to the destination where you want the resulting file to live.
* `context` \[optional\] - (`object`) a hash of values to pass into the context of the template

At compile-time each template will have access to the same context as the compile-time environment of `htmlDemoTemplate` (as extended by the `context` object, if provided. See config-example below.

#### execMaxBuffer
 If you get stderr maxBuffer exceeded warning message, engine probably logged a lot of warning messages. To see this warnings run grunt in verbose mode `grunt --verbose`. To go over this warning you can try to increase buffer size by this option. Default value is `1024 * 200`

### Config Examples

#### Simple font generation

```javascript
webfont: {
	icons: {
		src: 'icons/*.svg',
		dest: 'build/fonts'
	}
}
```

#### Custom font name, fonts and CSS in different folders

```javascript
webfont: {
	icons: {
		src: 'icons/*.svg',
		dest: 'build/fonts',
		destCss: 'build/fonts/css',
		options: {
			font: 'ponies'
		}
	}
}
```

#### Custom CSS classes

```js
webfont: {
	icons: {
		src: 'icons/*.svg',
		dest: 'build/fonts',
		options: {
			syntax: 'bem',
			templateOptions: {
				baseClass: 'glyph-icon',
				classPrefix: 'glyph_'
			}
		}
	}
}
```

#### To use with CSS preprocessor

```javascript
webfont: {
	icons: {
		src: 'icons/*.svg',
		dest: 'build/fonts',
		destCss: 'build/styles',
		options: {
			stylesheet: 'styl',
			relativeFontPath: '/build/fonts'
		}
	}
}
```

#### Embedded font file

```javascript
webfont: {
	icons: {
		src: 'icons/*.svg',
		dest: 'build/fonts',
		options: {
			types: 'woff',
			embed: true
		}
	}
}
```

#### Custom Outputs

```javascript
webfont: {
	icons: {
		src: 'icons/*.svg',
		dest: 'build/fonts',
		options: {
			customOutputs: [{
				template: 'templates/icon-glyph-list-boilerplate.js',
				dest: 'build/js/icon-glyph-list.js'
			}, {
				template: 'templates/icon-glyph-config-boilerplate.json',
				dest: 'build/js/icon-glyphs.json'
			}, {
				template: 'templates/icon-web-home.html',
				dest: 'build/',
				context: {
					homeHeading: 'Your Icon Font',
					homeMessage: 'The following glyphs are available in this font:'
				}
			}]
		}
	}
}
```

We might then include the following corresponding templates.

The first, for `icon-glyph-list-boilerplate.js`, a file that outputs a list of icon-glyph slugs.

```
// file: icon-glyph-list-boilerplate.js

(function(window) {
	'use strict';

	var iconList = <%= JSON.stringify(glyphs) %>;
	window.iconList = iconList;
}(this));
```

The second, for `icon-glyph-config-boilerplate.json`, a file that dumps all JSON data in the current template context.

```
// file: icon-glyph-config-boilerplate.json

<%= JSON.stringify(arguments[0], null, '\t') %>
```

And finally, the third, for `icon-web-home.html`, a file that has access to the values provided in the `context` object supplied.

```
// file: icon-web-home.html

<!DOCTYPE html>
<html class="no-js">
    <head>
        <meta charset="utf-8">
        <title>Context Test</title>
    </head>
    <body>
        <h1><%= homeHeading %></h1>
        <p><%= homeMessage %></p>
        <ul>
        	<% for (var i = 0; i < glpyhs.length; i++) { %>
        	<li><a href="#"><%= glyphs[i] %></a></li>
        	<% } %>
        </ul>
    </body>
</html>
```

## CSS Preprocessors Caveats

You can change CSS file syntax using `stylesheet` option (see above). It change file extension (so you can specify any) with some tweaks. Replace all comments with single line comments (which will be removed after compilation).

### Sass

If `stylesheet` option is `sass` or `scss`, `_` will prefix the file (so it can be a used as a partial).

### Less

If `stylesheet` option is `less`, regular CSS icon classes will be expanded with corresponding Less mixins.

The Less mixins then may be used like so:

```css
.profile-button {
	.icon-profile;
}
```

## Troubleshooting

### I have problems displaying the font in Firefox

Firefox doesn’t allow cross-domain fonts: [Specifications](http://www.w3.org/TR/css3-fonts/#font-fetching-requirements), [Bugzilla Ticket](https://bugzilla.mozilla.org/show_bug.cgi?id=604421), [How to fix it](https://coderwall.com/p/v4uwyq).

### My images are getting corrupted

#### Using the node engine

* Certain SVG's are not supported. See the [svg2ttf](https://github.com/fontello/svg2ttf) project which is used to convert from SVG to TTF (which is then converted forward to WOFF and WOFF2).
* `autoHint` also adjusts the font file and can cause your font to look different to the SVG, so you could try switching it off (though it may make windows view of the font worse).

#### Using fontforge

Check the following...

* Your paths are clockwise. Anti-clockwise paths may cause fills to occur differently.
* Your paths are not overlapping. Overlapping paths will cause one of the areas to be inverted rather than combined. Use an editor to union your two paths together.
* `autoHint` also adjusts the font file and can cause your font to look different to the SVG, so you could try switching it off (though it may make windows view of the font worse).
* If you get stderr maxBuffer exceeded warning message, fontforge probably logged a lot of warning messages. To see this warnings run grunt in verbose mode `grunt --verbose`. To go over this warning you can try to increase buffer size by [execMaxBuffer](#execMaxBuffer).

## Changelog

The changelog can be found on the [Releases page](https://github.com/sapegin/grunt-webfont/releases).

## License

The MIT License, see the included [License.md](License.md) file.
