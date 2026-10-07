import { useNavigate } from 'react-router-dom';
import { Heart, Star, Sparkles } from 'lucide-react';
import navbarLogo from '../assets/navbar_logo.png';
import navbarName from '../assets/navbar_name.png';

// Couple images can fall back to standard icons or nice avatars if not found, 
// but we will use styled badges/cards with hearts.
export default function SuccessStories() {
  const navigate = useNavigate();

  const stories = [
    {
      names: "Ananya & Rahul",
      date: "Married in October 2025",
      story: "We found our perfect compatibility filter on Familiess Matrimony. The verification process gave us the peace of mind to connect and involve our families from day one.",
      quote: "A perfect match made with trust."
    },
    {
      names: "Priya & Vikram",
      date: "Married in January 2026",
      story: "The detailed family background check and personalized support team helped us navigate our preferences flawlessly. We couldn't be happier!",
      quote: "Exactly what we were looking for."
    },
    {
      names: "Neha & Rohan",
      date: "Married in April 2026",
      story: "We connected through the VIP matchmaking tier. The elite communication controls allowed us to build connection at our own pace.",
      quote: "Truly personalized matching."
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Main Content */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-12">
        <div className="bg-white rounded-3xl p-8 sm:p-12 shadow-md border border-slate-100/60 space-y-8 animate-in fade-in duration-300">
          <button
            onClick={() => navigate('/')}
            className="text-xs font-black text-[#5D34F7] hover:text-[#4024DB] uppercase tracking-wider flex items-center gap-1.5 cursor-pointer transition duration-200"
          >
            ← Back to Home
          </button>

          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-black text-slate-800 tracking-tight flex items-center gap-2">
                Success Stories
                <Heart className="w-6 h-6 text-[#5D34F7] fill-[#5D34F7]" />
              </h1>
              <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mt-1">Real Matches. Real Love Stories.</p>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-1">
            {stories.map((item, idx) => (
              <div key={idx} className="p-6 bg-slate-50 hover:bg-white hover:shadow-lg transition-all duration-300 rounded-3xl border border-slate-100 space-y-4">
                <div className="flex justify-between items-start gap-4">
                  <div className="space-y-1">
                    <h3 className="font-extrabold text-slate-800 text-lg sm:text-xl flex items-center gap-2">
                      {item.names}
                      <Sparkles className="w-4 h-4 text-amber-500 fill-amber-500" />
                    </h3>
                    <span className="block text-xs font-bold text-[#5D34F7]">{item.date}</span>
                  </div>
                  <div className="flex text-amber-400">
                    {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-current" />)}
                  </div>
                </div>

                <p className="text-slate-600 text-sm leading-relaxed font-medium italic">
                  "{item.story}"
                </p>

                <div className="pt-2 border-t border-slate-200/50 flex justify-between items-center text-xs font-bold text-slate-400 uppercase tracking-widest">
                  <span>Matched via Familiess</span>
                  <span className="text-[#5D34F7]">{item.quote}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Simple Footer */}
      <footer className="bg-slate-900 py-6 text-center text-xs text-gray-500 border-t border-slate-800">
        © 2026 Familiess Matrimony. All Rights Reserved.
      </footer>
    </div>
  );
}
