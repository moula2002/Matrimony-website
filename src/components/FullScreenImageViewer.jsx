import React, { useEffect, useState, useCallback } from 'react';
import { getPhotoUrl, getDefaultAvatar, handleImageError } from '../api/axios';
import { recordProfileView } from '../utils/viewManager';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faTimes,
  faChevronLeft,
  faChevronRight,
  faUser
} from '@fortawesome/free-solid-svg-icons';

export default function FullScreenImageViewer({
  isOpen,
  onClose,
  images = [],
  initialIndex = 0,
  userName = 'Member',
  gender = 'Male',
  targetUserId = null,
  currentUserId = null,
  isVerified = false,
  user = null
}) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [hasImageFailed, setHasImageFailed] = useState(false);

  useEffect(() => {
    setCurrentIndex(initialIndex);
    setHasImageFailed(false);
  }, [initialIndex, isOpen]);

  // Lock body scroll when lightbox is open
  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpen]);

  const handlePrev = useCallback((e) => {
    if (e) e.stopPropagation();
    if (!images || images.length <= 1) return;
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  }, [images]);

  const handleNext = useCallback((e) => {
    if (e) e.stopPropagation();
    if (!images || images.length <= 1) return;
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  }, [images]);

  // Keyboard navigation: Escape to close, Left/Right arrows to navigate
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowLeft') {
        handlePrev();
      } else if (e.key === 'ArrowRight') {
        handleNext();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, handlePrev, handleNext]);

  if (!isOpen) return null;

  const validImages = Array.isArray(images) && images.length > 0 ? images : [];
  const currentPhoto = validImages[currentIndex] || null;
  const totalPhotos = validImages.length;
  const isTargetVerified = Boolean(
    isVerified ||
    (user && (user.verificationStatus === 'approved' || user.isVerified))
  );

  return (
    <div
      className="fixed inset-0 z-[100] bg-black/92 backdrop-blur-md flex flex-col justify-between p-4 sm:p-6 animate-in fade-in duration-200 select-none"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      {/* Top Header Bar */}
      <div
        className="w-full flex items-center justify-between text-white z-50 pointer-events-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-sm font-bold border border-white/20">
            <FontAwesomeIcon icon={faUser} className="text-white/80" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-extrabold text-sm sm:text-base tracking-tight text-white drop-shadow-sm">
                {userName}
              </h3>
              {isTargetVerified && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-600/90 text-white text-[10px] font-black rounded-full shadow-md border border-white/20">
                  <svg className="w-2.5 h-2.5 text-white fill-current shrink-0" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Photo Verified</span>
                </span>
              )}
            </div>
            {totalPhotos > 1 && (
              <p className="text-xs text-white/70 font-semibold">
                Photo {currentIndex + 1} of {totalPhotos}
              </p>
            )}
          </div>
        </div>

        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="w-10 h-10 rounded-full bg-white/15 hover:bg-white/25 active:scale-95 text-white flex items-center justify-center transition-all cursor-pointer border border-white/20 shadow-lg"
          title="Close Full Screen (Esc)"
          aria-label="Close image viewer"
        >
          <FontAwesomeIcon icon={faTimes} className="text-base" />
        </button>
      </div>

      {/* Main Image Display Area */}
      <div
        className="flex-1 flex items-center justify-center relative w-full my-2 overflow-hidden"
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            onClose();
          }
        }}
      >
        {/* Previous Button */}
        {totalPhotos > 1 && (
          <button
            type="button"
            onClick={handlePrev}
            className="absolute left-2 sm:left-6 z-40 w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-black/50 hover:bg-black/80 text-white flex items-center justify-center transition border border-white/20 backdrop-blur-sm cursor-pointer active:scale-90"
            title="Previous Photo"
            aria-label="Previous photo"
          >
            <FontAwesomeIcon icon={faChevronLeft} className="text-sm sm:text-base" />
          </button>
        )}

        {/* Image Container */}
        <div
          className="relative max-h-[82vh] max-w-[92vw] flex items-center justify-center"
          onClick={(e) => e.stopPropagation()}
        >
          {currentPhoto ? (
            <img
              key={`fs-photo-${targetUserId || 'img'}-${currentIndex}-${typeof currentPhoto === 'string' ? currentPhoto : currentPhoto?.url || ''}`}
              src={getPhotoUrl(currentPhoto, gender)}
              alt={userName}
              onLoad={() => {
                if (!hasImageFailed && currentPhoto && targetUserId) {
                  recordProfileView(targetUserId, currentUserId);
                }
              }}
              onError={(e) => {
                setHasImageFailed(true);
                handleImageError(e, gender);
              }}
              className="max-h-[82vh] max-w-[92vw] w-auto h-auto object-contain rounded-2xl shadow-2xl transition duration-300"
            />
          ) : (
            <img
              src={getDefaultAvatar(gender)}
              alt={userName}
              className="max-h-[70vh] max-w-[80vw] w-auto h-auto object-contain rounded-2xl shadow-2xl opacity-90 p-8"
            />
          )}
        </div>

        {/* Next Button */}
        {totalPhotos > 1 && (
          <button
            type="button"
            onClick={handleNext}
            className="absolute right-2 sm:right-6 z-40 w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-black/50 hover:bg-black/80 text-white flex items-center justify-center transition border border-white/20 backdrop-blur-sm cursor-pointer active:scale-90"
            title="Next Photo"
            aria-label="Next photo"
          >
            <FontAwesomeIcon icon={faChevronRight} className="text-sm sm:text-base" />
          </button>
        )}
      </div>

      {/* Bottom Thumbnails Strip (if multiple photos) */}
      {totalPhotos > 1 && (
        <div
          className="w-full flex justify-center items-center py-2 z-50 pointer-events-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex gap-2 overflow-x-auto max-w-full p-1.5 bg-black/40 backdrop-blur-md rounded-2xl border border-white/10 custom-scrollbar">
            {validImages.map((img, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setCurrentIndex(idx)}
                className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl overflow-hidden border-2 transition-all cursor-pointer shrink-0 ${
                  currentIndex === idx
                    ? 'border-[#5D34F7] scale-105 shadow-md ring-2 ring-[#5D34F7]/50'
                    : 'border-transparent opacity-60 hover:opacity-100'
                }`}
                title={`Photo ${idx + 1}`}
              >
                <img
                  src={getPhotoUrl(img, gender)}
                  alt=""
                  onError={(e) => handleImageError(e, gender)}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
