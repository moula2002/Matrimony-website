import React from 'react';

/**
 * Extracts normalized subscription details from user or member object.
 * Handles missing or malformed data gracefully.
 */
export const getPlanDetails = (userObj) => {
  if (!userObj) {
    return {
      isPremium: false,
      isVip: false,
      planName: 'Free Member',
      isExpired: false,
      managedByUs: false,
      rawName: ''
    };
  }

  const pm = userObj.premiumMembership || userObj.profile?.premiumMembership || {};
  const isExpired = pm.expiryDate ? new Date(pm.expiryDate) < new Date() : false;
  const isPremium = Boolean(pm.isPremium && !isExpired);
  const managedByUs = Boolean(pm.managedByUs);

  let rawName = pm.planType || userObj.profile?.membership || userObj.membership || '';
  if (typeof rawName === 'string') {
    rawName = rawName.trim();
  }

  const isVip = Boolean(
    isPremium && (
      managedByUs ||
      rawName.toLowerCase().includes('vip') ||
      rawName.toLowerCase().includes('managed')
    )
  );

  let planName = 'Free Member';
  if (isVip) {
    planName = 'VIP';
  } else if (isPremium) {
    planName = 'Premium';
  } else if (isExpired && rawName) {
    planName = `${rawName} (Expired)`;
  }

  return {
    isPremium,
    isVip,
    planName,
    isExpired,
    managedByUs,
    rawName
  };
};

/**
 * Returns color palette, gradients, and icon based on plan tier.
 * Distinct styles for VIP vs Premium as required by Feature 12.
 */
export const getPlanTheme = (isVip = false, isPremium = false, managedByUs = false) => {
  if (isVip || managedByUs) {
    return {
      gradient: 'from-amber-400 via-rose-500 to-purple-600',
      text: 'text-white',
      border: 'border-amber-300/80 ring-1 ring-amber-300/50',
      shadow: 'shadow-amber-500/25',
      icon: '👑',
      tag: 'VIP',
      ringColor: 'ring-amber-400 border-amber-400'
    };
  }

  if (isPremium) {
    return {
      gradient: 'from-[#5D34F7] via-[#502ce0] to-[#4024DB]',
      text: 'text-white',
      border: 'border-indigo-200/60 ring-1 ring-[#5D34F7]/30',
      shadow: 'shadow-[#5D34F7]/25',
      icon: '⭐',
      tag: 'PREMIUM',
      ringColor: 'ring-[#5D34F7] border-[#5D34F7]'
    };
  }

  return {
    gradient: 'from-slate-700 to-slate-900',
    text: 'text-white',
    border: 'border-slate-700',
    shadow: 'shadow-slate-900/10',
    icon: '⚡',
    tag: 'FREE',
    ringColor: 'ring-slate-300 border-slate-200'
  };
};

/**
 * PremiumPlanBadge
 *
 * Can render as:
 * - 'badge': Inline chip next to member names (e.g. "👑 VIP", "⭐ PREMIUM", "Managed by Us")
 * - 'header': Prominent user subscription pill with plan name and manage/upgrade button
 */
export default function PremiumPlanBadge({
  user,
  variant = 'badge', // 'badge' or 'header'
  size = 'sm', // 'xs', 'sm', 'md'
  isCurrentUser = false,
  onClick
}) {
  const details = getPlanDetails(user);
  const { isPremium, isVip, planName, managedByUs, rawName } = details;

  // For other members (non-current user), don't render badge if not premium
  if (!isCurrentUser && !isPremium) {
    return null;
  }

  const theme = getPlanTheme(isVip, isPremium, managedByUs);

  // Variant 1: Header / Section Subscription Pill
  if (variant === 'header') {
    if (isPremium) {
      return (
        <div
          onClick={onClick}
          className={`flex items-center gap-2.5 px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-2xl bg-gradient-to-r ${theme.gradient} text-white shadow-md ${theme.shadow} ${theme.border} cursor-pointer hover:scale-[1.02] active:scale-95 transition-all shrink-0`}
          title={`Click to manage ${rawName || planName} subscription`}
        >
          <div className="w-6 h-6 rounded-xl bg-white/20 backdrop-blur-xs flex items-center justify-center text-xs shadow-inner shrink-0">
            {theme.icon}
          </div>
          <div className="text-left">
            <span className="text-[9px] uppercase font-bold tracking-wider opacity-90 block leading-none mb-0.5">
              Current Plan
            </span>
            <div className="flex items-center gap-1.5">
              <span className="text-xs sm:text-[13px] font-black tracking-tight block leading-tight">
                {isVip ? 'VIP Member' : `${rawName || 'Premium'}`}
              </span>
              {managedByUs && (
                <span className="px-1.5 py-0.5 rounded-md bg-amber-400 text-slate-950 text-[9px] font-black uppercase">
                  Managed by Us
                </span>
              )}
            </div>
          </div>
          <span className="ml-1 px-2.5 py-0.5 rounded-lg bg-white/20 hover:bg-white/30 text-[10px] font-black transition border border-white/20">
            Manage
          </span>
        </div>
      );
    }

    // Free Member header pill
    return (
      <div
        onClick={onClick}
        className="flex items-center gap-2.5 px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-2xl bg-slate-900 text-white shadow-md border border-slate-800 cursor-pointer hover:scale-[1.02] active:scale-95 transition-all shrink-0"
        title="Click to upgrade subscription plan"
      >
        <div className="w-6 h-6 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center text-xs shrink-0">
          ⚡
        </div>
        <div className="text-left">
          <span className="text-[9px] uppercase font-bold tracking-wider text-slate-400 block leading-none mb-0.5">
            Current Plan
          </span>
          <span className="text-xs sm:text-[13px] font-black text-white block leading-tight">
            Free Member
          </span>
        </div>
        <span className="ml-1 px-2.5 py-0.5 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[10px] font-black shadow-xs">
          Upgrade
        </span>
      </div>
    );
  }

  // Variant 2: Inline Member Badge next to name
  const sizeClasses = {
    xs: 'text-[9px] px-2 py-0.5 gap-1',
    sm: 'text-[10px] px-2.5 py-0.5 gap-1',
    md: 'text-xs px-3 py-1 gap-1.5'
  };

  return (
    <div className="inline-flex items-center gap-1 flex-wrap">
      <span
        className={`inline-flex items-center ${sizeClasses[size] || sizeClasses.sm} rounded-full font-black uppercase tracking-wider bg-gradient-to-r ${theme.gradient} ${theme.text} ${theme.border} shadow-xs shrink-0 select-none`}
        title={`Active Subscription: ${isVip ? 'VIP' : 'Premium'} (${rawName || ''})`}
      >
        <span className="text-[11px] leading-none">{theme.icon}</span>
        <span className="leading-tight">{isVip ? 'VIP' : 'PREMIUM'}</span>
      </span>

      {managedByUs && (
        <span
          className="inline-flex items-center text-[9px] px-2 py-0.5 rounded-full font-black uppercase tracking-wider bg-gradient-to-r from-amber-400 to-orange-500 text-slate-950 border border-amber-300 shadow-2xs shrink-0 select-none"
          title="Personalized Matchmaking Managed by Familiess Matrimony Team"
        >
          🤝 Managed by Us
        </span>
      )}
    </div>
  );
}
