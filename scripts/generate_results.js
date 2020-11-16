var utils = require("../src/util");
var fs = require("fs");

const events = [];

fs.readdir("./results/ad_format/", function (err, files) {
  if (err) throw err;
  let numFiles = 0;
  files.forEach(function (file) {
    console.log(`Reading ${file}`);
    const contents = fs.readFileSync("./results/ad_format/" + file, "utf8");
    const event = utils.read_ad(contents);
    numFiles++;
    events.push(event);
  });

  fs.writeFile("./generated.json", JSON.stringify(events), function () {
    console.log("Successfully wrote file to ./generated.json");
  });

  console.log(`Found ${numFiles} files`);
});
