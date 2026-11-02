import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api, { getPhotoUrl } from '../api/axios';
import * as LucideIcons from 'lucide-react';
import PremiumBannerCarousel from '../components/PremiumBannerCarousel';
import PremiumPlanBadge from '../components/PremiumPlanBadge';
import VipConsultantModal from '../components/VipConsultantModal';
import VipShaadiModal from '../components/VipShaadiModal';

// Helper to calculate and parse user plan validity details accurately
const calculatePlanValidity = (currentUser, plans = []) => {
  if (!currentUser) return null;

  const pm = currentUser.premiumMembership || currentUser.profile?.premiumMembership || {};
  const hasExpiry = Boolean(pm.expiryDate);
  const expiryDate = hasExpiry ? new Date(pm.expiryDate) : null;
  const isDateValid = expiryDate instanceof Date && !isNaN(expiryDate.getTime());

  const now = new Date();

  // Find matching plan in plans list
  const matchedPlan = plans.find(
    (p) => p.name?.toLowerCase() === pm.planType?.toLowerCase()
  );
  const totalDurationDays = pm.durationDays || matchedPlan?.durationDays || 90;

  // Derive or parse start date
  let startDate = null;
  if (pm.startDate && !isNaN(new Date(pm.startDate).getTime())) {
    startDate = new Date(pm.startDate);
  } else if (pm.purchasedAt && !isNaN(new Date(pm.purchasedAt).getTime())) {
    startDate = new Date(pm.purchasedAt);
  } else if (isDateValid) {
    const derivedStart = new Date(expiryDate);
    derivedStart.setDate(derivedStart.getDate() - totalDurationDays);
    startDate = derivedStart;
  }

  let remainingDays = 0;
  let isExpired = false;
  let isExpiringSoon = false;
  let status = 'Free'; // 'Active' | 'Expiring Soon' | 'Expired' | 'Free'

  if (isDateValid) {
    const diffMs = expiryDate.getTime() - now.getTime();
    remainingDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

    if (remainingDays <= 0) {
      isExpired = true;
      remainingDays = 0;
      status = 'Expired';
    } else if (remainingDays <= 7) {
      isExpiringSoon = true;
      status = 'Expiring Soon';
    } else {
      status = 'Active';
    }
  } else if (pm.isPremium) {
    status = 'Active';
    remainingDays = totalDurationDays;
  }

  // Progress percentage (0 - 100%)
  let percentageUsed = 0;
  if (startDate && isDateValid && totalDurationDays > 0) {
    const totalMs = expiryDate.getTime() - startDate.getTime();
    const elapsedMs = now.getTime() - startDate.getTime();
    if (totalMs > 0) {
      percentageUsed = Math.min(100, Math.max(0, Math.round((elapsedMs / totalMs) * 100)));
    }
  } else if (isExpired) {
    percentageUsed = 100;
  }

  return {
    isPremium: Boolean(pm.isPremium && !isExpired),
    planName: pm.planType || (pm.isPremium ? 'Premium Plan' : 'Free Member'),
    status,
    startDate,
    expiryDate,
    hasExpiry: isDateValid,
    totalDurationDays,
    remainingDays,
    isExpired,
    isExpiringSoon,
    percentageUsed
  };
};

const formatDate = (dateObj) => {
  if (!dateObj || !(dateObj instanceof Date) || isNaN(dateObj.getTime())) {
    return 'Not Specified';
  }
  return dateObj.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
};

const isHighlightPlan = (name) => {
  const lower = String(name || '').toLowerCase();
  return lower.includes('feature') || lower.includes('highlight');
};

const DEFAULT_FEATURE_ACCOUNT_PLAN = {
  _id: 'feature_account_highlight_plan',
  name: 'Highlight My Profile',
  price: 999,
  durationDays: 30,
  interestsLimit: 9999,
  viewProfilesPerDay: 9999,
  directMessaging: true,
  videoCalling: false,
  voiceCalling: false,
  managedByUs: false
};

const getPlanDisplayName = (name) => {
  if (isHighlightPlan(name)) {
    return 'Highlight My Profile';
  }
  return name;
};

// Official Support & Helpline Configuration
const OFFICIAL_SUPPORT_PHONE = '1800-419-6000';
const OFFICIAL_SUPPORT_TEL = '18004196000';
const OFFICIAL_SUPPORT_EMAIL = 'support@familiessmatrimony.com';
const OFFICIAL_SUPPORT_HOURS = 'Mon - Sun: 9:00 AM - 7:00 PM';
const OFFICIAL_SUPPORT_WHATSAPP = 'https://wa.me/9118004196000?text=Hello%20Familiess%20Matrimony%20VIP%20Support,%20I%20need%20help%20with%20Membership%20Plans';

