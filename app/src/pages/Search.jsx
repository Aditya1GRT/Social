import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faMagnifyingGlass,
  faCircleNodes,
  faUserPlus,
  faUserMinus,
  faUserClock,
} from '@fortawesome/free-solid-svg-icons';
import { searchUsers, follow, unsendFollowReq, unfollow } from '../redux/actions';

const PageWrapper = styled.div`
  padding: 24px 20px;
  max-width: 640px;
  margin: 0 auto;
  width: 100%;

  @media (max-width: 480px) {
    padding: 16px;
  }
`;

const SearchForm = styled.form`
  display: flex;
  gap: 10px;
  margin-bottom: 24px;
`;

const SearchInput = styled.input`
  flex: 1;
  min-width: 0;
  padding: 12px 18px;
  min-height: 44px;
  border-radius: 22px;
  border: 1px solid rgba(${({ theme }) => theme.mainRgba}, 0.2);
  background: rgba(${({ theme }) => theme.bodyRgba}, 0.18);
  backdrop-filter: blur(12px);
  color: ${({ theme }) => theme.main};
  font-family: ${({ theme }) => theme.fontFamily};
  font-size: 15px;
  outline: none;
  transition: all 0.2s;
  &::placeholder { color: ${({ theme }) => theme.text}; opacity: 0.6; }
  &:focus { border-color: ${({ theme }) => theme.accent}; background: rgba(${({ theme }) => theme.bodyRgba}, 0.45); }

  @media (max-width: 480px) {
    font-size: 14px;
    padding: 10px 14px;
  }
`;

const SearchBtn = styled.button`
  padding: 12px 20px;
  min-height: 44px;
  border-radius: 22px;
  border: none;
  background: ${({ theme }) => theme.accentGrad};
  box-shadow: ${({ theme }) => theme.btnGlow};
  color: white;
  font-family: ${({ theme }) => theme.fontFamily};
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: filter 0.2s;
  white-space: nowrap;
  flex-shrink: 0;
  &:hover { filter: brightness(1.1); }

  @media (max-width: 480px) {
    font-size: 14px;
    padding: 10px 14px;
  }
`;

const ResultsWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
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
  transition: transform 0.15s;
  flex-wrap: nowrap;
  min-width: 0;
  &:hover { transform: translateY(-1px); }

  @media (max-width: 480px) {
    padding: 12px 14px;
    gap: 10px;
  }
`;

const Avatar = styled(Link)`
  display: block;
  width: 48px;
  height: 48px;
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
  font-size: 18px;
  font-weight: 700;
`;

const UserInfo = styled(Link)`
  flex: 1;
  text-decoration: none;
  overflow: hidden;
`;

const DisplayName = styled.div`
  font-size: 15px;
  font-weight: 700;
  color: ${({ theme }) => theme.main};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const Username = styled.div`
  font-size: 13px;
  color: ${({ theme }) => theme.text};
  opacity: 0.7;
`;

