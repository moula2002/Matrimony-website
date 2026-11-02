import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api, { getPhotoUrl, getDefaultAvatar, handleImageError } from '../api/axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faUser, faMapMarkerAlt, faBriefcase, faHeart, faCommentDots, faSpinner, faSearch, faEye, faCheck, faCopy, faUserCheck, faPhone, faExpand, faChevronRight, faArrowRight, faClock, faCompass, faLanguage
} from '@fortawesome/free-solid-svg-icons';
import loadingImg from '../assets/loading.png';
import CallModal from '../components/CallModal';
import MessageSentModal from '../components/MessageSentModal';
import ContactInfoCard from '../components/ContactInfoCard';
import PhotoVerifiedBadge from '../components/PhotoVerifiedBadge';
import FullScreenImageViewer from '../components/FullScreenImageViewer';
import EmptyState from '../components/EmptyState';
import VipConsultantModal from '../components/VipConsultantModal';
import { getCachedUnlockedContacts, syncContactedProfiles } from '../utils/contactManager';
import { formatProfileCreatedBy, formatSiblings, formatLanguages } from '../utils/profileHelpers';
import { recordProfileView } from '../utils/viewManager';

const FEED_TABS = [
  {
    id: 'matches',
    label: 'Preference Matches',
    subtitle: 'Explore matching profiles based on your partner preferences',
    icon: faHeart,
    iconColor: 'text-pink-500',
    query: ''
  },
  {
    id: 'recent',
    label: 'Recently Added',
    subtitle: 'Newly registered opposite-gender profiles ready to connect',
    icon: faClock,
    iconColor: 'text-cyan-500',
    query: '?tab=recent'
  },
  {
    id: 'more',
    label: 'More Profiles',
    subtitle: 'Discover member profiles outside your partner preferences',
    icon: faCompass,
    iconColor: 'text-indigo-500',
    query: '?tab=more'
  },
  {
    id: 'views',
    label: 'Viewed You',
    subtitle: 'Members who visited or viewed your matrimony profile',
    icon: faEye,
    iconColor: 'text-amber-500',
    query: '?tab=views'
  }
];

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

