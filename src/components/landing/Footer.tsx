import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-forest text-white pt-16 md:pt-20 pb-8">
      <div className="max-w-7xl mx-auto px-5 md:px-6">
        <div className="grid sm:grid-cols-2 md:grid-cols-5 gap-10 pb-12">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 font-display text-xl tracking-widest mb-4">
              <img src="/logo.png" alt="The Green Logo" className="h-8 w-auto object-contain" />
              THE GREEN
            </div>
            <p className="text-white/70 text-sm leading-relaxed max-w-sm mb-6">
              Healing holistic treatments designed to restore balance, energy and inner peace for every guest.
            </p>
            <div className="flex gap-3">
              <a href="#" className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center hover:bg-gold hover:text-forest hover:border-gold transition">
                <i className="fa-brands fa-instagram text-sm"></i>
              </a>
              <a href="#" className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center hover:bg-gold hover:text-forest hover:border-gold transition">
                <i className="fa-brands fa-facebook text-sm"></i>
              </a>
              <a href="#" className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center hover:bg-gold hover:text-forest hover:border-gold transition">
                <i className="fa-brands fa-twitter text-sm"></i>
              </a>
            </div>
          </div>
          <div>
            <h5 className="font-display text-lg mb-4 text-gold">Explore</h5>
            <ul className="space-y-2 text-sm text-white/70">
              <li><Link href="/" className="hover:text-white">Home</Link></li>
              <li><Link href="/about" className="hover:text-white">About</Link></li>
              <li><Link href="/services" className="hover:text-white">Services</Link></li>
              <li><Link href="/booking" className="hover:text-white">Booking</Link></li>
            </ul>
          </div>
          <div>
            <h5 className="font-display text-lg mb-4 text-gold">Services</h5>
            <ul className="space-y-2 text-sm text-white/70">
              <li>Healing Massage</li>
              <li>Facial Therapy</li>
              <li>Aromatherapy</li>
              <li>Body Wrap</li>
            </ul>
          </div>
          <div>
            <h5 className="font-display text-lg mb-4 text-gold">Visit</h5>
            <ul className="space-y-2 text-sm text-white/70">
              <li>Jl. Sanctuary 88, Bali</li>
              <li>Open 9AM – 9PM</li>
              <li>hello@thegreen.com</li>
              <li>+62 812 3456 7890</li>
            </ul>
          </div>
        </div>
        <div className="border-t border-white/10 pt-6 text-center text-xs text-white/50">
          © 2026 The Green Wellness Sanctuary. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
