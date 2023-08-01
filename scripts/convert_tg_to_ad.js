const utils = require("../src");
const fs = require("fs");

if (!fs.existsSync("./results/ad_format/")) {
  fs.mkdirSync("./results/ad_format/");
}

const setMap = {
  eights: "e",
  torpids: "t",
  mays: "m",
  lents: "l",
  town: "town",
};

const genderMap = {
  men: "m",
  women: "w",
};

fs.readdir("./results/tg_format/", function (err, files) {
  if (err) throw err;
  let numFiles = 0;
  files.forEach(function (file) {
    const contents = fs.readFileSync("./results/tg_format/" + file, "utf8");
    console.log("Reading " + file);

    try {
      const event = utils.read_tg(contents);
      numFiles++;

      const set = setMap[/^[a-z]+/g.exec(file)[0]];
      const year = /[0-9]+/g.exec(file)[0];
      const gender = genderMap[file.match(/[a-z]+/g)[1]];

      const newFile = set + year + gender + ".txt";

      fs.writeFile(
        "./results/ad_format/" + newFile,
        utils.write_ad(utils.abbreviate(event)),
        function () {
          console.log(
            "Successfully converted " + file + " to produce " + newFile,
          );
        },
      );
    } catch (error) {
      console.error(error);
    }
  });

  console.log(`Found ${numFiles} files`);
});
