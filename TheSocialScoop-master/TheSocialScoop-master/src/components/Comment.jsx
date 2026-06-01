import { faEllipsisV, faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import { publicRequest } from "../requestMethods";

const CommentContainer = styled.div`
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 10px 0;
  background-color: ${(props) => `rgba(${props.theme.bodyRgba},.3)`};
  box-sizing: border-box;
  padding: 10px 20px;
  border-radius: 15px;
  position: relative;
  img {
    height: 100%;
    aspect-ratio: 1/1;
    object-fit: cover;
    border-radius: 50%;
    margin-right: 10px;
  }
  h5 {
    margin-right: 10px;
  }
  p {
    font-size: 12px;
    flex: 1;
  }
  .commentOption {
    padding-left: 20px;
    cursor: pointer;
  }
  .options {
    position: absolute;
    width: auto;
    top: 0;
    right: 5px;
    z-index: 10;
    list-style: none;
    padding: 10px 20px;
    font-size: 12px;
    border-radius: 5px;
    background: ${(props) => props.theme.body};
    display: ${(props) => (props.showOptions ? "block" : "none")};

    li {
      cursor: pointer;
    }
    .optionsIcon {
      margin-right: 10px;
      height: 12px;
    }
  }
`;
const Comment = ({ comment, post, setPostMod }) => {
  const [showOptions, setShowOptions] = useState(false);
  const nav = useNavigate();
  const { username } = useSelector((state) => state.user.currentUser);
  const optionRef = useRef(null);
  useEffect(() => {
    function handleClickOutside(event) {
      if (optionRef.current && !optionRef.current.contains(event.target)) {
        setShowOptions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [optionRef]);

  const deleteComment = async () => {
    await publicRequest.put(`/posts/delete-comment/${post._id}`, {
      commentId: comment.id,
    });
    setPostMod(4);
  };

  return (
    <CommentContainer showOptions={showOptions}>
      <img
        src={comment.profilePicture}
        alt=""
        onClick={() => nav(`/user/${comment.username}`, { replace: true })}
      />
      <h5 onClick={() => nav(`/user/${comment.username}`, { replace: true })}>
        {comment.username}
      </h5>
      <p>{comment.comment}</p>
      {(comment.username === username || username === post.username) && (
        <FontAwesomeIcon
          className="commentOption"
          icon={faEllipsisV}
          onClick={() => setShowOptions((p) => !p)}
        />
      )}
      <ul className="options" ref={optionRef}>
        <li
          onClick={deleteComment}
          style={{
            display: `${
              comment.username === username || username === post.username
                ? "inlineBlock"
                : "none"
            }`,
          }}
        >
          <FontAwesomeIcon icon={faTrash} className="optionsIcon" />
          Delete
        </li>
      </ul>
    </CommentContainer>
  );
};

export default Comment;
