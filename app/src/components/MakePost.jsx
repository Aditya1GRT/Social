import React, { useState, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import styled from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCircleNodes,
  faImage,
  faVideo,
  faTimes,
  faFaceSmile,
} from '@fortawesome/free-solid-svg-icons';
import { createPost, uploadFile } from '../redux/actions';
import EmojiPicker from './EmojiPicker';

const Card = styled.div`
  background: rgba(${({ theme }) => theme.bodyRgba}, 0.25);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(${({ theme }) => theme.mainRgba}, 0.12);
  border-radius: 18px;
  padding: 18px;
  margin-bottom: 20px;
  box-shadow: 0 4px 24px rgba(0,0,0,0.1);
  position: relative;
  z-index: 2;
  width: 100%;
  min-width: 0;

  @media (max-width: 480px) {
    padding: 14px;
    border-radius: 14px;
  }
`;

const Header = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 12px;
`;

const Avatar = styled.div`
  width: 42px;
  height: 42px;
  border-radius: 50%;
  background: ${({ theme }) => theme.accent};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
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

const TextArea = styled.textarea`
  flex: 1;
  min-width: 0;
  padding: 10px 14px;
  border-radius: 14px;
  border: 1px solid rgba(${({ theme }) => theme.mainRgba}, 0.2);
  background: rgba(${({ theme }) => theme.bodyRgba}, 0.3);
  color: ${({ theme }) => theme.main};
  font-family: ${({ theme }) => theme.fontFamily};
  font-size: 15px;
  resize: vertical;
  min-height: 80px;
  outline: none;
  transition: border-color 0.2s;
  line-height: 1.5;
  width: 100%;
  &::placeholder { color: ${({ theme }) => theme.text}; opacity: 0.6; }
  &:focus { border-color: ${({ theme }) => theme.accent}; }

  @media (max-width: 480px) {
    font-size: 14px;
    min-height: 70px;
  }
`;

const Footer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 12px;
  flex-wrap: wrap;
  gap: 10px;

  @media (max-width: 480px) {
    gap: 8px;
  }
`;

const MediaActions = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
  flex-wrap: wrap;

  @media (max-width: 480px) {
    gap: 6px;
  }
`;

const MediaBtn = styled.label`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 7px 14px;
  min-height: 44px;
  border-radius: 20px;
  border: 1px solid rgba(${({ theme }) => theme.mainRgba}, 0.2);
  background: rgba(${({ theme }) => theme.bodyRgba}, 0.3);
  color: ${({ theme }) => theme.text};
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
  font-family: ${({ theme }) => theme.fontFamily};
  white-space: nowrap;
  &:hover {
    border-color: ${({ theme }) => theme.accent};
    color: ${({ theme }) => theme.accent};
  }

  @media (max-width: 480px) {
    font-size: 12px;
    padding: 7px 10px;
  }
`;

const HiddenInput = styled.input`
  display: none;
`;

const PreviewWrapper = styled.div`
  position: relative;
  margin-top: 10px;
`;

const PreviewImg = styled.img`
  max-width: 100%;
  max-height: 250px;
  border-radius: 12px;
  object-fit: cover;
`;

const PreviewVideo = styled.video`
  max-width: 100%;
  max-height: 250px;
  border-radius: 12px;
`;

const RemoveMediaBtn = styled.button`
  position: absolute;
  top: 6px;
  right: 6px;
  background: rgba(0,0,0,0.6);
  border: none;
  border-radius: 50%;
  width: 26px;
  height: 26px;
  cursor: pointer;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
`;

const SubmitBtn = styled.button`
  padding: 8px 22px;
  min-height: 44px;
  border-radius: 20px;
  border: none;
  background: ${({ theme }) => theme.accent};
  color: ${({ theme }) => theme.body};
  font-family: ${({ theme }) => theme.fontFamily};
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: opacity 0.2s;
  white-space: nowrap;
  flex-shrink: 0;
  &:hover { opacity: 0.88; }
  &:disabled { opacity: 0.55; cursor: not-allowed; }
`;

