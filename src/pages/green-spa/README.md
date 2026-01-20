# The Green Spa - Voucher Management System

## 📋 Project Overview

Sistem manajemen voucher spa yang memungkinkan:
- Penjualan paket voucher (1 paket = N voucher individual dengan QR code unik)
- Redemption voucher di POS
- Manajemen member, layanan, dan therapist
- Tracking penggunaan dan komisi

---

## 📁 File Structure

```
packages/main/src/pages/green-spa/
├── dashboard.html           # Dashboard utama dengan statistik
├── pos-mockup-v3.html       # POS System (versi terbaru) - updated
├── master-member.html       # CRUD Master Member + Detail Modal - updated
├── master-service.html      # CRUD Master Layanan - updated
├── master-therapist.html    # CRUD Master Therapist
├── master-package.html      # CRUD Paket Voucher
├── vouchers.html            # Daftar Voucher Terjual
├── pos.tsx                  # React component
├── index.ts                 # Export file
└── README.md                # Documentation (this file)
```

---

## 🎨 Design System

### Colors
```css
--spa-green: #059669;
--spa-green-light: #10b981;
--spa-green-bg: #ecfdf5;
--spa-green-border: #a7f3d0;

/* Category Colors */
--massage: #8b5cf6 (purple)
--therapy: #f97316 (orange)
--bodycare: #059669 (green)
--facial: #ec4899 (pink)
--paket: #06b6d4 (cyan)
```

### Typography
- Font: Plus Jakarta Sans
- Weights: 400, 500, 600, 700, 800

### Components
- Border Radius: 12-16px
- Cards: White bg, subtle shadow, 1px border
- Buttons: Gradient for primary, outlined for secondary
- Icons: Font Awesome 6.4.0

---

## 📄 Page Specifications

### 1. POS System (`pos-mockup-v3.html`)

**3 Mode Operasi:**
- **Sesi Baru**: Walk-in atau booking layanan
- **Jual Voucher**: Penjualan paket voucher
- **Redeem**: Penggunaan voucher member

**Features:**
- Panel member dengan info & body preference
- Grid layanan dengan kategori filter
- Cart dengan qty adjustment
- Pilih therapist dengan status real-time
- Modal pembayaran (Cash/Card/E-Wallet)
- Print voucher setelah pembelian (4 voucher/page)
- **NEW: Button "Backend"** untuk kembali ke dashboard

**Body Preference Display:**
- Menampilkan area yang harus dihindari (avoid)
- Tag merah dengan icon ✕

---

### 2. Master Layanan (`master-service.html`)

**Stats Row:**
- Total Layanan
- Kategori Massage
- Layanan Terlaris
- Rata-rata Harga

**Table Columns:**
| Column | Description |
|--------|-------------|
| Layanan | Icon + Nama + Deskripsi |
| Kategori | Tag dengan warna kategori |
| Durasi | Clock icon + menit |
| Harga | Format Rp |
| Status | Badge Aktif/Nonaktif |
| Aksi | Edit, Delete |

> **Note:** Komisi dihapus dari layanan karena dihitung flat ke semua therapist

**Add/Edit Modal:**
- Nama Layanan
- Kategori (dropdown)
- Durasi (15-min increments)
- Harga
- Deskripsi (textarea)
- Status (checkbox)

---

### 3. Master Therapist (`master-therapist.html`)

**Stats Row:**
- Total Therapist
- Available Now
- Rata-rata Rating
- Sesi Bulan Ini

**Table Columns:**
| Column | Description |
|--------|-------------|
| Therapist | Avatar (initials) + Nama + Phone |
| Keahlian | Multiple skill tags |
| Rating | Stars + nilai + review count |
| Sesi | Jumlah sesi bulan ini |
| Komisi | Total komisi bulan ini |
| Status | Available/Busy/Off/Leave (animated dot) |
| Aksi | View, Edit, Delete |

**Status Types:**
- 🟢 Available (pulsing green dot)
- 🟠 Busy (pulsing orange dot)
- ⚫ Off (static gray dot)
- 🔴 Leave (static red dot)

**Avatar System:**
- Female: Pink gradient background
- Male: Blue gradient background
- Display: 2 initials

**Skill Tags:**
- Massage (purple)
- Therapy (orange)
- Body Care (green)
- Facial (pink)

