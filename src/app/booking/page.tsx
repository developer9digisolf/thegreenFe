"use client";

import { useState } from "react";
import Link from "next/link";
import Header from "@/components/landing/Header";
import Footer from "@/components/landing/Footer";
import { useReveal } from "@/hooks/useReveal";

export default function BookingPage() {
  useReveal();
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="overflow-x-hidden">
      <Header />

      {/* Hero Section */}
      <section className="relative min-h-[50svh] flex items-center pt-32 overflow-hidden">
        <img
          src="/assets/spa-booking.jpg"
          alt="Book Appointment"
          className="absolute inset-0 w-full h-full object-cover animate-slow-zoom"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-forest/80 via-forest/40 to-forest/90"></div>
        <div className="relative max-w-7xl mx-auto px-5 md:px-6 w-full text-white text-center">
          <span className="text-xs uppercase tracking-[0.3em] text-gold mb-5 block">Reservation</span>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-display mb-6">
            Book your <br />
            <em className="text-gold not-italic">sanctuary</em> moment
          </h1>
        </div>
      </section>

      <div className="bg-cream min-h-screen">
        <section className="py-12 md:py-20">
          <div className="max-w-6xl mx-auto px-5 md:px-6">
            {/* Step Indicator */}
            <div className="flex items-center justify-center gap-4 md:gap-10 mb-16 reveal">
              <div className="flex flex-col items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold shadow-soft transition-colors ${
                    !isSubmitted ? "bg-forest text-white" : "bg-white border border-line text-muted"
                  }`}
                >
                  1
                </div>
                <span
                  className={`text-[10px] uppercase tracking-widest font-bold ${
                    !isSubmitted ? "text-forest" : "text-muted"
                  }`}
                >
                  Selection
                </span>
              </div>
              <div className="w-12 h-px bg-line"></div>
              <div className="flex flex-col items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-colors ${
                    !isSubmitted ? "bg-white border border-line text-muted" : "bg-forest text-white"
                  }`}
                >
                  2
                </div>
                <span className={`text-[10px] uppercase tracking-widest ${!isSubmitted ? "text-muted" : "text-forest font-bold"}`}>
                  Details
                </span>
              </div>
              <div className="w-12 h-px bg-line"></div>
              <div className="flex flex-col items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white border border-line text-muted flex items-center justify-center font-bold">
                  3
                </div>
                <span className="text-[10px] uppercase tracking-widest text-muted">Confirm</span>
              </div>
            </div>

            <div className="grid lg:grid-cols-[1fr_400px] gap-10 items-start">
              <div className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-lift reveal">
                {isSubmitted ? (
                  <div id="success" className="text-center py-12">
                    <div className="w-20 h-20 mx-auto rounded-full bg-cream flex items-center justify-center text-forest mb-8">
                      <i className="fa-solid fa-check text-3xl text-gold"></i>
                    </div>
                    <h2 className="font-display text-4xl text-forest mb-4">Awaiting your arrival</h2>
                    <p className="text-muted max-w-md mx-auto mb-10 text-lg">
                      Your ritual has been scheduled. A confirmation has been sent to your digital sanctuary (email).
                    </p>
                    <button
                      onClick={() => setIsSubmitted(false)}
                      className="bg-forest text-white px-8 py-4 rounded-full font-medium hover:bg-forest/90 transition"
                    >
                      Make another booking
                    </button>
                  </div>
                ) : (
                  <form id="book-form" onSubmit={handleSubmit} className="space-y-10">
                    <div className="space-y-6">
                      <div className="flex items-center gap-4 mb-2">
                        <span className="w-8 h-8 rounded-full bg-cream text-gold flex items-center justify-center text-sm font-bold">
                          1
                        </span>
                        <h3 className="font-display text-2xl text-forest">Choose Your Ritual</h3>
                      </div>
                      <div className="grid gap-4">
                        <label className="block relative group">
                          <i className="fa-solid fa-spa absolute left-5 top-1/2 -translate-y-1/2 text-gold opacity-50 group-focus-within:opacity-100 transition-opacity"></i>
                          <select
                            required
                            className="w-full border border-line bg-bg rounded-2xl pl-12 pr-5 py-4 text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-gold/20 transition-all cursor-pointer"
                          >
                            <option value="" disabled selected>
                              Select treatment
                            </option>
                            <option>Full-Body Healing Journey — 120 min ($280)</option>
                            <option>Relaxation Massage — 90 min ($120)</option>
                            <option>Facial Glow — 60 min ($95)</option>
                            <option>Aromatherapy — 75 min ($110)</option>
                            <option>Herbal Wrap — 90 min ($135)</option>
                            <option>Hot Stone Healing — 80 min ($130)</option>
                          </select>
                          <i className="fa-solid fa-chevron-down absolute right-5 top-1/2 -translate-y-1/2 text-muted pointer-events-none text-xs"></i>
                        </label>
                        <div className="grid sm:grid-cols-2 gap-4">
                          <label className="relative group">
                            <i className="fa-solid fa-calendar-day absolute left-5 top-1/2 -translate-y-1/2 text-gold opacity-50 group-focus-within:opacity-100 transition-opacity"></i>
                            <input
                              required
                              type="date"
                              className="w-full border border-line bg-bg rounded-2xl pl-12 pr-5 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-gold/20 transition-all"
                            />
                          </label>
                          <label className="relative group">
                            <i className="fa-solid fa-clock absolute left-5 top-1/2 -translate-y-1/2 text-gold opacity-50 group-focus-within:opacity-100 transition-opacity"></i>
                            <select
                              required
                              className="w-full border border-line bg-bg rounded-2xl pl-12 pr-10 py-4 text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-gold/20 transition-all cursor-pointer"
                            >
                              <option value="" disabled selected>
                                Time
                              </option>
                              <option>09:00 AM</option>
                              <option>11:00 AM</option>
                              <option>01:00 PM</option>
                              <option>03:00 PM</option>
                              <option>05:00 PM</option>
                              <option>07:00 PM</option>
                            </select>
                            <i className="fa-solid fa-chevron-down absolute right-5 top-1/2 -translate-y-1/2 text-muted pointer-events-none text-xs"></i>
                          </label>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div className="flex items-center gap-4 mb-2">
                        <span className="w-8 h-8 rounded-full bg-cream text-gold flex items-center justify-center text-sm font-bold">
                          2
                        </span>
                        <h3 className="font-display text-2xl text-forest">Personal Information</h3>
                      </div>
                      <div className="grid sm:grid-cols-2 gap-4">
                        <input
                          required
                          type="text"
                          placeholder="First Name"
                          className="w-full border border-line bg-bg rounded-2xl px-6 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-gold/20 transition-all"
                        />
                        <input
                          required
                          type="text"
                          placeholder="Last Name"
                          className="w-full border border-line bg-bg rounded-2xl px-6 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-gold/20 transition-all"
                        />
                        <input
                          required
                          type="email"
                          placeholder="Email Address"
                          className="w-full border border-line bg-bg rounded-2xl px-6 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-gold/20 transition-all"
                        />
                        <input
                          required
                          type="tel"
                          placeholder="Phone Number"
                          className="w-full border border-line bg-bg rounded-2xl px-6 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-gold/20 transition-all"
                        />
                      </div>
                      <textarea
                        rows={4}
                        placeholder="Any special requests or health considerations?"
                        className="w-full border border-line bg-bg rounded-2xl px-6 py-4 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-gold/20 transition-all"
                      ></textarea>
                    </div>

                    <button
                      type="submit"
                      className="w-full bg-forest text-white py-5 rounded-2xl font-bold tracking-widest uppercase text-sm hover:bg-forest/90 transition-all shadow-lift transform hover:-translate-y-1"
                    >
                      Complete Reservation
                    </button>
                  </form>
                )}
              </div>

              {/* Contact Sidebar */}
              <div className="space-y-8 reveal" style={{ transitionDelay: "0.2s" }}>
                <div className="bg-forest text-white rounded-[2.5rem] p-10 relative overflow-hidden">
                  <img src="/assets/spa-booking.jpg" alt="" className="absolute inset-0 w-full h-full object-cover opacity-10" />
                  <div className="relative z-10">
                    <h3 className="font-display text-3xl mb-6">Need assistance?</h3>
                    <p className="text-white/70 text-sm mb-8 leading-relaxed">
                      Our concierge team is available from 9AM to 9PM for specialized requests.
                    </p>
                    <div className="space-y-4">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-gold">
                          <i className="fa-solid fa-phone-volume text-sm"></i>
                        </div>
                        <p className="text-sm font-medium">+62 812 3456 7890</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-gold">
                          <i className="fa-solid fa-envelope text-sm"></i>
                        </div>
                        <p className="text-sm font-medium">hello@thegreen.com</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white border border-line rounded-[2.5rem] p-10">
                  <h4 className="font-display text-xl text-forest mb-4">Our Policy</h4>
                  <ul className="space-y-3 text-sm text-muted">
                    <li className="flex gap-3">
                      <i className="fa-solid fa-circle-check text-gold mt-1"></i> Free cancellation 24h before
                    </li>
                    <li className="flex gap-3">
                      <i className="fa-solid fa-circle-check text-gold mt-1"></i> Arrive 15 mins early
                    </li>
                    <li className="flex gap-3">
                      <i className="fa-solid fa-circle-check text-gold mt-1"></i> Private treatment rooms
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      <Footer />
    </div>
  );
}
