#! /usr/bin/env node

var fs = require('fs');
var BufferStreams = require('bufferstreams');
var ttf2woff2 = require('../src');

process.stdin.pipe(new BufferStreams(function(err, buf, cb) {
  if(err) {
    throw err;
  }
  cb(null, ttf2woff2(buf));
})).pipe(process.stdout);
