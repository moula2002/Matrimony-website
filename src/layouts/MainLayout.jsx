import { useState, useEffect, useRef, useCallback } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faHome, faUsers, faHeart, faComment, faSearch, faBell,
  faChevronDown, faUser, faExchangeAlt, faBars, faTimes, faCrown,
  faSignOutAlt, faCog, faQuestionCircle, faShieldAlt, faAddressBook
} from '@fortawesome/free-solid-svg-icons';
import api, { getPhotoUrl, getDefaultAvatar, handleImageError } from '../api/axios';
import navbarLogo from '../assets/navbar_logo.png';
import navbarName from '../assets/navbar_name.png';
import backgroundBg from '../assets/background.png';
import maleAvatar from '../assets/male_avatar.png';
import femaleAvatar from '../assets/female_avatar.png';
import VipConsultantModal from '../components/VipConsultantModal';
import VipShaadiModal from '../components/VipShaadiModal';

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
  '/feed': () => (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" fill="url(#feed_grad_sub)" />
      <defs>
        <linearGradient id="feed_grad_sub" x1="12" y1="2" x2="12" y2="21" gradientUnits="userSpaceOnUse">
          <stop stopColor="#EC4899" />
          <stop offset="1" stopColor="#8B5CF6" />
        </linearGradient>
      </defs>
    </svg>
  ),
  '/preference-matches?tab=recent': () => (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="9" stroke="url(#recent_grad)" strokeWidth="2.5" />
      <path d="M12 7V12L15.5 14" stroke="url(#recent_grad)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      <defs>
        <linearGradient id="recent_grad" x1="12" y1="3" x2="12" y2="21" gradientUnits="userSpaceOnUse">
          <stop stopColor="#06B6D4" />
          <stop offset="1" stopColor="#3B82F6" />
        </linearGradient>
      </defs>
    </svg>
  ),
  '/preference-matches?tab=more': () => (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="9" stroke="url(#more_grad)" strokeWidth="2.5" />
      <polygon points="12,7 15,12 12,17 9,12" fill="url(#more_grad)" />
      <defs>
        <linearGradient id="more_grad" x1="12" y1="3" x2="12" y2="21" gradientUnits="userSpaceOnUse">
          <stop stopColor="#8B5CF6" />
          <stop offset="1" stopColor="#6366F1" />
        </linearGradient>
      </defs>
    </svg>
  ),
  '/preference-matches?tab=views': () => (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M1 12S5 4 12 4s11 8 11 8-4 8-11 8-11-8-11-8z" stroke="url(#views_grad)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="12" cy="12" r="3" fill="url(#views_grad)" />
      <defs>
        <linearGradient id="views_grad" x1="12" y1="4" x2="12" y2="20" gradientUnits="userSpaceOnUse">
          <stop stopColor="#F59E0B" />
          <stop offset="1" stopColor="#EF4444" />
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
  '/contacts': () => (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M19 3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19V5C21 3.9 20.1 3 19 3ZM19 19H5V5H19V19Z" fill="url(#contacts_nav_grad)" />
      <circle cx="12" cy="9" r="2.5" fill="url(#contacts_nav_grad)" />
      <path d="M7 16C7 14.34 9.24 13 12 13C14.76 13 17 14.34 17 16V17H7V16Z" fill="url(#contacts_nav_grad)" />
      <defs>
        <linearGradient id="contacts_nav_grad" x1="3" y1="3" x2="21" y2="21" gradientUnits="userSpaceOnUse">
          <stop stopColor="#10B981" />
          <stop offset="1" stopColor="#059669" />
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
  ),
  '/safety-center': () => (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2L4 5V11.09C4 16.14 7.41 20.85 12 22C16.59 20.85 20 16.14 20 11.09V5L12 2Z" fill="url(#safety_nav_grad)" />
      <path d="M9 12L11 14L15 10" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <defs>
        <linearGradient id="safety_nav_grad" x1="12" y1="2" x2="12" y2="22" gradientUnits="userSpaceOnUse">
          <stop stopColor="#10B981" />
          <stop offset="1" stopColor="#059669" />
        </linearGradient>
      </defs>
    </svg>
  ),
  '/astrochat': () => (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2L14.4 7.5L20.5 8.2L16 12.3L17.2 18.3L12 15.2L6.8 18.3L8 12.3L3.5 8.2L9.6 7.5L12 2Z" fill="url(#astro_nav_grad)" />
      <circle cx="12" cy="11.5" r="2.5" fill="#FEF08A" />
      <defs>
        <linearGradient id="astro_nav_grad" x1="12" y1="2" x2="12" y2="22" gradientUnits="userSpaceOnUse">
          <stop stopColor="#F59E0B" />
          <stop offset="0.5" stopColor="#EC4899" />
          <stop offset="1" stopColor="#8B5CF6" />
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
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef(null);
  const [moreMenuOpen, setMoreMenuOpen] = useState(false);
  const moreMenuRef = useRef(null);
  const [showVipModal, setShowVipModal] = useState(false);
  const [showVipShaadiModal, setShowVipShaadiModal] = useState(false);

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

  // Click outside to close notification, user dropdown, and more menu
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifDropdownRef.current && !notifDropdownRef.current.contains(e.target)) {
        setShowNotifDropdown(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserMenuOpen(false);
      }
      if (moreMenuRef.current && !moreMenuRef.current.contains(e.target)) {
        setMoreMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close menus on route change
  useEffect(() => {
    setUserMenuOpen(false);
    setMoreMenuOpen(false);
  }, [location.pathname]);

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
  const showDesktopNav = [
    '/home',
    '/preference-matches',
    '/search',
    '/interests',
    '/messages',
    '/contacts',
    '/notifications',
    '/matches',
    '/astrochat'
  ].includes(location.pathname);
  const isMoreActive = ['/interests', '/contacts', '/matches'].includes(location.pathname);

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
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full overflow-hidden bg-[#5D34F7]/10 border-2 border-[#5D34F7]/25 shrink-0 flex items-center justify-center">
                {userPhoto ? (
                  <img src={userPhoto} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-[#5D34F7] font-black text-base">{displayName[0]}</span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-black text-slate-900 text-sm truncate leading-tight">
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
                className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider transition cursor-pointer border ${isPremium
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
                  ⭐ Highlight My Profile
                </span>
              </div>
            )}
          </div>

          {/* Drawer Links */}
          <nav className="flex-1 px-4 py-1 space-y-1 overflow-y-auto custom-scrollbar">
            <div className="px-3 pb-1 pt-1">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Main Menu</span>
            </div>
            <SidebarLink to="/home" label="Home" onClick={() => setSidebarOpen(false)} />

            {/* Feed Tabs Section */}
            <div className="px-3 pt-3 pb-1 flex items-center justify-between">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Feed & Matches</span>
              <span className="text-[9px] font-bold text-[#5D34F7] bg-[#5D34F7]/10 px-2 py-0.5 rounded-full">Feed</span>
            </div>
            <SidebarLink
              to="/preference-matches"
              label="Preference Matches"
              sublabel="Based on partner preferences"
              onClick={() => setSidebarOpen(false)}
            />
            <SidebarLink
              to="/preference-matches?tab=recent"
              label="Recently Added"
              sublabel="Newly registered profiles"
              onClick={() => setSidebarOpen(false)}
            />
            <SidebarLink
              to="/preference-matches?tab=more"
              label="More Profiles"
              sublabel="Discover other members"
              onClick={() => setSidebarOpen(false)}
            />
            <SidebarLink
              to="/preference-matches?tab=views"
              label="Viewed You"
              sublabel="Members who checked your profile"
              onClick={() => setSidebarOpen(false)}
            />
            <SidebarLink
              to="/matches"
              label="Mutual Matches"
              sublabel="Connected matches"
              onClick={() => setSidebarOpen(false)}
            />

            {/* Connections & Search */}
            <div className="px-3 pt-3 pb-1">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Connections & Search</span>
            </div>
            <SidebarLink to="/interests" label="Interests" onClick={() => setSidebarOpen(false)} />
            <SidebarLink to="/messages" label="Messages" onClick={() => setSidebarOpen(false)} />
            <SidebarLink to="/contacts" label="Contacts" onClick={() => setSidebarOpen(false)} />
            <SidebarLink to="/alerts" label="Alerts" sublabel="Activity & updates" badgeCount={notificationsCount} onClick={() => setSidebarOpen(false)} />
            <SidebarLink to="/notifications" label="Notifications" onClick={() => setSidebarOpen(false)} />
            <SidebarLink to="/search" label="Search Profiles" onClick={() => setSidebarOpen(false)} />

            {/* AstroChat Navigation Item */}
            <div className="px-3 pt-3 pb-1 flex items-center justify-between">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Astrology</span>
              <span className="text-[9px] font-black text-amber-600 bg-amber-100 px-2 py-0.5 rounded-full border border-amber-300">LIVE</span>
            </div>
            <SidebarLink
              to="/astrochat"
              label="AstroChat"
              sublabel="Connect with Vedic Astrologers"
              badgeText="LIVE"
              badgeColor="bg-gradient-to-r from-amber-500 to-purple-600 text-white border-transparent shadow-xs"
              onClick={() => setSidebarOpen(false)}
            />

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

            {/* VIP Shaadi – Get Invited Dedicated Drawer Option */}
            <button
              type="button"
              onClick={() => {
                setShowVipShaadiModal(true);
                setSidebarOpen(false);
              }}
              className="w-full flex items-center justify-between p-3 rounded-2xl bg-gradient-to-r from-amber-500/20 via-yellow-500/15 to-purple-500/15 border-2 border-amber-400 hover:border-amber-500 hover:bg-amber-100/50 transition cursor-pointer group text-left shadow-xs"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-400 to-orange-500 text-slate-950 flex items-center justify-center font-bold text-xs shadow-sm">
                  👑
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-black text-xs text-slate-950 group-hover:text-amber-900">VIP Shaadi</span>
                    <span className="px-1.5 py-0.2 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 text-slate-950 text-[9px] font-black uppercase">
                      Get Invited
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-600 font-semibold">Bespoke Executive Matchmaking</p>
                </div>
              </div>
              <span className="text-amber-700 text-sm font-black group-hover:translate-x-1 transition-transform">›</span>
            </button>

            {/* VIP Consultant Dedicated Drawer Option */}
            <button
              type="button"
              onClick={() => {
                setShowVipModal(true);
                setSidebarOpen(false);
              }}
              className="w-full flex items-center justify-between p-3 rounded-2xl bg-gradient-to-r from-amber-500/15 via-purple-500/10 to-transparent border border-amber-300/80 hover:border-amber-400 hover:bg-amber-50/60 transition cursor-pointer group text-left shadow-2xs"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-400 to-orange-500 text-slate-950 flex items-center justify-center font-bold text-xs shadow-sm">
                  👑
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-black text-xs text-slate-900 group-hover:text-amber-800">VIP Consultant</span>
                    <span className="px-1.5 py-0.2 rounded-full bg-amber-400 text-slate-950 text-[9px] font-black uppercase">
                      Assisted
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-500 font-semibold">Personal Relationship Manager</p>
                </div>
              </div>
              <span className="text-amber-600 text-sm font-black group-hover:translate-x-0.5 transition-transform">›</span>
            </button>

            <div className="px-3 pt-3 pb-1">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Account</span>
            </div>
            <SidebarLink to="/safety-center" label="Safety Center" onClick={() => setSidebarOpen(false)} />
            <SidebarLink to="/settings" label="Settings" onClick={() => setSidebarOpen(false)} />
            <SidebarLink to="/help" label="Help & Support" onClick={() => setSidebarOpen(false)} />
          </nav>

          {/* Drawer Footer with Social Media & Logout */}
          <div className="p-4 border-t border-slate-100 bg-slate-50/70 space-y-3.5">
            {/* Social Links Heading */}
            <div className="text-center">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                Connect With Us
              </span>
            </div>

            {/* Social Media Buttons (WhatsApp, Instagram, Facebook, YouTube, LinkedIn) */}
            <div className="grid grid-cols-5 gap-2 px-1">
              {/* WhatsApp */}
              <a
                href="https://wa.me/9118004196000?text=Hello%20Familiess%20Matrimony%20Team"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full aspect-square rounded-xl bg-emerald-50 hover:bg-[#25D366] text-emerald-600 hover:text-white flex items-center justify-center border border-emerald-200/80 hover:border-[#25D366] transition-all duration-200 hover:-translate-y-0.5 active:scale-95 shadow-2xs hover:shadow-md hover:shadow-emerald-500/20"
                title="WhatsApp"
                aria-label="WhatsApp"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
                </svg>
              </a>

              {/* Instagram */}
              <a
                href="https://www.instagram.com/familiessmatrimony"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full aspect-square rounded-xl bg-pink-50 hover:bg-gradient-to-tr hover:from-[#F58529] hover:via-[#DD2A7B] hover:to-[#8134AF] text-[#E4405F] hover:text-white flex items-center justify-center border border-pink-200/80 hover:border-transparent transition-all duration-200 hover:-translate-y-0.5 active:scale-95 shadow-2xs hover:shadow-md hover:shadow-pink-500/20"
                title="Instagram"
                aria-label="Instagram"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                </svg>
              </a>

              {/* Facebook */}
              <a
                href="https://www.facebook.com/familiessmatrimony"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full aspect-square rounded-xl bg-blue-50 hover:bg-[#1877F2] text-[#1877F2] hover:text-white flex items-center justify-center border border-blue-200/80 hover:border-[#1877F2] transition-all duration-200 hover:-translate-y-0.5 active:scale-95 shadow-2xs hover:shadow-md hover:shadow-blue-500/20"
                title="Facebook"
                aria-label="Facebook"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1V12h3v3h-3v6.8c4.56-.93 8-4.96 8-9.8z" />
                </svg>
              </a>

              {/* YouTube */}
              <a
                href="https://www.youtube.com/@familiess_GSN"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full aspect-square rounded-xl bg-red-50 hover:bg-[#FF0000] text-[#FF0000] hover:text-white flex items-center justify-center border border-red-200/80 hover:border-[#FF0000] transition-all duration-200 hover:-translate-y-0.5 active:scale-95 shadow-2xs hover:shadow-md hover:shadow-red-500/20"
                title="YouTube"
                aria-label="YouTube"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                </svg>
              </a>

              {/* LinkedIn */}
              <a
                href="https://www.linkedin.com/company/familiess-matrimony"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full aspect-square rounded-xl bg-sky-50 hover:bg-[#0A66C2] text-[#0A66C2] hover:text-white flex items-center justify-center border border-sky-200/80 hover:border-[#0A66C2] transition-all duration-200 hover:-translate-y-0.5 active:scale-95 shadow-2xs hover:shadow-md hover:shadow-sky-500/20"
                title="LinkedIn"
                aria-label="LinkedIn"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 8.76a1.64 1.64 0 1 0 0-3.28 1.64 1.64 0 0 0 0 3.28m1.4 9.74v-8.37H5.06v8.37z" />
                </svg>
              </a>
            </div>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 transition cursor-pointer border border-rose-100 active:scale-95"
            >
              <FontAwesomeIcon icon={faSignOutAlt} />
              <span>Log Out</span>
            </button>
          </div>
        </div>
      </div>

      {/* Top Header Bar - Persistent across logged-in pages */}
      <header className="sticky top-2 z-50 px-2 sm:px-3 w-full">
        <div className="max-w-full mx-auto px-3 sm:px-5 xl:px-7 h-18 sm:h-20 flex justify-between items-center bg-white border border-slate-100 rounded-3xl shadow-xl shadow-slate-150/30 overflow-visible">

          {/* Left: Brand Logo & Title + Hamburger Menu Button */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <button
              onClick={() => setSidebarOpen(true)}
              className="flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 bg-slate-50 hover:bg-[#5D34F7]/10 text-gray-700 hover:text-[#5D34F7] rounded-xl transition cursor-pointer border border-slate-100/80 shadow-sm shrink-0"
              title="Open Menu"
            >
              <FontAwesomeIcon icon={faBars} className="text-sm sm:text-base" />
            </button>

            <div className="flex items-center gap-1.5 sm:gap-2.5 cursor-pointer shrink-0" onClick={() => navigate('/preference-matches')}>
              <img src={navbarLogo} alt="Familiess Matrimony Logo" className="w-8 h-8 sm:w-9 sm:h-9 object-contain brand-logo-black shrink-0" />
              <img src={navbarName} alt="Familiess Matrimony" className="h-6 sm:h-7 object-contain brand-logo-black shrink-0 hidden sm:block" />
            </div>
          </div>

          {/* Middle: Desktop Responsive Navigation Menu */}
          {showDesktopNav && (
            <nav className="hidden lg:flex items-center gap-1 xl:gap-2 2xl:gap-4 text-xs xl:text-[13px] font-sans font-bold text-gray-600 whitespace-nowrap px-1">
              <HeaderLink to="/home" label="Home" />
              <HeaderLink to="/preference-matches" label="Send Interests" compactLabel="Send Interests" />
              <HeaderLink to="/search" label="Search" />
              <HeaderLink to="/interests" label="Interests" className="hidden xl:flex" />
              <HeaderLink to="/messages" label="Messages" />
              <HeaderLink to="/contacts" label="Contacts" className="hidden xl:flex" />
              <HeaderLink to="/astrochat" label="AstroChat" compactLabel="AstroChat" />
              <HeaderLink to="/notifications" label="Notifications" badgeCount={notificationsCount} />
              <HeaderLink to="/matches" label="Mutual Matches" compactLabel="Matches" className="hidden xl:flex" />

              {/* "More ▾" dropdown for compact desktop screens (1024px - 1279px) */}
              <div className="relative xl:hidden" ref={moreMenuRef}>
                <button
                  type="button"
                  onClick={() => setMoreMenuOpen(prev => !prev)}
                  className={`flex items-center gap-1 py-1.5 px-1.5 border-b-2 transition-all duration-200 font-sans font-bold whitespace-nowrap text-xs tracking-tight group cursor-pointer ${
                    isMoreActive
                      ? 'border-[#5D34F7] text-[#5D34F7]'
                      : 'border-transparent text-gray-600 hover:text-[#5D34F7] hover:border-slate-200'
                  }`}
                  title="More Navigation Links"
                >
                  <span>More</span>
                  <FontAwesomeIcon
                    icon={faChevronDown}
                    className={`text-[9px] transition-transform duration-200 ${moreMenuOpen ? 'rotate-180' : ''}`}
                  />
                  {isMoreActive && (
                    <span className="w-1.5 h-1.5 rounded-full bg-[#5D34F7]"></span>
                  )}
                </button>

                {moreMenuOpen && (
                  <div className="absolute left-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-slate-100 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-150">
                    <NavLink
                      to="/interests"
                      onClick={() => setMoreMenuOpen(false)}
                      className={({ isActive }) =>
                        `flex items-center gap-2.5 px-3.5 py-2.5 text-xs font-bold transition ${
                          isActive
                            ? 'text-[#5D34F7] bg-[#5D34F7]/10'
                            : 'text-slate-700 hover:bg-slate-50 hover:text-[#5D34F7]'
                        }`
                      }
                    >
                      <div className="[&>svg]:w-4 [&>svg]:h-4">
                        {navIcons['/interests'] && navIcons['/interests']()}
                      </div>
                      <span>Interests</span>
                    </NavLink>

                    <NavLink
                      to="/contacts"
                      onClick={() => setMoreMenuOpen(false)}
                      className={({ isActive }) =>
                        `flex items-center gap-2.5 px-3.5 py-2.5 text-xs font-bold transition ${
                          isActive
                            ? 'text-[#5D34F7] bg-[#5D34F7]/10'
                            : 'text-slate-700 hover:bg-slate-50 hover:text-[#5D34F7]'
                        }`
                      }
                    >
                      <div className="[&>svg]:w-4 [&>svg]:h-4">
                        {navIcons['/contacts'] && navIcons['/contacts']()}
                      </div>
                      <span>Contacts</span>
                    </NavLink>

                    <NavLink
                      to="/matches"
                      onClick={() => setMoreMenuOpen(false)}
                      className={({ isActive }) =>
                        `flex items-center gap-2.5 px-3.5 py-2.5 text-xs font-bold transition ${
                          isActive
                            ? 'text-[#5D34F7] bg-[#5D34F7]/10'
                            : 'text-slate-700 hover:bg-slate-50 hover:text-[#5D34F7]'
                        }`
                      }
                    >
                      <div className="[&>svg]:w-4 [&>svg]:h-4">
                        {navIcons['/matches'] && navIcons['/matches']()}
                      </div>
                      <span>Mutual Matches</span>
                    </NavLink>
                  </div>
                )}
              </div>
            </nav>
          )}

          {/* Right: Plan Name Pill & Profile Avatar */}
          <div className="flex items-center gap-2 sm:gap-2.5 relative shrink-0">
            {/* VIP Shaadi – Get Invited Header Quick CTA Button */}
            <button
              type="button"
              onClick={() => setShowVipShaadiModal(true)}
              className="flex items-center gap-1.5 px-3 py-1 sm:py-1.5 rounded-full text-[11px] xl:text-xs font-sans font-black cursor-pointer transition shadow-xs border shrink-0 bg-gradient-to-r from-amber-400 via-yellow-400 to-orange-400 hover:from-amber-300 hover:to-orange-300 text-slate-950 border-amber-300 hover:scale-105 active:scale-95"
              title="VIP Shaadi - Get Invited"
            >
              <FontAwesomeIcon icon={faCrown} className="text-xs" />
              <span className="whitespace-nowrap hidden sm:inline">VIP Shaadi</span>
              <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-slate-950 text-amber-300 uppercase font-black">Invite</span>
            </button>

            {/* VIP Consultant Dedicated Button in Top Header */}
            <button
              type="button"
              onClick={() => setShowVipModal(true)}
              className="hidden lg:flex items-center gap-1.5 px-3 py-1 sm:py-1.5 rounded-full text-[11px] xl:text-xs font-sans font-black cursor-pointer transition shadow-xs border shrink-0 bg-white hover:bg-slate-50 text-slate-800 border-slate-200 hover:scale-105 active:scale-95"
              title="Talk to our VIP Relationship Managers"
            >
              <span className="text-xs">👑</span>
              <span className="whitespace-nowrap hidden sm:inline">VIP Consultant</span>
            </button>

            {/* Plan Name Pill in Top Header */}
            <div
              onClick={() => navigate('/plans')}
              className={`hidden sm:flex items-center gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full text-[11px] xl:text-xs font-sans font-black cursor-pointer transition shadow-2xs border shrink-0 ${isPremium
                  ? 'bg-amber-50 hover:bg-amber-100 text-amber-800 border-amber-200'
                  : 'bg-[#5D34F7]/10 hover:bg-[#5D34F7]/15 text-[#5D34F7] border-[#5D34F7]/20'
                }`}
              title="Membership Plan"
            >
              <FontAwesomeIcon icon={faCrown} className={`text-xs ${isPremium ? 'text-amber-500' : 'text-[#5D34F7]'}`} />
              <span className="whitespace-nowrap hidden xl:inline">{planName}</span>
              <span className="whitespace-nowrap xl:hidden">{isPremium ? (rawPlanType?.split(' ')?.[0] || 'Premium') : 'Free'}</span>
            </div>

            {/* User Avatar & Account Dropdown */}
            <div className="relative shrink-0" ref={userMenuRef}>
              <button
                type="button"
                onClick={() => setUserMenuOpen((prev) => !prev)}
                className="flex items-center gap-1 sm:gap-1.5 cursor-pointer p-0.5 sm:p-1 hover:bg-slate-50 rounded-full transition shrink-0 border-0 bg-transparent"
                title="Account Menu"
              >
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full overflow-hidden bg-[#5D34F7]/10 border border-[#5D34F7]/20 flex items-center justify-center shrink-0">
                  {p.photos && p.photos[0] ? (
                    <img
                      src={getPhotoUrl(p.photos[0], p.gender)}
                      alt={p.name || 'Avatar'}
                      onError={(e) => handleImageError(e, p.gender)}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <img
                      src={getDefaultAvatar(p.gender)}
                      alt={p.name || 'Avatar'}
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>
                <FontAwesomeIcon icon={faChevronDown} className={`w-2.5 h-2.5 text-gray-500 transition-transform duration-200 ${userMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* User Dropdown Menu (Without Profile option) */}
              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-slate-100 py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                  {/* User info header */}
                  <div className="px-4 py-3 border-b border-slate-100">
                    <p className="text-xs font-black text-slate-900 truncate">{displayName}</p>
                    <p className="text-[10px] text-slate-400 font-bold mt-0.5 truncate">ID: {displayId}</p>
                    <div className="mt-2 flex items-center justify-between">
                      <span className="text-[10px] font-black text-[#5D34F7] uppercase tracking-wider">{planName}</span>
                      <button
                        onClick={() => { setUserMenuOpen(false); navigate('/plans'); }}
                        className="text-[9px] font-black text-amber-600 hover:text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md uppercase tracking-wider cursor-pointer border border-amber-200"
                      >
                        {isPremium ? 'Manage' : 'Upgrade'}
                      </button>
                    </div>
                  </div>

                  {/* Menu Options */}
                  <div className="py-1">
                    <button
                      onClick={() => { setUserMenuOpen(false); setShowVipShaadiModal(true); }}
                      className="w-full text-left px-4 py-2.5 text-xs font-black text-amber-950 bg-gradient-to-r from-amber-100/90 to-yellow-50 hover:bg-amber-200/90 flex items-center justify-between transition cursor-pointer border-0"
                    >
                      <div className="flex items-center gap-2.5">
                        <FontAwesomeIcon icon={faCrown} className="text-amber-600 text-sm" />
                        <span>VIP Shaadi – Get Invited</span>
                      </div>
                      <span className="text-[9px] font-black uppercase bg-slate-950 text-amber-400 px-2 py-0.5 rounded-full">
                        Exclusive
                      </span>
                    </button>
                    <button
                      onClick={() => { setUserMenuOpen(false); setShowVipModal(true); }}
                      className="w-full text-left px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 flex items-center justify-between transition cursor-pointer border-0 bg-transparent"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="text-sm">👑</span>
                        <span>VIP Consultant</span>
                      </div>
                      <span className="text-[9px] font-black uppercase bg-amber-400 text-slate-950 px-1.5 py-0.2 rounded-full">
                        Assisted
                      </span>
                    </button>
                    <button
                      onClick={() => { setUserMenuOpen(false); navigate('/astrochat'); }}
                      className="w-full text-left px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 hover:text-[#5D34F7] flex items-center justify-between transition cursor-pointer border-0 bg-transparent"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="text-sm">🔮</span>
                        <span>AstroChat</span>
                      </div>
                      <span className="text-[9px] font-black uppercase bg-purple-100 text-purple-700 px-1.5 py-0.2 rounded-full">
                        Vedic
                      </span>
                    </button>
                    <button
                      onClick={() => { setUserMenuOpen(false); navigate('/contacts'); }}
                      className="w-full text-left px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 hover:text-[#5D34F7] flex items-center gap-2.5 transition cursor-pointer border-0 bg-transparent"
                    >
                      <FontAwesomeIcon icon={faAddressBook} className="w-3.5 h-3.5 text-emerald-500" />
                      <span>Contacts</span>
                    </button>
                    <button
                      onClick={() => { setUserMenuOpen(false); navigate('/safety-center'); }}
                      className="w-full text-left px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 hover:text-[#5D34F7] flex items-center gap-2.5 transition cursor-pointer border-0 bg-transparent"
                    >
                      <FontAwesomeIcon icon={faShieldAlt} className="w-3.5 h-3.5 text-emerald-500" />
                      <span>Safety Center</span>
                    </button>
                    <button
                      onClick={() => { setUserMenuOpen(false); navigate('/settings'); }}
                      className="w-full text-left px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 hover:text-[#5D34F7] flex items-center gap-2.5 transition cursor-pointer border-0 bg-transparent"
                    >
                      <FontAwesomeIcon icon={faCog} className="w-3.5 h-3.5 text-slate-400" />
                      <span>Settings</span>
                    </button>
                    <button
                      onClick={() => { setUserMenuOpen(false); navigate('/help'); }}
                      className="w-full text-left px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 hover:text-[#5D34F7] flex items-center gap-2.5 transition cursor-pointer border-0 bg-transparent"
                    >
                      <FontAwesomeIcon icon={faQuestionCircle} className="w-3.5 h-3.5 text-slate-400" />
                      <span>Help & Support</span>
                    </button>
                  </div>

                  <div className="border-t border-slate-100 pt-1">
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 flex items-center gap-2.5 transition cursor-pointer border-0 bg-transparent"
                    >
                      <FontAwesomeIcon icon={faSignOutAlt} className="w-3.5 h-3.5 text-rose-500" />
                      <span>Log Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

          </div>

        </div>
      </header>

      {/* Main Outlet for Pages */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Global VIP Consultant Modal */}
      <VipConsultantModal
        isOpen={showVipModal}
        onClose={() => setShowVipModal(false)}
        currentUser={profile}
      />

      {/* Global VIP Shaadi – Get Invited Modal */}
      <VipShaadiModal
        isOpen={showVipShaadiModal}
        onClose={() => setShowVipShaadiModal(false)}
        currentUser={profile}
      />
    </div>
  );
}

function HeaderLink({ to, label, compactLabel, badgeCount, className = '' }) {
  const Icon = navIcons[to];
  const displayClass = className || 'flex';
  const location = useLocation();
  const isActive = location.pathname === to || (to === '/preference-matches' && (location.pathname === '/preference-matches' || location.pathname === '/feed'));

  return (
    <NavLink
      to={to}
      className={() =>
        `${displayClass} items-center gap-1 xl:gap-1.5 py-1.5 px-1 xl:px-1.5 border-b-2 transition-all duration-200 font-sans font-bold whitespace-nowrap text-xs xl:text-[13px] tracking-tight group relative shrink-0 ${isActive
          ? 'border-[#5D34F7] text-[#5D34F7]'
          : 'border-transparent text-gray-600 hover:text-[#5D34F7] hover:border-slate-200'
        }`
      }
      title={label}
    >
      <div className="transition-transform duration-300 group-hover:scale-110 group-active:scale-90 relative shrink-0 [&>svg]:w-3.5 [&>svg]:h-3.5 xl:[&>svg]:w-4 xl:[&>svg]:h-4">
        {Icon ? <Icon /> : null}
        {badgeCount > 0 && (
          <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[8px] font-black rounded-full h-3.5 w-3.5 flex items-center justify-center border border-white animate-pulse">
            {badgeCount}
          </span>
        )}
      </div>
      <span className="whitespace-nowrap">
        {compactLabel ? (
          <>
            <span className="hidden 2xl:inline">{label}</span>
            <span className="2xl:hidden">{compactLabel}</span>
          </>
        ) : (
          label
        )}
      </span>
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
  const location = useLocation();
  const currentPathWithSearch = location.pathname + (location.search || '');

  // Exact matching for Feed sub-tabs and query params
  const isTabActive = (() => {
    if (to.includes('?')) {
      return currentPathWithSearch === to;
    }
    // Base preference-matches or /feed link
    if (to === '/preference-matches' || to === '/feed') {
      if (location.pathname === '/preference-matches' || location.pathname === '/feed') {
        const params = new URLSearchParams(location.search);
        const currentTab = params.get('tab');
        return !currentTab || currentTab === 'matches';
      }
      return false;
    }
    return location.pathname === to;
  })();

  const Icon = navIcons[to] || navIcons[to.split('?')[0]];

  return (
    <NavLink
      to={to}
      onClick={onClick}
      className={() =>
        `flex items-center justify-between px-3.5 py-2.5 rounded-2xl transition-all duration-200 font-extrabold group border relative ${isTabActive
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
