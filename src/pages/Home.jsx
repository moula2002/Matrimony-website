import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api, { getPhotoUrl } from '../api/axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faEdit,
  faSliders,
  faGear,
  faCircleQuestion,
  faChevronDown,
  faCheckCircle,
  faUsers,
  faFaceSmile,
  faPlus,
  faCamera,
  faGraduationCap,
  faLandmark,
  faCrown
} from '@fortawesome/free-solid-svg-icons';
import couple1 from '../assets/couple1.png';
import maleAvatar from '../assets/male_avatar.png';
import femaleAvatar from '../assets/female_avatar.png';

export default function Home() {
  const [profile, setProfile] = useState(null);
  const [banners, setBanners] = useState([]);
  const [activeBannerIndex, setActiveBannerIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const [profileRes, bannersRes] = await Promise.allSettled([
          api.get('/users/profile'),
          api.get('/public/banners')
        ]);

        if (profileRes.status === 'fulfilled') {
          setProfile(profileRes.value.data);
        }

        let fetchedBanners = [];

        const bannerResponseData = bannersRes.status === 'fulfilled' ? bannersRes.value?.data : null;

        if (Array.isArray(bannerResponseData) && bannerResponseData.length > 0) {
          fetchedBanners = bannerResponseData
            .filter((b) => b.isActive !== false)
            .sort((a, b) => (a.order || 0) - (b.order || 0))
            .map((b, idx) => ({
              id: b._id || idx,
              tag: `FEATURED #${b.order || idx + 1}`,
              title: b.title || 'Find Your Perfect Match Today',
              subtitle: b.subtitle || "Join India's most premium and trusted matrimony platform.",
              buttonText: b.buttonText || 'Get Started',
              linkUrl: b.linkUrl || '/preference-matches',
              image: b.imageUrl ? getPhotoUrl(b.imageUrl) : (b.image ? getPhotoUrl(b.image) : couple1)
            }));
        }

        // Fallback matching exact MongoDB 'test.banners' documents if API endpoint is unpopulated
        if (fetchedBanners.length === 0) {
          fetchedBanners = [
            {
              id: '6a58e01b4d3883088f09efb9',
              tag: 'FEATURED #1',
              title: 'Find Your Perfect Match Today',
              subtitle: "Join India's most premium and trusted matrimony platform.",
              buttonText: 'Get Started',
              linkUrl: '/preference-matches',
              image: 'https://images.unsplash.com/photo-1607190074257-dd4b7af0309f?auto=format&fit=crop&w=800&q=80'
            },
            {
              id: '6a58e01b4d3883088f09efba',
              tag: 'FEATURED #2',
              title: 'Handpicked and Verified Profiles',
              subtitle: 'Manual document verification protects you from spam.',
              buttonText: 'Explore Matches',
              linkUrl: '/preference-matches',
              image: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80'
            },
            {
              id: '6a58e01b4d3883088f09efbb',
              tag: 'FEATURED #3',
              title: '100% Privacy & Security Guaranteed',
              subtitle: 'Your data and photos are safe and protected with us.',
              buttonText: 'Get Started',
              linkUrl: '/preference-matches',
              image: 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=800&q=80'
            }
          ];
        }

        setBanners(fetchedBanners);
      } catch (err) {
        console.error('Error fetching home data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Auto-rotating banner carousel effect
  useEffect(() => {
    if (banners.length <= 1) return;
    const interval = setInterval(() => {
      setActiveBannerIndex((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [banners.length]);

  const p = profile?.profile || {};

  // Check if Premium Membership is active or pending
  const isPremium = Boolean(
    profile?.premiumMembership?.isPremium ||
    (p.membership && p.membership !== 'Free Member' && p.membership !== 'Free' && p.membership !== 'Standard')
  );

  // Define profile sections and evaluate completion dynamically from fetched profile data
  const sections = [
    {
      id: 'membership',
      title: 'Premium Membership',
      isCompleted: isPremium,
      iconBg: 'bg-amber-50 text-amber-500',
      iconType: 'crown',
      category: 'membership'
    },
    {
      id: 'astrology',
      title: 'Add Horoscope',
      isCompleted: Boolean(p.astrology?.timeOfBirth || p.astrology?.cityOfBirth || p.astrology?.rashi || p.astrology?.horoscope),
      iconBg: 'bg-indigo-50 text-indigo-600',
      iconType: 'horoscope',
      category: 'astrology'
    },
    {
      id: 'family',
      title: 'Family Details',
      isCompleted: Boolean(p.fatherStatus || p.motherStatus || p.familyFinancialStatus || p.familyLocation),
      iconBg: 'bg-blue-50 text-blue-500',
      iconType: 'users',
      category: 'family'
    },
    {
      id: 'hobbies',
      title: 'Add hobbies',
      isCompleted: Boolean(p.hobbies && Array.isArray(p.hobbies) && p.hobbies.length > 0),
      iconBg: 'bg-rose-50 text-rose-500',
      iconType: 'smile',
      category: 'hobbies'
    },
    {
      id: 'photos',
      title: 'Upload Photos',
      isCompleted: Boolean(p.photos && Array.isArray(p.photos) && p.photos.length > 0),
      iconBg: 'bg-purple-50 text-purple-600',
      iconType: 'camera',
      category: 'basic'
    },
    {
      id: 'education',
      title: 'Education & Career',
      isCompleted: Boolean(p.education || p.workRole || p.profession || p.income),
      iconBg: 'bg-cyan-50 text-cyan-600',
      iconType: 'education',
      category: 'education'
    },
    {
      id: 'religion',
      title: 'Religion & Caste',
      isCompleted: Boolean(p.religion && p.caste),
      iconBg: 'bg-emerald-50 text-emerald-600',
      iconType: 'religion',
      category: 'religion'
    }
  ];

  // Dynamic Profile Completeness Score calculation based on filled fields
  const coreFields = [
    Boolean(p.name),
    Boolean(p.dob),
    Boolean(p.gender),
    Boolean(p.maritalStatus),
    Boolean(p.height),
    Boolean(p.religion),
    Boolean(p.caste),
    Boolean(p.city || p.state || p.location),
    Boolean(p.education),
    Boolean(p.workRole || p.profession),
    Boolean(p.photos && p.photos.length > 0),
    Boolean(p.hobbies && p.hobbies.length > 0),
    Boolean(p.fatherStatus || p.motherStatus || p.familyFinancialStatus),
    Boolean(p.astrology?.timeOfBirth || p.astrology?.cityOfBirth),
    isPremium
  ];
  const completedCount = coreFields.filter(Boolean).length;
  const computedScore = Math.round((completedCount / coreFields.length) * 100);
  const completenessScore = p.completeness_score || profile?.completeness_score || computedScore;

  // Prioritize pending/incomplete items first so user dynamically sees pending actions
  const pendingSections = sections.filter((s) => !s.isCompleted);
  const completedSections = sections.filter((s) => s.isCompleted);
  const displayedSections = [...pendingSections, ...completedSections].slice(0, 3);

  // User avatar logic
  const defaultAvatar = p.gender === 'Female' ? femaleAvatar : maleAvatar;
  const userPhoto = p.photos && p.photos[0] ? getPhotoUrl(p.photos[0]) : defaultAvatar;

  // Display User ID & Name
  const displayId = p.uid || profile?.uid || p.custom_id || (p._id ? p._id.substring(p._id.length - 8).toUpperCase() : (profile?._id ? profile._id.substring(profile._id.length - 8).toUpperCase() : 'USERID'));
  const displayName = p.name ? `${p.name},` : (profile?.email ? `${profile.email.split('@')[0]},` : 'Member,');

  const handleActionClick = (category) => {
    if (category === 'membership') {
      navigate('/plans');
    } else if (!p.is_onboarding_complete && p.signupStep) {
      navigate('/signup');
    } else {
      navigate('/profile', { state: { edit: true, category } });
    }
  };

  return (
    <div className="bg-[#4d25d0] min-h-screen p-4 sm:p-6 lg:p-8 font-sans">
      <div className="max-w-[1400px] mx-auto flex flex-col lg:flex-row gap-6">
        
        {/* LEFT COLUMN: Sidebar Profile & Navigation Cards */}
        <div className="w-full lg:w-[310px] xl:w-[340px] shrink-0 space-y-6">
          
          {/* Card 1: User Profile Card */}
          <div className="bg-white rounded-[28px] p-6 text-center shadow-xl border border-white/20 relative overflow-hidden">
            {loading ? (
              <div className="animate-pulse space-y-4 py-4">
                <div className="w-28 h-28 mx-auto rounded-full bg-slate-200" />
                <div className="h-6 bg-slate-200 rounded w-1/2 mx-auto" />
                <div className="h-4 bg-slate-200 rounded w-1/3 mx-auto" />
              </div>
            ) : (
              <>
                {/* User Avatar */}
                <div className="w-28 h-28 mx-auto rounded-full p-1 border-4 border-[#e0dbfa] shadow-md bg-white flex items-center justify-center overflow-hidden mb-4 relative">
                  <img
                    src={userPhoto}
                    alt="Profile"
                    className="w-full h-full object-cover rounded-full"
                  />
                </div>

                {/* Name */}
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  {displayName}
                </h2>

                {/* Subtitle */}
                <p className="text-[#5227d8] font-bold text-sm mt-0.5">
                  Familiess Matrimony
                </p>

                {/* ID */}
                <p className="text-slate-400 text-xs font-semibold mt-1">
                  ID: {displayId}
                </p>

                {/* Membership Badge Pill */}
                <div className="mt-4 flex flex-col items-center gap-2">
                  <button
                    onClick={() => navigate('/plans')}
                    className={`px-4 py-2 rounded-full font-extrabold text-xs inline-flex items-center gap-1.5 transition cursor-pointer shadow-2xs border ${
                      isPremium
                        ? 'bg-[#f0f2f7] hover:bg-[#e4e8f2] text-slate-700 border-slate-200'
                        : 'bg-amber-50 hover:bg-amber-100 text-amber-700 border-amber-200'
                    }`}
                  >
                    <FontAwesomeIcon icon={faCrown} className={isPremium ? 'text-amber-500' : 'text-amber-600'} />
                    <span>
                      {isPremium
                        ? `${profile?.premiumMembership?.planType || p.membership || 'Gold Plan'} Member`
                        : 'Membership: Pending'}
                    </span>
                  </button>

                  {profile?.isFeatured && (
                    <span className="px-4 py-1.5 rounded-full font-extrabold text-[10px] inline-flex items-center gap-1.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-sm border border-amber-600">
                      ⭐ Featured Profile
                    </span>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Card 2: Sidebar Links Menu */}
          <div className="bg-white rounded-[28px] p-6 shadow-xl border border-white/20 space-y-4">
            
            {/* Edit Profile */}
            <div
              onClick={() => navigate('/profile')}
              className="flex items-center gap-3.5 px-3 py-2.5 rounded-xl hover:bg-slate-50 cursor-pointer text-slate-600 hover:text-[#5227d8] font-semibold text-sm transition"
            >
              <FontAwesomeIcon icon={faEdit} className="w-4 h-4 text-slate-400" />
              <span>Edit profile</span>
            </div>

            {/* Edit Preferences */}
            <div
              onClick={() => navigate('/profile', { state: { tab: 'preferences' } })}
              className="flex items-center gap-3.5 px-3 py-2.5 rounded-xl hover:bg-slate-50 cursor-pointer text-slate-600 hover:text-[#5227d8] font-semibold text-sm transition"
            >
              <FontAwesomeIcon icon={faSliders} className="w-4 h-4 text-slate-400" />
              <span>Edit preferences</span>
            </div>

            {/* SUPPORT & FEEDBACK Header */}
            <div className="pt-2 pb-1 px-3">
              <p className="text-slate-400 text-[11px] font-extrabold tracking-wider uppercase">
                SUPPORT & FEEDBACK
              </p>
            </div>

            {/* Settings */}
            <div
              onClick={() => navigate('/settings')}
              className="flex items-center gap-3.5 px-3 py-2.5 rounded-xl hover:bg-slate-50 cursor-pointer text-slate-600 hover:text-[#5227d8] font-semibold text-sm transition"
            >
              <FontAwesomeIcon icon={faGear} className="w-4 h-4 text-slate-400" />
              <span>Settings</span>
            </div>

            {/* Help */}
            <div
              onClick={() => navigate('/help')}
              className="flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-slate-50 cursor-pointer text-slate-600 hover:text-[#5227d8] font-semibold text-sm transition"
            >
              <div className="flex items-center gap-3.5">
                <FontAwesomeIcon icon={faCircleQuestion} className="w-4 h-4 text-slate-400" />
                <span>Help</span>
              </div>
              <FontAwesomeIcon icon={faChevronDown} className="w-3.5 h-3.5 text-slate-400" />
            </div>

          </div>

        </div>

        {/* RIGHT COLUMN: Main Content & Footer */}
        <div className="flex-1 min-w-0 space-y-6">
          
          {/* Card 1: Complete Your Profile */}
          <div className="bg-white rounded-[28px] p-6 sm:p-8 shadow-xl border border-white/20">
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">
              Complete Your Profile
            </h2>
            
            {/* Dynamic Progress Score Bar */}
            <div className="flex flex-wrap items-center gap-3 mt-2 mb-6">
              <span className="text-slate-500 font-semibold text-xs sm:text-sm">
                Profile completeness score
              </span>
              <div className="w-36 sm:w-56 h-3 bg-slate-100 rounded-full overflow-hidden relative">
                <div
                  className="h-full bg-gradient-to-r from-orange-500 to-amber-500 rounded-full transition-all duration-500"
                  style={{ width: `${completenessScore}%` }}
                />
              </div>
              <span className="text-orange-500 font-black text-xs sm:text-sm">
                {completenessScore}%
              </span>
            </div>

            {/* Dynamic Action Sub-Cards */}
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[1, 2, 3].map((n) => (
                  <div key={n} className="bg-[#f8f9fd] rounded-2xl p-4 animate-pulse flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-200" />
                    <div className="space-y-2 flex-1">
                      <div className="h-4 bg-slate-200 rounded w-3/4" />
                      <div className="h-3 bg-slate-200 rounded w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {displayedSections.map((sec) => (
                  <div
                    key={sec.id}
                    className="bg-[#f8f9fd] hover:bg-[#f0f3fa] rounded-2xl p-4 border border-slate-100 flex items-center gap-3.5 transition"
                  >
                    <div className={`w-10 h-10 rounded-full ${sec.iconBg} flex items-center justify-center shrink-0`}>
                      {sec.iconType === 'crown' && <FontAwesomeIcon icon={faCrown} className="w-4 h-4 text-amber-500" />}
                      {sec.iconType === 'horoscope' && (
                        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                        </svg>
                      )}
                      {sec.iconType === 'users' && <FontAwesomeIcon icon={faUsers} className="w-4 h-4" />}
                      {sec.iconType === 'smile' && <FontAwesomeIcon icon={faFaceSmile} className="w-4 h-4" />}
                      {sec.iconType === 'camera' && <FontAwesomeIcon icon={faCamera} className="w-4 h-4" />}
                      {sec.iconType === 'education' && <FontAwesomeIcon icon={faGraduationCap} className="w-4 h-4" />}
                      {sec.iconType === 'religion' && <FontAwesomeIcon icon={faLandmark} className="w-4 h-4" />}
                    </div>
                    <div>
                      <p className="font-extrabold text-slate-800 text-xs sm:text-sm">
                        {sec.title}
                      </p>
                      {sec.isCompleted ? (
                        <span className="text-emerald-600 font-bold text-xs flex items-center gap-1 mt-0.5">
                          <FontAwesomeIcon icon={faCheckCircle} className="w-3 h-3 text-emerald-500" />
                          Completed
                        </span>
                      ) : (
                        <span
                          onClick={() => handleActionClick(sec.category)}
                          className="text-emerald-500 font-bold text-xs flex items-center gap-1 mt-0.5 cursor-pointer hover:underline"
                        >
                          <FontAwesomeIcon icon={faPlus} className="w-2.5 h-2.5" />
                          {sec.id === 'membership' ? 'Upgrade Plan' : 'Add details'}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Card 2: Dynamic Featured Banner Card */}
          {loading ? (
            <div className="bg-slate-200/60 rounded-[28px] animate-pulse h-60 sm:h-80 md:h-96 w-full flex items-center justify-center shadow-xl">
              <div className="h-8 bg-white/40 rounded w-1/3" />
            </div>
          ) : banners.length > 0 && (() => {
            const currentBanner = banners[activeBannerIndex] || banners[0];
            return (
              <div className="rounded-[28px] shadow-xl relative overflow-hidden group transition-all duration-500 w-full bg-white border border-white/20">
                {/* Full Size Banner Image */}
                <div
                  className={`w-full relative overflow-hidden ${currentBanner.linkUrl ? 'cursor-pointer' : ''}`}
                  onClick={() => {
                    if (currentBanner.linkUrl) {
                      if (currentBanner.linkUrl.startsWith('http')) {
                        window.open(currentBanner.linkUrl, '_blank', 'noopener,noreferrer');
                      } else {
                        navigate(currentBanner.linkUrl);
                      }
                    }
                  }}
                >
                  <img
                    src={currentBanner.image}
                    alt={currentBanner.title || 'Featured Banner'}
                    className="w-full h-auto min-h-[220px] max-h-[500px] object-cover rounded-[28px] transition-transform duration-500 group-hover:scale-[1.01]"
                  />
                </div>

                {/* Carousel Dots */}
                {banners.length > 1 && (
                  <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex items-center gap-2 z-20 bg-black/40 backdrop-blur-xs px-3.5 py-1.5 rounded-full shadow-md">
                    {banners.map((b, idx) => (
                      <button
                        key={b.id || idx}
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveBannerIndex(idx);
                        }}
                        className={`transition-all duration-300 cursor-pointer border-0 p-0 ${
                          activeBannerIndex === idx
                            ? 'w-7 h-2 rounded-full bg-[#ff4500] shadow-sm'
                            : 'w-2 h-2 rounded-full bg-white/70 hover:bg-white'
                        }`}
                        title={`Banner ${idx + 1}`}
                      />
                    ))}
                  </div>
                )}
              </div>
            );
          })()}

          {/* Card 3: Footer Box */}
          <div className="bg-white rounded-[28px] p-6 sm:p-10 shadow-xl border border-slate-100">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 pb-8 border-b border-slate-100">
              
              {/* Column 1: About Us */}
              <div>
                <h3 className="font-extrabold text-slate-900 text-base mb-3">
                  About Us
                </h3>
                <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
                  FamiliessMatrimony.com is one of the pioneers of online matrimony service, bringing together millions of happy marriages securely.
                </p>
              </div>

              {/* Column 2: Help & Support */}
              <div>
                <h3 className="font-extrabold text-slate-900 text-base mb-3">
                  Help & Support
                </h3>
                <ul className="space-y-2 text-xs sm:text-sm font-semibold text-slate-500">
                  <li onClick={() => navigate('/help')} className="hover:text-[#5227d8] cursor-pointer transition">
                    24x7 Live help
                  </li>
                  <li onClick={() => navigate('/contact-us')} className="hover:text-[#5227d8] cursor-pointer transition">
                    Contact us
                  </li>
                  <li onClick={() => navigate('/contact-us')} className="hover:text-[#5227d8] cursor-pointer transition">
                    Feedback
                  </li>
                  <li onClick={() => navigate('/help')} className="hover:text-[#5227d8] cursor-pointer transition">
                    FAQs
                  </li>
                </ul>
              </div>

              {/* Column 3: Information */}
              <div>
                <h3 className="font-extrabold text-slate-900 text-base mb-3">
                  Information
                </h3>
                <ul className="space-y-2 text-xs sm:text-sm font-semibold text-slate-500">
                  <li onClick={() => navigate('/about')} className="hover:text-[#5227d8] cursor-pointer transition">
                    About Us
                  </li>
                  <li onClick={() => navigate('/success-stories')} className="hover:text-[#5227d8] cursor-pointer transition">
                    Awards
                  </li>
                  <li onClick={() => navigate('/success-stories')} className="hover:text-[#5227d8] cursor-pointer transition">
                    Milestones
                  </li>
                  <li onClick={() => navigate('/privacy-policy')} className="hover:text-[#5227d8] cursor-pointer transition">
                    Privacy Policy
                  </li>
                </ul>
              </div>

              {/* Column 4: Related Services */}
              <div>
                <h3 className="font-extrabold text-slate-900 text-base mb-3">
                  Related Services
                </h3>
                <ul className="space-y-2 text-xs sm:text-sm font-semibold text-slate-500">
                  <li onClick={() => navigate('/preference-matches')} className="hover:text-[#5227d8] cursor-pointer transition">
                    Safe Matrimony
                  </li>
                  <li onClick={() => navigate('/search')} className="hover:text-[#5227d8] cursor-pointer transition">
                    Matrimonial Tools
                  </li>
                  <li onClick={() => navigate('/preference-matches')} className="hover:text-[#5227d8] cursor-pointer transition">
                    Hindi Matrimonials
                  </li>
                  <li onClick={() => navigate('/preference-matches')} className="hover:text-[#5227d8] cursor-pointer transition">
                    Marriage Halls
                  </li>
                </ul>
              </div>

            </div>

            {/* Copyright Bottom Bar */}
            <div className="pt-6 flex flex-col sm:flex-row justify-between items-center text-xs text-slate-400 font-medium gap-4">
              <p>© 2026 Familiess Matrimony. All Rights Reserved.</p>
              <div className="flex items-center gap-6">
                <span onClick={() => navigate('/terms-conditions')} className="hover:text-slate-600 cursor-pointer transition">
                  Terms & Conditions
                </span>
                <span onClick={() => navigate('/privacy-policy')} className="hover:text-slate-600 cursor-pointer transition">
                  Privacy Policy
                </span>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
