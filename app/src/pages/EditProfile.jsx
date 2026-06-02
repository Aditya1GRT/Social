import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleNodes, faCamera, faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { loginSuccess } from '../redux/slices/userSlice';
import { updateUser, uploadFile } from '../redux/actions';

const PageWrapper = styled.div`
  padding: 24px 20px;
  max-width: 600px;
  margin: 0 auto;
  width: 100%;

  @media (max-width: 480px) {
    padding: 16px;
  }
`;

const BackBtn = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  background: none;
  border: none;
  color: ${({ theme }) => theme.text};
  font-family: ${({ theme }) => theme.fontFamily};
  font-size: 14px;
  cursor: pointer;
  padding: 8px 0;
  min-height: 44px;
  margin-bottom: 16px;
  opacity: 0.75;
  transition: opacity 0.2s;
  &:hover { opacity: 1; }
`;

const Card = styled(motion.div)`
  background: rgba(${({ theme }) => theme.bodyRgba}, 0.28);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(${({ theme }) => theme.mainRgba}, 0.12);
  border-radius: 24px;
  padding: 32px;
  box-shadow: 0 4px 24px rgba(0,0,0,0.1);

  @media (max-width: 480px) {
    padding: 20px 16px;
    border-radius: 18px;
  }
`;

const Title = styled.h2`
  font-size: 22px;
  font-weight: 700;
  color: ${({ theme }) => theme.main};
  margin-bottom: 24px;
`;

const AvatarSection = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 28px;
  gap: 12px;
`;

const AvatarWrapper = styled.label`
  position: relative;
  cursor: pointer;
  width: 100px;
  height: 100px;
  border-radius: 50%;
  overflow: hidden;
  border: 3px solid ${({ theme }) => theme.accent};
  display: block;
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
  font-size: 36px;
  font-weight: 700;
`;

const AvatarOverlay = styled.div`
  position: absolute;
  inset: 0;
  background: rgba(0,0,0,0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  opacity: 0;
  transition: opacity 0.2s;
  font-size: 20px;
  ${AvatarWrapper}:hover & { opacity: 1; }
`;

const HiddenInput = styled.input`
  display: none;
`;

const UploadHint = styled.p`
  font-size: 12px;
  color: ${({ theme }) => theme.text};
  opacity: 0.6;
`;

const FormGroup = styled.div`
  margin-bottom: 18px;
`;

const Label = styled.label`
  display: block;
  font-size: 13px;
  font-weight: 600;
  color: ${({ theme }) => theme.main};
  margin-bottom: 6px;
  opacity: 0.85;
`;

const Input = styled.input`
  width: 100%;
  padding: 11px 14px;
  min-height: 44px;
  border-radius: 12px;
  border: 1px solid rgba(${({ theme }) => theme.mainRgba}, 0.2);
  background: rgba(${({ theme }) => theme.bodyRgba}, 0.35);
  color: ${({ theme }) => theme.main};
  font-family: ${({ theme }) => theme.fontFamily};
  font-size: 15px;
  outline: none;
  transition: border-color 0.2s;
  &::placeholder { color: ${({ theme }) => theme.text}; opacity: 0.55; }
  &:focus { border-color: ${({ theme }) => theme.accent}; }

  @media (max-width: 480px) {
    font-size: 14px;
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 11px 14px;
  border-radius: 12px;
  border: 1px solid rgba(${({ theme }) => theme.mainRgba}, 0.2);
  background: rgba(${({ theme }) => theme.bodyRgba}, 0.35);
  color: ${({ theme }) => theme.main};
  font-family: ${({ theme }) => theme.fontFamily};
  font-size: 15px;
  outline: none;
  resize: vertical;
  min-height: 90px;
  transition: border-color 0.2s;
  &::placeholder { color: ${({ theme }) => theme.text}; opacity: 0.55; }
  &:focus { border-color: ${({ theme }) => theme.accent}; }

  @media (max-width: 480px) {
    font-size: 14px;
  }
`;

const BtnRow = styled.div`
  display: flex;
  gap: 12px;
  margin-top: 8px;
  flex-wrap: wrap;
`;

const SaveBtn = styled.button`
  flex: 1;
  min-width: 120px;
  padding: 12px;
  min-height: 44px;
  border-radius: 14px;
  border: none;
  background: ${({ theme }) => theme.accent};
  color: ${({ theme }) => theme.body};
  font-family: ${({ theme }) => theme.fontFamily};
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: opacity 0.2s;
  &:hover { opacity: 0.88; }
  &:disabled { opacity: 0.55; cursor: not-allowed; }
`;

