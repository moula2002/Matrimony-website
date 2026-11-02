import React from 'react';
import { 
  Search, Heart, MessageSquare, Bell, Phone, 
  Users, AlertCircle, RefreshCw, Sparkles, FilterX, 
  ArrowRight, CheckCircle2, ShieldCheck 
} from 'lucide-react';

/**
 * Universal EmptyState & ErrorState Component
 * Provides clean, modern, and engaging empty states with illustrations,
 * helpful descriptions, and relevant action buttons across the website.
 */
export default function EmptyState({
  type = 'default', // 'search' | 'matches' | 'messages' | 'notifications' | 'contacts' | 'interests' | 'error' | 'default'
  icon,
  badge,
  title,
  description,
  primaryAction,
  secondaryAction,
  suggestions,
  isError = false,
  className = ''
}) {
  // Preset defaults based on type
  const getPreset = () => {
    switch (type) {
      case 'search':
        return {
          icon: <Search className="w-8 h-8 text-[#5D34F7]" />,
          iconBg: 'bg-gradient-to-br from-[#5D34F7]/15 to-[#805CFF]/10 text-[#5D34F7] border-[#5D34F7]/20',
          title: title || 'No Matching Profiles Found',
          description: description || 'We could not find any profiles matching your current filters or search terms. Try broadening your criteria or resetting filters.',
          defaultBadge: 'Search Results'
        };
      case 'matches':
        return {
          icon: <Heart className="w-8 h-8 text-rose-500 fill-rose-500/20" />,
          iconBg: 'bg-gradient-to-br from-rose-500/15 to-pink-500/10 text-rose-500 border-rose-500/20',
          title: title || 'No Matches Found Yet',
          description: description || 'We are continuously finding eligible profiles for you. Adjust your partner preferences or explore recently joined members!',
          defaultBadge: 'Recommendations'
        };
      case 'messages':
        return {
          icon: <MessageSquare className="w-8 h-8 text-sky-500" />,
          iconBg: 'bg-gradient-to-br from-sky-500/15 to-blue-500/10 text-sky-500 border-sky-500/20',
          title: title || 'No Active Conversations',
          description: description || 'Connect with compatible members and express interest to start meaningful conversations.',
          defaultBadge: 'Messages'
        };
      case 'notifications':
        return {
          icon: <Bell className="w-8 h-8 text-amber-500" />,
          iconBg: 'bg-gradient-to-br from-amber-500/15 to-orange-500/10 text-amber-500 border-amber-500/20',
          title: title || "You're All Caught Up!",
          description: description || 'There are no pending notifications right now. Activity and connection updates will appear here in real time.',
          defaultBadge: 'Updates'
        };
      case 'contacts':
        return {
          icon: <Phone className="w-8 h-8 text-emerald-500" />,
          iconBg: 'bg-gradient-to-br from-emerald-500/15 to-teal-500/10 text-emerald-500 border-emerald-500/20',
          title: title || 'No Contact Information Unlocked',
          description: description || 'When you view or unlock phone numbers and contact details on verified profiles, they are saved here permanently.',
          defaultBadge: 'Contact Book'
        };
      case 'interests':
        return {
          icon: <Users className="w-8 h-8 text-purple-600" />,
          iconBg: 'bg-gradient-to-br from-purple-500/15 to-indigo-500/10 text-purple-600 border-purple-500/20',
          title: title || 'No Interests Yet',
          description: description || 'Send connection requests to profiles you like or check back when other families express interest in you.',
          defaultBadge: 'Connections'
        };
      case 'error':
        return {
          icon: <AlertCircle className="w-8 h-8 text-rose-600" />,
          iconBg: 'bg-gradient-to-br from-rose-500/20 to-red-500/10 text-rose-600 border-rose-300',
          title: title || 'Unable to Load Information',
          description: description || 'A connection or server issue occurred while retrieving data. Please check your connection and try again.',
          defaultBadge: 'Connection Notice'
        };
      default:
        return {
          icon: <Sparkles className="w-8 h-8 text-[#5D34F7]" />,
          iconBg: 'bg-gradient-to-br from-[#5D34F7]/15 to-[#805CFF]/10 text-[#5D34F7] border-[#5D34F7]/20',
          title: title || 'No Data Available',
          description: description || 'There is no information to display in this section right now.',
          defaultBadge: 'Notice'
        };
    }
  };

  const preset = getPreset();
  const activeIcon = icon || preset.icon;
  const activeTitle = title || preset.title;
  const activeDesc = description || preset.description;
  const activeBadge = badge !== undefined ? badge : preset.defaultBadge;

  return (
    <div className={`bg-white rounded-3xl p-8 sm:p-12 md:p-16 border border-slate-100 shadow-sm flex flex-col items-center justify-center text-center max-w-2xl mx-auto my-4 transition-all duration-300 animate-in fade-in zoom-in-95 ${className}`}>
      {/* Decorative Icon Circle */}
      <div className="relative mb-6">
        <div className="absolute -inset-2 bg-gradient-to-r from-[#5D34F7]/10 via-[#FF477E]/10 to-[#4CC9F0]/10 rounded-full blur-md opacity-70 animate-pulse pointer-events-none" />
        <div className={`relative w-20 h-20 sm:w-24 sm:h-24 rounded-3xl border flex items-center justify-center shadow-xs transition-transform duration-300 hover:scale-105 ${preset.iconBg}`}>
          {activeIcon}
        </div>
      </div>

      {/* Badge Pill */}
      {activeBadge && (
        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider mb-3 ${
          isError || type === 'error'
            ? 'bg-rose-50 text-rose-700 border border-rose-200'
            : 'bg-slate-100 text-slate-700 border border-slate-200/80'
        }`}>
          <span className={`w-1.5 h-1.5 rounded-full ${isError || type === 'error' ? 'bg-rose-500' : 'bg-[#5D34F7]'}`} />
          {activeBadge}
        </span>
      )}

      {/* Title */}
      <h3 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight max-w-md leading-tight">
        {activeTitle}
      </h3>

      {/* Description */}
      <p className="text-slate-500 text-xs sm:text-sm font-semibold max-w-md mt-2.5 leading-relaxed">
        {activeDesc}
      </p>

      {/* Optional Helpful Suggestions */}
      {Array.isArray(suggestions) && suggestions.length > 0 && (
        <div className="mt-5 p-3.5 bg-slate-50 rounded-2xl border border-slate-100 text-left max-w-md w-full space-y-1.5">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block mb-1">
            Helpful Suggestions
          </span>
          {suggestions.map((s, idx) => (
            <div key={idx} className="flex items-start gap-2 text-xs text-slate-600 font-medium">
              <CheckCircle2 size={13} className="text-[#5D34F7] shrink-0 mt-0.5" />
              <span>{s}</span>
            </div>
          ))}
        </div>
      )}

      {/* Action Buttons */}
      {(primaryAction || secondaryAction) && (
        <div className="mt-7 flex flex-wrap items-center justify-center gap-3 w-full sm:w-auto">
          {primaryAction && (
            <button
              type="button"
              onClick={primaryAction.onClick}
              disabled={primaryAction.loading}
              className={`px-6 py-3 rounded-2xl text-xs sm:text-sm font-black transition-all duration-200 cursor-pointer shadow-md hover:shadow-lg active:scale-95 inline-flex items-center justify-center gap-2 flex-1 sm:flex-initial ${
                primaryAction.variant === 'danger' || isError || type === 'error'
                  ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-600/25'
                  : 'bg-gradient-to-r from-[#5D34F7] to-[#4024DB] hover:opacity-95 text-white shadow-[#5D34F7]/25'
              }`}
            >
              {primaryAction.loading ? (
                <RefreshCw size={15} className="animate-spin" />
              ) : primaryAction.icon ? (
                primaryAction.icon
              ) : (
                <ArrowRight size={15} />
              )}
              <span>{primaryAction.label}</span>
            </button>
          )}

          {secondaryAction && (
            <button
              type="button"
              onClick={secondaryAction.onClick}
              className="px-5 py-3 rounded-2xl text-xs sm:text-sm font-bold border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 transition-all duration-200 cursor-pointer active:scale-95 inline-flex items-center justify-center gap-2 flex-1 sm:flex-initial"
            >
              {secondaryAction.icon}
              <span>{secondaryAction.label}</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}
