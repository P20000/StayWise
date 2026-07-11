import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { Star, ArrowUpRight, MapPin, AlertCircle } from 'lucide-react';
import api from '../../services/api';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export const FeaturedHotels = () => {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const sectionRef = useRef(null);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const response = await api.get('/rooms?limit=3');
        const data = response.data.data || [];
        const sorted = [...data].sort((a, b) => b.rating - a.rating).slice(0, 3);
        setRooms(sorted);
      } catch (err) {
        setError('[FEATURED_ERROR] Could not resolve signature collection.');
      } finally {
        setLoading(false);
      }
    };
    fetchFeatured();
  }, []);

  // Trigger animations once rooms are loaded
  useEffect(() => {
    if (loading) return;

    const ctx = gsap.context(() => {
      const header = document.querySelector('.featured-header');
      const cards = document.querySelectorAll('.featured-card');

      if (header) {
        gsap.fromTo(
          header,
          { opacity: 0, y: 40 },
          {
            opacity: 1, y: 0, duration: 0.9, ease: 'power3.out',
            scrollTrigger: { trigger: header, start: 'top 85%' },
          }
        );
      }
      
      if (cards.length > 0) {
        gsap.fromTo(
          cards,
          { opacity: 0, y: 60 },
          {
            opacity: 1, y: 0, duration: 0.8, ease: 'power2.out',
            stagger: 0.18,
            scrollTrigger: { trigger: cards[0], start: 'top 88%' },
          }
        );
      }
    }, sectionRef);

    return () => ctx.revert();
  }, [loading]);

  return (
    <section ref={sectionRef} className="w-full bg-[#212121] py-20 px-4 sm:px-6 lg:px-8 select-none">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="featured-header opacity-0 flex flex-col sm:flex-row sm:items-end justify-between mb-12 gap-4">
          <div>
            <Badge variant="highlight" className="mb-3">Showcase Collection</Badge>
            <h2 className="font-mono text-2xl sm:text-4xl font-bold uppercase tracking-tight text-[#F1EDEA]">
              FEATURED SPACES
            </h2>
          </div>
          <Link to="/explore">
            <Button variant="outline" size="md" className="!bg-transparent !text-[#F1EDEA] !border-white/30 hover:!bg-white/10 !shadow-[4px_4px_0px_#F1EDEA] hover:!shadow-[2px_2px_0px_#F1EDEA]">
              <span>Explore All Spaces</span>
              <ArrowUpRight size={16} />
            </Button>
          </Link>
        </div>

        {error && (
          <div className="bg-[#C84B31] text-white border-2 border-[#F1EDEA]/20 p-4 font-mono text-xs font-bold mb-8">
            {error.toUpperCase()}
          </div>
        )}

        {/* Grid */}
        {loading ? (
          <div className="font-mono text-xs text-center py-12 uppercase text-[#F1EDEA]/40">
            Loading featured stays...
          </div>
        ) : rooms.length === 0 ? (
          <div className="border-2 border-dashed border-[#F1EDEA]/20 p-12 text-center space-y-4">
            <div className="font-mono text-sm font-bold text-[#F1EDEA] flex items-center justify-center gap-2">
              <AlertCircle size={16} className="text-[#C84B31]" />
              <span>[ NO FEATURED STAYS AVAILABLE ]</span>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {rooms.map((suite) => (
              <Card
                key={suite._id || suite.id}
                hoverEffect
                className="featured-card opacity-0 flex flex-col justify-between p-0 bg-white border-[#212121]"
              >
                <div>
                  <div className="relative w-full h-56 overflow-hidden bg-[#0a0a0a] border-b-2 border-[#212121]">
                    <img
                      src={suite.images?.[0]?.url || suite.images?.[0] || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80'}
                      alt={suite.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 left-3">
                      <Badge variant="ai">{suite.architecturalStyle}</Badge>
                    </div>
                  </div>

                  <div className="p-5">
                    <div className="flex items-center gap-1.5 font-mono text-xs uppercase text-[#C84B31] font-bold mb-1">
                      <MapPin size={14} />
                      <span>{suite.location}</span>
                    </div>
                    <h3 className="font-mono text-lg font-bold text-[#212121] tracking-wide mb-3">
                      {suite.title}
                    </h3>
                  </div>
                </div>

                <div className="px-5 pb-5 pt-3 border-t-2 border-[#212121] flex items-center justify-between">
                  <span className="font-mono text-xs text-[#494440] uppercase tracking-widest font-semibold">
                    [ BESPOKE HOSTED SPACE ]
                  </span>
                  <Link to={`/room/${suite.slug}`}>
                    <Button variant="primary" size="sm" className="font-bold flex items-center gap-1">
                      <span>EXPLORE SPACE</span>
                      <ArrowUpRight size={14} />
                    </Button>
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default FeaturedHotels;
