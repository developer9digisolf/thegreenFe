"use client";

import Link from "next/link";
import Header from "@/components/landing/Header";
import Footer from "@/components/landing/Footer";
import { useReveal } from "@/hooks/useReveal";

export default function LandingPage() {
  useReveal();

  return (
    <div className="overflow-x-hidden">
      <Header />

      {/* Hero Section */}
      <section className="relative min-h-[100svh] flex items-end overflow-hidden">
        <img
          src="/assets/spa-hero.jpg"
          alt="Tranquil spa"
          className="absolute inset-0 w-full h-full object-cover animate-slow-zoom"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-forest/70 via-forest/40 to-forest/95"></div>
        <div className="relative max-w-7xl mx-auto px-5 md:px-6 pb-40 md:pb-32 pt-32 md:pt-40 w-full">
          <div
            className="max-w-2xl text-white opacity-0 translate-y-[30px] animate-[fadeUp_1.2s_ease-out_forwards]"
          >
            <span className="inline-flex items-center gap-2 text-gold uppercase tracking-[0.3em] text-[10px] md:text-xs mb-5">
              <i className="fa-solid fa-sparkles text-xs"></i> Wellness Sanctuary
            </span>
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl leading-[1.05] font-display mb-6">
              Relax Deeply,<br />Renew Fully,<br />
              <em className="text-gold not-italic">Reconnect</em> With Yourself
            </h1>
            <p className="text-white/80 text-base md:text-lg max-w-lg mb-8 leading-relaxed">
              A place of pure serenity where each treatment melts tension, revitalizes your energy, and brings you closer to inner peace.
            </p>
            <div className="flex flex-wrap gap-3 md:gap-4">
              <Link
                href="/booking"
                className="inline-flex items-center gap-2 bg-gold text-forest px-6 md:px-7 py-3.5 md:py-4 rounded-full font-medium hover:scale-105 transition text-sm md:text-base"
              >
                Book Appointment <i className="fa-solid fa-arrow-right text-xs"></i>
              </Link>
              <Link
                href="/services"
                className="inline-flex items-center gap-2 border border-white/40 text-white px-6 md:px-7 py-3.5 md:py-4 rounded-full font-medium hover:bg-white/10 transition text-sm md:text-base"
              >
                Our Services <i className="fa-solid fa-play text-xs"></i>
              </Link>
            </div>
          </div>
        </div>
        <div className="absolute bottom-4 inset-x-4 md:inset-x-auto md:right-8 md:bottom-8 grid grid-cols-2 gap-3 md:max-w-md z-20">
          <div className="bg-white/95 backdrop-blur rounded-2xl p-4 md:p-5 shadow-soft">
            <div className="text-gold mb-2">
              <i className="fa-solid fa-spa"></i>
            </div>
            <p className="text-[10px] md:text-xs uppercase tracking-wider text-muted mb-1">Personalized</p>
            <p className="font-display text-base md:text-lg leading-tight text-forest">Relaxation Treatments</p>
          </div>
          <div className="bg-white/95 backdrop-blur rounded-2xl p-4 md:p-5 shadow-soft">
            <div className="text-gold mb-2">
              <i className="fa-solid fa-heart"></i>
            </div>
            <p className="text-[10px] md:text-xs uppercase tracking-wider text-muted mb-1">Trusted &amp; Trained</p>
            <p className="font-display text-base md:text-lg leading-tight text-forest">Wellness Experts</p>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-cream py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-5 md:px-6 grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-10 text-center stagger-reveal">
          <div>
            <div className="font-display text-4xl md:text-6xl text-forest mb-2">10+</div>
            <p className="text-xs md:text-sm text-muted">Years Wellness Expertise</p>
          </div>
          <div>
            <div className="font-display text-4xl md:text-6xl text-forest mb-2">5K+</div>
            <p className="text-xs md:text-sm text-muted">Happy Clients</p>
          </div>
          <div>
            <div className="font-display text-4xl md:text-6xl text-forest mb-2">30+</div>
            <p className="text-xs md:text-sm text-muted">Signature Treatments</p>
          </div>
          <div>
            <div className="font-display text-4xl md:text-6xl text-forest mb-2">95%</div>
            <p className="text-xs md:text-sm text-muted">Satisfaction Rate</p>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-20 md:py-28 overflow-hidden">
        <div className="max-w-7xl mx-auto px-5 md:px-6 grid md:grid-cols-2 gap-10 md:gap-16 items-center">
          <div className="relative order-2 md:order-1 reveal">
            <img
              src="/assets/spa-bath.jpg"
              alt="Spa bath"
              loading="lazy"
              className="rounded-3xl w-full shadow-lift"
            />
            <div className="absolute -bottom-6 -right-2 md:right-8 bg-white rounded-2xl p-4 md:p-5 shadow-soft flex items-center gap-3 max-w-[220px]">
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-cream flex items-center justify-center text-forest">
                <i className="fa-solid fa-leaf"></i>
              </div>
              <div>
                <p className="font-display text-xl md:text-2xl text-forest leading-none">100%</p>
                <p className="text-xs text-muted mt-1">Natural ingredients</p>
              </div>
            </div>
          </div>
          <div className="order-1 md:order-2 reveal">
            <span className="text-xs uppercase tracking-[0.3em] text-gold">About Us</span>
            <h2 className="font-display text-3xl md:text-5xl mt-4 mb-6 text-forest leading-tight">
              Where Expertise Flows With Intention And Care
            </h2>
            <p className="text-muted text-base md:text-lg leading-relaxed mb-8">
              Every session is crafted with skilled hands, guided by purpose, and fueled by a passion for helping you achieve complete relaxation and clarity.
            </p>
            <div className="grid grid-cols-2 gap-6 mb-10">
              <div className="border-l-2 border-gold pl-4">
                <p className="font-display text-lg md:text-xl text-forest">Holistic</p>
                <p className="text-xs md:text-sm text-muted">approach to wellness</p>
              </div>
              <div className="border-l-2 border-gold pl-4">
                <p className="font-display text-lg md:text-xl text-forest">Certified</p>
                <p className="text-xs md:text-sm text-muted">master therapists</p>
              </div>
            </div>
            <Link
              href="/about"
              className="inline-flex items-center gap-2 bg-forest text-white px-7 py-4 rounded-full font-medium hover:bg-forest/90 transition"
            >
              Discover More <i className="fa-solid fa-arrow-right text-xs"></i>
            </Link>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20 md:py-28 gradient-soft overflow-hidden">
        <div className="max-w-7xl mx-auto px-5 md:px-6">
          <div className="text-center max-w-2xl mx-auto mb-12 md:mb-16 reveal">
            <span className="text-xs uppercase tracking-[0.3em] text-gold">Featured Services</span>
            <h2 className="font-display text-3xl md:text-5xl mt-4 mb-6 text-forest">Healing Treatments</h2>
            <p className="text-muted">Step into comfort with selected treatments made to calm the body and refresh the soul.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 md:gap-6 stagger-reveal">
            <Link
              href="/services"
              className="bg-white rounded-3xl p-6 md:p-8 hover:shadow-lift transition-all hover:-translate-y-1 border border-line/60 group block"
            >
              <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-cream flex items-center justify-center text-forest mb-5 md:mb-6 group-hover:bg-gold group-hover:text-white transition">
                <i className="fa-solid fa-spa"></i>
              </div>
              <h3 className="font-display text-lg md:text-xl text-forest mb-3 leading-tight">Full-Body Massage</h3>
              <p className="text-sm text-muted leading-relaxed mb-5">A relaxing full-body massage that eases tension.</p>
              <span className="text-sm text-forest font-medium inline-flex items-center gap-1 group-hover:text-gold transition">
                Learn more <i className="fa-solid fa-arrow-right text-xs"></i>
              </span>
            </Link>
            <Link
              href="/services"
              className="bg-white rounded-3xl p-6 md:p-8 hover:shadow-lift transition-all hover:-translate-y-1 border border-line/60 group block"
            >
              <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-cream flex items-center justify-center text-forest mb-5 md:mb-6 group-hover:bg-gold group-hover:text-white transition">
                <i className="fa-solid fa-wand-magic-sparkles"></i>
              </div>
              <h3 className="font-display text-lg md:text-xl text-forest mb-3 leading-tight">Facial Glow</h3>
              <p className="text-sm text-muted leading-relaxed mb-5">Gentle facial that hydrates and restores natural glow.</p>
              <span className="text-sm text-forest font-medium inline-flex items-center gap-1 group-hover:text-gold transition">
                Learn more <i className="fa-solid fa-arrow-right text-xs"></i>
              </span>
            </Link>
            <Link
              href="/services"
              className="bg-white rounded-3xl p-6 md:p-8 hover:shadow-lift transition-all hover:-translate-y-1 border border-line/60 group block"
            >
              <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-cream flex items-center justify-center text-forest mb-5 md:mb-6 group-hover:bg-gold group-hover:text-white transition">
                <i className="fa-solid fa-droplet"></i>
              </div>
              <h3 className="font-display text-lg md:text-xl text-forest mb-3 leading-tight">Aromatherapy</h3>
              <p className="text-sm text-muted leading-relaxed mb-5">Calming session using essential oils for body & mind.</p>
              <span className="text-sm text-forest font-medium inline-flex items-center gap-1 group-hover:text-gold transition">
                Learn more <i className="fa-solid fa-arrow-right text-xs"></i>
              </span>
            </Link>
            <Link
              href="/services"
              className="bg-white rounded-3xl p-6 md:p-8 hover:shadow-lift transition-all hover:-translate-y-1 border border-line/60 group block"
            >
              <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-cream flex items-center justify-center text-forest mb-5 md:mb-6 group-hover:bg-gold group-hover:text-white transition">
                <i className="fa-solid fa-wind"></i>
              </div>
              <h3 className="font-display text-lg md:text-xl text-forest mb-3 leading-tight">Herbal Body Wrap</h3>
              <p className="text-sm text-muted leading-relaxed mb-5">Soft herbal scrub and warm wrap to nourish skin.</p>
              <span className="text-sm text-forest font-medium inline-flex items-center gap-1 group-hover:text-gold transition">
                Learn more <i className="fa-solid fa-arrow-right text-xs"></i>
              </span>
            </Link>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-5 md:px-6">
          <div className="flex flex-wrap items-end justify-between gap-6 mb-12 md:mb-16">
            <div>
              <span className="text-xs uppercase tracking-[0.3em] text-gold">Our Team</span>
              <h2 className="font-display text-3xl md:text-5xl mt-4 text-forest">Hands devoted to your wellness</h2>
            </div>
            <p className="text-muted max-w-md text-sm md:text-base">
              A team of certified wellness experts trained in ancient and modern healing traditions.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6 md:gap-8">
            <div className="group">
              <div className="relative overflow-hidden rounded-3xl mb-4">
                <img
                  src="/assets/therapist-1.jpg"
                  alt="Clara Jensen"
                  loading="lazy"
                  className="w-full h-[360px] md:h-[440px] object-cover group-hover:scale-105 transition duration-700"
                />
              </div>
              <h4 className="font-display text-xl md:text-2xl text-forest">Clara Jensen</h4>
              <p className="text-sm text-muted mt-1">Wellness Coordinator</p>
            </div>
            <div className="group">
              <div className="relative overflow-hidden rounded-3xl mb-4">
                <img
                  src="/assets/therapist-2.jpg"
                  alt="Hana Kim"
                  loading="lazy"
                  className="w-full h-[360px] md:h-[440px] object-cover group-hover:scale-105 transition duration-700"
                />
              </div>
              <h4 className="font-display text-xl md:text-2xl text-forest">Hana Kim</h4>
              <p className="text-sm text-muted mt-1">Lead Healing Therapist</p>
            </div>
            <div className="group">
              <div className="relative overflow-hidden rounded-3xl mb-4">
                <img
                  src="/assets/therapist-3.jpg"
                  alt="Maya Thompson"
                  loading="lazy"
                  className="w-full h-[360px] md:h-[440px] object-cover group-hover:scale-105 transition duration-700"
                />
              </div>
              <h4 className="font-display text-xl md:text-2xl text-forest">Maya Thompson</h4>
              <p className="text-sm text-muted mt-1">Aromatherapy Specialist</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 md:py-28 bg-forest text-white relative overflow-hidden">
        <div className="absolute -top-20 -right-20 w-96 h-96 rounded-full bg-gold/10 blur-3xl"></div>
        <div className="absolute -bottom-20 -left-20 w-96 h-96 rounded-full bg-sage/10 blur-3xl"></div>
        <div className="max-w-7xl mx-auto px-5 md:px-6 relative">
          <div className="text-center mb-12 md:mb-16">
            <span className="text-xs uppercase tracking-[0.3em] text-gold">Testimonials</span>
            <h2 className="font-display text-3xl md:text-5xl mt-4">Stories That Celebrate Inner Strength</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-5 md:gap-6">
            <div className="bg-white/5 backdrop-blur border border-white/10 rounded-3xl p-6 md:p-8">
              <div className="text-gold text-4xl font-display leading-none mb-4">"</div>
              <p className="text-white/85 leading-relaxed mb-8 text-sm md:text-base">
                The treatment helped me release years of tension. I feel lighter and more grounded.
              </p>
              <div className="flex items-center gap-3 pt-6 border-t border-white/10">
                <img
                  src="/assets/therapist-1.jpg"
                  alt="Michael Turner"
                  loading="lazy"
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div>
                  <p className="font-medium">Michael Turner</p>
                  <p className="text-xs text-white/60">Software Engineer</p>
                </div>
              </div>
            </div>
            <div className="bg-white/5 backdrop-blur border border-white/10 rounded-3xl p-6 md:p-8">
              <div className="text-gold text-4xl font-display leading-none mb-4">"</div>
              <p className="text-white/85 leading-relaxed mb-8 text-sm md:text-base">
                This place became my safe space to breathe and heal. It taught me to listen to my body.
              </p>
              <div className="flex items-center gap-3 pt-6 border-t border-white/10">
                <img
                  src="/assets/therapist-2.jpg"
                  alt="Hannah Weiss"
                  loading="lazy"
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div>
                  <p className="font-medium">Hannah Weiss</p>
                  <p className="text-xs text-white/60">Photographer</p>
                </div>
              </div>
            </div>
            <div className="bg-white/5 backdrop-blur border border-white/10 rounded-3xl p-6 md:p-8">
              <div className="text-gold text-4xl font-display leading-none mb-4">"</div>
              <p className="text-white/85 leading-relaxed mb-8 text-sm md:text-base">
                Each visit helps me reconnect and find the balance I've been searching for. Pure harmony.
              </p>
              <div className="flex items-center gap-3 pt-6 border-t border-white/10">
                <img
                  src="/assets/therapist-3.jpg"
                  alt="Natalia Cooper"
                  loading="lazy"
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div>
                  <p className="font-medium">Natalia Cooper</p>
                  <p className="text-xs text-white/60">Creative Director</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 md:py-28 bg-cream">
        <div className="max-w-4xl mx-auto px-5 md:px-6 text-center">
          <span className="text-xs uppercase tracking-[0.3em] text-gold">Ready?</span>
          <h2 className="font-display text-3xl md:text-5xl mt-4 mb-6 text-forest">Your sanctuary is waiting</h2>
          <p className="text-muted text-base md:text-lg mb-8 max-w-xl mx-auto">
            Take a moment for yourself. Book a session and step into pure relaxation.
          </p>
          <Link
            href="/booking"
            className="inline-flex items-center gap-2 bg-forest text-white px-8 py-4 rounded-full font-medium hover:bg-forest/90 transition"
          >
            Book Your Session <i className="fa-solid fa-arrow-right text-xs"></i>
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
