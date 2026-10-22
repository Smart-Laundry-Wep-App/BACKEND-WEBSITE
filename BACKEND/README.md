# 🧺 SCA Smart Laundry - Backend REST API (Express.js)

Backend RESTful API lengkap berbasis **Node.js** dan **Express.js** untuk sistem operasional **SCA Smart Laundry**. Backend ini dirancang selaras dengan halaman frontend, mendukung autentikasi JWT, data persistence otomatis (JSON Database Engine), filter pencarian, paginasi, dan CRUD lengkap.

---

## 🚀 Fitur Utama

- **Autentikasi & Otorisasi**:
  - Login via Email atau Username
  - Hash password menggunakan `bcryptjs`
  - JSON Web Token (JWT) untuk sesi yang aman
  - Register akun admin baru
- **Dashboard Operasional**:
  - Statistik status pesanan (Total Pesanan, Dalam Proses, Selesai, Antrean)
  - Data pesanan terkini untuk tampilan cepat
- **Kelola Pesanan (Orders)**:
  - List pesanan dengan filter status, pencarian, dan paginasi
  - Tambah pesanan baru (otomatis kalkulasi total tarif & buat entri tagihan)
  - Edit detail pesanan
  - Ubah status pesanan (`Sedang Cuci`, `Pengeringan`, `Siap Diambil`, `Pengantaran`, dll.)
  - Hapus pesanan
- **Pembayaran (Payments)**:
  - Catatan transaksi pembayaran (QRIS, Tunai, Transfer Bank)
  - Status pembayaran (`Lunas`, `Belum Bayar`, `Gagal`)
  - Sinkronisasi otomatis dengan status pembayaran pesanan
- **Riwayat Transaksi & Visual Grafik**:
  - Log riwayat transaksi lengkap
  - Data titik grafik SVG mingguan sesuai tampilan grafik frontend
- **Layanan dan Harga (Services)**:
  - Katalog layanan cuci (Kiloan, Satuan, Express, Khusus)
  - Statistik layanan terlaris & rata-rata tarif
  - Tambah, edit, nonaktifkan layanan
- **Info Promo & Kupon**:
  - Kelola kupon diskon & voucher promosi
  - Validasi kode kupon saat checkout
- **Kelola Notifikasi**:
  - Daftar notifikasi pelanggan (WhatsApp, SMS, Broadcast)
  - Kirim notifikasi baru
- **Profil Admin**:
  - Baca & perbarui data profil admin
  - Ganti kata sandi admin

---

## 📁 Struktur Direktori

```text
BACKEND/
├── .env                  # Konfigurasi environment (PORT, JWT_SECRET, dll.)
├── .env.example          # Contoh variabel environment
├── .gitignore
├── package.json          # Dependensi & script eksekusi
├── README.md             # Dokumentasi API
└── src/
    ├── app.js            # Inisialisasi Express & middleware
    ├── server.js         # Entry point server HTTP
    ├── config/
    │   └── env.js        # Validasi variabel konfigurasi
    ├── controllers/      # Logika bisnis setiap modul
    │   ├── auth.controller.js
    │   ├── dashboard.controller.js
    │   ├── notification.controller.js
    │   ├── order.controller.js
    │   ├── payment.controller.js
    │   ├── profile.controller.js
    │   ├── promo.controller.js
    │   ├── service.controller.js
    │   └── transaction.controller.js
    ├── data/
    │   ├── db.json       # Database tersimpan (otomatis dibuat)
    │   └── initialData.js# Data awal dummy lengkap
    ├── middlewares/
    │   ├── auth.middleware.js
    │   ├── error.middleware.js
    │   └── notFound.middleware.js
    ├── models/
    │   └── db.js         # Engine database JSON persistent
    ├── routes/           # Routing API modular
    │   ├── auth.routes.js
    │   ├── dashboard.routes.js
    │   ├── index.js      # Main router & katalog rute
    │   ├── notification.routes.js
    │   ├── order.routes.js
    │   ├── payment.routes.js
    │   ├── profile.routes.js
    │   ├── promo.routes.js
    │   ├── service.routes.js
    │   └── transaction.routes.js
    ├── scripts/
    │   └── seed.js       # Script reset database data dummy
    └── utils/
        ├── jwt.js        # Helper JWT sign & verify
        └── response.js   # Standard format JSON response
```

---

## ⚙️ Cara Menjalankan

### 1. Masuk ke Folder BACKEND & Install Dependensi
```powershell
cd "c:\Users\Narendra\Downloads\UPDATE UI FRONTEND-WEBSITE-main\BACKEND"
npm install
```

### 2. Jalankan Mode Development (Auto-Reload)
```powershell
npm run dev
```

Server akan aktif di:
- **Server URL**: `http://localhost:5000`
- **Katalog API**: `http://localhost:5000/api`
- **Health Check**: `http://localhost:5000/api/health`

