import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleNodes, faPaperPlane, faMessage, faPlus, faMagnifyingGlass, faTimes } from '@fortawesome/free-solid-svg-icons';
import io from 'socket.io-client';
import { getConversations, getMessages, sendMessage, getUsersDetails, newConversation, searchUsers } from '../redux/actions';

// undefined → Socket.io connects to the current page origin (correct in production).
// In local dev the Vite proxy forwards /socket.io to localhost:5000.
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || undefined;

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
    width: 100%;
    max-height: 180px;
    min-height: 80px;
    flex-shrink: 0;
    border-right: none;
    border-bottom: 1px solid rgba(${({ theme }) => theme.mainRgba}, 0.1);
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

  @media (max-width: 768px) {
    padding: 12px 16px 8px;
    font-size: 15px;
  }
`;

const ConvoItem = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  cursor: pointer;
  transition: background 0.15s;
  background: ${({ $active, theme }) =>
    $active ? `rgba(${theme.mainRgba}, 0.08)` : 'transparent'};
  border-left: 3px solid ${({ $active, theme }) =>
    $active ? theme.accent : 'transparent'};
  min-height: 44px;

  &:hover {
    background: rgba(${({ theme }) => theme.mainRgba}, 0.06);
  }

  @media (max-width: 768px) {
    padding: 8px 12px;
  }
`;

const ConvoAvatar = styled.div`
  width: 42px;
  height: 42px;
  border-radius: 50%;
  background: ${({ theme }) => theme.accent};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  font-weight: 700;
  color: ${({ theme }) => theme.body};
  flex-shrink: 0;
  overflow: hidden;
  position: relative;
`;

const ConvoAvatarImg = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const OnlineDot = styled.div`
  position: absolute;
  bottom: 1px;
  right: 1px;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #2ecc71;
  border: 2px solid ${({ theme }) => theme.body};
`;

const ConvoName = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: ${({ theme }) => theme.main};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const ConvoUsername = styled.div`
  font-size: 12px;
  color: ${({ theme }) => theme.text};
  opacity: 0.9;
`;

const ChatArea = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  min-height: 0;
`;

const EmptyChat = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: ${({ theme }) => theme.main};
  gap: 12px;
  font-size: 15px;
  font-weight: 600;
  text-shadow: 0 1px 6px rgba(0,0,0,0.3);
`;

const ChatHeader = styled.div`
  padding: 14px 20px;
  border-bottom: 1px solid rgba(${({ theme }) => theme.mainRgba}, 0.1);
  background: rgba(${({ theme }) => theme.bodyRgba}, 0.1);
  backdrop-filter: blur(16px);
  display: flex;
  align-items: center;
  gap: 12px;
  flex-shrink: 0;
`;

const ChatHeaderAvatar = styled.div`
  width: 38px;
  height: 38px;
  border-radius: 50%;
  background: ${({ theme }) => theme.accent};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 700;
  color: ${({ theme }) => theme.body};
  overflow: hidden;
`;

const ChatHeaderImg = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const ChatHeaderName = styled.div`
  font-size: 15px;
  font-weight: 700;
  color: ${({ theme }) => theme.main};
`;

const MessagesContainer = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 16px 20px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  -webkit-overflow-scrolling: touch;

  @media (max-width: 480px) {
    padding: 12px;
    gap: 6px;
  }
`;

const MessageBubble = styled(motion.div)`
  max-width: 68%;
  padding: 9px 14px;
  border-radius: ${({ $own }) => $own ? '18px 18px 4px 18px' : '18px 18px 18px 4px'};
  background: ${({ $own, theme }) =>
    $own
      ? theme.accentGrad
      : `rgba(${theme.mainRgba}, 0.1)`};
  color: ${({ $own, theme }) => $own ? 'white' : theme.main};
  align-self: ${({ $own }) => $own ? 'flex-end' : 'flex-start'};
  font-size: 14px;
  line-height: 1.45;
  word-break: break-word;
  overflow-wrap: break-word;
  backdrop-filter: blur(8px);
  border: ${({ $own }) => $own ? 'none' : '1px solid rgba(0,0,0,0.06)'};

  @media (max-width: 480px) {
    max-width: 82%;
    font-size: 13px;
    padding: 8px 12px;
  }
