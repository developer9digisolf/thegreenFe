import Link from 'next/link';

export default function Dashboard() {
  return (
    <div className="max-w-[1600px] mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-slate-900 mb-1 tracking-tight">Dashboard</h1>
        <p className="text-slate-500 text-sm">Selamat datang di The Green Spa Management System</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <div className="bg-white rounded-[2rem] p-7 shadow-sm border border-slate-100 hover:shadow-xl hover:shadow-emerald-500/5 hover:-translate-y-1 transition-all duration-300 group relative overflow-hidden">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-500 flex items-center justify-center text-xl mb-6 group-hover:scale-110 transition-transform">
            <i className="fa-solid fa-calendar-check"></i>
          </div>
          <div className="text-4xl font-black text-slate-900 mb-1 tracking-tighter">24</div>
          <div className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Sesi Hari Ini</div>
          <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-500 mt-4 bg-emerald-50 w-fit px-2 py-1 rounded-full">
            <i className="fa-solid fa-arrow-up"></i> 12% dari kemarin
          </div>
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-emerald-500/10 transition-colors"></div>
        </div>

        <div className="bg-white rounded-[2rem] p-7 shadow-sm border border-slate-100 hover:shadow-xl hover:shadow-blue-500/5 hover:-translate-y-1 transition-all duration-300 group relative overflow-hidden">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-500 flex items-center justify-center text-xl mb-6 group-hover:scale-110 transition-transform">
            <i className="fa-solid fa-money-bill-wave"></i>
          </div>
          <div className="text-4xl font-black text-slate-900 mb-1 tracking-tighter">Rp 8.5jt</div>
          <div className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Pendapatan Hari Ini</div>
          <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-500 mt-4 bg-emerald-50 w-fit px-2 py-1 rounded-full">
            <i className="fa-solid fa-arrow-up"></i> 8% dari kemarin
          </div>
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-blue-500/10 transition-colors"></div>
        </div>

        <div className="bg-white rounded-[2rem] p-7 shadow-sm border border-slate-100 hover:shadow-xl hover:shadow-purple-500/5 hover:-translate-y-1 transition-all duration-300 group relative overflow-hidden">
          <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-500 flex items-center justify-center text-xl mb-6 group-hover:scale-110 transition-transform">
            <i className="fa-solid fa-users"></i>
          </div>
          <div className="text-4xl font-black text-slate-900 mb-1 tracking-tighter">1,248</div>
          <div className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Total Member</div>
          <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-500 mt-4 bg-emerald-50 w-fit px-2 py-1 rounded-full">
            <i className="fa-solid fa-arrow-up"></i> 5 member baru
          </div>
          <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-purple-500/10 transition-colors"></div>
        </div>

        <div className="bg-white rounded-[2rem] p-7 shadow-sm border border-slate-100 hover:shadow-xl hover:shadow-orange-500/5 hover:-translate-y-1 transition-all duration-300 group relative overflow-hidden">
          <div className="w-12 h-12 rounded-2xl bg-orange-50 text-orange-500 flex items-center justify-center text-xl mb-6 group-hover:scale-110 transition-transform">
            <i className="fa-solid fa-ticket"></i>
          </div>
          <div className="text-4xl font-black text-slate-900 mb-1 tracking-tighter">156</div>
          <div className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Voucher Aktif</div>
          <div className="flex items-center gap-1.5 text-xs font-bold text-red-500 mt-4 bg-red-50 w-fit px-2 py-1 rounded-full">
            <i className="fa-solid fa-arrow-down"></i> 3 expired
          </div>
          <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/5 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-orange-500/10 transition-colors"></div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mb-10">
        <h2 className="text-xl font-extrabold text-slate-900 mb-6 flex items-center gap-2">
          <span className="w-2 h-8 bg-emerald-500 rounded-full"></span>
          Aksi Cepat
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <Link href="/dashboard/pos" className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100 hover:border-emerald-500 hover:shadow-xl hover:shadow-emerald-500/5 transition-all group no-underline text-center">
            <div className="w-16 h-16 rounded-[1.2rem] bg-emerald-50 text-emerald-500 flex items-center justify-center text-2xl mx-auto mb-5 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
              <i className="fa-solid fa-plus"></i>
            </div>
            <div className="text-base font-bold text-slate-900 mb-1 group-hover:text-emerald-500 transition-colors">Buat Sesi Baru</div>
            <div className="text-xs text-slate-400">Walk-in atau pakai voucher</div>
          </Link>
          <Link href="/dashboard/pos" className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100 hover:border-purple-500 hover:shadow-xl hover:shadow-purple-500/5 transition-all group no-underline text-center">
            <div className="w-16 h-16 rounded-[1.2rem] bg-purple-50 text-purple-500 flex items-center justify-center text-2xl mx-auto mb-5 group-hover:scale-110 group-hover:-rotate-6 transition-all duration-300">
              <i className="fa-solid fa-gift"></i>
            </div>
            <div className="text-base font-bold text-slate-900 mb-1 group-hover:text-purple-500 transition-colors">Jual Voucher</div>
            <div className="text-xs text-slate-400">Paket voucher member</div>
          </Link>
          <Link href="/dashboard/master/members" className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100 hover:border-blue-500 hover:shadow-xl hover:shadow-blue-500/5 transition-all group no-underline text-center">
            <div className="w-16 h-16 rounded-[1.2rem] bg-blue-50 text-blue-500 flex items-center justify-center text-2xl mx-auto mb-5 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
              <i className="fa-solid fa-user-plus"></i>
            </div>
            <div className="text-base font-bold text-slate-900 mb-1 group-hover:text-blue-500 transition-colors">Tambah Member</div>
            <div className="text-xs text-slate-400">Daftarkan member baru</div>
          </Link>
          <Link href="/dashboard/pos" className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100 hover:border-orange-500 hover:shadow-xl hover:shadow-orange-500/5 transition-all group no-underline text-center">
            <div className="w-16 h-16 rounded-[1.2rem] bg-orange-50 text-orange-500 flex items-center justify-center text-2xl mx-auto mb-5 group-hover:scale-110 group-hover:-rotate-6 transition-all duration-300">
              <i className="fa-solid fa-qrcode"></i>
            </div>
            <div className="text-base font-bold text-slate-900 mb-1 group-hover:text-orange-500 transition-colors">Scan Voucher</div>
            <div className="text-xs text-slate-400">Redeem voucher member</div>
          </Link>
        </div>
      </div>

      {/* Main Content Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Recent Activity */}
        <div className="lg:col-span-3 bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden flex flex-col">
          <div className="p-8 pb-6 flex items-center justify-between">
            <h3 className="text-xl font-extrabold text-slate-900 m-0">Aktivitas Terbaru</h3>
            <Link href="#" className="text-emerald-500 text-sm font-bold no-underline hover:underline">Lihat Semua</Link>
          </div>
          <div className="p-8 pt-0 flex flex-col gap-6">
            <div className="flex items-center gap-5 group">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-500 flex items-center justify-center text-lg shrink-0 group-hover:bg-emerald-500 group-hover:text-white transition-all duration-300 shadow-sm shadow-emerald-500/10">
                <i className="fa-solid fa-check"></i>
              </div>
              <div className="flex-1">
                <div className="text-base font-bold text-slate-900 mb-0.5">Sesi selesai - Sarah Wijaya</div>
                <div className="text-sm text-slate-500">Traditional Massage 60 menit oleh Maya Putri</div>
              </div>
              <div className="text-xs font-bold text-slate-400 whitespace-nowrap">5m ago</div>
            </div>

            <div className="flex items-center gap-5 group">
              <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-500 flex items-center justify-center text-lg shrink-0 group-hover:bg-purple-500 group-hover:text-white transition-all duration-300 shadow-sm shadow-purple-500/10">
                <i className="fa-solid fa-ticket"></i>
              </div>
              <div className="flex-1">
                <div className="text-base font-bold text-slate-900 mb-0.5">Voucher dibeli - Budi Santoso</div>
                <div className="text-sm text-slate-500">Paket Premium 10 Sesi - Rp 1.200.000</div>
              </div>
              <div className="text-xs font-bold text-slate-400 whitespace-nowrap">15m ago</div>
            </div>

            <div className="flex items-center gap-5 group">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-500 flex items-center justify-center text-lg shrink-0 group-hover:bg-blue-500 group-hover:text-white transition-all duration-300 shadow-sm shadow-blue-500/10">
                <i className="fa-solid fa-user-plus"></i>
              </div>
              <div className="flex-1">
                <div className="text-base font-bold text-slate-900 mb-0.5">Member baru terdaftar</div>
                <div className="text-sm text-slate-500">Rina Kusuma - 081234567890</div>
              </div>
              <div className="text-xs font-bold text-slate-400 whitespace-nowrap">32m ago</div>
            </div>

            <div className="flex items-center gap-5 group">
              <div className="w-12 h-12 rounded-2xl bg-orange-50 text-orange-500 flex items-center justify-center text-lg shrink-0 group-hover:bg-orange-500 group-hover:text-white transition-all duration-300 shadow-sm shadow-orange-500/10">
                <i className="fa-solid fa-spa"></i>
              </div>
              <div className="flex-1">
                <div className="text-base font-bold text-slate-900 mb-0.5">Sesi dimulai - Diana Putri</div>
                <div className="text-sm text-slate-500">Aromatherapy 90 menit oleh Dewi Sartika</div>
              </div>
              <div className="text-xs font-bold text-slate-400 whitespace-nowrap">45m ago</div>
            </div>
          </div>
        </div>

        {/* Today's Sessions */}
        <div className="lg:col-span-2 bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden flex flex-col">
          <div className="p-8 pb-6 flex items-center justify-between">
            <h3 className="text-xl font-extrabold text-slate-900 m-0">Sesi Hari Ini</h3>
            <Link href="#" className="text-emerald-500 text-sm font-bold no-underline hover:underline">Lihat Semua</Link>
          </div>
          <div className="p-8 pt-0 flex flex-col gap-5 overflow-y-auto">
            <div className="flex items-center gap-4 group">
              <div className="w-11 h-11 rounded-2xl bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-sm shrink-0 border border-slate-200 group-hover:bg-emerald-50 group-hover:border-emerald-200 group-hover:text-emerald-600 transition-all">DK</div>
              <div className="flex-1 min-width-0">
                <div className="text-sm font-bold text-slate-900 truncate">Diana Kusuma</div>
                <div className="text-xs text-slate-500 truncate">Aromatherapy • Maya</div>
              </div>
              <div className="px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-[10px] font-extrabold uppercase tracking-widest border border-blue-100">Berlangsung</div>
            </div>

            <div className="flex items-center gap-4 group">
              <div className="w-11 h-11 rounded-2xl bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-sm shrink-0 border border-slate-200 group-hover:bg-emerald-50 group-hover:border-emerald-200 group-hover:text-emerald-600 transition-all">RS</div>
              <div className="flex-1 min-width-0">
                <div className="text-sm font-bold text-slate-900 truncate">Rini Susanti</div>
                <div className="text-xs text-slate-500 truncate">Hot Stone • Dewi</div>
              </div>
              <div className="px-3 py-1 rounded-full bg-amber-50 text-amber-600 text-[10px] font-extrabold uppercase tracking-widest border border-amber-100">Menunggu</div>
            </div>

            <div className="flex items-center gap-4 group">
              <div className="w-11 h-11 rounded-2xl bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-sm shrink-0 border border-slate-200 group-hover:bg-emerald-50 group-hover:border-emerald-200 group-hover:text-emerald-600 transition-all">AP</div>
              <div className="flex-1 min-width-0">
                <div className="text-sm font-bold text-slate-900 truncate">Ani Permata</div>
                <div className="text-xs text-slate-500 truncate">Traditional • Siti</div>
              </div>
              <div className="px-3 py-1 rounded-full bg-amber-50 text-amber-600 text-[10px] font-extrabold uppercase tracking-widest border border-amber-100">Menunggu</div>
            </div>

            <div className="flex items-center gap-4 group">
              <div className="w-11 h-11 rounded-2xl bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-sm shrink-0 border border-slate-200 group-hover:bg-emerald-50 group-hover:border-emerald-200 group-hover:text-emerald-600 transition-all">SW</div>
              <div className="flex-1 min-width-0">
                <div className="text-sm font-bold text-slate-900 truncate">Sarah Wijaya</div>
                <div className="text-xs text-slate-500 truncate">Reflexology • Maya</div>
              </div>
              <div className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 text-[10px] font-extrabold uppercase tracking-widest border border-emerald-100">Selesai</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}