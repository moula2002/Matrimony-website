import { useState, useEffect } from 'react';
import api, { getPhotoUrl } from '../api/axios';
import { LocationService } from '../api/locationService';
import { COUNTRY_PHONE_STANDARDS, validatePhoneNumber } from '../api/phoneStandards';
import {
  User, Mail, Phone, Calendar, Landmark, MapPin,
  GraduationCap, Briefcase, Heart, Edit2, Check, X, Camera, Plus, Trash2, LogOut, Users, Sliders,
  ChevronRight, Home, BookOpen, Activity, Info, Share2, Download, Sparkles, BadgeCheck
} from 'lucide-react';
import ShareModal from '../components/ShareModal';
import CallModal from '../components/CallModal';
import ContactInfoCard from '../components/ContactInfoCard';
import { getCachedUnlockedContacts, syncContactedProfiles } from '../utils/contactManager';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import loadingImg from '../assets/loading.png';

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
const ALL_COLLEGES = [
  'IIT Bombay', 'IIT Delhi', 'IIT Madras', 'BITS Pilani', 'NIT Trichy', 'IIM Ahmedabad', 'IIM Bangalore',
  'Delhi University (DU)', 'Harvard University', 'Stanford University', 'MIT', 'Oxford University', 'Other'
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
  { id: 'religion', label: 'Religion & Caste', iconName: 'Landmark', color: '#F9C74F', bg: 'bg-amber-50', text: 'text-amber-600' },
  { id: 'location', label: 'Location', iconName: 'MapPin', color: '#4895EF', bg: 'bg-blue-50', text: 'text-blue-500' },
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

function ChipSelector({ options, selected, onChange, title }) {
  const [search, setSearch] = useState('');
  const [showAll, setShowAll] = useState(false);

  const filtered = options.filter(opt => opt.toLowerCase().includes(search.toLowerCase()));
  const visible = showAll ? filtered : filtered.slice(0, 8);
  const hasMore = filtered.length > 8;

  return (
    <div className="space-y-3">
      {options.length > 8 && (
        <input
          type="text"
          placeholder={`Search ${title}...`}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-xs px-4 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5D34F7] focus:border-transparent bg-white shadow-sm"
        />
      )}
      <div className="flex flex-wrap gap-2">
        {visible.map(option => {
          const isSelected = selected.includes(option);
          return (
            <button
              key={option}
              type="button"
              onClick={() => {
                if (isSelected) {
                  onChange(selected.filter(x => x !== option));
                } else {
                  onChange([...selected, option]);
                }
              }}
              className={`px-4 py-2 rounded-xl border text-xs font-semibold transition-all duration-200 cursor-pointer ${
                isSelected
                  ? 'border-[#5D34F7] bg-[#5D34F7]/5 text-[#5D34F7] shadow-sm'
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

  // Edit states
  const [profileFor, setProfileFor] = useState('');
  const [fullName, setFullName] = useState('');
  const [dob, setDob] = useState('');
  const [gender, setGender] = useState('');
  const [religion, setReligion] = useState('');
  const [caste, setCaste] = useState('');
  const [subCommunity, setSubCommunity] = useState('');
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
    const photoUrl = p.photos?.[0] ? getPhotoUrl(p.photos[0]) : '';
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
              <p>Familiess Matrimony - UID: ${profData?.uid || 'N/A'}</p>
            </div>
            
            <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 30px;">
              <div style="flex: 1;">
                <div class="section-title" style="margin-top: 0;">Personal Details</div>
                <div class="info-grid">
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
        setHeight(p.height || '');
        setDiet(p.diet || '');
        setQualification(p.education || '');
        setCollege(p.college || '');
        setIncome(p.income || '');
        setWorkSector(p.workSector || '');
        setWorkRole(p.workRole || '');
        setCompany(p.companyName || '');
        setBio(p.bio || '');
        setPhotos(p.photos || []);
        setHobbies(p.hobbies || []);
        setMotherStatus(p.motherStatus || '');
        setFatherStatus(p.fatherStatus || '');
        setSistersCount(p.sistersCount || 0);
        setBrothersCount(p.brothersCount || 0);
        setLiveWithFamily(p.liveWithFamily !== undefined ? p.liveWithFamily : null);
        setFamilyFinancialStatus(p.familyFinancialStatus || '');
        setFamilyLocation(p.familyLocation || '');
        setTimeOfBirth(p.astrology?.timeOfBirth || '');
        setCityOfBirth(p.astrology?.cityOfBirth || '');

        const prefs = response.data.preferences || {};
        if (prefs.ageRange && prefs.ageRange.length === 2) {
          setPrefAgeMin(prefs.ageRange[0]);
          setPrefAgeMax(prefs.ageRange[1]);
        }
        setPrefGenders(prefs.gender || []);
        setPrefReligions(prefs.religion || []);
        setPrefCastes(prefs.caste || []);
        setPrefMaritalStatuses(prefs.maritalStatus || []);
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
          diet: prefDiets,
          subCommunity: prefSubCommunities,
          college: prefColleges,
          workSector: prefWorkSectors,
          familyFinancialStatus: prefFinancialStatuses,
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
  }, [location.state]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  // Build a unified profile payload from current state
  const buildProfilePayload = (overridePhotos) => {
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
    const nameParts = fullName.trim().split(/\s+/);
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';
    return {
      email: email.trim(),
      phone: `${countryCode} ${phone.trim()}`,
      profile: {
        profileFor,
        name: fullName.trim(),
        firstName,
        lastName,
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
        college,
        income,
        workSector,
        workRole,
        companyName: company,
        bio,
        photos: overridePhotos !== undefined ? overridePhotos : photos,
        hobbies,
        motherStatus,
        fatherStatus,
        sistersCount: Number(sistersCount) || 0,
        brothersCount: Number(brothersCount) || 0,
        liveWithFamily: liveWithFamily === true ? true : liveWithFamily === false ? false : undefined,
        familyFinancialStatus,
        familyLocation,
        maritalStatus,
        height,
        astrology: {
          timeOfBirth,
          cityOfBirth
        }
      }
    };
  };

  // Save full profile (used by Edit Mode Save button)
  const handleSave = async () => {
    setError('');
    const phoneErr = validatePhoneNumber(phone, countryCode);
    if (phoneErr) {
      setError(phoneErr);
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
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to update profile.');
    } finally {
      setIsSaving(false);
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

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <img src={loadingImg} alt="Loading..." className="h-16 w-16 object-contain animate-spin" />
      </div>
    );
  }

  const p = profile?.profile || {};

  // ========================
  // Edit Mode Category Panels
  // ========================
  const renderEditCategory = () => {
    const availableCastes = (() => {
      let c = [];
      (RELIGION_CASTES_MAP[religion] || []).forEach(x => c.push(x));
      return [...new Set(c)];
    })();
    const availableSubCommunities = (() => {
      let s = [];
      (CASTE_SUB_COMMUNITIES_MAP[caste] || []).forEach(x => s.push(x));
      return [...new Set(s)];
    })();
    const stateCities = INDIA_CITIES_BY_STATE[stateLoc] || ALL_LOCATIONS;

    switch (activeEditCategory) {
      case 'basic':
        return (
          <div className="space-y-5">
            <EditField label="Profile Created For">
              <select value={profileFor} onChange={e => setProfileFor(e.target.value)} className={selectCls}>
                <option value="">Select...</option>
                {['Myself', 'My Son', 'My Daughter', 'My Brother', 'My Sister', 'My Friend'].map(v => (
                  <option key={v} value={v}>{v}</option>
                ))}
              </select>
            </EditField>
            <EditField label="Full Name">
              <input type="text" value={fullName} onChange={e => setFullName(e.target.value)} className={inputCls} placeholder="Enter full name" />
            </EditField>
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
          </div>
        );

      case 'religion':
        return (
          <div className="space-y-5">
            <EditField label="Religion">
              <div className="flex flex-wrap gap-2">
                {ALL_RELIGIONS.map(r => (
                  <button key={r} type="button" onClick={() => { setReligion(r); setCaste(''); setSubCommunity(''); }}
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
                    <button key={c} type="button" onClick={() => { setCaste(c); setSubCommunity(''); }}
                      className={`px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${caste === c ? 'bg-[#5D34F7] text-white border-[#5D34F7]' : 'bg-white text-slate-600 border-slate-200 hover:border-[#5D34F7]/50'}`}>
                      {c}
                    </button>
                  ))}
                </div>
              </EditField>
            )}
            {caste && availableSubCommunities.length > 0 && (
              <EditField label="Sub-Community / Sect">
                <div className="flex flex-wrap gap-2">
                  {availableSubCommunities.map(s => (
                    <button key={s} type="button" onClick={() => setSubCommunity(s)}
                      className={`px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${subCommunity === s ? 'bg-[#5D34F7] text-white border-[#5D34F7]' : 'bg-white text-slate-600 border-slate-200 hover:border-[#5D34F7]/50'}`}>
                      {s}
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
            <EditField label="Sub-Community (manual)">
              <input type="text" value={subCommunity} onChange={e => setSubCommunity(e.target.value)} className={inputCls} placeholder="Enter sub-community or sect" />
            </EditField>
          </div>
        );

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
              <input type="text" value={college} onChange={e => setCollege(e.target.value)} className={inputCls} placeholder="e.g. IIT Bombay" />
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
                  <button key={ms} type="button" onClick={() => setMaritalStatus(ms)}
                    className={`px-4 py-2 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${maritalStatus === ms ? 'bg-[#4CC9F0] text-white border-[#4CC9F0]' : 'bg-white text-slate-600 border-slate-200 hover:border-[#4CC9F0]/50'}`}>
                    {ms}
                  </button>
                ))}
              </div>
            </EditField>
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
            {[
              { title: '🎨 Creative', items: ['Art', 'Painting', 'Music', 'Singing', 'Playing Instrument', 'Writing', 'Photography', 'Dancing', 'Acting', 'Cooking', 'Crafts'] },
              { title: '🎮 Fun', items: ['Movies', 'Gaming', 'Traveling', 'Comedy', 'Concerts', 'Dining Out', 'Watching Sports', 'Board Games', 'Socializing'] },
              { title: '💪 Fitness', items: ['Gym', 'Yoga', 'Running', 'Sports', 'Cycling', 'Swimming', 'Trekking', 'Martial Arts', 'Aerobics'] },
              { title: '📚 Other', items: ['Reading', 'Pets', 'Gardening', 'Volunteering', 'Blogging', 'Astrology', 'Tech/Gadgets', 'Podcasts'] }
            ].map(group => (
              <div key={group.title} className="space-y-2">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wide">{group.title}</h4>
                <div className="flex flex-wrap gap-2">
                  {group.items.map(item => {
                    const sel = hobbies.includes(item);
                    return (
                      <button key={item} type="button"
                        onClick={() => sel ? setHobbies(hobbies.filter(h => h !== item)) : setHobbies([...hobbies, item])}
                        className={`px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${sel ? 'bg-[#5D34F7] text-white border-[#5D34F7]' : 'bg-white text-slate-600 border-slate-200 hover:border-[#5D34F7]/40'}`}>
                        {item}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
            {hobbies.length > 0 && (
              <div className="pt-2 border-t border-slate-100">
                <p className="text-xs text-slate-500 font-medium mb-2">Selected ({hobbies.length})</p>
                <div className="flex flex-wrap gap-1.5">
                  {hobbies.map(h => (
                    <span key={h} className="px-3 py-1 bg-[#5D34F7]/10 text-[#5D34F7] text-xs font-semibold rounded-full">{h}</span>
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
            <div className="grid grid-cols-2 gap-4">
              <EditField label="Number of Sisters">
                <select value={sistersCount} onChange={e => setSistersCount(Number(e.target.value))} className={selectCls}>
                  {[0,1,2,3,4,5].map(n => <option key={n} value={n}>{n}</option>)}
                </select>
              </EditField>
              <EditField label="Number of Brothers">
                <select value={brothersCount} onChange={e => setBrothersCount(Number(e.target.value))} className={selectCls}>
                  {[0,1,2,3,4,5].map(n => <option key={n} value={n}>{n}</option>)}
                </select>
              </EditField>
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
            <EditField label="Time of Birth">
              <input type="time" value={timeOfBirth} onChange={e => setTimeOfBirth(e.target.value)} className={inputCls} />
              <p className="text-[10px] text-slate-400 mt-1">Required for Kundali matching features.</p>
            </EditField>
            <EditField label="City of Birth">
              <input type="text" value={cityOfBirth} onChange={e => setCityOfBirth(e.target.value)} className={inputCls} placeholder="e.g. Mumbai" />
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
              <span>My Profile & Preferences</span>
            </h1>
            <p className="text-slate-400 text-xs font-bold uppercase mt-1 tracking-wider">
              Manage your personal matrimony portfolio and search filters
            </p>
          </div>

          <div className="flex gap-2">
            {activeTab === 'profile' && (
              !isEditing ? (
                <>
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

      {/* Tabs Switcher */}
      <div className="max-w-7xl mx-auto lg:mx-0 lg:ml-6 xl:ml-10 px-4 mt-6 lg:px-8">
        <div className="bg-white rounded-3xl p-2 shadow-sm border border-slate-100 flex gap-1 w-full sm:w-fit">
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
            className={`px-6 py-3 rounded-2xl text-xs font-black tracking-wide uppercase transition-all duration-200 flex-1 sm:flex-initial cursor-pointer ${
              activeTab === 'preferences'
                ? 'bg-gradient-to-r from-[#5D34F7] to-[#4024DB] text-white shadow-md shadow-[#5D34F7]/15'
                : 'bg-transparent text-gray-600 hover:bg-slate-50 hover:text-slate-800'
            }`}
          >
            Partner Preferences
          </button>
        </div>
      </div>

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
                        <div className="w-12 h-12 rounded-xl overflow-hidden bg-[#5D34F7]/10 border-2 border-[#5D34F7]/20 flex-shrink-0 relative">
                          {p.photos && p.photos[0] ? (
                            <>
                              <img src={getPhotoUrl(p.photos[0])} alt="Avatar" className="w-full h-full object-cover" />
                              {((typeof p.photos[0] === 'string' || (typeof p.photos[0] === 'object' && p.photos[0].verificationStatus !== 'approved' && p.photos[0].approved !== true))) && (
                                <div className="absolute inset-0 bg-slate-900/50 flex items-center justify-center backdrop-blur-[1px]">
                                  <span className="bg-amber-500 text-white text-[6px] font-black px-1 py-0.5 rounded shadow-sm">PENDING</span>
                                </div>
                              )}
                            </>
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-[#5D34F7]">
                              <User size={22} />
                            </div>
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
                                const isPending = typeof url === 'string' || (typeof url === 'object' && url.verificationStatus !== 'approved' && url.approved !== true);
                                return (
                                <div key={index} className="relative w-20 h-24 rounded-xl overflow-hidden border border-gray-200">
                                  <img src={getPhotoUrl(url)} alt={`Gallery ${index}`} className="w-full h-full object-cover" />
                                  {isPending && (
                                    <div className="absolute inset-0 bg-slate-900/40 flex items-center justify-center backdrop-blur-[1px]">
                                      <span className="bg-amber-500 text-white text-[8px] font-black px-1.5 py-0.5 rounded shadow-sm text-center leading-tight">PENDING<br/>APPROVAL</span>
                                    </div>
                                  )}
                                  <button
                                    type="button"
                                    onClick={() => setPhotos(photos.filter((_, i) => i !== index))}
                                    className="absolute top-1 right-1 p-1 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors z-10"
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
                      <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="flex items-center gap-1.5 px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl text-sm font-extrabold hover:opacity-95 shadow-sm transition cursor-pointer disabled:opacity-50 active:scale-95"
                      >
                        <Check size={15} /> {isSaving ? 'Saving...' : 'Save All Changes'}
                      </button>
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

                {/* PROFILE HEADER & PHOTOS */}
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 space-y-6">
                  {/* Main Photo & Name */}
                  <div className="flex items-center gap-4">
                    {/* Avatar with direct upload overlay */}
                    <div className="relative w-24 h-24 rounded-2xl overflow-hidden bg-[#5D34F7]/10 border border-[#5D34F7]/20 flex-shrink-0 group">
                      {p.photos && p.photos[0] ? (
                        <>
                          <img src={getPhotoUrl(p.photos[0])} alt="Avatar" className="w-full h-full object-cover" />
                          {((typeof p.photos[0] === 'string' || (typeof p.photos[0] === 'object' && p.photos[0].verificationStatus !== 'approved' && p.photos[0].approved !== true))) && (
                            <div className="absolute inset-0 bg-slate-900/50 flex items-center justify-center backdrop-blur-[1px]">
                              <span className="bg-amber-500 text-white text-[8px] font-black px-1.5 py-0.5 rounded shadow-sm text-center leading-tight">PENDING<br/>APPROVAL</span>
                            </div>
                          )}
                        </>
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[#5D34F7]">
                          <User size={40} />
                        </div>
                      )}
                      {/* Camera overlay for direct upload */}
                      <div
                        onClick={() => document.getElementById('avatar-direct-upload').click()}
                        className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 cursor-pointer rounded-2xl"
                      >
                        <Camera size={20} className="text-white" />
                        <span className="text-white text-[9px] font-bold mt-1">Change</span>
                      </div>
                      <input
                        type="file"
                        id="avatar-direct-upload"
                        className="hidden"
                        accept="image/*"
                        onChange={async (e) => {
                          const file = e.target.files[0];
                          if (file) {
                            setIsSaving(true);
                            setError('');
                            try {
                              const uploadedNames = await uploadFiles([file]);
                              const newPhotos = [uploadedNames[0], ...photos.filter((_, i) => i !== 0)];
                              setPhotos(newPhotos);
                              await savePhotosDirectly(newPhotos);
                            } catch (err) {
                              setError(err.response?.data?.message || err.message || 'Failed to upload avatar.');
                            } finally {
                              setIsSaving(false);
                            }
                          }
                        }}
                      />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-gray-900 flex items-center gap-1.5">
                        {p.name || 'Anonymous User'}
                        {profile?.verificationStatus === 'approved' && <BadgeCheck size={18} className="text-blue-500" title="Verified Profile" />}
                      </h2>
                      <p className="text-sm text-gray-500 font-medium">UID: {profile?.uid || 'N/A'}</p>
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
                              ⭐ Featured Profile
                            </span>
                          )}
                        </div>
                        {!profile?.premiumMembership?.isPremium && (
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

                  {/* Photo Gallery with Direct Upload */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-bold text-gray-800 flex items-center gap-1.5">
                        <Camera size={18} className="text-[#5D34F7]" /> Profile Photos
                      </label>
                      {/* Always-visible Add Photo button */}
                      <button
                        type="button"
                        onClick={() => document.getElementById('gallery-direct-upload').click()}
                        disabled={isSaving}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-[#5D34F7]/10 text-[#5D34F7] rounded-lg text-xs font-bold hover:bg-[#5D34F7]/20 transition cursor-pointer disabled:opacity-50 active:scale-95"
                      >
                        <Plus size={13} />
                        {isSaving ? 'Saving...' : 'Add Photo'}
                      </button>
                      <input
                        type="file"
                        id="gallery-direct-upload"
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
                            const newPhotos = [...photos, ...uploadedNames];
                            setPhotos(newPhotos);
                            await savePhotosDirectly(newPhotos);
                          } catch (err) {
                            setError(err.response?.data?.message || err.message || 'Failed to upload images.');
                          } finally {
                            setIsSaving(false);
                          }
                        }}
                      />
                    </div>

                    <div className="flex flex-wrap gap-2.5">
                      {p.photos && p.photos.length > 0 ? (
                        p.photos.map((url, index) => {
                          const isPending = (typeof url === 'string' || (typeof url === 'object' && url.verificationStatus !== 'approved' && url.approved !== true));
                          return (
                          <div key={index} className="relative w-20 h-24 rounded-xl overflow-hidden border border-gray-200 group">
                            <img src={getPhotoUrl(url)} alt={`Gallery ${index}`} className="w-full h-full object-cover" />
                            {isPending && (
                               <div className="absolute inset-0 bg-slate-900/40 flex items-center justify-center backdrop-blur-[1px] pointer-events-none">
                                 <span className="bg-amber-500 text-white text-[8px] font-black px-1.5 py-0.5 rounded shadow-sm text-center leading-tight">PENDING<br/>APPROVAL</span>
                               </div>
                            )}
                            {/* Delete photo overlay */}
                            <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 rounded-xl z-10">
                              <button
                                type="button"
                                onClick={() => {
                                  const newPhotos = (p.photos || []).filter((_, i) => i !== index);
                                  setPhotos(newPhotos);
                                  savePhotosDirectly(newPhotos);
                                }}
                                className="p-1.5 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors"
                              >
                                <Trash2 size={12} />
                              </button>
                            </div>
                          </div>
                          );
                        })
                      ) : (
                        <div
                          onClick={() => document.getElementById('gallery-direct-upload').click()}
                          className="flex flex-col items-center justify-center w-full p-6 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50 hover:bg-slate-100 hover:border-[#5D34F7]/40 transition cursor-pointer text-center"
                        >
                          <Camera size={24} className="text-slate-300 mb-2" />
                          <p className="text-xs text-slate-400 font-semibold">Click to add your first photo</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* ABOUT ME / BIO */}
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 space-y-3 relative group">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-bold text-gray-800 flex items-center gap-1.5">
                      <Heart size={18} className="text-[#5D34F7]" /> About Me
                    </label>
                    <button onClick={() => { setIsEditing(true); setActiveEditCategory('basic'); }} className="text-slate-400 hover:text-[#5D34F7] hover:bg-[#5D34F7]/10 p-1.5 rounded-lg transition-colors cursor-pointer opacity-0 group-hover:opacity-100" title="Edit About Me">
                      <Edit2 size={16} />
                    </button>
                  </div>
                  <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-line">
                    {p.bio || 'Provide a description to tell others about yourself.'}
                  </p>
                </div>
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
                    <button onClick={() => { setIsEditing(true); setActiveEditCategory('basic'); }} className="text-slate-400 hover:text-[#5D34F7] hover:bg-[#5D34F7]/10 p-1.5 rounded-lg transition-colors cursor-pointer" title="Edit Personal Details">
                      <Edit2 size={16} />
                    </button>
                  </h3>
                  <div className="space-y-3">
                    <ProfileItem icon={<User size={16} />} label="Full Name" value={p.name} />
                    <ProfileItem icon={<Calendar size={16} />} label="Date of Birth" value={p.dob ? `${new Date(p.dob).toLocaleDateString()} (${p.age || 0} years)` : ''} />
                    <ProfileItem icon={<User size={16} />} label="Gender" value={p.gender} />
                    <ProfileItem icon={<Heart size={16} />} label="Marital Status" value={p.maritalStatus} />
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
                    <button onClick={() => { setIsEditing(true); setActiveEditCategory('religion'); }} className="text-slate-400 hover:text-[#5D34F7] hover:bg-[#5D34F7]/10 p-1.5 rounded-lg transition-colors cursor-pointer" title="Edit Religion & Community">
                      <Edit2 size={16} />
                    </button>
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
                    <button onClick={() => { setIsEditing(true); setActiveEditCategory('location'); }} className="text-slate-400 hover:text-[#5D34F7] hover:bg-[#5D34F7]/10 p-1.5 rounded-lg transition-colors cursor-pointer" title="Edit Location">
                      <Edit2 size={16} />
                    </button>
                  </h3>
                  <div className="space-y-3">
                    <ProfileItem icon={<MapPin size={16} />} label="City" value={p.city} />
                    <ProfileItem icon={<MapPin size={16} />} label="State" value={p.state} />
                    <ProfileItem icon={<MapPin size={16} />} label="Country" value={p.country || 'India'} />
                  </div>
                </div>

                {/* EDUCATION & CAREER */}
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 space-y-4">
                  <h3 className="text-sm font-extrabold text-slate-800 border-b border-slate-100 pb-3.5 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2050/svg">
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
                    <button onClick={() => { setIsEditing(true); setActiveEditCategory('education'); }} className="text-slate-400 hover:text-[#5D34F7] hover:bg-[#5D34F7]/10 p-1.5 rounded-lg transition-colors cursor-pointer" title="Edit Education & Career">
                      <Edit2 size={16} />
                    </button>
                  </h3>
                  <div className="space-y-3">
                    <ProfileItem icon={<GraduationCap size={16} />} label="Highest Qualification" value={p.education} />
                    <ProfileItem icon={<GraduationCap size={16} />} label="College/University" value={p.college} />
                    <ProfileItem icon={<Briefcase size={16} />} label="Work Sector" value={p.workSector} />
                    <ProfileItem icon={<Briefcase size={16} />} label="Profession" value={p.workRole} />
                    <ProfileItem icon={<Briefcase size={16} />} label="Company" value={p.companyName} />
                    <ProfileItem icon={<Briefcase size={16} />} label="Income" value={p.income} />
                  </div>
                </div>

                {/* HOBBIES & INTERESTS */}
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 space-y-4">
                  <h3 className="text-sm font-extrabold text-slate-800 border-b border-slate-100 pb-3.5 flex items-center justify-between">
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
                      <span>Hobbies & Interests</span>
                    </div>
                    <button onClick={() => { setIsEditing(true); setActiveEditCategory('hobbies'); }} className="text-slate-400 hover:text-[#5D34F7] hover:bg-[#5D34F7]/10 p-1.5 rounded-lg transition-colors cursor-pointer" title="Edit Hobbies">
                      <Edit2 size={16} />
                    </button>
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {p.hobbies && p.hobbies.length > 0 ? (
                      p.hobbies.map(hobby => (
                        <span key={hobby} className="px-3 py-1.5 bg-[#5D34F7]/5 text-[#5D34F7] text-xs font-semibold rounded-full border border-[#5D34F7]/10">
                          {hobby}
                        </span>
                      ))
                    ) : (
                      <p className="text-sm text-gray-400 italic">No hobbies added yet.</p>
                    )}
                  </div>
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
                    <button onClick={() => { setIsEditing(true); setActiveEditCategory('family'); }} className="text-slate-400 hover:text-[#5D34F7] hover:bg-[#5D34F7]/10 p-1.5 rounded-lg transition-colors cursor-pointer" title="Edit Family Details">
                      <Edit2 size={16} />
                    </button>
                  </h3>
                  <div className="space-y-3">
                    <ProfileItem icon={<User size={16} />} label="Mother's Status" value={p.motherStatus} />
                    <ProfileItem icon={<User size={16} />} label="Father's Status" value={p.fatherStatus} />
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
                    <button onClick={() => { setIsEditing(true); setActiveEditCategory('astrology'); }} className="text-slate-400 hover:text-[#5D34F7] hover:bg-[#5D34F7]/10 p-1.5 rounded-lg transition-colors cursor-pointer" title="Edit Astrology">
                      <Edit2 size={16} />
                    </button>
                  </h3>
                  <div className="space-y-3">
                    <ProfileItem icon={<Activity size={16} />} label="Time of Birth" value={p.astrology?.timeOfBirth} />
                    <ProfileItem icon={<MapPin size={16} />} label="City of Birth" value={p.astrology?.cityOfBirth} />
                    {p.astrology?.rashi && <ProfileItem icon={<Sparkles size={16} />} label="Rashi (Moon Sign)" value={p.astrology.rashi} />}
                    {p.astrology?.nakshatra && <ProfileItem icon={<Sparkles size={16} />} label="Nakshatra" value={p.astrology.nakshatra} />}
                    {p.astrology?.manglik !== undefined && <ProfileItem icon={<Sparkles size={16} />} label="Manglik" value={p.astrology.manglik ? 'Yes' : 'No'} />}
                  </div>
                </div>

                {/* CONTACT DETAILS */}
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 space-y-4">
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
                {profile?.preferences && (
                  <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 space-y-4">
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
                        <button onClick={() => setActiveTab('preferences')} className="text-slate-400 hover:text-[#5D34F7] hover:bg-[#5D34F7]/10 p-1.5 rounded-lg transition-colors cursor-pointer" title="Edit Preferences">
                          <Edit2 size={16} />
                        </button>
                      )}
                    </h3>
                    <div className="space-y-4">
                      {profile.preferences.ageRange && profile.preferences.ageRange.length === 2 && (
                        <ProfileItem icon={<Users size={16} />} label="Age Range" value={`${profile.preferences.ageRange[0]} - ${profile.preferences.ageRange[1]} years`} />
                      )}
                      
                      {profile.preferences.height && profile.preferences.height.length > 0 && (
                        <ProfileItem icon={<Users size={16} />} label="Height Range" value={`${profile.preferences.height[0].split(' (')[0]} to ${profile.preferences.height[profile.preferences.height.length - 1].split(' (')[0]}`} />
                      )}

                      {['gender', 'maritalStatus', 'diet', 'religion', 'caste', 'subCommunity', 'location', 'education', 'college', 'workSector', 'profession', 'income', 'familyFinancialStatus'].map((prefKey) => {
                        const vals = profile.preferences[prefKey];
                        if (!vals || vals.length === 0) return null;
                        const labels = {
                          gender: "Gender", maritalStatus: "Marital Status", diet: "Diet", religion: "Religion", caste: "Caste", subCommunity: "Sub-community", location: "Location", education: "Education", college: "College", workSector: "Work Sector", profession: "Profession", income: "Income", familyFinancialStatus: "Family Financial Status"
                        };
                        return (
                          <div key={prefKey} className="flex flex-col gap-1.5">
                            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5"><Heart size={12} className="text-[#5D34F7]" /> {labels[prefKey]}</span>
                            <div className="flex flex-wrap gap-1.5">
                              {vals.map(v => (
                                <span key={v} className="px-2.5 py-1 bg-[#5D34F7]/5 text-[#5D34F7] text-xs font-semibold rounded-lg border border-[#5D34F7]/10">
                                  {v}
                                </span>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

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

            <div className="pt-6 border-t border-gray-100 flex justify-end">
              <button
                onClick={handleSavePreferences}
                disabled={isSaving}
                className="px-8 py-3 bg-[#5D34F7] text-white rounded-xl text-sm font-bold shadow-md hover:bg-[#4024DB] transition-all cursor-pointer disabled:opacity-50"
              >
                {isSaving ? 'Saving...' : 'Save Preferences'}
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
    </div>
  );
}

function ProfileItem({ icon, label, value, isPhone, onClick }) {
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
        <div className="flex items-center gap-2">
          <span className={`block text-sm text-gray-800 font-bold break-words leading-tight ${onClick ? 'group-hover/item:text-[#5D34F7] transition-colors' : ''}`}>
            {value}
          </span>
          {isPhone && value && (
            <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-600 text-[10px] font-black uppercase rounded-lg border border-emerald-500/20 tracking-wider flex items-center gap-1 group-hover/item:bg-emerald-500 group-hover/item:text-white transition-colors">
              Tap to call
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
