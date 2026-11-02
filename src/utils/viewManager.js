import api from '../api/axios';

// In-memory set to deduplicate profile views during the active JavaScript session
const viewedProfilesInSession = new Set();

const SESSION_STORAGE_KEY_PREFIX = 'viewed_profile_session_';

/**
 * Check if a profile view has already been recorded in this viewing session
 * (checks both in-memory set and browser sessionStorage).
 *
 * @param {string} targetUserId
 * @returns {boolean}
 */
export const isProfileViewedInSession = (targetUserId) => {
  if (!targetUserId) return true;
  const idStr = String(targetUserId);

  if (viewedProfilesInSession.has(idStr)) {
    return true;
  }

  try {
    if (typeof sessionStorage !== 'undefined') {
      const stored = sessionStorage.getItem(SESSION_STORAGE_KEY_PREFIX + idStr);
      if (stored) {
        viewedProfilesInSession.add(idStr);
        return true;
      }
    }
  } catch (err) {
    // sessionStorage not available or disabled
  }

  return false;
};

/**
 * Record a profile view to the backend ONLY when:
 * 1. A valid targetUserId is provided.
 * 2. It has NOT already been recorded in the current viewing session.
 * 3. It is not the user's own profile.
 *
 * @param {string} targetUserId
 * @param {string} [currentUserId] - Optional current user id to prevent self-view API call
 * @returns {Promise<{ recorded: boolean, duplicate?: boolean, error?: any }>}
 */
export const recordProfileView = async (targetUserId, currentUserId = null) => {
  if (!targetUserId) {
    return { recorded: false, error: 'No targetUserId provided' };
  }

  const idStr = String(targetUserId);

  // Prevent self-views if current user is provided and matches target
  if (currentUserId && String(currentUserId) === idStr) {
    return { recorded: false, reason: 'self_view' };
  }

  // Prevent duplicate view counts within the same viewing session
  if (isProfileViewedInSession(idStr)) {
    return { recorded: false, duplicate: true };
  }

  // Mark as viewed immediately in-memory and in sessionStorage to prevent rapid duplicates
  viewedProfilesInSession.add(idStr);
  try {
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.setItem(SESSION_STORAGE_KEY_PREFIX + idStr, Date.now().toString());
    }
  } catch (err) {
    // sessionStorage not accessible
  }

  try {
    const res = await api.post(`/users/view/${idStr}`);
    return { recorded: true, data: res.data };
  } catch (err) {
    console.warn(`[viewManager] Could not record profile view for ${idStr}:`, err?.response?.data || err.message);
    return { recorded: false, error: err };
  }
};

/**
 * Clear session views (useful for testing or session reset)
 */
export const clearSessionViews = () => {
  viewedProfilesInSession.clear();
  try {
    if (typeof sessionStorage !== 'undefined') {
      Object.keys(sessionStorage).forEach((key) => {
        if (key.startsWith(SESSION_STORAGE_KEY_PREFIX)) {
          sessionStorage.removeItem(key);
        }
      });
    }
  } catch (err) {
    // ignore
  }
};
