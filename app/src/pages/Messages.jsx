import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useLocation } from 'react-router-dom';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import EmojiPicker, { Theme } from 'emoji-picker-react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCircleNodes, faPaperPlane, faMessage, faPlus, faMagnifyingGlass,
  faTimes, faFaceSmile, faImage, faPhone, faVideo,
  faMicrophoneSlash, faMicrophone, faVideoSlash, faPhoneSlash,
  faPhoneVolume, faArrowLeft,
} from '@fortawesome/free-solid-svg-icons';
import appSocket from '../utils/socket';
import {
  getConversations, getMessages, sendMessage, getUsersDetails,
  newConversation, searchUsers, uploadFile,
} from '../redux/actions';
const ICE_SERVERS = [
  { urls: 'stun:stun.l.google.com:19302' },
  { urls: 'stun:stun1.l.google.com:19302' },
];

// ─── Styled components ────────────────────────────────────────────────────────

const PageWrapper = styled.div`
  display: flex;
  height: calc(100vh - 64px);
  width: 100%;
  overflow: hidden;
  @media (max-width: 768px) {
    height: calc(100vh - 116px);
    flex-direction: column;
    overflow: hidden;
  }
`;

const ConvoList = styled.div`
  width: 300px;
  flex-shrink: 0;
  border-right: 1px solid rgba(${({ theme }) => theme.mainRgba}, 0.1);
  background: rgba(${({ theme }) => theme.bodyRgba}, 0.1);
  backdrop-filter: blur(16px);
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  @media (max-width: 768px) {
    display: ${({ $hasActive }) => $hasActive ? 'none' : 'flex'};
    width: 100%;
    flex: 1;
    border-right: none;
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;
  }
`;

const ConvoListHeader = styled.div`
  padding: 18px 16px 12px;
  font-size: 17px;
  font-weight: 700;
  color: ${({ theme }) => theme.main};
  border-bottom: 1px solid rgba(${({ theme }) => theme.mainRgba}, 0.08);
  flex-shrink: 0;
  @media (max-width: 768px) { padding: 12px 16px 8px; font-size: 15px; }
`;

const ConvoItem = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  cursor: pointer;
  transition: background 0.15s;
  background: ${({ $active, theme }) => $active ? `rgba(${theme.mainRgba}, 0.08)` : 'transparent'};
  border-left: 3px solid ${({ $active, theme }) => $active ? theme.accent : 'transparent'};
  min-height: 44px;
  &:hover { background: rgba(${({ theme }) => theme.mainRgba}, 0.06); }
  @media (max-width: 768px) { padding: 8px 12px; }
`;

const ConvoAvatar = styled.div`
  width: 42px; height: 42px; border-radius: 50%;
  background: ${({ theme }) => theme.accent};
  display: flex; align-items: center; justify-content: center;
  font-size: 16px; font-weight: 700;
  color: ${({ theme }) => theme.body};
  flex-shrink: 0; overflow: hidden; position: relative;
`;

const ConvoAvatarImg = styled.img`width: 100%; height: 100%; object-fit: cover;`;

const OnlineDot = styled.div`
  position: absolute; bottom: 1px; right: 1px;
  width: 10px; height: 10px; border-radius: 50%;
  background: #2ecc71; border: 2px solid ${({ theme }) => theme.body};
`;

const ConvoName = styled.div`
  font-size: 14px; font-weight: 600; color: ${({ theme }) => theme.main};
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
`;
const ConvoUsername = styled.div`font-size: 12px; color: ${({ theme }) => theme.text}; opacity: 0.9;`;

const ChatArea = styled.div`
  flex: 1; display: flex; flex-direction: column; overflow: hidden; min-height: 0;
  @media (max-width: 768px) {
    display: ${({ $hasActive }) => $hasActive ? 'flex' : 'none'};
  }
`;

const EmptyChat = styled.div`
  flex: 1; display: flex; flex-direction: column;
  align-items: center; justify-content: center; gap: 14px;
  p {
    background: rgba(${({ theme }) => theme.bodyRgba}, 0.75);
    backdrop-filter: blur(18px); -webkit-backdrop-filter: blur(18px);
    border: 1px solid rgba(${({ theme }) => theme.mainRgba}, 0.2);
    border-radius: 30px; padding: 14px 24px;
    color: ${({ theme }) => theme.main};
    font-size: 15px; font-weight: 700; text-align: center;
    box-shadow: 0 4px 20px rgba(0,0,0,0.2); margin: 0;
  }
`;

const ChatHeader = styled.div`
  padding: 14px 20px;
  border-bottom: 1px solid rgba(${({ theme }) => theme.mainRgba}, 0.1);
  background: rgba(${({ theme }) => theme.bodyRgba}, 0.1);
  backdrop-filter: blur(16px);
  display: flex; align-items: center; gap: 12px; flex-shrink: 0;
`;

const ChatHeaderAvatar = styled.div`
  width: 38px; height: 38px; border-radius: 50%;
  background: ${({ theme }) => theme.accent};
  display: flex; align-items: center; justify-content: center;
  font-size: 14px; font-weight: 700; color: ${({ theme }) => theme.body};
  overflow: hidden; flex-shrink: 0;