**Detail Modal:**
- Large avatar
- Contact info
- Stats: Rating, Total sessions, Monthly sessions
- Skills display
- Address
- Monthly commission

---

### 4. Master Member (`master-member.html`)

**Stats Row:**
- Total Member
- Member Aktif
- Punya Voucher
- Member Bulan Ini

**Table Columns:**
| Column | Description |
|--------|-------------|
| Member | Avatar (initials) + Nama + Phone |
| Tanggal Bergabung | Format tanggal |
| Sisa Voucher | Count + label "sesi tersisa" |
| Total Kunjungan | Count + label "kunjungan" |
| Status | Badge Aktif/Tidak Aktif/Hampir Expired |
| Aksi | View, Edit, Delete |

**Detail Modal (View):** ✅ NEW
- Member card dengan gradient hijau
  - Avatar dengan initials
  - Nama + Phone
  - Stats: Sisa Voucher, Kunjungan, Lama Member
- Info Grid: Email, Tanggal Bergabung, Jenis Kelamin, Tanggal Lahir
- **Body Preference Section** (highlight merah)
  - Title: "Area Hindari Pijat" dengan icon warning
  - Tags merah dengan icon ✕ untuk setiap area
  - Contoh: Leher, Pinggang Bawah, Lutut Kiri
- Voucher Aktif
  - List paket dengan sisa sesi dan tanggal expired
- Therapist Favorit
  - Tag kuning dengan icon bintang

**Add/Edit Modal:**
- Nama Lengkap
- No. Telepon
- Email
- Tanggal Lahir
- Jenis Kelamin
- Alamat
- Area Hindari Pijat (comma-separated input)

---

### 5. Master Package (`master-package.html`)

**Features:**
- CRUD paket voucher
- Auto-calculation (harga per sesi, % diskon)
- Buyer tracking

---

### 6. Vouchers (`vouchers.html`)

**Features:**
- List semua voucher individual yang terjual
- Filter by status, package, member
- QR code display
- Usage history

---

## 🗄️ Database Design

### ERD Overview

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│    members      │     │   packages      │     │    services     │
├─────────────────┤     ├─────────────────┤     ├─────────────────┤
│ id (PK)         │     │ id (PK)         │     │ id (PK)         │
│ name            │     │ name            │     │ name            │
│ phone           │     │ description     │     │ category        │
│ email           │     │ total_sessions  │     │ duration        │
│ address         │     │ price           │     │ price           │
│ gender          │     │ validity_days   │     │ description     │
│ birth_date      │     │ service_id (FK) │     │ icon            │
│ join_date       │     │ is_active       │     │ is_active       │
│ is_active       │     │ created_at      │     │ created_at      │
│ created_at      │     │ updated_at      │     │ updated_at      │
│ updated_at      │     └────────┬────────┘     └────────┬────────┘
└────────┬────────┘              │                       │
         │                       │                       │
         │     ┌─────────────────┴───────────────────────┘
         │     │
         │     ▼
         │  ┌─────────────────┐
         │  │ package_sales   │
         │  ├─────────────────┤
         │  │ id (PK)         │
         │  │ package_id (FK) │
         │  │ member_id (FK)  │
         │  │ sale_date       │
         │  │ expiry_date     │
         │  │ total_price     │
         │  │ payment_method  │
         │  │ created_by      │
         │  │ created_at      │
         └──┤                 │
            └────────┬────────┘
                     │
                     ▼
            ┌─────────────────┐     ┌─────────────────┐
            │    vouchers     │     │   therapists    │
            ├─────────────────┤     ├─────────────────┤
            │ id (PK)         │     │ id (PK)         │
            │ sale_id (FK)    │     │ name            │
            │ voucher_code    │◄────│ phone           │
            │ qr_code         │     │ gender          │
            │ status          │     │ address         │
            │ used_at         │     │ join_date       │
            │ used_by (FK)────┼────►│ skills (JSON)   │
            │ service_id (FK) │     │ rating          │
            │ therapist_id(FK)│     │ total_sessions  │
            │ notes           │     │ status          │
            │ created_at      │     │ is_active       │
            └─────────────────┘     │ created_at      │
                                    │ updated_at      │
                                    └─────────────────┘

