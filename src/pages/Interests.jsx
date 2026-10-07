import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api, { getPhotoUrl } from '../api/axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faCheck, faTimes, faPaperPlane, faHeart, faUser, faCalendarAlt, 
  faMapMarkerAlt, faChevronRight, faSpinner, faCommentDots, faUserCheck
} from '@fortawesome/free-solid-svg-icons';
import loadingImg from '../assets/loading.png';

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
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);
  const navigate = useNavigate();

  const fetchInterests = async () => {
    try {
      setLoading(true);
      const [receivedRes, sentRes] = await Promise.all([
        api.get('/users/interests/received'),
        api.get('/users/interests/sent')
      ]);
      setReceived(receivedRes.data || []);
      setSent(sentRes.data || []);
    } catch (err) {
      console.error('Error fetching interests:', err);
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
        // Redirect to messages page if accepted
        setTimeout(() => {
          navigate('/messages');
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

  return (
    <div className="bg-transparent min-h-screen py-8 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto lg:mx-0 lg:ml-6 xl:ml-10 space-y-6 lg:px-8">
        
        {/* Page Header & Tab Controls */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
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
            <p className="text-slate-400 text-xs font-bold uppercase mt-1 tracking-wider">Manage your connection invites</p>
          </div>
          
          <div className="flex bg-slate-100 p-1.5 rounded-2xl gap-1 shrink-0 self-start sm:self-center">
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

        {/* Dynamic Lists container */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 min-h-[400px]">
          {loading ? (
            <div className="flex items-center justify-center h-80">
              <img src={loadingImg} alt="Loading..." className="h-12 w-12 animate-spin object-contain" />
            </div>
          ) : activeTab === 'received' ? (
            received.length === 0 ? (
              <EmptyPlaceholder icon={faHeart} title="No interests received yet" desc="When users send interest requests to connect with you, they will appear here." />
            ) : (
              <div className="space-y-4">
                {received.map(item => {
                  const sender = item.sender || {};
                  const p = sender.profile || {};
                  return (
                    <div 
                      key={item._id} 
                      className="border border-slate-100 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50/55 transition duration-200"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-16 h-16 rounded-full overflow-hidden bg-[#5D34F7]/5 border-2 border-[#5D34F7]/10 flex items-center justify-center shrink-0">
                          {p.photos && p.photos[0] ? (
                            <img src={getPhotoUrl(p.photos[0])} alt="Avatar" className="w-full h-full object-cover" />
                          ) : (
                            <FontAwesomeIcon icon={faUser} className="text-[#5D34F7]/40 text-lg" />
                          )}
                        </div>
                        <div>
                          <h4 className="font-extrabold text-slate-800 text-sm leading-tight flex items-center gap-1.5">
                            {p.name || sender.email || 'Matrimony Member'}
                            {sender.verificationStatus === 'approved' && <FontAwesomeIcon icon={faUserCheck} className="text-blue-500 text-xs ml-0.5" title="Verified Profile" />}
                            {p.gender === 'Female' && <span className="text-pink-500 text-[13px] leading-none" title="Female">♀️</span>}
                            {p.gender === 'Male' && <span className="text-blue-500 text-[13px] leading-none" title="Male">♂️</span>}
                          </h4>
                          <p className="text-slate-400 text-xs mt-0.5 flex items-center gap-1 font-semibold">
                            <FontAwesomeIcon icon={faMapMarkerAlt} className="text-[10px]" />
                            {p.location || 'Location N/A'}
                          </p>
                          <p className="text-[10px] text-slate-500 font-bold mt-1 bg-slate-100 px-2 py-0.5 rounded-full inline-block">
                            Age: {p.age || 'N/A'} yrs • Religion: {getReligionIcon(p.religion)} {p.religion || 'N/A'}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-end md:self-center">
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
                      </div>
                    </div>
                  );
                })}
              </div>
            )
          ) : (
            sent.length === 0 ? (
              <EmptyPlaceholder icon={faPaperPlane} title="No interests sent yet" desc="Browse recommended matches and send interest requests to start matching families!" />
            ) : (
              <div className="space-y-4">
                {sent.map(item => {
                  const receiver = item.receiver || {};
                  const p = receiver.profile || {};
                  return (
                    <div 
                      key={item._id} 
                      className="border border-slate-100 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50/55 transition duration-200"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-16 h-16 rounded-full overflow-hidden bg-[#5D34F7]/5 border-2 border-[#5D34F7]/10 flex items-center justify-center shrink-0">
                          {p.photos && p.photos[0] ? (
                            <img src={getPhotoUrl(p.photos[0])} alt="Avatar" className="w-full h-full object-cover" />
                          ) : (
                            <FontAwesomeIcon icon={faUser} className="text-[#5D34F7]/40 text-lg" />
                          )}
                        </div>
                        <div>
                          <h4 className="font-extrabold text-slate-800 text-sm leading-tight flex items-center gap-1.5">
                            {p.name || receiver.email || 'Matrimony Member'}
                            {receiver.verificationStatus === 'approved' && <FontAwesomeIcon icon={faUserCheck} className="text-blue-500 text-xs ml-0.5" title="Verified Profile" />}
                            {p.gender === 'Female' && <span className="text-pink-500 text-[13px] leading-none" title="Female">♀️</span>}
                            {p.gender === 'Male' && <span className="text-blue-500 text-[13px] leading-none" title="Male">♂️</span>}
                          </h4>
                          <span className={`inline-block text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full mt-1 ${
                            item.status === 'accepted' 
                              ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' 
                              : item.status === 'rejected'
                              ? 'bg-red-50 text-red-600 border border-red-100'
                              : 'bg-amber-50 text-amber-600 border border-amber-100'
                          }`}>
                            {item.status}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-end md:self-center">
                        {item.status === 'accepted' ? (
                          <button
                            onClick={() => navigate('/messages')}
                            className="px-4 py-2 bg-gradient-to-r from-[#5D34F7] to-[#4024DB] hover:opacity-95 text-white text-xs font-bold rounded-xl cursor-pointer transition flex items-center gap-1.5"
                          >
                            <FontAwesomeIcon icon={faCommentDots} />
                            Chat now
                          </button>
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

      </div>
    </div>
  );
}

function EmptyPlaceholder({ icon, title, desc }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-20 px-4 space-y-4">
      <div className="w-16 h-16 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-[#5D34F7]/40 text-2xl shadow-inner">
        <FontAwesomeIcon icon={icon} />
      </div>
      <h3 className="font-extrabold text-slate-800 text-base">{title}</h3>
      <p className="text-slate-400 text-xs max-w-xs font-semibold leading-relaxed">{desc}</p>
    </div>
  );
}