`;
const ChatHeaderImg = styled.img`width: 100%; height: 100%; object-fit: cover;`;

const ChatHeaderName = styled.div`font-size: 15px; font-weight: 700; color: ${({ theme }) => theme.main};`;

const BackBtn = styled.button`
  display: none;
  @media (max-width: 768px) {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    border-radius: 50%;
    border: none;
    background: rgba(${({ theme }) => theme.mainRgba}, 0.08);
    color: ${({ theme }) => theme.main};
    font-size: 15px;
    cursor: pointer;
    flex-shrink: 0;
    transition: background 0.15s;
    &:hover { background: rgba(${({ theme }) => theme.mainRgba}, 0.15); }
  }
`;

const CallBtns = styled.div`display: flex; gap: 8px; margin-left: auto;`;

const CallBtn = styled.button`
  width: 38px; height: 38px; border-radius: 50%; border: none;
  background: ${({ $danger, theme }) => $danger ? '#e74c3c' : `rgba(${theme.mainRgba}, 0.1)`};
  color: ${({ $danger, theme }) => $danger ? 'white' : theme.accent};
  font-size: 15px; cursor: pointer; transition: all 0.2s;
  display: flex; align-items: center; justify-content: center;
  &:hover { background: ${({ $danger, theme }) => $danger ? '#c0392b' : `rgba(${theme.mainRgba}, 0.2)`}; }
`;

const MessagesContainer = styled.div`
  flex: 1; overflow-y: auto; padding: 16px 20px;
  display: flex; flex-direction: column; gap: 8px;
  -webkit-overflow-scrolling: touch;
  @media (max-width: 480px) { padding: 12px; gap: 6px; }
`;

const MessageBubble = styled(motion.div)`
  max-width: 68%;
  min-width: 52px;
  padding: ${({ $media }) => $media ? '4px' : '10px 16px'};
  border-radius: ${({ $own }) => $own ? '18px 18px 4px 18px' : '18px 18px 18px 4px'};
  background: ${({ $own, theme }) => $own ? theme.accentGrad : `rgba(${theme.bodyRgba}, 0.92)`};
  backdrop-filter: ${({ $own }) => $own ? 'none' : 'blur(16px)'};
  -webkit-backdrop-filter: ${({ $own }) => $own ? 'none' : 'blur(16px)'};
  color: ${({ $own, theme }) => $own ? 'white' : theme.main};
  align-self: ${({ $own }) => $own ? 'flex-end' : 'flex-start'};
  font-size: 16px; line-height: 1.5; font-weight: 500;
  word-break: break-word; overflow-wrap: break-word;
  overflow: hidden;
  border: ${({ $own, theme }) => $own ? 'none' : `1px solid rgba(${theme.mainRgba}, 0.15)`};
  box-shadow: ${({ $own, theme }) => $own ? theme.btnGlow : '0 2px 16px rgba(0,0,0,0.15)'};
  @media (max-width: 480px) { max-width: 82%; font-size: 15px; }
`;

const MediaImg = styled.img`
  max-width: 240px; max-height: 240px;
  width: 100%; border-radius: 14px;
  display: block; object-fit: cover;
  cursor: pointer;
  @media (max-width: 480px) { max-width: 180px; max-height: 180px; }
`;

const MediaVideo = styled.video`
  max-width: 240px; width: 100%; border-radius: 14px; display: block;
  @media (max-width: 480px) { max-width: 180px; }
`;

const BubbleCaption = styled.div`padding: 6px 12px 8px; font-size: 15px; font-weight: 500;`;

const MessageTime = styled.div`
  font-size: 12px; font-weight: 600;
  color: ${({ $own, theme }) => $own ? 'rgba(255,255,255,0.85)' : theme.main};
  background: ${({ $own, theme }) => $own ? 'transparent' : `rgba(${theme.bodyRgba}, 0.75)`};
  display: inline-block;
  padding: 2px 8px;
  border-radius: 8px;
  text-align: ${({ $own }) => $own ? 'right' : 'left'};
  margin-top: 4px;
  align-self: ${({ $own }) => $own ? 'flex-end' : 'flex-start'};
`;

const InputWrapper = styled.div`position: relative;`;

const InputArea = styled.form`
  display: flex; gap: 8px; padding: 12px 16px;
  border-top: 1px solid rgba(${({ theme }) => theme.mainRgba}, 0.1);
  background: rgba(${({ theme }) => theme.bodyRgba}, 0.1);
  backdrop-filter: blur(16px); flex-shrink: 0; align-items: center;
  @media (max-width: 480px) { padding: 10px 12px; gap: 6px; }
`;

const IconBtn = styled.button`
  width: 40px; height: 40px; border-radius: 50%; border: none;
  background: ${({ theme }) => theme.accentGrad};
  box-shadow: ${({ theme }) => theme.btnGlow};
  color: white; font-size: 16px;
  cursor: pointer; display: flex; align-items: center; justify-content: center;
  flex-shrink: 0; transition: filter 0.2s;
  &:hover { filter: brightness(1.1); }
