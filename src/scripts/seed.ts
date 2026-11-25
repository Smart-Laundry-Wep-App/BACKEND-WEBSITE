import { randomUUID } from "node:crypto";
import { z } from "zod";
import { hashPassword } from "../auth.js";
import { pool, rows } from "../db.js";

const adminSchema = z.object({
  ADMIN_NAME: z.string().trim().min(2).max(120),
  ADMIN_USERNAME: z.string().trim().min(3).max(60).regex(/^[a-zA-Z0-9_.-]+$/),
  ADMIN_EMAIL: z.string().trim().email().max(190),
  ADMIN_PASSWORD: z.string().min(12).max(128),
});

const baselineServices = [
  ["Cuci Kering Setrika", "Kiloan", 9500, "kg", 24],
  ["Cuci Kering Lipat", "Kiloan", 7500, "kg", 24],
  ["Setrika Uap Saja", "Kiloan", 5000, "kg", 12],
  ["Express 3 Jam (Cuci + Setrika)", "Express", 18000, "kg", 3],
  ["Bedcover King Size", "Khusus", 35000, "pcs", 48],
  ["Cuci Sepatu Premium", "Khusus", 35000, "pasang", 48],
] as const;

try {
  for (const name of ["Admin", "Kasir", "Customer"]) {
    await pool.execute("INSERT IGNORE INTO roles (id, name) VALUES (?, ?)", [`role-${name.toLowerCase()}`, name]);
  }
  for (const [index, [name, category, price, unit, estimatedHours]] of baselineServices.entries()) {
    await pool.execute(
      `INSERT IGNORE INTO services (id, name, category, price, unit, estimated_hours, description)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [`service-initial-${String(index + 1).padStart(3, "0")}`, name, category, price, unit, estimatedHours, "Layanan awal; harga dan deskripsi dapat disesuaikan oleh pengelola."],
    );
  }

  const admin = adminSchema.parse({
    ADMIN_NAME: process.env.ADMIN_NAME,
    ADMIN_USERNAME: process.env.ADMIN_USERNAME,
    ADMIN_EMAIL: process.env.ADMIN_EMAIL,
    ADMIN_PASSWORD: process.env.ADMIN_PASSWORD,
  });
  const existing = await rows("SELECT id FROM users WHERE LOWER(email) = LOWER(?) OR LOWER(username) = LOWER(?)", [admin.ADMIN_EMAIL, admin.ADMIN_USERNAME]);
  if (existing.length) {
    console.log("Pengguna admin sudah tersedia; password tidak diubah.");
  } else {
    await pool.execute(
      `INSERT INTO users (id, name, username, email, password_hash, role_id)
       VALUES (?, ?, ?, ?, ?, 'role-admin')`,
      [randomUUID(), admin.ADMIN_NAME, admin.ADMIN_USERNAME, admin.ADMIN_EMAIL.toLowerCase(), await hashPassword(admin.ADMIN_PASSWORD)],
    );
    console.log(`Admin berhasil dibuat untuk ${admin.ADMIN_EMAIL}.`);
  }
} catch (error) {
  console.error("Seed database gagal:", error);
  process.exitCode = 1;
} finally {
  await pool.end();
}
