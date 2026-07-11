import React, { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setUser } from '../../store/slices/authSlice';
import { X, Check, Loader2, AlertTriangle, ShieldCheck } from 'lucide-react';
import api from '../../services/api';

export const ProfileSettingsPanel = ({ isOpen, onClose }) => {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  // Local Form States
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  
  const [companyName, setCompanyName] = useState('');
  const [taxId, setTaxId] = useState('');
  const [businessAddress, setBusinessAddress] = useState('');
  const [paymentSetup, setPaymentSetup] = useState('');

  const [notifEmail, setNotifEmail] = useState(true);
  const [notifSms, setNotifSms] = useState(false);
  const [notifInApp, setNotifInApp] = useState(true);

  const [twoFactor, setTwoFactor] = useState(false);
  const [newPassword, setNewPassword] = useState('');

  // Auto-save & Status States
  const [saveStatus, setSaveStatus] = useState('saved'); // 'saved' | 'saving' | 'error'
  const isInitialMount = useRef(true);

  // Initialize values when user data is available/changes
  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
      setPhone(user.phone || '');
      setCompanyName(user.businessDetails?.companyName || '');
      setTaxId(user.businessDetails?.taxId || '');
      setBusinessAddress(user.businessDetails?.businessAddress || '');
      setPaymentSetup(user.businessDetails?.paymentSetup || '');
      setNotifEmail(user.notificationPreferences?.email !== false);
      setNotifSms(user.notificationPreferences?.sms || false);
      setNotifInApp(user.notificationPreferences?.inApp !== false);
      setTwoFactor(user.twoFactorEnabled || false);
    }
  }, [user]);

  // Debounced Auto-save handler
  useEffect(() => {
    // Skip auto-save on initial load
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    setSaveStatus('saving');

    const delayDebounceFn = setTimeout(async () => {
      try {
        const payload = {
          name,
          phone,
          businessDetails: {
            companyName,
            taxId,
            businessAddress,
            paymentSetup,
          },
          notificationPreferences: {
            email: notifEmail,
            sms: notifSms,
            inApp: notifInApp,
          },
          twoFactorEnabled: twoFactor,
        };

        // Only send password if user typed something
        if (newPassword.trim().length >= 6) {
          payload.password = newPassword;
        }

        const response = await api.put('/users/profile', payload);
        const updatedUser = response.data.data;
        dispatch(setUser(updatedUser));
        setSaveStatus('saved');
        
        // Clear password input once saved
        if (newPassword) {
          setNewPassword('');
        }
      } catch (err) {
        console.error('Auto-save profile settings failed:', err);
        setSaveStatus('error');
      }
    }, 1000);

    return () => clearTimeout(delayDebounceFn);
  }, [
    name,
    phone,
    companyName,
    taxId,
    businessAddress,
    paymentSetup,
    notifEmail,
    notifSms,
    notifInApp,
    twoFactor,
    newPassword,
    dispatch
  ]);

  const handleDeactivate = async () => {
    const propertyToType = user?.name || 'CONFIRM';
    const confirmName = window.prompt(
      `[DANGER ZONE] Deactivating your account is permanent. Please type "${propertyToType}" to dismantle and deactivate your account:`
    );

    if (confirmName === propertyToType) {
      try {
        await api.delete('/users/profile'); // Assuming profile deletion endpoint exists or deactivates user
        alert('Account successfully deactivated. Redirecting to home...');
        window.location.href = '/';
      } catch (err) {
        alert(err.response?.data?.message || 'Failed to deactivate account.');
      }
    } else {
      alert('Deactivation cancelled. Input mismatch.');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end select-none">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-[#212121]/60 transition-opacity" 
        onClick={onClose}
      />

      {/* Slide-in settings container */}
      <div className="relative w-full max-w-md bg-[#F1EDEA] border-l-4 border-[#212121] h-full flex flex-col p-6 overflow-y-auto shadow-[-8px_0px_0px_#212121] z-10 font-mono text-xs text-[#212121]">
        
        {/* Header section */}
        <div className="flex items-center justify-between border-b-2 border-[#212121] pb-4 mb-6">
          <div className="space-y-1">
            <h2 className="text-sm font-bold uppercase tracking-wider">[ VENDOR SETTINGS ]</h2>
            <div className="flex items-center gap-1.5 font-bold">
              {saveStatus === 'saving' && (
                <span className="text-amber-700 flex items-center gap-1">
                  <Loader2 size={12} className="animate-spin" /> SAVING...
                </span>
              )}
              {saveStatus === 'saved' && (
                <span className="text-emerald-800 flex items-center gap-1">
                  <Check size={12} /> ALL CHANGES SAVED
                </span>
              )}
              {saveStatus === 'error' && (
                <span className="text-[#C84B31] flex items-center gap-1">
                  <AlertTriangle size={12} /> SAVE ERROR
                </span>
              )}
            </div>
          </div>
          <button 
            onClick={onClose}
            className="bg-white hover:bg-[#212121] hover:text-white border-2 border-[#212121] px-3 py-1 font-bold shadow-[2px_2px_0px_#212121] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all cursor-pointer"
          >
            DONE
          </button>
        </div>

        {/* Form Fields container */}
        <div className="space-y-6 flex-grow pb-8">
          
          {/* Section 1: Personal Info */}
          <div className="border-2 border-[#212121] p-4 bg-white shadow-[3px_3px_0px_#212121] space-y-3">
            <div className="font-bold border-b border-[#212121] pb-1 uppercase text-[#C84B31]">
              [ 1. Personal Information ]
            </div>
            
            <div className="space-y-1">
              <label className="font-bold block">FULL NAME</label>
              <input 
                type="text" 
                value={name} 
                onChange={(e) => setName(e.target.value)}
                placeholder="Vendor Name"
                className="w-full bg-[#F1EDEA]/50 border-2 border-[#212121] p-2 outline-none font-sans text-xs"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold block">EMAIL ADDRESS (READ-ONLY)</label>
              <input 
                type="email" 
                value={email} 
                readOnly
                className="w-full bg-[#E6E1DC] border-2 border-[#212121]/30 p-2 outline-none text-[#212121]/60 font-sans text-xs cursor-not-allowed"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold block">CONTACT PHONE</label>
              <input 
                type="text" 
                value={phone} 
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 (555) 000-0000"
                className="w-full bg-[#F1EDEA]/50 border-2 border-[#212121] p-2 outline-none font-sans text-xs"
              />
            </div>
          </div>

          {/* Section 2: Business details */}
          <div className="border-2 border-[#212121] p-4 bg-white shadow-[3px_3px_0px_#212121] space-y-3">
            <div className="font-bold border-b border-[#212121] pb-1 uppercase text-[#C84B31]">
              [ 2. Business Details ]
            </div>

            <div className="space-y-1">
              <label className="font-bold block">COMPANY / TRADING NAME</label>
              <input 
                type="text" 
                value={companyName} 
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="StayWise Partners Ltd"
                className="w-full bg-[#F1EDEA]/50 border-2 border-[#212121] p-2 outline-none font-sans text-xs"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold block">TAX IDENTIFICATION NUMBER (TIN)</label>
              <input 
                type="text" 
                value={taxId} 
                onChange={(e) => setTaxId(e.target.value)}
                placeholder="TX-88902-Z"
                className="w-full bg-[#F1EDEA]/50 border-2 border-[#212121] p-2 outline-none font-sans text-xs"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold block">BUSINESS HUB ADDRESS</label>
              <input 
                type="text" 
                value={businessAddress} 
                onChange={(e) => setBusinessAddress(e.target.value)}
                placeholder="10 Main St, Shibuya, Tokyo"
                className="w-full bg-[#F1EDEA]/50 border-2 border-[#212121] p-2 outline-none font-sans text-xs"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold block">STRIPE MERCHANT / ROUTING ID</label>
              <input 
                type="text" 
                value={paymentSetup} 
                onChange={(e) => setPaymentSetup(e.target.value)}
                placeholder="acct_1234567890"
                className="w-full bg-[#F1EDEA]/50 border-2 border-[#212121] p-2 outline-none font-sans text-xs"
              />
            </div>
          </div>

          {/* Section 3: Notification preferences */}
          <div className="border-2 border-[#212121] p-4 bg-white shadow-[3px_3px_0px_#212121] space-y-3">
            <div className="font-bold border-b border-[#212121] pb-1 uppercase text-[#C84B31]">
              [ 3. Notification Settings ]
            </div>

            <div className="flex items-center justify-between border-b border-[#212121]/10 py-1.5">
              <label className="font-bold">EMAIL NOTIFICATIONS</label>
              <input 
                type="checkbox" 
                checked={notifEmail} 
                onChange={(e) => setNotifEmail(e.target.checked)}
                className="accent-[#C84B31] w-4 h-4 cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between border-b border-[#212121]/10 py-1.5">
              <label className="font-bold">SMS BOOKING ALERTS</label>
              <input 
                type="checkbox" 
                checked={notifSms} 
                onChange={(e) => setNotifSms(e.target.checked)}
                className="accent-[#C84B31] w-4 h-4 cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between py-1.5">
              <label className="font-bold">IN-APP ALERTS & CONSOLE LOGS</label>
              <input 
                type="checkbox" 
                checked={notifInApp} 
                onChange={(e) => setNotifInApp(e.target.checked)}
                className="accent-[#C84B31] w-4 h-4 cursor-pointer"
              />
            </div>
          </div>

          {/* Section 4: Security */}
          <div className="border-2 border-[#212121] p-4 bg-white shadow-[3px_3px_0px_#212121] space-y-3">
            <div className="font-bold border-b border-[#212121] pb-1 uppercase text-[#C84B31]">
              [ 4. Security & Credentials ]
            </div>

            <div className="space-y-1">
              <label className="font-bold block">UPDATE PASSWORD</label>
              <input 
                type="password" 
                value={newPassword} 
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="•••••• (min 6 characters)"
                className="w-full bg-[#F1EDEA]/50 border-2 border-[#212121] p-2 outline-none font-sans text-xs"
              />
            </div>

            <div className="flex items-center justify-between py-2 border-t border-[#212121]/15 mt-2">
              <div className="space-y-0.5">
                <label className="font-bold flex items-center gap-1.5">
                  <ShieldCheck size={14} className="text-emerald-800" />
                  ENABLE 2FA
                </label>
                <p className="text-[10px] text-[#212121]/60">Require cryptokey on login.</p>
              </div>
              <input 
                type="checkbox" 
                checked={twoFactor} 
                onChange={(e) => setTwoFactor(e.target.checked)}
                className="accent-[#C84B31] w-4 h-4 cursor-pointer"
              />
            </div>
          </div>

          {/* Section 5: Danger zone */}
          <div className="border-2 border-[#C84B31] p-4 bg-[#C84B31]/5 shadow-[3px_3px_0px_#C84B31] space-y-3">
            <div className="font-bold border-b border-[#C84B31] pb-1 uppercase text-[#C84B31] flex items-center gap-1">
              <AlertTriangle size={14} />
              <span>[ 5. Danger Zone ]</span>
            </div>
            <p className="text-[10px] text-[#212121]/70 leading-relaxed">
              Deactivating your profile will permanently delete all associated architectural room tiers, active bookings, and listing histories from the live MongoDB nodes.
            </p>
            <button 
              onClick={handleDeactivate}
              className="w-full bg-[#C84B31] hover:bg-[#B63D25] text-white font-bold p-2.5 border-2 border-[#212121] shadow-[3px_3px_0px_#212121] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all uppercase cursor-pointer text-center"
            >
              DEACTIVATE ACCOUNT
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};