`;

const MessageTime = styled.div`
  font-size: 10px;
  opacity: 0.75;
  text-align: ${({ $own }) => $own ? 'right' : 'left'};
  margin-top: 2px;
  padding: ${({ $own }) => $own ? '0 4px 0 0' : '0 0 0 4px'};
`;

const InputArea = styled.form`
  display: flex;
  gap: 10px;
  padding: 14px 20px;
  border-top: 1px solid rgba(${({ theme }) => theme.mainRgba}, 0.1);
  background: rgba(${({ theme }) => theme.bodyRgba}, 0.1);
  backdrop-filter: blur(16px);
  flex-shrink: 0;

  @media (max-width: 480px) {
    padding: 10px 12px;
    gap: 8px;
  }
`;

const MessageInput = styled.input`
  flex: 1;
  min-width: 0;
  padding: 10px 16px;
  min-height: 44px;
  border-radius: 22px;
  border: 1px solid rgba(${({ theme }) => theme.mainRgba}, 0.2);
  background: rgba(${({ theme }) => theme.bodyRgba}, 0.2);
  color: ${({ theme }) => theme.main};
  font-family: ${({ theme }) => theme.fontFamily};
  font-size: 14px;
  outline: none;
  transition: border-color 0.2s;
  &::placeholder { color: ${({ theme }) => theme.text}; opacity: 0.6; }
  &:focus { border-color: ${({ theme }) => theme.accent}; }
`;

const SendBtn = styled.button`
  background: ${({ theme }) => theme.accentGrad};
  box-shadow: ${({ theme }) => theme.btnGlow};
  border: none;
  border-radius: 50%;
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: white;
  font-size: 15px;
  transition: filter 0.2s, opacity 0.2s;
  flex-shrink: 0;
  &:hover { filter: brightness(1.1); }
  &:disabled { opacity: 0.5; cursor: not-allowed; box-shadow: none; }
`;

const NewChatBtn = styled.button`
  background: ${({ theme }) => theme.accentGrad};
  box-shadow: ${({ theme }) => theme.btnGlow};
  border: none;
  border-radius: 50%;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: white;
  font-size: 14px;
  flex-shrink: 0;
  transition: filter 0.2s;
  &:hover { filter: brightness(1.1); }
`;

const Modal = styled.div`
  position: fixed;
  inset: 0;
  z-index: 2000;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0,0,0,0.5);
  backdrop-filter: blur(6px);
  padding: 20px;
`;

const ModalCard = styled(motion.div)`
  background: rgba(${({ theme }) => theme.bodyRgba}, 0.97);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(${({ theme }) => theme.mainRgba}, 0.15);
  border-radius: 20px;
  padding: 24px;
  width: 100%;
  max-width: 400px;
  box-shadow: 0 10px 50px rgba(0,0,0,0.25);
`;

const ModalHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
`;

const ModalTitle = styled.h3`
  font-size: 17px;
  font-weight: 700;
  color: ${({ theme }) => theme.main};
`;

const CloseBtn = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  color: ${({ theme }) => theme.text};
  font-size: 16px;
  opacity: 0.6;
  &:hover { opacity: 1; }
`;

const ModalSearchInput = styled.input`
  width: 100%;
  padding: 10px 14px;
  border-radius: 20px;
  border: 1px solid rgba(${({ theme }) => theme.mainRgba}, 0.2);
  background: rgba(${({ theme }) => theme.bodyRgba}, 0.4);
  color: ${({ theme }) => theme.main};
  font-family: ${({ theme }) => theme.fontFamily};
  font-size: 14px;
  outline: none;
  margin-bottom: 14px;
  &::placeholder { color: ${({ theme }) => theme.text}; opacity: 0.6; }
  &:focus { border-color: ${({ theme }) => theme.accent}; }
`;

const ModalUserItem = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  border-radius: 12px;
  cursor: pointer;
  transition: background 0.15s;
  &:hover { background: rgba(${({ theme }) => theme.mainRgba}, 0.08); }
`;

const ModalAvatar = styled.div`
  width: 38px;
  height: 38px;
  border-radius: 50%;
  background: ${({ theme }) => theme.accent};
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({ theme }) => theme.body};
  font-weight: 700;
  font-size: 14px;
  flex-shrink: 0;
  overflow: hidden;
`;

