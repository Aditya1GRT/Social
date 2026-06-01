import { motion } from "framer-motion";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import styled from "styled-components";
import { getPosts } from "../redux/API Calls/postApiCalls";
import MakePost from "./MakePost";
import Post from "./Post";
const MainContainer = styled(motion.div)`
  width: 100%;
  z-index: 1;
  height: 91.5%;
  padding: 10px 40px 40px;
  margin-left: 20px;
  overflow: hidden;
  position: relative;
  overflow-y: scroll;
  scroll-behavior: smooth;
  @media (max-width: 1400px) {
    margin-left: 20px;
  }
  @media (max-width: 1000px) {
    margin: 0 0px;
    padding: 5px 15px;
    width: calc(100% - 30px);
    border-top: 1px solid rgba(255, 255, 255, 0.5);
    border-bottom: 1px solid rgba(255, 255, 255, 0.5);
  }
`;
const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: start;
  width: 100%;
  z-index: 1;
  height: auto;
`;

const Feed = ({ themeCurrent }) => {
  const [posts, setPosts] = useState([]);
  const [postMod, setPostMod] = useState(0);
  const postsList = useSelector((state) => state.posts.postsList);
  const { _id: userId } = useSelector((state) => state.user.currentUser);
  const dispatch = useDispatch();
  useEffect(() => {
    getPosts(dispatch, userId);
    setPostMod(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [postMod]);

  useEffect(() => {
    setPosts([...postsList]);
  }, [postsList, postMod]);

  return (
    <MainContainer
      initial={{ x: 100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ type: "spring", duration: 1.2, delay: 0.2 }}
    >
      <Container>
        <MakePost themeCurrent={themeCurrent} setPostMod={setPostMod} />
        {posts.map((post) => (
          <Post
            themeCurrent={themeCurrent}
            post={post}
            key={post._id}
            setPostMod={setPostMod}
          />
        ))}
      </Container>
    </MainContainer>
  );
};

export default Feed;
