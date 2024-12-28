import fs from "fs";
import path from "path";
import { range } from "../src/utils";

interface YearData {
  _id: string;
  year: number;
  races: number;
  anniversary: number;
  __v: number;
  divisions: number[];
  comments?: string;
}

interface HouseData {
  _id: string;
  name: string;
  __v: number;
  boats: Array<{ _id: string; house: string; suffix: string; __v: number }>;
  colours: Array<{ a: number; b: number; g: number; r: number }>;
  current: boolean;
}

interface EventData {
  _id: string;
  year: number;
  races: number;
  anniversary: number;
  results: Array<{
    _id: string;
    year: string;
    boat: string;
    race: number;
    position: number;
    __v: number;
  }>;
  divisions: number[];
}

function getHouseName(houseId: string, houses: HouseData[]) {
  return houses.find((house) => house._id === houseId)?.name ?? "Unknown";
}

const romanToArabic = (roman: string | undefined) => {
  switch (roman) {
    case "I":
      return 1;
    case "II":
      return 2;
    case "III":
      return 3;
    case "IV":
      return 4;
  }
};

// Path to the years.json file
const yearsFilePath = path.join(__dirname, "../results/rssbc/years.json");
const housesFilePath = path.join(__dirname, "../results/rssbc/houses.json");

// Directory to save the fetched JSON files
const OUTPUT_DIR = path.join(__dirname, "data");

// Function to ensure the output directory exists
function ensureDirectoryExists(dir: string) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

// Function to save fetched data to a JSON file
function saveDataToFile(id: string, data: any) {
  const filePath = path.join(OUTPUT_DIR, `${id}.txt`);
  fs.writeFileSync(filePath, data, "utf-8");
  console.log(`Data saved to ${filePath}`);
}

// Main function to process the file and fetch data
async function main() {
  try {
    // Ensure the output directory exists
    ensureDirectoryExists(OUTPUT_DIR);

    const yearsFileContent = fs.readFileSync(yearsFilePath, "utf-8");
    const years: YearData[] = JSON.parse(yearsFileContent);

    const housesFileContent = fs.readFileSync(housesFilePath, "utf-8");
    const houses: HouseData[] = JSON.parse(housesFileContent);

    for (const year of years) {
      const eventFilePath = path.join(
        __dirname,
        `../results/rssbc/${year._id}.json`,
      );
      const eventFileContent = fs.readFileSync(eventFilePath, "utf-8");
      const event: EventData = JSON.parse(eventFileContent);

      let ret = `Set,RSSBC
Short,RSSBC
Gender,Men
Year,${year.year}
Days,${event.races}

`;

      const startingPositions = event.results.filter(
        (result) => result.race === 0,
      );

      let count = 0;

      for (const division of event.divisions) {
        ret += `Division,${range(count, count + division)
          .map((pos) => {
            const boat = houses
              .flatMap((house) => house.boats)
              .find(
                (boat) =>
                  boat._id ===
                  (startingPositions.find(
                    (startingPosition) => startingPosition.position === pos,
                  )?.boat ?? "Unknown"),
              );

            if (!boat) {
              console.log(year._id, pos);
            }

            return `${getHouseName(boat?.house, houses)}${romanToArabic(boat?.suffix) ?? ""}`;
          })
          .join(",")}
`;

        count += division;
      }

      saveDataToFile(`rssbc${year.year}`, ret);
    }
  } catch (error) {
    console.error("An error occurred:", error.message);
  }
}

// Run the main function
main();
