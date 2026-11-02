import { useState, useEffect, useCallback, useMemo } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faSearch, faStar, faCommentDots, faPhone, faVideo,
  faCheckCircle, faClock, faGlobe, faGraduationCap,
  faCalendarAlt, faTimes, faSpinner, faRotateRight,
  faExclamationTriangle, faShieldAlt, faUserCheck, faCoins
} from '@fortawesome/free-solid-svg-icons';
import api, { getPhotoUrl, getDefaultAvatar, handleImageError } from '../api/axios';

const SPECIALIZATION_FILTERS = [
  'All',
  'Vedic Astrology',
  'Kundali Milan',
  'Numerology',
  'Palmistry',
  'Vastu Shastra',
  'Manglik Dosha',
  'Prashna Kundli',
  'Muhurat Selection'
];

const METHOD_FILTERS = [
  { id: 'all', label: 'All Methods', icon: null },
  { id: 'chat', label: 'Chat', icon: faCommentDots },
  { id: 'call', label: 'Voice Call', icon: faPhone },
  { id: 'video', label: 'Video Call', icon: faVideo }
];

export default function AstroChat() {
  const [astrologers, setAstrologers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpecialization, setSelectedSpecialization] = useState('All');
  const [selectedMethod, setSelectedMethod] = useState('all');
  const [availabilityFilter, setAvailabilityFilter] = useState('all'); // 'all' | 'online' | 'busy'
  const [refreshing, setRefreshing] = useState(false);

  // Selected astrologer for detail modal
  const [selectedAstrologer, setSelectedAstrologer] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  // Booking consultation modal state
  const [bookingAstrologer, setBookingAstrologer] = useState(null);
  const [bookingMethod, setBookingMethod] = useState('chat');
  const [scheduledDate, setScheduledDate] = useState(() => {
    const d = new Date();
    return d.toISOString().split('T')[0];
  });
  const [selectedTimeSlot, setSelectedTimeSlot] = useState('11:00-11:30');
  const [topic, setTopic] = useState('');
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(null);
  const [bookingError, setBookingError] = useState('');
  const [bookedSlots, setBookedSlots] = useState([]);
  const [checkingAvailability, setCheckingAvailability] = useState(false);

  // Active view: 'directory' | 'my-consultations'
  const [activeView, setActiveView] = useState('directory');
  const [myConsultations, setMyConsultations] = useState([]);
  const [consultationsLoading, setConsultationsLoading] = useState(false);

  // Current logged in user profile
  const [currentUser, setCurrentUser] = useState(null);

  // Fetch current user profile to prefill birth details
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await api.get('/users/profile', { validateStatus: (status) => status < 500 });
        if (res.data && res.status === 200) {
          setCurrentUser(res.data);
        }
      } catch (err) {
        // Silently ignore if not logged in
      }
    };
    fetchUser();
  }, []);

  // Fetch published astrologers strictly from the backend in real time
  const fetchAstrologers = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);
      setError(null);

      const params = { limit: 50 };
      if (searchQuery.trim()) params.search = searchQuery.trim();
      if (selectedSpecialization !== 'All') params.specialization = selectedSpecialization;
      if (selectedMethod !== 'all') params.method = selectedMethod;

      let list = [];
      try {
        const res = await api.get('/astrochat/astrologers', {
          params,
          validateStatus: (status) => status < 500
        });
        if (res.data && res.data.success && Array.isArray(res.data.data)) {
          list = res.data.data;
        }
      } catch (e) {
        list = [];
      }

      setAstrologers(list);
    } catch (err) {
      setAstrologers([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [searchQuery, selectedSpecialization, selectedMethod]);

  // Initial load and on query/filter change with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchAstrologers();
    }, 250);
    return () => clearTimeout(timer);
  }, [fetchAstrologers]);

  // Fetch user's booked consultations
  const fetchMyConsultations = useCallback(async () => {
    try {
      setConsultationsLoading(true);
      const res = await api.get('/astrochat/consultations/my', {
        validateStatus: (status) => status < 500
      });
      if (res.data && res.data.success) {
        setMyConsultations(Array.isArray(res.data.data) ? res.data.data : []);
      } else {
        setMyConsultations([]);
      }
    } catch (err) {
      setMyConsultations([]);
    } finally {
      setConsultationsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (activeView === 'my-consultations') {
      fetchMyConsultations();
    }
  }, [activeView, fetchMyConsultations]);

  // Open Astrologer Detailed Profile
  const handleOpenDetail = async (astro) => {
    setSelectedAstrologer(astro);
    try {
      setDetailLoading(true);
      const res = await api.get(`/astrochat/astrologers/${astro._id}`, {
        validateStatus: (status) => status < 500
      });
      if (res.data && res.data.success && res.data.data) {
        setSelectedAstrologer(res.data.data);
      }
    } catch (err) {
      // Retain existing selected astrologer data
    } finally {
      setDetailLoading(false);
    }
  };

  // Open Consultation Booking Modal
  const handleStartBooking = async (astro, method = null) => {
    const chosenMethod = method || (astro.supportedMethods && astro.supportedMethods[0]) || 'chat';
    setBookingAstrologer(astro);
    setBookingMethod(chosenMethod);
    setBookingSuccess(null);
    setBookingError('');
    setTopic('');

    // Fetch availability and booked slots for default date
    try {
      setCheckingAvailability(true);
      const res = await api.get(`/astrochat/astrologers/${astro._id}/availability?date=${scheduledDate}`, {
        validateStatus: (status) => status < 500
      });
      if (res.data && res.data.success) {
        setBookedSlots(res.data.bookedSlots || []);
      } else {
        setBookedSlots([]);
      }
    } catch (err) {
      setBookedSlots([]);
    } finally {
      setCheckingAvailability(false);
    }
  };

  // Check booked slots whenever date changes in booking dialog
  useEffect(() => {
    if (!bookingAstrologer || !scheduledDate) return;
    const checkDateAvailability = async () => {
      try {
        setCheckingAvailability(true);
        const res = await api.get(`/astrochat/astrologers/${bookingAstrologer._id}/availability?date=${scheduledDate}`, {
          validateStatus: (status) => status < 500
        });
        if (res.data && res.data.success) {
          setBookedSlots(res.data.bookedSlots || []);
        } else {
          setBookedSlots([]);
        }
      } catch (err) {
        setBookedSlots([]);
      } finally {
        setCheckingAvailability(false);
      }
    };
    checkDateAvailability();
  }, [scheduledDate, bookingAstrologer]);

  // Submit Consultation Booking
  const handleSubmitBooking = async (e) => {
    e.preventDefault();
    if (bookingLoading) return;

    if (!bookingAstrologer) return;

    if (bookingAstrologer.availability?.status === 'offline') {
      setBookingError('This astrologer is currently offline. Please pick another astrologer or check back later.');
      return;
    }

    setBookingLoading(true);
    setBookingError('');

    try {
      const payload = {
        astrologerId: bookingAstrologer._id,
        consultationMethod: bookingMethod,
        bookingDetails: {
          scheduledDate,
          timeSlot: selectedTimeSlot,
          topic: topic.trim() || 'Matrimony Horoscope & Compatibility Guidance'
        }
      };

      const res = await api.post('/astrochat/consultations', payload);
      if (res.data && res.data.success) {
        setBookingSuccess(res.data);
      } else {
        setBookingError(res.data?.message || 'Failed to book consultation.');
      }
    } catch (err) {
      if (err.response?.status === 409) {
        setBookingError('This date and time slot has already been booked. Please choose another time slot.');
      } else if (err.response?.data?.message) {
        setBookingError(err.response.data.message);
      } else {
        setBookingError('Unable to book consultation. Please verify your connection.');
      }
    } finally {
      setBookingLoading(false);
    }
  };

  // Filter astrologers client-side by availability status if toggled
  const filteredAstrologers = useMemo(() => {
    return astrologers.filter((astro) => {
      if (availabilityFilter === 'online') {
        return astro.availability?.status === 'online';
      }
      if (availabilityFilter === 'busy') {
        return astro.availability?.status === 'busy';
      }
      return true;
    });
  }, [astrologers, availabilityFilter]);

  const getTimeSlots = () => [
    '09:00-09:30', '10:00-10:30', '11:00-11:30',
    '12:00-12:30', '14:00-14:30', '15:00-15:30',
    '16:00-16:30', '17:00-17:30', '18:00-18:30',
    '19:00-19:30'
  ];

  return (
    <div className="min-h-screen pb-16 pt-4 px-3 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      
      {/* Hero Header - Cosmic Indigo/Violet Glassmorphism */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-slate-950 via-indigo-950 to-purple-950 border border-indigo-500/20 shadow-2xl p-6 sm:p-8 mb-8 text-white">
        {/* Glow Effects */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-purple-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-10 w-64 h-64 bg-indigo-500/20 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r from-amber-500/20 to-purple-500/20 border border-amber-400/40 text-amber-300 text-xs font-black uppercase tracking-wider">
              <span>✨</span>
              <span>AstroChat Matrimony Guidance</span>
              <span className="bg-amber-400 text-slate-950 text-[10px] px-2 py-0.2 rounded-full font-black">
                LIVE
              </span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white">
              Connect with Verified Vedic Astrologers
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm font-medium leading-relaxed">
              Find your ideal life partner with expert Kundali Milan, horoscope compatibility, Manglik Dosha analysis, and auspicious marriage timing.
            </p>
          </div>

          {/* Action Tabs & Live Refresh Button */}
          <div className="flex items-center gap-3 shrink-0 flex-wrap">
            <div className="bg-white/10 p-1 rounded-2xl flex items-center border border-white/10 backdrop-blur-sm">
              <button
                type="button"
                onClick={() => setActiveView('directory')}
                className={`px-4 py-2 rounded-xl text-xs font-black transition cursor-pointer ${
                  activeView === 'directory'
                    ? 'bg-amber-400 text-slate-950 shadow-md'
                    : 'text-slate-200 hover:text-white hover:bg-white/10'
                }`}
              >
                Astrologers Directory
              </button>
              <button
                type="button"
                onClick={() => setActiveView('my-consultations')}
                className={`px-4 py-2 rounded-xl text-xs font-black transition cursor-pointer flex items-center gap-1.5 ${
                  activeView === 'my-consultations'
                    ? 'bg-amber-400 text-slate-950 shadow-md'
                    : 'text-slate-200 hover:text-white hover:bg-white/10'
                }`}
              >
                <FontAwesomeIcon icon={faCalendarAlt} className="text-xs" />
                <span>My Consultations</span>
                {myConsultations.length > 0 && (
                  <span className="w-4 h-4 rounded-full bg-indigo-600 text-white text-[9px] flex items-center justify-center font-bold">
                    {myConsultations.length}
                  </span>
                )}
              </button>
            </div>

            <button
              type="button"
              onClick={() => fetchAstrologers(true)}
              disabled={refreshing}
              className="w-10 h-10 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/15 text-white flex items-center justify-center transition cursor-pointer active:scale-95 shadow-sm"
              title="Refresh Directory"
            >
              <FontAwesomeIcon icon={faRotateRight} className={`text-sm ${refreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* View 1: Astrologer Directory */}
      {activeView === 'directory' && (
        <div className="space-y-6">

          {/* Search & Method Filters Bar */}
          <div className="bg-white rounded-3xl p-4 sm:p-5 shadow-sm border border-slate-200/80 space-y-4">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              
              {/* Search Bar */}
              <div className="relative flex-1">
                <FontAwesomeIcon icon={faSearch} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by astrologer name, language, or specialty..."
                  className="w-full pl-11 pr-4 py-2.5 rounded-2xl border border-slate-200 bg-slate-50 text-xs sm:text-sm font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#5D34F7]/25 focus:border-[#5D34F7] transition"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 w-6 h-6 rounded-full flex items-center justify-center"
                  >
                    <FontAwesomeIcon icon={faTimes} className="text-xs" />
                  </button>
                )}
              </div>

              {/* Consultation Method Filter Tabs */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 shrink-0">
                {METHOD_FILTERS.map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setSelectedMethod(m.id)}
                    className={`px-3 py-2 rounded-xl text-xs font-black transition cursor-pointer shrink-0 flex items-center gap-1.5 border ${
                      selectedMethod === m.id
                        ? 'bg-[#5D34F7] text-white border-[#5D34F7] shadow-sm shadow-[#5D34F7]/25'
                        : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                    }`}
                  >
                    {m.icon && <FontAwesomeIcon icon={m.icon} className="text-xs" />}
                    <span>{m.label}</span>
                  </button>
                ))}
              </div>

            </div>

            {/* Specialization Filter Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 scrollbar-none">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 shrink-0">
                Specialties:
              </span>
              {SPECIALIZATION_FILTERS.map((spec) => (
                <button
                  key={spec}
                  type="button"
                  onClick={() => setSelectedSpecialization(spec)}
                  className={`px-3 py-1 rounded-full text-xs font-bold transition cursor-pointer shrink-0 border ${
                    selectedSpecialization === spec
                      ? 'bg-amber-400 text-slate-950 border-amber-400 shadow-2xs font-black'
                      : 'bg-white hover:bg-slate-50 text-slate-600 border-slate-200'
                  }`}
                >
                  {spec}
                </button>
              ))}
            </div>

            {/* Availability Filter Pills */}
            <div className="flex items-center justify-between gap-3 pt-2 border-t border-slate-100 text-xs">
              <div className="flex items-center gap-2">
                <span className="text-slate-400 font-semibold text-[11px]">Availability:</span>
                <button
                  type="button"
                  onClick={() => setAvailabilityFilter('all')}
                  className={`px-2.5 py-0.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                    availabilityFilter === 'all' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  All ({astrologers.length})
                </button>
                <button
                  type="button"
                  onClick={() => setAvailabilityFilter('online')}
                  className={`px-2.5 py-0.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                    availabilityFilter === 'online' ? 'bg-emerald-600 text-white' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                  <span>Online Now</span>
                </button>
                <button
                  type="button"
                  onClick={() => setAvailabilityFilter('busy')}
                  className={`px-2.5 py-0.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                    availabilityFilter === 'busy' ? 'bg-amber-600 text-white' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                  <span>In Session / Busy</span>
                </button>
              </div>

              <span className="text-[11px] text-slate-400 font-medium hidden sm:inline">
                Showing {filteredAstrologers.length} published astrologers
              </span>
            </div>
          </div>

          {/* Loading Skeletons */}
          {loading && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs space-y-4 animate-pulse">
                  <div className="flex items-center gap-4">
                    <div className="w-20 h-20 rounded-2xl bg-slate-200 shrink-0" />
                    <div className="space-y-2 flex-1">
                      <div className="h-4 bg-slate-200 rounded-md w-3/4" />
                      <div className="h-3 bg-slate-200 rounded-md w-1/2" />
                      <div className="h-3 bg-slate-200 rounded-md w-2/3" />
                    </div>
                  </div>
                  <div className="h-10 bg-slate-100 rounded-xl" />
                  <div className="h-9 bg-slate-200 rounded-xl" />
                </div>
              ))}
            </div>
          )}

          {/* Error Banner */}
          {!loading && error && (
            <div className="p-6 rounded-3xl bg-rose-50 border border-rose-200 text-center space-y-3">
              <FontAwesomeIcon icon={faExclamationTriangle} className="text-3xl text-rose-500" />
              <h3 className="text-base font-black text-rose-950">{error}</h3>
              <button
                type="button"
                onClick={() => fetchAstrologers()}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition cursor-pointer shadow-sm"
              >
                Retry Loading Astrologers
              </button>
            </div>
          )}

          {/* Empty State */}
          {!loading && !error && filteredAstrologers.length === 0 && (
            <div className="py-16 text-center space-y-4 bg-white rounded-3xl border border-slate-200/80 p-8">
              <div className="w-16 h-16 rounded-full bg-purple-50 text-purple-600 border border-purple-200 flex items-center justify-center mx-auto text-2xl shadow-xs">
                ✨
              </div>
              <div className="space-y-1 max-w-md mx-auto">
                <h3 className="text-lg font-black text-slate-900">No Published Astrologers Found</h3>
                <p className="text-xs text-slate-500 leading-relaxed font-medium">
                  {searchQuery || selectedSpecialization !== 'All' || selectedMethod !== 'all'
                    ? 'No astrologers match your current filter criteria. Try resetting filters or searching a different term.'
                    : 'Currently there are no active astrologers published in the directory. Please check back soon.'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedSpecialization('All');
                  setSelectedMethod('all');
                  setAvailabilityFilter('all');
                }}
                className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-black transition cursor-pointer"
              >
                Reset All Filters
              </button>
            </div>
          )}

          {/* Astrologers Grid */}
          {!loading && !error && filteredAstrologers.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredAstrologers.map((astro) => {
                const isOnline = astro.availability?.status === 'online';
                const isBusy = astro.availability?.status === 'busy';
                const isOffline = !isOnline && !isBusy;

                return (
                  <div
                    key={astro._id}
                    className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-sm hover:shadow-xl hover:border-indigo-300 transition-all duration-300 flex flex-col justify-between group relative overflow-hidden"
                  >
                    {/* Top gradient highlight on card */}
                    <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#5D34F7] via-purple-500 to-amber-400 opacity-80" />

                    <div className="space-y-4">
                      
                      {/* Astrologer Top Info */}
                      <div className="flex items-start gap-4">
                        {/* Profile Photo with Availability Badge */}
                        <div className="relative shrink-0">
                          <div className="w-20 h-20 rounded-2xl overflow-hidden bg-slate-100 border-2 border-slate-200 group-hover:border-[#5D34F7] transition-colors shadow-2xs">
                            <img
                              src={getPhotoUrl(astro.photo)}
                              alt={astro.name}
                              onError={(e) => handleImageError(e, 'Male')}
                              className="w-full h-full object-cover"
                            />
                          </div>

                          {/* Availability status badge */}
                          <div
                            className={`absolute -bottom-1 -right-1 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border shadow-xs flex items-center gap-1 ${
                              isOnline
                                ? 'bg-emerald-500 text-white border-white'
                                : isBusy
                                ? 'bg-amber-500 text-white border-white'
                                : 'bg-slate-400 text-white border-white'
                            }`}
                            title={`Status: ${astro.availability?.status || 'offline'}`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full bg-white ${isOnline ? 'animate-pulse' : ''}`} />
                            <span>{astro.availability?.status || 'Offline'}</span>
                          </div>
                        </div>

                        {/* Name & Experience & Fee */}
                        <div className="flex-1 min-w-0 space-y-1">
                          <div className="flex items-center gap-1.5">
                            <h3 className="text-base font-black text-slate-900 truncate leading-snug group-hover:text-[#5D34F7] transition-colors">
                              {astro.name}
                            </h3>
                            <FontAwesomeIcon icon={faCheckCircle} className="text-emerald-500 text-xs shrink-0" title="Verified Astrologer" />
                          </div>

                          <div className="flex items-center gap-2 text-xs text-slate-500 font-semibold flex-wrap">
                            <span className="flex items-center gap-1 text-slate-700">
                              <FontAwesomeIcon icon={faGraduationCap} className="text-[#5D34F7] text-xs" />
                              <span>{astro.experienceYears}+ Yrs Exp</span>
                            </span>
                          </div>

                          {/* Consultation Fee Pill */}
                          <div className="pt-1 flex items-center gap-1.5">
                            <span className="text-[10px] text-slate-400 font-bold uppercase">Fee:</span>
                            <span className="text-xs font-black text-[#5D34F7] bg-indigo-50 px-2.5 py-0.5 rounded-lg border border-indigo-100">
                              ₹{astro.consultationFee} <span className="text-[10px] font-normal text-slate-500">/ session</span>
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Short Description */}
                      <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed font-medium">
                        {astro.description || astro.biography}
                      </p>

                      {/* Specializations Tags */}
                      {Array.isArray(astro.specializations) && astro.specializations.length > 0 && (
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {astro.specializations.slice(0, 3).map((s, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-0.5 rounded-md bg-purple-50 text-purple-800 text-[10px] font-bold border border-purple-100"
                            >
                              {s}
                            </span>
                          ))}
                          {astro.specializations.length > 3 && (
                            <span className="text-[10px] text-slate-400 font-bold">
                              +{astro.specializations.length - 3} more
                            </span>
                          )}
                        </div>
                      )}

                      {/* Languages Spoken */}
                      {Array.isArray(astro.languages) && astro.languages.length > 0 && (
                        <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-semibold truncate">
                          <FontAwesomeIcon icon={faGlobe} className="text-slate-400 text-xs shrink-0" />
                          <span className="truncate">{astro.languages.join(', ')}</span>
                        </div>
                      )}

                    </div>

                    {/* Bottom Action Section */}
                    <div className="pt-4 mt-4 border-t border-slate-100 space-y-2">
                      
                      {/* Supported Method Quick Buttons */}
                      <div className="flex items-center justify-between gap-1.5">
                        <div className="flex items-center gap-1">
                          {astro.supportedMethods?.includes('chat') && (
                            <button
                              type="button"
                              onClick={() => handleStartBooking(astro, 'chat')}
                              className="p-2 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-700 text-xs font-bold border border-sky-200 transition cursor-pointer"
                              title="Consult via Chat"
                            >
                              <FontAwesomeIcon icon={faCommentDots} />
                            </button>
                          )}
                          {astro.supportedMethods?.includes('call') && (
                            <button
                              type="button"
                              onClick={() => handleStartBooking(astro, 'call')}
                              className="p-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold border border-emerald-200 transition cursor-pointer"
                              title="Consult via Voice Call"
                            >
                              <FontAwesomeIcon icon={faPhone} />
                            </button>
                          )}
                          {astro.supportedMethods?.includes('video') && (
                            <button
                              type="button"
                              onClick={() => handleStartBooking(astro, 'video')}
                              className="p-2 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 text-xs font-bold border border-purple-200 transition cursor-pointer"
                              title="Consult via Video Call"
                            >
                              <FontAwesomeIcon icon={faVideo} />
                            </button>
                          )}
                        </div>

                        {/* View Details Button */}
                        <button
                          type="button"
                          onClick={() => handleOpenDetail(astro)}
                          className="px-3 py-1.5 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition cursor-pointer"
                        >
                          View Bio
                        </button>

                        {/* Main Book Consultation CTA */}
                        <button
                          type="button"
                          onClick={() => handleStartBooking(astro)}
                          disabled={isOffline}
                          className={`px-4 py-2 rounded-xl text-xs font-black transition cursor-pointer shadow-sm active:scale-95 ${
                            isOffline
                              ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                              : isBusy
                              ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-amber-500/20'
                              : 'bg-gradient-to-r from-[#5D34F7] to-[#4024DB] hover:from-[#4d25d0] hover:to-[#381fcc] text-white shadow-[#5D34F7]/25'
                          }`}
                        >
                          {isOffline ? 'Offline' : isBusy ? 'Book Slot' : 'Consult Now'}
                        </button>
                      </div>

                    </div>

                  </div>
                );
              })}
            </div>
          )}

        </div>
      )}

      {/* View 2: User Consultation History */}
      {activeView === 'my-consultations' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-black text-slate-900 tracking-tight">
              My Astrological Consultations
            </h2>
            <button
              type="button"
              onClick={fetchMyConsultations}
              className="px-3 py-1.5 rounded-xl text-xs font-bold bg-white border border-slate-200 hover:bg-slate-50 transition cursor-pointer flex items-center gap-1.5 text-slate-700"
            >
              <FontAwesomeIcon icon={faRotateRight} className={consultationsLoading ? 'animate-spin' : ''} />
              <span>Refresh History</span>
            </button>
          </div>

          {consultationsLoading ? (
            <div className="py-16 text-center text-slate-400">
              <FontAwesomeIcon icon={faSpinner} spin className="text-3xl mb-2 text-[#5D34F7]" />
              <p className="text-xs font-bold text-slate-600">Loading your consultation sessions...</p>
            </div>
          ) : myConsultations.length === 0 ? (
            <div className="py-16 text-center space-y-4 bg-white rounded-3xl border border-slate-200/80 p-8">
              <div className="w-16 h-16 rounded-full bg-indigo-50 text-[#5D34F7] flex items-center justify-center mx-auto text-2xl">
                🔮
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-black text-slate-900">No Consultations Booked Yet</h3>
                <p className="text-xs text-slate-500 font-medium">
                  Connect with our published astrologers to verify partner compatibility, birth charts, and kundali milan.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActiveView('directory')}
                className="px-6 py-2.5 rounded-xl bg-[#5D34F7] text-white text-xs font-black shadow-md cursor-pointer transition hover:bg-[#4d25d0]"
              >
                Browse Astrologers
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {myConsultations.map((c) => {
                const astro = c.astrologer || {};
                const isConfirmed = c.status === 'Confirmed';
                const isInProgress = c.status === 'In Progress';
                const canJoin = isConfirmed || isInProgress;

                return (
                  <div
                    key={c._id}
                    className="p-5 rounded-3xl bg-white border border-slate-200/90 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-16 h-16 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0">
                        <img
                          src={getPhotoUrl(astro.photo)}
                          alt={astro.name || 'Astrologer'}
                          onError={(e) => handleImageError(e, 'Male')}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className="text-base font-black text-slate-900">{astro.name || 'Vedic Astrologer'}</h4>
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                              c.status === 'Confirmed'
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                : c.status === 'In Progress'
                                ? 'bg-indigo-100 text-indigo-800 border border-indigo-300 animate-pulse'
                                : c.status === 'Completed'
                                ? 'bg-slate-100 text-slate-700'
                                : c.status === 'Cancelled'
                                ? 'bg-rose-100 text-rose-800'
                                : 'bg-amber-100 text-amber-800 border border-amber-300'
                            }`}
                          >
                            {c.status}
                          </span>
                        </div>

                        <p className="text-xs text-slate-500 font-semibold flex items-center gap-3">
                          <span>Method: <strong className="text-slate-800 uppercase">{c.consultationMethod}</strong></span>
                          <span>•</span>
                          <span>Fee: <strong className="text-[#5D34F7]">₹{c.fee}</strong></span>
                        </p>

                        {c.bookingDetails?.scheduledDate && (
                          <p className="text-[11px] text-slate-500">
                            Scheduled: <span className="font-bold text-slate-800">{c.bookingDetails.scheduledDate.split('T')[0]}</span> ({c.bookingDetails.timeSlot})
                          </p>
                        )}
                        {c.bookingDetails?.topic && (
                          <p className="text-[11px] text-slate-600 italic">
                            Topic: {c.bookingDetails.topic}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      {canJoin ? (
                        <div className="space-y-1 text-right">
                          <span className="text-[10px] font-black uppercase text-emerald-600 block">
                            Session Ready
                          </span>
                          <button
                            type="button"
                            onClick={() => alert(`Starting ${c.consultationMethod} consultation with ${astro.name || 'Astrologer'}! Session ID: ${c.sessionDetails?.sessionId || c._id}`)}
                            className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow-md transition cursor-pointer active:scale-95 flex items-center gap-2"
                          >
                            {c.consultationMethod === 'video' ? (
                              <FontAwesomeIcon icon={faVideo} />
                            ) : c.consultationMethod === 'call' ? (
                              <FontAwesomeIcon icon={faPhone} />
                            ) : (
                              <FontAwesomeIcon icon={faCommentDots} />
                            )}
                            <span>Join Session</span>
                          </button>
                        </div>
                      ) : (
                        <div className="text-right">
                          <span className="text-xs text-slate-400 font-medium block">
                            {c.status === 'Pending' ? 'Awaiting Confirmation' : 'Session Ended'}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Modal 1: Astrologer Detailed Profile Modal */}
      {selectedAstrologer && (
        <div className="fixed inset-0 z-[140] flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="absolute inset-0" onClick={() => setSelectedAstrologer(null)} />

          <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-indigo-200 overflow-hidden flex flex-col max-h-[90vh] z-10 animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="bg-gradient-to-r from-slate-950 via-indigo-950 to-purple-950 text-white p-6 border-b border-indigo-500/30 flex items-start justify-between gap-4 shrink-0">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden bg-slate-800 border-2 border-amber-400 shrink-0">
                  <img
                    src={getPhotoUrl(selectedAstrologer.photo)}
                    alt={selectedAstrologer.name}
                    onError={(e) => handleImageError(e, 'Male')}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl sm:text-2xl font-black text-white">{selectedAstrologer.name}</h3>
                    <FontAwesomeIcon icon={faCheckCircle} className="text-emerald-400 text-sm" />
                  </div>
                  <p className="text-xs sm:text-sm text-slate-300 font-medium">
                    {selectedAstrologer.experienceYears}+ Years of Astrological Practice
                  </p>
                  <div className="flex items-center gap-2 pt-0.5">
                    <span className="px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-950 text-[10px] font-black uppercase">
                      Verified Vedic Expert
                    </span>
                    <span className="text-xs text-amber-300 font-bold">
                      ₹{selectedAstrologer.consultationFee} / session
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setSelectedAstrologer(null)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition cursor-pointer shrink-0"
              >
                <FontAwesomeIcon icon={faTimes} className="text-sm" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 overflow-y-auto space-y-5 flex-1 custom-scrollbar">
              
              {/* About / Full Biography */}
              <div className="space-y-2">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-400">
                  Biography & Background
                </h4>
                <p className="text-xs sm:text-sm text-slate-700 font-medium leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  {selectedAstrologer.biography || selectedAstrologer.description}
                </p>
              </div>

              {/* Specializations */}
              <div className="space-y-2">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-400">
                  Areas of Expertise
                </h4>
                <div className="flex items-center gap-2 flex-wrap">
                  {selectedAstrologer.specializations?.map((s, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 rounded-xl bg-indigo-50 text-[#5D34F7] font-bold text-xs border border-indigo-100"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              {/* Languages */}
              <div className="space-y-2">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-400">
                  Spoken Languages
                </h4>
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                  <FontAwesomeIcon icon={faGlobe} className="text-slate-400" />
                  <span>{selectedAstrologer.languages?.join(', ')}</span>
                </div>
              </div>

              {/* Supported Consultation Methods */}
              <div className="space-y-2">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-400">
                  Available Consultation Modes
                </h4>
                <div className="grid grid-cols-3 gap-3">
                  <div className={`p-3 rounded-2xl border text-center space-y-1 ${
                    selectedAstrologer.supportedMethods?.includes('chat')
                      ? 'bg-sky-50/70 border-sky-200 text-sky-900'
                      : 'bg-slate-50 border-slate-200 text-slate-400 opacity-60'
                  }`}>
                    <FontAwesomeIcon icon={faCommentDots} className="text-base" />
                    <span className="block text-xs font-black">Live Chat</span>
                  </div>

                  <div className={`p-3 rounded-2xl border text-center space-y-1 ${
                    selectedAstrologer.supportedMethods?.includes('call')
                      ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900'
                      : 'bg-slate-50 border-slate-200 text-slate-400 opacity-60'
                  }`}>
                    <FontAwesomeIcon icon={faPhone} className="text-base" />
                    <span className="block text-xs font-black">Voice Call</span>
                  </div>

                  <div className={`p-3 rounded-2xl border text-center space-y-1 ${
                    selectedAstrologer.supportedMethods?.includes('video')
                      ? 'bg-purple-50/70 border-purple-200 text-purple-900'
                      : 'bg-slate-50 border-slate-200 text-slate-400 opacity-60'
                  }`}>
                    <FontAwesomeIcon icon={faVideo} className="text-base" />
                    <span className="block text-xs font-black">Video Call</span>
                  </div>
                </div>
              </div>

              {/* Weekly Schedule Table if available */}
              {Array.isArray(selectedAstrologer.availability?.schedule) && selectedAstrologer.availability.schedule.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-400">
                    Weekly Consultation Schedule
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {selectedAstrologer.availability.schedule.map((slot, idx) => {
                      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
                      const dayName = days[slot.dayOfWeek] || `Day ${slot.dayOfWeek}`;
                      return (
                        <div key={idx} className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                          <span className="font-black text-slate-900 block">{dayName}</span>
                          <span className="text-slate-500 text-[11px] font-semibold">{slot.startTime} - {slot.endTime}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

            </div>

            {/* Footer CTA */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-3 shrink-0">
              <span className="text-xs text-slate-600 font-bold">
                Fee: <strong className="text-[#5D34F7] text-sm">₹{selectedAstrologer.consultationFee}</strong>
              </span>

              <button
                type="button"
                onClick={() => {
                  const target = selectedAstrologer;
                  setSelectedAstrologer(null);
                  handleStartBooking(target);
                }}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#5D34F7] to-[#4024DB] text-white text-xs font-black shadow-md cursor-pointer transition hover:bg-[#4d25d0] active:scale-95"
              >
                Proceed to Book Consultation
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal 2: Book Consultation Dialog */}
      {bookingAstrologer && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="absolute inset-0" onClick={() => setBookingAstrologer(null)} />

          <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-indigo-200 overflow-hidden flex flex-col max-h-[92vh] z-10 animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="bg-gradient-to-r from-slate-950 via-indigo-950 to-purple-950 text-white p-5 border-b border-indigo-500/30 flex items-center justify-between shrink-0">
              <div className="space-y-0.5">
                <span className="text-[10px] font-black uppercase tracking-wider text-amber-400">
                  Consultation Booking
                </span>
                <h3 className="text-lg font-black text-white">
                  Schedule with {bookingAstrologer.name}
                </h3>
              </div>
              <button
                onClick={() => setBookingAstrologer(null)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition cursor-pointer shrink-0"
              >
                <FontAwesomeIcon icon={faTimes} className="text-sm" />
              </button>
            </div>

            {/* Form Body */}
            <div className="p-6 overflow-y-auto space-y-4 flex-1 custom-scrollbar">
              
              {bookingSuccess ? (
                <div className="py-6 text-center space-y-4">
                  <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center mx-auto text-2xl">
                    <FontAwesomeIcon icon={faCheckCircle} />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-lg font-black text-slate-900">
                      Consultation Requested!
                    </h3>
                    <p className="text-xs text-slate-600 leading-relaxed font-medium">
                      Your consultation booking has been submitted with reference{' '}
                      <span className="font-mono font-bold text-slate-900">
                        {String(bookingSuccess.consultationId).slice(-8).toUpperCase()}
                      </span>.
                    </p>
                    <p className="text-xs text-slate-500">
                      Scheduled for <strong className="text-slate-800">{scheduledDate}</strong> at <strong className="text-slate-800">{selectedTimeSlot}</strong> via <strong className="text-[#5D34F7] uppercase">{bookingMethod}</strong>.
                    </p>
                  </div>

                  <div className="pt-2 flex items-center justify-center gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setBookingAstrologer(null);
                        setActiveView('my-consultations');
                      }}
                      className="px-6 py-2.5 rounded-xl bg-[#5D34F7] text-white text-xs font-black shadow-md cursor-pointer hover:bg-[#4d25d0]"
                    >
                      View in My Consultations
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmitBooking} className="space-y-4">
                  {bookingError && (
                    <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold">
                      {bookingError}
                    </div>
                  )}

                  {/* Consultation Method Choice */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700">
                      Select Consultation Mode <span className="text-rose-500">*</span>
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {['chat', 'call', 'video'].map((m) => {
                        const isSupported = bookingAstrologer.supportedMethods?.includes(m);
                        const icons = { chat: faCommentDots, call: faPhone, video: faVideo };
                        const labels = { chat: 'Chat', call: 'Voice Call', video: 'Video Call' };

                        return (
                          <button
                            key={m}
                            type="button"
                            disabled={!isSupported}
                            onClick={() => setBookingMethod(m)}
                            className={`p-3 rounded-2xl border text-center transition cursor-pointer flex flex-col items-center gap-1 ${
                              !isSupported
                                ? 'opacity-40 bg-slate-50 border-slate-200 cursor-not-allowed text-slate-400'
                                : bookingMethod === m
                                ? 'bg-[#5D34F7] text-white border-[#5D34F7] shadow-md shadow-[#5D34F7]/25'
                                : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                            }`}
                          >
                            <FontAwesomeIcon icon={icons[m]} className="text-sm" />
                            <span className="text-xs font-black">{labels[m]}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Scheduled Date */}
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-700">
                      Select Preferred Date <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="date"
                      required
                      min={new Date().toISOString().split('T')[0]}
                      value={scheduledDate}
                      onChange={(e) => setScheduledDate(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#5D34F7]/25 focus:border-[#5D34F7]"
                    />
                  </div>

                  {/* Time Slot Picker */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-bold text-slate-700">
                        Select Available Time Slot <span className="text-rose-500">*</span>
                      </label>
                      {checkingAvailability && (
                        <span className="text-[10px] text-indigo-600 font-semibold flex items-center gap-1">
                          <FontAwesomeIcon icon={faSpinner} spin className="text-[9px]" /> Checking slots...
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-36 overflow-y-auto custom-scrollbar p-1">
                      {getTimeSlots().map((slot) => {
                        const isBooked = bookedSlots.includes(slot);
                        return (
                          <button
                            key={slot}
                            type="button"
                            disabled={isBooked}
                            onClick={() => setSelectedTimeSlot(slot)}
                            className={`p-2 rounded-xl text-xs font-bold border transition cursor-pointer text-center ${
                              isBooked
                                ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed line-through'
                                : selectedTimeSlot === slot
                                ? 'bg-amber-400 text-slate-950 border-amber-400 font-black shadow-xs'
                                : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                            }`}
                          >
                            {slot}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Consultation Topic / Questions */}
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-700">
                      Topic or Specific Questions (Optional)
                    </label>
                    <textarea
                      rows={2}
                      value={topic}
                      onChange={(e) => setTopic(e.target.value)}
                      placeholder="e.g. Kundali Milan with prospective partner, Manglik Dosha concerns, auspicious wedding muhurat..."
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#5D34F7]/25 focus:border-[#5D34F7] transition resize-none"
                    />
                  </div>

                  {/* Birth Details Prefill Notice */}
                  <div className="p-3 rounded-xl bg-indigo-50 border border-indigo-100 text-xs text-indigo-900 flex items-center justify-between">
                    <span className="font-semibold">
                      Consultation Fee:
                    </span>
                    <span className="font-black text-sm text-[#5D34F7]">
                      ₹{bookingAstrologer.consultationFee}
                    </span>
                  </div>

                  {/* Submit Button */}
                  <div className="pt-2 flex items-center justify-between gap-3">
                    <button
                      type="button"
                      onClick={() => setBookingAstrologer(null)}
                      className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-50 transition cursor-pointer"
                    >
                      Cancel
                    </button>

                    <button
                      type="submit"
                      disabled={bookingLoading}
                      className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#5D34F7] to-[#4024DB] hover:from-[#4d25d0] hover:to-[#381fcc] text-white font-black text-xs shadow-md shadow-[#5D34F7]/25 transition cursor-pointer flex items-center gap-2 active:scale-95 disabled:opacity-50"
                    >
                      {bookingLoading ? (
                        <>
                          <FontAwesomeIcon icon={faSpinner} spin className="text-xs" />
                          <span>Booking Session...</span>
                        </>
                      ) : (
                        <span>Confirm Consultation (₹{bookingAstrologer.consultationFee})</span>
                      )}
                    </button>
                  </div>
                </form>
              )}

            </div>
          </div>
        </div>
      )}

    </div>
  );
}
