var utils = require("../src");
var statistics = require("../src/stats");
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

  let stats = {};

  for (const small of ["Eights", "Lents", "Mays", "Torpids", "Town"]) {
    stats[small.toLocaleLowerCase()] = {};

    for (const gender of ["Men", "Women"]) {
      stats[small.toLocaleLowerCase()][gender.toLocaleLowerCase()] = {};

      const e = events.filter(
        (event) => event.gender === gender && event.small === small,
      );

      const ncrews = statistics.ncrews(e);
      const nhead = statistics.nhead(e);
      const movdo = statistics.movdo(e);
      const movup = statistics.movup(e);

      stats[small.toLocaleLowerCase()][gender.toLocaleLowerCase()] = {
        movdo,
        movup,
        ncrews,
        nhead,
      };
    }
  }

  fs.writeFile("./stats.json", JSON.stringify(stats), function () {
    console.log("Successfully wrote file to ./stats.json");
  });
});
