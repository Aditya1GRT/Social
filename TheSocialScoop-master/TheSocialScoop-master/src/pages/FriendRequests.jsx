import { faCircleNodes } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { motion } from "framer-motion";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import NavBar from "../components/NavBar";
import {
  approveFollowRequest,
  getUsers,
  rejectFollowRequest,
  unsendFollowReq,
} from "../redux/API Calls/apiCalls";

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
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  border-radius: 30px;
  overflow-x: hidden;

  @media (max-width: 1300px) {
    padding: 30px;
  }
  @media (max-width: 1000px) {
    margin-left: 0;
    padding: 20px;
    margin: 0 40px;
    width: calc(100% - 120px);
    margin-bottom: 20px;
    overflow-y: scroll;
  }
  @media (max-width: 475px) {
    width: calc(100% - 70px);
    margin: 0px 15px;
  }

  @keyframes rotation {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }

  .spinner {
    margin: auto;
    animation: rotation 1.5s infinite linear;
    height: 30px;
    color: ${(props) => props.theme.accent};
  }
  .heading {
    margin: 10px 0px;
    width: 100%;
    color: ${(props) => props.theme.text};
    display: flex;
    align-items: center;
    justify-content: space-around;
    h2 {
      cursor: pointer;
      text-decoration: underline;
    }
    .reqRecieved {
      color: ${(props) => props.showRecieved && props.theme.accent};
    }
    .reqSent {
      color: ${(props) => !props.showRecieved && props.theme.accent};
    }
  }

  ul {
    width: 100%;
    padding: 0;
    li {
      list-style: none;
      height: 75px;
      margin: 15px 0;
      width: 100%;

      display: flex;
      justify-content: space-between;
      align-items: center;
      cursor: pointer;

      .profilePicture {
        height: 50px;
        width: 50px;
        margin-right: 10px;
        border-radius: 50%;
        overflow: hidden;
        border: 1px solid ${(props) => props.theme.main};
        box-sizing: border-box;
        img {
          height: 100%;
          width: 100%;
          object-fit: cover;
          cursor: pointer;
        }
      }

      .details {
        margin-left: 5px;
        font-size: 15px;
        flex: 1;
      }

      .btn {
        button {
          /* width: 100%; */
          border: ${(props) =>
            !props.isFollowing ? "none" : ` 1px solid ${props.theme.accent}`};
          border-radius: 30px;
          font-size: 15px;
          font-weight: 700;
          padding: 10px 30px;
          margin-right: 20px;
          background: ${(props) =>
            !props.isFollowing ? props.theme.accent : "transparent"};
          color: ${(props) =>
            !props.isFollowing ? props.theme.body : props.theme.accent};
          cursor: pointer;
        }

        .accept {
          background: transparent;
          border: 1px solid ${(props) => props.theme.accent};
          color: ${(props) => props.theme.accent};

          &:hover {
            background: ${(props) => props.theme.accent};
            color: ${(props) => props.theme.body};
            border: 1px solid ${(props) => props.theme.accent};
          }
        }

        .reject {
          background: transparent;
          border: 1px solid #f72727;
          color: #f72727;

          &:hover {
            background: #f72727;
            color: ${(props) => props.theme.main};
            border: 1px solid #f72727;
          }
        }

        @media (max-width: 1000px) {
          margin-right: 5px;
          width: min-content;

          button {
            border-radius: 30px;
            font-size: 11px;
            padding: 8px 30px;
          }
          .accept {
            margin-bottom: 3px;
          }
        }

        /* @media (max-width: 350px) {
          display: flex;
          justify-content: center;
          align-items: center;

          button {
            margin-right: 5px;
            padding: 10px 15px;
          }
        } */
      }

      &::after {
        content: "";
        background-color: ${(props) => `rgba(${props.theme.mainRgba}, .3)`};
        top: 0;
        right: 0;
        height: 70%;
        width: 2px;
      }

      &:hover {
        .profilePicture {
          border: 1px solid ${(props) => `${props.theme.accent}`};
        }
        .details {
          color: ${(props) => `${props.theme.main}`};
        }
        &::after {
          background-color: ${(props) => `${props.theme.accent}`};
        }
      }
    }
  }
`;

const FriendRequests = ({ themeCurrent }) => {
  const {
    _id: userId,
    reqSent,
    reqRecieved,
  } = useSelector((state) => state.user.currentUser);
  const nav = useNavigate();
  const isFetching = useSelector((state) => state.user.isFetching);
  const [userList, setUserList] = useState([]);
  const [showRecieved, setShowRecieved] = useState(true);
  const dispatch = useDispatch();
  const fetchUsers = async () => {
    try {
      // const res = await getFriends(dispatch, username);

      const res = await getUsers(
        dispatch,
        showRecieved ? reqRecieved : reqSent
      );
      setUserList(res);
    } catch (error) {
      console.log(error.message);
    }
  };
  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showRecieved, reqSent, reqRecieved]);

  return (
    <>
      <NavBar themeCurrent={themeCurrent} />
      <MainContainer
        themeCurrent={themeCurrent}
        showRecieved={showRecieved}
        initial={{ x: 100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ type: "spring", duration: 1.2, delay: 0.2 }}
      >
        <div className="heading">
          <h2 className="reqRecieved" onClick={() => setShowRecieved(true)}>
            Follow Requests
          </h2>
          <h2 className="reqSent" onClick={() => setShowRecieved(false)}>
            Sent Requests
          </h2>
        </div>
        <>
          <ul>
            {isFetching && (
              <FontAwesomeIcon className="spinner" icon={faCircleNodes} />
            )}
            {!isFetching &&
              userList.length > 0 &&
              userList.map((user) => (
                <li key={user.userId}>
                  <div
                    className="profilePicture"
                    onClick={() =>
                      nav(`/user/${user.username}`, { replace: true })
                    }
                  >
                    <img
                      src={
                        user.profilePicture
                          ? user.profilePicture
                          : "https://www.freeiconspng.com/thumbs/login-icon/user-login-icon-14.png"
                      }
                      alt=""
                    />
                  </div>
                  <div
                    className="details"
                    onClick={() =>
                      nav(`/user/${user.username}`, { replace: true })
                    }
                  >
                    {user.name}
                  </div>
                  <div className="btn">
                    {showRecieved && (
                      <>
                        <button
                          onClick={() =>
                            approveFollowRequest({
                              dispatch,
                              userId: userId,
                              id: user.userId,
                            })
                          }
                          className="accept"
                        >
                          Accept
                        </button>
                        <button
                          onClick={() =>
                            rejectFollowRequest({
                              dispatch,
                              userId: userId,
                              id: user.userId,
                            })
                          }
                          className="reject"
                        >
                          Reject
                        </button>
                      </>
                    )}
                    {!showRecieved && (
                      <>
                        <button
                          onClick={() =>
                            unsendFollowReq({
                              dispatch,
                              userId: userId,
                              id: user.userId,
                            })
                          }
                        >
                          Requested
                        </button>
                      </>
                    )}
                  </div>
                </li>
              ))}
            {!isFetching && userList.length === 0 && <li>No requests!</li>}
          </ul>
        </>
      </MainContainer>
    </>
  );
};
export default FriendRequests;
