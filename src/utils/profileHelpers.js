/**
 * Helper utilities for Profile display and formatting.
 */

/**
 * Maps the profile ownership field ('profileFor') to the standardized
 * Profile Created By relationship string.
 *
 * Supported Values:
 * - Myself
 * - Sibling
 * - Parent
 * - Relative
 * - Friend
 * - Guardian
 * - Other
 *
 * @param {string} rawVal - The raw profileFor value from user/profile data.
 * @returns {string|null} - Formatted relationship label, or null if missing/empty.
 */
export const formatProfileCreatedBy = (rawVal) => {
  if (!rawVal || typeof rawVal !== 'string') return null;
  const cleaned = rawVal.trim();
  if (!cleaned) return null;
  const lower = cleaned.toLowerCase();

  if (lower === 'myself' || lower === 'self') return 'Myself';
  if (
    lower === 'my son' ||
    lower === 'my daughter' ||
    lower === 'parent' ||
    lower === 'parents' ||
    lower === 'father' ||
    lower === 'mother' ||
    lower === 'son' ||
    lower === 'daughter'
  ) {
    return 'Parent';
  }
  if (
    lower === 'my brother' ||
    lower === 'my sister' ||
    lower === 'sibling' ||
    lower === 'siblings' ||
    lower === 'brother' ||
    lower === 'sister'
  ) {
    return 'Sibling';
  }
  if (lower === 'my relative' || lower === 'relative' || lower === 'relatives') return 'Relative';
  if (lower === 'my friend' || lower === 'friend' || lower === 'friends') return 'Friend';
  if (lower === 'guardian') return 'Guardian';
  if (lower === 'other') return 'Other';

  if (cleaned.startsWith('My ') || cleaned.startsWith('my ')) {
    const withoutMy = cleaned.substring(3).trim();
    return withoutMy.charAt(0).toUpperCase() + withoutMy.slice(1);
  }

  return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
};

/**
 * Formats sibling information from profile data.
 * Handles single/multiple siblings, explicit string values, counts, or absent data.
 *
 * @param {object} profileData - The profile object or user object.
 * @returns {string} - Formatted siblings description.
 */
export const formatSiblings = (profileData) => {
  if (!profileData) return 'None';
  const p = profileData.profile || profileData;

  // 1. If explicit string is provided in profile.siblings
  if (typeof p.siblings === 'string' && p.siblings.trim()) {
    return p.siblings.trim();
  }

  // 2. If array of sibling details is provided
  if (Array.isArray(p.siblings) && p.siblings.length > 0) {
    return p.siblings.map(s => (typeof s === 'string' ? s : (s.relation || s.type || s.name || 'Sibling'))).join(', ');
  }

  const brothers = Number(p.brothersCount) || 0;
  const sisters = Number(p.sistersCount) || 0;
  const totalProvided = (p.siblingsCount !== undefined && p.siblingsCount !== null && p.siblingsCount !== '')
    ? Number(p.siblingsCount)
    : (p.siblings !== undefined && typeof p.siblings === 'number' ? Number(p.siblings) : (brothers + sisters));

  if (brothers === 0 && sisters === 0) {
    if (totalProvided > 0) {
      return `${totalProvided} ${totalProvided === 1 ? 'Sibling' : 'Siblings'}`;
    }
    return 'None';
  }

  const parts = [];
  if (brothers > 0) {
    parts.push(`${brothers} ${brothers === 1 ? 'Brother' : 'Brothers'}`);
  }
  if (sisters > 0) {
    parts.push(`${sisters} ${sisters === 1 ? 'Sister' : 'Sisters'}`);
  }

  const total = totalProvided > 0 ? totalProvided : (brothers + sisters);
  return `${total} (${parts.join(', ')})`;
};

/**
 * Standard Children / Kids filter options supported across the website.
 */
export const CHILDREN_FILTER_OPTIONS = [
  'No Children',
  '1 Child',
  '2 Children',
  '3 or More Children'
];

