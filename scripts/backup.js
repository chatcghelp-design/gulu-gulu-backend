require("dotenv").config();

const { MongoClient } = require("mongodb");
const { google } = require("googleapis");
const fs = require("fs");
const path = require("path");
const zlib = require("zlib");

async function backup() {
  console.log("Backup Started...");

  const client = new MongoClient(process.env.MONGODB_URI);

  await client.connect();

  const db = client.db();

  const collections = await db.listCollections().toArray();

  let data = {};

  for (const col of collections) {
    data[col.name] = await db.collection(col.name).find({}).toArray();
  }

  await client.close();

  const json = JSON.stringify(data);

  const filename = `backup-${new Date()
    .toISOString()
    .replace(/[:.]/g, "-")}.json.gz`;

  const tempFile = path.join(__dirname, filename);

  fs.writeFileSync(tempFile, zlib.gzipSync(json));

  const credentials = JSON.parse(
    process.env.GOOGLE_SERVICE_ACCOUNT_JSON
  );

  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ["https://www.googleapis.com/auth/drive"],
  });

  const drive = google.drive({
    version: "v3",
    auth,
  });

  await drive.files.create({
    requestBody: {
      name: filename,
      parents: [process.env.GOOGLE_DRIVE_FOLDER_ID],
    },
    media: {
      mimeType: "application/gzip",
      body: fs.createReadStream(tempFile),
    },
  });

  fs.unlinkSync(tempFile);

  console.log("Backup Uploaded Successfully");
}

backup().catch(console.error);