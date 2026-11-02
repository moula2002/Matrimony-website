import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api, { getPhotoUrl, getDefaultAvatar, handleImageError } from '../api/axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faSmile, faSearch, faUser, faInfoCircle, faArrowLeft, faSpinner,
  faPhone, faPhoneSlash, faHeart, faChevronDown, faEdit, faMicrophone,
  faMicrophoneSlash, faVideo, faVideoSlash, faVolumeUp, faVolumeMute, faSync,
  faImage, faMapMarkerAlt, faCopy, faCheck, faPlus, faCamera, faFileAlt, faFilePdf,
  faDownload, faTimes, faClockRotateLeft, faCrown, faLock, faCommentDots
} from '@fortawesome/free-solid-svg-icons';
import loadingImg from '../assets/loading.png';
import CallModal from '../components/CallModal';
import CallHistoryModal from '../components/CallHistoryModal';
import EmptyState from '../components/EmptyState';
import { recordLocalCall, updateLocalCall } from '../utils/callHistoryManager';
import { formatSiblings } from '../utils/profileHelpers';
import { GIF_CATEGORIES, GIF_COLLECTION } from '../data/gifs';

const EMOJIS = ['😀', '😂', '😍', '👍', '🔥', '❤️', '🎉', '🙌', '💡', '💬', '✨', '👏', '🥳', '😎', '💯'];

// Helper to parse and define online status and last-seen display format precisely
const parseUserOnlineStatus = (contact) => {
  if (!contact) return { online: false, isOnline: false, lastActiveLabel: 'Offline', lastActiveTime: 'Offline' };

  const p = contact.profile || {};

  // Check explicit status indicators from existing backend data
  const isExplicitOnline =
    contact.isOnline === true ||
    contact.online === true ||
    contact.status === 'online' ||
    p.isOnline === true ||
    p.online === true ||
    p.status === 'online';

  const isExplicitOffline =
    contact.status === 'offline' ||
    contact.isOnline === false ||
    p.status === 'offline';

  // Check timestamp fields from existing data structure
  const rawDate =
    contact.lastActive ||
    contact.lastSeen ||
    contact.updatedAt ||
    p.lastActive ||
    p.lastSeen ||
    p.updatedAt;

  const lastActiveDate = rawDate ? new Date(rawDate) : null;
  const hasValidDate = lastActiveDate instanceof Date && !isNaN(lastActiveDate.getTime());

  let online = isExplicitOnline;
  let lastActiveLabel = 'Offline';

  if (hasValidDate) {
    const diffMs = Date.now() - lastActiveDate.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHrs = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHrs / 24);

    // Active within 3 minutes (180,000ms) is considered currently Online unless explicitly offline
    if (diffMs >= 0 && diffMs < 180000 && !isExplicitOffline) {
      online = true;
    }

    if (online) {
      lastActiveLabel = 'Online';
    } else {
      // Defined Last-Seen Display Format:
      if (diffMins < 1) {
        lastActiveLabel = 'Last seen just now';
      } else if (diffMins < 60) {
        lastActiveLabel = `Last seen ${diffMins}m ago`;
      } else if (diffHrs < 24) {
        lastActiveLabel = `Last seen ${diffHrs}h ago`;
      } else if (diffDays === 1) {
        lastActiveLabel = 'Last seen yesterday';
      } else if (diffDays < 7) {
        lastActiveLabel = `Last seen ${diffDays}d ago`;
      } else {
        lastActiveLabel = `Last seen ${lastActiveDate.toLocaleDateString([], { month: 'short', day: 'numeric' })}`;
      }
    }
  } else {
    // If no timestamp is available
    if (online) {
      lastActiveLabel = 'Online';
    } else {
      lastActiveLabel = 'Offline';
    }
  }

  return {
    online,
    isOnline: online,
    lastActiveLabel,
    lastActiveTime: lastActiveLabel
  };
};

