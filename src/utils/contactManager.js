import api from '../api/axios';

const STORAGE_KEY = 'unlocked_contacts_cache';

/**
 * Helper to mask phone number showing ONLY 5 digits.
 * E.g., "+91 98765XXXXX"
 */
export const maskPhone = (rawPhone, countryCode = '+91') => {
  if (!rawPhone) {
    return `${countryCode} 98765XXXXX`;
  }
  const str = rawPhone.toString().trim();
  const digits = str.replace(/\D/g, '');
  const subscriberDigits = digits.length >= 10 ? digits.slice(-10) : digits;
  const first5 = (subscriberDigits.slice(0, 5) || '98765').padEnd(5, '0');
  return `${countryCode} ${first5}XXXXX`;
};

/**
 * Helper to mask email address showing only initial few characters.
 * E.g., "abc***@***.com"
 */
export const maskEmail = (rawEmail) => {
  if (!rawEmail || !rawEmail.includes('@')) {
    return 'abc***@***.com';
  }
  const [name] = rawEmail.split('@');
  const visible = name.slice(0, 3) || 'abc';
  return `${visible}***@***.com`;
};

/**
 * Retrieve cached unlocked contacts from sessionStorage
 */
export const getCachedUnlockedContacts = () => {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
};

/**
 * Save an unlocked contact into sessionStorage cache
 */
export const saveCachedUnlockedContact = (userId, contactData) => {
  if (!userId) return;
  try {
    const current = getCachedUnlockedContacts();
    current[userId.toString()] = {
      phone: contactData.phone || '',
      email: contactData.email || '',
      countryCode: contactData.countryCode || '+91',
      unlockedAt: new Date().toISOString()
    };
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(current));
  } catch (err) {
    console.error('Failed to save unlocked contact cache:', err);
  }
};

/**
 * Fetch all contacted profiles from backend and sync into local cache
 */
export const syncContactedProfiles = async () => {
  try {
    const res = await api.get('/users/contacts-viewed');
    const profiles = res.data || [];
    const current = getCachedUnlockedContacts();
    
    profiles.forEach(item => {
      const id = item._id || item.contacted?._id;
      if (id) {
        current[id.toString()] = {
          phone: item.phone || item.contacted?.phone || current[id.toString()]?.phone || '',
          email: item.email || item.contacted?.email || current[id.toString()]?.email || '',
          countryCode: item.countryCode || '+91',
          unlockedAt: item.contactedAt || new Date().toISOString()
        };
      }
    });

    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(current));
    return current;
  } catch (err) {
    // If not premium or other error, return existing cache
    return getCachedUnlockedContacts();
  }
};