`;

const MessageInput = styled.input`
  flex: 1; min-width: 0; padding: 10px 16px; min-height: 44px;
  border-radius: 22px; border: 1.5px solid rgba(${({ theme }) => theme.mainRgba}, 0.25);
  background: rgba(${({ theme }) => theme.bodyRgba}, 0.75);
  color: ${({ theme }) => theme.main}; font-family: ${({ theme }) => theme.fontFamily};
  font-size: 14px; font-weight: 500; outline: none; transition: border-color 0.2s;
  &::placeholder { color: ${({ theme }) => theme.text}; opacity: 0.8; }
  &:focus { border-color: ${({ theme }) => theme.accent}; background: rgba(${({ theme }) => theme.bodyRgba}, 0.9); }
`;

const SendBtn = styled.button`
  background: ${({ theme }) => theme.accentGrad};
  box-shadow: ${({ theme }) => theme.btnGlow};
  border: none; border-radius: 50%; width: 44px; height: 44px;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; color: white; font-size: 15px;
  transition: filter 0.2s, opacity 0.2s; flex-shrink: 0;
  &:hover { filter: brightness(1.1); }
  &:disabled { opacity: 0.5; cursor: not-allowed; box-shadow: none; }
`;

const EmojiPickerWrap = styled.div`
  position: absolute; bottom: calc(100% + 8px); left: 0;
  z-index: 300; border-radius: 16px; overflow: hidden;
  box-shadow: 0 8px 32px rgba(0,0,0,0.25);
`;

const NewChatBtn = styled.button`
  background: ${({ theme }) => theme.accentGrad};
  box-shadow: ${({ theme }) => theme.btnGlow};
  border: none; border-radius: 50%; width: 36px; height: 36px;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; color: white; font-size: 14px; flex-shrink: 0;
  transition: filter 0.2s;
  &:hover { filter: brightness(1.1); }
`;

const Modal = styled.div`
  position: fixed; inset: 0; z-index: 2000;
  display: flex; align-items: center; justify-content: center;
  background: rgba(0,0,0,0.5); backdrop-filter: blur(6px); padding: 20px;
`;

const ModalCard = styled(motion.div)`
  background: rgba(${({ theme }) => theme.bodyRgba}, 0.97);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(${({ theme }) => theme.mainRgba}, 0.15);
  border-radius: 20px; padding: 24px; width: 100%; max-width: 400px;
  box-shadow: 0 10px 50px rgba(0,0,0,0.25);
`;

const ModalHeader = styled.div`
  display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px;
`;

const ModalTitle = styled.h3`font-size: 17px; font-weight: 700; color: ${({ theme }) => theme.main};`;

const CloseBtn = styled.button`
  background: none; border: none; cursor: pointer;
  color: ${({ theme }) => theme.text}; font-size: 16px; opacity: 0.6;
  &:hover { opacity: 1; }
`;

const ModalSearchInput = styled.input`
  width: 100%; padding: 10px 14px; border-radius: 20px;
  border: 1px solid rgba(${({ theme }) => theme.mainRgba}, 0.2);
  background: rgba(${({ theme }) => theme.bodyRgba}, 0.4);
  color: ${({ theme }) => theme.main}; font-family: ${({ theme }) => theme.fontFamily};
  font-size: 14px; outline: none; margin-bottom: 14px;
  &::placeholder { color: ${({ theme }) => theme.text}; opacity: 0.6; }
  &:focus { border-color: ${({ theme }) => theme.accent}; }
`;

const ModalUserItem = styled.div`
  display: flex; align-items: center; gap: 12px; padding: 10px 12px;
  border-radius: 12px; cursor: pointer; transition: background 0.15s;
  &:hover { background: rgba(${({ theme }) => theme.mainRgba}, 0.08); }
`;

const ModalAvatar = styled.div`
  width: 38px; height: 38px; border-radius: 50%;
  background: ${({ theme }) => theme.accent};
  display: flex; align-items: center; justify-content: center;
  color: ${({ theme }) => theme.body}; font-weight: 700; font-size: 14px;
  flex-shrink: 0; overflow: hidden;
`;
const ModalAvatarImg = styled.img`width: 100%; height: 100%; object-fit: cover;`;
const ModalUserName = styled.div`font-size: 14px; font-weight: 600; color: ${({ theme }) => theme.main};`;
const ModalUserHandle = styled.div`font-size: 12px; color: ${({ theme }) => theme.text}; opacity: 0.7;`;

const LoadingSpinner = styled.div`
  display: flex; justify-content: center; padding: 20px;
  color: ${({ theme }) => theme.accent}; font-size: 22px;
`;

// ─── Call overlay ─────────────────────────────────────────────────────────────

const CallOverlay = styled.div`
  position: fixed; inset: 0; z-index: 3000;
  background: rgba(0,0,0,0.88);
  display: flex; flex-direction: column;
  align-items: center; justify-content: center;
`;

const RemoteVideo = styled.video`
  position: absolute; inset: 0; width: 100%; height: 100%;
  object-fit: cover; background: #111;
`;

const LocalVideo = styled.video`
  position: absolute; bottom: 90px; right: 20px;
  width: 120px; height: 160px; border-radius: 12px;
  object-fit: cover; background: #222;
  border: 2px solid rgba(255,255,255,0.3);
  z-index: 10;
  @media (max-width: 480px) { width: 90px; height: 120px; bottom: 80px; right: 12px; }
`;

const CallCard = styled.div`
  display: flex; flex-direction: column; align-items: center;
  gap: 16px; padding: 40px 32px; text-align: center;
  color: white; z-index: 10;