const EmojiToggleBtn = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 7px 14px;
  min-height: 44px;
  border-radius: 20px;
  border: 1px solid rgba(${({ theme }) => theme.mainRgba}, 0.2);
  background: rgba(${({ theme }) => theme.bodyRgba}, 0.3);
  color: ${({ theme }) => theme.text};
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
  font-family: ${({ theme }) => theme.fontFamily};
  white-space: nowrap;
  &:hover {
    border-color: ${({ theme }) => theme.accent};
    color: ${({ theme }) => theme.accent};
  }

  @media (max-width: 480px) {
    font-size: 12px;
    padding: 7px 10px;
  }
`;

const ErrorMsg = styled.p`
  color: #e74c3c;
  font-size: 13px;
  margin-top: 8px;
`;

export default function MakePost() {
  const dispatch = useDispatch();
  const currentUser = useSelector(s => s.user?.currentUser);
  const isFetching = useSelector(s => s.post?.isFetching);
  const [text, setText] = useState('');
  const [showEmoji, setShowEmoji] = useState(false);
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [mediaType, setMediaType] = useState('');
  const [error, setError] = useState('');
  const imgRef = useRef();
  const vidRef = useRef();

  const handleFileChange = (e, type) => {
    const f = e.target.files[0];
    if (!f) return;
    setFile(f);
    setMediaType(type);
    setPreviewUrl(URL.createObjectURL(f));
  };

  const removeMedia = () => {
    setFile(null);
    setPreviewUrl('');
    setMediaType('');
    if (imgRef.current) imgRef.current.value = '';
    if (vidRef.current) vidRef.current.value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim() && !file) return;
    setError('');
    try {
      let mediaUrl = '';
      let mType = '';
      if (file) {
        mediaUrl = await uploadFile(file);
        mType = mediaType;
      }
      await createPost(dispatch, {
        userId: currentUser._id,
        description: text.trim(),
        postMedia: mediaUrl,
        mediaType: mType,
      });
      setText('');
      removeMedia();
    } catch (err) {
      console.error(err);
      setError('Failed to create post. Please try again.');
    }
  };

  if (!currentUser) return null;

  const initial = (currentUser.name || currentUser.username || 'U')[0].toUpperCase();

  return (
    <Card>
      <form onSubmit={handleSubmit}>
        <Header>
          <Avatar>
            {currentUser.profilePicture ? (
              <AvatarImg src={currentUser.profilePicture} alt={currentUser.name} />
            ) : (
              initial
            )}
          </Avatar>
          <TextArea
            placeholder={`What's on your mind, ${currentUser.name || currentUser.username}?`}
            value={text}
            onChange={e => setText(e.target.value)}
          />
        </Header>

        {previewUrl && (
          <PreviewWrapper>
            {mediaType === 'video' ? (
              <PreviewVideo src={previewUrl} controls />
            ) : (
              <PreviewImg src={previewUrl} alt="preview" />
            )}
            <RemoveMediaBtn type="button" onClick={removeMedia}>
              <FontAwesomeIcon icon={faTimes} />
            </RemoveMediaBtn>
          </PreviewWrapper>
        )}

        {error && <ErrorMsg>{error}</ErrorMsg>}

        <Footer>
          <MediaActions>
            <div style={{ position: 'relative' }}>
              <EmojiToggleBtn type="button" onClick={() => setShowEmoji(v => !v)}>
                <FontAwesomeIcon icon={faFaceSmile} />
                Emoji
              </EmojiToggleBtn>
              {showEmoji && (
                <EmojiPicker
                  direction="down"
                  onSelect={emoji => { setText(t => t + emoji); setShowEmoji(false); }}
                  onClose={() => setShowEmoji(false)}
                />
              )}
            </div>
            <MediaBtn>
              <FontAwesomeIcon icon={faImage} />
              Photo
              <HiddenInput
                ref={imgRef}
                type="file"
                accept="image/*"
                onChange={e => handleFileChange(e, 'image')}
              />
            </MediaBtn>
            <MediaBtn>
              <FontAwesomeIcon icon={faVideo} />
              Video
              <HiddenInput
                ref={vidRef}
                type="file"
                accept="video/*"
                onChange={e => handleFileChange(e, 'video')}
              />
            </MediaBtn>
          </MediaActions>
          <SubmitBtn type="submit" disabled={isFetching || (!text.trim() && !file)}>
            {isFetching ? (
              <FontAwesomeIcon icon={faCircleNodes} spin />
            ) : null}
            Post
          </SubmitBtn>
        </Footer>
      </form>
    </Card>
  );
}
