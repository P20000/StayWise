import React, { useState } from 'react';
import { Card } from '../../components/common/Card';
import { ChevronDown, Check } from 'lucide-react';

const FAQ_ITEMS = [
  {
    cat: 'Getting started',
    q: 'How do I onboard a new architectural property listing?',
    a: 'Click "Publish New Stay" in the dashboard header. You will proceed through our step 1 Geolocation setup, pinpointing coordinates on Leaflet, and then transition to our 4x4 Grid room tiers config constructor.',
  },
  {
    cat: 'Managing bookings',
    q: 'How does StayWise guarantee booking dates concurrency locks?',
    a: 'We implement stateless high-concurrency Redis locking. When a guest attempts a checkout, the slot locks for 15 minutes. During this period, other users cannot book the same room dates.',
  },
  {
    cat: 'Pricing & services',
    q: 'Can I add customized services like dining plans or airport pickup?',
    a: 'Yes. In Step 2 of property creation, you can place multiple room tiers on the grid cells. Double click any room tier to toggle 11 separate customizable addon services and specify pricing structure.',
  },
  {
    cat: 'Geo-location setup',
    q: 'Why is it critical to input coordinates and address precisely?',
    a: 'StayWise relies on vector and geographical proximity indexing. Travel searches locate architecture within certain radii, and static previews render the map markers using this coordinate metadata.',
  },
  {
    cat: 'Account & billing',
    q: 'Where do guest payout fees route to?',
    a: 'All booking payments flow through Stripe. Verify your Stripe merchant id route under the profile settings slide-out panel to enable smooth processing of payout accounts.',
  },
];

/**
 * VendorHelpTab — FAQ accordion + support ticket form for vendor help.
 *
 * Props:
 *   rooms  {array}  Vendor's rooms, used for listing the associated-room dropdown
 *   user   {object} Pre-fills support form name/email placeholders
 */
const VendorHelpTab = ({ rooms, user }) => {
  const [supportName, setSupportName] = useState('');
  const [supportEmail, setSupportEmail] = useState('');
  const [supportRoomId, setSupportRoomId] = useState('');
  const [supportCategory, setSupportCategory] = useState('Getting started');
  const [supportMessage, setSupportMessage] = useState('');
  const [supportSuccess, setSupportSuccess] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!supportName || !supportEmail || !supportMessage) {
      alert('Please fill all mandatory fields.');
      return;
    }
    setSupportSuccess(true);
    setSupportName('');
    setSupportEmail('');
    setSupportMessage('');
    setTimeout(() => setSupportSuccess(false), 5000);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

      {/* FAQ Accordion */}
      <div className="lg:col-span-2 space-y-6">
        <h2 className="font-mono text-sm font-bold uppercase tracking-wider text-[#212121]">
          [ FREQUENTLY ASKED BUSINESS INQUIRIES ]
        </h2>
        <div className="space-y-4">
          {FAQ_ITEMS.map((faq, idx) => (
            <details
              key={idx}
              className="group border-2 border-[#212121] bg-white p-4 shadow-[2px_2px_0px_#212121] font-mono text-xs"
            >
              <summary className="font-bold flex items-center justify-between cursor-pointer list-none select-none">
                <div className="space-y-0.5">
                  <span className="text-[9px] text-[#C84B31] uppercase tracking-wider font-bold">
                    [{faq.cat}]
                  </span>
                  <h4 className="text-xs font-bold text-[#212121]">{faq.q}</h4>
                </div>
                <ChevronDown size={14} className="group-open:rotate-180 transition-transform duration-200" />
              </summary>
              <p className="font-sans text-xs text-[#212121]/70 mt-3 border-t border-[#212121]/10 pt-2 leading-relaxed">
                {faq.a}
              </p>
            </details>
          ))}
        </div>
      </div>

      {/* Support Ticket Form */}
      <div className="space-y-4">
        <h2 className="font-mono text-sm font-bold uppercase tracking-wider text-[#212121]">
          [ CONTACT CONSOLE SUPPORT ]
        </h2>
        <Card className="bg-white border-2 border-[#212121] p-4 shadow-[3px_3px_0px_#212121] font-mono text-xs">
          {supportSuccess ? (
            <div className="text-center py-8 space-y-2 text-emerald-800 font-bold">
              <Check size={32} className="mx-auto" />
              <span>TICKET LOGGED IN BUSINESS QUEUE</span>
              <p className="text-[10px] font-sans text-stone-500">
                We will evaluate your ticket within 2 business hours.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="space-y-1">
                <label className="font-bold block">PARTNER NAME</label>
                <input
                  type="text"
                  required
                  value={supportName}
                  onChange={(e) => setSupportName(e.target.value)}
                  placeholder={user?.name || 'Vendor Name'}
                  className="w-full bg-[#F1EDEA]/50 border-2 border-[#212121] p-2 outline-none font-sans text-xs"
                />
              </div>
              <div className="space-y-1">
                <label className="font-bold block">REPLY EMAIL</label>
                <input
                  type="email"
                  required
                  value={supportEmail}
                  onChange={(e) => setSupportEmail(e.target.value)}
                  placeholder={user?.email || 'vendor@staywise.ai'}
                  className="w-full bg-[#F1EDEA]/50 border-2 border-[#212121] p-2 outline-none font-sans text-xs"
                />
              </div>
              <div className="space-y-1">
                <label className="font-bold block">ASSOCIATED LISTING</label>
                <select
                  value={supportRoomId}
                  onChange={(e) => setSupportRoomId(e.target.value)}
                  className="w-full bg-white border-2 border-[#212121] p-2 outline-none"
                >
                  <option value="">None / General Inquiry</option>
                  {rooms.map((r) => (
                    <option key={r._id} value={r._id}>
                      {r.title.substring(0, 20)}...
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <label className="font-bold block">ISSUE CATEGORY</label>
                <select
                  value={supportCategory}
                  onChange={(e) => setSupportCategory(e.target.value)}
                  className="w-full bg-white border-2 border-[#212121] p-2 outline-none"
                >
                  <option value="Getting started">Getting started</option>
                  <option value="Managing bookings">Managing bookings</option>
                  <option value="Pricing & services">Pricing &amp; services</option>
                  <option value="Geo-location setup">Geo-location setup</option>
                  <option value="Account & billing">Account &amp; billing</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="font-bold block">NARRATIVE CASE DESCRIPTION</label>
                <textarea
                  rows={3}
                  required
                  value={supportMessage}
                  onChange={(e) => setSupportMessage(e.target.value)}
                  placeholder="Describe the dashboard error or spatial mapping coordinates discrepancy..."
                  className="w-full bg-[#F1EDEA]/50 border-2 border-[#212121] p-2 outline-none font-sans text-xs resize-none"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-[#212121] hover:bg-[#C84B31] text-white font-bold p-2 border-2 border-[#212121] shadow-[2px_2px_0px_#212121] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all uppercase cursor-pointer text-center"
              >
                SUBMIT TICKET
              </button>
            </form>
          )}
        </Card>
      </div>

    </div>
  );
};

export default VendorHelpTab;
