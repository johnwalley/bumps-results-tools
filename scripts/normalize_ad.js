var fs = require("fs");
var utils = require("../src");

var files = fs.readdirSync("./results/ad_format/");

files.forEach(function (file) {
  const contents = fs.readFileSync("./results/ad_format/" + file, "utf8");

  console.log(file);

  var actual = utils.write_ad(utils.read_ad(contents));

  fs.writeFile("./results/ad_format/" + file, actual, function () {
    console.log("Successfully normalized " + file);
  });
});
