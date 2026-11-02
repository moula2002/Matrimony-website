import { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faUser, faHeart, faSpinner, faEye, faCheck,
  faMapMarkerAlt, faBriefcase, faChevronDown, faChevronUp, faGraduationCap,
  faCalendarAlt, faRulerVertical, faSearch, faCommentDots, faPhone,
  faSliders, faFilter, faTimes, faUserCheck, faCopy, faRotateRight, faExpand, faBookmark, faBan, faLanguage
} from '@fortawesome/free-solid-svg-icons';
import api, { getPhotoUrl, getDefaultAvatar, handleImageError } from '../api/axios';
import loadingImg from '../assets/loading.png';
import CallModal from '../components/CallModal';
import MessageSentModal from '../components/MessageSentModal';
import ContactInfoCard from '../components/ContactInfoCard';
import PhotoVerifiedBadge from '../components/PhotoVerifiedBadge';
import FullScreenImageViewer from '../components/FullScreenImageViewer';
import EmptyState from '../components/EmptyState';
import { getCachedUnlockedContacts, syncContactedProfiles } from '../utils/contactManager';
import { formatProfileCreatedBy, formatSiblings, CHILDREN_FILTER_OPTIONS, profileMatchesChildrenFilter, formatChildrenDisplay, formatLanguages, normalizeChildrenForBackend, isZeroOrNoChildren } from '../utils/profileHelpers';

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

const POPULAR_CITIES = [
  'Mumbai', 'Bangalore', 'Delhi', 'Hyderabad', 'Pune', 'Chennai', 'Kolkata', 'Ahmedabad'
];

const POPULAR_LOCATIONS = [
  'Delhi NCR', 'Maharashtra', 'Karnataka', 'Tamil Nadu', 'Telangana', 'Gujarat', 'USA / NRI'
];

const SUGGESTED_SEARCHES = [
  { label: 'Mumbai', category: 'City', icon: '📍', value: 'Mumbai', criteria: 'city' },
  { label: 'Bangalore', category: 'City', icon: '📍', value: 'Bangalore', criteria: 'city' },
  { label: 'Delhi', category: 'City', icon: '📍', value: 'Delhi', criteria: 'city' },
  { label: 'Pune', category: 'City', icon: '📍', value: 'Pune', criteria: 'city' },
  { label: 'Bachelors', category: 'Education', icon: '🎓', value: 'Bachelors', criteria: 'education' },
  { label: 'Masters', category: 'Education', icon: '🎓', value: 'Masters', criteria: 'education' },
  { label: 'Engineering', category: 'Education', icon: '🎓', value: 'Engineering', criteria: 'education' },
  { label: 'Doctorate', category: 'Education', icon: '🎓', value: 'Doctorate', criteria: 'education' },
  { label: 'Maharashtra', category: 'Location', icon: '🗺️', value: 'Maharashtra', criteria: 'location' },
  { label: 'Software', category: 'Career', icon: '💼', value: 'Software', criteria: 'all' },
  { label: 'Doctor', category: 'Career', icon: '🩺', value: 'Doctor', criteria: 'all' }
];

const RELIGIONS = [
  'Hindu', 'Muslim', 'Christian', 'Sikh', 'Jain', 'Buddhist', 'Parsi', 'Jewish', 'Other'
];

const MARITAL_STATUSES = [
  'Never Married', 'Divorced', 'Widowed', 'Awaiting Divorce'
];

const EDUCATIONS = [
  'Bachelors', 'Masters', 'Doctorate', 'Engineering', 'Medicine', 'Business/Management', 'Diploma', 'Other'
];

const PROFESSIONS = [
  'IT & Software', 'Healthcare/Medical', 'Business/Self-Employed', 'Banking/Finance',
  'Government/Civil', 'Education/Teaching', 'Engineering', 'Other'
];

const DIETS = [
  'Veg', 'Non-Veg', 'Eggetarian', 'Vegan', 'Jain'
];

/**
 * Rigorous search eligibility validation:
 * 1. Exclude self
 * 2. Exclude admin accounts
 * 3. Exclude accounts blocked by the current user
 * 4. Exclude accounts that have blocked the current user
 * 5. Exclude accounts marked as globally blocked by admin (isBlocked === true)
 * 6. Exclude hidden accounts (isHidden === true or active isProfileHidden)
 * 7. Exclude profiles that have not completed onboarding
 */
export const isEligibleAccount = (user, currentUserId, blockedIdsSet) => {
  if (!user) return false;
  const uid = String(user._id || user.id || '');
  if (!uid) return false;

  // 1. Exclude self
  if (currentUserId && uid === String(currentUserId)) return false;

  // 2. Exclude admin accounts
  if (user.role === 'admin') return false;

  // 3. Exclude accounts blocked by the current user
  if (blockedIdsSet) {
    if (blockedIdsSet.has && blockedIdsSet.has(uid)) return false;
    if (Array.isArray(blockedIdsSet) && blockedIdsSet.includes(uid)) return false;
  }

  // 4. Exclude accounts that have blocked the current user
  if (currentUserId && Array.isArray(user.blockedUsers)) {
    const hasBlockedMe = user.blockedUsers.some(b => {
      const bId = typeof b === 'object' ? (b?._id || b?.id) : b;
      return String(bId) === String(currentUserId);
    });
    if (hasBlockedMe) return false;
  }

  // 5. Exclude accounts globally marked as blocked by admin
  if (user.isBlocked === true) return false;

  // 6. Exclude hidden profiles
  if (user.settings?.isHidden === true) return false;
  if (user.settings?.isProfileHidden === true) {
    if (!user.settings.hideEndDate || new Date(user.settings.hideEndDate) > new Date()) {
      return false;
    }
  }

  // 7. Ensure profile exists and has completed onboarding
  if (user.profile && user.profile.is_onboarding_complete === false) {
    return false;
  }

  return true;
};

