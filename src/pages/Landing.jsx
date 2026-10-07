import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, Shield, PhoneCall, Users, Award, Lock, Sparkles, ChevronDown, BadgeCheck, RotateCcw, BrainCircuit, ChevronRight, Plus, Minus, X, Mail, Star, Eye, EyeOff } from 'lucide-react';
import api from '../api/axios';
import { auth, googleProvider, signInWithPopup } from '../firebase';
import heroBannerNew from '../assets/hero_banner_new.png';
import navbarLogo from '../assets/navbar_logo.png';
import navbarName from '../assets/navbar_name.png';
import brandLogo from '../assets/logo_transparent.png';
import founderImg from '../assets/founder.png';
import couple1 from '../assets/couple1.png';
import couple2 from '../assets/couple2.png';

export default function Landing() {
  const [profileFor, setProfileFor] = useState('Myself');
  const [gender, setGender] = useState('Female');
  const [religion, setReligion] = useState('Hindu');
  const [activeFaq, setActiveFaq] = useState(null);

  const [showAboutModal, setShowAboutModal] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  // Auth Modal States
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');
  const [resetLinkSent, setResetLinkSent] = useState(false);
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [showAuthPassword, setShowAuthPassword] = useState(false);
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  const navigate = useNavigate();

  const handleForgotPasswordSubmit = async (e) => {
    e.preventDefault();
    setAuthError('');
    if (!forgotPasswordEmail.trim()) {
      setAuthError('Please enter your email address');
      return;
    }
    setAuthLoading(true);
    try {
      await api.post('/auth/forgot-password', { email: forgotPasswordEmail.trim() });
      setResetLinkSent(true);
    } catch (err) {
      setAuthError(err.response?.data?.message || 'Failed to send reset link. Please try again.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setAuthError('');

    if (!authEmail || !authPassword) {
      setAuthError('Please enter email and password');
      return;
    }

    setAuthLoading(true);

    try {
      const url = isLogin ? '/auth/login' : '/auth/register';
      const response = await api.post(url, {
        email: authEmail.trim(),
        password: authPassword.trim(),
      });

      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        setShowAuthModal(false);
        if (isLogin) {
          navigate('/feed');
        } else {
          navigate('/signup');
        }
      }
    } catch (err) {
      setAuthError(err.response?.data?.message || 'Authentication failed');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    console.log("Google Login clicked");
    setAuthLoading(true);
    setAuthError('');
    try {
      console.log("Initializing signInWithPopup...");
      const result = await signInWithPopup(auth, googleProvider);
      console.log("Firebase Auth success. Fetching ID token...");
      const idToken = await result.user.getIdToken();
      console.log("Token obtained:", idToken.substring(0, 10) + "...");

      const res = await api.post('/auth/google-login', {
        idToken
      });
      console.log("Backend login response:", res.data);

      if (res.data.token) {
        localStorage.setItem('token', res.data.token);
        setShowAuthModal(false);
        if (res.data.is_onboarding_complete) {
          navigate('/feed');
        } else {
          navigate('/signup');
        }
      }
    } catch (err) {
      console.error("Google auth error detailed:", err);
      alert("Google Login Error: " + err.message);
      setAuthError(err.response?.data?.message || err.message || 'Google authentication failed');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleBegin = () => {
    // Save selections to sessionStorage to pre-fill registration/signup
    sessionStorage.setItem('prefill_profileFor', profileFor);
    sessionStorage.setItem('prefill_gender', gender);
    sessionStorage.setItem('prefill_religion', religion);
    navigate('/signup');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Header / Navbar - Floating Island Glassmorphism */}
      <header className="sticky top-1 z-50 px-2 w-full">
        <div className="max-w-full mx-auto px-4 sm:px-8 h-20 flex justify-between items-center bg-white border border-slate-100 rounded-3xl shadow-xl shadow-slate-150/30">
          <div className="flex items-center gap-2 sm:gap-3 cursor-pointer transition duration-200 active:scale-98" onClick={() => navigate('/')}>
            <img src={navbarLogo} alt="Familiess Matrimony Logo" className="w-9 h-9 sm:w-11 sm:h-11 object-contain brand-logo-black" />
            <img src={navbarName} alt="Familiess Matrimony" className="h-7 sm:h-10 object-contain brand-logo-black" />
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 text-slate-650 font-semibold text-xs sm:text-sm">
            <button onClick={() => setShowAboutModal(true)} className="hidden sm:inline-block hover:text-[#5D34F7] hover:bg-[#5D34F7]/5 px-3 py-2 rounded-xl transition duration-250 cursor-pointer font-semibold text-slate-650">About us</button>
            <button onClick={() => setShowHelpModal(true)} className="hidden sm:inline-block hover:text-[#5D34F7] hover:bg-[#5D34F7]/5 px-3 py-2 rounded-xl transition duration-250 cursor-pointer font-semibold text-slate-650">Help</button>
            <button
              onClick={() => navigate('/login')}
              className="ml-1 sm:ml-2 px-4 py-2 sm:px-6 sm:py-2.5 bg-gradient-to-r from-[#4A20E3] to-[#2D11B5] hover:opacity-98 hover:shadow-lg text-white font-extrabold rounded-2xl shadow-sm transition-all duration-200 cursor-pointer flex items-center gap-1 text-xs sm:text-sm active:scale-[0.98]"
            >
              Login <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* Choose Your Forever Section - Full-Width Banner Image */}
      <section className="w-full relative overflow-hidden -mt-24 z-10">
        <div className="max-w-[97%] mx-auto mt-[112px] mb-12 rounded-3xl overflow-hidden shadow-2xl border border-slate-100/60">
          <img 
            src={heroBannerNew} 
            alt="Familiess Matrimony Banner" 
            className="w-full h-auto object-cover"
          />
        </div>
      </section>

      {/* The Familiess Experience Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6 space-y-16">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-950">
              The Familiess Experience
            </h2>
            <p className="text-gray-500 mt-2">
              Discover how we combine human matchmaking care with cutting edge technology
            </p>
          </div>

          {/* Core Experience Cards */}
          <div className="grid md:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-6 duration-700">
            <div className="p-8 bg-white rounded-3xl border border-slate-100 hover:border-[#5D34F7]/20 hover:-translate-y-2 hover:shadow-[0_15px_35px_rgba(93,52,247,0.08)] transition-all duration-300 space-y-6 group cursor-pointer">
              <div className="w-14 h-14 bg-[#5D34F7]/5 rounded-2xl flex items-center justify-center text-[#5D34F7] group-hover:scale-110 transition duration-300">
                <RotateCcw className="w-7 h-7" />
              </div>
              <div className="space-y-2">
                <h3 className="font-extrabold text-gray-900 text-lg group-hover:text-[#5D34F7] transition duration-200">30 Day Money Back Guarantee</h3>
                <p className="text-gray-650 text-sm leading-relaxed">
                  Get matched with someone special within 30 days, or we'll refund your money—guaranteed!
                </p>
              </div>
            </div>

            <div className="p-8 bg-white rounded-3xl border border-slate-100 hover:border-[#5D34F7]/20 hover:-translate-y-2 hover:shadow-[0_15px_35px_rgba(93,52,247,0.08)] transition-all duration-300 space-y-6 group cursor-pointer">
              <div className="w-14 h-14 bg-violet-50 rounded-2xl flex items-center justify-center text-violet-600 group-hover:scale-110 transition duration-300">
                <BadgeCheck className="w-7 h-7" />
              </div>
              <div className="space-y-2">
                <h3 className="font-extrabold text-gray-900 text-lg group-hover:text-violet-600 transition duration-200">Blue Tick to find your Green Flag</h3>
                <p className="text-gray-650 text-sm leading-relaxed">
                  Did you know our blue-tick profiles get 40% more connection requests than others?
                </p>
              </div>
            </div>

            <div className="p-8 bg-white rounded-3xl border border-slate-100 hover:border-[#5D34F7]/20 hover:-translate-y-2 hover:shadow-[0_15px_35px_rgba(93,52,247,0.08)] transition-all duration-300 space-y-6 group cursor-pointer">
              <div className="w-14 h-14 bg-[#5D34F7]/5 rounded-2xl flex items-center justify-center text-[#5D34F7] group-hover:scale-110 transition duration-300">
                <BrainCircuit className="w-7 h-7" />
              </div>
              <div className="space-y-2">
                <h3 className="font-extrabold text-gray-900 text-lg group-hover:text-[#5D34F7] transition duration-200">Matchmaking Powered by AI</h3>
                <p className="text-gray-650 text-sm leading-relaxed">
                  Cutting-edge technology with two decades of matchmaking expertise to help you find "the one".
                </p>
              </div>
            </div>
          </div>
          {/* The VIP Advantage Section */}
          <div className="space-y-8 pt-8">
            <div className="text-left">
              <h2 className="text-3xl font-black text-[#5D34F7] tracking-tight">The VIP Advantage</h2>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Card 1 */}
              <div className="bg-white rounded-3xl p-8 border border-slate-100/80 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col items-center text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-amber-500/10 flex items-center justify-center relative">
                  <div className="absolute inset-0 rounded-full bg-amber-400/20 blur-md"></div>
                  <Users className="w-8 h-8 relative z-10 text-amber-600" />
                </div>
                <div className="space-y-2">
                  <h4 className="font-extrabold text-slate-800 text-lg">Top Consultants</h4>
                  <p className="text-slate-500 text-sm leading-relaxed">Will manage your profile.</p>
                </div>
              </div>

              {/* Card 2 */}
              <div className="bg-white rounded-3xl p-8 border border-slate-100/80 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col items-center text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-amber-500/10 flex items-center justify-center relative">
                  <div className="absolute inset-0 rounded-full bg-amber-400/20 blur-md"></div>
                  <Heart className="w-8 h-8 relative z-10 text-amber-600 fill-amber-600/20" />
                </div>
                <div className="space-y-2">
                  <h4 className="font-extrabold text-slate-800 text-lg">20+ Years</h4>
                  <p className="text-slate-500 text-sm leading-relaxed">20+ years of matchmaking expertise, finding your ideal match.</p>
                </div>
              </div>

              {/* Card 3 */}
              <div className="bg-white rounded-3xl p-8 border border-slate-100/80 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col items-center text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-amber-500/10 flex items-center justify-center relative">
                  <div className="absolute inset-0 rounded-full bg-amber-400/20 blur-md"></div>
                  <Award className="w-8 h-8 relative z-10 text-amber-600" />
                </div>
                <div className="space-y-2">
                  <h4 className="font-extrabold text-slate-800 text-lg">1.6 LAKH+ VIPs</h4>
                  <p className="text-slate-500 text-sm leading-relaxed">1.6 LAKH+ VIPs have entrusted us to find their perfect match.</p>
                </div>
              </div>

              {/* Card 4 */}
              <div className="bg-white rounded-3xl p-8 border border-slate-100/80 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col items-center text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-amber-500/10 flex items-center justify-center relative">
                  <div className="absolute inset-0 rounded-full bg-amber-400/20 blur-md"></div>
                  <Lock className="w-8 h-8 relative z-10 text-amber-600" />
                </div>
                <div className="space-y-2">
                  <h4 className="font-extrabold text-slate-800 text-lg">100% Privacy</h4>
                  <p className="text-slate-500 text-sm leading-relaxed">You have the choice of keeping your profile info 100% confidential and discreet.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quote / Mission Section */}
      <section className="bg-slate-50 border-y border-gray-100 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-12 gap-12 items-center">
          <div className="md:col-span-7 py-16 md:py-24 space-y-6">
            <span className="text-[#E0C3FC] text-8xl font-serif leading-none block h-8">“</span>
            <blockquote className="text-2xl sm:text-3xl font-extrabold text-gray-900 leading-tight">
              At Familiess Matrimony, it is our life's mission to use technology for good and bring back deep and meaningful relationships.
            </blockquote>
            <div className="space-y-1">
              <cite className="not-italic font-bold text-gray-900 block text-base">- Anupam Mittal</cite>
              <span className="text-gray-500 text-xs uppercase font-semibold tracking-wider block">Founder & CEO</span>
            </div>
          </div>

          <div className="md:col-span-5 flex justify-center md:justify-end self-end pt-12 md:pt-0">
            <img
              src={founderImg}
              alt="Anupam Mittal, Founder & CEO"
              className="max-h-[380px] object-contain drop-shadow-2xl"
            />
          </div>
        </div>
      </section>

      {/* Real Stories, True Connections Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-12 gap-12 items-center">
          {/* Left Block */}
          <div className="md:col-span-4 space-y-6 text-center md:text-left">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 leading-tight">
              Real Stories, True Connections
            </h2>
            <p className="text-gray-500 leading-relaxed text-sm">
              Discover how Familiess Matrimony has brought together couples through meaningful connections and shared journeys. Your success story could be next!
            </p>
            <button
              onClick={() => navigate('/success-stories')}
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#5D34F7] text-white font-bold rounded-full hover:bg-[#772288] transition shadow-md text-sm cursor-pointer"
            >
              Know more <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Right Block: Couple Cards */}
          <div className="md:col-span-8 grid sm:grid-cols-2 gap-6">
            {/* Couple Card 1 */}
            <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition duration-300">
              <div className="h-64 overflow-hidden relative">
                <img src={couple1} alt="Ajinkya & Ashwini" className="w-full h-full object-cover" />
                <div className="absolute top-4 left-4 bg-black/40 backdrop-blur-sm text-white text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                  Success Story
                </div>
              </div>
              <div className="p-6 space-y-3">
                <h4 className="font-extrabold text-gray-900 text-lg">Ajinkya & Ashwini</h4>
                <p className="text-gray-500 text-xs leading-relaxed italic">
                  "Thank you Familiess Matrimony! I found my soulmate here. After chatting, we involved our families—now we're happily engaged as of 9th May 2025!"
                </p>
              </div>
            </div>

            {/* Couple Card 2 */}
            <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition duration-300">
              <div className="h-64 overflow-hidden relative">
                <img src={couple2} alt="Rohit & Sonam" className="w-full h-full object-cover" />
                <div className="absolute top-4 left-4 bg-black/40 backdrop-blur-sm text-white text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                  Success Story
                </div>
              </div>
              <div className="p-6 space-y-3">
                <h4 className="font-extrabold text-gray-900 text-lg">Rohit & Sonam</h4>
                <p className="text-gray-500 text-xs leading-relaxed italic">
                  "We met on Familiess Matrimony and found our perfect match. Thank you for helping me find my soulmate and begin this beautiful new chapter of life!"
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* Frequently Asked Questions Section */}
      <section className="py-20 bg-[#F8F9FD] border-t border-slate-100">
        <div className="max-w-4xl mx-auto px-6 space-y-12">
          <div className="text-center space-y-2">
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              Frequently Asked <span className="bg-gradient-to-r from-[#5D34F7] to-[#805CFF] bg-clip-text text-transparent">Questions</span>
            </h2>
            <p className="text-slate-500 font-semibold max-w-xl mx-auto text-sm sm:text-base">
              Got questions? We've got answers to help you navigate your matchmaking journey.
            </p>
          </div>

          <div className="space-y-4">
            {[
              {
                num: '01',
                q: 'Why is Familiess Matrimony better compared to other matrimonial websites?',
                a: 'Familiess Matrimony offers deep personalization, AI-driven matches, manual screening to guarantee 100% verified profiles, and premium privacy control settings to keep your matchmaking safe and high-quality.'
              },
              {
                num: '02',
                q: 'Is Familiess Matrimony a trustworthy matchmaking platform?',
                a: 'Yes, it is highly trusted. Every profile undergoes rigorous verification steps, phone verification via OTP, and email/ID screening to maintain authenticity.'
              },
              {
                num: '03',
                q: 'What is the difference between free membership vs paid membership?',
                a: 'Free members can register, prefill their preferences, create profiles, and send interests. Paid members gain access to direct chat messaging, verified contact info, high profile placement boosts, and dedicated advisor support.'
              },
              {
                num: '04',
                q: 'What additional benefits do I get as a Premium Member?',
                a: 'Premium members enjoy exclusive badge indicators, custom match filters, unlimited daily matches, video calling capabilities, and double profile visibility in search lists.'
              },
              {
                num: '05',
                q: 'How can I contact other members on Familiess Matrimony?',
                a: 'You can connect by upgrading to a premium membership to unlock unlimited messaging, secure chat features, and request direct phone numbers securely.'
              }
            ].map((faq, index) => {
              const isOpen = activeFaq === index;
              return (
                <div
                  key={index}
                  className={`bg-white rounded-3xl border transition-all duration-300 overflow-hidden cursor-pointer ${
                    isOpen 
                      ? 'border-[#5D34F7]/25 shadow-[0_15px_30px_rgba(93,52,247,0.05)] border-l-4 border-l-[#5D34F7]' 
                      : 'border-slate-100/80 hover:border-slate-200 shadow-sm'
                  }`}
                  onClick={() => setActiveFaq(isOpen ? null : index)}
                >
                  <div className="w-full flex items-center justify-between p-6 text-left focus:outline-none">
                    <div className="flex items-center gap-4 pr-4">
                      <span className={`text-[11px] font-black tracking-wider px-2 py-0.5 rounded-lg transition duration-200 ${
                        isOpen ? 'bg-[#5D34F7]/10 text-[#5D34F7]' : 'bg-slate-100 text-slate-400'
                      }`}>{faq.num}</span>
                      <span className={`font-extrabold text-sm sm:text-base transition duration-200 ${
                        isOpen ? 'text-[#5D34F7]' : 'text-slate-800'
                      }`}>{faq.q}</span>
                    </div>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-300 ${
                      isOpen ? 'bg-[#5D34F7] text-white rotate-180' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'
                    }`}>
                      {isOpen ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                    </div>
                  </div>
                  {isOpen && (
                    <div className="px-16 pb-6 text-slate-650 text-sm leading-relaxed font-medium animate-in fade-in slide-in-from-top-2 duration-300">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto bg-gradient-to-b from-slate-900 to-slate-950 text-slate-200 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-6 py-16">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12 animate-in fade-in duration-500">
            <div className="col-span-2 md:col-span-1 space-y-4">
              <div className="flex items-center gap-3 text-white mb-2">
                <img src={navbarLogo} alt="Familiess Matrimony Logo" className="w-8 h-8 object-contain" />
                <img src={navbarName} alt="Familiess Matrimony" className="h-6 object-contain" />
              </div>
              <p className="text-sm text-slate-300 leading-relaxed max-w-[240px]">
                The most trusted matchmaking and matrimonial portal to find premium partner profiles.
              </p>
            </div>
            <div>
              <h5 className="font-extrabold text-white text-[13px] uppercase tracking-wider mb-5">Support & Terms</h5>
              <ul className="space-y-3 text-sm text-slate-200 flex flex-col items-start">
                <li><button onClick={() => navigate('/privacy-policy')} className="inline-block hover:text-[#805CFF] hover:translate-x-1 transition duration-200 cursor-pointer text-left">Privacy Policy</button></li>
                <li><button onClick={() => navigate('/terms-conditions')} className="inline-block hover:text-[#805CFF] hover:translate-x-1 transition duration-200 cursor-pointer text-left">Terms & Conditions</button></li>
                <li><button onClick={() => navigate('/contact-us')} className="inline-block hover:text-[#805CFF] hover:translate-x-1 transition duration-200 cursor-pointer text-left">Contact Us</button></li>
              </ul>
            </div>
            <div>
              <h5 className="font-extrabold text-white text-[13px] uppercase tracking-wider mb-5">Explore</h5>
              <ul className="space-y-3 text-sm text-slate-200 flex flex-col items-start">
                <li><button onClick={() => navigate('/success-stories')} className="inline-block hover:text-[#805CFF] hover:translate-x-1 transition duration-200 cursor-pointer text-left">Success Stories</button></li>
                <li><a href="#" className="inline-block hover:text-[#805CFF] hover:translate-x-1 transition duration-200">Membership Tiers</a></li>
                <li><a href="#" className="inline-block hover:text-[#805CFF] hover:translate-x-1 transition duration-200">Safe Matrimony Guidelines</a></li>
              </ul>
            </div>
            <div>
              <h5 className="font-extrabold text-white text-[13px] uppercase tracking-wider mb-5">Contact Us</h5>
              <ul className="space-y-2.5 text-sm text-slate-200">
                <li><span className="block text-slate-500 text-[9px] font-black uppercase leading-tight">Helpline</span>1800-419-6000</li>
                <li><span className="block text-slate-500 text-[9px] font-black uppercase leading-tight">Email</span>support@familiessmatrimony.com</li>
                <li><span className="block text-slate-500 text-[9px] font-black uppercase leading-tight">HQ Address</span>BKC, Mumbai, MH</li>
              </ul>
            </div>
          </div>
          <hr className="border-slate-800/50 mb-8" />
          <div className="flex flex-col md:flex-row justify-between items-center gap-6 text-sm text-slate-300 font-semibold">
            <span>© 2026 Familiess Matrimony. All Rights Reserved.</span>

            {/* Centered Download Badges */}
            <div className="flex items-center gap-3">
              {/* Play Store Link */}
              <a href="#" className="flex items-center gap-3 px-4.5 py-1.5 bg-black border border-slate-700/80 rounded-xl text-white hover:bg-slate-900 transition-all duration-200 hover:-translate-y-0.5 shadow-md shrink-0 w-[148px]">
                <svg className="w-5 h-5 shrink-0" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M6.05952 2.92882C5.46083 3.55169 5.11914 4.54463 5.11914 5.78652V42.213C5.11914 43.4549 5.46083 44.4478 6.05952 45.0707L6.23023 45.2285L27.915 23.5438V23.119L6.23023 2.771V2.92882H6.05952Z" fill="#00F0FF" />
                  <path d="M35.1524 30.7937L27.9141 23.5552V23.1305L35.1554 15.892L35.3188 15.9856L42.5029 20.0683C44.5513 21.229 44.5513 23.1189 42.5029 24.281L35.3188 28.3637L35.1524 30.7937Z" fill="#FFC700" />
                  <path d="M6.23047 45.0706L35.1555 28.3637L27.9172 21.1255L6.23047 42.8122V45.0706Z" fill="#FF1F4B" />
                  <path d="M6.23047 2.92892L27.9172 24.6157L35.1555 17.3774L6.23047 0.67041V2.92892Z" fill="#00E575" />
                </svg>
                <div className="text-left leading-tight">
                  <span className="block text-[8px] uppercase tracking-wider text-slate-400 font-extrabold">GET IT ON</span>
                  <span className="block text-[11px] font-black">Google Play</span>
                </div>
              </a>

              {/* App Store Link */}
              <a href="#" className="flex items-center gap-3 px-4.5 py-1.5 bg-black border border-slate-700/80 rounded-xl text-white hover:bg-slate-900 transition-all duration-200 hover:-translate-y-0.5 shadow-md shrink-0 w-[148px]">
                <svg className="w-5 h-5 fill-current text-white shrink-0" viewBox="0 0 24 24">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 4.17c.66-.81 1.11-1.93.99-3.06-1 .04-2.22.67-2.94 1.51-.63.73-1.18 1.87-1.03 2.98.88.07 2.02-.54 2.98-1.43z"/>
                </svg>
                <div className="text-left leading-tight">
                  <span className="block text-[7.5px] uppercase tracking-wider text-slate-400 font-extrabold">Download on the</span>
                  <span className="block text-[11px] font-black">App Store</span>
                </div>
              </a>
            </div>
            <div className="flex gap-4">
              <a href="#" className="w-9 h-9 rounded-xl bg-[#1877F2]/10 hover:bg-[#1877F2] text-[#1877F2] hover:text-white flex items-center justify-center border border-[#1877F2]/20 transition-all duration-300 hover:-translate-y-1 shadow-sm" title="Facebook">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1V12h3v3h-3v6.8c4.56-.93 8-4.96 8-9.8z"/>
                </svg>
              </a>
              <a href="#" className="w-9 h-9 rounded-xl bg-slate-800/50 hover:bg-black text-slate-350 hover:text-white flex items-center justify-center border border-slate-700/40 transition-all duration-300 hover:-translate-y-1 shadow-sm" title="Twitter">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </a>
              <a href="#" className="w-9 h-9 rounded-xl bg-[#E4405F]/10 hover:bg-gradient-to-tr hover:from-[#F58529] hover:to-[#DD2A7B] text-[#E4405F] hover:text-white flex items-center justify-center border border-[#E4405F]/20 transition-all duration-300 hover:-translate-y-1 shadow-sm" title="Instagram">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
                </svg>
              </a>
            </div>
          </div>
        </div>
      </footer>

      {/* Auth Popup Modal */}
      {showAuthModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200 cursor-pointer" onClick={() => setShowAuthModal(false)}>
          <div 
            className="bg-gradient-to-br from-[#5D34F7] to-[#4024DB] rounded-3xl p-6 sm:p-8 max-w-[480px] w-full max-h-[92vh] overflow-y-auto relative shadow-2xl border border-white/10 animate-in zoom-in-95 duration-200 flex flex-col items-center cursor-default custom-scrollbar"
            onClick={(e) => e.stopPropagation()}
          >
             {/* Close Button */}
            <button
              onClick={() => {
                setShowAuthModal(false);
                setIsForgotPassword(false);
                setResetLinkSent(false);
                setForgotPasswordEmail('');
              }}
              className="absolute top-5 right-5 p-1.5 rounded-full hover:bg-white/10 text-white/70 hover:text-white transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header logo */}
            <div className="mb-2 flex flex-col items-center gap-1.5">
              <img src={navbarLogo} alt="Familiess Logo" className="h-12 object-contain" />
              <img src={navbarName} alt="Familiess Matrimony" className="h-6.5 object-contain" />
            </div>

            {isForgotPassword ? (
              resetLinkSent ? (
                <div className="space-y-6 text-center w-full animate-in fade-in duration-200">
                  <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto border border-white/15 text-emerald-400 shadow-sm animate-pulse">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-extrabold text-white tracking-tight">Reset Link Sent!</h3>
                    <p className="text-white/70 text-sm leading-relaxed">
                      We have sent a secure password reset link to <strong className="text-white">{forgotPasswordEmail}</strong>. Please check your inbox.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setIsForgotPassword(false);
                      setResetLinkSent(false);
                      setForgotPasswordEmail('');
                    }}
                    className="w-full py-3.5 bg-white text-[#5D34F7] font-extrabold rounded-xl transition cursor-pointer text-sm shadow-md"
                  >
                    Back to Login
                  </button>
                </div>
              ) : (
                <div className="space-y-6 w-full animate-in fade-in duration-200">
                  <div>
                    <h3 className="text-xl font-extrabold text-white text-center mb-1 tracking-tight">Reset Password</h3>
                    <p className="text-white/75 text-center text-xs">
                      Enter your email address and we'll send you a link to reset your password.
                    </p>
                  </div>

                  {authError && (
                    <div className="bg-red-500/20 border border-red-500/30 text-white p-3 rounded-xl mb-5 text-sm text-center font-bold w-full">
                      {authError}
                    </div>
                  )}

                  <form onSubmit={handleForgotPasswordSubmit} className="space-y-4 w-full">
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-white/80">
                        <Mail className="w-5 h-5" />
                      </div>
                      <input
                        type="email"
                        value={forgotPasswordEmail}
                        onChange={(e) => setForgotPasswordEmail(e.target.value)}
                        className="block w-full pl-12 pr-4 py-3.5 bg-transparent border border-white/30 rounded-xl focus:outline-none focus:border-white focus:ring-1 focus:ring-white text-sm text-white placeholder-white/50 transition w-full"
                        placeholder="Email address"
                        required
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={authLoading}
                      className="w-full flex justify-center items-center py-3.5 px-4 bg-white text-[#5D34F7] font-extrabold rounded-xl hover:bg-white/95 transition duration-200 cursor-pointer shadow-md disabled:opacity-50 text-[15px]"
                    >
                      {authLoading ? (
                        <FontAwesomeIcon icon={faSpinner} spin className="text-lg" />
                      ) : (
                        'Send Reset Link'
                      )}
                    </button>
                  </form>

                  <div className="text-center pt-2">
                    <button
                      onClick={() => {
                        setIsForgotPassword(false);
                        setAuthError('');
                      }}
                      className="text-white/70 hover:text-white font-bold text-sm hover:underline"
                    >
                      Back to Login
                    </button>
                  </div>
                </div>
              )
            ) : (
              <>
                <h3 className="text-xl font-extrabold text-white text-center mb-4 tracking-tight">
                  {isLogin ? 'Welcome Back' : 'Create Account'}
                </h3>

                {authError && (
                  <div className="bg-red-500/20 border border-red-500/30 text-white p-3 rounded-xl mb-5 text-sm text-center font-bold w-full">
                    {authError}
                  </div>
                )}

                <form onSubmit={handleAuthSubmit} className="space-y-4 w-full">
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-white/80">
                      <Mail className="w-5 h-5" />
                    </div>
                    <input
                      type="email"
                      value={authEmail}
                      onChange={(e) => setAuthEmail(e.target.value)}
                      className="block w-full pl-12 pr-4 py-3.5 bg-transparent border border-white/30 rounded-xl focus:outline-none focus:border-white focus:ring-1 focus:ring-white text-sm text-white placeholder-white/50 transition"
                      placeholder="Email"
                      required
                    />
                  </div>

                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-white/80">
                      <Lock className="w-5 h-5" />
                    </div>
                    <input
                      type={showAuthPassword ? 'text' : 'password'}
                      value={authPassword}
                      onChange={(e) => setAuthPassword(e.target.value)}
                      className="block w-full pl-12 pr-12 py-3.5 bg-transparent border border-white/30 rounded-xl focus:outline-none focus:border-white focus:ring-1 focus:ring-white text-sm text-white placeholder-white/50 transition"
                      placeholder="Password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowAuthPassword(!showAuthPassword)}
                      className="absolute inset-y-0 right-0 pr-4 flex items-center text-white/60 hover:text-white transition cursor-pointer"
                    >
                      {showAuthPassword ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                    </button>
                  </div>

                  {/* Forgot Password Link */}
                  {isLogin && (
                    <div className="flex justify-end !mt-1.5">
                      <button
                        type="button"
                        onClick={() => setIsForgotPassword(true)}
                        className="text-xs text-white/70 hover:text-white transition duration-200 hover:underline font-semibold"
                      >
                        Forgot Password?
                      </button>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={authLoading}
                    className="w-full flex justify-center items-center py-3.5 bg-white hover:bg-white/95 text-[#5D34F7] font-extrabold rounded-xl transition duration-200 disabled:opacity-50 text-base shadow-md cursor-pointer"
                  >
                    {authLoading ? 'Please wait...' : isLogin ? 'Login' : 'Register'}
                  </button>
                </form>

                {/* OR Divider */}
                <div className="flex items-center gap-4 my-3.5 w-full">
                  <div className="flex-1 h-[1px] bg-white/20"></div>
                  <span className="text-xs font-bold text-white/60">OR</span>
                  <div className="flex-1 h-[1px] bg-white/20"></div>
                </div>

                {/* Google Button */}
                <button
                  type="button"
                  onClick={handleGoogleLogin}
                  disabled={authLoading}
                  className="w-full py-3 border border-white/30 text-white font-bold rounded-xl hover:bg-white/10 transition duration-200 cursor-pointer flex items-center justify-center gap-2 bg-transparent text-sm disabled:opacity-50"
                >
                  <svg className="w-5 h-5 mr-1" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                    <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </svg>
                  <span>Continue with Google</span>
                </button>

                {/* Footer toggle */}
                <div className="mt-6 text-center text-sm">
                  <button
                    type="button"
                    onClick={() => {
                      setIsLogin(!isLogin);
                      setAuthError('');
                    }}
                    className="text-white hover:underline font-bold"
                  >
                    {isLogin ? "Don't have an account? Register" : "Already have an account? Login"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
      {/* About Us Modal */}
      {showAboutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300 cursor-pointer" onClick={() => setShowAboutModal(false)}>
          <div 
            className="bg-white rounded-3xl p-8 max-w-lg w-full relative shadow-2xl border border-slate-100 overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-8 duration-300 ease-out cursor-default"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header Banner */}
            <div className="bg-gradient-to-r from-[#5D34F7] to-[#805CFF] text-white p-8 -mx-8 -mt-8 mb-6 relative">
              <button onClick={() => setShowAboutModal(false)} className="absolute top-5 right-5 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition cursor-pointer font-bold text-sm">✕</button>
              <h3 className="text-2xl font-black tracking-tight">About Familiess</h3>
              <p className="text-xs font-bold text-white/80 uppercase tracking-widest mt-1">Connecting Hearts, Building Families</p>
            </div>

            <div className="space-y-6">
              <p className="text-slate-600 text-[14px] leading-relaxed font-medium">
                Familiess Matrimony is the world's most trusted family-first matchmaking platform. We combine human care, two decades of match expertise, and advanced AI technologies to help individuals find green-flag partners from verified families.
              </p>
              
              <div className="space-y-3.5 bg-slate-50/80 p-5 rounded-2xl border border-slate-100">
                <h4 className="text-xs font-black uppercase text-slate-400 tracking-wider">Our Core Pillars</h4>
                <ul className="space-y-3 text-xs font-bold text-slate-700">
                  <li className="flex items-center gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0 text-[10px]">✓</span>
                    100% Manually Screened & Verified Profiles
                  </li>
                  <li className="flex items-center gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0 text-[10px]">✓</span>
                    Strict Data Privacy & Communication Control
                  </li>
                  <li className="flex items-center gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0 text-[10px]">✓</span>
                    Dedicated Personalised Relationship Support
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Help / FAQ Modal */}
      {showHelpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300 cursor-pointer" onClick={() => setShowHelpModal(false)}>
          <div 
            className="bg-white rounded-3xl p-8 max-w-xl w-full max-h-[85vh] overflow-y-auto relative shadow-2xl border border-slate-100 overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-8 duration-300 ease-out cursor-default custom-scrollbar"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header Banner */}
            <div className="bg-gradient-to-r from-[#5D34F7] to-[#805CFF] text-white p-8 -mx-8 -mt-8 mb-6 relative">
              <button onClick={() => setShowHelpModal(false)} className="absolute top-5 right-5 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition cursor-pointer font-bold text-sm">✕</button>
              <h3 className="text-2xl font-black tracking-tight">Help Center</h3>
              <p className="text-xs font-bold text-white/80 uppercase tracking-widest mt-1">Frequently Asked Questions</p>
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-slate-50 hover:bg-white hover:shadow-md transition-all duration-300 rounded-2xl border border-slate-100 space-y-1">
                <h4 className="font-extrabold text-slate-800 text-sm">How do I verify my profile with a Blue Tick?</h4>
                <p className="text-xs text-slate-650 leading-relaxed font-medium">
                  Upload a valid ID proof (Aadhar/Passport) and a clear selfie in your profile settings. Our verification team will review and approve within 24 hours.
                </p>
              </div>
              <div className="p-4 bg-slate-50 hover:bg-white hover:shadow-md transition-all duration-300 rounded-2xl border border-slate-100 space-y-1">
                <h4 className="font-extrabold text-slate-800 text-sm">Are my contact details safe?</h4>
                <p className="text-xs text-slate-650 leading-relaxed font-medium">
                  Yes! You have full control over who views your phone number and photos. You can restrict access to matches you approve.
                </p>
              </div>
              <div className="p-4 bg-slate-50 hover:bg-white hover:shadow-md transition-all duration-300 rounded-2xl border border-slate-100 space-y-1">
                <h4 className="font-extrabold text-slate-800 text-sm">How do I contact customer care?</h4>
                <p className="text-xs text-slate-650 leading-relaxed font-medium">
                  You can email us directly at <span className="text-[#5D34F7] font-semibold">support@familiessmatrimony.com</span> or call our helpline number (1800-419-6000) from 9 AM to 7 PM.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Privacy Policy Modal */}
      {showPrivacyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200 cursor-pointer" onClick={() => setShowPrivacyModal(false)}>
          <div 
            className="bg-white rounded-3xl p-8 max-w-xl w-full max-h-[85vh] overflow-y-auto relative shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-200 cursor-default custom-scrollbar"
            onClick={(e) => e.stopPropagation()}
          >
            <button onClick={() => setShowPrivacyModal(false)} className="absolute top-5 right-5 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition cursor-pointer font-bold text-sm">✕</button>
            <div className="space-y-6">
              <div>
                <h3 className="text-2xl font-black text-slate-800 tracking-tight">Privacy Policy</h3>
                <p className="text-xs font-bold text-[#5D34F7] uppercase tracking-wider mt-1">Your Privacy is Our Priority</p>
              </div>
              <div className="space-y-4 text-slate-650 text-sm leading-relaxed font-medium">
                <p>
                  At Familiess Matrimony, we are committed to safeguarding the personal details of our members. This Privacy Policy details how we collect, store, and protect your information.
                </p>
                <div className="space-y-2">
                  <h4 className="font-extrabold text-slate-800 text-[13px] uppercase tracking-wider">1. Information Collection</h4>
                  <p className="text-xs">
                    We collect details necessary for matchmaking, including name, gender, contact number, photos, religious preferences, and educational background. All sensitive information is stored in encrypted databases.
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-extrabold text-slate-800 text-[13px] uppercase tracking-wider">2. Photo Protection</h4>
                  <p className="text-xs">
                    We prevent direct downloading or screenshotting of photos to ensure member security. Members can also choose to hide their photos or only display them to approved connections.
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-extrabold text-slate-800 text-[13px] uppercase tracking-wider">3. Zero Third-Party Sharing</h4>
                  <p className="text-xs">
                    We do not sell, rent, or trade your personal verification or contact details with third-party advertising companies. Your data is used purely to provide you with secure matchmaking services.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Terms & Conditions Modal */}
      {showTermsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200 cursor-pointer" onClick={() => setShowTermsModal(false)}>
          <div 
            className="bg-white rounded-3xl p-8 max-w-xl w-full max-h-[85vh] overflow-y-auto relative shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-200 cursor-default custom-scrollbar"
            onClick={(e) => e.stopPropagation()}
          >
            <button onClick={() => setShowTermsModal(false)} className="absolute top-5 right-5 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition cursor-pointer font-bold text-sm">✕</button>
            <div className="space-y-6">
              <div>
                <h3 className="text-2xl font-black text-slate-800 tracking-tight">Terms & Conditions</h3>
                <p className="text-xs font-bold text-[#5D34F7] uppercase tracking-wider mt-1">Platform Guidelines & Agreement</p>
              </div>
              <div className="space-y-4 text-slate-650 text-sm leading-relaxed font-medium">
                <p>
                  Welcome to Familiess Matrimony. By accessing or using our matchmaking services, you agree to comply with and be bound by the following Terms and Conditions.
                </p>
                <div className="space-y-2">
                  <h4 className="font-extrabold text-slate-800 text-[13px] uppercase tracking-wider">1. Eligibility Criteria</h4>
                  <p className="text-xs">
                    To register as a member or use this platform, you must be of legal marriageable age as per your local jurisdiction laws (e.g., 18 years or above for females, and 21 years or above for males in India).
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-extrabold text-slate-800 text-[13px] uppercase tracking-wider">2. Profile Authenticity</h4>
                  <p className="text-xs">
                    You agree to provide true, accurate, and current information when onboarding. Creating profiles with fake names, misrepresenting educational qualification, or using someone else's photographs is strictly prohibited.
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-extrabold text-slate-800 text-[13px] uppercase tracking-wider">3. Code of Conduct</h4>
                  <p className="text-xs">
                    Members must engage with other connections in a respectful and polite manner. Harassment, abusive language, sending spam connection requests, or attempting to solicit money from other members will lead to immediate account termination.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Contact Us Modal */}
      {showContactModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200 cursor-pointer" onClick={() => setShowContactModal(false)}>
          <div 
            className="bg-white rounded-3xl p-8 max-w-lg w-full relative shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-200 cursor-default"
            onClick={(e) => e.stopPropagation()}
          >
            <button onClick={() => setShowContactModal(false)} className="absolute top-5 right-5 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition cursor-pointer font-bold text-sm">✕</button>
            <div className="space-y-6">
              <div>
                <h3 className="text-2xl font-black text-slate-800 tracking-tight">Contact Us</h3>
                <p className="text-xs font-bold text-[#5D34F7] uppercase tracking-wider mt-1">Get in Touch with our Team</p>
              </div>
              <div className="space-y-4">
                <p className="text-slate-650 text-sm leading-relaxed font-medium">
                  Have questions about verification, premium tiers, or registration? Reach out to our customer care team anytime.
                </p>
                <div className="space-y-3.5 bg-slate-50 p-5 rounded-2xl border border-slate-100/65 text-xs font-bold text-slate-700">
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-xl bg-[#5D34F7]/10 flex items-center justify-center text-[#5D34F7] text-sm shrink-0">📞</span>
                    <span>Toll Free helpline: 1800-419-6000 (9 AM - 7 PM)</span>
                  </div>
                  <div className="flex items-center gap-3 mt-3">
                    <span className="w-8 h-8 rounded-xl bg-[#5D34F7]/10 flex items-center justify-center text-[#5D34F7] text-sm shrink-0">✉️</span>
                    <span>Direct Email: support@familiessmatrimony.com</span>
                  </div>
                  <div className="flex items-center gap-3 mt-3">
                    <span className="w-8 h-8 rounded-xl bg-[#5D34F7]/10 flex items-center justify-center text-[#5D34F7] text-sm shrink-0">📍</span>
                    <span className="leading-tight font-semibold">Head Office: Familiess Towers, BKC, Mumbai, MH 400051</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
