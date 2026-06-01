import { faCircleNodes } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import {
  follow,
  unfollow,
  unsendFollowReq,
} from "../../redux/API Calls/apiCalls";

const UserWrapper = styled.div`
  width: 95%;
  padding: 10px;
  margin: 10px 0;
  background: ${(props) =>
    props.themeCurrent === "dark"
      ? `rgba(${props.theme.bodyRgba},.5)`
      : `rgba(${props.theme.bodyRgba},.5)`};
  color: ${(props) => props.theme.accent};
  border-radius: 10px;
  border-top: 1px solid rgba(255, 255, 255, 0.5);
  border-left: 1px solid rgba(255, 255, 255, 0.5);

  display: flex;
  justify-content: space-between;
  align-items: flex-start;

  &:hover {
    background: ${(props) =>
      props.themeCurrent === "dark"
        ? `rgba(${props.theme.bodyRgba},.3)`
        : `rgba(${props.theme.bodyRgba},.3)`};
  }

  @media (max-width: 1000px) {
    width: 100%;
    padding: 5px;
  }
`;

const Left = styled.div`
  flex: 1;
  align-self: center;
  margin-left: 15px;

  .profilePicture {
    height: 50px;
    width: 50px;
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
  @media (max-width: 1000px) {
    margin-left: 5px;
    .profilePicture {
      height: 35px;
      width: 35px;
    }
  }
`;

const Center = styled.div`
  flex: 5;

  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
  cursor: pointer;

  h4 {
    font-size: 20px;
    margin-right: 15px;
  }

  @media (max-width: 1000px) {
    margin-left: 15px;

    h4 {
      width: 100%;
      font-size: 15px;
      margin-right: 0;
    }

    p {
      font-size: 10px;
    }
  }
`;

const Right = styled.div`
  flex: 1;

  display: flex;
  justify-content: center;
  align-items: center;
  align-self: center;

  @keyframes rotation {
    0% {
      transform: rotate(0deg);
    }

    100% {
      transform: rotate(360deg);
    }
  }

  .loader {
    animation: rotation 1.5s infinite linear;
  }

  button {
    /* width: 100%; */
    border: ${(props) =>
      !props.isFollowing ? "none" : ` 1px solid ${props.theme.accent}`};
    border-radius: 30px;
    font-size: 15px;
    font-weight: 700;
    padding: 10px 30px;
    background: ${(props) =>
      !props.isFollowing ? props.theme.accent : "transparent"};
    color: ${(props) =>
      !props.isFollowing ? props.theme.body : props.theme.accent};
    cursor: pointer;
  }
  @media (max-width: 1000px) {
    margin-right: 5px;

    button {
      /* width: 100%; */
      border-radius: 30px;
      font-size: 11px;
      padding: 10px 30px;
    }
  }
`;

const Users = ({ user }) => {
  const currentUser = useSelector((state) => state.user.currentUser);
  let following = [];
  let reqSent = [];
  if (currentUser) {
    following = currentUser.following;
    reqSent = currentUser.reqSent;
  }
  const dispatch = useDispatch();
  const isFetching = useSelector((state) => state.user.isFetching);
  const navigate = useNavigate();
  const isFollowing = following.includes(user._id);
  const pendingRequest = reqSent.includes(user._id);

  return (
    <UserWrapper>
      <Left
        onClick={() => navigate(`/user/${user.username}`, { replace: true })}
      >
        <div className="profilePicture">
          <img
            src={
              user.profilePicture
                ? user.profilePicture
                : "https://www.freeiconspng.com/thumbs/login-icon/user-login-icon-14.png"
            }
            alt=""
          />
        </div>
      </Left>
      <Center
        onClick={() => navigate(`/user/${user.username}`, { replace: true })}
      >
        <h4>{user.name}</h4>
        <p>({user.username})</p>
      </Center>
      <Right isFollowing={isFollowing}>
        {isFetching && (
          <button>
            <FontAwesomeIcon className="loader" icon={faCircleNodes} />
          </button>
        )}
        {!isFetching && (
          <button
            onClick={() =>
              !currentUser
                ? navigate("/login", { replace: true })
                : isFollowing
                ? unfollow({
                    dispatch,
                    userId: currentUser._id,
                    id: user._id,
                  })
                : pendingRequest
                ? unsendFollowReq({
                    dispatch,
                    userId: currentUser._id,
                    id: user._id,
                  })
                : follow({
                    dispatch,
                    userId: currentUser._id,
                    id: user._id,
                  })
            }
          >
            {isFollowing
              ? "Following"
              : pendingRequest
              ? "Requested"
              : "Follow"}
          </button>
        )}
      </Right>
    </UserWrapper>
  );
};

export default Users;
