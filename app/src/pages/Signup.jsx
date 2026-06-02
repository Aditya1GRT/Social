import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleNodes, faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import { signup } from '../redux/actions';

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
  max-width: 440px;
  box-shadow: 0 8px 40px rgba(0,0,0,0.15);
`;

const Title = styled.h1`
  text-align: center;
  font-size: 26px;
  font-weight: 700;
  color: ${({ theme }) => theme.main};
  margin-bottom: 6px;
`;

const Subtitle = styled.p`
  text-align: center;
  font-size: 14px;
  color: ${({ theme }) => theme.text};
  opacity: 0.75;
  margin-bottom: 28px;
`;

const FormGroup = styled.div`
  margin-bottom: 16px;
`;

const Label = styled.label`
  display: block;
  font-size: 13px;
  font-weight: 600;
  color: ${({ theme }) => theme.main};
  margin-bottom: 5px;
  opacity: 0.85;
`;

const InputWrapper = styled.div`
  position: relative;
`;

const Input = styled.input`
  width: 100%;
  padding: 10px 42px 10px 14px;
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

const INIT = { username: '', name: '', email: '', password: '' };

export default function Signup() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const isFetching = useSelector(s => s.user?.isFetching);
  const [fields, setFields] = useState(INIT);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleChange = e =>
    setFields(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const isValid = fields.username.trim() && fields.name.trim() &&
    fields.email.trim() && fields.password;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isValid) return;
    setError('');
    try {
      await signup(dispatch, fields);
      navigate('/');
    } catch (err) {
      const msg = err?.response?.data?.message || err?.response?.data || 'Signup failed.';
      setError(typeof msg === 'string' ? msg : 'Signup failed. Please try again.');
    }
  };

  const fieldDefs = [
    { name: 'username', label: 'Username', type: 'text', placeholder: 'Choose a username', autoComplete: 'username' },
    { name: 'name', label: 'Full Name', type: 'text', placeholder: 'Your display name', autoComplete: 'name' },
    { name: 'email', label: 'Email', type: 'email', placeholder: 'your@email.com', autoComplete: 'email' },
    { name: 'password', label: 'Password', type: showPassword ? 'text' : 'password', placeholder: 'Choose a password', autoComplete: 'new-password', hasEye: true },
  ];

  return (
    <PageWrapper>
      <Card
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
      >
        <Title>Join the Scoop</Title>
        <Subtitle>Create your account today</Subtitle>

        <form onSubmit={handleSubmit}>
          {fieldDefs.map(({ name, label, type, placeholder, autoComplete, hasEye }) => (
            <FormGroup key={name}>
              <Label htmlFor={name}>{label}</Label>
              <InputWrapper>
                <Input
                  id={name}
                  name={name}
                  type={type}
                  placeholder={placeholder}
                  value={fields[name]}
                  onChange={handleChange}
                  autoComplete={autoComplete}
                  autoFocus={name === 'username'}
                />
                {hasEye && (
                  <EyeBtn
                    type="button"
                    onClick={() => setShowPassword(v => !v)}
                    tabIndex={-1}
                  >
                    <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
                  </EyeBtn>
                )}
              </InputWrapper>
            </FormGroup>
          ))}

          {error && <ErrorMsg>{error}</ErrorMsg>}

          <SubmitBtn type="submit" disabled={isFetching || !isValid}>
            {isFetching && <FontAwesomeIcon icon={faCircleNodes} spin />}
            {isFetching ? 'Creating account...' : 'Create Account'}
          </SubmitBtn>
        </form>

        <FooterText>
          Already have an account?{' '}
          <StyledLink to="/login">Sign in</StyledLink>
        </FooterText>
      </Card>
    </PageWrapper>
  );
}