export default function PreferenceMatches() {
  const [prefMatches, setPrefMatches] = useState([]);
  const [profile, setProfile] = useState(null);
  const [sendingInterestMap, setSendingInterestMap] = useState({});
  const [sentInterests, setSentInterests] = useState({});
  const [loading, setLoading] = useState(true);
  const [feedError, setFeedError] = useState('');
  const [previewMatch, setPreviewMatch] = useState(null);
  const [callModalData, setCallModalData] = useState({ isOpen: false, phone: '', name: '', photo: '' });
  const [messageSentModal, setMessageSentModal] = useState({ isOpen: false, user: null });
  const [activePreviewImage, setActivePreviewImage] = useState(null);
  const [copiedUid, setCopiedUid] = useState(null);
  const [kundaliResult, setKundaliResult] = useState(null);
  const [isMatchingKundali, setIsMatchingKundali] = useState(false);
  const [showVipModal, setShowVipModal] = useState(false);

  // Feature 16: Customise Initial Message State
  const DEFAULT_INITIAL_MSG = "Hi, I liked your profile and would love to connect. Please accept my interest if you'd like to take things forward!";
  const [customMessageModal, setCustomMessageModal] = useState({
    isOpen: false,
    receiverId: null,
    targetUser: null,
    message: DEFAULT_INITIAL_MSG
  });

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
  const [kundaliError, setKundaliError] = useState('');
  const [unlockedContacts, setUnlockedContacts] = useState(getCachedUnlockedContacts());
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const currentTab = searchParams.get('tab') || 'matches';
  const activeTabConfig = FEED_TABS.find(t => t.id === currentTab) || FEED_TABS[0];

  const isPremium = Boolean(
    profile?.premiumMembership?.isPremium ||
    profile?.profile?.premiumMembership?.isPremium
  );

  const [banners, setBanners] = useState([]);

  // Tapping the card opens the Profile Details page and counts as a profile view
  const handleOpenProfileDetails = (targetUserId, e) => {
    if (e) e.stopPropagation();
    if (!targetUserId) return;
    recordProfileView(targetUserId, profile?._id);
    navigate(`/profile/${targetUserId}`);
  };

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const res = await api.get('/public/banners');
        if (Array.isArray(res.data) && res.data.length > 0) {
          setBanners(res.data.filter(b => b.isActive !== false));
        } else {
          setBanners([
            {
              id: 'b1',
              tag: 'FEATURED RECOMMENDATION',
              title: 'Discover 100% Verified Profiles',
              subtitle: 'Connect with authentic members verified through government identification.',
              buttonText: 'Explore Plans',
              linkUrl: '/plans',
              image: 'https://images.unsplash.com/photo-1607190074257-dd4b7af0309f?auto=format&fit=crop&w=800&q=80'
            },
            {
              id: 'b2',
              tag: 'PREMIUM MEMBERSHIP',
              title: 'Find Your Perfect Match Faster',
              subtitle: 'Premium members get direct contact access, horoscope matching & unlimited chats.',
              buttonText: 'Upgrade Now',
              linkUrl: '/plans',
              image: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80'
            }
          ]);
        }
      } catch {
        setBanners([
          {
            id: 'b1',
            tag: 'FEATURED RECOMMENDATION',
            title: 'Discover 100% Verified Profiles',
            subtitle: 'Connect with authentic members verified through government identification.',
            buttonText: 'Explore Plans',
            linkUrl: '/plans',
            image: 'https://images.unsplash.com/photo-1607190074257-dd4b7af0309f?auto=format&fit=crop&w=800&q=80'
          }
        ]);
      }
    };
    fetchBanners();
  }, []);

  const handlePreviewProfile = (match, photo) => {
    setPreviewMatch(match);
    setActivePreviewImage(photo);
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

  // Feature 16: Custom Introductory Message Handlers
  const openSendInterestModal = (receiverId, targetUser) => {
    const userObj = targetUser || prefMatches.find(m => (m._id || m.id) === receiverId) || previewMatch;
    setCustomMessageModal({
      isOpen: true,
      receiverId,
      targetUser: userObj,
      message: DEFAULT_INITIAL_MSG
    });
  };

  const handleConfirmSendInterest = async () => {
    const { receiverId, message, targetUser } = customMessageModal;
    if (!receiverId) return;
    setSendingInterestMap(prev => ({ ...prev, [receiverId]: true }));
    setCustomMessageModal(prev => ({ ...prev, isOpen: false }));
    try {
      await api.post('/users/interests', {
        receiverId,
        message: (message && message.trim()) ? message.trim() : DEFAULT_INITIAL_MSG
      });
      setSentInterests(prev => ({ ...prev, [receiverId]: true }));
      const targetMatch = targetUser || prefMatches.find(m => (m._id || m.id) === receiverId) || previewMatch;
      if (targetMatch) {
        setMessageSentModal({ isOpen: true, user: targetMatch });
      }
    } catch (err) {
      console.error('Error sending interest:', err);
    } finally {
      setSendingInterestMap(prev => ({ ...prev, [receiverId]: false }));
    }
  };

  const handleSendInterest = (receiverId, targetUser) => {
    openSendInterestModal(receiverId, targetUser);
  };

  useEffect(() => {
    let isCancelled = false;
    const fetchTabData = async () => {
      try {
        setLoading(true);

        if (!profile) {
          const profileRes = await api.get('/users/profile').catch(() => null);
          if (profileRes?.data && !isCancelled) {
            setProfile(profileRes.data);
            const isUserPrem = profileRes.data?.premiumMembership?.isPremium || false;
            if (isUserPrem) {
              syncContactedProfiles().then((cached) => {
                if (cached && !isCancelled) setUnlockedContacts(cached);
              });
            }
          }
        }

        let endpoint = '/users/matches';
        if (currentTab === 'recent') {
          endpoint = '/users/recently-added';
        } else if (currentTab === 'more') {
          endpoint = '/users/more-profiles';
        } else if (currentTab === 'views') {
          endpoint = '/users/viewed-you';
        }

        const [res, chatsRes, sentRes, receivedRes] = await Promise.all([
          api.get(endpoint),
          api.get('/users/chats').catch(() => ({ data: [] })),
          api.get('/users/interests/sent').catch(() => ({ data: [] })),
          api.get('/users/interests/received').catch(() => ({ data: [] }))
        ]);

        if (!isCancelled) {
          const rawProfiles = Array.isArray(res.data) ? res.data : [];

          // Collect all mutual matches (accepted chats or interests)
          const matchedIds = new Set();
          (chatsRes.data || []).forEach(c => {
            const id = c?._id || c?.id;
            if (id) matchedIds.add(String(id));
          });
          (sentRes.data || []).forEach(item => {
            if (item.status === 'accepted') {
              const id = item.receiver?._id || item.receiver;
              if (id) matchedIds.add(String(id));
            }
          });
          (receivedRes.data || []).forEach(item => {
            if (item.status === 'accepted') {
              const id = item.sender?._id || item.sender;
              if (id) matchedIds.add(String(id));
            }
          });

          // Features 10 & 15: Exclude mutual matches from matches, recent, and more tabs
          let filtered = rawProfiles;
          if (currentTab === 'matches' || currentTab === 'recent' || currentTab === 'more' || !currentTab) {
            filtered = rawProfiles.filter(p => {
              const pId = String(p._id || p.id || '');
              return !matchedIds.has(pId);
            });
          }

          // Feature 10: Sort More Profiles tab by VIP > Other Premium > Free
          if (currentTab === 'more') {
            const getTier = (u) => {
              const pm = u?.premiumMembership || u?.profile?.premiumMembership || {};
              const isVip = pm.isPremium && (pm.managedByUs || String(pm.planType || '').toLowerCase().includes('vip'));
              if (isVip || u?.isVip || u?.profile?.isVip) return 3;
              if (pm.isPremium || u?.isPremium || u?.profile?.isPremium) return 2;
              return 1;
            };
            filtered = [...filtered].sort((a, b) => getTier(b) - getTier(a));
          }

          setPrefMatches(filtered);
          setFeedError('');
        }
      } catch (err) {
        console.error('Error fetching feed data for tab:', currentTab, err);
        if (!isCancelled) {
          setPrefMatches([]);
          setFeedError(err.response?.data?.message || err.message || 'Unable to connect to matching service.');
        }
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    };

    fetchTabData();

    return () => {
      isCancelled = true;
    };
  }, [currentTab]);

  const handleContactUnlocked = (targetId, unlockedData) => {
    setUnlockedContacts((prev) => ({
      ...prev,
      [targetId]: unlockedData
    }));
    setPrefMatches((prev) =>
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

  return (
    <div className="bg-transparent min-h-screen py-8 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto lg:mx-0 lg:ml-6 xl:ml-10 space-y-6 lg:px-8">

        {/* Header Section */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
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
              <span>{activeTabConfig.label}</span>
            </h1>
            <p className="text-slate-400 text-xs font-bold uppercase mt-1 tracking-wider">
              {activeTabConfig.subtitle}
            </p>
          </div>
          <span className="bg-[#5D34F7] text-white text-xs px-3.5 py-1.5 rounded-full font-black shadow-sm self-start sm:self-center">
            Total: {prefMatches.length}
          </span>
        </div>

        {/* Feed Category Navigation Tabs Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 custom-scrollbar">
          {FEED_TABS.map((tab) => {
            const isTabSelected = (currentTab === tab.id) || (!searchParams.get('tab') && tab.id === 'matches');
            return (
              <button
                key={tab.id}
                onClick={() => navigate(tab.query ? `/preference-matches${tab.query}` : '/preference-matches')}
                className={`px-4 sm:px-5 py-2.5 sm:py-3 rounded-2xl text-xs font-black transition-all cursor-pointer whitespace-nowrap flex items-center gap-2.5 border ${
                  isTabSelected
                    ? 'bg-[#5D34F7] text-white border-[#5D34F7] shadow-md shadow-[#5D34F7]/25'
                    : 'bg-white text-slate-600 border-slate-100 hover:bg-slate-50 hover:text-[#5D34F7]'
                }`}
              >
                <FontAwesomeIcon icon={tab.icon} className={isTabSelected ? 'text-white' : tab.iconColor} />
                <span>{tab.label}</span>
                {isTabSelected && (
                  <span className="ml-0.5 px-2 py-0.5 rounded-full text-[10px] bg-white/20 text-white font-extrabold">
                    {prefMatches.length}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Send Interests Cards Grid */}
        {loading ? (
          <div className="bg-white rounded-3xl p-12 shadow-sm border border-slate-100 flex flex-col items-center justify-center min-h-[400px]">
            <img src={loadingImg} alt="Loading..." className="h-12 w-12 animate-spin object-contain" />
            <p className="text-slate-400 text-xs font-bold mt-4 tracking-wider uppercase">Loading Recommended Profiles...</p>
          </div>
        ) : feedError ? (
          <EmptyState
            type="error"
            title="Failed to Load Recommendations"
            description={feedError}
            primaryAction={{
              label: 'Retry Loading',
              onClick: () => {
                setFeedError('');
                setLoading(true);
                api.get(FEED_TABS.find(t => t.id === currentTab)?.query ? `/users/matches?${FEED_TABS.find(t => t.id === currentTab)?.query}` : '/users/matches')
                  .then(res => {
                    setPrefMatches(res.data || []);
                    setLoading(false);
                  })
                  .catch(err => {
                    setFeedError(err.response?.data?.message || err.message || 'Unable to load profiles.');
                    setLoading(false);
                  });
              }
            }}
          />
        ) : prefMatches.length === 0 ? (
          <EmptyState
            type="matches"
            title={
              currentTab === 'recent'
                ? 'No Recently Added Profiles'
                : currentTab === 'more'
                ? 'All Profiles Match Your Criteria'
                : currentTab === 'views'
                ? 'No Profile Visitors Yet'
                : 'No Matching Profiles Found'
            }
            badge={
              currentTab === 'recent'
                ? 'New Members'
                : currentTab === 'more'
                ? 'More Matches'
                : currentTab === 'views'
                ? 'Profile Visitors'
                : 'Partner Preferences'
            }
            description={
              currentTab === 'recent'
                ? 'There are no newly registered profiles in this category right now. Explore your curated preference matches to connect with members!'
                : currentTab === 'more'
                ? 'All available accounts in the system already match your preferred criteria. Check back soon as new members join daily!'
                : currentTab === 'views'
                ? 'Members have not viewed your profile yet. Completing your profile details and uploading verified photos will significantly increase visits.'
                : 'We could not find profiles matching all your strict preference filters. Broaden your criteria to discover more matches!'
            }
            suggestions={
              currentTab === 'views'
                ? [
                    'Upload clear profile photos to gain up to 5x more views',
                    'Write a detailed About Me bio sharing your interests and background',
                    'Send interests to matching members to encourage reciprocal profile visits'
                  ]
                : currentTab === 'recent'
                ? [
                    'Check your main Preference Matches tab to view all matching accounts',
                    'Search all profiles directly using flexible filters'
                  ]
                : [
                    'Broaden age range and height range in your Partner Preferences',
                    'Select "Open to All" for communities and castes to view more families',
                    'Check the Search page to explore all eligible accounts'
                  ]
            }
            primaryAction={
              currentTab === 'views'
                ? {
                    label: 'Complete / Edit Profile',
                    onClick: () => navigate('/profile')
                  }
                : currentTab === 'recent'
                ? {
                    label: 'View Preference Matches',
                    onClick: () => navigate('/preference-matches')
                  }
                : currentTab === 'more'
                ? {
                    label: 'Search All Profiles',
                    onClick: () => navigate('/search')
                  }
                : {
                    label: 'Update Partner Preferences',
                    onClick: () => navigate('/profile', { state: { tab: 'preferences' } })
                  }
            }
            secondaryAction={
              currentTab !== 'more'
                ? {
                    label: 'Search All Profiles',
                    onClick: () => navigate('/search')
                  }
                : undefined
            }
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {prefMatches.map((match, index) => {
              const p = match.profile || {};
              const isSending = sendingInterestMap[match._id];
              const isSent = sentInterests[match._id] || (match.interestStatus === 'pending' && match.interestSender === profile?._id);

              const showBannerAfter = (index + 1) % 10 === 0;
              const bannerIndex = Math.floor(index / 10) % (banners.length || 1);
              const currentBanner = banners[bannerIndex] || banners[0];

              return (
                <div key={match._id} className="contents">
                  <div
                    onClick={(e) => handleOpenProfileDetails(match._id, e)}
                    className="bg-white rounded-3xl overflow-hidden shadow-md border border-slate-100 flex flex-col hover:shadow-xl hover:-translate-y-1 transition duration-300 relative group cursor-pointer"
                  >
                    {/* Photo Container - Tapping photo opens Full Screen viewer */}
                    <div
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenFullScreenImage(match, 0);
                      }}
                      className="h-52 bg-slate-100 relative overflow-hidden flex items-center justify-center cursor-pointer group/img"
                      title="Click to view photo in full screen"
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

                      <PhotoVerifiedBadge user={match} variant="photo" className="absolute top-3 right-3" />

                      {/* Hover full screen overlay */}
                      <div className="absolute inset-0 bg-black/35 flex items-center justify-center opacity-0 group-hover/img:opacity-100 transition duration-300">
                        <div className="bg-white/95 backdrop-blur-md px-4 py-2 rounded-2xl flex items-center gap-2 text-slate-800 font-extrabold text-xs shadow-md transform translate-y-2 group-hover/img:translate-y-0 transition duration-300">
                          <FontAwesomeIcon icon={faExpand} className="text-[#5D34F7] text-xs" />
                          <span>View Full Screen</span>
                        </div>
                      </div>
                    </div>

                    {/* Body Content - Shows only till About Me section */}
                    <div className="p-5 flex-1 flex flex-col justify-between space-y-3.5">
                      <div className="space-y-2.5">
                        {/* Name & View Details Indicator */}
                        <div className="flex items-center justify-between gap-1.5">
                          <h3
                            className="font-black text-slate-800 text-sm leading-tight flex items-center gap-1.5 group-hover:text-[#5D34F7] transition-colors truncate"
                            title={p.name || match.email || 'Matrimony Member'}
                          >
                            <span className="truncate">{p.name || match.email || 'Matrimony Member'}</span>
                            <PhotoVerifiedBadge user={match} variant="badge" />
                            {p.gender === 'Female' && <span className="text-pink-500 text-[13px] leading-none shrink-0" title="Female">♀️</span>}
                            {p.gender === 'Male' && <span className="text-blue-500 text-[13px] leading-none shrink-0" title="Male">♂️</span>}
                          </h3>
                          <span className="text-[10px] font-bold text-[#5D34F7] hover:underline shrink-0 flex items-center gap-0.5">
                            <span>Details</span>
                            <FontAwesomeIcon icon={faChevronRight} className="text-[8px]" />
                          </span>
                        </div>

                        {/* Location & Profile Created By */}
                        <div className="flex items-center justify-between gap-2 flex-wrap">
                          <p className="text-slate-400 text-xs font-semibold flex items-center gap-1">
                            <FontAwesomeIcon icon={faMapMarkerAlt} className="text-[10px]" />
                            <span>{p.location || p.city || 'Location N/A'}</span>
                          </p>
                          {formatProfileCreatedBy(p.profileFor || match.profileFor) && (
                            <span className="text-[10px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-lg border border-slate-200/60 flex items-center gap-1 shadow-2xs">
                              <span className="text-[9px] text-slate-400 font-semibold uppercase">By:</span>
                              <span className="font-extrabold text-[#5D34F7]">{formatProfileCreatedBy(p.profileFor || match.profileFor)}</span>
                            </span>
                          )}
                        </div>

                        {/* Basic Attributes: Age, Height, Profession */}
                        <div className="grid grid-cols-2 gap-y-1 gap-x-2 text-[11px] text-slate-600 font-bold border-t border-slate-100 pt-2.5">
                          <div>Age: {p.age || 'N/A'} yrs</div>
                          <div>Height: {p.height || 'N/A'}</div>
                          <div className="col-span-2 truncate flex items-center gap-1 text-slate-500">
                            <FontAwesomeIcon icon={faBriefcase} className="text-slate-400 text-[10px]" />
                            <span className="truncate">{p.profession || p.occupation || 'Profession N/A'}</span>
                          </div>
                          {((p.languages && p.languages.length > 0) || p.motherTongue) && (
                            <div className="col-span-2 truncate flex items-center gap-1 text-[11px] text-sky-700 font-bold">
                              <FontAwesomeIcon icon={faLanguage} className="text-sky-500 text-[10px]" />
                              <span className="truncate">{formatLanguages(p.languages || p.motherTongue)}</span>
                            </div>
                          )}
                        </div>

                        {/* About Me Section - Card displays only till this section */}
                        <div className="border-t border-slate-100 pt-2.5">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">About Me</span>
                            <span className="text-[10px] font-bold text-[#5D34F7] opacity-0 group-hover:opacity-100 transition-opacity">
                              Tap for full profile &rarr;
                            </span>
                          </div>
                          <p className="text-xs text-slate-600 line-clamp-2 font-medium leading-relaxed bg-slate-50/70 p-2.5 rounded-xl border border-slate-100/60">
                            {p.about || p.bio || 'Looking for a compatible life partner with good family values and mutual understanding.'}
                          </p>
                        </div>
                      </div>

                      {/* Card Actions Footer - stopPropagation prevents opening profile details when clicking action buttons */}
                      <div className="pt-2 border-t border-slate-100" onClick={(e) => e.stopPropagation()}>
                        {match.interestStatus === 'accepted' ? (
                          <div className="space-y-2">
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
                            <button
                              onClick={() => navigate('/messages', { state: { contactId: match._id || match.user?._id } })}
                              className="w-full py-2.5 bg-indigo-50 hover:bg-indigo-100 text-[#5D34F7] rounded-xl font-black text-center text-xs flex items-center justify-center gap-1.5 border border-indigo-150 transition cursor-pointer"
                            >
                              <FontAwesomeIcon icon={faCommentDots} className="text-xs" />
                              <span>Connected (Chat now)</span>
                            </button>
                          </div>
                        ) : (match.interestStatus === 'pending' && match.interestSender !== profile?._id) ? (
                          <div className="space-y-1.5">
                            <button
                              onClick={() => navigate('/interests')}
                              className="w-full py-2.5 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-black rounded-xl text-xs shadow-md shadow-emerald-500/20 transition cursor-pointer flex items-center justify-center gap-1.5"
                            >
                              <FontAwesomeIcon icon={faCheck} className="text-xs" />
                              <span>Accept Interest</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handlePreviewProfile(match, p.photos && p.photos[0] ? getPhotoUrl(p.photos[0], p.gender) : null)}
                              className="w-full py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-xl font-black text-xs transition cursor-pointer flex items-center justify-center gap-1.5 border border-emerald-200/80"
                              title="View Contact Info"
                            >
                              <FontAwesomeIcon icon={faPhone} className="text-xs text-emerald-600" />
                              <span>Contact Info</span>
                            </button>
                          </div>
                        ) : isSent ? (
                          <div className="space-y-1.5">
                            <div className="w-full py-1.5 bg-emerald-50 text-emerald-700 rounded-xl font-black text-center text-xs flex items-center justify-center gap-1.5 border border-emerald-150 shadow-inner">
                              <FontAwesomeIcon icon={faCheck} className="text-xs text-emerald-600" />
                              <span>Interest Sent</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => handlePreviewProfile(match, p.photos && p.photos[0] ? getPhotoUrl(p.photos[0], p.gender) : null)}
                                className="flex-1 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-xl font-black text-xs transition cursor-pointer flex items-center justify-center gap-1.5 border border-emerald-200/80"
                                title="View Contact Info"
                              >
                                <FontAwesomeIcon icon={faPhone} className="text-xs text-emerald-600" />
                                <span>Contact Info</span>
                              </button>
                              <button
                                onClick={() => navigate('/messages', { state: { contactId: match._id || match.user?._id } })}
                                className="px-3.5 py-2 bg-[#5D34F7] hover:bg-[#4024DB] text-white font-bold text-xs rounded-xl transition flex items-center gap-1 shadow-xs cursor-pointer active:scale-95 shrink-0"
                                title="Chat with match"
                              >
                                <FontAwesomeIcon icon={faCommentDots} className="text-xs" />
                                <span>Chat</span>
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex gap-2">
                            <button
                              disabled={isSending}
                              onClick={() => handleSendInterest(match._id)}
                              className="flex-1 py-2.5 bg-gradient-to-r from-[#5D34F7] to-[#4024DB] hover:from-[#4f27e5] hover:to-[#381fcc] text-white font-black rounded-xl text-xs shadow-md shadow-[#5D34F7]/25 hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 active:scale-[0.98]"
                            >
                              {isSending ? (
                                <FontAwesomeIcon icon={faSpinner} spin className="text-xs" />
                              ) : (
                                <>
                                  <FontAwesomeIcon icon={faHeart} className="text-xs text-pink-300" />
                                  <span>Send Interest</span>
                                </>
                              )}
                            </button>
                            <button
                              type="button"
                              onClick={() => handlePreviewProfile(match, p.photos && p.photos[0] ? getPhotoUrl(p.photos[0], p.gender) : null)}
                              className="px-3 py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-xl font-black text-xs transition cursor-pointer flex items-center gap-1.5 border border-emerald-200/80 shrink-0"
                              title="View Contact Info"
                            >
                              <FontAwesomeIcon icon={faPhone} className="text-xs text-emerald-600" />
                              <span>Contact Info</span>
                            </button>
                          </div>
                        )}
                        {/* Feature 7: VIP User Consultant Interaction */}
                        {(profile?.premiumMembership?.isPremium && (profile?.premiumMembership?.managedByUs || profile?.premiumMembership?.planType?.toLowerCase().includes('vip'))) && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setShowVipModal(true);
                            }}
                            className="w-full mt-2 py-2 bg-gradient-to-r from-amber-400 to-orange-400 hover:from-amber-300 hover:to-orange-300 text-slate-950 rounded-xl font-black text-xs transition cursor-pointer flex items-center justify-center gap-1.5 shadow-sm active:scale-95"
                            title="Call VIP Relationship Consultant for personalized assistance"
                          >
                            <span>👑 Call Consultant</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Show Featured Recommendation Banner after scrolling 10 profiles */}
                  {showBannerAfter && currentBanner && (
                    <div
                      key={`banner-${index}-${currentBanner.id || currentBanner._id || bannerIndex}`}
                      onClick={() => {
                        const title = (currentBanner.title || '').toLowerCase();
                        const tag = (currentBanner.tag || '').toLowerCase();
                        // Feature 6: VIP Support Banners redirect to tel:18004196000
                        if (title.includes('vip') || tag.includes('vip') || tag.includes('consultant')) {
                          window.location.href = 'tel:18004196000';
                          return;
                        }
                        if (currentBanner.linkUrl) {
                          if (currentBanner.linkUrl.startsWith('tel:')) {
                            window.location.href = currentBanner.linkUrl;
                          } else if (currentBanner.linkUrl.startsWith('http')) {
                            window.open(currentBanner.linkUrl, '_blank', 'noopener,noreferrer');
                          } else {
                            navigate(currentBanner.linkUrl);
                          }
                        } else {
                          window.location.href = 'tel:18004196000';
                        }
                      }}
                      className="col-span-full rounded-3xl overflow-hidden shadow-lg border border-slate-100 relative group cursor-pointer my-4 bg-gradient-to-r from-[#5D34F7] via-[#5227d8] to-[#4024DB] text-white p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 hover:shadow-xl transition-all duration-300"
                    >
                      <div className="space-y-2 text-center md:text-left z-10 max-w-2xl">
                        <span className="px-3 py-1 rounded-full bg-white/20 text-white text-[10px] font-black uppercase tracking-wider inline-block">
                          {currentBanner.tag || 'Featured Recommendation'}
                        </span>
                        <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                          {currentBanner.title || 'Discover Premium Verified Matches'}
                        </h3>
                        <p className="text-white/80 text-xs sm:text-sm font-medium leading-relaxed">
                          {currentBanner.subtitle || "Upgrade to premium to view verified direct phone numbers, unlimited chats, and faster connections."}
                        </p>
                      </div>

                      <div className="flex items-center gap-4 z-10 shrink-0">
                        {(currentBanner.imageUrl || currentBanner.image) && (
                          <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden shrink-0 shadow-md border-2 border-white/20 hidden lg:block">
                            <img
                              src={getPhotoUrl(currentBanner.imageUrl || currentBanner.image)}
                              alt="Banner visual"
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          </div>
                        )}
                        <button
                          type="button"
                          className="px-6 py-3 bg-white text-[#5D34F7] hover:bg-slate-50 font-black text-xs rounded-full shadow-lg transition active:scale-95 shrink-0 cursor-pointer"
                        >
                          {currentBanner.buttonText || 'Upgrade Plan'} &rarr;
                        </button>
                      </div>

                      {/* Ambient Decorative Accents */}
                      <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none" />
                      <div className="absolute -left-10 -top-10 w-48 h-48 bg-purple-400/10 rounded-full blur-2xl pointer-events-none" />
                    </div>
                  )}
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
                  <PhotoVerifiedBadge user={previewMatch} variant="photo" className="absolute top-4 right-4" />
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
                  {previewMatch.interestStatus === 'accepted' ? (
                    <div className="flex gap-4">
                      <button
                        onClick={() => navigate('/messages', { state: { contactId: previewMatch?._id || previewMatch?.user?._id } })}
                        className="w-full py-3 bg-indigo-50 hover:bg-indigo-100 text-[#5D34F7] rounded-2xl font-black text-center text-xs flex items-center justify-center gap-1.5 border border-indigo-150 transition cursor-pointer"
                      >
                        <FontAwesomeIcon icon={faCommentDots} className="text-sm" />
                        Connected (Chat now)
                      </button>
                    </div>
                  ) : (previewMatch.interestStatus === 'pending' && previewMatch.interestSender !== profile?._id) ? (
                    <div className="flex gap-4">
                      <button
                        onClick={() => navigate('/interests')}
                        className="w-full py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-black rounded-2xl text-xs shadow-md shadow-emerald-500/25 transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <FontAwesomeIcon icon={faCheck} className="text-sm" />
                        Accept Interest
                      </button>
                    </div>
                  ) : (sentInterests[previewMatch._id] || (previewMatch.interestStatus === 'pending' && previewMatch.interestSender === profile?._id)) ? (
                    <div className="space-y-2.5 w-full">
                      <div className="w-full py-2.5 bg-emerald-50 text-emerald-700 rounded-2xl font-black text-center text-xs flex items-center justify-center gap-1.5 border border-emerald-150 shadow-inner">
                        <FontAwesomeIcon icon={faCheck} className="text-sm" />
                        <span>Interest Sent Successfully</span>
                      </div>
                      <div className="bg-slate-50 border border-slate-100 rounded-2xl p-3 flex items-center justify-between gap-3">
                        <span className="text-xs font-black text-slate-600 uppercase tracking-wider">Next Step:</span>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => navigate('/messages', { state: { contactId: previewMatch?._id || previewMatch?.user?._id } })}
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
                    <div className="flex flex-col gap-2.5">
                      <button
                        disabled={sendingInterestMap[previewMatch._id]}
                        onClick={() => handleSendInterest(previewMatch._id, previewMatch)}
                        className="w-full py-3 bg-gradient-to-r from-[#5D34F7] to-[#4024DB] hover:from-[#4f27e5] hover:to-[#381fcc] text-white font-black rounded-2xl text-xs shadow-md shadow-[#5D34F7]/25 hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 active:scale-[0.98]"
                      >
                        {sendingInterestMap[previewMatch._id] ? (
                          <FontAwesomeIcon icon={faSpinner} spin className="text-sm" />
                        ) : (
                          <>
                            <FontAwesomeIcon icon={faHeart} className="text-sm" />
                            Send Interest
                          </>
                        )}
                      </button>
                      {/* Feature 7: VIP consultant button in preview modal */}
                      {(profile?.premiumMembership?.isPremium && (profile?.premiumMembership?.managedByUs || profile?.premiumMembership?.planType?.toLowerCase().includes('vip'))) && (
                        <button
                          type="button"
                          onClick={() => setShowVipModal(true)}
                          className="w-full py-3 bg-gradient-to-r from-amber-400 to-orange-400 hover:from-amber-300 hover:to-orange-300 text-slate-950 font-black rounded-2xl text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98]"
                          title="Call VIP Relationship Consultant for personalized assistance"
                        >
                          <span>👑 Call VIP Consultant</span>
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Feature 16: Customise Initial Message Modal */}
      {customMessageModal.isOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 space-y-5 animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-pink-50 text-pink-600 rounded-2xl border border-pink-100">
                  <FontAwesomeIcon icon={faHeart} className="text-lg" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">Express Interest</h3>
                  <p className="text-xs text-slate-500">Personalize your introductory message</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setCustomMessageModal(prev => ({ ...prev, isOpen: false }))}
                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition cursor-pointer text-sm font-bold"
              >
                ✕
              </button>
            </div>

            {/* Recipient Snippet */}
            {customMessageModal.targetUser && (
              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-200 shrink-0 border border-white shadow-xs">
                  <img
                    src={getPhotoUrl(customMessageModal.targetUser.profile?.photos?.[0], customMessageModal.targetUser.profile?.gender)}
                    alt="Recipient"
                    onError={(e) => handleImageError(e, customMessageModal.targetUser.profile?.gender)}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="min-w-0">
                  <h4 className="text-sm font-bold text-slate-900 truncate">
                    {customMessageModal.targetUser.profile?.name || customMessageModal.targetUser.email || 'Member'}
                  </h4>
                  <p className="text-xs text-slate-500 truncate">
                    UID: {customMessageModal.targetUser.uid || customMessageModal.targetUser.famId || 'FAM00000'}
                  </p>
                </div>
              </div>
            )}

            {/* Quick Templates */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Quick Message Templates
              </label>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setCustomMessageModal(prev => ({ ...prev, message: "Hi, I liked your profile and would love to connect. Please accept my interest if you'd like to take things forward!" }))}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-[#5D34F7]/10 hover:text-[#5D34F7] text-slate-700 text-xs font-semibold rounded-xl transition border border-slate-200/60 cursor-pointer"
                >
                  ✨ Standard
                </button>
                <button
                  type="button"
                  onClick={() => setCustomMessageModal(prev => ({ ...prev, message: "Namaste, our family came across your profile and found our values aligned. We would be glad to connect and know each other better." }))}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-[#5D34F7]/10 hover:text-[#5D34F7] text-slate-700 text-xs font-semibold rounded-xl transition border border-slate-200/60 cursor-pointer"
                >
                  🏡 Family / Traditional
                </button>
                <button
                  type="button"
                  onClick={() => setCustomMessageModal(prev => ({ ...prev, message: "Hello, I viewed your profile and educational background. We seem to share common values and interests, and I would love to connect." }))}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-[#5D34F7]/10 hover:text-[#5D34F7] text-slate-700 text-xs font-semibold rounded-xl transition border border-slate-200/60 cursor-pointer"
                >
                  💼 Professional & Values
                </button>
              </div>
            </div>

            {/* Message Textarea */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-xs font-bold text-slate-700">
                  Your Message
                </label>
                <span className="text-[10px] text-slate-400 font-semibold">
                  {(customMessageModal.message || '').length} / 300 characters
                </span>
              </div>
              <textarea
                rows={4}
                maxLength={300}
                value={customMessageModal.message}
                onChange={(e) => setCustomMessageModal(prev => ({ ...prev, message: e.target.value }))}
                placeholder="Write a warm introductory note..."
                className="w-full p-3.5 border border-slate-200 rounded-2xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#5D34F7] focus:border-transparent bg-slate-50/50 resize-none transition"
              />
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setCustomMessageModal(prev => ({ ...prev, isOpen: false }))}
                className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 text-xs font-bold hover:bg-slate-50 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={sendingInterestMap[customMessageModal.receiverId]}
                onClick={handleConfirmSendInterest}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 disabled:opacity-50 text-white text-xs font-black shadow-md shadow-pink-500/20 transition cursor-pointer flex items-center gap-1.5 active:scale-95"
              >
                {sendingInterestMap[customMessageModal.receiverId] ? (
                  <>
                    <FontAwesomeIcon icon={faSpinner} spin className="text-xs" />
                    <span>Sending...</span>
                  </>
                ) : (
                  <>
                    <FontAwesomeIcon icon={faHeart} className="text-xs" />
                    <span>Send Interest Now</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      <CallModal
        isOpen={callModalData.isOpen}
        onClose={() => setCallModalData(prev => ({ ...prev, isOpen: false }))}
        phone={callModalData.phone}
        name={callModalData.name}
        photo={callModalData.photo}
      />

      {/* Message Sent Next Step Modal */}
      <MessageSentModal
        isOpen={messageSentModal.isOpen}
        onClose={() => setMessageSentModal({ isOpen: false, user: null })}
        user={messageSentModal.user}
        onChat={() => {
          const targetUser = messageSentModal.user;
          setMessageSentModal({ isOpen: false, user: null });
          navigate('/messages', { state: { contactId: targetUser?._id || targetUser?.user?._id } });
        }}
        onCall={() => {
          const u = messageSentModal.user;
          setMessageSentModal({ isOpen: false, user: null });
          if (u) {
            setCallModalData({
              isOpen: true,
              phone: u.profile?.phone || u.phone || 'Contact Phone Unspecified',
              name: u.profile?.name || u.name || u.email || 'Matrimony Member',
              photo: u.profile?.photos?.[0] || u.photos?.[0] || null
            });
          }
        }}
      />

      {/* Full Screen Image Viewer Lightbox */}
      <FullScreenImageViewer
        isOpen={fullScreenImage.isOpen}
        onClose={() => setFullScreenImage(prev => ({ ...prev, isOpen: false }))}
        images={fullScreenImage.images}
        initialIndex={fullScreenImage.initialIndex}
        userName={fullScreenImage.userName}
        gender={fullScreenImage.gender}
        targetUserId={fullScreenImage.targetUserId}
        currentUserId={profile?._id}
      />

      {/* VIP Consultant Modal */}
      <VipConsultantModal
        isOpen={showVipModal}
        onClose={() => setShowVipModal(false)}
        currentUser={profile}
      />
    </div>
  );
}
