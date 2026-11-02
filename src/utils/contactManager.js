import api from '../api/axios';

const STORAGE_KEY = 'unlocked_contacts_cache';

/**
 * Helper to mask phone number showing ONLY initial few characters to protect contact info.
 * E.g., "+91 98••••••••"
 */
export const maskPhone = (rawPhone, countryCode = '+91') => {
  if (!rawPhone) {
    return `${countryCode} 98••••••••`;
  }
  const str = rawPhone.toString().trim();
  const digits = str.replace(/\D/g, '');
  const subscriberDigits = digits.length >= 10 ? digits.slice(-10) : digits;
  const first2 = subscriberDigits.slice(0, 2) || '98';
  return `${countryCode} ${first2}••••••••`;
};

/**
 * Helper to mask email address showing only initial few characters.
 * E.g., "us***@***.com"
 */
export const maskEmail = (rawEmail) => {
  if (!rawEmail || !rawEmail.includes('@')) {
    return 'us***@***.com';
  }
  const [name, domain] = rawEmail.split('@');
  const visible = name.slice(0, 2) || 'us';
  const domainSuffix = domain ? domain.split('.').pop() : 'com';
  return `${visible}***@***.${domainSuffix}`;
};

/**
 * Retrieve cached unlocked contacts from localStorage (with sessionStorage fallback)
 * Ensures contact details remain visible permanently across refreshes and revisits.
 */
export const getCachedUnlockedContacts = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY) || sessionStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
};

/**
 * Save an unlocked contact permanently into localStorage and sessionStorage cache.
 */
export const saveCachedUnlockedContact = (userId, contactData = {}) => {
  if (!userId) return;
  try {
    const current = getCachedUnlockedContacts();
    const idKey = userId.toString();
    current[idKey] = {
      phone: contactData.phone || current[idKey]?.phone || '',
      email: contactData.email || current[idKey]?.email || '',
      countryCode: contactData.countryCode || current[idKey]?.countryCode || '+91',
      name: contactData.name || current[idKey]?.name || '',
      photo: contactData.photo || current[idKey]?.photo || null,
      gender: contactData.gender || current[idKey]?.gender || 'Male',
      unlockedAt: contactData.unlockedAt || current[idKey]?.unlockedAt || new Date().toISOString()
    };
    
    const jsonStr = JSON.stringify(current);
    try { localStorage.setItem(STORAGE_KEY, jsonStr); } catch (e) {}
    try { sessionStorage.setItem(STORAGE_KEY, jsonStr); } catch (e) {}

    // Dispatch custom event so all active components can update simultaneously
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('contact-unlocked', { detail: { targetId: idKey, unlockedData: current[idKey] } }));
    }
  } catch (err) {
    console.error('Failed to save unlocked contact cache:', err);
  }
};

export const DAILY_CONTACT_LIMIT = 5;
const DAILY_VIEWS_KEY = 'daily_contact_views_record';

/**
 * Helper to get current date formatted in IST (YYYY-MM-DD)
 */
export const getTodayISTDate = () => {
  try {
    return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata' }).format(new Date());
  } catch {
    return new Date().toISOString().slice(0, 10);
  }
};

/**
 * Returns the list of target IDs unlocked today and current count
 */
export const getTodayDailyContactViews = () => {
  const today = getTodayISTDate();
  try {
    const raw = localStorage.getItem(DAILY_VIEWS_KEY) || sessionStorage.getItem(DAILY_VIEWS_KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    const viewsForToday = Array.isArray(parsed[today]) ? parsed[today] : [];

    // Also cross-reference with getCachedUnlockedContacts for items unlocked today
    const cached = getCachedUnlockedContacts();
    const set = new Set(viewsForToday.map(String));
    Object.entries(cached).forEach(([id, data]) => {
      if (data?.unlockedAt) {
        try {
          const itemDate = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata' }).format(new Date(data.unlockedAt));
          if (itemDate === today) {
            set.add(id.toString());
          }
        } catch {}
      }
    });

    const combinedList = Array.from(set);
    return {
      todayDate: today,
      viewedCount: Math.min(DAILY_CONTACT_LIMIT, combinedList.length),
      remainingCount: Math.max(0, DAILY_CONTACT_LIMIT - combinedList.length),
      limit: DAILY_CONTACT_LIMIT,
      isLimitReached: combinedList.length >= DAILY_CONTACT_LIMIT,
      viewedIds: combinedList
    };
  } catch {
    return {
      todayDate: today,
      viewedCount: 0,
      remainingCount: DAILY_CONTACT_LIMIT,
      limit: DAILY_CONTACT_LIMIT,
      isLimitReached: false,
      viewedIds: []
    };
  }
};

/**
 * Record a new contact unlocked today
 */
export const recordDailyContactView = (targetId) => {
  if (!targetId) return;
  const today = getTodayISTDate();
  try {
    const raw = localStorage.getItem(DAILY_VIEWS_KEY) || sessionStorage.getItem(DAILY_VIEWS_KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    const list = Array.isArray(parsed[today]) ? parsed[today] : [];
    const idStr = targetId.toString();
    if (!list.includes(idStr)) {
      list.push(idStr);
      parsed[today] = list;
      const str = JSON.stringify(parsed);
      try { localStorage.setItem(DAILY_VIEWS_KEY, str); } catch {}
      try { sessionStorage.setItem(DAILY_VIEWS_KEY, str); } catch {}
    }
  } catch (err) {
    console.error('Failed to record daily contact view:', err);
  }
};

/**
 * Fetch all contacted profiles from backend and sync permanently into local cache
 */
export const syncContactedProfiles = async () => {
  try {
    const res = await api.get('/users/contacts-viewed');
    const profiles = res.data || [];
    const current = getCachedUnlockedContacts();
    
    profiles.forEach(item => {
      const id = item._id || item.contacted?._id;
      if (id) {
        const idKey = id.toString();
        const p = item.profile || item.contacted?.profile || {};
        const contactTime = item.contactedAt || item.unlockedAt || current[idKey]?.unlockedAt || new Date().toISOString();
        current[idKey] = {
          phone: item.phone || item.contacted?.phone || p.phone || current[idKey]?.phone || '',
          email: item.email || item.contacted?.email || p.email || current[idKey]?.email || '',
          countryCode: item.countryCode || p.countryCode || '+91',
          name: p.name || item.name || current[idKey]?.name || 'Member',
          photo: p.photos?.[0] || item.photos?.[0] || current[idKey]?.photo || null,
          gender: p.gender || item.gender || current[idKey]?.gender || 'Male',
          unlockedAt: contactTime
        };

        // If unlocked today, also record to daily count
        try {
          const itemDate = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata' }).format(new Date(contactTime));
          if (itemDate === getTodayISTDate()) {
            recordDailyContactView(idKey);
          }
        } catch {}
      }
    });

    const jsonStr = JSON.stringify(current);
    try { localStorage.setItem(STORAGE_KEY, jsonStr); } catch (e) {}
    try { sessionStorage.setItem(STORAGE_KEY, jsonStr); } catch (e) {}

    return current;
  } catch (err) {
    // If error, return existing persistent cache
    return getCachedUnlockedContacts();
  }
};
