"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Header() {
  const [mobMenuOpen, setMobMenuOpen] = useState(false);
  const pathname = usePathname();

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "About", href: "/about" },
    { name: "Services", href: "/services" },
    { name: "Booking", href: "/booking" },
  ];

  return (
    <header className="absolute top-0 inset-x-0 z-30 pt-8 md:pt-10">
      <div className="max-w-7xl mx-auto px-5 md:px-6 flex items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2 font-display text-lg md:text-xl tracking-widest text-white">
          <img src="/logo.png" alt="The Green Logo" className="h-8 md:h-10 w-auto object-contain" />
          THE GREEN
        </Link>
        <nav className="hidden lg:flex items-center gap-1 bg-white/10 backdrop-blur-md border-white/20 border rounded-full px-2 py-2">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className={`px-4 py-2 text-sm rounded-full transition ${
                pathname === link.href
                  ? "bg-forest text-white"
                  : "text-white/90 hover:bg-black/5"
              }`}
            >
              {link.name}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <Link
            href="/booking"
            className="hidden sm:inline-flex items-center gap-2 bg-gold text-forest px-4 md:px-5 py-2.5 md:py-3 rounded-full text-xs md:text-sm font-medium hover:scale-105 transition"
          >
            Book Now <i className="fa-solid fa-arrow-right text-xs"></i>
          </Link>
          <button
            onClick={() => setMobMenuOpen(!mobMenuOpen)}
            className="lg:hidden w-10 h-10 rounded-full border border-white/30 text-white flex items-center justify-center"
            aria-label="Menu"
          >
            <i className={`fa-solid ${mobMenuOpen ? "fa-xmark" : "fa-bars"} text-sm`}></i>
          </button>
        </div>
      </div>
      {mobMenuOpen && (
        <div id="mob-menu" className="lg:hidden mx-5 mt-3 bg-white rounded-2xl shadow-lift border border-line p-4 flex flex-col">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              onClick={() => setMobMenuOpen(false)}
              className={`px-4 py-3 text-sm text-forest rounded-xl hover:bg-cream ${
                pathname === link.href ? "bg-cream font-medium" : ""
              }`}
            >
              {link.name}
            </Link>
          ))}
          <Link
            href="/booking"
            onClick={() => setMobMenuOpen(false)}
            className="sm:hidden mt-2 inline-flex items-center justify-center gap-2 bg-gold text-forest px-5 py-3 rounded-full text-sm font-medium"
          >
            Book Now <i className="fa-solid fa-arrow-right text-xs"></i>
          </Link>
        </div>
      )}
    </header>
  );
}
