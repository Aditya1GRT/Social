import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import styled, { ThemeProvider, createGlobalStyle } from 'styled-components';
import { lightTheme, darkTheme } from './themes';
import { refresh, changeTheme } from './redux/actions';

import TopBar from './components/TopBar';
import NavBar from './components/NavBar';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Profile from './pages/Profile';
import EditProfile from './pages/EditProfile';
import Messages from './pages/Messages';
import Search from './pages/Search';
import FriendRequests from './pages/FriendRequests';
import Settings from './pages/Settings';
import Notifications from './pages/Notifications';

import bgLight from './assets/bgLight.jpg';
import bgDark from './assets/bgDark.jpg';
import bgLightMobile from './assets/bgLightMobile.jpg';
import bgDarkMobile from './assets/bgDarkMobile.jpg';

const GlobalStyle = createGlobalStyle`
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    font-family: ${({ theme }) => theme.fontFamily};
    color: ${({ theme }) => theme.text};
    background-color: ${({ theme }) => theme.body};
    min-height: 100vh;
    overflow-x: hidden;
  }
  img, video { max-width: 100%; height: auto; }
  ::-webkit-scrollbar { width: 6px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.2); border-radius: 3px; }
`;

const AppWrapper = styled.div`
  min-height: 100vh;
  position: relative;
  overflow-x: hidden;
  background-image:
    radial-gradient(ellipse 28% 16% at 62% 22%, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.18) 55%, transparent 100%),
    url(${({ $dark }) => ($dark ? bgDark : bgLight)});
  background-size: cover;
  background-position: center;
  background-attachment: fixed;

  @media (max-width: 600px) {
    background-image:
      radial-gradient(ellipse 38% 16% at 68% 20%, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.18) 55%, transparent 100%),
      url(${({ $dark }) => ($dark ? bgDarkMobile : bgLightMobile)});
    background-attachment: scroll;
  }
`;

const ContentWrapper = styled.div`
  display: flex;
  min-height: 100vh;
  padding-top: 64px;
  overflow-x: hidden;

  @media (max-width: 768px) {
    padding-top: 56px;
    padding-bottom: 60px;
  }
`;

const MainArea = styled.main`
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  min-height: calc(100vh - 64px);
  min-width: 0;
  width: 100%;

  @media (max-width: 768px) {
    min-height: calc(100vh - 116px);
  }

  @media (max-width: 480px) {
    padding-bottom: 0;
  }
`;

function ProtectedRoute({ children }) {
  const currentUser = useSelector(s => s.user?.currentUser);
  return currentUser ? children : <Navigate to="/login" replace />;
}

function PublicRoute({ children }) {
  const currentUser = useSelector(s => s.user?.currentUser);
  return !currentUser ? children : <Navigate to="/" replace />;
}

function getInitialDark(user) {
  if (user?.prefersDarkTheme !== undefined) return user.prefersDarkTheme;
  const saved = localStorage.getItem('themePreference');
  if (saved !== null) return saved === 'dark';
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

export default function App() {
  const dispatch = useDispatch();
  const currentUser = useSelector(s => s.user?.currentUser);
  const [isDark, setIsDark] = React.useState(() => getInitialDark(currentUser));

  // Sync isDark when user logs in/out or their stored preference changes
  useEffect(() => {
    setIsDark(getInitialDark(currentUser));
  }, [currentUser?._id, currentUser?.prefersDarkTheme]);

  const toggleTheme = () => {
    const next = !isDark;
    setIsDark(next);
    localStorage.setItem('themePreference', next ? 'dark' : 'light');
    if (currentUser) {
      // Fire-and-forget — UI updates immediately regardless of API result
      changeTheme(dispatch, currentUser._id, next).catch(() => {});
    }
  };

  const theme = isDark ? darkTheme : lightTheme;

  useEffect(() => {
    if (currentUser) {
      refresh(dispatch, currentUser);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <GlobalStyle />
      <AppWrapper $dark={isDark}>
        <TopBar isDark={isDark} onToggleTheme={toggleTheme} />
        <ContentWrapper>
          {currentUser && <NavBar />}
          <MainArea>
            <Routes>
              {/* Public routes */}
              <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
              <Route path="/signup" element={<PublicRoute><Signup /></PublicRoute>} />

              {/* Protected routes */}
              <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
              <Route path="/messages" element={<ProtectedRoute><Messages /></ProtectedRoute>} />
              <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
              <Route path="/requests" element={<ProtectedRoute><FriendRequests /></ProtectedRoute>} />
              <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
              <Route path="/profile/edit" element={<ProtectedRoute><EditProfile /></ProtectedRoute>} />

              {/* Semi-public routes */}
              <Route path="/user/:username" element={<Profile />} />
              <Route path="/search/:query?" element={<Search />} />
              <Route path="/search" element={<Search />} />

              {/* Fallback */}
              <Route path="*" element={<Navigate to={currentUser ? '/' : '/login'} replace />} />
            </Routes>
          </MainArea>
        </ContentWrapper>
      </AppWrapper>
    </ThemeProvider>
  );
}
