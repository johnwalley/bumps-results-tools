import fs from "fs";
import path from "path";

interface YearData {
  _id: string;
  year: number;
  races: number;
  anniversary: number;
  __v?: number;
  divisions: number[];
  comments?: string;
}

// Path to the years.json file
const filePath = path.join(__dirname, "../results/rssbc/years.json");

// Base URL for the API
const BASE_URL = "https://bumps.rssbc.org.uk/api/years/";

// Directory to save the fetched JSON files
const OUTPUT_DIR = path.join(__dirname, "data");

// Function to ensure the output directory exists
function ensureDirectoryExists(dir: string) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

// Function to fetch data from the API
async function fetchYearData(id: string): Promise<any> {
  try {
    const response = await fetch(`${BASE_URL}${id}`);
    return await response.json();
  } catch (error) {
    console.error(`Failed to fetch data for ID: ${id}`, error.message);
    return null;
  }
}

// Function to save fetched data to a JSON file
function saveDataToFile(id: string, data: any) {
  const filePath = path.join(OUTPUT_DIR, `${id}.json`);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
  console.log(`Data saved to ${filePath}`);
}

// Main function to process the file and fetch data
async function main() {
  try {
    // Ensure the output directory exists
    ensureDirectoryExists(OUTPUT_DIR);

    // Read the years.json file
    const fileContent = fs.readFileSync(filePath, "utf-8");
    const years: YearData[] = JSON.parse(fileContent);

    // Iterate over each year and fetch its data
    for (const year of years) {
      console.log(`Fetching data for ID: ${year._id}`);
      const data = await fetchYearData(year._id);

      if (data) {
        saveDataToFile(year._id, data);
      } else {
        console.error(`No data returned for ID: ${year._id}`);
      }
    }
  } catch (error) {
    console.error("An error occurred:", error.message);
  }
}

// Run the main function
main();
