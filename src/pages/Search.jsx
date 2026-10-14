import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faUser, faHeart, faSpinner, faEye, faCheck,
  faMapMarkerAlt, faBriefcase, faChevronDown, faChevronUp, faGraduationCap,
  faCalendarAlt, faRulerVertical, faSearch, faCommentDots
} from '@fortawesome/free-solid-svg-icons';
import api, { getPhotoUrl } from '../api/axios';
import loadingImg from '../assets/loading.png';
import CallModal from '../components/CallModal';
import ContactInfoCard from '../components/ContactInfoCard';
import { getCachedUnlockedContacts, syncContactedProfiles } from '../utils/contactManager';

export default function Search() {
  const [profile, setProfile] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [sendingInterestMap, setSendingInterestMap] = useState({});
  const [sentInterests, setSentInterests] = useState({});
  const [expandedCards, setExpandedCards] = useState({});
  const [previewMatch, setPreviewMatch] = useState(null);
  const [activePreviewImage, setActivePreviewImage] = useState(null);
  const [callModalData, setCallModalData] = useState({ isOpen: false, phone: '', name: '', photo: '' });
  const [unlockedContacts, setUnlockedContacts] = useState(getCachedUnlockedContacts());
  const navigate = useNavigate();

  // Load current user profile initially
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get('/users/profile');
        setProfile(res.data);
        if (res.data?.premiumMembership?.isPremium) {
          syncContactedProfiles().then((cached) => {
            if (cached) setUnlockedContacts(cached);
          });
        }
      } catch (err) {
        console.error('Error fetching profile in Search:', err);
      } finally {
        setInitialLoading(false);
      }
    };
    fetchProfile();
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

  const handleSearchSubmit = async (e) => {
    if (e) e.preventDefault();
    const query = searchQuery.trim();
    if (!query) return;

    setLoading(true);
    try {
      const res = await api.get(`/users/matches?search=${encodeURIComponent(query)}`);
      setSearchResults(res.data || []);
    } catch (err) {
      console.error('Error performing search:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSendInterest = async (receiverId) => {
    setSendingInterestMap(prev => ({ ...prev, [receiverId]: true }));
    try {
      await api.post('/users/interests', { receiverId });
      setSentInterests(prev => ({ ...prev, [receiverId]: true }));
    } catch (err) {
      console.error('Error sending interest:', err);
    } finally {
      setSendingInterestMap(prev => ({ ...prev, [receiverId]: false }));
    }
  };

  const handlePreviewProfile = async (match, photo) => {
    setPreviewMatch(match);
    setActivePreviewImage(photo);
    try {
      await api.post(`/users/view/${match._id}`);
    } catch (err) {
      console.error('Error recording view from preview:', err);
    }
  };

  const handleExpandCard = async (targetId) => {
    const isExpanding = !expandedCards[targetId];
    setExpandedCards(prev => ({ ...prev, [targetId]: isExpanding }));

    if (isExpanding) {
      try {
        await api.post(`/users/view/${targetId}`);
      } catch (err) {
        console.error('Error recording view:', err);
      }
    }
  };

  if (initialLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-transparent">
        <img src={loadingImg} alt="Loading..." className="h-16 w-16 object-contain animate-spin" />
      </div>
    );
  }

  return (
    <div className="bg-transparent min-h-screen py-8 px-4 sm:px-6 font-sans">
      <div className="max-w-7xl mx-auto lg:mx-0 lg:ml-6 xl:ml-10 bg-white rounded-3xl p-6 sm:p-8 shadow-md border border-slate-100/60 space-y-8 lg:px-8">
        
        {/* Title Header */}
        <div className="bg-gradient-to-r from-[#5D34F7] to-[#4024DB] rounded-3xl py-6 px-8 text-white shadow-lg shadow-[#5D34F7]/10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 relative overflow-hidden">
          <div className="absolute right-0 bottom-0 top-0 w-1/3 bg-radial-gradient from-white/10 to-transparent pointer-events-none" />
          <div className="space-y-1.5 z-10">
            <h1 className="text-xl sm:text-2xl font-black tracking-tight flex items-center gap-2.5">
              <FontAwesomeIcon icon={faSearch} className="w-6 h-6 text-[#FFE066] drop-shadow-md shrink-0" />
              <span>Search Profiles by UID or Name</span>
            </h1>
            <p className="text-white/80 text-xs font-semibold">Enter a profile name or unique UID code (e.g. FAM00000001) to find matches directly.</p>
          </div>
        </div>

        {/* Search Form Bar */}
        <form onSubmit={handleSearchSubmit} className="bg-slate-50 rounded-3xl p-4 shadow-inner border border-slate-100 flex flex-col sm:flex-row gap-3 items-center">
          <div className="relative flex-1 w-full">
            <input
              type="text"
              placeholder="Search by Profile UID (e.g., FAM00000001) or Name..."
              className="w-full pl-11 pr-4 py-3.5 bg-white border border-slate-200 rounded-2xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#5D34F7]/25 focus:border-[#5D34F7] transition"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <FontAwesomeIcon icon={faSearch} className="absolute left-4 top-4.5 text-slate-400 text-sm" />
          </div>
          <button
            type="submit"
            disabled={loading || !searchQuery.trim()}
            className="w-full sm:w-auto px-8 py-3.5 bg-[#5D34F7] hover:bg-[#4024DB] disabled:opacity-50 text-white font-extrabold rounded-2xl text-xs shadow-md shadow-[#5D34F7]/25 transition cursor-pointer flex items-center justify-center gap-2 shrink-0 active:scale-95"
          >
            {loading ? (
              <FontAwesomeIcon icon={faSpinner} spin className="text-sm" />
            ) : (
              <>
                <FontAwesomeIcon icon={faSearch} />
                <span>Search</span>
              </>
            )}
          </button>
        </form>

        {/* Results Info and Cards */}
        {loading ? (
          <div className="bg-slate-50 rounded-3xl p-16 shadow-inner border border-slate-100 flex flex-col items-center justify-center min-h-[350px] text-center">
            <img src={loadingImg} alt="Searching..." className="h-12 w-12 animate-spin object-contain" />
          </div>
        ) : searchResults.length === 0 ? (
          <div className="bg-slate-50 rounded-3xl p-16 shadow-inner border border-slate-100 flex flex-col items-center justify-center min-h-[350px] text-center">
            <div className="w-20 h-20 bg-white border border-slate-100 rounded-full flex items-center justify-center mb-6">
              <FontAwesomeIcon icon={faSearch} className="w-8 h-8 text-slate-300" />
            </div>
            <h3 className="text-lg font-black text-slate-800 tracking-tight">
              {searchQuery.trim() ? 'No profiles found matching your query' : 'Start your search'}
            </h3>
            <p className="text-slate-400 text-xs max-w-sm mt-2 font-medium">
              {searchQuery.trim() 
                ? 'Try looking for another name or check the spelling/UID format.' 
                : 'Enter a name or a member ID in the search bar above to begin searching.'}
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex justify-between items-center px-2">
              <h2 className="text-xs font-black text-slate-400 tracking-widest uppercase flex items-center gap-2">
                <span>Search Results</span>
                <span className="bg-[#5D34F7] text-white text-[10px] px-2.5 py-0.5 rounded-full font-bold shadow-sm">
                  {searchResults.length}
                </span>
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
              {searchResults.map(match => {
                const p = match.profile || {};
                const isSending = sendingInterestMap[match._id];
                const isSent = sentInterests[match._id];

                return (
                  <div
                    key={match._id}
                    className="bg-slate-50 rounded-3xl overflow-hidden shadow-sm hover:shadow-md border border-slate-100 flex flex-col hover:-translate-y-1.5 transition-all duration-300 relative group"
                  >
                    {/* Image section */}
                    <div 
                      onClick={() => handlePreviewProfile(match, p.photos && p.photos[0] ? p.photos[0] : null)}
                      className="h-56 bg-white relative overflow-hidden flex items-center justify-center bg-gradient-to-br from-[#5D34F7]/5 to-orange-500/5 border-b border-slate-100 cursor-pointer group/img"
                    >
                      {p.photos && p.photos[0] ? (
                        <img
                          src={getPhotoUrl(p.photos[0])}
                          alt={p.name}
                          className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <FontAwesomeIcon icon={faUser} className="text-[#5D34F7]/20 text-5xl" />
                      )}

                      {/* Hover eye icon overlay */}
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover/img:opacity-100 transition duration-300">
                        <div className="bg-white/90 backdrop-blur-md px-4 py-2 rounded-2xl flex items-center gap-2 text-slate-800 font-extrabold text-xs shadow-md transform translate-y-2 group-hover/img:translate-y-0 transition duration-300">
                          <FontAwesomeIcon icon={faEye} className="text-[#5D34F7] text-sm" />
                          <span>View Profile</span>
                        </div>
                      </div>

                      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 via-transparent to-transparent opacity-80" />

                      <span className="absolute bottom-4 right-4 px-3 py-1 bg-black/50 backdrop-blur-md text-white text-[9px] font-black tracking-wider rounded-full border border-white/10 uppercase">
                        UID: {match.uid || match._id.substring(match._id.length - 8).toUpperCase()}
                      </span>
                    </div>

                    {/* Content Section */}
                    <div className="p-6 flex-1 flex flex-col justify-between space-y-6">
                      <div className="space-y-4">
                        <div className="flex justify-between items-start">
                          <div className="space-y-1">
                            <h3 className="font-extrabold text-slate-800 text-base tracking-tight leading-tight">
                              {p.name || 'Matrimony Member'}
                            </h3>
                            <p className="text-slate-400 text-xs font-bold flex items-center gap-1">
                              <FontAwesomeIcon icon={faMapMarkerAlt} className="text-[10px] text-slate-350" />
                              {p.location || 'Location N/A'}
                            </p>
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
                            {p.religion && <div><span className="text-slate-400 block font-semibold mb-0.5">Religion</span> {p.religion}</div>}
                            {p.caste && <div><span className="text-slate-400 block font-semibold mb-0.5">Caste</span> {p.caste}</div>}
                            {p.subCommunity && <div><span className="text-slate-400 block font-semibold mb-0.5">Sub-Community</span> {p.subCommunity}</div>}
                            {p.diet && <div><span className="text-slate-400 block font-semibold mb-0.5">Diet</span> {p.diet}</div>}
                            {p.maritalStatus && <div><span className="text-slate-400 block font-semibold mb-0.5">Marital Status</span> {p.maritalStatus}</div>}
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
                            {p.sistersCount !== undefined && <div><span className="text-slate-400 block font-semibold mb-0.5">Sisters</span> {p.sistersCount}</div>}
                            {p.brothersCount !== undefined && <div><span className="text-slate-400 block font-semibold mb-0.5">Brothers</span> {p.brothersCount}</div>}
                            {p.hobbies && p.hobbies.length > 0 && (
                              <div className="col-span-2">
                                <span className="text-slate-400 block font-semibold mb-0.5">Hobbies</span>
                                {p.hobbies.join(', ')}
                              </div>
                            )}
                            {p.bio && (
                              <div className="col-span-2 border-t border-slate-200/50 pt-2 mt-2 italic text-slate-500 leading-relaxed font-semibold">
                                "{p.bio}"
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Footer Actions */}
                      <div className="pt-2">
                        {match.interestStatus === 'accepted' ? (
                          <button
                            onClick={() => navigate('/messages')}
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
                          <div className="w-full py-3 bg-emerald-50 text-emerald-700 rounded-2xl font-black text-center text-xs flex items-center justify-center gap-1.5 border border-emerald-150 shadow-inner">
                            <FontAwesomeIcon icon={faCheck} className="text-sm" />
                            Interest Sent
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
          </div>
        )}

      </div>

      {/* Profile Detail Preview Modal */}
      {previewMatch && (() => {
        const p = previewMatch.profile || {};
        const isSending = sendingInterestMap[previewMatch._id];
        const isSent = sentInterests[previewMatch._id];
        
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
                    <h2 className="text-2xl font-black text-slate-800 tracking-tight">{p.name || 'Matrimony Member'}</h2>
                    <p className="text-slate-400 text-xs font-bold mt-1 flex items-center gap-1">
                      <FontAwesomeIcon icon={faMapMarkerAlt} className="text-[#5D34F7]" />
                      {p.location || 'Location N/A'}
                    </p>
                  </div>

                  {/* About / Description */}
                  {p.about && (
                    <div className="space-y-2">
                      <h4 className="text-xs font-black uppercase text-slate-400 tracking-wider">About Me</h4>
                      <p className="text-slate-600 text-[13px] leading-relaxed font-medium bg-slate-50 p-4 rounded-2xl border border-slate-100/60">
                        {p.about}
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
                      <div className="w-full py-3.5 bg-emerald-50 text-emerald-700 rounded-2xl font-black text-center text-sm flex items-center justify-center gap-1.5 border border-emerald-150 shadow-inner">
                        <FontAwesomeIcon icon={faCheck} className="text-base" />
                        Interest Sent Successfully
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

    </div>
  );
}
