import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api, { getPhotoUrl } from '../api/axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faHeart, faCommentDots, faBell, faCheck, faTimes, 
  faSpinner, faUser, faMapMarkerAlt, faSyncAlt,
  faEye, faStar, faPhone, faChevronRight, faCopy,
  faUserCheck, faBriefcase
} from '@fortawesome/free-solid-svg-icons';
import loadingImg from '../assets/loading.png';
import CallModal from '../components/CallModal';
import MessageSentModal from '../components/MessageSentModal';
import ContactInfoCard from '../components/ContactInfoCard';
import { getCachedUnlockedContacts, syncContactedProfiles } from '../utils/contactManager';

const getReligionIcon = (rel) => {
  const icons = {
    'Hindu': '🕉️',
    'Muslim': '☪️',
    'Christian': '✝️',
    'Sikh': '☬',
    'Buddhist': '☸️',
    'Jain': '☸️',
    'Parsi': '🔥',
    'Jewish': '🕎'
  };
  return icons[rel] || '';
};

export default function Notifications() {
  const [notifications, setNotifications] = useState({ interests: [], messages: [], views: [] });
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [processingId, setProcessingId] = useState(null);
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'requests', 'messages', 'views'
  const [callModalData, setCallModalData] = useState({ isOpen: false, phone: '', name: '', photo: '' });

  // Profile Details Preview Modal state
  const [previewMatch, setPreviewMatch] = useState(null);
  const [activePreviewImage, setActivePreviewImage] = useState(null);
  const [copiedUid, setCopiedUid] = useState(null);
  const [kundaliResult, setKundaliResult] = useState(null);
  const [isMatchingKundali, setIsMatchingKundali] = useState(false);
  const [kundaliError, setKundaliError] = useState('');
  const [sendingInterestMap, setSendingInterestMap] = useState({});
  const [sentInterests, setSentInterests] = useState({});
  const [messageSentModal, setMessageSentModal] = useState({ isOpen: false, user: null });
  const [unlockedContacts, setUnlockedContacts] = useState(getCachedUnlockedContacts());

  const navigate = useNavigate();

  const fetchNotifications = async (isManualRefresh = false) => {
    try {
      if (isManualRefresh) setRefreshing(true);
      else setLoading(true);
      
      const res = await api.get('/users/notifications');
      setNotifications(res.data || { interests: [], messages: [], views: [] });
    } catch (err) {
      console.error('Error fetching notifications:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
    api.get('/users/profile')
      .then(res => {
        setProfile(res.data);
        if (res.data?.premiumMembership?.isPremium) {
          syncContactedProfiles().then((cached) => {
            if (cached) setUnlockedContacts(cached);
          });
        }
      })
      .catch(err => console.error('Error fetching profile for notifications page:', err));
  }, []);

  const handleContactUnlocked = (targetId, unlockedData) => {
    setUnlockedContacts((prev) => ({
      ...prev,
      [targetId]: unlockedData
    }));
    if (previewMatch && (previewMatch._id === targetId || previewMatch.id === targetId)) {
      setPreviewMatch((prev) => ({
        ...prev,
        hasContacted: true,
        phone: unlockedData.phone,
        email: unlockedData.email
      }));
    }
  };

  const handlePreviewProfile = async (targetUser, initialPhoto = null) => {
    if (!targetUser) return;
    const p = targetUser.profile || {};
    const photo = initialPhoto || (p.photos && p.photos[0] ? p.photos[0] : null);
    setPreviewMatch(targetUser);
    setActivePreviewImage(photo);
    setKundaliResult(null);
    setKundaliError('');

    if (targetUser._id) {
      // Record view to backend server
      try {
        await api.post(`/users/view/${targetUser._id}`);
      } catch (err) {
        console.error('Error recording view in Notifications:', err);
      }

      // Fetch full profile details
      try {
        const res = await api.get(`/users/profile/${targetUser._id}`);
        if (res.data) {
          setPreviewMatch(prev => ({
            ...prev,
            ...res.data,
            profile: {
              ...(prev?.profile || {}),
              ...(res.data.profile || {})
            }
          }));
        }
      } catch (fErr) {
        console.warn('Could not fetch full user profile details:', fErr);
      }
    }
  };

  const handleCheckKundali = async (targetUserId) => {
    setIsMatchingKundali(true);
    setKundaliResult(null);
    setKundaliError('');
    try {
      const res = await api.get(`/astrology/match/${targetUserId}`);
      setKundaliResult(res.data);
    } catch (err) {
      setKundaliError(err.response?.data?.message || 'Error checking Kundali');
    } finally {
      setIsMatchingKundali(false);
    }
  };

  const handleSendInterest = async (receiverId) => {
    setSendingInterestMap(prev => ({ ...prev, [receiverId]: true }));
    try {
      await api.post('/users/interests', { receiverId });
      setSentInterests(prev => ({ ...prev, [receiverId]: true }));
      if (previewMatch && (previewMatch._id === receiverId || previewMatch.id === receiverId)) {
        setMessageSentModal({ isOpen: true, user: previewMatch });
      }
    } catch (err) {
      console.error('Error sending interest:', err);
      alert(err.response?.data?.message || 'Failed to send interest.');
    } finally {
      setSendingInterestMap(prev => ({ ...prev, [receiverId]: false }));
    }
  };

  const handleCopyUid = (uid, e) => {
    if (e) e.stopPropagation();
    navigator.clipboard.writeText(uid);
    setCopiedUid(uid);
    setTimeout(() => setCopiedUid(null), 2000);
  };

  const handleUpdateStatus = async (id, status) => {
    setProcessingId(id);
    try {
      await api.put(`/users/interests/${id}`, { status });
      await fetchNotifications();
    } catch (err) {
      console.error('Error updating interest status:', err);
    } finally {
      setProcessingId(null);
    }
  };

  const interestsCount = notifications.interests?.length || 0;
  const messagesCount = notifications.messages?.length || 0;
  const viewsCount = notifications.views?.length || 0;
  const totalCount = interestsCount + messagesCount + viewsCount;

  const premium = profile?.premiumMembership || profile?.profile?.premiumMembership || {};
  const isPremium = premium?.isPremium || false;
  const planName = isPremium ? (premium.planType || 'Premium Member') : 'Free Member';

  return (
    <div className="bg-transparent min-h-screen py-8 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Header Panel */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-100/80 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#5D34F7] to-[#4024DB] flex items-center justify-center text-white text-2xl shadow-lg shadow-[#5D34F7]/25 shrink-0">
              <FontAwesomeIcon icon={faBell} />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                  Notifications Center
                </h1>
                {totalCount > 0 && (
                  <span className="px-3 py-1 bg-[#5D34F7]/10 text-[#5D34F7] text-xs font-black rounded-full border border-[#5D34F7]/20">
                    {totalCount} New
                  </span>
                )}
              </div>
              <p className="text-slate-500 text-xs sm:text-sm font-semibold mt-1">
                Manage your connection requests, message alerts, and profile updates.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 self-start md:self-center">
            {/* Membership Plan Pill / Badge inside Notifications Header */}
            <div 
              onClick={() => navigate('/plans')}
              className="flex items-center gap-3 p-2.5 px-4 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl border border-slate-800 shadow-md cursor-pointer hover:scale-[1.02] transition-transform shrink-0"
              title="Click to view plans"
            >
              <div className="flex items-center gap-2">
                <span className="text-sm">{isPremium ? '👑' : '⚡'}</span>
                <div className="text-left">
                  <span className="text-[9px] uppercase font-bold text-indigo-300 block tracking-wider leading-none mb-0.5">Membership Plan</span>
                  <span className="text-xs font-black text-white tracking-wide">{planName}</span>
                </div>
              </div>
              <span className="px-3 py-1 bg-[#5D34F7] hover:bg-[#4024DB] text-white text-[10px] font-black rounded-lg transition shadow-xs ml-1">
                {isPremium ? 'Manage' : 'Upgrade'}
              </span>
            </div>

            <button
              onClick={() => fetchNotifications(true)}
              disabled={refreshing}
              className="p-3 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-xs rounded-2xl border border-slate-200/80 transition flex items-center gap-2 cursor-pointer active:scale-95 disabled:opacity-50"
              title="Refresh Notifications"
            >
              <FontAwesomeIcon icon={faSyncAlt} className={`text-xs ${refreshing ? 'animate-spin text-[#5D34F7]' : ''}`} />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-5 py-3 rounded-2xl text-xs font-black transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 border ${
              activeTab === 'all'
                ? 'bg-[#5D34F7] text-white border-[#5D34F7] shadow-md shadow-[#5D34F7]/25'
                : 'bg-white text-slate-600 border-slate-100 hover:bg-slate-50'
            }`}
          >
            <span>All Notifications</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] ${activeTab === 'all' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-700'}`}>
              {totalCount}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('requests')}
            className={`px-5 py-3 rounded-2xl text-xs font-black transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 border ${
              activeTab === 'requests'
                ? 'bg-[#5D34F7] text-white border-[#5D34F7] shadow-md shadow-[#5D34F7]/25'
                : 'bg-white text-slate-600 border-slate-100 hover:bg-slate-50'
            }`}
          >
            <FontAwesomeIcon icon={faHeart} className={activeTab === 'requests' ? 'text-rose-300' : 'text-rose-500'} />
            <span>Connection Requests</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] ${activeTab === 'requests' ? 'bg-white/20 text-white' : 'bg-rose-50 text-rose-600'}`}>
              {interestsCount}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('messages')}
            className={`px-5 py-3 rounded-2xl text-xs font-black transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 border ${
              activeTab === 'messages'
                ? 'bg-[#5D34F7] text-white border-[#5D34F7] shadow-md shadow-[#5D34F7]/25'
                : 'bg-white text-slate-600 border-slate-100 hover:bg-slate-50'
            }`}
          >
            <FontAwesomeIcon icon={faCommentDots} className={activeTab === 'messages' ? 'text-blue-300' : 'text-blue-500'} />
            <span>Messages</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] ${activeTab === 'messages' ? 'bg-white/20 text-white' : 'bg-blue-50 text-blue-600'}`}>
              {messagesCount}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('views')}
            className={`px-5 py-3 rounded-2xl text-xs font-black transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 border ${
              activeTab === 'views'
                ? 'bg-[#5D34F7] text-white border-[#5D34F7] shadow-md shadow-[#5D34F7]/25'
                : 'bg-white text-slate-600 border-slate-100 hover:bg-slate-50'
            }`}
          >
            <FontAwesomeIcon icon={faEye} className={activeTab === 'views' ? 'text-amber-300' : 'text-amber-500'} />
            <span>Contacts</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] ${activeTab === 'views' ? 'bg-white/20 text-white' : 'bg-amber-50 text-amber-600'}`}>
              {viewsCount}
            </span>
          </button>
        </div>

        {/* Notifications Content Area */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-100 min-h-[350px]">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-80 space-y-3">
              <img src={loadingImg} alt="Loading..." className="h-12 w-12 animate-spin object-contain" />
              <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Fetching updates...</p>
            </div>
          ) : totalCount === 0 ? (
            <div className="flex flex-col items-center justify-center text-center py-16 px-4 space-y-4">
              <div className="w-20 h-20 rounded-3xl bg-slate-50 border border-slate-100 flex items-center justify-center text-[#5D34F7]/40 text-3xl shadow-inner">
                <FontAwesomeIcon icon={faBell} />
              </div>
              <div className="space-y-1 max-w-sm">
                <h3 className="font-black text-slate-900 text-lg">You're All Caught Up!</h3>
                <p className="text-slate-500 text-xs font-semibold leading-relaxed">
                  There are no new pending notifications. When members send you connection requests or messages, they will show up here.
                </p>
              </div>
              <div className="pt-2 flex items-center gap-3">
                <button
                  onClick={() => navigate('/preference-matches')}
                  className="px-5 py-2.5 bg-[#5D34F7] hover:bg-[#4024DB] text-white font-extrabold text-xs rounded-xl shadow-md shadow-[#5D34F7]/20 transition cursor-pointer"
                >
                  Explore Matches
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-8">
              
              {/* CONNECTION REQUESTS SECTION */}
              {(activeTab === 'all' || activeTab === 'requests') && interestsCount > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                      <FontAwesomeIcon icon={faHeart} className="text-rose-500 text-base" />
                      <span>Pending Connection Requests</span>
                    </h2>
                    <span className="px-2.5 py-1 bg-rose-50 text-rose-600 text-xs font-extrabold rounded-lg">
                      {interestsCount} Pending
                    </span>
                  </div>

                  <div className="space-y-4">
                    {notifications.interests.map((interest) => {
                      const sender = interest.sender || {};
                      const p = sender.profile || {};
                      const photoUrl = p.photos && p.photos[0] ? getPhotoUrl(p.photos[0]) : null;

                      return (
                        <div 
                          key={interest._id} 
                          className="bg-white hover:bg-slate-50/60 border border-slate-100 rounded-3xl p-5 shadow-xs transition duration-200 flex flex-col md:flex-row md:items-center justify-between gap-5 group"
                        >
                          {/* Sender Details */}
                          <div className="flex items-start sm:items-center gap-4">
                            <div 
                              onClick={() => handlePreviewProfile(sender, photoUrl)}
                              className="relative w-16 h-16 rounded-2xl overflow-hidden bg-[#5D34F7]/10 border-2 border-[#5D34F7]/20 flex items-center justify-center shrink-0 cursor-pointer group-hover:scale-105 transition-transform"
                              title="Click to view profile details"
                            >
                              {photoUrl ? (
                                <img src={photoUrl} alt={p.name || 'Member'} className="w-full h-full object-cover" />
                              ) : (
                                <FontAwesomeIcon icon={faUser} className="text-[#5D34F7] text-xl" />
                              )}
                            </div>

                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <h4 
                                  onClick={() => handlePreviewProfile(sender, photoUrl)}
                                  className="font-black text-slate-900 text-base leading-tight hover:text-[#5D34F7] cursor-pointer transition-colors"
                                  title="Click to view profile details"
                                >
                                  {p.name || sender.email || 'Matrimony Member'}
                                </h4>
                                <span className="px-2 py-0.5 bg-indigo-50 text-[#5D34F7] text-[10px] font-black uppercase rounded-md">
                                  Request
                                </span>
                              </div>

                              <p className="text-slate-500 text-xs font-semibold flex items-center gap-1.5">
                                <FontAwesomeIcon icon={faMapMarkerAlt} className="text-slate-400 text-[11px]" />
                                <span>{p.location || p.city || 'Location N/A'}</span>
                              </p>

                              <div className="flex flex-wrap items-center gap-2 pt-1">
                                {p.age && (
                                  <span className="text-[11px] font-bold text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-full">
                                    {p.age} Yrs
                                  </span>
                                )}
                                {p.height && (
                                  <span className="text-[11px] font-bold text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-full">
                                    {p.height}
                                  </span>
                                )}
                                {p.religion && (
                                  <span className="text-[11px] font-bold text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-full">
                                    {p.religion}
                                  </span>
                                )}
                                {p.workRole && (
                                  <span className="text-[11px] font-bold text-[#5D34F7] bg-[#5D34F7]/10 px-2.5 py-0.5 rounded-full">
                                    {p.workRole}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex items-center gap-2.5 self-end md:self-center shrink-0 w-full md:w-auto">
                            <button
                              onClick={() => handlePreviewProfile(sender, photoUrl)}
                              className="px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-black rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5 active:scale-95"
                              title="View Full Profile Details"
                            >
                              <FontAwesomeIcon icon={faEye} />
                              <span className="hidden sm:inline">Profile</span>
                            </button>

                            {p.phone && (
                              <button
                                onClick={() => {
                                  if (sender.settings?.allowVoiceAndVideoCalls === false) {
                                    alert('This member has disabled incoming calls.');
                                    return;
                                  }
                                  setCallModalData({
                                    isOpen: true,
                                    phone: p.phone,
                                    name: p.name || 'Member',
                                    photo: photoUrl
                                  });
                                }}
                                className="p-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-xl border border-emerald-200 transition cursor-pointer text-xs font-bold flex items-center gap-1.5 active:scale-95"
                                title="Call Member"
                              >
                                <FontAwesomeIcon icon={faPhone} />
                              </button>
                            )}

                            <button
                              disabled={processingId === interest._id}
                              onClick={() => handleUpdateStatus(interest._id, 'rejected')}
                              className="flex-1 md:flex-none px-4 py-2.5 border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-black rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50 active:scale-95"
                            >
                              <FontAwesomeIcon icon={faTimes} />
                              <span>Decline</span>
                            </button>

                            <button
                              disabled={processingId === interest._id}
                              onClick={() => handleUpdateStatus(interest._id, 'accepted')}
                              className="flex-1 md:flex-none px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white text-xs font-black rounded-xl shadow-md shadow-emerald-500/20 transition cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50 active:scale-95"
                            >
                              {processingId === interest._id ? (
                                <FontAwesomeIcon icon={faSpinner} spin />
                              ) : (
                                <FontAwesomeIcon icon={faCheck} />
                              )}
                              <span>Accept Interest</span>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* MESSAGES SECTION */}
              {(activeTab === 'all' || activeTab === 'messages') && messagesCount > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                      <FontAwesomeIcon icon={faCommentDots} className="text-blue-500 text-base" />
                      <span>Unread Messages</span>
                    </h2>
                    <span className="px-2.5 py-1 bg-blue-50 text-blue-600 text-xs font-extrabold rounded-lg">
                      {messagesCount} Unread
                    </span>
                  </div>

                  <div className="space-y-3">
                    {notifications.messages.map((msg) => {
                      const sender = msg.sender || {};
                      const p = sender.profile || {};
                      const photoUrl = p.photos && p.photos[0] ? getPhotoUrl(p.photos[0]) : null;

                      return (
                        <div 
                          key={msg._id} 
                          className="bg-white hover:bg-slate-50/60 border border-slate-100 rounded-3xl p-5 shadow-xs transition duration-200 flex flex-col md:flex-row md:items-center justify-between gap-4 group"
                        >
                          <div className="flex items-center gap-4">
                            <div 
                              onClick={() => handlePreviewProfile(sender, photoUrl)}
                              className="relative w-14 h-14 rounded-2xl overflow-hidden bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0 cursor-pointer group-hover:scale-105 transition-transform"
                              title="Click to view profile details"
                            >
                              {photoUrl ? (
                                <img src={photoUrl} alt={p.name || 'Member'} className="w-full h-full object-cover" />
                              ) : (
                                <FontAwesomeIcon icon={faUser} className="text-blue-500 text-lg" />
                              )}
                              <span className="absolute bottom-1 right-1 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full"></span>
                            </div>

                            <div className="space-y-1">
                              <h4 
                                onClick={() => handlePreviewProfile(sender, photoUrl)}
                                className="font-black text-slate-900 text-sm leading-tight hover:text-blue-600 cursor-pointer transition-colors"
                                title="Click to view profile details"
                              >
                                {p.name || sender.email || 'Matrimony Member'}
                              </h4>
                              <p className="text-slate-600 text-xs font-medium bg-slate-50 p-3 rounded-2xl border border-slate-100 max-w-lg line-clamp-1">
                                "{msg.text}"
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                            <button
                              onClick={() => handlePreviewProfile(sender, photoUrl)}
                              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-black rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5 active:scale-95"
                            >
                              <FontAwesomeIcon icon={faEye} />
                              <span>Profile</span>
                            </button>

                            <button
                              onClick={() => navigate('/messages')}
                              className="px-5 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white text-xs font-black rounded-xl shadow-md shadow-blue-500/20 transition cursor-pointer flex items-center justify-center gap-2 active:scale-95"
                            >
                              <FontAwesomeIcon icon={faCommentDots} />
                              <span>Reply in Chat</span>
                              <FontAwesomeIcon icon={faChevronRight} className="text-[10px]" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* PROFILE VIEWS SECTION */}
              {(activeTab === 'all' || activeTab === 'views') && viewsCount > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                      <FontAwesomeIcon icon={faEye} className="text-amber-500 text-base" />
                      <span>Recent Contacts Viewed</span>
                    </h2>
                    <span className="px-2.5 py-1 bg-amber-50 text-amber-600 text-xs font-extrabold rounded-lg">
                      {viewsCount} Views
                    </span>
                  </div>

                  <div className="space-y-3">
                    {notifications.views.map((view) => {
                      const viewer = view.viewer || {};
                      const p = viewer.profile || {};
                      const photoUrl = p.photos && p.photos[0] ? getPhotoUrl(p.photos[0]) : null;

                      return (
                        <div 
                          key={view._id} 
                          className="bg-white hover:bg-slate-50/60 border border-slate-100 rounded-3xl p-5 shadow-xs transition duration-200 flex flex-col md:flex-row md:items-center justify-between gap-4 group"
                        >
                          <div className="flex items-start sm:items-center gap-4">
                            <div 
                              onClick={() => handlePreviewProfile(viewer, photoUrl)}
                              className="relative w-16 h-16 rounded-2xl overflow-hidden bg-amber-50 border border-amber-100 flex items-center justify-center shrink-0 cursor-pointer group-hover:scale-105 transition-transform"
                              title="Click to view profile details"
                            >
                              {photoUrl ? (
                                <img src={photoUrl} alt={p.name || 'Member'} className="w-full h-full object-cover" />
                              ) : (
                                <FontAwesomeIcon icon={faUser} className="text-amber-400 text-xl" />
                              )}
                            </div>

                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <h4 
                                  onClick={() => handlePreviewProfile(viewer, photoUrl)}
                                  className="font-black text-slate-900 text-base leading-tight hover:text-amber-600 cursor-pointer transition-colors"
                                  title="Click to view profile details"
                                >
                                  {p.name || viewer.email || 'Matrimony Member'}
                                </h4>
                                <span className="px-2 py-0.5 bg-amber-50 text-amber-600 text-[10px] font-black uppercase rounded-md">
                                  Viewed Profile
                                </span>
                              </div>

                              <p className="text-slate-500 text-xs font-semibold flex items-center gap-1.5">
                                <FontAwesomeIcon icon={faMapMarkerAlt} className="text-slate-400 text-[11px]" />
                                <span>{p.location || p.city || 'Location N/A'}</span>
                              </p>

                              <div className="flex flex-wrap items-center gap-2 pt-1">
                                {p.age && (
                                  <span className="text-[11px] font-bold text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-full">
                                    {p.age} Yrs
                                  </span>
                                )}
                                {p.height && (
                                  <span className="text-[11px] font-bold text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-full">
                                    {p.height}
                                  </span>
                                )}
                                {p.religion && (
                                  <span className="text-[11px] font-bold text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-full">
                                    {p.religion}
                                  </span>
                                )}
                                {p.workRole && (
                                  <span className="text-[11px] font-bold text-[#5D34F7] bg-[#5D34F7]/10 px-2.5 py-0.5 rounded-full">
                                    {p.workRole}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2.5 self-end md:self-center shrink-0 w-full md:w-auto">
                            <button
                              onClick={() => handlePreviewProfile(viewer, photoUrl)}
                              className="flex-1 md:flex-none px-5 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white text-xs font-black rounded-xl shadow-md shadow-amber-500/20 transition cursor-pointer flex items-center justify-center gap-1.5 active:scale-95"
                              title="Click to view profile details"
                            >
                              <FontAwesomeIcon icon={faEye} />
                              <span>View Profile</span>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

            </div>
          )}
        </div>

      </div>

      {/* PROFILE DETAILS MODAL */}
      {previewMatch && (() => {
        const p = previewMatch.profile || {};
        const isSent = sentInterests[previewMatch._id] || (previewMatch.interestStatus === 'pending' && previewMatch.interestSender === profile?._id);
        const isSending = sendingInterestMap[previewMatch._id];
        const isConnected = previewMatch.interestStatus === 'accepted';
        const isReceivedRequest = previewMatch.interestStatus === 'pending' && previewMatch.interestSender !== profile?._id;

        return (
          <div 
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm cursor-pointer animate-in fade-in duration-200"
            onClick={() => { setPreviewMatch(null); setKundaliResult(null); setKundaliError(''); }}
          >
            <div 
              className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto relative shadow-2xl flex flex-col md:flex-row cursor-default custom-scrollbar animate-in zoom-in-95 duration-200"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button 
                onClick={() => { setPreviewMatch(null); setKundaliResult(null); setKundaliError(''); }}
                className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full bg-slate-900/60 hover:bg-slate-900 text-white flex items-center justify-center transition cursor-pointer font-bold text-sm"
                title="Close"
              >
                ✕
              </button>

              {/* Left Column: Image Preview Gallery */}
              <div className="w-full md:w-1/2 bg-slate-50 flex flex-col justify-between p-6 border-b md:border-b-0 md:border-r border-slate-100 min-h-[350px]">
                <div className="flex-1 flex items-center justify-center relative rounded-2xl overflow-hidden bg-slate-950 md:h-[400px]">
                  {activePreviewImage ? (
                    <img 
                      src={getPhotoUrl(activePreviewImage)} 
                      alt={p.name} 
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <FontAwesomeIcon icon={faUser} className="text-[#5D34F7]/20 text-7xl" />
                  )}
                </div>

                {/* Thumbnails Gallery */}
                {p.photos && p.photos.length > 1 && (
                  <div className="flex gap-2.5 overflow-x-auto py-3.5 px-1 mt-4 custom-scrollbar">
                    {p.photos.map((photo, index) => (
                      <button
                        key={index}
                        onClick={() => setActivePreviewImage(photo)}
                        className={`w-16 h-16 rounded-xl overflow-hidden border-2 transition-all flex-shrink-0 cursor-pointer ${
                          activePreviewImage === photo 
                            ? 'border-[#5D34F7] scale-105 shadow-sm' 
                            : 'border-transparent hover:border-slate-300'
                        }`}
                      >
                        <img src={getPhotoUrl(photo)} alt="" className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Right Column: Bio Details */}
              <div className="w-full md:w-1/2 p-8 flex flex-col justify-between h-[450px] md:h-[500px]">
                <div className="overflow-y-auto pr-2 custom-scrollbar flex-1 space-y-6">
                  {/* Name and Basic Info */}
                  <div>
                    <div className="flex justify-between items-start">
                      <h2 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
                        {p.name || previewMatch.email || 'Matrimony Member'}
                        {previewMatch.verificationStatus === 'approved' && <FontAwesomeIcon icon={faUserCheck} className="text-blue-500 text-xl ml-1" title="Verified Profile" />}
                        {p.gender === 'Female' && <span className="text-pink-500 text-lg leading-none" title="Female">♀️</span>}
                        {p.gender === 'Male' && <span className="text-blue-500 text-lg leading-none" title="Male">♂️</span>}
                      </h2>
                      {(() => {
                        const displayUid = previewMatch.uid || p.uid || (previewMatch._id ? previewMatch._id.substring(previewMatch._id.length - 8).toUpperCase() : '');
                        const isCopied = copiedUid === displayUid;
                        return (
                          <button 
                            onClick={(e) => handleCopyUid(displayUid, e)}
                            className="px-3 py-1.5 bg-[#5D34F7]/10 hover:bg-[#5D34F7]/20 text-[#5D34F7] text-[10px] font-black tracking-wider rounded-xl border border-[#5D34F7]/20 uppercase flex items-center gap-1.5 transition-all cursor-pointer active:scale-95 group/copy shrink-0"
                            title="Copy UID"
                          >
                            <span>UID: {displayUid}</span>
                            {isCopied ? (
                              <FontAwesomeIcon icon={faCheck} className="text-emerald-500 text-[10px]" />
                            ) : (
                              <FontAwesomeIcon icon={faCopy} className="opacity-70 group-hover/copy:opacity-100 text-[10px]" />
                            )}
                          </button>
                        );
                      })()}
                    </div>
                    <div className="flex items-center gap-4 mt-1">
                      <p className="text-slate-400 text-xs font-bold flex items-center gap-1">
                        <FontAwesomeIcon icon={faMapMarkerAlt} className="text-[#5D34F7]" />
                        {p.location || p.city || 'Location N/A'}
                      </p>
                      {previewMatch.matchesCount !== undefined && (
                        <div className="bg-rose-50 text-rose-500 px-2 py-1 rounded-xl text-[10px] font-black flex items-center gap-1 shadow-sm border border-rose-100">
                          <FontAwesomeIcon icon={faHeart} className="text-[10px]" />
                          {previewMatch.matchesCount} Matches
                        </div>
                      )}
                    </div>
                  </div>

                  {/* About / Description */}
                  {(p.about || p.bio) && (
                    <div className="space-y-2">
                      <h4 className="text-xs font-black uppercase text-slate-400 tracking-wider">About Me</h4>
                      <p className="text-slate-600 text-[13px] leading-relaxed font-medium bg-slate-50 p-4 rounded-2xl border border-slate-100/60">
                        {p.about || p.bio}
                      </p>
                    </div>
                  )}

                  {/* Detailed Information Grid */}
                  <div className="space-y-4">
                    <h4 className="text-xs font-black uppercase text-slate-400 tracking-wider">Profile Information</h4>
                    <div className="grid grid-cols-2 gap-4 text-xs font-bold text-slate-650 bg-slate-50/50 p-4 rounded-2xl border border-slate-100/50">
                      <div>
                        <span className="text-slate-400 text-[10px] block mb-0.5">AGE / HEIGHT</span>
                        {p.age || 'N/A'} Yrs, {p.height || 'N/A'}
                      </div>
                      <div>
                        <span className="text-slate-400 text-[10px] block mb-0.5">RELIGION / CASTE</span>
                        {getReligionIcon(p.religion)} {p.religion || 'N/A'}, {p.caste || 'N/A'}
                      </div>
                      <div>
                        <span className="text-slate-400 text-[10px] block mb-0.5">EDUCATION</span>
                        {p.education || 'N/A'}
                      </div>
                      <div>
                        <span className="text-slate-400 text-[10px] block mb-0.5">PROFESSION</span>
                        {p.workRole || p.profession || p.occupation || 'N/A'}
                      </div>
                      <div>
                        <span className="text-slate-400 text-[10px] block mb-0.5">ANNUAL INCOME</span>
                        {p.annualIncome || p.income || 'N/A'}
                      </div>
                      <div>
                        <span className="text-slate-400 text-[10px] block mb-0.5">MARITAL STATUS</span>
                        {p.maritalStatus || 'N/A'}
                      </div>
                      {p.diet && (
                        <div>
                          <span className="text-slate-400 text-[10px] block mb-0.5">DIET</span>
                          {p.diet}
                        </div>
                      )}
                      {p.familyFinancialStatus && (
                        <div>
                          <span className="text-slate-400 text-[10px] block mb-0.5">FAMILY STATUS</span>
                          {p.familyFinancialStatus}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Kundali Match Section */}
                  <div className="pt-2">
                    <h4 className="text-xs font-black uppercase text-slate-400 tracking-wider mb-2">Kundali Matching</h4>
                    <div className="bg-fuchsia-50/50 p-4 rounded-2xl border border-fuchsia-100/50 flex flex-col gap-3">
                      {kundaliResult ? (
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="text-fuchsia-400 text-[10px] font-bold block mb-0.5 uppercase tracking-wider">Match Score</span>
                            <div className="text-xl font-black text-fuchsia-600 flex items-baseline gap-1">
                              {kundaliResult.total_points} <span className="text-sm font-bold text-fuchsia-400">/ 36</span>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="text-fuchsia-400 text-[10px] font-bold block mb-0.5 uppercase tracking-wider">Result</span>
                            <div className="text-sm font-black text-fuchsia-600 bg-white px-3 py-1 rounded-full shadow-sm border border-fuchsia-100 inline-block">
                              {kundaliResult.match_result}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <>
                          <button
                            onClick={() => handleCheckKundali(previewMatch._id)}
                            disabled={isMatchingKundali}
                            className="w-full py-2.5 bg-white hover:bg-fuchsia-50 text-fuchsia-600 text-xs font-black uppercase tracking-wider rounded-xl border border-fuchsia-200 transition-colors shadow-sm disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
                          >
                            {isMatchingKundali ? (
                              <><FontAwesomeIcon icon={faSpinner} spin /> Checking Match...</>
                            ) : (
                              <>🔮 Check Kundali Match</>
                            )}
                          </button>
                          {kundaliError && (
                            <p className="text-[10px] font-bold text-rose-500 text-center px-2">{kundaliError}</p>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Footer buttons */}
                <div className="border-t border-slate-100 pt-6 mt-6 space-y-4">
                  {/* Contact Info Card */}
                  <ContactInfoCard
                    targetUser={previewMatch}
                    isPremium={isPremium}
                    unlockedMap={unlockedContacts}
                    onUnlockSuccess={handleContactUnlocked}
                    onCall={(phone, name, photo) => {
                      setCallModalData({
                        isOpen: true,
                        phone,
                        name,
                        photo
                      });
                    }}
                  />

                  {/* Open in full page link */}
                  <div className="flex justify-end">
                    <button
                      onClick={() => navigate(`/profile/${previewMatch._id}`)}
                      className="text-xs font-bold text-[#5D34F7] hover:text-[#4024DB] flex items-center gap-1 transition cursor-pointer"
                    >
                      <span>Open full profile page</span>
                      <FontAwesomeIcon icon={faChevronRight} className="text-[10px]" />
                    </button>
                  </div>

                  {isConnected ? (
                    <div className="flex gap-4">
                      <button
                        onClick={() => navigate('/messages')}
                        className="w-full py-3 bg-indigo-50 hover:bg-indigo-100 text-[#5D34F7] rounded-2xl font-black text-center text-xs flex items-center justify-center gap-1.5 border border-indigo-150 transition cursor-pointer"
                      >
                        <FontAwesomeIcon icon={faCommentDots} className="text-sm" />
                        Connected (Chat now)
                      </button>
                    </div>
                  ) : isReceivedRequest ? (
                    <div className="flex gap-3">
                      <button
                        disabled={processingId === previewMatch.interestId}
                        onClick={async () => {
                          if (previewMatch.interestId) {
                            await handleUpdateStatus(previewMatch.interestId, 'rejected');
                            setPreviewMatch(null);
                          }
                        }}
                        className="flex-1 py-3 border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-black rounded-2xl transition cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50"
                      >
                        <FontAwesomeIcon icon={faTimes} />
                        <span>Decline</span>
                      </button>
                      <button
                        disabled={processingId === previewMatch.interestId}
                        onClick={async () => {
                          if (previewMatch.interestId) {
                            await handleUpdateStatus(previewMatch.interestId, 'accepted');
                            setPreviewMatch(null);
                          }
                        }}
                        className="flex-1 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white text-xs font-black rounded-2xl shadow-md shadow-emerald-500/20 transition cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50"
                      >
                        <FontAwesomeIcon icon={faCheck} />
                        <span>Accept Interest</span>
                      </button>
                    </div>
                  ) : isSent ? (
                    <div className="space-y-2.5 w-full">
                      <div className="w-full py-2.5 bg-emerald-50 text-emerald-700 rounded-2xl font-black text-center text-xs flex items-center justify-center gap-1.5 border border-emerald-150 shadow-inner">
                        <FontAwesomeIcon icon={faCheck} className="text-sm" />
                        <span>Interest Sent Successfully</span>
                      </div>
                      <div className="bg-slate-50 border border-slate-100 rounded-2xl p-3 flex items-center justify-between gap-3">
                        <span className="text-xs font-black text-slate-600 uppercase tracking-wider">Next Step:</span>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => navigate('/messages')}
                            className="px-4 py-2 bg-[#5D34F7] hover:bg-[#4024DB] text-white font-black text-xs rounded-xl transition flex items-center gap-1.5 shadow-md shadow-[#5D34F7]/20 cursor-pointer active:scale-95"
                          >
                            <FontAwesomeIcon icon={faCommentDots} />
                            <span>Chat Now</span>
                          </button>
                          <button
                            onClick={() => {
                              setCallModalData({
                                isOpen: true,
                                phone: previewMatch.profile?.phone || previewMatch.phone || 'Contact Phone Unspecified',
                                name: previewMatch.profile?.name || previewMatch.email || 'Matrimony Member',
                                photo: previewMatch.profile?.photos?.[0] || null
                              });
                            }}
                            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl transition flex items-center gap-1.5 shadow-md shadow-emerald-600/20 cursor-pointer active:scale-95"
                          >
                            <FontAwesomeIcon icon={faPhone} />
                            <span>Call</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex gap-4">
                      <button
                        disabled={isSending}
                        onClick={() => handleSendInterest(previewMatch._id)}
                        className="w-full py-3 bg-gradient-to-r from-[#5D34F7] to-[#4024DB] hover:from-[#4f27e5] hover:to-[#381fcc] text-white font-black rounded-2xl text-xs shadow-md shadow-[#5D34F7]/25 hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 active:scale-[0.98]"
                      >
                        {isSending ? (
                          <FontAwesomeIcon icon={faSpinner} spin className="text-sm" />
                        ) : (
                          <>
                            <FontAwesomeIcon icon={faHeart} className="text-sm" />
                            <span>Send Interest</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      <CallModal
        isOpen={callModalData.isOpen}
        onClose={() => setCallModalData(prev => ({ ...prev, isOpen: false }))}
        phone={callModalData.phone}
        name={callModalData.name}
        photo={callModalData.photo}
      />

      <MessageSentModal
        isOpen={messageSentModal.isOpen}
        onClose={() => setMessageSentModal({ isOpen: false, user: null })}
        user={messageSentModal.user}
        onChat={() => {
          setMessageSentModal({ isOpen: false, user: null });
          navigate('/messages');
        }}
        onCall={(phone, name, photo) => {
          setMessageSentModal({ isOpen: false, user: null });
          setCallModalData({
            isOpen: true,
            phone: phone || previewMatch?.profile?.phone || 'Contact Phone Unspecified',
            name: name || previewMatch?.profile?.name || 'Member',
            photo: photo || (previewMatch?.profile?.photos && previewMatch?.profile?.photos[0]) || null
          });
        }}
      />
    </div>
  );
}
