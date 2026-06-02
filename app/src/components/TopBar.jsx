import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import styled from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMagnifyingGlass, faMoon, faSun } from '@fortawesome/free-solid-svg-icons';
import logoLight from '../assets/logoLight.png';
import logoDark from '../assets/logoDark.png';

const Bar = styled.header`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  background: rgba(${({ theme }) => theme.bodyRgba}, 0.25);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border-bottom: 1px solid rgba(${({ theme }) => theme.mainRgba}, 0.15);
  box-shadow: 0 2px 20px rgba(0,0,0,0.1);

  @media (max-width: 768px) {
    height: 56px;
    padding: 0 12px;
  }
`;

const LogoLink = styled(Link)`
  display: flex;
  align-items: center;
  text-decoration: none;
  flex-shrink: 0;
`;

const LogoImg = styled.img`
  height: 40px;
  width: auto;

  @media (max-width: 768px) {
    height: 32px;
  }
`;

const SearchWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
  max-width: 400px;
  margin: 0 20px;
  min-width: 0;

  @media (max-width: 480px) {
    max-width: 140px;
    margin: 0 6px;
  }

  @media (max-width: 360px) {
    max-width: 100px;
    margin: 0 4px;
  }
`;

const SearchInput = styled.input`
  flex: 1;
  min-width: 0;
  padding: 8px 14px;
  border-radius: 20px;
  border: 1px solid rgba(${({ theme }) => theme.mainRgba}, 0.2);
  background: rgba(${({ theme }) => theme.bodyRgba}, 0.3);
  backdrop-filter: blur(8px);
  color: ${({ theme }) => theme.main};
  font-family: ${({ theme }) => theme.fontFamily};
  font-size: 14px;
  outline: none;
  transition: all 0.2s;
  width: 100%;
  min-height: 44px;

  &::placeholder { color: ${({ theme }) => theme.text}; opacity: 0.7; }
  &:focus {
    border-color: ${({ theme }) => theme.accent};
    background: rgba(${({ theme }) => theme.bodyRgba}, 0.5);
  }

  @media (max-width: 480px) {
    font-size: 13px;
    padding: 8px 10px;
  }

  @media (max-width: 360px) {
    font-size: 12px;
    padding: 8px 8px;
  }
`;

const SearchBtn = styled.button`
  background: ${({ theme }) => theme.accent};
  border: none;
  border-radius: 50%;
  width: 44px;
  height: 44px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({ theme }) => theme.body};
  transition: opacity 0.2s;
  flex-shrink: 0;

  &:hover { opacity: 0.85; }
`;

const RightSection = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;

  @media (max-width: 480px) {
    gap: 8px;
  }
`;

const ThemeToggle = styled.button`
  background: rgba(${({ theme }) => theme.bodyRgba}, 0.3);
  border: 1px solid rgba(${({ theme }) => theme.mainRgba}, 0.2);
  border-radius: 50%;
  width: 44px;
  height: 44px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({ theme }) => theme.main};
  font-size: 15px;
  transition: all 0.2s;

  &:hover {
    background: rgba(${({ theme }) => theme.mainRgba}, 0.1);
    border-color: ${({ theme }) => theme.accent};
  }
`;

const Avatar = styled(Link)`
  display: block;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  overflow: hidden;
  border: 2px solid ${({ theme }) => theme.accent};
  flex-shrink: 0;
  transition: transform 0.2s;
  &:hover { transform: scale(1.05); }
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
  font-weight: 700;
  font-size: 15px;
`;

export default function TopBar({ isDark, onToggleTheme }) {
  const navigate = useNavigate();
  const currentUser = useSelector(s => s.user?.currentUser);
  const [query, setQuery] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    const q = query.trim();
    if (q) navigate(`/search/${encodeURIComponent(q)}`);
  };

  return (
    <Bar>
      <LogoLink to={currentUser ? '/' : '/login'} reloadDocument>
        <LogoImg src={isDark ? logoDark : logoLight} alt="The Social Scoop" />
      </LogoLink>

      <SearchWrapper as="form" onSubmit={handleSearch}>
        <SearchInput
          type="text"
          placeholder="Search users..."
          value={query}
          onChange={e => setQuery(e.target.value)}
        />
        <SearchBtn type="submit">
          <FontAwesomeIcon icon={faMagnifyingGlass} size="sm" />
        </SearchBtn>
      </SearchWrapper>

      <RightSection>
        <ThemeToggle onClick={onToggleTheme} title="Toggle theme">
          <FontAwesomeIcon icon={isDark ? faSun : faMoon} />
        </ThemeToggle>

        {currentUser && (
          <Avatar to={`/user/${currentUser.username}`}>
            {currentUser.profilePicture ? (
              <AvatarImg src={currentUser.profilePicture} alt={currentUser.name} />
            ) : (
              <AvatarPlaceholder>
                {(currentUser.name || currentUser.username || 'U')[0].toUpperCase()}
              </AvatarPlaceholder>
            )}
          </Avatar>
        )}
      </RightSection>
    </Bar>
  );
}
