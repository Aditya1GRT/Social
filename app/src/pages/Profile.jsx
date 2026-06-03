import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCircleNodes,
  faUserPlus,
  faUserMinus,
  faUserClock,
  faEdit,
  faUsers,
  faImage,
  faTimes,
  faMessage,
} from '@fortawesome/free-solid-svg-icons';
import {
  getUserProfile,
  getUserPosts,
  follow,
  unsendFollowReq,
  unfollow,
  getFollowers,
  getFollowing,
} from '../redux/actions';
import Post from '../components/Post';

const PageWrapper = styled.div`
  padding: 24px 20px;
  max-width: 800px;
  margin: 0 auto;
  width: 100%;

  @media (max-width: 480px) {
    padding: 16px;
  }
`;

const ProfileCard = styled(motion.div)`
  background: rgba(${({ theme }) => theme.bodyRgba}, 0.14);
  backdrop-filter: blur(22px);
  -webkit-backdrop-filter: blur(22px);
  border: 1px solid rgba(${({ theme }) => theme.mainRgba}, 0.18);
  border-radius: 24px;
  padding: 30px;
  margin-bottom: 24px;
  box-shadow: 0 4px 24px rgba(0,0,0,0.1);

  @media (max-width: 480px) {
    padding: 18px;
    border-radius: 18px;
  }
`;

const ProfileHeader = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 20px;
  flex-wrap: wrap;

  @media (max-width: 480px) {
    gap: 14px;
  }
`;

const Avatar = styled.div`
  width: 100px;
  height: 100px;
  border-radius: 50%;
  overflow: hidden;
  border: 3px solid ${({ theme }) => theme.accent};
  flex-shrink: 0;

  @media (max-width: 480px) {
    width: 80px;
    height: 80px;
  }
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
  font-size: 36px;
  font-weight: 700;
`;

const ProfileInfo = styled.div`
  flex: 1;
  min-width: 160px;

  @media (max-width: 480px) {
    min-width: 0;
    width: 100%;
  }
`;

const DisplayName = styled.h2`
  font-size: 22px;
  font-weight: 700;
  color: ${({ theme }) => theme.main};
  margin-bottom: 2px;
  word-break: break-word;

  @media (max-width: 480px) {
    font-size: 19px;
  }
`;

const Username = styled.p`
  font-size: 14px;
  color: ${({ theme }) => theme.text};
  opacity: 0.9;
  margin-bottom: 10px;
`;

const Bio = styled.p`
  font-size: 14px;
  color: ${({ theme }) => theme.text};
  line-height: 1.5;
  margin-bottom: 14px;
  white-space: pre-wrap;
`;

const Stats = styled.div`
  display: flex;
  gap: 20px;
  flex-wrap: wrap;

  @media (max-width: 480px) {
    gap: 14px;
  }
`;

const StatItem = styled.button`
  text-align: center;
  background: none;
  border: none;
  cursor: ${({ $clickable }) => $clickable ? 'pointer' : 'default'};
  padding: 6px 10px;
  border-radius: 10px;
  transition: background 0.15s;
  font-family: ${({ theme }) => theme.fontFamily};
  &:hover {
    background: ${({ $clickable, theme }) => $clickable ? `rgba(${theme.mainRgba}, 0.08)` : 'none'};
  }
`;

const StatNum = styled.div`
  font-size: 18px;
  font-weight: 700;
  color: ${({ theme }) => theme.main};
`;

const StatLabel = styled.div`
  font-size: 12px;
  color: ${({ theme }) => theme.text};
  opacity: 0.9;
`;

// ── Followers / Following modal ───────────────────────────────────────────────

const ModalOverlay = styled(motion.div)`
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
  background: rgba(${({ theme }) => theme.bodyRgba}, 0.92);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  border: 1px solid rgba(${({ theme }) => theme.mainRgba}, 0.18);
  border-radius: 24px;
  width: 100%;
  max-width: 420px;
  max-height: 70vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 12px 48px rgba(0,0,0,0.25);
`;

const ModalHeader = styled.div`
  display: flex;
  align-items: center;
  padding: 0 8px 0 4px;
  border-bottom: 1px solid rgba(${({ theme }) => theme.mainRgba}, 0.1);
  flex-shrink: 0;
