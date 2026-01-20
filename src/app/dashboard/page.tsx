import Link from 'next/link';

export default function Dashboard() {
  return (
    <>
      <div className="page-header">
        <h1 className="page-title">Dashboard</h1>
        <p className="page-subtitle">Selamat datang di The Green Spa Management System</p>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon green">
            <i className="fa-solid fa-calendar-check"></i>
          </div>
          <div className="stat-value">24</div>
          <div className="stat-label">Sesi Hari Ini</div>
          <div className="stat-change up">
            <i className="fa-solid fa-arrow-up"></i> 12% dari kemarin
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon blue">
            <i className="fa-solid fa-money-bill-wave"></i>
          </div>
          <div className="stat-value">Rp 8.5jt</div>
          <div className="stat-label">Pendapatan Hari Ini</div>
          <div className="stat-change up">
            <i className="fa-solid fa-arrow-up"></i> 8% dari kemarin
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon purple">
            <i className="fa-solid fa-users"></i>
          </div>
          <div className="stat-value">1,248</div>
          <div className="stat-label">Total Member</div>
          <div className="stat-change up">
            <i className="fa-solid fa-arrow-up"></i> 5 member baru
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon orange">
            <i className="fa-solid fa-ticket"></i>
          </div>
          <div className="stat-value">156</div>
          <div className="stat-label">Voucher Aktif</div>
          <div className="stat-change down">
            <i className="fa-solid fa-arrow-down"></i> 3 expired
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <h2 className="section-title">Aksi Cepat</h2>
      <div className="quick-actions">
        <Link href="/dashboard/pos" className="quick-action">
          <div className="quick-action-icon" style={{ background: 'var(--spa-green-bg)', color: 'var(--spa-green)' }}>
            <i className="fa-solid fa-plus"></i>
          </div>
          <div className="quick-action-title">Buat Sesi Baru</div>
          <div className="quick-action-desc">Walk-in atau pakai voucher</div>
        </Link>
        <Link href="/dashboard/pos" className="quick-action">
          <div className="quick-action-icon" style={{ background: 'var(--accent-purple-light)', color: 'var(--accent-purple)' }}>
            <i className="fa-solid fa-gift"></i>
          </div>
          <div className="quick-action-title">Jual Voucher</div>
          <div className="quick-action-desc">Paket voucher member</div>
        </Link>
        <Link href="/dashboard/master/members" className="quick-action">
          <div className="quick-action-icon" style={{ background: 'var(--accent-blue-light)', color: 'var(--accent-blue)' }}>
            <i className="fa-solid fa-user-plus"></i>
          </div>
          <div className="quick-action-title">Tambah Member</div>
          <div className="quick-action-desc">Daftarkan member baru</div>
        </Link>
        <Link href="/dashboard/pos" className="quick-action">
          <div className="quick-action-icon" style={{ background: 'var(--accent-orange-light)', color: 'var(--accent-orange)' }}>
            <i className="fa-solid fa-qrcode"></i>
          </div>
          <div className="quick-action-title">Scan Voucher</div>
          <div className="quick-action-desc">Redeem voucher member</div>
        </Link>
      </div>

      {/* Content Grid */}
      <div className="content-grid">
        {/* Recent Activity */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Aktivitas Terbaru</h3>
            <Link href="#" style={{ color: 'var(--spa-green)', fontSize: '13px', fontWeight: 600, textDecoration: 'none' }}>Lihat Semua</Link>
          </div>
          <div className="card-body">
            <div className="activity-item">
              <div className="activity-icon" style={{ background: 'var(--spa-green-bg)', color: 'var(--spa-green)' }}>
                <i className="fa-solid fa-check"></i>
              </div>
              <div className="activity-content">
                <div className="activity-title">Sesi selesai - Sarah Wijaya</div>
                <div className="activity-desc">Traditional Massage 60 menit oleh Maya Putri</div>
              </div>
              <div className="activity-time">5 menit lalu</div>
            </div>
            <div className="activity-item">
              <div className="activity-icon" style={{ background: 'var(--accent-purple-light)', color: 'var(--accent-purple)' }}>
                <i className="fa-solid fa-ticket"></i>
              </div>
              <div className="activity-content">
                <div className="activity-title">Voucher dibeli - Budi Santoso</div>
                <div className="activity-desc">Paket Premium 10 Sesi - Rp 1.200.000</div>
              </div>
              <div className="activity-time">15 menit lalu</div>
            </div>
            <div className="activity-item">
              <div className="activity-icon" style={{ background: 'var(--accent-blue-light)', color: 'var(--accent-blue)' }}>
                <i className="fa-solid fa-user-plus"></i>
              </div>
              <div className="activity-content">
                <div className="activity-title">Member baru terdaftar</div>
                <div className="activity-desc">Rina Kusuma - 081234567890</div>
              </div>
              <div className="activity-time">32 menit lalu</div>
            </div>
            <div className="activity-item">
              <div className="activity-icon" style={{ background: 'var(--accent-orange-light)', color: 'var(--accent-orange)' }}>
                <i className="fa-solid fa-spa"></i>
              </div>
              <div className="activity-content">
                <div className="activity-title">Sesi dimulai - Diana Putri</div>
                <div className="activity-desc">Aromatherapy 90 menit oleh Dewi Sartika</div>
              </div>
              <div className="activity-time">45 menit lalu</div>
            </div>
          </div>
        </div>

        {/* Today's Sessions */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Sesi Hari Ini</h3>
            <Link href="#" style={{ color: 'var(--spa-green)', fontSize: '13px', fontWeight: 600, textDecoration: 'none' }}>Lihat Semua</Link>
          </div>
          <div className="card-body">
            <div className="session-item">
              <div className="session-avatar">DK</div>
              <div className="session-info">
                <div className="session-name">Diana Kusuma</div>
                <div className="session-service">Aromatherapy • Maya</div>
              </div>
              <div className="session-status ongoing">Berlangsung</div>
            </div>
            <div className="session-item">
              <div className="session-avatar">RS</div>
              <div className="session-info">
                <div className="session-name">Rini Susanti</div>
                <div className="session-service">Hot Stone • Dewi</div>
              </div>
              <div className="session-status waiting">Menunggu</div>
            </div>
            <div className="session-item">
              <div className="session-avatar">AP</div>
              <div className="session-info">
                <div className="session-name">Ani Permata</div>
                <div className="session-service">Traditional • Siti</div>
              </div>
              <div className="session-status waiting">Menunggu</div>
            </div>
            <div className="session-item">
              <div className="session-avatar">SW</div>
              <div className="session-info">
                <div className="session-name">Sarah Wijaya</div>
                <div className="session-service">Reflexology • Maya</div>
              </div>
              <div className="session-status completed">Selesai</div>
            </div>
            <div className="session-item">
              <div className="session-avatar">LW</div>
              <div className="session-info">
                <div className="session-name">Lisa Wulandari</div>
                <div className="session-service">Facial • Rina</div>
              </div>
              <div className="session-status completed">Selesai</div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}