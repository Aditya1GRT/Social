import React, { useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCircleNodes,
  faUserPlus,
  faUserMinus,
  faUserClock,
  faEdit,
  faUsers,
  faImage,
} from '@fortawesome/free-solid-svg-icons';
import {
  getUserProfile,
  getUserPosts,
  follow,
  unsendFollowReq,
  unfollow,
} from '../redux/actions';
import Post from '../components/Post';

const PageWrapper = styled.div`
  padding: 24px 20px;
  max-width: 800px;
  margin: 0 auto;
  width: 100%;
`;

const ProfileCard = styled(motion.div)`
  background: rgba(${({ theme }) => theme.bodyRgba}, 0.28);
  backdrop-filter: blur(18px);
  -webkit-backdrop-filter: blur(18px);
  border: 1px solid rgba(${({ theme }) => theme.mainRgba}, 0.12);
  border-radius: 24px;
  padding: 30px;
  margin-bottom: 24px;
  box-shadow: 0 4px 24px rgba(0,0,0,0.1);
`;

const ProfileHeader = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 24px;
  flex-wrap: wrap;
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
  min-width: 180px;
`;

const DisplayName = styled.h2`
  font-size: 22px;
  font-weight: 700;
  color: ${({ theme }) => theme.main};
  margin-bottom: 2px;
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
`;

const StatItem = styled.div`
  text-align: center;
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
  border-radius: 20px;
  border: 1px solid rgba(${({ theme }) => theme.mainRgba}, 0.2);
  background: ${({ $primary, theme }) =>
    $primary ? theme.accent : 'rgba(255,255,255,0.1)'};
  color: ${({ $primary, theme }) => ($primary ? theme.body : theme.main)};
  font-family: ${({ theme }) => theme.fontFamily};
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  backdrop-filter: blur(8px);

  &:hover { opacity: 0.85; }
  &:disabled { opacity: 0.5; cursor: not-allowed; }
`;

const EditLink = styled(Link)`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 9px 20px;
  border-radius: 20px;
  border: 1px solid rgba(${({ theme }) => theme.mainRgba}, 0.2);
  background: rgba(${({ theme }) => theme.bodyRgba}, 0.3);
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
              <StatItem>
                <StatNum>{followerCount}</StatNum>
                <StatLabel>Followers</StatLabel>
              </StatItem>
              <StatItem>
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
                  <ActionBtn onClick={handleUnfollow} disabled={isFetching}>
                    <FontAwesomeIcon icon={faUserMinus} />
                    Unfollow
                  </ActionBtn>
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
    </PageWrapper>
  );
}
