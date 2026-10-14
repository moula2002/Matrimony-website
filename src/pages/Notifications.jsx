import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api, { getPhotoUrl } from '../api/axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faHeart, faCommentDots, faBell, faCheck, faTimes, 
  faSpinner, faUser, faMapMarkerAlt, faSyncAlt,
  faEye, faStar, faPhone, faChevronRight
} from '@fortawesome/free-solid-svg-icons';
import loadingImg from '../assets/loading.png';
import CallModal from '../components/CallModal';

export default function Notifications() {
  const [notifications, setNotifications] = useState({ interests: [], messages: [], views: [] });
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [processingId, setProcessingId] = useState(null);
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'requests', 'messages'
  const [callModalData, setCallModalData] = useState({ isOpen: false, phone: '', name: '', photo: '' });

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
      .then(res => setProfile(res.data))
      .catch(err => console.error('Error fetching profile for notifications page:', err));
  }, []);

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
                              onClick={() => navigate('/preference-matches')}
                              className="relative w-16 h-16 rounded-2xl overflow-hidden bg-[#5D34F7]/10 border-2 border-[#5D34F7]/20 flex items-center justify-center shrink-0 cursor-pointer group-hover:scale-105 transition-transform"
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
                                  onClick={() => navigate('/preference-matches')}
                                  className="font-black text-slate-900 text-base leading-tight hover:text-[#5D34F7] cursor-pointer transition-colors"
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
                              onClick={() => navigate('/messages')}
                              className="relative w-14 h-14 rounded-2xl overflow-hidden bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0 cursor-pointer group-hover:scale-105 transition-transform"
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
                                onClick={() => navigate('/messages')}
                                className="font-black text-slate-900 text-sm leading-tight hover:text-blue-600 cursor-pointer transition-colors"
                              >
                                {p.name || sender.email || 'Matrimony Member'}
                              </h4>
                              <p className="text-slate-600 text-xs font-medium bg-slate-50 p-3 rounded-2xl border border-slate-100 max-w-lg line-clamp-1">
                                "{msg.text}"
                              </p>
                            </div>
                          </div>

                          <button
                            onClick={() => navigate('/messages')}
                            className="px-5 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white text-xs font-black rounded-xl shadow-md shadow-blue-500/20 transition cursor-pointer flex items-center justify-center gap-2 active:scale-95 self-end md:self-center shrink-0"
                          >
                            <FontAwesomeIcon icon={faCommentDots} />
                            <span>Reply in Chat</span>
                            <FontAwesomeIcon icon={faChevronRight} className="text-[10px]" />
                          </button>
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
                              onClick={() => navigate('/preference-matches')}
                              className="relative w-16 h-16 rounded-2xl overflow-hidden bg-amber-50 border border-amber-100 flex items-center justify-center shrink-0 cursor-pointer group-hover:scale-105 transition-transform"
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
                                  onClick={() => navigate('/preference-matches')}
                                  className="font-black text-slate-900 text-base leading-tight hover:text-amber-600 cursor-pointer transition-colors"
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
                              onClick={() => navigate('/preference-matches')}
                              className="flex-1 md:flex-none px-5 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white text-xs font-black rounded-xl shadow-md shadow-amber-500/20 transition cursor-pointer flex items-center justify-center gap-1.5 active:scale-95"
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

      <CallModal
        isOpen={callModalData.isOpen}
        onClose={() => setCallModalData(prev => ({ ...prev, isOpen: false }))}
        phone={callModalData.phone}
        name={callModalData.name}
        photo={callModalData.photo}
      />
    </div>
  );
}
