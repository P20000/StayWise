import React from 'react';
import { Link } from 'react-router-dom';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { Star, ArrowUpRight, MapPin } from 'lucide-react';

const FEATURED_SUITES = [
  {
    id: 'suite-1',
    title: 'THE CONCRETE PENTHOUSE',
    location: 'Shibuya, Tokyo',
    price: 450,
    rating: 4.98,
    reviewsCount: 124,
    architecturalTag: 'Board-Formed Concrete',
    image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80',
    slug: 'concrete-penthouse-shibuya',
  },
  {
    id: 'suite-2',
    title: 'BRASS & GLASS ATELIER',
    location: 'Mitte, Berlin',
    price: 320,
    rating: 4.95,
    reviewsCount: 89,
    architecturalTag: 'Industrial Modernist',
    image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80',
    slug: 'brass-glass-atelier-berlin',
  },
  {
    id: 'suite-3',
    title: 'TERRACOTTA CLIFF VILLA',
    location: 'Amalfi Coast, Italy',
    price: 680,
    rating: 4.99,
    reviewsCount: 210,
    architecturalTag: 'Raw Terracotta & Stone',
    image: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=800&q=80',
    slug: 'terracotta-cliff-villa-amalfi',
  },
];

export const FeaturedHotels = () => {
  return (
    <section className="w-full bg-[#F1EDEA] py-16 px-4 sm:px-6 lg:px-8 select-none">
      <div className="max-w-7xl mx-auto">
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4 border-b-2 border-[#212121] pb-6">
          <div>
            <Badge variant="default" className="mb-3">
              [ SIGNATURE COLLECTION ]
            </Badge>
            <h2 className="font-mono text-2xl sm:text-4xl font-bold uppercase tracking-tight text-[#212121]">
              ARCHITECTURAL STAYS OF THE MONTH
            </h2>
          </div>
          <Link to="/explore">
            <Button variant="outline" size="md">
              <span>EXPLORE ALL SUITES</span>
              <ArrowUpRight size={16} />
            </Button>
          </Link>
        </div>

        {/* Featured Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {FEATURED_SUITES.map((suite) => (
            <Card key={suite.id} hoverEffect className="flex flex-col justify-between p-0">
              <div>
                {/* Image Box */}
                <div className="relative w-full h-56 border-b-2 border-[#212121] overflow-hidden bg-[#212121]">
                  <img
                    src={suite.image}
                    alt={suite.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3">
                    <Badge variant="ai">{suite.architecturalTag}</Badge>
                  </div>
                  <div className="absolute bottom-3 right-3 bg-white border border-[#212121] px-2 py-0.5 shadow-[2px_2px_0px_#212121] flex items-center gap-1 font-mono text-xs font-bold">
                    <Star size={12} className="text-[#C84B31] fill-[#C84B31]" />
                    <span>{suite.rating}</span>
                    <span className="text-[#212121]/50">({suite.reviewsCount})</span>
                  </div>
                </div>

                {/* Content Box */}
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

              {/* Price & Action Footer */}
              <div className="px-5 pb-5 pt-3 border-t border-[#212121]/15 flex items-center justify-between">
                <div>
                  <span className="font-mono text-xl font-bold text-[#212121]">
                    ${suite.price}
                  </span>
                  <span className="font-mono text-xs text-[#212121]/60 uppercase">
                    {' '}/ night
                  </span>
                </div>
                <Link to={`/room/${suite.slug}`}>
                  <Button variant="primary" size="sm">
                    RESERVE
                  </Button>
                </Link>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedHotels;
