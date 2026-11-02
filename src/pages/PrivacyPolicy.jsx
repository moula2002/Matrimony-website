import { useNavigate } from 'react-router-dom';
import { 
  Shield, 
  Lock, 
  Eye, 
  Database, 
  UserCheck, 
  FileText, 
  Trash2, 
  Mail, 
  Phone, 
  MapPin, 
  ArrowLeft, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle, 
  Cookie 
} from 'lucide-react';
import navbarLogo from '../assets/navbar_logo.png';
import navbarName from '../assets/navbar_name.png';

export default function PrivacyPolicy() {
  const navigate = useNavigate();
  const isLoggedRoute = window.location.pathname.startsWith('/legal');

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate(isLoggedRoute ? '/profile' : '/');
    }
  };

  const sections = [
    { id: 'collection', title: '1. Information We Collect' },
    { id: 'usage', title: '2. How We Use Your Information' },
    { id: 'photos', title: '3. Photo & Identity Document Protection' },
    { id: 'sharing', title: '4. Non-Disclosure & Advertising Policy' },
    { id: 'security', title: '5. Data Security & Storage Encryption' },
    { id: 'cookies', title: '6. Cookies & Tracking Technologies' },
    { id: 'controls', title: '7. Member Privacy Controls & Visibility' },
    { id: 'deletion', title: '8. Data Retention & Account Deletion Rights' },
    { id: 'updates', title: '9. Updates to this Privacy Policy' },
    { id: 'grievance', title: '10. Grievance Officer & Privacy Contact' },
  ];

  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className={`min-h-screen ${isLoggedRoute ? 'bg-transparent' : 'bg-slate-50'} flex flex-col font-sans text-slate-800`}>
      {/* Public Header (only shown if not inside authenticated layout) */}
      {!isLoggedRoute && (
        <header className="bg-white/90 backdrop-blur-md border-b border-slate-200/80 sticky top-0 z-40 shadow-xs">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
            <div 
              onClick={() => navigate('/')} 
              className="flex items-center gap-2.5 cursor-pointer hover:opacity-90 transition"
            >
              <img src={navbarLogo} alt="Familiess Matrimony" className="h-9 w-9 object-contain" />
              <img src={navbarName} alt="Familiess Matrimony" className="h-6 object-contain hidden sm:block" />
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate('/terms-conditions')}
                className="text-xs sm:text-sm font-bold text-slate-600 hover:text-[#5D34F7] px-3 py-1.5 rounded-lg transition"
              >
                Terms & Conditions
              </button>
              <button
                onClick={() => navigate('/login')}
                className="text-xs sm:text-sm font-bold px-4 py-2 bg-gradient-to-r from-[#5D34F7] to-[#4024DB] text-white rounded-xl hover:opacity-95 shadow-xs transition"
              >
                Sign In
              </button>
            </div>
          </div>
        </header>
      )}

      {/* Main Content Area */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-10">
        <div className="bg-white rounded-3xl p-6 sm:p-12 shadow-sm border border-slate-200/70 space-y-8 animate-in fade-in duration-300">
          
          {/* Navigation Bar & Policy Switcher */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
            <button
              onClick={handleBack}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-[#5D34F7] hover:text-white text-slate-700 text-xs font-black uppercase tracking-wider transition duration-200 cursor-pointer w-fit"
              title="Go Back"
            >
              <ArrowLeft size={14} /> Back
            </button>

            <button
              onClick={() => navigate(isLoggedRoute ? '/legal/terms-conditions' : '/terms-conditions')}
              className="inline-flex items-center gap-2 text-xs font-bold text-[#5D34F7] hover:text-[#4024DB] hover:underline transition self-start sm:self-auto cursor-pointer"
            >
              <FileText size={14} /> View Terms & Conditions &rarr;
            </button>
          </div>

          {/* Page Title & Meta */}
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-extrabold uppercase tracking-wider">
              <ShieldCheck size={14} /> Data Protection & Confidentiality
            </div>
            <h1 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
              Privacy Policy
            </h1>
            <p className="text-slate-500 text-xs sm:text-sm font-medium">
              Effective Date: October 2026 • Last Reviewed: October 30, 2026
            </p>
          </div>

          {/* Introduction Card */}
          <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-emerald-50/70 via-teal-50/50 to-blue-50/70 border border-emerald-100 text-slate-700 text-sm leading-relaxed font-medium">
            <p>
              At <strong className="text-slate-900">Familiess Matrimony</strong>, we recognize that finding a life partner is a deeply sacred and personal journey. Safeguarding your personal details, photographs, and privacy rights is our foundational priority. This Privacy Policy details how we collect, use, protect, and handle your information in accordance with prevailing data privacy laws.
            </p>
          </div>

          {/* Quick Table of Contents */}
          <div className="bg-slate-50 p-5 sm:p-6 rounded-2xl border border-slate-100">
            <h2 className="text-xs font-black uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-2">
              <FileText size={14} className="text-[#5D34F7]" /> Quick Navigation
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-bold text-[#5D34F7]">
              {sections.map((sec) => (
                <button
                  key={sec.id}
                  onClick={() => scrollToSection(sec.id)}
                  className="text-left py-1.5 px-2 rounded-lg hover:bg-white hover:shadow-2xs text-slate-700 hover:text-[#5D34F7] transition truncate cursor-pointer"
                >
                  {sec.title}
                </button>
              ))}
            </div>
          </div>

          {/* Structured Policy Sections */}
          <div className="space-y-8 text-slate-700 leading-relaxed font-medium text-sm">
            
            {/* Section 1 */}
            <section id="collection" className="space-y-3 bg-slate-50/70 p-6 rounded-2xl border border-slate-100">
              <h3 className="font-extrabold text-slate-900 text-base sm:text-lg flex items-center gap-2.5">
                <span className="w-8 h-8 rounded-xl bg-purple-100 text-[#5D34F7] flex items-center justify-center shrink-0">
                  <Database size={18} />
                </span>
                1. Information We Collect
              </h3>
              <div className="text-xs sm:text-sm text-slate-650 space-y-2.5 pl-1">
                <p>
                  To provide accurate matchmaking services and verified connections, we collect the following types of information:
                </p>
                <ul className="list-disc list-inside space-y-1.5 text-slate-600 pl-2">
                  <li><strong>Personal Identification:</strong> Full name, gender, date of birth, time of birth, place of birth/city, marital status, and profile creator relation.</li>
                  <li><strong>Contact Details:</strong> Verified email address and mobile phone number for authentication and service alerts.</li>
                  <li><strong>Community & Astrology:</strong> Religion, mother tongue/community, sub-caste/gothra, horoscope details, and astrological preferences.</li>
                  <li><strong>Education & Career:</strong> Highest degree, college/university, current profession, employment sector, and annual income bracket.</li>
                  <li><strong>Family Background:</strong> Father's profession, mother's profession, family type, family values, and sibling details.</li>
                  <li><strong>Photographs & Verification Documents:</strong> Profile photos, selfie pictures, and government ID documentation uploaded strictly for identity badge verification.</li>
                  <li><strong>Partner Preferences:</strong> Desired age range, height, religion, education, occupation, location, and lifestyle preferences.</li>
                </ul>
              </div>
            </section>

            {/* Section 2 */}
            <section id="usage" className="space-y-3 bg-slate-50/70 p-6 rounded-2xl border border-slate-100">
              <h3 className="font-extrabold text-slate-900 text-base sm:text-lg flex items-center gap-2.5">
                <span className="w-8 h-8 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                  <UserCheck size={18} />
                </span>
                2. How We Use Your Information
              </h3>
              <div className="text-xs sm:text-sm text-slate-650 space-y-2.5 pl-1">
                <p>
                  Your information is utilized solely to deliver, enhance, and secure our matrimonial matchmaking services:
                </p>
                <ul className="list-disc list-inside space-y-1.5 text-slate-600 pl-2">
                  <li>Generating relevant partner recommendations based on mutual preferences and astrological compatibility.</li>
                  <li>Displaying your matrimonial profile to other registered members who meet your criteria.</li>
                  <li>Verifying user authenticity through selfie and ID checks to prevent impersonation and fraud.</li>
                  <li>Sending real-time notifications for connection requests, chat messages, and profile views.</li>
                  <li>Providing customer support and resolving technical issues or member complaints.</li>
                </ul>
              </div>
            </section>

            {/* Section 3 */}
            <section id="photos" className="space-y-3 bg-slate-50/70 p-6 rounded-2xl border border-slate-100">
              <h3 className="font-extrabold text-slate-900 text-base sm:text-lg flex items-center gap-2.5">
                <span className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                  <Lock size={18} />
                </span>
                3. Photo & Identity Document Protection
              </h3>
              <div className="text-xs sm:text-sm text-slate-650 space-y-2.5 pl-1">
                <p>
                  We understand that portrait photographs and identity documents require the highest level of confidentiality:
                </p>
                <ul className="list-disc list-inside space-y-1.5 text-slate-600 pl-2">
                  <li><strong>Anti-Download Safeguards:</strong> We implement modern frontend and backend safeguards to block direct right-click downloads and deter screenshot capture.</li>
                  <li><strong>Government ID Confidentiality:</strong> Government identity cards (Aadhaar, Passport, PAN, Voter ID) uploaded for badge verification are accessible only to authorized verification officers and are <strong>never</strong> displayed to other members or public visitors.</li>
                  <li><strong>Selfie Authentication:</strong> Live selfie photographs are used strictly to verify that the profile holder matches their uploaded images.</li>
                </ul>
              </div>
            </section>

            {/* Section 4 */}
            <section id="sharing" className="space-y-3 bg-slate-50/70 p-6 rounded-2xl border border-slate-100">
              <h3 className="font-extrabold text-slate-900 text-base sm:text-lg flex items-center gap-2.5">
                <span className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
                  <Eye size={18} />
                </span>
                4. Non-Disclosure & Zero Advertising Sharing
              </h3>
              <div className="text-xs sm:text-sm text-slate-650 space-y-2.5 pl-1">
                <p>
                  We maintain a strict zero-tolerance policy against commercializing user personal data:
                </p>
                <ul className="list-disc list-inside space-y-1.5 text-slate-600 pl-2">
                  <li>We <strong>do not sell, rent, lease, or trade</strong> your personal contact information (email, phone number) to third-party advertisers, data brokers, or marketing agencies.</li>
                  <li>Your contact number is revealed to other members only when mutual interest is established or as permitted by your explicit privacy settings and subscription entitlements.</li>
                  <li>We share data only with certified service providers (such as cloud hosting and SMS/email gateway partners) bound by stringent confidentiality agreements.</li>
                </ul>
              </div>
            </section>

            {/* Section 5 */}
            <section id="security" className="space-y-3 bg-slate-50/70 p-6 rounded-2xl border border-slate-100">
              <h3 className="font-extrabold text-slate-900 text-base sm:text-lg flex items-center gap-2.5">
                <span className="w-8 h-8 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                  <Shield size={18} />
                </span>
                5. Data Security & Storage Encryption
              </h3>
              <div className="text-xs sm:text-sm text-slate-650 space-y-2.5 pl-1">
                <p>
                  We apply bank-grade security protocols to protect your personal information from unauthorized access, alteration, or disclosure:
                </p>
                <ul className="list-disc list-inside space-y-1.5 text-slate-600 pl-2">
                  <li><strong>Encryption in Transit:</strong> All communication between your browser and our servers is secured using modern TLS 1.3 encryption.</li>
                  <li><strong>Encryption at Rest:</strong> Sensitive profile attributes and verification documents are stored in encrypted databases behind multi-layer firewalls.</li>
                  <li><strong>Strict Access Controls:</strong> Employee access to user records is restricted strictly on a need-to-know basis and audited continuously.</li>
                </ul>
              </div>
            </section>

            {/* Section 6 */}
            <section id="cookies" className="space-y-3 bg-slate-50/70 p-6 rounded-2xl border border-slate-100">
              <h3 className="font-extrabold text-slate-900 text-base sm:text-lg flex items-center gap-2.5">
                <span className="w-8 h-8 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
                  <Cookie size={18} />
                </span>
                6. Cookies & Tracking Technologies
              </h3>
              <div className="text-xs sm:text-sm text-slate-650 space-y-2.5 pl-1">
                <p>
                  Familiess Matrimony uses essential cookies and local storage items to maintain session state:
                </p>
                <ul className="list-disc list-inside space-y-1.5 text-slate-600 pl-2">
                  <li><strong>Session Persistence:</strong> Keeping you securely logged into your account as you navigate between pages.</li>
                  <li><strong>Preference Storage:</strong> Saving your display preferences and filter settings to deliver a seamless user experience.</li>
                  <li>You may adjust your browser settings to decline cookies, although doing so may restrict access to authenticated matchmaking features.</li>
                </ul>
              </div>
            </section>

            {/* Section 7 */}
            <section id="controls" className="space-y-3 bg-slate-50/70 p-6 rounded-2xl border border-slate-100">
              <h3 className="font-extrabold text-slate-900 text-base sm:text-lg flex items-center gap-2.5">
                <span className="w-8 h-8 rounded-xl bg-violet-100 text-[#5D34F7] flex items-center justify-center shrink-0">
                  <CheckCircle2 size={18} />
                </span>
                7. Member Privacy Controls & Profile Visibility
              </h3>
              <div className="text-xs sm:text-sm text-slate-650 space-y-2.5 pl-1">
                <p>
                  You retain full control over your profile visibility and communication preferences at all times:
                </p>
                <ul className="list-disc list-inside space-y-1.5 text-slate-600 pl-2">
                  <li><strong>Edit Information:</strong> Update personal, educational, family, or partner preference details directly via the <em>My Profile</em> screen.</li>
                  <li><strong>Photo Visibility:</strong> Choose whether your photographs are viewable by all members or only by accepted connections.</li>
                  <li><strong>Block & Report:</strong> Instantly block members or report unwanted interactions to safeguard your peace of mind.</li>
                </ul>
              </div>
            </section>

            {/* Section 8 */}
            <section id="deletion" className="space-y-3 bg-slate-50/70 p-6 rounded-2xl border border-slate-100">
              <h3 className="font-extrabold text-slate-900 text-base sm:text-lg flex items-center gap-2.5">
                <span className="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
                  <Trash2 size={18} />
                </span>
                8. Data Retention & Account Deletion Rights
              </h3>
              <div className="text-xs sm:text-sm text-slate-650 space-y-2.5 pl-1">
                <p>
                  We retain your profile data only as long as your account remains active and necessary for matchmaking purposes:
                </p>
                <ul className="list-disc list-inside space-y-1.5 text-slate-600 pl-2">
                  <li>Once you find your partner or wish to leave the platform, you can delete or deactivate your profile through Settings or by contacting customer support.</li>
                  <li>Upon deletion, your profile is immediately taken offline and made invisible to all members.</li>
                  <li>Certain billing and audit logs may be retained in cold storage for the statutory retention period required by financial and tax regulations.</li>
                </ul>
              </div>
            </section>

            {/* Section 9 */}
            <section id="updates" className="space-y-3 bg-slate-50/70 p-6 rounded-2xl border border-slate-100">
              <h3 className="font-extrabold text-slate-900 text-base sm:text-lg flex items-center gap-2.5">
                <span className="w-8 h-8 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                  <AlertCircle size={18} />
                </span>
                9. Updates to this Privacy Policy
              </h3>
              <div className="text-xs sm:text-sm text-slate-650 space-y-2 pl-1">
                <p>
                  We may periodically update this policy to reflect changes in our data practices or legal requirements. When material updates are made, we will notify members via prominent website announcements or email notifications before changes take effect.
                </p>
              </div>
            </section>

            {/* Section 10 */}
            <section id="grievance" className="space-y-4 bg-slate-50 p-6 rounded-2xl border border-slate-200/80">
              <h3 className="font-extrabold text-slate-900 text-base sm:text-lg flex items-center gap-2.5">
                <span className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                  <ShieldCheck size={18} />
                </span>
                10. Grievance Officer & Privacy Contact
              </h3>
              <p className="text-xs sm:text-sm text-slate-650">
                If you have questions regarding this Privacy Policy, your personal data, or wish to exercise your data subject rights, please reach out to our dedicated Grievance Officer:
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs font-semibold text-slate-700">
                <div className="p-3.5 bg-white rounded-xl border border-slate-200/60 shadow-2xs">
                  <div className="flex items-center gap-2 text-emerald-600 font-bold mb-1">
                    <Mail size={14} /> Privacy Desk Email
                  </div>
                  <p className="text-slate-600 font-medium">privacy@familiessmatrimony.com</p>
                </div>

                <div className="p-3.5 bg-white rounded-xl border border-slate-200/60 shadow-2xs">
                  <div className="flex items-center gap-2 text-emerald-600 font-bold mb-1">
                    <Phone size={14} /> Helpline Number
                  </div>
                  <p className="text-slate-600 font-medium">1800-419-6000 (9 AM – 7 PM)</p>
                </div>

                <div className="p-3.5 bg-white rounded-xl border border-slate-200/60 shadow-2xs">
                  <div className="flex items-center gap-2 text-emerald-600 font-bold mb-1">
                    <MapPin size={14} /> Registered Address
                  </div>
                  <p className="text-slate-600 font-medium">Familiess Towers, BKC, Mumbai 400051</p>
                </div>
              </div>
            </section>

          </div>

          {/* Bottom Back Button & Switch to Terms */}
          <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <button
              onClick={handleBack}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition duration-200 cursor-pointer"
            >
              <ArrowLeft size={16} /> Back to Previous Screen
            </button>
            <button
              onClick={() => navigate(isLoggedRoute ? '/legal/terms-conditions' : '/terms-conditions')}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#5D34F7] hover:bg-[#4024DB] text-white text-xs font-bold shadow-xs hover:shadow transition duration-200 cursor-pointer"
            >
              <FileText size={16} /> Read Terms & Conditions
            </button>
          </div>

        </div>
      </main>

      {/* Simple Public Footer */}
      {!isLoggedRoute && (
        <footer className="bg-slate-900 py-8 text-center text-xs text-gray-400 border-t border-slate-800 space-y-3">
          <div className="flex justify-center items-center gap-6 text-slate-400 font-semibold">
            <button onClick={() => navigate('/')} className="hover:text-white transition cursor-pointer">Home</button>
            <button onClick={() => navigate('/privacy-policy')} className="text-white font-bold cursor-pointer">Privacy Policy</button>
            <button onClick={() => navigate('/terms-conditions')} className="hover:text-white transition cursor-pointer">Terms & Conditions</button>
            <button onClick={() => navigate('/contact-us')} className="hover:text-white transition cursor-pointer">Contact Us</button>
          </div>
          <p>© 2026 Familiess Matrimony. All Rights Reserved.</p>
        </footer>
      )}
    </div>
  );
}
