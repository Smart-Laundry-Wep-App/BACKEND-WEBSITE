import { db } from "../models/db.js";

console.log("Menginisialisasi ulang database dummy SCA Smart Laundry...");
db.reset();
console.log("Database berhasil di-reset dengan data awal lengkap!");
process.exit(0);
