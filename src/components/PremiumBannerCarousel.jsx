import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import * as LucideIcons from 'lucide-react';
import api, { getPhotoUrl } from '../api/axios';
import couple1 from '../assets/couple1.png';
import couple2 from '../assets/couple2.png';
import heroBannerNew from '../assets/hero_banner_new.png';

/**
 * Curated high-converting premium promotion banners tailored for matrimony members.
 * Used as primary showcase and enriched with backend-configured public banners.
 */
const DEFAULT_PREMIUM_BANNERS = [
  {
    id: 'prem-banner-1',
    tag: 'PREMIUM PRIVILEGE',
    title: 'Unlock Direct Contacts & Connect Instantly',
    subtitle: 'Get direct access to verified phone numbers, WhatsApp contacts, and start unlimited direct conversations with zero limits.',
    badge: '✨ 3X More Responses',
    buttonText: 'Explore Plans Below',
    targetSection: '#plans-selection-grid',
    image: 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=1400&q=85',
    fallbackAsset: couple1,
    gradient: 'from-slate-950 via-purple-950/90 to-indigo-950/80',
    accentColor: '#F59E0B',
    accentBg: 'bg-amber-400/20 text-amber-300 border-amber-400/30'
  },
  {
    id: 'prem-banner-2',
    tag: 'VIP ASSISTED MATCHMAKING',
    title: 'Let Our Matchmaking Experts Find Your Partner',
    subtitle: 'Experience personalized matchmaking with a dedicated relationship manager, handpicked curated profiles, and priority introductions.',
    badge: '👑 Dedicated Relationship Manager',
    buttonText: 'View VIP Packages',
    targetSection: '#plans-selection-grid',
    image: 'https://images.unsplash.com/photo-1607190074257-dd4b7af0309f?auto=format&fit=crop&w=1400&q=85',
    fallbackAsset: couple2,
    gradient: 'from-slate-950 via-violet-950/95 to-slate-900',
    accentColor: '#EC4899',
    accentBg: 'bg-pink-400/20 text-pink-300 border-pink-400/30'
  },
  {
    id: 'prem-banner-3',
    tag: '100% VERIFIED & SECURE',
    title: 'Connect with Authentic, Document-Verified Profiles',
    subtitle: 'Connect with peace of mind. Control your photo privacy, horoscope visibility, and communicate only with verified genuine members.',
    badge: '🛡️ Government ID Verified',
    buttonText: 'Upgrade with Confidence',
    targetSection: '#plans-selection-grid',
    image: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1400&q=85',
    fallbackAsset: heroBannerNew,
    gradient: 'from-slate-950 via-blue-950/90 to-slate-900',
    accentColor: '#38BDF8',
    accentBg: 'bg-sky-400/20 text-sky-300 border-sky-400/30'
  }
];

