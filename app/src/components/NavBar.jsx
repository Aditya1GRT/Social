import React from 'react';
import { NavLink } from 'react-router-dom';
import styled from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faHouse,
  faMagnifyingGlass,
  faUserGroup,
  faMessage,
  faGear,
} from '@fortawesome/free-solid-svg-icons';

const SideNav = styled.nav`
  width: 64px;
  min-height: calc(100vh - 64px);
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 24px 0;
  gap: 8px;
  background: rgba(${({ theme }) => theme.bodyRgba}, 0.1);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-right: 1px solid rgba(${({ theme }) => theme.mainRgba}, 0.12);
  flex-shrink: 0;
  position: sticky;
  top: 64px;
  height: calc(100vh - 64px);
  overflow: hidden;

  @media (max-width: 768px) {
    display: none;
  }
`;

const BottomNav = styled.nav`
  display: none;

  @media (max-width: 768px) {
    display: flex;
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    height: 60px;
    min-height: 60px;
    z-index: 999;
    flex-direction: row;
    align-items: center;
    justify-content: space-around;
    background: rgba(${({ theme }) => theme.bodyRgba}, 0.82);
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    border-top: 1px solid rgba(${({ theme }) => theme.mainRgba}, 0.15);
    padding: 0 4px;
    padding-bottom: env(safe-area-inset-bottom, 0px);
  }
`;

const NavItem = styled(NavLink)`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 46px;
  height: 46px;
  border-radius: 14px;
  color: ${({ theme }) => theme.text};
  font-size: 18px;
  text-decoration: none;
  transition: all 0.2s;

  &:hover {
    background: rgba(${({ theme }) => theme.mainRgba}, 0.1);
    color: ${({ theme }) => theme.main};
  }

  &.active {
    color: ${({ theme }) => theme.accent};
    background: rgba(${({ theme }) => theme.mainRgba}, 0.08);
  }

  @media (max-width: 768px) {
    width: 44px;
    height: 44px;
    min-height: 44px;
    font-size: 20px;
    border-radius: 12px;
    flex: 1;
    max-width: 64px;
  }
`;

const navItems = [
  { to: '/', icon: faHouse, label: 'Home', end: true },
  { to: '/search', icon: faMagnifyingGlass, label: 'Search' },
  { to: '/requests', icon: faUserGroup, label: 'Requests' },
  { to: '/messages', icon: faMessage, label: 'Messages' },
  { to: '/settings', icon: faGear, label: 'Settings' },
];

function NavItems() {
  return navItems.map(({ to, icon, label, end }) => (
    <NavItem key={to} to={to} end={end} title={label}>
      <FontAwesomeIcon icon={icon} />
    </NavItem>
  ));
}

export default function NavBar() {
  return (
    <>
      <SideNav>
        <NavItems />
      </SideNav>
      <BottomNav>
        <NavItems />
      </BottomNav>
    </>
  );
}