┌─────────────────┐     ┌─────────────────┐
│ body_preferences│     │    sessions     │
├─────────────────┤     ├─────────────────┤
│ id (PK)         │     │ id (PK)         │
│ member_id (FK)  │     │ member_id (FK)  │
│ body_area       │     │ therapist_id(FK)│
│ preference_type │     │ service_id (FK) │
│ notes           │     │ voucher_id (FK) │
│ created_at      │     │ session_date    │
│ updated_at      │     │ start_time      │
└─────────────────┘     │ end_time        │
                        │ status          │
                        │ total_price     │
                        │ payment_method  │
                        │ notes           │
                        │ created_at      │
                        └─────────────────┘

┌─────────────────┐     ┌─────────────────┐
│   commissions   │     │     rooms       │
├─────────────────┤     ├─────────────────┤
│ id (PK)         │     │ id (PK)         │
│ therapist_id(FK)│     │ name            │
│ session_id (FK) │     │ capacity        │
│ amount          │     │ status          │
│ rate_percentage │     │ is_active       │
│ created_at      │     │ created_at      │
└─────────────────┘     └─────────────────┘
```

---

### Table Definitions

#### 1. `members`
```sql
CREATE TABLE members (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name            VARCHAR(100) NOT NULL,
    phone           VARCHAR(20) UNIQUE NOT NULL,
    email           VARCHAR(100),
    address         TEXT,
    gender          VARCHAR(10) CHECK (gender IN ('male', 'female')),
    birth_date      DATE,
    join_date       DATE DEFAULT CURRENT_DATE,
    is_active       BOOLEAN DEFAULT true,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### 2. `body_preferences`
```sql
CREATE TABLE body_preferences (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id       UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    body_area       VARCHAR(50) NOT NULL,
    preference_type VARCHAR(10) CHECK (preference_type IN ('avoid', 'prefer')),
    notes           TEXT,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(member_id, body_area)
);

-- Body areas: neck, shoulder, upper_back, lower_back, waist, 
--             left_arm, right_arm, left_leg, right_leg, 
--             left_knee, right_knee, head, face
```

#### 3. `services`
```sql
CREATE TABLE services (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name            VARCHAR(100) NOT NULL,
    category        VARCHAR(50) NOT NULL,
    duration        INTEGER NOT NULL, -- in minutes
    price           DECIMAL(12,2) NOT NULL,
    description     TEXT,
    icon            VARCHAR(50),
    is_active       BOOLEAN DEFAULT true,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Categories: massage, therapy, bodycare, facial, paket
```

#### 4. `therapists`
```sql
CREATE TABLE therapists (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name            VARCHAR(100) NOT NULL,
    phone           VARCHAR(20),
    gender          VARCHAR(10) CHECK (gender IN ('male', 'female')),
    address         TEXT,
    join_date       DATE DEFAULT CURRENT_DATE,
    skills          JSONB DEFAULT '[]', -- ["massage", "therapy", "bodycare", "facial"]
    rating          DECIMAL(2,1) DEFAULT 0,
    review_count    INTEGER DEFAULT 0,
    total_sessions  INTEGER DEFAULT 0,
    status          VARCHAR(20) DEFAULT 'available',
    is_active       BOOLEAN DEFAULT true,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Status: available, busy, off, leave
```

#### 5. `packages`
```sql
CREATE TABLE packages (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name            VARCHAR(100) NOT NULL,
    description     TEXT,
    total_sessions  INTEGER NOT NULL,
    price           DECIMAL(12,2) NOT NULL,
    validity_days   INTEGER NOT NULL,
    service_id      UUID REFERENCES services(id), -- NULL = any service
    is_active       BOOLEAN DEFAULT true,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### 6. `package_sales`
```sql
CREATE TABLE package_sales (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    package_id      UUID NOT NULL REFERENCES packages(id),
    member_id       UUID NOT NULL REFERENCES members(id),
    sale_date       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expiry_date     DATE NOT NULL,
    total_price     DECIMAL(12,2) NOT NULL,
    payment_method  VARCHAR(20) NOT NULL,
    notes           TEXT,
    created_by      UUID, -- staff/user id
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Payment methods: cash, card, ewallet
```

#### 7. `vouchers`
```sql
CREATE TABLE vouchers (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sale_id         UUID NOT NULL REFERENCES package_sales(id) ON DELETE CASCADE,
    voucher_code    VARCHAR(20) UNIQUE NOT NULL,
    qr_code         TEXT, -- QR code data or image URL
    status          VARCHAR(20) DEFAULT 'active',
    used_at         TIMESTAMP,
    therapist_id    UUID REFERENCES therapists(id),
    service_id      UUID REFERENCES services(id),
    session_id      UUID, -- links to sessions table when used
    notes           TEXT,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Status: active, used, expired, cancelled
-- voucher_code format: GS-YYYYMMDD-XXXX (e.g., GS-20250117-A1B2)
```

#### 8. `sessions`
```sql
CREATE TABLE sessions (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id       UUID REFERENCES members(id),
    therapist_id    UUID NOT NULL REFERENCES therapists(id),
    service_id      UUID NOT NULL REFERENCES services(id),
    voucher_id      UUID REFERENCES vouchers(id), -- NULL for walk-in
    room_id         UUID REFERENCES rooms(id),
    session_date    DATE NOT NULL,
    start_time      TIME NOT NULL,
    end_time        TIME,
    status          VARCHAR(20) DEFAULT 'scheduled',
    total_price     DECIMAL(12,2),
    payment_method  VARCHAR(20),
    notes           TEXT,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Status: scheduled, in_progress, completed, cancelled
```

#### 9. `commissions`
```sql
CREATE TABLE commissions (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    therapist_id    UUID NOT NULL REFERENCES therapists(id),
    session_id      UUID NOT NULL REFERENCES sessions(id),
    amount          DECIMAL(12,2) NOT NULL,
    rate_percentage DECIMAL(5,2) NOT NULL,
    is_paid         BOOLEAN DEFAULT false,
    paid_at         TIMESTAMP,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### 10. `rooms`
```sql
CREATE TABLE rooms (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name            VARCHAR(50) NOT NULL,
    capacity        INTEGER DEFAULT 1,
    description     TEXT,
    status          VARCHAR(20) DEFAULT 'available',
    is_active       BOOLEAN DEFAULT true,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Status: available, occupied, maintenance
```

#### 11. `settings`
```sql
CREATE TABLE settings (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key             VARCHAR(100) UNIQUE NOT NULL,
    value           JSONB NOT NULL,
    description     TEXT,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Example settings:
-- commission_rate: {"default": 20, "signature": 25}
-- business_hours: {"open": "09:00", "close": "21:00"}
-- voucher_prefix: "GS"
```

---

### Indexes

```sql
-- Members
CREATE INDEX idx_members_phone ON members(phone);
CREATE INDEX idx_members_name ON members(name);

-- Vouchers
CREATE INDEX idx_vouchers_code ON vouchers(voucher_code);
CREATE INDEX idx_vouchers_status ON vouchers(status);
CREATE INDEX idx_vouchers_sale_id ON vouchers(sale_id);

-- Sessions
CREATE INDEX idx_sessions_date ON sessions(session_date);
CREATE INDEX idx_sessions_member ON sessions(member_id);
CREATE INDEX idx_sessions_therapist ON sessions(therapist_id);

-- Commissions
CREATE INDEX idx_commissions_therapist ON commissions(therapist_id);
CREATE INDEX idx_commissions_unpaid ON commissions(is_paid) WHERE is_paid = false;
```

---

### Views

```sql
-- Member voucher balance
CREATE VIEW member_voucher_balance AS
SELECT 
    m.id as member_id,
    m.name,
    ps.id as sale_id,
    p.name as package_name,
    ps.expiry_date,
    COUNT(v.id) FILTER (WHERE v.status = 'active') as remaining_sessions,
    COUNT(v.id) FILTER (WHERE v.status = 'used') as used_sessions
FROM members m
JOIN package_sales ps ON m.id = ps.member_id
JOIN packages p ON ps.package_id = p.id
JOIN vouchers v ON ps.id = v.sale_id
WHERE ps.expiry_date >= CURRENT_DATE
GROUP BY m.id, m.name, ps.id, p.name, ps.expiry_date;

-- Therapist monthly stats
CREATE VIEW therapist_monthly_stats AS
SELECT 
    t.id,
    t.name,
    t.status,
    COUNT(s.id) as sessions_this_month,
    COALESCE(SUM(c.amount), 0) as commission_this_month
FROM therapists t
LEFT JOIN sessions s ON t.id = s.therapist_id 
    AND s.session_date >= date_trunc('month', CURRENT_DATE)
    AND s.status = 'completed'
LEFT JOIN commissions c ON s.id = c.session_id
WHERE t.is_active = true
GROUP BY t.id, t.name, t.status;
```

---

## 🔄 Business Logic

### Voucher Generation Flow
```
1. Staff pilih paket voucher di POS
2. Staff pilih/input member
3. Staff proses pembayaran
4. System generate N voucher codes (sesuai total_sessions paket)
5. Setiap voucher punya QR code unik
6. Print voucher (4 per page)
7. Package_sale record created
8. N voucher records created dengan status 'active'
```

### Voucher Redemption Flow
```
1. Member datang dengan voucher
2. Staff scan QR code atau input kode manual
3. System validasi:
   - Voucher exists
   - Status = 'active'
   - Not expired (check package_sale.expiry_date)
4. Staff pilih layanan (jika paket tidak spesifik)
5. Staff pilih therapist
6. System create session record
7. Voucher status → 'used'
8. Commission record created untuk therapist
```

### Commission Calculation
```
Commission = Session Price × Commission Rate (flat %)

- Commission rate di-set global di settings table
- Semua therapist mendapat rate yang sama
- Commission dihitung saat session completed
```

---

## 📱 Sample Data

### Services
| Name | Category | Duration | Price |
|------|----------|----------|-------|
| Traditional Massage | Massage | 60 min | Rp 150.000 |
| Aromatherapy | Massage | 90 min | Rp 220.000 |
| Hot Stone Therapy | Therapy | 90 min | Rp 280.000 |
| Deep Tissue Massage | Massage | 60 min | Rp 180.000 |
| Reflexology | Therapy | 45 min | Rp 120.000 |
| Full Body Scrub | Body Care | 60 min | Rp 200.000 |
| Facial Treatment | Facial | 60 min | Rp 175.000 |
| Signature Green Spa | Paket | 120 min | Rp 350.000 |

### Packages
| Name | Sessions | Price | Validity | Discount |
|------|----------|-------|----------|----------|
| Paket Hemat | 5 | Rp 650.000 | 90 days | 13% |
| Paket Premium | 10 | Rp 1.200.000 | 180 days | 20% |
| Paket VIP | 20 | Rp 2.200.000 | 365 days | 27% |
| Paket Signature | 5 | Rp 1.500.000 | 90 days | 15% |

### Therapists
| Name | Gender | Skills | Rating | Status |
|------|--------|--------|--------|--------|
| Dewi Wulandari | F | Massage, Therapy, Body Care | 4.9 | Available |
| Sri Astuti | F | Massage, Facial | 4.7 | Busy |
| Budi Prasetyo | M | Massage, Therapy | 4.8 | Available |
| Nia Rahmawati | F | Facial, Body Care | 4.9 | Available |
| Yuni Susanti | F | All | 4.6 | Busy |
| Andi Hermawan | M | Massage, Therapy | 4.8 | Available |
| Rina Nurhasanah | F | Massage | 4.2 | Leave |
| Lina Marlina | F | Massage, Body Care | 4.9 | Off |

---

## 🚀 Next Steps

### Phase 1 - Backend
- [ ] Setup Odoo/Supabase database
- [ ] Implement API endpoints
- [ ] QR code generation service
- [ ] Authentication & authorization

### Phase 2 - Integration
- [ ] Connect frontend to API
- [ ] Real-time therapist status
- [ ] Print service integration
- [ ] Payment gateway (optional)

### Phase 3 - Mobile
- [ ] Member mobile app (view vouchers)
- [ ] Staff mobile app (scan & redeem)

---

## 📝 Changelog

### Session 2 - January 17, 2025
- ✅ **master-service.html**: Removed commission column from table and modal form (commission calculated flat for all therapists)
- ✅ **pos-mockup-v3.html**: Added "Backend" button in header to navigate back to dashboard
- ✅ **master-member.html**: Added detail modal with body preference display
  - Member card with stats
  - Info grid (email, join date, gender, birthdate)
  - Body preference section with red warning tags
  - Active vouchers list
  - Favorite therapist display

### Session 1 - January 17, 2025
- Initial documentation created
- Database design completed
- All page specifications documented

---

## 📞 Support

Project by: CV. Digisolf Technology Consulting
Contact: [Your contact info]

---

*Last Updated: January 17, 2025 (Session 2)*