`;

const TabBtn = styled.button`
  flex: 1;
  padding: 16px 8px;
  background: none;
  border: none;
  border-bottom: 2px solid ${({ $active, theme }) => $active ? theme.accent : 'transparent'};
  color: ${({ $active, theme }) => $active ? theme.accent : theme.text};
  font-family: ${({ theme }) => theme.fontFamily};
  font-size: 14px;
  font-weight: ${({ $active }) => $active ? 700 : 500};
  cursor: pointer;
  transition: all 0.2s;
  margin-bottom: -1px;
  &:hover { color: ${({ theme }) => theme.accent}; }
`;

const ModalClose = styled.button`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: none;
  background: rgba(${({ theme }) => theme.mainRgba}, 0.08);
  color: ${({ theme }) => theme.text};
  font-size: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: background 0.15s;
  &:hover { background: rgba(${({ theme }) => theme.mainRgba}, 0.15); }
`;

const ModalList = styled.div`
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  flex: 1;
`;

const UserRow = styled(Link)`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 20px;
  text-decoration: none;
  transition: background 0.15s;
  &:hover { background: rgba(${({ theme }) => theme.mainRgba}, 0.06); }
`;

const UserAvatar = styled.div`
  width: 44px;
  height: 44px;
  border-radius: 50%;
  overflow: hidden;
  flex-shrink: 0;
  background: ${({ theme }) => theme.accent};
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 700;
  font-size: 17px;
  border: 2px solid ${({ theme }) => theme.accent};
`;

const UserAvatarImg = styled.img`width: 100%; height: 100%; object-fit: cover;`;

const UserName = styled.div`
  font-size: 14px;
  font-weight: 700;
  color: ${({ theme }) => theme.main};
`;

const UserHandle = styled.div`
  font-size: 12px;
  color: ${({ theme }) => theme.text};
  opacity: 0.7;
`;

const EmptyList = styled.div`
  text-align: center;
  padding: 40px 20px;
  color: ${({ theme }) => theme.text};
  opacity: 0.55;
  font-size: 14px;
`;

const ActionRow = styled.div`
  display: flex;
  gap: 10px;
  margin-top: 16px;
  flex-wrap: wrap;
`;

const ActionBtn = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 9px 20px;
  min-height: 44px;
  border-radius: 20px;
  border: ${({ $primary }) => $primary ? 'none' : '1px solid rgba(255,255,255,0.2)'};
  background: ${({ $primary, theme }) =>
    $primary ? theme.accentGrad : 'rgba(255,255,255,0.12)'};
  box-shadow: ${({ $primary, theme }) => $primary ? theme.btnGlow : 'none'};
  color: ${({ $primary }) => ($primary ? 'white' : 'inherit')};
  font-family: ${({ theme }) => theme.fontFamily};
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  transition: filter 0.2s, opacity 0.2s;
  backdrop-filter: blur(8px);

  &:hover { filter: ${({ $primary }) => $primary ? 'brightness(1.1)' : 'brightness(1.05)'}; }
  &:disabled { opacity: 0.5; cursor: not-allowed; box-shadow: none; }
`;

const EditLink = styled(Link)`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 9px 20px;
  min-height: 44px;
  border-radius: 20px;
  border: 1px solid rgba(${({ theme }) => theme.mainRgba}, 0.2);
  background: rgba(${({ theme }) => theme.bodyRgba}, 0.18);
  color: ${({ theme }) => theme.main};
  font-family: ${({ theme }) => theme.fontFamily};
  font-size: 14px;
  font-weight: 600;
  text-decoration: none;
  transition: all 0.2s;
  &:hover { opacity: 0.85; border-color: ${({ theme }) => theme.accent}; }
`;

const SectionTitle = styled.h3`
  font-size: 18px;
  font-weight: 700;
  color: ${({ theme }) => theme.main};
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const PostsSection = styled.div`
  max-width: 620px;
  margin: 0 auto;
  width: 100%;
`;

const LoadingWrapper = styled.div`
  display: flex;
  justify-content: center;
  padding: 60px;
  font-size: 32px;
  color: ${({ theme }) => theme.accent};
`;

const EmptyPosts = styled.div`
  text-align: center;
  padding: 40px;
  color: ${({ theme }) => theme.text};
  opacity: 0.6;
  background: rgba(${({ theme }) => theme.bodyRgba}, 0.2);
  border-radius: 18px;
  border: 1px solid rgba(${({ theme }) => theme.mainRgba}, 0.1);
