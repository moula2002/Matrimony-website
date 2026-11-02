import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import api, { getPhotoUrl, getDefaultAvatar, handleImageError } from '../api/axios';
import { LocationService } from '../api/locationService';
import { COUNTRY_PHONE_STANDARDS, validatePhoneNumber } from '../api/phoneStandards';
import {
  User, Mail, Phone, Calendar, Landmark, MapPin,
  GraduationCap, Briefcase, Heart, Edit2, Check, Copy, X, Camera, Plus, Trash2, LogOut, Users, Sliders,
  ChevronRight, ChevronDown, ChevronUp, ArrowLeft, ArrowRight, Search, Loader2, Home, BookOpen, Activity, Info, Share2, Download, Sparkles, BadgeCheck, FileText, Scale, ShieldCheck,
  CheckCircle2, Clock, XCircle, ShieldAlert, AlertCircle, Lock, Star, Languages, Globe, Baby,
  MessageSquare
} from 'lucide-react';
import ShareModal from '../components/ShareModal';
import CallModal from '../components/CallModal';
import ContactInfoCard from '../components/ContactInfoCard';
import PhotoVerifiedBadge from '../components/PhotoVerifiedBadge';
import FullScreenImageViewer from '../components/FullScreenImageViewer';
import VipConsultantModal from '../components/VipConsultantModal';
import VipShaadiModal from '../components/VipShaadiModal';
import { getCachedUnlockedContacts, syncContactedProfiles } from '../utils/contactManager';
import {
  formatProfileCreatedBy,
  formatSiblings,
  formatChildrenDisplay,
  isPhotoVerified,
  getPhotoVerificationStatus,
  ALL_SPOKEN_LANGUAGES,
  formatLanguages,
  getLanguagesList,
  CHILDREN_FILTER_OPTIONS,
  normalizeChildrenForBackend,
  normalizeChildrenFromBackend,
  isZeroOrNoChildren
} from '../utils/profileHelpers';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import loadingImg from '../assets/loading.png';
import { fetchCommunitiesData, getSubCommunityOptions } from '../utils/communityService';

const ALL_GENDERS = ['Male', 'Female'];
const ALL_RELIGIONS = [
  'Hindu', 'Muslim', 'Christian', 'Sikh', 'Buddhist', 'Jain', 'Parsi', 'Jewish', 'Bahai', 'Other'
];
const ALL_MARITAL_STATUSES = [
  'Never Married', 'Awaiting Divorce', 'Divorced', 'Widowed', 'Annulled'
];
const ALL_HEIGHTS = [
  '4\'5" (134 cm)', '4\'6" (137 cm)', '4\'7" (139 cm)', '4\'8" (142 cm)', '4\'9" (144 cm)', '4\'10" (147 cm)', '4\'11" (149 cm)',
  '5\'0" (152 cm)', '5\'1" (154 cm)', '5\'2" (157 cm)', '5\'3" (160 cm)', '5\'4" (162 cm)', '5\'5" (165 cm)', '5\'6" (167 cm)',
  '5\'7" (170 cm)', '5\'8" (172 cm)', '5\'9" (175 cm)', '5\'10" (177 cm)', '5\'11" (180 cm)',
  '6\'0" (182 cm)', '6\'1" (185 cm)', '6\'2" (187 cm)', '6\'3" (190 cm)', '6\'4" (193 cm)', '6\'5" (195 cm)', '6\'6" (198 cm)',
  '6\'7" (200 cm)', '6\'8" (203 cm)', '6\'9" (205 cm)', '6\'10" (208 cm)', '6\'11" (210 cm)', '7\'0" (213 cm)'
];
const ALL_EDUCATIONS = [
  'BTech/BE', 'MTech/ME', 'MCA', 'MBA', 'MBBS', 'MD', 'BArch', 'MArch',
  'BSc', 'MSc', 'BCom', 'MCom', 'BBA', 'BCA', 'BA', 'MA', 'PhD', 'Diploma', 'High School', 'Other'
];
const ALL_PROFESSIONS = [
  'Software Professional', 'Manager/Executive', 'Consultant', 'Doctor/Medical Professional',
  'Engineer (Non-IT)', 'Teacher/Educator', 'IAS/IPS/Civil Servant', 'Defense Personnel',
  'CA/Financial Analyst', 'Business Owner/Entrepreneur', 'Marketing/Sales', 'Scientist/Researcher',
  'HR Professional', 'Artist/Designer/Writer', 'Legal Professional', 'Student', 'Not Working', 'Other'
];
const ALL_INCOMES = [
  'Under 3 LPA', '3-5 LPA', '5-7 LPA', '7-10 LPA', '10-15 LPA', '15-20 LPA', '20-30 LPA', '30-50 LPA',
  '50-70 LPA', '70 LPA - 1 Crore', '1 Crore+'
];
const ALL_LOCATIONS = [
  'Mumbai', 'Ahmedabad', 'Delhi', 'Bangalore', 'Jaipur', 'Lucknow', 'Chandigarh', 'Chennai', 'Kolkata', 'Pune', 'Hyderabad', 'Other'
];
const ALL_DIETS = [
  'Veg', 'Non-Veg', 'Jain', 'Vegan', 'Eggetarian', 'Halal Only', 'Kosher Only'
];
const ALL_WORK_SECTORS = [
  'Private Sector', 'Government/Public Sector', 'Civil Services', 'Defense', 'Business/Self-employed', 'Not Working'
];
const ALL_FINANCIAL_STATUSES = [
  'Elite', 'Ultra Rich', 'Rich', 'High', 'Middle', 'Upper Middle', 'Middle Class', 'Aspiring'
];
const HOBBIES_CATEGORIES = [
  { title: '🎨 Creative', items: ['Art', 'Painting', 'Music', 'Singing', 'Playing Instrument', 'Writing', 'Photography', 'Dancing', 'Acting', 'Cooking', 'Crafts'] },
  { title: '🎮 Fun', items: ['Movies', 'Gaming', 'Traveling', 'Comedy', 'Concerts', 'Dining Out', 'Watching Sports', 'Board Games', 'Socializing'] },
  { title: '💪 Fitness', items: ['Gym', 'Yoga', 'Running', 'Sports', 'Cycling', 'Swimming', 'Trekking', 'Martial Arts', 'Aerobics'] },
  { title: '📚 Other', items: ['Reading', 'Pets', 'Gardening', 'Volunteering', 'Blogging', 'Astrology', 'Tech/Gadgets', 'Podcasts'] }
];
const ALL_COLLEGES = [
  'IIT Bombay', 'IIT Delhi', 'IIT Madras', 'BITS Pilani', 'NIT Trichy', 'IIM Ahmedabad', 'IIM Bangalore',
  'Delhi University (DU)', 'Harvard University', 'Stanford University', 'MIT', 'Oxford University', 'Other'
];
const ALL_COMMUNITIES = [
  'Hindi', 'Marathi', 'Punjabi', 'Bengali', 'Gujarati', 'Urdu', 'Telugu', 'Kannada',
  'English', 'Tamil', 'Odia', 'Marwari', 'Assamese', 'Bhojpuri', 'Malayalam', 'Konkani',
  'Kashmiri', 'Sindhi', 'Nepali', 'Rajasthani', 'Maithili', 'Tulu', 'Other'
];

const RELIGION_CASTES_MAP = {
  'Hindu': ['Brahmin', 'Rajput', 'Jat', 'Yadav', 'Maratha', 'Nair', 'Kshatriya', 'Vaishya', 'Kayastha', 'Agarwal', 'Lingayat', 'Reddy', 'Patel', 'Kurmi', 'Gupta', 'Sonar', 'Jatav', 'Baniya', 'Kamma', 'Kapu', 'Mudaliar', 'Nadar', 'Gounder', 'Vishwakarma', 'Other'],
  'Muslim': ['Sunni', 'Shia', 'Syed', 'Sheikh', 'Pathan', 'Mughal', 'Ansari', 'Qureshi', 'Bohra', 'Khoja', 'Other'],
  'Christian': ['Roman Catholic', 'Protestant', 'Orthodox', 'Syrian Catholic', 'Pentecostal', 'Other'],
  'Sikh': ['Jat Sikh', 'Khatri', 'Arora', 'Ramgarhia', 'Mazhabi', 'Saini', 'Rajput Sikh', 'Other'],
  'Jain': ['Jain - Digambar', 'Jain - Shvetambar', 'Other'],
  'Buddhist': ['Neo Buddhist', 'Tibetan Buddhist', 'Other'],
  'Parsi': ['Irani', 'Parsi', 'Other'],
  'Jewish': ['Bene Israel', 'Cochin Jew', 'Baghdadi Jew', 'Other'],
  'Spiritual/Other': ['Other'],
  'Other': ['Other']
};

const CASTE_SUB_COMMUNITIES_MAP = {
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
  'Roman Catholic': ['Latin Catholic', 'Syrian Catholic', 'Mangalorean Catholic', 'Goan Catholic', 'Other'],
  'Protestant': ['CSI', 'CNI', 'Methodist', 'Baptist', 'Other'],
  'Orthodox': ['Malankara Orthodox', 'Syrian Orthodox', 'Knanaya Orthodox', 'Other'],
  'Syrian Catholic': ['Syrian Catholic', 'Syro-Malabar', 'Syro-Malankara', 'Other'],
  'Pentecostal': ['Assembly of God', 'IPC', 'New Life', 'Other'],
  'Jat Sikh': ['Gill', 'Mann', 'Sidhu', 'Dhillon', 'Sandhu', 'Grewal', 'Other'],
  'Khatri': ['Sodhi', 'Bedi', 'Kapoor', 'Khanna', 'Malhotra', 'Sethi', 'Other'],
  'Arora': ['Chawla', 'Juneja', 'Ahuja', 'Taneja', 'Batra', 'Other'],
  'Ramgarhia': ['Vishwakarma', 'Tarkhan', 'Other'],
  'Mazhabi': ['Valmiki', 'Mazhabi', 'Other'],
  'Saini': ['Shoorsaini', 'Saini', 'Other'],
  'Rajput Sikh': ['Rathore', 'Chauhan', 'Parmar', 'Other'],
  'Jain - Digambar': ['Oswal', 'Porwal', 'Khandelwal', 'Humad', 'Jaiswal', 'Other'],
  'Jain - Shvetambar': ['Oswal', 'Porwal', 'Khandelwal', 'Shrimal', 'Other'],
  'Oswal': ['Jain Oswal', 'Other'],
  'Porwal': ['Jain Porwal', 'Other'],
  'Khandelwal': ['Jain Khandelwal', 'Other'],
};

const INDIA_STATES = [
  'Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chhattisgarh','Goa','Gujarat','Haryana',
  'Himachal Pradesh','Jharkhand','Karnataka','Kerala','Madhya Pradesh','Maharashtra','Manipur',
  'Meghalaya','Mizoram','Nagaland','Odisha','Punjab','Rajasthan','Sikkim','Tamil Nadu','Telangana',
  'Tripura','Uttar Pradesh','Uttarakhand','West Bengal',
  'Andaman and Nicobar Islands','Chandigarh','Dadra and Nagar Haveli and Daman and Diu',
  'Delhi','Jammu and Kashmir','Ladakh','Lakshadweep','Puducherry','Other'
];

const INDIA_CITIES_BY_STATE = {
  'Maharashtra': ['Mumbai','Pune','Nagpur','Nashik','Aurangabad','Solapur','Thane','Other'],
  'Delhi': ['New Delhi','Dwarka','Rohini','Noida (NCR)','Gurugram (NCR)','Other'],
  'Karnataka': ['Bangalore','Mysore','Hubli','Mangalore','Belgaum','Other'],
  'Tamil Nadu': ['Chennai','Coimbatore','Madurai','Tiruchirappalli','Salem','Other'],
  'Telangana': ['Hyderabad','Warangal','Nizamabad','Karimnagar','Other'],
  'Gujarat': ['Ahmedabad','Surat','Vadodara','Rajkot','Bhavnagar','Gandhinagar','Other'],
  'Rajasthan': ['Jaipur','Jodhpur','Udaipur','Kota','Ajmer','Bikaner','Other'],
  'Uttar Pradesh': ['Lucknow','Kanpur','Agra','Varanasi','Allahabad','Meerut','Other'],
  'Punjab': ['Chandigarh','Ludhiana','Amritsar','Jalandhar','Patiala','Other'],
  'West Bengal': ['Kolkata','Howrah','Durgapur','Asansol','Siliguri','Other'],
};

// Edit categories definition
const EDIT_CATEGORIES = [
  { id: 'basic', label: 'Basic Info', iconName: 'User', color: '#FF477E', bg: 'bg-rose-50', text: 'text-rose-500' },
  { id: 'languages', label: 'Spoken Languages', iconName: 'Languages', color: '#0EA5E9', bg: 'bg-sky-50', text: 'text-sky-600' },
  { id: 'religion', label: 'Religion & Caste', iconName: 'Landmark', color: '#F9C74F', bg: 'bg-amber-50', text: 'text-amber-600' },
  { id: 'location', label: 'Location & Birth Details', iconName: 'MapPin', color: '#4895EF', bg: 'bg-blue-50', text: 'text-blue-500' },
  { id: 'education', label: 'Education & Career', iconName: 'GraduationCap', color: '#7209B7', bg: 'bg-purple-50', text: 'text-purple-600' },
  { id: 'lifestyle', label: 'Physical & Lifestyle', iconName: 'Heart', color: '#4CC9F0', bg: 'bg-cyan-50', text: 'text-cyan-600' },
  { id: 'hobbies', label: 'Hobbies & Interests', iconName: 'Sliders', color: '#5D34F7', bg: 'bg-indigo-50', text: 'text-indigo-600' },
  { id: 'family', label: 'Family Details', iconName: 'Users', color: '#3F37C9', bg: 'bg-violet-50', text: 'text-violet-600' },
  { id: 'astrology', label: 'Astrology Details', iconName: 'Sparkles', color: '#9333EA', bg: 'bg-fuchsia-50', text: 'text-fuchsia-600' },
  { id: 'contact', label: 'Contact Info', iconName: 'Mail', color: '#06D6A0', bg: 'bg-emerald-50', text: 'text-emerald-500' },
];

function CategoryIcon({ name, color, className = "w-4 h-4" }) {
  const iconMap = {
    User: User,
    Languages: Languages,
    Globe: Globe,
    Landmark: Landmark,
    MapPin: MapPin,
    GraduationCap: GraduationCap,
    Heart: Heart,
    Sliders: Sliders,
    Users: Users,
    Mail: Mail,
    Sparkles: Sparkles,
  };
  const IconComponent = iconMap[name] || User;
  return <IconComponent className={className} style={{ color }} />;
}

function ChipSelector({ options, selected = [], onChange, title }) {
  const [search, setSearch] = useState('');
  const [showAll, setShowAll] = useState(false);

  // Filter concrete options (excluding 'No Preference')
  const concreteOptions = options.filter(opt => opt !== 'No Preference');
  const isNoPreferenceSelected = selected.includes('No Preference');
  
  // Check if all concrete options are selected
  const isAllSelected = concreteOptions.length > 0 && concreteOptions.every(opt => selected.includes(opt));

  const handleSelectAllToggle = () => {
    if (isAllSelected) {
      // Deselect all
      onChange([]);
    } else {
      // Feature 5: Select every available option without selecting "No Preference"
      onChange([...concreteOptions]);
    }
  };

  const handleNoPreferenceToggle = () => {
    if (isNoPreferenceSelected) {
      onChange([]);
    } else {
      // "No Preference" stands alone as a separate option
      onChange(['No Preference']);
    }
  };

  const handleOptionToggle = (option) => {
    if (option === 'No Preference') {
      handleNoPreferenceToggle();
      return;
    }
    // Selecting any concrete option automatically removes "No Preference"
    const withoutNoPref = selected.filter(x => x !== 'No Preference');
    if (withoutNoPref.includes(option)) {
      onChange(withoutNoPref.filter(x => x !== option));
    } else {
      onChange([...withoutNoPref, option]);
    }
  };

  const filtered = concreteOptions.filter(opt => opt.toLowerCase().includes(search.toLowerCase()));
  const visible = showAll ? filtered : filtered.slice(0, 8);
  const hasMore = filtered.length > 8;

  return (
    <div className="space-y-3">
      {/* Header controls: Search and Select All / Deselect All */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        {options.length > 8 ? (
          <input
            type="text"
            placeholder={`Search ${title}...`}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full max-w-xs px-3.5 py-1.5 text-xs border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5D34F7] focus:border-transparent bg-white shadow-2xs"
          />
        ) : <div />}

        <div className="flex items-center gap-3 ml-auto">
          {/* Feature 5: Select All / Deselect All button */}
          <button
            type="button"
            onClick={handleSelectAllToggle}
            className="text-xs text-[#5D34F7] hover:text-[#4024DB] font-bold hover:underline bg-transparent border-0 cursor-pointer transition"
          >
            {isAllSelected ? 'Deselect All' : 'Select All'}
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {/* "No Preference" remains a separate independent option */}
        <button
          type="button"
          onClick={handleNoPreferenceToggle}
          className={`px-3.5 py-2 rounded-xl border text-xs font-bold transition-all duration-200 cursor-pointer ${
            isNoPreferenceSelected
              ? 'border-indigo-600 bg-indigo-50 text-indigo-700 ring-2 ring-indigo-200/50 shadow-sm'
              : 'border-slate-200 bg-slate-50/70 text-slate-600 hover:border-slate-300'
          }`}
          title="Open to all without specific preference"
        >
          No Preference
        </button>

        {visible.map(option => {
          const isSelected = selected.includes(option);
          return (
            <button
              key={option}
              type="button"
              onClick={() => handleOptionToggle(option)}
              className={`px-3.5 py-2 rounded-xl border text-xs font-semibold transition-all duration-200 cursor-pointer ${
                isSelected
                  ? 'border-[#5D34F7] bg-[#5D34F7]/10 text-[#5D34F7] font-bold shadow-2xs'
                  : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
              }`}
            >
              {option}
            </button>
          );
        })}
      </div>

      {hasMore && (
        <button
          type="button"
          onClick={() => setShowAll(!showAll)}
          className="text-[#5D34F7] text-xs font-bold hover:underline cursor-pointer"
        >
          {showAll ? 'Show Less' : `Show More (+${filtered.length - 8})`}
        </button>
      )}
    </div>
  );
}

// ---- Styled input/select wrappers ----
function EditField({ label, children }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{label}</label>
      {children}
    </div>
  );
}

const inputCls = "w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#5D34F7]/40 focus:border-[#5D34F7] transition-all";
const selectCls = "w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#5D34F7]/40 focus:border-[#5D34F7] transition-all appearance-none";

