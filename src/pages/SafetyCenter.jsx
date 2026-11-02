import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ShieldCheck, AlertTriangle, Lock, Eye, PhoneCall, Flag, 
  CheckCircle2, ArrowLeft, Send, Users, HeartHandshake, FileText, ChevronRight
} from 'lucide-react';

export default function SafetyCenter() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('guidelines'); // 'guidelines' | 'redflags' | 'report' | 'privacy'

  // Report form state
  const [reportedName, setReportedName] = useState('');
  const [reportedUid, setReportedUid] = useState('');
  const [reportReason, setReportReason] = useState('money_request');
  const [reportDescription, setReportDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [reportSuccess, setReportSuccess] = useState(false);

  const handleReportSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setReportSuccess(true);
      setReportedName('');
      setReportedUid('');
      setReportDescription('');
    }, 900);
  };

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/profile');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50 pb-24 font-sans animate-in fade-in duration-300">
      <div className="max-w-6xl mx-auto lg:mx-0 lg:ml-6 xl:ml-10 px-4 mt-6 lg:px-8 space-y-6">

        {/* Header Banner */}
        <div className="bg-white rounded-3xl p-6 shadow-md border border-slate-100 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={handleBack}
              className="p-2 hover:bg-slate-50 rounded-full transition cursor-pointer border-0 bg-transparent text-slate-700"
              title="Go Back"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-200/80 flex items-center justify-center text-emerald-600 shadow-2xs">
                  <ShieldCheck size={20} />
                </div>
                <span>Safety & Trust Center</span>
              </h1>
              <p className="text-slate-400 text-xs font-bold uppercase mt-1 tracking-wider">
                Guidelines, Fraud Prevention & Protection for You and Your Family
              </p>
            </div>
          </div>

          {/* 24/7 Helpline Pill */}
          <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200/80 px-4 py-2 rounded-2xl text-emerald-800 text-xs font-extrabold shadow-2xs self-end md:self-center">
            <PhoneCall size={15} className="text-emerald-600 animate-pulse" />
            <span>24/7 Safety Helpline: 1800-419-6000</span>
          </div>
        </div>

        {/* Navigation Category Tabs */}
        <div className="bg-white rounded-2xl p-2 shadow-sm border border-slate-100 flex flex-wrap gap-1.5">
          <button
            onClick={() => { setActiveTab('guidelines'); setReportSuccess(false); }}
            className={`px-5 py-2.5 rounded-xl text-xs font-black tracking-wide transition cursor-pointer flex items-center gap-2 ${
              activeTab === 'guidelines'
                ? 'bg-[#5D34F7] text-white shadow-md shadow-[#5D34F7]/20'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            <CheckCircle2 size={15} />
            <span>Safe Matchmaking Guidelines</span>
          </button>

          <button
            onClick={() => { setActiveTab('redflags'); setReportSuccess(false); }}
            className={`px-5 py-2.5 rounded-xl text-xs font-black tracking-wide transition cursor-pointer flex items-center gap-2 ${
              activeTab === 'redflags'
                ? 'bg-[#5D34F7] text-white shadow-md shadow-[#5D34F7]/20'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            <AlertTriangle size={15} />
            <span>Red Flags & Warning Signs</span>
          </button>

          <button
            onClick={() => { setActiveTab('privacy'); setReportSuccess(false); }}
            className={`px-5 py-2.5 rounded-xl text-xs font-black tracking-wide transition cursor-pointer flex items-center gap-2 ${
              activeTab === 'privacy'
                ? 'bg-[#5D34F7] text-white shadow-md shadow-[#5D34F7]/20'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            <Lock size={15} />
            <span>Account & Privacy Security</span>
          </button>

          <button
            onClick={() => { setActiveTab('report'); setReportSuccess(false); }}
            className={`px-5 py-2.5 rounded-xl text-xs font-black tracking-wide transition cursor-pointer flex items-center gap-2 ${
              activeTab === 'report'
                ? 'bg-rose-600 text-white shadow-md shadow-rose-600/20'
                : 'text-rose-600 hover:bg-rose-50'
            }`}
          >
            <Flag size={15} />
            <span>Report Suspicious User</span>
          </button>
        </div>

        {/* Tab 1: Safe Matchmaking Guidelines */}
        {activeTab === 'guidelines' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Golden Rule Banner */}
            <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-slate-950 p-6 sm:p-8 rounded-3xl shadow-lg shadow-orange-500/15 flex flex-col md:flex-row items-center gap-5">
              <div className="w-14 h-14 rounded-2xl bg-white/20 border border-white/30 flex items-center justify-center shrink-0 text-slate-950">
                <AlertTriangle size={32} />
              </div>
              <div className="space-y-1 text-center md:text-left">
                <h3 className="text-xl font-black text-slate-950">
                  Golden Rule: Never Transfer Money or Share Financial Information
                </h3>
                <p className="text-xs sm:text-sm font-bold text-slate-900/90 leading-relaxed">
                  Familiess Matrimony has a strict zero-tolerance policy against financial requests. Under no circumstances should you ever send money, transfer funds via UPI, or assist with overseas customs / travel fees to any match.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Card 1 */}
              <div className="bg-white p-6 rounded-3xl border border-slate-150 shadow-xs space-y-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 text-[#5D34F7] flex items-center justify-center">
                  <PhoneCall size={20} />
                </div>
                <h3 className="text-base font-black text-slate-800">1. Communicate Inside the Platform First</h3>
                <p className="text-xs text-slate-500 font-medium leading-relaxed">
                  Start your conversations using Familiess messaging and in-app calling. Do not rush to share personal numbers, bank details, or private social media accounts until you have established mutual comfort and trust.
                </p>
              </div>

              {/* Card 2 */}
              <div className="bg-white p-6 rounded-3xl border border-slate-150 shadow-xs space-y-3">
                <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                  <Users size={20} />
                </div>
                <h3 className="text-base font-black text-slate-800">2. Involve Your Family Early</h3>
                <p className="text-xs text-slate-500 font-medium leading-relaxed">
                  Matrimony is a family commitment. Share potential match details with your parents, guardians, or trusted relatives early in the interaction to ensure multiple eyes evaluate the profile authenticity.
                </p>
              </div>

              {/* Card 3 */}
              <div className="bg-white p-6 rounded-3xl border border-slate-150 shadow-xs space-y-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <HeartHandshake size={20} />
                </div>
                <h3 className="text-base font-black text-slate-800">3. Safe First In-Person Meetings</h3>
                <p className="text-xs text-slate-500 font-medium leading-relaxed">
                  Always choose busy, open public venues (cafes, family restaurants, shopping complexes) for initial meetings. Arrange your own transportation, tell a friend or family member where you are, and never agree to meet in isolated locations.
                </p>
              </div>

              {/* Card 4 */}
              <div className="bg-white p-6 rounded-3xl border border-slate-150 shadow-xs space-y-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <ShieldCheck size={20} />
                </div>
                <h3 className="text-base font-black text-slate-800">4. Look for the Blue Verified Badge</h3>
                <p className="text-xs text-slate-500 font-medium leading-relaxed">
                  Profiles with the Blue Verified Badge have successfully submitted government identification documents to our administration. Prioritize connecting with verified members for higher authenticity.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Red Flags & Warning Signs */}
        {activeTab === 'redflags' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-150 space-y-6">
              <div>
                <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-rose-50 text-rose-600 border border-rose-200">
                  Fraud Detection
                </span>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight mt-2">
                  Be Vigilant: Common Scammer Behaviors
                </h2>
                <p className="text-slate-500 text-xs sm:text-sm font-semibold mt-1">
                  If any member displays one or more of the following behaviors, cease communication and report them immediately.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-rose-50/50 border border-rose-150 flex items-start gap-3">
                  <span className="text-xl">⚠️</span>
                  <div>
                    <h4 className="text-xs font-black text-rose-900">Urgent Financial Emergencies</h4>
                    <p className="text-[11px] text-rose-700/90 font-medium mt-0.5 leading-relaxed">
                      Claims of sudden medical hospitalization, accident abroad, or stranded luggage requiring quick money transfers.
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-rose-50/50 border border-rose-150 flex items-start gap-3">
                  <span className="text-xl">✈️</span>
                  <div>
                    <h4 className="text-xs font-black text-rose-900">Customs or "Gift" Scams</h4>
                    <p className="text-[11px] text-rose-700/90 font-medium mt-0.5 leading-relaxed">
                      Claims they sent an expensive gift (jewelry, electronics) and asks you to pay customs or courier clearance fees.
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-rose-50/50 border border-rose-150 flex items-start gap-3">
                  <span className="text-xl">📹</span>
                  <div>
                    <h4 className="text-xs font-black text-rose-900">Refusing Video Calls or Meeting</h4>
                    <p className="text-[11px] text-rose-700/90 font-medium mt-0.5 leading-relaxed">
                      Always has an excuse (broken camera, poor network, strict employer) to avoid a live face-to-face video call.
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-rose-50/50 border border-rose-150 flex items-start gap-3">
                  <span className="text-xl">💍</span>
                  <div>
                    <h4 className="text-xs font-black text-rose-900">Expressing Intense Love Too Fast</h4>
                    <p className="text-[11px] text-rose-700/90 font-medium mt-0.5 leading-relaxed">
                      Professing deep love or demanding an immediate marriage commitment within just a few days of texting.
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-rose-50/50 border border-rose-150 flex items-start gap-3">
                  <span className="text-xl">🎭</span>
                  <div>
                    <h4 className="text-xs font-black text-rose-900">Inconsistent Life Stories</h4>
                    <p className="text-[11px] text-rose-700/90 font-medium mt-0.5 leading-relaxed">
                      Frequent contradictions about their age, profession, salary, marital status, or family background.
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-rose-50/50 border border-rose-150 flex items-start gap-3">
                  <span className="text-xl">📲</span>
                  <div>
                    <h4 className="text-xs font-black text-rose-900">Pushing to Leave the Platform Immediately</h4>
                    <p className="text-[11px] text-rose-700/90 font-medium mt-0.5 leading-relaxed">
                      Insisting on moving immediately to encrypted private channels (Telegram, unauthorized apps) to evade safety filters.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Account & Privacy Security */}
        {activeTab === 'privacy' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-150 space-y-6">
              <div>
                <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-blue-50 text-blue-600 border border-blue-200">
                  Data Protection
                </span>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight mt-2">
                  Protecting Your Personal Data & Privacy
                </h2>
                <p className="text-slate-500 text-xs sm:text-sm font-semibold mt-1">
                  You have granular controls over who can view your photos, contacts, and horoscope.
                </p>
              </div>

              <div className="space-y-4">
                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-[#5D34F7] shrink-0">
                    <Eye size={20} />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-sm font-black text-slate-800">Photo & Gallery Privacy</h4>
                    <p className="text-xs text-slate-600 leading-relaxed font-medium">
                      Configure your photo visibility to "Everyone", "Registered Members Only", or "Only to Members I have Accepted" directly in your Settings panel.
                    </p>
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-emerald-600 shrink-0">
                    <Lock size={20} />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-sm font-black text-slate-800">Strong Password & Account Credentials</h4>
                    <p className="text-xs text-slate-600 leading-relaxed font-medium">
                      Never share your Familiess login credentials with anyone. Use a unique alphanumeric password with symbols, and update it periodically from Account Settings.
                    </p>
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-indigo-600 shrink-0">
                    <PhoneCall size={20} />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-sm font-black text-slate-800">Call & Contact Privacy</h4>
                    <p className="text-xs text-slate-600 leading-relaxed font-medium">
                      Only verified premium members can request to unlock your phone number. You can disable incoming audio/video calls anytime in Settings.
                    </p>
                  </div>
                </div>
              </div>

              {/* Link to Settings */}
              <div className="pt-2 flex justify-start">
                <button
                  onClick={() => navigate('/settings')}
                  className="px-6 py-3 bg-[#5D34F7] hover:bg-[#4024DB] text-white text-xs font-black rounded-xl transition cursor-pointer flex items-center gap-2 active:scale-95 border-0"
                >
                  <span>Go to Privacy Settings</span>
                  <ChevronRight size={15} />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Report Suspicious User Form */}
        {activeTab === 'report' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-150 space-y-6 max-w-2xl">
              <div>
                <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-rose-50 text-rose-600 border border-rose-200">
                  Incident Reporting
                </span>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight mt-2">
                  Report a Profile or Suspicious Activity
                </h2>
                <p className="text-slate-500 text-xs sm:text-sm font-semibold mt-1">
                  Our dedicated Trust & Safety Team investigates all reports within 24 hours. Your identity will remain strictly anonymous.
                </p>
              </div>

              {reportSuccess ? (
                <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 text-center space-y-3">
                  <div className="w-12 h-12 bg-emerald-500 text-white rounded-full flex items-center justify-center mx-auto shadow-md">
                    <CheckCircle2 size={24} />
                  </div>
                  <h3 className="text-base font-black text-emerald-900">Report Successfully Submitted</h3>
                  <p className="text-xs text-emerald-700 font-medium max-w-md mx-auto">
                    Thank you for helping keep Familiess Matrimony safe. Our safety team is reviewing the profile and will take immediate disciplinary action if guidelines were breached.
                  </p>
                  <button
                    onClick={() => setReportSuccess(false)}
                    className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition cursor-pointer border-0 mt-2"
                  >
                    Submit Another Report
                  </button>
                </div>
              ) : (
                <form onSubmit={handleReportSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-extrabold text-slate-700 mb-1">
                      Report Reason *
                    </label>
                    <select
                      value={reportReason}
                      onChange={(e) => setReportReason(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-[#5D34F7]"
                    >
                      <option value="money_request">Asked for money, transfer, or financial assistance</option>
                      <option value="fake_profile">Fake photographs or misrepresented personal identity</option>
                      <option value="abusive_language">Inappropriate, abusive, or harassing messages</option>
                      <option value="already_married">Already married or false marital status claim</option>
                      <option value="commercial_spam">Commercial advertising or business promotion</option>
                      <option value="other">Other safety concern</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-extrabold text-slate-700 mb-1">
                        Member Name / Email (if known)
                      </label>
                      <input
                        type="text"
                        value={reportedName}
                        onChange={(e) => setReportedName(e.target.value)}
                        placeholder="e.g. Rahul S."
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-[#5D34F7]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-extrabold text-slate-700 mb-1">
                        Member Profile UID (if known)
                      </label>
                      <input
                        type="text"
                        value={reportedUid}
                        onChange={(e) => setReportedUid(e.target.value)}
                        placeholder="e.g. UID123456"
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-[#5D34F7]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-extrabold text-slate-700 mb-1">
                      Incident Details & Explanation *
                    </label>
                    <textarea
                      required
                      rows={4}
                      value={reportDescription}
                      onChange={(e) => setReportDescription(e.target.value)}
                      placeholder="Please provide details of what occurred, messages exchanged, or reasons for concern..."
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-[#5D34F7]"
                    />
                  </div>

                  <div className="pt-2 flex items-center justify-between">
                    <p className="text-[11px] text-slate-400 font-semibold flex items-center gap-1.5">
                      <Lock size={13} className="text-emerald-500" />
                      <span>Your report is 100% confidential</span>
                    </p>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="px-6 py-3 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-black shadow-md shadow-rose-600/20 transition cursor-pointer flex items-center gap-2 disabled:opacity-50 border-0"
                    >
                      <Send size={14} />
                      <span>{isSubmitting ? 'Submitting...' : 'Submit Report'}</span>
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
