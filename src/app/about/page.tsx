"use client";

import Link from "next/link";
import Header from "@/components/landing/Header";
import Footer from "@/components/landing/Footer";
import { useReveal } from "@/hooks/useReveal";

export default function AboutPage() {
  useReveal();

  return (
    <div className="overflow-x-hidden">
      <Header />

      {/* Hero Section */}
      <section className="relative min-h-[60svh] flex items-center pt-32 overflow-hidden">
        <img
          src="/assets/spa-bath.jpg"
          alt="About The Green"
          className="absolute inset-0 w-full h-full object-cover animate-slow-zoom"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-forest/80 via-forest/40 to-forest/90"></div>
        <div className="relative max-w-7xl mx-auto px-5 md:px-6 w-full text-white text-center">
          <span className="text-xs uppercase tracking-[0.3em] text-gold mb-5 block">Our Story</span>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-display mb-6">
            A sanctuary born from <br />
            <em className="text-gold not-italic">stillness</em>
          </h1>
        </div>
      </section>

      {/* Philosophy Section */}
      <section className="py-24 md:py-32 overflow-hidden">
        <div className="max-w-7xl mx-auto px-5 md:px-6">
          <div className="grid md:grid-cols-12 gap-10 md:gap-16 items-center">
            <div className="md:col-span-6 order-2 md:order-1 relative reveal">
              <div className="relative z-10">
                <img
                  src="/assets/spa-bath.jpg"
                  alt="Spa interior"
                  loading="lazy"
                  className="rounded-3xl w-full shadow-lift"
                />
              </div>
              <div className="absolute -top-10 -left-10 w-40 h-40 bg-gold/10 rounded-full blur-3xl -z-10"></div>
              <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-sage/10 rounded-full blur-3xl -z-10"></div>

              <div
                className="absolute -bottom-10 -right-4 md:-right-10 bg-white rounded-3xl p-6 md:p-8 shadow-lift border border-line z-20 reveal"
                style={{ transitionDelay: "0.3s" }}
              >
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-cream flex items-center justify-center text-forest">
                    <i className="fa-solid fa-award text-2xl text-gold"></i>
                  </div>
                  <div>
                    <p className="font-display text-3xl text-forest leading-none">10+</p>
                    <p className="text-xs uppercase tracking-widest text-muted mt-1">Years of Excellence</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="md:col-span-6 order-1 md:order-2 reveal">
              <span className="text-xs uppercase tracking-[0.4em] text-gold font-semibold mb-6 block">Our Philosophy</span>
              <h2 className="font-display text-4xl md:text-6xl mb-8 text-forest leading-[1.1]">
                Where ancient wisdom meets <em className="text-gold not-italic">modern</em> intention
              </h2>
              <div className="space-y-6">
                <p className="text-muted text-lg leading-relaxed">
                  The Green began as a small herbal garden in Bali — a quiet place where founder Maya Thompson learned that healing is less about doing and more about returning. A decade later, it has grown into a complete wellness sanctuary serving thousands.
                </p>
                <p className="text-muted text-lg leading-relaxed">
                  Every treatment is rooted in three principles: nature, intention and craftsmanship. Our therapists combine ancient Balinese techniques with contemporary wellness science.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-8 mt-12 border-t border-line pt-10 stagger-reveal">
                <div>
                  <div className="text-gold mb-3">
                    <i className="fa-solid fa-seedling text-xl"></i>
                  </div>
                  <p className="font-display text-xl text-forest mb-1">Purity</p>
                  <p className="text-sm text-muted">100% Organic botanical oils</p>
                </div>
                <div>
                  <div className="text-gold mb-3">
                    <i className="fa-solid fa-hand-holding-heart text-xl"></i>
                  </div>
                  <p className="font-display text-xl text-forest mb-1">Presence</p>
                  <p className="text-sm text-muted">Deeply attentive therapy</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quote Section */}
      <section className="py-24 bg-forest relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <path d="M0 100 C 20 0 50 0 100 100 Z" fill="currentColor"></path>
          </svg>
        </div>
        <div className="max-w-4xl mx-auto px-5 md:px-6 text-center relative z-10 reveal">
          <i className="fa-solid fa-quote-left text-gold/30 text-6xl mb-8"></i>
          <h2 className="font-display text-3xl md:text-5xl text-white italic leading-tight mb-10">
            "True relaxation is not the absence of noise, but the presence of peace within oneself."
          </h2>
          <div className="w-12 h-[1px] bg-gold/50 mx-auto mb-6"></div>
          <p className="text-gold uppercase tracking-[0.3em] text-sm">Maya Thompson — Founder</p>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16 md:py-24 bg-cream">
        <div className="max-w-7xl mx-auto px-5 md:px-6">
          <div className="text-center max-w-2xl mx-auto mb-12 md:mb-16">
            <span className="text-xs uppercase tracking-[0.3em] text-gold">Our Values</span>
            <h2 className="font-display text-3xl md:text-5xl mt-4 text-forest">What guides every session</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 md:gap-6">
            <div className="bg-white rounded-3xl p-6 md:p-8 border border-line/60">
              <div className="w-12 h-12 rounded-2xl bg-cream flex items-center justify-center text-forest mb-5">
                <i className="fa-solid fa-leaf"></i>
              </div>
              <h3 className="font-display text-xl text-forest mb-2">Natural</h3>
              <p className="text-sm text-muted leading-relaxed">Plant-based oils, herbal blends and zero synthetic fragrances.</p>
            </div>
            <div className="bg-white rounded-3xl p-6 md:p-8 border border-line/60">
              <div className="w-12 h-12 rounded-2xl bg-cream flex items-center justify-center text-forest mb-5">
                <i className="fa-solid fa-heart"></i>
              </div>
              <h3 className="font-display text-xl text-forest mb-2">Intentional</h3>
              <p className="text-sm text-muted leading-relaxed">Every touch is purposeful. We treat people, never schedules.</p>
            </div>
            <div className="bg-white rounded-3xl p-6 md:p-8 border border-line/60">
              <div className="w-12 h-12 rounded-2xl bg-cream flex items-center justify-center text-forest mb-5">
                <i className="fa-solid fa-wand-magic-sparkles"></i>
              </div>
              <h3 className="font-display text-xl text-forest mb-2">Crafted</h3>
              <p className="text-sm text-muted leading-relaxed">Treatments designed by a council of master therapists.</p>
            </div>
            <div className="bg-white rounded-3xl p-6 md:p-8 border border-line/60">
              <div className="w-12 h-12 rounded-2xl bg-cream flex items-center justify-center text-forest mb-5">
                <i className="fa-solid fa-shield-halved"></i>
              </div>
              <h3 className="font-display text-xl text-forest mb-2">Safe</h3>
              <p className="text-sm text-muted leading-relaxed">Internationally certified hygiene and wellness standards.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Artisans Section */}
      <section className="py-24 md:py-32">
        <div className="max-w-7xl mx-auto px-5 md:px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16 reveal">
            <div className="max-w-2xl">
              <span className="text-xs uppercase tracking-[0.3em] text-gold font-semibold mb-4 block">The Artisans</span>
              <h2 className="font-display text-4xl md:text-6xl text-forest">Hands you can trust</h2>
            </div>
            <p className="text-muted max-w-sm">Every therapist at The Green undergoes 500+ hours of advanced holistic training.</p>
          </div>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-8 md:gap-10 stagger-reveal">
            <div className="group">
              <div className="relative overflow-hidden rounded-[2rem] mb-6 shadow-soft">
                <img
                  src="/assets/therapist-1.jpg"
                  alt="Clara Jensen"
                  loading="lazy"
                  className="w-full h-[400px] md:h-[500px] object-cover group-hover:scale-110 transition duration-1000"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-forest/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="absolute bottom-6 left-6 right-6 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
                  <div className="flex gap-3">
                    <a
                      href="#"
                      className="w-10 h-10 rounded-full bg-white/20 backdrop-blur flex items-center justify-center hover:bg-gold transition text-white"
                    >
                      <i className="fa-brands fa-instagram"></i>
                    </a>
                    <a
                      href="#"
                      className="w-10 h-10 rounded-full bg-white/20 backdrop-blur flex items-center justify-center hover:bg-gold transition text-white"
                    >
                      <i className="fa-brands fa-linkedin-in"></i>
                    </a>
                  </div>
                </div>
              </div>
              <h4 className="font-display text-2xl text-forest">Clara Jensen</h4>
              <p className="text-sm uppercase tracking-widest text-gold mt-1">Wellness Coordinator</p>
            </div>

            <div className="group">
              <div className="relative overflow-hidden rounded-[2rem] mb-6 shadow-soft">
                <img
                  src="/assets/therapist-2.jpg"
                  alt="Hana Kim"
                  loading="lazy"
                  className="w-full h-[400px] md:h-[500px] object-cover group-hover:scale-110 transition duration-1000"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-forest/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="absolute bottom-6 left-6 right-6 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
                  <div className="flex gap-3">
                    <a
                      href="#"
                      className="w-10 h-10 rounded-full bg-white/20 backdrop-blur flex items-center justify-center hover:bg-gold transition text-white"
                    >
                      <i className="fa-brands fa-instagram"></i>
                    </a>
                    <a
                      href="#"
                      className="w-10 h-10 rounded-full bg-white/20 backdrop-blur flex items-center justify-center hover:bg-gold transition text-white"
                    >
                      <i className="fa-brands fa-linkedin-in"></i>
                    </a>
                  </div>
                </div>
              </div>
              <h4 className="font-display text-2xl text-forest">Hana Kim</h4>
              <p className="text-sm uppercase tracking-widest text-gold mt-1">Lead Healing Therapist</p>
            </div>

            <div className="group">
              <div className="relative overflow-hidden rounded-[2rem] mb-6 shadow-soft">
                <img
                  src="/assets/therapist-3.jpg"
                  alt="Maya Thompson"
                  loading="lazy"
                  className="w-full h-[400px] md:h-[500px] object-cover group-hover:scale-110 transition duration-1000"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-forest/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="absolute bottom-6 left-6 right-6 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
                  <div className="flex gap-3">
                    <a
                      href="#"
                      className="w-10 h-10 rounded-full bg-white/20 backdrop-blur flex items-center justify-center hover:bg-gold transition text-white"
                    >
                      <i className="fa-brands fa-instagram"></i>
                    </a>
                    <a
                      href="#"
                      className="w-10 h-10 rounded-full bg-white/20 backdrop-blur flex items-center justify-center hover:bg-gold transition text-white"
                    >
                      <i className="fa-brands fa-linkedin-in"></i>
                    </a>
                  </div>
                </div>
              </div>
              <h4 className="font-display text-2xl text-forest">Maya Thompson</h4>
              <p className="text-sm uppercase tracking-widest text-gold mt-1">Founder & Specialist</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-20 bg-forest text-white text-center">
        <div className="max-w-4xl mx-auto px-5 md:px-6">
          <h2 className="font-display text-3xl md:text-4xl mb-6">Step into the sanctuary</h2>
          <Link
            href="/booking"
            className="inline-flex items-center gap-2 bg-gold text-forest px-8 py-4 rounded-full font-medium hover:scale-105 transition"
          >
            Book a Session <i className="fa-solid fa-arrow-right text-xs"></i>
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
