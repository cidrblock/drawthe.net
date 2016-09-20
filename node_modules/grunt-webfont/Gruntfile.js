/*jshint node:true*/

var path = require('path');

module.exports = function(grunt) {
	'use strict';

	require('load-grunt-tasks')(grunt);

	grunt.initConfig({
		webfont: {
			test1: {
				src: 'test/src/*.svg',
				dest: 'test/tmp/test1',
				options: {
					hashes: false
				}
			},
			test2: {
				src: 'test/src/*.svg',
				dest: 'test/tmp/test2/fonts',
				destCss: 'test/tmp/test2',
				options: {
					font: 'myfont',
					types: 'woff,svg',
					syntax: 'bootstrap'
				}
			},
			embed: {
				src: 'test/src/*.svg',
				dest: 'test/tmp/embed',
				options: {
					hashes: false,
					embed: true
				}
			},
			embed_woff: {
				src: 'test/src/*.svg',
				dest: 'test/tmp/embed_woff',
				options: {
					types: 'woff',
					hashes: false,
					embed: true
				}
			},
			embed_ttf: {
				src: 'test/src/*.svg',
				dest: 'test/tmp/embed_ttf',
				options: {
					types: 'ttf',
					hashes: false,
					embed: 'ttf'
				}
			},
			embed_ttf_woff: {
				src: 'test/src/*.svg',
				dest: 'test/tmp/embed_ttf_woff',
				options: {
					types: 'ttf,woff',
					hashes: false,
					embed: 'ttf,woff'
				}
			},
			one: {
				src: 'test/src_one/*.svg',
				dest: 'test/tmp/one',
				options: {
					hashes: false
				}
			},
			template: {
				src: 'test/src/*.svg',
				dest: 'test/tmp/template',
				options: {
					template: 'test/templates/template.css'
				}
			},
			template_scss: {
				src: 'test/src/*.svg',
				dest: 'test/tmp/template_scss',
				options: {
					stylesheet: 'scss',
					template: 'test/templates/template.scss'
				}
			},
			template_sass: {
				src: 'test/src/*.svg',
				dest: 'test/tmp/template_sass',
				options: {
					template: 'test/templates/template.sass'
				}
			},
			html_template: {
				src: 'test/src/*.svg',
				dest: 'test/tmp/html_template',
				options: {
					htmlDemoTemplate: 'test/templates/template.html'
				}
			},
			html_filename: {
				src: 'test/src/*.svg',
				dest: 'test/tmp/html_filename',
				options: {
					htmlDemoFilename: 'index'
				}
			},
			relative_path: {
				src: 'test/src/*.svg',
				dest: 'test/tmp/relative_path',
				options: {
					relativeFontPath: '../iamrelative',
					hashes: false
				}
			},
			sass: {
				src: 'test/src/*.svg',
				dest: 'test/tmp/sass',
				options: {
					stylesheet: 'sass'
				}
			},
			less: {
				src: 'test/src/*.svg',
				dest: 'test/tmp/less',
				options: {
					stylesheet: 'less'
				}
			},
			css_plus_scss: {
				src: 'test/src/*.svg',
				dest: 'test/tmp/sass',
				destCss: 'test/tmp/css',
				destScss: 'test/tmp/scss',
				options: {
					stylesheets: ['css', 'scss']
				}
			},
			stylus_bem: {
				src: 'test/src/*.svg',
				dest: 'test/tmp/stylus_bem',
				options: {
					stylesheet: 'styl'
				}
			},
			stylus_bootstrap: {
				src: 'test/src/*.svg',
				dest: 'test/tmp/stylus_bootstrap',
				options: {
					stylesheet: 'styl',
					syntax: 'bootstrap'
				}
			},
			spaces: {
				src: 'test/src_space/*.svg',
				dest: 'test/tmp/spaces'
			},
			disable_demo: {
				src: 'test/src_one/*.svg',
				dest: 'test/tmp/disable_demo',
				options: {
					htmlDemo: false
				}
			},
			non_css_demo: {
				src: 'test/src/*.svg',
				dest: 'test/tmp/non_css_demo',
				options: {
					stylesheet: 'less',
					relativeFontPath: '../iamrelative',
					htmlDemo: true
				}
			},
			parent_source: {
				src: '../grunt-webfont/test/src/*.svg',
				dest: 'test/tmp/parent_source',
				options: {
					hashes: false
				}
			},
			// #167: Ligatures with hypen don’t work
			ligatures: {
				src: 'test/src_ligatures/*.svg',
				dest: 'test/tmp/ligatures',
				options: {
					hashes: false,
					ligatures: true
				}
			},
			duplicate_names: {
				src: '../grunt-webfont/test/src_duplicate_names/**/*.svg',
				dest: 'test/tmp/duplicate_names',
				options: {
					hashes: false,
					rename: function(name) {
						return [path.basename(path.dirname(name)), path.basename(name)].join('-');
					}
				}
			},
			order: {
				src: 'test/src/*.svg',
				dest: 'test/tmp/order',
				options: {
					types: 'woff,svg',
					order: 'svg,woff',
					hashes: false
				}
			},
			template_options: {
				src: 'test/src/*.svg',
				dest: 'test/tmp/template_options',
				options: {
					hashes: false,
					syntax: 'bem',
					stylesheet: 'less',
					templateOptions: {
						baseClass: 'glyph-icon',
						classPrefix: 'glyph_'
					}
				}
			},
			node: {
				src: 'test/src/*.svg',
				dest: 'test/tmp/node',
				options: {
					hashes: false,
					engine: 'node'
				}
			},
			ie7: {
				src: 'test/src/*.svg',
				dest: 'test/tmp/ie7',
				options: {
					hashes: false,
					ie7: true,
					syntax: 'bem'
				}
			},
			ie7_bootstrap: {
				src: 'test/src/*.svg',
				dest: 'test/tmp/ie7_bootstrap',
				options: {
					hashes: false,
					ie7: true,
					syntax: 'bootstrap'
				}
			},
			optimize_enabled: {
				src: 'test/src/*.svg',
				dest: 'test/tmp/optimize_enabled',
				options: {
					engine: 'node',
					types: 'svg',
					autoHint: false,
					optimize: true
				}
			},
			optimize_disabled: {
				src: 'test/src/*.svg',
				dest: 'test/tmp/optimize_disabled',
				options: {
					engine: 'node',
					types: 'svg',
					autoHint: false,
					optimize: false
				}
			},
			codepoints: {
				src: 'test/src/*.svg',
				dest: 'test/tmp/codepoints',
				options: {
					hashes: false,
					startCodepoint: 0x41,
					codepoints: {
						single: 0x43
					}
				}
			},
			camel: {
				src: 'test/camel/*.svg',
				dest: 'test/tmp/camel',
				options: {
					hashes: false
				}
			},
			folders: {
				src: 'test/src_folders/**/*.svg',
				dest: 'test/tmp/folders',
				options: {
					hashes: false
				}
			},
			woff2: {
				src: 'test/src/*.svg',
				dest: 'test/tmp/woff2',
				options: {
					types: 'woff2,woff'
				}
			},
			woff2_node: {
				src: 'test/src/*.svg',
				dest: 'test/tmp/woff2_node',
				options: {
					types: 'woff2,woff',
					engine: 'node'
				}
			},
			target_overrides: {
				src: 'test/src/*.svg',
				options: {
					dest: 'test/tmp/target_overrides_icons',
					destCss: 'test/tmp/target_overrides_css',
				}
			},
			font_family_name: {
				src: 'test/src/*.svg',
				dest: 'test/tmp/font_family_name',
				options: {
					fontFamilyName: 'customName',
					types: 'ttf',
				}
			},
			custom_output: {
				src: 'test/src/*.svg',
				options: {
					dest: 'test/tmp/custom_output_icons',
					destCss: 'test/tmp/custom_output_css',
					customOutputs: [{
						template: 'test/templates/custom.js',
						dest: 'test/tmp/custom_output/test-icon-config.js'
					}, {
						template: 'test/templates/custom.json',
						dest: 'test/tmp/custom_output'
					}, {
						template: 'test/templates/context-test.html',
						dest: 'test/tmp/custom_output',
						context: {
							testHeading: 'Hello, world!'
						}
					}]
				}
			},
		},
		nodeunit: {
			all: ['test/webfont_test.js']
		},
		jshint: {
			all: ['Gruntfile.js', 'tasks/*.js', 'test/*.js'],
			options: {
				jshintrc: true
			}
		},
		watch: {
			scripts: {
				files: '<%= jshint.all %>',
				tasks: ['jshint', 'jscs'],
				options: {
					debounceDelay: 100,
					nospawn: true
				}
			},
		},
		jscs: {
			options: {
				config: ".jscs.json",
			},
			all: ['tasks/*.js']
		},
		clean: ['test/tmp']
	});

	grunt.loadTasks('tasks');

	grunt.registerTask('test', ['nodeunit']);
	grunt.registerTask('default', ['jshint', 'jscs', 'clean', 'webfont', 'test', 'clean']);

};
