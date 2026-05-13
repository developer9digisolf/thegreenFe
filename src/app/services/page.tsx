"use client";

import Link from "next/link";
import Header from "@/components/landing/Header";
import Footer from "@/components/landing/Footer";
import { useReveal } from "@/hooks/useReveal";

export default function ServicesPage() {
  useReveal();

  const services = [
    {
      title: "Relaxation Massage",
      price: "$120",
      duration: "90 Minutes",
      desc: "A flowing full-body session that melts deep tension and brings the nervous system into rest.",
      icon: "fa-spa",
    },
    {
      title: "Facial Glow",
      price: "$95",
      duration: "60 Minutes",
      desc: "Cleansing, exfoliation and a botanical mask to hydrate, brighten and restore radiance.",
      icon: "fa-wand-magic-sparkles",
    },
    {
      title: "Aromatherapy",
      price: "$110",
      duration: "75 Minutes",
      desc: "A calming massage with our signature essential oil blends for emotional balance.",
      icon: "fa-droplet",
    },
    {
      title: "Herbal Wrap",
      price: "$135",
      duration: "90 Minutes",
      desc: "A gentle herbal scrub followed by a warm botanical clay wrap. Smooth and renewed.",
      icon: "fa-wind",
    },
    {
      title: "Hot Stone Healing",
      price: "$130",
      duration: "80 Minutes",
      desc: "Smooth basalt stones gently warm tense muscles for deep release and grounding.",
      icon: "fa-mountain",
    },
    {
      title: "Sleep Ritual",
      price: "$145",
      duration: "100 Minutes",
      desc: "A specialized cranial massage designed to treat insomnia and mental fatigue.",
      icon: "fa-moon",
    },
  ];

  return (
    <div className="overflow-x-hidden">
      <Header />

      {/* Hero Section */}
      <section className="relative min-h-[60svh] flex items-center pt-32 overflow-hidden">
        <img
          src="/assets/spa-hero.jpg"
          alt="Our Services"
          className="absolute inset-0 w-full h-full object-cover animate-slow-zoom"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-forest/80 via-forest/40 to-forest/90"></div>
        <div className="relative max-w-7xl mx-auto px-5 md:px-6 w-full text-white text-center">
          <span className="text-xs uppercase tracking-[0.3em] text-gold mb-5 block">Healing Rituals</span>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-display mb-6">
            Treatments crafted to <br />
            <em className="text-gold not-italic">restore</em> balance
          </h1>
        </div>
      </section>

      {/* Menu Section */}
      <section className="py-20 md:py-28 gradient-soft">
        <div className="max-w-7xl mx-auto px-5 md:px-6 text-center mb-16">
          <span className="text-xs uppercase tracking-[0.3em] text-gold">Our Menu</span>
          <h2 className="font-display text-3xl md:text-5xl mt-4 text-forest">Signature Treatments</h2>
        </div>

        <div className="max-w-7xl mx-auto px-5 md:px-6">
          {/* Featured Ritual */}
          <div className="grid md:grid-cols-2 gap-10 md:gap-20 items-center mb-24 reveal">
            <div className="relative">
              <img
                src="/assets/spa-bath.jpg"
                alt="Signature Ritual"
                className="rounded-[2.5rem] w-full h-[450px] md:h-[600px] object-cover shadow-lift"
              />
              <div className="absolute top-8 left-8 bg-gold text-forest px-4 py-2 rounded-full text-xs font-bold tracking-widest uppercase">
                Most Immersive
              </div>
            </div>
            <div>
              <span className="text-xs uppercase tracking-[0.3em] text-gold font-semibold mb-6 block">Signature Ritual</span>
              <h2 className="font-display text-4xl md:text-6xl text-forest mb-8 leading-[1.1]">
                Full-Body <em className="text-gold not-italic">Healing</em> Journey
              </h2>
              <p className="text-muted text-lg leading-relaxed mb-8">
                Our most comprehensive treatment. A synchronized four-hand experience that combines volcanic hot stones, deep tissue therapy, and rare botanical oils to reset your entire being.
              </p>
              <div className="flex items-center gap-10 mb-10">
                <div>
                  <p className="text-xs uppercase tracking-widest text-muted mb-1">Duration</p>
                  <p className="font-display text-2xl text-forest">120 Minutes</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-widest text-muted mb-1">Investment</p>
                  <p className="font-display text-2xl text-gold">$280</p>
                </div>
              </div>
              <Link
                href="/booking"
                className="inline-flex items-center gap-3 bg-forest text-white px-8 py-4 rounded-full font-medium hover:bg-forest/90 transition shadow-soft"
              >
                Book this experience <i className="fa-solid fa-arrow-right text-xs"></i>
              </Link>
            </div>
          </div>

          {/* Other rituals */}
          <div className="text-center mb-16 reveal">
            <span className="text-xs uppercase tracking-[0.3em] text-gold font-semibold mb-4 block">Full Menu</span>
            <h2 className="font-display text-4xl text-forest">Healing Rituals</h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 stagger-reveal">
            {services.map((service, idx) => (
              <div
                key={idx}
                className="bg-white rounded-3xl p-8 border border-line/60 hover:shadow-lift transition-all duration-500 group relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-cream/50 rounded-bl-full -z-10 group-hover:bg-gold/10 transition-colors"></div>
                <div className="w-14 h-14 rounded-2xl bg-cream flex items-center justify-center text-forest mb-6 group-hover:bg-gold group-hover:text-white transition-all duration-500">
                  <i className={`fa-solid ${service.icon} text-xl`}></i>
                </div>
                <div className="flex justify-between items-start mb-4">
                  <h3 className="font-display text-2xl text-forest group-hover:text-gold transition-colors">{service.title}</h3>
                  <span className="font-display text-2xl text-forest/40">{service.price}</span>
                </div>
                <p className="text-sm text-muted leading-relaxed mb-8">{service.desc}</p>
                <div className="flex items-center justify-between mt-auto">
                  <span className="text-[10px] uppercase tracking-widest text-muted">{service.duration}</span>
                  <Link
                    href="/booking"
                    className="w-10 h-10 rounded-full border border-line flex items-center justify-center text-forest group-hover:bg-forest group-hover:text-white transition-all"
                  >
                    <i className="fa-solid fa-plus text-xs"></i>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Recommendation Section */}
      <section className="py-16 md:py-20 bg-cream text-center">
        <div className="max-w-4xl mx-auto px-5 md:px-6">
          <h2 className="font-display text-3xl md:text-4xl mb-4 text-forest">Not sure which to choose?</h2>
          <p className="text-muted mb-8">Our team will recommend a ritual based on what your body needs today.</p>
          <Link
            href="/booking"
            className="inline-flex items-center gap-2 bg-forest text-white px-8 py-4 rounded-full font-medium hover:bg-forest/90 transition"
          >
            Get a Recommendation <i className="fa-solid fa-arrow-right text-xs"></i>
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
