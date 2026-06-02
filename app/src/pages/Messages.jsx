import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleNodes, faPaperPlane, faMessage } from '@fortawesome/free-solid-svg-icons';
import io from 'socket.io-client';
import { getConversations, getMessages, sendMessage, getUsersDetails } from '../redux/actions';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

const PageWrapper = styled.div`
  display: flex;
  height: calc(100vh - 64px);
  width: 100%;
  overflow: hidden;

  @media (max-width: 768px) {
    height: calc(100vh - 116px);
    flex-direction: column;
  }
`;

const ConvoList = styled.div`
  width: 300px;
  flex-shrink: 0;
  border-right: 1px solid rgba(${({ theme }) => theme.mainRgba}, 0.1);
  background: rgba(${({ theme }) => theme.bodyRgba}, 0.2);
  backdrop-filter: blur(12px);
  overflow-y: auto;
  display: flex;
  flex-direction: column;

  @media (max-width: 768px) {
    width: 100%;
    height: 200px;
    border-right: none;
    border-bottom: 1px solid rgba(${({ theme }) => theme.mainRgba}, 0.1);
    flex-direction: column;
  }
`;

const ConvoListHeader = styled.div`
  padding: 18px 16px 12px;
  font-size: 17px;
  font-weight: 700;
  color: ${({ theme }) => theme.main};
  border-bottom: 1px solid rgba(${({ theme }) => theme.mainRgba}, 0.08);
  flex-shrink: 0;
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

  &:hover {
    background: rgba(${({ theme }) => theme.mainRgba}, 0.06);
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
  opacity: 0.65;
`;

const ChatArea = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const EmptyChat = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: ${({ theme }) => theme.text};
  opacity: 0.5;
  gap: 12px;
  font-size: 15px;
`;

const ChatHeader = styled.div`
  padding: 14px 20px;
  border-bottom: 1px solid rgba(${({ theme }) => theme.mainRgba}, 0.1);
  background: rgba(${({ theme }) => theme.bodyRgba}, 0.2);
  backdrop-filter: blur(12px);
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
`;

const MessageBubble = styled(motion.div)`
  max-width: 68%;
  padding: 9px 14px;
  border-radius: ${({ $own }) => $own ? '18px 18px 4px 18px' : '18px 18px 18px 4px'};
  background: ${({ $own, theme }) =>
    $own
      ? theme.accent
      : `rgba(${theme.mainRgba}, 0.1)`};
  color: ${({ $own, theme }) => $own ? theme.body : theme.main};
  align-self: ${({ $own }) => $own ? 'flex-end' : 'flex-start'};
  font-size: 14px;
  line-height: 1.45;
  word-break: break-word;
  backdrop-filter: blur(8px);
  border: ${({ $own }) => $own ? 'none' : '1px solid rgba(0,0,0,0.06)'};
`;

const MessageTime = styled.div`
  font-size: 10px;
  opacity: 0.55;
  text-align: ${({ $own }) => $own ? 'right' : 'left'};
  margin-top: 2px;
  padding: ${({ $own }) => $own ? '0 4px 0 0' : '0 0 0 4px'};
`;

const InputArea = styled.form`
  display: flex;
  gap: 10px;
  padding: 14px 20px;
  border-top: 1px solid rgba(${({ theme }) => theme.mainRgba}, 0.1);
  background: rgba(${({ theme }) => theme.bodyRgba}, 0.2);
  backdrop-filter: blur(12px);
  flex-shrink: 0;
`;

const MessageInput = styled.input`
  flex: 1;
  padding: 10px 16px;
  border-radius: 22px;
  border: 1px solid rgba(${({ theme }) => theme.mainRgba}, 0.2);
  background: rgba(${({ theme }) => theme.bodyRgba}, 0.35);
  color: ${({ theme }) => theme.main};
  font-family: ${({ theme }) => theme.fontFamily};
  font-size: 14px;
  outline: none;
  transition: border-color 0.2s;
  &::placeholder { color: ${({ theme }) => theme.text}; opacity: 0.6; }
  &:focus { border-color: ${({ theme }) => theme.accent}; }
`;

const SendBtn = styled.button`
  background: ${({ theme }) => theme.accent};
  border: none;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: ${({ theme }) => theme.body};
  font-size: 15px;
  transition: opacity 0.2s;
  flex-shrink: 0;
  &:hover { opacity: 0.88; }
  &:disabled { opacity: 0.5; cursor: not-allowed; }
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

  const otherUser = activeConvo ? convoUsers[getOtherUserId(activeConvo)] : null;
  const isOnline = otherUser && onlineUsers.includes(otherUser._id);

  return (
    <PageWrapper>
      <ConvoList>
        <ConvoListHeader>Messages</ConvoListHeader>
        {isFetching && conversations.length === 0 ? (
          <LoadingSpinner><FontAwesomeIcon icon={faCircleNodes} spin /></LoadingSpinner>
        ) : conversations.length === 0 ? (
          <div style={{ padding: '20px', textAlign: 'center', opacity: 0.5, fontSize: '13px' }}>
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
                <div style={{ textAlign: 'center', opacity: 0.45, padding: '40px', fontSize: '14px' }}>
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
    </PageWrapper>
  );
}
