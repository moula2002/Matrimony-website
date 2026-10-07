import { useState, useEffect, useRef } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faHome, faUsers, faHeart, faComment, faSearch, faBell,
  faChevronDown, faUser, faExchangeAlt, faBars, faTimes, faCrown
} from '@fortawesome/free-solid-svg-icons';
import api, { getPhotoUrl } from '../api/axios';
import navbarLogo from '../assets/navbar_logo.png';
import navbarName from '../assets/navbar_name.png';
import backgroundBg from '../assets/background.png';

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

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    const fetchProfile = async () => {
      try {
        const response = await api.get('/users/profile');
        setProfile(response.data);
      } catch (err) {
        console.error('Error fetching user profile for layout:', err);
      }
    };
    fetchProfile();
  }, [navigate]);

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
  const isPremium = premium?.isPremium || false;
  const planName = isPremium ? (premium.planType || 'Premium Member') : 'Free Member';
  const isFeedPage = location.pathname === '/preference-matches' || location.pathname === '/home';

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
        <div className={`absolute top-0 left-0 w-80 h-full bg-white shadow-2xl flex flex-col transition-transform duration-300 ease-out transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          {/* Drawer Header */}
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => { navigate('/preference-matches'); setSidebarOpen(false); }}>
              <img src={navbarLogo} alt="Familiess Matrimony Logo" className="w-6 h-6 object-contain" style={{ filter: 'brightness(0) saturate(100%)' }} />
              <img src={navbarName} alt="Familiess Matrimony" className="h-6 object-contain" style={{ filter: 'brightness(0) saturate(100%)' }} />
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="w-8 h-8 rounded-full flex items-center justify-center bg-slate-50 hover:bg-rose-50 text-slate-400 hover:text-rose-500 transition cursor-pointer border border-slate-100"
            >
              <FontAwesomeIcon icon={faTimes} />
            </button>
          </div>

          {/* Drawer Links */}
          <nav className="flex-1 p-6 space-y-2 overflow-y-auto">
            <SidebarLink to="/home" label="Home" onClick={() => setSidebarOpen(false)} />
            <SidebarLink to="/preference-matches" label="Preference Matches" onClick={() => setSidebarOpen(false)} />
            <SidebarLink to="/interests" label="Interests" onClick={() => setSidebarOpen(false)} />
            <SidebarLink to="/messages" label="Messages" onClick={() => setSidebarOpen(false)} />
            <SidebarLink to="/notifications" label="Notifications" badgeCount={notificationsCount} onClick={() => setSidebarOpen(false)} />
            <SidebarLink to="/matches" label="Mutual Matches" onClick={() => setSidebarOpen(false)} />
          </nav>
        </div>
      </div>

      {/* Top Header Bar - Persistent across logged-in pages */}
      <header className="sticky top-2 z-50 px-2 w-full">
        <div className="max-w-full mx-auto px-4 sm:px-8 h-20 flex justify-between items-center bg-white border border-slate-100 rounded-3xl shadow-xl shadow-slate-150/30">

          {/* Left: Brand Logo & Title + Hamburger Menu Button */}
          <div className="flex items-center gap-2 sm:gap-4">
            {!isFeedPage && (
              <button
                onClick={() => setSidebarOpen(true)}
                className="flex items-center justify-center w-10 h-10 bg-slate-50 hover:bg-[#5D34F7]/10 text-gray-700 hover:text-[#5D34F7] rounded-xl transition cursor-pointer border border-slate-100/80 shadow-sm"
                title="Open Menu"
              >
                <FontAwesomeIcon icon={faBars} className="text-base" />
              </button>
            )}

            <div className="flex items-center gap-2 sm:gap-3 cursor-pointer" onClick={() => navigate('/preference-matches')}>
              <img src={navbarLogo} alt="Familiess Matrimony Logo" className="w-9 h-9 sm:w-11 sm:h-11 object-contain brand-logo-black" />
              <img src={navbarName} alt="Familiess Matrimony" className="h-7 sm:h-10 object-contain brand-logo-black" />
            </div>
          </div>

          {/* Middle: Horizontal Navigation Menu (Only on Feed page) */}
          {isFeedPage && (
            <nav className="hidden lg:flex items-center gap-8 text-[15px] font-semibold text-gray-600">
              <HeaderLink to="/home" label="Home" />
              <HeaderLink to="/preference-matches" label="Preference Matches" />
              <HeaderLink to="/interests" label="Interests" />
              <HeaderLink to="/messages" label="Messages" />
              <HeaderLink to="/notifications" label="Notifications" badgeCount={notificationsCount} />
              <HeaderLink to="/matches" label="Mutual Matches" />
            </nav>
          )}

          {/* Right: Profile Dropdown */}
          <div className="flex items-center gap-2 sm:gap-4 relative">

            {/* Profile Avatar & Dropdown */}
            <div
              className="flex items-center gap-2 cursor-pointer p-1.5 hover:bg-slate-50 rounded-full transition"
              onClick={() => navigate('/profile')}
              title="View Profile"
            >
              <div className="w-10 h-10 rounded-full overflow-hidden bg-[#5D34F7]/10 border border-[#5D34F7]/20 flex items-center justify-center">
                {p.photos && p.photos[0] ? (
                  <img src={getPhotoUrl(p.photos[0])} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <div className="text-[#5D34F7] text-sm font-bold">
                    {p.name ? p.name[0] : <FontAwesomeIcon icon={faUser} />}
                  </div>
                )}
              </div>
              <FontAwesomeIcon icon={faChevronDown} className="w-3 h-3 text-gray-500" />
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
        `flex items-center gap-2 py-2 border-b-2 transition-all duration-200 font-bold group relative ${isActive
          ? 'border-[#5D34F7] text-[#5D34F7]'
          : 'border-transparent text-gray-600 hover:text-[#5D34F7]'
        }`
      }
    >
      <div className="transition-transform duration-300 group-hover:scale-110 group-active:scale-90 relative">
        {Icon ? <Icon /> : null}
        {badgeCount > 0 && (
          <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[9px] font-black rounded-full h-4 w-4 flex items-center justify-center border border-white animate-pulse">
            {badgeCount}
          </span>
        )}
      </div>
      <span>{label}</span>
    </NavLink>
  );
}

function SidebarLink({ to, label, onClick, badgeCount }) {
  const Icon = navIcons[to];
  return (
    <NavLink
      to={to}
      onClick={onClick}
      className={({ isActive }) =>
        `flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-200 font-extrabold group border relative ${isActive
          ? 'bg-[#5D34F7]/5 border-[#5D34F7]/15 text-[#5D34F7]'
          : 'bg-transparent border-transparent text-gray-600 hover:bg-slate-50 hover:text-[#5D34F7]'
        }`
      }
    >
      <div className="transition-transform duration-300 group-hover:scale-110 group-active:scale-90 relative">
        {Icon ? <Icon /> : null}
        {badgeCount > 0 && (
          <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[9px] font-black rounded-full h-4 w-4 flex items-center justify-center border border-white">
            {badgeCount}
          </span>
        )}
      </div>
      <span className="text-sm">{label}</span>
    </NavLink>
  );
}
