import { Navigate, Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import { darkTheme, lightTheme } from "./components/Themes";
import styled, { ThemeProvider } from "styled-components";
import GlobalStyles from "./GlobalStyles";
import { useEffect, useState } from "react";
import Messages from "./pages/Messages";
import TopBar from "./components/TopBar";
import Login from "./pages/Login";
import Search from "./pages/Search";
import bgDark from "./assets/bgDark.jpg";
import bgDarkM from "./assets/bgDarkMobile.jpg";
import bgLightM from "./assets/bgLightMobile.jpg";
import bgLight from "./assets/bgLight.jpg";
import SignUp from "./pages/SignUp";
import Settings from "./pages/Settings";
import { useDispatch, useSelector } from "react-redux";
import User from "./pages/User";
import EditProfile from "./pages/EditProfile";
import FriendRequests from "./pages/FriendRequests";
import TermsandConditions from "./pages/TermsandConditions";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import { refresh } from "./redux/API Calls/apiCalls";

const Main = styled.div`
  height: 100vh;
  width: 100vw;
  position: relative;
  overflow: hidden;
  z-index: 0;

  background: ${(props) =>
    props.themeColor === "dark" ? ` url(${bgDark})` : ` url(${bgLight})`};

  background-repeat: no-repeat;
  background-position: left top;
  background-size: 100vw 100vh;
  @media (max-width: 1000px) {
    height: ${`${window.innerHeight}px`};
  }
  @media (max-width: 470px) {
    background: ${(props) =>
      props.themeColor === "dark" ? ` url(${bgDarkM})` : ` url(${bgLightM})`};
    /* object-fit: cover; */
    background-size: 100vw ${`${window.innerHeight}px`};
  }
`;
const MainConatiner = styled.div`
  color: ${(props) => props.theme.text};
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 100%;
  width: 100%;
  overflow-y: auto;
  z-index: 10;
  background: transparent;
`;
const Container = styled.div`
  height: calc(100% - 180px);
  padding: 40px 0px 30px;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  overflow: hidden;
  background: transparent;
  @media (max-width: 1000px) {
    flex-direction: column-reverse;
    padding: 0px 0px 20px;
  }
  @media (max-width: 475px) {
    height: calc(100vh - 140px);
    padding: 0px 0px 20px;
  }
`;

function App() {
  const dispatch = useDispatch();
  const [themeDark, setThemeDark] = useState(
    window.matchMedia("(prefers-color-scheme: dark)").matches
  );
  const user = useSelector((state) => state.user.currentUser);
  useEffect(() => {
    // refresh(dispatch, user);
    user ? setThemeDark(user.prefersDarkTheme) : setThemeDark((p) => p);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);
  useEffect(() => {
    refresh(dispatch, user);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Main themeColor={themeDark ? "dark" : "light"}>
      <GlobalStyles />
      <ThemeProvider theme={themeDark ? darkTheme : lightTheme}>
        <MainConatiner>
          <TopBar
            setThemeDark={setThemeDark}
            themeCurrent={themeDark ? "dark" : "light"}
            user={user}
          />
          <Container>
            <Routes>
              <Route
                path="/"
                exact
                element={
                  user ? (
                    <Home themeCurrent={themeDark ? "dark" : "light"} />
                  ) : (
                    <Navigate to="/login" replace />
                  )
                }
              />
              <Route
                path="/settings"
                exact
                element={
                  user ? (
                    <Settings
                      themeCurrent={themeDark ? "dark" : "light"}
                      user={user}
                    />
                  ) : (
                    <Navigate to="/login" replace />
                  )
                }
              />
              <Route
                path={"/search/:query"}
                element={
                  <Search
                    themeCurrent={themeDark ? "dark" : "light"}
                    name={user ? user.name : ""}
                    userId={user ? user._id : ""}
                  />
                }
              />
              <Route
                path={"/search"}
                element={
                  <Search
                    themeCurrent={themeDark ? "dark" : "light"}
                    name={user ? user.name : ""}
                    userId={user ? user._id : ""}
                  />
                }
              />
              <Route
                path="/messages"
                exact
                element={
                  user ? (
                    <Messages themeCurrent={themeDark ? "dark" : "light"} />
                  ) : (
                    <Navigate to="/login" replace />
                  )
                }
              />
              <Route
                path="/login"
                exact
                element={
                  user ? (
                    <Navigate to="/" replace />
                  ) : (
                    <Login themeCurrent={themeDark ? "dark" : "light"} />
                  )
                }
              />
              <Route
                path="/signup"
                exact
                element={
                  user ? (
                    <Navigate to="/" replace />
                  ) : (
                    <SignUp themeCurrent={themeDark ? "dark" : "light"} />
                  )
                }
              />

              <Route
                path={`/user/:username`}
                element={<User themeCurrent={themeDark ? "dark" : "light"} />}
              />
              <Route
                path="/profile/edit"
                element={<EditProfile user={user} />}
              />
              <Route
                path="/friendRequests"
                element={<FriendRequests user={user} />}
              />
              <Route
                path="/termsandconditions"
                element={
                  <TermsandConditions
                    themeCurrent={themeDark ? "dark" : "light"}
                  />
                }
              />
              <Route
                path="/privacypolicy"
                element={
                  <PrivacyPolicy themeCurrent={themeDark ? "dark" : "light"} />
                }
              />
            </Routes>
          </Container>
        </MainConatiner>
      </ThemeProvider>
    </Main>
  );
}

export default App;