`;

const NotFound = styled.div`
  text-align: center;
  padding: 80px 20px;
  color: ${({ theme }) => theme.text};
  font-size: 18px;
`;

export default function Profile() {
  const { username } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const currentUser = useSelector(s => s.user?.currentUser);
  const isFetching = useSelector(s => s.user?.isFetching);
  const { user: profileUser, posts, isFetching: profileFetching } = useSelector(s => s.profile);

  // Followers / Following modal
  const [activeTab, setActiveTab] = useState(null); // null | 'followers' | 'following'
  const [listData, setListData] = useState([]);
  const [listLoading, setListLoading] = useState(false);

  const openTab = async (tab) => {
    setActiveTab(tab);
    setListData([]);
    setListLoading(true);
    try {
      const data = tab === 'followers'
        ? await getFollowers(profileUser.username)
        : await getFollowing(profileUser.username);
      setListData(data || []);
    } catch { setListData([]); }
    finally { setListLoading(false); }
  };

  const switchTab = async (tab) => {
    if (tab === activeTab) return;
    setListData([]);
    setListLoading(true);
    setActiveTab(tab);
    try {
      const data = tab === 'followers'
        ? await getFollowers(profileUser.username)
        : await getFollowing(profileUser.username);
      setListData(data || []);
    } catch { setListData([]); }
    finally { setListLoading(false); }
  };

  useEffect(() => {
    if (username) {
      getUserProfile(dispatch, username);
    }
  }, [username]);

  useEffect(() => {
    if (profileUser && profileUser.username === username) {
      getUserPosts(dispatch, profileUser);
    }
  }, [profileUser?._id, username]);

  if (profileFetching && !profileUser) {
    return (
      <PageWrapper>
        <LoadingWrapper>
          <FontAwesomeIcon icon={faCircleNodes} spin />
        </LoadingWrapper>
      </PageWrapper>
    );
  }

  if (!profileUser || profileUser.username !== username) {
    return (
      <PageWrapper>
        <NotFound>User not found.</NotFound>
      </PageWrapper>
    );
  }

  const isOwnProfile = currentUser?._id === profileUser._id;
  const isFollowing = currentUser?.following?.includes(profileUser._id);
  const hasSentRequest = currentUser?.reqSent?.includes(profileUser._id);

  const handleFollow = async () => {
    if (!currentUser) { navigate('/login'); return; }
    try {
      await follow(dispatch, profileUser._id, currentUser._id);
    } catch (err) { console.error(err); }
  };

  const handleUnsend = async () => {
    if (!currentUser) return;
    try {
      await unsendFollowReq(dispatch, profileUser._id, currentUser._id);
    } catch (err) { console.error(err); }
  };

  const handleUnfollow = async () => {
    if (!currentUser) return;
    if (window.confirm(`Unfollow ${profileUser.name || profileUser.username}?`)) {
      try {
        await unfollow(dispatch, profileUser._id, currentUser._id);
      } catch (err) { console.error(err); }
    }
  };

  const initial = (profileUser.name || profileUser.username || 'U')[0].toUpperCase();
  const followerCount = profileUser.followers?.length || 0;
  const followingCount = profileUser.following?.length || 0;
  const postCount = posts?.length || 0;

  return (
    <PageWrapper>
      <ProfileCard
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <ProfileHeader>
          <Avatar>
            {profileUser.profilePicture ? (
              <AvatarImg src={profileUser.profilePicture} alt={profileUser.name} />
            ) : (
              <AvatarPlaceholder>{initial}</AvatarPlaceholder>
            )}
          </Avatar>

          <ProfileInfo>
            <DisplayName>{profileUser.name || profileUser.username}</DisplayName>
            <Username>@{profileUser.username}</Username>
            {profileUser.bio && <Bio>{profileUser.bio}</Bio>}

            <Stats>
              <StatItem>
                <StatNum>{postCount}</StatNum>
                <StatLabel>Posts</StatLabel>
              </StatItem>
              <StatItem $clickable={isOwnProfile} onClick={isOwnProfile ? () => openTab('followers') : undefined}>
                <StatNum>{followerCount}</StatNum>
                <StatLabel>Followers</StatLabel>
              </StatItem>
              <StatItem $clickable={isOwnProfile} onClick={isOwnProfile ? () => openTab('following') : undefined}>
                <StatNum>{followingCount}</StatNum>
                <StatLabel>Following</StatLabel>
              </StatItem>
            </Stats>

            <ActionRow>
              {isOwnProfile ? (
                <EditLink to="/profile/edit">
                  <FontAwesomeIcon icon={faEdit} />
                  Edit Profile
                </EditLink>
              ) : currentUser ? (
                isFollowing ? (
                  <>
                    <ActionBtn onClick={handleUnfollow} disabled={isFetching}>
                      <FontAwesomeIcon icon={faUserMinus} />
                      Unfollow
                    </ActionBtn>
                    <ActionBtn $primary onClick={() => navigate('/messages', { state: { dmUser: { _id: profileUser._id, username: profileUser.username, name: profileUser.name, profilePicture: profileUser.profilePicture } } })}>
                      <FontAwesomeIcon icon={faMessage} />
                      Message
                    </ActionBtn>
                  </>
                ) : hasSentRequest ? (
                  <ActionBtn onClick={handleUnsend} disabled={isFetching}>
                    <FontAwesomeIcon icon={faUserClock} />
                    Request Sent
                  </ActionBtn>
                ) : (
                  <ActionBtn $primary onClick={handleFollow} disabled={isFetching}>
                    {isFetching
                      ? <FontAwesomeIcon icon={faCircleNodes} spin />
                      : <FontAwesomeIcon icon={faUserPlus} />
                    }
                    Follow
                  </ActionBtn>
                )
              ) : (
                <ActionBtn $primary onClick={() => navigate('/login')}>
                  <FontAwesomeIcon icon={faUserPlus} />
                  Follow
                </ActionBtn>
              )}
            </ActionRow>
          </ProfileInfo>
        </ProfileHeader>
      </ProfileCard>

      <PostsSection>
        <SectionTitle>
          <FontAwesomeIcon icon={faImage} />
          Posts
        </SectionTitle>

        {profileFetching ? (
          <LoadingWrapper>
            <FontAwesomeIcon icon={faCircleNodes} spin />
          </LoadingWrapper>
        ) : posts?.length === 0 ? (
          <EmptyPosts>
            <p>No posts yet.</p>
          </EmptyPosts>
        ) : (
          posts?.map(post => <Post key={post._id} post={post} />)
        )}
      </PostsSection>

      {/* ── Followers / Following modal ── */}
      <AnimatePresence>
        {activeTab && (
          <ModalOverlay
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={(e) => { if (e.target === e.currentTarget) setActiveTab(null); }}
          >
            <ModalCard
              initial={{ opacity: 0, scale: 0.93, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.93, y: 16 }}
              transition={{ duration: 0.2 }}
            >
              <ModalHeader>
                <TabBtn $active={activeTab === 'followers'} onClick={() => switchTab('followers')}>
                  Followers · {followerCount}
                </TabBtn>
                <TabBtn $active={activeTab === 'following'} onClick={() => switchTab('following')}>
                  Following · {followingCount}
                </TabBtn>
                <ModalClose onClick={() => setActiveTab(null)}>
                  <FontAwesomeIcon icon={faTimes} />
                </ModalClose>
              </ModalHeader>

              <ModalList>
                {listLoading ? (
                  <EmptyList><FontAwesomeIcon icon={faCircleNodes} spin style={{ fontSize: 22 }} /></EmptyList>
                ) : listData.length === 0 ? (
                  <EmptyList>No {activeTab} yet.</EmptyList>
                ) : (
                  listData.map(u => (
                    <UserRow key={u._id} to={`/user/${u.username}`} onClick={() => setActiveTab(null)}>
                      <UserAvatar>
                        {u.profilePicture
                          ? <UserAvatarImg src={u.profilePicture} alt={u.name} />
                          : (u.name || u.username || '?')[0].toUpperCase()
                        }
                      </UserAvatar>
                      <div>
                        <UserName>{u.name || u.username}</UserName>
                        <UserHandle>@{u.username}</UserHandle>
                      </div>
                    </UserRow>
                  ))
                )}
              </ModalList>
            </ModalCard>
          </ModalOverlay>
        )}
      </AnimatePresence>
    </PageWrapper>
  );
}