export default function MembershipPlans() {
  const [selectedPremiumPlan, setSelectedPremiumPlan] = useState(null);
  const [showRazorpay, setShowRazorpay] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [plans, setPlans] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoadingPlans, setIsLoadingPlans] = useState(true);
  const [showVipModal, setShowVipModal] = useState(false);
  const [showVipShaadiModal, setShowVipShaadiModal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        setIsLoadingPlans(true);
        const response = await api.get('/public/plans');
        let fetchedPlans = response.data || [];
        const hasHighlight = fetchedPlans.some(p => isHighlightPlan(p.name));
        if (!hasHighlight) {
          fetchedPlans = [DEFAULT_FEATURE_ACCOUNT_PLAN, ...fetchedPlans];
        }
        setPlans(fetchedPlans);
        
        try {
          const profileRes = await api.get('/users/profile');
          let userData = profileRes.data || {};
          const storedFeatured = localStorage.getItem('featured_account');
          if (storedFeatured) {
            try {
              const parsed = JSON.parse(storedFeatured);
              const now = new Date();
              const validUntil = parsed.validUntil ? new Date(parsed.validUntil) : null;
              if (parsed.isActive && (!validUntil || validUntil > now)) {
                userData = {
                  ...userData,
                  isFeatured: true,
                  featuredAccount: parsed
                };
              } else if (validUntil && validUntil <= now) {
                localStorage.removeItem('featured_account');
              }
            } catch (e) {
              console.warn('Error reading stored featured account:', e);
            }
          }
          setCurrentUser(userData);
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

  // Payment History and Verification States
  const [payments, setPayments] = useState([]);
  const [isLoadingPayments, setIsLoadingPayments] = useState(true);
  const [paymentError, setPaymentError] = useState('');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState('all'); // 'all' | 'incomplete' | 'pending' | 'success'

  // Complete Payment (Upload Screenshot & Reference ID) Modal States
  const [completingPayment, setCompletingPayment] = useState(null);
  const [refIdInput, setRefIdInput] = useState('');
  const [screenshotFile, setScreenshotFile] = useState(null);
  const [screenshotPreview, setScreenshotPreview] = useState(null);
  const [isSubmittingDetails, setIsSubmittingDetails] = useState(false);
  const [completionError, setCompletionError] = useState('');
  const [completionSuccess, setCompletionSuccess] = useState('');

  // Screenshot Full Screen Lightbox & Copy States
  const [viewingScreenshot, setViewingScreenshot] = useState(null);
  const [copiedTxnId, setCopiedTxnId] = useState(null);

  // Helper helpers for payments
  const formatPaymentDate = (dateVal) => {
    if (!dateVal) return 'Recently';
    const d = new Date(dateVal);
    if (isNaN(d.getTime())) return 'Recently';
    return d.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getPaymentPlanName = (p) => {
    if (p.plan && typeof p.plan === 'object' && p.plan.name) {
      return getPlanDisplayName(p.plan.name);
    }
    if (p.planName) return getPlanDisplayName(p.planName);
    if (typeof p.plan === 'string') return getPlanDisplayName(p.plan);
    return 'Membership Plan';
  };

  const getPaymentAmount = (p) => {
    if (typeof p.amount === 'number') return p.amount;
    if (p.plan && typeof p.plan === 'object' && typeof p.plan.price === 'number') return p.plan.price;
    return 0;
  };

  const getScreenshotSrc = (url) => {
    if (!url) return null;
    if (url.startsWith('data:') || url.startsWith('http')) return url;
    return getPhotoUrl(url);
  };

  const handleCopyTxn = (txnId) => {
    if (!txnId) return;
    navigator.clipboard?.writeText(txnId);
    setCopiedTxnId(txnId);
    setTimeout(() => setCopiedTxnId(null), 2000);
  };

  // Fetch payment records from server and merge with localStorage cache
  const fetchPaymentHistory = async () => {
    setIsLoadingPayments(true);
    setPaymentError('');
    try {
      let serverPayments = [];
      try {
        const res = await api.get('/users/payments');
        if (res.data && Array.isArray(res.data.data)) {
          serverPayments = res.data.data;
        } else if (Array.isArray(res.data)) {
          serverPayments = res.data;
        }
      } catch (apiErr) {
        console.warn('Could not fetch server payments:', apiErr);
      }

      // Merge with localStorage
      let localPayments = [];
      try {
        const stored = localStorage.getItem('user_payment_history');
        if (stored) {
          localPayments = JSON.parse(stored);
        }
      } catch (e) {
        console.warn('Error reading local payments:', e);
      }

      // Deduplicate: server records take priority, local incomplete ones preserved if not in server
      const merged = [...serverPayments];
      const serverIds = new Set(serverPayments.map(p => String(p._id)));
      const serverTxns = new Set(serverPayments.map(p => p.transactionId).filter(Boolean));

      localPayments.forEach(localP => {
        if (!serverIds.has(String(localP._id)) && (!localP.transactionId || !serverTxns.has(localP.transactionId))) {
          merged.push(localP);
        }
      });

      // Sort by createdAt / date descending
      merged.sort((a, b) => new Date(b.createdAt || b.date || 0) - new Date(a.createdAt || a.date || 0));
      setPayments(merged);
    } catch (err) {
      setPaymentError('Failed to load payment history.');
    } finally {
      setIsLoadingPayments(false);
    }
  };

  useEffect(() => {
    fetchPaymentHistory();
  }, []);

  // When user taps Pay, immediately create an Incomplete payment record and prompt for Ref ID & Screenshot
  const handleInitiatePayment = async () => {
    if (!selectedPremiumPlan) return;
    
    setError('');
    setIsSaving(true);

    try {
      const activePlan = plans.find(p => p.name === selectedPremiumPlan);
      if (!activePlan) return;

      const planName = getPlanDisplayName(activePlan.name);
      const amount = activePlan.price;
      const durationDays = activePlan.durationDays || 30;

      let newPaymentRecord = null;

      // Try server initiation if plan has a valid MongoDB ObjectId
      if (activePlan._id && activePlan._id.length === 24) {
        try {
          const res = await api.post('/users/payment/initiate', {
            planId: activePlan._id,
            amount: amount
          });
          if (res.data?.data) {
            newPaymentRecord = {
              ...res.data.data,
              plan: {
                _id: activePlan._id,
                name: planName,
                price: amount,
                durationDays: durationDays
              },
              planName,
              amount,
              status: 'incomplete'
            };
          }
        } catch (apiErr) {
          console.warn('Server initiate payment note:', apiErr);
        }
      }

      // If server didn't return a record, create client record
      if (!newPaymentRecord) {
        newPaymentRecord = {
          _id: 'incomp_' + Date.now(),
          plan: {
            _id: activePlan._id || 'plan_' + Date.now(),
            name: planName,
            price: amount,
            durationDays: durationDays
          },
          planName: planName,
          amount: amount,
          status: 'incomplete',
          transactionId: '',
          screenshotUrl: '',
          createdAt: new Date().toISOString()
        };
      }

      // Save to localStorage so it is preserved across page refreshes
      try {
        const stored = localStorage.getItem('user_payment_history');
        const list = stored ? JSON.parse(stored) : [];
        list.unshift(newPaymentRecord);
        localStorage.setItem('user_payment_history', JSON.stringify(list));
      } catch (e) {
        console.warn('Failed to save to localStorage:', e);
      }

      // Immediately display in state at the top!
      setPayments(prev => [newPaymentRecord, ...prev.filter(p => String(p._id) !== String(newPaymentRecord._id))]);

      // Close Razorpay modal
      setShowRazorpay(false);

      // Open the completion modal immediately so the user can upload screenshot & provide reference ID!
      openCompleteModal(newPaymentRecord);

      // Smooth scroll to payment history section
      setTimeout(() => {
        const el = document.getElementById('payment-history-section');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 250);

    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to initiate payment.');
    } finally {
      setIsSaving(false);
    }
  };

  const openCompleteModal = (payment) => {
    setCompletingPayment(payment);
    setRefIdInput(payment.transactionId || '');
    setScreenshotFile(null);
    setScreenshotPreview(payment.screenshotUrl ? getPhotoUrl(payment.screenshotUrl) : null);
    setCompletionError('');
    setCompletionSuccess('');
  };

  const handleScreenshotChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setCompletionError('Please select a valid image file (PNG, JPG, JPEG, WEBP).');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setCompletionError('Image file size must be less than 10MB.');
      return;
    }

    setCompletionError('');
    setScreenshotFile(file);

    const reader = new FileReader();
    reader.onloadend = () => {
      setScreenshotPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmitPaymentDetails = async () => {
    if (!completingPayment) return;

    const trimmedRef = refIdInput.trim();
    if (!trimmedRef) {
      setCompletionError('Please enter a valid Reference ID or Transaction ID.');
      return;
    }

    if (trimmedRef.length < 4) {
      setCompletionError('Reference ID must be at least 4 characters.');
      return;
    }

    if (!screenshotFile && !completingPayment.screenshotUrl && !screenshotPreview) {
      setCompletionError('Please select and upload your payment screenshot.');
      return;
    }

    setIsSubmittingDetails(true);
    setCompletionError('');
    setCompletionSuccess('');

    try {
      let uploadedUrl = completingPayment.screenshotUrl || '';

      // 1. Upload screenshot if a file was selected
      if (screenshotFile) {
        try {
          const formData = new FormData();
          formData.append('media', screenshotFile);
          formData.append('images', screenshotFile);

          const uploadRes = await api.post('/upload', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
          });

          if (uploadRes.data?.urls && uploadRes.data.urls.length > 0) {
            uploadedUrl = uploadRes.data.urls[0];
          }
        } catch (uploadErr) {
          console.warn('Upload API note:', uploadErr);
          if (screenshotPreview && screenshotPreview.startsWith('data:')) {
            uploadedUrl = screenshotPreview;
          } else {
            throw new Error('Failed to upload screenshot image. Please check your connection and retry.');
          }
        }
      }

      // 2. Submit payment update to server
      let serverUpdated = false;
      const paymentId = completingPayment._id;

      if (paymentId && !String(paymentId).startsWith('incomp_')) {
        try {
          await api.put(`/users/payment/${paymentId}`, {
            transactionId: trimmedRef,
            screenshotUrl: uploadedUrl
          });
          serverUpdated = true;
        } catch (putErr) {
          console.warn('PUT /users/payment/:id note:', putErr);
        }
      }

      if (!serverUpdated && completingPayment.plan?._id && completingPayment.plan._id.length === 24) {
        try {
          const postRes = await api.post('/users/payment', {
            planId: completingPayment.plan._id,
            amount: completingPayment.amount,
            transactionId: trimmedRef,
            screenshotUrl: uploadedUrl
          });
          if (postRes.data?.data) {
            serverUpdated = true;
          }
        } catch (postErr) {
          console.warn('POST /users/payment fallback note:', postErr);
        }
      }

      // 3. Update payment in state and localStorage to 'pending' (Under Verification - never auto-mark verified!)
      const updatedPayment = {
        ...completingPayment,
        transactionId: trimmedRef,
        screenshotUrl: uploadedUrl,
        status: 'pending', // Under Verification
        updatedAt: new Date().toISOString()
      };

      setPayments(prev =>
        prev.map(p => (String(p._id) === String(completingPayment._id) ? updatedPayment : p))
      );

      try {
        const stored = localStorage.getItem('user_payment_history');
        let list = stored ? JSON.parse(stored) : [];
        list = list.map(p => (String(p._id) === String(completingPayment._id) ? updatedPayment : p));
        localStorage.setItem('user_payment_history', JSON.stringify(list));
      } catch (e) {
        console.warn('LocalStorage error:', e);
      }

      setCompletionSuccess('Payment details and screenshot submitted successfully! Your payment is now Under Verification.');
      setTimeout(() => {
        setCompletingPayment(null);
        setCompletionSuccess('');
      }, 1500);

    } catch (err) {
      setCompletionError(err.message || 'Failed to submit payment details. Please retry.');
    } finally {
      setIsSubmittingDetails(false);
    }
  };

  const activePlan = plans.find(p => p.name === selectedPremiumPlan);
  const validityInfo = calculatePlanValidity(currentUser, plans);

  const sortedPlans = [...plans].sort((a, b) => {
    const isA = isHighlightPlan(a.name);
    const isB = isHighlightPlan(b.name);
    if (isA && !isB) return -1;
    if (!isA && isB) return 1;
    return 0;
  });

  return (
    <div className="min-h-screen bg-slate-50/50 pb-24 font-sans animate-in fade-in duration-300">
      {/* Header section */}
      <div className="max-w-7xl mx-auto lg:mx-0 lg:ml-6 xl:ml-10 px-4 mt-6 lg:px-8">
        <div className="bg-white rounded-3xl p-6 shadow-md border border-slate-100 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                if (window.history.length > 1) {
                  navigate(-1);
                } else {
                  navigate('/home');
                }
              }}
              className="p-2 hover:bg-slate-50 rounded-full transition cursor-pointer border-0 bg-transparent text-slate-700"
              title="Go Back"
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

          {/* Header Action Badges */}
          <div className="self-end md:self-center flex items-center gap-2.5 flex-wrap">
            <button
              type="button"
              onClick={() => {
                const el = document.getElementById('payment-history-section');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200/90 text-slate-700 rounded-2xl text-xs font-bold transition active:scale-95 cursor-pointer shadow-2xs border border-slate-200"
              title="Jump to Payment History"
            >
              <LucideIcons.Receipt size={14} className="text-[#5D34F7]" />
              <span>Payment History</span>
              {payments.filter(p => p.status === 'incomplete').length > 0 && (
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" title="Incomplete payment requires attention"></span>
              )}
            </button>
            <PremiumPlanBadge 
              user={currentUser} 
              variant="header" 
              isCurrentUser={true} 
            />
          </div>
        </div>
      </div>

      {/* Premium Hero Promotional Banners */}
      <div className="max-w-7xl mx-auto lg:mx-0 lg:ml-6 xl:ml-10 px-4 mt-6 lg:px-8">
        <PremiumBannerCarousel onSelectPlan={() => {
          if (plans.length > 0 && !selectedPremiumPlan) {
            setSelectedPremiumPlan(plans[0].name);
          }
        }} />
      </div>

      {/* Plan Validity & Membership Status Dashboard */}
      {validityInfo && (
        <div className="max-w-7xl mx-auto lg:mx-0 lg:ml-6 xl:ml-10 px-4 mt-6 lg:px-8">
          <div className={`rounded-3xl p-6 sm:p-7 border shadow-md transition-all duration-300 ${
            validityInfo.status === 'Active'
              ? 'bg-gradient-to-br from-white via-emerald-50/25 to-indigo-50/30 border-emerald-200/80'
              : validityInfo.status === 'Expiring Soon'
              ? 'bg-gradient-to-br from-white via-amber-50/35 to-orange-50/25 border-amber-300'
              : validityInfo.status === 'Expired'
              ? 'bg-gradient-to-br from-white via-rose-50/30 to-slate-50 border-rose-200'
              : 'bg-white border-slate-150'
          }`}>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100/80 pb-5">
              <div className="flex items-center gap-3.5">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-sm ${
                  validityInfo.status === 'Active'
                    ? 'bg-emerald-500 text-white'
                    : validityInfo.status === 'Expiring Soon'
                    ? 'bg-amber-500 text-white'
                    : validityInfo.status === 'Expired'
                    ? 'bg-rose-500 text-white'
                    : 'bg-[#5D34F7] text-white'
                }`}>
                  {validityInfo.status === 'Active' ? (
                    <LucideIcons.ShieldCheck size={24} />
                  ) : validityInfo.status === 'Expiring Soon' ? (
                    <LucideIcons.AlertTriangle size={24} className="animate-pulse" />
                  ) : validityInfo.status === 'Expired' ? (
                    <LucideIcons.Clock size={24} />
                  ) : (
                    <LucideIcons.Crown size={24} />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-lg font-black text-slate-900 tracking-tight">
                      Plan Validity & Subscription Details
                    </h2>
                  </div>
                  <p className="text-slate-500 text-xs font-semibold mt-0.5">
                    {validityInfo.isPremium
                      ? 'Real-time breakdown of your current plan dates and remaining validity period'
                      : validityInfo.isExpired
                      ? 'Your previous membership plan has expired. Renew below to reactivate full features.'
                      : 'You are currently on a Free Account. Select a plan below to activate membership validity.'}
                  </p>
                </div>
              </div>

              {/* Status Badge */}
              <div className="shrink-0">
                {validityInfo.status === 'Active' && (
                  <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-black bg-emerald-100 text-emerald-800 border border-emerald-300 shadow-2xs">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span>Active Subscription</span>
                  </span>
                )}
                {validityInfo.status === 'Expiring Soon' && (
                  <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-black bg-amber-100 text-amber-800 border border-amber-300 shadow-2xs animate-pulse">
                    <LucideIcons.AlertTriangle size={14} className="text-amber-600" />
                    <span>Expiring Soon ({validityInfo.remainingDays} Days Left)</span>
                  </span>
                )}
                {validityInfo.status === 'Expired' && (
                  <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-black bg-rose-100 text-rose-800 border border-rose-300 shadow-2xs">
                    <LucideIcons.XCircle size={14} className="text-rose-600" />
                    <span>Plan Expired</span>
                  </span>
                )}
                {validityInfo.status === 'Free' && (
                  <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-black bg-slate-100 text-slate-700 border border-slate-200 shadow-2xs">
                    <LucideIcons.User size={13} className="text-slate-500" />
                    <span>Free Account</span>
                  </span>
                )}
              </div>
            </div>

            {/* Grid of Key Validity Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-5">
              {/* Box 1: Current Plan Name */}
              <div className="bg-white/80 p-4 rounded-2xl border border-slate-150 shadow-2xs">
                <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block mb-1 flex items-center gap-1">
                  <LucideIcons.Crown size={12} className="text-amber-500" /> Current Plan
                </span>
                <p className="text-base font-black text-slate-900 truncate">
                  {validityInfo.planName}
                </p>
                <p className="text-[11px] text-slate-400 font-semibold mt-1">
                  {validityInfo.isPremium ? 'Active Premium Tier' : 'Standard Free Member'}
                </p>
              </div>

              {/* Box 2: Total Validity Duration */}
              <div className="bg-white/80 p-4 rounded-2xl border border-slate-150 shadow-2xs">
                <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block mb-1 flex items-center gap-1">
                  <LucideIcons.Calendar size={12} className="text-[#5D34F7]" /> Total Validity
                </span>
                <p className="text-base font-black text-slate-900">
                  {validityInfo.hasExpiry ? `${validityInfo.totalDurationDays} Days` : 'No Expiry'}
                </p>
                <p className="text-[11px] text-slate-400 font-semibold mt-1">
                  {validityInfo.hasExpiry ? `Approx. ${Math.round(validityInfo.totalDurationDays / 30)} Months Period` : 'Upgrade for Validity'}
                </p>
              </div>

              {/* Box 3: Timeline Dates */}
              <div className="bg-white/80 p-4 rounded-2xl border border-slate-150 shadow-2xs">
                <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block mb-1 flex items-center gap-1">
                  <LucideIcons.Clock size={12} className="text-blue-500" /> Expiry Date
                </span>
                <p className="text-base font-black text-slate-900">
                  {validityInfo.hasExpiry ? formatDate(validityInfo.expiryDate) : 'Not Applicable'}
                </p>
                <p className="text-[11px] text-slate-400 font-semibold mt-1">
                  {validityInfo.startDate ? `Start: ${formatDate(validityInfo.startDate)}` : 'Select a Plan Below'}
                </p>
              </div>

              {/* Box 4: Remaining Validity Days */}
              <div className="bg-white/80 p-4 rounded-2xl border border-slate-150 shadow-2xs">
                <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block mb-1 flex items-center gap-1">
                  <LucideIcons.Hourglass size={12} className="text-indigo-500" /> Remaining Validity
                </span>
                <div className="flex items-baseline gap-1.5">
                  {validityInfo.isPremium ? (
                    <>
                      <span className={`text-2xl font-black ${validityInfo.isExpiringSoon ? 'text-amber-600' : 'text-[#5D34F7]'}`}>
                        {validityInfo.remainingDays}
                      </span>
                      <span className="text-xs font-black text-slate-600">Days Left</span>
                    </>
                  ) : validityInfo.isExpired ? (
                    <span className="text-sm font-black text-rose-600">Expired ({validityInfo.remainingDays} Days)</span>
                  ) : (
                    <span className="text-sm font-black text-slate-500">0 Days Active</span>
                  )}
                </div>
                <p className="text-[11px] text-slate-400 font-semibold mt-1">
                  {validityInfo.isExpiringSoon
                    ? 'Expires within 7 days!'
                    : validityInfo.isExpired
                    ? 'Expired on ' + formatDate(validityInfo.expiryDate)
                    : validityInfo.isPremium
                    ? 'Valid and active'
                    : 'Unlock premium privileges'}
                </p>
              </div>
            </div>

            {/* Visual Progress Bar for Active / Expiring Soon plans */}
            {validityInfo.hasExpiry && (
              <div className="mt-5 pt-4 border-t border-slate-150/70">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs font-bold text-slate-500 gap-1 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-700 font-extrabold">Subscription Timeline:</span>
                    <span>{formatDate(validityInfo.startDate)}</span>
                    <LucideIcons.ArrowRight size={12} className="text-slate-400" />
                    <span className={validityInfo.isExpiringSoon ? 'text-amber-700 font-black' : 'text-slate-700 font-bold'}>
                      {formatDate(validityInfo.expiryDate)}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className={validityInfo.isExpiringSoon ? 'text-amber-600 font-black' : 'text-[#5D34F7] font-black'}>
                      {validityInfo.remainingDays} of {validityInfo.totalDurationDays} Days Remaining
                    </span>
                  </div>
                </div>
                <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      validityInfo.isExpired
                        ? 'bg-rose-500'
                        : validityInfo.isExpiringSoon
                        ? 'bg-gradient-to-r from-amber-400 to-orange-500'
                        : 'bg-gradient-to-r from-emerald-500 via-indigo-500 to-[#5D34F7]'
                    }`}
                    style={{ width: `${Math.min(100, Math.max(5, validityInfo.percentageUsed))}%` }}
                  />
                </div>
              </div>
            )}

            {/* Feature Account / Highlight My Profile Active Status Banner */}
            {Boolean(currentUser?.isFeatured || currentUser?.featuredAccount?.isActive) && (
              <div className="mt-4 p-3.5 bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-transparent border border-amber-300 rounded-2xl flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <span className="w-8 h-8 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white flex items-center justify-center text-sm shadow-xs font-black shrink-0">
                    ⭐
                  </span>
                  <div>
                    <p className="text-xs font-black text-amber-900">
                      Feature Account Active: Highlight My Profile
                    </p>
                    <p className="text-[11px] text-amber-800/80 font-medium">
                      Your profile is currently prioritized at the top of partner searches and match recommendations.
                    </p>
                  </div>
                </div>
                <span className="px-3 py-1 bg-amber-500 text-white text-[10px] font-black rounded-full uppercase tracking-wider shadow-xs shrink-0">
                  {currentUser?.featuredAccount?.validUntil
                    ? `${Math.max(0, Math.ceil((new Date(currentUser.featuredAccount.validUntil).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)))} Days Left`
                    : 'Spotlight Active'}
                </span>
              </div>
            )}

            {/* Quick Action Link to Plans */}
            <div className="mt-4 pt-4 border-t border-slate-150/70 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="text-xs font-semibold text-slate-500">
                {validityInfo.isExpiringSoon ? (
                  <span className="text-amber-700 font-bold flex items-center gap-1.5">
                    <LucideIcons.Info size={14} /> Renew early to avoid any interruption in messaging and calls.
                  </span>
                ) : validityInfo.isExpired ? (
                  <span className="text-rose-700 font-bold flex items-center gap-1.5">
                    <LucideIcons.AlertCircle size={14} /> Reactivate now to unlock your matched profiles and phone contacts.
                  </span>
                ) : validityInfo.isPremium ? (
                  <span className="text-emerald-700 font-bold flex items-center gap-1.5">
                    <LucideIcons.CheckCircle2 size={14} /> Your premium membership is active with full access to contact numbers and chat.
                  </span>
                ) : (
                  <span className="text-slate-600 flex items-center gap-1.5">
                    <LucideIcons.Sparkles size={14} className="text-[#5D34F7]" /> Select any plan below to activate instant access and direct contact details.
                  </span>
                )}
              </div>
              <button
                onClick={() => {
                  const el = document.getElementById('plans-selection-grid');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                  if (plans.length > 0 && !selectedPremiumPlan) {
                    setSelectedPremiumPlan(plans[0].name);
                  }
                }}
                className="px-4 py-2 bg-slate-900 hover:bg-[#5D34F7] text-white rounded-xl text-xs font-black shadow-xs transition active:scale-95 cursor-pointer shrink-0"
              >
                {validityInfo.isExpiringSoon ? 'Renew Membership Now' : validityInfo.isExpired ? 'Reactivate Plan' : validityInfo.isPremium ? 'Upgrade / Extend Plan' : 'View Available Plans'}
              </button>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="max-w-7xl mx-auto lg:mx-0 lg:ml-6 xl:ml-10 px-4 mt-4 lg:px-8">
          <div className="bg-red-50 text-red-600 p-4 rounded-2xl text-sm font-medium">
            {error}
          </div>
        </div>
      )}

      {/* Grid of Plans */}
      <div id="plans-selection-grid" className="max-w-7xl mx-auto lg:mx-0 lg:ml-6 xl:ml-10 px-4 mt-8 lg:px-8 scroll-mt-6">
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
              {sortedPlans.map((plan) => {
                const isSelected = selectedPremiumPlan === plan.name;
                const isFeature = isHighlightPlan(plan.name);
                const displayName = getPlanDisplayName(plan.name);
                const isCurrentPlan = (isFeature && (currentUser?.isFeatured || currentUser?.featuredAccount?.isActive)) ||
                  (!isFeature && validityInfo?.isPremium && currentUser?.premiumMembership?.planType?.toLowerCase() === plan.name.toLowerCase());
                const lowerName = plan.name.toLowerCase();
                let theme = lowerName.includes('gold') ? 'gold' : lowerName.includes('diamond') ? 'diamond' : lowerName.includes('platinum') ? 'platinum' : 'standard';
                if (isFeature) {
                  theme = 'spotlight';
                }

                let badgeBg = 'bg-gray-100 text-gray-800';
                let cardBorder = isSelected
                  ? 'border-[#5D34F7] ring-2 ring-[#5D34F7]/25 shadow-xl scale-[1.02]'
                  : 'border-gray-150 hover:border-gray-200 hover:scale-[1.01] hover:shadow-md';
                let headerBg = isSelected ? 'bg-[#5D34F7]/5' : 'bg-slate-50/50';

                if (theme === 'spotlight') badgeBg = 'bg-gradient-to-r from-amber-500 to-orange-500 text-white font-black';
                if (theme === 'gold') badgeBg = 'bg-amber-100 text-amber-800';
                if (theme === 'diamond') badgeBg = 'bg-cyan-100 text-cyan-800';
                if (theme === 'platinum') badgeBg = 'bg-indigo-100 text-indigo-850';

                const planFeatures = [];
                planFeatures.push(`Send Interests: ${plan.interestsLimit === 9999 ? 'Unlimited' : (plan.interestsLimit || 0)}`);
                planFeatures.push(`Add Contacts: ${plan.viewProfilesPerDay === 9999 ? 'Unlimited' : (plan.viewProfilesPerDay || 0)}`);
                if (plan.directMessaging) planFeatures.push('Direct Messaging Enabled');
                if (plan.videoCalling) planFeatures.push('Video Calling Enabled');
                if (plan.voiceCalling) planFeatures.push('Voice Calling Enabled');
                if (plan.managedByUs) planFeatures.push('Dedicated Account Manager');
                if (isFeature) planFeatures.push('Top Position Spotlight in Partner Searches');

                return (
                  <div
                    key={plan._id || plan.name}
                    onClick={() => setSelectedPremiumPlan(plan.name)}
                    className={`relative rounded-3xl border bg-white cursor-pointer overflow-hidden transition-all duration-300 flex flex-col justify-between ${cardBorder}`}
                  >
                    <div className={`p-6 flex-1 flex flex-col justify-between ${headerBg}`}>
                      <div>
                        {isCurrentPlan && (
                          <div className="mb-3 py-1 px-2.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-[10px] font-black flex items-center justify-between shadow-2xs">
                            <span className="flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                              <span>CURRENT ACTIVE PLAN</span>
                            </span>
                            <span>
                              {isFeature && currentUser?.featuredAccount?.validUntil
                                ? `${Math.max(0, Math.ceil((new Date(currentUser.featuredAccount.validUntil).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)))} Days Left`
                                : `${validityInfo?.remainingDays || 0} Days Left`}
                            </span>
                          </div>
                        )}
                        <div className="flex items-center justify-between mb-2">
                          <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${badgeBg}`}>
                            {isFeature ? 'TOP BOOST' : theme}
                          </span>
                          {isSelected && (
                            <div className="w-5 h-5 rounded-full bg-[#5D34F7] text-white flex items-center justify-center shadow-md">
                              <LucideIcons.Check className="w-3.5 h-3.5 stroke-[3]" />
                            </div>
                          )}
                        </div>
                        <h3 className="font-extrabold text-gray-950 text-base tracking-tight mb-2">{displayName}</h3>

                        <div className="flex justify-between items-baseline mb-2">
                          <span className="text-2xl font-black text-[#5D34F7] tracking-tight">₹{plan.price.toLocaleString()}</span>
                          <span className="text-gray-400 text-[10px] font-bold uppercase tracking-wider">/ {plan.durationDays} Days</span>
                        </div>

                        {/* Explicit Plan Validity Period Badge */}
                        <div className="mt-1 mb-3.5 flex items-center justify-between bg-slate-100/70 px-3 py-1.5 rounded-xl border border-slate-200/50">
                          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                            <LucideIcons.Calendar className="w-3.5 h-3.5 text-[#5D34F7]" />
                            <span>Validity Period</span>
                          </span>
                          <span className="text-xs font-black text-slate-800">
                            {plan.durationDays} Days ({Math.round(plan.durationDays / 30)} Months)
                          </span>
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
                    const isFeaturePlan = isHighlightPlan(selectedPremiumPlan);
                    const hasThisFeaturePlan = isFeaturePlan && (currentUser?.isFeatured || currentUser?.featuredAccount?.isActive);
                    const hasThisPremiumPlan = !isFeaturePlan && currentUser?.premiumMembership?.isPremium && currentUser.premiumMembership.planType === selectedPremiumPlan;
                    const displaySelectedName = getPlanDisplayName(selectedPremiumPlan);
                    
                    if (hasThisFeaturePlan || hasThisPremiumPlan) {
                      return `Proceed to Renew ${displaySelectedName}`;
                    }
                    return `Proceed to Buy ${displaySelectedName}`;
                  })()}
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Payment History & Receipts Section */}
      <div id="payment-history-section" className="max-w-7xl mx-auto lg:mx-0 lg:ml-6 xl:ml-10 px-4 mt-12 lg:px-8 scroll-mt-6 space-y-6">
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-150 shadow-md">
          {/* Section Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 text-[#5D34F7] flex items-center justify-center shrink-0 shadow-xs">
                <LucideIcons.Receipt size={24} />
              </div>
              <div>
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                    Payment History & Receipts
                  </h3>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-slate-100 text-slate-700 border border-slate-200">
                    {payments.length} {payments.length === 1 ? 'Record' : 'Records'}
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
                  Track your plan payments, upload verification receipts, and monitor approval status.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-center">
              <button
                type="button"
                onClick={fetchPaymentHistory}
                disabled={isLoadingPayments}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold transition active:scale-95 cursor-pointer disabled:opacity-50"
                title="Refresh payment records"
              >
                <LucideIcons.RefreshCw size={13} className={isLoadingPayments ? 'animate-spin text-[#5D34F7]' : 'text-slate-500'} />
                <span>Refresh</span>
              </button>
            </div>
          </div>

          {/* Status Filter Tabs */}
          <div className="mt-5 flex items-center gap-2 overflow-x-auto pb-1 text-xs font-bold scrollbar-none">
            {[
              { id: 'all', label: 'All Records', count: payments.length },
              { id: 'incomplete', label: 'Incomplete', count: payments.filter(p => p.status === 'incomplete').length, alert: true },
              { id: 'pending', label: 'Under Verification', count: payments.filter(p => p.status === 'pending').length },
              { id: 'success', label: 'Verified & Active', count: payments.filter(p => p.status === 'success').length }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setPaymentStatusFilter(tab.id)}
                className={`px-3.5 py-1.5 rounded-xl transition cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                  paymentStatusFilter === tab.id
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100/80 text-slate-600 hover:bg-slate-200/80'
                }`}
              >
                <span>{tab.label}</span>
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                  paymentStatusFilter === tab.id
                    ? 'bg-white/20 text-white'
                    : tab.alert && tab.count > 0
                    ? 'bg-amber-200 text-amber-900 font-black'
                    : 'bg-slate-200 text-slate-700'
                }`}>
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          {/* Payment List Content */}
          <div className="mt-6">
            {isLoadingPayments ? (
              <div className="space-y-4">
                {[1, 2].map(n => (
                  <div key={n} className="p-5 rounded-2xl border border-slate-150 bg-slate-50/50 animate-pulse flex flex-col sm:flex-row justify-between gap-4">
                    <div className="space-y-2.5">
                      <div className="h-4 w-32 bg-slate-200 rounded-lg"></div>
                      <div className="h-6 w-48 bg-slate-200 rounded-lg"></div>
                      <div className="h-3 w-40 bg-slate-200 rounded-lg"></div>
                    </div>
                    <div className="h-10 w-28 bg-slate-200 rounded-xl self-end sm:self-center"></div>
                  </div>
                ))}
              </div>
            ) : paymentError ? (
              <div className="p-5 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-2.5">
                  <LucideIcons.AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
                  <span className="text-xs sm:text-sm font-semibold">{paymentError}</span>
                </div>
                <button
                  onClick={fetchPaymentHistory}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition shrink-0"
                >
                  Try Again
                </button>
              </div>
            ) : (() => {
              const filtered = payments.filter(p => {
                if (paymentStatusFilter === 'all') return true;
                return p.status === paymentStatusFilter;
              });

              if (filtered.length === 0) {
                return (
                  <div className="py-12 px-4 rounded-2xl border border-dashed border-slate-200 text-center bg-slate-50/40">
                    <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
                      <LucideIcons.Receipt size={28} />
                    </div>
                    <h4 className="text-base font-black text-slate-800">
                      {paymentStatusFilter === 'all'
                        ? 'No payment records found yet'
                        : `No ${paymentStatusFilter} payment records found`}
                    </h4>
                    <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 leading-relaxed">
                      {paymentStatusFilter === 'all'
                        ? 'When you initiate a plan or submit a payment receipt, your transaction details and verification statuses will appear right here.'
                        : 'There are currently no transactions matching this status filter.'}
                    </p>
                    {paymentStatusFilter === 'all' && (
                      <button
                        onClick={() => {
                          const el = document.getElementById('plans-selection-grid');
                          if (el) el.scrollIntoView({ behavior: 'smooth' });
                        }}
                        className="mt-4 px-5 py-2.5 bg-slate-900 hover:bg-[#5D34F7] text-white rounded-xl text-xs font-black shadow-xs transition active:scale-95 cursor-pointer"
                      >
                        Explore Membership Plans
                      </button>
                    )}
                  </div>
                );
              }

              return (
                <div className="space-y-4">
                  {filtered.map((payment) => {
                    const planTitle = getPaymentPlanName(payment);
                    const amountVal = getPaymentAmount(payment);
                    const formattedDate = formatPaymentDate(payment.createdAt || payment.date);
                    const statusVal = payment.status || 'incomplete';
                    const hasRef = Boolean(payment.transactionId && payment.transactionId.trim());
                    const hasSS = Boolean(payment.screenshotUrl);

                    return (
                      <div
                        key={payment._id || payment.transactionId || Math.random()}
                        className={`rounded-2xl border transition duration-200 overflow-hidden ${
                          statusVal === 'incomplete'
                            ? 'bg-amber-50/20 border-amber-200/90 shadow-2xs hover:border-amber-300'
                            : statusVal === 'pending'
                            ? 'bg-indigo-50/15 border-indigo-150 shadow-2xs hover:border-indigo-300'
                            : statusVal === 'success'
                            ? 'bg-emerald-50/15 border-emerald-150 shadow-2xs hover:border-emerald-300'
                            : 'bg-white border-slate-150 shadow-2xs'
                        }`}
                      >
                        <div className="p-5 sm:p-6 flex flex-col space-y-4">
                          {/* Row 1: Status Pill and Date */}
                          <div className="flex flex-wrap items-center justify-between gap-3">
                            <div>
                              {statusVal === 'incomplete' ? (
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-amber-100 text-amber-900 border border-amber-300">
                                  <LucideIcons.AlertTriangle size={13} className="text-amber-700" />
                                  <span>Incomplete</span>
                                </span>
                              ) : statusVal === 'pending' ? (
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-indigo-100 text-[#5D34F7] border border-indigo-200">
                                  <LucideIcons.Clock size={13} className="text-[#5D34F7]" />
                                  <span>Under Verification</span>
                                </span>
                              ) : statusVal === 'success' ? (
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-300">
                                  <LucideIcons.CheckCircle2 size={13} className="text-emerald-700" />
                                  <span>Verified & Active</span>
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-rose-100 text-rose-800 border border-rose-300">
                                  <LucideIcons.XCircle size={13} className="text-rose-700" />
                                  <span>Failed</span>
                                </span>
                              )}
                            </div>

                            <span className="text-xs text-slate-400 font-bold flex items-center gap-1.5">
                              <LucideIcons.Calendar size={13} className="text-slate-400" />
                              <span>{formattedDate}</span>
                            </span>
                          </div>

                          {/* Row 2: Plan Name, Amount & Details */}
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div>
                              <h4 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
                                <LucideIcons.Crown size={18} className="text-amber-500" />
                                <span>{planTitle}</span>
                              </h4>
                              <div className="flex items-baseline gap-2 mt-0.5">
                                <span className="text-2xl font-black text-[#5D34F7] tracking-tight">
                                  ₹{amountVal.toLocaleString()}
                                </span>
                                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                                  Amount Paid / Due
                                </span>
                              </div>
                            </div>

                            {/* Reference and Screenshot Info Badges */}
                            <div className="flex flex-wrap items-center gap-3">
                              {/* Reference ID Pill */}
                              <div>
                                {hasRef ? (
                                  <div className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 rounded-xl shadow-2xs">
                                    <span className="text-[10px] font-extrabold uppercase text-slate-400">Ref:</span>
                                    <span className="font-mono text-xs font-black text-slate-800 tracking-tight">
                                      {payment.transactionId}
                                    </span>
                                    <button
                                      type="button"
                                      onClick={() => handleCopyTxn(payment.transactionId)}
                                      className="text-slate-400 hover:text-slate-700 transition cursor-pointer p-0.5 border-0 bg-transparent"
                                      title="Copy Transaction Reference ID"
                                    >
                                      {copiedTxnId === payment.transactionId ? (
                                        <LucideIcons.Check size={13} className="text-emerald-600" />
                                      ) : (
                                        <LucideIcons.Copy size={13} />
                                      )}
                                    </button>
                                  </div>
                                ) : (
                                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 border border-amber-200 rounded-xl text-xs font-bold text-amber-800">
                                    <LucideIcons.AlertCircle size={13} className="text-amber-600" />
                                    <span>Missing Ref ID</span>
                                  </span>
                                )}
                              </div>

                              {/* Screenshot Pill */}
                              <div>
                                {hasSS ? (
                                  <button
                                    type="button"
                                    onClick={() => setViewingScreenshot(payment.screenshotUrl)}
                                    className="inline-flex items-center gap-2 px-3 py-1.5 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 shadow-2xs transition active:scale-95 cursor-pointer group"
                                    title="View Uploaded Payment Screenshot"
                                  >
                                    <LucideIcons.Image size={14} className="text-[#5D34F7] group-hover:scale-110 transition" />
                                    <span>View Screenshot</span>
                                    <LucideIcons.Maximize2 size={12} className="text-slate-400" />
                                  </button>
                                ) : (
                                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 border border-amber-200 rounded-xl text-xs font-bold text-amber-800">
                                    <LucideIcons.ImageOff size={13} className="text-amber-600" />
                                    <span>Missing Screenshot</span>
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Row 3: Action Banners depending on status */}
                          {statusVal === 'incomplete' && (
                            <div className="pt-3 border-t border-amber-200/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-amber-100/40 -mx-5 sm:-mx-6 -mb-5 sm:-mb-6 p-4 rounded-b-2xl">
                              <div className="flex items-start gap-2">
                                <LucideIcons.AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                                <div className="text-xs text-amber-900 leading-tight">
                                  <span className="font-extrabold block">Incomplete Payment — Required Details Missing:</span>
                                  <span className="text-amber-800 font-medium">
                                    {!hasRef && !hasSS
                                      ? 'Please submit your Transaction Reference ID and upload payment screenshot.'
                                      : !hasRef
                                      ? 'Please provide your Transaction Reference ID.'
                                      : 'Please upload your payment screenshot.'}
                                  </span>
                                </div>
                              </div>
                              <button
                                type="button"
                                onClick={() => openCompleteModal(payment)}
                                className="px-4 py-2 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-black text-xs rounded-xl shadow-xs transition active:scale-95 flex items-center gap-2 cursor-pointer shrink-0"
                              >
                                <LucideIcons.UploadCloud size={14} />
                                <span>Upload Screenshot & Submit Ref ID</span>
                              </button>
                            </div>
                          )}

                          {statusVal === 'pending' && (
                            <div className="pt-3 border-t border-indigo-150 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-indigo-50/40 -mx-5 sm:-mx-6 -mb-5 sm:-mb-6 p-4 rounded-b-2xl text-xs">
                              <div className="flex items-center gap-2 text-indigo-900 font-semibold">
                                <LucideIcons.Clock className="w-4 h-4 text-[#5D34F7] shrink-0" />
                                <span>Under Verification: Your reference ID and screenshot are being reviewed by our team.</span>
                              </div>
                              <button
                                type="button"
                                onClick={() => openCompleteModal(payment)}
                                className="text-xs font-bold text-[#5D34F7] hover:underline cursor-pointer shrink-0 border-0 bg-transparent"
                              >
                                Update / Retry Details
                              </button>
                            </div>
                          )}

                          {statusVal === 'success' && (
                            <div className="pt-3 border-t border-emerald-150 flex items-center gap-2 text-xs font-bold text-emerald-800 bg-emerald-50/40 -mx-5 sm:-mx-6 -mb-5 sm:-mb-6 p-4 rounded-b-2xl">
                              <LucideIcons.CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                              <span>Payment verified. Your membership features are active and up to date.</span>
                            </div>
                          )}

                          {statusVal === 'failed' && (
                            <div className="pt-3 border-t border-rose-150 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-rose-50/40 -mx-5 sm:-mx-6 -mb-5 sm:-mb-6 p-4 rounded-b-2xl text-xs">
                              <div className="flex items-center gap-2 text-rose-800 font-bold">
                                <LucideIcons.XCircle className="w-4 h-4 text-rose-600 shrink-0" />
                                <span>Payment verification failed. Please check your reference ID and re-upload screenshot.</span>
                              </div>
                              <button
                                type="button"
                                onClick={() => openCompleteModal(payment)}
                                className="px-3.5 py-1.5 bg-rose-600 text-white rounded-lg text-xs font-bold hover:bg-rose-700 transition"
                              >
                                Retry Submission
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })()}
          </div>
        </div>
      </div>

      {/* Redesigned VIP Support Section matching Add-on box styling */}
      <div className="max-w-7xl mx-auto lg:mx-0 lg:ml-6 xl:ml-10 px-4 mt-8 lg:px-8">
        <div className="bg-white rounded-2xl border border-slate-150 p-6 sm:p-7 shadow-xs hover:border-[#5D34F7]/30 hover:shadow-md transition duration-300">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-start sm:items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-purple-50 text-[#5D34F7] border border-purple-100 flex items-center justify-center shrink-0 shadow-xs">
                <LucideIcons.Headphones size={24} className="text-[#5D34F7]" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                    VIP Support
                  </h3>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-300">
                    Live Helpline
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-slate-500 font-medium leading-relaxed max-w-2xl">
                  Our dedicated relationship managers and support team are available to help you choose the right package and assist with your account.
                </p>
                <div className="flex items-center gap-4 pt-1 text-xs text-slate-400 font-bold flex-wrap">
                  <span className="flex items-center gap-1.5">
                    <LucideIcons.Clock size={13} className="text-slate-500" />
                    <span>{OFFICIAL_SUPPORT_HOURS}</span>
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1.5">
                    <LucideIcons.Mail size={13} className="text-slate-500" />
                    <a href={`mailto:${OFFICIAL_SUPPORT_EMAIL}`} className="hover:text-[#5D34F7] underline transition">
                      {OFFICIAL_SUPPORT_EMAIL}
                    </a>
                  </span>
                </div>
              </div>
            </div>

            {/* Clickable Support Call CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto shrink-0">
              {OFFICIAL_SUPPORT_PHONE ? (
                <a
                  href={`tel:${OFFICIAL_SUPPORT_TEL}`}
                  className="flex items-center justify-center gap-2.5 px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl font-black text-sm shadow-md shadow-emerald-600/20 transition active:scale-95 text-center cursor-pointer group no-underline"
                  title={`Call Customer Support (${OFFICIAL_SUPPORT_PHONE})`}
                >
                  <LucideIcons.PhoneCall size={16} className="text-white group-hover:scale-110 transition animate-pulse" />
                  <span>Call Now ({OFFICIAL_SUPPORT_PHONE})</span>
                </a>
              ) : (
                <a
                  href={`mailto:${OFFICIAL_SUPPORT_EMAIL}`}
                  className="flex items-center justify-center gap-2 px-5 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-black text-xs shadow-md transition active:scale-95 no-underline"
                >
                  <LucideIcons.Mail size={15} />
                  <span>Email VIP Support</span>
                </a>
              )}

              <button
                type="button"
                onClick={() => setShowVipShaadiModal(true)}
                className="flex items-center justify-center gap-2 px-5 py-3 bg-gradient-to-r from-amber-400 via-yellow-400 to-orange-400 hover:from-amber-300 hover:to-orange-300 text-slate-950 font-black text-xs rounded-xl shadow-md shadow-amber-500/25 transition active:scale-95 cursor-pointer border border-amber-300"
              >
                <span>👑</span>
                <span>VIP Familiess – Get Invited</span>
              </button>

              <button
                type="button"
                onClick={() => setShowVipModal(true)}
                className="flex items-center justify-center gap-2 px-5 py-3 bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 font-black text-xs rounded-xl shadow-2xs transition active:scale-95 cursor-pointer"
              >
                <span>👑</span>
                <span>VIP Consultant Details</span>
              </button>

              {OFFICIAL_SUPPORT_WHATSAPP && (
                <a
                  href={OFFICIAL_SUPPORT_WHATSAPP}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 rounded-xl font-black text-xs shadow-2xs transition active:scale-95 text-center cursor-pointer no-underline"
                  title="Chat on WhatsApp"
                >
                  <span className="text-[#25D366] text-base">💬</span>
                  <span>WhatsApp Support</span>
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Redesigned Plan Features Comparison Matrix (Feature 9) */}
      <div className="max-w-7xl mx-auto lg:mx-0 lg:ml-6 xl:ml-10 px-4 mt-12 lg:px-8 space-y-6">
        <div className="bg-gradient-to-br from-white via-slate-50 to-indigo-50/40 rounded-3xl p-6 sm:p-10 border border-slate-150 shadow-md">
          <div className="text-center max-w-2xl mx-auto mb-8">
            <span className="px-3.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#5D34F7]/10 text-[#5D34F7] border border-[#5D34F7]/20">
              Feature Comparison Matrix
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-3">
              Compare Plan Features & Privileges
            </h2>
            <p className="text-slate-500 text-xs sm:text-sm font-semibold mt-2">
              Review included features, daily contact viewing limits, calling access, and VIP matchmaking privileges across each membership level.
            </p>
          </div>

          {/* Feature Comparison Matrix Table with solid ticks, outline ticks, and strikethrough styling */}
          <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-xs">
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/80">
                  <th className="py-4 px-5 text-xs font-black uppercase tracking-wider text-slate-700 w-1/3">
                    Features & Benefits
                  </th>
                  <th className="py-4 px-4 text-xs font-black uppercase tracking-wider text-slate-600 text-center">
                    Free Member
                  </th>
                  <th className="py-4 px-4 text-xs font-black uppercase tracking-wider text-amber-700 text-center bg-amber-50/40">
                    Silver / Gold
                  </th>
                  <th className="py-4 px-4 text-xs font-black uppercase tracking-wider text-cyan-700 text-center bg-cyan-50/40">
                    Diamond
                  </th>
                  <th className="py-4 px-4 text-xs font-black uppercase tracking-wider text-[#5D34F7] text-center bg-purple-50/50">
                    VIP Assisted
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {/* 1. Daily Contact Viewing Limit */}
                <tr className="hover:bg-slate-50/50 transition">
                  <td className="py-3.5 px-5 font-bold text-slate-800">
                    <div>Daily Contact Viewing Limit</div>
                    <span className="text-[11px] text-slate-400 font-normal">Maximum 5 contacts per day for paid members</span>
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <span className="inline-flex items-center gap-1 line-through text-slate-400 font-semibold">
                      <LucideIcons.XCircle size={14} className="text-slate-300" />
                      0 Contacts
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-center bg-amber-50/20">
                    <span className="inline-flex items-center gap-1.5 text-amber-800 font-black">
                      <LucideIcons.CheckCircle2 size={16} className="text-emerald-600 fill-emerald-100" />
                      5 / Day
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-center bg-cyan-50/20">
                    <span className="inline-flex items-center gap-1.5 text-cyan-800 font-black">
                      <LucideIcons.CheckCircle2 size={16} className="text-emerald-600 fill-emerald-100" />
                      5 / Day
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-center bg-purple-50/30">
                    <span className="inline-flex items-center gap-1.5 text-[#5D34F7] font-black">
                      <LucideIcons.CheckCircle2 size={16} className="text-emerald-600 fill-emerald-100" />
                      5 / Day (Priority)
                    </span>
                  </td>
                </tr>

                {/* 2. Direct Phone & WhatsApp Access */}
                <tr className="hover:bg-slate-50/50 transition">
                  <td className="py-3.5 px-5 font-bold text-slate-800">
                    <div>Direct Contact Numbers & WhatsApp</div>
                    <span className="text-[11px] text-slate-400 font-normal">View verified mobile numbers of liked profiles</span>
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <span className="inline-flex items-center gap-1 line-through text-slate-400 font-semibold">
                      <LucideIcons.XCircle size={14} className="text-slate-300" />
                      Locked
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-center bg-amber-50/20">
                    <span className="inline-flex items-center gap-1.5 text-emerald-700 font-black">
                      <LucideIcons.CheckCircle2 size={16} className="text-emerald-600 fill-emerald-100" />
                      Direct Unlock
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-center bg-cyan-50/20">
                    <span className="inline-flex items-center gap-1.5 text-emerald-700 font-black">
                      <LucideIcons.CheckCircle2 size={16} className="text-emerald-600 fill-emerald-100" />
                      Direct Unlock
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-center bg-purple-50/30">
                    <span className="inline-flex items-center gap-1.5 text-emerald-700 font-black">
                      <LucideIcons.CheckCircle2 size={16} className="text-emerald-600 fill-emerald-100" />
                      Direct Unlock
                    </span>
                  </td>
                </tr>

                {/* 3. Send Interests */}
                <tr className="hover:bg-slate-50/50 transition">
                  <td className="py-3.5 px-5 font-bold text-slate-800">
                    <div>Send Connection Interests</div>
                    <span className="text-[11px] text-slate-400 font-normal">Express interest to initiate connection</span>
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <span className="inline-flex items-center gap-1 text-slate-600 font-bold">
                      <LucideIcons.CheckCircle2 size={15} className="text-indigo-400" />
                      Limited (5 Total)
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-center bg-amber-50/20">
                    <span className="inline-flex items-center gap-1.5 text-emerald-700 font-black">
                      <LucideIcons.CheckCircle2 size={16} className="text-emerald-600 fill-emerald-100" />
                      Unlimited
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-center bg-cyan-50/20">
                    <span className="inline-flex items-center gap-1.5 text-emerald-700 font-black">
                      <LucideIcons.CheckCircle2 size={16} className="text-emerald-600 fill-emerald-100" />
                      Unlimited
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-center bg-purple-50/30">
                    <span className="inline-flex items-center gap-1.5 text-emerald-700 font-black">
                      <LucideIcons.CheckCircle2 size={16} className="text-emerald-600 fill-emerald-100" />
                      Unlimited
                    </span>
                  </td>
                </tr>

                {/* 4. In-App Chat / Text Messaging */}
                <tr className="hover:bg-slate-50/50 transition">
                  <td className="py-3.5 px-5 font-bold text-slate-800">
                    <div>Direct In-App Chat & Messages</div>
                    <span className="text-[11px] text-slate-400 font-normal">Exchange messages with connected profiles</span>
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <span className="inline-flex items-center gap-1 text-slate-500 font-semibold">
                      <LucideIcons.CheckCircle2 size={14} className="text-indigo-400" />
                      With Premium Only
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-center bg-amber-50/20">
                    <span className="inline-flex items-center gap-1.5 text-emerald-700 font-black">
                      <LucideIcons.CheckCircle2 size={16} className="text-emerald-600 fill-emerald-100" />
                      Unlimited (All Members)
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-center bg-cyan-50/20">
                    <span className="inline-flex items-center gap-1.5 text-emerald-700 font-black">
                      <LucideIcons.CheckCircle2 size={16} className="text-emerald-600 fill-emerald-100" />
                      Unlimited (All Members)
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-center bg-purple-50/30">
                    <span className="inline-flex items-center gap-1.5 text-emerald-700 font-black">
                      <LucideIcons.CheckCircle2 size={16} className="text-emerald-600 fill-emerald-100" />
                      Unlimited (All Members)
                    </span>
                  </td>
                </tr>

                {/* 5. In-App Voice Calling */}
                <tr className="hover:bg-slate-50/50 transition">
                  <td className="py-3.5 px-5 font-bold text-slate-800">
                    <div>In-App Voice Calling</div>
                    <span className="text-[11px] text-slate-400 font-normal">Call members without exposing private phone number</span>
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <span className="inline-flex items-center gap-1 line-through text-slate-400 font-semibold">
                      <LucideIcons.XCircle size={14} className="text-slate-300" />
                      Not Allowed
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-center bg-amber-50/20">
                    <span className="inline-flex items-center gap-1.5 text-emerald-700 font-black">
                      <LucideIcons.CheckCircle2 size={16} className="text-emerald-600 fill-emerald-100" />
                      Included
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-center bg-cyan-50/20">
                    <span className="inline-flex items-center gap-1.5 text-emerald-700 font-black">
                      <LucideIcons.CheckCircle2 size={16} className="text-emerald-600 fill-emerald-100" />
                      Included
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-center bg-purple-50/30">
                    <span className="inline-flex items-center gap-1.5 text-emerald-700 font-black">
                      <LucideIcons.CheckCircle2 size={16} className="text-emerald-600 fill-emerald-100" />
                      Included
                    </span>
                  </td>
                </tr>

                {/* 6. In-App HD Video Calling */}
                <tr className="hover:bg-slate-50/50 transition">
                  <td className="py-3.5 px-5 font-bold text-slate-800">
                    <div>HD In-App Video Calling</div>
                    <span className="text-[11px] text-slate-400 font-normal">Face-to-face video introductions with matches</span>
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <span className="inline-flex items-center gap-1 line-through text-slate-400 font-semibold">
                      <LucideIcons.XCircle size={14} className="text-slate-300" />
                      Not Available
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-center bg-amber-50/20">
                    <span className="inline-flex items-center gap-1 line-through text-slate-400 font-semibold">
                      <LucideIcons.XCircle size={14} className="text-slate-300" />
                      Not Available
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-center bg-cyan-50/20">
                    <span className="inline-flex items-center gap-1.5 text-emerald-700 font-black">
                      <LucideIcons.CheckCircle2 size={16} className="text-emerald-600 fill-emerald-100" />
                      Included
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-center bg-purple-50/30">
                    <span className="inline-flex items-center gap-1.5 text-emerald-700 font-black">
                      <LucideIcons.CheckCircle2 size={16} className="text-emerald-600 fill-emerald-100" />
                      Included
                    </span>
                  </td>
                </tr>

                {/* 7. Kundali & Astrology Match */}
                <tr className="hover:bg-slate-50/50 transition">
                  <td className="py-3.5 px-5 font-bold text-slate-800">
                    <div>Kundali & Horoscope Matching</div>
                    <span className="text-[11px] text-slate-400 font-normal">Vedic 36 Guna Milap and compatibility reports</span>
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <span className="inline-flex items-center gap-1 line-through text-slate-400 font-semibold">
                      <LucideIcons.XCircle size={14} className="text-slate-300" />
                      Basic
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-center bg-amber-50/20">
                    <span className="inline-flex items-center gap-1 text-slate-700 font-bold">
                      <LucideIcons.CheckCircle2 size={15} className="text-indigo-400" />
                      Standard Report
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-center bg-cyan-50/20">
                    <span className="inline-flex items-center gap-1.5 text-emerald-700 font-black">
                      <LucideIcons.CheckCircle2 size={16} className="text-emerald-600 fill-emerald-100" />
                      Detailed 36 Gunas
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-center bg-purple-50/30">
                    <span className="inline-flex items-center gap-1.5 text-emerald-700 font-black">
                      <LucideIcons.CheckCircle2 size={16} className="text-emerald-600 fill-emerald-100" />
                      Detailed 36 Gunas
                    </span>
                  </td>
                </tr>

                {/* 8. Spotlight / Highlight My Profile */}
                <tr className="hover:bg-slate-50/50 transition">
                  <td className="py-3.5 px-5 font-bold text-slate-800">
                    <div>Search Priority & Top Spotlight</div>
                    <span className="text-[11px] text-slate-400 font-normal">Boost profile ranking in search results and feeds</span>
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <span className="inline-flex items-center gap-1 line-through text-slate-400 font-semibold">
                      <LucideIcons.XCircle size={14} className="text-slate-300" />
                      Standard Listing
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-center bg-amber-50/20">
                    <span className="inline-flex items-center gap-1 text-slate-700 font-bold">
                      <LucideIcons.CheckCircle2 size={15} className="text-indigo-400" />
                      Standard Boost
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-center bg-cyan-50/20">
                    <span className="inline-flex items-center gap-1.5 text-emerald-700 font-black">
                      <LucideIcons.CheckCircle2 size={16} className="text-emerald-600 fill-emerald-100" />
                      2X Search Priority
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-center bg-purple-50/30">
                    <span className="inline-flex items-center gap-1.5 text-emerald-700 font-black">
                      <LucideIcons.CheckCircle2 size={16} className="text-emerald-600 fill-emerald-100" />
                      3X Top Spotlight
                    </span>
                  </td>
                </tr>

                {/* 9. VIP Consultant & Assisted Matchmaking */}
                <tr className="hover:bg-slate-50/50 transition">
                  <td className="py-3.5 px-5 font-bold text-slate-800">
                    <div>Personal VIP Relationship Manager</div>
                    <span className="text-[11px] text-slate-400 font-normal">Handpicked shortlists & family introductions handled for you</span>
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <span className="inline-flex items-center gap-1 line-through text-slate-400 font-semibold">
                      <LucideIcons.XCircle size={14} className="text-slate-300" />
                      Self-Service
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-center bg-amber-50/20">
                    <span className="inline-flex items-center gap-1 line-through text-slate-400 font-semibold">
                      <LucideIcons.XCircle size={14} className="text-slate-300" />
                      Self-Service
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-center bg-cyan-50/20">
                    <span className="inline-flex items-center gap-1 text-slate-700 font-bold">
                      <LucideIcons.CheckCircle2 size={15} className="text-indigo-400" />
                      Helpline Support
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-center bg-purple-50/30">
                    <span className="inline-flex items-center gap-1.5 text-[#5D34F7] font-black">
                      <LucideIcons.CheckCircle2 size={16} className="text-emerald-600 fill-emerald-100" />
                      Dedicated Consultant (Managed by Us)
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Reassurance Footer Strip */}
          <div className="mt-8 pt-6 border-t border-slate-200/70 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-bold text-slate-500">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></div>
              <span>Instant Activation Upon Payment</span>
            </div>
            <div className="flex flex-wrap items-center gap-4 sm:gap-6">
              <span className="flex items-center gap-1.5">
                <LucideIcons.ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>256-bit SSL Encrypted</span>
              </span>
              <span className="flex items-center gap-1.5">
                <LucideIcons.CreditCard className="w-4 h-4 text-blue-600" />
                <span>UPI, Cards, NetBanking via Razorpay</span>
              </span>
            </div>
          </div>
        </div>
      </div>

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
                  onClick={handleInitiatePayment}
                  disabled={isSaving}
                  className="flex-1 py-3 bg-black hover:bg-gray-900 text-white font-bold text-xs rounded-xl shadow-lg transition active:scale-[0.98] disabled:opacity-50 cursor-pointer text-center border-0"
                >
                  {isSaving ? 'Initiating Payment...' : 'Continue to Pay'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Upload Payment Screenshot & Reference ID Completion Modal */}
      {completingPayment && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white p-5 sm:p-6 flex items-start justify-between gap-4 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center text-white shrink-0">
                  <LucideIcons.UploadCloud size={20} />
                </div>
                <div>
                  <h3 className="font-black text-base sm:text-lg tracking-tight">
                    Complete Payment Verification
                  </h3>
                  <p className="text-xs text-slate-300 font-medium">
                    {getPaymentPlanName(completingPayment)} • ₹{getPaymentAmount(completingPayment).toLocaleString()}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setCompletingPayment(null);
                  setCompletionError('');
                  setCompletionSuccess('');
                }}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition cursor-pointer border-0"
                title="Close"
              >
                <LucideIcons.X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-5 flex-1">
              {/* Instructions banner */}
              <div className="p-3.5 bg-purple-50/70 border border-purple-150 rounded-2xl text-xs text-[#5D34F7] flex items-start gap-2.5">
                <LucideIcons.Info size={16} className="shrink-0 mt-0.5 text-[#5D34F7]" />
                <span className="font-semibold leading-relaxed">
                  Both your <strong>Transaction Reference ID</strong> and <strong>Payment Screenshot (SS)</strong> are required to submit this payment for administration verification.
                </span>
              </div>

              {/* Input 1: Reference ID / Transaction ID */}
              <div>
                <label className="block text-xs font-extrabold uppercase text-slate-700 tracking-wider mb-1.5 flex items-center justify-between">
                  <span>Payment Reference ID / Transaction ID <span className="text-rose-500">*</span></span>
                  <span className="text-[10px] text-slate-400 font-bold lowercase">Required</span>
                </label>
                <input
                  type="text"
                  value={refIdInput}
                  onChange={(e) => setRefIdInput(e.target.value)}
                  placeholder="e.g. UTR / UPI Ref / Bank Txn ID (e.g. 329482910482)"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#5D34F7] font-mono text-sm bg-slate-50/50 focus:bg-white transition"
                  disabled={isSubmittingDetails}
                />
                <p className="text-[11px] text-slate-400 font-medium mt-1">
                  You can find this 12-digit or alphanumeric reference number in your UPI or banking payment receipt.
                </p>
              </div>

              {/* Input 2: Payment Screenshot Upload */}
              <div>
                <label className="block text-xs font-extrabold uppercase text-slate-700 tracking-wider mb-1.5 flex items-center justify-between">
                  <span>Payment Screenshot (SS) <span className="text-rose-500">*</span></span>
                  <span className="text-[10px] text-slate-400 font-bold lowercase">Required</span>
                </label>

                {screenshotPreview ? (
                  <div className="relative rounded-2xl overflow-hidden border border-slate-200 bg-slate-50 p-3 flex flex-col items-center">
                    <img
                      src={screenshotPreview}
                      alt="Payment Screenshot Preview"
                      className="max-h-48 object-contain rounded-xl shadow-xs"
                    />
                    <div className="mt-3 flex items-center justify-between w-full text-xs px-1">
                      <span className="font-medium text-slate-600 truncate max-w-[240px]">
                        {screenshotFile ? screenshotFile.name : 'Current Screenshot'}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setScreenshotFile(null);
                          setScreenshotPreview(null);
                        }}
                        disabled={isSubmittingDetails}
                        className="text-rose-600 hover:text-rose-700 font-bold text-xs underline cursor-pointer border-0 bg-transparent"
                      >
                        Change File
                      </button>
                    </div>
                  </div>
                ) : (
                  <div
                    onClick={() => {
                      if (!isSubmittingDetails) {
                        const el = document.getElementById('payment-screenshot-file-input');
                        if (el) el.click();
                      }
                    }}
                    className="border-2 border-dashed border-slate-200 hover:border-[#5D34F7] rounded-2xl p-6 text-center cursor-pointer transition bg-slate-50/50 hover:bg-purple-50/30 group"
                  >
                    <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 group-hover:border-[#5D34F7]/40 flex items-center justify-center mx-auto mb-2.5 text-slate-400 group-hover:text-[#5D34F7] transition shadow-xs">
                      <LucideIcons.UploadCloud size={24} />
                    </div>
                    <p className="text-xs font-black text-slate-800">
                      Tap or drag payment screenshot here
                    </p>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Supports JPG, PNG, JPEG, WEBP (Max 10MB)
                    </p>
                    <input
                      id="payment-screenshot-file-input"
                      type="file"
                      accept="image/*"
                      onChange={handleScreenshotChange}
                      className="hidden"
                      disabled={isSubmittingDetails}
                    />
                  </div>
                )}
              </div>

              {/* Error feedback */}
              {completionError && (
                <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-semibold flex items-center gap-2">
                  <LucideIcons.AlertCircle size={15} className="shrink-0 text-rose-600" />
                  <span>{completionError}</span>
                </div>
              )}

              {/* Success feedback */}
              {completionSuccess && (
                <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-bold flex items-center gap-2">
                  <LucideIcons.CheckCircle2 size={15} className="shrink-0 text-emerald-600" />
                  <span>{completionSuccess}</span>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3 shrink-0">
              <button
                type="button"
                onClick={() => {
                  setCompletingPayment(null);
                  setCompletionError('');
                  setCompletionSuccess('');
                }}
                disabled={isSubmittingDetails}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 text-xs font-bold transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSubmitPaymentDetails}
                disabled={isSubmittingDetails}
                className="px-6 py-2.5 bg-gradient-to-r from-[#5D34F7] to-[#4024DB] hover:opacity-95 text-white rounded-xl text-xs font-black shadow-md shadow-[#5D34F7]/20 transition active:scale-95 disabled:opacity-50 cursor-pointer flex items-center gap-2"
              >
                {isSubmittingDetails ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    <span>Submitting Details...</span>
                  </>
                ) : (
                  <>
                    <LucideIcons.CheckCircle2 size={15} />
                    <span>Submit for Verification</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Full Screen Lightbox for Viewing Payment Screenshot */}
      <FullScreenImageViewer
        isOpen={Boolean(viewingScreenshot)}
        onClose={() => setViewingScreenshot(null)}
        images={viewingScreenshot ? [getScreenshotSrc(viewingScreenshot)] : []}
        userName="Payment Screenshot Receipt"
      />

      {/* VIP Consultant Modal */}
      <VipConsultantModal
        isOpen={showVipModal}
        onClose={() => setShowVipModal(false)}
        currentUser={currentUser}
      />

      {/* VIP Shaadi – Get Invited Modal */}
      <VipShaadiModal
        isOpen={showVipShaadiModal}
        onClose={() => setShowVipShaadiModal(false)}
        currentUser={currentUser}
      />
    </div>
  );
}
