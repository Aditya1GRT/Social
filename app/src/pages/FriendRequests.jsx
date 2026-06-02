import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCircleNodes,
  faCheck,
  faTimes,
  faUserClock,
  faUserMinus,
} from '@fortawesome/free-solid-svg-icons';
import { getUsersDetails, approveFollow, rejectFollow, unsendFollowReq } from '../redux/actions';

const PageWrapper = styled.div`
  padding: 24px 20px;
  max-width: 640px;
  margin: 0 auto;
  width: 100%;

  @media (max-width: 480px) {
    padding: 16px;
  }
`;

const PageTitle = styled.h2`
  font-size: 22px;
  font-weight: 700;
  color: ${({ theme }) => theme.main};
  margin-bottom: 24px;
`;

const Section = styled.div`
  margin-bottom: 32px;
`;

const SectionTitle = styled.h3`
  font-size: 16px;
  font-weight: 700;
  color: ${({ theme }) => theme.main};
  margin-bottom: 14px;
  display: flex;
  align-items: center;
  gap: 8px;
  opacity: 0.9;
`;

const Badge = styled.span`
  background: ${({ theme }) => theme.accent};
  color: ${({ theme }) => theme.body};
  font-size: 11px;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 10px;
`;

const UserList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const UserCard = styled(motion.div)`
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px 18px;
  background: rgba(${({ theme }) => theme.bodyRgba}, 0.12);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(${({ theme }) => theme.mainRgba}, 0.15);
  border-radius: 16px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.08);
  flex-wrap: nowrap;
  min-width: 0;

  @media (max-width: 480px) {
    padding: 12px 14px;
    gap: 10px;
  }
`;

const Avatar = styled(Link)`
  display: block;
  width: 46px;
  height: 46px;
  border-radius: 50%;
  overflow: hidden;
  border: 2px solid ${({ theme }) => theme.accent};
  flex-shrink: 0;
  text-decoration: none;
`;

const AvatarImg = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const AvatarPlaceholder = styled.div`
  width: 100%;
  height: 100%;
  background: ${({ theme }) => theme.accent};
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({ theme }) => theme.body};
  font-size: 17px;
  font-weight: 700;
`;

const UserInfo = styled(Link)`
  flex: 1;
  text-decoration: none;
  overflow: hidden;
`;

const DisplayName = styled.div`
  font-size: 14px;
  font-weight: 700;
  color: ${({ theme }) => theme.main};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const Username = styled.div`
  font-size: 12px;
  color: ${({ theme }) => theme.text};
  opacity: 0.7;
`;

const Actions = styled.div`
  display: flex;
  gap: 8px;
  flex-shrink: 0;

  @media (max-width: 400px) {
    gap: 6px;
  }
`;

const Btn = styled.button`
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 7px 12px;
  min-height: 44px;
  border-radius: 16px;
  border: none;
  font-family: ${({ theme }) => theme.fontFamily};
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
  flex-shrink: 0;

  background: ${({ $variant, theme }) =>
    $variant === 'approve'
      ? theme.accentGrad
      : $variant === 'reject'
      ? 'rgba(231,76,60,0.15)'
      : 'rgba(0,0,0,0.08)'};

  box-shadow: ${({ $variant, theme }) =>
    $variant === 'approve' ? theme.btnGlow : 'none'};

  color: ${({ $variant }) =>
    $variant === 'approve'
      ? 'white'
      : $variant === 'reject'
      ? '#e74c3c'
      : 'inherit'};

  &:hover { filter: brightness(1.08); opacity: 0.95; }
  &:disabled { opacity: 0.45; cursor: not-allowed; }

  @media (max-width: 400px) {
    font-size: 12px;
    padding: 6px 9px;
  }
`;

const EmptySection = styled.div`
  padding: 24px;
  text-align: center;
  color: ${({ theme }) => theme.text};
  opacity: 0.55;
  font-size: 14px;
  background: rgba(${({ theme }) => theme.bodyRgba}, 0.2);
  border-radius: 14px;
  border: 1px dashed rgba(${({ theme }) => theme.mainRgba}, 0.15);
`;

const LoadingWrapper = styled.div`
  display: flex;
  justify-content: center;
  padding: 30px;
  color: ${({ theme }) => theme.accent};
  font-size: 24px;
