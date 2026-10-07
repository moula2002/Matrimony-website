import { useNavigate } from 'react-router-dom';
import { ChevronRight, Shield, Lock, Eye } from 'lucide-react';
import navbarLogo from '../assets/navbar_logo.png';
import navbarName from '../assets/navbar_name.png';

export default function PrivacyPolicy() {
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
            <h1 className="text-3xl font-black text-slate-800 tracking-tight">Privacy Policy</h1>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mt-1">Your Privacy is Our Priority</p>
          </div>

          <div className="prose prose-slate max-w-none text-slate-650 font-medium text-sm leading-relaxed space-y-6">
            <p>
              At Familiess Matrimony, we understand that finding a life partner is a deeply personal journey, and maintaining your privacy is our absolute priority. This policy outlines how your information is securely handled.
            </p>

            <div className="space-y-3 bg-slate-50 p-6 rounded-2xl border border-slate-100/50">
              <h3 className="font-extrabold text-slate-800 text-base flex items-center gap-2">
                <Shield className="w-5 h-5 text-[#5D34F7]" />
                1. Information We Collect
              </h3>
              <p className="text-xs leading-relaxed text-slate-600">
                To provide high-quality matchmaking, we collect information including your name, contact number, educational qualifications, religious background, photographs, and matching preferences. All personal data is encrypted both in transit and at rest.
              </p>
            </div>

            <div className="space-y-3 bg-slate-50 p-6 rounded-2xl border border-slate-100/50">
              <h3 className="font-extrabold text-slate-800 text-base flex items-center gap-2">
                <Lock className="w-5 h-5 text-[#5D34F7]" />
                2. Image & Photo Protection
              </h3>
              <p className="text-xs leading-relaxed text-slate-600">
                We implement industry-standard tools to block screenshot attempts and prevent direct downloading of member photographs. You have absolute control to choose who views your photo profile settings.
              </p>
            </div>

            <div className="space-y-3 bg-slate-50 p-6 rounded-2xl border border-slate-100/50">
              <h3 className="font-extrabold text-slate-800 text-base flex items-center gap-2">
                <Eye className="w-5 h-5 text-[#5D34F7]" />
                3. Zero Third-Party Advertising Sharing
              </h3>
              <p className="text-xs leading-relaxed text-slate-600">
                We strictly adhere to a no-ad-sharing policy. We do not sell, rent, or trade your contact or profile information with third-party tracking networks. Your details are used strictly to find compatible matches.
              </p>
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
