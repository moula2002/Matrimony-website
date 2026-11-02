import { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  Phone, Video, PhoneIncoming, PhoneOutgoing, PhoneMissed, 
  PhoneOff, Clock, Search, X, RotateCcw, MessageSquare, 
  Trash2, ShieldCheck, Sparkles 
} from 'lucide-react';
import api, { getPhotoUrl, getDefaultAvatar, handleImageError } from '../api/axios';
import { 
  getLocalCallLogs, 
  mergeAndFormatCallLogs, 
  formatCallDurationReadable, 
  formatCallTimestamp,
  clearLocalCallLogs 
} from '../utils/callHistoryManager';

export default function CallHistoryModal({
  isOpen,
  onClose,
  currentUser,
  onInitiateCall,
  onSelectContact,
  filterUserId = null,
  hasVideoCallingAccess = true
}) {
  const [callLogs, setCallLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all'); // 'all', 'missed', 'incoming', 'outgoing', 'video', 'audio'
  const [clearing, setClearing] = useState(false);

  const fetchLogs = useCallback(async () => {
    if (!currentUser) return;
    setLoading(true);
    let serverLogs = [];
    try {
      if (filterUserId) {
        // Try to fetch target user's call logs
        const res = await api.get(`/call/history/${filterUserId}`);
        if (Array.isArray(res.data)) {
          serverLogs = res.data;
        }
      } else {
        // Fetch all call logs for current user
        const res = await api.get('/call/all-history');
        if (Array.isArray(res.data)) {
          serverLogs = res.data;
        }
      }
    } catch (err) {
      console.warn('Could not fetch server call logs, falling back to local storage cache:', err.message);
    }

    const localLogs = getLocalCallLogs();
    const formatted = mergeAndFormatCallLogs(serverLogs, localLogs, currentUser._id || currentUser.id);

    // If filterUserId is specified, filter by that user
    const finalLogs = filterUserId
      ? formatted.filter(item => String(item.contact._id) === String(filterUserId))
      : formatted;

    setCallLogs(finalLogs);
    setLoading(false);
  }, [currentUser, filterUserId]);

  useEffect(() => {
    if (isOpen) {
      fetchLogs();
      setSearchQuery('');
      setActiveFilter('all');
    }
  }, [isOpen, fetchLogs]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Filter logs by search query and category tab
  const filteredLogs = useMemo(() => {
    return callLogs.filter((log) => {
      // Category filter
      if (activeFilter === 'missed' && log.status !== 'missed') return false;
      if (activeFilter === 'incoming' && log.direction !== 'incoming') return false;
      if (activeFilter === 'outgoing' && log.direction !== 'outgoing') return false;
      if (activeFilter === 'video' && !log.isVideo) return false;
      if (activeFilter === 'audio' && log.isVideo) return false;

      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const contactName = (log.contact.name || '').toLowerCase();
        return contactName.includes(query);
      }

      return true;
    });
  }, [callLogs, activeFilter, searchQuery]);

  const missedCount = useMemo(() => {
    return callLogs.filter(log => log.status === 'missed').length;
  }, [callLogs]);

  const handleClearHistory = () => {
    if (window.confirm('Are you sure you want to clear your local call history?')) {
      clearLocalCallLogs();
      setCallLogs([]);
      setClearing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-[120] flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200 cursor-pointer"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-[28px] max-w-xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-100 overflow-hidden relative cursor-default animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-100 flex items-center justify-between shrink-0 bg-white">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-[#5D34F7]/10 text-[#5D34F7] flex items-center justify-center shadow-xs">
              <Phone size={22} className="stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-black text-slate-900 tracking-tight leading-none">
                  Call History
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[11px] font-black border border-slate-200/60">
                  {callLogs.length} {callLogs.length === 1 ? 'call' : 'calls'}
                </span>
              </div>
              <p className="text-slate-400 text-xs font-semibold mt-1">
                {filterUserId ? 'Call records with this member' : 'Voice and video call history with your matches'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Refresh Button */}
            <button
              type="button"
              onClick={fetchLogs}
              disabled={loading}
              className="p-2 text-slate-400 hover:text-[#5D34F7] hover:bg-slate-100 rounded-xl transition cursor-pointer disabled:opacity-50"
              title="Refresh Call History"
              aria-label="Refresh Call History"
            >
              <RotateCcw size={16} className={loading ? 'animate-spin' : ''} />
            </button>

            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition cursor-pointer"
              title="Close"
              aria-label="Close"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="px-5 pt-4 pb-2 shrink-0 bg-white">
          <div className="relative">
            <input
              type="text"
              placeholder="Search by contact name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 hover:bg-slate-100/70 focus:bg-white border border-slate-200/80 rounded-2xl py-2.5 pl-10 pr-9 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#5D34F7]/25 focus:border-[#5D34F7] transition"
            />
            <Search size={15} className="absolute left-3.5 top-3.5 text-slate-400" />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 p-0.5 rounded-full"
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>

        {/* Filter Pills */}
        <div className="px-5 py-2 flex items-center gap-1.5 overflow-x-auto shrink-0 scrollbar-none bg-white border-b border-slate-100">
          {[
            { id: 'all', label: 'All Calls' },
            { id: 'missed', label: 'Missed', badge: missedCount > 0 ? missedCount : null, badgeColor: 'bg-rose-500 text-white' },
            { id: 'incoming', label: 'Incoming' },
            { id: 'outgoing', label: 'Outgoing' },
            { id: 'video', label: 'Video' },
            { id: 'audio', label: 'Audio' }
          ].map((tab) => {
            const isActive = activeFilter === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveFilter(tab.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-[#5D34F7] text-white shadow-sm shadow-[#5D34F7]/20 font-black'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80 hover:text-slate-900'
                }`}
              >
                <span>{tab.label}</span>
                {tab.badge && (
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${tab.badgeColor}`}>
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Logs List Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-2.5 custom-scrollbar bg-slate-50/50">
          {loading && callLogs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-10 h-10 border-3 border-[#5D34F7] border-t-transparent rounded-full animate-spin mb-3"></div>
              <p className="text-slate-400 text-xs font-bold">Loading call history...</p>
            </div>
          ) : filteredLogs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center px-4">
              <div className="w-16 h-16 rounded-full bg-slate-100 border border-slate-200/60 flex items-center justify-center text-slate-300 mb-4 shadow-2xs">
                <PhoneOff size={28} />
              </div>
              <h3 className="text-base font-black text-slate-800 tracking-tight">
                {searchQuery
                  ? 'No matching calls found'
                  : activeFilter !== 'all'
                  ? `No ${activeFilter} calls found`
                  : 'No Call History Yet'}
              </h3>
              <p className="text-slate-400 text-xs max-w-xs mt-1.5 font-medium leading-relaxed">
                {searchQuery
                  ? 'Try searching with a different name or clear the search query to see other logs.'
                  : activeFilter !== 'all'
                  ? `You don't have any calls in the ${activeFilter} category.`
                  : 'Voice and video calls you make or receive with your matched connections will appear here.'}
              </p>
              {searchQuery ? (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="mt-3.5 px-4 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition cursor-pointer active:scale-95"
                >
                  Clear Search Query
                </button>
              ) : activeFilter !== 'all' ? (
                <button
                  type="button"
                  onClick={() => setActiveFilter('all')}
                  className="mt-3.5 px-4 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition cursor-pointer active:scale-95"
                >
                  Show All Call Logs
                </button>
              ) : null}
            </div>
          ) : (
            filteredLogs.map((log) => {
              const isMissed = log.status === 'missed';
              const isRejected = log.status === 'rejected';
              const isRinging = log.status === 'ringing';
              const isCompleted = log.status === 'ended' || log.status === 'accepted';
              const isOutgoing = log.direction === 'outgoing';

              const avatarUrl = log.contact.photo ? getPhotoUrl(log.contact.photo, log.contact.gender) : null;
              const fallbackAvatar = getDefaultAvatar(log.contact.gender);

              return (
                <div
                  key={log.id}
                  className="bg-white rounded-2xl p-3 sm:p-3.5 border border-slate-200/80 hover:border-[#5D34F7]/40 shadow-2xs hover:shadow-sm transition-all duration-150 flex items-center justify-between gap-3 group"
                >
                  {/* Left: Avatar with type icon */}
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="relative shrink-0">
                      <div className="w-12 h-12 rounded-2xl overflow-hidden border border-slate-200 bg-slate-100 flex items-center justify-center shadow-2xs">
                        <img
                          src={avatarUrl || fallbackAvatar}
                          alt={log.contact.name || 'Member'}
                          onError={(e) => handleImageError(e, log.contact.gender)}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      {/* Call Type Indicator badge overlay */}
                      <span className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-lg flex items-center justify-center text-[10px] shadow-sm border border-white ${
                        log.isVideo ? 'bg-indigo-600 text-white' : 'bg-emerald-600 text-white'
                      }`}>
                        {log.isVideo ? <Video size={10} className="stroke-[2.5]" /> : <Phone size={10} className="stroke-[2.5]" />}
                      </span>
                    </div>

                    {/* Middle: Contact Name, Direction, Status & Timestamp */}
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <h4 
                          onClick={() => {
                            if (onSelectContact) {
                              onSelectContact(log.contact);
                              onClose();
                            }
                          }}
                          className="text-sm font-extrabold text-slate-900 truncate hover:text-[#5D34F7] cursor-pointer transition leading-tight"
                        >
                          {log.contact.name || 'Matrimony Member'}
                        </h4>
                      </div>

                      {/* Direction & Status line */}
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        {isMissed ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-black text-rose-600">
                            <PhoneMissed size={12} className="stroke-[2.5] shrink-0" />
                            <span>Missed Call</span>
                          </span>
                        ) : isRejected ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-600">
                            <PhoneOff size={12} className="shrink-0" />
                            <span>Declined</span>
                          </span>
                        ) : isRinging ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-600 animate-pulse">
                            <Phone size={12} className="shrink-0" />
                            <span>Ringing...</span>
                          </span>
                        ) : isOutgoing ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-600">
                            <PhoneOutgoing size={12} className="text-blue-500 shrink-0" />
                            <span>Outgoing</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-600">
                            <PhoneIncoming size={12} className="text-emerald-500 shrink-0" />
                            <span>Incoming</span>
                          </span>
                        )}

                        <span className="text-slate-300 text-[10px]">•</span>

                        {/* Timestamp */}
                        <span className="text-[11px] font-medium text-slate-400">
                          {formatCallTimestamp(log.createdAt)}
                        </span>

                        {/* Duration for completed calls */}
                        {isCompleted && log.duration > 0 && (
                          <>
                            <span className="text-slate-300 text-[10px]">•</span>
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-500 bg-slate-100 px-1.5 py-0.2 rounded-md">
                              <Clock size={10} className="text-slate-400" />
                              <span>{formatCallDurationReadable(log.duration)}</span>
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right: Quick Action Buttons */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    {/* Chat button */}
                    {onSelectContact && (
                      <button
                        type="button"
                        onClick={() => {
                          onSelectContact(log.contact);
                          onClose();
                        }}
                        className="p-2 text-slate-400 hover:text-[#5D34F7] hover:bg-purple-50 rounded-xl transition cursor-pointer"
                        title="Send Message"
                        aria-label="Send Message"
                      >
                        <MessageSquare size={16} />
                      </button>
                    )}

                    {/* Audio Call button */}
                    {onInitiateCall && (
                      <button
                        type="button"
                        onClick={() => {
                          onInitiateCall(log.contact, 'voice');
                          onClose();
                        }}
                        className="p-2 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition cursor-pointer"
                        title="Start Audio Call"
                        aria-label="Start Audio Call"
                      >
                        <Phone size={16} />
                      </button>
                    )}

                    {/* Video Call button */}
                    {onInitiateCall && (
                      <button
                        type="button"
                        onClick={() => {
                          if (!hasVideoCallingAccess) {
                            if (window.confirm('Video calling is not included in your current subscription plan. Would you like to view our membership upgrade plans?')) {
                              window.location.href = '/plans';
                            }
                            return;
                          }
                          onInitiateCall(log.contact, 'video');
                          onClose();
                        }}
                        className={`p-2 rounded-xl transition cursor-pointer relative ${
                          hasVideoCallingAccess
                            ? 'text-slate-500 hover:text-indigo-600 hover:bg-indigo-50'
                            : 'text-slate-400 hover:text-slate-500 opacity-60 hover:opacity-100 hover:bg-slate-100'
                        }`}
                        title={hasVideoCallingAccess ? "Start Video Call" : "Video calling not included in your plan (Requires Diamond or Platinum Plan). Click to upgrade."}
                        aria-label={hasVideoCallingAccess ? "Start Video Call" : "Video calling not included in your plan"}
                      >
                        {!hasVideoCallingAccess && <span className="absolute -top-1 -right-1 text-[8px] leading-none select-none">🔒</span>}
                        <Video size={16} />
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer Area with Clear History Button */}
        {callLogs.length > 0 && (
          <div className="p-3.5 px-6 border-t border-slate-100 flex items-center justify-between bg-white text-xs text-slate-500 shrink-0">
            <span className="font-semibold text-slate-400 text-[11px]">
              Showing {filteredLogs.length} of {callLogs.length} records
            </span>
            <button
              type="button"
              onClick={handleClearHistory}
              className="text-slate-400 hover:text-rose-600 text-[11px] font-bold flex items-center gap-1 transition cursor-pointer"
            >
              <Trash2 size={12} />
              <span>Clear History</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
