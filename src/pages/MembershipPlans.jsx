import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import * as LucideIcons from 'lucide-react';

export default function MembershipPlans() {
  const [selectedPremiumPlan, setSelectedPremiumPlan] = useState(null);
  const [showRazorpay, setShowRazorpay] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [plans, setPlans] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoadingPlans, setIsLoadingPlans] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        setIsLoadingPlans(true);
        const response = await api.get('/public/plans');
        setPlans(response.data || []);
        
        try {
          const profileRes = await api.get('/users/profile');
          setCurrentUser(profileRes.data);
        } catch (profileErr) {
          console.warn('Could not fetch user profile for plans page', profileErr);
        }
      } catch (err) {
        console.error("Failed to fetch subscription plans:", err);
        setError('Failed to fetch subscription plans. Please try again later.');
      } finally {
        setIsLoadingPlans(false);
      }
    };
    fetchPlans();
  }, []);

  const handlePurchase = async () => {
    if (!selectedPremiumPlan) return;
    
    setError('');
    setIsSaving(true);

    try {
      const activePlan = plans.find(p => p.name === selectedPremiumPlan);
      const durationDays = activePlan ? activePlan.durationDays : 90;

      let baseDate = new Date();
      if (currentUser?.premiumMembership?.isPremium && currentUser.premiumMembership.planType === selectedPremiumPlan) {
        const currentExpiry = new Date(currentUser.premiumMembership.expiryDate);
        if (currentExpiry > baseDate) {
          baseDate = currentExpiry;
        }
      }

      const expiryDate = new Date(baseDate);
      expiryDate.setDate(expiryDate.getDate() + durationDays);

      const premiumPayload = {
        isPremium: true,
        planType: selectedPremiumPlan,
        expiryDate: expiryDate.toISOString()
      };

      await api.put('/users/profile', { premiumMembership: premiumPayload });
      
      setShowRazorpay(false);
      alert('Payment successful! Your membership has been updated.');
      navigate('/profile');
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to update membership plans.');
    } finally {
      setIsSaving(false);
    }
  };

  const activePlan = plans.find(p => p.name === selectedPremiumPlan);

  return (
    <div className="min-h-screen bg-slate-50/50 pb-24 font-sans animate-in fade-in duration-300">
      {/* Header section */}
      <div className="max-w-7xl mx-auto lg:mx-0 lg:ml-6 xl:ml-10 px-4 mt-6 lg:px-8">
        <div className="bg-white rounded-3xl p-6 shadow-md border border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/profile')}
              className="p-2 hover:bg-slate-50 rounded-full transition cursor-pointer border-0 bg-transparent text-slate-700"
            >
              <LucideIcons.ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
                <LucideIcons.Crown className="w-7 h-7 text-amber-500 animate-pulse" />
                <span>Premium Membership Plans</span>
              </h1>
              <p className="text-slate-400 text-xs font-bold uppercase mt-1 tracking-wider">
                Choose a plan to connect instantly and unlock exclusive perks
              </p>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="max-w-7xl mx-auto lg:mx-0 lg:ml-6 xl:ml-10 px-4 mt-4 lg:px-8">
          <div className="bg-red-50 text-red-600 p-4 rounded-2xl text-sm font-medium">
            {error}
          </div>
        </div>
      )}

      {/* Grid of Plans */}
      <div className="max-w-7xl mx-auto lg:mx-0 lg:ml-6 xl:ml-10 px-4 mt-8 lg:px-8">
        {isLoadingPlans ? (
          <div className="flex items-center justify-center p-12">
            <div className="text-slate-500 font-bold text-sm flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-slate-500 border-t-transparent rounded-full animate-spin"></span>
              Loading membership plans...
            </div>
          </div>
        ) : plans.length === 0 ? (
          <div className="bg-white rounded-3xl p-8 border border-slate-100 text-center text-slate-500">
            No active plans found. Please check back later.
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {plans.map((plan) => {
                const isSelected = selectedPremiumPlan === plan.name;
                const lowerName = plan.name.toLowerCase();
                const theme = lowerName.includes('gold') ? 'gold' : lowerName.includes('diamond') ? 'diamond' : lowerName.includes('platinum') ? 'platinum' : 'standard';

                let badgeBg = 'bg-gray-100 text-gray-800';
                let cardBorder = isSelected
                  ? 'border-[#5D34F7] ring-2 ring-[#5D34F7]/25 shadow-xl scale-[1.02]'
                  : 'border-gray-150 hover:border-gray-200 hover:scale-[1.01] hover:shadow-md';
                let headerBg = isSelected ? 'bg-[#5D34F7]/5' : 'bg-slate-50/50';

                if (theme === 'gold') badgeBg = 'bg-amber-100 text-amber-800';
                if (theme === 'diamond') badgeBg = 'bg-cyan-100 text-cyan-800';
                if (theme === 'platinum') badgeBg = 'bg-indigo-100 text-indigo-850';

                const planFeatures = [];
                planFeatures.push(`Send Interests: ${plan.interestsLimit === 9999 ? 'Unlimited' : (plan.interestsLimit || 0)}`);
                planFeatures.push(`View Profiles: ${plan.viewProfilesPerDay === 9999 ? 'Unlimited' : (plan.viewProfilesPerDay || 0)}`);
                if (plan.directMessaging) planFeatures.push('Direct Messaging Enabled');
                if (plan.videoCalling) planFeatures.push('Video Calling Enabled');
                if (plan.voiceCalling) planFeatures.push('Voice Calling Enabled');
                if (plan.managedByUs) planFeatures.push('Dedicated Account Manager');

                return (
                  <div
                    key={plan._id || plan.name}
                    onClick={() => setSelectedPremiumPlan(plan.name)}
                    className={`relative rounded-3xl border bg-white cursor-pointer overflow-hidden transition-all duration-300 flex flex-col justify-between ${cardBorder}`}
                  >
                    <div className={`p-6 flex-1 flex flex-col justify-between ${headerBg}`}>
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${badgeBg}`}>
                            {theme}
                          </span>
                          {isSelected && (
                            <div className="w-5 h-5 rounded-full bg-[#5D34F7] text-white flex items-center justify-center shadow-md">
                              <LucideIcons.Check className="w-3.5 h-3.5 stroke-[3]" />
                            </div>
                          )}
                        </div>
                        <h3 className="font-extrabold text-gray-950 text-base tracking-tight mb-3">{plan.name}</h3>

                        <div className="flex justify-between items-baseline mb-4">
                          <span className="text-2xl font-black text-[#5D34F7] tracking-tight">₹{plan.price.toLocaleString()}</span>
                          <span className="text-gray-400 text-[10px] font-bold uppercase tracking-wider">/ {plan.durationDays} Days</span>
                        </div>
                      </div>

                      <hr className="border-gray-150/40 my-3" />

                      <ul className="space-y-2.5 mt-2">
                        {planFeatures.map((feature, i) => (
                          <li key={i} className="flex items-start gap-2.5 text-[11px] text-gray-650 leading-relaxed font-semibold">
                            <LucideIcons.CheckCircle className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Buy Now Button section */}
            {selectedPremiumPlan && (
              <div className="mt-8 flex justify-end">
                <button
                  onClick={() => setShowRazorpay(true)}
                  className="px-8 py-4 bg-gradient-to-r from-[#5D34F7] to-[#4024DB] text-white rounded-2xl text-sm font-black shadow-lg shadow-[#5D34F7]/20 hover:opacity-95 transition cursor-pointer active:scale-95 border-0"
                >
                  {(() => {
                    const isFeaturePlan = selectedPremiumPlan.toLowerCase().includes('feature') || selectedPremiumPlan.toLowerCase().includes('promote') || selectedPremiumPlan.toLowerCase().includes('highlight');
                    const hasThisFeaturePlan = isFeaturePlan && currentUser?.isFeatured;
                    const hasThisPremiumPlan = !isFeaturePlan && currentUser?.premiumMembership?.isPremium && currentUser.premiumMembership.planType === selectedPremiumPlan;
                    
                    if (hasThisFeaturePlan || hasThisPremiumPlan) {
                      return `Proceed to Renew ${selectedPremiumPlan}`;
                    }
                    return `Proceed to Buy ${selectedPremiumPlan}`;
                  })()}
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Razorpay Mock Checkout Overlay */}
      {showRazorpay && activePlan && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-0 sm:p-4">
          <div className="w-full max-w-[420px] bg-white rounded-none sm:rounded-3xl shadow-2xl flex flex-col h-full sm:h-[90vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Razorpay Header */}
            <div className="bg-[#1F51E5] text-white p-4 flex items-center justify-between shadow-md shrink-0">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setShowRazorpay(false)}
                  className="p-1 hover:bg-white/10 rounded-full transition cursor-pointer border-0 bg-transparent"
                >
                  <LucideIcons.ArrowLeft size={22} className="text-white" />
                </button>
                <div className="w-9 h-9 bg-white/10 border border-white/20 rounded-xl flex items-center justify-center font-black text-white text-base">
                  M
                </div>
                <div>
                  <h3 className="font-bold text-sm tracking-wide">Matrimony Premium</h3>
                </div>
              </div>
              <div className="w-8 h-8 rounded-full border border-white/30 flex items-center justify-center bg-white/5">
                <LucideIcons.User size={16} className="text-white/80" />
              </div>
            </div>

            {/* Razorpay Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
              <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm space-y-4">
                <h4 className="font-bold text-gray-900 text-sm">Payment Options</h4>
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">All Payment Options</p>

                <div className="divide-y divide-gray-100">
                  {/* Cards */}
                  <div className="py-3.5 flex items-center justify-between cursor-pointer hover:bg-slate-50/50 px-1 rounded-xl transition">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                        <LucideIcons.CreditCard size={18} />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-gray-800">Cards</p>
                        <p className="text-[10px] text-gray-400">Visa, MasterCard, RuPay, Maestro</p>
                      </div>
                    </div>
                    <LucideIcons.ChevronRight size={16} className="text-gray-400" />
                  </div>

                  {/* Netbanking */}
                  <div className="py-3.5 flex items-center justify-between cursor-pointer hover:bg-slate-50/50 px-1 rounded-xl transition">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                        <LucideIcons.Landmark size={18} />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-gray-800">Netbanking</p>
                        <p className="text-[10px] text-gray-400">SBI, HDFC, ICICI, AXIS</p>
                      </div>
                    </div>
                    <LucideIcons.ChevronRight size={16} className="text-gray-400" />
                  </div>

                  {/* Wallet */}
                  <div className="py-3.5 flex items-center justify-between cursor-pointer hover:bg-slate-50/50 px-1 rounded-xl transition">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                        <LucideIcons.Wallet size={18} />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-gray-800">Wallet</p>
                        <p className="text-[10px] text-gray-400">PhonePe, Amazon Pay, Paytm</p>
                      </div>
                    </div>
                    <LucideIcons.ChevronRight size={16} className="text-gray-400" />
                  </div>
                </div>
              </div>
            </div>

            {/* Razorpay Footer */}
            <div className="p-4 bg-white border-t border-gray-100 shrink-0 flex flex-col gap-3">
              <p className="text-[10px] text-gray-400 text-center font-medium">
                By proceeding, I agree to Razorpay's <span className="font-bold text-gray-600 hover:underline cursor-pointer">Privacy Notice</span>
              </p>
              <div className="flex items-center justify-between gap-4 pt-1">
                <div>
                  <p className="text-base font-black text-gray-900 leading-none">
                    ₹{activePlan.price.toLocaleString()}
                  </p>
                  <span className="text-[9px] font-bold text-slate-400 mt-1 block">Includes GST</span>
                </div>
                <button
                  type="button"
                  onClick={handlePurchase}
                  disabled={isSaving}
                  className="flex-1 py-3 bg-black hover:bg-gray-900 text-white font-bold text-xs rounded-xl shadow-lg transition active:scale-[0.98] disabled:opacity-50 cursor-pointer text-center border-0"
                >
                  {isSaving ? 'Processing...' : 'Continue to Pay'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