const CancelBtn = styled.button`
  padding: 12px 22px;
  min-height: 44px;
  border-radius: 14px;
  border: 1px solid rgba(${({ theme }) => theme.mainRgba}, 0.2);
  background: rgba(${({ theme }) => theme.bodyRgba}, 0.3);
  color: ${({ theme }) => theme.main};
  font-family: ${({ theme }) => theme.fontFamily};
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  &:hover { border-color: ${({ theme }) => theme.accent}; }
`;

const ErrorMsg = styled.p`
  color: #e74c3c;
  font-size: 13px;
  margin-top: 10px;
  text-align: center;
  padding: 10px;
  background: rgba(231, 76, 60, 0.1);
  border-radius: 10px;
`;

const SuccessMsg = styled.p`
  color: #27ae60;
  font-size: 13px;
  margin-top: 10px;
  text-align: center;
  padding: 10px;
  background: rgba(39, 174, 96, 0.1);
  border-radius: 10px;
`;

export default function EditProfile() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const currentUser = useSelector(s => s.user?.currentUser);

  const [fields, setFields] = useState({
    name: currentUser?.name || '',
    bio: currentUser?.bio || '',
    profilePicture: currentUser?.profilePicture || '',
  });
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(currentUser?.profilePicture || '');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const fileRef = useRef();

  const handleChange = e =>
    setFields(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleAvatarChange = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    setAvatarFile(f);
    setAvatarPreview(URL.createObjectURL(f));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!currentUser) return;
    setError('');
    setSuccess('');
    setIsSaving(true);
    try {
      let picUrl = fields.profilePicture;
      if (avatarFile) {
        picUrl = await uploadFile(avatarFile);
      }
      const updated = await updateUser(currentUser._id, {
        name: fields.name.trim(),
        bio: fields.bio.trim(),
        profilePicture: picUrl,
      });
      dispatch(loginSuccess({ ...currentUser, ...updated }));
      setSuccess('Profile updated successfully!');
      setTimeout(() => navigate(`/user/${currentUser.username}`), 1200);
    } catch (err) {
      console.error(err);
      setError('Failed to update profile. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  if (!currentUser) return null;

  const initial = (currentUser.name || currentUser.username || 'U')[0].toUpperCase();

  return (
    <PageWrapper>
      <BackBtn onClick={() => navigate(-1)}>
        <FontAwesomeIcon icon={faArrowLeft} />
        Back
      </BackBtn>

      <Card
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Title>Edit Profile</Title>

        <form onSubmit={handleSave}>
          <AvatarSection>
            <AvatarWrapper htmlFor="avatar-upload">
              {avatarPreview ? (
                <AvatarImg src={avatarPreview} alt="avatar" />
              ) : (
                <AvatarPlaceholder>{initial}</AvatarPlaceholder>
              )}
              <AvatarOverlay>
                <FontAwesomeIcon icon={faCamera} />
              </AvatarOverlay>
              <HiddenInput
                ref={fileRef}
                id="avatar-upload"
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
              />
            </AvatarWrapper>
            <UploadHint>Click to change photo</UploadHint>
          </AvatarSection>

          <FormGroup>
            <Label htmlFor="name">Display Name</Label>
            <Input
              id="name"
              name="name"
              type="text"
              placeholder="Your display name"
              value={fields.name}
              onChange={handleChange}
            />
          </FormGroup>

          <FormGroup>
            <Label htmlFor="bio">Bio</Label>
            <TextArea
              id="bio"
              name="bio"
              placeholder="Tell people about yourself..."
              value={fields.bio}
              onChange={handleChange}
            />
          </FormGroup>

          {error && <ErrorMsg>{error}</ErrorMsg>}
          {success && <SuccessMsg>{success}</SuccessMsg>}

          <BtnRow>
            <CancelBtn type="button" onClick={() => navigate(-1)}>
              Cancel
            </CancelBtn>
            <SaveBtn type="submit" disabled={isSaving}>
              {isSaving && <FontAwesomeIcon icon={faCircleNodes} spin />}
              {isSaving ? 'Saving...' : 'Save Changes'}
            </SaveBtn>
          </BtnRow>
        </form>
      </Card>
    </PageWrapper>
  );
}
