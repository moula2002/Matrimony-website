import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faCog, faUserShield, faBell, faKey, faCrown, faTrashAlt, 
  faCheck, faSpinner, faEye, faLock, faSlidersH, faShieldAlt, faPhoneSlash,
  faEyeSlash, faClock, faUndo, faExclamationTriangle
} from '@fortawesome/free-solid-svg-icons';
import api from '../api/axios';

export default function Settings() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [privacyError, setPrivacyError] = useState('');
  
  // Settings Form State
  const [privacyPhoto, setPrivacyPhoto] = useState('everyone');
  const [privacyContact, setPrivacyContact] = useState('everyone');
  const [showPhoneAfterMatch, setShowPhoneAfterMatch] = useState(false);
  const [allowIncomingCalls, setAllowIncomingCalls] = useState(true);
  const [hidePhoneNumber, setHidePhoneNumber] = useState(false);
  const [isProfileHidden, setIsProfileHidden] = useState(false);
  const [hideStartDate, setHideStartDate] = useState(null);
  const [hideEndDate, setHideEndDate] = useState(null);
  const [isHiding, setIsHiding] = useState(false);
  const [isUnhiding, setIsUnhiding] = useState(false);
  const [hideActionMessage, setHideActionMessage] = useState('');
  const [hideActionError, setHideActionError] = useState('');

  const [emailNotif, setEmailNotif] = useState(true);
  const [pushNotif, setPushNotif] = useState(true);
  const [smsNotif, setSmsNotif] = useState(false);
  
  // Password State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passError, setPassError] = useState('');
  const [passSuccess, setPassSuccess] = useState('');

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setLoading(true);
        const res = await api.get('/users/profile');
        setProfile(res.data);
        const p = res.data?.profile || {};
        const s = res.data?.settings || {};

        if (p.privacyPhoto) {
          setPrivacyPhoto(p.privacyPhoto);
        } else if (s.hidePhotos) {
          setPrivacyPhoto('accepted');
        }

        if (p.privacyContact) {
          setPrivacyContact(p.privacyContact);
        } else if (s.showPhoneAfterMatch) {
          setPrivacyContact('accepted');
        }

        setShowPhoneAfterMatch(Boolean(s.showPhoneAfterMatch || p.privacyContact === 'accepted'));

        if (s.allowVoiceAndVideoCalls !== undefined) {
          setAllowIncomingCalls(s.allowVoiceAndVideoCalls);
        }
        if (s.hidePhoneNumber !== undefined) {
          setHidePhoneNumber(s.hidePhoneNumber);
        }
        if (s.isProfileHidden !== undefined) {
          setIsProfileHidden(Boolean(s.isProfileHidden));
        }
        if (s.hideStartDate) {
          setHideStartDate(s.hideStartDate);
        }
        if (s.hideEndDate) {
          setHideEndDate(s.hideEndDate);
        }
      } catch (err) {
        console.error('Error fetching settings:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleSavePrivacy = async () => {
    setSaving(true);
    setMessage('');
    setPrivacyError('');
    try {
      const hidePhotosVal = privacyPhoto === 'accepted';
      const showPhoneAfterMatchVal = Boolean(showPhoneAfterMatch || privacyContact === 'accepted');

      // Preserve existing profile data and photos to prevent accidental reset (Feature 4)
      const existingProfile = profile?.profile || {};
      const existingPhotos = Array.isArray(existingProfile.photos) ? existingProfile.photos : [];

      await api.put('/users/profile', {
        profile: {
          ...existingProfile,
          photos: existingPhotos,
          privacyPhoto,
          privacyContact: showPhoneAfterMatchVal ? 'accepted' : privacyContact
        },
        settings: {
          allowVoiceAndVideoCalls: allowIncomingCalls,
          hidePhotos: hidePhotosVal,
          showPhoneAfterMatch: showPhoneAfterMatchVal,
          hidePhoneNumber: hidePhoneNumber,
          isProfileHidden: isProfileHidden
        }
      });
      setMessage('Privacy settings updated successfully!');
      setTimeout(() => setMessage(''), 4000);
    } catch (err) {
      console.error('Failed to update privacy settings:', err);
      setPrivacyError(err.response?.data?.message || 'Failed to update privacy settings. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  // Feature 3: Temporary Account Deactivation (Hide Profile)
  const handleHideProfile = async () => {
    setIsHiding(true);
    setHideActionMessage('');
    setHideActionError('');
    try {
      const res = await api.post('/users/hide-profile');
      setIsProfileHidden(true);
      const s = res.data?.settings || res.data || {};
      if (s.hideStartDate) setHideStartDate(s.hideStartDate);
      if (s.hideEndDate) setHideEndDate(s.hideEndDate);
      setHideActionMessage('Your profile is now temporarily deactivated (hidden). Other members cannot discover your profile.');
      setTimeout(() => setHideActionMessage(''), 5000);
    } catch (err) {
      // Fallback to updating profile settings if hide endpoint handles via put
      try {
        await api.put('/users/profile', {
          settings: {
            isProfileHidden: true,
            hideStartDate: new Date().toISOString(),
            hideEndDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
          }
        });
        setIsProfileHidden(true);
        setHideStartDate(new Date().toISOString());
        setHideEndDate(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString());
        setHideActionMessage('Your profile is now temporarily deactivated (hidden). Other members cannot discover your profile.');
        setTimeout(() => setHideActionMessage(''), 5000);
      } catch (fallbackErr) {
        setHideActionError(err.response?.data?.message || 'Failed to hide profile. Please try again.');
      }
    } finally {
      setIsHiding(false);
    }
  };

  // Feature 3: Reactivate Profile
  const handleUnhideProfile = async () => {
    setIsUnhiding(true);
    setHideActionMessage('');
    setHideActionError('');
    try {
      await api.post('/users/unhide-profile');
      setIsProfileHidden(false);
      setHideStartDate(null);
      setHideEndDate(null);
      setHideActionMessage('Welcome back! Your profile is now active and visible to prospective partners.');
      setTimeout(() => setHideActionMessage(''), 5000);
    } catch (err) {
      try {
        await api.put('/users/profile', {
          settings: {
            isProfileHidden: false,
            hideStartDate: null,
            hideEndDate: null
          }
        });
        setIsProfileHidden(false);
        setHideStartDate(null);
        setHideEndDate(null);
        setHideActionMessage('Welcome back! Your profile is now active and visible to prospective partners.');
        setTimeout(() => setHideActionMessage(''), 5000);
      } catch (fallbackErr) {
        setHideActionError(err.response?.data?.message || 'Failed to reactivate profile.');
      }
    } finally {
      setIsUnhiding(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPassError('');
    setPassSuccess('');
    if (newPassword !== confirmPassword) {
      setPassError('New passwords do not match');
      return;
    }
    setSaving(true);
    try {
      await api.put('/users/profile', {
        password: newPassword
      });
      setPassSuccess('Password changed successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setPassError(err.response?.data?.message || 'Failed to update password');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-transparent">
        <FontAwesomeIcon icon={faSpinner} className="animate-spin text-[#5D34F7] text-4xl" />
      </div>
    );
  }

  const isPremium = profile?.premiumMembership?.isPremium || false;

  // Female Free Plan Eligibility:
  // Female users (Free Plan or Premium) are granted complimentary, unrestricted access to privacy settings.
  const isFemale = (() => {
    const gender = String(profile?.profile?.gender || profile?.gender || '').toLowerCase().trim();
    return gender === 'female' || gender === 'f' || gender === 'bride' || gender === 'woman';
  })();

  const canEditPrivacy = isPremium || isFemale;

  // Calculate remaining hide duration (Feature 3)
  const remainingHideDays = (() => {
    if (!hideEndDate) return 7;
    const end = new Date(hideEndDate).getTime();
    const now = Date.now();
    const diffDays = Math.ceil((end - now) / (1000 * 60 * 60 * 24));
    return Math.max(1, diffDays);
  })();

  return (
    <div className="bg-transparent min-h-screen py-8 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto lg:mx-0 lg:ml-6 xl:ml-10 space-y-6 lg:px-8">
        
        {/* Header Section */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-3">
              <svg className="w-8 h-8 drop-shadow-sm shrink-0" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="3" y="3" width="18" height="18" rx="5" fill="url(#settings_grad)" />
                <path d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z" stroke="white" strokeWidth="1.8" />
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" stroke="white" strokeWidth="1.8" />
                <defs>
                  <linearGradient id="settings_grad" x1="3" y1="3" x2="21" y2="21" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#5D34F7" />
                    <stop offset="1" stopColor="#805CFF" />
                  </linearGradient>
                </defs>
              </svg>
              <span>Account Settings</span>
            </h1>
            <p className="text-slate-400 text-xs font-bold uppercase mt-1 tracking-wider">
              Manage your profile privacy, preferences, and security controls
            </p>
          </div>
        </div>

        {/* Temporary Profile Deactivation Banner (Feature 3) */}
        {isProfileHidden && (
          <div className="bg-amber-50 border-2 border-amber-300 rounded-3xl p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4 animate-in fade-in duration-300">
            <div className="flex items-start gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center text-xl shrink-0">
                <FontAwesomeIcon icon={faEyeSlash} />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-base font-black text-amber-900">
                    Profile Currently Hidden (Temporarily Deactivated)
                  </h3>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-amber-200 text-amber-900">
                    {remainingHideDays} Days Remaining
                  </span>
                </div>
                <p className="text-xs text-amber-800 font-medium leading-relaxed max-w-2xl">
                  Your profile is temporarily hidden from searches, feed, and partner recommendations. You can still browse matches and manage your account. While hidden, sending new interests is paused.
                </p>
                {hideEndDate && (
                  <p className="text-[11px] text-amber-700 font-bold flex items-center gap-1.5 pt-0.5">
                    <FontAwesomeIcon icon={faClock} className="text-[10px]" />
                    <span>Auto-reactivates on: {new Date(hideEndDate).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</span>
                  </p>
                )}
              </div>
            </div>

            <button
              type="button"
              disabled={isUnhiding}
              onClick={handleUnhideProfile}
              className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-black text-xs rounded-xl shadow-md transition active:scale-95 cursor-pointer whitespace-nowrap flex items-center gap-2 shrink-0 disabled:opacity-50"
            >
              {isUnhiding ? <FontAwesomeIcon icon={faSpinner} spin /> : <FontAwesomeIcon icon={faUndo} />}
              <span>Reactivate Profile Now</span>
            </button>
          </div>
        )}

        {hideActionMessage && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-2xl text-xs font-bold flex items-center gap-2">
            <FontAwesomeIcon icon={faCheck} className="text-emerald-600" />
            <span>{hideActionMessage}</span>
          </div>
        )}

        {hideActionError && (
          <div className="bg-rose-50 border border-rose-200 text-rose-800 p-4 rounded-2xl text-xs font-bold flex items-center gap-2">
            <FontAwesomeIcon icon={faExclamationTriangle} className="text-rose-600" />
            <span>{hideActionError}</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Settings Navigation */}
          <div className="bg-white rounded-3xl p-4 shadow-sm border border-slate-100 h-fit space-y-1">
            <a href="#privacy" className="flex items-center gap-3 p-3 rounded-2xl bg-[#5D34F7]/10 text-[#5D34F7] font-black text-xs">
              <FontAwesomeIcon icon={faUserShield} />
              Privacy & Visibility
            </a>
            <a href="#deactivation" className="flex items-center gap-3 p-3 rounded-2xl hover:bg-slate-50 text-slate-600 font-extrabold text-xs">
              <FontAwesomeIcon icon={faEyeSlash} />
              Temporary Deactivation
            </a>
            <a href="#notifications" className="flex items-center gap-3 p-3 rounded-2xl hover:bg-slate-50 text-slate-600 font-extrabold text-xs">
              <FontAwesomeIcon icon={faBell} />
              Notifications
            </a>
            <a href="#password" className="flex items-center gap-3 p-3 rounded-2xl hover:bg-slate-50 text-slate-600 font-extrabold text-xs">
              <FontAwesomeIcon icon={faKey} />
              Password & Security
            </a>
            <a href="#membership" className="flex items-center gap-3 p-3 rounded-2xl hover:bg-slate-50 text-slate-600 font-extrabold text-xs">
              <FontAwesomeIcon icon={faCrown} />
              Membership Plans
            </a>
          </div>

          {/* Forms Area */}
          <div className="md:col-span-2 space-y-6">
            
            {/* Privacy Section */}
            <div id="privacy" className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 space-y-6">
              <div className="flex items-center justify-between border-b pb-2">
                <h3 className="font-extrabold text-slate-800 text-sm tracking-wide uppercase flex items-center gap-2">
                  <FontAwesomeIcon icon={faUserShield} className="text-[#5D34F7]" />
                  Privacy & Contact Visibility Controls
                </h3>
                {isFemale && (
                  <span className="bg-pink-100 text-pink-700 text-[10px] font-black px-2.5 py-0.5 rounded-full border border-pink-200 shadow-2xs">
                    Complimentary Female Privacy
                  </span>
                )}
              </div>

              {!canEditPrivacy && (
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3">
                  <FontAwesomeIcon icon={faLock} className="text-amber-600 mt-1" />
                  <div>
                    <h4 className="font-extrabold text-amber-900 text-xs">Exclusive Privacy Protection</h4>
                    <p className="text-amber-700 text-[11px] font-medium mt-0.5">
                      Controlling who can view your photos and contact details is available with our Premium Membership plans. Female members receive complimentary access to all privacy controls.
                    </p>
                    <button
                      onClick={() => window.location.href = '/plans'}
                      className="mt-2.5 px-4 py-1.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-extrabold rounded-xl text-[10px] shadow-sm hover:opacity-90"
                    >
                      View Plans & Upgrade
                    </button>
                  </div>
                </div>
              )}
              
              <div className={`space-y-4 text-xs font-bold text-slate-700 ${!canEditPrivacy ? 'opacity-50 pointer-events-none select-none' : ''}`}>
                {/* Photo Visibility */}
                <div className="space-y-2">
                  <label className="block text-slate-500">Who can see your profile photos?</label>
                  <select 
                    value={privacyPhoto} 
                    onChange={(e) => setPrivacyPhoto(e.target.value)}
                    className="w-full py-2.5 px-4 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5D34F7]/25 focus:border-[#5D34F7] text-slate-800"
                  >
                    <option value="everyone">All Verified Members (Recommended)</option>
                    <option value="premium">Premium Members Only</option>
                    <option value="accepted">Only Accepted Interests (Maximum Privacy)</option>
                  </select>
                </div>

                {/* Feature 21: Show Phone Number Only After Matched Toggle */}
                <div className="flex items-center justify-between py-3 px-4 bg-purple-50/50 rounded-2xl border border-purple-100 mt-2">
                  <div className="pr-4">
                    <div className="flex items-center gap-2">
                      <h4 className="font-extrabold text-slate-800">Show Phone Number Only After Matched</h4>
                      <span className="text-[9px] font-black uppercase px-2 py-0.2 rounded-full bg-[#5D34F7]/10 text-[#5D34F7]">
                        Recommended
                      </span>
                    </div>
                    <p className="text-slate-500 font-medium text-[11px] mt-0.5 leading-relaxed">
                      When enabled, your phone number is revealed only after a mutual match is accepted. When disabled, eligible paid members can view your contact details directly even before matching.
                    </p>
                  </div>
                  <input 
                    type="checkbox" 
                    checked={showPhoneAfterMatch} 
                    onChange={(e) => {
                      const val = e.target.checked;
                      setShowPhoneAfterMatch(val);
                      if (val) {
                        setPrivacyContact('accepted');
                      } else {
                        setPrivacyContact('everyone');
                      }
                    }} 
                    className="h-5 w-5 rounded border-slate-350 accent-[#5D34F7] cursor-pointer shrink-0"
                  />
                </div>

                {/* Hide Phone Number Completely */}
                <div className="flex items-center justify-between py-2 border-t border-slate-100 mt-2 pt-4">
                  <div>
                    <h4 className="font-extrabold text-slate-800">Hide Phone Number Completely</h4>
                    <p className="text-slate-400 font-medium text-[10px]">Do not reveal your phone number on your profile under any circumstances.</p>
                  </div>
                  <input 
                    type="checkbox" 
                    checked={hidePhoneNumber} 
                    onChange={(e) => setHidePhoneNumber(e.target.checked)} 
                    className="h-4 w-4 rounded border-slate-350 accent-[#5D34F7] cursor-pointer"
                  />
                </div>

                {/* Incoming Call Controls */}
                <div className="flex items-center justify-between py-2 border-t border-slate-100">
                  <div>
                    <h4 className="font-extrabold text-slate-800">Allow Incoming In-App Calls</h4>
                    <p className="text-slate-400 font-medium text-[10px]">Permit connected members to initiate in-app voice or video calls with you.</p>
                  </div>
                  <input 
                    type="checkbox" 
                    checked={allowIncomingCalls} 
                    onChange={(e) => setAllowIncomingCalls(e.target.checked)} 
                    className="h-4 w-4 rounded border-slate-350 accent-[#5D34F7] cursor-pointer"
                  />
                </div>
                
                <div className="pt-2 flex items-center gap-3">
                  <button
                    onClick={handleSavePrivacy}
                    disabled={saving}
                    className="px-6 py-2.5 bg-gradient-to-r from-[#5D34F7] to-[#4024DB] hover:opacity-95 text-white text-[11px] font-black rounded-xl shadow-sm transition active:scale-95 cursor-pointer disabled:opacity-50 border-0"
                  >
                    {saving ? <FontAwesomeIcon icon={faSpinner} spin className="mr-1.5" /> : null}
                    {saving ? 'Saving Preferences...' : 'Save Privacy Options'}
                  </button>
                </div>
                {message && <p className="text-[11px] text-emerald-600 font-bold mt-2">{message}</p>}
                {privacyError && <p className="text-[11px] text-rose-600 font-bold mt-2">{privacyError}</p>}
              </div>
            </div>

            {/* Feature 3: Temporary Account Deactivation (Hide Profile) Section */}
            <div id="deactivation" className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 space-y-4">
              <h3 className="font-extrabold text-slate-800 text-sm tracking-wide uppercase border-b pb-2 flex items-center gap-2">
                <FontAwesomeIcon icon={faEyeSlash} className="text-amber-600" />
                Temporary Account Deactivation (Hide Profile)
              </h3>

              <div className="space-y-3 text-xs">
                <p className="text-slate-600 font-medium leading-relaxed">
                  Need a break from matchmaking? Temporarily deactivating your profile behaves just like Instagram account deactivation:
                </p>
                <ul className="list-disc pl-5 space-y-1 text-slate-500 font-medium text-[11px]">
                  <li>Your profile becomes completely inactive and invisible in searches, recommendations, and feed for other users.</li>
                  <li>You can still log in anytime to view your own profile and existing matches.</li>
                  <li>Sending new interest requests is temporarily paused while your profile is hidden.</li>
                  <li>Your existing photos and verification status are safely preserved.</li>
                  <li>You can reactivate your account anytime with a single click.</li>
                </ul>

                {isProfileHidden ? (
                  <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 space-y-3">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <span className="font-black text-amber-900 text-xs">
                        Status: Profile Currently Hidden ({remainingHideDays} Days Left)
                      </span>
                      <button
                        type="button"
                        disabled={isUnhiding}
                        onClick={handleUnhideProfile}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl shadow-xs transition active:scale-95 cursor-pointer disabled:opacity-50"
                      >
                        {isUnhiding ? <FontAwesomeIcon icon={faSpinner} spin /> : 'Reactivate Profile'}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="pt-2">
                    <button
                      type="button"
                      disabled={isHiding}
                      onClick={handleHideProfile}
                      className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-black text-xs rounded-xl shadow-sm transition active:scale-95 cursor-pointer disabled:opacity-50 flex items-center gap-2"
                    >
                      {isHiding ? <FontAwesomeIcon icon={faSpinner} spin /> : <FontAwesomeIcon icon={faEyeSlash} />}
                      <span>Temporarily Deactivate / Hide Profile</span>
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Notifications Section */}
            <div id="notifications" className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 space-y-6">
              <h3 className="font-extrabold text-slate-800 text-sm tracking-wide uppercase border-b pb-2 flex items-center gap-2">
                <FontAwesomeIcon icon={faBell} className="text-[#5D34F7]" />
                Notification Preferences
              </h3>
              
              <div className="space-y-4 text-xs font-bold text-slate-700">
                <div className="flex items-center justify-between py-2 border-b border-slate-50">
                  <div>
                    <h4 className="font-extrabold text-slate-800">Email Notifications</h4>
                    <p className="text-slate-400 font-medium text-[10px]">Receive connection requests and messages in your inbox.</p>
                  </div>
                  <input 
                    type="checkbox" 
                    checked={emailNotif} 
                    onChange={(e) => setEmailNotif(e.target.checked)} 
                    className="h-4 w-4 rounded border-slate-350 accent-[#5D34F7]"
                  />
                </div>

                <div className="flex items-center justify-between py-2 border-b border-slate-50">
                  <div>
                    <h4 className="font-extrabold text-slate-800">Push Notifications</h4>
                    <p className="text-slate-400 font-medium text-[10px]">Receive notifications on your device for real-time activities.</p>
                  </div>
                  <input 
                    type="checkbox" 
                    checked={pushNotif} 
                    onChange={(e) => setPushNotif(e.target.checked)} 
                    className="h-4 w-4 rounded border-slate-350 accent-[#5D34F7]"
                  />
                </div>

                <div className="flex items-center justify-between py-2">
                  <div>
                    <h4 className="font-extrabold text-slate-800">SMS Notifications</h4>
                    <p className="text-slate-400 font-medium text-[10px]">Receive alerts and matches directly to your phone number.</p>
                  </div>
                  <input 
                    type="checkbox" 
                    checked={smsNotif} 
                    onChange={(e) => setSmsNotif(e.target.checked)} 
                    className="h-4 w-4 rounded border-slate-350 accent-[#5D34F7]"
                  />
                </div>
              </div>
            </div>

            {/* Password Section */}
            <div id="password" className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 space-y-6">
              <h3 className="font-extrabold text-slate-800 text-sm tracking-wide uppercase border-b pb-2 flex items-center gap-2">
                <FontAwesomeIcon icon={faKey} className="text-[#5D34F7]" />
                Security & Password
              </h3>
              
              <form onSubmit={handleChangePassword} className="space-y-4 text-xs font-bold text-slate-700">
                <div className="space-y-2">
                  <label className="block text-slate-500">Current Password</label>
                  <input 
                    type="password" 
                    required
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full py-2.5 px-4 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5D34F7]/25 focus:border-[#5D34F7]"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-slate-500">New Password</label>
                  <input 
                    type="password" 
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full py-2.5 px-4 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5D34F7]/25 focus:border-[#5D34F7]"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-slate-500">Confirm New Password</label>
                  <input 
                    type="password" 
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full py-2.5 px-4 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5D34F7]/25 focus:border-[#5D34F7]"
                  />
                </div>

                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 bg-gradient-to-r from-[#5D34F7] to-[#4024DB] hover:opacity-95 text-white text-[11px] font-black rounded-xl shadow-sm transition"
                >
                  {saving ? <FontAwesomeIcon icon={faSpinner} spin /> : 'Update Password'}
                </button>
                {passError && <p className="text-[11px] text-rose-500 font-bold mt-2">{passError}</p>}
                {passSuccess && <p className="text-[11px] text-emerald-600 font-bold mt-2">{passSuccess}</p>}
              </form>
            </div>

            {/* Membership Section */}
            <div id="membership" className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 space-y-6">
              <h3 className="font-extrabold text-slate-800 text-sm tracking-wide uppercase border-b pb-2 flex items-center gap-2">
                <FontAwesomeIcon icon={faCrown} className="text-[#5D34F7]" />
                Membership Status
              </h3>
              
              <div className="space-y-4 text-xs font-bold text-slate-700">
                <div className="p-5 rounded-2xl bg-gradient-to-br from-[#5D34F7]/5 to-[#4024DB]/5 border border-[#5D34F7]/10 flex justify-between items-center">
                  <div>
                    <h4 className="text-sm font-black text-slate-800">
                      {isPremium ? `${profile.premiumMembership.planType} Subscription` : 'Free Account Membership'}
                    </h4>
                    <p className="text-[10px] text-slate-400 font-bold mt-1">
                      {isPremium 
                        ? `Your membership expires on ${new Date(profile.premiumMembership.expiryDate).toLocaleDateString()}`
                        : 'Upgrade to view verified details, call directly, and connect with infinite matches.'
                      }
                    </p>
                  </div>
                  {!isPremium ? (
                    <button 
                      onClick={() => window.location.href = '/plans'}
                      className="px-5 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-extrabold rounded-xl shadow-sm transition active:scale-95 cursor-pointer hover:opacity-90"
                    >
                      View Plans
                    </button>
                  ) : (
                    <button 
                      onClick={() => window.location.href = '/plans'}
                      className="px-5 py-2 bg-slate-900 text-white font-extrabold rounded-xl shadow-sm transition active:scale-95 cursor-pointer hover:bg-slate-800"
                    >
                      Manage Plan
                    </button>
                  )}
                </div>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
