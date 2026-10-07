import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import maleAvatar from '../assets/male_avatar.png';
import femaleAvatar from '../assets/female_avatar.png';

const hobbyIcons = {
  'Art': '🎨',
  'Painting': '🖌️',
  'Music': '🎵',
  'Singing': '🎤',
  'Playing Instrument': '🎸',
  'Writing': '✍️',
  'Photography': '📷',
  'Dancing': '💃',
  'Acting': '🎬',
  'Cooking': '🍳',
  'Crafts': '🧵',
  'Movies': '🍿',
  'Gaming': '🎮',
  'Traveling': '✈️',
  'Comedy': '🎭',
  'Concerts': '🎪',
  'Dining Out': '🍽️',
  'Watching Sports': '🏆',
  'Board Games': '🎲',
  'Socializing': '🗣️',
  'Gym': '🏋️‍♂️',
  'Yoga': '🧘‍♂️',
  'Running': '🏃‍♂️',
  'Sports': '⚽',
  'Cycling': '🚴‍♂️',
  'Swimming': '🏊‍♂️',
  'Trekking': '🥾',
  'Martial Arts': '🥋',
  'Aerobics': '🤸‍♀️',
  'Reading': '📚',
  'Pets': '🐾',
  'Gardening': '🪴',
  'Volunteering': '🤝',
  'Blogging': '📝',
  'Astrology': '🔮',
  'Tech/Gadgets': '💻',
  'Podcasts': '🎙️'
};

const hobbyLucideIcons = {
  'Art': 'Pencil',
  'Painting': 'Paintbrush',
  'Music': 'Music',
  'Singing': 'Mic',
  'Playing Instrument': 'Keyboard',
  'Writing': 'Pencil',
  'Photography': 'Camera',
  'Dancing': 'Music',
  'Acting': 'Drama',
  'Cooking': 'Utensils',
  'Crafts': 'Scissors',
  'Movies': 'Clapperboard',
  'Gaming': 'Gamepad2',
  'Traveling': 'Plane',
  'Comedy': 'Smile',
  'Concerts': 'Music',
  'Dining Out': 'Utensils',
  'Watching Sports': 'Trophy',
  'Board Games': 'Dices',
  'Socializing': 'Users',
  'Gym': 'Dumbbell',
  'Yoga': 'Activity',
  'Running': 'Activity',
  'Sports': 'Activity',
  'Cycling': 'Bike',
  'Swimming': 'Waves',
  'Trekking': 'Mountain',
  'Martial Arts': 'Activity',
  'Aerobics': 'Activity',
  'Reading': 'BookOpen',
  'Pets': 'PawPrint',
  'Gardening': 'Flower2',
  'Volunteering': 'HeartHandshake',
  'Blogging': 'Rss',
  'Astrology': 'Sparkles',
  'Tech/Gadgets': 'Laptop',
  'Podcasts': 'Podcast'
};

const creativeHobbies = ['Art', 'Painting', 'Music', 'Singing', 'Playing Instrument', 'Writing', 'Photography', 'Dancing', 'Acting', 'Cooking', 'Crafts'];
const funHobbies = ['Movies', 'Gaming', 'Traveling', 'Comedy', 'Concerts', 'Dining Out', 'Watching Sports', 'Board Games', 'Socializing'];
const fitnessHobbies = ['Gym', 'Yoga', 'Running', 'Sports', 'Cycling', 'Swimming', 'Trekking', 'Martial Arts', 'Aerobics'];
const otherHobbies = ['Reading', 'Pets', 'Gardening', 'Volunteering', 'Blogging', 'Astrology', 'Tech/Gadgets', 'Podcasts'];

const religionIcons = {
  'Hindu': '🕉️',
  'Muslim': '☪️',
  'Christian': '✝️',
  'Sikh': '☬',
  'Buddhist': '☸️',
  'Jain': '☸️',
  'Parsi': '🔥',
  'Jewish': '🕎',
  'Bahai': '🌟',
  'Other': '✨'
};

const maritalIcons = {
  'Never Married': '💍',
  'Awaiting Divorce': '⏳',
  'Divorced': '💔',
  'Widowed': '🕊️',
  'Annulled': '❌'
};

