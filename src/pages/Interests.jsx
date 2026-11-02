import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api, { getPhotoUrl, getDefaultAvatar, handleImageError } from '../api/axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faCheck, faTimes, faPaperPlane, faHeart, faUser, faCalendarAlt, 
  faMapMarkerAlt, faChevronRight, faSpinner, faCommentDots, faUserCheck,
  faUserTimes, faExclamationTriangle, faCrown
} from '@fortawesome/free-solid-svg-icons';
import loadingImg from '../assets/loading.png';
import PremiumPlanBadge, { getPlanDetails } from '../components/PremiumPlanBadge';
import PhotoVerifiedBadge from '../components/PhotoVerifiedBadge';
import EmptyState from '../components/EmptyState';

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

export default function Interests() {
  const [activeTab, setActiveTab] = useState('received'); // 'received' or 'sent'
  const [received, setReceived] = useState([]);
  const [sent, setSent] = useState([]);
  const [currentUserProfile, setCurrentUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState('');
  const [processingId, setProcessingId] = useState(null);
  const [cancelDialogData, setCancelDialogData] = useState({ isOpen: false, item: null, error: '' });
  const [isCancelling, setIsCancelling] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);
  const navigate = useNavigate();

  const fetchInterests = async () => {
    try {
      setLoading(true);
      const [receivedRes, sentRes, profileRes] = await Promise.all([
        api.get('/users/interests/received'),
        api.get('/users/interests/sent'),
        api.get('/users/profile').catch(() => ({ data: null }))
      ]);
      setReceived(receivedRes.data || []);
      setSent(sentRes.data || []);
      if (profileRes.data) {
        setCurrentUserProfile(profileRes.data);
      }
      setFetchError('');
    } catch (err) {
      console.error('Error fetching interests:', err);
      setFetchError(err.response?.data?.message || err.message || 'Unable to load connection requests.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInterests();
  }, []);

  const handleUpdateStatus = async (id, status) => {
    setProcessingId(id);
    try {
      await api.put(`/users/interests/${id}`, { status });
      // Refresh list
      await fetchInterests();
      if (status === 'accepted') {
        // Find matching contact ID to open conversation
        const targetContact = received.find((r) => r._id === id);
        const contactId = targetContact?.sender?._id || targetContact?.sender;
        setTimeout(() => {
          navigate('/messages', { state: { contactId } });
        }, 1000);
      }
    } catch (err) {
      console.error('Error updating interest status:', err);
    } finally {
      setProcessingId(null);
    }
  };

  const handleWithdraw = async (id) => {
    setProcessingId(id);
    try {
      await api.delete(`/users/interests/${id}`);
      await fetchInterests();
    } catch (err) {
      console.error('Error withdrawing interest:', err);
    } finally {
      setProcessingId(null);
    }
  };

  const initiateCancelMatch = (item) => {
    setCancelDialogData({
      isOpen: true,
      item,
      error: ''
    });
  };

  const handleConfirmCancelMatch = async () => {
    if (!cancelDialogData.item) return;
    const interestId = cancelDialogData.item._id;

    setIsCancelling(true);
    setCancelDialogData((prev) => ({ ...prev, error: '' }));

    try {
      const response = await api.put(`/users/interests/${interestId}`, { status: 'cancelled' });
      await fetchInterests();
      setCancelDialogData({ isOpen: false, item: null, error: '' });
      setToastMessage({
        type: 'success',
        text: response.data?.message || 'Match cancelled successfully.'
      });
      setTimeout(() => setToastMessage(null), 4000);
    } catch (err) {
      console.error('Error cancelling match:', err);
      const errMsg = err.response?.data?.message || err.message || 'Failed to cancel match. Please try again.';
      setCancelDialogData((prev) => ({ ...prev, error: errMsg }));
      setToastMessage({
        type: 'error',
        text: errMsg
      });
      setTimeout(() => setToastMessage(null), 4000);
    } finally {
      setIsCancelling(false);
    }
  };

  // Feature 14: Compute unique accepted profiles counter without duplicates
  const acceptedReceived = received.filter(
    (item) => item.status === 'accepted' || item.status === 'matched' || item.status === 'matches'
  );
  const acceptedSent = sent.filter(
    (item) => item.status === 'accepted' || item.status === 'matched' || item.status === 'matches'
  );
  const totalAcceptedCount = acceptedReceived.length + acceptedSent.length;

  return (
    <div className="bg-transparent min-h-screen py-8 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto lg:mx-0 lg:ml-6 xl:ml-10 space-y-6 lg:px-8">
        
        {/* Page Header & Tab Controls */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex flex-col md:flex-row justify-between md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-3">
              <svg className="w-8 h-8 drop-shadow-sm shrink-0" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M22 2L2 8.5L9.5 12.5L19.5 5L12 14.5L14.5 22L22 2Z" fill="url(#paper_grad)" />
                <defs>
                  <linearGradient id="paper_grad" x1="2" y1="2" x2="22" y2="22" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#FF477E" />
                    <stop offset="1" stopColor="#FF85A2" />
                  </linearGradient>
                </defs>
              </svg>
              <span>Interest Requests</span>
            </h1>
            <p className="text-slate-400 text-xs font-bold uppercase mt-1 tracking-wider">
              Manage your connection invites
            </p>
          </div>
          
          <div className="flex items-center gap-3 flex-wrap self-start md:self-center">
            {/* Feature 14: Accepted Profiles Live Counter Badge */}
            <div 
              className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 shadow-2xs cursor-pointer hover:bg-emerald-100/70 transition"
              title="Total accepted profiles connected with you"
              onClick={() => navigate('/matches')}
            >
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-black">
                Accepted: <strong className="text-emerald-900 text-sm font-black">{totalAcceptedCount}</strong>
              </span>
            </div>

            {/* User Subscription Plan Badge in Header */}
            <PremiumPlanBadge
              user={currentUserProfile}
              variant="header"
              isCurrentUser={true}
              onClick={() => navigate('/plans')}
            />

            {/* Tab Controls */}
            <div className="flex bg-slate-100 p-1.5 rounded-2xl gap-1 shrink-0">
              <button
                onClick={() => setActiveTab('received')}
                className={`px-5 py-2.5 rounded-xl text-xs font-extrabold cursor-pointer transition ${
                  activeTab === 'received' 
                    ? 'bg-white text-slate-800 shadow-sm' 
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                Received ({received.length})
              </button>
              <button
                onClick={() => setActiveTab('sent')}
                className={`px-5 py-2.5 rounded-xl text-xs font-extrabold cursor-pointer transition ${
                  activeTab === 'sent' 
                    ? 'bg-white text-slate-800 shadow-sm' 
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                Sent ({sent.length})
              </button>
            </div>
          </div>
        </div>

        {/* Dynamic Lists container */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 min-h-[400px]">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-80 space-y-3">
              <img src={loadingImg} alt="Loading..." className="h-12 w-12 animate-spin object-contain" />
              <p className="text-slate-400 text-xs font-bold tracking-wider uppercase">Loading Interests...</p>
            </div>
          ) : fetchError ? (
            <EmptyState
              type="error"
              title="Failed to Load Interests"
              description={fetchError}
              primaryAction={{
                label: 'Retry Loading',
                onClick: fetchInterests
              }}
            />
          ) : activeTab === 'received' ? (
            received.length === 0 ? (
              <EmptyState
                type="interests"
                title="No Connection Requests Received"
                badge="Received Requests"
                description="When members view your profile and send you interest requests, they will appear here for you to accept or decline."
                suggestions={[
                  'Boost your profile visibility by completing all details on your profile page',
                  'Add verified photos to earn the Photo Verified badge',
                  'Take the first step by browsing profiles and expressing interest'
                ]}
                primaryAction={{
                  label: 'Explore Preference Matches',
                  onClick: () => navigate('/preference-matches')
                }}
                secondaryAction={{
                  label: 'Search All Profiles',
                  onClick: () => navigate('/search')
                }}
              />
            ) : (
              <div className="space-y-4">
                {received.map(item => {
                  const sender = item.sender || {};
                  const p = sender.profile || {};
                  const isMatched = item.status === 'accepted' || item.status === 'matched' || item.status === 'matches';
                  const planDetails = getPlanDetails(sender);
                  const { isPremium, isVip } = planDetails;

                  // Feature 12: Persistent outlines and gradients for VIP & Premium even when matched
                  let cardBorderClass = 'bg-white border border-slate-100 hover:bg-slate-50/55';
                  if (isMatched) {
                    if (isVip) {
                      cardBorderClass = 'bg-gradient-to-r from-amber-50/80 via-emerald-50/60 to-teal-50/50 border-2 border-amber-400 ring-2 ring-amber-300/60 shadow-md shadow-amber-500/10 hover:border-amber-500';
                    } else if (isPremium) {
                      cardBorderClass = 'bg-gradient-to-r from-purple-50/60 via-emerald-50/60 to-teal-50/50 border-2 border-[#5D34F7] ring-2 ring-[#5D34F7]/30 shadow-md shadow-[#5D34F7]/10 hover:border-[#4024DB]';
                    } else {
                      cardBorderClass = 'bg-gradient-to-r from-emerald-50/95 via-emerald-50/80 to-teal-50/60 border-2 border-emerald-400 shadow-md shadow-emerald-600/10 hover:border-emerald-500';
                    }
                  } else {
                    if (isVip) {
                      cardBorderClass = 'bg-white border-2 border-amber-400 ring-1 ring-amber-300/50 hover:bg-amber-50/20 shadow-xs';
                    } else if (isPremium) {
                      cardBorderClass = 'bg-white border-2 border-[#5D34F7]/60 ring-1 ring-[#5D34F7]/25 hover:bg-purple-50/20 shadow-xs';
                    }
                  }

                  let avatarRingClass = 'bg-[#5D34F7]/5 border-2 border-[#5D34F7]/10';
                  if (isVip) {
                    avatarRingClass = 'bg-white border-2 border-amber-400 ring-4 ring-amber-200/80 shadow-xs';
                  } else if (isPremium) {
                    avatarRingClass = 'bg-white border-2 border-[#5D34F7] ring-4 ring-[#5D34F7]/20 shadow-xs';
                  } else if (isMatched) {
                    avatarRingClass = 'bg-white border-2 border-emerald-400 ring-4 ring-emerald-100/90 shadow-sm';
                  }

                  return (
                    <div 
                      key={item._id} 
                      className={`rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all duration-200 ${cardBorderClass}`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-16 h-16 rounded-full overflow-hidden flex items-center justify-center shrink-0 ${avatarRingClass}`}>
                          {p.photos && p.photos[0] ? (
                            <img 
                              src={getPhotoUrl(p.photos[0], p.gender)} 
                              alt={p.name || 'Avatar'} 
                              onError={(e) => handleImageError(e, p.gender)}
                              className="w-full h-full object-cover" 
                            />
                          ) : (
                            <img 
                              src={getDefaultAvatar(p.gender)} 
                              alt={p.name || 'Avatar'} 
                              className="w-full h-full object-cover" 
                            />
                          )}
                        </div>
                        <div>
                          <h4 className="font-extrabold text-slate-800 text-sm leading-tight flex items-center gap-1.5 flex-wrap">
                            <span 
                              onClick={() => sender._id && navigate(`/profile/${sender._id}`)}
                              className="cursor-pointer hover:underline text-slate-900 font-black"
                            >
                              {p.name || sender.email || 'Matrimony Member'}
                            </span>
                            <PhotoVerifiedBadge user={sender} variant="badge" />
                            {p.gender === 'Female' && <span className="text-pink-500 text-[13px] leading-none" title="Female">♀️</span>}
                            {p.gender === 'Male' && <span className="text-blue-500 text-[13px] leading-none" title="Male">♂️</span>}
                            {/* Feature 12: Persistent Premium and VIP badge */}
                            <PremiumPlanBadge user={sender} variant="badge" size="xs" />
                          </h4>
                          <p className={`text-xs mt-0.5 flex items-center gap-1 font-semibold ${isMatched ? 'text-emerald-800' : 'text-slate-400'}`}>
                            <FontAwesomeIcon icon={faMapMarkerAlt} className="text-[10px]" />
                            {p.location || 'Location N/A'}
                          </p>
                          <p className={`text-[10px] font-bold mt-1 px-2 py-0.5 rounded-full inline-block ${
                            isMatched
                              ? 'bg-white/90 border border-emerald-200/80 text-emerald-950 shadow-2xs'
                              : 'bg-slate-100 text-slate-500'
                          }`}>
                            Age: {p.age || 'N/A'} yrs • Religion: {getReligionIcon(p.religion)} {p.religion || 'N/A'}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-end md:self-center">
                        {isMatched ? (
                          <div className="flex items-center gap-2 flex-wrap justify-end">
                            <span className="text-[10px] font-black uppercase text-emerald-800 bg-emerald-100/90 px-3 py-1 rounded-full border border-emerald-300 flex items-center gap-1.5 shadow-2xs">
                              <FontAwesomeIcon icon={faCheck} className="text-emerald-600 text-[10px]" />
                              <span>Matched</span>
                            </span>
                            <button
                              onClick={() => navigate('/messages', { state: { contactId: item.sender?._id || item.sender } })}
                              className="px-4 py-2 bg-gradient-to-r from-[#5D34F7] to-[#4024DB] hover:opacity-95 text-white text-xs font-bold rounded-xl cursor-pointer transition flex items-center gap-1.5 shadow-sm active:scale-95"
                            >
                              <FontAwesomeIcon icon={faCommentDots} />
                              Chat now
                            </button>
                            <button
                              type="button"
                              disabled={processingId === item._id || isCancelling}
                              onClick={() => initiateCancelMatch(item)}
                              className="px-3.5 py-2 border border-rose-200/90 bg-white/90 text-rose-600 hover:bg-rose-50 hover:border-rose-300 text-xs font-bold rounded-xl cursor-pointer transition flex items-center gap-1.5 disabled:opacity-50 active:scale-95 shadow-2xs"
                              title="Cancel this match"
                            >
                              <FontAwesomeIcon icon={faUserTimes} />
                              Cancel Match
                            </button>
                          </div>
                        ) : item.status === 'cancelled' ? (
                          <span className="text-[10px] font-black uppercase text-slate-500 bg-slate-100 px-3 py-1.5 rounded-full border border-slate-200">
                            Match Cancelled
                          </span>
                        ) : (
                          <>
                            <button
                              disabled={processingId === item._id}
                              onClick={() => handleUpdateStatus(item._id, 'rejected')}
                              className="px-4 py-2 border border-red-200 text-red-600 hover:bg-red-50 text-xs font-bold rounded-xl cursor-pointer transition flex items-center gap-1.5 disabled:opacity-50"
                            >
                              <FontAwesomeIcon icon={faTimes} />
                              Decline
                            </button>
                            <button
                              disabled={processingId === item._id}
                              onClick={() => handleUpdateStatus(item._id, 'accepted')}
                              className="px-5 py-2 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white text-xs font-bold rounded-xl shadow-sm cursor-pointer transition flex items-center gap-1.5 disabled:opacity-50"
                            >
                              {processingId === item._id ? (
                                <FontAwesomeIcon icon={faSpinner} spin />
                              ) : (
                                <FontAwesomeIcon icon={faCheck} />
                              )}
                              Accept Interest
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )
          ) : (
            sent.length === 0 ? (
              <EmptyState
                type="interests"
                title="No Interests Sent Yet"
                badge="Sent Requests"
                description="Browse through matching profiles and send connection interests to members you would like to connect with."
                suggestions={[
                  'Review recommendations on your Matches and Feed pages',
                  'Click "Send Interest" on profiles that match your values and expectations',
                  'Accepted interests will automatically unlock direct mutual conversations'
                ]}
                primaryAction={{
                  label: 'Send Interests to Matches',
                  onClick: () => navigate('/preference-matches')
                }}
                secondaryAction={{
                  label: 'Search Profiles',
                  onClick: () => navigate('/search')
                }}
              />
            ) : (
              <div className="space-y-4">
                {sent.map(item => {
                  const receiver = item.receiver || {};
                  const p = receiver.profile || {};
                  const isMatched = item.status === 'accepted' || item.status === 'matched' || item.status === 'matches';
                  const planDetails = getPlanDetails(receiver);
                  const { isPremium, isVip } = planDetails;

                  // Feature 12: Persistent outlines and gradients for VIP & Premium even when matched
                  let cardBorderClass = 'bg-white border border-slate-100 hover:bg-slate-50/55';
                  if (isMatched) {
                    if (isVip) {
                      cardBorderClass = 'bg-gradient-to-r from-amber-50/80 via-emerald-50/60 to-teal-50/50 border-2 border-amber-400 ring-2 ring-amber-300/60 shadow-md shadow-amber-500/10 hover:border-amber-500';
                    } else if (isPremium) {
                      cardBorderClass = 'bg-gradient-to-r from-purple-50/60 via-emerald-50/60 to-teal-50/50 border-2 border-[#5D34F7] ring-2 ring-[#5D34F7]/30 shadow-md shadow-[#5D34F7]/10 hover:border-[#4024DB]';
                    } else {
                      cardBorderClass = 'bg-gradient-to-r from-emerald-50/95 via-emerald-50/80 to-teal-50/60 border-2 border-emerald-400 shadow-md shadow-emerald-600/10 hover:border-emerald-500';
                    }
                  } else {
                    if (isVip) {
                      cardBorderClass = 'bg-white border-2 border-amber-400 ring-1 ring-amber-300/50 hover:bg-amber-50/20 shadow-xs';
                    } else if (isPremium) {
                      cardBorderClass = 'bg-white border-2 border-[#5D34F7]/60 ring-1 ring-[#5D34F7]/25 hover:bg-purple-50/20 shadow-xs';
                    }
                  }

                  let avatarRingClass = 'bg-[#5D34F7]/5 border-2 border-[#5D34F7]/10';
                  if (isVip) {
                    avatarRingClass = 'bg-white border-2 border-amber-400 ring-4 ring-amber-200/80 shadow-xs';
                  } else if (isPremium) {
                    avatarRingClass = 'bg-white border-2 border-[#5D34F7] ring-4 ring-[#5D34F7]/20 shadow-xs';
                  } else if (isMatched) {
                    avatarRingClass = 'bg-white border-2 border-emerald-400 ring-4 ring-emerald-100/90 shadow-sm';
                  }

                  return (
                    <div 
                      key={item._id} 
                      className={`rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all duration-200 ${cardBorderClass}`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-16 h-16 rounded-full overflow-hidden flex items-center justify-center shrink-0 ${avatarRingClass}`}>
                          {p.photos && p.photos[0] ? (
                            <img 
                              src={getPhotoUrl(p.photos[0], p.gender)} 
                              alt={p.name || 'Avatar'} 
                              onError={(e) => handleImageError(e, p.gender)}
                              className="w-full h-full object-cover" 
                            />
                          ) : (
                            <img 
                              src={getDefaultAvatar(p.gender)} 
                              alt={p.name || 'Avatar'} 
                              className="w-full h-full object-cover" 
                            />
                          )}
                        </div>
                        <div>
                          <h4 className="font-extrabold text-slate-800 text-sm leading-tight flex items-center gap-1.5 flex-wrap">
                            <span 
                              onClick={() => receiver._id && navigate(`/profile/${receiver._id}`)}
                              className="cursor-pointer hover:underline text-slate-900 font-black"
                            >
                              {p.name || receiver.email || 'Matrimony Member'}
                            </span>
                            <PhotoVerifiedBadge user={receiver} variant="badge" />
                            {p.gender === 'Female' && <span className="text-pink-500 text-[13px] leading-none" title="Female">♀️</span>}
                            {p.gender === 'Male' && <span className="text-blue-500 text-[13px] leading-none" title="Male">♂️</span>}
                            {/* Feature 12: Persistent Premium and VIP badge */}
                            <PremiumPlanBadge user={receiver} variant="badge" size="xs" />
                          </h4>
                          <span className={`inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full mt-1 ${
                            isMatched 
                              ? 'bg-emerald-100/90 text-emerald-800 border border-emerald-300' 
                              : item.status === 'rejected'
                              ? 'bg-red-50 text-red-600 border border-red-100'
                              : 'bg-amber-50 text-amber-600 border border-amber-100'
                          }`}>
                            {isMatched && <FontAwesomeIcon icon={faCheck} className="text-emerald-600 text-[9px]" />}
                            <span>{isMatched ? 'Matched' : item.status}</span>
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-end md:self-center">
                        {isMatched ? (
                          <div className="flex items-center gap-2 flex-wrap justify-end">
                            <button
                              onClick={() => navigate('/messages', { state: { contactId: item.receiver?._id || item.receiver } })}
                              className="px-4 py-2 bg-gradient-to-r from-[#5D34F7] to-[#4024DB] hover:opacity-95 text-white text-xs font-bold rounded-xl cursor-pointer transition flex items-center gap-1.5 shadow-sm active:scale-95"
                            >
                              <FontAwesomeIcon icon={faCommentDots} />
                              Chat now
                            </button>
                            <button
                              type="button"
                              disabled={processingId === item._id || isCancelling}
                              onClick={() => initiateCancelMatch(item)}
                              className="px-3.5 py-2 border border-rose-200/90 bg-white/90 text-rose-600 hover:bg-rose-50 hover:border-rose-300 text-xs font-bold rounded-xl cursor-pointer transition flex items-center gap-1.5 disabled:opacity-50 active:scale-95 shadow-2xs"
                              title="Cancel this match"
                            >
                              <FontAwesomeIcon icon={faUserTimes} />
                              Cancel Match
                            </button>
                          </div>
                        ) : item.status === 'cancelled' ? (
                          <span className="text-[10px] font-black uppercase text-slate-500 bg-slate-100 px-3 py-1.5 rounded-full border border-slate-200">
                            Match Cancelled
                          </span>
                        ) : (
                          <button
                            disabled={processingId === item._id}
                            onClick={() => handleWithdraw(item._id)}
                            className="px-4 py-2 border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-bold rounded-xl cursor-pointer transition flex items-center gap-1.5 disabled:opacity-50"
                          >
                            {processingId === item._id ? (
                              <FontAwesomeIcon icon={faSpinner} spin />
                            ) : (
                              <FontAwesomeIcon icon={faTimes} />
                            )}
                            Withdraw
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )
          )}
        </div>

        {/* Global Toast Notification */}
        {toastMessage && (
          <div className="fixed bottom-6 right-6 z-50 animate-in fade-in slide-in-from-bottom-4 duration-200">
            <div className={`px-5 py-3 rounded-2xl shadow-xl flex items-center gap-3 text-sm font-bold border ${
              toastMessage.type === 'error'
                ? 'bg-rose-600 text-white border-rose-700'
                : 'bg-slate-900 text-white border-slate-800'
            }`}>
              <FontAwesomeIcon icon={toastMessage.type === 'error' ? faExclamationTriangle : faCheck} />
              <span>{toastMessage.text}</span>
            </div>
          </div>
        )}

        {/* Cancel Match Confirmation Dialog */}
        {cancelDialogData.isOpen && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200 cursor-pointer"
            onClick={() => !isCancelling && setCancelDialogData({ isOpen: false, item: null, error: '' })}
          >
            <div
              className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 relative cursor-default text-center animate-in zoom-in-95 duration-200 space-y-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-14 h-14 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center text-xl mx-auto border-2 border-rose-100 shadow-xs">
                <FontAwesomeIcon icon={faUserTimes} />
              </div>

              <div>
                <h3 className="text-lg font-black text-slate-900 tracking-tight">
                  Cancel Mutual Match?
                </h3>
                <p className="text-slate-500 text-xs font-semibold mt-1.5 leading-relaxed">
                  Are you sure you want to cancel your match with{' '}
                  <span className="text-slate-800 font-bold">
                    {cancelDialogData.item?.sender?.profile?.name ||
                     cancelDialogData.item?.receiver?.profile?.name ||
                     'this member'}
                  </span>
                  ? This will disconnect your conversation and revert interest status.
                </p>
              </div>

              {cancelDialogData.error && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-bold text-left flex items-center gap-2">
                  <FontAwesomeIcon icon={faExclamationTriangle} className="shrink-0" />
                  <span>{cancelDialogData.error}</span>
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  disabled={isCancelling}
                  onClick={() => setCancelDialogData({ isOpen: false, item: null, error: '' })}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold text-xs transition cursor-pointer disabled:opacity-50"
                >
                  Keep Match
                </button>
                <button
                  type="button"
                  disabled={isCancelling}
                  onClick={handleConfirmCancelMatch}
                  className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-black text-xs transition cursor-pointer shadow-md shadow-rose-600/20 disabled:opacity-50 flex items-center justify-center gap-1.5"
                >
                  {isCancelling ? (
                    <>
                      <FontAwesomeIcon icon={faSpinner} spin className="text-xs" />
                      <span>Cancelling...</span>
                    </>
                  ) : (
                    <span>Yes, Cancel Match</span>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
