var utils = require("../src");
var fs = require("fs");
var chalk = require("chalk");

const events = [];

fs.readdir("./results/ad_format/", function (err, files) {
  if (err) throw err;
  let numFiles = 0;
  files.forEach(function (file) {
    console.log(`Reading ${chalk.yellow(file)}`);
    const contents = fs.readFileSync("./results/ad_format/" + file, "utf8");
    const event = utils.read_ad(contents);
    numFiles++;
    events.push(event);
  });

  fs.writeFile("./generated.json", JSON.stringify(events), function () {
    console.log(`Successfully wrote file to ${chalk.blue("./generated.json")}`);
  });

  console.log(`Found ${chalk.blue(numFiles)} files`);
});