// Custom Colorful Realistic SVG Icons
const Icons = {
  User: () => (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="7" r="4" fill="url(#user_head)" />
      <path d="M4 21C4 16.0294 8.02944 12 13 12H11C15.9706 12 20 16.0294 20 21" stroke="url(#user_body)" strokeWidth="3" strokeLinecap="round" />
      <defs>
        <linearGradient id="user_head" x1="12" y1="3" x2="12" y2="11" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FF85A2" />
          <stop offset="1" stopColor="#F72585" />
        </linearGradient>
        <linearGradient id="user_body" x1="12" y1="12" x2="12" y2="21" gradientUnits="userSpaceOnUse">
          <stop stopColor="#7209B7" />
          <stop offset="1" stopColor="#3F37C9" />
        </linearGradient>
      </defs>
    </svg>
  ),
  Calendar: () => (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="3" y="4" width="18" height="17" rx="3" fill="url(#cal_body)" />
      <path d="M3 9H21" stroke="white" strokeWidth="2" />
      <rect x="7" y="2" width="2" height="4" rx="1" fill="#FF477E" />
      <rect x="15" y="2" width="2" height="4" rx="1" fill="#FF477E" />
      <circle cx="8" cy="13" r="1.5" fill="white" />
      <circle cx="12" cy="13" r="1.5" fill="white" />
      <circle cx="16" cy="13" r="1.5" fill="white" />
      <circle cx="8" cy="17" r="1.5" fill="white" />
      <circle cx="12" cy="17" r="1.5" fill="white" />
      <circle cx="16" cy="17" r="1.5" fill="white" />
      <defs>
        <linearGradient id="cal_body" x1="12" y1="4" x2="12" y2="21" gradientUnits="userSpaceOnUse">
          <stop stopColor="#4CC9F0" />
          <stop offset="1" stopColor="#4895EF" />
        </linearGradient>
      </defs>
    </svg>
  ),
  Religion: () => (
    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2C12 2 15 6 15 9C15 10.6569 13.6569 12 12 12C10.3431 12 9 10.6569 9 9C9 6 12 2 12 2Z" fill="url(#rel_dome)" />
      <path d="M4 22V14C4 12.8954 4.89543 12 6 12H18C19.1046 12 20 12.8954 20 14V22" stroke="url(#rel_walls)" strokeWidth="2.5" />
      <path d="M12 12V22" stroke="url(#rel_walls)" strokeWidth="2" />
      <defs>
        <linearGradient id="rel_dome" x1="12" y1="2" x2="12" y2="12" gradientUnits="userSpaceOnUse">
          <stop stopColor="#F9C74F" />
          <stop offset="1" stopColor="#F3722C" />
        </linearGradient>
        <linearGradient id="rel_walls" x1="12" y1="12" x2="12" y2="22" gradientUnits="userSpaceOnUse">
          <stop stopColor="#4D908E" />
          <stop offset="1" stopColor="#277DA1" />
        </linearGradient>
      </defs>
    </svg>
  ),
  Mail: () => (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="3" y="5" width="18" height="14" rx="3" fill="url(#mail_bg)" />
      <path d="M3 7L12 13L21 7" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <defs>
        <linearGradient id="mail_bg" x1="12" y1="5" x2="12" y2="19" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FF9F1C" />
          <stop offset="1" stopColor="#FF6B6B" />
        </linearGradient>
      </defs>
    </svg>
  ),
  Phone: () => (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M20 15.5C18.8 15.5 17.6 15.3 16.5 14.9C16.1 14.8 15.7 14.9 15.4 15.2L13.2 17.9C10.4 16.4 8 14 6.5 11.2L9.1 8.9C9.4 8.6 9.5 8.2 9.4 7.8C9 6.7 8.8 5.5 8.8 4.3C8.8 3.6 8.2 3 7.5 3H4.3C3.6 3 3 3.6 3 4.3C3 13.5 10.5 21 19.7 21C20.4 21 21 20.4 21 19.7V16.5C21 15.8 20.4 15.5 20 15.5Z" fill="url(#phone_grad)" />
      <defs>
        <linearGradient id="phone_grad" x1="12" y1="3" x2="12" y2="21" gradientUnits="userSpaceOnUse">
          <stop stopColor="#2EC4B6" />
          <stop offset="1" stopColor="#011627" />
        </linearGradient>
      </defs>
    </svg>
  ),
  Map: () => (
    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2C8.13 2 5 5.13 5 9C5 14.25 12 22 12 22C12 22 19 14.25 19 9C19 5.13 15.87 2 12 2ZM12 11.5C10.62 11.5 9.5 10.38 9.5 9C9.5 7.62 10.62 6.5 12 6.5C13.38 6.5 14.5 7.62 14.5 9C14.5 10.38 13.38 11.5 12 11.5Z" fill="url(#map_grad)" />
      <defs>
        <linearGradient id="map_grad" x1="12" y1="2" x2="12" y2="22" gradientUnits="userSpaceOnUse">
          <stop stopColor="#E63946" />
          <stop offset="1" stopColor="#D62828" />
        </linearGradient>
      </defs>
    </svg>
  ),
  Ring: () => (
    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="14" r="7" stroke="url(#ring_gold)" strokeWidth="3" />
      <path d="M12 7L9 3L12 1L15 3L12 7Z" fill="url(#ring_diamond)" />
      <defs>
        <linearGradient id="ring_gold" x1="12" y1="7" x2="12" y2="21" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FFE066" />
          <stop offset="1" stopColor="#F5B041" />
        </linearGradient>
        <linearGradient id="ring_diamond" x1="12" y1="1" x2="12" y2="7" gradientUnits="userSpaceOnUse">
          <stop stopColor="#E0F7FA" />
          <stop offset="1" stopColor="#00E5FF" />
        </linearGradient>
      </defs>
    </svg>
  ),
  Graduation: () => (
    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 3L2 8L12 13L22 8L12 3Z" fill="url(#cap_top)" />
      <path d="M5 11V16C5 17.5 8.1 19 12 19C15.9 19 19 17.5 19 16V11" stroke="url(#cap_bottom)" strokeWidth="2.5" />
      <path d="M20 9V17" stroke="#F5B041" strokeWidth="2" strokeLinecap="round" />
      <circle cx="20" cy="17" r="1.5" fill="#F5B041" />
      <defs>
        <linearGradient id="cap_top" x1="12" y1="3" x2="12" y2="13" gradientUnits="userSpaceOnUse">
          <stop stopColor="#3A0CA3" />
          <stop offset="1" stopColor="#7209B7" />
        </linearGradient>
        <linearGradient id="cap_bottom" x1="12" y1="11" x2="12" y2="19" gradientUnits="userSpaceOnUse">
          <stop stopColor="#3F37C9" />
          <stop offset="1" stopColor="#4895EF" />
        </linearGradient>
      </defs>
    </svg>
  ),
  Briefcase: () => (
    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="3" y="6" width="18" height="14" rx="2" fill="url(#case_body)" />
      <path d="M9 6V4C9 3.44772 9.44772 3 10 3H14C14.5523 3 15 3.44772 15 4V6" stroke="url(#case_handle)" strokeWidth="2" />
      <rect x="11" y="12" width="2" height="3" rx="0.5" fill="#FFE066" />
      <defs>
        <linearGradient id="case_body" x1="12" y1="6" x2="12" y2="20" gradientUnits="userSpaceOnUse">
          <stop stopColor="#833AB4" />
          <stop offset="1" stopColor="#FD1D1D" />
        </linearGradient>
        <linearGradient id="case_handle" x1="12" y1="3" x2="12" y2="6" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FD1D1D" />
          <stop offset="1" stopColor="#F56040" />
        </linearGradient>
      </defs>
    </svg>
  ),
  Camera: () => (
    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="3" y="6" width="18" height="13" rx="2.5" fill="url(#cam_body)" />
      <path d="M9 6L10 3.5C10.2 3 10.7 2.5 11.2 2.5H12.8C13.3 2.5 13.8 3 14 3.5L15 6H9Z" fill="url(#cam_body)" />
      <circle cx="12" cy="12.5" r="4" fill="white" />
      <circle cx="12" cy="12.5" r="2.5" fill="#2EC4B6" />
      <circle cx="19" cy="8.5" r="1" fill="#FF477E" />
      <defs>
        <linearGradient id="cam_body" x1="12" y1="2.5" x2="12" y2="19" gradientUnits="userSpaceOnUse">
          <stop stopColor="#2EC4B6" />
          <stop offset="1" stopColor="#011627" />
        </linearGradient>
      </defs>
    </svg>
  ),
  Family: () => (
    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 3L2 12H5V20C5 20.5523 5.44772 21 6 21H18C18.5523 21 19 20.5523 19 20V12H22L12 3Z" fill="url(#house_roof)" />
      <rect x="10" y="14" width="4" height="7" fill="#F9C74F" />
      <defs>
        <linearGradient id="house_roof" x1="12" y1="3" x2="12" y2="21" gradientUnits="userSpaceOnUse">
          <stop stopColor="#F3722C" />
          <stop offset="1" stopColor="#F9C74F" />
        </linearGradient>
      </defs>
    </svg>
  ),
  Crown: () => (
    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M2 18L5 8L10 13L12 5L14 13L19 8L22 18H2Z" fill="url(#crown_gold)" />
      <circle cx="2" cy="18" r="1.5" fill="#E63946" />
      <circle cx="5" cy="8" r="1.5" fill="#E63946" />
      <circle cx="12" cy="5" r="1.5" fill="#E63946" />
      <circle cx="19" cy="8" r="1.5" fill="#E63946" />
      <circle cx="22" cy="18" r="1.5" fill="#E63946" />
      <defs>
        <linearGradient id="crown_gold" x1="12" y1="5" x2="12" y2="18" gradientUnits="userSpaceOnUse">
          <stop stopColor="#F9C74F" />
          <stop offset="1" stopColor="#F3722C" />
        </linearGradient>
      </defs>
    </svg>
  ),
  Mother: () => (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="7" r="4" fill="url(#mom_head)" />
      <path d="M4 21C4 16.0294 8.02944 12 13 12H11C15.9706 12 20 16.0294 20 21" stroke="url(#mom_body)" strokeWidth="3" strokeLinecap="round" />
      <defs>
        <linearGradient id="mom_head" x1="12" y1="3" x2="12" y2="11" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FF9F1C" />
          <stop offset="1" stopColor="#FF6B6B" />
        </linearGradient>
        <linearGradient id="mom_body" x1="12" y1="12" x2="12" y2="21" gradientUnits="userSpaceOnUse">
          <stop stopColor="#F72585" />
          <stop offset="1" stopColor="#B5179E" />
        </linearGradient>
      </defs>
    </svg>
  ),
  Father: () => (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="7" r="4" fill="url(#dad_head)" />
      <path d="M4 21C4 16.0294 8.02944 12 13 12H11C15.9706 12 20 16.0294 20 21" stroke="url(#dad_body)" strokeWidth="3" strokeLinecap="round" />
      <defs>
        <linearGradient id="dad_head" x1="12" y1="3" x2="12" y2="11" gradientUnits="userSpaceOnUse">
          <stop stopColor="#8ECAE6" />
          <stop offset="1" stopColor="#219EBC" />
        </linearGradient>
        <linearGradient id="dad_body" x1="12" y1="12" x2="12" y2="21" gradientUnits="userSpaceOnUse">
          <stop stopColor="#023047" />
          <stop offset="1" stopColor="#4895EF" />
        </linearGradient>
      </defs>
    </svg>
  ),
  Sister: () => (
    <svg className="w-5 h-5 animate-bounce-slow" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="7" r="3" fill="#FF85A2" />
      <path d="M6 20C6 16.5 9 14 12 14C15 14 18 16.5 18 20" stroke="#FF85A2" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  ),
  Brother: () => (
    <svg className="w-5 h-5 animate-bounce-slow" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="7" r="3" fill="#4895EF" />
      <path d="M6 20C6 16.5 9 14 12 14C15 14 18 16.5 18 20" stroke="#4895EF" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  )
};

import api, { getPhotoUrl } from '../api/axios';
import { LocationService } from '../api/locationService';
import { COUNTRY_PHONE_STANDARDS, validatePhoneNumber } from '../api/phoneStandards';
import signupBg from '../assets/signup_bg.png';
import navbarLogo from '../assets/navbar_logo.png';
import navbarName from '../assets/navbar_name.png';
import brandLogo from '../assets/logo_transparent.png';

import hinduImg from '../assets/hindu.png';
import muslimImg from '../assets/muslim.png';
import christianImg from '../assets/christian.png';
import buddhistImg from '../assets/budhist.png';
import jainImg from '../assets/jain.png';
import sikhImg from '../assets/sikh.png';
import jewishImg from '../assets/jewish.png';
import parsiImg from '../assets/pharsi.png';
import noReligionImg from '../assets/no-reli.png';
import spiritualImg from '../assets/spiritual.png';

const religionImages = {
  'Hindu': hinduImg,
  'Muslim': muslimImg,
  'Christian': christianImg,
  'Buddhist': buddhistImg,
  'Jain': jainImg,
  'Sikh': sikhImg,
  'Jewish': jewishImg,
  'Parsi': parsiImg,
  'No Religion': noReligionImg,
  'Spiritual - not religious': spiritualImg
};

import {
  ChevronLeft, UserPlus, User, Calendar, Users, Building,
  Mail, Phone, Camera, Contact, ChevronDown, Landmark,
  Map, Accessibility, Activity, ArrowUpDown, Utensils,
  GraduationCap, School, Briefcase, Banknote, Badge, PencilLine, Trash2, Plus
} from 'lucide-react';
import * as LucideIcons from 'lucide-react';

export default function Signup() {
  const [isSignedUp, setIsSignedUp] = useState(localStorage.getItem('token') ? true : false);
  const [isLoadingProfile, setIsLoadingProfile] = useState(localStorage.getItem('token') ? true : false);
  const [step, setStep] = useState(1);
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const contentRef = useRef(null);

  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.scrollTop = 0;
    }
  }, [step]);

  // Form State
  const [profileFor, setProfileFor] = useState(() => sessionStorage.getItem('prefill_profileFor') || '');
  const [fullName, setFullName] = useState('');
  const [dob, setDob] = useState('');
  const [gender, setGender] = useState(() => sessionStorage.getItem('prefill_gender') || '');
  const [religion, setReligion] = useState(() => sessionStorage.getItem('prefill_religion') || '');
  const [caste, setCaste] = useState('');
  const [community, setCommunity] = useState('');
  const [city, setCity] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [stateLoc, setStateLoc] = useState('');
  const [cityLoc, setCityLoc] = useState('');
  const [locationSearchQuery, setLocationSearchQuery] = useState('');
  const [locationSearchResults, setLocationSearchResults] = useState([]);
  const [isSearchingLocation, setIsSearchingLocation] = useState(false);
  const [subCommunity, setSubCommunity] = useState('');
  const [maritalStatus, setMaritalStatus] = useState('');
  const [height, setHeight] = useState('');
  const [diet, setDiet] = useState('');
  const [qualification, setQualification] = useState('');
  const [college, setCollege] = useState('');
  const [income, setIncome] = useState('');
  const [workSector, setWorkSector] = useState('');
  const [workRole, setWorkRole] = useState('');
  const [company, setCompany] = useState('');
  const [bio, setBio] = useState('');
  const [photos, setPhotos] = useState([]);
  const [newPhotoUrl, setNewPhotoUrl] = useState('');

  const uploadFiles = async (files) => {
    const formData = new FormData();
    files.forEach(file => {
      formData.append('media', file);
    });
    const response = await api.post('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data.urls.map(url => url.replace('/media_uploads/', '').replace(/^\//, ''));
  };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;
    setIsSaving(true);
    setError('');
    try {
      const uploadedNames = await uploadFiles(files);
      setPhotos(prev => [...prev, ...uploadedNames]);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to upload images.');
    } finally {
      setIsSaving(false);
    }
  };

  const [religionDropdownOpen, setReligionDropdownOpen] = useState(false);
  const religionDropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (religionDropdownRef.current && !religionDropdownRef.current.contains(event.target)) {
        setReligionDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // New Fields
  const [hobbies, setHobbies] = useState([]);
  const [motherStatus, setMotherStatus] = useState('');
  const [fatherStatus, setFatherStatus] = useState('');
  const [sistersCount, setSistersCount] = useState(0);
  const [brothersCount, setBrothersCount] = useState(0);
  const [liveWithFamily, setLiveWithFamily] = useState(null);
  const [familyFinancialStatus, setFamilyFinancialStatus] = useState('');
  const [familyLocation, setFamilyLocation] = useState('');

  // Partner Preferences States
  const [prefAgeMin, setPrefAgeMin] = useState(20);
  const [prefAgeMax, setPrefAgeMax] = useState(35);
  const [prefReligions, setPrefReligions] = useState([]);
  const [prefCastes, setPrefCastes] = useState([]);
  const [prefCommunities, setPrefCommunities] = useState([]);
  const [prefMaritalStatuses, setPrefMaritalStatuses] = useState([]);
  const [prefHeightMin, setPrefHeightMin] = useState('5\'0" (152 cm)');
  const [prefHeightMax, setPrefHeightMax] = useState('6\'0" (182 cm)');
  const [prefDiets, setPrefDiets] = useState([]);
  const [prefEducations, setPrefEducations] = useState([]);
  const [prefProfessions, setPrefProfessions] = useState([]);
  const [prefIncomes, setPrefIncomes] = useState([]);
  const [showAllPrefCastes, setShowAllPrefCastes] = useState(false);
  const [showAllPrefCommunities, setShowAllPrefCommunities] = useState(false);
  const [showAllPrefEducations, setShowAllPrefEducations] = useState(false);
  const [showAllPrefProfessions, setShowAllPrefProfessions] = useState(false);

  // Premium State
  const [selectedPremiumPlan, setSelectedPremiumPlan] = useState(null);
  const [showRazorpay, setShowRazorpay] = useState(false);
  const [plans, setPlans] = useState([]);

  // Verification Documents
  const [idProofDoc, setIdProofDoc] = useState('');
  const [selfieDoc, setSelfieDoc] = useState('');
  const [isUploadingID, setIsUploadingID] = useState(false);
  const [isUploadingSelfie, setIsUploadingSelfie] = useState(false);

  const handleDocUpload = async (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    if (type === 'id') setIsUploadingID(true);
    else setIsUploadingSelfie(true);

    setError('');
    try {
      const uploadedNames = await uploadFiles([file]);
      if (uploadedNames && uploadedNames.length > 0) {
        if (type === 'id') setIdProofDoc(uploadedNames[0]);
        else setSelfieDoc(uploadedNames[0]);
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || `Failed to upload ${type === 'id' ? 'ID Proof' : 'Selfie'}.`);
    } finally {
      if (type === 'id') setIsUploadingID(false);
      else setIsUploadingSelfie(false);
    }
  };


  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const response = await api.get('/public/plans');
        setPlans(response.data || []);
      } catch (err) {
        console.error("Failed to fetch subscription plans:", err);
      }
    };
    fetchPlans();
  }, []);

  // OTP States
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [resendTimer, setResendTimer] = useState(0);
  const [countryCode, setCountryCode] = useState('+91');

  const navigate = useNavigate();

  useEffect(() => {
    let timer;
    if (resendTimer > 0) {
      timer = setTimeout(() => setResendTimer(prev => prev - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [resendTimer]);

  const sendOtp = async () => {
    if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) {
      setError('Please enter a valid email address.');
      return;
    }
    setIsSendingOtp(true);
    setError('');
    try {
      await api.post('/auth/send-email-otp', { email: email.trim() });
      setIsOtpSent(true);
      setResendTimer(30);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send OTP. Please try again.');
    } finally {
      setIsSendingOtp(false);
    }
  };

  const verifyOtp = async () => {
    if (!otpCode.trim()) {
      setError('Please enter the OTP code.');
      return;
    }
    setIsVerifyingOtp(true);
    setError('');
    try {
      await api.post('/auth/verify-email-otp', { email: email.trim(), otp: otpCode.trim() });
      setIsEmailVerified(true);
      setIsOtpSent(false);
      setOtpCode('');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid OTP. Please try again.');
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  useEffect(() => {
    const fetchExistingProfile = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        setIsSignedUp(true);
        try {
          const response = await api.get('/users/profile');
          const data = response.data;
          if (data) {
            setEmail(data.email || '');
            if (data.phone) {
              const cleanedPhone = data.phone.trim();
              const match = cleanedPhone.match(/^(\+\d+)\s+(.*)$/);
              if (match) {
                setCountryCode(match[1]);
                setPhone(match[2]);
              } else {
                setPhone(cleanedPhone);
              }
            }
            if (data.email) {
              setIsEmailVerified(false);
            }
            if (data.profile) {
              setProfileFor(data.profile.profileFor || '');
              setFullName(data.profile.name || '');
              if (data.profile.dob) {
                const dateObj = new Date(data.profile.dob);
                if (!isNaN(dateObj.getTime())) {
                  const year = dateObj.getFullYear();
                  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
                  const day = String(dateObj.getDate()).padStart(2, '0');
                  setDob(`${year}-${month}-${day}`);
                }
              }
              setGender(data.profile.gender || '');
              setReligion(data.profile.religion || '');
              setCaste(data.profile.caste || '');
              setCity(data.profile.city || '');
              setStateLoc(data.profile.state || '');
              setCityLoc(data.profile.city || '');
              setSubCommunity(data.profile.subCommunity || '');
              setMaritalStatus(data.profile.maritalStatus || '');
              setHeight(data.profile.height || '');
              setDiet(data.profile.diet || '');
              setQualification(data.profile.education || '');
              setCollege(data.profile.college || '');
              setIncome(data.profile.income || '');
              setWorkSector(data.profile.workSector || '');
              setWorkRole(data.profile.workRole || '');
              setCompany(data.profile.companyName || '');
              setBio(data.profile.bio || '');
              setPhotos(data.profile.photos || []);

              setHobbies(data.profile.hobbies || []);
              setMotherStatus(data.profile.motherStatus || '');
              setFatherStatus(data.profile.fatherStatus || '');
              setSistersCount(data.profile.sistersCount || 0);
              setBrothersCount(data.profile.brothersCount || 0);
              setLiveWithFamily(data.profile.liveWithFamily !== undefined ? data.profile.liveWithFamily : null);
              setFamilyFinancialStatus(data.profile.familyFinancialStatus || '');
              if (data.profile.signupStep) {
                setStep(data.profile.signupStep);
              }
            }
            if (data.preferences) {
              if (data.preferences.ageRange && data.preferences.ageRange.length === 2) {
                setPrefAgeMin(data.preferences.ageRange[0]);
                setPrefAgeMax(data.preferences.ageRange[1]);
              }
              setPrefReligions(data.preferences.religion || []);
              setPrefCastes(data.preferences.caste || []);
              setPrefCommunities(data.preferences.languages || []);
              setPrefMaritalStatuses(data.preferences.maritalStatus || []);
              setPrefHeightMin(data.preferences.height?.[0] || '5\'0" (152 cm)');
              setPrefHeightMax(data.preferences.height?.[1] || '6\'0" (182 cm)');
              setPrefDiets(data.preferences.diet || []);
              setPrefEducations(data.preferences.education || []);
              setPrefProfessions(data.preferences.profession || []);
              setPrefIncomes(data.preferences.income || []);
            }
            if (data.premiumMembership) {
              setSelectedPremiumPlan(data.premiumMembership.planType || null);
            }
          }
        } catch (err) {
          console.error("Failed to load profile details for prefilling:", err);
          if (err.response && (err.response.status === 401 || err.response.status === 500)) {
            localStorage.removeItem('token');
            setIsSignedUp(false);
          }
        } finally {
          setIsLoadingProfile(false);
        }
      } else {
        setIsLoadingProfile(false);
      }
    };
    fetchExistingProfile();
  }, []);

  const generateBio = () => {
    const subject = profileFor === 'Myself' ? 'I am' : `This profile is for my ${profileFor.replace('My ', '').toLowerCase()}, who is`;
    const pronounSubject = profileFor === 'Myself' ? 'I have' : (gender === 'Male' ? 'He has' : 'She has');
    const possessivePronoun = profileFor === 'Myself' ? 'my' : (gender === 'Male' ? 'his' : 'her');
    const pronounBe = profileFor === 'Myself' ? 'I am' : (gender === 'Male' ? 'He is' : 'She is');

    let bioParts = [];

    // Part 1: Intro (Name, Religion, Caste, Location)
    let intro = `${subject} a ${gender ? gender.toLowerCase() : 'person'}`;
    if (religion || caste) {
      intro += ` belonging to the ${religion || ''} ${caste ? '(' + caste + ')' : ''} community`;
    }
    if (cityLoc || stateLoc) {
      intro += ` currently living in ${cityLoc || ''}${cityLoc && stateLoc ? ', ' : ''}${stateLoc || ''}`;
    }
    intro += '.';
    bioParts.push(intro);

    // Part 2: Education & Work
    let educationWork = '';
    if (qualification || college) {
      educationWork += `${pronounSubject} completed ${possessivePronoun} education with a ${qualification || 'degree'}`;
      if (college) {
        educationWork += ` from ${college}`;
      }
    }
    if (workRole || company) {
      if (educationWork) {
        educationWork += `, and is now working as a ${workRole || 'professional'}`;
      } else {
        educationWork += `${pronounBe} working as a ${workRole || 'professional'}`;
      }
      if (company) {
        educationWork += ` at ${company}`;
      }
    }
    if (income) {
      educationWork += ` with an annual income of ${income}`;
    }
    if (educationWork) {
      educationWork += '.';
      bioParts.push(educationWork);
    }

    // Part 3: Lifestyle & Diet
    let lifestyle = '';
    if (maritalStatus || height || diet) {
      lifestyle += `${pronounBe} ${maritalStatus ? maritalStatus.toLowerCase() : ''}`;
      if (height) {
        lifestyle += `, around ${height} tall`;
      }
      if (diet) {
        lifestyle += `, and follows a ${diet.toLowerCase()} diet`;
      }
      lifestyle += '.';
      bioParts.push(lifestyle);
    }

    return bioParts.join(' ');
  };

  useEffect(() => {
    if (step === 9 && !bio.trim()) {
      setBio(generateBio());
    }
  }, [step]);

  const handleNext = async (bypassRazorpay = false) => {
    const isSkipValidation = bypassRazorpay?.skipValidation === true;
    setError('');

    if (step === 14 && selectedPremiumPlan && !showRazorpay && !bypassRazorpay) {
      setShowRazorpay(true);
      return;
    }

    // Step-wise Mandatory Field Validation
    if (step === 1) {
      if (!profileFor) return setError('Please select who the profile is for.');
    }
    if (step === 2) {
      if (!religion) return setError('Please select religion.');
      if (!caste) return setError('Please select community/caste.');
      if (!subCommunity) return setError('Please select sub-community.');
    }
    if (step === 3) {
      if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) return setError('Please enter a valid email.');
      if (!isEmailVerified) return setError('Please verify your email address to proceed.');
      if (!phone.trim()) return setError('Please enter phone number.');
      const phoneErr = validatePhoneNumber(phone, countryCode);
      if (phoneErr) return setError(phoneErr);
    }
    if (step === 4) {
      if (!photos || photos.length === 0) return setError('Please add at least one photo.');
    }
    if (step === 5) {
      if (!stateLoc) return setError('Please select state.');
      if (!cityLoc) return setError('Please select city.');
    }
    if (step === 6) {
      if (!maritalStatus) return setError('Please select marital status.');
      if (!height) return setError('Please select height.');
      if (!diet) return setError('Please select diet.');
    }
    if (step === 7) {
      if (!qualification) return setError('Please select qualification.');
      if (!college.trim()) return setError('Please enter college name.');
    }
    if (step === 8 && !isSkipValidation) {
      if (!income) return setError('Please select annual income.');
      if (!workSector) return setError('Please select work sector.');
      if (!workRole) return setError('Please select work role.');
      if (!company.trim()) return setError('Please enter company name.');
    }
    if (step === 9) {
      if (!fullName.trim()) return setError('Please enter full name.');
      if (!dob) return setError('Please select date of birth.');
      if (!gender) return setError('Please select a gender.');
      const birthDate = new Date(dob);
      const age = new Date().getFullYear() - birthDate.getFullYear();
      const requiredAge = gender === 'Male' ? 21 : 18;
      if (age < requiredAge) {
        return setError(`Profile owner must be at least ${requiredAge} years old.`);
      }
      if (!bio.trim()) return setError('Please write about yourself.');
    }
    if (step === 10) {
      if (!hobbies || hobbies.length === 0) return setError('Please select at least one hobby.');
    }
    if (step === 11 && !isSkipValidation) {
      if (!motherStatus) return setError('Please select mother status.');
      if (!fatherStatus) return setError('Please select father status.');
    }
    if (step === 12) {
      if (liveWithFamily === null || liveWithFamily === undefined) return setError('Please specify if you live with family.');
      if (liveWithFamily === false && !familyLocation.trim()) return setError("Please enter where the family lives.");
      if (!familyFinancialStatus) return setError('Please select family financial status.');
    }
    if (step === 13) {
      if (!prefReligions || prefReligions.length === 0) return setError('Please select preferred religions.');
      if (!prefCastes || prefCastes.length === 0) return setError('Please select preferred castes.');
      if (!prefCommunities || prefCommunities.length === 0) return setError('Please select preferred mother tongue(s).');
      if (!prefMaritalStatuses || prefMaritalStatuses.length === 0) return setError('Please select preferred marital statuses.');
      if (!prefHeightMin || !prefHeightMax) return setError('Please select preferred height range.');
      if (!prefDiets || prefDiets.length === 0) return setError('Please select preferred diets.');
      if (!prefEducations || prefEducations.length === 0) return setError('Please select preferred educations.');
      if (!prefProfessions || prefProfessions.length === 0) return setError('Please select preferred professions.');
      if (!prefIncomes || prefIncomes.length === 0) return setError('Please select preferred incomes.');
    }
    if (step === 15 && !isSkipValidation) {
      if (!idProofDoc) return setError('Please upload your Photo ID proof.');
      if (!selfieDoc) return setError('Please upload your recent Selfie.');
    }

    const nextStep = step + 1;
    let generatedBio = '';
    if (nextStep === 9 && !bio.trim()) {
      generatedBio = generateBio();
      setBio(generatedBio);
    }
    setError('');
    setIsSaving(true);

    try {
      let dobISO = '';
      if (dob) {
        const d = new Date(dob);
        if (!isNaN(d.getTime())) {
          dobISO = d.toISOString();
        }
      }

      const nameParts = fullName.trim().split(/\s+/);
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';

      let premiumPayload = undefined;
      if (selectedPremiumPlan) {
        const activePlanObj = plans.find(p => p.name === selectedPremiumPlan);
        const durationDays = activePlanObj ? activePlanObj.durationDays : 90;
        const expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + durationDays);
        premiumPayload = {
          isPremium: true,
          planType: selectedPremiumPlan,
          expiryDate: expiryDate.toISOString()
        };
      }

      const payload = {
        email: email.trim(),
        phone: `${countryCode} ${phone.trim()}`,
        idProofDoc: idProofDoc || undefined,
        selfieDoc: selfieDoc || undefined,
        profile: {
          name: fullName.trim(),
          firstName,
          lastName,
          dob: dobISO || undefined,
          gender,
          religion,
          caste,
          community,
          city: cityLoc || city || '',
          state: stateLoc || '',
          location: `${cityLoc || city || ''}, ${stateLoc || ''}`.replace(/^,\s*|,\s*$/, ''),
          country: 'India',
          profileFor,
          subCommunity,
          maritalStatus,
          height,
          diet,
          education: qualification,
          college,
          income,
          workSector,
          workRole,
          companyName: company,
          bio: generatedBio || bio,
          photos,
          hobbies,
          motherStatus,
          fatherStatus,
          sistersCount: Number(sistersCount) || 0,
          brothersCount: Number(brothersCount) || 0,
          liveWithFamily: liveWithFamily === true ? true : liveWithFamily === false ? false : undefined,
          familyLocation: liveWithFamily === false ? familyLocation : undefined,
          familyFinancialStatus,
          signupStep: step < 15 ? nextStep : 15,
          is_onboarding_complete: step === 15
        },
        preferences: {
          ageRange: [Number(prefAgeMin) || 20, Number(prefAgeMax) || 35],
          gender: [gender === 'Male' ? 'Female' : 'Male'],
          religion: prefReligions,
          caste: prefCastes,
          languages: prefCommunities,
          height: [prefHeightMin, prefHeightMax],
          education: prefEducations,
          profession: prefProfessions,
          income: prefIncomes,
          location: [],
          maritalStatus: prefMaritalStatuses,
          diet: prefDiets
        },
        ...(premiumPayload && { premiumMembership: premiumPayload })
      };

      const base64Payload = btoa(unescape(encodeURIComponent(JSON.stringify(payload))));
      const response = await api.post('/users/profile', { encodedPayload: base64Payload });
      if (response.data) {
        if (step < 15) {
          setStep(nextStep);
        } else {
          sessionStorage.removeItem('prefill_profileFor');
          sessionStorage.removeItem('prefill_gender');
          sessionStorage.removeItem('prefill_religion');
          navigate('/home');
        }
      }
    } catch (err) {
      const rawError = err.response?.data?.message || err.message || '';
      if (rawError.includes('validation failed') || rawError.includes('validation') || rawError.includes('gender')) {
        setError('Please fill in and select all the required fields before continuing.');
      } else {
        setError(rawError || 'Failed to save progress.');
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSimulateSignup = async () => {
    setIsSaving(true);
    setError('');
    try {
      // Seed the database to ensure test accounts are present
      try {
        await api.post('/auth/seed');
      } catch (seedErr) {
        console.warn("Seed endpoint might have already run or failed, trying login directly:", seedErr);
      }

      // Log in as priya@example.com (or create a new user, but Priya Patel matches the mock user object requested)
      const loginResponse = await api.post('/auth/login', {
        email: 'priya@example.com',
        password: 'password123'
      });

      if (loginResponse.data.token) {
        localStorage.setItem('token', loginResponse.data.token);
        setIsSignedUp(true);
        // Reload details
        const profileResponse = await api.get('/users/profile');
        const data = profileResponse.data;
        if (data) {
          setEmail(data.email || '');
          setPhone(data.phone || '');
          if (data.email) {
            setIsEmailVerified(true);
          }
          if (data.profile) {
            setProfileFor(data.profile.profileFor || '');
            setFullName(data.profile.name || '');
            if (data.profile.dob) {
              const dateObj = new Date(data.profile.dob);
              if (!isNaN(dateObj.getTime())) {
                const year = dateObj.getFullYear();
                const month = String(dateObj.getMonth() + 1).padStart(2, '0');
                const day = String(dateObj.getDate()).padStart(2, '0');
                setDob(`${year}-${month}-${day}`);
              }
            }
            setGender(data.profile.gender || '');
            setReligion(data.profile.religion || '');
            setCaste(data.profile.caste || '');
            setCity(data.profile.city || '');
            setStateLoc(data.profile.state || '');
            setCityLoc(data.profile.city || '');
            setSubCommunity(data.profile.subCommunity || '');
            setMaritalStatus(data.profile.maritalStatus || '');
            setHeight(data.profile.height || '');
            setDiet(data.profile.diet || '');
            setQualification(data.profile.education || '');
            setCollege(data.profile.college || '');
            setIncome(data.profile.income || '');
            setWorkSector(data.profile.workSector || '');
            setWorkRole(data.profile.workRole || '');
            setCompany(data.profile.companyName || '');
            setBio(data.profile.bio || '');
            setPhotos(data.profile.photos || []);

            setHobbies(data.profile.hobbies || []);
            setMotherStatus(data.profile.motherStatus || '');
            setFatherStatus(data.profile.fatherStatus || '');
            setSistersCount(data.profile.sistersCount || 0);
            setBrothersCount(data.profile.brothersCount || 0);
            setLiveWithFamily(data.profile.liveWithFamily !== undefined ? data.profile.liveWithFamily : null);
            setFamilyFinancialStatus(data.profile.familyFinancialStatus || '');
            setFamilyLocation(data.profile.familyLocation || '');
            if (data.profile.signupStep) {
              setStep(data.profile.signupStep);
            }
          }
          if (data.preferences) {
            if (data.preferences.ageRange && data.preferences.ageRange.length === 2) {
              setPrefAgeMin(data.preferences.ageRange[0]);
              setPrefAgeMax(data.preferences.ageRange[1]);
            }
            setPrefReligions(data.preferences.religion || []);
            setPrefCastes(data.preferences.caste || []);
            setPrefMaritalStatuses(data.preferences.maritalStatus || []);
            setPrefHeightMin(data.preferences.height?.[0] || '5\'0" (152 cm)');
            setPrefHeightMax(data.preferences.height?.[1] || '6\'0" (182 cm)');
            setPrefDiets(data.preferences.diet || []);
            setPrefEducations(data.preferences.education || []);
            setPrefProfessions(data.preferences.profession || []);
            setPrefIncomes(data.preferences.income || []);
          }
          if (data.premiumMembership) {
            setSelectedPremiumPlan(data.premiumMembership.planType || null);
          }
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Simulation failed to log in.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoadingProfile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-100 via-gray-50 to-slate-200 flex flex-col items-center justify-center gap-5">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#5D34F7] to-[#4024DB] flex items-center justify-center shadow-lg shadow-[#5D34F7]/30 animate-pulse">
          <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </div>
        <div className="flex flex-col items-center gap-1">
          <p className="text-slate-700 font-bold text-base">Resuming your profile...</p>
          <p className="text-slate-400 text-sm">Loading where you left off</p>
        </div>
        <div className="flex gap-1.5">
          <div className="w-2 h-2 rounded-full bg-[#5D34F7] animate-bounce" style={{ animationDelay: '0ms' }}></div>
          <div className="w-2 h-2 rounded-full bg-[#5D34F7] animate-bounce" style={{ animationDelay: '150ms' }}></div>
          <div className="w-2 h-2 rounded-full bg-[#5D34F7] animate-bounce" style={{ animationDelay: '300ms' }}></div>
        </div>
      </div>
    );
  }

  if (!isSignedUp) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 text-center">
        <h1 className="text-3xl font-bold text-[#5D34F7] mb-4">Signup Form</h1>
        <p className="text-gray-600 mb-8 max-w-sm">This is where the user signs up. Click below to simulate logging in as Priya Patel and editing her profile, or register a new user from the Login page.</p>

        {error && (
          <div className="bg-red-50 text-red-500 p-3 rounded-xl mb-6 text-sm max-w-sm">
            {error}
          </div>
        )}

        <button
          onClick={handleSimulateSignup}
          disabled={isSaving}
          className="bg-[#5D34F7] text-white px-8 py-3.5 rounded-2xl font-semibold hover:bg-[#4024DB] transition disabled:opacity-50"
        >
          {isSaving ? 'Logging in Priya...' : 'Simulate Priya Patel Login'}
        </button>
      </div>
    );
  }

  const profileOptions = [
    'Myself', 'My Son', 'My Daughter',
    'My Brother', 'My Sister', 'My Friend',
    'My Relative'
  ];

  const renderStepIcon = (icon) => (
    <div className="w-9 h-9 bg-gradient-to-br from-[#5D34F7] to-[#4024DB] text-white rounded-lg flex items-center justify-center mb-3 shadow-md shadow-[#5D34F7]/20 transform hover:scale-105 transition-all duration-300">
      {icon}
    </div>
  );

  const getPillClass = (isSelected) =>
    `px-3 py-2 rounded-lg border text-xs font-bold transition-all duration-200 cursor-pointer shadow-sm ${isSelected
      ? 'border-transparent bg-gradient-to-r from-[#5D34F7] to-[#4024DB] text-white shadow-md shadow-[#5D34F7]/25 scale-[1.02]'
      : 'border-gray-200 bg-white/90 text-gray-700 hover:border-[#5D34F7]/40 hover:bg-[#5D34F7]/5/10'
    }`;

  const renderHobbyIcon = (hobbyName, colorClass) => {
    const iconName = hobbyLucideIcons[hobbyName];
    const IconComponent = LucideIcons[iconName];
    if (IconComponent) {
      return <IconComponent className={`w-4 h-4 ${colorClass}`} />;
    }
    return <span className="text-sm">{hobbyIcons[hobbyName]}</span>;
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{
        __html: `
        @keyframes smoothSlideUp {
          0% { opacity: 0; transform: translateY(22px) scale(0.97); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes fadeInBlur {
          0% { opacity: 0; filter: blur(4px); }
          100% { opacity: 1; filter: blur(0); }
        }
        @keyframes floatUp {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-18px); }
        }
        @keyframes floatDown {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(18px); }
        }
        @keyframes pulseRing {
          0% { box-shadow: 0 0 0 0 rgba(93,52,247,0.35); }
          70% { box-shadow: 0 0 0 12px rgba(93,52,247,0); }
          100% { box-shadow: 0 0 0 0 rgba(93,52,247,0); }
        }
        .smooth-step-transition {
          animation: smoothSlideUp 0.45s cubic-bezier(0.16, 1, 0.3, 1) both;
        }
        .animate-float-up { animation: floatUp 7s ease-in-out infinite; }
        .animate-float-down { animation: floatDown 8s ease-in-out infinite; }
        .animate-fade-in-blur { animation: fadeInBlur 0.4s ease both; }
        .pulse-ring { animation: pulseRing 2s ease-out infinite; }
        input:focus, select:focus, textarea:focus {
          transform: scale(1.01);
          transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
        }
        button {
          transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .range-slider-container {
          position: relative;
          width: 100%;
          height: 6px;
          margin-top: 15px;
          margin-bottom: 10px;
        }
        .range-slider-track {
          position: absolute;
          width: 100%;
          height: 6px;
          background: #E2E8F0;
          border-radius: 3px;
          z-index: 1;
        }
        .range-slider-highlight {
          position: absolute;
          height: 6px;
          background: #5D34F7;
          border-radius: 3px;
          z-index: 2;
        }
        .range-input {
          position: absolute;
          width: 100%;
          height: 6px;
          top: 0;
          background: none;
          pointer-events: none;
          -webkit-appearance: none;
          appearance: none;
          z-index: 3;
          margin: 0;
        }
        .range-input::-webkit-slider-thumb {
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #5D34F7;
          border: 2px solid #FFFFFF;
          box-shadow: 0 2px 4px rgba(93,52,247,0.3);
          cursor: pointer;
          pointer-events: auto;
          -webkit-appearance: none;
          appearance: none;
          transition: transform 0.15s ease;
        }
        .range-input::-webkit-slider-thumb:hover {
          transform: scale(1.1);
        }
        .range-input::-webkit-slider-thumb:active {
          transform: scale(1.2);
        }
        .range-input::-moz-range-thumb {
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #5D34F7;
          border: 2px solid #FFFFFF;
          box-shadow: 0 2px 4px rgba(93,52,247,0.3);
          cursor: pointer;
          pointer-events: auto;
          transition: transform 0.15s ease;
      ` }} />
      {showRazorpay && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-0 sm:p-4">
          <div className="w-full max-w-[420px] bg-white rounded-none sm:rounded-3xl shadow-2xl flex flex-col h-full sm:h-[90vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Razorpay Header */}
            <div className="bg-[#1F51E5] text-white p-4 flex items-center justify-between shadow-md shrink-0">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setShowRazorpay(false)}
                  className="p-1 hover:bg-white/10 rounded-full transition cursor-pointer"
                >
                  <LucideIcons.ArrowLeft size={22} className="text-white" />
                </button>
                <div className="w-9 h-9 bg-white/10 border border-white/20 rounded-xl flex items-center justify-center font-black text-white text-base">
                  M
                </div>
                <div>
                  <h3 className="font-bold text-sm tracking-wide">Matrimony Premium</h3>
                </div>
              </div>
              <div className="w-8 h-8 rounded-full border border-white/30 flex items-center justify-center bg-white/5">
                <LucideIcons.User size={16} className="text-white/80" />
              </div>
            </div>

            {/* Razorpay Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
              <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm space-y-4 font-sans">
                <h4 className="font-bold text-gray-900 text-sm">Payment Options</h4>
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">All Payment Options</p>

                <div className="divide-y divide-gray-100">
                  {/* Cards */}
                  <div className="py-3.5 flex items-center justify-between cursor-pointer hover:bg-slate-50/50 px-1 rounded-xl transition">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                        <LucideIcons.CreditCard size={18} />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-gray-800">Cards</p>
                        <p className="text-[10px] text-gray-400">Visa, MasterCard, RuPay, Maestro</p>
                      </div>
                    </div>
                    <LucideIcons.ChevronRight size={16} className="text-gray-400" />
                  </div>

                  {/* Netbanking */}
                  <div className="py-3.5 flex items-center justify-between cursor-pointer hover:bg-slate-50/50 px-1 rounded-xl transition">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                        <LucideIcons.Landmark size={18} />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-gray-800">Netbanking</p>
                        <p className="text-[10px] text-gray-400">SBI, HDFC, ICICI, AXIS</p>
                      </div>
                    </div>
                    <LucideIcons.ChevronDown size={16} className="text-gray-400" />
                  </div>

                  {/* Wallet */}
                  <div className="py-3.5 flex items-center justify-between cursor-pointer hover:bg-slate-50/50 px-1 rounded-xl transition">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                        <LucideIcons.Wallet size={18} />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-gray-800">Wallet</p>
                        <p className="text-[10px] text-gray-400">PhonePe, Amazon Pay, Paytm</p>
                      </div>
                    </div>
                    <LucideIcons.ChevronDown size={16} className="text-gray-400" />
                  </div>

                  {/* Pay Later */}
                  <div className="py-3.5 flex items-center justify-between cursor-pointer hover:bg-slate-50/50 px-1 rounded-xl transition">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                        <LucideIcons.Clock size={18} />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-gray-800">Pay Later</p>
                        <p className="text-[10px] text-gray-400">ICICI PayLater, Lazypay</p>
                      </div>
                    </div>
                    <LucideIcons.ChevronDown size={16} className="text-gray-400" />
                  </div>
                </div>
              </div>
            </div>

            {/* Razorpay Footer */}
            <div className="p-4 bg-white border-t border-gray-100 shrink-0 flex flex-col gap-3">
              <p className="text-[10px] text-gray-400 text-center font-medium">
                By proceeding, I agree to Razorpay's <span className="font-bold text-gray-600 hover:underline cursor-pointer">Privacy Notice</span> • <span className="font-bold text-gray-600 hover:underline cursor-pointer">Edit Preferences</span>
              </p>
              <div className="flex items-center justify-between gap-4 pt-1 font-sans">
                <div>
                  <p className="text-base font-black text-gray-900 leading-none">
                    {(() => {
                      const activePlanObj = plans.find(p => p.name === selectedPremiumPlan);
                      return activePlanObj ? `₹${activePlanObj.price.toLocaleString()}` : '₹3,300';
                    })()}
                  </p>
                  <button type="button" className="text-[10px] font-bold text-[#1F51E5] flex items-center gap-0.5 hover:underline cursor-pointer mt-0.5 bg-transparent border-0">
                    View Details <LucideIcons.ChevronUp size={10} />
                  </button>
                </div>
                <button
                  type="button"
                  onClick={async () => {
                    setShowRazorpay(false);
                    await handleNext(true);
                  }}
                  disabled={isSaving}
                  className="flex-1 py-3 bg-black hover:bg-gray-900 text-white font-bold text-xs rounded-xl shadow-lg transition active:scale-[0.98] disabled:opacity-50 cursor-pointer text-center border-0"
                >
                  {isSaving ? 'Processing...' : 'Continue'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      <div className="min-h-screen bg-gradient-to-br from-slate-100 via-gray-50 to-slate-200 flex items-center justify-center p-0 sm:p-6 font-sans relative overflow-hidden">
        {/* Subtle decorative blobs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
          <div className="absolute -top-32 -left-32 w-[350px] h-[350px] bg-slate-200/60 rounded-full blur-[90px]"></div>
          <div className="absolute -bottom-32 -right-32 w-[400px] h-[400px] bg-slate-300/40 rounded-full blur-[100px]"></div>
        </div>

        <div className="w-full max-w-[1100px] bg-white backdrop-blur-2xl border border-white/60 shadow-[0_25px_60px_rgba(93,52,247,0.15)] rounded-none sm:rounded-3xl overflow-hidden flex flex-col md:flex-row min-h-screen md:min-h-[550px] md:max-h-[85vh] md:h-[640px] relative z-10 transition-all duration-300">
          {/* Left Side: Progress Overview (Visible on desktop) */}
          <div className="hidden md:flex md:w-[320px] bg-gradient-to-b from-[#5D34F7] to-[#4024DB] p-8 text-white flex-col justify-between shrink-0 relative overflow-hidden">
            <div className="absolute -top-12 -left-12 w-40 h-40 bg-white/5 rounded-full blur-2xl"></div>
            <div className="absolute -bottom-16 -right-16 w-48 h-48 bg-white/5 rounded-full blur-3xl"></div>

            <div className="relative z-10 space-y-8">
              <div className="flex items-center gap-2">
                <img src={navbarLogo} alt="Familiess Logo" className="h-8 object-contain" />
                <img src={navbarName} alt="Familiess" className="h-6 object-contain" />
              </div>

              <div>
                <h3 className="text-xl font-bold tracking-tight">Create Profile</h3>
                <p className="text-white/70 text-xs mt-1">Let's find your matching partner</p>
              </div>

              <div className="space-y-4 pt-4">
                <div className={`flex items-center gap-3 transition-all duration-300 ${step >= 1 && step <= 3 ? 'opacity-100 scale-105 font-bold' : 'opacity-60'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs border ${step >= 1 && step <= 3 ? 'bg-white text-[#5D34F7] border-white font-extrabold shadow-md shadow-[#5D34F7]/20' : 'border-white/40 text-white'}`}>1</div>
                  <div>
                    <p className="text-xs">Basic Details</p>
                    <p className="text-[10px] text-white/60">Steps 1-3</p>
                  </div>
                </div>
                <div className={`flex items-center gap-3 transition-all duration-300 ${step >= 4 && step <= 5 ? 'opacity-100 scale-105 font-bold' : 'opacity-60'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs border ${step >= 4 && step <= 5 ? 'bg-white text-[#5D34F7] border-white font-extrabold shadow-md shadow-[#5D34F7]/20' : 'border-white/40 text-white'}`}>2</div>
                  <div>
                    <p className="text-xs">Contact & Photos</p>
                    <p className="text-[10px] text-white/60">Steps 4-5</p>
                  </div>
                </div>
                <div className={`flex items-center gap-3 transition-all duration-300 ${step >= 6 && step <= 10 ? 'opacity-100 scale-105 font-bold' : 'opacity-60'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs border ${step >= 6 && step <= 10 ? 'bg-white text-[#5D34F7] border-white font-extrabold shadow-md shadow-[#5D34F7]/20' : 'border-white/40 text-white'}`}>3</div>
                  <div>
                    <p className="text-xs">Personal Info</p>
                    <p className="text-[10px] text-white/60">Steps 6-10</p>
                  </div>
                </div>
                <div className={`flex items-center gap-3 transition-all duration-300 ${step >= 11 && step <= 12 ? 'opacity-100 scale-105 font-bold' : 'opacity-60'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs border ${step >= 11 && step <= 12 ? 'bg-white text-[#5D34F7] border-white font-extrabold shadow-md shadow-[#5D34F7]/20' : 'border-white/40 text-white'}`}>4</div>
                  <div>
                    <p className="text-xs">Family Details</p>
                    <p className="text-[10px] text-white/60">Steps 11-12</p>
                  </div>
                </div>
                <div className={`flex items-center gap-3 transition-all duration-300 ${step === 13 ? 'opacity-100 scale-105 font-bold' : 'opacity-60'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs border ${step === 13 ? 'bg-white text-[#5D34F7] border-white font-extrabold shadow-md shadow-[#5D34F7]/20' : 'border-white/40 text-white'}`}>5</div>
                  <div>
                    <p className="text-xs">Partner Preferences</p>
                    <p className="text-[10px] text-white/60">Step 13</p>
                  </div>
                </div>
                <div className={`flex items-center gap-3 transition-all duration-300 ${step === 14 ? 'opacity-100 scale-105 font-bold' : 'opacity-60'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs border ${step === 14 ? 'bg-white text-[#5D34F7] border-white font-extrabold shadow-md shadow-[#5D34F7]/20' : 'border-white/40 text-white'}`}>6</div>
                  <div>
                    <p className="text-xs">Premium Plans</p>
                    <p className="text-[10px] text-white/60">Step 14</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative z-10 text-[11px] text-white/50 border-t border-white/10 pt-4 font-medium flex justify-between items-center">
              <span>Progress: {Math.round((step / 14) * 100)}%</span>
              <span>Step {step} of 14</span>
            </div>
          </div>

          {/* Right Side: Interactive Forms */}
          <div className="flex-1 flex flex-col min-w-0">
            {/* Header */}
            <div className="relative flex items-center justify-between p-4 border-b border-gray-100 bg-white h-16 shrink-0">
              <button onClick={handleBack} className="p-2 text-gray-800 hover:bg-slate-100 rounded-full transition-colors z-10 cursor-pointer">
                <ChevronLeft size={20} className="text-gray-700" />
              </button>
              <div className="flex items-center gap-1.5 md:hidden pointer-events-none">
                <img src={navbarLogo} alt="Familiess" className="h-6 object-contain" style={{ filter: 'brightness(0) saturate(100%)' }} />
                <img src={navbarName} alt="Familiess" className="h-5 object-contain" style={{ filter: 'brightness(0) saturate(100%)' }} />
              </div>
              <div className="text-xs font-bold text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                Step {step}/14
              </div>
            </div>

            {/* Progress Bar (Visible on mobile instead of left sidebar) */}
            <div className="flex gap-0.5 px-4 py-1.5 bg-slate-50 md:hidden shrink-0">
              {[...Array(14)].map((_, i) => (
                <div
                  key={i}
                  className={`h-[3px] flex-1 rounded-full transition-all duration-300 ${i < step ? 'bg-[#5D34F7]' : 'bg-gray-200'
                    }`}
                />
              ))}
            </div>

            {/* Form scroll container */}
            <div ref={contentRef} className="flex-1 overflow-y-auto px-6 py-8">

              {/* STEP 1 */}
              {step === 1 && (
                <div className="smooth-step-transition space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 bg-[#5D34F7]/10 rounded-full flex items-center justify-center text-[#5D34F7] shrink-0">
                      <UserPlus size={28} />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-gray-900 leading-tight">Welcome! Who is this profile for?</h2>
                      <p className="text-gray-500 mt-1 text-sm leading-relaxed">
                        Let's start your matchmaking journey by setting up the profile ownership.
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2.5">
                    {profileOptions.map(option => {
                      const isSelected = profileFor === option;
                      return (
                        <button
                          key={option}
                          onClick={() => {
                            setProfileFor(option);
                            if (option === 'Myself') {
                              setGender('');
                            } else if (option === 'My Son' || option === 'My Brother') {
                              setGender('Male');
                            } else if (option === 'My Daughter' || option === 'My Sister') {
                              setGender('Female');
                            }
                          }}
                          className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl border text-sm font-semibold transition-all duration-200 cursor-pointer shadow-sm ${isSelected
                            ? 'border-transparent bg-[#E6E0F8] text-[#5D34F7]'
                            : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                            }`}
                        >
                          {isSelected && <span className="font-bold">✓</span>}
                          {option}
                        </button>
                      );
                    })}
                  </div>

                  {/* Conditional Gender Selector */}
                  {profileFor === 'Myself' && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-300 space-y-3 pt-2">
                      <h3 className="text-sm font-bold text-gray-900">Gender of the profile owner</h3>
                      <div className="grid grid-cols-2 gap-4">
                        {/* Male Card */}
                        <button
                          type="button"
                          onClick={() => setGender('Male')}
                          className={`flex flex-col items-center justify-center p-6 bg-white border rounded-2xl transition-all duration-200 shadow-sm hover:scale-[1.02] cursor-pointer ${gender === 'Male'
                            ? 'border-[#5D34F7] ring-1 ring-[#5D34F7] text-[#5D34F7]'
                            : 'border-gray-200 text-gray-700 hover:border-gray-300'
                            }`}
                        >
                          <img src={maleAvatar} alt="Male" className="w-16 h-16 object-contain mb-2" />
                          <span className="text-sm font-bold">Male</span>
                        </button>

                        {/* Female Card */}
                        <button
                          type="button"
                          onClick={() => setGender('Female')}
                          className={`flex flex-col items-center justify-center p-6 bg-white border rounded-2xl transition-all duration-200 shadow-sm hover:scale-[1.02] cursor-pointer ${gender === 'Female'
                            ? 'border-[#5D34F7] ring-1 ring-[#5D34F7] text-[#5D34F7]'
                            : 'border-gray-200 text-gray-700 hover:border-gray-300'
                            }`}
                        >
                          <img src={femaleAvatar} alt="Female" className="w-16 h-16 object-contain mb-2" />
                          <span className="text-sm font-bold">Female</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* STEP 2 - Religion & Caste Details */}
              {step === 2 && (
                <div className="smooth-step-transition">
                  {renderStepIcon(<Icons.Religion />)}
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Religion & Caste Details</h2>
                  <p className="text-gray-500 mb-8 text-[15px]">
                    This helps us filter profiles by religious background and caste groups.
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="relative" ref={religionDropdownRef}>
                      <button
                        type="button"
                        onClick={() => setReligionDropdownOpen(!religionDropdownOpen)}
                        className={`w-full flex items-center justify-between pl-4 pr-10 ${religion ? 'py-2.5' : 'py-3.5'} border border-gray-200 rounded-2xl bg-white/70 focus:outline-none focus:ring-2 focus:ring-[#5D34F7] text-[15px] text-gray-700 hover:border-[#5D34F7]/30 transition-all shadow-sm cursor-pointer`}
                      >
                        <div className="flex items-center gap-3">
                          {religion ? (
                            <div className="flex flex-col items-start text-left">
                              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider leading-none mb-1">Religion</span>
                              <div className="flex items-center gap-2">
                                <img
                                  src={religionImages[religion]}
                                  alt={religion}
                                  className="w-4 h-4 object-contain"
                                />
                                <span className="font-semibold text-gray-800 text-[15px] leading-none">{religion}</span>
                              </div>
                            </div>
                          ) : (
                            <>
                              <span className="text-[#5D34F7]"><Icons.Religion /></span>
                              <span className="text-gray-400">Religion</span>
                            </>
                          )}
                        </div>
                        <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-gray-500">
                          <ChevronDown size={20} className={`transition-transform duration-200 ${religionDropdownOpen ? 'rotate-180' : ''}`} />
                        </div>
                      </button>

                      {religionDropdownOpen && (
                        <div className="absolute z-50 left-0 right-0 mt-2 bg-white border border-gray-200 rounded-2xl shadow-xl max-h-60 overflow-y-auto animate-in fade-in slide-in-from-top-1 duration-200">
                          <div className="px-4 py-2.5 bg-slate-50 text-[11px] font-bold text-gray-400 border-b border-gray-100 uppercase tracking-wider sticky top-0">
                            Select Religion
                          </div>
                          {religionsList.map(r => (
                            <button
                              key={r}
                              type="button"
                              onClick={() => {
                                setReligion(r);
                                setCaste(''); // Reset caste when religion changes
                                setReligionDropdownOpen(false);
                              }}
                              className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-slate-50 transition-colors text-[14px] ${religion === r ? 'bg-[#5D34F7]/5 font-bold text-[#5D34F7]' : 'text-gray-700'
                                }`}
                            >
                              <img
                                src={religionImages[r]}
                                alt={r}
                                className="w-5 h-5 object-contain"
                              />
                              <span>{r}</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#5D34F7]">
                        <Icons.User />
                      </div>
                      <select
                        value={community}
                        onChange={(e) => setCommunity(e.target.value)}
                        className="w-full pl-12 pr-10 py-3.5 border border-gray-200 rounded-2xl appearance-none bg-white/70 focus:outline-none focus:ring-2 focus:ring-[#5D34F7] text-[15px] text-gray-700 hover:border-[#5D34F7]/30 transition-all shadow-sm"
                      >
                        <option value="" disabled>Mother Tongue</option>
                        {communitiesList.map(c => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                      <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-gray-500">
                        <ChevronDown size={20} />
                      </div>
                    </div>

                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#5D34F7]">
                        <Icons.User />
                      </div>
                      <select
                        value={caste}
                        onChange={(e) => {
                          setCaste(e.target.value);
                          setSubCommunity(''); // Reset sub-community when caste changes
                        }}
                        className="w-full pl-12 pr-10 py-3.5 border border-gray-200 rounded-2xl appearance-none bg-white/70 focus:outline-none focus:ring-2 focus:ring-[#5D34F7] text-[15px] text-gray-700 hover:border-[#5D34F7]/30 transition-all shadow-sm"
                      >
                        <option value="" disabled>Caste</option>
                        {((religionCastesMap[religion] || []).length > 0
                          ? religionCastesMap[religion]
                          : ['Other']
                        ).map(c => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                      <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-gray-500">
                        <ChevronDown size={20} />
                      </div>
                    </div>

                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#5D34F7]">
                        <Icons.User />
                      </div>
                      <select
                        value={subCommunity}
                        onChange={(e) => setSubCommunity(e.target.value)}
                        className="w-full pl-12 pr-10 py-3.5 border border-gray-200 rounded-2xl appearance-none bg-white/70 focus:outline-none focus:ring-2 focus:ring-[#5D34F7] text-[15px] text-gray-700 hover:border-[#5D34F7]/30 transition-all shadow-sm"
                      >
                        <option value="" disabled>Sub-community / Sect</option>
                        {((casteSubCommunitiesMap[caste] || []).length > 0
                          ? casteSubCommunitiesMap[caste]
                          : ['Other']
                        ).map(sub => (
                          <option key={sub} value={sub}>{sub}</option>
                        ))}
                      </select>
                      <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-gray-500">
                        <ChevronDown size={20} />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 3 - Contact Information */}
              {step === 3 && (
                <div className="smooth-step-transition">
                  {renderStepIcon(<Icons.Mail />)}
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Contact Information</h2>
                  <p className="text-gray-500 mb-8 text-[15px]">
                    Enter phone number and email ID to keep the account verified and secure.
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <label className="text-xs font-bold text-gray-700 block">Email Address</label>
                      <div className="relative flex items-center">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#5D34F7]">
                          <Icons.Mail />
                        </div>
                        <input
                          type="email"
                          placeholder="Email ID"
                          value={email}
                          disabled={isEmailVerified}
                          onChange={(e) => {
                            setEmail(e.target.value);
                            setIsEmailVerified(false);
                            setIsOtpSent(false);
                          }}
                          className={`w-full pl-12 pr-28 py-3.5 border rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#5D34F7] focus:border-transparent text-[15px] bg-white/70 shadow-sm transition-all ${isEmailVerified ? 'border-emerald-500 bg-emerald-50/10 text-emerald-800' : 'border-gray-300'
                            }`}
                        />
                        {isEmailVerified ? (
                          <div className="absolute right-3 flex items-center gap-2">
                            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 flex items-center gap-1">
                              ✓ Email Verified
                            </span>
                            <button
                              type="button"
                              onClick={() => {
                                setIsEmailVerified(false);
                                setIsOtpSent(false);
                              }}
                              className="text-xs font-bold text-gray-500 hover:text-red-500 underline cursor-pointer"
                            >
                              Edit
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={sendOtp}
                            disabled={isSendingOtp || !email.trim()}
                            className="absolute right-2 px-3 py-1.5 bg-red-500 text-white hover:bg-red-600 disabled:opacity-50 text-xs font-bold rounded-xl transition-all shadow-sm cursor-pointer"
                          >
                            {isSendingOtp ? 'Sending...' : isOtpSent ? 'Resend' : 'Verify Email'}
                          </button>
                        )}
                      </div>

                      {/* OTP Verification Input Box */}
                      {isOtpSent && !isEmailVerified && (
                        <div className="animate-in fade-in slide-in-from-top-4 duration-300 space-y-3 p-4 bg-slate-50 border border-slate-100 rounded-2xl">
                          <label className="text-xs font-bold text-slate-700 block">Verification Code</label>
                          <div className="flex gap-2">
                            <input
                              type="text"
                              maxLength={6}
                              placeholder="Enter 6-digit OTP"
                              value={otpCode}
                              onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                              className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5D34F7] text-sm bg-white"
                            />
                            <button
                              type="button"
                              onClick={verifyOtp}
                              disabled={isVerifyingOtp || otpCode.length !== 6}
                              className="px-5 py-2.5 bg-gradient-to-r from-red-500 to-red-600 text-white font-bold text-xs rounded-xl shadow-sm hover:opacity-90 disabled:opacity-50 cursor-pointer"
                            >
                              {isVerifyingOtp ? 'Verifying...' : 'Verify'}
                            </button>
                          </div>
                          <div className="flex justify-between items-center text-xs text-slate-500 px-1">
                            <span>Code sent to your email.</span>
                            {resendTimer > 0 ? (
                              <span>Resend in {resendTimer}s</span>
                            ) : (
                              <button
                                type="button"
                                onClick={sendOtp}
                                className="font-bold text-[#5D34F7] hover:underline cursor-pointer"
                              >
                                Resend OTP
                              </button>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="space-y-4 font-sans">
                      <label className="text-xs font-bold text-gray-700 block">Phone Number</label>
                      {(() => {
                        const activeStd = COUNTRY_PHONE_STANDARDS.find(s => s.code === countryCode) || COUNTRY_PHONE_STANDARDS[0];
                        return (
                          <div className="flex gap-2">
                            {/* Country Code Select Dropdown */}
                            <div className="relative w-36 shrink-0">
                              <select
                                value={countryCode}
                                onChange={(e) => {
                                  setCountryCode(e.target.value);
                                  setPhone('');
                                }}
                                className="w-full pl-3 pr-8 py-3.5 border border-gray-200 rounded-2xl appearance-none bg-white/70 focus:outline-none focus:ring-2 focus:ring-[#5D34F7] text-[14px] text-gray-700 hover:border-[#5D34F7]/30 transition-all shadow-sm"
                              >
                                {COUNTRY_PHONE_STANDARDS.map(s => (
                                  <option key={s.code} value={s.code}>{s.code} ({s.name})</option>
                                ))}
                              </select>
                              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-gray-500">
                                <ChevronDown size={16} />
                              </div>
                            </div>

                            {/* Phone Number Input */}
                            <div className="relative flex-1">
                              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#5D34F7]">
                                <Icons.Phone />
                              </div>
                              <input
                                type="tel"
                                placeholder={activeStd.placeholder}
                                value={phone}
                                onChange={(e) => {
                                  const cleaned = e.target.value.replace(/\D/g, '');
                                  setPhone(cleaned.slice(0, activeStd.length));
                                }}
                                className="w-full pl-12 pr-4 py-3.5 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#5D34F7] focus:border-transparent text-[15px] bg-white/70 shadow-sm"
                              />
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 4 - Add profile photos */}
              {step === 4 && (
                <div className="smooth-step-transition max-w-md mx-auto space-y-6">
                  {renderStepIcon(<Icons.Camera />)}
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Add profile photos</h2>
                  <p className="text-gray-500 mb-6 text-[15px]">
                    Profiles with clear photos receive up to 5x more interest. Add at least one photo.
                  </p>

                  <div className="space-y-4">
                    {/* Primary Photo Slot (Index 0) */}
                    <div className="relative">
                      {photos[0] ? (
                        <div className="relative w-full h-64 rounded-3xl overflow-hidden border border-gray-200 shadow-sm group">
                          <img src={getPhotoUrl(photos[0])} alt="Primary Profile" className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => setPhotos(photos.filter((_, idx) => idx !== 0))}
                            className="absolute top-3 right-3 p-2 bg-red-600/90 text-white rounded-full hover:bg-red-700 transition-colors shadow-md cursor-pointer"
                          >
                            <Trash2 size={16} />
                          </button>
                          <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs font-semibold">
                            Primary Photo
                          </div>
                        </div>
                      ) : (
                        <label className="w-full h-64 flex flex-col items-center justify-center bg-gray-50 rounded-3xl border border-gray-200 cursor-pointer hover:bg-gray-100/50 transition-all text-center group">
                          <div className="w-14 h-14 bg-[#5D34F7]/10 rounded-full flex items-center justify-center text-[#5D34F7] mb-2 transition-transform group-hover:scale-110">
                            <Plus size={28} className="stroke-[3]" />
                          </div>
                          <span className="text-[#5D34F7] font-bold text-sm">Add Primary Photo</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={async (e) => {
                              const file = e.target.files[0];
                              if (file) {
                                setIsSaving(true);
                                setError('');
                                try {
                                  const uploadedNames = await uploadFiles([file]);
                                  setPhotos(prev => {
                                    const newPhotos = [...prev];
                                    newPhotos[0] = uploadedNames[0];
                                    return newPhotos.filter(Boolean);
                                  });
                                } catch (err) {
                                  setError(err.response?.data?.message || err.message || 'Failed to upload photo.');
                                } finally {
                                  setIsSaving(false);
                                }
                              }
                            }}
                            className="hidden"
                          />
                        </label>
                      )}
                    </div>

                    {/* Secondary Photo Slots (Indices 1, 2, 3) */}
                    <div className="grid grid-cols-3 gap-4">
                      {[1, 2, 3].map((slotIdx) => (
                        <div key={slotIdx} className="relative aspect-square">
                          {photos[slotIdx] ? (
                            <div className="relative w-full h-full rounded-2xl overflow-hidden border border-gray-200 shadow-sm group">
                              <img src={getPhotoUrl(photos[slotIdx])} alt={`Profile ${slotIdx + 1}`} className="w-full h-full object-cover" />
                              <button
                                type="button"
                                onClick={() => setPhotos(photos.filter((_, idx) => idx !== slotIdx))}
                                className="absolute top-1 right-1 p-1 bg-red-600/90 text-white rounded-full hover:bg-red-700 transition-colors shadow-md cursor-pointer"
                              >
                                <Trash2 size={12} />
                              </button>
                            </div>
                          ) : (
                            <label className="w-full h-full flex items-center justify-center bg-gray-50 rounded-2xl border border-gray-200 cursor-pointer hover:bg-gray-100/50 transition-all group">
                              <Plus size={24} className="text-[#5D34F7] stroke-[3] transition-transform group-hover:scale-110" />
                              <input
                                type="file"
                                accept="image/*"
                                onChange={async (e) => {
                                  const file = e.target.files[0];
                                  if (file) {
                                    setIsSaving(true);
                                    setError('');
                                    try {
                                      const uploadedNames = await uploadFiles([file]);
                                      setPhotos(prev => {
                                        const newPhotos = [...prev];
                                        newPhotos[slotIdx] = uploadedNames[0];
                                        return newPhotos.filter(Boolean);
                                      });
                                    } catch (err) {
                                      setError(err.response?.data?.message || err.message || 'Failed to upload photo.');
                                    } finally {
                                      setIsSaving(false);
                                    }
                                  }
                                }}
                                className="hidden"
                              />
                            </label>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 5 - Profile Location Details */}
              {step === 5 && (
                <div className="smooth-step-transition">
                  {renderStepIcon(<Icons.Map />)}
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Profile Location Details</h2>
                  <p className="text-gray-500 mb-8 text-[15px]">
                    Select state and city of the profile owner.
                  </p>

                  <div className="space-y-4">
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#5D34F7] z-10">
                        <Map size={20} />
                      </div>
                      <input
                        type="text"
                        value={locationSearchQuery}
                        onChange={async (e) => {
                          const val = e.target.value;
                          setLocationSearchQuery(val);
                          if (val.trim().length > 1) {
                            setIsSearchingLocation(true);
                            const res = await LocationService.searchLocations(val);
                            setLocationSearchResults(res);
                            setIsSearchingLocation(false);
                          } else {
                            setLocationSearchResults([]);
                          }
                        }}
                        className="w-full pl-12 pr-12 py-3.5 border border-gray-200 rounded-2xl bg-white/70 focus:outline-none focus:ring-2 focus:ring-[#5D34F7] text-[15px] text-gray-700 hover:border-[#5D34F7]/30 transition-all shadow-sm"
                        placeholder="Type location to search (e.g. Pune, Delhi...)"
                      />
                      {isSearchingLocation && (
                        <div className="absolute inset-y-0 right-4 flex items-center">
                          <div className="animate-spin rounded-full h-4 w-4 border-2 border-[#5D34F7] border-t-transparent"></div>
                        </div>
                      )}
                      {locationSearchResults.length > 0 && (
                        <div className="absolute left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-lg z-50 max-h-60 overflow-y-auto divide-y divide-slate-100">
                          {locationSearchResults.map((locStr, idx) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => {
                                const parts = locStr.split(',').map(s => s.trim());
                                if (parts.length >= 2) {
                                  setCityLoc(parts[0]);
                                  setStateLoc(parts[1]);
                                } else {
                                  setCityLoc(locStr);
                                }
                                setLocationSearchQuery(locStr);
                                setLocationSearchResults([]);
                              }}
                              className="w-full text-left px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition cursor-pointer"
                            >
                              📍 {locStr}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider">State / Region</label>
                        <input
                          type="text"
                          value={stateLoc}
                          onChange={e => setStateLoc(e.target.value)}
                          className="w-full px-4 py-3 border border-gray-200 rounded-2xl bg-white/70 focus:outline-none focus:ring-2 focus:ring-[#5D34F7] text-[15px] text-gray-700"
                          placeholder="State"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider">City</label>
                        <input
                          type="text"
                          value={cityLoc}
                          onChange={e => setCityLoc(e.target.value)}
                          className="w-full px-4 py-3 border border-gray-200 rounded-2xl bg-white/70 focus:outline-none focus:ring-2 focus:ring-[#5D34F7] text-[15px] text-gray-700"
                          placeholder="City"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 6 - Lifestyle & Attributes */}
              {step === 6 && (
                <div className="smooth-step-transition">
                  {renderStepIcon(<Icons.Ring />)}
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Lifestyle & Attributes</h2>
                  <p className="text-gray-500 mb-8 text-[15px]">
                    Provide basic physical and status attributes.
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#5D34F7]">
                        <Activity size={20} />
                      </div>
                      <select
                        value={maritalStatus}
                        onChange={(e) => setMaritalStatus(e.target.value)}
                        className="w-full pl-12 pr-10 py-3.5 border border-gray-200 rounded-2xl appearance-none bg-white/70 focus:outline-none focus:ring-2 focus:ring-[#5D34F7] text-[15px] text-gray-700 hover:border-[#5D34F7]/30 transition-all shadow-sm"
                      >
                        <option value="" disabled>Marital Status</option>
                        {maritalStatusesList.map(ms => (
                          <option key={ms} value={ms}>{ms}</option>
                        ))}
                      </select>
                      <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-gray-500">
                        <ChevronDown size={20} />
                      </div>
                    </div>

                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#5D34F7]">
                        <ArrowUpDown size={20} />
                      </div>
                      <select
                        value={height}
                        onChange={(e) => setHeight(e.target.value)}
                        className="w-full pl-12 pr-10 py-3.5 border border-gray-200 rounded-2xl appearance-none bg-white/70 focus:outline-none focus:ring-2 focus:ring-[#5D34F7] text-[15px] text-gray-700 hover:border-[#5D34F7]/30 transition-all shadow-sm"
                      >
                        <option value="" disabled>Height</option>
                        {heightsList.map(h => (
                          <option key={h} value={h}>{h}</option>
                        ))}
                      </select>
                      <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-gray-500">
                        <ChevronDown size={20} />
                      </div>
                    </div>

                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#5D34F7]">
                        <Utensils size={20} />
                      </div>
                      <select
                        value={diet}
                        onChange={(e) => setDiet(e.target.value)}
                        className="w-full pl-12 pr-10 py-3.5 border border-gray-200 rounded-2xl appearance-none bg-white/70 focus:outline-none focus:ring-2 focus:ring-[#5D34F7] text-[15px] text-gray-700 hover:border-[#5D34F7]/30 transition-all shadow-sm"
                      >
                        <option value="" disabled>Diet</option>
                        {dietsList.map(d => (
                          <option key={d} value={d}>{d}</option>
                        ))}
                      </select>
                      <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-gray-500">
                        <ChevronDown size={20} />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 7 - Educational Background */}
              {step === 7 && (
                <div className="smooth-step-transition">
                  {renderStepIcon(<Icons.Graduation />)}
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Educational Background</h2>
                  <p className="text-gray-500 mb-8 text-[15px]">
                    Select highest degree and institution of the profile owner.
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#5D34F7]">
                        <GraduationCap size={20} />
                      </div>
                      <select
                        value={qualification}
                        onChange={(e) => setQualification(e.target.value)}
                        className="w-full pl-12 pr-10 py-3.5 border border-gray-200 rounded-2xl appearance-none bg-white/70 focus:outline-none focus:ring-2 focus:ring-[#5D34F7] text-[15px] text-gray-700 hover:border-[#5D34F7]/30 transition-all shadow-sm"
                      >
                        <option value="" disabled>Highest Qualification</option>
                        {qualificationsList.map(q => (
                          <option key={q} value={q}>{q}</option>
                        ))}
                      </select>
                      <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-gray-500">
                        <ChevronDown size={20} />
                      </div>
                    </div>

                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#5D34F7]">
                        <School size={20} />
                      </div>
                      <input
                        type="text"
                        list="colleges"
                        placeholder="College/University"
                        value={college}
                        onChange={(e) => setCollege(e.target.value)}
                        className="w-full pl-12 pr-4 py-3.5 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#5D34F7] focus:border-transparent text-[15px] bg-white/70 hover:border-[#5D34F7]/30 transition-all shadow-sm"
                      />
                      <datalist id="colleges">
                        {collegesList.map(c => (
                          <option key={c} value={c} />
                        ))}
                      </datalist>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 8 - Professional Details */}
              {step === 8 && (
                <div className="smooth-step-transition">
                  {renderStepIcon(<Icons.Briefcase />)}
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Professional Details</h2>
                  <p className="text-gray-500 mb-8 text-[15px]">
                    Provide details about work status and annual income.
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#5D34F7]">
                        <Banknote size={20} />
                      </div>
                      <select
                        value={income}
                        onChange={(e) => setIncome(e.target.value)}
                        className="w-full pl-12 pr-10 py-3.5 border border-gray-200 rounded-2xl appearance-none bg-white/70 focus:outline-none focus:ring-2 focus:ring-[#5D34F7] text-[15px] text-gray-700 hover:border-[#5D34F7]/30 transition-all shadow-sm"
                      >
                        <option value="" disabled>Annual Income</option>
                        {incomesList.map(inc => (
                          <option key={inc} value={inc}>{inc}</option>
                        ))}
                      </select>
                      <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-gray-500">
                        <ChevronDown size={20} />
                      </div>
                    </div>

                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#5D34F7]">
                        <Icons.Briefcase />
                      </div>
                      <select
                        value={workSector}
                        onChange={(e) => setWorkSector(e.target.value)}
                        className="w-full pl-12 pr-10 py-3.5 border border-gray-200 rounded-2xl appearance-none bg-white/70 focus:outline-none focus:ring-2 focus:ring-[#5D34F7] text-[15px] text-gray-700 hover:border-[#5D34F7]/30 transition-all shadow-sm"
                      >
                        <option value="" disabled>Work Sector</option>
                        {workSectorsList.map(sec => (
                          <option key={sec} value={sec}>{sec}</option>
                        ))}
                      </select>
                      <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-gray-500">
                        <ChevronDown size={20} />
                      </div>
                    </div>

                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#5D34F7]">
                        <Badge size={20} />
                      </div>
                      <select
                        value={workRole}
                        onChange={(e) => setWorkRole(e.target.value)}
                        className="w-full pl-12 pr-10 py-3.5 border border-gray-200 rounded-2xl appearance-none bg-white/70 focus:outline-none focus:ring-2 focus:ring-[#5D34F7] text-[15px] text-gray-700 hover:border-[#5D34F7]/30 transition-all shadow-sm"
                      >
                        <option value="" disabled>Work Role</option>
                        {workRolesList.map(role => (
                          <option key={role} value={role}>{role}</option>
                        ))}
                      </select>
                      <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-gray-500">
                        <ChevronDown size={20} />
                      </div>
                    </div>

                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#5D34F7]">
                        <Icons.Briefcase />
                      </div>
                      <input
                        type="text"
                        placeholder="Company Name"
                        value={company}
                        onChange={(e) => setCompany(e.target.value)}
                        className="w-full pl-12 pr-4 py-3.5 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#5D34F7] focus:border-transparent text-[15px] bg-white/70 hover:border-[#5D34F7]/30 transition-all shadow-sm"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 9 - Tell us about the groom/bride */}
              {step === 9 && (
                <div className="smooth-step-transition">
                  {renderStepIcon(<Icons.User />)}
                  <h2 className="text-lg font-bold text-gray-900 mb-1">
                    {gender === 'Male' ? 'Tell us about the groom' : gender === 'Female' ? 'Tell us about the bride' : 'Tell us about the profile owner'}
                  </h2>
                  <p className="text-gray-500 mb-4 text-xs">
                    Please enter the full name and date of birth as per legal records.
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#5D34F7]">
                        <Icons.User />
                      </div>
                      <input
                        type="text"
                        placeholder="Full Name"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="w-full pl-12 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5D34F7] focus:border-transparent text-sm bg-white/70 hover:border-[#5D34F7]/30 transition-all shadow-sm"
                      />
                    </div>

                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#5D34F7]">
                        <Icons.Calendar />
                      </div>
                      <input
                        type="date"
                        placeholder="Date of Birth"
                        value={dob}
                        onChange={(e) => setDob(e.target.value)}
                        className="w-full pl-12 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5D34F7] focus:border-transparent text-sm bg-white/70 hover:border-[#5D34F7]/30 transition-all shadow-sm text-gray-700"
                      />
                    </div>
                  </div>

                  <div className="mt-8 pt-8 border-t border-gray-100">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 bg-[#5D34F7]/10 rounded-full flex items-center justify-center text-[#5D34F7] shrink-0">
                        <PencilLine size={20} />
                      </div>
                      <div>
                        <h2 className="text-lg font-bold text-gray-900 leading-tight">Describe yourself</h2>
                        <p className="text-gray-500 mt-1 text-xs leading-relaxed">
                          Write a short description to tell prospects about your values, personality, and expectations.
                        </p>
                      </div>
                    </div>

                    <div className="mt-6 relative">
                      <div className="absolute top-4 left-4 flex items-center pointer-events-none text-[#5D34F7]">
                        <PencilLine size={20} />
                      </div>
                      <textarea
                        placeholder="About Me / Bio"
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        rows={5}
                        className="w-full pl-12 pr-4 py-3.5 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#5D34F7] focus:border-transparent text-[15px] bg-white/70 shadow-sm resize-none"
                      />
                      <div className="flex justify-between items-center mt-2 px-1">
                        <span className="text-[11px] text-gray-400">
                          {bio.length} characters
                        </span>
                        <button
                          type="button"
                          onClick={() => setBio(generateBio())}
                          className="text-xs font-bold text-[#5D34F7] hover:text-[#4024DB] transition-all flex items-center gap-1 cursor-pointer bg-[#5D34F7]/5 hover:bg-[#5D34F7]/10 px-3 py-1.5 rounded-xl border border-[#5D34F7]/20"
                        >
                          ✨ Regenerate Description
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 10 - Hobbies & Interests */}
              {step === 10 && (
                <div className="smooth-step-transition space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 bg-[#5D34F7]/10 rounded-full flex items-center justify-center text-[#5D34F7] shrink-0">
                      <LucideIcons.Gamepad2 className="w-7 h-7" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-gray-900 leading-tight font-sans">Hobbies & Interests</h2>
                      <p className="text-gray-500 mt-1 text-sm leading-relaxed font-sans">
                        Choose the things the profile owner enjoys doing to help matches start conversations.
                      </p>
                    </div>
                  </div>

                  {[
                    { title: 'Creative', list: creativeHobbies },
                    { title: 'Fun', list: funHobbies },
                    { title: 'Fitness', list: fitnessHobbies },
                    { title: 'Other', list: otherHobbies }
                  ].map(category => (
                    <div key={category.title} className="space-y-3">
                      <h3 className="text-base font-bold text-gray-900 tracking-tight font-sans">{category.title}</h3>
                      <div className="flex flex-wrap gap-2.5">
                        {category.list.map(hobby => {
                          const isSelected = hobbies.includes(hobby);
                          return (
                            <button
                              key={hobby}
                              type="button"
                              onClick={() => {
                                if (isSelected) {
                                  setHobbies(hobbies.filter(h => h !== hobby));
                                } else {
                                  setHobbies([...hobbies, hobby]);
                                }
                              }}
                              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-semibold transition-all duration-200 cursor-pointer shadow-sm ${isSelected
                                ? 'border-[#5D34F7]/30 bg-[#E6E0F8] text-[#5D34F7]'
                                : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                                }`}
                            >
                              {renderHobbyIcon(hobby, isSelected ? 'text-[#5D34F7]' : 'text-gray-500')}
                              <span>{hobby}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* STEP 11 */}
              {step === 11 && (
                <div className="smooth-step-transition">
                  {renderStepIcon(<Icons.User />)}
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Family Details</h2>
                  <p className="text-gray-500 mb-8 text-[15px]">
                    Provide details regarding parents and siblings status.
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Icons.Mother />
                      </div>
                      <select
                        value={motherStatus}
                        onChange={(e) => setMotherStatus(e.target.value)}
                        className="w-full pl-12 pr-10 py-3.5 border border-gray-200 bg-white/70 hover:border-[#5D34F7]/30 transition-all rounded-2xl appearance-none focus:outline-none focus:ring-2 focus:ring-[#5D34F7] text-[15px] text-gray-700"
                      >
                        <option value="" disabled>Mother's Status</option>
                        {motherStatusList.map(opt => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                      <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-gray-500">
                        <ChevronDown size={20} />
                      </div>
                    </div>

                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Icons.Father />
                      </div>
                      <select
                        value={fatherStatus}
                        onChange={(e) => setFatherStatus(e.target.value)}
                        className="w-full pl-12 pr-10 py-3.5 border border-gray-200 bg-white/70 hover:border-[#5D34F7]/30 transition-all rounded-2xl appearance-none focus:outline-none focus:ring-2 focus:ring-[#5D34F7] text-[15px] text-gray-700"
                      >
                        <option value="" disabled>Father's Status</option>
                        {fatherStatusList.map(opt => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                      <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-gray-500">
                        <ChevronDown size={20} />
                      </div>
                    </div>

                    <div className="md:col-span-2 flex gap-4">
                      <div className="flex-1 relative">
                        <div className="absolute top-[34px] left-4 flex items-center pointer-events-none">
                          <Icons.Sister />
                        </div>
                        <label className="text-xs text-gray-500 font-bold mb-1.5 block">No of Sisters</label>
                        <select
                          value={sistersCount}
                          onChange={(e) => setSistersCount(Number(e.target.value))}
                          className="w-full pl-12 pr-10 py-3 border border-gray-200 bg-white/70 hover:border-[#5D34F7]/30 transition-all rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#5D34F7] text-[15px] text-gray-700 appearance-none"
                        >
                          {[0, 1, 2, 3, 4, 5].map(n => (
                            <option key={n} value={n}>{n}</option>
                          ))}
                        </select>
                        <div className="absolute bottom-[13px] right-4 flex items-center pointer-events-none text-gray-500">
                          <ChevronDown size={16} />
                        </div>
                      </div>

                      <div className="flex-1 relative">
                        <div className="absolute top-[34px] left-4 flex items-center pointer-events-none">
                          <Icons.Brother />
                        </div>
                        <label className="text-xs text-gray-500 font-bold mb-1.5 block">No of Brothers</label>
                        <select
                          value={brothersCount}
                          onChange={(e) => setBrothersCount(Number(e.target.value))}
                          className="w-full pl-12 pr-10 py-3 border border-gray-200 bg-white/70 hover:border-[#5D34F7]/30 transition-all rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#5D34F7] text-[15px] text-gray-700 appearance-none"
                        >
                          {[0, 1, 2, 3, 4, 5].map(n => (
                            <option key={n} value={n}>{n}</option>
                          ))}
                        </select>
                        <div className="absolute bottom-[13px] right-4 flex items-center pointer-events-none text-gray-500">
                          <ChevronDown size={16} />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 12 */}
              {step === 12 && (
                <div className="smooth-step-transition space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 bg-[#5D34F7]/10 rounded-full flex items-center justify-center text-[#5D34F7] shrink-0">
                      <LucideIcons.CircleDollarSign className="w-7 h-7" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-gray-900 leading-tight font-sans">Family Lifestyle & Living Status</h2>
                      <p className="text-gray-500 mt-1 text-sm leading-relaxed font-sans">
                        State the family financial status and living setup.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-base font-bold text-gray-900 font-sans">
                      Does the {gender === 'Male' ? 'groom' : gender === 'Female' ? 'bride' : 'profile owner'} live with family?
                    </h3>
                    <div className="flex gap-8">
                      <button
                        type="button"
                        onClick={() => setLiveWithFamily(true)}
                        className="flex items-center gap-2.5 cursor-pointer text-sm font-semibold text-gray-700 bg-transparent border-0 focus:outline-none"
                      >
                        {liveWithFamily === true ? (
                          <div className="w-5 h-5 rounded-full border-2 border-[#5D34F7] flex items-center justify-center">
                            <div className="w-2.5 h-2.5 rounded-full bg-[#5D34F7]"></div>
                          </div>
                        ) : (
                          <div className="w-5 h-5 rounded-full border-2 border-gray-300"></div>
                        )}
                        Yes
                      </button>
                      <button
                        type="button"
                        onClick={() => setLiveWithFamily(false)}
                        className="flex items-center gap-2.5 cursor-pointer text-sm font-semibold text-gray-700 bg-transparent border-0 focus:outline-none"
                      >
                        {liveWithFamily === false ? (
                          <div className="w-5 h-5 rounded-full border-2 border-[#5D34F7] flex items-center justify-center">
                            <div className="w-2.5 h-2.5 rounded-full bg-[#5D34F7]"></div>
                          </div>
                        ) : (
                          <div className="w-5 h-5 rounded-full border-2 border-gray-300"></div>
                        )}
                        No
                      </button>
                    </div>

                    {liveWithFamily === false && (
                      <div className="relative mt-4 animate-in fade-in slide-in-from-top-3 duration-200">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#5D34F7]">
                          <LucideIcons.MapPin className="w-5 h-5" />
                        </div>
                        <input
                          type="text"
                          placeholder="Where does the family live? (City/State)"
                          value={familyLocation}
                          onChange={(e) => setFamilyLocation(e.target.value)}
                          className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#5D34F7] focus:border-transparent text-sm bg-gray-50/50 hover:border-gray-300 transition-all shadow-sm font-sans"
                        />
                      </div>
                    )}
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-base font-bold text-gray-900 font-sans">Family Financial Status</h3>
                    <div className="flex flex-wrap gap-3">
                      {['Elite', 'High', 'Middle', 'Aspiring'].map(status => {
                        const isSelected = familyFinancialStatus === status;
                        return (
                          <button
                            key={status}
                            type="button"
                            onClick={() => setFamilyFinancialStatus(status)}
                            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl border text-sm font-semibold transition-all duration-200 cursor-pointer shadow-sm ${isSelected
                              ? 'border-transparent bg-[#E6E0F8] text-[#5D34F7]'
                              : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                              }`}
                          >
                            {isSelected && <LucideIcons.Check className="w-4 h-4 text-[#5D34F7] stroke-[3]" />}
                            {status}
                          </button>
                        );
                      })}
                    </div>

                    {familyFinancialStatus && (
                      <div className="p-4 bg-gray-50/55 border border-gray-100 rounded-2xl flex items-start gap-3 mt-4 animate-in fade-in duration-200">
                        <LucideIcons.Info className="w-5 h-5 text-[#5D34F7] shrink-0 mt-0.5" />
                        <p className="text-xs text-gray-500 font-sans leading-relaxed">
                          {familyFinancialStatus === 'Elite' && 'Ultra high net worth, luxury lifestyle, business/estate owners.'}
                          {familyFinancialStatus === 'High' && 'Affluent background, comfortable living, upper-class professionals.'}
                          {familyFinancialStatus === 'Middle' && 'Standard professional background, stable values, salaried/independent houses.'}
                          {familyFinancialStatus === 'Aspiring' && 'Growth-focused, hard-working background, value-oriented families.'}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}



              {/* STEP 13 - Partner Preferences */}
              {step === 13 && (
                <div className="smooth-step-transition space-y-6">
                  <div className="w-16 h-16 bg-[#5D34F7]/10 rounded-full flex items-center justify-center mb-6 text-[#5D34F7]">
                    <span className="text-2xl">💜</span>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Partner Preferences</h2>
                  <p className="text-gray-500 mb-8 text-[15px]">
                    Specify criteria for your ideal matches. We will prefill profiles based on these options.
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Age Range */}
                    <div className="space-y-2">
                      <span className="text-sm font-semibold text-gray-700 block">Preferred Age Range</span>
                      <div className="flex gap-4">
                        <div className="flex-1">
                          <label className="text-xs text-gray-500 font-medium mb-1 block">Min Age</label>
                          <select
                            value={prefAgeMin}
                            onChange={(e) => setPrefAgeMin(Number(e.target.value))}
                            className="w-full px-4 py-3 border border-gray-300 rounded-2xl bg-white focus:outline-none focus:ring-2 focus:ring-[#5D34F7] text-[15px] text-gray-700"
                          >
                            {[...Array(53)].map((_, i) => {
                              const age = i + 18;
                              return <option key={age} value={age}>{age}</option>;
                            })}
                          </select>
                        </div>
                        <div className="flex-1">
                          <label className="text-xs text-gray-500 font-medium mb-1 block">Max Age</label>
                          <select
                            value={prefAgeMax}
                            onChange={(e) => setPrefAgeMax(Number(e.target.value))}
                            className="w-full px-4 py-3 border border-gray-300 rounded-2xl bg-white focus:outline-none focus:ring-2 focus:ring-[#5D34F7] text-[15px] text-gray-700"
                          >
                            {[...Array(53)].map((_, i) => {
                              const age = i + 18;
                              return <option key={age} value={age}>{age}</option>;
                            })}
                          </select>
                        </div>
                      </div>
                      <div className="text-center text-[#5D34F7] font-bold text-sm mt-1">
                        {prefAgeMin} - {prefAgeMax} years old
                      </div>
                    </div>

                    {/* Religions */}
                    <div className="space-y-2">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm font-semibold text-gray-700 block">Preferred Religions</span>
                        <button
                          type="button"
                          onClick={() => {
                            const isAllSelected = religionsList.every(r => prefReligions.includes(r));
                            if (isAllSelected) {
                              setPrefReligions(prefReligions.filter(r => !religionsList.includes(r)));
                              setPrefCastes([]);
                            } else {
                              setPrefReligions([...new Set([...prefReligions, ...religionsList])]);
                            }
                          }}
                          className="text-xs text-[#5D34F7] font-semibold hover:underline bg-transparent border-0 cursor-pointer"
                        >
                          {religionsList.every(r => prefReligions.includes(r)) ? 'Deselect All' : 'Select All'}
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {religionsList.map(r => {
                          const isSel = prefReligions.includes(r);
                          return (
                            <button
                              key={r}
                              type="button"
                              onClick={() => {
                                if (isSel) {
                                  setPrefReligions(prefReligions.filter(x => x !== r));
                                  const castesToRemove = religionCastesMap[r] || [];
                                  setPrefCastes(prefCastes.filter(c => !castesToRemove.includes(c)));
                                } else {
                                  setPrefReligions([...prefReligions, r]);
                                }
                              }}
                              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-[13px] font-medium transition-colors cursor-pointer
                        ${isSel
                                  ? 'border-[#5D34F7] bg-[#5D34F7]/5 text-[#5D34F7] font-semibold'
                                  : 'border-gray-200 text-gray-700 hover:border-gray-300'}`}
                            >
                              <img src={religionImages[r]} alt={r} className="w-4 h-4 object-contain" />
                              <span>{r}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Caste / Community */}
                    <div className="space-y-2">
                      {(() => {
                        let availableCastes = [];
                        if (prefReligions.length === 0) {
                          availableCastes = religionCastesMap[religion || 'Hindu'] || ['Other'];
                        } else {
                          prefReligions.forEach(r => {
                            availableCastes.push(...(religionCastesMap[r] || []));
                          });
                        }
                        availableCastes = [...new Set(availableCastes)];

                        const visibleCastes = showAllPrefCastes ? availableCastes : availableCastes.slice(0, 10);
                        const hasMore = availableCastes.length > 10;

                        return (
                          <>
                            <div className="flex justify-between items-center mb-1">
                              <span className="text-sm font-semibold text-gray-700 block">Preferred Caste/Community</span>
                              <button
                                type="button"
                                onClick={() => {
                                  const isAllSelected = availableCastes.length > 0 && availableCastes.every(c => prefCastes.includes(c));
                                  if (isAllSelected) {
                                    setPrefCastes(prefCastes.filter(c => !availableCastes.includes(c)));
                                  } else {
                                    setPrefCastes([...new Set([...prefCastes, ...availableCastes])]);
                                    setShowAllPrefCastes(true);
                                  }
                                }}
                                className="text-xs text-[#5D34F7] font-semibold hover:underline bg-transparent border-0 cursor-pointer"
                              >
                                {availableCastes.length > 0 && availableCastes.every(c => prefCastes.includes(c)) ? 'Deselect All' : 'Select All'}
                              </button>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {visibleCastes.map(c => {
                                const isSel = prefCastes.includes(c);
                                return (
                                  <button
                                    key={c}
                                    type="button"
                                    onClick={() => {
                                      if (isSel) {
                                        setPrefCastes(prefCastes.filter(x => x !== c));
                                      } else {
                                        setPrefCastes([...prefCastes, c]);
                                      }
                                    }}
                                    className={`px-4 py-2 rounded-xl border text-[13px] font-medium transition-colors
                              ${isSel
                                        ? 'border-[#5D34F7] bg-[#5D34F7]/5 text-[#5D34F7] font-semibold'
                                        : 'border-gray-200 text-gray-700 hover:border-gray-300'}`}
                                  >
                                    {c}
                                  </button>
                                );
                              })}
                              {hasMore && (
                                <button
                                  type="button"
                                  onClick={() => setShowAllPrefCastes(!showAllPrefCastes)}
                                  className="text-[#5D34F7] text-xs font-semibold hover:underline block w-full text-left mt-1"
                                >
                                  {showAllPrefCastes ? 'Show Less' : `Show More (+${availableCastes.length - 10})`}
                                </button>
                              )}
                            </div>
                          </>
                        );
                      })()}
                    </div>

                    {/* Preferred Mother Tongue */}
                    <div className="space-y-2">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm font-semibold text-gray-700 block">Preferred Mother Tongue</span>
                        <button
                          type="button"
                          onClick={() => {
                            const isAllSelected = communitiesList.length > 0 && communitiesList.every(c => prefCommunities.includes(c));
                            if (isAllSelected) {
                              setPrefCommunities(prefCommunities.filter(c => !communitiesList.includes(c)));
                            } else {
                              setPrefCommunities([...new Set([...prefCommunities, ...communitiesList])]);
                              setShowAllPrefCommunities(true);
                            }
                          }}
                          className="text-xs text-[#5D34F7] font-semibold hover:underline bg-transparent border-0 cursor-pointer"
                        >
                          {communitiesList.length > 0 && communitiesList.every(c => prefCommunities.includes(c)) ? 'Deselect All' : 'Select All'}
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {(showAllPrefCommunities ? communitiesList : communitiesList.slice(0, 10)).map(c => {
                          const isSel = prefCommunities.includes(c);
                          return (
                            <button
                              key={c}
                              type="button"
                              onClick={() => {
                                if (isSel) {
                                  setPrefCommunities(prefCommunities.filter(x => x !== c));
                                } else {
                                  setPrefCommunities([...prefCommunities, c]);
                                }
                              }}
                              className={`px-4 py-2 rounded-xl border text-[13px] font-medium transition-colors
                                ${isSel
                                  ? 'border-[#5D34F7] bg-[#5D34F7]/5 text-[#5D34F7] font-semibold'
                                  : 'border-gray-200 text-gray-700 hover:border-gray-300'}`}
                            >
                              {c}
                            </button>
                          );
                        })}
                        {communitiesList.length > 10 && (
                          <button
                            type="button"
                            onClick={() => setShowAllPrefCommunities(!showAllPrefCommunities)}
                            className="text-[#5D34F7] text-xs font-semibold hover:underline block w-full text-left mt-1"
                          >
                            {showAllPrefCommunities ? 'Show Less' : `Show More (+${communitiesList.length - 10})`}
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Marital Status */}
                    <div className="space-y-2">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm font-semibold text-gray-700 block">Preferred Marital Status</span>
                        <button
                          type="button"
                          onClick={() => {
                            const isAllSelected = maritalStatusesList.every(m => prefMaritalStatuses.includes(m));
                            setPrefMaritalStatuses(isAllSelected ? prefMaritalStatuses.filter(m => !maritalStatusesList.includes(m)) : [...new Set([...prefMaritalStatuses, ...maritalStatusesList])]);
                          }}
                          className="text-xs text-[#5D34F7] font-semibold hover:underline bg-transparent border-0 cursor-pointer"
                        >
                          {maritalStatusesList.every(m => prefMaritalStatuses.includes(m)) ? 'Deselect All' : 'Select All'}
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {maritalStatusesList.map(m => {
                          const isSel = prefMaritalStatuses.includes(m);
                          return (
                            <button
                              key={m}
                              type="button"
                              onClick={() => {
                                if (isSel) {
                                  setPrefMaritalStatuses(prefMaritalStatuses.filter(x => x !== m));
                                } else {
                                  setPrefMaritalStatuses([...prefMaritalStatuses, m]);
                                }
                              }}
                              className={`px-4 py-2 rounded-xl border text-[13px] font-medium transition-colors
                        ${isSel
                                  ? 'border-[#5D34F7] bg-[#5D34F7]/5 text-[#5D34F7] font-semibold'
                                  : 'border-gray-200 text-gray-700 hover:border-gray-300'}`}
                            >
                              {m}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Height Range */}
                    <div className="space-y-4">
                      <span className="text-sm font-semibold text-gray-700 block">Preferred Height Range</span>
                      <div className="range-slider-container">
                        <div className="range-slider-track" />
                        <div
                          className="range-slider-highlight"
                          style={{
                            left: `${(heightsList.indexOf(prefHeightMin) / (heightsList.length - 1)) * 100}%`,
                            width: `${((heightsList.indexOf(prefHeightMax) - heightsList.indexOf(prefHeightMin)) / (heightsList.length - 1)) * 100}%`
                          }}
                        />
                        <input
                          type="range"
                          min="0"
                          max={heightsList.length - 1}
                          value={heightsList.indexOf(prefHeightMin)}
                          onChange={(e) => {
                            const val = Number(e.target.value);
                            const maxVal = heightsList.indexOf(prefHeightMax);
                            if (val < maxVal) {
                              setPrefHeightMin(heightsList[val]);
                            }
                          }}
                          className="range-input"
                        />
                        <input
                          type="range"
                          min="0"
                          max={heightsList.length - 1}
                          value={heightsList.indexOf(prefHeightMax)}
                          onChange={(e) => {
                            const val = Number(e.target.value);
                            const minVal = heightsList.indexOf(prefHeightMin);
                            if (val > minVal) {
                              setPrefHeightMax(heightsList[val]);
                            }
                          }}
                          className="range-input"
                        />
                      </div>
                      <div className="text-center text-[#5D34F7] font-bold text-sm mt-1">
                        {prefHeightMin} - {prefHeightMax}
                      </div>
                    </div>

                    {/* Diet */}
                    <div className="space-y-2">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm font-semibold text-gray-700 block">Preferred Diet</span>
                        <button
                          type="button"
                          onClick={() => {
                            const isAllSelected = dietsList.every(d => prefDiets.includes(d));
                            setPrefDiets(isAllSelected ? prefDiets.filter(d => !dietsList.includes(d)) : [...new Set([...prefDiets, ...dietsList])]);
                          }}
                          className="text-xs text-[#5D34F7] font-semibold hover:underline bg-transparent border-0 cursor-pointer"
                        >
                          {dietsList.every(d => prefDiets.includes(d)) ? 'Deselect All' : 'Select All'}
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {dietsList.map(d => {
                          const isSel = prefDiets.includes(d);
                          return (
                            <button
                              key={d}
                              type="button"
                              onClick={() => {
                                if (isSel) {
                                  setPrefDiets(prefDiets.filter(x => x !== d));
                                } else {
                                  setPrefDiets([...prefDiets, d]);
                                }
                              }}
                              className={`px-4 py-2 rounded-xl border text-[13px] font-medium transition-colors
                        ${isSel
                                  ? 'border-[#5D34F7] bg-[#5D34F7]/5 text-[#5D34F7] font-semibold'
                                  : 'border-gray-200 text-gray-700 hover:border-gray-300'}`}
                            >
                              {d}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Highest Education */}
                    <div className="space-y-2">
                      {(() => {
                        const visibleQuals = showAllPrefEducations ? qualificationsList : qualificationsList.slice(0, 10);
                        const hasMore = qualificationsList.length > 10;
                        return (
                          <>
                            <div className="flex justify-between items-center mb-1">
                              <span className="text-sm font-semibold text-gray-700 block">Preferred Highest Education</span>
                              <button
                                type="button"
                                onClick={() => {
                                  const isAllSelected = qualificationsList.every(q => prefEducations.includes(q));
                                  if (isAllSelected) {
                                    setPrefEducations(prefEducations.filter(q => !qualificationsList.includes(q)));
                                  } else {
                                    setPrefEducations([...new Set([...prefEducations, ...qualificationsList])]);
                                    setShowAllPrefEducations(true);
                                  }
                                }}
                                className="text-xs text-[#5D34F7] font-semibold hover:underline bg-transparent border-0 cursor-pointer"
                              >
                                {qualificationsList.every(q => prefEducations.includes(q)) ? 'Deselect All' : 'Select All'}
                              </button>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {visibleQuals.map(q => {
                                const isSel = prefEducations.includes(q);
                                return (
                                  <button
                                    key={q}
                                    type="button"
                                    onClick={() => {
                                      if (isSel) {
                                        setPrefEducations(prefEducations.filter(x => x !== q));
                                      } else {
                                        setPrefEducations([...prefEducations, q]);
                                      }
                                    }}
                                    className={`px-4 py-2 rounded-xl border text-[13px] font-medium transition-colors
                              ${isSel
                                        ? 'border-[#5D34F7] bg-[#5D34F7]/5 text-[#5D34F7] font-semibold'
                                        : 'border-gray-200 text-gray-700 hover:border-gray-300'}`}
                                  >
                                    {q}
                                  </button>
                                );
                              })}
                              {hasMore && (
                                <button
                                  type="button"
                                  onClick={() => setShowAllPrefEducations(!showAllPrefEducations)}
                                  className="text-[#5D34F7] text-xs font-semibold hover:underline block w-full text-left mt-1"
                                >
                                  {showAllPrefEducations ? 'Show Less' : `Show More (+${qualificationsList.length - 10})`}
                                </button>
                              )}
                            </div>
                          </>
                        );
                      })()}
                    </div>

                    {/* Profession / Work Role */}
                    <div className="space-y-2">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm font-semibold text-gray-700 block">Preferred Profession / Work Role</span>
                        <button
                          type="button"
                          onClick={() => {
                            const isAllSelected = workRolesList.every(w => prefProfessions.includes(w));
                            if (isAllSelected) {
                              setPrefProfessions(prefProfessions.filter(w => !workRolesList.includes(w)));
                            } else {
                              setPrefProfessions([...new Set([...prefProfessions, ...workRolesList])]);
                              setShowAllPrefProfessions(true);
                            }
                          }}
                          className="text-xs text-[#5D34F7] font-semibold hover:underline bg-transparent border-0 cursor-pointer"
                        >
                          {workRolesList.every(w => prefProfessions.includes(w)) ? 'Deselect All' : 'Select All'}
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {(() => {
                          const visibleRoles = showAllPrefProfessions ? workRolesList : workRolesList.slice(0, 10);
                          const hasMore = workRolesList.length > 10;
                          return (
                            <>
                              {visibleRoles.map(w => {
                                const isSel = prefProfessions.includes(w);
                                return (
                                  <button
                                    key={w}
                                    type="button"
                                    onClick={() => {
                                      if (isSel) {
                                        setPrefProfessions(prefProfessions.filter(x => x !== w));
                                      } else {
                                        setPrefProfessions([...prefProfessions, w]);
                                      }
                                    }}
                                    className={`px-4 py-2 rounded-xl border text-[13px] font-medium transition-colors
                              ${isSel
                                        ? 'border-[#5D34F7] bg-[#5D34F7]/5 text-[#5D34F7] font-semibold'
                                        : 'border-gray-200 text-gray-700 hover:border-gray-300'}`}
                                  >
                                    {w}
                                  </button>
                                );
                              })}
                              {hasMore && (
                                <button
                                  type="button"
                                  onClick={() => setShowAllPrefProfessions(!showAllPrefProfessions)}
                                  className="text-[#5D34F7] text-xs font-semibold hover:underline block w-full text-left mt-1"
                                >
                                  {showAllPrefProfessions ? 'Show Less' : `Show More (+${workRolesList.length - 10})`}
                                </button>
                              )}
                            </>
                          );
                        })()}
                      </div>
                    </div>

                    {/* Annual Income */}
                    <div className="space-y-2">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm font-semibold text-gray-700 block">Preferred Annual Income</span>
                        <button
                          type="button"
                          onClick={() => {
                            const isAllSelected = incomesList.every(inc => prefIncomes.includes(inc));
                            setPrefIncomes(isAllSelected ? prefIncomes.filter(inc => !incomesList.includes(inc)) : [...new Set([...prefIncomes, ...incomesList])]);
                          }}
                          className="text-xs text-[#5D34F7] font-semibold hover:underline bg-transparent border-0 cursor-pointer"
                        >
                          {incomesList.every(inc => prefIncomes.includes(inc)) ? 'Deselect All' : 'Select All'}
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {incomesList.map(inc => {
                          const isSel = prefIncomes.includes(inc);
                          return (
                            <button
                              key={inc}
                              type="button"
                              onClick={() => {
                                if (isSel) {
                                  setPrefIncomes(prefIncomes.filter(x => x !== inc));
                                } else {
                                  setPrefIncomes([...prefIncomes, inc]);
                                }
                              }}
                              className={`px-4 py-2 rounded-xl border text-[13px] font-medium transition-colors
                          ${isSel
                                  ? 'border-[#5D34F7] bg-[#5D34F7]/5 text-[#5D34F7] font-semibold'
                                  : 'border-gray-200 text-gray-700 hover:border-gray-300'}`}
                            >
                              {inc}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                  </div>
                </div>
              )}

              {/* STEP 14 - Premium Membership */}
              {step === 14 && (
                <div className="smooth-step-transition space-y-6 relative">
                  {/* Decorative glowing blobs */}
                  <div className="absolute -top-10 -right-10 w-32 h-32 bg-[#5D34F7]/10 rounded-full blur-2xl pointer-events-none" />
                  <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl pointer-events-none" />

                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 bg-gradient-to-tr from-[#5D34F7]/25 to-amber-500/25 rounded-full flex items-center justify-center text-amber-500 shrink-0 shadow-lg shadow-[#5D34F7]/10">
                      <LucideIcons.Crown className="w-7 h-7 text-[#5D34F7] animate-pulse" />
                    </div>
                    <div>
                      <h2 className="text-xl font-black text-gray-900 leading-tight font-sans tracking-tight">Unlock Premium Features</h2>
                      <p className="text-gray-500 mt-1 text-xs leading-relaxed font-sans">
                        Choose a premium plan to connect instantly, unlock phone numbers, and boost your matchmaking matching rate.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-2">
                    {plans.map(plan => {
                      const isSelected = selectedPremiumPlan === plan.name;
                      const lowerName = plan.name.toLowerCase();
                      const theme = lowerName.includes('gold') ? 'gold' : lowerName.includes('diamond') ? 'diamond' : lowerName.includes('platinum') ? 'platinum' : 'standard';

                      let badgeBg = 'bg-gray-100 text-gray-800';
                      let cardBorder = isSelected ? 'border-[#5D34F7] ring-2 ring-[#5D34F7]/25 shadow-xl scale-[1.02]' : 'border-gray-100 hover:border-gray-200 hover:scale-[1.01] hover:shadow-md';
                      let headerBg = isSelected ? 'bg-[#5D34F7]/5' : 'bg-slate-50/50';

                      if (theme === 'gold') badgeBg = 'bg-amber-100 text-amber-800';
                      if (theme === 'diamond') badgeBg = 'bg-cyan-100 text-cyan-800';
                      if (theme === 'platinum') badgeBg = 'bg-indigo-100 text-indigo-850';

                      const planFeatures = [];
                      planFeatures.push(`Send Interests: ${plan.interestsLimit === 9999 ? 'Unlimited' : (plan.interestsLimit || 0)}`);
                      planFeatures.push(`View Profiles: ${plan.viewProfilesPerDay === 9999 ? 'Unlimited' : (plan.viewProfilesPerDay || 0)}`);
                      if (plan.directMessaging) planFeatures.push('Direct Messaging Enabled');
                      if (plan.videoCalling) planFeatures.push('Video Calling Enabled');
                      if (plan.voiceCalling) planFeatures.push('Voice Calling Enabled');
                      if (plan.managedByUs) planFeatures.push('Dedicated Account Manager');

                      return (
                        <div
                          key={plan._id || plan.name}
                          onClick={() => setSelectedPremiumPlan(isSelected ? null : plan.name)}
                          className={`relative rounded-3xl border bg-white cursor-pointer overflow-hidden transition-all duration-300 flex flex-col justify-between ${cardBorder}`}
                        >
                          <div className={`p-5 flex-1 flex flex-col justify-between ${headerBg}`}>
                            <div>
                              <div className="flex items-center justify-between mb-2">
                                <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${badgeBg}`}>
                                  {theme}
                                </span>
                                {isSelected && (
                                  <div className="w-5 h-5 rounded-full bg-[#5D34F7] text-white flex items-center justify-center shadow-md">
                                    <LucideIcons.Check className="w-3.5 h-3.5 stroke-[3]" />
                                  </div>
                                )}
                              </div>
                              <h3 className="font-extrabold text-gray-950 text-base font-sans tracking-tight mb-3">{plan.name}</h3>

                              <div className="flex justify-between items-baseline mb-4">
                                <span className="text-2xl font-black text-[#5D34F7] tracking-tight">₹{plan.price.toLocaleString()}</span>
                                <span className="text-gray-400 text-[10px] font-bold uppercase tracking-wider">/ {plan.durationDays} Days</span>
                              </div>
                            </div>

                            <hr className="border-gray-150/40 my-3" />

                            <ul className="space-y-2.5 mt-2">
                              {planFeatures.map((feature, i) => (
                                <li key={i} className="flex items-start gap-2.5 text-[11px] text-gray-650 leading-relaxed font-sans font-medium">
                                  <LucideIcons.CheckCircle className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                                  <span>{feature}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* STEP 15 - ID & Selfie Verification */}
              {step === 15 && (
                <div className="smooth-step-transition space-y-6">
                  <div className="w-16 h-16 bg-[#5D34F7]/10 rounded-full flex items-center justify-center mb-6 text-[#5D34F7]">
                    <LucideIcons.ShieldCheck className="w-8 h-8" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Verify Your Identity</h2>
                  <p className="text-gray-500 mb-8 text-[15px]">
                    To maintain a safe community, please upload a valid Photo ID proof and a Selfie. Verified profiles get a blue tick and more matches!
                  </p>

                  <div className="space-y-6">
                    {/* ID Proof Upload */}
                    <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm hover:border-[#5D34F7]/30 transition-colors">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="font-bold text-gray-900">Photo ID Proof</h3>
                          <p className="text-xs text-gray-500 mt-1">Aadhaar, PAN, Passport, or Voter ID</p>
                        </div>
                        {idProofDoc ? (
                          <LucideIcons.CheckCircle2 className="w-6 h-6 text-emerald-500" />
                        ) : (
                          <LucideIcons.FileImage className="w-6 h-6 text-gray-400" />
                        )}
                      </div>

                      {idProofDoc ? (
                        <div className="relative rounded-xl overflow-hidden border border-gray-200 group">
                          <img src={getPhotoUrl(idProofDoc)} alt="ID Proof" className="w-full h-48 object-cover" />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                            <label className="cursor-pointer bg-white text-gray-900 px-4 py-2 rounded-lg font-semibold text-sm flex items-center gap-2 hover:bg-gray-50 transition-colors shadow-sm">
                              <LucideIcons.Upload className="w-4 h-4" /> Change File
                              <input type="file" className="hidden" accept="image/*" onChange={(e) => handleDocUpload(e, 'id')} />
                            </label>
                            <label className="cursor-pointer bg-[#5D34F7] text-white px-4 py-2 rounded-lg font-semibold text-sm flex items-center gap-2 hover:bg-[#4a2ab8] transition-colors shadow-sm">
                              <LucideIcons.Camera className="w-4 h-4" /> Retake Photo
                              <input type="file" className="hidden" accept="image/*" capture="environment" onChange={(e) => handleDocUpload(e, 'id')} />
                            </label>
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center w-full h-36 border-2 border-dashed border-gray-300 rounded-xl hover:bg-gray-50 hover:border-[#5D34F7]/50 transition-colors bg-gray-50/50">
                          <div className="flex flex-col items-center justify-center pt-4 pb-2">
                            {isUploadingID ? (
                              <LucideIcons.Loader2 className="w-8 h-8 text-[#5D34F7] animate-spin mb-2" />
                            ) : (
                              <LucideIcons.ShieldCheck className="w-8 h-8 text-gray-400 mb-2" />
                            )}
                            <p className="text-sm text-gray-500 font-medium mb-3">
                              {isUploadingID ? 'Uploading...' : 'Upload or take a photo of your ID'}
                            </p>
                          </div>
                          <div className="flex gap-3 pb-3">
                            <label className="cursor-pointer bg-white border border-gray-200 text-gray-700 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 hover:bg-gray-100 transition-colors shadow-sm">
                              <LucideIcons.UploadCloud className="w-3.5 h-3.5" /> Upload File
                              <input type="file" className="hidden" accept="image/*" onChange={(e) => handleDocUpload(e, 'id')} disabled={isUploadingID} />
                            </label>
                            <label className="cursor-pointer bg-[#5D34F7] text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 hover:bg-[#4a2ab8] transition-colors shadow-sm">
                              <LucideIcons.Camera className="w-3.5 h-3.5" /> Take Photo
                              <input type="file" className="hidden" accept="image/*" capture="environment" onChange={(e) => handleDocUpload(e, 'id')} disabled={isUploadingID} />
                            </label>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Selfie Upload */}
                    <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm hover:border-[#5D34F7]/30 transition-colors">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="font-bold text-gray-900">Recent Selfie</h3>
                          <p className="text-xs text-gray-500 mt-1">A clear photo of your face</p>
                        </div>
                        {selfieDoc ? (
                          <LucideIcons.CheckCircle2 className="w-6 h-6 text-emerald-500" />
                        ) : (
                          <LucideIcons.Camera className="w-6 h-6 text-gray-400" />
                        )}
                      </div>

                      {selfieDoc ? (
                        <div className="relative rounded-xl overflow-hidden border border-gray-200 group">
                          <img src={getPhotoUrl(selfieDoc)} alt="Selfie" className="w-full h-48 object-cover" />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                            <label className="cursor-pointer bg-white text-gray-900 px-4 py-2 rounded-lg font-semibold text-sm flex items-center gap-2 hover:bg-gray-50 transition-colors shadow-sm">
                              <LucideIcons.Upload className="w-4 h-4" /> Change File
                              <input type="file" className="hidden" accept="image/*" onChange={(e) => handleDocUpload(e, 'selfie')} />
                            </label>
                            <label className="cursor-pointer bg-[#5D34F7] text-white px-4 py-2 rounded-lg font-semibold text-sm flex items-center gap-2 hover:bg-[#4a2ab8] transition-colors shadow-sm">
                              <LucideIcons.Camera className="w-4 h-4" /> Retake Selfie
                              <input type="file" className="hidden" accept="image/*" capture="user" onChange={(e) => handleDocUpload(e, 'selfie')} />
                            </label>
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center w-full h-36 border-2 border-dashed border-gray-300 rounded-xl hover:bg-gray-50 hover:border-[#5D34F7]/50 transition-colors bg-gray-50/50">
                          <div className="flex flex-col items-center justify-center pt-4 pb-2">
                            {isUploadingSelfie ? (
                              <LucideIcons.Loader2 className="w-8 h-8 text-[#5D34F7] animate-spin mb-2" />
                            ) : (
                              <LucideIcons.UserSquare2 className="w-8 h-8 text-gray-400 mb-2" />
                            )}
                            <p className="text-sm text-gray-500 font-medium mb-3">
                              {isUploadingSelfie ? 'Uploading...' : 'Upload or take a selfie'}
                            </p>
                          </div>
                          <div className="flex gap-3 pb-3">
                            <label className="cursor-pointer bg-white border border-gray-200 text-gray-700 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 hover:bg-gray-100 transition-colors shadow-sm">
                              <LucideIcons.UploadCloud className="w-3.5 h-3.5" /> Upload File
                              <input type="file" className="hidden" accept="image/*" onChange={(e) => handleDocUpload(e, 'selfie')} disabled={isUploadingSelfie} />
                            </label>
                            <label className="cursor-pointer bg-[#5D34F7] text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 hover:bg-[#4a2ab8] transition-colors shadow-sm">
                              <LucideIcons.Camera className="w-3.5 h-3.5" /> Take Selfie
                              <input type="file" className="hidden" accept="image/*" capture="user" onChange={(e) => handleDocUpload(e, 'selfie')} disabled={isUploadingSelfie} />
                            </label>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

            </div>

            {/* Footer Actions */}
            <div className="p-4 bg-white backdrop-blur-md border-t border-gray-100 mt-auto z-20">
              {error && (
                <div className="bg-red-50 text-red-500 p-3 rounded-xl mb-4 text-sm text-center">
                  {error}
                </div>
              )}
              <div className="flex gap-3">
                {step > 1 && (
                  <button
                    onClick={handleBack}
                    disabled={isSaving}
                    className="flex-1 py-2.5 rounded-xl border border-gray-200 bg-white text-gray-700 font-semibold text-sm hover:bg-gray-50 transition-colors disabled:opacity-50"
                  >
                    Back
                  </button>
                )}
                {step === 14 && (
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedPremiumPlan(null);
                      handleNext({ skipValidation: true });
                    }}
                    disabled={isSaving}
                    className="flex-1 py-2.5 rounded-xl border border-gray-300 bg-white text-gray-700 font-semibold text-sm hover:bg-gray-50 transition-colors disabled:opacity-50"
                  >
                    Skip to free
                  </button>
                )}
                {(step === 8 || step === 11 || step === 15) && (
                  <button
                    type="button"
                    onClick={() => handleNext({ skipValidation: true })}
                    disabled={isSaving}
                    className="flex-1 py-2.5 rounded-xl border border-[#5D34F7] bg-white text-[#5D34F7] font-semibold text-sm hover:bg-[#5D34F7]/5 transition-colors disabled:opacity-50"
                  >
                    Skip
                  </button>
                )}
                <button
                  onClick={handleNext}
                  disabled={isSaving}
                  className="flex-[2] py-2.5 rounded-xl bg-gradient-to-r from-[#5D34F7] to-[#4024DB] text-white font-bold text-sm hover:opacity-95 transition-all shadow-md shadow-[#5D34F7]/20 disabled:opacity-50 transform active:scale-[0.98]"
                >
                  {isSaving ? 'Saving...' : step === 14 ? (selectedPremiumPlan ? 'Pay & Continue' : 'Continue') : step === 15 ? 'Finish' : 'Continue'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

const religionsList = [
  'Hindu', 'Muslim', 'Christian', 'Buddhist', 'Jain', 'Sikh', 'Jewish', 'Parsi', 'No Religion', 'Spiritual - not religious'
];

const communitiesList = [
  "Hindi", "Marathi", "Punjabi", "Bengali", "Gujarati", "Urdu", "Telugu", "Kannada",
  "English", "Tamil", "Odia", "Marwari", "Aka", "Arabic", "Arunachali", "Assamese",
  "Awadhi", "Baluchi", "Bhojpuri", "Bhutia", "Brahui", "Brij", "Burmese", "Chattisgarhi",
  "Chinese", "Coorgi", "Dogri", "French", "Garhwali", "Garo", "Haryanavi", "Himachali/Pahari",
  "Hindko", "Kakbarak", "Kanauji", "Kashmiri", "Khandesi", "Khasi", "Konkani", "Koshali",
  "Kumaoni", "Kutchi", "Ladakhi", "Lepcha", "Magahi", "Maithili", "Malay", "Malayalam",
  "Manipuri", "Miji", "Mizo", "Monpa", "Nepali", "Pashto", "Persian", "Rajasthani",
  "Russian", "Sanskrit", "Santhali", "Seraiki", "Sindhi", "Sinhala", "Sourashtra",
  "Spanish", "Swedish", "Tagalog", "Tulu", "Other"
];

const religionSubCommunitiesMap = {
  "Hindu": [
    "96 Kuli Maratha", "Adi Dharmi", "Adi Karnataka", "Ahom", "Baniya", "Bari",
    "Brahmin - Anavil", "Brahmin - Gour", "Brahmin - Other", "Chhetri", "Gowda",
    "Kashyap", "Kayastha", "Khatri", "Kshatriya", "Kushwaha", "Rajput", "Saha",
    "Scheduled Tribe (ST)", "Yadav", "24 Manai Telugu Chettiar", "96K Kokanastha",
    "Adi Andhra", "Adi Dravida", "Agamudayar", "Agarwal", "Agnikula Kshatriya",
    "Agri", "Ahir", "Ambalavasi", "Arcot", "Arekatica", "Arora", "Arunthathiyar",
    "Arya Vysya", "Aryasamaj", "Ayyaraka", "Badaga", "Baghel/Pal/Gaderiya", "Bahi",
    "Baidya", "Baishnab", "Baishya", "Bajantri", "Balija", "Balija - Naidu",
    "Banayat Oriya", "Banik", "Barai", "Barnwal", "Barujibi", "Besta", "Bhandari",
    "Bhatia", "Bhatraju", "Bhavsar", "Bhovi", "Billava", "Boya/Nayak/Naik", "Boyer",
    "Brahmbatt", "Brahmin - Audichya", "Brahmin - Barendra", "Brahmin - Bhatt",
    "Brahmin - Bhumihar", "Brahmin - Brahmbhatt", "Brahmin - Dadhich/Dadheech",
    "Brahmin - Daivadnya", "Brahmin - Danua", "Brahmin - Deshastha", "Brahmin - Dhiman",
    "Brahmin - Dravida", "Brahmin - Embrandiri", "Brahmin - Goswami", "Brahmin - Gowd Saraswat",
    "Brahmin - Gujar Gour", "Brahmin - Gurukkal", "Brahmin - Halua", "Brahmin - Havyaka",
    "Brahmin - Himachali", "Brahmin - Hoysala", "Brahmin - Iyengar", "Brahmin - Iyer",
    "Brahmin - Jangid", "Brahmin - Jhadua", "Brahmin - Jhijhotiya", "Brahmin - Kanyakubja",
    "Brahmin - Karhade", "Brahmin - Kashmiri Pandit", "Brahmin - Kokanastha", "Brahmin - Kota",
    "Brahmin - Kulin", "Brahmin - Kumaoni", "Brahmin - Madhwa", "Brahmin - Maithili",
    "Brahmin - Modh", "Brahmin - Mohyal", "Brahmin - Nagar", "Brahmin - Namboodiri",
    "Brahmin - Niyogi", "Brahmin - Niyogi Nandavariki", "Brahmin - Paliwal", "Brahmin - Panda",
    "Brahmin - Pareek", "Brahmin - Pushkarna", "Brahmin - Rarhi", "Brahmin - Rudraj",
    "Brahmin - Sakaldwipi", "Brahmin - Sanadya", "Brahmin - Sanketi", "Brahmin - Saraswat",
    "Brahmin - Sarua", "Brahmin - Saryuparin", "Brahmin - Shivhalli", "Brahmin - Shrimali",
    "Brahmin - Smartha", "Brahmin - Sri Vaishnava", "Brahmin - Stanika", "Brahmin - Tyagi",
    "Brahmin - Vaidiki", "Brahmin - Vaikhanasa", "Brahmin - Velanadu", "Brahmin - Viswabrahmin",
    "Brahmin - Vyas", "Brahmo", "Buddar", "Bunt (Shetty)", "CKP", "Chalawadi Holeya",
    "Chambhar", "Chandravanshi Kahar", "Chasa", "Chattada Sri Vaishnava", "Chaudary",
    "Chaurasia", "Chekkala - Nair", "Chennadasar", "Cheramar", "Chettiar", "Chippolu/Mera",
    "Devadiga", "Devanga", "Devar/Thevar/Mukkulathor", "Devendra Kula Vellalar", "Dhangar",
    "Dheevara", "Dhiman", "Dhoba", "Digambar", "Dommala", "Dusadh", "Ediga", "Ezhava",
    "Ezhuthachan", "Gabit", "Ganakar", "Gandla", "Ganiga", "Gatti", "Gavali", "Gavara",
    "Ghumar", "Goala", "Goswami", "Goud", "Gounder", "Gramani", "Gudia", "Gujjar", "Gupta",
    "Guptan", "Gurjar", "Halwai", "Hegde", "Helava", "Hugar (Jeer)", "Intercaste", "Jaalari",
    "Jaiswal", "Jandra", "Jangam", "Jat", "Jatav", "Jetty Malla", "Kachara", "Kaibarta",
    "Kakkalan", "Kalar", "Kalinga", "Kalinga Vysya", "Kalita", "Kalwar", "Kamboj", "Kamma",
    "Kamma Naidu", "Kammala", "Kaniyan", "Kansari", "Kanu", "Kapu", "Kapu Naidu", "Karana",
    "Karmakar", "Kartha", "Karuneegar", "Kasar", "Kavuthiyya/Ezhavathy", "Khandayat",
    "Khandelwal", "Kharwar", "Khatik", "Kirar", "Koli", "Koli Patel", "Kongu Vellala Gounder",
    "Korama", "Kori", "Koshti", "Krishnavaka", "Kshatriya - Bhavasar", "Kshatriya/Raju/Varma",
    "Kudumbi", "Kulal", "Kulalar", "Kulita", "Kumawat", "Kumbara", "Kumbhakar/Kumbhar",
    "Kumhar", "Kummari", "Kunbi", "Kurava", "Kuravan", "Kurmi", "Kurmi Kshatriya", "Kuruba",
    "Kuruhina Shetty", "Kurumbar", "Kurup", "Lambadi/Banjara", "Lambani", "Leva Patil",
    "Lingayath", "Lohana", "Lohar", "Loniya/Lonia/Lunia", "Lubana", "Madhesiya", "Madiga",
    "Mahajan", "Mahar", "Mahendra", "Maheshwari", "Mahindra", "Mahishya", "Majabi", "Mala",
    "Malayalee Variar", "Mali", "Mallah", "Mangalorean", "Maniyani", "Mannadiar", "Mannan",
    "Mapila", "Marar", "Maratha", "Maratha - Gomantak", "Maruthuvar", "Marvar", "Marwari",
    "Matang", "Maurya", "Meda", "Medara", "Meena", "Meenavar", "Meghwal", "Mehra", "Menon",
    "Meru Darji", "Modak", "Mogaveera", "Monchi", "Mudaliar", "Mudaliar - Arcot", "Mudaliar - Saiva",
    "Mudaliar - Senguntha", "Mudiraj", "Munnuru Kapu", "Muthuraja", "Naagavamsam", "Nadar",
    "Nagaralu", "Nai", "Naicken", "Naicker", "Naidu", "Naik", "Nair", "Nair - Vaniya",
    "Nair - Velethadathu", "Nair - Vilakkithala", "Namasudra", "Nambiar", "Nambisan", "Namdev",
    "Namosudra", "Napit", "Nayak", "Nayaka", "Neeli", "Nhavi", "OBC - Barber/Naayee", "Oswal",
    "Otari", "Padmasali", "Panchal", "Pandaram", "Panicker", "Paravan", "Parit", "Parkava Kulam",
    "Partraj", "Pasi", "Paswan", "Patel", "Patel - Desai", "Patel - Dodia", "Patel - Kadva",
    "Patel - Leva", "Patnaick", "Patra", "Patwa", "Perika", "Pillai", "Pisharody", "Poduval",
    "Poosala", "Porwal", "Prajapati", "Pulaya", "Raigar", "Rajaka/Chakali/Dhobi", "Rajbhar",
    "Rajput - Kumaoni", "Rajput - Lodhi", "Ramdasia", "Ramgharia", "Rauniyar", "Ravidasia",
    "Rawat", "Reddiar", "Reddy", "Relli", "SSK", "Sadgop", "Sagara - Uppara", "Sahu", "Saini",
    "Saiva Vellala", "Saliya", "Sambava", "Satnami", "Savji", "Scheduled Caste (SC)",
    "Senai Thalaivar", "Sepahia", "Setti Balija", "Shah", "Shilpkar", "Shimpi", "Sindhi - Bhanusali",
    "Sindhi - Bhatia", "Sindhi - Chhapru", "Sindhi - Dadu", "Sindhi - Hyderabadi", "Sindhi - Larai",
    "Sindhi - Lohana", "Sindhi - Rohiri", "Sindhi - Sehwani", "Sindhi - Thatai", "Sindhi-Amil",
    "Sindhi-Baibhand", "Sindhi-Larkana", "Sindhi-Sahiti", "Sindhi-Sakkhar", "Sindhi-Shikarpuri",
    "Somvanshi", "Sonar", "Soni", "Sozhiya Vellalar", "Sri Vaishnava", "Srisayana", "Subarna Banik",
    "Sugali (Naika)", "Sundhi", "Surya Balija", "Sutar", "Suthar", "Swakula Sali", "Swarnakar",
    "Tamboli", "Tanti", "Tantuway", "Telaga", "Teli", "Thachar", "Thakkar", "Thakur", "Thandan",
    "Thigala", "Thiyya", "Thuluva Vellala", "Tili", "Togata", "Turupu Kapu", "Udayar",
    "Urali Gounder", "Urs", "Vada Balija", "Vadagalai", "Vaddera", "Vaduka", "Vaish",
    "Vaish - Dhaneshawat", "Vaishnav", "Vaishnav - Bhatia", "Vaishnav - Vania", "Vaishya",
    "Vallala", "Valluvan", "Valmiki", "Vanika Vyshya", "Vaniya Chettiar", "Vanjara", "Vankar",
    "Vannan", "Vannar", "Vanniyakullak Kshatriya", "Vanniyar", "Variar", "Varshney", "Veerashaiva",
    "Velaan", "Velama", "Velar", "Vellalar", "Veluthedathu - Nair", "Vettuva Gounder",
    "Vishwakarma", "Viswabrahmin", "Vokkaliga", "Vysya", "Waada Balija", "Yellapu", "Other"
  ],
  "Muslim": [
    "Ansari", "Arain", "Awan", "Dekkani", "Jat", "Lebbai", "Memon", "Mughal", "Pathan",
    "Qureshi", "Rajput", "Shafi", "Sheikh", "Shia", "Shia Ithna ashariyyah", "Siddiqui",
    "Sunni", "Sunni Ehle-Hadith", "Sunni Hanafi", "Sunni Shafi", "Syed", "Dawoodi Bohra",
    "Dudekula", "Khoja", "Mapila", "Maraicar", "Rowther", "Shia Bohra", "Shia Imami Ismaili",
    "Shia Zaidi", "Sunni Hunbali", "Sunni Maliki", "Other"
  ],
  "Christian": [
    "Anglo Indian", "Born Again", "Bretheren", "CMS", "Catholic", "Church of North India (CNI)",
    "Church of South India (CSI)", "Convert", "Evangelical", "IPC", "Indian Orthodox",
    "Intercaste", "Methodist", "Orthodox", "Pentecost", "Presbyterian", "Protestant",
    "Roman Catholic", "Salvation Army", "Scheduled Caste (SC)", "Seventh day Adventist",
    "Basel Mission", "Cannonite", "Catholic Knanya", "Catholic Malankara", "Chaldean Syrian",
    "Cheramar", "Jacobite", "Jacobite Knanya", "Knanaya", "Knanaya Catholic", "Knanaya Jacobite",
    "Knanaya Pentecostal", "Knanya", "Latin Catholic", "Malankara", "Malankara Catholic",
    "Manglorean", "Marthoma", "Mormon", "Nadar", "RCSC", "Scheduled Tribe (ST)", "Syrian",
    "Syrian Catholic", "Syrian Orthodox", "Syro Malabar", "Other"
  ],
  "Buddhist": ["Other"],
  "Jain": [
    "Digambar", "Porwal", "Shwetamber", "Vania", "Other"
  ],
  "Sikh": [
    "Ahluwalia", "Arora", "Clean Shaven", "Gursikh", "Jat", "Kamboj", "Kesadhari",
    "Khatri", "Kshatriya", "Labana", "Mazhbi/Majabi", "Rajput", "Ramdasia", "Ramgharia",
    "Ravidasia", "Saini", "Other"
  ],
  "Jewish": ["Other"],
  "Parsi": ["Other"],
  "No Religion": ["Other"],
  "Spiritual - not religious": ["Other"]
};

const religionCastesMap = {
  'Hindu': [
    'Brahmin', 'Rajput', 'Jat', 'Yadav', 'Maratha', 'Nair', 'Kshatriya', 'Vaishya',
    'Kayastha', 'Agarwal', 'Lingayat', 'Reddy', 'Patel', 'Kurmi', 'Gupta', 'Sonar',
    'Jatav', 'Baniya', 'Kamma', 'Kapu', 'Mudaliar', 'Nadar', 'Gounder', 'Vishwakarma',
    'Lohar', 'Chamar', 'Dhobi', 'Nai', 'Kumhar', 'Teli', 'Koli', 'Gurjar', 'Meena',
    'Arora', 'Khatri', 'Iyer', 'Iyengar', 'Billava', 'Ezhava', 'Thevar', 'Vanniyar',
    'Velama', 'Vokkaliga', 'Saraswat', 'Bhumihar', 'Chitpavan', 'Devanga', 'Goud',
    'Kuruba', 'Mahar', 'Panchal', 'Sadgop', 'Saini', 'Sengunthar', 'Tili', 'Other'
  ],
  'Muslim': [
    'Sunni', 'Shia', 'Syed', 'Sheikh', 'Pathan', 'Mughal', 'Ansari', 'Qureshi',
    'Bohra', 'Khoja', 'Malik', 'Khan', 'Rayeen', 'Mansoori', 'Dekkani', 'Mapilla',
    'Memon', 'Rowther', 'Lebbai', 'Momin', 'Shafi', 'Hanafi', 'Other'
  ],
  'Christian': [
    'Roman Catholic', 'Protestant', 'Orthodox', 'Syrian Catholic', 'Pentecostal',
    'Methodist', 'Baptist', 'Marthoma', 'Latin Catholic', 'Knanaya', 'Anglo Indian',
    'Jacobite', 'Syro-Malabar', 'Syro-Malankara', 'CSI', 'CNI', 'Other'
  ],
  'Sikh': [
    'Jat Sikh', 'Khatri', 'Arora', 'Ramgarhia', 'Mazhabi', 'Saini', 'Rajput Sikh',
    'Ahluwalia', 'Kamboj', 'Lubana', 'Ravidasia', 'Bhatra', 'Ghuman', 'Other'
  ],
  'Buddhist': [
    'Mahayana', 'Theravada', 'Neo-Buddhist', 'Mahar', 'Tibetan Buddhist', 'Other'
  ],
  'Jain': [
    'Jain - Digambar', 'Jain - Shvetambar', 'Oswal', 'Porwal', 'Khandelwal',
    'Agarwal Jain', 'Humad', 'Jaiswal', 'Shrimal', 'Other'
  ],
  'Parsi': [
    'Irani', 'Shenshai', 'Kadmi', 'Zoroastrian', 'Other'
  ],
  'Jewish': [
    'Bene Israel', 'Cochin Jewish', 'Baghdadi Jewish', 'Other'
  ],
  'Bahai': [
    'Bahai community', 'Other'
  ],
  'Other': [
    'Other', 'Not Specified'
  ]
};

const casteSubCommunitiesMap = {
  // Hindu
  'Brahmin': ['Saraswat', 'Kanyakubja', 'Gaur', 'Saryuparin', 'Iyer', 'Iyengar', 'Bhumihar', 'Chitpavan', 'Namboodiri', 'Nagar', 'Smartha', 'Sri Vaishnava', 'Other'],
  'Rajput': ['Shekhawat', 'Rathore', 'Chauhan', 'Sisodia', 'Jadeja', 'Parmar', 'Tomar', 'Bundela', 'Solanki', 'Other'],
  'Jat': ['Gill', 'Mann', 'Sidhu', 'Dhillon', 'Sandhu', 'Grewal', 'Hooda', 'Dagar', 'Malik', 'Other'],
  'Yadav': ['Ahir', 'Gwal', 'Nandavanshi', 'Suryavanshi', 'Krishnauth', 'Majraut', 'Other'],
  'Maratha': ['96 Kuli Maratha', 'Kunbi Maratha', 'Koknastha', 'Deshmukh', 'Patil', 'Other'],
  'Nair': ['Kiryath Nair', 'Illathu Nair', 'Swaroopathu Nair', 'Menon', 'Pillai', 'Panicker', 'Other'],
  'Kshatriya': ['Raju', 'Verma', 'Khatri', 'Bhatia', 'Other'],
  'Vaishya': ['Arya Vysya', 'Komati', 'Gupta', 'Maheshwari', 'Mahajan', 'Other'],
  'Kayastha': ['Srivastava', 'Saxena', 'Mathur', 'Bhatnagar', 'Nigam', 'Asthana', 'Bengali Kayastha', 'Other'],
  'Agarwal': ['Goel', 'Garg', 'Bansal', 'Singhal', 'Mittal', 'Jindal', 'Other'],
  'Lingayat': ['Veerashaiva', 'Jangam', 'Panchachara', 'Sadar', 'Banajiga', 'Other'],
  'Reddy': ['Motati', 'Gudati', 'Pokanati', 'Pedakanti', 'Reddiar', 'Other'],
  'Patel': ['Kadva Patel', 'Leuva Patel', 'Anjana Patel', 'Other'],
  'Kurmi': ['Verma', 'Patel', 'Sachan', 'Gangwar', 'Jaiswar', 'Other'],
  'Gupta': ['Sahu', 'Shaw', 'Teli', 'Halwai', 'Other'],
  'Sonar': ['Daivajna', 'Sunar', 'Other'],
  'Jatav': ['Chamar', 'Jatav', 'Other'],
  'Baniya': ['Agarwal', 'Oswal', 'Maheshwari', 'Porwal', 'Other'],
  'Kamma': ['Chowdary', 'Naidu', 'Other'],
  'Kapu': ['Balija', 'Munnuru Kapu', 'Telaga', 'Naidu', 'Other'],
  'Mudaliar': ['Arcot', 'Vellalar', 'Sengunthar', 'Other'],
  'Nadar': ['Shanar', 'Nadar', 'Other'],
  'Gounder': ['Kongu Vellalar', 'Gounder', 'Other'],
  'Vishwakarma': ['Jangid', 'Panchal', 'Sutar', 'Other'],
  // Muslim
  'Sunni': ['Hanafi', 'Shafi', 'Maliki', 'Hanbali', 'Deobandi', 'Barelvi', 'Other'],
  'Shia': ['Ithna Ashari', 'Ismaili', 'Bohra', 'Khoja', 'Other'],
  'Syed': ['Hashmi', 'Gilani', 'Alvi', 'Zaidi', 'Other'],
  'Sheikh': ['Siddiqui', 'Farooqi', 'Usmani', 'Other'],
  'Pathan': ['Khan', 'Yousufzai', 'Afridi', 'Khattak', 'Other'],
  'Mughal': ['Mirza', 'Beg', 'Chughtai', 'Other'],
  'Ansari': ['Weaver', 'Momin Ansari', 'Other'],
  'Qureshi': ['Butcher', 'Qureshi Sheikh', 'Other'],
  'Bohra': ['Dawoodi Bohra', 'Alavi Bohra', 'Suleimani Bohra', 'Other'],
  'Khoja': ['Nizari', 'Ismaili', 'Shia Khoja', 'Other'],
  // Christian
  'Roman Catholic': ['Latin Catholic', 'Syrian Catholic', 'Mangalorean Catholic', 'Goan Catholic', 'Other'],
  'Protestant': ['CSI', 'CNI', 'Methodist', 'Baptist', 'Other'],
  'Orthodox': ['Malankara Orthodox', 'Syrian Orthodox', 'Knanaya Orthodox', 'Other'],
  'Syrian Catholic': ['Syrian Catholic', 'Syro-Malabar', 'Syro-Malankara', 'Other'],
  'Pentecostal': ['Assembly of God', 'IPC', 'New Life', 'Other'],
  // Sikh
  'Jat Sikh': ['Gill', 'Mann', 'Sidhu', 'Dhillon', 'Sandhu', 'Grewal', 'Other'],
  'Khatri': ['Sodhi', 'Bedi', 'Kapoor', 'Khanna', 'Malhotra', 'Sethi', 'Other'],
  'Arora': ['Chawla', 'Juneja', 'Ahuja', 'Taneja', 'Batra', 'Other'],
  'Ramgarhia': ['Vishwakarma', 'Tarkhan', 'Other'],
  'Mazhabi': ['Valmiki', 'Mazhabi', 'Other'],
  'Saini': ['Shoorsaini', 'Saini', 'Other'],
  'Rajput Sikh': ['Rathore', 'Chauhan', 'Parmar', 'Other'],
  // Jain
  'Jain - Digambar': ['Oswal', 'Porwal', 'Khandelwal', 'Humad', 'Jaiswal', 'Other'],
  'Jain - Shvetambar': ['Oswal', 'Porwal', 'Khandelwal', 'Shrimal', 'Other'],
  'Oswal': ['Jain Oswal', 'Other'],
  'Porwal': ['Jain Porwal', 'Other'],
  'Khandelwal': ['Jain Khandelwal', 'Other'],
  // Default / Other
  'Other': ['Saraswat', 'Srivastava', 'Kadva Patel', 'Shekhawat', 'Other']
};

const citiesList = [
  'Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Ahmedabad', 'Chennai', 'Kolkata', 'Surat', 'Pune', 'Jaipur',
  'Lucknow', 'Kanpur', 'Nagpur', 'Indore', 'Thane', 'Bhopal', 'Visakhapatnam', 'Patna', 'Vadodara', 'Ghaziabad',
  'Ludhiana', 'Coimbatore', 'Agra', 'Madurai', 'Nashik', 'Faridabad', 'Rajkot', 'Varanasi', 'Srinagar',
  'Amritsar', 'Navi Mumbai', 'Ranchi', 'Jabalpur', 'Gwalior', 'Vijayawada', 'Jodhpur', 'Raipur', 'Kota',
  'Guwahati', 'Chandigarh', 'Other'
];

const stateCitiesMap = {
  'Maharashtra': ['Mumbai', 'Pune', 'Nagpur', 'Thane', 'Nashik', 'Aurangabad', 'Navi Mumbai', 'Solapur', 'Kolhapur', 'Amravati', 'Nanded', 'Other'],
  'Delhi': ['New Delhi', 'Delhi NCR', 'Dwarka', 'Rohini', 'Vasant Kunj', 'Saket', 'Connaught Place', 'Karol Bagh', 'Other'],
  'Karnataka': ['Bangalore', 'Mysore', 'Mangalore', 'Hubli-Dharwad', 'Belgaum', 'Gulbarga', 'Davangere', 'Shimoga', 'Udupi', 'Other'],
  'Gujarat': ['Ahmedabad', 'Surat', 'Vadodara', 'Rajkot', 'Bhavnagar', 'Jamnagar', 'Gandhinagar', 'Junagadh', 'Anand', 'Other'],
  'Uttar Pradesh': ['Lucknow', 'Kanpur', 'Ghaziabad', 'Agra', 'Varanasi', 'Meerut', 'Noida', 'Allahabad', 'Bareilly', 'Aligarh', 'Moradabad', 'Gorakhpur', 'Jhansi', 'Other'],
  'Rajasthan': ['Jaipur', 'Jodhpur', 'Udaipur', 'Kota', 'Bikaner', 'Ajmer', 'Alwar', 'Bhilwara', 'Sikar', 'Other'],
  'Punjab': ['Amritsar', 'Ludhiana', 'Jalandhar', 'Patiala', 'Bathinda', 'Mohali', 'Pathankot', 'Other'],
  'Haryana': ['Gurgaon', 'Faridabad', 'Panipat', 'Ambala', 'Rohtak', 'Karnal', 'Hisar', 'Panchkula', 'Other'],
  'West Bengal': ['Kolkata', 'Howrah', 'Durgapur', 'Asansol', 'Siliguri', 'Kharagpur', 'Darjeeling', 'Haldia', 'Other'],
  'Tamil Nadu': ['Chennai', 'Coimbatore', 'Madurai', 'Tiruchirappalli', 'Salem', 'Tiruppur', 'Erode', 'Vellore', 'Tuticorin', 'Other'],
  'Telangana': ['Hyderabad', 'Warangal', 'Nizamabad', 'Karimnagar', 'Khammam', 'Ramagundam', 'Other'],
  'Andhra Pradesh': ['Visakhapatnam', 'Vijayawada', 'Guntur', 'Nellore', 'Tirupati', 'Kurnool', 'Rajahmundry', 'Kakinada', 'Other'],
  'Madhya Pradesh': ['Bhopal', 'Indore', 'Jabalpur', 'Gwalior', 'Ujjain', 'Sagar', 'Dewas', 'Satna', 'Other'],
  'Bihar': ['Patna', 'Gaya', 'Bhagalpur', 'Muzaffarpur', 'Darbhanga', 'Purnia', 'Bihar Sharif', 'Arrah', 'Other'],
  'Kerala': ['Kochi', 'Trivandrum', 'Kozhikode', 'Thrissur', 'Kollam', 'Alappuzha', 'Palakkad', 'Kannur', 'Other'],
  'Odisha': ['Bhubaneswar', 'Cuttack', 'Rourkela', 'Sambalpur', 'Puri', 'Balasore', 'Other'],
  'Assam': ['Guwahati', 'Silchar', 'Dibrugarh', 'Jorhat', 'Nagaon', 'Other'],
  'Jammu & Kashmir': ['Srinagar', 'Jammu', 'Anantnag', 'Baramulla', 'Other'],
  'Uttarakhand': ['Dehradun', 'Haridwar', 'Roorkee', 'Haldwani', 'Rishikesh', 'Other'],
  'Jharkhand': ['Ranchi', 'Jamshedpur', 'Dhanbad', 'Bokaro Steel City', 'Deoghar', 'Other'],
  'Chhattisgarh': ['Raipur', 'Bhilai', 'Bilaspur', 'Korba', 'Durg', 'Other'],
  'Goa': ['Panaji', 'Margao', 'Vasco da Gama', 'Mapusa', 'Other'],
  'Himachal Pradesh': ['Shimla', 'Dharamshala', 'Solan', 'Mandi', 'Other'],
  'Tripura': ['Agartala', 'Other'],
  'Manipur': ['Imphal', 'Other'],
  'Meghalaya': ['Shillong', 'Other'],
  'Mizoram': ['Aizawl', 'Other'],
  'Nagaland': ['Kohima', 'Dimapur', 'Other'],
  'Sikkim': ['Gangtok', 'Other'],
  'Arunachal Pradesh': ['Itanagar', 'Other'],
  'Other State/Country': ['Other City', 'Not Listed']
};

const maritalStatusesList = [
  'Never Married', 'Awaiting Divorce', 'Divorced', 'Widowed', 'Annulled'
];

const dietsList = [
  'Veg', 'Non-Veg', 'Jain', 'Vegan', 'Eggetarian', 'Halal Only', 'Kosher Only'
];

const qualificationsList = [
  'BTech/BE', 'MTech/ME', 'MCA', 'MBA', 'MBBS', 'MD', 'BArch', 'MArch',
  'BSc', 'MSc', 'BCom', 'MCom', 'BBA', 'BCA', 'BA', 'MA', 'PhD', 'Diploma', 'High School', 'Other'
];

const collegesList = [
  'IIT Bombay', 'IIT Delhi', 'IIT Madras', 'IIT Kharagpur', 'IIT Kanpur', 'IIT Roorkee', 'IIT Guwahati',
  'IIT Hyderabad', 'IIT BHU Varanasi', 'IIT Indore', 'IIT Gandhinagar', 'IIT Ropar', 'IIT Patna', 'IIT Mandi',
  'BITS Pilani', 'BITS Mesra', 'NIT Trichy', 'NIT Surathkal', 'NIT Warangal', 'NIT Calicut', 'NIT Rourkela',
  'NIT Kurukshetra', 'NIT Silchar', 'NIT Durgapur', 'IISc Bangalore', 'IIM Ahmedabad', 'IIM Bangalore',
  'IIM Calcutta', 'IIM Lucknow', 'IIM Kozhikode', 'IIM Indore', 'XLRI Jamshedpur', 'ISB Hyderabad',
  'FMS Delhi', 'SPJIMR Mumbai', 'Delhi University (DU)', 'St. Stephen\'s College', 'SRCC', 'LSR', 'Miranda House',
  'Hindu College', 'Hansraj College', 'Kirori Mal College', 'Ramjas College', 'Sri Venkateswara College',
  'Mumbai University', 'St. Xavier\'s College Mumbai', 'HR College', 'NM College', 'Mithibai College',
  'Jai Hind College', 'Wilson College', 'Sophia College', 'VJTI Mumbai', 'COEP Pune', 'Pune University (SPPU)',
  'SYMBIOSIS International Pune', 'FLAME University Pune', 'MIT WPU Pune', 'Bharati Vidyapeeth', 'DY Patil University',
  'Anna University Chennai', 'PSG Tech Coimbatore', 'Madras Christian College', 'Loyola College Chennai',
  'JNTU Hyderabad', 'Osmania University', 'CBIT Hyderabad', 'Vasavi College of Engineering', 'VNR VJIET',
  'IIIT Hyderabad', 'IIIT Bangalore', 'IIIT Delhi', 'IIIT Allahabad', 'Calcutta University', 'Presidency University Kolkata',
  'Jadavpur University', 'St. Xavier\'s Kolkata', 'Heritage Institute of Technology', 'IEM Kolkata',
  'Gujarat Technological University (GTU)', 'Nirma University', 'LD College of Engineering', 'MS University Baroda',
  'DA-IICT Gandhinagar', 'PDEU Gandhinagar', 'LDRP Institute', 'Rajasthan Technical University', 'MNIT Jaipur',
  'Banasthali Vidyapith', 'LMNIIT Jaipur', 'Manipal University Jaipur', 'Amity University Noida', 'Amity University Gurgaon',
  'Lovely Professional University (LPU)', 'Chandigarh University', 'Thapar Institute Patiala', 'PEC Chandigarh',
  'Kurukshetra University', 'Chitkara University', 'Sharda University Greater Noida', 'Galgotias University',
  'Noida International University', 'Bennett University', 'GLA University Mathura', 'Invertis University Bareilly',
  'Integral University Lucknow', 'Babu Banarasi Das University', 'Graphic Era University Dehradun', 'UPES Dehradun',
  'Christ University Bangalore', 'Manipal Institute of Technology (MIT)', 'RV College of Engineering',
  'PES University Bangalore', 'MS Ramaiah Institute of Technology', 'BMS College of Engineering', 'Dayananda Sagar College',
  'Alliance University Bangalore', 'REVA University Bangalore', 'Jain University Bangalore', 'GITAM University Visakhapatnam',
  'Vignan University Guntur', 'KL University Vijayawada', 'VIT Vellore', 'SRM University Chennai',
  'Sathyabama University Chennai', 'Kalasalingam University', 'SASTRA University Thanjavur', 'SSN College of Engineering',
  'Kalinga Institute of Industrial Technology (KIIT)', 'ITER Bhubaneswar', 'Banaras Hindu University (BHU)',
  'Aligarh Muslim University (AMU)', 'Allahabad University', 'HBTI Kanpur', 'Harvard University', 'Stanford University',
  'MIT USA', 'Oxford University', 'Cambridge University', 'Columbia University', 'NYU', 'University of Toronto',
  'National University of Singapore (NUS)', 'Imperial College London', 'Other'
];

const incomesList = [
  'Under 3 LPA', '3-5 LPA', '5-7 LPA', '7-10 LPA', '10-15 LPA', '15-20 LPA', '20-30 LPA', '30-50 LPA',
  '50-70 LPA', '70 LPA - 1 Crore', '1 Crore+'
];

const workSectorsList = [
  'Private Sector', 'Government/Public Sector', 'Civil Services', 'Defense', 'Business/Self-employed', 'Not Working'
];

const workRolesList = [
  'Software Professional', 'Manager/Executive', 'Consultant', 'Doctor/Medical Professional',
  'Engineer (Non-IT)', 'Teacher/Educator', 'IAS/IPS/Civil Servant', 'Defense Personnel',
  'CA/Financial Analyst', 'Business Owner/Entrepreneur', 'Marketing/Sales', 'Scientist/Researcher',
  'HR Professional', 'Artist/Designer/Writer', 'Legal Professional', 'Student', 'Not Working', 'Other'
];

const heightsList = [
  '4\'5" (134 cm)', '4\'6" (137 cm)', '4\'7" (139 cm)', '4\'8" (142 cm)', '4\'9" (144 cm)', '4\'10" (147 cm)', '4\'11" (149 cm)',
  '5\'0" (152 cm)', '5\'1" (154 cm)', '5\'2" (157 cm)', '5\'3" (160 cm)', '5\'4" (162 cm)', '5\'5" (165 cm)', '5\'6" (167 cm)',
  '5\'7" (170 cm)', '5\'8" (172 cm)', '5\'9" (175 cm)', '5\'10" (177 cm)', '5\'11" (180 cm)',
  '6\'0" (182 cm)', '6\'1" (185 cm)', '6\'2" (187 cm)', '6\'3" (190 cm)', '6\'4" (193 cm)', '6\'5" (195 cm)', '6\'6" (198 cm)',
  '6\'7" (200 cm)', '6\'8" (203 cm)', '6\'9" (205 cm)', '6\'10" (208 cm)', '6\'11" (210 cm)', '7\'0" (213 cm)'
];

const motherStatusList = ['Employed', 'Business Woman', 'Retired', 'Homemaker', 'Passed Away'];
const fatherStatusList = ['Employed', 'Business Man', 'Retired', 'Homemaker', 'Passed Away'];

