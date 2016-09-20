# IconFont
 
CLI to convert CSS StyleSheets for Icon Fonts like [FontAwesome](https://github.com/FortAwesome/Font-Awesome/blob/master/css/font-awesome.css) to a [CommonJS module](test/font-awesome.js) or [Alloy TSS](http://docs.appcelerator.com/titanium/latest/#!/guide/Alloy_Styles_and_Themes) file that exports all unicodes by name.

I use them in native iOS & Android apps build with [Titanium](http://appcelerator.com/titanium).

## Example

- Input: [font-awesome.css](test/font-awesome.css)
- Output as JS (default): [font-awesome.js](test/font-awesome.js)
- Output as TSS: [font-awesome.tss](test/font-awesome.tss)

## Install the CLI [![npm](http://img.shields.io/npm/v/iconfont.png)](https://www.npmjs.org/package/iconfont)

Install the CLI via [NPM](https://www.npmjs.org/package/iconfont) like this:

	$ [sudo] npm install -g iconfont

## CommonJS

### Generate it

Just point the CLI to the CSS file:

	$ iconfont font-awesome.css

This would create a file named `font-awesome.js` in the same directory as the CSS file. If you want to write to a different path, simply pass it as the second argument:

	$ iconfont font-awesome.css ~/fa.js
	
### Use it

In [Titanium](http://appcelerator.com/titanium), I'd use the module like this:

	var icons = require('font-awesome');
	
	var button = Ti.UI.createButton({
		font: {
			fontFamily: 'FontAwesome'
		},
		title: icons.flag
	});
	
In [Alloy](http://appcelerator.com/alloy) you can do:

*alloy.js*

	Alloy.Globals.icons = require('font-awesome');
	
*index.tss*

	"Button": {
		title: Alloy.Globals.icons.flag
	}
	
## Alloy TSS

Credits: [Jong Eun Lee](https://github.com/yomybaby).

### Generate it

Add the `-t` or `--tss` flag:

	$ iconfont font-awesome.css -t
	
Or when using the second output-argument, make sure its extension is `.tss`:

	$ iconfont font-awesome.css ~/fa.tss
	
### Use it

Since you cannot import TSS files at the moment, you'd probably copy-paste the contents of the generated file to your `app/styles/app.tss` file.

*index.xml*

Use the classes just like in HTML:

	<Label class="fa-thumbs-up otherClassName"></Label>
	
*index.tss*

And overwrite any property using additional class names:

	".otherClassName": {
		font: {
			fontSize: 40
		}
	}
	
## Notes

- For JS:
  - Icon names are camel-cased (`arrow-up` becomes `arrowUp`).
  - If **all** icon names share the same prefix this will be stripped out (`icon-flag` becomes `flag`).
- The CLI expects selectors ending with `:before`.
- The CLI expects declerations with a `content` property and a valid (unicode) string as value.

## Changelog

* 0.3.0: Adds support for generating TSS files
* 0.2.0:
	- Adds support for non-unicode content
	- Fixes camelCase for `some-1` (#3)
* 0.1.0: Initial release
	
## Issues

Please report issues and features requests in the repo's [issue tracker](https://github.com/fokkezb/IconFont/issues).

## License

Distributed under [MIT License](LICENSE).
