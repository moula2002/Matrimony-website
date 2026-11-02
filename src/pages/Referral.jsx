import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faGift, faCopy, faCheck, faShareAlt, faUsers, faCrown,
  faClock, faCheckCircle, faSpinner, faArrowRight, faQrcode,
  faEnvelope, faPaperPlane
} from '@fortawesome/free-solid-svg-icons';
import api from '../api/axios';

export default function Referral() {
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [referralCode, setReferralCode] = useState('');
  const [stats, setStats] = useState({
    totalReferrals: 0,
    successfulReferrals: 0,
    pendingReferrals: 0
  });
  const [history, setHistory] = useState([]);
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [error, setError] = useState('');

  const fetchReferralStats = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await api.get('/referral/me');
      if (res.data) {
        setReferralCode(res.data.referralCode || '');
        if (res.data.stats) {
          setStats(res.data.stats);
        }
        setHistory(res.data.history || []);

        // If user has no referral code yet, auto-generate one
        if (!res.data.referralCode) {
          handleGenerateCode();
        }
      }
    } catch (err) {
      console.error('Failed to fetch referral data:', err);
      setError(err.response?.data?.message || 'Could not load referral details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateCode = async () => {
    try {
      setGenerating(true);
      const res = await api.post('/referral/generate');
      if (res.data?.referralCode) {
        setReferralCode(res.data.referralCode);
      }
    } catch (err) {
      console.warn('Could not generate referral code:', err);
    } finally {
      setGenerating(false);
    }
  };

  useEffect(() => {
    fetchReferralStats();
  }, []);

  const referralLink = referralCode
    ? `${window.location.origin}/signup?ref=${referralCode}`
    : `${window.location.origin}/signup`;

  const handleCopyCode = () => {
    if (!referralCode) return;
    navigator.clipboard.writeText(referralCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2500);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(referralLink);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const shareText = `Hey! Find your ideal life partner on Familiess Matrimony. Use my referral code ${referralCode} when registering to unlock special benefits!\nJoin here: ${referralLink}`;

  const handleShareWhatsApp = () => {
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`;
    window.open(url, '_blank');
  };

  const handleShareTelegram = () => {
    const url = `https://t.me/share/url?url=${encodeURIComponent(referralLink)}&text=${encodeURIComponent(`Find your ideal life partner on Familiess Matrimony! Use referral code: ${referralCode}`)}`;
    window.open(url, '_blank');
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Join Familiess Matrimony',
          text: `Use my referral code ${referralCode} when joining Familiess Matrimony!`,
          url: referralLink,
        });
      } catch (err) {
        if (err.name !== 'AbortError') {
          handleCopyLink();
        }
      }
    } else {
      handleCopyLink();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <FontAwesomeIcon icon={faSpinner} className="animate-spin text-[#5D34F7] text-4xl" />
          <p className="text-slate-500 font-bold text-sm">Loading your referral hub...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Hero Banner */}
        <div className="relative overflow-hidden bg-gradient-to-br from-[#5D34F7] via-[#7042FA] to-[#8C62FF] rounded-3xl p-8 sm:p-12 text-white shadow-xl">
          <div className="absolute -top-12 -right-12 w-80 h-80 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>
          <div className="absolute -bottom-16 -left-12 w-64 h-64 bg-amber-400/20 rounded-full blur-2xl pointer-events-none"></div>

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 space-y-4">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/15 backdrop-blur-md border border-white/20 text-xs font-black uppercase tracking-wider text-amber-300">
                <FontAwesomeIcon icon={faGift} className="text-amber-300" />
                <span>Refer & Earn Rewards</span>
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight">
                Invite Friends, Help Them Find Love & Earn Free Premium!
              </h1>
              <p className="text-sm sm:text-base text-white/85 leading-relaxed max-w-xl font-medium">
                Share your unique invite link with friends and family looking for their life partner. When they sign up and upgrade, you both receive bonus premium membership perks!
              </p>
            </div>

            {/* Referral Code Quick Card */}
            <div className="lg:col-span-5 bg-white/10 backdrop-blur-xl border border-white/25 rounded-3xl p-6 sm:p-7 space-y-5 shadow-2xl">
              <div>
                <p className="text-xs font-black uppercase tracking-widest text-white/70">Your Referral Code</p>
                <div className="mt-2 flex items-center justify-between gap-3 bg-white/15 border border-white/30 rounded-2xl px-4 py-3.5">
                  <span className="font-mono text-xl sm:text-2xl font-black tracking-wider text-white">
                    {referralCode || (generating ? 'GENERATING...' : 'REF-FAMILY')}
                  </span>
                  <button
                    onClick={handleCopyCode}
                    className="px-3.5 py-2 bg-white text-[#5D34F7] hover:bg-amber-300 hover:text-slate-900 rounded-xl font-bold text-xs transition duration-200 shadow-md cursor-pointer flex items-center gap-1.5 shrink-0"
                  >
                    <FontAwesomeIcon icon={copiedCode ? faCheck : faCopy} />
                    <span>{copiedCode ? 'Copied!' : 'Copy Code'}</span>
                  </button>
                </div>
              </div>

              <div>
                <p className="text-xs font-black uppercase tracking-widest text-white/70">Your Personal Invite Link</p>
                <div className="mt-2 flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={referralLink}
                    className="w-full bg-white/15 border border-white/30 rounded-2xl px-3.5 py-2.5 text-xs text-white font-medium select-all focus:outline-none"
                  />
                  <button
                    onClick={handleCopyLink}
                    className="px-3.5 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-900 rounded-2xl font-black text-xs transition duration-200 shadow-md cursor-pointer whitespace-nowrap flex items-center gap-1.5 shrink-0"
                  >
                    <FontAwesomeIcon icon={copiedLink ? faCheck : faShareAlt} />
                    <span>{copiedLink ? 'Copied!' : 'Copy Link'}</span>
                  </button>
                </div>
              </div>

              {/* Social Share Buttons */}
              <div className="pt-2 flex items-center gap-2.5 flex-wrap">
                <button
                  onClick={handleShareWhatsApp}
                  className="flex-1 py-2.5 px-3 bg-[#25D366] hover:bg-[#20bd5a] text-white rounded-xl text-xs font-black flex items-center justify-center gap-2 shadow-sm transition cursor-pointer"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.711 2.598 2.669-.699c.969.54 1.772.82 2.791.82 3.181 0 5.768-2.587 5.768-5.766.001-3.182-2.585-5.768-5.768-5.768z" />
                    <path d="M12 2C6.477 2 2 6.477 2 12c0 1.891.524 3.662 1.435 5.18L2 22l4.973-1.396A9.957 9.957 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm.031 16.037c-1.077 0-2.12-.294-3.033-.84l-.218-.13-2.254.59.602-2.198-.142-.226a7.71 7.71 0 01-1.186-4.067c.002-4.27 3.477-7.744 7.75-7.744 4.271 0 7.747 3.475 7.747 7.746-.001 4.272-3.475 7.749-7.744 7.749z" />
                  </svg>
                  <span>WhatsApp</span>
                </button>
                <button
                  onClick={handleShareTelegram}
                  className="flex-1 py-2.5 px-3 bg-[#0088cc] hover:bg-[#0077b5] text-white rounded-xl text-xs font-black flex items-center justify-center gap-2 shadow-sm transition cursor-pointer"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z" />
                  </svg>
                  <span>Telegram</span>
                </button>
                <button
                  onClick={handleNativeShare}
                  className="py-2.5 px-4 bg-white/20 hover:bg-white/30 text-white rounded-xl text-xs font-black flex items-center justify-center gap-2 shadow-sm transition cursor-pointer"
                >
                  <FontAwesomeIcon icon={faShareAlt} />
                  <span>Share</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition duration-300">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider text-slate-400">Total Referrals</span>
              <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-[#5D34F7] flex items-center justify-center">
                <FontAwesomeIcon icon={faUsers} />
              </div>
            </div>
            <p className="text-3xl font-black text-slate-900 mt-3">{stats.totalReferrals}</p>
            <p className="text-xs text-slate-500 font-medium mt-1">Friends registered using your code</p>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition duration-300">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider text-slate-400">Successful Rewards</span>
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <FontAwesomeIcon icon={faCrown} />
              </div>
            </div>
            <p className="text-3xl font-black text-emerald-600 mt-3">{stats.successfulReferrals}</p>
            <p className="text-xs text-slate-500 font-medium mt-1">Eligible referrals credited with rewards</p>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition duration-300">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider text-slate-400">Pending Referrals</span>
              <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <FontAwesomeIcon icon={faClock} />
              </div>
            </div>
            <p className="text-3xl font-black text-amber-500 mt-3">{stats.pendingReferrals}</p>
            <p className="text-xs text-slate-500 font-medium mt-1">Waiting for subscription purchase</p>
          </div>
        </div>

        {/* How It Works */}
        <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-xl font-black text-slate-800 tracking-tight flex items-center gap-2.5">
              <span className="w-8 h-8 rounded-xl bg-violet-100 text-[#5D34F7] flex items-center justify-center text-sm">
                ✦
              </span>
              <span>How the Referral Program Works</span>
            </h2>
            <p className="text-xs text-slate-500 font-medium mt-1">
              Three simple steps to earn complimentary membership perks
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100 space-y-3 relative group hover:bg-white hover:border-[#5D34F7]/30 hover:shadow-md transition duration-300">
              <span className="w-8 h-8 rounded-full bg-[#5D34F7] text-white text-xs font-black flex items-center justify-center shadow-sm">
                1
              </span>
              <h3 className="font-extrabold text-slate-800 text-base">Share Your Link</h3>
              <p className="text-xs text-slate-650 leading-relaxed font-medium">
                Copy your unique invite link or referral code and share it via WhatsApp, Telegram, or social media.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100 space-y-3 relative group hover:bg-white hover:border-[#5D34F7]/30 hover:shadow-md transition duration-300">
              <span className="w-8 h-8 rounded-full bg-[#5D34F7] text-white text-xs font-black flex items-center justify-center shadow-sm">
                2
              </span>
              <h3 className="font-extrabold text-slate-800 text-base">Friends Sign Up</h3>
              <p className="text-xs text-slate-650 leading-relaxed font-medium">
                Your friend registers on Familiess Matrimony and completes their matrimony profile onboarding.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100 space-y-3 relative group hover:bg-white hover:border-[#5D34F7]/30 hover:shadow-md transition duration-300">
              <span className="w-8 h-8 rounded-full bg-[#5D34F7] text-white text-xs font-black flex items-center justify-center shadow-sm">
                3
              </span>
              <h3 className="font-extrabold text-slate-800 text-base">Enjoy Bonus Rewards</h3>
              <p className="text-xs text-slate-650 leading-relaxed font-medium">
                When they purchase a membership, you automatically receive free premium days and bonus profile unlocks!
              </p>
            </div>
          </div>
        </div>

        {/* Referral History Table */}
        <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-xl font-black text-slate-800 tracking-tight">Your Referral History</h2>
              <p className="text-xs text-slate-500 font-medium mt-0.5">Track friends who signed up with your code</p>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-600">
              {history.length} {history.length === 1 ? 'Friend' : 'Friends'}
            </span>
          </div>

          {history.length === 0 ? (
            <div className="py-12 flex flex-col items-center justify-center text-center space-y-4">
              <div className="w-16 h-16 rounded-3xl bg-slate-100 text-slate-400 flex items-center justify-center text-2xl">
                <FontAwesomeIcon icon={faGift} />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-extrabold text-slate-700">No referrals yet</h3>
                <p className="text-xs text-slate-500 max-w-sm">
                  Share your referral link with friends and colleagues looking for marriage proposals to start earning bonus rewards.
                </p>
              </div>
              <button
                onClick={handleCopyLink}
                className="mt-2 px-5 py-2.5 bg-[#5D34F7] hover:bg-[#4d28d6] text-white text-xs font-black rounded-xl transition shadow-md cursor-pointer flex items-center gap-2"
              >
                <FontAwesomeIcon icon={faCopy} />
                <span>Copy Your Referral Link</span>
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 font-black uppercase tracking-wider text-[11px]">
                    <th className="pb-3 px-4">Referred Member</th>
                    <th className="pb-3 px-4">Date Joined</th>
                    <th className="pb-3 px-4">Status</th>
                    <th className="pb-3 px-4 text-right">Reward Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {history.map((item, idx) => {
                    const referredName = item.referredUser?.profile?.name || 
                                         item.referredUser?.profile?.firstName || 
                                         'Anonymous Member';
                    const joinedDate = item.createdAt 
                      ? new Date(item.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
                      : 'Recently';
                    const isSuccess = item.status === 'successful';

                    return (
                      <tr key={item._id || idx} className="hover:bg-slate-50/80 transition duration-150">
                        <td className="py-3.5 px-4 font-bold text-slate-800 flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-violet-100 text-[#5D34F7] flex items-center justify-center font-black text-xs">
                            {referredName.charAt(0).toUpperCase()}
                          </div>
                          <span>{referredName}</span>
                        </td>
                        <td className="py-3.5 px-4 text-slate-500 font-medium">
                          {joinedDate}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold ${
                            isSuccess 
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}>
                            <FontAwesomeIcon icon={isSuccess ? faCheckCircle : faClock} className="text-[10px]" />
                            <span>{isSuccess ? 'Successful' : 'Pending Upgrade'}</span>
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right font-bold">
                          {item.rewardCredited ? (
                            <span className="text-emerald-600 font-bold">✓ Reward Credited</span>
                          ) : (
                            <span className="text-slate-400 font-medium">Pending Purchase</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
