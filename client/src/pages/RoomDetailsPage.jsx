import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { Modal } from '../components/common/Modal';
import { Star, MapPin, Check, ShieldCheck, ArrowLeft, Calendar } from 'lucide-react';

export const RoomDetailsPage = () => {
  const { slug } = useParams();
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [bookingConfirmed, setBookingConfirmed] = useState(false);

  // Sample data matching Elevated Brutalism suite specs
  const suite = {
    title: slug?.replace(/-/g, ' ').toUpperCase() || 'THE CONCRETE PENTHOUSE',
    location: 'Shibuya, Tokyo',
    price: 450,
    rating: 4.98,
    reviewsCount: 124,
    architecturalStyle: 'Board-Formed Concrete & Brass',
    quietnessLevel: 'High (`dB < 32` certified)',
    workplaceProfile: 'Symmetric 1 Gbps Fiber & Herman Miller Embody task seating',
    description:
      'Designed by Prizker-winning architectural innovators, this double-height penthouse features raw board-formed concrete walls juxtaposed with custom unlacquered brass hardware. Floor-to-ceiling double-glazed acoustically insulated windows reveal panoramic views of Shibuya Crossings canopy without acoustic intrusion.',
    amenities: [
      'Exposed Board-Formed Concrete Walls',
      'Custom Unlacquered Brass Hardware',
      '1 Gbps Dedicated Fiber Optical Wi-Fi',
      'Acoustic Double-Glazing (`dB < 32`)',
      'Terracotta En-Suite Rain Shower',
      'Automated Solar & Blackout Louvers',
    ],
    image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
  };

  const handleConfirmReservation = () => {
    setBookingConfirmed(true);
    setTimeout(() => {
      setIsBookingModalOpen(false);
      setBookingConfirmed(false);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-[#F1EDEA] py-10 px-4 sm:px-6 lg:px-8 select-none">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Back navigation */}
        <div>
          <Link
            to="/explore"
            className="inline-flex items-center gap-2 font-mono text-xs uppercase font-bold text-[#212121] hover:text-[#C84B31] transition-colors"
          >
            <ArrowLeft size={16} />
            <span>[ RETURN TO SUITE DIRECTORY ]</span>
          </Link>
        </div>

        {/* Title & Badge Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b-2 border-[#212121] pb-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="terracotta">[ VERIFIED ARCHITECTURAL STAY ]</Badge>
              <Badge variant="default">{suite.architecturalStyle}</Badge>
            </div>
            <h1 className="font-mono text-3xl sm:text-5xl font-bold text-[#212121] tracking-tight">
              {suite.title}
            </h1>
            <div className="flex items-center gap-4 mt-3 font-mono text-sm font-bold text-[#212121]/80">
              <span className="flex items-center gap-1 text-[#C84B31]">
                <MapPin size={16} />
                {suite.location}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Star size={16} className="text-[#C84B31] fill-[#C84B31]" />
                {suite.rating} ({suite.reviewsCount} verified stays)
              </span>
            </div>
          </div>
          <div>
            <Button
              variant="primary"
              size="lg"
              onClick={() => setIsBookingModalOpen(true)}
              className="w-full md:w-auto px-10"
            >
              <span>RESERVE SUITE — ${suite.price}/NT</span>
            </Button>
          </div>
        </div>

        {/* Main Image Banner */}
        <div className="w-full h-[500px] border-3 border-[#212121] shadow-[6px_6px_0px_#212121] overflow-hidden bg-[#212121]">
          <img
            src={suite.image}
            alt={suite.title}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Content Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <Card>
              <h3 className="font-mono text-lg font-bold text-[#212121] border-b-2 border-[#212121] pb-3 mb-4">
                [ ARCHITECTURAL SPECIFICATION & NARRATIVE ]
              </h3>
              <p className="font-sans text-base text-[#212121]/80 leading-relaxed">
                {suite.description}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6 pt-6 border-t border-[#212121]/20 font-mono text-xs">
                <div>
                  <span className="text-[#C84B31] font-bold block mb-1">[ ACOUSTIC RATING ]</span>
                  <span>{suite.quietnessLevel}</span>
                </div>
                <div>
                  <span className="text-[#C84B31] font-bold block mb-1">[ WORK PROFILE ]</span>
                  <span>{suite.workplaceProfile}</span>
                </div>
              </div>
            </Card>

            <Card>
              <h3 className="font-mono text-lg font-bold text-[#212121] border-b-2 border-[#212121] pb-3 mb-4">
                [ MATERIAL & STRUCTURAL AMENITIES ]
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {suite.amenities.map((amenity, i) => (
                  <div key={i} className="flex items-center gap-2 font-mono text-xs text-[#212121]">
                    <div className="bg-[#C84B31] text-white p-0.5">
                      <Check size={12} />
                    </div>
                    <span>{amenity}</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Reservation Card */}
          <div>
            <Card className="sticky top-24">
              <div className="flex items-center justify-between border-b-2 border-[#212121] pb-4 mb-5">
                <div>
                  <span className="font-mono text-3xl font-bold text-[#212121]">
                    ${suite.price}
                  </span>
                  <span className="font-mono text-xs text-[#212121]/60 uppercase">
                    {' '}/ night
                  </span>
                </div>
                <Badge variant="terracotta">[ INSTANT LOCK ]</Badge>
              </div>

              <div className="space-y-4 mb-6">
                <div className="border-2 border-[#212121] p-3 font-mono text-xs">
                  <div className="text-[#C84B31] font-bold mb-1">[ DATES ]</div>
                  <div className="flex items-center justify-between">
                    <span>CHECK-IN: TODAY</span>
                    <span>→</span>
                    <span>CHECK-OUT: +3 DAYS</span>
                  </div>
                </div>

                <div className="border-2 border-[#212121] p-3 font-mono text-xs">
                  <div className="text-[#C84B31] font-bold mb-1">[ GUESTS ]</div>
                  <div>2 GUESTS (MAX 4)</div>
                </div>

                <div className="space-y-2 pt-2 font-mono text-xs border-t border-[#212121]/20">
                  <div className="flex justify-between">
                    <span>${suite.price} × 3 nights</span>
                    <span>${suite.price * 3}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Cleaning & Architecture Fee</span>
                    <span>$120</span>
                  </div>
                  <div className="flex justify-between font-bold text-sm pt-2 border-t border-[#212121]">
                    <span>TOTAL DUE</span>
                    <span>${suite.price * 3 + 120}</span>
                  </div>
                </div>
              </div>

              <Button
                variant="primary"
                size="lg"
                className="w-full"
                onClick={() => setIsBookingModalOpen(true)}
              >
                <span>PROCEED TO STATELSS BOOKING</span>
              </Button>

              <div className="flex items-center gap-2 justify-center mt-4 font-mono text-[10px] text-[#212121]/60 uppercase">
                <ShieldCheck size={14} className="text-[#C84B31]" />
                <span>Redis Concurrency Slot Lock Protected</span>
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Booking Modal */}
      <Modal
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        title="[ STATELSS RESERVATION COMMITMENT ]"
      >
        {bookingConfirmed ? (
          <div className="text-center py-8 space-y-4">
            <div className="w-12 h-12 bg-[#C84B31] text-white flex items-center justify-center mx-auto border-2 border-[#212121] shadow-[4px_4px_0px_#212121]">
              <Check size={28} />
            </div>
            <h4 className="font-mono text-xl font-bold text-[#212121]">
              [ SLOT LOCK CONFIRMED ]
            </h4>
            <p className="font-sans text-sm text-[#212121]/80">
              Your room slot has been locked via Redis. Stripe PaymentIntent (`pi_3L9...`)
              finalization sent to webhook.
            </p>
          </div>
        ) : (
          <div className="space-y-5 font-mono text-xs">
            <div className="bg-[#F1EDEA] border-2 border-[#212121] p-4 space-y-2">
              <div className="font-bold text-[#C84B31]">[ ROOM SLOT SUMMARY ]</div>
              <div className="flex justify-between text-sm font-bold">
                <span>{suite.title}</span>
                <span>${suite.price * 3 + 120}</span>
              </div>
              <div className="text-[#212121]/70">Location: {suite.location}</div>
            </div>

            <div className="space-y-2">
              <label className="font-bold uppercase text-[#212121] block">
                [ GUEST EMAIL FOR WEBHOOK CONFIRMATION ]
              </label>
              <input
                type="email"
                placeholder="guest@architectural.stay"
                defaultValue="guest@staywise.ai"
                className="w-full bg-white border-2 border-[#212121] p-2.5 outline-none font-mono text-sm"
              />
            </div>

            <Button
              variant="primary"
              size="lg"
              className="w-full mt-4"
              onClick={handleConfirmReservation}
            >
              COMMIT & PAY VIA STRIPE WEBHOOK
            </Button>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default RoomDetailsPage;
