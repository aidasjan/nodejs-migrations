import mysql from "mysql";
import fs from "fs";

const MIGRATIONS_DIR = `${__dirname}/../scripts`;

const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_DATABASE,
});

export const up = async () => {
  console.log("Executing MySQL database migrations");
  const sqlFiles = await getScripts();
  for (const fileName of sqlFiles) {
    try {
      console.log(`Executing script ${fileName}`);
      const sqlContent = fs
        .readFileSync(`${MIGRATIONS_DIR}/${fileName}`)
        .toString();
      await query(sqlContent);
      await query(`INSERT INTO migrations VALUES (?)`, [fileName]);
      console.log(`Executed script ${fileName}`);
    } catch {
      console.error(`Error while executing script ${fileName}`);
      process.exit();
    }
  }
  if (sqlFiles.length > 0) {
    console.log("All migration scripts executed successfully");
  } else {
    console.log("No new migration scripts to execute");
  }
};

const getScripts = async () => {
  const files = fs.readdirSync(MIGRATIONS_DIR);
  try {
    await query("CREATE TABLE IF NOT EXISTS migrations ( file_name varchar(512), PRIMARY KEY (file_name) );");
    const executedScripts = (await query("SELECT file_name FROM migrations", undefined, false)).map((r: any) => r.file_name);
    return files.filter(
      (fileName) =>
        !executedScripts.includes(fileName) &&
        fileName.toLowerCase().endsWith(".sql")
    );
  } catch (err) {
    console.log("Error while getting executed migration scripts.");
    console.error(err);
    process.exit();
  }
};

export const query = (queryString: string, parameters?: Array<any>, printError: boolean = true) => {
  return new Promise(
    (resolve: (value: any) => void, reject: (reason: any) => void) => {
      connection.query(queryString, parameters, (err: any, rows: Array<any>) => {
        if (rows) {
          resolve(rows);
        } else {
          if (printError) {
            console.error(err);
          }
          reject("An error occurred while getting data from the database");
        }
      });
    }
  );
};