const ActionBtn = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 7px 14px;
  min-height: 44px;
  border-radius: 18px;
  border: 1px solid rgba(${({ theme }) => theme.mainRgba}, 0.2);
  background: ${({ $primary, theme }) =>
    $primary ? theme.accentGrad : 'rgba(255,255,255,0.1)'};
  box-shadow: ${({ $primary, theme }) => $primary ? theme.btnGlow : 'none'};
  color: ${({ $primary }) => ($primary ? 'white' : 'inherit')};
  font-family: ${({ theme }) => theme.fontFamily};
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  transition: filter 0.2s, opacity 0.2s;
  white-space: nowrap;
  flex-shrink: 0;
  &:hover { filter: ${({ $primary }) => $primary ? 'brightness(1.1)' : 'none'}; opacity: ${({ $primary }) => $primary ? 1 : 0.85}; }
  &:disabled { opacity: 0.5; cursor: not-allowed; box-shadow: none; }

  @media (max-width: 480px) {
    padding: 6px 10px;
    font-size: 12px;
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 60px 20px;
  color: ${({ theme }) => theme.text};
  opacity: 0.6;
  background: rgba(${({ theme }) => theme.bodyRgba}, 0.2);
  backdrop-filter: blur(12px);
  border-radius: 18px;
  border: 1px solid rgba(${({ theme }) => theme.mainRgba}, 0.1);
`;

const LoadingWrapper = styled.div`
  display: flex;
  justify-content: center;
  padding: 40px;
  color: ${({ theme }) => theme.accent};
  font-size: 28px;
`;

export default function Search() {
  const { query: urlQuery } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const currentUser = useSelector(s => s.user?.currentUser);
  const isFetching = useSelector(s => s.user?.isFetching);

  const [inputVal, setInputVal] = useState(urlQuery || '');
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const debounceRef = useRef(null);

  const runSearch = async (q) => {
    if (!q.trim()) { setResults([]); setHasSearched(false); return; }
    setSearching(true);
    setHasSearched(true);
    try {
      const data = await searchUsers(q.trim());
      setResults(Array.isArray(data) ? data : []);
    } catch {
      setResults([]);
    } finally {
      setSearching(false);
    }
  };

  // Run search on URL param change
  useEffect(() => {
    if (urlQuery) {
      setInputVal(urlQuery);
      runSearch(urlQuery);
    }
  }, [urlQuery]);

  const handleInputChange = (e) => {
    const val = e.target.value;
    setInputVal(val);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      if (val.trim()) {
        navigate(`/search/${encodeURIComponent(val.trim())}`, { replace: true });
      }
    }, 400);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const q = inputVal.trim();
    if (q) navigate(`/search/${encodeURIComponent(q)}`);
  };

  const handleFollow = async (user) => {
    if (!currentUser) { navigate('/login'); return; }
    try {
      await follow(dispatch, user._id, currentUser._id);
    } catch (err) { console.error(err); }
  };

  const handleUnsend = async (user) => {
    if (!currentUser) return;
    try {
      await unsendFollowReq(dispatch, user._id, currentUser._id);
    } catch (err) { console.error(err); }
  };

  const handleUnfollow = async (user) => {
    if (!currentUser) return;
    if (window.confirm(`Unfollow ${user.name || user.username}?`)) {
      try {
        await unfollow(dispatch, user._id, currentUser._id);
      } catch (err) { console.error(err); }
    }
  };

  const getRelationship = (user) => {
    if (!currentUser || user._id === currentUser._id) return null;
    if (currentUser.following?.includes(user._id)) return 'following';
    if (currentUser.reqSent?.includes(user._id)) return 'pending';
    return 'none';
  };

  return (
    <PageWrapper>
      <SearchForm onSubmit={handleSubmit}>
        <SearchInput
          type="text"
          placeholder="Search for users..."
          value={inputVal}
          onChange={handleInputChange}
          autoFocus
        />
        <SearchBtn type="submit">
          <FontAwesomeIcon icon={faMagnifyingGlass} />
          Search
        </SearchBtn>
      </SearchForm>

      {searching ? (
        <LoadingWrapper>
          <FontAwesomeIcon icon={faCircleNodes} spin />
        </LoadingWrapper>
      ) : hasSearched ? (
        results.length === 0 ? (
          <EmptyState>
            <p>No users found for "{urlQuery}"</p>
            <p style={{ marginTop: '8px', fontSize: '13px' }}>Try a different search term.</p>
          </EmptyState>
        ) : (
          <ResultsWrapper>
            <AnimatePresence>
              {results.map((user, i) => {
                const rel = getRelationship(user);
                const initial = (user.name || user.username || 'U')[0].toUpperCase();
                const isOwn = user._id === currentUser?._id;

                return (
                  <UserCard
                    key={user._id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
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

                    {!isOwn && currentUser && rel === 'following' && (
                      <ActionBtn onClick={() => handleUnfollow(user)} disabled={isFetching}>
                        <FontAwesomeIcon icon={faUserMinus} />
                        Unfollow
                      </ActionBtn>
                    )}
                    {!isOwn && currentUser && rel === 'pending' && (
                      <ActionBtn onClick={() => handleUnsend(user)} disabled={isFetching}>
                        <FontAwesomeIcon icon={faUserClock} />
                        Pending
                      </ActionBtn>
                    )}
                    {!isOwn && currentUser && rel === 'none' && (
                      <ActionBtn $primary onClick={() => handleFollow(user)} disabled={isFetching}>
                        <FontAwesomeIcon icon={faUserPlus} />
                        Follow
                      </ActionBtn>
                    )}
                    {!currentUser && (
                      <ActionBtn $primary onClick={() => navigate('/login')}>
                        <FontAwesomeIcon icon={faUserPlus} />
                        Follow
                      </ActionBtn>
                    )}
                  </UserCard>
                );
              })}
            </AnimatePresence>
          </ResultsWrapper>
        )
      ) : (
        <EmptyState>
          <FontAwesomeIcon icon={faMagnifyingGlass} size="2x" style={{ marginBottom: '12px', opacity: 0.4 }} />
          <p>Search for users by username</p>
        </EmptyState>
      )}
    </PageWrapper>
  );
}
