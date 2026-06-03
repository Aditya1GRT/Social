import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faBell,
  faHeart,
  faComment,
  faUserPlus,
  faCheckDouble,
} from '@fortawesome/free-solid-svg-icons';
import { getNotifications, markNotificationsRead } from '../redux/actions';

const PageWrapper = styled.div`
  padding: 24px 20px;
  max-width: 600px;
  margin: 0 auto;
  width: 100%;

  @media (max-width: 480px) {
    padding: 16px;
  }
`;

const ContentCard = styled.div`
  background: rgba(${({ theme }) => theme.bodyRgba}, 0.55);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  border: 1px solid rgba(${({ theme }) => theme.mainRgba}, 0.16);
  border-radius: 20px;
  padding: 16px;
  box-shadow: 0 4px 24px rgba(0,0,0,0.12);
`;

const PageTitle = styled.h2`
  font-size: 22px;
  font-weight: 700;
  color: ${({ theme }) => theme.main};
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 10px;
`;

const TitleActions = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
`;

const MarkReadBtn = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  border-radius: 10px;
  border: none;
  background: ${({ theme }) => theme.accentGrad};
  box-shadow: ${({ theme }) => theme.btnGlow};
  color: white;
  font-family: ${({ theme }) => theme.fontFamily};
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: filter 0.2s;
  white-space: nowrap;
  &:hover { filter: brightness(1.1); }
`;

const FilterRow = styled.div`
  display: flex;
  gap: 8px;
  margin-bottom: 20px;
  flex-wrap: wrap;
`;

const FilterBtn = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 7px 14px;
  border-radius: 20px;
  border: 1.5px solid ${({ $active, theme }) => $active ? theme.accent : `rgba(${theme.mainRgba}, 0.35)`};
  background: ${({ $active, theme }) => $active
    ? `rgba(${theme.mainRgba}, 0.18)`
    : `rgba(${theme.bodyRgba}, 0.35)`};
  color: ${({ $active, theme }) => $active ? theme.accent : theme.main};
  font-family: ${({ theme }) => theme.fontFamily};
  font-size: 13px;
  font-weight: ${({ $active }) => $active ? 700 : 500};
  cursor: pointer;
  transition: all 0.2s;
  &:hover { border-color: ${({ theme }) => theme.accent}; color: ${({ theme }) => theme.accent}; }
`;

const BadgeCount = styled.span`
  background: #e74c3c;
  color: white;
  font-size: 10px;
  font-weight: 700;
  border-radius: 8px;
  padding: 1px 5px;
  min-width: 16px;
  text-align: center;
`;

const NotifCard = styled(motion.div)`
  background: rgba(${({ theme }) => theme.bodyRgba}, ${({ $unread }) => $unread ? '0.55' : '0.35'});
  border: 1px solid rgba(${({ theme }) => theme.mainRgba}, ${({ $unread }) => $unread ? '0.22' : '0.12'});
  border-left: ${({ $unread, theme }) => $unread ? `3px solid ${theme.accent}` : '3px solid transparent'};
  border-radius: 16px;
  padding: 14px 16px;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  gap: 12px;
  transition: background 0.2s;
  &:hover { background: rgba(${({ theme }) => theme.bodyRgba}, 0.65); }
`;

const Avatar = styled(Link)`
  width: 44px;
  height: 44px;
  border-radius: 50%;
  overflow: hidden;
  flex-shrink: 0;
  display: block;
  border: 2px solid ${({ theme }) => theme.accent};
`;

const AvatarImg = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const AvatarPlaceholder = styled.div`
  width: 100%;
  height: 100%;
  background: ${({ theme }) => theme.accentGrad};
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 700;
  font-size: 16px;
`;

const TypeIcon = styled.div`
  position: absolute;
  bottom: -2px;
  right: -2px;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: ${({ $type }) =>
    $type === 'like' ? '#e74c3c' :
    $type === 'comment' ? '#3498db' :
    '#2ecc71'};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 8px;
  color: white;
  border: 1.5px solid white;
`;

const AvatarWrapper = styled.div`
  position: relative;
  flex-shrink: 0;
`;

const NotifContent = styled.div`
  flex: 1;
  min-width: 0;
`;

const NotifText = styled.p`
  font-size: 14px;
  color: ${({ theme }) => theme.main};
  margin: 0 0 4px;
  line-height: 1.4;

  strong { font-weight: 700; }
`;

const NotifMeta = styled.div`
  font-size: 12px;
  color: ${({ theme }) => theme.text};
  opacity: 0.6;
