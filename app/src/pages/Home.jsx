import React from 'react';
import styled from 'styled-components';
import Feed from '../components/Feed';

const HomeWrapper = styled.div`
  display: flex;
  justify-content: center;
  width: 100%;
  padding: 0;
  min-width: 0;
  overflow-x: hidden;
`;

export default function Home() {
  return (
    <HomeWrapper>
      <Feed />
    </HomeWrapper>
  );
}
