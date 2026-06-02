import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import styled from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleNodes } from '@fortawesome/free-solid-svg-icons';
import { getPosts } from '../redux/actions';
import MakePost from './MakePost';
import Post from './Post';

const FeedWrapper = styled.div`
  flex: 1;
  max-width: 620px;
  width: 100%;
  padding: 20px 16px;

  @media (max-width: 768px) {
    max-width: 100%;
    padding: 16px 12px;
  }
`;

const LoadingWrapper = styled.div`
  display: flex;
  justify-content: center;
  padding: 40px;
  color: ${({ theme }) => theme.accent};
  font-size: 28px;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 60px 20px;
  color: ${({ theme }) => theme.text};
  opacity: 0.7;
  font-size: 16px;
  background: rgba(${({ theme }) => theme.bodyRgba}, 0.2);
  backdrop-filter: blur(12px);
  border-radius: 18px;
  border: 1px solid rgba(${({ theme }) => theme.mainRgba}, 0.1);
`;

const ErrorMsg = styled.div`
  text-align: center;
  padding: 20px;
  color: #e74c3c;
  background: rgba(231, 76, 60, 0.1);
  border-radius: 12px;
  margin-bottom: 16px;
`;

export default function Feed() {
  const dispatch = useDispatch();
  const currentUser = useSelector(s => s.user?.currentUser);
  const { postsList, isFetching, error } = useSelector(s => s.post);
  const postMod = postsList?.length;

  useEffect(() => {
    if (currentUser?._id) {
      getPosts(dispatch, currentUser._id);
    }
  }, [currentUser?._id]);

  return (
    <FeedWrapper>
      <MakePost />

      {error && <ErrorMsg>Failed to load posts. Pull down to retry.</ErrorMsg>}

      {isFetching && postsList.length === 0 ? (
        <LoadingWrapper>
          <FontAwesomeIcon icon={faCircleNodes} spin />
        </LoadingWrapper>
      ) : postsList.length === 0 ? (
        <EmptyState>
          <p>No posts yet.</p>
          <p style={{ marginTop: '8px', fontSize: '14px' }}>
            Follow people or create your first post!
          </p>
        </EmptyState>
      ) : (
        postsList.map(post => <Post key={post._id} post={post} />)
      )}
    </FeedWrapper>
  );
}
