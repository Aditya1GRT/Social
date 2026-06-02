import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faMoon,
  faSun,
  faTrash,
  faCircleNodes,
  faGear,
  faShieldHalved,
  faPalette,
  faFileContract,
  faChevronDown,
  faChevronUp,
  faRightFromBracket,
} from '@fortawesome/free-solid-svg-icons';
import { changeTheme, deleteAccount } from '../redux/actions';
import { logOut } from '../redux/slices/userSlice';

const PageWrapper = styled.div`
  padding: 24px 20px;
  max-width: 600px;
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
  display: flex;
  align-items: center;
  gap: 10px;
`;

const SettingsCard = styled(motion.div)`
  background: rgba(${({ theme }) => theme.bodyRgba}, 0.14);
  backdrop-filter: blur(22px);
  -webkit-backdrop-filter: blur(22px);
  border: 1px solid rgba(${({ theme }) => theme.mainRgba}, 0.16);
  border-radius: 20px;
  overflow: hidden;
  margin-bottom: 20px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.08);
`;

const SectionHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 16px 20px 12px;
  border-bottom: 1px solid rgba(${({ theme }) => theme.mainRgba}, 0.08);
`;

const SectionIcon = styled.div`
  width: 34px;
  height: 34px;
  border-radius: 10px;
  background: rgba(${({ theme }) => theme.mainRgba}, 0.08);
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({ theme }) => theme.accent};
  font-size: 15px;
`;

const SectionTitle = styled.h3`
  font-size: 15px;
  font-weight: 700;
  color: ${({ theme }) => theme.main};
`;

const SettingRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid rgba(${({ theme }) => theme.mainRgba}, 0.06);
  gap: 12px;
  flex-wrap: wrap;
  &:last-child { border-bottom: none; }

  @media (max-width: 480px) {
    padding: 14px 16px;
  }
`;

const SettingInfo = styled.div``;

const SettingName = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: ${({ theme }) => theme.main};
  margin-bottom: 2px;
`;

const SettingDesc = styled.div`
  font-size: 12px;
  color: ${({ theme }) => theme.text};
  opacity: 0.65;
`;

const Toggle = styled.button`
  width: 50px;
  height: 27px;
  border-radius: 14px;
  border: none;
  cursor: pointer;
  transition: background 0.25s;
  position: relative;
  background: ${({ $on, theme }) => $on ? theme.accent : 'rgba(0,0,0,0.15)'};
  flex-shrink: 0;
  /* Expand tap target without changing visual size */
  padding: 8px 0;
  margin: -8px 0;
  &:hover { opacity: 0.9; }
`;

const ToggleThumb = styled.div`
  position: absolute;
  width: 21px;
  height: 21px;
  border-radius: 50%;
  background: white;
  top: 3px;
  left: ${({ $on }) => $on ? '26px' : '3px'};
  transition: left 0.25s;
  box-shadow: 0 1px 4px rgba(0,0,0,0.2);
`;

const ThemeIcon = styled.div`
  width: 34px;
  height: 34px;
  border-radius: 50%;
  background: rgba(${({ theme }) => theme.mainRgba}, 0.08);
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({ $dark, theme }) => $dark ? '#f1c40f' : '#f39c12'};
  font-size: 15px;
  margin-right: 8px;
`;

const LogoutBtn = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 18px;
  min-height: 44px;
  border-radius: 12px;
  border: none;
  background: ${({ theme }) => theme.accentGrad};
  box-shadow: ${({ theme }) => theme.btnGlow};
  color: white;
  font-family: ${({ theme }) => theme.fontFamily};
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  transition: filter 0.2s;
  white-space: nowrap;
  flex-shrink: 0;
  &:hover { filter: brightness(1.1); }
`;

const DangerBtn = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 18px;
  min-height: 44px;
  border-radius: 12px;
  border: 1px solid rgba(231, 76, 60, 0.3);
  background: rgba(231, 76, 60, 0.08);
  color: #e74c3c;
  font-family: ${({ theme }) => theme.fontFamily};
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
  flex-shrink: 0;
  &:hover {
    background: rgba(231, 76, 60, 0.16);
    border-color: #e74c3c;
  }
  &:disabled { opacity: 0.5; cursor: not-allowed; }
