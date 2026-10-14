import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faPhone,
  faLock,
  faUnlock,
  faSpinner,
  faCrown,
  faCalendarTimes,
  faTimes,
  faExclamationCircle,
  faCheckCircle
} from '@fortawesome/free-solid-svg-icons';
import api from '../api/axios';
import {
  maskPhone,
  maskEmail,
  saveCachedUnlockedContact
} from '../utils/contactManager';

export default function ContactInfoCard({
  targetUser,
  isPremium,
  onCall,
  unlockedMap = {},
  onUnlockSuccess,
  className = ''
}) {
  const navigate = useNavigate();
  const [isUnlocking, setIsUnlocking] = useState(false);
  const [limitModal, setLimitModal] = useState({
    isOpen: false,
    type: '', // 'daily' | 'plan' | 'upgrade' | 'error'
    title: '',
    message: ''
  });

  if (!targetUser) return null;

  const targetId = targetUser._id || targetUser.id;
  const cached = unlockedMap[targetId?.toString()];

  // Unlocked if in parent map, or if backend sent phone directly and user is marked contacted
  const isUnlocked = Boolean(
    cached?.phone ||
    (targetUser.hasContacted && (targetUser.phone || cached)) ||
    (isPremium && targetUser.phone)
  );

  const displayPhone = isUnlocked
    ? (cached?.phone || targetUser.phone)
    : maskPhone(targetUser.phone, targetUser.countryCode || '+91');

  const displayEmail = isUnlocked
    ? (cached?.email || targetUser.email)
    : maskEmail(targetUser.email);

  const handleUnlockContact = async (e) => {
    if (e) e.stopPropagation();

    // 1. If not premium, direct to membership plans
    if (!isPremium) {
      navigate('/plans');
      return;
    }

    if (isUnlocked || isUnlocking) return;

    setIsUnlocking(true);
    try {
      // Call backend POST /api/users/contact/:id
      await api.post(`/users/contact/${targetId}`);

      // Fetch unmasked contact details from /users/contacts-viewed
      let unmaskedPhone = targetUser.phone || '';
      let unmaskedEmail = targetUser.email || '';

      try {
        const viewedRes = await api.get('/users/contacts-viewed');
        const profiles = viewedRes.data || [];
        const found = profiles.find(
          (p) => (p._id || p.contacted?._id)?.toString() === targetId?.toString()
        );
        if (found) {
          unmaskedPhone = found.phone || found.contacted?.phone || unmaskedPhone;
          unmaskedEmail = found.email || found.contacted?.email || unmaskedEmail;
        }
      } catch (fetchErr) {
        console.warn('Could not refresh contacts-viewed list:', fetchErr);
      }

      // If still missing (e.g. backend populates it on profile fetch)
      if (!unmaskedPhone) {
        try {
          const profRes = await api.get(`/users/profile/${targetId}`);
          if (profRes.data?.phone) {
            unmaskedPhone = profRes.data.phone;
          }
          if (profRes.data?.email) {
            unmaskedEmail = profRes.data.email;
          }
        } catch (pErr) {
          console.warn('Could not fetch single profile:', pErr);
        }
      }

      const unlockedData = {
        phone: unmaskedPhone || targetUser.phone || 'Contact Revealed',
        email: unmaskedEmail || targetUser.email || '',
        countryCode: targetUser.countryCode || '+91'
      };

      // Save to sessionStorage cache so it stays permanently unlocked
      saveCachedUnlockedContact(targetId, unlockedData);

      if (onUnlockSuccess) {
        onUnlockSuccess(targetId, unlockedData);
      }
    } catch (err) {
      const status = err.response?.status;
      const msg = err.response?.data?.message || err.message || 'Error unlocking contact';

      if (status === 403) {
        const lower = msg.toLowerCase();
        if (lower.includes('daily') || lower.includes('tomorrow')) {
          setLimitModal({
            isOpen: true,
            type: 'daily',
            title: 'Daily Contact Limit Reached',
            message: msg || 'You have reached your daily limit of 5 contact views. Please try again tomorrow.'
          });
        } else if (lower.includes('plan') || lower.includes('total') || lower.includes('addon') || lower.includes('limit')) {
          setLimitModal({
            isOpen: true,
            type: 'plan',
            title: 'Plan Contact Limit Reached',
            message: msg || 'You have reached your plan total contact view limit. Upgrade your plan or purchase an add-on to view more contacts.'
          });
        } else {
          setLimitModal({
            isOpen: true,
            type: 'upgrade',
            title: 'Membership Required',
            message: msg || 'Contact details are available only to eligible paid members.'
          });
        }
      } else {
        setLimitModal({
          isOpen: true,
          type: 'error',
          title: 'Unable to View Contact',
          message: msg
        });
      }
    } finally {
      setIsUnlocking(false);
    }
  };

  const handleCallClick = (e) => {
    if (e) e.stopPropagation();
    if (targetUser.settings?.allowVoiceAndVideoCalls === false) {
      alert('This member has disabled incoming calls.');
      return;
    }
    if (onCall) {
      onCall(
        displayPhone,
        targetUser.name || targetUser.profile?.name || 'Member',
        targetUser.photo || (targetUser.profile?.photos && targetUser.profile.photos[0])
      );
    }
  };

  return (
    <>
      <div
        className={`bg-emerald-50/80 rounded-2xl p-4 border border-emerald-200/80 flex items-center justify-between gap-3 shadow-xs ${className}`}
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-1">
            <h4 className="text-[11px] font-black uppercase tracking-wider text-emerald-700 flex items-center gap-1">
              {isUnlocked ? (
                <>
                  <FontAwesomeIcon icon={faCheckCircle} className="text-emerald-600 text-xs" />
                  <span>Contact Details</span>
                </>
              ) : (
                <>
                  <FontAwesomeIcon icon={faLock} className="text-amber-500 text-xs" />
                  <span>Contact Details</span>
                  <span className="text-[9px] font-bold text-amber-600 bg-amber-100/70 px-1.5 py-0.5 rounded-full ml-1">
                    5 Digits Shown
                  </span>
                </>
              )}
            </h4>
          </div>

          {/* Masked / Unmasked Phone */}
          <div
            onClick={isUnlocked ? handleCallClick : handleUnlockContact}
            className={`font-extrabold text-sm truncate flex items-center gap-1.5 transition ${
              isUnlocked
                ? 'text-emerald-950 hover:underline cursor-pointer'
                : 'text-emerald-800/90 cursor-pointer select-none'
            }`}
            title={isUnlocked ? 'Click to Call' : 'Click to unlock full phone number'}
          >
            <span>📞</span>
            <span className="tracking-wide">{displayPhone}</span>
          </div>

          {/* Masked / Unmasked Email */}
          <div className="text-emerald-800/80 font-bold text-xs mt-0.5 truncate flex items-center gap-1.5 select-none">
            <span>✉️</span>
            <span>{displayEmail}</span>
          </div>
        </div>

        {/* Action Button */}
        {!isPremium ? (
          <button
            onClick={() => navigate('/plans')}
            className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-extrabold px-3.5 py-2 rounded-xl transition shadow-md whitespace-nowrap text-xs cursor-pointer shrink-0 flex items-center gap-1.5 active:scale-95"
          >
            <FontAwesomeIcon icon={faCrown} className="text-xs" />
            <span>View Details</span>
          </button>
        ) : !isUnlocked ? (
          <button
            disabled={isUnlocking}
            onClick={handleUnlockContact}
            className="bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white font-black px-3.5 py-2 rounded-xl transition shadow-md whitespace-nowrap text-xs cursor-pointer shrink-0 flex items-center gap-1.5 active:scale-95 disabled:opacity-50"
            title="Unlock contact details and reveal full number"
          >
            {isUnlocking ? (
              <>
                <FontAwesomeIcon icon={faSpinner} spin className="text-xs" />
                <span>Unlocking...</span>
              </>
            ) : (
              <>
                <FontAwesomeIcon icon={faUnlock} className="text-xs" />
                <span>Unlock Contact</span>
              </>
            )}
          </button>
        ) : (
          <button
            onClick={handleCallClick}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl transition cursor-pointer flex items-center gap-1.5 shadow-sm active:scale-95 shrink-0"
            title="Call this member"
          >
            <FontAwesomeIcon icon={faPhone} className="text-xs" />
            <span>Call</span>
          </button>
        )}
      </div>

      {/* Limit Modal Popup */}
      {limitModal.isOpen && (
        <div
          className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200 cursor-pointer"
          onClick={() => setLimitModal({ ...limitModal, isOpen: false })}
        >
          <div
            className="bg-white rounded-[26px] max-w-sm w-full p-6 shadow-2xl border border-slate-100 relative cursor-default space-y-4 text-center animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setLimitModal({ ...limitModal, isOpen: false })}
              className="absolute top-4 right-4 w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition cursor-pointer"
            >
              <FontAwesomeIcon icon={faTimes} className="text-xs" />
            </button>

            <div className="w-16 h-16 rounded-full mx-auto flex items-center justify-center mb-1">
              {limitModal.type === 'daily' ? (
                <div className="w-16 h-16 rounded-full bg-amber-100/80 text-amber-600 flex items-center justify-center text-2xl shadow-inner">
                  <FontAwesomeIcon icon={faCalendarTimes} />
                </div>
              ) : limitModal.type === 'plan' ? (
                <div className="w-16 h-16 rounded-full bg-purple-100/80 text-[#5D34F7] flex items-center justify-center text-2xl shadow-inner">
                  <FontAwesomeIcon icon={faCrown} />
                </div>
              ) : (
                <div className="w-16 h-16 rounded-full bg-rose-100/80 text-rose-600 flex items-center justify-center text-2xl shadow-inner">
                  <FontAwesomeIcon icon={faExclamationCircle} />
                </div>
              )}
            </div>

            <div className="space-y-1">
              <h3 className="text-lg font-black text-slate-900 tracking-tight">
                {limitModal.title}
              </h3>
              <p className="text-slate-600 text-xs font-medium leading-relaxed px-2">
                {limitModal.message}
              </p>
            </div>

            <div className="pt-2 flex flex-col gap-2">
              {limitModal.type === 'plan' || limitModal.type === 'upgrade' ? (
                <button
                  onClick={() => {
                    setLimitModal({ ...limitModal, isOpen: false });
                    navigate('/plans');
                  }}
                  className="w-full py-3 bg-gradient-to-r from-[#5D34F7] to-[#4024DB] hover:from-[#4d25d0] hover:to-[#381fcc] text-white font-black rounded-xl text-xs shadow-md transition active:scale-95 cursor-pointer flex items-center justify-center gap-2"
                >
                  <FontAwesomeIcon icon={faCrown} />
                  <span>Upgrade Membership</span>
                </button>
              ) : null}

              <button
                onClick={() => setLimitModal({ ...limitModal, isOpen: false })}
                className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold rounded-xl text-xs transition cursor-pointer"
              >
                {limitModal.type === 'plan' ? 'Maybe Later' : 'Got It'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
