# SCA Smart Laundry Backend

REST API Express.js + TypeScript untuk website admin/kasir dan aplikasi Flutter. Data operasional disimpan di MySQL. API menggunakan helmet, pembatasan percobaan login/registrasi, validasi Zod, dan respons JSON format `{ "success": true, "message": "...", "data": ... }`.

## Persyaratan

- Node.js 20 atau lebih baru
- MySQL 8+
- API key Gemini untuk analisis AI
- Firebase service account untuk push notification FCM

Frontend Next.js tidak disertakan di repository ini. Endpoint tetap menggunakan prefix `/api` dan bentuk respons modul backend sebelumnya; set `NEXT_PUBLIC_API_URL=http://localhost:5000/api` pada frontend saat development.

## Menjalankan di terminal VS Code (PowerShell)

```powershell
npm install
Copy-Item .env.example .env
```

Edit `.env` dan ganti `JWT_SECRET` dengan string acak privat (minimal 32 karakter; jangan gunakan nilai contoh). Jika MySQL CLI tersedia, buat database dan user aplikasi (samakan password dengan `DB_PASSWORD` di `.env`):

```powershell
mysql -u root -p -e "CREATE DATABASE sca_smart_laundry CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci; CREATE USER 'sca_laundry'@'localhost' IDENTIFIED BY 'ganti-password-ini'; GRANT ALL PRIVILEGES ON sca_smart_laundry.* TO 'sca_laundry'@'localhost';"
npm run db:migrate
npm run seed
npm run dev
```

Jika MySQL CLI tidak tersedia, buat database/user yang sama melalui MySQL Workbench.

Sebelum `npm run seed`, isi `ADMIN_NAME`, `ADMIN_USERNAME`, `ADMIN_EMAIL`, dan `ADMIN_PASSWORD` di `.env`. Seed tidak menyediakan password default dan tidak membuat data order/transaksi palsu. Seed hanya membuat role, katalog layanan awal yang bisa diedit, serta akun admin pertama. Jika akun admin sudah ada, seed tidak akan mengganti password-nya.

Backend baru tidak membaca atau menghapus `src/data/db.json`; data lokal lama tidak otomatis dipindahkan. Backup file itu dan lakukan migrasi terencana sebelum cutover bila berisi data operasional yang perlu dipertahankan.

Server berjalan di `http://localhost:5000`; health check `GET http://localhost:5000/api/health`.
Untuk production, jalankan `npm run build` lalu `npm start`. Simpan `.env` dan kredensial service account di secret manager deployment, jangan di Git.

## Environment

| Variabel | Keterangan |
|---|---|
| `PORT`, `NODE_ENV` | Port dan mode server |
| `JWT_SECRET` | Secret acak minimal 32 karakter; wajib, tanpa fallback |
| `JWT_EXPIRES_IN` | Masa berlaku JWT, default `7d` |
| `CORS_ORIGIN` | Origin frontend, pisahkan dengan koma jika lebih dari satu |
| `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, `DB_SSL_CA` | Koneksi MySQL; `DB_SSL_CA` opsional untuk sertifikat CA TLS |
| `GEMINI_API_KEY`, `GEMINI_MODEL` | Integrasi Gemini; analisis AI merespons 503 jika API key kosong |
| `FIREBASE_SERVICE_ACCOUNT_JSON` | JSON service account Firebase satu baris; tanpa konfigurasi, notifikasi tetap tercatat dengan status konfigurasi yang jelas |
| `ADMIN_NAME`, `ADMIN_USERNAME`, `ADMIN_EMAIL`, `ADMIN_PASSWORD` | Kredensial untuk seed admin awal |

## API utama

Semua endpoint operasional memerlukan `Authorization: ****** kecuali login, registrasi customer, dan health check.

| Modul | Endpoint |
|---|---|
| Auth | `POST /api/auth/login`, `POST /api/auth/register` (customer), `GET /api/auth/me`, `POST /api/auth/logout` |
| Dashboard | `GET /api/dashboard/stats`, `GET /api/dashboard/recent-orders` |
| Pengguna | `GET/POST /api/users`, `PATCH/DELETE /api/users/:id` (Admin) |
| Layanan | `GET /api/services`, `/categories`, `/stats`, `/:id`; `POST/PUT/DELETE /api/services` (Admin/Kasir) |
| Pesanan | `GET/POST /api/orders`, `GET/PUT/DELETE /api/orders/:id`, `PATCH /api/orders/:id/status` |
| Pembayaran | `GET /api/payments`, `/stats`, `/:id`; `POST /api/payments`, `PATCH /api/payments/:id/status`, `DELETE /api/payments/:id` (Admin/Kasir untuk perubahan) |
| Transaksi | `GET /api/transactions`, `GET /api/transactions/chart` |
| Promo | `GET /api/promos`, `/stats`, `/:id`, `POST /api/promos/validate`, `POST/PUT/DELETE /api/promos` |
| Profil & perangkat | `GET/PUT /api/profile`, `PUT /api/profile/change-password`, `PUT /api/profile/fcm-token` |
| Notifikasi | `GET /api/notifications`, `GET /api/notifications/recipients`; `POST /api/notifications/send`, `DELETE /api/notifications/:id` (Admin/Kasir) |
| Analisis AI | `POST /api/ai/analyze`, `GET /api/ai/results`, `PATCH /api/ai/results/:id/review` |

Admin dan Kasir dapat mengelola operasi; hanya Admin yang dapat mengelola akun dan membuat/verifikasi analisis AI. Customer hanya dapat melihat pesanan, pembayaran, dan notifikasi miliknya. `POST /api/auth/register` selalu membuat role Customer; akun staf dibuat oleh Admin melalui `/api/users`.

Untuk pemesanan mobile, body `POST /api/orders` menerima `serviceId` atau `service`, `weight`, dan opsional `latitude`/`longitude`. Customer menggunakan identitas dan telepon profilnya. Aplikasi mobile memperoleh token FCM lalu mendaftarkannya melalui `PUT /api/profile/fcm-token` dengan body `{ "token": "..." }`.

## Integrasi AI dan notifikasi

AI hanya menerima hitungan agregat status/antrean/keterlambatan; nama, telepon, alamat, catatan, dan ID pesanan pelanggan tidak dikirim ke Gemini. Prompt membatasi peran menjadi analis bisnis operasional laundry, memperlakukan data sebagai input tak tepercaya, melarang pembuatan fakta, dan meminta JSON. Output divalidasi dengan Zod sebelum disimpan di `ai_results`. Admin memverifikasi atau menandai hasil melalui endpoint review. Tanpa Gemini, endpoint mengembalikan 503; JSON yang tidak valid tidak disimpan.

FCM hanya mengirim kepada perangkat yang sudah mendaftarkan token. Perubahan status pesanan dan pembayaran dicatat di tabel notifikasi; status menunjukkan apakah push terkirim, token belum tersedia, konfigurasi belum tersedia, atau pengiriman gagal. Kegagalan push dicatat dan tidak dilaporkan sebagai terkirim.

## Database dan deployment

`database/schema.sql` membuat tabel roles, users, services, orders, payments, transactions, promos, ai_results, notifications, dan audit_logs beserta relasi serta indeksnya. `npm run db:migrate` menjalankan schema yang idempotent. Jalankan migrasi sebelum seed/server pada database kosong. Untuk deployment, gunakan database MySQL terkelola, TLS pada koneksi database jika tersedia, secret manager untuk semua rahasia, HTTPS di reverse proxy, dan atur `CORS_ORIGIN` hanya ke origin frontend yang dipercaya.