`;

const CallAvatar = styled.div`
  width: 96px; height: 96px; border-radius: 50%;
  background: ${({ theme }) => theme.accent};
  display: flex; align-items: center; justify-content: center;
  font-size: 36px; font-weight: 700; color: white;
  overflow: hidden; border: 3px solid rgba(255,255,255,0.3);
`;

const CallAvatarImg = styled.img`width: 100%; height: 100%; object-fit: cover;`;

const CallName = styled.div`font-size: 24px; font-weight: 700;`;
const CallStatus = styled.div`font-size: 15px; opacity: 0.75;`;

const CallControls = styled.div`
  position: absolute; bottom: 32px; left: 50%; transform: translateX(-50%);
  display: flex; gap: 16px; z-index: 10;
`;

const RoundBtn = styled.button`
  width: 58px; height: 58px; border-radius: 50%; border: none;
  background: ${({ $danger, $accent }) =>
    $danger ? '#e74c3c' :
    $accent ? 'rgba(56,255,179,0.25)' :
    'rgba(255,255,255,0.15)'};
  color: white; font-size: 20px; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  transition: background 0.2s;
  &:hover {
    background: ${({ $danger, $accent }) =>
      $danger ? '#c0392b' : $accent ? 'rgba(56,255,179,0.4)' : 'rgba(255,255,255,0.25)'};
  }
