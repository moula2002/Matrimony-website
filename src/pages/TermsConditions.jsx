import { useNavigate } from 'react-router-dom';
import { Award, UserCheck, Scale } from 'lucide-react';
import navbarLogo from '../assets/navbar_logo.png';
import navbarName from '../assets/navbar_name.png';

export default function TermsConditions() {
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
            <h1 className="text-3xl font-black text-slate-800 tracking-tight">Terms & Conditions</h1>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mt-1">Platform Guidelines & Agreement</p>
          </div>

          <div className="prose prose-slate max-w-none text-slate-650 font-medium text-sm leading-relaxed space-y-6">
            <p>
              Welcome to Familiess Matrimony. By using our platform and matchmaking features, you agree to comply with and be bound by the following terms.
            </p>

            <div className="space-y-3 bg-slate-50 p-6 rounded-2xl border border-slate-100/50">
              <h3 className="font-extrabold text-slate-800 text-base flex items-center gap-2">
                <Scale className="w-5 h-5 text-[#5D34F7]" />
                1. Eligibility & Age Requirements
              </h3>
              <p className="text-xs leading-relaxed text-slate-600">
                You must be of legal marriageable age as per your local jurisdiction laws (e.g., 18 years or above for females, and 21 years or above for males in India) to create an account and register as a member.
              </p>
            </div>

            <div className="space-y-3 bg-slate-50 p-6 rounded-2xl border border-slate-100/50">
              <h3 className="font-extrabold text-slate-800 text-base flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-[#5D34F7]" />
                2. Profile Information Authenticity
              </h3>
              <p className="text-xs leading-relaxed text-slate-600">
                You agree to provide true, accurate, and current information when onboarding. Creating profiles with fake names, misrepresenting credentials, or using someone else's photographs is strictly prohibited.
              </p>
            </div>

            <div className="space-y-3 bg-slate-50 p-6 rounded-2xl border border-slate-100/50">
              <h3 className="font-extrabold text-slate-800 text-base flex items-center gap-2">
                <Award className="w-5 h-5 text-[#5D34F7]" />
                3. Member Code of Conduct
              </h3>
              <p className="text-xs leading-relaxed text-slate-600">
                Members must engage with other connections in a respectful and polite manner. Harassment, abusive language, sending spam connection requests, or attempting to solicit money will lead to immediate account termination.
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