`;

const PostPreview = styled.div`
  font-size: 12px;
  color: ${({ theme }) => theme.text};
  opacity: 0.75;
  margin-top: 3px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 260px;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 48px 20px;
  color: ${({ theme }) => theme.main};
  font-size: 15px;
  font-weight: 500;
  opacity: 0.7;
`;

const UnreadDot = styled.div`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${({ theme }) => theme.accent};
  flex-shrink: 0;
`;

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}d ago`;
  return new Date(dateStr).toLocaleDateString();
}

const TYPE_FILTERS = [
  { key: 'all', label: 'All', icon: faBell },
  { key: 'like', label: 'Likes', icon: faHeart },
  { key: 'comment', label: 'Comments', icon: faComment },
  { key: 'follow', label: 'Follows', icon: faUserPlus },
];

export default function Notifications() {
  const dispatch = useDispatch();
  const currentUser = useSelector(s => s.user?.currentUser);
  const { items, isFetching } = useSelector(s => s.notifications);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    if (currentUser) {
      getNotifications(dispatch, currentUser._id);
    }
  }, [currentUser, dispatch]);

  useEffect(() => {
    if (currentUser && items.some(n => !n.read)) {
      const timer = setTimeout(() => {
        markNotificationsRead(dispatch, currentUser._id);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [items, currentUser, dispatch]);

  const filtered = filter === 'all' ? items : items.filter(n => n.type === filter);

  const countFor = (type) => items.filter(n => !n.read && (type === 'all' || n.type === type)).length;

  const typeLabel = (n) => {
    if (n.type === 'like') return 'liked your post';
    if (n.type === 'comment') return 'commented on your post';
    if (n.type === 'follow') return 'accepted your follow request';
    return '';
  };

  return (
    <PageWrapper>
      <TitleActions>
        <PageTitle>
          <FontAwesomeIcon icon={faBell} />
          Notifications
        </PageTitle>
        {items.some(n => !n.read) && (
          <MarkReadBtn onClick={() => markNotificationsRead(dispatch, currentUser._id)}>
            <FontAwesomeIcon icon={faCheckDouble} />
            Mark all read
          </MarkReadBtn>
        )}
      </TitleActions>

      <ContentCard>
        <FilterRow>
          {TYPE_FILTERS.map(({ key, label, icon }) => {
            const cnt = countFor(key);
            return (
              <FilterBtn key={key} $active={filter === key} onClick={() => setFilter(key)}>
                <FontAwesomeIcon icon={icon} />
                {label}
                {cnt > 0 && <BadgeCount>{cnt}</BadgeCount>}
              </FilterBtn>
            );
          })}
        </FilterRow>

        {isFetching && (
          <EmptyState>Loading...</EmptyState>
        )}

        {!isFetching && filtered.length === 0 && (
          <EmptyState>
            No {filter === 'all' ? '' : filter} notifications yet
          </EmptyState>
        )}

        <AnimatePresence>
          {filtered.map((notif, i) => (
            <NotifCard
              key={notif._id}
              $unread={!notif.read}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2, delay: i * 0.03 }}
            >
              <AvatarWrapper>
                <Avatar to={`/user/${notif.fromUsername}`}>
                  {notif.fromPicture ? (
                    <AvatarImg src={notif.fromPicture} alt={notif.fromName} />
                  ) : (
                    <AvatarPlaceholder>
                      {(notif.fromName || notif.fromUsername || '?')[0].toUpperCase()}
                    </AvatarPlaceholder>
                  )}
                </Avatar>
                <TypeIcon $type={notif.type}>
                  <FontAwesomeIcon icon={
                    notif.type === 'like' ? faHeart :
                    notif.type === 'comment' ? faComment :
                    faUserPlus
                  } />
                </TypeIcon>
              </AvatarWrapper>

              <NotifContent>
                <NotifText>
                  <strong>{notif.fromName || notif.fromUsername}</strong>{' '}
                  {typeLabel(notif)}
                </NotifText>
                {notif.comment && (
                  <PostPreview>"{notif.comment}"</PostPreview>
                )}
                {!notif.comment && notif.postDescription && (
                  <PostPreview>{notif.postDescription}</PostPreview>
                )}
                <NotifMeta>{timeAgo(notif.createdAt)}</NotifMeta>
              </NotifContent>

              {!notif.read && <UnreadDot />}
            </NotifCard>
          ))}
        </AnimatePresence>
      </ContentCard>
    </PageWrapper>
  );
}
