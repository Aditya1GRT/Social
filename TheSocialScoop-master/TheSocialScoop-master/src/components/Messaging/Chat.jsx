import { faCircleLeft, faPaperPlane } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { motion } from "framer-motion";
import React, { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import styled from "styled-components";
import { publicRequest } from "../../requestMethods";
import Message from "./Message";

const ChatSectionWrapper = styled(motion.div)`
  box-shadow: 20px 20px 50px rgba(0, 0, 0, 0.5);
  border-top: 1px solid rgba(255, 255, 255, 0.5);
  border-left: 1px solid rgba(255, 255, 255, 0.5);
  z-index: 1;
  background: transparent;
  /* box-sizing: border-box; */
  position: relative;
  background: ${(props) =>
    props.themeCurrent === "dark"
      ? `rgba(${props.theme.bodyRgba},.85)`
      : `rgba(${props.theme.bodyRgba},.6)`};
  height: calc(90% + 60px);
  width: 90%;
  margin: 0 40px;
  border-radius: 30px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  @media (max-width: 1000px) {
    width: calc(100% - 80px);
    margin: 30px 40px 0;
  }

  @media (max-width: 475px) {
    width: calc(100% - 30px);
    margin: 20px 15px 0;
  }

  .top-section {
    width: 95%;
    padding: 25px 0 15px;
    display: flex;
    align-items: center;
    justify-content: flex-start;
    color: ${(props) => props.theme.accent};

    h2 {
      padding-left: 15px;
      cursor: pointer;
    }

    .backIcon {
      padding-left: 5px;
      height: 20px;
      cursor: pointer;
    }
  }

  .chat-section {
    height: calc(100% - 90px);
    width: 95%;
    overflow-y: scroll;
    margin: 0 30px;
    display: flex;
    justify-content: flex-start;
    align-items: flex-start;
    flex-direction: column;
    padding: 40px 20px;

    .messages-container {
      width: 100%;
    }

    @media (max-width: 1250px) {
      padding: 40px 0px;
    }
  }

  .lower-section {
    height: 100px;
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    box-shadow: ${(props) =>
      `0px -5px 15px 5px rgba(${props.theme.mainRgba},.15)`};
    transition: all 0.2s ease;

    @media (max-width: 1000px) {
      height: 60px;
      font-size: 12px;
    }
    .msgInput {
      width: 80%;
      background: transparent;
      border: none;
      padding: 20px;
      color: #ffffff;
      outline: none;
      margin: 0 20px;
      font-size: 17px;
      color: ${(props) => props.theme.main};

      @media (max-width: 1000px) {
        padding: 10px;
        font-size: 12px;
      }

      &::placeholder {
        color: #555;
      }
    }

    .sendBtn {
      border: none;
      padding: 15px 60px;
      border-radius: 30px;
      margin: 20px;
      background-color: ${(props) => props.theme.accent};
      color: ${(props) => props.theme.body};
      @media (max-width: 1000px) {
        padding: 10px 40px;
        font-size: 12px;
      }
    }
  }
`;

const Chat = ({
  themeCurrent,
  openConvo,
  users,
  arrivalMessage,
  socket,
  setOpenConvo,
}) => {
  const currentUser = useSelector((state) => state.user.currentUser);
  const reciver = users.find((user) =>
    openConvo.members.find((id) => id === user.userId)
  );

  const scrollRef = useRef(null);

  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");

  const sendMessage = async (e) => {
    e.preventDefault();

    if (newMessage.length === 0) return;

    const messageData = {
      message: newMessage,
      senderId: currentUser._id,
      conversationId: openConvo._id,
    };

    socket.current.emit("sendMessage", {
      reciverId: reciver.userId,
      senderId: currentUser._id,
      message: newMessage,
    });

    try {
      await publicRequest.post(`message/`, messageData);

      setMessages([...messages, messageData]);
      setNewMessage("");
    } catch (error) {
      console.log(error);
    }
  };

  const fetchMessages = async () => {
    try {
      const { data } = await publicRequest.get(`message/${openConvo._id}`);

      setMessages(data);
      setNewMessage("");
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    arrivalMessage &&
      openConvo?.members.includes(arrivalMessage.senderId) &&
      setMessages((prev) => [...prev, arrivalMessage]);
  }, [arrivalMessage, openConvo]);

  useEffect(() => {
    fetchMessages();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openConvo]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <ChatSectionWrapper
      themeCurrent={themeCurrent}
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: "spring", duration: 1.2, delay: 0.2 }}
    >
      <div className="top-section">
        <FontAwesomeIcon
          className="backIcon"
          icon={faCircleLeft}
          onClick={() => setOpenConvo(false)}
        />
        <h2 onClick={() => setOpenConvo(false)}>{reciver.name}</h2>
      </div>
      <div className="chat-section">
        {messages ? (
          messages.map((messageObj) => (
            <div className="messages-container" ref={scrollRef}>
              <Message
                key={messageObj._id}
                userPic={
                  currentUser._id === messageObj.senderId
                    ? currentUser.profilePicture
                      ? currentUser.profilePicture
                      : "https://www.freeiconspng.com/thumbs/login-icon/user-login-icon-14.png"
                    : reciver.profilePicture
                    ? reciver.profilePicture
                    : "https://www.freeiconspng.com/thumbs/login-icon/user-login-icon-14.png"
                }
                themeCurrent={themeCurrent}
                own={currentUser._id === messageObj.senderId ? true : false}
                message={messageObj.message}
              />
            </div>
          ))
        ) : (
          <p>No chat yet!</p>
        )}
      </div>

      <form onSubmit={(e) => sendMessage(e)} className="lower-section">
        <input
          type="text"
          placeholder="Enter your message..."
          className="msgInput"
          onChange={(e) => setNewMessage(e.target.value)}
          value={newMessage}
        />
        <button className="sendBtn">
          <FontAwesomeIcon icon={faPaperPlane} />
        </button>
      </form>
    </ChatSectionWrapper>
  );
};

export default Chat;
