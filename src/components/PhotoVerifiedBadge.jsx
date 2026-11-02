import React from 'react';
import { isPhotoVerified } from '../utils/profileHelpers';

/**
 * PhotoVerifiedBadge component
 *
 * Displays a sleek, professional badge indicating photo verification.
 * Variants:
 * - 'photo': Glassmorphism badge overlay directly on image cards
 * - 'badge': Compact pill next to user names
 * - 'large': Prominent pill for profile hero/verification summaries
 * - 'inline': Subtle inline icon with tooltip
 */
export default function PhotoVerifiedBadge({
  user,
  variant = 'photo',
  className = '',
  showTooltip = true
}) {
  if (!isPhotoVerified(user)) return null;

  if (variant === 'photo') {
    return (
      <span
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-600/90 backdrop-blur-md text-white text-[10px] font-black rounded-full shadow-md border border-white/20 select-none z-10 pointer-events-none ${className}`}
        title={showTooltip ? 'Photo Verified by Familiess Matrimony' : undefined}
      >
        <svg className="w-3 h-3 text-white fill-current shrink-0" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
        <span className="tracking-tight">Photo Verified</span>
      </span>
    );
  }

  if (variant === 'badge') {
    return (
      <span
        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-blue-50 text-blue-700 border border-blue-200/80 shadow-2xs select-none shrink-0 ${className}`}
        title={showTooltip ? 'Photo Verified Profile' : undefined}
      >
        <svg className="w-3 h-3 text-blue-600 fill-current shrink-0" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
        <span>Photo Verified</span>
      </span>
    );
  }

  if (variant === 'large') {
    return (
      <span
        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-emerald-50 text-emerald-800 border border-emerald-300 shadow-2xs select-none ${className}`}
        title={showTooltip ? 'Photo Verified by Familiess Matrimony' : undefined}
      >
        <svg className="w-3.5 h-3.5 text-emerald-600 fill-current shrink-0" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
        <span>Photo Verified</span>
      </span>
    );
  }

  // inline icon
  return (
    <span
      className={`inline-flex items-center text-blue-600 select-none shrink-0 ${className}`}
      title={showTooltip ? 'Photo Verified Profile' : undefined}
    >
      <svg className="w-3.5 h-3.5 fill-current shrink-0" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
      </svg>
    </span>
  );
}
