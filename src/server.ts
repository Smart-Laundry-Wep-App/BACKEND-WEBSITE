
import app from "./app.js";
import { config } from "./config.js";
import { pool } from "./db.js";

async function start() {
  try {
    await pool.query("SELECT 1");
  } catch (error) {
    console.error(
      `Koneksi database gagal. Pastikan MySQL aktif, database "${config.DB_NAME}" sudah dibuat, lalu jalankan "npm run db:migrate".`,
      error,
    );
    await pool.end();
    process.exitCode = 1;
    return;
  }

  const server = app.listen(config.PORT, () => {
    console.log(`SCA Smart Laundry API aktif di http://localhost:${config.PORT}`);
  });

  async function shutdown(signal: string) {
    console.log(`${signal} diterima, menutup server...`);
    server.close(async (error) => {
      if (error) {
        console.error("Gagal menutup HTTP server:", error);
        process.exitCode = 1;
      }
      await pool.end();
      process.exit();
    });
  }

  process.once("SIGINT", () => void shutdown("SIGINT"));
  process.once("SIGTERM", () => void shutdown("SIGTERM"));

  server.on("error", (error) => {
    console.error("HTTP server gagal berjalan:", error);
    process.exitCode = 1;
  });
}

void start();
