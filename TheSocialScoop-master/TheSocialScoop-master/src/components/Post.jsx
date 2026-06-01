import {
  faComments,
  faEllipsisV,
  faExclamationTriangle,
  faHeart,
  faTrash,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useEffect, useRef, useState } from "react";
import styled from "styled-components";
import { useDispatch, useSelector } from "react-redux";
import { deletePost, postReaction } from "../redux/API Calls/postApiCalls";
import CommentList from "./CommentList";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const PostContainer = styled(motion.div)`
  box-shadow: 20px 20px 50px rgba(0, 0, 0, 0.5);
  border-top: 1px solid rgba(255, 255, 255, 0.5);
  border-left: 1px solid rgba(255, 255, 255, 0.5);
  z-index: 1;
  background: ${(props) =>
    props.themeCurrent === "dark"
      ? `rgba(${props.theme.bodyRgba},.85)`
      : `rgba(${props.theme.bodyRgba},.6)`};
  border-radius: 30px;
  margin-top: 30px;
  padding: 30px 40px;
  width: 100%;
  height: max-content;
  height: ${(props) =>
    props.showComments ? "500px" : props.showMedia ? "500px" : "max-content"};
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  box-sizing: border-box;
  @media (max-width: 1300px) {
    height: ${(props) => (props.showComments ? "500px" : "max-content")};
    padding: 20px;
  }
`;

const BottomSection = styled.div`
  width: 100%;
  height: calc(100% - 70px);
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-sizing: border-box;
  @media (max-width: 1300px) {
    flex-direction: column;
  }
  @media (max-width: 550px) {
    padding: 10px 0;
  }
`;

const TopSection = styled.div`
  height: 70px;
  width: 100%;
  padding: 0 0 30px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-sizing: border-box;
  position: relative;
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
  .left {
    height: 100%;
    display: flex;
    align-items: center;
    cursor: pointer;
    img {
      height: 100%;
      aspect-ratio: 1/1;
      object-fit: cover;
      border-radius: 50%;
    }
    h3 {
      margin-left: 10px;
    }
    p {
      margin-left: 10px;
      font-weight: 100;
    }
  }
`;

const Media = styled.div`
  width: 65%;
  height: 100%;
  margin-right: 60px;
  position: relative;
  display: ${(props) => (props.showMedia ? "block" : "none")};

  &::after {
    content: "";
    position: absolute;
    height: 100%;
    width: 1px;
    top: 0;
    right: -30px;
    background-color: ${(props) => `rgba(${props.theme.mainRgba},.3)`};
    @media (max-width: 1300px) {
      top: auto;
      right: auto;
      left: 0;
      bottom: -15px;
      width: 100%;
      height: 1px;
    }
  }
  .media {
    height: 100%;
    width: 100%;
    background-color: ${(props) => `rgba(${props.theme.mainRgba},.1)`};
    border-radius: 15px;
    object-fit: contain;
  }
  @media (max-width: 1300px) {
    width: 100%;
    height: 50%;
    margin-right: 0px;
    margin-bottom: 40px;
  }
`;
const SideContainer = styled.div`
  width: ${(props) => (props.showMedia ? "50%" : "100%")};
  height: 100%;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  @media (max-width: 1300px) {
    width: 100%;
    height: ${(props) => (props.showMedia ? "50%" : "100%")};
  }
`;

const Caption = styled.div`
  width: 100%;
  max-height: 100%;
  overflow-y: scroll;
  box-sizing: border-box;
  box-sizing: border-box;
  margin-bottom: auto;
`;
const Responses = styled.div`
  width: 100%;
  height: 40px;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  margin-bottom: 0;
  margin-top: 30px;
`;
const Likes = styled.div`
  width: max-content;
  color: ${(props) =>
    props.likedByUser ? props.theme.accent : props.theme.text};
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: start;
  height: 40px;
  cursor: pointer;
  .likesIcon {
    height: 20px;
  }
  p {
    margin: 0;
    font-size: 12px;
    margin-top: 5px;
  }
`;
const Comments = styled.div`
  width: max-content;
  color: ${(props) => props.theme.text};
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: start;
  height: 40px;
  cursor: pointer;
  .commentsIcon {
    height: 20px;
  }
  p {
    margin: 0;
    font-size: 12px;
    margin-top: 5px;
  }
`;

const Post = ({ themeCurrent, post, setPostMod }) => {
  const [showOptions, setShowOptions] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const showMedia = post.postMedia === "null" ? false : true;
  const nav = useNavigate();
  const dispatch = useDispatch();
  const { _id: userId } = useSelector((state) => state.user.currentUser);
  const likedByUser = post.likes.includes(userId);
  const reaction = async () => {
    postReaction(dispatch, post, userId);
  };
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

  return (
    <PostContainer
      themeCurrent={themeCurrent}
      showMedia={showMedia}
      showComments={showComments}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ type: "spring", duration: 1.2, delay: 0.5 }}
    >
      <TopSection showOptions={showOptions}>
        <div
          className="left"
          onClick={() => nav(`/user/${post.username}`, { replace: true })}
        >
          <img
            src={
              post.profilePicture
                ? post.profilePicture
                : "https://www.freeiconspng.com/thumbs/login-icon/user-login-icon-14.png"
            }
            alt=""
          />
          <h3>{post.username}</h3> <p>{post.name}</p>
        </div>
        <FontAwesomeIcon
          style={{ cursor: "pointer", padding: "0 10px" }}
          icon={faEllipsisV}
          onClick={() => setShowOptions((p) => !p)}
        />
        <ul className="options" ref={optionRef}>
          <li
            onClick={() => deletePost(dispatch, post._id, userId)}
            style={{
              display: `${post.userId === userId ? "inlineBlock" : "none"}`,
            }}
          >
            <FontAwesomeIcon icon={faTrash} className="optionsIcon" />
            Delete
          </li>
          <li
            style={{
              display: `${post.userId !== userId ? "inlineBlock" : "none"}`,
            }}
          >
            <FontAwesomeIcon
              icon={faExclamationTriangle}
              className="optionsIcon"
            />
            Unfollow
          </li>
        </ul>
      </TopSection>

      {!showComments && (
        <BottomSection>
          <Media showMedia={showMedia}>
            {post.mediaType === "image" ? (
              <img className="media" src={post.postMedia} alt="" />
            ) : (
              <video
                className="media"
                width="320"
                height="240"
                controls
                muted
                autoPlay
                loop
              >
                <source src={post.postMedia} type="video/webm" />
                <source src={post.postMedia} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            )}
          </Media>
          <SideContainer showMedia={showMedia}>
            <>
              <Caption>{post.description}</Caption>
              <Responses>
                <Likes onClick={reaction} likedByUser={likedByUser}>
                  <FontAwesomeIcon className="likesIcon" icon={faHeart} />
                  <p>{`${post.likes.length} Likes`}</p>
                </Likes>
                <Comments onClick={() => setShowComments(true)}>
                  <FontAwesomeIcon className="commentsIcon" icon={faComments} />
                  <p>{`${
                    post.comments ? post.comments.length : "0"
                  } Comments`}</p>
                </Comments>
              </Responses>
            </>
          </SideContainer>
        </BottomSection>
      )}
      {showComments && (
        <CommentList
          setShowComments={setShowComments}
          post={post}
          setPostMod={setPostMod}
        />
      )}
    </PostContainer>
  );
};

export default Post;
