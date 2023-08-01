const fs = require("fs");
const assert = require("assert");
const utils = require("../src");

describe("original fidelity", function () {
  describe("dudhia format", function () {
    const files = fs.readdirSync("./results/dudhia/");

    files.forEach(function (file) {
      if (fs.existsSync("./results/ad_format/" + file)) {
        it("correctly reads Dudhia's original result " + file, function () {
          const inputContents = fs.readFileSync(
            "./results/dudhia/" + file,
            "utf8"
          );
          const outputContents = fs.readFileSync(
            "./results/ad_format/" + file,
            "utf8"
          );

          const actual = utils.write_ad(utils.read_ad(inputContents));
          assert.equal(actual, outputContents);
        });
      }
    });
  });

  describe("mcshane format", function () {
    const files = fs.readdirSync("./results/mcshane/");

    console.log(utils);

    files.forEach(function (file) {
      if (fs.existsSync("./results/tg_format/" + file)) {
        it("correctly reads McShane's original result " + file, function () {
          const inputContents = fs.readFileSync(
            "./results/mcshane/" + file,
            "utf8"
          );
          const outputContents = fs.readFileSync(
            "./results/tg_format/" + file,
            "utf8"
          );

          const actual = utils.write_tg(utils.read_tg(inputContents));
          assert.equal(actual, outputContents);
        });
      }
    });
  });
});
