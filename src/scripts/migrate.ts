import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { pool } from "../db.js";

try {
  const schema = await readFile(resolve(process.cwd(), "database", "schema.sql"), "utf8");
  const statements = schema.split(";").map((statement) => statement.trim()).filter(Boolean);
  for (const statement of statements) {
    await pool.query(statement);
  }
  console.log(`Migrasi berhasil: ${statements.length} pernyataan schema dijalankan.`);
} catch (error) {
  console.error("Migrasi database gagal:", error);
  process.exitCode = 1;
} finally {
  await pool.end();
}