/**
 * Analyzes and resolves children/kids details for a profile.
 * Handles diverse data structures: hasChildren (Yes/No/boolean/count),
 * childrenStayingWith, children (number/string), noOfChildren, numberOfChildren,
 * and maritalStatus inferences.
 *
 * @param {object} profileData - The profile object or user object.
 * @returns {{ hasChildren: boolean, count: number|null, label: string, isUnspecified?: boolean }}
 */
export const getProfileChildrenInfo = (profileData) => {
  if (!profileData) return { hasChildren: false, count: 0, label: 'No Children' };
  const p = profileData.profile || profileData;

  // 1. Direct explicit numeric count if available
  const rawCount = p.noOfChildren ?? p.numberOfChildren ?? p.childrenCount ?? p.kidsCount;
  if (rawCount !== undefined && rawCount !== null && rawCount !== '') {
    const num = Number(rawCount);
    if (!isNaN(num)) {
      if (num === 0) return { hasChildren: false, count: 0, label: 'No Children' };
      if (num === 1) return { hasChildren: true, count: 1, label: '1 Child' };
      if (num === 2) return { hasChildren: true, count: 2, label: '2 Children' };
      return { hasChildren: true, count: num, label: `${num} Children` };
    }
  }

  // 2. Check p.children field (if string or number)
  if (p.children !== undefined && p.children !== null && p.children !== '') {
    if (typeof p.children === 'number') {
      if (p.children === 0) return { hasChildren: false, count: 0, label: 'No Children' };
      if (p.children === 1) return { hasChildren: true, count: 1, label: '1 Child' };
      if (p.children === 2) return { hasChildren: true, count: 2, label: '2 Children' };
      return { hasChildren: true, count: p.children, label: `${p.children} Children` };
    }
    if (typeof p.children === 'string') {
      const lower = p.children.trim().toLowerCase();
      if (lower === 'no' || lower === 'none' || lower === '0' || lower.includes('no child')) {
        return { hasChildren: false, count: 0, label: 'No Children' };
      }
      if (lower === '1' || lower === '1 child' || lower === 'one') {
        return { hasChildren: true, count: 1, label: '1 Child' };
      }
      if (lower === '2' || lower === '2 children' || lower === 'two') {
        return { hasChildren: true, count: 2, label: '2 Children' };
      }
      if (lower === '3' || lower.includes('3') || lower.includes('more')) {
        return { hasChildren: true, count: 3, label: '3 or More Children' };
      }
      if (lower === 'yes' || lower.includes('have') || lower.includes('has')) {
        return { hasChildren: true, count: null, label: 'Has Children' };
      }
    }
  }

  // 3. Check p.hasChildren field
  if (p.hasChildren !== undefined && p.hasChildren !== null && p.hasChildren !== '') {
    if (typeof p.hasChildren === 'boolean') {
      return p.hasChildren
        ? { hasChildren: true, count: null, label: 'Has Children' }
        : { hasChildren: false, count: 0, label: 'No Children' };
    }
    const lower = String(p.hasChildren).trim().toLowerCase();
    if (lower === 'no' || lower === 'none' || lower === '0' || lower === 'false') {
      return { hasChildren: false, count: 0, label: 'No Children' };
    }
    if (lower === 'yes' || lower === 'true') {
      return { hasChildren: true, count: null, label: 'Has Children' };
    }
    const parsed = parseInt(lower, 10);
    if (!isNaN(parsed)) {
      if (parsed === 0) return { hasChildren: false, count: 0, label: 'No Children' };
      if (parsed === 1) return { hasChildren: true, count: 1, label: '1 Child' };
      if (parsed === 2) return { hasChildren: true, count: 2, label: '2 Children' };
      return { hasChildren: true, count: parsed, label: `${parsed} Children` };
    }
  }

  // 4. Check childrenStayingWith
  if (p.childrenStayingWith && String(p.childrenStayingWith).trim()) {
    return { hasChildren: true, count: null, label: 'Has Children' };
  }

  // 5. If Never Married, standard expectation is No Children
  const ms = String(p.maritalStatus || '').trim().toLowerCase();
  if (ms.includes('never') || ms === '') {
    return { hasChildren: false, count: 0, label: 'No Children' };
  }

  // If marital status is Divorced / Widowed / Awaiting Divorce but no children fields are specified:
  return { hasChildren: false, count: 0, label: 'No Children', isUnspecified: true };
};

