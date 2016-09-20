# Based on https://github.com/FontCustom/fontcustom/blob/master/lib/fontcustom/scripts/generate.py

import fontforge
import os
import sys
import json
from subprocess import call
from distutils.spawn import find_executable

args = json.load(sys.stdin)

f = fontforge.font()
f.encoding = 'UnicodeFull'
f.copyright = ''
f.design_size = 16
f.em = args['fontHeight']
f.descent = args['descent']
f.ascent = args['fontHeight'] - args['descent']
if args['version']:
	f.version = args['version']
if args['normalize']:
	f.autoWidth(0, 0, args['fontHeight'])

KERNING = 15


def create_empty_char(f, c):
	pen = f.createChar(ord(c), c).glyphPen()
	pen.moveTo((0, 0))
	pen = None


if args['addLigatures']:
	f.addLookup('liga', 'gsub_ligature', (), (('liga', (('latn', ('dflt')), )), ))
	f.addLookupSubtable('liga', 'liga')

for dirname, dirnames, filenames in os.walk(args['inputDir']):
	for filename in sorted(filenames):
		name, ext = os.path.splitext(filename)
		filePath = os.path.join(dirname, filename)
		size = os.path.getsize(filePath)

		if ext in ['.svg']:
			# HACK: Remove <switch> </switch> tags
			svgfile = open(filePath, 'r+')
			svgtext = svgfile.read()
			svgfile.seek(0)

			# Replace the <switch> </switch> tags with nothing
			svgtext = svgtext.replace('<switch>', '')
			svgtext = svgtext.replace('</switch>', '')

			# Remove all contents of file so that we can write out the new contents
			svgfile.truncate()
			svgfile.write(svgtext)
			svgfile.close()

			cp = args['codepoints'][name]

			if args['addLigatures']:
				name = str(name)  # Convert Unicode to a regular string because addPosSub doesn't work with Unicode
				for char in name:
					create_empty_char(f, char)
				glyph = f.createChar(cp, name)
				glyph.addPosSub('liga', tuple(name))
			else:
				glyph = f.createChar(cp, str(name))
			glyph.importOutlines(filePath)

			if args['normalize']:
				glyph.left_side_bearing = glyph.right_side_bearing = 0
			else:
				glyph.width = args['fontHeight']

			if args['round']:
				glyph.round(int(args['round']))

fontfile = args['dest'] + os.path.sep + args['fontFilename']

f.fontname = args['fontFilename']
f.familyname = args['fontFamilyName']
f.fullname = args['fontFamilyName']

if args['addLigatures']:
	def generate(filename):
		f.generate(filename, flags=('opentype'))
else:
	def generate(filename):
		f.generate(filename)


# TTF
generate(fontfile + '.ttf')

# Hint the TTF file
# ttfautohint is optional
if (find_executable('ttfautohint') and args['autoHint']):
	call('ttfautohint --symbol --fallback-script=latn --no-info "%(font)s.ttf" "%(font)s-hinted.ttf" && mv "%(font)s-hinted.ttf" "%(font)s.ttf"' % {'font': fontfile}, shell=True)
	f = fontforge.open(fontfile + '.ttf')

# SVG
if 'svg' in args['types']:
	generate(fontfile + '.svg')

	# Fix SVG header for webkit (from: https://github.com/fontello/font-builder/blob/master/bin/fontconvert.py)
	svgfile = open(fontfile + '.svg', 'r+')
	svgtext = svgfile.read()
	svgfile.seek(0)
	svgfile.write(svgtext.replace('<svg>', '<svg xmlns="http://www.w3.org/2000/svg">'))
	svgfile.close()

scriptPath = os.path.dirname(os.path.realpath(__file__))

# WOFF
if 'woff' in args['types']:
	generate(fontfile + '.woff')

# EOT
if 'eot' in args['types']:
	# eotlitetool.py script to generate IE7-compatible .eot fonts
	call('python "%(path)s/../../bin/eotlitetool.py" "%(font)s.ttf" --output "%(font)s.eot"' % {'path': scriptPath, 'font': fontfile}, shell=True)

# Delete TTF if not needed
if (not 'ttf' in args['types']) and (not 'woff2' in args['types']):
	os.remove(fontfile + '.ttf')

print(json.dumps({'file': fontfile}))
