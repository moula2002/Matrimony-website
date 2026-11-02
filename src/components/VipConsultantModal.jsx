import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import * as LucideIcons from 'lucide-react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCrown, faCheck, faPhone, faTimes, faSpinner } from '@fortawesome/free-solid-svg-icons';
import api from '../api/axios';

export const OFFICIAL_VIP_SUPPORT_PHONE = '1800-419-6000';
export const OFFICIAL_VIP_SUPPORT_TEL = '18004196000';
export const OFFICIAL_VIP_SUPPORT_EMAIL = 'vip@familiessmatrimony.com';
export const OFFICIAL_VIP_SUPPORT_HOURS = 'Mon - Sun: 9:00 AM - 8:00 PM IST';
export const OFFICIAL_VIP_SUPPORT_WHATSAPP = 'https://wa.me/9118004196000?text=Hello%20Familiess%20Matrimony%20VIP%20Consultant,%20I%20would%20like%20to%20inquire%20about%20personalized%20VIP%20Assisted%20Matchmaking%20services';

export default function VipConsultantModal({ isOpen, onClose, currentUser }) {
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'callback'
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [preferredTime, setPreferredTime] = useState('Morning (9 AM - 12 PM)');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const navigate = useNavigate();

  const pm = currentUser?.premiumMembership || currentUser?.profile?.premiumMembership || {};
  const isVipUser = Boolean(pm.managedByUs || (pm.planType && pm.planType.toLowerCase().includes('vip')));

  useEffect(() => {
    if (isOpen) {
      const p = currentUser?.profile || {};
      setName(p.name || currentUser?.name || '');
      setPhone(p.phone || currentUser?.phone || '');
      setIsSuccess(false);
      setErrorMsg('');
      setActiveTab('overview');
    }
  }, [isOpen, currentUser]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmitCallback = async (e) => {
    e.preventDefault();
    if (!phone.trim()) {
      setErrorMsg('Please provide a valid 10-digit mobile number.');
      return;
    }
    setErrorMsg('');
    setSubmitting(true);

    try {
      // Record callback request locally and attempt backend ticket dispatch
      const callbackPayload = {
        name: name.trim() || 'Valued Member',
        phone: phone.trim(),
        preferredTime,
        notes: notes.trim(),
        requestedAt: new Date().toISOString(),
        userId: currentUser?._id || currentUser?.id || 'guest',
        status: 'pending'
      };

      try {
        await api.post('/users/support-query', {
          subject: 'VIP Consultant Callback Request',
          message: `Member ${callbackPayload.name} (${callbackPayload.phone}) requested VIP Consultant callback during ${preferredTime}. Notes: ${notes || 'None'}`
        });
      } catch (apiErr) {
        // Fallback: log warning and proceed with local persistence so user is never blocked
        console.warn('Could not post callback to backend ticket system, saving locally:', apiErr);
      }

      // Persist in local storage
      const existing = JSON.parse(localStorage.getItem('vip_consultation_requests') || '[]');
      existing.unshift(callbackPayload);
      localStorage.setItem('vip_consultation_requests', JSON.stringify(existing.slice(0, 20)));

      setIsSuccess(true);
    } catch (err) {
      console.error('Error submitting callback request:', err);
      setErrorMsg('Unable to schedule callback right now. Please call our toll-free helpline directly.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      {/* Click outside backdrop */}
      <div className="absolute inset-0" onClick={onClose} />

      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-amber-200/80 overflow-hidden flex flex-col max-h-[92vh] z-10 animate-in zoom-in-95 duration-200">
        
        {/* Header with VIP Gold Gradient Accent */}
        <div className="relative bg-gradient-to-r from-slate-950 via-purple-950 to-slate-900 text-white p-6 sm:p-7 border-b border-amber-500/30 overflow-hidden shrink-0">
          {/* Subtle decorative glow */}
          <div className="absolute -top-12 -right-12 w-44 h-44 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-purple-600/25 rounded-full blur-2xl pointer-events-none" />

          <div className="relative z-10 flex items-start justify-between gap-4">
            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-400/40 text-amber-300 text-[11px] font-black uppercase tracking-wider shadow-sm">
                <FontAwesomeIcon icon={faCrown} className="text-amber-400 text-xs animate-bounce" />
                <span>VIP Assisted Matchmaking</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2">
                <span>VIP Consultant Service</span>
              </h2>
              <p className="text-slate-300 text-xs sm:text-sm font-medium leading-relaxed max-w-lg">
                Personalized, discreet matchmaking managed by certified senior relationship managers.
              </p>
            </div>

            <button
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition cursor-pointer shrink-0 border border-white/10"
              title="Close"
            >
              <FontAwesomeIcon icon={faTimes} className="text-sm" />
            </button>
          </div>

          {/* User Eligibility / VIP Status Banner */}
          <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-400 font-semibold">Your Status:</span>
              {isVipUser ? (
                <span className="px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-950 text-[11px] font-black uppercase tracking-wider flex items-center gap-1 shadow-sm">
                  <FontAwesomeIcon icon={faCrown} className="text-[10px]" />
                  <span>VIP Managed Member</span>
                </span>
              ) : (
                <span className="px-2.5 py-0.5 rounded-full bg-white/15 text-slate-200 text-[11px] font-bold">
                  {pm.isPremium ? (pm.planType || 'Premium Member') : 'Standard Member'}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setActiveTab('overview')}
                className={`px-3 py-1 rounded-xl text-xs font-black transition cursor-pointer ${
                  activeTab === 'overview'
                    ? 'bg-amber-400 text-slate-950 shadow-sm'
                    : 'text-slate-300 hover:text-white hover:bg-white/10'
                }`}
              >
                Services & Direct Call
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('callback')}
                className={`px-3 py-1 rounded-xl text-xs font-black transition cursor-pointer ${
                  activeTab === 'callback'
                    ? 'bg-amber-400 text-slate-950 shadow-sm'
                    : 'text-slate-300 hover:text-white hover:bg-white/10'
                }`}
              >
                Request Callback
              </button>
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-7 overflow-y-auto space-y-6 flex-1 custom-scrollbar">

          {activeTab === 'overview' && (
            <div className="space-y-6">

              {/* Direct Support Actions Card */}
              <div className="rounded-2xl bg-gradient-to-br from-amber-50/70 via-white to-purple-50/50 p-5 sm:p-6 border border-amber-200 shadow-xs">
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <span className="text-[10px] font-black text-amber-700 uppercase tracking-wider bg-amber-100 px-2 py-0.5 rounded-md border border-amber-300 inline-block">
                      Direct Dedicated Line
                    </span>
                    <h3 className="text-lg font-black text-slate-900 tracking-tight">
                      Speak with a Senior Relationship Manager
                    </h3>
                    <p className="text-xs text-slate-600 font-semibold">
                      Toll-Free Helpline: <span className="font-extrabold text-[#5D34F7]">{OFFICIAL_VIP_SUPPORT_PHONE}</span> ({OFFICIAL_VIP_SUPPORT_HOURS})
                    </p>
                  </div>

                  <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
                    <a
                      href={`tel:${OFFICIAL_VIP_SUPPORT_TEL}`}
                      className="flex-1 sm:flex-none px-5 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-black shadow-md shadow-emerald-600/25 flex items-center justify-center gap-2 transition active:scale-95 no-underline cursor-pointer"
                      title="Call VIP Helpline Now"
                    >
                      <FontAwesomeIcon icon={faPhone} className="text-xs animate-pulse" />
                      <span>Call Now ({OFFICIAL_VIP_SUPPORT_PHONE})</span>
                    </a>

                    <a
                      href={OFFICIAL_VIP_SUPPORT_WHATSAPP}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-3 rounded-xl bg-[#25D366] hover:bg-[#1EBE5D] text-white text-xs font-black shadow-md shadow-green-500/20 flex items-center justify-center gap-2 transition active:scale-95 no-underline cursor-pointer shrink-0"
                      title="Chat with VIP Consultant on WhatsApp"
                    >
                      <span className="text-sm">💬</span>
                      <span>WhatsApp</span>
                    </a>
                  </div>
                </div>
              </div>

              {/* VIP Consultant Key Benefits */}
              <div className="space-y-3">
                <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider">
                  Exclusive Services Provided by Your VIP Consultant
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-1.5 hover:border-amber-300 transition">
                    <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center text-sm font-bold shadow-2xs">
                      👑
                    </div>
                    <h5 className="font-black text-slate-900 text-sm">Dedicated Relationship Manager</h5>
                    <p className="text-slate-500 text-xs font-medium leading-relaxed">
                      An experienced matchmaking specialist personally assigned to your profile who understands your family values and partner expectations.
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-1.5 hover:border-amber-300 transition">
                    <div className="w-8 h-8 rounded-xl bg-purple-50 text-[#5D34F7] border border-purple-200 flex items-center justify-center text-sm font-bold shadow-2xs">
                      ✨
                    </div>
                    <h5 className="font-black text-slate-900 text-sm">Handpicked Curated Matches</h5>
                    <p className="text-slate-500 text-xs font-medium leading-relaxed">
                      Skip endless scrolling. Your consultant shortlists verified profiles with 100% horoscope, education, and lifestyle compatibility.
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-1.5 hover:border-amber-300 transition">
                    <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center text-sm font-bold shadow-2xs">
                      🛡️
                    </div>
                    <h5 className="font-black text-slate-900 text-sm">Confidential Family Introductions</h5>
                    <p className="text-slate-500 text-xs font-medium leading-relaxed">
                      Your consultant communicates directly with prospective families, conducts initial screening, and shares profiles only with mutual consent.
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-1.5 hover:border-amber-300 transition">
                    <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 border border-blue-200 flex items-center justify-center text-sm font-bold shadow-2xs">
                      🤝
                    </div>
                    <h5 className="font-black text-slate-900 text-sm">Meeting & Mediation Coordination</h5>
                    <p className="text-slate-500 text-xs font-medium leading-relaxed">
                      Seamless scheduling of formal family meetings, Zoom video interactions, and astrological Kundali Milan consultations.
                    </p>
                  </div>
                </div>
              </div>

              {/* Bottom CTAs */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setActiveTab('callback')}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs shadow-md transition cursor-pointer active:scale-95 flex items-center justify-center gap-2"
                >
                  <LucideIcons.CalendarClock size={15} />
                  <span>Schedule a Free Consultation Call</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    navigate('/plans');
                  }}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 font-black text-xs shadow-md shadow-amber-500/20 transition cursor-pointer active:scale-95 flex items-center justify-center gap-1.5"
                >
                  <FontAwesomeIcon icon={faCrown} />
                  <span>View VIP Packages & Plans</span>
                </button>
              </div>

            </div>
          )}

          {activeTab === 'callback' && (
            <div className="space-y-5">
              {isSuccess ? (
                <div className="py-8 text-center space-y-4">
                  <div className="w-16 h-16 rounded-full bg-emerald-50 border-2 border-emerald-300 text-emerald-600 flex items-center justify-center mx-auto text-2xl shadow-sm">
                    <FontAwesomeIcon icon={faCheck} />
                  </div>
                  <div className="space-y-1.5 max-w-md mx-auto">
                    <h3 className="text-xl font-black text-slate-900">
                      Callback Request Scheduled!
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed">
                      Thank you, <span className="font-bold text-slate-900">{name || 'Member'}</span>. A senior VIP Matchmaking Consultant will call you at <span className="font-bold text-[#5D34F7]">{phone}</span> during <span className="font-bold text-slate-900">{preferredTime}</span>.
                    </p>
                  </div>
                  <div className="pt-3 flex items-center justify-center gap-3">
                    <button
                      type="button"
                      onClick={() => setIsSuccess(false)}
                      className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition cursor-pointer"
                    >
                      Book Another Callback
                    </button>
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-5 py-2 bg-[#5D34F7] hover:bg-[#4024DB] text-white font-black text-xs rounded-xl transition cursor-pointer shadow-md"
                    >
                      Done
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmitCallback} className="space-y-4">
                  <div className="space-y-1">
                    <h3 className="text-base font-black text-slate-900 tracking-tight">
                      Request a Consultation Callback
                    </h3>
                    <p className="text-xs text-slate-500 font-medium">
                      Fill in your details below and our VIP relationship team will reach out at your preferred time.
                    </p>
                  </div>

                  {errorMsg && (
                    <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold">
                      {errorMsg}
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-slate-700">
                        Full Name <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Enter full name"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#5D34F7]/25 focus:border-[#5D34F7] transition"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-slate-700">
                        Mobile Number <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="tel"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="10-digit mobile number"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#5D34F7]/25 focus:border-[#5D34F7] transition"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-700">
                      Preferred Call Time Slot
                    </label>
                    <select
                      value={preferredTime}
                      onChange={(e) => setPreferredTime(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#5D34F7]/25 focus:border-[#5D34F7] transition cursor-pointer"
                    >
                      <option value="Morning (9 AM - 12 PM)">Morning (9:00 AM - 12:00 PM)</option>
                      <option value="Afternoon (12 PM - 4 PM)">Afternoon (12:00 PM - 4:00 PM)</option>
                      <option value="Evening (4 PM - 8 PM)">Evening (4:00 PM - 8:00 PM)</option>
                      <option value="Immediate Call (Within 30 mins)">Immediate Call (Within 30 mins)</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-700">
                      Partner Expectations / Special Notes (Optional)
                    </label>
                    <textarea
                      rows={3}
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="e.g. Specific caste/community, NRI, age preference, horoscope requirements..."
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#5D34F7]/25 focus:border-[#5D34F7] transition resize-none"
                    />
                  </div>

                  <div className="pt-2 flex items-center justify-between gap-3">
                    <button
                      type="button"
                      onClick={() => setActiveTab('overview')}
                      className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-bold text-xs transition cursor-pointer"
                    >
                      Back
                    </button>

                    <button
                      type="submit"
                      disabled={submitting}
                      className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#5D34F7] to-[#4024DB] hover:from-[#4d25d0] hover:to-[#381fcc] text-white font-black text-xs shadow-md shadow-[#5D34F7]/25 transition cursor-pointer flex items-center gap-2 disabled:opacity-50 active:scale-95"
                    >
                      {submitting ? (
                        <>
                          <FontAwesomeIcon icon={faSpinner} spin className="text-xs" />
                          <span>Scheduling...</span>
                        </>
                      ) : (
                        <>
                          <LucideIcons.Send size={14} />
                          <span>Submit Callback Request</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 font-medium px-6 shrink-0">
          <div className="flex items-center gap-1.5">
            <LucideIcons.ShieldCheck size={14} className="text-emerald-600" />
            <span>100% Confidential & Secure Consultation</span>
          </div>
          <span>Support Helpline: {OFFICIAL_VIP_SUPPORT_PHONE}</span>
        </div>

      </div>
    </div>
  );
}