export default function Profile() {
  const { id } = useParams();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [activeEditCategory, setActiveEditCategory] = useState('basic');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [shareUrl, setShareUrl] = useState('');
  const [viewerUser, setViewerUser] = useState(null);
  const [unlockedContacts, setUnlockedContacts] = useState(getCachedUnlockedContacts());
  const [copiedFamId, setCopiedFamId] = useState(null);
  const [copyToast, setCopyToast] = useState({ show: false, message: '', type: 'success' });
  const [showRemoveCollegeModal, setShowRemoveCollegeModal] = useState(false);
  const [isRemovingCollege, setIsRemovingCollege] = useState(false);
  const [removeCollegeSuccess, setRemoveCollegeSuccess] = useState(false);

  // Feature 19: Dedicated Profile Picture (DP) Modal State
  const [changeDpModalOpen, setChangeDpModalOpen] = useState(false);
  const [selectedDpFile, setSelectedDpFile] = useState(null);
  const [dpPreviewUrl, setDpPreviewUrl] = useState(null);
  const [isUploadingDp, setIsUploadingDp] = useState(false);
  const [dpUploadError, setDpUploadError] = useState('');
  const [dpUploadSuccess, setDpUploadSuccess] = useState(false);

  // Full-Screen Lightbox Image Viewer State
  const [fullScreenImage, setFullScreenImage] = useState({
    isOpen: false,
    images: [],
    initialIndex: 0,
    userName: '',
    gender: 'Male',
    targetUserId: null
  });

  const handleOpenFullScreenImage = (initialIndex = 0) => {
    const prof = profile || {};
    const p = prof.profile || {};
    const photosList = (Array.isArray(photos) && photos.length > 0)
      ? photos
      : (Array.isArray(p.photos) && p.photos.length > 0)
        ? p.photos
        : (Array.isArray(prof.photos) && prof.photos.length > 0)
          ? prof.photos
          : (p.photo ? [p.photo] : (prof.photo ? [prof.photo] : (prof.profilePhoto ? [prof.profilePhoto] : [])));
    const isOtherUser = Boolean(id && String(id) !== String(viewerUser?._id));
    setFullScreenImage({
      isOpen: true,
      images: photosList,
      initialIndex,
      userName: p.name || prof.name || prof.email || 'Member',
      gender: p.gender || prof.gender || 'Male',
      targetUserId: isOtherUser ? id : null
    });
  };

  // Retrieve valid FAM ID from profile data or route parameter
  const getValidFamId = (prof, fallbackId) => {
    if (!prof && !fallbackId) return null;
    const raw = prof?.famId || prof?.fam_id || prof?.profile?.famId || prof?.profile?.fam_id || prof?.uid;
    if (raw && typeof raw === 'string') {
      const trimmed = raw.trim();
      const upper = trimmed.toUpperCase();
      if (upper === 'N/A' || upper === 'UNDEFINED' || upper === 'NULL' || upper === 'MEMBER' || upper === 'USERID') {
        return null;
      }
      if (upper.startsWith('FAM')) {
        return trimmed;
      }
      if (/^\d{6,10}$/.test(trimmed)) {
        return `FAM${trimmed.padStart(8, '0')}`;
      }
      if (/^[A-Za-z0-9_-]{4,20}$/.test(trimmed)) {
        return trimmed;
      }
    }
    if (fallbackId && typeof fallbackId === 'string') {
      const trimmed = fallbackId.trim();
      if (trimmed.toUpperCase().startsWith('FAM')) {
        return trimmed;
      }
    }
    return null;
  };

  const famId = getValidFamId(profile, id);

  const handleCopyFamId = async (idToCopy, e) => {
    if (e) {
      if (typeof e.preventDefault === 'function') e.preventDefault();
      if (typeof e.stopPropagation === 'function') e.stopPropagation();
    }
    if (!idToCopy) return;

    let success = false;
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(idToCopy);
        success = true;
      } else {
        throw new Error('Clipboard API unavailable');
      }
    } catch {
      // Fallback for older browsers / iframe / mobile webview
      try {
        const textArea = document.createElement('textarea');
        textArea.value = idToCopy;
        textArea.style.position = 'fixed';
        textArea.style.top = '-9999px';
        textArea.style.left = '-9999px';
        textArea.style.opacity = '0';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        success = document.execCommand('copy');
        document.body.removeChild(textArea);
      } catch (err2) {
        console.error('Clipboard copy failed:', err2);
        success = false;
      }
    }

    if (success) {
      setCopiedFamId(idToCopy);
      setCopyToast({ show: true, message: 'FAM ID copied successfully!', type: 'success' });
      setTimeout(() => setCopiedFamId(null), 2500);
      setTimeout(() => setCopyToast((prev) => ({ ...prev, show: false })), 2500);
    } else {
      setCopyToast({ show: true, message: 'Failed to copy FAM ID. Please copy manually.', type: 'error' });
      setTimeout(() => setCopyToast((prev) => ({ ...prev, show: false })), 3000);
    }
  };

  // Edit states
  const [profileFor, setProfileFor] = useState('');
  const [fullName, setFullName] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [otherUserInterestSent, setOtherUserInterestSent] = useState(false);
  const [isSendingOtherInterest, setIsSendingOtherInterest] = useState(false);
  const [showVipConsultantModal, setShowVipConsultantModal] = useState(false);
  const [showVipShaadiModal, setShowVipShaadiModal] = useState(false);
  const [vipEnquiryData, setVipEnquiryData] = useState(null);
  const [dob, setDob] = useState('');
  const [gender, setGender] = useState('');
  const [religion, setReligion] = useState('');
  const [caste, setCaste] = useState('');
  const [subCommunity, setSubCommunity] = useState('');
  const [customSubCommunity, setCustomSubCommunity] = useState('');
  const [subCommunitySearch, setSubCommunitySearch] = useState('');
  const [serverSubCommunities, setServerSubCommunities] = useState(null);
  const [isLoadingCommunities, setIsLoadingCommunities] = useState(false);
  const [city, setCity] = useState('');
  const [stateLoc, setStateLoc] = useState('');
  const [locationSearchQuery, setLocationSearchQuery] = useState('');
  const [locationSearchResults, setLocationSearchResults] = useState([]);
  const [isSearchingLocation, setIsSearchingLocation] = useState(false);
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [countryCode, setCountryCode] = useState('+91');
  const [callModalData, setCallModalData] = useState({ isOpen: false, phone: '', name: '', photo: '' });
  const [maritalStatus, setMaritalStatus] = useState('');
  const [hasChildren, setHasChildren] = useState('No');
  const [childrenCount, setChildrenCount] = useState(0);
  const [childrenStayingWith, setChildrenStayingWith] = useState('');
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

  // New Fields
  const [hobbies, setHobbies] = useState([]);
  const [motherStatus, setMotherStatus] = useState('');
  const [fatherStatus, setFatherStatus] = useState('');
  const [sistersCount, setSistersCount] = useState(0);
  const [brothersCount, setBrothersCount] = useState(0);
  const [liveWithFamily, setLiveWithFamily] = useState(null);
  const [familyFinancialStatus, setFamilyFinancialStatus] = useState('');
  const [familyLocation, setFamilyLocation] = useState('');
  const [timeOfBirth, setTimeOfBirth] = useState('');
  const [cityOfBirth, setCityOfBirth] = useState('');
  const [astroCoords, setAstroCoords] = useState(null);
  const [isEditingHobbies, setIsEditingHobbies] = useState(false);
  const [draftHobbies, setDraftHobbies] = useState([]);
  const [hobbiesSuccess, setHobbiesSuccess] = useState(false);
  const [hobbiesError, setHobbiesError] = useState('');
  const [customHobbyInput, setCustomHobbyInput] = useState('');

  // Spoken Languages States
  const [languages, setLanguages] = useState([]);
  const [isEditingLanguages, setIsEditingLanguages] = useState(false);
  const [draftLanguages, setDraftLanguages] = useState([]);
  const [languagesSuccess, setLanguagesSuccess] = useState(false);
  const [languagesError, setLanguagesError] = useState('');
  const [customLanguageInput, setCustomLanguageInput] = useState('');
  const [languageSearch, setLanguageSearch] = useState('');

  // Partner Preferences Subsections Collapse/Expand State
  const [collapsedPrefSections, setCollapsedPrefSections] = useState({});

  const togglePrefSection = (sectionKey) => {
    setCollapsedPrefSections(prev => ({
      ...prev,
      [sectionKey]: !prev[sectionKey]
    }));
  };

  const toggleAllPrefSections = (allSectionKeys) => {
    const allCollapsed = allSectionKeys.length > 0 && allSectionKeys.every(k => !!collapsedPrefSections[k]);
    if (allCollapsed) {
      setCollapsedPrefSections({});
    } else {
      const next = {};
      allSectionKeys.forEach(k => { next[k] = true; });
      setCollapsedPrefSections(next);
    }
  };

  const navigate = useNavigate();
  const location = useLocation();

  const handleShareProfile = (profData) => {
    const uid = profData?.uid || '';
    const url = `${window.location.origin}/profile/${uid}`;
    setShareUrl(url);
    setShareModalOpen(true);
  };

  const handleDownloadProfile = (profData) => {
    const p = profData?.profile || {};
    const firstPhoto = p.photos?.[0] || profData?.photos?.[0] || p.photo || profData?.photo || '';
    const photoUrl = firstPhoto ? getPhotoUrl(firstPhoto, p.gender) : '';
    const name = p.name || 'N/A';
    const age = p.age || 'N/A';
    const dob = p.dob ? new Date(p.dob).toLocaleDateString() : 'N/A';
    const gender = p.gender || 'N/A';
    const height = p.height || 'N/A';
    const diet = p.diet || 'N/A';
    const maritalStatus = p.maritalStatus || 'N/A';
    const religion = p.religion || 'N/A';
    const caste = p.caste || 'N/A';
    const subCommunity = p.subCommunity || 'N/A';
    const locationStr = p.location || 'N/A';
    const education = p.education || 'N/A';
    const college = p.college || 'N/A';
    const profession = p.workRole || p.profession || 'N/A';
    const workSector = p.workSector || 'N/A';
    const company = p.companyName || 'N/A';
    const income = p.income || 'N/A';
    const fatherStatus = p.fatherStatus || 'N/A';
    const motherStatus = p.motherStatus || 'N/A';
    const financialStatus = p.familyFinancialStatus || 'N/A';
    const familyLocation = p.familyLocation || 'N/A';
    const siblingsStr = formatSiblings(p);
    const bioStr = p.bio || 'N/A';
    const hobbiesList = p.hobbies ? p.hobbies.join(', ') : 'N/A';
    const email = profData?.email;
    const phone = profData?.phone;

    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Matrimonial Bio-Data - ${name}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;800;900&display=swap');
            body {
              font-family: 'Outfit', sans-serif;
              color: #1e293b;
              margin: 0;
              padding: 40px;
              background: #f8fafc;
            }
            .biodata-card {
              max-width: 800px;
              margin: 0 auto;
              background: white;
              border-radius: 24px;
              padding: 50px;
              box-shadow: 0 4px 20px rgba(0,0,0,0.05);
              border: 1px solid #e2e8f0;
              position: relative;
            }
            .header {
              text-align: center;
              border-bottom: 2px solid #5D34F7;
              padding-bottom: 20px;
              margin-bottom: 30px;
            }
            .header h1 {
              margin: 0;
              color: #5D34F7;
              font-size: 32px;
              font-weight: 900;
              letter-spacing: -0.5px;
            }
            .header p {
              margin: 5px 0 0 0;
              color: #64748b;
              font-size: 14px;
              font-weight: 600;
              text-transform: uppercase;
              letter-spacing: 1.5px;
            }
            .section-title {
              font-size: 16px;
              font-weight: 800;
              color: #0f172a;
              border-bottom: 1px solid #f1f5f9;
              padding-bottom: 8px;
              margin-top: 25px;
              margin-bottom: 15px;
              text-transform: uppercase;
              letter-spacing: 0.5px;
            }
            .info-grid {
              display: grid;
              grid-template-columns: 180px 1fr;
              gap: 12px 20px;
              font-size: 14px;
            }
            .info-label {
              color: #64748b;
              font-weight: 600;
            }
            .info-val {
              color: #334155;
              font-weight: 600;
            }
            .photo-box {
              width: 180px;
              height: 220px;
              border-radius: 16px;
              overflow: hidden;
              border: 1px solid #e2e8f0;
              background: #f1f5f9;
              display: flex;
              align-items: center;
              justify-content: center;
            }
            .photo-box img {
              width: 100%;
              height: 100%;
              object-fit: cover;
            }
            .bio-text {
              font-size: 13.5px;
              line-height: 1.6;
              color: #475569;
              background: #f8fafc;
              padding: 15px;
              border-radius: 12px;
              border: 1px solid #f1f5f9;
            }
            .print-btn {
              position: fixed;
              bottom: 30px;
              right: 30px;
              background: #5D34F7;
              color: white;
              border: none;
              padding: 12px 24px;
              border-radius: 12px;
              font-size: 14px;
              font-weight: bold;
              cursor: pointer;
              box-shadow: 0 4px 12px rgba(93,52,247,0.3);
            }
            @media print {
              .print-btn { display: none; }
              body { background: white; padding: 0; }
              .biodata-card { box-shadow: none; border: none; padding: 20px; }
            }
          </style>
        </head>
        <body>
          <div class="biodata-card">
            <div class="header">
              <h1>Matrimonial Bio-Data</h1>
              <p>Familiess Matrimony - UID: ${profData?.uid || 'N/A'}${famId ? ` | FAM ID: ${famId}` : ''}</p>
            </div>
            
            <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 30px;">
              <div style="flex: 1;">
                <div class="section-title" style="margin-top: 0;">Personal Details</div>
                <div class="info-grid">
                  ${famId ? `<div class="info-label">FAM ID</div><div class="info-val">${famId}</div>` : ''}
                  ${formatProfileCreatedBy(p.profileFor || profData?.profileFor) ? `<div class="info-label">Profile Created By</div><div class="info-val">${formatProfileCreatedBy(p.profileFor || profData?.profileFor)}</div>` : ''}
                  <div class="info-label">Full Name</div><div class="info-val">${name}</div>
                  <div class="info-label">Date of Birth</div><div class="info-val">${dob} (${age} Yrs)</div>
                  <div class="info-label">Gender</div><div class="info-val">${gender}</div>
                  <div class="info-label">Marital Status</div><div class="info-val">${maritalStatus}</div>
                  <div class="info-label">Height</div><div class="info-val">${height}</div>
                  <div class="info-label">Diet</div><div class="info-val">${diet}</div>
                </div>
              </div>
              ${photoUrl ? '<div class="photo-box"><img src="' + photoUrl + '" alt="Profile Photo" /></div>' : '<div class="photo-box" style="font-size: 12px; color: #94a3b8; text-align: center; padding: 20px;">No Photo Available</div>'}
            </div>

            <div class="section-title">Religion & Community</div>
            <div class="info-grid">
              <div class="info-label">Religion</div><div class="info-val">${religion}</div>
              <div class="info-label">Caste / Community</div><div class="info-val">${caste}</div>
              <div class="info-label">Sub-Community</div><div class="info-val">${subCommunity}</div>
              <div class="info-label">Current Location</div><div class="info-val">${locationStr}</div>
            </div>

            <div class="section-title">Education & Profession</div>
            <div class="info-grid">
              <div class="info-label">Highest Education</div><div class="info-val">${education}</div>
              <div class="info-label">College / University</div><div class="info-val">${college}</div>
              <div class="info-label">Profession</div><div class="info-val">${profession}</div>
              <div class="info-label">Work Sector</div><div class="info-val">${workSector}</div>
              <div class="info-label">Company Name</div><div class="info-val">${company}</div>
              <div class="info-label">Annual Income</div><div class="info-val">${income}</div>
            </div>

            <div class="section-title">Family Details</div>
            <div class="info-grid">
              <div class="info-label">Father's Status</div><div class="info-val">${fatherStatus}</div>
              <div class="info-label">Mother's Status</div><div class="info-val">${motherStatus}</div>
              <div class="info-label">Siblings</div><div class="info-val">${siblingsStr}</div>
              <div class="info-label">Family Income/Setup</div><div class="info-val">${financialStatus}</div>
              <div class="info-label">Family Location</div><div class="info-val">${familyLocation}</div>
            </div>

            ${(email || phone) ? `
            <div class="section-title">Contact Details</div>
            <div class="info-grid">
              ${phone ? `<div class="info-label">Phone Number</div><div class="info-val">${phone}</div>` : ''}
              ${email ? `<div class="info-label">Email Address</div><div class="info-val">${email}</div>` : ''}
            </div>
            ` : ''}

            <div class="section-title">About Me & Hobbies</div>
            <div style="display: flex; flex-direction: column; gap: 10px;">
              <div class="bio-text">${bioStr}</div>
              <div class="info-grid" style="margin-top: 10px;">
                <div class="info-label">Hobbies</div><div class="info-val">${hobbiesList}</div>
              </div>
            </div>
          </div>
          
          <button class="print-btn" onclick="window.print()">Print / Save as PDF</button>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const [activeTab, setActiveTab] = useState(location.state?.tab || 'profile');
  const [prefAgeMin, setPrefAgeMin] = useState(20);
  const [prefAgeMax, setPrefAgeMax] = useState(35);
  const [prefGenders, setPrefGenders] = useState([]);
  const [prefReligions, setPrefReligions] = useState([]);
  const [prefCastes, setPrefCastes] = useState([]);
  const [prefMaritalStatuses, setPrefMaritalStatuses] = useState([]);
  const [prefChildren, setPrefChildren] = useState([]);
  const [prefHeightMinIdx, setPrefHeightMinIdx] = useState(0);
  const [prefHeightMaxIdx, setPrefHeightMaxIdx] = useState(ALL_HEIGHTS.length - 1);
  const [prefDiets, setPrefDiets] = useState([]);
  const [prefEducations, setPrefEducations] = useState([]);
  const [prefProfessions, setPrefProfessions] = useState([]);
  const [prefIncomes, setPrefIncomes] = useState([]);
  const [prefLocations, setPrefLocations] = useState([]);
  const [prefSubCommunities, setPrefSubCommunities] = useState([]);
  const [prefColleges, setPrefColleges] = useState([]);
  const [prefWorkSectors, setPrefWorkSectors] = useState([]);
  const [prefFinancialStatuses, setPrefFinancialStatuses] = useState([]);
  const [prefLanguages, setPrefLanguages] = useState([]);
  const [liveMatchesCount, setLiveMatchesCount] = useState(null);
  const [isCountingMatches, setIsCountingMatches] = useState(false);
  const [showDescriptionVerifyModal, setShowDescriptionVerifyModal] = useState(false);
  const [verifyBioText, setVerifyBioText] = useState('');
  const [verifyBioError, setVerifyBioError] = useState('');
  const [isSubmittingVerifyBio, setIsSubmittingVerifyBio] = useState(false);
  const [verifyBioSuccess, setVerifyBioSuccess] = useState(false);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const endpoint = id ? `/users/profile/${id}` : '/users/profile';
      const response = await api.get(endpoint);
      setProfile(response.data);

      if (id) {
        try {
          const viewerRes = await api.get('/users/profile');
          setViewerUser(viewerRes.data);
          if (viewerRes.data?.premiumMembership?.isPremium) {
            syncContactedProfiles().then((cached) => {
              if (cached) setUnlockedContacts(cached);
            });
          }
        } catch (vErr) {
          console.warn('Could not fetch viewer profile in Profile.jsx', vErr);
        }
      }
      if (response.data) {
        setEmail(response.data.email || '');
        if (response.data.phone) {
          const cleanedPhone = response.data.phone.trim();
          const match = cleanedPhone.match(/^(\+\d+)\s+(.*)$/);
          if (match) {
            setCountryCode(match[1]);
            setPhone(match[2]);
          } else {
            setPhone(cleanedPhone);
          }
        } else {
          setPhone('');
        }
        const p = response.data.profile || {};
        setProfileFor(p.profileFor || '');
        setFullName(p.name || '');
        const pParts = (p.name || '').trim().split(/\s+/);
        setFirstName(p.firstName || pParts[0] || '');
        setLastName(p.lastName || pParts.slice(1).join(' ') || '');
        if (p.dob) {
          const dateObj = new Date(p.dob);
          if (!isNaN(dateObj.getTime())) {
            const day = String(dateObj.getDate()).padStart(2, '0');
            const month = String(dateObj.getMonth() + 1).padStart(2, '0');
            const year = dateObj.getFullYear();
            setDob(`${day}/${month}/${year}`);
          }
        } else {
          setDob('');
        }
        setGender(p.gender || '');
        setReligion(p.religion || '');
        setCaste(p.caste || '');
        setSubCommunity(p.subCommunity || '');
        setCity(p.city || '');
        setStateLoc(p.state || '');
        setMaritalStatus(p.maritalStatus || '');
        setHasChildren(p.hasChildren !== undefined && p.hasChildren !== null && p.hasChildren !== ''
          ? p.hasChildren
          : ((p.maritalStatus && p.maritalStatus !== 'Never Married' && ((p.childrenCount && p.childrenCount > 0) || (p.noOfChildren && p.noOfChildren > 0) || (p.children && p.children > 0))) ? 'Yes' : 'No'));
        setChildrenCount(p.childrenCount !== undefined && p.childrenCount !== null ? Number(p.childrenCount) : (p.noOfChildren !== undefined && p.noOfChildren !== null ? Number(p.noOfChildren) : (typeof p.children === 'number' ? p.children : 0)));
        setChildrenStayingWith(p.childrenStayingWith || '');
        setHeight(p.height || '');
        setDiet(p.diet || '');
        setQualification(p.education || '');
        setCollege(p.college || '');
        setIncome(p.income || '');
        setWorkSector(p.workSector || '');
        setWorkRole(p.workRole || '');
        setCompany(p.companyName || '');
        setBio(p.bio || '');
        setPhotos(
          Array.isArray(p.photos) && p.photos.length > 0
            ? p.photos
            : (Array.isArray(response.data?.photos) && response.data.photos.length > 0
              ? response.data.photos
              : (p.photo ? [p.photo] : (response.data?.photo ? [response.data.photo] : [])))
        );
        setHobbies(p.hobbies || []);
        const loadedLangs = getLanguagesList(p.languages || response.data?.languages || p.motherTongue);
        setLanguages(loadedLangs);
        setDraftLanguages(loadedLangs);
        setMotherStatus(p.motherStatus || '');
        setFatherStatus(p.fatherStatus || '');
        setSistersCount(p.sistersCount !== undefined && p.sistersCount !== null ? Number(p.sistersCount) : 0);
        setBrothersCount(p.brothersCount !== undefined && p.brothersCount !== null ? Number(p.brothersCount) : 0);
        setLiveWithFamily(p.liveWithFamily !== undefined ? p.liveWithFamily : null);
        setFamilyFinancialStatus(p.familyFinancialStatus || '');
        setFamilyLocation(p.familyLocation || '');
        setTimeOfBirth(p.astrology?.timeOfBirth || '');
        setCityOfBirth(p.astrology?.cityOfBirth || p.city || '');
        if (p.astrology?.latitude && p.astrology?.longitude) {
          setAstroCoords({ latitude: p.astrology.latitude, longitude: p.astrology.longitude });
        }

        const prefs = response.data.preferences || {};
        if (prefs.ageRange && prefs.ageRange.length === 2) {
          setPrefAgeMin(prefs.ageRange[0]);
          setPrefAgeMax(prefs.ageRange[1]);
        }
        setPrefGenders(prefs.gender || []);
        setPrefReligions(prefs.religion || []);
        setPrefCastes(prefs.caste || []);
        setPrefMaritalStatuses(prefs.maritalStatus || []);
        setPrefChildren(normalizeChildrenFromBackend(prefs.children));
        const savedHeights = prefs.height || [];
        if (savedHeights.length > 0) {
          let minIdx = ALL_HEIGHTS.indexOf(savedHeights[0]);
          let maxIdx = ALL_HEIGHTS.indexOf(savedHeights[savedHeights.length - 1]);
          if (minIdx === -1) minIdx = 0;
          if (maxIdx === -1) maxIdx = ALL_HEIGHTS.length - 1;
          setPrefHeightMinIdx(minIdx);
          setPrefHeightMaxIdx(maxIdx);
        } else {
          setPrefHeightMinIdx(0);
          setPrefHeightMaxIdx(ALL_HEIGHTS.length - 1);
        }
        setPrefDiets(prefs.diet || []);
        setPrefEducations(prefs.education || []);
        setPrefProfessions(prefs.profession || []);
        setPrefIncomes(prefs.income || []);
        setPrefLocations(prefs.location || []);
        setPrefSubCommunities(prefs.subCommunity || []);
        setPrefColleges(prefs.college || []);
        setPrefWorkSectors(prefs.workSector || []);
        setPrefFinancialStatuses(prefs.familyFinancialStatus || []);
        setPrefLanguages(prefs.languages || prefs.motherTongue || []);
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to fetch profile.');
    } finally {
      setLoading(false);
    }
  };

  const handleSavePreferences = async () => {
    setError('');
    setIsSaving(true);
    try {
      const selectedHeights = ALL_HEIGHTS.slice(prefHeightMinIdx, prefHeightMaxIdx + 1);
      const payload = {
        preferences: {
          ageRange: [prefAgeMin, prefAgeMax],
          gender: prefGenders,
          religion: prefReligions,
          caste: prefCastes,
          height: selectedHeights,
          education: prefEducations,
          profession: prefProfessions,
          income: prefIncomes,
          location: prefLocations,
          maritalStatus: prefMaritalStatuses,
          children: normalizeChildrenForBackend(prefChildren),
          diet: prefDiets,
          subCommunity: prefSubCommunities,
          college: prefColleges,
          workSector: prefWorkSectors,
          familyFinancialStatus: prefFinancialStatuses,
          languages: prefLanguages,
        }
      };
      const response = await api.put('/users/profile', payload);
      setProfile(response.data);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to update preferences.');
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => {
    fetchProfile();
    if (location.state?.tab) {
      setActiveTab(location.state.tab);
    }
    if (location.state?.edit) {
      setIsEditing(true);
      if (location.state?.category) {
        setActiveEditCategory(location.state.category);
      }
    }
  }, [id, location.pathname, location.state]);

  // Fetch communities & subcommunities from server dynamically
  useEffect(() => {
    let isMounted = true;
    setIsLoadingCommunities(true);
    fetchCommunitiesData()
      .then(data => {
        if (isMounted && data?.subcommunities) {
          setServerSubCommunities(data.subcommunities);
        }
      })
      .catch(err => {
        console.warn('Failed to load server communities in Profile:', err);
      })
      .finally(() => {
        if (isMounted) setIsLoadingCommunities(false);
      });
    return () => { isMounted = false; };
  }, []);

  const fetchVipEnquiry = useCallback(async () => {
    try {
      const res = await api.get('/vip-shaadi/my-enquiry');
      if (res.data && res.data.success) {
        setVipEnquiryData(res.data);
      }
    } catch (err) {
      console.warn('Error fetching VIP enquiry in Profile:', err);
    }
  }, []);

  useEffect(() => {
    if (!id) {
      fetchVipEnquiry();
    }
  }, [id, fetchVipEnquiry]);

  // Use entered/selected city to resolve coordinates for Astrology API
  useEffect(() => {
    if (!city || !city.trim()) return;
    const timer = setTimeout(async () => {
      try {
        const coords = await LocationService.getCoordinatesForCity(city);
        if (coords) {
          setAstroCoords(coords);
        }
      } catch (err) {
        console.warn('Could not geocode city for astrology:', err);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [city]);

  // Live count of matching profiles based on draft partner preferences
  useEffect(() => {
    if (activeTab !== 'preferences') return;

    const timer = setTimeout(async () => {
      try {
        setIsCountingMatches(true);
        const selectedHeights = ALL_HEIGHTS.slice(prefHeightMinIdx, prefHeightMaxIdx + 1);
        const draftPrefs = {
          ageRange: [prefAgeMin, prefAgeMax],
          gender: prefGenders,
          religion: prefReligions,
          caste: prefCastes,
          height: selectedHeights,
          education: prefEducations,
          profession: prefProfessions,
          income: prefIncomes,
          location: prefLocations,
          maritalStatus: prefMaritalStatuses,
          children: normalizeChildrenForBackend(prefChildren),
          diet: prefDiets,
          subCommunity: prefSubCommunities,
          college: prefColleges,
          workSector: prefWorkSectors,
          familyFinancialStatus: prefFinancialStatuses,
          languages: prefLanguages,
        };
        const res = await api.post('/users/matches/count', { preferences: draftPrefs });
        if (res.data && typeof res.data.count === 'number') {
          setLiveMatchesCount(res.data.count);
        }
      } catch (err) {
        console.error('Error fetching live matches count for preferences:', err);
        setLiveMatchesCount((prev) => (prev !== null ? prev : 0));
      } finally {
        setIsCountingMatches(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [
    activeTab,
    prefAgeMin, prefAgeMax, prefGenders, prefReligions, prefCastes,
    prefHeightMinIdx, prefHeightMaxIdx, prefEducations, prefProfessions,
    prefIncomes, prefLocations, prefMaritalStatuses, prefChildren, prefDiets,
    prefSubCommunities, prefColleges, prefWorkSectors, prefFinancialStatuses,
    prefLanguages
  ]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  // Build a unified profile payload from current state
  const buildProfilePayload = (overridePhotos, overrideHobbies, overrideLanguages) => {
    let dobISO = '';
    if (dob) {
      const parts = dob.split('/');
      if (parts.length === 3) {
        const day = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10) - 1;
        const year = parseInt(parts[2], 10);
        const d = new Date(year, month, day);
        if (!isNaN(d.getTime())) dobISO = d.toISOString();
      }
    }
    const computedName = `${firstName.trim()} ${lastName.trim()}`.trim() || fullName.trim();
    const finalFirstName = firstName.trim() || computedName.split(/\s+/)[0] || '';
    const finalLastName = lastName.trim() || computedName.split(/\s+/).slice(1).join(' ') || '';
    return {
      email: email.trim(),
      phone: `${countryCode} ${phone.trim()}`,
      profile: {
        profileFor,
        name: computedName,
        firstName: finalFirstName,
        lastName: finalLastName,
        dob: dobISO || undefined,
        gender,
        religion,
        caste,
        city,
        state: stateLoc,
        location: `${city}, ${stateLoc}`.replace(/^,\s*|,\s*$/g, ''),
        country: 'India',
        subCommunity,
        diet,
        education: qualification,
        college: college ? college.trim() : '',
        income,
        workSector,
        workRole,
        companyName: company,
        bio,
        photos: overridePhotos !== undefined ? overridePhotos : photos,
        hobbies: overrideHobbies !== undefined ? overrideHobbies : hobbies,
        languages: overrideLanguages !== undefined ? overrideLanguages : languages,
        motherTongue: (overrideLanguages !== undefined ? overrideLanguages[0] : languages[0]) || p.motherTongue || '',
        motherStatus,
        fatherStatus,
        sistersCount: Number(sistersCount) || 0,
        brothersCount: Number(brothersCount) || 0,
        siblingsCount: (Number(brothersCount) || 0) + (Number(sistersCount) || 0),
        liveWithFamily: liveWithFamily === true ? true : liveWithFamily === false ? false : undefined,
        familyFinancialStatus,
        familyLocation,
        maritalStatus,
        hasChildren: maritalStatus === 'Never Married' ? 'No' : hasChildren,
        childrenCount: maritalStatus === 'Never Married' ? 0 : Number(childrenCount) || 0,
        noOfChildren: maritalStatus === 'Never Married' ? 0 : Number(childrenCount) || 0,
        childrenStayingWith: (maritalStatus !== 'Never Married' && hasChildren === 'Yes') ? childrenStayingWith : '',
        height,
        astrology: {
          timeOfBirth,
          cityOfBirth: cityOfBirth || city || '',
          ...(astroCoords?.latitude ? { latitude: astroCoords.latitude, longitude: astroCoords.longitude } : {})
        }
      }
    };
  };

  // Save full profile (used by Edit Mode Save button)
  const handleSave = async () => {
    setError('');

    // 1. Full Name Validation
    const trimmedName = fullName ? fullName.trim() : '';
    if (!trimmedName) {
      setError('Please enter your full name.');
      setActiveEditCategory('basic');
      return;
    }
    if (trimmedName.length < 2) {
      setError('Full name must be at least 2 characters long.');
      setActiveEditCategory('basic');
      return;
    }
    if (!/^[a-zA-Z\s.'-]+$/.test(trimmedName)) {
      setError('Full name should only contain letters, spaces, hyphens, and apostrophes.');
      setActiveEditCategory('basic');
      return;
    }

    // 2. Date of Birth Validation
    if (dob) {
      const parts = dob.trim().split('/');
      if (parts.length !== 3) {
        setError('Please enter Date of Birth in DD/MM/YYYY format (e.g., 15/08/1995).');
        setActiveEditCategory('basic');
        return;
      }
      const day = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10);
      const year = parseInt(parts[2], 10);
      const now = new Date();
      const currentYear = now.getFullYear();

      if (isNaN(day) || isNaN(month) || isNaN(year) || month < 1 || month > 12 || day < 1 || day > 31 || year < 1920 || year > currentYear) {
        setError('Please enter a valid calendar Date of Birth in DD/MM/YYYY format.');
        setActiveEditCategory('basic');
        return;
      }

      const birthDate = new Date(year, month - 1, day);
      if (birthDate.getMonth() !== month - 1 || birthDate.getDate() !== day) {
        setError('Please enter a valid calendar Date of Birth.');
        setActiveEditCategory('basic');
        return;
      }

      if (birthDate > now) {
        setError('Date of birth cannot be in the future.');
        setActiveEditCategory('basic');
        return;
      }

      let calcAge = currentYear - year;
      const mDiff = now.getMonth() - (month - 1);
      if (mDiff < 0 || (mDiff === 0 && now.getDate() < day)) {
        calcAge--;
      }

      if (calcAge < 18) {
        setError(`You must be at least 18 years old to register or update a profile on this platform (current calculated age: ${calcAge}).`);
        setActiveEditCategory('basic');
        return;
      }
    }

    // 3. Email Validation
    const trimmedEmail = email ? email.trim() : '';
    if (!trimmedEmail) {
      setError('Please enter an email address.');
      setActiveEditCategory('contact');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      setError('Please enter a valid email address (e.g. name@example.com).');
      setActiveEditCategory('contact');
      return;
    }

    // 4. Phone Number Validation
    const phoneErr = validatePhoneNumber(phone, countryCode);
    if (phoneErr) {
      setError(phoneErr);
      setActiveEditCategory('contact');
      return;
    }

    // 5. Bio / Description Content Safety Validation
    if (bio && bio.trim()) {
      const trimmedBio = bio.trim();
      if (trimmedBio.length > 1000) {
        setError('Description cannot exceed 1000 characters.');
        setActiveEditCategory('basic');
        return;
      }
      const phoneInBioRegex = /(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}|\b[6-9]\d{9}\b/;
      const emailInBioRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
      if (phoneInBioRegex.test(trimmedBio) || emailInBioRegex.test(trimmedBio)) {
        setError('For your privacy and safety, personal phone numbers and email addresses are not permitted in the description/bio.');
        setActiveEditCategory('basic');
        return;
      }
    }

    // 6. Family Details Validation
    if (sistersCount !== undefined && Number(sistersCount) < 0) {
      setError('Number of sisters cannot be negative.');
      setActiveEditCategory('family');
      return;
    }
    if (brothersCount !== undefined && Number(brothersCount) < 0) {
      setError('Number of brothers cannot be negative.');
      setActiveEditCategory('family');
      return;
    }

    setIsSaving(true);
    try {
      const payload = buildProfilePayload();
      const base64Payload = btoa(unescape(encodeURIComponent(JSON.stringify(payload))));
      const response = await api.post('/users/profile', { encodedPayload: base64Payload });
      setProfile(response.data);
      setIsEditing(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);
      fetchProfile();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to update profile.');
    } finally {
      setIsSaving(false);
    }
  };

  // Direct College Removal (Save to backend immediately)
  const handleDirectRemoveCollege = async () => {
    setIsRemovingCollege(true);
    setError('');
    try {
      setCollege('');
      const payload = buildProfilePayload();
      payload.profile.college = '';
      const base64Payload = btoa(unescape(encodeURIComponent(JSON.stringify(payload))));
      const response = await api.post('/users/profile', { encodedPayload: base64Payload });
      setProfile(response.data);
      setShowRemoveCollegeModal(false);
      setRemoveCollegeSuccess(true);
      setTimeout(() => setRemoveCollegeSuccess(false), 2500);
      fetchProfile();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to remove college.');
    } finally {
      setIsRemovingCollege(false);
    }
  };

  // Dedicated Description Verification Submission
  const handleVerifyDescriptionSubmit = async (customBioText) => {
    const textToSubmit = (customBioText !== undefined ? customBioText : verifyBioText).trim();
    
    if (!textToSubmit) {
      setVerifyBioError('Please enter a description about yourself.');
      return;
    }
    if (textToSubmit.length < 20) {
      setVerifyBioError('Description should be at least 20 characters long to provide meaningful information.');
      return;
    }
    if (textToSubmit.length > 1000) {
      setVerifyBioError('Description cannot exceed 1000 characters.');
      return;
    }
    const phoneRegex = /(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}|\b[6-9]\d{9}\b/;
    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
    if (phoneRegex.test(textToSubmit) || emailRegex.test(textToSubmit)) {
      setVerifyBioError('For your privacy and safety, personal phone numbers or email addresses are not permitted in the public description.');
      return;
    }

    setVerifyBioError('');
    setIsSubmittingVerifyBio(true);

    try {
      let finalBio = textToSubmit;
      if (p.bio && p.bio === textToSubmit && profile?.aboutMeVerificationStatus !== 'pending') {
        finalBio = textToSubmit.endsWith(' ') ? textToSubmit.trim() : `${textToSubmit} `;
      }

      const updatedProfile = {
        ...p,
        bio: finalBio
      };

      const res = await api.put('/users/profile', {
        profile: updatedProfile
      });

      const updatedUser = res.data || {};
      const newStatus = updatedUser.aboutMeVerificationStatus || 'pending';
      setProfile((prev) => ({
        ...prev,
        ...updatedUser,
        aboutMeVerificationStatus: newStatus,
        profile: {
          ...(prev?.profile || {}),
          ...updatedProfile,
          bio: textToSubmit
        }
      }));
      setBio(textToSubmit);
      setVerifyBioSuccess(true);
      setTimeout(() => {
        setVerifyBioSuccess(false);
        setShowDescriptionVerifyModal(false);
      }, 1600);
    } catch (err) {
      setVerifyBioError(err.response?.data?.message || err.message || 'Failed to submit description for verification.');
    } finally {
      setIsSubmittingVerifyBio(false);
    }
  };

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

  // Direct image save (outside edit mode)
  const savePhotosDirectly = async (newPhotos) => {
    setIsSaving(true);
    setError('');
    try {
      const payload = buildProfilePayload(newPhotos);
      const base64Payload = btoa(unescape(encodeURIComponent(JSON.stringify(payload))));
      const response = await api.post('/users/profile', { encodedPayload: base64Payload });
      setProfile(response.data);
      setPhotos(response.data?.profile?.photos || newPhotos);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to update photo.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleUploadGalleryPhotos = async (selectedFiles) => {
    const fileList = Array.from(selectedFiles || []);
    if (fileList.length === 0) return;

    const currentCount = (Array.isArray(photos) && photos.length > 0)
      ? photos.length
      : ((profile?.profile?.photos || profile?.photos || []).length);

    if (currentCount >= 10) {
      setError('You can upload a maximum of 10 pictures per account.');
      return;
    }

    const availableSlots = 10 - currentCount;
    const filesToUpload = fileList.slice(0, availableSlots);

    if (fileList.length > availableSlots) {
      setError('You can upload a maximum of 10 pictures per account. Only the first available slots were uploaded.');
    } else {
      setError('');
    }

    for (const file of filesToUpload) {
      if (!file.type || !file.type.startsWith('image/')) {
        setError('Please upload valid image files (JPG, PNG, WebP).');
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        setError('Each picture must be less than 10MB.');
        return;
      }
    }

    setIsSaving(true);
    try {
      const uploadedNames = await uploadFiles(filesToUpload);
      const existing = (Array.isArray(photos) && photos.length > 0)
        ? photos
        : ((profile?.profile?.photos || profile?.photos || []));
      const newPhotos = [...existing, ...uploadedNames].slice(0, 10);
      setPhotos(newPhotos);
      await savePhotosDirectly(newPhotos);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to upload images.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSetPrimaryPhoto = async (index) => {
    const existing = (Array.isArray(photos) && photos.length > 0)
      ? photos
      : ((profile?.profile?.photos || profile?.photos || []));
    if (index === 0 || !existing[index]) return;
    const target = existing[index];
    const newPhotos = [target, ...existing.filter((_, i) => i !== index)];
    setPhotos(newPhotos);
    await savePhotosDirectly(newPhotos);
  };

  const handleDeletePhoto = async (index) => {
    const existing = (Array.isArray(photos) && photos.length > 0)
      ? photos
      : ((profile?.profile?.photos || profile?.photos || []));
    const newPhotos = existing.filter((_, i) => i !== index);
    setPhotos(newPhotos);
    await savePhotosDirectly(newPhotos);
  };

  const saveHobbiesDirectly = async (newHobbies) => {
    setIsSaving(true);
    setHobbiesError('');
    try {
      const payload = buildProfilePayload(undefined, newHobbies);
      const base64Payload = btoa(unescape(encodeURIComponent(JSON.stringify(payload))));
      const response = await api.post('/users/profile', { encodedPayload: base64Payload });
      setProfile(response.data);
      const updated = response.data?.profile?.hobbies || newHobbies;
      setHobbies(updated);
      setDraftHobbies(updated);
      setIsEditingHobbies(false);
      setHobbiesSuccess(true);
      setTimeout(() => setHobbiesSuccess(false), 3000);
    } catch (err) {
      setHobbiesError(err.response?.data?.message || err.message || 'Failed to update hobbies.');
    } finally {
      setIsSaving(false);
    }
  };

  const saveLanguagesDirectly = async (newLanguages) => {
    setIsSaving(true);
    setLanguagesError('');
    try {
      const payload = buildProfilePayload(undefined, undefined, newLanguages);
      const base64Payload = btoa(unescape(encodeURIComponent(JSON.stringify(payload))));
      const response = await api.post('/users/profile', { encodedPayload: base64Payload });
      setProfile(response.data);
      const updated = getLanguagesList(response.data?.profile?.languages || newLanguages);
      setLanguages(updated);
      setDraftLanguages(updated);
      setIsEditingLanguages(false);
      setLanguagesSuccess(true);
      setTimeout(() => setLanguagesSuccess(false), 3000);
    } catch (err) {
      setLanguagesError(err.response?.data?.message || err.message || 'Failed to update spoken languages.');
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <img src={loadingImg} alt="Loading..." className="h-16 w-16 object-contain animate-spin" />
      </div>
    );
  }

  const p = profile?.profile || {};

  // Exact image field fallbacks: state photos -> nested profile.photos -> root user.photos -> single photo fields
  const displayPhotos = (Array.isArray(photos) && photos.length > 0)
    ? photos
    : (Array.isArray(p.photos) && p.photos.length > 0)
      ? p.photos
      : (Array.isArray(profile?.photos) && profile.photos.length > 0)
        ? profile.photos
        : (p.photo ? [p.photo] : (profile?.photo ? [profile.photo] : (profile?.profilePhoto ? [profile.profilePhoto] : [])));

  // Helper to extract photo verification status without restricting image display
  const getPhotoStatus = (photoItem) => {
    if (!photoItem) return null;
    if (typeof photoItem === 'object') {
      const status = (photoItem.verificationStatus || photoItem.status || '').toLowerCase();
      if (status === 'rejected' || photoItem.rejected === true) return 'rejected';
      if (status === 'pending') return 'pending';
      if (status === 'approved' || status === 'verified' || photoItem.approved === true) return 'approved';
    }
    return null;
  };

  // ========================
  // Edit Mode Category Panels
  // ========================
  const renderEditCategory = () => {
    const availableCastes = (() => {
      let c = [];
      (RELIGION_CASTES_MAP[religion] || []).forEach(x => c.push(x));
      return [...new Set(c)];
    })();
    const subCommunityOptions = getSubCommunityOptions(religion, caste, serverSubCommunities, subCommunity);
    const stateCities = INDIA_CITIES_BY_STATE[stateLoc] || ALL_LOCATIONS;

    switch (activeEditCategory) {
      case 'basic':
        return (
          <div className="space-y-5">
            <EditField label="Profile Created By">
              <select value={profileFor} onChange={e => setProfileFor(e.target.value)} className={selectCls}>
                <option value="">Select...</option>
                {['Myself', 'My Son', 'My Daughter', 'My Brother', 'My Sister', 'My Relative', 'My Friend'].map(v => (
                  <option key={v} value={v}>{v}</option>
                ))}
              </select>
            </EditField>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <EditField label="First Name">
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => {
                    // Feature 13: block numeric characters from pure text fields
                    const clean = e.target.value.replace(/[0-9]/g, '');
                    setFirstName(clean);
                    setFullName(`${clean.trim()} ${lastName.trim()}`.trim());
                  }}
                  className={inputCls}
                  placeholder="e.g. Rahul"
                />
              </EditField>
              <EditField label="Last Name / Surname">
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => {
                    // Feature 13: block numeric characters from pure text fields
                    const clean = e.target.value.replace(/[0-9]/g, '');
                    setLastName(clean);
                    setFullName(`${firstName.trim()} ${clean.trim()}`.trim());
                  }}
                  className={inputCls}
                  placeholder="e.g. Sharma"
                />
              </EditField>
            </div>
            <EditField label="Gender">
              <div className="flex gap-3">
                {['Male', 'Female'].map(g => (
                  <button key={g} type="button" onClick={() => setGender(g)}
                    className={`flex-1 py-2.5 rounded-xl border text-sm font-semibold transition-all cursor-pointer ${gender === g ? 'bg-[#5D34F7] text-white border-[#5D34F7] shadow-md' : 'bg-white text-slate-600 border-slate-200 hover:border-[#5D34F7]/50'}`}>
                    {g === 'Male' ? '👨 Male' : '👩 Female'}
                  </button>
                ))}
              </div>
            </EditField>
            <EditField label="Date of Birth (DD/MM/YYYY)">
              <input type="text" value={dob} onChange={e => setDob(e.target.value)} className={inputCls} placeholder="e.g. 15/08/1995" />
            </EditField>
            <EditField label="About Me / Bio">
              <textarea value={bio} onChange={e => setBio(e.target.value)} rows={4}
                placeholder="Write something about yourself..."
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5D34F7]/40 focus:border-[#5D34F7] text-sm resize-none bg-white transition-all" />
            </EditField>

            <EditField label="Spoken Languages">
              <div className="space-y-2">
                <div className="flex flex-wrap gap-1.5 items-center">
                  {languages.map(l => (
                    <span key={l} className="inline-flex items-center gap-1 px-2.5 py-1 bg-sky-50 text-sky-700 border border-sky-200 text-xs font-bold rounded-lg shadow-2xs">
                      {l}
                      <button
                        type="button"
                        onClick={() => setLanguages(languages.filter(x => x !== l))}
                        className="text-slate-400 hover:text-rose-600 ml-0.5 cursor-pointer font-black text-[11px]"
                      >
                        ✕
                      </button>
                    </span>
                  ))}
                  <button
                    type="button"
                    onClick={() => setActiveEditCategory('languages')}
                    className="px-3 py-1 bg-[#5D34F7]/10 hover:bg-[#5D34F7]/20 text-[#5D34F7] rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1"
                  >
                    <Languages size={12} />
                    <span>Manage Languages ({languages.length})</span>
                  </button>
                </div>
                <p className="text-[11px] text-slate-400">Click &ldquo;Manage Languages&rdquo; or the Spoken Languages tab to add or remove languages.</p>
              </div>
            </EditField>
          </div>
        );

      case 'languages': {
        const filteredLanguages = ALL_SPOKEN_LANGUAGES.filter(opt => {
          if (!languageSearch) return true;
          return opt.toLowerCase().includes(languageSearch.toLowerCase());
        });

        return (
          <div className="space-y-6">
            <div className="p-4 bg-sky-50/60 rounded-2xl border border-sky-100 flex items-start gap-3">
              <div className="p-2 rounded-xl bg-white text-sky-600 shadow-2xs shrink-0 mt-0.5">
                <Languages size={18} />
              </div>
              <div>
                <h4 className="text-xs font-black text-slate-800">Spoken Languages</h4>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Select all languages you speak fluently or comfortably converse in. You can choose from popular languages or add your own.
                </p>
              </div>
            </div>

            {/* Currently Selected Badges */}
            <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-2xs space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-slate-700">
                  Selected Languages ({languages.length})
                </span>
                {languages.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setLanguages([])}
                    className="text-[11px] font-bold text-rose-600 hover:underline cursor-pointer"
                  >
                    Clear all
                  </button>
                )}
              </div>
              {languages.length > 0 ? (
                <div className="flex flex-wrap gap-2 pt-1">
                  {languages.map(l => (
                    <span
                      key={l}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-sky-50 text-sky-800 border border-sky-200 text-xs font-bold rounded-xl shadow-2xs"
                    >
                      <span>{l}</span>
                      <button
                        type="button"
                        onClick={() => setLanguages(languages.filter(x => x !== l))}
                        className="text-slate-400 hover:text-rose-600 cursor-pointer font-black text-xs"
                        title={`Remove ${l}`}
                      >
                        ✕
                      </button>
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic">No languages selected yet. Click from the list below or add custom ones.</p>
              )}
            </div>

            {/* Search Input */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 block">Search & Select Languages</label>
              <div className="relative">
                <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search popular languages..."
                  value={languageSearch}
                  onChange={(e) => setLanguageSearch(e.target.value)}
                  className="w-full pl-9 pr-8 py-2.5 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5D34F7]/40 focus:border-[#5D34F7] bg-white transition"
                />
                {languageSearch && (
                  <button
                    type="button"
                    onClick={() => setLanguageSearch('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs cursor-pointer"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>

            {/* Language Chips */}
            <div className="space-y-2">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wide block">
                {languageSearch ? 'Matching Languages' : 'All Available Languages'}
              </span>
              <div className="flex flex-wrap gap-2 max-h-56 overflow-y-auto p-2 border border-slate-100 rounded-2xl bg-slate-50/40">
                {filteredLanguages.map(opt => {
                  const isSelected = languages.includes(opt);
                  return (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => {
                        if (isSelected) {
                          setLanguages(languages.filter(x => x !== opt));
                        } else {
                          setLanguages([...languages, opt]);
                        }
                      }}
                      className={`px-3.5 py-1.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-[#5D34F7] text-white border-[#5D34F7] shadow-xs'
                          : 'bg-white text-slate-700 border-slate-200 hover:border-[#5D34F7]/40'
                      }`}
                    >
                      {isSelected ? '✓ ' : '+ '}{opt}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Custom Language Addition */}
            <div className="pt-2 border-t border-slate-100 space-y-2">
              <label className="text-xs font-bold text-slate-700 block">Add Other Language</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={customLanguageInput}
                  onChange={(e) => setCustomLanguageInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      const val = customLanguageInput.trim();
                      if (val && !languages.some(l => l.toLowerCase() === val.toLowerCase())) {
                        setLanguages([...languages, val]);
                        setCustomLanguageInput('');
                      }
                    }
                  }}
                  placeholder="e.g. Japanese, Mandarin, Spanish..."
                  className="flex-1 px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-[#5D34F7] bg-white transition"
                />
                <button
                  type="button"
                  onClick={() => {
                    const val = customLanguageInput.trim();
                    if (val && !languages.some(l => l.toLowerCase() === val.toLowerCase())) {
                      setLanguages([...languages, val]);
                      setCustomLanguageInput('');
                    }
                  }}
                  className="px-4 py-2 bg-[#5D34F7] text-white rounded-xl text-xs font-bold hover:bg-[#4024DB] transition cursor-pointer"
                >
                  + Add
                </button>
              </div>
            </div>
          </div>
        );
      }

      case 'religion': {
        const filteredSubCommunityOptions = subCommunityOptions.filter(opt => {
          if (!subCommunitySearch) return true;
          return opt.toLowerCase().includes(subCommunitySearch.toLowerCase());
        });

        return (
          <div className="space-y-5">
            <EditField label="Religion">
              <div className="flex flex-wrap gap-2">
                {ALL_RELIGIONS.map(r => (
                  <button key={r} type="button" onClick={() => {
                    if (religion !== r) {
                      setReligion(r);
                      setCaste('');
                      setSubCommunity('');
                      setSubCommunitySearch('');
                    }
                  }}
                    className={`px-4 py-2 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${religion === r ? 'bg-[#5D34F7] text-white border-[#5D34F7]' : 'bg-white text-slate-600 border-slate-200 hover:border-[#5D34F7]/50'}`}>
                    {r}
                  </button>
                ))}
              </div>
            </EditField>

            {religion && availableCastes.length > 0 && (
              <EditField label="Caste / Community">
                <div className="flex flex-wrap gap-2">
                  {availableCastes.map(c => (
                    <button key={c} type="button" onClick={() => {
                      if (caste !== c) {
                        setCaste(c);
                        setSubCommunitySearch('');
                      }
                    }}
                      className={`px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${caste === c ? 'bg-[#5D34F7] text-white border-[#5D34F7]' : 'bg-white text-slate-600 border-slate-200 hover:border-[#5D34F7]/50'}`}>
                      {c}
                    </button>
                  ))}
                </div>
              </EditField>
            )}

            {(!religion || availableCastes.length === 0) && (
              <EditField label="Caste (manual)">
                <input type="text" value={caste} onChange={e => setCaste(e.target.value)} className={inputCls} placeholder="Enter caste/community" />
              </EditField>
            )}

            <EditField label="Sub-Community / Sect">
              <div className="space-y-2">
                {/* Search Filter for large lists */}
                {subCommunityOptions.length > 10 && (
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <Search size={14} />
                    </div>
                    <input
                      type="text"
                      value={subCommunitySearch}
                      onChange={e => setSubCommunitySearch(e.target.value)}
                      placeholder="Search Sub-Community / Caste..."
                      className="w-full pl-9 pr-8 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#5D34F7]/40 focus:border-[#5D34F7] transition-all"
                    />
                    {subCommunitySearch && (
                      <button
                        type="button"
                        onClick={() => setSubCommunitySearch('')}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                      >
                        <X size={14} />
                      </button>
                    )}
                  </div>
                )}

                {/* Sub-Community Dropdown - matches Sign Up options & styling */}
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#5D34F7]">
                    <User size={18} />
                  </div>
                  <select
                    value={subCommunity}
                    onChange={(e) => {
                      setSubCommunity(e.target.value);
                      if (e.target.value !== 'Other') {
                        setCustomSubCommunity('');
                      }
                    }}
                    disabled={isLoadingCommunities}
                    className="w-full pl-11 pr-10 py-3 border border-slate-200 rounded-xl appearance-none bg-white text-sm text-slate-700 hover:border-[#5D34F7]/40 focus:outline-none focus:ring-2 focus:ring-[#5D34F7]/40 focus:border-[#5D34F7] transition-all shadow-sm cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    <option value="">Select Sub-Community / Sect</option>
                    {filteredSubCommunityOptions.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                    {filteredSubCommunityOptions.length === 0 && subCommunitySearch && (
                      <option value="" disabled>No matching sub-community found</option>
                    )}
                  </select>
                  <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-slate-400">
                    {isLoadingCommunities ? (
                      <Loader2 size={16} className="animate-spin text-[#5D34F7]" />
                    ) : (
                      <ChevronDown size={18} />
                    )}
                  </div>
                </div>

                {/* Manual entry if 'Other' is selected or custom value */}
                {(subCommunity === 'Other' || (subCommunity && !subCommunityOptions.includes(subCommunity))) && (
                  <div className="pt-1">
                    <label className="text-[11px] font-semibold text-slate-500 block mb-1">
                      Specify Sub-Community Name
                    </label>
                    <input
                      type="text"
                      value={customSubCommunity || (subCommunity !== 'Other' ? subCommunity : '')}
                      onChange={e => {
                        const val = e.target.value;
                        setCustomSubCommunity(val);
                        setSubCommunity(val || 'Other');
                      }}
                      className={inputCls}
                      placeholder="Enter custom sub-community or sect"
                    />
                  </div>
                )}
              </div>
            </EditField>
          </div>
        );
      }

      case 'location':
        return (
          <div className="space-y-5">
            <EditField label="Search Location (Dynamic Geocoding)">
              <div className="relative">
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
                  className={inputCls}
                  placeholder="Type city or region (e.g. Mumbai, New Delhi...)"
                />
                {isSearchingLocation && (
                  <div className="absolute right-3 top-3.5">
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
                            setCity(parts[0]);
                            setStateLoc(parts[1]);
                          } else {
                            setCity(locStr);
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
            </EditField>

            <div className="grid grid-cols-2 gap-4">
              <EditField label="State / Region">
                <input
                  type="text"
                  value={stateLoc}
                  onChange={e => setStateLoc(e.target.value)}
                  className={inputCls}
                  placeholder="Enter state"
                />
              </EditField>
              <EditField label="City">
                <input
                  type="text"
                  value={city}
                  onChange={e => setCity(e.target.value)}
                  className={inputCls}
                  placeholder="Enter city"
                />
              </EditField>
            </div>

            <EditField label="Time of Birth">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#5D34F7]">
                  <Clock size={16} />
                </div>
                <input
                  type="time"
                  value={timeOfBirth}
                  onChange={e => setTimeOfBirth(e.target.value)}
                  className={`${inputCls} pl-10`}
                />
              </div>
              <p className="text-[10px] text-slate-400 mt-1">Required for Kundali & Astrology matching features.</p>
            </EditField>
          </div>
        );

      case 'education':
        return (
          <div className="space-y-5">
            <EditField label="Highest Qualification">
              <div className="flex flex-wrap gap-2">
                {ALL_EDUCATIONS.map(e => (
                  <button key={e} type="button" onClick={() => setQualification(e)}
                    className={`px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${qualification === e ? 'bg-[#7209B7] text-white border-[#7209B7]' : 'bg-white text-slate-600 border-slate-200 hover:border-[#7209B7]/40'}`}>
                    {e}
                  </button>
                ))}
              </div>
            </EditField>
            <EditField label="College / University">
              <div className="space-y-3">
                {/* Active selected college badge with Remove College button */}
                {college ? (
                  <div className="flex items-center justify-between p-3 bg-purple-50/70 border border-purple-200/80 rounded-2xl">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="p-2 bg-[#7209B7]/10 text-[#7209B7] rounded-xl shrink-0">
                        <GraduationCap size={16} />
                      </div>
                      <div className="min-w-0">
                        <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block leading-none mb-1">
                          Current College / University
                        </span>
                        <span className="text-sm font-extrabold text-slate-800 truncate block">
                          {college}
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowRemoveCollegeModal(true)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 hover:bg-rose-600 text-rose-600 hover:text-white border border-rose-200 hover:border-rose-600 rounded-xl text-xs font-extrabold transition-all duration-200 cursor-pointer shadow-2xs active:scale-95 shrink-0"
                      title="Remove College from Profile"
                    >
                      <Trash2 size={13} />
                      <span>Remove College</span>
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between p-2.5 bg-slate-50 border border-slate-200/80 rounded-xl text-xs text-slate-500">
                    <span className="italic">No college / university currently added (Optional)</span>
                    <span className="text-[11px] text-slate-400">Type or select below</span>
                  </div>
                )}

                {/* Text input with embedded clear button */}
                <div className="relative">
                  <input
                    type="text"
                    list="education-colleges-list"
                    value={college}
                    onChange={e => setCollege(e.target.value)}
                    className={`${inputCls} pr-10`}
                    placeholder="e.g. IIT Bombay, Delhi University (DU)..."
                  />
                  {college && (
                    <button
                      type="button"
                      onClick={() => setShowRemoveCollegeModal(true)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-rose-600 p-1 rounded-lg transition-colors cursor-pointer"
                      title="Remove / Clear College"
                    >
                      <X size={16} />
                    </button>
                  )}
                  <datalist id="education-colleges-list">
                    {ALL_COLLEGES.filter(c => c !== 'Other').map(c => (
                      <option key={c} value={c} />
                    ))}
                  </datalist>
                </div>

                {/* Popular colleges quick chips */}
                <div className="pt-1">
                  <span className="text-[11px] font-bold text-slate-400 block mb-1.5">
                    Popular Institutions (click to choose):
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {ALL_COLLEGES.slice(0, 8).map(c => {
                      const isSelected = college.toLowerCase() === c.toLowerCase();
                      return (
                        <button
                          key={c}
                          type="button"
                          onClick={() => {
                            if (isSelected) {
                              setShowRemoveCollegeModal(true);
                            } else {
                              setCollege(c);
                            }
                          }}
                          className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-[#7209B7] text-white shadow-2xs'
                              : 'bg-slate-100 hover:bg-slate-200/80 text-slate-600'
                          }`}
                        >
                          {isSelected ? `✓ ${c}` : `+ ${c}`}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </EditField>
            <EditField label="Work Sector">
              <div className="flex flex-wrap gap-2">
                {ALL_WORK_SECTORS.map(s => (
                  <button key={s} type="button" onClick={() => setWorkSector(s)}
                    className={`px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${workSector === s ? 'bg-[#7209B7] text-white border-[#7209B7]' : 'bg-white text-slate-600 border-slate-200 hover:border-[#7209B7]/40'}`}>
                    {s}
                  </button>
                ))}
              </div>
            </EditField>
            <EditField label="Work Role / Profession">
              <div className="flex flex-wrap gap-2">
                {ALL_PROFESSIONS.map(pr => (
                  <button key={pr} type="button" onClick={() => setWorkRole(pr)}
                    className={`px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${workRole === pr ? 'bg-[#7209B7] text-white border-[#7209B7]' : 'bg-white text-slate-600 border-slate-200 hover:border-[#7209B7]/40'}`}>
                    {pr}
                  </button>
                ))}
              </div>
            </EditField>
            <EditField label="Company Name">
              <input type="text" value={company} onChange={e => setCompany(e.target.value)} className={inputCls} placeholder="Enter company name" />
            </EditField>
            <EditField label="Annual Income">
              <div className="flex flex-wrap gap-2">
                {ALL_INCOMES.map(inc => (
                  <button key={inc} type="button" onClick={() => setIncome(inc)}
                    className={`px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${income === inc ? 'bg-[#7209B7] text-white border-[#7209B7]' : 'bg-white text-slate-600 border-slate-200 hover:border-[#7209B7]/40'}`}>
                    {inc}
                  </button>
                ))}
              </div>
            </EditField>
          </div>
        );

      case 'lifestyle':
        return (
          <div className="space-y-5">
            <EditField label="Marital Status">
              <div className="flex flex-wrap gap-2">
                {ALL_MARITAL_STATUSES.map(ms => (
                  <button key={ms} type="button" onClick={() => {
                    setMaritalStatus(ms);
                    if (ms === 'Never Married') {
                      setHasChildren('No');
                      setChildrenCount(0);
                      setChildrenStayingWith('');
                    }
                  }}
                    className={`px-4 py-2 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${maritalStatus === ms ? 'bg-[#4CC9F0] text-white border-[#4CC9F0]' : 'bg-white text-slate-600 border-slate-200 hover:border-[#4CC9F0]/50'}`}>
                    {ms}
                  </button>
                ))}
              </div>
            </EditField>

            {maritalStatus && maritalStatus !== 'Never Married' && (
              <div className="p-4 bg-purple-50/50 rounded-2xl border border-purple-100/70 space-y-4 animate-in fade-in duration-200">
                <EditField label="Have Children / Kids?">
                  <div className="flex gap-2">
                    {['No', 'Yes'].map(opt => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => {
                          setHasChildren(opt);
                          if (opt === 'No') {
                            setChildrenCount(0);
                            setChildrenStayingWith('');
                          } else if (childrenCount === 0) {
                            setChildrenCount(1);
                          }
                        }}
                        className={`flex-1 py-2 px-3 rounded-xl border text-xs font-bold transition cursor-pointer ${
                          hasChildren === opt
                            ? 'bg-[#5D34F7] text-white border-[#5D34F7] shadow-xs'
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </EditField>

                {hasChildren === 'Yes' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-purple-100">
                    <EditField label="Number of Children">
                      <select
                        value={childrenCount || 1}
                        onChange={e => setChildrenCount(Number(e.target.value))}
                        className={selectCls}
                      >
                        <option value={1}>1 Child</option>
                        <option value={2}>2 Children</option>
                        <option value={3}>3 or More Children</option>
                      </select>
                    </EditField>

                    <EditField label="Children Living With">
                      <select
                        value={childrenStayingWith}
                        onChange={e => setChildrenStayingWith(e.target.value)}
                        className={selectCls}
                      >
                        <option value="">Select Living Arrangement</option>
                        <option value="Me">Living with me</option>
                        <option value="Separate">Living separately</option>
                      </select>
                    </EditField>
                  </div>
                )}
              </div>
            )}
            <EditField label="Height">
              <select value={height} onChange={e => setHeight(e.target.value)} className={selectCls}>
                <option value="">Select Height</option>
                {ALL_HEIGHTS.map(h => <option key={h} value={h}>{h}</option>)}
              </select>
            </EditField>
            <EditField label="Diet">
              <div className="flex flex-wrap gap-2">
                {ALL_DIETS.map(d => (
                  <button key={d} type="button" onClick={() => setDiet(d)}
                    className={`px-4 py-2 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${diet === d ? 'bg-[#4CC9F0] text-white border-[#4CC9F0]' : 'bg-white text-slate-600 border-slate-200 hover:border-[#4CC9F0]/50'}`}>
                    {d}
                  </button>
                ))}
              </div>
            </EditField>
          </div>
        );

      case 'hobbies':
        return (
          <div className="space-y-5">
            {HOBBIES_CATEGORIES.map(group => (
              <div key={group.title} className="space-y-2">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wide">{group.title}</h4>
                <div className="flex flex-wrap gap-2">
                  {group.items.map(item => {
                    const sel = hobbies.includes(item);
                    return (
                      <button key={item} type="button"
                        onClick={() => sel ? setHobbies(hobbies.filter(h => h !== item)) : setHobbies([...hobbies, item])}
                        className={`px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${sel ? 'bg-[#5D34F7] text-white border-[#5D34F7]' : 'bg-white text-slate-600 border-slate-200 hover:border-[#5D34F7]/40'}`}>
                        {sel ? '✓ ' : ''}{item}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}

            {/* Custom Hobby Input */}
            <div className="pt-2">
              <label className="text-xs font-bold text-slate-600 block mb-1.5">Add Custom Hobby / Interest</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={customHobbyInput}
                  onChange={(e) => setCustomHobbyInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      const val = customHobbyInput.trim();
                      if (val && !hobbies.some(h => h.toLowerCase() === val.toLowerCase())) {
                        setHobbies([...hobbies, val]);
                        setCustomHobbyInput('');
                      }
                    }
                  }}
                  placeholder="e.g. Calligraphy, Astronomy, Baking..."
                  className="flex-1 px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-[#5D34F7] bg-white transition"
                />
                <button
                  type="button"
                  onClick={() => {
                    const val = customHobbyInput.trim();
                    if (val && !hobbies.some(h => h.toLowerCase() === val.toLowerCase())) {
                      setHobbies([...hobbies, val]);
                      setCustomHobbyInput('');
                    }
                  }}
                  className="px-4 py-2 bg-[#5D34F7] text-white rounded-xl text-xs font-bold hover:bg-[#4024DB] transition cursor-pointer"
                >
                  + Add
                </button>
              </div>
            </div>

            {hobbies.length > 0 && (
              <div className="pt-3 border-t border-slate-100">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs text-slate-600 font-bold">Selected Hobbies ({hobbies.length})</p>
                  <button
                    type="button"
                    onClick={() => setHobbies([])}
                    className="text-[11px] text-rose-600 hover:underline cursor-pointer font-semibold"
                  >
                    Clear all
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {hobbies.map(h => (
                    <span key={h} className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#5D34F7]/10 text-[#5D34F7] text-xs font-semibold rounded-full">
                      {h}
                      <button
                        type="button"
                        onClick={() => setHobbies(hobbies.filter(x => x !== h))}
                        className="hover:text-rose-600 cursor-pointer font-black text-[11px]"
                        title="Remove"
                      >
                        ✕
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        );

      case 'family':
        return (
          <div className="space-y-5">
            <EditField label="Mother's Status">
              <select value={motherStatus} onChange={e => setMotherStatus(e.target.value)} className={selectCls}>
                <option value="">Select Status</option>
                {['Employed', 'Homemaker', 'Business Woman', 'Retired', 'Passed Away'].map(v => <option key={v} value={v}>{v}</option>)}
              </select>
            </EditField>
            <EditField label="Father's Status">
              <select value={fatherStatus} onChange={e => setFatherStatus(e.target.value)} className={selectCls}>
                <option value="">Select Status</option>
                {['Employed', 'Business Owner', 'Retired', 'Passed Away'].map(v => <option key={v} value={v}>{v}</option>)}
              </select>
            </EditField>
            <div className="p-4 bg-slate-50/70 rounded-2xl border border-slate-100 space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wide flex items-center gap-1.5">
                  <Users size={14} className="text-[#3F37C9]" /> Siblings
                </label>
                <span className="text-xs font-black text-[#3F37C9] bg-white px-2.5 py-1 rounded-lg border border-slate-200/60 shadow-2xs">
                  {formatSiblings({ profile: { brothersCount, sistersCount } })}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <EditField label="Number of Brothers">
                  <select value={brothersCount} onChange={e => setBrothersCount(Number(e.target.value))} className={selectCls}>
                    {[0,1,2,3,4,5].map(n => <option key={n} value={n}>{n}</option>)}
                  </select>
                </EditField>
                <EditField label="Number of Sisters">
                  <select value={sistersCount} onChange={e => setSistersCount(Number(e.target.value))} className={selectCls}>
                    {[0,1,2,3,4,5].map(n => <option key={n} value={n}>{n}</option>)}
                  </select>
                </EditField>
              </div>
            </div>
            <EditField label="Lives With Family?">
              <div className="flex gap-3">
                {[true, false].map(val => (
                  <button key={String(val)} type="button" onClick={() => setLiveWithFamily(val)}
                    className={`flex-1 py-2.5 rounded-xl border text-sm font-semibold transition-all cursor-pointer ${liveWithFamily === val ? 'bg-[#3F37C9] text-white border-[#3F37C9]' : 'bg-white text-slate-600 border-slate-200'}`}>
                    {val ? '✅ Yes' : '❌ No'}
                  </button>
                ))}
              </div>
            </EditField>
            {liveWithFamily === false && (
              <EditField label="Family Location">
                <input type="text" value={familyLocation} onChange={e => setFamilyLocation(e.target.value)} className={inputCls} placeholder="Where does the family live?" />
              </EditField>
            )}
            <EditField label="Family Financial Status">
              <div className="flex flex-wrap gap-2">
                {ALL_FINANCIAL_STATUSES.map(fs => (
                  <button key={fs} type="button" onClick={() => setFamilyFinancialStatus(fs)}
                    className={`px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${familyFinancialStatus === fs ? 'bg-[#3F37C9] text-white border-[#3F37C9]' : 'bg-white text-slate-600 border-slate-200 hover:border-[#3F37C9]/40'}`}>
                    {fs}
                  </button>
                ))}
              </div>
            </EditField>
          </div>
        );

      case 'astrology':
        return (
          <div className="space-y-5">
            <div className="p-4 bg-purple-50/70 rounded-2xl border border-purple-100 flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-[#9333EA] shrink-0 mt-0.5" />
              <div className="text-xs text-slate-600">
                <p className="font-bold text-slate-800 mb-1">Birth Details for Kundali & Astrology</p>
                <p>
                  Time and City of Birth are used for astrological calculations, horoscope matching, and Kundali analysis.
                </p>
              </div>
            </div>

            <EditField label="Time of Birth">
              <input
                type="time"
                value={timeOfBirth}
                onChange={e => setTimeOfBirth(e.target.value)}
                className={inputCls}
              />
              <p className="text-[10px] text-slate-400 mt-1">
                Enter your exact time of birth if known (format: HH:MM).
              </p>
            </EditField>

            <EditField label="City of Birth">
              <input
                type="text"
                value={cityOfBirth}
                onChange={e => setCityOfBirth(e.target.value)}
                className={inputCls}
                placeholder={city || "e.g. Mumbai"}
              />
              <p className="text-[10px] text-slate-400 mt-1">
                City where you were born (defaults to current city: <strong>{city || 'Not set'}</strong> if left unchanged).
              </p>
            </EditField>
          </div>
        );

      case 'contact':
        const activeStd = COUNTRY_PHONE_STANDARDS.find(s => s.code === countryCode) || COUNTRY_PHONE_STANDARDS[0];
        return (
          <div className="space-y-5">
            <EditField label="Email Address">
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} className={inputCls} placeholder="your@email.com" />
            </EditField>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Phone Number</label>
              <div className="flex gap-2">
                <select
                  value={countryCode}
                  onChange={(e) => {
                    setCountryCode(e.target.value);
                    setPhone('');
                  }}
                  className="px-3 py-2.5 border border-slate-200 rounded-xl text-sm bg-slate-50 text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#5D34F7] transition-all w-32"
                >
                  {COUNTRY_PHONE_STANDARDS.map(s => (
                    <option key={s.code} value={s.code}>{s.code} ({s.name})</option>
                  ))}
                </select>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => {
                    const cleaned = e.target.value.replace(/\D/g, '');
                    setPhone(cleaned.slice(0, activeStd.length));
                  }}
                  className={`${inputCls} flex-1`}
                  placeholder={activeStd.placeholder}
                />
              </div>
              <p className="text-[11px] text-slate-400 mt-1">Requires exactly {activeStd.length} digits for {activeStd.name}.</p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  // ========================
  // MAIN RENDER
  // ========================
  return (
    <div className="min-h-screen bg-white pb-24 font-sans animate-in fade-in duration-300">

      {/* Page Header */}
      <div className="max-w-7xl mx-auto lg:mx-0 lg:ml-6 xl:ml-10 px-4 mt-6 lg:px-8">
        <div className="bg-white rounded-3xl p-6 shadow-md border border-slate-100 flex justify-between items-center transition-all duration-300 hover:shadow-lg">
          <div>
            <h1 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-3">
              <svg className="w-8 h-8 drop-shadow-sm shrink-0" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="3" y="3" width="18" height="18" rx="5" fill="url(#title_grad)" />
                <circle cx="12" cy="9" r="3" fill="white" />
                <path d="M7 17C7 14.5 9 13.5 12 13.5C15 13.5 17 14.5 17 17" stroke="white" strokeWidth="1.8" strokeLinecap="round" />
                <defs>
                  <linearGradient id="title_grad" x1="3" y1="3" x2="21" y2="21" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#5D34F7" />
                    <stop offset="1" stopColor="#805CFF" />
                  </linearGradient>
                </defs>
              </svg>
              <span>{id ? 'Profile Details' : 'My Profile & Preferences'}</span>
              {isPhotoVerified(profile) && (
                <PhotoVerifiedBadge user={profile} variant="badge" />
              )}
            </h1>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 mt-1">
              <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">
                {id ? `UID: ${profile?.uid || id}` : 'Manage your personal matrimony portfolio and search filters'}
              </p>
              {famId && (
                <div className="flex items-center gap-2">
                  <span className="text-slate-300 hidden sm:inline">•</span>
                  <button
                    type="button"
                    onClick={(e) => handleCopyFamId(famId, e)}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#5D34F7]/10 hover:bg-[#5D34F7]/20 text-[#5D34F7] text-[11px] font-black tracking-wider rounded-xl border border-[#5D34F7]/20 uppercase transition-all cursor-pointer active:scale-95 group/copy"
                    title="Click to copy FAM ID"
                    aria-label="Click to copy FAM ID"
                  >
                    <span>FAM ID: <span className="font-mono">{famId}</span></span>
                    {copiedFamId === famId ? (
                      <span className="inline-flex items-center gap-1 text-emerald-600 font-extrabold normal-case text-[10px]">
                        <Check size={12} className="stroke-[2.5]" />
                        <span>Copied!</span>
                      </span>
                    ) : (
                      <Copy size={12} className="opacity-75 group-hover/copy:opacity-100" />
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-2 flex-wrap items-center">
            {id ? (
              <>
                <button
                  onClick={() => navigate(-1)}
                  className="flex items-center gap-1.5 px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs sm:text-sm font-extrabold shadow-sm transition duration-200 cursor-pointer active:scale-95"
                >
                  ← Back
                </button>
                {/* Feature 7: Send Interest, Chat, and Call Consultant on Profile Details */}
                <button
                  type="button"
                  disabled={isSendingOtherInterest || otherUserInterestSent}
                  onClick={async () => {
                    if (otherUserInterestSent) return;
                    setIsSendingOtherInterest(true);
                    try {
                      await api.post('/users/interests', { receiverId: id });
                      setOtherUserInterestSent(true);
                    } catch (err) {
                      console.error('Error sending interest from profile:', err);
                    } finally {
                      setIsSendingOtherInterest(false);
                    }
                  }}
                  className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold shadow-sm transition duration-200 cursor-pointer active:scale-95 ${
                    otherUserInterestSent
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-300'
                      : 'bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white shadow-pink-500/25'
                  }`}
                  title={otherUserInterestSent ? 'Interest sent successfully' : 'Express connection interest'}
                >
                  <Heart size={15} className={otherUserInterestSent ? 'text-emerald-600 fill-emerald-600' : 'fill-white'} />
                  <span>{otherUserInterestSent ? 'Interest Sent ✓' : 'Send Interest'}</span>
                </button>
                <button
                  onClick={() => navigate('/messages', { state: { contactId: id } })}
                  className="flex items-center gap-1.5 px-4 py-2.5 bg-gradient-to-r from-[#5D34F7] to-[#4024DB] hover:opacity-95 text-white rounded-xl text-xs sm:text-sm font-extrabold shadow-sm shadow-[#5D34F7]/25 transition duration-200 cursor-pointer active:scale-95"
                  title="Direct Message / Chat"
                >
                  <MessageSquare size={15} /> <span>Chat</span>
                </button>
                {/* VIP Consultant Button for VIP users */}
                {(viewerUser?.premiumMembership?.isPremium && (viewerUser?.premiumMembership?.managedByUs || viewerUser?.premiumMembership?.planType?.toLowerCase().includes('vip'))) && (
                  <button
                    type="button"
                    onClick={() => setShowVipConsultantModal(true)}
                    className="flex items-center gap-1.5 px-4 py-2.5 bg-gradient-to-r from-amber-400 to-orange-400 hover:from-amber-300 hover:to-orange-300 text-slate-950 rounded-xl text-xs sm:text-sm font-black shadow-md shadow-amber-500/20 transition duration-200 cursor-pointer active:scale-95"
                    title="Call VIP Relationship Consultant for personalized assistance"
                  >
                    <span>👑</span>
                    <span>Call Consultant</span>
                  </button>
                )}
                <button
                  onClick={() => {
                    const el = document.getElementById('contact-info-section');
                    if (el) {
                      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                      el.classList.add('ring-4', 'ring-emerald-400/50', 'transition-all');
                      setTimeout(() => el.classList.remove('ring-4', 'ring-emerald-400/50'), 2500);
                    }
                  }}
                  className="flex items-center gap-1.5 px-3.5 py-2.5 bg-emerald-50 border border-emerald-200 text-emerald-700 hover:bg-emerald-600 hover:text-white rounded-xl text-xs sm:text-sm font-extrabold shadow-sm transition duration-200 cursor-pointer active:scale-95"
                  title="View contact information"
                >
                  <Phone size={15} /> <span>Contact Info</span>
                </button>
                <button
                  onClick={() => handleShareProfile(profile)}
                  className="flex items-center gap-1.5 px-3.5 py-2.5 bg-indigo-50 border border-indigo-100 text-[#5D34F7] hover:bg-[#5D34F7] hover:text-white rounded-xl text-xs sm:text-sm font-extrabold shadow-sm transition duration-200 cursor-pointer active:scale-95"
                >
                  <Share2 size={15} /> <span>Share</span>
                </button>
                <button
                  onClick={() => handleDownloadProfile(profile)}
                  className="flex items-center gap-1.5 px-3.5 py-2.5 bg-violet-50 border border-violet-100 text-violet-600 hover:bg-violet-600 hover:text-white rounded-xl text-xs sm:text-sm font-extrabold shadow-sm transition duration-200 cursor-pointer active:scale-95"
                >
                  <Download size={15} /> <span>Download</span>
                </button>
              </>
            ) : activeTab === 'profile' && (
              !isEditing ? (
                <>
                  <button
                    type="button"
                    onClick={() => setShowVipShaadiModal(true)}
                    className="flex items-center gap-1.5 px-4 py-2.5 bg-gradient-to-r from-amber-400 via-amber-300 to-orange-400 hover:from-amber-300 hover:to-orange-300 text-slate-950 rounded-xl text-sm font-extrabold shadow-sm transition duration-200 cursor-pointer active:scale-95 border border-amber-300"
                    title="VIP Familiess – Get Invited"
                  >
                    <span>👑</span> VIP Familiess – {vipEnquiryData?.hasActiveEnquiry ? 'Status' : 'Get Invited'}
                  </button>
                  <button
                    onClick={() => {
                      const el = document.getElementById('contact-info-section');
                      if (el) {
                        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        el.classList.add('ring-4', 'ring-emerald-400/50', 'transition-all');
                        setTimeout(() => el.classList.remove('ring-4', 'ring-emerald-400/50'), 2500);
                      }
                    }}
                    className="flex items-center gap-1.5 px-4 py-2.5 bg-emerald-50 border border-emerald-200 text-emerald-700 hover:bg-emerald-600 hover:text-white rounded-xl text-sm font-extrabold shadow-sm transition duration-200 cursor-pointer active:scale-95"
                    title="View contact information"
                  >
                    <Phone size={16} /> Contact Info
                  </button>
                  <button
                    onClick={() => handleShareProfile(profile)}
                    className="flex items-center gap-1.5 px-4 py-2.5 bg-indigo-50 border border-indigo-100 text-[#5D34F7] hover:bg-[#5D34F7] hover:text-white rounded-xl text-sm font-extrabold shadow-sm transition duration-200 cursor-pointer active:scale-95"
                  >
                    <Share2 size={16} /> Share
                  </button>
                  <button
                    onClick={() => handleDownloadProfile(profile)}
                    className="flex items-center gap-1.5 px-4 py-2.5 bg-violet-50 border border-violet-100 text-violet-600 hover:bg-violet-600 hover:text-white rounded-xl text-sm font-extrabold shadow-sm transition duration-200 cursor-pointer active:scale-95"
                  >
                    <Download size={16} /> Download
                  </button>
                  <button
                    onClick={() => navigate('/legal/safety-center')}
                    className="flex items-center gap-1.5 px-4 py-2.5 bg-amber-50/80 border border-amber-200/70 text-amber-800 hover:bg-[#5D34F7] hover:text-white hover:border-[#5D34F7] rounded-xl text-sm font-extrabold shadow-2xs transition duration-200 cursor-pointer active:scale-95"
                    title="View Safety Center"
                  >
                    <ShieldCheck size={16} className="text-amber-600" /> Safety Center
                  </button>
                  <button
                    onClick={() => navigate('/legal/terms-conditions')}
                    className="flex items-center gap-1.5 px-4 py-2.5 bg-slate-50 border border-slate-200 text-slate-700 hover:bg-[#5D34F7] hover:text-white hover:border-[#5D34F7] rounded-xl text-sm font-extrabold shadow-2xs transition duration-200 cursor-pointer active:scale-95"
                    title="View Terms & Conditions"
                  >
                    <FileText size={16} /> Terms & Conditions
                  </button>
                  <button
                    onClick={() => navigate('/legal/privacy-policy')}
                    className="flex items-center gap-1.5 px-4 py-2.5 bg-slate-50 border border-slate-200 text-slate-700 hover:bg-[#5D34F7] hover:text-white hover:border-[#5D34F7] rounded-xl text-sm font-extrabold shadow-2xs transition duration-200 cursor-pointer active:scale-95"
                    title="View Privacy Policy"
                  >
                    <ShieldCheck size={16} className="text-emerald-600" /> Privacy Policy
                  </button>
                  <button
                    onClick={() => { setIsEditing(true); setActiveEditCategory('basic'); }}
                    className="flex items-center gap-1.5 px-5 py-2.5 bg-gradient-to-r from-[#5D34F7] to-[#4024DB] text-white rounded-xl text-sm font-extrabold hover:opacity-95 shadow-md shadow-[#5D34F7]/15 hover:shadow-lg transition cursor-pointer active:scale-95"
                  >
                    <Edit2 size={16} /> Edit Profile
                  </button>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 px-5 py-2.5 bg-rose-50 border border-rose-100 hover:bg-rose-500 hover:border-rose-500 text-rose-600 hover:text-white rounded-xl text-sm font-extrabold shadow-sm transition duration-200 cursor-pointer active:scale-95"
                  >
                    <LogOut size={16} />
                    <span>Log Out</span>
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="flex items-center gap-1.5 px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl text-sm font-extrabold hover:opacity-95 shadow-sm transition cursor-pointer disabled:opacity-50 active:scale-95"
                  >
                    <Check size={16} /> {isSaving ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button
                    onClick={() => { setIsEditing(false); fetchProfile(); }}
                    disabled={isSaving}
                    className="flex items-center gap-1.5 px-5 py-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl text-sm font-extrabold hover:bg-slate-50 transition cursor-pointer disabled:opacity-50 active:scale-95"
                  >
                    <X size={16} /> Cancel
                  </button>
                </>
              )
            )}
          </div>
        </div>
      </div>

      {/* Save success toast */}
      {saveSuccess && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-emerald-500 text-white px-6 py-3 rounded-2xl shadow-lg text-sm font-bold flex items-center gap-2 animate-in fade-in slide-in-from-top-4 duration-300">
          <Check size={16} /> Profile saved successfully!
        </div>
      )}

      {/* Remove College success toast */}
      {removeCollegeSuccess && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-emerald-500 text-white px-6 py-3 rounded-2xl shadow-lg text-sm font-bold flex items-center gap-2 animate-in fade-in slide-in-from-top-4 duration-300">
          <Check size={16} /> College removed successfully!
        </div>
      )}

      {/* Tabs Switcher */}
      {!id && (
        <div className="max-w-7xl mx-auto lg:mx-0 lg:ml-6 xl:ml-10 px-4 mt-6 lg:px-8">
          <div className="bg-white rounded-3xl p-2 shadow-sm border border-slate-100 flex gap-1 w-full sm:w-fit flex-wrap">
            <button
              onClick={() => { setActiveTab('profile'); setIsEditing(false); }}
              className={`px-6 py-3 rounded-2xl text-xs font-black tracking-wide uppercase transition-all duration-200 flex-1 sm:flex-initial cursor-pointer ${
                activeTab === 'profile'
                  ? 'bg-gradient-to-r from-[#5D34F7] to-[#4024DB] text-white shadow-md shadow-[#5D34F7]/15'
                  : 'bg-transparent text-gray-600 hover:bg-slate-50 hover:text-slate-800'
              }`}
            >
              My Profile
            </button>
            <button
              onClick={() => setActiveTab('preferences')}
              className={`px-6 py-3 rounded-2xl text-xs font-black tracking-wide uppercase transition-all duration-200 flex-1 sm:flex-initial cursor-pointer inline-flex items-center justify-center gap-1.5 group ${
                activeTab === 'preferences'
                  ? 'bg-gradient-to-r from-[#5D34F7] to-[#4024DB] text-white shadow-md shadow-[#5D34F7]/15'
                  : 'bg-transparent text-gray-600 hover:bg-slate-50 hover:text-slate-800'
              }`}
            >
              <span>Partner Preferences</span>
              <ArrowRight size={13} className={`transition-transform duration-200 ${activeTab === 'preferences' ? 'translate-x-0.5' : 'opacity-70 group-hover:translate-x-1 group-hover:opacity-100'}`} />
            </button>
            <button
              onClick={() => {
                setActiveTab('profile');
                setIsEditing(false);
                setTimeout(() => {
                  const el = document.getElementById('contact-info-section');
                  if (el) {
                    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    el.classList.add('ring-4', 'ring-emerald-400/50', 'transition-all');
                    setTimeout(() => el.classList.remove('ring-4', 'ring-emerald-400/50'), 2500);
                  }
                }, 50);
              }}
              className="px-6 py-3 rounded-2xl text-xs font-black tracking-wide uppercase transition-all duration-200 flex-1 sm:flex-initial cursor-pointer bg-transparent text-gray-600 hover:bg-emerald-50 hover:text-emerald-700 flex items-center justify-center gap-1.5"
            >
              <Phone size={14} className="text-emerald-600" />
              <span>Contact Info</span>
            </button>
          </div>
        </div>
      )}

      {activeTab === 'profile' ? (
        <>
          {/* Error Banner */}
          {error && (
            <div className="max-w-7xl mx-auto lg:mx-0 lg:ml-6 xl:ml-10 px-4 mt-4 lg:px-8">
              <div className="bg-red-50 text-red-600 p-4 rounded-2xl text-sm text-center font-medium">
                {error}
              </div>
            </div>
          )}

          {isEditing ? (
            /* ====================================
               EDIT MODE: Category-wise layout
               ==================================== */
            <div className="max-w-7xl mx-auto lg:mx-0 lg:ml-6 xl:ml-10 px-4 mt-6 lg:px-8">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

                {/* Left: Category sidebar */}
                <aside className="lg:col-span-3">
                  <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                    {/* Profile snapshot */}
                    <div className="p-5 bg-gradient-to-br from-[#5D34F7]/10 to-[#805CFF]/5 border-b border-slate-100">
                      <div className="flex items-center gap-3">
                        <div 
                          onClick={() => displayPhotos && displayPhotos.length > 0 && handleOpenFullScreenImage(0)}
                          className={`w-12 h-12 rounded-xl overflow-hidden bg-[#5D34F7]/10 border-2 border-[#5D34F7]/20 flex-shrink-0 relative ${displayPhotos && displayPhotos.length > 0 ? 'cursor-pointer hover:opacity-95' : ''}`}
                          title={displayPhotos && displayPhotos.length > 0 ? 'Click to view photo in full screen' : ''}
                        >
                          {displayPhotos && displayPhotos[0] ? (
                            <>
                              <img 
                                src={getPhotoUrl(displayPhotos[0], p.gender)} 
                                alt="Avatar" 
                                onError={(e) => handleImageError(e, p.gender)}
                                className="w-full h-full object-cover" 
                              />
                              {getPhotoStatus(displayPhotos[0]) === 'rejected' && (
                                <div className="absolute bottom-0 inset-x-0 bg-red-600/90 text-white text-[6px] font-black py-0.5 text-center leading-none uppercase pointer-events-none z-10">
                                  Rejected
                                </div>
                              )}
                              {getPhotoStatus(displayPhotos[0]) === 'pending' && (
                                <div className="absolute bottom-0 inset-x-0 bg-amber-500/90 text-white text-[6px] font-black py-0.5 text-center leading-none uppercase pointer-events-none z-10">
                                  Pending
                                </div>
                              )}
                            </>
                          ) : (
                            <img 
                              src={getDefaultAvatar(p.gender)} 
                              alt="Avatar" 
                              className="w-full h-full object-cover" 
                            />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-slate-800 truncate">{p.name || fullName || 'Your Profile'}</p>
                          <p className="text-[11px] text-slate-500 truncate">Editing mode active</p>
                        </div>
                      </div>
                    </div>

                    <div className="py-2">
                      {EDIT_CATEGORIES.map((cat) => {
                        const isActive = activeEditCategory === cat.id;
                        return (
                          <button
                            key={cat.id}
                            onClick={() => setActiveEditCategory(cat.id)}
                            className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-all duration-200 border-l-4 cursor-pointer ${
                              isActive
                                ? 'bg-gradient-to-r from-[#5D34F7]/5 to-[#5D34F7]/10 border-[#5D34F7] text-[#5D34F7]'
                                : 'border-transparent hover:bg-slate-50 text-slate-600 hover:text-slate-800'
                            }`}
                          >
                            <div className={`p-2 rounded-lg ${isActive ? cat.bg : 'bg-slate-100'} transition-all`}>
                              <CategoryIcon name={cat.iconName} color={cat.color} className="w-4 h-4" />
                            </div>
                            <span className="text-sm font-bold flex-1">
                              {cat.label}
                            </span>
                            {isActive && <ChevronRight size={14} className="text-[#5D34F7] animate-pulse" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </aside>

                {/* Right: Category form panel */}
                <main className="lg:col-span-9">
                  <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                    {/* Category header */}
                    <div className="px-7 py-5 bg-slate-50/50 border-b border-slate-100 flex items-center gap-4">
                      {(() => {
                        const activeCat = EDIT_CATEGORIES.find(c => c.id === activeEditCategory) || EDIT_CATEGORIES[0];
                        return (
                          <>
                            <div className={`p-3 rounded-xl ${activeCat.bg} shadow-sm border border-slate-200/50`}>
                              <CategoryIcon name={activeCat.iconName} color={activeCat.color} className="w-6 h-6" />
                            </div>
                            <div>
                              <h3 className="text-lg font-black text-slate-800">{activeCat.label}</h3>
                              <p className="text-xs text-slate-400">Update your {activeCat.label.toLowerCase()} details</p>
                            </div>
                          </>
                        );
                      })()}
                    </div>

                    {/* Photo management section if Basic Info */}
                    {activeEditCategory === 'basic' && (
                      <div className="px-7 pt-6 pb-3">
                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Profile Photos</label>
                        <div className="mt-2 space-y-4">
                          <div
                            onClick={() => document.getElementById('profile-photo-upload-edit').click()}
                            className="flex flex-col items-center justify-center p-5 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50 hover:bg-slate-50 hover:border-[#5D34F7]/40 transition-all duration-200 cursor-pointer text-center group"
                          >
                            <input
                              type="file"
                              id="profile-photo-upload-edit"
                              className="hidden"
                              accept="image/*"
                              multiple
                              onChange={async (e) => {
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
                              }}
                            />
                            <div className="p-2.5 bg-white rounded-full shadow-sm text-[#5D34F7] group-hover:scale-110 transition duration-200 border border-slate-100">
                              <Plus size={18} />
                            </div>
                            <span className="text-xs font-extrabold text-slate-700 mt-2">Add Photos</span>
                            <span className="text-[10px] text-slate-400 font-medium mt-0.5">Click to browse files</span>
                          </div>
                          {photos.length > 0 && (
                            <div className="flex flex-wrap gap-2.5">
                              {photos.map((url, index) => {
                                const photoStatus = getPhotoStatus(url);
                                return (
                                <div key={index} className="relative w-20 h-24 rounded-xl overflow-hidden border border-gray-200 group">
                                  <img 
                                    src={getPhotoUrl(url, p.gender)} 
                                    alt={`Gallery ${index}`} 
                                    onError={(e) => handleImageError(e, p.gender)}
                                    className="w-full h-full object-cover" 
                                  />
                                  {photoStatus === 'rejected' && (
                                    <div className="absolute bottom-0 inset-x-0 bg-red-600/90 text-white text-[7px] font-black py-0.5 text-center leading-none uppercase pointer-events-none z-10">
                                      Rejected
                                    </div>
                                  )}
                                  {photoStatus === 'pending' && (
                                    <div className="absolute bottom-0 inset-x-0 bg-amber-500/90 text-white text-[7px] font-black py-0.5 text-center leading-none uppercase pointer-events-none z-10">
                                      Pending
                                    </div>
                                  )}
                                  <button
                                    type="button"
                                    onClick={() => setPhotos(photos.filter((_, i) => i !== index))}
                                    className="absolute top-1 right-1 p-1 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors z-20 cursor-pointer shadow-sm"
                                    title="Delete photo"
                                  >
                                    <Trash2 size={10} />
                                  </button>
                                </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                        <div className="border-t border-slate-100 mt-5 mb-0" />
                      </div>
                    )}

                    {/* Fields */}
                    <div className="px-7 py-6">
                      {renderEditCategory()}
                    </div>

                    {/* Per-category Save button */}
                    <div className="px-7 pb-6 flex items-center justify-between">
                      <div className="flex gap-2">
                        {EDIT_CATEGORIES.findIndex(c => c.id === activeEditCategory) > 0 && (
                          <button
                            type="button"
                            onClick={() => {
                              const idx = EDIT_CATEGORIES.findIndex(c => c.id === activeEditCategory);
                              setActiveEditCategory(EDIT_CATEGORIES[idx - 1].id);
                            }}
                            className="px-4 py-2 text-sm font-semibold text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-50 transition cursor-pointer"
                          >
                            ← Back
                          </button>
                        )}
                        {EDIT_CATEGORIES.findIndex(c => c.id === activeEditCategory) < EDIT_CATEGORIES.length - 1 && (
                          <button
                            type="button"
                            onClick={() => {
                              const idx = EDIT_CATEGORIES.findIndex(c => c.id === activeEditCategory);
                              setActiveEditCategory(EDIT_CATEGORIES[idx + 1].id);
                            }}
                            className="px-4 py-2 text-sm font-semibold text-[#5D34F7] border border-[#5D34F7]/30 rounded-xl hover:bg-[#5D34F7]/5 transition cursor-pointer"
                          >
                            Next →
                          </button>
                        )}
                      </div>
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => { setIsEditing(false); fetchProfile(); }}
                          disabled={isSaving}
                          className="px-4 py-2.5 text-sm font-semibold text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-50 transition cursor-pointer disabled:opacity-50"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleSave}
                          disabled={isSaving}
                          className="flex items-center gap-1.5 px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl text-sm font-extrabold hover:opacity-95 shadow-sm transition cursor-pointer disabled:opacity-50 active:scale-95"
                        >
                          <Check size={15} /> {isSaving ? 'Saving...' : 'Save All Changes'}
                        </button>
                      </div>
                    </div>
                  </div>
                </main>
              </div>
            </div>
          ) : (
            /* ====================================
               VIEW MODE: Profile display with direct image upload
               ==================================== */
            <div className="max-w-7xl mx-auto lg:mx-0 lg:ml-6 xl:ml-10 px-4 mt-6 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start lg:px-8">

              {/* Left Column: Photo & Gallery */}
              <aside className="lg:col-span-5 space-y-6 w-full">

                {/* VIP SHAADI – GET INVITED BANNER */}
                {!id && (
                  <div className="rounded-3xl p-5 sm:p-6 bg-gradient-to-br from-slate-950 via-purple-950 to-slate-900 border-2 border-amber-400/80 shadow-xl text-white relative overflow-hidden space-y-3.5">
                    <div className="absolute -top-10 -right-10 w-40 h-40 bg-amber-500/20 rounded-full blur-2xl pointer-events-none" />
                    <div className="relative z-10 flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-400/20 border border-amber-400/40 text-amber-300 text-[10px] font-black uppercase tracking-wider">
                          <span>👑</span>
                          <span>VIP Familiess • By Invitation Only</span>
                        </div>
                        <h3 className="text-lg sm:text-xl font-black text-white tracking-tight">
                          VIP Familiess – Get Invited
                        </h3>
                        <p className="text-slate-300 text-xs font-medium leading-relaxed">
                          Personalized, discreet matchmaking managed by senior certified relationship managers.
                        </p>
                      </div>
                    </div>

                    <div className="relative z-10 pt-2 border-t border-white/10 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                      <div className="text-xs text-slate-300">
                        {vipEnquiryData?.hasActiveEnquiry ? (
                          <span className="flex items-center gap-1.5 font-bold text-amber-300">
                            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
                            <span>Enquiry Active ({vipEnquiryData.data?.status || 'Under Review'})</span>
                          </span>
                        ) : (
                          <span className="text-slate-400 font-semibold">100% confidential & verified matching</span>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={() => setShowVipShaadiModal(true)}
                        className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 via-amber-300 to-orange-400 hover:from-amber-300 hover:to-orange-300 text-slate-950 font-black text-xs uppercase tracking-wider shadow-md shadow-amber-500/20 transition cursor-pointer active:scale-95 flex items-center justify-center gap-1.5 border border-amber-300"
                      >
                        <span>👑</span>
                        <span>{vipEnquiryData?.hasActiveEnquiry ? 'View VIP Status' : 'Get Invited'}</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* PROFILE HEADER & PHOTOS */}
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 space-y-6">
                  {/* Main Photo & Name */}
                  <div className="flex items-center gap-4">
                    {/* Feature 19: Avatar with dedicated Change DP button and modal */}
                    <div className="flex flex-col items-center shrink-0">
                      <div 
                        onClick={() => (!id ? setChangeDpModalOpen(true) : (displayPhotos && displayPhotos.length > 0 && handleOpenFullScreenImage(0)))}
                        className={`relative w-24 h-24 rounded-2xl overflow-hidden bg-[#5D34F7]/10 border border-[#5D34F7]/20 group ${!id || (displayPhotos && displayPhotos.length > 0) ? 'cursor-pointer hover:opacity-95' : ''}`}
                        title={id ? 'Click to view photo in full screen' : 'Click to change profile picture'}
                      >
                        {displayPhotos && displayPhotos[0] ? (
                          <>
                            <img 
                              src={getPhotoUrl(displayPhotos[0], p.gender)} 
                              alt="Avatar" 
                              onError={(e) => handleImageError(e, p.gender)}
                              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" 
                            />
                            {isPhotoVerified(profile) && (
                              <div className="absolute top-2 right-2 bg-emerald-600/95 backdrop-blur-md text-white text-[9px] font-black px-2 py-0.5 rounded-full shadow-md z-10 flex items-center gap-1 pointer-events-none border border-white/20 select-none">
                                <Check size={11} className="stroke-[3]" />
                                <span>Verified</span>
                              </div>
                            )}
                            {getPhotoStatus(displayPhotos[0]) === 'rejected' && (
                              <div className="absolute bottom-0 inset-x-0 bg-red-600/90 text-white text-[8px] font-black py-0.5 text-center leading-none uppercase pointer-events-none z-10">
                                Rejected
                              </div>
                            )}
                            {getPhotoStatus(displayPhotos[0]) === 'pending' && (
                              <div className="absolute bottom-0 inset-x-0 bg-amber-500/90 text-white text-[8px] font-black py-0.5 text-center leading-none uppercase pointer-events-none z-10">
                                Pending
                              </div>
                            )}
                          </>
                        ) : (
                          <img 
                            src={getDefaultAvatar(p.gender)} 
                            alt="Avatar" 
                            className="w-full h-full object-cover" 
                          />
                        )}
                        {/* Camera overlay */}
                        {!id && (
                          <div
                            onClick={(e) => {
                              e.stopPropagation();
                              setChangeDpModalOpen(true);
                            }}
                            className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 cursor-pointer rounded-2xl z-20"
                            title="Change Profile Picture (DP)"
                          >
                            <Camera size={20} className="text-white" />
                            <span className="text-white text-[10px] font-bold mt-1">Change DP</span>
                          </div>
                        )}
                      </div>
                      {!id && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setChangeDpModalOpen(true);
                          }}
                          className="mt-2 inline-flex items-center gap-1 px-2.5 py-1 bg-white hover:bg-[#5D34F7]/5 text-[#5D34F7] border border-[#5D34F7]/30 hover:border-[#5D34F7] rounded-lg text-[11px] font-bold transition duration-150 cursor-pointer active:scale-95 shadow-2xs"
                          title="Change Profile Picture (DP)"
                        >
                          <Camera size={12} />
                          <span>Change DP</span>
                        </button>
                      )}
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-black text-slate-800 tracking-tight">
                          UID: {profile?.uid || 'N/A'}
                        </span>
                        <PhotoVerifiedBadge user={profile} variant="badge" />
                        {!isPhotoVerified(profile) && !id && getPhotoVerificationStatus(profile) === 'pending' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-amber-50 text-amber-800 border border-amber-300 shadow-2xs animate-pulse">
                            <Clock size={11} className="text-amber-600" />
                            <span>Photo Verification Pending</span>
                          </span>
                        )}
                        {!isPhotoVerified(profile) && !id && getPhotoVerificationStatus(profile) === 'rejected' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-rose-50 text-rose-800 border border-rose-300 shadow-2xs">
                            <XCircle size={11} className="text-rose-600" />
                            <span>Photo Verification Failed</span>
                          </span>
                        )}
                      </div>
                      {famId && (
                        <div className="pt-1 flex items-center">
                          <button
                            type="button"
                            onClick={(e) => handleCopyFamId(famId, e)}
                            className="px-3 py-1.5 bg-[#5D34F7]/10 hover:bg-[#5D34F7]/20 text-[#5D34F7] text-xs font-black tracking-wider rounded-xl border border-[#5D34F7]/20 uppercase flex items-center gap-2 transition-all cursor-pointer active:scale-95 group/copy shadow-2xs"
                            title="Copy FAM ID to clipboard"
                            aria-label="Copy FAM ID"
                          >
                            <span className="flex items-center gap-1.5">
                              <span className="text-[10px] font-black opacity-70">FAM ID:</span>
                              <span className="font-mono font-black">{famId}</span>
                            </span>
                            {copiedFamId === famId ? (
                              <span className="inline-flex items-center gap-1 text-emerald-600 font-extrabold normal-case text-[11px]">
                                <Check size={13} className="stroke-[2.5]" />
                                <span>Copied!</span>
                              </span>
                            ) : (
                              <Copy size={13} className="opacity-70 group-hover/copy:opacity-100" />
                            )}
                          </button>
                        </div>
                      )}
                      {formatProfileCreatedBy(p.profileFor || profile?.profileFor || profileFor) && (
                        <div className="pt-1 flex items-center">
                          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 text-slate-700 text-xs font-bold rounded-xl border border-slate-200/80 shadow-2xs">
                            <Users size={13} className="text-[#5D34F7]" />
                            <span>Profile Created By: <strong className="font-black text-slate-900">{formatProfileCreatedBy(p.profileFor || profile?.profileFor || profileFor)}</strong></span>
                          </span>
                        </div>
                      )}
                      <div className="flex flex-col items-start gap-2 mt-2">
                        <div className="flex flex-wrap gap-2">
                          <span className={`inline-block px-3 py-1 text-xs font-semibold rounded-full border ${
                            profile?.premiumMembership?.isPremium
                              ? 'bg-amber-50 text-amber-600 border-amber-200'
                              : 'bg-[#5D34F7]/5 text-[#5D34F7] border-[#5D34F7]/10'
                          }`}>
                            {profile?.premiumMembership?.isPremium ? `${profile.premiumMembership.planType}` : 'Free Member'}
                          </span>
                          {profile?.isFeatured && (
                            <span className="inline-block px-3 py-1 text-xs font-semibold rounded-full border bg-gradient-to-r from-amber-500 to-orange-500 text-white border-amber-600 shadow-sm">
                              ⭐ Highlight My Profile
                            </span>
                          )}
                        </div>
                        {!id && !profile?.premiumMembership?.isPremium && (
                          <button
                            onClick={() => navigate('/plans')}
                            className="flex items-center gap-1 px-3 py-1.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-lg text-xs font-extrabold hover:opacity-95 shadow-sm transition cursor-pointer active:scale-95 border-0"
                          >
                            Buy Plan
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Photo Gallery with Direct Upload - Up to 10 Photos */}
                  <div className="space-y-3.5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <label className="text-sm font-bold text-gray-800 flex items-center gap-1.5">
                          <Camera size={18} className="text-[#5D34F7]" /> Profile Photos
                        </label>
                        <PhotoVerifiedBadge user={profile} variant="badge" />
                        <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-black ${
                          displayPhotos.length >= 10
                            ? 'bg-amber-100 text-amber-800 border border-amber-200'
                            : 'bg-[#5D34F7]/10 text-[#5D34F7] border border-[#5D34F7]/20'
                        }`}>
                          {displayPhotos.length}/10 uploaded
                        </span>
                      </div>

                      {/* Always-visible Add Photo button for own profile */}
                      {!id && (
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              if (displayPhotos.length >= 10) {
                                setError('You can upload a maximum of 10 pictures per account.');
                                return;
                              }
                              document.getElementById('gallery-direct-upload').click();
                            }}
                            disabled={isSaving || displayPhotos.length >= 10}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer active:scale-95 ${
                              displayPhotos.length >= 10
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200'
                                : 'bg-[#5D34F7]/10 text-[#5D34F7] hover:bg-[#5D34F7]/20'
                            }`}
                            title={displayPhotos.length >= 10 ? 'You can upload a maximum of 10 pictures per account.' : 'Add profile picture'}
                          >
                            <Plus size={13} />
                            {isSaving ? 'Saving...' : displayPhotos.length >= 10 ? 'Limit Reached (10/10)' : `Add Photo (${10 - displayPhotos.length} left)`}
                          </button>
                          <input
                            type="file"
                            id="gallery-direct-upload"
                            className="hidden"
                            accept="image/png,image/jpeg,image/jpg,image/webp"
                            multiple
                            onChange={(e) => handleUploadGalleryPhotos(e.target.files)}
                          />
                        </div>
                      )}
                    </div>

                    {/* Limit reached informative notice */}
                    {!id && displayPhotos.length >= 10 && (
                      <div className="p-3 bg-amber-50/90 rounded-2xl border border-amber-200 text-amber-900 text-xs font-semibold flex items-center justify-between gap-3 animate-in fade-in duration-200">
                        <div className="flex items-center gap-2">
                          <AlertCircle size={15} className="text-amber-600 shrink-0" />
                          <span>You can upload a maximum of 10 pictures per account. Delete an existing photo to add a new one.</span>
                        </div>
                      </div>
                    )}

                    {/* Responsive Picture Gallery Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                      {displayPhotos && displayPhotos.length > 0 ? (
                        displayPhotos.map((url, index) => {
                          const photoStatus = getPhotoStatus(url);
                          const isPrimary = index === 0;
                          return (
                            <div
                              key={index}
                              onClick={() => handleOpenFullScreenImage(index)}
                              className={`relative aspect-[3/4] rounded-2xl overflow-hidden border bg-slate-100 group cursor-pointer hover:shadow-md transition-all duration-200 ${
                                isPrimary ? 'border-amber-400 ring-2 ring-amber-400/30' : 'border-gray-200 hover:border-[#5D34F7]/50'
                              }`}
                              title={isPrimary ? 'Primary Profile Picture (Click to view full screen)' : 'Click to view photo in full screen'}
                            >
                              <img
                                src={getPhotoUrl(url, p.gender)}
                                alt={`Gallery ${index}`}
                                onError={(e) => handleImageError(e, p.gender)}
                                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                              />

                              {/* Primary Badge */}
                              {isPrimary ? (
                                <div className="absolute top-2 left-2 z-20 flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500 text-white text-[9px] font-black uppercase tracking-wider shadow-sm pointer-events-none">
                                  <Star size={10} className="fill-white" /> Primary
                                </div>
                              ) : !id ? (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleSetPrimaryPhoto(index);
                                  }}
                                  className="absolute top-2 left-2 z-20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 px-2 py-1 rounded-lg bg-black/75 hover:bg-[#5D34F7] text-white text-[10px] font-bold shadow-md cursor-pointer"
                                  title="Set as primary profile picture"
                                >
                                  <Star size={10} /> Make Primary
                                </button>
                              ) : null}

                              {/* Delete button - only for account owner */}
                              {!id && (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeletePhoto(index);
                                  }}
                                  className="absolute top-2 right-2 z-20 opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg bg-red-600/90 hover:bg-red-700 text-white shadow-md cursor-pointer"
                                  title="Delete photo"
                                >
                                  <Trash2 size={12} />
                                </button>
                              )}

                              {/* Status Badges */}
                              {isPhotoVerified(profile) && photoStatus !== 'rejected' && (
                                <div className="absolute top-2 right-2 bg-emerald-600/90 backdrop-blur-md text-white text-[9px] font-black px-1.5 py-0.5 rounded-full shadow-md z-10 flex items-center gap-0.5 pointer-events-none border border-white/20 select-none">
                                  <Check size={10} className="stroke-[3]" />
                                  <span>Verified</span>
                                </div>
                              )}
                              {photoStatus === 'rejected' && (
                                <div className="absolute bottom-0 inset-x-0 bg-red-600/95 text-white text-[8px] font-black py-0.5 text-center leading-none uppercase pointer-events-none z-10">
                                  Rejected
                                </div>
                              )}
                              {photoStatus === 'pending' && (
                                <div className="absolute bottom-0 inset-x-0 bg-amber-500/95 text-white text-[8px] font-black py-0.5 text-center leading-none uppercase pointer-events-none z-10">
                                  Pending Verification
                                </div>
                              )}

                              {/* Hover click to view full size prompt */}
                              <div className="absolute bottom-1.5 right-1.5 z-10 opacity-0 group-hover:opacity-100 transition-opacity px-1.5 py-0.5 rounded bg-black/60 text-white text-[8px] font-semibold pointer-events-none">
                                View
                              </div>
                            </div>
                          );
                        })
                      ) : null}

                      {/* "+ Add Picture" slot card if capacity is not full */}
                      {!id && displayPhotos.length < 10 && (
                        <div
                          onClick={() => {
                            if (displayPhotos.length >= 10) {
                              setError('You can upload a maximum of 10 pictures per account.');
                              return;
                            }
                            document.getElementById('gallery-direct-upload').click();
                          }}
                          className="relative aspect-[3/4] rounded-2xl border-2 border-dashed border-slate-200 hover:border-[#5D34F7] bg-slate-50 hover:bg-[#5D34F7]/5 flex flex-col items-center justify-center p-3 text-center transition-all cursor-pointer group"
                          title={`Click to upload photo (${10 - displayPhotos.length} slots remaining)`}
                        >
                          <div className="w-9 h-9 rounded-xl bg-[#5D34F7]/10 text-[#5D34F7] flex items-center justify-center mb-1 group-hover:scale-110 transition-transform">
                            <Plus size={18} />
                          </div>
                          <span className="text-[11px] font-bold text-slate-700 group-hover:text-[#5D34F7] transition-colors leading-tight">
                            Add Picture
                          </span>
                          <span className="text-[9px] text-slate-400 font-semibold mt-0.5">
                            {10 - displayPhotos.length} remaining
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* ABOUT ME / DESCRIPTION WITH VERIFICATION */}
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 space-y-4 relative group">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100/80 pb-3.5">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-[#5D34F7]/10 flex items-center justify-center text-[#5D34F7]">
                        <Heart size={18} className="text-[#5D34F7]" />
                      </div>
                      <div>
                        <h3 className="text-sm font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                          <span>About Me</span>
                          <span className="text-[11px] font-bold text-slate-400">/ Description</span>
                        </h3>
                      </div>
                    </div>

                    {/* Verification Status Pill */}
                    <div className="flex items-center gap-2 flex-wrap">
                      {profile?.aboutMeVerificationStatus === 'approved' && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-emerald-50 text-emerald-800 border border-emerald-300 shadow-2xs">
                          <CheckCircle2 size={13} className="text-emerald-600" />
                          <span>Verified Description</span>
                        </span>
                      )}
                      {profile?.aboutMeVerificationStatus === 'pending' && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-amber-50 text-amber-800 border border-amber-300 shadow-2xs animate-pulse">
                          <Clock size={13} className="text-amber-600" />
                          <span>Pending Verification</span>
                        </span>
                      )}
                      {profile?.aboutMeVerificationStatus === 'rejected' && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-rose-50 text-rose-800 border border-rose-300 shadow-2xs">
                          <XCircle size={13} className="text-rose-600" />
                          <span>Verification Failed</span>
                        </span>
                      )}
                      {(!profile?.aboutMeVerificationStatus || profile?.aboutMeVerificationStatus === 'none') && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-100 text-slate-650 border border-slate-200 shadow-2xs">
                          <ShieldAlert size={12} className="text-slate-500" />
                          <span>Not Verified</span>
                        </span>
                      )}

                      {!id && (
                        <button
                          type="button"
                          onClick={() => {
                            setVerifyBioText(p.bio || '');
                            setVerifyBioError('');
                            setShowDescriptionVerifyModal(true);
                          }}
                          className="px-3 py-1 rounded-xl bg-[#5D34F7]/10 hover:bg-[#5D34F7] text-[#5D34F7] hover:text-white text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                          title="Verify or edit description"
                        >
                          <Edit2 size={12} />
                          <span>{p.bio ? 'Verify / Edit' : 'Add Description'}</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Description Text Content with Proper Formatting */}
                  <div className="bg-slate-50/60 p-4 rounded-2xl border border-slate-100">
                    {p.bio ? (
                      <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-line font-medium">
                        {p.bio}
                      </p>
                    ) : (
                      <div className="py-2 text-center text-slate-400">
                        <p className="text-xs font-semibold">No description provided yet.</p>
                        {!id && (
                          <p className="text-[11px] text-slate-400 mt-1">
                            Click "Add Description" above to write about your background, values, and expectations.
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Contextual Verification Feedback Box (only for own profile) */}
                  {!id && (
                    <div className="pt-1">
                      {profile?.aboutMeVerificationStatus === 'approved' && (
                        <div className="p-3 bg-emerald-50/60 border border-emerald-200/80 rounded-2xl flex items-center gap-2.5 text-xs text-emerald-900 font-semibold">
                          <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                          <span>Your profile description has been verified by our moderation team and is displayed with the verified badge to prospective matches.</span>
                        </div>
                      )}
                      {profile?.aboutMeVerificationStatus === 'pending' && (
                        <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-2xl flex items-center justify-between gap-3 text-xs text-amber-900 font-semibold">
                          <div className="flex items-center gap-2.5">
                            <Clock size={16} className="text-amber-600 shrink-0 animate-spin" />
                            <span>Your description is currently under review by our screening team. Review typically takes 12-24 hours.</span>
                          </div>
                          <span className="text-[10px] font-black uppercase text-amber-700 px-2 py-0.5 bg-amber-100 rounded-md shrink-0">In Review</span>
                        </div>
                      )}
                      {profile?.aboutMeVerificationStatus === 'rejected' && (
                        <div className="p-3.5 bg-rose-50/80 border border-rose-200 rounded-2xl space-y-2 text-xs text-rose-900">
                          <div className="flex items-center gap-2.5 font-bold">
                            <XCircle size={16} className="text-rose-600 shrink-0" />
                            <span>Description Verification Failed: Action Required</span>
                          </div>
                          <p className="text-[11px] text-rose-800 font-medium leading-relaxed pl-6">
                            Your submitted description did not meet community safety guidelines (e.g. personal phone numbers, emails, or policy violations). Please update and re-submit your description.
                          </p>
                          <div className="pl-6 pt-1">
                            <button
                              type="button"
                              onClick={() => {
                                setVerifyBioText(p.bio || '');
                                setVerifyBioError('');
                                setShowDescriptionVerifyModal(true);
                              }}
                              className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-black shadow-2xs transition cursor-pointer"
                            >
                              Update & Re-verify Description
                            </button>
                          </div>
                        </div>
                      )}
                      {(!profile?.aboutMeVerificationStatus || profile?.aboutMeVerificationStatus === 'none') && p.bio && (
                        <div className="p-3 bg-indigo-50/50 border border-indigo-150 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs text-indigo-950 font-semibold">
                          <div className="flex items-center gap-2">
                            <ShieldCheck size={16} className="text-[#5D34F7] shrink-0" />
                            <span>Get the Verified Description badge by submitting your text for safety review.</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setVerifyBioText(p.bio || '');
                              setVerifyBioError('');
                              setShowDescriptionVerifyModal(true);
                            }}
                            className="px-3.5 py-1.5 bg-[#5D34F7] hover:bg-[#4024DB] text-white rounded-xl text-xs font-black shadow-xs transition cursor-pointer shrink-0"
                          >
                            Submit for Verification
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* QUICK CONTACT INFO CARD ON LEFT COLUMN */}
                {id && (
                  <div className="bg-white rounded-3xl p-6 shadow-sm border border-emerald-150/80 space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3.5">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                          <Phone size={16} />
                        </div>
                        <div>
                          <h4 className="text-sm font-black text-slate-900 tracking-tight">Contact Info</h4>
                          <p className="text-[10px] text-slate-400 font-semibold">Mobile number & email</p>
                        </div>
                      </div>
                      <span className={`text-[10px] font-black px-2.5 py-1 rounded-full border ${
                        (unlockedContacts[id] || profile?.hasContacted || profile?.contacted)
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-amber-50 text-amber-700 border-amber-200'
                      }`}>
                        {(unlockedContacts[id] || profile?.hasContacted || profile?.contacted) ? 'Unlocked' : 'Protected'}
                      </span>
                    </div>

                    <ContactInfoCard
                      targetUser={profile}
                      isPremium={viewerUser?.premiumMembership?.isPremium || false}
                      unlockedMap={unlockedContacts}
                      onUnlockSuccess={(targetId, unlockedData) => {
                        setUnlockedContacts((prev) => ({ ...prev, [targetId]: unlockedData }));
                        if (unlockedData.phone) setPhone(unlockedData.phone);
                        if (unlockedData.email) setEmail(unlockedData.email);
                      }}
                      onCall={(callPhone, callName, callPhoto) => {
                        setCallModalData({
                          isOpen: true,
                          phone: callPhone,
                          name: callName,
                          photo: callPhoto
                        });
                      }}
                    />
                  </div>
                )}

                {/* TERMS & CONDITIONS / PLATFORM GUIDELINES CARD */}
                {!id && (
                  <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 space-y-4">
                    <h3 className="text-sm font-extrabold text-slate-800 border-b border-slate-100 pb-3 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Scale size={18} className="text-[#5D34F7]" />
                        <span>Platform Guidelines</span>
                      </div>
                    </h3>
                    <div className="space-y-2.5">
                      <button
                        onClick={() => navigate('/legal/terms-conditions')}
                        className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-slate-50/80 hover:bg-[#5D34F7]/10 text-slate-700 hover:text-[#5D34F7] border border-slate-100 transition cursor-pointer group"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-white border border-slate-200/60 flex items-center justify-center text-[#5D34F7] group-hover:scale-105 transition shadow-2xs">
                            <FileText size={16} />
                          </div>
                          <div className="text-left">
                            <span className="block text-xs font-black text-slate-800 group-hover:text-[#5D34F7] transition">
                              Terms and Conditions
                            </span>
                            <span className="block text-[10px] text-slate-400 font-semibold">
                              Platform rules, code of conduct & agreement
                            </span>
                          </div>
                        </div>
                        <ChevronRight size={16} className="text-slate-400 group-hover:text-[#5D34F7] group-hover:translate-x-0.5 transition" />
                      </button>

                      <button
                        onClick={() => navigate('/legal/privacy-policy')}
                        className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-slate-50/80 hover:bg-[#5D34F7]/10 text-slate-700 hover:text-[#5D34F7] border border-slate-100 transition cursor-pointer group"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-white border border-slate-200/60 flex items-center justify-center text-emerald-600 group-hover:scale-105 transition shadow-2xs">
                            <ShieldCheck size={16} />
                          </div>
                          <div className="text-left">
                            <span className="block text-xs font-black text-slate-800 group-hover:text-[#5D34F7] transition">
                              Privacy Policy
                            </span>
                            <span className="block text-[10px] text-slate-400 font-semibold">
                              Confidentiality & photo safety
                            </span>
                          </div>
                        </div>
                        <ChevronRight size={16} className="text-slate-400 group-hover:text-[#5D34F7] group-hover:translate-x-0.5 transition" />
                      </button>

                      <button
                        onClick={() => navigate('/legal/safety-center')}
                        className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-amber-50/60 hover:bg-[#5D34F7]/10 text-slate-700 hover:text-[#5D34F7] border border-amber-200/70 hover:border-slate-100 transition cursor-pointer group"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-white border border-amber-200/80 flex items-center justify-center text-amber-600 group-hover:scale-105 transition shadow-2xs">
                            <ShieldCheck size={16} />
                          </div>
                          <div className="text-left">
                            <span className="block text-xs font-black text-slate-800 group-hover:text-[#5D34F7] transition">
                              Safety Center
                            </span>
                            <span className="block text-[10px] text-slate-400 font-semibold">
                              Safe matchmaking, fraud tips & report user
                            </span>
                          </div>
                        </div>
                        <ChevronRight size={16} className="text-slate-400 group-hover:text-[#5D34F7] group-hover:translate-x-0.5 transition" />
                      </button>

                      <button
                        onClick={() => navigate('/settings')}
                        className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-purple-50/60 hover:bg-[#5D34F7]/10 text-slate-700 hover:text-[#5D34F7] border border-purple-200/70 hover:border-slate-100 transition cursor-pointer group"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-white border border-purple-200/80 flex items-center justify-center text-[#5D34F7] group-hover:scale-105 transition shadow-2xs">
                            <Lock size={16} />
                          </div>
                          <div className="text-left">
                            <span className="block text-xs font-black text-slate-800 group-hover:text-[#5D34F7] transition">
                              Privacy & Security Settings
                            </span>
                            <span className="block text-[10px] text-slate-400 font-semibold">
                              Photo, contact & call visibility preferences
                            </span>
                          </div>
                        </div>
                        <ChevronRight size={16} className="text-slate-400 group-hover:text-[#5D34F7] group-hover:translate-x-0.5 transition" />
                      </button>
                    </div>
                  </div>
                )}
              </aside>

              {/* Right Column: Profile details */}
              <main className="lg:col-span-7 space-y-6 w-full">

                {/* PERSONAL DETAILS */}
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 space-y-4">
                  <h3 className="text-sm font-extrabold text-slate-800 border-b border-slate-100 pb-3.5 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="12" cy="8" r="4" fill="url(#pers_grad)" />
                        <path d="M4 20C4 16 8 14 12 14C16 14 20 16 20 20" stroke="url(#pers_grad)" strokeWidth="3" strokeLinecap="round" />
                        <defs>
                          <linearGradient id="pers_grad" x1="4" y1="4" x2="20" y2="20" gradientUnits="userSpaceOnUse">
                            <stop stopColor="#FF477E" />
                            <stop offset="1" stopColor="#FF85A2" />
                          </linearGradient>
                        </defs>
                      </svg>
                      <span>Personal Details</span>
                    </div>
                    {!id && (
                      <button onClick={() => { setIsEditing(true); setActiveEditCategory('basic'); }} className="text-slate-400 hover:text-[#5D34F7] hover:bg-[#5D34F7]/10 p-1.5 rounded-lg transition-colors cursor-pointer" title="Edit Personal Details">
                        <Edit2 size={16} />
                      </button>
                    )}
                  </h3>
                  <div className="space-y-3">
                    {famId && (
                      <ProfileItem 
                        icon={<ShieldCheck size={16} />} 
                        label="FAM ID" 
                        value={famId} 
                        isCopyable
                        onCopy={(e) => handleCopyFamId(famId, e)}
                        isCopied={copiedFamId === famId}
                        copyTitle="Copy FAM ID"
                      />
                    )}
                    {formatProfileCreatedBy(p.profileFor || profile?.profileFor || profileFor) && (
                      <ProfileItem 
                        icon={<Users size={16} />} 
                        label="Profile Created By" 
                        value={formatProfileCreatedBy(p.profileFor || profile?.profileFor || profileFor)} 
                      />
                    )}
                    <ProfileItem icon={<User size={16} />} label="Full Name" value={p.name} />
                    <ProfileItem icon={<Calendar size={16} />} label="Date of Birth" value={p.dob ? `${new Date(p.dob).toLocaleDateString()} (${p.age || 0} years)` : ''} />
                    <ProfileItem icon={<User size={16} />} label="Gender" value={p.gender} />
                    <ProfileItem 
                      icon={<Languages size={16} />} 
                      label="Spoken Languages" 
                      value={formatLanguages(p.languages || p.motherTongue)} 
                    />
                  </div>
                </div>

                {/* PHYSICAL & LIFESTYLE */}
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 space-y-4">
                  <h3 className="text-sm font-extrabold text-slate-800 border-b border-slate-100 pb-3.5 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Heart size={18} className="text-[#4CC9F0]" />
                      <span>Physical & Lifestyle</span>
                    </div>
                    {!id && (
                      <button onClick={() => { setIsEditing(true); setActiveEditCategory('lifestyle'); }} className="text-slate-400 hover:text-[#5D34F7] hover:bg-[#5D34F7]/10 p-1.5 rounded-lg transition-colors cursor-pointer" title="Edit Physical & Lifestyle">
                        <Edit2 size={16} />
                      </button>
                    )}
                  </h3>
                  <div className="space-y-3">
                    <ProfileItem icon={<Heart size={16} />} label="Marital Status" value={p.maritalStatus} />
                    {(p.maritalStatus && p.maritalStatus !== 'Never Married' || p.hasChildren === 'Yes') && (
                      <ProfileItem icon={<Users size={16} />} label="Children / Kids" value={formatChildrenDisplay(p)} />
                    )}
                    <ProfileItem icon={<User size={16} />} label="Height" value={p.height} />
                    <ProfileItem icon={<User size={16} />} label="Diet" value={p.diet} />
                  </div>
                </div>

                {/* RELIGION & COMMUNITY */}
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 space-y-4">
                  <h3 className="text-sm font-extrabold text-slate-800 border-b border-slate-100 pb-3.5 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 2L3 9V20C3 21 4 22 5 22H19C20 22 21 21 21 20V9L12 2Z" stroke="url(#rel_grad)" strokeWidth="2.5" strokeLinejoin="round" />
                        <path d="M12 7V17M9 10H15" stroke="url(#rel_grad)" strokeWidth="2.5" strokeLinecap="round" />
                        <defs>
                          <linearGradient id="rel_grad" x1="3" y1="2" x2="21" y2="22" gradientUnits="userSpaceOnUse">
                            <stop stopColor="#F9C74F" />
                            <stop offset="1" stopColor="#F3722C" />
                          </linearGradient>
                        </defs>
                      </svg>
                      <span>Religion & Community</span>
                    </div>
                    {!id && (
                      <button onClick={() => { setIsEditing(true); setActiveEditCategory('religion'); }} className="text-slate-400 hover:text-[#5D34F7] hover:bg-[#5D34F7]/10 p-1.5 rounded-lg transition-colors cursor-pointer" title="Edit Religion & Community">
                        <Edit2 size={16} />
                      </button>
                    )}
                  </h3>
                  <div className="space-y-3">
                    <ProfileItem icon={<Landmark size={16} />} label="Religion" value={p.religion} />
                    <ProfileItem icon={<User size={16} />} label="Caste" value={p.caste} />
                    <ProfileItem icon={<User size={16} />} label="Sub-Community" value={p.subCommunity} />
                  </div>
                </div>

                {/* LOCATION DETAILS */}
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 space-y-4">
                  <h3 className="text-sm font-extrabold text-slate-800 border-b border-slate-100 pb-3.5 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 2C8 2 5 5 5 9C5 14 12 22 12 22C12 22 19 14 19 9C19 5 16 2 12 2Z" fill="url(#loc_grad)" />
                        <circle cx="12" cy="9" r="3" fill="white" />
                        <defs>
                          <linearGradient id="loc_grad" x1="5" y1="2" x2="19" y2="22" gradientUnits="userSpaceOnUse">
                            <stop stopColor="#4895EF" />
                            <stop offset="1" stopColor="#4CC9F0" />
                          </linearGradient>
                        </defs>
                      </svg>
                      <span>Location</span>
                    </div>
                    {!id && (
                      <button onClick={() => { setIsEditing(true); setActiveEditCategory('location'); }} className="text-slate-400 hover:text-[#5D34F7] hover:bg-[#5D34F7]/10 p-1.5 rounded-lg transition-colors cursor-pointer" title="Edit Location">
                        <Edit2 size={16} />
                      </button>
                    )}
                  </h3>
                  <div className="space-y-3">
                    <ProfileItem icon={<MapPin size={16} />} label="City" value={p.city} />
                    <ProfileItem icon={<MapPin size={16} />} label="State" value={p.state} />
                    <ProfileItem icon={<MapPin size={16} />} label="Country" value={p.country || 'India'} />
                    {p.astrology?.timeOfBirth && (
                      <ProfileItem icon={<Clock size={16} />} label="Time of Birth" value={p.astrology.timeOfBirth} />
                    )}
                  </div>
                </div>

                {/* EDUCATION & CAREER */}
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 space-y-4">
                  <h3 className="text-sm font-extrabold text-slate-800 border-b border-slate-100 pb-3.5 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 3L2 8L12 13L22 8L12 3Z" fill="url(#edu_grad)" />
                        <path d="M5 11.5V17C5 18.5 8 20 12 20C16 20 19 18.5 19 17V11.5" stroke="url(#edu_grad)" strokeWidth="2.5" strokeLinecap="round" />
                        <defs>
                          <linearGradient id="edu_grad" x1="2" y1="3" x2="22" y2="20" gradientUnits="userSpaceOnUse">
                            <stop stopColor="#4361EE" />
                            <stop offset="1" stopColor="#7209B7" />
                          </linearGradient>
                        </defs>
                      </svg>
                      <span>Education & Career</span>
                    </div>
                    {!id && (
                      <button onClick={() => { setIsEditing(true); setActiveEditCategory('education'); }} className="text-slate-400 hover:text-[#5D34F7] hover:bg-[#5D34F7]/10 p-1.5 rounded-lg transition-colors cursor-pointer" title="Edit Education & Career">
                        <Edit2 size={16} />
                      </button>
                    )}
                  </h3>
                  <div className="space-y-3">
                    <ProfileItem icon={<GraduationCap size={16} />} label="Highest Qualification" value={p.education} />
                    <ProfileItem 
                      icon={<GraduationCap size={16} />} 
                      label="College/University" 
                      value={p.college}
                      onRemove={!id && p.college ? () => setShowRemoveCollegeModal(true) : undefined}
                      removeTitle="Remove College from Profile"
                    />
                    <ProfileItem icon={<Briefcase size={16} />} label="Work Sector" value={p.workSector} />
                    <ProfileItem icon={<Briefcase size={16} />} label="Profession" value={p.workRole} />
                    <ProfileItem icon={<Briefcase size={16} />} label="Company" value={p.companyName} />
                    <ProfileItem icon={<Briefcase size={16} />} label="Income" value={p.income} />
                  </div>
                </div>

                {/* HOBBIES & INTERESTS */}
                <div id="hobbies-interests-card" className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 space-y-4">
                  <div className="border-b border-slate-100 pb-3.5 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 22C17.5 22 22 17.5 22 12C22 6.5 17.5 2 12 2C6.5 2 2 6.5 2 12C2 17.5 6.5 22 12 22Z" stroke="url(#hob_grad)" strokeWidth="2.5" />
                        <circle cx="7.5" cy="10.5" r="2" fill="#FF477E" />
                        <circle cx="12" cy="7.5" r="2" fill="#F9C74F" />
                        <circle cx="16.5" cy="10.5" r="2" fill="#4CC9F0" />
                        <circle cx="12" cy="15" r="3.5" fill="url(#hob_grad)" />
                        <defs>
                          <linearGradient id="hob_grad" x1="2" y1="2" x2="22" y2="22" gradientUnits="userSpaceOnUse">
                            <stop stopColor="#5D34F7" />
                            <stop offset="1" stopColor="#4024DB" />
                          </linearGradient>
                        </defs>
                      </svg>
                      <h3 className="text-sm font-extrabold text-slate-800">Hobbies & Interests</h3>
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                        {(p.hobbies || []).length} selected
                      </span>
                    </div>

                    {!id && !isEditingHobbies && (
                      <button
                        type="button"
                        onClick={() => {
                          setIsEditingHobbies(true);
                          setDraftHobbies(Array.isArray(p.hobbies) ? [...p.hobbies] : (Array.isArray(hobbies) ? [...hobbies] : []));
                          setHobbiesError('');
                        }}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-[#5D34F7]/10 hover:bg-[#5D34F7] text-[#5D34F7] hover:text-white rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer shadow-2xs active:scale-95"
                        title="Edit Hobbies and Interests"
                      >
                        <Edit2 size={13} />
                        <span>Edit</span>
                      </button>
                    )}
                  </div>

                  {/* Success notification */}
                  {hobbiesSuccess && (
                    <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2 animate-in fade-in duration-200">
                      <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                      <span>Hobbies and interests updated successfully!</span>
                    </div>
                  )}

                  {/* Error notification */}
                  {hobbiesError && (
                    <div className="p-3 bg-red-50 rounded-2xl border border-red-200 text-red-600 text-xs font-bold flex items-center gap-2 animate-in fade-in duration-200">
                      <AlertCircle size={16} className="text-red-500 shrink-0" />
                      <span>{hobbiesError}</span>
                    </div>
                  )}

                  {/* Inline Editing Mode */}
                  {!id && isEditingHobbies ? (
                    <div className="space-y-4 animate-in fade-in duration-200">
                      <p className="text-xs text-slate-500">
                        Select your favorite hobbies and interests below, or add custom ones.
                      </p>

                      {/* Curated Category Groups */}
                      <div className="space-y-3.5">
                        {HOBBIES_CATEGORIES.map(group => (
                          <div key={group.title} className="space-y-1.5">
                            <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">{group.title}</h4>
                            <div className="flex flex-wrap gap-1.5">
                              {group.items.map(item => {
                                const sel = draftHobbies.includes(item);
                                return (
                                  <button
                                    key={item}
                                    type="button"
                                    onClick={() => {
                                      if (sel) {
                                        setDraftHobbies(draftHobbies.filter(h => h !== item));
                                      } else {
                                        setDraftHobbies([...draftHobbies, item]);
                                      }
                                    }}
                                    className={`px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                                      sel
                                        ? 'bg-[#5D34F7] text-white border-[#5D34F7] shadow-xs'
                                        : 'bg-slate-50 text-slate-700 border-slate-200/80 hover:border-[#5D34F7]/40 hover:bg-white'
                                    }`}
                                  >
                                    {sel ? '✓ ' : ''}{item}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Custom Hobby Input */}
                      <div className="pt-2">
                        <label className="text-[11px] font-bold text-slate-600 block mb-1">Add Other Hobby or Interest</label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={customHobbyInput}
                            onChange={(e) => setCustomHobbyInput(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                const val = customHobbyInput.trim();
                                if (val && !draftHobbies.some(h => h.toLowerCase() === val.toLowerCase())) {
                                  setDraftHobbies([...draftHobbies, val]);
                                  setCustomHobbyInput('');
                                }
                              }
                            }}
                            placeholder="Type a hobby and press Add (e.g. Calligraphy, Astronomy)..."
                            className="flex-1 px-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-[#5D34F7] bg-white transition"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const val = customHobbyInput.trim();
                              if (val && !draftHobbies.some(h => h.toLowerCase() === val.toLowerCase())) {
                                setDraftHobbies([...draftHobbies, val]);
                                setCustomHobbyInput('');
                              }
                            }}
                            className="px-3.5 py-1.5 bg-[#5D34F7] text-white rounded-xl text-xs font-bold hover:bg-[#4024DB] transition cursor-pointer"
                          >
                            + Add
                          </button>
                        </div>
                      </div>

                      {/* Currently Selected Badges with Remove Button */}
                      {draftHobbies.length > 0 && (
                        <div className="p-3 bg-purple-50/50 rounded-2xl border border-purple-100/70 space-y-2">
                          <div className="flex items-center justify-between text-xs font-bold text-purple-900">
                            <span>Currently Selected ({draftHobbies.length})</span>
                            <button
                              type="button"
                              onClick={() => setDraftHobbies([])}
                              className="text-[10px] text-rose-600 hover:underline cursor-pointer"
                            >
                              Clear all
                            </button>
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            {draftHobbies.map(h => (
                              <span key={h} className="inline-flex items-center gap-1 px-2.5 py-1 bg-white text-[#5D34F7] border border-purple-200 text-xs font-bold rounded-lg shadow-2xs">
                                {h}
                                <button
                                  type="button"
                                  onClick={() => setDraftHobbies(draftHobbies.filter(x => x !== h))}
                                  className="text-slate-400 hover:text-rose-600 ml-0.5 cursor-pointer font-black text-[11px]"
                                  title="Remove"
                                >
                                  ✕
                                </button>
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Action Buttons: Save & Cancel */}
                      <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                        <button
                          type="button"
                          onClick={() => {
                            setIsEditingHobbies(false);
                            setDraftHobbies(p.hobbies || []);
                            setHobbiesError('');
                          }}
                          disabled={isSaving}
                          className="px-4 py-2 rounded-xl border border-slate-200 bg-white text-slate-700 text-xs font-bold hover:bg-slate-50 transition cursor-pointer disabled:opacity-50"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={() => saveHobbiesDirectly(draftHobbies)}
                          disabled={isSaving}
                          className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-gradient-to-r from-[#5D34F7] to-[#4024DB] text-white text-xs font-bold hover:opacity-95 shadow-sm transition cursor-pointer disabled:opacity-50 active:scale-95"
                        >
                          <Check size={14} />
                          {isSaving ? 'Saving...' : 'Save Hobbies'}
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* Display Mode */
                    <div className="flex flex-wrap gap-2">
                      {p.hobbies && p.hobbies.length > 0 ? (
                        p.hobbies.map(hobby => (
                          <span key={hobby} className="px-3 py-1.5 bg-[#5D34F7]/5 text-[#5D34F7] text-xs font-bold rounded-full border border-[#5D34F7]/10 hover:border-[#5D34F7]/30 transition">
                            {hobby}
                          </span>
                        ))
                      ) : (
                        <div className="py-2 flex items-center justify-between w-full">
                          <p className="text-sm text-gray-400 italic">No hobbies added yet.</p>
                          {!id && (
                            <button
                              type="button"
                              onClick={() => {
                                setIsEditingHobbies(true);
                                setDraftHobbies([]);
                                setHobbiesError('');
                              }}
                              className="text-xs font-bold text-[#5D34F7] hover:underline cursor-pointer"
                            >
                              + Add Hobbies & Interests
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* SPOKEN LANGUAGES */}
                <div id="spoken-languages-card" className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 space-y-4">
                  <div className="border-b border-slate-100 pb-3.5 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-xl bg-sky-50 flex items-center justify-center text-sky-600 shadow-2xs">
                        <Languages size={16} />
                      </div>
                      <h3 className="text-sm font-extrabold text-slate-800">Spoken Languages</h3>
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-sky-50 text-sky-700 border border-sky-100">
                        {getLanguagesList(p.languages || languages || p.motherTongue).length} selected
                      </span>
                    </div>

                    {!id && !isEditingLanguages && (
                      <button
                        type="button"
                        onClick={() => {
                          setIsEditingLanguages(true);
                          setDraftLanguages(getLanguagesList(p.languages || languages || p.motherTongue));
                          setLanguagesError('');
                        }}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-sky-50 hover:bg-sky-600 text-sky-700 hover:text-white rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer shadow-2xs active:scale-95"
                        title="Edit Spoken Languages"
                      >
                        <Edit2 size={13} />
                        <span>Edit</span>
                      </button>
                    )}
                  </div>

                  {/* Success notification */}
                  {languagesSuccess && (
                    <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2 animate-in fade-in duration-200">
                      <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                      <span>Spoken languages updated successfully!</span>
                    </div>
                  )}

                  {/* Error notification */}
                  {languagesError && (
                    <div className="p-3 bg-red-50 rounded-2xl border border-red-200 text-red-600 text-xs font-bold flex items-center gap-2 animate-in fade-in duration-200">
                      <AlertCircle size={16} className="text-red-500 shrink-0" />
                      <span>{languagesError}</span>
                    </div>
                  )}

                  {/* Inline Editing Mode */}
                  {!id && isEditingLanguages ? (
                    <div className="space-y-4 animate-in fade-in duration-200">
                      <p className="text-xs text-slate-500">
                        Select the languages you can speak fluently or converse in.
                      </p>

                      {/* Search Input */}
                      <div className="relative">
                        <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                          type="text"
                          placeholder="Search popular languages..."
                          value={languageSearch}
                          onChange={(e) => setLanguageSearch(e.target.value)}
                          className="w-full pl-9 pr-8 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5D34F7]/40 focus:border-[#5D34F7] bg-white transition"
                        />
                        {languageSearch && (
                          <button
                            type="button"
                            onClick={() => setLanguageSearch('')}
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs cursor-pointer"
                          >
                            ✕
                          </button>
                        )}
                      </div>

                      {/* Popular & Filtered Language Chips */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">
                            {languageSearch ? 'Matching Languages' : 'Popular Languages'}
                          </span>
                          <span className="text-[10px] text-slate-400">Click to select/unselect</span>
                        </div>
                        <div className="flex flex-wrap gap-1.5 max-h-48 overflow-y-auto pr-1">
                          {ALL_SPOKEN_LANGUAGES
                            .filter(l => !languageSearch || l.toLowerCase().includes(languageSearch.toLowerCase()))
                            .map(lang => {
                              const sel = draftLanguages.includes(lang);
                              return (
                                <button
                                  key={lang}
                                  type="button"
                                  onClick={() => {
                                    if (sel) {
                                      setDraftLanguages(draftLanguages.filter(x => x !== lang));
                                    } else {
                                      setDraftLanguages([...draftLanguages, lang]);
                                    }
                                  }}
                                  className={`px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                                    sel
                                      ? 'bg-sky-600 text-white border-sky-600 shadow-xs'
                                      : 'bg-slate-50 text-slate-700 border-slate-200/80 hover:border-sky-400 hover:bg-white'
                                  }`}
                                >
                                  {sel ? '✓ ' : '+ '}{lang}
                                </button>
                              );
                            })}
                        </div>
                      </div>

                      {/* Custom Language Addition */}
                      <div className="pt-2 border-t border-slate-100">
                        <label className="text-[11px] font-bold text-slate-600 block mb-1">Add Another Language</label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={customLanguageInput}
                            onChange={(e) => setCustomLanguageInput(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                const val = customLanguageInput.trim();
                                if (val && !draftLanguages.some(l => l.toLowerCase() === val.toLowerCase())) {
                                  setDraftLanguages([...draftLanguages, val]);
                                  setCustomLanguageInput('');
                                }
                              }
                            }}
                            placeholder="Type a language and press Add (e.g. Japanese, French)..."
                            className="flex-1 px-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-sky-500 bg-white transition"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const val = customLanguageInput.trim();
                              if (val && !draftLanguages.some(l => l.toLowerCase() === val.toLowerCase())) {
                                setDraftLanguages([...draftLanguages, val]);
                                setCustomLanguageInput('');
                              }
                            }}
                            className="px-3.5 py-1.5 bg-sky-600 text-white rounded-xl text-xs font-bold hover:bg-sky-700 transition cursor-pointer"
                          >
                            + Add
                          </button>
                        </div>
                      </div>

                      {/* Currently Selected Badges with Remove Button */}
                      {draftLanguages.length > 0 && (
                        <div className="p-3 bg-sky-50/60 rounded-2xl border border-sky-100 space-y-2">
                          <div className="flex items-center justify-between text-xs font-bold text-sky-900">
                            <span>Currently Selected ({draftLanguages.length})</span>
                            <button
                              type="button"
                              onClick={() => setDraftLanguages([])}
                              className="text-[10px] text-rose-600 hover:underline cursor-pointer"
                            >
                              Clear all
                            </button>
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            {draftLanguages.map(l => (
                              <span key={l} className="inline-flex items-center gap-1 px-2.5 py-1 bg-white text-sky-700 border border-sky-200 text-xs font-bold rounded-lg shadow-2xs">
                                {l}
                                <button
                                  type="button"
                                  onClick={() => setDraftLanguages(draftLanguages.filter(x => x !== l))}
                                  className="text-slate-400 hover:text-rose-600 ml-0.5 cursor-pointer font-black text-[11px]"
                                  title="Remove"
                                >
                                  ✕
                                </button>
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Action Buttons: Save & Cancel */}
                      <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                        <button
                          type="button"
                          onClick={() => {
                            setIsEditingLanguages(false);
                            setDraftLanguages(getLanguagesList(p.languages || languages || p.motherTongue));
                            setLanguagesError('');
                          }}
                          disabled={isSaving}
                          className="px-4 py-2 rounded-xl border border-slate-200 bg-white text-slate-700 text-xs font-bold hover:bg-slate-50 transition cursor-pointer disabled:opacity-50"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={() => saveLanguagesDirectly(draftLanguages)}
                          disabled={isSaving}
                          className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-gradient-to-r from-sky-600 to-sky-700 text-white text-xs font-bold hover:opacity-95 shadow-sm transition cursor-pointer disabled:opacity-50 active:scale-95"
                        >
                          <Check size={14} />
                          {isSaving ? 'Saving...' : 'Save Languages'}
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* Display Mode */
                    <div className="space-y-3">
                      {getLanguagesList(p.languages || languages || p.motherTongue).length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {getLanguagesList(p.languages || languages || p.motherTongue).map(lang => (
                            <span
                              key={lang}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-sky-50 text-sky-800 text-xs font-bold rounded-xl border border-sky-100 hover:border-sky-300 transition shadow-2xs"
                            >
                              <span className="w-1.5 h-1.5 rounded-full bg-sky-500" />
                              <span>{lang}</span>
                            </span>
                          ))}
                        </div>
                      ) : (
                        <div className="py-2 flex items-center justify-between w-full">
                          <p className="text-sm text-gray-400 italic">No spoken languages added yet.</p>
                          {!id && (
                            <button
                              type="button"
                              onClick={() => {
                                setIsEditingLanguages(true);
                                setDraftLanguages([]);
                                setLanguagesError('');
                              }}
                              className="text-xs font-bold text-sky-600 hover:underline cursor-pointer"
                            >
                              + Add Spoken Languages
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* FAMILY DETAILS */}
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 space-y-4">
                  <h3 className="text-sm font-extrabold text-slate-800 border-b border-slate-100 pb-3.5 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M17 21V19C17 17.9 16.1 17 15 17H9C7.9 17 7 17.9 7 19V21" stroke="url(#fam_grad)" strokeWidth="2.5" strokeLinecap="round" />
                        <circle cx="12" cy="13" r="3" fill="url(#fam_grad)" />
                        <path d="M23 21V20C23 18.9 22.1 18 21 18H19" stroke="url(#fam_grad)" strokeWidth="2" />
                        <circle cx="20" cy="15" r="2" fill="url(#fam_grad)" />
                        <path d="M1 21V20C1 18.9 1.9 18 3 18H5" stroke="url(#fam_grad)" strokeWidth="2" />
                        <circle cx="4" cy="15" r="2" fill="url(#fam_grad)" />
                        <defs>
                          <linearGradient id="fam_grad" x1="1" y1="13" x2="23" y2="21" gradientUnits="userSpaceOnUse">
                            <stop stopColor="#3F37C9" />
                            <stop offset="1" stopColor="#4CC9F0" />
                          </linearGradient>
                        </defs>
                      </svg>
                      <span>Family Details</span>
                    </div>
                    {!id && (
                      <button onClick={() => { setIsEditing(true); setActiveEditCategory('family'); }} className="text-slate-400 hover:text-[#5D34F7] hover:bg-[#5D34F7]/10 p-1.5 rounded-lg transition-colors cursor-pointer" title="Edit Family Details">
                        <Edit2 size={16} />
                      </button>
                    )}
                  </h3>
                  <div className="space-y-3">
                    <ProfileItem icon={<User size={16} />} label="Mother's Status" value={p.motherStatus} />
                    <ProfileItem icon={<User size={16} />} label="Father's Status" value={p.fatherStatus} />
                    <ProfileItem icon={<Users size={16} />} label="Siblings" value={formatSiblings(p)} />
                    <ProfileItem icon={<Users size={16} />} label="No of Sisters" value={p.sistersCount !== undefined ? p.sistersCount.toString() : '0'} />
                    <ProfileItem icon={<Users size={16} />} label="No of Brothers" value={p.brothersCount !== undefined ? p.brothersCount.toString() : '0'} />
                    <ProfileItem icon={<Users size={16} />} label="Lives with Family" value={p.liveWithFamily === true ? 'Yes' : p.liveWithFamily === false ? 'No' : ''} />
                    {p.liveWithFamily === false && <ProfileItem icon={<MapPin size={16} />} label="Family Location" value={p.familyLocation} />}
                    <ProfileItem icon={<Users size={16} />} label="Family Financial Status" value={p.familyFinancialStatus} />
                  </div>
                </div>

                {/* ASTROLOGY DETAILS */}
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 space-y-4">
                  <h3 className="text-sm font-extrabold text-slate-800 border-b border-slate-100 pb-3.5 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" stroke="url(#astro_grad)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <defs>
                          <linearGradient id="astro_grad" x1="2" y1="2" x2="22" y2="22" gradientUnits="userSpaceOnUse">
                            <stop stopColor="#9333EA" />
                            <stop offset="1" stopColor="#F43F5E" />
                          </linearGradient>
                        </defs>
                      </svg>
                      <span>Astrology Details</span>
                    </div>
                    {!id && (
                      <button onClick={() => { setIsEditing(true); setActiveEditCategory('astrology'); }} className="text-slate-400 hover:text-[#5D34F7] hover:bg-[#5D34F7]/10 p-1.5 rounded-lg transition-colors cursor-pointer" title="Edit Astrology Details">
                        <Edit2 size={16} />
                      </button>
                    )}
                  </h3>
                  <div className="space-y-3">
                    <ProfileItem icon={<Activity size={16} />} label="Time of Birth" value={p.astrology?.timeOfBirth} />
                    <ProfileItem icon={<MapPin size={16} />} label="City of Birth" value={p.astrology?.cityOfBirth || p.city} />
                    {p.astrology?.rashi && <ProfileItem icon={<Sparkles size={16} />} label="Rashi (Moon Sign)" value={p.astrology.rashi} />}
                    {p.astrology?.nakshatra && <ProfileItem icon={<Sparkles size={16} />} label="Nakshatra" value={p.astrology.nakshatra} />}
                    {p.astrology?.manglik !== undefined && <ProfileItem icon={<Sparkles size={16} />} label="Manglik" value={p.astrology.manglik ? 'Yes' : 'No'} />}
                  </div>

                  {/* AstroChat Consultation Banner */}
                  <div className="mt-3 p-3.5 rounded-2xl bg-gradient-to-r from-indigo-50 via-purple-50 to-amber-50 border border-indigo-100/80 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm">🔮</span>
                        <span className="text-[10px] font-black uppercase tracking-wider text-purple-700 bg-purple-100 px-2 py-0.5 rounded-full inline-block">
                          AstroChat Kundali Guidance
                        </span>
                      </div>
                      <p className="text-xs font-bold text-slate-800">
                        Consult verified Vedic Astrologers for marriage compatibility & horoscope matching.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => navigate('/astrochat')}
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#5D34F7] to-[#4024DB] hover:from-[#4d25d0] hover:to-[#381fcc] text-white text-xs font-black shadow-sm transition cursor-pointer shrink-0 active:scale-95 text-center"
                    >
                      Open AstroChat
                    </button>
                  </div>
                </div>

                {/* CONTACT DETAILS */}
                <div id="contact-info-section" className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 space-y-4 scroll-mt-24 transition-all duration-300">
                  <h3 className="text-sm font-extrabold text-slate-800 border-b border-slate-100 pb-3.5 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M22 16.9V19.9C22 21 21 22 19.9 22C8.9 22 2 15.1 2 4.1C2 3 3 2 4.1 2H7.1C8.1 2 9 2.8 9.1 3.9C9.2 4.6 9 5.3 8.5 5.8L6.7 7.6C8.2 10.3 10.4 12.5 13.1 14L14.9 12.2C15.4 11.7 16.1 11.5 16.8 11.6C17.9 11.7 18.7 12.6 18.7 13.6V16.9H22Z" fill="url(#con_grad)" />
                        <defs>
                          <linearGradient id="con_grad" x1="2" y1="2" x2="22" y2="22" gradientUnits="userSpaceOnUse">
                            <stop stopColor="#06D6A0" />
                            <stop offset="1" stopColor="#1B9AAA" />
                          </linearGradient>
                        </defs>
                      </svg>
                      <span>Contact Info</span>
                    </div>
                    {!id && (
                      <button onClick={() => { setIsEditing(true); setActiveEditCategory('contact'); }} className="text-slate-400 hover:text-[#5D34F7] hover:bg-[#5D34F7]/10 p-1.5 rounded-lg transition-colors cursor-pointer" title="Edit Contact Info">
                        <Edit2 size={16} />
                      </button>
                    )}
                  </h3>
                  {id ? (
                    <ContactInfoCard
                      targetUser={profile}
                      isPremium={viewerUser?.premiumMembership?.isPremium || false}
                      unlockedMap={unlockedContacts}
                      onUnlockSuccess={(targetId, unlockedData) => {
                        setUnlockedContacts((prev) => ({ ...prev, [targetId]: unlockedData }));
                        if (unlockedData.phone) setPhone(unlockedData.phone);
                        if (unlockedData.email) setEmail(unlockedData.email);
                      }}
                      onCall={(callPhone, callName, callPhoto) => {
                        setCallModalData({
                          isOpen: true,
                          phone: callPhone,
                          name: callName,
                          photo: callPhoto
                        });
                      }}
                    />
                  ) : (
                    <div className="space-y-3">
                      <ProfileItem icon={<Mail size={16} />} label="Email ID" value={email} />
                      <ProfileItem 
                        icon={<Phone size={16} />} 
                        label="Phone" 
                        value={phone} 
                        isPhone={true}
                        onClick={() => {
                          if (!phone) return;
                          setCallModalData({
                            isOpen: true,
                            phone: `${countryCode} ${phone}`,
                            name: profile?.name || 'My Profile',
                            photo: profile?.photos && profile.photos[0] ? profile.photos[0] : null
                          });
                        }}
                      />
                    </div>
                  )}
                </div>

                {/* PARTNER PREFERENCES (VIEW MODE) */}
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 space-y-6">
                  <h3 className="text-sm font-extrabold text-slate-800 border-b border-slate-100 pb-3.5 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect x="3" y="3" width="18" height="18" rx="5" fill="url(#pref_view_grad)" />
                        <path d="M7 16V8M12 16V8M17 16V8" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
                        <circle cx="7" cy="10" r="1.5" fill="#5D34F7" stroke="white" strokeWidth="2" />
                        <circle cx="12" cy="14" r="1.5" fill="#5D34F7" stroke="white" strokeWidth="2" />
                        <circle cx="17" cy="9" r="1.5" fill="#5D34F7" stroke="white" strokeWidth="2" />
                        <defs>
                          <linearGradient id="pref_view_grad" x1="3" y1="3" x2="21" y2="21" gradientUnits="userSpaceOnUse">
                            <stop stopColor="#5D34F7" />
                            <stop offset="1" stopColor="#4024DB" />
                          </linearGradient>
                        </defs>
                      </svg>
                      <span>Partner Preferences</span>
                    </div>
                    {!id && (
                      <button 
                        onClick={() => setActiveTab('preferences')} 
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#5D34F7]/10 hover:bg-[#5D34F7] text-[#5D34F7] hover:text-white rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer shadow-2xs group active:scale-95" 
                        title="Edit / Update Partner Preferences"
                      >
                        <span>Edit Preferences</span>
                        <ArrowRight size={13} className="group-hover:translate-x-0.5 transition-transform duration-200" />
                      </button>
                    )}
                  </h3>

                  {(() => {
                    const prefs = profile?.preferences || profile?.profile?.preferences || {};

                    // Helper to format values as array safely without dropping 0
                    const formatVals = (val) => {
                      if (val === undefined || val === null || val === '') return [];
                      if (Array.isArray(val)) {
                        return val
                          .filter(item => item !== undefined && item !== null && item !== '')
                          .map(item => {
                            if (typeof item === 'number') return String(item);
                            const str = String(item).trim();
                            if (str.toLowerCase() === 'no') return 'No Children (0)';
                            return str;
                          })
                          .filter(str => str !== '');
                      }
                      if (typeof val === 'number') return [String(val)];
                      if (typeof val === 'string' && val.trim()) {
                        if (val.trim().toLowerCase() === 'no') return ['No Children (0)'];
                        return [val.trim()];
                      }
                      return [];
                    };

                    // Age formatting
                    let ageDisplay = null;
                    if (Array.isArray(prefs.ageRange) && prefs.ageRange.length === 2 && (prefs.ageRange[0] !== undefined && prefs.ageRange[0] !== null && prefs.ageRange[1] !== undefined && prefs.ageRange[1] !== null)) {
                      ageDisplay = `${prefs.ageRange[0]} - ${prefs.ageRange[1]} years`;
                    } else if (typeof prefs.ageRange === 'string' && prefs.ageRange.trim()) {
                      ageDisplay = prefs.ageRange;
                    }

                    // Height formatting
                    let heightDisplay = null;
                    if (Array.isArray(prefs.height) && prefs.height.length > 0) {
                      const startH = prefs.height[0].split(' (')[0];
                      const endH = prefs.height[prefs.height.length - 1].split(' (')[0];
                      heightDisplay = prefs.height.length === 1 ? startH : `${startH} to ${endH}`;
                    } else if (typeof prefs.height === 'string' && prefs.height.trim()) {
                      heightDisplay = prefs.height.split(' (')[0];
                    }

                    // Standard 17 preference fields organized into logical groups
                    const preferenceGroups = [
                      {
                        groupTitle: 'Basic & Lifestyle Preferences',
                        items: [
                          {
                            id: 'ageRange',
                            label: 'Age Range',
                            icon: <Calendar size={14} className="text-[#5D34F7]" />,
                            values: ageDisplay ? [ageDisplay] : []
                          },
                          {
                            id: 'height',
                            label: 'Height Range',
                            icon: <Sliders size={14} className="text-[#5D34F7]" />,
                            values: heightDisplay ? [heightDisplay] : []
                          },
                          {
                            id: 'gender',
                            label: 'Looking For (Gender)',
                            icon: <User size={14} className="text-[#5D34F7]" />,
                            values: formatVals(prefs.gender)
                          },
                          {
                            id: 'maritalStatus',
                            label: 'Marital Status',
                            icon: <Heart size={14} className="text-[#5D34F7]" />,
                            values: formatVals(prefs.maritalStatus)
                          },
                          {
                            id: 'children',
                            label: 'Children / Kids Preference',
                            icon: <Baby size={14} className="text-[#5D34F7]" />,
                            values: (() => {
                              const raw = prefs.children;
                              if (raw === undefined || raw === null || (Array.isArray(raw) && raw.length === 0)) return [];
                              const arr = Array.isArray(raw) ? raw : [raw];
                              if (arr.some(isZeroOrNoChildren)) {
                                return ['No Children (0)'];
                              }
                              return formatVals(raw);
                            })()
                          },
                          {
                            id: 'diet',
                            label: 'Dietary Habits',
                            icon: <Activity size={14} className="text-[#5D34F7]" />,
                            values: formatVals(prefs.diet)
                          }
                        ]
                      },
                      {
                        groupTitle: 'Religion & Community Preferences',
                        items: [
                          {
                            id: 'religion',
                            label: 'Religion',
                            icon: <Landmark size={14} className="text-[#5D34F7]" />,
                            values: formatVals(prefs.religion)
                          },
                          {
                            id: 'caste',
                            label: 'Caste / Community',
                            icon: <Users size={14} className="text-[#5D34F7]" />,
                            values: formatVals(prefs.caste || prefs.community)
                          },
                          {
                            id: 'subCommunity',
                            label: 'Sub-Community',
                            icon: <Users size={14} className="text-[#5D34F7]" />,
                            values: formatVals(prefs.subCommunity)
                          },
                          {
                            id: 'languages',
                            label: 'Mother Tongue / Language',
                            icon: <BookOpen size={14} className="text-[#5D34F7]" />,
                            values: formatVals(prefs.languages || prefs.motherTongue || prefs.language)
                          }
                        ]
                      },
                      {
                        groupTitle: 'Location Preferences',
                        items: [
                          {
                            id: 'location',
                            label: 'Preferred Locations / Cities',
                            icon: <MapPin size={14} className="text-[#5D34F7]" />,
                            values: formatVals(prefs.location || prefs.locations || prefs.city)
                          }
                        ]
                      },
                      {
                        groupTitle: 'Education & Career Preferences',
                        items: [
                          {
                            id: 'education',
                            label: 'Highest Education',
                            icon: <GraduationCap size={14} className="text-[#5D34F7]" />,
                            values: formatVals(prefs.education || prefs.qualification)
                          },
                          {
                            id: 'college',
                            label: 'Institution / College',
                            icon: <GraduationCap size={14} className="text-[#5D34F7]" />,
                            values: formatVals(prefs.college)
                          },
                          {
                            id: 'workSector',
                            label: 'Work Sector',
                            icon: <Briefcase size={14} className="text-[#5D34F7]" />,
                            values: formatVals(prefs.workSector)
                          },
                          {
                            id: 'profession',
                            label: 'Profession / Occupation',
                            icon: <Briefcase size={14} className="text-[#5D34F7]" />,
                            values: formatVals(prefs.profession || prefs.occupation || prefs.workRole)
                          },
                          {
                            id: 'income',
                            label: 'Annual Income',
                            icon: <Scale size={14} className="text-[#5D34F7]" />,
                            values: formatVals(prefs.income || prefs.annualIncome)
                          }
                        ]
                      },
                      {
                        groupTitle: 'Family Background Preferences',
                        items: [
                          {
                            id: 'familyFinancialStatus',
                            label: 'Family Financial Status',
                            icon: <Home size={14} className="text-[#5D34F7]" />,
                            values: formatVals(prefs.familyFinancialStatus)
                          }
                        ]
                      }
                    ];

                    const allGroupKeys = preferenceGroups.map(g => g.groupTitle);
                    const allAreCollapsed = allGroupKeys.length > 0 && allGroupKeys.every(k => !!collapsedPrefSections[k]);

                    return (
                      <div className="space-y-4">
                        {/* Section Controls Bar */}
                        <div className="flex items-center justify-between text-xs pb-1 border-b border-slate-50">
                          <span className="text-[11px] font-bold text-slate-400">
                            {preferenceGroups.length} preference categories
                          </span>
                          <button
                            type="button"
                            onClick={() => toggleAllPrefSections(allGroupKeys)}
                            className="inline-flex items-center gap-1 text-xs font-bold text-[#5D34F7] hover:text-[#4024DB] transition cursor-pointer group"
                            title={allAreCollapsed ? 'Expand all categories' : 'Collapse all categories'}
                          >
                            <span>{allAreCollapsed ? 'Expand All' : 'Collapse All'}</span>
                            <ChevronDown
                              size={14}
                              className={`transition-transform duration-200 ${allAreCollapsed ? '' : 'rotate-180'}`}
                            />
                          </button>
                        </div>

                        {preferenceGroups.map((group) => {
                          const isCollapsed = !!collapsedPrefSections[group.groupTitle];
                          const filledCount = group.items.filter(i => i.values && i.values.length > 0).length;

                          return (
                            <div 
                              key={group.groupTitle} 
                              className="rounded-2xl border border-slate-100 bg-slate-50/30 p-3.5 space-y-3 transition-all duration-200 hover:border-slate-200"
                            >
                              <button
                                type="button"
                                onClick={() => togglePrefSection(group.groupTitle)}
                                className="w-full flex items-center justify-between text-left cursor-pointer group/sec focus:outline-none"
                                aria-expanded={!isCollapsed}
                                title={isCollapsed ? `Expand ${group.groupTitle}` : `Collapse ${group.groupTitle}`}
                              >
                                <div className="flex items-center gap-2">
                                  <span className="w-2 h-2 rounded-full bg-[#5D34F7] group-hover/sec:scale-125 transition-transform"></span>
                                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-700 group-hover/sec:text-[#5D34F7] transition-colors">
                                    {group.groupTitle}
                                  </h4>
                                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white text-slate-500 border border-slate-200/60 shadow-2xs">
                                    {filledCount}/{group.items.length} set
                                  </span>
                                </div>
                                <div className="flex items-center gap-1.5 text-slate-400 group-hover/sec:text-[#5D34F7] transition-colors">
                                  <span className="text-[10px] font-bold uppercase tracking-wider hidden sm:inline text-slate-400">
                                    {isCollapsed ? 'Show' : 'Hide'}
                                  </span>
                                  <div className="w-6 h-6 rounded-lg bg-white border border-slate-200/80 flex items-center justify-center shadow-2xs group-hover/sec:border-[#5D34F7]/40 transition">
                                    <ChevronDown
                                      size={14}
                                      className={`transition-transform duration-200 ${isCollapsed ? '' : 'rotate-180 text-[#5D34F7]'}`}
                                    />
                                  </div>
                                </div>
                              </button>

                              {!isCollapsed && (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 animate-in fade-in duration-200">
                                  {group.items.map((item) => {
                                    const hasValues = item.values && item.values.length > 0;
                                    return (
                                      <div 
                                        key={item.id} 
                                        className={`p-3.5 rounded-2xl border transition-all duration-200 flex flex-col justify-between gap-2 ${
                                          hasValues 
                                            ? 'bg-purple-50/25 border-purple-100/80 hover:bg-purple-50/40 hover:border-[#5D34F7]/30' 
                                            : 'bg-white border-slate-100/90 hover:bg-slate-50'
                                        }`}
                                      >
                                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                                          {item.icon}
                                          <span>{item.label}</span>
                                        </span>
                                        <div className="flex flex-wrap items-center gap-1.5 min-h-[26px]">
                                          {hasValues ? (
                                            item.values.map((v) => (
                                              <span 
                                                key={v} 
                                                className="px-2.5 py-1 bg-white text-[#5D34F7] text-xs font-bold rounded-lg border border-[#5D34F7]/20 shadow-2xs"
                                              >
                                                {v}
                                              </span>
                                            ))
                                          ) : (
                                            <span className="text-xs text-slate-400 italic font-medium px-1">
                                              Not specified
                                            </span>
                                          )}
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    );
                  })()}
                </div>

              </main>
            </div>
          )}
        </>
      ) : (
        /* ====================================
           PARTNER PREFERENCES TAB
           ==================================== */
        <div className="max-w-7xl mx-auto lg:mx-0 lg:ml-6 xl:ml-10 px-4 mt-6 pb-24 lg:px-8">
          <div className="bg-white rounded-3xl p-8 shadow-md hover:shadow-lg border border-slate-100/60 space-y-8 transition-all duration-300">
            <div>
              {/* Back to Profile Navigation Arrow */}
              <button
                type="button"
                onClick={() => setActiveTab('profile')}
                className="inline-flex items-center gap-2 px-3.5 py-1.5 mb-4 text-xs font-bold text-slate-600 hover:text-[#5D34F7] bg-slate-100/80 hover:bg-[#5D34F7]/10 rounded-xl transition cursor-pointer group active:scale-95 shadow-2xs"
                title="Back to My Profile"
              >
                <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform duration-200 text-[#5D34F7]" />
                <span>Back to My Profile</span>
              </button>

              <h2 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-3 mb-2">
                <svg className="w-8 h-8 drop-shadow-sm shrink-0" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="3" y="3" width="18" height="18" rx="5" fill="url(#pref_title_grad)" />
                  <path d="M7 16V8M12 16V8M17 16V8" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
                  <circle cx="7" cy="10" r="1.5" fill="#5D34F7" stroke="white" strokeWidth="2" />
                  <circle cx="12" cy="14" r="1.5" fill="#5D34F7" stroke="white" strokeWidth="2" />
                  <circle cx="17" cy="9" r="1.5" fill="#5D34F7" stroke="white" strokeWidth="2" />
                  <defs>
                    <linearGradient id="pref_title_grad" x1="3" y1="3" x2="21" y2="21" gradientUnits="userSpaceOnUse">
                      <stop stopColor="#5D34F7" />
                      <stop offset="1" stopColor="#4024DB" />
                    </linearGradient>
                  </defs>
                </svg>
                <span>Partner Preferences</span>
              </h2>
              <p className="text-gray-500 text-sm">Specify criteria for your ideal matches. We will prefill profiles based on these options.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

              {/* Age Range */}
              <div className="space-y-3">
                <label className="text-sm font-bold text-gray-800 flex items-center gap-1.5">
                  <Sliders size={18} className="text-[#5D34F7]" /> Preferred Age Range
                </label>
                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="text-xs text-gray-500 font-medium mb-1 block">Min Age</label>
                    <select
                      value={prefAgeMin}
                      onChange={(e) => setPrefAgeMin(Number(e.target.value))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-2xl bg-white focus:outline-none focus:ring-2 focus:ring-[#5D34F7] text-sm text-gray-700"
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
                      className="w-full px-4 py-3 border border-gray-300 rounded-2xl bg-white focus:outline-none focus:ring-2 focus:ring-[#5D34F7] text-sm text-gray-700"
                    >
                      {[...Array(53)].map((_, i) => {
                        const age = i + 18;
                        return <option key={age} value={age}>{age}</option>;
                      })}
                    </select>
                  </div>
                </div>
              </div>

              {/* Height Range */}
              <div className="space-y-3">
                <label className="text-sm font-bold text-gray-800 flex items-center gap-1.5">
                  <Sliders size={18} className="text-[#5D34F7]" /> Preferred Height Range
                </label>
                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="text-xs text-gray-500 font-medium mb-1 block">Min Height</label>
                    <select
                      value={prefHeightMinIdx}
                      onChange={(e) => setPrefHeightMinIdx(Number(e.target.value))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-2xl bg-white focus:outline-none focus:ring-2 focus:ring-[#5D34F7] text-sm text-gray-700"
                    >
                      {ALL_HEIGHTS.map((h, i) => (
                        <option key={h} value={i}>{h.split(' (')[0]}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex-1">
                    <label className="text-xs text-gray-500 font-medium mb-1 block">Max Height</label>
                    <select
                      value={prefHeightMaxIdx}
                      onChange={(e) => setPrefHeightMaxIdx(Number(e.target.value))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-2xl bg-white focus:outline-none focus:ring-2 focus:ring-[#5D34F7] text-sm text-gray-700"
                    >
                      {ALL_HEIGHTS.map((h, i) => (
                        <option key={h} value={i}>{h.split(' (')[0]}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Preferred Genders */}
              <div className="space-y-3">
                <label className="text-sm font-bold text-gray-800">Preferred Genders</label>
                <ChipSelector options={ALL_GENDERS} selected={prefGenders} onChange={setPrefGenders} title="Gender" />
              </div>

              {/* Marital Status */}
              <div className="space-y-3">
                <label className="text-sm font-bold text-gray-800">Preferred Marital Status</label>
                <ChipSelector options={ALL_MARITAL_STATUSES} selected={prefMaritalStatuses} onChange={setPrefMaritalStatuses} title="Marital Status" />
              </div>

              {/* Children Preferences */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-bold text-gray-800 flex items-center gap-1.5">
                    <Baby size={18} className="text-[#5D34F7]" /> Preferred Children / Kids
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      const isAllSelected = CHILDREN_FILTER_OPTIONS.every(c =>
                        prefChildren.some(p => p === c || (isZeroOrNoChildren(c) && isZeroOrNoChildren(p)))
                      );
                      setPrefChildren(isAllSelected ? [] : [...CHILDREN_FILTER_OPTIONS]);
                    }}
                    className="text-xs text-[#5D34F7] font-semibold hover:underline bg-transparent border-0 cursor-pointer"
                  >
                    {CHILDREN_FILTER_OPTIONS.every(c =>
                      prefChildren.some(p => p === c || (isZeroOrNoChildren(c) && isZeroOrNoChildren(p)))
                    ) ? 'Deselect All' : 'Select All'}
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {CHILDREN_FILTER_OPTIONS.map(c => {
                    const isSel = prefChildren.some(p => p === c || (isZeroOrNoChildren(c) && isZeroOrNoChildren(p)));
                    return (
                      <button
                        key={c}
                        type="button"
                        onClick={() => {
                          if (isSel) {
                            setPrefChildren(prefChildren.filter(x => !(x === c || (isZeroOrNoChildren(c) && isZeroOrNoChildren(x)))));
                          } else {
                            setPrefChildren([...prefChildren.filter(x => !(isZeroOrNoChildren(c) && isZeroOrNoChildren(x))), c]);
                          }
                        }}
                        className={`px-4 py-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                          isSel
                            ? 'bg-[#5D34F7] text-white border-[#5D34F7] shadow-sm'
                            : 'bg-white text-gray-700 border-gray-200 hover:border-[#5D34F7]/40 hover:bg-purple-50/20'
                        }`}
                      >
                        {c === 'No Children' ? '0 (No Children)' : c}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Dietary Preferences */}
              <div className="space-y-3">
                <label className="text-sm font-bold text-gray-800">Preferred Diet</label>
                <ChipSelector options={ALL_DIETS} selected={prefDiets} onChange={setPrefDiets} title="Diet" />
              </div>

              {/* Religions */}
              <div className="space-y-3">
                <label className="text-sm font-bold text-gray-800">Preferred Religions</label>
                <ChipSelector
                  options={ALL_RELIGIONS}
                  selected={prefReligions}
                  onChange={(val) => {
                    setPrefReligions(val);
                    const validCastes = [];
                    val.forEach(r => { validCastes.push(...(RELIGION_CASTES_MAP[r] || [])); });
                    setPrefCastes(prefCastes.filter(c => validCastes.includes(c)));
                  }}
                  title="Religion"
                />
              </div>

              {/* Castes */}
              {prefReligions.length > 0 && (
                <div className="space-y-3 md:col-span-2">
                  <label className="text-sm font-bold text-gray-800">Preferred Caste / Community</label>
                  {(() => {
                    let availableCastes = [];
                    prefReligions.forEach(r => { availableCastes.push(...(RELIGION_CASTES_MAP[r] || [])); });
                    availableCastes = [...new Set(availableCastes)];
                    return (
                      <ChipSelector
                        options={availableCastes}
                        selected={prefCastes}
                        onChange={(val) => {
                          setPrefCastes(val);
                          const validSubs = [];
                          val.forEach(c => { validSubs.push(...(CASTE_SUB_COMMUNITIES_MAP[c] || [])); });
                          setPrefSubCommunities(prefSubCommunities.filter(s => validSubs.includes(s)));
                        }}
                        title="Caste"
                      />
                    );
                  })()}
                </div>
              )}

              {/* Sub-communities */}
              {prefCastes.length > 0 && (
                <div className="space-y-3 md:col-span-2">
                  <label className="text-sm font-bold text-gray-800">Preferred Sub-community / Sect</label>
                  {(() => {
                    let availableSubs = [];
                    prefCastes.forEach(c => { availableSubs.push(...(CASTE_SUB_COMMUNITIES_MAP[c] || [])); });
                    availableSubs = [...new Set(availableSubs)];
                    if (availableSubs.length === 0) {
                      availableSubs = ['Saraswat', 'Srivastava', 'Kadva Patel', 'Shekhawat', 'Other'];
                    }
                    return (
                      <ChipSelector
                        options={availableSubs}
                        selected={prefSubCommunities}
                        onChange={setPrefSubCommunities}
                        title="Sub-community"
                      />
                    );
                  })()}
                </div>
              )}

              {/* Locations */}
              <div className="space-y-3">
                <label className="text-sm font-bold text-gray-800">Preferred Locations</label>
                <ChipSelector options={ALL_LOCATIONS} selected={prefLocations} onChange={setPrefLocations} title="Location" />
              </div>

              {/* Preferred Mother Tongue / Language */}
              <div className="space-y-3">
                <label className="text-sm font-bold text-gray-800">Preferred Mother Tongue / Language</label>
                <ChipSelector options={ALL_COMMUNITIES} selected={prefLanguages} onChange={setPrefLanguages} title="Mother Tongue" />
              </div>

              {/* Education Level */}
              <div className="space-y-3">
                <label className="text-sm font-bold text-gray-800">Preferred Education Level</label>
                <ChipSelector options={ALL_EDUCATIONS} selected={prefEducations} onChange={setPrefEducations} title="Education" />
              </div>

              {/* Colleges */}
              <div className="space-y-3">
                <label className="text-sm font-bold text-gray-800">Preferred Institution / College</label>
                <ChipSelector options={ALL_COLLEGES} selected={prefColleges} onChange={setPrefColleges} title="College" />
              </div>

              {/* Work Sectors */}
              <div className="space-y-3">
                <label className="text-sm font-bold text-gray-800">Preferred Work Sector</label>
                <ChipSelector options={ALL_WORK_SECTORS} selected={prefWorkSectors} onChange={setPrefWorkSectors} title="Work Sector" />
              </div>

              {/* Occupation */}
              <div className="space-y-3">
                <label className="text-sm font-bold text-gray-800">Preferred Occupation / Work Role</label>
                <ChipSelector options={ALL_PROFESSIONS} selected={prefProfessions} onChange={setPrefProfessions} title="Occupation" />
              </div>

              {/* Annual Income */}
              <div className="space-y-3">
                <label className="text-sm font-bold text-gray-800">Preferred Annual Income</label>
                <ChipSelector options={ALL_INCOMES} selected={prefIncomes} onChange={setPrefIncomes} title="Income" />
              </div>

              {/* Financial Status */}
              <div className="space-y-3">
                <label className="text-sm font-bold text-gray-800">Preferred Family Financial Status</label>
                <ChipSelector options={ALL_FINANCIAL_STATUSES} selected={prefFinancialStatuses} onChange={setPrefFinancialStatuses} title="Financial Status" />
              </div>

            </div>

            {error && (
              <div className="bg-red-50 text-red-600 p-4 rounded-2xl text-sm text-center font-medium">{error}</div>
            )}
            {saveSuccess && (
              <div className="bg-emerald-50 text-emerald-600 p-4 rounded-2xl text-sm text-center font-semibold flex items-center justify-center gap-2">
                <Check size={16} /> Preferences saved successfully!
              </div>
            )}

            <div className="pt-6 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="text-xs font-bold text-slate-500">
                <span className="inline-flex items-center gap-1.5 bg-indigo-50 text-[#5D34F7] px-3.5 py-1.5 rounded-full border border-indigo-150 shadow-2xs font-bold">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>
                    Live Matching Profiles:{' '}
                    <strong className="font-extrabold">
                      {isCountingMatches
                        ? '...'
                        : liveMatchesCount !== null
                        ? liveMatchesCount
                        : '...'}
                    </strong>
                  </span>
                </span>
              </div>
              <button
                onClick={handleSavePreferences}
                disabled={isSaving}
                className="w-full sm:w-auto px-8 py-3 bg-[#5D34F7] text-white rounded-xl text-sm font-bold shadow-md hover:bg-[#4024DB] transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
                title={`Save partner preferences (${liveMatchesCount !== null ? liveMatchesCount : 0} matches)`}
              >
                {isSaving ? (
                  <span>Saving Preferences...</span>
                ) : (
                  <>
                    <span>
                      Save Preferences (
                      {isCountingMatches
                        ? '...'
                        : `${liveMatchesCount !== null ? liveMatchesCount : 0} ${
                            (liveMatchesCount !== null ? liveMatchesCount : 0) === 1
                              ? 'match'
                              : 'matches'
                          }`}
                      )
                    </span>
                    {liveMatchesCount !== null && !isCountingMatches && (
                      <span className="bg-white/20 text-white text-xs px-2.5 py-0.5 rounded-full font-black border border-white/20">
                        {liveMatchesCount}
                      </span>
                    )}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      <ShareModal 
        isOpen={shareModalOpen} 
        onClose={() => setShareModalOpen(false)} 
        shareUrl={shareUrl} 
        onDownload={() => handleDownloadProfile(profile)}
      />

      <CallModal
        isOpen={callModalData.isOpen}
        onClose={() => setCallModalData(prev => ({ ...prev, isOpen: false }))}
        phone={callModalData.phone}
        name={callModalData.name}
        photo={callModalData.photo}
      />

      {/* Dedicated Description Verification Modal */}
      {showDescriptionVerifyModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-slate-100 relative space-y-5 animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-[#5D34F7]/10 flex items-center justify-center text-[#5D34F7] shrink-0">
                  <ShieldCheck size={22} />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                    Description Verification
                  </h3>
                  <p className="text-xs text-slate-400 font-semibold">
                    Submit your profile bio for official safety screening
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowDescriptionVerifyModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition cursor-pointer text-sm font-bold"
              >
                ✕
              </button>
            </div>

            {/* Current Verification Status Indicator */}
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/60 flex items-center justify-between text-xs">
              <span className="font-extrabold text-slate-600">Current Status:</span>
              {profile?.aboutMeVerificationStatus === 'approved' ? (
                <span className="font-black text-emerald-700 bg-emerald-100/70 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                  <CheckCircle2 size={12} /> Verified
                </span>
              ) : profile?.aboutMeVerificationStatus === 'pending' ? (
                <span className="font-black text-amber-700 bg-amber-100/70 px-2.5 py-0.5 rounded-full flex items-center gap-1 animate-pulse">
                  <Clock size={12} /> Pending Review
                </span>
              ) : profile?.aboutMeVerificationStatus === 'rejected' ? (
                <span className="font-black text-rose-700 bg-rose-100/70 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                  <XCircle size={12} /> Verification Failed
                </span>
              ) : (
                <span className="font-bold text-slate-600 bg-slate-200/70 px-2.5 py-0.5 rounded-full">
                  Not Submitted
                </span>
              )}
            </div>

            {/* Verification Rules & Policy Warning */}
            <div className="bg-amber-50/60 border border-amber-200/70 rounded-2xl p-3 text-[11px] text-amber-900 space-y-1">
              <p className="font-black flex items-center gap-1">
                <Info size={13} className="text-amber-600" />
                <span>Verification Guidelines:</span>
              </p>
              <ul className="list-disc list-inside space-y-0.5 pl-1 font-medium text-amber-800">
                <li>Write at least 20 characters describing your personality, values, and expectations.</li>
                <li>Do NOT include contact details, phone numbers, email addresses, or external links.</li>
                <li>Respectful language is required. Any offensive content will lead to rejection.</li>
              </ul>
            </div>

            {/* Textarea Input */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <label className="font-bold text-slate-700">Profile Description / About Me</label>
                <span className={`text-[11px] font-bold ${verifyBioText.length < 20 ? 'text-amber-600' : verifyBioText.length > 1000 ? 'text-rose-600' : 'text-slate-400'}`}>
                  {verifyBioText.length} / 1000 characters (Min 20)
                </span>
              </div>
              <textarea
                value={verifyBioText}
                onChange={(e) => {
                  setVerifyBioText(e.target.value);
                  setVerifyBioError('');
                }}
                rows={5}
                placeholder="Write a clear, genuine description about yourself, your educational background, lifestyle, family values, and what kind of partner you hope to find..."
                className="w-full p-4 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#5D34F7]/40 focus:border-[#5D34F7] text-xs sm:text-sm text-slate-800 leading-relaxed resize-none transition bg-slate-50/50"
              />
            </div>

            {/* Live Readability Preview Box */}
            {verifyBioText.trim().length >= 20 && (
              <div className="space-y-1.5">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">
                  Public Preview Readability
                </span>
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 text-xs text-slate-700 leading-relaxed whitespace-pre-line font-medium max-h-32 overflow-y-auto">
                  {verifyBioText}
                </div>
              </div>
            )}

            {/* Error Message */}
            {verifyBioError && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-600 text-xs font-semibold rounded-2xl flex items-center gap-2">
                <AlertCircle size={16} className="shrink-0" />
                <span>{verifyBioError}</span>
              </div>
            )}

            {/* Success Message */}
            {verifyBioSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-black rounded-2xl flex items-center gap-2">
                <CheckCircle2 size={16} className="shrink-0" />
                <span>✓ Description submitted for verification! Moderation review is now pending.</span>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  const template = `Hello! I am a sincere and family-oriented professional based in ${p.city || 'India'}. I value honesty, mutual respect, and continuous personal growth. In my leisure time, I enjoy ${p.hobbies && p.hobbies.length > 0 ? p.hobbies.join(', ') : 'reading and traveling'}. I am looking for a compatible companion with shared values to embark on this journey together.`;
                  setVerifyBioText(template);
                  setVerifyBioError('');
                }}
                className="text-xs font-bold text-[#5D34F7] hover:underline cursor-pointer flex items-center gap-1 self-start sm:self-center"
              >
                <Sparkles size={13} />
                <span>Use Bio Suggestion Template</span>
              </button>

              <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
                <button
                  type="button"
                  onClick={() => setShowDescriptionVerifyModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-bold transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={isSubmittingVerifyBio || !verifyBioText.trim()}
                  onClick={() => handleVerifyDescriptionSubmit()}
                  className="px-6 py-2.5 rounded-xl bg-[#5D34F7] hover:bg-[#4024DB] disabled:opacity-50 text-white text-xs font-black shadow-md shadow-[#5D34F7]/20 transition cursor-pointer flex items-center gap-1.5"
                >
                  {isSubmittingVerifyBio ? (
                    <>
                      <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck size={14} />
                      <span>Submit for Verification</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Remove College Confirmation Modal */}
      {showRemoveCollegeModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-5 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-rose-50 text-rose-600 rounded-2xl border border-rose-100">
                  <Trash2 size={20} />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">Remove College</h3>
                  <p className="text-xs text-slate-500">Education & Career Details</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowRemoveCollegeModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3">
              <p className="text-sm text-slate-600 leading-relaxed">
                Are you sure you want to remove <strong className="text-slate-900 font-bold">{college || p?.college || 'your college'}</strong> from your profile?
              </p>
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 text-xs text-slate-600 space-y-1.5">
                <div className="flex items-start gap-2">
                  <Check size={14} className="text-emerald-600 mt-0.5 shrink-0" />
                  <span>College / university will be cleared and no longer appear on your profile.</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check size={14} className="text-emerald-600 mt-0.5 shrink-0" />
                  <span>Highest Qualification ({qualification || p?.education || 'Degree'}) will remain untouched.</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setShowRemoveCollegeModal(false)}
                disabled={isRemovingCollege}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 text-xs font-bold hover:bg-slate-50 transition cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>

              {isEditing ? (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      setCollege('');
                      setShowRemoveCollegeModal(false);
                    }}
                    className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold transition cursor-pointer active:scale-95 flex items-center justify-center gap-1.5"
                  >
                    <span>Clear from Form</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleDirectRemoveCollege}
                    disabled={isRemovingCollege}
                    className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-700 hover:to-rose-800 text-white text-xs font-bold transition shadow-sm cursor-pointer active:scale-95 flex items-center justify-center gap-1.5 disabled:opacity-50"
                  >
                    {isRemovingCollege ? (
                      <>
                        <Loader2 size={14} className="animate-spin" />
                        <span>Removing...</span>
                      </>
                    ) : (
                      <>
                        <Trash2 size={14} />
                        <span>Remove & Save Now</span>
                      </>
                    )}
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={handleDirectRemoveCollege}
                  disabled={isRemovingCollege}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-700 hover:to-rose-800 text-white text-xs font-bold transition shadow-sm cursor-pointer active:scale-95 flex items-center justify-center gap-1.5 disabled:opacity-50"
                >
                  {isRemovingCollege ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      <span>Removing...</span>
                    </>
                  ) : (
                    <>
                      <Trash2 size={14} />
                      <span>Confirm & Remove</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification for Clipboard Copy */}
      {copyToast.show && (
        <div 
          role="status" 
          aria-live="polite"
          className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-[9999] animate-in fade-in slide-in-from-bottom-4 duration-200 pointer-events-none"
        >
          <div className={`px-5 py-3 rounded-2xl shadow-xl flex items-center gap-2.5 font-bold text-sm border backdrop-blur-md pointer-events-auto ${
            copyToast.type === 'error'
              ? 'bg-rose-900/95 text-white border-rose-700 shadow-rose-950/20'
              : 'bg-slate-900/95 text-white border-slate-700/60 shadow-slate-950/30'
          }`}>
            {copyToast.type === 'error' ? (
              <AlertCircle size={18} className="text-rose-400 shrink-0" />
            ) : (
              <CheckCircle2 size={18} className="text-emerald-400 shrink-0" />
            )}
            <span>{copyToast.message}</span>
          </div>
        </div>
      )}

      {/* Feature 19: Dedicated Change Profile Picture (DP) Modal */}
      {changeDpModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-5 animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-[#5D34F7]/10 text-[#5D34F7] rounded-2xl border border-[#5D34F7]/20">
                  <Camera size={20} />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">Change Profile Picture (DP)</h3>
                  <p className="text-xs text-slate-500">Update your primary display picture</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setChangeDpModalOpen(false);
                  setSelectedDpFile(null);
                  setDpPreviewUrl(null);
                  setDpUploadError('');
                }}
                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Error / Success message */}
            {dpUploadError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
                <AlertCircle size={15} className="shrink-0" />
                <span>{dpUploadError}</span>
              </div>
            )}
            {dpUploadSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs rounded-xl flex items-center gap-2">
                <CheckCircle2 size={15} className="shrink-0" />
                <span>Profile picture uploaded! Status: Pending verification.</span>
              </div>
            )}

            {/* Picture Preview */}
            <div className="flex flex-col items-center justify-center py-2 space-y-3">
              <div className="relative w-32 h-32 rounded-2xl overflow-hidden bg-slate-100 border-4 border-white shadow-lg">
                {dpPreviewUrl ? (
                  <img
                    src={dpPreviewUrl}
                    alt="New DP Preview"
                    className="w-full h-full object-cover"
                  />
                ) : displayPhotos.length > 0 ? (
                  <img
                    src={getPhotoUrl(displayPhotos[0], p.gender)}
                    alt="Current Avatar"
                    onError={(e) => handleImageError(e, p.gender)}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <img
                    src={getDefaultAvatar(p.gender)}
                    alt="Default Avatar"
                    className="w-full h-full object-cover"
                  />
                )}
                {dpPreviewUrl && (
                  <span className="absolute top-2 left-2 bg-[#5D34F7] text-white text-[9px] font-black uppercase px-2 py-0.5 rounded-md shadow-xs">
                    New Preview
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 font-medium">
                {dpPreviewUrl ? 'Selected image preview' : 'Current display picture'}
              </p>
            </div>

            {/* File Input Picker */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Select New Picture
              </label>
              <input
                type="file"
                id="dp-modal-file-input"
                accept="image/jpeg,image/png,image/webp"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  if (!file.type || !file.type.startsWith('image/')) {
                    setDpUploadError('Please select a valid image file (JPG, PNG, WebP).');
                    return;
                  }
                  if (file.size > 10 * 1024 * 1024) {
                    setDpUploadError('Image size must be less than 10MB.');
                    return;
                  }
                  setSelectedDpFile(file);
                  setDpPreviewUrl(URL.createObjectURL(file));
                  setDpUploadError('');
                }}
                className="w-full text-xs text-slate-600 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-[#5D34F7]/10 file:text-[#5D34F7] hover:file:bg-[#5D34F7]/20 file:cursor-pointer cursor-pointer border border-slate-200 rounded-xl p-1 bg-slate-50/50"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Accepted: JPG, PNG, WebP (Max 10MB)
              </p>
            </div>

            {/* Verification Status Notice */}
            <div className="p-3.5 bg-amber-50 rounded-2xl border border-amber-200/80 text-xs text-amber-900 space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-amber-950">
                <Clock size={14} className="text-amber-600 shrink-0" />
                <span>Verification Process</span>
              </div>
              <p className="text-[11px] text-amber-800 leading-relaxed">
                Newly uploaded profile pictures undergo quick admin verification to ensure profile authenticity. Your new photo will be tagged as <strong>Pending Verification</strong> until approved.
              </p>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
              <button
                type="button"
                disabled={isUploadingDp}
                onClick={() => {
                  setChangeDpModalOpen(false);
                  setSelectedDpFile(null);
                  setDpPreviewUrl(null);
                  setDpUploadError('');
                }}
                className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 text-xs font-bold hover:bg-slate-50 transition cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!selectedDpFile || isUploadingDp}
                onClick={async () => {
                  if (!selectedDpFile) return;
                  setIsUploadingDp(true);
                  setDpUploadError('');
                  try {
                    const uploadedNames = await uploadFiles([selectedDpFile]);
                    const existing = (Array.isArray(photos) && photos.length > 0)
                      ? photos
                      : ((profile?.profile?.photos || profile?.photos || []));
                    const newPhotos = [uploadedNames[0], ...existing.filter((_, i) => i !== 0)];
                    setPhotos(newPhotos);
                    await savePhotosDirectly(newPhotos);
                    setDpUploadSuccess(true);
                    setTimeout(() => {
                      setChangeDpModalOpen(false);
                      setSelectedDpFile(null);
                      setDpPreviewUrl(null);
                      setDpUploadSuccess(false);
                    }, 1200);
                  } catch (err) {
                    setDpUploadError(err.response?.data?.message || err.message || 'Failed to update profile picture.');
                  } finally {
                    setIsUploadingDp(false);
                  }
                }}
                className="px-5 py-2.5 rounded-xl bg-[#5D34F7] hover:bg-[#4024DB] disabled:opacity-50 text-white text-xs font-black shadow-md shadow-[#5D34F7]/20 transition cursor-pointer flex items-center gap-1.5"
              >
                {isUploadingDp ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    <span>Uploading DP...</span>
                  </>
                ) : (
                  <>
                    <Check size={14} />
                    <span>Upload & Save DP</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* VIP Relationship Consultant Modal */}
      <VipConsultantModal
        isOpen={showVipConsultantModal}
        onClose={() => setShowVipConsultantModal(false)}
        currentUser={viewerUser}
      />

      {/* VIP Shaadi – Get Invited Modal */}
      <VipShaadiModal
        isOpen={showVipShaadiModal}
        onClose={() => setShowVipShaadiModal(false)}
        currentUser={profile || viewerUser}
        onEnquirySubmitted={() => fetchVipEnquiry()}
      />

      {/* Full-Screen Image Lightbox Viewer */}
      <FullScreenImageViewer
        isOpen={fullScreenImage.isOpen}
        onClose={() => setFullScreenImage(prev => ({ ...prev, isOpen: false }))}
        images={fullScreenImage.images}
        initialIndex={fullScreenImage.initialIndex}
        userName={fullScreenImage.userName}
        gender={fullScreenImage.gender}
        targetUserId={fullScreenImage.targetUserId}
        currentUserId={viewerUser?._id}
      />
    </div>
  );
}

function ProfileItem({ icon, label, value, isPhone, isCopyable, onCopy, isCopied, copyTitle, onClick, onRemove, removeTitle }) {
  if (!value && value !== 0) return null;
  return (
    <div 
      onClick={onClick}
      className={`flex items-start gap-3 p-2.5 rounded-2xl transition duration-200 ${
        onClick ? 'hover:bg-slate-50 cursor-pointer group/item border border-slate-100/80 shadow-xs' : ''
      }`}
    >
      <div className="mt-0.5 text-[#5D34F7]">{icon}</div>
      <div className="flex-1 min-w-0">
        <span className="block text-xs text-gray-500 font-medium leading-none mb-1">{label}</span>
        <div className="flex items-center gap-2 flex-wrap justify-between">
          <span className={`block text-sm text-gray-800 font-bold break-words leading-tight ${onClick ? 'group-hover/item:text-[#5D34F7] transition-colors' : ''}`}>
            {value}
          </span>
          <div className="flex items-center gap-2 shrink-0">
            {isPhone && value && (
              <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-600 text-[10px] font-black uppercase rounded-lg border border-emerald-500/20 tracking-wider flex items-center gap-1 group-hover/item:bg-emerald-500 group-hover/item:text-white transition-colors">
                Tap to call
              </span>
            )}
            {isCopyable && (
              <button
                type="button"
                onClick={onCopy}
                className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#5D34F7]/10 hover:bg-[#5D34F7]/20 text-[#5D34F7] text-[11px] font-black tracking-wider rounded-lg border border-[#5D34F7]/20 uppercase transition-all cursor-pointer active:scale-95 group/copy"
                title={copyTitle || "Copy to clipboard"}
                aria-label={copyTitle || "Copy to clipboard"}
              >
                {isCopied ? (
                  <>
                    <Check size={12} className="text-emerald-600 stroke-[2.5]" />
                    <span className="text-emerald-600 text-[10px] font-extrabold normal-case">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy size={12} className="opacity-75 group-hover/copy:opacity-100" />
                    <span className="text-[10px] font-bold">Copy</span>
                  </>
                )}
              </button>
            )}
            {onRemove && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onRemove();
                }}
                className="inline-flex items-center gap-1 px-2.5 py-1 bg-rose-50 hover:bg-rose-600 text-rose-600 hover:text-white text-[11px] font-bold rounded-lg border border-rose-200 hover:border-rose-600 transition-all cursor-pointer active:scale-95 shadow-2xs"
                title={removeTitle || "Remove"}
              >
                <Trash2 size={11} />
                <span>Remove</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
