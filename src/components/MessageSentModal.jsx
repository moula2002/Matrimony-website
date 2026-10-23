import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCheck,
  faTimes,
  faCommentDots,
  faPhone,
  faUser,
  faPaperPlane
} from '@fortawesome/free-solid-svg-icons';
import { getPhotoUrl } from '../api/axios';

/**
 * MessageSentModal
 * Displays immediate feedback when an interest/message has been sent,
 * followed by the "Next Step" options: Chat (first) and Call (second) [swapped order].
 */
export default function MessageSentModal({
  isOpen,
  onClose,
  user,
  onChat,
  onCall
}) {
  if (!isOpen || !user) return null;

  const profile = user.profile || user;
  const name = profile.name || user.email || 'Matrimony Member';
  const photo = profile.photos && profile.photos[0] ? getPhotoUrl(profile.photos[0]) : null;
  const age = profile.age;
  const location = profile.location;
  const profession = profile.profession || profile.occupation;

  return (
    <div
      className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-950/65 backdrop-blur-sm animate-in fade-in duration-200 cursor-pointer"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-[28px] max-w-sm w-full p-6 shadow-2xl border border-slate-100 relative cursor-default text-center animate-in zoom-in-95 duration-200 space-y-5"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition cursor-pointer"
          title="Close"
        >
          <FontAwesomeIcon icon={faTimes} className="text-xs" />
        </button>

        {/* Success Icon & Header */}
        <div className="flex flex-col items-center pt-2">
          <div className="w-16 h-16 rounded-full bg-emerald-50 border-4 border-emerald-100 flex items-center justify-center text-emerald-600 shadow-md mb-3 relative animate-bounce duration-1000">
            <FontAwesomeIcon icon={faCheck} className="text-2xl" />
            <span className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-[#5D34F7] text-white flex items-center justify-center text-[10px]">
              <FontAwesomeIcon icon={faPaperPlane} />
            </span>
          </div>

          <h3 className="text-xl font-black text-slate-900 tracking-tight">
            Message Sent Successfully!
          </h3>
          <p className="text-slate-500 text-xs font-semibold mt-1">
            Your interest has been delivered to <span className="text-slate-800 font-bold">{name}</span>
          </p>
        </div>

        {/* Member Preview Card */}
        <div className="bg-slate-50 border border-slate-100 rounded-2xl p-3.5 flex items-center gap-3 text-left">
          <div className="w-12 h-12 rounded-xl overflow-hidden bg-white border border-slate-200 flex items-center justify-center shrink-0 shadow-xs">
            {photo ? (
              <img src={photo} alt={name} className="w-full h-full object-cover" />
            ) : (
              <FontAwesomeIcon icon={faUser} className="text-slate-400 text-base" />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <h4 className="font-extrabold text-slate-800 text-sm truncate">
              {name}
            </h4>
            <p className="text-[11px] text-slate-500 font-medium truncate">
              {[age ? `${age} yrs` : null, location, profession].filter(Boolean).join(' • ') || 'Verified Member'}
            </p>
          </div>
        </div>

        {/* Next Step Section - Swapped: Chat First, Call Second */}
        <div className="space-y-2.5 pt-1">
          <div className="flex items-center justify-between px-1">
            <span className="text-[11px] font-black text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
              <span>Next Step:</span>
            </span>
            <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
              Express Connection
            </span>
          </div>

          <div className="space-y-2">
            {/* 1. CHAT NOW (FIRST) */}
            <button
              onClick={onChat}
              className="w-full py-3 bg-gradient-to-r from-[#5D34F7] to-[#4024DB] hover:from-[#4f27e5] hover:to-[#381fcc] text-white font-black rounded-xl text-xs shadow-md shadow-[#5D34F7]/25 transition flex items-center justify-center gap-2 cursor-pointer active:scale-95"
            >
              <FontAwesomeIcon icon={faCommentDots} className="text-sm" />
              <span>Chat Now</span>
            </button>

            {/* 2. CALL MEMBER (SECOND - SWAPPED) */}
            <button
              onClick={onCall}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-xl text-xs shadow-md shadow-emerald-600/20 transition flex items-center justify-center gap-2 cursor-pointer active:scale-95"
            >
              <FontAwesomeIcon icon={faPhone} className="text-xs" />
              <span>Call Member</span>
            </button>
          </div>
        </div>

        {/* Secondary Dismiss Button */}
        <button
          onClick={onClose}
          className="w-full py-2 bg-transparent hover:bg-slate-100 text-slate-500 hover:text-slate-700 font-bold text-xs rounded-xl transition cursor-pointer"
        >
          Continue Browsing
        </button>
      </div>
    </div>
  );
}
