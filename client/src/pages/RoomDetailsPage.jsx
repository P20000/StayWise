import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { ErrorBanner } from '../components/common/ErrorBanner';
import { Star, MapPin, Check, ShieldCheck, ArrowLeft, Send } from 'lucide-react';
import api from '../services/api';
import BookingModal from '../components/room/BookingModal';

const INR_PER_USD = 85;

export const RoomDetailsPage = () => {
  const { slug } = useParams();
  const { user, isAuthenticated } = useSelector((state) => state.auth);

  const [room, setRoom] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Booking modal
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);

  // Review form
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewError, setReviewError] = useState(null);
  const [reviewSuccess, setReviewSuccess] = useState('');

  useEffect(() => {
    fetchRoomDetails();
  }, [slug]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchRoomDetails = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get(`/rooms/${slug}`);
      const roomData = response.data.data;
      setRoom(roomData);
      if (roomData?._id) fetchReviews(roomData._id);
    } catch (err) {
      err.message = `[DETAILS_ERROR] Could not resolve architectural specifications for this slug: ${err.message}`;
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchReviews = async (roomId) => {
    try {
      const response = await api.get(`/reviews/room/${roomId}`);
      setReviews(response.data.data || []);
    } catch (err) {
      console.error('Failed to load reviews:', err);
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) {
      setReviewError(new Error('Please provide a comment for your feedback.'));
      return;
    }
    setSubmittingReview(true);
    setReviewError(null);
    setReviewSuccess('');
    try {
      await api.post('/reviews', {
        roomId: room._id,
        rating: Number(newRating),
        comment: newComment,
      });
      setReviewSuccess('[SUCCESS] Review submitted.');
      setNewComment('');
      setNewRating(5);
      fetchRoomDetails();
    } catch (err) {
      setReviewError(err);
    } finally {
      setSubmittingReview(false);
    }
  };

  // --- Sidebar billing preview (INR, mirrors BookingModal at 1 night / 1 room) ---
  const basePriceINR = room ? Math.round(room.basePrice * INR_PER_USD) : 0;
  const previewBase     = basePriceINR * 1 * 1;
  const previewCleaning = 500;
  const previewService  = Math.round(previewBase * 0.05);
  const previewGst      = Math.round((previewBase + previewService) * 0.12);
  const previewTotal    = previewBase + previewCleaning + previewService + previewGst;

  // ── Loading / Error states ──
  if (loading) {
    return (
      <div className="min-h-screen bg-[#F1EDEA] flex items-center justify-center font-mono text-xs uppercase text-[#212121]/50 select-none">
        Loading stay details...
      </div>
    );
  }

  if (error || !room) {
    return (
      <div className="min-h-screen bg-[#F1EDEA] flex flex-col items-center justify-center p-4 select-none">
        <div className="w-full max-w-md space-y-4">
          <ErrorBanner error={error || new Error('This property is not available in our listings.')} />
          <div className="text-center">
            <Link to="/explore">
              <Button variant="primary" size="sm" className="mt-2">Back to Listings</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

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
            <span>← Back to Listings</span>
          </Link>
        </div>

        {/* Title & Badge Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b-2 border-[#212121] pb-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="terracotta">Verified Stay</Badge>
              <Badge variant="default">{room.architecturalStyle}</Badge>
            </div>
            <h1 className="font-mono text-3xl sm:text-5xl font-bold text-[#212121] tracking-tight uppercase">
              {room.title}
            </h1>
            <div className="flex items-center gap-4 mt-3 font-mono text-sm font-bold text-[#212121]/80">
              <span className="flex items-center gap-1 text-[#C84B31]">
                <MapPin size={16} />
                {room.location}
              </span>
              <span>•</span>
              {!room.reviewsCount || room.reviewsCount === 0 ? (
                <span className="flex items-center gap-1.5 text-amber-600 font-bold text-xs font-mono border border-amber-400 bg-amber-50 px-2 py-0.5">
                  <span className="animate-pulse">✦</span>
                  <span>NEWLY LISTED — NO REVIEWS YET</span>
                </span>
              ) : (
                <span className="flex items-center gap-1">
                  <Star size={16} className="text-[#C84B31] fill-[#C84B31]" />
                  {room.rating.toFixed(2)} ({room.reviewsCount} verified stays)
                </span>
              )}
            </div>
          </div>
          <div>
            <Button
              variant="primary"
              size="lg"
              onClick={() => setIsBookingModalOpen(true)}
              className="w-full md:w-auto px-10"
            >
              <span>Book Now — ${room.basePrice}/night</span>
            </Button>
          </div>
        </div>

        {/* Main Image Banner */}
        <div className="w-full h-[500px] border-3 border-[#212121] shadow-[6px_6px_0px_#212121] overflow-hidden bg-[#212121]">
          <img
            src={room.images?.[0]?.url || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80'}
            alt={room.title}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Content Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: About + Amenities + Reviews */}
          <div className="lg:col-span-2 space-y-8">
            <Card>
              <h3 className="font-mono text-lg font-bold text-[#212121] border-b-2 border-[#212121] pb-3 mb-4">
                About This Stay
              </h3>
              <p className="font-sans text-base text-[#212121]/80 leading-relaxed">{room.description}</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6 pt-6 border-t border-[#212121]/20 font-mono text-xs">
                <div>
                  <span className="text-[#C84B31] font-bold block mb-1">Noise Level</span>
                  <span>{room.quietnessLevel}</span>
                </div>
                <div>
                  <span className="text-[#C84B31] font-bold block mb-1">Work Space</span>
                  <span>{room.workplaceProfile}</span>
                </div>
              </div>
            </Card>

            <Card>
              <h3 className="font-mono text-lg font-bold text-[#212121] border-b-2 border-[#212121] pb-3 mb-4">
                Amenities &amp; Features
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {room.amenities?.map((amenity, i) => (
                  <div key={i} className="flex items-center gap-2 font-mono text-xs text-[#212121]">
                    <div className="bg-[#C84B31] text-white p-0.5">
                      <Check size={12} />
                    </div>
                    <span>{amenity}</span>
                  </div>
                ))}
              </div>
            </Card>

            {/* Reviews section */}
            <div className="space-y-6">
              <h3 className="font-mono text-xl font-bold uppercase text-[#212121] border-b-2 border-[#212121] pb-2">
                Guest Reviews
              </h3>

              {/* Review input (authenticated only) */}
              {isAuthenticated ? (
                <Card className="p-5 border-2 border-[#212121] bg-white">
                  <h4 className="font-mono text-xs font-bold uppercase text-[#C84B31] mb-4">Leave a Review</h4>
                  {reviewError && (
                    <ErrorBanner error={reviewError} className="mb-3 shadow-none border" onClose={() => setReviewError(null)} />
                  )}
                  {reviewSuccess && (
                    <div className="bg-[#F1EDEA] text-emerald-800 border border-[#212121] p-2 mb-3 font-mono text-[10px] font-bold">
                      {reviewSuccess.toUpperCase()}
                    </div>
                  )}
                  <form onSubmit={handleReviewSubmit} className="space-y-4">
                    <div className="flex items-center gap-3 font-mono text-xs">
                      <span className="font-bold">Your Rating</span>
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((num) => (
                          <button
                            key={num}
                            type="button"
                            onClick={() => setNewRating(num)}
                            className="bg-transparent border-0 p-0 cursor-pointer"
                          >
                            <Star
                              size={18}
                              className={num <= newRating ? 'text-[#C84B31] fill-[#C84B31]' : 'text-gray-300'}
                            />
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-1 font-mono text-xs">
                      <label className="font-bold block">Your Review</label>
                      <textarea
                        rows={3}
                        required
                        placeholder="Share your experience..."
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        className="w-full bg-[#F1EDEA] border-2 border-[#212121] p-2.5 outline-none font-sans text-xs resize-none"
                      />
                    </div>
                    <div className="flex justify-end">
                      <Button variant="primary" size="sm" type="submit" disabled={submittingReview}>
                        <Send size={12} />
                        <span>{submittingReview ? 'Submitting...' : 'Submit Review'}</span>
                      </Button>
                    </div>
                  </form>
                </Card>
              ) : (
                <div className="border-2 border-dashed border-[#212121]/30 p-4 text-center font-mono text-[10px] uppercase text-[#212121]/60 bg-[#212121]/5">
                  Sign in to leave a review —{' '}
                  <Link to="/auth" className="text-[#C84B31] underline font-bold">Sign In</Link>
                </div>
              )}

              {/* Reviews list */}
              {reviews.length === 0 ? (
                <div className="border-2 border-dashed border-amber-300 bg-amber-50/50 p-6 flex flex-col items-center text-center gap-2">
                  <span className="text-2xl animate-pulse">✦</span>
                  <p className="font-mono text-xs font-bold text-amber-700 uppercase tracking-wider">
                    Be the first to review this stay
                  </p>
                  <p className="font-sans text-[11px] text-[#212121]/50 max-w-xs">
                    This listing has no guest reviews yet. Share your experience and help future travelers discover it.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {reviews.map((rev) => (
                    <Card key={rev._id} className="p-4 bg-white">
                      <div className="flex items-center justify-between border-b border-[#212121]/15 pb-2 mb-2 font-mono text-[10px]">
                        <div className="font-bold flex items-center gap-1.5">
                          <span className="text-[#C84B31]">[ GUEST ]</span>
                          <span>{rev.user?.name || 'Anonymous User'}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Star size={12} className="text-[#C84B31] fill-[#C84B31]" />
                          <span className="font-bold">{rev.rating}</span>
                        </div>
                      </div>
                      <p className="font-sans text-xs text-[#212121]/80 italic">"{rev.comment}"</p>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right: Sticky reservation card */}
          <div>
            <Card className="sticky top-24">
              <div className="flex items-center justify-between border-b-2 border-[#212121] pb-4 mb-5">
                <div>
                  <span className="font-mono text-3xl font-bold text-[#212121]">
                    ₹{basePriceINR.toLocaleString('en-IN')}
                  </span>
                  <span className="font-mono text-xs text-[#212121]/60 uppercase"> / night</span>
                </div>
                <Badge variant="terracotta">Available</Badge>
              </div>

              {/* Preview dates */}
              <div className="space-y-4 mb-6">
                <div className="border-2 border-[#212121] p-3 font-mono text-xs">
                  <div className="text-[#C84B31] font-bold mb-1">[ DATES ]</div>
                  <div className="flex items-center justify-between">
                    <span>CHECK-IN: TODAY</span>
                    <span>→</span>
                    <span>CHECK-OUT: +1 DAY</span>
                  </div>
                </div>
                <div className="border-2 border-[#212121] p-3 font-mono text-xs">
                  <div className="text-[#C84B31] font-bold mb-1">[ GUESTS ]</div>
                  <div>1 ADULT · 1 ROOM</div>
                </div>

                {/* Billing preview (1 night / 1 room baseline) */}
                <div className="space-y-2 pt-2 font-mono text-xs border-t border-[#212121]/20">
                  <div className="flex justify-between">
                    <span>₹{basePriceINR.toLocaleString('en-IN')} × 1n × 1r</span>
                    <span>₹{previewBase.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between text-[#212121]/70">
                    <span>Cleaning fee (1 room)</span>
                    <span>₹{previewCleaning.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between text-[#212121]/70">
                    <span>Service fee (5%)</span>
                    <span>₹{previewService.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between text-[#212121]/70">
                    <span>GST (12%)</span>
                    <span>₹{previewGst.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between font-bold text-sm pt-2 border-t border-[#212121]">
                    <span>TOTAL DUE</span>
                    <span>₹{previewTotal.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>

              <Button
                variant="primary"
                size="lg"
                className="w-full"
                onClick={() => setIsBookingModalOpen(true)}
              >
                <span>Book This Stay</span>
              </Button>

              <div className="flex items-center gap-2 justify-center mt-4 font-mono text-[10px] text-[#212121]/60 uppercase">
                <ShieldCheck size={14} className="text-[#C84B31]" />
                <span>Secure checkout guaranteed</span>
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Booking Modal (extracted component) */}
      <BookingModal
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        room={room}
        user={user}
      />
    </div>
  );
};

export default RoomDetailsPage;