const ModalAvatarImg = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const ModalUserName = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: ${({ theme }) => theme.main};
`;

const ModalUserHandle = styled.div`
  font-size: 12px;
  color: ${({ theme }) => theme.text};
  opacity: 0.7;
`;

const LoadingSpinner = styled.div`
  display: flex;
  justify-content: center;
  padding: 20px;
  color: ${({ theme }) => theme.accent};
  font-size: 22px;
`;

function formatTime(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export default function Messages() {
  const dispatch = useDispatch();
  const currentUser = useSelector(s => s.user?.currentUser);
  const { conversations, isFetching } = useSelector(s => s.conversation);

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
  const searchDebounce = useRef(null);

  const socketRef = useRef(null);
  const bottomRef = useRef(null);

  // Connect socket
  useEffect(() => {
    const socket = io(SOCKET_URL, { transports: ['websocket', 'polling'] });
    socketRef.current = socket;

    socket.on('connect', () => {
      if (currentUser?._id) {
        socket.emit('addUser', currentUser._id);
      }
    });

    socket.on('getUsers', (users) => {
      setOnlineUsers(users.map(u => u.userId));
    });

    socket.on('getMessage', (data) => {
      setArrivingMsg(data);
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [currentUser?._id]);

  // Handle incoming messages
  useEffect(() => {
    if (!arrivingMsg) return;
    if (activeConvo && arrivingMsg.senderId) {
      const otherUserId = activeConvo.members?.find(m => m !== currentUser?._id);
      if (arrivingMsg.senderId === otherUserId) {
        setMessages(prev => [...prev, {
          senderId: arrivingMsg.senderId,
          message: arrivingMsg.message,
          createdAt: new Date().toISOString(),
          _id: Date.now().toString(),
        }]);
      }
    }
    setArrivingMsg(null);
  }, [arrivingMsg, activeConvo, currentUser?._id]);

  // Load conversations
  useEffect(() => {
    if (currentUser?._id) {
      getConversations(dispatch, currentUser._id);
    }
  }, [currentUser?._id]);

  // Fetch user details for conversations
  useEffect(() => {
    if (!conversations?.length || !currentUser?._id) return;
    const ids = conversations.flatMap(c =>
      c.members?.filter(m => m !== currentUser._id) || []
    );
    const uniqueIds = [...new Set(ids)];
    if (!uniqueIds.length) return;
    getUsersDetails(uniqueIds).then(users => {
      const map = {};
      users.forEach(u => { map[u._id] = u; });
      setConvoUsers(map);
    });
  }, [conversations, currentUser?._id]);

  // Load messages for active conversation
  useEffect(() => {
    if (!activeConvo?._id) return;
    setLoadingMsgs(true);
    getMessages(activeConvo._id).then(data => {
      setMessages(data || []);
    }).finally(() => setLoadingMsgs(false));
  }, [activeConvo?._id]);

  // Auto-scroll to bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const getOtherUserId = useCallback((convo) => {
    return convo?.members?.find(m => m !== currentUser?._id);
  }, [currentUser?._id]);

  const handleSend = async (e) => {
    e.preventDefault();
    const text = msgText.trim();
    if (!text || !activeConvo || sending) return;
    setSending(true);
    const otherUserId = getOtherUserId(activeConvo);
    try {
      const newMsg = {
        conversationId: activeConvo._id,
        senderId: currentUser._id,
        message: text,
      };
      const saved = await sendMessage(newMsg);
      setMessages(prev => [...prev, saved]);
      setMsgText('');
      // Emit via socket
      if (socketRef.current && otherUserId) {
        socketRef.current.emit('sendMessage', {
          senderId: currentUser._id,
          reciverId: otherUserId,
          message: text,
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSending(false);
    }
  };

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
      setShowNewChat(false);
      setSearchQuery('');
      setSearchResults([]);
    } catch (err) { console.error(err); }
  };

  const otherUser = activeConvo ? convoUsers[getOtherUserId(activeConvo)] : null;
  const isOnline = otherUser && onlineUsers.includes(otherUser._id);

  return (
    <PageWrapper>
      <ConvoList>
        <ConvoListHeader style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          Messages
          <NewChatBtn onClick={() => setShowNewChat(true)} title="New conversation">
            <FontAwesomeIcon icon={faPlus} />
          </NewChatBtn>
        </ConvoListHeader>
        {isFetching && conversations.length === 0 ? (
          <LoadingSpinner><FontAwesomeIcon icon={faCircleNodes} spin /></LoadingSpinner>
        ) : conversations.length === 0 ? (
          <div style={{ padding: '20px', textAlign: 'center', fontSize: '13px', fontWeight: 600, color: 'inherit', textShadow: '0 1px 4px rgba(0,0,0,0.2)' }}>
            No conversations yet.
          </div>
        ) : (
          conversations.map(convo => {
            const otherId = getOtherUserId(convo);
            const other = convoUsers[otherId];
            const initial = (other?.name || other?.username || '?')[0].toUpperCase();
            const isUserOnline = onlineUsers.includes(otherId);

            return (
              <ConvoItem
                key={convo._id}
                $active={activeConvo?._id === convo._id}
                onClick={() => setActiveConvo(convo)}
              >
                <ConvoAvatar>
                  {other?.profilePicture ? (
                    <ConvoAvatarImg src={other.profilePicture} alt={other.name} />
                  ) : (
                    initial
                  )}
                  {isUserOnline && <OnlineDot />}
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

      <ChatArea>
        {!activeConvo ? (
          <EmptyChat>
            <FontAwesomeIcon icon={faMessage} size="3x" style={{ opacity: 0.3 }} />
            <p>Select a conversation to start chatting</p>
          </EmptyChat>
        ) : (
          <>
            <ChatHeader>
              <ChatHeaderAvatar>
                {otherUser?.profilePicture ? (
                  <ChatHeaderImg src={otherUser.profilePicture} alt={otherUser.name} />
                ) : (
                  (otherUser?.name || otherUser?.username || '?')[0].toUpperCase()
                )}
              </ChatHeaderAvatar>
              <div>
                <ChatHeaderName>
                  {otherUser?.name || otherUser?.username || 'User'}
                </ChatHeaderName>
                {isOnline && (
                  <span style={{ fontSize: '11px', color: '#2ecc71' }}>● Online</span>
                )}
              </div>
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
                  return (
                    <div key={msg._id || i} style={{ display: 'flex', flexDirection: 'column' }}>
                      <MessageBubble
                        $own={isOwn}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.15 }}
                      >
                        {msg.message}
                      </MessageBubble>
                      <MessageTime $own={isOwn}>
                        {formatTime(msg.createdAt)}
                      </MessageTime>
                    </div>
                  );
                })
              )}
              <div ref={bottomRef} />
            </MessagesContainer>

            <InputArea onSubmit={handleSend}>
              <MessageInput
                type="text"
                placeholder="Type a message..."
                value={msgText}
                onChange={e => setMsgText(e.target.value)}
              />
              <SendBtn type="submit" disabled={sending || !msgText.trim()}>
                {sending ? (
                  <FontAwesomeIcon icon={faCircleNodes} spin />
                ) : (
                  <FontAwesomeIcon icon={faPaperPlane} />
                )}
              </SendBtn>
            </InputArea>
          </>
        )}
      </ChatArea>
      {showNewChat && (
        <Modal onClick={e => { if (e.target === e.currentTarget) { setShowNewChat(false); setSearchQuery(''); setSearchResults([]); } }}>
          <ModalCard initial={{ opacity: 0, scale: 0.93 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.18 }}>
            <ModalHeader>
              <ModalTitle>New Message</ModalTitle>
              <CloseBtn onClick={() => { setShowNewChat(false); setSearchQuery(''); setSearchResults([]); }}>
                <FontAwesomeIcon icon={faTimes} />
              </CloseBtn>
            </ModalHeader>
            <ModalSearchInput
              autoFocus
              placeholder="Search users..."
              value={searchQuery}
              onChange={handleSearchChange}
            />
            {searching && (
              <LoadingSpinner><FontAwesomeIcon icon={faCircleNodes} spin /></LoadingSpinner>
            )}
            {!searching && searchResults.map(user => (
              <ModalUserItem key={user._id} onClick={() => handleStartChat(user)}>
                <ModalAvatar>
                  {user.profilePicture
                    ? <ModalAvatarImg src={user.profilePicture} alt={user.name} />
                    : (user.name || user.username || '?')[0].toUpperCase()
                  }
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
    </PageWrapper>
  );
}