export default function Messages() {
  const [contacts, setContacts] = useState([]);
  const [activeContact, setActiveContact] = useState(null);
  const [messages, setMessages] = useState([]);
  const [previewContact, setPreviewContact] = useState(null);
  const [activePreviewImage, setActivePreviewImage] = useState('');
  const [copiedUid, setCopiedUid] = useState('');
  const [inputText, setInputText] = useState('');
  const [loadingContacts, setLoadingContacts] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [likedMessages, setLikedMessages] = useState({});
  const [callModalData, setCallModalData] = useState({ isOpen: false, phone: '', name: '', photo: '' });
  const [currentUserProfile, setCurrentUserProfile] = useState(null);
  const [showCallHistoryModal, setShowCallHistoryModal] = useState(false);
  const [callHistoryFilterUserId, setCallHistoryFilterUserId] = useState(null);
  const [isBlockingUser, setIsBlockingUser] = useState(false);
  const [chatError, setChatError] = useState(null);
  
  const navigate = useNavigate();
  const location = useLocation();
  const isPremium = currentUserProfile?.premiumMembership?.isPremium || false;
  const isSenderPremium = Boolean(currentUserProfile?.premiumMembership?.isPremium);
  const isReceiverPremium = useMemo(() => {
    if (!activeContact) return false;
    const pm = activeContact.premiumMembership || activeContact.profile?.premiumMembership || {};
    return Boolean(pm.isPremium || activeContact.isPremium || activeContact.profile?.isPremium);
  }, [activeContact]);

  // Feature 11: Calling & Messaging Permission Matrix
  // - Premium -> Premium: Call + Chat allowed
  // - Premium -> Free: Call + Chat allowed
  // - Free -> Premium: Call blocked (upgrade prompt); Chat allowed in both directions
  // - Free -> Free: Call and Chat blocked (with clear explanation)
  const canCall = isSenderPremium;
  const canChat = isSenderPremium || isReceiverPremium;

  const [availablePlans, setAvailablePlans] = useState([]);
  const [availableCameras, setAvailableCameras] = useState([]);
  const [currentCameraIndex, setCurrentCameraIndex] = useState(0);

  // Determine whether current user's subscription plan includes Video Calling
  const hasVideoCallingAccess = useMemo(() => {
    if (!currentUserProfile) return false;
    const pm = currentUserProfile.premiumMembership || currentUserProfile.profile?.premiumMembership || {};
    if (!pm.isPremium) return false;

    // Check expiry
    if (pm.expiryDate && new Date(pm.expiryDate) < new Date()) {
      return false;
    }

    // Direct property on membership
    if (typeof pm.videoCalling === 'boolean') {
      return pm.videoCalling;
    }

    // Match with availablePlans from server
    if (availablePlans.length > 0) {
      const matched = availablePlans.find(
        (p) => (pm.planId && String(p._id) === String(pm.planId)) ||
               (pm.planType && p.name?.toLowerCase() === pm.planType?.toLowerCase())
      );
      if (matched && typeof matched.videoCalling === 'boolean') {
        return matched.videoCalling;
      }
    }

    // Fallback based on known plan names: Diamond & Platinum have video; Gold & Highlight do not
    const planName = String(pm.planType || '').toLowerCase();
    if (planName.includes('diamond') || planName.includes('platinum') || planName.includes('vip')) {
      return true;
    }

    return false;
  }, [currentUserProfile, availablePlans]);

  const targetContactId = location.state?.contactId || location.state?.userId || new URLSearchParams(location.search).get('userId');

  // Emoji Picker, GIF Picker, Attachment Menu & Recording States
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showGifPicker, setShowGifPicker] = useState(false);
  const [selectedGifCategory, setSelectedGifCategory] = useState('all');
  const [gifSearchQuery, setGifSearchQuery] = useState('');
  const [showAttachmentMenu, setShowAttachmentMenu] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordTime, setRecordTime] = useState(0);
  const [activeCall, setActiveCall] = useState(null); // 'voice' | null

  const attachmentMenuRef = useRef(null);
  const gifPickerRef = useRef(null);
  const cameraInputRef = useRef(null);
  const photoInputRef = useRef(null);
  const docInputRef = useRef(null);

  const handleCopyUid = (uid, e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(uid);
    setCopiedUid(uid);
    setTimeout(() => setCopiedUid(''), 2000);
  };

  useEffect(() => {
    function handleClickOutside(event) {
      if (attachmentMenuRef.current && !attachmentMenuRef.current.contains(event.target)) {
        setShowAttachmentMenu(false);
      }
      if (gifPickerRef.current && !gifPickerRef.current.contains(event.target)) {
        setShowGifPicker(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Agora State
  const [agoraClient, setAgoraClient] = useState(null);
  const [localAudioTrack, setLocalAudioTrack] = useState(null);
  const [localVideoTrack, setLocalVideoTrack] = useState(null);
  const [incomingCall, setIncomingCall] = useState(null);
  const [isInCall, setIsInCall] = useState(false);
  const [remoteUserJoined, setRemoteUserJoined] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoDisabled, setIsVideoDisabled] = useState(false);
  const [isSpeakerMuted, setIsSpeakerMuted] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const remoteAudioTrackRef = useRef(null);

  useEffect(() => {
    let timer;
    if (isInCall) {
      setCallDuration(0);
      timer = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
    } else {
      setCallDuration(0);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isInCall]);

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    const initAgora = () => {
      if (window.AgoraRTC && !agoraClient) {
        const client = window.AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' });
        setAgoraClient(client);
        return true;
      }
      return false;
    };

    if (!initAgora()) {
      const interval = setInterval(() => {
        if (initAgora()) clearInterval(interval);
      }, 500);
      return () => clearInterval(interval);
    }
  }, [agoraClient]);

  const handleEndCall = async () => {
    if (window.activeCallId) {
      try {
        updateLocalCall(window.activeCallId, {
          status: 'ended',
          duration: callDuration,
          endedAt: new Date().toISOString()
        });
        await api.post('/call/respond', {
          callId: window.activeCallId,
          status: 'ended'
        });
      } catch (err) {}
      window.activeCallId = null;
    }
    
    if (localAudioTrack) {
      localAudioTrack.stop();
      localAudioTrack.close();
      setLocalAudioTrack(null);
    }
    if (localVideoTrack) {
      localVideoTrack.stop();
      localVideoTrack.close();
      setLocalVideoTrack(null);
    }
    
    if (agoraClient) {
      try {
        await agoraClient.leave();
      } catch (e) {}
    }

    if (remoteAudioTrackRef.current) {
      remoteAudioTrackRef.current = null;
    }
    
    setActiveCall(null);
    setIsInCall(false);
    setRemoteUserJoined(false);
    setIsMuted(false);
    setIsVideoDisabled(false);
    setIsSpeakerMuted(false);
    setCallDuration(0);
  };

  const startAgoraSession = async (channel, token, isVideo) => {
    let client = agoraClient;
    if (!client && window.AgoraRTC) {
      client = window.AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' });
      setAgoraClient(client);
    }
    if (!client || !window.AgoraRTC) {
      throw new Error("Video calling service is currently initializing. Please try again.");
    }
    try {
      const APP_ID = "f528113caaf04056b2f27c6c9e3ac4ad";
      await client.join(APP_ID, channel, token, null);
      
      const audioTrack = await window.AgoraRTC.createMicrophoneAudioTrack();
      setLocalAudioTrack(audioTrack);
      
      let videoTrack = null;
      if (isVideo && hasVideoCallingAccess) {
        videoTrack = await window.AgoraRTC.createCameraVideoTrack();
        setLocalVideoTrack(videoTrack);
      }
      
      const tracksToPublish = [audioTrack, videoTrack].filter(Boolean);
      await client.publish(tracksToPublish);
      
      setIsInCall(true);
      
      if (videoTrack) {
        setTimeout(() => {
          const localContainer = document.getElementById('local-video-container');
          if (localContainer) videoTrack.play(localContainer);
        }, 500);
      }
      
      client.on('user-published', async (user, mediaType) => {
        await client.subscribe(user, mediaType);
        setRemoteUserJoined(true);
        if (mediaType === 'video') {
          setTimeout(() => {
            const remoteContainer = document.getElementById('remote-video-container');
            if (remoteContainer) user.videoTrack.play(remoteContainer);
          }, 500);
        }
        if (mediaType === 'audio') {
          remoteAudioTrackRef.current = user.audioTrack;
          user.audioTrack.play();
        }
      });
      
      client.on('user-left', () => {
        setRemoteUserJoined(false);
        handleEndCall();
      });
      
    } catch (err) {
      console.error("Agora join error:", err);
      throw err;
    }
  };

  const handleInitiateCall = async (type) => {
    if (!activeContact || !currentUserProfile) return;
    const isVideo = type === 'video';

    // Strict guard: Block video call initiation if plan does not include video calling
    if (isVideo && !hasVideoCallingAccess) {
      navigate('/plans');
      return;
    }

    const channelName = `call_${currentUserProfile._id}_${activeContact._id}_${Date.now()}`;
    
    setActiveCall(type);
    setIsVideoDisabled(!isVideo);
    
    try {
      const initRes = await api.post('/call/initiate', {
        receiverId: activeContact._id,
        channelName,
        isVideoCall: isVideo
      });
      const activeCallId = initRes.data._id;
      recordLocalCall({
        _id: activeCallId,
        caller: currentUserProfile,
        receiver: activeContact,
        channelName,
        isVideoCall: isVideo,
        status: 'ringing',
        createdAt: new Date().toISOString(),
        duration: 0
      });
      
      const tokenRes = await api.post('/call/token', {
        channelName,
        uid: 0,
        role: 'publisher'
      });
      const agoraToken = tokenRes.data.token;
      
      await startAgoraSession(channelName, agoraToken, isVideo);
      window.activeCallId = activeCallId;
    } catch (err) {
      console.error("Error initiating call:", err);
      alert(err.response?.data?.message || err.message || "Failed to initiate call.");
      handleEndCall();
    }
  };

  const handleAcceptCall = async () => {
    if (!incomingCall) return;
    
    // Only accept with video if user's subscription plan allows video calling
    const isVideo = Boolean(incomingCall.isVideoCall && hasVideoCallingAccess);
    setActiveCall(isVideo ? 'video' : 'voice');
    setIsVideoDisabled(!isVideo);
    const answeringCall = incomingCall;
    setIncomingCall(null);
    
    try {
      await api.post('/call/respond', {
        callId: answeringCall._id,
        status: 'accepted'
      });
      window.activeCallId = answeringCall._id;
      recordLocalCall({
        _id: answeringCall._id,
        caller: answeringCall.caller,
        receiver: currentUserProfile,
        channelName: answeringCall.channelName,
        isVideoCall: isVideo,
        status: 'accepted',
        createdAt: answeringCall.createdAt || new Date().toISOString()
      });
      
      const tokenRes = await api.post('/call/token', {
        channelName: answeringCall.channelName,
        uid: 0,
        role: 'publisher'
      });
      
      await startAgoraSession(answeringCall.channelName, tokenRes.data.token, isVideo);
    } catch (err) {
      console.error("Error accepting call:", err);
      handleEndCall();
    }
  };

  const handleDeclineCall = async () => {
    if (!incomingCall) return;
    const decliningCall = incomingCall;
    try {
      updateLocalCall(decliningCall._id, {
        status: 'rejected'
      });
      await api.post('/call/respond', {
        callId: decliningCall._id,
        status: 'rejected'
      });
    } catch (err) {
      console.error("Error declining call:", err);
    }
    setIncomingCall(null);
  };

  const handleToggleMute = () => {
    if (localAudioTrack) {
      localAudioTrack.setEnabled(isMuted);
    }
    setIsMuted(!isMuted);
  };

  const handleToggleVideo = () => {
    if (!hasVideoCallingAccess) return;
    if (localVideoTrack) {
      localVideoTrack.setEnabled(isVideoDisabled);
    }
    setIsVideoDisabled(!isVideoDisabled);
  };

  // Switch camera device / flip camera on call screen (only if plan supports video calling)
  const handleSwitchCamera = async () => {
    if (!hasVideoCallingAccess || !localVideoTrack) return;
    try {
      let cameras = availableCameras;
      if (!cameras || cameras.length === 0) {
        if (window.AgoraRTC?.getCameras) {
          cameras = await window.AgoraRTC.getCameras();
        } else if (navigator.mediaDevices?.enumerateDevices) {
          const devices = await navigator.mediaDevices.enumerateDevices();
          cameras = devices.filter(d => d.kind === 'videoinput');
        }
        setAvailableCameras(cameras || []);
      }
      if (cameras && cameras.length > 1) {
        const nextIdx = (currentCameraIndex + 1) % cameras.length;
        const nextCam = cameras[nextIdx];
        if (nextCam && localVideoTrack.setDevice) {
          await localVideoTrack.setDevice(nextCam.deviceId);
          setCurrentCameraIndex(nextIdx);
        }
      }
    } catch (err) {
      console.warn('Could not switch camera device on call screen:', err);
    }
  };

  const handleToggleSpeaker = () => {
    if (remoteAudioTrackRef.current) {
      if (isSpeakerMuted) {
        remoteAudioTrackRef.current.setVolume(100);
        setIsSpeakerMuted(false);
      } else {
        remoteAudioTrackRef.current.setVolume(0);
        setIsSpeakerMuted(true);
      }
    } else {
      setIsSpeakerMuted(!isSpeakerMuted);
    }
  };

  useEffect(() => {
    let interval;
    if (currentUserProfile) {
      interval = setInterval(async () => {
        try {
          const res = await api.get('/call/incoming');
          if (res.data.incomingCall && !incomingCall && !activeCall) {
            setIncomingCall(res.data.incomingCall);
          }
          if (activeCall && res.data.outgoingCallStatus) {
            if (res.data.outgoingCallStatus === 'rejected' || res.data.outgoingCallStatus === 'ended') {
              handleEndCall();
            }
          }
        } catch (err) {
          console.error("Error polling incoming calls:", err);
        }
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [currentUserProfile, incomingCall, activeCall]);
  
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  // Fetch current user profile and public membership plans
  useEffect(() => {
    const fetchCurrentUserAndPlans = async () => {
      try {
        const res = await api.get('/users/profile');
        setCurrentUserProfile(res.data);
      } catch (err) {
        console.error('Error fetching current user profile:', err);
      }
      try {
        const plansRes = await api.get('/public/plans');
        if (Array.isArray(plansRes.data)) {
          setAvailablePlans(plansRes.data);
        }
      } catch (pErr) {
        console.warn('Error fetching public membership plans in Messages:', pErr);
      }
    };
    fetchCurrentUserAndPlans();
  }, []);

  // Fetch accepted contacts with dynamic online/offline status
  const fetchContacts = useCallback(async (isBackground = false) => {
    try {
      if (!isBackground) setLoadingContacts(true);
      const res = await api.get('/users/chats');
      const data = res.data || [];
      const contactsWithStatus = data.map((c) => {
        const statusInfo = parseUserOnlineStatus(c);
        return {
          ...c,
          ...statusInfo
        };
      });

      setContacts(contactsWithStatus);

      // Keep activeContact updated with the latest status or select targetContactId if provided
      setActiveContact((prevActive) => {
        if (targetContactId) {
          const matchedTarget = contactsWithStatus.find((item) => String(item._id) === String(targetContactId));
          if (matchedTarget) return matchedTarget;
        }
        if (!prevActive && contactsWithStatus.length > 0) {
          return contactsWithStatus[0];
        }
        if (prevActive) {
          const updatedActive = contactsWithStatus.find((item) => item._id === prevActive._id);
          if (updatedActive) {
            return {
              ...prevActive,
              ...updatedActive,
              online: updatedActive.online,
              isOnline: updatedActive.isOnline,
              lastActiveLabel: updatedActive.lastActiveLabel,
              lastActiveTime: updatedActive.lastActiveTime
            };
          }
        }
        return prevActive;
      });
    } catch (err) {
      console.error('Error fetching chat contacts:', err);
    } finally {
      if (!isBackground) setLoadingContacts(false);
    }
  }, [targetContactId]);

  useEffect(() => {
    fetchContacts(false);

    // Periodic dynamic update of contacts & online status every 10 seconds
    const statusInterval = setInterval(() => {
      fetchContacts(true);
    }, 10000);

    return () => clearInterval(statusInterval);
  }, [fetchContacts]);

  // Handle direct opening of conversation with a target member
  useEffect(() => {
    if (!targetContactId || loadingContacts) return;
    const existing = contacts.find((c) => String(c._id) === String(targetContactId));
    if (existing) {
      setActiveContact(existing);
    } else {
      api.get(`/users/profile/${targetContactId}`).then((res) => {
        if (res.data) {
          const u = res.data;
          const newContact = {
            ...u,
            _id: u._id || targetContactId,
            profile: u.profile || u,
            ...parseUserOnlineStatus(u)
          };
          setContacts((prev) => {
            if (prev.some((item) => String(item._id) === String(targetContactId))) return prev;
            return [newContact, ...prev];
          });
          setActiveContact(newContact);
        }
      }).catch((err) => {
        console.warn('Could not load target contact details for messaging:', err);
      });
    }
  }, [targetContactId, loadingContacts, contacts]);

  // Fetch messages when active contact changes
  useEffect(() => {
    if (!activeContact) return;
    let isCancelled = false;

    const fetchMessages = async () => {
      try {
        setLoadingMessages(true);
        setChatError(null);
        const res = await api.get(`/users/chat/${activeContact._id}`);
        if (!isCancelled) {
          setMessages(res.data || []);
          setChatError(null);
        }
      } catch (err) {
        if (!isCancelled) {
          console.error('Error fetching messages:', err);
          const is403 = err.response?.status === 403;
          const errMsg = err.response?.data?.message || err.message || 'Unable to load messages.';
          setChatError({
            status: err.response?.status,
            message: errMsg,
            isPermissionError: is403
          });
        }
      } finally {
        if (!isCancelled) {
          setLoadingMessages(false);
        }
      }
    };
    fetchMessages();

    const interval = setInterval(async () => {
      try {
        const res = await api.get(`/users/chat/${activeContact._id}`);
        if (!isCancelled) {
          setMessages(res.data || []);
          setChatError(null);
        }
      } catch (err) {
        if (!isCancelled) {
          if (err.response?.status === 403) {
            clearInterval(interval);
            setChatError({
              status: 403,
              message: err.response?.data?.message || 'Chat is available only when at least one user has an active premium membership.',
              isPermissionError: true
            });
          }
        }
      }
    }, 3000);

    return () => {
      isCancelled = true;
      clearInterval(interval);
    };
  }, [activeContact]);

  // Scroll to bottom of message list
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Voice recording timer hook
  useEffect(() => {
    let timer;
    if (isRecording) {
      timer = setInterval(() => {
        setRecordTime((t) => t + 1);
      }, 1000);
    } else {
      setRecordTime(0);
    }
    return () => clearInterval(timer);
  }, [isRecording]);

  const handleSendMessage = async (e) => {
    if (e) e.preventDefault();
    if (!inputText.trim() || !activeContact || sending) return;

    if (!canChat) {
      alert('Chat between free members is not permitted. Please upgrade to a Premium plan to start chatting.');
      navigate('/plans');
      return;
    }

    const messageText = inputText;
    setInputText('');
    setSending(true);

    try {
      const res = await api.post(`/users/chat/${activeContact._id}`, {
        text: messageText,
        messageType: 'text'
      });
      
      const newMsg = res.data;
      setMessages((prev) => [...prev, newMsg]);
      setChatError(null);

    } catch (err) {
      console.error('Error sending message:', err);
      const is403 = err.response?.status === 403;
      const errorMsg = err.response?.data?.message || 'Failed to send message. Please try again.';
      setInputText(messageText); // Restore user's draft on error
      if (is403) {
        setChatError({
          status: 403,
          message: errorMsg,
          isPermissionError: true
        });
      }
      alert(errorMsg);
    } finally {
      setSending(false);
    }
  };

  // Send voice message action
  const handleSendVoiceMessage = async () => {
    if (!activeContact || sending) return;
    setIsRecording(false);
    setSending(true);

    try {
      const res = await api.post(`/users/chat/${activeContact._id}`, {
        text: '[Voice Message]',
        messageType: 'sticker',
        mediaUrl: ''
      });
      
      const newMsg = res.data;
      setMessages((prev) => [...prev, newMsg]);
      setChatError(null);
    } catch (err) {
      console.error('Error sending voice message:', err);
      const is403 = err.response?.status === 403;
      const errorMsg = err.response?.data?.message || 'Failed to send voice message. Please try again.';
      if (is403) {
        setChatError({
          status: 403,
          message: errorMsg,
          isPermissionError: true
        });
      }
      alert(errorMsg);
    } finally {
      setSending(false);
    }
  };

  // Send attachment (camera, photo, or document) - strictly no video
  const handleAttachmentUpload = async (file, type) => {
    if (!file || !activeContact || sending) return;

    if (file.type && file.type.startsWith('video/')) {
      alert('Video uploads are disabled in chat.');
      return;
    }

    setSending(true);
    try {
      const formData = new FormData();
      formData.append('media', file);
      const uploadRes = await api.post('/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      const mediaUrl = uploadRes.data.urls[0];
      
      const isDoc = type === 'document' || 
        file.name.endsWith('.pdf') || 
        file.name.endsWith('.doc') || 
        file.name.endsWith('.docx') || 
        file.name.endsWith('.txt');
      
      const res = await api.post(`/users/chat/${activeContact._id}`, {
        text: isDoc ? file.name : (type === 'camera' ? '[Camera Photo]' : '[Image Message]'),
        messageType: 'image',
        mediaUrl: mediaUrl
      });
      
      const newMsg = res.data;
      setMessages((prev) => [...prev, newMsg]);
      setChatError(null);
    } catch (err) {
      console.error('Error sending attachment:', err);
      const is403 = err.response?.status === 403;
      const errorMsg = err.response?.data?.message || 'Failed to send attachment. Please try again.';
      if (is403) {
        setChatError({
          status: 403,
          message: errorMsg,
          isPermissionError: true
        });
      }
      alert(errorMsg);
    } finally {
      setSending(false);
    }
  };

  // Send selected GIF
  const handleSendGif = async (gif) => {
    if (!activeContact || sending) return;
    setShowGifPicker(false);
    setSending(true);

    try {
      const res = await api.post(`/users/chat/${activeContact._id}`, {
        text: '[GIF]',
        messageType: 'gif',
        mediaUrl: gif.url
      });
      const newMsg = res.data;
      setMessages((prev) => [...prev, newMsg]);
      setChatError(null);
    } catch (err) {
      console.error('Error sending GIF:', err);
      const is403 = err.response?.status === 403;
      const errorMsg = err.response?.data?.message || 'Failed to send GIF. Please try again.';
      if (is403) {
        setChatError({
          status: 403,
          message: errorMsg,
          isPermissionError: true
        });
      }
      alert(errorMsg);
    } finally {
      setSending(false);
    }
  };

  const filteredGifs = GIF_COLLECTION.filter(gif => {
    const matchesCat = selectedGifCategory === 'all' || gif.category === selectedGifCategory;
    const matchesSearch = !gifSearchQuery.trim() || 
      gif.title.toLowerCase().includes(gifSearchQuery.toLowerCase()) ||
      gif.tags.some(tag => tag.toLowerCase().includes(gifSearchQuery.toLowerCase()));
    return matchesCat && matchesSearch;
  });

  const handleDoubleClickMessage = (msgId) => {
    setLikedMessages((prev) => ({
      ...prev,
      [msgId]: !prev[msgId]
    }));
  };

  const formatRecordTime = (sec) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleBlockUser = async () => {
    if (!activeContact || isBlockingUser) return;
    const contactName = activeContact.profile?.name || activeContact.name || 'this user';
    
    if (!window.confirm(`Are you sure you want to block ${contactName}?`)) {
      return;
    }

    setIsBlockingUser(true);
    try {
      // 1. Retrieve the latest 5 messages from this conversation
      let chatMessages = messages;
      if (!chatMessages || chatMessages.length === 0) {
        try {
          const res = await api.get(`/users/chat/${activeContact._id}`);
          if (Array.isArray(res.data)) {
            chatMessages = res.data;
          }
        } catch (fetchErr) {
          console.warn('Could not fetch latest chat messages before blocking:', fetchErr);
          chatMessages = [];
        }
      }

      // 2. Select the last 5 messages in chronological order (oldest to newest)
      const recent5 = (chatMessages || []).slice(-5);
      const formattedMessages = recent5.map((msg) => ({
        _id: msg._id || msg.id,
        senderId: typeof msg.sender === 'object' ? (msg.sender?._id || msg.sender?.id) : msg.sender,
        sender: typeof msg.sender === 'object' ? (msg.sender?.profile?.name || msg.sender?.name || 'User') : (msg.sender || 'User'),
        receiverId: typeof msg.receiver === 'object' ? (msg.receiver?._id || msg.receiver?.id) : msg.receiver,
        content: msg.text || msg.content || (msg.mediaUrl ? `[${msg.mediaType || 'Attachment'}]` : ''),
        text: msg.text || msg.content || '',
        mediaUrl: msg.mediaUrl || null,
        mediaType: msg.mediaType || null,
        timestamp: msg.createdAt || msg.timestamp || new Date().toISOString(),
        createdAt: msg.createdAt || msg.timestamp || new Date().toISOString()
      }));

      // 3. Send block request with the last 5 messages included in body
      await api.post(`/users/block/${activeContact._id}`, {
        messages: formattedMessages,
        lastMessages: formattedMessages
      });

      alert('User blocked successfully.');
      setActiveContact(null);
      setContacts((prev) => prev.filter((c) => String(c._id) !== String(activeContact._id)));
      if (typeof fetchContacts === 'function') {
        fetchContacts(true);
      }
    } catch (err) {
      console.error('Error blocking user:', err);
      alert(err.response?.data?.message || 'Failed to block user. Please try again.');
    } finally {
      setIsBlockingUser(false);
    }
  };

  const filteredContacts = contacts.filter(c => {
    const name = c.profile?.name || '';
    return name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const getNotesList = () => {
    const list = [];
    contacts.slice(0, 4).forEach((c, idx) => {
      const p = c.profile || {};
      const notesTexts = [
        'Antha Nila... Awaken Kids 🎵',
        'Nesamagu... Stephen Zecha... 🎵',
        'Ullaalla... Anirudh R 🎵',
        'Weekend vibes! ✨'
      ];
      list.push({
        id: c._id,
        name: p.name ? p.name.split(' ')[0] : 'Member',
        note: notesTexts[idx % notesTexts.length],
        photo: p.photos?.[0] ? getPhotoUrl(p.photos[0]) : null,
        online: c.online
      });
    });
    return list;
  };

const displayUsername = currentUserProfile?.profile?.name
    ? currentUserProfile.profile.name.toLowerCase().replace(/\s+/g, '_')
    : 'devil_with_curls';

  return (
    <>
      <div className="max-w-7xl w-full mx-auto my-0 md:my-4 px-0 md:px-4 h-[calc(100vh-80px)] md:h-[calc(100vh-80px-2rem)]">
      <div className="bg-white border-0 md:border border-slate-200 rounded-none md:rounded-lg overflow-hidden flex h-full text-slate-800">
        
        {/* Left Side: Contacts Panel */}
        <div className={`w-full md:w-[360px] border-r border-slate-200 flex flex-col h-full bg-white ${activeContact ? 'hidden md:flex' : 'flex'}`}>
          <div className="p-4 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-1.5 cursor-pointer">
              <h2 className="text-xl font-bold tracking-tight text-slate-900">{displayUsername}</h2>
              <FontAwesomeIcon icon={faChevronDown} className="text-xs text-slate-500" />
            </div>
            {/* Call History Button */}
            <button
              id="chat-call-history-sidebar-btn"
              type="button"
              onClick={() => {
                setCallHistoryFilterUserId(null);
                setShowCallHistoryModal(true);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-[#5D34F7]/10 text-slate-700 hover:text-[#5D34F7] font-bold text-xs transition-all cursor-pointer border border-slate-200/80 shadow-2xs group active:scale-95"
              title="View Call History"
              aria-label="View Call History"
            >
              <FontAwesomeIcon icon={faClockRotateLeft} className="text-slate-500 group-hover:text-[#5D34F7] text-xs transition-colors" />
              <span>Call History</span>
            </button>
          </div>

          {/* Search Contacts */}
          <div className="px-4 pb-2 shrink-0">
            <div className="relative">
              <input
                type="text"
                placeholder="Search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#EFEFEF] hover:bg-[#F5F5F5] border-none rounded-lg py-2 pl-9 pr-4 text-[14px] text-slate-800 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-300 transition-all"
              />
              <FontAwesomeIcon icon={faSearch} className="absolute left-3.5 top-3 text-slate-400 text-xs" />
            </div>
          </div>

          {/* Notes Shelf */}
          {getNotesList().length > 0 && (
            <div className="px-4 py-3 flex items-center gap-4 overflow-x-auto shrink-0 scrollbar-none border-b border-slate-100">
              {getNotesList().map((item) => (
                <div key={item.id} className="flex flex-col items-center shrink-0 w-16 relative">
                  <div className="absolute -top-7 bg-white border border-slate-200 rounded-xl px-2 py-1 shadow-sm max-w-[80px] truncate text-[9px] text-center font-medium text-slate-700 leading-tight">
                    {item.note}
                  </div>
                  <div className="relative mt-5">
                    <div className="w-14 h-14 rounded-full overflow-hidden border border-slate-200 flex items-center justify-center bg-slate-100">
                      {item.photo ? (
                        <img src={item.photo} alt="Avatar" className="w-full h-full object-cover" />
                      ) : (
                        <FontAwesomeIcon icon={faUser} className="text-slate-400 text-lg" />
                      )}
                    </div>
                    {item.online ? (
                      <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full ring-1 ring-emerald-500/20" title="Online"></span>
                    ) : (
                      <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-slate-300 border-2 border-white rounded-full" title="Offline"></span>
                    )}
                  </div>
                  <span className="text-[10px] text-slate-500 truncate w-full text-center mt-1 font-medium">{item.name}</span>
                </div>
              ))}
            </div>
          )}

          {/* Messages Header Tab */}
          <div className="px-4 py-2 flex items-center justify-between shrink-0">
            <h3 className="font-extrabold text-[15px] text-slate-905 flex items-center gap-2">
              <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M20 2H4C2.9 2 2 2.9 2 4V22L6 18H20C21.1 18 22 17.1 22 16V4C22 2.9 21.1 2 20 2Z" fill="url(#msg_title_grad)" />
                <defs>
                  <linearGradient id="msg_title_grad" x1="2" y1="2" x2="22" y2="22" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#4895EF" />
                    <stop offset="1" stopColor="#4CC9F0" />
                  </linearGradient>
                </defs>
              </svg>
              <span>Messages</span>
            </h3>
            <button
              id="chat-call-logs-pill-btn"
              type="button"
              onClick={() => {
                setCallHistoryFilterUserId(null);
                setShowCallHistoryModal(true);
              }}
              className="text-xs font-bold text-[#5D34F7] hover:bg-[#5D34F7]/10 px-2.5 py-1 rounded-xl flex items-center gap-1.5 cursor-pointer transition border border-[#5D34F7]/15 shadow-2xs active:scale-95"
              title="View Call Logs"
              aria-label="View Call Logs"
            >
              <FontAwesomeIcon icon={faPhone} className="text-[10px]" />
              <span>Call Logs</span>
            </button>
          </div>

          {/* Contacts List */}
          <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
            {loadingContacts ? (
              <div className="flex justify-center items-center py-12">
                <img src={loadingImg} className="w-10 h-10 animate-spin" alt="Loading..." />
              </div>
            ) : filteredContacts.length === 0 ? (
              searchQuery.trim() ? (
                <div className="text-center py-8 px-4 space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-slate-100 mx-auto flex items-center justify-center text-slate-400">
                    <FontAwesomeIcon icon={faSearch} className="text-base" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-800">No chats found</h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">No conversation matches "{searchQuery.trim()}".</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition cursor-pointer"
                  >
                    Clear Search
                  </button>
                </div>
              ) : (
                <div className="text-center py-10 px-4 space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 mx-auto flex items-center justify-center text-[#5D34F7]">
                    <FontAwesomeIcon icon={faCommentDots} className="text-lg" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-800">No Active Conversations</h4>
                    <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                      Send interests or accept requests to start chatting with verified members.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => navigate('/preference-matches')}
                    className="px-4 py-2 bg-gradient-to-r from-[#5D34F7] to-[#4024DB] text-white text-xs font-bold rounded-xl transition shadow-xs active:scale-95 cursor-pointer inline-flex items-center gap-1.5"
                  >
                    Explore Matches
                  </button>
                </div>
              )
            ) : (
              filteredContacts.map((contact, idx) => {
                const isActive = activeContact?._id === contact._id;
                const p = contact.profile || {};
                const hasUnread = !isActive && Boolean(contact.unreadCount > 0 || contact.hasUnread || contact.unread);
                return (
                  <button
                    key={contact._id}
                    onClick={() => setActiveContact(contact)}
                    className={`w-full flex items-center gap-3.5 p-3 rounded-lg transition duration-150 cursor-pointer ${
                      isActive ? 'bg-[#F2F2F2]' : 'hover:bg-[#FAFAFA]'
                    }`}
                  >
                    <div className="relative shrink-0">
                      <div className="w-14 h-14 rounded-full overflow-hidden border border-slate-200 flex items-center justify-center bg-slate-100">
                        {p.photos && p.photos[0] ? (
                          <img 
                            src={getPhotoUrl(p.photos[0], p.gender)} 
                            alt={p.name || 'Avatar'} 
                            onError={(e) => handleImageError(e, p.gender)}
                            className="w-full h-full object-cover" 
                          />
                        ) : (
                          <img 
                            src={getDefaultAvatar(p.gender)} 
                            alt={p.name || 'Avatar'} 
                            className="w-full h-full object-cover" 
                          />
                        )}
                      </div>
                      {contact.online ? (
                        <span 
                          className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full ring-1 ring-emerald-500/20"
                          title="Online"
                        ></span>
                      ) : (
                        <span 
                          className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-slate-300 border-2 border-white rounded-full"
                          title={contact.lastActiveLabel || 'Offline'}
                        ></span>
                      )}
                    </div>
                    <div className="text-left overflow-hidden flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <h4 className={`text-sm truncate leading-snug ${hasUnread ? 'font-bold text-slate-900' : 'font-semibold text-slate-800'}`}>
                          {p.name || 'Matrimony Member'}
                        </h4>
                        {contact.online ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-black text-emerald-600 bg-emerald-50 border border-emerald-200/70 px-1.5 py-0.5 rounded-full shrink-0 shadow-2xs">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                            <span>Online</span>
                          </span>
                        ) : (
                          <span className="text-[10px] font-semibold text-slate-400 shrink-0 truncate max-w-[95px]">
                            {contact.lastActiveLabel || 'Offline'}
                          </span>
                        )}
                      </div>
                      <p className={`text-xs truncate mt-0.5 ${hasUnread ? 'font-bold text-slate-900' : 'text-slate-500'}`}>
                        {hasUnread ? 'sent an attachment.' : (contact.online ? (
                          <span className="text-emerald-600 font-semibold">Active now</span>
                        ) : (
                          <span>{contact.lastActiveLabel || 'Offline'}</span>
                        ))}
                        <span className="text-slate-400 ml-1.5">• {idx + 1}h</span>
                      </p>
                    </div>
                    {hasUnread && !isActive && (
                      <span className="w-2.5 h-2.5 bg-blue-500 rounded-full shrink-0 mr-1"></span>
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right Side: Chat panel */}
        <div className={`flex-1 flex flex-col h-full bg-white ${!activeContact ? 'hidden md:flex items-center justify-center' : 'flex'}`}>
          {activeContact ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-white shrink-0">
                <div className="flex items-center gap-3 min-w-0">
                  <button 
                    onClick={() => setActiveContact(null)} 
                    className="md:hidden p-1.5 hover:bg-slate-100 rounded-full text-slate-700 transition mr-1 shrink-0"
                  >
                    <FontAwesomeIcon icon={faArrowLeft} />
                  </button>
                  <div className="relative shrink-0">
                    <div 
                      onClick={() => { setPreviewContact(activeContact); setActivePreviewImage(activeContact.profile?.photos?.[0] || ''); }}
                      className="w-11 h-11 rounded-full overflow-hidden bg-slate-100 border border-slate-200 flex items-center justify-center cursor-pointer hover:opacity-90 transition"
                    >
                      {activeContact.profile?.photos && activeContact.profile.photos[0] ? (
                        <img 
                          src={getPhotoUrl(activeContact.profile.photos[0], activeContact.profile.gender)} 
                          alt={activeContact.profile.name || 'Avatar'} 
                          onError={(e) => handleImageError(e, activeContact.profile.gender)}
                          className="w-full h-full object-cover" 
                        />
                      ) : (
                        <img 
                          src={getDefaultAvatar(activeContact.profile?.gender)} 
                          alt="Avatar" 
                          className="w-full h-full object-cover" 
                        />
                      )}
                    </div>
                    {activeContact.online ? (
                      <span 
                        className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full ring-1 ring-emerald-500/20"
                        title="Online"
                      ></span>
                    ) : (
                      <span 
                        className="absolute bottom-0 right-0 w-3 h-3 bg-slate-300 border-2 border-white rounded-full"
                        title={activeContact.lastActiveLabel || 'Offline'}
                      ></span>
                    )}
                  </div>
                  <div 
                    onClick={() => { setPreviewContact(activeContact); setActivePreviewImage(activeContact.profile?.photos?.[0] || ''); }}
                    className="cursor-pointer hover:opacity-90 transition min-w-0"
                  >
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-bold text-sm text-slate-900 leading-tight truncate">
                        {activeContact.profile?.name || 'Matrimony Member'}
                      </h3>
                      {activeContact.online ? (
                        <span className="inline-flex items-center gap-1 bg-emerald-50 border border-emerald-200/80 text-emerald-700 text-[10px] font-black px-2 py-0.5 rounded-full shadow-2xs shrink-0">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                          <span>Online</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 bg-slate-100 border border-slate-200/60 text-slate-500 text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0">
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                          <span>Offline</span>
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 text-[11px] mt-0.5">
                      {activeContact.online ? (
                        <span className="text-emerald-600 font-bold flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                          <span>Active now</span>
                        </span>
                      ) : (
                        <span className="text-slate-400 font-medium flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>
                          <span>{activeContact.lastActiveLabel || 'Offline'}</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 sm:gap-3 text-slate-700 relative shrink-0">
                  {/* Video Call Button */}
                  <button 
                    id="chat-video-call-btn"
                    onClick={() => {
                      if (!canCall) {
                        alert(isReceiverPremium
                          ? 'Video calling is a Premium feature. Upgrade your plan to initiate direct voice and video calls.'
                          : 'Direct calling between free members is not permitted. Upgrade to Premium to unlock calling.');
                        navigate('/plans');
                        return;
                      }
                      if (!hasVideoCallingAccess) {
                        navigate('/plans');
                        return;
                      }
                      if (activeContact.settings?.allowVoiceAndVideoCalls === false) {
                        alert('This member has disabled incoming calls.');
                        return;
                      }
                      handleInitiateCall('video');
                    }} 
                    className={`transition p-2 rounded-full cursor-pointer relative flex items-center justify-center shrink-0 active:scale-95 ${
                      canCall && hasVideoCallingAccess
                        ? 'hover:text-[#5D34F7] hover:bg-purple-50 text-slate-700'
                        : 'text-slate-400 hover:text-slate-500 opacity-60 hover:opacity-100 hover:bg-slate-100'
                    }`}
                    title={
                      canCall && hasVideoCallingAccess 
                        ? "Start Video Call" 
                        : (!canCall
                            ? (isReceiverPremium ? "Upgrade to call this Premium member" : "Upgrade to Premium to unlock calling")
                            : "Video calling requires Diamond or Platinum Plan. Click to upgrade.")
                    }
                    aria-label={canCall && hasVideoCallingAccess ? "Start Video Call" : "Upgrade to Video Call"}
                  >
                    {(!canCall || !hasVideoCallingAccess) && <span className="absolute -top-1 -right-1 text-[9px] leading-none select-none">🔒</span>}
                    <FontAwesomeIcon icon={faVideo} className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
                  </button>

                  {/* Phone Call Button */}
                  <button 
                    id="chat-phone-call-btn"
                    onClick={() => {
                      if (!canCall) {
                        alert(isReceiverPremium
                          ? 'Voice calling is a Premium feature. Upgrade your plan to initiate calls.'
                          : 'Direct calling between free members is not permitted. Upgrade to Premium to unlock calling.');
                        navigate('/plans');
                        return;
                      }
                      if (activeContact.settings?.allowVoiceAndVideoCalls === false) {
                        alert('This member has disabled incoming calls.');
                        return;
                      }
                      const ph = activeContact.phone || activeContact.profile?.phone || activeContact.mobile || '';
                      setCallModalData({
                        isOpen: true,
                        phone: ph || 'Contact Phone Unspecified',
                        name: activeContact.profile?.name || activeContact.name || 'Member',
                        photo: activeContact.profile?.photos?.[0] || activeContact.photo || null
                      });
                    }} 
                    className="hover:text-emerald-600 hover:bg-emerald-50 text-slate-700 transition p-2 rounded-full cursor-pointer relative flex items-center justify-center shrink-0 active:scale-95"
                    title={canCall ? "Call Member" : (isReceiverPremium ? "Upgrade to call this Premium member" : "Upgrade to Premium to unlock calling")}
                    aria-label={canCall ? "Call Member" : "Upgrade to Call"}
                  >
                    {!canCall && <span className="absolute -top-1 -right-1 text-[9px] leading-none select-none">🔒</span>}
                    <FontAwesomeIcon icon={faPhone} className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
                  </button>

                  {/* Call History Button */}
                  <button 
                    id="chat-call-history-header-btn"
                    onClick={() => {
                      setCallHistoryFilterUserId(activeContact?._id);
                      setShowCallHistoryModal(true);
                    }}
                    className="hover:text-[#5D34F7] hover:bg-purple-50 text-slate-700 transition p-2 rounded-full cursor-pointer relative flex items-center justify-center shrink-0 active:scale-95"
                    title="Call History with this member"
                    aria-label="Call History with this member"
                  >
                    <FontAwesomeIcon icon={faClockRotateLeft} className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
                  </button>

                  {/* Block User Button */}
                  <button 
                    id="chat-block-user-btn"
                    onClick={handleBlockUser}
                    disabled={isBlockingUser}
                    className="hover:text-rose-500 transition px-2.5 py-1.5 hover:bg-rose-50 rounded-full cursor-pointer text-xs font-semibold text-slate-600 shrink-0 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
                    title="Block User"
                    aria-label="Block User"
                  >
                    {isBlockingUser ? (
                      <>
                        <span className="w-3 h-3 border-2 border-rose-500 border-t-transparent rounded-full animate-spin"></span>
                        <span>Blocking...</span>
                      </>
                    ) : (
                      <span>Block</span>
                    )}
                  </button>
                </div>
              </div>

              {/* Chat Messages */}
              <div className="flex-1 overflow-y-auto p-5 space-y-3 bg-white">
                {loadingMessages && messages.length === 0 ? (
                  <div className="flex flex-col justify-center items-center h-full text-center py-12">
                    <img src={loadingImg} className="w-12 h-12 animate-spin mb-3" alt="Loading..." />
                    <p className="text-slate-400 text-xs font-semibold">Loading conversation...</p>
                  </div>
                ) : chatError?.isPermissionError && messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center p-6 max-w-md mx-auto space-y-4 animate-in fade-in duration-200">
                    <div className="w-16 h-16 rounded-full bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center text-2xl shadow-sm">
                      <FontAwesomeIcon icon={faCrown} />
                    </div>
                    <div className="space-y-1.5">
                      <h4 className="text-base font-black text-slate-900">
                        Subscription Notice
                      </h4>
                      <p className="text-slate-600 text-xs font-medium leading-relaxed">
                        {chatError.message || 'Chat is available only when at least one user has an active premium membership.'}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => navigate('/plans')}
                      className="px-6 py-2.5 bg-gradient-to-r from-[#5D34F7] to-[#4024DB] hover:from-[#4f27e5] hover:to-[#381fcc] text-white font-extrabold text-xs rounded-xl shadow-md transition active:scale-95 cursor-pointer flex items-center justify-center gap-2"
                    >
                      <FontAwesomeIcon icon={faCrown} className="text-xs" />
                      <span>View Available Plans</span>
                    </button>
                  </div>
                ) : !loadingMessages && messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center p-6 max-w-sm mx-auto space-y-4 animate-in fade-in duration-200">
                    <div className="relative">
                      <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-slate-200 bg-slate-100 flex items-center justify-center shadow-sm">
                        {activeContact.profile?.photos && activeContact.profile.photos[0] ? (
                          <img 
                            src={getPhotoUrl(activeContact.profile.photos[0], activeContact.profile.gender)} 
                            alt={activeContact.profile.name || 'Avatar'} 
                            onError={(e) => handleImageError(e, activeContact.profile.gender)}
                            className="w-full h-full object-cover" 
                          />
                        ) : (
                          <img 
                            src={getDefaultAvatar(activeContact.profile?.gender)} 
                            alt="Avatar" 
                            className="w-full h-full object-cover" 
                          />
                        )}
                      </div>
                      <span className="absolute bottom-1 right-1 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full"></span>
                    </div>

                    <div className="space-y-1">
                      <h4 className="text-base font-black text-slate-900">
                        {activeContact.profile?.name || 'Matrimony Member'}
                      </h4>
                      <p className="text-slate-500 text-xs font-semibold">
                        You are connected! Say hello to start the conversation.
                      </p>
                    </div>

                    {/* Quick suggestion chips */}
                    <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                      {['Namaste! 🙏', 'Hello! Nice to connect with you. 😊', 'Hi there! 👋'].map((greeting, gIdx) => (
                        <button
                          key={gIdx}
                          type="button"
                          onClick={() => setInputText(greeting)}
                          className="px-3 py-1.5 bg-slate-100 hover:bg-[#5D34F7]/10 hover:text-[#5D34F7] text-slate-700 text-xs font-bold rounded-full transition cursor-pointer border border-slate-200/70 active:scale-95"
                        >
                          {greeting}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  messages.map((msg, index) => {
                    const isMe = msg.sender === activeContact._id ? false : true;
                    const isPrevSame = index > 0 && messages[index - 1].sender === msg.sender;
                    
                    const isGif = msg.messageType === 'gif' || (msg.mediaUrl && (msg.mediaUrl.endsWith('.gif') || msg.mediaUrl.includes('giphy.gif') || msg.text === '[GIF]'));
                    const isDoc = (msg.mediaUrl && (msg.mediaUrl.endsWith('.pdf') || msg.mediaUrl.endsWith('.doc') || msg.mediaUrl.endsWith('.docx') || msg.mediaUrl.endsWith('.txt'))) || 
                      (msg.text && (msg.text.endsWith('.pdf') || msg.text.endsWith('.doc') || msg.text.endsWith('.docx') || msg.text.endsWith('.txt')));
                    const isImage = !isGif && !isDoc && (msg.messageType === 'image' || (msg.mediaUrl && (msg.mediaUrl.startsWith('data:image') || msg.mediaUrl.match(/\.(jpeg|jpg|png|webp)/i))));
                    const isVideo = msg.messageType === 'video' || (msg.mediaUrl && (msg.mediaUrl.startsWith('data:video') || msg.mediaUrl.endsWith('.mp4')));
                    const isVoice = msg.messageType === 'sticker' || msg.text === '[Voice Message]';

                    return (
                      <div 
                        key={msg._id} 
                        className={`flex ${isMe ? 'justify-end' : 'justify-start'} ${isPrevSame ? 'mt-1' : 'mt-4'} animate-in fade-in zoom-in-95 duration-150`}
                      >
                        <div className="relative group max-w-[75%] sm:max-w-[70%]">
                          <div 
                            onDoubleClick={() => handleDoubleClickMessage(msg._id)}
                            className={`rounded-2xl text-[14.5px] leading-relaxed select-none cursor-pointer shadow-sm ${
                              isVoice ? 'bg-[#EFEFEF] text-slate-800 border' :
                              isDoc ? (isMe ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white p-2 rounded-tr-sm' : 'bg-[#EFEFEF] text-slate-900 p-2 rounded-tl-sm') :
                              isGif ? 'bg-transparent p-0' :
                              isMe 
                                ? 'bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white p-3 px-4.5 rounded-tr-sm' 
                                : 'bg-[#EFEFEF] text-slate-900 p-3 px-4.5 rounded-tl-sm'
                            }`}
                          >
                            {isGif && (
                              <div className="rounded-2xl overflow-hidden border border-slate-200/60 shadow-md max-w-[260px] sm:max-w-[280px] bg-slate-100">
                                <img 
                                  src={getPhotoUrl(msg.mediaUrl)} 
                                  alt="GIF" 
                                  className="w-full h-auto object-cover max-h-[240px] rounded-2xl" 
                                />
                              </div>
                            )}

                            {isDoc && (
                              <div className="flex items-center gap-3 p-2.5 bg-white rounded-xl border border-slate-200/80 shadow-xs max-w-[280px] text-slate-800">
                                <div className="w-10 h-10 rounded-lg bg-rose-50 text-rose-500 flex items-center justify-center shrink-0">
                                  <FontAwesomeIcon icon={faFilePdf} className="text-xl" />
                                </div>
                                <div className="flex-1 min-w-0 text-left">
                                  <p className="text-xs font-bold text-slate-800 truncate">{msg.text || 'Document'}</p>
                                  <span className="text-[10px] text-slate-400 font-semibold uppercase">Document File</span>
                                </div>
                                <a 
                                  href={getPhotoUrl(msg.mediaUrl)} 
                                  target="_blank" 
                                  rel="noopener noreferrer" 
                                  download
                                  className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-[#5D34F7] hover:text-white text-slate-600 flex items-center justify-center transition shrink-0"
                                  title="View / Download Document"
                                >
                                  <FontAwesomeIcon icon={faDownload} className="text-xs" />
                                </a>
                              </div>
                            )}

                            {isImage && (
                              <div className="rounded-lg overflow-hidden border border-slate-200/50 shadow-inner max-w-[260px] max-h-[300px]">
                                <img src={getPhotoUrl(msg.mediaUrl)} alt="Attachment" className="w-full h-full object-cover" />
                              </div>
                            )}

                            {isVideo && (
                              <div className="rounded-lg overflow-hidden border border-slate-200/50 shadow-inner max-w-[260px]">
                                <video src={getPhotoUrl(msg.mediaUrl)} controls className="w-full h-full" />
                              </div>
                            )}

                            {isVoice && (
                              <div className="flex items-center gap-3 py-1.5 px-3 min-w-[220px]">
                                <button type="button" className="text-slate-800 bg-white rounded-full w-8 h-8 flex items-center justify-center shadow-sm hover:scale-105 active:scale-95 transition cursor-pointer text-xs">
                                  ▶️
                                </button>
                                <div className="flex-1 flex items-center gap-1.5 h-6">
                                  <span className="w-1 bg-indigo-500 rounded-full h-3"></span>
                                  <span className="w-1 bg-indigo-500 rounded-full h-5"></span>
                                  <span className="w-1 bg-indigo-500 rounded-full h-4"></span>
                                  <span className="w-1 bg-indigo-500 rounded-full h-6"></span>
                                  <span className="w-1 bg-indigo-500 rounded-full h-3"></span>
                                  <span className="w-1 bg-indigo-500 rounded-full h-5"></span>
                                  <span className="w-1 bg-indigo-500 rounded-full h-4"></span>
                                </div>
                                <span className="text-[10px] text-slate-500 font-bold shrink-0">0:05</span>
                              </div>
                            )}

                            {!isImage && !isVideo && !isVoice && !isGif && !isDoc && (
                              <p className="break-words">{msg.text}</p>
                            )}
                            
                            {likedMessages[msg._id] && (
                              <span className="absolute -bottom-2 -right-1.5 bg-white border border-slate-100 shadow-md rounded-full px-1 py-0.5 text-[11px] animate-bounce select-none">
                                ❤️
                              </span>
                            )}
                          </div>
                          
                          {/* Mini Details & Ticks */}
                          <div className={`absolute top-1/2 -translate-y-1/2 text-[10px] text-slate-400 font-medium whitespace-nowrap px-2 flex items-center gap-1.5 ${
                            isMe ? 'right-full mr-2' : 'left-full ml-2'
                          }`}>
                            <span>
                              {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                            {isMe && (
                              <span className={`text-[11px] font-bold ${msg.status === 'read' ? 'text-sky-500' : 'text-slate-400'}`}>
                                {msg.status === 'read' ? '✓✓' : msg.status === 'delivered' ? '✓✓' : '✓'}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Chat Input Bar */}
              <div className="p-4 bg-white border-t border-slate-200 shrink-0 relative">
                {/* Permission error warning if there were existing messages but neither user has active plan */}
                {chatError?.isPermissionError && messages.length > 0 && (
                  <div className="mb-3 p-3 bg-amber-50/90 border border-amber-200/80 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-2.5 text-amber-900 text-xs animate-in fade-in duration-150">
                    <div className="flex items-center gap-2">
                      <FontAwesomeIcon icon={faLock} className="text-amber-600 text-xs shrink-0" />
                      <span className="font-medium">
                        Sending replies requires an active membership when neither member is on a premium plan.
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => navigate('/plans')}
                      className="px-3 py-1.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-extrabold text-xs rounded-xl shadow-xs transition active:scale-95 cursor-pointer whitespace-nowrap shrink-0 flex items-center gap-1.5"
                    >
                      <FontAwesomeIcon icon={faCrown} className="text-[10px]" />
                      <span>Upgrade Plan</span>
                    </button>
                  </div>
                )}

                {/* Emoji Picker Popover */}
                {showEmojiPicker && (
                  <div className="absolute bottom-16 left-4 bg-white border border-slate-200 rounded-2xl p-3 shadow-xl grid grid-cols-5 gap-2 z-50 animate-in fade-in zoom-in-95 duration-100">
                    {EMOJIS.map((emoji) => (
                      <button 
                        key={emoji}
                        type="button" 
                        onClick={() => {
                          setInputText(prev => prev + emoji);
                          setShowEmojiPicker(false);
                        }}
                        className="text-xl hover:scale-125 transition active:scale-90 cursor-pointer p-1"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                )}

                {/* Rich GIF Picker Drawer/Modal */}
                {showGifPicker && (
                  <div 
                    ref={gifPickerRef}
                    className="absolute bottom-16 right-2 sm:right-6 w-[320px] sm:w-[420px] max-w-[calc(100vw-1.5rem)] bg-white border border-slate-200 rounded-3xl shadow-2xl z-50 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150"
                  >
                    {/* Header & Search */}
                    <div className="p-3.5 border-b border-slate-100 bg-slate-50/70 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 bg-gradient-to-r from-[#5D34F7] to-indigo-600 text-white rounded-md text-[10px] font-black tracking-wider uppercase shadow-xs">
                            GIF
                          </span>
                          <h4 className="text-xs font-black text-slate-800 tracking-tight">Choose a GIF</h4>
                        </div>
                        <button 
                          type="button"
                          onClick={() => setShowGifPicker(false)}
                          className="w-6 h-6 rounded-full hover:bg-slate-200/80 text-slate-400 hover:text-slate-700 flex items-center justify-center text-xs transition cursor-pointer"
                        >
                          <FontAwesomeIcon icon={faTimes} />
                        </button>
                      </div>

                      {/* Search Bar */}
                      <div className="relative">
                        <input 
                          type="text"
                          placeholder="Search GIFs (e.g. love, congrats, namaste)..."
                          value={gifSearchQuery}
                          onChange={(e) => setGifSearchQuery(e.target.value)}
                          className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 pl-8 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-[#5D34F7] transition"
                        />
                        <FontAwesomeIcon icon={faSearch} className="absolute left-2.5 top-2.5 text-slate-400 text-xs" />
                      </div>

                      {/* Category Pills */}
                      <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                        {GIF_CATEGORIES.map(cat => (
                          <button
                            key={cat.id}
                            type="button"
                            onClick={() => setSelectedGifCategory(cat.id)}
                            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold whitespace-nowrap transition cursor-pointer ${
                              selectedGifCategory === cat.id 
                                ? 'bg-[#5D34F7] text-white shadow-xs' 
                                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/70'
                            }`}
                          >
                            {cat.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* GIF Grid */}
                    <div className="p-3 overflow-y-auto max-h-[300px] grid grid-cols-2 sm:grid-cols-3 gap-2 bg-slate-50/40 custom-scrollbar">
                      {filteredGifs.length === 0 ? (
                        <div className="col-span-full py-10 text-center text-xs font-bold text-slate-400">
                          No GIFs found matching "{gifSearchQuery}"
                        </div>
                      ) : (
                        filteredGifs.map(gif => (
                          <button
                            key={gif.id}
                            type="button"
                            onClick={() => handleSendGif(gif)}
                            className="group relative rounded-xl overflow-hidden aspect-video bg-slate-100 hover:ring-2 hover:ring-[#5D34F7] transition-all cursor-pointer shadow-xs hover:scale-[1.02]"
                            title={gif.title}
                          >
                            <img 
                              src={gif.url} 
                              alt={gif.title} 
                              className="w-full h-full object-cover"
                              loading="lazy" 
                            />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-1.5">
                              <span className="text-[10px] font-bold text-white truncate drop-shadow">{gif.title}</span>
                            </div>
                          </button>
                        ))
                      )}
                    </div>
                  </div>
                )}

                {/* Hidden File Upload Inputs for Cam, Docs, and Images (Strictly NO video) */}
                <input 
                  type="file" 
                  ref={cameraInputRef} 
                  onChange={(e) => {
                    if (e.target.files?.[0]) handleAttachmentUpload(e.target.files[0], 'camera');
                    e.target.value = '';
                  }} 
                  accept="image/*" 
                  capture="environment"
                  className="hidden" 
                />
                <input 
                  type="file" 
                  ref={photoInputRef} 
                  onChange={(e) => {
                    if (e.target.files?.[0]) handleAttachmentUpload(e.target.files[0], 'image');
                    e.target.value = '';
                  }} 
                  accept="image/*" 
                  className="hidden" 
                />
                <input 
                  type="file" 
                  ref={docInputRef} 
                  onChange={(e) => {
                    if (e.target.files?.[0]) handleAttachmentUpload(e.target.files[0], 'document');
                    e.target.value = '';
                  }} 
                  accept=".pdf,.doc,.docx,.txt" 
                  className="hidden" 
                />

                {!canChat ? (
                  <div className="p-4 bg-gradient-to-r from-amber-50 via-orange-50 to-amber-50 border border-amber-200/80 rounded-2xl shadow-xs text-center space-y-2.5 my-1">
                    <div className="flex items-center justify-center gap-2 text-amber-900 font-extrabold text-xs sm:text-sm">
                      <FontAwesomeIcon icon={faLock} className="text-amber-600" />
                      <span>Chat Blocked on Free Accounts</span>
                    </div>
                    <p className="text-xs text-amber-800 leading-relaxed max-w-lg mx-auto">
                      Direct messaging between two Free accounts is not allowed. To chat with this member, at least one of you must have an active Premium membership.
                    </p>
                    <div className="pt-1 flex items-center justify-center gap-3">
                      <button
                        type="button"
                        onClick={() => navigate('/plans')}
                        className="px-5 py-2 bg-gradient-to-r from-[#5D34F7] to-[#4024DB] hover:opacity-95 text-white text-xs font-black rounded-xl shadow-md transition cursor-pointer active:scale-95"
                      >
                        Upgrade to Premium
                      </button>
                      <button
                        type="button"
                        onClick={() => navigate('/membership-plans')}
                        className="px-4 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold rounded-xl transition cursor-pointer"
                      >
                        Compare Plans
                      </button>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleSendMessage} className="relative flex items-center border border-slate-200 rounded-full px-3 sm:px-4 py-2 bg-white shadow-sm focus-within:border-slate-400 transition-all">
                  
                  {isRecording ? (
                    // Recording voice message status bar
                    <div className="flex-1 flex items-center justify-between text-slate-800 px-1">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 bg-red-500 rounded-full animate-ping"></span>
                        <span className="text-sm font-bold text-slate-700">Recording Voice... {formatRecordTime(recordTime)}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <button 
                          type="button" 
                          onClick={() => setIsRecording(false)} 
                          className="px-3.5 py-1.5 text-xs text-slate-500 font-semibold hover:bg-slate-100 rounded-full transition cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button 
                          type="button" 
                          onClick={handleSendVoiceMessage}
                          className="bg-emerald-500 text-white px-4 py-1.5 rounded-full text-xs font-bold shadow-md hover:bg-emerald-600 transition cursor-pointer"
                        >
                          Send ✓
                        </button>
                      </div>
                    </div>
                  ) : (
                    // Default input field controls
                    <>
                      {/* Plus Attachment Menu Button */}
                      <div ref={attachmentMenuRef} className="relative mr-1.5">
                        <button 
                          type="button" 
                          onClick={() => {
                            setShowAttachmentMenu(prev => !prev);
                            setShowEmojiPicker(false);
                            setShowGifPicker(false);
                          }}
                          className={`w-7 h-7 rounded-full flex items-center justify-center transition cursor-pointer ${
                            showAttachmentMenu ? 'bg-[#5D34F7] text-white rotate-45' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
                          }`}
                          title="Attach Camera, Documents or Images"
                        >
                          <FontAwesomeIcon icon={faPlus} className="text-xs transition-transform duration-150" />
                        </button>

                        {/* Attachment Dropdown */}
                        {showAttachmentMenu && (
                          <div className="absolute bottom-11 left-0 bg-white border border-slate-200 rounded-2xl p-1.5 shadow-xl z-50 min-w-[170px] space-y-1 animate-in fade-in zoom-in-95 duration-100">
                            <button 
                              type="button" 
                              onClick={() => {
                                setShowAttachmentMenu(false);
                                cameraInputRef.current?.click();
                              }}
                              className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-indigo-50 hover:text-[#5D34F7] rounded-xl transition cursor-pointer text-left"
                            >
                              <span className="w-6 h-6 rounded-lg bg-indigo-100 text-[#5D34F7] flex items-center justify-center shrink-0">
                                <FontAwesomeIcon icon={faCamera} className="text-[11px]" />
                              </span>
                              <span>Camera</span>
                            </button>

                            <button 
                              type="button" 
                              onClick={() => {
                                setShowAttachmentMenu(false);
                                photoInputRef.current?.click();
                              }}
                              className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-pink-50 hover:text-pink-600 rounded-xl transition cursor-pointer text-left"
                            >
                              <span className="w-6 h-6 rounded-lg bg-pink-100 text-pink-600 flex items-center justify-center shrink-0">
                                <FontAwesomeIcon icon={faImage} className="text-[11px]" />
                              </span>
                              <span>Images</span>
                            </button>

                            <button 
                              type="button" 
                              onClick={() => {
                                setShowAttachmentMenu(false);
                                docInputRef.current?.click();
                              }}
                              className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-emerald-50 hover:text-emerald-600 rounded-xl transition cursor-pointer text-left"
                            >
                              <span className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                                <FontAwesomeIcon icon={faFileAlt} className="text-[11px]" />
                              </span>
                              <span>Documents</span>
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Emoji Picker Button */}
                      <button 
                        type="button" 
                        onClick={() => {
                          setShowEmojiPicker(!showEmojiPicker);
                          setShowGifPicker(false);
                          setShowAttachmentMenu(false);
                        }}
                        className="text-slate-500 hover:text-slate-800 mr-2 transition cursor-pointer"
                        title="Add Emoji"
                      >
                        <FontAwesomeIcon icon={faSmile} className="w-4.5 h-4.5" />
                      </button>

                      {/* Text Input */}
                      <input
                        type="text"
                        placeholder="Message..."
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        className="flex-1 bg-transparent border-none text-sm text-slate-850 placeholder-slate-400 focus:outline-none focus:ring-0 mr-2"
                      />

                      {inputText.trim() ? (
                        <button 
                          type="submit"
                          disabled={sending}
                          className="text-sky-500 font-semibold hover:text-sky-700 px-2 transition disabled:opacity-50 text-sm cursor-pointer shrink-0"
                        >
                          {sending ? <FontAwesomeIcon icon={faSpinner} spin /> : 'Send'}
                        </button>
                      ) : (
                        <div className="flex items-center gap-2.5 sm:gap-3 text-slate-600 shrink-0 mr-1">
                          {/* Dedicated GIF Button */}
                          <button 
                            type="button" 
                            onClick={() => {
                              setShowGifPicker(prev => !prev);
                              setShowEmojiPicker(false);
                              setShowAttachmentMenu(false);
                            }}
                            className={`px-2 py-0.5 rounded-md text-[11px] font-black uppercase tracking-wider transition cursor-pointer border ${
                              showGifPicker 
                                ? 'bg-[#5D34F7] text-white border-[#5D34F7] shadow-xs' 
                                : 'bg-slate-100 text-slate-700 hover:bg-[#5D34F7] hover:text-white border-slate-200'
                            }`}
                            title="Choose and send animated GIFs"
                          >
                            GIF
                          </button>

                          {/* Voice Note Button */}
                          <button 
                            type="button" 
                            onClick={() => setIsRecording(true)}
                            className="hover:text-slate-900 transition cursor-pointer"
                            title="Record voice message"
                          >
                            <FontAwesomeIcon icon={faMicrophone} className="w-4 h-4" />
                          </button>

                          {/* Quick Heart Reaction */}
                          <button 
                            type="button" 
                            onClick={() => setInputText('❤️')}
                            className="hover:text-rose-500 transition cursor-pointer text-slate-500"
                            title="Send Heart"
                          >
                            <FontAwesomeIcon icon={faHeart} className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </>
                  )}
                </form>
                )}
              </div>
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center p-6 bg-slate-50/50">
              <EmptyState
                type="messages"
                title="Select a Conversation"
                description="Choose a conversation from the left contacts list to view message history, reply, or start voice and video calls."
                badgeText="Direct Chat"
                suggestions={[
                  'Chat directly with mutual connections and interested members',
                  'Share photos, documents, and interactive greetings',
                  'Initiate high-quality audio or video calls directly in browser'
                ]}
                actionText="Discover Matches"
                onAction={() => navigate('/preference-matches')}
                secondaryActionText="View Connection Requests"
                onSecondaryAction={() => navigate('/notifications')}
              />
            </div>
          )}
        </div>

      </div>

      {/* Real Agora Calling Modal Overlay */}
      {activeCall && activeContact && (
        <div className="fixed inset-0 bg-slate-950/95 flex flex-col justify-between z-[999] text-white animate-fade-in duration-300 overflow-hidden select-none">
          {/* Top Status Header: Participant info, Duration timer, Call type - Permanently Visible */}
          <div className="fixed top-4 sm:top-6 left-1/2 -translate-x-1/2 z-[1001] max-w-lg w-[92%] sm:w-auto min-w-[280px] flex items-center justify-between gap-4 bg-slate-900/85 backdrop-blur-xl px-4 sm:px-6 py-2.5 sm:py-3 rounded-2xl border border-white/15 shadow-2xl pointer-events-auto">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white/20 bg-slate-800 shrink-0 flex items-center justify-center shadow-sm">
                {activeContact.profile?.photos?.[0] ? (
                  <img 
                    src={getPhotoUrl(activeContact.profile.photos[0], activeContact.profile.gender)} 
                    alt={activeContact.profile?.name || 'Avatar'} 
                    onError={(e) => handleImageError(e, activeContact.profile.gender)}
                    className="w-full h-full object-cover" 
                  />
                ) : (
                  <FontAwesomeIcon icon={faUser} className="text-white/60 text-sm" />
                )}
              </div>
              <div className="text-left">
                <h3 className="font-extrabold text-sm text-white tracking-tight truncate max-w-[150px] sm:max-w-[220px]">
                  {activeContact.profile?.name || 'Matrimony Member'}
                </h3>
                <p className="text-[11px] font-semibold text-emerald-400 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse inline-block shrink-0" />
                  <span>
                    {isInCall ? formatDuration(callDuration) : `${activeCall === 'video' ? 'Video' : 'Voice'} Calling...`}
                  </span>
                </p>
              </div>
            </div>

            <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-white/10 text-white/90 border border-white/15 shadow-xs shrink-0">
              {activeCall === 'video' ? 'HD Video' : 'HD Voice'}
            </span>
          </div>

          {/* Call Screen Center: Video streams or Voice Call profile display */}
          {isInCall && activeCall === 'video' ? (
            <div className="relative w-full h-full flex items-center justify-center">
              {/* Remote Video Container */}
              <div id="remote-video-container" className="w-full h-full bg-slate-900 flex items-center justify-center">
                {!remoteUserJoined && (
                  <div className="flex flex-col items-center space-y-4 px-4 text-center">
                    <div className="w-24 h-24 rounded-full overflow-hidden border border-slate-750 bg-slate-800 flex items-center justify-center shadow-lg">
                      {activeContact.profile?.photos?.[0] ? (
                        <img 
                          src={getPhotoUrl(activeContact.profile.photos[0], activeContact.profile.gender)} 
                          alt="Avatar" 
                          onError={(e) => handleImageError(e, activeContact.profile.gender)}
                          className="w-full h-full object-cover" 
                        />
                      ) : (
                        <img 
                          src={getDefaultAvatar(activeContact.profile?.gender)} 
                          alt="Avatar" 
                          className="w-full h-full object-cover" 
                        />
                      )}
                    </div>
                    <p className="text-sm font-semibold tracking-wide text-slate-300">
                      Waiting for {activeContact.profile?.name || 'member'} to connect video...
                    </p>
                  </div>
                )}
              </div>
              
              {/* Local Video Picture-in-Picture */}
              <div id="local-video-container" className="absolute top-20 sm:top-24 right-4 sm:right-6 w-28 sm:w-36 h-38 sm:h-48 bg-slate-800 rounded-2xl overflow-hidden border-2 border-white/90 shadow-2xl z-20">
                {isVideoDisabled && (
                  <div className="w-full h-full bg-slate-800 flex flex-col items-center justify-center gap-1 text-slate-400">
                    <FontAwesomeIcon icon={faVideoSlash} className="text-xl text-red-400" />
                    <span className="text-[10px] font-bold uppercase tracking-wider">Camera Off</span>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="relative flex flex-col items-center justify-center flex-1 w-full px-6 py-24">
              <div className="relative mb-6">
                <div className="absolute inset-0 bg-[#5D34F7] rounded-full animate-ping opacity-25"></div>
                <div className="absolute -inset-4 bg-sky-400 rounded-full animate-pulse opacity-20"></div>
                <div className="w-32 h-32 sm:w-36 sm:h-36 rounded-full overflow-hidden border-4 border-white/90 shadow-2xl relative z-10 bg-slate-800 flex items-center justify-center">
                  {activeContact.profile?.photos?.[0] ? (
                    <img 
                      src={getPhotoUrl(activeContact.profile.photos[0], activeContact.profile.gender)} 
                      alt="Avatar" 
                      onError={(e) => handleImageError(e, activeContact.profile.gender)}
                      className="w-full h-full object-cover" 
                    />
                  ) : (
                    <img 
                      src={getDefaultAvatar(activeContact.profile?.gender)} 
                      alt="Avatar" 
                      className="w-full h-full object-cover" 
                    />
                  )}
                </div>
              </div>
              
              <div className="text-center space-y-2">
                <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                  {activeContact.profile?.name || 'Matrimony Member'}
                </h2>
                <p className="text-emerald-400 text-sm font-bold tracking-wider uppercase flex items-center justify-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>{isInCall ? `Active Call • ${formatDuration(callDuration)}` : `${activeCall === 'video' ? 'Video' : 'Voice'} Calling...`}</span>
                </p>
              </div>
            </div>
          )}

          {/* Call Controls Dock - PERMANENTLY VISIBLE THROUGHOUT ACTIVE CALL */}
          <div 
            className="fixed bottom-6 sm:bottom-10 left-1/2 -translate-x-1/2 z-[1001] flex items-center justify-center pointer-events-auto select-none max-w-full px-4"
            style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
          >
            <div className="flex items-center gap-3 sm:gap-6 bg-slate-900/90 backdrop-blur-2xl px-5 sm:px-8 py-3.5 sm:py-4 rounded-3xl border border-white/20 shadow-2xl ring-1 ring-white/10">
              {/* Microphone Mute/Unmute */}
              <div className="flex flex-col items-center gap-1.5">
                <button 
                  type="button"
                  onClick={handleToggleMute}
                  className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl sm:rounded-3xl transition-all duration-200 flex items-center justify-center text-lg sm:text-xl cursor-pointer active:scale-95 shadow-md ${
                    isMuted 
                      ? 'bg-red-500 hover:bg-red-600 text-white ring-2 ring-red-400/50 shadow-red-500/30' 
                      : 'bg-white/12 hover:bg-white/20 text-white border border-white/15'
                  }`}
                  title={isMuted ? 'Unmute Microphone' : 'Mute Microphone'}
                  aria-label={isMuted ? 'Unmute Microphone' : 'Mute Microphone'}
                >
                  <FontAwesomeIcon icon={isMuted ? faMicrophoneSlash : faMicrophone} />
                </button>
                <span className="text-[10px] font-bold tracking-wider uppercase text-white/70">
                  {isMuted ? 'Muted' : 'Mic'}
                </span>
              </div>

              {/* Camera On/Off (only if user plan supports video calling and call is video) */}
              {activeCall === 'video' && hasVideoCallingAccess && (
                <div className="flex flex-col items-center gap-1.5">
                  <button 
                    type="button"
                    onClick={handleToggleVideo}
                    className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl sm:rounded-3xl transition-all duration-200 flex items-center justify-center text-lg sm:text-xl cursor-pointer active:scale-95 shadow-md ${
                      isVideoDisabled 
                        ? 'bg-red-500 hover:bg-red-600 text-white ring-2 ring-red-400/50 shadow-red-500/30' 
                        : 'bg-white/12 hover:bg-white/20 text-white border border-white/15'
                    }`}
                    title={isVideoDisabled ? 'Turn Camera On' : 'Turn Camera Off'}
                    aria-label={isVideoDisabled ? 'Turn Camera On' : 'Turn Camera Off'}
                  >
                    <FontAwesomeIcon icon={isVideoDisabled ? faVideoSlash : faVideo} />
                  </button>
                  <span className="text-[10px] font-bold tracking-wider uppercase text-white/70">
                    {isVideoDisabled ? 'Cam Off' : 'Camera'}
                  </span>
                </div>
              )}

              {/* Camera Switch Option (only if user plan supports video calling and call is video) */}
              {activeCall === 'video' && hasVideoCallingAccess && (
                <div className="flex flex-col items-center gap-1.5">
                  <button 
                    type="button"
                    onClick={handleSwitchCamera}
                    className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl sm:rounded-3xl transition-all duration-200 flex items-center justify-center text-lg sm:text-xl cursor-pointer active:scale-95 shadow-md bg-white/12 hover:bg-white/20 text-white border border-white/15"
                    title="Switch Camera (Flip Front/Back)"
                    aria-label="Switch Camera"
                  >
                    <FontAwesomeIcon icon={faSync} />
                  </button>
                  <span className="text-[10px] font-bold tracking-wider uppercase text-white/70">
                    Switch
                  </span>
                </div>
              )}

              {/* Speaker / Audio Output Toggle */}
              <div className="flex flex-col items-center gap-1.5">
                <button 
                  type="button"
                  onClick={handleToggleSpeaker}
                  className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl sm:rounded-3xl transition-all duration-200 flex items-center justify-center text-lg sm:text-xl cursor-pointer active:scale-95 shadow-md ${
                    isSpeakerMuted 
                      ? 'bg-red-500 hover:bg-red-600 text-white ring-2 ring-red-400/50 shadow-red-500/30' 
                      : 'bg-white/12 hover:bg-white/20 text-white border border-white/15'
                  }`}
                  title={isSpeakerMuted ? 'Unmute Speaker' : 'Mute Speaker'}
                  aria-label={isSpeakerMuted ? 'Unmute Speaker' : 'Mute Speaker'}
                >
                  <FontAwesomeIcon icon={isSpeakerMuted ? faVolumeMute : faVolumeUp} />
                </button>
                <span className="text-[10px] font-bold tracking-wider uppercase text-white/70">
                  {isSpeakerMuted ? 'Muted' : 'Speaker'}
                </span>
              </div>

              {/* End Call Button */}
              <div className="flex flex-col items-center gap-1.5">
                <button 
                  type="button"
                  onClick={handleEndCall}
                  className="w-13 h-13 sm:w-16 sm:h-16 rounded-2xl sm:rounded-3xl bg-rose-600 hover:bg-rose-700 active:scale-90 transition-all duration-200 flex items-center justify-center text-xl sm:text-2xl shadow-xl shadow-rose-600/40 border border-rose-400/30 ring-4 ring-rose-500/25 cursor-pointer text-white"
                  title="End Call"
                  aria-label="End Call"
                >
                  <FontAwesomeIcon icon={faPhoneSlash} />
                </button>
                <span className="text-[10px] font-extrabold tracking-wider uppercase text-rose-400">
                  End Call
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Incoming Call Overlay */}
      {incomingCall && (
        <div className="fixed inset-0 bg-slate-950/95 flex flex-col items-center justify-center z-[999] text-white animate-fade-in duration-300 select-none">
          <div className="relative flex flex-col items-center space-y-8 max-w-md w-full px-6">
            <div className="relative">
              <div className="absolute inset-0 bg-emerald-500 rounded-full animate-ping opacity-30"></div>
              <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-2xl relative z-10 bg-slate-800 flex items-center justify-center">
                {incomingCall.caller?.profile?.photos?.[0] ? (
                  <img 
                    src={getPhotoUrl(incomingCall.caller.profile.photos[0], incomingCall.caller.profile?.gender)} 
                    alt="Avatar" 
                    onError={(e) => handleImageError(e, incomingCall.caller.profile?.gender)}
                    className="w-full h-full object-cover" 
                  />
                ) : (
                  <FontAwesomeIcon icon={faUser} className="text-4xl text-slate-400" />
                )}
              </div>
            </div>
            
            <div className="text-center">
              <h2 className="text-2xl font-bold tracking-wide">{incomingCall.caller?.profile?.name || 'Incoming Call'}</h2>
              <p className="text-emerald-400 text-sm mt-3 animate-bounce font-medium uppercase tracking-widest">
                Incoming {incomingCall.isVideoCall ? 'Video' : 'Voice'} Call...
              </p>
            </div>

            <div className="flex items-center gap-8 mt-8 z-30">
              <button 
                type="button"
                onClick={handleDeclineCall}
                className="px-6 py-3.5 rounded-2xl bg-rose-600 hover:bg-rose-700 active:scale-95 transition-all flex items-center gap-2.5 font-bold text-sm shadow-xl shadow-rose-600/30 border border-rose-400/30 cursor-pointer"
              >
                <FontAwesomeIcon icon={faPhoneSlash} className="text-base" />
                <span>Decline</span>
              </button>
              <button 
                type="button"
                onClick={handleAcceptCall}
                className="px-6 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 transition-all flex items-center gap-2.5 font-bold text-sm shadow-xl shadow-emerald-600/30 border border-emerald-400/30 cursor-pointer"
              >
                <FontAwesomeIcon icon={faPhone} className="text-base" />
                <span>Accept</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>

      {/* Profile Detail Preview Modal */}
      {previewContact && (() => {
        const p = previewContact.profile || {};

        return (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm cursor-pointer animate-in fade-in duration-200"
            onClick={() => setPreviewContact(null)}
          >
            <div
              className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto relative shadow-2xl flex flex-col md:flex-row cursor-default custom-scrollbar animate-in zoom-in-95 duration-200"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setPreviewContact(null)}
                className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full bg-slate-900/60 hover:bg-slate-900 text-white flex items-center justify-center transition cursor-pointer font-bold text-sm"
              >
                ✕
              </button>

              <div className="w-full md:w-1/2 bg-slate-50 flex flex-col justify-between p-6 border-b md:border-b-0 md:border-r border-slate-100 min-h-[350px]">
                <div className="flex-1 flex items-center justify-center relative rounded-2xl overflow-hidden bg-slate-950 md:h-[400px]">
                  {activePreviewImage ? (
                    <img
                      src={getPhotoUrl(activePreviewImage, p.gender)}
                      alt={p.name || 'Member'}
                      onError={(e) => handleImageError(e, p.gender)}
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <img 
                      src={getDefaultAvatar(p.gender)} 
                      alt={p.name || 'Member'} 
                      className="w-full h-full object-contain opacity-90 p-8" 
                    />
                  )}
                </div>

                {p.photos && p.photos.length > 1 && (
                  <div className="flex gap-2.5 overflow-x-auto py-3.5 px-1 mt-4 custom-scrollbar">
                    {p.photos.map((photo, index) => (
                      <button
                        key={index}
                        onClick={() => setActivePreviewImage(photo)}
                        className={`w-16 h-16 rounded-xl overflow-hidden border-2 transition-all flex-shrink-0 cursor-pointer ${activePreviewImage === photo
                            ? 'border-[#5D34F7] scale-105 shadow-sm'
                            : 'border-transparent hover:border-slate-300'
                          }`}
                      >
                        <img 
                          src={getPhotoUrl(photo, p.gender)} 
                          alt="" 
                          onError={(e) => handleImageError(e, p.gender)}
                          className="w-full h-full object-cover" 
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="w-full md:w-1/2 p-8 flex flex-col justify-between h-[450px] md:h-[500px]">
                <div className="overflow-y-auto pr-2 custom-scrollbar flex-1 space-y-6">
                  <div>
                    <div className="flex justify-between items-start">
                      <h2 className="text-2xl font-black text-slate-800 tracking-tight">{p.name || 'Matrimony Member'}</h2>
                      {(() => {
                        const displayUid = previewContact.uid || previewContact._id.substring(previewContact._id.length - 8).toUpperCase();
                        const isCopied = copiedUid === displayUid;
                        return (
                          <button
                            onClick={(e) => handleCopyUid(displayUid, e)}
                            className="px-3 py-1.5 bg-[#5D34F7]/10 hover:bg-[#5D34F7]/20 text-[#5D34F7] text-[10px] font-black tracking-wider rounded-xl border border-[#5D34F7]/20 uppercase flex items-center gap-1.5 transition-all cursor-pointer active:scale-95 group/copy shrink-0"
                            title="Copy UID"
                          >
                            <span>UID: {displayUid}</span>
                            {isCopied ? (
                              <FontAwesomeIcon icon={faCheck} className="text-emerald-500 text-[10px]" />
                            ) : (
                              <FontAwesomeIcon icon={faCopy} className="opacity-70 group-hover/copy:opacity-100 text-[10px]" />
                            )}
                          </button>
                        );
                      })()}
                    </div>
                    <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                      {previewContact.online ? (
                        <span className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold px-2.5 py-0.5 rounded-full shadow-2xs">
                          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                          <span>Online</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 bg-slate-100 text-slate-600 border border-slate-200 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                          <span className="w-2 h-2 rounded-full bg-slate-400"></span>
                          <span>{previewContact.lastActiveLabel || 'Offline'}</span>
                        </span>
                      )}
                      <span className="text-slate-300">•</span>
                      <p className="text-slate-400 text-xs font-bold flex items-center gap-1">
                        <FontAwesomeIcon icon={faMapMarkerAlt} className="text-[#5D34F7]" />
                        {p.location || 'Location N/A'}
                      </p>
                    </div>

                    {(previewContact.phone || p.phone) && (
                      <div className="bg-emerald-50 rounded-2xl p-4 border border-emerald-100 flex items-center justify-between mt-3">
                        {!isPremium ? (
                          <>
                            <div className="flex-1">
                              <h4 className="text-xs font-black uppercase text-emerald-600 tracking-wider mb-1">Contact Phone</h4>
                              <p className="text-emerald-700 font-extrabold text-sm filter blur-[4px] select-none">
                                +91 9876543210
                              </p>
                            </div>
                            <button 
                              onClick={() => navigate('/plans')}
                              className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-bold px-4 py-2 rounded-xl transition shadow-md whitespace-nowrap text-xs cursor-pointer shrink-0"
                            >
                              View Number
                            </button>
                          </>
                        ) : (
                          <>
                            <div>
                              <h4 className="text-xs font-black uppercase text-emerald-600 tracking-wider mb-1">Contact Phone</h4>
                              <p 
                                onClick={() => setCallModalData({
                                  isOpen: true,
                                  phone: previewContact.phone || p.phone,
                                  name: p.name || 'Member',
                                  photo: p.photos?.[0] || null
                                })}
                                className="text-emerald-900 font-extrabold text-sm hover:underline cursor-pointer flex items-center gap-1.5"
                              >
                                📞 {previewContact.phone || p.phone}
                              </p>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              <button
                                onClick={() => setCallModalData({
                                  isOpen: true,
                                  phone: previewContact.phone || p.phone,
                                  name: p.name || 'Member',
                                  photo: p.photos?.[0] || null
                                })}
                                className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl transition cursor-pointer flex items-center gap-1.5 shadow-sm active:scale-95"
                              >
                                <FontAwesomeIcon icon={faPhone} className="text-xs" />
                                <span>Call</span>
                              </button>
                              <button
                                onClick={() => {
                                  setPreviewContact(null);
                                  if (!hasVideoCallingAccess) {
                                    navigate('/plans');
                                    return;
                                  }
                                  if (previewContact.settings?.allowVoiceAndVideoCalls === false) {
                                    alert('This member has disabled incoming calls.');
                                    return;
                                  }
                                  handleInitiateCall('video');
                                }}
                                className={`px-3 py-2 font-black text-xs rounded-xl transition flex items-center gap-1.5 shadow-sm active:scale-95 cursor-pointer ${
                                  hasVideoCallingAccess
                                    ? 'bg-[#5D34F7] hover:bg-[#4d27d9] text-white'
                                    : 'bg-slate-100 hover:bg-slate-200 text-slate-500 border border-slate-200'
                                }`}
                                title={
                                  hasVideoCallingAccess 
                                    ? "Start Video Call" 
                                    : (currentUserProfile?.premiumMembership?.isPremium 
                                        ? "Video calling is not included in your current plan (Requires Diamond or Platinum). Click to upgrade." 
                                        : "Upgrade to Video Call")
                                }
                              >
                                {!hasVideoCallingAccess ? (
                                  <>
                                    <span className="text-xs">🔒</span>
                                    <span>Video Call</span>
                                  </>
                                ) : (
                                  <>
                                    <FontAwesomeIcon icon={faVideo} className="text-xs" />
                                    <span>Video Call</span>
                                  </>
                                )}
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    )}
                  </div>

                  {p.about && (
                    <div className="space-y-2">
                      <h4 className="text-xs font-black uppercase text-slate-400 tracking-wider">About Me</h4>
                      <p className="text-slate-600 text-[13px] leading-relaxed font-medium bg-slate-50 p-4 rounded-2xl border border-slate-100/60">
                        {p.about}
                      </p>
                    </div>
                  )}

                  <div className="space-y-6">
                    <div>
                      <h4 className="text-xs font-black uppercase text-slate-400 tracking-wider mb-2">Personal Details</h4>
                      <div className="grid grid-cols-2 gap-4 text-xs font-bold text-slate-650 bg-slate-50/50 p-4 rounded-2xl border border-slate-100/50">
                        <div><span className="text-slate-400 text-[10px] block mb-0.5">AGE / HEIGHT</span>{p.age || 'N/A'} Yrs, {p.height || 'N/A'}</div>
                        <div><span className="text-slate-400 text-[10px] block mb-0.5">MARITAL STATUS</span>{p.maritalStatus || 'N/A'}</div>
                        <div><span className="text-slate-400 text-[10px] block mb-0.5">DIET</span>{p.diet || 'N/A'}</div>
                        <div><span className="text-slate-400 text-[10px] block mb-0.5">LOCATION</span>{p.location || 'N/A'}</div>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-xs font-black uppercase text-slate-400 tracking-wider mb-2">Religion & Community</h4>
                      <div className="grid grid-cols-2 gap-4 text-xs font-bold text-slate-650 bg-slate-50/50 p-4 rounded-2xl border border-slate-100/50">
                        <div><span className="text-slate-400 text-[10px] block mb-0.5">RELIGION</span>{p.religion || 'N/A'}</div>
                        <div><span className="text-slate-400 text-[10px] block mb-0.5">CASTE</span>{p.caste || 'N/A'}</div>
                        {p.subCommunity && <div className="col-span-2"><span className="text-slate-400 text-[10px] block mb-0.5">SUB-COMMUNITY</span>{p.subCommunity}</div>}
                      </div>
                    </div>

                    <div>
                      <h4 className="text-xs font-black uppercase text-slate-400 tracking-wider mb-2">Education & Career</h4>
                      <div className="grid grid-cols-2 gap-4 text-xs font-bold text-slate-650 bg-slate-50/50 p-4 rounded-2xl border border-slate-100/50">
                        <div className="col-span-2"><span className="text-slate-400 text-[10px] block mb-0.5">EDUCATION</span>{p.education || 'N/A'}</div>
                        {p.college && <div className="col-span-2"><span className="text-slate-400 text-[10px] block mb-0.5">COLLEGE</span>{p.college}</div>}
                        <div><span className="text-slate-400 text-[10px] block mb-0.5">PROFESSION</span>{p.profession || p.occupation || p.workRole || 'N/A'}</div>
                        {p.workSector && <div><span className="text-slate-400 text-[10px] block mb-0.5">WORK SECTOR</span>{p.workSector}</div>}
                        {p.companyName && <div className="col-span-2"><span className="text-slate-400 text-[10px] block mb-0.5">COMPANY NAME</span>{p.companyName}</div>}
                        <div><span className="text-slate-400 text-[10px] block mb-0.5">ANNUAL INCOME</span>{p.annualIncome || p.income || 'N/A'}</div>
                      </div>
                    </div>

                    {(p.motherStatus || p.fatherStatus || p.familyFinancialStatus || p.brothersCount !== undefined || p.sistersCount !== undefined || p.siblings !== undefined) && (
                      <div>
                        <h4 className="text-xs font-black uppercase text-slate-400 tracking-wider mb-2">Family</h4>
                        <div className="grid grid-cols-2 gap-4 text-xs font-bold text-slate-650 bg-slate-50/50 p-4 rounded-2xl border border-slate-100/50">
                          {p.fatherStatus && <div><span className="text-slate-400 text-[10px] block mb-0.5">FATHER STATUS</span>{p.fatherStatus}</div>}
                          {p.motherStatus && <div><span className="text-slate-400 text-[10px] block mb-0.5">MOTHER STATUS</span>{p.motherStatus}</div>}
                          {p.familyFinancialStatus && <div className="col-span-2"><span className="text-slate-400 text-[10px] block mb-0.5">FINANCIAL STATUS</span>{p.familyFinancialStatus}</div>}
                          <div className="col-span-2"><span className="text-slate-400 text-[10px] block mb-0.5">SIBLINGS</span>{formatSiblings(p)}</div>
                          {p.brothersCount !== undefined && <div><span className="text-slate-400 text-[10px] block mb-0.5">BROTHERS</span>{p.brothersCount}</div>}
                          {p.sistersCount !== undefined && <div><span className="text-slate-400 text-[10px] block mb-0.5">SISTERS</span>{p.sistersCount}</div>}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      <CallModal
        isOpen={callModalData.isOpen}
        onClose={() => setCallModalData(prev => ({ ...prev, isOpen: false }))}
        phone={callModalData.phone}
        name={callModalData.name}
        photo={callModalData.photo}
      />

      {/* Call History Modal */}
      <CallHistoryModal
        isOpen={showCallHistoryModal}
        onClose={() => setShowCallHistoryModal(false)}
        currentUser={currentUserProfile}
        filterUserId={callHistoryFilterUserId}
        hasVideoCallingAccess={hasVideoCallingAccess}
        onInitiateCall={(targetContact, callType) => {
          if (callType === 'video' && !hasVideoCallingAccess) {
            navigate('/plans');
            return;
          }
          const fullContact = contacts.find(c => String(c._id) === String(targetContact._id)) || targetContact;
          setActiveContact(fullContact);
          setTimeout(() => {
            if (callType === 'video') {
              handleInitiateCall('video');
            } else {
              handleInitiateCall('voice');
            }
          }, 150);
        }}
        onSelectContact={(targetContact) => {
          const existing = contacts.find(c => String(c._id) === String(targetContact._id));
          setActiveContact(existing || targetContact);
        }}
      />
    </>
  );
}
