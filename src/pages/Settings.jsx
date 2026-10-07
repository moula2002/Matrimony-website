import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faCog, faUserShield, faBell, faKey, faCrown, faTrashAlt, 
  faCheck, faSpinner, faEye, faLock, faSlidersH
} from '@fortawesome/free-solid-svg-icons';
import api from '../api/axios';

export default function Settings() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  
  // Settings Form State
  const [privacyPhoto, setPrivacyPhoto] = useState('everyone');
  const [privacyContact, setPrivacyContact] = useState('everyone');
  const [allowIncomingCalls, setAllowIncomingCalls] = useState(true);
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
        if (res.data?.profile) {
          if (res.data.profile.privacyPhoto) setPrivacyPhoto(res.data.profile.privacyPhoto);
          if (res.data.profile.privacyContact) setPrivacyContact(res.data.profile.privacyContact);
        }
        if (res.data?.settings) {
          if (res.data.settings.allowVoiceAndVideoCalls !== undefined) {
            setAllowIncomingCalls(res.data.settings.allowVoiceAndVideoCalls);
          }
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
    try {
      // Simulate/call profile update API
      await api.put('/users/profile', {
        profile: {
          privacyPhoto,
          privacyContact
        },
        settings: {
          allowVoiceAndVideoCalls: allowIncomingCalls
        }
      });
      setMessage('Privacy settings updated successfully!');
    } catch (err) {
      console.error(err);
      setMessage('Failed to update privacy settings.');
    } finally {
      setSaving(false);
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
      // Assuming change password endpoint exists
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

  return (
    <div className="bg-transparent min-h-screen py-8 px-4 sm:px-6 font-sans">
      <div className="max-w-4xl mx-auto lg:mx-0 lg:ml-6 xl:ml-10 space-y-8 lg:px-8">
        
        {/* Title Banner */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-3">
              <FontAwesomeIcon icon={faCog} className="text-[#5D34F7] animate-spin-slow" />
              <span>Settings</span>
            </h1>
            <p className="text-slate-400 text-xs font-bold uppercase mt-1 tracking-wider">
              Manage your account credentials, notifications, and privacy preferences
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Menu Sidebar */}
          <div className="bg-white rounded-3xl p-4 shadow-sm border border-slate-100 flex flex-col gap-1 h-fit">
            <a href="#privacy" className="flex items-center gap-3 px-4 py-3 text-slate-700 hover:text-[#5D34F7] hover:bg-[#5D34F7]/5 rounded-xl font-bold text-xs transition">
              <FontAwesomeIcon icon={faUserShield} className="w-4" />
              <span>Privacy & Visibility</span>
            </a>
            <a href="#notifications" className="flex items-center gap-3 px-4 py-3 text-slate-700 hover:text-[#5D34F7] hover:bg-[#5D34F7]/5 rounded-xl font-bold text-xs transition">
              <FontAwesomeIcon icon={faBell} className="w-4" />
              <span>Notification Preferences</span>
            </a>
            <a href="#password" className="flex items-center gap-3 px-4 py-3 text-slate-700 hover:text-[#5D34F7] hover:bg-[#5D34F7]/5 rounded-xl font-bold text-xs transition">
              <FontAwesomeIcon icon={faKey} className="w-4" />
              <span>Security & Password</span>
            </a>
            <a href="#membership" className="flex items-center gap-3 px-4 py-3 text-slate-700 hover:text-[#5D34F7] hover:bg-[#5D34F7]/5 rounded-xl font-bold text-xs transition">
              <FontAwesomeIcon icon={faCrown} className="w-4" />
              <span>Premium Membership</span>
            </a>
          </div>

          {/* Settings Panels */}
          <div className="md:col-span-2 space-y-6">
            
            {/* Privacy Section */}
            <div id="privacy" className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 space-y-6 relative overflow-hidden">
              {!isPremium && (
                <div className="absolute inset-0 z-10 bg-white/70 backdrop-blur-[2px] flex flex-col items-center justify-center p-6 text-center">
                  <div className="w-12 h-12 bg-amber-50 rounded-full flex items-center justify-center mb-3 border border-amber-100">
                    <FontAwesomeIcon icon={faLock} className="text-amber-500 text-lg" />
                  </div>
                  <h4 className="text-sm font-black text-slate-800 mb-1">Premium Feature</h4>
                  <p className="text-xs font-semibold text-slate-500 max-w-[250px] mb-4">
                    Upgrade to a premium plan to customize your privacy, visibility, and incoming call preferences.
                  </p>
                  <button 
                    onClick={() => window.location.href = '/plans'}
                    className="px-5 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-extrabold rounded-xl shadow-sm text-xs transition cursor-pointer active:scale-95"
                  >
                    View Plans
                  </button>
                </div>
              )}
              
              <h3 className="font-extrabold text-slate-800 text-sm tracking-wide uppercase border-b pb-2 flex items-center gap-2">
                <FontAwesomeIcon icon={faUserShield} className="text-[#5D34F7]" />
                Privacy Settings
              </h3>
              
              <div className="space-y-4 text-xs font-bold text-slate-700">
                <div className="space-y-2">
                  <label className="block text-slate-500">Who can view your photos?</label>
                  <select 
                    value={privacyPhoto} 
                    onChange={(e) => setPrivacyPhoto(e.target.value)}
                    className="w-full py-2.5 px-4 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5D34F7]/25 focus:border-[#5D34F7]"
                  >
                    <option value="everyone">Everyone</option>
                    <option value="premium">Premium Members Only</option>
                    <option value="accepted">Visibility only on acceptance</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="block text-slate-500">Who can view your contact details?</label>
                  <select 
                    value={privacyContact} 
                    onChange={(e) => setPrivacyContact(e.target.value)}
                    className="w-full py-2.5 px-4 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5D34F7]/25 focus:border-[#5D34F7]"
                  >
                    <option value="everyone">Everyone</option>
                    <option value="premium">Premium Members Only</option>
                    <option value="accepted">Only Accepted Connections</option>
                  </select>
                </div>

                <div className="flex items-center justify-between py-2 border-t border-slate-50 mt-2 pt-4">
                  <div>
                    <h4 className="font-extrabold text-slate-800">Allow Incoming Calls</h4>
                    <p className="text-slate-400 font-medium text-[10px]">Permit other members to initiate video or audio calls with you.</p>
                  </div>
                  <input 
                    type="checkbox" 
                    checked={allowIncomingCalls} 
                    onChange={(e) => setAllowIncomingCalls(e.target.checked)} 
                    className="h-4 w-4 rounded border-slate-350 accent-[#5D34F7] cursor-pointer"
                  />
                </div>
                
                <button
                  onClick={handleSavePrivacy}
                  disabled={saving}
                  className="px-6 py-2.5 bg-gradient-to-r from-[#5D34F7] to-[#4024DB] hover:opacity-95 text-white text-[11px] font-black rounded-xl shadow-sm transition"
                >
                  {saving ? <FontAwesomeIcon icon={faSpinner} spin /> : 'Save Privacy Options'}
                </button>
                {message && <p className="text-[11px] text-emerald-600 font-bold mt-2">{message}</p>}
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
                      Go Premium
                    </button>
                  ) : (
                    <button 
                      onClick={() => window.location.href = '/plans'}
                      className="px-5 py-2 bg-gradient-to-r from-indigo-500 to-[#5D34F7] text-white font-extrabold rounded-xl shadow-sm transition active:scale-95 cursor-pointer hover:opacity-90"
                    >
                      Renew Plan
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Danger Zone */}
            <div className="bg-rose-50/50 rounded-3xl p-6 border border-rose-100 space-y-4">
              <h3 className="font-extrabold text-rose-700 text-sm uppercase flex items-center gap-2">
                <FontAwesomeIcon icon={faTrashAlt} />
                Danger Zone
              </h3>
              <p className="text-[11px] text-rose-605 font-bold">Deactivating or deleting your profile will permanently remove your details, matches, and logs from our database. This action is not reversible.</p>
              <button 
                onClick={async () => {
                  if (window.confirm("Are you sure you want to delete your profile permanently?")) {
                    try {
                      await api.delete('/users/account');
                      localStorage.removeItem('token');
                      window.location.href = '/login';
                    } catch (error) {
                      console.error("Error deleting account", error);
                      alert("Failed to delete account. Please try again later.");
                    }
                  }
                }}
                className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-[11.5px] font-black rounded-xl transition shadow-sm cursor-pointer"
              >
                Delete Profile Account
              </button>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