/**
 * Formats user-facing children/kids display string with optional living arrangement.
 *
 * @param {object} profileData - The profile object or user object.
 * @returns {string} - Display string (e.g. 'No Children', '1 Child (Living with parent)', etc.)
 */
export const formatChildrenDisplay = (profileData) => {
  if (!profileData) return 'No Children';
  const p = profileData.profile || profileData;
  const info = getProfileChildrenInfo(p);

  if (!info.hasChildren || info.count === 0) {
    return 'No Children';
  }

  let label = info.label;
  if (p.childrenStayingWith) {
    const staying = String(p.childrenStayingWith).trim().toLowerCase();
    if (staying === 'me') {
      label += ' (Living with me)';
    } else if (staying === 'separate') {
      label += ' (Living separately)';
    } else {
      label += ` (Living ${p.childrenStayingWith})`;
    }
  }
  return label;
};

/**
 * Checks if a given children preference option represents 0 / No children.
 *
 * @param {string|number} opt - The option to check.
 * @returns {boolean} - True if option represents 0 or no children.
 */
export const isZeroOrNoChildren = (opt) => {
  if (opt === 0 || opt === '0') return true;
  if (typeof opt === 'string') {
    const lower = opt.trim().toLowerCase();
    return (
      lower === 'no' ||
      lower === 'no children' ||
      lower === '0 children' ||
      lower === 'none' ||
      lower.includes('no child') ||
      lower.includes('0 (no children)')
    );
  }
  return false;
};

/**
 * Normalizes children preferences for backend transmission.
 * The backend buildMatchesQuery requires 'No' to trigger the filter { 'profile.hasChildren': { $regex: /^no$/i } }.
 *
 * @param {Array|string|number} selectedChildren - The selected children preferences.
 * @returns {string[]} - Array formatted for backend consumption.
 */
export const normalizeChildrenForBackend = (selectedChildren) => {
  if (selectedChildren === undefined || selectedChildren === null) return [];
  const list = Array.isArray(selectedChildren) ? selectedChildren : [selectedChildren];
  if (list.length === 0) return [];

  const hasZero = list.some(isZeroOrNoChildren);
  const hasKids = list.some(c => !isZeroOrNoChildren(c));

  if (hasZero && !hasKids) {
    return ['No'];
  }
  if (!hasZero && hasKids) {
    return ['Yes'];
  }
  // Open to all / both
  return [];
};

/**
 * Normalizes loaded children preferences from backend into standard UI options.
 *
 * @param {Array|string|number} savedChildren - The preferences returned from backend.
 * @returns {string[]} - Array of matching UI options (e.g. ['No Children']).
 */
export const normalizeChildrenFromBackend = (savedChildren) => {
  if (savedChildren === undefined || savedChildren === null) return [];
  const list = Array.isArray(savedChildren) ? savedChildren : [savedChildren];
  const normalized = [];

  list.forEach(item => {
    if (isZeroOrNoChildren(item)) {
      if (!normalized.includes('No Children')) normalized.push('No Children');
    } else if (typeof item === 'string') {
      const lower = item.trim().toLowerCase();
      if (lower === '1' || lower.includes('1 child') || lower === 'one') {
        if (!normalized.includes('1 Child')) normalized.push('1 Child');
      } else if (lower === '2' || lower.includes('2 child') || lower === 'two') {
        if (!normalized.includes('2 Children')) normalized.push('2 Children');
      } else if (lower === '3' || lower.includes('3') || lower.includes('more')) {
        if (!normalized.includes('3 or More Children')) normalized.push('3 or More Children');
      } else if (lower === 'yes' || lower === 'has children') {
        if (!normalized.includes('1 Child')) normalized.push('1 Child');
      }
    } else if (typeof item === 'number') {
      if (item === 0) {
        if (!normalized.includes('No Children')) normalized.push('No Children');
      } else if (item === 1) {
        if (!normalized.includes('1 Child')) normalized.push('1 Child');
      } else if (item === 2) {
        if (!normalized.includes('2 Children')) normalized.push('2 Children');
      } else if (item >= 3) {
        if (!normalized.includes('3 or More Children')) normalized.push('3 or More Children');
      }
    }
  });

  return normalized;
};

