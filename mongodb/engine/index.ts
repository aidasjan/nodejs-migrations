import fs from "fs";
import path from "path";

import Migration from "./Migration";

const DATA_DIR = `${__dirname}/../data`;
const MODELS_DIR = `${__dirname}/../../../models`;

export const up = async () => {
  console.log("Executing MongoDB database migrations");
  const jsonFiles = await getMigrationFiles();
  for (const fileName of jsonFiles) {
    try {
      console.log(`Importing JSON ${fileName}`);
      const jsonContent = fs
        .readFileSync(`${DATA_DIR}/${fileName}`)
        .toString();
      const model = getModelByFileName(fileName);
      model.insertMany(JSON.parse(jsonContent));
      Migration.insertMany({ fileName: fileName });
      console.log(`Imported ${fileName}`);
    } catch (err) {
      console.error(`Error while importing ${fileName}`);
      console.error(err);
      process.exit();
    }
  }
  if (jsonFiles.length > 0) {
    console.log("All files imported successfully");
  } else {
    console.log("No new files to import");
  }
};

const getModelByFileName = (fileName: string) => {
  const modelName = path.basename(fileName, ".json").split("_")[1];
  return require(`${MODELS_DIR}/${modelName}`).default;
}

const getMigrationFiles = async () => {
  const files = fs.readdirSync(DATA_DIR);
  try {
    const executedScripts = (await Migration.find()).map((m) => m.fileName);
    return files.filter(
      (fileName) =>
        !executedScripts.includes(fileName) &&
        fileName.toLowerCase().endsWith(".json")
    );
  } catch (err) {
    console.log("Error while getting executed migrations.");
    console.error(err);
    process.exit();
  }
};