`;

export default function FriendRequests() {
  const dispatch = useDispatch();
  const currentUser = useSelector(s => s.user?.currentUser);
  const isFetching = useSelector(s => s.user?.isFetching);

  const [receivedUsers, setReceivedUsers] = useState([]);
  const [sentUsers, setSentUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchUsers = async () => {
    if (!currentUser) return;
    setLoading(true);
    try {
      const [recv, sent] = await Promise.all([
        currentUser.reqRecieved?.length
          ? getUsersDetails(currentUser.reqRecieved)
          : Promise.resolve([]),
        currentUser.reqSent?.length
          ? getUsersDetails(currentUser.reqSent)
          : Promise.resolve([]),
      ]);
      setReceivedUsers(recv);
      setSentUsers(sent);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [
    currentUser?.reqRecieved?.length,
    currentUser?.reqSent?.length,
  ]);

  const handleApprove = async (requesterId) => {
    try {
      await approveFollow(dispatch, requesterId, currentUser._id);
      setReceivedUsers(prev => prev.filter(u => u._id !== requesterId));
    } catch (err) { console.error(err); }
  };

  const handleReject = async (requesterId) => {
    try {
      await rejectFollow(dispatch, requesterId, currentUser._id);
      setReceivedUsers(prev => prev.filter(u => u._id !== requesterId));
    } catch (err) { console.error(err); }
  };

  const handleCancelReq = async (targetId) => {
    try {
      await unsendFollowReq(dispatch, targetId, currentUser._id);
      setSentUsers(prev => prev.filter(u => u._id !== targetId));
    } catch (err) { console.error(err); }
  };

  if (!currentUser) return null;

  return (
    <PageWrapper>
      <PageTitle>Friend Requests</PageTitle>

      <Section>
        <SectionTitle>
          <FontAwesomeIcon icon={faUserClock} />
          Requests Received
          {receivedUsers.length > 0 && <Badge>{receivedUsers.length}</Badge>}
        </SectionTitle>

        {loading ? (
          <LoadingWrapper><FontAwesomeIcon icon={faCircleNodes} spin /></LoadingWrapper>
        ) : receivedUsers.length === 0 ? (
          <EmptySection>No pending requests.</EmptySection>
        ) : (
          <UserList>
            <AnimatePresence>
              {receivedUsers.map((user, i) => {
                const initial = (user.name || user.username || '?')[0].toUpperCase();
                return (
                  <UserCard
                    key={user._id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ delay: i * 0.04 }}
                  >
                    <Avatar to={`/user/${user.username}`}>
                      {user.profilePicture ? (
                        <AvatarImg src={user.profilePicture} alt={user.name} />
                      ) : (
                        <AvatarPlaceholder>{initial}</AvatarPlaceholder>
                      )}
                    </Avatar>
                    <UserInfo to={`/user/${user.username}`}>
                      <DisplayName>{user.name || user.username}</DisplayName>
                      <Username>@{user.username}</Username>
                    </UserInfo>
                    <Actions>
                      <Btn
                        $variant="approve"
                        onClick={() => handleApprove(user._id)}
                        disabled={isFetching}
                      >
                        <FontAwesomeIcon icon={faCheck} />
                        Accept
                      </Btn>
                      <Btn
                        $variant="reject"
                        onClick={() => handleReject(user._id)}
                        disabled={isFetching}
                      >
                        <FontAwesomeIcon icon={faTimes} />
                        Reject
                      </Btn>
                    </Actions>
                  </UserCard>
                );
              })}
            </AnimatePresence>
          </UserList>
        )}
      </Section>

      <Section>
        <SectionTitle>
          <FontAwesomeIcon icon={faUserMinus} />
          Requests Sent
          {sentUsers.length > 0 && <Badge>{sentUsers.length}</Badge>}
        </SectionTitle>

        {loading ? (
          <LoadingWrapper><FontAwesomeIcon icon={faCircleNodes} spin /></LoadingWrapper>
        ) : sentUsers.length === 0 ? (
          <EmptySection>No pending sent requests.</EmptySection>
        ) : (
          <UserList>
            <AnimatePresence>
              {sentUsers.map((user, i) => {
                const initial = (user.name || user.username || '?')[0].toUpperCase();
                return (
                  <UserCard
                    key={user._id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ delay: i * 0.04 }}
                  >
                    <Avatar to={`/user/${user.username}`}>
                      {user.profilePicture ? (
                        <AvatarImg src={user.profilePicture} alt={user.name} />
                      ) : (
                        <AvatarPlaceholder>{initial}</AvatarPlaceholder>
                      )}
                    </Avatar>
                    <UserInfo to={`/user/${user.username}`}>
                      <DisplayName>{user.name || user.username}</DisplayName>
                      <Username>@{user.username}</Username>
                    </UserInfo>
                    <Actions>
                      <Btn
                        $variant="cancel"
                        onClick={() => handleCancelReq(user._id)}
                        disabled={isFetching}
                      >
                        <FontAwesomeIcon icon={faTimes} />
                        Cancel
                      </Btn>
                    </Actions>
                  </UserCard>
                );
              })}
            </AnimatePresence>
          </UserList>
        )}
      </Section>
    </PageWrapper>
  );
}
