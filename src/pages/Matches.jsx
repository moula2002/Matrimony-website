import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api, { getPhotoUrl, getDefaultAvatar, handleImageError } from '../api/axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faUser, faMapMarkerAlt, faBriefcase, faHeart, faCommentDots, faSpinner, faSearch, faEye, faCheck, faCopy, faUserCheck, faPhone,
  faUserTimes, faExclamationTriangle, faTimes, faExpand, faLanguage
} from '@fortawesome/free-solid-svg-icons';
import loadingImg from '../assets/loading.png';
import CallModal from '../components/CallModal';
import ContactInfoCard from '../components/ContactInfoCard';
import PhotoVerifiedBadge from '../components/PhotoVerifiedBadge';
import FullScreenImageViewer from '../components/FullScreenImageViewer';
import EmptyState from '../components/EmptyState';
import { getCachedUnlockedContacts, syncContactedProfiles } from '../utils/contactManager';
import { formatProfileCreatedBy, formatSiblings, formatLanguages } from '../utils/profileHelpers';

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

export default function Matches() {
  const [mutualMatches, setMutualMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState('');
  const [previewMatch, setPreviewMatch] = useState(null);
  const [callModalData, setCallModalData] = useState({ isOpen: false, phone: '', name: '', photo: '' });
  const [activePreviewImage, setActivePreviewImage] = useState(null);
  const [copiedUid, setCopiedUid] = useState(null);
  const [kundaliResult, setKundaliResult] = useState(null);
  const [isMatchingKundali, setIsMatchingKundali] = useState(false);
  const [kundaliError, setKundaliError] = useState('');
  const [currentUserProfile, setCurrentUserProfile] = useState(null);
  const [unlockedContacts, setUnlockedContacts] = useState(getCachedUnlockedContacts());
  const [interestMap, setInterestMap] = useState({});

  // Full-Screen Lightbox Image Viewer State
  const [fullScreenImage, setFullScreenImage] = useState({
    isOpen: false,
    images: [],
    initialIndex: 0,
    userName: '',
    gender: 'Male',
    targetUserId: null
  });

  const handleOpenFullScreenImage = (match, initialIndex = 0) => {
    if (!match) return;
    const p = match.profile || {};
    const photosList = Array.isArray(p.photos) && p.photos.length > 0 ? p.photos : [];
    setFullScreenImage({
      isOpen: true,
      images: photosList,
      initialIndex,
      userName: p.name || match.email || 'Member',
      gender: p.gender || 'Male',
      targetUserId: match._id
    });
  };
  const [cancelDialogData, setCancelDialogData] = useState({ isOpen: false, match: null, error: '' });
  const [isCancelling, setIsCancelling] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);
  const navigate = useNavigate();

  const isPremium = Boolean(
    currentUserProfile?.premiumMembership?.isPremium ||
    currentUserProfile?.profile?.premiumMembership?.isPremium
  );

  const handlePreviewProfile = (match, photo) => {
    setPreviewMatch(match);
    setActivePreviewImage(photo);
    // Note: Profile view is strictly counted only when opening photo in full-screen mode
  };

  const handleCopyUid = (uid, e) => {
    if (e) e.stopPropagation();
    navigator.clipboard.writeText(uid);
    setCopiedUid(uid);
    setTimeout(() => setCopiedUid(null), 2000);
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

  useEffect(() => {
    const fetchMutualMatches = async () => {
      try {
        setLoading(true);
        // /users/chats returns all users with whom the logged-in user has an 'accepted' interest status
        const [chatsRes, sentRes, receivedRes] = await Promise.all([
          api.get('/users/chats'),
          api.get('/users/interests/sent').catch(() => ({ data: [] })),
          api.get('/users/interests/received').catch(() => ({ data: [] }))
        ]);
        setMutualMatches(chatsRes.data || []);

        const map = {};
        (sentRes.data || []).forEach((item) => {
          const targetId = item.receiver?._id || item.receiver;
          if (targetId) {
            map[targetId] = { interestId: item._id, status: item.status, role: 'sender' };
          }
        });
        (receivedRes.data || []).forEach((item) => {
          const targetId = item.sender?._id || item.sender;
          if (targetId) {
            map[targetId] = { interestId: item._id, status: item.status, role: 'receiver' };
          }
        });
        setInterestMap(map);
        setFetchError('');
      } catch (err) {
        console.error('Error fetching mutual matches:', err);
        setFetchError(err.response?.data?.message || err.message || 'Unable to connect to matches service.');
      } finally {
        setLoading(false);
      }
    };

    const fetchCurrentUser = async () => {
      try {
        const res = await api.get('/users/profile');
        setCurrentUserProfile(res.data);
        if (res.data?.premiumMembership?.isPremium) {
          syncContactedProfiles().then((cached) => {
            if (cached) setUnlockedContacts(cached);
          });
        }
      } catch (err) {
        console.error('Error fetching current user profile:', err);
      }
    };

    fetchMutualMatches();
    fetchCurrentUser();
  }, []);

  const handleContactUnlocked = (targetId, unlockedData) => {
    setUnlockedContacts((prev) => ({
      ...prev,
      [targetId]: unlockedData
    }));
    setMutualMatches((prev) =>
      prev.map((m) =>
        (m._id === targetId || m.id === targetId)
          ? {
              ...m,
              hasContacted: true,
              contacted: true,
              phone: unlockedData.phone,
              email: unlockedData.email,
              profile: {
                ...m.profile,
                phone: unlockedData.phone,
                email: unlockedData.email
              }
            }
          : m
      )
    );
    if (previewMatch && (previewMatch._id === targetId || previewMatch.id === targetId)) {
      setPreviewMatch((prev) => ({
        ...prev,
        hasContacted: true,
        contacted: true,
        phone: unlockedData.phone,
        email: unlockedData.email,
        profile: {
          ...prev.profile,
          phone: unlockedData.phone,
          email: unlockedData.email
        }
      }));
    }
  };

  const initiateCancelMatch = (match) => {
    setCancelDialogData({
      isOpen: true,
      match,
      error: ''
    });
  };

  const handleConfirmCancelMatch = async () => {
    if (!cancelDialogData.match) return;
    const targetUserId = cancelDialogData.match._id;

    setIsCancelling(true);
    setCancelDialogData((prev) => ({ ...prev, error: '' }));

    try {
      let interestId = interestMap[targetUserId]?.interestId;

      if (!interestId) {
        // Fallback fetch in case it wasn't preloaded
        const [sentRes, recRes] = await Promise.all([
          api.get('/users/interests/sent').catch(() => ({ data: [] })),
          api.get('/users/interests/received').catch(() => ({ data: [] }))
        ]);
        const found = (sentRes.data || []).find(i => (i.receiver?._id || i.receiver) === targetUserId) ||
                      (recRes.data || []).find(i => (i.sender?._id || i.sender) === targetUserId);
        if (found) {
          interestId = found._id;
        }
      }

      if (!interestId) {
        throw new Error('Match record could not be found or has already been cancelled.');
      }

      // Update interest status to 'cancelled' on the server
      const response = await api.put(`/users/interests/${interestId}`, { status: 'cancelled' });

      // Update state immediately: remove match from list
      setMutualMatches((prev) => prev.filter((m) => m._id !== targetUserId));

      // Close preview modal if active
      if (previewMatch && previewMatch._id === targetUserId) {
        setPreviewMatch(null);
      }

      // Close confirmation dialog
      setCancelDialogData({ isOpen: false, match: null, error: '' });

      // Success toast feedback
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

  return (
    <div className="bg-transparent min-h-screen py-8 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto lg:mx-0 lg:ml-6 xl:ml-10 space-y-6 lg:px-8">

        {/* Header Section */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-3">
              <svg className="w-8 h-8 drop-shadow-sm shrink-0 animate-pulse" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 21.35L10.55 20.03C5.4 15.36 2 12.27 2 8.5C2 5.41 4.42 3 7.5 3C9.24 3 10.91 3.81 12 5.08C13.09 3.81 14.76 3 16.5 3C19.58 3 22 5.41 22 8.5C22 12.27 18.6 15.36 13.45 20.03L12 21.35Z" fill="url(#heart_title_grad)" />
                <defs>
                  <linearGradient id="heart_title_grad" x1="2" y1="3" x2="22" y2="21.35" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#FF477E" />
                    <stop offset="1" stopColor="#FF85A2" />
                  </linearGradient>
                </defs>
              </svg>
              <span>Mutual Matches</span>
            </h1>
            <p className="text-slate-400 text-xs font-bold uppercase mt-1 tracking-wider">
              Connections who have accepted your interest request
            </p>
          </div>
          <span className="bg-[#5D34F7] text-white text-xs px-3.5 py-1 rounded-full font-black shadow-sm">
            Total: {mutualMatches.length}
          </span>
        </div>

        {/* Mutual Matches Cards Grid */}
        {loading ? (
          <div className="bg-white rounded-3xl p-12 shadow-sm border border-slate-100 flex flex-col items-center justify-center min-h-[400px]">
            <img src={loadingImg} alt="Loading..." className="h-12 w-12 animate-spin object-contain" />
            <p className="text-slate-400 text-xs font-bold mt-4 tracking-wider uppercase">Loading Mutual Matches...</p>
          </div>
        ) : fetchError ? (
          <EmptyState
            type="error"
            title="Failed to Load Mutual Matches"
            description={fetchError}
            primaryAction={{
              label: 'Retry Loading',
              onClick: () => {
                setFetchError('');
                setLoading(true);
                api.get('/users/chats').then(res => {
                  setMutualMatches(res.data || []);
                  setLoading(false);
                }).catch(err => {
                  setFetchError(err.response?.data?.message || err.message || 'Unable to load matches.');
                  setLoading(false);
                });
              }
            }}
          />
        ) : mutualMatches.length === 0 ? (
          <EmptyState
            type="matches"
            title="No Mutual Matches Yet"
            badge="0 Connections"
            description="Mutual matches happen when you and another member mutually express interest and accept each other's connection request. Start browsing profiles to find compatible families!"
            suggestions={[
              'Explore curated Preference Matches matching your lifestyle and background',
              'Send connection interests to initiate mutual conversations',
              'Keep your profile photos and about description updated to receive more interest'
            ]}
            primaryAction={{
              label: 'Send Interests & Explore Matches',
              onClick: () => navigate('/preference-matches')
            }}
            secondaryAction={{
              label: 'Search All Profiles',
              onClick: () => navigate('/search')
            }}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {mutualMatches.map(match => {
              const p = match.profile || {};
              return (
                <div
                  key={match._id}
                  className="bg-white rounded-3xl overflow-hidden shadow-md border border-slate-100 flex flex-col hover:shadow-xl hover:-translate-y-1 transition duration-300 relative group"
                >
                  {/* Photo Container */}
                  <div
                    onClick={() => handleOpenFullScreenImage(match, 0)}
                    className="h-48 bg-slate-100 relative overflow-hidden flex items-center justify-center cursor-pointer group/img"
                    title="Click to view full screen photo"
                  >
                    {p.photos && p.photos[0] ? (
                      <img
                        src={getPhotoUrl(p.photos[0], p.gender)}
                        alt={p.name || 'Member'}
                        onError={(e) => handleImageError(e, p.gender)}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover/img:scale-105"
                      />
                    ) : (
                      <img
                        src={getDefaultAvatar(p.gender)}
                        alt={p.name || 'Member'}
                        className="w-full h-full object-cover opacity-90 transition-transform duration-500 group-hover/img:scale-105"
                      />
                    )}

                    {match.isFeatured && (
                      <span className="absolute top-3 left-3 px-2 py-0.5 bg-gradient-to-r from-amber-500 to-amber-400 backdrop-blur-md text-white text-[9px] font-extrabold rounded-full z-10 pointer-events-none shadow-sm">
                        ⭐ Featured
                      </span>
                    )}

                    {/* Hover full screen overlay */}
                    <div className="absolute inset-0 bg-black/35 flex items-center justify-center opacity-0 group-hover/img:opacity-100 transition duration-300">
                      <div className="bg-white/95 backdrop-blur-md px-4 py-2 rounded-2xl flex items-center gap-2 text-slate-800 font-extrabold text-xs shadow-md transform translate-y-2 group-hover/img:translate-y-0 transition duration-300">
                        <FontAwesomeIcon icon={faExpand} className="text-[#5D34F7] text-xs" />
                        <span>View Full Screen</span>
                      </div>
                    </div>

                    <span className="absolute top-3 right-3 px-2 py-0.5 bg-slate-900/60 backdrop-blur-md text-white text-[9px] font-bold rounded-full z-10 pointer-events-none">
                      Matches
                    </span>
                    <PhotoVerifiedBadge user={match} variant="photo" className="absolute top-3 left-3" />
                  </div>

                  {/* Body Content */}
                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <h3
                          onClick={() => handlePreviewProfile(match, p.photos && p.photos[0] ? p.photos[0] : null)}
                          className="font-extrabold text-slate-800 text-sm leading-tight flex items-center gap-1.5 cursor-pointer hover:text-[#5D34F7] transition-colors"
                          title="Click to view profile details"
                        >
                          <span>{p.name || match.email || 'Matrimony Member'}</span>
                          <PhotoVerifiedBadge user={match} variant="badge" />
                          {p.gender === 'Female' && <span className="text-pink-500 text-[13px] leading-none" title="Female">♀️</span>}
                          {p.gender === 'Male' && <span className="text-blue-500 text-[13px] leading-none" title="Male">♂️</span>}
                        </h3>
                        <button
                          type="button"
                          onClick={() => handlePreviewProfile(match, p.photos && p.photos[0] ? p.photos[0] : null)}
                          className="text-[10px] font-bold text-[#5D34F7] hover:underline cursor-pointer"
                        >
                          Profile &rarr;
                        </button>
                      </div>
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <p className="text-slate-400 text-xs font-semibold flex items-center gap-1">
                          <FontAwesomeIcon icon={faMapMarkerAlt} className="text-[10px]" />
                          {p.location || 'Location N/A'}
                        </p>
                        {formatProfileCreatedBy(p.profileFor || match.profileFor) && (
                          <span className="text-[10px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-lg border border-slate-200/60 flex items-center gap-1 shadow-2xs">
                            <span className="text-[9px] text-slate-400 font-semibold uppercase">By:</span>
                            <span className="font-extrabold text-[#5D34F7]">{formatProfileCreatedBy(p.profileFor || match.profileFor)}</span>
                          </span>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-y-1 gap-x-2 text-[11px] text-slate-500 font-bold border-t border-slate-50 pt-3 mt-2">
                        <div>Age: {p.age || 'N/A'} yrs</div>
                        <div>Height: {p.height || 'N/A'}</div>
                        <div className="col-span-2 truncate flex items-center gap-1">
                          <FontAwesomeIcon icon={faBriefcase} className="text-slate-400 text-[10px]" />
                          {p.profession || p.occupation || 'N/A'}
                        </div>
                        {((p.languages && p.languages.length > 0) || p.motherTongue) && (
                          <div className="col-span-2 truncate flex items-center gap-1 text-[11px] text-sky-700 font-bold">
                            <FontAwesomeIcon icon={faLanguage} className="text-sky-500 text-[10px]" />
                            <span className="truncate">{formatLanguages(p.languages || p.motherTongue)}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2.5">
                      <ContactInfoCard
                        targetUser={match}
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

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => navigate('/messages', { state: { contactId: match._id || match.user?._id } })}
                          className="flex-1 py-2.5 bg-gradient-to-r from-[#5D34F7] to-[#4024DB] hover:opacity-95 text-white font-extrabold rounded-xl text-xs shadow-sm transition flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <FontAwesomeIcon icon={faCommentDots} />
                          Chat Now
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            initiateCancelMatch(match);
                          }}
                          className="px-3.5 py-2.5 border border-rose-200 hover:bg-rose-50 text-rose-600 hover:text-rose-700 font-extrabold rounded-xl text-xs transition flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 shrink-0"
                          title="Cancel Match"
                        >
                          <FontAwesomeIcon icon={faUserTimes} className="text-[11px]" />
                          <span>Cancel Match</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>

      {/* Profile Detail Preview Modal */}
      {previewMatch && (() => {
        const p = previewMatch.profile || {};

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
              >
                ✕
              </button>

              {/* Left Column: Image Preview Gallery */}
              <div className="w-full md:w-1/2 bg-slate-50 flex flex-col justify-between p-6 border-b md:border-b-0 md:border-r border-slate-100 min-h-[350px]">
                <div
                  onClick={() => {
                    const photos = p.photos || [];
                    const idx = photos.indexOf(activePreviewImage);
                    handleOpenFullScreenImage(previewMatch, idx >= 0 ? idx : 0);
                  }}
                  className="flex-1 flex items-center justify-center relative rounded-2xl overflow-hidden bg-slate-950 md:h-[400px] cursor-pointer group/previewimg"
                  title="Click to view photo in full screen"
                >
                  {activePreviewImage ? (
                    <img
                      src={getPhotoUrl(activePreviewImage, p.gender)}
                      alt={p.name || 'Member'}
                      onError={(e) => handleImageError(e, p.gender)}
                      className="w-full h-full object-contain transition-transform duration-300 group-hover/previewimg:scale-102"
                    />
                  ) : (
                    <img
                      src={getDefaultAvatar(p.gender)}
                      alt={p.name || 'Member'}
                      className="w-full h-full object-contain opacity-90 p-8"
                    />
                  )}
                  {activePreviewImage && (
                    <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-xl flex items-center gap-1.5 text-white text-[11px] font-bold opacity-0 group-hover/previewimg:opacity-100 transition-opacity">
                      <FontAwesomeIcon icon={faExpand} className="text-[#5D34F7]" />
                      <span>Full Screen</span>
                    </div>
                  )}
                  <PhotoVerifiedBadge user={previewMatch} variant="photo" className="absolute top-4 left-4" />
                </div>

                {/* Thumbnails Gallery */}
                {p.photos && p.photos.length > 1 && (
                  <div className="flex gap-2.5 overflow-x-auto py-3.5 px-1 mt-4 custom-scrollbar">
                    {p.photos.map((photo, index) => (
                      <button
                        key={index}
                        onClick={() => setActivePreviewImage(photo)}
                        className={`w-16 h-16 rounded-xl overflow-hidden border-2 transition-all flex-shrink-0 cursor-pointer ${activePreviewImage === photo
                            ? 'border-[#5D34F7] scale-105 shadow-sm'
                            : 'border-transparent hover:border-slate-300'
                          }`}
                      >
                        <img
                          src={getPhotoUrl(photo, p.gender)}
                          alt=""
                          onError={(e) => handleImageError(e, p.gender)}
                          className="w-full h-full object-cover"
                        />
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
                      <h2 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2 flex-wrap">
                        <span>{p.name || previewMatch.email || 'Matrimony Member'}</span>
                        <PhotoVerifiedBadge user={previewMatch} variant="badge" />
                        {p.gender === 'Female' && <span className="text-pink-500 text-lg leading-none" title="Female">♀️</span>}
                        {p.gender === 'Male' && <span className="text-blue-500 text-lg leading-none" title="Male">♂️</span>}
                      </h2>
                      {(() => {
                        const displayUid = previewMatch.uid || p.uid || previewMatch._id.substring(previewMatch._id.length - 8).toUpperCase();
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
                    <div className="flex items-center gap-3 mt-1 flex-wrap">
                      <p className="text-slate-400 text-xs font-bold flex items-center gap-1">
                        <FontAwesomeIcon icon={faMapMarkerAlt} className="text-[#5D34F7]" />
                        {p.location || 'Location N/A'}
                      </p>
                      {formatProfileCreatedBy(p.profileFor || previewMatch.profileFor) && (
                        <div className="bg-indigo-50 text-[#5D34F7] px-2.5 py-1 rounded-xl text-[10px] font-extrabold flex items-center gap-1.5 shadow-2xs border border-indigo-150">
                          <FontAwesomeIcon icon={faUser} className="text-[10px]" />
                          <span>Profile Created By: <strong className="font-black">{formatProfileCreatedBy(p.profileFor || previewMatch.profileFor)}</strong></span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* About / Description */}
                  {(p.about || p.bio) && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-black uppercase text-slate-400 tracking-wider">About Me / Description</h4>
                        {previewMatch.aboutMeVerificationStatus === 'approved' && (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1 shadow-2xs">
                            ✓ Verified Description
                          </span>
                        )}
                        {previewMatch.aboutMeVerificationStatus === 'pending' && (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1 shadow-2xs">
                            ⏳ Under Review
                          </span>
                        )}
                      </div>
                      <p className="text-slate-600 text-[13px] leading-relaxed font-medium bg-slate-50 p-4 rounded-2xl border border-slate-100/60 whitespace-pre-line">
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
                        {p.profession || p.occupation || 'N/A'}
                      </div>
                      <div>
                        <span className="text-slate-400 text-[10px] block mb-0.5">ANNUAL INCOME</span>
                        {p.annualIncome || p.income || 'N/A'}
                      </div>
                      <div>
                        <span className="text-slate-400 text-[10px] block mb-0.5">MARITAL STATUS</span>
                        {p.maritalStatus || 'N/A'}
                      </div>
                      <div>
                        <span className="text-slate-400 text-[10px] block mb-0.5">SIBLINGS</span>
                        {formatSiblings(p)}
                      </div>
                      <div className="col-span-2">
                        <span className="text-slate-400 text-[10px] block mb-0.5">SPOKEN LANGUAGES</span>
                        <span className="text-sky-700 font-extrabold">{formatLanguages(p.languages || p.motherTongue)}</span>
                      </div>
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
                  {/* Contact Info: Only 5 digits shown until unlocked, limits enforced */}
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
                  <div className="flex flex-col sm:flex-row gap-3">
                    <button
                      onClick={() => navigate('/messages', { state: { contactId: previewMatch?._id || previewMatch?.user?._id } })}
                      className="flex-1 py-3 bg-indigo-50 hover:bg-indigo-100 text-[#5D34F7] rounded-2xl font-black text-center text-xs flex items-center justify-center gap-1.5 border border-indigo-150 transition cursor-pointer"
                    >
                      <FontAwesomeIcon icon={faCommentDots} className="text-sm" />
                      Connected (Chat now)
                    </button>
                    <button
                      type="button"
                      onClick={() => initiateCancelMatch(previewMatch)}
                      className="px-5 py-3 border border-rose-200 hover:bg-rose-50 text-rose-600 rounded-2xl font-black text-center text-xs flex items-center justify-center gap-1.5 transition cursor-pointer active:scale-95"
                    >
                      <FontAwesomeIcon icon={faUserTimes} />
                      Cancel Match
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Cancel Match Confirmation Dialog */}
      {cancelDialogData.isOpen && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200"
          onClick={() => !isCancelling && setCancelDialogData({ isOpen: false, match: null, error: '' })}
        >
          <div
            className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-slate-100 relative animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-500 mb-4 shadow-sm">
                <FontAwesomeIcon icon={faExclamationTriangle} className="text-2xl" />
              </div>

              <h3 className="text-xl font-black text-slate-900 tracking-tight">
                Cancel Match?
              </h3>
              <p className="text-slate-500 text-xs sm:text-sm mt-2 leading-relaxed font-medium">
                Are you sure you want to cancel your match with{' '}
                <strong className="text-slate-800 font-black">
                  {cancelDialogData.match?.profile?.name || cancelDialogData.match?.email || 'this member'}
                </strong>
                ? You will no longer be connected as mutual matches and conversation access will be withdrawn.
              </p>

              {cancelDialogData.error && (
                <div className="w-full mt-3 p-3 bg-rose-50 border border-rose-200 text-rose-600 rounded-xl text-xs font-bold text-center">
                  {cancelDialogData.error}
                </div>
              )}

              <div className="w-full grid grid-cols-2 gap-3 mt-6">
                <button
                  type="button"
                  disabled={isCancelling}
                  onClick={() => setCancelDialogData({ isOpen: false, match: null, error: '' })}
                  className="w-full py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold rounded-2xl text-xs transition cursor-pointer disabled:opacity-50 active:scale-95 border-0"
                >
                  Keep Match
                </button>
                <button
                  type="button"
                  disabled={isCancelling}
                  onClick={handleConfirmCancelMatch}
                  className="w-full py-3 px-4 bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-700 hover:to-red-700 text-white font-extrabold rounded-2xl text-xs shadow-md shadow-rose-600/20 transition cursor-pointer disabled:opacity-50 active:scale-95 border-0 flex items-center justify-center gap-1.5"
                >
                  {isCancelling ? (
                    <>
                      <FontAwesomeIcon icon={faSpinner} spin />
                      <span>Cancelling...</span>
                    </>
                  ) : (
                    <span>Confirm Cancellation</span>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[70] bg-slate-900 text-white px-6 py-3.5 rounded-2xl shadow-2xl text-xs sm:text-sm font-black flex items-center gap-2.5 animate-in fade-in slide-in-from-top-4 duration-300 border border-slate-700">
          <FontAwesomeIcon icon={toastMessage.type === 'error' ? faTimes : faCheck} className={toastMessage.type === 'error' ? 'text-rose-400' : 'text-emerald-400'} />
          <span>{toastMessage.text}</span>
        </div>
      )}

      <CallModal
        isOpen={callModalData.isOpen}
        onClose={() => setCallModalData(prev => ({ ...prev, isOpen: false }))}
        phone={callModalData.phone}
        name={callModalData.name}
        photo={callModalData.photo}
      />

      {/* Full-Screen Image Lightbox Viewer */}
      <FullScreenImageViewer
        isOpen={fullScreenImage.isOpen}
        onClose={() => setFullScreenImage(prev => ({ ...prev, isOpen: false }))}
        images={fullScreenImage.images}
        initialIndex={fullScreenImage.initialIndex}
        userName={fullScreenImage.userName}
        gender={fullScreenImage.gender}
        targetUserId={fullScreenImage.targetUserId}
        currentUserId={currentUserProfile?._id}
      />
    </div>
  );
}