### 3. Reset Data Dummy (Opsional)
Jika sewaktu-waktu ingin mengembalikan seluruh data awal seperti semula:
```powershell
npm run seed
```

---

## 🔑 Akun Default untuk Login

| Username | Password | Role |
| :--- | :--- | :--- |
| `admin` atau `admin@scalaundry.id` | `admin123` | Super Admin |
| `kasir_rina` atau `rina@scalaundry.id` | `admin123` | Kasir & Operator |

---

## 📚 Ringkasan Endpoint REST API

Semua respons memiliki struktur standar:
```json
{
  "success": true,
  "message": "Pesan deskriptif",
  "data": { ... }
}
```

### 1. Autentikasi (`/api/auth`)
| Method | Endpoint | Keterangan |
| :--- | :--- | :--- |
| `POST` | `/api/auth/login` | Login user/admin (`identifier` + `password`) |
| `POST` | `/api/auth/register` | Daftar admin/pengguna baru |
| `GET` | `/api/auth/me` | Dapatkan data user saat ini *(wajib Bearer Token)* |
| `POST` | `/api/auth/logout` | Logout |

### 2. Dashboard (`/api/dashboard`)
| Method | Endpoint | Keterangan |
| :--- | :--- | :--- |
| `GET` | `/api/dashboard/stats` | Ringkasan kartu statistik operasional |
| `GET` | `/api/dashboard/recent-orders` | 7 pesanan terbaru |

### 3. Kelola Pesanan (`/api/orders`)
| Method | Endpoint | Keterangan |
| :--- | :--- | :--- |
| `GET` | `/api/orders?search=&status=&page=&limit=` | Daftar pesanan terfilter |
| `GET` | `/api/orders/:id` | Detail pesanan berdasarkan ID (`ORD-8921`) |
| `POST` | `/api/orders` | Tambah pesanan baru |
| `PUT` | `/api/orders/:id` | Update data pesanan |
| `PATCH`| `/api/orders/:id/status` | Ubah status pesanan |
| `DELETE`| `/api/orders/:id` | Hapus pesanan |

### 4. Pembayaran (`/api/payments`)
| Method | Endpoint | Keterangan |
| :--- | :--- | :--- |
| `GET` | `/api/payments/stats` | Total omset & status tagihan |
| `GET` | `/api/payments?status=&search=` | Daftar riwayat pembayaran |
| `GET` | `/api/payments/:id` | Detail pembayaran |
| `POST` | `/api/payments` | Catat pembayaran baru |
| `PATCH`| `/api/payments/:id/status` | Ubah status pembayaran (`Lunas`/`Belum Bayar`) |
| `DELETE`| `/api/payments/:id` | Hapus pembayaran |

### 5. Riwayat Transaksi (`/api/transactions`)
| Method | Endpoint | Keterangan |
| :--- | :--- | :--- |
| `GET` | `/api/transactions?search=&preset=` | Daftar riwayat transaksi |
| `GET` | `/api/transactions/chart` | Titik koordinat kurva grafik mingguan |

### 6. Layanan & Harga (`/api/services`)
| Method | Endpoint | Keterangan |
| :--- | :--- | :--- |
| `GET` | `/api/services/stats` | Statistik katalog & harga rata-rata |
| `GET` | `/api/services/categories` | Daftar kategori layanan |
| `GET` | `/api/services?category=&activeOnly=` | Daftar layanan cuci |
| `GET` | `/api/services/:id` | Detail layanan |
| `POST` | `/api/services` | Tambah layanan baru |
| `PUT` | `/api/services/:id` | Update layanan |
| `DELETE`| `/api/services/:id` | Hapus layanan |

### 7. Info Promo (`/api/promos`)
| Method | Endpoint | Keterangan |
| :--- | :--- | :--- |
| `GET` | `/api/promos/stats` | Statistik klaim & estimasi hemat |
| `POST` | `/api/promos/validate` | Cek validitas & hitung potongan diskon kupon |
| `GET` | `/api/promos` | Daftar promo aktif |
| `POST` | `/api/promos` | Buat promo baru |
| `PUT` | `/api/promos/:id` | Update data promo |
| `DELETE`| `/api/promos/:id` | Hapus promo |

### 8. Notifikasi (`/api/notifications`)
| Method | Endpoint | Keterangan |
| :--- | :--- | :--- |
| `GET` | `/api/notifications?status=&search=` | Daftar notifikasi yang dikirim |
| `POST` | `/api/notifications/send` | Kirim notifikasi WhatsApp/SMS/In-app |
| `DELETE`| `/api/notifications/:id` | Hapus notifikasi |

### 9. Profil Admin (`/api/profile`)
| Method | Endpoint | Keterangan |
| :--- | :--- | :--- |
| `GET` | `/api/profile` | Dapatkan info profil admin |
| `PUT` | `/api/profile` | Update profil admin |
| `PUT` | `/api/profile/change-password` | Ganti kata sandi akun admin |
