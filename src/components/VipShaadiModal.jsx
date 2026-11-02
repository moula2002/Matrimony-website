import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCrown, faCheck, faPhone, faTimes, faSpinner, faShieldAlt,
  faCalendarCheck, faUserCheck, faExclamationCircle, faStar
} from '@fortawesome/free-solid-svg-icons';
import api from '../api/axios';
import { OFFICIAL_VIP_SUPPORT_PHONE, OFFICIAL_VIP_SUPPORT_TEL, OFFICIAL_VIP_SUPPORT_WHATSAPP } from './VipConsultantModal';

export default function VipShaadiModal({ isOpen, onClose, currentUser, onEnquirySubmitted }) {
  const [existingEnquiry, setExistingEnquiry] = useState(null);
  const [hasActiveEnquiry, setHasActiveEnquiry] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState(false);
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [successData, setSuccessData] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  const p = currentUser?.profile || currentUser || {};
  const registeredPhone = currentUser?.phone || p.phone || '';
  const displayName = p.name || currentUser?.name || (currentUser?.email ? currentUser.email.split('@')[0] : 'Valued Member');
  const userEmail = currentUser?.email || p.email || '';
  const displayId = p.uid || currentUser?.uid || p.custom_id || (currentUser?._id ? currentUser._id.substring(currentUser._id.length - 8).toUpperCase() : '');

  // Fetch current user's VIP enquiry status whenever the modal opens
  useEffect(() => {
    if (!isOpen) return;

    setSuccessData(null);
    setErrorMsg('');
    setNotes('');

    const fetchMyEnquiry = async () => {
      try {
        setLoadingStatus(true);
        const res = await api.get('/vip-shaadi/my-enquiry');
        if (res.data && res.data.success) {
          setHasActiveEnquiry(Boolean(res.data.hasActiveEnquiry));
          setExistingEnquiry(res.data.data || null);
        }
      } catch (err) {
        console.error('Error checking existing VIP enquiry:', err);
      } finally {
        setLoadingStatus(false);
      }
    };

    fetchMyEnquiry();
  }, [isOpen]);

  // Handle ESC key to close
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

  const handleGetInvited = async (e) => {
    e.preventDefault();

    // Prevent repeated taps
    if (submitting) return;

    if (!registeredPhone) {
      setErrorMsg('A registered mobile number on your account is required to submit a VIP Familiess enquiry. Please add a phone number in your profile settings.');
      return;
    }

    setErrorMsg('');
    setSubmitting(true);

    try {
      const res = await api.post('/vip-shaadi/enquiries', {
        notes: notes.trim(),
        email: userEmail
      });

      if (res.data && res.data.success) {
        setSuccessData(res.data);
        setHasActiveEnquiry(true);
        setExistingEnquiry({
          _id: res.data.enquiryId,
          status: res.data.status || 'New',
          createdAt: res.data.createdAt || new Date().toISOString(),
          phone: registeredPhone,
          name: displayName
        });
        if (onEnquirySubmitted) {
          onEnquirySubmitted(res.data);
        }
      } else {
        setErrorMsg(res.data?.message || 'Failed to submit VIP Familiess enquiry. Please try again.');
      }
    } catch (err) {
      console.error('Error submitting VIP enquiry:', err);
      if (err.response?.status === 409) {
        // Active enquiry already exists
        setHasActiveEnquiry(true);
        setExistingEnquiry({
          _id: err.response.data?.enquiryId,
          status: err.response.data?.status || 'New',
          createdAt: err.response.data?.createdAt || new Date().toISOString()
        });
        setErrorMsg('An active VIP Familiess enquiry already exists for your account.');
      } else if (err.response?.data?.message) {
        setErrorMsg(err.response.data.message);
      } else {
        setErrorMsg('Unable to submit enquiry at this moment. Please check your connection or contact our helpline.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'New':
        return (
          <span className="px-3 py-1 rounded-full bg-amber-500/15 text-amber-800 border border-amber-300 text-xs font-black uppercase tracking-wider flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
            <span>Request Received (New)</span>
          </span>
        );
      case 'Contacted':
        return (
          <span className="px-3 py-1 rounded-full bg-blue-500/15 text-blue-800 border border-blue-300 text-xs font-black uppercase tracking-wider flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-ping"></span>
            <span>Consultant Assigned (Contacted)</span>
          </span>
        );
      case 'Interested':
        return (
          <span className="px-3 py-1 rounded-full bg-purple-500/15 text-purple-800 border border-purple-300 text-xs font-black uppercase tracking-wider flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-purple-500"></span>
            <span>In Consultation (Interested)</span>
          </span>
        );
      case 'Converted':
        return (
          <span className="px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-800 border border-emerald-300 text-xs font-black uppercase tracking-wider flex items-center gap-1.5">
            <FontAwesomeIcon icon={faCheck} className="text-emerald-600" />
            <span>VIP Member (Active)</span>
          </span>
        );
      case 'Closed':
        return (
          <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-300 text-xs font-black uppercase tracking-wider">
            Completed / Closed
          </span>
        );
      default:
        return (
          <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-800 border border-amber-200 text-xs font-black uppercase">
            {status || 'Active'}
          </span>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-[130] flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      {/* Backdrop */}
      <div className="absolute inset-0" onClick={onClose} />

      <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-amber-300/80 overflow-hidden flex flex-col max-h-[92vh] z-10 animate-in zoom-in-95 duration-200">
        
        {/* Header - Royal Luxury VIP Style */}
        <div className="relative bg-gradient-to-r from-slate-950 via-purple-950 to-slate-900 text-white p-6 sm:p-7 border-b border-amber-500/30 overflow-hidden shrink-0">
          <div className="absolute -top-12 -right-12 w-48 h-48 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-10 -left-10 w-44 h-44 bg-purple-600/25 rounded-full blur-2xl pointer-events-none" />

          <div className="relative z-10 flex items-start justify-between gap-4">
            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r from-amber-500/25 to-yellow-500/25 border border-amber-400/50 text-amber-300 text-[11px] font-black uppercase tracking-wider shadow-sm">
                <FontAwesomeIcon icon={faCrown} className="text-amber-400 text-xs animate-bounce" />
                <span>Bespoke Matchmaking</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2">
                <span>VIP Familiess</span>
                <span className="text-amber-400 text-sm font-semibold tracking-normal border border-amber-400/40 rounded-full px-2.5 py-0.5">
                  Get Invited
                </span>
              </h2>
              <p className="text-slate-300 text-xs sm:text-sm font-medium leading-relaxed max-w-md">
                An ultra-exclusive, invitation-only matchmaking service managed by senior consultants for discerning families.
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
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-7 overflow-y-auto space-y-5 flex-1 custom-scrollbar">

          {/* Loading status spinner */}
          {loadingStatus && (
            <div className="flex items-center justify-center py-8 text-amber-600 gap-3">
              <FontAwesomeIcon icon={faSpinner} spin className="text-2xl" />
              <span className="text-xs font-bold text-slate-600">Checking VIP enquiry status...</span>
            </div>
          )}

          {/* Success Banner if just submitted */}
          {!loadingStatus && successData && (
            <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200 shadow-xs space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-lg shrink-0 border border-emerald-300">
                  <FontAwesomeIcon icon={faCheck} />
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-black text-emerald-950">
                    Invitation Enquiry Submitted Successfully!
                  </h3>
                  <p className="text-xs text-emerald-800 leading-relaxed font-medium">
                    Thank you, <span className="font-bold">{displayName}</span>. Your request has been recorded with Reference ID{' '}
                    <span className="font-mono font-bold bg-white px-2 py-0.5 rounded border border-emerald-200">
                      {successData.enquiryId ? String(successData.enquiryId).slice(-8).toUpperCase() : 'VIP-REF'}
                    </span>.
                  </p>
                </div>
              </div>
              <p className="text-xs text-slate-600 pl-13 leading-relaxed">
                A Senior Relationship Manager will review your matrimony profile and contact you on{' '}
                <span className="font-bold text-slate-900">{registeredPhone}</span> within 24 hours.
              </p>
            </div>
          )}

          {/* Already Submitted / Active Enquiry Status Banner (Prevents Duplicate Request) */}
          {!loadingStatus && !successData && hasActiveEnquiry && existingEnquiry && (
            <div className="rounded-2xl bg-gradient-to-br from-amber-50 via-white to-orange-50 border-2 border-amber-300 p-5 space-y-4 shadow-xs">
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div className="space-y-1">
                  <span className="text-[10px] font-black text-amber-700 uppercase tracking-wider bg-amber-100 px-2 py-0.5 rounded-md border border-amber-300 inline-block">
                    Enquiry Already Recorded
                  </span>
                  <h3 className="text-lg font-black text-slate-900 tracking-tight">
                    Your VIP Familiess Request is Active
                  </h3>
                </div>
                <div>{getStatusBadge(existingEnquiry.status)}</div>
              </div>

              <div className="p-3.5 rounded-xl bg-white/80 border border-amber-200 text-xs space-y-2">
                <div className="flex justify-between items-center text-slate-600">
                  <span className="font-semibold">Registered Member:</span>
                  <span className="font-bold text-slate-900">{displayName}</span>
                </div>
                <div className="flex justify-between items-center text-slate-600">
                  <span className="font-semibold">Contact Number:</span>
                  <span className="font-bold text-[#5D34F7]">{existingEnquiry.phone || registeredPhone}</span>
                </div>
                <div className="flex justify-between items-center text-slate-600">
                  <span className="font-semibold">Request Date:</span>
                  <span className="font-bold text-slate-800">
                    {existingEnquiry.createdAt ? new Date(existingEnquiry.createdAt).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric'
                    }) : 'Recently Submitted'}
                  </span>
                </div>
                <div className="flex justify-between items-center text-slate-600">
                  <span className="font-semibold">Enquiry Reference:</span>
                  <span className="font-mono font-bold text-slate-900">
                    {existingEnquiry._id ? String(existingEnquiry._id).slice(-8).toUpperCase() : 'VIP-REQUEST'}
                  </span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-amber-100/60 border border-amber-200/80 text-xs text-amber-900 flex items-start gap-2.5">
                <FontAwesomeIcon icon={faShieldAlt} className="text-amber-700 mt-0.5 shrink-0" />
                <p className="leading-relaxed font-medium">
                  Your VIP enquiry is actively being handled by our executive matchmaking team. You do not need to submit another enquiry. If you would like immediate assistance, please call our VIP helpline directly.
                </p>
              </div>

              {/* Direct Helpline Buttons */}
              <div className="flex items-center gap-2 pt-1 flex-wrap">
                <a
                  href={`tel:${OFFICIAL_VIP_SUPPORT_TEL}`}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-black shadow-sm flex items-center justify-center gap-2 transition no-underline cursor-pointer active:scale-95"
                >
                  <FontAwesomeIcon icon={faPhone} className="text-xs" />
                  <span>Call VIP Helpline ({OFFICIAL_VIP_SUPPORT_PHONE})</span>
                </a>
                <a
                  href={OFFICIAL_VIP_SUPPORT_WHATSAPP}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2.5 rounded-xl bg-[#25D366] hover:bg-[#1EBE5D] text-white text-xs font-black shadow-sm flex items-center justify-center gap-2 transition no-underline cursor-pointer active:scale-95"
                >
                  <span>💬 WhatsApp</span>
                </a>
              </div>
            </div>
          )}

          {/* Form to submit a new enquiry (When no active enquiry exists) */}
          {!loadingStatus && !hasActiveEnquiry && (
            <div className="space-y-5">
              
              {/* VIP Familiess Key Value Highlights */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-amber-50/60 border border-amber-200/80 space-y-1">
                  <div className="flex items-center gap-1.5 text-amber-800 font-black text-xs">
                    <span>👑</span>
                    <span>Dedicated Matchmaker</span>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-snug">
                    Personalized matchmaking managed by senior relationship experts.
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-purple-50/60 border border-purple-200/80 space-y-1">
                  <div className="flex items-center gap-1.5 text-purple-800 font-black text-xs">
                    <span>🔒</span>
                    <span>100% Confidential</span>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-snug">
                    Profile shared only with mutually verified, prospective families.
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-blue-50/60 border border-blue-200/80 space-y-1">
                  <div className="flex items-center gap-1.5 text-blue-800 font-black text-xs">
                    <span>⭐</span>
                    <span>Handpicked Matches</span>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-snug">
                    Pre-screened verified profiles meeting your exact cultural criteria.
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-emerald-50/60 border border-emerald-200/80 space-y-1">
                  <div className="flex items-center gap-1.5 text-emerald-800 font-black text-xs">
                    <span>🤝</span>
                    <span>Family Introductions</span>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-snug">
                    End-to-end coordination of meetings, video calls, & Kundali Milan.
                  </p>
                </div>
              </div>

              {/* Logged-In User Verified Information Box */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                    Your Registered Profile Information
                  </span>
                  <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                    <FontAwesomeIcon icon={faCheck} className="text-[9px]" /> Verified Account
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[10px] font-semibold">Full Name:</span>
                    <span className="font-bold text-slate-900">{displayName}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] font-semibold">Registered Mobile:</span>
                    <span className={`font-bold ${registeredPhone ? 'text-[#5D34F7]' : 'text-rose-600'}`}>
                      {registeredPhone || '⚠️ Not provided in profile'}
                    </span>
                  </div>
                  {userEmail && (
                    <div>
                      <span className="text-slate-400 block text-[10px] font-semibold">Email:</span>
                      <span className="font-medium text-slate-700 truncate block">{userEmail}</span>
                    </div>
                  )}
                  {displayId && (
                    <div>
                      <span className="text-slate-400 block text-[10px] font-semibold">Matrimony ID:</span>
                      <span className="font-mono font-bold text-slate-700">{displayId}</span>
                    </div>
                  )}
                </div>

                <p className="text-[11px] text-slate-500 font-medium leading-relaxed pt-1 border-t border-slate-200/60">
                  Your enquiry will automatically be submitted using your authenticated matrimony profile so our senior consultant can evaluate your compatibility criteria.
                </p>
              </div>

              {/* Error Message Banner */}
              {errorMsg && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold flex items-start gap-2">
                  <FontAwesomeIcon icon={faExclamationCircle} className="text-rose-600 mt-0.5 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Submission Form */}
              <form onSubmit={handleGetInvited} className="space-y-4">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700">
                    Special Partner Expectations or Preferences (Optional)
                  </label>
                  <textarea
                    rows={3}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="e.g. Desired community, profession, education, location, or horoscope requirements..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-400/40 focus:border-amber-400 transition resize-none"
                  />
                </div>

                <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <span className="text-[11px] text-slate-500 font-medium flex items-center gap-1.5">
                    <FontAwesomeIcon icon={faShieldAlt} className="text-amber-600" />
                    Strictly confidential & non-binding
                  </span>

                  <button
                    type="submit"
                    disabled={submitting || !registeredPhone}
                    className="w-full sm:w-auto px-7 py-3 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-amber-500/25 transition cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50 active:scale-95 border border-amber-300"
                  >
                    {submitting ? (
                      <>
                        <FontAwesomeIcon icon={faSpinner} spin className="text-sm" />
                        <span>Submitting Request...</span>
                      </>
                    ) : (
                      <>
                        <FontAwesomeIcon icon={faCrown} className="text-xs" />
                        <span>Get Invited Now</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 font-medium px-6 shrink-0">
          <div className="flex items-center gap-1.5">
            <FontAwesomeIcon icon={faShieldAlt} className="text-emerald-600" />
            <span>VIP Familiess Assisted Matchmaking</span>
          </div>
          <span>Helpline: {OFFICIAL_VIP_SUPPORT_PHONE}</span>
        </div>

      </div>
    </div>
  );
}
