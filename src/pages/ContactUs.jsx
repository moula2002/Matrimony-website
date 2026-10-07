import { useNavigate } from 'react-router-dom';
import { Phone, Mail, MapPin } from 'lucide-react';
import navbarLogo from '../assets/navbar_logo.png';
import navbarName from '../assets/navbar_name.png';

export default function ContactUs() {
  const navigate = useNavigate();
  const isLoggedRoute = window.location.pathname.startsWith('/legal');

  return (
    <div className={`min-h-screen ${isLoggedRoute ? 'bg-transparent' : 'bg-slate-50'} flex flex-col font-sans`}>
      {/* Main Content */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-8">
        <div className="bg-white rounded-3xl p-8 sm:p-12 shadow-md border border-slate-100/60 space-y-8 animate-in fade-in duration-300">
          <button
            onClick={() => navigate(isLoggedRoute ? '/feed' : '/')}
            className="text-xs font-black text-[#5D34F7] hover:text-[#4024DB] uppercase tracking-wider flex items-center gap-1.5 cursor-pointer transition duration-200"
          >
            ← {isLoggedRoute ? 'Back to Dashboard' : 'Back to Home'}
          </button>
          <div>
            <h1 className="text-3xl font-black text-slate-800 tracking-tight">Contact Us</h1>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mt-1">Get in Touch with our Team</p>
          </div>

          <div className="space-y-6 text-slate-650 text-sm leading-relaxed font-medium">
            <p>
              Have questions about verification, premium packages, or registration support? Reach out to our dedicated customer support team anytime.
            </p>

            <div className="space-y-4 bg-slate-50 p-6 rounded-2xl border border-slate-100/50">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-[#5D34F7]/10 flex items-center justify-center text-[#5D34F7] shrink-0">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <span className="block text-[10px] text-slate-400 uppercase font-black">Helpline Number</span>
                  <span className="block text-slate-800 font-extrabold text-sm sm:text-base">1800-419-6000 (Toll Free, 9 AM - 7 PM)</span>
                </div>
              </div>

              <div className="flex items-center gap-4 border-t border-slate-200/50 pt-4">
                <div className="w-10 h-10 rounded-xl bg-[#5D34F7]/10 flex items-center justify-center text-[#5D34F7] shrink-0">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <span className="block text-[10px] text-slate-400 uppercase font-black">Email Address</span>
                  <span className="block text-[#5D34F7] font-extrabold text-sm sm:text-base">support@familiessmatrimony.com</span>
                </div>
              </div>

              <div className="flex items-center gap-4 border-t border-slate-200/50 pt-4">
                <div className="w-10 h-10 rounded-xl bg-[#5D34F7]/10 flex items-center justify-center text-[#5D34F7] shrink-0">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <span className="block text-[10px] text-slate-400 uppercase font-black">Headquarters</span>
                  <span className="block text-slate-800 font-extrabold text-xs sm:text-sm leading-tight">Familiess Towers, Bandra Kurla Complex, Mumbai, Maharashtra 400051</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Simple Footer */}
      {!isLoggedRoute && (
        <footer className="bg-slate-900 py-6 text-center text-xs text-gray-500 border-t border-slate-800">
          © 2026 Familiess Matrimony. All Rights Reserved.
        </footer>
      )}
    </div>
  );
}