export default function PremiumBannerCarousel({ onSelectPlan }) {
  const [banners, setBanners] = useState(DEFAULT_PREMIUM_BANNERS);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  const [imageErrorMap, setImageErrorMap] = useState({});
  const navigate = useNavigate();
  const autoPlayTimerRef = useRef(null);

  // Fetch dynamic banners from the backend API and harmonize with premium spotlight slides
  useEffect(() => {
    let isMounted = true;

    const fetchBanners = async () => {
      try {
        const res = await api.get('/public/banners');
        const apiData = res.data;

        if (Array.isArray(apiData) && apiData.length > 0 && isMounted) {
          const activeBackendBanners = apiData
            .filter((b) => b && b.isActive !== false)
            .sort((a, b) => (a.order || 0) - (b.order || 0))
            .map((b, idx) => ({
              id: b._id || `backend-banner-${idx}`,
              tag: `OFFICIAL SPOTLIGHT #${b.order || idx + 1}`,
              title: b.title || 'Find Your Perfect Match with Premium',
              subtitle: b.subtitle || 'Connect directly with verified matches and unlock premium features.',
              badge: '⭐ Verified & Trusted',
              buttonText: b.buttonText || 'Upgrade Today',
              linkUrl: b.linkUrl || null,
              targetSection: b.linkUrl ? null : '#plans-selection-grid',
              image: b.imageUrl ? getPhotoUrl(b.imageUrl) : (b.image ? getPhotoUrl(b.image) : couple1),
              fallbackAsset: couple1,
              gradient: idx % 2 === 0 
                ? 'from-slate-950 via-purple-950/90 to-slate-900' 
                : 'from-slate-950 via-indigo-950/90 to-slate-900',
              accentColor: idx % 2 === 0 ? '#F59E0B' : '#EC4899',
              accentBg: 'bg-amber-400/20 text-amber-300 border-amber-400/30'
            }));

          if (activeBackendBanners.length > 0) {
            // Combine backend banners with curated premium banners for a complete, rich carousel
            const merged = [...DEFAULT_PREMIUM_BANNERS, ...activeBackendBanners];
            // Deduplicate by title to ensure clean showcase
            const unique = [];
            const seen = new Set();
            for (const item of merged) {
              const key = (item.title || '').trim().toLowerCase();
              if (!seen.has(key)) {
                seen.add(key);
                unique.push(item);
              }
            }
            setBanners(unique);
          }
        }
      } catch (err) {
        console.warn('Could not fetch public banners for premium carousel, using curated banners:', err);
      }
    };

    fetchBanners();

    return () => {
      isMounted = false;
    };
  }, []);

  const totalBanners = banners.length;

  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % totalBanners);
  }, [totalBanners]);

  const goToPrev = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + totalBanners) % totalBanners);
  }, [totalBanners]);

  // Autoplay setup with pause-on-hover
  useEffect(() => {
    if (totalBanners <= 1 || isHovered) return;

    autoPlayTimerRef.current = setInterval(() => {
      goToNext();
    }, 5500);

    return () => {
      if (autoPlayTimerRef.current) {
        clearInterval(autoPlayTimerRef.current);
      }
    };
  }, [totalBanners, isHovered, goToNext]);

  // Handle Touch/Swipe on Mobile
  const handleTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe) {
      goToNext();
    } else if (isRightSwipe) {
      goToPrev();
    }
  };

  const handleBannerAction = (banner) => {
    if (banner.linkUrl) {
      if (banner.linkUrl.startsWith('http')) {
        window.open(banner.linkUrl, '_blank', 'noopener,noreferrer');
      } else {
        navigate(banner.linkUrl);
      }
      return;
    }

    // Default: smooth scroll to plans grid
    const targetElement = document.getElementById('plans-selection-grid');
    if (targetElement) {
      targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    if (typeof onSelectPlan === 'function') {
      onSelectPlan();
    }
  };

  const currentBanner = banners[currentIndex] || banners[0];
  const hasImageFailed = imageErrorMap[currentBanner.id];
  const displayImageSrc = hasImageFailed ? (currentBanner.fallbackAsset || couple1) : currentBanner.image;

  return (
    <div className="w-full relative select-none">
      {/* Main Banner Container */}
      <div
        className="w-full rounded-3xl overflow-hidden shadow-xl border border-slate-150 relative bg-slate-950 text-white min-h-[300px] sm:min-h-[340px] md:min-h-[380px] flex items-center transition-all duration-500"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Background Image with Fallback and Smooth Overlay */}
        <div className="absolute inset-0 w-full h-full overflow-hidden z-0">
          <img
            key={currentBanner.id}
            src={displayImageSrc}
            alt={currentBanner.title}
            onError={() => setImageErrorMap((prev) => ({ ...prev, [currentBanner.id]: true }))}
            className="w-full h-full object-cover object-center scale-105 animate-in fade-in zoom-in-95 duration-700"
          />
          {/* Multi-layered High Contrast Gradient Overlays for Razor Sharp Text Readability */}
          <div className={`absolute inset-0 bg-gradient-to-r ${currentBanner.gradient} opacity-92 md:opacity-88 mix-blend-multiply`} />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/70 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/80 to-transparent w-full md:w-3/4" />
        </div>

        {/* Decorative Ambient Glows */}
        <div 
          className="absolute -top-24 -left-24 w-72 h-72 rounded-full blur-3xl opacity-30 pointer-events-none"
          style={{ backgroundColor: currentBanner.accentColor }}
        />
        <div 
          className="absolute -bottom-24 -right-24 w-80 h-80 rounded-full blur-3xl opacity-20 pointer-events-none"
          style={{ backgroundColor: currentBanner.accentColor }}
        />

        {/* Content Box */}
        <div className="relative z-10 w-full px-6 sm:px-10 md:px-14 py-8 sm:py-10 max-w-3xl flex flex-col justify-center items-start space-y-4">
          {/* Tag & Value Badge */}
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border backdrop-blur-md ${currentBanner.accentBg}`}>
              {currentBanner.tag}
            </span>
            {currentBanner.badge && (
              <span className="px-3 py-1 rounded-full text-[10px] font-extrabold bg-white/10 text-white/90 border border-white/15 backdrop-blur-md flex items-center gap-1.5">
                {currentBanner.badge}
              </span>
            )}
          </div>

          {/* Banner Title */}
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-white tracking-tight leading-tight sm:leading-snug drop-shadow-md">
            {currentBanner.title}
          </h2>

          {/* Banner Subtitle */}
          <p className="text-xs sm:text-sm md:text-base text-slate-200/90 font-medium leading-relaxed max-w-2xl drop-shadow-sm">
            {currentBanner.subtitle}
          </p>

          {/* CTA & Features Row */}
          <div className="pt-2 flex items-center gap-4 flex-wrap">
            <button
              onClick={() => handleBannerAction(currentBanner)}
              className="px-6 py-3 sm:px-7 sm:py-3.5 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 font-black text-xs sm:text-sm rounded-2xl shadow-lg shadow-orange-500/25 transition-all duration-300 transform active:scale-95 flex items-center gap-2 cursor-pointer border-0"
            >
              <span>{currentBanner.buttonText || 'Explore Plans'}</span>
              <LucideIcons.ArrowRight className="w-4 h-4 stroke-[2.5]" />
            </button>

            <div className="hidden sm:flex items-center gap-3 text-white/80 text-xs font-bold pl-1">
              <span className="flex items-center gap-1">
                <LucideIcons.CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Instant Activation</span>
              </span>
              <span className="text-white/40">•</span>
              <span className="flex items-center gap-1">
                <LucideIcons.ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>100% Verified Profiles</span>
              </span>
            </div>
          </div>
        </div>

        {/* Carousel Navigation Arrows */}
        {totalBanners > 1 && (
          <>
            <button
              onClick={(e) => {
                e.stopPropagation();
                goToPrev();
              }}
              aria-label="Previous Banner"
              className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-black/40 hover:bg-black/70 text-white/90 hover:text-white border border-white/20 backdrop-blur-md flex items-center justify-center transition-all duration-200 cursor-pointer shadow-lg active:scale-90 z-20"
            >
              <LucideIcons.ChevronLeft className="w-5 h-5 stroke-[2.5]" />
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                goToNext();
              }}
              aria-label="Next Banner"
              className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-black/40 hover:bg-black/70 text-white/90 hover:text-white border border-white/20 backdrop-blur-md flex items-center justify-center transition-all duration-200 cursor-pointer shadow-lg active:scale-90 z-20"
            >
              <LucideIcons.ChevronRight className="w-5 h-5 stroke-[2.5]" />
            </button>
          </>
        )}

        {/* Carousel Indicators / Dots */}
        {totalBanners > 1 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 z-20 bg-black/50 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/10 shadow-lg">
            {banners.map((b, idx) => {
              const isActive = currentIndex === idx;
              return (
                <button
                  key={b.id || idx}
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentIndex(idx);
                  }}
                  className={`transition-all duration-300 cursor-pointer border-0 p-0 rounded-full ${
                    isActive 
                      ? 'w-7 h-2 bg-gradient-to-r from-amber-400 to-orange-500 shadow-sm' 
                      : 'w-2 h-2 bg-white/50 hover:bg-white/80'
                  }`}
                  aria-label={`Jump to banner ${idx + 1}`}
                  title={b.title}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
