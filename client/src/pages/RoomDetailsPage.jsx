import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { Modal } from '../components/common/Modal';
import { ErrorBanner } from '../components/common/ErrorBanner';
import { Star, MapPin, Check, ShieldCheck, ArrowLeft, Send, AlertCircle } from 'lucide-react';
import api from '../services/api';


export const RoomDetailsPage = () => {
  const { slug } = useParams();
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  const [room, setRoom] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Booking modal state
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [bookingConfirmed, setBookingConfirmed] = useState(false);
  const [bookingError, setBookingError] = useState(null);
  const [isCreatingBooking, setIsCreatingBooking] = useState(false);
  const [paymentProcessing, setPaymentProcessing] = useState(false);

  // Guest configuration (lives in modal)
  const [nights, setNights] = useState(1);
  const [numRooms, setNumRooms] = useState(1);
  const [numAdults, setNumAdults] = useState(1);
  const [numMinors, setNumMinors] = useState(0);

  // New Review form state
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewError, setReviewError] = useState(null);
  const [reviewSuccess, setReviewSuccess] = useState('');

  useEffect(() => {
    fetchRoomDetails();
  }, [slug]);

  const fetchRoomDetails = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get(`/rooms/${slug}`);
      const roomData = response.data.data;
      setRoom(roomData);
      
      // Fetch reviews
      if (roomData?._id) {
        fetchReviews(roomData._id);
      }
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

  // Load Razorpay checkout.js script dynamically only when needed
  const loadRazorpayScript = () =>
    new Promise((resolve) => {
      if (window.Razorpay) return resolve(true);
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });

  // --- Billing computation (all values in INR) ---
  // basePrice from DB is in USD; 1 USD = 85 INR
  const INR_PER_USD = 85;
  const basePriceINR   = room ? Math.round(room.basePrice * INR_PER_USD) : 0;
  const baseTotal      = basePriceINR * nights * numRooms;
  const cleaningFeeINR = 500 * numRooms;                        // ₹500 flat per room
  const serviceFeeINR  = Math.round(baseTotal * 0.05);          // 5% service fee
  const gstINR         = Math.round((baseTotal + serviceFeeINR) * 0.12); // 12% GST
  const grandTotalINR  = baseTotal + cleaningFeeINR + serviceFeeINR + gstINR;

  const handleConfirmReservation = async () => {
    setIsCreatingBooking(true);
    setBookingError(null);
    try {
      const checkInDate = new Date();
      const checkOutDate = new Date();
      checkOutDate.setDate(checkInDate.getDate() + nights);

      // Step 1 — Create booking slot lock in MongoDB + Redis
      const bookingRes = await api.post('/bookings', {
        roomId: room._id,
        checkInDate: checkInDate.toISOString(),
        checkOutDate: checkOutDate.toISOString(),
        totalAmount: grandTotalINR,   // stored in INR
        numRooms,
        numAdults,
        numMinors,
      });
      const booking = bookingRes.data.data;

      // Step 2 — Create Razorpay order on the backend
      const orderRes = await api.post('/payments/create-order', {
        bookingId: booking._id,
      });
      const { orderId, amount, currency, keyId, prefill, description } = orderRes.data;

      setIsCreatingBooking(false);

      // Step 3 — Load Razorpay script
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        setBookingError('Could not load the payment gateway. Please check your connection and try again.');
        return;
      }

      // Step 4 — Open Razorpay checkout popup
      setPaymentProcessing(true);
      const rzp = new window.Razorpay({
        key: keyId,
        amount,
        currency,
        name: 'StayWise.ai',
        description,
        order_id: orderId,
        prefill,
        theme: { color: '#C84B31' },
        modal: {
          ondismiss: () => {
            setPaymentProcessing(false);
            setBookingError('Payment was cancelled. Your slot is held for 15 minutes — you can try again.');
          },
        },
        handler: async (response) => {
          // Step 5 — Verify the payment signature on the backend
          try {
            await api.post('/payments/verify', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              bookingId: booking._id,
            });
            setPaymentProcessing(false);
            setBookingConfirmed(true);
          } catch (verifyErr) {
            setPaymentProcessing(false);
            setBookingError(
              verifyErr.response?.data?.message ||
              'Payment was received but verification failed. Please contact support with your payment ID: ' +
              response.razorpay_payment_id
            );
          }
        },
      });

      rzp.open();
    } catch (err) {
      setIsCreatingBooking(false);
      setPaymentProcessing(false);
      console.error('[BOOKING_FLOW_ERROR]', err);
      setBookingError(err.response?.data?.message || err.message || 'An error occurred. Please try again.');
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
      // Reload room rating and reviews list
      fetchRoomDetails();
    } catch (err) {
      setReviewError(err);
    } finally {
      setSubmittingReview(false);
    }
  };

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
              <Button variant="primary" size="sm" className="mt-2">
                Back to Listings
              </Button>
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
              {(!room.reviewsCount || room.reviewsCount === 0) ? (
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
          <div className="lg:col-span-2 space-y-8">
            <Card>
              <h3 className="font-mono text-lg font-bold text-[#212121] border-b-2 border-[#212121] pb-3 mb-4">
                About This Stay
              </h3>
              <p className="font-sans text-base text-[#212121]/80 leading-relaxed">
                {room.description}
              </p>
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
                Amenities & Features
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {room.amenities && room.amenities.map((amenity, i) => (
                  <div key={i} className="flex items-center gap-2 font-mono text-xs text-[#212121]">
                    <div className="bg-[#C84B31] text-white p-0.5">
                      <Check size={12} />
                    </div>
                    <span>{amenity}</span>
                  </div>
                ))}
              </div>
            </Card>

            {/* FEEDBACK ENGINE (REVIEWS) */}
            <div className="space-y-6">
              <h3 className="font-mono text-xl font-bold uppercase text-[#212121] border-b-2 border-[#212121] pb-2">
                Guest Reviews
              </h3>

              {/* Review Input Box (Logged In Only) */}
              {isAuthenticated ? (
                <Card className="p-5 border-2 border-[#212121] bg-white">
                  <h4 className="font-mono text-xs font-bold uppercase text-[#C84B31] mb-4">
                    Leave a Review
                  </h4>
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
                  Sign in to leave a review — <Link to="/auth" className="text-[#C84B31] underline font-bold">Sign In</Link>
                </div>
              )}

              {/* Reviews List */}
              {reviews.length === 0 ? (
                <div className="border-2 border-dashed border-amber-300 bg-amber-50/50 p-6 flex flex-col items-center text-center gap-2">
                  <span className="text-2xl animate-pulse">✦</span>
                  <p className="font-mono text-xs font-bold text-amber-700 uppercase tracking-wider">Be the first to review this stay</p>
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
                      <p className="font-sans text-xs text-[#212121]/80 italic">
                        "{rev.comment}"
                      </p>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Reservation Card */}
          <div>
            <Card className="sticky top-24">
              <div className="flex items-center justify-between border-b-2 border-[#212121] pb-4 mb-5">
                <div>
                  <span className="font-mono text-3xl font-bold text-[#212121]">
                    ₹{basePriceINR.toLocaleString('en-IN')}
                  </span>
                  <span className="font-mono text-xs text-[#212121]/60 uppercase">
                    {' '}/ night
                  </span>
                </div>
                <Badge variant="terracotta">Available</Badge>
              </div>

              <div className="space-y-4 mb-6">
                <div className="border-2 border-[#212121] p-3 font-mono text-xs">
                  <div className="text-[#C84B31] font-bold mb-1">[ DATES ]</div>
                  <div className="flex items-center justify-between">
                    <span>CHECK-IN: TODAY</span>
                    <span>→</span>
                    <span>CHECK-OUT: +{nights} {nights === 1 ? 'DAY' : 'DAYS'}</span>
                  </div>
                </div>

                <div className="border-2 border-[#212121] p-3 font-mono text-xs">
                  <div className="text-[#C84B31] font-bold mb-1">[ GUESTS ]</div>
                  <div>
                    {numAdults} ADULT{numAdults > 1 ? 'S' : ''}
                    {numMinors > 0 ? `, ${numMinors} MINOR${numMinors > 1 ? 'S' : ''}` : ''}
                    {' · '}{numRooms} ROOM{numRooms > 1 ? 'S' : ''}
                  </div>
                </div>

                <div className="space-y-2 pt-2 font-mono text-xs border-t border-[#212121]/20">
                  <div className="flex justify-between">
                    <span>₹{basePriceINR.toLocaleString('en-IN')} × {nights}n × {numRooms}r</span>
                    <span>₹{baseTotal.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between text-[#212121]/70">
                    <span>Cleaning fee ({numRooms} room{numRooms > 1 ? 's' : ''})</span>
                    <span>₹{cleaningFeeINR.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between text-[#212121]/70">
                    <span>Service fee (5%)</span>
                    <span>₹{serviceFeeINR.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between text-[#212121]/70">
                    <span>GST (12%)</span>
                    <span>₹{gstINR.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between font-bold text-sm pt-2 border-t border-[#212121]">
                    <span>TOTAL DUE</span>
                    <span>₹{grandTotalINR.toLocaleString('en-IN')}</span>
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

      {/* Booking Modal */}
      <Modal
        isOpen={isBookingModalOpen}
        onClose={() => {
          if (paymentProcessing) return; // prevent closing during payment
          setIsBookingModalOpen(false);
          setBookingConfirmed(false);
          setBookingError(null);
        }}
        title="Confirm Your Booking"
      >
        {bookingConfirmed ? (
          <div className="text-center py-8 space-y-4">
            <div className="w-12 h-12 bg-[#C84B31] text-white flex items-center justify-center mx-auto border-2 border-[#212121] shadow-[4px_4px_0px_#212121]">
              <Check size={28} />
            </div>
            <h4 className="font-mono text-xl font-bold text-[#212121]">Booking Confirmed!</h4>
            <p className="font-sans text-sm text-[#212121]/80">
              Your reservation is confirmed. You'll receive a confirmation email shortly.
            </p>
          </div>
        ) : (
          <div className="space-y-5 font-mono text-xs">
            {bookingError && (
              <div className="bg-[#F1EDEA] text-[#C84B31] border-2 border-[#C84B31] p-3 font-mono font-bold uppercase">
                [RESERVATION_ERROR] {bookingError}
              </div>
            )}
            {paymentProcessing && (
              <div className="bg-[#212121] text-white border-2 border-[#C84B31] p-3 font-mono font-bold uppercase text-center animate-pulse">
                [ AWAITING PAYMENT — DO NOT CLOSE THIS WINDOW ]
              </div>
            )}

            {/* Guest Configuration */}
            <div className="border-2 border-[#212121] p-4 space-y-4">
              <div className="font-bold text-[#C84B31] uppercase">[ Stay Configuration ]</div>

              {/* Stepper helper */}
              {[{label:'Nights', min:1, max:30, val:nights, set:setNights},
                {label:'Rooms', min:1, max:10, val:numRooms, set:setNumRooms},
                {label:'Adults', min:1, max:20, val:numAdults, set:setNumAdults},
                {label:'Minors', min:0, max:10, val:numMinors, set:setNumMinors},
              ].map(({label, min, max, val, set}) => (
                <div key={label} className="flex items-center justify-between">
                  <span className="font-bold uppercase">{label}</span>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => set(Math.max(min, val - 1))}
                      disabled={paymentProcessing || isCreatingBooking}
                      className="w-7 h-7 border-2 border-[#212121] flex items-center justify-center font-bold text-base hover:bg-[#C84B31] hover:text-white hover:border-[#C84B31] transition-colors disabled:opacity-40"
                    >-</button>
                    <span className="w-6 text-center font-bold text-sm">{val}</span>
                    <button
                      onClick={() => set(Math.min(max, val + 1))}
                      disabled={paymentProcessing || isCreatingBooking}
                      className="w-7 h-7 border-2 border-[#212121] flex items-center justify-center font-bold text-base hover:bg-[#C84B31] hover:text-white hover:border-[#C84B31] transition-colors disabled:opacity-40"
                    >+</button>
                  </div>
                </div>
              ))}
            </div>

            {/* Transparent Billing Breakdown */}
            <div className="border-2 border-[#212121] p-4 space-y-2">
              <div className="font-bold text-[#C84B31] uppercase mb-1">[ Billing Breakdown ]</div>
              <div className="flex justify-between">
                <span className="text-[#212121]/80">₹{basePriceINR.toLocaleString('en-IN')} × {nights} night{nights > 1 ? 's' : ''} × {numRooms} room{numRooms > 1 ? 's' : ''}</span>
                <span className="font-bold">₹{baseTotal.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-[#212121]/70">
                <span>Cleaning fee (₹500 × {numRooms} room{numRooms > 1 ? 's' : ''})</span>
                <span>₹{cleaningFeeINR.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-[#212121]/70">
                <span>Service fee (5%)</span>
                <span>₹{serviceFeeINR.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-[#212121]/70">
                <span>GST (12%)</span>
                <span>₹{gstINR.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between font-bold text-sm pt-2 border-t-2 border-[#212121] mt-2">
                <span>TOTAL DUE</span>
                <span>₹{grandTotalINR.toLocaleString('en-IN')}</span>
              </div>
              <div className="text-[#212121]/50 text-[10px] pt-1">
                {numAdults} adult{numAdults > 1 ? 's' : ''}{numMinors > 0 ? ` + ${numMinors} minor${numMinors > 1 ? 's' : ''}` : ''}
                {' · '}{nights} night{nights > 1 ? 's' : ''}
                {' · '}{numRooms} room{numRooms > 1 ? 's' : ''}
              </div>
            </div>

            <Button
              variant="primary"
              size="lg"
              className="w-full"
              onClick={handleConfirmReservation}
              disabled={isCreatingBooking || paymentProcessing}
            >
              {isCreatingBooking
                ? 'INITIATING...'
                : paymentProcessing
                ? 'AWAITING PAYMENT...'
                : `PAY ₹${grandTotalINR.toLocaleString('en-IN')}`}
            </Button>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default RoomDetailsPage;
