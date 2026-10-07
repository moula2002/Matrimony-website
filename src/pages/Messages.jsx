import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api, { getPhotoUrl } from '../api/axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faSmile, faSearch, faUser, faInfoCircle, faArrowLeft, faSpinner,
  faPhone, faVideo, faHeart, faChevronDown, faEdit, faMicrophone, faImage,
  faMapMarkerAlt, faCopy, faCheck
} from '@fortawesome/free-solid-svg-icons';
import loadingImg from '../assets/loading.png';
import CallModal from '../components/CallModal';

const EMOJIS = ['😀', '😂', '😍', '👍', '🔥', '❤️', '🎉', '🙌', '💡', '💬', '✨', '👏', '🥳', '😎', '💯'];

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
  
  const navigate = useNavigate();
  const isPremium = currentUserProfile?.premiumMembership?.isPremium || false;

  // Emoji Picker & Recording & Calling Real States
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordTime, setRecordTime] = useState(0);
  const [activeCall, setActiveCall] = useState(null); // 'voice' | 'video' | null
  const [showAppDropdown, setShowAppDropdown] = useState(false);
  const appDropdownRef = useRef(null);

  const handleCopyUid = (uid, e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(uid);
    setCopiedUid(uid);
    setTimeout(() => setCopiedUid(''), 2000);
  };

  useEffect(() => {
    function handleClickOutside(event) {
      if (appDropdownRef.current && !appDropdownRef.current.contains(event.target)) {
        setShowAppDropdown(false);
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

  useEffect(() => {
    if (window.AgoraRTC) {
      const client = window.AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' });
      setAgoraClient(client);
    }
  }, []);

  const handleEndCall = async () => {
    if (window.activeCallId) {
      try {
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
    
    setActiveCall(null);
    setIsInCall(false);
    setRemoteUserJoined(false);
    setIsMuted(false);
    setIsVideoDisabled(false);
  };

  const startAgoraSession = async (channel, token, isVideo) => {
    if (!agoraClient || !window.AgoraRTC) return;
    try {
      const APP_ID = "f528113caaf04056b2f27c6c9e3ac4ad";
      await agoraClient.join(APP_ID, channel, token, null);
      
      const audioTrack = await window.AgoraRTC.createMicrophoneAudioTrack();
      setLocalAudioTrack(audioTrack);
      
      let videoTrack = null;
      if (isVideo) {
        videoTrack = await window.AgoraRTC.createCameraVideoTrack();
        setLocalVideoTrack(videoTrack);
      }
      
      const tracksToPublish = [audioTrack, videoTrack].filter(Boolean);
      await agoraClient.publish(tracksToPublish);
      
      setIsInCall(true);
      
      if (videoTrack) {
        setTimeout(() => {
          const localContainer = document.getElementById('local-video-container');
          if (localContainer) videoTrack.play(localContainer);
        }, 500);
      }
      
      agoraClient.on('user-published', async (user, mediaType) => {
        await agoraClient.subscribe(user, mediaType);
        setRemoteUserJoined(true);
        if (mediaType === 'video') {
          setTimeout(() => {
            const remoteContainer = document.getElementById('remote-video-container');
            if (remoteContainer) user.videoTrack.play(remoteContainer);
          }, 500);
        }
        if (mediaType === 'audio') {
          user.audioTrack.play();
        }
      });
      
      agoraClient.on('user-left', () => {
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
      handleEndCall();
    }
  };

  const handleAcceptCall = async () => {
    if (!incomingCall) return;
    
    const isVideo = incomingCall.isVideoCall;
    setActiveCall(isVideo ? 'video' : 'voice');
    setIsVideoDisabled(!isVideo);
    setIncomingCall(null);
    
    try {
      await api.post('/call/respond', {
        callId: incomingCall._id,
        status: 'accepted'
      });
      window.activeCallId = incomingCall._id;
      
      const tokenRes = await api.post('/call/token', {
        channelName: incomingCall.channelName,
        uid: 0,
        role: 'publisher'
      });
      
      await startAgoraSession(incomingCall.channelName, tokenRes.data.token, isVideo);
    } catch (err) {
      console.error("Error accepting call:", err);
      handleEndCall();
    }
  };

  const handleDeclineCall = async () => {
    if (!incomingCall) return;
    try {
      await api.post('/call/respond', {
        callId: incomingCall._id,
        status: 'rejected'
      });
    } catch (err) {
      console.error("Error declining call:", err);
    }
    setIncomingCall(null);
  };

  const handleToggleMute = () => {
    if (localAudioTrack) {
      if (isMuted) {
        localAudioTrack.setEnabled(true);
      } else {
        localAudioTrack.setEnabled(false);
      }
      setIsMuted(!isMuted);
    }
  };

  const handleToggleVideo = () => {
    if (localVideoTrack) {
      if (isVideoDisabled) {
        localVideoTrack.setEnabled(true);
      } else {
        localVideoTrack.setEnabled(false);
      }
      setIsVideoDisabled(!isVideoDisabled);
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

  // Fetch current user profile
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const res = await api.get('/users/profile');
        setCurrentUserProfile(res.data);
      } catch (err) {
        console.error('Error fetching current user profile:', err);
      }
    };
    fetchCurrentUser();
  }, []);

  // Fetch accepted contacts with dynamic online/offline status
  useEffect(() => {
    const fetchContacts = async () => {
      try {
        setLoadingContacts(true);
        const res = await api.get('/users/chats');
        const data = res.data || [];
        const contactsWithStatus = data.map((c) => {
          const lastActive = c.lastActive ? new Date(c.lastActive) : null;
          let isOnline = false;
          let activeLabel = 'offline';
          if (lastActive) {
            const diffMs = Date.now() - lastActive.getTime();
            const diffMins = Math.floor(diffMs / 60000);
            if (diffMs < 180000) { // 3 minutes
              isOnline = true;
              activeLabel = 'now';
            } else if (diffMins < 60) {
              activeLabel = `${diffMins}m ago`;
            } else {
              const diffHrs = Math.floor(diffMins / 60);
              if (diffHrs < 24) {
                activeLabel = `${diffHrs}h ago`;
              } else {
                activeLabel = `${Math.floor(diffHrs / 24)}d ago`;
              }
            }
          }
          return {
            ...c,
            online: isOnline,
            lastActiveTime: activeLabel
          };
        });
        setContacts(contactsWithStatus);
        if (contactsWithStatus.length > 0) {
          setActiveContact(contactsWithStatus[0]);
        }
      } catch (err) {
        console.error('Error fetching chat contacts:', err);
      } finally {
        setLoadingContacts(false);
      }
    };
    fetchContacts();
  }, []);

  // Fetch messages when active contact changes
  useEffect(() => {
    if (!activeContact) return;
    const fetchMessages = async () => {
      try {
        setLoadingMessages(true);
        const res = await api.get(`/users/chat/${activeContact._id}`);
        setMessages(res.data || []);
      } catch (err) {
        console.error('Error fetching messages:', err);
      } finally {
        setLoadingMessages(false);
      }
    };
    fetchMessages();

    const interval = setInterval(async () => {
      try {
        const res = await api.get(`/users/chat/${activeContact._id}`);
        setMessages(res.data || []);
      } catch (err) {
        console.error('Error polling messages:', err);
      }
    }, 3000);

    return () => clearInterval(interval);
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

    } catch (err) {
      console.error('Error sending message:', err);
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
    } catch (err) {
      console.error('Error sending voice message:', err);
    } finally {
      setSending(false);
    }
  };

  // Send media file change trigger
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file || !activeContact || sending) return;

    setSending(true);
    const isVideo = file.type.startsWith('video/');

    try {
      const formData = new FormData();
      formData.append('media', file);
      const uploadRes = await api.post('/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      const mediaUrl = uploadRes.data.urls[0];
      
      const res = await api.post(`/users/chat/${activeContact._id}`, {
        text: isVideo ? '[Video Message]' : '[Image Message]',
        messageType: isVideo ? 'video' : 'image',
        mediaUrl: mediaUrl
      });
      
      const newMsg = res.data;
      setMessages((prev) => [...prev, newMsg]);
    } catch (err) {
      console.error('Error sending media message:', err);
    } finally {
      setSending(false);
    }
  };

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
                    {item.online && (
                      <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full"></span>
                    )}
                  </div>
                  <span className="text-[10px] text-slate-500 truncate w-full text-center mt-1 font-medium">{item.name}</span>
                </div>
              ))}
            </div>
          )}

          {/* Messages Header Tab (Requests Removed) */}
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
          </div>

          {/* Contacts List */}
          <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
            {loadingContacts ? (
              <div className="flex justify-center items-center py-12">
                <img src={loadingImg} className="w-10 h-10 animate-spin" alt="Loading..." />
              </div>
            ) : filteredContacts.length === 0 ? (
              <div className="text-center py-12 text-slate-400 text-sm font-semibold">
                No active conversations
              </div>
            ) : (
              filteredContacts.map((contact, idx) => {
                const isActive = activeContact?._id === contact._id;
                const p = contact.profile || {};
                const hasUnread = idx === 0 || idx === 3;
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
                          <img src={getPhotoUrl(p.photos[0])} alt="Avatar" className="w-full h-full object-cover" />
                        ) : (
                          <FontAwesomeIcon icon={faUser} className="text-slate-400 text-lg" />
                        )}
                      </div>
                      {contact.online && (
                        <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full"></span>
                      )}
                    </div>
                    <div className="text-left overflow-hidden flex-1">
                      <h4 className={`text-sm truncate leading-snug ${hasUnread ? 'font-bold text-slate-900' : 'font-semibold text-slate-800'}`}>{p.name || 'Matrimony Member'}</h4>
                      <p className={`text-xs truncate mt-0.5 ${hasUnread ? 'font-bold text-slate-900' : 'text-slate-500'}`}>
                        {hasUnread ? 'sent an attachment.' : (contact.online ? 'Active now' : `Active ${contact.lastActiveTime}`)}
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
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => setActiveContact(null)} 
                    className="md:hidden p-1.5 hover:bg-slate-100 rounded-full text-slate-700 transition mr-1"
                  >
                    <FontAwesomeIcon icon={faArrowLeft} />
                  </button>
                  <div 
                    onClick={() => { setPreviewContact(activeContact); setActivePreviewImage(activeContact.profile?.photos?.[0] || ''); }}
                    className="relative w-11 h-11 rounded-full overflow-hidden bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0 cursor-pointer hover:opacity-90 transition"
                  >
                    {activeContact.profile?.photos && activeContact.profile.photos[0] ? (
                      <img src={getPhotoUrl(activeContact.profile.photos[0])} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <FontAwesomeIcon icon={faUser} className="text-slate-400" />
                    )}
                  </div>
                  <div 
                    onClick={() => { setPreviewContact(activeContact); setActivePreviewImage(activeContact.profile?.photos?.[0] || ''); }}
                    className="cursor-pointer hover:opacity-90 transition"
                  >
                    <h3 className="font-bold text-sm text-slate-955 leading-tight">
                      {activeContact.profile?.name || 'Matrimony Member'}
                    </h3>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      {activeContact.online ? 'Active now' : `Active ${activeContact.lastActiveTime}`}
                    </p>
                  </div>
                </div>

                <div ref={appDropdownRef} className="flex items-center gap-4 text-slate-700 relative">
                  <button 
                    onClick={() => {
                      if (!isPremium) {
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
                    className="hover:text-emerald-600 hover:bg-emerald-50 text-slate-700 transition p-2 rounded-full cursor-pointer relative"
                    title={isPremium ? "Call Member" : "Upgrade to Call"}
                  >
                    {!isPremium && <span className="absolute top-0 right-0 text-[9px]">🔒</span>}
                    <FontAwesomeIcon icon={faPhone} className="w-4.5 h-4.5" />
                  </button>
                  <button 
                    onClick={() => {
                      if (!isPremium) {
                        navigate('/plans');
                        return;
                      }
                      if (activeContact.settings?.allowVoiceAndVideoCalls === false) {
                        alert('This member has disabled incoming calls.');
                        return;
                      }
                      setShowAppDropdown(prev => !prev);
                    }} 
                    className="hover:text-slate-955 transition p-2 hover:bg-slate-100 rounded-full cursor-pointer relative"
                    title={isPremium ? "Video Call" : "Upgrade for Video Call"}
                  >
                    {!isPremium && <span className="absolute top-0 right-0 text-[9px]">🔒</span>}
                    <FontAwesomeIcon icon={faVideo} className="w-4.5 h-4.5" />
                  </button>
                  <button 
                    onClick={async () => {
                      if (window.confirm("Are you sure you want to block this user?")) {
                        try {
                          await api.post(`/users/block/${activeContact._id}`);
                          alert("User blocked successfully.");
                          setActiveContact(null);
                          window.location.reload();
                        } catch (err) {
                          console.error("Error blocking user:", err);
                          alert("Failed to block user.");
                        }
                      }
                    }} 
                    className="hover:text-rose-500 transition p-2 hover:bg-rose-50 rounded-full cursor-pointer text-xs font-semibold"
                    title="Block User"
                  >
                    Block
                  </button>

                  {showAppDropdown && (
                    <div className="absolute right-0 top-12 bg-white border border-slate-200 rounded-2xl py-3.5 px-5 shadow-xl z-50 min-w-[200px] text-center border-slate-100/80 animate-in fade-in zoom-in-95 duration-100">
                      <span className="text-xs font-black text-[#5D34F7] uppercase tracking-wider block leading-relaxed">
                        Get the Familiess<br />Matrimony app
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Chat Messages */}
              <div className="flex-1 overflow-y-auto p-5 space-y-3 bg-white">
                {loadingMessages && messages.length === 0 ? (
                  <div className="flex justify-center items-center h-full">
                    <img src={loadingImg} className="w-12 h-12 animate-spin" alt="Loading..." />
                  </div>
                ) : (
                  messages.map((msg, index) => {
                    const isMe = msg.sender === activeContact._id ? false : true;
                    const isPrevSame = index > 0 && messages[index - 1].sender === msg.sender;
                    
                    const isImage = msg.messageType === 'image' || (msg.mediaUrl && msg.mediaUrl.startsWith('data:image'));
                    const isVideo = msg.messageType === 'video' || (msg.mediaUrl && msg.mediaUrl.startsWith('data:video'));
                    const isVoice = msg.messageType === 'sticker' || msg.text === '[Voice Message]';

                    return (
                      <div 
                        key={msg._id} 
                        className={`flex ${isMe ? 'justify-end' : 'justify-start'} ${isPrevSame ? 'mt-1' : 'mt-4'} animate-in fade-in zoom-in-95 duration-150`}
                      >
                        <div className="relative group max-w-[70%]">
                          <div 
                            onDoubleClick={() => handleDoubleClickMessage(msg._id)}
                            className={`rounded-2xl text-[14.5px] leading-relaxed select-none cursor-pointer shadow-sm ${
                              isVoice ? 'bg-[#EFEFEF] text-slate-800 border' :
                              isMe 
                                ? 'bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white p-3 px-4.5 rounded-tr-sm' 
                                : 'bg-[#EFEFEF] text-slate-900 p-3 px-4.5 rounded-tl-sm'
                            }`}
                          >
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

                            {!isImage && !isVideo && !isVoice && (
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
                {/* Emoji Picker Popover */}
                {showEmojiPicker && (
                  <div className="absolute bottom-16 left-4 bg-white border border-slate-200 rounded-xl p-3 shadow-xl grid grid-cols-5 gap-2 z-50 animate-in fade-in zoom-in-95 duration-100">
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

                {/* Hidden File Upload Input */}
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileChange} 
                  accept="image/*,video/*" 
                  className="hidden" 
                />

                <form onSubmit={handleSendMessage} className="relative flex items-center border border-slate-200 rounded-full px-4 py-2.5 bg-white shadow-sm focus-within:border-slate-400 transition-all">
                  
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
                      <button 
                        type="button" 
                        onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                        className="text-slate-600 hover:text-slate-900 mr-3 transition cursor-pointer"
                      >
                        <FontAwesomeIcon icon={faSmile} className="w-5 h-5" />
                      </button>
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
                        <div className="flex items-center gap-3.5 text-slate-600 shrink-0 mr-1">
                          <button 
                            type="button" 
                            onClick={() => setIsRecording(true)}
                            className="hover:text-slate-900 transition cursor-pointer"
                          >
                            <FontAwesomeIcon icon={faMicrophone} className="w-4.5 h-4.5" />
                          </button>
                          <button 
                            type="button" 
                            onClick={() => fileInputRef.current?.click()}
                            className="hover:text-slate-900 transition cursor-pointer"
                          >
                            <FontAwesomeIcon icon={faImage} className="w-4.5 h-4.5" />
                          </button>
                          <button 
                            type="button" 
                            onClick={() => setInputText('❤️')}
                            className="hover:text-slate-950 transition cursor-pointer"
                          >
                            <FontAwesomeIcon icon={faHeart} className="w-4.5 h-4.5" />
                          </button>
                        </div>
                      )}
                    </>
                  )}
                </form>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center p-6 space-y-4 bg-white">
              <div className="w-20 h-20 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400">
                <svg className="w-10 h-10" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
                </svg>
              </div>
              <h3 className="font-black text-lg text-slate-800 tracking-tight">No messages</h3>
              <p className="text-slate-450 text-xs font-semibold max-w-xs leading-relaxed">
                Select a contact from the list or send interests to start a conversation.
              </p>
            </div>
          )}
        </div>

      </div>

      {/* Real Agora Calling Modal Overlay */}
      {activeCall && activeContact && (
        <div className="fixed inset-0 bg-slate-950/95 flex flex-col items-center justify-center z-[999] text-white animate-fade-in duration-300">
          {isInCall && activeCall === 'video' ? (
            <div className="relative w-full h-full flex items-center justify-center">
              {/* Remote Video Container */}
              <div id="remote-video-container" className="w-full h-full bg-slate-900 flex items-center justify-center">
                {!remoteUserJoined && (
                  <div className="flex flex-col items-center space-y-4">
                    <div className="w-24 h-24 rounded-full overflow-hidden border border-slate-750 bg-slate-800 flex items-center justify-center">
                      {activeContact.profile?.photos?.[0] ? (
                        <img src={getPhotoUrl(activeContact.profile.photos[0])} alt="Avatar" className="w-full h-full object-cover" />
                      ) : (
                        <FontAwesomeIcon icon={faUser} className="text-3xl text-slate-500" />
                      )}
                    </div>
                    <p className="text-sm font-semibold tracking-wide text-slate-400">Waiting for {activeContact.profile?.name} to connect video...</p>
                  </div>
                )}
              </div>
              
              {/* Local Video Picture-in-Picture */}
              <div id="local-video-container" className="absolute top-6 right-6 w-32 h-44 bg-slate-800 rounded-2xl overflow-hidden border-2 border-white/90 shadow-2xl z-20">
                {isVideoDisabled && (
                  <div className="w-full h-full bg-slate-800 flex items-center justify-center">
                    <span className="text-xl">📷❌</span>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="relative flex flex-col items-center space-y-8 max-w-md w-full px-6">
              <div className="relative">
                <div className="absolute inset-0 bg-sky-500 rounded-full animate-ping opacity-30"></div>
                <div className="absolute -inset-4 bg-sky-400 rounded-full animate-pulse opacity-20"></div>
                <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-2xl relative z-10 bg-slate-800 flex items-center justify-center">
                  {activeContact.profile?.photos?.[0] ? (
                    <img src={getPhotoUrl(activeContact.profile.photos[0])} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <FontAwesomeIcon icon={faUser} className="text-4xl text-slate-400" />
                  )}
                </div>
              </div>
              
              <div className="text-center">
                <h2 className="text-2xl font-bold tracking-wide">{activeContact.profile?.name || 'Matrimony Member'}</h2>
                <p className="text-sky-400 text-sm mt-3 animate-bounce font-medium uppercase tracking-widest">
                  {isInCall ? 'In active call' : `${activeCall} calling...`}
                </p>
              </div>
            </div>
          )}

          {/* Call Controls Overlay Bar */}
          <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex items-center gap-8 z-30 bg-white/10 backdrop-blur-md px-8 py-4 rounded-full border border-white/20 shadow-2xl">
            <button 
              onClick={handleToggleMute}
              className={`w-12 h-12 rounded-full transition flex items-center justify-center text-lg cursor-pointer ${
                isMuted ? 'bg-red-500 text-white' : 'bg-slate-800 text-white hover:bg-slate-700'
              }`}
            >
              {isMuted ? '🔇' : '🎙️'}
            </button>
            <button 
              onClick={handleEndCall}
              className="w-16 h-16 rounded-full bg-red-500 hover:bg-red-600 active:scale-90 transition flex items-center justify-center text-2xl shadow-xl cursor-pointer"
            >
              🛑
            </button>
            {activeCall === 'video' && (
              <button 
                onClick={handleToggleVideo}
                className={`w-12 h-12 rounded-full transition flex items-center justify-center text-lg cursor-pointer ${
                  isVideoDisabled ? 'bg-red-500 text-white' : 'bg-slate-800 text-white hover:bg-slate-700'
                }`}
              >
                {isVideoDisabled ? '📷❌' : '📹'}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Incoming Call Overlay */}
      {incomingCall && (
        <div className="fixed inset-0 bg-slate-950/95 flex flex-col items-center justify-center z-[999] text-white animate-fade-in duration-300">
          <div className="relative flex flex-col items-center space-y-8 max-w-md w-full px-6">
            <div className="relative">
              <div className="absolute inset-0 bg-emerald-500 rounded-full animate-ping opacity-30"></div>
              <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-2xl relative z-10 bg-slate-800 flex items-center justify-center">
                {incomingCall.caller?.profile?.photos?.[0] ? (
                  <img src={getPhotoUrl(incomingCall.caller.profile.photos[0])} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <FontAwesomeIcon icon={faUser} className="text-4xl text-slate-400" />
                )}
              </div>
            </div>
            
            <div className="text-center">
              <h2 className="text-2xl font-bold tracking-wide">{incomingCall.caller?.profile?.name || 'Incoming Call'}</h2>
              <p className="text-emerald-400 text-sm mt-3 animate-bounce font-medium uppercase tracking-widest">
                Incoming `${incomingCall.isVideoCall ? 'Video' : 'Voice'}` Call...
              </p>
            </div>

            <div className="flex items-center gap-8 mt-12 z-30">
              <button 
                onClick={handleDeclineCall}
                className="w-14 h-14 rounded-full bg-red-500 hover:bg-red-600 active:scale-90 transition flex items-center justify-center text-xl shadow-xl cursor-pointer"
              >
                🛑 Decline
              </button>
              <button 
                onClick={handleAcceptCall}
                className="w-14 h-14 rounded-full bg-emerald-500 hover:bg-emerald-600 active:scale-90 transition flex items-center justify-center text-xl shadow-xl cursor-pointer"
              >
                📞 Accept
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
                      src={getPhotoUrl(activePreviewImage)}
                      alt={p.name}
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <FontAwesomeIcon icon={faUser} className="text-[#5D34F7]/20 text-7xl" />
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
                        <img src={getPhotoUrl(photo)} alt="" className="w-full h-full object-cover" />
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
                    <div className="flex items-center gap-4 mt-1">
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
                            <button
                              onClick={() => setCallModalData({
                                isOpen: true,
                                phone: previewContact.phone || p.phone,
                                name: p.name || 'Member',
                                photo: p.photos?.[0] || null
                              })}
                              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl transition cursor-pointer flex items-center gap-1.5 shadow-sm active:scale-95 shrink-0"
                            >
                              <FontAwesomeIcon icon={faPhone} className="text-xs" />
                              <span>Call</span>
                            </button>
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

                    {(p.motherStatus || p.fatherStatus || p.familyFinancialStatus) && (
                      <div>
                        <h4 className="text-xs font-black uppercase text-slate-400 tracking-wider mb-2">Family</h4>
                        <div className="grid grid-cols-2 gap-4 text-xs font-bold text-slate-650 bg-slate-50/50 p-4 rounded-2xl border border-slate-100/50">
                          {p.fatherStatus && <div><span className="text-slate-400 text-[10px] block mb-0.5">FATHER STATUS</span>{p.fatherStatus}</div>}
                          {p.motherStatus && <div><span className="text-slate-400 text-[10px] block mb-0.5">MOTHER STATUS</span>{p.motherStatus}</div>}
                          {p.familyFinancialStatus && <div className="col-span-2"><span className="text-slate-400 text-[10px] block mb-0.5">FINANCIAL STATUS</span>{p.familyFinancialStatus}</div>}
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
    </>
  );
}
