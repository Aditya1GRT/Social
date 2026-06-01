import {
  faBullhorn,
  faGear,
  faMoon,
  faSkullCrossbones,
  faSun,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { motion } from "framer-motion";
import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import styled from "styled-components";
import NavBar from "../components/NavBar";
import { changeTheme, deleteUser } from "../redux/API Calls/apiCalls";
import { logOut } from "../redux/userSlice";

const MainContainer = styled(motion.div)`
  background: ${(props) =>
    props.themeCurrent === "dark"
      ? `rgba(${props.theme.bodyRgba},.85)`
      : `rgba(${props.theme.bodyRgba},.6)`};
  box-shadow: 20px 20px 50px rgba(0, 0, 0, 0.5);
  border-top: 1px solid rgba(255, 255, 255, 0.5);
  border-left: 1px solid rgba(255, 255, 255, 0.5);
  height: 90%;
  width: 90%;
  padding: 30px 50px;
  margin: 0 40px;
  /* display: flex;
  align-items: center;
  justify-content: space-between; */
  overflow-y: scroll;
  border-radius: 30px;
  .settings-msg {
    font-size: 17px;
    font-weight: 500;
  }

  @media (max-width: 1300px) {
    padding: 30px;
  }
  @media (max-width: 1000px) {
    margin-left: 0;
    overflow-y: scroll;
    height: 85%;
    margin: 20px 40px;
    width: calc(100% - 140px);
  }

  @media (max-width: 475px) {
    width: calc(100% - 90px);
    margin: 20px 15px 0;
  }
`;

const TopSection = styled.div`
  height: 50px;
  display: flex;
  justify-content: flex-start;
  align-items: center;
  color: ${(props) => props.theme.main};

  .icon {
    width: 50px;
    height: 50px;
    margin-right: 5px;
    color: ${(props) => props.theme.accent};
  }

  h2 {
    width: 100%;
    height: 100%;
    font-size: 30px;
    font-weight: 600;
    margin: 0;
    margin-left: 10px;
    color: ${(props) => props.theme.main};
    position: relative;
    border-bottom: ${(props) => `1px solid ${props.theme.accent}`};
    display: flex;
    align-items: center;
  }
`;

const MiddleSection = styled.div`
  margin: 50px 0;
  .settings-sections {
    padding: 15px 0;
    .heading {
      display: flex;
      justify-content: flex-start;
      align-items: center;
      width: 100%;
      height: 30px;

      .icon {
        width: 30px;
        height: 30px;

        color: ${(props) => props.theme.main};

        @media (max-width: 1000px) {
          width: 20px;
          height: 20px;
          margin-right: 5px;
        }
      }

      h4 {
        width: 100%;
        height: 100%;
        font-size: 20px;
        font-weight: 600;
        margin-left: 10px;
        color: ${(props) => props.theme.main};
        border-bottom: ${(props) => `1px solid ${props.theme.accent}`};
        position: relative;

        @media (max-width: 1000px) {
          font-size: 19px;
        }
      }
    }

    .setDefaultTheme {
      display: flex;
      justify-content: flex-start;
      align-items: center;
      margin-top: 10px;
      .choice {
        margin-left: 20px;
        display: flex;
        justify-content: flex-start;
        align-items: center;
        button {
          background-color: transparent;
          color: ${(props) => props.theme.accent};
          border: 1px solid ${(props) => props.theme.accent};
          border-radius: 30px;
          padding: 10px 30px;
          margin: 10px;
          .icon {
            margin-right: 5px;
          }
        }

        .dark {
          background-color: ${(props) =>
            props.prefersDarkTheme ? props.theme.accent : "transparent"};
          color: ${(props) =>
            props.prefersDarkTheme ? props.theme.body : props.theme.accent};
        }
        .light {
          background-color: ${(props) =>
            !props.prefersDarkTheme ? props.theme.accent : "transparent"};
          color: ${(props) =>
            !props.prefersDarkTheme ? props.theme.body : props.theme.accent};
        }
      }
      @media (max-width: 520px) {
        flex-direction: column;

        .choice {
          flex-direction: column;
          margin: 0;
        }
      }
    }
  }

  .options {
    height: 50px;
    display: flex;
    justify-content: flex-start;
    align-items: center;

    margin-top: 15px;
    button {
      margin: 0 5px;
      border: 1px solid #f72727;
      border-radius: 30px;
      padding: 10px 30px;
      color: #f72727;
      background: transparent;
      font-size: 15px;
      font-weight: 700;
    }
  }

  .privacy {
    margin: 15px 0;
    width: 100%;
    p {
      font-size: 17px;
      font-weight: 500;

      @media (max-width: 1000px) {
        font-size: 14px;
      }
    }

    button {
      border: 1px solid ${(props) => props.theme.accent};
      border-radius: 30px;
      padding: 10px 30px;
      background: transparent;
      color: ${(props) => props.theme.accent};
      font-size: 15px;
      font-weight: 600;
      cursor: pointer;

      &:hover {
        color: ${(props) => props.theme.body};
        background-color: ${(props) => props.theme.accent};
      }

      @media (max-width: 1000px) {
        font-size: 12px;
        width: 100%;
      }
    }
  }

  .termsandconditions {
    margin: 15px 0;
    width: 100%;
    p {
      font-size: 17px;
      font-weight: 500;

      @media (max-width: 1000px) {
        font-size: 14px;
      }
    }

    button {
      border: 1px solid ${(props) => props.theme.accent};
      border-radius: 30px;
      padding: 10px 30px;
      background: transparent;
      color: ${(props) => props.theme.accent};
      font-size: 15px;
      font-weight: 600;
      cursor: pointer;

      &:hover {
        color: ${(props) => props.theme.body};
        background-color: ${(props) => props.theme.accent};
      }

      @media (max-width: 1000px) {
        font-size: 12px;
        width: 100%;
      }
    }
  }
`;

const LowerSection = styled.div`
  .settings-sections {
    margin: 15px 0;
    .heading {
      display: flex;
      justify-content: flex-start;
      align-items: center;
      height: 40px;

      .icon {
        width: 40px;
        height: 40px;

        font-size: 25px;
        color: #f72727;

        @media (max-width: 1000px) {
          width: 25px;
          height: 25px;
        }
      }

      h4 {
        width: 100%;
        height: 100%;
        font-size: 25px;
        font-weight: 600;
        margin-left: 15px;
        position: relative;
        color: ${(props) => props.theme.main};
        display: flex;
        align-items: center;
        border-bottom: 1px solid #f72727;
        @media (max-width: 1000px) {
          font-size: 17px;
        }
      }
    }

    .options {
      height: 50px;
      display: flex;
      justify-content: flex-start;
      align-items: center;

      margin-top: 15px;
      button {
        margin: 0 5px;
        border: 1px solid #f72727;
        border-radius: 30px;
        padding: 10px 30px;
        color: #f72727;
        background: transparent;
        font-size: 15px;
        font-weight: 700;
        cursor: pointer;

        &:hover {
          background-color: #f72727;
          color: ${(props) => props.theme.main};
        }
      }
      @media (max-width: 1000px) {
        flex-direction: column;
        height: 100%;

        button {
          margin: 5px 0;
          width: 100%;
          font-size: 13px;
        }
      }
    }
  }
`;

const Settings = ({ user, themeCurrent }) => {
  const dispatch = useDispatch();
  const signOut = () => {
    if (user) {
      dispatch(logOut());
    }
  };
  const { _id: userId } = user;
  const prefersDarkTheme = useSelector(
    (state) => state.user.currentUser.prefersDarkTheme
  );
  const [confirmDelete, setConfirmDelete] = useState(false);

  return (
    <>
      <NavBar themeCurrent={themeCurrent} />
      <MainContainer
        themeCurrent={themeCurrent}
        initial={{ x: 100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ type: "spring", duration: 1.2, delay: 0.2 }}
      >
        <TopSection>
          <FontAwesomeIcon className="icon" icon={faGear} />
          <h2>Setting's</h2>
        </TopSection>

        <p className="settings-msg">
          Hey! {user.name}, have a look at your setting. Not convinced change it
          now!
        </p>
        <MiddleSection prefersDarkTheme={prefersDarkTheme}>
          <div className="settings-sections">
            <div className="heading">
              {themeCurrent !== "dark" ? (
                <FontAwesomeIcon className="icon" icon={faSun} />
              ) : (
                <FontAwesomeIcon className="icon" icon={faMoon} />
              )}
              <h4>Theme Setting's</h4>
            </div>

            <div className="setDefaultTheme">
              <p>Set Your Default Theme :</p>

              <div className="choice">
                <button
                  className="dark"
                  onClick={() => changeTheme(dispatch, userId, true)}
                >
                  <FontAwesomeIcon className="icon" icon={faMoon} />
                  Dark
                </button>
                <button
                  className="light"
                  onClick={() => changeTheme(dispatch, userId, false)}
                >
                  <FontAwesomeIcon className="icon" icon={faSun} />
                  Light
                </button>
              </div>
            </div>
          </div>
          <div className="settings-sections">
            <div className="heading">
              <FontAwesomeIcon icon={faBullhorn} className="icon" />
              <h4>Privacy Policy</h4>
            </div>

            <div className="privacy">
              <p>
                Want to know more about our privacy policy! Head towards our
                Privacy Policy Section to know more about our initatives to make
                your data more protected.
              </p>

              <Link to="/privacypolicy">
                <button>Read more about our Privacy Policy</button>
              </Link>
            </div>
          </div>

          <div className="settings-sections">
            <div className="heading">
              <FontAwesomeIcon icon={faBullhorn} className="icon" />
              <h4>Terms and Conditions</h4>
            </div>

            <div className="termsandconditions">
              <p>
                Want to know more about our terms and conditions! Head towards
                our Terms and Conditions Section to know more about the terms
                you are aggering upon.
              </p>

              <Link to="/termsandconditions">
                <button>Read more about our Terms and Conditions</button>
              </Link>
            </div>
          </div>
        </MiddleSection>

        <LowerSection>
          <div className="settings-sections">
            <div className="heading">
              <FontAwesomeIcon icon={faSkullCrossbones} className="icon" />
              <h4>Caution Zone</h4>
            </div>

            <div className="options">
              <button onClick={signOut}>Logout</button>
              {!confirmDelete && (
                <button onClick={() => user && setConfirmDelete(true)}>
                  Delete Account
                </button>
              )}
              {confirmDelete && (
                <button onClick={() => user && deleteUser(dispatch, user._id)}>
                  Confirm Delete
                </button>
              )}
            </div>
          </div>
        </LowerSection>
      </MainContainer>
    </>
  );
};

export default Settings;
