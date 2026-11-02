import { useNavigate } from 'react-router-dom';
import { 
  Scale, 
  UserCheck, 
  Award, 
  ShieldCheck, 
  AlertTriangle, 
  CreditCard, 
  FileText, 
  Lock, 
  Mail, 
  Phone, 
  MapPin, 
  ArrowLeft, 
  CheckCircle2, 
  ExternalLink 
} from 'lucide-react';
import navbarLogo from '../assets/navbar_logo.png';
import navbarName from '../assets/navbar_name.png';

export default function TermsConditions() {
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
    { id: 'eligibility', title: '1. Eligibility & Age Requirements' },
    { id: 'authenticity', title: '2. Profile Authenticity & Account Registration' },
    { id: 'conduct', title: '3. Member Code of Conduct & Communication' },
    { id: 'photos', title: '4. Photo & Content Guidelines' },
    { id: 'membership', title: '5. Premium Membership, Subscriptions & Billing' },
    { id: 'safety', title: '6. Safety, Verification & Anti-Fraud Measures' },
    { id: 'intellectual-property', title: '7. Intellectual Property & License' },
    { id: 'termination', title: '8. Account Suspension & Termination' },
    { id: 'disclaimer', title: '9. Disclaimers & Limitation of Liability' },
    { id: 'grievance', title: '10. Grievance Officer & Contact Information' },
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
                onClick={() => navigate('/privacy-policy')}
                className="text-xs sm:text-sm font-bold text-slate-600 hover:text-[#5D34F7] px-3 py-1.5 rounded-lg transition"
              >
                Privacy Policy
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
              onClick={() => navigate(isLoggedRoute ? '/legal/privacy-policy' : '/privacy-policy')}
              className="inline-flex items-center gap-2 text-xs font-bold text-[#5D34F7] hover:text-[#4024DB] hover:underline transition self-start sm:self-auto cursor-pointer"
            >
              <Lock size={14} /> View Privacy Policy &rarr;
            </button>
          </div>

          {/* Page Title & Meta */}
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#5D34F7]/10 text-[#5D34F7] text-xs font-extrabold uppercase tracking-wider">
              <Scale size={14} /> User Agreement
            </div>
            <h1 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
              Terms & Conditions
            </h1>
            <p className="text-slate-500 text-xs sm:text-sm font-medium">
              Effective Date: October 2026 • Last Reviewed: October 30, 2026
            </p>
          </div>

          {/* Introduction Card */}
          <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-purple-50/70 via-indigo-50/50 to-blue-50/70 border border-purple-100 text-slate-700 text-sm leading-relaxed font-medium">
            <p>
              Welcome to <strong className="text-slate-900">Familiess Matrimony</strong>. These Terms and Conditions constitute a legally binding agreement between you and Familiess Matrimony. By registering an account, accessing, or using our matchmaking services, you confirm that you have read, understood, and agreed to be bound by these terms. If you do not agree with any part of these terms, please do not use our services.
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
            <section id="eligibility" className="space-y-3 bg-slate-50/70 p-6 rounded-2xl border border-slate-100">
              <h3 className="font-extrabold text-slate-900 text-base sm:text-lg flex items-center gap-2.5">
                <span className="w-8 h-8 rounded-xl bg-purple-100 text-[#5D34F7] flex items-center justify-center shrink-0">
                  <Scale size={18} />
                </span>
                1. Eligibility & Age Requirements
              </h3>
              <div className="text-xs sm:text-sm text-slate-650 space-y-2.5 pl-1">
                <p>
                  To register as a member or access matchmaking features on Familiess Matrimony, you must satisfy the following legal criteria:
                </p>
                <ul className="list-disc list-inside space-y-1.5 text-slate-600 pl-2">
                  <li>You must be of legal marriageable age as per your local jurisdiction laws (minimum <strong>18 years</strong> for females and <strong>21 years</strong> for males in India).</li>
                  <li>You must be legally competent to enter into a valid marriage contract under the applicable personal or civil laws.</li>
                  <li>You must be currently single, legally divorced, or widowed. Persons currently married are strictly not permitted to register.</li>
                  <li>Registration is intended solely for genuine matrimonial matchmaking and not for casual dating, commercial exploitation, or escort services.</li>
                </ul>
              </div>
            </section>

            {/* Section 2 */}
            <section id="authenticity" className="space-y-3 bg-slate-50/70 p-6 rounded-2xl border border-slate-100">
              <h3 className="font-extrabold text-slate-900 text-base sm:text-lg flex items-center gap-2.5">
                <span className="w-8 h-8 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                  <UserCheck size={18} />
                </span>
                2. Profile Authenticity & Account Registration
              </h3>
              <div className="text-xs sm:text-sm text-slate-650 space-y-2.5 pl-1">
                <p>
                  You agree to provide true, accurate, current, and complete information during onboarding and profile editing.
                </p>
                <ul className="list-disc list-inside space-y-1.5 text-slate-600 pl-2">
                  <li>Creating profiles with fictitious names, fraudulent identities, or impersonating another individual is strictly prohibited.</li>
                  <li>You are solely responsible for maintaining the confidentiality of your login credentials and for all activities conducted through your account.</li>
                  <li>You agree to promptly update your personal details, marital status, or educational and occupational credentials should any changes occur.</li>
                  <li>Familiess Matrimony reserves the right to verify credentials through identity documentation and suspend accounts with falsified data.</li>
                </ul>
              </div>
            </section>

            {/* Section 3 */}
            <section id="conduct" className="space-y-3 bg-slate-50/70 p-6 rounded-2xl border border-slate-100">
              <h3 className="font-extrabold text-slate-900 text-base sm:text-lg flex items-center gap-2.5">
                <span className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                  <Award size={18} />
                </span>
                3. Member Code of Conduct & Communication
              </h3>
              <div className="text-xs sm:text-sm text-slate-650 space-y-2.5 pl-1">
                <p>
                  Members must engage with other connections in a respectful, courteous, and polite manner at all times. The following behaviors are strictly prohibited and will lead to immediate account termination:
                </p>
                <ul className="list-disc list-inside space-y-1.5 text-slate-600 pl-2">
                  <li>Harassment, stalking, abusive language, hate speech, or defamatory remarks.</li>
                  <li>Sending unsolicited commercial messages, promotional spam, or multi-level marketing links.</li>
                  <li>Requesting financial assistance, soliciting loans, or conducting monetary transactions with other members.</li>
                  <li>Sharing sexually explicit, obscene, pornographic, or offensive content via chat, video calls, or profile bio.</li>
                </ul>
              </div>
            </section>

            {/* Section 4 */}
            <section id="photos" className="space-y-3 bg-slate-50/70 p-6 rounded-2xl border border-slate-100">
              <h3 className="font-extrabold text-slate-900 text-base sm:text-lg flex items-center gap-2.5">
                <span className="w-8 h-8 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
                  <CheckCircle2 size={18} />
                </span>
                4. Photo & Content Guidelines
              </h3>
              <div className="text-xs sm:text-sm text-slate-650 space-y-2.5 pl-1">
                <p>
                  Uploaded photographs must be clear, authentic representations of the profile holder.
                </p>
                <ul className="list-disc list-inside space-y-1.5 text-slate-600 pl-2">
                  <li>Profile pictures must clearly show your face. Group photos, cartoon avatars, celebrity pictures, or scenery as primary images are not permitted.</li>
                  <li>You must own the rights to any photos or documents you upload to the platform.</li>
                  <li>Familiess Matrimony implements technical safeguards to deter unauthorized downloading and screenshot capture of photos.</li>
                </ul>
              </div>
            </section>

            {/* Section 5 */}
            <section id="membership" className="space-y-3 bg-slate-50/70 p-6 rounded-2xl border border-slate-100">
              <h3 className="font-extrabold text-slate-900 text-base sm:text-lg flex items-center gap-2.5">
                <span className="w-8 h-8 rounded-xl bg-violet-100 text-[#5D34F7] flex items-center justify-center shrink-0">
                  <CreditCard size={18} />
                </span>
                5. Premium Membership, Subscriptions & Billing
              </h3>
              <div className="text-xs sm:text-sm text-slate-650 space-y-2.5 pl-1">
                <p>
                  Familiess Matrimony offers both free and premium subscription tiers with advanced matchmaking features, contact unlocking, and video calling.
                </p>
                <ul className="list-disc list-inside space-y-1.5 text-slate-600 pl-2">
                  <li>Membership plans, benefits, and pricing are clearly displayed on our Membership Plans page prior to purchase.</li>
                  <li>Payments are processed securely through certified payment gateways. We do not store complete credit card or debit card numbers on our servers.</li>
                  <li>Subscription fees are non-refundable once the plan has been activated or contacts/messages have been utilized.</li>
                  <li>Memberships are non-transferable and can only be used by the registered individual.</li>
                </ul>
              </div>
            </section>

            {/* Section 6 - Safety Alert Callout */}
            <section id="safety" className="space-y-3 bg-rose-50/60 p-6 rounded-2xl border border-rose-150">
              <h3 className="font-extrabold text-rose-900 text-base sm:text-lg flex items-center gap-2.5">
                <span className="w-8 h-8 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                  <ShieldCheck size={18} />
                </span>
                6. Safety, Verification & Anti-Fraud Measures
              </h3>
              <div className="text-xs sm:text-sm text-rose-950 space-y-2.5 pl-1">
                <div className="p-3.5 bg-white/80 rounded-xl border border-rose-200/80 flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                  <p className="text-xs text-rose-800 font-bold leading-relaxed">
                    CRITICAL SAFETY WARNING: Never send money, cryptocurrency, bank transfers, or OTP passwords to anyone you meet online, regardless of the reason or emergency claimed. Report suspicious individuals immediately.
                  </p>
                </div>
                <p>
                  While Familiess Matrimony employs document verification and selfie authentication to enhance safety, members must exercise due diligence, meet in public venues, and involve their families before making marital commitments.
                </p>
              </div>
            </section>

            {/* Section 7 */}
            <section id="intellectual-property" className="space-y-3 bg-slate-50/70 p-6 rounded-2xl border border-slate-100">
              <h3 className="font-extrabold text-slate-900 text-base sm:text-lg flex items-center gap-2.5">
                <span className="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
                  <Lock size={18} />
                </span>
                7. Intellectual Property & License
              </h3>
              <div className="text-xs sm:text-sm text-slate-650 space-y-2.5 pl-1">
                <p>
                  All content, branding, trademarks, logos, graphical designs, software, algorithms, and interface elements on Familiess Matrimony are the exclusive intellectual property of Familiess Matrimony or its licensors.
                </p>
                <p>
                  You are granted a limited, non-exclusive, non-transferable, revocable license to access the platform strictly for personal, non-commercial matrimonial matchmaking purposes.
                </p>
              </div>
            </section>

            {/* Section 8 */}
            <section id="termination" className="space-y-3 bg-slate-50/70 p-6 rounded-2xl border border-slate-100">
              <h3 className="font-extrabold text-slate-900 text-base sm:text-lg flex items-center gap-2.5">
                <span className="w-8 h-8 rounded-xl bg-slate-150 text-slate-800 flex items-center justify-center shrink-0">
                  <AlertTriangle size={18} />
                </span>
                8. Account Suspension & Termination
              </h3>
              <div className="text-xs sm:text-sm text-slate-650 space-y-2.5 pl-1">
                <p>
                  Familiess Matrimony reserves the right to suspend, terminate, or delete any account immediately without prior notice if:
                </p>
                <ul className="list-disc list-inside space-y-1.5 text-slate-600 pl-2">
                  <li>You violate any clause of these Terms and Conditions or our Privacy Policy.</li>
                  <li>You misrepresent your identity, age, marital status, or background.</li>
                  <li>Other verified members report fraudulent, harassing, or abusive conduct from your profile.</li>
                  <li>Law enforcement authorities or judicial directives require account suspension.</li>
                </ul>
              </div>
            </section>

            {/* Section 9 */}
            <section id="disclaimer" className="space-y-3 bg-slate-50/70 p-6 rounded-2xl border border-slate-100">
              <h3 className="font-extrabold text-slate-900 text-base sm:text-lg flex items-center gap-2.5">
                <span className="w-8 h-8 rounded-xl bg-purple-100 text-[#5D34F7] flex items-center justify-center shrink-0">
                  <Scale size={18} />
                </span>
                9. Disclaimers & Limitation of Liability
              </h3>
              <div className="text-xs sm:text-sm text-slate-650 space-y-2.5 pl-1">
                <p>
                  Familiess Matrimony functions solely as an intermediary online platform to help eligible individuals find potential life partners.
                </p>
                <ul className="list-disc list-inside space-y-1.5 text-slate-600 pl-2">
                  <li>We do not guarantee a successful match or subsequent marriage resulting from use of the platform.</li>
                  <li>We are not responsible for the character, behavior, conduct, or truthfulness of member declarations. Users must independently verify all background information.</li>
                  <li>To the fullest extent permitted by law, Familiess Matrimony shall not be liable for any direct, indirect, incidental, or consequential damages arising from member interactions.</li>
                </ul>
              </div>
            </section>

            {/* Section 10 */}
            <section id="grievance" className="space-y-4 bg-slate-50 p-6 rounded-2xl border border-slate-200/80">
              <h3 className="font-extrabold text-slate-900 text-base sm:text-lg flex items-center gap-2.5">
                <span className="w-8 h-8 rounded-xl bg-[#5D34F7]/10 text-[#5D34F7] flex items-center justify-center shrink-0">
                  <Mail size={18} />
                </span>
                10. Grievance Officer & Contact Information
              </h3>
              <p className="text-xs sm:text-sm text-slate-650">
                In accordance with applicable Information Technology guidelines and consumer protection laws, if you have any questions, concerns, or grievances regarding these terms or member conduct, please contact our Grievance Officer:
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs font-semibold text-slate-700">
                <div className="p-3.5 bg-white rounded-xl border border-slate-200/60 shadow-2xs">
                  <div className="flex items-center gap-2 text-[#5D34F7] font-bold mb-1">
                    <Mail size={14} /> Email Support
                  </div>
                  <p className="text-slate-600 font-medium">support@familiessmatrimony.com</p>
                </div>

                <div className="p-3.5 bg-white rounded-xl border border-slate-200/60 shadow-2xs">
                  <div className="flex items-center gap-2 text-[#5D34F7] font-bold mb-1">
                    <Phone size={14} /> Helpline Number
                  </div>
                  <p className="text-slate-600 font-medium">1800-419-6000 (9 AM – 7 PM)</p>
                </div>

                <div className="p-3.5 bg-white rounded-xl border border-slate-200/60 shadow-2xs">
                  <div className="flex items-center gap-2 text-[#5D34F7] font-bold mb-1">
                    <MapPin size={14} /> Registered Office
                  </div>
                  <p className="text-slate-600 font-medium">Familiess Towers, BKC, Mumbai 400051</p>
                </div>
              </div>
            </section>

          </div>

          {/* Bottom Back Button & Switch to Privacy */}
          <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <button
              onClick={handleBack}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition duration-200 cursor-pointer"
            >
              <ArrowLeft size={16} /> Back to Previous Screen
            </button>
            <button
              onClick={() => navigate(isLoggedRoute ? '/legal/privacy-policy' : '/privacy-policy')}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#5D34F7] hover:bg-[#4024DB] text-white text-xs font-bold shadow-xs hover:shadow transition duration-200 cursor-pointer"
            >
              <Lock size={16} /> Read Our Privacy Policy
            </button>
          </div>

        </div>
      </main>

      {/* Simple Public Footer */}
      {!isLoggedRoute && (
        <footer className="bg-slate-900 py-8 text-center text-xs text-gray-400 border-t border-slate-800 space-y-3">
          <div className="flex justify-center items-center gap-6 text-slate-400 font-semibold">
            <button onClick={() => navigate('/')} className="hover:text-white transition cursor-pointer">Home</button>
            <button onClick={() => navigate('/privacy-policy')} className="hover:text-white transition cursor-pointer">Privacy Policy</button>
            <button onClick={() => navigate('/terms-conditions')} className="text-white font-bold cursor-pointer">Terms & Conditions</button>
            <button onClick={() => navigate('/contact-us')} className="hover:text-white transition cursor-pointer">Contact Us</button>
          </div>
          <p>© 2026 Familiess Matrimony. All Rights Reserved.</p>
        </footer>
      )}
    </div>
  );
}
