import fs from "fs";
import path from "path";

// Initialize the local JSON datastore
const dbPath = path.join(process.cwd(), "aegis-db.json");

const initDB = () => {
  if (!fs.existsSync(dbPath)) {
    fs.writeFileSync(dbPath, JSON.stringify({ links: [] }, null, 2));
  }
};

export const saveLink = (shortId, originalUrl) => {
  initDB();
  const rawData = fs.readFileSync(dbPath, "utf8");
  const db = JSON.parse(rawData);

  db.links.push({
    short_id: shortId,
    original_url: originalUrl,
    created_at: new Date().toISOString(),
  });

  fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
};

export const getLink = (shortId) => {
  initDB();
  const rawData = fs.readFileSync(dbPath, "utf8");
  const db = JSON.parse(rawData);
  return db.links.find((link) => link.short_id === shortId);
};
