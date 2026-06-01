import React from "react";
import styled from "styled-components";

const Text = styled.div`
  display: flex;
  justify-content: ${(props) => (props.own ? "flex-end" : "flex-start")};
  align-items: center;
  width: 100%;

  .message {
    display: flex;
    flex-direction: ${(props) => (props.own ? "row-reverse" : "row")};
    justify-content: flex-start;
    align-items: flex-start;
    width: 75%;
  }

  .userImg {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    object-fit: cover;
    margin: 5px;
    cursor: pointer;
  }

  .text {
    background-color: ${(props) =>
      !props.own ? `rgba(${props.theme.bodyRgba},.5)` : props.theme.accent};
    color: ${(props) =>
      !props.own ? `rgba(${props.theme.mainRgba},.8)` : props.theme.body};
    border-radius: ${(props) =>
      !props.own ? "0 30px 30px 30px" : "30px 0 30px 30px"};
    padding: 15px 30px;
    font-weight: 200;
    margin-top: 25px;
    @media (max-width: 1000px) {
      padding: 10px 30px;
    }
  }
`;

const Message = ({ userPic, own, themeCurrent, message }) => {
  return (
    <Text own={own} themeCurrent={themeCurrent}>
      <div className="message">
        <img src={userPic} alt="" className="userImg" />
        <p className="text">{message}</p>
      </div>
    </Text>
  );
};

export default Message;