`;

const ConfirmModal = styled.div`
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
  background: rgba(${({ theme }) => theme.bodyRgba}, 0.95);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(${({ theme }) => theme.mainRgba}, 0.15);
  border-radius: 20px;
  padding: 32px;
  max-width: 380px;
  width: 100%;
  box-shadow: 0 10px 50px rgba(0,0,0,0.25);
`;

const ModalTitle = styled.h3`
  font-size: 18px;
  font-weight: 700;
  color: #e74c3c;
  margin-bottom: 10px;
`;

const ModalText = styled.p`
  font-size: 14px;
  color: ${({ theme }) => theme.text};
  margin-bottom: 24px;
  line-height: 1.55;
`;

const ModalBtns = styled.div`
  display: flex;
  gap: 12px;
`;

const CancelBtn = styled.button`
  flex: 1;
  padding: 11px;
  border-radius: 12px;
  border: 1px solid rgba(${({ theme }) => theme.mainRgba}, 0.2);
  background: rgba(${({ theme }) => theme.bodyRgba}, 0.5);
  color: ${({ theme }) => theme.main};
  font-family: ${({ theme }) => theme.fontFamily};
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  &:hover { border-color: ${({ theme }) => theme.accent}; }
`;

const DeleteConfirmBtn = styled.button`
  flex: 1;
  padding: 11px;
  border-radius: 12px;
  border: none;
  background: #e74c3c;
  color: white;
  font-family: ${({ theme }) => theme.fontFamily};
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: opacity 0.2s;
  &:hover { opacity: 0.88; }
  &:disabled { opacity: 0.5; cursor: not-allowed; }
