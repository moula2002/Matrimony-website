import { useState, useEffect, useRef, useCallback } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faHome, faUsers, faHeart, faComment, faSearch, faBell,
  faChevronDown, faUser, faExchangeAlt, faBars, faTimes, faCrown,
  faSignOutAlt
} from '@fortawesome/free-solid-svg-icons';
import api, { getPhotoUrl } from '../api/axios';
import navbarLogo from '../assets/navbar_logo.png';
import navbarName from '../assets/navbar_name.png';
import backgroundBg from '../assets/background.png';
import maleAvatar from '../assets/male_avatar.png';
import femaleAvatar from '../assets/female_avatar.png';

// Custom Premium Colorful SVG Icons for Navigation
const navIcons = {
  '/home': () => (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M3 10L12 3L21 10V20C21 20.5523 20.5523 21 20 21H14V14H10V21H4C3.44772 21 3 20.5523 3 20V10Z" fill="url(#home_grad)" />
      <defs>
        <linearGradient id="home_grad" x1="12" y1="3" x2="12" y2="21" gradientUnits="userSpaceOnUse">
          <stop stopColor="#5D34F7" />
          <stop offset="1" stopColor="#4024DB" />
        </linearGradient>
      </defs>
    </svg>
  ),
  '/preference-matches': () => (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" fill="url(#pref_grad)" />
      <defs>
        <linearGradient id="pref_grad" x1="12" y1="2" x2="12" y2="21" gradientUnits="userSpaceOnUse">
          <stop stopColor="#EC4899" />
          <stop offset="1" stopColor="#8B5CF6" />
        </linearGradient>
      </defs>
    </svg>
  ),
  '/matches': () => (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="8" cy="8" r="4" fill="url(#match_grad1)" />
      <circle cx="16" cy="8" r="4" fill="url(#match_grad2)" />
      <path d="M2 20C2 16 5 13 8 13C9.5 13 11 13.8 12 15C13 13.8 14.5 13 16 13C19 13 22 16 22 20" stroke="url(#match_stroke)" strokeWidth="2.5" strokeLinecap="round" />
      <defs>
        <linearGradient id="match_grad1" x1="8" y1="4" x2="8" y2="12" gradientUnits="userSpaceOnUse">
          <stop stopColor="#F72585" />
          <stop offset="1" stopColor="#7209B7" />
        </linearGradient>
        <linearGradient id="match_grad2" x1="16" y1="4" x2="16" y2="12" gradientUnits="userSpaceOnUse">
          <stop stopColor="#3F37C9" />
          <stop offset="1" stopColor="#4CC9F0" />
        </linearGradient>
        <linearGradient id="match_stroke" x1="12" y1="13" x2="12" y2="20" gradientUnits="userSpaceOnUse">
          <stop stopColor="#7209B7" />
          <stop offset="1" stopColor="#3F37C9" />
        </linearGradient>
      </defs>
    </svg>
  ),
  '/interests': () => (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 21.35L10.55 20.03C5.4 15.36 2 12.27 2 8.5C2 5.41 4.42 3 7.5 3C9.24 3 10.91 3.81 12 5.08C13.09 3.81 14.76 3 16.5 3C19.58 3 22 5.41 22 8.5C22 12.27 18.6 15.36 13.45 20.03L12 21.35Z" fill="url(#heart_grad)" />
      <defs>
        <linearGradient id="heart_grad" x1="12" y1="3" x2="12" y2="21.35" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FF477E" />
          <stop offset="1" stopColor="#FF85A2" />
        </linearGradient>
      </defs>
    </svg>
  ),
  '/feeds': () => (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M4 6H20V8H4V6ZM4 11H20V13H4V11ZM4 16H20V18H4V16Z" fill="url(#feeds_grad)" />
      <defs>
        <linearGradient id="feeds_grad" x1="12" y1="6" x2="12" y2="18" gradientUnits="userSpaceOnUse">
          <stop stopColor="#3F37C9" />
          <stop offset="1" stopColor="#4CC9F0" />
        </linearGradient>
      </defs>
    </svg>
  ),
  '/messages': () => (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M20 2H4C2.9 2 2 2.9 2 4V22L6 18H20C21.1 18 22 17.1 22 16V4C22 2.9 21.1 2 20 2Z" fill="url(#msg_grad)" />
      <defs>
        <linearGradient id="msg_grad" x1="12" y1="2" x2="12" y2="22" gradientUnits="userSpaceOnUse">
          <stop stopColor="#4895EF" />
          <stop offset="1" stopColor="#4CC9F0" />
        </linearGradient>
      </defs>
    </svg>
  ),
  '/search': () => (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="11" cy="11" r="8" stroke="url(#search_grad)" strokeWidth="3" />
      <line x1="16.5" y1="16.5" x2="22" y2="22" stroke="url(#search_grad)" strokeWidth="3" strokeLinecap="round" />
      <defs>
        <linearGradient id="search_grad" x1="11" y1="3" x2="22" y2="22" gradientUnits="userSpaceOnUse">
          <stop stopColor="#F9C74F" />
          <stop offset="1" stopColor="#F3722C" />
        </linearGradient>
      </defs>
    </svg>
  ),
  '/notifications': () => (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 22C13.1 22 14 21.1 14 20H10C10 21.1 10.9 22 12 22ZM18 16V11C18 7.93 16.36 5.36 13.5 4.68V4C13.5 3.17 12.83 2.5 12 2.5C11.17 2.5 10.5 3.17 10.5 4V4.68C7.63 5.36 6 7.92 6 11V16L4 18V19H20V18L18 16Z" fill="url(#bell_grad)" />
      <defs>
        <linearGradient id="bell_grad" x1="12" y1="2.5" x2="12" y2="22" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FF9F1C" />
          <stop offset="1" stopColor="#FF6B6B" />
        </linearGradient>
      </defs>
    </svg>
  ),
  '/plans': () => (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M5 16L3 5L8.5 10L12 4L15.5 10L21 5L19 16H5ZM19 19C19 19.5523 18.5523 20 18 20H6C5.44772 20 5 19.5523 5 19V17H19V19Z" fill="url(#crown_nav_grad)" />
      <defs>
        <linearGradient id="crown_nav_grad" x1="12" y1="4" x2="12" y2="20" gradientUnits="userSpaceOnUse">
          <stop stopColor="#F59E0B" />
          <stop offset="1" stopColor="#D97706" />
        </linearGradient>
      </defs>
    </svg>
  ),
  '/profile': () => (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="7" r="4" fill="url(#profile_nav_grad)" />
      <path d="M4 21C4 17 7.5 14 12 14C16.5 14 20 17 20 21" stroke="url(#profile_nav_stroke)" strokeWidth="2.5" strokeLinecap="round" />
      <defs>
        <linearGradient id="profile_nav_grad" x1="12" y1="3" x2="12" y2="11" gradientUnits="userSpaceOnUse">
          <stop stopColor="#8B5CF6" />
          <stop offset="1" stopColor="#6D28D9" />
        </linearGradient>
        <linearGradient id="profile_nav_stroke" x1="4" y1="14" x2="20" y2="21" gradientUnits="userSpaceOnUse">
          <stop stopColor="#8B5CF6" />
          <stop offset="1" stopColor="#6D28D9" />
        </linearGradient>
      </defs>
    </svg>
  ),
  '/settings': () => (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z" stroke="url(#settings_nav_grad)" strokeWidth="2.5" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" stroke="url(#settings_nav_grad)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <defs>
        <linearGradient id="settings_nav_grad" x1="12" y1="1" x2="12" y2="23" gradientUnits="userSpaceOnUse">
          <stop stopColor="#64748B" />
          <stop offset="1" stopColor="#475569" />
        </linearGradient>
      </defs>
    </svg>
  ),
  '/help': () => (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="10" stroke="url(#help_nav_grad)" strokeWidth="2" />
      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" stroke="url(#help_nav_grad)" strokeWidth="2" strokeLinecap="round" />
      <circle cx="12" cy="17" r="1" fill="#0EA5E9" />
      <defs>
        <linearGradient id="help_nav_grad" x1="12" y1="2" x2="12" y2="22" gradientUnits="userSpaceOnUse">
          <stop stopColor="#0EA5E9" />
          <stop offset="1" stopColor="#0284C7" />
        </linearGradient>
      </defs>
    </svg>
  )
};

export default function MainLayout() {
  const [profile, setProfile] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notificationsCount, setNotificationsCount] = useState(0);
  const [notificationsData, setNotificationsData] = useState({ interests: [], messages: [] });
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const notifDropdownRef = useRef(null);

  const navigate = useNavigate();
  const location = useLocation();

  const fetchProfile = useCallback(async () => {
    try {
      const response = await api.get('/users/profile');
      setProfile(response.data);
    } catch (err) {
      console.error('Error fetching user profile for layout:', err);
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    fetchProfile();
  }, [navigate, fetchProfile]);

  // Refresh profile data when navigating back or when window receives focus
  useEffect(() => {
    fetchProfile();
  }, [location.pathname, fetchProfile]);

  useEffect(() => {
    const handleFocus = () => {
      fetchProfile();
    };
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [fetchProfile]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    const fetchNotifications = async () => {
      try {
        const response = await api.get('/users/notifications');
        const data = response.data || { interests: [], messages: [], views: [] };
        setNotificationsData(data);
        const total = (data.interests?.length || 0) + (data.messages?.length || 0) + (data.views?.length || 0);
        setNotificationsCount(total);
      } catch (err) {
        console.error('Error fetching notifications for layout:', err);
      }
    };

    fetchNotifications();
    const interval = setInterval(fetchNotifications, 15000);
    return () => clearInterval(interval);
  }, [location.pathname]);

  // Click outside to close notification dropdown
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifDropdownRef.current && !notifDropdownRef.current.contains(e.target)) {
        setShowNotifDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const p = profile?.profile || profile || {};
  const premium = profile?.premiumMembership || profile?.profile?.premiumMembership || {};
  const isExpired = premium?.expiryDate ? new Date(premium.expiryDate) < new Date() : false;
  const isPremium = Boolean(premium?.isPremium && !isExpired);

  // Exact plan name from backend (e.g. "Gold Plan", "Diamond Plan", "Silver Plan", "Basic Plan", etc.)
  const rawPlanType = premium?.planType || p.membership || (isPremium ? 'Premium Member' : null);
  const planName = isPremium
    ? (rawPlanType || 'Premium Member')
    : (isExpired && rawPlanType ? `${rawPlanType} (Expired)` : 'Free Member');

  const defaultAvatar = p.gender === 'Female' ? femaleAvatar : maleAvatar;
  const userPhoto = p.photos && p.photos[0] ? getPhotoUrl(p.photos[0]) : defaultAvatar;
  const displayId = p.uid || profile?.uid || p.custom_id || (p._id ? p._id.substring(p._id.length - 8).toUpperCase() : (profile?._id ? profile._id.substring(profile._id.length - 8).toUpperCase() : 'USERID'));
  const displayName = p.name ? p.name : (profile?.email ? profile.email.split('@')[0] : 'Member');

  const isFeedPage = location.pathname === '/preference-matches' || location.pathname === '/home';

  const handleLogout = () => {
    localStorage.removeItem('token');
    setSidebarOpen(false);
    navigate('/login');
  };

  return (
    <div
      className={`min-h-screen flex flex-col font-sans ${location.pathname === '/home' ? 'bg-[#4d25d0]' : 'bg-cover bg-center bg-no-repeat bg-fixed'}`}
      style={location.pathname === '/home' ? { backgroundColor: '#4d25d0' } : { backgroundImage: `url(${backgroundBg})` }}
    >
      {/* Sidebar Drawer */}
      <div className={`fixed inset-0 z-[100] transition-all duration-300 ${sidebarOpen ? 'visible opacity-100' : 'invisible opacity-0'}`}>
        {/* Backdrop overlay */}
        <div
          className="absolute inset-0 bg-slate-950/45 backdrop-blur-xs transition-opacity duration-300"
          onClick={() => setSidebarOpen(false)}
        />

        {/* Drawer Panel */}
        <div className={`absolute top-0 left-0 w-80 max-w-[85vw] h-full bg-white shadow-2xl flex flex-col transition-transform duration-300 ease-out transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          {/* Drawer Header */}
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => { navigate('/preference-matches'); setSidebarOpen(false); }}>
              <img src={navbarLogo} alt="Familiess Matrimony Logo" className="w-6 h-6 object-contain" style={{ filter: 'brightness(0) saturate(100%)' }} />
              <img src={navbarName} alt="Familiess Matrimony" className="h-6 object-contain" style={{ filter: 'brightness(0) saturate(100%)' }} />
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="w-8 h-8 rounded-full flex items-center justify-center bg-slate-50 hover:bg-rose-50 text-slate-400 hover:text-rose-500 transition cursor-pointer border border-slate-100"
              title="Close Menu"
            >
              <FontAwesomeIcon icon={faTimes} />
            </button>
          </div>

          {/* User Profile & Plan Card inside Hamburger Drawer */}
          <div className="p-4 mx-4 my-3 rounded-2xl bg-gradient-to-br from-indigo-50/70 via-white to-purple-50/40 border border-indigo-100/80 shadow-xs">
            <div 
              className="flex items-center gap-3 cursor-pointer"
              onClick={() => { navigate('/profile'); setSidebarOpen(false); }}
              title="View Profile"
            >
              <div className="w-12 h-12 rounded-full overflow-hidden bg-[#5D34F7]/10 border-2 border-[#5D34F7]/25 shrink-0 flex items-center justify-center">
                {userPhoto ? (
                  <img src={userPhoto} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-[#5D34F7] font-black text-base">{displayName[0]}</span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-black text-slate-900 text-sm truncate leading-tight hover:text-[#5D34F7] transition">
                  {displayName}
                </h3>
                <p className="text-[11px] text-slate-500 font-semibold truncate mt-0.5">
                  ID: {displayId}
                </p>
              </div>
            </div>

            {/* Current Plan Badge Pill */}
            <div className="mt-3 pt-3 border-t border-indigo-100/60 flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 min-w-0">
                <FontAwesomeIcon icon={faCrown} className={`text-xs shrink-0 ${isPremium ? 'text-amber-500' : 'text-slate-400'}`} />
                <span className="text-xs font-black text-slate-800 truncate" title={planName}>
                  {planName}
                </span>
              </div>
              <button
                onClick={() => { navigate('/plans'); setSidebarOpen(false); }}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider transition cursor-pointer border ${
                  isPremium
                    ? 'bg-amber-50 hover:bg-amber-100 text-amber-700 border-amber-200'
                    : 'bg-[#5D34F7] hover:bg-[#4024DB] text-white border-transparent shadow-xs'
                }`}
              >
                {isPremium ? 'Manage' : 'Upgrade'}
              </button>
            </div>
            {profile?.isFeatured && (
              <div className="mt-2 text-center">
                <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-xs">
                  ⭐ Featured Profile
                </span>
              </div>
            )}
          </div>

          {/* Drawer Links */}
          <nav className="flex-1 px-4 py-1 space-y-1 overflow-y-auto custom-scrollbar">
            <div className="px-3 pb-1 pt-1">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Navigation</span>
            </div>
            <SidebarLink to="/home" label="Home" onClick={() => setSidebarOpen(false)} />
            <SidebarLink to="/preference-matches" label="Preference Matches" onClick={() => setSidebarOpen(false)} />
            <SidebarLink to="/matches" label="Mutual Matches" onClick={() => setSidebarOpen(false)} />
            <SidebarLink to="/interests" label="Interests" onClick={() => setSidebarOpen(false)} />
            <SidebarLink to="/messages" label="Messages" onClick={() => setSidebarOpen(false)} />
            <SidebarLink to="/contacts" label="Unlocked Contacts" onClick={() => setSidebarOpen(false)} />
            <SidebarLink to="/notifications" label="Notifications" badgeCount={notificationsCount} onClick={() => setSidebarOpen(false)} />
            <SidebarLink to="/search" label="Search Profiles" onClick={() => setSidebarOpen(false)} />

            {/* Plan Name item in Hamburger Menu instead of generic "Premium" */}
            <div className="px-3 pt-3 pb-1">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Membership</span>
            </div>
            <SidebarLink
              to="/plans"
              label={planName}
              sublabel={isPremium ? 'Current Membership Plan' : 'Explore Membership Plans'}
              badgeText={isPremium ? 'ACTIVE' : 'UPGRADE'}
              badgeColor={isPremium ? 'bg-amber-100 text-amber-800 border-amber-300' : 'bg-gradient-to-r from-amber-500 to-orange-500 text-white border-amber-600'}
              isHighlight={true}
              onClick={() => setSidebarOpen(false)}
            />

            <div className="px-3 pt-3 pb-1">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Account</span>
            </div>
            <SidebarLink to="/profile" label="My Profile" onClick={() => setSidebarOpen(false)} />
            <SidebarLink to="/settings" label="Settings" onClick={() => setSidebarOpen(false)} />
            <SidebarLink to="/help" label="Help & Support" onClick={() => setSidebarOpen(false)} />
          </nav>

          {/* Drawer Footer with Socials & Logout */}
          <div className="p-4 border-t border-slate-100 bg-slate-50/50 space-y-3">
            {/* Social Links */}
            <div className="flex items-center justify-center gap-3">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-lg bg-white hover:bg-[#1877F2] text-slate-400 hover:text-white flex items-center justify-center border border-slate-200 transition shadow-2xs"
                title="Facebook"
              >
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1V12h3v3h-3v6.8c4.56-.93 8-4.96 8-9.8z"/>
                </svg>
              </a>
              <a
                href="https://www.youtube.com/@familiess_GSN"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-lg bg-white hover:bg-[#FF0000] text-slate-400 hover:text-white flex items-center justify-center border border-slate-200 transition shadow-2xs"
                title="YouTube"
              >
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-lg bg-white hover:bg-gradient-to-tr hover:from-[#F58529] hover:to-[#DD2A7B] text-slate-400 hover:text-white flex items-center justify-center border border-slate-200 transition shadow-2xs"
                title="Instagram"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
                </svg>
              </a>
            </div>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-xl text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 transition cursor-pointer border border-rose-100"
            >
              <FontAwesomeIcon icon={faSignOutAlt} />
              <span>Log Out</span>
            </button>
          </div>
        </div>
      </div>

      {/* Top Header Bar - Persistent across logged-in pages */}
      <header className="sticky top-2 z-50 px-2 w-full">
        <div className="max-w-full mx-auto px-4 sm:px-8 h-20 flex justify-between items-center bg-white border border-slate-100 rounded-3xl shadow-xl shadow-slate-150/30">

          {/* Left: Brand Logo & Title + Hamburger Menu Button */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <button
              onClick={() => setSidebarOpen(true)}
              className={`${!isFeedPage ? 'flex' : 'flex lg:hidden'} items-center justify-center w-9 h-9 sm:w-10 sm:h-10 bg-slate-50 hover:bg-[#5D34F7]/10 text-gray-700 hover:text-[#5D34F7] rounded-xl transition cursor-pointer border border-slate-100/80 shadow-sm shrink-0`}
              title="Open Menu"
            >
              <FontAwesomeIcon icon={faBars} className="text-sm sm:text-base" />
            </button>

            <div className="flex items-center gap-1.5 sm:gap-2.5 cursor-pointer shrink-0" onClick={() => navigate('/preference-matches')}>
              <img src={navbarLogo} alt="Familiess Matrimony Logo" className="w-8 h-8 sm:w-9 sm:h-9 object-contain brand-logo-black shrink-0" />
              <img src={navbarName} alt="Familiess Matrimony" className="h-6 sm:h-7 object-contain brand-logo-black shrink-0" />
            </div>
          </div>

          {/* Middle: Horizontal Navigation Menu (Only on Feed page) */}
          {isFeedPage && (
            <nav className="hidden lg:flex items-center gap-2 xl:gap-5 2xl:gap-7 text-xs xl:text-[13px] font-sans font-bold text-gray-600 whitespace-nowrap px-1">
              <HeaderLink to="/home" label="Home" />
              <HeaderLink to="/preference-matches" label="Preference Matches" />
              <HeaderLink to="/interests" label="Interests" />
              <HeaderLink to="/messages" label="Messages" />
              <HeaderLink to="/notifications" label="Notifications" badgeCount={notificationsCount} />
              <HeaderLink to="/matches" label="Mutual Matches" />
            </nav>
          )}

          {/* Right: Plan Name Pill & Profile Avatar */}
          <div className="flex items-center gap-2 sm:gap-3 relative shrink-0">
            {/* Plan Name Pill in Top Header */}
            <div
              onClick={() => navigate('/plans')}
              className={`hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] xl:text-xs font-sans font-black cursor-pointer transition shadow-2xs border shrink-0 ${
                isPremium
                  ? 'bg-amber-50 hover:bg-amber-100 text-amber-800 border-amber-200'
                  : 'bg-[#5D34F7]/10 hover:bg-[#5D34F7]/15 text-[#5D34F7] border-[#5D34F7]/20'
              }`}
              title="Membership Plan"
            >
              <FontAwesomeIcon icon={faCrown} className={`text-xs ${isPremium ? 'text-amber-500' : 'text-[#5D34F7]'}`} />
              <span className="whitespace-nowrap">{planName}</span>
            </div>

            {/* Profile Avatar */}
            <div
              className="flex items-center gap-1.5 cursor-pointer p-1 hover:bg-slate-50 rounded-full transition shrink-0"
              onClick={() => navigate('/profile')}
              title="View Profile"
            >
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full overflow-hidden bg-[#5D34F7]/10 border border-[#5D34F7]/20 flex items-center justify-center shrink-0">
                {p.photos && p.photos[0] ? (
                  <img src={getPhotoUrl(p.photos[0])} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <div className="text-[#5D34F7] text-sm font-bold">
                    {p.name ? p.name[0] : <FontAwesomeIcon icon={faUser} />}
                  </div>
                )}
              </div>
              <FontAwesomeIcon icon={faChevronDown} className="w-2.5 h-2.5 text-gray-500" />
            </div>

          </div>

        </div>
      </header>

      {/* Main Outlet for Pages */}
      <main className="flex-1">
        <Outlet />
      </main>

    </div>
  );
}

function HeaderLink({ to, label, badgeCount }) {
  const Icon = navIcons[to];
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex items-center gap-1.5 py-1.5 px-1 border-b-2 transition-all duration-200 font-sans font-bold whitespace-nowrap text-xs xl:text-[13px] tracking-tight group relative shrink-0 ${isActive
          ? 'border-[#5D34F7] text-[#5D34F7]'
          : 'border-transparent text-gray-600 hover:text-[#5D34F7]'
        }`
      }
    >
      <div className="transition-transform duration-300 group-hover:scale-110 group-active:scale-90 relative shrink-0 [&>svg]:w-4 [&>svg]:h-4">
        {Icon ? <Icon /> : null}
        {badgeCount > 0 && (
          <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[8px] font-black rounded-full h-3.5 w-3.5 flex items-center justify-center border border-white animate-pulse">
            {badgeCount}
          </span>
        )}
      </div>
      <span className="whitespace-nowrap">{label}</span>
    </NavLink>
  );
}

function SidebarLink({
  to,
  label,
  sublabel,
  onClick,
  badgeCount,
  badgeText,
  badgeColor,
  isHighlight
}) {
  const Icon = navIcons[to];
  return (
    <NavLink
      to={to}
      onClick={onClick}
      className={({ isActive }) =>
        `flex items-center justify-between px-3.5 py-2.5 rounded-2xl transition-all duration-200 font-extrabold group border relative ${
          isActive
            ? 'bg-[#5D34F7]/10 border-[#5D34F7]/25 text-[#5D34F7] shadow-xs'
            : isHighlight
            ? 'bg-gradient-to-r from-amber-500/10 via-amber-400/5 to-transparent border-amber-200/80 text-amber-950 hover:bg-amber-100/60'
            : 'bg-transparent border-transparent text-gray-700 hover:bg-slate-50 hover:text-[#5D34F7]'
        }`
      }
    >
      <div className="flex items-center gap-3.5 min-w-0">
        <div className="transition-transform duration-300 group-hover:scale-110 group-active:scale-90 relative shrink-0">
          {Icon ? <Icon /> : null}
          {badgeCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[9px] font-black rounded-full h-4 w-4 flex items-center justify-center border border-white">
              {badgeCount}
            </span>
          )}
        </div>
        <div className="min-w-0 text-left">
          <span className="text-sm block truncate leading-tight font-extrabold">{label}</span>
          {sublabel && (
            <span className="text-[11px] text-slate-400 font-medium block truncate leading-tight mt-0.5">{sublabel}</span>
          )}
        </div>
      </div>

      {badgeText && (
        <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border shrink-0 ${badgeColor || 'bg-slate-100 text-slate-600 border-slate-200'}`}>
          {badgeText}
        </span>
      )}
    </NavLink>
  );
}
