const fs = require('fs');
const assert = require('assert');
const utils = require('../src/util');

describe('round-trip', function() {
  describe('write_tg(read_tg())', function() {
    const dir = './results/tg_format/';
    const files = fs.readdirSync(dir);

    files.forEach(function(file) {
      it('correctly round-trips ' + file, function() {
        const contents = fs.readFileSync(dir + file, 'utf8');

        const actual = utils.write_tg(utils.read_tg(contents));
        assert.equal(actual, contents);
      });
    });
  });

  describe('write_ad(read_ad())', function() {
    const dir = './results/ad_format/';
    const files = fs.readdirSync(dir);

    files.forEach(function(file) {
      it('correctly round-trips ' + file, function() {
        const contents = fs.readFileSync(dir + file, 'utf8');

        const actual = utils.write_ad(utils.read_ad(contents));
        assert.equal(actual, contents);
      });
    });
  });
});