`;

export default function Settings() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const currentUser = useSelector(s => s.user?.currentUser);
  const isFetching = useSelector(s => s.user?.isFetching);

  const savedTheme = localStorage.getItem('themePreference');
  const isDark = currentUser?.prefersDarkTheme !== undefined
    ? currentUser.prefersDarkTheme
    : savedTheme !== null
      ? savedTheme === 'dark'
      : window.matchMedia('(prefers-color-scheme: dark)').matches;

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showTerms, setShowTerms] = useState(false);

  const handleThemeToggle = () => {
    if (!currentUser) return;
    const next = !isDark;
    localStorage.setItem('themePreference', next ? 'dark' : 'light');
    changeTheme(dispatch, currentUser._id, next);
  };

  const handleLogout = () => {
    dispatch(logOut());
    navigate('/login');
  };

  const handleDeleteAccount = async () => {
    if (!currentUser) return;
    setDeleting(true);
    try {
      await deleteAccount(dispatch, currentUser._id);
      navigate('/login');
    } catch (err) {
      console.error(err);
      setDeleting(false);
    }
  };

  if (!currentUser) return null;

  return (
    <PageWrapper>
      <PageTitle>
        <FontAwesomeIcon icon={faGear} />
        Settings
      </PageTitle>

      <SettingsCard
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <SectionHeader>
          <SectionIcon><FontAwesomeIcon icon={faPalette} /></SectionIcon>
          <SectionTitle>Appearance</SectionTitle>
        </SectionHeader>

        <SettingRow>
          <div style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
            <ThemeIcon $dark={isDark}>
              <FontAwesomeIcon icon={isDark ? faMoon : faSun} />
            </ThemeIcon>
            <SettingInfo>
              <SettingName>Dark Mode</SettingName>
              <SettingDesc>
                {isDark ? 'Switch to light theme' : 'Switch to dark theme'}
              </SettingDesc>
            </SettingInfo>
          </div>
          <Toggle $on={isDark} onClick={handleThemeToggle}>
            <ToggleThumb $on={isDark} />
          </Toggle>
        </SettingRow>
      </SettingsCard>

      <SettingsCard
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.05 }}
      >
        <SectionHeader>
          <SectionIcon style={{ color: '#e74c3c' }}>
            <FontAwesomeIcon icon={faShieldHalved} />
          </SectionIcon>
          <SectionTitle>Account</SectionTitle>
        </SectionHeader>

        <SettingRow>
          <SettingInfo>
            <SettingName>Log Out</SettingName>
            <SettingDesc>Sign out of your account</SettingDesc>
          </SettingInfo>
          <LogoutBtn onClick={handleLogout}>
            <FontAwesomeIcon icon={faRightFromBracket} />
            Log Out
          </LogoutBtn>
        </SettingRow>

        <SettingRow>
          <SettingInfo>
            <SettingName>Delete Account</SettingName>
            <SettingDesc>Permanently delete your account and all data</SettingDesc>
          </SettingInfo>
          <DangerBtn onClick={() => setShowDeleteModal(true)}>
            <FontAwesomeIcon icon={faTrash} />
            Delete
          </DangerBtn>
        </SettingRow>
      </SettingsCard>

      <SettingsCard
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <SectionHeader
          style={{ cursor: 'pointer' }}
          onClick={() => setShowTerms(v => !v)}
        >
          <SectionIcon><FontAwesomeIcon icon={faFileContract} /></SectionIcon>
          <SectionTitle style={{ flex: 1 }}>Terms &amp; Conditions</SectionTitle>
          <FontAwesomeIcon icon={showTerms ? faChevronUp : faChevronDown} style={{ opacity: 0.5, fontSize: 13 }} />
        </SectionHeader>

        {showTerms && (
          <div style={{ padding: '16px 20px', fontSize: '13px', lineHeight: '1.7', color: 'inherit', opacity: 0.8 }}>
            <p>Welcome to The Social Scoop!</p>
            <br />
            <p>These terms and conditions outline the rules and regulations for the use of The Social Scoop's Website. By accessing this website we assume you accept these terms and conditions.</p>
            <br />
            <p style={{ fontWeight: 700, marginBottom: 6 }}>Cookies</p>
            <p>We employ the use of cookies. By accessing The Social Scoop, you agreed to use cookies in agreement with The Social Scoop's Privacy Policy. Cookies are used by our website to enable the functionality of certain areas and to make it easier for people visiting our website.</p>
            <br />
            <p style={{ fontWeight: 700, marginBottom: 6 }}>License</p>
            <p>Unless otherwise stated, The Social Scoop and/or its licensors own the intellectual property rights for all material on The Social Scoop. All intellectual property rights are reserved. You may access this for your own personal use subjected to restrictions set in these terms and conditions.</p>
            <br />
            <p>You must not:</p>
            <ul style={{ paddingLeft: 20, marginTop: 6 }}>
              <li>Republish material from The Social Scoop</li>
              <li>Sell, rent or sub-license material from The Social Scoop</li>
              <li>Reproduce, duplicate or copy material from The Social Scoop</li>
              <li>Redistribute content from The Social Scoop</li>
            </ul>
            <br />
            <p style={{ fontWeight: 700, marginBottom: 6 }}>Comments &amp; User Content</p>
            <p>The Social Scoop does not filter, edit, publish or review Comments prior to their presence on the website. Comments do not reflect the views and opinions of The Social Scoop, its agents and/or affiliates. The Social Scoop reserves the right to monitor all Comments and to remove any Comments which can be considered inappropriate, offensive or causes breach of these Terms and Conditions.</p>
            <br />
            <p style={{ fontWeight: 700, marginBottom: 6 }}>Disclaimer</p>
            <p>To the maximum extent permitted by applicable law, we exclude all representations, warranties and conditions relating to our website and the use of this website. Nothing in this disclaimer will limit or exclude our or your liability for death or personal injury, limit or exclude our or your liability for fraud or fraudulent misrepresentation, or limit any of our or your liabilities in any way that is not permitted under applicable law.</p>
            <br />
            <p style={{ opacity: 0.6, fontSize: 12 }}>Effective Date: May 24, 2022</p>
          </div>
        )}
      </SettingsCard>

      {showDeleteModal && (
        <ConfirmModal onClick={(e) => { if (e.target === e.currentTarget) setShowDeleteModal(false); }}>
          <ModalCard
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2 }}
          >
            <ModalTitle>Delete Account</ModalTitle>
            <ModalText>
              Are you absolutely sure? This action cannot be undone. All your posts,
              messages, and profile data will be permanently deleted.
            </ModalText>
            <ModalBtns>
              <CancelBtn onClick={() => setShowDeleteModal(false)}>Cancel</CancelBtn>
              <DeleteConfirmBtn onClick={handleDeleteAccount} disabled={deleting || isFetching}>
                {deleting && <FontAwesomeIcon icon={faCircleNodes} spin />}
                {deleting ? 'Deleting...' : 'Delete Forever'}
              </DeleteConfirmBtn>
            </ModalBtns>
          </ModalCard>
        </ConfirmModal>
      )}
    </PageWrapper>
  );
}
