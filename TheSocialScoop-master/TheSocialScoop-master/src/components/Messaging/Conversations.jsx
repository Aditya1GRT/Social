import {
  faCircleLeft,
  faMagnifyingGlass,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { motion } from "framer-motion";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import styled from "styled-components";
import { getUsers } from "../../redux/API Calls/apiCalls";
import {
  getConversations,
  newConversation,
} from "../../redux/API Calls/convoApiCalls";
import { publicRequest } from "../../requestMethods";

const UsersSectionWrapper = styled(motion.div)`
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
  }
  @media (max-width: 475px) {
    width: calc(100% - 70px);
    margin: 0px 15px;
  }

  h2 {
    margin: 10px 0px;
    color: ${(props) => props.theme.accent};
  }

  form {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin: 5px 0;
    /* height: 55px; */
    width: 95%;
    background-color: ${(props) => `rgba(${props.theme.mainRgba},0.1)`};
    padding: 15px 20px;
    border-radius: 30px;
    .searchIconBack {
      color: ${(props) => props.theme.accent};
    }

    input {
      background-color: transparent;
      border: none;
      outline: none;
      width: 90%;
      color: ${(props) => props.theme.main};

      &::placeholder {
        color: ${(props) => `rgba(${props.theme.mainRgba},0.4)`};
      }
    }
    button {
      background-color: transparent;
      border: none;
      outline: none;
      color: ${(props) => props.theme.main};
    }
  }
  .userList {
    width: 100%;
    flex: 1;
    overflow-y: scroll;
  }

  .userDiv {
    display: flex;
    align-items: center;
    justify-content: flex-start;
    margin: 5px 0;
    padding: 10px 0;
    height: 55px;
    width: 100%;
    cursor: pointer;

    .userImg {
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
      }
    }

    .userInfo {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      justify-content: center;
      margin-left: 20px;
      color: ${(props) => props.theme.main};

      h3 {
        font-size: 20px;
      }

      p {
        margin: 0;
        margin-top: 5px;
        font-size: 13.5px;
        color: ${(props) => props.theme.text};
      }
    }
  }
`;

const Conversations = ({ themeCurrent, users, setUsers, setOpenConvo }) => {
  const [searchFocus, setSearchFocus] = useState(false);
  const [query, setQuery] = useState("");
  const [userList, setUserList] = useState([]);
  const [newUser, setnewUser] = useState("");

  const dispatch = useDispatch();
  const { _id: userId } = useSelector((state) => state.user.currentUser);

  const getConvo = () => {
    getConversations(dispatch, userId);
  };

  useEffect(() => {
    getConvo();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const conversations = useSelector(
    (state) => state.conversations.conversations
  );

  const getDetails = async (userIds) => {
    console.log(userIds);
    if (userIds.length > 0) {
      const userDetails = await getUsers(dispatch, userIds);
      setUsers(userDetails);
    } else setUsers([]);
  };

  const setConversation = async (id, userId) => {
    const selectedConvo = conversations.find((convo) =>
      convo.members.find((userId) => userId === id)
    );
    console.log("selectedConvo", selectedConvo);
    if (!selectedConvo) {
      await newConversation(dispatch, userId, id);
      const { data } = await publicRequest.get(`users/${query}`);
      setUserList(data);
    } else setOpenConvo(selectedConvo);
  };

  useEffect(() => {
    if (newUser !== "") {
      setConversation(newUser, userId);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [users]);

  useEffect(() => {
    const userIds = !!conversations[0]?._id
      ? conversations.map((convo) => {
          if (convo.members[0] === userId) {
            return convo.members[1];
          } else {
            return convo.members[0];
          }
        })
      : [];
    getDetails(userIds);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversations, userId]);

  const showResults = async (e) => {
    e.preventDefault();
    if (!query) return setUsers({});
    const { data } = await publicRequest.get(`users/${query}`);
    setUserList(data);
  };
  return (
    <UsersSectionWrapper
      themeCurrent={themeCurrent}
      initial={{ x: 100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ type: "spring", duration: 1.2, delay: 0.2 }}
    >
      <h2>Conversations</h2>
      <form
        onSubmit={(e) => showResults(e)}
        onFocus={() => setSearchFocus(true)}
      >
        {searchFocus && (
          <FontAwesomeIcon
            className="searchIconBack"
            icon={faCircleLeft}
            onClick={() => setSearchFocus(false)}
          />
        )}
        <input
          type="text"
          onChange={(e) => setQuery(e.target.value)}
          value={query}
        />
        <button type="submit">
          <FontAwesomeIcon className="searchIcon" icon={faMagnifyingGlass} />
        </button>
      </form>
      {searchFocus && (
        <div className="userList">
          {Object.keys(userList).length ? (
            Object.keys(userList)
              .filter((key) => userList[key]._id !== userId)
              .map((key) => {
                return (
                  <div
                    className="userDiv"
                    key={userList[key].userId}
                    onClick={() => {
                      setConversation(userList[key]._id, userId);
                      setnewUser(userList[key]._id);
                    }}
                  >
                    <div className="userImg">
                      <img
                        src={
                          userList[key].profilePicture
                            ? userList[key].profilePicture
                            : "https://www.freeiconspng.com/thumbs/login-icon/user-login-icon-14.png"
                        }
                        alt=""
                      />
                    </div>
                    <div className="userInfo">
                      <h3>{userList[key].name}</h3>
                      <p>{userList[key].username}</p>
                    </div>
                  </div>
                );
              })
          ) : query === "" ? (
            <p>Search for a friend.</p>
          ) : (
            ""
          )}
        </div>
      )}
      {!searchFocus && (
        <div className="userList">
          {users &&
            users?.map((user) => {
              return (
                <div
                  className="userDiv"
                  key={user.userId}
                  onClick={() => {
                    // console.log(user.userId);
                    return setConversation(user.userId);
                  }}
                >
                  <div className="userImg">
                    <img
                      src={
                        user.profilePicture
                          ? user.profilePicture
                          : "https://www.freeiconspng.com/thumbs/login-icon/user-login-icon-14.png"
                      }
                      alt=""
                    />
                  </div>
                  <div className="userInfo">
                    <h3>{user.name}</h3>
                    <p>{user.username}</p>
                  </div>
                </div>
              );
            })}
        </div>
      )}
    </UsersSectionWrapper>
  );
};

export default Conversations;