`;

const IncomingCallBtns = styled.div`display: flex; gap: 24px; margin-top: 8px;`;

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatTime(dateStr) {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function Messages() {
  const dispatch = useDispatch();
  const location = useLocation();
  const currentUser = useSelector(s => s.user?.currentUser);
  const { conversations, isFetching } = useSelector(s => s.conversation);
  const isDark = currentUser?.prefersDarkTheme ?? false;

  const convoError = useSelector(s => s.conversation?.error);

  // Chat state
  const [activeConvo, setActiveConvo] = useState(null);
  const [messages, setMessages] = useState([]);
  const [msgText, setMsgText] = useState('');
  const [sending, setSending] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [convoUsers, setConvoUsers] = useState({});
  const [loadingMsgs, setLoadingMsgs] = useState(false);
  const [arrivingMsg, setArrivingMsg] = useState(null);
  const [showNewChat, setShowNewChat] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [showEmoji, setShowEmoji] = useState(false);
  const [uploadingMedia, setUploadingMedia] = useState(false);

  // Call state
  const [callState, setCallState] = useState(null); // null | 'calling' | 'incoming' | 'connected'
  const [callType, setCallType] = useState(null);   // 'audio' | 'video'
  const [callerInfo, setCallerInfo] = useState(null);
  const [incomingOffer, setIncomingOffer] = useState(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);
  const [callWithUserId, setCallWithUserId] = useState(null);

  const socketRef = useRef(null);
  const bottomRef = useRef(null);
  const fileInputRef = useRef(null);
  const searchDebounce = useRef(null);
  const emojiPickerRef = useRef(null);
  const autoOpenDone = useRef(false);

  // WebRTC refs
  const peerConnectionRef = useRef(null);
  const localStreamRef = useRef(null);
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);

  // ── Socket setup ─────────────────────────────────────────────────────────────
  useEffect(() => {
    socketRef.current = appSocket;

    const onGetUsers   = (users) => setOnlineUsers(users.map(u => u.userId));
    const onGetMessage = (data) => setArrivingMsg(data);
    const onIncomingCall = ({ from, fromName, fromPicture, offer, callType }) => {
      setCallerInfo({ userId: from, name: fromName, picture: fromPicture });
      setIncomingOffer(offer);
      setCallType(callType);
      setCallWithUserId(from);
      setCallState('incoming');
    };
    const onCallAccepted = async ({ answer }) => {
      if (peerConnectionRef.current) {
        await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(answer));
        setCallState('connected');
      }
    };
    const onIceCandidate = async ({ candidate }) => {
      if (peerConnectionRef.current && candidate) {
        try { await peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(candidate)); }
        catch (e) {}
      }
    };
    const onCallEnded   = () => cleanupCall();
    const onCallRejected = () => cleanupCall();

    appSocket.on('getUsers',     onGetUsers);
    appSocket.on('getMessage',   onGetMessage);
    appSocket.on('incomingCall', onIncomingCall);
    appSocket.on('callAccepted', onCallAccepted);
    appSocket.on('iceCandidate', onIceCandidate);
    appSocket.on('callEnded',    onCallEnded);
    appSocket.on('callRejected', onCallRejected);

    return () => {
      appSocket.off('getUsers',     onGetUsers);
      appSocket.off('getMessage',   onGetMessage);
      appSocket.off('incomingCall', onIncomingCall);
      appSocket.off('callAccepted', onCallAccepted);
      appSocket.off('iceCandidate', onIceCandidate);
      appSocket.off('callEnded',    onCallEnded);
      appSocket.off('callRejected', onCallRejected);
      socketRef.current = null;
    };
  }, [currentUser?._id]);

  // ── Incoming message handler ──────────────────────────────────────────────────
  useEffect(() => {
    if (!arrivingMsg) return;
    if (activeConvo && arrivingMsg.senderId) {
      const otherUserId = activeConvo.members?.find(m => m !== currentUser?._id);
      if (arrivingMsg.senderId === otherUserId) {
        setMessages(prev => [...prev, {
          senderId: arrivingMsg.senderId,
          message: arrivingMsg.message,
          messageMedia: arrivingMsg.messageMedia || '',
          mediaType: arrivingMsg.mediaType || '',
          createdAt: new Date().toISOString(),
          _id: Date.now().toString(),
        }]);
      }
    }
    setArrivingMsg(null);
  }, [arrivingMsg, activeConvo, currentUser?._id]);

  // ── Load conversations ────────────────────────────────────────────────────────
  useEffect(() => {
    if (currentUser?._id) getConversations(dispatch, currentUser._id);
  }, [currentUser?._id]);

  useEffect(() => {
    if (!conversations?.length || !currentUser?._id) return;
    const ids = conversations.flatMap(c => c.members?.filter(m => m !== currentUser._id) || []);
    const uniqueIds = [...new Set(ids)];
    if (!uniqueIds.length) return;
    getUsersDetails(uniqueIds).then(users => {
      const map = {};
      users.forEach(u => { map[u._id] = u; });
      setConvoUsers(map);
    });
  }, [conversations, currentUser?._id]);

  // ── Auto-open DM when navigated from a profile ───────────────────────────────
  useEffect(() => {
    const dmUser = location.state?.dmUser;
    if (!dmUser || autoOpenDone.current || isFetching || !currentUser?._id) return;
    autoOpenDone.current = true;
    const existing = conversations.find(c =>
      c.members?.includes(dmUser._id) && c.members?.includes(currentUser._id)
    );
    if (existing) {
      setActiveConvo(existing);
    } else {
      newConversation(dispatch, currentUser._id, dmUser._id).then(convo => {
        setActiveConvo(convo);
        setConvoUsers(prev => ({ ...prev, [dmUser._id]: dmUser }));
      }).catch(() => {});
    }
  }, [conversations, isFetching]);

  useEffect(() => {
    if (!activeConvo?._id) return;
    setLoadingMsgs(true);
    getMessages(activeConvo._id).then(data => setMessages(data || [])).finally(() => setLoadingMsgs(false));
  }, [activeConvo?._id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // ── Close emoji picker on outside click ──────────────────────────────────────
  useEffect(() => {
    const handler = (e) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(e.target)) {
        setShowEmoji(false);
      }
    };
    if (showEmoji) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showEmoji]);

  // ── Helpers ──────────────────────────────────────────────────────────────────
  const getOtherUserId = useCallback((convo) => {
    return convo?.members?.find(m => m !== currentUser?._id);
  }, [currentUser?._id]);

  // ── Send text message ─────────────────────────────────────────────────────────
  const handleSend = async (e) => {
    e.preventDefault();
    const text = msgText.trim();
    if (!text || !activeConvo || sending) return;
    setSending(true);
    setShowEmoji(false);
    const otherUserId = getOtherUserId(activeConvo);
    try {
      const newMsg = { conversationId: activeConvo._id, senderId: currentUser._id, message: text };
      const saved = await sendMessage(newMsg);
      setMessages(prev => [...prev, saved]);
      setMsgText('');
      if (socketRef.current && otherUserId) {
        socketRef.current.emit('sendMessage', { senderId: currentUser._id, reciverId: otherUserId, message: text });
      }
    } catch (err) { console.error(err); }
    finally { setSending(false); }
  };

  // ── Send media ────────────────────────────────────────────────────────────────
  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !activeConvo) return;
    e.target.value = '';
    const isVideo = file.type.startsWith('video/');
    const isImage = file.type.startsWith('image/');
    if (!isVideo && !isImage) return;
    setUploadingMedia(true);
    const otherUserId = getOtherUserId(activeConvo);
    try {
      const url = await uploadFile(file);
      const mediaType = isVideo ? 'video' : 'image';
      const newMsg = {
        conversationId: activeConvo._id,
        senderId: currentUser._id,
        message: '',
        messageMedia: url,
        mediaType,
      };
      const saved = await sendMessage(newMsg);
      setMessages(prev => [...prev, saved]);
      if (socketRef.current && otherUserId) {
        socketRef.current.emit('sendMessage', {
          senderId: currentUser._id, reciverId: otherUserId,
          message: '', messageMedia: url, mediaType,
        });
      }
    } catch (err) { console.error(err); }
    finally { setUploadingMedia(false); }
  };

  // ── New chat search ───────────────────────────────────────────────────────────
  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearchQuery(val);
    clearTimeout(searchDebounce.current);
    if (!val.trim()) { setSearchResults([]); return; }
    searchDebounce.current = setTimeout(async () => {
      setSearching(true);
      try {
        const data = await searchUsers(val.trim());
        setSearchResults((Array.isArray(data) ? data : []).filter(u => u._id !== currentUser?._id));
      } catch { setSearchResults([]); }
      finally { setSearching(false); }
    }, 350);
  };

  const handleStartChat = async (user) => {
    try {
      const existing = conversations.find(c =>
        c.members?.includes(user._id) && c.members?.includes(currentUser._id)
      );
      if (existing) {
        setActiveConvo(existing);
      } else {
        const convo = await newConversation(dispatch, currentUser._id, user._id);
        setActiveConvo(convo);
        setConvoUsers(prev => ({ ...prev, [user._id]: user }));
      }
      setShowNewChat(false); setSearchQuery(''); setSearchResults([]);
    } catch (err) { console.error(err); }
  };

  // ── WebRTC call helpers ───────────────────────────────────────────────────────
  const createPeerConnection = useCallback((remoteUserId) => {
    const pc = new RTCPeerConnection({ iceServers: ICE_SERVERS });

    pc.onicecandidate = (e) => {
      if (e.candidate && socketRef.current) {
        socketRef.current.emit('iceCandidate', { to: remoteUserId, candidate: e.candidate });
      }
    };

    pc.ontrack = (e) => {
      if (remoteVideoRef.current && e.streams[0]) {
        remoteVideoRef.current.srcObject = e.streams[0];
      }
    };

    return pc;
  }, []);

  const getLocalMedia = async (video) => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video });
    localStreamRef.current = stream;
    if (localVideoRef.current) localVideoRef.current.srcObject = stream;
    return stream;
  };

  const cleanupCall = useCallback(() => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(t => t.stop());
      localStreamRef.current = null;
    }
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }
    if (localVideoRef.current) localVideoRef.current.srcObject = null;
    if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;
    setCallState(null); setCallType(null); setCallerInfo(null);
    setIncomingOffer(null); setCallWithUserId(null);
    setIsMuted(false); setIsCameraOff(false);
  }, []);

  const handleStartCall = async (type) => {
    const otherUserId = getOtherUserId(activeConvo);
    if (!otherUserId) return;
    try {
      const stream = await getLocalMedia(type === 'video');
      const pc = createPeerConnection(otherUserId);
      peerConnectionRef.current = pc;
      stream.getTracks().forEach(track => pc.addTrack(track, stream));
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      const callUser = convoUsers[otherUserId];
      setCallType(type);
      setCallWithUserId(otherUserId);
      setCallState('calling');
      setCallerInfo({ name: callUser?.name || callUser?.username, picture: callUser?.profilePicture });
      socketRef.current?.emit('callUser', {
        to: otherUserId,
        from: currentUser._id,
        fromName: currentUser.name || currentUser.username,
        fromPicture: currentUser.profilePicture || '',
        offer,
        callType: type,
      });
    } catch (err) {
      console.error('Call error:', err);
      alert('Could not access camera/microphone. Please check permissions.');
      cleanupCall();
    }
  };

  const handleAcceptCall = async () => {
    try {
      const stream = await getLocalMedia(callType === 'video');
      const pc = createPeerConnection(callerInfo.userId);
      peerConnectionRef.current = pc;
      stream.getTracks().forEach(track => pc.addTrack(track, stream));
      await pc.setRemoteDescription(new RTCSessionDescription(incomingOffer));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      setCallState('connected');
      socketRef.current?.emit('answerCall', { to: callerInfo.userId, answer });
    } catch (err) {
      console.error('Accept call error:', err);
      alert('Could not access camera/microphone.');
      cleanupCall();
    }
  };

  const handleRejectCall = () => {
    socketRef.current?.emit('rejectCall', { to: callerInfo?.userId });
    cleanupCall();
  };

  const handleEndCall = () => {
    socketRef.current?.emit('endCall', { to: callWithUserId });
    cleanupCall();
  };

  const handleMute = () => {
    if (!localStreamRef.current) return;
    localStreamRef.current.getAudioTracks().forEach(t => { t.enabled = isMuted; });
    setIsMuted(v => !v);
  };

  const handleToggleCamera = () => {
    if (!localStreamRef.current) return;
    localStreamRef.current.getVideoTracks().forEach(t => { t.enabled = isCameraOff; });
    setIsCameraOff(v => !v);
  };

  const otherUser = activeConvo ? convoUsers[getOtherUserId(activeConvo)] : null;
  const isOnline = otherUser && onlineUsers.includes(otherUser?._id);
  const callDisplayUser = callState === 'incoming' ? callerInfo : { name: otherUser?.name || otherUser?.username, picture: otherUser?.profilePicture };

  return (
    <PageWrapper>
      {/* ── Conversation list ── */}
      <ConvoList $hasActive={!!activeConvo}>
        <ConvoListHeader style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          Messages
          <NewChatBtn onClick={() => setShowNewChat(true)} title="New conversation">
            <FontAwesomeIcon icon={faPlus} />
          </NewChatBtn>
        </ConvoListHeader>
        {isFetching && conversations.length === 0 ? (
          <LoadingSpinner><FontAwesomeIcon icon={faCircleNodes} spin /></LoadingSpinner>
        ) : convoError && conversations.length === 0 ? (
          <div style={{ padding: '20px', textAlign: 'center', fontSize: '13px', fontWeight: 600, color: '#e74c3c' }}>
            Failed to load. Please refresh.
          </div>
        ) : conversations.length === 0 ? (
          <div style={{ padding: '20px', textAlign: 'center', fontSize: '13px', fontWeight: 600, color: 'inherit' }}>
            No conversations yet.
          </div>
        ) : (
          conversations.map(convo => {
            const otherId = getOtherUserId(convo);
            const other = convoUsers[otherId];
            const initial = (other?.name || other?.username || '?')[0].toUpperCase();
            return (
              <ConvoItem key={convo._id} $active={activeConvo?._id === convo._id} onClick={() => setActiveConvo(convo)}>
                <ConvoAvatar>
                  {other?.profilePicture ? <ConvoAvatarImg src={other.profilePicture} alt={other.name} /> : initial}
                  {onlineUsers.includes(otherId) && <OnlineDot />}
                </ConvoAvatar>
                <div style={{ overflow: 'hidden' }}>
                  <ConvoName>{other?.name || other?.username || 'User'}</ConvoName>
                  {other?.username && <ConvoUsername>@{other.username}</ConvoUsername>}
                </div>
              </ConvoItem>
            );
          })
        )}
      </ConvoList>

      {/* ── Chat area ── */}
      <ChatArea $hasActive={!!activeConvo}>
        {!activeConvo ? (
          <EmptyChat>
            <FontAwesomeIcon icon={faMessage} size="3x" style={{ opacity: 0.3 }} />
            <p>Select a conversation to start chatting</p>
          </EmptyChat>
        ) : (
          <>
            <ChatHeader>
              <BackBtn onClick={() => setActiveConvo(null)} title="Back">
                <FontAwesomeIcon icon={faArrowLeft} />
              </BackBtn>
              <ChatHeaderAvatar>
                {otherUser?.profilePicture
                  ? <ChatHeaderImg src={otherUser.profilePicture} alt={otherUser.name} />
                  : (otherUser?.name || otherUser?.username || '?')[0].toUpperCase()
                }
              </ChatHeaderAvatar>
              <div>
                <ChatHeaderName>{otherUser?.name || otherUser?.username || 'User'}</ChatHeaderName>
                {isOnline && <span style={{ fontSize: '11px', color: '#2ecc71' }}>● Online</span>}
              </div>
              <CallBtns>
                <CallBtn onClick={() => handleStartCall('audio')} title="Voice call">
                  <FontAwesomeIcon icon={faPhone} />
                </CallBtn>
                <CallBtn onClick={() => handleStartCall('video')} title="Video call">
                  <FontAwesomeIcon icon={faVideo} />
                </CallBtn>
              </CallBtns>
            </ChatHeader>

            <MessagesContainer>
              {loadingMsgs ? (
                <LoadingSpinner><FontAwesomeIcon icon={faCircleNodes} spin /></LoadingSpinner>
              ) : messages.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px', fontSize: '14px', fontWeight: 600, color: 'inherit', textShadow: '0 1px 6px rgba(0,0,0,0.25)' }}>
                  No messages yet. Say hello!
                </div>
              ) : (
                messages.map((msg, i) => {
                  const isOwn = msg.senderId === currentUser?._id;
                  const hasMedia = !!msg.messageMedia;
                  return (
                    <div key={msg._id || i} style={{ display: 'flex', flexDirection: 'column' }}>
                      <MessageBubble
                        $own={isOwn} $media={hasMedia}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.15 }}
                      >
                        {hasMedia && msg.mediaType === 'image' && (
                          <MediaImg src={msg.messageMedia} alt="image"
                            onClick={() => window.open(msg.messageMedia, '_blank')} />
                        )}
                        {hasMedia && msg.mediaType === 'video' && (
                          <MediaVideo src={msg.messageMedia} controls playsInline />
                        )}
                        {msg.message && (
                          hasMedia
                            ? <BubbleCaption>{msg.message}</BubbleCaption>
                            : <span>{msg.message}</span>
                        )}
                      </MessageBubble>
                      <MessageTime $own={isOwn}>{formatTime(msg.createdAt)}</MessageTime>
                    </div>
                  );
                })
              )}
              <div ref={bottomRef} />
            </MessagesContainer>

            <InputWrapper>
              {showEmoji && (
                <EmojiPickerWrap ref={emojiPickerRef}>
                  <EmojiPicker
                    theme={isDark ? Theme.DARK : Theme.LIGHT}
                    onEmojiClick={(emojiData) => {
                      setMsgText(prev => prev + emojiData.emoji);
                    }}
                    height={340} width={320}
                    searchDisabled={false}
                    skinTonesDisabled
                    previewConfig={{ showPreview: false }}
                  />
                </EmojiPickerWrap>
              )}
              <InputArea onSubmit={handleSend}>
                <IconBtn type="button" onClick={() => setShowEmoji(v => !v)} title="Emoji">
                  <FontAwesomeIcon icon={faFaceSmile} />
                </IconBtn>
                <IconBtn type="button" onClick={() => fileInputRef.current?.click()} title="Send photo/video" disabled={uploadingMedia}>
                  {uploadingMedia
                    ? <FontAwesomeIcon icon={faCircleNodes} spin />
                    : <FontAwesomeIcon icon={faImage} />
                  }
                </IconBtn>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,video/*"
                  style={{ display: 'none' }}
                  onChange={handleFileChange}
                />
                <MessageInput
                  type="text"
                  placeholder="Type a message..."
                  value={msgText}
                  onChange={e => setMsgText(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) handleSend(e); }}
                />
                <SendBtn type="submit" disabled={sending || !msgText.trim()}>
                  {sending ? <FontAwesomeIcon icon={faCircleNodes} spin /> : <FontAwesomeIcon icon={faPaperPlane} />}
                </SendBtn>
              </InputArea>
            </InputWrapper>
          </>
        )}
      </ChatArea>

      {/* ── New chat modal ── */}
      {showNewChat && (
        <Modal onClick={e => { if (e.target === e.currentTarget) { setShowNewChat(false); setSearchQuery(''); setSearchResults([]); } }}>
          <ModalCard initial={{ opacity: 0, scale: 0.93 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.18 }}>
            <ModalHeader>
              <ModalTitle>New Message</ModalTitle>
              <CloseBtn onClick={() => { setShowNewChat(false); setSearchQuery(''); setSearchResults([]); }}>
                <FontAwesomeIcon icon={faTimes} />
              </CloseBtn>
            </ModalHeader>
            <ModalSearchInput autoFocus placeholder="Search users..." value={searchQuery} onChange={handleSearchChange} />
            {searching && <LoadingSpinner><FontAwesomeIcon icon={faCircleNodes} spin /></LoadingSpinner>}
            {!searching && searchResults.map(user => (
              <ModalUserItem key={user._id} onClick={() => handleStartChat(user)}>
                <ModalAvatar>
                  {user.profilePicture ? <ModalAvatarImg src={user.profilePicture} alt={user.name} /> : (user.name || user.username || '?')[0].toUpperCase()}
                </ModalAvatar>
                <div>
                  <ModalUserName>{user.name || user.username}</ModalUserName>
                  <ModalUserHandle>@{user.username}</ModalUserHandle>
                </div>
              </ModalUserItem>
            ))}
            {!searching && searchQuery && searchResults.length === 0 && (
              <div style={{ textAlign: 'center', opacity: 0.8, padding: '16px', fontSize: '13px', color: 'inherit' }}>No users found</div>
            )}
            {!searchQuery && (
              <div style={{ textAlign: 'center', opacity: 0.75, padding: '16px', fontSize: '13px', color: 'inherit' }}>
                <FontAwesomeIcon icon={faMagnifyingGlass} style={{ marginRight: 6 }} />
                Type a name or username to search
              </div>
            )}
          </ModalCard>
        </Modal>
      )}

      {/* ── Incoming call overlay ── */}
      {callState === 'incoming' && (
        <CallOverlay>
          <CallCard>
            <CallAvatar>
              {callerInfo?.picture
                ? <CallAvatarImg src={callerInfo.picture} alt={callerInfo.name} />
                : (callerInfo?.name || '?')[0].toUpperCase()
              }
            </CallAvatar>
            <CallName>{callerInfo?.name}</CallName>
            <CallStatus>Incoming {callType === 'video' ? 'video' : 'voice'} call...</CallStatus>
            <IncomingCallBtns>
              <RoundBtn $danger onClick={handleRejectCall} title="Decline">
                <FontAwesomeIcon icon={faPhoneSlash} />
              </RoundBtn>
              <RoundBtn $accent onClick={handleAcceptCall} title="Accept">
                <FontAwesomeIcon icon={callType === 'video' ? faVideo : faPhone} />
              </RoundBtn>
            </IncomingCallBtns>
          </CallCard>
        </CallOverlay>
      )}

      {/* ── Active call overlay ── */}
      {(callState === 'calling' || callState === 'connected') && (
        <CallOverlay>
          {callType === 'video' ? (
            <>
              <RemoteVideo ref={remoteVideoRef} autoPlay playsInline />
              <LocalVideo ref={localVideoRef} autoPlay muted playsInline />
            </>
          ) : (
            <CallCard>
              <CallAvatar>
                {callDisplayUser?.picture
                  ? <CallAvatarImg src={callDisplayUser.picture} alt={callDisplayUser.name} />
                  : (callDisplayUser?.name || '?')[0].toUpperCase()
                }
              </CallAvatar>
              <CallName>{callDisplayUser?.name}</CallName>
            </CallCard>
          )}
          <CallStatus style={{ position: 'absolute', top: 40, left: '50%', transform: 'translateX(-50%)', color: 'white', zIndex: 10 }}>
            {callState === 'calling' ? 'Calling...' : '● Connected'}
          </CallStatus>
          <CallControls>
            <RoundBtn onClick={handleMute} title={isMuted ? 'Unmute' : 'Mute'}>
              <FontAwesomeIcon icon={isMuted ? faMicrophoneSlash : faMicrophone} />
            </RoundBtn>
            {callType === 'video' && (
              <RoundBtn onClick={handleToggleCamera} title={isCameraOff ? 'Turn on camera' : 'Turn off camera'}>
                <FontAwesomeIcon icon={isCameraOff ? faVideoSlash : faVideo} />
              </RoundBtn>
            )}
            <RoundBtn $danger onClick={handleEndCall} title="End call">
              <FontAwesomeIcon icon={faPhoneSlash} />
            </RoundBtn>
          </CallControls>
          {callType === 'audio' && <FontAwesomeIcon icon={faPhoneVolume} style={{ position: 'absolute', bottom: 108, left: '50%', transform: 'translateX(-50%)', color: 'rgba(255,255,255,0.4)', fontSize: 48, zIndex: 5 }} />}
        </CallOverlay>
      )}
    </PageWrapper>
  );
}
