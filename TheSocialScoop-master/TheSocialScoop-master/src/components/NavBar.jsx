import {
  faGear,
  faHome,
  faMessage,
  faSearch,
  faUsers,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { motion } from "framer-motion";
import React from "react";
import { Link, useLocation } from "react-router-dom";
import styled from "styled-components";
const MainContainer = styled(motion.div)`
  box-shadow: 20px 20px 50px rgba(0, 0, 0, 0.5);
  border-top: 1px solid rgba(255, 255, 255, 0.5);
  border-left: 1px solid rgba(255, 255, 255, 0.5);
  z-index: 1;
  background: ${(props) =>
    props.themeCurrent === "dark"
      ? `rgba(${props.theme.bodyRgba},.7)`
      : `rgba(${props.theme.bodyRgba},.4)`};
  height: 90%;
  width: 70px;
  padding: 30px 30px;
  border-radius: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-around;
  flex-shrink: 0;
  margin-left: 40px;

  @media (max-width: 1000px) {
    height: 45px;
    width: calc(100% - 80px);
    padding: 30px 0px;
    flex-direction: row;
    margin: 30px 40px 0;
  }

  @media (max-width: 650px) {
    height: 20px;
    padding: 30px 0px;
  }
  @media (max-width: 475px) {
    width: calc(100% - 30px);
    margin: 20px 15px 0;
  }
`;
const IconContainer = styled(Link)`
  width: 55%;
  height: calc(120px * 0.55);
  position: relative;
  margin: 5px 0;
  color: ${(props) => `rgba(${props.theme.mainRgba},0.6)`};
  &:hover {
    color: ${(props) => `rgba(${props.theme.mainRgba},1)`};
  }

  .navIcon {
    width: 100%;
    height: 100%;
  }

  .active {
    color: ${(props) => props.theme.accent};
  }

  @media (max-width: 1000px) {
    height: 4%;
    height: calc(120px * 0.4);
  }
  @media (max-width: 770px) {
    height: 35%;
    height: calc(120px * 0.35);
  }
  @media (max-width: 600px) {
    width: 20%;
    height: calc(120px * 0.2);
  }
`;

const NavBar = ({ themeCurrent }) => {
  const { pathname } = useLocation();
  return (
    <MainContainer
      themeCurrent={themeCurrent}
      initial={{ x: -50, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ type: "spring", duration: 1.2, delay: 0.2 }}
    >
      <IconContainer to="/">
        <FontAwesomeIcon
          className={`navIcon ${pathname === "/" ? "active" : ""}`}
          icon={faHome}
        />
      </IconContainer>
      <IconContainer to="/search">
        <FontAwesomeIcon
          className={`navIcon ${pathname === "/search" ? "active" : ""}`}
          icon={faSearch}
        />
      </IconContainer>
      <IconContainer to="/friendRequests">
        <FontAwesomeIcon
          className={`navIcon ${
            pathname === "/friendRequests" ? "active" : ""
          }`}
          icon={faUsers}
        />
      </IconContainer>
      <IconContainer to="/messages">
        <FontAwesomeIcon
          className={`navIcon ${pathname === "/messages" ? "active" : ""}`}
          icon={faMessage}
        />
      </IconContainer>
      <IconContainer to="/settings">
        <FontAwesomeIcon
          className={`navIcon ${pathname === "/settings" ? "active" : ""}`}
          icon={faGear}
        />
      </IconContainer>
    </MainContainer>
  );
};

export default NavBar;
