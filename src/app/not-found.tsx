'use client';

import Link from 'next/link';
import { Home, ArrowLeft, Leaf, Compass, SearchX } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center p-6 relative overflow-hidden font-sans">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-emerald-100 rounded-full blur-[100px] opacity-60 animate-pulse" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[600px] h-[600px] bg-emerald-50 rounded-full blur-[120px] opacity-50 animate-pulse" style={{ animationDelay: '3s' }} />
        
        {/* Floating Leaves */}
        <div className="absolute top-[15%] left-[10%] opacity-20 hidden md:block">
          <Leaf className="text-emerald-600 rotate-12 animate-bounce" size={48} style={{ animationDuration: '4s' }} />
        </div>
        <div className="absolute bottom-[20%] right-[10%] opacity-20 hidden md:block">
          <Leaf className="text-emerald-700 -rotate-45 animate-bounce" size={64} style={{ animationDuration: '6s', animationDelay: '1s' }} />
        </div>
        <div className="absolute top-[40%] right-[5%] opacity-10 hidden md:block">
          <Compass className="text-emerald-800 animate-spin-slow" size={160} />
        </div>
      </div>

      <div className="max-w-2xl w-full text-center relative z-10">
        <div className="mb-10 relative">
          {/* Animated 404 Text */}
          <div className="relative inline-block">
            <h1 className="text-[140px] md:text-[220px] font-black leading-none tracking-tighter text-emerald-900/[0.03] select-none">
              404
            </h1>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative group">
                <div className="absolute inset-0 bg-emerald-500 blur-2xl opacity-20 group-hover:opacity-40 transition-opacity duration-500 rounded-full"></div>
                <div className="relative w-32 h-32 md:w-40 md:h-40 bg-white rounded-[2rem] shadow-2xl flex items-center justify-center border border-emerald-50 transform transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3">
                  <div className="w-24 h-24 md:w-28 md:h-28 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-emerald-500/20">
                    <SearchX size={56} className="md:size-64" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white/60 backdrop-blur-3xl p-8 md:p-12 rounded-[3rem] shadow-[0_32px_64px_-12px_rgba(16,185,129,0.12)] border border-white/80 max-w-xl mx-auto">
          <h2 className="text-3xl md:text-5xl font-extrabold text-slate-800 mb-4 tracking-tight">
            Halaman <span className="text-emerald-600">Hilang</span> dari Radar
          </h2>
          <p className="text-slate-500 text-lg md:text-xl mb-10 leading-relaxed font-medium">
            Maaf, sepertinya Anda tersesat di rimbunnya <span className="text-emerald-700 font-semibold italic">The Green</span>. Mari kita bantu Anda kembali.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link 
              href="/dashboard"
              className="group w-full sm:w-auto flex items-center justify-center gap-3 px-10 py-5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl transition-all duration-300 shadow-lg shadow-emerald-600/20 active:scale-95"
            >
              <Home size={22} className="transition-transform group-hover:-translate-y-0.5" />
              <span>Ke Dashboard</span>
            </Link>
            
            <button 
              onClick={() => window.history.back()}
              className="group w-full sm:w-auto flex items-center justify-center gap-3 px-10 py-5 bg-white hover:bg-slate-50 text-slate-700 font-bold rounded-2xl border-2 border-slate-100 transition-all duration-300 shadow-sm active:scale-95"
            >
              <ArrowLeft size={22} className="transition-transform group-hover:-translate-x-1" />
              <span>Kembali</span>
            </button>
          </div>
        </div>

        {/* Footer info */}
        <div className="mt-16 opacity-60">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="h-px w-10 bg-emerald-900/10" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-900/40">The Green Spa Management</span>
            <div className="h-px w-10 bg-emerald-900/10" />
          </div>
          <p className="text-slate-400 font-medium text-sm">
            &copy; {new Date().getFullYear()} The Green Spa Management. All rights reserved.
          </p>
        </div>
      </div>

      <style jsx global>{`
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 20s linear infinite;
        }
      `}</style>
    </div>
  );
}
