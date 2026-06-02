import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faHeart as faHeartSolid,
  faTrash,
  faComment,
  faPaperPlane,
  faCircleNodes,
  faFaceSmile,
} from '@fortawesome/free-solid-svg-icons';
import { faHeart as faHeartRegular } from '@fortawesome/free-regular-svg-icons';
import { reactPost, deletePost, addComment, deleteComment } from '../redux/actions';
import Comment from './Comment';
import EmojiPicker from './EmojiPicker';

const Card = styled(motion.div)`
  background: rgba(${({ theme }) => theme.bodyRgba}, 0.25);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(${({ theme }) => theme.mainRgba}, 0.12);
  border-radius: 18px;
  overflow: hidden;
  margin-bottom: 20px;
  box-shadow: 0 4px 24px rgba(0,0,0,0.1);
  width: 100%;
  min-width: 0;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  padding: 14px 16px;
  gap: 12px;
`;

const AvatarLink = styled(Link)`
  display: block;
  width: 42px;
  height: 42px;
  border-radius: 50%;
  overflow: hidden;
  flex-shrink: 0;
  border: 2px solid ${({ theme }) => theme.accent};
  text-decoration: none;
`;

const AvatarImg = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const AvatarPlaceholder = styled.div`
  width: 100%;
  height: 100%;
  background: ${({ theme }) => theme.accent};
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({ theme }) => theme.body};
  font-weight: 700;
  font-size: 16px;
`;

const UserInfo = styled.div`
  flex: 1;
`;

const NameLink = styled(Link)`
  display: block;
  font-weight: 700;
  font-size: 15px;
  color: ${({ theme }) => theme.main};
  text-decoration: none;
  &:hover { text-decoration: underline; }
`;

const Username = styled.span`
  font-size: 12px;
  color: ${({ theme }) => theme.text};
  opacity: 0.9;
`;

const Time = styled.span`
  font-size: 11px;
  color: ${({ theme }) => theme.text};
  opacity: 0.75;
`;

