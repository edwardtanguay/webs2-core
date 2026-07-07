import * as ftp from "basic-ftp";
import * as dotenv from "dotenv";
import * as path from "path";
import * as fs from "fs";

dotenv.config();

async function uploadApp() {
  const appName = process.argv[2];
  if (!appName) {
    console.error("Please provide an app name, e.g. npm run upload frenchnouns");
    process.exit(1);
  }

  const localDir = path.resolve(__dirname, "..", "..", appName);
  if (!fs.existsSync(localDir)) {
    console.error(`Local directory does not exist: ${localDir}`);
    process.exit(1);
  }

  const client = new ftp.Client();
  client.ftp.verbose = true;

  try {
    const host = process.env.FTP_SERVER;
    const user = process.env.FTP_USER;
    const password = process.env.FTP_PASSWORD;

    if (!host || !user || !password) {
      throw new Error("Missing FTP credentials in .env file");
    }

    await client.access({
      host,
      user,
      password,
      secure: false
    });

    console.log("Connected to FTP server.");

    const ftpDir = process.env.FTP_DIRECTORY || "/public_html";
    // Remote path structure: e.g. /public_html/frenchnouns
    // Using posix path joining for FTP paths
    const remoteDir = ftpDir.endsWith("/") ? `${ftpDir}${appName}` : `${ftpDir}/${appName}`;

    await client.ensureDir(remoteDir);
    console.log(`Uploading contents of ${localDir} to remote ${remoteDir}...`);

    await client.uploadFromDir(localDir);
    console.log("Upload completed successfully!");
  } catch (err) {
    console.error("Error during FTP upload:", err);
    process.exit(1);
  } finally {
    client.close();
  }
}

uploadApp();
