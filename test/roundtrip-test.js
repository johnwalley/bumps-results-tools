var fs = require('fs');
var assert = require('assert');
var utils = require('../src/util');

describe('round-trip', function() {
  describe('write_tg(read_tg())', function() {
    var files = fs.readdirSync('./results/tg_format/');

    files.forEach(function(file) {
      it('correctly round-trips ' + file, function() {
        const contents = fs.readFileSync('./results/tg_format/' + file, 'utf8');

        var actual = utils.write_tg(utils.read_tg(contents));
        assert.equal(actual, contents);
      });
    });
  });

  describe('write_ad(read_ad())', function() {
    var files = fs.readdirSync('./results/ad_format/');

    files.forEach(function(file) {
      it('correctly round-trips ' + file, function() {
        const contents = fs.readFileSync('./results/ad_format/' + file, 'utf8');

        var actual = utils.write_ad(utils.read_ad(contents));
        assert.equal(actual, contents);
      });
    });
  });
});