const DeleteBtn = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  color: ${({ theme }) => theme.text};
  opacity: 0.5;
  font-size: 14px;
  padding: 6px;
  min-width: 44px;
  min-height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  flex-shrink: 0;
  &:hover { opacity: 1; color: #e74c3c; }
`;

const PostText = styled.p`
  padding: 0 16px 14px;
  font-size: 15px;
  color: ${({ theme }) => theme.text};
  line-height: 1.5;
  white-space: pre-wrap;
  word-break: break-word;
  overflow-wrap: break-word;

  @media (max-width: 480px) {
    font-size: 14px;
  }
`;

const MediaWrapper = styled.div`
  width: 100%;
  max-height: 480px;
  overflow: hidden;

  @media (max-width: 480px) {
    max-height: 320px;
  }
`;

const PostImage = styled.img`
  width: 100%;
  height: 100%;
  max-width: 100%;
  object-fit: cover;
  display: block;
`;

const PostVideo = styled.video`
  width: 100%;
  max-width: 100%;
  max-height: 480px;
  display: block;

  @media (max-width: 480px) {
    max-height: 320px;
  }
`;

const Actions = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 10px 16px;
  border-top: 1px solid rgba(${({ theme }) => theme.mainRgba}, 0.08);
  flex-wrap: wrap;

  @media (max-width: 480px) {
    padding: 8px 12px;
  }
`;

const ActionBtn = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 7px 12px;
  min-height: 44px;
  border-radius: 20px;
  border: none;
  background: none;
  cursor: pointer;
  color: ${({ theme }) => theme.text};
  font-family: ${({ theme }) => theme.fontFamily};
  font-size: 14px;
  transition: all 0.2s;
  font-weight: 500;

  &:hover {
    background: rgba(${({ theme }) => theme.mainRgba}, 0.08);
  }

  &.liked { color: #e74c3c; }

  @media (max-width: 480px) {
    padding: 7px 10px;
    font-size: 13px;
  }
`;

const CommentSection = styled(motion.div)`
  padding: 12px 16px;
  border-top: 1px solid rgba(${({ theme }) => theme.mainRgba}, 0.08);
  overflow: hidden;

  @media (max-width: 480px) {
    padding: 10px 12px;
  }
`;

const CommentList = styled.div`
  max-height: 200px;
  overflow-y: auto;
  margin-bottom: 10px;
`;

const CommentInputRow = styled.form`
  display: flex;
  gap: 8px;
  align-items: center;
  flex-wrap: nowrap;
  min-width: 0;
`;

const CommentInput = styled.input`
  flex: 1;
  min-width: 0;
  padding: 8px 14px;
  border-radius: 20px;
  border: 1px solid rgba(${({ theme }) => theme.mainRgba}, 0.2);
  background: rgba(${({ theme }) => theme.bodyRgba}, 0.3);
  color: ${({ theme }) => theme.main};
  font-family: ${({ theme }) => theme.fontFamily};
  font-size: 14px;
  outline: none;
  transition: border-color 0.2s;
  &::placeholder { color: ${({ theme }) => theme.text}; opacity: 0.6; }
  &:focus { border-color: ${({ theme }) => theme.accent}; }
`;

const SendBtn = styled.button`
  background: ${({ theme }) => theme.accent};
  border: none;
  border-radius: 50%;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: ${({ theme }) => theme.body};
  flex-shrink: 0;
  transition: opacity 0.2s;
  &:hover { opacity: 0.85; }
  &:disabled { opacity: 0.5; cursor: not-allowed; }

  @media (max-width: 480px) {
    width: 44px;
    height: 44px;
  }
`;

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString();
}

export default function Post({ post }) {
  const dispatch = useDispatch();
  const currentUser = useSelector(s => s.user?.currentUser);
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [showCommentEmoji, setShowCommentEmoji] = useState(false);
  const [comments, setComments] = useState(post.comments || []);
  const [likes, setLikes] = useState(post.likes || []);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const userId = currentUser?._id;
  const liked = likes.includes(userId);
  const likeCount = likes.length;
  const isOwn = post.userId === userId;

  const handleLike = () => {
    if (!userId) return;
    const nowLiked = !liked;
    setLikes(nowLiked ? [...likes, userId] : likes.filter(id => id !== userId));
    reactPost(dispatch, post, userId).catch(() => {
      setLikes(liked ? [...likes, userId] : likes.filter(id => id !== userId));
    });
  };

  const handleDelete = () => {
    if (!userId) return;
    if (window.confirm('Delete this post?')) {
      deletePost(dispatch, post._id, userId);
    }
  };

  const handleComment = async (e) => {
    e.preventDefault();
    const text = commentText.trim();
    if (!text || !userId || isSubmitting) return;
    setIsSubmitting(true);
    const tempId = 'temp_' + Date.now();
    const tempComment = { _id: tempId, userId, comment: text, username: currentUser.username };
    setComments(prev => [...prev, tempComment]);
    setCommentText('');
    try {
      await addComment(post._id, { userId, comment: text, username: currentUser.username });
    } catch (err) {
      setComments(prev => prev.filter(c => c._id !== tempId));
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    setComments(prev => prev.filter(c => c._id !== commentId));
    try {
      await deleteComment(post._id, commentId);
    } catch (err) {
      console.error(err);
    }
  };

  const displayName = post.name || post.username || 'User';
  const displayUsername = post.username || '';
  const avatarSrc = post.profilePicture;
  const initial = displayName[0]?.toUpperCase() || 'U';

  return (
    <Card
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Header>
        <AvatarLink to={`/user/${displayUsername}`}>
          {avatarSrc ? (
            <AvatarImg src={avatarSrc} alt={displayName} />
          ) : (
            <AvatarPlaceholder>{initial}</AvatarPlaceholder>
          )}
        </AvatarLink>
        <UserInfo>
          <NameLink to={`/user/${displayUsername}`}>{displayName}</NameLink>
          <Username>@{displayUsername}</Username>
          {post.createdAt && <><br /><Time>{timeAgo(post.createdAt)}</Time></>}
        </UserInfo>
        {isOwn && (
          <DeleteBtn onClick={handleDelete} title="Delete post">
            <FontAwesomeIcon icon={faTrash} />
          </DeleteBtn>
        )}
      </Header>

      {post.description && <PostText>{post.description}</PostText>}

      {post.postMedia && post.postMedia !== 'null' && post.postMedia !== '' && (
        <MediaWrapper>
          {post.mediaType === 'video' ? (
            <PostVideo controls src={post.postMedia}>
              Your browser does not support the video tag.
            </PostVideo>
          ) : (
            <PostImage src={post.postMedia} alt="post media" />
          )}
        </MediaWrapper>
      )}

      <Actions>
        <ActionBtn
          onClick={handleLike}
          className={liked ? 'liked' : ''}
          title={liked ? 'Unlike' : 'Like'}
        >
          <motion.span
            key={liked ? 'liked' : 'unliked'}
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 400 }}
          >
            <FontAwesomeIcon icon={liked ? faHeartSolid : faHeartRegular} />
          </motion.span>
          {likeCount > 0 && <span>{likeCount}</span>}
        </ActionBtn>

        <ActionBtn onClick={() => setShowComments(v => !v)} title="Comments">
          <FontAwesomeIcon icon={faComment} />
          {comments.length > 0 && <span>{comments.length}</span>}
        </ActionBtn>
      </Actions>

      <AnimatePresence>
        {showComments && (
          <CommentSection
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
          >
            {comments.length > 0 && (
              <CommentList>
                {comments.map((c, i) => (
                  <Comment
                    key={c._id || i}
                    comment={c}
                    currentUserId={userId}
                    onDelete={handleDeleteComment}
                  />
                ))}
              </CommentList>
            )}
            {currentUser && (
              <CommentInputRow onSubmit={handleComment}>
                <CommentInput
                  type="text"
                  placeholder="Write a comment..."
                  value={commentText}
                  onChange={e => setCommentText(e.target.value)}
                />
                <div style={{ position: 'relative', flexShrink: 0 }}>
                  <button
                    type="button"
                    onClick={() => setShowCommentEmoji(v => !v)}
                    style={{
                      background: 'none', border: 'none', cursor: 'pointer',
                      fontSize: '18px', padding: '4px', opacity: 0.6,
                      color: 'inherit',
                    }}
                  >
                    😊
                  </button>
                  {showCommentEmoji && (
                    <EmojiPicker
                      align="right"
                      onSelect={emoji => { setCommentText(t => t + emoji); setShowCommentEmoji(false); }}
                      onClose={() => setShowCommentEmoji(false)}
                    />
                  )}
                </div>
                <SendBtn type="submit" disabled={isSubmitting || !commentText.trim()}>
                  {isSubmitting ? (
                    <FontAwesomeIcon icon={faCircleNodes} spin />
                  ) : (
                    <FontAwesomeIcon icon={faPaperPlane} />
                  )}
                </SendBtn>
              </CommentInputRow>
            )}
          </CommentSection>
        )}
      </AnimatePresence>
    </Card>
  );
}
