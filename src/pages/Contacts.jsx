import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api, { getPhotoUrl } from '../api/axios';
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
  faArrowRight
} from '@fortawesome/free-solid-svg-icons';
import loadingImg from '../assets/loading.png';
import CallModal from '../components/CallModal';

export default function Contacts() {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [callModalData, setCallModalData] = useState({
    isOpen: false,
    phone: '',
    name: '',
    photo: null
  });
  const navigate = useNavigate();

  const fetchContacts = async () => {
    try {
      setLoading(true);
      const res = await api.get('/users/contacts-viewed');
      setContacts(res.data || []);
    } catch (err) {
      console.error('Error fetching contacted profiles:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContacts();
  }, []);

  const filteredContacts = contacts.filter((c) => {
    const p = c.profile || {};
    const name = (p.name || '').toLowerCase();
    const uid = (c.uid || '').toLowerCase();
    const phone = (c.phone || '').toLowerCase();
    const loc = (p.city || p.location || '').toLowerCase();
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return name.includes(q) || uid.includes(q) || phone.includes(q) || loc.includes(q);
  });

  const handleCall = (contact) => {
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
              <span>Unlocked Contacts</span>
              <span className="text-xs font-black px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800">
                {contacts.length}
              </span>
            </h1>
            <p className="text-slate-400 text-xs font-bold uppercase mt-1 tracking-wider">
              Phone numbers and emails unlocked via your membership
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
              placeholder="Search by name, ID, city..."
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
        ) : filteredContacts.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center shadow-sm border border-slate-100 flex flex-col items-center justify-center min-h-[350px] space-y-4">
            <div className="w-20 h-20 rounded-3xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-300 text-3xl shadow-inner">
              <FontAwesomeIcon icon={faPhone} />
            </div>
            <div className="space-y-1 max-w-sm">
              <h3 className="text-lg font-black text-slate-900">
                {searchQuery ? 'No matching contacts found' : 'No contacts viewed yet'}
              </h3>
              <p className="text-slate-500 text-xs font-semibold leading-relaxed">
                {searchQuery
                  ? 'Try searching with a different name, ID, or phone number.'
                  : 'When you view or unlock member contact details from Match cards, they will be saved here for easy access.'}
              </p>
            </div>
            {!searchQuery && (
              <button
                onClick={() => navigate('/preference-matches')}
                className="mt-2 px-6 py-3 bg-gradient-to-r from-[#5D34F7] to-[#4024DB] hover:from-[#4d25d0] hover:to-[#381fcc] text-white font-black rounded-2xl text-xs shadow-md transition cursor-pointer flex items-center gap-2 active:scale-95"
              >
                <span>Discover Matches</span>
                <FontAwesomeIcon icon={faArrowRight} />
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredContacts.map((contact) => {
              const p = contact.profile || {};
              const photo = p.photos && p.photos[0] ? getPhotoUrl(p.photos[0]) : null;
              const formattedDate = contact.contactedAt
                ? new Date(contact.contactedAt).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric'
                  })
                : null;

              return (
                <div
                  key={contact._id}
                  className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-all flex flex-col justify-between space-y-4 group"
                >
                  <div>
                    {/* Top User Info Row */}
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-2xl overflow-hidden bg-slate-100 border-2 border-emerald-100 shrink-0 flex items-center justify-center relative shadow-xs">
                        {photo ? (
                          <img src={photo} alt={p.name || 'Member'} className="w-full h-full object-cover" />
                        ) : (
                          <FontAwesomeIcon icon={faUser} className="text-slate-400 text-2xl" />
                        )}
                        {contact.isVerified && (
                          <div className="absolute top-1 right-1 w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[9px] shadow-xs" title="Verified Member">
                            <FontAwesomeIcon icon={faCheckCircle} />
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <h3 className="font-black text-slate-900 text-base truncate">
                            {p.name || 'Matrimony Member'}
                          </h3>
                          {contact.premiumMembership?.isPremium && (
                            <FontAwesomeIcon icon={faCrown} className="text-amber-500 text-xs shrink-0" title="Premium Member" />
                          )}
                        </div>
                        <p className="text-[11px] text-slate-400 font-bold truncate mt-0.5">
                          ID: {contact.uid || contact._id?.substring(0, 8).toUpperCase()}
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
                    <div className="mt-4 bg-emerald-50/70 border border-emerald-100 rounded-2xl p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800">
                          Unlocked Contact
                        </span>
                        {formattedDate && (
                          <span className="text-[10px] font-bold text-emerald-700/80 flex items-center gap-1">
                            <FontAwesomeIcon icon={faCalendarAlt} className="text-[9px]" />
                            <span>{formattedDate}</span>
                          </span>
                        )}
                      </div>

                      {/* Unmasked Phone Number */}
                      <div className="flex items-center gap-2 text-emerald-950 font-black text-sm">
                        <FontAwesomeIcon icon={faPhone} className="text-emerald-600 text-xs" />
                        <span className="tracking-wide">{contact.phone || 'Phone number unlocked'}</span>
                      </div>

                      {/* Unmasked Email */}
                      {contact.email && (
                        <div className="flex items-center gap-2 text-emerald-800 text-xs font-bold truncate">
                          <FontAwesomeIcon icon={faEnvelope} className="text-emerald-600 text-xs" />
                          <span className="truncate">{contact.email}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions Row */}
                  <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                    <button
                      onClick={() => handleCall(contact)}
                      className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-xl text-xs transition flex items-center justify-center gap-2 cursor-pointer shadow-xs active:scale-95"
                    >
                      <FontAwesomeIcon icon={faPhone} className="text-xs" />
                      <span>Call Now</span>
                    </button>
                    <button
                      onClick={() => navigate('/messages')}
                      className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition flex items-center justify-center cursor-pointer active:scale-95"
                      title="Open Chat"
                    >
                      <FontAwesomeIcon icon={faComments} className="text-sm" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Call Modal */}
        <CallModal
          isOpen={callModalData.isOpen}
          onClose={() => setCallModalData({ ...callModalData, isOpen: false })}
          phone={callModalData.phone}
          name={callModalData.name}
          photo={callModalData.photo}
        />
      </div>
    </div>
  );
}
