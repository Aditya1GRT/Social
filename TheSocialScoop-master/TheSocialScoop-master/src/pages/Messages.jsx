import React, { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { io } from "socket.io-client";
import Chat from "../components/Messaging/Chat";
import Conversations from "../components/Messaging/Conversations";
import NavBar from "../components/NavBar";

const Messages = ({ themeCurrent }) => {
  const currentUser = useSelector((state) => state.user.currentUser);

  const [users, setUsers] = useState([]);
  const [openConvo, setOpenConvo] = useState(null);
  const [arrivalMessage, setArrivalMessage] = useState(null);
  const socket = useRef();

  useEffect(() => {
    socket.current = io("https://social-scoop-socket-server.onrender.com", {
      transports: ["websocket"],
    });

    socket.current.on("getMessage", (data) =>
      setArrivalMessage({
        senderId: data.senderId,
        message: data.message,
      })
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    socket.current.emit("addUser", currentUser._id);
    socket.current.on("getUsers", (users) => console.log(users));
  }, [currentUser]);

  return (
    <>
      <NavBar themeCurrent={themeCurrent} />
      {openConvo && (
        <Chat
          themeCurrent={themeCurrent}
          openConvo={openConvo}
          users={users}
          arrivalMessage={arrivalMessage}
          socket={socket}
          setOpenConvo={setOpenConvo}
        />
      )}
      {!openConvo && (
        <Conversations
          themeCurrent={themeCurrent}
          users={users}
          setUsers={setUsers}
          setOpenConvo={setOpenConvo}
        />
      )}
    </>
  );
};

export default Messages;
