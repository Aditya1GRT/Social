import {
  faAngleDown,
  faCircleNodes,
  faPenToSquare,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { motion } from "framer-motion";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import styled from "styled-components";
import NavBar from "../components/NavBar";
import Post from "../components/Post";
import { follow, unfollow, unsendFollowReq } from "../redux/API Calls/apiCalls";
import {
  getUserPosts,
  getUserProfile,
} from "../redux/API Calls/profileApiCalls";
import { publicRequest } from "../requestMethods";

const MainSection = styled(motion.div)`
  height: 98%;
  width: 100%;
  padding: 0 40px 0;
  overflow-y: scroll;
  @media (max-width: 1000px) {
    margin: 0 0px;
    padding: 15px 50px;
    width: calc(100% - 100px);
    margin-bottom: 20px;
    overflow-y: scroll;
  }
  @media (max-width: 475px) {
    margin: 0 0px;
    padding: 15px;
    width: calc(100% - 30px);
    margin-bottom: 20px;
    overflow-y: scroll;
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

  .top {
    display: flex;
    justify-content: flex-start;
    align-items: center;

    background: ${(props) =>
      props.themeCurrent === "dark"
        ? `rgba(${props.theme.bodyRgba},.85)`
        : `rgba(${props.theme.bodyRgba},.6)`};
    padding: 20px 30px;
    margin: 0 0 10px;
    border-radius: 10px;
    border-bottom: 0.5px solid ${(props) => props.theme.accent};

    .image-container {
      height: 150px;
      width: 150px;
      border-radius: 50%;
      overflow: hidden;
      border: 1px solid ${(props) => props.theme.main};
      box-sizing: border-box;
      img {
        height: 100%;
        width: 100%;
        object-fit: cover;
      }
    }
    .details {
      flex: 1;
      height: 50px;
      margin-left: 15px;

      display: flex;
      flex-direction: column;
      align-items: flex-start;
      justify-content: center;

      h3 {
        font-size: 35px;
        color: ${(props) => `rgba(${props.theme.mainRgba}, .9)`};
        margin: 10px 0 10px 10px;
      }

      h5 {
        font-size: 22px;
        color: ${(props) => props.theme.accent};
        margin: 10px 0 10px 10px;
      }
    }

    .button {
      button {
        border: 1px solid ${(props) => props.theme.accent};
        background: transparent;
        padding: 10px 30px;
        border-radius: 30px;
        font-size: 15px;
        font-weight: 600;
        color: ${(props) => props.theme.accent};
        cursor: pointer;

        .icon {
          margin-right: 10px;
        }
      }
    }
    //
    @media (max-width: 1000px) {
      .image-container {
        width: 45px;
        height: 45px;
      }

      .details {
        flex: 7;
        width: 100%;
        h3 {
          font-size: 20px;
          margin-left: 0;
          margin-bottom: 0;
        }

        h5 {
          margin-left: 0;
          margin-top: 0;
          font-size: 15px;
        }
      }

      .button {
        /* width: 15%; */
        button {
          /* align-self: flex-end;
          width: 70%; */
          border: none;
          padding: 5px;
          font-size: 20px;
        }

        .icon {
          margin-right: 0;
        }
      }
    }
  }

  .middle {
    background: ${(props) =>
      props.themeCurrent === "dark"
        ? `rgba(${props.theme.bodyRgba},.85)`
        : `rgba(${props.theme.bodyRgba},.6)`};
    padding: 20px 30px;
    margin: 10px 0;
    border-radius: 10px;
    border-bottom: 0.5px solid ${(props) => props.theme.accent};

    h4 {
      font-size: 35px;
      color: ${(props) => `rgba(${props.theme.mainRgba}, .9)`};
    }

    p {
      font-size: 16px;
      font-weight: 600;
      color: ${(props) => `rgba(${props.theme.mainRgba}, .7)`};
      /* color: ${(props) => props.theme.text}; */
    }

    @media (max-width: 1000px) {
      h4 {
        font-size: 20px;
      }

      p {
        font-size: 13px;
        line-height: 18.5px;
      }
    }
  }

  .lower {
    background: ${(props) =>
      props.themeCurrent === "dark"
        ? `rgba(${props.theme.bodyRgba},.85)`
        : `rgba(${props.theme.bodyRgba},.6)`};
    padding: 20px 30px;
    margin: 10px 0;
    border-radius: 10px;
    border-bottom: 0.5px solid ${(props) => props.theme.accent};

    display: flex;
    justify-content: space-evenly;
    align-items: center;
    text-align: center;

    h3 {
      font-size: 25px;
      color: ${(props) => `rgba(${props.theme.mainRgba}, .9)`};
    }

    p {
      font-size: 18px;
      font-weight: 600;
      color: ${(props) => `rgba(${props.theme.mainRgba}, .7)`};
    }

    @media (max-width: 1000px) {
      /* padding: 5px; */
      justify-content: space-between;
      h3 {
        font-size: 16px;
      }

      p {
        font-size: 14px;
      }
    }
  }

  .hiddenSection {
    background: ${(props) =>
      props.themeCurrent === "dark"
        ? `rgba(${props.theme.bodyRgba},.85)`
        : `rgba(${props.theme.bodyRgba},.6)`};
    padding: 20px 40px;
    margin: 10px 0;
    border-radius: 10px;
    border-bottom: 0.5px solid ${(props) => props.theme.accent};
    height: max-content;
    overflow: hidden;

    .backIcon {
      color: ${(props) => props.theme.main};
      font-size: 30px;
      text-align: center;
      .icon {
        transition: transform 0.25s ease-in-out;
        &:hover {
          transform: rotate(180deg);
          color: ${(props) => props.theme.accent};
        }
      }
    }

    .static {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 10px;
      border-bottom: 1px solid
        ${(props) =>
          props.themeCurrent === "dark"
            ? `rgba(${props.theme.mainRgba},.85)`
            : `rgba(${props.theme.mainRgba},.6)`};

      div {
        width: 100%;
        text-align: center;

        h3 {
          font-size: 25px;
          cursor: pointer;
        }
        .active {
          color: ${(props) => props.theme.accent};
        }
      }
    }

    .dynamic {
      height: 100%;
      overflow-y: scroll;
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
    }
  }
`;

const User = ({ themeCurrent }) => {
  const username = useLocation().pathname.split("/")[2];
  const currentUser = useSelector((state) => state.user.currentUser);
  const dispatch = useDispatch();
  const isFetching = useSelector(
    (state) => state.profile.isFetching && state.user.isFetching
  );
  let user = useSelector((state) =>
    state.profile.user ? state.profile.user : {}
  );
  const postsList = useSelector((state) => state.profile.posts);
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [postMod, setPostMod] = useState(0);
  const [onHide, setOnHide] = useState(true);
  const [onFollowers, setOnFollowers] = useState(true);
  let reqSent = [];
  if (currentUser) {
    reqSent = currentUser.reqSent;
  }
  const pendingRequest = reqSent.includes(user._id);

  const fetchUser = async () => {
    await getUserProfile(dispatch, username);
    await fetchFollowing();
    await fetchFollowers();
  };

  const checkFollowing = () => {
    if (user._id !== currentUser._id) {
      let check = false;
      user.followers.forEach((follower) => {
        if (follower === currentUser._id) {
          check = true;
        }
      });
      check ? setIsFollowing(true) : setIsFollowing(false);
    } else setIsFollowing(true);
  };

  const fetchFollowers = async () => {
    const { data } = await publicRequest.get(`users/followers/${username}`);

    setFollowers(data);
  };

  const fetchFollowing = async () => {
    const { data } = await publicRequest.get(`users/friends/${username}`);

    setFollowing(data);
  };

  useEffect(() => {
    fetchUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [username, postMod]);

  useEffect(() => {
    checkFollowing();
    getUserPosts(dispatch, user);
    if (postMod !== 0) setPostMod(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [postMod, user._id]);

  useEffect(() => {
    setPosts([...postsList]);
  }, [postsList, postMod]);
  return (
    <>
      <NavBar themeCurrent={themeCurrent} />
      <MainSection
        themeCurrent={themeCurrent}
        initial={{ x: 100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ type: "spring", duration: 1.2, delay: 0.2 }}
      >
        <div className="top">
          <div className="image-container">
            <img
              src={
                user.profilePicture
                  ? user.profilePicture
                  : "https://www.freeiconspng.com/thumbs/login-icon/user-login-icon-14.png"
              }
              alt=""
            />
          </div>

          <div className="details">
            <h3>{user.name}</h3>
            <h5>{user.username}</h5>
          </div>

          <div className="button">
            {isFetching && (
              <button>
                <FontAwesomeIcon className="loader" icon={faCircleNodes} />
              </button>
            )}

            {!isFetching && user._id === currentUser._id && (
              <button
                onClick={() =>
                  navigate(`/profile/edit`, {
                    replace: true,
                  })
                }
              >
                <FontAwesomeIcon icon={faPenToSquare} className="icon" />
                Edit
              </button>
            )}

            {!isFetching && user._id !== currentUser._id && (
              <button
                onClick={() =>
                  isFollowing
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
          </div>
        </div>

        {user.description && (
          <div className="middle">
            <h4>Bio</h4>
            <p>{user.description}</p>
          </div>
        )}

        <div className="lower">
          <div
            className="posts"
            style={{ cursor: "pointer" }}
            onClick={() => {
              setOnHide(true);
            }}
          >
            <h3>Posts</h3>
            <p>{posts.length}</p>
          </div>

          <div
            className="followers"
            style={{ cursor: "pointer" }}
            onClick={() => {
              setOnHide(false);
              setOnFollowers(true);
            }}
          >
            <h3>Followers</h3>
            <p>{followers.length}</p>
          </div>

          <div
            className="following"
            style={{ cursor: "pointer" }}
            onClick={() => {
              setOnHide(false);
              setOnFollowers(false);
            }}
          >
            <h3>Following</h3>
            <p>{following.length}</p>
          </div>
        </div>

        {onHide && isFollowing && isFetching && (
          <>
            <FontAwesomeIcon className="spinner" icon={faCircleNodes} />
          </>
        )}
        {onHide && isFollowing && !isFetching && (
          <>
            {posts.map((post) => (
              <Post
                themeCurrent={themeCurrent}
                post={post}
                key={post._id}
                setPostMod={setPostMod}
              />
            ))}
          </>
        )}

        {!onHide && (
          <div className="hiddenSection">
            <div className="backIcon">
              <FontAwesomeIcon
                icon={faAngleDown}
                className="icon"
                onClick={() => setOnHide(true)}
              />
            </div>
            <div className="static">
              <div>
                <h3 className="active">
                  {onFollowers ? "Followers" : "Following"}
                </h3>
              </div>
            </div>

            <div className="dynamic">
              <ul>
                {onFollowers
                  ? followers.map((friend) => (
                      <li
                        key={friend._id}
                        onClick={() =>
                          navigate(`/user/${friend.username}`, {
                            replace: true,
                          })
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
                    ))
                  : following.map((friend) => (
                      <li
                        key={friend._id}
                        onClick={() =>
                          navigate(`/user/${friend.username}`, {
                            replace: true,
                          })
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
                    ))}
              </ul>
            </div>
          </div>
        )}
      </MainSection>
    </>
  );
};

export default User;
