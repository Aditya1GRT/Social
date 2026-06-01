import { motion } from "framer-motion";
import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import styled from "styled-components";
import Users from "../components/FindUsers/Users";
import NavBar from "../components/NavBar";
// import Sidebar from "../components/Sidebar";
import { publicRequest } from "../requestMethods";

const SearchContainer = styled(motion.div)`
  background: ${(props) =>
    props.themeCurrent === "dark"
      ? `rgba(${props.theme.bodyRgba},.85)`
      : `rgba(${props.theme.bodyRgba},.6)`};
  box-shadow: 20px 20px 50px rgba(0, 0, 0, 0.5);
  border-top: 1px solid rgba(255, 255, 255, 0.5);
  border-left: 1px solid rgba(255, 255, 255, 0.5);
  height: 90%;
  width: 90%;
  padding: 30px 50px;
  margin: 0 40px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  border-radius: 30px;
  overflow-x: hidden;

  @media (max-width: 1300px) {
    padding: 30px;
  }
  @media (max-width: 1000px) {
    margin-left: 0;
    padding: 20px;
    margin: 0 40px;
    width: calc(100% - 120px);
    margin-bottom: 20px;
    overflow-y: scroll;
  }
  @media (max-width: 475px) {
    width: calc(100% - 70px);
    margin: 0px 15px;
  }
`;
const Query = styled.h2`
  width: 100%;
  text-align: left;
  color: ${(props) => props.theme.accent};
  font-size: 20px;
  @media (max-width: 1000px) {
    margin-top: 80px;
    font-size: 15px;
  }
`;
const Results = styled.div`
  width: 100%;
  overflow-y: scroll;
  padding: 10px;

  h2 {
    margin: 200px 310px;
    text-align: center;
  }

  @media (max-width: 1000px) {
    margin-top: 30px;

    h2 {
      margin: 0;
      font-size: 15px;
    }
  }
`;

const Search = ({ themeCurrent, name, userId }) => {
  const query = useLocation().pathname.split("/")[2];
  const [users, setUsers] = useState({});
  useEffect(() => {
    const showResults = async () => {
      if (!query) return setUsers({});
      const { data } = await publicRequest.get(`users/${query}`);
      console.log("data", data);
      setUsers(data);
    };
    showResults();
  }, [query]);

  return (
    <>
      <NavBar themeCurrent={themeCurrent} />
      <SearchContainer
        themeCurrent={themeCurrent}
        initial={{ x: 100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ type: "spring", duration: 1.2, delay: 0.2 }}
      >
        <Query>
          {query
            ? `Showing Results for: ${query}`
            : `Hey! ${name} feeling alone? Find some friends now!`}
        </Query>
        <Results>
          {Object.keys(users).length ? (
            Object.keys(users)
              .filter((key) => users[key]._id !== userId)
              .map((key) => <Users key={key} user={users[key]} />)
          ) : query ? (
            <h2>Hey, {name}! Sorry, but no result found for your search.</h2>
          ) : (
            ""
          )}
        </Results>
      </SearchContainer>
      {/* <Sidebar /> */}
    </>
  );
};

export default Search;
