var fs = require('fs');
var assert = require('assert');

describe('ttf2woff2', function() {

  it('should work from the main endpoint', function(done) {
    this.timeout(10000);
    var ttf2woff2 = require('../src/index');
    var inputContent = fs.readFileSync(__dirname + '/expected/iconsfont.ttf');
    var outputContent = ttf2woff2(inputContent);

    assert.equal(outputContent.length, 1072);
    assert.equal(outputContent[1071], 0);
    assert.deepEqual(
      outputContent,
      fs.readFileSync(__dirname + '/expected/iconsfont.woff2')
    );
    done();
  });

  it('should work from the native build', function(done) {
    var ttf2woff2 = require('bindings')('addon.node').convert;
    var inputContent = fs.readFileSync(__dirname + '/expected/iconsfont.ttf');
    var outputContent = ttf2woff2(inputContent);

    assert.equal(outputContent.length, 1072);
    assert.equal(outputContent[1071], 0);
    assert.deepEqual(
      outputContent,
      fs.readFileSync(__dirname + '/expected/iconsfont.woff2')
    );
    done();
  });

  it('should work from the emscripten endpoint', function(done) {
    this.timeout(10000);
    var ttf2woff2 = require('../jssrc/index.js');
    var inputContent = fs.readFileSync(__dirname + '/expected/iconsfont.ttf');
    var outputContent = ttf2woff2(inputContent);

    assert.equal(outputContent.length, 1072);
    assert.equal(outputContent[1071], 0);
    assert.deepEqual(
      outputContent,
      fs.readFileSync(__dirname + '/expected/iconsfont.woff2')
    );
    done();
  });

});
