import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleNodes, faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import { login } from '../redux/actions';

const PageWrapper = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
`;

const Card = styled(motion.div)`
  background: rgba(${({ theme }) => theme.bodyRgba}, 0.28);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(${({ theme }) => theme.mainRgba}, 0.15);
  border-radius: 24px;
  padding: 40px;
  width: 100%;
  max-width: 420px;
  box-shadow: 0 8px 40px rgba(0,0,0,0.15);
`;

const Title = styled.h1`
  text-align: center;
  font-size: 28px;
  font-weight: 700;
  color: ${({ theme }) => theme.main};
  margin-bottom: 6px;
`;

const Subtitle = styled.p`
  text-align: center;
  font-size: 14px;
  color: ${({ theme }) => theme.text};
  opacity: 0.75;
  margin-bottom: 30px;
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

const InputWrapper = styled.div`
  position: relative;
`;

const Input = styled.input`
  width: 100%;
  padding: 11px 42px 11px 14px;
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
`;

const EyeBtn = styled.button`
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  color: ${({ theme }) => theme.text};
  opacity: 0.6;
  font-size: 14px;
  &:hover { opacity: 1; }
`;

const SubmitBtn = styled.button`
  width: 100%;
  padding: 12px;
  border-radius: 14px;
  border: none;
  background: ${({ theme }) => theme.accent};
  color: ${({ theme }) => theme.body};
  font-family: ${({ theme }) => theme.fontFamily};
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  transition: opacity 0.2s;
  margin-top: 8px;
  &:hover { opacity: 0.88; }
  &:disabled { opacity: 0.55; cursor: not-allowed; }
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

const FooterText = styled.p`
  text-align: center;
  margin-top: 20px;
  font-size: 14px;
  color: ${({ theme }) => theme.text};
  opacity: 0.8;
`;

const StyledLink = styled(Link)`
  color: ${({ theme }) => theme.accent};
  font-weight: 600;
  text-decoration: none;
  &:hover { text-decoration: underline; }
`;

export default function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const isFetching = useSelector(s => s.user?.isFetching);
  const [creds, setCreds] = useState({ username: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleChange = e =>
    setCreds(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!creds.username.trim() || !creds.password) return;
    setError('');
    try {
      await login(dispatch, creds);
      navigate('/');
    } catch (err) {
      const msg = err?.response?.data?.message || err?.response?.data || 'Invalid credentials.';
      setError(typeof msg === 'string' ? msg : 'Login failed. Please try again.');
    }
  };

  return (
    <PageWrapper>
      <Card
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
      >
        <Title>Welcome back</Title>
        <Subtitle>Sign in to The Social Scoop</Subtitle>

        <form onSubmit={handleSubmit}>
          <FormGroup>
            <Label htmlFor="username">Username</Label>
            <InputWrapper>
              <Input
                id="username"
                name="username"
                type="text"
                placeholder="Enter your username"
                value={creds.username}
                onChange={handleChange}
                autoComplete="username"
                autoFocus
              />
            </InputWrapper>
          </FormGroup>

          <FormGroup>
            <Label htmlFor="password">Password</Label>
            <InputWrapper>
              <Input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                value={creds.password}
                onChange={handleChange}
                autoComplete="current-password"
              />
              <EyeBtn
                type="button"
                onClick={() => setShowPassword(v => !v)}
                tabIndex={-1}
              >
                <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
              </EyeBtn>
            </InputWrapper>
          </FormGroup>

          {error && <ErrorMsg>{error}</ErrorMsg>}

          <SubmitBtn type="submit" disabled={isFetching || !creds.username || !creds.password}>
            {isFetching && <FontAwesomeIcon icon={faCircleNodes} spin />}
            {isFetching ? 'Signing in...' : 'Sign In'}
          </SubmitBtn>
        </form>

        <FooterText>
          Don&apos;t have an account?{' '}
          <StyledLink to="/signup">Create one</StyledLink>
        </FooterText>
      </Card>
    </PageWrapper>
  );
}
