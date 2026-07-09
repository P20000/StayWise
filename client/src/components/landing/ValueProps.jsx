import React, { useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { Sparkles, Compass, ShieldCheck, ArrowUpRight, DollarSign, BarChart3 } from 'lucide-react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export const ValueProps = () => {
  const containerRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.value-header',
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 0.9,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: '.value-header',
            start: 'top 85%',
          },
        }
      );

      gsap.fromTo(
        '.value-card-guest',
        { opacity: 0, x: -50 },
        {
          opacity: 1,
          x: 0,
          duration: 0.8,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: '.value-card-guest',
            start: 'top 80%',
          },
        }
      );

      gsap.fromTo(
        '.value-card-host',
        { opacity: 0, x: 50 },
        {
          opacity: 1,
          x: 0,
          duration: 0.8,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: '.value-card-host',
            start: 'top 80%',
          },
        }
      );
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={containerRef} className="w-full bg-[#F1EDEA] py-24 px-4 sm:px-6 lg:px-8 select-none border-t-2 border-[#212121]">
      <div className="max-w-7xl mx-auto">
        {/* Section Title */}
        <div className="value-header opacity-0 text-center mb-16">
          <Badge variant="terracotta" className="mb-4">
            <Sparkles size={12} />
            <span>The StayWise Concept</span>
          </Badge>
          <h2 className="font-mono text-3xl sm:text-5xl font-bold uppercase tracking-tight text-[#212121] mb-4">
            TWO SIDES. ONE DESIGN PHILOSOPHY.
          </h2>
          <p className="font-sans text-sm sm:text-base text-[#212121]/70 max-w-2xl mx-auto leading-relaxed">
            Whether you are looking to escape to an architectural masterpiece or wanting to list your own bespoke space, StayWise connects you directly.
          </p>
        </div>

        {/* Guest & Vendor Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Guest Block */}
          <div className="value-card-guest opacity-0 bg-white border-2 border-[#212121] shadow-[6px_6px_0px_#212121] p-8 flex flex-col justify-between">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs uppercase tracking-widest bg-[#212121] text-[#F1EDEA] px-3 py-1 font-bold">
                  [ FOR GUESTS ]
                </span>
                <Compass size={28} className="text-[#C84B31]" />
              </div>
              <h3 className="font-mono text-2xl sm:text-3xl font-bold uppercase text-[#212121]">
                Immersive Living Spaces
              </h3>
              <p className="font-sans text-sm text-[#212121]/75 leading-relaxed">
                Step outside the standard hotel box. StayWise brings you high-fidelity design stays—brutalist concrete sanctuaries, minimalist desert escapes, and retrofitted industrial lofts.
              </p>
              
              <div className="space-y-4 pt-4 border-t border-[#212121]/10">
                <div className="flex items-start gap-3">
                  <div className="bg-[#C84B31]/10 p-1 border border-[#C84B31]/25 mt-0.5">
                    <Sparkles size={14} className="text-[#C84B31]" />
                  </div>
                  <div>
                    <h4 className="font-mono text-xs uppercase font-bold text-[#212121]">Curated Design Standards</h4>
                    <p className="font-sans text-xs text-[#212121]/60 mt-0.5">Every space is vetted to ensure it meets our strict design and style criteria.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="bg-[#C84B31]/10 p-1 border border-[#C84B31]/25 mt-0.5">
                    <ShieldCheck size={14} className="text-[#C84B31]" />
                  </div>
                  <div>
                    <h4 className="font-mono text-xs uppercase font-bold text-[#212121]">Verified Hosts</h4>
                    <p className="font-sans text-xs text-[#212121]/60 mt-0.5">Direct communication with hosts who share your passion for design-forward living.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-8">
              <Link to="/explore">
                <Button variant="primary" className="w-full flex justify-center items-center gap-2">
                  <span>Explore Spaces</span>
                  <ArrowUpRight size={16} />
                </Button>
              </Link>
            </div>
          </div>

          {/* Host/Vendor Block */}
          <div className="value-card-host opacity-0 bg-white border-2 border-[#212121] shadow-[6px_6px_0px_#C84B31] p-8 flex flex-col justify-between">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs uppercase tracking-widest bg-[#C84B31] text-white px-3 py-1 font-bold">
                  [ FOR HOSTS & VENDORS ]
                </span>
                <DollarSign size={28} className="text-[#212121]" />
              </div>
              <h3 className="font-mono text-2xl sm:text-3xl font-bold uppercase text-[#212121]">
                Monetize Design Masterpieces
              </h3>
              <p className="font-sans text-sm text-[#212121]/75 leading-relaxed">
                Connect with travelers who appreciate concrete details, spatial volume, and clean lines. Show off your design-forward properties and receive premium rates for architectural distinction.
              </p>

              <div className="space-y-4 pt-4 border-t border-[#212121]/10">
                <div className="flex items-start gap-3">
                  <div className="bg-[#212121]/5 p-1 border border-[#212121]/20 mt-0.5">
                    <BarChart3 size={14} className="text-[#212121]" />
                  </div>
                  <div>
                    <h4 className="font-mono text-xs uppercase font-bold text-[#212121]">Centralized Dashboard</h4>
                    <p className="font-sans text-xs text-[#212121]/60 mt-0.5">Easily list your places, track guest booking status, and modify room details on the fly.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="bg-[#212121]/5 p-1 border border-[#212121]/20 mt-0.5">
                    <ShieldCheck size={14} className="text-[#212121]" />
                  </div>
                  <div>
                    <h4 className="font-mono text-xs uppercase font-bold text-[#212121]">Zero Platform Dilution</h4>
                    <p className="font-sans text-xs text-[#212121]/60 mt-0.5">We cater exclusively to design enthusiasts, ensuring your listings remain high-value.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-8">
              <Link to="/auth?mode=register&role=Vendor">
                <Button variant="secondary" className="w-full flex justify-center items-center gap-2">
                  <span>List Your Space</span>
                  <ArrowUpRight size={16} />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ValueProps;
