import React from 'react';
import { Link } from 'react-router-dom';
import { Building2, ShieldCheck, Terminal } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="w-full bg-[#212121] text-[#F1EDEA] border-t-3 border-[#212121] select-none pt-12 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-10 border-b border-[#F1EDEA]/20">
          {/* Brand & Mission Column */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-2">
              <div className="bg-[#C84B31] text-white p-1.5 border border-white">
                <Building2 size={20} />
              </div>
              <span className="font-mono font-bold text-xl tracking-wider">
                STAYWISE.AI
              </span>
            </div>
            <p className="font-sans text-sm text-[#F1EDEA]/80 max-w-md leading-relaxed">
              Architectural Stays in Motion. A premium guest and host community
              designed around Elevated Brutalism, bespoke hospitality, and
              seamless, design-forward travel experiences.
            </p>
            <div className="flex items-center gap-2 pt-2 font-mono text-xs text-[#C84B31]">
              <Building2 size={14} />
              <span>[ THE ART OF HOSPITALITY & DESIGN ]</span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="font-mono text-xs uppercase tracking-widest font-bold text-[#C84B31]">
              [ CURATED SPACES ]
            </h4>
            <ul className="space-y-2 font-mono text-xs uppercase">
              <li>
                <Link to="/explore" className="hover:text-[#C84B31] transition-colors">
                  Modernist Lofts
                </Link>
              </li>
              <li>
                <Link to="/explore" className="hover:text-[#C84B31] transition-colors">
                  Concrete Penthouses
                </Link>
              </li>
              <li>
                <Link to="/explore" className="hover:text-[#C84B31] transition-colors">
                  Golden Hour Suites
                </Link>
              </li>
              <li>
                <Link to="/recommender" className="hover:text-[#C84B31] transition-colors">
                  SmartStay AI Recommender
                </Link>
              </li>
            </ul>
          </div>

          {/* Operational Compliance */}
          <div className="space-y-3">
            <h4 className="font-mono text-xs uppercase tracking-widest font-bold text-[#C84B31]">
              [ PARTNERS & HOSTS ]
            </h4>
            <ul className="space-y-2 font-mono text-xs uppercase text-[#F1EDEA]/80">
              <li className="flex items-center gap-1.5">
                <ShieldCheck size={14} className="text-[#C84B31]" />
                <span>Secure Guest Accounts</span>
              </li>
              <li className="flex items-center gap-1.5">
                <ShieldCheck size={14} className="text-[#C84B31]" />
                <span>Instant Confirmations</span>
              </li>
              <li className="flex items-center gap-1.5">
                <ShieldCheck size={14} className="text-[#C84B31]" />
                <span>Universal Access Design</span>
              </li>
              <li className="pt-2">
                <Link
                  to="/vendor/setup"
                  className="inline-block bg-[#F1EDEA] text-[#212121] px-2 py-1 border border-[#212121] font-bold hover:bg-[#C84B31] hover:text-white transition-colors"
                >
                  BECOME A HOST →
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-xs text-[#F1EDEA]/60">
          <div>
            © {new Date().getFullYear()} StayWise.ai Architecture Group. All rights reserved.
          </div>
          <div className="flex gap-6">
            <span className="hover:text-white cursor-pointer">[ PRIVACY ]</span>
            <span className="hover:text-white cursor-pointer">[ TERMS OF SERVICE ]</span>
            <span className="hover:text-white cursor-pointer">[ SECURITY BLUEPRINT ]</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
