import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faPhone,
  faCopy,
  faCheck,
  faTimes,
  faUser,
  faCommentDots
} from '@fortawesome/free-solid-svg-icons';
import { getPhotoUrl } from '../api/axios';

export default function CallModal({ isOpen, onClose, phone, name, photo }) {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !phone) return null;

  // Clean phone number for tel: and whatsapp links
  const cleanedPhone = phone.toString().replace(/[^\d+]/g, '');
  const digitsOnly = phone.toString().replace(/\D/g, '');

  const handleCopy = (e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(phone);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const avatarUrl = photo ? getPhotoUrl(photo) : null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200 cursor-pointer"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-[28px] max-w-sm w-full p-6 shadow-2xl border border-slate-100 relative cursor-default space-y-6 text-center animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition cursor-pointer"
        >
          <FontAwesomeIcon icon={faTimes} className="text-sm" />
        </button>

        {/* Contact Info Header */}
        <div className="flex flex-col items-center pt-2">
          <div className="w-20 h-20 rounded-full border-4 border-[#5D34F7]/20 bg-[#5D34F7]/10 flex items-center justify-center overflow-hidden shadow-md mb-3">
            {avatarUrl ? (
              <img src={avatarUrl} alt={name || 'Contact'} className="w-full h-full object-cover" />
            ) : (
              <FontAwesomeIcon icon={faUser} className="text-[#5D34F7] text-2xl" />
            )}
          </div>
          <h3 className="text-xl font-black text-slate-900 tracking-tight">
            {name || 'Matrimony Contact'}
          </h3>
          <p className="text-slate-400 text-xs font-semibold mt-0.5">
            Verified Member Contact
          </p>
        </div>

        {/* Phone Number Display Box */}
        <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 flex items-center justify-between">
          <div className="text-left">
            <span className="text-slate-400 text-[10px] font-extrabold tracking-wider uppercase block mb-0.5">
              Phone Number
            </span>
            <span className="text-slate-900 font-extrabold text-base tracking-wide">
              {phone}
            </span>
          </div>

          <button
            onClick={handleCopy}
            className="p-2.5 bg-white hover:bg-slate-100 text-slate-600 rounded-xl border border-slate-200 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer active:scale-95 shadow-xs"
            title="Copy Number"
          >
            {copied ? (
              <>
                <FontAwesomeIcon icon={faCheck} className="text-emerald-500" />
                <span className="text-emerald-600">Copied</span>
              </>
            ) : (
              <>
                <FontAwesomeIcon icon={faCopy} className="text-slate-400" />
                <span>Copy</span>
              </>
            )}
          </button>
        </div>

        {/* Action Buttons: Swapped WhatsApp Chat (first) and Direct Call (second) */}
        <div className="space-y-3 pt-1">
          {/* WhatsApp Direct Chat Link (FIRST) */}
          {digitsOnly && (
            <a
              href={`https://wa.me/${digitsOnly}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3.5 bg-[#25D366] hover:bg-[#20ba5a] text-white font-black rounded-2xl text-sm shadow-lg shadow-[#25D366]/25 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-1.157 4.228 4.228-1.157z" />
              </svg>
              <span>Chat on WhatsApp</span>
            </a>
          )}

          {/* Direct Phone Call Button (SECOND) */}
          <a
            href={`tel:${cleanedPhone}`}
            className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-black rounded-2xl text-sm shadow-md shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
          >
            <FontAwesomeIcon icon={faPhone} className="text-sm" />
            <span>Call {phone}</span>
          </a>

          {/* SMS Direct Link */}
          <a
            href={`sms:${cleanedPhone}`}
            className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-2xl text-xs transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
          >
            <FontAwesomeIcon icon={faCommentDots} className="text-xs" />
            <span>Send SMS</span>
          </a>
        </div>

        {/* Cancel Button */}
        <button
          onClick={onClose}
          className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-xs rounded-xl transition cursor-pointer"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
