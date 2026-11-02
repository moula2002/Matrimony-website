import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faPhone,
  faTimes,
  faUser,
  faCommentDots,
  faPhoneAlt
} from '@fortawesome/free-solid-svg-icons';
import { getPhotoUrl } from '../api/axios';

/**
 * CallModal (Contact Dialog)
 * Feature 17 implementation:
 * - Removed Email option completely from dialog.
 * - Primary Option A: Call (Normal Phone Call, WhatsApp Call)
 * - Primary Option B: Text (Normal SMS/Text, WhatsApp Message)
 */
export default function CallModal({ isOpen, onClose, phone, name, photo }) {
  const [activeTab, setActiveTab] = useState('call'); // 'call' | 'text'

  if (!isOpen || !phone) return null;

  // Clean phone number for tel: and whatsapp links
  const cleanedPhone = phone.toString().replace(/[^\d+]/g, '');
  const digitsOnly = phone.toString().replace(/\D/g, '');
  const avatarUrl = photo ? getPhotoUrl(photo) : null;
  const memberName = name || 'Matrimony Member';

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/65 backdrop-blur-sm animate-in fade-in duration-200 cursor-pointer"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-[28px] max-w-sm w-full p-6 shadow-2xl border border-slate-100 relative cursor-default space-y-5 text-center animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition cursor-pointer"
          title="Close"
        >
          <FontAwesomeIcon icon={faTimes} className="text-sm" />
        </button>

        {/* Member Profile Avatar & Header */}
        <div className="flex flex-col items-center pt-2">
          <div className="w-20 h-20 rounded-full border-4 border-[#5D34F7]/20 bg-[#5D34F7]/10 flex items-center justify-center overflow-hidden shadow-md mb-2">
            {avatarUrl ? (
              <img src={avatarUrl} alt={memberName} className="w-full h-full object-cover" />
            ) : (
              <FontAwesomeIcon icon={faUser} className="text-[#5D34F7] text-2xl" />
            )}
          </div>
          <h3 className="text-xl font-black text-slate-900 tracking-tight">
            {memberName}
          </h3>
          <p className="text-slate-400 text-xs font-semibold mt-0.5">
            Verified Contact Details
          </p>
        </div>

        {/* Phone Number Display Card */}
        <div className="bg-slate-50 border border-slate-100 rounded-2xl p-3.5 flex items-center justify-between">
          <div className="text-left w-full">
            <span className="text-slate-400 text-[10px] font-extrabold tracking-wider uppercase block mb-0.5">
              Verified Phone Number
            </span>
            <span className="text-slate-900 font-extrabold text-base tracking-wide font-mono">
              {phone}
            </span>
          </div>
        </div>

        {/* Primary Option Selector: Option A - Call | Option B - Text */}
        <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-100 rounded-2xl">
          <button
            type="button"
            onClick={() => setActiveTab('call')}
            className={`py-2.5 rounded-xl font-black text-xs transition cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'call'
                ? 'bg-white text-emerald-700 shadow-sm'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <FontAwesomeIcon icon={faPhone} />
            <span>Option A: Call</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('text')}
            className={`py-2.5 rounded-xl font-black text-xs transition cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'text'
                ? 'bg-white text-[#5D34F7] shadow-sm'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <FontAwesomeIcon icon={faCommentDots} />
            <span>Option B: Text</span>
          </button>
        </div>

        {/* Option A: CALL Controls */}
        {activeTab === 'call' && (
          <div className="space-y-2.5 pt-1 animate-in fade-in duration-200">
            {/* 1. Normal Phone Call */}
            <a
              href={`tel:${cleanedPhone}`}
              className="w-full py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-black rounded-2xl text-xs sm:text-sm shadow-md shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95 no-underline"
            >
              <FontAwesomeIcon icon={faPhoneAlt} className="text-xs" />
              <span>Normal Phone Call</span>
            </a>

            {/* 2. WhatsApp Call */}
            {digitsOnly && (
              <a
                href={`https://wa.me/${digitsOnly}?text=Hello%20${encodeURIComponent(memberName)}%2C%20connecting%20via%20Familiess%20Matrimony%20for%20a%20call.`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 bg-[#25D366] hover:bg-[#20ba5a] text-white font-black rounded-2xl text-xs sm:text-sm shadow-md shadow-[#25D366]/20 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95 no-underline"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
                </svg>
                <span>WhatsApp Call</span>
              </a>
            )}
          </div>
        )}

        {/* Option B: TEXT Controls */}
        {activeTab === 'text' && (
          <div className="space-y-2.5 pt-1 animate-in fade-in duration-200">
            {/* 1. Normal SMS Text Message */}
            <a
              href={`sms:${cleanedPhone}?body=Hello%20${encodeURIComponent(memberName)}%2C%20connecting%20via%20Familiess%20Matrimony.`}
              className="w-full py-3 bg-gradient-to-r from-[#5D34F7] to-[#4024DB] hover:from-[#4d25d0] hover:to-[#381fcc] text-white font-black rounded-2xl text-xs sm:text-sm shadow-md shadow-[#5D34F7]/20 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95 no-underline"
            >
              <FontAwesomeIcon icon={faCommentDots} className="text-xs" />
              <span>Normal SMS / Text</span>
            </a>

            {/* 2. WhatsApp Message */}
            {digitsOnly && (
              <a
                href={`https://wa.me/${digitsOnly}?text=Hello%20${encodeURIComponent(memberName)}%2C%20connecting%20via%20Familiess%20Matrimony.`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 bg-[#25D366] hover:bg-[#20ba5a] text-white font-black rounded-2xl text-xs sm:text-sm shadow-md shadow-[#25D366]/20 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95 no-underline"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
                </svg>
                <span>WhatsApp Message</span>
              </a>
            )}
          </div>
        )}

        {/* Dismiss Button */}
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
