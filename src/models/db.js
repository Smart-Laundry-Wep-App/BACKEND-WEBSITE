import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { initialData } from "../data/initialData.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_PATH = path.join(__dirname, "../data/db.json");

class Database {
  constructor() {
    this.data = null;
    this.init();
  }

  init() {
    try {
      if (!fs.existsSync(DB_PATH)) {
        this.data = JSON.parse(JSON.stringify(initialData));
        this.save();
      } else {
        const raw = fs.readFileSync(DB_PATH, "utf-8");
        this.data = JSON.parse(raw);
        // Ensure all collections exist
        for (const key of Object.keys(initialData)) {
          if (!this.data[key]) {
            this.data[key] = initialData[key];
          }
        }
      }
    } catch (err) {
      console.error("Gagal membaca db.json, menginisialisasi dengan initialData:", err.message);
      this.data = JSON.parse(JSON.stringify(initialData));
      this.save();
    }
  }

  save() {
    try {
      fs.writeFileSync(DB_PATH, JSON.stringify(this.data, null, 2), "utf-8");
    } catch (err) {
      console.error("Gagal menyimpan ke db.json:", err.message);
    }
  }

  // Generic collection operations
  findAll(collection, filterFn = null) {
    const list = this.data[collection] || [];
    if (typeof filterFn === "function") {
      return list.filter(filterFn);
    }
    return [...list];
  }

  findById(collection, id) {
    const list = this.data[collection] || [];
    return list.find((item) => String(item.id) === String(id)) || null;
  }

  findOne(collection, filterFn) {
    const list = this.data[collection] || [];
    return list.find(filterFn) || null;
  }

  create(collection, payload) {
    if (!this.data[collection]) {
      this.data[collection] = [];
    }
    this.data[collection].unshift(payload);
    this.save();
    return payload;
  }

  update(collection, id, updates) {
    const list = this.data[collection] || [];
    const index = list.findIndex((item) => String(item.id) === String(id));
    if (index === -1) return null;

    const updatedItem = {
      ...list[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    list[index] = updatedItem;
    this.save();
    return updatedItem;
  }

  delete(collection, id) {
    const list = this.data[collection] || [];
    const index = list.findIndex((item) => String(item.id) === String(id));
    if (index === -1) return false;

    list.splice(index, 1);
    this.save();
    return true;
  }

  reset() {
    this.data = JSON.parse(JSON.stringify(initialData));
    this.save();
    return this.data;
  }
}

export const db = new Database();
