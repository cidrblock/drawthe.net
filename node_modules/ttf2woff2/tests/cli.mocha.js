var fs = require('fs');
var assert = require('assert');

describe('Testing CLI', function() {

  it("should work", function(done) {
    this.timeout(5000);
    assert.deepEqual(
      (require('child_process').execSync)(
        'node ' + __dirname + '/../bin/ttf2woff2.js', {
          input: fs.readFileSync(__dirname + '/expected/iconsfont.ttf')
        }
      ),
      fs.readFileSync(__dirname + '/expected/iconsfont.woff2')
    );
    done();
  });

});
