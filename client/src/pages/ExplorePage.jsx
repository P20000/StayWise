import React from 'react';
import { useSelector } from 'react-redux';
import { SearchBar } from '../components/search/SearchBar';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { Star, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';

const ALL_SUITES = [
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
  {
    id: 'suite-4',
    title: 'MONOLITHIC PINE LOFT',
    location: 'Kyoto, Japan',
    price: 390,
    rating: 4.97,
    reviewsCount: 142,
    architecturalTag: 'Japanese Modern & Cedar',
    image: 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=800&q=80',
    slug: 'monolithic-pine-loft-kyoto',
  },
  {
    id: 'suite-5',
    title: 'STEEL & VELVET RESIDENCE',
    location: 'SoHo, New York',
    price: 520,
    rating: 4.92,
    reviewsCount: 178,
    architecturalTag: 'Cast-Iron Brutalism',
    image: 'https://images.unsplash.com/photo-1600573472589-003525b2f729?auto=format&fit=crop&w=800&q=80',
    slug: 'steel-velvet-residence-soho',
  },
  {
    id: 'suite-6',
    title: 'BASALT SANCTUARY VILLA',
    location: 'Reykjavik, Iceland',
    price: 610,
    rating: 4.96,
    reviewsCount: 95,
    architecturalTag: 'Volcanic Basalt & Glass',
    image: 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=800&q=80',
    slug: 'basalt-sanctuary-villa-reykjavik',
  },
];

export const ExplorePage = () => {
  const filters = useSelector((state) => state.search);

  // Filter logic based on location match
  const filteredSuites = ALL_SUITES.filter((suite) => {
    if (!filters.location) return true;
    return suite.location.toLowerCase().includes(filters.location.toLowerCase()) ||
           suite.title.toLowerCase().includes(filters.location.toLowerCase());
  });

  return (
    <div className="min-h-screen bg-[#F1EDEA] py-10 px-4 sm:px-6 lg:px-8 select-none">
      <div className="max-w-7xl mx-auto space-y-10">
        {/* Top Header & Active SearchBar */}
        <div className="space-y-6 border-b-2 border-[#212121] pb-8">
          <div>
            <Badge variant="terracotta" className="mb-2">
              [ DIRECTORY REGISTRY ]
            </Badge>
            <h1 className="font-mono text-3xl sm:text-5xl font-bold uppercase tracking-tight text-[#212121]">
              EXPLORE ARCHITECTURAL SUITES
            </h1>
            <p className="font-sans text-sm text-[#212121]/70 mt-2">
              Showing {filteredSuites.length} verified listings adhering to Elevated Brutalism structural standards.
            </p>
          </div>
          <SearchBar />
        </div>

        {/* Results Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {filteredSuites.map((suite) => (
            <Card key={suite.id} hoverEffect className="flex flex-col justify-between p-0">
              <div>
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
    </div>
  );
};

export default ExplorePage;
