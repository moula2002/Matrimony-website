import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faPhone,
  faEnvelope,
  faLock,
  faUnlock,
  faSpinner,
  faCrown,
  faCalendarTimes,
  faTimes,
  faExclamationCircle,
  faCheckCircle,
  faCommentDots,
  faUserShield
} from '@fortawesome/free-solid-svg-icons';
import api from '../api/axios';
import {
  maskPhone,
  maskEmail,
  getCachedUnlockedContacts,
  saveCachedUnlockedContact,
  getTodayDailyContactViews,
  recordDailyContactView,
  DAILY_CONTACT_LIMIT
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
  const [dailyStats, setDailyStats] = useState(getTodayDailyContactViews());
  const [limitModal, setLimitModal] = useState({
    isOpen: false,
    type: '', // 'daily' | 'plan' | 'upgrade' | 'privacy' | 'error'
    title: '',
    message: ''
  });

  // Refresh daily stats on mount and whenever contacts are unlocked
  useEffect(() => {
    const updateStats = () => setDailyStats(getTodayDailyContactViews());
    updateStats();
    window.addEventListener('contact-unlocked', updateStats);
    return () => window.removeEventListener('contact-unlocked', updateStats);
  }, []);

  if (!targetUser) return null;

  const targetId = targetUser._id || targetUser.id;
  const targetIdStr = targetId?.toString();
  const cached = unlockedMap[targetIdStr] || getCachedUnlockedContacts()[targetIdStr];

  const userPhone = targetUser.phone || targetUser.profile?.phone;
  const userEmail = targetUser.email || targetUser.profile?.email;
  const userCountryCode = targetUser.countryCode || targetUser.profile?.countryCode || '+91';

  // Check if receiver has "Show Phone Number Only After Matched" enabled (Feature 21)
  const showOnlyAfterMatch = Boolean(
    targetUser.settings?.showPhoneAfterMatch ||
    targetUser.profile?.privacyContact === 'accepted' ||
    targetUser.privacyContact === 'accepted'
  );

  const isMatchedWithUser = Boolean(
    targetUser.isMatched ||
    targetUser.interestStatus === 'accepted' ||
    targetUser.status === 'accepted' ||
    targetUser.hasAcceptedInterest ||
    targetUser.mutualMatch
  );

  // If setting is enabled and not matched, phone is restricted by privacy
  const isBlockedByMatchPrivacy = showOnlyAfterMatch && !isMatchedWithUser;

  // Unlocked if in cached map, or if profile already marked contacted, or if unmasked phone provided
  const isUnlocked = Boolean(
    !isBlockedByMatchPrivacy && (
      cached?.phone ||
      targetUser.hasContacted ||
      targetUser.isContacted ||
      targetUser.contacted ||
      (isPremium && userPhone && !userPhone.includes('•') && !userPhone.includes('X'))
    )
  );

  const displayPhone = isUnlocked
    ? (cached?.phone || userPhone)
    : isBlockedByMatchPrivacy
    ? 'Visible Only After Match'
    : maskPhone(userPhone, userCountryCode);

  const displayEmail = isUnlocked
    ? (cached?.email || userEmail)
    : maskEmail(userEmail);

  // Communication Permissions (Feature 11)
  // Receiver status
  const targetIsPremium = Boolean(
    targetUser.premiumMembership?.isPremium ||
    targetUser.profile?.premiumMembership?.isPremium
  );

  // Premium Sender can call Free or Premium; Free Sender cannot call anyone
  const canMakeCall = Boolean(isPremium);

  // Premium and Free can chat in both directions; Free-to-Free messaging blocked
  const canSendChat = Boolean(isPremium || targetIsPremium);

  const handleUnlockContact = async (e) => {
    if (e) e.stopPropagation();

    // 1. If not premium, direct to membership plans
    if (!isPremium) {
      navigate('/plans');
      return;
    }

    // 2. If privacy setting restricts contact until match
    if (isBlockedByMatchPrivacy) {
      setLimitModal({
        isOpen: true,
        type: 'privacy',
        title: 'Phone Number Privacy Protected',
        message: 'This member has enabled "Show Phone Number Only After Matched". Their direct contact number will become visible automatically as soon as your mutual connection request is accepted.'
      });
      return;
    }

    // 3. Daily viewing limit enforcement (Feature 1: 5 contacts/day)
    const currentStats = getTodayDailyContactViews();
    if (currentStats.isLimitReached && !isUnlocked) {
      setLimitModal({
        isOpen: true,
        type: 'daily',
        title: 'Daily Contact Limit Reached',
        message: `You have viewed your maximum allowance of ${DAILY_CONTACT_LIMIT} contacts for today. Your daily limit will reset tomorrow at midnight.`
      });
      return;
    }

    // 4. Prevent duplicate calls if already unlocked or currently in progress
    if (isUnlocked || isUnlocking) return;

    setIsUnlocking(true);
    try {
      // Call backend POST /api/users/contact/:id
      const res = await api.post(`/users/contact/${targetId}`);

      // Record this unlock in daily tracking
      recordDailyContactView(targetId);
      setDailyStats(getTodayDailyContactViews());

      // Extract phone & email from response or fallback to /users/contacts-viewed
      let unmaskedPhone = res.data?.phone || targetUser.phone || '';
      let unmaskedEmail = res.data?.email || targetUser.email || '';

      try {
        const viewedRes = await api.get('/users/contacts-viewed');
        const profiles = viewedRes.data || [];
        const found = profiles.find(
          (p) => (p._id || p.contacted?._id)?.toString() === targetIdStr
        );
        if (found) {
          unmaskedPhone = found.phone || found.contacted?.phone || unmaskedPhone;
          unmaskedEmail = found.email || found.contacted?.email || unmaskedEmail;
        }
      } catch (fetchErr) {
        console.warn('Could not refresh contacts-viewed list:', fetchErr);
      }

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

      const p = targetUser.profile || {};
      const unlockedData = {
        phone: unmaskedPhone || userPhone || 'Contact Revealed',
        email: unmaskedEmail || userEmail || '',
        countryCode: userCountryCode,
        name: p.name || targetUser.name || 'Member',
        photo: p.photos?.[0] || targetUser.photos?.[0] || null,
        gender: p.gender || targetUser.gender || 'Male',
        unlockedAt: new Date().toISOString()
      };

      // Save to localStorage/sessionStorage cache permanently
      saveCachedUnlockedContact(targetId, unlockedData);

      // Mark user as contacted
      targetUser.hasContacted = true;
      targetUser.contacted = true;

      if (onUnlockSuccess) {
        onUnlockSuccess(targetId, unlockedData);
      }
    } catch (err) {
      const status = err.response?.status;
      const msg = err.response?.data?.message || err.message || 'Error unlocking contact';

      if (status === 403) {
        const lower = msg.toLowerCase();
        if (lower.includes('daily') || lower.includes('tomorrow') || lower.includes('limit reached')) {
          setLimitModal({
            isOpen: true,
            type: 'daily',
            title: 'Daily Contact Limit Reached',
            message: msg || `You have reached your daily limit of ${DAILY_CONTACT_LIMIT} contacts. Please try again tomorrow.`
          });
        } else if (lower.includes('plan') || lower.includes('total') || lower.includes('addon') || lower.includes('limit')) {
          setLimitModal({
            isOpen: true,
            type: 'plan',
            title: 'Plan Contact Limit Reached',
            message: msg || 'You have reached your plan total contacts limit. Upgrade your plan or purchase an add-on to view more contacts.'
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
    if (!canMakeCall) {
      setLimitModal({
        isOpen: true,
        type: 'upgrade',
        title: 'Upgrade to Call Members',
        message: 'In-app voice and phone calling is available exclusively to Premium members. Upgrade your plan to call this member.'
      });
      return;
    }
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

  const handleChatClick = (e) => {
    if (e) e.stopPropagation();
    if (!canSendChat) {
      setLimitModal({
        isOpen: true,
        type: 'upgrade',
        title: 'Upgrade to Start Conversation',
        message: 'Messaging between two Free members is restricted. Either you or the member must have an active Premium membership to chat directly.'
      });
      return;
    }
    navigate('/messages', { state: { contactId: targetId } });
  };

  return (
    <>
      {/* Entire box is clickable to reveal contact details */}
      <div
        onClick={isUnlocked ? undefined : handleUnlockContact}
        className={`bg-emerald-50/90 rounded-2xl p-4 border transition-all duration-200 flex flex-wrap items-center justify-between gap-3 shadow-xs select-none ${
          isUnlocked
            ? 'border-emerald-200/90'
            : isBlockedByMatchPrivacy
            ? 'border-amber-200 bg-amber-50/40 cursor-pointer'
            : 'border-emerald-300 hover:border-emerald-400 hover:bg-emerald-50 hover:shadow-md cursor-pointer group/box'
        } ${className}`}
        title={
          isUnlocked
            ? undefined
            : isBlockedByMatchPrivacy
            ? 'Phone number visible after mutual match'
            : 'Click anywhere on this box to reveal full contact details'
        }
      >
        {isUnlocking ? (
          <div className="w-full flex items-center justify-center gap-2.5 py-3 text-emerald-800 font-bold text-xs animate-pulse">
            <FontAwesomeIcon icon={faSpinner} spin className="text-emerald-600 text-sm" />
            <span>Revealing full contact details...</span>
          </div>
        ) : (
          <>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 mb-1.5 flex-wrap">
                <h4 className="text-[11px] font-black uppercase tracking-wider text-emerald-700 flex items-center gap-1.5 flex-wrap">
                  {isUnlocked ? (
                    <>
                      <FontAwesomeIcon icon={faCheckCircle} className="text-emerald-600 text-xs" />
                      <span className="text-emerald-900 font-extrabold">Contacted</span>
                      <span className="text-[9px] font-black uppercase tracking-wider text-emerald-800 bg-emerald-100/90 border border-emerald-200/80 px-2 py-0.5 rounded-full ml-1 shadow-2xs">
                        Details Revealed
                      </span>
                    </>
                  ) : isBlockedByMatchPrivacy ? (
                    <>
                      <FontAwesomeIcon icon={faUserShield} className="text-amber-600 text-xs" />
                      <span className="text-amber-800">Privacy Restricted</span>
                      <span className="text-[9px] font-black uppercase tracking-wider text-amber-800 bg-amber-100 border border-amber-300 px-2 py-0.5 rounded-full ml-1">
                        Visible on Match
                      </span>
                    </>
                  ) : (
                    <>
                      <FontAwesomeIcon icon={faLock} className="text-amber-500 text-xs group-hover/box:scale-110 transition-transform" />
                      <span>Contact Details</span>
                      <span className="text-[9px] font-black uppercase tracking-wider text-amber-700 bg-amber-100 border border-amber-200 px-2 py-0.5 rounded-full ml-1">
                        Click Box to Reveal
                      </span>
                    </>
                  )}
                </h4>

                {/* Feature 1: Daily Limit Badge (5 contacts/day for paid users) */}
                {isPremium && (
                  <span
                    className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full border shadow-2xs ${
                      dailyStats.isLimitReached
                        ? 'bg-rose-100 text-rose-800 border-rose-300 animate-pulse'
                        : 'bg-emerald-100/90 text-emerald-800 border-emerald-300'
                    }`}
                    title={`Daily allowance: ${DAILY_CONTACT_LIMIT} contacts per day`}
                  >
                    Daily Limit: {dailyStats.viewedCount}/{dailyStats.limit} ({dailyStats.remainingCount} Left)
                  </span>
                )}
              </div>

              {/* Phone Display (Masked / Unmasked / Match Restricted) */}
              <div
                onClick={isUnlocked ? handleCallClick : undefined}
                className={`font-black text-sm truncate flex items-center gap-2 transition ${
                  isUnlocked
                    ? 'text-emerald-950 hover:underline cursor-pointer'
                    : isBlockedByMatchPrivacy
                    ? 'text-amber-900/90 font-medium italic'
                    : 'text-emerald-900/90'
                }`}
                title={
                  isUnlocked
                    ? 'Click to Call'
                    : isBlockedByMatchPrivacy
                    ? 'Phone number visible only after mutual match'
                    : 'Click box to reveal full number'
                }
              >
                <FontAwesomeIcon
                  icon={faPhone}
                  className={`text-xs ${
                    isUnlocked ? 'text-emerald-600' : isBlockedByMatchPrivacy ? 'text-amber-500' : 'text-amber-600'
                  }`}
                />
                <span className="tracking-wide font-mono font-bold">{displayPhone}</span>
              </div>

              {/* Email Display (Masked / Unmasked) */}
              <div className="text-emerald-800/80 font-bold text-xs mt-1 truncate flex items-center gap-2">
                <FontAwesomeIcon icon={faEnvelope} className="text-xs text-emerald-600/70" />
                <span className="truncate">{displayEmail}</span>
              </div>
            </div>

            {/* Right Action Controls */}
            {!isPremium ? (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate('/plans');
                }}
                className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-extrabold px-3.5 py-2 rounded-xl transition shadow-md whitespace-nowrap text-xs cursor-pointer shrink-0 flex items-center gap-1.5 active:scale-95"
              >
                <FontAwesomeIcon icon={faCrown} className="text-xs" />
                <span>View Details</span>
              </button>
            ) : isBlockedByMatchPrivacy ? (
              <button
                type="button"
                onClick={handleUnlockContact}
                className="bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 font-extrabold px-3 py-2 rounded-xl transition text-xs whitespace-nowrap shrink-0 flex items-center gap-1.5 cursor-pointer active:scale-95"
              >
                <FontAwesomeIcon icon={faUserShield} className="text-xs text-amber-700" />
                <span>Match Required</span>
              </button>
            ) : !isUnlocked ? (
              <button
                type="button"
                disabled={isUnlocking}
                onClick={handleUnlockContact}
                className="bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white font-black px-3.5 py-2 rounded-xl transition shadow-md whitespace-nowrap text-xs cursor-pointer shrink-0 flex items-center gap-1.5 active:scale-95 disabled:opacity-50"
                title="Reveal complete contact details"
              >
                <FontAwesomeIcon icon={faUnlock} className="text-xs" />
                <span>Reveal Contact</span>
              </button>
            ) : (
              <div className="flex items-center gap-1.5 shrink-0" onClick={(e) => e.stopPropagation()}>
                {/* Chat button */}
                <button
                  type="button"
                  onClick={handleChatClick}
                  className="px-3 py-2 bg-[#5D34F7] hover:bg-[#4024DB] text-white font-black text-xs rounded-xl transition cursor-pointer flex items-center gap-1.5 shadow-sm active:scale-95 shrink-0"
                  title={canSendChat ? "Chat with member" : "Upgrade to Chat"}
                >
                  <FontAwesomeIcon icon={faCommentDots} className="text-xs" />
                  <span>Chat</span>
                </button>

                {/* Call button */}
                <button
                  type="button"
                  onClick={handleCallClick}
                  className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl transition cursor-pointer flex items-center gap-1.5 shadow-sm active:scale-95 shrink-0"
                  title={canMakeCall ? "Call this member" : "Upgrade to Call"}
                >
                  <FontAwesomeIcon icon={faPhone} className="text-xs" />
                  <span>Call</span>
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Limit & Privacy Modal Popup */}
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
              ) : limitModal.type === 'privacy' ? (
                <div className="w-16 h-16 rounded-full bg-indigo-100/80 text-[#5D34F7] flex items-center justify-center text-2xl shadow-inner">
                  <FontAwesomeIcon icon={faUserShield} />
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
