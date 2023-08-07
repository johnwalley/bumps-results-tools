const utils = require("../src");
const fs = require("fs");

const setMap = {
  e: "eights",
  t: "torpids",
  m: "mays",
  l: "lents",
  town: "town",
};

const genderMap = {
  m: "men",
  w: "women",
};

if (!fs.existsSync("./results/tg_format/")) {
  fs.mkdirSync("./results/tg_format/");
}

fs.readdir("./results/ad_format/", function (err, files) {
  if (err) throw err;
  let numFiles = 0;
  files.forEach(function (file) {
    const contents = fs.readFileSync("./results/ad_format/" + file, "utf8");
    const event = utils.read_ad(contents);
    numFiles++;

    const isTown = file.startsWith("town");

    const set = isTown ? "town" : setMap[file[0]];
    const year = isTown ? file.slice(4, 8) : file.slice(1, 5);
    const gender = (isTown ? file[8] : file[5]) === "w" ? "women" : "men";
    const newFile = set + year + "_" + gender + ".txt";

    fs.writeFile(
      "./results/tg_format/" + newFile,
      utils.write_tg(utils.abbreviate(event)),
      function () {
        console.log(
          "Successfully converted " + file + " to produce " + newFile
        );
      }
    );
  });

  console.log(`Found ${numFiles} files`);
});
