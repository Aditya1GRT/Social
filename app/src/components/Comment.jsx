import React from 'react';
import styled from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash } from '@fortawesome/free-solid-svg-icons';

const CommentRow = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 8px 0;
  border-bottom: 1px solid rgba(${({ theme }) => theme.mainRgba}, 0.07);

  &:last-child { border-bottom: none; }
`;

const Avatar = styled.div`
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: ${({ theme }) => theme.accent};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 700;
  color: ${({ theme }) => theme.body};
  flex-shrink: 0;
  overflow: hidden;
`;

const AvatarImg = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const CommentBody = styled.div`
  flex: 1;
`;

const Username = styled.span`
  font-weight: 600;
  color: ${({ theme }) => theme.main};
  font-size: 13px;
  margin-right: 6px;
`;

const CommentText = styled.span`
  font-size: 13px;
  color: ${({ theme }) => theme.text};
  line-height: 1.4;
`;

const DeleteBtn = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  color: ${({ theme }) => theme.text};
  opacity: 0.5;
  font-size: 11px;
  padding: 4px;
  flex-shrink: 0;
  transition: opacity 0.2s, color 0.2s;

  &:hover {
    opacity: 1;
    color: #e74c3c;
  }
`;

export default function Comment({ comment, currentUserId, onDelete }) {
  const initial = (comment.username || 'U')[0].toUpperCase();
  const isOwn = comment.userId === currentUserId;

  return (
    <CommentRow>
      <Avatar>
        {comment.profilePicture ? (
          <AvatarImg src={comment.profilePicture} alt={comment.username} />
        ) : (
          initial
        )}
      </Avatar>
      <CommentBody>
        <Username>{comment.username || 'User'}</Username>
        <CommentText>{comment.comment}</CommentText>
      </CommentBody>
      {isOwn && onDelete && (
        <DeleteBtn onClick={() => onDelete(comment._id)} title="Delete comment">
          <FontAwesomeIcon icon={faTrash} />
        </DeleteBtn>
      )}
    </CommentRow>
  );
}
