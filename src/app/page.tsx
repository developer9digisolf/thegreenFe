'use client'

import React, { useState, useEffect, useRef } from 'react'
import { 
  Menu, 
  X, 
  Award, 
  Palette, 
  Leaf,
  ArrowLeft, 
  ArrowRight, 
  ChevronRight, 
  Quote, 
  ExternalLink 
} from 'lucide-react'

export default function LandingPage() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  
  const ritualsRef = useRef<HTMLDivElement>(null)
  const galleryRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollSlider = (ref: React.RefObject<HTMLDivElement | null>, amount: number) => {
    if (ref.current) {
      ref.current.scrollBy({ left: amount, behavior: 'smooth' })
    }
  }

  const initDragToScroll = (ref: React.RefObject<HTMLDivElement | null>) => {
    if (!ref.current) return

    const slider = ref.current
    let isDown = false
    let startX: number
    let scrollLeft: number

    const onMouseDown = (e: MouseEvent) => {
      isDown = true
      slider.classList.add('active')
      startX = e.pageX - slider.offsetLeft
      scrollLeft = slider.scrollLeft
      slider.style.scrollSnapType = 'none'
      slider.style.cursor = 'grabbing'
    }

    const onMouseLeave = () => {
      isDown = false
      slider.style.cursor = 'grab'
      slider.style.scrollSnapType = 'x mandatory'
    }

    const onMouseUp = () => {
      isDown = false
      slider.style.cursor = 'grab'
      slider.style.scrollSnapType = 'x mandatory'
    }

    const onMouseMove = (e: MouseEvent) => {
      if (!isDown) return
      e.preventDefault()
      const x = e.pageX - slider.offsetLeft
      const walk = (x - startX) * 2
      slider.scrollLeft = scrollLeft - walk
    }

    slider.addEventListener('mousedown', onMouseDown)
    slider.addEventListener('mouseleave', onMouseLeave)
    slider.addEventListener('mouseup', onMouseUp)
    slider.addEventListener('mousemove', onMouseMove)

    return () => {
      slider.removeEventListener('mousedown', onMouseDown)
      slider.removeEventListener('mouseleave', onMouseLeave)
      slider.removeEventListener('mouseup', onMouseUp)
      slider.removeEventListener('mousemove', onMouseMove)
    }
  }

  useEffect(() => {
    const cleanupRituals = initDragToScroll(ritualsRef)
    const cleanupGallery = initDragToScroll(galleryRef)
    return () => {
      cleanupRituals?.()
      cleanupGallery?.()
    }
  }, [])

  const socialIcons = [
    {
      name: 'Instagram',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
      )
    },
    {
      name: 'Facebook',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
      )
    },
    {
      name: 'Youtube',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17"/><path d="m10 15 5-3-5-3z"/></svg>
      )
    }
  ]

  return (
    <div className="bg-white font-sans text-darker selection:bg-primary selection:text-white">
      
      {/* NAVIGATION */}
      <nav 
        className={`fixed top-0 w-full z-[100] transition-all duration-500 border-b ${
          scrolled 
            ? 'bg-white/95 backdrop-blur-2xl border-darker/5 shadow-sm' 
            : 'bg-white/80 backdrop-blur-md border-transparent'
        }`}
      >
        <div 
          className={`max-w-[1600px] mx-auto px-6 md:px-12 flex justify-between items-center transition-all duration-500 ${
            scrolled ? 'py-2 md:py-4' : 'py-4 md:py-6'
          }`}
        >
          <div className="flex items-center gap-4">
            <img src="/assets/logo.jpeg" alt="The Green SPA Logo" className="w-12 h-12 md:w-16 md:h-16 object-contain rounded-lg" />
            <div className="flex flex-col">
                <span className="text-xl md:text-2xl font-black text-dark tracking-tighter uppercase leading-none">The Green</span>
                <span className="text-xs md:text-sm font-bold text-secondary uppercase tracking-[0.2em]">Salon, Spa & Massage</span>
            </div>
          </div>
          
          {/* Desktop Links */}
          <div className="hidden lg:flex items-center gap-12 text-[10px] font-black uppercase tracking-[0.3em] text-darker/60">
            <a href="#" className="hover:text-primary transition-colors">Home</a>
            <a href="#about" className="hover:text-primary transition-colors">Experience</a>
            <a href="#services" className="hover:text-primary transition-colors">Rituals</a>
            <a href="#gallery" className="hover:text-primary transition-colors">Sanctuary</a>
            <a 
              href="#" 
              className="bg-darker text-white px-8 py-3 rounded-full hover:bg-primary transition-all shadow-xl shadow-darker/10"
            >
              Download App
            </a>
          </div>

          {/* Mobile Toggle */}
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
            className="lg:hidden w-12 h-12 bg-sand rounded-2xl flex items-center justify-center text-darker transition-transform active:scale-90"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        <div 
          className={`lg:hidden fixed inset-x-0 top-full bg-white/95 backdrop-blur-3xl border-b border-darker/5 p-8 shadow-2xl transition-all duration-500 ${
            isMobileMenuOpen ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4 pointer-events-none'
          }`}
        >
          <div className="flex flex-col gap-8 text-center text-sm font-black uppercase tracking-[0.4em] text-darker">
            <a href="#" onClick={() => setIsMobileMenuOpen(false)} className="py-2 border-b border-darker/5">Home</a>
            <a href="#about" onClick={() => setIsMobileMenuOpen(false)} className="py-2 border-b border-darker/5">Experience</a>
            <a href="#services" onClick={() => setIsMobileMenuOpen(false)} className="py-2 border-b border-darker/5">Rituals</a>
            <a href="#gallery" onClick={() => setIsMobileMenuOpen(false)} className="py-2 border-b border-darker/5">Sanctuary</a>
            <a href="#" className="bg-darker text-white py-5 rounded-2xl mt-4">Download App</a>
          </div>
        </div>
      </nav>

      {/* HERO SECTION */}
      <header className="relative min-h-screen flex items-center pt-48 md:pt-40 pb-32">
        <div className="absolute inset-0 z-0 bg-darker overflow-hidden" style={{ clipPath: 'polygon(0 0, 100% 0, 100% 85%, 0% 100%)' }}>
          <img 
            src="/assets/LT.1 RUANG LOBBY(1).jpg"
            className="absolute inset-0 w-full h-full object-cover animate-subtle-zoom" 
            alt="Hero"
          />
          <div className="absolute inset-0 bg-black/40 z-0"></div>
        </div>

        <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-20">
          <div className="max-w-4xl">
            <div className="inline-flex items-center gap-3 px-5 py-2.5 mb-8 md:mb-10 bg-dark text-white rounded-full border border-dark/20 animate-soft-float shadow-xl">
              <span className="w-2 h-2 bg-primary rounded-full animate-pulse"></span>
              <span className="text-[10px] font-black tracking-[0.3em] uppercase">Elite Wellness Experience</span>
            </div>
            <h1 className="text-5xl sm:text-6xl md:text-9xl lg:text-[11rem] font-black text-white leading-[0.8] tracking-tighter mb-8 md:mb-10 drop-shadow-[0_10px_10px_rgba(0,0,0,0.5)]">
              Breathe. <br/><span className="italic text-primary font-normal">Reborn.</span>
            </h1>
            <p className="text-base md:text-2xl text-white mb-8 md:mb-12 font-medium max-w-2xl leading-relaxed drop-shadow-md">
              Step into a world where time slows down. The Green SPA combines ancient healing rituals with modern
              digital ease. Experience serenity, redefined.
            </p>

            <div className="flex flex-col sm:flex-row gap-6 md:gap-8">
              <a 
                href="#services"
                className="bg-darker text-white px-10 py-5 rounded-full font-black uppercase tracking-widest text-xs hover:bg-primary transition-all shadow-2xl shadow-darker/20 text-center"
              >
                Explore Treatments
              </a>
              <div className="flex items-center gap-6">
                <div className="flex -space-x-4">
                  {[1, 2, 3].map((i) => (
                    <img 
                      key={i}
                      src={`https://i.pravatar.cc/100?u=${i}`} 
                      className="w-12 h-12 rounded-full border-4 border-sand"
                      alt={`User ${i}`}
                    />
                  ))}
                </div>
                <div className="text-xs font-black uppercase tracking-widest text-white/50">
                  <span className="text-primary">50k+</span> Happy Guests
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="hidden md:flex absolute bottom-24 left-6 md:left-12 flex-col items-center gap-6 z-30">
          <span className="text-[10px] font-black uppercase tracking-[0.4em] [writing-mode:vertical-lr] text-white/70">Scroll Experience</span>
          <div className="w-[1px] h-20 bg-gradient-to-b from-white/70 to-transparent"></div>
        </div>

        {/* Social Icons */}
        <div className="absolute right-6 md:right-12 top-1/2 -translate-y-1/2 z-30 hidden md:block">
          <div className="flex flex-col gap-6">
            {socialIcons.map((item, idx) => (
              <a 
                key={idx}
                href="#"
                className="w-14 h-14 flex items-center justify-center rounded-full border border-white/30 text-white hover:bg-primary hover:border-primary hover:text-darker transition-all shadow-2xl bg-white/10 backdrop-blur-md group"
                aria-label={item.name}
              >
                <span className="group-hover:scale-110 transition-transform">
                  {item.icon}
                </span>
              </a>
            ))}
          </div>
        </div>
      </header>

      {/* TRUST BAR */}
      <section className="py-12 bg-darker text-white">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
            {[
              { label: 'Years of Heritage', value: '25+' },
              { label: 'Asia Sanctuaries', value: '60+' },
              { label: 'Organic Botanicals', value: '100%' },
              { label: 'Guest Experience', value: '4.9' },
            ].map((item, idx) => (
              <div key={idx} className="text-center md:text-left">
                <p className="text-4xl md:text-5xl font-black text-primary mb-2">{item.value}</p>
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ABOUT SECTION */}
      <section className="py-16 md:py-32 bg-white overflow-hidden" id="about">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 md:gap-24 items-center">
            <div className="relative">
              <div className="absolute -top-10 md:-top-20 -left-10 md:-left-20 w-32 md:w-64 h-32 md:h-64 bg-sand rounded-full -z-10 opacity-50"></div>
              <div className="rounded-[2.5rem] md:rounded-[4rem] overflow-hidden shadow-2xl">
                <img 
                  src="/assets/Green_Spa.jpeg"
                  className="w-full aspect-square md:aspect-[4/5] object-cover" 
                  alt="Brand Identity"
                />
              </div>
              <div className="absolute -bottom-6 md:-bottom-10 -right-6 md:-right-10 bg-primary p-6 md:p-12 rounded-3xl md:rounded-[3rem] text-white hidden sm:block shadow-2xl max-w-xs md:max-w-none">
                <Quote className="w-8 h-8 md:w-12 md:h-12 mb-4 md:mb-6 opacity-50" />
                <p className="text-lg md:text-2xl font-serif italic leading-relaxed">
                  "True wellness is the harmony of body, mind, and the digital world."
                </p>
              </div>
            </div>
            <div>
              <h2 className="text-4xl md:text-7xl font-black text-darker tracking-tighter leading-[0.9] mb-8 md:mb-12">
                The Five <br/><span className="text-primary italic font-normal">Signatures.</span>
              </h2>
              <div className="space-y-8 md:space-y-10">
                {[
                  { icon: Award, title: 'Master Therapists', desc: 'Certified through rigorous training to ensure world-class touch.' },
                  { icon: Palette, title: 'Boutique Design', desc: 'Unique architectural masterpieces reflecting local heritage.' },
                  { icon: Leaf, title: "Nature's Alchemy", desc: '100% natural, ethically sourced ingredients in every ritual.' },
                ].map((feature, idx) => (
                  <div key={idx} className="flex gap-4 md:gap-6 group">
                    <div className="w-12 h-12 md:w-14 md:h-14 shrink-0 bg-sand rounded-xl md:rounded-2xl flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all duration-500">
                      <feature.icon className="w-5 h-5 md:w-6 md:h-6" />
                    </div>
                    <div>
                      <h4 className="text-lg md:text-xl font-black text-darker mb-1 md:mb-2 uppercase tracking-tighter">{feature.title}</h4>
                      <p className="text-sm md:text-base text-dark/60 leading-relaxed font-medium">{feature.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* RITUALS SECTION */}
      <section className="py-16 md:py-32 bg-sand/50" id="services">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="flex flex-col lg:flex-row justify-between items-start md:items-end gap-8 md:gap-10 mb-12 md:mb-24">
            <div className="max-w-2xl">
              <h2 className="text-4xl md:text-7xl font-black text-darker tracking-tighter leading-[0.9] mb-6 md:mb-8">
                Our Signature <br/><span className="text-primary italic font-normal">Rituals</span>
              </h2>
              <p className="text-lg md:text-xl text-dark/50 font-medium leading-relaxed">
                Meticulously curated treatments designed to restore balance.
              </p>
            </div>
            <div className="flex gap-4">
              <button 
                onClick={() => scrollSlider(ritualsRef, -400)}
                className="w-12 h-12 md:w-14 md:h-14 rounded-full border border-darker/10 flex items-center justify-center hover:bg-darker hover:text-white transition-all"
              >
                <ArrowLeft className="w-5 h-5 md:w-6 md:h-6" />
              </button>
              <button 
                onClick={() => scrollSlider(ritualsRef, 400)}
                className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-darker text-white flex items-center justify-center hover:bg-primary transition-all"
              >
                <ArrowRight className="w-5 h-5 md:w-6 md:h-6" />
              </button>
            </div>
          </div>

          <div 
            ref={ritualsRef}
            className="grid grid-flow-col md:grid-flow-row auto-cols-[85vw] md:auto-cols-auto md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-10 overflow-x-auto md:overflow-visible snap-x snap-mandatory scrollbar-hide pb-8 -mx-6 px-6 md:mx-auto md:px-0 touch-pan-x scroll-smooth cursor-grab md:cursor-default"
          >
            {[
              { title: 'Lava Stone Ritual', category: 'Mineral Care', time: '90 MINS', price: '$85', img: '/assets/KAMAR PIJAT VIP(2).jpg' },
              { title: 'Botanical Infusion', category: 'Organic Glow', time: '120 MINS', price: '$110', img: '/assets/LT.1 RUANG CUCI KAKI(1).jpg', offset: true },
              { title: 'Zen Frequency', category: 'Sound Healing', time: '60 MINS', price: '$65', img: '/assets/LT.1 RESEPSIONIS(1).jpg', offsetLg: true },
            ].map((ritual, idx) => (
              <div 
                key={idx} 
                className={`snap-center group cursor-pointer ${ritual.offset ? 'md:mt-12' : ''} ${ritual.offsetLg ? 'lg:mt-24' : ''}`}
              >
                <div className="h-[450px] md:h-[600px] rounded-[2.5rem] md:rounded-[3.5rem] overflow-hidden relative mb-6 md:mb-8 shadow-2xl transition-all duration-700 md:group-hover:-translate-y-4">
                  <img src={ritual.img} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" alt={ritual.title} />
                  <div className="absolute inset-0 bg-gradient-to-t from-darker/90 via-darker/20 to-transparent"></div>
                  <div className="absolute bottom-8 left-8 right-8 md:bottom-10 md:left-10 md:right-10 text-white">
                    <div className="flex justify-between items-end">
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] mb-2 text-primary">{ritual.category}</p>
                        <h3 className="text-2xl md:text-3xl font-black mb-2 md:mb-4 uppercase tracking-tighter leading-none">{ritual.title}</h3>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] md:text-sm font-black text-primary mb-1">{ritual.time}</p>
                        <p className="text-lg md:text-xl font-black">{ritual.price}</p>
                      </div>
                    </div>
                    <div className="mt-4 md:mt-6 pt-4 md:pt-6 border-t border-white/10 flex justify-between items-center opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-all duration-500 md:translate-y-4 md:group-hover:translate-y-0">
                      <span className="text-[10px] font-black uppercase tracking-widest">Book via App</span>
                      <ChevronRight className="w-4 h-4 md:w-5 md:h-5" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-20 text-center">
            <a href="#" className="inline-flex items-center gap-4 text-darker font-black uppercase tracking-widest group">
              View Full Menu 
              <span className="w-12 h-12 rounded-full border border-darker/10 flex items-center justify-center group-hover:bg-primary group-hover:text-white group-hover:border-primary transition-all">
                <ArrowRight className="w-5 h-5" />
              </span>
            </a>
          </div>
        </div>
      </section>

      {/* PACKAGES SECTION */}
      <section className="py-16 md:py-32 bg-darker text-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 md:gap-24 items-center">
            <div className="order-2 lg:order-1">
              <h2 className="text-4xl md:text-8xl font-black tracking-tighter leading-[0.85] mb-8 md:mb-12 uppercase">
                Curated <br/><span className="text-primary italic font-normal">Escape.</span>
              </h2>
              <p className="text-lg md:text-xl text-gray-400 mb-8 md:mb-12 font-medium leading-relaxed">
                Our signature packages are designed for those who seek a comprehensive wellness journey.
              </p>

              <div className="space-y-4 md:space-y-6">
                {[
                  { title: 'Dream Journey', price: '$145', desc: 'Floral Foot Fit + Aromatherapy Massage + Herbal Compress + Body Scrub.', time: '180 Mins', badge: 'Most Popular' },
                  { title: 'Heaven & Earth', price: '$120', desc: 'Body Scrub + Aromatherapy Oil Massage + Facial Ritual.', time: '150 Mins', badge: 'Rejuvenating' },
                ].map((pkg, idx) => (
                  <div key={idx} className="p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] bg-white/5 border border-white/10 hover:bg-white/10 transition-all cursor-pointer group">
                    <div className="flex justify-between items-start mb-2 md:mb-4">
                      <h4 className="text-xl md:text-2xl font-black uppercase tracking-tighter">{pkg.title}</h4>
                      <p className="text-primary font-black">{pkg.price}</p>
                    </div>
                    <p className="text-sm md:text-base text-gray-500 mb-4 md:mb-6 font-medium">{pkg.desc}</p>
                    <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-[0.3em] text-primary">
                      <span>{pkg.time}</span>
                      <span className="w-1 h-1 bg-gray-700 rounded-full"></span>
                      <span>{pkg.badge}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative order-1 lg:order-2">
              <div className="aspect-square rounded-[3rem] md:rounded-[5rem] overflow-hidden rotate-2 lg:rotate-3 shadow-2xl border-4 md:border-8 border-white/5">
                <img 
                  src="/assets/LT.1 RUANG BUFFET(1).jpg" 
                  className="w-full h-full object-cover" 
                  alt="Package" 
                />
              </div>
              <div className="absolute -top-6 -right-6 md:-top-10 md:-right-10 w-32 md:w-48 h-32 md:h-48 bg-primary rounded-full flex items-center justify-center text-center p-4 md:p-6 -rotate-12 shadow-2xl animate-soft-float">
                <p className="text-[10px] md:text-xs font-black uppercase tracking-widest leading-tight">Save 20% on App Bookings</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* GALLERY SECTION */}
      <section className="py-16 md:py-32 bg-white" id="gallery">
        <div className="max-w-7xl mx-auto px-6 md:px-12 flex flex-col md:flex-row justify-between items-start md:items-end gap-8 mb-12 md:mb-24 text-center md:text-left">
          <div className="max-w-2xl">
            <h2 className="text-4xl md:text-7xl font-black text-darker tracking-tighter leading-none mb-6 md:mb-8">
              Atmosphere of <span className="text-primary italic font-normal">Zen.</span>
            </h2>
            <p className="text-lg md:text-xl text-dark/50 font-medium mx-auto md:mx-0">Every detail is crafted for your peace.</p>
          </div>
          <div className="flex gap-4 mx-auto md:mx-0">
            <button 
              onClick={() => scrollSlider(galleryRef, -400)}
              className="w-12 h-12 md:w-14 md:h-14 rounded-full border border-darker/10 flex items-center justify-center hover:bg-darker hover:text-white transition-all"
            >
              <ArrowLeft className="w-5 h-5 md:w-6 md:h-6" />
            </button>
            <button 
              onClick={() => scrollSlider(galleryRef, 400)}
              className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-darker text-white flex items-center justify-center hover:bg-primary transition-all"
            >
              <ArrowRight className="w-5 h-5 md:w-6 md:h-6" />
            </button>
          </div>
        </div>

        <div className="px-6 md:px-12">
          <div 
            ref={galleryRef}
            className="grid grid-flow-col md:grid-flow-row auto-cols-[75vw] md:auto-cols-auto md:grid-cols-4 gap-6 md:gap-8 max-w-[1600px] mx-auto overflow-x-auto md:overflow-visible snap-x snap-mandatory scrollbar-hide pb-8 -mx-6 px-6 md:mx-auto md:px-0 touch-pan-x scroll-smooth cursor-grab md:cursor-default"
          >
            {/* Column 1 */}
            <div className="snap-center space-y-4 md:space-y-8">
                <div className="rounded-3xl md:rounded-[3rem] overflow-hidden shadow-xl h-64 md:h-80">
                    <img src="/assets/LT.1 RUANG LOBBY(1).jpg" className="w-full h-full object-cover hover:scale-110 transition-transform duration-700" alt="G1" />
                </div>
                <div className="rounded-3xl md:rounded-[3rem] overflow-hidden shadow-xl h-64 md:h-[450px]">
                    <img src="/assets/LT.2 KORIDOR(1).jpg" className="w-full h-full object-cover hover:scale-110 transition-transform duration-700" alt="G2" />
                </div>
            </div>
            {/* Column 2 */}
            <div className="snap-center space-y-4 md:space-y-8 md:pt-24">
                <div className="rounded-3xl md:rounded-[3rem] overflow-hidden shadow-xl h-64 md:h-[500px] bg-sand">
                    <img src="/assets/LT.1 RESEPSIONIS(2).jpg" className="w-full h-full object-cover hover:scale-110 transition-transform duration-700" alt="G3" />
                </div>
                <div className="rounded-3xl md:rounded-[3rem] overflow-hidden shadow-xl h-48 md:h-64 bg-sand">
                    <img src="/assets/LT.1 RUANG BUFFET(2).jpg" className="w-full h-full object-cover hover:scale-110 transition-transform duration-700" alt="G4" />
                </div>
            </div>
            {/* Column 3 */}
            <div className="snap-center space-y-4 md:space-y-8">
                <div className="rounded-3xl md:rounded-[3rem] overflow-hidden shadow-xl h-64 md:h-[400px] bg-sand">
                    <img src="/assets/LT.1 TOILET UMUM PRIA(1).jpg" className="w-full h-full object-cover hover:scale-110 transition-transform duration-700" alt="G5" />
                </div>
                <div className="rounded-3xl md:rounded-[3rem] overflow-hidden shadow-xl h-64 md:h-[350px] bg-sand">
                    <img src="/assets/EXTERIOR DEPAN(2).png" className="w-full h-full object-cover hover:scale-110 transition-transform duration-700" alt="G6" />
                </div>
            </div>
            {/* Column 4 */}
            <div className="snap-center space-y-4 md:space-y-8 md:pt-12">
                <div className="rounded-3xl md:rounded-[3rem] overflow-hidden shadow-xl h-48 md:h-72 bg-sand">
                    <img src="/assets/KAMAR PIJAT VIP(3).jpg" className="w-full h-full object-cover hover:scale-110 transition-transform duration-700" alt="G7" />
                </div>
                <div className="rounded-3xl md:rounded-[3rem] overflow-hidden shadow-xl h-64 md:h-[520px] bg-sand">
                    <img src="/assets/LT.1 FOYER KORIDOR(1).jpg" className="w-full h-full object-cover hover:scale-110 transition-transform duration-700" alt="G8" />
                </div>
            </div>
          </div>
        </div>
      </section>

      {/* LOCATIONS SECTION */}
      <section className="py-16 md:py-32 bg-sand">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 md:gap-12 mb-12 md:mb-20">
            <h2 className="text-4xl md:text-7xl font-black text-darker tracking-tighter leading-none">
              Find Your <br/><span className="text-primary italic font-normal">Sanctuary.</span>
            </h2>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 md:gap-6">
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-darker/40">Select Region</span>
              <div className="flex gap-2">
                <button className="px-5 py-2.5 md:px-6 md:py-3 bg-white rounded-full text-[10px] font-black uppercase tracking-widest text-darker shadow-sm border border-gray-100">Bali</button>
                <button className="px-5 py-2.5 md:px-6 md:py-3 bg-darker rounded-full text-[10px] font-black uppercase tracking-widest text-white shadow-xl">Jakarta</button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            {[
              { name: 'The Green - Pekanbaru', addr: 'Jl. Riau No. 123, Pekanbaru', img: '/assets/EXTERIOR DEPAN(4).png' },
              { name: 'The Green - Ubud', addr: 'Jalan Monkey Forest, Bali 80571', img: '/assets/EXTERIOR DEPAN(2).png' },
              { name: 'The Green - Jimbaran', addr: 'Jalan Bukit Permai, Bali 80361', img: '/assets/EXTERIOR DEPAN(3).png' },
            ].map((loc, idx) => (
              <div key={idx} className="bg-white rounded-[2.5rem] md:rounded-[3rem] overflow-hidden shadow-xl hover:shadow-2xl transition-all group">
                <div className="h-48 md:h-64 overflow-hidden">
                  <img src={loc.img} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={loc.name} />
                </div>
                <div className="p-8 md:p-10">
                  <h4 className="text-xl md:text-2xl font-black uppercase tracking-tighter mb-2 md:mb-4">{loc.name}</h4>
                  <p className="text-sm md:text-base text-dark/50 mb-6 md:mb-8 font-medium">{loc.addr}</p>
                  <a href="#" className="inline-flex items-center gap-3 text-primary font-black uppercase tracking-widest text-[10px]">
                    View Details <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* NEWSLETTER / CTA */}
      <section className="py-16 md:py-32 bg-dark text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
            <img src="/assets/EXTERIOR DEPAN(3).png" className="w-full h-full object-cover" alt="Background" />
        </div>
        <div className="max-w-7xl mx-auto px-6 md:px-12 text-center relative z-10">
            <h2 className="text-4xl md:text-8xl font-black tracking-tighter leading-none mb-8 md:mb-12 uppercase">Begin Your <br/><span className="text-primary italic">Journey.</span></h2>
            <p className="text-lg md:text-2xl text-white/70 mb-12 md:mb-20 font-medium max-w-3xl mx-auto">Join our inner
                circle for exclusive wellness rituals and sanctuary updates.</p>

            <form className="max-w-2xl mx-auto flex flex-col md:flex-row gap-4">
                <input type="email" placeholder="YOUR EMAIL ADDRESS"
                    className="flex-1 bg-white/5 border border-white/10 rounded-full px-8 py-5 text-xs font-black uppercase tracking-widest placeholder:text-white/40 focus:outline-none focus:bg-white/10 transition-all" />
                <button
                    className="bg-primary text-darker px-10 py-5 rounded-full font-black uppercase tracking-widest text-xs hover:bg-white hover:text-dark transition-all">Subscribe</button>
            </form>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-16 md:py-24 bg-white border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 md:gap-16 mb-16 md:mb-24">
            <div className="lg:col-span-1">
              <div className="flex items-center gap-4 mb-8">
                <img src="/assets/logo.jpeg" alt="Logo" className="w-10 h-10 object-contain rounded-lg" />
                <div className="flex flex-col">
                    <span className="text-xl font-black text-darker tracking-tighter uppercase leading-none">The Green</span>
                    <span className="text-[10px] font-bold text-secondary uppercase tracking-[0.1em]">Salon, Spa & Massage</span>
                </div>
              </div>
              <p className="text-sm text-dark/50 font-medium leading-relaxed mb-8">Redefining modern wellness through ancient wisdom and digital seamlessness.</p>
              <div className="flex gap-4">
                {socialIcons.map((item, idx) => (
                  <a key={idx} href="#" className="text-dark/30 hover:text-primary transition-colors" aria-label={item.name}>
                    <span className="w-5 h-5">{item.icon}</span>
                  </a>
                ))}
              </div>
            </div>
            <div>
              <h4 className="text-xs font-black uppercase tracking-[0.3em] text-darker mb-8">Sanctuaries</h4>
              <ul className="space-y-4 text-sm text-dark/50 font-medium">
                {['Seminyak, Bali', 'Ubud, Bali', 'Jimbaran, Bali', 'Jakarta Central'].map(item => (
                  <li key={item}><a href="#" className="hover:text-primary transition-colors">{item}</a></li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-xs font-black uppercase tracking-[0.3em] text-darker mb-8">Rituals</h4>
              <ul className="space-y-4 text-sm text-dark/50 font-medium">
                {['Massage Therapy', 'Body Treatments', 'Facial Rituals', 'Signature Packages'].map(item => (
                  <li key={item}><a href="#" className="hover:text-primary transition-colors">{item}</a></li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-xs font-black uppercase tracking-[0.3em] text-darker mb-8">Contact</h4>
              <ul className="space-y-4 text-sm text-dark/50 font-medium">
                <li>hello@thegreenspa.com</li>
                <li>+62 361 123 4567</li>
                <li>App Support 24/7</li>
              </ul>
            </div>
          </div>
          <div className="pt-12 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center gap-6 text-[10px] font-black uppercase tracking-[0.3em] text-dark/30">
            <p>© 2024 The Green SPA. All Rights Reserved.</p>
            <div className="flex gap-8">
              <a href="#" className="hover:text-darker transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-darker transition-colors">Terms of Service</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
