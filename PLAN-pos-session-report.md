# 📋 PLAN: Laporan Sesi Kasir POS

## Status: ✅ SEMUA STEP SELESAI

---

## 🎯 Tujuan
Membuat halaman **Laporan Sesi Kasir** di dashboard admin yang menampilkan:
1. Daftar semua sesi kasir (open/closed) dengan pagination & filter
2. Detail per sesi: ringkasan penjualan, breakdown pembayaran, cash movements
3. Klik ke detail sale dari dalam sesi

---

## 📊 Analisis Existing

### ✅ Backend API — SUDAH LENGKAP (Tidak perlu perubahan)

| Endpoint | Method | Kegunaan | Status |
|---|---|---|---|
| `GET /api/cashier-sessions` | GET | List semua sesi + pagination + filter (status, userId, dateFrom, dateTo) | ✅ Ready |
| `GET /api/cashier-sessions/:id` | GET | Detail sesi basic (CashierSessionDto) | ✅ Ready |
| `GET /api/cashier-sessions/:id/detail` | GET | Detail lengkap: sales list, payment breakdown, cash movements | ✅ Ready |
| `GET /api/sales` | GET | List penjualan + filter by cashierSessionId | ✅ Ready |
| `GET /api/sales/:id` | GET | Detail penjualan (items, payments) | ✅ Ready |
| `GET /api/sales/summary` | GET | Summary penjualan (total, tunai, non-tunai) | ✅ Ready |

### ✅ Backend DTOs yang tersedia:

**CashierSessionDto:**
- id, sessionCode, userName, openedAt, closedAt
- openingCash, expectedClosingCash, actualClosingCash, cashDifference
- status (Open/Closed), statusName
- totalSales, totalSalesAmount, totalCashReceived, totalNonCashReceived

**CashierSessionDetailDto** (extends CashierSessionDto):
- cashMovements[] — riwayat kas masuk/keluar
- sales[] — daftar penjualan (id, saleCode, grandTotal, paymentStatus, saleDate, memberName)
- paymentBreakdown[] — ringkasan per metode pembayaran

### ✅ Frontend yang sudah ada:

| Item | Status |
|---|---|
| `rest.cashierSession` = `"cashier-sessions"` | ✅ Config ready |
| `rest.cashierSessionDetail` = `"cashier-sessions/:id"` | ✅ Config ready |
| `rest.cashierSessionDetailFull` = `"cashier-sessions/:id/detail"` | ✅ Config ready |
| `rest.sales` / `rest.salesDetail` / `rest.salesSummary` | ✅ Config ready |
| `dashboard/sales/page.tsx` — halaman penjualan | ✅ Sudah ada (bisa link ke sini) |
| `GreenSpaLayout.tsx` — sidebar menu | ✅ Perlu tambah menu item |

---

## 🏗️ Langkah Implementasi

### Step 1: Tambah Menu Sidebar
**File:** `src/components/green-spa/GreenSpaLayout.tsx`  
**Aksi:** Tambah menu "Sesi Kasir" di section "Transaksi"

```typescript
// Tambah di section "Transaksi", setelah "Penjualan"
{
    key: "cashier-sessions",
    path: "/dashboard/cashier-sessions",
    icon: "fa-cash-register",
    label: "Sesi Kasir",
    roles: ["owner", "admin", "office"]
}
```

**Status:** ⬜ Belum dimulai

---

### Step 2: Buat Halaman List Sesi Kasir
**File:** `src/app/dashboard/cashier-sessions/page.tsx` (BARU)  
**Aksi:** Halaman utama daftar sesi kasir

**Fitur halaman:**
- **Summary Cards** (4 kartu):
  - Total Sesi (hari ini)
  - Sesi Aktif (sedang buka)
  - Total Pendapatan
  - Rata-rata per Sesi
  
- **Filter & Search:**
  - Date range picker (filter tanggal)
  - Quick filter status: Semua | Aktif | Ditutup
  - Search by session code / user name

