var fs = require('fs');
var assert = require('assert');
var utils = require('../src/util');

describe('utils', function() {
  describe('#read_tg()', function() {
    var files = fs.readdirSync('./results/tg_format/');

    files.forEach(function(file) {
      it('correctly round-trips ' + file, function() {
        const contents = fs.readFileSync('./results/tg_format/' + file, 'utf8');

        var actual = utils.write_tg(utils.read_tg(contents));
        assert.equal(actual, contents);
      });
    });
  });
});
