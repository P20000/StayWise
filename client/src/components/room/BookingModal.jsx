import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import api from '../../services/api';
import { Check } from 'lucide-react';

const INR_PER_USD = 85;

/**
 * BookingModal — encapsulates the full Razorpay booking flow:
 *   - Guest configuration (nights, rooms, adults, minors)
 *   - Live billing breakdown (base, cleaning, service fee, GST)
 *   - Razorpay checkout popup + payment verification
 *   - Slot lock release on dismiss / verification failure
 *
 * Props:
 *   isOpen         {boolean}
 *   onClose        {fn}  () → void
 *   room           {object}  The room being booked (needs _id, basePrice)
 *   user           {object}  Logged-in user (for prefill)
 */
const BookingModal = ({ isOpen, onClose, room, user }) => {
  const [bookingConfirmed, setBookingConfirmed] = useState(false);
  const [bookingError, setBookingError] = useState(null);
  const [isCreatingBooking, setIsCreatingBooking] = useState(false);
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [pendingBookingId, setPendingBookingId] = useState(null);

  // Guest configuration
  const [nights, setNights] = useState(1);
  const [numRooms, setNumRooms] = useState(1);
  const [numAdults, setNumAdults] = useState(1);
  const [numMinors, setNumMinors] = useState(0);

  // --- Billing computation (INR) ---
  const basePriceINR  = room ? Math.round(room.basePrice * INR_PER_USD) : 0;
  const baseTotal     = basePriceINR * nights * numRooms;
  const cleaningFee   = 500 * numRooms;                        // ₹500 flat per room
  const serviceFee    = Math.round(baseTotal * 0.05);          // 5%
  const gst           = Math.round((baseTotal + serviceFee) * 0.12); // 12% GST
  const grandTotal    = baseTotal + cleaningFee + serviceFee + gst;

  // Load Razorpay script dynamically
  const loadRazorpayScript = () =>
    new Promise((resolve) => {
      if (window.Razorpay) return resolve(true);
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });

  const handleConfirmReservation = async () => {
    setIsCreatingBooking(true);
    setBookingError(null);
    try {
      const checkInDate = new Date();
      const checkOutDate = new Date();
      checkOutDate.setDate(checkInDate.getDate() + nights);

      // Step 1 — Create booking slot lock
      const bookingRes = await api.post('/bookings', {
        roomId: room._id,
        checkInDate: checkInDate.toISOString(),
        checkOutDate: checkOutDate.toISOString(),
        totalAmount: grandTotal,
        numRooms,
        numAdults,
        numMinors,
      });
      const booking = bookingRes.data.data;
      setPendingBookingId(booking._id);

      // Step 2 — Create Razorpay order
      const orderRes = await api.post('/payments/create-order', { bookingId: booking._id });
      const { orderId, amount, currency, keyId, prefill, description } = orderRes.data;

      setIsCreatingBooking(false);

      // Step 3 — Load Razorpay script
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        setBookingError('Could not load the payment gateway. Please check your connection and try again.');
        return;
      }

      // Step 4 — Open Razorpay checkout
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
          ondismiss: async () => {
            setPaymentProcessing(false);
            if (booking?._id) {
              try { await api.post(`/bookings/${booking._id}/cancel-lock`); } catch (_) {}
            }
            setPendingBookingId(null);
            setBookingError('Payment window closed. Your slot lock has been released for other travelers.');
          },
        },
        handler: async (response) => {
          // Step 5 — Verify payment
          try {
            await api.post('/payments/verify', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              bookingId: booking._id,
            });
            setPaymentProcessing(false);
            setBookingConfirmed(true);
            setPendingBookingId(null);
          } catch (verifyErr) {
            setPaymentProcessing(false);
            if (booking?._id) {
              try { await api.post(`/bookings/${booking._id}/cancel-lock`); } catch (_) {}
            }
            setPendingBookingId(null);
            setBookingError(
              verifyErr.response?.data?.message ||
              'Payment was received but verification failed. Your slot lock has been released.'
            );
          }
        },
      });
      rzp.open();
    } catch (err) {
      setIsCreatingBooking(false);
      setPaymentProcessing(false);
      setBookingError(err.response?.data?.message || err.message || 'An error occurred. Please try again.');
    }
  };

  const handleClose = async () => {
    if (paymentProcessing) return; // prevent closing during active payment
    if (pendingBookingId) {
      try { await api.post(`/bookings/${pendingBookingId}/cancel-lock`); } catch (_) {}
      setPendingBookingId(null);
    }
    // Reset local state
    setBookingConfirmed(false);
    setBookingError(null);
    setNights(1);
    setNumRooms(1);
    setNumAdults(1);
    setNumMinors(0);
    onClose();
  };

  const STEPPERS = [
    { label: 'Nights', min: 1, max: 30, val: nights, set: setNights },
    { label: 'Rooms',  min: 1, max: 10, val: numRooms, set: setNumRooms },
    { label: 'Adults', min: 1, max: 20, val: numAdults, set: setNumAdults },
    { label: 'Minors', min: 0, max: 10, val: numMinors, set: setNumMinors },
  ];

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Confirm Your Booking">
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
          {/* Errors / payment status */}
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
            {STEPPERS.map(({ label, min, max, val, set }) => (
              <div key={label} className="flex items-center justify-between">
                <span className="font-bold uppercase">{label}</span>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => set(Math.max(min, val - 1))}
                    disabled={paymentProcessing || isCreatingBooking}
                    className="w-7 h-7 border-2 border-[#212121] flex items-center justify-center font-bold text-base hover:bg-[#C84B31] hover:text-white hover:border-[#C84B31] transition-colors disabled:opacity-40"
                  >
                    -
                  </button>
                  <span className="w-6 text-center font-bold text-sm">{val}</span>
                  <button
                    onClick={() => set(Math.min(max, val + 1))}
                    disabled={paymentProcessing || isCreatingBooking}
                    className="w-7 h-7 border-2 border-[#212121] flex items-center justify-center font-bold text-base hover:bg-[#C84B31] hover:text-white hover:border-[#C84B31] transition-colors disabled:opacity-40"
                  >
                    +
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Billing Breakdown */}
          <div className="border-2 border-[#212121] p-4 space-y-2">
            <div className="font-bold text-[#C84B31] uppercase mb-1">[ Billing Breakdown ]</div>
            <div className="flex justify-between">
              <span className="text-[#212121]/80">
                ₹{basePriceINR.toLocaleString('en-IN')} × {nights} night{nights > 1 ? 's' : ''} × {numRooms} room{numRooms > 1 ? 's' : ''}
              </span>
              <span className="font-bold">₹{baseTotal.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between text-[#212121]/70">
              <span>Cleaning fee (₹500 × {numRooms} room{numRooms > 1 ? 's' : ''})</span>
              <span>₹{cleaningFee.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between text-[#212121]/70">
              <span>Service fee (5%)</span>
              <span>₹{serviceFee.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between text-[#212121]/70">
              <span>GST (12%)</span>
              <span>₹{gst.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between font-bold text-sm pt-2 border-t-2 border-[#212121] mt-2">
              <span>TOTAL DUE</span>
              <span>₹{grandTotal.toLocaleString('en-IN')}</span>
            </div>
            <div className="text-[#212121]/50 text-[10px] pt-1">
              {numAdults} adult{numAdults > 1 ? 's' : ''}
              {numMinors > 0 ? ` + ${numMinors} minor${numMinors > 1 ? 's' : ''}` : ''}
              {' · '}{nights} night{nights > 1 ? 's' : ''}
              {' · '}{numRooms} room{numRooms > 1 ? 's' : ''}
            </div>
          </div>

          {/* CTA */}
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
              : `PAY ₹${grandTotal.toLocaleString('en-IN')}`}
          </Button>
        </div>
      )}
    </Modal>
  );
};

export default BookingModal;
