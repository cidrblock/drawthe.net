/**
 * SVG to webfont converter for Grunt
 *
 * @requires ttfautohint
 * @author Artem Sapegin (http://sapegin.me)
 */

module.exports = function(grunt) {
	'use strict';

	var fs = require('fs');
	var path = require('path');
	var async = require('async');
	var glob = require('glob');
	var chalk = require('chalk');
	var mkdirp = require('mkdirp');
	var crypto = require('crypto');
	var ttf2woff2 = require('ttf2woff2');
	var _ = require('lodash');
	var _s = require('underscore.string');
	var wf = require('./util/util');

	grunt.registerMultiTask('webfont', 'Compile separate SVG files to webfont', function() {

		/**
		 * Winston to Grunt logger adapter.
		 */
		var logger = {
			warn: function() {
				grunt.log.warn.apply(null, arguments);
			},
			error: function() {
				grunt.warn.apply(null, arguments);
			},
			log: function() {
				grunt.log.writeln.apply(null, arguments);
			},
			verbose: function() {
				grunt.verbose.writeln.apply(null, arguments);
			}
		};

		var allDone = this.async();
		var params = this.data;
		var options = this.options();
		var md5 = crypto.createHash('md5');

		/*
		 * Check for `src` param on target config
		 */
		this.requiresConfig([this.name, this.target, 'src'].join('.'));

		/*
		 * Check for `dest` param on either target config or global options object
		 */
		if (_.isUndefined(params.dest) && _.isUndefined(options.dest)) {
			logger.warn('Required property ' + [this.name, this.target, 'dest'].join('.')
				+ ' or ' + [this.name, this.target, 'options.dest'].join('.') + ' missing.');
		}

		if (options.skip) {
			completeTask();
			return;
		}

		// Source files
		var files = _.filter(this.filesSrc, isSvgFile);
		if (!files.length) {
			logger.warn('Specified empty list of source SVG files.');
			completeTask();
			return;
		}

		// path must be a string, see https://nodejs.org/api/path.html#path_path_extname_path
		if (typeof options.template !== 'string') {
			options.template = '';
		}

		// Options
		var o = {
			logger: logger,
			fontBaseName: options.font || 'icons',
			destCss: options.destCss || params.destCss || params.dest,
			destScss: options.destScss || params.destScss || params.destCss || params.dest,
			destSass: options.destSass || params.destSass || params.destCss || params.dest,
			destLess: options.destLess || params.destLess || params.destCss || params.dest,
			destStyl: options.destStyl || params.destStyl || params.destCss || params.dest,
			dest: options.dest || params.dest,
			relativeFontPath: options.relativeFontPath,
			addHashes: options.hashes !== false,
			addLigatures: options.ligatures === true,
			template: options.template,
			syntax: options.syntax || 'bem',
			templateOptions: options.templateOptions || {},
			stylesheets: options.stylesheets || [options.stylesheet || path.extname(options.template).replace(/^\./, '') || 'css'],
			htmlDemo: options.htmlDemo !== false,
			htmlDemoTemplate: options.htmlDemoTemplate,
			htmlDemoFilename: options.htmlDemoFilename,
			styles: optionToArray(options.styles, 'font,icon'),
			types: optionToArray(options.types, 'eot,woff,ttf'),
			order: optionToArray(options.order, wf.fontFormats),
			embed: options.embed === true ? ['woff'] : optionToArray(options.embed, false),
			rename: options.rename || path.basename,
			engine: options.engine || 'fontforge',
			autoHint: options.autoHint !== false,
			codepoints: options.codepoints,
			codepointsFile: options.codepointsFile,
			startCodepoint: options.startCodepoint || wf.UNICODE_PUA_START,
			ie7: options.ie7 === true,
			normalize: options.normalize === true,
			optimize: options.optimize === false ? false : true,
			round: options.round !== undefined ? options.round : 10e12,
			fontHeight: options.fontHeight !== undefined ? options.fontHeight : 512,
			descent: options.descent !== undefined ? options.descent : 64,
			version: options.version !== undefined ? options.version : false,
			cache: options.cache || path.join(__dirname, '..', '.cache'),
			callback: options.callback,
			customOutputs: options.customOutputs,
			execMaxBuffer: options.execMaxBuffer || 1024 * 200
		};

		o = _.extend(o, {
			fontName: o.fontBaseName,
			destCssPaths: {
				css: o.destCss,
				scss: o.destScss,
				sass: o.destSass,
				less: o.destLess,
				styl: o.destStyl
			},
			relativeFontPath: o.relativeFontPath || path.relative(o.destCss, o.dest),
			destHtml: options.destHtml || o.destCss,
			fontfaceStyles: has(o.styles, 'font'),
			baseStyles: has(o.styles, 'icon'),
			extraStyles: has(o.styles, 'extra'),
			files: files,
			glyphs: []
		});

		o.hash = getHash();
		o.fontFilename = template(options.fontFilename || o.fontBaseName, o);
		o.fontFamilyName = template(options.fontFamilyName || o.fontBaseName, o);

		// “Rename” files
		o.glyphs = o.files.map(function(file) {
			return o.rename(file).replace(path.extname(file), '');
		});

		// Check or generate codepoints
		// @todo Codepoint can be a Unicode code or character.
		var currentCodepoint = o.startCodepoint;
		if (!o.codepoints) o.codepoints = {};
		if (o.codepointsFile) o.codepoints = readCodepointsFromFile();
		o.glyphs.forEach(function(name) {
			if (!o.codepoints[name]) {
				o.codepoints[name] = getNextCodepoint();
			}
		});
		if (o.codepointsFile) saveCodepointsToFile();

		// Check if we need to generate font
		var previousHash = readHash(this.name, this.target);
		logger.verbose('New hash:', o.hash, '- previous hash:', previousHash);
		if (o.hash === previousHash) {
			logger.verbose('Config and source files weren’t changed since last run, checking resulting files...');
			var regenerationNeeded = false;

			var generatedFiles = wf.generatedFontFiles(o);
			if (!generatedFiles.length){
				regenerationNeeded = true;
			}
			else {
				generatedFiles.push(getDemoFilePath());
				o.stylesheets.forEach(function(stylesheet) {
					generatedFiles.push(getCssFilePath(stylesheet));
				});

				regenerationNeeded = _.some(generatedFiles, function(filename) {
					if (!filename) return false;
					if (!fs.existsSync(filename)) {
						logger.verbose('File', filename, ' is missed.');
						return true;
					}
					return false;
				});
			}
			if (!regenerationNeeded) {
				logger.log('Font ' + chalk.cyan(o.fontName) + ' wasn’t changed since last run.');
				completeTask();
				return;
			}
		}

		// Save new hash and run
		saveHash(this.name, this.target, o.hash);
		async.waterfall([
			createOutputDirs,
			cleanOutputDir,
			generateFont,
			generateWoff2Font,
			generateStylesheets,
			generateDemoHtml,
			generateCustomOutputs,
			printDone
		], completeTask);

		/**
		 * Call callback function if it was specified in the options.
		 */
		function completeTask() {
			if (o && _.isFunction(o.callback)) {
				o.callback(o.fontName, o.types, o.glyphs, o.hash);
			}
			allDone();
		}

		/**
		 * Calculate hash to flush browser cache.
		 * Hash is based on source SVG files contents, task options and grunt-webfont version.
		 *
		 * @return {String}
		 */
		function getHash() {
			// Source SVG files contents
			o.files.forEach(function(file) {
				md5.update(fs.readFileSync(file, 'utf8'));
			});

			// Options
			md5.update(JSON.stringify(o));

			// grunt-webfont version
			var packageJson = require('../package.json');
			md5.update(packageJson.version);

			// Templates
			if (o.template) {
				md5.update(fs.readFileSync(o.template, 'utf8'));
			}
			if (o.htmlDemoTemplate) {
				md5.update(fs.readFileSync(o.htmlDemoTemplate, 'utf8'));
			}

			return md5.digest('hex');
		}

		/**
		 * Create output directory
		 *
		 * @param {Function} done
		 */
		function createOutputDirs(done) {
			o.stylesheets.forEach(function(stylesheet) {
				mkdirp.sync(option(o.destCssPaths, stylesheet));
			});
			mkdirp.sync(o.dest);
			done();
		}

		/**
		 * Clean output directory
		 *
		 * @param {Function} done
		 */
		function cleanOutputDir(done) {
			var htmlDemoFileMask = path.join(o.destCss, o.fontBaseName + '*.{css,html}');
			var files = glob.sync(htmlDemoFileMask).concat(wf.generatedFontFiles(o));
			async.forEach(files, function(file, next) {
				fs.unlink(file, next);
			}, done);
		}

		/**
		 * Generate font using selected engine
		 *
		 * @param {Function} done
		 */
		function generateFont(done) {
			var engine = require('./engines/' + o.engine);
			engine(o, function(result) {
				if (result === false) {
					// Font was not created, exit
					completeTask();
					return;
				}

				if (result) {
					o = _.extend(o, result);
				}

				done();
			});
		}

		/**
		 * Converts TTF font to WOFF2.
		 *
		 * @param {Function} done
		 */
		function generateWoff2Font(done) {
			if (!has(o.types, 'woff2')) {
				done();
				return;
			}

			// Read TTF font
			var ttfFontPath = wf.getFontPath(o, 'ttf');
			var ttfFont = fs.readFileSync(ttfFontPath);

			// Remove TTF font if not needed
			if (!has(o.types, 'ttf')) {
				fs.unlinkSync(ttfFontPath);
			}

			// Convert to WOFF2
			var woffFont = ttf2woff2(ttfFont);

			// Save
			var woff2FontPath = wf.getFontPath(o, 'woff2');
			fs.writeFile(woff2FontPath, woffFont, done);
		}

		/**
		 * Generate CSS
		 *
		 * @param {Function} done
		 */
		function generateStylesheets(done) {
			// Convert codepoints to array of strings
			var codepoints = [];
			_.each(o.glyphs, function(name) {
				codepoints.push(o.codepoints[name].toString(16));
			});
			o.codepoints = codepoints;

			// Prepage glyph names to use as CSS classes
			o.glyphs = _.map(o.glyphs, classnameize);

			o.stylesheets.forEach(generateStylesheet);

			done();
		}

		/**
		 * Generate CSS
		 *
		 * @param {String} stylesheet type: css, scss, ...
		 */
		function generateStylesheet(stylesheet) {
			o.relativeFontPath = normalizePath(o.relativeFontPath);

			// Generate font URLs to use in @font-face
			var fontSrcs = [[], []];
			o.order.forEach(function(type) {
				if (!has(o.types, type)) return;
				wf.fontsSrcsMap[type].forEach(function(font, idx) {
					if (font) {
						fontSrcs[idx].push(generateFontSrc(type, font));
					}
				});
			});

			// Convert urls to strings that could be used in CSS
			var fontSrcSeparator = option(wf.fontSrcSeparators, stylesheet);
			fontSrcs.forEach(function(font, idx) {
				// o.fontSrc1, o.fontSrc2
				o['fontSrc'+(idx+1)] = font.join(fontSrcSeparator);
			});
			o.fontRawSrcs = fontSrcs;

			// Read JSON file corresponding to CSS template
			var templateJson = readTemplate(o.template, o.syntax, '.json', true);
			if (templateJson) o = _.extend(o, JSON.parse(templateJson.template));

			// Now override values with templateOptions
			if (o.templateOptions) o = _.extend(o, o.templateOptions);

			// Generate CSS
			var ext = path.extname(o.template) || '.css';  // Use extension of o.template file if given, or default to .css
			o.cssTemplate = readTemplate(o.template, o.syntax, ext);
			var cssContext = _.extend(o, {
				iconsStyles: true,
				stylesheet: stylesheet
			});

			var css = renderTemplate(o.cssTemplate, cssContext);

			// Fix CSS preprocessors comments: single line comments will be removed after compilation
			if (has(['sass', 'scss', 'less', 'styl'], stylesheet)) {
				css = css.replace(/\/\* *(.*?) *\*\//g, '// $1');
			}

			// Save file
			fs.writeFileSync(getCssFilePath(stylesheet), css);
		}

		/**
		 * Gets the codepoints from the set filepath in o.codepointsFile
		 */
		function readCodepointsFromFile(){
			if (!o.codepointsFile) return {};
			if (!fs.existsSync(o.codepointsFile)){
				logger.verbose('Codepoints file not found');
				return {};
			}

			var buffer = fs.readFileSync(o.codepointsFile);
			return JSON.parse(buffer.toString());
		}

		/**
		 * Saves the codespoints to the set file
		 */
		function saveCodepointsToFile(){
			if (!o.codepointsFile) return;
			var codepointsToString = JSON.stringify(o.codepoints, null, 4);
			try {
				fs.writeFileSync(o.codepointsFile, codepointsToString);
				logger.verbose('Codepoints saved to file "' + o.codepointsFile + '".');
			} catch (err) {
				logger.error(err.message);
			}
		}

		/*
		 * Prepares base context for templates
		 */
		function prepareBaseTemplateContext() {
			var context = _.extend({}, o);
			return context;
		}

		/*
		 * Makes custom extends necessary for use with preparing the template context
		 * object for the HTML demo.
		 */
		function prepareHtmlTemplateContext() {

			var context = prepareBaseTemplateContext();

			var htmlStyles;

			// Prepare relative font paths for injection into @font-face refs in HTML
			var relativeRe = new RegExp(_s.escapeRegExp(o.relativeFontPath), 'g');
			var htmlRelativeFontPath = normalizePath(path.relative(o.destHtml, o.dest));
			var _fontSrc1 = o.fontSrc1.replace(relativeRe, htmlRelativeFontPath);
			var _fontSrc2 = o.fontSrc2.replace(relativeRe, htmlRelativeFontPath);

			_.extend(context, {
				fontSrc1: _fontSrc1,
				fontSrc2: _fontSrc2,
				fontfaceStyles: true,
				baseStyles: true,
				extraStyles: false,
				iconsStyles: true,
				stylesheet: 'css'
			});

			// Prepares CSS for injection into <style> tag at to of HTML
			htmlStyles = renderTemplate(o.cssTemplate, context);
			_.extend(context, {
				styles: htmlStyles
			});

			return context;
		}

		/*
		 * Iterator function used as callback by looping construct below to
		 * render "custom output" via mini configuration objects specified in
		 * the array `options.customOutputs`.
		 */
		function generateCustomOutput(outputConfig) {

			// Accesses context
			var context = prepareBaseTemplateContext();
			_.extend(context, outputConfig.context);

			// Prepares config attributes related to template filepath
			var templatePath = outputConfig.template;
			var extension = path.extname(templatePath);
			var syntax = outputConfig.syntax || '';

			// Renders template with given context
			var template = readTemplate(templatePath, syntax, extension);
			var output = renderTemplate(template, context);

			// Prepares config attributes related to destination filepath
			var dest = outputConfig.dest || o.dest;

			var filepath;
			var destParent;
			var destName;

			if (path.extname(dest) === '') {
				// If user specifies a directory, filename should be same as template
				destParent = dest;
				destName = path.basename(outputConfig.template);
				filepath = path.join(dest, destName);
			}
			else {
				// If user specifies a file, that is our filepath
				destParent = path.dirname(dest);
				filepath = dest;
			}

			// Ensure existence of parent directory and output to file as desired
			mkdirp.sync(destParent);
			fs.writeFileSync(filepath, output);
		}

		/*
		 * Iterates over entries in the `options.customOutputs` object and,
		 * on a config-by-config basis, generates the desired results.
		 */
		function generateCustomOutputs(done) {

			if (!o.customOutputs || o.customOutputs.length < 1) {
				done();
				return;
			}

			_.each(o.customOutputs, generateCustomOutput);
			done();
		}

		/**
		 * Generate HTML demo page
		 *
		 * @param {Function} done
		 */
		function generateDemoHtml(done) {
			if (!o.htmlDemo) {
				done();
				return;
			}

			var context = prepareHtmlTemplateContext();

			// Generate HTML
			var demoTemplate = readTemplate(o.htmlDemoTemplate, 'demo', '.html');
			var demo = renderTemplate(demoTemplate, context);

			mkdirp(getDemoPath(), function(err) {
				if (err) {
					logger.log(err);
					return;
				}
				// Save file
				fs.writeFileSync(getDemoFilePath(), demo);
				done();
			});

		}

		/**
		 * Print log
		 *
		 * @param {Function} done
		 */
		function printDone(done) {
			logger.log('Font ' + chalk.cyan(o.fontName) + ' with ' + o.glyphs.length + ' glyphs created.');
			done();
		}


		/**
		 * Helpers
		 */

		/**
		 * Convert a string of comma separated words into an array
		 *
		 * @param {String} val Input string
		 * @param {String} defVal Default value
		 * @return {Array}
		 */
		function optionToArray(val, defVal) {
			if (val === undefined) {
				val = defVal;
			}
			if (!val) {
				return [];
			}
			if (typeof val !== 'string') {
				return val;
			}
			return val.split(',').map(_.trim);
		}

		/**
		 * Check if a value exists in an array
		 *
		 * @param {Array} haystack Array to find the needle in
		 * @param {Mixed} needle Value to find
		 * @return {Boolean} Needle was found
		 */
		function has(haystack, needle) {
			return haystack.indexOf(needle) !== -1;
		}

		/**
		 * Return a specified option if it exists in an object or `_default` otherwise
		 *
		 * @param {Object} map Options object
		 * @param {String} key Option to find in the object
		 * @return {Mixed}
		 */
		function option(map, key) {
			if (key in map) {
				return map[key];
			}
			else {
				return map._default;
			}
		}

		/**
		 * Find next unused codepoint.
		 *
		 * @return {Integer}
		 */
		function getNextCodepoint() {
			while (_.includes(o.codepoints, currentCodepoint)) {
				currentCodepoint++;
			}
			return currentCodepoint;
		}

		/**
		 * Check whether file is SVG or not
		 *
		 * @param {String} filepath File path
		 * @return {Boolean}
		 */
		function isSvgFile(filepath) {
			return path.extname(filepath).toLowerCase() === '.svg';
		}

		/**
		 * Convert font file to data:uri and remove source file
		 *
		 * @param {String} fontFile Font file path
		 * @return {String} Base64 encoded string
		 */
		function embedFont(fontFile) {
			// Convert to data:uri
			var dataUri = fs.readFileSync(fontFile, 'base64');
			var type = path.extname(fontFile).substring(1);
			var fontUrl = 'data:application/x-font-' + type + ';charset=utf-8;base64,' + dataUri;

			// Remove font file
			fs.unlinkSync(fontFile);

			return fontUrl;
		}

		/**
		 * Append a slash to end of a filepath if it not exists and make all slashes forward
		 *
		 * @param {String} filepath File path
		 * @return {String}
		 */
		function normalizePath(filepath) {
			if (!filepath.length) return filepath;

			// Make all slashes forward
			filepath = filepath.replace(/\\/g, '/');

			// Make sure path ends with a slash
			if (!_s.endsWith(filepath, '/')) {
				filepath += '/';
			}

			return filepath;
		}

		/**
		 * Generate URL for @font-face
		 *
		 * @param {String} type Type of font
		 * @param {Object} font URL or Base64 string
		 * @return {String}
		 */
		function generateFontSrc(type, font) {
			var filename = template(o.fontFilename + font.ext, o);

			var url;
			if (font.embeddable && has(o.embed, type)) {
				url = embedFont(path.join(o.dest, filename));
			}
			else {
				url = o.relativeFontPath + filename;
				if (o.addHashes) {
					if (url.indexOf('#iefix') === -1) {  // Do not add hashes for OldIE
						// Put hash at the end of an URL or before #hash
						url = url.replace(/(#|$)/, '?' + o.hash + '$1');
					}
				}
			}

			var src = 'url("' + url + '")';
			if (font.format) src += ' format("' + font.format + '")';

			return src;
		}

		/**
		 * Reat the template file
		 *
		 * @param {String} template Template file path
		 * @param {String} syntax Syntax (bem, bootstrap, etc.)
		 * @param {String} ext Extention of the template
		 * @return {Object} {filename: 'Template filename', template: 'Template code'}
		 */
		function readTemplate(template, syntax, ext, optional) {
			var filename = template
				? path.resolve(template.replace(path.extname(template), ext))
				: path.join(__dirname, 'templates/' + syntax + ext)
			;
			if (fs.existsSync(filename)) {
				return {
					filename: filename,
					template: fs.readFileSync(filename, 'utf8')
				};
			}
			else if (!optional) {
				return grunt.fail.fatal('Cannot find template at path: ' + filename);
			}
		}

		/**
		 * Render template with error reporting
		 *
		 * @param {Object} template {filename: 'Template filename', template: 'Template code'}
		 * @param {Object} context Template context
		 * @return {String}
		 */
		function renderTemplate(template, context) {
			try {
				var func = _.template(template.template);
				return func(context);
			}
			catch (e) {
				grunt.fail.fatal('Error while rendering template ' + template.filename + ': ' + e.message);
			}
		}

		/**
		 * Basic template function: replaces {variables}
		 *
		 * @param {Template} tmpl Template code
		 * @param {Object} context Values object
		 * @return {String}
		 */
		function template(tmpl, context) {
			return tmpl.replace(/\{([^\}]+)\}/g, function(m, key) {
				return context[key];
			});
		}

		/**
		 * Prepare string to use as CSS class name
		 *
		 * @param {String} str
		 * @return {String}
		 */
		function classnameize(str) {
			return _s.trim(str).replace(/\s+/g, '-');
		}

		/**
		 * Return path of CSS file.
		 *
		 * @param {String} stylesheet (css, scss, ...)
		 * @return {String}
		 */
		function getCssFilePath(stylesheet) {
			var cssFilePrefix = option(wf.cssFilePrefixes, stylesheet);
			return path.join(option(o.destCssPaths, stylesheet), cssFilePrefix + o.fontBaseName + '.' + stylesheet);
		}

		/**
		 * Return path of HTML demo file or `null` if its generation was disabled.
		 *
		 * @return {String}
		 */
		function getDemoFilePath() {
			if (!o.htmlDemo) return null;
			var name = o.htmlDemoFilename || o.fontBaseName;
			return path.join(o.destHtml, name + '.html');
		}

		/**
		 * Return path of HTML demo file or `null` if feature was disabled
		 */
		function getDemoPath() {
			if (!o.htmlDemo) return null;
			return o.destHtml;
		}

		/**
		 * Save hash to cache file.
		 *
		 * @param {String} name Task name (webfont).
		 * @param {String} target Task target name.
		 * @param {String} hash Hash.
		 */
		function saveHash(name, target, hash) {
			var filepath = getHashPath(name, target);
			mkdirp.sync(path.dirname(filepath));
			fs.writeFileSync(filepath, hash);
		}

		/**
		 * Read hash from cache file or `null` if file don’t exist.
		 *
		 * @param {String} name Task name (webfont).
		 * @param {String} target Task target name.
		 * @return {String}
		 */
		function readHash(name, target) {
			var filepath = getHashPath(name, target);
			if (fs.existsSync(filepath)) {
				return fs.readFileSync(filepath, 'utf8');
			}
			return null;
		}

		/**
		 * Return path to cache file.
		 *
		 * @param {String} name Task name (webfont).
		 * @param {String} target Task target name.
		 * @return {String}
		 */
		function getHashPath(name, target) {
			return path.join(o.cache, name, target, 'hash');
		}
	});
};