/**
 * Formats preference values safely as an array of display strings without
 * dropping valid 0 or '0' values.
 *
 * @param {any} val - The preference field value.
 * @returns {string[]} - Array of formatted strings.
 */
export const formatPreferenceValues = (val) => {
  if (val === undefined || val === null || val === '') return [];
  if (Array.isArray(val)) {
    return val
      .filter(item => item !== undefined && item !== null && item !== '')
      .map(item => {
        if (typeof item === 'number') return String(item);
        const str = String(item).trim();
        if (str.toLowerCase() === 'no') return 'No Children (0)';
        return str;
      })
      .filter(str => str !== '');
  }
  if (typeof val === 'number') return [String(val)];
  if (typeof val === 'string' && val.trim() !== '') {
    if (val.trim().toLowerCase() === 'no') return ['No Children (0)'];
    return [val.trim()];
  }
  return [];
};

/**
 * Evaluates whether a profile matches the selected Children / Kids filters.
 * Supports multiple selections, 'No Children', 0, '0', specific counts
 * ('1 Child', '2 Children', '3 or More Children'), and general 'Has Children' compatibility.
 *
 * @param {object} profileData - The profile object or user object.
 * @param {Array} filterChildren - Array of selected children filter options.
 * @returns {boolean} - True if profile satisfies the filter.
 */
export const profileMatchesChildrenFilter = (profileData, filterChildren = []) => {
  if (!Array.isArray(filterChildren) || filterChildren.length === 0) return true;
  const info = getProfileChildrenInfo(profileData);

  return filterChildren.some(opt => {
    if (isZeroOrNoChildren(opt)) {
      return !info.hasChildren || info.count === 0;
    }
    if (opt === 1 || opt === '1' || opt === '1 Child') {
      return info.hasChildren && (info.count === 1 || info.count === null);
    }
    if (opt === 2 || opt === '2' || opt === '2 Children') {
      return info.hasChildren && (info.count === 2 || (info.count === null && filterChildren.length === 1));
    }
    if (opt === 3 || opt === '3' || opt === '3 or More Children' || opt === '3+ Children') {
      return info.hasChildren && (info.count >= 3 || (info.count === null && filterChildren.length === 1));
    }
    if (opt === 'Has Children') {
      return info.hasChildren && (info.count === null || info.count > 0);
    }
    return false;
  });
};

/**
 * Determines whether a user's profile photo / identity verification has been successfully approved.
 *
 * Requirements:
 * - Displays Photo Verified badge ONLY if verification is successfully completed ('approved' / 'verified').
 * - NEVER displays badge for 'pending', 'rejected', 'none', null, or unverified profiles.
 *
 * @param {object} user - The user object or profile object.
 * @returns {boolean} - True if photo verification is successfully completed.
 */
export const isPhotoVerified = (user) => {
  if (!user || typeof user !== 'object') return false;

  const target = user.user && typeof user.user === 'object' && user.user._id ? user.user : user;
  const p = target.profile || {};

  // Check top-level verification status
  const vStatus = String(target.verificationStatus || p.verificationStatus || '').trim().toLowerCase();
  if (vStatus === 'approved' || vStatus === 'verified') return true;

  // Check photo-specific verification status if present
  const photoVStatus = String(target.photoVerificationStatus || p.photoVerificationStatus || '').trim().toLowerCase();
  if (photoVStatus === 'approved' || photoVStatus === 'verified') return true;

  // Check individual photos inside profile.photos
  const photosList = Array.isArray(p.photos) ? p.photos : (Array.isArray(target.photos) ? target.photos : []);
  const hasApprovedPhoto = photosList.some(photo => {
    if (photo && typeof photo === 'object') {
      const pStatus = String(photo.verificationStatus || photo.status || '').trim().toLowerCase();
      return pStatus === 'approved' || pStatus === 'verified' || photo.approved === true;
    }
    return false;
  });
  if (hasApprovedPhoto) return true;

  // Fallback: Check target.isVerified === true, strictly ensuring it is NOT pending, rejected, or none
  if (target.isVerified === true && vStatus !== 'rejected' && vStatus !== 'pending' && vStatus !== 'none') {
    return true;
  }

  return false;
};