- **Tabel Sesi Kasir:**
  | Kolom | Data |
  |---|---|
  | Kode Sesi | sessionCode (monospace) |
  | Kasir | userName |
  | Dibuka | openedAt (tanggal + jam) |
  | Ditutup | closedAt atau badge "Aktif" |
  | Durasi | selisih openedAt - closedAt |
  | Kas Awal | openingCash |
  | Transaksi | totalSales count |
  | Total Penjualan | totalSalesAmount |
  | Tunai | totalCashReceived |
  | Non-Tunai | totalNonCashReceived |
  | Selisih Kas | cashDifference (warna: hijau=0, merah=kurang, biru=lebih) |
  | Aksi | Tombol detail |

- **Pagination** (15 per halaman)

**API yang digunakan:**
- `GET /api/cashier-sessions?page=1&pageSize=15&status=1&dateFrom=...&dateTo=...`

**Status:** ⬜ Belum dimulai

---

### Step 3: Buat Modal Detail Sesi Kasir
**File:** Masih di `src/app/dashboard/cashier-sessions/page.tsx`  
**Aksi:** Modal yang muncul saat klik baris sesi

**Konten modal:**

**Header:**
- Kode sesi, kasir, tanggal buka/tutup
- Status badge (Aktif/Ditutup)

**Section 1 — Ringkasan Kas:**
- Kas Awal → Expected → Aktual → Selisih
- Visual bar atau card layout

**Section 2 — Payment Breakdown:**
- Tabel per metode pembayaran: nama, jumlah transaksi, total
- Icon cash/non-cash

**Section 3 — Cash Movements:**
- Timeline kas masuk/keluar (opening, sales, cash in/out, closing)
- Setiap entry: waktu, tipe, jumlah, saldo setelahnya, catatan

**Section 4 — Daftar Penjualan:**
- List transaksi dalam sesi ini
- Kode, tanggal, member, total, status pembayaran
- Klik → buka detail sale (reuse modal dari dashboard/sales atau link)

**API yang digunakan:**
- `GET /api/cashier-sessions/:id/detail`

**Status:** ⬜ Belum dimulai

---

### Step 4: Detail Penjualan dari Dalam Modal Sesi
**File:** Masih di `src/app/dashboard/cashier-sessions/page.tsx`  
**Aksi:** Sub-modal atau expand untuk detail sale

**Opsi implementasi (pilih salah satu):**
- **A.** Reuse logic dari `dashboard/sales` — buat komponen SaleDetailModal terpisah
- **B.** Link navigasi ke `/dashboard/sales?saleId=xxx` 
- **C.** Inline expand dalam modal sesi

**Rekomendasi:** Opsi A — buat `SaleDetailModal` sebagai shared component

**API yang digunakan:**
- `GET /api/sales/:id`

**Status:** ⬜ Belum dimulai

---

## 📁 File yang Perlu Dibuat/Diubah

| File | Aksi | Step |
|---|---|---|
| `src/components/green-spa/GreenSpaLayout.tsx` | EDIT — tambah menu | Step 1 |
| `src/app/dashboard/cashier-sessions/page.tsx` | BARU — halaman utama | Step 2-4 |

**Total: 1 file baru, 1 file edit**  
**Backend: 0 perubahan** ✅

---

## 🔄 Progress Tracker

| Step | Deskripsi | Status |
|---|---|---|
| Step 1 | Tambah menu sidebar | ✅ Selesai |
| Step 2 | Halaman list sesi kasir + tabel + filter | ✅ Selesai |
| Step 3 | Modal detail sesi (kas, payment, movements) | ✅ Selesai |
| Step 4 | Detail penjualan dari dalam modal | ✅ Selesai |
| — | **Testing & Polish** | ⬜ Belum |

---

## 💡 Catatan Teknis

1. **Pagination format** — Backend menggunakan `Paginated()` response:
   ```json
   { "meta": { "success": true }, "data": [...], "pagination": { "currentPage": 1, "pageSize": 15, "total": 42 } }
   ```

2. **Filter status** — Backend enum `CashierSessionStatus`:
   - `0` = Open
   - `1` = Closed

3. **Konsistensi UI** — Ikuti pola dari `dashboard/sales/page.tsx`:
   - Summary cards di atas
   - Filter row dengan pill buttons
   - Tabel dengan hover effect
   - Modal detail dengan sections

4. **CashierSessionPaginationRequest** supports:
   - `status` (Open/Closed)
   - `userId` (filter by kasir)
   - `dateFrom`, `dateTo`
   - `search`, `page`, `pageSize`, `sortColumn`, `sortDirection`
