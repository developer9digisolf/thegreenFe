'use client';

import Link from 'next/link';
import { Home, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="max-w-2xl w-full text-center">
        {/* Decorative Background Elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-500/5 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
        </div>

        {/* 404 Visual */}
        <div className="relative mb-8">
          <h1 className="text-[150px] md:text-[200px] font-black leading-none tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-emerald-600 to-emerald-800 opacity-20 select-none">
            404
          </h1>
          <div className="absolute inset-0 flex items-center justify-center mt-8 md:mt-12">
            <div className="p-8 bg-white/60 backdrop-blur-xl rounded-3xl border border-white shadow-2xl shadow-emerald-500/10 transform transition-all hover:scale-105 duration-500">
              <div className="w-20 h-20 bg-emerald-500 rounded-2xl flex items-center justify-center text-white mx-auto mb-6 shadow-lg shadow-emerald-500/30">
                <Home size={40} />
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mb-2">Halaman Tidak Ditemukan</h2>
              <p className="text-slate-500 text-lg max-w-md mx-auto mb-8">
                Maaf, halaman yang Anda cari mungkin telah dipindahkan atau tidak tersedia saat ini.
              </p>
              
              <div className="flex flex-col md:flex-row items-center justify-center gap-4">
                <Link 
                  href="/dashboard"
                  className="flex items-center gap-2 px-8 py-4 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-2xl transition-all shadow-lg shadow-emerald-500/25 active:scale-95 w-full md:w-auto justify-center"
                >
                  <Home size={20} />
                  Ke Dashboard
                </Link>
                <button 
                  onClick={() => window.history.back()}
                  className="flex items-center gap-2 px-8 py-4 bg-white hover:bg-slate-50 text-slate-700 font-bold rounded-2xl border border-slate-200 transition-all active:scale-95 w-full md:w-auto justify-center"
                >
                  <ArrowLeft size={20} />
                  Kembali
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <p className="text-slate-400 font-medium text-sm mt-24">
          &copy; {new Date().getFullYear()} The Green Spa Management System. All rights reserved.
        </p>
      </div>
    </div>
  );
}
