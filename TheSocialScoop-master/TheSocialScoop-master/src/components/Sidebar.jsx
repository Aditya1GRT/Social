import { faCircleNodes } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import { getFriends } from "../redux/apiCalls";

const MainContainer = styled.div`
  box-shadow: 20px 20px 50px rgba(0, 0, 0, 0.5);
  border-top: 1px solid rgba(255, 255, 255, 0.5);
  border-left: 1px solid rgba(255, 255, 255, 0.5);
  z-index: 1;
  background: ${(props) =>
    props.themeCurrent === "dark"
      ? `rgba(${props.theme.bodyRgba},.7)`
      : `rgba(${props.theme.bodyRgba},.4)`};

  height: 90%;
  width: 10%;
  padding: 30px 50px;
  border-radius: 30px;
  overflow-y: scroll;
  flex-shrink: 0;
  margin-right: 40px;

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
  h2 {
    margin: 10px 0px;
    color: ${(props) => props.theme.accent};
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

  @media (max-width: 1445px) {
    width: 150px;
    padding: 30px 40px;
  }

  @media (max-width: 1000px) {
    height: 80%;
    width: 100%;
    flex-shrink: 1;
    padding: 10px 0px;
    margin-bottom: 30px;
    h2 {
      margin: 30px 30px 20px;
    }
  }
  @media (max-width: 1000px) {
    height: 85%;
    margin-bottom: 20px;
    display: none;
  }
`;

const Sidebar = ({ themeCurrent }) => {
  const username = useSelector((state) => state.user.currentUser.username);
  const nav = useNavigate();
  const isFetching = useSelector((state) => state.user.isFetching);
  const [friendsList, setFriendsList] = useState([]);
  const dispatch = useDispatch();
  const fetchFriends = async () => {
    try {
      const res = await getFriends(dispatch, username);
      setFriendsList(res);
    } catch (error) {
      console.log(error.message);
    }
  };
  useEffect(() => {
    fetchFriends();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <MainContainer themeCurrent={themeCurrent}>
      <h2>Your Homies</h2>
      <>
        <ul>
          {isFetching && (
            <FontAwesomeIcon className="spinner" icon={faCircleNodes} />
          )}
          {!isFetching &&
            friendsList.map((friend) => (
              // <Link to={`/user/${friend.username}`}>
              <li
                key={friend._id}
                onClick={() =>
                  nav(`/user/${friend.username}`, { replace: true })
                }
              >
                <div className="profilePicture">
                  <img
                    src={
                      friend.profilePicture
                        ? friend.profilePicture
                        : "https://www.freeiconspng.com/thumbs/login-icon/user-login-icon-14.png"
                    }
                    alt=""
                  />
                </div>
                <div className="details">{friend.name}</div>
              </li>
              // </Link>
            ))}
        </ul>
      </>
    </MainContainer>
  );
};

export default Sidebar;