/**
 * Returns the exact photo verification status string: 'approved' | 'pending' | 'rejected' | 'none'
 * Useful for own profile where detailed status (pending/rejected) needs to be communicated.
 *
 * @param {object} user - The user object or profile object.
 * @returns {'approved' | 'pending' | 'rejected' | 'none'}
 */
export const getPhotoVerificationStatus = (user) => {
  if (!user || typeof user !== 'object') return 'none';
  const target = user.user && typeof user.user === 'object' && user.user._id ? user.user : user;
  const p = target.profile || {};

  const vStatus = String(target.verificationStatus || p.verificationStatus || '').trim().toLowerCase();
  if (vStatus === 'approved' || vStatus === 'verified') return 'approved';
  if (vStatus === 'pending') return 'pending';
  if (vStatus === 'rejected') return 'rejected';

  const photoVStatus = String(target.photoVerificationStatus || p.photoVerificationStatus || '').trim().toLowerCase();
  if (photoVStatus === 'approved' || photoVStatus === 'verified') return 'approved';
  if (photoVStatus === 'pending') return 'pending';
  if (photoVStatus === 'rejected') return 'rejected';

  if (target.isVerified === true && vStatus !== 'rejected' && vStatus !== 'pending' && vStatus !== 'none') {
    return 'approved';
  }

  return 'none';
};

/**
 * Standard list of spoken languages supported across the website.
 */
export const ALL_SPOKEN_LANGUAGES = [
  'English',
  'Hindi',
  'Bengali',
  'Telugu',
  'Marathi',
  'Tamil',
  'Urdu',
  'Gujarati',
  'Kannada',
  'Malayalam',
  'Odia',
  'Punjabi',
  'Assamese',
  'Maithili',
  'Marwari',
  'Bhojpuri',
  'Konkani',
  'Kashmiri',
  'Sindhi',
  'Nepali',
  'Rajasthani',
  'Tulu',
  'Sanskrit',
  'French',
  'German',
  'Spanish',
  'Arabic',
  'Other'
];

/**
 * Extracts a normalized array of spoken languages from profile / user data.
 * Gracefully handles arrays, comma-delimited strings, or single motherTongue fallback.
 *
 * @param {object|string|Array} data - Profile object, user object, or raw languages data
 * @returns {string[]} - Array of cleaned language strings
 */
export const getLanguagesList = (data) => {
  if (!data) return [];
  
  // If data is an array
  if (Array.isArray(data)) {
    return data
      .map(item => (typeof item === 'string' ? item.trim() : ''))
      .filter(Boolean);
  }

  // If data is a string
  if (typeof data === 'string') {
    const trimmed = data.trim();
    if (!trimmed) return [];
    if (trimmed.includes(',')) {
      return trimmed
        .split(',')
        .map(s => s.trim())
        .filter(Boolean);
    }
    return [trimmed];
  }

  // If data is an object (profile or user)
  const p = data.profile || data;
  const rawLangs = p.languages || data.languages;
  if (Array.isArray(rawLangs) && rawLangs.length > 0) {
    return rawLangs
      .map(item => (typeof item === 'string' ? item.trim() : ''))
      .filter(Boolean);
  }
  if (typeof rawLangs === 'string' && rawLangs.trim()) {
    return rawLangs
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);
  }

  // Fallback to motherTongue or language if present
  const fallback = p.motherTongue || data.motherTongue || p.language || data.language;
  if (typeof fallback === 'string' && fallback.trim()) {
    return [fallback.trim()];
  }

  return [];
};

/**
 * Formats spoken languages as a clean, human-readable string.
 *
 * @param {object|string|Array} data - Profile object, user object, or raw languages data
 * @param {string} [fallback='Not specified'] - Fallback text if no languages provided
 * @returns {string} - Formatted string (e.g., 'English, Hindi, Telugu')
 */
export const formatLanguages = (data, fallback = 'Not specified') => {
  const list = getLanguagesList(data);
  if (list.length === 0) return fallback;
  return list.join(', ');
};