export default function Search() {
  const [profile, setProfile] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchCriteria, setSearchCriteria] = useState('all'); // 'all', 'location', 'city', 'education', 'name_uid'
  const [fetchError, setFetchError] = useState('');
  const [allProfiles, setAllProfiles] = useState([]);
  const [serverResults, setServerResults] = useState(null);
  const [blockedUserIds, setBlockedUserIds] = useState(new Set());
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [sendingInterestMap, setSendingInterestMap] = useState({});
  const [sentInterests, setSentInterests] = useState({});
  const [expandedCards, setExpandedCards] = useState({});
  const [previewMatch, setPreviewMatch] = useState(null);
  const [activePreviewImage, setActivePreviewImage] = useState(null);
  const [callModalData, setCallModalData] = useState({ isOpen: false, phone: '', name: '', photo: '' });
  const [messageSentModal, setMessageSentModal] = useState({ isOpen: false, user: null });
  const [unlockedContacts, setUnlockedContacts] = useState(getCachedUnlockedContacts());
  const [copiedUid, setCopiedUid] = useState(null);
  const [kundaliResult, setKundaliResult] = useState(null);
  const [isMatchingKundali, setIsMatchingKundali] = useState(false);
  const [kundaliError, setKundaliError] = useState('');

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
      targetUserId: match._id || match.id
    });
  };

  // Filters State (Default: None selected = Open to All / Search Without Filters)
  const [showFilters, setShowFilters] = useState(false);
  const [filterGender, setFilterGender] = useState('all'); // 'all', 'Male', 'Female'
  const [filterAgeMin, setFilterAgeMin] = useState(18);
  const [filterAgeMax, setFilterAgeMax] = useState(70);
  const [filterReligions, setFilterReligions] = useState([]); // [] means open to all
  const [filterMaritalStatuses, setFilterMaritalStatuses] = useState([]); // [] means open to all
  const [filterChildren, setFilterChildren] = useState([]); // [] means open to all / None (Search without filters)
  const [filterEducations, setFilterEducations] = useState([]); // [] means open to all
  const [filterProfessions, setFilterProfessions] = useState([]); // [] means open to all
  const [filterDiets, setFilterDiets] = useState([]); // [] means open to all
  const [filterCity, setFilterCity] = useState('');
  const [filterLocation, setFilterLocation] = useState('');

  // Live count state from backend API (optional complement)
  const [backendLiveCount, setBackendLiveCount] = useState(null);
  const [isCountingMatches, setIsCountingMatches] = useState(false);
  const [isSavingPreferences, setIsSavingPreferences] = useState(false);
  const [savePrefSuccess, setSavePrefSuccess] = useState(false);
  const [savePrefError, setSavePrefError] = useState('');

  const navigate = useNavigate();

  // Load current user profile, blocked list, and all eligible accounts on initial mount
  const fetchInitialData = useCallback(async () => {
    try {
      setInitialLoading(true);
      const [
        profileRes,
        blockedRes,
        matchesRes,
        moreProfilesRes,
        recentlyAddedRes,
        sentInterestsRes,
        receivedInterestsRes,
        viewedYouRes
      ] = await Promise.all([
        api.get('/users/profile').catch(() => ({ data: null })),
        api.get('/users/blocked').catch(() => ({ data: [] })),
        api.get('/users/matches').catch(() => ({ data: [] })),
        api.get('/users/more-profiles?page=1&limit=200').catch(() => ({ data: [] })),
        api.get('/users/recently-added').catch(() => ({ data: [] })),
        api.get('/users/interests/sent').catch(() => ({ data: [] })),
        api.get('/users/interests/received').catch(() => ({ data: [] })),
        api.get('/users/viewed-you').catch(() => ({ data: [] }))
      ]);

      const currentUserId = String(profileRes.data?._id || profileRes.data?.id || '');

      // Build Set of blocked user IDs (from /users/blocked and currentUser.blockedUsers)
      const blockedIds = new Set();
      if (Array.isArray(blockedRes.data)) {
        blockedRes.data.forEach(b => {
          if (b.id) blockedIds.add(String(b.id));
          if (b._id) blockedIds.add(String(b._id));
        });
      }
      if (profileRes.data && Array.isArray(profileRes.data.blockedUsers)) {
        profileRes.data.blockedUsers.forEach(id => {
          const cleanId = typeof id === 'object' ? (id?._id || id?.id) : id;
          if (cleanId) blockedIds.add(String(cleanId));
        });
      }
      setBlockedUserIds(blockedIds);

      if (profileRes.data) {
        setProfile(profileRes.data);
        if (profileRes.data?.premiumMembership?.isPremium) {
          syncContactedProfiles().then((cached) => {
            if (cached) setUnlockedContacts(cached);
          });
        }
      }

      // Merge and deduplicate all eligible profiles across endpoints
      const profilesMap = new Map();
      const addCandidate = (candidate, extra = {}) => {
        if (!candidate) return;
        const u = candidate.user && typeof candidate.user === 'object' && candidate.user._id ? candidate.user : candidate;
        const uid = String(u._id || u.id || '');
        if (!uid) return;

        if (isEligibleAccount(u, currentUserId, blockedIds)) {
          const existing = profilesMap.get(uid);
          profilesMap.set(uid, {
            ...existing,
            ...u,
            ...extra,
            profile: {
              ...(existing?.profile || {}),
              ...(u.profile || {}),
              ...(extra.profile || {})
            }
          });
        }
      };

      (matchesRes.data || []).forEach(u => addCandidate(u));
      (moreProfilesRes.data || []).forEach(u => addCandidate(u));
      (recentlyAddedRes.data || []).forEach(u => addCandidate(u));
      (viewedYouRes.data || []).forEach(u => addCandidate(u));

      (sentInterestsRes.data || []).forEach(item => {
        if (item && item.receiver) {
          addCandidate(item.receiver, {
            interestStatus: item.status,
            interestSender: item.sender,
            interestId: item._id
          });
        }
      });

      (receivedInterestsRes.data || []).forEach(item => {
        if (item && item.sender) {
          addCandidate(item.sender, {
            interestStatus: item.status,
            interestSender: item.sender,
            interestId: item._id
          });
        }
      });

      setAllProfiles(Array.from(profilesMap.values()));
      setFetchError('');
    } catch (err) {
      console.error('Error fetching initial search profiles:', err);
      setFetchError(err.response?.data?.message || err.message || 'Unable to connect to search service.');
    } finally {
      setInitialLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  // Execute explicit search against backend
  const executeSearch = async (term = searchQuery) => {
    const query = term.trim();
    setLoading(true);
    try {
      if (!query) {
        setServerResults(null);
      } else {
        try {
          const res = await api.get(`/users/matches?search=${encodeURIComponent(query)}`);
          const currentUserId = String(profile?._id || profile?.id || '');
          const eligibleServerResults = (res.data || []).filter(u => isEligibleAccount(u, currentUserId, blockedUserIds));
          setServerResults(eligibleServerResults);
        } catch {
          setServerResults([]);
        }
      }
    } catch (err) {
      console.error('Error executing search query:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    if (e) e.preventDefault();
    executeSearch(searchQuery);
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setServerResults(null);
  };

  // Toggle chip item for multi-select filters
  const toggleFilterItem = (list, setList, item) => {
    if (list.includes(item)) {
      setList(list.filter(i => i !== item));
    } else {
      setList([...list, item]);
    }
  };

  // Reset all search filters to default "None / All" (Search without filters)
  const handleResetFilters = () => {
    setFilterGender('all');
    setFilterAgeMin(18);
    setFilterAgeMax(70);
    setFilterReligions([]);
    setFilterMaritalStatuses([]);
    setFilterChildren([]);
    setFilterEducations([]);
    setFilterProfessions([]);
    setFilterDiets([]);
    setFilterCity('');
    setFilterLocation('');
  };

  // Count active non-default filters (0 = None / All - No filters applied)
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (filterGender !== 'all') count++;
    if (filterAgeMin > 18 || filterAgeMax < 70) count++;
    if (filterReligions.length > 0) count++;
    if (filterMaritalStatuses.length > 0) count++;
    if (filterChildren.length > 0) count++;
    if (filterEducations.length > 0) count++;
    if (filterProfessions.length > 0) count++;
    if (filterDiets.length > 0) count++;
    if (filterCity.trim()) count++;
    if (filterLocation.trim()) count++;
    return count;
  }, [filterGender, filterAgeMin, filterAgeMax, filterReligions, filterMaritalStatuses, filterChildren, filterEducations, filterProfessions, filterDiets, filterCity, filterLocation]);

  // Source list of profiles: merges server search results and all profiles so no matching records are lost,
  // strictly enforcing blocked account exclusion.
  const baseProfiles = useMemo(() => {
    const currentUserId = String(profile?._id || profile?.id || '');
    const map = new Map();
    allProfiles.forEach(u => {
      const uid = String(u._id || u.id || '');
      if (isEligibleAccount(u, currentUserId, blockedUserIds)) {
        map.set(uid, u);
      }
    });
    if (serverResults && Array.isArray(serverResults)) {
      serverResults.forEach(u => {
        const uid = String(u._id || u.id || '');
        if (isEligibleAccount(u, currentUserId, blockedUserIds)) {
          map.set(uid, { ...map.get(uid), ...u });
        }
      });
    }
    return Array.from(map.values());
  }, [allProfiles, serverResults, profile, blockedUserIds]);

  // Combined search criteria matching & filter rules
  // Rule: When activeFiltersCount === 0 ("None / All"), all profiles matching search terms are returned without filter restrictions.
  const filteredProfiles = useMemo(() => {
    const rawQuery = searchQuery.trim().toLowerCase();

    return baseProfiles.filter(user => {
      const p = user.profile || {};

      // 1. Search Criteria matching across Location, City, Education, Name, UID
      if (rawQuery) {
        const uid = String(user.uid || user._id || '').toLowerCase();
        const name = String(p.name || '').toLowerCase();
        const firstName = String(p.firstName || '').toLowerCase();
        const lastName = String(p.lastName || '').toLowerCase();
        const location = String(p.location || '').toLowerCase();
        const city = String(p.city || '').toLowerCase();
        const state = String(p.state || '').toLowerCase();
        const country = String(p.country || '').toLowerCase();
        const education = String(p.education || p.highestEducation || p.degree || '').toLowerCase();
        const college = String(p.college || '').toLowerCase();
        const profession = String(p.profession || p.occupation || '').toLowerCase();

        if (searchCriteria === 'location') {
          const locMatched = location.includes(rawQuery) || state.includes(rawQuery) || country.includes(rawQuery) || city.includes(rawQuery);
          if (!locMatched) return false;
        } else if (searchCriteria === 'city') {
          const cityMatched = city.includes(rawQuery) || location.includes(rawQuery);
          if (!cityMatched) return false;
        } else if (searchCriteria === 'education') {
          const eduMatched = education.includes(rawQuery) || college.includes(rawQuery);
          if (!eduMatched) return false;
        } else if (searchCriteria === 'name_uid') {
          const nameMatched = uid.includes(rawQuery) || name.includes(rawQuery) || firstName.includes(rawQuery) || lastName.includes(rawQuery);
          if (!nameMatched) return false;
        } else {
          // 'all' criteria: matches across Location, City, Education, Name, UID, Profession
          // Supports multiple keywords typed together (e.g. "Mumbai Bachelors")
          const words = rawQuery.split(/\s+/).filter(Boolean);
          const searchableText = `${uid} ${name} ${firstName} ${lastName} ${location} ${city} ${state} ${country} ${education} ${college} ${profession}`.toLowerCase();
          
          const matchesAll = words.every(word => searchableText.includes(word));
          if (!matchesAll) return false;
        }
      }

      // If activeFiltersCount === 0 ("None / All"), skip all optional filters
      if (activeFiltersCount === 0) {
        return true;
      }

      // 2. Gender filter (None / 'all' = open to all)
      if (filterGender !== 'all') {
        const g = String(p.gender || '').toLowerCase();
        if (g !== filterGender.toLowerCase()) return false;
      }

      // 3. Age filter (within range)
      const userAge = Number(p.age);
      if (userAge && !isNaN(userAge)) {
        if (userAge < filterAgeMin || userAge > filterAgeMax) return false;
      }

      // 4. Religion filter (None selected / empty = open to all)
      if (filterReligions.length > 0) {
        const userRel = String(p.religion || '').toLowerCase();
        const hasRel = filterReligions.some(r => userRel.includes(r.toLowerCase()));
        if (!hasRel) return false;
      }

      // 5. Marital Status filter (None selected / empty = open to all)
      if (filterMaritalStatuses.length > 0) {
        const userStatus = String(p.maritalStatus || '').toLowerCase();
        const hasStatus = filterMaritalStatuses.some(s => userStatus.includes(s.toLowerCase()));
        if (!hasStatus) return false;
      }

      // 5b. Children / Kids filter (None selected / empty = open to all)
      if (filterChildren.length > 0) {
        if (!profileMatchesChildrenFilter(p, filterChildren)) {
          return false;
        }
      }

      // 6. Education filter (None selected / empty = open to all)
      if (filterEducations.length > 0) {
        const userEdu = String(p.education || p.highestEducation || p.degree || '').toLowerCase();
        const hasEdu = filterEducations.some(e => userEdu.includes(e.toLowerCase()));
        if (!hasEdu) return false;
      }

      // 7. Profession filter (None selected / empty = open to all)
      if (filterProfessions.length > 0) {
        const userProf = String(p.profession || p.occupation || '').toLowerCase();
        const hasProf = filterProfessions.some(pr => userProf.includes(pr.toLowerCase()));
        if (!hasProf) return false;
      }

      // 8. Diet filter (None selected / empty = open to all)
      if (filterDiets.length > 0) {
        const userDiet = String(p.diet || '').toLowerCase();
        const hasDiet = filterDiets.some(d => userDiet.includes(d.toLowerCase()));
        if (!hasDiet) return false;
      }

      // 9. City / Location text filter (None selected / empty = open to all)
      if (filterCity.trim()) {
        const targetCity = filterCity.trim().toLowerCase();
        const userCity = String(p.city || '').toLowerCase();
        const userLoc = String(p.location || '').toLowerCase();
        if (!userCity.includes(targetCity) && !userLoc.includes(targetCity)) {
          return false;
        }
      }

      // 10. Location region/state filter (None selected / empty = open to all)
      if (filterLocation.trim()) {
        const targetLoc = filterLocation.trim().toLowerCase();
        const userLoc = String(p.location || '').toLowerCase();
        const userState = String(p.state || '').toLowerCase();
        const userCountry = String(p.country || '').toLowerCase();
        if (!userLoc.includes(targetLoc) && !userState.includes(targetLoc) && !userCountry.includes(targetLoc)) {
          return false;
        }
      }

      return true;
    }).sort((a, b) => {
      const aFeat = Boolean(a.isFeatured || a.featuredAccount?.isActive);
      const bFeat = Boolean(b.isFeatured || b.featuredAccount?.isActive);
      if (aFeat && !bFeat) return -1;
      if (!aFeat && bFeat) return 1;
      return 0;
    });
  }, [
    baseProfiles, searchQuery, searchCriteria, activeFiltersCount,
    filterGender, filterAgeMin, filterAgeMax,
    filterReligions, filterMaritalStatuses, filterChildren,
    filterEducations, filterProfessions,
    filterDiets, filterCity, filterLocation
  ]);

  // Display matching count: highly reactive, seamlessly blends server count and real-time filtered profiles
  const displayMatchingCount = useMemo(() => {
    if (typeof backendLiveCount === 'number' && !searchQuery.trim() && searchCriteria === 'all') {
      return backendLiveCount;
    }
    return filteredProfiles.length;
  }, [backendLiveCount, searchQuery, searchCriteria, filteredProfiles.length]);

  // Fetch backend count whenever search term or filters change (debounced)
  useEffect(() => {
    setIsCountingMatches(true);
    const timer = setTimeout(async () => {
      try {
        const draftPrefs = {};
        if (filterGender !== 'all') draftPrefs.gender = [filterGender];
        if (filterAgeMin > 18 || filterAgeMax < 70) draftPrefs.ageRange = [filterAgeMin, filterAgeMax];
        if (filterReligions.length > 0) draftPrefs.religion = filterReligions;
        if (filterMaritalStatuses.length > 0) draftPrefs.maritalStatus = filterMaritalStatuses;
        if (filterChildren.length > 0) {
          const childrenBackend = normalizeChildrenForBackend(filterChildren);
          if (childrenBackend.length > 0) {
            draftPrefs.children = childrenBackend;
          }
        }
        if (filterEducations.length > 0) draftPrefs.education = filterEducations;
        if (filterProfessions.length > 0) draftPrefs.profession = filterProfessions;
        if (filterDiets.length > 0) draftPrefs.diet = filterDiets;
        if (filterCity.trim() || filterLocation.trim()) {
          draftPrefs.location = [filterCity.trim(), filterLocation.trim()].filter(Boolean);
        }

        const countQuery = searchQuery.trim() ? `?search=${encodeURIComponent(searchQuery.trim())}` : '';
        const res = await api.post(`/users/matches/count${countQuery}`, { preferences: draftPrefs });
        if (res.data && typeof res.data.count === 'number') {
          setBackendLiveCount(res.data.count);
        }
      } catch {
        // Silently ignore count polling errors
      } finally {
        setIsCountingMatches(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [
    searchQuery, searchCriteria, filterGender, filterAgeMin, filterAgeMax,
    filterReligions, filterMaritalStatuses, filterChildren, filterEducations,
    filterProfessions, filterDiets, filterCity, filterLocation
  ]);

  // Save current search filters directly as partner preferences
  const handleSavePreferencesFromSearch = async () => {
    setIsSavingPreferences(true);
    setSavePrefError('');
    try {
      const draftPrefs = {};
      if (filterGender !== 'all') draftPrefs.gender = [filterGender];
      if (filterAgeMin > 18 || filterAgeMax < 70) draftPrefs.ageRange = [filterAgeMin, filterAgeMax];
      if (filterReligions.length > 0) draftPrefs.religion = filterReligions;
      if (filterMaritalStatuses.length > 0) draftPrefs.maritalStatus = filterMaritalStatuses;
      if (filterChildren.length > 0) {
        const childrenBackend = normalizeChildrenForBackend(filterChildren);
        if (childrenBackend.length > 0) {
          draftPrefs.children = childrenBackend;
        }
      }
      if (filterEducations.length > 0) draftPrefs.education = filterEducations;
      if (filterProfessions.length > 0) draftPrefs.profession = filterProfessions;
      if (filterDiets.length > 0) draftPrefs.diet = filterDiets;
      if (filterCity.trim() || filterLocation.trim()) {
        draftPrefs.location = [filterCity.trim(), filterLocation.trim()].filter(Boolean);
      }

      await api.put('/users/profile', { preferences: draftPrefs });
      setSavePrefSuccess(true);
      setTimeout(() => setSavePrefSuccess(false), 3500);
    } catch (err) {
      console.error('Error saving preferences from search:', err);
      setSavePrefError(err.response?.data?.message || err.message || 'Failed to save preferences.');
      setTimeout(() => setSavePrefError(''), 4500);
    } finally {
      setIsSavingPreferences(false);
    }
  };

  const handleContactUnlocked = (targetId, unlockedData) => {
    setUnlockedContacts((prev) => ({
      ...prev,
      [targetId]: unlockedData
    }));
    setAllProfiles((prev) =>
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
    if (serverResults) {
      setServerResults((prev) =>
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
    }
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

  // Block account handler: strictly removes user from all search views and base data
  const handleBlockUser = async (targetUser) => {
    if (!targetUser) return;
    const targetId = String(targetUser._id || targetUser.id);
    const targetName = targetUser.profile?.name || targetUser.email || 'this user';

    if (!window.confirm(`Are you sure you want to block ${targetName}? They will no longer appear in your search results or be able to contact you.`)) {
      return;
    }

    try {
      await api.post(`/users/block/${targetId}`, {
        messages: [],
        lastMessages: []
      });
      setBlockedUserIds(prev => new Set([...prev, targetId]));
      setAllProfiles(prev => prev.filter(u => String(u._id || u.id) !== targetId));
      if (serverResults) {
        setServerResults(prev => prev.filter(u => String(u._id || u.id) !== targetId));
      }
      if (previewMatch && String(previewMatch._id || previewMatch.id) === targetId) {
        setPreviewMatch(null);
      }
      alert(`${targetName} has been blocked and removed from search.`);
    } catch (err) {
      console.error('Error blocking user:', err);
      alert(err.response?.data?.message || 'Failed to block user. Please try again.');
    }
  };

  const handleSendInterest = async (receiverId) => {
    setSendingInterestMap(prev => ({ ...prev, [receiverId]: true }));
    try {
      await api.post('/users/interests', { receiverId });
      setSentInterests(prev => ({ ...prev, [receiverId]: true }));
      const targetMatch = filteredProfiles.find(m => (m._id || m.id) === receiverId) || previewMatch;
      if (targetMatch) {
        setMessageSentModal({ isOpen: true, user: targetMatch });
      }
    } catch (err) {
      console.error('Error sending interest:', err);
    } finally {
      setSendingInterestMap(prev => ({ ...prev, [receiverId]: false }));
    }
  };

  const handlePreviewProfile = (match, photo) => {
    setPreviewMatch(match);
    setActivePreviewImage(photo);
    setKundaliResult(null);
    setKundaliError('');
    // Profile view is strictly counted only when opening photo in full-screen mode
  };

  const handleExpandCard = (targetId) => {
    const isExpanding = !expandedCards[targetId];
    setExpandedCards(prev => ({ ...prev, [targetId]: isExpanding }));
    // Card expansion is purely UI - does not count as profile view
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

  if (initialLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-transparent">
        <div className="text-center space-y-4">
          <img src={loadingImg} alt="Loading..." className="h-16 w-16 object-contain animate-spin mx-auto" />
          <p className="text-slate-500 font-bold text-xs uppercase tracking-widest">Loading Profiles...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-transparent min-h-screen py-8 px-4 sm:px-6 font-sans">
      <div className="max-w-7xl mx-auto lg:mx-0 lg:ml-6 xl:ml-10 bg-white rounded-3xl p-6 sm:p-8 shadow-md border border-slate-100/60 space-y-6 lg:px-8">

        {/* Title Header */}
        <div className="bg-gradient-to-r from-[#5D34F7] via-[#502ce0] to-[#4024DB] rounded-3xl py-7 px-8 text-white shadow-xl shadow-[#5D34F7]/15 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative overflow-hidden">
          <div className="absolute right-0 bottom-0 top-0 w-1/3 bg-radial-gradient from-white/10 to-transparent pointer-events-none" />
          <div className="space-y-1.5 z-10">
            <h1 className="text-xl sm:text-2xl font-black tracking-tight flex items-center gap-2.5">
              <FontAwesomeIcon icon={faSearch} className="w-6 h-6 text-[#FFE066] drop-shadow-md shrink-0" />
              <span>Search Profiles by Location, City, Education & Name</span>
            </h1>
            <p className="text-white/80 text-xs font-semibold max-w-2xl">
              Search matrimony matches by Location, City, Education qualifications, full name, or Member UID. Use optional filters or search freely with "None / All".
            </p>
          </div>

          {/* Live Matches Count Pill in Header */}
          <div className="z-10 bg-white/15 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/20 flex items-center gap-2.5 shadow-sm shrink-0">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <div className="text-left">
              <span className="text-[10px] uppercase font-bold tracking-wider text-white/75 block leading-none">Live Matches</span>
              <span className="text-sm font-black text-white">{displayMatchingCount} Available</span>
            </div>
          </div>
        </div>

        {/* Search Bar & Filter Toggle Form */}
        <div className="space-y-3">
          <form onSubmit={handleSearchSubmit} className="bg-slate-50 rounded-3xl p-3 sm:p-4 shadow-inner border border-slate-100 flex flex-col sm:flex-row gap-3 items-center">
            <div className="relative flex-1 w-full flex items-center bg-white border border-slate-200 rounded-2xl focus-within:ring-2 focus-within:ring-[#5D34F7]/25 focus-within:border-[#5D34F7] transition shadow-xs overflow-hidden">
              {/* Search Criteria Selector */}
              <div className="relative border-r border-slate-200 shrink-0 bg-slate-50/90">
                <select
                  value={searchCriteria}
                  onChange={(e) => setSearchCriteria(e.target.value)}
                  className="appearance-none py-3.5 pl-9 pr-7 text-xs font-extrabold text-slate-700 bg-transparent focus:outline-none cursor-pointer"
                  title="Filter search criteria"
                >
                  <option value="all">All Criteria</option>
                  <option value="location">Location</option>
                  <option value="city">City</option>
                  <option value="education">Education</option>
                  <option value="name_uid">Name / UID</option>
                </select>
                <FontAwesomeIcon
                  icon={
                    searchCriteria === 'location' ? faMapMarkerAlt :
                    searchCriteria === 'city' ? faMapMarkerAlt :
                    searchCriteria === 'education' ? faGraduationCap :
                    searchCriteria === 'name_uid' ? faUser :
                    faSearch
                  }
                  className="absolute left-3 top-4 text-[#5D34F7] text-xs pointer-events-none"
                />
                <FontAwesomeIcon icon={faChevronDown} className="absolute right-2.5 top-4 text-slate-400 text-[9px] pointer-events-none" />
              </div>

              {/* Keyword Text Input */}
              <div className="relative flex-1 flex items-center">
                <input
                  type="text"
                  placeholder={
                    searchCriteria === 'location' ? 'Search by location (e.g. Maharashtra, California, Delhi NCR)...' :
                    searchCriteria === 'city' ? 'Search by city (e.g. Mumbai, Bangalore, Pune, Hyderabad)...' :
                    searchCriteria === 'education' ? 'Search by education (e.g. Bachelors, Masters, Engineering, Medicine)...' :
                    searchCriteria === 'name_uid' ? 'Search by full name or Member UID (e.g. FAM00000001)...' :
                    'Search by Location, City, Education, Name or UID...'
                  }
                  className="w-full py-3.5 pl-3 pr-9 text-xs sm:text-sm font-bold text-slate-800 bg-transparent focus:outline-none"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={handleClearSearch}
                    className="absolute right-3 text-slate-400 hover:text-slate-600 w-5 h-5 flex items-center justify-center rounded-full hover:bg-slate-100 transition cursor-pointer"
                    title="Clear search input"
                  >
                    <FontAwesomeIcon icon={faTimes} className="text-xs" />
                  </button>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap">
              {/* Filter Drawer Toggle Button */}
              <button
                type="button"
                onClick={() => setShowFilters(!showFilters)}
                className={`flex-1 sm:flex-initial px-5 py-3.5 rounded-2xl text-xs font-black transition cursor-pointer flex items-center justify-center gap-2 shrink-0 border ${
                  showFilters || activeFiltersCount > 0
                    ? 'bg-[#5D34F7]/10 text-[#5D34F7] border-[#5D34F7]/30 shadow-xs'
                    : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200'
                }`}
              >
                <FontAwesomeIcon icon={faSliders} className="text-xs" />
                <span>Filters</span>
                {activeFiltersCount > 0 && (
                  <span className="bg-[#5D34F7] text-white text-[10px] px-2 py-0.5 rounded-full font-black">
                    {activeFiltersCount}
                  </span>
                )}
                <FontAwesomeIcon icon={showFilters ? faChevronUp : faChevronDown} className="text-[10px]" />
              </button>

              {/* Submit Search Button */}
              <button
                type="submit"
                disabled={loading}
                className="flex-1 sm:flex-initial px-6 py-3.5 bg-[#5D34F7] hover:bg-[#4024DB] disabled:opacity-50 text-white font-extrabold rounded-2xl text-xs shadow-md shadow-[#5D34F7]/25 transition cursor-pointer flex items-center justify-center gap-2 shrink-0 active:scale-95"
                title={`Search ${displayMatchingCount} matching profiles`}
              >
                {loading ? (
                  <FontAwesomeIcon icon={faSpinner} spin className="text-sm" />
                ) : (
                  <>
                    <FontAwesomeIcon icon={faSearch} />
                    <span>Search ({displayMatchingCount} {displayMatchingCount === 1 ? 'profile' : 'profiles'})</span>
                  </>
                )}
              </button>

              {/* Save Preferences Button */}
              <button
                type="button"
                onClick={handleSavePreferencesFromSearch}
                disabled={isSavingPreferences}
                className="flex-1 sm:flex-initial px-5 py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 disabled:opacity-50 text-white font-extrabold rounded-2xl text-xs shadow-md shadow-emerald-600/20 transition cursor-pointer flex items-center justify-center gap-2 shrink-0 active:scale-95"
                title={`Save current search criteria as your partner preferences (${displayMatchingCount} matches)`}
              >
                {isSavingPreferences ? (
                  <>
                    <FontAwesomeIcon icon={faSpinner} spin className="text-sm" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <FontAwesomeIcon icon={faBookmark} />
                    <span>Save Preferences ({displayMatchingCount} {displayMatchingCount === 1 ? 'match' : 'matches'})</span>
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Search Filter Option Bar: Clear visual control for searching with or without filters */}
          <div className="bg-slate-50/80 rounded-2xl p-2.5 sm:px-4 border border-slate-200/70 flex flex-wrap items-center justify-between gap-2.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[11px] font-black uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <FontAwesomeIcon icon={faFilter} className="text-[#5D34F7]" />
                <span>Search Filter:</span>
              </span>

              {/* "None / All" option (Active when no filters are applied) */}
              <button
                type="button"
                onClick={handleResetFilters}
                className={`px-3.5 py-1.5 rounded-full text-xs font-black transition cursor-pointer flex items-center gap-1.5 ${
                  activeFiltersCount === 0
                    ? 'bg-emerald-600 text-white shadow-sm ring-2 ring-emerald-500/20'
                    : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
                }`}
                title="Search across all profiles without applying optional filters"
              >
                {activeFiltersCount === 0 && <FontAwesomeIcon icon={faCheck} className="text-[10px]" />}
                <span>None / All (Search Without Filters)</span>
              </button>

              {/* Location & City Filter Quick Trigger */}
              <button
                type="button"
                onClick={() => setShowFilters(true)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                  filterCity || filterLocation
                    ? 'bg-[#5D34F7] text-white shadow-xs'
                    : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
                }`}
              >
                <FontAwesomeIcon icon={faMapMarkerAlt} className="text-[10px]" />
                <span>Location / City {filterCity ? `(${filterCity})` : ''}</span>
              </button>

              {/* Marital Status Filter Quick Trigger */}
              <button
                type="button"
                onClick={() => setShowFilters(true)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                  filterMaritalStatuses.length > 0
                    ? 'bg-[#5D34F7] text-white shadow-xs'
                    : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
                }`}
              >
                <span>Marital Status {filterMaritalStatuses.length > 0 ? `(${filterMaritalStatuses.length})` : ''}</span>
              </button>

              {/* Children / Kids Filter Quick Trigger */}
              <button
                type="button"
                onClick={() => setShowFilters(true)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                  filterChildren.length > 0
                    ? 'bg-[#5D34F7] text-white shadow-xs'
                    : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
                }`}
              >
                <span>Children / Kids {filterChildren.length > 0 ? `(${filterChildren.length})` : ''}</span>
              </button>

              {/* Education Filter Quick Trigger */}
              <button
                type="button"
                onClick={() => setShowFilters(true)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                  filterEducations.length > 0
                    ? 'bg-[#5D34F7] text-white shadow-xs'
                    : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
                }`}
              >
                <FontAwesomeIcon icon={faGraduationCap} className="text-[10px]" />
                <span>Education {filterEducations.length > 0 ? `(${filterEducations.length})` : ''}</span>
              </button>
            </div>

            {/* Quick Status / Reset Filter Control */}
            <div className="flex items-center gap-2">
              {activeFiltersCount > 0 ? (
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="text-[11px] font-black text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 px-3 py-1 rounded-full border border-red-200 transition cursor-pointer flex items-center gap-1"
                >
                  <FontAwesomeIcon icon={faRotateRight} className="text-[9px]" />
                  <span>Clear Filters ({activeFiltersCount} Active) &rarr; Return to None / All</span>
                </button>
              ) : (
                <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200/60 hidden sm:inline-flex items-center gap-1">
                  <FontAwesomeIcon icon={faCheck} className="text-[9px]" />
                  <span>Searching without filter restrictions</span>
                </span>
              )}
            </div>
          </div>

          {/* Quick Search Suggestions Bar (Location, City, Education & Popular terms) */}
          <div className="flex items-center gap-2 overflow-x-auto py-1 px-1 custom-scrollbar text-xs">
            <span className="text-[11px] font-bold text-slate-400 whitespace-nowrap">Suggested:</span>
            {SUGGESTED_SEARCHES.map((item) => (
              <button
                key={item.label}
                type="button"
                onClick={() => {
                  setSearchQuery(item.value);
                  setSearchCriteria(item.criteria || 'all');
                  executeSearch(item.value);
                }}
                className={`px-3 py-1 rounded-full text-[11px] font-bold border transition cursor-pointer shrink-0 flex items-center gap-1 ${
                  searchQuery.toLowerCase() === item.value.toLowerCase()
                    ? 'bg-[#5D34F7] text-white border-[#5D34F7]'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border-slate-200'
                }`}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
                <span className="text-[9px] opacity-75 font-normal">({item.category})</span>
              </button>
            ))}
            {(searchQuery || serverResults !== null) && (
              <button
                type="button"
                onClick={handleClearSearch}
                className="px-3 py-1 rounded-full text-[11px] font-bold text-red-500 hover:bg-red-50 border border-red-200 transition cursor-pointer shrink-0 flex items-center gap-1"
              >
                <FontAwesomeIcon icon={faRotateRight} className="text-[9px]" />
                <span>Show All Accounts</span>
              </button>
            )}
          </div>
        </div>

        {/* Collapsible Search Filters Panel */}
        {showFilters && (
          <div className="bg-gradient-to-br from-slate-50 to-indigo-50/30 rounded-3xl p-6 border border-indigo-100 shadow-sm space-y-5 animate-in fade-in duration-200">
            {/* Header with Search Filter Mode Status Banner */}
            <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black uppercase tracking-wider text-slate-500">Search Filter Mode:</span>
                  <span className={`text-xs font-black px-2.5 py-0.5 rounded-full ${
                    activeFiltersCount === 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-indigo-100 text-indigo-800'
                  }`}>
                    {activeFiltersCount === 0 ? '✓ None / All (Unrestricted Search)' : `${activeFiltersCount} Filter(s) Applied`}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1 font-medium">
                  {activeFiltersCount === 0
                    ? 'No filter restrictions are applied. All profiles matching your search criteria/terms are shown.'
                    : 'Results are constrained to match the selected filters below in addition to your search keywords.'}
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition cursor-pointer flex items-center gap-1.5 ${
                    activeFiltersCount === 0
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-200'
                  }`}
                  title="Search without filters"
                >
                  <FontAwesomeIcon icon={activeFiltersCount === 0 ? faCheck : faRotateRight} className="text-[10px]" />
                  <span>{activeFiltersCount === 0 ? 'None / All Active' : 'Reset to None / All'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowFilters(false)}
                  className="text-xs font-bold text-slate-600 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-100 transition cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {/* Gender Filter */}
              <div className="space-y-2">
                <label className="text-xs font-extrabold text-slate-700 uppercase tracking-wider block">Gender</label>
                <div className="flex gap-2">
                  {[
                    { label: 'None / All', value: 'all' },
                    { label: 'Female ♀', value: 'Female' },
                    { label: 'Male ♂', value: 'Male' }
                  ].map(g => (
                    <button
                      key={g.value}
                      type="button"
                      onClick={() => setFilterGender(g.value)}
                      className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold border transition cursor-pointer ${
                        filterGender === g.value
                          ? 'bg-[#5D34F7] text-white border-[#5D34F7] shadow-xs'
                          : 'bg-white text-slate-700 hover:bg-slate-100 border-slate-200'
                      }`}
                    >
                      {g.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Age Range Filter */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-extrabold text-slate-700 uppercase tracking-wider">Age Range</label>
                  <span className="text-xs font-black text-[#5D34F7]">{filterAgeMin} - {filterAgeMax} Yrs</span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="18"
                    max={filterAgeMax}
                    value={filterAgeMin}
                    onChange={(e) => setFilterAgeMin(Math.max(18, Math.min(Number(e.target.value), filterAgeMax)))}
                    className="w-1/2 py-2 px-3 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700"
                    placeholder="Min"
                  />
                  <span className="text-slate-400 font-bold text-xs">to</span>
                  <input
                    type="number"
                    min={filterAgeMin}
                    max="70"
                    value={filterAgeMax}
                    onChange={(e) => setFilterAgeMax(Math.min(70, Math.max(Number(e.target.value), filterAgeMin)))}
                    className="w-1/2 py-2 px-3 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700"
                    placeholder="Max"
                  />
                </div>
              </div>

              {/* City & Location Filter */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-extrabold text-slate-700 uppercase tracking-wider block">City or State</label>
                  {(filterCity || filterLocation) && (
                    <button
                      type="button"
                      onClick={() => { setFilterCity(''); setFilterLocation(''); }}
                      className="text-[11px] font-bold text-indigo-600 hover:underline cursor-pointer"
                    >
                      Clear (None / All)
                    </button>
                  )}
                </div>
                <div className="relative">
                  <input
                    type="text"
                    value={filterCity}
                    onChange={(e) => setFilterCity(e.target.value)}
                    placeholder="Type city or state (e.g. Mumbai, Pune)..."
                    className="w-full py-2 pl-3 pr-8 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:border-[#5D34F7]"
                  />
                  {filterCity && (
                    <button
                      type="button"
                      onClick={() => setFilterCity('')}
                      className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 text-xs cursor-pointer"
                    >
                      <FontAwesomeIcon icon={faTimes} />
                    </button>
                  )}
                </div>
                {/* Popular City Quick Chips */}
                <div className="flex flex-wrap gap-1 pt-1">
                  <button
                    type="button"
                    onClick={() => setFilterCity('')}
                    className={`px-2 py-0.5 rounded-lg text-[10px] font-extrabold border transition cursor-pointer ${
                      !filterCity
                        ? 'bg-emerald-600 text-white border-emerald-600'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    All Cities
                  </button>
                  {POPULAR_CITIES.slice(0, 6).map(city => (
                    <button
                      key={city}
                      type="button"
                      onClick={() => setFilterCity(filterCity === city ? '' : city)}
                      className={`px-2 py-0.5 rounded-lg text-[10px] font-bold border transition cursor-pointer ${
                        filterCity.toLowerCase() === city.toLowerCase()
                          ? 'bg-[#5D34F7] text-white border-[#5D34F7]'
                          : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      {city}
                    </button>
                  ))}
                </div>
              </div>

              {/* Education Multi-Chip Filter */}
              <div className="space-y-2 md:col-span-2 lg:col-span-3">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-extrabold text-slate-700 uppercase tracking-wider">
                    Education Level {filterEducations.length === 0 && <span className="text-emerald-600 font-semibold normal-case">(None / All - No Filter)</span>}
                  </label>
                  {filterEducations.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setFilterEducations([])}
                      className="text-[11px] font-bold text-indigo-600 hover:underline cursor-pointer"
                    >
                      Clear (None / All)
                    </button>
                  )}
                </div>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    type="button"
                    onClick={() => setFilterEducations([])}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition cursor-pointer ${
                      filterEducations.length === 0
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    None / All Education
                  </button>
                  {EDUCATIONS.map(e => {
                    const isSelected = filterEducations.includes(e);
                    return (
                      <button
                        key={e}
                        type="button"
                        onClick={() => toggleFilterItem(filterEducations, setFilterEducations, e)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition cursor-pointer ${
                          isSelected
                            ? 'bg-[#5D34F7] text-white border-[#5D34F7] shadow-xs'
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {e} {isSelected && '✓'}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Religion Multi-Chip Filter */}
              <div className="space-y-2 md:col-span-2 lg:col-span-3">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-extrabold text-slate-700 uppercase tracking-wider">
                    Religion {filterReligions.length === 0 && <span className="text-emerald-600 font-semibold normal-case">(None / All - No Filter)</span>}
                  </label>
                  {filterReligions.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setFilterReligions([])}
                      className="text-[11px] font-bold text-indigo-600 hover:underline cursor-pointer"
                    >
                      Clear (None / All)
                    </button>
                  )}
                </div>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    type="button"
                    onClick={() => setFilterReligions([])}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition cursor-pointer ${
                      filterReligions.length === 0
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    None / All Religions
                  </button>
                  {RELIGIONS.map(r => {
                    const isSelected = filterReligions.includes(r);
                    return (
                      <button
                        key={r}
                        type="button"
                        onClick={() => toggleFilterItem(filterReligions, setFilterReligions, r)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition cursor-pointer flex items-center gap-1 ${
                          isSelected
                            ? 'bg-[#5D34F7] text-white border-[#5D34F7] shadow-xs'
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        <span>{getReligionIcon(r)}</span>
                        <span>{r}</span>
                        {isSelected && <FontAwesomeIcon icon={faCheck} className="text-[10px] ml-0.5" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Marital Status Filter */}
              <div className="space-y-2 md:col-span-2 lg:col-span-3">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-extrabold text-slate-700 uppercase tracking-wider">
                    Marital Status {filterMaritalStatuses.length === 0 && <span className="text-emerald-600 font-semibold normal-case">(None / All - No Filter)</span>}
                  </label>
                  {filterMaritalStatuses.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setFilterMaritalStatuses([])}
                      className="text-[11px] font-bold text-indigo-600 hover:underline cursor-pointer"
                    >
                      Clear (None / All)
                    </button>
                  )}
                </div>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    type="button"
                    onClick={() => setFilterMaritalStatuses([])}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition cursor-pointer ${
                      filterMaritalStatuses.length === 0
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    None / All Statuses
                  </button>
                  {MARITAL_STATUSES.map(s => {
                    const isSelected = filterMaritalStatuses.includes(s);
                    return (
                      <button
                        key={s}
                        type="button"
                        onClick={() => toggleFilterItem(filterMaritalStatuses, setFilterMaritalStatuses, s)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition cursor-pointer ${
                          isSelected
                            ? 'bg-[#5D34F7] text-white border-[#5D34F7] shadow-xs'
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {s} {isSelected && '✓'}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Children / Kids Filter */}
              <div className="space-y-2 md:col-span-2 lg:col-span-3">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-extrabold text-slate-700 uppercase tracking-wider flex items-center gap-2">
                    <span>Children / Kids</span>
                    {filterChildren.length === 0 ? (
                      <span className="text-emerald-600 font-semibold normal-case">(None / All - No Filter)</span>
                    ) : (
                      <span className="text-[#5D34F7] font-black normal-case">({filterChildren.length} selected)</span>
                    )}
                  </label>
                  {filterChildren.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setFilterChildren([])}
                      className="text-[11px] font-bold text-indigo-600 hover:underline cursor-pointer"
                    >
                      Clear (None / All)
                    </button>
                  )}
                </div>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    type="button"
                    onClick={() => setFilterChildren([])}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition cursor-pointer ${
                      filterChildren.length === 0
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    None / All (Any)
                  </button>
                  {CHILDREN_FILTER_OPTIONS.map(c => {
                    const isSelected = filterChildren.includes(c);
                    return (
                      <button
                        key={c}
                        type="button"
                        onClick={() => toggleFilterItem(filterChildren, setFilterChildren, c)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition cursor-pointer flex items-center gap-1 ${
                          isSelected
                            ? 'bg-[#5D34F7] text-white border-[#5D34F7] shadow-xs'
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        <span>{c}</span>
                        {isSelected && <span>✓</span>}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Diet Filter */}
              <div className="space-y-2 md:col-span-2 lg:col-span-3">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-extrabold text-slate-700 uppercase tracking-wider">
                    Dietary Habit {filterDiets.length === 0 && <span className="text-emerald-600 font-semibold normal-case">(None / All - No Filter)</span>}
                  </label>
                  {filterDiets.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setFilterDiets([])}
                      className="text-[11px] font-bold text-indigo-600 hover:underline cursor-pointer"
                    >
                      Clear (None / All)
                    </button>
                  )}
                </div>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    type="button"
                    onClick={() => setFilterDiets([])}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition cursor-pointer ${
                      filterDiets.length === 0
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    None / All Diets
                  </button>
                  {DIETS.map(d => {
                    const isSelected = filterDiets.includes(d);
                    return (
                      <button
                        key={d}
                        type="button"
                        onClick={() => toggleFilterItem(filterDiets, setFilterDiets, d)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition cursor-pointer ${
                          isSelected
                            ? 'bg-[#5D34F7] text-white border-[#5D34F7] shadow-xs'
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {d} {isSelected && '✓'}
                      </button>
                    );
                  })}
                </div>
              {/* Diet Filter ends */}
              </div>

              {/* Filter Drawer Actions Footer */}
              <div className="pt-4 border-t border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-3 md:col-span-2 lg:col-span-3">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Matching Profiles: <strong className="text-[#5D34F7] font-black text-sm">{displayMatchingCount}</strong></span>
                  {isCountingMatches && <FontAwesomeIcon icon={faSpinner} spin className="text-slate-400 text-xs ml-1" />}
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap justify-end">
                  <button
                    type="button"
                    onClick={handleResetFilters}
                    className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-200/70 border border-slate-200 transition cursor-pointer"
                  >
                    Reset Filters
                  </button>
                  <button
                    type="button"
                    onClick={handleSavePreferencesFromSearch}
                    disabled={isSavingPreferences}
                    className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 disabled:opacity-50 text-white font-extrabold rounded-xl text-xs shadow-sm transition cursor-pointer flex items-center gap-1.5"
                    title={`Save current search criteria as your partner preferences (${displayMatchingCount} matches)`}
                  >
                    {isSavingPreferences ? (
                      <FontAwesomeIcon icon={faSpinner} spin className="text-xs" />
                    ) : (
                      <FontAwesomeIcon icon={faBookmark} className="text-xs" />
                    )}
                    <span>Save Preferences ({displayMatchingCount} {displayMatchingCount === 1 ? 'match' : 'matches'})</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      executeSearch(searchQuery);
                      setShowFilters(false);
                    }}
                    className="px-5 py-2.5 bg-[#5D34F7] hover:bg-[#4024DB] text-white font-extrabold rounded-xl text-xs shadow-md transition cursor-pointer flex items-center gap-1.5"
                  >
                    <FontAwesomeIcon icon={faSearch} className="text-xs" />
                    <span>Search ({displayMatchingCount} {displayMatchingCount === 1 ? 'profile' : 'profiles'})</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Results Info & Count Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 px-2 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5 flex-wrap">
            <h2 className="text-xs font-black text-slate-500 tracking-widest uppercase flex items-center gap-2">
              <span>Matching Profiles</span>
              <span className="bg-[#5D34F7] text-white text-[11px] px-3 py-0.5 rounded-full font-bold shadow-xs">
                {displayMatchingCount}
              </span>
            </h2>
            {searchQuery && (
              <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-xl flex items-center gap-1">
                <span>Keyword:</span>
                <strong className="text-slate-900 font-extrabold">"{searchQuery}"</strong>
              </span>
            )}
            {searchCriteria !== 'all' && (
              <span className="text-xs font-bold text-purple-700 bg-purple-50 px-2.5 py-1 rounded-xl border border-purple-200 uppercase tracking-wide">
                Criteria: {searchCriteria}
              </span>
            )}
            {activeFiltersCount === 0 ? (
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-xl border border-emerald-200 flex items-center gap-1">
                <FontAwesomeIcon icon={faCheck} className="text-[10px]" />
                <span>Filter: None / All (Unrestricted)</span>
              </span>
            ) : (
              <span className="text-xs font-semibold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-xl border border-indigo-150">
                {activeFiltersCount} Filter(s) Active
              </span>
            )}
          </div>

          <div className="text-xs text-slate-400 font-semibold flex items-center gap-2">
            <span>Showing verified accounts & open matches</span>
            {(searchQuery || activeFiltersCount > 0 || searchCriteria !== 'all') && (
              <button
                type="button"
                onClick={() => {
                  handleClearSearch();
                  handleResetFilters();
                  setSearchCriteria('all');
                }}
                className="text-[#5D34F7] hover:underline font-bold cursor-pointer"
              >
                Reset All to "None / All"
              </button>
            )}
          </div>
        </div>

        {/* Profiles Grid */}
        {loading ? (
          <div className="bg-slate-50 rounded-3xl p-16 shadow-inner border border-slate-100 flex flex-col items-center justify-center min-h-[350px] text-center animate-in fade-in duration-200">
            <img src={loadingImg} alt="Searching..." className="h-12 w-12 animate-spin object-contain" />
            <p className="text-slate-400 text-xs font-bold mt-4 tracking-wider uppercase">Searching verified profiles...</p>
          </div>
        ) : fetchError ? (
          <EmptyState
            type="error"
            title="Unable to Load Search Results"
            description={fetchError}
            primaryAction={{
              label: 'Retry Search',
              onClick: () => {
                fetchInitialData();
                executeSearch();
              }
            }}
            secondaryAction={{
              label: 'Reset Filters',
              onClick: () => {
                handleClearSearch();
                handleResetFilters();
              }
            }}
          />
        ) : filteredProfiles.length === 0 ? (
          <EmptyState
            type="search"
            title="No Matching Profiles Found"
            badge="0 Matches"
            description="We could not find any profiles matching your search query or selected filter criteria. Try adjusting your search keywords, broadening age/height ranges, or setting specific filters to Open to All."
            suggestions={[
              'Search by Name, City, or FAM ID in the search bar above',
              'Set religion or caste filters to "Open to All" to discover more families',
              'Broaden age and height range limits to view more eligible accounts'
            ]}
            primaryAction={{
              label: 'Reset Filters & Show All Profiles',
              onClick: () => {
                handleClearSearch();
                handleResetFilters();
              }
            }}
            secondaryAction={searchQuery ? {
              label: 'Clear Search Query',
              onClick: handleClearSearch
            } : undefined}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
            {filteredProfiles.map(match => {
              const p = match.profile || {};
              const isSending = sendingInterestMap[match._id];
              const isSent = sentInterests[match._id];
              const displayUid = match.uid || (match._id ? match._id.substring(match._id.length - 8).toUpperCase() : 'MEMBER');

              return (
                <div
                  key={match._id}
                  className="bg-slate-50 rounded-3xl overflow-hidden shadow-sm hover:shadow-md border border-slate-100 flex flex-col hover:-translate-y-1.5 transition-all duration-300 relative group"
                >
                  {/* Image section with full screen viewer click */}
                  <div
                    onClick={() => handleOpenFullScreenImage(match, 0)}
                    className="h-56 bg-slate-100 relative overflow-hidden flex items-center justify-center cursor-pointer group/img"
                    title="Click to view full screen photo"
                  >
                    {p.photos && p.photos[0] ? (
                      <img
                        src={getPhotoUrl(p.photos[0], p.gender)}
                        alt={p.name || 'Member'}
                        onError={(e) => handleImageError(e, p.gender)}
                        className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <img
                        src={getDefaultAvatar(p.gender)}
                        alt={p.name || 'Member'}
                        className="w-full h-full object-cover opacity-90 transition-transform duration-500 group-hover:scale-105"
                      />
                    )}

                    {Boolean(match.isFeatured || match.featuredAccount?.isActive) && (
                      <span className="absolute top-3 left-3 px-2.5 py-1 bg-gradient-to-r from-amber-500 to-orange-500 backdrop-blur-md text-white text-[9px] font-extrabold rounded-full z-10 pointer-events-none shadow-md flex items-center gap-1">
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

                    {/* UID with copy button */}
                    <button
                      type="button"
                      onClick={(e) => handleCopyUid(displayUid, e)}
                      className="absolute bottom-4 right-4 px-3 py-1 bg-black/60 hover:bg-black/80 backdrop-blur-md text-white text-[9px] font-black tracking-wider rounded-full border border-white/20 uppercase flex items-center gap-1.5 transition cursor-pointer"
                      title="Click to copy UID"
                    >
                      <FontAwesomeIcon icon={copiedUid === displayUid ? faCheck : faCopy} className={copiedUid === displayUid ? 'text-emerald-400' : 'text-slate-300'} />
                      <span>{copiedUid === displayUid ? 'Copied' : `UID: ${displayUid}`}</span>
                    </button>
                  </div>

                  {/* Content Section */}
                  <div className="p-6 flex-1 flex flex-col justify-between space-y-6">
                    <div className="space-y-4">
                      <div className="flex justify-between items-start">
                        <div className="space-y-1">
                          <h3 className="font-extrabold text-slate-800 text-base tracking-tight leading-tight flex items-center gap-1.5 flex-wrap">
                            <span>{p.name || 'Matrimony Member'}</span>
                            <PhotoVerifiedBadge user={match} variant="badge" />
                            {p.gender === 'Female' && <span className="text-pink-500 text-[13px] leading-none" title="Female">♀️</span>}
                            {p.gender === 'Male' && <span className="text-blue-500 text-[13px] leading-none" title="Male">♂️</span>}
                            {p.religion && <span className="text-xs" title={p.religion}>{getReligionIcon(p.religion)}</span>}
                          </h3>
                          <div className="flex items-center justify-between gap-2 flex-wrap">
                            <p className="text-slate-400 text-xs font-bold flex items-center gap-1">
                              <FontAwesomeIcon icon={faMapMarkerAlt} className="text-[10px] text-slate-350" />
                              <span>{p.location || p.city || 'Location N/A'}</span>
                            </p>
                            {formatProfileCreatedBy(p.profileFor || match.profileFor) && (
                              <span className="text-[10px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-lg border border-slate-200/60 flex items-center gap-1 shadow-2xs">
                                <span className="text-[9px] text-slate-400 font-semibold uppercase">By:</span>
                                <span className="font-extrabold text-[#5D34F7]">{formatProfileCreatedBy(p.profileFor || match.profileFor)}</span>
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Structured Metadata Grid */}
                      <div className="grid grid-cols-2 gap-3 text-[11px] text-slate-650 font-bold border-t border-b border-slate-200/40 py-3.5 mt-2">
                        <div className="flex items-center gap-2">
                          <FontAwesomeIcon icon={faCalendarAlt} className="text-slate-400 w-3.5" />
                          <span>Age: {p.age || 'N/A'} yrs</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <FontAwesomeIcon icon={faRulerVertical} className="text-slate-400 w-3.5" />
                          <span>Height: {p.height || 'N/A'}</span>
                        </div>
                        <div className="col-span-2 flex items-center gap-2 truncate">
                          <FontAwesomeIcon icon={faGraduationCap} className="text-slate-400 w-3.5 shrink-0" />
                          <span className="truncate">Edu: {p.education || 'N/A'}</span>
                        </div>
                        <div className="col-span-2 flex items-center gap-2 truncate font-black text-slate-850">
                          <FontAwesomeIcon icon={faBriefcase} className="text-slate-400 w-3.5 shrink-0" />
                          <span className="truncate">{p.profession || p.occupation || 'N/A'}</span>
                        </div>
                      </div>
                    </div>

                    {/* Dropdown Section for Full Details */}
                    <div className="space-y-2">
                      <button
                        onClick={() => handleExpandCard(match._id)}
                        className="w-full flex justify-between items-center px-4 py-2 bg-white hover:bg-slate-50 rounded-2xl text-[11px] font-extrabold text-[#5D34F7] transition duration-200 focus:outline-none cursor-pointer border border-slate-100"
                      >
                        <span>{expandedCards[match._id] ? 'Hide Profile Details' : 'View Full Profile Details'}</span>
                        <FontAwesomeIcon icon={expandedCards[match._id] ? faChevronUp : faChevronDown} />
                      </button>

                      {expandedCards[match._id] && (
                        <div className="mt-3 grid grid-cols-2 gap-y-2.5 gap-x-4 text-[10px] text-slate-600 font-bold bg-white p-4 rounded-2xl border border-slate-100/70 max-h-56 overflow-y-auto">
                          {formatProfileCreatedBy(p.profileFor || match.profileFor) && (
                            <div className="col-span-2">
                              <span className="text-slate-400 block font-semibold mb-0.5">Profile Created By</span>
                              <span className="text-[#5D34F7] font-black">{formatProfileCreatedBy(p.profileFor || match.profileFor)}</span>
                            </div>
                          )}
                          {p.religion && <div><span className="text-slate-400 block font-semibold mb-0.5">Religion</span> {p.religion}</div>}
                          {p.caste && <div><span className="text-slate-400 block font-semibold mb-0.5">Caste</span> {p.caste}</div>}
                          {p.subCommunity && <div><span className="text-slate-400 block font-semibold mb-0.5">Sub-Community</span> {p.subCommunity}</div>}
                          {p.diet && <div><span className="text-slate-400 block font-semibold mb-0.5">Diet</span> {p.diet}</div>}
                          {p.maritalStatus && <div><span className="text-slate-400 block font-semibold mb-0.5">Marital Status</span> {p.maritalStatus}</div>}
                          <div><span className="text-slate-400 block font-semibold mb-0.5">Children / Kids</span> {formatChildrenDisplay(p)}</div>
                          {p.college && <div className="col-span-2"><span className="text-slate-400 block font-semibold mb-0.5">College</span> {p.college}</div>}
                          {p.workSector && <div><span className="text-slate-400 block font-semibold mb-0.5">Work Sector</span> {p.workSector}</div>}
                          {p.workRole && <div><span className="text-slate-400 block font-semibold mb-0.5">Work Role</span> {p.workRole}</div>}
                          {p.companyName && <div><span className="text-slate-400 block font-semibold mb-0.5">Company</span> {p.companyName}</div>}
                          {p.income && <div><span className="text-slate-400 block font-semibold mb-0.5">Income</span> {p.income}</div>}
                          {p.city && <div><span className="text-slate-400 block font-semibold mb-0.5">City</span> {p.city}</div>}
                          {p.state && <div><span className="text-slate-400 block font-semibold mb-0.5">State</span> {p.state}</div>}
                          {p.motherStatus && <div><span className="text-slate-400 block font-semibold mb-0.5">Mother Status</span> {p.motherStatus}</div>}
                          {p.fatherStatus && <div><span className="text-slate-400 block font-semibold mb-0.5">Father Status</span> {p.fatherStatus}</div>}
                          {p.familyFinancialStatus && <div className="col-span-2"><span className="text-slate-400 block font-semibold mb-0.5">Family Financial Status</span> {p.familyFinancialStatus}</div>}
                          <div className="col-span-2"><span className="text-slate-400 block font-semibold mb-0.5">Siblings</span> {formatSiblings(p)}</div>
                          {p.sistersCount !== undefined && <div><span className="text-slate-400 block font-semibold mb-0.5">Sisters</span> {p.sistersCount}</div>}
                          {p.brothersCount !== undefined && <div><span className="text-slate-400 block font-semibold mb-0.5">Brothers</span> {p.brothersCount}</div>}
                          {p.hobbies && p.hobbies.length > 0 && (
                            <div className="col-span-2">
                              <span className="text-slate-400 block font-semibold mb-0.5">Hobbies</span>
                              {p.hobbies.join(', ')}
                            </div>
                          )}
                          {((p.languages && p.languages.length > 0) || p.motherTongue) && (
                            <div className="col-span-2">
                              <span className="text-slate-400 block font-semibold mb-0.5">Spoken Languages</span>
                              <span className="text-sky-700 font-extrabold">{formatLanguages(p.languages || p.motherTongue)}</span>
                            </div>
                          )}
                          {p.bio && (
                            <div className="col-span-2 border-t border-slate-200/50 pt-2 mt-2 italic text-slate-500 leading-relaxed font-semibold">
                              "{p.bio}"
                            </div>
                          )}
                          <div className="col-span-2 pt-2 border-t border-slate-100 flex justify-end">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleBlockUser(match);
                              }}
                              className="text-[10px] font-bold text-slate-400 hover:text-rose-600 transition flex items-center gap-1 cursor-pointer py-0.5 px-2 rounded hover:bg-rose-50"
                              title="Block profile"
                            >
                              <FontAwesomeIcon icon={faBan} className="text-[9px]" />
                              <span>Block Profile</span>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Footer Actions */}
                    <div className="pt-2">
                      {match.interestStatus === 'accepted' ? (
                        <button
                          onClick={() => navigate('/messages', { state: { contactId: match._id || match.user?._id } })}
                          className="w-full py-3 bg-indigo-50 hover:bg-indigo-100 text-[#5D34F7] rounded-2xl font-black text-center text-xs flex items-center justify-center gap-1.5 border border-indigo-150 transition cursor-pointer"
                        >
                          <FontAwesomeIcon icon={faCommentDots} className="text-sm" />
                          Connected (Chat now)
                        </button>
                      ) : (match.interestStatus === 'pending' && match.interestSender !== profile?._id) ? (
                        <button
                          onClick={() => navigate('/interests')}
                          className="w-full py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-black rounded-2xl text-xs shadow-md shadow-emerald-500/25 transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer"
                        >
                          <FontAwesomeIcon icon={faCheck} className="text-sm" />
                          Accept Interest
                        </button>
                      ) : (isSent || (match.interestStatus === 'pending' && match.interestSender === profile?._id)) ? (
                        <div className="space-y-1.5">
                          <div className="w-full py-1.5 bg-emerald-50 text-emerald-700 rounded-xl font-black text-center text-xs flex items-center justify-center gap-1.5 border border-emerald-150 shadow-inner">
                            <FontAwesomeIcon icon={faCheck} className="text-xs" />
                            <span>Interest Sent</span>
                          </div>
                          <div className="bg-slate-50 border border-slate-100 rounded-xl px-2.5 py-1.5 flex items-center justify-between gap-1.5">
                            <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">Next Step:</span>
                            <div className="flex items-center gap-1.5">
                              <button
                                onClick={() => navigate('/messages', { state: { contactId: match._id || match.user?._id } })}
                                className="px-2.5 py-1 bg-[#5D34F7] hover:bg-[#4024DB] text-white font-bold text-[11px] rounded-lg transition flex items-center gap-1 shadow-xs cursor-pointer active:scale-95"
                                title="Chat with match"
                              >
                                <FontAwesomeIcon icon={faCommentDots} className="text-[10px]" />
                                <span>Chat</span>
                              </button>
                              <button
                                onClick={() => {
                                  setCallModalData({
                                    isOpen: true,
                                    phone: match.profile?.phone || match.phone || 'Contact Phone Unspecified',
                                    name: match.profile?.name || match.email || 'Matrimony Member',
                                    photo: match.profile?.photos?.[0] || null
                                  });
                                }}
                                className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] rounded-lg transition flex items-center gap-1 shadow-xs cursor-pointer active:scale-95"
                                title="Call match"
                              >
                                <FontAwesomeIcon icon={faPhone} className="text-[10px]" />
                                <span>Call</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <button
                          disabled={isSending}
                          onClick={() => handleSendInterest(match._id)}
                          className="w-full py-3 bg-gradient-to-r from-[#5D34F7] to-[#4024DB] hover:from-[#4f27e5] hover:to-[#381fcc] text-white font-black rounded-2xl text-xs shadow-md shadow-[#5D34F7]/25 hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 active:scale-[0.98]"
                        >
                          {isSending ? (
                            <FontAwesomeIcon icon={faSpinner} spin className="text-sm" />
                          ) : (
                            <>
                              <FontAwesomeIcon icon={faHeart} className="text-sm" />
                              Send Interest
                            </>
                          )}
                        </button>
                      )}
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
        const isSending = sendingInterestMap[previewMatch._id];
        const isSent = sentInterests[previewMatch._id];
        const displayUid = previewMatch.uid || (previewMatch._id ? previewMatch._id.substring(previewMatch._id.length - 8).toUpperCase() : 'MEMBER');

        return (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm cursor-pointer animate-in fade-in duration-200"
            onClick={() => setPreviewMatch(null)}
          >
            <div
              className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto relative shadow-2xl flex flex-col md:flex-row cursor-default custom-scrollbar animate-in zoom-in-95 duration-200"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                onClick={() => setPreviewMatch(null)}
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
                        className={`w-16 h-16 rounded-xl overflow-hidden border-2 transition-all flex-shrink-0 cursor-pointer ${
                          activePreviewImage === photo
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
                  <div className="space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <h2 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2 flex-wrap">
                        <span>{p.name || previewMatch.email || 'Matrimony Member'}</span>
                        <PhotoVerifiedBadge user={previewMatch} variant="badge" />
                        {Boolean(previewMatch.isFeatured || previewMatch.featuredAccount?.isActive) && (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-xs">
                            ⭐ Featured
                          </span>
                        )}
                        {p.gender === 'Female' && <span className="text-pink-500 text-sm">♀️</span>}
                        {p.gender === 'Male' && <span className="text-blue-500 text-sm">♂️</span>}
                      </h2>
                    </div>

                    <div className="flex items-center gap-3 text-xs font-bold text-slate-400 flex-wrap">
                      <p className="flex items-center gap-1">
                        <FontAwesomeIcon icon={faMapMarkerAlt} className="text-[#5D34F7]" />
                        <span>{p.location || p.city || 'Location N/A'}</span>
                      </p>
                      {formatProfileCreatedBy(p.profileFor || previewMatch.profileFor) && (
                        <div className="bg-indigo-50 text-[#5D34F7] px-2.5 py-1 rounded-xl text-[10px] font-extrabold flex items-center gap-1.5 shadow-2xs border border-indigo-150">
                          <FontAwesomeIcon icon={faUser} className="text-[10px]" />
                          <span>Profile Created By: <strong className="font-black">{formatProfileCreatedBy(p.profileFor || previewMatch.profileFor)}</strong></span>
                        </div>
                      )}
                      <button
                        type="button"
                        onClick={(e) => handleCopyUid(displayUid, e)}
                        className="text-[10px] text-slate-500 hover:text-slate-800 bg-slate-100 px-2 py-0.5 rounded-md flex items-center gap-1 transition cursor-pointer"
                        title="Copy UID"
                      >
                        <FontAwesomeIcon icon={copiedUid === displayUid ? faCheck : faCopy} className={copiedUid === displayUid ? 'text-emerald-500' : ''} />
                        <span>{copiedUid === displayUid ? 'Copied' : displayUid}</span>
                      </button>
                    </div>
                  </div>

                  {/* Kundali Matching Check Box */}
                  <div className="bg-indigo-50/60 border border-indigo-150 p-4 rounded-2xl space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-indigo-900 uppercase tracking-wide">Kundali Compatibility</span>
                      <button
                        type="button"
                        onClick={() => handleCheckKundali(previewMatch._id)}
                        disabled={isMatchingKundali}
                        className="text-xs font-black bg-[#5D34F7] hover:bg-[#4024DB] text-white px-3 py-1 rounded-xl transition cursor-pointer disabled:opacity-50"
                      >
                        {isMatchingKundali ? (
                          <><FontAwesomeIcon icon={faSpinner} spin className="mr-1" /> Checking...</>
                        ) : (
                          '✨ Check Kundali'
                        )}
                      </button>
                    </div>
                    {kundaliResult && (
                      <div className="text-xs font-bold text-slate-700 bg-white p-3 rounded-xl border border-indigo-100">
                        <p className="font-extrabold text-indigo-700">Guna Match Score: {kundaliResult.totalGuna || kundaliResult.score || 'Compatible'}</p>
                        {kundaliResult.verdict && <p className="text-[11px] text-slate-500 mt-1">{kundaliResult.verdict}</p>}
                      </div>
                    )}
                    {kundaliError && (
                      <p className="text-[11px] font-bold text-red-600">{kundaliError}</p>
                    )}
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
                        {p.religion || 'N/A'}, {p.caste || 'N/A'}
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
                        <span className="text-slate-400 text-[10px] block mb-0.5">CHILDREN / KIDS</span>
                        {formatChildrenDisplay(p)}
                      </div>
                      <div className="col-span-2">
                        <span className="text-slate-400 text-[10px] block mb-0.5">SPOKEN LANGUAGES</span>
                        <span className="text-sky-700 font-extrabold">{formatLanguages(p.languages || p.motherTongue)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer buttons & Contact Info */}
                <div className="border-t border-slate-100 pt-5 mt-5 space-y-4">
                  {/* Contact Info Box: 5 digits shown until unlocked, limits enforced */}
                  <ContactInfoCard
                    targetUser={previewMatch}
                    isPremium={profile?.premiumMembership?.isPremium || false}
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

                  <div className="flex gap-4">
                    {isSent ? (
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
                      <button
                        disabled={isSending}
                        onClick={() => handleSendInterest(previewMatch._id)}
                        className="w-full py-3.5 bg-gradient-to-r from-[#5D34F7] to-[#4024DB] hover:from-[#4f27e5] hover:to-[#381fcc] text-white font-black rounded-2xl text-sm shadow-lg shadow-[#5D34F7]/25 hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 active:scale-[0.98]"
                      >
                        {isSending ? (
                          <FontAwesomeIcon icon={faSpinner} spin className="text-sm" />
                        ) : (
                          <>
                            <FontAwesomeIcon icon={faHeart} className="text-base" />
                            Send Connection Interest
                          </>
                        )}
                      </button>
                    )}
                    {/* Block Action in Preview Modal */}
                    <div className="pt-2 flex justify-end">
                      <button
                        type="button"
                        onClick={() => handleBlockUser(previewMatch)}
                        className="text-xs font-bold text-slate-400 hover:text-rose-600 transition flex items-center gap-1.5 cursor-pointer py-1 px-2.5 rounded-xl hover:bg-rose-50"
                        title="Block this profile so they never appear in search"
                      >
                        <FontAwesomeIcon icon={faBan} className="text-[11px]" />
                        <span>Block Profile</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Call Modal */}
      <CallModal
        isOpen={callModalData.isOpen}
        onClose={() => setCallModalData({ ...callModalData, isOpen: false })}
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
        onClose={() => setFullScreenImage({ ...fullScreenImage, isOpen: false })}
        images={fullScreenImage.images}
        initialIndex={fullScreenImage.initialIndex}
        userName={fullScreenImage.userName}
        gender={fullScreenImage.gender}
        targetUserId={fullScreenImage.targetUserId}
        currentUserId={profile?._id}
      />

      {/* Save Preferences Toast Feedback */}
      {savePrefSuccess && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-600 text-white px-5 py-3.5 rounded-2xl shadow-xl flex items-center gap-2.5 font-bold text-xs animate-in slide-in-from-bottom-3 duration-200 border border-emerald-500">
          <FontAwesomeIcon icon={faCheck} className="text-sm" />
          <span>Preferences saved successfully with {displayMatchingCount} matches!</span>
        </div>
      )}
      {savePrefError && (
        <div className="fixed bottom-6 right-6 z-50 bg-red-600 text-white px-5 py-3.5 rounded-2xl shadow-xl flex items-center gap-2.5 font-bold text-xs animate-in slide-in-from-bottom-3 duration-200 border border-red-500">
          <FontAwesomeIcon icon={faTimes} className="text-sm" />
          <span>{savePrefError}</span>
        </div>
      )}

    </div>
  );
}
