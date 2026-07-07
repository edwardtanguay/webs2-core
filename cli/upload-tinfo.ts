import * as ftp from "basic-ftp";
import * as dotenv from "dotenv";
import * as path from "path";
import * as fs from "fs";

dotenv.config();

async function uploadTinfo() {
  const localTinfoDir = path.resolve(__dirname, "..", "..", "tinfo");
  
  const filesToUpload = [
    { local: path.join(localTinfoDir, "index.html"), remote: "index.html" },
    { local: path.join(localTinfoDir, "styles.css"), remote: "styles.css" }
  ];

  for (const file of filesToUpload) {
    if (!fs.existsSync(file.local)) {
      console.error(`Local file does not exist: ${file.local}`);
      process.exit(1);
    }
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
    await client.ensureDir(ftpDir);

    for (const file of filesToUpload) {
      console.log(`Uploading ${file.local} to remote ${ftpDir}/${file.remote}...`);
      await client.uploadFrom(file.local, file.remote);
    }

    console.log("Tinfo upload completed successfully!");
  } catch (err) {
    console.error("Error during FTP upload:", err);
    process.exit(1);
  } finally {
    client.close();
  }
}

uploadTinfo();
