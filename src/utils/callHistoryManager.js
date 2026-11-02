/**
 * Call History Manager
 * Manages persisting, updating, and synchronizing call logs between local cache and server.
 */

const STORAGE_KEY = 'matrimony_call_logs_v1';

/**
 * Retrieve local call logs from localStorage
 * @returns {Array} Array of stored call log objects
 */
export const getLocalCallLogs = () => {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.error('Error reading call logs from localStorage:', err);
    return [];
  }
};

/**
 * Save a new or existing call record into localStorage
 * @param {Object} call - Call record to add or update
 */
export const recordLocalCall = (call) => {
  if (typeof window === 'undefined' || !call) return;
  try {
    const logs = getLocalCallLogs();
    const id = call._id || call.id || call.channelName;
    const existingIndex = logs.findIndex((item) => (item._id || item.id || item.channelName) === id);

    if (existingIndex >= 0) {
      logs[existingIndex] = {
        ...logs[existingIndex],
        ...call,
        updatedAt: call.updatedAt || new Date().toISOString()
      };
    } else {
      logs.unshift({
        ...call,
        _id: id,
        createdAt: call.createdAt || new Date().toISOString(),
        updatedAt: call.updatedAt || new Date().toISOString()
      });
    }

    // Keep max 150 local call records
    const trimmed = logs.slice(0, 150);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
  } catch (err) {
    console.error('Error saving call log to localStorage:', err);
  }
};

/**
 * Update an existing call log by call ID or channelName
 * @param {string} id - Call ID or channelName
 * @param {Object} updates - Fields to update (e.g. status, duration)
 */
export const updateLocalCall = (id, updates) => {
  if (typeof window === 'undefined' || !id) return;
  try {
    const logs = getLocalCallLogs();
    const index = logs.findIndex((item) => (item._id || item.id || item.channelName) === id);
    if (index >= 0) {
      logs[index] = {
        ...logs[index],
        ...updates,
        updatedAt: new Date().toISOString()
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(logs));
    }
  } catch (err) {
    console.error('Error updating call log in localStorage:', err);
  }
};

/**
 * Clear all locally stored call logs
 */
export const clearLocalCallLogs = () => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (err) {
    console.error('Error clearing local call logs:', err);
  }
};

/**
 * Format raw call records from both server and local cache into standardized call log items
 * @param {Array} serverLogs - Logs fetched from API
 * @param {Array} localLogs - Logs from localStorage
 * @param {string|Object} currentUserId - The authenticated user's ID
 * @returns {Array} Formatted, deduplicated, and sorted call logs
 */
export const mergeAndFormatCallLogs = (serverLogs = [], localLogs = [], currentUserId = '') => {
  const uid = typeof currentUserId === 'object' && currentUserId !== null
    ? (currentUserId._id || currentUserId.id)
    : currentUserId;

  const map = new Map();

  // Helper to extract ID
  const getCallKey = (item) => item._id || item.id || item.channelName;

  // Process server logs first
  (serverLogs || []).forEach((item) => {
    if (!item) return;
    const key = getCallKey(item);
    if (key) map.set(key, item);
  });

  // Merge local logs (which may contain precise duration and local updates)
  (localLogs || []).forEach((item) => {
    if (!item) return;
    const key = getCallKey(item);
    if (!key) return;

    if (map.has(key)) {
      const serverItem = map.get(key);
      map.set(key, {
        ...serverItem,
        ...item,
        // Preserve populated caller/receiver objects from server if local only has IDs
        caller: (typeof serverItem.caller === 'object' && serverItem.caller?.profile) ? serverItem.caller : item.caller,
        receiver: (typeof serverItem.receiver === 'object' && serverItem.receiver?.profile) ? serverItem.receiver : item.receiver,
        duration: item.duration || serverItem.duration || 0
      });
    } else {
      map.set(key, item);
    }
  });

  const merged = Array.from(map.values());

  // Format into standard display objects
  const formatted = merged.map((call) => {
    const callerId = call.caller?._id || call.caller?.id || call.caller;
    const receiverId = call.receiver?._id || call.receiver?.id || call.receiver;

    const isOutgoing = String(callerId) === String(uid);
    const otherUser = isOutgoing ? call.receiver : call.caller;

    const otherProfile = (typeof otherUser === 'object' && otherUser?.profile) ? otherUser.profile : {};
    const contactName = otherProfile.name || (typeof otherUser === 'object' ? otherUser?.name : null) || 'Matrimony Member';
    const contactPhoto = otherProfile.photos?.[0] || (typeof otherUser === 'object' ? otherUser?.photos?.[0] : null) || null;
    const contactGender = otherProfile.gender || 'Unknown';
    const contactId = typeof otherUser === 'object' ? (otherUser?._id || otherUser?.id) : otherUser;

    let status = call.status || 'ended';
    if (status === 'ringing') {
      const callAge = Date.now() - new Date(call.createdAt || Date.now()).getTime();
      if (callAge > 60000) {
        status = 'missed';
      }
    }

    let durationSeconds = call.duration || 0;
    if (!durationSeconds && call.createdAt && call.updatedAt && status === 'ended') {
      const diff = Math.round((new Date(call.updatedAt).getTime() - new Date(call.createdAt).getTime()) / 1000);
      if (diff > 0 && diff < 86400) {
        durationSeconds = diff;
      }
    }

    return {
      id: call._id || call.id || call.channelName,
      contact: {
        _id: contactId,
        name: contactName,
        photo: contactPhoto,
        gender: contactGender,
        profile: otherProfile
      },
      direction: isOutgoing ? 'outgoing' : 'incoming',
      status: status, // 'ringing', 'accepted', 'rejected', 'ended', 'missed'
      isVideo: call.isVideoCall !== false,
      createdAt: call.createdAt || new Date().toISOString(),
      updatedAt: call.updatedAt || new Date().toISOString(),
      duration: durationSeconds,
      rawCall: call
    };
  });

  // Sort descending by date (newest first)
  formatted.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return formatted;
};

/**
 * Format call duration in seconds to a human-readable string
 * @param {number} seconds - Number of seconds
 * @returns {string} e.g. "4m 12s" or "35s"
 */
export const formatCallDurationReadable = (seconds) => {
  if (!seconds || seconds <= 0) return '0s';
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  if (mins === 0) return `${secs}s`;
  if (secs === 0) return `${mins}m`;
  return `${mins}m ${secs}s`;
};

/**
 * Format timestamp into user-friendly call date label
 * @param {string|Date} dateStr - The timestamp
 * @returns {string} e.g. "Today, 4:15 PM" or "Yesterday, 10:20 AM" or "Oct 24, 2026, 6:00 PM"
 */
export const formatCallTimestamp = (dateStr) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return '';

  const now = new Date();
  const isToday =
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear();

  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const isYesterday =
    date.getDate() === yesterday.getDate() &&
    date.getMonth() === yesterday.getMonth() &&
    date.getFullYear() === yesterday.getFullYear();

  const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  if (isToday) return `Today, ${timeStr}`;
  if (isYesterday) return `Yesterday, ${timeStr}`;

  const dateFormatted = date.toLocaleDateString([], {
    month: 'short',
    day: 'numeric',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
  });

  return `${dateFormatted}, ${timeStr}`;
};
