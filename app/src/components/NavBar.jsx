import React from 'react';
import { NavLink } from 'react-router-dom';
import { useSelector } from 'react-redux';
import styled from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faHouse,
  faMagnifyingGlass,
  faUserGroup,
  faMessage,
  faBell,
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
  position: relative;

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

const Badge = styled.span`
  position: absolute;
  top: 4px;
  right: 4px;
  min-width: 16px;
  height: 16px;
  border-radius: 8px;
  background: #e74c3c;
  color: white;
  font-size: 10px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 3px;
  line-height: 1;
  pointer-events: none;
`;

const navItems = [
  { to: '/', icon: faHouse, label: 'Home', end: true },
  { to: '/search', icon: faMagnifyingGlass, label: 'Search' },
  { to: '/requests', icon: faUserGroup, label: 'Requests' },
  { to: '/messages', icon: faMessage, label: 'Messages' },
  { to: '/notifications', icon: faBell, label: 'Notifications', badge: true },
  { to: '/settings', icon: faGear, label: 'Settings' },
];

function NavItems() {
  const notifItems = useSelector(s => s.notifications?.items || []);
  const unreadCount = notifItems.filter(n => !n.read).length;

  return navItems.map(({ to, icon, label, end, badge }) => (
    <NavItem key={to} to={to} end={end} title={label}>
      <FontAwesomeIcon icon={icon} />
      {badge && unreadCount > 0 && (
        <Badge>{unreadCount > 99 ? '99+' : unreadCount}</Badge>
      )}
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
