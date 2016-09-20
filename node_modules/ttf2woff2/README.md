# ttf2woff2

> Convert TTF files to WOFF2.

[![NPM version](https://badge.fury.io/js/ttf2woff2.svg)](https://npmjs.org/package/ttf2woff2) [![Build status](https://secure.travis-ci.org/nfroidure/ttf2woff2.svg)](https://travis-ci.org/nfroidure/ttf2woff2) [![Dependency Status](https://david-dm.org/nfroidure/ttf2woff2.svg)](https://david-dm.org/nfroidure/ttf2woff2) [![devDependency Status](https://david-dm.org/nfroidure/ttf2woff2/dev-status.svg)](https://david-dm.org/nfroidure/ttf2woff2#info=devDependencies) [![Coverage Status](https://coveralls.io/repos/nfroidure/ttf2woff2/badge.svg?branch=master)](https://coveralls.io/r/nfroidure/ttf2woff2?branch=master) [![Code Climate](https://codeclimate.com/github/nfroidure/ttf2woff2.svg)](https://codeclimate.com/github/nfroidure/ttf2woff2)

This is a NodeJS wrapper for the Google [WOFF2](https://github.com/google/woff2)
 project. If the C++ wrapper compilation fail, it [fallbacks to an Emscripten
 build](http://insertafter.com/en/blog/native-node-module.html).

## Usage

### CLI

Install `ttf2woff2` globally, then:

```sh
cat font.ttf | ttf2woff2 >> font.woff2
```

### API

```js
var fs = require('fs');
var ttf2woff2 = require('ttf2woff2');

var input = fs.readFileSync('font.ttf');

fs.writeFileSync('font.woff2', ttf2woff2(input));

```

## Contributing
Feel free to push your code if you agree with publishing under the MIT license.

## Stats
[![NPM](https://nodei.co/npm/ttf2woff2.png?downloads=true&stars=true)](https://nodei.co/npm/ttf2woff2/)
[![NPM](https://nodei.co/npm-dl/ttf2woff2.png)](https://nodei.co/npm/ttf2woff2/)
