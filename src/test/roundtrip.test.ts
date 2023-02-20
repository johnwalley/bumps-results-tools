import * as fs from "fs";
import { assert, describe, it } from "vitest";
import { abbreviate, read_ad, read_tg, write_ad, write_tg } from "../main";

describe("round-trip", function () {
  describe("write_tg(read_tg())", function () {
    const dir = "./results/tg_format/";
    const files = fs.readdirSync(dir);

    files.forEach(function (file) {
      it("correctly round-trips " + file, function () {
        const contents = fs.readFileSync(dir + file, "utf8");

        const actual = write_tg(read_tg(contents));
        assert.equal(actual, contents);
      });
    });
  });

  describe("write_ad(read_ad())", function () {
    const dir = "./results/ad_format/";
    const files = fs.readdirSync(dir);

    files.forEach(function (file) {
      it("correctly round-trips " + file, function () {
        const contents = fs.readFileSync(dir + file, "utf8");

        const actual = write_ad(read_ad(contents));
        assert.equal(actual, contents);
      });
    });
  });

  describe("write_ad(read_tg())", function () {
    const dir = "./results/tg_format/";
    const files = fs.readdirSync(dir);

    const setMap: { [key: string]: string } = {
      eights: "e",
      torpids: "t",
      mays: "m",
      lents: "l",
      town: "town",
    };

    const genderMap: { [key: string]: string } = {
      men: "m",
      women: "w",
    };

    files.forEach(function (file) {
      it("correctly round-trips " + file, function () {
        const contents = fs.readFileSync(dir + file, "utf8");
        const actual = write_ad(read_tg(contents));

        const set = setMap[/^[a-z]+/g.exec(file)![0]];
        const year = /[0-9]+/g.exec(file)![0];
        const gender = genderMap[file.match(/[a-z]+/g)![1]];

        const newFile = set + year + gender + ".txt";

        assert.equal(
          actual,
          fs.readFileSync("./results/ad_format/" + newFile, "utf8")
        );
      });
    });
  });

  describe("write_tg(read_ad())", function () {
    const dir = "./results/ad_format/";
    const files = fs.readdirSync(dir);

    files.forEach(function (file) {
      it("correctly round-trips " + file, function () {
        const contents = fs.readFileSync(dir + file, "utf8");

        let set;
        let year;
        let gender;

        if (file.slice(0, 4) === "town") {
          set = "town";
          year = file.slice(4, 8);
          gender = file.slice(8, 9);
        } else {
          switch (file.slice(0, 1)) {
            case "e":
              set = "eights";
              break;
            case "l":
              set = "lents";
              break;
            case "t":
              set = "torpids";
              break;
            case "m":
              set = "mays";
              break;
          }
          year = file.slice(1, 5);
          gender = file.slice(5, 6);
        }

        if (set !== "torpids") {
          if (gender === "w") {
            gender = "women";
          } else {
            gender = "men";
          }

          const newFile = set + year + "_" + gender + ".txt";

          let intermediate = read_ad(contents);

          if (set !== "town") {
            intermediate = abbreviate(intermediate);
          }

          const actual = write_tg(intermediate);

          assert.equal(
            actual,
            fs.readFileSync("./results/tg_format/" + newFile, "utf8")
          );
        }
      });
    });
  });
});
