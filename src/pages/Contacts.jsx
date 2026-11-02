import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api, { getPhotoUrl, getDefaultAvatar, handleImageError } from '../api/axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faPhone,
  faEnvelope,
  faUser,
  faMapMarkerAlt,
  faBriefcase,
  faCalendarAlt,
  faSearch,
  faCrown,
  faCheckCircle,
  faComments,
  faArrowRight,
  faUserCheck,
  faTimes,
  faHeart,
  faExpand
} from '@fortawesome/free-solid-svg-icons';
import loadingImg from '../assets/loading.png';
import CallModal from '../components/CallModal';
import FullScreenImageViewer from '../components/FullScreenImageViewer';
import PhotoVerifiedBadge from '../components/PhotoVerifiedBadge';
import EmptyState from '../components/EmptyState';
import { getCachedUnlockedContacts, syncContactedProfiles, getTodayDailyContactViews } from '../utils/contactManager';
import { formatSiblings, formatLanguages } from '../utils/profileHelpers';

export default function Contacts() {
  const [contacts, setContacts] = useState([]);
  const [dailyStats, setDailyStats] = useState(getTodayDailyContactViews());
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [previewContact, setPreviewContact] = useState(null);
  const [activePreviewImage, setActivePreviewImage] = useState(null);
  const [callModalData, setCallModalData] = useState({
    isOpen: false,
    phone: '',
    name: '',
    photo: null
  });
  const [fullScreenImage, setFullScreenImage] = useState({
    isOpen: false,
    images: [],
    initialIndex: 0,
    userName: '',
    gender: 'Male',
    targetUserId: null
  });

  const handleOpenFullScreenImage = (contact, initialIndex = 0) => {
    if (!contact) return;
    const p = contact.profile || {};
    const photosList = Array.isArray(p.photos) && p.photos.length > 0 ? p.photos : [];
    setFullScreenImage({
      isOpen: true,
      images: photosList,
      initialIndex,
      userName: p.name || contact.name || contact.email || 'Member',
      gender: p.gender || 'Male',
      targetUserId: contact._id || contact.id
    });
  };
  const navigate = useNavigate();

  const fetchContacts = async () => {
    try {
      setFetchError(false);
      setLoading(true);
      const cachedMap = getCachedUnlockedContacts();
      let serverContacts = [];

      try {
        const res = await api.get('/users/contacts-viewed');
        serverContacts = res.data || [];
        // Sync into cache as well
        await syncContactedProfiles();
      } catch (err) {
        console.warn('Could not load from backend /users/contacts-viewed:', err);
      }

      // Combine server contacts and local persistent cache to prevent data loss
      const combinedMap = new Map();

      serverContacts.forEach((c) => {
        const id = (c._id || c.contacted?._id || c.id)?.toString();
        if (id) {
          combinedMap.set(id, c);
        }
      });

      Object.entries(cachedMap).forEach(([id, data]) => {
        if (!combinedMap.has(id)) {
          combinedMap.set(id, {
            _id: id,
            phone: data.phone,
            email: data.email,
            contactedAt: data.unlockedAt,
            profile: {
              name: data.name || 'Member',
              photos: data.photo ? [data.photo] : [],
              gender: data.gender || 'Male'
            }
          });
        } else {
          // Enrich with cached details if missing
          const existing = combinedMap.get(id);
          if (!existing.phone && data.phone) existing.phone = data.phone;
          if (!existing.email && data.email) existing.email = data.email;
        }
      });

      setContacts(Array.from(combinedMap.values()));
    } catch (err) {
      console.error('Error fetching contacts:', err);
      setFetchError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContacts();

    // Listen for cross-component contact unlock events
    const handleContactUpdate = () => {
      fetchContacts();
    };

    window.addEventListener('contact-unlocked', handleContactUpdate);
    return () => {
      window.removeEventListener('contact-unlocked', handleContactUpdate);
    };
  }, []);

  const filteredContacts = contacts.filter((c) => {
    const p = c.profile || {};
    const name = (p.name || c.name || '').toLowerCase();
    const uid = (c.uid || '').toLowerCase();
    const phone = (c.phone || '').toLowerCase();
    const email = (c.email || p.email || '').toLowerCase();
    const loc = (p.city || p.location || '').toLowerCase();
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      name.includes(q) ||
      uid.includes(q) ||
      phone.includes(q) ||
      email.includes(q) ||
      loc.includes(q)
    );
  });

  const handleCall = (contact, e) => {
    if (e) e.stopPropagation();
    if (contact.settings?.allowVoiceAndVideoCalls === false) {
      alert('This member has disabled incoming calls.');
      return;
    }
    const p = contact.profile || {};
    const photo = p.photos && p.photos[0] ? p.photos[0] : null;
    setCallModalData({
      isOpen: true,
      phone: contact.phone || '',
      name: p.name || 'Member',
      photo
    });
  };

  const handlePreviewProfile = (contact) => {
    setPreviewContact(contact);
    const photos = contact.profile?.photos || [];
    setActivePreviewImage(photos[0] || null);
  };

  return (
    <div className="bg-transparent min-h-screen py-8 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto lg:mx-0 lg:ml-6 xl:ml-10 space-y-6 lg:px-8">
        
        {/* Header & Search Bar */}
        <div className="bg-white rounded-3xl p-6 sm:p-7 shadow-sm border border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-lg shadow-inner">
                <FontAwesomeIcon icon={faPhone} />
              </div>
              <span>Contacts</span>
              <span className="text-xs font-black px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800">
                {contacts.length} Total
              </span>
              <span className="text-xs font-black px-2.5 py-1 rounded-full bg-amber-100 text-amber-900 border border-amber-300 shadow-2xs">
                Today: {dailyStats.viewedCount} / {dailyStats.limit} ({dailyStats.remainingCount} Left)
              </span>
            </h1>
            <p className="text-slate-400 text-xs font-bold uppercase mt-1 tracking-wider">
              All profiles whose contact information you have viewed and unlocked
            </p>
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-80">
            <FontAwesomeIcon
              icon={faSearch}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, email, phone, city..."
              className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#5D34F7]/25 focus:border-[#5D34F7] transition"
            />
          </div>
        </div>

        {/* Content Section */}
        {loading ? (
          <div className="bg-white rounded-3xl p-12 text-center shadow-sm border border-slate-100 flex flex-col items-center justify-center min-h-[350px]">
            <img src={loadingImg} alt="Loading..." className="h-12 w-12 animate-spin object-contain" />
            <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mt-4">
              Loading your contacts...
            </p>
          </div>
        ) : fetchError ? (
          <EmptyState
            type="error"
            title="Failed to Load Contacts"
            description="We encountered an issue retrieving your unlocked contact profiles. Please check your connection and try again."
            actionText="Retry Contacts"
            onAction={fetchContacts}
          />
        ) : filteredContacts.length === 0 ? (
          searchQuery.trim() ? (
            <EmptyState
              type="search"
              title="No Contacts Found"
              description={`No unlocked contacts match "${searchQuery.trim()}". Check the spelling or try searching another term.`}
              badgeText="0 Results"
              suggestions={[
                'Check the contact name for typos or spelling mistakes',
                'Search by 10-digit phone number or email address',
                'Clear the search query to view all unlocked contacts'
              ]}
              actionText="Clear Search Query"
              onAction={() => setSearchQuery('')}
            />
          ) : (
            <EmptyState
              type="contacts"
              title="No Unlocked Contacts Yet"
              description="When you reveal or unlock contact information on profile cards, their contact details will be saved here permanently."
              suggestions={[
                'Browse compatible profiles in Preference Matches',
                'Unlock verified phone numbers and direct WhatsApp contacts',
                'Upgrade to Premium for direct access to verified contact numbers'
              ]}
              actionText="Discover Matches"
              onAction={() => navigate('/preference-matches')}
              secondaryActionText="Search Profiles"
              onSecondaryAction={() => navigate('/search')}
            />
          )
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredContacts.map((contact) => {
              const p = contact.profile || {};
              const photo = p.photos && p.photos[0] ? getPhotoUrl(p.photos[0], p.gender) : null;
              const formattedDate = contact.contactedAt
                ? new Date(contact.contactedAt).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric'
                  })
                : null;

              return (
                <div
                  key={contact._id || contact.id}
                  className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 hover:shadow-lg transition-all duration-200 flex flex-col justify-between space-y-4 group"
                >
                  <div>
                    {/* Top User Info Row - Picture & Name Clickable */}
                    <div className="flex items-center gap-4">
                      <div
                        onClick={() => handlePreviewProfile(contact)}
                        className="w-16 h-16 rounded-2xl overflow-hidden bg-slate-100 border-2 border-emerald-100 shrink-0 flex items-center justify-center relative shadow-xs cursor-pointer hover:opacity-90 hover:scale-105 transition-all"
                        title="Click to view profile"
                      >
                        {photo ? (
                          <img 
                            src={photo} 
                            alt={p.name || 'Member'} 
                            onError={(e) => handleImageError(e, p.gender)}
                            className="w-full h-full object-cover" 
                          />
                        ) : (
                          <img 
                            src={getDefaultAvatar(p.gender)} 
                            alt={p.name || 'Member'} 
                            className="w-full h-full object-cover" 
                          />
                        )}
                        {contact.isVerified && (
                          <div className="absolute top-1 right-1 w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[9px] shadow-xs" title="Verified Member">
                            <FontAwesomeIcon icon={faCheckCircle} />
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <h3
                            onClick={() => handlePreviewProfile(contact)}
                            className="font-black text-slate-900 text-base truncate cursor-pointer hover:text-[#5D34F7] transition-colors"
                            title="Click to view profile details"
                          >
                            {p.name || contact.name || 'Matrimony Member'}
                          </h3>
                          {contact.premiumMembership?.isPremium && (
                            <FontAwesomeIcon icon={faCrown} className="text-amber-500 text-xs shrink-0" title="Premium Member" />
                          )}
                          <PhotoVerifiedBadge user={contact} variant="badge" />
                        </div>
                        <p className="text-[11px] text-slate-400 font-bold truncate mt-0.5">
                          ID: {contact.uid || (contact._id ? contact._id.substring(contact._id.length - 8).toUpperCase() : 'MEMBER')}
                        </p>
                        {(p.city || p.location) && (
                          <p className="text-[11px] text-slate-500 font-semibold truncate flex items-center gap-1 mt-0.5">
                            <FontAwesomeIcon icon={faMapMarkerAlt} className="text-[#5D34F7] text-[10px]" />
                            <span>{p.city || p.location}</span>
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Meta info tags */}
                    <div className="flex flex-wrap gap-1.5 mt-3 pt-3 border-t border-slate-100">
                      {p.age && (
                        <span className="px-2 py-0.5 bg-slate-50 text-slate-600 rounded-lg text-[10px] font-bold">
                          {p.age} Yrs
                        </span>
                      )}
                      {p.height && (
                        <span className="px-2 py-0.5 bg-slate-50 text-slate-600 rounded-lg text-[10px] font-bold">
                          {p.height}
                        </span>
                      )}
                      {p.profession && (
                        <span className="px-2 py-0.5 bg-slate-50 text-slate-600 rounded-lg text-[10px] font-bold truncate max-w-[140px]">
                          {p.profession}
                        </span>
                      )}
                      {p.religion && (
                        <span className="px-2 py-0.5 bg-slate-50 text-slate-600 rounded-lg text-[10px] font-bold">
                          {p.religion}
                        </span>
                      )}
                    </div>

                    {/* Contact Information Details Box */}
                    <div className="mt-4 bg-emerald-50/80 border border-emerald-150 rounded-2xl p-4 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800 flex items-center gap-1">
                          <FontAwesomeIcon icon={faCheckCircle} className="text-emerald-600 text-[10px]" />
                          <span>Contacted</span>
                        </span>
                        {formattedDate && (
                          <span className="text-[10px] font-bold text-emerald-700/80 flex items-center gap-1">
                            <FontAwesomeIcon icon={faCalendarAlt} className="text-[9px]" />
                            <span>{formattedDate}</span>
                          </span>
                        )}
                      </div>

                      {/* Complete Phone Number */}
                      <div className="flex items-center justify-between gap-2">
                        <a
                          href={contact.phone ? `tel:${contact.phone}` : undefined}
                          className="flex items-center gap-2 text-emerald-950 font-black text-sm tracking-wide hover:underline cursor-pointer"
                          title="Click to call directly"
                        >
                          <FontAwesomeIcon icon={faPhone} className="text-emerald-600 text-xs" />
                          <span className="font-mono">{contact.phone || 'Phone number available'}</span>
                        </a>
                      </div>

                      {/* Complete Email Address */}
                      {contact.email && (
                        <div className="flex items-center gap-2 text-emerald-800 text-xs font-bold truncate">
                          <FontAwesomeIcon icon={faEnvelope} className="text-emerald-600 text-xs shrink-0" />
                          <a
                            href={`mailto:${contact.email}`}
                            className="truncate hover:underline text-emerald-900"
                            title="Send email"
                          >
                            {contact.email}
                          </a>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions Row - Chat and Call */}
                  <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => navigate('/messages', { state: { contactId: contact._id } })}
                      className="flex-1 py-2.5 bg-[#5D34F7] hover:bg-[#4024DB] text-white font-black rounded-xl text-xs transition flex items-center justify-center gap-2 cursor-pointer shadow-xs active:scale-95"
                    >
                      <FontAwesomeIcon icon={faComments} className="text-xs" />
                      <span>Chat Now</span>
                    </button>
                    <button
                      type="button"
                      onClick={(e) => handleCall(contact, e)}
                      className="py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-xl text-xs transition flex items-center justify-center gap-2 cursor-pointer shadow-xs active:scale-95"
                      title="Call Member"
                    >
                      <FontAwesomeIcon icon={faPhone} className="text-xs" />
                      <span>Call</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Profile Detail Preview Modal */}
        {previewContact && (() => {
          const p = previewContact.profile || {};
          const displayUid = previewContact.uid || (previewContact._id ? previewContact._id.substring(previewContact._id.length - 8).toUpperCase() : 'MEMBER');

          return (
            <div
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm cursor-pointer animate-in fade-in duration-200"
              onClick={() => setPreviewContact(null)}
            >
              <div
                className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto relative shadow-2xl flex flex-col md:flex-row cursor-default custom-scrollbar animate-in zoom-in-95 duration-200"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Close Button */}
                <button
                  onClick={() => setPreviewContact(null)}
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
                      handleOpenFullScreenImage(previewContact, idx >= 0 ? idx : 0);
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
                    <div>
                      <div className="flex justify-between items-start">
                        <h2 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2 flex-wrap">
                          <span>{p.name || previewContact.name || 'Matrimony Member'}</span>
                          <PhotoVerifiedBadge user={previewContact} variant="badge" />
                          {p.gender === 'Female' && <span className="text-pink-500 text-lg leading-none" title="Female">♀️</span>}
                          {p.gender === 'Male' && <span className="text-blue-500 text-lg leading-none" title="Male">♂️</span>}
                        </h2>
                        <span className="px-3 py-1 bg-emerald-50 text-emerald-700 text-[10px] font-black rounded-xl border border-emerald-200 uppercase">
                          UID: {displayUid}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 mt-1">
                        <p className="text-slate-400 text-xs font-bold flex items-center gap-1">
                          <FontAwesomeIcon icon={faMapMarkerAlt} className="text-[#5D34F7]" />
                          {p.location || p.city || 'Location N/A'}
                        </p>
                      </div>
                    </div>

                    {/* Contact Details in Modal */}
                    <div className="bg-emerald-50/90 border border-emerald-200 rounded-2xl p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800 flex items-center gap-1">
                          <FontAwesomeIcon icon={faCheckCircle} className="text-emerald-600" />
                          <span>Contact Information</span>
                        </span>
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100/90 px-2 py-0.5 rounded-full">
                          Contacted
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-emerald-950 font-black text-sm">
                        <FontAwesomeIcon icon={faPhone} className="text-emerald-600 text-xs" />
                        <span>{previewContact.phone || 'Phone number available'}</span>
                      </div>
                      {previewContact.email && (
                        <div className="flex items-center gap-2 text-emerald-800 text-xs font-bold truncate">
                          <FontAwesomeIcon icon={faEnvelope} className="text-emerald-600 text-xs shrink-0" />
                          <span className="truncate">{previewContact.email}</span>
                        </div>
                      )}
                    </div>

                    {/* About / Description */}
                    {(p.about || p.bio) && (
                      <div className="space-y-2">
                        <h4 className="text-xs font-black uppercase text-slate-400 tracking-wider">About Me</h4>
                        <p className="text-slate-600 text-[13px] leading-relaxed font-medium bg-slate-50 p-4 rounded-2xl border border-slate-100/60 whitespace-pre-line">
                          {p.about || p.bio}
                        </p>
                      </div>
                    )}

                    {/* Key Attributes */}
                    <div className="space-y-2">
                      <h4 className="text-xs font-black uppercase text-slate-400 tracking-wider">Key Details</h4>
                      <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 p-4 rounded-2xl border border-slate-100">
                        <div><span className="text-slate-400 block text-[10px] font-bold">AGE</span> <span className="font-bold text-slate-800">{p.age || 'N/A'} Yrs</span></div>
                        <div><span className="text-slate-400 block text-[10px] font-bold">HEIGHT</span> <span className="font-bold text-slate-800">{p.height || 'N/A'}</span></div>
                        <div><span className="text-slate-400 block text-[10px] font-bold">RELIGION</span> <span className="font-bold text-slate-800">{p.religion || 'N/A'}</span></div>
                        <div><span className="text-slate-400 block text-[10px] font-bold">MARITAL STATUS</span> <span className="font-bold text-slate-800">{p.maritalStatus || 'N/A'}</span></div>
                        <div className="col-span-2"><span className="text-slate-400 block text-[10px] font-bold">SIBLINGS</span> <span className="font-bold text-slate-800">{formatSiblings(p)}</span></div>
                        <div className="col-span-2"><span className="text-slate-400 block text-[10px] font-bold">PROFESSION</span> <span className="font-bold text-slate-800">{p.profession || p.occupation || 'N/A'}</span></div>
                        {((p.languages && p.languages.length > 0) || p.motherTongue) && (
                          <div className="col-span-2"><span className="text-slate-400 block text-[10px] font-bold">SPOKEN LANGUAGES</span> <span className="font-extrabold text-sky-700">{formatLanguages(p.languages || p.motherTongue)}</span></div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Modal Footer Actions */}
                  <div className="pt-4 border-t border-slate-100 flex items-center gap-3">
                    <button
                      onClick={() => {
                        const targetId = previewContact?._id;
                        setPreviewContact(null);
                        navigate('/messages', { state: { contactId: targetId } });
                      }}
                      className="flex-1 py-3 bg-[#5D34F7] hover:bg-[#4024DB] text-white font-extrabold rounded-2xl text-xs transition shadow-md shadow-[#5D34F7]/25 flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                    >
                      <FontAwesomeIcon icon={faComments} />
                      <span>Chat</span>
                    </button>
                    <button
                      onClick={(e) => {
                        const c = previewContact;
                        setPreviewContact(null);
                        handleCall(c, e);
                      }}
                      className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-2xl text-xs transition shadow-md shadow-emerald-600/25 flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                    >
                      <FontAwesomeIcon icon={faPhone} />
                      <span>Call Now</span>
                    </button>
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

        {/* Full-Screen Image Lightbox Viewer */}
        <FullScreenImageViewer
          isOpen={fullScreenImage.isOpen}
          onClose={() => setFullScreenImage(prev => ({ ...prev, isOpen: false }))}
          images={fullScreenImage.images}
          initialIndex={fullScreenImage.initialIndex}
          userName={fullScreenImage.userName}
          gender={fullScreenImage.gender}
          targetUserId={fullScreenImage.targetUserId}
        />
      </div>
    </div>
  );
}
